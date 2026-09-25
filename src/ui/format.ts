/**
 * Pure display helpers for the HUD. DOM-free so they can be unit tested.
 * Nothing here computes a number that matters: every value comes from the
 * snapshot and is only shaped for the eye.
 */
import { bearing as mapBearing, DISTRICT_BY_ID } from "../sim/map";
import { ANGEL_SUPPLY, AURA_DIM, TEST_SERIAL } from "../sim/constants";
import type { DistrictId, House, Messenger, Vec } from "../sim/types";

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
  if (aura < 60) return 2;
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

/** Marquee text: news joined with a middle dot. */
export function joinNews(news: readonly string[]): string {
  return news.map(s => s.trim()).filter(Boolean).join(" · ");
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
export function dodgeLine(cooldown: number): string {
  return cooldown > 0 ? `STEP · ${seconds(cooldown)}` : "SHIFT + MOVE · DODGE";
}

/** Stance chip text with the burn hint. */
export function stanceLine(stance: "restraint" | "storm", faceActive: boolean, burnPerSecond: number): { text: string; hint: string } {
  if (stance === "storm") {
    return { text: "STORM", hint: faceActive ? "FACE · NO BURN" : `BURNS RESTRAINT ${num(burnPerSecond)}/S` };
  }
  return { text: "RESTRAINT", hint: "SEE WINKE · WIDER STEP" };
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

/** URL of a file under public/assets, respecting the deploy base (the game ships under /play/). */
export function assetUrl(file: string, base: string = (import.meta.env && import.meta.env.BASE_URL) || "/"): string {
  return base.replace(/\/?$/, "/") + "assets/" + file.replace(/^\/+/, "");
}
