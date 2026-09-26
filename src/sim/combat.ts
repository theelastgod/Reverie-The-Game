/**
 * Combat: the enemy state machine, player timers, strike / heavy / dodge /
 * stance / kit, PvP consent and the kill rules. Every number comes from
 * constants.ts through `damageFor` / `heavyFor`; a serial, a House, a purse
 * or an item changes nothing here. Traits change verbs and what you see.
 */
import {
  AURA_CAMP_PENALTY, AURA_MAX, AURA_SPECTATE_GAIN, BLITZ_DURATION, BODY_R, CAMP_WINDOW, DODGE_COOLDOWN, DODGE_DURATION,
  DUEL_CHALLENGE_SECONDS, DUEL_SECONDS, ENEMY_LEASH, FACE_DURATION, GESTELL_CAMP, GESTELL_MELTDOWN, HEAVY_COOLDOWN, HEAVY_RANGE,
  HEAVY_WINDUP, HIT_STOP, KIT_COOLDOWN, KIT_DURATION, RESTRAINT_CHAIN_KILL_PENALTY, RESTRAINT_DODGE_BONUS, RUIN_DUEL_RADIUS,
  SPECTATE_CAP, SPECTATE_RADIUS, STORM_BAND_BONUS, STORM_FALLEN_PENALTY, STORM_GEARED_BESTAND, STRIKE_COOLDOWN, STRIKE_RANGE,
  TRUCE_SECONDS, WRECKAGE_TTL,
} from "./constants";
import { circleHitsWalls, DISTRICT_BY_ID, inPatch } from "./map";
import { F } from "./content/ids";
import { weatherBand } from "./protocol";
import type { DuelState, Enemy, Player, Vec, WorldState, Wreckage } from "./types";
import { anchorOf, enemyStats, routeOf, strayOf } from "./enemies";
import { damageFor, heavyFor, killPlayer, notice, pushNews, say } from "./world";
import { applyNode, earn } from "./economy";
import * as LINES from "./content/lines";

const CHAIN_KILL_WINDOW = 30; // seconds; a second kill inside it burns restraint
const INTAKE_ARRIVAL_RADIUS = 240; // px; the intake clerk only takes a shift for a fresh arrival this close
const ENEMY_STANDOFF = 28; // px; an enemy stops short of standing inside a body
const SUBSTEP = BODY_R / 2;
const HOME_EPSILON = 4;
const EPS = 1e-6; // timers this close to zero are zero; float drift never steals a tick

// Copy owned by this module: the ruin duel. Short, cold, the grave is the ring.
const DUEL_CLOSED = "A ruin duel. The ring is two bodies and yours is not one of them.";
const DUEL_WHERE = "A ruin duel needs a wreckage under both of you. Find one and stand at it.";
const DUEL_BUSY = "One of you is already in a ring. Wait for the grave to settle.";
const DUEL_OPEN = "The duel is open. Sixty seconds. The grave is the ring and nobody else may step in it.";
const DUEL_CHALLENGE = "You offered a ruin duel at the wreckage. Twenty seconds for the answer.";

// ---------------------------------------------------------------- helpers

