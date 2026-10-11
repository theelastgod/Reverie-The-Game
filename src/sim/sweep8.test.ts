// The player-defect sweep, round eight (2026-10-11): many messages in one step, where bodies can stand, boundary values,
// the idle body, the client under degraded conditions, and text proofed over real state. Each case is one finding,
// reproduced through the real reducers and held with the real content.
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { DESCENT_WINDOW, DT, TILE } from "./constants";
import { POSITIONS, districtAt } from "./map";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { applyAction } from "./actions";
import { npcView, snapshotFor } from "./snapshot";
import { C, F, W, seasonPassingFlag } from "./content/ids";

function body(w: WorldState, id: string, at: { x: number; y: number }, patch: Partial<Player> = {}): WorldState {
  const players = new Map(w.players);
  const serial = 40 + players.size;
  players.set(id, { ...spawnGuest(id, w.now), guest: false, serial, name: `#00${serial}`, house: "mortals", aura: 20, restraint: 60, x: at.x, y: at.y, district: districtAt(at.x, at.y), flags: { [F.ANGEL]: 1, [F.UNDER]: 1 }, ...patch });
  return { ...w, players };
}
const me = (w: WorldState, id = "a"): Player => w.players.get(id)!;
const tile = (tx: number, ty: number) => ({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 });
const run = (w: WorldState, seconds: number): WorldState => {
  for (let i = 0; i < Math.round(seconds / DT); i++) w = tickWorld(w, DT);
  return w;
};

describe("where bodies can stand: an enemy that cannot reach its body", () => {
  it("an enforcer snagged on a corner lets a body that walked off go, and answers the next body that closes on it", () => {
    // Where the finder's walk left it: wedged on the shop block's corner, its body gone north into the Kerb.
    let w = body(emptyWorld(), "a", tile(53, 20));
    w = { ...w, enemies: w.enemies.map(e => e.id === "enforcer-1" ? { ...e, x: 40.87 * TILE, y: 48.22 * TILE, state: "aggro" as const, targetId: "a", t: 0 } : e) };
    w = run(w, 30);
    const enf = w.enemies.find(e => e.id === "enforcer-1")!;
    expect(enf.state === "aggro" && enf.targetId === "a", "still chasing a body across the city").toBe(false);
    // A second body closing on its post is answered: the enforcer swings.
    w = body(w, "b", tile(38, 49), { guest: true, flags: {} });
    let swung = false;
    for (let i = 0; i < 200 && !swung; i++) {
      w = tickWorld(w, DT);
      const e = w.enemies.find(x => x.id === "enforcer-1")!;
      swung = e.targetId === "b" && (e.state === "telegraph" || e.state === "recover");
    }
    expect(swung).toBe(true);
  });

  it("the stair clerks give up a body they cannot reach and leave with the descent's hour", () => {
    let w = emptyWorld();
    w = { ...w, flags: { ...w.flags, [W.CLERKS_DESCENT]: DESCENT_WINDOW } };
    w = body(w, "a", { x: 2736, y: 1068 });
    w = run(w, 30);
    const stuck = w.enemies.filter(e => e.id.startsWith("hour-clerk-stair") && e.targetId === "a" && e.state === "aggro");
    expect(stuck, "no clerk stands pinned on an unhurt body").toEqual([]);
    w = { ...w, now: DESCENT_WINDOW + 5 };
    w = run(w, 60);
    expect(w.enemies.filter(e => e.id.startsWith("hour-clerk-stair")), "the hour is over").toEqual([]);
  });
});

