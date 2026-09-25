/**
 * The boot / title overlay. Void black, the wing-star mark, REVERIE, THE GAME.
 * Click or any key enters the city. "LINK A TEST ANGEL" pre-selects a serial
 * that the client sends once it is connected.
 */
import { parseSerial, TEST_SERIAL } from "./format";

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

  const enterBtn = title.querySelector<HTMLButtonElement>("#title-enter");
  const linkBtn = title.querySelector<HTMLButtonElement>("#title-link");
  const serialInput = title.querySelector<HTMLInputElement>("#title-serial");

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
      serialInput?.classList.add("invalid");
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

  serialInput?.addEventListener("input", () => serialInput.classList.remove("invalid"));
  if (serialInput && !serialInput.value) serialInput.value = String(TEST_SERIAL);

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
}