const d2 = (a: Vec, b: Vec) => (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
const within = (a: Vec, b: Vec, r: number) => d2(a, b) <= r * r;

function setPlayer(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}

function setEnemy(w: WorldState, e: Enemy): WorldState {
  const i = w.enemies.findIndex(x => x.id === e.id);
  if (i < 0) return w;
  const enemies = w.enemies.slice();
  enemies[i] = e;
  return { ...w, enemies };
}

function alive(p: Player | undefined): p is Player {
  return !!p && !p.dead && !p.locked;
}

/** Walks a point toward a target by at most `step` px, sliding along walls. Enemies never pass a personal gate. */
function walkToward(from: Vec, to: Vec, step: number, standoff: number): Vec {
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const allowed = Math.min(step, Math.max(0, dist - standoff));
  if (allowed <= 0 || dist <= 0) return from;
  const ux = (to.x - from.x) / dist;
  const uy = (to.y - from.y) / dist;
  const n = Math.max(1, Math.ceil(allowed / SUBSTEP));
  const sx = (ux * allowed) / n;
  const sy = (uy * allowed) / n;
  let x = from.x;
  let y = from.y;
  for (let i = 0; i < n; i++) {
    const nx = x + sx;
    if (!circleHitsWalls(nx, y, BODY_R)) x = nx;
    const ny = y + sy;
    if (!circleHitsWalls(x, ny, BODY_R)) y = ny;
  }
  return { x, y };
}

function inFront(p: Player, target: Vec): boolean {
  const fx = p.facing.dx;
  const fy = p.facing.dy;
  if (fx === 0 && fy === 0) return true;
  const dx = target.x - p.x;
  const dy = target.y - p.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return true;
  return (fx * dx + fy * dy) / len > -0.2;
}

function liveWreckage(w: WorldState): Wreckage[] {
  return w.wreckage.filter(r => !r.buried && r.until > w.now);
}

function nearestPlayer(w: WorldState, from: Vec, radius: number, ok: (p: Player) => boolean): Player | null {
  let best: Player | null = null;
  let bestD = radius * radius;
  for (const p of w.players.values()) {
    if (!ok(p)) continue;
    const d = d2(from, p);
    if (d <= bestD) { bestD = d; best = p; }
  }
  return best;
}

// ---------------------------------------------------------------- enemies

function freshArrivalNear(w: WorldState, at: Vec): boolean {
  for (const p of w.players.values()) {
    if (!alive(p)) continue;
    if ((p.flags[F.INTAKE] ?? 0) > 0) continue;
    if (within(p, at, INTAKE_ARRIVAL_RADIUS)) return true;
  }
  return false;
}

function tickEnemy(w: WorldState, e0: Enemy, dt: number): { e: Enemy; w: WorldState } {
  const now = w.now;
  const stats = enemyStats(e0.kind);
  let e = e0;

  if (e.kind === "dummy") {
    // Furniture. It never moves, never swings, and stands back up the moment it falls.
    if (e.hp <= 0 || e.state !== "idle") e = { ...e, hp: e.maxHp, state: "idle", t: 0, targetId: "", participants: [] };
    return { e, w };
  }

  const route = routeOf(e);
  const anchor = anchorOf(e);

  if (e.state === "dead") {
    if (e.respawnAt > now) return { e, w };
    if (e.kind === "intake" && !freshArrivalNear(w, e.home)) return { e, w };
    return { e: { ...e, x: e.home.x, y: e.home.y, hp: e.maxHp, state: "idle", t: 0, targetId: "", participants: [], ...(route ? { leg: 0 } : {}) }, w };
  }

  if (e.state === "return") {
    const pos = walkToward(e, anchor, stats.speed * dt, 0);
    e = { ...e, x: pos.x, y: pos.y };
    if (within(e, anchor, HOME_EPSILON)) e = { ...e, x: anchor.x, y: anchor.y, hp: e.maxHp, state: "idle", t: 0, targetId: "", participants: [] };
    return { e, w };
  }

  // Anything else that wandered past its leash walks back to where it belongs: home, or the point of its route it was walking toward.
  if (strayOf(e) > ENEMY_LEASH) return { e: { ...e, state: "return", t: 0, targetId: "" }, w };

  if (e.state === "idle") {
    if (e.kind === "intake" && (e.hp < e.maxHp || e.participants.length) && !freshArrivalNear(w, e.home)) {
      // An abandoned shift resets; nobody inherits a wounded clerk.
      e = { ...e, hp: e.maxHp, participants: [] };
    }
    // Whoever struck it last is answered first; otherwise whoever is inside its aggro radius.
    const struck = e.hp < e.maxHp ? [...e.participants].reverse().map(pid => w.players.get(pid)).find(q => alive(q) && within(e, q, ENEMY_LEASH / 2)) : undefined;
    const target = struck ?? nearestPlayer(w, e, stats.aggro, alive);
    if (target) return { e: { ...e, state: "aggro", targetId: target.id, t: 0 }, w };
    if (route) {
      // Walk the route: one point at a time, around again at the end.
      const pos = walkToward(e, anchor, stats.speed * dt, 0);
      e = { ...e, x: pos.x, y: pos.y };
      if (within(e, anchor, HOME_EPSILON)) e = { ...e, x: anchor.x, y: anchor.y, leg: ((e.leg ?? 0) + 1) % route.length };
    }
    return { e, w };
  }

  const target = w.players.get(e.targetId);
  if (!alive(target)) return { e: { ...e, state: "idle", targetId: "", t: 0 }, w };

  if (e.state === "aggro") {
    if (within(e, target, stats.reach)) return { e: { ...e, state: "telegraph", t: stats.telegraph }, w };
    const pos = walkToward(e, target, stats.speed * dt, ENEMY_STANDOFF);
    e = { ...e, x: pos.x, y: pos.y };
    if (within(e, target, stats.reach)) e = { ...e, state: "telegraph", t: stats.telegraph };
    return { e, w };
  }

  if (e.state === "telegraph") {
    const t = e.t - dt;
    if (t > EPS) return { e: { ...e, t }, w };
    let cur = w;
    if (within(e, target, stats.reach * 1.25)) {
      if (target.dodgeT > 0) {
        cur = setPlayer(cur, say(target, LINES.DODGE_COPY, now));
      } else {
        const hp = target.hp - stats.damage;
        cur = setPlayer(cur, { ...target, hp });
        if (hp <= 0) cur = killPlayer(cur, target.id, e.id, `${e.name} did their job.`);
      }
    }
    return { e: { ...e, state: "recover", t: stats.recovery }, w: cur };
  }

  // recover
  const t = e.t - dt;
  if (t > EPS) return { e: { ...e, t }, w };
  return { e: { ...e, state: "aggro", t: 0 }, w };
}

export function tickEnemies(w: WorldState, dt: number): WorldState {
  let cur = w;
  const enemies = w.enemies.slice();
  for (let i = 0; i < enemies.length; i++) {
    const r = tickEnemy(cur, enemies[i], dt);
    enemies[i] = r.e;
    cur = r.w;
  }
  return { ...cur, enemies };
}

// ---------------------------------------------------------------- player timers

const down = (v: number, dt: number) => (v > 0 && v - dt > EPS ? v - dt : 0);

/** Cooldowns and windows. `now` lets an expired kit or duel fall away; without it they are left for the world tick. */
export function tickCombatTimers(p: Player, dt: number, now?: number): Player {
  const kit = now !== undefined && p.kit && p.kit.until <= now ? null : p.kit;
  const duel = now !== undefined && p.duel && p.duel.until <= now ? undefined : p.duel;
  const next: Player = {
    ...p,
    strikeCd: down(p.strikeCd, dt),
    heavyCd: down(p.heavyCd, dt),
    heavyWindup: down(p.heavyWindup, dt),
    hitStop: down(p.hitStop, dt),
    dodgeT: down(p.dodgeT, dt),
    dodgeCd: down(p.dodgeCd, dt),
    kitCd: down(p.kitCd, dt),
    kit,
    duel,
  };
  if (
    next.strikeCd === p.strikeCd && next.heavyCd === p.heavyCd && next.heavyWindup === p.heavyWindup && next.hitStop === p.hitStop &&
    next.dodgeT === p.dodgeT && next.dodgeCd === p.dodgeCd && next.kitCd === p.kitCd && next.kit === p.kit && next.duel === p.duel
  ) return p;
  if (next.duel === undefined) delete next.duel;
  return next;
}

// ---------------------------------------------------------------- dodge

/** The client sends a direction; the server owns the distance. Only the signs are read. */
export function applyDodge(w: WorldState, id: string, dx: number, dy: number): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead || p.locked || p.dodgeCd > 0 || p.heavyWindup > 0 || p.dialogue) return w;
  let sx = Number.isFinite(dx) ? Math.sign(dx) : 0;
  let sy = Number.isFinite(dy) ? Math.sign(dy) : 0;
  if (sx === 0 && sy === 0) {
    sx = Math.sign(p.facing.dx);
    sy = Math.sign(p.facing.dy);
  }
  if (sx === 0 && sy === 0) return w;
  const len = Math.hypot(sx, sy);
  const ux = sx / len;
  const uy = sy / len;
  const dodgeT = DODGE_DURATION + (p.stance === "restraint" ? RESTRAINT_DODGE_BONUS : 0);
  return setPlayer(w, { ...p, dodgeT, dodgeCd: DODGE_COOLDOWN, dodgeX: ux, dodgeY: uy, facing: { dx: ux, dy: uy } });
}

