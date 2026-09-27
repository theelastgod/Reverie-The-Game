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
    has(tag("hud-dialogue"), 'aria-describedby="dlg-text"');
    tag("dlg-speaker");
    tag("dlg-text");
    has(tag("hud-lock"), 'role="dialog"');
    has(tag("hud-lock"), 'aria-labelledby="lock-title"');
    tag("lock-title");
    has(tag("hud-credits"), 'role="dialog"');
    has(tag("hud-credits"), 'aria-label=');
  });
  it("announces what changes on its own", () => {
    has(tag("hud-connection"), 'role="status"');
    has(tag("hud-events"), 'aria-live="polite"');
    has(tag("hud-notices"), 'aria-live="polite"');
    has(tag("hud-heard"), 'aria-live="polite"');
    has(tag("dlg-text"), 'aria-live="polite"');
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
  it("labels the map and the ledger, and groups what is in reach", () => {
    expect(html).toMatch(/<canvas[^>]*aria-label="City map"/);
    has(tag("hud-ledger-panel"), "aria-label=");
    has(tag("hud-prompt"), 'role="group"');
    has(tag("hud-prompt"), "aria-label=");
  });
});
