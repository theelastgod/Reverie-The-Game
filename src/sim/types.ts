/**
 * Shared types for the client, the shared sim and the Worker.
 * Persistent ids and shapes here do not change once shipped; add, never rename.
 */

export type DistrictId = "nave" | "wet" | "care" | "annex" | "kerb" | "ring" | "organs" | "clearing";
export type Fourfold = "earth" | "sky" | "mortals" | "divinities";
export type House = "" | Fourfold;
export type Messenger = "" | "herald" | "witness" | "ruin" | "dweller" | "cybernetic" | "iridescent";
export type WinkSchool = "" | "hint" | "wreckage" | "omen" | "dwelling" | "process" | "surface";
export type Stance = "restraint" | "storm";
export type Current = "" | "cold" | "iridescent" | "readiness";
export type Movement = 1 | 2 | 3 | 4 | 5; // 5 = after the credits, the MMO is the rest of life
export type PartyState = "none" | "with" | "waiting" | "gone";

export type Intent = { up: boolean; down: boolean; left: boolean; right: boolean };
export type Vec = { x: number; y: number };
export type Facing = { dx: number; dy: number };

// ---------------------------------------------------------------- items

export type ItemKind = "cult" | "exhibition" | "paper";
export type Item = {
  id: string; // stable per stack, e.g. "paper:insurance", "copy:wink-hint", "cult:copper-binding"
  kind: ItemKind;
  name: string;
  qty: number;
  value: number; // exhibition: market value units; decays
  bound?: boolean; // cult objects are soulbound / House-bound and never drop or list
};

export type Claim = {
  id: string;
  label: string;
  amount: number;
  filedAt: number;
  readyAt: number;
  settled: boolean;
};

// ---------------------------------------------------------------- dialogue

export type DialogueChoiceView = { id: string; label: string };
export type DialogueView = {
  npc: string; // npc id, or "" for the city speaking
  node: string;
  speaker: string; // display name
  portrait: string; // asset file under assets/, e.g. "nara.jpg"
  text: string;
  wink: string; // private line for this viewer; "" for guests / dark aura / low restraint
  choices: DialogueChoiceView[]; // empty = Continue closes or advances
};

export type Notice = { text: string; at: number; tone: "ink" | "gold" | "hot" | "acid" | "sky" };

// ---------------------------------------------------------------- player

export type HistoryLog = {
  passings: number;
  buried: number;
  looted: number;
  houses: Fourfold[];
  outcomes: string[]; // passing outcomes in order
};

export type KitState = { verb: Messenger; until: number; data?: string };

/** A ruin duel: an offer until it is answered, then a closed ring of two bodies until it expires or one falls. */
export type DuelState = { with: string; until: number; accepted: boolean };

export type Player = {
  id: string;
  name: string; // "GUEST" or "#0042"
  x: number;
  y: number;
  facing: Facing;
  district: DistrictId;

  // identity
  guest: boolean;
  serial: number | null;
  house: House;
  messenger: Messenger;
  winkSchool: WinkSchool;
  locked: boolean; // guest reached the going-under threshold
  wallet: string; // lowercase address bound by a signature the server verified; "" for none

  // body
  hp: number;
  dead: boolean;
  strikeCd: number;
  heavyCd: number;
  heavyWindup: number;
  hitStop: number;
  dodgeT: number;
  dodgeCd: number;
  dodgeX: number;
  dodgeY: number;
  stance: Stance;
  kitCd: number;
  kit: KitState | null;

  // resources (server-owned numbers)
  aura: number;
  auraSeed: number;
  bestand: number; // unbanked purse
  banked: number;
  winke: number;
  fakeWinke: number; // forged copies held; decay and shatter
  readiness: number;
  restraint: number;
  current: Current;
  extracted: number; // lifetime extractions
  kept: number;
  extractedSinceFuneral: number;

  // campaign
  movement: Movement;
  quests: Record<string, number>; // questId -> step index; >= steps.length is complete
  flags: Record<string, number>; // personal flags and counters
  choices: Record<string, string>; // key decisions by id
  party: Record<string, PartyState>; // nara / quill / ord
  dialogue: DialogueView | null;
  frozenBy: string; // district id this player signed a freeze for, or ""

  // pvp
  flagged: boolean;
  truceUntil: number;
  lastKillId: string;
  lastKillAt: number;
  campCount: number;
  spectated: number;
  kills: number;
  deaths: number;
  duel?: DuelState; // a ruin duel offered or live; absent when none

  // inventory
  items: Item[];
  claims: Claim[];
  claimsFiled: number;
  insured: boolean;
  respawn: Vec & { district: DistrictId };

  // presentation
  heard: string; // the last spoken/ narrated line, cleared by the client after display
  heardAt: number;
  wink: string; // the last private Wink; "" for guests
  winkAt: number;
  notices: Notice[];

  // writeback
  history: HistoryLog;
  linkedAt: number;
  createdAt: number;
};

