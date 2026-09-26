/**
 * Canonical ids shared by the engine, the content and the tests.
 * Persistent once shipped. Add, never rename.
 */

/** Personal flags (Player.flags). Value 1 unless noted. */
export const F = {
  ARRIVED: "arrived", // moved for the first time
  INTAKE: "intake", // took part in the Intake Clerk's fall
  FIRST_NODE: "node:first", // decided the first node
  DESK_THREE: "desk-three", // took part in Desk Three's fall
  SECOND_NODE: "node:second", // decided the second node
  HEARD_RECORDER: "heard:recorder", // listened to the recorder after meeting Nara
  ORD_PAIR: "ord:pair", // heard Ord read the pair the second node made
  TALKED_QUILL: "talked:quill",
  TALKED_ORD: "talked:ord",
  TALKED_NARA: "talked:nara",
  MEMORIAL: "memorial", // decided the recorder
  BURIED_NARA: "buried:nara", // closed Nara's plot
  WEATHER_SAFETY: "weather:safety", // read the Office of Safety plaque
  WEATHER_ORD: "weather:ord",
  WEATHER_NARA: "weather:nara",
  WEATHER_NAMED: "weather:named", // gave the weather a name at the plaque
  BULLETIN: "bulletin", // took the hour's number off the Annex Runner (optional; the plaque reads it)
  TALKED_SEXTON: "talked:sexton", // Movement II: Pim Ashe at the wake, beside the Care shrine
  TALKED_OFFICER: "talked:officer", // Movement II: Corvin Slate in the Annex corridor, before the freeze desk
  TITHE: "tithe", // Movement II: decided the hour's tithe at the Annex tax window
  UNDER: "under", // went under (gate flag: nave↔care)
  ANGEL: "angel", // linked an Angel (guest is false)
  CARE: "care", // entered the Care
  SHRINE: "shrine", // touched the Care shrine (respawn set)
  HALL: "hall", // read own House hall plaque
  FREEZE: "freeze", // decided the Safety desk
  HISTORY: "history", // faced the serial history mark
  BOARD: "board", // read the listing board (the resistance prices Clearings)
  OPERATOR: "operator", // decided Vesper's offer
  M3: "m3", // Movement III door (gate flag: wet/ring ↔ organs)
  STRAIT: "strait",
  FOUNDRY: "foundry",
  CABLE: "cable",
  MAP: "map", // Ord put the organs together, and heard where you would cut it
  GARDEN: "garden", // buried the wreckage garden
  BELL: "bell", // Movement III: struck the hour bell once on the way to the glass
  FAILED: "failed", // saw a failed Passing
  FORGE: "forge", // decided copies with Quill
  PREPARE: "prepare", // prepared the Clearing
  MORTALITY: "mortality", // did a mortality act
  PASSING: "passing", // the Passing resolved for this Angel
  CREDITS: "credits",
  ANNOUNCE_HEARD: "kit:announce", // counters for kit uses
} as const;

/** The personal flag for a season's Passing rite: once per Angel per season. F.PASSING marks the first, for the campaign. */
export const seasonPassingFlag = (season: number): string => `passing:${season}`;

/** Key decisions (Player.choices). */
export const C = {
  FIRST_NODE: "node:first", // "extract" | "keep"
  SECOND_NODE: "node:second", // "extract" | "keep" | "split"
  QUILL_PRINT: "quill:print", // "printed" | "kept"
  ORD_LEDGER: "ord:ledger", // "entered" | "off"
  MEMORIAL: "memorial", // "voice" | "copper"
  WEATHER: "weather", // "stability" | "process" | "end"
  ANNEX: "annex:weather", // "held" | "hungry": what you told the Officer you want the weather to be, before the desk
  FREEZE: "freeze", // "signed" | "refused"
  TITHE: "tithe", // "paid" | "rode": the hour's tithe at the tax window, paid now into your House or left to the weather
  OPERATOR: "operator", // "take" | "refuse"
  MAP: "map", // "strait" | "foundry" | "cable" | "whole": where you told Ord you would cut the process; the cold desk posts that organ's hour first
  GARDEN: "garden", // "numbered" | "unnumbered": the plate on the buried garden, decided with Nara
  FORGE: "forge", // "spot" | "sell"
  MORTALITY: "mortality", // "watch" | "burial" | "lastword"
  CLEARING: "clearing", // "keep" | "extract" | "pass"
  PASSING: "passing", // PassingOutcome
} as const;

