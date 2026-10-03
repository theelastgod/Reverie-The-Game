import { describe, expect, it } from "vitest";
import { BODY_R, DESCENT_FILE, DESCENT_WINDOW, DT, ENEMY_LEASH } from "./constants";
import { POSITIONS, SPAWN_BY_ID, STAIR_SPAWNS, circleHitsWalls, districtAt } from "./map";
import { C, F, W } from "./content/ids";
import { NPCS } from "./content/npcs";
import { POI_CONFIGS } from "./content/pois";
import { descentFrom, descentLive, reconcileDescent } from "./descent";
import { strayOf } from "./enemies";
import type { Enemy, Player, WorldState } from "./types";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { snapshotFor } from "./snapshot";
import { spriteFor } from "../assets/slots";

const ME = "me";
const STAIR = new Set(STAIR_SPAWNS.map(s => s.id));

function tick(w: WorldState, n = 1): WorldState {
  let cur = w;
  for (let i = 0; i < n; i++) cur = tickWorld(cur, DT);
  return cur;
}

const stair = (w: WorldState): Enemy[] => w.enemies.filter(e => STAIR.has(e.id));
const withDescent = (w: WorldState): WorldState => ({ ...w, flags: { ...w.flags, [W.CLERKS_DESCENT]: descentFrom(w.now) } });
const setClerk = (w: WorldState, id: string, patch: Partial<Enemy>): WorldState => ({ ...w, enemies: w.enemies.map(e => (e.id === id ? { ...e, ...patch } : e)) });

function withBody(w: WorldState, positionId: string, patch: Partial<Player> = {}): WorldState {
  const pos = POSITIONS[positionId];
  const players = new Map(w.players);
  players.set(ME, { ...spawnGuest(ME, w.now), guest: false, serial: 7, name: "#0007", x: pos.x, y: pos.y, district: districtAt(pos.x, pos.y), ...patch });
  return { ...w, players };
}

