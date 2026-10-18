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

/**
 * A HUD button pressed with the mouse or a finger (a click that counts presses, `detail` > 0) hands the keys back to the
 * game: focus left on it would make Space press it again and Tab walk the HUD, until Escape (the player-defect sweep,
 * round two). A keyboard activation (a click with no count) keeps its focus where the keyboard put it.
 */
export function pointerReleasesFocus(clickDetail: number): boolean {
  return clickDetail > 0;
}

/** Whether the browser, not the scene, should handle this key press. */
export function browserOwns(code: string, shiftKey: boolean, focused: boolean): boolean {
  if (code === "Tab") return focused || shiftKey;
  if (code === "Space" || code === "Enter") return focused;
  return false;
}

/**
 * A chord with Ctrl, Cmd or Alt is the browser's or the system's (Ctrl+1 to switch tabs, Ctrl+L, Cmd+S, Ctrl+Tab),
 * never a game key: the game neither acts on it nor takes it from the browser (the player-defect sweep, round
 * sixty-five). Shift stays the game's (the dodge, the heavy).
 */
export function isBrowserChord(e: { ctrlKey: boolean; metaKey: boolean; altKey: boolean; code?: string }): boolean {
  // Escape is always the game's: it closes the dialogue and hands the keys back, whatever is held (round sixty-nine).
  if (e.code === "Escape") return false;
  // AltGr (a third-level key on many layouts) reports Ctrl and Alt together: that is typing, not a shortcut.
  return e.metaKey || e.ctrlKey !== e.altKey;
}

/**
 * The modifier whose release can strand a held key: on macOS a key pressed or held with Cmd sends no keyup, so the
 * walk it started would never end. Letting go of Cmd drops every held direction. Ctrl and Alt deliver their keyups,
 * so letting go of them leaves a walk the player is still holding alone.
 */
export function releasesHeld(code: string, mac: boolean): boolean {
  // Only macOS strands keyups under Cmd; elsewhere Meta is the Windows or Super key, whose release must not stop a walk
  // still held (round sixty-nine).
  return mac && (code === "MetaLeft" || code === "MetaRight");
}

/** Whether this browser runs on macOS, where Cmd swallows keyups. */
export function onMac(nav: { platform?: string; userAgent?: string } | undefined = typeof navigator !== "undefined" ? navigator : undefined): boolean {
  return /Mac|iPhone|iPad|iPod/i.test(nav?.platform || nav?.userAgent || "");
}

/** The letters the game names its commands by (R heavy, K kit, F/E/Q the place's verbs, V flag, T truce, I paper,
 *  J journal, M map, L ledger, O sound). The walk keys stay where the hand is (WASD by position, ZQSD on AZERTY). */
export const COMMAND_LETTERS = "RKFEQVTIJMLO";

/**
 * The code a command key stands for. A command is named by its letter, so it follows the letter printed on the key,
 * whatever the layout: on AZERTY the key marked M sends Semicolon and would never open the map by position (the
 * player-defect sweep, round sixty-six). A key whose letter is no command (a non-Latin layout, or AZERTY's A on the
 * Q position) keeps its position, so every command stays reachable. Every other code passes through.
 */
export function commandCode(code: string, key: string): string {
  const letter = key.length === 1 ? key.toUpperCase() : "";
  if (letter >= "A" && letter <= "Z" && COMMAND_LETTERS.includes(letter)) return `Key${letter}`;
  return code;
}

/**
 * What the phone's Back (or the browser's) closes first, in the order a player sees them stacked: the dialogue, then
 * the ledger, then the opened field notes. Nothing open: null, and Back leaves the page as it always did (the
 * player-defect sweep, round sixty-eight: Back left the city with a panel open, mid-sentence).
 */
export function backCloses(open: { dialogue: boolean; ledger: boolean; journal: boolean }): "dialogue" | "ledger" | "journal" | null {
  if (open.dialogue) return "dialogue";
  if (open.ledger) return "ledger";
  if (open.journal) return "journal";
  return null;
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
  const useful = paperWorthUsing(you, maxHp);
  if (useful) return useful;
  return you.items.find(i => i.kind === "paper" && i.qty > 0 && i.id !== PAPER_REPAIR)?.id ?? null;
}

/** The paper a press would do something with now, or null: what the USE PAPER chip shows for (round nineteen). */
export function paperWorthUsing(you: { items: readonly { id: string; kind: string; qty: number }[]; insured: boolean; hp: number }, maxHp: number): string | null {
  return you.items.find(i => i.kind === "paper" && i.qty > 0 && ((i.id === PAPER_INSURANCE && !you.insured) || (i.id === PAPER_REPAIR && you.hp < maxHp)))?.id ?? null;
}

/** A press the socket could not send (reconnecting): said once, not per key held or per tap (the player-defect sweep, round eight). */
export const UNHEARD_LINE = "Not connected. The city did not hear that.";
export const UNHEARD_GAP_MS = 2000;
export function tellUnheard(sent: boolean, now: number, lastToldAt: number): boolean {
  return !sent && now - lastToldAt >= UNHEARD_GAP_MS;
}
