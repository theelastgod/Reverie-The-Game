// The player-defect sweep, round twenty-one (2026-10-12; found by the random-play fuzzer, src/sim/fuzz.test.ts, seed 14277):
// a first link is not a prior hour, and the history step's bearing ends where its Q is pressed.
import { describe, expect, it } from "vitest";
import { DT, MOCK_SIG } from "./constants";
import { POSITIONS, districtAt } from "./map";
import { F } from "./content/ids";
import type { Player, WorldState } from "./types";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { applyAction } from "./actions";
import { promptFor, snapshotFor } from "./snapshot";

function put(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}
const me = (w: WorldState) => w.players.get("g")!;
function goTo(w: WorldState, at: string): WorldState {
  const pos = POSITIONS[at];
  return put(w, { ...me(w), x: pos.x, y: pos.y, district: districtAt(pos.x, pos.y) });
}

describe("a guest's own first hour is not its serial's prior hour", () => {
  it("closing Nara's plot as a guest and then linking leaves no wreckage in the Care", () => {
    let w = put(emptyWorld(), { ...spawnGuest("g", 0), flags: { [F.MEMORIAL]: 1 } });
    w = goTo(w, "nara-plot");
    w = applyAction(w, "g", { t: "interact", targetId: "nara-plot", choice: "bury" });
    expect(me(w).history.buried).toBe(1);
    w = applyAction(w, "g", { t: "link", serial: 42, sig: MOCK_SIG });
    expect(w.history.find(m => m.serial === 42)).toBeUndefined();
  });

  it("nor does a guest felled once in the first hour", () => {
    let w = put(emptyWorld(), { ...spawnGuest("g", 0), deaths: 1 });
    w = applyAction(w, "g", { t: "link", serial: 43, sig: MOCK_SIG });
    expect(w.history.find(m => m.serial === 43)).toBeUndefined();
  });

  it("a body that was an Angel before brings its prior hour, and the history step's bearing ends where Q faces it", () => {
    let w = put(emptyWorld(), { ...spawnGuest("g", 0), history: { passings: 0, buried: 1, looted: 0, houses: ["sky"], outcomes: [] } });
    w = applyAction(w, "g", { t: "link", serial: 42, sig: MOCK_SIG });
    expect(w.history.find(m => m.serial === 42)).toBeDefined();
    const flags = { ...me(w).flags, [F.UNDER]: 1, [F.CARE]: 1, [F.SHRINE]: 1, [F.TALKED_SEXTON]: 1, [F.HALL]: 1, [F.TALKED_OFFICER]: 1, [F.FREEZE]: 1, [F.TITHE]: 1 };
    w = put(w, { ...me(w), flags, movement: 2, quests: { "m1-diagnosis": 15, "m2-techno-feudal": 6 } });
    w = tickWorld(w, DT);
    const o = snapshotFor(w, "g").objective!;
    expect(o.step).toBe("history");
    const t = o.target!;
    w = put(w, { ...me(w), x: t.x, y: t.y, district: districtAt(t.x, t.y) });
    expect(promptFor({ w, p: me(w), now: w.now })?.verbs.map(v => v.choice)).toContain("history");
  });
});
