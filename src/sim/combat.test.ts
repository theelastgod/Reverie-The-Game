import { describe, expect, it, vi } from "vitest";
import type { Enemy, Intent, Player, WorldState } from "./types";

vi.mock("./content/lines", () => ({
  GUEST_LOCK: "A guest cannot prepare the ground.",
  DODGE_COPY: "You stepped through the strike.",
  DODGE_WHIFF: "Your strike crossed an empty space.",
  INTERRUPT: "The swing broke on yours.",
  HIT_COPY: "The hit held.",
  ARENA_HIT: "The dummy falls. Practice. No spoils.",
  GUEST_GRIEF: "Guests are not loot.",
  TRUCE_ACTIVE: "The truce holds.",
  PRACTICE_SAFE: "Practice ground. People are safe here.",
  PVP_FLAG_REQUIRED: "Both Angels must flag.",
  FLAG_GUEST: "A guest does not flag.",
  FLAG_WHERE: "Not on this street.",
  FLAG_ON: "You flagged.",
  FLAG_OFF: "You unflagged.",
  TRUCE_COPY: "Both unflag. Seconds, not a stick.",
  SPOILS_COPY: "Spoils from a person.",
  CAMP_COPY: "Camping the same grave feeds the Gestell.",
  DUEL_COPY: "A ruin duel. The grave is the ring.",
  SPECTATE_COPY: "You watched a ruin duel.",
  STORM_PRESS: "Storm. You pressed the geared.",
  STORM_FALLEN: "The fallen keep their rags.",
  KIT_GUEST: "A guest carries no kit.",
  KIT_COOLDOWN: "The kit is still cooling.",
  KIT_NEED: { herald: "No kept node near.", witness: "need", ruin: "need", dweller: "No node near.", cybernetic: "need", iridescent: "need" },
  KIT_COPY: { herald: "Announced.", witness: "Blitz.", ruin: "Face the wreckage.", dweller: "Kept.", cybernetic: "Read.", iridescent: "Glamour." },
  INSURANCE_USED: "The paper held. You wake where you fell.",
  DEATH_BY: (name: string) => `${name} left you in the weather.`,
}));
vi.mock("./economy", () => ({
  initialNodes: () => [],
  tickNodes: (w: WorldState) => w,
  tickMarket: (w: WorldState) => w,
  applyNode: (w: WorldState, id: string, nodeId: string, op: string) => ({ ...w, flags: { ...w.flags, [`node:${op}:${nodeId}:${id}`]: 1 } }),
  earn: (w: WorldState, id: string, amount: number) => {
    const p = w.players.get(id);
    if (!p) return w;
    const players = new Map(w.players);
    players.set(id, { ...p, bestand: p.bestand + amount });
    return { ...w, players };
  },
}));
vi.mock("./houses", () => ({
  initialHouses: () => ({
    standing: { earth: 0, sky: 0, mortals: 0, divinities: 0 },
    tithe: 0,
    war: { active: false, startsAt: 600, endsAt: 0, held: { earth: 0, sky: 0, mortals: 0, divinities: 0 }, winner: "", lastWinner: "", site: "clearing-ring" },
  }),
  tickHouseWar: (w: WorldState) => w,
}));
vi.mock("./clearing", () => ({
  initialClearing: () => ({ open: false, reserve: 40, openedAt: 0, seeds: [], contest: null, heldBy: [], lastOutcome: "" }),
  initialPassing: () => ({ count: 0, lastOutcome: "", lastBy: "", lastAt: 0, hijackedBy: "", appearanceUntil: 0 }),
  tickClearing: (w: WorldState) => w,
}));
vi.mock("./quests", () => ({ tickQuests: (w: WorldState) => w }));

import {
  BLITZ_DURATION, DODGE_COOLDOWN, DODGE_DURATION, ENEMY, ENEMY_LEASH, FACE_DURATION, HEAVY_COOLDOWN, HEAVY_DAMAGE, HEAVY_WINDUP,
  HIT_STOP, KIT_COOLDOWN, KIT_DURATION, MAX_HP, RESTRAINT_DODGE_BONUS, STRIKE_COOLDOWN, STRIKE_DAMAGE, TILE,
} from "./constants";
import { applyDodge, applyHeavy, applyKit, applyStrike, resolveHeavy, tickCombatTimers, tickEnemies } from "./combat";
import { auraSeed, formatSerial } from "./identity";
import { emptyWorld, spawnGuest, tickWorld } from "./world";

