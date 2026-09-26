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
  type FastFrame, type PlayerMotion, type PlayerRoster, type PublicPlayer, type SlowFrame, type SlowKey, type Snap,
} from "./protocol";

export type SlowState = Partial<Pick<Snap, SlowKey>> & { roster?: PlayerRoster[] };

export function splitPlayer(p: PublicPlayer): { motion: PlayerMotion; roster: PlayerRoster } {
  const motion = {} as Record<string, unknown>;
  const roster = {} as Record<string, unknown>;
  for (const [k, v] of Object.entries(p)) {
    if ((MOTION_KEYS as readonly string[]).includes(k)) motion[k] = v;
    if (k === "id" || !(MOTION_KEYS as readonly string[]).includes(k)) roster[k] = v;
  }
  return { motion: motion as PlayerMotion, roster: roster as PlayerRoster };
}

export function splitSnap(snap: Snap): { fast: FastFrame; slow: SlowFrame } {
  const fast = { t: "fast", v: PROTOCOL_VERSION } as FastFrame;
  for (const k of FAST_KEYS) (fast as Record<string, unknown>)[k] = snap[k];
  const slow = { t: "slow", v: PROTOCOL_VERSION } as SlowFrame;
  for (const k of SLOW_KEYS) (slow as Record<string, unknown>)[k] = snap[k];
  const split = snap.players.map(splitPlayer);
  fast.players = split.map(s => s.motion);
  slow.roster = split.map(s => s.roster);
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
  delete (out as { roster?: unknown }).roster;
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
  return next;
}

/**
 * Per viewer, the signature of every slow section last sent, and of every
 * roster entry; a frame carries only the sections that differ and only the
 * roster entries that are new to the viewer or changed. An entry for a body
 * that left the view is forgotten, so its return is sent again, current.
 */
export class SlowTracker {
  private readonly sent = new Map<string, Map<SlowKey, string>>();
  private readonly roster = new Map<string, Map<string, string>>();
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
  diff(viewerId: string, slow: SlowFrame): SlowFrame | null {
    let seen = this.sent.get(viewerId);
    if (!seen) {
      seen = new Map();
      this.sent.set(viewerId, seen);
    }
    let out: SlowFrame | null = null;
    for (const k of SLOW_KEYS) {
      const value = slow[k];
      const sig = JSON.stringify(value);
      if (seen.get(k) === sig) continue;
      seen.set(k, sig);
      if (!out) out = { t: "slow", v: slow.v };
      (out as Record<string, unknown>)[k] = value;
    }
    const known = this.roster.get(viewerId) ?? new Map<string, string>();
    const next = new Map<string, string>();
    const owed: PlayerRoster[] = [];
    for (const r of slow.roster ?? []) {
      const sig = JSON.stringify(r);
      next.set(r.id, sig);
      if (known.get(r.id) !== sig) owed.push(r);
    }
    this.roster.set(viewerId, next);
    if (owed.length) {
      if (!out) out = { t: "slow", v: slow.v };
      out.roster = owed;
    }
    return out;
  }

  forget(viewerId: string): void {
    this.sent.delete(viewerId);
    this.roster.delete(viewerId);
    this.ids.delete(viewerId);
  }
}
