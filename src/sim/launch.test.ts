import { describe, expect, it } from "vitest";
import { DARK_LIGHTS_THRESHOLD, LAUNCH_OFFSET, SEASON_LENGTH } from "./constants";
import { W } from "./content/ids";
import { countdown, darkLights, glassDark, launchDate, nextLaunch } from "./launch";

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
