import { describe, expect, it, vi } from "vitest";
import type { Notice, Player, WorldState } from "./types";

vi.mock("./content", () => ({
  LINES: new Proxy({}, { get: (_t, key) => (typeof key === "string" ? key : "") }),
}));
vi.mock("./world", () => ({
  say: (p: Player, text: string, now: number): Player => ({ ...p, heard: text, heardAt: now }),
  wink: (p: Player, text: string, now: number): Player => ({ ...p, wink: text, winkAt: now }),
  notice: (p: Player, text: string, now: number, tone: Notice["tone"] = "ink"): Player => ({ ...p, notices: [...p.notices, { text, at: now, tone }] }),
  pushNews: (w: WorldState, text: string): WorldState => ({ ...w, news: [...w.news, { text, at: w.now }] }),
}));

import { MAX_HP, RESTRAINT_START, TITHE_COST, WAR_HOLD, WAR_PERIOD, WAR_RADIUS, WRECKAGE_TTL_BONUS } from "./constants";
import { POSITIONS } from "./map";
import { initialClearing, initialPassing } from "./clearing";
import { initialNodes } from "./economy";
import {
  BOUNTY_AMOUNT,
  WAR_STANDING,
  applyBounty,
  applyStanding,
  applyTithe,
  hallFor,
  hasOmen,
  initialHouses,
  perception,
  tickHouseWar,
  titheCost,
} from "./houses";

// ---------------------------------------------------------------- fixtures

function makePlayer(over: Partial<Player> = {}): Player {
  return {
    id: "p1",
    name: "#0042",
    x: 0,
    y: 0,
    facing: { dx: 1, dy: 0 },
    district: "nave",
    guest: false,
    serial: 42,
    house: "mortals",
    messenger: "herald",
    winkSchool: "hint",
    locked: false,
    hp: MAX_HP,
    dead: false,
    strikeCd: 0,
    heavyCd: 0,
    heavyWindup: 0,
    hitStop: 0,
    dodgeT: 0,
    dodgeCd: 0,
    dodgeX: 0,
    dodgeY: 0,
    stance: "restraint",
    kitCd: 0,
    kit: null,
    aura: 20,
    auraSeed: 10,
    bestand: 0,
    banked: 0,
    winke: 0,
    fakeWinke: 0,
    readiness: 0,
    restraint: RESTRAINT_START,
    current: "",
    extracted: 0,
    kept: 0,
    extractedSinceFuneral: 0,
    movement: 2,
    quests: {},
    flags: {},
    choices: {},
    party: { nara: "with", quill: "with", ord: "with" },
    dialogue: null,
    frozenBy: "",
    flagged: false,
    truceUntil: 0,
    lastKillId: "",
    lastKillAt: 0,
    campCount: 0,
    spectated: 0,
    kills: 0,
    deaths: 0,
    items: [],
    claims: [],
    claimsFiled: 0,
    insured: false,
    respawn: { x: 0, y: 0, district: "nave" },
    heard: "",
    heardAt: 0,
    wink: "",
    winkAt: 0,
    notices: [],
    history: { passings: 0, buried: 0, looted: 0, houses: [], outcomes: [] },
    linkedAt: 0,
    createdAt: 0,
    ...over,
  };
}

function makeWorld(players: Player[], over: Partial<WorldState> = {}): WorldState {
  return {
    version: 2,
    now: 0,
    tick: 0,
    gestell: 38,
    season: { id: 1, startedAt: 0 },
    weatherNamed: false,
    frozen: {},
    players: new Map(players.map(p => [p.id, p])),
    intents: new Map(),
    npcs: {},
    enemies: [],
    nodes: initialNodes(),
    wreckage: [],
    graves: [],
    pois: {},
    flags: {},
    houses: initialHouses(),
    clearing: initialClearing(),
    passing: initialPassing(),
    market: [],
    news: [],
    failed: [],
    history: [],
    rng: 1,
    ...over,
  };
}

const you = (w: WorldState, id = "p1") => w.players.get(id)!;
const at = (id: string, over: Partial<Player> = {}) => {
  const pos = POSITIONS[id];
  return makePlayer({ x: pos.x, y: pos.y, district: pos.district, ...over });
};

/** Advance the world in fixed steps through tickHouseWar. */
function run(w: WorldState, seconds: number, dt = 0.5): WorldState {
  let next = w;
  for (let t = 0; t < seconds; t += dt) {
    next = { ...next, now: next.now + dt };
    next = tickHouseWar(next, dt);
  }
  return next;
}

// ---------------------------------------------------------------- tests

