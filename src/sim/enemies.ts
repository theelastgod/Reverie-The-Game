/**
 * Enemy archetypes and spawns. Clerks, wardens and enforcers are people doing
 * jobs; the dummy is furniture; a courier walks a route with something in
 * hand and only answers a fight. Their numbers live in constants.ts.
 */
import { ENEMY } from "./constants";
import { ENEMY_SPAWNS, SPAWN_BY_ID, type EnemySpawn } from "./map";
import type { Enemy, EnemyKind, Vec } from "./types";

export function enemyStats(kind: EnemyKind): (typeof ENEMY)[EnemyKind] {
  return ENEMY[kind];
}

/** The authored route of this enemy, if it walks one; content, never saved with the world. */
export function routeOf(e: Pick<Enemy, "id">): Vec[] | null {
  const route = SPAWN_BY_ID[e.id]?.route;
  return route && route.length ? route : null;
}

/** Where this enemy belongs right now: the point of its route it is walking toward, else home. */
export function anchorOf(e: Enemy): Vec {
  const route = routeOf(e);
  if (!route) return e.home;
  return route[(e.leg ?? 0) % route.length];
}

function segmentDistance(p: Vec, a: Vec, b: Vec): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** How far this enemy stands from where it belongs: its route, walked as a cycle from home, or home itself. The leash reads this. */
export function strayOf(e: Enemy): number {
  const route = routeOf(e);
  if (!route) return Math.hypot(e.x - e.home.x, e.y - e.home.y);
  const points = [e.home, ...route];
  let best = Infinity;
  for (let i = 0; i < points.length; i++) best = Math.min(best, segmentDistance(e, points[i], points[(i + 1) % points.length]));
  return best;
}

export function spawnEnemy(spawn: EnemySpawn, now: number, name?: string): Enemy {
  const stats = enemyStats(spawn.kind);
  return {
    id: spawn.id,
    kind: spawn.kind,
    name: name ?? spawn.name,
    district: spawn.district,
    x: spawn.x,
    y: spawn.y,
    home: { x: spawn.x, y: spawn.y },
    hp: stats.hp,
    maxHp: stats.hp,
    state: "idle",
    t: 0,
    targetId: "",
    participants: [],
    respawnAt: now,
    tint: spawn.tint,
    ...(spawn.fallFlag ? { fallFlag: spawn.fallFlag } : {}),
    ...(spawn.route ? { leg: 0 } : {}),
  };
}

/** One enemy per authored spawn, all idle at home. */
export function initialEnemies(): Enemy[] {
  return ENEMY_SPAWNS.map(s => spawnEnemy(s, 0));
}
