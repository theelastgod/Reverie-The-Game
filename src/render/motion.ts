/**
 * The canvas under `prefers-reduced-motion`. The HUD's CSS and the minimap already stand still; this is the
 * scene's side. A camera shake is skipped; a transient effect keeps its fade and loses its movement (the tween
 * keys that move, grow, scale or drift are dropped, so it appears and fades in place); the rings and lights that
 * pulse hold their mean, the idle breath and the aura's turn stop. Camera fades and flashes stay: they do not
 * move. The decisions are pure so they can be unit tested; `Fx`, `Entities` and the minimap apply them.
 */

/** Tween properties that move, grow, scale or drift a target. Everything else (alpha, tint, timing) stays. */
const MOVING = new Set(["x", "y", "scale", "scaleX", "scaleY", "radius", "displayWidth", "displayHeight", "tilePositionX", "tilePositionY", "angle"]);

type Query = (q: string) => { matches: boolean };

/** A live read of the viewer's preference: true when they asked for reduced motion, false when the page cannot say. */
export function reducedMotion(query: Query | undefined = typeof matchMedia === "function" ? q => matchMedia(q) : undefined): () => boolean {
  let list: { matches: boolean } | null = null;
  try {
    list = query?.("(prefers-reduced-motion: reduce)") ?? null;
  } catch {
    list = null;
  }
  return () => !!list?.matches;
}

/** The tween config as given, or with its movement removed when motion is reduced: a fade in place. */
export function stillTween<T extends object>(reduced: boolean, config: T): T {
  if (!reduced) return config;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config)) if (!MOVING.has(key)) out[key] = value;
  return out as T;
}

/** The pulse that rings and lights breathe with, in [0, 1]; its mean when motion is reduced. */
export function pulseAt(reduced: boolean, seconds: number): number {
  return reduced ? 0.5 : 0.5 + 0.5 * Math.sin(seconds * Math.PI * 1.6);
}
