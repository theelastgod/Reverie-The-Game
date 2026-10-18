/**
 * The boot / title overlay. Void black, the wing-star mark, REVERIE, THE GAME.
 * Click or any key enters the city. "LINK A TEST ANGEL" pre-selects a serial
 * that the client sends once it is connected.
 */
import { parseSerial, SERIAL_RANGE_LINE, TEST_SERIAL } from "./format";

let preselected: number | null = null;
let mounted = false;

/** The serial chosen on the title screen, or null when the player entered as a guest. */
export function getPreselectedSerial(): number | null {
  return preselected;
}

/** Clears the pre-selection once the client has sent the link. */
export function clearPreselectedSerial(): void {
  preselected = null;
}

/** True on a developer's machine, where the test link is offered. */
export const isLocalCity = (host: string = location.hostname): boolean => host === "localhost" || host === "127.0.0.1";

export function mountTitle(onEnter: () => void): void {
  const title = document.getElementById("title");
  const hud = document.getElementById("hud");
  if (!title) {
    if (hud) hud.hidden = false;
    onEnter();
    return;
  }
  if (mounted) return;
  mounted = true;
  const early = earlyPress(window as unknown as EarlyWindow);

  const enterBtn = title.querySelector<HTMLButtonElement>("#title-enter");
  const linkBtn = title.querySelector<HTMLButtonElement>("#title-link");
  // The test link is a development convenience; a deployed city offers wallets at the threshold instead.
  const testLink = title.querySelector<HTMLElement>(".title-link");
  if (testLink && !isLocalCity()) testLink.hidden = true;
  const serialInput = title.querySelector<HTMLInputElement>("#title-serial");
  const serialError = title.querySelector<HTMLElement>("#title-serial-error");
  // A refused serial is said in words and marked invalid, not only drawn in a colour (round fifty).
  const markSerial = (bad: boolean) => {
    serialInput?.classList.toggle("invalid", bad);
    if (bad) serialInput?.setAttribute("aria-invalid", "true"); else serialInput?.removeAttribute("aria-invalid");
    if (serialError) { serialError.textContent = bad ? SERIAL_RANGE_LINE : ""; serialError.hidden = !bad; }
  };

  let entered = false;
  const enter = (serial: number | null) => {
    if (entered) return;
    entered = true;
    preselected = serial;
    window.removeEventListener("keydown", onKey, true);
    title.hidden = true;
    if (hud) hud.hidden = false;
    onEnter();
  };

  const readSerial = (): number | null => {
    const n = parseSerial(serialInput?.value ?? "");
    if (n === null) {
      markSerial(true);
      serialInput?.focus();
      return null;
    }
    return n;
  };

  const link = () => {
    const n = readSerial();
    if (n === null) return;
    enter(n);
  };

  serialInput?.addEventListener("input", () => markSerial(false));
  if (serialInput && !serialInput.value) serialInput.value = String(TEST_SERIAL);
  // The way in has focus from the start: a screen reader lands on the title's dialog and its button, and one
  // Enter enters (any key would, but the button is what the page says).
  enterBtn?.focus({ preventScroll: true });

  enterBtn?.addEventListener("click", ev => { ev.stopPropagation(); enter(null); });
  linkBtn?.addEventListener("click", ev => { ev.stopPropagation(); link(); });
  serialInput?.addEventListener("click", ev => ev.stopPropagation());
  serialInput?.addEventListener("keydown", ev => {
    ev.stopPropagation();
    if (ev.key === "Enter") { ev.preventDefault(); link(); }
  });

  // Clicking the void enters as a guest; clicking inside the action row does not.
  title.addEventListener("click", ev => {
    const t = ev.target as HTMLElement | null;
    if (t && t.closest(".title-link")) return;
    enter(null);
  });

  function onKey(ev: KeyboardEvent) {
    if (title!.hidden) return;
    const t = ev.target as HTMLElement | null;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    if (ev.key === "Tab" || ev.key === "Shift" || ev.key === "Control" || ev.key === "Alt" || ev.key === "Meta") return;
    ev.preventDefault();
    enter(null);
  }
  window.addEventListener("keydown", onKey, true);
  // A press made before the script arrived (index.html keeps it): carried out now, as if made just now. The button the
  // catcher relabelled gets its own label back first, so a link refused for its serial does not stand there "opening".
  for (const btn of [enterBtn, linkBtn]) {
    if (btn?.dataset.label) { btn.textContent = btn.dataset.label; delete btn.dataset.label; btn.removeAttribute("aria-busy"); }
  }
  if (early === "enter") enter(null);
  else if (early === "link") link();
}

/** What index.html's early catcher kept: the window it writes to. */
export type EarlyWindow = { __titleEarly?: unknown; __titleMounted?: boolean };

/** Marks the title mounted (the catcher stands down) and returns the press it kept, if any (round seventy-three). */
export function earlyPress(w: EarlyWindow): "enter" | "link" | null {
  w.__titleMounted = true;
  const kept = w.__titleEarly;
  w.__titleEarly = undefined;
  return kept === "enter" || kept === "link" ? kept : null;
}
