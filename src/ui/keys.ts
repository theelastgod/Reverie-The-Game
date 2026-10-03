/**
 * Who owns a key press: the scene (the game's keys) or the browser (focus moving among the HUD's controls and
 * the focused control's own activation). DOM-free decisions so they can be unit tested; the scene applies them.
 *
 * On the canvas every key is the game's: Tab is the stance. Shift+Tab from the canvas is the browser's, and moves
 * focus into the HUD's controls (from their end, as the browser does); once a control has focus, Tab and
 * Shift+Tab move among the controls, Space and Enter activate the focused one, and Escape hands the keys back to
 * the game (the scene blurs the control). The game's other keys keep working with a control focused, so a
 * keyboard player who tabbed to the journal can still walk.
 */

const CONTROL = "button, a[href], input, select, textarea, [tabindex]";

/** Whether the active element is one of the HUD's controls: a button, a link, a field or anything given a tabindex. */
export function hudControlFocused(active: Element | null, hud: Element | null): boolean {
  if (!active || !hud || active === hud || !hud.contains(active)) return false;
  return active.matches(CONTROL);
}

/** Whether the browser, not the scene, should handle this key press. */
export function browserOwns(code: string, shiftKey: boolean, focused: boolean): boolean {
  if (code === "Tab") return focused || shiftKey;
  if (code === "Space" || code === "Enter") return focused;
  return false;
}

/**
 * What Escape does. A HUD control outside the dialogue hands the keys back (the scene blurs it). Inside the
 * dialogue, or with no control focused, Escape closes the dialogue when one is open (closing returns focus, see
 * `focusAfterClose`). Otherwise nothing.
 */
export function escapeDoes(focused: boolean, insideDialogue: boolean, dialogueOpen: boolean): "blur" | "close" | "none" {
  if (focused && !insideDialogue) return "blur";
  if (dialogueOpen) return "close";
  return "none";
}

/**
 * Where focus goes when the dialogue closes. Nothing when it is not inside the dialogue (a player who chose by
 * key from the canvas never left it). Else back to the HUD control that had it when the dialogue opened, when
 * that control is still in the HUD; else to the canvas (a blur, so the page's body has it).
 */
export function focusAfterClose(active: Element | null, opener: Element | null, panel: Element, hud: Element): "opener" | "blur" | "none" {
  if (!active || !panel.contains(active)) return "none";
  if (opener && opener !== hud && opener.isConnected && hud.contains(opener) && !panel.contains(opener)) return "opener";
  return "blur";
}

/** The two papers the I key uses (economy.ts ITEM_INSURANCE, ITEM_REPAIR; keys.test.ts holds them equal). */
export const PAPER_INSURANCE = "paper:insurance";
export const PAPER_REPAIR = "paper:repair";

/**
 * Which paper I uses: the first in the purse that would do something (insurance while uninsured, repair while hurt),
 * else an insurance paper, which the server refuses and keeps ("It is already done."), else none: a repair paper at
 * full health would be spent for nothing, so it stays in the purse.
 */
export function paperToUse(you: { items: readonly { id: string; kind: string; qty: number }[]; insured: boolean; hp: number }, maxHp: number): string | null {
  const papers = you.items.filter(i => i.kind === "paper" && i.qty > 0);
  const useful = papers.find(i => (i.id === PAPER_INSURANCE && !you.insured) || (i.id === PAPER_REPAIR && you.hp < maxHp));
  if (useful) return useful.id;
  return papers.find(i => i.id !== PAPER_REPAIR)?.id ?? null;
}
