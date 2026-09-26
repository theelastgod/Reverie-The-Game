export const STEP_MS = 50;
export const MAX_CATCHUP_MS = 250;

/** Real elapsed server time, fixed simulation steps, bounded recovery after a stall. */
export class SimulationClock {
  private previous: number | null = null;
  private remainder = 0;
  private capped = false;

  start(now: number) {
    this.previous = now;
    this.remainder = 0;
    this.capped = false;
  }

  stop() {
    this.previous = null;
    this.remainder = 0;
    this.capped = false;
  }

  /** True when the last advance had more elapsed time than it may recover: simulation time was dropped. */
  get lastCapped(): boolean {
    return this.capped;
  }

  advance(now: number): number {
    if (this.previous === null) { this.start(now); return 0; }
    const elapsed = Math.max(0, now - this.previous);
    this.previous = now;
    const wanted = this.remainder + elapsed;
    this.capped = wanted > MAX_CATCHUP_MS;
    const available = Math.min(MAX_CATCHUP_MS, wanted);
    const steps = Math.floor(available / STEP_MS);
    this.remainder = available - steps * STEP_MS;
    return steps;
  }
}
