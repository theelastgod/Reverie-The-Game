import { describe, expect, it, vi } from "vitest";
import type { Intent, Player, WorldState } from "./types";

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
  applyNode: (w: WorldState) => w,
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

import { AURA_DRIFT, BODY_R, GESTELL_START, MAX_HP, NOTICE_TTL, RESTRAINT_START, TILE, UNBANKED_DROP, WRECKAGE_TTL } from "./constants";
import { POI_STATES } from "./content/ids";
import { auraSeed, formatSerial } from "./identity";
import { circleHitsWalls, districtAt, ENEMY_SPAWNS, GUEST_SPAWN, NPC_HOMES } from "./map";
import { emptyWorld, killPlayer, nextRand, notice, pushNews, say, spawnGuest, stepPlayer, tickWorld, updateDistrict, wink } from "./world";

const NONE: Intent = { up: false, down: false, left: false, right: false };
const DOWN: Intent = { ...NONE, down: true };
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
function angel(id: string, serial: number, over: Partial<Player> = {}): Player {
  const p = spawnGuest(id);
  return { ...p, guest: false, serial, name: formatSerial(serial), auraSeed: auraSeed(serial), aura: auraSeed(serial), flags: { angel: 1 }, ...over };
}
function run(w: WorldState, seconds: number, dt = 0.05): WorldState {
  for (let t = 0; t < seconds - 1e-9; t += dt) w = tickWorld(w, dt);
  return w;
}

describe("emptyWorld", () => {
  it("initialises every collection", () => {
    const w = emptyWorld();
    expect(w.version).toBe(2);
    expect(w.gestell).toBe(GESTELL_START);
    expect(w.enemies.length).toBe(ENEMY_SPAWNS.length);
    expect(w.enemies.every(e => e.state === "idle" && e.hp === e.maxHp)).toBe(true);
    for (const [id, states] of Object.entries(POI_STATES)) expect(w.pois[id]).toEqual({ state: states[0], by: "", at: 0, count: 0 });
    for (const h of Object.values(NPC_HOMES)) expect(w.npcs[h.id]).toEqual({ id: h.id, x: h.x, y: h.y, district: h.district, present: true, state: "home" });
    expect(w.players.size).toBe(0);
    expect(w.rng).toBe(0x9e3779b9);
    expect(w.clearing.reserve).toBe(40);
    expect(w.houses.standing.mortals).toBe(0);
  });

  it("spawns a guest unsealed at the guest spawn", () => {
    const g = spawnGuest("g", 12);
    expect(g.guest).toBe(true);
    expect(g.serial).toBeNull();
    expect(g.name).toBe("GUEST");
    expect(g.aura).toBe(0);
    expect(g.restraint).toBe(RESTRAINT_START);
    expect(g.stance).toBe("restraint");
    expect(g.movement).toBe(1);
    expect(g.party).toEqual({ nara: "none", quill: "none", ord: "none" });
    expect({ x: g.x, y: g.y, district: g.district }).toEqual(GUEST_SPAWN);
    expect(g.respawn).toEqual(GUEST_SPAWN);
    expect(g.createdAt).toBe(12);
    expect(g.hp).toBe(MAX_HP);
  });
});

describe("stepPlayer", () => {
  it("cannot tunnel through a 1-tile wall at dodge speed, even in a long catch-up step", () => {
    // A nave pillar sits at tile (9, 32). Start one tile above it and dash down.
    const start = at(9, 31);
    const p: Player = { ...spawnGuest("g"), ...start, dodgeT: 0.25, dodgeX: 0, dodgeY: 1 };
    const wallTop = 32 * TILE;
    const moved = stepPlayer(p, NONE, 0.25);
    expect(moved.y).toBeGreaterThan(start.y);
    expect(moved.y).toBeLessThanOrEqual(wallTop - BODY_R + 1e-6);
    expect(circleHitsWalls(moved.x, moved.y, BODY_R, moved)).toBe(false);
    // Without the wall the dash would have crossed it.
    expect(start.y + 440 * 0.25).toBeGreaterThan(wallTop + TILE);
  });

  it("slides along a wall instead of stopping dead", () => {
    const start = at(9, 31);
    const p: Player = { ...spawnGuest("g"), ...start };
    const moved = stepPlayer(p, { ...NONE, down: true, right: true }, 1);
    expect(moved.x).toBeGreaterThan(start.x);
    expect(moved.y).toBeGreaterThan(start.y);
    expect(circleHitsWalls(moved.x, moved.y, BODY_R, moved)).toBe(false);
  });

  it("does not move the dead and does not walk during a heavy windup", () => {
    const p = { ...spawnGuest("g"), ...at(17, 40) };
    const dead = { ...p, dead: true };
    expect(stepPlayer(dead, DOWN, 0.5)).toBe(dead);
    expect(stepPlayer({ ...p, heavyWindup: 0.2 }, DOWN, 0.5).y).toBe(p.y);
    expect(stepPlayer(p, DOWN, 0.5).y).toBeGreaterThan(p.y);
  });

  it("updates facing from movement", () => {
    const p = { ...spawnGuest("g"), ...at(17, 40) };
    expect(stepPlayer(p, { ...NONE, left: true }, 0.05).facing).toEqual({ dx: -1, dy: 0 });
    const diag = stepPlayer(p, { ...NONE, up: true, right: true }, 0.05).facing;
    expect(diag.dx).toBeCloseTo(Math.SQRT1_2);
    expect(diag.dy).toBeCloseTo(-Math.SQRT1_2);
  });
});

