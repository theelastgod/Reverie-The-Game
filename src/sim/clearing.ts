/**
 * The Clearing and the Passing. A hole in the Gestell that Angels open, keep
 * or extract; the contest is the political PvP. The Passing is server-aware:
 * a solo hero with a perfect instance cannot force it at meltdown.
 */
import {
  AURA_DWELL_GAIN,
  AURA_MAX,
  CLEARING_EXTRACT,
  CLEARING_HOLD_ANGELS,
  CLEARING_HOLD_SCALE,
  CLEARING_RADIUS,
  CLEARING_RESERVE,
  GESTELL_CLEARING_HOLD,
  GESTELL_MELTDOWN,
  NODE_REGEN,
  PASSING_STIPEND,
  READINESS_APPEARANCE_MIN,
  READINESS_KEEP,
  READINESS_MAX,
  READINESS_PASSING_MIN,
  RESTRAINT_KEEP_GAIN,
  RESTRAINT_MAX,
  SEASON_LENGTH,
  WAR_HOLD,
  WAR_PERIOD,
} from "./constants";
import type { ClearingState, FailedPassing, PassingOutcome, PassingState, Player, PoiState, WorldState } from "./types";
import { POSITIONS, nearPoint } from "./map";
import { weatherBand } from "./protocol";
import { C, F, W } from "./content/ids";
import { LINES } from "./content";
import { notice, pushNews, say } from "./world";
import { earn } from "./economy";

export const RING = "clearing-ring";
export const FAILED_MARK = "failed-1";
const CLEARING_EXTRACT_AURA = 2;
const CLEARING_EXTRACT_GESTELL = 2;
const HIJACK_RESTRAINT_MAX = 50;
const RESERVE_REGEN_KEY = "clearing:regenAt"; // world: when the closed Clearing next regains a point of reserve

type Vote = "keep" | "extract";
type Contest = NonNullable<ClearingState["contest"]>;

// Copy owned by this module. The hour is not a character.
const CLEARING_RESERVE_SPENT = "The Clearing is closed. Its reserve is spent. There is nothing left to open.";
const CLEARING_TOO_SOON = "The hole was contested lately. The asphalt has not set. Wait for the hour.";
const CLEARING_OPENED = "You open the hole. Keep it or extract it; the hour watches which.";
const CLEARING_NOT_OPEN = "The Clearing is not open. Open it first, or stand in it while someone does.";
const CLEARING_KEPT = "You keep the hole. Readiness. The weather thins by the width of a body.";
const CLEARING_KEPT_AGAIN = "You are already keeping it. Stand in it; the hour counts bodies, not presses.";
const CLEARING_EXTRACTED = (pay: number) =>
  pay > 0 ? `You extracted the Clearing. ${pay} Bestand. Cold is a current. The hole narrows.` : "You extracted the Clearing. Its reserve is spent; the loss pays nothing.";
const CLEARING_PASSED = "You stand back from the hole. Neither keep nor stock. The hour notes it.";
const CLEARING_HELD_NEWS = "The Clearing held. The hole stays open.";
const CLEARING_CLOSED_NEWS = "The Clearing was extracted. The hole closes.";
const PASSING_NOT_PREPARED = "The ground is not prepared. The party must be willing to stand in it.";
const PASSING_APPEARANCE = "A trace, not a face. The city is briefly world again. A stipend for the shrine. Cult upkeep.";
const PASSING_ABSENCE = "The hour went by. Absence is honest. Nara Vale stays. No one can force a god alone.";
const PASSING_HIJACK_COLD = "A concentrator claimed the hour. The world continues. You are marked.";
const PASSING_HIJACK_SAFETY = "Safety claimed the hour. The freeze ate the rite. You are marked.";
const PASSING_FAILED = "Gestell kept the weather. Without a held Clearing the hour does not open. No stipend is owed.";
const NEWS_APPEARANCE = (name: string) => `A Passing. ${name} prepared the ground. The city is briefly world.`;
const NEWS_ABSENCE = (name: string) => `A Passing went by. ${name} kept the hole. Absence is honest.`;
const NEWS_HIJACK = (name: string, by: "cold" | "safety") => `${by === "cold" ? "Cold" : "Safety"} claimed the hour at ${name}'s Clearing. The world continues.`;
const NEWS_FAILED = (name: string) => `${name}'s Passing failed. Gestell kept the weather.`;
const FAILED_LINE = "Last season's Passing failed. The hour went by. The city kept the weather.";