describe("the clerks' descent (III.7)", () => {
  it("lays the stair inside the Kerb, walkable end to end, the clerks' route a cycle down to the Grid's gate and back", () => {
    for (const s of STAIR_SPAWNS) {
      expect(SPAWN_BY_ID[s.id], "the route is found by id").toBe(s);
      expect(s).toMatchObject({ kind: "clerk", district: "kerb", name: "Hour Clerk" });
      expect(spriteFor({ kind: "clerk", id: s.id }), "the Kerb's clerk sprite").toBe("sprites/hour-clerk.png");
      const points = [{ x: s.x, y: s.y }, ...s.route!, s.route![0]];
      for (let i = 0; i + 1 < points.length; i++) {
        const a = points[i];
        const b = points[i + 1];
        for (let k = 0; k <= 40; k++) {
          const x = a.x + ((b.x - a.x) * k) / 40;
          const y = a.y + ((b.y - a.y) * k) / 40;
          expect(circleHitsWalls(x, y, BODY_R), `${s.id} leg ${i} at ${Math.round(x)},${Math.round(y)}`).toBe(false);
          expect(districtAt(x, y)).toBe("kerb");
        }
      }
    }
    // from the head of the stair, below the glass room's door, down past the glass to the gate
    const head = STAIR_SPAWNS[0];
    expect(Math.hypot(head.x - POSITIONS["oval-glass"].x, head.y - POSITIONS["oval-glass"].y)).toBeLessThan(5 * 48);
    const foot = head.route!.reduce((a, b) => (b.y > a.y ? b : a));
    expect(districtAt(foot.x, foot.y + 3 * 48), "the foot of the stair is at the Grid's gate").not.toBe("kerb");
  });

  it("keeps an empty stair when no light has gone out: no clerks, and the world untouched", () => {
    const w = tick(emptyWorld(), 3);
    expect(stair(w)).toEqual([]);
    expect(reconcileDescent(w)).toBe(w);
    expect(descentLive(w)).toBe(false);
  });

  it("files the clerks out one after another for the hour, walks them down the stair, and sends them back up after it", () => {
    let w = withDescent(tick(emptyWorld()));
    expect(descentLive(w)).toBe(true);
    w = tick(w);
    expect(stair(w).map(e => e.id), "the first starts down").toEqual([STAIR_SPAWNS[0].id]);
    expect(stair(w)[0]).toMatchObject({ name: "Hour Clerk", state: "idle", hp: stair(w)[0].maxHp });
    w = tick(w, Math.ceil(DESCENT_FILE / DT));
    expect(stair(w).length, "the second follows").toBe(2);
    w = tick(w, Math.ceil(DESCENT_FILE / DT));
    expect(stair(w).length, "then the third, and no more").toBe(3);
    const steady = tick(w, 4);
    expect(stair(steady).length).toBe(3);
    // down the stair: the first is well below the head and still on its route
    const first = stair(steady).find(e => e.id === STAIR_SPAWNS[0].id)!;
    expect(first.y).toBeGreaterThan(STAIR_SPAWNS[0].y + 2 * 48);
    expect(strayOf(first)).toBeLessThan(ENEMY_LEASH);
    // and a viewer on the stair sees them
    const seen = snapshotFor(withBody(steady, "forecast-glass"), ME).enemies.filter(e => STAIR.has(e.id));
    expect(seen.length).toBeGreaterThan(0);
    // the hour out: every clerk not in a fight goes
    const after = tick({ ...steady, now: steady.flags[W.CLERKS_DESCENT] });
    expect(descentLive(after)).toBe(false);
    expect(stair(after)).toEqual([]);
    expect(reconcileDescent(after), "and the stair stays empty").toBe(after);
  });

  it("lets a clerk in a fight finish it after the hour, and a fallen one goes with the rest", () => {
    let w = withBody(emptyWorld(), "kerb-node-1");
    w = tick(withDescent(w), Math.ceil((2 * DESCENT_FILE) / DT) + 2);
    expect(stair(w).length).toBe(3);
    const [a, b] = STAIR_SPAWNS;
    w = setClerk(w, a.id, { state: "aggro", targetId: ME }); // chasing the Angel across the Kerb
    w = setClerk(w, b.id, { state: "dead", respawnAt: w.now + 30 });
    let after = tick({ ...w, now: w.flags[W.CLERKS_DESCENT] });
    expect(stair(after).map(e => e.id), "the fight goes on; the fallen and the idle are gone").toEqual([a.id]);
    after = tick(setClerk(after, a.id, { state: "return", targetId: "" }));
    expect(stair(after)).toEqual([]);
  });

  it("keeps the clerks down an hour from a second light, and files them out again for a world restored mid-hour", () => {
    let w = tick(withDescent(tick(emptyWorld())), Math.ceil((2 * DESCENT_FILE) / DT) + 2);
    const firstUntil = w.flags[W.CLERKS_DESCENT];
    w = tick({ ...w, now: firstUntil - 60 });
    w = tick(withDescent(w));
    expect(w.flags[W.CLERKS_DESCENT]).toBeGreaterThan(firstUntil);
    w = tick({ ...w, now: firstUntil + 1 });
    expect(stair(w).length, "still on the stair past the first hour").toBe(3);
    // a restored world brings its enemies back from the defaults with the flag kept: the next tick files the clerks out again
    const restored = tick({ ...w, enemies: emptyWorld().enemies });
    expect(stair(restored).length).toBe(3);
    expect(stair(restored).every(e => e.x === STAIR_SPAWNS[0].x && e.y === STAIR_SPAWNS[0].y)).toBe(true);
  });

  it("sends them down from the oval: the light's say, its flag an hour on, and Caul's lines on the stair while they are on it", () => {
    const w0 = withBody(emptyWorld(), "oval-glass", { flags: { [F.CAUL_OFFER]: 1 } });
    const ctx = { w: w0, p: w0.players.get(ME)!, now: w0.now };
    const q = POI_CONFIGS["oval-glass"].verbs.find(v => v.choice === "dark")!;
    expect(q.say).toContain("On the stair, the hour clerks start down.");
    const effects = typeof q.effects === "function" ? q.effects(ctx) : q.effects ?? [];
    expect(effects).toContainEqual({ kind: "worldFlag", key: W.CLERKS_DESCENT, value: w0.now + DESCENT_WINDOW });
    const dark = NPCS.caul.nodes.dark;
    expect(typeof dark.text === "string" ? dark.text : "").toContain("The clerks are on the stair. A light goes and they come down. It is what the stair is for.");
    const after = NPCS.caul.nodes.after.text as (c: typeof ctx) => string;
    const darkened = { ...ctx, p: { ...ctx.p, choices: { [C.GLASS]: "dark" } } };
    expect(after({ ...darkened, w: withDescent(w0) })).toBe("\"The clerks are still on the stair. They will be, for the hour.\"");
    expect(after(darkened), "after their hour, the light alone").toBe("\"The light is out. It stays out. So do I, until the hour.\"");
  });
});
