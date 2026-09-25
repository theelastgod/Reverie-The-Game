export const STEP_MS = 50;
export const MAX_CATCHUP_MS = 250;

/** Real elapsed server time, fixed simulation steps, bounded recovery after a stall. */
export class SimulationClock {
  private previous: number | null = null;
  private remainder = 0;

  start(now: number) {
    this.previous = now;
    this.remainder = 0;
  }

  stop() {
    this.previous = null;
    this.remainder = 0;
  }

  advance(now: number): number {
    if (this.previous === null) { this.start(now); return 0; }
    const elapsed = Math.max(0, now - this.previous);
    this.previous = now;
    const available = Math.min(MAX_CATCHUP_MS, this.remainder + elapsed);
    const steps = Math.floor(available / STEP_MS);
    this.remainder = available - steps * STEP_MS;
    return steps;
  }
}