// ---------------------------------------------------------------- helpers

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clampGestell = (g: number) => clamp(g, 0, 100);

function setPlayer(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}

function speak(w: WorldState, p: Player, text: string): WorldState {
  return setPlayer(w, say(p, text, w.now));
}

function ringState(w: WorldState): PoiState {
  return w.pois[RING] ?? { state: "closed", by: "", at: 0, count: 0 };
}

function setRing(w: WorldState, state: string, by: string): WorldState {
  const cur = ringState(w);
  return { ...w, pois: { ...w.pois, [RING]: { state, by, at: w.now, count: cur.count + 1 } } };
}

function atRing(p: Player): boolean {
  const ring = POSITIONS[RING];
  return !!ring && nearPoint(p.x, p.y, ring.x, ring.y, CLEARING_RADIUS);
}

function dwells(p: Player): boolean {
  return !p.guest && !p.locked && !p.dead && atRing(p);
}

const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);

/** The personal once-flag for the readiness a contest pays: one keep per Angel per contest. */
const keptKey = (openedAt: number): string => `clearing:kept:${openedAt}`;
/** The personal once-flag for a season's Passing rite. */
const passedKey = (season: number): string => `passing:${season}`;

/** Counts the stances of the Angels still standing in the ring. A vote left with the body is not a vote. */
function tally(contest: Contest, dwellers: Iterable<string>): Contest {
  const votes = contest.votes ?? {};
  const inRing = new Set(dwellers);
  let keep = 0;
  let extract = 0;
  for (const [pid, vote] of Object.entries(votes)) {
    if (!inRing.has(pid)) continue;
    if (vote === "keep") keep++;
    else extract++;
  }
  return keep === contest.keep && extract === contest.extract && contest.votes ? contest : { ...contest, votes, keep, extract };
}

/** Records one Angel's stance for the live contest, then recounts with them standing in the ring. */
function castVote(clearing: ClearingState, id: string, vote: Vote): ClearingState {
  const contest = clearing.contest;
  if (!contest || !contest.active) return clearing;
  const votes = { ...(contest.votes ?? {}), [id]: vote };
  return { ...clearing, contest: tally({ ...contest, votes }, [...clearing.heldBy, id]) };
}

// ---------------------------------------------------------------- state

export function initialClearing(): ClearingState {
  return { open: false, reserve: CLEARING_RESERVE, openedAt: 0, seeds: [], contest: null, heldBy: [], lastOutcome: "" };
}

export function initialPassing(): PassingState {
  return { count: 0, lastOutcome: "", lastBy: "", lastAt: 0, hijackedBy: "", appearanceUntil: 0 };
}

// ---------------------------------------------------------------- tick

export function tickClearing(w: WorldState, dt: number): WorldState {
  const heldBy: string[] = [];
  for (const p of w.players.values()) if (dwells(p)) heldBy.push(p.id);

  const clearing = w.clearing;
  let next = w;
  if (!sameIds(heldBy, clearing.heldBy)) next = { ...next, clearing: { ...next.clearing, heldBy } };

  if (clearing.open && heldBy.length > 0 && dt > 0) {
    next = { ...next, gestell: clampGestell(next.gestell + GESTELL_CLEARING_HOLD * heldBy.length * dt) };
    const players = new Map(next.players);
    for (const id of heldBy) {
      const p = players.get(id);
      if (!p || p.aura >= AURA_MAX) continue;
      players.set(id, { ...p, aura: Math.min(AURA_MAX, p.aura + AURA_DWELL_GAIN * dt) });
    }
    next = { ...next, players };
  }

  // A closed hole fills back slowly: one point of reserve per NODE_REGEN, the way a node does.
  if (!next.clearing.open && next.clearing.reserve < CLEARING_RESERVE) {
    const due = next.flags[RESERVE_REGEN_KEY];
    if (due === undefined) next = { ...next, flags: { ...next.flags, [RESERVE_REGEN_KEY]: next.now + NODE_REGEN } };
    else if (next.now >= due) {
      next = { ...next, clearing: { ...next.clearing, reserve: next.clearing.reserve + 1 }, flags: { ...next.flags, [RESERVE_REGEN_KEY]: due + NODE_REGEN } };
    }
  } else if (next.flags[RESERVE_REGEN_KEY] !== undefined) {
    const { [RESERVE_REGEN_KEY]: _due, ...flags } = next.flags;
    next = { ...next, flags };
  }

  const contest = next.clearing.contest;
  if (contest && contest.active) {
    const counted = tally(contest, heldBy);
    if (counted !== contest) next = { ...next, clearing: { ...next.clearing, contest: counted } };
    if (next.now >= counted.endsAt) {
      // Resolved by who is still standing in it. A hole nobody contests stays a hole.
      const kept = counted.keep >= counted.extract;
      const lastOutcome = kept ? "kept" : "extracted";
      next = {
        ...next,
        clearing: { ...next.clearing, open: kept, contest: { ...counted, active: false }, lastOutcome },
      };
      next = setRing(next, kept ? "held" : "closed", "");
      next = pushNews(next, kept ? CLEARING_HELD_NEWS : CLEARING_CLOSED_NEWS);
    }
  }
  return next;
}

