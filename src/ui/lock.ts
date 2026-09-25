/**
 * The guest lock panel. Shown when `you.locked`: the mark, "A GUEST CANNOT
 * PREPARE THE GROUND", a wallet button, and, only where the city accepts it,
 * a test-link button with a serial input 1–7777. Guests may remain in the
 * Nave as spectators. The wallet's outcome is one line under the actions.
 */
import { formatSerial, parseSerial, TEST_SERIAL } from "./format";
import { walletLine, type WalletOutcome } from "../net/wallet";

export type LockPanel = {
  show(): void;
  hide(): void;
  /** The test link (serial + mock signature) is offered only when the city says it accepts it. */
  setMockLink(on: boolean): void;
  readonly visible: boolean;
  destroy(): void;
};

export function mountLock(root: HTMLElement, onLink: (serial: number) => void, onWallet: () => Promise<WalletOutcome>): LockPanel {
  const panel = root.querySelector<HTMLElement>("#hud-lock");
  const walletBtn = panel?.querySelector<HTMLButtonElement>(".lock-wallet") ?? null;
  const test = panel?.querySelector<HTMLElement>(".lock-test") ?? null;
  const linkBtn = panel?.querySelector<HTMLButtonElement>(".lock-link") ?? null;
  const stayBtn = panel?.querySelector<HTMLButtonElement>(".lock-stay") ?? null;
  const input = panel?.querySelector<HTMLInputElement>(".serial-input") ?? null;
  const note = panel?.querySelector<HTMLElement>(".lock-note") ?? null;
  let dismissed = false;
  let busy = false;

  const say = (text: string) => {
    if (!note) return;
    note.textContent = text;
    note.hidden = !text;
  };

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

  const wallet = () => {
    if (busy) return;
    busy = true;
    if (walletBtn) walletBtn.disabled = true;
    say("Asking the wallet for one signature. It costs nothing.");
    void onWallet()
      .then(outcome => say(walletLine(outcome)))
      .catch(() => say("The desk did not answer. Try again in a moment."))
      .finally(() => {
        busy = false;
        if (walletBtn) walletBtn.disabled = false;
      });
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
  walletBtn?.addEventListener("click", wallet);
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
      say("");
    },
    setMockLink(on) {
      if (test) test.hidden = !on;
    },
    destroy() {
      input?.removeEventListener("input", onInput);
      input?.removeEventListener("keydown", onKey);
      linkBtn?.removeEventListener("click", link);
      walletBtn?.removeEventListener("click", wallet);
      stayBtn?.removeEventListener("click", onStay);
      void dismissed;
    },
  };
}
