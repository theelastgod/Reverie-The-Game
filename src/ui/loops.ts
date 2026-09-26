/**
 * Generated video loops in the DOM: muted, looping, inline, only when the
 * manifest has the file and the viewer has not asked for reduced motion. A
 * loop that cannot play is simply absent; the page underneath is unchanged.
 */
import { gen } from "../assets/gen";

export const OVERLAY_MS = 6000;

/** False when the viewer prefers reduced motion (or the page cannot say). */
export function motionAllowed(win: Pick<Window, "matchMedia"> | null = typeof window !== "undefined" ? window : null): boolean {
  try {
    return !win?.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return true;
  }
}

/** A loop element for a manifest target, or null when it should not play. */
export function makeLoop(target: string | null, className: string, doc: Document = document): HTMLVideoElement | null {
  if (!target || !gen.has(target) || !motionAllowed()) return null;
  const v = doc.createElement("video");
  v.className = className;
  v.muted = true;
  v.loop = true;
  v.autoplay = true;
  v.playsInline = true;
  v.setAttribute("muted", "");
  v.setAttribute("playsinline", "");
  v.setAttribute("aria-hidden", "true");
  v.src = gen.url(target, "");
  return v;
}

/**
 * Keeps one loop under `parent` in sync with the target wanted: swaps the
 * source when it changes, removes the element when nothing is wanted.
 */
export class LoopSlot {
  private el: HTMLVideoElement | null = null;
  private target: string | null = null;

  constructor(private readonly parent: HTMLElement | null, private readonly className: string, private readonly before: Element | null = null) {}

  get playing(): string | null {
    return this.el ? this.target : null;
  }

  set(target: string | null): void {
    if (target === this.target) return;
    this.target = target;
    const next = this.parent ? makeLoop(target, this.className, this.parent.ownerDocument) : null;
    this.el?.remove();
    this.el = next;
    if (next && this.parent) {
      if (this.before && this.before.parentElement === this.parent) this.parent.insertBefore(next, this.before);
      else this.parent.append(next);
      void next.play?.()?.catch?.(() => undefined);
    }
  }

  destroy(): void {
    this.el?.remove();
    this.el = null;
    this.target = null;
  }
}

/** A full-screen loop for a moment (the Passing outcomes, the going-under), then gone. */
export function overlayLoop(root: HTMLElement | null, target: string | null, ms: number = OVERLAY_MS, win: Pick<Window, "setTimeout"> = window): HTMLVideoElement | null {
  if (!root) return null;
  const v = makeLoop(target, "gen-overlay", root.ownerDocument);
  if (!v) return null;
  root.append(v);
  void v.play?.()?.catch?.(() => undefined);
  win.setTimeout(() => {
    v.classList.add("gone");
    win.setTimeout(() => v.remove(), 600);
  }, ms);
  return v;
}
