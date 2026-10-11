// The player-defect sweep, round eleven (2026-10-11): a body whose Winke stay dark for a stretch, then lighten; a verb or
// choice pressed again on a later step. (A body that leaves a fight it is losing is held in server/src/leave.test.ts.)
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { DT, MOCK_SIG } from "./constants";
import { POSITIONS, districtAt } from "./map";
import { canSeeWink, emptyWorld, spawnGuest, tickWorld } from "./world";
import { npcView } from "./snapshot";
import { applyAction, applyLink, unsealBody } from "./actions";
import { questById } from "./quests";
import { F, Q } from "./content/ids";
import { SF, SQ } from "./content/side";
import { openNode } from "./dialogue";

function body(w: WorldState, id: string, at: { x: number; y: number }, patch: Partial<Player> = {}): WorldState {
  const players = new Map(w.players);
  const serial = 40 + players.size;
  players.set(id, { ...spawnGuest(id, w.now), guest: false, serial, name: `#00${serial}`, house: "mortals", aura: 20, auraSeed: 12, restraint: 60, x: at.x, y: at.y, district: districtAt(at.x, at.y), flags: { [F.ANGEL]: 1, [F.UNDER]: 1 }, ...patch });
  return { ...w, players };
}
const me = (w: WorldState, id = "a"): Player => w.players.get(id)!;
const len = (q: string) => questById(q)!.steps.length;
const ticks = (w: WorldState, n: number) => { for (let i = 0; i < n; i++) w = tickWorld(w, DT); return w; };

const M2_DONE = { [F.ANGEL]: 1, [F.UNDER]: 1, [F.SHRINE]: 1, [F.CARE]: 1, [F.TALKED_SEXTON]: 1, [F.HALL]: 1, [F.TALKED_OFFICER]: 1, [F.FREEZE]: 1, [F.TITHE]: 1, [F.HISTORY]: 1, [F.BOARD]: 1, [F.OPERATOR]: 1, [F.M3]: 1 };

/** A body that played all of Movement II in Storm (restraint spent: Winke dark), the hour then closing. */
function darkThroughTwo(): WorldState {
  let w = body(emptyWorld(), "a", POSITIONS["care-shrine"], {
    movement: 2, stance: "storm", restraint: 0, flags: M2_DONE,
    quests: { [Q.M1]: len(Q.M1), [Q.M2]: 0 },
  });
  w = ticks(w, 3);
  return w;
}

describe("a body whose Winke stay dark", () => {
  it("dark through all of Movement II, hears the waking hint once its Winke lighten in Movement III", () => {
    let w = darkThroughTwo();
    expect(me(w).movement).toBe(3);
    expect(me(w).flags[F.WAKING] ?? 0).toBe(0);
    w = applyAction(w, "a", { t: "stance" });
    w = ticks(w, Math.ceil(200 / DT));
    expect(canSeeWink(me(w), w.now, w.gestell)).toBe(true);
    expect(me(w).flags[F.WAKING] ?? 0).toBe(1);
  });

  it("Quill and Caul do not speak of a waking hint the body never heard", () => {
    let w = body(emptyWorld(), "a", { x: 0, y: 0 }, { movement: 3, flags: { ...M2_DONE } });
    const quill = openNode(w, "a", "quill", "forge-lesson");
    expect(me(quill).dialogue?.text).not.toContain("the one you woke to");
    const caul = openNode(w, "a", "caul", "looked");
    expect(me(caul).dialogue?.choices.map(c => c.id)).not.toContain("told");
    w = body(w, "a", { x: 0, y: 0 }, { ...me(w), flags: { ...me(w).flags, [F.WAKING]: 1 } });
    expect(me(openNode(w, "a", "quill", "forge-lesson")).dialogue?.text).toContain("the one you woke to");
    expect(me(openNode(w, "a", "caul", "looked")).dialogue?.choices.map(c => c.id)).toContain("told");
  });

  it("the Care restore promises a Wink only to a body that can hold one after it", () => {
    const at = POSITIONS["care-shrine"];
    const flags = { [F.ANGEL]: 1, [F.UNDER]: 1, [F.WAKING]: 1 };
    for (const patch of [{ aura: 0 }, { aura: 10, restraint: 5, stance: "storm" as const }]) {
      let w = body(emptyWorld(), "a", at, { movement: 2, bestand: 50, flags, ...patch });
      w = applyAction(w, "a", { t: "interact", targetId: "care-shrine", choice: "restore" });
      expect(me(w).bestand).toBeLessThan(50);
      expect(canSeeWink(me(w), w.now, w.gestell)).toBe(false);
      expect(me(w).heard).not.toContain("The Wink can be held again");
    }
    let w = body(emptyWorld(), "a", at, { movement: 2, bestand: 50, aura: 20, flags });
    w = applyAction(w, "a", { t: "interact", targetId: "care-shrine", choice: "restore" });
    expect(me(w).heard).toContain("The Wink can be held again");
  });
});

describe("pressed again on a later step", () => {
  const moveTo = (w: WorldState, at: { x: number; y: number }): WorldState => body(w, "a", at, { ...me(w), x: at.x, y: at.y, district: districtAt(at.x, at.y) });
  const wait = (w: WorldState) => applyAction(ticks(w, 1), "a", { t: "interact", targetId: "hour-bell", choice: "side:hour:wait" });

  it("the hour bell strikes on three waits in one stay, and a body that left between starts its waits over", () => {
    const bell = POSITIONS["hour-bell"];
    const start = (): WorldState => body(emptyWorld(), "a", bell, { movement: 1, quests: { [SQ.HOUR]: 0 }, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [`side:offer:${SQ.HOUR}`]: 1 } });
    let w = wait(wait(wait(start())));
    w = ticks(w, 2);
    expect(w.pois["hour-bell"]?.state, "three in one stay").toBe("struck");
    w = wait(start());
    w = ticks(moveTo(w, POSITIONS["care-shrine"]), 5);
    expect(me(w).flags[SF.HOUR_WAITED] ?? 0, "left: the count is gone").toBe(0);
    w = wait(wait(moveTo(w, bell)));
    w = ticks(w, 2);
    expect(w.pois["hour-bell"]?.state ?? "still").not.toBe("struck");
    expect(me(w).flags[SF.HOUR_WAITED]).toBe(2);
  });

  it("an Angel unsealed and linked again keeps the aura it had: a relink is not a free restore", () => {
    let w = body(emptyWorld(), "a", POSITIONS["care-shrine"], { movement: 2 });
    w = { ...w, players: new Map(w.players).set("a", { ...me(w), guest: true, serial: null, name: "GUEST", house: "", flags: { [F.UNDER]: 1 } }) };
    w = applyLink(w, "a", 42, MOCK_SIG);
    const seed = me(w).auraSeed;
    expect(me(w).aura, "a first link lifts the aura to its seed").toBeGreaterThanOrEqual(seed);
    w = { ...w, players: new Map(w.players).set("a", { ...me(w), aura: 1 }) };
    w = { ...w, players: new Map(w.players).set("a", unsealBody(me(w), w.now)) };
    w = applyAction(ticks(w, 1), "a", { t: "link", serial: 42, sig: MOCK_SIG });
    expect(me(w).serial).toBe(42);
    expect(me(w).aura).toBeLessThan(seed);
  });
});
