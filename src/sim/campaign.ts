export type NpcId = "nara" | "quill" | "ord" | "ione" | "vesper";

export type Npc = {
  id: NpcId;
  name: string;
  role: string;
  x: number;
  y: number;
};

export type Sign = {
  id: string;
  title: string;
  text: string;
  x: number;
  y: number;
};

export type Rite = {
  id: string;
  kind: "burial" | "going-under" | "garden";
  x: number;
  y: number;
  done: boolean;
};

export type Beats = {
  nara: boolean;
  quill: boolean;
  ord: boolean;
  burial: boolean;
  under: boolean;
  care: boolean;
  hall: boolean;
  freeze: boolean;
  market: boolean;
  yield: boolean;
  cold: boolean;
  refuse: boolean;
  garden: boolean;
  m3: boolean;
  strait: boolean;
  foundry: boolean;
  cable: boolean;
  map: boolean;
  failed: boolean;
  forge: boolean;
  spot: boolean;
  sold: boolean;
  lastWord: boolean;
  clearing: boolean;
  passing: boolean;
  errand: boolean;
  cableQuiet: boolean;
  sextonAsk: boolean;
  sexton: boolean;
  hangAsk: boolean;
  hang: boolean;
  standing: boolean;
  clockOut: boolean;
  foundryAsk: boolean;
  foundryDark: boolean;
  annexHome: boolean;
  straitRefuse: boolean;
  ordWitness: boolean;
  unflagAsk: boolean;
  unflag: boolean;
  canalAsk: boolean;
  canalBury: boolean;
  yieldEmpty: boolean;
  cableDark: boolean;
  skyStanding: boolean;
  earthStanding: boolean;
  divStanding: boolean;
  ioneMark: boolean;
  fourfold: boolean;
  lastGod: boolean;
  ordLast: boolean;
  naraGodAsk: boolean;
  naraGod: boolean;
  quillNoPrint: boolean;
  restraint: boolean;
  vesperNoGod: boolean;
  absenceHour: boolean;
  naraStay: boolean;
  hijacked: boolean;
  storm: boolean;
  blitz: boolean;
  cyber: boolean;
  glamour: boolean;
  dwell: boolean;
  funeral: boolean;
  naraGone: boolean;
  ordGone: boolean;
  quillGone: boolean;
  vesperGone: boolean;
  credits: boolean;
  season: boolean;
  winkBlind: boolean;
  ruinBack: boolean;
  arena: boolean;
  screening: boolean;
  participant: boolean;
  founder: boolean;
  bounty: boolean;
  stormPress: boolean;
  winkSeed: boolean;
  log: boolean;
  still: boolean;
  bracket: boolean;
  naraPerson: boolean;
  quillPerson: boolean;
  ordPerson: boolean;
  vesperPerson: boolean;
  hitStop: boolean;
  addressed: boolean;
  party: boolean;
  people: boolean;
  parted: boolean;
  heavy: boolean;
  truce: boolean;
  handoff: boolean;
  carePeople: boolean;
  shrinePeople: boolean;
  safetyPeople: boolean;
  deskPeople: boolean;
  hallPeople: boolean;
  clearingPeople: boolean;
  wetPeople: boolean;
  stallPeople: boolean;
  foundryPeople: boolean;
  straitPeople: boolean;
  cablePeople: boolean;
  organsPeople: boolean;
  vesperPeople: boolean;
  m3People: boolean;
  screeningPeople: boolean;
  annexPeople: boolean;
  arenaPeople: boolean;
  underPeople: boolean;
  gardenPeople: boolean;
  burialPeople: boolean;
  weatherPeople: boolean;
  navePeople: boolean;
  creditsPeople: boolean;
  stillPeople: boolean;
  seasonPeople: boolean;
  bracketPeople: boolean;
  logPeople: boolean;
  founderPeople: boolean;
  roomsPeople: boolean;
  stormPeople: boolean;
  bountyPeople: boolean;
  flagPeople: boolean;
  trucePeople: boolean;
  handoffPeople: boolean;
  vaultPeople: boolean;
  insurancePeople: boolean;
  funeralPeople: boolean;
  restorePeople: boolean;
  keepPeople: boolean;
  tithePeople: boolean;
  freezePeople: boolean;
  repairPeople: boolean;
  listingPeople: boolean;
  marketPeople: boolean;
  hangPeople: boolean;
  restraintPeople: boolean;
  dodgePeople: boolean;
  heavyPeople: boolean;
  hitStopPeople: boolean;
  spectatePeople: boolean;
  lastWordPeople: boolean;
  duelPeople: boolean;
  campPeople: boolean;
  passingPeople: boolean;
  claimsPeople: boolean;
  filePeople: boolean;
  takePeople: boolean;
  bankPeople: boolean;
  stormPressPeople: boolean;
  fallenPeople: boolean;
  spoilsPeople: boolean;
  unflagPeople: boolean;
  secondsPeople: boolean;
  streetPeople: boolean;
  griefPeople: boolean;
  kitPeople: boolean;
  practicePeople: boolean;
  dummyPeople: boolean;
  gearedPeople: boolean;
  serialPeople: boolean;
  bandPeople: boolean;
  numberPeople: boolean;
  skillPeople: boolean;
  traitPeople: boolean;
  tokenPeople: boolean;
  fairPeople: boolean;
  visiblePeople: boolean;
  auraPeople: boolean;
  presencePeople: boolean;
  winkPeople: boolean;
  bestandPeople: boolean;
  cultPeople: boolean;
  copyPeople: boolean;
  bankedPeople: boolean;
  unbankedPeople: boolean;
  sinkPeople: boolean;
  yieldPeople: boolean;
  taxPeople: boolean;
  gestellPeople: boolean;
  climatePeople: boolean;
  extractPeople: boolean;
  maxPeople: boolean;
  heatPeople: boolean;
  fatPeople: boolean;
  poorPeople: boolean;
  blockPeople: boolean;
  soloPeople: boolean;
  dwellPeople: boolean;
  tracePeople: boolean;
  failPeople: boolean;
  holePeople: boolean;
  stipendPeople: boolean;
  hijackPeople: boolean;
  absencePeople: boolean;
  waitPeople: boolean;
  stayPeople: boolean;
  willingPeople: boolean;
  emptyPeople: boolean;
};

export type WeatherHeard = {
  safety: boolean;
  nara: boolean;
  ord: boolean;
};

export type Clerk = {
  id: string;
  name: string;
  x: number;
  y: number;
  hp: number;
  telegraph: number;
  dummy?: boolean;
};

export type Poi = {
  id: string;
  name: string;
  x: number;
  y: number;
  kind:
    | "unnamed-weather"
    | "named-weather"
    | "care-shut"
    | "care-open"
    | "house-hall"
    | "safety-annex"
    | "safety-frozen"
    | "safety-annex-home"
    | "annex-route"
    | "clearing-listed"
    | "operator-desk"
    | "m3-shut"
    | "m3-open"
    | "wreckage-garden"
    | "organ-strait"
    | "organ-strait-refused"
    | "organ-strait-buried"
    | "organ-strait-divinities"
    | "organ-foundry"
    | "organ-foundry-dark"
    | "organ-foundry-earth"
    | "organ-cable"
    | "organ-cable-quiet"
    | "organ-cable-dark"
    | "organ-cable-sky"
    | "operator-vacant"
    | "operator-no-god"
    | "forge-tray"
    | "clearing-ring"
    | "clearing-held"
    | "clearing-appear"
    | "clearing-credits"
    | "clearing-absence"
    | "clearing-empty"
    | "clearing-hijack"
    | "clearing-failed"
    | "clearing-storm"
    | "wet-grid"
    | "wet-grid-cult"
    | "claims-desk"
    | "claims-vault"
    | "shrine-upkeep"
    | "sexton-mark"
    | "stall-dark"
    | "stall-glamour"
    | "house-standing"
    | "house-bounty"
    | "fourfold-held"
    | "last-god-absent"
    | "last-god-buried"
    | "last-god-unlisted"
    | "shrine-restraint"
    | "shrine-stance"
    | "desk-empty"
    | "yield-empty"
    | "ione-gone"
    | "blitz-trace"
    | "storm-back"
    | "process-read"
    | "clearing-seed"
    | "nara-gone"
    | "ord-gone"
    | "quill-gone"
    | "vesper-gone"
    | "wet-grid-season"
    | "wet-grid-bracket"
    | "party-blind"
    | "guest-arena"
    | "screening"
    | "screening-participant"
    | "screening-founder"
    | "screening-log"
    | "storm-progress"
    | "wink-seed"
    | "production-still"
    | "nara-person"
    | "quill-person"
    | "ord-person"
    | "vesper-person"
    | "party-walk"
    | "party-parted"
    | "heavy"
    | "truce"
    | "stall-handoff"
    | "care-people"
    | "shrine-people"
    | "safety-people"
    | "desk-people"
    | "hall-people"
    | "clearing-people"
    | "wet-people"
    | "stall-people"
    | "foundry-people"
    | "strait-people"
    | "cable-people"
    | "organs-people"
    | "vesper-people"
    | "m3-people"
    | "screening-people"
    | "annex-people"
    | "arena-people"
    | "under-people"
    | "garden-people"
    | "burial-people"
    | "weather-people"
    | "nave-people"
    | "credits-people"
    | "still-people"
    | "season-people"
    | "bracket-people"
    | "log-people"
    | "founder-people"
    | "rooms-people"
    | "storm-people"
    | "bounty-people"
    | "flag-people"
    | "truce-people"
    | "handoff-people"
    | "vault-people"
    | "insurance-people"
    | "funeral-people"
    | "restore-people"
    | "keep-people"
    | "tithe-people"
    | "freeze-people"
    | "repair-people"
    | "listing-people"
    | "market-people"
    | "hang-people"
    | "restraint-people"
    | "dodge-people"
    | "heavy-people"
    | "hitstop-people"
    | "spectate-people"
    | "lastword-people"
    | "duel-people"
    | "camp-people"
    | "passing-people"
    | "claims-people"
    | "file-people"
    | "take-people"
    | "bank-people"
    | "stormpress-people"
    | "fallen-people"
    | "spoils-people"
    | "unflag-people"
    | "seconds-people"
    | "street-people"
    | "grief-people"
    | "kit-people"
    | "practice-people"
    | "dummy-people"
    | "geared-people"
    | "serial-people"
    | "band-people"
    | "number-people"
    | "skill-people"
    | "trait-people"
    | "token-people"
    | "fair-people"
    | "visible-people"
    | "aura-people"
    | "presence-people"
    | "wink-people"
    | "bestand-people"
    | "cult-people"
    | "copy-people"
    | "banked-people"
    | "unbanked-people"
    | "sink-people"
    | "yield-people"
    | "tax-people"
    | "gestell-people"
    | "climate-people"
    | "extract-people"
    | "max-people"
    | "heat-people"
    | "fat-people"
    | "poor-people"
    | "block-people"
    | "solo-people"
    | "dwell-people"
    | "trace-people"
    | "fail-people"
    | "hole-people"
    | "stipend-people"
    | "hijack-people"
    | "absence-people"
    | "wait-people"
    | "stay-people"
    | "willing-people"
    | "empty-people"
    | "ione-people"
    | "hit-stop"
    | "addressed";
};

export type PassingOutcome = "" | "appearance" | "absence" | "hijack" | "failed";

export type Passing = {
  ready: number;
  starved: boolean;
  outcome: PassingOutcome;
};

export const GUEST_LOCK = "A guest cannot prepare the ground.";
export const GUEST_ARENA = { id: "guest-arena", x: 360, y: 600 };
export const ARENA_COPY =
  "Practice. No spoils. Guests are not loot. The dummy is a job, not a grave. Combat is not. This was not a fetch.";
export const WINK_ARENA = "A guest arena. Presence, not a stick. The token does not strike.";
export const ARENA_HELD = "The dummy already holds. Practice. No spoils.";
export const ARENA_HIT = "The dummy falls. Practice. No spoils. Guests are not loot.";

export const ARENA_PLAQUE: Sign = {
  id: GUEST_ARENA.id,
  title: "Guest arena",
  text: "Practice. No spoils. Guests are not loot. The number does not strike.",
  x: GUEST_ARENA.x,
  y: GUEST_ARENA.y,
};

export const ARENA_OPEN_PLAQUE: Sign = {
  id: GUEST_ARENA.id,
  title: "Guest arena — practice",
  text: "The dummy holds. No spoils. The number does not strike.",
  x: GUEST_ARENA.x,
  y: GUEST_ARENA.y,
};

export function arenaPoi(open = false): Poi {
  return {
    id: GUEST_ARENA.id,
    name: open ? "Guest arena — practice" : "Guest arena",
    x: GUEST_ARENA.x,
    y: GUEST_ARENA.y,
    kind: "guest-arena",
  };
}

export function arenaDummy(): Clerk {
  return {
    id: "dummy-practice",
    name: "Practice dummy",
    x: GUEST_ARENA.x,
    y: GUEST_ARENA.y + 40,
    hp: CLERK_HP,
    telegraph: 0,
    dummy: true,
  };
}

export const SCREENING = { id: "screening", x: 840, y: 280 };
export const SCREENING_COPY =
  "A dispatch. Public screening. The Last God is a room, not a stick. Combat is not. This was not a fetch.";
export const WINK_SCREENING = "Observer proximity. A screening, not a stick. The token does not strike.";
export const SCREENING_HELD = "The dispatch already holds. The screening stays public.";
export const SCREENING_SPECTATOR = "A screen. You do not get the dispatch.";

export const SCREENING_PLAQUE: Sign = {
  id: SCREENING.id,
  title: "Public screening",
  text: "Dispatch. Observer room. The number does not strike.",
  x: SCREENING.x,
  y: SCREENING.y,
};

export const SCREENING_OPEN_PLAQUE: Sign = {
  id: SCREENING.id,
  title: "Dispatch",
  text: "The Last God screens. Proximity, not a stick. The number does not strike.",
  x: SCREENING.x,
  y: SCREENING.y,
};

export function screeningPoi(open = false): Poi {
  return {
    id: SCREENING.id,
    name: open ? "Dispatch" : "Public screening",
    x: SCREENING.x,
    y: SCREENING.y,
    kind: "screening",
  };
}

export type FilmRoom = "" | "observer" | "participant" | "founder";

export const PARTICIPANT_COPY =
  "Participant room. You went under. The Last God is a room you stand in. Combat is not. This was not a fetch.";
export const WINK_PARTICIPANT = "Participant proximity. A room, not a stick. The token does not strike.";
export const PARTICIPANT_NEED = "Go under first. Observer dispatch is not Participant.";
export const PARTICIPANT_HELD = "The Participant room already holds. Founder is not this door.";
export const PARTICIPANT_SPECTATOR = "A darker screen. You do not get this room.";

export const PARTICIPANT_PLAQUE: Sign = {
  id: SCREENING.id,
  title: "Participant room",
  text: "You stood in the hour. Proximity, not a stick. The number does not strike.",
  x: SCREENING.x,
  y: SCREENING.y,
};

export function participantPoi(): Poi {
  return {
    id: SCREENING.id,
    name: "Participant room",
    x: SCREENING.x,
    y: SCREENING.y,
    kind: "screening-participant",
  };
}

export const FOUNDER_COPY =
  "Founder room. Clearing watches. Passing rites. Credits. The Last God is a room you keep. Combat is not. This was not a fetch.";
export const WINK_FOUNDER = "Founder proximity. A watch, not a stick. The token does not strike.";
export const FOUNDER_NEED = "Credits first. Participant is not Founder. Clearing watches wait on the hour.";
export const FOUNDER_HELD = "The Founder room already holds. The MMO is the rest of life.";
export const FOUNDER_SPECTATOR = "A last screen. You do not get this room.";

export const FOUNDER_PLAQUE: Sign = {
  id: SCREENING.id,
  title: "Founder room",
  text: "Clearing watches. Passing rites. Credits. Proximity, not a stick. The number does not strike.",
  x: SCREENING.x,
  y: SCREENING.y,
};

export function founderPoi(): Poi {
  return {
    id: SCREENING.id,
    name: "Founder room",
    x: SCREENING.x,
    y: SCREENING.y,
    kind: "screening-founder",
  };
}

export type WinkSchool = "" | "hint" | "wreckage" | "omen" | "dwelling" | "process" | "surface";

export const WINK_SCHOOLS: Exclude<WinkSchool, "">[] = [
  "hint",
  "wreckage",
  "omen",
  "dwelling",
  "process",
  "surface",
];

export function winkSchoolFor(serial: number): Exclude<WinkSchool, ""> {
  return WINK_SCHOOLS[(Math.max(1, serial) - 1) % WINK_SCHOOLS.length];
}

export function schoolWink(school: WinkSchool): string {
  if (school === "wreckage") return "A wreckage still. Same hour. Combat is not.";
  if (school === "omen") return "An omen still. Same hour. Combat is not.";
  if (school === "dwelling") return "A dwelling still. Same hour. Combat is not.";
  if (school === "process") return "A process still. Same hour. Combat is not.";
  if (school === "surface") return "A surface still. Same hour. Combat is not.";
  return "A hint still. Same hour. Combat is not.";
}

export const STILL = { id: "production-still", x: SCREENING.x + 56, y: SCREENING.y };
export const STILL_COPY =
  "Production still. Same hour, your Wink. You did not strike harder. This was not a fetch.";
export const STILL_NEED = "Participant first. A still is optional. Observer is not enough.";
export const STILL_HELD = "The still already holds. Same hour. Combat is not.";
export const STILL_SPECTATOR = "A still. You do not get this Wink.";

export const STILL_PLAQUE: Sign = {
  id: STILL.id,
  title: "Production still",
  text: "Optional. Same screening. Your Wink. The number does not strike.",
  x: STILL.x,
  y: STILL.y,
};

export function stillPoi(school: WinkSchool = "hint"): Poi {
  const name =
    school === "wreckage"
      ? "Still — wreckage"
      : school === "omen"
        ? "Still — omen"
        : school === "dwelling"
          ? "Still — dwelling"
          : school === "process"
            ? "Still — process"
            : school === "surface"
              ? "Still — surface"
              : "Still — hint";
  return { id: STILL.id, name, x: STILL.x, y: STILL.y, kind: "production-still" };
}

export type HistoryLog = {
  passings: number;
  buried: number;
  looted: number;
  houses: Exclude<House, "">[];
};

export function emptyLog(): HistoryLog {
  return { passings: 0, buried: 0, looted: 0, houses: [] };
}

export function logCopy(log: HistoryLog): string {
  const houses = log.houses.length ? log.houses.join(", ") : "none";
  return `Passings ${log.passings}. Buried ${log.buried}. Looted ${log.looted}. Houses ${houses}. A log, not a stick. This was not a fetch.`;
}

export const WINK_LOG = "Ruin-angel kit. History is uniqueness. Combat is not.";
export const LOG_NEED = "Only a Ruin-angel reads the log, and only in the Founder room.";
export const LOG_HELD = "The log already holds. The city does not remember for you.";
export const LOG_SPECTATOR = "A screen of names. You do not get the log.";

export const LOG_PLAQUE: Sign = {
  id: SCREENING.id,
  title: "History log",
  text: "Passings. Buried. Looted. Houses. A log, not a stick. The number does not strike.",
  x: SCREENING.x,
  y: SCREENING.y,
};

export function logPoi(): Poi {
  return {
    id: SCREENING.id,
    name: "History log",
    x: SCREENING.x,
    y: SCREENING.y,
    kind: "screening-log",
  };
}
export const TEST_SERIAL = 7777;
export const MOCK_SIG = "mock";

export const NAVE_NPCS: Npc[] = [
  { id: "nara", name: "Nara Vale", role: "Sexton", x: 240, y: 720 },
  { id: "quill", name: "Quill", role: "Forger", x: 1080, y: 504 },
  { id: "ord", name: "Ord", role: "Ex-Safety", x: 400, y: 260 },
];

export const IONE: Npc = { id: "ione", name: "Ione Kade", role: "Last word", x: 720, y: 500 };

export const NAVE_SIGNS: Sign[] = [
  {
    id: "safety-plaque",
    title: "Office of Safety",
    text: "This district is stable. Extraction is civic duty. Do not name the weather otherwise.",
    x: 192,
    y: 400,
  },
];

export const BURIAL_PLOT: Rite = { id: "nara-plot", kind: "burial", x: 240, y: 780, done: false };
export const GOING_UNDER: Rite = { id: "going-under", kind: "going-under", x: 696, y: 120, done: false };

export const UNDER_PEOPLE_COPY =
  "Going-under is a house of people, not a lock of process. The first hour still works. Combat is not. This was not a fetch.";
export const WINK_UNDER_PEOPLE = "People, not a guest lock. The token does not strike.";
export const UNDER_PEOPLE_NEED = "The arena as people first. A going-under of people is not a fetch.";
export const UNDER_PEOPLE_HELD = "Going-under already holds as people. The first hour still works.";
export const UNDER_PEOPLE_SPECTATOR = "A hole. You do not get a house of people.";

export const UNDER_PEOPLE_PLAQUE: Sign = {
  id: "going-under",
  title: "Going-under — people",
  text: "A house of people. The first hour still works. The number does not strike.",
  x: 696,
  y: 120,
};

export function underPeoplePoi(): Poi {
  return {
    id: "going-under",
    name: "Going-under — people",
    x: 696,
    y: 120,
    kind: "under-people",
  };
}

export const NPC_LINES: Record<Exclude<NpcId, "ione" | "vesper">, { first: string; later: string }> = {
  nara: {
    first:
      "I don't need you to believe. I need the body in the ground. The weather is the end of world as world, and you are walking in it.",
    later:
      "It's in the earth. Don't thank me. The weather is the end of world as world — remember that when Ord shows you a number.",
  },
  quill: {
    first:
      "Copies travel. Aura doesn't. If you sell the face, keep the name. That's the only honest stall left on this kerb.",
    later: "You look like you might bury something. Cute. Burial doesn't list. I still respect it.",
  },
  ord: {
    first:
      "Safety calls it stability. I call it the process. The number goes up because you extract. I will not pretty it.",
    later:
      "Grief is not a ledger item. The process continues whether you keep the node or not. I am here so the number stays honest.",
  },
};

export const ANGEL_UNDER =
  "The Care is open. You go under as death, not as a cutscene. Guests stop here.";

export const CARE_DOOR = { id: "care-door", x: 1104, y: 168 };
export const HOUSE_HALL = { id: "house-hall", x: 1184, y: 248 };
export const WINK_CARE =
  "The Care does not keep you. It only lets you be mortal in a warehouse. The last god is not in the next room.";
export const CARE_SPECTATOR = "You see a door. You do not see what it is for.";
export const WINK_HALL =
  "The tax is already priced. It will never make you hit harder. Who owns the nodes: the Houses, and the weather.";

export function gestellTax(gestell: number): number {
  const n = Math.max(0, Math.min(100, Math.floor(gestell)));
  return Math.floor(n / 4);
}

export function hallCopy(tax: number): string {
  return `House of Mortals. The nodes belong to the process. Tithe ${tax}. The number does not strike.`;
}

export const HALL_PLAQUE: Sign = {
  id: HOUSE_HALL.id,
  title: "House of Mortals",
  text: "The nodes are standing-reserve. Tithe is a number. Combat is not.",
  x: HOUSE_HALL.x,
  y: HOUSE_HALL.y,
};

export const STANDING_COPY =
  "House of Mortals keeps the garden in the hall. Standing, not a stick.";
export const STANDING_NEED = "Bury the garden first. Standing is not a fetch.";
export const STANDING_WRONG = "This hall keeps Mortals standing. Your House is elsewhere.";
export const STANDING_HELD = "The hall already holds the garden. Standing does not strike.";
export const STANDING_SPECTATOR = "A lamp you cannot light.";
export const WINK_STANDING = "Standing is a name in the hall. The garden is not stock. Combat is not.";

export const HALL_STANDING_PLAQUE: Sign = {
  id: HOUSE_HALL.id,
  title: "House of Mortals — standing",
  text: "The garden is named here. Mortals standing. The number does not strike.",
  x: HOUSE_HALL.x,
  y: HOUSE_HALL.y,
};

export const FOURFOLD_HOLD =
  "Earth, Sky, Mortals, Divinities. The hall holds the fourfold. A gathering, not a stick. This was not a fetch.";
export const WINK_FOURFOLD =
  "The fourfold is a standing of four names. The last god is not in the room. Combat is not.";
export const FOURFOLD_NEED =
  "Four Houses must stand first. Earth, Sky, Mortals, Divinities. The hall will not gather a partial world.";
export const FOURFOLD_HELD = "The fourfold already holds. The gathering does not strike.";
export const FOURFOLD_SPECTATOR = "A hall of names you cannot gather.";

export const FOURFOLD_PLAQUE: Sign = {
  id: HOUSE_HALL.id,
  title: "The fourfold holds",
  text: "Earth, Sky, Mortals, Divinities. The hall is a gathering. The number does not strike.",
  x: HOUSE_HALL.x,
  y: HOUSE_HALL.y,
};

export function fourfoldReady(standing: HouseScores): boolean {
  return standing.earth >= 1 && standing.sky >= 1 && standing.mortals >= 1 && standing.divinities >= 1;
}

export function fourfoldPoi(): Poi {
  return {
    id: HOUSE_HALL.id,
    name: "The fourfold holds",
    x: HOUSE_HALL.x,
    y: HOUSE_HALL.y,
    kind: "fourfold-held",
  };
}

export const LAST_GOD_COPY =
  "The last god is not here. The Care is a gathering, not a room with a body. A hint, not a stick. This was not a fetch.";
export const WINK_LAST_GOD =
  "The last god is a hint in the fourfold. It does not arrive as a model. Combat is not.";
export const LAST_GOD_NEED =
  "Gather the fourfold first. The last god is not a fetch behind a shut hall.";
export const LAST_GOD_HELD = "The last god is already named as absence. The Care does not strike.";
export const LAST_GOD_SPECTATOR = "A door. You do not get to name what is not here.";

export const LAST_GOD_PLAQUE: Sign = {
  id: CARE_DOOR.id,
  title: "The last god — not here",
  text: "Absence is a standing. The fourfold holds. The number does not strike.",
  x: CARE_DOOR.x,
  y: CARE_DOOR.y,
};

export function lastGodPoi(): Poi {
  return {
    id: CARE_DOOR.id,
    name: "The last god — not here",
    x: CARE_DOOR.x,
    y: CARE_DOOR.y,
    kind: "last-god-absent",
  };
}

export const ORD_LAST =
  "Ord will not number the last god. He leaves the desk for the Care. The process has no line for absence. This was not a fetch.";
export const WINK_ORD_LAST =
  "A side hour. A clerk refused a god. The ledger stays empty. Combat is not.";
export const ORD_LAST_LATER = "I am at the door. I will not put a number on what is not here.";
export const ORD_LAST_NEED = "Name the last god as absence first. I will not walk to a room that still pretends a body.";
export const ORD_LAST_SPECTATOR = "Ord is leaving a desk. Not for you.";

export const LAST_GOD_ORD_PLAQUE: Sign = {
  id: CARE_DOOR.id,
  title: "The last god — not numbered",
  text: "Ord will not write it. Absence is a standing. The number does not strike.",
  x: CARE_DOOR.x,
  y: CARE_DOOR.y,
};

export function lastGodOrdPoi(): Poi {
  return {
    id: CARE_DOOR.id,
    name: "The last god — not numbered",
    x: CARE_DOOR.x,
    y: CARE_DOOR.y,
    kind: "last-god-absent",
  };
}

export const NARA_GOD_ASK =
  "Absence is a body I can put in the ground. I walk to the Care. Fetch would have left it unburied.";
export const NARA_GOD =
  "You buried the last god as earth. Cult. Nara Vale is at the Care. This was not a fetch.";
export const NARA_GOD_LATER = "It is in the earth. I will not forgive a factory. I will not number a god.";
export const NARA_GOD_NEED = "Name the last god as absence first. I will not bury a room that still pretends a body.";
export const NARA_GOD_SPECTATOR = "Nara Vale is burying something that is not for you.";
export const WINK_NARA_GOD =
  "A side hour. The last god went into the ground. Cult standing. Combat is not.";

export const LAST_GOD_BURIED_PLAQUE: Sign = {
  id: CARE_DOOR.id,
  title: "The last god — buried",
  text: "Nara Vale put absence in the earth. Cult. The number does not strike.",
  x: CARE_DOOR.x,
  y: CARE_DOOR.y,
};

export function lastGodBuriedPoi(): Poi {
  return {
    id: CARE_DOOR.id,
    name: "The last god — buried",
    x: CARE_DOOR.x,
    y: CARE_DOOR.y,
    kind: "last-god-buried",
  };
}

export function hallStandingPoi(): Poi {
  return {
    id: HOUSE_HALL.id,
    name: "House of Mortals — standing",
    x: HOUSE_HALL.x,
    y: HOUSE_HALL.y,
    kind: "house-standing",
  };
}

export const SAFETY_ANNEX = { id: "safety-annex", x: 320, y: 320 };
export const PASSING_READY = 8;
export const FREEZE_COST = 10;
export const FREEZE_COPY =
  "You signed the freeze. Ten Bestand. The district holds. The Passing will go hungry. Peace is a kind of weather.";
