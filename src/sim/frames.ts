/**
 * The snapshot diet. A full `Snap` splits into a fast frame (what moves every
 * step) and a slow frame (what changes rarely); the client merges them back.
 * Other bodies split too: their motion rides the fast frame, who they are
 * rides the slow frame as a roster, joined by id on merge. `SlowTracker`
 * remembers, per viewer, a signature of every slow section it has sent, so a
 * slow frame carries only what changed and nothing at all when nothing did.
 * Pure; the server and the client share it.
 */
import {
  FAST_KEYS, MOTION_KEYS, PROTOCOL_VERSION, SLOW_KEYS,
  type FastFrame, type PlayerMotion, type PlayerRoster, type PublicPlayer, type SlowFrame, type SlowKey, type Snap, type YouView,
} from "./protocol";

/** The parts of `you` that change rarely and grow over a campaign; they ride the slow frame as `youSlow`. */
export const YOU_SLOW_KEYS = ["quests", "flags", "choices", "party", "items", "claims", "history", "respawn", "wallet", "kitReadout"] as const;
export type YouSlowKey = (typeof YOU_SLOW_KEYS)[number];
export type YouSlow = Partial<Pick<YouView, YouSlowKey>>;

export type SlowState = Partial<Pick<Snap, SlowKey>> & { roster?: PlayerRoster[]; youSlow?: YouSlow };

export function splitYou(you: YouView): { fast: YouView; slow: YouSlow } {
  const fast = { ...you } as Record<string, unknown>;
  const slow = {} as Record<string, unknown>;
  for (const k of YOU_SLOW_KEYS) {
    if (!(k in you)) continue;
    slow[k] = fast[k];
    delete fast[k];
  }
  return { fast: fast as YouView, slow: slow as YouSlow };
}

/**
 * What one step's frames share across viewers: a body's split, by id, and
 * the JSON of every object encoded this step, by identity. A body's motion,
 * an enemy's view, a roster entry and a shared slow section are the same
 * objects for every viewer in a step, so each is encoded once. The server
 * makes one per broadcast and drops it after; plain Maps, so nothing weak
 * is left for the collector to chase. The sim never mutates what it has
 * snapshotted.
 */
export type FrameCache = {
  split: Map<string, { p: PublicPlayer; motion: PlayerMotion; roster: PlayerRoster }>;
  fragments: Map<object, string>;
};
export const newFrameCache = (): FrameCache => ({ split: new Map(), fragments: new Map() });

export function splitPlayer(p: PublicPlayer, cache?: FrameCache): { motion: PlayerMotion; roster: PlayerRoster } {
  const kept = cache?.split.get(p.id);
  if (kept && kept.p === p) return kept;
  const motion = {} as Record<string, unknown>;
  const roster = {} as Record<string, unknown>;
  for (const [k, v] of Object.entries(p)) {
    if ((MOTION_KEYS as readonly string[]).includes(k)) motion[k] = v;
    if (k === "id" || !(MOTION_KEYS as readonly string[]).includes(k)) roster[k] = v;
  }
  const out = { p, motion: motion as PlayerMotion, roster: roster as PlayerRoster };
  cache?.split.set(p.id, out);
  return out;
}

/** A value's JSON, from the step's cache when it holds one for that object. */
export function fragmentOf(value: unknown, cache?: FrameCache): string {
  if (!cache || value === null || typeof value !== "object") return JSON.stringify(value);
  let s = cache.fragments.get(value);
  if (s === undefined) {
    s = JSON.stringify(value);
    cache.fragments.set(value, s);
  }
  return s;
}

/** The fast frame as JSON, byte for byte what JSON.stringify gives, with every body's and enemy's fragment shared across the step's viewers. */
export function encodeFast(fast: FastFrame, cache?: FrameCache): string {
  const players = fast.players.map(p => fragmentOf(p, cache)).join(",");
  const enemies = fast.enemies.map(e => fragmentOf(e, cache)).join(",");
  return `{"t":"fast","v":${fast.v},"now":${JSON.stringify(fast.now)},"tick":${JSON.stringify(fast.tick)},"you":${JSON.stringify(fast.you)},"players":[${players}],"enemies":[${enemies}],"prompt":${JSON.stringify(fast.prompt)}}`;
}

export function splitSnap(snap: Snap, cache?: FrameCache): { fast: FastFrame; slow: SlowFrame } {
  const fast = { t: "fast", v: PROTOCOL_VERSION } as FastFrame;
  for (const k of FAST_KEYS) (fast as Record<string, unknown>)[k] = snap[k];
  const slow = { t: "slow", v: PROTOCOL_VERSION } as SlowFrame;
  for (const k of SLOW_KEYS) (slow as Record<string, unknown>)[k] = snap[k];
  const split = snap.players.map(p => splitPlayer(p, cache));
  fast.players = split.map(s => s.motion);
  slow.roster = split.map(s => s.roster);
  const you = splitYou(snap.you);
  fast.you = you.fast;
  slow.youSlow = you.slow;
  return { fast, slow };
}

/** The ids the fast frame moves, in order: the roster must cover them all. */
export const motionIds = (fast: FastFrame): string => fast.players.map(p => p.id).join(",");

/**
 * The last slow state folded with a fast frame: one `Snap`, as the renderers
 * read it. Missing slow sections are left absent; a body whose roster entry
 * has not arrived yet is left out until it does.
 */