describe("one step, many messages", () => {
  it("a second talk sent before the first window reached the screen opens nothing: Ord's figure is not skipped", () => {
    let w = body(emptyWorld(), "a", { x: 0, y: 0 }, {
      movement: 3,
      flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.TALKED_ORD]: 1, [F.WEATHER_ORD]: 1, [F.MAP]: 1, [F.FAILED]: 1, [F.HALL]: 1, [F.M3]: 1 },
    });
    const ord = npcView({ w, p: me(w), now: w.now }, w.npcs.ord)!;
    w = body(w, "a", { x: ord.x, y: ord.y + 24 }, { ...me(w), x: ord.x, y: ord.y + 24 });
    w = applyAction(w, "a", { t: "talk", npcId: "ord" });
    const first = me(w).dialogue?.node;
    expect(first).toBe("figure");
    const again = applyAction(w, "a", { t: "talk", npcId: "ord" });
    expect(again, "the second press changes nothing").toBe(w);
  });
});

describe("where bodies can stand: a crowd at a place", () => {
  it("another Angel nearer than the place does not take the prompt with only V: the place's F, E and Q stand", () => {
    for (const place of ["claims-desk", "stall-1", "listing-board"]) {
      const at = POSITIONS[place];
      let w = body(emptyWorld(), "a", { x: at.x, y: at.y + 28 }, { movement: 2 });
      const alone = snapshotFor(w, "a").prompt;
      expect(alone?.targetId, place).toBe(place);
      w = body(w, "b", { x: at.x + 19, y: at.y + 28 });
      const crowd = snapshotFor(w, "a").prompt;
      expect(crowd?.targetId, `${place}: the body beside you offers ${JSON.stringify(crowd?.verbs)}`).toBe(place);
      expect(crowd?.verbs).toEqual(alone?.verbs);
    }
    // with no place in reach the body's own prompt still stands
    let w = body(emptyWorld(), "a", { x: POSITIONS["claims-desk"].x + 400, y: POSITIONS["claims-desk"].y });
    w = body(w, "b", { x: me(w).x + 19, y: me(w).y });
    expect(snapshotFor(w, "a").prompt?.targetId).toBe("b");
  });
});

describe("boundary values", () => {
  it("the shrine does not sell a restore to an aura the bar reads full, and a press there charges nothing", () => {
    const shrine = POSITIONS["care-shrine"];
    let w = body(emptyWorld(), "a", { x: shrine.x, y: shrine.y + 24 }, { aura: 97, bestand: 20 });
    w = applyAction(w, "a", { t: "interact", targetId: "care-shrine", choice: "restore" });
    expect(me(w).aura).toBe(100);
    w = tickWorld(w, DT);
    expect(Math.round(me(w).aura)).toBe(100);
    expect(snapshotFor(w, "a").prompt?.verbs.map(v => v.choice)).not.toContain("restore");
    const purse = me(w).bestand;
    w = applyAction(w, "a", { t: "interact", targetId: "care-shrine", choice: "restore" });
    expect(me(w).bestand).toBe(purse);
  });

  it("a blow taken with the flag down does not hold a flag raised afterwards: the body lowers it at once", () => {
    const street = POSITIONS["hot-street"];
    let w = body(emptyWorld(), "a", { x: street.x, y: street.y }, { facing: { dx: 1, dy: 0 } });
    w = body(w, "b", { x: street.x + 30, y: street.y });
    w = { ...w, gestell: 95 };
    w = applyAction(w, "a", { t: "strike" });
    w = tickWorld(w, DT);
    expect(me(w, "b").hp).toBeLessThan(100);
    w = applyAction(w, "b", { t: "flag" });
    expect(me(w, "b").flagged).toBe(true);
    w = applyAction(w, "b", { t: "flag" });
    expect(me(w, "b").flagged, "its flag was down at the blow: nothing holds it").toBe(false);
  });
});

describe("one step, many messages: the ring", () => {
  it("two bodies pressing F at the set ring in one step: the first opens it, the second stands in the hole", () => {
    const ring = POSITIONS["clearing-ring"];
    const fourth = { movement: 4, party: { nara: "with" as const, quill: "with" as const, ord: "with" as const }, choices: { [C.PARTY]: "with" }, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.MORTALITY]: 1 } };
    let w = body(emptyWorld(), "a", { x: ring.x, y: ring.y + 20 }, fourth);
    w = body(w, "b", { x: ring.x + 20, y: ring.y }, fourth);
    w = applyAction(w, "a", { t: "interact", targetId: "clearing-ring", choice: "prepare" });
    expect(w.clearing.open).toBe(true);
    w = applyAction(w, "b", { t: "interact", targetId: "clearing-ring", choice: "prepare" });
    expect(me(w, "b").flags[F.PREPARE], "the second press is heard").toBe(1);
    expect(me(w, "b").heard).toMatch(/^The hole is open already/);
  });
});

