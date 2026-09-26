import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SIDE, SIDE_BY_ID, SIDE_ITEMS, SIDE_PLACES, SF, SC, SQ, offerKey } from "./side";
import { SIDE_NPCS } from "./side-npcs";
import { SIDE_POI_VERBS } from "./side-pois";
import { NEWS, newsFor } from "./news";
import { F, POI_STATES, SINKS } from "./ids";
import {
  GUEST_SPAWN, NODE_LIST, NPC_HOMES, POIS, POSITIONS, blockedFor, circleHitsWalls, districtAt, idx, isWall, reachableTiles, tileOf,
} from "../map";
import { BODY_R } from "../constants";
import type { Ctx, DistrictId, Effect, Fourfold, Item, NpcState, Player, Quest, WorldState } from "../types";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", "..");
const ASSETS = join(ROOT, "public", "assets");
const OWN_FILES = ["side.ts", "side-npcs.ts", "side-pois.ts", "news.ts"].map(f => join(HERE, f));

// ---------------------------------------------------------------- stubs

function player(over: Partial<Player> = {}): Player {
  return {
    id: "p1", name: "#0042", x: GUEST_SPAWN.x, y: GUEST_SPAWN.y, facing: { dx: 0, dy: 1 }, district: "nave",
    guest: false, serial: 42, house: "mortals", messenger: "herald", winkSchool: "hint", locked: false,
    hp: 100, dead: false, strikeCd: 0, heavyCd: 0, heavyWindup: 0, hitStop: 0, dodgeT: 0, dodgeCd: 0, dodgeX: 0, dodgeY: 0, stance: "restraint", kitCd: 0, kit: null,
    aura: 20, auraSeed: 10, bestand: 100, banked: 0, winke: 0, fakeWinke: 0, readiness: 0, restraint: 60, current: "", extracted: 0, kept: 0, extractedSinceFuneral: 0,
    movement: 1, quests: {}, flags: {}, choices: {}, party: { nara: "none", quill: "none", ord: "none" }, dialogue: null, frozenBy: "",
    flagged: false, truceUntil: 0, lastKillId: "", lastKillAt: 0, campCount: 0, spectated: 0, kills: 0, deaths: 0,
    items: [], claims: [], claimsFiled: 0, insured: false, respawn: { ...GUEST_SPAWN },
    heard: "", heardAt: 0, wink: "", winkAt: 0, notices: [],
    history: { passings: 0, buried: 0, looted: 0, houses: [], outcomes: [] }, linkedAt: 0, createdAt: 0,
    ...over,
  };
}

function guest(over: Partial<Player> = {}): Player {
  return player({ guest: true, serial: null, name: "GUEST", house: "", messenger: "", winkSchool: "", aura: 0, ...over });
}

function world(over: Partial<WorldState> = {}): WorldState {
  const pois = Object.fromEntries(Object.entries(POI_STATES).map(([id, states]) => [id, { state: states[0], by: "", at: 0, count: 0 }]));
  const npcs: Record<string, NpcState> = Object.fromEntries(Object.values(NPC_HOMES).map(h => [h.id, { id: h.id, x: h.x, y: h.y, district: h.district, present: true, state: "home" }]));
  return {
    version: 2, now: 100, tick: 0, gestell: 38, season: { id: 1, startedAt: 0 }, weatherNamed: false, frozen: {},
    players: new Map(), intents: new Map(), npcs, enemies: [],
    nodes: NODE_LIST.map(n => ({ id: n.id, district: n.district, x: n.x, y: n.y, charges: 3, regenAt: 0, kept: false, keptBy: "", announcedUntil: 0, seed: false })),
    wreckage: [], graves: [], pois, flags: {},
    houses: { standing: { earth: 0, sky: 0, mortals: 0, divinities: 0 }, tithe: 0, war: { active: false, startsAt: 600, endsAt: 0, held: { earth: 0, sky: 0, mortals: 0, divinities: 0 }, winner: "", lastWinner: "", site: "clearing-ring" } },
    clearing: { open: false, reserve: 40, openedAt: 0, seeds: [], contest: null, heldBy: [], lastOutcome: "" },
    passing: { count: 0, lastOutcome: "", lastBy: "", lastAt: 0, hijackedBy: "", appearanceUntil: 0 },
    market: [], news: [], failed: [], history: [], rng: 1,
    ...over,
  };
}

const ctxOf = (p: Player, w: WorldState = world()): Ctx => ({ w, p, now: w.now });

/** An Angel who has done the whole spine, for evaluating function-form content. */
function richPlayer(over: Partial<Player> = {}): Player {
  const flags: Record<string, number> = {};
  for (const key of Object.values(F)) flags[key] = 1;
  return player({
    flags, movement: 4, house: "mortals", district: "wet", kept: 4,
    choices: { "freeze": "signed", "forge": "spot", "operator": "take", "memorial": "voice", "weather": "process" },
    items: [{ id: "copy:wink", kind: "exhibition", name: "copy", qty: 1, value: 9 }],
    ...over,
  });
}
function richWorld(): WorldState {
  const w = world();
  w.flags = { memorialVoice: 1, vesperGone: 1, gardenBuried: 1 };
  w.pois["hour-bell"] = { state: "struck", by: "", at: 0, count: 1 };
  return w;
}

