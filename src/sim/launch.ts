/**
 * The Concern's launch as the forecast glass shows it (Phase C). The world keeps its own calendar: a season is
 * SEASON_LENGTH of world time from `w.season.startedAt`, and the launch is LAUNCH_OFFSET into it, the first hour of
 * its seventh day. Once this season's moment has gone by, the glass shows the next season's. The city puts lights out
 * behind the glass (W.DARK_LIGHTS, one per Angel who darkened the oval); past DARK_LIGHTS_THRESHOLD the glass shows no
 * date at all. Pure: the content reads it; the launch window that opens at the moment is the tick's (next).
 *
 * The switch is the city's, not the season's: W.DARK_LIGHTS is never reset (the season roll keeps world flags) and an
 * Angel puts the light out once, so seven refusals withhold the date in every season after (the synopsis's "switch with
 * no handle", thrown one refusal at a time). The date is a fixed hour of the season; Caul says the city's figure sets
 * it, which the glass does not yet bear out (the launch window decides whether the figure moves the hour).
 */
import { DARK_LIGHTS_THRESHOLD, GESTELL_MELTDOWN, LAUNCH_CLIMB_EVERY, LAUNCH_CLIMB_MAX, LAUNCH_OFFSET, LAUNCH_WINDOW, SEASON_LENGTH } from "./constants";
import { W } from "./content/ids";
import type { WorldState } from "./types";

const DAY = 24 * 60 * 60;
const pad2 = (n: number): string => String(Math.floor(n)).padStart(2, "0");

/** The next launch on the glass: this season's while it is still ahead, else the next season's. */
export function nextLaunch(w: Pick<WorldState, "now" | "season">): { season: number; at: number } {
  const here = w.season.startedAt + LAUNCH_OFFSET;
  if (w.now < here) return { season: w.season.id, at: here };
  return { season: w.season.id + 1, at: w.season.startedAt + SEASON_LENGTH + LAUNCH_OFFSET };
}

/** The date in the season's own calendar, the face every meter in the city uses: "season 2, day 7, 00:00". */
export function launchDate(season: number, offset: number = LAUNCH_OFFSET): string {
  const day = Math.floor(offset / DAY) + 1;
  const rest = offset - (day - 1) * DAY;
  return `season ${season}, day ${day}, ${pad2(rest / 3600)}:${pad2((rest % 3600) / 60)}`;
}

/** The count running down to a moment, in the meters' face: "6d 23:59:12"; "0d 00:00:00" once it is reached. */
export function countdown(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const d = Math.floor(s / DAY);
  const r = s - d * DAY;
  return `${d}d ${pad2(r / 3600)}:${pad2((r % 3600) / 60)}:${pad2(r % 60)}`;
}

/** Lights put out behind the glass, for everyone. */
export const darkLights = (w: Pick<WorldState, "flags">): number => w.flags[W.DARK_LIGHTS] ?? 0;

/** Past the threshold the glass shows no date: there are not enough lights left to show it. */
export const glassDark = (w: Pick<WorldState, "flags">): boolean => darkLights(w) >= DARK_LIGHTS_THRESHOLD;

// ---------------------------------------------------------------- the window (IV.5)

/** This season's moment on the glass. */
export const launchMoment = (w: Pick<WorldState, "season">): number => w.season.startedAt + LAUNCH_OFFSET;

/** Inside this season's hour, opened or not. */
export function inLaunchHour(w: Pick<WorldState, "now" | "season">): boolean {
  const at = launchMoment(w);
  return w.now >= at && w.now < at + LAUNCH_WINDOW;
}

/** The window is open: this season's hour, and the tick has opened it. */
export const launchOpen = (w: Pick<WorldState, "now" | "season" | "flags">): boolean =>
  inLaunchHour(w) && (w.flags[W.LAUNCH_SEASON] ?? 0) === w.season.id;

/** The open window came with no shift: the glass was past the threshold when it opened (decided once, at the opening). */
export const launchDark = (w: Pick<WorldState, "now" | "season" | "flags">): boolean =>
  launchOpen(w) && (w.flags[W.LAUNCH_DARK] ?? 0) > 0;

/**
 * What the tick owes the window now: open it (once a season, inside the hour), or climb the weather a point (one per
 * LAUNCH_CLIMB_EVERY since the moment, LAUNCH_CLIMB_MAX in all, and never to meltdown on its own), or nothing.
 */
export function launchDue(w: Pick<WorldState, "now" | "season" | "flags" | "gestell">): "open" | "climb" | null {
  if (!inLaunchHour(w)) return null;
  if ((w.flags[W.LAUNCH_SEASON] ?? 0) !== w.season.id) return "open";
  if ((w.flags[W.LAUNCH_DARK] ?? 0) > 0) return null;
  const climbed = w.flags[W.LAUNCH_CLIMBED] ?? 0;
  const owed = Math.min(LAUNCH_CLIMB_MAX, Math.floor((w.now - launchMoment(w)) / LAUNCH_CLIMB_EVERY) + 1);
  if (climbed >= owed) return null;
  if (w.gestell + 1 >= GESTELL_MELTDOWN) return null;
  return "climb";
}
