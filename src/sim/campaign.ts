export type NpcId = "nara" | "quill" | "ord";

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
    | "clearing-listed"
    | "operator-desk"
    | "m3-shut"
    | "m3-open"
    | "wreckage-garden"
    | "organ-strait"
    | "organ-foundry"
    | "organ-cable"
    | "forge-tray";
};

export type Passing = {
  ready: number;
  starved: boolean;
};

export const GUEST_LOCK = "A guest cannot prepare the ground.";
export const TEST_SERIAL = 7777;
export const MOCK_SIG = "mock";

export const NAVE_NPCS: Npc[] = [
  { id: "nara", name: "Nara Vale", role: "Sexton", x: 240, y: 720 },
  { id: "quill", name: "Quill", role: "Forger", x: 1080, y: 504 },
  { id: "ord", name: "Ord", role: "Ex-Safety", x: 400, y: 260 },
];

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

export const NPC_LINES: Record<NpcId, { first: string; later: string }> = {
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

export const SAFETY_ANNEX = { id: "safety-annex", x: 320, y: 320 };
export const PASSING_READY = 8;
export const FREEZE_COPY =
  "You signed the freeze. The district holds. The Passing will go hungry. Peace is a kind of weather.";
export const WINK_FREEZE = "You bought time. You spent a god. The hour does not forgive the signature.";
export const FREEZE_SPECTATOR = "A desk. Paper. You are not the one who signs.";
export const FREEZE_NEED_HALL = "The Annex will not take a name that has not read the hall.";
export const FREEZE_EXTRACT = "The freeze holds the nodes. Extraction is postponed. The Passing stays hungry.";

export const ANNEX_PLAQUE: Sign = {
  id: SAFETY_ANNEX.id,
  title: "Safety Annex",
  text: "Sign here. The district holds. The hour does not.",
  x: SAFETY_ANNEX.x,
  y: SAFETY_ANNEX.y,
};

export function emptyPassing(): Passing {
  return { ready: PASSING_READY, starved: false };
}

export function starvedPassing(): Passing {
  return { ready: 0, starved: true };
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

export const GARDEN_RITE: Rite = { id: WRECK_GARDEN.id, kind: "garden", x: WRECK_GARDEN.x, y: WRECK_GARDEN.y, done: false };

export const NARA_SILENCE =
  "Nara Vale looks at the garden that used to be a hole. She will not speak until it is in the ground.";
export const NARA_AFTER_GARDEN =
  "You put it in the earth. I will walk to the Strait. I will not forgive the factory.";
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
export const FORGE_LESSON =
  "Quill fans two hints. One was buried. One was printed. The printed one lists. The buried one opens. I can teach the difference. I can also sell the print.";
export const WINK_FORGE =
  "The last god's hint can be forged. Exhibition Winke travel. Cult Winke stay in the hand that buried.";
export const FORGE_SPOT =
  "You keep the eye. The cult hint does not list. Copies will not open the hole.";
export const FORGE_SELL =
  "You sold a copy. Twenty-five Bestand. Aura thins. The cult hint is not in the bag you sold.";
export const FORGE_SPECTATOR = "Quill is doing something with paper. You cannot tell which sheet is the prayer.";
export const FORGE_NEED_MARKET = "Quill is not teaching until you have stood at the listing.";

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
  return [...NAVE_SIGNS.map((s) => ({ ...s })), { ...ANNEX_PLAQUE }, { ...STALL_PLAQUE }, { ...OPERATOR_PLAQUE }, { ...FORGE_PLAQUE }];
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

export function visibleWink(guest: boolean, wink: string): string {
  return guest ? "" : wink;
}

export function namedWeatherPoi(): Poi {
  return { id: "weather", name: "Named weather", x: 192, y: 340, kind: "named-weather" };
}

export function npcById(id: string): Npc | undefined {
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

export function auraSeed(serial: number): number {
  return 8 + (serial % 13);
}

export function winkeVisible(guest: boolean): boolean {
  return !guest;
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

export function ruinSight(guest: boolean, serial: number | null): boolean {
  return !guest && serial === TEST_SERIAL;
}

export function visibleFailed(
  guest: boolean,
  serial: number | null,
  marks: FailedPassing[],
): FailedPassing[] {
  return ruinSight(guest, serial) ? marks : [];
}
