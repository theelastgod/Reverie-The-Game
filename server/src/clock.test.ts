import { describe, expect, it } from "vitest";
import { DT } from "../../src/sim/world";
import { MAX_CATCHUP_MS, SimulationClock, STEP_MS } from "./clock";

describe("elapsed server clock", () => {
  it("keeps the physics step identical and carries callback jitter instead of slowing time", () => {
    expect(STEP_MS).toBe(DT * 1000);
    const clock = new SimulationClock(); clock.start(0);
    let total = 0;
    for (let i = 1; i <= 100; i++) total += clock.advance(i * 83);
    expect(total * STEP_MS).toBe(8300);
  });
  it("does not advance for duplicate or early delivery, and retains fractions", () => {
    const clock = new SimulationClock(); clock.start(1000);
    expect(clock.advance(1049)).toBe(0);
    expect(clock.advance(1049)).toBe(0);
    expect(clock.advance(1050)).toBe(1);
    expect(clock.advance(1075)).toBe(0);
    expect(clock.advance(1150)).toBe(2);
  });
  it("bounds catch-up and discards an outage instead of replaying minutes of combat", () => {
    const clock = new SimulationClock(); clock.start(0);
    expect(clock.advance(60000)).toBe(MAX_CATCHUP_MS / STEP_MS);
    expect(clock.advance(60000)).toBe(0);
    expect(clock.advance(60050)).toBe(1);
  });
  it("pauses with no players and starts without offline progress", () => {
    const clock = new SimulationClock(); clock.start(0);
    expect(clock.advance(25)).toBe(0);
    clock.stop();
    expect(clock.advance(60000)).toBe(0);
    expect(clock.advance(60025)).toBe(0);
    expect(clock.advance(60050)).toBe(1);
  });
  it("never reverses simulation time when the wall clock moves backwards", () => {
    const clock = new SimulationClock(); clock.start(1000);
    expect(clock.advance(900)).toBe(0);
    expect(clock.advance(950)).toBe(1);
  });
});
