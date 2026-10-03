import { describe, expect, it } from "vitest";
import { MAX_HP, NODE_CHARGES } from "./constants";
import { NODE_LIST, ENEMY_SPAWNS, POSITIONS } from "./map";
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

  it("rebuilds saved listings scalar by scalar: a kept-back fee stays only as a number, the forge's mark only as true, a row without a price or an item is dropped", () => {
    const print = { id: "copy:wink", kind: "exhibition", name: "Printed hint", qty: 1, value: 9 };
    const w = migrateWorld({
      market: [
        { id: "listing:a:0:1", sellerId: "a", sellerName: "#0001", item: print, price: 9, at: 3, fee: 2, forge: true },
        { id: "listing:b:0:2", sellerId: "b", sellerName: "#0002", item: print, price: 5000, at: -1, fee: "2", forge: "yes" },
        { id: "listing:c:0:3", sellerId: "c", sellerName: "#0003", item: print, at: 3 },
        { id: "listing:d:0:4", sellerId: "d", sellerName: "#0004", item: { kind: "exhibition" }, price: 9, at: 3 },
        { id: "listing:city:clearing", sellerId: "", sellerName: "the resistance", item: { id: "city:clearing", kind: "weird", name: "A Clearing", qty: 0, value: 0 }, price: 40, at: 0 },
        "not a row",
      ],
    });
    expect(w.market.map(l => l.id)).toEqual(["listing:a:0:1", "listing:b:0:2", "listing:city:clearing"]);
    expect(w.market[0]).toEqual({ id: "listing:a:0:1", sellerId: "a", sellerName: "#0001", item: print, price: 9, at: 3, fee: 2, forge: true });
    expect(w.market[1]).toEqual({ id: "listing:b:0:2", sellerId: "b", sellerName: "#0002", item: print, price: 999, at: 0 });
    expect(w.market[2].item).toEqual({ id: "city:clearing", kind: "exhibition", name: "A Clearing", qty: 1, value: 0 });
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

  it("wakes a body at its respawn when it was saved where it can no longer walk out, and leaves every other body where it stood", () => {
    // before the reach audit an Angel in the first hour could walk round through the Clearing into the Care; that door
    // now waits for the going-under too, so a body saved there would stand behind two shut doors
    const shrine = POSITIONS["care-shrine"];
    const spawn = spawnGuest("x").respawn;
    const early = migratePlayer({ id: "a", guest: false, serial: 42, flags: { angel: 1 }, x: shrine.x, y: shrine.y, district: "care" }, "fb");
    expect(early).toMatchObject({ x: spawn.x, y: spawn.y, district: spawn.district });
    const under = migratePlayer({ id: "b", guest: false, serial: 43, flags: { angel: 1, under: 1 }, movement: 2, x: shrine.x, y: shrine.y, district: "care", respawn: { x: shrine.x, y: shrine.y, district: "care" } }, "fb");
    expect(under, "a body that went under keeps its place").toMatchObject({ x: shrine.x, y: shrine.y, district: "care" });
    const ring = POSITIONS["clearing-ring"];
    expect(migratePlayer({ id: "c", guest: false, serial: 44, flags: { angel: 1 }, x: ring.x, y: ring.y, district: "clearing" }, "fb"), "the Clearing is still an Angel's").toMatchObject({ x: ring.x, y: ring.y });
    expect(migratePlayer({ id: "d", x: 1, y: 1 }, "fb"), "inside a wall").toMatchObject({ x: spawn.x, y: spawn.y });
    // a respawn that is not ground to stand on moves nobody
    expect(migratePlayer({ id: "e", x: shrine.x, y: shrine.y, respawn: { x: 1, y: 1 } }, "fb")).toMatchObject({ x: shrine.x, y: shrine.y });
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
