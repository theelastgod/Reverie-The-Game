/**
 * Spoken lines the engine references by name, plus the registers the content
 * draws on: the spectator refusals, the Winke by school, the weather names,
 * the kit copy, the credits. Second person, short, cold, concrete noun first.
 * Nobody lectures here. Nobody is quoted.
 */
import type { Messenger, WinkSchool } from "../types";

type Kit = Exclude<Messenger, "">;
type School = Exclude<WinkSchool, "">;

// ---------------------------------------------------------------- the lock and the desk

export const GUEST_LOCK = "A guest cannot prepare the ground.";
export const SPECTATOR = "You see a door. You do not see what it is for.";
export const ALREADY = "It is already done. The city does not count it twice.";
export const CANT_AFFORD = "Not enough Bestand. The city does not extend credit.";
export const CANT_USE = "Paper with no verb. It stays in the hand.";
export const FROZEN = "The freeze holds the nodes. Extraction is postponed. The Passing stays hungry.";

// ---------------------------------------------------------------- combat

export const DODGE_COPY = "You stepped through the strike.";
export const DODGE_WHIFF = "Your strike crossed an empty space.";
export const INTERRUPT = "The swing stops in the air. Readable. Same number.";
export const HIT_COPY = "The hit held. Same number. The city felt it.";
export const ARENA_HIT = "The dummy falls. Practice. No spoils. Guests are not loot.";
export const GUEST_GRIEF = "A guest is not a spoils path. The server will not strike them for you.";
export const TRUCE_ACTIVE = "The truce holds. Neither side can strike or raise a flag yet.";
export const PRACTICE_SAFE = "Practice ground. Strike the dummy; people are safe here.";
export const PVP_FLAG_REQUIRED = "Both Angels must flag. Press V on a wet street to enter.";
export const FLAG_GUEST = "A wet street. You are not flagged. You are not spoils.";
export const FLAG_WHERE = "Not here. Flags are raised on the Wet Grid, in the Organs, in the Clearing.";
export const FLAG_ON = "You flagged. Spoils are unbanked Bestand and exhibition copies. Cult and banked stay. Guests are not loot.";
export const FLAG_OFF = "You lowered the flag. The street goes back to being a street.";
export const TRUCE_COPY = "Both unflag. Twenty seconds. Spoils stay where they are.";
export const SPOILS_COPY = "Spoils from a person. Unbanked and copies. The cult hint stayed in the grave.";
export const CAMP_COPY = "Camping the same grave feeds the Gestell. Your aura thins.";
export const DUEL_COPY = "A ruin duel. The grave is the ring. The kit does not strike harder.";
export const SPECTATE_COPY = "You watched a ruin duel. Aura thickens a little. The cap holds.";
export const STORM_PRESS = "Storm. You pressed the geared. Restraint burns for it.";
export const STORM_FALLEN = "Storm. The fallen keep their rags. You took less.";

// ---------------------------------------------------------------- kits

export const KIT_GUEST = "An unsealed body has no kit. The city will not lend you one.";
export const KIT_COOLDOWN = "The kit is spent. Thirty seconds. The number does not shorten it.";

export const KIT_NEED: Record<Kit, string> = {
  herald: "Only a Herald can name a safe node, and only one that was kept.",
  witness: "Only a Witness traces wreckage, and only where someone fell.",
  ruin: "Only a Ruin-angel names the storm, and only with the wreckage in front.",
  dweller: "Only a Dweller plants a seed, and only on a kept node.",
  cybernetic: "Only a cybernetic angel reads a live node as process.",
  iridescent: "Only an Iridescent angel paints a stall as surface.",
};

export const KIT_COPY: Record<Kit, string> = {
  herald: "You announced the node. A safe light for a minute. A hint, not a weapon.",
  witness: "A flash. The last eight who fell are traced on the ground. Twenty seconds.",
  ruin: "You face the wreckage. The storm is at your back. Restraint holds while you look.",
  dweller: "A seed in the kept ground. A promise you cannot cash.",
  cybernetic: "You read the node as process. Charges, yield, tax. Reading it does not slow it.",
  iridescent: "Glamour. The stall lists you for free and the city looks up for a minute.",
};

// ---------------------------------------------------------------- claims, bank, link

