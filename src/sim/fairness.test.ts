import { describe, expect, it, vi } from "vitest";
import type { Player, WorldState } from "./types";

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
  earn: (w: WorldState, id: string, amount: number, earner: string) => {
    const p = w.players.get(id);
    if (!p) return w;
    const players = new Map(w.players);
    players.set(id, { ...p, bestand: p.bestand + amount });
    return { ...w, players, flags: { ...w.flags, [`earned:${earner}`]: (w.flags[`earned:${earner}`] ?? 0) + amount } };
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
  AURA_CAMP_PENALTY, AURA_SPECTATE_GAIN, AURA_WOUND, CAMP_WINDOW, GESTELL_CAMP, HEAVY_DAMAGE, MAX_HP, RESTRAINT_CHAIN_KILL_PENALTY,
  SPECTATE_CAP, STORM_FALLEN_PENALTY, STORM_GEARED_BESTAND, STORM_GEARED_BONUS, STRIKE_DAMAGE, TILE, TRUCE_SECONDS, UNBANKED_DROP,
  WRECKAGE_TTL,
} from "./constants";
import { applyFlag, applyStrike, applyTruce, pvpBlockReason, stormMultiplier } from "./combat";
import { auraSeed, formatSerial, houseFor, messengerFor, winkSchoolFor } from "./identity";
import { damageFor, emptyWorld, heavyFor, killPlayer, spawnGuest, tickWorld, wink } from "./world";

const at = (tx: number, ty: number) => ({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 });
const HOT = at(41, 51); // the hot street, Wet Grid (enforcers patrol it)
const RING = at(50, 67); // the Clearing ring: flag-legal and quiet
const ARENA = at(28, 34); // inside patch-arena, Nave

function put(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}
function angel(id: string, serial: number, over: Partial<Player> = {}): Player {
  const p = spawnGuest(id);
  return {
    ...p,
    guest: false,
    serial,
    name: formatSerial(serial),
    house: houseFor(serial),
    messenger: messengerFor(serial),
    winkSchool: winkSchoolFor(serial),
    auraSeed: auraSeed(serial),
    aura: auraSeed(serial),
    flags: { angel: 1 },
    ...over,
  };
}
function run(w: WorldState, seconds: number, dt = 0.05): WorldState {
  for (let t = 0; t < seconds - 1e-9; t += dt) w = tickWorld(w, dt);
  return w;
}
/** Two bodies in the Clearing ring, a facing b, b facing a, 30 px apart. */
function faceOff(a: Player, b: Player): WorldState {
  let w = emptyWorld();
  w = put(w, { ...a, x: RING.x - 15, y: RING.y, district: "clearing", facing: { dx: 1, dy: 0 } });
  w = put(w, { ...b, x: RING.x + 15, y: RING.y, district: "clearing", facing: { dx: -1, dy: 0 } });
  return w;
}
const hp = (w: WorldState, id: string) => w.players.get(id)!.hp;

describe("the fairness firewall", () => {
  it("damageFor and heavyFor ignore serial, house, messenger, aura, bestand, banked, items and claims", () => {
    const six: Player[] = [
      spawnGuest("guest"),
      angel("a", 1),
      angel("b", 7777, { aura: 100, bestand: 9999, banked: 9999 }),
      angel("c", 4077, { house: "divinities", messenger: "ruin", winkSchool: "wreckage" }),
      angel("d", 1221, { items: [{ id: "cult:copper-binding", kind: "cult", name: "Copper binding", qty: 1, value: 0, bound: true }, { id: "copy:wink", kind: "exhibition", name: "Copy", qty: 9, value: 9 }] }),
      angel("e", 500, { claims: [{ id: "c1", label: "claim", amount: 25, filedAt: 0, readyAt: 0, settled: true }], banked: 10000, winke: 50, readiness: 100 }),
    ];
    const light = six.map(damageFor);
    const heavy = six.map(heavyFor);
    expect(new Set(light).size).toBe(1);
    expect(new Set(heavy).size).toBe(1);
    expect(light[0]).toBe(STRIKE_DAMAGE);
    expect(heavy[0]).toBe(HEAVY_DAMAGE);
  });

  it("a flagged fight lands the same number for every serial", () => {
    for (const serial of [1, 2, 3, 4, 7777, 4077]) {
      const w = faceOff(angel("a", serial, { flagged: true }), angel("b", 6000, { flagged: true }));
      expect(hp(applyStrike(w, "a"), "b")).toBe(MAX_HP - STRIKE_DAMAGE);
    }
  });
});