// ---------------------------------------------------------------- verbs

export function applyClearing(w: WorldState, id: string, op: "open" | "keep" | "extract" | "pass"): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead) return w;
  if (p.guest || p.locked) return speak(w, p, LINES.GUEST_LOCK);
  if (op !== "pass" && !atRing(p)) return w;
  const clearing = w.clearing;

  switch (op) {
    case "open": {
      // A contest may be opened on a closed, failed or held ring once the last one has set; never over a live one.
      if (clearing.contest && clearing.contest.active) return speak(w, p, LINES.ALREADY);
      if (ringState(w).state === "open") return speak(w, p, LINES.ALREADY);
      if (clearing.reserve <= 0) return speak(w, p, CLEARING_RESERVE_SPENT);
      if (clearing.openedAt > 0 && w.now - clearing.openedAt < WAR_PERIOD) return speak(w, p, CLEARING_TOO_SOON);
      const hold = WAR_HOLD * CLEARING_HOLD_SCALE[weatherBand(w.gestell)];
      let next: WorldState = {
        ...w,
        clearing: { ...clearing, open: true, openedAt: w.now, contest: { active: true, keep: 0, extract: 0, endsAt: w.now + hold, votes: {} } },
      };
      next = setRing(next, "open", id);
      next = pushNews(next, `${p.name} opened the Clearing. Keep it or extract it. The hold lasts ${Math.round(hold)} seconds.`);
      return speak(next, p, CLEARING_OPENED);
    }
    case "keep": {
      if (!clearing.open) return speak(w, p, CLEARING_NOT_OPEN);
      const key = keptKey(clearing.openedAt);
      const already = (p.flags[key] ?? 0) > 0;
      const votedKeep = clearing.contest?.active && clearing.contest.votes?.[id] === "keep";
      if (already && (votedKeep || !clearing.contest?.active)) return speak(w, p, CLEARING_KEPT_AGAIN);
      const next: WorldState = { ...w, clearing: castVote(clearing, id, "keep") };
      // The readiness is for keeping, once per contest; a stance changed back does not pay twice.
      const me: Player = already
        ? { ...p, choices: { ...p.choices, [C.CLEARING]: "keep" } }
        : {
            ...p,
            readiness: clamp(p.readiness + READINESS_KEEP * 2, 0, READINESS_MAX),
            restraint: clamp(p.restraint + RESTRAINT_KEEP_GAIN, 0, RESTRAINT_MAX),
            flags: { ...p.flags, [key]: 1 },
            choices: { ...p.choices, [C.CLEARING]: "keep" },
          };
      return speak(next, me, CLEARING_KEPT);
    }
    case "extract": {
      if (!clearing.open) return speak(w, p, CLEARING_NOT_OPEN);
      const pay = Math.max(0, Math.min(CLEARING_EXTRACT, clearing.reserve));
      const voted = castVote(clearing, id, "extract");
      // The reserve is finite; past it the stance still counts but the loss costs nothing more.
      let next: WorldState = {
        ...w,
        gestell: pay > 0 ? clampGestell(w.gestell + CLEARING_EXTRACT_GESTELL) : w.gestell,
        clearing: { ...voted, reserve: voted.reserve - pay },
      };
      next = setPlayer(next, { ...p, aura: pay > 0 ? Math.max(0, p.aura - CLEARING_EXTRACT_AURA) : p.aura, choices: { ...p.choices, [C.CLEARING]: "extract" } });
      if (pay > 0) next = earn(next, id, pay, "node");
      const me = next.players.get(id) ?? p;
      return speak(next, me, CLEARING_EXTRACTED(pay));
    }
    case "pass": {
      return speak(w, { ...p, choices: { ...p.choices, [C.CLEARING]: "pass" } }, CLEARING_PASSED);
    }
    default:
      return w;
  }
}

// ---------------------------------------------------------------- the Passing

