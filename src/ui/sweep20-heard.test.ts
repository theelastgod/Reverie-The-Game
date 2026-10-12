// The player-defect sweep, round twenty (2026-10-12): the heard line across frames, as the HUD carries it (format.ts
// heardTracker). Round nineteen keyed the line on its text; the HUD kept only the stamp and the hold, so every frame read
// as a new line: a line stayed up twice as long, and one heard under a window never faded after it closed.
import { describe, expect, it } from "vitest";
import { heardTracker } from "./format";

describe("the heard line across frames", () => {
  it("one line said once is put up once and armed once", () => {
    const next = heardTracker();
    const out = [10, 10.1, 10.2, 10.3].map(now => next({ heard: "Said.", heardAt: 10, dialogue: null }, now, 8));
    expect(out.filter(o => o.show !== null).length).toBe(1);
    expect(out.filter(o => o.arm).length).toBe(1);
  });

  it("a line held under a window longer than the ttl fades when the window closes", () => {
    const next = heardTracker();
    const win = { id: "x" };
    next({ heard: "The bell.", heardAt: 10, dialogue: win }, 10.1, 8);
    next({ heard: "The bell.", heardAt: 10, dialogue: win }, 40, 8);
    expect(next({ heard: "The bell.", heardAt: 10, dialogue: null }, 41, 8).arm).toBe(true);
  });

  it("two lines in one step both go up", () => {
    const next = heardTracker();
    expect(next({ heard: "First.", heardAt: 10, dialogue: null }, 10, 8).show).toBe("First.");
    expect(next({ heard: "Second.", heardAt: 10, dialogue: null }, 10, 8).show).toBe("Second.");
  });
});
