/**
 * The guest lock panel. Shown when `you.locked`: the mark, "A GUEST CANNOT
 * PREPARE THE GROUND", a test-link button and a serial input 1–7777.
 * Guests may remain in the Nave as spectators.
 */
import { formatSerial, parseSerial, TEST_SERIAL } from "./format";

export type LockPanel = {
  show(): void;
  hide(): void;
  readonly visible: boolean;
  destroy(): void;
};

export function mountLock(root: HTMLElement, onLink: (serial: number) => void): LockPanel {
  const panel = root.querySelector<HTMLElement>("#hud-lock");
  const linkBtn = panel?.querySelector<HTMLButtonElement>(".lock-link") ?? null;
  const stayBtn = panel?.querySelector<HTMLButtonElement>(".lock-stay") ?? null;
  const input = panel?.querySelector<HTMLInputElement>(".serial-input") ?? null;
  let dismissed = false;

  const syncLabel = () => {
    if (!linkBtn) return;
    const n = parseSerial(input?.value ?? "");
    input?.classList.toggle("invalid", n === null && (input?.value ?? "") !== "");
    linkBtn.textContent = `LINK TEST ANGEL ${formatSerial(n ?? TEST_SERIAL)}`;
  };

  const link = () => {
    const n = parseSerial(input?.value ?? "");
    if (n === null) {
      input?.classList.add("invalid");
      input?.focus();
      return;
    }
    onLink(n);
  };

  const onInput = () => syncLabel();
  const onKey = (ev: KeyboardEvent) => {
    ev.stopPropagation();
    if (ev.key === "Enter") { ev.preventDefault(); link(); }
  };
  const onStay = () => { dismissed = true; if (panel) panel.hidden = true; };

  input?.addEventListener("input", onInput);
  input?.addEventListener("keydown", onKey);
  linkBtn?.addEventListener("click", link);
  stayBtn?.addEventListener("click", onStay);
  syncLabel();

  return {
    get visible() { return !!panel && !panel.hidden; },
    show() {
      dismissed = false;
      if (panel) panel.hidden = false;
    },
    hide() {
      if (panel) panel.hidden = true;
      dismissed = false;
    },
    destroy() {
      input?.removeEventListener("input", onInput);
      input?.removeEventListener("keydown", onKey);
      linkBtn?.removeEventListener("click", link);
      stayBtn?.removeEventListener("click", onStay);
      void dismissed;
    },
  };
}