export const FREEZE_NEED = "Ten Bestand to sign the freeze. Peace is not free. Combat is not.";
export const WINK_FREEZE = "You bought time. You spent a god. The hour does not forgive the signature.";
export const FREEZE_SPECTATOR = "A desk. Paper. You are not the one who signs.";
export const FREEZE_NEED_HALL = "The Annex will not take a name that has not read the hall.";
export const FREEZE_EXTRACT = "The freeze holds the nodes. Extraction is postponed. The Passing stays hungry.";

export const ANNEX_PLAQUE: Sign = {
  id: SAFETY_ANNEX.id,
  title: "Safety Annex",
  text: "Ten Bestand. Sign here. The district holds. The hour does not.",
  x: SAFETY_ANNEX.x,
  y: SAFETY_ANNEX.y,
};

export function emptyPassing(): Passing {
  return { ready: PASSING_READY, starved: false, outcome: "" };
}

export function starvedPassing(): Passing {
  return { ready: 0, starved: true, outcome: "" };
}

export const CLEARING_STALL = { id: "clearing-stall", x: 1200, y: 560 };
export const CLEARING_PRICE = 40;
export const MARKET_LISTING =
  "Quill listed a Clearing. Forty Bestand. Copies travel. The hole does not.";
export const WINK_MARKET = "It looks like freedom. It is a stall. The sky is already priced.";
export const MARKET_BUY =
  "You bought a copy. The Clearing is still closed. Aura thins when you treat the hole as stock.";
export const MARKET_SPECTATOR = "A stall of lights. You cannot afford a sky you cannot see.";
export const MARKET_NEED_HALL = "Quill is selling something. You do not yet have the eyes for the price.";

export const STALL_PLAQUE: Sign = {
  id: CLEARING_STALL.id,
  title: "Clearing — listed",
  text: "Forty Bestand. Exhibition copy. Cult objects do not hang here.",
  x: CLEARING_STALL.x,
  y: CLEARING_STALL.y,
};

export const QUILL_HANG_ASK =
  "Hang the prayer on the wood. The stall goes dark. Copies stop listing. I will be on the wet street.";
export const QUILL_HANG =
  "You hung the cult sheet. The lights die. Quill walks the Wet Grid. This was not a fetch.";
export const QUILL_HANG_WAIT = "The stall is still lit. Hang the sheet on the listing. I will not carry it for you.";
export const QUILL_HANG_LATER =
  "The stall is a shrine now. I am on the wet street. Copies do not hang here.";
export const QUILL_HANG_NEED = "You sold the prayer. I cannot darken a stall with a print.";
export const QUILL_HANG_SPECTATOR = "Quill is taking the lights down. Not for you.";
export const QUILL_NOPRINT =
  "I will not print the last god. Copies travel. Absence does not. The stall stays a shrine. This was not a fetch.";
export const WINK_NOPRINT = "Exhibition cannot hold a god. Cult does not list. Combat is not.";
export const QUILL_NOPRINT_LATER = "I am not printing it. The kerb is cult. Copies stop here.";
export const QUILL_NOPRINT_NEED = "Name the last god as absence first. I will not refuse a listing that still pretends a body.";
export const QUILL_NOPRINT_SPECTATOR = "Quill is taking a sheet off the press. Not for you.";

export const NOPRINT_PLAQUE: Sign = {
  id: CLEARING_STALL.id,
  title: "The last god does not list",
  text: "Absence is not stock. Copies stop here. The number does not strike.",
  x: CLEARING_STALL.x,
  y: CLEARING_STALL.y,
};

export function noprintPoi(): Poi {
  return {
    id: CLEARING_STALL.id,
    name: "The last god does not list",
    x: CLEARING_STALL.x,
    y: CLEARING_STALL.y,
    kind: "last-god-unlisted",
  };
}
export const WINK_HANG = "A stall can be a shrine. You ended a listing. Aura does not list.";
export const STALL_DARK_COPY = "The stall is dark. Cult hangs. Copies do not travel.";

export const STALL_DARK_PLAQUE: Sign = {
  id: CLEARING_STALL.id,
  title: "Clearing — unlisted",
  text: "Cult hangs. Forty Bestand does not. The hole is not stock.",
  x: CLEARING_STALL.x,
  y: CLEARING_STALL.y,
};

export function stallDarkPoi(): Poi {
  return {
    id: CLEARING_STALL.id,
    name: "Stall — dark",
    x: CLEARING_STALL.x,
    y: CLEARING_STALL.y,
    kind: "stall-dark",
  };
}

export const OPERATOR_DESK = { id: "operator-desk", x: 1260, y: 360 };
export const PRIVATE_YIELD = 90;
export const OPERATOR_OFFER =
  "Vesper Hale, Concentrator. A private node. Take it and the Third Movement opens the ugly way. Refuse and you stay mortal.";
export const WINK_OPERATOR =
  "She is not a boss. She is a person who already priced your hour. The yield is honest. The door it buys is not.";
export const OPERATOR_TAKE =
  "You took the private yield. Cold is a current, not a costume. Movement III is funded. The number does not strike harder.";
export const OPERATOR_REFUSE =
  "You refused. Readiness is slower. The door stays shut until the work is mortal.";
export const OPERATOR_SPECTATOR = "A woman at a desk. She is not speaking to you.";
export const OPERATOR_NEED_HALL = "Vesper Hale will not quote a private node to someone who has not read who owns the public ones.";

export const OPERATOR_PLAQUE: Sign = {
  id: OPERATOR_DESK.id,
  title: "Vesper Hale — Concentrator",
  text: "Private yield. Human. Not a demon. Take or refuse.",
  x: OPERATOR_DESK.x,
  y: OPERATOR_DESK.y,
};

export const M3_DOOR = { id: "m3-door", x: 1260, y: 120 };
export const WRECK_GARDEN = { id: "wreckage-garden", x: 360, y: 700 };
export const ORGAN_STRAIT = { id: "organ-strait", x: 240, y: 88 };
export const ORGAN_FOUNDRY = { id: "organ-foundry", x: 520, y: 88 };
export const ORGAN_CABLE = { id: "organ-cable", x: 800, y: 88 };
export const VESPER: Npc = {
  id: "vesper",
  name: "Vesper Hale",
  role: "At the Foundry",
  x: ORGAN_FOUNDRY.x,
  y: ORGAN_FOUNDRY.y + 48,
};

export const GARDEN_RITE: Rite = { id: WRECK_GARDEN.id, kind: "garden", x: WRECK_GARDEN.x, y: WRECK_GARDEN.y, done: false };

export const GARDEN_PEOPLE_COPY =
  "The wreckage garden is a house of people, not a hole of process. Bury still works. Combat is not. This was not a fetch.";
export const WINK_GARDEN_PEOPLE = "People, not a garden stick. The token does not strike.";
export const GARDEN_PEOPLE_NEED = "Going-under as people first. A garden of people is not a fetch.";
export const GARDEN_PEOPLE_HELD = "The garden already holds as people. Bury still works.";
export const GARDEN_PEOPLE_SPECTATOR = "A garden. You do not get a house of people.";

export const GARDEN_PEOPLE_PLAQUE: Sign = {
  id: WRECK_GARDEN.id,
  title: "Garden — people",
  text: "A house of people. Bury still works. The number does not strike.",
  x: WRECK_GARDEN.x,
  y: WRECK_GARDEN.y,
};

export function gardenPeoplePoi(): Poi {
  return {
    id: WRECK_GARDEN.id,
    name: "Garden — people",
    x: WRECK_GARDEN.x,
    y: WRECK_GARDEN.y,
    kind: "garden-people",
  };
}

export const BURIAL_PEOPLE_COPY =
  "The unnamed plot is a house of people, not a burial of process. Bury still works. Combat is not. This was not a fetch.";
export const WINK_BURIAL_PEOPLE = "People, not a plot stick. The token does not strike.";
export const BURIAL_PEOPLE_NEED = "The garden as people first. A plot of people is not a fetch.";
export const BURIAL_PEOPLE_HELD = "The plot already holds as people. Bury still works.";
export const BURIAL_PEOPLE_SPECTATOR = "A plot. You do not get a house of people.";

export const BURIAL_PEOPLE_PLAQUE: Sign = {
  id: BURIAL_PLOT.id,
  title: "The plot — people",
  text: "A house of people. Bury still works. The number does not strike.",
  x: BURIAL_PLOT.x,
  y: BURIAL_PLOT.y,
};

export function burialPeoplePoi(): Poi {
  return {
    id: BURIAL_PLOT.id,
    name: "The plot — people",
    x: BURIAL_PLOT.x,
    y: BURIAL_PLOT.y,
    kind: "burial-people",
  };
}

export const WEATHER_SIGN: Sign = {
  id: "weather",
  title: "Unnamed weather",
  text: "Do not name it from a plaque. Speak with the living.",
  x: 192,
  y: 340,
};

export const WEATHER_PEOPLE_COPY =
  "The weather is a house of people, not a process. Naming still happens by speaking. Combat is not. This was not a fetch.";
export const WINK_WEATHER_PEOPLE = "People, not a climate stick. The token does not strike.";
export const WEATHER_PEOPLE_NEED = "The plot as people first. Weather of people is not a fetch.";
export const WEATHER_PEOPLE_HELD = "The weather already holds as people. Speak with the living to name it.";
export const WEATHER_PEOPLE_SPECTATOR = "A plaque. You do not get a house of people.";

export const WEATHER_PEOPLE_PLAQUE: Sign = {
  id: "weather",
  title: "Weather — people",
  text: "A house of people. Speak with the living to name it. The number does not strike.",
  x: 192,
  y: 340,
};

export function weatherPeoplePoi(): Poi {
  return {
    id: "weather",
    name: "Weather — people",
    x: 192,
    y: 340,
    kind: "weather-people",
  };
}

export const NAVE_PEOPLE_COPY =
  "The Nave holds as people, not a tube of process. Extract still costs. Combat is not. This was not a fetch.";
export const WINK_NAVE_PEOPLE = "People, not a corridor. The token does not strike.";
export const NAVE_PEOPLE_NEED = "The weather as people first. A nave of people is not a fetch.";
export const NAVE_PEOPLE_HELD = "The Nave already holds as people. Extract still costs.";
export const NAVE_PEOPLE_SPECTATOR = "A tube. You do not get a house of people.";

export const NAVE_PEOPLE_PLAQUE: Sign = {
  id: "nave-people",
  title: "The Nave — people",
  text: "A house of people. Extract still costs. The number does not strike.",
  x: 192,
  y: 340,
};

export function navePeoplePoi(): Poi {
  return {
    id: "nave-people",
    name: "The Nave — people",
    x: 192,
    y: 340,
    kind: "nave-people",
  };
}

export const CREDITS_PEOPLE_COPY =
  "Credits is a house of people, not a process. TAKE stays disarmed. The names still hold. Combat is not. This was not a fetch.";
export const WINK_CREDITS_PEOPLE = "People, not a roll. The token does not settle.";
export const CREDITS_PEOPLE_NEED = "The Nave as people first. Credits of people is not a fetch.";
export const CREDITS_PEOPLE_HELD = "Credits already holds as people. TAKE stays disarmed.";
export const CREDITS_PEOPLE_SPECTATOR = "A ring. You do not get a house of people.";

export const CREDITS_PEOPLE_PLAQUE: Sign = {
  id: "credits-people",
  title: "Credits — people",
  text: "A house of people. TAKE stays disarmed. The number does not strike.",
  x: 720,
  y: 580,
};

export function creditsPeoplePoi(): Poi {
  return {
    id: "credits-people",
    name: "Credits — people",
    x: 720,
    y: 580,
    kind: "credits-people",
  };
}

export const STILL_PEOPLE_COPY =
  "The still is a house of people, not a frame of process. Optional Wink still optional. Combat is not. This was not a fetch.";
export const WINK_STILL_PEOPLE = "People, not a still stick. The token does not strike.";
export const STILL_PEOPLE_NEED = "Credits as people first. A still of people is not a fetch.";
export const STILL_PEOPLE_HELD = "The still already holds as people. Optional Wink still optional.";
export const STILL_PEOPLE_SPECTATOR = "A still. You do not get a house of people.";

export const STILL_PEOPLE_PLAQUE: Sign = {
  id: "still-people",
  title: "The still — people",
  text: "A house of people. Optional Wink still optional. The number does not strike.",
  x: STILL.x,
  y: STILL.y,
};

export function stillPeoplePoi(): Poi {
  return {
    id: "still-people",
    name: "The still — people",
    x: STILL.x,
    y: STILL.y,
    kind: "still-people",
  };
}

export const SEASON_PEOPLE_COPY =
  "The residual season is a house of people, not a flag of process. Flag still opts in. Combat is not. This was not a fetch.";
export const WINK_SEASON_PEOPLE = "People, not a season stick. The token does not strike.";
export const SEASON_PEOPLE_NEED = "The still as people first. A season of people is not a fetch.";
export const SEASON_PEOPLE_HELD = "The season already holds as people. Flag still opts in.";
export const SEASON_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const SEASON_PEOPLE_PLAQUE: Sign = {
  id: "season-people",
  title: "The season — people",
  text: "A house of people. Flag still opts in. The number does not strike.",
  x: 720,
  y: 520,
};

export function seasonPeoplePoi(): Poi {
  return {
    id: "season-people",
    name: "The season — people",
    x: 720,
    y: 520,
    kind: "season-people",
  };
}

export const BRACKET_PEOPLE_COPY =
  "The bracket is a house of people, not an equalizer of process. Serials stay visible. Combat is not. This was not a fetch.";
export const WINK_BRACKET_PEOPLE = "People, not a hidden serial. The token does not strike.";
export const BRACKET_PEOPLE_NEED = "The season as people first. A bracket of people is not a fetch.";
export const BRACKET_PEOPLE_HELD = "The bracket already holds as people. Serials stay visible.";
export const BRACKET_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const BRACKET_PEOPLE_PLAQUE: Sign = {
  id: "bracket-people",
  title: "The bracket — people",
  text: "A house of people. Serials stay visible. The number does not strike.",
  x: 720,
  y: 520,
};

export function bracketPeoplePoi(): Poi {
  return {
    id: "bracket-people",
    name: "The bracket — people",
    x: 720,
    y: 520,
    kind: "bracket-people",
  };
}

export const LOG_PEOPLE_COPY =
  "The history log is a house of people, not a uniqueness of process. The log still holds. Combat is not. This was not a fetch.";
export const WINK_LOG_PEOPLE = "People, not a ledger stick. The token does not strike.";
export const LOG_PEOPLE_NEED = "The bracket as people first. A log of people is not a fetch.";
export const LOG_PEOPLE_HELD = "The log already holds as people. Uniqueness still a log.";
export const LOG_PEOPLE_SPECTATOR = "A screen. You do not get a house of people.";

export const LOG_PEOPLE_PLAQUE: Sign = {
  id: "log-people",
  title: "The log — people",
  text: "A house of people. Uniqueness still a log. The number does not strike.",
  x: SCREENING.x,
  y: SCREENING.y,
};

export function logPeoplePoi(): Poi {
  return {
    id: "log-people",
    name: "The log — people",
    x: SCREENING.x,
    y: SCREENING.y,
    kind: "log-people",
  };
}

export const FOUNDER_PEOPLE_COPY =
  "Founder is a house of people, not a room of process. Proximity still holds. Combat is not. This was not a fetch.";
export const WINK_FOUNDER_PEOPLE = "People, not a founder stick. The token does not strike.";
export const FOUNDER_PEOPLE_NEED = "The log as people first. A founder of people is not a fetch.";
export const FOUNDER_PEOPLE_HELD = "Founder already holds as people. Proximity still holds.";
export const FOUNDER_PEOPLE_SPECTATOR = "A darker screen. You do not get a house of people.";

export const FOUNDER_PEOPLE_PLAQUE: Sign = {
  id: "founder-people",
  title: "Founder — people",
  text: "A house of people. Proximity still holds. The number does not strike.",
  x: SCREENING.x,
  y: SCREENING.y,
};

export function founderPeoplePoi(): Poi {
  return {
    id: "founder-people",
    name: "Founder — people",
    x: SCREENING.x,
    y: SCREENING.y,
    kind: "founder-people",
  };
}

export const ROOMS_PEOPLE_COPY =
  "Observer, Participant, Founder hold as people. Proximity still holds. Combat is not. This was not a fetch.";
export const WINK_ROOMS_PEOPLE = "Three rooms. People, not a stick. The token does not strike.";
export const ROOMS_PEOPLE_NEED = "Founder as people first. Rooms of people is not a fetch.";
export const ROOMS_PEOPLE_HELD = "The rooms already hold as people. Proximity still holds.";
export const ROOMS_PEOPLE_SPECTATOR = "A screen. You do not get the rooms as people.";

export const ROOMS_PEOPLE_PLAQUE: Sign = {
  id: "rooms-people",
  title: "The rooms — people",
  text: "Three rooms hold. People, not process. Proximity still holds. The number does not strike.",
  x: SCREENING.x,
  y: SCREENING.y,
};

export function roomsPeoplePoi(): Poi {
  return {
    id: "rooms-people",
    name: "The rooms — people",
    x: SCREENING.x,
    y: SCREENING.y,
    kind: "rooms-people",
  };
}

export const STORM_PEOPLE_COPY =
  "The failed hole is a house of people, not a storm of process. Storm still burns readiness. Combat is not. This was not a fetch.";
export const WINK_STORM_PEOPLE = "People, not a wreckage stick. The token does not strike.";
export const STORM_PEOPLE_NEED = "The rooms as people first. A storm of people is not a fetch.";
export const STORM_PEOPLE_HELD = "The hole already holds as people. Storm still burns readiness.";
export const STORM_PEOPLE_SPECTATOR = "A ring. You do not get a house of people.";

export const STORM_PEOPLE_PLAQUE: Sign = {
  id: "storm-people",
  title: "Storm — people",
  text: "A house of people. Storm still burns readiness. The number does not strike.",
  x: 720,
  y: 580,
};

export function stormPeoplePoi(): Poi {
  return {
    id: "storm-people",
    name: "Storm — people",
    x: 720,
    y: 580,
    kind: "storm-people",
  };
}

export const BOUNTY_PEOPLE_COPY =
  "The bounty is a house of people, not a purse of process. One omen, one purse. Combat is not. This was not a fetch.";
export const WINK_BOUNTY_PEOPLE = "People, not a bounty stick. The token does not strike.";
export const BOUNTY_PEOPLE_NEED = "Storm as people first. A bounty of people is not a fetch.";
export const BOUNTY_PEOPLE_HELD = "The bounty already holds as people. One omen, one purse.";
export const BOUNTY_PEOPLE_SPECTATOR = "A hall. You do not get a house of people.";

export const BOUNTY_PEOPLE_PLAQUE: Sign = {
  id: "bounty-people",
  title: "The bounty — people",
  text: "A house of people. One omen, one purse. The number does not strike.",
  x: HOUSE_HALL.x,
  y: HOUSE_HALL.y,
};

export function bountyPeoplePoi(): Poi {
  return {
    id: "bounty-people",
    name: "The bounty — people",
    x: HOUSE_HALL.x,
    y: HOUSE_HALL.y,
    kind: "bounty-people",
  };
}

export const NARA_SILENCE =
  "Nara Vale looks at the garden that used to be a hole. She will not speak until it is in the ground.";
export const NARA_AFTER_GARDEN =
  "You put it in the earth. I will walk to the Strait. I will not forgive the factory.";
export const NARA_MARK =
  "Take the sexton mark. Cult. It does not list. I walk to the Strait. The garden is a standing now.";
export const NARA_MARK_LATER =
  "The mark is in your hand. I am at the Strait. I still will not forgive the factory.";
export const WINK_SEXTON =
  "A cult object is a standing, not a fetch. Nara Vale left the garden. The hole is a mark.";
export const SEXTON_SPECTATOR = "Nara Vale is burying something that is not for you.";
export const NARA_CANAL_ASK =
  "The water stopped. Put it in the ground. A canal can be a grave. I walk if I must.";
export const NARA_CANAL =
  "You buried the refused Strait. Cult. Nara Vale is at the canal. This was not a fetch.";
export const NARA_CANAL_WAIT = "The canal is still a mouth. Speak again. I will not carry the earth for you.";
export const NARA_CANAL_LATER = "It is in the earth. The factory is dark. I still will not forgive it.";
export const WINK_CANAL = "A side hour. You buried an organ. Cult standing. Combat is not.";
export const CANAL_SPECTATOR = "Nara Vale is burying water. Not for you.";
export const CANAL_NEED = "Refuse the Strait first. I will not bury a live canal.";

export const CANAL_PLAQUE: Sign = {
  id: ORGAN_STRAIT.id,
  title: "The Strait — buried",
  text: "Someone put the refused water in the ground. Cult. The factory is already dark.",
  x: ORGAN_STRAIT.x,
  y: ORGAN_STRAIT.y,
};

export function canalBuriedPoi(): Poi {
  return {
    id: ORGAN_STRAIT.id,
    name: "The Strait — buried",
    x: ORGAN_STRAIT.x,
    y: ORGAN_STRAIT.y,
    kind: "organ-strait-buried",
  };
}

export function sextonPoi(): Poi {
  return {
    id: WRECK_GARDEN.id,
    name: "Sexton mark",
    x: WRECK_GARDEN.x,
    y: WRECK_GARDEN.y,
    kind: "sexton-mark",
  };
}
export const GARDEN_BURY =
  "The Clearing from the first hour is wreckage now. You put it in the ground. Nara Vale will speak.";
export const WINK_GARDEN =
  "You took a hole and called it weather. It came back as earth. Only burial makes it world again.";
export const ORD_MAP =
  "Strait, Foundry, Cable. Extract in the Strait and the Foundry lights. There is no country here. There is only the process.";
export const WINK_ORGANS =
  "Three organs. One weather. The map is not a stick. Owning a token will not make you hit it harder.";
export const M3_ENTER = "The Third Movement is organs, not nations. The Clearing you touched is already a garden.";
export const M3_SPECTATOR = "A door with a number. You do not travel organs.";
export const ORGAN_NEED_M3 = "The organs are shut. Movement III is not funded.";
export const ORD_ERRAND =
  "The Cable still hums because the Strait paid. Keep a node. Do not extract. Then find me at the Cable.";
export const ORD_ERRAND_WAIT = "The Cable is still a light. Keep a node. Do not extract.";
export const ORD_CABLE_LATER =
  "You kept the node. I walked. The Cable is quieter. The Foundry will not thank you.";
export const WINK_ERRAND =
  "A side hour. You changed an organ, not a list. Fetch would have left the Cable humming.";
export const CABLE_QUIET_COPY =
  "You kept a node. The Cable plaque changes. Ord leaves his desk for the organ.";
export const ERRAND_EXTRACT =
  "You extracted. The Cable still drinks. Ord will not walk.";
export const ERRAND_SPECTATOR = "Ord is talking about a cable. Not to you.";

export const VESPER_NEED_FOUNDRY =
  "The heat you bought still drinks. Read the Foundry. Then come back. I will not unlight a plaque you have not seen.";
export const VESPER_UNLIGHT_ASK =
  "You bought the heat. The Foundry still drinks. Unlight it. I will walk. Fetch would have left the furnace on.";
export const VESPER_UNLIGHT_WAIT =
  "The Foundry is still a mouth. Unlight the plaque. I will not carry the dark for you.";
export const FOUNDRY_DARK_COPY =
  "You unlit the Foundry. Vesper Hale left the concentrator desk. Heat is not a nation. This was not a fetch.";
export const WINK_FOUNDRY_DARK =
  "A side hour. You shut an organ you paid for. Cold is honest. It is not the last word.";
export const FOUNDRY_NEED_COLD = "You did not buy the heat. There is nothing here to unlight.";
export const FOUNDRY_DARK_LATER =
  "The furnace is off. The Cable still drinks. Vesper Hale is standing in the dark she sold.";
export const FOUNDRY_SPECTATOR = "A woman walking toward heat that is already off. Not for you.";
export const OPERATOR_VACANT =
  "The desk is empty. Vesper Hale is at the Foundry. Yield still wants a body.";
export const VESPER_FOUNDRY_LATER =
  "I walked. The furnace is off. I will not quote another private node.";

export const FOUNDRY_DARK_PLAQUE: Sign = {
  id: ORGAN_FOUNDRY.id,
  title: "The Foundry — dark",
  text: "Someone unlit the heat they bought. The Cable still drinks. The Concentrator walked.",
  x: ORGAN_FOUNDRY.x,
  y: ORGAN_FOUNDRY.y,
};

export const OPERATOR_VACANT_PLAQUE: Sign = {
  id: OPERATOR_DESK.id,
  title: "Vesper Hale — gone",
  text: "The concentrator desk is vacant. Private yield still wants a body. She walked to the Foundry.",
  x: OPERATOR_DESK.x,
  y: OPERATOR_DESK.y,
};

export function foundryDarkPoi(): Poi {
  return {
    id: ORGAN_FOUNDRY.id,
    name: "The Foundry — dark",
    x: ORGAN_FOUNDRY.x,
    y: ORGAN_FOUNDRY.y,
    kind: "organ-foundry-dark",
  };
}

export function operatorVacantPoi(): Poi {
  return {
    id: OPERATOR_DESK.id,
    name: "Concentrator — vacant",
    x: OPERATOR_DESK.x,
    y: OPERATOR_DESK.y,
    kind: "operator-vacant",
  };
}

export const VESPER_NOGOD =
  "Vesper Hale will not sell the last god. The desk lists no private node for absence. Yield is not a hint. This was not a fetch.";
export const WINK_NOGOD = "A side hour. A concentrator refused a god. Combat is not.";
export const VESPER_NOGOD_LATER = "I will not quote a body that is not here. The desk stays empty of gods.";
export const VESPER_NOGOD_NEED = "Name the last god as absence first. I will not refuse a listing that still pretends a body.";
export const VESPER_NOGOD_SPECTATOR = "A woman closing a book. Not for you.";

export const NOGOD_PLAQUE: Sign = {
  id: OPERATOR_DESK.id,
  title: "No god for sale",
  text: "Private yield does not list absence. The Concentrator will not quote a hint.",
  x: OPERATOR_DESK.x,
  y: OPERATOR_DESK.y,
};

export function noGodPoi(): Poi {
  return {
    id: OPERATOR_DESK.id,
    name: "No god for sale",
    x: OPERATOR_DESK.x,
    y: OPERATOR_DESK.y,
    kind: "operator-no-god",
  };
}

export const CABLE_DARK =
  "You cut the Cable. It drank the Strait. The water already refused. Signal is not a nation. This was not a fetch.";
export const WINK_CABLE_DARK =
  "A side hour. You shut the organ that drank unpaid water. Quiet was a keep. Dark is a grave.";
export const CABLE_NEED_STRAIT = "The Strait still pays. Refuse the water first. The Cable will not go dark on a live canal.";
export const CABLE_DARK_LATER = "The Cable is dark. Quiet was mercy. This is absence.";
export const CABLE_DARK_SPECTATOR = "A line of light going out. Not for you to cut.";

export const CABLE_DARK_PLAQUE: Sign = {
  id: ORGAN_CABLE.id,
  title: "The Cable — dark",
  text: "Someone cut the drink. The Strait is not paying. Signal as flesh, ended.",
  x: ORGAN_CABLE.x,
  y: ORGAN_CABLE.y,
};

export function cableDarkPoi(): Poi {
  return {
    id: ORGAN_CABLE.id,
    name: "The Cable — dark",
    x: ORGAN_CABLE.x,
    y: ORGAN_CABLE.y,
    kind: "organ-cable-dark",
  };
}

export const SKY_STANDING =
  "House of Sky names the dark Cable. Standing. Hours, not a stick. This was not a fetch.";
export const WINK_SKY = "Standing is a name on a dead line. The token does not strike.";
export const SKY_NEED = "Cut the Cable first. Sky standing is not a fetch.";
export const SKY_WRONG = "This organ keeps Sky standing. Your House is elsewhere.";
export const SKY_HELD = "Sky already holds the dark line. Standing does not strike.";
export const SKY_SPECTATOR = "A sky you cannot name.";

export const SKY_PLAQUE: Sign = {
  id: ORGAN_CABLE.id,
  title: "The Cable — Sky standing",
  text: "House of Sky named the dark line. Hours. The number does not strike.",
  x: ORGAN_CABLE.x,
  y: ORGAN_CABLE.y,
};

export const EARTH_STANDING =
  "House of Earth names the dark Foundry. Standing. Ground, not a stick. This was not a fetch.";
export const WINK_EARTH = "Standing is ore that will not strike. The token does not hit.";
export const EARTH_NEED = "Unlight the Foundry first. Earth standing is not a fetch.";
export const EARTH_WRONG = "This furnace keeps Earth standing. Your House is elsewhere.";
export const EARTH_HELD = "Earth already holds the dark heat. Standing does not strike.";
export const EARTH_SPECTATOR = "A ground you cannot name.";