describe("guests", () => {
  it("keep aura 0 through ticks and never receive a Wink", () => {
    let w = put(emptyWorld(), { ...spawnGuest("g"), aura: 7 });
    w = run(w, 30);
    const g = w.players.get("g")!;
    expect(g.aura).toBe(0);
    expect(wink(g, "a private line", w.now).wink).toBe("");
    expect(wink({ ...g, aura: 50, restraint: 100 }, "a private line", w.now).wink).toBe("");
  });

  it("cannot flag, even on the hot street", () => {
    let w = put(emptyWorld(), { ...spawnGuest("g"), ...HOT, district: "wet" });
    w = applyFlag(w, "g");
    expect(w.players.get("g")!.flagged).toBe(false);
    expect(w.players.get("g")!.heard).toBe("A guest does not flag.");
    const locked = put(emptyWorld(), { ...spawnGuest("l"), ...HOT, district: "wet", locked: true });
    expect(applyFlag(locked, "l").players.get("l")!.flagged).toBe(false);
  });

  it("neither hurt nor are hurt by Angels", () => {
    const w = faceOff(spawnGuest("g"), angel("a", 42, { flagged: true }));
    const guestSwings = applyStrike(w, "g");
    expect(hp(guestSwings, "a")).toBe(MAX_HP);
    expect(guestSwings.players.get("g")!.heard).toBe("Guests are not loot.");
    const angelSwings = applyStrike(w, "a");
    expect(hp(angelSwings, "g")).toBe(MAX_HP);
    expect(angelSwings.players.get("a")!.heard).toBe("Guests are not loot.");
    expect(pvpBlockReason(w.players.get("g")!, w.players.get("a")!, w)).toBe("Guests are not loot.");
  });
});

describe("PvP consent", () => {
  it("needs both flags", () => {
    const one = faceOff(angel("a", 1, { flagged: true }), angel("b", 2));
    expect(hp(applyStrike(one, "a"), "b")).toBe(MAX_HP);
    expect(applyStrike(one, "a").players.get("a")!.heard).toBe("Both Angels must flag.");
    expect(hp(applyStrike(one, "b"), "a")).toBe(MAX_HP);
    const both = faceOff(angel("a", 1, { flagged: true }), angel("b", 2, { flagged: true }));
    expect(hp(applyStrike(both, "a"), "b")).toBe(MAX_HP - STRIKE_DAMAGE);
    expect(hp(applyStrike(both, "b"), "a")).toBe(MAX_HP - STRIKE_DAMAGE);
  });

  it("a truce unflags both, blocks both directions and refuses a new flag while it holds", () => {
    let w = faceOff(angel("a", 1, { flagged: true }), angel("b", 2, { flagged: true }));
    w = applyTruce(w, "a");
    const a = w.players.get("a")!;
    const b = w.players.get("b")!;
    expect(a.flagged).toBe(false);
    expect(b.flagged).toBe(false);
    expect(a.truceUntil).toBeCloseTo(w.now + TRUCE_SECONDS);
    expect(b.truceUntil).toBeCloseTo(w.now + TRUCE_SECONDS);
    expect(a.heard).toBe("Both unflag. Seconds, not a stick.");
    // Even with flags forced back on, the truce holds both ways.
    const forced = put(put(w, { ...a, flagged: true }), { ...b, flagged: true });
    expect(hp(applyStrike(forced, "a"), "b")).toBe(MAX_HP);
    expect(hp(applyStrike(forced, "b"), "a")).toBe(MAX_HP);
    expect(applyStrike(forced, "a").players.get("a")!.heard).toBe("The truce holds.");
    expect(applyFlag(w, "a").players.get("a")!.flagged).toBe(false);
    expect(applyFlag(w, "a").players.get("a")!.heard).toBe("The truce holds.");
    const later = run(w, TRUCE_SECONDS + 1);
    expect(applyFlag(later, "a").players.get("a")!.flagged).toBe(true);
  });

  it("the practice patch blocks PvP", () => {
    let w = emptyWorld();
    w = put(w, angel("a", 1, { ...ARENA, x: ARENA.x - 15, flagged: true, facing: { dx: 1, dy: 0 } }));
    w = put(w, angel("b", 2, { ...ARENA, x: ARENA.x + 15, flagged: true, facing: { dx: -1, dy: 0 } }));
    expect(hp(applyStrike(w, "a"), "b")).toBe(MAX_HP);
    expect(applyStrike(w, "a").players.get("a")!.heard).toBe("Practice ground. People are safe here.");
  });

  it("flags are raised only where the street allows and make news on the hot street", () => {
    const nave = put(emptyWorld(), angel("a", 1, { ...at(17, 40), district: "nave" }));
    expect(applyFlag(nave, "a").players.get("a")!.flagged).toBe(false);
    expect(applyFlag(nave, "a").players.get("a")!.heard).toBe("Not on this street.");
    const wet = put(emptyWorld(), angel("a", 1, { ...HOT, district: "wet" }));
    const flagged = applyFlag(wet, "a");
    expect(flagged.players.get("a")!.flagged).toBe(true);
    expect(flagged.news.length).toBe(1);
    expect(applyFlag(flagged, "a").players.get("a")!.flagged).toBe(false);
  });
});

