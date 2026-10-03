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
  FIGURE: "figure", // Movement III: heard Ord's figure for last season at the glass (it was captured, not short)
  LID: "nara:lid", // Movement IV: heard Nara's confession at the ring before it was a ring (she pressed record on the first one)
  CAUL_MET: "caul:met", // Movement III: met Anselm Caul in person, in the room behind the forecast glass
  CAUL_OFFER: "caul:offer", // Movement III: heard his offer of a reader's post; the oval on the wall takes Q from here
  CAUL_ASKED: "caul:asked", // Movement III: heard the first "What did it look like" (the beat's end; the step waits for it)
  TOLD_CAUL: "caul:told", // Movement III: told him what the waking hint looked like, in your own words
  FORGE: "forge", // decided copies with Quill
  PREPARE: "prepare", // prepared the Clearing
  BRINK: "brink", // Movement IV: heard Nara at the ring before the ground was kept, with the readiness read
  GATE: "gate", // Movement IV: decided with Ord at the Care gate whether the party stands in the ring
  MORTALITY: "mortality", // did a mortality act
  PASSING: "passing", // the Passing resolved for this Angel
  HIJACK_TRACE: "hijack:trace", // the hour was claimed with a trace on the way (readiness at the appearance floor when it was taken): the altars play the Appearance, with a margin
  HIJACKED_COLD: "hijack:cold", // the hour was claimed by Cold (the desk's key or the lip's), as the resolver read it; written at a claimed rite, 1 or 0, and left standing by later rites: the mark is forever
  HIJACKED_SAFETY: "hijack:safety", // the hour was claimed by Safety's form; written at a claimed rite, 1 or 0, and left standing by later rites
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
  PARTY: "party", // "with" | "alone": whether the party stands in the ring with you (readiness) or you stand alone (restraint); the news says which
  CLEARING: "clearing", // "keep" | "extract" | "pass"
  PASSING: "passing", // PassingOutcome
  GLASS: "glass", // "read" | "dark": the reader's post taken at Caul's desk, or the light put out at the oval; one value, the two exclusive
  LIP: "lip", // "signed" | "refused": Caul's last offer at the Grid's gate to the Clearing, the hour signed for nothing; a key beside the operator's, read by the Passing's resolver
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
  BULLETIN_NUMBER: "bulletinNumber", // the figure that was pinned, for whoever reads the plaque next
  FREEZES: "freezes",
  PASSINGS: "passings",
  DARK_LIGHTS: "darkLights", // count of lights put out behind the forecast glass, one per Angel who shuttered it (the city's switch, Phase C reads it)
  GLASS_LINES: "glassLines", // count of readers whose readiness is a line on the glass
  ALTARS_FLICKER: "altarsFlicker", // world time of the last flicker of the Nave's altars (the `flicker` effect); 0 = never; carried as Snap.flicker
  FIGURE_NEWS: "figureNews", // 1 = Ord's figure has been on the marquee (once for the city)
  LAUNCH_SEASON: "launchSeason", // the season whose launch window has opened (src/sim/launch.ts; the tick opens it once a season)
  LAUNCH_DARK: "launchDark", // 1 = that window opened past the threshold of dark lights: no shift, only the vans
  LAUNCH_CLIMBED: "launchClimbed", // points the weather has climbed in that window
  LAUNCH_SHIFT: "launchShift", // the cable enforcer's shift (world.ts reconcileShift): 1 on shift at the Organs' node through a lit window, 2 going back after the hour, 0 at its desk
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
  "oval-glass": ["lit", "dark"], // the oval on the wall of the room behind the glass: dark once any Angel has put it out
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
