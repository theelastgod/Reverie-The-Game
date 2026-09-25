/**
 * Shape migration for checkpoints. A world or a player saved by an older
 * build is rebuilt against the current defaults: every collection the level
 * or the content defines (nodes, npcs, pois, enemies) comes from the
 * defaults, with the saved progress merged back by id; every scalar is kept
 * only when it has the right type; unknown keys and unknown ids are dropped.
 * Restoring is therefore always safe, and additive contract changes never
 * strand a shard.
 */
import { MAX_HP, NODE_CHARGES } from "./constants";
import { HOUSES } from "./identity";
import { POI_STATES } from "./content/ids";
import type { Fourfold, Player, WorldState } from "./types";
import { emptyWorld, spawnGuest } from "./world";

/** Bumped when a persisted collection changes meaning; stored with every checkpoint. */
export const SHAPE = 2;

type Dict = Record<string, unknown>;

const isDict = (v: unknown): v is Dict => !!v && typeof v === "object" && !Array.isArray(v);
const num = (v: unknown, fallback: number, min = -Infinity, max = Infinity): number =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const bool = (v: unknown, fallback: boolean): boolean => (typeof v === "boolean" ? v : fallback);
const str = (v: unknown, fallback: string): string => (typeof v === "string" ? v : fallback);
const arr = <T>(v: unknown, keep: (x: unknown) => x is T): T[] => (Array.isArray(v) ? v.filter(keep) : []);

/** A record whose values are all finite numbers. */
function numRecord(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!isDict(v)) return out;
  for (const [k, x] of Object.entries(v)) if (typeof x === "number" && Number.isFinite(x)) out[k] = x;
  return out;
}

function strRecord(v: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!isDict(v)) return out;
  for (const [k, x] of Object.entries(v)) if (typeof x === "string") out[k] = x;
  return out;
}

/** Merge saved fields over a default object, key by key, keeping a saved value only when its type matches the default's. */
function mergeShallow<T extends object>(base: T, saved: unknown): T {
  if (!isDict(saved)) return base;
  const out = { ...base } as Dict;
  for (const key of Object.keys(base as Dict)) {
    const b = (base as Dict)[key];
    const s = saved[key];
    if (s === undefined) continue;
    if (b === null) { out[key] = s; continue; }
    if (typeof b === "number") { out[key] = num(s, b); continue; }
    if (typeof b === "boolean") { out[key] = bool(s, b); continue; }
    if (typeof b === "string") { out[key] = str(s, b); continue; }
    if (Array.isArray(b)) { out[key] = Array.isArray(s) ? s : b; continue; }
    if (isDict(b)) { out[key] = isDict(s) ? { ...b, ...s } : b; continue; }
  }
  return out as T;
}

// ---------------------------------------------------------------- players

/** A saved player rebuilt over a fresh guest; transient combat and dialogue state does not survive a restore. */
export function migratePlayer(saved: unknown, fallbackId: string, now = 0): Player {
  const s = isDict(saved) ? saved : {};
  const id = str(s.id, fallbackId) || fallbackId;
  const base = spawnGuest(id, now);
  const p = mergeShallow(base, s);
  p.id = id;
  p.hp = num(s.hp, MAX_HP, 0, MAX_HP);
  p.dead = p.hp <= 0 ? bool(s.dead, false) : false;
  p.movement = ([1, 2, 3, 4, 5] as const).includes(p.movement) ? p.movement : 1;
  p.facing = isDict(s.facing) ? { dx: num(s.facing.dx, 1), dy: num(s.facing.dy, 0) } : base.facing;
  p.party = { ...base.party, ...(isDict(s.party) ? strRecord(s.party) : {}) } as Player["party"];
  p.flags = numRecord(s.flags);
  p.quests = numRecord(s.quests);
  p.choices = strRecord(s.choices);
  const r = isDict(s.respawn) ? s.respawn : {};
  p.respawn = { x: num(r.x, base.respawn.x), y: num(r.y, base.respawn.y), district: (str(r.district, base.respawn.district) as Player["respawn"]["district"]) };
  const h = isDict(s.history) ? s.history : {};
  p.history = {
    passings: num(h.passings, 0, 0),
    buried: num(h.buried, 0, 0),
    looted: num(h.looted, 0, 0),
    houses: arr(h.houses, (x): x is Fourfold => typeof x === "string" && (HOUSES as readonly string[]).includes(x)),
    outcomes: arr(h.outcomes, (x): x is string => typeof x === "string"),
  };
  p.items = arr(s.items, isDict) as Player["items"];
  p.claims = arr(s.claims, isDict) as Player["claims"];
  p.notices = arr(s.notices, isDict) as Player["notices"];
  // Transient: a stale dialogue node, an expired kit, a duel with a body that is gone.
  p.dialogue = null;
  p.kit = null;
  delete (p as Dict).duel;
  p.heavyWindup = 0;
  p.hitStop = 0;
  p.dodgeT = 0;
  return p;
}

