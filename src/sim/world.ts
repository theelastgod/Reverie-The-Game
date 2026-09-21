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
};

export type WorldState = {
  players: Map<string, Player>;
  intents: Map<string, Intent>;
  nodes: YieldNode[];
  wreckage: Wreckage[];
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
  };
}

export function guestCanClaim(_p: Player): boolean {
  return false;
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
  return {
    ...w,
    now,
    players,
    wreckage: w.wreckage.filter((r) => r.until > now),
  };
}

export function applyStrike(w: WorldState, attackerId: string): WorldState {
  const a = w.players.get(attackerId);
  if (!a || a.hp <= 0 || a.strikeCd > 0) return w;
  const players = new Map(w.players);
  const attacker = { ...a, strikeCd: STRIKE_COOLDOWN };
  players.set(attackerId, attacker);
  let wreckage = w.wreckage;
  for (const [id, b] of w.players) {
    if (id === attackerId || b.hp <= 0) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (dx * dx + dy * dy > STRIKE_RANGE * STRIKE_RANGE) continue;
    let hp = b.hp - STRIKE_DAMAGE;
    if (hp <= 0) {
      wreckage = [
        ...wreckage,
        { id: `w-${id}-${w.now}`, x: b.x, y: b.y, fromId: id, until: w.now + 45 },
      ];
      const drop = Math.floor(b.bestand * 0.3);
      players.set(id, {
        ...spawnGuest(id),
        bestand: b.bestand - drop,
        winke: b.winke,
        aura: Math.max(0, b.aura - 8),
        guest: b.guest,
      });
    } else {
      players.set(id, { ...b, hp });
    }
  }
  return { ...w, players, wreckage };
}

export function applyUse(
  w: WorldState,
  playerId: string,
  nodeId: string,
  choice: "extract" | "keep",
): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0) return w;
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

export function snapshot(w: WorldState) {
  return {
    t: "snap" as const,
    now: w.now,
    gestell: w.gestell,
    players: [...w.players.values()],
    nodes: w.nodes,
    wreckage: w.wreckage,
  };
}
