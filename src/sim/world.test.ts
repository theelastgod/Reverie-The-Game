import { describe, expect, it } from "vitest";
import { guestCanClaim, spawnGuest, stepPlayer } from "./world";

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
});
