// The player-defect sweep, round eighteen (2026-10-12): fights at their edges. Each case is one finding, reproduced through
// the real reducers.
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { DT, HEAVY_DAMAGE, MAX_HP, WRECKAGE_TTL } from "./constants";
import { POSITIONS, districtAt } from "./map";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { applyAction } from "./actions";
import { snapshotFor } from "./snapshot";
import { questById, tickQuests } from "./quests";
import { applyInteract } from "./interact";
import { C, F, Q } from "./content/ids";
import { SF, SQ } from "./content/side";

function body(w: WorldState, id: string, at: { x: number; y: number }, patch: Partial<Player> = {}): WorldState {
  const players = new Map(w.players);
  const serial = 40 + players.size;
  players.set(id, { ...spawnGuest(id, w.now), guest: false, serial, name: `#00${serial}`, house: "earth", x: at.x, y: at.y, district: districtAt(at.x, at.y), flags: { [F.ANGEL]: 1, [F.UNDER]: 1 }, ...patch });
  return { ...w, players };
}
const me = (w: WorldState, id: string): Player => w.players.get(id)!;
const street = POSITIONS["stall-3"];

function dueling(): WorldState {
  let w: WorldState = { ...emptyWorld(), enemies: [] };
  w = body(w, "a", street, { flagged: true, facing: { dx: 1, dy: 0 } });
  w = body(w, "b", { x: street.x + 30, y: street.y }, { flagged: true, facing: { dx: -1, dy: 0 } });
  const grave = { id: "old", x: street.x + 15, y: street.y + 20, district: districtAt(street.x, street.y), fromId: "z", fromName: "#0009", fromSerial: 9, killerId: "", at: 0, until: w.now + WRECKAGE_TTL, buried: false, looted: false, bestand: 0, items: [] };
  w = { ...w, wreckage: [grave] };
  w = applyAction(w, "a", { t: "interact", targetId: "b", choice: "duel" });
  w = applyAction(w, "b", { t: "interact", targetId: "a", choice: "duel" });
  expect(me(w, "a").duel?.accepted).toBe(true);
  return w;
}

describe("a heavy trade in one tick", () => {
  it("a body felled by a heavy does not swing its own from where it wakes", () => {
    const wake = { x: street.x + 400, y: street.y, district: districtAt(street.x + 400, street.y) };
    let w: WorldState = { ...emptyWorld(), enemies: [] };
    w = body(w, "a", street, { flagged: true, facing: { dx: 1, dy: 0 }, hp: HEAVY_DAMAGE });
    w = body(w, "b", { x: street.x + 30, y: street.y }, { flagged: true, facing: { dx: -1, dy: 0 }, hp: HEAVY_DAMAGE, respawn: wake });
    w = body(w, "c", { x: wake.x - 30, y: wake.y }, { flagged: true });
    w = applyAction(w, "a", { t: "heavy" });
    w = applyAction(w, "b", { t: "heavy" });
    for (let i = 0; i < 10; i++) w = tickWorld(w, DT);
    expect(me(w, "b").deaths).toBe(1);
    expect(me(w, "c").hp, "the bystander where b wakes").toBe(MAX_HP);
  });
});

describe("a duel with its flags down", () => {
  it("lowering the flag ends the duel for both, so the ring does not stand as a shield", () => {
    let w = dueling();
    w = applyAction(w, "b", { t: "flag" });
    expect(me(w, "b").flagged).toBe(false);
    expect(me(w, "b").duel).toBeUndefined();
    expect(me(w, "a").duel).toBeUndefined();
    expect(me(w, "a").notices.some(n => n.text.includes("The duel is over"))).toBe(true);
  });

  it("a truce between duelists ends the duel too", () => {
    let w = dueling();
    w = applyAction(w, "a", { t: "truce" });
    expect(me(w, "a").duel).toBeUndefined();
    expect(me(w, "b").duel).toBeUndefined();
  });

  it("both flags lowered after a duel: the meltdown street's weather reaches them", () => {
    let w = dueling();
    w = applyAction(w, "a", { t: "flag" });
    w = applyAction(w, "b", { t: "flag" });
    w = { ...w, gestell: 95 };
    w = body(w, "c", { x: street.x - 30, y: street.y }, { facing: { dx: 1, dy: 0 } });
    w = applyAction(w, "c", { t: "strike" });
    expect(me(w, "a").hp).toBeLessThan(MAX_HP);
  });
});