describe("halls and standing", () => {
  it("initialHouses is quiet: no standing, no tithe, a war waiting at WAR_PERIOD", () => {
    const h = initialHouses();
    expect(h.standing).toEqual({ earth: 0, sky: 0, mortals: 0, divinities: 0 });
    expect(h.tithe).toBe(0);
    expect(h.war.active).toBe(false);
    expect(h.war.startsAt).toBe(WAR_PERIOD);
    expect(h.war.site).toBe("clearing-ring");
  });

  it("hallFor names the hall POI for each House", () => {
    expect(hallFor("mortals")).toBe("hall-mortals");
    expect(hallFor("earth")).toBe("hall-earth");
    expect(POSITIONS[hallFor("sky")]).toBeTruthy();
    expect(POSITIONS[hallFor("divinities")]).toBeTruthy();
  });

  it("applyStanding is pure and additive", () => {
    const w = makeWorld([]);
    const next = applyStanding(w, "sky", 2);
    expect(next.houses.standing.sky).toBe(2);
    expect(w.houses.standing.sky).toBe(0);
    expect(applyStanding(next, "sky", -1).houses.standing.sky).toBe(1);
    expect(applyStanding(next, "sky", 0)).toBe(next);
  });
});

describe("perception", () => {
  it("houses and the ruin messenger change perception only", () => {
    const guest = perception(makePlayer({ guest: true, house: "", messenger: "" }));
    expect(guest).toEqual({ wreckageBonus: 0, forecast: false, winkDensity: 0, groundResist: 0, funeralSight: false });
    const mortals = perception(makePlayer({ house: "mortals" }));
    expect(mortals.wreckageBonus).toBe(WRECKAGE_TTL_BONUS);
    expect(mortals.funeralSight).toBe(true);
    expect(perception(makePlayer({ house: "sky" })).forecast).toBe(true);
    expect(perception(makePlayer({ house: "divinities" })).winkDensity).toBe(2);
    expect(perception(makePlayer({ house: "earth" })).groundResist).toBe(2);
    const ruin = perception(makePlayer({ house: "sky", messenger: "ruin" }));
    expect(ruin.wreckageBonus).toBe(WRECKAGE_TTL_BONUS);
    expect(ruin.forecast).toBe(true);
    const keys = Object.keys(ruin);
    expect(keys.some(k => /damage|dps|strike|heavy/i.test(k))).toBe(false);
  });
});

describe("house war", () => {
  it("scores seconds held and gives the winner standing and an omen, never damage", () => {
    const mortal = at("clearing-ring", { id: "m", house: "mortals" });
    const skyNear = at("clearing-ring", { id: "s", house: "sky", x: POSITIONS["clearing-ring"].x + WAR_RADIUS - 4 });
    const skyFar = at("clearing-ring", { id: "f", house: "sky", x: POSITIONS["clearing-ring"].x + WAR_RADIUS + 200 });
    const ghost = at("clearing-ring", { id: "g", house: "earth", guest: true, serial: null });
    const dead = at("clearing-ring", { id: "d", house: "earth", dead: true });
    let w = makeWorld([mortal, skyNear, skyFar, ghost, dead]);

    w = run(w, WAR_PERIOD - 1);
    expect(w.houses.war.active).toBe(false);
    w = run(w, 2);
    expect(w.houses.war.active).toBe(true);
    expect(w.houses.war.endsAt).toBe(WAR_PERIOD + WAR_HOLD);
    expect(w.news.length).toBe(1);

    // Sky leaves after 30 seconds; Mortals stay.
    w = run(w, 30);
    w = { ...w, players: new Map([...w.players].map(([id, p]) => [id, id === "s" ? { ...p, x: 0, y: 0 } : p])) };
    w = run(w, WAR_HOLD);
    const war = w.houses.war;
    expect(war.active).toBe(false);
    expect(war.winner).toBe("mortals");
    expect(war.lastWinner).toBe("mortals");
    expect(war.held.mortals).toBeGreaterThan(war.held.sky);
    expect(war.held.sky).toBeGreaterThan(20);
    expect(war.held.earth).toBe(0); // guests and the dead never count
    expect(w.houses.standing.mortals).toBe(WAR_STANDING);
    expect(w.houses.standing.sky).toBe(0);
    expect(hasOmen(w, "mortals")).toBe(true);
    expect(hasOmen(w, "sky")).toBe(false);
    expect(you(w, "m").notices.length).toBe(1);
    expect(you(w, "s").notices.length).toBe(0);
    expect(war.startsAt).toBe(WAR_PERIOD + WAR_HOLD + WAR_PERIOD);
    expect(war.site).toBe("hot-street"); // alternates
    // no combat number moved
    for (const p of w.players.values()) expect(p.hp).toBe(MAX_HP);
  });

  it("a tie gives no winner and no standing; the next window uses the other site", () => {
    const a = at("clearing-ring", { id: "a", house: "earth" });
    const b = at("clearing-ring", { id: "b", house: "divinities" });
    let w = makeWorld([a, b]);
    w = run(w, WAR_PERIOD + WAR_HOLD + 1);
    expect(w.houses.war.winner).toBe("");
    expect(w.houses.standing).toEqual({ earth: 0, sky: 0, mortals: 0, divinities: 0 });
    expect(w.houses.war.site).toBe("hot-street");
    // move both to the hot street and let the second window run: earth alone holds it
    const hot = POSITIONS["hot-street"];
    w = { ...w, players: new Map([...w.players].map(([id, p]) => [id, id === "a" ? { ...p, x: hot.x, y: hot.y, district: hot.district } : p])) };
    w = run(w, WAR_PERIOD + WAR_HOLD + 1);
    expect(w.houses.war.winner).toBe("earth");
    expect(w.houses.standing.earth).toBe(WAR_STANDING);
    expect(w.houses.war.site).toBe("clearing-ring");
  });

  it("ticks are a no-op before the first window", () => {
    const w = makeWorld([]);
    expect(tickHouseWar(w, 0.05)).toBe(w);
  });
});