const NONE: Intent = { up: false, down: false, left: false, right: false };
const at = (tx: number, ty: number) => ({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 });

function put(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}
function intend(w: WorldState, id: string, intent: Intent): WorldState {
  const intents = new Map(w.intents);
  intents.set(id, intent);
  return { ...w, intents };
}
function enemy(w: WorldState, id: string): Enemy {
  return w.enemies.find(e => e.id === id)!;
}
function setEnemy(w: WorldState, id: string, over: Partial<Enemy>): WorldState {
  return { ...w, enemies: w.enemies.map(e => (e.id === id ? { ...e, ...over } : e)) };
}
function angel(id: string, serial: number, over: Partial<Player> = {}): Player {
  const p = spawnGuest(id);
  return { ...p, guest: false, serial, name: formatSerial(serial), auraSeed: auraSeed(serial), aura: auraSeed(serial), flags: { angel: 1 }, ...over };
}
function run(w: WorldState, seconds: number, dt = 0.05): WorldState {
  for (let t = 0; t < seconds - 1e-9; t += dt) w = tickWorld(w, dt);
  return w;
}

/** A guest standing just west of Desk Three, facing it. */
function besideClerk(): { w: WorldState; clerk: Enemy } {
  const w = emptyWorld();
  const clerk = enemy(w, "desk-three");
  const p: Player = { ...spawnGuest("g"), x: clerk.x - 30, y: clerk.y, facing: { dx: 1, dy: 0 } };
  return { w: put(w, p), clerk };
}

describe("dodge", () => {
  it("gives i-frames against a clerk telegraph; walking is not immunity", () => {
    const { w: base, clerk } = besideClerk();
    const armed = setEnemy(base, clerk.id, { state: "telegraph", t: 0.05, targetId: "g" });

    const dodged = tickWorld(put(armed, { ...armed.players.get("g")!, dodgeT: 0.2, dodgeCd: DODGE_COOLDOWN }), 0.05);
    expect(dodged.players.get("g")!.hp).toBe(MAX_HP);
    expect(dodged.players.get("g")!.heard).toBe("You stepped through the strike.");
    expect(enemy(dodged, clerk.id).state).toBe("recover");

    const standing = tickWorld(armed, 0.05);
    expect(standing.players.get("g")!.hp).toBe(MAX_HP - ENEMY.clerk.damage);

    const walking = tickWorld(intend(armed, "g", { ...NONE, left: true }), 0.05);
    expect(walking.players.get("g")!.hp).toBe(MAX_HP - ENEMY.clerk.damage);
  });

  it("uses only the direction's signs, lengthens in Restraint and refuses cooldown spam", () => {
    const { w } = besideClerk();
    const first = applyDodge(w, "g", 900, -0.001);
    const p1 = first.players.get("g")!;
    expect(p1.dodgeT).toBeCloseTo(DODGE_DURATION + RESTRAINT_DODGE_BONUS);
    expect(p1.dodgeCd).toBe(DODGE_COOLDOWN);
    expect(p1.dodgeX).toBeCloseTo(Math.SQRT1_2);
    expect(p1.dodgeY).toBeCloseTo(-Math.SQRT1_2);

    const spam = applyDodge(first, "g", 1, 0);
    expect(spam).toBe(first);

    const later = run(first, 0.3);
    expect(later.players.get("g")!.dodgeT).toBe(0);
    expect(applyDodge(later, "g", 1, 0)).toBe(later);
    const ready = run(later, DODGE_COOLDOWN);
    expect(applyDodge(ready, "g", 1, 0).players.get("g")!.dodgeT).toBeGreaterThan(0);

    const storm = applyDodge(put(w, { ...w.players.get("g")!, stance: "storm" }), "g", 0, 1);
    expect(storm.players.get("g")!.dodgeT).toBeCloseTo(DODGE_DURATION);
  });

  it("refuses the dead, the locked, a windup, an open dialogue and a zero direction with no facing", () => {
    const { w } = besideClerk();
    const p = w.players.get("g")!;
    expect(applyDodge(put(w, { ...p, dead: true }), "g", 1, 0).players.get("g")!.dodgeT).toBe(0);
    expect(applyDodge(put(w, { ...p, locked: true }), "g", 1, 0).players.get("g")!.dodgeT).toBe(0);
    expect(applyDodge(put(w, { ...p, heavyWindup: 0.1 }), "g", 1, 0).players.get("g")!.dodgeT).toBe(0);
    const talking = put(w, { ...p, dialogue: { npc: "nara", node: "x", speaker: "Nara", portrait: "nara.jpg", text: "", wink: "", choices: [] } });
    expect(applyDodge(talking, "g", 1, 0).players.get("g")!.dodgeT).toBe(0);
    expect(applyDodge(put(w, { ...p, facing: { dx: 0, dy: 0 } }), "g", 0, 0).players.get("g")!.dodgeT).toBe(0);
    expect(applyDodge(w, "g", Number.NaN, 0).players.get("g")!.dodgeT).toBeGreaterThan(0); // falls back to facing
  });
});

