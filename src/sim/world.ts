import {
  ANGEL_UNDER,
  Beats,
  Clerk,
  CLERK_AGGRO,
  CLERK_DAMAGE,
  CLERK_TELEGRAPH,
  emptyBeats,
  emptyWeather,
  GUEST_LOCK,
  GOING_UNDER,
  lineFor,
  movementReady,
  namedWeatherPoi,
  naveClerks,
  navePois,
  naveRites,
  naveSigns,
  NAVE_NPCS,
  nearPoint,
  NpcId,
  npcById,
  Poi,
  Rite,
  Sign,
  STRUCK_PLAQUE,
  weatherComplete,
  WeatherHeard,
  WEATHER_NAMED,
} from "./campaign";
import { BODY_R, circleHitsWalls, nearNode, naveNodes, YieldNode } from "./nave";

export const TICK_HZ = 20;
export const DT = 1 / TICK_HZ;
export const SPEED = 160;
export const STRIKE_RANGE = 52;
export const STRIKE_DAMAGE = 22;
export const STRIKE_COOLDOWN = 0.45;
export const MAX_HP = 100;

export type Intent = { up: boolean; down: boolean; left: boolean; right: boolean };

export type Wreckage = {
  id: string;
  x: number;
  y: number;
  fromId: string;
  fromName: string;
  until: number;
};

export type Player = {
  id: string;
  x: number;
  y: number;
  guest: boolean;
  aura: number;
  bestand: number;
  winke: number;
  hp: number;
  strikeCd: number;
  readiness: number;
  beats: Beats;
  weather: WeatherHeard;
  namedWeather: boolean;
  locked: boolean;
  heard: string;
};

export type WorldState = {
  players: Map<string, Player>;
  intents: Map<string, Intent>;
  nodes: YieldNode[];
  wreckage: Wreckage[];
  rites: Rite[];
  clerks: Clerk[];
  signs: Sign[];
  pois: Poi[];
  weatherNamed: boolean;
  gestell: number;
  now: number;
};

export function spawnGuest(id: string): Player {
  return {
    id,
    x: 48 * 4,
    y: 48 * 10,
    guest: true,
    aura: 0,
    bestand: 0,
    winke: 0,
    hp: MAX_HP,
    strikeCd: 0,
    readiness: 0,
    beats: emptyBeats(),
    weather: emptyWeather(),
    namedWeather: false,
    locked: false,
    heard: "",
  };
}

export function guestCanClaim(_p: Player): boolean {
  return false;
}

export function damageFor(_p: Player): number {
  return STRIKE_DAMAGE;
}

export function stepPlayer(p: Player, intent: Intent, dt: number): Player {
  let vx = (intent.right ? 1 : 0) - (intent.left ? 1 : 0);
  let vy = (intent.down ? 1 : 0) - (intent.up ? 1 : 0);
  const len = Math.hypot(vx, vy) || 1;
  vx = (vx / len) * SPEED * dt;
  vy = (vy / len) * SPEED * dt;
  let x = p.x + vx;
  let y = p.y + vy;
  if (circleHitsWalls(x, y, BODY_R)) {
    if (!circleHitsWalls(p.x + vx, p.y, BODY_R)) {
      x = p.x + vx;
      y = p.y;
    } else if (!circleHitsWalls(p.x, p.y + vy, BODY_R)) {
      x = p.x;
      y = p.y + vy;
    } else {
      x = p.x;
      y = p.y;
    }
  }
  return { ...p, x, y, strikeCd: Math.max(0, p.strikeCd - dt) };
}

export function emptyWorld(): WorldState {
  return {
    players: new Map(),
    intents: new Map(),
    nodes: naveNodes(),
    wreckage: [],
    rites: naveRites(),
    clerks: naveClerks(),
    signs: naveSigns(),
    pois: navePois(),
    weatherNamed: false,
    gestell: 12,
    now: 0,
  };
}

export function tickWorld(w: WorldState, dt: number): WorldState {
  const now = w.now + dt;
  const players = new Map<string, Player>();
  for (const [id, p] of w.players) {
    const intent = w.intents.get(id) ?? { up: false, down: false, left: false, right: false };
    players.set(id, stepPlayer(p, intent, dt));
  }
  const afterClerks = tickClerks({ ...w, now, players }, dt);
  return {
    ...afterClerks,
    wreckage: afterClerks.wreckage.filter((r) => r.until > now),
  };
}

