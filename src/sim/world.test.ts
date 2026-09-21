import { describe, expect, it } from "vitest";
import { circleHitsWalls, isWallTile, nearNode } from "./nave";
import {
  applyStrike,
  applyUse,
  emptyWorld,
  guestCanClaim,
  spawnGuest,
  stepPlayer,
  tickWorld,
} from "./world";

describe("world", () => {
  it("guest starts with aura 0 and cannot claim", () => {
    const g = spawnGuest("g1");
    expect(g.aura).toBe(0);
    expect(g.guest).toBe(true);
    expect(guestCanClaim(g)).toBe(false);
  });

  it("intent moves the body", () => {
    const a = spawnGuest("g1");
    const b = stepPlayer(a, { up: false, down: false, left: false, right: true }, 0.05);
    expect(b.x).toBeGreaterThan(a.x);
  });

  it("nave edges are walls", () => {
    expect(isWallTile(0, 10)).toBe(true);
    expect(isWallTile(4, 10)).toBe(false);
    expect(circleHitsWalls(24, 480)).toBe(true);
  });

  it("does not walk through the west wall", () => {
    const p = { ...spawnGuest("g1"), x: 60, y: 480 };
    let cur = p;
    for (let i = 0; i < 40; i++) {
      cur = stepPlayer(cur, { up: false, down: false, left: true, right: false }, 0.05);
    }
    expect(cur.x).toBeGreaterThan(40);
  });

  it("strike drops a wreckage when hp hits 0", () => {
    const w = emptyWorld();
    const a = { ...spawnGuest("a"), x: 200, y: 480 };
    const b = { ...spawnGuest("b"), x: 220, y: 480, hp: 20 };
    w.players.set("a", a);
    w.players.set("b", b);
    const after = applyStrike(w, "a");
    expect(after.wreckage.length).toBe(1);
    expect(after.players.get("b")?.hp).toBe(100);
  });

  it("extract pays bestand and raises gestell; keep pays winke", () => {
    const w = emptyWorld();
    const node = w.nodes[0];
    const p = { ...spawnGuest("a"), x: node.x, y: node.y };
    w.players.set("a", p);
    expect(nearNode(p.x, p.y, node)).toBe(true);
    const ex = applyUse(w, "a", node.id, "extract");
    expect(ex.players.get("a")?.bestand).toBe(40);
    expect(ex.gestell).toBeGreaterThan(w.gestell);
    expect(guestCanClaim(ex.players.get("a")!)).toBe(false);
    const keep = applyUse(w, "a", node.id, "keep");
    expect(keep.players.get("a")?.winke).toBe(1);
    expect(keep.gestell).toBeLessThan(w.gestell);
  });

  it("tick advances time and expires wreckage", () => {
    const w = emptyWorld();
    w.wreckage = [{ id: "r", x: 1, y: 1, fromId: "a", fromName: "Guest", until: 0.01 }];
    const after = tickWorld(w, 0.05);
    expect(after.now).toBeCloseTo(0.05);
    expect(after.wreckage.length).toBe(0);
  });
});