describe("personal gates", () => {
  const gateTop = 55 * TILE;
  const start = at(17, 54);

  it("blocks a guest at gate-nave-care while an Angel with flags.under walks through and changes district", () => {
    let w = emptyWorld();
    const guest = { ...spawnGuest("guest"), ...start };
    const under = angel("angel", 42, { ...start, flags: { angel: 1, under: 1 } });
    w = put(put(w, guest), under);
    w = intend(intend(w, "guest", DOWN), "angel", DOWN);
    w = run(w, 3);
    const g = w.players.get("guest")!;
    const a = w.players.get("angel")!;
    expect(g.y).toBeLessThanOrEqual(gateTop - BODY_R + 1e-6);
    expect(g.district).toBe("nave");
    expect(a.y).toBeGreaterThan(58 * TILE);
    expect(a.district).toBe("care");
    expect(districtAt(a.x, a.y)).toBe("care");
  });

  it("updateDistrict follows the body", () => {
    const p = { ...spawnGuest("g"), ...at(17, 40) };
    expect(updateDistrict(p)).toBe(p);
    const moved = { ...p, ...at(40, 40) };
    expect(updateDistrict(moved).district).toBe("wet");
    const care = { ...p, ...at(17, 60) };
    expect(updateDistrict(care).district).toBe("care");
  });
});

describe("tickWorld", () => {
  it("advances time, ticks, and expires wreckage, graves, notices and freezes", () => {
    let w = emptyWorld();
    const g = spawnGuest("g");
    w = put(w, notice(g, "a notice", 0));
    w = {
      ...w,
      wreckage: [{ id: "wr", x: 0, y: 0, district: "nave", fromId: "x", fromName: "x", fromSerial: null, killerId: "", at: 0, until: WRECKAGE_TTL, buried: false, looted: false, bestand: 0, items: [] }],
      graves: [{ id: "gr", x: 0, y: 0, district: "nave", name: "x", by: "g", at: 0, until: 10 }],
      frozen: { nave: 5 },
    };
    w = tickWorld(w, 0.05);
    expect(w.now).toBeCloseTo(0.05);
    expect(w.tick).toBe(1);
    expect(w.wreckage.length).toBe(1);
    expect(w.graves.length).toBe(1);
    expect(w.frozen.nave).toBe(5);
    w = run(w, NOTICE_TTL + 1);
    expect(w.players.get("g")!.notices.length).toBe(0);
    expect(w.frozen.nave).toBeUndefined();
    w = run(w, 10);
    expect(w.graves.length).toBe(0);
    // Wreckage lingers past its base lifetime so Mortals and Ruin-sight can still find it, then leaves.
    expect(w.wreckage.length).toBe(1);
    w = run(w, WRECKAGE_TTL * 5);
    expect(w.wreckage.length).toBe(0);
  });

  it("drifts an Angel's aura toward its seed and keeps a guest at zero", () => {
    let w = emptyWorld();
    const a = angel("a", 42, { aura: auraSeed(42) + 1 });
    const b = angel("b", 43, { aura: 0 });
    const g = { ...spawnGuest("g"), aura: 5 };
    w = put(put(put(w, a), b), g);
    w = run(w, 10);
    expect(w.players.get("a")!.aura).toBeCloseTo(auraSeed(42) + 1 - AURA_DRIFT * 10, 3);
    expect(w.players.get("b")!.aura).toBeCloseTo(AURA_DRIFT * 10, 3);
    expect(w.players.get("g")!.aura).toBe(0);
    w = run(w, 200);
    expect(w.players.get("a")!.aura).toBe(auraSeed(42));
  });

  it("halves aura drift during an Appearance season", () => {
    let w: WorldState = { ...emptyWorld(), passing: { count: 1, lastOutcome: "appearance", lastBy: "a", lastAt: 0, hijackedBy: "", appearanceUntil: 1000 } };
    w = put(w, angel("a", 42, { aura: auraSeed(42) + 5 }));
    w = run(w, 10);
    expect(w.players.get("a")!.aura).toBeCloseTo(auraSeed(42) + 5 - AURA_DRIFT * 0.5 * 10, 3);
  });

  it("burns restraint in Storm, regains it slowly in Restraint, and a Ruin-angel wearing the face burns nothing", () => {
    let w = emptyWorld();
    w = put(w, angel("storm", 1, { stance: "storm", restraint: 50 }));
    w = put(w, angel("calm", 2, { stance: "restraint", restraint: 50 }));
    w = put(w, angel("face", 3, { stance: "storm", restraint: 50, kit: { verb: "ruin", until: 100 } }));
    w = run(w, 10);
    expect(w.players.get("storm")!.restraint).toBeCloseTo(40, 3);
    expect(w.players.get("calm")!.restraint).toBeCloseTo(52, 3);
    expect(w.players.get("face")!.restraint).toBeCloseTo(50, 3);
    w = run(w, 100);
    expect(w.players.get("face")!.kit).toBeNull();
    expect(w.players.get("face")!.restraint).toBeLessThan(50);
  });

  it("drifts gestell toward the baseline", () => {
    let w = { ...emptyWorld(), gestell: 90 };
    w = run(w, 60);
    expect(w.gestell).toBeLessThan(90);
    expect(w.gestell).toBeGreaterThan(89.9);
    let low = { ...emptyWorld(), gestell: 10 };
    low = run(low, 60);
    expect(low.gestell).toBeGreaterThan(10);
  });
});