// ---------------------------------------------------------------- world entities

/** How a serial was proven: the disarmed mock, or a wallet signature the server verified before calling the sim. */
export type LinkProof = { kind: "mock" } | { kind: "wallet"; address: string };

export type EnemyKind = "clerk" | "intake" | "warden" | "enforcer" | "dummy";
export type EnemyState = "idle" | "aggro" | "telegraph" | "recover" | "return" | "dead";
export type Enemy = {
  id: string;
  kind: EnemyKind;
  name: string;
  district: DistrictId;
  x: number;
  y: number;
  home: Vec;
  hp: number;
  maxHp: number;
  state: EnemyState;
  t: number; // time left in the current state
  targetId: string;
  participants: string[]; // players who struck it in this life
  respawnAt: number;
  tint: "lavender" | "wine" | "sky" | "paper";
  fallFlag?: string; // personal flag every participant gets when it falls (the Intake Clerk credits by kind)
};

export type YieldNode = {
  id: string;
  district: DistrictId;
  x: number;
  y: number;
  charges: number;
  regenAt: number;
  kept: boolean; // marked kept; glows; Herald can announce it
  keptBy: string;
  announcedUntil: number;
  seed: boolean; // a Dweller planted a Clearing seed here
};

export type Wreckage = {
  id: string;
  x: number;
  y: number;
  district: DistrictId;
  fromId: string; // player id or enemy id
  fromName: string;
  fromSerial: number | null;
  killerId: string;
  at: number;
  until: number;
  buried: boolean;
  looted: boolean;
  bestand: number; // dropped purse still on the ground
  items: Item[]; // dropped exhibition items
  fromHistory?: { passings: number; buried: number; looted: number }; // the fallen Angel's log at the fall; Ruin-sight reads it
};

export type Grave = { id: string; x: number; y: number; district: DistrictId; name: string; by: string; at: number; until: number };

export type NpcState = {
  id: string;
  x: number;
  y: number;
  district: DistrictId;
  present: boolean;
  state: string; // free-form schedule state used by content, e.g. "home", "garden", "clearing", "gone"
};

export type PoiState = { state: string; by: string; at: number; count: number };

export type HouseScores = Record<Fourfold, number>;
export type HouseWar = {
  active: boolean;
  startsAt: number;
  endsAt: number;
  held: HouseScores; // seconds held this window
  winner: House;
  lastWinner: House;
  site: string; // poi id of the contested site
};

export type Listing = { id: string; sellerId: string; sellerName: string; item: Item; price: number; at: number };

export type ClearingState = {
  open: boolean;
  reserve: number;
  openedAt: number;
  seeds: string[]; // node ids / tile keys that hold a seed
  // keep / extract are the dwelling votes as last tallied; votes is one stance per Angel per contest
  contest: { active: boolean; keep: number; extract: number; endsAt: number; votes?: Record<string, "keep" | "extract"> } | null;
  heldBy: string[]; // player ids dwelling in the ring right now
  lastOutcome: "" | "kept" | "extracted";
};

