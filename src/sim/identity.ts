/**
 * Identity: what a serial means. A serial decides the House, the messenger
 * family, the Wink school and the aura seed. None of it touches a number in
 * combat; the mappings here change perception, verbs and style only.
 */
import { ANGEL_SUPPLY, MOCK_SIG, TEST_SERIAL } from "./constants";
import { POSITIONS } from "./map";
import type { Fourfold, HistoryMark, House, Messenger, WinkSchool } from "./types";

export const HOUSES: readonly Fourfold[] = ["earth", "sky", "mortals", "divinities"];
export const MESSENGERS: readonly Exclude<Messenger, "">[] = ["herald", "witness", "ruin", "dweller", "cybernetic", "iridescent"];
export const SCHOOLS: readonly Exclude<WinkSchool, "">[] = ["hint", "wreckage", "omen", "dwelling", "process", "surface"];

const HOUSE_NAME: Record<Fourfold, string> = {
  earth: "House of Earth",
  sky: "House of Sky",
  mortals: "House of Mortals",
  divinities: "House of Divinities",
};

const MESSENGER_NAME: Record<Exclude<Messenger, "">, string> = {
  herald: "Herald",
  witness: "Witness",
  ruin: "Ruin-angel",
  dweller: "Dweller",
  cybernetic: "Cybernetic",
  iridescent: "Iridescent",
};

const KIT_VERB: Record<Exclude<Messenger, "">, string> = {
  herald: "Announce",
  witness: "Blitz",
  ruin: "Face the wreckage",
  dweller: "Keep",
  cybernetic: "Read the Gestell",
  iridescent: "Glamour",
};

const SCHOOL_NAME: Record<Exclude<WinkSchool, "">, string> = {
  hint: "Hint",
  wreckage: "Wreckage",
  omen: "Omen",
  dwelling: "Dwelling",
  process: "Process",
  surface: "Surface",
};

/** Serials outside the supply fold back onto it so the mappings never throw. */
function fold(serial: number): number {
  if (!Number.isFinite(serial)) return 1;
  const s = Math.floor(Math.abs(serial));
  return s < 1 ? 1 : s;
}

export function houseFor(serial: number): Fourfold {
  if (serial === TEST_SERIAL) return "mortals";
  return HOUSES[(fold(serial) - 1) % HOUSES.length];
}

export function messengerFor(serial: number): Exclude<Messenger, ""> {
  if (serial === TEST_SERIAL) return "herald";
  return MESSENGERS[(fold(serial) - 1) % MESSENGERS.length];
}

export function winkSchoolFor(serial: number): Exclude<WinkSchool, ""> {
  return SCHOOLS[(fold(serial) - 1) % SCHOOLS.length];
}

/** 8..20. A seed, not a stat. */
export function auraSeed(serial: number): number {
  return 8 + (fold(serial) % 13);
}

const WINK_SEEDS = new Set([777, 1111, 707, 4077]);

/** Palindromes and a few named serials are Wink seeds: more private lines, never more damage. */
export function isWinkSeed(serial: number): boolean {
  if (!Number.isInteger(serial) || serial < 1) return false;
  if (WINK_SEEDS.has(serial)) return true;
  const s = String(serial);
  if (s.length < 2) return false;
  return s === s.split("").reverse().join("");
}

export function formatSerial(serial: number | null): string {
  if (serial == null || !Number.isFinite(serial) || serial < 1) return "GUEST";
  return `#${String(Math.floor(serial)).padStart(4, "0")}`;
}

export function houseName(h: House): string {
  return h ? HOUSE_NAME[h] : "Unsealed";
}

export function messengerName(m: Messenger): string {
  return m ? MESSENGER_NAME[m] : "Unsealed";
}

export function kitVerb(m: Messenger): string {
  return m ? KIT_VERB[m] : "";
}

export function schoolName(s: WinkSchool): string {
  return s ? SCHOOL_NAME[s] : "Unsealed";
}

/** The only link the disarmed desk accepts: an integer serial inside the supply and the mock signature. */
export function validLink(serial: number, sig: string): boolean {
  if (typeof serial !== "number" || !Number.isInteger(serial)) return false;
  if (serial < 1 || serial > ANGEL_SUPPLY) return false;
  return typeof sig === "string" && sig === MOCK_SIG;
}

const HISTORY_LINE = "A prior hour. You stood here and left the body in the weather.";

/** A serial with a prior hour sees its own wreckage. Only the test serial carries one so far. */
export function serialHistoryMark(serial: number): HistoryMark | null {
  if (serial !== TEST_SERIAL) return null;
  const key = `history:${serial}`;
  const pos = POSITIONS[key];
  if (!pos) return null;
  return { id: key, serial, x: pos.x, y: pos.y, district: pos.district, line: HISTORY_LINE };
}
