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

import {
  AURA_DWELL_GAIN,
  CLEARING_EXTRACT,
  CLEARING_HOLD_ANGELS,
  CLEARING_RADIUS,
  CLEARING_RESERVE,
  GESTELL_CLEARING_HOLD,
  GESTELL_MELTDOWN,
  MAX_HP,
  PASSING_STIPEND,
  READINESS_KEEP,
  RESTRAINT_KEEP_GAIN,
  RESTRAINT_START,
  SEASON_LENGTH,
  WAR_HOLD,
} from "./constants";
import { C, F, W } from "./content/ids";
import { POSITIONS } from "./map";
import { initialNodes } from "./economy";
import { initialHouses } from "./houses";
import {
  FAILED_MARK,
  RING,
  applyClearing,
  applyPassing,
  initialClearing,
  initialPassing,
  partyWilling,
  resolvePassing,
  tickClearing,
} from "./clearing";

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
    movement: 4,
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
    now: 100,
    tick: 2000,
    gestell: 38,
    season: { id: 3, startedAt: 0 },
    weatherNamed: false,
    frozen: {},
    players: new Map(players.map(p => [p.id, p])),
    intents: new Map(),
    npcs: {},
    enemies: [],
    nodes: initialNodes(),
    wreckage: [],
    graves: [],
    pois: { [RING]: { state: "closed", by: "", at: 0, count: 0 } },
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

const ring = POSITIONS[RING];
const you = (w: WorldState, id = "p1") => w.players.get(id)!;
const atRing = (over: Partial<Player> = {}) => makePlayer({ x: ring.x, y: ring.y, district: ring.district, ...over });
/** An Angel who has done everything the Turn asks of one body. */
const prepared = (over: Partial<Player> = {}) =>
  atRing({ readiness: 80, flags: { [F.PREPARE]: 1, [F.MORTALITY]: 1 }, choices: { [C.MORTALITY]: "watch" }, ...over });

// ---------------------------------------------------------------- tests

describe("state", () => {
  it("initialClearing is closed with a finite reserve; initialPassing is empty", () => {
    expect(initialClearing()).toEqual({ open: false, reserve: CLEARING_RESERVE, openedAt: 0, seeds: [], contest: null, heldBy: [], lastOutcome: "" });
    expect(initialPassing()).toEqual({ count: 0, lastOutcome: "", lastBy: "", lastAt: 0, hijackedBy: "", appearanceUntil: 0 });
  });
});

describe("tickClearing", () => {
  it("counts dwelling Angels, lowers gestell and raises their aura while open", () => {
    const a = atRing({ id: "a" });
    const b = atRing({ id: "b", x: ring.x + CLEARING_RADIUS - 2 });
    const far = atRing({ id: "far", x: ring.x + CLEARING_RADIUS + 50 });
    const guest = atRing({ id: "g", guest: true, serial: null, aura: 0 });
    const dead = atRing({ id: "d", dead: true });
    const closed = makeWorld([a, b, far, guest, dead]);
    const ticked = tickClearing(closed, 1);
    expect(ticked.clearing.heldBy).toEqual(["a", "b"]);
    expect(ticked.gestell).toBe(closed.gestell); // closed: no hold effect
    expect(you(ticked, "a").aura).toBe(20);
    expect(tickClearing(ticked, 1)).toBe(ticked); // nothing changed

    const open = { ...ticked, clearing: { ...ticked.clearing, open: true } };
    const held = tickClearing(open, 1);
    expect(held.gestell).toBeCloseTo(open.gestell + GESTELL_CLEARING_HOLD * 2, 6);
    expect(you(held, "a").aura).toBeCloseTo(20 + AURA_DWELL_GAIN, 6);
    expect(you(held, "far").aura).toBe(20);
    expect(you(held, "g").aura).toBe(0);
  });

  it("resolves the contest at endsAt: keep holds the ring, extract closes it", () => {
    const w = makeWorld([atRing()]);
    const kept = {
      ...w,
      clearing: { ...w.clearing, open: true, contest: { active: true, keep: 2, extract: 1, endsAt: w.now } },
    };
    const k = tickClearing(kept, 0.05);
    expect(k.clearing.lastOutcome).toBe("kept");
    expect(k.clearing.open).toBe(true);
    expect(k.clearing.contest?.active).toBe(false);
    expect(k.pois[RING].state).toBe("held");
    expect(k.news).toHaveLength(1);

    const extracted = { ...kept, clearing: { ...kept.clearing, contest: { active: true, keep: 0, extract: 1, endsAt: w.now } } };
    const e = tickClearing(extracted, 0.05);
    expect(e.clearing.lastOutcome).toBe("extracted");
    expect(e.clearing.open).toBe(false);
    expect(e.pois[RING].state).toBe("closed");

    const pending = { ...kept, clearing: { ...kept.clearing, contest: { active: true, keep: 1, extract: 0, endsAt: w.now + 5 } } };
    expect(tickClearing(pending, 0.05).clearing.contest?.active).toBe(true);
  });
});

