/**
 * The sink between the object and D1: a bounded queue of events, flushed in
 * batches after checkpoints. A flush that fails keeps the queue and says so
 * at most once a minute; the tick never waits on it.
 */
import type { LogEvent } from "./log.ts";

export const LOG_QUEUE_MAX = 500;
export const LOG_BATCH_MAX = 100;
const WARN_EVERY_MS = 60_000;

export const INSERT_EVENT = "INSERT INTO events (at, world_now, kind, player, serial, detail) VALUES (?1, ?2, ?3, ?4, ?5, ?6)";

/** The slice of D1 the sink uses, narrow so tests can hand in a double. */
export type LogDb = {
  prepare(sql: string): { bind(...values: unknown[]): unknown };
  batch(statements: never[]): Promise<unknown>;
};

export class LogSink {
  private queue: LogEvent[] = [];
  private flushing: Promise<number> | null = null;
  private warnedAt = -Infinity;
  /** Events dropped because the queue was full: the oldest go first. */
  dropped = 0;

  get size(): number {
    return this.queue.length;
  }

  push(events: LogEvent[]): void {
    if (!events.length) return;
    this.queue.push(...events);
    const over = this.queue.length - LOG_QUEUE_MAX;
    if (over > 0) {
      this.queue.splice(0, over);
      this.dropped += over;
    }
  }

  /** Writes what is queued, oldest first; returns the rows written. Never throws. */
  flush(db: LogDb, nowMs: number = Date.now()): Promise<number> {
    if (this.flushing) return this.flushing;
    this.flushing = this.drain(db, nowMs).finally(() => { this.flushing = null; });
    return this.flushing;
  }

  private async drain(db: LogDb, nowMs: number): Promise<number> {
    let written = 0;
    while (this.queue.length) {
      const chunk = this.queue.slice(0, LOG_BATCH_MAX);
      try {
        const statements = chunk.map(e =>
          db.prepare(INSERT_EVENT).bind(e.at, e.worldNow, e.kind, e.player, e.serial, JSON.stringify(e.detail)));
        await db.batch(statements as never[]);
      } catch (err) {
        if (nowMs - this.warnedAt >= WARN_EVERY_MS) {
          this.warnedAt = nowMs;
          console.warn("log: flush failed, keeping the queue", err instanceof Error ? err.message : String(err));
        }
        return written;
      }
      this.queue.splice(0, chunk.length);
      written += chunk.length;
    }
    return written;
  }
}