// ---------------------------------------------------------------- consent and stance

/** A duel that has been answered and has not run out. */
function liveDuel(p: Player, now: number): DuelState | null {
  return p.duel && p.duel.accepted && p.duel.until > now ? p.duel : null;
}

/** At meltdown the Wet Grid flags itself: two Angels on it are flagged whether or not they raised one. */
function weatherFlagged(a: Player, b: Player, w: WorldState): boolean {
  return w.gestell >= GESTELL_MELTDOWN && a.district === "wet" && b.district === "wet";
}

/** The one gate for player-on-player damage. Null means the strike may land. */
export function pvpBlockReason(a: Player, b: Player, w: WorldState): string | null {
  if (a.guest || b.guest || a.locked || b.locked) return LINES.GUEST_GRIEF;
  if (a.truceUntil > w.now || b.truceUntil > w.now) return LINES.TRUCE_ACTIVE;
  if (inPatch("patch-arena", a.x, a.y) || inPatch("patch-arena", b.x, b.y)) return LINES.PRACTICE_SAFE;
  const ad = liveDuel(a, w.now);
  const bd = liveDuel(b, w.now);
  if ((ad && ad.with !== b.id) || (bd && bd.with !== a.id)) return DUEL_CLOSED;
  if (!(a.flagged && b.flagged) && !weatherFlagged(a, b, w)) return LINES.PVP_FLAG_REQUIRED;
  return null;
}

