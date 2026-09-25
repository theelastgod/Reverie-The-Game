/**
 * The world reducer: empty state, guests, the tick, movement, speech, death.
 * Everything here is pure. The server owns every number; `damageFor` and
 * `heavyFor` are constants and nothing about a serial, a House, a purse or an
 * item reaches them.
 */
import {
  AURA_ADDRESS_GLAMOUR, AURA_DRIFT, AURA_MAX, AURA_DIM, AURA_PRESENT, AURA_WOUND, BODY_R, DODGE_SPEED, EXHIBITION_DROP_CHANCE,
  GESTELL_BASELINE, GESTELL_DRIFT, GESTELL_FAT, GESTELL_MELTDOWN, GESTELL_START, HEAVY_DAMAGE, MAX_HP, NEWS_KEEP, NOTICE_KEEP,
  NOTICE_TTL, RESTRAINT_MAX, RESTRAINT_START, RESTRAINT_WINK_MIN, SEASON_LENGTH, SPEED, STORM_RESTRAINT_BURN, STRIKE_DAMAGE,
  UNBANKED_DROP, WRECKAGE_TTL, WRECKAGE_TTL_BONUS,
} from "./constants";
import { circleHitsWalls, districtAt, FAILED_PASSING_MARKS, GUEST_SPAWN, NPC_HOMES } from "./map";
import { POI_STATES } from "./content/ids";
import { newsFor } from "./content/news";
import { weatherBand } from "./protocol";
import type { DistrictId, FailedPassing, Intent, Item, Notice, NpcState, Player, PoiState, Vec, WorldState, Wreckage } from "./types";
import { initialEnemies } from "./enemies";
import { initialNodes, tickMarket, tickNodes } from "./economy";
import { initialHouses, tickHouseWar } from "./houses";
import { initialClearing, initialPassing, tickClearing } from "./clearing";
import { resolveHeavy, tickCombatTimers, tickEnemies } from "./combat";
import { tickQuests } from "./quests";
import * as LINES from "./content/lines";

export const NO_INTENT: Intent = { up: false, down: false, left: false, right: false };
const SUBSTEP = BODY_R / 2;
const RESTRAINT_REGAIN = 0.2; // per second in Restraint stance
/** Wreckage stays in the world past `until` so Mortals, Ruin-angels and Storm can still see it. */
const WRECKAGE_GRACE = WRECKAGE_TTL_BONUS * 3;
const RNG_SEED = 0x9e3779b9;
const CLEARING_RING = "clearing-ring";
const WEATHER_BAND_KEY = "weather:band"; // the last climate band the marquee announced
const BAND_INDEX = { clear: 1, mixed: 2, fat: 3, meltdown: 4 } as const;
/** The hole every shard starts with: last season's Passing failed before anyone here arrived. */
const LAST_SEASON_LINE = "Last season's Passing failed. The hour went by. The city kept the weather.";
const SEASON_NEWS = (id: number) => `Season ${id}. The Clearing is asphalt again. The omens are spent. There are people to stand on it.`;

// ---------------------------------------------------------------- construction

/** Ruin-sight, Storm and the House of Sky see a failed Passing from last season on any shard, from the first hour. */
function initialFailed(): FailedPassing[] {
  return FAILED_PASSING_MARKS.map(m => ({ id: m.id, x: m.x, y: m.y, district: m.district, season: 0, line: LAST_SEASON_LINE }));
}

export function emptyWorld(): WorldState {
  const npcs: Record<string, NpcState> = {};
  for (const h of Object.values(NPC_HOMES)) npcs[h.id] = { id: h.id, x: h.x, y: h.y, district: h.district, present: true, state: "home" };
  const pois: Record<string, PoiState> = {};
  for (const [id, states] of Object.entries(POI_STATES)) pois[id] = { state: states[0], by: "", at: 0, count: 0 };
  return {
    version: 2,
    now: 0,
    tick: 0,
    gestell: GESTELL_START,
    season: { id: 1, startedAt: 0 },
    weatherNamed: false,
    frozen: {},
    players: new Map(),
    intents: new Map(),
    npcs,
    enemies: initialEnemies(),
    nodes: initialNodes(),
    wreckage: [],
    graves: [],
    pois,
    flags: {},
    houses: initialHouses(),
    clearing: initialClearing(),
    passing: initialPassing(),
    market: [],
    news: [],
    failed: initialFailed(),
    history: [],
    rng: RNG_SEED,
  };
}