/** Shared world flags and counters (WorldState.flags). */
export const W = {
  EXTRACTIONS: "extractions",
  BURIALS: "burials",
  GARDEN_BURIED: "gardenBuried",
  CLEARING_LISTED: "clearingListed",
  VESPER_GONE: "vesperGone",
  IONE_GONE: "ioneGone",
  MEMORIAL_VOICE: "memorialVoice", // 1 = the recorder still plays
  WEATHER_NAMES: "weatherNames", // count of arrivals who named it
  BULLETIN_POSTED: "bulletinPosted", // 1 = someone pinned the Annex's own number under the plaque's word
  FREEZES: "freezes",
  PASSINGS: "passings",
} as const;

/** Quest ids. */
export const Q = {
  M1: "m1-diagnosis",
  M2: "m2-techno-feudal",
  M3: "m3-geopolitics",
  M4: "m4-the-turn",
} as const;

/** POI states (WorldState.pois[id].state). Every POI starts in the first listed state. */
export const POI_STATES: Record<string, readonly string[]> = {
  "safety-plaque": ["unnamed", "named"],
  "memorial-recorder": ["playing", "dismantled"],
  "nara-plot": ["open", "closed"],
  "going-under": ["shut", "open"],
  "guest-arena": ["open"],
  "listing-board": ["quiet", "clearing-listed"],
  "claims-desk": ["disarmed"],
  "operator-desk": ["open", "closed"],
  "hot-street": ["quiet", "hot"],
  "care-shrine": ["lit"],
  "clinic": ["open"],
  "funeral-desk": ["open"],
  "hall-mortals": ["dark", "lit"],
  "hall-sky": ["dark", "lit"],
  "hall-divinities": ["dark", "lit"],
  "hall-earth": ["dark", "lit"],
  "wreckage-garden": ["wreck", "buried"],
  "safety-desk": ["open", "frozen"],
  "tax-window": ["open"],
  "omen-terrace": ["quiet", "read"],
  "hour-bell": ["still", "struck"],
  "forecast-glass": ["dark", "lit"],
  "shrine-1": ["unkept", "kept"],
  "shrine-2": ["unkept", "kept"],
  "shrine-3": ["unkept", "kept"],
  "mute-bell": ["mute", "rung"],
  "last-god-trace": ["faint", "seen"],
  "cult-vault": ["sealed", "open"],
  "organ-strait": ["feeding", "refused", "buried"],
  "organ-foundry": ["lit", "dark"],
  "organ-cable": ["live", "quiet"],
  "cold-desk": ["open"],
  "clearing-ring": ["closed", "open", "held", "failed"],
  "seed-1": ["bare", "seeded"],
  "seed-2": ["bare", "seeded"],
  "seed-3": ["bare", "seeded"],
  "seed-4": ["bare", "seeded"],
  "crt-altar-1": ["dark", "lit"],
  "crt-altar-2": ["dark", "lit"],
  "stall-1": ["open"], "stall-2": ["open"], "stall-3": ["open"], "stall-4": ["open"], "forge-tray": ["cold", "warm"],
};

/** Earner and sink ids used in bestand effects; economy.ts pairs them. */
export const EARNERS = ["node", "spoils", "craft", "bounty", "claim", "stipend", "operator"] as const;
export const SINKS = ["tax", "repair", "restore", "listing", "tithe", "freeze", "insurance", "upkeep", "funeral", "forge", "door", "bank"] as const;