function fallen(w: WorldState, p: Player): boolean {
  return w.wreckage.some(r => r.fromId === p.id && !r.buried && r.until > w.now);
}

/**
 * Storm presses the geared and spares the already-fallen; the press grows
 * with the weather. Restraint and guests strike plain. Nothing about the
 * attacker's messenger, House, serial or kit is read here: a Ruin-angel wearing
 * the Face burns no restraint (world.driftPlayer) and hits the same number.
 */
export function stormMultiplier(a: Player, b: Player, w: WorldState): number {
  if (a.stance !== "storm" || a.guest) return 1;
  if (fallen(w, b)) return 1 - STORM_FALLEN_PENALTY;
  if (b.bestand >= STORM_GEARED_BESTAND) return 1 + STORM_BAND_BONUS[weatherBand(w.gestell)];
  return 1;
}

export function applyStance(w: WorldState, id: string): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead) return w;
  return setPlayer(w, { ...p, stance: p.stance === "storm" ? "restraint" : "storm" });
}

// ---------------------------------------------------------------- hits

/** A player strikes an enemy. Death leaves a wreckage with no spoils; the intake clerk and any spawn with a fall flag credit every participant. */
function hitEnemy(w: WorldState, attacker: Player, e: Enemy, dmg: number): WorldState {
  const now = w.now;
  const stats = enemyStats(e.kind);
  const participants = e.participants.includes(attacker.id) ? e.participants : [...e.participants, attacker.id];
  const hp = e.hp - dmg;
  if (hp > 0) return setEnemy(w, { ...e, hp, participants });

  if (e.kind === "dummy") {
    let cur = setEnemy(w, { ...e, hp: e.maxHp, state: "idle", t: 0, targetId: "", participants: [] });
    const a = cur.players.get(attacker.id);
    if (a) cur = setPlayer(cur, say(a, LINES.ARENA_HIT, now));
    return cur;
  }

  let cur = setEnemy(w, { ...e, hp: 0, state: "dead", t: 0, targetId: "", participants, respawnAt: now + stats.respawn });
  const wreck: Wreckage = {
    id: `wreck-${w.tick}-${e.id}`,
    x: e.x,
    y: e.y,
    district: e.district,
    fromId: e.id,
    fromName: e.name,
    fromSerial: null,
    killerId: attacker.id,
    at: now,
    until: now + WRECKAGE_TTL,
    buried: false,
    looted: false,
    bestand: 0,
    items: [],
  };
  cur = { ...cur, wreckage: [...cur.wreckage, wreck] };
  const fallFlag = e.kind === "intake" ? F.INTAKE : e.fallFlag;
  if (fallFlag) {
    const line = LINES.FALL_LINES[fallFlag];
    const players = new Map(cur.players);
    for (const pid of participants) {
      const q = players.get(pid);
      if (q && !(q.flags[fallFlag] ?? 0)) {
        const flagged = { ...q, flags: { ...q.flags, [fallFlag]: 1 } };
        players.set(pid, line ? say(flagged, line, now) : flagged);
      }
    }
    cur = { ...cur, players };
  }
  return cur;
}