describe("tithe and bounty", () => {
  it("tithe at your own hall costs TITHE_COST, raises standing and the pool", () => {
    const w = makeWorld([at("hall-mortals", { bestand: 10 })]);
    const next = applyTithe(w, "p1");
    expect(you(next).bestand).toBe(10 - TITHE_COST);
    expect(next.flags["sunk:tithe"]).toBe(TITHE_COST);
    expect(next.houses.standing.mortals).toBe(1);
    expect(next.houses.tithe).toBe(TITHE_COST);
    expect(you(applyTithe(makeWorld([at("hall-mortals", { bestand: 1 })]), "p1")).heard).toBe("CANT_AFFORD");
  });

  it("guests and the wrong hall are refused", () => {
    const guest = makeWorld([at("hall-mortals", { guest: true, serial: null, house: "", bestand: 10 })]);
    const g = applyTithe(guest, "p1");
    expect(you(g).bestand).toBe(10);
    expect(g.houses.tithe).toBe(0);
    const wrong = makeWorld([at("hall-sky", { house: "mortals", bestand: 10 })]);
    const r = applyTithe(wrong, "p1");
    expect(you(r).bestand).toBe(10);
    expect(r.houses.standing.mortals).toBe(0);
  });

  it("the omen eases the tithe by one", () => {
    const w = makeWorld([at("hall-mortals", { bestand: 10 })], { flags: { "omen:mortals": 1 } });
    expect(titheCost(w, "mortals")).toBe(TITHE_COST - 1);
    expect(titheCost(w, "sky")).toBe(TITHE_COST);
    expect(you(applyTithe(w, "p1")).bestand).toBe(10 - (TITHE_COST - 1));
  });

  it("bounty pays from the pool once per WAR_PERIOD at a lit hall with standing", () => {
    const lit = { "hall-mortals": { state: "lit", by: "", at: 0, count: 0 } };
    const base = makeWorld([at("hall-mortals", { bestand: 0 })], { pois: lit });
    // dark hall, no standing, thin pool: all refused
    expect(you(applyBounty(makeWorld([at("hall-mortals")]), "p1")).bestand).toBe(0);
    expect(you(applyBounty(base, "p1")).bestand).toBe(0);
    const standing = { ...base, houses: { ...base.houses, standing: { ...base.houses.standing, mortals: 1 } } };
    expect(you(applyBounty(standing, "p1")).bestand).toBe(0);
    const funded = { ...standing, houses: { ...standing.houses, tithe: 7 } };
    const paid = applyBounty(funded, "p1");
    expect(you(paid).bestand).toBe(BOUNTY_AMOUNT);
    expect(paid.houses.tithe).toBe(7 - BOUNTY_AMOUNT);
    expect(paid.flags["earned:bounty"]).toBe(BOUNTY_AMOUNT);
    const refilled = { ...paid, houses: { ...paid.houses, tithe: 20 }, now: paid.now + WAR_PERIOD - 1 };
    expect(you(applyBounty(refilled, "p1")).bestand).toBe(BOUNTY_AMOUNT);
    const later = { ...refilled, now: paid.now + WAR_PERIOD };
    expect(you(applyBounty(later, "p1")).bestand).toBe(BOUNTY_AMOUNT * 2);
    const guest = makeWorld([at("hall-mortals", { guest: true, serial: null, house: "" })], { pois: lit, houses: { ...funded.houses } });
    expect(you(applyBounty(guest, "p1")).bestand).toBe(0);
  });
});
