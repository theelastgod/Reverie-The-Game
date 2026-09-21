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
  kind: "burial" | "going-under";
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
  kind: "unnamed-weather" | "named-weather" | "care-shut" | "care-open";
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
export const WINK_CARE =
  "The Care does not keep you. It only lets you be mortal in a warehouse. The last god is not in the next room.";
export const CARE_SPECTATOR = "You see a door. You do not see what it is for.";

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
  return { nara: false, quill: false, ord: false, burial: false, under: false, care: false };
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
  return NAVE_SIGNS.map((s) => ({ ...s }));
}

export function navePois(): Poi[] {
  return [
    { id: "weather", name: "Unnamed weather", x: 192, y: 340, kind: "unnamed-weather" },
    { id: CARE_DOOR.id, name: "The Care (shut)", x: CARE_DOOR.x, y: CARE_DOOR.y, kind: "care-shut" },
  ];
}

export function openCarePoi(): Poi {
  return { id: CARE_DOOR.id, name: "The Care", x: CARE_DOOR.x, y: CARE_DOOR.y, kind: "care-open" };
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