/** A player strikes a player. Consent first; then the storm rules; then, on a fall, the kill rules. */
function hitPlayer(w: WorldState, attackerId: string, targetId: string, base: number): { w: WorldState; hit: boolean } {
  const a = w.players.get(attackerId);
  const b = w.players.get(targetId);
  if (!a || !b || b.dead) return { w, hit: false };
  const reason = pvpBlockReason(a, b, w);
  if (reason) return { w: setPlayer(w, say(a, reason, w.now)), hit: false };
  if (b.dodgeT > 0) {
    // The dash is a window against people too. The Restraint stance's longer step is worth something here.
    let missed = setPlayer(w, say(a, LINES.DODGE_WHIFF, w.now));
    missed = setPlayer(missed, say(b, LINES.DODGE_COPY, w.now));
    return { w: missed, hit: false };
  }
  const mult = stormMultiplier(a, b, w);
  const dmg = Math.max(0, Math.round(base * mult));
  let cur = w;
  if (mult > 1) cur = setPlayer(cur, say(a, LINES.STORM_PRESS, w.now));
  else if (mult < 1) cur = setPlayer(cur, say(a, LINES.STORM_FALLEN, w.now));
  const hp = b.hp - dmg;
  cur = setPlayer(cur, { ...b, hp });
  if (hp <= 0) cur = pvpKill(cur, attackerId, targetId);
  return { w: cur, hit: true };
}

/**
 * A kill between Angels. Spoils are the fallen purse's unbanked share; a
 * ruin duel pays its watchers a little presence; camping the same body feeds
 * the weather and thins the camper; chained kills burn restraint.
 */
