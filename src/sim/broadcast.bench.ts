/**
 * The object's broadcast path, timed in one process without the wire: 80
 * bodies in one area of interest, walking; every step snapshots, splits,
 * diffs and encodes for every viewer. Three variants: the calls one viewer
 * at a time (`old`, what the object did before the step's shared views),
 * the step-shared snapshot split after the fact (`shared`, the object's
 * second shape), and the frames the object makes now (`frames`: the fast
 * frame every step, the slow side built only when a slow frame is due).
 * A fourth row, `tick`, is the step without any broadcast: every body's
 * intent applied and the world ticked, so the broadcast's own cost is the
 * difference. Run with `npm run bench` (`BENCH_BODIES=160` for more
 * bodies); `vitest run` leaves bench files alone. The numbers are for this
 * CPU; what matters is the ratio and the worst step. (Vitest 5 registers
 * benchmarks from a test's context and compares them in one table; its
 * module runner turns imports into getters, which the sim crosses often,
 * so absolute numbers read higher than under vitest 2 and are comparable
 * only within one vitest major.)
 */
import { describe, test } from "vitest";
import { DT } from "./constants";
import { encodeFast, SlowTracker, splitSnap } from "./frames";
import { framesFor, snapshotFor, stepViews } from "./snapshot";
import type { WorldState } from "./types";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { applyAction } from "./actions";

/** Bodies in the one area of interest; `BENCH_BODIES=160 npm run bench` walks the curve. (The sim's tsconfig has no node types; the bench runs under vitest, where `process` exists.) */
const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const BODIES = Math.max(2, Number(env.BENCH_BODIES ?? "80") || 80);

function crowd(n: number): WorldState {
  let w = emptyWorld();
  const players = new Map(w.players);
  const g = spawnGuest("a");
  for (let i = 0; i < n; i++) players.set(`b${i}`, { ...spawnGuest(`b${i}`), x: g.x + (i % 10) * 30, y: g.y + Math.floor(i / 10) * 30 });
  w = { ...w, players };
  return tickWorld(w, DT);
}

function walk(w: WorldState, tick: number): WorldState {
  let cur = w;
  for (const id of cur.players.keys()) {
    const s = (id.length + tick) % 4;
    cur = applyAction(cur, id, { t: "intent", intent: { up: s === 0, down: s === 1, left: s === 2, right: s === 3 } });
  }
  return tickWorld(cur, DT);
}

type Variant = "tick" | "old" | "shared" | "frames";

function broadcast(w: WorldState, tracker: SlowTracker, tick: number, variant: Variant): number {
  if (variant === "tick") return 0; // the step itself (every body's intent and the world's tick), without a broadcast
  let chars = 0;
  const slowDue = tick % 5 === 0;
  const step = variant === "old" ? null : stepViews(w);
  for (const id of w.players.keys()) {
    let fast;
    let slow;
    if (variant === "frames" && step) {
      const frames = framesFor(w, id, step);
      fast = frames.fast;
      slow = frames.slow;
    } else {
      const snap = step ? snapshotFor(w, id, step) : snapshotFor(w, id);
      const parts = step ? splitSnap(snap, step.frames) : splitSnap(snap);
      fast = parts.fast;
      slow = () => parts.slow;
    }
    // As the object does: both checks run every step so their memory stays current (the old paths have no youDue).
    const rosterDue = tracker.rosterDue(id, fast);
    const youDue = variant === "frames" ? tracker.youDue(id, w.players.get(id)!) : false;
    if (rosterDue || youDue || slowDue || tracker.fresh(id)) {
      const changed = step ? tracker.diff(id, slow(), step.frames) : tracker.diff(id, slow());
      if (changed) chars += JSON.stringify(changed).length;
    }
    chars += step ? encodeFast(fast, step.frames).length : JSON.stringify(fast).length;
  }
  return chars;
}

describe(`one step with ${BODIES} viewers, walking: the tick alone, then the tick and a broadcast`, () => {
  test("the four variants", async ({ bench }) => {
    const row = <V extends Variant>(variant: V) => {
      let w = crowd(BODIES);
      const tracker = new SlowTracker();
      let tick = 0;
      return bench(variant, () => {
        w = walk(w, tick++);
        broadcast(w, tracker, tick, variant);
      });
    };
    await bench.compare(row("tick"), row("old"), row("shared"), row("frames"), { time: 3000, warmupTime: 500 });
  });
});