export type PassingOutcome = "" | "appearance" | "absence" | "hijack" | "failed";
export type PassingState = {
  count: number;
  lastOutcome: PassingOutcome;
  lastBy: string;
  lastAt: number;
  hijackedBy: "" | "cold" | "safety";
  appearanceUntil: number; // seasonal aura decay slowdown
};

export type FailedPassing = { id: string; x: number; y: number; district: DistrictId; season: number; line: string };
export type HistoryMark = { id: string; serial: number; x: number; y: number; district: DistrictId; line: string };

export type NewsItem = { text: string; at: number };

export type WorldState = {
  version: 2;
  now: number;
  tick: number;
  gestell: number;
  season: { id: number; startedAt: number };
  weatherNamed: boolean;
  frozen: Record<string, number>; // district id -> until (simulation seconds)

  players: Map<string, Player>;
  intents: Map<string, Intent>;
  npcs: Record<string, NpcState>;
  enemies: Enemy[];
  nodes: YieldNode[];
  wreckage: Wreckage[];
  graves: Grave[];
  pois: Record<string, PoiState>;
  flags: Record<string, number>; // shared world flags and counters

  houses: { standing: HouseScores; tithe: number; war: HouseWar };
  clearing: ClearingState;
  passing: PassingState;
  market: Listing[];
  news: NewsItem[];
  failed: FailedPassing[];
  history: HistoryMark[];
  rng: number; // xorshift state; the server owns randomness
};

// ---------------------------------------------------------------- content contracts

export type Ctx = { w: WorldState; p: Player; now: number };

/** A Wink authored per school; `default` is heard by any school without its own line. */
export type WinkBySchool = Partial<Record<Exclude<WinkSchool, "">, string>> & { default: string };
export type WinkText = string | WinkBySchool;

export type Effect =
  | { kind: "flag"; key: string; value?: number } // personal flag (default 1)
  | { kind: "count"; key: string; delta: number } // personal counter
  | { kind: "worldFlag"; key: string; value?: number }
  | { kind: "worldCount"; key: string; delta: number }
  | { kind: "choice"; key: string; value: string }
  | { kind: "readiness"; delta: number }
  | { kind: "restraint"; delta: number }
  | { kind: "aura"; delta: number }
  | { kind: "winke"; delta: number }
  | { kind: "fakeWinke"; delta: number }
  | { kind: "bestand"; delta: number; sink?: string; earner?: string }
  | { kind: "banked"; delta: number }
  | { kind: "gestell"; delta: number }
  | { kind: "current"; value: Current }
  | { kind: "movement"; value: Movement }
  | { kind: "party"; npc: string; state: PartyState }
  | { kind: "npc"; id: string; x?: number; y?: number; district?: DistrictId; present?: boolean; state?: string }
  | { kind: "poi"; id: string; state: string }
  | { kind: "news"; text: string }
  | { kind: "say"; text: string } // heard line
  | { kind: "wink"; text: WinkText } // private Wink (filtered by guest / aura / restraint; per school when authored so)
  | { kind: "notice"; text: string; tone?: Notice["tone"] }
  | { kind: "item"; add?: Item; remove?: string; qty?: number }
  | { kind: "claim"; label: string; amount?: number }
  | { kind: "standing"; house: Fourfold; delta: number }
  | { kind: "spawn"; enemy: EnemyKind; at: string; name?: string } // at = position id in the map
  | { kind: "node"; id: string; op: "extract" | "keep" | "announce" | "seed" }
  | { kind: "wreckage"; op: "bury" | "loot"; id?: string } // nearest if id omitted
  | { kind: "lock" } // guest lock
  | { kind: "under" } // the going-under: Angels die-as-death and wake in the Care
  | { kind: "respawnAt"; poi: string }
  | { kind: "heal"; amount: number }
  | { kind: "insure" }
  | { kind: "teleport"; to: string } // position id in the map
  | { kind: "freeze"; district: DistrictId; seconds: number }
  | { kind: "quest"; id: string; op: "start" | "advance" | "complete" }
  | { kind: "clearing"; op: "open" | "keep" | "extract" | "pass" }
  | { kind: "passing" }
  | { kind: "dialogue"; npc: string; node: string }
  | { kind: "history"; passings?: number; buried?: number; looted?: number; outcome?: string };