function pvpKill(w: WorldState, killerId: string, victimId: string): WorldState {
  const now = w.now;
  const k0 = w.players.get(killerId);
  const v0 = w.players.get(victimId);
  if (!k0 || !v0) return w;

  const duelWreck = liveWreckage(w).find(r => within(r, k0, RUIN_DUEL_RADIUS) && within(r, v0, RUIN_DUEL_RADIUS)) ?? null;
  const hasKilled = k0.lastKillId !== "";
  const chained = hasKilled && now - k0.lastKillAt < CHAIN_KILL_WINDOW;
  const camping = hasKilled && k0.lastKillId === victimId && now - k0.lastKillAt < CAMP_WINDOW;

  let cur = killPlayer(w, victimId, killerId, LINES.DEATH_BY(k0.name));
  const wreckIdx = cur.wreckage.findIndex(r => r.fromId === victimId && r.at === now && r.killerId === killerId);
  const wreck = wreckIdx >= 0 ? cur.wreckage[wreckIdx] : null;
  const spoils = wreck ? wreck.bestand : 0;

  if (wreck && spoils > 0) {
    const wreckage = cur.wreckage.slice();
    wreckage[wreckIdx] = { ...wreck, bestand: 0 };
    cur = { ...cur, wreckage };
    cur = earn(cur, killerId, spoils, "spoils");
  }

  // A fall ends the duel for both bodies; the ring opens again.
  const v = cur.players.get(victimId);
  if (v && v.duel) {
    const { duel: _gone, ...rest } = v;
    cur = setPlayer(cur, rest);
  }
  let k = cur.players.get(killerId);
  if (!k) return cur;
  if (k.duel) {
    const { duel: _gone, ...rest } = k;
    k = rest;
  }
  k = {
    ...k,
    kills: k.kills + 1,
    lastKillId: victimId,
    lastKillAt: now,
    history: spoils > 0 ? { ...k.history, looted: k.history.looted + 1 } : k.history,
  };
  if (spoils > 0) k = say(k, LINES.SPOILS_COPY, now);
  if (duelWreck) k = say(k, LINES.DUEL_COPY, now);
  if (chained) k = { ...k, restraint: Math.max(0, k.restraint - RESTRAINT_CHAIN_KILL_PENALTY) };
  if (camping) {
    // The camp line is the one the camper hears, even at a duel's grave.
    k = say({ ...k, aura: Math.max(0, k.aura - AURA_CAMP_PENALTY), campCount: k.campCount + 1 }, LINES.CAMP_COPY, now);
    cur = { ...cur, gestell: Math.min(100, cur.gestell + GESTELL_CAMP) };
  }
  cur = setPlayer(cur, k);

  if (duelWreck) {
    const players = new Map(cur.players);
    for (const s of players.values()) {
      if (s.id === killerId || s.id === victimId || s.guest || s.locked || s.dead) continue;
      if (s.spectated >= SPECTATE_CAP || !within(s, duelWreck, SPECTATE_RADIUS)) continue;
      players.set(s.id, say({ ...s, aura: Math.min(AURA_MAX, s.aura + AURA_SPECTATE_GAIN), spectated: s.spectated + 1 }, LINES.SPECTATE_COPY, now));
    }
    cur = { ...cur, players };
  }
  return cur;
}

/** Sweeps a reach in front of the attacker over enemies and players. Returns whether anything was hit. */
function sweep(w: WorldState, id: string, range: number, base: number, interrupt: boolean): { w: WorldState; hit: boolean } {
  const p0 = w.players.get(id);
  if (!p0) return { w, hit: false };
  let cur = w;
  let hit = false;

  for (const e of w.enemies) {
    if (e.state === "dead" || !within(p0, e, range) || !inFront(p0, e)) continue;
    const live = cur.enemies.find(x => x.id === e.id);
    const attacker = cur.players.get(id);
    if (!live || live.state === "dead" || !attacker) continue;
    let target = live;
    if (interrupt && live.state === "telegraph") {
      target = { ...live, state: "recover", t: enemyStats(live.kind).recovery * 1.5, targetId: live.targetId };
      cur = setPlayer(cur, say(attacker, LINES.INTERRUPT, cur.now));
    }
    cur = hitEnemy(cur, cur.players.get(id) ?? attacker, target, base);
    hit = true;
  }

  for (const t of w.players.values()) {
    if (t.id === id || t.dead || !within(p0, t, range) || !inFront(p0, t)) continue;
    const r = hitPlayer(cur, id, t.id, base);
    cur = r.w;
    hit = hit || r.hit;
  }
  return { w: cur, hit };
}

export function applyStrike(w: WorldState, id: string): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead || p.locked || p.strikeCd > 0 || p.dodgeT > 0 || p.heavyWindup > 0) return w;
  const r = sweep(w, id, STRIKE_RANGE, damageFor(p), false);
  const after = r.w.players.get(id);
  if (!after) return r.w;
  const strikeCd = r.hit ? STRIKE_COOLDOWN + HIT_STOP : STRIKE_COOLDOWN;
  return setPlayer(r.w, { ...after, strikeCd, hitStop: r.hit ? HIT_STOP : after.hitStop });
}

