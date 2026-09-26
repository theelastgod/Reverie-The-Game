import { describe, expect, it } from "vitest";
import { DT } from "./constants";
import { applySlow, mergeFrames, splitPlayer, splitSnap, SlowTracker, YOU_SLOW_KEYS } from "./frames";
import { FAST_KEYS, PROTOCOL_VERSION, SLOW_KEYS, type Snap } from "./protocol";
import { snapshotFor } from "./snapshot";
import { emptyWorld, spawnGuest, tickWorld, type WorldState } from "./world";

function crowd(n = 2): { w: WorldState; snap: Snap } {
  let w = emptyWorld();
  const players = new Map(w.players);
  players.set("a", spawnGuest("a"));
  for (let i = 1; i < n; i++) players.set(`b${i}`, { ...spawnGuest(`b${i}`), x: spawnGuest("a").x + 40 * i });
  w = { ...w, players };
  w = tickWorld(w, DT);
  return { w, snap: snapshotFor(w, "a") };
}

describe("the snapshot diet", () => {
  it("every Snap key is fast or slow, exactly once, and the frames carry the version and the roster", () => {
    const { snap } = crowd();
    const keys = Object.keys(snap).filter(k => k !== "t" && k !== "v").sort();
    expect([...FAST_KEYS, ...SLOW_KEYS].sort()).toEqual(keys);
    const { fast, slow } = splitSnap(snap);
    expect(fast.t).toBe("fast");
    expect(slow.t).toBe("slow");
    expect(fast.v).toBe(PROTOCOL_VERSION);
    expect(Object.keys(fast).sort()).toEqual(["t", "v", ...FAST_KEYS].sort());
    expect(Object.keys(slow).sort()).toEqual(["roster", "t", "v", "youSlow", ...SLOW_KEYS].sort());
  });

  it("splits another body into motion and roster, and joins them back exactly", () => {
    const { snap } = crowd();
    const p = snap.players[0];
    const { motion, roster } = splitPlayer(p);
    expect(Object.keys(motion).sort()).toEqual(["dead", "dodgeT", "facing", "heavyWindup", "hitStop", "hpFrac", "id", "x", "y"]);
    expect(Object.keys(roster).sort()).toEqual(["auraTier", "district", "flagged", "guest", "house", "id", "kit", "locked", "messenger", "name", "stance", "truce"]);
    expect({ ...roster, ...motion }).toEqual(p);
    expect(JSON.stringify(motion).length).toBeLessThan(JSON.stringify(p).length * 0.6);
  });

  it("splits and merges back to the same snapshot, a crowd included", () => {
    const { snap } = crowd(6);
    expect(snap.players.length).toBe(5);
    const { fast, slow } = splitSnap(snap);
    const merged = mergeFrames(applySlow({}, slow), fast);
    expect(merged).toEqual(snap);
    expect(merged.t).toBe("snap");
    expect((merged as { roster?: unknown }).roster).toBeUndefined();
  });

  it("splits you: the campaign's growing records ride the slow frame and merge back under the fast fields", () => {
    const { snap } = crowd();
    const { fast, slow } = splitSnap(snap);
    for (const k of YOU_SLOW_KEYS) {
      expect(k in fast.you, `${k} left the fast frame`).toBe(false);
      expect(k in slow.youSlow!, `${k} rides the slow frame`).toBe(k in snap.you);
    }
    expect(fast.you.x).toBe(snap.you.x);
    expect(fast.you.hp).toBe(snap.you.hp);
    expect(mergeFrames(applySlow({}, slow), fast).you).toEqual(snap.you);
    // a later fast frame keeps the slow records until the slow frame replaces them
    const moved = { ...fast, you: { ...fast.you, x: fast.you.x + 5 } };
    const merged = mergeFrames(applySlow({}, slow), moved);
    expect(merged.you.x).toBe(snap.you.x + 5);
    expect(merged.you.flags).toEqual(snap.you.flags);
    expect(merged.you.items).toEqual(snap.you.items);
  });

  it("leaves out a body whose roster entry has not arrived", () => {
    const { snap } = crowd(3);
    const { fast, slow } = splitSnap(snap);
    const merged = mergeFrames(applySlow({}, { ...slow, roster: slow.roster!.slice(0, 1) }), fast);
    expect(merged.players.map(p => p.id)).toEqual([snap.players[0].id]);
  });

  it("the fast frame is a fraction of the snapshot, and the slow frame holds the rest", () => {
    const { snap } = crowd(6);
    const { fast, slow } = splitSnap(snap);
    const size = (v: unknown) => JSON.stringify(v).length;
    expect(size(fast)).toBeLessThan(size(snap) * 0.35);
    // the two frames repeat the ids of the bodies in view and the two frame headers, and nothing else
    expect(size(fast) + size(slow)).toBeLessThan(size(snap) + 80 + snap.players.length * 48);
  });

  it("applySlow changes only the sections a frame carries, and merges roster entries by id", () => {
    const { slow } = splitSnap(crowd(3).snap);
    const state = applySlow({}, slow);
    const next = applySlow(state, { t: "slow", v: PROTOCOL_VERSION, news: ["A line."] });
    expect(next.news).toEqual(["A line."]);
    expect(next.pois).toBe(state.pois);
    expect(next.roster).toBe(state.roster);
    expect(state.news).toEqual([]);
    const [one, two] = state.roster!;
    const renamed = applySlow(next, { t: "slow", v: PROTOCOL_VERSION, roster: [{ ...two, name: "#0042", guest: false }, { ...one, id: "new" }] });
    expect(renamed.roster!.map(r => [r.id, r.name])).toEqual([[one.id, one.name], [two.id, "#0042"], ["new", one.name]]);
  });

  it("the tracker sends everything first, nothing when nothing changed, only what changed after, and roster entries only when new to the viewer or changed", () => {
    const tracker = new SlowTracker();
    const { fast, slow } = splitSnap(crowd(3).snap);
    expect(tracker.fresh("a")).toBe(true);
    expect(tracker.rosterDue("a", fast)).toBe(true);
    expect(tracker.rosterDue("a", fast)).toBe(false);
    const first = tracker.diff("a", slow)!;
    expect(tracker.fresh("a")).toBe(false);
    expect(Object.keys(first).sort()).toEqual(["roster", "t", "v", "youSlow", ...SLOW_KEYS].sort());
    expect(first.roster!.length).toBe(2);
    expect(tracker.diff("a", slow)).toBeNull();
    const changed = { ...slow, news: ["Someone named the weather."], gestell: slow.gestell! + 1 };
    const second = tracker.diff("a", changed)!;
    expect(Object.keys(second).sort()).toEqual(["gestell", "news", "t", "v"]);
    expect(tracker.diff("a", changed)).toBeNull();
    // a flag lands on you: only youSlow goes
    const flagged = { ...changed, youSlow: { ...changed.youSlow, flags: { ...changed.youSlow!.flags, intake: 1 } } };
    expect(Object.keys(tracker.diff("a", flagged)!).sort()).toEqual(["t", "v", "youSlow"]);
    // a body leaves the view: the roster is due, but the viewer owes nothing new
    const fewer = { ...fast, players: fast.players.slice(1) };
    expect(tracker.rosterDue("a", fewer)).toBe(true);
    expect(tracker.diff("a", { ...flagged, roster: slow.roster!.slice(1) })).toBeNull();
    // it comes back sealed: only that one entry is sent again
    expect(tracker.rosterDue("a", fast)).toBe(true);
    const back = { ...slow.roster![0], name: "#0042", guest: false };
    const third = tracker.diff("a", { ...flagged, roster: [back, slow.roster![1]] })!;
    expect(Object.keys(third).sort()).toEqual(["roster", "t", "v"]);
    expect(third.roster).toEqual([back]);
    // another viewer starts fresh; forgetting one makes the next frame full again
    expect(tracker.diff("b", slow)!.roster!.length).toBe(2);
    tracker.forget("a");
    expect(tracker.fresh("a")).toBe(true);
    expect(tracker.rosterDue("a", fast)).toBe(true);
    expect(tracker.diff("a", changed)!.roster!.length).toBe(2);
  });
});
