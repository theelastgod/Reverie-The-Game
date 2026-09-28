/**
 * The one-stick touch scheme, DOM-free so it can be unit tested. A finger down on the canvas plants a stick
 * where it lands; dragging from there is an eight-way intent, the same four booleans the keys send, so the
 * server sees no new message. A short press that barely travels is a strike, and a second finger down while
 * the stick is held is a strike too. The HUD's dodge chip is a button that dodges the way the stick points,
 * else the way the body faces. The scene applies these; `Hud` draws the ring and the knob.
 */
import type { Intent } from "../sim/types";

/** Pixels of drag before the stick reads a direction. */
export const STICK_DEAD = 14;
/** Pixels the knob travels at most: the ring's radius. */
export const STICK_REACH = 40;
/** A press no longer than this, that travels less than TAP_MOVE, is a tap. */
export const TAP_MS = 250;
export const TAP_MOVE = 10;

// A direction counts when its component exceeds this share of the drag: eight sectors of 45 degrees.
const SECTOR = Math.sin(Math.PI / 8);

export const STILL: Intent = { up: false, down: false, left: false, right: false };

/** Eight-way intent from a drag vector; still inside the dead zone. */
export function stickIntent(dx: number, dy: number, dead = STICK_DEAD): Intent {
  const len = Math.hypot(dx, dy);
  if (len < dead) return STILL;
  const edge = len * SECTOR;
  return { up: dy < -edge, down: dy > edge, left: dx < -edge, right: dx > edge };
}

/** Where the knob is drawn: the drag vector clamped to the ring's reach. */
export function knobOffset(dx: number, dy: number, reach = STICK_REACH): { x: number; y: number } {
  const len = Math.hypot(dx, dy);
  if (len <= reach) return { x: dx, y: dy };
  return { x: (dx / len) * reach, y: (dy / len) * reach };
}

/** A press that ends quickly without travelling is a tap (a strike), not a walk. */
export function isTap(heldMs: number, travelled: number, maxMs = TAP_MS, maxMove = TAP_MOVE): boolean {
  return heldMs <= maxMs && travelled < maxMove;
}

/** The dodge direction: the way the intent points, else the way the body faces; null when neither points anywhere. */
export function dodgeDirection(intent: Intent, facing: { dx: number; dy: number }): { dx: number; dy: number } | null {
  const dx = (intent.right ? 1 : 0) - (intent.left ? 1 : 0);
  const dy = (intent.down ? 1 : 0) - (intent.up ? 1 : 0);
  if (dx || dy) return { dx, dy };
  const fx = Math.sign(facing.dx);
  const fy = Math.sign(facing.dy);
  return fx || fy ? { dx: fx, dy: fy } : null;
}

/** The keys and the stick together: either can hold a direction. */
export function mergeIntent(a: Intent, b: Intent): Intent {
  return { up: a.up || b.up, down: a.down || b.down, left: a.left || b.left, right: a.right || b.right };
}