/** Starts the windup. The body cannot dodge or walk until it resolves in the tick. */
export function applyHeavy(w: WorldState, id: string): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead || p.locked || p.heavyCd > 0 || p.heavyWindup > 0 || p.dodgeT > 0) return w;
  return setPlayer(w, { ...p, heavyWindup: HEAVY_WINDUP, heavyCd: HEAVY_COOLDOWN });
}

/** The heavy lands: slower, readable, the same number. A telegraphing enemy it touches is forced into recovery. */
export function resolveHeavy(w: WorldState, id: string): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead) return w;
  const r = sweep(w, id, HEAVY_RANGE, heavyFor(p), true);
  const after = r.w.players.get(id);
  if (!after) return r.w;
  return setPlayer(r.w, { ...after, heavyWindup: 0, hitStop: r.hit ? HIT_STOP : after.hitStop });
}

// ---------------------------------------------------------------- kits

export function applyKit(w: WorldState, id: string, _targetId?: string): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead) return w;
  const now = w.now;
  if (p.guest || p.locked || !p.messenger) return setPlayer(w, say(p, LINES.KIT_GUEST, now));
  if (p.kitCd > 0) return setPlayer(w, say(p, LINES.KIT_COOLDOWN, now));
  const m = p.messenger;
  const armed = (q: Player) => say({ ...q, kitCd: KIT_COOLDOWN }, LINES.KIT_COPY[m], now);

  switch (m) {
    case "herald": {
      let best = -1;
      let bestD = 200 * 200;
      w.nodes.forEach((n, i) => {
        if (!n.kept) return;
        const d = d2(p, n);
        if (d <= bestD) { bestD = d; best = i; }
      });
      if (best < 0) return setPlayer(w, say(p, LINES.KIT_NEED.herald, now));
      const nodes = w.nodes.slice();
      nodes[best] = { ...nodes[best], announcedUntil: now + KIT_DURATION };
      const flags = { ...p.flags, [F.ANNOUNCE_HEARD]: (p.flags[F.ANNOUNCE_HEARD] ?? 0) + 1 };
      return setPlayer({ ...w, nodes }, armed({ ...p, flags }));
    }
    case "witness":
      return setPlayer(w, armed({ ...p, kit: { verb: "witness", until: now + BLITZ_DURATION } }));
    case "ruin":
      return setPlayer(w, armed({ ...p, kit: { verb: "ruin", until: now + FACE_DURATION } }));
    case "dweller": {
      let best: string | null = null;
      let bestD = 96 * 96;
      for (const n of w.nodes) {
        const d = d2(p, n);
        if (d <= bestD) { bestD = d; best = n.id; }
      }
      if (!best) return setPlayer(w, say(p, LINES.KIT_NEED.dweller, now));
      const cur = applyNode(w, id, best, "seed");
      const q = cur.players.get(id);
      return q ? setPlayer(cur, { ...q, kitCd: KIT_COOLDOWN }) : cur;
    }
    case "cybernetic":
      return setPlayer(w, armed({ ...p, kit: { verb: "cybernetic", until: now + KIT_DURATION } }));
    case "iridescent":
      return setPlayer(w, armed({ ...p, kit: { verb: "iridescent", until: now + KIT_DURATION } }));
  }
}

// ---------------------------------------------------------------- ruin duels

/** The live wreckage both bodies stand within RUIN_DUEL_RADIUS of, if any. */
export function duelWreckageFor(w: WorldState, a: Player, b: Player): Wreckage | null {
  return liveWreckage(w).find(r => within(r, a, RUIN_DUEL_RADIUS) && within(r, b, RUIN_DUEL_RADIUS)) ?? null;
}