export type GuestPolicy = "allow" | "spectate" | "deny";

export type PoiVerb = {
  key: "F" | "E" | "Q";
  label: string;
  choice: string; // sent as `choice` in the interact message
  when?: (ctx: Ctx) => boolean;
  guest?: GuestPolicy; // default "allow"
  cost?: { bestand: number; sink: string };
  once?: string; // personal flag set when done; the verb hides afterwards
  say?: string | ((ctx: Ctx) => string);
  effects?: Effect[] | ((ctx: Ctx) => Effect[]);
};

export type PoiConfig = {
  id: string;
  label: string | ((ctx: Ctx) => string);
  reach?: number; // px, default 56
  verbs: PoiVerb[];
  plate?: string; // journal art file
};

export type QuestStep = {
  id: string;
  title: string;
  detail: string | ((ctx: Ctx) => string);
  target?: string | ((ctx: Ctx) => string | undefined); // POI / NPC / position id for the bearing marker
  plate?: string;
  done: (ctx: Ctx) => boolean;
  onComplete?: Effect[] | ((ctx: Ctx) => Effect[]);
};

export type Quest = {
  id: string;
  title: string;
  kind: "spine" | "side";
  movement: Movement;
  district: DistrictId;
  guestLegal: boolean;
  available: (ctx: Ctx) => boolean; // may start
  steps: QuestStep[];
  onStart?: Effect[] | ((ctx: Ctx) => Effect[]);
  onFinish?: Effect[] | ((ctx: Ctx) => Effect[]);
  changes: "poi" | "npc" | "cult" | "standing" | "spine"; // what a side quest changes in the world
};

export type DialogueChoice = {
  id: string;
  label: string;
  when?: (ctx: Ctx) => boolean;
  next?: string; // node id; omitted closes
  effects?: Effect[] | ((ctx: Ctx) => Effect[]);
};

export type DialogueNode = {
  id: string;
  speaker?: string; // npc id; defaults to the owning npc
  text: string | ((ctx: Ctx) => string);
  wink?: WinkText | ((ctx: Ctx) => WinkText);
  choices?: DialogueChoice[];
  next?: string | ((ctx: Ctx) => string | undefined);
  effects?: Effect[] | ((ctx: Ctx) => Effect[]); // applied when the node opens, once per opening
};

export type NpcDef = {
  id: string;
  name: string;
  role: string;
  home: string; // position id in the map
  portrait: string; // assets file
  sprite: string; // texture key
  party: boolean;
  personal?: (ctx: Ctx, shared: NpcState) => Partial<NpcState> | null; // viewer-specific override
  entry: (ctx: Ctx) => string; // dialogue node id to open
  nodes: Record<string, DialogueNode>;
};

export type Objective = {
  quest: string;
  step: string;
  title: string;
  detail: string;
  target: (Vec & { district: DistrictId }) | null;
  plate: string;
  movement: Movement;
};

/** An active side quest's current step, with the quest's own title, for the journal. */
export type SideObjective = Objective & { questTitle: string; district: DistrictId };

export type PromptVerb = { key: "F" | "E" | "Q" | "V" | "T" | "I"; label: string; choice: string };
export type Prompt = { targetId: string; targetKind: "poi" | "npc" | "wreckage" | "player" | "enemy" | "node"; name: string; verbs: PromptVerb[] };
