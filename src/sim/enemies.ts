/**
 * Enemy archetypes and spawns. Clerks, wardens and enforcers are people doing
 * jobs; the dummy is furniture. Their numbers live in constants.ts.
 */
import { ENEMY } from "./constants";
import { ENEMY_SPAWNS, type EnemySpawn } from "./map";
import type { Enemy, EnemyKind } from "./types";

export function enemyStats(kind: EnemyKind): (typeof ENEMY)[EnemyKind] {
  return ENEMY[kind];
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
  };
}

/** One enemy per authored spawn, all idle at home. */
export function initialEnemies(): Enemy[] {
  return ENEMY_SPAWNS.map(s => spawnEnemy(s, 0));
}