/** Whether `p` may offer or answer a ruin duel with `other` right now; the reason otherwise. */
export function duelBlockReason(p: Player, other: Player, w: WorldState): string | null {
  if (p.guest || other.guest || p.locked || other.locked) return LINES.GUEST_GRIEF;
  if (p.dead || other.dead) return DUEL_WHERE;
  if (p.truceUntil > w.now || other.truceUntil > w.now) return LINES.TRUCE_ACTIVE;
  if (!p.flagged || !other.flagged) return LINES.PVP_FLAG_REQUIRED;
  if (!duelWreckageFor(w, p, other)) return DUEL_WHERE;
  if (liveDuel(p, w.now) || liveDuel(other, w.now)) return DUEL_BUSY;
  return null;
}

/**
 * A ruin duel: offered at a wreckage to a flagged Angel standing at the same
 * one; the same press from them accepts it. While it is live nobody else may
 * strike either body. It ends when one falls or DUEL_SECONDS run out. The
 * watchers are paid at the fall, as before; the kit does not strike harder.
 */
export function applyDuel(w: WorldState, id: string, targetId: string): WorldState {
  const p = w.players.get(id);
  const t = w.players.get(targetId);
  if (!p || !t || p.dead || t.id === p.id) return w;
  const now = w.now;
  const reason = duelBlockReason(p, t, w);
  if (reason) return setPlayer(w, say(p, reason, now));
  const wreck = duelWreckageFor(w, p, t);
  if (!wreck) return w;

  const offered = t.duel && !t.duel.accepted && t.duel.with === p.id && t.duel.until > now;
  if (offered) {
    const until = now + DUEL_SECONDS;
    const duel = (other: string): DuelState => ({ with: other, until, accepted: true });
    let cur = setPlayer(w, say({ ...p, duel: duel(t.id) }, DUEL_OPEN, now));
    cur = setPlayer(cur, say({ ...t, duel: duel(p.id) }, DUEL_OPEN, now));
    return pushNews(cur, `A ruin duel at ${wreck.fromName}'s wreckage. ${p.name} and ${t.name}. The grave is the ring.`);
  }
  const offer: DuelState = { with: t.id, until: now + DUEL_CHALLENGE_SECONDS, accepted: false };
  let cur = setPlayer(w, say({ ...p, duel: offer }, DUEL_CHALLENGE, now));
  cur = setPlayer(cur, notice(t, `${p.name} offers a ruin duel at the wreckage. F answers it.`, now, "hot"));
  return cur;
}

// ---------------------------------------------------------------- flags and truces

export function applyFlag(w: WorldState, id: string): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead) return w;
  const now = w.now;
  if (p.guest || p.locked) return setPlayer(w, say(p, LINES.FLAG_GUEST, now));
  if (!DISTRICT_BY_ID[p.district].flagLegal) return setPlayer(w, say(p, LINES.FLAG_WHERE, now));
  if (p.truceUntil > now) return setPlayer(w, say(p, LINES.TRUCE_ACTIVE, now));
  const flagged = !p.flagged;
  let cur = setPlayer(w, say({ ...p, flagged }, flagged ? LINES.FLAG_ON : LINES.FLAG_OFF, now));
  if (flagged && p.district === "wet") cur = pushNews(cur, `${p.name} raised a flag on the hot street.`);
  return cur;
}

/** Both unflag. Seconds, not a stick. Only a flagged Angel can call one: the prompt's rule, kept by the server. */
export function applyTruce(w: WorldState, id: string): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead || p.guest || p.locked) return w;
  const now = w.now;
  if (!p.flagged) return setPlayer(w, say(p, LINES.PVP_FLAG_REQUIRED, now));
  if (p.truceUntil > now) return setPlayer(w, say(p, LINES.TRUCE_ACTIVE, now));
  const other = nearestPlayer(w, p, 96, q => q.id !== id && q.flagged && !q.guest && !q.locked && !q.dead);
  if (!other) return w;
  const until = now + TRUCE_SECONDS;
  let cur = setPlayer(w, say({ ...p, flagged: false, truceUntil: until }, LINES.TRUCE_COPY, now));
  cur = setPlayer(cur, say({ ...other, flagged: false, truceUntil: until }, LINES.TRUCE_COPY, now));
  return cur;
}