export function spawnGuest(id: string, now = 0): Player {
  return {
    id,
    name: "GUEST",
    x: GUEST_SPAWN.x,
    y: GUEST_SPAWN.y,
    facing: { dx: 1, dy: 0 },
    district: GUEST_SPAWN.district,

    guest: true,
    serial: null,
    house: "",
    messenger: "",
    winkSchool: "",
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
    respawn: { x: GUEST_SPAWN.x, y: GUEST_SPAWN.y, district: GUEST_SPAWN.district },

    heard: "",
    heardAt: 0,
    wink: "",
    winkAt: 0,
    notices: [],

    history: { passings: 0, buried: 0, looted: 0, houses: [], outcomes: [] },
    linkedAt: 0,
    createdAt: now,
  };
}

// ---------------------------------------------------------------- constants the fairness firewall guards

/** Light strike damage. A constant: no serial, House, messenger, aura, purse, item or claim reaches it. */
export function damageFor(_p: Player): number {
  return STRIKE_DAMAGE;
}

/** Heavy strike damage. Also a constant. */
export function heavyFor(_p: Player): number {
  return HEAVY_DAMAGE;
}

// ---------------------------------------------------------------- small player reducers

export function updateDistrict(p: Player): Player {
  const district = districtAt(p.x, p.y);
  return district === p.district ? p : { ...p, district };
}

export function say(p: Player, text: string, now: number): Player {
  return { ...p, heard: text, heardAt: now };
}

/** The aura the city addresses: the body's, plus what an Iridescent Glamour paints on for its minute. Guests are 0. */
export function addressAura(p: Player, now: number): number {
  if (p.guest) return 0;
  const glamour = !!p.kit && p.kit.verb === "iridescent" && p.kit.until > now;
  return p.aura + (glamour ? AURA_ADDRESS_GLAMOUR : 0);
}

/**
 * Whether a private line reaches this body now. Guests never; a dark aura or
 * spent restraint never; with the weather given: fat weather dims the late
 * Winke (Movement III on) for anyone the city does not look up at, and the
 * House of Divinities goes blind at meltdown. Perception, never a number.
 */
export function canSeeWink(p: Player, now: number, gestell?: number): boolean {
  if (p.guest) return false;
  const aura = addressAura(p, now);
  if (aura < AURA_DIM || p.restraint < RESTRAINT_WINK_MIN) return false;
  if (gestell !== undefined) {
    if (gestell >= GESTELL_MELTDOWN && p.house === "divinities") return false;
    if (gestell >= GESTELL_FAT && p.movement >= 3 && aura < AURA_PRESENT) return false;
  }
  return true;
}

/** A private line. Guests never receive one; a dark aura or spent restraint cannot see one; fat weather dims the late ones. */
export function wink(p: Player, text: string, now: number, gestell?: number): Player {
  if (!text || !canSeeWink(p, now, gestell)) return p;
  return { ...p, wink: text, winkAt: now };
}

export function notice(p: Player, text: string, now: number, tone: Notice["tone"] = "ink"): Player {
  const notices = [...p.notices, { text, at: now, tone }].slice(-NOTICE_KEEP);
  return { ...p, notices };
}

export function pushNews(w: WorldState, text: string): WorldState {
  const news = [...w.news, { text, at: w.now }].slice(-NEWS_KEEP);
  return { ...w, news };
}

/** xorshift32. The server owns randomness; the state travels with the world. */
export function nextRand(w: WorldState): [number, WorldState] {
  let x = (w.rng >>> 0) || RNG_SEED;
  x ^= x << 13;
  x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5;
  x >>>= 0;
  if (x === 0) x = RNG_SEED;
  return [x / 4294967296, { ...w, rng: x }];
}

export function respawnPoint(p: Player): Vec & { district: DistrictId } {
  return p.respawn;
}

function setPlayer(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}

// ---------------------------------------------------------------- movement

/** Integrates a velocity over `t` seconds in substeps no longer than half a body, sliding along walls. */
function slide(p: Pick<Player, "guest" | "flags">, x: number, y: number, vx: number, vy: number, t: number): Vec {
  const d = Math.hypot(vx, vy) * t;
  if (!(d > 0)) return { x, y };
  const n = Math.max(1, Math.ceil(d / SUBSTEP));
  const sx = (vx * t) / n;
  const sy = (vy * t) / n;
  for (let i = 0; i < n; i++) {
    const nx = x + sx;
    if (!circleHitsWalls(nx, y, BODY_R, p)) x = nx;
    const ny = y + sy;
    if (!circleHitsWalls(x, ny, BODY_R, p)) y = ny;
  }
  return { x, y };
}

/**
 * Walk and dash for one step. A dash in progress uses its own time first and
 * the rest of the step walks. Dialogue does not freeze the body; a heavy
 * windup and death do. Personal gates are walls for a player without the flag.
 */
