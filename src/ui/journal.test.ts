import { describe, expect, it } from "vitest";
import { journalToggled } from "./journal";

const shown = (s: { open: boolean; closed: boolean }, narrow: boolean) => (narrow ? s.open : !s.closed);

describe("the journal's toggle across a resize (the player-defect sweep, round eight)", () => {
  it("closed wide, then narrowed: the next press opens it, and every press after flips it", () => {
    let s = { open: false, closed: false };
    s = journalToggled(s.open, s.closed, false); // J at 1280: closed
    expect(shown(s, false)).toBe(false);
    // the window narrows (a tablet turned to portrait): every press now must flip what shows
    for (let i = 0; i < 4; i++) {
      const before = shown(s, true);
      s = journalToggled(s.open, s.closed, true);
      expect(shown(s, true)).toBe(!before);
    }
  });

  it("opened narrow, closed wide, narrowed again: still flips", () => {
    let s = journalToggled(false, false, true);
    expect(shown(s, true)).toBe(true);
    s = journalToggled(s.open, s.closed, false);
    expect(shown(s, false)).toBe(false);
    const before = shown(s, true);
    s = journalToggled(s.open, s.closed, true);
    expect(shown(s, true)).toBe(!before);
    // and what shows wide agrees with what showed narrow after a press
    expect(shown(s, false)).toBe(shown(s, true));
  });
});
