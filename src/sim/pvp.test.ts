import { describe, expect, it } from "vitest";
import { GUEST_ARENA, TRUCE_HOLD, WET_GRID, arenaDummy } from "./campaign";
import { PRACTICE_RADIUS, PRACTICE_SAFE, PVP_FLAG_REQUIRED, TRUCE_ACTIVE } from "./pvp";
import { applyBracket, applyFlag, applyHeavy, applySeason, applyStrike, applyTruce, emptyWorld, spawnGuest, tickWorld, type Player } from "./world";

const angel = (id: string, extra: Partial<Player> = {}): Player => ({ ...spawnGuest(id), guest: false, flagged: true, x: 200, y: 480, ...extra, id });
function pair(a: Partial<Player> = {}, b: Partial<Player> = {}) {
  const w = emptyWorld(); w.clerks = [];
  w.players.set("a", angel("a", a));
  w.players.set("b", angel("b", { x: 220, bestand: 100, banked: 50, fakeWinke: 2, cultWink: true, ...b }));
  return w;
}

describe("PvP consent and sanctuary", () => {
  it.each([[false, false], [true, false], [false, true]])("blocks unflagged contact including Storm and graves (%s / %s)", (aFlag, bFlag) => {
    let w = pair({ flagged: aFlag, storm: true }, { flagged: bFlag, hp: 20 });
    w.wreckage = [{ id: "grave", x: 210, y: 480, fromId: "old", fromName: "Angel", until: 40 }];
    const before = structuredClone(w);
    for (let i = 0; i < 100; i++) {
      w.players.set("a", { ...w.players.get("a")!, strikeCd: 0 });
      w = i % 2 ? applyHeavy(w, "a") : applyStrike(w, "a");
    }
    expect(w.players.get("b")).toEqual(before.players.get("b"));
    expect(w.players.get("a")!.bestand).toBe(0);
    expect(w.players.get("a")!.heard).toBe(PVP_FLAG_REQUIRED);
    expect(w.wreckage).toEqual(before.wreckage);
    expect(w.gestell).toBe(before.gestell);
    expect(w.hitStopHeld).toBe(false);
    expect(w.stormPressHeld).toBe(false);
  });

  it.each(["a", "b"])("honors a saved active truce on %s even with stale flags", id => {
    let w = pair(); w.now = 5;
    w.players.set(id, { ...w.players.get(id)!, truceUntil: 6 });
    w = structuredClone(w);
    expect(applyHeavy(w, "a").players.get("b")!.hp).toBe(100);
    expect(applyStrike(w, "a").players.get("a")!.heard).toBe(TRUCE_ACTIVE);
    w.now = 6;
    expect(applyStrike(w, "a").players.get("b")!.hp).toBe(78);
  });

  it.each(["a", "b"])("protects either side of the practice boundary (%s inside), while the dummy works", id => {
    const inside = { x: GUEST_ARENA.x + PRACTICE_RADIUS - 1, y: GUEST_ARENA.y };
    const outside = { x: GUEST_ARENA.x + PRACTICE_RADIUS + 1, y: GUEST_ARENA.y };
    let w = pair(id === "a" ? inside : outside, id === "b" ? inside : outside);
    expect(applyHeavy(w, "a").players.get("b")!.hp).toBe(100);
    expect(applyStrike(w, "a").players.get("a")!.heard).toBe(PRACTICE_SAFE);
    w = pair({ x: GUEST_ARENA.x, y: GUEST_ARENA.y + 40 }, { x: GUEST_ARENA.x + 10, y: GUEST_ARENA.y + 40 });
    w.clerks = [arenaDummy()];
    const after = applyHeavy(w, "a");
    expect(after.players.get("b")!.hp).toBe(100);
    expect(after.clerks[0].hp).toBe(w.clerks[0].hp - 22);
  });

  it("damages only the flagged opponent in a mixed group and preserves spoils", () => {
    const w = pair({}, { hp: 20 });
    w.players.set("witness", angel("witness", { flagged: false, x: 215 }));
    const after = applyStrike(w, "a");
    expect(after.players.get("witness")).toEqual(w.players.get("witness"));
    expect(after.players.get("a")!.bestand).toBe(30);
    expect(after.players.get("b")!).toMatchObject({ hp: 100, bestand: 70, banked: 50, cultWink: true });
    expect(after.wreckage).toHaveLength(1);
  });

  it.each([false, true])("makes both versions of the truce protect immediately (legacy %s)", legacy => {
    let w = pair(WET_GRID, { x: WET_GRID.x + 16, y: WET_GRID.y });
    w.flagPeopleHeld = legacy;
    w = applyTruce(w, "a");
    for (const id of ["a", "b"]) expect(w.players.get(id)).toMatchObject({ flagged: false, truceUntil: TRUCE_HOLD });
    expect(applyFlag(w, "a").players.get("a")!).toMatchObject({ flagged: false, heard: TRUCE_ACTIVE });
    expect(applyHeavy(w, "a").players.get("b")!.hp).toBe(100);
    w = tickWorld({ ...w, now: TRUCE_HOLD }, .05);
    expect(w.players.get("a")!.flagged).toBe(false);
    w = applyFlag(w, "a");
    expect(applyStrike(w, "a").players.get("b")!.hp).toBe(100);
    w = applyFlag(w, "b");
    expect(applyStrike(w, "a").players.get("b")!.hp).toBe(78);
  });

  it("requires explicit flags even after high climate, season and bracket progress", () => {
    let w = pair({ ...WET_GRID, flagged: false }, { x: WET_GRID.x + 16, y: WET_GRID.y, flagged: false });
    w.gestell = 100; w.creditsHeld = true;
    w = applySeason(w, "a");
    w = applyBracket(w, "a");
    w = applySeason(w, "a");
    w = tickWorld(w, .05);
    expect(w.players.get("a")!.flagged).toBe(false);
    expect(w.players.get("b")!.flagged).toBe(false);
    w = applyFlag(w, "a");
    expect(w.players.get("a")!.flagged).toBe(true);
  });

  it("refuses remote, locked and guest flag requests", () => {
    for (const extra of [{ x: 200, y: 480 }, { ...WET_GRID, guest: true }, { ...WET_GRID, locked: true }]) {
      const w = pair({ ...extra, flagged: false });
      expect(applyFlag(w, "a").players.get("a")!.flagged).toBe(false);
    }
  });
});