export const EARTH_PLAQUE: Sign = {
  id: ORGAN_FOUNDRY.id,
  title: "The Foundry — Earth standing",
  text: "House of Earth named the dark heat. Ground. The number does not strike.",
  x: ORGAN_FOUNDRY.x,
  y: ORGAN_FOUNDRY.y,
};

export const DIV_STANDING =
  "House of Divinities names the buried Strait. Standing. A Wink, not a stick. This was not a fetch.";
export const WINK_DIV = "Standing is a hint in the earth. The token does not strike.";
export const DIV_NEED = "Bury the canal first. Divinities standing is not a fetch.";
export const DIV_WRONG = "This grave keeps Divinities standing. Your House is elsewhere.";
export const DIV_HELD = "Divinities already hold the buried water. Standing does not strike.";
export const DIV_SPECTATOR = "A Wink you cannot name.";

export const DIV_PLAQUE: Sign = {
  id: ORGAN_STRAIT.id,
  title: "The Strait — Divinities standing",
  text: "House of Divinities named the buried water. A hint. The number does not strike.",
  x: ORGAN_STRAIT.x,
  y: ORGAN_STRAIT.y,
};

export function divStandingPoi(): Poi {
  return {
    id: ORGAN_STRAIT.id,
    name: "The Strait — Divinities standing",
    x: ORGAN_STRAIT.x,
    y: ORGAN_STRAIT.y,
    kind: "organ-strait-divinities",
  };
}

export function earthStandingPoi(): Poi {
  return {
    id: ORGAN_FOUNDRY.id,
    name: "The Foundry — Earth standing",
    x: ORGAN_FOUNDRY.x,
    y: ORGAN_FOUNDRY.y,
    kind: "organ-foundry-earth",
  };
}

export function skyStandingPoi(): Poi {
  return {
    id: ORGAN_CABLE.id,
    name: "The Cable — Sky standing",
    x: ORGAN_CABLE.x,
    y: ORGAN_CABLE.y,
    kind: "organ-cable-sky",
  };
}

export const CABLE_QUIET_PLAQUE: Sign = {
  id: ORGAN_CABLE.id,
  title: "The Cable — quiet",
  text: "Someone kept a node. The hum is less. The Foundry notices.",
  x: ORGAN_CABLE.x,
  y: ORGAN_CABLE.y,
};

export const STRAIT_REFUSE =
  "You refused the water. The Strait stops paying a furnace that is already dark. Nara Vale does not have to forgive it.";
export const WINK_STRAIT_REFUSE =
  "An organ can stop. You unlit the heat, then you shut the mouth that fed it. Fetch would have left the canal paying.";
export const STRAIT_NEED_DARK = "The Foundry still drinks. Unlight it first. The Strait will not refuse a live furnace.";
export const STRAIT_REFUSED_LATER = "The water is not paying. The Foundry is dark. The process is quieter.";
export const ORD_WITNESS =
  "You refused the water. I will stand at the Strait. The number is quieter. I will not pretty it.";
export const ORD_WITNESS_LATER =
  "The canal is shut. I am here so the number stays honest. The Foundry is dark. I still will not pretty it.";
export const WINK_WITNESS =
  "Ord left his desk for a refused organ. A schedule changed. Fetch would have left him counting yield.";
export const ORD_WITNESS_SPECTATOR = "Ord is looking at a canal. Not with you.";
export const STRAIT_SPECTATOR = "A canal. You do not refuse organs.";

export const STRAIT_REFUSED_PLAQUE: Sign = {
  id: ORGAN_STRAIT.id,
  title: "The Strait — refused",
  text: "Someone stopped the water. The furnace is already dark. No country here. Only a closed mouth.",
  x: ORGAN_STRAIT.x,
  y: ORGAN_STRAIT.y,
};

export function straitRefusedPoi(): Poi {
  return {
    id: ORGAN_STRAIT.id,
    name: "The Strait — refused",
    x: ORGAN_STRAIT.x,
    y: ORGAN_STRAIT.y,
    kind: "organ-strait-refused",
  };
}

export function cableQuietPoi(): Poi {
  return {
    id: ORGAN_CABLE.id,
    name: "The Cable — quiet",
    x: ORGAN_CABLE.x,
    y: ORGAN_CABLE.y,
    kind: "organ-cable-quiet",
  };
}

export const ORGAN_PLAQUES: Sign[] = [
  {
    id: ORGAN_STRAIT.id,
    title: "The Strait",
    text: "Water that is not water. Ore and hulls pass. Extract here, the Foundry breathes.",
    x: ORGAN_STRAIT.x,
    y: ORGAN_STRAIT.y,
  },
  {
    id: ORGAN_FOUNDRY.id,
    title: "The Foundry",
    text: "Heat without a nation. The Cable drinks what you take.",
    x: ORGAN_FOUNDRY.x,
    y: ORGAN_FOUNDRY.y,
  },
  {
    id: ORGAN_CABLE.id,
    title: "The Cable",
    text: "Signal as flesh. The Strait is already paying for this light.",
    x: ORGAN_CABLE.x,
    y: ORGAN_CABLE.y,
  },
];

export const FORGE_TRAY = { id: "forge-tray", x: 1080, y: 600 };
export const FORGE_PAY = 25;
export const LISTING_FEE = 5;
export const EXHIBIT_DECAY = 20;
export const FORGE_LESSON =
  "Quill fans two hints. One was buried. One was printed. The printed one lists. The buried one opens. I can teach the difference. I can also sell the print.";
export const WINK_FORGE =
  "The last god's hint can be forged. Exhibition Winke travel. Cult Winke stay in the hand that buried.";
export const FORGE_SPOT =
  "You keep the eye. The cult hint does not list. Copies will not open the hole.";
export const FORGE_SELL =
  "You sold a copy. Listing fee five. Twenty net. Aura thins. Cult does not list.";
export const CULT_NO_LIST = "Cult objects do not list. The buried hint stays in the hand.";
export const DECAY_COPY = "A print thinned. Exhibition decays. Cult does not.";
export const FORGE_SPECTATOR = "Quill is doing something with paper. You cannot tell which sheet is the prayer.";
export const FORGE_NEED_MARKET = "Quill is not teaching until you have stood at the listing.";

export const CLAIMS_DESK = { id: "claims-desk", x: 480, y: 640 };
export const CLAIMS_ARMED = false;
export const CLAIM_HOLD = 86_400;
export const DESK_FILE =
  "Claim filed. Not a yield. Hold twenty-four hours. TAKE would pay Bestand. $REVERIE settle is off.";
export const DESK_WAIT = "The hold is not done. The claim sits. No faucet.";
export const DESK_DISARMED =
  "Desk disarmed. The claim is filed. TAKE does not pay. No mint. No Base.";
export const DESK_EMPTY = "Nothing to file. Play first. This is not a faucet.";
export const DESK_SPECTATOR = "A period on a ledger. Guests cannot claim.";
export const DESK_KEY = ".";
export const BANK_COPY =
  "You banked Bestand. Spoils cannot take it. A vault, not a yield. TAKE stays disarmed. This was not a fetch.";
export const WINK_BANK = "Banked is not a stick. Unbanked still drops. The token does not strike.";
export const BANK_EMPTY = "Nothing to bank. The vault does not print Bestand.";
export const BANK_SPECTATOR = "A vault. You cannot put a guest ledger in it.";
export const VAULT_COVER = "The vault covered the rest. Banked is a sink, not a stick.";

export function spendBestand(
  p: { bestand: number; banked: number },
  cost: number,
): { bestand: number; banked: number; fromVault: number } | null {
  const pocket = Math.max(0, Math.floor(p.bestand));
  const vault = Math.max(0, Math.floor(p.banked));
  const need = Math.max(0, Math.floor(cost));
  if (need <= 0) return { bestand: pocket, banked: vault, fromVault: 0 };
  if (pocket + vault < need) return null;
  if (pocket >= need) return { bestand: pocket - need, banked: vault, fromVault: 0 };
  const fromVault = need - pocket;
  return { bestand: 0, banked: vault - fromVault, fromVault };
}

export function vaultHeard(copy: string, fromVault: number): string {
  return fromVault > 0 ? `${copy} ${VAULT_COVER}` : copy;
}

export const BANK_PLAQUE: Sign = {
  id: CLAIMS_DESK.id,
  title: "DESK — vault",
  text: "Banked Bestand does not drop. Claims stay disarmed. Not a yield. No Base.",
  x: CLAIMS_DESK.x,
  y: CLAIMS_DESK.y,
};

export function bankPoi(): Poi {
  return { id: CLAIMS_DESK.id, name: "DESK — vault", x: CLAIMS_DESK.x, y: CLAIMS_DESK.y, kind: "claims-vault" };
}

export const FUNERAL_COST = 12;
export const SHRINE_COST = 8;
export const FUNERAL_COPY =
  "You paid Nara Vale's street. Twelve Bestand. The body is in the ground.";
export const FUNERAL_NEED = "Nara Vale does not work for free. Twelve Bestand for a funeral.";
export const SHRINE_COPY =
  "You kept the shrine. Eight Bestand. The Gestell thins a little. Combat is not.";
export const SHRINE_NEED = "The shrine wants upkeep. Eight Bestand. Not a stick.";
export const SHRINE_SPECTATOR = "A shrine. You do not keep it.";
export const AURA_DIM = 5;
export const RESTORE_COST = 15;
export const RESTORE_GAIN = 8;
export const RESTORE_COPY =
  "You spent Bestand. Aura returns. The Wink can be held again. Combat is not.";
export const RESTORE_NEED = "Fifteen Bestand to restore aura. Low aura darkens Winke.";
export const RESTORE_FULL = "Your aura already holds. The spend would not strike anyway.";
export const RESTORE_SPECTATOR = "A light you cannot buy. Guests have no aura to restore.";
export const INSURANCE_COST = 18;
export const INSURANCE_COPY =
  "You bought the paper. Eighteen Bestand. Death walks you to the last shrine. Combat is not.";
export const INSURANCE_NEED = "Eighteen Bestand for insurance paper. It is a walk, not a stick.";
export const INSURANCE_HELD = "You already hold the paper. One death, one walk.";
export const INSURANCE_USED =
  "The paper spent itself. You woke at the shrine. Not a bigger strike.";
export const INSURANCE_SPECTATOR = "Paper for a walk back. Guests do not buy the road.";
export const WINK_SINK = "Every earner has a hole. Bestand goes into the ground. The token does not strike.";
export const REPAIR_COST = 7;
export const REPAIR_COPY =
  "You paid Quill. Seven Bestand. The print holds again. Cult objects were never cracked.";
export const REPAIR_NEED = "Seven Bestand to repair a print. Cult does not crack.";
export const REPAIR_NONE = "Nothing cracked. Exhibition decays; cult does not.";
export const REPAIR_SPECTATOR = "Quill is mending paper. Guests do not repair.";

export const SHRINE = { id: "shrine-upkeep", x: 640, y: 200 };

export function shrinePoi(): Poi {
  return { id: SHRINE.id, name: "Shrine upkeep", x: SHRINE.x, y: SHRINE.y, kind: "shrine-upkeep" };
}

export const SHRINE_PLAQUE: Sign = {
  id: SHRINE.id,
  title: "Shrine",
  text: "Keep. Restore. Insurance paper walks you back. Not a revive stick.",
  x: SHRINE.x,
  y: SHRINE.y,
};

export const RESTRAINT_COPY =
  "You named holding-back at the shrine. The last god is not a spend. A stance, not a stick. This was not a fetch.";
export const WINK_RESTRAINT =
  "Holding-back is how the hour stays world. Restore still costs. Combat is not.";
export const RESTRAINT_NEED = "Name the last god as absence first. Holding-back is not a fetch at an empty door.";
export const RESTRAINT_HELD = "The shrine already holds the name. Upkeep still costs. Combat is not.";
export const RESTRAINT_SPECTATOR = "A shrine you cannot name.";

export const RESTRAINT_PLAQUE: Sign = {
  id: SHRINE.id,
  title: "Holding-back",
  text: "The last god is not a spend. Keep still costs. The number does not strike.",
  x: SHRINE.x,
  y: SHRINE.y,
};

export function restraintPoi(): Poi {
  return {
    id: SHRINE.id,
    name: "Holding-back",
    x: SHRINE.x,
    y: SHRINE.y,
    kind: "shrine-restraint",
  };
}

export const EXTRACT_PAY = 40;
export const RESTRAINT_PAY = 30;
export const STANCE_COPY =
  "You take Restraint. Yield thins. Winke hold. Storm would burn this. Combat is not. This was not a fetch.";
export const WINK_STANCE = "Holding-back is a stance. You see more. You take less. Combat is not.";
export const STANCE_HELD = "Restraint already holds. Yield still thins. Keep still costs.";
export const STANCE_STORM = "Storm burned holding-back. You cannot take Restraint until the weather turns.";
export const STANCE_NEED = "Name holding-back at the shrine first. A stance is not a fetch.";
export const STANCE_SPECTATOR = "A stance you cannot hold.";
export const STORM_BURNS =
  "Storm burns holding-back. Wreckage vision. Readiness thins. Restraint is gone. Combat is not.";
export const RESTRAINT_YIELD = "Restraint. You took less. The Wink is not a stick.";
export const DODGE_COPY = "Restraint. You moved through the window. Combat is not.";
export const DODGE_WHIFF = "They moved. Restraint is a window. Combat is not.";

export function intentMoving(intent: { up: boolean; down: boolean; left: boolean; right: boolean } | undefined): boolean {
  return !!(intent && (intent.up || intent.down || intent.left || intent.right));
}

export const HIT_STOP = 0.12;
export const HIT_STOP_COPY =
  "The hit held. Telegraph is readable. You did not strike harder. This was not a fetch.";
export const WINK_HIT_STOP = "Hit-stop. Presence, not a bigger stick. Combat is not.";

export const HIT_STOP_PLAQUE: Sign = {
  id: "hit-stop",
  title: "Hit-stop",
  text: "The hit held. Readable. The number does not strike harder.",
  x: 200,
  y: 480,
};

export function hitStopPoi(x: number, y: number): Poi {
  return { id: "hit-stop", name: "Hit-stop", x, y, kind: "hit-stop" };
}

export const AURA_ADDRESS = 12;
export const ADDRESSED_COPY =
  "They address you. Presence, not a listing. You did not strike harder. This was not a fetch.";
export const WINK_ADDRESSED = "High aura. They know you. Combat is not.";
export const ADDRESSED_NEED = "Presence first. Low aura is efficient. Sacred content stays dark.";
export const ADDRESSED_WEATHER = "Name the weather first. Then the city can address you.";
export const ADDRESSED_HELD = "They already address you. Presence holds.";
export const ADDRESSED_SPECTATOR = "A plaque. You are not addressed.";

export const ADDRESSED_PLAQUE: Sign = {
  id: "safety-plaque",
  title: "Addressed",
  text: "They know you. Presence, not a stick. The number does not strike.",
  x: 192,
  y: 400,
};

export function addressedPoi(): Poi {
  return { id: "addressed", name: "Addressed", x: 192, y: 340, kind: "addressed" };
}

export const PARTY_COPY =
  "You asked them to walk the hour. A party, not a stick. Combat is not. This was not a fetch.";
export const WINK_PARTY_WALK = "Together. Not a bigger stick. The token does not strike.";
export const PARTY_NEED = "Stand with another Angel after the weather is named. A party is not a fetch.";
export const PARTY_HELD = "You already walk together. Combat is not.";
export const PARTY_SPECTATOR = "Two Angels. You do not get this hour.";

export const PARTY_WALK_PLAQUE: Sign = {
  id: "party-walk",
  title: "Party",
  text: "They walk the hour together. Not a stick. The number does not strike.",
  x: 200,
  y: 480,
};

export function partyPoi(x: number, y: number): Poi {
  return { id: "party-walk", name: "Party", x, y, kind: "party-walk" };
}

export const PART_COPY =
  "You parted. The hour is yours again. Combat is not. This was not a fetch.";
export const WINK_PART = "Apart. Not a stick. The token does not keep you.";
export const PART_NEED = "You do not walk with anyone. A parting is not a fetch.";
export const PART_HELD = "You already parted. The hour is yours.";
export const PART_SPECTATOR = "They walk. You do not part them.";

export const PART_PLAQUE: Sign = {
  id: "party-walk",
  title: "Party — parted",
  text: "The hour is theirs again. Not a stick. The number does not strike.",
  x: 200,
  y: 480,
};

export function partPoi(x: number, y: number): Poi {
  return { id: "party-walk", name: "Party — parted", x, y, kind: "party-parted" };
}

export const HEAVY_HOLD = 0.25;
export const HEAVY_COPY =
  "Heavy. The telegraph dropped. You did not strike harder. This was not a fetch.";
export const WINK_HEAVY = "A hold, not a stick. The token does not strike.";

export const HEAVY_PLAQUE: Sign = {
  id: "heavy",
  title: "Heavy",
  text: "Readable interrupt. Same number. The hit is slower.",
  x: 200,
  y: 480,
};

export function heavyPoi(x: number, y: number): Poi {
  return { id: "heavy", name: "Heavy", x, y, kind: "heavy" };
}

export const TRUCE_HOLD = 20;
export const TRUCE_COPY =
  "You unflagged together. Twenty seconds. Spoils stay in the pocket. A truce, not a stick. This was not a fetch.";
export const WINK_TRUCE = "A fight can end. Presence, not a stick. The token does not strike.";
export const TRUCE_NEED = "Both must be flagged Angels. Guests are not a fight.";
export const TRUCE_HELD = "The truce already holds. You can flag again when the street takes you.";
export const TRUCE_SPECTATOR = "A wet street. You do not get a truce.";

export const TRUCE_PLAQUE: Sign = {
  id: "truce",
  title: "Truce",
  text: "Both unflag. Spoils stay. Seconds, not a stick. The number does not strike.",
  x: 720,
  y: 520,
};

export function trucePoi(x: number, y: number): Poi {
  return { id: "truce", name: "Truce", x, y, kind: "truce" };
}

export const HANDOFF_COPY =
  "You passed a print. Listing fee five. Exhibition travels. Cult stayed in the hand. This was not a fetch.";
export const WINK_HANDOFF = "A copy changes hands. Not a stick. The token does not buy the hour.";
export const HANDOFF_AGAIN =
  "Another print changed hands. Listing fee five. Exhibition still decays. Cult does not pass.";
export const HANDOFF_NEED = "Stand at the stall with a print and another Angel. Cult does not pass.";
export const HANDOFF_NONE = "You have no print to pass. Exhibition only.";
export const HANDOFF_FEE = "The listing fee is five. The pocket is short.";
export const HANDOFF_SPECTATOR = "Paper moves. You do not get a print.";
export const HANDOFF_CULT = "Cult objects do not pass. The buried hint stays in the hand.";
export const HANDOFF_DARK = "The stall is unlisted. Copies do not pass here.";

export const HANDOFF_PLAQUE: Sign = {
  id: "stall-handoff",
  title: "The stall — handoff",
  text: "A print changes hands. Fee five. Cult does not. The number does not strike.",
  x: CLEARING_STALL.x,
  y: CLEARING_STALL.y,
};

export function handoffPoi(): Poi {
  return {
    id: "stall-handoff",
    name: "The stall — handoff",
    x: CLEARING_STALL.x,
    y: CLEARING_STALL.y,
    kind: "stall-handoff",
  };
}

export const CARE_PEOPLE_COPY =
  "The Care is a house of people, not a clinic of process. Restore still costs. Insurance still costs. Combat is not. This was not a fetch.";
export const WINK_CARE_PEOPLE = "People, not Bestand. The door does not strike.";
export const CARE_PEOPLE_NEED =
  "Ione's gathering and the last god named as absence first. A house of people is not a fetch.";
export const CARE_PEOPLE_HELD = "The Care already holds as people. Restore still costs. Insurance still costs.";
export const CARE_PEOPLE_SPECTATOR = "A door. You do not get a house of people.";

export const CARE_PEOPLE_PLAQUE: Sign = {
  id: "care-people",
  title: "The Care — people",
  text: "A house of people. Restore still costs. The number does not strike.",
  x: CARE_DOOR.x,
  y: CARE_DOOR.y,
};

export function carePeoplePoi(): Poi {
  return {
    id: "care-people",
    name: "The Care — people",
    x: CARE_DOOR.x,
    y: CARE_DOOR.y,
    kind: "care-people",
  };
}

export const SHRINE_PEOPLE_COPY =
  "The shrine is a house of people. Keep still costs. Restore still costs. Combat is not. This was not a fetch.";
export const WINK_SHRINE_PEOPLE = "People, not a stick. The gold does not strike.";
export const SHRINE_PEOPLE_NEED = "The Care as people first. A shrine of people is not a fetch.";
export const SHRINE_PEOPLE_HELD = "The shrine already holds as people. Keep still costs.";
export const SHRINE_PEOPLE_SPECTATOR = "A shrine. You do not get a house of people.";

export const SHRINE_PEOPLE_PLAQUE: Sign = {
  id: SHRINE.id,
  title: "The shrine — people",
  text: "A house of people. Keep still costs. The number does not strike.",
  x: SHRINE.x,
  y: SHRINE.y,
};

export function shrinePeoplePoi(): Poi {
  return {
    id: SHRINE.id,
    name: "The shrine — people",
    x: SHRINE.x,
    y: SHRINE.y,
    kind: "shrine-people",
  };
}

export const SAFETY_PEOPLE_COPY =
  "Safety is a house of people, not a freeze of process. The freeze still costs. Combat is not. This was not a fetch.";
export const WINK_SAFETY_PEOPLE = "People, not katechon. The plaque does not strike.";
export const SAFETY_PEOPLE_NEED = "The shrine as people first. Safety as people is not a fetch.";
export const SAFETY_PEOPLE_HELD = "Safety already holds as people. The freeze still costs.";
export const SAFETY_PEOPLE_SPECTATOR = "A plaque. You do not get a house of people.";

export const SAFETY_PEOPLE_PLAQUE: Sign = {
  id: "safety-people",
  title: "Safety — people",
  text: "A house of people. The freeze still costs. The number does not strike.",
  x: 192,
  y: 400,
};

export function safetyPeoplePoi(): Poi {
  return { id: "safety-people", name: "Safety — people", x: 192, y: 400, kind: "safety-people" };
}

export const DESK_PEOPLE_COPY =
  "The desk will not price people. File still sits. TAKE stays disarmed. No mint. No Base. This was not a fetch.";
export const WINK_DESK_PEOPLE = "People are not a claim. Combat is not. The token does not settle.";
export const DESK_PEOPLE_NEED = "Safety as people first. A desk of people is not a fetch.";
export const DESK_PEOPLE_HELD = "The desk already holds as people. TAKE stays disarmed.";
export const DESK_PEOPLE_SPECTATOR = "A period on a ledger. You do not get a house of people.";

export const DESK_PEOPLE_PLAQUE: Sign = {
  id: "desk-people",
  title: "DESK — people",
  text: "Will not price people. TAKE stays disarmed. Not a yield. No Base.",
  x: CLAIMS_DESK.x,
  y: CLAIMS_DESK.y,
};

export function deskPeoplePoi(): Poi {
  return {
    id: "desk-people",
    name: "DESK — people",
    x: CLAIMS_DESK.x,
    y: CLAIMS_DESK.y,
    kind: "desk-people",
  };
}

export const HALL_PEOPLE_COPY =
  "The hall is a house of people, not standing-reserve. Tithe still costs. Bounty still costs. Combat is not. This was not a fetch.";
export const WINK_HALL_PEOPLE = "People, not a House stick. The token does not strike.";
export const HALL_PEOPLE_NEED = "The desk as people first. A hall of people is not a fetch.";
export const HALL_PEOPLE_HELD = "The hall already holds as people. Tithe still costs.";
export const HALL_PEOPLE_SPECTATOR = "A hall. You do not get a house of people.";

export const HALL_PEOPLE_PLAQUE: Sign = {
  id: "hall-people",
  title: "The hall — people",
  text: "A house of people. Tithe still costs. The number does not strike.",
  x: HOUSE_HALL.x,
  y: HOUSE_HALL.y,
};

export function hallPeoplePoi(): Poi {
  return {
    id: "hall-people",
    name: "The hall — people",
    x: HOUSE_HALL.x,
    y: HOUSE_HALL.y,
    kind: "hall-people",
  };
}

export const CLEARING_PEOPLE_COPY =
  "The Clearing is a house of people, not a hole in process. Passing still happens. Combat is not. This was not a fetch.";
export const WINK_CLEARING_PEOPLE = "People, not a weather stick. The token does not strike.";
export const CLEARING_PEOPLE_NEED = "The hall as people first. A Clearing of people is not a fetch.";
export const CLEARING_PEOPLE_HELD = "The Clearing already holds as people. Passing still happens.";
export const CLEARING_PEOPLE_SPECTATOR = "A ring. You do not get a house of people.";

export const CLEARING_PEOPLE_PLAQUE: Sign = {
  id: "clearing-ring",
  title: "The Clearing — people",
  text: "A house of people. Passing still happens. The number does not strike.",
  x: 720,
  y: 580,
};

export function clearingPeoplePoi(): Poi {
  return {
    id: "clearing-ring",
    name: "The Clearing — people",
    x: 720,
    y: 580,
    kind: "clearing-people",
  };
}

export const STORM_GEAR = 40;
export const STORM_SKIM = 0.1;
export const STORM_PRESS =
  "Storm. High-progress cracked. You did not strike harder. This was not a fetch.";
export const STORM_SKIM_COPY =
  "Storm. You skimmed the geared. The fallen keep their rags. Combat is not.";
export const STORM_FALLEN = "Storm is weaker vs the already-fallen. Combat is not.";
export const WINK_STORM_PRESS = "Angel of History. Progress, not a bigger stick. Combat is not.";

export const STORM_PROGRESS_PLAQUE: Sign = {
  id: "storm-progress",
  title: "Storm — progress",
  text: "Geared graves skim. Fallen graves do not. The number does not strike.",
  x: 200,
  y: 480,
};

export function stormProgressPoi(x: number, y: number): Poi {
  return { id: "storm-progress", name: "Storm — progress", x, y, kind: "storm-progress" };
}

export function palindromeSerial(n: number | null): boolean {
  if (n == null || n <= 0) return false;
  const s = String(n);
  if (s === [...s].reverse().join("")) return true;
  const pad = s.padStart(4, "0");
  return pad === [...pad].reverse().join("");
}

export const WINK_SEED_COPY =
  "A palindrome is a Wink seed. Serial remembers. You did not strike harder. This was not a fetch.";
export const WINK_SEED = "A seed, not a stick. Palindrome presence. Combat is not.";
export const WINK_SEED_NEED = "Only a palindrome serial seeds a Wink here.";
export const WINK_SEED_HELD = "The seed already holds. The serial still remembers.";
export const WINK_SEED_SPECTATOR = "A prior hour. You do not seed it.";

export const WINK_SEED_PLAQUE: Sign = {
  id: "wink-seed",
  title: "Wink seed",
  text: "Palindrome. Not a stick. The number does not strike.",
  x: 760,
  y: 640,
};

export function winkSeedPoi(x: number, y: number): Poi {
  return { id: "wink-seed", name: "Wink seed", x, y, kind: "wink-seed" };
}

export function stormProgress(p: { guest: boolean; locked?: boolean; bestand: number; fakeWinke: number }): boolean {
  return !p.guest && !p.locked && (p.bestand >= STORM_GEAR || p.fakeWinke > 0);
}

export function alreadyFallen(
  p: { hp: number; x: number; y: number },
  wreckage: { x: number; y: number }[],
  ragHp = 15,
): boolean {
  if (p.hp <= ragHp) return true;
  return wreckage.some((r) => nearPoint(p.x, p.y, r.x, r.y, 56));
}

export const STANCE_PLAQUE: Sign = {
  id: SHRINE.id,
  title: "Restraint",
  text: "Yield thins. Winke hold. Storm burns this. The number does not strike.",
  x: SHRINE.x,
  y: SHRINE.y,
};

export function stancePoi(): Poi {
  return {
    id: SHRINE.id,
    name: "Restraint",
    x: SHRINE.x,
    y: SHRINE.y,
    kind: "shrine-stance",
  };
}

export type Claim = {
  id: string;
  amount: number;
  created: number;
  readyAt: number;
};

export function claimsPoi(): Poi {
  return { id: CLAIMS_DESK.id, name: "Desk", x: CLAIMS_DESK.x, y: CLAIMS_DESK.y, kind: "claims-desk" };
}

export const CLAIMS_PLAQUE: Sign = {
  id: CLAIMS_DESK.id,
  title: "DESK",
  text: "Play earns a claim. Not a yield. Hold a day. Disarmed.",
  x: CLAIMS_DESK.x,
  y: CLAIMS_DESK.y,
};

export const WET_GRID = { id: "wet-grid", x: 720, y: 520, r: 110 };
export const FLAG_COPY =
  "You flagged. Wet Grid spoils are unbanked Bestand and exhibition copies. Cult and banked stay. Guests are not loot.";