const resolve = (effects: Effect[] | ((ctx: Ctx) => Effect[]) | undefined, ctx: Ctx): Effect[] =>
  effects === undefined ? [] : typeof effects === "function" ? effects(ctx) : effects;

/** Every ctx variant we evaluate function-form content against. */
function variants(): Ctx[] {
  const rw = richWorld();
  const out: Ctx[] = [ctxOf(richPlayer(), rw), ctxOf(guest({ district: "wet" }), world()), ctxOf(player(), world())];
  for (const house of ["earth", "sky", "mortals", "divinities"] as Fourfold[]) out.push(ctxOf(richPlayer({ house }), rw));
  out.push(ctxOf(richPlayer({ choices: { ...richPlayer().choices, [SC.TOLL]: "paid", [SC.FORM9]: "filed" } }), rw));
  out.push(ctxOf(richPlayer({ choices: { ...richPlayer().choices, [SC.TOLL]: "refused", [SC.FORM9]: "refused" } }), rw));
  out.push(ctxOf(richPlayer({ flags: { ...richPlayer().flags, [SF.HONEST_FOUND]: 1, [SF.TWELVE_NAMED]: 1, [SF.FEE_1]: 1, [SF.FEE_3]: 1, [SF.SWEEP_1]: 1 } }), rw));
  return out;
}

// ---------------------------------------------------------------- what the side content sets

type Sets = { flags: Set<string>; choices: Set<string>; pois: Set<string>; world: Set<string>; items: Set<string>; standings: number; npcs: Set<string>; starts: Set<string> };

function collect(effects: Effect[], into: Sets) {
  for (const e of effects) {
    switch (e.kind) {
      case "flag": case "count": into.flags.add(e.key); break;
      case "choice": into.choices.add(e.key); break;
      case "poi": into.pois.add(`${e.id}:${e.state}`); break;
      case "worldFlag": case "worldCount": into.world.add(e.key); break;
      case "item": if (e.add) into.items.add(e.add.id); break;
      case "standing": into.standings++; break;
      case "npc": into.npcs.add(e.id); break;
      case "quest": if (e.op === "start") into.starts.add(e.id); break;
      default: break;
    }
  }
}

function questEffects(q: Quest): Effect[] {
  const out: Effect[] = [];
  for (const ctx of variants()) {
    out.push(...resolve(q.onStart, ctx), ...resolve(q.onFinish, ctx));
    for (const s of q.steps) out.push(...resolve(s.onComplete, ctx));
  }
  return out;
}

function everythingSet(): { quests: Sets; verbs: Sets; npcs: Sets } {
  const fresh = (): Sets => ({ flags: new Set(), choices: new Set(), pois: new Set(), world: new Set(), items: new Set(), standings: 0, npcs: new Set(), starts: new Set() });
  const quests = fresh();
  const verbs = fresh();
  const npcs = fresh();
  for (const q of SIDE) collect(questEffects(q), quests);
  for (const list of Object.values(SIDE_POI_VERBS)) {
    for (const v of list) {
      if (v.once) verbs.flags.add(v.once);
      for (const ctx of variants()) collect(resolve(v.effects, ctx), verbs);
    }
  }
  for (const def of Object.values(SIDE_NPCS)) {
    for (const n of Object.values(def.nodes)) {
      for (const ctx of variants()) {
        collect(resolve(n.effects, ctx), npcs);
        for (const c of n.choices ?? []) collect(resolve(c.effects, ctx), npcs);
      }
    }
  }
  return { quests, verbs, npcs };
}

// ---------------------------------------------------------------- satisfiers: what makes each step done

type Sat = { flags?: Record<string, number>; choices?: Record<string, string>; pois?: Record<string, string>; kept?: number; buried?: number };
const f = (...keys: string[]): Sat => ({ flags: Object.fromEntries(keys.map(k => [k, 1])) });
const poi = (id: string, state: string): Sat => ({ pois: { [id]: state } });

