/**
 * What the city sounds like, decided from snapshots alone. A bed per district,
 * one music track chosen by where you are and what is near, effects from the
 * differences between two snapshots. Pure: the bus plays what this says.
 */
import type { Snap } from "../sim/protocol";
import type { DistrictId, Enemy } from "../sim/types";
import { POSITIONS } from "../sim/map";
import { C, F } from "../sim/content/ids";

export type BedName = `bed-${DistrictId}`;
export type MusicTrack = "title-theme" | "nave-underscore" | "grid-underscore" | "burial-elegy" | "clearing-rite" | "combat-pulse";
export type SfxName =
  | "strike" | "heavy" | "hit" | "dodge" | "wink" | "death" | "extract" | "keep" | "page"
  | "under" | "bury" | "freeze" | "appearance" | "hijack";
export type AudioScene = "title" | "city" | "credits";

export const SFX_NAMES: readonly SfxName[] = [
  "strike", "heavy", "hit", "dodge", "wink", "death", "extract", "keep", "page", "under", "bury", "freeze", "appearance", "hijack",
];

/** How close an enemy in a fighting state must be to count as combat, in px. */
export const COMBAT_RANGE = 320;
/** The plot counts as the burial street this far out, in px. */
export const PLOT_RANGE = 200;
/** The pulse starts after this much contact and stops this long after the last. */
export const COMBAT_ENTER_MS = 500;
export const COMBAT_LEAVE_MS = 4000;

const FIGHTING = new Set<Enemy["state"]>(["aggro", "telegraph", "recover"]);
const PLOT = POSITIONS["nara-plot"];

export function bedFor(snap: Pick<Snap, "district">): BedName {
  return `bed-${snap.district}`;
}

export type MusicInputs = { scene: AudioScene; district: DistrictId; combat: boolean; grief: boolean };

/** Reads the snapshot for the music decision. */
export function musicInputs(snap: Pick<Snap, "district" | "you" | "enemies">, scene: AudioScene): MusicInputs {
  const { you } = snap;
  const combat = snap.enemies.some(e => FIGHTING.has(e.state) && Math.hypot(e.x - you.x, e.y - you.y) <= COMBAT_RANGE);
  const atPlot = !!PLOT && Math.hypot(PLOT.x - you.x, PLOT.y - you.y) <= PLOT_RANGE;
  return { scene, district: snap.district, combat, grief: you.dead || snap.district === "care" || atPlot };
}

export type MusicState = { track: MusicTrack | null; pulse: boolean; contactSince: number | null; lastContact: number };
export const MUSIC_IDLE: MusicState = { track: null, pulse: false, contactSince: null, lastContact: 0 };

/** The track a place asks for before combat has a say. */
export function baseTrack(inputs: MusicInputs): MusicTrack | null {
  if (inputs.scene !== "city") return "title-theme";
  if (inputs.grief) return "burial-elegy";
  switch (inputs.district) {
    case "nave": case "annex": return "nave-underscore";
    case "wet": case "kerb": return "grid-underscore";
    case "clearing": case "ring": return "clearing-rite";
    default: return null; // the Organs are the beds alone
  }
}

/**
 * One step of the music decision. The combat pulse needs half a second of
 * contact to start and four seconds of quiet to stop, so a clerk turning on
 * its heel never flickers the music. `contactSince` is the start of the
 * current run of contact, null between runs; time may legitimately be zero.
 */
export function musicStep(state: MusicState, inputs: MusicInputs, nowMs: number): MusicState {
  let { contactSince, lastContact, pulse } = state;
  const contact = inputs.combat && inputs.scene === "city";
  if (contact) {
    if (contactSince === null) contactSince = nowMs;
    lastContact = nowMs;
  }
  if (pulse) {
    if (inputs.scene !== "city" || (!contact && nowMs - lastContact >= COMBAT_LEAVE_MS)) {
      pulse = false;
      contactSince = null;
    }
  } else if (contactSince !== null) {
    if (contact && nowMs - contactSince >= COMBAT_ENTER_MS) pulse = true;
    else if (!contact && nowMs - lastContact >= COMBAT_LEAVE_MS) contactSince = null;
  }
  const track = pulse ? "combat-pulse" : baseTrack(inputs);
  return { track, pulse, contactSince, lastContact };
}

/** The effects the difference between two snapshots calls for. Input cues (strike, heavy, dodge, page) are played by the scene and the HUD. */
export function sfxFor(prev: Snap | null, next: Snap): SfxName[] {
  if (!prev) return [];
  const a = prev.you;
  const b = next.you;
  const out: SfxName[] = [];
  if (b.dead && !a.dead) out.push("death");
  else if (b.hp < a.hp && !b.dead) out.push("hit");
  if (b.kept > a.kept) out.push("keep");
  if (b.extracted > a.extracted) out.push("extract");
  if (b.wink && b.wink !== a.wink) out.push("wink");
  if ((b.flags[F.UNDER] ?? 0) > 0 && !(a.flags[F.UNDER] ?? 0)) out.push("under");
  if (b.history.buried > a.history.buried) out.push("bury");
  if ((b.flags[F.FREEZE] ?? 0) > 0 && !(a.flags[F.FREEZE] ?? 0)) out.push("freeze");
  const passing = b.choices[C.PASSING];
  if (passing !== a.choices[C.PASSING]) {
    if (passing === "appearance") out.push("appearance");
    else if (passing === "hijack") out.push("hijack");
  }
  return out;
}