describe("strike and heavy", () => {
  it("hits a clerk in reach and hit-stop extends the strike cooldown; a whiff does not", () => {
    const { w, clerk } = besideClerk();
    const hit = applyStrike(w, "g");
    expect(enemy(hit, clerk.id).hp).toBe(ENEMY.clerk.hp - STRIKE_DAMAGE);
    expect(enemy(hit, clerk.id).participants).toEqual(["g"]);
    const p = hit.players.get("g")!;
    expect(p.strikeCd).toBeCloseTo(STRIKE_COOLDOWN + HIT_STOP);
    expect(p.hitStop).toBe(HIT_STOP);
    expect(applyStrike(hit, "g")).toBe(hit);

    const far = put(w, { ...w.players.get("g")!, x: clerk.x - 400 });
    const whiff = applyStrike(far, "g");
    expect(enemy(whiff, clerk.id).hp).toBe(ENEMY.clerk.hp);
    expect(whiff.players.get("g")!.strikeCd).toBeCloseTo(STRIKE_COOLDOWN);
    expect(whiff.players.get("g")!.hitStop).toBe(0);
  });

  it("does not strike behind the back", () => {
    const { w, clerk } = besideClerk();
    const turned = put(w, { ...w.players.get("g")!, facing: { dx: -1, dy: 0 } });
    expect(enemy(applyStrike(turned, "g"), clerk.id).hp).toBe(ENEMY.clerk.hp);
  });

  it("refuses a strike while dodging, dead, locked or winding up", () => {
    const { w } = besideClerk();
    const p = w.players.get("g")!;
    expect(applyStrike(put(w, { ...p, dodgeT: 0.1 }), "g").enemies).toEqual(w.enemies);
    expect(applyStrike(put(w, { ...p, dead: true }), "g").enemies).toEqual(w.enemies);
    expect(applyStrike(put(w, { ...p, locked: true }), "g").enemies).toEqual(w.enemies);
    expect(applyStrike(put(w, { ...p, heavyWindup: 0.1 }), "g").enemies).toEqual(w.enemies);
  });

  it("a heavy winds up, then interrupts a telegraph into a long recovery", () => {
    const { w, clerk } = besideClerk();
    let cur = setEnemy(w, clerk.id, { state: "telegraph", t: 0.5, targetId: "g" });
    cur = applyHeavy(cur, "g");
    let p = cur.players.get("g")!;
    expect(p.heavyWindup).toBe(HEAVY_WINDUP);
    expect(p.heavyCd).toBe(HEAVY_COOLDOWN);
    expect(applyHeavy(cur, "g")).toBe(cur);
    // Cannot walk or dodge during the windup.
    expect(applyDodge(cur, "g", 1, 0)).toBe(cur);
    const walked = tickWorld(intend(cur, "g", { ...NONE, left: true }), 0.05).players.get("g")!;
    expect(walked.x).toBe(p.x);

    cur = run(cur, HEAVY_WINDUP);
    p = cur.players.get("g")!;
    expect(p.heavyWindup).toBe(0);
    expect(p.hp).toBe(MAX_HP);
    expect(p.heard).toBe("The swing broke on yours.");
    const e = enemy(cur, clerk.id);
    expect(e.hp).toBe(ENEMY.clerk.hp - HEAVY_DAMAGE);
    expect(e.state).toBe("recover");
    expect(e.t).toBeGreaterThan(ENEMY.clerk.recovery);
  });

  it("resolveHeavy alone lands the heavy number", () => {
    const { w, clerk } = besideClerk();
    const cur = resolveHeavy(w, "g");
    expect(enemy(cur, clerk.id).hp).toBe(ENEMY.clerk.hp - HEAVY_DAMAGE);
    expect(cur.players.get("g")!.hitStop).toBe(HIT_STOP);
  });

  it("a fallen clerk leaves a wreckage with no spoils and comes back after its respawn", () => {
    const { w, clerk } = besideClerk();
    let cur = setEnemy(w, clerk.id, { hp: 10 });
    cur = applyStrike(cur, "g");
    const e = enemy(cur, clerk.id);
    expect(e.state).toBe("dead");
    expect(e.respawnAt).toBeCloseTo(cur.now + ENEMY.clerk.respawn);
    expect(cur.wreckage.length).toBe(1);
    expect(cur.wreckage[0]).toMatchObject({ fromId: clerk.id, fromName: "Desk Three", killerId: "g", bestand: 0, items: [] });
    // The guest walks off; nobody is waiting when the clerk comes back.
    cur = put(cur, { ...cur.players.get("g")!, x: clerk.x - 600 });
    cur = run(cur, ENEMY.clerk.respawn - 1);
    expect(enemy(cur, clerk.id).state).toBe("dead");
    cur = run(cur, 2);
    const back = enemy(cur, clerk.id);
    expect(back.state).toBe("idle");
    expect(back.hp).toBe(back.maxHp);
    expect({ x: back.x, y: back.y }).toEqual(clerk.home);
  });
});

