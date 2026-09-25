import { GUEST_ARENA, nearPoint } from "./campaign";
import type { Player } from "./world";

export const TRUCE_ACTIVE = "The truce holds. Neither side can strike or raise a flag yet.";
export const PVP_FLAG_REQUIRED = "Both Angels must flag for PvP. Press V at Wet Grid to enter.";
export const PRACTICE_SAFE = "Practice ground. Strike the dummy; people are safe here.";
export const PRACTICE_RADIUS = 80;

/** A grave or a valuable inventory never grants permission to hurt a bystander. */
export function pvpBlockReason(a: Player, b: Player, now: number): string | undefined {
  if (a.truceUntil > now || b.truceUntil > now) return TRUCE_ACTIVE;
  if ([a, b].some(p => nearPoint(p.x, p.y, GUEST_ARENA.x, GUEST_ARENA.y, PRACTICE_RADIUS))) return PRACTICE_SAFE;
  if (!a.flagged || !b.flagged) return PVP_FLAG_REQUIRED;
}