describe("speech and news", () => {
  it("say sets heard; wink is silent for guests, dark auras and spent restraint", () => {
    const g = spawnGuest("g");
    expect(say(g, "hello", 3)).toMatchObject({ heard: "hello", heardAt: 3 });
    expect(wink(g, "private", 3).wink).toBe("");
    const a = angel("a", 42);
    expect(wink(a, "private", 3)).toMatchObject({ wink: "private", winkAt: 3 });
    expect(wink({ ...a, aura: 2 }, "private", 3).wink).toBe("");
    expect(wink({ ...a, restraint: 10 }, "private", 3).wink).toBe("");
  });

  it("notice keeps the last four and news the last eight", () => {
    let p = spawnGuest("g");
    for (let i = 0; i < 6; i++) p = notice(p, `n${i}`, i, "gold");
    expect(p.notices.map(n => n.text)).toEqual(["n2", "n3", "n4", "n5"]);
    expect(p.notices[0].tone).toBe("gold");
    let w = emptyWorld();
    for (let i = 0; i < 10; i++) w = pushNews(w, `news ${i}`);
    expect(w.news.length).toBe(8);
    expect(w.news[7].text).toBe("news 9");
  });

  it("nextRand is deterministic and stays in [0, 1)", () => {
    let w = emptyWorld();
    const seen: number[] = [];
    for (let i = 0; i < 50; i++) {
      const [r, next] = nextRand(w);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(1);
      expect(next.rng).not.toBe(w.rng);
      seen.push(r);
      w = next;
    }
    const [again] = nextRand(emptyWorld());
    expect(again).toBe(seen[0]);
    expect(new Set(seen).size).toBeGreaterThan(40);
  });
});

describe("killPlayer", () => {
  it("drops the unbanked share onto a wreckage and wakes the body at its respawn point with full hp", () => {
    let w = emptyWorld();
    const v = angel("v", 42, { ...at(20, 40), bestand: 100, banked: 50, hp: 3, respawn: { ...at(17, 61), district: "care" } });
    w = put(w, v);
    w = killPlayer(w, "v", "desk-three", "Desk Three did their job.");
    const after = w.players.get("v")!;
    expect(after.dead).toBe(false);
    expect(after.hp).toBe(MAX_HP);
    expect(after.deaths).toBe(1);
    expect(after.bestand).toBe(100 - Math.floor(100 * UNBANKED_DROP));
    expect(after.banked).toBe(50);
    expect(after.heard).toBe("Desk Three did their job.");
    expect({ x: after.x, y: after.y, district: after.district }).toEqual({ ...at(17, 61), district: "care" });
    expect(w.wreckage.length).toBe(1);
    const wreck = w.wreckage[0];
    expect(wreck.bestand).toBe(Math.floor(100 * UNBANKED_DROP));
    expect(wreck.fromId).toBe("v");
    expect(wreck.fromSerial).toBe(42);
    expect(wreck.killerId).toBe("desk-three");
    expect({ x: wreck.x, y: wreck.y }).toEqual(at(20, 40));
    expect(wreck.until).toBeCloseTo(w.now + WRECKAGE_TTL);
  });

  it("insurance wakes the body where it fell, keeps the purse and is spent", () => {
    let w = emptyWorld();
    const v = angel("v", 42, { ...at(20, 40), bestand: 100, insured: true, hp: 1, respawn: { ...at(17, 61), district: "care" } });
    w = put(w, v);
    w = killPlayer(w, "v", "desk-three", "gone");
    const after = w.players.get("v")!;
    expect(after.insured).toBe(false);
    expect(after.bestand).toBe(100);
    expect({ x: after.x, y: after.y }).toEqual(at(20, 40));
    expect(after.notices.some(n => n.text.includes("paper"))).toBe(true);
    expect(w.wreckage[0].bestand).toBe(0);
  });

  it("ignores an unknown victim", () => {
    const w = emptyWorld();
    expect(killPlayer(w, "nobody", "x", "y")).toBe(w);
  });
});
