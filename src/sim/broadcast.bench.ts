/**
 * The object's broadcast path, timed in one process without the wire: 80
 * bodies in one area of interest, walking; every step snapshots, splits,
 * diffs and encodes for every viewer. Three variants: the calls one viewer
 * at a time (`old`, what the object did before the step's shared views),
 * the step-shared snapshot split after the fact (`shared`, the object's
 * second shape), and the frames the object makes now (`frames`: the fast
 * frame every step, the slow side built only when a slow frame is due).
 * Run with `npm run bench`; `vitest run` leaves bench files alone. The
 * numbers are for this CPU; what matters is the ratio and the worst step.
 */
import { bench, describe } from "vitest";
import { DT } from "./constants";
import { encodeFast, SlowTracker, splitSnap } from "./frames";
import { framesFor, snapshotFor, stepViews } from "./snapshot";
import type { WorldState } from "./types";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { applyAction } from "./actions";

const BODIES = 80;

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

type Variant = "old" | "shared" | "frames";

function broadcast(w: WorldState, tracker: SlowTracker, tick: number, variant: Variant): number {
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
    if (tracker.rosterDue(id, fast) || slowDue || tracker.fresh(id)) {
      const changed = step ? tracker.diff(id, slow(), step.frames) : tracker.diff(id, slow());
      if (changed) chars += JSON.stringify(changed).length;
    }
    chars += step ? encodeFast(fast, step.frames).length : JSON.stringify(fast).length;
  }
  return chars;
}

describe(`one broadcast to ${BODIES} viewers, walking`, () => {
  for (const variant of ["old", "shared", "frames"] as Variant[]) {
    let w = crowd(BODIES);
    const tracker = new SlowTracker();
    let tick = 0;
    bench(variant, () => {
      w = walk(w, tick++);
      broadcast(w, tracker, tick, variant);
    }, { time: 3000, warmupTime: 500 });
  }
});
