/**
 * The clerks' descent (III.7, Phase C). A light put out behind the forecast glass sends the hour clerks down the
 * Kerb's stair for the hour after it, for everyone: W.CLERKS_DESCENT holds the world time they go back up (the oval's
 * Q sets it DESCENT_WINDOW on, so a second light while they are down keeps them down an hour from the second). The
 * tick reconciles the world to the flag (world.ts): while the descent is live the stair clerks (map.ts STAIR_SPAWNS)
 * file out of the head of the stair DESCENT_FILE apart and walk their route, and fall and come back as clerks do
 * (the respawn is a shift change, at the head of the stair); once the hour is out each one goes as soon as it is out
 * of a fight. They are not saved: a restored world has none, and the reconcile files them out again if the hour runs.
 */
import { DESCENT_FILE, DESCENT_WINDOW } from "./constants";
import { W } from "./content/ids";
import { spawnEnemy } from "./enemies";
import { STAIR_SPAWNS } from "./map";
import type { Enemy, WorldState } from "./types";

const STAIR_IDS = new Set(STAIR_SPAWNS.map(s => s.id));

/** The world time the hour clerks go back up; 0 if no light has gone out. */
export const descentUntil = (w: Pick<WorldState, "flags">): number => w.flags[W.CLERKS_DESCENT] ?? 0;

/** The hour clerks are on the stair. */
export const descentLive = (w: Pick<WorldState, "now" | "flags">): boolean => w.now < descentUntil(w);

/** What the oval's Q sets: the clerks on the stair for the hour from now. */
export const descentFrom = (now: number): number => now + DESCENT_WINDOW;

const fighting = (e: Enemy): boolean => e.state === "aggro" || e.state === "telegraph" || e.state === "recover";

/** Puts the stair where the flag says: the clerks filed out while the hour runs, and each gone after it once out of a fight. */
export function reconcileDescent(w: WorldState): WorldState {
  const live = descentLive(w);
  const present = w.enemies.filter(e => STAIR_IDS.has(e.id));
  if (!live && present.length === 0) return w;
  if (live) {
    const start = descentUntil(w) - DESCENT_WINDOW;
    const have = new Set(present.map(e => e.id));
    const due = STAIR_SPAWNS.filter((s, i) => !have.has(s.id) && w.now >= start + i * DESCENT_FILE);
    if (due.length === 0) return w;
    return { ...w, enemies: [...w.enemies, ...due.map(s => spawnEnemy(s, w.now))] };
  }
  const gone = new Set(present.filter(e => !fighting(e)).map(e => e.id));
  if (gone.size === 0) return w;
  return { ...w, enemies: w.enemies.filter(e => !gone.has(e.id)) };
}
