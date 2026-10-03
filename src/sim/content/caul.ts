/**
 * Where Anselm Caul stands for a body, and whose the claimed hour was, as the
 * sim's other modules need them without the whole roster. Kept apart from
 * npcs.ts so combat and the POIs can read them without pulling the dialogue
 * trees (and their lines) in.
 */
import type { Player } from "../types";
import { C, F } from "./ids";

/** The lip: the Grid's gate to the Clearing, the tile where the city stops a guest. He stands there from the fourth hour on, and for a guest who walks the Grid. */
export const caulAtLip = (p: Player): boolean => p.movement >= 4 || (p.guest && p.district === "wet");

/**
 * Cold's claim on the body's hour. A claimed rite writes who claimed it (F.HIJACKED_COLD / F.HIJACKED_SAFETY), and that is read
 * first: the body's last claim, which a later season's unclaimed rite does not erase (the mark is forever; the altars and the Ruin
 * kit read it so). The readers that speak of the rite just passed gate on C.PASSING being hijack themselves. A body saved before
 * the record was written falls back to the resolver's own rule (clearing.ts `hijacker`): the hour sold at the desk or signed for
 * at the lip, with Cold as the current.
 */
export const coldClaimed = (p: Player): boolean => {
  if ((p.flags[F.HIJACKED_COLD] ?? 0) > 0) return true;
  if ((p.flags[F.HIJACKED_SAFETY] ?? 0) > 0) return false;
  return (p.choices[C.OPERATOR] === "take" || p.choices[C.LIP] === "signed") && p.current === "cold";
};
