// The HUD's markup for assistive technology, read from index.html as text: the panels that take over the screen are
// dialogs named by their heading, what changes on its own is a live region, the four bars are meters. The render
// check (scripts/render-check.mjs) reads the same attributes in a real browser with the values the HUD keeps live.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const html = readFileSync(resolve(__dirname, "../../index.html"), "utf8");
const css = readFileSync(resolve(__dirname, "./hud.css"), "utf8");
const siteCss = readFileSync(resolve(__dirname, "../../site/style.css"), "utf8");

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

describe("the HUD's stacking", () => {
  // The heard chip sat half under the lock panel saying the panel's own title (a keyboard playthrough, round twenty-three).
  // index.html puts the chip before the panel, so no sibling selector reaches it; the root's :has does. The render check
  // reads the computed visibility in Chromium with the panel shown.
  it("hides the heard chip while the guest lock is up, as it does under an open dialogue", () => {
    expect(css).toMatch(/#hud\.dialogue-open #hud-heard\s*\{\s*visibility:\s*hidden;/);
    expect(css).toMatch(/#hud:has\(#hud-lock:not\(\[hidden\]\)\) #hud-heard\s*\{\s*visibility:\s*hidden;/);
  });
  it("holds the journal's bearing to the panel's foot while a long detail scrolls (round twenty-three)", () => {
    const rule = css.match(/\.journal-bearing\s*\{([^}]*)\}/);
    expect(rule, "the bearing's rule").not.toBeNull();
    expect(rule![1]).toMatch(/position:\s*sticky;/);
    expect(rule![1]).toMatch(/bottom:\s*0;/);
    expect(rule![1]).toMatch(/background:\s*var\(--paper\);/);
  });
  it("stands the heard line on the prompt, and keeps a run of notices and a long prompt in their room (round twenty-four)", () => {
    // Both inside #hud-reach: the prompt in its flow, so two rows of prompt lift the line instead of covering it.
    const reach = html.match(/<div id="hud-reach"[^>]*>([\s\S]*?)<div id="hud-loading"/);
    expect(reach, "the reach").not.toBeNull();
    expect(reach![1]).toContain('id="hud-heard"');
    expect(reach![1]).toContain('id="hud-prompt"');
    const rule = (sel: string) => css.match(new RegExp(`(?:^|\\n)\\${sel}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
    expect(rule(".prompt")).toMatch(/position:\s*relative;/);
    expect(rule(".heard")).toMatch(/bottom:\s*calc\(100% \+ 8px\);/);
    expect(css).toMatch(/\.prompt-verbs \{[^}]*flex-wrap:\s*wrap;/);
    expect(css).toMatch(/\.notices \{[^}]*justify-content:\s*flex-end;[^}]*overflow:\s*hidden;/);
    expect(rule(".hud-left")).toMatch(/max-height:/);
  });
  it("keeps a short screen in its room: a phone on its side, a laptop at 200% (round thirty-three)", () => {
    // The width rules assume some 600px of height; a block by height takes over below 500 (Chromium measures it in the render check).
    const short = css.match(/@media \(max-height: 500px\) and \(min-width: 601px\) \{([\s\S]*?)\n\}/);
    expect(short, "the short block").not.toBeNull();
    const body = short![1];
    expect(body).toMatch(/\.marquee \{ display: none; \}/);
    expect(body).toMatch(/\.hud-left \{[^}]*top: var\(--below-top\);[^}]*width: 240px;/);
    expect(body).toMatch(/\.bars \{[^}]*grid-template-columns: 1fr 1fr;/);
    expect(body).toMatch(/\.reach \{[^}]*left: calc\(var\(--gutter\) \+ 240px \+ 8px\);[^}]*right: calc\(var\(--gutter\) \+ 130px \+ 8px\);/);
    // Only a heard line on the screen sends the banners down, and by opacity so the strip stays a live region (round thirty-six).
    expect(body).toMatch(/#hud:not\(\.dialogue-open\):not\(:has\(#hud-lock:not\(\[hidden\]\)\)\):has\(#hud-heard:not\(\[hidden\]\)\) #hud-events \{ opacity: 0; \}/);
    expect(body).not.toMatch(/#hud-events \{ visibility: hidden; \}/);
    // The layout reads --below-top before hud.ts first measures the chips: a default stands outside every media block.
    expect(css).toMatch(/\n#hud \{ --below-top: 150px; --bars-h: 136px; --verbs-h: 36px; \}/);
    // Narrow, the journal is a tab at the minimap's width; wide, it stays open and the reach keeps clear of its 214px.
    expect(css).toMatch(/@media \(max-height: 500px\) and \(min-width: 601px\) and \(max-width: 1100px\) \{[^@]*\.journal \{ width: 130px;/);
    expect(css).toMatch(/@media \(max-height: 500px\) and \(min-width: 1101px\) \{\s*\.reach, \.events \{ right: calc\(var\(--gutter\) \+ 214px \+ 8px\); \}/);
    // The short blocks come before the coarse-pointer rule, so a finger still gets the dodge chip.
    expect(css.indexOf("(max-height: 500px)")).toBeLessThan(css.indexOf("@media (pointer: coarse)"));
  });
  it("opens the journal to the height under the chips on a short narrow screen (round thirty-five)", () => {
    const narrow = css.match(/@media \(max-height: 500px\) and \(min-width: 601px\) and \(max-width: 1100px\) \{([\s\S]*?)\n\}/);
    expect(narrow, "the short narrow block").not.toBeNull();
    expect(narrow![1]).toMatch(/\.journal\.open \{ top: var\(--below-top\); width: 260px; max-height: calc\(100vh - var\(--below-top\) - 16px\); \}/);
    expect(narrow![1]).toMatch(/\.journal\.open \.journal-plate, \.journal\.open \.journal-loop \{ display: none; \}/);
    expect(narrow![1]).toMatch(/#hud:has\(#hud-journal\.open\) #hud-events \{ right: calc\(var\(--gutter\) \+ 260px \+ 8px\); \}/);
  });
  it("sets the small grey text on the void at AA contrast (round thirty-nine)", () => {
    // #5a5a5a on #0a0a0a read 2.87:1 for the title's guest line and the credits' way back; the void's grey is lighter.
    expect(css).toMatch(/--muted-on-void: #8a8a8a;/);
    // The serial label's class is shared with the lock panel, which is paper: only the title's copy takes the void grey
    // (round forty-two; the render check measures both).
    expect(css).toMatch(/\n#title \.title-serial-label \{ color: var\(--muted-on-void\); \}/);
    expect(css.match(/\n\.title-serial-label \{([^}]*)\}/)![1]).toMatch(/color: var\(--muted\);/);
    for (const sel of [".title-temp", ".title-fine", ".title-foot", ".credits-hint"]) {
      const rule = css.match(new RegExp(`\\n\\${sel} \\{([^}]*)\\}`));
      expect(rule, sel).not.toBeNull();
      expect(rule![1], sel).toMatch(/color: var\(--muted-on-void\);/);
    }
  });
  it("gives the landing page's nav links a 24px tap target (round forty-one)", () => {
    // "Controls" and "Rules" were 17px tall: inline text with no padding. The render check measures every link.
    const rule = siteCss.match(/\nnav a \{([^}]*)\}/);
    expect(rule, "the nav link rule").not.toBeNull();
    expect(rule![1]).toMatch(/display: inline-block;/);
    expect(rule![1]).toMatch(/padding: 0\.35rem 0;/);
  });
  it("hides the title's test row when a deployed city says so (round thirty-six)", () => {
    // `.title-link { display: flex }` beat the attribute: title.ts set hidden and the row stayed on a deployed title.
    expect(css).toMatch(/\.title-link \{[^}]*display: flex;/);
    expect(css).toMatch(/\n#title \[hidden\] \{ display: none; \}/);
  });
  it("stands the banners down under an open journal below 700 wide (round thirty-six)", () => {
    expect(css).toMatch(/@media \(max-height: 500px\) and \(min-width: 601px\) and \(max-width: 700px\) \{\s*#hud:has\(#hud-journal\.open\) #hud-events \{ opacity: 0; \}/);
  });
  it("keeps the title's guest line on a short screen (round thirty-four)", () => {
    // The title stays centred and scrolls when it cannot fit; under 560px tall the mark and the word give up height.
    expect(css).toMatch(/#title \{ overflow-y: auto; justify-content: safe center; \}/);
    const short = css.match(/@media \(max-height: 560px\) \{([\s\S]*?)\n\}/);
    expect(short, "the short title block").not.toBeNull();
    expect(short![1]).toMatch(/\.title-mark \{ width: 72px; height: 72px;/);
    expect(short![1]).toMatch(/\.title-word \{ font-size: clamp\(2\.5rem, 12vh, 6\.5rem\); \}/);
    expect(html).toMatch(/<p class="title-fine">Guests play Movement I\./);
  });

  it("stacks a phone's reach and banners on the bars' measured height, not a guess (round forty-seven)", () => {
    const phone = css.match(/@media \(max-width: 600px\) \{([\s\S]*?)\n\}/);
    expect(phone).not.toBeNull();
    expect(phone![1]).toMatch(/\.reach \{[^}]*bottom: calc\(var\(--marquee-h\) \+ 16px \+ var\(--verbs-h\) \+ 8px \+ var\(--bars-h\)\);/);
    expect(phone![1]).toMatch(/\.events \{[^}]*bottom: calc\(var\(--marquee-h\) \+ 16px \+ var\(--verbs-h\) \+ 8px \+ var\(--bars-h\) \+ 56px \+ 56px\);/);
    expect(phone![1]).not.toMatch(/\+ 136px/);
  });

  it("stacks a phone on the verbs' measured height and fits the narrowest phone's chips (round forty-eight)", () => {
    expect(css).toMatch(/\n#hud \{ --below-top: 150px; --bars-h: 136px; --verbs-h: 36px; \}/);
    const phone = css.match(/@media \(max-width: 600px\) \{([\s\S]*?)\n\}/)![1];
    expect(phone).not.toMatch(/\+ 44px|- 220px|- 314px/);
    expect(phone).toMatch(/\.bars \{[^}]*bottom: calc\(var\(--marquee-h\) \+ 16px \+ var\(--verbs-h\) \+ 8px\);/);
    expect(phone).toMatch(/\.chip-connection \{ z-index: 1; \}/);
    expect(css).toMatch(/\.chip-connection \{[^}]*pointer-events: none;/);
    const narrow = css.match(/@media \(max-width: 360px\) \{([\s\S]*?)\n\}/);
    expect(narrow).not.toBeNull();
    expect(narrow![1]).toMatch(/\.hud-top \.chip \{ padding: 0 6px;/);
    expect(narrow![1]).toMatch(/\.hud-verbs \.chip \{ padding: 0 6px;/);
  });

  it("keeps the bars' fill under forced colours (round forty-nine)", () => {
    const forced = css.match(/@media \(forced-colors: active\) \{([\s\S]*?)\n\}/);
    expect(forced).not.toBeNull();
    expect(forced![1]).toMatch(/\.bar-fill \{ forced-color-adjust: none; background: CanvasText !important; \}/);
  });
});
