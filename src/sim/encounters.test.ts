import { describe, expect, it } from "vitest";
import { CLERK_AGGRO, CLERK_DAMAGE, CLERK_HP, CLERK_TELEGRAPH } from "./campaign";
import { CLERK_RECOVERY, INTAKE, INTAKE_RECOVERY, refreshIntake } from "./encounters";
import { circleHitsWalls } from "./nave";
import { nextObjective } from "./journal";
import { applyHeavy, applyStrike, emptyWorld, spawnGuest, STRIKE_COOLDOWN, tickClerks, tickWorld, type WorldState } from "./world";

const newcomer = (id: string) => ({ ...spawnGuest(id), x: INTAKE.x - 30, y: INTAKE.y });
function strike(w: WorldState, id: string) {
  w.players.set(id, { ...w.players.get(id)!, strikeCd: 0 });
  return applyStrike(w, id);
}

describe("arrival encounter", () => {
  it("provides one relief shift after the named clerks are gone, with no spawn on top of the guest", () => {
    let w = emptyWorld();
    w.clerks = [];
    w.players.set("a", spawnGuest("a"));
    w.players.set("b", spawnGuest("b"));
    w = tickWorld(w, .05);
    expect(w.clerks.map(c => c.id)).toEqual([INTAKE.id]);
    expect(refreshIntake(w).clerks).toHaveLength(1);
    expect(circleHitsWalls(INTAKE.x, INTAKE.y)).toBe(false);
    expect(Math.hypot(spawnGuest("a").x - INTAKE.x, spawnGuest("a").y - INTAKE.y)).toBeGreaterThan(CLERK_AGGRO);
  });

  it("credits both participants, never a spectator, and waits before serving the next arrival", () => {
    let w = emptyWorld(); w.clerks = [];
    for (const id of ["a", "b", "spectator"]) w.players.set(id, newcomer(id));
    w = refreshIntake(w);
    const before = w.players.get("a")!;
    w = strike(w, "a");
    w = strike(w, "b");
    w = strike(w, "b");
    w = strike(w, "b");
    expect(w.clerks).toHaveLength(0);
    for (const id of ["a", "b"]) {
      expect(w.players.get(id)!.openingCombat).toBe(true);
      expect(nextObjective(w.players.get(id)!).id).toBe("meet-nara");
    }
    expect(w.players.get("spectator")!.openingCombat).toBeUndefined();
    for (const field of ["hp", "bestand", "banked", "winke", "aura", "readiness"] as const) {
      expect(w.players.get("a")![field]).toBe(before[field]);
    }
    expect(refreshIntake({ ...w, now: INTAKE_RECOVERY - .01 }).clerks).toHaveLength(0);
    // Saved world data retains the recovery deadline and personal credit.
    w = refreshIntake({ ...structuredClone(w), now: INTAKE_RECOVERY });
    expect(w.clerks).toHaveLength(1);
    expect(w.clerks[0].hp).toBe(CLERK_HP * 2);
    expect(w.players.get("a")!.openingCombat).toBe(true);
    expect(w.clerks[0].participants).toBeUndefined();
    w.players.delete("spectator"); w.clerks = [];
    expect(refreshIntake(w).clerks).toHaveLength(0);
  });

  it("resets abandoned combat and participation, and does not mistake practice for completion", () => {
    let w = emptyWorld(); w.clerks = [];
    w.players.set("a", newcomer("a"));
    w = strike(refreshIntake(w), "a");
    w.players.set("a", { ...w.players.get("a")!, x: 1000, y: 480 });
    w = tickClerks(w, .05);
    expect(w.clerks[0]).toMatchObject({ hp: CLERK_HP * 2, telegraph: 0, participants: [] });
    w.players.set("a", newcomer("a"));
    w.clerks = [{ ...INTAKE, name: "Practice", hp: 1, telegraph: 0, dummy: true }];
    expect(strike(w, "a").players.get("a")!.openingCombat).toBeUndefined();
  });
});

describe("readable clerk attacks", () => {
  it("holds its target, misses without retargeting, and cannot attack during recovery", () => {
    let w = emptyWorld(); w.clerks = [];
    w.players.set("a", newcomer("a"));
    w = tickClerks(refreshIntake(w), .05);
    expect(w.clerks[0]).toMatchObject({ targetId: "a", telegraph: CLERK_TELEGRAPH });
    w.players.set("a", { ...newcomer("a"), x: INTAKE.x - 100 });
    w.players.set("b", newcomer("b"));
    w = tickClerks(w, CLERK_TELEGRAPH);
    expect(w.players.get("b")!.hp).toBe(100);
    expect(w.clerks[0]).toMatchObject({ recovery: CLERK_RECOVERY, telegraph: 0 });
    w = tickClerks(w, CLERK_RECOVERY);
    expect(w.clerks[0].telegraph).toBe(0);
    w = tickClerks(w, .05);
    expect(w.clerks[0].targetId).toBe("b");
    w = tickClerks(w, CLERK_TELEGRAPH);
    expect(w.players.get("b")!.hp).toBe(100 - CLERK_DAMAGE);
  });

  it("heavy interrupts into recovery; a later miss cannot borrow an old hit's connection", () => {
    let w = emptyWorld(); w.clerks = [];
    w.players.set("a", newcomer("a"));
    w = tickClerks(refreshIntake(w), .05);
    w = applyHeavy(w, "a");
    expect(w.clerks[0]).toMatchObject({ telegraph: 0, recovery: CLERK_RECOVERY });
    w = tickClerks(w, .1);
    expect(w.players.get("a")!.hp).toBe(100);
    w.players.set("a", { ...w.players.get("a")!, x: 1000, strikeCd: 0 });
    expect(applyHeavy(w, "a").players.get("a")!.strikeCd).toBe(STRIKE_COOLDOWN);
  });

  it("keeps personal encounter progress through death, and excludes locked targets", () => {
    let w = emptyWorld();
    w.players.set("a", { ...newcomer("a"), openingCombat: true, hp: 1 });
    w.clerks = [{ ...INTAKE, name: "Intake Clerk", hp: 88, telegraph: .01, targetId: "a" }];
    expect(tickClerks(w, .05).players.get("a")!.openingCombat).toBe(true);
    w.players.set("a", { ...newcomer("a"), locked: true });
    expect(tickClerks(w, .05).players.get("a")!.hp).toBe(100);
    expect(applyStrike(w, "a")).toBe(w);
    expect(applyHeavy(w, "a")).toBe(w);
  });
});

it.each([[true, true], [true, false], [false, true]])("protects guests in both directions (attacker guest %s, defender guest %s)", (aGuest, bGuest) => {
  const w = emptyWorld(); w.clerks = [];
  w.players.set("a", { ...newcomer("a"), guest: aGuest });
  w.players.set("b", { ...newcomer("b"), guest: bGuest });
  const after = applyStrike(w, "a");
  expect(after.players.get("b")!.hp).toBe(100);
  expect(after.wreckage).toHaveLength(0);
});