export function tickClerks(w: WorldState, dt: number): WorldState {
  const players = new Map(w.players);
  const clerks: Clerk[] = [];
  let wreckage = w.wreckage;
  for (const c of w.clerks) {
    if (c.hp <= 0) continue;
    const living = [...players.values()].filter((p) => p.hp > 0);
    const target = living.find((p) => nearPoint(p.x, p.y, c.x, c.y, CLERK_AGGRO));
    if (c.telegraph > 0) {
      const next = c.telegraph - dt;
      if (next <= 0 && target) {
        const hit = players.get(target.id)!;
        const hp = hit.hp - CLERK_DAMAGE;
        if (hp <= 0) {
          wreckage = [
            ...wreckage,
            { id: `w-${hit.id}-${w.now}`, x: hit.x, y: hit.y, fromId: hit.id, fromName: "Guest", until: w.now + 45 },
          ];
          players.set(hit.id, {
            ...spawnGuest(hit.id),
            bestand: hit.bestand,
            winke: hit.winke,
            aura: Math.max(0, hit.aura - 8),
            guest: hit.guest,
            beats: { ...hit.beats },
            weather: { ...hit.weather },
            namedWeather: hit.namedWeather,
            locked: hit.locked,
            heard: `${c.name} did their job.`,
          });
        } else {
          players.set(hit.id, { ...hit, hp });
        }
        clerks.push({ ...c, telegraph: 0 });
      } else {
        clerks.push({ ...c, telegraph: target ? Math.max(0, next) : 0 });
      }
    } else if (target) {
      clerks.push({ ...c, telegraph: CLERK_TELEGRAPH });
    } else {
      clerks.push({ ...c, telegraph: 0 });
    }
  }
  return { ...w, players, clerks, wreckage };
}

export function applyStrike(w: WorldState, attackerId: string): WorldState {
  const a = w.players.get(attackerId);
  if (!a || a.hp <= 0 || a.strikeCd > 0) return w;
  const players = new Map(w.players);
  const attacker = { ...a, strikeCd: STRIKE_COOLDOWN };
  players.set(attackerId, attacker);
  const dmg = damageFor(a);
  let wreckage = w.wreckage;
  for (const [id, b] of w.players) {
    if (id === attackerId || b.hp <= 0) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (dx * dx + dy * dy > STRIKE_RANGE * STRIKE_RANGE) continue;
    let hp = b.hp - dmg;
    if (hp <= 0) {
      wreckage = [
        ...wreckage,
        { id: `w-${id}-${w.now}`, x: b.x, y: b.y, fromId: id, fromName: b.guest ? "Guest" : "Angel", until: w.now + 45 },
      ];
      const drop = Math.floor(b.bestand * 0.3);
      players.set(id, {
        ...spawnGuest(id),
        bestand: b.bestand - drop,
        winke: b.winke,
        aura: Math.max(0, b.aura - 8),
        guest: b.guest,
        beats: { ...b.beats },
        weather: { ...b.weather },
        namedWeather: b.namedWeather,
        locked: b.locked,
        heard: b.heard,
      });
    } else {
      players.set(id, { ...b, hp });
    }
  }
  const clerks: Clerk[] = [];
  for (const c of w.clerks) {
    const dx = c.x - a.x;
    const dy = c.y - a.y;
    if (c.hp <= 0 || dx * dx + dy * dy > STRIKE_RANGE * STRIKE_RANGE) {
      if (c.hp > 0) clerks.push(c);
      continue;
    }
    const hp = c.hp - dmg;
    if (hp <= 0) {
      wreckage = [
        ...wreckage,
        { id: `w-${c.id}-${w.now}`, x: c.x, y: c.y, fromId: c.id, fromName: c.name, until: w.now + 45 },
      ];
      players.set(attackerId, { ...players.get(attackerId)!, heard: `${c.name} falls. They were doing a job.` });
    } else {
      clerks.push({ ...c, hp });
    }
  }
  return { ...w, players, wreckage, clerks };
}