describe("storm stance", () => {
  it("presses the geared, spares the fallen, and never applies for guests or a Ruin-angel wearing the face", () => {
    const w = faceOff(angel("a", 1, { flagged: true, stance: "storm" }), angel("b", 2, { flagged: true, bestand: STORM_GEARED_BESTAND }));
    const a = w.players.get("a")!;
    const b = w.players.get("b")!;
    expect(stormMultiplier(a, b, w)).toBeCloseTo(1 + STORM_GEARED_BONUS);
    expect(stormMultiplier({ ...a, stance: "restraint" }, b, w)).toBe(1);
    expect(stormMultiplier({ ...a, guest: true }, b, w)).toBe(1);
    expect(stormMultiplier({ ...a, kit: { verb: "ruin", until: w.now + 10 } }, b, w)).toBe(1);
    expect(stormMultiplier(a, { ...b, bestand: 10 }, w)).toBe(1);
    const fallen = { ...w, wreckage: [{ id: "x", x: 0, y: 0, district: "clearing" as const, fromId: "b", fromName: "#0002", fromSerial: 2, killerId: "", at: 0, until: w.now + WRECKAGE_TTL, buried: false, looted: false, bestand: 0, items: [] }] };
    expect(stormMultiplier(a, b, fallen)).toBeCloseTo(1 - STORM_FALLEN_PENALTY);
    const pressed = applyStrike(w, "a");
    expect(hp(pressed, "b")).toBe(MAX_HP - Math.round(STRIKE_DAMAGE * (1 + STORM_GEARED_BONUS)));
    expect(pressed.players.get("a")!.heard).toBe("Storm. You pressed the geared.");
  });
});

describe("death", () => {
  it("killPlayer never drops cult items or banked value, and wounds aura no lower than the seed", () => {
    const cult = { id: "cult:copper-binding", kind: "cult" as const, name: "Copper binding", qty: 1, value: 0, bound: true };
    const copies = { id: "copy:wink", kind: "exhibition" as const, name: "Copy", qty: 3, value: 9 };
    const paper = { id: "paper:repair", kind: "paper" as const, name: "Repair", qty: 1, value: 0 };
    let w = emptyWorld();
    for (let i = 0; i < 12; i++) {
      w = put(w, angel(`v${i}`, 100 + i, { ...at(17, 40), bestand: 100, banked: 500, aura: auraSeed(100 + i) + 3, items: [cult, copies, paper] }));
      w = killPlayer(w, `v${i}`, "someone", "gone");
      const v = w.players.get(`v${i}`)!;
      expect(v.banked).toBe(500);
      expect(v.bestand).toBe(100 - Math.floor(100 * UNBANKED_DROP));
      expect(v.items.some(it => it.id === "cult:copper-binding")).toBe(true);
      expect(v.items.some(it => it.id === "paper:repair")).toBe(true);
      expect(v.aura).toBe(auraSeed(100 + i));
    }
    for (const wreck of w.wreckage) {
      expect(wreck.items.every(it => it.kind === "exhibition")).toBe(true);
      expect(wreck.bestand).toBe(Math.floor(100 * UNBANKED_DROP));
    }
    // With a fair coin, across 12 deaths the copies both dropped and stayed at least once.
    expect(w.wreckage.some(r => r.items.length === 1)).toBe(true);
    expect(w.wreckage.some(r => r.items.length === 0)).toBe(true);
  });

  it("a small wound leaves an Angel at its seed, and a guest stays at zero", () => {
    let w = put(emptyWorld(), angel("a", 42, { aura: auraSeed(42) + AURA_WOUND + 2 }));
    w = killPlayer(w, "a", "x", "gone");
    expect(w.players.get("a")!.aura).toBe(auraSeed(42) + 2);
    w = killPlayer(w, "a", "x", "gone");
    expect(w.players.get("a")!.aura).toBe(auraSeed(42));
    w = put(w, spawnGuest("g"));
    w = killPlayer(w, "g", "x", "gone");
    expect(w.players.get("g")!.aura).toBe(0);
  });
});

