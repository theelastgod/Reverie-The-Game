/**
 * Pure display helpers for the HUD. DOM-free so they can be unit tested.
 * Nothing here computes a number that matters: every value comes from the
 * snapshot and is only shaped for the eye.
 */
import { bearing as mapBearing, DISTRICT_BY_ID } from "../sim/map";
import { ANGEL_SUPPLY, AURA_DIM, AURA_PRESENT, RESTRAINT_WINK_MIN, TEST_SERIAL } from "../sim/constants";
import { GUEST_LOCK } from "../sim/content/lines";
import type { DistrictId, House, Messenger, Objective, Vec } from "../sim/types";
import type { GlassView } from "../sim/protocol";
import { countdown } from "../sim/launch";

/** "#0042" for a serial; "GUEST" for none. */
export function formatSerial(serial: number | null | undefined): string {
  if (serial === null || serial === undefined || !Number.isFinite(serial) || serial <= 0) return "GUEST";
  return "#" + String(Math.floor(serial)).padStart(4, "0");
}

/** Parses a serial typed into an input; null when it is not 1..ANGEL_SUPPLY. */
export function parseSerial(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().replace(/^#/, "");
  if (!/^\d{1,5}$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isInteger(n) || n < 1 || n > ANGEL_SUPPLY) return null;
  return n;
}

export { TEST_SERIAL };

/** Roman numerals for movements and small counts. 0 or negative → "". */
export function roman(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "";
  const v = Math.floor(n);
  const table: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let rest = Math.min(v, 3999);
  let out = "";
  for (const [value, glyph] of table) {
    while (rest >= value) { out += glyph; rest -= value; }
  }
  return out;
}

/** Two-digit numerals: 3 → "03". */
export function pad2(n: number): string {
  const v = Math.max(0, Math.floor(Number.isFinite(n) ? n : 0));
  return v < 10 ? "0" + v : String(v);
}

/** Seconds for a cooldown chip: 0.62 → "0.6s", 12.4 → "12s", ≤ 0 → "". */
export function seconds(s: number): string {
  if (!Number.isFinite(s) || s <= 0) return "";
  if (s < 10) return (Math.ceil(s * 10) / 10).toFixed(1) + "s";
  return Math.ceil(s) + "s";
}

/** A cold integer for the ledger. No coin shower, no decimals. */
export function num(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return String(Math.floor(n));
}

/** 0..100 clamped percentage of a bar. */
export function pct(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

export function houseLabel(house: House): string {
  switch (house) {
    case "earth": return "House of Earth";
    case "sky": return "House of Sky";
    case "mortals": return "House of Mortals";
    case "divinities": return "House of Divinities";
    default: return "No House";
  }
}

export function messengerLabel(m: Messenger): string {
  switch (m) {
    case "herald": return "Herald";
    case "witness": return "Witness";
    case "ruin": return "Ruin-angel";
    case "dweller": return "Dweller";
    case "cybernetic": return "Cybernetic";
    case "iridescent": return "Iridescent";
    default: return "Unsealed";
  }
}

/** The messenger kit verb name. Guests have no kit. */
export function kitVerb(m: Messenger): string {
  switch (m) {
    case "herald": return "Announce";
    case "witness": return "Blitz";
    case "ruin": return "Face";
    case "dweller": return "Keep";
    case "cybernetic": return "Read";
    case "iridescent": return "Glamour";
    default: return "";
  }
}

/** Identity chip text: "GUEST · AURA 0" or "#0042 · HOUSE OF MORTALS · HERALD". */
export function identityLine(you: { guest: boolean; serial: number | null; house: House; messenger: Messenger; aura: number }): string {
  if (you.guest) return "GUEST · AURA 0";
  return `${formatSerial(you.serial)} · ${houseLabel(you.house)} · ${messengerLabel(you.messenger)}`.toUpperCase();
}

/** Display tier of the viewer's own aura. Cosmetic only; the server owns aura. */
export function auraTier(aura: number, guest: boolean): 0 | 1 | 2 | 3 {
  if (guest || !Number.isFinite(aura) || aura <= 0) return 0;
  if (aura < AURA_DIM) return 1;
  if (aura < AURA_PRESENT) return 2; // the server's tier (snapshot.ts publicPlayer), so a body reads the same everywhere
  return 3;
}

/** Ledger chip text. Guests carry only an in-instance purse. */
export function ledgerLine(you: { guest: boolean; bestand: number; banked: number; winke: number }): string {
  if (you.guest) return `BESTAND ${num(you.bestand)} · GUEST LEDGER`;
  return `BESTAND ${num(you.bestand)} · BANKED ${num(you.banked)} · WINKE ${num(you.winke)}`;
}

export function districtName(id: DistrictId): string {
  const d = DISTRICT_BY_ID[id];
  return d ? d.name : String(id);
}

export function districtFourfold(id: DistrictId): string {
  const d = DISTRICT_BY_ID[id];
  return d ? d.fourfold : "";
}

/**
 * Bearing line for the journal: map.bearing between you and the target, with
 * the target's district appended when it is not yours. Null target → "NO BEARING".
 */
export function bearingTo(from: Vec & { district?: DistrictId }, target: (Vec & { district?: DistrictId }) | null | undefined): string {
  if (!target) return "NO BEARING";
  const b = mapBearing(from, target);
  if (target.district && from.district && target.district !== from.district) {
    return `${b} · ${districtName(target.district).toUpperCase()}`;
  }
  return b;
}

const COMPASS: Record<string, string> = { E: "east", SE: "south-east", S: "south", SW: "south-west", W: "west", NW: "north-west", N: "north", NE: "north-east" };

/**
 * The map as a sentence, for the minimap canvas's label: your district, the objective with its bearing in words
 * (direction, tiles, and its district when not yours), and any district under a freeze.
 */
export function mapLabel(snap: { district: DistrictId; frozen: readonly string[]; objective: Objective | null; you: Vec }): string {
  const parts = [`City map. You are in ${districtName(snap.district)}.`];
  const target = snap.objective?.target;
  if (snap.objective && target) {
    const raw = mapBearing(snap.you, target);
    if (raw === "HERE") parts.push(`The objective, ${snap.objective.title}, is here.`);
    else {
      const [dir, tiles] = raw.split(" · ");
      const where = target.district !== snap.district ? `, in ${districtName(target.district)}` : "";
      parts.push(`The objective, ${snap.objective.title}, lies ${COMPASS[dir] ?? dir.toLowerCase()}, ${tiles.toLowerCase()}${where}.`);
    }
  } else if (snap.objective) parts.push(`The objective: ${snap.objective.title}.`);
  else parts.push("No objective.");
  const frozen = snap.frozen.map(id => districtName(id as DistrictId));
  if (frozen.length) parts.push(`Under a freeze: ${frozen.join(", ")}.`);
  return parts.join(" ");
}

/** "m1-diagnosis" → "I · DIAGNOSIS"; "bury-the-garden" → "BURY THE GARDEN". */
export function questLabel(id: string): string {
  const m = /^m([1-5])-(.+)$/.exec(id);
  if (m) return `${roman(Number(m[1]))} · ${m[2].replace(/-/g, " ").toUpperCase()}`;
  return id.replace(/[-_:]+/g, " ").trim().toUpperCase();
}

export function isSpineQuest(id: string): boolean {
  return /^m[1-5]-/.test(id);
}

/** Quest rows for the journal, spine first, then side quests alphabetically. */
export function questRows(quests: Record<string, number>): { id: string; label: string; step: string; spine: boolean }[] {
  return Object.keys(quests)
    .map(id => ({ id, label: questLabel(id), step: pad2(quests[id] + 1), spine: isSpineQuest(id) }))
    .sort((a, b) => (a.spine === b.spine ? a.id.localeCompare(b.id) : a.spine ? -1 : 1));
}

/**
 * Marquee text: news joined with a middle dot, the newest line first. The world keeps its news oldest first; the
 * marquee leads with what just happened, so a scroll that restarts on a new line, and the still head under reduced
 * motion, both begin with it.
 */
export function joinNews(news: readonly string[]): string {
  return news.map(s => s.trim()).filter(Boolean).reverse().join(" · ");
}

/** Marquee duration in seconds, scaled to the text length; never below 20 s. */
export function marqueeSeconds(text: string): number {
  return Math.max(20, Math.round(text.length * 0.16));
}

/** Weather chip text: the server's label, uppercased. */
export function weatherLine(label: string): string {
  return (label || "Weather").toUpperCase();
}

/** Dodge chip text. */
/** The dodge chip's text; on a touch screen the chip is the button, so it says only what it does. */
export function dodgeLine(cooldown: number, touch = false): string {
  if (cooldown > 0) return `STEP · ${seconds(cooldown)}`;
  return touch ? "DODGE" : "SHIFT + MOVE · DODGE";
}

/** Stance chip text with the burn hint. A guest never sees a Wink (DESIGN §2.2), so its hint promises only the step (round six). */
export function stanceLine(stance: "restraint" | "storm", faceActive: boolean, burnPerSecond: number, guest = false): { text: string; hint: string } {
  if (stance === "storm") {
    return { text: "STORM", hint: faceActive ? "FACE · NO BURN" : `BURNS RESTRAINT ${num(burnPerSecond)}/S` };
  }
  return { text: "RESTRAINT", hint: guest ? "WIDER STEP" : "SEE WINKE · WIDER STEP" };
}

/**
 * The restraint bar: the floored figure, so the number, WINKE DARK and the meter turn at the line canWink reads on the raw
 * value (world.ts), as the weather band does for the gestell (protocol.ts; the player-defect sweep, round six).
 */
export function restraintBar(restraint: number, burning: boolean): { value: number; dark: boolean; label: string } {
  const value = Math.floor(restraint);
  const dark = value < RESTRAINT_WINK_MIN;
  return { value, dark, label: burning ? "RESTRAINT · BURNING" : dark ? "RESTRAINT · WINKE DARK" : "RESTRAINT" };
}

/** Kit chip text: the verb, its cooldown or its active state. */
export function kitLine(messenger: Messenger, cooldown: number, active: boolean): string {
  const verb = kitVerb(messenger);
  if (!verb) return "NO KIT";
  if (active) return `${verb.toUpperCase()} · ACTIVE`;
  if (cooldown > 0) return `${verb.toUpperCase()} · ${seconds(cooldown)}`;
  return verb.toUpperCase();
}

/** The status chip text per connection state. */
export function statusLine(status: "connecting" | "online" | "reconnecting" | "elsewhere" | "closed"): string {
  switch (status) {
    case "connecting": return "CONNECTING";
    case "online": return "ONLINE";
    case "reconnecting": return "RECONNECTING";
    case "elsewhere": return "OPEN IN ANOTHER TAB · THIS ONE IS IDLE";
    case "closed": return "CONNECTION CLOSED";
  }
}

// ---------------------------------------------------------------- the heard line
/**
 * The heard line (what a verb or a desk says to you) goes up at once and fades
 * after a while. While a dialogue window is open the HUD hides it, so a line
 * heard in the same press that opened a window (the bell's, under Caul's
 * address) would fade unread; its fade waits until the window closes. One step
 * per frame: `show` is a new line to put up, `arm` says to start the fade now.
 */
export type HeardState = { at: number; held: boolean };

export function heardStep(
  state: HeardState,
  you: { heard: string; heardAt: number; dialogue: unknown },
  now: number,
  ttl: number,
): { state: HeardState; show: string | null; arm: boolean } {
  const open = !!you.dialogue;
  if (you.heardAt !== state.at) {
    const fresh = !!you.heard && now - you.heardAt <= ttl;
    if (!fresh) return { state: { at: you.heardAt, held: false }, show: null, arm: false };
    return { state: { at: you.heardAt, held: open }, show: you.heard, arm: !open };
  }
  if (state.held && !open) return { state: { at: state.at, held: false }, show: null, arm: true };
  return { state, show: null, arm: false };
}

// ---------------------------------------------------------------- the lock panel
/**
 * The lock panel (the wallet's way in) shows when a body is first seen locked or becomes locked, and hides when it is
 * unlocked. Dismissed with REMAIN IN THE NAVE, it comes back when the locked body presses the threshold again and hears
 * the lock line there; not for the same line at a stall or a node (the player-defect sweep, round six).
 */
export function lockStep(
  last: { locked: boolean; heardAt: number } | null,
  you: { locked: boolean; heard: string; heardAt: number },
  target: string | null,
  visible: boolean,
): "show" | "hide" | null {
  if (you.locked && (!last || !last.locked)) return "show";
  if (!you.locked) return last && last.locked ? "hide" : null;
  if (!last) return null;
  const askedAgain = you.heardAt !== last.heardAt && you.heard === GUEST_LOCK && target === "going-under";
  return askedAgain && !visible ? "show" : null;
}

// ---------------------------------------------------------------- DOM helpers
// Small write-if-changed helpers shared by the HUD modules. They take DOM
// nodes but do nothing else, so this file stays importable without a DOM.

export function setText(el: Element | null, text: string): void {
  if (el && el.textContent !== text) el.textContent = text;
}

export function show(el: HTMLElement | null, on: boolean): void {
  if (el && el.hidden === on) el.hidden = !on;
}

export function setClass(el: Element | null, name: string, on: boolean): void {
  if (el && el.classList.contains(name) !== on) el.classList.toggle(name, on);
}

export function setAttr(el: Element | null, name: string, value: string): void {
  if (el && el.getAttribute(name) !== value) el.setAttribute(name, value);
}

/** URL of a file under public/assets, respecting the deploy base (the game ships under /play/). */
export function assetUrl(file: string, base: string = (import.meta.env && import.meta.env.BASE_URL) || "/"): string {
  return base.replace(/\/?$/, "/") + "assets/" + file.replace(/^\/+/, "");
}

/**
 * The glass in a reader's journal (Snap.glass, III.7): the launch's hour with its count run down against the world's
 * clock, then the city's figure and the count in the hole, in the glass's own words. Null when the viewer is no reader.
 */
export function glassRows(glass: GlassView | null | undefined, now: number): { launch: string; figures: string } | null {
  if (!glass) return null;
  const count = glass.at > 0 ? ` · ${countdown(glass.at - now)}` : "";
  const dark = glass.launch === "no date" ? ` · ${glass.dark} lights out on the Kerb` : "";
  return { launch: `The launch: ${glass.launch}${count}${dark}`, figures: `The city's figure: ${glass.figure} · In the hole: ${glass.hole}` };
}

/**
 * The credits' rows (IV.8), from the script's roll (LINES.CREDITS): the game's name set large as a title, every other
 * line as prose under it, so the roll the player sees is the script's and cannot drift from it.
 */
export function creditRows(lines: readonly string[]): { text: string; title: boolean }[] {
  return lines.map(text => ({ text, title: text === text.toUpperCase() }));
}

/**
 * The notice rows to take out and to add, by key, from what is shown to what should be: rows that stay are left in
 * place, so the notices' live region announces a notice once, when it arrives, and never again because another came
 * or went (the player-defect sweep, round four). `add` keeps the new order; a row whose place changed is re-added.
 */
export function noticeDiff(shown: readonly string[], next: readonly string[]): { remove: string[]; add: string[] } {
  const keep = new Set<string>();
  // what stays is the longest run of `next`'s head that `shown` already ends with, in order
  for (let start = 0; start < shown.length; start++) {
    const tail = shown.slice(start);
    if (tail.length <= next.length && tail.every((k, i) => next[i] === k)) {
      for (const k of tail) keep.add(k);
      break;
    }
  }
  return { remove: shown.filter(k => !keep.has(k)), add: next.filter(k => !keep.has(k)) };
}

/**
 * The verbs the HUD's buttons must repeat for a finger (CLIENT.md: every verb has a key, and the HUD's buttons repeat
 * them): I uses a paper while the purse holds one worth using (a guest's too), V raises the flag where the street allows it and
 * lowers a raised one anywhere (the player-defect sweep, round six).
 * Without these a phone could buy a paper and never use it, and flag only while another Angel was the prompt's target
 * (the player-defect sweep, round four). Null for a chip that has nothing to do.
 */
export function chipVerbs(you: { guest: boolean; locked: boolean; dead: boolean; flagged: boolean; truceUntil: number; district: DistrictId }, paper: string | null, now: number): { use: boolean; flag: "RAISE FLAG" | "LOWER FLAG" | null } {
  const angel = !you.guest && !you.locked && !you.dead;
  const flagLegal = !!DISTRICT_BY_ID[you.district]?.flagLegal;
  return {
    // any living body that holds a paper worth using: the server lets a guest use what the stall sold it
    use: !you.dead && paper !== null,
    flag: angel && (you.flagged || flagLegal) && !(you.truceUntil > now) ? (you.flagged ? "LOWER FLAG" : "RAISE FLAG") : null,
  };
}