/** Per quest, per step: one or more ways the side content's own effects make `done` true. */
const SATISFIERS: Record<string, Sat[][]> = {
  [SQ.THIRD_ALTAR]: [[f(SF.ALTAR_COUNTED)], [f(SF.ALTAR_LIT), poi("crt-altar-2", "lit")]],
  [SQ.UNSPENT]: [[{ kept: 2 }], [f(SF.UNSPENT_TOUCHED), poi("crt-altar-1", "lit")]],
  [SQ.ANOTHER_NIGHT]: [[f(SF.NIGHT_SAT)], [f(SF.NIGHT_HEARD)]],
  [SQ.DOING_A_JOB]: [[{ buried: 1 }], [f(SF.JOB_NAMES)]],
  [SQ.VAN]: [[f(SF.VAN_ASKED)], [f(SF.VAN_WAVED), poi("hot-street", "hot")]],
  [SQ.COPY]: [[f(SF.COPY_READ)], [f(SF.COPY_DOWN)]],
  [SQ.LISTING_FEE]: [[f(SF.FEE_1, SF.FEE_2)], [f(SF.FEE_3, SF.FEE_4)]],
  [SQ.TRAY]: [[f(SF.TRAY_BANKED)], [f(SF.TRAY_TAKEN)]],
  [SQ.DESK]: [[f(SF.DESK_READ)], [f(SF.DESK_CLOSED), poi("operator-desk", "closed")]],
  [SQ.LEDGER]: [[{ buried: 2 }], [f(SF.LEDGER_REPORTED)]],
  [SQ.TWELVE]: [[f(SF.TWELVE_PLATE)], [f(SF.TWELVE_BURIED)], [f(SF.TWELVE_NAMED)]],
  [SQ.STANDING]: [[f(SF.STANDING_FUNERAL)], [f(SF.STANDING_ENTERED)]],
  [SQ.LAMP]: [[f(SF.LAMP_LIT), poi("hall-mortals", "lit")], [f(SF.LAMP_TOLD)]],
  [SQ.FORM9]: [[f(SF.FORM9_ASKED)], [f(SF.FORM9_FILED), { choices: { [SC.FORM9]: "refused" } }]],
  [SQ.HONEST]: [[f(SF.HONEST_FOUND)], [f(SF.HONEST_TOLD)]],
  [SQ.TAX]: [[f(SF.TAX_READ)], [f(SF.TAX_PAID)]],
  [SQ.NOTICE]: [[f(SF.NOTICE_REFUSED)], [f(SF.NOTICE_REPORTED)]],
  [SQ.CENSUS]: [[f(SF.CENSUS_FIRST)], [f(SF.CENSUS_LAST)], [f(SF.CENSUS_REPORTED)]],
  [SQ.HOUR]: [[{ flags: { [SF.HOUR_WAITED]: 3 } }], [f(SF.HOUR_TOLD)]],
  [SQ.FRONT]: [[f(SF.FRONT_READ)], [f(SF.FRONT_TOLD)]],
  [SQ.HOURS]: [[f(SF.HOURS_BOUGHT)], [f(SF.HOURS_WAITED)], [f(SF.HOURS_CONFRONTED)]],
  [SQ.SKY_GLASS]: [[f(SF.FRONT_READ)], [f(SF.GLASS_TAKEN)]],
  [SQ.MUTE]: [[f(SF.MUTE_TONGUE)], [f(SF.MUTE_HUNG), poi("mute-bell", "rung")]],
  [SQ.UPKEEP]: [[f(SF.SWEEP_1, SF.SWEEP_2)], [f(SF.SWEEP_3)]],
  [SQ.VAULT]: [[f(SF.VAULT_LEFT)], [f(SF.VAULT_TOLD)]],
  [SQ.STEP]: [[f(SF.STEP_SWEPT)], [f(SF.STEP_TOLD)]],
  [SQ.TOLL]: [[{ choices: { [SC.TOLL]: "paid" } }, { choices: { [SC.TOLL]: "refused" } }], [f(SF.TOLL_TOLD)]],
  [SQ.CABLE]: [[{ kept: 1 }], [f(SF.CABLE_TOLD)]],
  [SQ.FOUNDRY]: [[f(SF.FOUNDRY_RAKED), poi("organ-foundry", "dark")], [f(SF.FOUNDRY_TOLD)]],
  [SQ.COLUMN]: [[f(SF.COLUMN_STRAIT)], [f(SF.COLUMN_FOUNDRY)], [f(SF.COLUMN_CABLE)]],
  [SQ.SEED]: [[f(SF.SEED_EARTH)], [f(SF.SEED_TURNED), poi("seed-1", "seeded")]],
  [SQ.CONTEST]: [[{ flags: { [SF.CONTEST_HELD]: 3 } }], [f(SF.CONTEST_READ)]],
  [SQ.SEASON]: [[f(SF.SEASON_FACED)], [f(SF.SEASON_TOLD)]],
};

function applySat(sat: Sat): Ctx {
  const p = player({ flags: { ...(sat.flags ?? {}) }, choices: { ...(sat.choices ?? {}) }, kept: sat.kept ?? 0 });
  p.history = { ...p.history, buried: sat.buried ?? 0 };
  const w = world();
  for (const [id, state] of Object.entries(sat.pois ?? {})) w.pois[id] = { state, by: "p1", at: 1, count: 1 };
  return ctxOf(p, w);
}

// ---------------------------------------------------------------- forbidden words

const FORBIDDEN = [
  "studio", "film", "documentary", "director", "collective", "screening", "dispatch", "production still",
  "observer room", "participant room", "founder room",
  "cloud", "aerith", "sephiroth", "tifa", "barret", "cid ", "midgar", "shinra", "materia", "lifestream",
  "heidegger", "benjamin",
];

function stringsOf(value: unknown, out: string[] = [], seen = new Set<unknown>()): string[] {
  if (typeof value === "string") out.push(value);
  else if (typeof value === "function") {
    for (const ctx of variants()) {
      try { stringsOf((value as (c: Ctx) => unknown)(ctx), out, seen); } catch { /* a predicate that needs more state than the stub has */ }
    }
  } else if (value && typeof value === "object") {
    if (seen.has(value)) return out;
    seen.add(value);
    for (const v of Object.values(value as Record<string, unknown>)) stringsOf(v, out, seen);
  }
  return out;
}