describe("tickCombatTimers", () => {
  it("counts every timer down to zero and drops an expired kit when given the clock", () => {
    const p: Player = { ...spawnGuest("g"), strikeCd: 0.1, heavyCd: 0.1, heavyWindup: 0.1, hitStop: 0.1, dodgeT: 0.1, dodgeCd: 0.1, kitCd: 0.1, kit: { verb: "witness", until: 5 } };
    const half = tickCombatTimers(p, 0.05);
    expect(half.strikeCd).toBeCloseTo(0.05);
    expect(half.kit).toEqual({ verb: "witness", until: 5 });
    const done = tickCombatTimers(half, 1, 10);
    expect([done.strikeCd, done.heavyCd, done.heavyWindup, done.hitStop, done.dodgeT, done.dodgeCd, done.kitCd]).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(done.kit).toBeNull();
    expect(tickCombatTimers(done, 1)).toBe(done);
  });
});

describe("enemy state machine", () => {
  it("aggros on the nearest living unlocked player, walks in, telegraphs, hits and recovers", () => {
    let w = emptyWorld();
    const clerk = enemy(w, "desk-three");
    w = put(w, { ...spawnGuest("g"), x: clerk.x - 90, y: clerk.y });
    w = put(w, { ...spawnGuest("locked"), x: clerk.x - 20, y: clerk.y, locked: true });
    w = tickWorld(w, 0.05);
    let e = enemy(w, clerk.id);
    expect(e.state).toBe("aggro");
    expect(e.targetId).toBe("g");
    w = run(w, 1);
    e = enemy(w, clerk.id);
    expect(e.x).toBeLessThan(clerk.x);
    expect(["telegraph", "recover", "aggro"]).toContain(e.state);
    w = run(w, 2);
    expect(w.players.get("g")!.hp).toBeLessThan(MAX_HP);
    expect(w.players.get("locked")!.hp).toBe(MAX_HP);
  });

  it("gives up past its leash, walks home and heals", () => {
    let w = emptyWorld();
    const clerk = enemy(w, "desk-three");
    const far = { x: clerk.home.x, y: clerk.home.y - ENEMY_LEASH - 60 };
    w = put(w, { ...spawnGuest("g"), x: far.x, y: far.y - 30 });
    w = setEnemy(w, clerk.id, { ...far, state: "aggro", targetId: "g", hp: 5, participants: ["g"] });
    w = tickWorld(w, 0.05);
    expect(enemy(w, clerk.id).state).toBe("return");
    w = run(w, 8);
    const e = enemy(w, clerk.id);
    expect({ x: e.x, y: e.y }).toEqual(clerk.home);
    expect(e.state).toBe("idle");
    expect(e.hp).toBe(e.maxHp);
    expect(e.participants).toEqual([]);
  });

  it("kills a player through killPlayer with the clerk's line", () => {
    const { w, clerk } = besideClerk();
    let cur = put(w, { ...w.players.get("g")!, hp: 5 });
    cur = setEnemy(cur, clerk.id, { state: "telegraph", t: 0.05, targetId: "g" });
    cur = tickWorld(cur, 0.05);
    const p = cur.players.get("g")!;
    expect(p.deaths).toBe(1);
    expect(p.hp).toBe(MAX_HP);
    expect(p.heard).toBe("Desk Three did their job.");
    expect(cur.wreckage.some(r => r.fromId === "g" && r.killerId === clerk.id)).toBe(true);
  });

  it("the intake clerk only takes a relief shift for a fresh arrival nearby", () => {
    let w = emptyWorld();
    const intake = enemy(w, "intake-clerk");
    w = setEnemy(w, intake.id, { state: "dead", hp: 0, respawnAt: 0 });
    expect(enemy(tickWorld(w, 0.05), intake.id).state).toBe("dead");

    const veteran = put(w, { ...spawnGuest("vet"), x: intake.home.x + 60, y: intake.home.y, flags: { intake: 1 } });
    expect(enemy(tickWorld(veteran, 0.05), intake.id).state).toBe("dead");

    const farArrival = put(w, { ...spawnGuest("far"), x: intake.home.x + 400, y: intake.home.y });
    expect(enemy(tickWorld(farArrival, 0.05), intake.id).state).toBe("dead");

    const arrival = put(w, { ...spawnGuest("new"), x: intake.home.x + 60, y: intake.home.y });
    const back = enemy(tickWorld(arrival, 0.05), intake.id);
    expect(back.state).toBe("idle");
    expect(back.hp).toBe(ENEMY.intake.hp);
  });

  it("the intake clerk's fall credits every participant and sets its respawn", () => {
    let w = emptyWorld();
    const intake = enemy(w, "intake-clerk");
    w = put(w, { ...spawnGuest("a"), x: intake.x - 30, y: intake.y, facing: { dx: 1, dy: 0 } });
    w = put(w, { ...spawnGuest("b"), x: intake.x + 30, y: intake.y, facing: { dx: -1, dy: 0 } });
    w = put(w, { ...spawnGuest("watcher"), x: intake.x, y: intake.y + 300 });
    w = setEnemy(w, intake.id, { hp: STRIKE_DAMAGE + 1 });
    w = applyStrike(w, "a");
    w = applyStrike(w, "b");
    expect(enemy(w, intake.id).state).toBe("dead");
    expect(enemy(w, intake.id).respawnAt).toBeCloseTo(w.now + ENEMY.intake.respawn);
    expect(w.players.get("a")!.flags.intake).toBe(1);
    expect(w.players.get("b")!.flags.intake).toBe(1);
    expect(w.players.get("watcher")!.flags.intake).toBeUndefined();
  });

  it("an abandoned intake fight resets to full", () => {
    let w = emptyWorld();
    const intake = enemy(w, "intake-clerk");
    w = setEnemy(w, intake.id, { hp: 10, participants: ["gone"] });
    w = tickEnemies(w, 0.05);
    expect(enemy(w, intake.id).hp).toBe(ENEMY.intake.hp);
    expect(enemy(w, intake.id).participants).toEqual([]);
  });

  it("the dummy never moves or attacks and respawns instantly with no wreckage", () => {
    let w = emptyWorld();
    const dummy = enemy(w, "practice-dummy");
    w = put(w, { ...spawnGuest("g"), x: dummy.x - 30, y: dummy.y, facing: { dx: 1, dy: 0 } });
    w = run(w, 3);
    expect(enemy(w, dummy.id)).toMatchObject({ state: "idle", x: dummy.x, y: dummy.y });
    expect(w.players.get("g")!.hp).toBe(MAX_HP);
    for (let i = 0; i < 3; i++) {
      w = applyStrike(w, "g");
      w = put(w, { ...w.players.get("g")!, strikeCd: 0 });
    }
    const d = enemy(w, dummy.id);
    expect(d.hp).toBe(ENEMY.dummy.hp);
    expect(d.state).toBe("idle");
    expect(w.wreckage.length).toBe(0);
    expect(w.players.get("g")!.heard).toBe("The dummy falls. Practice. No spoils.");
  });
});