export const CLAIMS_GUEST = "A period on a ledger. Guests cannot claim.";
export const CLAIMS_FILED = "Claim filed. It sits a day. Then TAKE moves it to the vault.";
export const CLAIMS_HELD = "The hold is not done. The claim sits.";
export const CLAIMS_TAKEN = "Taken. Banked. It does not drop and it does not strike.";
export const CLAIMS_CAP = "Three claims is the campaign. The desk does not file a fourth.";
export const BANKED = "Banked. It does not drop. It does not strike. The fee is the price of not dropping.";
export const LINK_ELSEWHERE = "That serial is already walking. One body per Angel.";

const HOUSE_LABEL: Record<string, string> = {
  earth: "House of Earth",
  sky: "House of Sky",
  mortals: "House of Mortals",
  divinities: "House of Divinities",
};
const MESSENGER_LABEL: Record<string, string> = {
  herald: "Herald",
  witness: "Witness",
  ruin: "Ruin-angel",
  dweller: "Dweller",
  cybernetic: "Cybernetic",
  iridescent: "Iridescent",
};

/** house and messenger may be raw ids or display names; both read cleanly. */
export function LINK_COPY(serial: number, house: string, messenger: string): string {
  const h = HOUSE_LABEL[house] ?? house;
  const m = MESSENGER_LABEL[messenger] ?? messenger;
  return `Angel #${String(serial).padStart(4, "0")} linked. ${h}. ${m} kit. Perception, not a stick.`;
}

// ---------------------------------------------------------------- the party

export const NARA_LEAVES = "Nara Vale is gone. You kept the process and lost the sexton.";
export const NARA_WAITS = "Nara Vale is waiting on the funeral street. Pay for a burial and she will speak.";
export const PARTY_BLIND = "You're looking at something I'm not.";

// ---------------------------------------------------------------- death and wreckage

export const LOOT_COPY = "You took from the fallen. Unbanked and copies. Your aura thins for it.";
export const BURY_COPY = "You put it in the ground. Readiness. The city stops counting that body.";
export const DEATH_BY = (name: string): string => `${name} did their job.`;
export const INSURANCE_USED = "The paper spent itself. You woke where you fell. Not a bigger strike.";
export const ANGEL_UNDER = "The Care is open. You go under as death, not as a cutscene. Guests stop here.";

// ---------------------------------------------------------------- weather

export const WEATHER_LABELS: Record<"clear" | "mixed" | "fat" | "meltdown", string> = {
  clear: "Clear weather. Clearings last. Winke are dense. Yield is poor.",
  mixed: "Mixed weather. The default. Nothing has decided yet.",
  fat: "Fat weather. Yield is heavy. The sacred doors dim. The storm is high.",
  meltdown: "Meltdown weather. Passings fail unless a Clearing is held. The street flags itself.",
};

/** The three names an arrival can give the weather, keyed by the stored choice. */
export const WEATHER_NAMES: Record<"stability" | "process" | "end", string> = {
  stability: "stability",
  process: "the process",
  end: "the end of world as world",
};

export const WEATHER_NAMED: Record<"stability" | "process" | "end", string> = {
  stability: "You called it stability. Safety will thank you in writing. The plaque stays as it was.",
  process: "You called it the process. Ord will not pretty it and neither did you. The plaque is struck.",
  end: "You called it the end of world as world. Nara heard. The plaque is a lie the city paid for.",
};

// ---------------------------------------------------------------- the spectator register

/** One refusal per sacred POI. The engine may prefer these over SPECTATOR when the id is known. */
export const SPECTATOR_LINES: Record<string, string> = {
  "care-shrine": "A light you cannot buy. Guests have no aura to restore.",
  clinic: "Paper for a walk back. Guests do not buy the road.",
  "funeral-desk": "Nara Vale is burying something that is not for you.",
  "hall-mortals": "A hall of names you cannot gather.",
  "hall-sky": "A sky you cannot name.",
  "hall-divinities": "A Wink you cannot name.",
  "hall-earth": "A ground you cannot name.",
  "wreckage-garden": "A garden of wreckage. You cannot prepare the ground.",
  "safety-desk": "A desk. Paper. You are not the one who signs.",
  "shrine-1": "A shrine you cannot name.",
  "shrine-2": "A shrine you cannot name.",
  "shrine-3": "A shrine you cannot name.",
  "mute-bell": "A bell with no tongue. Not yours to ring.",
  "hour-bell": "A bell on a schedule nobody signed. Not yours to strike.",
  "last-god-trace": "A door. You do not get to name what is not here.",
  "cult-vault": "A vault of things that do not list. Not for you.",
  "organ-strait": "A canal. You do not refuse organs.",
  "organ-foundry": "Heat without a nation. Not yours to unlight.",
  "organ-cable": "A line of light going out. Not for you to cut.",
  "cold-desk": "A number on a desk. You do not get to read it honest.",
  "clearing-ring": "A ring in the asphalt. You cannot prepare the ground.",
  "seed-1": "A kept tile. You do not see a seed.",
  "seed-2": "A kept tile. You do not see a seed.",
  "seed-3": "A kept tile. You do not see a seed.",
  "seed-4": "A kept tile. You do not see a seed.",
  "claims-desk": "A period on a ledger. Guests cannot claim.",
  "listing-board": "A stall of lights. You cannot afford a sky you cannot see.",
  "operator-desk": "A woman at a desk. She is not speaking to you.",
  "omen-terrace": "Asphalt. You do not see a season.",
  "forecast-glass": "Glass. You do not see the front.",
};

