/**
 * Focus a panel takes when it appears and gives back when it goes: the dialogue, the guest lock and the credits,
 * each a dialog with `tabindex="-1"` so it can hold focus itself and assistive technology announces it with its
 * name. The decision of where focus goes back is `focusAfterClose` in keys.ts (DOM-free, unit-tested); this is
 * the DOM side of it.
 */
import { focusAfterClose } from "./keys";

export type FocusKeeper = {
  /** The panel takes focus (call after it is shown); what had focus is remembered for `release`. */
  take(): void;
  /** The panel takes focus again without forgetting the opener (a focused child was replaced). */
  retake(): void;
  /** Whether focus is inside the panel right now. */
  readonly holds: boolean;
  /** Hides the panel through `hide`, then gives focus back: to the remembered HUD control, else to the canvas. */
  release(hide: () => void): void;
};

export function focusKeeper(panel: HTMLElement | null, hud: HTMLElement): FocusKeeper {
  let opener: Element | null = null;
  const focus = () => panel?.focus({ preventScroll: true });
  return {
    take() {
      opener = document.activeElement;
      focus();
    },
    retake: focus,
    get holds() {
      return !!panel && panel.contains(document.activeElement);
    },
    release(hide) {
      const back = opener;
      opener = null;
      const where = panel ? focusAfterClose(document.activeElement, back, panel, hud) : "none";
      if (where === "blur") (document.activeElement as HTMLElement | null)?.blur();
      hide();
      // Only now: an open panel may hide other controls (the dialogue hides the prompt and the bars), and a hidden
      // control cannot take focus.
      if (where === "opener") (back as HTMLElement).focus({ preventScroll: true });
    },
  };
}
