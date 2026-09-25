import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Ctx, Effect, NpcState, Player, PoiVerb, WorldState } from "../types";
import { GUEST_SPAWN, NPC_HOMES, POI_LIST, POSITIONS } from "../map";
import { AURA_DIM, M3_DOOR_PRICE, OPERATOR_YIELD, RESTRAINT_START, TEST_SERIAL } from "../constants";
import { C, F, POI_STATES, Q, W } from "./ids";
import { NPCS } from "./npcs";
import { POI_CONFIGS } from "./pois";
import { SPINE } from "./spine";
import * as LINES from "./lines";

const HERE = dirname(fileURLToPath(import.meta.url));
const ASSETS = resolve(HERE, "../../../public/assets");
const CONTENT_FILES = ["npcs.ts", "pois.ts", "spine.ts", "lines.ts"].map(f => resolve(HERE, f));

// ---------------------------------------------------------------- fixtures

function mkPlayer(over: Partial<Player> = {}): Player {
  return {
    id: "p1",
    name: "GUEST",
    x: GUEST_SPAWN.x,
    y: GUEST_SPAWN.y,
    facing: { dx: 1, dy: 0 },
    district: "nave",
    guest: true,
    serial: null,
    house: "",
    messenger: "",
    winkSchool: "",
    locked: false,
    hp: 100,
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
    aura: 0,
    auraSeed: 0,
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
    movement: 1,
    quests: {},
    flags: {},
    choices: {},
    party: { nara: "none", quill: "none", ord: "none" },
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
    respawn: { ...GUEST_SPAWN },
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

function mkWorld(over: Partial<WorldState> = {}): WorldState {
  const pois: WorldState["pois"] = {};
  for (const [id, states] of Object.entries(POI_STATES)) pois[id] = { state: states[0], by: "", at: 0, count: 0 };
  const npcs: WorldState["npcs"] = {};
  for (const h of Object.values(NPC_HOMES)) npcs[h.id] = { id: h.id, x: h.x, y: h.y, district: h.district, present: true, state: "home" };
  return {
    version: 2,
    now: 100,
    tick: 2000,
    gestell: 38,
    season: { id: 1, startedAt: 0 },
    weatherNamed: false,
    frozen: {},
    players: new Map(),
    intents: new Map(),
    npcs,
    enemies: [],
    nodes: [],
    wreckage: [],
    graves: [],
    pois,
    flags: {},
    houses: { standing: { earth: 0, sky: 0, mortals: 0, divinities: 0 }, tithe: 0, war: { active: false, startsAt: 600, endsAt: 0, held: { earth: 0, sky: 0, mortals: 0, divinities: 0 }, winner: "", lastWinner: "", site: "clearing-ring" } },
    clearing: { open: false, reserve: 40, openedAt: 0, seeds: [], contest: null, heldBy: [], lastOutcome: "" },
    passing: { count: 0, lastOutcome: "", lastBy: "", lastAt: 0, hijackedBy: "", appearanceUntil: 0 },
    market: [],
    news: [],
    failed: [],
    history: [],
    rng: 1,
    ...over,
  };
}

const flagsOf = (keys: string[]): Record<string, number> => Object.fromEntries(keys.map(k => [k, 1]));
const M1_FLAGS = [F.ARRIVED, F.INTAKE, F.FIRST_NODE, F.TALKED_QUILL, F.TALKED_ORD, F.TALKED_NARA, F.MEMORIAL, F.BURIED_NARA, F.WEATHER_SAFETY, F.WEATHER_ORD, F.WEATHER_NARA, F.WEATHER_NAMED];
const M2_FLAGS = [...M1_FLAGS, F.UNDER, F.ANGEL, F.CARE, F.SHRINE, F.HALL, F.FREEZE, F.BOARD, F.OPERATOR, F.M3];
const M3_FLAGS = [...M2_FLAGS, F.STRAIT, F.FOUNDRY, F.CABLE, F.MAP, F.GARDEN, F.FAILED, F.FORGE];
const M4_FLAGS = [...M3_FLAGS, F.MORTALITY, F.PREPARE, F.PASSING, F.CREDITS];

const angel = (serial: number, house: Player["house"], messenger: Player["messenger"], school: Player["winkSchool"], over: Partial<Player>): Player =>
  mkPlayer({ guest: false, serial, name: `#${String(serial).padStart(4, "0")}`, house, messenger, winkSchool: school, aura: 20, auraSeed: 12, ...over });

/** A spread of viewers across the campaign. Content predicates must not throw for any of them. */
function contexts(): { name: string; ctx: Ctx }[] {
  const base = mkWorld();
  const named = mkWorld({ weatherNamed: true, pois: { ...base.pois, "safety-plaque": { state: "named", by: "x", at: 1, count: 1 }, "going-under": { state: "open", by: "x", at: 1, count: 1 } } });
  const late = mkWorld({
    gestell: 92,
    flags: { [W.GARDEN_BURIED]: 1, [W.VESPER_GONE]: 1, [W.IONE_GONE]: 1, foundryDark: 1, [W.EXTRACTIONS]: 40, [W.BURIALS]: 3 },
    pois: {
      ...base.pois,
      "shrine-2": { state: "kept", by: "x", at: 1, count: 1 },
      "organ-strait": { state: "refused", by: "x", at: 1, count: 1 },
      "organ-foundry": { state: "dark", by: "x", at: 1, count: 1 },
      "wreckage-garden": { state: "buried", by: "x", at: 1, count: 1 },
      "clearing-ring": { state: "failed", by: "x", at: 1, count: 1 },
    },
  });
  const cult = [{ id: "cult:copper-binding", kind: "cult" as const, name: "Copper binding", qty: 1, value: 0, bound: true }];
  const list: { name: string; ctx: Ctx }[] = [
    { name: "guest fresh", ctx: { w: base, p: mkPlayer(), now: base.now } },
    { name: "guest mid M1", ctx: { w: base, p: mkPlayer({ flags: flagsOf([F.TALKED_NARA, F.TALKED_ORD, F.TALKED_QUILL, F.MEMORIAL, F.WEATHER_SAFETY]), choices: { [C.MEMORIAL]: "voice" }, extracted: 1 }), now: base.now } },
    { name: "guest locked", ctx: { w: named, p: mkPlayer({ flags: flagsOf(M1_FLAGS), choices: { [C.MEMORIAL]: "copper", [C.WEATHER]: "end" }, locked: true, kept: 1, x: POSITIONS["going-under"].x, y: POSITIONS["going-under"].y }), now: named.now } },
    { name: "angel M1 named", ctx: { w: named, p: angel(12, "sky", "witness", "omen", { flags: flagsOf(M1_FLAGS), choices: { [C.MEMORIAL]: "voice", [C.WEATHER]: "process" }, movement: 1 }), now: named.now } },
    { name: "angel 7777 M2 fresh", ctx: { w: named, p: angel(TEST_SERIAL, "mortals", "herald", "hint", { flags: flagsOf([...M1_FLAGS, F.UNDER, F.ANGEL]), movement: 2, party: { nara: "with", quill: "with", ord: "with" } }), now: named.now } },
    { name: "angel sky M2 signed", ctx: { w: named, p: angel(2, "sky", "witness", "wreckage", { flags: flagsOf([...M1_FLAGS, F.UNDER, F.ANGEL, F.SHRINE, F.CARE, F.HALL, F.FREEZE]), choices: { [C.FREEZE]: "signed" }, movement: 2, party: { nara: "with", quill: "with", ord: "with" } }), now: named.now } },
    { name: "angel earth M2 take", ctx: { w: late, p: angel(5, "earth", "cybernetic", "process", { flags: flagsOf(M2_FLAGS), choices: { [C.FREEZE]: "refused", [C.OPERATOR]: "take" }, movement: 3, current: "cold", party: { nara: "waiting", quill: "with", ord: "with" } }), now: late.now } },
    { name: "angel divinities M3 refuse", ctx: { w: late, p: angel(4, "divinities", "dweller", "dwelling", { flags: flagsOf(M3_FLAGS), choices: { [C.OPERATOR]: "refuse", [C.FORGE]: "spot", [C.MEMORIAL]: "copper" }, movement: 3, winke: 3, items: cult, party: { nara: "with", quill: "with", ord: "with" } }), now: late.now } },
    { name: "angel M4 lastword prepared", ctx: { w: late, p: angel(3, "mortals", "ruin", "wreckage", { flags: flagsOf([...M3_FLAGS, F.MORTALITY, F.PREPARE]), choices: { [C.OPERATOR]: "refuse", [C.MORTALITY]: "lastword", [C.FORGE]: "sell" }, movement: 4, party: { nara: "with", quill: "with", ord: "with" } }), now: late.now } },
    { name: "angel M4 nara gone", ctx: { w: late, p: angel(6, "earth", "iridescent", "surface", { flags: flagsOf([...M3_FLAGS, F.MORTALITY, F.PREPARE]), choices: { [C.OPERATOR]: "take", [C.MORTALITY]: "watch" }, movement: 4, party: { nara: "gone", quill: "with", ord: "gone" } }), now: late.now } },
    { name: "angel recent wink", ctx: { w: late, p: angel(7, "sky", "herald", "omen", { flags: flagsOf(M3_FLAGS), movement: 3, wink: "something", winkAt: late.now - 5, party: { nara: "with", quill: "with", ord: "with" } }), now: late.now } },
  ];
  for (const outcome of ["appearance", "absence", "hijack", "failed"]) {
    list.push({
      name: `angel after ${outcome}`,
      ctx: { w: late, p: angel(9, "mortals", "witness", "hint", { flags: flagsOf(M4_FLAGS), choices: { [C.OPERATOR]: outcome === "hijack" ? "take" : "refuse", [C.MORTALITY]: "burial", [C.PASSING]: outcome, [C.FREEZE]: "signed" }, movement: 5, party: { nara: "with", quill: "with", ord: "with" } }), now: late.now },
    });
  }
  return list;
}

const CTXS = contexts();
const SHARED_NPC: NpcState = { id: "x", x: 0, y: 0, district: "nave", present: true, state: "home" };

/** Collect every string a content value can produce, calling functions with each fixture ctx. */
function collectStrings(value: unknown, out: string[], depth = 0, seen = new Set<unknown>()): void {
  if (depth > 10 || value == null) return;
  if (typeof value === "string") { out.push(value); return; }
  if (typeof value === "function") {
    for (const { ctx } of CTXS) {
      let r: unknown;
      try { r = (value as (a: Ctx, b: NpcState) => unknown)(ctx, SHARED_NPC); } catch (e) { throw new Error(`content function threw: ${(e as Error).message}`); }
      collectStrings(r, out, depth + 1, seen);
    }
    return;
  }
  if (typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);
  if (value instanceof Map || value instanceof Set) return;
  for (const v of Object.values(value as Record<string, unknown>)) collectStrings(v, out, depth + 1, seen);
}

const FORBIDDEN = [
  "studio", "film", "documentary", "director", "collective", "screening", "dispatch", "production still",
  "observer room", "participant room", "founder room",
  "cloud", "aerith", "sephiroth", "tifa", "barret", "cid", "midgar", "shinra", "materia", "lifestream",
];
const forbiddenIn = (text: string): string[] => FORBIDDEN.filter(w => new RegExp(`\\b${w}\\b`, "i").test(text));

// ---------------------------------------------------------------- tests

describe("POI configs", () => {
  it("cover every POI in the map and nothing else", () => {
    for (const p of POI_LIST) expect(POI_CONFIGS[p.id], p.id).toBeDefined();
    for (const id of Object.keys(POI_CONFIGS)) expect(POI_LIST.some(p => p.id === id), id).toBe(true);
  });

  it("every verb has a key, label, choice and a valid guest policy, and costs use a known sink", () => {
    const sinks = new Set(["tax", "repair", "restore", "listing", "tithe", "freeze", "insurance", "upkeep", "funeral", "forge", "door", "bank"]);
    for (const cfg of Object.values(POI_CONFIGS)) {
      expect(cfg.verbs.length, cfg.id).toBeGreaterThan(0);
      for (const v of cfg.verbs) {
        expect(["F", "E", "Q"]).toContain(v.key);
        expect(v.label.length).toBeGreaterThan(0);
        expect(v.choice.length).toBeGreaterThan(0);
        if (v.guest) expect(["allow", "spectate", "deny"]).toContain(v.guest);
        if (v.cost) { expect(v.cost.bestand).toBeGreaterThan(0); expect(sinks.has(v.cost.sink), `${cfg.id} ${v.choice}`).toBe(true); }
      }
    }
  });

  it("never offers two verbs on the same key to the same viewer", () => {
    const live = (v: PoiVerb, ctx: Ctx) => (!v.when || v.when(ctx)) && !(v.once && (ctx.p.flags[v.once] ?? 0) > 0);
    for (const { name, ctx } of CTXS) {
      for (const cfg of Object.values(POI_CONFIGS)) {
        const keys = cfg.verbs.filter(v => live(v, ctx)).map(v => v.key);
        expect(new Set(keys).size, `${cfg.id} for ${name}: ${keys.join(",")}`).toBe(keys.length);
      }
    }
  });

  it("sacred POIs spectate guests; the going-under and the recorder allow them", () => {
    const sacred = ["care-shrine", "clinic", "funeral-desk", "hall-mortals", "hall-sky", "hall-divinities", "hall-earth", "wreckage-garden", "safety-desk", "shrine-1", "shrine-2", "shrine-3", "mute-bell", "hour-bell", "last-god-trace", "cult-vault", "organ-strait", "organ-foundry", "organ-cable", "cold-desk", "clearing-ring", "seed-1", "seed-2", "seed-3", "seed-4", "claims-desk", "listing-board", "operator-desk"];
    for (const id of sacred) {
      for (const v of POI_CONFIGS[id].verbs) expect(v.guest, `${id} ${v.choice}`).toBe("spectate");
      expect(LINES.SPECTATOR_LINES[id], id).toBeTruthy();
    }
    for (const id of ["going-under", "memorial-recorder", "nara-plot", "safety-plaque"]) {
      for (const v of POI_CONFIGS[id].verbs) expect(v.guest ?? "allow", `${id} ${v.choice}`).toBe("allow");
    }
  });

  it("the key decisions agree between the desk and the dialogue", () => {
    const take = POI_CONFIGS["operator-desk"].verbs.find(v => v.choice === "take")!;
    const refuse = POI_CONFIGS["operator-desk"].verbs.find(v => v.choice === "refuse")!;
    expect(take.once).toBe(F.OPERATOR);
    expect(refuse.once).toBe(F.OPERATOR);
    const takeEffects = JSON.stringify(take.effects);
    expect(takeEffects).toContain(`"value":"take"`);
    expect(takeEffects).toContain(`"key":"${F.M3}"`);
    expect(takeEffects).toContain(`"key":"${W.VESPER_GONE}"`);
    const vTake = JSON.stringify(NPCS.vesper.nodes.take.effects);
    expect(vTake).toContain(`"value":"take"`);
    expect(vTake).toContain(`"key":"${F.OPERATOR}"`);
    expect(vTake).toContain(`"key":"${F.M3}"`);
    // the operator earner ships its sink on both paths: the yield pays the door
    for (const effects of [take.effects, NPCS.vesper.nodes.take.effects] as Effect[][]) {
      expect(effects.some(e => e.kind === "bestand" && e.delta === OPERATOR_YIELD && e.earner === "operator")).toBe(true);
      expect(effects.some(e => e.kind === "bestand" && e.delta === -M3_DOOR_PRICE && e.sink === "door")).toBe(true);
    }
    // the offer is decided once: its choices hide after the decision, whichever desk decided it
    const decided = { ...CTXS.find(c => c.name === "angel earth M2 take")!.ctx };
    const offer = NPCS.vesper.nodes.offer.choices!;
    expect(offer.filter(c => !c.when || c.when(decided)).map(c => c.id)).toEqual(["wait"]);
    const undecided = CTXS.find(c => c.name === "angel sky M2 signed")!.ctx;
    expect(offer.filter(c => !c.when || c.when(undecided)).map(c => c.id)).toEqual(["take", "refuse", "wait"]);
    const said = CTXS.find(c => c.name === "angel M4 lastword prepared")!.ctx;
    expect(NPCS.ione.nodes.offer.choices!.filter(c => !c.when || c.when(said)).map(c => c.id)).toEqual(["wait"]);
    expect(NPCS.quill.nodes["forge-lesson"].choices!.filter(c => !c.when || c.when(said)).map(c => c.id)).toEqual(["think"]);
    expect(NPCS.nara.nodes.memorial.choices!.filter(c => !c.when || c.when(said)).map(c => c.id)).toEqual(["look"]);
    const vRefuse = JSON.stringify(NPCS.vesper.nodes.refuse.effects);
    expect(vRefuse).toContain(`"value":"refuse"`);
    expect(vRefuse).toContain(`"key":"${F.OPERATOR}"`);
    // memorial at the recorder and in Nara's dialogue
    for (const [choice, node] of [["copper", "memorial-copper"], ["voice", "memorial-voice"]] as const) {
      const verb = POI_CONFIGS["memorial-recorder"].verbs.find(v => v.choice === choice)!;
      expect(verb.once).toBe(F.MEMORIAL);
      expect(JSON.stringify(verb.effects)).toContain(`"value":"${choice}"`);
      expect(JSON.stringify(NPCS.nara.nodes[node].effects)).toContain(`"value":"${choice}"`);
    }
  });

  it("names the weather with three verbs once all three names are heard", () => {
    const named = CTXS.find(c => c.name === "angel M1 named")!.ctx;
    const heard = { ...named, p: { ...named.p, flags: { ...named.p.flags, [F.WEATHER_NAMED]: 0 } } };
    const verbs = POI_CONFIGS["safety-plaque"].verbs.filter(v => v.when?.(heard));
    expect(verbs.map(v => v.choice).sort()).toEqual(["end", "process", "stability"]);
    expect(verbs.map(v => v.key).sort()).toEqual(["E", "F", "Q"]);
  });
});

describe("dialogue", () => {
  it("every next and choice.next id exists, and entry always resolves", () => {
    for (const npc of Object.values(NPCS)) {
      for (const node of Object.values(npc.nodes)) {
        expect(node.id).toBeTruthy();
        if (typeof node.next === "string") expect(npc.nodes[node.next], `${npc.id}.${node.id} -> ${node.next}`).toBeDefined();
        if (typeof node.next === "function") {
          for (const { name, ctx } of CTXS) {
            const n = node.next(ctx);
            if (n !== undefined) expect(npc.nodes[n], `${npc.id}.${node.id} -> ${n} for ${name}`).toBeDefined();
          }
        }
        for (const c of node.choices ?? []) {
          if (c.next) expect(npc.nodes[c.next], `${npc.id}.${node.id}/${c.id} -> ${c.next}`).toBeDefined();
        }
      }
      for (const { name, ctx } of CTXS) {
        const entry = npc.entry(ctx);
        expect(npc.nodes[entry], `${npc.id} entry ${entry} for ${name}`).toBeDefined();
      }
    }
  });

  it("has the roster with homes, portraits and node counts the movements need", () => {
    const minimum: Record<string, number> = { nara: 14, quill: 12, ord: 12, vesper: 8, ione: 6 };
    for (const [id, min] of Object.entries(minimum)) {
      const npc = NPCS[id];
      expect(npc, id).toBeDefined();
      expect(npc.id).toBe(id);
      expect(npc.sprite).toBe(id);
      expect(npc.portrait).toBe(`${id}.jpg`);
      expect(POSITIONS[npc.home], npc.home).toBeDefined();
      expect(Object.keys(npc.nodes).length, id).toBeGreaterThanOrEqual(min);
    }
    expect(NPCS.nara.party && NPCS.quill.party && NPCS.ord.party).toBe(true);
    expect(NPCS.vesper.party || NPCS.ione.party).toBe(false);
  });

  it("the party notices you acting on a Wink they cannot see, once per Wink", () => {
    const recent = CTXS.find(c => c.name === "angel recent wink")!.ctx;
    for (const id of ["nara", "quill", "ord"]) {
      expect(NPCS[id].entry(recent)).toBe("blind");
      const blind = NPCS[id].nodes.blind;
      expect(String(blind.text)).toContain("You're looking at something I'm not.");
      const effects = typeof blind.effects === "function" ? blind.effects(recent) : blind.effects ?? [];
      const flag = effects.find(e => e.kind === "flag");
      expect(flag).toBeDefined();
      const after = { ...recent, p: { ...recent.p, flags: { ...recent.p.flags, [(flag as { key: string }).key]: (flag as { value?: number }).value ?? 1 } } };
      expect(NPCS[id].entry(after)).not.toBe("blind");
      expect(NPCS[id].nodes[NPCS[id].entry(after)]).toBeDefined();
    }
    const guest = CTXS.find(c => c.name === "guest fresh")!.ctx;
    const guestWink = { ...guest, p: { ...guest.p, wink: "x", winkAt: guest.now - 1 } };
    expect(NPCS.nara.entry(guestWink)).not.toBe("blind");
  });

  it("personal overrides move the party by flags and remove the two operators when they are gone", () => {
    const m3 = CTXS.find(c => c.name === "angel earth M2 take")!.ctx; // operator taken, garden not buried
    expect(NPCS.nara.personal!(m3, SHARED_NPC)).toMatchObject({ x: POSITIONS["station:nara-garden"].x, y: POSITIONS["station:nara-garden"].y });
    expect(NPCS.quill.personal!(m3, SHARED_NPC)).toMatchObject({ x: POSITIONS["station:quill-forge"].x });
    expect(NPCS.ord.personal!(m3, SHARED_NPC)).toMatchObject({ x: POSITIONS["station:ord-strait"].x });
    expect(NPCS.vesper.personal!(m3, SHARED_NPC)).toMatchObject({ present: false });
    const last = CTXS.find(c => c.name === "angel M4 lastword prepared")!.ctx;
    expect(NPCS.ione.personal!(last, SHARED_NPC)).toMatchObject({ present: false });
    const early = CTXS.find(c => c.name === "angel 7777 M2 fresh")!.ctx;
    expect(NPCS.ione.personal!(early, SHARED_NPC)).toBeNull();
    expect(NPCS.vesper.personal!(early, SHARED_NPC)).toBeNull();
  });

  it("the party and the operators do not look up at a dark aura; a Glamour or a guest is addressed", () => {
    const lit = CTXS.find(c => c.name === "angel 7777 M2 fresh")!.ctx;
    const dark = { ...lit, p: { ...lit.p, aura: AURA_DIM - 1 } };
    for (const id of ["nara", "quill", "ord", "vesper", "ione"]) {
      expect(NPCS[id].entry(lit)).not.toBe("dark");
      expect(NPCS[id].entry(dark), id).toBe("dark");
      const line = NPCS[id].nodes.dark.text;
      expect(typeof line === "string" ? line : line(dark)).toMatch(/aura|look/i);
      expect(NPCS[id].nodes.dark.choices ?? []).toEqual([]);
    }
    const glamour = { ...dark, p: { ...dark.p, kit: { verb: "iridescent" as const, until: dark.now + 10 } } };
    expect(NPCS.nara.entry(glamour)).not.toBe("dark");
    const guest = CTXS.find(c => c.name === "guest fresh")!.ctx;
    expect(NPCS.nara.entry(guest)).toBe("first");
  });

  it("the sacred doors are dark to a dark aura and dim in fat weather; the shrine still offers a place to stand", () => {
    const late = CTXS.find(c => c.name === "angel divinities M3 refuse")!.ctx; // winke 3, a cult object in hand, but a world at 92
    const lit = { ...late, w: { ...late.w, gestell: 38 } };
    const live = (id: string, ctx: Ctx) => POI_CONFIGS[id].verbs.filter(v => !v.when || v.when(ctx)).map(v => v.choice);
    expect(live("last-god-trace", lit)).toEqual(["face"]);
    expect(live("cult-vault", lit)).toEqual(["open"]);
    expect(live("shrine-1", lit)).toEqual(["keep"]);
    const dark = { ...lit, p: { ...lit.p, aura: AURA_DIM - 1 } };
    expect(live("last-god-trace", dark)).toEqual(["look"]);
    expect(live("cult-vault", dark)).toEqual(["try"]);
    expect(live("shrine-1", dark)).toEqual(["stand"]);
    const fat = { ...lit, w: { ...lit.w, gestell: 80 } };
    expect(live("shrine-1", fat)).toEqual(["stand"]);
    expect(live("shrine-1", { ...fat, p: { ...fat.p, aura: 60 } })).toEqual(["keep"]);
    const stand = POI_CONFIGS["shrine-1"].verbs.find(v => v.choice === "stand")!;
    expect(typeof stand.say === "function" ? stand.say(dark) : stand.say).toContain("dark");
    expect(typeof stand.say === "function" ? stand.say(fat) : stand.say).toContain("Fat weather");
  });

  it("Ione's last word and Quill's forge set the key decisions", () => {
    expect(JSON.stringify(NPCS.ione.nodes.lastword.effects)).toContain(`"value":"lastword"`);
    expect(JSON.stringify(NPCS.ione.nodes.lastword.effects)).toContain(`"key":"${W.IONE_GONE}"`);
    expect(JSON.stringify(NPCS.quill.nodes["forge-spot"].effects)).toContain(`"value":"spot"`);
    expect(JSON.stringify(NPCS.quill.nodes["forge-sell"].effects)).toContain(`"value":"sell"`);
    expect(JSON.stringify(NPCS.ord.nodes.map.effects)).toContain(`"key":"${F.MAP}"`);
  });
});

describe("spine", () => {
  it("has the four movements in order with the ids from content/ids", () => {
    expect(SPINE.map(q => q.id)).toEqual([Q.M1, Q.M2, Q.M3, Q.M4]);
    expect(SPINE.map(q => q.movement)).toEqual([1, 2, 3, 4]);
    expect(SPINE.map(q => q.guestLegal)).toEqual([true, false, false, false]);
    for (const q of SPINE) expect(q.kind).toBe("spine");
  });

  it("every step target resolves to a position, an NPC home or a station", () => {
    for (const q of SPINE) {
      for (const s of q.steps) {
        expect(s.title.length).toBeGreaterThan(0);
        expect(s.plate, `${q.id}/${s.id}`).toBeTruthy();
        const targets: (string | undefined)[] = typeof s.target === "function" ? CTXS.map(c => (s.target as (ctx: Ctx) => string | undefined)(c.ctx)) : [s.target];
        for (const t of targets) {
          if (t === undefined) continue;
          expect(POSITIONS[t], `${q.id}/${s.id} -> ${t}`).toBeDefined();
        }
      }
    }
  });

  it("predicates and effects run for every fixture viewer without throwing", () => {
    for (const q of SPINE) {
      for (const { ctx } of CTXS) {
        expect(typeof q.available(ctx)).toBe("boolean");
        for (const s of q.steps) {
          expect(typeof s.done(ctx)).toBe("boolean");
          if (typeof s.onComplete === "function") expect(Array.isArray(s.onComplete(ctx))).toBe(true);
          if (typeof s.detail === "function") expect(typeof s.detail(ctx)).toBe("string");
        }
        if (typeof q.onFinish === "function") expect(Array.isArray(q.onFinish(ctx))).toBe(true);
      }
    }
  });

  it("guests finish Movement I locked and get no movement change; Angels move on", () => {
    const m1 = SPINE[0];
    const locked = CTXS.find(c => c.name === "guest locked")!.ctx;
    expect(m1.steps.every(s => s.done(locked))).toBe(true);
    expect((m1.onFinish as (ctx: Ctx) => unknown[])(locked)).toEqual([]);
    const named = CTXS.find(c => c.name === "angel M1 named")!.ctx;
    const under = { ...named, p: { ...named.p, flags: { ...named.p.flags, [F.UNDER]: 1 } } };
    expect(m1.steps[m1.steps.length - 1].done(under)).toBe(true);
    expect(JSON.stringify((m1.onFinish as (ctx: Ctx) => unknown[])(under))).toContain(`"value":2`);
    expect(SPINE[1].available(locked)).toBe(false);
  });

  it("the credits step completes at once and ends the spine in movement 5", () => {
    const credits = SPINE[3].steps[SPINE[3].steps.length - 1];
    expect(credits.id).toBe("credits");
    expect(credits.done(CTXS[0].ctx)).toBe(true);
    expect(JSON.stringify(credits.onComplete)).toContain(`"value":5`);
    expect(JSON.stringify(credits.onComplete)).toContain(`"key":"${F.CREDITS}"`);
  });

  it("the first node step records the decision the engine does not", () => {
    const step = SPINE[0].steps.find(s => s.id === "first-node")!;
    const mid = CTXS.find(c => c.name === "guest mid M1")!.ctx;
    expect(step.done(mid)).toBe(true);
    const eff = (step.onComplete as (ctx: Ctx) => unknown[])(mid);
    expect(JSON.stringify(eff)).toContain(`"value":"extract"`);
    const kept = { ...mid, p: { ...mid.p, extracted: 0, kept: 1 } };
    expect(JSON.stringify((step.onComplete as (ctx: Ctx) => unknown[])(kept))).toContain(`"value":"keep"`);
  });
});

describe("assets", () => {
  it("every plate and portrait exists under public/assets", () => {
    const files = new Set<string>();
    for (const npc of Object.values(NPCS)) files.add(npc.portrait);
    for (const cfg of Object.values(POI_CONFIGS)) if (cfg.plate) files.add(cfg.plate);
    for (const q of SPINE) for (const s of q.steps) if (s.plate) files.add(s.plate);
    expect(files.size).toBeGreaterThan(10);
    for (const f of files) expect(existsSync(resolve(ASSETS, f)), f).toBe(true);
  });
});

describe("lines", () => {
  it("exports every constant the engine references", () => {
    const needed = [
      "GUEST_LOCK", "SPECTATOR", "ALREADY", "CANT_AFFORD", "CANT_USE", "FROZEN", "DODGE_COPY", "DODGE_WHIFF", "INTERRUPT", "HIT_COPY", "ARENA_HIT",
      "GUEST_GRIEF", "TRUCE_ACTIVE", "PRACTICE_SAFE", "PVP_FLAG_REQUIRED", "FLAG_GUEST", "FLAG_WHERE", "FLAG_ON", "FLAG_OFF", "TRUCE_COPY", "SPOILS_COPY",
      "CAMP_COPY", "DUEL_COPY", "SPECTATE_COPY", "STORM_PRESS", "STORM_FALLEN", "KIT_GUEST", "KIT_COOLDOWN", "KIT_NEED", "KIT_COPY", "CLAIMS_GUEST",
      "CLAIMS_FILED", "CLAIMS_HELD", "CLAIMS_TAKEN", "CLAIMS_CAP", "BANKED", "LINK_ELSEWHERE", "LINK_COPY", "NARA_LEAVES", "NARA_WAITS", "LOOT_COPY",
      "BURY_COPY", "DEATH_BY", "INSURANCE_USED", "WEATHER_LABELS", "WINKE", "CREDITS", "WEATHER_NAMES",
    ];
    for (const k of needed) expect((LINES as Record<string, unknown>)[k], k).toBeDefined();
    expect(LINES.GUEST_LOCK).toBe("A guest cannot prepare the ground.");
    expect(LINES.LINK_COPY(42, "mortals", "ruin")).toContain("#0042");
    expect(LINES.LINK_COPY(42, "mortals", "ruin")).toContain("House of Mortals");
    expect(LINES.DEATH_BY("Desk Three")).toContain("Desk Three");
    for (const m of ["herald", "witness", "ruin", "dweller", "cybernetic", "iridescent"] as const) {
      expect(LINES.KIT_NEED[m]).toBeTruthy();
      expect(LINES.KIT_COPY[m]).toBeTruthy();
    }
    expect(Object.keys(LINES.WEATHER_NAMES).sort()).toEqual(["end", "process", "stability"]);
  });

  it("has at least six Winke per school that never name what they point at", () => {
    for (const school of ["hint", "wreckage", "omen", "dwelling", "process", "surface"] as const) {
      expect(LINES.WINKE[school].length, school).toBeGreaterThanOrEqual(6);
      for (const line of LINES.WINKE[school]) expect(/last god|\bgod\b/i.test(line), line).toBe(false);
    }
  });

  it("credits name only the game and the city", () => {
    expect(LINES.CREDITS.length).toBeGreaterThanOrEqual(6);
    expect(LINES.CREDITS.length).toBeLessThanOrEqual(10);
    expect(LINES.CREDITS[0]).toBe("REVERIE: THE GAME");
    for (const line of LINES.CREDITS) expect(/[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+/.test(line.replace(/Nave of Tubes|Wet Grid|Safety Annex|Kerb of Hours|Gold Ring|REVERIE: THE GAME/g, "")), line).toBe(false);
  });
});

describe("the register", () => {
  it("contains no forbidden words in any string the content can produce", () => {
    const out: string[] = [];
    collectStrings(NPCS, out);
    collectStrings(POI_CONFIGS, out);
    collectStrings(SPINE, out);
    collectStrings(LINES, out);
    expect(out.length).toBeGreaterThan(300);
    for (const s of out) expect(forbiddenIn(s), s).toEqual([]);
  });

  it("contains no forbidden words in the source text of the content files", () => {
    for (const f of CONTENT_FILES) {
      const text = readFileSync(f, "utf8");
      expect(forbiddenIn(text), f).toEqual([]);
    }
  });

  it("never quotes a philosopher by name", () => {
    const out: string[] = [];
    collectStrings(NPCS, out);
    collectStrings(POI_CONFIGS, out);
    collectStrings(SPINE, out);
    collectStrings(LINES, out);
    for (const s of out) expect(/heidegger|benjamin|nietzsche|hegel|kant\b|plato|aristotle/i.test(s), s).toBe(false);
  });
});