// ---------------------------------------------------------------- the tests

const DISTRICTS: DistrictId[] = ["nave", "wet", "care", "annex", "kerb", "ring", "organs", "clearing"];
const BASE_CHOICES = ["read", "rest", "bury", "sign", "keep", "face", "study", "prepare", "browse", "file", "bank", "take", "tithe", "bounty", "craft", "spot", "sell", "pass"];
const SPRITES = new Set(["guest", "angel", "clerk", "nara", "quill", "ord", "ione", "vesper"]);
const NEWS_KEYS = [
  "extraction", "keep", "burial", "flag", "kill", "camp", "war-start", "war-won:earth", "war-won:sky", "war-won:mortals", "war-won:divinities",
  "clearing-open", "clearing-kept", "clearing-extracted", "passing-appearance", "passing-absence", "passing-hijack", "passing-failed",
  "freeze", "meltdown", "clear", "fat", "link", "under",
];

describe("side quests", () => {
  it("has at least 24 side quests with unique, well-formed ids", () => {
    expect(SIDE.length).toBeGreaterThanOrEqual(24);
    const ids = new Set(SIDE.map(q => q.id));
    expect(ids.size).toBe(SIDE.length);
    for (const q of SIDE) {
      expect(q.kind).toBe("side");
      expect(q.id, q.id).toMatch(/^side-(nave|wet|care|annex|kerb|ring|organs|clearing)-[a-z0-9-]+$/);
      expect(q.id.startsWith(`side-${q.district}-`), `${q.id} is filed under ${q.district}`).toBe(true);
      expect(DISTRICTS).toContain(q.district);
      expect(q.title.length).toBeGreaterThan(0);
      expect(SIDE_BY_ID[q.id]).toBe(q);
    }
  });

  it("spreads across the districts", () => {
    const per = Object.fromEntries(DISTRICTS.map(d => [d, SIDE.filter(q => q.district === d).length])) as Record<DistrictId, number>;
    for (const d of ["nave", "wet", "care", "annex", "kerb", "ring"] as DistrictId[]) expect(per[d], d).toBeGreaterThanOrEqual(4);
    for (const d of ["organs", "clearing"] as DistrictId[]) expect(per[d], d).toBeGreaterThanOrEqual(2);
  });

  it("guest-legal hours stay where a guest can walk", () => {
    const guestLegal = SIDE.filter(q => q.guestLegal);
    expect(guestLegal.length).toBeGreaterThanOrEqual(8);
    for (const q of guestLegal) {
      expect(["nave", "wet", "kerb", "annex", "ring"], `${q.id} is guest-legal in ${q.district}`).toContain(q.district);
      for (const s of q.steps) {
        const targets = typeof s.target === "function" ? variants().map(c => s.target && typeof s.target === "function" ? s.target(c) : undefined) : [s.target];
        for (const t of targets) {
          if (!t) continue;
          expect(["nave", "wet", "kerb", "annex", "ring"], `${q.id}/${s.id} sends a guest to ${t}`).toContain(POSITIONS[t].district);
        }
      }
    }
    for (const q of SIDE.filter(q => !q.guestLegal)) {
      // an unsealed body may never see the quest start, even if the flags line up
      const g = guest({ flags: { ...richPlayer().flags, [offerKey(q.id)]: 1 }, district: q.district, movement: 4 });
      expect(q.available(ctxOf(g, richWorld())), `${q.id} opens for a guest`).toBe(false);
    }
  });

  it("every quest has two to five steps with title, detail naming a key, a plate that exists and a target that resolves", () => {
    for (const q of SIDE) {
      expect(q.steps.length, q.id).toBeGreaterThanOrEqual(2);
      expect(q.steps.length, q.id).toBeLessThanOrEqual(5);
      const stepIds = new Set(q.steps.map(s => s.id));
      expect(stepIds.size).toBe(q.steps.length);
      for (const s of q.steps) {
        expect(s.title.length, `${q.id}/${s.id}`).toBeGreaterThan(0);
        for (const ctx of variants()) {
          const detail = typeof s.detail === "function" ? s.detail(ctx) : s.detail;
          expect(detail, `${q.id}/${s.id} detail names a key`).toMatch(/press [FEQ]/i);
          const target = typeof s.target === "function" ? s.target(ctx) : s.target;
          expect(target, `${q.id}/${s.id} has a target`).toBeTruthy();
          expect(POSITIONS[target!], `${q.id}/${s.id} target ${target} resolves`).toBeDefined();
          if (target!.startsWith("home:")) expect(NPC_HOMES[target!.slice(5)], `${q.id}/${s.id} ${target}`).toBeDefined();
        }
        expect(s.plate, `${q.id}/${s.id} has a plate`).toBeTruthy();
        expect(existsSync(join(ASSETS, s.plate!)), `${q.id}/${s.id} plate ${s.plate} exists`).toBe(true);
        expect(s.plate).not.toMatch(/screening/);
      }
    }
  });

  it("each change category has at least six quests whose effects do it, and every quest does what it says", () => {
    const counts = { poi: 0, npc: 0, cult: 0, standing: 0 };
    for (const q of SIDE) {
      const effects = questEffects(q);
      const doesPoi = effects.some(e => e.kind === "poi");
      const doesNpc = effects.some(e => e.kind === "npc");
      const doesCult = effects.some(e => e.kind === "item" && e.add?.kind === "cult" && e.add.bound === true);
      const doesStanding = effects.some(e => e.kind === "standing");
      const does = { poi: doesPoi, npc: doesNpc, cult: doesCult, standing: doesStanding };
      expect(q.changes, `${q.id} names a side category`).not.toBe("spine");
      expect(does[q.changes as keyof typeof does], `${q.id} says it changes ${q.changes} but its effects do not`).toBe(true);
      expect(doesPoi || doesNpc || doesCult || doesStanding, `${q.id} changes nothing`).toBe(true);
      if (doesPoi) counts.poi++;
      if (doesNpc) counts.npc++;
      if (doesCult) counts.cult++;
      if (doesStanding) counts.standing++;
    }
    for (const [k, n] of Object.entries(counts)) expect(n, k).toBeGreaterThanOrEqual(6);
  });

  it("POI states it sets are states the POI can be in; NPCs it moves stand on floor", () => {
    for (const q of SIDE) {
      for (const e of questEffects(q)) {
        if (e.kind === "poi") {
          expect(POI_STATES[e.id], `${q.id} touches unknown POI ${e.id}`).toBeDefined();
          expect(POI_STATES[e.id], `${q.id} sets ${e.id} to ${e.state}`).toContain(e.state);
        }
        if (e.kind === "npc") {
          expect(NPC_HOMES[e.id], `${q.id} moves unknown npc ${e.id}`).toBeDefined();
          if (e.present !== false) {
            expect(e.x).toBeDefined();
            expect(e.y).toBeDefined();
            expect(circleHitsWalls(e.x!, e.y!, BODY_R, { guest: false, flags: { under: 1, m3: 1 } }), `${q.id} puts ${e.id} in a wall`).toBe(false);
            expect(districtAt(e.x!, e.y!)).toBe(e.district);
          }
        }
        if (e.kind === "item" && e.add) {
          expect(e.add.kind).toBe("cult");
          expect(e.add.bound).toBe(true);
          expect(e.add.qty).toBe(1);
        }
        if (e.kind === "bestand" && e.sink) expect(SINKS as readonly string[]).toContain(e.sink);
      }
    }
    const angel = { guest: false, flags: { under: 1, m3: 1 } };
    const reach = reachableTiles(tileOf(GUEST_SPAWN.x), tileOf(GUEST_SPAWN.y), (tx, ty) => blockedFor(angel, tx, ty));
    for (const [id, pos] of Object.entries(SIDE_PLACES)) {
      expect(isWall(tileOf(pos.x), tileOf(pos.y)), `${id} is a wall`).toBe(false);
      expect(circleHitsWalls(pos.x, pos.y, BODY_R, angel), `${id} has no room for a body`).toBe(false);
      expect(districtAt(pos.x, pos.y), `${id} district`).toBe(pos.district);
      expect(reach.has(idx(tileOf(pos.x), tileOf(pos.y))), `${id} unreachable`).toBe(true);
    }
    for (const item of Object.values(SIDE_ITEMS)) {
      expect(item.kind).toBe("cult");
      expect(item.bound).toBe(true);
    }
  });

  it("every step's predicate is satisfied only by flags, choices, POI states and counters the side content itself sets", () => {
    const sets = everythingSet();
    const flags = new Set([...sets.quests.flags, ...sets.verbs.flags, ...sets.npcs.flags]);
    const choices = new Set([...sets.quests.choices, ...sets.verbs.choices, ...sets.npcs.choices]);
    const pois = new Set([...sets.quests.pois]); // the world change is the quest's own doing, never the verb's
    for (const q of SIDE) {
      const table = SATISFIERS[q.id];
      expect(table, `${q.id} has satisfiers listed`).toBeDefined();
      expect(table.length, `${q.id} satisfier count`).toBe(q.steps.length);
      q.steps.forEach((s, i) => {
        expect(s.done(applySat({})), `${q.id}/${s.id} is done before anything happened`).toBe(false);
        expect(table[i].length).toBeGreaterThan(0);
        for (const sat of table[i]) {
          for (const key of Object.keys(sat.flags ?? {})) expect(flags.has(key), `${q.id}/${s.id} reads flag ${key} nobody sets`).toBe(true);
          for (const key of Object.keys(sat.choices ?? {})) expect(choices.has(key), `${q.id}/${s.id} reads choice ${key} nobody sets`).toBe(true);
          for (const [id, state] of Object.entries(sat.pois ?? {})) expect(pois.has(`${id}:${state}`), `${q.id}/${s.id} reads POI ${id}:${state} no side quest sets`).toBe(true);
          expect(s.done(applySat(sat)), `${q.id}/${s.id} is done after ${JSON.stringify(sat)}`).toBe(true);
        }
      });
    }
  });

  it("quests that wait for an offer are handed out by the secondary cast", () => {
    const sets = everythingSet();
    const handedOut = new Set([...sets.npcs.starts, ...sets.verbs.starts]);
    const rw = richWorld();
    for (const q of SIDE) {
      const rich = richPlayer({ district: q.district });
      const open = q.available(ctxOf(rich, rw));
      if (open) continue;
      const offeredCtx = ctxOf(richPlayer({ district: q.district, flags: { ...rich.flags, [offerKey(q.id)]: 1 } }), rw);
      expect(q.available(offeredCtx), `${q.id} can never start`).toBe(true);
      expect(handedOut.has(q.id), `${q.id} waits for an offer nobody makes`).toBe(true);
    }
    for (const id of handedOut) expect(SIDE_BY_ID[id], `someone hands out unknown quest ${id}`).toBeDefined();
  });
});