describe("applyClearing", () => {
  it("open starts a contest; keep and extract vote; extract pays from a finite reserve", () => {
    let w = makeWorld([atRing({ id: "a", aura: 20 }), atRing({ id: "b" })]);
    w = applyClearing(w, "a", "open");
    expect(w.clearing.open).toBe(true);
    expect(w.clearing.openedAt).toBe(w.now);
    expect(w.clearing.contest).toEqual({ active: true, keep: 0, extract: 0, endsAt: w.now + WAR_HOLD });
    expect(w.pois[RING].state).toBe("open");
    expect(w.pois[RING].by).toBe("a");
    expect(you(applyClearing(w, "b", "open"), "b").heard).toBe("ALREADY");

    const kept = applyClearing(w, "b", "keep");
    expect(kept.clearing.contest?.keep).toBe(1);
    expect(you(kept, "b").readiness).toBe(READINESS_KEEP * 2);
    expect(you(kept, "b").restraint).toBe(RESTRAINT_START + RESTRAINT_KEEP_GAIN);
    expect(you(kept, "b").choices[C.CLEARING]).toBe("keep");

    const gestell = kept.gestell;
    const ex = applyClearing(kept, "a", "extract");
    expect(ex.clearing.contest?.extract).toBe(1);
    expect(ex.clearing.reserve).toBe(CLEARING_RESERVE - CLEARING_EXTRACT);
    expect(you(ex, "a").bestand).toBe(CLEARING_EXTRACT);
    expect(ex.flags["earned:node"]).toBe(CLEARING_EXTRACT);
    expect(you(ex, "a").aura).toBe(18);
    expect(ex.gestell).toBe(gestell + 2);
    expect(you(ex, "a").choices[C.CLEARING]).toBe("extract");
  });

  it("the reserve is finite and extracting past it pays nothing", () => {
    let w = makeWorld([atRing()]);
    w = applyClearing(w, "p1", "open");
    const pulls = Math.ceil(CLEARING_RESERVE / CLEARING_EXTRACT);
    for (let i = 0; i < pulls; i++) w = applyClearing(w, "p1", "extract");
    expect(w.clearing.reserve).toBe(0);
    expect(you(w).bestand).toBe(CLEARING_RESERVE);
    const dry = applyClearing(w, "p1", "extract");
    expect(dry.clearing.reserve).toBe(0);
    expect(you(dry).bestand).toBe(CLEARING_RESERVE);
    expect(dry.flags["earned:node"]).toBe(CLEARING_RESERVE);
    // once spent and closed, it cannot be opened again
    const closed = { ...dry, clearing: { ...dry.clearing, open: false }, pois: { [RING]: { state: "closed", by: "", at: 0, count: 1 } } };
    expect(applyClearing(closed, "p1", "open").clearing.open).toBe(false);
  });

  it("guests, the locked, the far away and a closed ring are refused", () => {
    const guest = makeWorld([atRing({ guest: true, serial: null })]);
    const g = applyClearing(guest, "p1", "open");
    expect(g.clearing.open).toBe(false);
    expect(you(g).heard).toBe("GUEST_LOCK");
    const locked = makeWorld([atRing({ locked: true })]);
    expect(applyClearing(locked, "p1", "open").clearing.open).toBe(false);
    const far = makeWorld([makePlayer({ x: 10, y: 10 })]);
    expect(applyClearing(far, "p1", "open")).toBe(far);
    const shut = makeWorld([atRing()]);
    expect(applyClearing(shut, "p1", "keep").clearing.contest).toBeNull();
    expect(you(applyClearing(shut, "p1", "extract")).bestand).toBe(0);
    const pass = applyClearing(shut, "p1", "pass");
    expect(you(pass).choices[C.CLEARING]).toBe("pass");
  });
});

