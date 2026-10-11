// The player-defect sweep, round twelve (2026-10-11): three bodies on one shared place in sequence. (The review of the
// bodies that stand in a fight their socket left is held in server/src/leave.test.ts.)
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { DT } from "./constants";
import { POSITIONS, districtAt } from "./map";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { applyAction } from "./actions";
import { questById } from "./quests";
import { C, F, Q, W } from "./content/ids";
import { SF, SQ } from "./content/side";
import { openNode } from "./dialogue";

function body(w: WorldState, id: string, at: { x: number; y: number }, patch: Partial<Player> = {}): WorldState {
  const players = new Map(w.players);
  const serial = 40 + players.size;
  players.set(id, { ...spawnGuest(id, w.now), guest: false, serial, name: `#00${serial}`, house: "mortals", aura: 20, auraSeed: 12, restraint: 60, x: at.x, y: at.y, district: districtAt(at.x, at.y), flags: { [F.ANGEL]: 1, [F.UNDER]: 1 }, ...patch, ...(patch.flags ? {} : {}) });
  return { ...w, players };
}
const me = (w: WorldState, id: string): Player => w.players.get(id)!;
const ticks = (w: WorldState, n: number) => { for (let i = 0; i < n; i++) w = tickWorld(w, DT); return w; };
const stepIdx = (q: string, s: string) => questById(q)!.steps.findIndex(x => x.id === s);
const M2 = { [F.ANGEL]: 1, [F.UNDER]: 1, [F.SHRINE]: 1, [F.CARE]: 1, [F.TALKED_SEXTON]: 1, [F.HALL]: 1, [F.TALKED_OFFICER]: 1, [F.FREEZE]: 1, [F.TITHE]: 1, [F.HISTORY]: 1, [F.BOARD]: 1, [F.OPERATOR]: 1, [F.M3]: 1 };

describe("a crowd at one place: Ord's after-map line", () => {
  it("does not tell a body it refused the Strait when another body did", () => {
    const strait = POSITIONS["organ-strait"];
    let w = body(emptyWorld(), "a", strait, { movement: 3, flags: { ...M2 } });
    w = body(w, "b", strait, { movement: 3, flags: { ...M2, [F.STRAIT]: 1, [F.FOUNDRY]: 1, [F.CABLE]: 1, [F.MAP]: 1 }, choices: { [C.MAP]: "cable" } });
    w = body(w, "c", strait, { movement: 3, flags: { ...M2, [F.STRAIT]: 1, [F.FOUNDRY]: 1, [F.CABLE]: 1, [F.MAP]: 1 }, choices: { [C.MAP]: "whole" } });
    w = applyAction(w, "a", { t: "interact", targetId: "organ-strait", choice: "refuse" });
    expect(w.pois["organ-strait"]?.state).toBe("refused");
    for (const id of ["b", "c"]) {
      const t = me(openNode(w, id, "ord", "after-map"), id).dialogue?.text ?? "";
      expect(t, id).not.toContain("You refused the water");
      expect(t, id).toContain("Someone refused the water");
    }
  });
});

describe("a crowd at one place: the buried garden", () => {
  it("a second body's garden step is not finished by watching ground another buried while Nara still waits on its burial", () => {
    const g = POSITIONS["wreckage-garden"];
    const m3 = (garden: number) => ({ movement: 3, quests: { [Q.M3]: garden }, flags: { ...M2, [F.STRAIT]: 1, [F.FOUNDRY]: 1, [F.CABLE]: 1, [F.MAP]: 1 } });
    const gi = stepIdx(Q.M3, "garden");
    let w = body(emptyWorld(), "a", g, { ...m3(gi), choices: { [C.OPERATOR]: "refuse" } });
    w = body(w, "b", g, { ...m3(gi), choices: { [C.OPERATOR]: "take" }, party: { ...spawnGuest("x", 0).party, nara: "waiting" } });
    w = applyAction(w, "a", { t: "interact", targetId: "wreckage-garden", choice: "bury" });
    expect(w.flags[W.GARDEN_BURIED]).toBe(1);
    w = applyAction(w, "b", { t: "interact", targetId: "wreckage-garden", choice: "watch" });
    w = ticks(w, 2);
    const b = me(w, "b");
    const advanced = (b.quests[Q.M3] ?? 0) > gi;
    const naraText = me(openNode(w, "b", "nara", "garden-silent"), "b").dialogue?.text ?? "";
    expect(advanced && !(b.flags[F.GARDEN] ?? 0), `B's garden step done by watching; Nara: ${naraText}`).toBe(false);
  });

  it("a Movement I Angel keeps watch on ground another buried and is told the Clearing will take it", () => {
    const g = POSITIONS["wreckage-garden"];
    let w = body(emptyWorld(), "c", g, { movement: 1, flags: { [F.ANGEL]: 1, [F.UNDER]: 1 } });
    w = { ...w, flags: { ...w.flags, [W.GARDEN_BURIED]: 1 } };
    const r0 = me(w, "c").readiness;
    w = applyAction(w, "c", { t: "interact", targetId: "wreckage-garden", choice: "watch" });
    expect(me(w, "c").flags[F.MORTALITY] ?? 0).toBe(0);
    expect(me(w, "c").readiness).toBe(r0);
    // a fourth-hour Angel keeps watch on the same ground: the act is its own
    w = body(w, "d", g, { movement: 4, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.GARDEN]: 1 } });
    w = applyAction(w, "d", { t: "interact", targetId: "wreckage-garden", choice: "watch" });
    expect(me(w, "d").flags[F.MORTALITY]).toBe(1);
  });
});

describe("a crowd at one place: the vacant desk", () => {
  it("the desk's closing is news once for the city, not once per body", () => {
    const d = POSITIONS["operator-desk"];
    let w = emptyWorld();
    w = { ...w, flags: { ...w.flags, [W.VESPER_GONE]: 1 } };
    for (const id of ["a", "b", "c"]) w = body(w, id, d, { movement: 3, quests: { [SQ.DESK]: 0 }, flags: { ...M2, [`side:offer:${SQ.DESK}`]: 1 } });
    for (const id of ["a", "b", "c"]) {
      w = applyAction(ticks(w, 1), id, { t: "interact", targetId: "operator-desk", choice: "side:desk:read" });
      w = ticks(w, 1);
      w = applyAction(w, id, { t: "interact", targetId: "operator-desk", choice: "side:desk:close" });
      w = ticks(w, 1);
      expect(me(w, id).flags[SF.DESK_CLOSED], id).toBe(1);
    }
    const n = w.news.filter(x => x.text.startsWith("Someone closed the Concentrator's desk")).length;
    expect(n).toBe(1);
  });
});
