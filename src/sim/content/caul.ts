/**
 * Where Anselm Caul stands for a body, as the sim's other modules need it
 * without the whole roster: the lip of the ring. Kept apart from npcs.ts so
 * combat can read it without pulling the dialogue trees (and their lines) in.
 */
import type { Player } from "../types";

/** The lip: the Grid's gate to the Clearing, the tile where the city stops a guest. He stands there from the fourth hour on, and for a guest who walks the Grid. */
export const caulAtLip = (p: Player): boolean => p.movement >= 4 || (p.guest && p.district === "wet");
