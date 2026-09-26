/**
 * The object's own load meter. Workers freeze the clock during compute, so
 * a step cannot be timed from inside; what can be read is how late each
 * alarm fired against the 50 ms it asked for, how many steps it had to catch
 * up, whether the catch-up hit its cap, and how much every broadcast sends.
 * An exponential average for the feel of it, a windowed maximum for the
 * worst of it, so `/world` can say when one object is near the edge and the
 * zoning design (.rebuild/ZONES.md) has a number to argue from.
 */

export const LOAD_WINDOW_MS = 10_000;
const EMA = 0.05;

export type LoadReport = {
  sessions: number;
  bodies: number;
  /** How late the alarm fired after the step it asked for, ms: smoothed and the worst in the window. */
  lateMs: number;
  maxLateMs: number;
  /** Steps run per alarm; above 1 the object fell behind and caught up. */
  catchUp: number;
  maxCatchUp: number;
  /** Alarms whose catch-up hit the cap (MAX_CATCHUP_MS) since the meter began: simulation time was dropped. */
  stalls: number;
  /** Characters of the last broadcast, in total and per viewer on average. */
  broadcastChars: number;
  charsPerViewer: number;
  alarms: number;
};

type Sample = { at: number; v: number };

class Windowed {
  private ema = 0;
  private seeded = false;
  private samples: Sample[] = [];

  push(v: number, at: number): void {
    this.ema = this.seeded ? this.ema + (v - this.ema) * EMA : v;
    this.seeded = true;
    this.samples.push({ at, v });
    const cut = at - LOAD_WINDOW_MS;
    while (this.samples.length && this.samples[0].at < cut) this.samples.shift();
  }

  get avg(): number {
    return this.ema;
  }

  max(at: number): number {
    const cut = at - LOAD_WINDOW_MS;
    let m = 0;
    for (const s of this.samples) if (s.at >= cut && s.v > m) m = s.v;
    return m;
  }
}

export class LoadMeter {
  private readonly late = new Windowed();
  private readonly catchUp = new Windowed();
  private lastChars = 0;
  private lastViewers = 0;
  private stalled = 0;
  private count = 0;

  /** An alarm fired `lateMs` after it was due and ran `steps` steps; `capped` when the clock dropped time to stay bounded. */
  alarmed(lateMs: number, steps: number, capped: boolean, at: number): void {
    this.late.push(Math.max(0, lateMs), at);
    this.catchUp.push(steps, at);
    if (capped) this.stalled++;
    this.count++;
  }

  /** One broadcast sent `chars` characters to `viewers`. */
  broadcasted(chars: number, viewers: number): void {
    this.lastChars = chars;
    this.lastViewers = viewers;
  }

  report(sessions: number, bodies: number, at: number): LoadReport {
    const r = (v: number) => Math.round(v * 100) / 100;
    return {
      sessions,
      bodies,
      lateMs: r(this.late.avg),
      maxLateMs: r(this.late.max(at)),
      catchUp: r(this.catchUp.avg),
      maxCatchUp: this.catchUp.max(at),
      stalls: this.stalled,
      broadcastChars: this.lastChars,
      charsPerViewer: this.lastViewers ? Math.round(this.lastChars / this.lastViewers) : 0,
      alarms: this.count,
    };
  }
}
