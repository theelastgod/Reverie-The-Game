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
