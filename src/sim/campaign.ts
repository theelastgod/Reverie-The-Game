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
    | "forge-tray"
    | "clearing-ring"
    | "clearing-held"
    | "wet-grid"
    | "wet-grid-cult"
    | "claims-desk"
    | "shrine-upkeep"
    | "sexton-mark"
    | "stall-dark"
    | "house-standing"
    | "fourfold-held"
    | "last-god-absent"
    | "last-god-buried"
    | "desk-empty"
    | "yield-empty"
    | "ione-gone";
};

export type PassingOutcome = "" | "appearance" | "absence" | "hijack" | "failed";

export type Passing = {
  ready: number;
  starved: boolean;
  outcome: PassingOutcome;
};

export const GUEST_LOCK = "A guest cannot prepare the ground.";
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
export const GUEST_GRIEF = "A guest is not a spoils path. The server will not pay you for that.";
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
    { ...CLAIMS_PLAQUE },
    { ...SHRINE_PLAQUE },
  ];
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
    claimsPoi(),
    shrinePoi(),
  ];
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

export function visibleHistory(guest: boolean, serial: number | null, marks: HistoryMark[]): HistoryMark[] {
  if (guest || serial == null || serial <= 0) return [];
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

export function ruinSight(guest: boolean, serial: number | null, house: House = ""): boolean {
  return !guest && (serial === TEST_SERIAL || house === "mortals");
}

export function visibleFailed(
  guest: boolean,
  serial: number | null,
  marks: FailedPassing[],
  house: House = "",
): FailedPassing[] {
  return ruinSight(guest, serial, house) ? marks : [];
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

export const CLEARING_PREPARE =
  "You keep the hole. The party still willing stands in it. The Passing is not yet the weather.";
export const CLEARING_NEED_MORTAL = "A mortality act is required. Ione Kade is still here to speak a last word.";
export const CLEARING_NEED_GARDEN = "Nara Vale will not stand in a hole you left as wreckage.";
export const CLEARING_SPECTATOR = "A ring in the asphalt. You cannot prepare the ground.";
export const CLEARING_CONTEST =
  "You extracted the Clearing. Cold is a current. The hole closes. The hour does not open.";
export const PASSING_APPEAR =
  "A trace, not a face. The city is briefly world again. No mint. The token does not buy the hour.";
export const PASSING_ABSENCE =
  "The hour went by. Absence is honest. Nara Vale stays. Solo cannot force a god.";
export const PASSING_HIJACK =
  "Safety or Cold claimed the rite. The world continues. You are marked. No mint.";
export const PASSING_FAIL = "Gestell is maxed. Without a Clearing the hour does not open.";
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
}): Exclude<PassingOutcome, ""> {
  if (!args.clearingOpen) return "failed";
  if (args.starved) return "hijack";
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
            role: wetCult ? "Keeping the street" : "On the wet street",
          }
        : n,
    );
  }
  if (vesperAtFoundry) base = [...base, { ...VESPER }];
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
  return base;
}