export const FLAG_SPECTATOR = "A wet street. You are not flagged. You are not spoils.";
export const SPOILS_COPY = "Spoils from a person. Unbanked and copies. The cult hint stayed in the grave.";
export const GUEST_GRIEF =
  "A guest is not a spoils path. Protocol reject. The server will not strike them for you.";
export const FLAG_PEOPLE_COPY =
  "The flag is a house of people, not a spoils process. Flag still opts in. Guests are not loot. Seconds, not a stick. Combat is not. This was not a fetch.";
export const WINK_FLAG_PEOPLE = "People, not a flag stick. The token does not strike.";
export const FLAG_PEOPLE_NEED = "The bounty as people first. A flag of people is not a fetch.";
export const FLAG_PEOPLE_HELD = "The flag already holds as people. Flag still opts in. Guests are not loot.";
export const FLAG_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const FLAG_PEOPLE_PLAQUE: Sign = {
  id: "flag-people",
  title: "Flag — people",
  text: "A house of people. Flag still opts in. Guests are not loot. The number does not strike.",
  x: WET_GRID.x,
  y: WET_GRID.y,
};

export function flagPeoplePoi(): Poi {
  return {
    id: "flag-people",
    name: "Flag — people",
    x: WET_GRID.x,
    y: WET_GRID.y,
    kind: "flag-people",
  };
}

export const TRUCE_PEOPLE_COPY =
  "The truce is a house of people, not a flag of process. Both unflag. Spoils stay. Seconds, not a stick. Combat is not. This was not a fetch.";
export const WINK_TRUCE_PEOPLE = "People, not a truce stick. The token does not strike.";
export const TRUCE_PEOPLE_NEED = "The flag as people first. A truce of people is not a fetch.";
export const TRUCE_PEOPLE_MATE = "Stand with a flagged Angel. Guests are not a fight.";
export const TRUCE_PEOPLE_HELD = "The truce already holds as people. Both unflag. Spoils stay.";
export const TRUCE_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const TRUCE_PEOPLE_PLAQUE: Sign = {
  id: "truce-people",
  title: "Truce — people",
  text: "A house of people. Both unflag. Spoils stay. The number does not strike.",
  x: WET_GRID.x,
  y: WET_GRID.y,
};

export function trucePeoplePoi(x = WET_GRID.x, y = WET_GRID.y): Poi {
  return {
    id: "truce-people",
    name: "Truce — people",
    x,
    y,
    kind: "truce-people",
  };
}

export const HANDOFF_PEOPLE_COPY =
  "The handoff is a house of people, not a listing of process. Listing still costs. Exhibition still decays. Cult does not pass. Combat is not. This was not a fetch.";
export const WINK_HANDOFF_PEOPLE = "People, not a print stick. The token does not strike.";
export const HANDOFF_PEOPLE_NEED = "The truce as people first. A handoff of people is not a fetch.";
export const HANDOFF_PEOPLE_MATE = "Stand at the stall with a print and another Angel. Cult does not pass.";
export const HANDOFF_PEOPLE_HELD = "The handoff already holds as people. Listing still costs.";
export const HANDOFF_PEOPLE_SPECTATOR = "Paper moves. You do not get a house of people.";

export const HANDOFF_PEOPLE_PLAQUE: Sign = {
  id: "handoff-people",
  title: "Handoff — people",
  text: "A house of people. Listing still costs. Cult does not pass. The number does not strike.",
  x: CLEARING_STALL.x,
  y: CLEARING_STALL.y,
};

export function handoffPeoplePoi(): Poi {
  return {
    id: "handoff-people",
    name: "Handoff — people",
    x: CLEARING_STALL.x,
    y: CLEARING_STALL.y,
    kind: "handoff-people",
  };
}

export const VAULT_PEOPLE_COPY =
  "The vault is a house of people, not a ledger of process. File still sits. TAKE stays disarmed. Combat is not. This was not a fetch.";
export const WINK_VAULT_PEOPLE = "People, not a vault stick. The token does not strike.";
export const VAULT_PEOPLE_NEED = "Handoff as people first. A vault of people is not a fetch.";
export const VAULT_PEOPLE_HELD = "The vault already holds as people. File still sits. TAKE stays disarmed.";
export const VAULT_PEOPLE_SPECTATOR = "A desk. You do not get a house of people.";

export const VAULT_PEOPLE_PLAQUE: Sign = {
  id: "vault-people",
  title: "The vault — people",
  text: "A house of people. File still sits. TAKE stays disarmed. The number does not strike.",
  x: CLAIMS_DESK.x,
  y: CLAIMS_DESK.y,
};

export function vaultPeoplePoi(): Poi {
  return {
    id: "vault-people",
    name: "The vault — people",
    x: CLAIMS_DESK.x,
    y: CLAIMS_DESK.y,
    kind: "vault-people",
  };
}

export const INSURANCE_PEOPLE_COPY =
  "The paper is a house of people, not a revive of process. Insurance still costs. Death still walks you. Combat is not. This was not a fetch.";
export const WINK_INSURANCE_PEOPLE = "People, not a paper stick. The token does not strike.";
export const INSURANCE_PEOPLE_NEED = "The vault as people first. A paper of people is not a fetch.";
export const INSURANCE_PEOPLE_HELD = "The paper already holds as people. Insurance still costs. Not a revive.";
export const INSURANCE_PEOPLE_SPECTATOR = "A shrine. You do not get a house of people.";

export const INSURANCE_PEOPLE_PLAQUE: Sign = {
  id: "insurance-people",
  title: "Insurance — people",
  text: "A house of people. Insurance still costs. Death still walks you. The number does not strike.",
  x: SHRINE.x,
  y: SHRINE.y,
};

export function insurancePeoplePoi(): Poi {
  return {
    id: "insurance-people",
    name: "Insurance — people",
    x: SHRINE.x,
    y: SHRINE.y,
    kind: "insurance-people",
  };
}

export const FUNERAL_PEOPLE_COPY =
  "The funeral is a house of people, not a sink of process. Twelve Bestand. The body is in the ground. Combat is not. This was not a fetch.";
export const WINK_FUNERAL_PEOPLE = "People, not a grave stick. The token does not strike.";
export const FUNERAL_PEOPLE_NEED = "Insurance as people first. A funeral of people is not a fetch.";
export const FUNERAL_PEOPLE_GRAVE = "Stand with a wreckage. Nara Vale does not work the empty street.";
export const FUNERAL_PEOPLE_HELD = "The funeral already holds as people. Twelve Bestand. The body is in the ground.";
export const FUNERAL_PEOPLE_SPECTATOR = "A grave. You do not get a house of people.";

export const FUNERAL_PEOPLE_PLAQUE: Sign = {
  id: "funeral-people",
  title: "Funeral — people",
  text: "A house of people. Twelve Bestand. The body is in the ground. The number does not strike.",
  x: 200,
  y: 480,
};

export function funeralPeoplePoi(x = 200, y = 480): Poi {
  return {
    id: "funeral-people",
    name: "Funeral — people",
    x,
    y,
    kind: "funeral-people",
  };
}

export const RESTORE_PEOPLE_COPY =
  "Restore is a house of people, not a heal of process. Aura still costs. Combat is not. This was not a fetch.";
export const WINK_RESTORE_PEOPLE = "People, not an aura stick. The token does not strike.";
export const RESTORE_PEOPLE_NEED = "The funeral as people first. A restore of people is not a fetch.";
export const RESTORE_PEOPLE_HELD = "Restore already holds as people. Aura still costs.";
export const RESTORE_PEOPLE_SPECTATOR = "A shrine. You do not get a house of people.";

export const RESTORE_PEOPLE_PLAQUE: Sign = {
  id: "restore-people",
  title: "Restore — people",
  text: "A house of people. Aura still costs. The number does not strike.",
  x: SHRINE.x,
  y: SHRINE.y,
};

export function restorePeoplePoi(): Poi {
  return {
    id: "restore-people",
    name: "Restore — people",
    x: SHRINE.x,
    y: SHRINE.y,
    kind: "restore-people",
  };
}

export const KEEP_PEOPLE_COPY =
  "Keep is a house of people, not a sink of process. Eight Bestand. Combat is not. This was not a fetch.";
export const WINK_KEEP_PEOPLE = "People, not a keep stick. The token does not strike.";
export const KEEP_PEOPLE_NEED = "Restore as people first. A keep of people is not a fetch.";
export const KEEP_PEOPLE_HELD = "Keep already holds as people. Eight Bestand still.";
export const KEEP_PEOPLE_SPECTATOR = "A shrine. You do not get a house of people.";

export const KEEP_PEOPLE_PLAQUE: Sign = {
  id: "keep-people",
  title: "Keep — people",
  text: "A house of people. Eight Bestand. The number does not strike.",
  x: SHRINE.x,
  y: SHRINE.y,
};

export function keepPeoplePoi(): Poi {
  return {
    id: "keep-people",
    name: "Keep — people",
    x: SHRINE.x,
    y: SHRINE.y,
    kind: "keep-people",
  };
}

export const TITHE_PEOPLE_COPY =
  "The tithe is a house of people, not an omen of process. Six Bestand still. Omen holds after upkeep. Combat is not. This was not a fetch.";
export const WINK_TITHE_PEOPLE = "People, not a tithe stick. The token does not strike.";
export const TITHE_PEOPLE_NEED = "Keep as people first. A tithe of people is not a fetch.";
export const TITHE_PEOPLE_HELD = "The tithe already holds as people. Six Bestand still. Omen holds after upkeep.";
export const TITHE_PEOPLE_SPECTATOR = "A hall. You do not get a house of people.";

export const TITHE_PEOPLE_PLAQUE: Sign = {
  id: "tithe-people",
  title: "Tithe — people",
  text: "A house of people. Six Bestand. Omen holds after upkeep. The number does not strike.",
  x: HOUSE_HALL.x,
  y: HOUSE_HALL.y,
};

export function tithePeoplePoi(): Poi {
  return {
    id: "tithe-people",
    name: "Tithe — people",
    x: HOUSE_HALL.x,
    y: HOUSE_HALL.y,
    kind: "tithe-people",
  };
}

export const FREEZE_PEOPLE_COPY =
  "The freeze is a house of people, not a katechon of process. Ten Bestand still. The Passing still starves. Combat is not. This was not a fetch.";
export const WINK_FREEZE_PEOPLE = "People, not a freeze stick. The token does not strike.";
export const FREEZE_PEOPLE_NEED = "The tithe as people first. A freeze of people is not a fetch.";
export const FREEZE_PEOPLE_HELD = "The freeze already holds as people. Ten Bestand still. The Passing still starves.";
export const FREEZE_PEOPLE_SPECTATOR = "A desk. You do not get a house of people.";

export const FREEZE_PEOPLE_PLAQUE: Sign = {
  id: "freeze-people",
  title: "Freeze — people",
  text: "A house of people. Ten Bestand. The Passing still starves. The number does not strike.",
  x: SAFETY_ANNEX.x,
  y: SAFETY_ANNEX.y,
};

export function freezePeoplePoi(): Poi {
  return {
    id: "freeze-people",
    name: "Freeze — people",
    x: SAFETY_ANNEX.x,
    y: SAFETY_ANNEX.y,
    kind: "freeze-people",
  };
}

export const REPAIR_PEOPLE_COPY =
  "Repair is a house of people, not a print of process. Seven Bestand still. Cult does not crack. Combat is not. This was not a fetch.";
export const WINK_REPAIR_PEOPLE = "People, not a repair stick. The token does not strike.";
export const REPAIR_PEOPLE_NEED = "The freeze as people first. A repair of people is not a fetch.";
export const REPAIR_PEOPLE_HELD = "Repair already holds as people. Seven Bestand still. Cult does not crack.";
export const REPAIR_PEOPLE_SPECTATOR = "A stall. You do not get a house of people.";

export const REPAIR_PEOPLE_PLAQUE: Sign = {
  id: "repair-people",
  title: "Repair — people",
  text: "A house of people. Seven Bestand. Cult does not crack. The number does not strike.",
  x: CLEARING_STALL.x,
  y: CLEARING_STALL.y,
};

export function repairPeoplePoi(): Poi {
  return {
    id: "repair-people",
    name: "Repair — people",
    x: CLEARING_STALL.x,
    y: CLEARING_STALL.y,
    kind: "repair-people",
  };
}

export const LISTING_PEOPLE_COPY =
  "Listing is a house of people, not a tray of process. The fee still sits. Combat is not. This was not a fetch.";
export const WINK_LISTING_PEOPLE = "People, not a listing stick. The token does not strike.";
export const LISTING_PEOPLE_NEED = "Repair as people first. A listing of people is not a fetch.";
export const LISTING_PEOPLE_HELD = "Listing already holds as people. The fee still sits.";
export const LISTING_PEOPLE_SPECTATOR = "A tray. You do not get a house of people.";

export const LISTING_PEOPLE_PLAQUE: Sign = {
  id: "listing-people",
  title: "Listing — people",
  text: "A house of people. The fee still sits. The number does not strike.",
  x: FORGE_TRAY.x,
  y: FORGE_TRAY.y,
};

export function listingPeoplePoi(): Poi {
  return {
    id: "listing-people",
    name: "Listing — people",
    x: FORGE_TRAY.x,
    y: FORGE_TRAY.y,
    kind: "listing-people",
  };
}

export const MARKET_PEOPLE_COPY =
  "The market is a house of people, not a hole of process. Forty Bestand still. The Clearing stays closed. Combat is not. This was not a fetch.";
export const WINK_MARKET_PEOPLE = "People, not a copy stick. The token does not strike.";
export const MARKET_PEOPLE_NEED = "Listing as people first. A market of people is not a fetch.";
export const MARKET_PEOPLE_HELD = "The market already holds as people. Forty Bestand still. The Clearing stays closed.";
export const MARKET_PEOPLE_SPECTATOR = "A stall of lights. You do not get a house of people.";

export const MARKET_PEOPLE_PLAQUE: Sign = {
  id: "market-people",
  title: "Market — people",
  text: "A house of people. Forty Bestand. The Clearing stays closed. The number does not strike.",
  x: CLEARING_STALL.x,
  y: CLEARING_STALL.y,
};

export function marketPeoplePoi(): Poi {
  return {
    id: "market-people",
    name: "Market — people",
    x: CLEARING_STALL.x,
    y: CLEARING_STALL.y,
    kind: "market-people",
  };
}

export const HANG_PEOPLE_COPY =
  "The hang is a house of people, not a listing of process. Cult still hangs. The stall still goes dark. Combat is not. This was not a fetch.";
export const WINK_HANG_PEOPLE = "People, not a sheet stick. The token does not strike.";
export const HANG_PEOPLE_NEED = "The market as people first. A hang of people is not a fetch.";
export const HANG_PEOPLE_HELD = "The hang already holds as people. Cult still hangs. The stall still goes dark.";
export const HANG_PEOPLE_SPECTATOR = "A stall. You do not get a house of people.";

export const HANG_PEOPLE_PLAQUE: Sign = {
  id: "hang-people",
  title: "Hang — people",
  text: "A house of people. Cult still hangs. The stall still goes dark. The number does not strike.",
  x: CLEARING_STALL.x,
  y: CLEARING_STALL.y,
};

export function hangPeoplePoi(): Poi {
  return {
    id: "hang-people",
    name: "Hang — people",
    x: CLEARING_STALL.x,
    y: CLEARING_STALL.y,
    kind: "hang-people",
  };
}

export const RESTRAINT_PEOPLE_COPY =
  "Holding-back is a house of people, not a dodge of process. Restraint still thins yield. Storm still burns it. Combat is not. This was not a fetch.";
export const WINK_RESTRAINT_PEOPLE = "People, not a dodge stick. The token does not strike.";
export const RESTRAINT_PEOPLE_NEED = "The hang as people first. Holding-back of people is not a fetch.";
export const RESTRAINT_PEOPLE_HELD = "Holding-back already holds as people. Restraint still thins yield. Storm still burns it.";
export const RESTRAINT_PEOPLE_SPECTATOR = "A shrine. You do not get a house of people.";

export const RESTRAINT_PEOPLE_PLAQUE: Sign = {
  id: "restraint-people",
  title: "Restraint — people",
  text: "A house of people. Restraint still thins yield. Storm still burns it. The number does not strike.",
  x: SHRINE.x,
  y: SHRINE.y,
};

export function restraintPeoplePoi(): Poi {
  return {
    id: "restraint-people",
    name: "Restraint — people",
    x: SHRINE.x,
    y: SHRINE.y,
    kind: "restraint-people",
  };
}

export const DODGE_PEOPLE_COPY =
  "Dodge is a house of people, not a window of process. Moving still skips. Standing still does not. Combat is not. This was not a fetch.";
export const WINK_DODGE_PEOPLE = "People, not a dodge stick. The token does not strike.";
export const DODGE_PEOPLE_NEED = "Restraint as people first. A dodge of people is not a fetch.";
export const DODGE_PEOPLE_HELD = "Dodge already holds as people. Moving still skips.";
export const DODGE_PEOPLE_SPECTATOR = "A shrine. You do not get a house of people.";

export const DODGE_PEOPLE_PLAQUE: Sign = {
  id: "dodge-people",
  title: "Dodge — people",
  text: "A house of people. Moving still skips. Standing still does not. The number does not strike.",
  x: SHRINE.x,
  y: SHRINE.y,
};

export function dodgePeoplePoi(): Poi {
  return {
    id: "dodge-people",
    name: "Dodge — people",
    x: SHRINE.x,
    y: SHRINE.y,
    kind: "dodge-people",
  };
}

export const HEAVY_PEOPLE_COPY =
  "Heavy is a house of people, not a bigger stick. Same number. Telegraph still drops. Combat is not. This was not a fetch.";
export const WINK_HEAVY_PEOPLE = "People, not a heavy stick. The token does not strike.";
export const HEAVY_PEOPLE_NEED = "Dodge as people first. A heavy of people is not a fetch.";
export const HEAVY_PEOPLE_HELD = "Heavy already holds as people. Same number. Telegraph still drops.";
export const HEAVY_PEOPLE_SPECTATOR = "An arena. You do not get a house of people.";

export const HEAVY_PEOPLE_PLAQUE: Sign = {
  id: "heavy-people",
  title: "Heavy — people",
  text: "A house of people. Same number. Telegraph still drops. The number does not strike.",
  x: GUEST_ARENA.x,
  y: GUEST_ARENA.y,
};

export function heavyPeoplePoi(): Poi {
  return {
    id: "heavy-people",
    name: "Heavy — people",
    x: GUEST_ARENA.x,
    y: GUEST_ARENA.y,
    kind: "heavy-people",
  };
}

export const HITSTOP_PEOPLE_COPY =
  "Hit-stop is a house of people, not a freeze of process. The hit still holds. You did not strike harder. Combat is not. This was not a fetch.";
export const WINK_HITSTOP_PEOPLE = "People, not a hold stick. The token does not strike.";
export const HITSTOP_PEOPLE_NEED = "Heavy as people first. A hit-stop of people is not a fetch.";
export const HITSTOP_PEOPLE_HELD = "Hit-stop already holds as people. The hit still holds. You did not strike harder.";
export const HITSTOP_PEOPLE_SPECTATOR = "An arena. You do not get a house of people.";

export const HITSTOP_PEOPLE_PLAQUE: Sign = {
  id: "hitstop-people",
  title: "Hit-stop — people",
  text: "A house of people. The hit still holds. You did not strike harder. The number does not strike.",
  x: GUEST_ARENA.x,
  y: GUEST_ARENA.y,
};

export function hitStopPeoplePoi(): Poi {
  return {
    id: "hitstop-people",
    name: "Hit-stop — people",
    x: GUEST_ARENA.x,
    y: GUEST_ARENA.y,
    kind: "hitstop-people",
  };
}

export const SPECTATE_PEOPLE_COPY =
  "Spectate is a house of people, not a faucet of process. Aura still caps. The duel still pays from a person. Combat is not. This was not a fetch.";
export const WINK_SPECTATE_PEOPLE = "People, not a watch stick. The token does not strike.";
export const SPECTATE_PEOPLE_NEED = "Hit-stop as people first. A watch of people is not a fetch.";
export const SPECTATE_PEOPLE_GRAVE = "Stand with a wreckage. A watch of people is not a fetch.";
export const SPECTATE_PEOPLE_HELD = "Spectate already holds as people. Aura still caps.";
export const SPECTATE_PEOPLE_SPECTATOR = "A grave. You do not get a house of people.";

export const SPECTATE_PEOPLE_PLAQUE: Sign = {
  id: "spectate-people",
  title: "Spectate — people",
  text: "A house of people. Aura still caps. The duel still pays from a person. The number does not strike.",
  x: 200,
  y: 480,
};

export function spectatePeoplePoi(x = 200, y = 480): Poi {
  return {
    id: "spectate-people",
    name: "Spectate — people",
    x,
    y,
    kind: "spectate-people",
  };
}

export const LASTWORD_PEOPLE_COPY =
  "The last word is a house of people, not a disappearance of process. Ione still speaks. Absence still waits. Combat is not. This was not a fetch.";
export const WINK_LASTWORD_PEOPLE = "People, not a last-word stick. The token does not strike.";
export const LASTWORD_PEOPLE_NEED = "Spectate as people first. A last word of people is not a fetch.";
export const LASTWORD_PEOPLE_HELD = "The last word already holds as people. Ione still speaks. Absence still waits.";
export const LASTWORD_PEOPLE_SPECTATOR = "Someone is leaving. You do not get a house of people.";

export const LASTWORD_PEOPLE_PLAQUE: Sign = {
  id: "lastword-people",
  title: "Last word — people",
  text: "A house of people. Ione still speaks. Absence still waits. The number does not strike.",
  x: IONE.x,
  y: IONE.y,
};

export function lastWordPeoplePoi(): Poi {
  return {
    id: "lastword-people",
    name: "Last word — people",
    x: IONE.x,
    y: IONE.y,
    kind: "lastword-people",
  };
}

export const DUEL_PEOPLE_COPY =
  "The ruin duel is a house of people, not a kit of process. The grave is still the ring. The kit still does not strike harder. Combat is not. This was not a fetch.";
export const WINK_DUEL_PEOPLE = "People, not a duel stick. The token does not strike.";
export const DUEL_PEOPLE_NEED = "Last-word as people first. A duel of people is not a fetch.";
export const DUEL_PEOPLE_GRAVE = "Stand with a wreckage. A duel of people is not a fetch.";
export const DUEL_PEOPLE_HELD = "The ruin duel already holds as people. The grave is still the ring.";
export const DUEL_PEOPLE_SPECTATOR = "A grave. You do not get a house of people.";

export const DUEL_PEOPLE_PLAQUE: Sign = {
  id: "duel-people",
  title: "Duel — people",
  text: "A house of people. The grave is still the ring. The kit still does not strike harder. The number does not strike.",
  x: 200,
  y: 480,
};

export function duelPeoplePoi(x = 200, y = 480): Poi {
  return {
    id: "duel-people",
    name: "Duel — people",
    x,
    y,
    kind: "duel-people",
  };
}

export const PASSING_PEOPLE_COPY =
  "The Passing is a house of people, not a season of process. Appearance still opens. Absence still waits. Combat is not. This was not a fetch.";
export const WINK_PASSING_PEOPLE = "People, not a Passing stick. The token does not strike.";
export const PASSING_PEOPLE_NEED = "Camp as people first. A Passing of people is not a fetch.";
export const PASSING_PEOPLE_HELD = "The Passing already holds as people. Appearance still opens. Absence still waits.";
export const PASSING_PEOPLE_SPECTATOR = "A ring. You do not get a house of people.";

export const PASSING_PEOPLE_PLAQUE: Sign = {
  id: "passing-people",
  title: "Passing — people",
  text: "A house of people. Appearance still opens. Absence still waits. The number does not strike.",
  x: 720,
  y: 580,
};

export function passingPeoplePoi(): Poi {
  return {
    id: "passing-people",
    name: "Passing — people",
    x: 720,
    y: 580,
    kind: "passing-people",
  };
}

export const CLAIMS_PEOPLE_COPY =
  "The claims desk is a house of people, not a mint of process. TAKE stays disarmed. The token does not strike. Combat is not. This was not a fetch.";
export const WINK_CLAIMS_PEOPLE = "People, not a claims stick. The token does not strike.";
export const CLAIMS_PEOPLE_NEED = "Passing as people first. A claims desk of people is not a fetch.";
export const CLAIMS_PEOPLE_HELD = "The claims desk already holds as people. TAKE stays disarmed.";
export const CLAIMS_PEOPLE_SPECTATOR = "Paper. You do not get a house of people.";

export const CLAIMS_PEOPLE_PLAQUE: Sign = {
  id: "claims-people",
  title: "Claims — people",
  text: "A house of people. TAKE stays disarmed. The number does not strike.",
  x: CLAIMS_DESK.x,
  y: CLAIMS_DESK.y,
};

export function claimsPeoplePoi(): Poi {
  return {
    id: "claims-people",
    name: "Claims — people",
    x: CLAIMS_DESK.x,
    y: CLAIMS_DESK.y,
    kind: "claims-people",
  };
}

export const FILE_PEOPLE_COPY =
  "Filing is a house of people, not a yield of process. File still sits. TAKE stays disarmed. Combat is not. This was not a fetch.";
export const WINK_FILE_PEOPLE = "People, not a file stick. The token does not strike.";
export const FILE_PEOPLE_NEED = "Claims as people first. A file of people is not a fetch.";
export const FILE_PEOPLE_HELD = "Filing already holds as people. File still sits. TAKE stays disarmed.";
export const FILE_PEOPLE_SPECTATOR = "Paper. You do not get a house of people.";

export const FILE_PEOPLE_PLAQUE: Sign = {
  id: "file-people",
  title: "File — people",
  text: "A house of people. File still sits. TAKE stays disarmed. The number does not strike.",
  x: CLAIMS_DESK.x,
  y: CLAIMS_DESK.y,
};

export function filePeoplePoi(): Poi {
  return {
    id: "file-people",
    name: "File — people",
    x: CLAIMS_DESK.x,
    y: CLAIMS_DESK.y,
    kind: "file-people",
  };
}

export const TAKE_PEOPLE_COPY =
  "TAKE is a house of people, not a mint of process. TAKE stays disarmed. No Base. Combat is not. This was not a fetch.";
export const WINK_TAKE_PEOPLE = "People, not a TAKE stick. The token does not strike.";
export const TAKE_PEOPLE_NEED = "Filing as people first. A TAKE of people is not a fetch.";
export const TAKE_PEOPLE_HELD = "TAKE already holds as people. TAKE stays disarmed. No Base.";
export const TAKE_PEOPLE_SPECTATOR = "Paper. You do not get a house of people.";

export const TAKE_PEOPLE_PLAQUE: Sign = {
  id: "take-people",
  title: "TAKE — people",
  text: "A house of people. TAKE stays disarmed. No Base. The number does not strike.",
  x: CLAIMS_DESK.x,
  y: CLAIMS_DESK.y,
};

export function takePeoplePoi(): Poi {
  return {
    id: "take-people",
    name: "TAKE — people",
    x: CLAIMS_DESK.x,
    y: CLAIMS_DESK.y,
    kind: "take-people",
  };
}

export const BANK_PEOPLE_COPY =
  "The vault is a house of people, not a yield of process. Banked still does not drop. TAKE stays disarmed. Combat is not. This was not a fetch.";
export const WINK_BANK_PEOPLE = "People, not a vault stick. The token does not strike.";
export const BANK_PEOPLE_NEED = "TAKE as people first. A vault of people is not a fetch.";
export const BANK_PEOPLE_HELD = "The vault already holds as people. Banked still does not drop. TAKE stays disarmed.";
export const BANK_PEOPLE_SPECTATOR = "A vault. You do not get a house of people.";

export const BANK_PEOPLE_PLAQUE: Sign = {
  id: "bank-people",
  title: "Bank — people",
  text: "A house of people. Banked still does not drop. TAKE stays disarmed. The number does not strike.",
  x: CLAIMS_DESK.x,
  y: CLAIMS_DESK.y,
};

export function bankPeoplePoi(): Poi {
  return {
    id: "bank-people",
    name: "Bank — people",
    x: CLAIMS_DESK.x,
    y: CLAIMS_DESK.y,
    kind: "bank-people",
  };
}

export const STORMPRESS_PEOPLE_COPY =
  "Storm-press is a house of people, not a skim of process. Geared graves still crack. Fallen graves still do not. Combat is not. This was not a fetch.";
export const WINK_STORMPRESS_PEOPLE = "People, not a progress stick. The token does not strike.";
export const STORMPRESS_PEOPLE_NEED = "The vault as people first. A storm-press of people is not a fetch.";
export const STORMPRESS_PEOPLE_HELD = "Storm-press already holds as people. Geared graves still crack. Fallen graves still do not.";
export const STORMPRESS_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const STORMPRESS_PEOPLE_PLAQUE: Sign = {
  id: "stormpress-people",
  title: "Storm-press — people",
  text: "A house of people. Geared graves still crack. Fallen graves still do not. The number does not strike.",
  x: 720,
  y: 520,
};

export function stormPressPeoplePoi(): Poi {
  return {
    id: "stormpress-people",
    name: "Storm-press — people",
    x: 720,
    y: 520,
    kind: "stormpress-people",
  };
}