export function stepPlayer(p: Player, intent: Intent, dt: number): Player {
  if (p.dead || !(dt > 0)) return p;
  let x = p.x;
  let y = p.y;
  let facing = p.facing;
  let remaining = dt;

  if (p.dodgeT > 0) {
    const dashT = Math.min(p.dodgeT, dt);
    const moved = slide(p, x, y, p.dodgeX * DODGE_SPEED, p.dodgeY * DODGE_SPEED, dashT);
    x = moved.x;
    y = moved.y;
    if (p.dodgeX !== 0 || p.dodgeY !== 0) facing = { dx: p.dodgeX, dy: p.dodgeY };
    remaining = dt - dashT;
  }

  if (remaining > 0 && p.heavyWindup <= 0) {
    let dx = (intent.right ? 1 : 0) - (intent.left ? 1 : 0);
    let dy = (intent.down ? 1 : 0) - (intent.up ? 1 : 0);
    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
      const moved = slide(p, x, y, dx * SPEED, dy * SPEED, remaining);
      x = moved.x;
      y = moved.y;
      facing = { dx, dy };
    }
  }

  if (x === p.x && y === p.y && facing === p.facing) return p;
  return { ...p, x, y, facing };
}

// ---------------------------------------------------------------- the tick

function driftPlayer(p: Player, dt: number, auraRate: number, now: number): Player {
  let aura = p.aura;
  if (p.guest) aura = 0;
  else if (aura > p.auraSeed) aura = Math.max(p.auraSeed, aura - auraRate * dt);
  else if (aura < p.auraSeed) aura = Math.min(p.auraSeed, aura + auraRate * dt);
  aura = Math.max(0, Math.min(AURA_MAX, aura));

  let restraint = p.restraint;
  if (!p.dead) {
    if (p.stance === "storm") {
      const face = !!p.kit && p.kit.verb === "ruin" && p.kit.until > now;
      if (!face) restraint = Math.max(0, restraint - STORM_RESTRAINT_BURN * dt);
    } else {
      restraint = Math.min(RESTRAINT_MAX, restraint + RESTRAINT_REGAIN * dt);
    }
  }

  const kit = p.kit && p.kit.until <= now ? null : p.kit;
  const notices = p.notices.some(n => n.at + NOTICE_TTL <= now) ? p.notices.filter(n => n.at + NOTICE_TTL > now) : p.notices;

  if (aura === p.aura && restraint === p.restraint && kit === p.kit && notices === p.notices) return p;
  return { ...p, aura, restraint, kit, notices };
}

export function tickWorld(w: WorldState, dt: number): WorldState {
  const now = w.now + dt;
  const auraRate = AURA_DRIFT * (w.passing.appearanceUntil > now ? 0.5 : 1);

  const players = new Map<string, Player>();
  const intents = new Map<string, Intent>();
  const heavyFired: string[] = [];
  for (const [id, p0] of w.players) {
    const intent = w.intents.get(id);
    if (intent) intents.set(id, intent);
    let p = stepPlayer(p0, intent ?? NO_INTENT, dt);
    const windupBefore = p.heavyWindup;
    p = tickCombatTimers(p, dt, now);
    if (windupBefore > 0 && p.heavyWindup <= 0) heavyFired.push(id);
    p = updateDistrict(p);
    p = driftPlayer(p, dt, auraRate, now);
    players.set(id, p);
  }

  let cur: WorldState = { ...w, now, tick: w.tick + 1, players, intents };
  for (const id of heavyFired) cur = resolveHeavy(cur, id);
  cur = tickEnemies(cur, dt);
  cur = tickNodes(cur, dt);
  cur = tickMarket(cur, dt);
  cur = tickHouseWar(cur, dt);
  cur = tickClearing(cur, dt);
  cur = tickSeason(cur);

  // Gestell drifts toward its baseline; the weather forgets slowly.
  let gestell = cur.gestell;
  if (gestell > GESTELL_BASELINE) gestell = Math.max(GESTELL_BASELINE, gestell - GESTELL_DRIFT * dt);
  else if (gestell < GESTELL_BASELINE) gestell = Math.min(GESTELL_BASELINE, gestell + GESTELL_DRIFT * dt);
  gestell = Math.max(0, Math.min(100, gestell));

  const wreckage = cur.wreckage.some(r => r.until + WRECKAGE_GRACE <= now) ? cur.wreckage.filter(r => r.until + WRECKAGE_GRACE > now) : cur.wreckage;
  const graves = cur.graves.some(g => g.until <= now) ? cur.graves.filter(g => g.until > now) : cur.graves;
  let frozen = cur.frozen;
  if (Object.values(frozen).some(until => until <= now)) {
    frozen = {};
    for (const [d, until] of Object.entries(cur.frozen)) if (until > now) frozen[d] = until;
  }
  cur = { ...cur, gestell, wreckage, graves, frozen };
  cur = announceWeather(cur);

  for (const id of cur.players.keys()) cur = tickQuests(cur, id);
  return cur;
}

