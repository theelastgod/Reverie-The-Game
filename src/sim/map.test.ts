import { describe, expect, it } from "vitest";
import {
  COLS, ROWS, DISTRICTS, GATES, POSITIONS, POI_LIST, NODE_LIST, NPC_HOMES, NPC_STATIONS, ENEMY_SPAWNS, GUEST_SPAWN,
  blockedFor, circleHitsWalls, districtAt, isWall, reachableTiles, tileOf, idx, floorAt, PATCHES, FLOOR_FILES,
} from "./map";
import { BODY_R } from "./constants";
import { existsSync } from "node:fs";

const angel = { guest: false, flags: { under: 1, m3: 1 } };
const guest = { guest: true, flags: {} };

describe("the city", () => {
  it("districts do not overlap and sit inside the map", () => {
    for (const d of DISTRICTS) {
      expect(d.rect.x).toBeGreaterThan(0);
      expect(d.rect.y).toBeGreaterThan(0);
      expect(d.rect.x + d.rect.w).toBeLessThan(COLS);
      expect(d.rect.y + d.rect.h).toBeLessThan(ROWS);
      for (const o of DISTRICTS) {
        if (o === d) continue;
        const overlap = d.rect.x < o.rect.x + o.rect.w && o.rect.x < d.rect.x + d.rect.w && d.rect.y < o.rect.y + o.rect.h && o.rect.y < d.rect.y + d.rect.h;
        expect(overlap, `${d.id} overlaps ${o.id}`).toBe(false);
      }
    }
  });

  it("every named position stands on floor with room for a body", () => {
    for (const [id, pos] of Object.entries(POSITIONS)) {
      const tx = tileOf(pos.x);
      const ty = tileOf(pos.y);
      expect(isWall(tx, ty), `${id} is inside a wall at ${tx},${ty}`).toBe(false);
      expect(circleHitsWalls(pos.x, pos.y, BODY_R, angel), `${id} has no room for a body`).toBe(false);
      expect(districtAt(pos.x, pos.y), `${id} district`).toBe(pos.district);
    }
  });

  it("a fully flagged Angel can walk from the guest spawn to every position", () => {
    const reach = reachableTiles(tileOf(GUEST_SPAWN.x), tileOf(GUEST_SPAWN.y), (tx, ty) => blockedFor(angel, tx, ty));
    for (const [id, pos] of Object.entries(POSITIONS)) {
      expect(reach.has(idx(tileOf(pos.x), tileOf(pos.y))), `${id} unreachable`).toBe(true);
    }
  });

  it("a guest reaches all of Movement I but never the Care, the Clearing or the Organs", () => {
    const reach = reachableTiles(tileOf(GUEST_SPAWN.x), tileOf(GUEST_SPAWN.y), (tx, ty) => blockedFor(guest, tx, ty));
    const has = (id: string) => reach.has(idx(tileOf(POSITIONS[id].x), tileOf(POSITIONS[id].y)));
    for (const id of ["safety-plaque", "memorial-recorder", "nara-plot", "going-under", "guest-arena", "home:nara", "home:quill", "home:ord", "nave-node-1", "listing-board", "omen-terrace", "shrine-1"]) {
      expect(has(id), `guest cannot reach ${id}`).toBe(true);
    }
    for (const id of ["care-shrine", "wreckage-garden", "clearing-ring", "organ-strait", "hall-earth"]) {
      expect(has(id), `guest should not reach ${id}`).toBe(false);
    }
  });

  it("gates are three tiles wide openings between their two districts", () => {
    for (const g of GATES) {
      expect(g.rect.w * g.rect.h).toBe(9);
      const cx = g.rect.x + 1;
      const cy = g.rect.y + 1;
      expect(isWall(cx, cy)).toBe(false);
      expect(blockedFor(guest, cx, cy)).toBe(g.requires !== "");
      expect(blockedFor(angel, cx, cy)).toBe(false);
    }
  });

  it("every floor texture exists on disk", () => {
    for (const file of Object.values(FLOOR_FILES)) {
      expect(existsSync(`public/assets/${file}`), file).toBe(true);
    }
    for (const p of PATCHES) expect(FLOOR_FILES[p.floor]).toBeTruthy();
    expect(floorAt(tileOf(POSITIONS["nara-plot"].x), tileOf(POSITIONS["nara-plot"].y))).toBe("burial");
    expect(floorAt(tileOf(POSITIONS["going-under"].x), tileOf(POSITIONS["going-under"].y))).toBe("under");
  });

  it("ids are unique across POIs, nodes, homes, stations and enemies", () => {
    const ids = [...POI_LIST.map(p => p.id), ...NODE_LIST.map(n => n.id), ...Object.keys(NPC_HOMES), ...Object.keys(NPC_STATIONS), ...ENEMY_SPAWNS.map(e => e.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });
});