export const FALLEN_PEOPLE_COPY =
  "Fallen graves are a house of people, not loot of process. Fallen graves still do not crack. Geared graves still crack. Combat is not. This was not a fetch.";
export const WINK_FALLEN_PEOPLE = "People, not a fallen stick. The token does not strike.";
export const FALLEN_PEOPLE_NEED = "Storm-press as people first. Fallen graves of people are not a fetch.";
export const FALLEN_PEOPLE_HELD = "Fallen graves already hold as people. Fallen graves still do not crack.";
export const FALLEN_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const FALLEN_PEOPLE_PLAQUE: Sign = {
  id: "fallen-people",
  title: "Fallen — people",
  text: "A house of people. Fallen graves still do not crack. Geared graves still crack. The number does not strike.",
  x: 720,
  y: 520,
};

export function fallenPeoplePoi(): Poi {
  return {
    id: "fallen-people",
    name: "Fallen — people",
    x: 720,
    y: 520,
    kind: "fallen-people",
  };
}

export const SPOILS_PEOPLE_COPY =
  "Spoils are a house of people, not a faucet of process. Unbanked still drops. Guests are not loot. Combat is not. This was not a fetch.";
export const WINK_SPOILS_PEOPLE = "People, not a spoils stick. The token does not strike.";
export const SPOILS_PEOPLE_NEED = "Fallen graves as people first. Spoils of people are not a fetch.";
export const SPOILS_PEOPLE_HELD = "Spoils already hold as people. Unbanked still drops. Guests are not loot.";
export const SPOILS_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const SPOILS_PEOPLE_PLAQUE: Sign = {
  id: "spoils-people",
  title: "Spoils — people",
  text: "A house of people. Unbanked still drops. Guests are not loot. The number does not strike.",
  x: 720,
  y: 520,
};

export function spoilsPeoplePoi(): Poi {
  return {
    id: "spoils-people",
    name: "Spoils — people",
    x: 720,
    y: 520,
    kind: "spoils-people",
  };
}

export const UNFLAG_PEOPLE_COPY =
  "Unflag is a house of people, not a stick of process. Unflag still opts out. Cult still hangs. Combat is not. This was not a fetch.";
export const WINK_UNFLAG_PEOPLE = "People, not an unflag stick. The token does not strike.";
export const UNFLAG_PEOPLE_NEED = "Spoils as people first. An unflag of people is not a fetch.";
export const UNFLAG_PEOPLE_HELD = "Unflag already holds as people. Unflag still opts out. Cult still hangs.";
export const UNFLAG_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const UNFLAG_PEOPLE_PLAQUE: Sign = {
  id: "unflag-people",
  title: "Unflag — people",
  text: "A house of people. Unflag still opts out. Cult still hangs. The number does not strike.",
  x: 720,
  y: 520,
};

export function unflagPeoplePoi(): Poi {
  return {
    id: "unflag-people",
    name: "Unflag — people",
    x: 720,
    y: 520,
    kind: "unflag-people",
  };
}

export const SECONDS_PEOPLE_COPY =
  "Seconds are a house of people, not a stick of process. Flagged street still lasts seconds. Combat is not. This was not a fetch.";
export const WINK_SECONDS_PEOPLE = "People, not a clock stick. The token does not strike.";
export const SECONDS_PEOPLE_NEED = "Unflag as people first. Seconds of people are not a fetch.";
export const SECONDS_PEOPLE_HELD = "Seconds already hold as people. Flagged street still lasts seconds.";
export const SECONDS_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const SECONDS_PEOPLE_PLAQUE: Sign = {
  id: "seconds-people",
  title: "Seconds — people",
  text: "A house of people. Flagged street still lasts seconds. The number does not strike.",
  x: 720,
  y: 520,
};

export function secondsPeoplePoi(): Poi {
  return {
    id: "seconds-people",
    name: "Seconds — people",
    x: 720,
    y: 520,
    kind: "seconds-people",
  };
}

export const STREET_PEOPLE_COPY =
  "The flagged street is a house of people, not a timer of process. Flag still opts in. Guests are not loot. Seconds still last. Combat is not. This was not a fetch.";
export const WINK_STREET_PEOPLE = "People, not a street stick. The token does not strike.";
export const STREET_PEOPLE_NEED = "Seconds as people first. A flagged street of people is not a fetch.";
export const STREET_PEOPLE_HELD = "The flagged street already holds as people. Flag still opts in. Guests are not loot.";
export const STREET_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const STREET_PEOPLE_PLAQUE: Sign = {
  id: "street-people",
  title: "Street — people",
  text: "A house of people. Flag still opts in. Guests are not loot. Seconds still last. The number does not strike.",
  x: 720,
  y: 520,
};

export function streetPeoplePoi(): Poi {
  return {
    id: "street-people",
    name: "Street — people",
    x: 720,
    y: 520,
    kind: "street-people",
  };
}

export const GRIEF_PEOPLE_COPY =
  "Grief is a house of people, not a spoils path. Protocol still rejects. Guests are not loot. Combat is not. This was not a fetch.";
export const WINK_GRIEF_PEOPLE = "People, not a grief stick. The token does not strike.";
export const GRIEF_PEOPLE_NEED = "The flagged street as people first. Grief of people is not a fetch.";
export const GRIEF_PEOPLE_HELD = "Grief already holds as people. Protocol still rejects. Guests are not loot.";
export const GRIEF_PEOPLE_SPECTATOR = "An arena. You do not get a house of people.";

export const GRIEF_PEOPLE_PLAQUE: Sign = {
  id: "grief-people",
  title: "Grief — people",
  text: "A house of people. Protocol still rejects. Guests are not loot. The number does not strike.",
  x: GUEST_ARENA.x,
  y: GUEST_ARENA.y,
};

export function griefPeoplePoi(): Poi {
  return {
    id: "grief-people",
    name: "Grief — people",
    x: GUEST_ARENA.x,
    y: GUEST_ARENA.y,
    kind: "grief-people",
  };
}

export const KIT_PEOPLE_COPY =
  "The kit is a house of people, not a bigger stick. Same number. Serials do not buy damage. Combat is not. This was not a fetch.";
export const WINK_KIT_PEOPLE = "People, not a kit stick. The token does not strike.";
export const KIT_PEOPLE_NEED = "Grief as people first. A kit of people is not a fetch.";
export const KIT_PEOPLE_HELD = "The kit already holds as people. Same number. Serials do not buy damage.";
export const KIT_PEOPLE_SPECTATOR = "An arena. You do not get a house of people.";

export const KIT_PEOPLE_PLAQUE: Sign = {
  id: "kit-people",
  title: "Kit — people",
  text: "A house of people. Same number. Serials do not buy damage. The number does not strike.",
  x: GUEST_ARENA.x,
  y: GUEST_ARENA.y,
};

export function kitPeoplePoi(): Poi {
  return {
    id: "kit-people",
    name: "Kit — people",
    x: GUEST_ARENA.x,
    y: GUEST_ARENA.y,
    kind: "kit-people",
  };
}

export const PRACTICE_PEOPLE_COPY =
  "Practice is a house of people, not a spoils path. The dummy still pays nothing. Guests are not loot. Combat is not. This was not a fetch.";
export const WINK_PRACTICE_PEOPLE = "People, not a dummy stick. The token does not strike.";
export const PRACTICE_PEOPLE_NEED = "The kit as people first. Practice of people is not a fetch.";
export const PRACTICE_PEOPLE_HELD = "Practice already holds as people. The dummy still pays nothing.";
export const PRACTICE_PEOPLE_SPECTATOR = "An arena. You do not get a house of people.";

export const PRACTICE_PEOPLE_PLAQUE: Sign = {
  id: "practice-people",
  title: "Practice — people",
  text: "A house of people. The dummy still pays nothing. Guests are not loot. The number does not strike.",
  x: GUEST_ARENA.x,
  y: GUEST_ARENA.y,
};

export function practicePeoplePoi(): Poi {
  return {
    id: "practice-people",
    name: "Practice — people",
    x: GUEST_ARENA.x,
    y: GUEST_ARENA.y,
    kind: "practice-people",
  };
}

export const DUMMY_PEOPLE_COPY =
  "The dummy is a house of people, not a payout of process. The dummy still pays nothing. Guests are not loot. Combat is not. This was not a fetch.";
export const WINK_DUMMY_PEOPLE = "People, not a dummy stick. The token does not strike.";
export const DUMMY_PEOPLE_NEED = "Practice as people first. A dummy of people is not a fetch.";
export const DUMMY_PEOPLE_HELD = "The dummy already holds as people. The dummy still pays nothing.";
export const DUMMY_PEOPLE_SPECTATOR = "An arena. You do not get a house of people.";

export const DUMMY_PEOPLE_PLAQUE: Sign = {
  id: "dummy-people",
  title: "Dummy — people",
  text: "A house of people. The dummy still pays nothing. Guests are not loot. The number does not strike.",
  x: GUEST_ARENA.x,
  y: GUEST_ARENA.y,
};

export function dummyPeoplePoi(): Poi {
  return {
    id: "dummy-people",
    name: "Dummy — people",
    x: GUEST_ARENA.x,
    y: GUEST_ARENA.y,
    kind: "dummy-people",
  };
}

export const GEARED_PEOPLE_COPY =
  "Geared graves are a house of people, not loot of process. Geared graves still crack. Fallen graves still do not. Combat is not. This was not a fetch.";
export const WINK_GEARED_PEOPLE = "People, not a gear stick. The token does not strike.";
export const GEARED_PEOPLE_NEED = "The dummy as people first. Geared graves of people are not a fetch.";
export const GEARED_PEOPLE_HELD = "Geared graves already hold as people. Geared graves still crack. Fallen graves still do not.";
export const GEARED_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const GEARED_PEOPLE_PLAQUE: Sign = {
  id: "geared-people",
  title: "Geared — people",
  text: "A house of people. Geared graves still crack. Fallen graves still do not. The number does not strike.",
  x: 720,
  y: 520,
};

export function gearedPeoplePoi(): Poi {
  return {
    id: "geared-people",
    name: "Geared — people",
    x: 720,
    y: 520,
    kind: "geared-people",
  };
}

export const SERIAL_PEOPLE_COPY =
  "Serials are a house of people, not a bigger stick. Serials stay visible. Serials do not buy damage. Combat is not. This was not a fetch.";
export const WINK_SERIAL_PEOPLE = "People, not a serial stick. The token does not strike.";
export const SERIAL_PEOPLE_NEED = "Geared graves as people first. Serials of people are not a fetch.";
export const SERIAL_PEOPLE_HELD = "Serials already hold as people. Serials stay visible. Serials do not buy damage.";
export const SERIAL_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const SERIAL_PEOPLE_PLAQUE: Sign = {
  id: "serial-people",
  title: "Serial — people",
  text: "A house of people. Serials stay visible. Serials do not buy damage. The number does not strike.",
  x: 720,
  y: 520,
};

export function serialPeoplePoi(): Poi {
  return {
    id: "serial-people",
    name: "Serial — people",
    x: 720,
    y: 520,
    kind: "serial-people",
  };
}

export const BAND_PEOPLE_COPY =
  "The band is a house of people, not a bigger stick. Two Angels, same skill, different serials: same number. Combat is not. This was not a fetch.";
export const WINK_BAND_PEOPLE = "People, not a band stick. The token does not strike.";
export const BAND_PEOPLE_NEED = "Serials as people first. A band of people is not a fetch.";
export const BAND_PEOPLE_HELD = "The band already holds as people. Same skill, different serials: same number.";
export const BAND_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const BAND_PEOPLE_PLAQUE: Sign = {
  id: "band-people",
  title: "Band — people",
  text: "A house of people. Same skill, different serials: same number. The number does not strike.",
  x: 720,
  y: 520,
};

export function bandPeoplePoi(): Poi {
  return {
    id: "band-people",
    name: "Band — people",
    x: 720,
    y: 520,
    kind: "band-people",
  };
}

export const NUMBER_PEOPLE_COPY =
  "The number is a house of people, not a kit of process. Same skill, different serials: same number. Combat is not. This was not a fetch.";
export const WINK_NUMBER_PEOPLE = "People, not a number stick. The token does not strike.";
export const NUMBER_PEOPLE_NEED = "The band as people first. A number of people is not a fetch.";
export const NUMBER_PEOPLE_HELD = "The number already holds as people. Same skill, different serials: same number.";
export const NUMBER_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const NUMBER_PEOPLE_PLAQUE: Sign = {
  id: "number-people",
  title: "Number — people",
  text: "A house of people. Same skill, different serials: same number. The number does not strike.",
  x: 720,
  y: 520,
};

export function numberPeoplePoi(): Poi {
  return {
    id: "number-people",
    name: "Number — people",
    x: 720,
    y: 520,
    kind: "number-people",
  };
}

export const SKILL_PEOPLE_COPY =
  "Skill is a house of people, not a trait of process. Skill still wins. Traits do not buy the fight. Combat is not. This was not a fetch.";
export const WINK_SKILL_PEOPLE = "People, not a skill stick. The token does not strike.";
export const SKILL_PEOPLE_NEED = "The number as people first. Skill of people is not a fetch.";
export const SKILL_PEOPLE_HELD = "Skill already holds as people. Skill still wins. Traits do not buy the fight.";
export const SKILL_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const SKILL_PEOPLE_PLAQUE: Sign = {
  id: "skill-people",
  title: "Skill — people",
  text: "A house of people. Skill still wins. Traits do not buy the fight. The number does not strike.",
  x: 720,
  y: 520,
};

export function skillPeoplePoi(): Poi {
  return {
    id: "skill-people",
    name: "Skill — people",
    x: 720,
    y: 520,
    kind: "skill-people",
  };
}

export const TRAIT_PEOPLE_COPY =
  "Traits are a house of people, not a bigger stick. Traits do not buy damage. Serials stay visible. Combat is not. This was not a fetch.";
export const WINK_TRAIT_PEOPLE = "People, not a trait stick. The token does not strike.";
export const TRAIT_PEOPLE_NEED = "Skill as people first. Traits of people are not a fetch.";
export const TRAIT_PEOPLE_HELD = "Traits already hold as people. Traits do not buy damage. Serials stay visible.";
export const TRAIT_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const TRAIT_PEOPLE_PLAQUE: Sign = {
  id: "trait-people",
  title: "Trait — people",
  text: "A house of people. Traits do not buy damage. Serials stay visible. The number does not strike.",
  x: 720,
  y: 520,
};

export function traitPeoplePoi(): Poi {
  return {
    id: "trait-people",
    name: "Trait — people",
    x: 720,
    y: 520,
    kind: "trait-people",
  };
}

export const TOKEN_PEOPLE_COPY =
  "The token is a house of people, not a combat stick. The token never buys combat. TAKE stays disarmed. Combat is not. This was not a fetch.";
export const WINK_TOKEN_PEOPLE = "People, not a token stick. The token does not strike.";
export const TOKEN_PEOPLE_NEED = "Traits as people first. A token of people is not a fetch.";
export const TOKEN_PEOPLE_HELD = "The token already holds as people. The token never buys combat. TAKE stays disarmed.";
export const TOKEN_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const TOKEN_PEOPLE_PLAQUE: Sign = {
  id: "token-people",
  title: "Token — people",
  text: "A house of people. The token never buys combat. TAKE stays disarmed. The number does not strike.",
  x: 720,
  y: 520,
};

export function tokenPeoplePoi(): Poi {
  return {
    id: "token-people",
    name: "Token — people",
    x: 720,
    y: 520,
    kind: "token-people",
  };
}

export const FAIR_PEOPLE_COPY =
  "The published band is a house of people, not a kit of process. Same skill, different serials: same number. Serials stay visible. Combat is not. This was not a fetch.";
export const WINK_FAIR_PEOPLE = "People, not a fairness stick. The token does not strike.";
export const FAIR_PEOPLE_NEED = "The token as people first. A published band of people is not a fetch.";
export const FAIR_PEOPLE_HELD = "The published band already holds as people. Same skill, different serials: same number.";
export const FAIR_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const FAIR_PEOPLE_PLAQUE: Sign = {
  id: "fair-people",
  title: "Fair — people",
  text: "A house of people. Same skill, different serials: same number. Serials stay visible. The number does not strike.",
  x: 720,
  y: 520,
};

export function fairPeoplePoi(): Poi {
  return {
    id: "fair-people",
    name: "Fair — people",
    x: 720,
    y: 520,
    kind: "fair-people",
  };
}

export const VISIBLE_PEOPLE_COPY =
  "Visibility is a house of people, not a ledger of process. Serials stay visible. Serials do not buy damage. Combat is not. This was not a fetch.";
export const WINK_VISIBLE_PEOPLE = "People, not a visibility stick. The token does not strike.";
export const VISIBLE_PEOPLE_NEED = "The published band as people first. Visibility of people is not a fetch.";
export const VISIBLE_PEOPLE_HELD = "Visibility already holds as people. Serials stay visible. Serials do not buy damage.";
export const VISIBLE_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const VISIBLE_PEOPLE_PLAQUE: Sign = {
  id: "visible-people",
  title: "Visible — people",
  text: "A house of people. Serials stay visible. Serials do not buy damage. The number does not strike.",
  x: 720,
  y: 520,
};

export function visiblePeoplePoi(): Poi {
  return {
    id: "visible-people",
    name: "Visible — people",
    x: 720,
    y: 520,
    kind: "visible-people",
  };
}

export const AURA_PEOPLE_COPY =
  "Aura is a house of people, not a combat stick. Aura still withers. Aura is not damage. Combat is not. This was not a fetch.";
export const WINK_AURA_PEOPLE = "People, not an aura stick. The token does not strike.";
export const AURA_PEOPLE_NEED = "Visibility as people first. Aura of people is not a fetch.";
export const AURA_PEOPLE_HELD = "Aura already holds as people. Aura still withers. Aura is not damage.";
export const AURA_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const AURA_PEOPLE_PLAQUE: Sign = {
  id: "aura-people",
  title: "Aura — people",
  text: "A house of people. Aura still withers. Aura is not damage. The number does not strike.",
  x: 720,
  y: 520,
};

export function auraPeoplePoi(): Poi {
  return {
    id: "aura-people",
    name: "Aura — people",
    x: 720,
    y: 520,
    kind: "aura-people",
  };
}

export const PRESENCE_PEOPLE_COPY =
  "Presence is a house of people, not a stick of process. Presence still addresses. Presence is not damage. Combat is not. This was not a fetch.";
export const WINK_PRESENCE_PEOPLE = "People, not a presence stick. The token does not strike.";
export const PRESENCE_PEOPLE_NEED = "Aura as people first. Presence of people is not a fetch.";
export const PRESENCE_PEOPLE_HELD = "Presence already holds as people. Presence still addresses. Presence is not damage.";
export const PRESENCE_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const PRESENCE_PEOPLE_PLAQUE: Sign = {
  id: "presence-people",
  title: "Presence — people",
  text: "A house of people. Presence still addresses. Presence is not damage. The number does not strike.",
  x: 720,
  y: 520,
};

export function presencePeoplePoi(): Poi {
  return {
    id: "presence-people",
    name: "Presence — people",
    x: 720,
    y: 520,
    kind: "presence-people",
  };
}

export const WINK_PEOPLE_COPY =
  "Winke are a house of people, not a withdraw of process. Winke never withdraw. TAKE stays disarmed. Combat is not. This was not a fetch.";
export const WINK_WINK_PEOPLE = "People, not a wink stick. The token does not strike.";
export const WINK_PEOPLE_NEED = "Presence as people first. Winke of people are not a fetch.";
export const WINK_PEOPLE_HELD = "Winke already hold as people. Winke never withdraw. TAKE stays disarmed.";
export const WINK_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const WINK_PEOPLE_PLAQUE: Sign = {
  id: "wink-people",
  title: "Wink — people",
  text: "A house of people. Winke never withdraw. TAKE stays disarmed. The number does not strike.",
  x: 720,
  y: 520,
};

export function winkPeoplePoi(): Poi {
  return {
    id: "wink-people",
    name: "Wink — people",
    x: 720,
    y: 520,
    kind: "wink-people",
  };
}

export const BESTAND_PEOPLE_COPY =
  "Bestand is a house of people, not a token of process. Bestand still spends. The token never buys combat. TAKE stays disarmed. Combat is not. This was not a fetch.";
export const WINK_BESTAND_PEOPLE = "People, not a Bestand stick. The token does not strike.";
export const BESTAND_PEOPLE_NEED = "Winke as people first. Bestand of people is not a fetch.";
export const BESTAND_PEOPLE_HELD = "Bestand already holds as people. Bestand still spends. The token never buys combat.";
export const BESTAND_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const BESTAND_PEOPLE_PLAQUE: Sign = {
  id: "bestand-people",
  title: "Bestand — people",
  text: "A house of people. Bestand still spends. The token never buys combat. TAKE stays disarmed. The number does not strike.",
  x: 720,
  y: 520,
};

export function bestandPeoplePoi(): Poi {
  return {
    id: "bestand-people",
    name: "Bestand — people",
    x: 720,
    y: 520,
    kind: "bestand-people",
  };
}

export const CULT_PEOPLE_COPY =
  "Cult is a house of people, not a listing of process. Cult still does not drop. Cult does not list. Combat is not. This was not a fetch.";
export const WINK_CULT_PEOPLE = "People, not a cult stick. The token does not strike.";
export const CULT_PEOPLE_NEED = "Bestand as people first. Cult of people is not a fetch.";
export const CULT_PEOPLE_HELD = "Cult already holds as people. Cult still does not drop. Cult does not list.";
export const CULT_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const CULT_PEOPLE_PLAQUE: Sign = {
  id: "cult-people",
  title: "Cult — people",
  text: "A house of people. Cult still does not drop. Cult does not list. The number does not strike.",
  x: 720,
  y: 520,
};

export function cultPeoplePoi(): Poi {
  return {
    id: "cult-people",
    name: "Cult — people",
    x: 720,
    y: 520,
    kind: "cult-people",
  };
}

export const COPY_PEOPLE_COPY =
  "Copies are a house of people, not a faucet of process. Copies still decay. Listing still costs. Cult does not list. Combat is not. This was not a fetch.";
export const WINK_COPY_PEOPLE = "People, not a copy stick. The token does not strike.";
export const COPY_PEOPLE_NEED = "Cult as people first. Copies of people are not a fetch.";
export const COPY_PEOPLE_HELD = "Copies already hold as people. Copies still decay. Listing still costs.";
export const COPY_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const COPY_PEOPLE_PLAQUE: Sign = {
  id: "copy-people",
  title: "Copy — people",
  text: "A house of people. Copies still decay. Listing still costs. Cult does not list. The number does not strike.",
  x: 720,
  y: 520,
};

export function copyPeoplePoi(): Poi {
  return {
    id: "copy-people",
    name: "Copy — people",
    x: 720,
    y: 520,
    kind: "copy-people",
  };
}

export const BANKED_PEOPLE_COPY =
  "Banked is a house of people, not a drop of process. Banked still does not drop. TAKE stays disarmed. Combat is not. This was not a fetch.";
export const WINK_BANKED_PEOPLE = "People, not a banked stick. The token does not strike.";
export const BANKED_PEOPLE_NEED = "Copies as people first. Banked of people is not a fetch.";
export const BANKED_PEOPLE_HELD = "Banked already holds as people. Banked still does not drop. TAKE stays disarmed.";
export const BANKED_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const BANKED_PEOPLE_PLAQUE: Sign = {
  id: "banked-people",
  title: "Banked — people",
  text: "A house of people. Banked still does not drop. TAKE stays disarmed. The number does not strike.",
  x: 720,
  y: 520,
};

export function bankedPeoplePoi(): Poi {
  return {
    id: "banked-people",
    name: "Banked — people",
    x: 720,
    y: 520,
    kind: "banked-people",
  };
}

export const UNBANKED_PEOPLE_COPY =
  "Unbanked is a house of people, not a loot of process. Unbanked still drops. Guests are not loot. Combat is not. This was not a fetch.";
export const WINK_UNBANKED_PEOPLE = "People, not an unbanked stick. The token does not strike.";
export const UNBANKED_PEOPLE_NEED = "Banked as people first. Unbanked of people is not a fetch.";
export const UNBANKED_PEOPLE_HELD = "Unbanked already holds as people. Unbanked still drops. Guests are not loot.";
export const UNBANKED_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const UNBANKED_PEOPLE_PLAQUE: Sign = {
  id: "unbanked-people",
  title: "Unbanked — people",
  text: "A house of people. Unbanked still drops. Guests are not loot. The number does not strike.",
  x: 720,
  y: 520,
};

export function unbankedPeoplePoi(): Poi {
  return {
    id: "unbanked-people",
    name: "Unbanked — people",
    x: 720,
    y: 520,
    kind: "unbanked-people",
  };
}

export const SINK_PEOPLE_COPY =
  "A sink is a house of people, not a faucet of process. Every earner still spends. Banked is a sink, not a stick. Combat is not. This was not a fetch.";
export const WINK_SINK_PEOPLE = "People, not a sink stick. The token does not strike.";
export const SINK_PEOPLE_NEED = "Unbanked as people first. A sink of people is not a fetch.";
export const SINK_PEOPLE_HELD = "The sink already holds as people. Every earner still spends. Banked is a sink, not a stick.";
export const SINK_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const SINK_PEOPLE_PLAQUE: Sign = {
  id: "sink-people",
  title: "Sink — people",
  text: "A house of people. Every earner still spends. Banked is a sink, not a stick. The number does not strike.",
  x: 720,
  y: 520,
};

export function sinkPeoplePoi(): Poi {
  return {
    id: "sink-people",
    name: "Sink — people",
    x: 720,
    y: 520,
    kind: "sink-people",
  };
}

export const YIELD_PEOPLE_COPY =
  "Yield is a house of people, not a stick of process. Yield still drinks Gestell. Keep still costs. Combat is not. This was not a fetch.";
export const WINK_YIELD_PEOPLE = "People, not a yield stick. The token does not strike.";
export const YIELD_PEOPLE_NEED = "The sink as people first. Yield of people is not a fetch.";
export const YIELD_PEOPLE_HELD = "Yield already holds as people. Yield still drinks Gestell. Keep still costs.";
export const YIELD_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const YIELD_PEOPLE_PLAQUE: Sign = {
  id: "yield-people",
  title: "Yield — people",
  text: "A house of people. Yield still drinks Gestell. Keep still costs. The number does not strike.",
  x: 720,
  y: 520,
};

export function yieldPeoplePoi(): Poi {
  return {
    id: "yield-people",
    name: "Yield — people",
    x: 720,
    y: 520,
    kind: "yield-people",
  };
}

export const TAX_PEOPLE_COPY =
  "Tax is a house of people, not a stick of process. Hall tax still skims. The number does not strike. Combat is not. This was not a fetch.";
export const WINK_TAX_PEOPLE = "People, not a tax stick. The token does not strike.";
export const TAX_PEOPLE_NEED = "Yield as people first. Tax of people is not a fetch.";
export const TAX_PEOPLE_HELD = "Tax already holds as people. Hall tax still skims. The number does not strike.";
export const TAX_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const TAX_PEOPLE_PLAQUE: Sign = {
  id: "tax-people",
  title: "Tax — people",
  text: "A house of people. Hall tax still skims. The number does not strike.",
  x: 720,
  y: 520,
};

export function taxPeoplePoi(): Poi {
  return {
    id: "tax-people",
    name: "Tax — people",
    x: 720,
    y: 520,
    kind: "tax-people",
  };
}

export const GESTELL_PEOPLE_COPY =
  "Gestell is a house of people, not a farm of process. Gestell still rises. Yield still drinks Gestell. Combat is not. This was not a fetch.";
export const WINK_GESTELL_PEOPLE = "People, not a Gestell stick. The token does not strike.";
export const GESTELL_PEOPLE_NEED = "Tax as people first. Gestell of people is not a fetch.";
export const GESTELL_PEOPLE_HELD = "Gestell already holds as people. Gestell still rises. Yield still drinks Gestell.";
export const GESTELL_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const GESTELL_PEOPLE_PLAQUE: Sign = {
  id: "gestell-people",
  title: "Gestell — people",
  text: "A house of people. Gestell still rises. Yield still drinks Gestell. The number does not strike.",
  x: 720,
  y: 520,
};

export function gestellPeoplePoi(): Poi {
  return {
    id: "gestell-people",
    name: "Gestell — people",
    x: 720,
    y: 520,
    kind: "gestell-people",
  };
}

export const CLIMATE_PEOPLE_COPY =
  "Climate is a house of people, not a pie of process. Climate still ticks. Yield still drinks Gestell. Combat is not. This was not a fetch.";
export const WINK_CLIMATE_PEOPLE = "People, not a climate stick. The token does not strike.";
export const CLIMATE_PEOPLE_NEED = "Gestell as people first. Climate of people is not a fetch.";
export const CLIMATE_PEOPLE_HELD = "Climate already holds as people. Climate still ticks. Yield still drinks Gestell.";
export const CLIMATE_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const CLIMATE_PEOPLE_PLAQUE: Sign = {
  id: "climate-people",
  title: "Climate — people",
  text: "A house of people. Climate still ticks. Yield still drinks Gestell. The number does not strike.",
  x: 720,
  y: 520,
};

