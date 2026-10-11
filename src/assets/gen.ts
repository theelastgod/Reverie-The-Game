/**
 * The generated-asset manifest. `scripts/pull-generated.mjs` writes
 * `public/assets/gen/manifest.json` naming every file it landed; the client
 * fetches it once, before Phaser boots, and afterwards asks `hasGen` before
 * touching any generated file. An empty manifest is committed there until the
 * pull lands (so the request succeeds and the browser logs nothing); absent or
 * malformed, the manifest is empty all the same, and the city renders exactly
 * as it does today, at the cost of one request.
 */
import { genUrl } from "./url";

export { genUrl };

export type GenSize = { w: number; h: number };
export type GenManifest = { v: number; targets: Record<string, GenSize> };

export const EMPTY_MANIFEST: GenManifest = Object.freeze({ v: 0, targets: Object.freeze({}) }) as GenManifest;

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

/** The boot waits on the manifest: past this a request that never answers is an empty manifest, not a game that never starts. */
export const MANIFEST_WAIT_MS = 3000;

/** Reads the manifest through `fetcher`; any failure, malformed body or no answer in `waitMs` is an empty manifest, never a throw. */
export async function loadGenManifest(fetcher: Fetcher, url: string = genUrl("manifest.json"), waitMs: number = MANIFEST_WAIT_MS): Promise<GenManifest> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<GenManifest>(resolve => { timer = setTimeout(() => resolve(EMPTY_MANIFEST), waitMs); });
  try {
    return await Promise.race([read(fetcher, url), late]);
  } finally {
    clearTimeout(timer);
  }
}

async function read(fetcher: Fetcher, url: string): Promise<GenManifest> {
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

/** Generated files the browser could not load this session: the manifest listed them, the file failed. A missing file
 *  changes nothing (slots.ts), so a failed one falls back the way an absent one does (the player-defect sweep, round eight). */
const failedGen = new Set<string>();
export const genFailed = (url: string): boolean => failedGen.has(url);

type Img = { src: string; onerror: unknown; getAttribute(name: string): string | null };
/** Sets an image's src; if that src fails to load, it is remembered as failed and `fallback` runs (once, for that src). */
export function setImageSrc(img: Img, src: string, fallback: () => void): void {
  img.onerror = () => {
    if (img.getAttribute("src") !== src) return;
    img.onerror = null;
    failedGen.add(src);
    fallback();
  };
  img.src = src;
}
