import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { INSERT_EVENT, LOG_BATCH_MAX, LOG_QUEUE_MAX, LogSink } from "./logSink";
import type { LogEvent } from "./log";

const ev = (n: number): LogEvent => ({ at: n, worldNow: n / 10, kind: "news", player: "", serial: null, detail: { text: `line ${n}` } });

/** A D1 double that records batches and can be told to fail. */
function db(fail = false) {
  const batches: unknown[][] = [];
  return {
    batches,
    prepare: (sql: string) => ({ bind: (...values: unknown[]) => ({ sql, values }) }),
    batch: vi.fn(async (statements: unknown[]) => {
      if (fail) throw new Error("D1 down");
      batches.push(statements);
      return [];
    }),
  };
}

describe("LogSink", () => {
  beforeEach(() => { vi.spyOn(console, "warn").mockImplementation(() => {}); });
  afterEach(() => { vi.restoreAllMocks(); });

  it("writes queued events oldest first in bounded batches, binding every column", async () => {
    const sink = new LogSink();
    sink.push(Array.from({ length: LOG_BATCH_MAX + 3 }, (_, i) => ev(i)));
    const d = db();
    expect(await sink.flush(d)).toBe(LOG_BATCH_MAX + 3);
    expect(d.batches.map(b => b.length)).toEqual([LOG_BATCH_MAX, 3]);
    expect(d.batches[0][0]).toEqual({ sql: INSERT_EVENT, values: [0, 0, "news", "", null, JSON.stringify({ text: "line 0" })] });
    expect(sink.size).toBe(0);
    expect(await sink.flush(d)).toBe(0);
  });

  it("drops the oldest when the queue overflows and counts them", () => {
    const sink = new LogSink();
    sink.push(Array.from({ length: LOG_QUEUE_MAX + 10 }, (_, i) => ev(i)));
    expect(sink.size).toBe(LOG_QUEUE_MAX);
    expect(sink.dropped).toBe(10);
    sink.push([]);
    expect(sink.size).toBe(LOG_QUEUE_MAX);
  });

  it("keeps the queue when D1 fails, warns once a minute, and recovers", async () => {
    const sink = new LogSink();
    sink.push([ev(1), ev(2)]);
    const broken = db(true);
    expect(await sink.flush(broken, 0)).toBe(0);
    expect(await sink.flush(broken, 30_000)).toBe(0);
    expect(sink.size).toBe(2);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(await sink.flush(broken, 61_000)).toBe(0);
    expect(console.warn).toHaveBeenCalledTimes(2);
    const fine = db();
    expect(await sink.flush(fine, 62_000)).toBe(2);
    expect(sink.size).toBe(0);
  });

  it("shares one in-flight flush", async () => {
    const sink = new LogSink();
    sink.push([ev(1)]);
    const d = db();
    const [a, b] = await Promise.all([sink.flush(d), sink.flush(d)]);
    expect(a).toBe(1);
    expect(b).toBe(1);
    expect(d.batch).toHaveBeenCalledTimes(1);
  });
});
