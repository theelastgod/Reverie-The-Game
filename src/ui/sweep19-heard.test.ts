// r19 client probe: two lines said to a body inside one world step share a `heardAt`; the HUD's heard line is keyed on
// heardAt alone (format.ts heardStep), so the second line never goes up.
import { describe, expect, it } from "vitest";
import type { Player } from "../sim/types";
import { POSITIONS, districtAt } from "../sim/map";
import { emptyWorld, spawnGuest } from "../sim/world";
import { applyAction } from "../sim/actions";
import { snapshotFor } from "../sim/snapshot";
import { F } from "../sim/content/ids";
import { NOTICE_TTL } from "../sim/constants";
import { heardStep, type HeardState } from "./format";

describe("a second line in the same step", () => {
  it("two presses inside one step: both lines reach the screen", () => {
    const at = POSITIONS["claims-desk"] ?? POSITIONS["guest-spawn"];
    const base = spawnGuest("a", 0);
    const p: Player = { ...base, guest: false, serial: 41, name: "#0041", house: "mortals", messenger: "herald", aura: 15, auraSeed: 15, x: at.x, y: at.y, district: districtAt(at.x, at.y), flags: { ...base.flags, [F.UNDER]: 1 } };
    let w = emptyWorld();
    w = { ...w, now: 100, players: new Map(w.players).set("a", p) };
    let state: HeardState = { at: -1, held: false };
    const shown: string[] = [];
    const frame = () => {
      const you = snapshotFor(w, "a").you;
      const step = heardStep(state, you, w.now, NOTICE_TTL);
      state = step.state;
      if (step.show !== null) shown.push(step.show);
      return you;
    };
    w = applyAction(w, "a", { t: "flag" });
    const first = frame().heard;
    w = applyAction(w, "a", { t: "stance" });
    w = applyAction(w, "a", { t: "kit" }); // the Herald's Announce: its own line
    const second = frame().heard;
    expect(first).not.toBe("");
    expect(second).not.toBe(first); // the server said something new
    expect(shown).toEqual([first, second]); // both lines reach the screen
  });
});
