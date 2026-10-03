import { describe, expect, it } from "vitest";
import { FLICKER_FRESH, flickerDue, flickerTween, pulseAt, reducedMotion, stillTween } from "./motion";

describe("reducedMotion", () => {
  it("reads the media query live", () => {
    const list = { matches: false };
    const reduced = reducedMotion(() => list);
    expect(reduced()).toBe(false);
    list.matches = true;
    expect(reduced()).toBe(true);
  });
  it("is false when the page cannot say", () => {
    expect(reducedMotion(undefined)()).toBe(false);
    expect(reducedMotion(() => { throw new Error("no media queries here"); })()).toBe(false);
  });
});

describe("stillTween", () => {
  const onComplete = () => {};
  const targets = {};
  const config = { targets, alpha: 0, radius: 52, y: 10, scale: 1.1, displayWidth: 80, displayHeight: 80, tilePositionY: 64, angle: 90, duration: 380, ease: "Quad.Out", onComplete };
  it("is the config itself with motion", () => {
    expect(stillTween(false, config)).toBe(config);
  });
  it("keeps the fade, the timing and the callback and drops the movement without", () => {
    expect(stillTween(true, config)).toEqual({ targets, alpha: 0, duration: 380, ease: "Quad.Out", onComplete });
    expect(config.radius, "the given config is left alone").toBe(52);
  });
});

describe("pulseAt", () => {
  it("breathes within [0, 1] with motion and holds its mean without", () => {
    const seen = new Set<number>();
    for (let s = 0; s < 2; s += 0.1) {
      const p = pulseAt(false, s);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
      seen.add(Math.round(p * 100));
      expect(pulseAt(true, s)).toBe(0.5);
    }
    expect(seen.size).toBeGreaterThan(5);
  });
});

describe("flickerDue", () => {
  it("plays a new, fresh flicker once", () => {
    expect(flickerDue(0, 100, 100.2)).toBe(true);
    expect(flickerDue(100, 100, 100.4), "the same moment does not play twice").toBe(false);
    expect(flickerDue(100, 180, 181), "a later darkening plays again").toBe(true);
  });
  it("never plays for no flicker, a stale one, or one from the future", () => {
    expect(flickerDue(0, 0, 50)).toBe(false);
    expect(flickerDue(0, 100, 100 + FLICKER_FRESH + 0.1), "a viewer who arrives later sees the altars as they are").toBe(false);
    expect(flickerDue(0, 100, 100 + FLICKER_FRESH)).toBe(true);
    expect(flickerDue(0, 100, 99)).toBe(false);
  });
});

describe("flickerTween", () => {
  it("flickers quickly with motion and dips once without, never to dark", () => {
    const quick = flickerTween(false);
    const still = flickerTween(true);
    expect(quick.repeat).toBeGreaterThan(0);
    expect(still.repeat).toBe(0);
    expect(still.duration).toBeGreaterThan(quick.duration * 4);
    expect(still.alpha).toBeGreaterThan(quick.alpha);
    for (const t of [quick, still]) expect(t.alpha).toBeGreaterThan(0);
  });
});
