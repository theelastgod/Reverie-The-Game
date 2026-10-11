/**
 * What a body perceives of the private lines: the aura the city addresses and whether a Wink reaches it now. A leaf
 * (constants and types only), so content can read it without importing the world (world.ts re-exports both).
 */
import type { Player } from "./types";
import { AURA_ADDRESS_GLAMOUR, AURA_DIM, AURA_PRESENT, GESTELL_FAT, GESTELL_MELTDOWN, RESTRAINT_WINK_MIN } from "./constants";

/** The aura the city addresses: the body's, plus what an Iridescent Glamour paints on for its minute. Guests are 0. */
export function addressAura(p: Player, now: number): number {
  if (p.guest) return 0;
  const glamour = !!p.kit && p.kit.verb === "iridescent" && p.kit.until > now;
  return p.aura + (glamour ? AURA_ADDRESS_GLAMOUR : 0);
}

/**
 * Whether a private line reaches this body now. Guests never; a dark aura or
 * spent restraint never; with the weather given: fat weather dims the late
 * Winke (Movement III on) for anyone the city does not look up at, and the
 * House of Divinities goes blind at meltdown. Perception, never a number.
 */
export function canSeeWink(p: Player, now: number, gestell?: number): boolean {
  if (p.guest) return false;
  const aura = addressAura(p, now);
  if (aura < AURA_DIM || p.restraint < RESTRAINT_WINK_MIN) return false;
  if (gestell !== undefined) {
    if (gestell >= GESTELL_MELTDOWN && p.house === "divinities") return false;
    if (gestell >= GESTELL_FAT && p.movement >= 3 && aura < AURA_PRESENT) return false;
  }
  return true;
}