describe("resolvePassing", () => {
  it("partyWilling needs Nara and Ord not gone", () => {
    expect(partyWilling(makePlayer())).toBe(true);
    expect(partyWilling(makePlayer({ party: { nara: "gone", quill: "with", ord: "with" } }))).toBe(false);
    expect(partyWilling(makePlayer({ party: { nara: "with", quill: "gone", ord: "gone" } }))).toBe(false);
    expect(partyWilling(makePlayer({ party: { nara: "waiting", quill: "gone", ord: "with" } }))).toBe(true);
  });

  it("gestell at meltdown with too few dwellers fails even a perfect instance", () => {
    const p = prepared({ readiness: 100 });
    const w = makeWorld([p], { gestell: 100, clearing: { ...initialClearing(), open: true, heldBy: ["p1"] } });
    expect(w.clearing.heldBy.length).toBeLessThan(CLEARING_HOLD_ANGELS);
    expect(resolvePassing(w, p)).toBe("failed");
    const held = { ...w, clearing: { ...w.clearing, heldBy: ["p1", "p2"] } };
    expect(resolvePassing(held, p)).toBe("appearance");
    const edge = makeWorld([p], { gestell: GESTELL_MELTDOWN, clearing: { ...initialClearing(), heldBy: [] } });
    expect(resolvePassing(edge, p)).toBe("failed");
  });

  it("readiness 80, a willing party, a mortality act and low gestell resolves appearance", () => {
    const p = prepared({ readiness: 80 });
    expect(resolvePassing(makeWorld([p], { gestell: 20 }), p)).toBe("appearance");
    expect(resolvePassing(makeWorld([p], { gestell: 20 }), { ...p, readiness: 79 })).toBe("absence");
    expect(resolvePassing(makeWorld([p], { gestell: 20 }), { ...p, readiness: 59 })).toBe("failed");
    expect(resolvePassing(makeWorld([p], { gestell: 20 }), { ...p, flags: { [F.PREPARE]: 1 } })).toBe("failed");
    expect(resolvePassing(makeWorld([p], { gestell: 20 }), { ...p, party: { nara: "gone", quill: "with", ord: "with" } })).toBe("failed");
  });

  it("a cold operator take resolves hijack; a signed freeze with low restraint resolves hijack", () => {
    const cold = prepared({ readiness: 100, current: "cold", choices: { [C.OPERATOR]: "take" } });
    expect(resolvePassing(makeWorld([cold]), cold)).toBe("hijack");
    const warmTake = { ...cold, current: "readiness" as const };
    expect(resolvePassing(makeWorld([warmTake]), warmTake)).toBe("appearance");
    const safety = prepared({ readiness: 100, restraint: 30, choices: { [C.FREEZE]: "signed" } });
    expect(resolvePassing(makeWorld([safety]), safety)).toBe("hijack");
    const composed = { ...safety, restraint: 50 };
    expect(resolvePassing(makeWorld([composed]), composed)).toBe("appearance");
    // failure rules come first
    const coldAtMeltdown = makeWorld([cold], { gestell: 100 });
    expect(resolvePassing(coldAtMeltdown, cold)).toBe("failed");
  });
});