describe("kits", () => {
  it("guests carry no kit; Angels get their verb and a cooldown", () => {
    let w = emptyWorld();
    w = put(w, spawnGuest("g"));
    expect(applyKit(w, "g").players.get("g")!.heard).toBe("A guest carries no kit.");

    w = put(w, angel("w", 2, { messenger: "witness" }));
    let cur = applyKit(w, "w");
    let p = cur.players.get("w")!;
    expect(p.kit).toEqual({ verb: "witness", until: cur.now + BLITZ_DURATION });
    expect(p.kitCd).toBe(KIT_COOLDOWN);
    expect(p.heard).toBe("Blitz.");
    expect(applyKit(cur, "w").players.get("w")!.heard).toBe("The kit is still cooling.");

    cur = put(cur, angel("r", 3, { messenger: "ruin" }));
    expect(applyKit(cur, "r").players.get("r")!.kit).toEqual({ verb: "ruin", until: cur.now + FACE_DURATION });
    cur = put(cur, angel("c", 5, { messenger: "cybernetic" }));
    expect(applyKit(cur, "c").players.get("c")!.kit).toEqual({ verb: "cybernetic", until: cur.now + KIT_DURATION });
    cur = put(cur, angel("i", 6, { messenger: "iridescent" }));
    expect(applyKit(cur, "i").players.get("i")!.kit).toEqual({ verb: "iridescent", until: cur.now + KIT_DURATION });
  });

  it("a Herald announces the nearest kept node; a Dweller seeds the nearest node", () => {
    const node = { id: "n1", district: "nave" as const, ...at(12, 40), charges: 3, regenAt: 0, kept: true, keptBy: "x", announcedUntil: 0, seed: false };
    let w: WorldState = { ...emptyWorld(), nodes: [node, { ...node, id: "n2", kept: false, x: node.x + 40 }] };
    w = put(w, angel("h", 1, { messenger: "herald", ...at(12, 41) }));
    const announced = applyKit(w, "h");
    expect(announced.nodes[0].announcedUntil).toBe(announced.now + KIT_DURATION);
    expect(announced.nodes[1].announcedUntil).toBe(0);
    expect(announced.players.get("h")!.flags["kit:announce"]).toBe(1);

    const farHerald = put(w, angel("h", 1, { messenger: "herald", ...at(30, 50) }));
    expect(applyKit(farHerald, "h").players.get("h")!.heard).toBe("No kept node near.");

    w = put(w, angel("d", 4, { messenger: "dweller", x: node.x - 30, y: node.y }));
    const seeded = applyKit(w, "d");
    expect(seeded.flags["node:seed:n1:d"]).toBe(1);
    expect(seeded.players.get("d")!.kitCd).toBe(KIT_COOLDOWN);
    const farDweller = put(w, angel("d", 4, { messenger: "dweller", ...at(30, 50) }));
    expect(applyKit(farDweller, "d").players.get("d")!.heard).toBe("No node near.");
  });
});
