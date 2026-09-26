/**
 * The resistance's Clearing: the one listing the city itself posts on the
 * Grid. The board read puts it up at its opening price for everyone; what
 * Angels do moves the number (the private yield taken or refused, a
 * Passing's outcome), and the ledger shows it as a price, not a sale. The
 * engine (`economy.applyListing`) owns the posting and the bounds; this
 * file owns what the listing is and which effects move it.
 */
import { CLEARING_LIST_PRICE, CLEARING_PRICE_MOVE } from "../constants";
import type { Effect, Item, WorldState } from "../types";

export const CLEARING_LISTING = "listing:city:clearing";
export const RESISTANCE = "the resistance";
export const CLEARING_ITEM: Item = { id: "city:clearing", kind: "exhibition", name: "A Clearing, the hole scheduled", qty: 1, value: 0 };

/** The board's price for a Clearing, or null before anyone has read the board. */
export const clearingPrice = (w: WorldState): number | null => w.market.find(l => l.id === CLEARING_LISTING)?.price ?? null;

/** Post the Clearing at its opening price; a second read leaves the price where the city moved it. */
export const listClearing = (): Effect => ({ kind: "listing", id: CLEARING_LISTING, seller: RESISTANCE, item: CLEARING_ITEM, price: CLEARING_LIST_PRICE });

/** Move the Clearing's price by what the city did; nothing moves before the board has been read. */
export const moveClearing = (move: keyof typeof CLEARING_PRICE_MOVE): Effect => ({ kind: "listing", id: CLEARING_LISTING, delta: CLEARING_PRICE_MOVE[move] });
