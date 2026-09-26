import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/** The game is standalone. Nothing in the shipped tree names a studio, a film or a film room. */
const FORBIDDEN = /\b(studios?|film|films|documentary|director|collective|screening|screenings|production still|observer room|participant room|founder room|sephiroth|aerith|midgar|shinra|materia|lifestream|buster sword)\b/i;
// DESIGN.md, AGENTS.md and PROMPT.md are developer documents that state the rule; the shipped tree is what is linted.
const ROOTS = ["src", "server/src", "site", "index.html", "README.md", "HANDOFF.md", "public/assets", "scripts"];
// Build output (site/play, dist) carries third-party library headers and is regenerated from the sources linted here.
const SKIP = /node_modules|\.test\.ts$|lint\.test\.ts$|^site\/play\/|^dist\//;

function walk(path: string, out: string[] = []): string[] {
  if (!existsSync(path)) return out;
  if (statSync(path).isDirectory()) {
    for (const entry of readdirSync(path)) walk(join(path, entry), out);
  } else out.push(path);
  return out;
}

describe("standalone game lint", () => {
  it("names no studio, film or film room anywhere in the shipped tree", () => {
    const hits: string[] = [];
    for (const root of ROOTS) {
      for (const file of walk(root)) {
        if (SKIP.test(file)) continue;
        if (/\.(png|jpg|jpeg|mp4|webp|ico)$/i.test(file)) {
          if (FORBIDDEN.test(file)) hits.push(`${file} (asset name)`);
          continue;
        }
        const text = readFileSync(file, "utf8");
        const lines = text.split("\n");
        lines.forEach((line, i) => {
          if (FORBIDDEN.test(line)) hits.push(`${file}:${i + 1}: ${line.trim().slice(0, 120)}`);
        });
      }
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });

  it("references only assets that exist, or generated targets the manifest names", () => {
    // Generated files land under public/assets/gen/ only after the pull; a reference to one is fine
    // when .rebuild/generated-manifest.tsv lists it (the pull writes portraits and plates as jpeg).
    const generated = new Set<string>();
    for (const line of readFileSync(".rebuild/generated-manifest.tsv", "utf8").split("\n")) {
      if (!line || line.startsWith("#")) continue;
      const target = line.split("\t")[2] ?? "";
      generated.add(target);
      if (target.startsWith("portraits/") || target.startsWith("plate-")) generated.add(target.replace(/\.png$/, ".jpg"));
    }
    const missing: string[] = [];
    const referenced = new Set<string>();
    for (const root of ["src", "index.html", "site"]) {
      for (const file of walk(root)) {
        if (!/\.(ts|html|css)$/.test(file) || SKIP.test(file)) continue;
        const text = readFileSync(file, "utf8");
        for (const m of text.matchAll(/["'`]((?:tiles|sprites|hud|motion)\/[\w./-]+\.(?:png|jpg|jpeg|mp4)|[\w-]+\.(?:png|jpg|jpeg|mp4))["'`]/g)) referenced.add(m[1]);
      }
    }
    for (const ref of referenced) {
      if (generated.has(ref)) continue;
      if (!existsSync(`public/assets/${ref}`) && !existsSync(`site/assets/${ref}`) && !existsSync(`public/${ref}`)) missing.push(ref);
    }
    expect(missing, missing.join("\n")).toEqual([]);
  });
});
