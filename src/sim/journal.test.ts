import { describe, it, expect } from "vitest";
import { nextObjective, bearing } from "./journal";
import { spawnGuest } from "./world";

describe("opening journal", () => {
  it("guides the opening from Nara to the guest threshold without mutating progress", () => {
    const p = spawnGuest("guest");
    expect(nextObjective(p).id).toBe("meet-nara");
    expect(p.beats.nara).toBe(false);
    p.beats.nara = true;
    expect(nextObjective(p).id).toBe("first-burial");
    p.beats.burial = true;
    expect(nextObjective(p).id).toBe("safety-weather");
    p.weather.safety = true;
    expect(nextObjective(p).id).toBe("meet-ord");
    p.beats.ord = p.weather.ord = true;
    expect(nextObjective(p).id).toBe("meet-quill");
    p.beats.quill = true;
    expect(nextObjective(p).id).toBe("name-weather");
    p.namedWeather = true;
    expect(nextObjective(p).id).toBe("going-under");
    p.locked = true;
    expect(nextObjective(p).target).toBeUndefined();
    expect(nextObjective(p).id).toBe("guest-lock");
  });
  it("follows NPCs when the shared world changes their location", () => {
    const p = spawnGuest("guest");
    const target = { id: "nara", name: "Nara Vale", role: "Sexton", x: 100, y: 200 };
    expect(nextObjective(p, [target]).target).toEqual(target);
  });
  it("points toward a target and switches to an interaction hint within range", () => {
    expect(bearing(0, 0, { x: 0, y: -96 })).toBe("N · 2 TILES");
    expect(bearing(0, 0, { x: 96, y: 96 })).toBe("SE · 3 TILES");
    expect(bearing(0, 0, { x: 20, y: 20 })).toBe("HERE · F TO INTERACT");
  });
});

it("guides refusal through the garden to the Third Movement door", () => {
  const p = spawnGuest("a");
  p.guest = false;
  p.namedWeather = true;
  p.weather.safety = p.weather.ord = true;
  Object.assign(p.beats, { nara: true, burial: true, ord: true, quill: true, under: true, care: true, hall: true });
  expect(nextObjective(p).id).toBe("operator-offer");
  p.beats.yield = true;
  expect(nextObjective(p).id).toBe("operator-choice");
  p.beats.refuse = true;
  expect(nextObjective(p).id).toBe("wreckage-garden");
  p.beats.garden = true;
  expect(nextObjective(p).id).toBe("third-movement");
});