describe("side POI verbs", () => {
  it("adds verbs only on POIs the map has, with distinct namespaced choices, gates, guest policy, valid sinks and a line", () => {
    for (const [id, verbs] of Object.entries(SIDE_POI_VERBS)) {
      expect(POIS[id], `${id} is not a POI`).toBeDefined();
      const choices = new Set<string>();
      for (const v of verbs) {
        expect(["F", "E", "Q"]).toContain(v.key);
        expect(v.choice.startsWith("side:"), `${id} ${v.choice}`).toBe(true);
        expect(BASE_CHOICES).not.toContain(v.choice);
        expect(choices.has(v.choice), `${id} repeats ${v.choice}`).toBe(false);
        choices.add(v.choice);
        expect(v.when, `${id} ${v.choice} is not gated`).toBeTypeOf("function");
        expect(v.guest, `${id} ${v.choice} has no guest policy`).toBeDefined();
        expect(v.label.length).toBeGreaterThan(0);
        expect(v.say, `${id} ${v.choice} says nothing`).toBeDefined();
        if (v.cost) {
          expect(v.cost.bestand).toBeGreaterThan(0);
          expect(SINKS as readonly string[]).toContain(v.cost.sink);
        }
        for (const ctx of variants()) {
          const line = typeof v.say === "function" ? v.say!(ctx) : v.say;
          expect(line!.length).toBeGreaterThan(0);
          for (const e of resolve(v.effects, ctx)) expect(e.kind, `${id} ${v.choice} changes the world itself`).not.toMatch(/^(poi|npc|standing)$/);
        }
      }
    }
  });

  it("gates every verb on its quest's step and shows one verb per key at a time on a POI", () => {
    const blank = ctxOf(richPlayer(), richWorld());
    for (const [id, verbs] of Object.entries(SIDE_POI_VERBS)) {
      for (const v of verbs) expect(v.when!(blank), `${id} ${v.choice} shows with no quest running`).toBe(false);
    }
    // two hours on the first shrine at once: only one E verb is offered
    const p = richPlayer({ quests: { [SQ.CENSUS]: 0, [SQ.STEP]: 0 } });
    const ctx = ctxOf(p, richWorld());
    const live = SIDE_POI_VERBS["shrine-1"].filter(v => v.key === "E" && v.when!(ctx));
    expect(live.length).toBe(1);
    // and the second appears once the first is done
    const done = ctxOf(richPlayer({ quests: { [SQ.CENSUS]: 1, [SQ.STEP]: 0 } }), richWorld());
    expect(SIDE_POI_VERBS["shrine-1"].filter(v => v.key === "E" && v.when!(done)).map(v => v.choice)).toEqual(["side:step:sweep"]);
    // the vault only takes a copy from a hand that holds one
    const vault = SIDE_POI_VERBS["cult-vault"][0];
    expect(vault.when!(ctxOf(richPlayer({ quests: { [SQ.VAULT]: 0 }, items: [] }), richWorld()))).toBe(false);
    expect(vault.when!(ctxOf(richPlayer({ quests: { [SQ.VAULT]: 0 } }), richWorld()))).toBe(true);
  });

  it("every quest step that needs a verb has one on its target", () => {
    const verbQuests = new Set<string>();
    for (const [id, verbs] of Object.entries(SIDE_POI_VERBS)) {
      for (const v of verbs) {
        for (const q of SIDE) {
          q.steps.forEach((s, i) => {
            const p = richPlayer({ quests: { [q.id]: i } });
            const ctx = ctxOf(p, richWorld());
            if (v.when!(ctx) || (v.once && v.when!(ctxOf(richPlayer({ quests: { [q.id]: i }, flags: { ...p.flags } }), richWorld())))) {
              const target = typeof s.target === "function" ? s.target(ctx) : s.target;
              if (target === id) verbQuests.add(`${q.id}/${s.id}`);
            }
          });
        }
      }
    }
    // steps that report to a person or count a burial/keep do not need a verb; the rest do
    const needVerb = SIDE.flatMap(q => q.steps.filter(s => !(typeof s.target === "string" && s.target.startsWith("home:")) && !/press F/i.test(typeof s.detail === "string" ? s.detail : "")).map(s => `${q.id}/${s.id}`));
    for (const key of needVerb) {
      const [qid] = key.split("/");
      const q = SIDE_BY_ID[qid];
      const s = q.steps.find(st => `${qid}/${st.id}` === key)!;
      const detail = typeof s.detail === "string" ? s.detail : s.detail(ctxOf(richPlayer(), richWorld()));
      if (/press Q at a node|press Q to keep|press F at wreckage/i.test(detail)) continue; // engine verbs
      expect(verbQuests.has(key), `${key} has no side verb on its target`).toBe(true);
    }
  });
});

