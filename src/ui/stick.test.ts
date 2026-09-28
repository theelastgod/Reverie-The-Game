import { describe, expect, it } from "vitest";
import { STILL, dodgeDirection, isTap, knobOffset, mergeIntent, stickIntent } from "./stick";

const only = (...on: (keyof typeof STILL)[]) => ({ ...STILL, ...Object.fromEntries(on.map(k => [k, true])) });

describe("stickIntent", () => {
  it("is still inside the dead zone", () => {
    expect(stickIntent(0, 0)).toEqual(STILL);
    expect(stickIntent(9, 9)).toEqual(STILL);
    expect(stickIntent(13, 0)).toEqual(STILL);
  });
  it("reads the four straight directions", () => {
    expect(stickIntent(40, 0)).toEqual(only("right"));
    expect(stickIntent(-40, 0)).toEqual(only("left"));
    expect(stickIntent(0, -40)).toEqual(only("up"));
    expect(stickIntent(0, 40)).toEqual(only("down"));
  });
  it("reads the diagonals within 45-degree sectors", () => {
    expect(stickIntent(40, 40)).toEqual(only("right", "down"));
    expect(stickIntent(-40, -40)).toEqual(only("left", "up"));
    expect(stickIntent(40, 20), "30 degrees off: still a diagonal").toEqual(only("right", "down"));
    expect(stickIntent(40, 12), "17 degrees off: straight").toEqual(only("right"));
  });
  it("does not care how far the drag went past the dead zone", () => {
    expect(stickIntent(400, -10)).toEqual(only("right"));
    expect(stickIntent(15, -15)).toEqual(only("right", "up"));
  });
});

describe("knobOffset", () => {
  it("follows the finger inside the ring and stays on its edge outside", () => {
    expect(knobOffset(10, -5)).toEqual({ x: 10, y: -5 });
    const far = knobOffset(300, 400);
    expect(Math.hypot(far.x, far.y)).toBeCloseTo(40, 5);
    expect(far.x / far.y).toBeCloseTo(0.75, 5);
  });
});

describe("isTap", () => {
  it("is a short press that barely moved", () => {
    expect(isTap(120, 3)).toBe(true);
    expect(isTap(250, 9)).toBe(true);
    expect(isTap(300, 3)).toBe(false);
    expect(isTap(120, 10)).toBe(false);
  });
});

describe("dodgeDirection", () => {
  it("takes the stick's direction first", () => {
    expect(dodgeDirection(only("up", "right"), { dx: -1, dy: 0 })).toEqual({ dx: 1, dy: -1 });
  });
  it("falls back to the facing, as signs", () => {
    expect(dodgeDirection(STILL, { dx: -0.7, dy: 0.7 })).toEqual({ dx: -1, dy: 1 });
    expect(dodgeDirection(STILL, { dx: 0, dy: 0 })).toBeNull();
  });
});

describe("mergeIntent", () => {
  it("holds a direction when either side does", () => {
    expect(mergeIntent(only("up"), only("right"))).toEqual(only("up", "right"));
    expect(mergeIntent(STILL, STILL)).toEqual(STILL);
  });
});
