import { describe, expect, it } from "vitest";
import { browserOwns, escapeDoes, focusAfterClose, hudControlFocused } from "./keys";

/** A fake element: what it matches, whom it contains, and whether it is still in the document. */
function el(selectorsMatched: string[], children: object[] = [], isConnected = true) {
  const node = {
    children,
    isConnected,
    matches: (selector: string) => selector.split(",").some(part => selectorsMatched.includes(part.trim())),
    contains(other: object): boolean {
      return other === node || children.some(c => c === other || (c as { contains?: (o: object) => boolean }).contains?.(other) === true);
    },
  };
  return node;
}
const asEl = (node: object | null) => node as unknown as Element;

describe("hudControlFocused", () => {
  const button = el(["button"]);
  const field = el(["input"]);
  const label = el([]);
  const hud = el([], [button, field, label]);
  const outside = el(["button"]);
  it("is true for a control inside the HUD", () => {
    expect(hudControlFocused(button as unknown as Element, hud as unknown as Element)).toBe(true);
    expect(hudControlFocused(field as unknown as Element, hud as unknown as Element)).toBe(true);
  });
  it("is false for the HUD itself, a non-control inside it, a control outside it, or nothing", () => {
    expect(hudControlFocused(hud as unknown as Element, hud as unknown as Element)).toBe(false);
    expect(hudControlFocused(label as unknown as Element, hud as unknown as Element)).toBe(false);
    expect(hudControlFocused(outside as unknown as Element, hud as unknown as Element)).toBe(false);
    expect(hudControlFocused(null, hud as unknown as Element)).toBe(false);
    expect(hudControlFocused(button as unknown as Element, null)).toBe(false);
  });
});

describe("browserOwns", () => {
  it("gives the scene plain Tab on the canvas, the browser Shift+Tab, and both Tabs once a control has focus", () => {
    expect(browserOwns("Tab", false, false)).toBe(false);
    expect(browserOwns("Tab", true, false)).toBe(true);
    expect(browserOwns("Tab", false, true)).toBe(true);
    expect(browserOwns("Tab", true, true)).toBe(true);
  });
  it("gives a focused control Space and Enter, and the scene everything else", () => {
    expect(browserOwns("Space", false, true)).toBe(true);
    expect(browserOwns("Enter", false, true)).toBe(true);
    expect(browserOwns("Space", false, false)).toBe(false);
    for (const code of ["KeyW", "KeyF", "Digit1", "Escape", "KeyK"]) {
      expect(browserOwns(code, false, true), code).toBe(false);
      expect(browserOwns(code, false, false), code).toBe(false);
    }
  });
});

describe("escapeDoes", () => {
  it("blurs a focused control outside the dialogue, whether or not a dialogue is open", () => {
    expect(escapeDoes(true, false, false)).toBe("blur");
    expect(escapeDoes(true, false, true)).toBe("blur");
  });
  it("closes an open dialogue from inside it or from the canvas", () => {
    expect(escapeDoes(true, true, true)).toBe("close");
    expect(escapeDoes(false, false, true)).toBe("close");
  });
  it("does nothing on the canvas with no dialogue", () => {
    expect(escapeDoes(false, false, false)).toBe("none");
  });
});

describe("focusAfterClose", () => {
  const choice = el(["button"]);
  const panel = el(["[tabindex]"], [choice]);
  const journalTab = el(["button"]);
  const gone = el(["button"], [], false);
  const hud = el([], [journalTab, panel]);
  const body = el([]);
  it("leaves focus alone when it is not inside the dialogue", () => {
    expect(focusAfterClose(asEl(body), asEl(journalTab), asEl(panel), asEl(hud))).toBe("none");
    expect(focusAfterClose(null, asEl(journalTab), asEl(panel), asEl(hud))).toBe("none");
  });
  it("returns focus to the HUD control that had it when the dialogue opened", () => {
    expect(focusAfterClose(asEl(panel), asEl(journalTab), asEl(panel), asEl(hud))).toBe("opener");
    expect(focusAfterClose(asEl(choice), asEl(journalTab), asEl(panel), asEl(hud))).toBe("opener");
  });
  it("blurs to the canvas when the opener was the page, the HUD itself, the dialogue, or is gone", () => {
    expect(focusAfterClose(asEl(panel), asEl(body), asEl(panel), asEl(hud))).toBe("blur");
    expect(focusAfterClose(asEl(panel), null, asEl(panel), asEl(hud))).toBe("blur");
    expect(focusAfterClose(asEl(panel), asEl(hud), asEl(panel), asEl(hud))).toBe("blur");
    expect(focusAfterClose(asEl(choice), asEl(panel), asEl(panel), asEl(hud))).toBe("blur");
    expect(focusAfterClose(asEl(panel), asEl(gone), asEl(panel), asEl(hud))).toBe("blur");
  });
});