describe("PvP kills", () => {
  const respawnHere = { x: RING.x + 15, y: RING.y, district: "clearing" as const };

  it("pay spoils to the killer from the fallen purse and leave a wreckage with the killer's id", () => {
    let w = faceOff(angel("k", 1, { flagged: true }), angel("v", 2, { flagged: true, hp: 10, bestand: 100, respawn: respawnHere }));
    w = applyStrike(w, "k");
    const k = w.players.get("k")!;
    const v = w.players.get("v")!;
    expect(v.deaths).toBe(1);
    expect(v.bestand).toBe(70);
    expect(k.bestand).toBe(30);
    expect(k.kills).toBe(1);
    expect(k.lastKillId).toBe("v");
    expect(k.history.looted).toBe(1);
    expect(k.heard).toBe("Spoils from a person.");
    expect(w.flags["earned:spoils"]).toBe(30);
    expect(w.wreckage.length).toBe(1);
    expect(w.wreckage[0]).toMatchObject({ fromId: "v", killerId: "k", bestand: 0 });
    expect(v.heard).toBe("#0001 left you in the weather.");
  });

  it("camping penalties apply on the second kill inside CAMP_WINDOW", () => {
    let w = faceOff(angel("k", 1, { flagged: true, restraint: 60 }), angel("v", 2, { flagged: true, hp: 10, respawn: respawnHere }));
    const gestell0 = w.gestell;
    const aura0 = w.players.get("k")!.aura;
    w = applyStrike(w, "k");
    expect(w.players.get("k")!.campCount).toBe(0);
    expect(w.gestell).toBe(gestell0);
    // Seconds later the same body falls again.
    w = run(w, 1);
    w = put(w, { ...w.players.get("v")!, hp: 10, flagged: true });
    w = applyStrike(w, "k");
    const k = w.players.get("k")!;
    expect(k.kills).toBe(2);
    expect(k.campCount).toBe(1);
    expect(k.aura).toBeCloseTo(aura0 - AURA_CAMP_PENALTY, 1);
    expect(w.gestell).toBeCloseTo(gestell0 + GESTELL_CAMP, 1);
    expect(k.heard).toBe("Camping the same grave feeds the Gestell.");
    expect(k.restraint).toBeCloseTo(60 - RESTRAINT_CHAIN_KILL_PENALTY, 0);
  });

  it("no camping penalty outside CAMP_WINDOW or against a different body", () => {
    let w = faceOff(angel("k", 1, { flagged: true }), angel("v", 2, { flagged: true, hp: 10, respawn: respawnHere }));
    w = applyStrike(w, "k");
    w = run(w, CAMP_WINDOW + 1);
    w = put(w, { ...w.players.get("v")!, hp: 10, flagged: true });
    w = applyStrike(w, "k");
    expect(w.players.get("k")!.campCount).toBe(0);
  });

  it("a ruin duel pays its watchers a little presence, capped", () => {
    let w = faceOff(angel("k", 1, { flagged: true }), angel("v", 2, { flagged: true, hp: 10, respawn: respawnHere }));
    const grave = { id: "old", x: RING.x, y: RING.y + 20, district: "clearing" as const, fromId: "z", fromName: "#0009", fromSerial: 9, killerId: "", at: 0, until: WRECKAGE_TTL, buried: false, looted: false, bestand: 0, items: [] };
    w = { ...w, wreckage: [grave] };
    w = put(w, angel("s", 3, { x: RING.x, y: RING.y + 60 }));
    w = put(w, angel("capped", 4, { x: RING.x, y: RING.y - 60, spectated: SPECTATE_CAP }));
    w = put(w, { ...spawnGuest("g"), x: RING.x + 40, y: RING.y + 40 });
    w = put(w, angel("far", 5, { x: RING.x, y: RING.y + 400 }));
    w = applyStrike(w, "k");
    expect(w.players.get("k")!.heard).toBe("A ruin duel. The grave is the ring.");
    expect(w.players.get("s")!.aura).toBe(auraSeed(3) + AURA_SPECTATE_GAIN);
    expect(w.players.get("s")!.spectated).toBe(1);
    expect(w.players.get("capped")!.aura).toBe(auraSeed(4));
    expect(w.players.get("g")!.aura).toBe(0);
    expect(w.players.get("far")!.aura).toBe(auraSeed(5));
  });
});