describe("secondary cast", () => {
  const ids = ["officer", "omen", "keeper", "sexton", "desk"];

  it("has the five named people with homes, portraits, sprites and no party seat", () => {
    expect(Object.keys(SIDE_NPCS).sort()).toEqual([...ids].sort());
    const expected: Record<string, [string, string]> = {
      officer: ["safety-annex.jpg", "clerk"], omen: ["clearing-ring.jpg", "vesper"], keeper: ["shrine-upkeep.jpg", "ione"], sexton: ["plate-burial.jpg", "nara"], desk: ["organ-cable-dark.jpg", "ord"],
    };
    for (const id of ids) {
      const def = SIDE_NPCS[id];
      expect(def.id).toBe(id);
      expect(def.home).toBe(`home:${id}`);
      expect(NPC_HOMES[id]).toBeDefined();
      expect(POSITIONS[def.home]).toBeDefined();
      expect(def.portrait).toBe(expected[id][0]);
      expect(existsSync(join(ASSETS, def.portrait))).toBe(true);
      expect(def.sprite).toBe(expected[id][1]);
      expect(SPRITES).toContain(def.sprite);
      expect(existsSync(join(ASSETS, "sprites", `${def.sprite}.png`))).toBe(true);
      expect(def.party).toBe(false);
      expect(def.name.length).toBeGreaterThan(0);
      expect(def.role.length).toBeGreaterThan(0);
      expect(Object.keys(def.nodes).length, `${id} node count`).toBeGreaterThanOrEqual(6);
      expect(Object.keys(def.nodes).length, `${id} node count`).toBeLessThanOrEqual(14); // the Officer and the sexton each carry a Movement II beat besides their hours
    }
  });

  it("routes entry to a real node and every next / choice.next exists", () => {
    for (const id of ids) {
      const def = SIDE_NPCS[id];
      for (const ctx of variants()) expect(def.nodes[def.entry(ctx)], `${id} entry`).toBeDefined();
      expect(def.entry(ctxOf(player()))).toBe("greet");
      expect(def.entry(ctxOf(player({ flags: { [`side:${id}:met`]: 1 } })))).toBe("hub");
      for (const [key, n] of Object.entries(def.nodes)) {
        expect(n.id).toBe(key);
        for (const ctx of variants()) {
          const text = typeof n.text === "function" ? n.text(ctx) : n.text;
          expect(text.length, `${id}/${key} text`).toBeGreaterThan(0);
          const next = typeof n.next === "function" ? n.next(ctx) : n.next;
          if (next) expect(def.nodes[next], `${id}/${key} next ${next}`).toBeDefined();
        }
        const choiceIds = new Set<string>();
        for (const c of n.choices ?? []) {
          expect(choiceIds.has(c.id), `${id}/${key} repeats choice ${c.id}`).toBe(false);
          choiceIds.add(c.id);
          if (c.next) expect(def.nodes[c.next], `${id}/${key} choice ${c.id} -> ${c.next}`).toBeDefined();
        }
      }
    }
  });

  it("hands out and closes its hours through quest effects and flags", () => {
    const sets = everythingSet();
    expect(sets.npcs.starts.size).toBeGreaterThanOrEqual(15);
    for (const id of sets.npcs.starts) expect(SIDE_BY_ID[id]).toBeDefined();
    // the hub offers each hour once and closes it when the step is right
    const officer = SIDE_NPCS.officer.nodes.hub;
    const fresh = ctxOf(player());
    const labels = (ctx: Ctx) => (officer.choices ?? []).filter(c => !c.when || c.when(ctx)).map(c => c.id);
    expect(labels(fresh)).toContain("census");
    expect(labels(fresh)).not.toContain("census-report");
    expect(labels(ctxOf(player({ quests: { [SQ.CENSUS]: 2 }, flags: { [offerKey(SQ.CENSUS)]: 1 } })))).toContain("census-report");
    expect(labels(ctxOf(player({ quests: { [SQ.CENSUS]: 2 }, flags: { [offerKey(SQ.CENSUS)]: 1 } })))).not.toContain("census");
    // grief needs a freeze decision and a second visit
    expect(labels(ctxOf(player({ flags: { [F.FREEZE]: 1, [SF.OFFICER_VISITS]: 1 } })))).not.toContain("grief");
    expect(labels(ctxOf(player({ flags: { [F.FREEZE]: 1, [SF.OFFICER_VISITS]: 2 } })))).toContain("grief");
    expect(labels(ctxOf(guest({ flags: { [F.FREEZE]: 1, [SF.OFFICER_VISITS]: 2 } })))).not.toContain("grief");
  });

  it("keeps the Officer at the Annex for a guest once the shared body has walked behind the Angel gate", () => {
    const walked: NpcState = { id: "officer", ...SIDE_PLACES["officer-clearing"], present: true, state: "clearing" };
    // an Angel who has not finished the hour sees the shared body where it went
    expect(SIDE_NPCS.officer.personal!(ctxOf(player()), walked)).toBeNull();
    // a guest mid-way through a paper hour finds him where a guest can walk
    const g = ctxOf(guest({ quests: { [SQ.NOTICE]: 1 }, flags: { [offerKey(SQ.NOTICE)]: 1 } }));
    const seen = SIDE_NPCS.officer.personal!(g, walked);
    expect(seen).toMatchObject({ x: NPC_HOMES.officer.x, y: NPC_HOMES.officer.y, district: "annex", present: true, state: "home" });
    expect(["nave", "wet", "kerb", "annex", "ring"]).toContain(seen!.district);
    const hub = SIDE_NPCS.officer.nodes.hub;
    const text = typeof hub.text === "function" ? hub.text({ ...g, w: { ...g.w, npcs: { ...g.w.npcs, officer: walked } } }) : hub.text;
    expect(text).not.toContain("where the Passing failed");
    expect(text).toContain("Unsealed");
    // the Ring is open to guests, so the census walk stays shared
    const counted: NpcState = { id: "officer", ...SIDE_PLACES["officer-ring"], present: true, state: "ring" };
    expect(SIDE_NPCS.officer.personal!(g, counted)).toBeNull();
  });

  it("changes a person's place for a viewer only after their own hour did", () => {
    const shared: NpcState = { id: "officer", x: 0, y: 0, district: "annex", present: true, state: "home" };
    expect(SIDE_NPCS.officer.personal!(ctxOf(player()), shared)).toBeNull();
    const walked = SIDE_NPCS.officer.personal!(ctxOf(player({ quests: { [SQ.HONEST]: SIDE_BY_ID[SQ.HONEST].steps.length } })), shared);
    expect(walked).toMatchObject({ state: "clearing", district: "clearing" });
    expect(walked!.x).toBe(POSITIONS["station:officer-clearing"].x);
    const counted = SIDE_NPCS.officer.personal!(ctxOf(player({ quests: { [SQ.CENSUS]: 3 } })), shared);
    expect(counted).toMatchObject({ state: "ring", district: "ring" });
    for (const [id, questId, state] of [["omen", SQ.HOURS, "glass"], ["keeper", SQ.NOTICE, "guarding"], ["sexton", SQ.LEDGER, "garden"], ["desk", SQ.FOUNDRY, "foundry"]] as const) {
      const def = SIDE_NPCS[id];
      expect(def.personal!(ctxOf(player()), shared)).toBeNull();
      const moved = def.personal!(ctxOf(player({ quests: { [questId]: SIDE_BY_ID[questId].steps.length } })), shared);
      expect(moved, id).toMatchObject({ state, present: true });
      expect(circleHitsWalls(moved!.x!, moved!.y!, BODY_R, { guest: false, flags: { under: 1, m3: 1 } })).toBe(false);
    }
  });
});

