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

/**
 * The parts of `you` that change rarely and grow over a campaign; they ride
 * the slow frame as `youSlow`. The open dialogue is here too: it changes
 * when the viewer acts (the object sends a slow frame at once) or when the
 * tick closes it (a death), and `SlowTracker.youDue` brings the slow frame
 * forward the step any of these fields changes, so nothing is later.
 */
export const YOU_SLOW_KEYS = ["quests", "flags", "choices", "party", "items", "claims", "history", "respawn", "wallet", "dialogue", "kitReadout"] as const;
export type YouSlowKey = (typeof YOU_SLOW_KEYS)[number];
export type YouSlow = Partial<Pick<YouView, YouSlowKey>>;
/** The record's fields the wire's `you` never carries: the snapshot has a section of its own for them (`Snap.notices`). */
export const YOU_OFF_WIRE = ["notices"] as const;
/** The record fields `youDue` watches: every slow key that is the viewer's own record (the kit's readout is built per frame). */
const YOU_RECORD_KEYS = YOU_SLOW_KEYS.filter(k => k !== "kitReadout");

export type SlowState = Partial<Pick<Snap, SlowKey>> & { roster?: PlayerRoster[]; youSlow?: YouSlow };

/** `you` in two, the fast part without the slow keys and without what never rides. (One native copy and a few deletes measured faster than a copy key by key; `framesFor` goes one step further for the object.) */
export function splitYou(you: YouView): { fast: YouView; slow: YouSlow } {
  const fast = { ...you } as Record<string, unknown>;
  const slow = {} as Record<string, unknown>;
  for (const k of YOU_SLOW_KEYS) {
    if (!(k in you)) continue;
    slow[k] = fast[k];
    delete fast[k];
  }
  for (const k of YOU_OFF_WIRE) delete fast[k];
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
type Split = { p: PublicPlayer; motion: PlayerMotion; roster: PlayerRoster };
export type FrameCache = {
  split: Map<string, Split>;
  fragments: Map<object, string>;
  /** The last step's splits: a body whose roster fields all stand keeps its roster entry's identity from step to step, so a tracker owes nothing for it without a stringify. */
  prev: Map<string, Split> | null;
};
export const newFrameCache = (last?: FrameCache | null): FrameCache => ({ split: new Map(), fragments: new Map(), prev: last?.split ?? null });

const MOTION = new Set<string>(MOTION_KEYS);
type Record_ = Record<string, unknown>;
const standsAs = (roster: PlayerRoster, p: PublicPlayer): boolean => {
  for (const k in roster) if ((roster as Record_)[k] !== (p as Record_)[k]) return false;
  return true;
};

export function splitPlayer(p: PublicPlayer, cache?: FrameCache): { motion: PlayerMotion; roster: PlayerRoster } {
  const kept = cache?.split.get(p.id);
  if (kept && kept.p === p) return kept;
  const before = cache?.prev?.get(p.id);
  const keep = before && standsAs(before.roster, p) ? before.roster : null;
  const motion = {} as Record_;
  const roster = {} as Record_;
  for (const k in p) {
    const v = (p as Record_)[k];
    if (MOTION.has(k)) motion[k] = v;
    if (!keep && (k === "id" || !MOTION.has(k))) roster[k] = v;
  }
  const out: Split = { p, motion: motion as PlayerMotion, roster: keep ?? (roster as PlayerRoster) };
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
 * has not arrived yet is left out until it does. A key the fast `you`
 * carries as `undefined` (the object leaves the slow keys in that way; JSON
 * drops them, an in-process fold must too) never covers the slow record.
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
  const you = { ...(slow.youSlow ?? {}) } as Record<string, unknown>;
  const fastYou = fast.you as unknown as Record<string, unknown>;
  for (const k in fastYou) if (fastYou[k] !== undefined) you[k] = fastYou[k];
  out.you = you as unknown as YouView;
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
  private readonly roster = new Map<string, Map<string, { sig: string; ref: PlayerRoster }>>(); // per body: the signature sent and the entry object last seen
  private readonly ids = new Map<string, string>();
  private readonly records = new Map<string, Map<string, unknown>>(); // the viewer's own record fields as last asked about

  /** True until the viewer has been sent its first slow frame. */
  fresh(viewerId: string): boolean {
    return !this.sent.has(viewerId);
  }

  /**
   * True the step one of the viewer's own record fields is a new object
   * (a dialogue the tick closed at a death, a print that decayed, a quest
   * the tick advanced): the slow frame is due now, not at the fifth step.
   * Asked every step, before `diff`; a handful of identity compares. The
   * sim never mutates a record in place, so identity is the change.
   */
  youDue(viewerId: string, you: YouView): boolean {
    let kept = this.records.get(viewerId);
    if (!kept) {
      kept = new Map();
      this.records.set(viewerId, kept);
    }
    let due = false;
    const record = you as unknown as Record<string, unknown>;
    for (const k of YOU_RECORD_KEYS) {
      const v = record[k];
      if (kept.get(k) !== v) {
        kept.set(k, v);
        due = true;
      }
    }
    return due;
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
    const roster = slow.roster ?? [];
    const known = this.roster.get(viewerId);
    // The same bodies, each the same entry object as last time: nothing owed, nothing rebuilt.
    let stands = known !== undefined && known.size === roster.length;
    if (stands) {
      for (const r of roster) {
        const kept = known!.get(r.id);
        if (!kept || kept.ref !== r) {
          stands = false;
          break;
        }
      }
    }
    const owed: PlayerRoster[] = [];
    if (!stands) {
      const next = new Map<string, { sig: string; ref: PlayerRoster }>();
      for (const r of roster) {
        const kept = known?.get(r.id);
        if (kept && kept.ref === r) {
          next.set(r.id, kept); // the same entry object: unchanged without a stringify
          continue;
        }
        const sig = fragmentOf(r, cache);
        next.set(r.id, { sig, ref: r });
        if (!kept || kept.sig !== sig) owed.push(r);
      }
      this.roster.set(viewerId, next);
    }
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
    this.ids.delete(viewerId);
    this.records.delete(viewerId);
  }
}
