import { describe, expect, it } from "vitest";
import { LOAD_WINDOW_MS, LoadMeter } from "./load";

describe("LoadMeter", () => {
  it("starts empty", () => {
    expect(new LoadMeter().report(0, 0, 0)).toEqual({
      sessions: 0, bodies: 0, lateMs: 0, maxLateMs: 0, catchUp: 0, maxCatchUp: 0, stalls: 0, broadcastChars: 0, charsPerViewer: 0, alarms: 0,
      checkpointMs: 0, maxCheckpointMs: 0,
    });
  });

  it("smooths lateness, keeps the worst of the window, and forgets it after the window", () => {
    const m = new LoadMeter();
    m.alarmed(2, 1, false, 0);
    m.alarmed(40, 2, false, 100);
    m.alarmed(2, 1, false, 200);
    const early = m.report(3, 5, 200);
    expect(early.sessions).toBe(3);
    expect(early.bodies).toBe(5);
    expect(early.maxLateMs).toBe(40);
    expect(early.lateMs).toBeGreaterThan(2);
    expect(early.lateMs).toBeLessThan(40);
    expect(early.maxCatchUp).toBe(2);
    expect(early.alarms).toBe(3);
    m.alarmed(2, 1, false, 100 + LOAD_WINDOW_MS + 1);
    const later = m.report(3, 5, 100 + LOAD_WINDOW_MS + 1);
    expect(later.maxLateMs).toBe(2);
    expect(later.maxCatchUp).toBe(1);
  });

  it("never counts an early alarm as negative lateness, counts stalls, and reports the last broadcast per viewer", () => {
    const m = new LoadMeter();
    m.alarmed(-3, 1, false, 0);
    m.alarmed(0, 5, true, 50);
    expect(m.report(1, 1, 50).lateMs).toBe(0);
    expect(m.report(1, 1, 50).stalls).toBe(1);
    m.broadcasted(12_000, 4);
    m.broadcasted(9_000, 3);
    const r = m.report(3, 3, 100);
    expect(r.broadcastChars).toBe(9_000);
    expect(r.charsPerViewer).toBe(3_000);
    expect(new LoadMeter().report(0, 0, 0).charsPerViewer).toBe(0);
    m.checkpointed(12, 100);
    m.checkpointed(-1, 150);
    const c = m.report(3, 3, 150);
    expect(c.maxCheckpointMs).toBe(12);
    expect(c.checkpointMs).toBeGreaterThan(0);
    expect(c.checkpointMs).toBeLessThan(12);
  });
});
