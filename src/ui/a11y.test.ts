// The HUD's markup for assistive technology, read from index.html as text: the panels that take over the screen are
// dialogs named by their heading, what changes on its own is a live region, the four bars are meters. The render
// check (scripts/render-check.mjs) reads the same attributes in a real browser with the values the HUD keeps live.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const html = readFileSync(resolve(__dirname, "../../index.html"), "utf8");

/** The opening tag of the element with this id, attributes and all. */
function tag(id: string): string {
  const match = html.match(new RegExp(`<[a-z0-9]+[^>]*\\bid="${id}"[^>]*>`));
  expect(match, `an element with id ${id}`).not.toBeNull();
  return match![0];
}
const has = (opening: string, attribute: string) => expect(opening, attribute).toContain(attribute);

describe("the HUD's markup for assistive technology", () => {
  it("names the screen-taking panels as dialogs", () => {
    has(tag("title"), 'role="dialog"');
    has(tag("hud-dialogue"), 'role="dialog"');
    has(tag("hud-dialogue"), 'aria-labelledby="dlg-speaker"');
    has(tag("hud-dialogue"), 'aria-describedby="dlg-text dlg-wink-text"'); // the Wink is part of what the window says (the sweep, round four)
    has(tag("hud-dialogue"), 'tabindex="-1"'); // it takes focus when it opens (src/ui/dialogue.ts)
    tag("dlg-speaker");
    tag("dlg-text");
    has(tag("hud-lock"), 'role="dialog"');
    has(tag("hud-lock"), 'aria-labelledby="lock-title"');
    has(tag("hud-lock"), 'tabindex="-1"'); // it takes focus when it appears (src/ui/lock.ts)
    tag("lock-title");
    has(tag("hud-credits"), 'role="dialog"');
    has(tag("hud-credits"), 'aria-label=');
    has(tag("hud-credits"), 'tabindex="-1"'); // it takes focus when it rolls, and Enter, Space or Escape close it (src/ui/hud.ts)
  });
  it("announces what changes on its own", () => {
    has(tag("hud-connection"), 'role="status"');
    has(tag("hud-events"), 'aria-live="polite"');
    has(tag("hud-notices"), 'aria-live="polite"');
    has(tag("hud-heard"), 'aria-live="polite"');
    has(tag("dlg-text"), 'aria-live="polite"');
    // the Winke too: the Restraint's perception reaches a screen reader as it appears (the player-defect sweep, round four)
    has(tag("hud-wink"), 'aria-live="polite"');
    tag("dlg-wink-text");
    expect(html).toMatch(/<div class="dlg-wink" aria-live="polite"/);
  });
  it("gives a finger the I and V verbs as buttons, hidden until they have something to do (the player-defect sweep, round four)", () => {
    for (const id of ["hud-use", "hud-flag"]) {
      has(tag(id), 'type="button"');
      has(tag(id), "hidden");
    }
    expect(html).toMatch(/id="hud-use"[^>]*>.*USE PAPER/);
    expect(html).toMatch(/id="hud-flag"[^>]*>.*RAISE FLAG/);
    // the AUDIO chip takes the pointer like every other HUD button: a phone's only mute (the sweep, round five)
    has(tag("hud-audio"), "interactive");
  });
  it("makes the four bars meters with a name and a range", () => {
    for (const bar of ["hp", "aura", "restraint", "readiness"]) {
      const opening = html.match(new RegExp(`<div[^>]*data-bar="${bar}"[^>]*>`))?.[0] ?? "";
      expect(opening, bar).not.toBe("");
      has(opening, 'role="meter"');
      has(opening, "aria-label=");
      has(opening, 'aria-valuemin="0"');
      has(opening, "aria-valuemax=");
      has(opening, "aria-valuenow=");
    }
  });
  it("labels the map, the ledger and the journal, and groups what is in reach", () => {
    expect(html).toMatch(/<canvas[^>]*aria-label="City map"/);
    has(tag("hud-ledger-panel"), "aria-label=");
    has(tag("hud-prompt"), 'role="group"');
    has(tag("hud-prompt"), "aria-label=");
    expect(tag("hud-journal")).toMatch(/^<aside\b/); // a complementary landmark
    has(tag("hud-journal"), "aria-label=");
    expect(html).toMatch(/<ul[^>]*class="journal-quests"[^>]*aria-label=/); // the open quests are a named list
  });
});

describe("the HUD's markup speaks only the script's lines", () => {
  it("leaves the credits' roll to the script (LINES.CREDITS, filled by the HUD): the mark and no rows of its own", () => {
    const roll = html.match(/<div class="credits-roll">([\s\S]*?)<\/div>\s*<div class="credits-hint">/);
    expect(roll, "the roll").not.toBeNull();
    expect(roll![1].match(/class="credits-line[^"]*"/g)).toEqual(['class="credits-line credits-mark"']);
  });
  it("cuts the lock panel's going-under line (I.11): the title and the small copy as the script has them", () => {
    expect(html).not.toContain("The going-under is not failure.");
    expect(html).toContain("You may remain in the Nave and watch. A wallet signs one line to link an Angel; the signature costs nothing and moves nothing. No mint, no chain, no settlement.");
  });
});
