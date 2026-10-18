/**
 * How many device pixels the city draws per CSS pixel. A 2x screen (every Mac, every phone) given a canvas at CSS size
 * upscales it and blurs the art, the names over heads and the map (the player-defect sweep, round seventy-five). The
 * game draws at the screen's density, capped at 2: a 3x phone would fill more than twice the pixels of 2x for detail a
 * thumb's distance cannot see. A page zoomed in reports a higher density and draws sharper the same way; zoomed out, it
 * never drops below 1.
 */
export const MAX_DENSITY = 2;

export function renderDensity(devicePixelRatio: number | undefined): number {
  const r = Number(devicePixelRatio);
  if (!Number.isFinite(r) || r <= 1) return 1;
  return Math.min(MAX_DENSITY, r);
}

/** The canvas's size in device pixels for a CSS viewport, whole pixels (a fraction would blur the last row). */
export function canvasSize(cssWidth: number, cssHeight: number, density: number): { width: number; height: number } {
  return { width: Math.max(1, Math.round(cssWidth * density)), height: Math.max(1, Math.round(cssHeight * density)) };
}

/** The camera's zoom: the layout's zoom (1.15 on a wide screen, by CSS width) times the density. */
export function cameraZoom(cssWidth: number, density: number): number {
  return (cssWidth >= 1280 ? 1.15 : 1) * density;
}

/**
 * The resolution the world's text is rasterised at when it is made: the camera's largest zoom at this density,
 * rounded up (2 on a 1x screen, 3 on a 2x one). Text below it is drawn small and stretched by the camera, softer than
 * the art around it; above it, it costs texture for nothing (round seventy-eight's review). Text made before a density
 * change keeps its resolution until it is made again.
 */
export function textResolution(devicePixelRatio: number | undefined): number {
  return Math.ceil(cameraZoom(1280, renderDensity(devicePixelRatio)));
}
