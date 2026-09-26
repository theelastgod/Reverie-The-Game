// Pull the generated Stage B assets listed in .rebuild/generated-manifest.tsv into
// public/assets/gen/, post-processing stills to game sizes with sharp.
// Usage: node scripts/pull-generated.mjs [--only=portraits,props,...]
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, extname, relative, sep } from "node:path";
import sharp from "sharp";

const manifest = readFileSync(".rebuild/generated-manifest.tsv", "utf8")
  .split("\n").filter(l => l && !l.startsWith("#"))
  .map(l => { const [index, kind, target, url] = l.split("\t"); return { index: Number(index), kind, target, url }; });
const only = (process.argv.find(a => a.startsWith("--only=")) ?? "").slice(7).split(",").filter(Boolean);
const OUT = "public/assets/gen";

/** Output rules by target prefix: [maxWidth, maxHeight, format, quality]. */
function rule(target) {
  if (target.startsWith("portraits/")) return { w: 640, h: 1136, fmt: "jpeg", q: 86 };
  if (target.startsWith("sprites/")) return { w: 256, h: 256, fmt: "png", trim: true };
  if (target.startsWith("seals/")) return { w: 160, h: 160, fmt: "png", trim: true };
  if (target.startsWith("badges/")) return { w: 128, h: 128, fmt: "png", trim: true };
  if (target.startsWith("props/")) return { w: 256, h: 256, fmt: "png", trim: true };
  if (target.startsWith("plate-")) return { w: 1280, h: 720, fmt: "jpeg", q: 84 };
  if (target === "coin-reverie.png") return { w: 512, h: 512, fmt: "png" };
  if (target === "lockup-game.png") return { w: 1536, h: 660, fmt: "png" };
  return null;
}

async function processImage(buf, r) {
  let img = sharp(buf, { limitInputPixels: false });
  if (r.trim) img = img.trim({ threshold: 8 });
  img = img.resize({ width: r.w, height: r.h, fit: "inside", withoutEnlargement: true });
  return r.fmt === "jpeg" ? img.jpeg({ quality: r.q, mozjpeg: true }).toBuffer() : img.png({ compressionLevel: 9 }).toBuffer();
}

let ok = 0, failed = 0;
for (const item of manifest) {
  if (only.length && !only.some(o => item.target.startsWith(o))) continue;
  const r = item.kind === "image" ? rule(item.target) : null;
  const target = r && r.fmt === "jpeg" ? item.target.replace(/\.png$/, ".jpg") : item.target;
  const out = join(OUT, target);
  mkdirSync(dirname(out), { recursive: true });
  try {
    const res = await fetch(item.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let buf = Buffer.from(await res.arrayBuffer());
    if (r) buf = await processImage(buf, r);
    writeFileSync(out, buf);
    ok++;
    console.log(`ok   ${out} ${(buf.length / 1024).toFixed(0)} KB`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${out}: ${e.message}`);
  }
}
console.log(`${ok} pulled, ${failed} failed`);

// The manifest names what exists on disk; the client fetches nothing that is not in it.
// It is written even when nothing could be pulled, so an unfinished city costs one request.
async function writeManifest() {
  const targets = {};
  const walk = dir => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) { walk(full); continue; }
      if (name === "manifest.json") continue;
      targets[relative(OUT, full).split(sep).join("/")] = { w: 0, h: 0 };
    }
  };
  mkdirSync(OUT, { recursive: true });
  walk(OUT);
  for (const target of Object.keys(targets)) {
    if (!/\.(png|jpe?g)$/i.test(target)) continue;
    try {
      const meta = await sharp(join(OUT, target)).metadata();
      targets[target] = { w: meta.width ?? 0, h: meta.height ?? 0 };
    } catch { /* an unreadable image stays listed with no size */ }
  }
  writeFileSync(join(OUT, "manifest.json"), JSON.stringify({ v: 1, targets }, null, 2) + "\n");
  console.log(`manifest: ${Object.keys(targets).length} targets`);
}
await writeManifest();
process.exit(failed ? 1 : 0);
