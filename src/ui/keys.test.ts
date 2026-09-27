import { describe, expect, it } from "vitest";
import { browserOwns, hudControlFocused } from "./keys";

/** A fake element: what it matches and whom it contains. */
function el(selectorsMatched: string[], children: object[] = []) {
  const node = {
    children,
    matches: (selector: string) => selector.split(",").some(part => selectorsMatched.includes(part.trim())),
    contains(other: object): boolean {
      return other === node || children.some(c => c === other || (c as { contains?: (o: object) => boolean }).contains?.(other) === true);
    },
  };
  return node;
}

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
