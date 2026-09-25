import { describe, expect, it } from "vitest";
import { MAX_HP, NODE_CHARGES } from "./constants";
import { NODE_LIST, ENEMY_SPAWNS } from "./map";
import { POI_STATES } from "./content/ids";
import { migratePlayer, migrateWorld } from "./migrate";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { snapshotFor } from "./snapshot";

describe("world shape migration", () => {
  it("restores nothing into the current defaults", () => {
    const w = migrateWorld(undefined);
    const base = emptyWorld();
    expect(w.nodes).toEqual(base.nodes);
    expect(w.enemies).toEqual(base.enemies);
    expect(Object.keys(w.pois).sort()).toEqual(Object.keys(base.pois).sort());
    expect(w.players.size).toBe(0);
  });

  it("keeps progress and drops stale collections from an older build", () => {
    const old = {
      now: 512.5,
      tick: 10250,
      gestell: 66,
      weatherNamed: true,
      flags: { extractions: 9, bogus: "x" },
      nodes: [
        { id: "nave-node-1", x: 1, y: 1, charges: 99, kept: true, keptBy: "a" }, // out-of-range charges, moved position
        { id: "retired-node", x: 5, y: 5, charges: 3 }, // no longer in the level
      ],
      enemies: [{ id: "old-enemy", kind: "clerk", hp: 3 }],
      pois: { "safety-plaque": { state: "named", by: "a", at: 4, count: 2 }, "nara-plot": { state: "vanished" }, "retired-poi": { state: "x" } },
      npcs: { nara: { x: 100, y: 200, district: "care", present: false, state: "garden" }, ghost: { x: 0, y: 0 } },
      houses: { standing: { earth: 3, sky: "seven" }, tithe: 12 },
    };
    const w = migrateWorld(old);
    expect(w.now).toBe(512.5);
    expect(w.gestell).toBe(66);
    expect(w.weatherNamed).toBe(true);
    expect(w.flags).toEqual({ extractions: 9 });
    // Nodes: positions from the level, progress kept, charges clamped, unknown ids gone, missing ids default.
    expect(w.nodes).toHaveLength(NODE_LIST.length);
    const n1 = w.nodes.find((n) => n.id === "nave-node-1")!;
    expect(n1.x).toBe(NODE_LIST[0].x);
    expect(n1.charges).toBe(NODE_CHARGES);
    expect(n1.kept).toBe(true);
    expect(w.nodes.some((n) => n.id === "retired-node")).toBe(false);
    // Enemies are transient and rebuilt.
    expect(w.enemies.map((e) => e.id)).toEqual(ENEMY_SPAWNS.map((e) => e.id));
    // POIs: valid states kept, invalid reset, unknown dropped, every current id present.
    expect(w.pois["safety-plaque"]).toEqual({ state: "named", by: "a", at: 4, count: 2 });
    expect(w.pois["nara-plot"].state).toBe(POI_STATES["nara-plot"][0]);
    expect(w.pois["retired-poi"]).toBeUndefined();
    expect(Object.keys(w.pois).length).toBe(Object.keys(POI_STATES).length);
    // NPCs: moved ones stay moved, ghosts vanish.
    expect(w.npcs.nara).toMatchObject({ x: 100, y: 200, district: "care", present: false, state: "garden" });
    expect(w.npcs.ghost).toBeUndefined();
    // Houses: numbers only.
    expect(w.houses.standing.earth).toBe(3);
    expect(w.houses.standing.sky).toBe(0);
    expect(w.houses.tithe).toBe(12);
    // The world ticks and snapshots for a fresh guest without throwing.
    w.players.set("g", spawnGuest("g", w.now));
    const t = tickWorld(w, 0.05);
    const snap = snapshotFor(t, "g");
    expect(snap.nodes.length).toBeGreaterThan(0);
  });

  it("accepts players saved as pairs or as an object and normalizes each", () => {
    const p = { ...spawnGuest("a"), bestand: 40, hp: Number.NaN, party: { nara: "with" }, flags: { under: 1, junk: "no" }, dialogue: { node: "stale" }, duel: { with: "b" } };
    const asPairs = migrateWorld({ players: [["a", p]] });
    const asObject = migrateWorld({ players: { a: p } });
    for (const w of [asPairs, asObject]) {
      const a = w.players.get("a")!;
      expect(a.bestand).toBe(40);
      expect(a.hp).toBe(MAX_HP);
      expect(a.party).toEqual({ nara: "with", quill: "none", ord: "none" });
      expect(a.flags).toEqual({ under: 1 });
      expect(a.dialogue).toBeNull();
      expect((a as { duel?: unknown }).duel).toBeUndefined();
    }
  });
});

describe("player shape migration", () => {
  it("fills fields a newer build added and keeps everything the player earned", () => {
    const old = {
      id: "p1", guest: false, serial: 42, house: "sky", messenger: "witness", bestand: 12, banked: 30, winke: 2, readiness: 55,
      movement: 3, quests: { "m1-diagnosis": 12, "m2-techno-feudal": 3 }, choices: { memorial: "voice" },
      history: { passings: 1, buried: 2, houses: ["sky", "nope"] },
      respawn: { x: 10, y: 20 },
      items: [{ id: "cult:copper-binding", kind: "cult", name: "Copper binding", qty: 1, value: 0, bound: true }, "junk"],
    };
    const p = migratePlayer(old, "fallback", 99);
    expect(p.id).toBe("p1");
    expect(p.serial).toBe(42);
    expect(p.house).toBe("sky");
    expect(p.banked).toBe(30);
    expect(p.movement).toBe(3);
    expect(p.quests["m2-techno-feudal"]).toBe(3);
    expect(p.choices.memorial).toBe("voice");
    expect(p.history).toEqual({ passings: 1, buried: 2, looted: 0, houses: ["sky"], outcomes: [] });
    expect(p.respawn).toEqual({ x: 10, y: 20, district: spawnGuest("x").respawn.district });
    expect(p.items).toHaveLength(1);
    expect(p.restraint).toBe(spawnGuest("x").restraint);
    expect(p.kit).toBeNull();
  });

  it("uses the fallback id and a fresh guest for garbage", () => {
    for (const junk of [null, 7, "str", [], { movement: 9, hp: -4, dead: true }]) {
      const p = migratePlayer(junk, "fb");
      expect(p.id).toBe("fb");
      expect(p.movement).toBeLessThanOrEqual(5);
      expect(p.hp).toBeGreaterThanOrEqual(0);
    }
    const dead = migratePlayer({ id: "d", hp: 0, dead: true }, "fb");
    expect(dead.dead).toBe(true);
  });
});