export function climatePeoplePoi(): Poi {
  return {
    id: "climate-people",
    name: "Climate — people",
    x: 720,
    y: 520,
    kind: "climate-people",
  };
}

export const EXTRACT_PEOPLE_COPY =
  "Extract is a house of people, not a faucet of process. Extract still pays. Keep still costs. Combat is not. This was not a fetch.";
export const WINK_EXTRACT_PEOPLE = "People, not an extract stick. The token does not strike.";
export const EXTRACT_PEOPLE_NEED = "Climate as people first. Extract of people is not a fetch.";
export const EXTRACT_PEOPLE_HELD = "Extract already holds as people. Extract still pays. Keep still costs.";
export const EXTRACT_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const EXTRACT_PEOPLE_PLAQUE: Sign = {
  id: "extract-people",
  title: "Extract — people",
  text: "A house of people. Extract still pays. Keep still costs. The number does not strike.",
  x: 720,
  y: 520,
};

export function extractPeoplePoi(): Poi {
  return {
    id: "extract-people",
    name: "Extract — people",
    x: 720,
    y: 520,
    kind: "extract-people",
  };
}

export const MAX_PEOPLE_COPY =
  "Max climate is a house of people, not a flag of process. Gestell 91 still flags the street. Flag still opts in. Combat is not. This was not a fetch.";
export const WINK_MAX_PEOPLE = "People, not a max stick. The token does not strike.";
export const MAX_PEOPLE_NEED = "Extract as people first. Max climate of people is not a fetch.";
export const MAX_PEOPLE_HELD = "Max climate already holds as people. Gestell 91 still flags the street. Flag still opts in.";
export const MAX_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const MAX_PEOPLE_PLAQUE: Sign = {
  id: "max-people",
  title: "Max — people",
  text: "A house of people. Gestell 91 still flags the street. Flag still opts in. The number does not strike.",
  x: 720,
  y: 520,
};

export function maxPeoplePoi(): Poi {
  return {
    id: "max-people",
    name: "Max — people",
    x: 720,
    y: 520,
    kind: "max-people",
  };
}

export const HEAT_PEOPLE_COPY =
  "Heat is a house of people, not a flag of process. Gestell 91 still flags the street. Flag still opts in. Combat is not. This was not a fetch.";
export const WINK_HEAT_PEOPLE = "People, not a heat stick. The token does not strike.";
export const HEAT_PEOPLE_NEED = "Max climate as people first. Heat of people is not a fetch.";
export const HEAT_PEOPLE_HELD = "Heat already holds as people. Gestell 91 still flags the street. Flag still opts in.";
export const HEAT_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const HEAT_PEOPLE_PLAQUE: Sign = {
  id: "heat-people",
  title: "Heat — people",
  text: "A house of people. Gestell 91 still flags the street. Flag still opts in. The number does not strike.",
  x: 720,
  y: 520,
};

export function heatPeoplePoi(): Poi {
  return {
    id: "heat-people",
    name: "Heat — people",
    x: 720,
    y: 520,
    kind: "heat-people",
  };
}

export const FAT_PEOPLE_COPY =
  "Fat yield is a house of people, not a faucet of process. Fat yield still drinks. Sacred doors still dim. Combat is not. This was not a fetch.";
export const WINK_FAT_PEOPLE = "People, not a fat stick. The token does not strike.";
export const FAT_PEOPLE_NEED = "Heat as people first. Fat yield of people is not a fetch.";
export const FAT_PEOPLE_HELD = "Fat yield already holds as people. Fat yield still drinks. Sacred doors still dim.";
export const FAT_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const FAT_PEOPLE_PLAQUE: Sign = {
  id: "fat-people",
  title: "Fat — people",
  text: "A house of people. Fat yield still drinks. Sacred doors still dim. The number does not strike.",
  x: 720,
  y: 520,
};

export function fatPeoplePoi(): Poi {
  return {
    id: "fat-people",
    name: "Fat — people",
    x: 720,
    y: 520,
    kind: "fat-people",
  };
}

export const POOR_PEOPLE_COPY =
  "Poor yield is a house of people, not a hole of process. Low climate still keeps Clearings. Yield still poor. Combat is not. This was not a fetch.";
export const WINK_POOR_PEOPLE = "People, not a poor stick. The token does not strike.";
export const POOR_PEOPLE_NEED = "Fat yield as people first. Poor yield of people is not a fetch.";
export const POOR_PEOPLE_HELD = "Poor yield already holds as people. Low climate still keeps Clearings. Yield still poor.";
export const POOR_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const POOR_PEOPLE_PLAQUE: Sign = {
  id: "poor-people",
  title: "Poor — people",
  text: "A house of people. Low climate still keeps Clearings. Yield still poor. The number does not strike.",
  x: 720,
  y: 520,
};

export function poorPeoplePoi(): Poi {
  return {
    id: "poor-people",
    name: "Poor — people",
    x: 720,
    y: 520,
    kind: "poor-people",
  };
}

export const BLOCK_PEOPLE_COPY =
  "The block is a house of people, not a god of process. Gestell 100 still blocks a Passing without a Clearing. Solo cannot force Appearance. Combat is not. This was not a fetch.";
export const WINK_BLOCK_PEOPLE = "People, not a block stick. The token does not strike.";
export const BLOCK_PEOPLE_NEED = "Poor yield as people first. A block of people is not a fetch.";
export const BLOCK_PEOPLE_HELD = "The block already holds as people. Gestell 100 still blocks a Passing without a Clearing.";
export const BLOCK_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const BLOCK_PEOPLE_PLAQUE: Sign = {
  id: "block-people",
  title: "Block — people",
  text: "A house of people. Gestell 100 still blocks a Passing without a Clearing. Solo cannot force Appearance. The number does not strike.",
  x: 720,
  y: 520,
};

export function blockPeoplePoi(): Poi {
  return {
    id: "block-people",
    name: "Block — people",
    x: 720,
    y: 520,
    kind: "block-people",
  };
}

export const SOLO_PEOPLE_COPY =
  "Solo is a house of people, not a god of process. Solo cannot force Appearance. Gestell 100 still blocks a Passing without a Clearing. Combat is not. This was not a fetch.";
export const WINK_SOLO_PEOPLE = "People, not a solo stick. The token does not strike.";
export const SOLO_PEOPLE_NEED = "The block as people first. Solo of people is not a fetch.";
export const SOLO_PEOPLE_HELD = "Solo already holds as people. Solo cannot force Appearance. Gestell 100 still blocks a Passing without a Clearing.";
export const SOLO_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const SOLO_PEOPLE_PLAQUE: Sign = {
  id: "solo-people",
  title: "Solo — people",
  text: "A house of people. Solo cannot force Appearance. Gestell 100 still blocks a Passing without a Clearing. The number does not strike.",
  x: 720,
  y: 520,
};

export function soloPeoplePoi(): Poi {
  return {
    id: "solo-people",
    name: "Solo — people",
    x: 720,
    y: 520,
    kind: "solo-people",
  };
}

export const DWELL_PEOPLE_COPY =
  "Dwelling is a house of people, not a god of process. Two dwellers still open Appearance. Solo cannot force it. Combat is not. This was not a fetch.";
export const WINK_DWELL_PEOPLE = "People, not a dwell stick. The token does not strike.";
export const DWELL_PEOPLE_NEED = "Solo as people first. Dwelling of people is not a fetch.";
export const DWELL_PEOPLE_HELD = "Dwelling already holds as people. Two dwellers still open Appearance. Solo cannot force it.";
export const DWELL_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const DWELL_PEOPLE_PLAQUE: Sign = {
  id: "dwell-people",
  title: "Dwell — people",
  text: "A house of people. Two dwellers still open Appearance. Solo cannot force it. The number does not strike.",
  x: 720,
  y: 520,
};

export function dwellPeoplePoi(): Poi {
  return {
    id: "dwell-people",
    name: "Dwell — people",
    x: 720,
    y: 520,
    kind: "dwell-people",
  };
}

export const TRACE_PEOPLE_COPY =
  "The trace is a house of people, not a character of process. Appearance is a trace, not a model. Aura still holds. Combat is not. This was not a fetch.";
export const WINK_TRACE_PEOPLE = "People, not a trace stick. The token does not strike.";
export const TRACE_PEOPLE_NEED = "Dwelling as people first. A trace of people is not a fetch.";
export const TRACE_PEOPLE_HELD = "The trace already holds as people. Appearance is a trace, not a model. Aura still holds.";
export const TRACE_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const TRACE_PEOPLE_PLAQUE: Sign = {
  id: "trace-people",
  title: "Trace — people",
  text: "A house of people. Appearance is a trace, not a model. Aura still holds. The number does not strike.",
  x: 720,
  y: 520,
};

export function tracePeoplePoi(): Poi {
  return {
    id: "trace-people",
    name: "Trace — people",
    x: 720,
    y: 520,
    kind: "trace-people",
  };
}

export const FAIL_PEOPLE_COPY =
  "Failure is a house of people, not a stipend of process. A failed Passing still writes the hole. No stipend. Combat is not. This was not a fetch.";
export const WINK_FAIL_PEOPLE = "People, not a fail stick. The token does not strike.";
export const FAIL_PEOPLE_NEED = "The trace as people first. Failure of people is not a fetch.";
export const FAIL_PEOPLE_HELD = "Failure already holds as people. A failed Passing still writes the hole. No stipend.";
export const FAIL_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const FAIL_PEOPLE_PLAQUE: Sign = {
  id: "fail-people",
  title: "Fail — people",
  text: "A house of people. A failed Passing still writes the hole. No stipend. The number does not strike.",
  x: 720,
  y: 520,
};

export function failPeoplePoi(): Poi {
  return {
    id: "fail-people",
    name: "Fail — people",
    x: 720,
    y: 520,
    kind: "fail-people",
  };
}

export const HOLE_PEOPLE_COPY =
  "The hole is a house of people, not a stipend of process. A failed Passing still writes the hole. No stipend. Combat is not. This was not a fetch.";
export const WINK_HOLE_PEOPLE = "People, not a hole stick. The token does not strike.";
export const HOLE_PEOPLE_NEED = "Failure as people first. A hole of people is not a fetch.";
export const HOLE_PEOPLE_HELD = "The hole already holds as people. A failed Passing still writes the hole. No stipend.";
export const HOLE_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const HOLE_PEOPLE_PLAQUE: Sign = {
  id: "hole-people",
  title: "Hole — people",
  text: "A house of people. A failed Passing still writes the hole. No stipend. The number does not strike.",
  x: 720,
  y: 520,
};

export function holePeoplePoi(): Poi {
  return {
    id: "hole-people",
    name: "Hole — people",
    x: 720,
    y: 520,
    kind: "hole-people",
  };
}

export const STIPEND_PEOPLE_COPY =
  "The stipend is a house of people, not a yield of process. Appearance still pays cult upkeep. Absence pays none. Combat is not. This was not a fetch.";
export const WINK_STIPEND_PEOPLE = "People, not a stipend stick. The token does not strike.";
export const STIPEND_PEOPLE_NEED = "The hole as people first. A stipend of people is not a fetch.";
export const STIPEND_PEOPLE_HELD = "The stipend already holds as people. Appearance still pays cult upkeep. Absence pays none.";
export const STIPEND_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const STIPEND_PEOPLE_PLAQUE: Sign = {
  id: "stipend-people",
  title: "Stipend — people",
  text: "A house of people. Appearance still pays cult upkeep. Absence pays none. The number does not strike.",
  x: 720,
  y: 520,
};

export function stipendPeoplePoi(): Poi {
  return {
    id: "stipend-people",
    name: "Stipend — people",
    x: 720,
    y: 520,
    kind: "stipend-people",
  };
}

export const HIJACK_PEOPLE_COPY =
  "Hijack is a house of people, not a god of process. Freeze or Cold still hijacks the Clearing. Combat is not. This was not a fetch.";
export const WINK_HIJACK_PEOPLE = "People, not a hijack stick. The token does not strike.";
export const HIJACK_PEOPLE_NEED = "The stipend as people first. Hijack of people is not a fetch.";
export const HIJACK_PEOPLE_HELD = "Hijack already holds as people. Freeze or Cold still hijacks the Clearing.";
export const HIJACK_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const HIJACK_PEOPLE_PLAQUE: Sign = {
  id: "hijack-people",
  title: "Hijack — people",
  text: "A house of people. Freeze or Cold still hijacks the Clearing. The number does not strike.",
  x: 720,
  y: 520,
};

export function hijackPeoplePoi(): Poi {
  return {
    id: "hijack-people",
    name: "Hijack — people",
    x: 720,
    y: 520,
    kind: "hijack-people",
  };
}

export const ABSENCE_PEOPLE_COPY =
  "Absence is a house of people, not a hole of process. Absence still waits. Nara still stays at the hole. Combat is not. This was not a fetch.";
export const WINK_ABSENCE_PEOPLE = "People, not an absence stick. The token does not strike.";
export const ABSENCE_PEOPLE_NEED = "Hijack as people first. Absence of people is not a fetch.";
export const ABSENCE_PEOPLE_HELD = "Absence already holds as people. Absence still waits. Nara still stays at the hole.";
export const ABSENCE_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const ABSENCE_PEOPLE_PLAQUE: Sign = {
  id: "absence-people",
  title: "Absence — people",
  text: "A house of people. Absence still waits. Nara still stays at the hole. The number does not strike.",
  x: 720,
  y: 520,
};

export function absencePeoplePoi(): Poi {
  return {
    id: "absence-people",
    name: "Absence — people",
    x: 720,
    y: 520,
    kind: "absence-people",
  };
}

export const WAIT_PEOPLE_COPY =
  "Waiting is a house of people, not a hole of process. Absence still waits. Nara still stays at the hole. Combat is not. This was not a fetch.";
export const WINK_WAIT_PEOPLE = "People, not a wait stick. The token does not strike.";
export const WAIT_PEOPLE_NEED = "Absence as people first. Waiting of people is not a fetch.";
export const WAIT_PEOPLE_HELD = "Waiting already holds as people. Absence still waits. Nara still stays at the hole.";
export const WAIT_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const WAIT_PEOPLE_PLAQUE: Sign = {
  id: "wait-people",
  title: "Wait — people",
  text: "A house of people. Absence still waits. Nara still stays at the hole. The number does not strike.",
  x: 720,
  y: 520,
};

export function waitPeoplePoi(): Poi {
  return {
    id: "wait-people",
    name: "Wait — people",
    x: 720,
    y: 520,
    kind: "wait-people",
  };
}

export const STAY_PEOPLE_COPY =
  "Staying is a house of people, not a hole of process. Nara still stays at the hole. Absence still waits. Combat is not. This was not a fetch.";
export const WINK_STAY_PEOPLE = "People, not a stay stick. The token does not strike.";
export const STAY_PEOPLE_NEED = "Waiting as people first. Staying of people is not a fetch.";
export const STAY_PEOPLE_HELD = "Staying already holds as people. Nara still stays at the hole. Absence still waits.";
export const STAY_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const STAY_PEOPLE_PLAQUE: Sign = {
  id: "stay-people",
  title: "Stay — people",
  text: "A house of people. Nara still stays at the hole. Absence still waits. The number does not strike.",
  x: 720,
  y: 520,
};

export function stayPeoplePoi(): Poi {
  return {
    id: "stay-people",
    name: "Stay — people",
    x: 720,
    y: 520,
    kind: "stay-people",
  };
}

export const WILLING_PEOPLE_COPY =
  "Willingness is a house of people, not a god of process. Appearance still needs the party willing. Combat is not. This was not a fetch.";
export const WINK_WILLING_PEOPLE = "People, not a willing stick. The token does not strike.";
export const WILLING_PEOPLE_NEED = "Staying as people first. Willingness of people is not a fetch.";
export const WILLING_PEOPLE_HELD = "Willingness already holds as people. Appearance still needs the party willing.";
export const WILLING_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const WILLING_PEOPLE_PLAQUE: Sign = {
  id: "willing-people",
  title: "Willing — people",
  text: "A house of people. Appearance still needs the party willing. The number does not strike.",
  x: 720,
  y: 520,
};

export function willingPeoplePoi(): Poi {
  return {
    id: "willing-people",
    name: "Willing — people",
    x: 720,
    y: 520,
    kind: "willing-people",
  };
}

export const EMPTY_PEOPLE_COPY =
  "The empty party is a house of people, not a hole of process. If Nara, Ord, or Quill walked, Passing is absence. Combat is not. This was not a fetch.";
export const WINK_EMPTY_PEOPLE = "People, not an empty stick. The token does not strike.";
export const EMPTY_PEOPLE_NEED = "Willingness as people first. An empty party of people is not a fetch.";
export const EMPTY_PEOPLE_HELD = "The empty party already holds as people. If Nara, Ord, or Quill walked, Passing is absence.";
export const EMPTY_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const EMPTY_PEOPLE_PLAQUE: Sign = {
  id: "empty-people",
  title: "Empty — people",
  text: "A house of people. If Nara, Ord, or Quill walked, Passing is absence. The number does not strike.",
  x: 720,
  y: 520,
};

export function emptyPeoplePoi(): Poi {
  return {
    id: "empty-people",
    name: "Empty — people",
    x: 720,
    y: 520,
    kind: "empty-people",
  };
}

export const CAMP_PEOPLE_COPY =
  "Camping is a house of people, not a farm of process. Gestell still rises. Aura still thins. Combat is not. This was not a fetch.";
export const WINK_CAMP_PEOPLE = "People, not a camp stick. The token does not strike.";
export const CAMP_PEOPLE_NEED = "The ruin duel as people first. A camp of people is not a fetch.";
export const CAMP_PEOPLE_GRAVE = "Stand with a wreckage. A camp of people is not a fetch.";
export const CAMP_PEOPLE_HELD = "Camping already holds as people. Gestell still rises. Aura still thins.";
export const CAMP_PEOPLE_SPECTATOR = "A grave. You do not get a house of people.";

export const CAMP_PEOPLE_PLAQUE: Sign = {
  id: "camp-people",
  title: "Camp — people",
  text: "A house of people. Gestell still rises. Aura still thins. The number does not strike.",
  x: 200,
  y: 480,
};

export function campPeoplePoi(x = 200, y = 480): Poi {
  return {
    id: "camp-people",
    name: "Camp — people",
    x,
    y,
    kind: "camp-people",
  };
}
export const CAMP_COPY = "Camping the same grave feeds the Gestell. Your aura thins.";
export const SPECTATE_CAP = 3;
export const DUEL_COPY = "A ruin duel. The grave is the ring. The kit does not strike harder.";
export const SPECTATE_COPY = "You watched a ruin duel. Aura thickens a little. The cap holds.";
export const WINK_DUEL = "Face the wreckage. Presence, not a bigger stick.";

export function inWetGrid(x: number, y: number): boolean {
  const dx = x - WET_GRID.x;
  const dy = y - WET_GRID.y;
  return dx * dx + dy * dy <= WET_GRID.r * WET_GRID.r;
}

export function wetGridPoi(): Poi {
  return { id: WET_GRID.id, name: "Wet Grid", x: WET_GRID.x, y: WET_GRID.y, kind: "wet-grid" };
}

export const WET_PLAQUE: Sign = {
  id: WET_GRID.id,
  title: "Wet Grid — flagged",
  text: "Opt in. Seconds. Spoils from people, not a faucet. Guests are not loot.",
  x: WET_GRID.x,
  y: WET_GRID.y,
};

export const WET_PEOPLE_COPY =
  "The Wet Grid is a street of people, not a spoils process. Flag still opts in. Combat is not. This was not a fetch.";
export const WINK_WET_PEOPLE = "People, not a flag stick. The token does not strike.";
export const WET_PEOPLE_NEED = "The Clearing as people first. A street of people is not a fetch.";
export const WET_PEOPLE_HELD = "The street already holds as people. Flag still opts in.";
export const WET_PEOPLE_SPECTATOR = "A wet street. You do not get a house of people.";

export const WET_PEOPLE_PLAQUE: Sign = {
  id: WET_GRID.id,
  title: "Wet Grid — people",
  text: "A street of people. Flag still opts in. The number does not strike.",
  x: WET_GRID.x,
  y: WET_GRID.y,
};

export function wetPeoplePoi(): Poi {
  return {
    id: WET_GRID.id,
    name: "Wet Grid — people",
    x: WET_GRID.x,
    y: WET_GRID.y,
    kind: "wet-people",
  };
}

export const STALL_PEOPLE_COPY =
  "The stall is a house of people, not a listing process. Listing still costs. Copies still decay. Cult does not list. This was not a fetch.";
export const WINK_STALL_PEOPLE = "People, not a print stick. The token does not strike.";
export const STALL_PEOPLE_NEED = "The Wet Grid as people first. A stall of people is not a fetch.";
export const STALL_PEOPLE_HELD = "The stall already holds as people. Listing still costs.";
export const STALL_PEOPLE_SPECTATOR = "A stall of lights. You do not get a house of people.";

export const STALL_PEOPLE_PLAQUE: Sign = {
  id: CLEARING_STALL.id,
  title: "The stall — people",
  text: "A house of people. Listing still costs. Cult does not. The number does not strike.",
  x: CLEARING_STALL.x,
  y: CLEARING_STALL.y,
};

export function stallPeoplePoi(): Poi {
  return {
    id: CLEARING_STALL.id,
    name: "The stall — people",
    x: CLEARING_STALL.x,
    y: CLEARING_STALL.y,
    kind: "stall-people",
  };
}

export const FOUNDRY_PEOPLE_COPY =
  "The Foundry is a house of people, not a furnace of process. Unlight still works. Combat is not. This was not a fetch.";
export const WINK_FOUNDRY_PEOPLE = "People, not heat. The token does not strike.";
export const FOUNDRY_PEOPLE_NEED = "The stall as people first. A foundry of people is not a fetch.";
export const FOUNDRY_PEOPLE_HELD = "The Foundry already holds as people. Unlight still works.";
export const FOUNDRY_PEOPLE_SPECTATOR = "Heat. You do not get a house of people.";

export const FOUNDRY_PEOPLE_PLAQUE: Sign = {
  id: ORGAN_FOUNDRY.id,
  title: "The Foundry — people",
  text: "A house of people. Unlight still works. The number does not strike.",
  x: ORGAN_FOUNDRY.x,
  y: ORGAN_FOUNDRY.y,
};

export function foundryPeoplePoi(): Poi {
  return {
    id: ORGAN_FOUNDRY.id,
    name: "The Foundry — people",
    x: ORGAN_FOUNDRY.x,
    y: ORGAN_FOUNDRY.y,
    kind: "foundry-people",
  };
}

export const STRAIT_PEOPLE_COPY =
  "The Strait is a house of people, not a canal of process. Refuse still works. Combat is not. This was not a fetch.";
export const WINK_STRAIT_PEOPLE = "People, not water. The token does not strike.";
export const STRAIT_PEOPLE_NEED = "The Foundry as people first. A strait of people is not a fetch.";
export const STRAIT_PEOPLE_HELD = "The Strait already holds as people. Refuse still works.";
export const STRAIT_PEOPLE_SPECTATOR = "Water. You do not get a house of people.";

export const STRAIT_PEOPLE_PLAQUE: Sign = {
  id: ORGAN_STRAIT.id,
  title: "The Strait — people",
  text: "A house of people. Refuse still works. The number does not strike.",
  x: ORGAN_STRAIT.x,
  y: ORGAN_STRAIT.y,
};

export function straitPeoplePoi(): Poi {
  return {
    id: ORGAN_STRAIT.id,
    name: "The Strait — people",
    x: ORGAN_STRAIT.x,
    y: ORGAN_STRAIT.y,
    kind: "strait-people",
  };
}

export const CABLE_PEOPLE_COPY =
  "The Cable is a house of people, not a line of process. Quiet still works. Combat is not. This was not a fetch.";
export const WINK_CABLE_PEOPLE = "People, not a number. The token does not strike.";
export const CABLE_PEOPLE_NEED = "The Strait as people first. A cable of people is not a fetch.";
export const CABLE_PEOPLE_HELD = "The Cable already holds as people. Quiet still works.";
export const CABLE_PEOPLE_SPECTATOR = "A line. You do not get a house of people.";

export const CABLE_PEOPLE_PLAQUE: Sign = {
  id: ORGAN_CABLE.id,
  title: "The Cable — people",
  text: "A house of people. Quiet still works. The number does not strike.",
  x: ORGAN_CABLE.x,
  y: ORGAN_CABLE.y,
};

export function cablePeoplePoi(): Poi {
  return {
    id: ORGAN_CABLE.id,
    name: "The Cable — people",
    x: ORGAN_CABLE.x,
    y: ORGAN_CABLE.y,
    kind: "cable-people",
  };
}

export function organsPeopleReady(w: {
  foundryPeopleHeld: boolean;
  straitPeopleHeld: boolean;
  cablePeopleHeld: boolean;
}): boolean {
  return w.foundryPeopleHeld && w.straitPeopleHeld && w.cablePeopleHeld;
}

export const ORGANS_PEOPLE_COPY =
  "Foundry, Strait, Cable hold as people. The organs are not process. Tithe still costs. Combat is not. This was not a fetch.";
export const WINK_ORGANS_PEOPLE = "Three organs. People, not a map. The token does not strike.";
export const ORGANS_PEOPLE_NEED = "Name Foundry, Strait, and Cable as people first. A gathering is not a fetch.";
export const ORGANS_PEOPLE_HELD = "The organs already hold as people. Tithe still costs.";
export const ORGANS_PEOPLE_SPECTATOR = "A hall. You do not get the organs as people.";

export const ORGANS_PEOPLE_PLAQUE: Sign = {
  id: "organs-people",
  title: "The organs — people",
  text: "Three organs hold. People, not process. Tithe still costs. The number does not strike.",
  x: HOUSE_HALL.x,
  y: HOUSE_HALL.y,
};

export function organsPeoplePoi(): Poi {
  return {
    id: "organs-people",
    name: "The organs — people",
    x: HOUSE_HALL.x,
    y: HOUSE_HALL.y,
    kind: "organs-people",
  };
}

export const VESPER_PEOPLE_COPY =
  "Vesper's desk is a house of people, not a concentrator of process. She will not sell a god. Combat is not. This was not a fetch.";
export const WINK_VESPER_PEOPLE = "People, not yield. The token does not strike.";
export const VESPER_PEOPLE_NEED = "The organs as people first. A desk of people is not a fetch.";
export const VESPER_PEOPLE_HELD = "The desk already holds as people. She will not sell a god.";
export const VESPER_PEOPLE_SPECTATOR = "A desk. You do not get a house of people.";

export const VESPER_PEOPLE_PLAQUE: Sign = {
  id: "vesper-people",
  title: "Vesper — people",
  text: "A house of people. She will not sell a god. The number does not strike.",
  x: OPERATOR_DESK.x,
  y: OPERATOR_DESK.y,
};

export function vesperPeoplePoi(): Poi {
  return {
    id: "vesper-people",
    name: "Vesper — people",
    x: OPERATOR_DESK.x,
    y: OPERATOR_DESK.y,
    kind: "vesper-people",
  };
}

export const M3_PEOPLE_COPY =
  "M3 is a house of people, not a tube of process. Going-under still works. Combat is not. This was not a fetch.";
export const WINK_M3_PEOPLE = "People, not a corridor. The token does not strike.";
export const M3_PEOPLE_NEED = "Vesper as people first. A tube of people is not a fetch.";
export const M3_PEOPLE_HELD = "M3 already holds as people. Going-under still works.";
export const M3_PEOPLE_SPECTATOR = "A door. You do not get a house of people.";

export const M3_PEOPLE_PLAQUE: Sign = {
  id: M3_DOOR.id,
  title: "M3 — people",
  text: "A house of people. Going-under still works. The number does not strike.",
  x: M3_DOOR.x,
  y: M3_DOOR.y,
};

export function m3PeoplePoi(): Poi {
  return {
    id: M3_DOOR.id,
    name: "M3 — people",
    x: M3_DOOR.x,
    y: M3_DOOR.y,
    kind: "m3-people",
  };
}

export const SCREENING_PEOPLE_COPY =
  "The screening is a house of people, not a dispatch of process. Observer proximity still holds. Combat is not. This was not a fetch.";
export const WINK_SCREENING_PEOPLE = "People, not a reel. The token does not strike.";
export const SCREENING_PEOPLE_NEED = "M3 as people first. A screening of people is not a fetch.";
export const SCREENING_PEOPLE_HELD = "The screening already holds as people. Dispatch still observer.";
export const SCREENING_PEOPLE_SPECTATOR = "A screen. You do not get a house of people.";

export const SCREENING_PEOPLE_PLAQUE: Sign = {
  id: "screening-people",
  title: "Dispatch — people",
  text: "A house of people. Observer proximity. The number does not strike.",
  x: SCREENING.x,
  y: SCREENING.y,
};

export function screeningPeoplePoi(): Poi {
  return {
    id: "screening-people",
    name: "Dispatch — people",
    x: SCREENING.x,
    y: SCREENING.y,
    kind: "screening-people",
  };
}