export function partyWilling(p: Player): boolean {
  return p.party.nara !== "gone" && p.party.ord !== "gone";
}

/** Who claims the rite, if anyone. Cold first, then Safety. */
function hijacker(p: Player): "" | "cold" | "safety" {
  if (p.choices[C.OPERATOR] === "take" && p.current === "cold") return "cold";
  if (p.choices[C.FREEZE] === "signed" && (p.flags[F.PREPARE] ?? 0) > 0 && p.restraint < HIJACK_RESTRAINT_MAX) return "safety";
  return "";
}

/** Pure. The rule order is the contract; do not reorder. */
export function resolvePassing(w: WorldState, p: Player): PassingOutcome {
  if (!partyWilling(p) || p.readiness < READINESS_PASSING_MIN || !((p.flags[F.MORTALITY] ?? 0) > 0)) return "failed";
  if (w.gestell >= GESTELL_MELTDOWN && w.clearing.heldBy.length < CLEARING_HOLD_ANGELS) return "failed";
  if (hijacker(p)) return "hijack";
  if (p.readiness >= READINESS_APPEARANCE_MIN) return "appearance";
  return "absence";
}

/** True when this Angel already stood for the Passing this season. F.PASSING marks the first, for the campaign. */
export function passedThisSeason(w: WorldState, p: Player): boolean {
  return (p.flags[passedKey(w.season.id)] ?? 0) > 0;
}

/**
 * The rite. Once per Angel per season: the first is the campaign's Turn; the
 * ones after are the seasons of the rest of life, and every outcome is written.
 */
export function applyPassing(w: WorldState, id: string): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead) return w;
  if (p.guest || p.locked) return speak(w, p, LINES.GUEST_LOCK);
  if (passedThisSeason(w, p)) return w;
  if (!atRing(p)) return w;
  if (!((p.flags[F.PREPARE] ?? 0) > 0)) return speak(w, p, PASSING_NOT_PREPARED);

  const outcome = resolvePassing(w, p);
  const by = outcome === "hijack" ? hijacker(p) : "";
  const passing: PassingState = {
    ...w.passing,
    count: w.passing.count + 1,
    lastOutcome: outcome,
    lastBy: id,
    lastAt: w.now,
    hijackedBy: by,
    appearanceUntil: outcome === "appearance" ? w.now + SEASON_LENGTH : w.passing.appearanceUntil,
  };
  let next: WorldState = { ...w, passing, flags: { ...w.flags, [W.PASSINGS]: (w.flags[W.PASSINGS] ?? 0) + 1 } };

  let me: Player = {
    ...p,
    flags: { ...p.flags, [F.PASSING]: 1, [passedKey(w.season.id)]: 1 },
    choices: { ...p.choices, [C.PASSING]: outcome },
    history: { ...p.history, passings: p.history.passings + 1, outcomes: [...p.history.outcomes, outcome] },
  };
  next = setPlayer(next, me);

  switch (outcome) {
    case "appearance": {
      next = earn(next, id, PASSING_STIPEND, "stipend");
      me = next.players.get(id) ?? me;
      me = notice(me, `Stipend. ${PASSING_STIPEND} Bestand. For the shrines, not the hand.`, next.now, "gold");
      next = pushNews(next, NEWS_APPEARANCE(p.name));
      return speak(next, me, PASSING_APPEARANCE);
    }
    case "absence": {
      next = pushNews(next, NEWS_ABSENCE(p.name));
      return speak(next, me, PASSING_ABSENCE);
    }
    case "hijack": {
      next = pushNews(next, NEWS_HIJACK(p.name, by === "safety" ? "safety" : "cold"));
      return speak(next, me, by === "safety" ? PASSING_HIJACK_SAFETY : PASSING_HIJACK_COLD);
    }
    case "failed":
    default: {
      const mark = POSITIONS[FAILED_MARK];
      const season = w.season.id;
      const already = next.failed.some(f => f.id === FAILED_MARK && f.season === season);
      if (mark && !already) {
        const failed: FailedPassing = { id: FAILED_MARK, x: mark.x, y: mark.y, district: mark.district, season, line: FAILED_LINE };
        next = { ...next, failed: [...next.failed, failed] };
      }
      next = { ...next, clearing: { ...next.clearing, open: false, contest: next.clearing.contest ? { ...next.clearing.contest, active: false } : null } };
      next = setRing(next, "failed", id);
      next = pushNews(next, NEWS_FAILED(p.name));
      return speak(next, me, PASSING_FAILED);
    }
  }
}