/** The marquee names the climate band once, when the weather crosses into it. Mixed is the default and says nothing. */
function announceWeather(w: WorldState): WorldState {
  const band = weatherBand(w.gestell);
  const index = BAND_INDEX[band];
  const last = w.flags[WEATHER_BAND_KEY];
  if (last === index) return w;
  let cur: WorldState = { ...w, flags: { ...w.flags, [WEATHER_BAND_KEY]: index } };
  if (last !== undefined && band !== "mixed") cur = pushNews(cur, newsFor(band));
  return cur;
}

/**
 * A season rolls: the Clearing is asphalt again with a full reserve, the
 * ring closes, the House omens are spent, and only the season that just ended
 * keeps its failed Passing in view (older holes stay until a newer one fails).
 * Seeds in the ground survive the roll.
 */
function tickSeason(w: WorldState): WorldState {
  if (w.now - w.season.startedAt < SEASON_LENGTH) return w;
  const ended = w.season.id;
  const flags: Record<string, number> = {};
  for (const [k, v] of Object.entries(w.flags)) if (!k.startsWith("omen:")) flags[k] = v;
  const recent = w.failed.filter(f => f.season === ended);
  const ring = w.pois[CLEARING_RING];
  const pois = ring ? { ...w.pois, [CLEARING_RING]: { ...ring, state: "closed", by: "", at: w.now } } : w.pois;
  let cur: WorldState = {
    ...w,
    season: { id: ended + 1, startedAt: w.now },
    flags,
    pois,
    clearing: { ...initialClearing(), seeds: w.clearing.seeds },
    failed: recent.length ? recent : w.failed,
  };
  cur = pushNews(cur, SEASON_NEWS(ended + 1));
  return cur;
}

// ---------------------------------------------------------------- death

/**
 * A death. Unbanked purse and exhibition items may fall onto a wreckage at
 * the body; cult objects and banked value never do. Aura wounds toward the
 * seed and never below it for an Angel. The body wakes at once at its
 * respawn point, or where it fell if it carried insurance.
 */
export function killPlayer(w: WorldState, victimId: string, killerId: string, cause: string): WorldState {
  const v = w.players.get(victimId);
  if (!v) return w;
  const now = w.now;
  let cur = w;

  const insured = v.insured;
  let droppedBestand = 0;
  let bestand = v.bestand;
  const dropped: Item[] = [];
  let kept: Item[] = v.items;
  if (!insured) {
    droppedBestand = Math.floor(v.bestand * UNBANKED_DROP);
    bestand = v.bestand - droppedBestand;
    kept = [];
    for (const item of v.items) {
      if (item.kind !== "exhibition" || item.bound) { kept.push(item); continue; }
      const [r, next] = nextRand(cur);
      cur = next;
      if (r < EXHIBITION_DROP_CHANCE) dropped.push({ ...item });
      else kept.push(item);
    }
  }

  const wreck: Wreckage = {
    id: `wreck-${w.tick}-${victimId}`,
    x: v.x,
    y: v.y,
    district: v.district,
    fromId: v.id,
    fromName: v.name,
    fromSerial: v.serial,
    killerId,
    at: now,
    until: now + WRECKAGE_TTL,
    buried: false,
    looted: false,
    bestand: droppedBestand,
    items: dropped,
    fromHistory: { passings: v.history.passings, buried: v.history.buried, looted: v.history.looted },
  };

  const aura = v.guest ? 0 : Math.max(v.auraSeed, v.aura - AURA_WOUND);
  const dead: Player = {
    ...v,
    hp: 0,
    dead: true,
    deaths: v.deaths + 1,
    aura,
    bestand,
    items: kept,
    heard: cause,
    heardAt: now,
  };

  // The body wakes at once.
  const point = insured ? { x: v.x, y: v.y, district: v.district } : respawnPoint(v);
  let woke: Player = {
    ...dead,
    dead: false,
    hp: MAX_HP,
    x: point.x,
    y: point.y,
    district: point.district,
    strikeCd: 0,
    heavyCd: 0,
    heavyWindup: 0,
    hitStop: 0,
    dodgeT: 0,
    dodgeCd: 0,
    dialogue: null,
    insured: false,
  };
  if (insured) woke = notice(woke, LINES.INSURANCE_USED, now, "gold");

  cur = setPlayer(cur, woke);
  return { ...cur, wreckage: [...cur.wreckage, wreck] };
}
