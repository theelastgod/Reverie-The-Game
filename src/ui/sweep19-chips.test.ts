// The player-defect sweep, round nineteen (2026-10-12): the HUD's chips and the prompt's V against the server's rule while a fight is warm, and the
// USE PAPER chip for an insured body. Real reducers, the real format helpers.
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "../sim/types";
import { POSITIONS, districtAt } from "../sim/map";
import { emptyWorld, spawnGuest } from "../sim/world";
import { applyAction } from "../sim/actions";
import { snapshotFor } from "../sim/snapshot";
import { playerVerbs } from "../sim/interact";
import { F } from "../sim/content/ids";
import { FLAG_HELD } from "../sim/content/lines";
import { MAX_HP } from "../sim/constants";
import { chipVerbs } from "./format";
import { paperWorthUsing, PAPER_INSURANCE } from "./keys";

function angel(id: string, x: number, y: number, patch: Partial<Player> = {}): Player {
  const base = spawnGuest(id, 0);
  return { ...base, guest: false, serial: id === "a" ? 41 : 42, name: id === "a" ? "#0041" : "#0042", house: "mortals", aura: 15, auraSeed: 15, bestand: 60, x, y, district: districtAt(x, y), flags: { ...base.flags, [F.UNDER]: 1 }, ...patch };
}
function two(): WorldState {
  const at = POSITIONS["hot-street"];
  let w = emptyWorld();
  const players = new Map(w.players);
  players.set("a", angel("a", at.x, at.y, { facing: { dx: 1, dy: 0 } }));
  players.set("b", angel("b", at.x + 24, at.y));
  w = { ...w, players };
  w = applyAction(w, "a", { t: "flag" });
  w = applyAction(w, "b", { t: "flag" });
  return w;
}

describe("a flag held past a blow", () => {
  it("neither the chip nor the prompt offers V to lower it while the server refuses", () => {
    let w = applyAction(two(), "a", { t: "strike" });
    const a = w.players.get("a")!;
    expect(w.players.get("b")!.hp).toBeLessThan(MAX_HP);
    expect(a.flagHeldUntil ?? 0).toBeGreaterThan(w.now);
    const snap = snapshotFor(w, "a");
    // the HUD's chip (hud.ts updateChipVerbs) reads the YouView it is given
    expect(chipVerbs(snap.you, paperWorthUsing(snap.you, MAX_HP), snap.now).flag).toBeNull();
    // the prompt on the other body offers V too
    expect(playerVerbs({ w, p: w.players.get("a")!, now: w.now }, w.players.get("b")!).some(v => v.key === "V")).toBe(false);
    // the press: refused, flag still up
    w = applyAction(w, "a", { t: "flag" });
    expect(w.players.get("a")!.flagged).toBe(true);
    expect(w.players.get("a")!.heard).toBe(FLAG_HELD);
  });
});

describe("USE PAPER for an insured body", () => {
  it("hides the chip for a spare insurance paper that would do nothing", () => {
    const at = POSITIONS["hot-street"];
    let w = emptyWorld();
    const p = angel("a", at.x, at.y, { insured: true, items: [{ id: PAPER_INSURANCE, kind: "paper", name: "Insurance paper", qty: 1, value: 0, bound: false } as Player["items"][number]] });
    w = { ...w, players: new Map(w.players).set("a", p) };
    const snap = snapshotFor(w, "a");
    expect(chipVerbs(snap.you, paperWorthUsing(snap.you, MAX_HP), snap.now).use).toBe(false);
    const after = applyAction(w, "a", { t: "use", itemId: PAPER_INSURANCE });
    expect(after.players.get("a")!.items.find(i => i.id === PAPER_INSURANCE)?.qty).toBe(1);
    expect(after.players.get("a")!.heard).not.toBe("");
  });
});

import { eventRows } from "./events";

describe("RUIN DUEL ASKED after the asked body lowers its flag", () => {
  it("the offer is withdrawn, so the strip does not name an F the server refuses", () => {
    let w = two();
    const at = POSITIONS["hot-street"];
    const wreck = { id: "wr1", x: at.x + 12, y: at.y, district: districtAt(at.x, at.y), fromId: "x", fromName: "Someone", fromSerial: null, killerId: "y", at: 0, until: 999, buried: false, looted: false, bestand: 0, items: [] };
    w = { ...w, wreckage: [wreck] };
    w = applyAction(w, "a", { t: "interact", targetId: "b", choice: "duel" });
    expect(w.players.get("a")!.duel?.with).toBe("b");
    w = applyAction(w, "b", { t: "flag" }); // b lowers its flag; a's offer stands on a's record
    expect(w.players.get("b")!.flagged).toBe(false);
    const snap = snapshotFor(w, "b");
    const row = eventRows(snap).find(r => r.id === "duel-offer");
    expect(row, "the offer is withdrawn when its body stands down").toBeUndefined();
    expect(w.players.get("a")!.duel).toBeUndefined();
    // the F the strip names: not offered, and refused if sent
    expect(playerVerbs({ w, p: w.players.get("b")!, now: w.now }, w.players.get("a")!).some(v => v.key === "F")).toBe(false);
    const after = applyAction(w, "b", { t: "interact", targetId: "a", choice: "duel" });
    expect(after.players.get("b")!.duel).toBeUndefined();
  });
});
