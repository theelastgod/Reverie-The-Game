/**
 * Identity: what a serial means. A serial decides the House, the messenger
 * family, the Wink school and the aura seed. None of it touches a number in
 * combat; the mappings here change perception, verbs and style only.
 */
import { ANGEL_SUPPLY, MOCK_SIG, TEST_SERIAL } from "./constants";
import { POSITIONS } from "./map";
import type { Fourfold, HistoryLog, HistoryMark, House, Messenger, WinkSchool } from "./types";

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

/** A serial with a prior hour sees its own wreckage. Only the test serial carries an authored one. */
export function serialHistoryMark(serial: number): HistoryMark | null {
  if (serial !== TEST_SERIAL) return null;
  const key = `history:${serial}`;
  const pos = POSITIONS[key];
  if (!pos) return null;
  return { id: key, serial, x: pos.x, y: pos.y, district: pos.district, line: HISTORY_LINE };
}

const OUTCOME_LINES: Record<string, string> = {
  appearance: "A prior hour. A trace came while you stood here. The city was briefly world.",
  absence: "A prior hour. Nothing came. You stood in the hole anyway.",
  hijack: "A prior hour. Somebody claimed the rite. You are still marked.",
  failed: "A prior hour. Gestell kept the weather. The hole did not open.",
};

/**
 * The mark a serial's written-back log leaves in the Care: the last Passing
 * outcome if there is one, else what the hands did. Null for a log with
 * nothing in it. The mark is perception; nothing here reaches a number.
 */
export function historyMarkFor(serial: number, log: HistoryLog, deaths = 0): HistoryMark | null {
  if (!Number.isInteger(serial) || serial < 1) return null;
  const prior = log.passings + log.buried + log.looted + deaths;
  if (prior <= 0) return null;
  const pos = POSITIONS["history:mark"];
  if (!pos) return null;
  const last = log.outcomes[log.outcomes.length - 1];
  let line = last ? OUTCOME_LINES[last] : "";
  if (!line) {
    if (log.looted > 0 && log.looted >= log.buried) line = "A prior hour. You took from the fallen here and left the body in the weather.";
    else if (log.buried > 0) line = "A prior hour. You put a body in the ground here and did not make a story of it.";
    else line = HISTORY_LINE;
  }
  return { id: `history:${serial}`, serial, x: pos.x, y: pos.y, district: pos.district, line };
}
