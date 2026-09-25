import { describe, expect, it } from "vitest";
import { applyDodge, applyHeavy, applyStrike, damageFor, DODGE_DURATION, DODGE_COOLDOWN, DODGE_SPEED, emptyWorld, spawnGuest, stepPlayer, tickClerks } from "./world";
import { circleHitsWalls } from "./nave";
const idle = { up: false, down: false, left: false, right: false };

describe("deliberate dodge", () => {
  it("normalizes direction, fixes distance and refuses cooldown spam", () => {
    let w = emptyWorld(); const p = { ...spawnGuest("a"), x: 200, y: 480 }; w.players.set("a", p);
    w = applyDodge(w, "a", 9999, 9999);
    const started = w.players.get("a")!;
    expect(Math.hypot(started.dodgeX!, started.dodgeY!)).toBeCloseTo(1);
    expect(started.dodgeCd).toBe(DODGE_COOLDOWN);
    expect(applyDodge(w, "a", -1, 0)).toBe(w);
    const moved = stepPlayer(started, idle, DODGE_DURATION);
    expect(Math.hypot(moved.x - p.x, moved.y - p.y)).toBeCloseTo(DODGE_SPEED * DODGE_DURATION);
    expect(moved.dodgeT).toBe(0);
    w.players.set("a", stepPlayer(moved, idle, DODGE_COOLDOWN));
    expect(applyDodge(w, "a", -1, 0).players.get("a")!.dodgeT).toBe(DODGE_DURATION);
  });
  it("cannot tunnel through a wall even in a long simulation step", () => {
    let w = emptyWorld(); w.players.set("a", { ...spawnGuest("a"), x: 400, y: 264 });
    w = applyDodge(w, "a", 1, 0);
    const moved = stepPlayer(w.players.get("a")!, { ...idle, right: true }, 1);
    expect(moved.x).toBeLessThan(432);
    expect(circleHitsWalls(moved.x, moved.y)).toBe(false);
  });
  it("walking in Restraint is vulnerable; a timed step evades and prevents simultaneous attacks", () => {
    let w = emptyWorld();
    w.players.set("a", { ...spawnGuest("a"), guest: false, flagged: true, x: 200, y: 480 });
    w.players.set("b", { ...spawnGuest("b"), guest: false, flagged: true, restraint: true, x: 220, y: 480 });
    w.intents.set("b", { ...idle, up: true });
    expect(applyStrike(w, "a").players.get("b")!.hp).toBeLessThan(100);
    w = applyDodge(w, "b", 0, -1);
    expect(applyStrike(w, "a").players.get("b")!.hp).toBe(100);
    expect(applyStrike(w, "b")).toBe(w);
    expect(applyHeavy(w, "b")).toBe(w);
    w.clerks = [{ id: "test", name: "Clerk", x: 210, y: 480, hp: 40, telegraph: .01 }];
    w.players.delete("a");
    expect(tickClerks(w, .05).players.get("b")!.hp).toBe(100);
    w.players.set("b", stepPlayer(w.players.get("b")!, idle, 1));
    w.clerks[0] = { ...w.clerks[0], x: w.players.get("b")!.x, y: w.players.get("b")!.y };
    expect(tickClerks(w, .05).players.get("b")!.hp).toBeLessThan(100);
  });
  it("guests can dodge, malformed directions and locked characters cannot", () => {
    const w = emptyWorld(); const p = spawnGuest("a"); w.players.set("a", p);
    expect(applyDodge(w, "a", 1, 0).players.get("a")!.dodgeT).toBe(DODGE_DURATION);
    for (const [x, y] of [[0, 0], [NaN, 1], [1, Infinity]]) expect(applyDodge(w, "a", x, y)).toBe(w);
    w.players.set("a", { ...p, locked: true });
    expect(applyDodge(w, "a", 1, 0)).toBe(w);
    expect(damageFor({ ...p, serial: 7777, guest: false })).toBe(damageFor(p));
  });
});
