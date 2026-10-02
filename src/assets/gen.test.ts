import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { EMPTY_MANIFEST, hasGen, loadGenManifest, parseManifest, pickGen, genUrl, gen } from "./gen";

const json = (status: number, body: unknown): Response => ({ ok: status >= 200 && status < 300, status, json: async () => body } as unknown as Response);

describe("the generated-asset manifest", () => {
  it("resolves generated files under assets/gen with the deploy base", () => {
    expect(genUrl("props/furnace.png")).toBe("/assets/gen/props/furnace.png");
  });

  it("loads a manifest through the fetcher once, from the gen folder, without a stale cache", async () => {
    const fetcher = vi.fn(async () => json(200, { v: 1, targets: { "seals/sky.png": { w: 160, h: 160 }, "audio/bed-nave.mp3": { w: 0, h: 0 } } }));
    const m = await loadGenManifest(fetcher);
    expect(fetcher).toHaveBeenCalledWith("/assets/gen/manifest.json", { cache: "no-cache" });
    expect(m.v).toBe(1);
    expect(hasGen(m, "seals/sky.png")).toBe(true);
    expect(hasGen(m, "audio/bed-nave.mp3")).toBe(true);
    expect(hasGen(m, "seals/earth.png")).toBe(false);
    expect(m.targets["seals/sky.png"]).toEqual({ w: 160, h: 160 });
  });

  it("is empty on a 404, a network failure, junk JSON or a body of the wrong shape", async () => {
    expect(await loadGenManifest(async () => json(404, "not found"))).toBe(EMPTY_MANIFEST);
    expect(await loadGenManifest(async () => { throw new Error("offline"); })).toBe(EMPTY_MANIFEST);
    expect(await loadGenManifest(async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError("junk"); } }) as unknown as Response)).toBe(EMPTY_MANIFEST);
    expect(await loadGenManifest(async () => json(200, null))).toBe(EMPTY_MANIFEST);
    expect(await loadGenManifest(async () => json(200, { v: 1 }))).toBe(EMPTY_MANIFEST);
    expect(await loadGenManifest(async () => json(200, { v: 1, targets: [] }))).toEqual({ v: 1, targets: {} });
  });

  it("keeps only sane targets and sizes", () => {
    const m = parseManifest({ v: 2, targets: { "a.png": { w: "9", h: 3 }, "../etc": { w: 1, h: 1 }, "": {}, "b.mp3": null } });
    expect(m).toEqual({ v: 2, targets: { "a.png": { w: 0, h: 3 }, "b.mp3": { w: 0, h: 0 } } });
    expect(hasGen(m, "toString")).toBe(false);
  });

  it("picks the generated URL only when the manifest has the target", () => {
    const m = parseManifest({ v: 1, targets: { "portraits/omen.jpg": { w: 640, h: 1136 } } });
    expect(pickGen(m, "portraits/omen.jpg", "/assets/x.jpg")).toBe("/assets/gen/portraits/omen.jpg");
    expect(pickGen(m, "portraits/desk.jpg", "/assets/x.jpg")).toBe("/assets/x.jpg");
    expect(pickGen(m, null, "/assets/x.jpg")).toBe("/assets/x.jpg");
  });

  it("the committed manifest is empty, so the first request succeeds and names no generated file", async () => {
    // public/assets/gen/manifest.json ships with the client until the Stage B pull overwrites it: the same bytes
    // scripts/pull-generated.mjs writes when nothing is pulled, so a pull that lands nothing leaves no diff.
    const text = readFileSync("public/assets/gen/manifest.json", "utf8");
    expect(text).toBe(JSON.stringify({ v: 1, targets: {} }, null, 2) + "\n");
    const m = await loadGenManifest(async () => json(200, JSON.parse(text)));
    expect(m).toEqual({ v: 1, targets: {} });
    expect(hasGen(m, "sprites/warden.png")).toBe(false);
    expect(pickGen(m, "portraits/nara.jpg", "/assets/nara.jpg")).toBe("/assets/nara.jpg");
  });

  it("the registry loads once, shares the promise, and answers empty until then", async () => {
    expect(gen.has("anything")).toBe(false);
    const fetcher = vi.fn(async () => json(200, { v: 1, targets: { "badges/ruin.png": { w: 128, h: 128 } } }));
    const a = gen.load(fetcher);
    const b = gen.load(fetcher);
    expect(a).toBe(b);
    await a;
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(gen.has("badges/ruin.png")).toBe(true);
    expect(gen.url("badges/ruin.png", "/assets/hud/wing.png")).toBe("/assets/gen/badges/ruin.png");
    expect(gen.url("badges/herald.png", "/assets/hud/wing.png")).toBe("/assets/hud/wing.png");
    gen.set(EMPTY_MANIFEST);
    expect(gen.has("badges/ruin.png")).toBe(false);
  });
});
