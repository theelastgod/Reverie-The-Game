import { describe, expect, it, vi } from "vitest";
import { DT } from "./constants";
import { applySlow, encodeFast, mergeFrames, newFrameCache, splitPlayer, splitSnap, SlowTracker, YOU_SLOW_KEYS } from "./frames";
import { FAST_KEYS, PROTOCOL_VERSION, SLOW_KEYS, type Snap } from "./protocol";
import { framesFor, snapshotFor, stepViews } from "./snapshot";
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

  it("splits you: the campaign's growing records, the open dialogue and the notices ride the slow frame and merge back under the fast fields", () => {
    const { snap } = crowd();
    const { fast, slow } = splitSnap(snap);
    expect(YOU_SLOW_KEYS).toContain("dialogue");
    expect(YOU_SLOW_KEYS).toContain("notices");
    expect(Object.keys(fast.you)).toEqual(Object.keys(snap.you).filter(k => !(YOU_SLOW_KEYS as readonly string[]).includes(k)));
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

  it("framesFor gives the frames splitSnap(snapshotFor) gives, bytes included: a guest's private line hidden, the open dialogue and notices in youSlow, the Ruin kit's readout with them", () => {
    let w = emptyWorld();
    const players = new Map(w.players);
    const a = spawnGuest("a");
    const dialogue = { npc: "nara", node: "meet", speaker: "Nara Vale", portrait: "nara.jpg", text: "Hello.", wink: "A private line.", choices: [] };
    players.set("a", { ...a, wink: "A private line.", winkAt: 0, notices: [{ text: "A notice.", at: 0, tone: "ink" as const }], dialogue });
    players.set("b1", { ...spawnGuest("b1"), x: a.x + 40, guest: false, serial: 7, name: "#0007", messenger: "ruin", kit: { verb: "ruin", until: 999 } });
    players.set("b2", { ...spawnGuest("b2"), x: a.x + 80 });
    w = tickWorld({ ...w, players }, DT);
    const step = stepViews(w);
    for (const id of ["a", "b1", "b2"]) {
      const frames = framesFor(w, id, step);
      const split = splitSnap(snapshotFor(w, id, step), step.frames);
      expect(frames.fast, id).toEqual(split.fast);
      expect(frames.slow(), id).toEqual(split.slow);
      expect(encodeFast(frames.fast, step.frames), id).toBe(JSON.stringify(split.fast));
      // what the client receives, folded back, is the snapshot
      const wire = { fast: JSON.parse(encodeFast(frames.fast, step.frames)), slow: JSON.parse(JSON.stringify(frames.slow())) };
      expect(mergeFrames(applySlow({}, wire.slow), wire.fast), id).toEqual(JSON.parse(JSON.stringify(snapshotFor(w, id, step))));
    }
    const guest = framesFor(w, "a", step);
    expect(guest.fast.you.wink).toBe("");
    expect(guest.fast.you.dialogue).toBeUndefined();
    expect(guest.fast.you.notices).toBeUndefined();
    expect(Object.keys(JSON.parse(encodeFast(guest.fast, step.frames)).you)).not.toContain("dialogue");
    expect(guest.slow().youSlow!.dialogue).toEqual({ ...dialogue, wink: "" });
    expect(guest.slow().youSlow!.notices).toBe(w.players.get("a")!.notices);
    expect(guest.slow().youSlow!.notices![0]).toEqual({ text: "A notice.", at: 0, tone: "ink" });
    expect(framesFor(w, "b1", step).slow().youSlow!.kitReadout).toEqual(["Passings 0. Buried 0. Looted 0. Fell 0 times."]);
    expect("kitReadout" in framesFor(w, "b2", step).slow().youSlow!).toBe(false);
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

  it("encodes the fast frame byte for byte as JSON.stringify would, from fragments kept per body in the step's cache", () => {
    const { w, snap } = crowd(6);
    const step = stepViews(w);
    const { fast } = splitSnap(snapshotFor(w, "a", step), step.frames);
    expect(fast.players.length).toBe(5);
    expect(encodeFast(fast, step.frames)).toBe(JSON.stringify(fast));
    expect(encodeFast(fast)).toBe(JSON.stringify(fast));
    // another viewer of the same step shares every body's fragment; the frame still comes out exact
    const other = splitSnap(snapshotFor(w, "b1", step), step.frames).fast;
    expect(encodeFast(other, step.frames)).toBe(JSON.stringify(other));
    expect(JSON.parse(encodeFast(other, step.frames))).toEqual(other);
    expect(step.frames.fragments.size).toBeGreaterThanOrEqual(6);
    // a null prompt and an empty crowd encode the same way too
    const alone = { ...splitSnap(snap).fast, players: [], enemies: [], prompt: null };
    expect(encodeFast(alone)).toBe(JSON.stringify(alone));
  });

  it("the tracker reads an unchanged section off its identity, without a stringify, and with the step's cache stringifies a shared section once for every viewer", () => {
    const { w } = crowd(3);
    const tracker = new SlowTracker();
    const first = splitSnap(snapshotFor(w, "a")).slow;
    expect(tracker.diff("a", first)).not.toBeNull();
    const spy = vi.spyOn(JSON, "stringify");
    try {
      // the same frame again: nothing is stringified at all
      expect(tracker.diff("a", first)).toBeNull();
      expect(spy).not.toHaveBeenCalled();
      // a fresh snapshot of the same world: the shared sections keep their identity and are not stringified again
      const again = splitSnap(snapshotFor(w, "a")).slow;
      spy.mockClear();
      expect(tracker.diff("a", again)).toBeNull();
      let stringified = spy.mock.calls.map(c => c[0]);
      for (const k of ["pois", "market", "news", "houses", "clearing", "passing", "frozen"] as const) expect(stringified, k).not.toContain(again[k]);
      expect(stringified, "youSlow rides on its records' identity").not.toContain(again.youSlow);
      // two fresh viewers of one step: the second pays nothing for the sections and bodies the first already encoded
      const step = stepViews(w);
      const one = splitSnap(snapshotFor(w, "b1", step), step.frames).slow;
      const two = splitSnap(snapshotFor(w, "b2", step), step.frames).slow;
      expect(tracker.diff("b1", one, step.frames)).not.toBeNull();
      spy.mockClear();
      expect(tracker.diff("b2", two, step.frames)).not.toBeNull();
      stringified = spy.mock.calls.map(c => c[0]);
      for (const k of ["pois", "market", "news", "houses", "clearing", "passing", "frozen"] as const) expect(stringified, k).not.toContain(two[k]);
      // b1's own entry is new to the step (b1 never sees itself); the body both saw is kept
      for (const r of two.roster!.filter(r => r.id !== "b1")) expect(stringified, `roster ${r.id}`).not.toContain(r);
    } finally {
      spy.mockRestore();
    }
  });

  it("a body that walks keeps its roster entry's identity from step to step, and a tracker owes nothing for it without a stringify; a sealed body gets a new one", () => {
    const { w } = crowd(3);
    const one = stepViews(w);
    const before = splitPlayer(one.players.get("b1")!, one.frames).roster;
    // b1 walks: a new public shape, the same roster entry object
    const players = new Map(w.players);
    players.set("b1", { ...w.players.get("b1")!, x: w.players.get("b1")!.x + 5 });
    const walked = { ...w, players, tick: w.tick + 1 };
    const two = stepViews(walked);
    expect(two.players.get("b1")).not.toBe(one.players.get("b1"));
    expect(splitPlayer(two.players.get("b1")!, two.frames).roster).toBe(before);
    const tracker = new SlowTracker();
    expect(tracker.diff("a", framesFor(w, "a", one).slow(), one.frames)).not.toBeNull();
    const spy = vi.spyOn(JSON, "stringify");
    try {
      const frame = framesFor(walked, "a", two).slow();
      expect(tracker.diff("a", frame, two.frames)).toBeNull();
      for (const r of frame.roster!) expect(spy.mock.calls.map(c => c[0]), `roster ${r.id}`).not.toContain(r);
    } finally {
      spy.mockRestore();
    }
    // b1 is sealed: the entry is new, and the viewer is owed it
    players.set("b1", { ...players.get("b1")!, guest: false, serial: 42, name: "#0042" });
    const sealed = { ...walked, players: new Map(players), tick: walked.tick + 1 };
    const three = stepViews(sealed);
    const entry = splitPlayer(three.players.get("b1")!, three.frames).roster;
    expect(entry).not.toBe(before);
    expect(entry).toMatchObject({ id: "b1", name: "#0042", guest: false });
    expect(tracker.diff("a", framesFor(sealed, "a", three).slow(), three.frames)?.roster).toEqual([entry]);
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