describe("applyPassing", () => {
  it("appearance writes choices, flags, history, the season and the stipend", () => {
    const w = makeWorld([prepared({ readiness: 80 })]);
    const next = applyPassing(w, "p1");
    const me = you(next);
    expect(me.choices[C.PASSING]).toBe("appearance");
    expect(me.flags[F.PASSING]).toBe(1);
    expect(me.history.passings).toBe(1);
    expect(me.history.outcomes).toEqual(["appearance"]);
    expect(me.bestand).toBe(PASSING_STIPEND);
    expect(next.flags["earned:stipend"]).toBe(PASSING_STIPEND);
    expect(next.flags[W.PASSINGS]).toBe(1);
    expect(next.passing.count).toBe(1);
    expect(next.passing.lastOutcome).toBe("appearance");
    expect(next.passing.lastBy).toBe("p1");
    expect(next.passing.lastAt).toBe(w.now);
    expect(next.passing.hijackedBy).toBe("");
    expect(next.passing.appearanceUntil).toBe(w.now + SEASON_LENGTH);
    expect(next.news).toHaveLength(1);
    expect(next.failed).toHaveLength(0);
  });

  it("is idempotent for the same Angel", () => {
    const w = makeWorld([prepared({ readiness: 80 })]);
    const once = applyPassing(w, "p1");
    const twice = applyPassing(once, "p1");
    expect(twice).toBe(once);
    expect(you(twice).bestand).toBe(PASSING_STIPEND);
    expect(twice.passing.count).toBe(1);
    expect(you(twice).history.passings).toBe(1);
  });

  it("absence and hijack are written and reported; hijack names who claimed the hour", () => {
    const absent = applyPassing(makeWorld([prepared({ readiness: 70 })]), "p1");
    expect(you(absent).choices[C.PASSING]).toBe("absence");
    expect(absent.passing.appearanceUntil).toBe(0);
    expect(you(absent).bestand).toBe(0);
    expect(absent.news).toHaveLength(1);

    const cold = applyPassing(makeWorld([prepared({ readiness: 90, current: "cold", choices: { [C.OPERATOR]: "take" } })]), "p1");
    expect(you(cold).choices[C.PASSING]).toBe("hijack");
    expect(cold.passing.hijackedBy).toBe("cold");
    expect(cold.news).toHaveLength(1);

    const safety = applyPassing(makeWorld([prepared({ readiness: 90, restraint: 10, choices: { [C.FREEZE]: "signed" } })]), "p1");
    expect(safety.passing.hijackedBy).toBe("safety");
    expect(you(safety).history.outcomes).toEqual(["hijack"]);
  });

  it("failed leaves a FailedPassing for the season, closes the ring and pays nothing", () => {
    const w = makeWorld([prepared({ readiness: 100 })], { gestell: 100, clearing: { ...initialClearing(), open: true, heldBy: ["p1"] } });
    const next = applyPassing(w, "p1");
    expect(you(next).choices[C.PASSING]).toBe("failed");
    expect(you(next).bestand).toBe(0);
    expect(next.failed).toHaveLength(1);
    expect(next.failed[0]).toMatchObject({ id: FAILED_MARK, season: 3, district: POSITIONS[FAILED_MARK].district });
    expect(next.pois[RING].state).toBe("failed");
    expect(next.clearing.open).toBe(false);
    expect(next.news).toHaveLength(1);
    // a second Angel failing the same season does not duplicate the mark
    const other = prepared({ id: "p2", readiness: 100 });
    const again = applyPassing({ ...next, players: new Map([...next.players, ["p2", other]]) }, "p2");
    expect(again.failed).toHaveLength(1);
    expect(again.passing.count).toBe(2);
  });

  it("refuses guests, the unprepared and the far away", () => {
    const guest = makeWorld([prepared({ guest: true, serial: null })]);
    expect(applyPassing(guest, "p1").passing.count).toBe(0);
    const unprepared = makeWorld([atRing({ readiness: 80, flags: { [F.MORTALITY]: 1 } })]);
    const u = applyPassing(unprepared, "p1");
    expect(u.passing.count).toBe(0);
    expect(you(u).flags[F.PASSING]).toBeUndefined();
    const far = makeWorld([prepared({ x: 0, y: 0 })]);
    expect(applyPassing(far, "p1")).toBe(far);
  });
});
