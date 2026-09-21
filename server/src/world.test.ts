import { describe, expect, it } from "vitest";
import { spawnGuest, stepPlayer } from "./world";

describe("world", () => {
  it("guest starts with aura 0", () => {
    expect(spawnGuest("g1").aura).toBe(0);
    expect(spawnGuest("g1").guest).toBe(true);
  });

  it("intent moves the body", () => {
    const a = spawnGuest("g1");
    const b = stepPlayer(a, { up: false, down: false, left: false, right: true }, 0.05);
    expect(b.x).toBeGreaterThan(a.x);
  });
});
