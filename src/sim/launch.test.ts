import { describe, expect, it } from "vitest";
import { DARK_LIGHTS_THRESHOLD, GESTELL_MELTDOWN, LAUNCH_CLIMB_EVERY, LAUNCH_CLIMB_MAX, LAUNCH_OFFSET, LAUNCH_WINDOW, SEASON_LENGTH } from "./constants";
import { W } from "./content/ids";
import { countdown, darkLights, glassDark, inLaunchHour, launchDark, launchDate, launchDue, launchOpen, nextLaunch } from "./launch";

const at = (now: number, season = 1, startedAt = 0) => ({ now, season: { id: season, startedAt } });

describe("nextLaunch", () => {
  it("is this season's moment while it is ahead, the next season's once it has gone by", () => {
    expect(nextLaunch(at(0))).toEqual({ season: 1, at: LAUNCH_OFFSET });
    expect(nextLaunch(at(LAUNCH_OFFSET - 1))).toEqual({ season: 1, at: LAUNCH_OFFSET });
    expect(nextLaunch(at(LAUNCH_OFFSET))).toEqual({ season: 2, at: SEASON_LENGTH + LAUNCH_OFFSET });
    // a season that started late in the world's clock keeps its own calendar
    expect(nextLaunch(at(1000, 3, 900))).toEqual({ season: 3, at: 900 + LAUNCH_OFFSET });
  });
  it("lies inside its season", () => {
    expect(LAUNCH_OFFSET).toBeGreaterThan(0);
    expect(LAUNCH_OFFSET).toBeLessThan(SEASON_LENGTH);
  });
});

describe("launchDate and countdown", () => {
  it("dates the launch in the season's own calendar", () => {
    expect(launchDate(1)).toBe("season 1, day 7, 00:00");
    expect(launchDate(4, 2 * 86400 + 13 * 3600 + 5 * 60)).toBe("season 4, day 3, 13:05");
  });
  it("counts down in the meters' face and stops at zero", () => {
    expect(countdown(6 * 86400 + 23 * 3600 + 59 * 60 + 12)).toBe("6d 23:59:12");
    expect(countdown(61)).toBe("0d 00:01:01");
    expect(countdown(0.2), "a part second still counts").toBe("0d 00:00:01");
    expect(countdown(0)).toBe("0d 00:00:00");
    expect(countdown(-30)).toBe("0d 00:00:00");
  });
});

describe("the dark-light threshold", () => {
  it("withholds the date from the threshold on, not before", () => {
    expect(darkLights({ flags: {} })).toBe(0);
    expect(glassDark({ flags: {} })).toBe(false);
    expect(glassDark({ flags: { [W.DARK_LIGHTS]: DARK_LIGHTS_THRESHOLD - 1 } })).toBe(false);
    expect(glassDark({ flags: { [W.DARK_LIGHTS]: DARK_LIGHTS_THRESHOLD } })).toBe(true);
    expect(DARK_LIGHTS_THRESHOLD).toBeGreaterThan(1); // "That was one. It takes more than one."
  });
});

describe("the launch window", () => {
  const w = (now: number, flags: Record<string, number> = {}, gestell = 40) => ({ now, season: { id: 2, startedAt: 100 }, flags, gestell });
  const at = 100 + LAUNCH_OFFSET;
  const opened = { [W.LAUNCH_SEASON]: 2, [W.LAUNCH_DARK]: 0, [W.LAUNCH_CLIMBED]: 0 };

  it("is the hour from this season's moment, and open only once the tick has opened it for this season", () => {
    expect(inLaunchHour(w(at - 0.01))).toBe(false);
    expect(inLaunchHour(w(at))).toBe(true);
    expect(inLaunchHour(w(at + LAUNCH_WINDOW - 0.01))).toBe(true);
    expect(inLaunchHour(w(at + LAUNCH_WINDOW))).toBe(false);
    expect(launchOpen(w(at))).toBe(false);
    expect(launchOpen(w(at, opened))).toBe(true);
    expect(launchOpen(w(at, { ...opened, [W.LAUNCH_SEASON]: 1 })), "last season's opening does not open this one").toBe(false);
    expect(launchDark(w(at, opened))).toBe(false);
    expect(launchDark(w(at, { ...opened, [W.LAUNCH_DARK]: 1 }))).toBe(true);
    expect(launchDark(w(at + LAUNCH_WINDOW, { ...opened, [W.LAUNCH_DARK]: 1 })), "after the hour nothing is open, dark or not").toBe(false);
  });

  it("is owed an opening once a season, then a point of weather every interval up to the bound, never into meltdown, and nothing dark", () => {
    expect(launchDue(w(at - 1))).toBeNull();
    expect(launchDue(w(at))).toBe("open");
    expect(launchDue(w(at + 10, opened)), "the first point is owed at once").toBe("climb");
    expect(launchDue(w(at + 10, { ...opened, [W.LAUNCH_CLIMBED]: 1 }))).toBeNull();
    expect(launchDue(w(at + LAUNCH_CLIMB_EVERY, { ...opened, [W.LAUNCH_CLIMBED]: 1 }))).toBe("climb");
    expect(launchDue(w(at + LAUNCH_WINDOW - 1, { ...opened, [W.LAUNCH_CLIMBED]: LAUNCH_CLIMB_MAX })), "bounded").toBeNull();
    expect(LAUNCH_CLIMB_MAX).toBeLessThanOrEqual(Math.floor(LAUNCH_WINDOW / LAUNCH_CLIMB_EVERY));
    expect(launchDue(w(at + 10, opened, GESTELL_MELTDOWN - 1)), "the window does not tip the city into meltdown").toBeNull();
    expect(launchDue(w(at + 10, opened, GESTELL_MELTDOWN - 2))).toBe("climb");
    expect(launchDue(w(at + 10, { ...opened, [W.LAUNCH_DARK]: 1 })), "a dark window has no shift").toBeNull();
    expect(launchDue(w(at + LAUNCH_WINDOW, opened))).toBeNull();
  });
});