export const ANNEX_PEOPLE_COPY =
  "The Annex is a house of people, not a freeze of process. The freeze still costs. Combat is not. This was not a fetch.";
export const WINK_ANNEX_PEOPLE = "People, not katechon. The token does not strike.";
export const ANNEX_PEOPLE_NEED = "The screening as people first. An annex of people is not a fetch.";
export const ANNEX_PEOPLE_HELD = "The Annex already holds as people. The freeze still costs.";
export const ANNEX_PEOPLE_SPECTATOR = "A desk. You do not get a house of people.";

export const ANNEX_PEOPLE_PLAQUE: Sign = {
  id: "annex-people",
  title: "Annex — people",
  text: "A house of people. The freeze still costs. The number does not strike.",
  x: SAFETY_ANNEX.x,
  y: SAFETY_ANNEX.y,
};

export function annexPeoplePoi(): Poi {
  return {
    id: "annex-people",
    name: "Annex — people",
    x: SAFETY_ANNEX.x,
    y: SAFETY_ANNEX.y,
    kind: "annex-people",
  };
}

export const ARENA_PEOPLE_COPY =
  "The arena is a house of people, not a spoils process. Practice still has no spoils. Combat is not. This was not a fetch.";
export const WINK_ARENA_PEOPLE = "People, not a dummy stick. The token does not strike.";
export const ARENA_PEOPLE_NEED = "The Annex as people first. An arena of people is not a fetch.";
export const ARENA_PEOPLE_HELD = "The arena already holds as people. Practice still has no spoils.";
export const ARENA_PEOPLE_SPECTATOR = "A dummy. You do not get a house of people.";

export const ARENA_PEOPLE_PLAQUE: Sign = {
  id: GUEST_ARENA.id,
  title: "Arena — people",
  text: "A house of people. Practice still has no spoils. The number does not strike.",
  x: GUEST_ARENA.x,
  y: GUEST_ARENA.y,
};

export function arenaPeoplePoi(): Poi {
  return {
    id: GUEST_ARENA.id,
    name: "Arena — people",
    x: GUEST_ARENA.x,
    y: GUEST_ARENA.y,
    kind: "arena-people",
  };
}

export const QUILL_UNFLAG_ASK =
  "The street is still spoils. Unflag it. Cult hangs. Seconds should not. I will keep the kerb.";
export const QUILL_UNFLAG_WAIT =
  "The Wet Grid is still a ring. Unflag the plaque. I will not carry the street for you.";
export const UNFLAG_COPY =
  "You unflagged the Wet Grid. Spoils stop. Quill keeps the street. This was not a fetch.";
export const WINK_UNFLAG =
  "A side hour. You ended a spoils ring. Cult does not drop. The token does not strike.";
export const UNFLAG_NEED = "Hang the prayer first. I will not unflag a street that still lists copies.";
export const UNFLAG_LATER = "The street is cult. Spoils do not live here. I am keeping the kerb.";
export const UNFLAG_SPECTATOR = "Quill is taking the flags down. Not for you.";
export const FLAG_CULT = "The Wet Grid is cult now. You cannot flag a shrine street.";

export const UNFLAG_PLAQUE: Sign = {
  id: WET_GRID.id,
  title: "Wet Grid — unflagged",
  text: "Cult street. Spoils do not live here. Guests are not loot. They never were.",
  x: WET_GRID.x,
  y: WET_GRID.y,
};

export function wetCultPoi(): Poi {
  return { id: WET_GRID.id, name: "Wet Grid — unflagged", x: WET_GRID.x, y: WET_GRID.y, kind: "wet-grid-cult" };
}

export function forgePoi(): Poi {
  return {
    id: FORGE_TRAY.id,
    name: "Quill's tray",
    x: FORGE_TRAY.x,
    y: FORGE_TRAY.y,
    kind: "forge-tray",
  };
}

export const FORGE_PLAQUE: Sign = {
  id: FORGE_TRAY.id,
  title: "Cult / copy",
  text: "One hint was buried. One was printed. Quill sells both. Only one opens.",
  x: FORGE_TRAY.x,
  y: FORGE_TRAY.y,
};

export function gardenPoi(buried: boolean): Poi {
  return {
    id: WRECK_GARDEN.id,
    name: buried ? "Wreckage garden — buried" : "Wreckage garden",
    x: WRECK_GARDEN.x,
    y: WRECK_GARDEN.y,
    kind: "wreckage-garden",
  };
}

export function organPoi(id: "organ-strait" | "organ-foundry" | "organ-cable", x: number, y: number, name: string): Poi {
  return { id, name, x, y, kind: id };
}

export function organsComplete(beats: Beats): boolean {
  return beats.strait && beats.foundry && beats.cable;
}

export function operatorPoi(): Poi {
  return {
    id: OPERATOR_DESK.id,
    name: "Vesper Hale",
    x: OPERATOR_DESK.x,
    y: OPERATOR_DESK.y,
    kind: "operator-desk",
  };
}

export function m3Poi(open: boolean): Poi {
  return {
    id: M3_DOOR.id,
    name: open ? "Movement III" : "Movement III (shut)",
    x: M3_DOOR.x,
    y: M3_DOOR.y,
    kind: open ? "m3-open" : "m3-shut",
  };
}

export function stallPoi(): Poi {
  return {
    id: CLEARING_STALL.id,
    name: "Clearing — listed",
    x: CLEARING_STALL.x,
    y: CLEARING_STALL.y,
    kind: "clearing-listed",
  };
}

export function annexPoi(frozen: boolean): Poi {
  return {
    id: SAFETY_ANNEX.id,
    name: frozen ? "Safety Annex — freeze" : "Safety Annex",
    x: SAFETY_ANNEX.x,
    y: SAFETY_ANNEX.y,
    kind: frozen ? "safety-frozen" : "safety-annex",
  };
}

export const WEATHER_NAMED =
  "You named the weather. Safety still sells stability. The plaque is a lie the city paid for.";

export const YIELD_EMPTY =
  "No clerk at the yield. You sent Desk Three home and the Runner inside. The process continues without a body. This was not a fetch.";
export const WINK_YIELD_EMPTY =
  "A schedule of two desks. The Gestell still wants a yield. It no longer has a person to strike you.";
export const YIELD_EMPTY_NEED =
  "The desks still have bodies. Clock Desk Three out. Send the Annex Runner in.";
export const YIELD_EMPTY_LATER = "The yield is unmanned. The weather still has a name.";
export const YIELD_EMPTY_SPECTATOR = "Empty desks. Not yours to name.";

export const YIELD_EMPTY_PLAQUE: Sign = {
  id: "safety-plaque",
  title: "Office of Safety — unmanned",
  text: "No clerk at the yield. Extraction is still civic. There is no one left to strike you for it.",
  x: 192,
  y: 400,
};

export function yieldEmptyPoi(): Poi {
  return { id: "safety-plaque", name: "Yield — unmanned", x: 192, y: 400, kind: "yield-empty" };
}

export const STRUCK_PLAQUE: Sign = {
  id: "safety-plaque",
  title: "Office of Safety — struck",
  text: "Stability was the name they sold. The weather has another name now.",
  x: 192,
  y: 400,
};

export const CLERK_HP = 44;
export const CLERK_AGGRO = 70;
export const CLERK_DAMAGE = 14;
export const CLERK_TELEGRAPH = 0.6;
export const CLOCK_OUT =
  "Desk Three clocks out. The yield still wants a body. The desk is empty. You named the weather; they would not stay.";
export const CLOCK_NEED = "They will not leave until the weather has a name.";
export const CLOCK_GONE = "Desk Three already left. The empty desk is the POI.";
export const CLOCK_SPECTATOR = "A clerk doing a job. Not for you to send home.";
export const WINK_CLOCK =
  "A schedule changed. The Gestell still wants a desk. Naming the weather made a person walk.";
export const ANNEX_HOME =
  "Annex Runner is in. The street is empty. The freeze still holds. A person stopped running.";
export const ANNEX_NEED = "They will not come in until the freeze is signed.";
export const ANNEX_GONE = "The runner is already in. The route is empty. The freeze holds.";
export const ANNEX_SPECTATOR = "Someone running papers. Not for you to send inside.";
export const WINK_ANNEX =
  "A schedule changed. Paper stays signed. The runner went inside. Fetch would have left them on the kerb.";

export const ANNEX_HOME_PLAQUE: Sign = {
  id: SAFETY_ANNEX.id,
  title: "Safety Annex — runner in",
  text: "The runner is in. The freeze holds. No more paper on the street.",
  x: SAFETY_ANNEX.x,
  y: SAFETY_ANNEX.y,
};

export function annexHomePoi(): Poi {
  return {
    id: SAFETY_ANNEX.id,
    name: "Safety Annex — runner in",
    x: SAFETY_ANNEX.x,
    y: SAFETY_ANNEX.y,
    kind: "safety-annex-home",
  };
}

export function annexRoutePoi(c: { id: string; x: number; y: number }): Poi {
  return { id: `empty-${c.id}`, name: "Annex route — empty", x: c.x, y: c.y, kind: "annex-route" };
}

export function deskEmptyPoi(c: { id: string; x: number; y: number; name: string }): Poi {
  return { id: `empty-${c.id}`, name: `${c.name} — empty`, x: c.x, y: c.y, kind: "desk-empty" };
}

export function emptyBeats(): Beats {
  return {
    nara: false,
    quill: false,
    ord: false,
    burial: false,
    under: false,
    care: false,
    hall: false,
    freeze: false,
    market: false,
    yield: false,
    cold: false,
    refuse: false,
    garden: false,
    m3: false,
    strait: false,
    foundry: false,
    cable: false,
    map: false,
    failed: false,
    forge: false,
    spot: false,
    sold: false,
    lastWord: false,
    clearing: false,
    passing: false,
    errand: false,
    cableQuiet: false,
    sextonAsk: false,
    sexton: false,
    hangAsk: false,
    hang: false,
    standing: false,
    clockOut: false,
    foundryAsk: false,
    foundryDark: false,
    annexHome: false,
    straitRefuse: false,
    ordWitness: false,
    unflagAsk: false,
    unflag: false,
    canalAsk: false,
    canalBury: false,
    yieldEmpty: false,
    cableDark: false,
    skyStanding: false,
    earthStanding: false,
    divStanding: false,
    ioneMark: false,
    fourfold: false,
    lastGod: false,
    ordLast: false,
    naraGodAsk: false,
    naraGod: false,
    quillNoPrint: false,
    restraint: false,
    vesperNoGod: false,
    absenceHour: false,
    naraStay: false,
    hijacked: false,
    storm: false,
    blitz: false,
    cyber: false,
    glamour: false,
    dwell: false,
    funeral: false,
    naraGone: false,
    ordGone: false,
    quillGone: false,
    vesperGone: false,
    credits: false,
    season: false,
    winkBlind: false,
    ruinBack: false,
    arena: false,
    screening: false,
    participant: false,
    founder: false,
    bounty: false,
    stormPress: false,
    winkSeed: false,
    log: false,
    still: false,
    bracket: false,
    naraPerson: false,
    quillPerson: false,
    ordPerson: false,
    vesperPerson: false,
    hitStop: false,
    addressed: false,
    party: false,
    people: false,
    parted: false,
    heavy: false,
    truce: false,
    handoff: false,
    carePeople: false,
    shrinePeople: false,
    safetyPeople: false,
    deskPeople: false,
    hallPeople: false,
    clearingPeople: false,
    wetPeople: false,
    stallPeople: false,
    foundryPeople: false,
    straitPeople: false,
    cablePeople: false,
    organsPeople: false,
    vesperPeople: false,
    m3People: false,
    screeningPeople: false,
    annexPeople: false,
    arenaPeople: false,
    underPeople: false,
    gardenPeople: false,
    burialPeople: false,
    weatherPeople: false,
    navePeople: false,
    creditsPeople: false,
    stillPeople: false,
    seasonPeople: false,
    bracketPeople: false,
    logPeople: false,
    founderPeople: false,
    roomsPeople: false,
    stormPeople: false,
    bountyPeople: false,
    flagPeople: false,
    trucePeople: false,
    handoffPeople: false,
    vaultPeople: false,
    insurancePeople: false,
    funeralPeople: false,
    restorePeople: false,
    keepPeople: false,
    tithePeople: false,
    freezePeople: false,
    repairPeople: false,
    listingPeople: false,
    marketPeople: false,
    hangPeople: false,
    restraintPeople: false,
    dodgePeople: false,
    heavyPeople: false,
    hitStopPeople: false,
    spectatePeople: false,
    lastWordPeople: false,
    duelPeople: false,
    campPeople: false,
    passingPeople: false,
    claimsPeople: false,
    filePeople: false,
    takePeople: false,
    bankPeople: false,
    stormPressPeople: false,
    fallenPeople: false,
    spoilsPeople: false,
    unflagPeople: false,
    secondsPeople: false,
    streetPeople: false,
    griefPeople: false,
    kitPeople: false,
    practicePeople: false,
    dummyPeople: false,
    gearedPeople: false,
    serialPeople: false,
    bandPeople: false,
    numberPeople: false,
    skillPeople: false,
    traitPeople: false,
    tokenPeople: false,
    fairPeople: false,
    visiblePeople: false,
    auraPeople: false,
    presencePeople: false,
    winkPeople: false,
    bestandPeople: false,
    cultPeople: false,
    copyPeople: false,
    bankedPeople: false,
    unbankedPeople: false,
    sinkPeople: false,
    yieldPeople: false,
    taxPeople: false,
    gestellPeople: false,
    climatePeople: false,
    extractPeople: false,
    maxPeople: false,
    heatPeople: false,
    fatPeople: false,
    poorPeople: false,
    blockPeople: false,
    soloPeople: false,
    dwellPeople: false,
    tracePeople: false,
    failPeople: false,
    holePeople: false,
    stipendPeople: false,
    hijackPeople: false,
    absencePeople: false,
    waitPeople: false,
    stayPeople: false,
    willingPeople: false,
    emptyPeople: false,
  };
}

export function emptyWeather(): WeatherHeard {
  return { safety: false, nara: false, ord: false };
}

export function weatherComplete(w: WeatherHeard): boolean {
  return w.safety && w.nara && w.ord;
}

export function naveClerks(): Clerk[] {
  return [
    { id: "clerk-desk-three", name: "Desk Three", x: 520, y: 480, hp: CLERK_HP, telegraph: 0 },
    { id: "clerk-annex", name: "Annex Runner", x: 900, y: 360, hp: CLERK_HP, telegraph: 0 },
  ];
}

export function naveSigns(): Sign[] {
  return [
    ...NAVE_SIGNS.map((s) => ({ ...s })),
    { ...ANNEX_PLAQUE },
    { ...STALL_PLAQUE },
    { ...OPERATOR_PLAQUE },
    { ...FORGE_PLAQUE },
    { ...CLEARING_PLAQUE },
    { ...WET_PLAQUE },
    { ...ARENA_PLAQUE },
    { ...SCREENING_PLAQUE },
    { ...CLAIMS_PLAQUE },
    { ...SHRINE_PLAQUE },
    { ...WEATHER_SIGN },
  ].filter((s): s is Sign => !!s?.id);
}

export function navePois(): Poi[] {
  return [
    { id: "weather", name: "Unnamed weather", x: 192, y: 340, kind: "unnamed-weather" },
    { id: CARE_DOOR.id, name: "The Care (shut)", x: CARE_DOOR.x, y: CARE_DOOR.y, kind: "care-shut" },
    annexPoi(false),
    stallPoi(),
    forgePoi(),
    operatorPoi(),
    m3Poi(false),
    clearingPoi(false),
    wetGridPoi(),
    arenaPoi(),
    screeningPoi(),
    claimsPoi(),
    shrinePoi(),
  ].filter((p): p is Poi => !!p?.id);
}

export function openCarePoi(): Poi {
  return { id: CARE_DOOR.id, name: "The Care", x: CARE_DOOR.x, y: CARE_DOOR.y, kind: "care-open" };
}

export function houseHallPoi(): Poi {
  return { id: HOUSE_HALL.id, name: "House of Mortals", x: HOUSE_HALL.x, y: HOUSE_HALL.y, kind: "house-hall" };
}

export function hallPlaque(): Sign {
  return { ...HALL_PLAQUE };
}

export function namedWeatherPoi(): Poi {
  return { id: "weather", name: "Named weather", x: 192, y: 340, kind: "named-weather" };
}

export function npcById(id: string): Npc | undefined {
  if (id === IONE.id) return IONE;
  if (id === VESPER.id) return VESPER;
  return NAVE_NPCS.find((n) => n.id === id);
}

export function nearPoint(px: number, py: number, x: number, y: number, reach = 48): boolean {
  const dx = px - x;
  const dy = py - y;
  return dx * dx + dy * dy <= reach * reach;
}

export function lineFor(id: NpcId, beats: Beats): string {
  const npc = npcById(id);
  if (!npc) return "";
  if (id === "ione") return beats.lastWord ? LAST_WORD_GONE : LAST_WORD;
  if (id === "vesper") return beats.foundryDark ? VESPER_FOUNDRY_LATER : VESPER_UNLIGHT_ASK;
  if (id === "nara" && beats.garden) return NARA_AFTER_GARDEN;
  if (id === "ord" && beats.map) return ORD_MAP;
  const pack = NPC_LINES[id];
  return beats[id] || (id === "nara" && beats.burial) ? pack.later : pack.first;
}

export function movementReady(beats: Beats): boolean {
  return beats.nara && beats.quill && beats.ord && beats.burial;
}

export function naveRites(): Rite[] {
  return [
    { ...BURIAL_PLOT },
    { ...GOING_UNDER },
  ];
}

export function displayName(id: NpcId): string {
  return npcById(id)?.name ?? "Someone";
}

export function formatSerial(serial: number | null): string {
  if (serial == null || serial <= 0) return "#0000";
  return `#${String(serial).padStart(4, "0")}`;
}

export type House = "earth" | "sky" | "mortals" | "divinities" | "";

export const HOUSES: Exclude<House, "">[] = ["earth", "sky", "mortals", "divinities"];

export const HOUSE_NAME: Record<Exclude<House, "">, string> = {
  earth: "House of Earth",
  sky: "House of Sky",
  mortals: "House of Mortals",
  divinities: "House of Divinities",
};

export function houseFor(serial: number): Exclude<House, ""> {
  if (serial === TEST_SERIAL) return "mortals";
  return HOUSES[(Math.max(1, serial) - 1) % HOUSES.length];
}

export function houseName(house: House): string {
  return house ? HOUSE_NAME[house] : "Unsealed";
}

export function earthTax(tax: number, house: House): number {
  if (house !== "earth") return tax;
  return Math.max(0, tax - 2);
}

export function divinitiesKeep(house: House): number {
  return house === "divinities" ? 2 : 1;
}

export type HouseScores = Record<Exclude<House, "">, number>;

export type HouseWar = {
  keep: HouseScores;
  extract: HouseScores;
  winner: House;
  omen: string;
  titheCut: number;
  tithePaid: boolean;
};

export const WAR_WIN = 2;
export const WAR_TITHE = 2;
export const TITHE_COST = 6;
export const TITHE_COPY =
  "You paid the House tithe. Six Bestand. The omen holds. Combat is not.";
export const TITHE_NEED = "Six Bestand keeps the omen. Tithe is upkeep, not a stick.";
export const TITHE_SPECTATOR = "A House ledger. Guests do not tithe.";
export const TITHE_WRONG = "This omen is not yours to keep.";
export const TITHE_NONE = "No omen yet. Win the hole first.";
export const TITHE_HELD = "The tithe is current. The omen already holds.";
export const BOUNTY_PAY = 12;
export const BOUNTY_COPY =
  "House bounty. Twelve Bestand from the tithe pool. Gestell drinks two. Aura thins. Combat is not. This was not a fetch.";
export const WINK_BOUNTY = "A bounty is upkeep's other face, not a stick. The token does not strike.";
export const BOUNTY_NEED = "Pay the tithe first. Bounty is after upkeep.";
export const BOUNTY_HELD = "The bounty already paid. One omen, one purse.";
export const BOUNTY_SPECTATOR = "A House ledger. Guests do not collect.";
export const BOUNTY_WRONG = "This omen is not yours to cash.";

export const BOUNTY_PLAQUE: Sign = {
  id: HOUSE_HALL.id,
  title: "House bounty",
  text: "Tithe pool. Twelve Bestand. Gestell drinks. The number does not strike.",
  x: HOUSE_HALL.x,
  y: HOUSE_HALL.y,
};

export function bountyPoi(): Poi {
  return {
    id: HOUSE_HALL.id,
    name: "House bounty",
    x: HOUSE_HALL.x,
    y: HOUSE_HALL.y,
    kind: "house-bounty",
  };
}
export const WAR_OMEN_KEEP =
  "House omen: the hole holds. Tithe eases after upkeep. The number does not strike.";
export const WAR_OMEN_EXTRACT =
  "House omen: the hole is stock. Tithe eases after upkeep. Combat is not.";
export const WINK_WAR = "Friends split here. Tithe and omen, never a bigger stick.";

export function emptyScores(): HouseScores {
  return { earth: 0, sky: 0, mortals: 0, divinities: 0 };
}

export function emptyWar(): HouseWar {
  return { keep: emptyScores(), extract: emptyScores(), winner: "", omen: "", titheCut: 0, tithePaid: false };
}

export function leadingHouse(scores: HouseScores): House {
  let best: House = "";
  let n = 0;
  for (const h of HOUSES) {
    if (scores[h] > n) {
      n = scores[h];
      best = h;
    }
  }
  return n > 0 ? best : "";
}

export function scoreWar(war: HouseWar, house: House, side: "keep" | "extract"): HouseWar {
  if (!house || war.winner) return war;
  const next = {
    ...war,
    keep: { ...war.keep },
    extract: { ...war.extract },
  };
  next[side][house] += 1;
  return resolveWar(next, side);
}

export function resolveWar(war: HouseWar, side: "keep" | "extract"): HouseWar {
  if (war.winner) return war;
  const lead = leadingHouse(war[side]);
  if (!lead || war[side][lead] < WAR_WIN) return war;
  return {
    ...war,
    winner: lead,
    titheCut: WAR_TITHE,
    tithePaid: false,
    omen: side === "keep" ? WAR_OMEN_KEEP : WAR_OMEN_EXTRACT,
  };
}

export function warTax(tax: number, house: House, war: HouseWar): number {
  if (house && house === war.winner && war.tithePaid) return Math.max(0, tax - war.titheCut);
  return tax;
}

export type Messenger =
  | ""
  | "herald"
  | "witness"
  | "ruin-angel"
  | "dweller"
  | "cybernetic"
  | "iridescent";

export const MESSENGER_NAME: Record<Exclude<Messenger, "">, string> = {
  herald: "Herald",
  witness: "Witness",
  "ruin-angel": "Ruin-angel",
  dweller: "Dweller",
  cybernetic: "Cybernetic",
  iridescent: "Iridescent",
};

export function messengerFor(serial: number): Exclude<Messenger, ""> {
  if (serial === TEST_SERIAL) return "herald";
  const keys = Object.keys(MESSENGER_NAME) as Exclude<Messenger, "">[];
  return keys[(Math.max(1, serial) - 1) % keys.length];
}

export function messengerName(m: Messenger): string {
  return m ? MESSENGER_NAME[m] : "Unsealed";
}

export const ANNOUNCE_COPY =
  "You announced a kept node. Allies can see the safe. You did not strike harder.";
export const ANNOUNCE_NEED = "Only a Herald can name a safe node, and only one that was kept.";
export const ANNOUNCE_SPECTATOR = "A light. You do not know if it is safe.";
export const WINK_ANNOUNCE = "A safe node is a hint, not a weapon. The token does not make it hit.";
export const BLITZ_COUNT = 8;
export const BLITZ_COPY =
  "A lightning trace. You see the last eight graves. You did not strike harder. This was not a fetch.";
export const WINK_BLITZ = "Witness kit. A trace, not a stick. Combat is not.";
export const BLITZ_NEED = "Only a Witness traces wreckage, and only at a grave.";
export const BLITZ_HELD = "The traces already hold. Eight graves. Combat is not.";
export const BLITZ_SPECTATOR = "A flash. You do not see the graves.";

export type BlitzMark = { id: string; x: number; y: number; fromName: string };

export function lastWrecks(wreckage: { id: string; x: number; y: number; fromName: string }[], n = BLITZ_COUNT): BlitzMark[] {
  return wreckage.slice(-n).map((r) => ({ id: r.id, x: r.x, y: r.y, fromName: r.fromName }));
}

export function blitzPoi(x: number, y: number): Poi {
  return { id: "blitz-trace", name: "Blitz trace", x, y, kind: "blitz-trace" };
}

export const RUIN_BACK =
  "The storm is at your back. Every grave is a season. You did not strike harder. This was not a fetch.";
export const WINK_RUIN_BACK = "Ruin-angel kit. Wreckage vision. Readiness holds. Combat is not.";
export const RUIN_BACK_NEED = "Only a Ruin-angel names the storm, and only at a grave.";
export const RUIN_BACK_HELD = "The storm already holds. Graves stay seasons. Combat is not.";
export const RUIN_BACK_SPECTATOR = "A grave. You do not see the weather behind it.";

export const RUIN_BACK_PLAQUE: Sign = {
  id: "storm-back",
  title: "The storm at your back",
  text: "Wreckage is a season. The number does not strike.",
  x: 200,
  y: 480,
};

export function ruinBackPoi(x: number, y: number): Poi {
  return { id: "storm-back", name: "The storm at your back", x, y, kind: "storm-back" };
}

export const EXTRACT_GESTELL = 6;
export const KEEP_GESTELL = 3;
export const CYBER_COPY =
  "You read the process. Extract drinks six Gestell. Keep thins three. Combat is not. This was not a fetch.";
export const WINK_CYBER = "Cybernetic kit. A read, not a stick. The token does not strike.";
export const CYBER_NEED = "Only a cybernetic angel reads a live node as process.";
export const CYBER_HELD = "The process already holds. Extract still drinks. Combat is not.";
export const CYBER_SPECTATOR = "A node. You do not see the process.";

export const CYBER_PLAQUE: Sign = {
  id: "process-read",
  title: "The process — read",
  text: "Extract drinks Gestell. Keep thins it. The number does not strike.",
  x: 120,
  y: 180,
};

export function cyberPoi(x: number, y: number): Poi {
  return { id: "process-read", name: "The process — read", x, y, kind: "process-read" };
}

export const GLAMOUR_COPY =
  "You glamoured the stall. Aura as surface. Copies travel. Cult does not hang on the shine. Combat is not. This was not a fetch.";
export const WINK_GLAMOUR = "Iridescent kit. A surface, not a stick. The token does not shine for you.";
export const GLAMOUR_NEED = "Only an iridescent angel paints a live stall as surface.";
export const GLAMOUR_HELD = "The stall is already surface. Aura shows. Combat is not.";
export const GLAMOUR_SPECTATOR = "Lights. You do not see the surface.";
export const GLAMOUR_DARK = "A shrine does not take surface. Cult hangs. Copies do not travel.";

export const GLAMOUR_PLAQUE: Sign = {
  id: CLEARING_STALL.id,
  title: "The stall — surface",
  text: "Aura as surface. Copies travel. Cult does not hang on glamour. The number does not strike.",
  x: CLEARING_STALL.x,
  y: CLEARING_STALL.y,
};

export function glamourPoi(): Poi {
  return {
    id: CLEARING_STALL.id,
    name: "The stall — surface",
    x: CLEARING_STALL.x,
    y: CLEARING_STALL.y,
    kind: "stall-glamour",
  };
}

export const DWELL_COPY =
  "You kept the tile as a seed. A Clearing can grow here. You did not strike harder. This was not a fetch.";
export const WINK_DWELL = "Dweller kit. A seed, not a stick. The token does not plant God.";
export const DWELL_NEED = "Only a Dweller plants a seed, and only on a kept tile.";
export const DWELL_HELD = "The seed already holds. A Clearing can grow. Combat is not.";
export const DWELL_SPECTATOR = "A kept node. You do not see a seed.";

export const DWELL_PLAQUE: Sign = {
  id: "clearing-seed",
  title: "The keep — seed",
  text: "A tile kept. A hole may grow. The number does not strike.",
  x: 120,
  y: 180,
};

export function dwellPoi(x: number, y: number): Poi {
  return { id: "clearing-seed", name: "The keep — seed", x, y, kind: "clearing-seed" };
}

export const NARA_LEAVE_GESTELL = 71;
export const NARA_LEAVE =
  "Nara Vale left. You fed the weather and did not bury anyone. The sexton will not stand with you. This was not a fetch.";
export const WINK_NARA_LEAVE = "Conscience walks. Gestell does not. Combat is not.";
export const NARA_LEAVE_HELD = "Nara Vale is gone. You kept the process and lost the sexton.";
export const NARA_LEAVE_SPECTATOR = "An empty kerb. You do not know who left.";

export const NARA_GONE_PLAQUE: Sign = {
  id: "nara-gone",
  title: "Nara Vale — gone",
  text: "She will not stand with a city that will not bury. The number does not strike.",
  x: 240,
  y: 720,
};