describe("news", () => {
  it("has one line per event key and fills the subject in", () => {
    for (const key of NEWS_KEYS) {
      expect(NEWS[key], key).toBeTypeOf("string");
      expect(NEWS[key].length, key).toBeGreaterThan(0);
    }
    expect(newsFor("link", "#0042")).toBe("#0042 linked. One body per Angel. Perception, not a stick.");
    expect(newsFor("burial")).toContain("Someone");
    expect(newsFor("burial")).not.toContain("{subject}");
    expect(newsFor("war-won:mortals", "the Clearing")).toContain("the Clearing");
    expect(newsFor("no-such-event", "x")).toBe("no-such-event");
    for (const line of Object.values(NEWS)) expect(line).not.toMatch(/\{(?!subject\})/);
  });
});

describe("the writing", () => {
  it("never mentions what is not in this game", () => {
    const sources = OWN_FILES.map(f => readFileSync(f, "utf8").toLowerCase()).join("\n");
    const spoken = stringsOf({ SIDE, SIDE_NPCS, SIDE_POI_VERBS, NEWS }).join("\n").toLowerCase();
    for (const word of FORBIDDEN) {
      expect(sources.includes(word), `source mentions "${word}"`).toBe(false);
      expect(spoken.includes(word), `copy mentions "${word}"`).toBe(false);
    }
    // no real-world places or companies slip in as organ names
    for (const word of ["hormuz", "hsinchu", "palantir", "taiwan", "china", "america", "russia", "ukraine"]) {
      expect(spoken.includes(word), `copy mentions "${word}"`).toBe(false);
    }
  });

  it("names the key on every verb the journal asks for", () => {
    for (const q of SIDE) {
      for (const s of q.steps) {
        const detail = typeof s.detail === "string" ? s.detail : s.detail(ctxOf(richPlayer(), richWorld()));
        expect(detail).toMatch(/press [FEQ]/i);
      }
    }
  });
});