describe("the going-under in a warm fight", () => {
  it("an Angel whose flag is held past a blow cannot step under it to full health; the threshold says why", () => {
    const under = POSITIONS["going-under"];
    let w: WorldState = { ...emptyWorld(), enemies: [] };
    w = body(w, "v", under, { flagged: true, hp: 30, facing: { dx: -1, dy: 0 }, flags: { [F.ANGEL]: 1, [F.WEATHER_NAMED]: 1, [F.BURIED_NARA]: 1 }, quests: { [Q.M1]: questById(Q.M1)!.steps.findIndex(s => s.id === "going-under") } });
    w = body(w, "k", { x: under.x + 30, y: under.y }, { flagged: true, facing: { dx: -1, dy: 0 } });
    w = applyAction(w, "k", { t: "strike" });
    expect(me(w, "v").flagHeldUntil ?? 0).toBeGreaterThan(w.now);
    w = applyAction(w, "v", { t: "interact", targetId: "going-under", choice: "under" });
    expect(me(w, "v").district).not.toBe("care");
    expect(me(w, "v").flags[F.UNDER]).toBeUndefined();
    w = applyAction(w, "v", { t: "interact", targetId: "going-under", choice: "look" });
    expect(me(w, "v").heard).toContain("Nobody goes under with a blow owed");
  });
});

const stepIdx = (q: string, s: string) => questById(q)!.steps.findIndex(x => x.id === s);
const on = (...keys: string[]) => Object.fromEntries(keys.map(k => [k, 1]));
function standAt(w: WorldState, id: string, at: string): WorldState {
  const pos = POSITIONS[at];
  const players = new Map(w.players);
  players.set(id, { ...me(w, id), x: pos.x, y: pos.y + 20, district: districtAt(pos.x, pos.y + 20), dialogue: null });
  return { ...w, players };
}
const press = (w: WorldState, at: string, choice: string) => tickQuests(applyInteract(standAt(w, "me", at), "me", at, choice), "me");

describe("the second hour's desks in the first", () => {
  const early = [F.ARRIVED, F.INTAKE, F.FIRST_NODE, F.DESK_THREE, F.SECOND_NODE, F.TALKED_QUILL, F.TALKED_ORD];
  function m1(): WorldState {
    return body(emptyWorld(), "me", POSITIONS["hall-sky"], { house: "sky", bestand: 40, movement: 1, flags: on(F.ANGEL, ...early), quests: { [Q.M1]: stepIdx(Q.M1, "nara") } });
  }

  it("a first-hour Angel reading its hall lights it but cannot decide Vesper's offer, so Nara stays on her street", () => {
    let w = press(m1(), "hall-sky", "read");
    expect(w.pois["hall-sky"]?.state).toBe("lit");
    expect(me(w, "me").flags[F.HALL]).toBeUndefined();
    w = standAt(w, "me", "operator-desk");
    const verbs = snapshotFor(w, "me").prompt!.verbs.map(v => v.choice);
    expect(verbs).toEqual(["look"]);
    for (const choice of ["take", "refuse"]) w = press(w, "operator-desk", choice);
    expect(me(w, "me").flags[F.OPERATOR]).toBeUndefined();
    w = press(w, "operator-desk", "look");
    expect(me(w, "me").heard).toContain("gone under");
    expect(snapshotFor(w, "me").objective?.target?.district).toBe("nave");
  });

  it("nor sign the freeze, which hands the Officer's grief hour out in the first", () => {
    let w = press(m1(), "hall-sky", "read");
    w = press(w, "safety-desk", "sign");
    expect(me(w, "me").flags[F.FREEZE]).toBeUndefined();
  });

  it("read in the second hour, the hall still opens the desk", () => {
    let w = body(emptyWorld(), "me", POSITIONS["hall-sky"], { house: "sky", movement: 2 });
    w = press(w, "hall-sky", "read");
    expect(me(w, "me").flags[F.HALL]).toBe(1);
  });
});

describe("the journal's keys at the window and the plaque", () => {
  it("Form 9 waits on the tax hour's E and says so", () => {
    let w = body(emptyWorld(), "me", POSITIONS["tax-window"], {
      house: "sky", movement: 2, flags: on(F.ANGEL, F.UNDER, F.HALL, F.FREEZE, F.TITHE, SF.FORM9_ASKED),
      choices: { [C.FREEZE]: "signed" }, quests: { [SQ.FORM9]: 1, [SQ.TAX]: 0 },
    });
    w = standAt(w, "me", "tax-window");
    const form9 = snapshotFor(w, "me").sideObjectives.find(s => s.quest === SQ.FORM9)!;
    expect(form9.detail).not.toContain("Press E to pay the freeze fee and file it");
    expect(form9.detail).toContain("once your tax hour there is done");
  });

  it("the clerks' names wait for the weather's, and the journal says so", () => {
    let w = body(emptyWorld(), "me", POSITIONS["safety-plaque"], { movement: 1, flags: on(F.ANGEL), quests: { [SQ.DOING_A_JOB]: 1 } });
    const job = snapshotFor(w, "me").sideObjectives.find(s => s.quest === SQ.DOING_A_JOB)!;
    expect(job.detail).toContain("until the weather has a name there");
  });
});
