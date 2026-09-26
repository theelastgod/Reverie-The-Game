import { describe, expect, it } from "vitest";
import { ENEMY, ENEMY_LEASH, TILE } from "./constants";
import { applyStrike, tickEnemies } from "./combat";
import { anchorOf, initialEnemies, routeOf, strayOf } from "./enemies";
import { SPAWN_BY_ID } from "./map";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { F } from "./content/ids";
import { FALL_LINES } from "./content/lines";
import type { Enemy, Player, WorldState } from "./types";

const at = (tx: number, ty: number) => ({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 });
const RUNNER = "annex-runner";

function put(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}
const enemy = (w: WorldState, id: string): Enemy => w.enemies.find(e => e.id === id)!;
const setEnemy = (w: WorldState, id: string, over: Partial<Enemy>): WorldState => ({ ...w, enemies: w.enemies.map(e => (e.id === id ? { ...e, ...over } : e)) });
function run(w: WorldState, seconds: number, dt = 0.05): WorldState {
  for (let t = 0; t < seconds - 1e-9; t += dt) w = tickWorld(w, dt);
  return w;
}
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

describe("the Annex Runner's route", () => {
  it("is authored as a cycle from the Annex gate down the west corridor and back, and starts at home on leg 0", () => {
    const spawn = SPAWN_BY_ID[RUNNER];
    expect(spawn.kind).toBe("courier");
    expect(spawn.fallFlag).toBe(F.BULLETIN);
    expect(spawn.route).toEqual([at(6, 30), at(6, 47), at(6, 30), at(17, 30)]);
    expect({ x: spawn.x, y: spawn.y }).toEqual(at(17, 30));
    const e = initialEnemies().find(x => x.id === RUNNER)!;
    expect(e.leg).toBe(0);
    expect(anchorOf(e)).toEqual(at(6, 30));
    expect(routeOf({ id: "desk-three" })).toBeNull();
    expect(initialEnemies().find(x => x.id === "desk-three")!.leg).toBeUndefined();
  });

  it("walks the route while idle, one point at a time, around again at the end", () => {
    let w = emptyWorld();
    const start = enemy(w, RUNNER);
    w = run(w, 1);
    let e = enemy(w, RUNNER);
    expect(e.state).toBe("idle");
    expect(e.x).toBeLessThan(start.x);
    expect(e.y).toBe(start.y);
    expect(dist(e, start)).toBeCloseTo(ENEMY.courier.speed, 0);
    // the first leg is eleven tiles: about four seconds
    w = run(w, 4);
    e = enemy(w, RUNNER);
    expect(e.leg).toBe(1);
    expect({ x: e.x, y: e.y }).not.toEqual(at(6, 30));
    expect(e.y).toBeGreaterThan(at(6, 30).y);
    // the whole cycle: 11 + 17 + 17 + 11 tiles at 130 px/s is 20.7 s; at 22 s it is a second and a bit into the next lap
    w = run(w, 17);
    e = enemy(w, RUNNER);
    expect(e.leg).toBe(0);
    expect(e.y).toBe(start.y);
    expect(e.x).toBeLessThan(start.x);
    expect(dist(e, start)).toBeGreaterThan(ENEMY.courier.speed);
    expect(dist(e, start)).toBeLessThan(2 * ENEMY.courier.speed);
  });

  it("never starts a fight, and answers whoever struck it", () => {
    let w = emptyWorld();
    const e0 = enemy(w, RUNNER);
    w = put(w, { ...spawnGuest("g"), x: e0.x - 30, y: e0.y, facing: { dx: 1, dy: 0 } });
    w = tickEnemies(w, 0.05);
    expect(enemy(w, RUNNER).state).toBe("idle");
    w = applyStrike(w, "g");
    const struck = enemy(w, RUNNER);
    expect(struck.hp).toBeLessThan(struck.maxHp);
    expect(struck.state).toBe("idle");
    w = tickEnemies(w, 0.05);
    expect(enemy(w, RUNNER)).toMatchObject({ state: "aggro", targetId: "g" });
  });

  it("is leashed to the point it is walking toward, returns there, and respawns at home on leg 0", () => {
    let w = emptyWorld();
    const e0 = enemy(w, RUNNER);
    const anchor = anchorOf(e0);
    // the corridor itself is never a stray; a point 400 px off both legs is
    const far = { x: anchor.x + 400, y: anchor.y + 400 };
    expect(strayOf({ ...e0, x: anchor.x, y: anchor.y + ENEMY_LEASH + 60 }), "on the corridor").toBe(0);
    expect(strayOf({ ...e0, ...far })).toBe(400);
    w = put(w, { ...spawnGuest("g"), x: far.x, y: far.y + 30 });
    w = setEnemy(w, RUNNER, { ...far, state: "aggro", targetId: "g", hp: 5, participants: ["g"] });
    w = tickWorld(w, 0.05);
    expect(enemy(w, RUNNER).state).toBe("return");
    w = run(w, 6);
    let e = enemy(w, RUNNER);
    expect(e.state).toBe("idle");
    expect(e.hp).toBe(e.maxHp);
    expect(strayOf(e), "back on the corridor and walking it again, not at the gate").toBeLessThan(1);
    expect(dist(e, e.home)).toBeGreaterThan(ENEMY.courier.speed);

    w = setEnemy(w, RUNNER, { state: "dead", hp: 0, respawnAt: w.now, leg: 2 });
    w = tickEnemies(w, 0.05);
    e = enemy(w, RUNNER);
    expect(e).toMatchObject({ state: "idle", leg: 0, x: e.home.x, y: e.home.y, hp: e.maxHp });
  });

  it("hands every participant the bulletin and the line when it falls", () => {
    let w = emptyWorld();
    const e0 = enemy(w, RUNNER);
    w = put(w, { ...spawnGuest("a"), x: e0.x - 30, y: e0.y, facing: { dx: 1, dy: 0 } });
    w = put(w, { ...spawnGuest("b"), x: e0.x + 30, y: e0.y, facing: { dx: -1, dy: 0 } });
    w = put(w, { ...spawnGuest("watcher"), x: e0.x, y: e0.y + 300 });
    w = setEnemy(w, RUNNER, { hp: 30 });
    w = applyStrike(w, "a");
    w = applyStrike(w, "b");
    expect(enemy(w, RUNNER).state).toBe("dead");
    for (const id of ["a", "b"]) {
      expect(w.players.get(id)!.flags[F.BULLETIN]).toBe(1);
      expect(w.players.get(id)!.heard).toBe(FALL_LINES.bulletin);
    }
    expect(w.players.get("watcher")!.flags[F.BULLETIN]).toBeUndefined();
    expect(w.wreckage.some(r => r.fromId === RUNNER)).toBe(true);
  });
});
