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
import { DARK_LIGHTS_THRESHOLD, LAUNCH_OFFSET, SEASON_LENGTH } from "./constants";
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