export function applyUse(
  w: WorldState,
  playerId: string,
  nodeId: string,
  choice: "extract" | "keep",
): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || p.locked) return w;
  const idx = w.nodes.findIndex((n) => n.id === nodeId);
  if (idx < 0) return w;
  const node = w.nodes[idx];
  if (node.depleted || !nearNode(p.x, p.y, node)) return w;
  const nodes = w.nodes.slice();
  const players = new Map(w.players);
  if (choice === "extract") {
    nodes[idx] = { ...node, depleted: true, kept: false };
    players.set(playerId, { ...p, bestand: p.bestand + 40 });
    return { ...w, nodes, players, gestell: Math.min(100, w.gestell + 6) };
  }
  nodes[idx] = { ...node, depleted: true, kept: true };
  players.set(playerId, { ...p, winke: p.winke + 1, readiness: p.readiness + 1 });
  return { ...w, nodes, players, gestell: Math.max(0, w.gestell - 3) };
}

function withNamedWeather(w: WorldState, playerId: string, p: Player): WorldState {
  if (p.namedWeather || !weatherComplete(p.weather)) {
    const players = new Map(w.players);
    players.set(playerId, p);
    return { ...w, players };
  }
  const named = { ...p, namedWeather: true, readiness: p.readiness + 1, heard: WEATHER_NAMED };
  const players = new Map(w.players);
  players.set(playerId, named);
  if (w.weatherNamed) return { ...w, players };
  return {
    ...w,
    players,
    weatherNamed: true,
    signs: w.signs.map((s) => (s.id === "safety-plaque" ? { ...STRUCK_PLAQUE } : s)),
    pois: w.pois.map((poi) => (poi.id === "weather" ? namedWeatherPoi() : poi)),
  };
}

export function applyTalk(w: WorldState, playerId: string, npcId: string): WorldState {
  const p = w.players.get(playerId);
  const npc = npcById(npcId);
  if (!p || p.hp <= 0 || !npc || !nearPoint(p.x, p.y, npc.x, npc.y)) return w;
  const id = npc.id as NpcId;
  const heard = lineFor(id, p.beats);
  const beats = { ...p.beats, [id]: true };
  const weather = {
    ...p.weather,
    nara: p.weather.nara || id === "nara",
    ord: p.weather.ord || id === "ord",
  };
  return withNamedWeather(w, playerId, { ...p, beats, weather, heard });
}

export function applyRead(w: WorldState, playerId: string, signId: string): WorldState {
  const p = w.players.get(playerId);
  const sign = w.signs.find((s) => s.id === signId);
  if (!p || p.hp <= 0 || !sign || !nearPoint(p.x, p.y, sign.x, sign.y, 56)) return w;
  const weather = { ...p.weather, safety: true };
  const heard = `${sign.title}: ${sign.text}`;
  return withNamedWeather(w, playerId, { ...p, weather, heard });
}

export function applyBury(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || p.locked) return w;
  const players = new Map(w.players);
  const plot = w.rites.find((r) => r.kind === "burial" && !r.done);
  if (plot && nearPoint(p.x, p.y, plot.x, plot.y)) {
    const rites = w.rites.map((r) => (r.id === plot.id ? { ...r, done: true } : r));
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, nara: true, burial: true },
      readiness: p.readiness + 1,
      heard: lineFor("nara", { ...p.beats, nara: true, burial: true }),
    });
    return { ...w, players, rites };
  }
  const wreck = w.wreckage.find((r) => nearPoint(p.x, p.y, r.x, r.y, 56));
  if (!wreck) return w;
  players.set(playerId, {
    ...p,
    readiness: p.readiness + 1,
    heard: "Nara Vale would call this someone. You put them in the ground.",
  });
  return { ...w, players, wreckage: w.wreckage.filter((r) => r.id !== wreck.id) };
}

export function applyGoingUnder(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || p.locked) return w;
  if (!movementReady(p.beats) || !nearPoint(p.x, p.y, GOING_UNDER.x, GOING_UNDER.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest) {
    players.set(playerId, { ...p, locked: true, heard: GUEST_LOCK });
    return { ...w, players };
  }
  const rites = w.rites.map((r) => (r.kind === "going-under" ? { ...r, done: true } : r));
  players.set(playerId, {
    ...p,
    winke: p.winke + 1,
    readiness: p.readiness + 1,
    heard: ANGEL_UNDER,
  });
  return { ...w, players, rites };
}

export function snapshot(w: WorldState) {
  return {
    t: "snap" as const,
    now: w.now,
    gestell: w.gestell,
    players: [...w.players.values()],
    nodes: w.nodes,
    wreckage: w.wreckage,
    rites: w.rites,
    clerks: w.clerks,
    npcs: NAVE_NPCS,
    signs: w.signs,
    pois: w.pois,
    weatherNamed: w.weatherNamed,
  };
}