export function naraGonePoi(x = 240, y = 720): Poi {
  return { id: "nara-gone", name: "Nara Vale — gone", x, y, kind: "nara-gone" };
}

export const NARA_PERSON =
  "Nara Vale stays. Not as sexton of a process. As a person who buried someone with you. Combat is not. This was not a fetch.";
export const WINK_NARA_PERSON = "A person, not a function. Gestell does not get this hour.";
export const NARA_PERSON_HELD = "She already stays. The kerb is a person, not a desk.";
export const NARA_PERSON_NEED = "Bury someone with her first. A person is not a fetch.";
export const NARA_PERSON_SPECTATOR = "A sexton. You do not get this hour.";

export const NARA_PERSON_PLAQUE: Sign = {
  id: "nara-person",
  title: "Nara Vale — stays",
  text: "A person who buried someone. Not a function. The number does not strike.",
  x: 240,
  y: 720,
};

export function naraPersonPoi(x = 240, y = 720): Poi {
  return { id: "nara-person", name: "Nara Vale — stays", x, y, kind: "nara-person" };
}

export const QUILL_PERSON =
  "Quill stays. Not as a stall. As a person who hung a prayer with you. Copies can wait. Combat is not. This was not a fetch.";
export const WINK_QUILL_PERSON = "A person, not a listing. Aura does not list this hour.";
export const QUILL_PERSON_HELD = "She already stays. The kerb is a person, not a stall.";
export const QUILL_PERSON_NEED = "Unflag the street first. A person is not a listing.";
export const QUILL_PERSON_SPECTATOR = "A forger. You do not get this hour.";

export const QUILL_PERSON_PLAQUE: Sign = {
  id: "quill-person",
  title: "Quill — stays",
  text: "A person who hung a prayer. Not a listing. The number does not strike.",
  x: 768,
  y: 520,
};

export function quillPersonPoi(x = 768, y = 520): Poi {
  return { id: "quill-person", name: "Quill — stays", x, y, kind: "quill-person" };
}

export const ORD_PERSON =
  "Ord stays. Not as a number. As a person who signed a freeze with you. Honesty can wait a night. Combat is not. This was not a fetch.";
export const WINK_ORD_PERSON = "A person, not a ledger. Gestell does not get this hour.";
export const ORD_PERSON_HELD = "He already stays. The desk is a person, not a count.";
export const ORD_PERSON_NEED = "Sign a freeze first. A person is not a number.";
export const ORD_PERSON_SPECTATOR = "Ex-Safety. You do not get this hour.";

export const ORD_PERSON_PLAQUE: Sign = {
  id: "ord-person",
  title: "Ord — stays",
  text: "A person who signed a freeze. Not a number. The number does not strike.",
  x: 400,
  y: 260,
};

export function ordPersonPoi(x = 400, y = 260): Poi {
  return { id: "ord-person", name: "Ord — stays", x, y, kind: "ord-person" };
}

export const VESPER_PERSON =
  "Vesper Hale stays. Not as a concentrator. As a person who unlit the heat with you. Yield can wait. Combat is not. This was not a fetch.";
export const WINK_VESPER_PERSON = "A person, not a furnace. Gestell does not get this hour.";
export const VESPER_PERSON_HELD = "She already stays. The desk is a person, not a yield.";
export const VESPER_PERSON_NEED = "Unlight the Foundry first. A person is not a concentrator.";
export const VESPER_PERSON_SPECTATOR = "A concentrator. You do not get this hour.";

export const VESPER_PERSON_PLAQUE: Sign = {
  id: "vesper-person",
  title: "Vesper Hale — stays",
  text: "A person who unlit the heat. Not a furnace. The number does not strike.",
  x: ORGAN_FOUNDRY.x,
  y: ORGAN_FOUNDRY.y + 48,
};

export function vesperPersonPoi(x = ORGAN_FOUNDRY.x, y = ORGAN_FOUNDRY.y + 48): Poi {
  return { id: "vesper-person", name: "Vesper Hale — stays", x, y, kind: "vesper-person" };
}

export const ORD_LEAVE_GESTELL = 100;
export const ORD_LEAVE =
  "Ord left. You maxed the weather and never signed a freeze. Ex-Safety will not number a god that ate the district. This was not a fetch.";
export const WINK_ORD_LEAVE = "The ledger walked. Gestell kept the desk. Combat is not.";
export const ORD_LEAVE_HELD = "Ord is gone. You kept the process and lost the number.";
export const ORD_LEAVE_SPECTATOR = "An empty desk. You do not know who left.";

export const ORD_GONE_PLAQUE: Sign = {
  id: "ord-gone",
  title: "Ord — gone",
  text: "He will not number a city that will not freeze. The number does not strike.",
  x: 400,
  y: 260,
};

export function ordGonePoi(x = 400, y = 260): Poi {
  return { id: "ord-gone", name: "Ord — gone", x, y, kind: "ord-gone" };
}

export const QUILL_LEAVE =
  "Quill left. You sold a face and never hung the prayer. Copies travel. She will not. This was not a fetch.";
export const WINK_QUILL_LEAVE = "The stall walked. Aura listed. Combat is not.";
export const QUILL_LEAVE_HELD = "Quill is gone. You kept the listing and lost the forger.";
export const QUILL_LEAVE_SPECTATOR = "An empty stall. You do not know who left.";

export const QUILL_GONE_PLAQUE: Sign = {
  id: "quill-gone",
  title: "Quill — gone",
  text: "She will not list a city that will not hang a prayer. The number does not strike.",
  x: 1080,
  y: 504,
};

export function quillGonePoi(x = 1080, y = 504): Poi {
  return { id: "quill-gone", name: "Quill — gone", x, y, kind: "quill-gone" };
}

export const VESPER_LEAVE =
  "Vesper Hale left. You bought the heat and never unlit it. She will not sell a god into a live furnace. This was not a fetch.";
export const WINK_VESPER_LEAVE = "The desk walked. The furnace kept. Combat is not.";
export const VESPER_LEAVE_HELD = "Vesper Hale is gone. You kept the heat and lost the concentrator.";
export const VESPER_LEAVE_SPECTATOR = "An empty desk. You do not know who left.";

export const VESPER_GONE_PLAQUE: Sign = {
  id: "vesper-gone",
  title: "Vesper Hale — gone",
  text: "She will not sell a city that will not unlight. The number does not strike.",
  x: OPERATOR_DESK.x,
  y: OPERATOR_DESK.y,
};

export function vesperGonePoi(x = OPERATOR_DESK.x, y = OPERATOR_DESK.y): Poi {
  return { id: "vesper-gone", name: "Vesper Hale — gone", x, y, kind: "vesper-gone" };
}

export function auraSeed(serial: number): number {
  return 8 + (serial % 13);
}

export function winkeVisible(guest: boolean): boolean {
  return !guest;
}

export function visibleWink(guest: boolean, wink: string, aura = 99): string {
  if (guest || aura < AURA_DIM) return "";
  return wink;
}

export type HistoryMark = {
  id: string;
  serial: number;
  x: number;
  y: number;
  line: string;
};

export const HISTORY_7777: HistoryMark = {
  id: "hist-7777",
  serial: TEST_SERIAL,
  x: 760,
  y: 640,
  line: "A prior hour. You stood here and left the body in the weather.",
};

export const WINK_HISTORY =
  "Only you can face this wreckage. The serial remembers. The city does not.";

export function serialHistory(serial: number): HistoryMark | null {
  return serial === TEST_SERIAL ? { ...HISTORY_7777 } : null;
}

export function visibleHistory(
  guest: boolean,
  serial: number | null,
  marks: HistoryMark[],
  storm = false,
): HistoryMark[] {
  if (guest) return [];
  if (storm) return marks;
  if (serial == null || serial <= 0) return [];
  return marks.filter((m) => m.serial === serial);
}

export type FailedPassing = {
  id: string;
  x: number;
  y: number;
  season: string;
  line: string;
};

export const FAILED_PASSING: FailedPassing = {
  id: "passing-last",
  x: 600,
  y: 400,
  season: "last hour",
  line: "Last season’s Passing failed. The hour went by. The city kept the weather.",
};

export const WINK_FAILED =
  "You face the wreckage. The storm is at your back. This is not a fight bonus. The token does not buy the hour.";
export const WATCH_FAILED =
  "You watched the failed hour. You did not loot it. Readiness is slower than salvage.";
export const FAILED_SPECTATOR = "Asphalt. You do not see a season.";

export function ruinSight(guest: boolean, serial: number | null, house: House = "", storm = false): boolean {
  return !guest && (storm || serial === TEST_SERIAL || house === "mortals");
}

export function visibleFailed(
  guest: boolean,
  serial: number | null,
  marks: FailedPassing[],
  house: House = "",
  storm = false,
): FailedPassing[] {
  return ruinSight(guest, serial, house, storm) ? marks : [];
}

export const GESTELL_HOT = 91;
export const DWELL_SOLO = 1;
export const DWELL_MAXED = 2;
export const CONTEST_PAY = 40;

export const CLEARING_RING = { id: "clearing-ring", x: 720, y: 580 };

export const LAST_WORD =
  "Ione Kade: I will not be in the next hour. Do not make a story of it. Stand in the hole.";
export const LAST_WORD_GONE = "Ione Kade is not here. That was the last word.";
export const IONE_SPECTATOR = "Someone is leaving. You do not get a last word.";
export const WINK_TURN =
  "The hour does not arrive as a body. It is a trace, or it is not. You cannot buy it.";
export const IONE_MARK =
  "You stood in the hole she left. Absence is a standing. The body does not return. This was not a fetch.";
export const WINK_ABSENCE = "A last word left a place. You did not fill it with yield. Combat is not.";
export const IONE_MARK_LATER = "The hole holds. Ione Kade is not a story. She is gone.";
export const IONE_MARK_SPECTATOR = "An empty place. You do not get a last word.";

export const IONE_GONE_PLAQUE: Sign = {
  id: IONE.id,
  title: "Ione Kade — gone",
  text: "Absence is a standing. Do not make a story of it. Do not extract it.",
  x: IONE.x,
  y: IONE.y,
};

export function ioneGonePoi(): Poi {
  return { id: IONE.id, name: "Ione Kade — gone", x: IONE.x, y: IONE.y, kind: "ione-gone" };
}

export function peopleReady(w: {
  naraPersonHeld: boolean;
  quillPersonHeld: boolean;
  ordPersonHeld: boolean;
  vesperPersonHeld: boolean;
}): boolean {
  return w.naraPersonHeld && w.quillPersonHeld && w.ordPersonHeld && w.vesperPersonHeld;
}

export const PEOPLE_COPY =
  "The people stayed. Ione's hole is a gathering, not a process. Combat is not. This was not a fetch.";
export const WINK_PEOPLE = "People, not functions. Gestell does not get this hour.";
export const PEOPLE_NEED = "Nara, Quill, Ord, and Vesper must stay as people first. A gathering is not a fetch.";
export const PEOPLE_HELD = "The gathering already holds. Ione is not a story.";
export const PEOPLE_SPECTATOR = "An empty place. You do not get a gathering.";

export const PEOPLE_PLAQUE: Sign = {
  id: IONE.id,
  title: "Ione — people",
  text: "They stayed as people. Absence is a gathering. The number does not strike.",
  x: IONE.x,
  y: IONE.y,
};

export function peoplePoi(): Poi {
  return { id: IONE.id, name: "Ione — people", x: IONE.x, y: IONE.y, kind: "ione-people" };
}

export const CLEARING_PREPARE =
  "You keep the hole. The party still willing stands in it. The Passing is not yet the weather.";
export const CLEARING_NEED_MORTAL = "A mortality act is required. Ione Kade is still here to speak a last word.";
export const CLEARING_NEED_GARDEN = "Nara Vale will not stand in a hole you left as wreckage.";
export const CLEARING_SPECTATOR = "A ring in the asphalt. You cannot prepare the ground.";
export const CLEARING_CONTEST =
  "You extracted the Clearing. Cold is a current. The hole closes. The hour does not open.";
export const PASSING_APPEAR =
  "A trace, not a face. The city is briefly world again. A stipend for the shrine. Cult upkeep. No mint. The token does not buy the hour.";
export const STIPEND = 2;
export const WINK_STIPEND =
  "Appearance pays a shrine, not a stick. Cult upkeep. Combat is not.";
export const STIPEND_SINK =
  "You spent the Passing stipend on the shrine. Cult upkeep. Bestand stayed. This was not a fetch.";
export const STIPEND_HELD = "The stipend is already in the shrine. Keep still costs Bestand.";

export const APPEAR_PLAQUE: Sign = {
  id: CLEARING_RING.id,
  title: "The Clearing — world",
  text: "A trace. The city is briefly world. Stipend for the shrine. The number does not strike.",
  x: CLEARING_RING.x,
  y: CLEARING_RING.y,
};

export function appearPoi(): Poi {
  return {
    id: CLEARING_RING.id,
    name: "The Clearing — world",
    x: CLEARING_RING.x,
    y: CLEARING_RING.y,
    kind: "clearing-appear",
  };
}

export const CREDITS_COPY =
  "Reverie Studios. The Last God. Lucah Rosenberg-Lee. Collective. The hour is residual. The MMO is the rest of life. No mint. This was not a fetch.";
export const WINK_CREDITS = "A trace names the room. Combat is not. The token does not buy the hour.";
export const CREDITS_NEED = "The city is not world yet. Credits wait on Appearance.";
export const CREDITS_HELD = "The names already hold. The MMO is the rest of life.";
export const CREDITS_SPECTATOR = "A ring. You do not get the names.";

export const CREDITS_PLAQUE: Sign = {
  id: CLEARING_RING.id,
  title: "Credits",
  text: "Reverie Studios. The Last God. Lucah Rosenberg-Lee. Collective. Then the MMO. The number does not strike.",
  x: CLEARING_RING.x,
  y: CLEARING_RING.y,
};

export function creditsPoi(): Poi {
  return {
    id: CLEARING_RING.id,
    name: "Credits",
    x: CLEARING_RING.x,
    y: CLEARING_RING.y,
    kind: "clearing-credits",
  };
}

export const SEASON_COPY =
  "The residual season. Wet Grid flags by default. Spoils from people. The MMO is the rest of life. Combat is not. This was not a fetch.";
export const WINK_SEASON = "A season is a street, not a stick. The token does not strike.";
export const SEASON_NEED = "Credits first. The hour is not residual yet.";
export const SEASON_HELD = "The season already holds. The street flags. Combat is not.";
export const SEASON_SPECTATOR = "A wet street. You do not get a season.";
export const SEASON_CULT = "The street is cult. A season does not list here.";

export const SEASON_PLAQUE: Sign = {
  id: WET_GRID.id,
  title: "The season — residual",
  text: "Flagged by default. Spoils from people. Guests are not loot. The number does not strike.",
  x: WET_GRID.x,
  y: WET_GRID.y,
};

export function seasonPoi(): Poi {
  return {
    id: WET_GRID.id,
    name: "The season — residual",
    x: WET_GRID.x,
    y: WET_GRID.y,
    kind: "wet-grid-season",
  };
}

export const BRACKET_COPY =
  "Equalized seasonal bracket. Serials stay visible. You did not strike harder. This was not a fetch.";
export const WINK_BRACKET = "A bracket is equal. Presence, not a stick. The token does not strike.";
export const BRACKET_NEED = "Name the residual season first.";
export const BRACKET_HELD = "The bracket already holds. Serials stay visible. Combat is not.";
export const BRACKET_SPECTATOR = "A wet street. You do not get a bracket.";
export const BRACKET_CULT = "The street is cult. A bracket does not list here.";

export const BRACKET_PLAQUE: Sign = {
  id: WET_GRID.id,
  title: "The season — equal",
  text: "Equalized. Serials stay. The number does not strike.",
  x: WET_GRID.x,
  y: WET_GRID.y,
};

export function bracketPoi(): Poi {
  return {
    id: WET_GRID.id,
    name: "The season — equal",
    x: WET_GRID.x,
    y: WET_GRID.y,
    kind: "wet-grid-bracket",
  };
}

export function wetGridDefaultFlag(args: { wetCult: boolean; seasonHeld: boolean; gestell: number }): boolean {
  return !args.wetCult && (args.seasonHeld || args.gestell >= GESTELL_HOT);
}

export const PARTY_BLIND =
  "You're looking at something I'm not. I cannot spend your Wink. This was not a fetch.";
export const WINK_PARTY_BLIND = "A Wink is private. Combat is not. The token does not show it.";
export const PARTY_BLIND_HELD = "They still cannot see it. The Wink stays yours.";
export const PARTY_BLIND_SPECTATOR = "They are looking at you. You do not see a Wink.";
export const PARTY_BLIND_NEED = "Speak with Nara, Quill, and Ord first. Then a Wink they cannot share.";

export const PARTY_BLIND_PLAQUE: Sign = {
  id: "party-blind",
  title: "The party cannot see",
  text: "A Wink is not a lecture. They cannot spend it. The number does not strike.",
  x: 240,
  y: 720,
};

export function partyBlindPoi(x: number, y: number): Poi {
  return { id: "party-blind", name: "The party cannot see", x, y, kind: "party-blind" };
}
export const AURA_DECAY = 1;
export const APPEAR_SLOW = 0.25;

export function auraTowardSeed(args: {
  aura: number;
  seed: number;
  dt: number;
  slow: boolean;
  guest: boolean;
}): number {
  if (args.guest) return 0;
  if (args.aura <= args.seed) return args.aura;
  const rate = (args.slow ? APPEAR_SLOW : 1) * AURA_DECAY;
  return Math.max(args.seed, args.aura - rate * args.dt);
}
export const PASSING_ABSENCE =
  "The hour went by. Absence is honest. Nara Vale stays. Solo cannot force a god.";
export const PARTY_STAND =
  "The party will not stand. Nara, Ord, or Quill walked. You cannot force the hour alone. This was not a fetch.";
export const WINK_PARTY = "A Clearing needs the living. Combat is not.";

export const PARTY_PLAQUE: Sign = {
  id: CLEARING_RING.id,
  title: "The Clearing — empty party",
  text: "The hour is not a solo. They will not stand. The number does not strike.",
  x: CLEARING_RING.x,
  y: CLEARING_RING.y,
};

export function emptyPartyPoi(): Poi {
  return {
    id: CLEARING_RING.id,
    name: "The Clearing — empty party",
    x: CLEARING_RING.x,
    y: CLEARING_RING.y,
    kind: "clearing-empty",
  };
}

export function partyWilling(args: { naraGone?: boolean; ordGone?: boolean; quillGone?: boolean }): boolean {
  return !args.naraGone && !args.ordGone && !args.quillGone;
}
export const NARA_STAYS =
  "The hour went by. I stay. The hole is still a grave. Fetch would have sent me home.";
export const NARA_STAYS_LATER = "I am still here. Absence is honest. I will not number a god.";
export const WINK_PASS_ABSENCE =
  "A going-under Wink. The hour declined. Nara Vale stays. Combat is not.";

export const ABSENCE_PLAQUE: Sign = {
  id: CLEARING_RING.id,
  title: "The Clearing — absence",
  text: "The hour went by. Nara Vale stays. Absence is a standing. The number does not strike.",
  x: CLEARING_RING.x,
  y: CLEARING_RING.y,
};

export function absencePoi(): Poi {
  return {
    id: CLEARING_RING.id,
    name: "The Clearing — absence",
    x: CLEARING_RING.x,
    y: CLEARING_RING.y,
    kind: "clearing-absence",
  };
}
export const PASSING_HIJACK =
  "Safety or Cold claimed the rite. The world continues. You are marked. No mint.";
export const WINK_HIJACK =
  "A mark, not a stick. The hour was claimed. The token does not strike.";
export const HIJACK_MARK_LINE =
  "Safety or Cold claimed this hour. You are marked. The world continues.";
export const HIJACK_SPECTATOR = "The hole was claimed. You do not carry the mark.";

export function hijackByOf(frozen: boolean, starved: boolean, cold: boolean): "safety" | "cold" {
  return frozen || starved ? "safety" : "cold";
}

export function hijackPlaque(by: "safety" | "cold"): Sign {
  return {
    id: CLEARING_RING.id,
    title: by === "cold" ? "The Clearing — Cold" : "The Clearing — Safety",
    text:
      by === "cold"
        ? "A concentrator claimed the hour. The world continues. You are marked. Combat is not."
        : "Safety claimed the hour. The freeze ate the rite. You are marked. Combat is not.",
    x: CLEARING_RING.x,
    y: CLEARING_RING.y,
  };
}

export function hijackPoi(by: "safety" | "cold"): Poi {
  return {
    id: CLEARING_RING.id,
    name: by === "cold" ? "The Clearing — Cold" : "The Clearing — Safety",
    x: CLEARING_RING.x,
    y: CLEARING_RING.y,
    kind: "clearing-hijack",
  };
}

export function hijackMark(serial: number): HistoryMark {
  return {
    id: `hijack-${serial}`,
    serial,
    x: CLEARING_RING.x,
    y: CLEARING_RING.y + 24,
    line: HIJACK_MARK_LINE,
  };
}
export const PASSING_FAIL = "Gestell is maxed. Without a Clearing the hour does not open.";
export const WINK_PASS_FAIL =
  "The hour did not open. Gestell drinks the hole. A stipend is not owed. Combat is not.";
export const FAIL_LATER = "The Clearing already failed. The process kept the weather.";

export const FAIL_PLAQUE: Sign = {
  id: CLEARING_RING.id,
  title: "The Clearing — failed",
  text: "No hole. Gestell kept the weather. No stipend. The number does not strike.",
  x: CLEARING_RING.x,
  y: CLEARING_RING.y,
};

export function failPoi(): Poi {
  return {
    id: CLEARING_RING.id,
    name: "The Clearing — failed",
    x: CLEARING_RING.x,
    y: CLEARING_RING.y,
    kind: "clearing-failed",
  };
}

export const STORM_COPY =
  "You took Storm. The failed hole is wreckage vision. Readiness burns. You do not strike harder. This was not a fetch.";
export const WINK_STORM =
  "Angel of History faces the wreckage. Storm is a stance, not a stick. Combat is not.";
export const STORM_NEED = "The Clearing must fail first. Storm is not a fetch at a live hole.";
export const STORM_HELD = "Storm already holds. The wreckage is still a face. Combat is not.";
export const STORM_SPECTATOR = "A failed hole. You do not take the storm.";
export const STORM_BURN = 3;

export const STORM_PLAQUE: Sign = {
  id: CLEARING_RING.id,
  title: "The Clearing — storm",
  text: "Wreckage vision. Readiness burns. The number does not strike.",
  x: CLEARING_RING.x,
  y: CLEARING_RING.y,
};

export function stormPoi(): Poi {
  return {
    id: CLEARING_RING.id,
    name: "The Clearing — storm",
    x: CLEARING_RING.x,
    y: CLEARING_RING.y,
    kind: "clearing-storm",
  };
}
export const PASSING_NEED = "The Clearing is not held. Keep the hole first.";

export const CLEARING_PLAQUE: Sign = {
  id: CLEARING_RING.id,
  title: "The Clearing",
  text: "Keep the hole. The hour is not a character. Mortality first.",
  x: CLEARING_RING.x,
  y: CLEARING_RING.y,
};

export function clearingPoi(held: boolean): Poi {
  return {
    id: CLEARING_RING.id,
    name: held ? "Clearing — held" : "The Clearing",
    x: CLEARING_RING.x,
    y: CLEARING_RING.y,
    kind: held ? "clearing-held" : "clearing-ring",
  };
}

export function dwellNeed(gestell: number): number {
  return gestell >= GESTELL_HOT ? DWELL_MAXED : DWELL_SOLO;
}

export function passingResult(args: {
  starved: boolean;
  gestell: number;
  clearingOpen: boolean;
  dwellers: number;
  cold: boolean;
  partyWilling?: boolean;
}): Exclude<PassingOutcome, ""> {
  if (!args.clearingOpen) return "failed";
  if (args.starved) return "hijack";
  if (args.partyWilling === false) return "absence";
  if (args.gestell >= GESTELL_HOT && args.dwellers < dwellNeed(args.gestell)) return "absence";
  if (args.cold && args.gestell >= 71) return "hijack";
  return "appearance";
}

export function passingCopy(outcome: Exclude<PassingOutcome, "">): string {
  if (outcome === "appearance") return PASSING_APPEAR;
  if (outcome === "absence") return PASSING_ABSENCE;
  if (outcome === "hijack") return PASSING_HIJACK;
  return PASSING_FAIL;
}

export function liveNpcs(
  ioneGone: boolean,
  ordAtCable = false,
  naraAtStrait = false,
  quillAtGrid = false,
  vesperAtFoundry = false,
  ordAtStrait = false,
  wetCult = false,
  straitBuried = false,
  ordAtCare = false,
  naraAtCare = false,
  quillNoPrint = false,
  vesperNoGod = false,
  naraAtClearing = false,
  ordAtHijack = false,
  vesperAtHijack = false,
  naraGone = false,
  ordGone = false,
  quillGone = false,
  vesperGone = false,
  naraPersonHeld = false,
  quillPersonHeld = false,
  ordPersonHeld = false,
  vesperPersonHeld = false,
): Npc[] {
  let base = ioneGone ? [...NAVE_NPCS] : [...NAVE_NPCS, IONE];
  if (ordAtCable) {
    base = base.map((n) =>
      n.id === "ord" ? { ...n, x: ORGAN_CABLE.x, y: ORGAN_CABLE.y + 48, role: "At the Cable" } : n,
    );
  }
  if (naraAtStrait) {
    base = base.map((n) =>
      n.id === "nara"
        ? {
            ...n,
            x: ORGAN_STRAIT.x,
            y: ORGAN_STRAIT.y + 48,
            role: straitBuried ? "Burying the canal" : "At the Strait",
          }
        : n,
    );
  }
  if (ordAtStrait) {
    const ox = naraAtStrait ? ORGAN_STRAIT.x + 56 : ORGAN_STRAIT.x;
    base = base.map((n) =>
      n.id === "ord" ? { ...n, x: ox, y: ORGAN_STRAIT.y + 48, role: "At the Strait" } : n,
    );
  }
  if (quillAtGrid) {
    base = base.map((n) =>
      n.id === "quill"
        ? {
            ...n,
            x: WET_GRID.x + 48,
            y: WET_GRID.y,
            role: quillNoPrint ? "Will not print it" : wetCult ? "Keeping the street" : "On the wet street",
          }
        : n,
    );
  } else if (quillNoPrint) {
    base = base.map((n) => (n.id === "quill" ? { ...n, role: "Will not print it" } : n));
  }
  if (vesperAtFoundry) {
    base = [...base, { ...VESPER, role: vesperNoGod ? "Will not sell it" : VESPER.role }];
  }
  if (ordAtCare) {
    base = base.map((n) =>
      n.id === "ord"
        ? { ...n, x: CARE_DOOR.x - 48, y: CARE_DOOR.y + 40, role: "Will not number it" }
        : n,
    );
  }
  if (naraAtCare) {
    base = base.map((n) =>
      n.id === "nara"
        ? { ...n, x: CARE_DOOR.x + 40, y: CARE_DOOR.y + 40, role: "Burying absence" }
        : n,
    );
  }
  if (naraAtClearing) {
    base = base.map((n) =>
      n.id === "nara"
        ? { ...n, x: CLEARING_RING.x + 40, y: CLEARING_RING.y + 36, role: "Stays" }
        : n,
    );
  }
  if (ordAtHijack) {
    base = base.map((n) =>
      n.id === "ord"
        ? { ...n, x: CLEARING_RING.x - 48, y: CLEARING_RING.y + 36, role: "Claimed the rite" }
        : n,
    );
  }
  if (vesperAtHijack) {
    if (!base.some((n) => n.id === "vesper")) base = [...base, { ...VESPER }];
    base = base.map((n) =>
      n.id === "vesper"
        ? { ...n, x: CLEARING_RING.x + 8, y: CLEARING_RING.y - 40, role: "Claimed the yield" }
        : n,
    );
  }
  if (naraGone && !naraPersonHeld) base = base.filter((n) => n.id !== "nara");
  if (naraPersonHeld) {
    base = base.map((n) => (n.id === "nara" ? { ...n, role: "Stays" } : n));
  }
  if (ordGone && !ordPersonHeld) base = base.filter((n) => n.id !== "ord");
  if (ordPersonHeld) {
    base = base.map((n) => (n.id === "ord" ? { ...n, role: "Stays" } : n));
  }
  if (quillGone && !quillPersonHeld) base = base.filter((n) => n.id !== "quill");
  if (quillPersonHeld) {
    base = base.map((n) => (n.id === "quill" ? { ...n, role: "Stays" } : n));
  }
  if (vesperGone && !vesperPersonHeld) base = base.filter((n) => n.id !== "vesper");
  if (vesperPersonHeld) {
    if (!base.some((n) => n.id === "vesper")) base = [...base, { ...VESPER }];
    base = base.map((n) => (n.id === "vesper" ? { ...n, role: "Stays" } : n));
  }
  return base;
}
