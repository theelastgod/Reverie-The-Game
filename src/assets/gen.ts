/**
 * The generated-asset manifest. `scripts/pull-generated.mjs` writes
 * `public/assets/gen/manifest.json` naming every file it landed; the client
 * fetches it once, before Phaser boots, and afterwards asks `hasGen` before
 * touching any generated file. Absent or malformed, the manifest is empty and
 * the city renders exactly as it does today, at the cost of one request.
 */
import { genUrl } from "./url";

export { genUrl };

export type GenSize = { w: number; h: number };
export type GenManifest = { v: number; targets: Record<string, GenSize> };

export const EMPTY_MANIFEST: GenManifest = Object.freeze({ v: 0, targets: Object.freeze({}) }) as GenManifest;

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

/** Reads the manifest through `fetcher`; any failure or malformed body is an empty manifest, never a throw. */
export async function loadGenManifest(fetcher: Fetcher, url: string = genUrl("manifest.json")): Promise<GenManifest> {
  try {
    const res = await fetcher(url, { cache: "no-cache" });
    if (!res.ok) return EMPTY_MANIFEST;
    const body = (await res.json()) as unknown;
    return parseManifest(body);
  } catch {
    return EMPTY_MANIFEST;
  }
}

/** A manifest from a decoded body: only string targets with numeric sizes survive. */
export function parseManifest(body: unknown): GenManifest {
  if (!body || typeof body !== "object") return EMPTY_MANIFEST;
  const raw = (body as { v?: unknown; targets?: unknown }).targets;
  if (!raw || typeof raw !== "object") return EMPTY_MANIFEST;
  const targets: Record<string, GenSize> = {};
  for (const [target, size] of Object.entries(raw as Record<string, unknown>)) {
    if (!target || target.includes("..")) continue;
    const s = size && typeof size === "object" ? (size as { w?: unknown; h?: unknown }) : {};
    const w = typeof s.w === "number" && Number.isFinite(s.w) ? s.w : 0;
    const h = typeof s.h === "number" && Number.isFinite(s.h) ? s.h : 0;
    targets[target] = { w, h };
  }
  const v = typeof (body as { v?: unknown }).v === "number" ? (body as { v: number }).v : 1;
  return { v, targets };
}

export const hasGen = (m: GenManifest, target: string): boolean => Object.prototype.hasOwnProperty.call(m.targets, target);

/** The generated file's URL when the manifest has it, else the fallback (which may be an ordinary asset URL). */
export const pickGen = (m: GenManifest, target: string | null, fallback: string): string => (target && hasGen(m, target) ? genUrl(target) : fallback);

/** The one manifest the app uses: loaded once at start, empty until then. */
class GenRegistry {
  private manifest: GenManifest = EMPTY_MANIFEST;
  private loading: Promise<GenManifest> | null = null;

  /** Loads once; later calls share the same promise. */
  load(fetcher: Fetcher = (...a) => fetch(...a), url?: string): Promise<GenManifest> {
    if (!this.loading) {
      this.loading = loadGenManifest(fetcher, url).then(m => {
        this.manifest = m;
        return m;
      });
    }
    return this.loading;
  }

  /** For tests and tooling: replace the manifest outright. */
  set(m: GenManifest): void {
    this.manifest = m;
    this.loading = Promise.resolve(m);
  }

  get current(): GenManifest {
    return this.manifest;
  }

  has(target: string): boolean {
    return hasGen(this.manifest, target);
  }

  url(target: string, fallback: string): string {
    return pickGen(this.manifest, target, fallback);
  }
}

export const gen = new GenRegistry();
