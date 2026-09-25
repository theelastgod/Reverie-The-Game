/**
 * Wire protocol. Versioned. Additive only once shipped.
 */
import type {
  Claim, ClearingState, DialogueView, DistrictId, Enemy, FailedPassing, Fourfold, Grave, HistoryMark, House, HouseScores,
  HouseWar, Intent, Item, Listing, Messenger, Movement, Notice, NpcState, Objective, PartyState, PassingState, PoiState,
  Player, Prompt, SideObjective, Stance, WinkSchool, Wreckage, YieldNode,
} from "./types";

export const PROTOCOL_VERSION = 2;

export type ClientMsg =
  | { t: "intent"; intent: Partial<Intent> }
  | { t: "dodge"; dx: number; dy: number }
  | { t: "strike" }
  | { t: "heavy" }
  | { t: "stance" }
  | { t: "kit"; targetId?: string }
  | { t: "interact"; targetId: string; choice: string }
  | { t: "talk"; npcId: string }
  | { t: "choose"; choiceId: string }
  | { t: "close" }
  | { t: "link"; serial: number; sig: string }
  | { t: "flag" }
  | { t: "truce" }
  | { t: "use"; itemId: string }
  | { t: "market"; op: "list" | "buy" | "cancel"; itemId?: string; listingId?: string; price?: number };

export const CLIENT_MSG_TYPES: ReadonlyArray<ClientMsg["t"]> = [
  "intent", "dodge", "strike", "heavy", "stance", "kit", "interact", "talk", "choose", "close", "link", "flag", "truce", "use", "market",
];

/** What other players see of a player. Never their Winke, flags, purse or claims. */
export type PublicPlayer = {
  id: string;
  name: string;
  x: number;
  y: number;
  facing: { dx: number; dy: number };
  district: DistrictId;
  guest: boolean;
  locked: boolean;
  house: House;
  messenger: Messenger;
  hpFrac: number;
  dead: boolean;
  dodgeT: number;
  stance: Stance;
  flagged: boolean;
  truce: boolean;
  auraTier: 0 | 1 | 2 | 3; // 0 guest, 1 dim, 2 present, 3 high — style only
  kit: Messenger | "";
  heavyWindup: number;
  hitStop: number;
};

export type NodeView = YieldNode & { yieldHint?: number; chargesHint?: number; safe?: boolean };
/** `passings` is the fallen Angel's Passing count, sent only while the viewer faces the wreckage (Ruin-angel kit). */
export type WreckageView = Pick<Wreckage, "id" | "x" | "y" | "district" | "fromName" | "fromSerial" | "buried" | "looted" | "until"> & { yours: boolean; bestand?: number; passings?: number };
/** `offers`: this person has a side hour to hand this viewer right now (a hub line whose gate passes and whose hour the viewer has not started). */
export type NpcView = NpcState & { name: string; role: string; sprite: string; party: PartyState; offers: boolean };
export type PoiView = { id: string; state: string; count: number };

/** `kitReadout` is the Ruin-angel kit reading the viewer's own history while Face is active. */
export type YouView = Omit<Player, "items" | "claims"> & { items: Item[]; claims: Claim[]; kitReadout?: string[] };

export type Snap = {
  t: "snap";
  v: typeof PROTOCOL_VERSION;
  now: number;
  tick: number;
  gestell: number;
  weather: string; // display label for the climate band
  weatherNamed: boolean;
  frozen: string[]; // district ids under a freeze
  district: DistrictId; // the viewer's district
  you: YouView;
  players: PublicPlayer[];
  enemies: Enemy[];
  npcs: NpcView[];
  nodes: NodeView[];
  wreckage: WreckageView[];
  graves: Grave[];
  pois: PoiView[];
  history: HistoryMark[];
  failed: FailedPassing[];
  houses: { standing: HouseScores; tithe: number; war: HouseWar };
  clearing: Pick<ClearingState, "open" | "reserve" | "contest" | "lastOutcome"> & { dwellers: number };
  passing: PassingState & { season: number };
  market: Listing[];
  news: string[];
  prompt: Prompt | null;
  objective: Objective | null;
  sideObjectives: SideObjective[];
  notices: Notice[];
};

export type Hello = { t: "hello"; v: typeof PROTOCOL_VERSION; id: string; guest: boolean; you: YouView };
export type ServerMsg = Hello | Snap;

export function isClientMsg(data: unknown): data is ClientMsg {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const t = (data as { t?: unknown }).t;
  return typeof t === "string" && (CLIENT_MSG_TYPES as ReadonlyArray<string>).includes(t);
}

export type WeatherBand = "clear" | "mixed" | "fat" | "meltdown";
export function weatherBand(gestell: number): WeatherBand {
  if (gestell <= 30) return "clear";
  if (gestell <= 70) return "mixed";
  if (gestell <= 90) return "fat";
  return "meltdown";
}
export const WEATHER_LABEL: Record<WeatherBand, string> = {
  clear: "Clear weather",
  mixed: "Mixed weather",
  fat: "Fat weather",
  meltdown: "Meltdown weather",
};

export type { Movement, Fourfold, WinkSchool };
