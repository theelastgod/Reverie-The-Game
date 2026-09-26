/**
 * The object's broadcast path, timed in one process without the wire: 80
 * bodies in one area of interest, walking; every step snapshots, splits,
 * diffs and encodes for every viewer. Two variants: the calls one viewer at
 * a time (`old`, what the object did before the step's shared views) and the
 * step-shared calls the object makes now (`new`). Run with `npm run bench`;
 * `vitest run` leaves bench files alone. The numbers are for this CPU; what
 * matters is the ratio and the worst step.
 */
import { bench, describe } from "vitest";
import { DT } from "./constants";
import { encodeFast, SlowTracker, splitSnap } from "./frames";
import { snapshotFor, stepViews } from "./snapshot";
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

type Variant = "old" | "new";

function broadcast(w: WorldState, tracker: SlowTracker, tick: number, variant: Variant): number {
  let chars = 0;
  const slowDue = tick % 5 === 0;
  const step = variant === "new" ? stepViews(w) : null;
  for (const id of w.players.keys()) {
    const snap = step ? snapshotFor(w, id, step) : snapshotFor(w, id);
    const { fast, slow } = step ? splitSnap(snap, step.frames) : splitSnap(snap);
    if (tracker.rosterDue(id, fast) || slowDue || tracker.fresh(id)) {
      const changed = step ? tracker.diff(id, slow, step.frames) : tracker.diff(id, slow);
      if (changed) chars += JSON.stringify(changed).length;
    }
    chars += step ? encodeFast(fast, step.frames).length : JSON.stringify(fast).length;
  }
  return chars;
}

describe(`one broadcast to ${BODIES} viewers, walking`, () => {
  for (const variant of ["old", "new"] as Variant[]) {
    let w = crowd(BODIES);
    const tracker = new SlowTracker();
    let tick = 0;
    bench(variant, () => {
      w = walk(w, tick++);
      broadcast(w, tracker, tick, variant);
    }, { time: 3000, warmupTime: 500 });
  }
});
