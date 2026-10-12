// The player-defect sweep, round twenty (2026-10-12): a review of rounds eighteen and nineteen.
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { WRECKAGE_TTL } from "./constants";
import { POSITIONS, districtAt } from "./map";
import { emptyWorld, spawnGuest } from "./world";
import { applyAction } from "./actions";
import { F } from "./content/ids";

function body(w: WorldState, id: string, at: { x: number; y: number }, patch: Partial<Player> = {}): WorldState {
  const players = new Map(w.players);
  const serial = 40 + players.size;
  players.set(id, { ...spawnGuest(id, w.now), guest: false, serial, name: `#00${serial}`, house: "earth", x: at.x, y: at.y, district: districtAt(at.x, at.y), flags: { [F.ANGEL]: 1, [F.UNDER]: 1 }, ...patch });
  return { ...w, players };
}
const me = (w: WorldState, id: string): Player => w.players.get(id)!;
const street = POSITIONS["stall-3"];

describe("truce between duelists", () => {
  it("a truce between duelists ends the duel and the partner hears it end", () => {
    let w: WorldState = { ...emptyWorld(), enemies: [] };
    w = body(w, "a", street, { flagged: true });
    w = body(w, "b", { x: street.x + 30, y: street.y }, { flagged: true });
    const grave = { id: "old", x: street.x + 15, y: street.y + 20, district: districtAt(street.x, street.y), fromId: "z", fromName: "#0009", fromSerial: 9, killerId: "", at: 0, until: w.now + WRECKAGE_TTL, buried: false, looted: false, bestand: 0, items: [] };
    w = { ...w, wreckage: [grave] };
    w = applyAction(w, "a", { t: "interact", targetId: "b", choice: "duel" });
    w = applyAction(w, "b", { t: "interact", targetId: "a", choice: "duel" });
    w = applyAction(w, "a", { t: "truce" });
    // documents current behaviour: neither side gets "stood down" (b's was written then overwritten)
    expect(me(w, "b").notices.some(n => n.text.includes("stood down")), "the partner hears the duel end").toBe(true);
    expect(me(w, "a").duel).toBeUndefined();
    expect(me(w, "b").duel).toBeUndefined();
  });
});