// ---------------------------------------------------------------- worlds

/**
 * A saved world (players as an array of [id, player] pairs or an id-keyed
 * object, intents absent) rebuilt over the current defaults.
 */
export function migrateWorld(saved: unknown, now = 0): WorldState {
  const base = emptyWorld();
  if (!isDict(saved)) return base;
  const s = saved;

  const nodes = base.nodes.map((n) => {
    const sn = Array.isArray(s.nodes) ? (s.nodes as unknown[]).find((x) => isDict(x) && x.id === n.id) : undefined;
    if (!isDict(sn)) return n;
    return {
      ...n,
      charges: num(sn.charges, n.charges, 0, NODE_CHARGES),
      regenAt: num(sn.regenAt, n.regenAt, 0),
      kept: bool(sn.kept, n.kept),
      keptBy: str(sn.keptBy, n.keptBy),
      announcedUntil: num(sn.announcedUntil, n.announcedUntil, 0),
      seed: bool(sn.seed, n.seed),
    };
  });

  const npcs = { ...base.npcs };
  if (isDict(s.npcs)) {
    for (const id of Object.keys(npcs)) {
      const sn = s.npcs[id];
      if (!isDict(sn)) continue;
      npcs[id] = {
        ...npcs[id],
        x: num(sn.x, npcs[id].x),
        y: num(sn.y, npcs[id].y),
        district: str(sn.district, npcs[id].district) as WorldState["npcs"][string]["district"],
        present: bool(sn.present, npcs[id].present),
        state: str(sn.state, npcs[id].state),
      };
    }
  }

  const pois = { ...base.pois };
  if (isDict(s.pois)) {
    for (const id of Object.keys(pois)) {
      const sp = s.pois[id];
      if (!isDict(sp)) continue;
      const allowed = POI_STATES[id] ?? [];
      const state = typeof sp.state === "string" && allowed.includes(sp.state) ? sp.state : pois[id].state;
      pois[id] = { state, by: str(sp.by, ""), at: num(sp.at, 0, 0), count: num(sp.count, 0, 0) };
    }
  }

  const standing = { ...base.houses.standing };
  const savedHouses = isDict(s.houses) ? s.houses : {};
  if (isDict(savedHouses.standing)) for (const h of HOUSES) standing[h] = num(savedHouses.standing[h], 0);
  const houses: WorldState["houses"] = {
    standing,
    tithe: num(savedHouses.tithe, 0, 0),
    war: mergeShallow(base.houses.war, savedHouses.war),
  };

  const clearing = mergeShallow(base.clearing, s.clearing);
  if (!isDict(s.clearing) || !isDict((s.clearing as Dict).contest)) clearing.contest = null;
  clearing.seeds = arr(clearing.seeds, (x): x is string => typeof x === "string");
  clearing.heldBy = arr(clearing.heldBy, (x): x is string => typeof x === "string");

  const playersRaw = s.players;
  const entries: [string, unknown][] = Array.isArray(playersRaw)
    ? (playersRaw as unknown[]).filter((e): e is [string, unknown] => Array.isArray(e) && typeof e[0] === "string")
    : isDict(playersRaw) ? Object.entries(playersRaw) : [];
  const players = new Map<string, Player>();
  for (const [id, p] of entries) players.set(id, migratePlayer(p, id, now));

  const season = isDict(s.season) ? { id: num(s.season.id, base.season.id, 1), startedAt: num(s.season.startedAt, base.season.startedAt, 0) } : base.season;

  return {
    ...base,
    now: num(s.now, base.now, 0),
    tick: num(s.tick, base.tick, 0),
    gestell: num(s.gestell, base.gestell, 0, 100),
    season,
    weatherNamed: bool(s.weatherNamed, false),
    frozen: numRecord(s.frozen),
    players,
    intents: new Map(),
    npcs,
    enemies: base.enemies,
    nodes,
    wreckage: arr(s.wreckage, isDict) as WorldState["wreckage"],
    graves: arr(s.graves, isDict) as WorldState["graves"],
    pois,
    flags: numRecord(s.flags),
    houses,
    clearing,
    passing: mergeShallow(base.passing, s.passing),
    market: arr(s.market, isDict) as WorldState["market"],
    news: arr(s.news, isDict) as WorldState["news"],
    failed: Array.isArray(s.failed) && s.failed.length ? (arr(s.failed, isDict) as WorldState["failed"]) : base.failed,
    history: arr(s.history, isDict) as WorldState["history"],
    rng: num(s.rng, base.rng) >>> 0 || base.rng,
  };
}
