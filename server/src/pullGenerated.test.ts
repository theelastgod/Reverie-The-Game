// A rehearsal of scripts/pull-generated.mjs against a stub of the results host, so the first real pull (Backlog 1)
// is not the first time the script runs: a portrait becomes a bounded jpeg, a sprite is trimmed to its ink, a video
// and an audio file are copied byte for byte, a missing file is a counted failure, and the manifest the client
// reads lists what landed with the images' sizes. It lives here because site/ is deployed and scripts/ is not
// collected by vitest.
import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import sharp from "sharp";

const HOST = "https://d8j0ntlcm91z4.cloudfront.net/user_x";
let server: ReturnType<typeof createServer>;
let origin = "";
const files = new Map<string, Buffer>();

beforeAll(async () => {
  // a portrait wider and taller than its slot, a sprite that is mostly empty, and two byte-for-byte files
  files.set("/user_x/portrait.png", await sharp({ create: { width: 1200, height: 2000, channels: 4, background: { r: 120, g: 40, b: 60, alpha: 1 } } }).png().toBuffer());
  const ink = await sharp({ create: { width: 100, height: 100, channels: 4, background: { r: 10, g: 10, b: 10, alpha: 1 } } }).png().toBuffer();
  files.set("/user_x/sprite.png", await sharp({ create: { width: 600, height: 600, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: ink, left: 250, top: 250 }]).png().toBuffer());
  files.set("/user_x/loop.mp4", Buffer.from("not really an mp4, but the bytes must arrive as they are"));
  files.set("/user_x/bed.ogg", Buffer.from("nor an ogg"));
  server = createServer((req, res) => {
    const body = files.get(new URL(req.url ?? "/", "http://x").pathname);
    if (!body) { res.statusCode = 404; res.end("no"); return; }
    res.setHeader("content-type", "application/octet-stream");
    res.end(body);
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  origin = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;
});
afterAll(() => new Promise<void>(resolve => server.close(() => resolve())));

describe("pull-generated against a stub host", () => {
  it("pulls, sizes and copies what the manifest names, counts what is missing, and writes the client's manifest", async () => {
    const dir = mkdtempSync(join(tmpdir(), "pull-"));
    const manifest = join(dir, "manifest.tsv");
    const out = join(dir, "gen");
    writeFileSync(manifest, [
      "# index\tkind\ttarget\turl",
      `0\timage\tportraits/nara.png\t${HOST}/portrait.png`,
      `1\timage\tsprites/warden.png\t${HOST}/sprite.png`,
      `2\tvideo\tvideo/going-under.mp4\t${HOST}/loop.mp4`,
      `3\taudio\taudio/bed-nave.ogg\t${HOST}/bed.ogg`,
      `4\timage\tprops/missing.png\t${HOST}/missing.png`,
      "",
    ].join("\n"));
    const run = await new Promise<{ code: number | null; stdout: string }>(resolve => {
      execFile("node", ["scripts/pull-generated.mjs"], {
        env: { ...process.env, PULL_ORIGIN: origin, PULL_MANIFEST: manifest, PULL_OUT: out },
        timeout: 60_000,
      }, (error, stdout) => resolve({ code: error ? (error as { code?: number }).code ?? 1 : 0, stdout: String(stdout) }));
    });
    expect(run.stdout).toContain("4 pulled, 1 failed");
    expect(run.stdout).toContain("FAIL");
    expect(run.code, "one failure fails the run").toBe(1);
    const portrait = await sharp(join(out, "portraits/nara.jpg")).metadata();
    expect(portrait.format).toBe("jpeg");
    expect(portrait.width).toBeLessThanOrEqual(640);
    expect(portrait.height).toBeLessThanOrEqual(1136);
    const sprite = await sharp(join(out, "sprites/warden.png")).metadata();
    expect(sprite.format).toBe("png");
    expect(sprite.width, "trimmed to its ink").toBeLessThanOrEqual(110);
    expect(sprite.width).toBeGreaterThanOrEqual(90);
    expect(readFileSync(join(out, "video/going-under.mp4"))).toEqual(files.get("/user_x/loop.mp4"));
    expect(readFileSync(join(out, "audio/bed-nave.ogg"))).toEqual(files.get("/user_x/bed.ogg"));
    const written = JSON.parse(readFileSync(join(out, "manifest.json"), "utf8")) as { v: number; targets: Record<string, { w: number; h: number }> };
    expect(written.v).toBe(1);
    expect(Object.keys(written.targets).sort()).toEqual(["audio/bed-nave.ogg", "portraits/nara.jpg", "sprites/warden.png", "video/going-under.mp4"]);
    expect(written.targets["portraits/nara.jpg"].w).toBe(portrait.width);
    expect(written.targets["video/going-under.mp4"]).toEqual({ w: 0, h: 0 });
  });
});