export function mergeFrames(slow: SlowState, fast: FastFrame): Snap {
  const out = { ...slow, t: "snap", v: fast.v } as unknown as Snap;
  for (const k of FAST_KEYS) (out as Record<string, unknown>)[k] = fast[k];
  const roster = new Map((slow.roster ?? []).map(r => [r.id, r]));
  const players: PublicPlayer[] = [];
  for (const m of fast.players) {
    const r = roster.get(m.id);
    if (r) players.push({ ...r, ...m });
  }
  out.players = players;
  out.you = { ...(slow.youSlow ?? {}), ...fast.you } as YouView;
  delete (out as { roster?: unknown }).roster;
  delete (out as { youSlow?: unknown }).youSlow;
  return out;
}

/** Roster entries by id: a frame's entries replace or add, everything else is kept (a body out of view keeps its entry until it returns changed). */
export function mergeRoster(kept: PlayerRoster[] | undefined, incoming: PlayerRoster[]): PlayerRoster[] {
  if (!kept || !kept.length) return incoming;
  const byId = new Map(kept.map(r => [r.id, r]));
  for (const r of incoming) byId.set(r.id, r);
  return [...byId.values()];
}

/** Folds a slow frame into the kept slow state: only the sections it carries change; the roster merges by id. */
export function applySlow(slow: SlowState, frame: SlowFrame): SlowState {
  const next = { ...slow };
  for (const k of SLOW_KEYS) if (k in frame) (next as Record<string, unknown>)[k] = frame[k];
  if (frame.roster) next.roster = mergeRoster(slow.roster, frame.roster);
  if (frame.youSlow) next.youSlow = frame.youSlow;
  return next;
}

/**
 * Per viewer, the signature of every slow section last sent, and of every
 * roster entry; a frame carries only the sections that differ and only the
 * roster entries that are new to the viewer or changed. An entry for a body
 * that left the view is forgotten, so its return is sent again, current.
 * A section that is the same object it sent last is unchanged without a
 * stringify (the snapshot keeps an unchanged section's identity across
 * steps), and with the step's cache a section shared by every viewer is
 * stringified once.
 */
export class SlowTracker {
  private readonly sent = new Map<string, Map<SlowKey, string>>();
  private readonly refs = new Map<string, Map<string, unknown>>(); // the objects last sent, by section and by youSlow key
  private readonly roster = new Map<string, Map<string, string>>();
  private readonly rosterRefs = new Map<string, Map<string, PlayerRoster>>(); // the entry objects last seen, by body
  private readonly ids = new Map<string, string>();

  /** True until the viewer has been sent its first slow frame. */
  fresh(viewerId: string): boolean {
    return !this.sent.has(viewerId);
  }

  /** True when the bodies a fast frame moves are not the ones it moved last time: the roster may owe an entry, so a slow frame is due now. */
  rosterDue(viewerId: string, fast: FastFrame): boolean {
    const ids = motionIds(fast);
    if (this.ids.get(viewerId) === ids) return false;
    this.ids.set(viewerId, ids);
    return true;
  }

  /** The changed sections as a slow frame, or null when nothing changed. Records what it returns as sent. */
  diff(viewerId: string, slow: SlowFrame, cache?: FrameCache): SlowFrame | null {
    let seen = this.sent.get(viewerId);
    let refs = this.refs.get(viewerId);
    if (!seen || !refs) {
      seen = new Map();
      refs = new Map();
      this.sent.set(viewerId, seen);
      this.refs.set(viewerId, refs);
    }
    let out: SlowFrame | null = null;
    for (const k of SLOW_KEYS) {
      const value = slow[k];
      if (refs.get(k) === value) continue; // the same object, or the same primitive
      refs.set(k, value);
      const sig = fragmentOf(value, cache);
      if (seen.get(k) === sig) continue;
      seen.set(k, sig);
      if (!out) out = { t: "slow", v: slow.v };
      (out as Record<string, unknown>)[k] = value;
    }
    // `youSlow` is a fresh object each frame; its records are the same objects until something lands on you.
    const you = slow.youSlow ?? {};
    const youSame = YOU_SLOW_KEYS.every(k => refs!.get(`you:${k}`) === you[k]) && refs.has("you:kept");
    if (!youSame) {
      for (const k of YOU_SLOW_KEYS) refs.set(`you:${k}`, you[k]);
      refs.set("you:kept", true);
      const youSig = JSON.stringify(slow.youSlow);
      if (seen.get("youSlow" as SlowKey) !== youSig) {
        seen.set("youSlow" as SlowKey, youSig);
        if (!out) out = { t: "slow", v: slow.v };
        out.youSlow = slow.youSlow;
      }
    }
    const known = this.roster.get(viewerId) ?? new Map<string, string>();
    const knownRefs = this.rosterRefs.get(viewerId) ?? new Map<string, PlayerRoster>();
    const next = new Map<string, string>();
    const nextRefs = new Map<string, PlayerRoster>();
    const owed: PlayerRoster[] = [];
    for (const r of slow.roster ?? []) {
      nextRefs.set(r.id, r);
      const keptSig = known.get(r.id);
      if (keptSig !== undefined && knownRefs.get(r.id) === r) {
        next.set(r.id, keptSig); // the same entry object: unchanged without a stringify
        continue;
      }
      const sig = fragmentOf(r, cache);
      next.set(r.id, sig);
      if (keptSig !== sig) owed.push(r);
    }
    this.roster.set(viewerId, next);
    this.rosterRefs.set(viewerId, nextRefs);
    if (owed.length) {
      if (!out) out = { t: "slow", v: slow.v };
      out.roster = owed;
    }
    return out;
  }

  forget(viewerId: string): void {
    this.sent.delete(viewerId);
    this.refs.delete(viewerId);
    this.roster.delete(viewerId);
    this.rosterRefs.delete(viewerId);
    this.ids.delete(viewerId);
  }
}