describe("text against state: the plaque", () => {
  it("only the process strikes the plaque for the city: stability leaves it as it was for the next reader", () => {
    const plaque = POSITIONS["safety-plaque"];
    const heard = { [F.WEATHER_SAFETY]: 1, [F.WEATHER_ORD]: 1, [F.WEATHER_NARA]: 1 };
    for (const [choice, struck] of [["stability", false], ["end", false], ["process", true]] as const) {
      let w = body(emptyWorld(), "a", { x: plaque.x, y: plaque.y + 24 }, { guest: true, flags: heard });
      w = applyAction(w, "a", { t: "interact", targetId: "safety-plaque", choice });
      w = body(w, "b", { x: plaque.x + 10, y: plaque.y + 24 }, { guest: true, flags: {} });
      const prompt = snapshotFor(w, "b").prompt;
      expect(prompt?.name, choice).toBe(struck ? "Office of Safety — struck" : "Office of Safety");
      w = applyAction(w, "b", { t: "interact", targetId: "safety-plaque", choice: "read" });
      expect(me(w, "b").heard.startsWith(struck ? "Office of Safety. Stability was the name they sold" : "Office of Safety. This district is stable"), choice).toBe(true);
    }
  });
});

describe("text against state: what a place says to a body", () => {
  const say = (w: WorldState, id: string, targetId: string, choice: string) => me(applyAction(w, id, { t: "interact", targetId, choice }), id).heard;
  const at = (w: WorldState, poi: string, patch: Partial<Player>) => body(w, "a", { x: POSITIONS[poi].x, y: POSITIONS[poi].y + 24 }, patch);

  it("the garden another Angel buried is buried ground to everyone's look, as its name says", () => {
    let w = at(emptyWorld(), "wreckage-garden", { movement: 2 });
    w = { ...w, pois: { ...w.pois, "wreckage-garden": { state: "buried", by: "x", at: 1, count: 1 } }, flags: { ...w.flags, [W.GARDEN_BURIED]: 1 } };
    expect(snapshotFor(w, "a").prompt?.name).toMatch(/buried/);
    expect(say(w, "a", "wreckage-garden", "look")).toMatch(/^Buried ground/);
  });

  it("the plot does not promise the recorder to the body that took its copper", () => {
    const w = at(emptyWorld(), "nara-plot", { flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.BURIED_NARA]: 1 }, choices: { [C.MEMORIAL]: "copper" } });
    expect(say(w, "a", "nara-plot", "stand")).not.toMatch(/can be heard/);
    const voice = at(emptyWorld(), "nara-plot", { flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.BURIED_NARA]: 1 }, choices: { [C.MEMORIAL]: "voice" } });
    expect(say(voice, "a", "nara-plot", "stand")).toMatch(/can be heard/);
  });

  it("the ring after an Absence does not say Nara stays to a body she has left", () => {
    const base = { movement: 5, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [seasonPassingFlag(1)]: 1 }, choices: { [C.PASSING]: "absence" } };
    const gone = at(emptyWorld(), "clearing-ring", { ...base, party: { nara: "gone", quill: "with", ord: "with" } });
    expect(say(gone, "a", "clearing-ring", "after")).toBe("The hour went by. Absence is honest. The ring is a ring.");
    const kept = at(emptyWorld(), "clearing-ring", { ...base, party: { nara: "with", quill: "with", ord: "with" } });
    expect(say(kept, "a", "clearing-ring", "after")).toMatch(/Nara Vale stays\.$/);
  });
});