// ---------------------------------------------------------------- winke

/** Private lines by school. They point at what is not here; they never name it. */
export const WINKE: Record<School, string[]> = {
  hint: [
    "A hint is not a message. It is the shape a message would leave.",
    "Something passed the kerb before you. It did not stop. That was the whole visit.",
    "The bell you did not hear is the one that rang.",
    "You will not meet it. You will notice where it was standing.",
    "Every yield node is a place that used to be able to wait.",
    "A door held open for no one is still a door.",
    "The hour is not late. It is passing. Those are different words.",
  ],
  wreckage: [
    "Every grave is a season. The storm is at your back.",
    "Wreckage is not a corpse run. It is a record that someone was here as a body.",
    "The pile grows toward you. You face it. That is the whole stance.",
    "A buried thing stops being stock. That is the only conversion left.",
    "The city counts extractions. It does not count who fell.",
    "What is not here left a mark. Read the mark, not the absence.",
    "A prior hour. You stood here and left the body in the weather.",
  ],
  omen: [
    "The weather has a front. It is not on the forecast.",
    "An omen is a bell that rings before the hour and is not wrong.",
    "The sky is a schedule nobody signed.",
    "Look at the drift, not the number. The number is what Safety sells.",
    "The hour comes as a change in light. Then the light is gone. That was it.",
    "A forecast is a lie with a time on it.",
    "You bought time. You spent an hour. The signature does not get it back.",
  ],
  dwelling: [
    "A kept node is a place. An extracted node was one.",
    "You stay. The ground notices. Nothing else does, yet.",
    "A seed is a promise you cannot cash.",
    "Dwelling is not waiting. Waiting wants. Dwelling stands.",
    "The Clearing holds when people do. Nothing holds it for them.",
    "A hole in the Gestell is a room. Rooms need someone in them.",
    "Only burial makes it world again.",
  ],
  process: [
    "The number is honest. Honest is not the same as kind.",
    "The process does not want you. It wants the yield, and you are the shape of it.",
    "Every furnace is a mouth. Every mouth was a place.",
    "You can read the Gestell. Reading it does not slow it.",
    "What is not here is not in the ledger. That is the only reason it is safe.",
    "The tax is climate. The climate is you, added up.",
    "Three organs. One weather. The map is not a stick.",
  ],
  surface: [
    "A copy travels. What it copies stays in the hand that buried it.",
    "Glamour is honest about one thing: it is for sale.",
    "The face lists. The name does not.",
    "A stall is a shrine with the lights on.",
    "Aura is not a stat. It is whether the city looks up when you walk in.",
    "The last thing a surface can hold is what never appeared on it.",
    "It looks like freedom. It is a stall. The sky is already priced.",
  ],
};

// ---------------------------------------------------------------- credits

/** Names only the game and the city. Nothing else earns a line here. */
export const CREDITS: string[] = [
  "REVERIE: THE GAME",
  "The city: the Nave of Tubes, the Wet Grid, the Care, the Safety Annex, the Kerb of Hours, the Gold Ring, the Organs, the Clearing.",
  "The weather had three names. You gave it one.",
  "What you buried stayed buried. What you extracted is still on the ledger.",
  "The clerks were doing a job.",
  "Nobody arrived. Something passed.",
  "The city continues. So do you.",
  "REVERIE: THE GAME. The rest is the city.",
];
