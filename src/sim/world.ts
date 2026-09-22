import {
  ANGEL_UNDER,
  Beats,
  Clerk,
  CLERK_AGGRO,
  CLERK_DAMAGE,
  CLERK_TELEGRAPH,
  emptyBeats,
  emptyWeather,
  GUEST_LOCK,
  GOING_UNDER,
  SHRINE,
  lineFor,
  movementReady,
  namedWeatherPoi,
  naveClerks,
  navePois,
  naveRites,
  naveSigns,
  nearPoint,
  NpcId,
  npcById,
  Poi,
  Rite,
  Sign,
  STRUCK_PLAQUE,
  YIELD_EMPTY,
  WINK_YIELD_EMPTY,
  YIELD_EMPTY_NEED,
  YIELD_EMPTY_LATER,
  YIELD_EMPTY_SPECTATOR,
  YIELD_EMPTY_PLAQUE,
  yieldEmptyPoi,
  weatherComplete,
  WeatherHeard,
  WEATHER_NAMED,
  MOCK_SIG,
  TEST_SERIAL,
  auraSeed,
  auraTowardSeed,
  formatSerial,
  annexPoi,
  FailedPassing,
  FAILED_PASSING,
  HistoryMark,
  CLEARING_PRICE,
  CLEARING_STALL,
  CARE_DOOR,
  CARE_SPECTATOR,
  emptyPassing,
  FREEZE_COPY,
  FREEZE_COST,
  FREEZE_EXTRACT,
  FREEZE_NEED,
  FREEZE_NEED_HALL,
  FREEZE_SPECTATOR,
  HOUSE_HALL,
  Passing,
  SAFETY_ANNEX,
  starvedPassing,
  MARKET_BUY,
  MARKET_LISTING,
  MARKET_NEED_HALL,
  MARKET_SPECTATOR,
  QUILL_HANG_ASK,
  QUILL_HANG,
  QUILL_HANG_WAIT,
  QUILL_HANG_NEED,
  QUILL_HANG_SPECTATOR,
  WINK_HANG,
  QUILL_UNFLAG_ASK,
  QUILL_UNFLAG_WAIT,
  UNFLAG_COPY,
  WINK_UNFLAG,
  UNFLAG_NEED,
  UNFLAG_LATER,
  UNFLAG_SPECTATOR,
  FLAG_CULT,
  UNFLAG_PLAQUE,
  wetCultPoi,
  STALL_DARK_COPY,
  STALL_DARK_PLAQUE,
  stallDarkPoi,
  WINK_CARE,
  WINK_FREEZE,
  WINK_HALL,
  WINK_MARKET,
  gestellTax,
  hallCopy,
  hallPlaque,
  STANDING_COPY,
  STANDING_NEED,
  STANDING_WRONG,
  STANDING_HELD,
  STANDING_SPECTATOR,
  WINK_STANDING,
  HALL_STANDING_PLAQUE,
  hallStandingPoi,
  FOURFOLD_HOLD,
  WINK_FOURFOLD,
  FOURFOLD_NEED,
  FOURFOLD_HELD,
  FOURFOLD_SPECTATOR,
  FOURFOLD_PLAQUE,
  fourfoldReady,
  fourfoldPoi,
  LAST_GOD_COPY,
  WINK_LAST_GOD,
  LAST_GOD_NEED,
  LAST_GOD_HELD,
  LAST_GOD_SPECTATOR,
  LAST_GOD_PLAQUE,
  lastGodPoi,
  ORD_LAST,
  WINK_ORD_LAST,
  ORD_LAST_LATER,
  ORD_LAST_NEED,
  ORD_LAST_SPECTATOR,
  LAST_GOD_ORD_PLAQUE,
  lastGodOrdPoi,
  RESTRAINT_COPY,
  WINK_RESTRAINT,
  RESTRAINT_NEED,
  RESTRAINT_HELD,
  RESTRAINT_SPECTATOR,
  RESTRAINT_PLAQUE,
  restraintPoi,
  EXTRACT_PAY,
  RESTRAINT_PAY,
  STANCE_COPY,
  WINK_STANCE,
  STANCE_HELD,
  STANCE_STORM,
  STANCE_NEED,
  STANCE_SPECTATOR,
  STORM_BURNS,
  RESTRAINT_YIELD,
  STANCE_PLAQUE,
  stancePoi,
  VESPER_NOGOD,
  WINK_NOGOD,
  VESPER_NOGOD_LATER,
  VESPER_NOGOD_NEED,
  VESPER_NOGOD_SPECTATOR,
  NOGOD_PLAQUE,
  noGodPoi,
  houseHallPoi,
  openCarePoi,
  serialHistory,
  visibleHistory,
  visibleWink,
  WINK_HISTORY,
  WATCH_FAILED,
  WINK_FAILED,
  FAILED_SPECTATOR,
  visibleFailed,
  OPERATOR_DESK,
  OPERATOR_NEED_HALL,
  OPERATOR_OFFER,
  OPERATOR_REFUSE,
  OPERATOR_SPECTATOR,
  OPERATOR_TAKE,
  PRIVATE_YIELD,
  WINK_OPERATOR,
  m3Poi,
  GARDEN_BURY,
  GARDEN_RITE,
  M3_DOOR,
  M3_ENTER,
  M3_SPECTATOR,
  NARA_SILENCE,
  ORD_MAP,
  ORGAN_CABLE,
  ORGAN_FOUNDRY,
  ORGAN_NEED_M3,
  ORGAN_PLAQUES,
  ORGAN_STRAIT,
  WINK_GARDEN,
  WINK_ORGANS,
  WRECK_GARDEN,
  gardenPoi,
  organPoi,
  organsComplete,
  FORGE_TRAY,
  FORGE_PAY,
  LISTING_FEE,
  EXHIBIT_DECAY,
  CULT_NO_LIST,
  DECAY_COPY,
  FORGE_LESSON,
  FORGE_NEED_MARKET,
  FORGE_SELL,
  FORGE_SPOT,
  FORGE_SPECTATOR,
  WINK_FORGE,
  WET_GRID,
  CLAIMS_DESK,
  CLAIMS_ARMED,
  CLAIM_HOLD,
  DESK_FILE,
  DESK_WAIT,
  DESK_DISARMED,
  DESK_EMPTY,
  DESK_SPECTATOR,
  BANK_COPY,
  WINK_BANK,
  BANK_EMPTY,
  BANK_SPECTATOR,
  spendBestand,
  vaultHeard,
  BANK_PLAQUE,
  bankPoi,
  FUNERAL_COST,
  FUNERAL_COPY,
  FUNERAL_NEED,
  SHRINE_COST,
  SHRINE_COPY,
  SHRINE_NEED,
  SHRINE_SPECTATOR,
  AURA_DIM,
  RESTORE_COST,
  RESTORE_GAIN,
  RESTORE_COPY,
  RESTORE_NEED,
  RESTORE_FULL,
  RESTORE_SPECTATOR,
  INSURANCE_COST,
  INSURANCE_COPY,
  INSURANCE_NEED,
  INSURANCE_HELD,
  INSURANCE_USED,
  INSURANCE_SPECTATOR,
  WINK_SINK,
  REPAIR_COST,
  REPAIR_COPY,
  REPAIR_NEED,
  REPAIR_NONE,
  REPAIR_SPECTATOR,
  Claim,
  FLAG_COPY,
  FLAG_SPECTATOR,
  SPOILS_COPY,
  GUEST_GRIEF,
  DUEL_COPY,
  SPECTATE_COPY,
  SPECTATE_CAP,
  WINK_DUEL,
  CAMP_COPY,
  CLOCK_OUT,
  CLOCK_NEED,
  CLOCK_GONE,
  CLOCK_SPECTATOR,
  WINK_CLOCK,
  deskEmptyPoi,
  ANNEX_HOME,
  ANNEX_NEED,
  ANNEX_GONE,
  ANNEX_SPECTATOR,
  WINK_ANNEX,
  ANNEX_HOME_PLAQUE,
  annexHomePoi,
  annexRoutePoi,
  inWetGrid,
  CLEARING_RING,
  CLEARING_PREPARE,
  CLEARING_NEED_MORTAL,
  CLEARING_NEED_GARDEN,
  CLEARING_SPECTATOR,
  CLEARING_CONTEST,
  CONTEST_PAY,
  IONE,
  IONE_SPECTATOR,
  IONE_MARK,
  IONE_MARK_LATER,
  IONE_MARK_SPECTATOR,
  WINK_ABSENCE,
  IONE_GONE_PLAQUE,
  ioneGonePoi,
  LAST_WORD,
  LAST_WORD_GONE,
  WINK_TURN,
  PASSING_NEED,
  STIPEND,
  WINK_STIPEND,
  STIPEND_SINK,
  APPEAR_PLAQUE,
  appearPoi,
  WINK_PASS_FAIL,
  FAIL_PLAQUE,
  FAIL_LATER,
  STORM_COPY,
  WINK_STORM,
  STORM_NEED,
  STORM_HELD,
  STORM_SPECTATOR,
  STORM_BURN,
  STORM_PLAQUE,
  stormPoi,
  failPoi,
  NARA_STAYS,
  NARA_STAYS_LATER,
  WINK_PASS_ABSENCE,
  ABSENCE_PLAQUE,
  absencePoi,
  WINK_HIJACK,
  hijackByOf,
  hijackPlaque,
  hijackPoi,
  hijackMark,
  clearingPoi,
  liveNpcs,
  NARA_AFTER_GARDEN,
  NARA_MARK,
  NARA_MARK_LATER,
  WINK_SEXTON,
  SEXTON_SPECTATOR,
  sextonPoi,
  NARA_CANAL_ASK,
  NARA_CANAL,
  NARA_CANAL_WAIT,
  NARA_CANAL_LATER,
  NARA_GOD_ASK,
  NARA_GOD,
  NARA_GOD_LATER,
  NARA_GOD_NEED,
  NARA_GOD_SPECTATOR,
  WINK_NARA_GOD,
  LAST_GOD_BURIED_PLAQUE,
  lastGodBuriedPoi,
  QUILL_NOPRINT,
  WINK_NOPRINT,
  QUILL_NOPRINT_LATER,
  QUILL_NOPRINT_SPECTATOR,
  NOPRINT_PLAQUE,
  noprintPoi,
  WINK_CANAL,
  CANAL_SPECTATOR,
  CANAL_NEED,
  CANAL_PLAQUE,
  canalBuriedPoi,
  ORD_ERRAND,
  ORD_ERRAND_WAIT,
  ORD_CABLE_LATER,
  WINK_ERRAND,
  CABLE_QUIET_COPY,
  CABLE_QUIET_PLAQUE,
  CABLE_DARK,
  WINK_CABLE_DARK,
  CABLE_NEED_STRAIT,
  CABLE_DARK_LATER,
  CABLE_DARK_SPECTATOR,
  CABLE_DARK_PLAQUE,
  cableDarkPoi,
  SKY_STANDING,
  WINK_SKY,
  SKY_NEED,
  SKY_WRONG,
  SKY_HELD,
  SKY_SPECTATOR,
  SKY_PLAQUE,
  skyStandingPoi,
  EARTH_STANDING,
  WINK_EARTH,
  EARTH_NEED,
  EARTH_WRONG,
  EARTH_HELD,
  EARTH_SPECTATOR,
  EARTH_PLAQUE,
  earthStandingPoi,
  DIV_STANDING,
  WINK_DIV,
  DIV_NEED,
  DIV_WRONG,
  DIV_HELD,
  DIV_SPECTATOR,
  DIV_PLAQUE,
  divStandingPoi,
  ERRAND_EXTRACT,
  ERRAND_SPECTATOR,
  cableQuietPoi,
  VESPER,
  VESPER_NEED_FOUNDRY,
  VESPER_UNLIGHT_ASK,
  VESPER_UNLIGHT_WAIT,
  FOUNDRY_DARK_COPY,
  WINK_FOUNDRY_DARK,
  FOUNDRY_NEED_COLD,
  FOUNDRY_DARK_LATER,
  FOUNDRY_SPECTATOR,
  OPERATOR_VACANT,
  VESPER_FOUNDRY_LATER,
  FOUNDRY_DARK_PLAQUE,
  OPERATOR_VACANT_PLAQUE,
  foundryDarkPoi,
  operatorVacantPoi,
  STRAIT_REFUSE,
  WINK_STRAIT_REFUSE,
  STRAIT_NEED_DARK,
  STRAIT_REFUSED_LATER,
  STRAIT_SPECTATOR,
  STRAIT_REFUSED_PLAQUE,
  straitRefusedPoi,
  ORD_WITNESS,
  ORD_WITNESS_LATER,
  WINK_WITNESS,
  ORD_WITNESS_SPECTATOR,
  passingCopy,
  passingResult,
  House,
  houseFor,
  houseName,
  earthTax,
  divinitiesKeep,
  emptyWar,
  emptyScores,
  HouseScores,
  HouseWar,
  scoreWar,
  resolveWar,
  warTax,
  TITHE_COST,
  TITHE_COPY,
  TITHE_NEED,
  TITHE_SPECTATOR,
  TITHE_WRONG,
  TITHE_NONE,
  TITHE_HELD,
  WINK_WAR,
  Messenger,
  messengerFor,
  messengerName,
  ANNOUNCE_COPY,
  ANNOUNCE_NEED,
  ANNOUNCE_SPECTATOR,
  WINK_ANNOUNCE,
  BLITZ_COPY,
  WINK_BLITZ,
  BLITZ_NEED,
  BLITZ_HELD,
  BLITZ_SPECTATOR,
  lastWrecks,
  blitzPoi,
  CYBER_COPY,
  WINK_CYBER,
  CYBER_NEED,
  CYBER_HELD,
  CYBER_SPECTATOR,
  CYBER_PLAQUE,
  cyberPoi,
  GLAMOUR_COPY,
  WINK_GLAMOUR,
  GLAMOUR_NEED,
  GLAMOUR_HELD,
  GLAMOUR_SPECTATOR,
  GLAMOUR_DARK,
  GLAMOUR_PLAQUE,
  glamourPoi,
  DWELL_COPY,
  WINK_DWELL,
  DWELL_NEED,
  DWELL_HELD,
  DWELL_SPECTATOR,
  DWELL_PLAQUE,
  dwellPoi,
  PARTY_STAND,
  WINK_PARTY,
  PARTY_PLAQUE,
  emptyPartyPoi,
  partyWilling,
  NARA_LEAVE,
  WINK_NARA_LEAVE,
  NARA_LEAVE_HELD,
  NARA_LEAVE_SPECTATOR,
  NARA_LEAVE_GESTELL,
  NARA_GONE_PLAQUE,
  naraGonePoi,
  ORD_LEAVE_GESTELL,
  ORD_LEAVE,
  WINK_ORD_LEAVE,
  ORD_GONE_PLAQUE,
  ordGonePoi,
  QUILL_LEAVE,
  WINK_QUILL_LEAVE,
  QUILL_GONE_PLAQUE,
  quillGonePoi,
  VESPER_LEAVE,
  WINK_VESPER_LEAVE,
  VESPER_LEAVE_HELD,
  VESPER_LEAVE_SPECTATOR,
  VESPER_GONE_PLAQUE,
  vesperGonePoi,
  BlitzMark,
} from "./campaign";
import { BODY_R, circleHitsWalls, nearNode, naveNodes, YieldNode } from "./nave";

export const TICK_HZ = 20;
export const DT = 1 / TICK_HZ;
export const SPEED = 160;
export const STRIKE_RANGE = 52;
export const STRIKE_DAMAGE = 22;
export const STRIKE_COOLDOWN = 0.45;
export const MAX_HP = 100;
export const NAVE_SPAWN_X = 48 * 4;
export const NAVE_SPAWN_Y = 48 * 10;

export type Intent = { up: boolean; down: boolean; left: boolean; right: boolean };

export type Wreckage = {
  id: string;
  x: number;
  y: number;
  fromId: string;
  fromName: string;
  until: number;
};

export type Player = {
  id: string;
  x: number;
  y: number;
  guest: boolean;
  aura: number;
  bestand: number;
  winke: number;
  hp: number;
  strikeCd: number;
  readiness: number;
  beats: Beats;
  weather: WeatherHeard;
  namedWeather: boolean;
  locked: boolean;
  heard: string;
  serial: number | null;
  wink: string;
  inCare: boolean;
  inM3: boolean;
  current: "" | "cold" | "readiness";
  cultWink: boolean;
  fakeWinke: number;
  house: House;
  messenger: Messenger;
  flagged: boolean;
  banked: number;
  lastKillId: string;
  spectated: number;
  claims: Claim[];
  exhibitT: number;
  insured: boolean;
  lastCareX: number;
  lastCareY: number;
  damaged: number;
  cultMark: boolean;
  stipend: number;
  storm: boolean;
  restraint: boolean;
  surface: boolean;
};

export type WorldState = {
  players: Map<string, Player>;
  intents: Map<string, Intent>;
  nodes: YieldNode[];
  wreckage: Wreckage[];
  rites: Rite[];
  clerks: Clerk[];
  signs: Sign[];
  pois: Poi[];
  weatherNamed: boolean;
  careOpen: boolean;
  frozen: boolean;
  passing: Passing;
  history: HistoryMark[];
  failed: FailedPassing[];
  clearingOpen: boolean;
  m3Open: boolean;
  forgedSold: boolean;
  ioneGone: boolean;
  ordAtCable: boolean;
  naraAtStrait: boolean;
  stallDark: boolean;
  quillAtGrid: boolean;
  wetCult: boolean;
  vesperAtFoundry: boolean;
  foundryDark: boolean;
  annexHome: boolean;
  straitRefused: boolean;
  ordAtStrait: boolean;
  straitBuried: boolean;
  cableDark: boolean;
  skyStanding: boolean;
  earthStanding: boolean;
  divStanding: boolean;
  hallLamp: boolean;
  fourfoldHeld: boolean;
  lastGodNamed: boolean;
  ordAtCare: boolean;
  naraAtCare: boolean;
  lastGodBuried: boolean;
  quillNoPrint: boolean;
  restraintHeld: boolean;
  vesperNoGod: boolean;
  deskVaulted: boolean;
  appearSlow: boolean;
  appearWorld: boolean;
  naraAtClearing: boolean;
  hijacked: boolean;
  hijackBy: "" | "safety" | "cold";
  ordAtHijack: boolean;
  vesperAtHijack: boolean;
  clearingFailed: boolean;
  stormHeld: boolean;
  blitzHeld: boolean;
  blitzMarks: BlitzMark[];
  cyberHeld: boolean;
  glamourHeld: boolean;
  dwellHeld: boolean;
  naraGone: boolean;
  ordGone: boolean;
  quillGone: boolean;
  vesperGone: boolean;
  standing: HouseScores;
  announced: string | null;
  war: HouseWar;
  gestell: number;
  now: number;
};

export function spawnGuest(id: string): Player {
  return {
    id,
    x: NAVE_SPAWN_X,
    y: NAVE_SPAWN_Y,
    guest: true,
    aura: 0,
    bestand: 0,
    winke: 0,
    hp: MAX_HP,
    strikeCd: 0,
    readiness: 0,
    beats: emptyBeats(),
    weather: emptyWeather(),
    namedWeather: false,
    locked: false,
    heard: "",
    serial: null,
    wink: "",
    inCare: false,
    inM3: false,
    current: "",
    cultWink: false,
    fakeWinke: 0,
    house: "",
    messenger: "",
    flagged: false,
    banked: 0,
    lastKillId: "",
    spectated: 0,
    claims: [],
    exhibitT: 0,
    insured: false,
    lastCareX: 0,
    lastCareY: 0,
    damaged: 0,
    cultMark: false,
    stipend: 0,
    storm: false,
    restraint: false,
    surface: false,
  };
}

function continueAfterDeath(p: Player, patch: Partial<Player> = {}): Player {
  const paper = p.insured && !p.guest && !p.locked;
  const x = paper ? p.lastCareX || SHRINE.x : NAVE_SPAWN_X;
  const y = paper ? p.lastCareY || SHRINE.y : NAVE_SPAWN_Y;
  return {
    ...spawnGuest(p.id),
    bestand: p.bestand,
    winke: p.winke,
    aura: Math.max(0, p.aura - 8),
    guest: p.guest,
    beats: { ...p.beats },
    weather: { ...p.weather },
    namedWeather: p.namedWeather,
    locked: p.locked,
    heard: paper ? INSURANCE_USED : p.heard,
    serial: p.serial,
    wink: p.wink,
    inCare: p.inCare,
    inM3: p.inM3,
    current: p.current,
    cultWink: p.cultWink,
    cultMark: p.cultMark,
    house: p.house,
    messenger: p.messenger,
    flagged: p.flagged,
    banked: p.banked,
    lastKillId: p.lastKillId,
    claims: p.claims,
    exhibitT: p.exhibitT,
    spectated: p.spectated,
    lastCareX: p.lastCareX,
    lastCareY: p.lastCareY,
    insured: false,
    damaged: p.damaged + p.fakeWinke,
    fakeWinke: 0,
    stipend: p.stipend,
    storm: p.storm,
    restraint: p.restraint,
    surface: p.surface,
    x,
    y,
    ...patch,
    ...(paper ? { heard: INSURANCE_USED, insured: false, x, y } : {}),
  };
}

export function guestCanClaim(_p: Player): boolean {
  return false;
}

export function damageFor(_p: Player): number {
  return STRIKE_DAMAGE;
}

export function stepPlayer(p: Player, intent: Intent, dt: number): Player {
  let vx = (intent.right ? 1 : 0) - (intent.left ? 1 : 0);
  let vy = (intent.down ? 1 : 0) - (intent.up ? 1 : 0);
  const len = Math.hypot(vx, vy) || 1;
  vx = (vx / len) * SPEED * dt;
  vy = (vy / len) * SPEED * dt;
  let x = p.x + vx;
  let y = p.y + vy;
  if (circleHitsWalls(x, y, BODY_R)) {
    if (!circleHitsWalls(p.x + vx, p.y, BODY_R)) {
      x = p.x + vx;
      y = p.y;
    } else if (!circleHitsWalls(p.x, p.y + vy, BODY_R)) {
      x = p.x;
      y = p.y + vy;
    } else {
      x = p.x;
      y = p.y;
    }
  }
  return { ...p, x, y, strikeCd: Math.max(0, p.strikeCd - dt) };
}

export function emptyWorld(): WorldState {
  return {
    players: new Map(),
    intents: new Map(),
    nodes: naveNodes(),
    wreckage: [],
    rites: naveRites(),
    clerks: naveClerks(),
    signs: naveSigns(),
    pois: navePois(),
    weatherNamed: false,
    careOpen: false,
    frozen: false,
    passing: emptyPassing(),
    history: [],
    failed: [],
    clearingOpen: false,
    m3Open: false,
    forgedSold: false,
    ioneGone: false,
    ordAtCable: false,
    naraAtStrait: false,
    stallDark: false,
    quillAtGrid: false,
    wetCult: false,
    vesperAtFoundry: false,
    foundryDark: false,
    annexHome: false,
    straitRefused: false,
    ordAtStrait: false,
    straitBuried: false,
    cableDark: false,
    skyStanding: false,
    earthStanding: false,
    divStanding: false,
    hallLamp: false,
    fourfoldHeld: false,
    lastGodNamed: false,
    ordAtCare: false,
    naraAtCare: false,
    lastGodBuried: false,
    quillNoPrint: false,
    restraintHeld: false,
    vesperNoGod: false,
    deskVaulted: false,
    appearSlow: false,
    appearWorld: false,
    naraAtClearing: false,
    hijacked: false,
    hijackBy: "",
    ordAtHijack: false,
    vesperAtHijack: false,
    clearingFailed: false,
    stormHeld: false,
    blitzHeld: false,
    blitzMarks: [],
    cyberHeld: false,
    glamourHeld: false,
    dwellHeld: false,
    naraGone: false,
    ordGone: false,
    quillGone: false,
    vesperGone: false,
    standing: emptyScores(),
    announced: null,
    war: emptyWar(),
    gestell: 12,
    now: 0,
  };
}

export function tickWorld(w: WorldState, dt: number): WorldState {
  const now = w.now + dt;
  const players = new Map<string, Player>();
  for (const [id, p] of w.players) {
    const intent = w.intents.get(id) ?? { up: false, down: false, left: false, right: false };
    players.set(id, stepPlayer(p, intent, dt));
  }
  const afterClerks = tickClerks({ ...w, now, players }, dt);
  const afterWar = tickHouseWar(afterClerks, dt);
  const afterDecay = tickExhibit(afterWar, dt);
  const afterAura = tickAura(afterDecay, dt);
  return {
    ...afterAura,
    wreckage: afterAura.wreckage.filter((r) => r.until > now),
  };
}

export function tickAura(w: WorldState, dt: number): WorldState {
  const players = new Map(w.players);
  let changed = false;
  for (const [id, p] of players) {
    const seed = p.guest ? 0 : auraSeed(p.serial ?? 0);
    const aura = auraTowardSeed({ aura: p.aura, seed, dt, slow: w.appearSlow, guest: p.guest });
    if (aura === p.aura) continue;
    players.set(id, { ...p, aura });
    changed = true;
  }
  return changed ? { ...w, players } : w;
}

export function tickExhibit(w: WorldState, dt: number): WorldState {
  const players = new Map(w.players);
  let changed = false;
  for (const [id, p] of players) {
    if (p.fakeWinke <= 0) continue;
    let exhibitT = p.exhibitT + dt;
    let fakeWinke = p.fakeWinke;
    let heard = p.heard;
    while (fakeWinke > 0 && exhibitT >= EXHIBIT_DECAY) {
      exhibitT -= EXHIBIT_DECAY;
      fakeWinke -= 1;
      heard = DECAY_COPY;
      changed = true;
    }
    if (exhibitT !== p.exhibitT || fakeWinke !== p.fakeWinke) {
      players.set(id, { ...p, exhibitT, fakeWinke, heard });
      changed = true;
    }
  }
  return changed ? { ...w, players } : w;
}

export function tickHouseWar(w: WorldState, dt: number): WorldState {
  if (!w.clearingOpen || w.war.winner) return w;
  const keep = { ...w.war.keep };
  for (const p of w.players.values()) {
    if (p.guest || p.locked || !p.house || p.hp <= 0) continue;
    if (!nearPoint(p.x, p.y, CLEARING_RING.x, CLEARING_RING.y, 64)) continue;
    keep[p.house] += dt;
  }
  return { ...w, war: resolveWar({ ...w.war, keep }, "keep") };
}

export function tickClerks(w: WorldState, dt: number): WorldState {
  const players = new Map(w.players);
  const clerks: Clerk[] = [];
  let wreckage = w.wreckage;
  for (const c of w.clerks) {
    if (c.hp <= 0) continue;
    const living = [...players.values()].filter((p) => p.hp > 0);
    const target = living.find((p) => nearPoint(p.x, p.y, c.x, c.y, CLERK_AGGRO));
    if (c.telegraph > 0) {
      const next = c.telegraph - dt;
      if (next <= 0 && target) {
        const hit = players.get(target.id)!;
        const hp = hit.hp - CLERK_DAMAGE;
        if (hp <= 0) {
          wreckage = [
            ...wreckage,
            { id: `w-${hit.id}-${w.now}`, x: hit.x, y: hit.y, fromId: hit.id, fromName: "Guest", until: w.now + 45 },
          ];
          players.set(hit.id, continueAfterDeath(hit, { heard: `${c.name} did their job.` }));
        } else {
          players.set(hit.id, { ...hit, hp });
        }
        clerks.push({ ...c, telegraph: 0 });
      } else {
        clerks.push({ ...c, telegraph: target ? Math.max(0, next) : 0 });
      }
    } else if (target) {
      clerks.push({ ...c, telegraph: CLERK_TELEGRAPH });
    } else {
      clerks.push({ ...c, telegraph: 0 });
    }
  }
  return { ...w, players, clerks, wreckage };
}

export function applyStrike(w: WorldState, attackerId: string): WorldState {
  const a = w.players.get(attackerId);
  if (!a || a.hp <= 0 || a.strikeCd > 0) return w;
  const players = new Map(w.players);
  const attacker = { ...a, strikeCd: STRIKE_COOLDOWN };
  players.set(attackerId, attacker);
  const dmg = damageFor(a);
  let wreckage = w.wreckage;
  let gestell = w.gestell;
  const duelGraves: { x: number; y: number }[] = [];
  const fallen = new Set<string>();
  for (const [id, b] of w.players) {
    if (id === attackerId || b.hp <= 0) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (dx * dx + dy * dy > STRIKE_RANGE * STRIKE_RANGE) continue;
    let hp = b.hp - dmg;
    if (hp <= 0) {
      wreckage = [
        ...wreckage,
        { id: `w-${id}-${w.now}`, x: b.x, y: b.y, fromId: id, fromName: b.guest ? "Guest" : "Angel", until: w.now + 45 },
      ];
      const grief = a.guest || b.guest || b.locked;
      const grave = w.wreckage.find(
        (r) => nearPoint(a.x, a.y, r.x, r.y, 72) && nearPoint(b.x, b.y, r.x, r.y, 72),
      );
      const ruinDuel = !grief && !!grave;
      const flaggedFight = !grief && a.flagged && b.flagged;
      const drop = flaggedFight || ruinDuel ? Math.floor(b.bestand * 0.3) : 0;
      const fakeDrop = (flaggedFight || ruinDuel) && b.fakeWinke > 0 ? 1 : 0;
      const camp = (flaggedFight || ruinDuel) && a.lastKillId === id;
      const killer = players.get(attackerId)!;
      players.set(attackerId, {
        ...killer,
        bestand: killer.bestand + drop,
        fakeWinke: killer.fakeWinke + fakeDrop,
        aura: camp ? Math.max(0, killer.aura - 4) : killer.aura,
        lastKillId: id,
        heard: grief ? GUEST_GRIEF : camp ? CAMP_COPY : ruinDuel ? DUEL_COPY : drop ? SPOILS_COPY : killer.heard,
        wink: ruinDuel ? visibleWink(false, WINK_DUEL) : killer.wink,
      });
      fallen.add(id);
      if (ruinDuel && grave) duelGraves.push(grave);
      players.set(
        id,
        continueAfterDeath({
          ...b,
          bestand: b.bestand - drop,
          fakeWinke: b.fakeWinke - fakeDrop,
        }),
      );
      if (camp) gestell = Math.min(100, gestell + 4);
    } else {
      players.set(id, { ...b, hp });
    }
  }
  for (const grave of duelGraves) {
    for (const [sid, s] of players) {
      if (sid === attackerId || fallen.has(sid) || s.guest || s.locked || s.hp <= 0) continue;
      if (!nearPoint(s.x, s.y, grave.x, grave.y, 80)) continue;
      if (s.spectated >= SPECTATE_CAP) continue;
      players.set(sid, {
        ...s,
        spectated: s.spectated + 1,
        aura: s.aura + 1,
        heard: SPECTATE_COPY,
        wink: visibleWink(false, WINK_DUEL),
      });
    }
  }
  const clerks: Clerk[] = [];
  for (const c of w.clerks) {
    const dx = c.x - a.x;
    const dy = c.y - a.y;
    if (c.hp <= 0 || dx * dx + dy * dy > STRIKE_RANGE * STRIKE_RANGE) {
      if (c.hp > 0) clerks.push(c);
      continue;
    }
    const hp = c.hp - dmg;
    if (hp <= 0) {
      wreckage = [
        ...wreckage,
        { id: `w-${c.id}-${w.now}`, x: c.x, y: c.y, fromId: c.id, fromName: c.name, until: w.now + 45 },
      ];
      players.set(attackerId, { ...players.get(attackerId)!, heard: `${c.name} falls. They were doing a job.` });
    } else {
      clerks.push({ ...c, hp });
    }
  }
  return { ...w, players, wreckage, clerks, gestell };
}

function withNaraLeave(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.guest || p.locked || w.naraGone || p.beats.funeral) return w;
  if (w.gestell < NARA_LEAVE_GESTELL) return w;
  const players = new Map(w.players);
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, naraGone: true },
    heard: NARA_LEAVE,
    wink: visibleWink(false, WINK_NARA_LEAVE),
  });
  const pois = w.pois.some((poi) => poi.id === "nara-gone") ? w.pois : [...w.pois, naraGonePoi()];
  const signs = w.signs.some((s) => s.id === "nara-gone") ? w.signs : [...w.signs, { ...NARA_GONE_PLAQUE }];
  return { ...w, players, naraGone: true, pois, signs };
}

function withOrdLeave(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.guest || p.locked || w.ordGone || p.beats.freeze || w.frozen) return w;
  if (w.gestell < ORD_LEAVE_GESTELL) return w;
  const players = new Map(w.players);
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, ordGone: true },
    heard: ORD_LEAVE,
    wink: visibleWink(false, WINK_ORD_LEAVE),
  });
  const pois = w.pois.some((poi) => poi.id === "ord-gone") ? w.pois : [...w.pois, ordGonePoi()];
  const signs = w.signs.some((s) => s.id === "ord-gone") ? w.signs : [...w.signs, { ...ORD_GONE_PLAQUE }];
  return { ...w, players, ordGone: true, pois, signs };
}

export function applyUse(
  w: WorldState,
  playerId: string,
  nodeId: string,
  choice: "extract" | "keep",
): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || p.locked) return w;
  const idx = w.nodes.findIndex((n) => n.id === nodeId);
  if (idx < 0) return w;
  const node = w.nodes[idx];
  if (node.depleted || !nearNode(p.x, p.y, node)) return w;
  if (choice === "extract" && w.frozen) {
    const players = new Map(w.players);
    players.set(playerId, { ...p, heard: FREEZE_EXTRACT });
    return { ...w, players };
  }
  const nodes = w.nodes.slice();
  const players = new Map(w.players);
  if (choice === "extract") {
    nodes[idx] = { ...node, depleted: true, kept: false };
    const tax = p.beats.hall ? warTax(earthTax(gestellTax(w.gestell), p.house), p.house, w.war) : 0;
    const heard = p.beats.errand && !p.beats.cableQuiet ? ERRAND_EXTRACT : p.heard;
    const pay = p.restraint ? RESTRAINT_PAY : EXTRACT_PAY;
    players.set(playerId, {
      ...p,
      bestand: p.bestand + Math.max(0, pay - tax),
      heard: p.restraint ? RESTRAINT_YIELD : heard,
    });
    return withOrdLeave(withNaraLeave({ ...w, nodes, players, gestell: Math.min(100, w.gestell + 6) }, playerId), playerId);
  }
  nodes[idx] = { ...node, depleted: true, kept: true };
  if (p.beats.errand && !p.beats.cableQuiet && !p.guest && !w.cableDark) {
    players.set(playerId, {
      ...p,
      winke: p.winke + divinitiesKeep(p.house),
      readiness: p.readiness + 2,
      beats: { ...p.beats, cableQuiet: true },
      heard: CABLE_QUIET_COPY,
      wink: visibleWink(false, WINK_ERRAND),
    });
    return {
      ...w,
      nodes,
      players,
      gestell: Math.max(0, w.gestell - 3),
      ordAtCable: true,
      pois: w.pois.map((poi) => (poi.id === ORGAN_CABLE.id ? cableQuietPoi() : poi)),
      signs: w.signs.map((s) => (s.id === ORGAN_CABLE.id ? { ...CABLE_QUIET_PLAQUE } : s)),
    };
  }
  players.set(playerId, {
    ...p,
    winke: p.winke + divinitiesKeep(p.house) + (p.restraint ? 1 : 0),
    readiness: p.readiness + 1,
  });
  return { ...w, nodes, players, gestell: Math.max(0, w.gestell - 3) };
}

function withNamedWeather(w: WorldState, playerId: string, p: Player): WorldState {
  if (p.namedWeather || !weatherComplete(p.weather)) {
    const players = new Map(w.players);
    players.set(playerId, p);
    return { ...w, players };
  }
  const named = { ...p, namedWeather: true, readiness: p.readiness + 1, heard: WEATHER_NAMED };
  const players = new Map(w.players);
  players.set(playerId, named);
  if (w.weatherNamed) return { ...w, players };
  return {
    ...w,
    players,
    weatherNamed: true,
    signs: w.signs.map((s) => (s.id === "safety-plaque" ? { ...STRUCK_PLAQUE } : s)),
    pois: w.pois.map((poi) => (poi.id === "weather" ? namedWeatherPoi() : poi)),
  };
}

export function applyTalk(w: WorldState, playerId: string, npcId: string): WorldState {
  const p = w.players.get(playerId);
  const npc =
    liveNpcs(w.ioneGone, w.ordAtCable, w.naraAtStrait, w.quillAtGrid, w.vesperAtFoundry, w.ordAtStrait, w.wetCult, w.straitBuried, w.ordAtCare, w.naraAtCare, w.quillNoPrint, w.vesperNoGod, w.naraAtClearing, w.ordAtHijack, w.vesperAtHijack, w.naraGone, w.ordGone, w.quillGone, w.vesperGone).find((n) => n.id === npcId) ??
    npcById(npcId);
  if (!p || p.hp <= 0 || !npc || !nearPoint(p.x, p.y, npc.x, npc.y)) return w;
  const id = npc.id as NpcId;
  const players = new Map(w.players);
  const gardenOpen = w.rites.some((r) => r.kind === "garden" && !r.done);
  if (id === "nara" && gardenOpen && (p.beats.under || w.m3Open) && !w.naraAtClearing) {
    players.set(playerId, { ...p, heard: NARA_SILENCE });
    return { ...w, players };
  }
  if (id === "nara" && w.naraAtClearing && !p.guest && !p.locked) {
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, naraStay: true, absenceHour: true, nara: true },
      heard: p.beats.naraStay ? NARA_STAYS_LATER : NARA_STAYS,
      wink: visibleWink(false, WINK_PASS_ABSENCE),
    });
    return { ...w, players };
  }
  if (id === "nara" && w.naraAtClearing && (p.guest || p.locked)) {
    players.set(playerId, { ...p, heard: SEXTON_SPECTATOR });
    return { ...w, players };
  }
  if (id === "nara" && p.beats.garden && !p.guest && !p.locked) {
    if (p.beats.sexton) {
      if (w.lastGodNamed || p.beats.lastGod) {
        if (p.beats.naraGod || w.lastGodBuried) {
          players.set(playerId, { ...p, heard: NARA_GOD_LATER, wink: visibleWink(false, WINK_NARA_GOD) });
          return { ...w, players };
        }
        if (p.beats.naraGodAsk) {
          players.set(playerId, {
            ...p,
            beats: { ...p.beats, naraGod: true, nara: true },
            cultWink: true,
            heard: NARA_GOD,
            wink: visibleWink(false, WINK_NARA_GOD),
            readiness: p.readiness + 1,
          });
          return {
            ...w,
            players,
            naraAtCare: true,
            lastGodBuried: true,
            pois: w.pois.map((poi) => (poi.id === CARE_DOOR.id ? lastGodBuriedPoi() : poi)),
            signs: w.signs.some((s) => s.id === CARE_DOOR.id)
              ? w.signs.map((s) => (s.id === CARE_DOOR.id ? { ...LAST_GOD_BURIED_PLAQUE } : s))
              : [...w.signs, { ...LAST_GOD_BURIED_PLAQUE }],
          };
        }
        players.set(playerId, {
          ...p,
          beats: { ...p.beats, naraGodAsk: true, nara: true },
          heard: NARA_GOD_ASK,
          wink: visibleWink(false, WINK_NARA_GOD),
        });
        return { ...w, players };
      }
      if (p.beats.canalBury || w.straitBuried) {
        players.set(playerId, { ...p, heard: NARA_CANAL_LATER, wink: visibleWink(false, WINK_CANAL) });
        return { ...w, players };
      }
      if (w.straitRefused || p.beats.straitRefuse) {
        if (p.beats.canalAsk) {
          players.set(playerId, {
            ...p,
            beats: { ...p.beats, canalBury: true, nara: true },
            cultWink: true,
            heard: NARA_CANAL,
            wink: visibleWink(false, WINK_CANAL),
            readiness: p.readiness + 1,
          });
          return {
            ...w,
            players,
            naraAtStrait: true,
            straitBuried: true,
            pois: w.pois.map((poi) => (poi.id === ORGAN_STRAIT.id ? canalBuriedPoi() : poi)),
            signs: w.signs.map((s) => (s.id === ORGAN_STRAIT.id ? { ...CANAL_PLAQUE } : s)),
          };
        }
        players.set(playerId, {
          ...p,
          beats: { ...p.beats, canalAsk: true, nara: true },
          heard: NARA_CANAL_ASK,
          wink: visibleWink(false, WINK_CANAL),
        });
        return { ...w, players };
      }
      players.set(playerId, { ...p, heard: NARA_MARK_LATER, wink: visibleWink(false, WINK_SEXTON) });
      return { ...w, players };
    }
    if (p.beats.sextonAsk) {
      players.set(playerId, {
        ...p,
        beats: { ...p.beats, sexton: true, nara: true },
        cultMark: true,
        cultWink: true,
        heard: NARA_MARK,
        wink: visibleWink(false, WINK_SEXTON),
        readiness: p.readiness + 1,
      });
      return {
        ...w,
        players,
        naraAtStrait: true,
        pois: w.pois.map((poi) => (poi.id === WRECK_GARDEN.id ? sextonPoi() : poi)),
      };
    }
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, sextonAsk: true, nara: true },
      heard: NARA_AFTER_GARDEN,
    });
    return { ...w, players };
  }
  if (id === "nara" && (p.guest || p.locked) && (p.beats.garden || w.lastGodNamed)) {
    players.set(playerId, { ...p, heard: w.lastGodNamed ? NARA_GOD_SPECTATOR : SEXTON_SPECTATOR });
    return { ...w, players };
  }
  if (id === "ione") return applyLastWord(w, playerId);
  if (id === "vesper") {
    if (w.lastGodNamed) return applyVesperNoGod(w, playerId);
    if (!w.vesperAtFoundry) return w;
    if (p.guest || p.locked) {
      players.set(playerId, { ...p, heard: FOUNDRY_SPECTATOR, wink: visibleWink(true, WINK_FOUNDRY_DARK) });
      return { ...w, players };
    }
    players.set(playerId, {
      ...p,
      heard: VESPER_FOUNDRY_LATER,
      wink: visibleWink(false, WINK_FOUNDRY_DARK),
    });
    return { ...w, players };
  }
  if (id === "quill" && p.beats.market && !p.guest && !p.locked) {
    if (w.lastGodNamed || p.beats.lastGod) {
      if (p.beats.quillNoPrint || w.quillNoPrint) {
        players.set(playerId, { ...p, heard: QUILL_NOPRINT_LATER, wink: visibleWink(false, WINK_NOPRINT) });
        return { ...w, players };
      }
      players.set(playerId, {
        ...p,
        beats: { ...p.beats, quillNoPrint: true },
        heard: QUILL_NOPRINT,
        wink: visibleWink(false, WINK_NOPRINT),
        readiness: p.readiness + 1,
      });
      return {
        ...w,
        players,
        quillNoPrint: true,
        pois: w.pois.map((poi) => (poi.id === CLEARING_STALL.id ? noprintPoi() : poi)),
        signs: w.signs.map((s) => (s.id === CLEARING_STALL.id ? { ...NOPRINT_PLAQUE } : s)),
      };
    }
    if (p.beats.hang) {
      if (p.beats.unflag || w.wetCult) {
        players.set(playerId, { ...p, heard: UNFLAG_LATER, wink: visibleWink(false, WINK_UNFLAG) });
        return { ...w, players };
      }
      if (p.beats.unflagAsk) {
        players.set(playerId, { ...p, heard: QUILL_UNFLAG_WAIT, wink: visibleWink(false, WINK_UNFLAG) });
        return { ...w, players };
      }
      players.set(playerId, {
        ...p,
        beats: { ...p.beats, unflagAsk: true },
        heard: QUILL_UNFLAG_ASK,
        wink: visibleWink(false, WINK_UNFLAG),
      });
      return { ...w, players };
    }
    if (p.beats.spot && p.cultWink) {
      if (p.beats.hangAsk) {
        players.set(playerId, { ...p, heard: QUILL_HANG_WAIT, wink: visibleWink(false, WINK_HANG) });
        return { ...w, players };
      }
      players.set(playerId, {
        ...p,
        beats: { ...p.beats, hangAsk: true },
        heard: QUILL_HANG_ASK,
        wink: visibleWink(false, WINK_HANG),
      });
      return { ...w, players };
    }
    if (p.beats.sold) {
      players.set(playerId, { ...p, heard: QUILL_HANG_NEED, wink: visibleWink(false, WINK_FORGE) });
      return { ...w, players };
    }
    return applyForge(w, playerId, "hear");
  }
  if (id === "quill" && (p.guest || p.locked) && (p.beats.spot || w.lastGodNamed)) {
    players.set(playerId, { ...p, heard: w.lastGodNamed ? QUILL_NOPRINT_SPECTATOR : QUILL_HANG_SPECTATOR });
    return { ...w, players };
  }
  if (id === "ord" && w.lastGodNamed && !p.guest && !p.locked) return applyOrdLast(w, playerId);
  if (id === "ord" && (p.guest || p.locked) && w.lastGodNamed) {
    players.set(playerId, { ...p, heard: ORD_LAST_SPECTATOR });
    return { ...w, players };
  }
  if (id === "ord" && !p.guest && !p.locked && (p.beats.straitRefuse || w.straitRefused)) {
    if (p.beats.ordWitness) {
      players.set(playerId, { ...p, heard: ORD_WITNESS_LATER, wink: visibleWink(false, WINK_WITNESS) });
      return { ...w, players };
    }
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, ordWitness: true, ord: true },
      heard: ORD_WITNESS,
      wink: visibleWink(false, WINK_WITNESS),
      readiness: p.readiness + 1,
    });
    return { ...w, players, ordAtStrait: true };
  }
  if (id === "ord" && (p.guest || p.locked) && (p.beats.straitRefuse || w.straitRefused)) {
    players.set(playerId, { ...p, heard: ORD_WITNESS_SPECTATOR });
    return { ...w, players };
  }
  if (id === "ord" && w.m3Open && !p.guest && !p.locked) {
    if (p.beats.cableQuiet) {
      players.set(playerId, { ...p, heard: ORD_CABLE_LATER, wink: visibleWink(false, WINK_ERRAND) });
      return { ...w, players };
    }
    if (p.beats.errand) {
      players.set(playerId, { ...p, heard: ORD_ERRAND_WAIT, wink: visibleWink(false, WINK_ERRAND) });
      return { ...w, players };
    }
    if (p.beats.map) {
      players.set(playerId, {
        ...p,
        beats: { ...p.beats, errand: true },
        heard: ORD_ERRAND,
        wink: visibleWink(false, WINK_ERRAND),
        readiness: p.readiness + 1,
      });
      return { ...w, players };
    }
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, ord: true, map: true },
      heard: ORD_MAP,
      wink: visibleWink(false, WINK_ORGANS),
      readiness: p.readiness + (p.beats.map ? 0 : 1),
    });
    return { ...w, players };
  }
  if (id === "ord" && (p.guest || p.locked) && w.m3Open) {
    players.set(playerId, { ...p, heard: ERRAND_SPECTATOR });
    return { ...w, players };
  }
  const heard = lineFor(id, p.beats);
  const beats = { ...p.beats, [id]: true };
  const weather = {
    ...p.weather,
    nara: p.weather.nara || id === "nara",
    ord: p.weather.ord || id === "ord",
  };
  return withNamedWeather(w, playerId, { ...p, beats, weather, heard });
}

export function applyRead(w: WorldState, playerId: string, signId: string): WorldState {
  const p = w.players.get(playerId);
  const sign = w.signs.find((s) => s.id === signId);
  if (!p || p.hp <= 0 || !sign || !nearPoint(p.x, p.y, sign.x, sign.y, 56)) return w;
  if (sign.id === CARE_DOOR.id) return applyCare(w, playerId);
  if (sign.id === HOUSE_HALL.id) {
    if (!p.inCare || p.guest || p.locked) return w;
    if (p.beats.hall && fourfoldReady(w.standing) && !w.fourfoldHeld) return applyFourfold(w, playerId);
    if (p.beats.hall && w.fourfoldHeld) return applyFourfold(w, playerId);
    if (p.beats.hall && w.war.winner) return applyTithe(w, playerId);
    if (p.beats.hall) return applyStanding(w, playerId);
    const tax = gestellTax(w.gestell);
    const players = new Map(w.players);
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, hall: true },
      heard: hallCopy(tax),
      wink: visibleWink(false, WINK_HALL),
      readiness: p.readiness + (p.beats.hall ? 0 : 1),
      lastCareX: HOUSE_HALL.x,
      lastCareY: HOUSE_HALL.y,
    });
    return { ...w, players };
  }
  if (sign.id === "safety-plaque" && (p.beats.clockOut || !w.clerks.some((c) => c.id === "clerk-desk-three")) && w.annexHome) {
    return applyYieldEmpty(w, playerId);
  }
  if (sign.id === IONE.id) return applyIoneMark(w, playerId);
  if (sign.id === SAFETY_ANNEX.id) return applyFreeze(w, playerId);
  if (sign.id === CLEARING_STALL.id) {
    if (p.beats.hangAsk && p.cultWink && !p.beats.hang && !p.guest && !p.locked) return applyHang(w, playerId);
    if (p.messenger === "iridescent" && !p.guest && !p.locked && !w.glamourHeld && !p.beats.glamour) {
      return applyGlamour(w, playerId);
    }
    return applyMarket(w, playerId);
  }
  if (sign.id === FORGE_TRAY.id) return applyForge(w, playerId, "hear");
  if (sign.id === WET_GRID.id) {
    if (p.beats.unflagAsk && !p.beats.unflag && !p.guest && !p.locked) return applyUnflag(w, playerId);
    return applyFlag(w, playerId);
  }
  if (sign.id === CLAIMS_DESK.id) return applyDesk(w, playerId, "file");
  if (sign.id === SHRINE.id) {
    if (w.lastGodNamed && !w.restraintHeld) return applyRestraint(w, playerId);
    if (w.restraintHeld && !p.restraint) return applyRestraintStance(w, playerId);
    return applyShrine(w, playerId);
  }
  if (sign.id === "nara-gone") {
    const players = new Map(w.players);
    if (p.guest || p.locked) {
      players.set(playerId, { ...p, heard: NARA_LEAVE_SPECTATOR, wink: visibleWink(true, WINK_NARA_LEAVE) });
      return { ...w, players };
    }
    players.set(playerId, { ...p, heard: NARA_LEAVE_HELD, wink: visibleWink(false, WINK_NARA_LEAVE) });
    return { ...w, players };
  }
  if (sign.id === "vesper-gone") {
    const players = new Map(w.players);
    if (p.guest || p.locked) {
      players.set(playerId, { ...p, heard: VESPER_LEAVE_SPECTATOR, wink: visibleWink(true, WINK_VESPER_LEAVE) });
      return { ...w, players };
    }
    players.set(playerId, { ...p, heard: VESPER_LEAVE_HELD, wink: visibleWink(false, WINK_VESPER_LEAVE) });
    return { ...w, players };
  }
  if (sign.id === CLEARING_RING.id) return applyClearing(w, playerId, "keep");
  if (sign.id === OPERATOR_DESK.id) {
    if (w.lastGodNamed) return applyVesperNoGod(w, playerId);
    return applyOperator(w, playerId, "hear");
  }
  if (sign.id === ORGAN_STRAIT.id || sign.id === ORGAN_FOUNDRY.id || sign.id === ORGAN_CABLE.id) {
    return applyOrgan(w, playerId, sign);
  }
  const weather = { ...p.weather, safety: true };
  const heard = `${sign.title}: ${sign.text}`;
  return withNamedWeather(w, playerId, { ...p, weather, heard });
}

export function applyBury(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || p.locked) return w;
  const players = new Map(w.players);
  const plot = w.rites.find((r) => r.kind === "burial" && !r.done);
  if (plot && nearPoint(p.x, p.y, plot.x, plot.y)) {
    const rites = w.rites.map((r) => (r.id === plot.id ? { ...r, done: true } : r));
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, nara: true, burial: true },
      readiness: p.readiness + (p.house === "earth" ? 2 : 1),
      heard: lineFor("nara", { ...p.beats, nara: true, burial: true }),
    });
    return { ...w, players, rites };
  }
  const garden = w.rites.find((r) => r.kind === "garden" && !r.done);
  if (garden && nearPoint(p.x, p.y, garden.x, garden.y, 56)) {
    if (p.guest) return w;
    const rites = w.rites.map((r) => (r.id === garden.id ? { ...r, done: true } : r));
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, garden: true },
      readiness: p.readiness + 1,
      heard: GARDEN_BURY,
      wink: visibleWink(false, WINK_GARDEN),
    });
    return {
      ...w,
      players,
      rites,
      pois: w.pois.map((poi) => (poi.id === WRECK_GARDEN.id ? gardenPoi(true) : poi)),
    };
  }
  const wreck = w.wreckage.find((r) => nearPoint(p.x, p.y, r.x, r.y, 56));
  if (wreck) {
    const spent = spendBestand(p, FUNERAL_COST);
    if (!spent) {
      players.set(playerId, { ...p, heard: FUNERAL_NEED });
      return { ...w, players };
    }
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, funeral: true },
      bestand: spent.bestand,
      banked: spent.banked,
      readiness: p.readiness + (p.house === "earth" ? 2 : 1),
      heard: vaultHeard(FUNERAL_COPY, spent.fromVault),
      wink: visibleWink(p.guest, WINK_SINK),
    });
    return { ...w, players, wreckage: w.wreckage.filter((r) => r.id !== wreck.id) };
  }
  const mark = visibleHistory(p.guest, p.serial, w.history, p.storm).find((m) => nearPoint(p.x, p.y, m.x, m.y, 56));
  if (!mark) return w;
  players.set(playerId, {
    ...p,
    readiness: p.readiness + 1,
    winke: p.winke + 1,
    heard: mark.line,
    wink: visibleWink(false, WINK_HISTORY),
  });
  return { ...w, players, history: w.history.filter((m) => m.id !== mark.id) };
}

export function applyRestraint(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, SHRINE.x, SHRINE.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: RESTRAINT_SPECTATOR, wink: visibleWink(true, WINK_RESTRAINT) });
    return { ...w, players };
  }
  if (!w.lastGodNamed) {
    players.set(playerId, { ...p, heard: RESTRAINT_NEED });
    return { ...w, players };
  }
  if (w.restraintHeld && p.beats.restraint) {
    players.set(playerId, { ...p, heard: RESTRAINT_HELD, wink: visibleWink(false, WINK_RESTRAINT) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, restraint: true },
    heard: RESTRAINT_COPY,
    wink: visibleWink(false, WINK_RESTRAINT),
    readiness: p.readiness + 1,
    lastCareX: SHRINE.x,
    lastCareY: SHRINE.y,
  });
  return {
    ...w,
    players,
    restraintHeld: true,
    pois: w.pois.map((poi) => (poi.id === SHRINE.id ? restraintPoi() : poi)),
    signs: w.signs.map((s) => (s.id === SHRINE.id ? { ...RESTRAINT_PLAQUE } : s)),
  };
}

export function applyRestraintStance(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, SHRINE.x, SHRINE.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: STANCE_SPECTATOR, wink: visibleWink(true, WINK_STANCE) });
    return { ...w, players };
  }
  if (!w.restraintHeld) {
    players.set(playerId, { ...p, heard: STANCE_NEED });
    return { ...w, players };
  }
  if (p.storm) {
    players.set(playerId, { ...p, heard: STANCE_STORM, wink: visibleWink(false, WINK_STORM) });
    return { ...w, players };
  }
  if (p.restraint) {
    players.set(playerId, { ...p, heard: STANCE_HELD, wink: visibleWink(false, WINK_STANCE) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    restraint: true,
    heard: STANCE_COPY,
    wink: visibleWink(false, WINK_STANCE),
    lastCareX: SHRINE.x,
    lastCareY: SHRINE.y,
  });
  return {
    ...w,
    players,
    pois: w.pois.map((poi) => (poi.id === SHRINE.id ? stancePoi() : poi)),
    signs: w.signs.map((s) => (s.id === SHRINE.id ? { ...STANCE_PLAQUE } : s)),
  };
}

export function applyShrine(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, SHRINE.x, SHRINE.y, 56)) return w;
  const players = new Map(w.players);
  const atShrine = { lastCareX: SHRINE.x, lastCareY: SHRINE.y };
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, ...atShrine, heard: SHRINE_SPECTATOR, wink: visibleWink(true, WINK_SINK) });
    return { ...w, players };
  }
  if (p.stipend > 0) {
    players.set(playerId, {
      ...p,
      ...atShrine,
      stipend: p.stipend - 1,
      readiness: p.readiness + 1,
      heard: STIPEND_SINK,
      wink: visibleWink(false, WINK_STIPEND),
    });
    return { ...w, players, gestell: Math.max(0, w.gestell - 2) };
  }
  const spent = spendBestand(p, SHRINE_COST);
  if (!spent) {
    players.set(playerId, { ...p, ...atShrine, heard: SHRINE_NEED });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    ...atShrine,
    bestand: spent.bestand,
    banked: spent.banked,
    readiness: p.readiness + 1,
    heard: vaultHeard(SHRINE_COPY, spent.fromVault),
    wink: visibleWink(false, WINK_SINK),
  });
  return { ...w, players, gestell: Math.max(0, w.gestell - 2) };
}

export function applyRestore(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, SHRINE.x, SHRINE.y, 56)) return w;
  const players = new Map(w.players);
  const atShrine = { lastCareX: SHRINE.x, lastCareY: SHRINE.y };
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, ...atShrine, heard: RESTORE_SPECTATOR, wink: visibleWink(true, p.wink, 0) });
    return { ...w, players };
  }
  if (p.aura >= AURA_DIM + RESTORE_GAIN) {
    players.set(playerId, { ...p, ...atShrine, heard: RESTORE_FULL });
    return { ...w, players };
  }
  const spent = spendBestand(p, RESTORE_COST);
  if (!spent) {
    players.set(playerId, { ...p, ...atShrine, heard: RESTORE_NEED, wink: visibleWink(false, p.wink, p.aura) });
    return { ...w, players };
  }
  const aura = p.aura + RESTORE_GAIN;
  players.set(playerId, {
    ...p,
    ...atShrine,
    bestand: spent.bestand,
    banked: spent.banked,
    aura,
    heard: vaultHeard(RESTORE_COPY, spent.fromVault),
    wink: visibleWink(false, p.wink || WINK_SINK, aura),
  });
  return { ...w, players };
}

export function applyInsure(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, SHRINE.x, SHRINE.y, 56)) return w;
  const players = new Map(w.players);
  const atShrine = { lastCareX: SHRINE.x, lastCareY: SHRINE.y };
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, ...atShrine, heard: INSURANCE_SPECTATOR, wink: visibleWink(true, WINK_SINK) });
    return { ...w, players };
  }
  if (p.insured) {
    players.set(playerId, { ...p, ...atShrine, heard: INSURANCE_HELD });
    return { ...w, players };
  }
  const spent = spendBestand(p, INSURANCE_COST);
  if (!spent) {
    players.set(playerId, { ...p, ...atShrine, heard: INSURANCE_NEED });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    ...atShrine,
    bestand: spent.bestand,
    banked: spent.banked,
    insured: true,
    heard: vaultHeard(INSURANCE_COPY, spent.fromVault),
    wink: visibleWink(false, WINK_SINK),
  });
  return { ...w, players };
}

export function applyRepair(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, CLEARING_STALL.x, CLEARING_STALL.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: REPAIR_SPECTATOR, wink: visibleWink(true, WINK_SINK) });
    return { ...w, players };
  }
  if (p.damaged <= 0) {
    players.set(playerId, { ...p, heard: REPAIR_NONE });
    return { ...w, players };
  }
  const spent = spendBestand(p, REPAIR_COST);
  if (!spent) {
    players.set(playerId, { ...p, heard: REPAIR_NEED });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    bestand: spent.bestand,
    banked: spent.banked,
    damaged: p.damaged - 1,
    fakeWinke: p.fakeWinke + 1,
    exhibitT: 0,
    heard: vaultHeard(REPAIR_COPY, spent.fromVault),
    wink: visibleWink(false, WINK_SINK),
  });
  return { ...w, players };
}

export function applyGoingUnder(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || p.locked) return w;
  if (!movementReady(p.beats) || !nearPoint(p.x, p.y, GOING_UNDER.x, GOING_UNDER.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest) {
    players.set(playerId, { ...p, locked: true, heard: GUEST_LOCK });
    return { ...w, players };
  }
  const rites = w.rites.map((r) => (r.kind === "going-under" ? { ...r, done: true } : r));
  players.set(playerId, {
    ...p,
    winke: p.winke + 1,
    readiness: p.readiness + 1,
    beats: { ...p.beats, under: true },
    heard: ANGEL_UNDER,
  });
  const care = openCareWorld(w);
  const planted = plantGarden({ ...w, rites, pois: care.pois });
  const failed = w.failed.some((f) => f.id === FAILED_PASSING.id) ? w.failed : [...w.failed, { ...FAILED_PASSING }];
  return { ...w, players, rites: planted.rites, pois: planted.pois, signs: care.signs, careOpen: true, failed };
}

function openCareWorld(w: WorldState): Pick<WorldState, "pois" | "signs" | "careOpen"> {
  if (w.careOpen) return { pois: w.pois, signs: w.signs, careOpen: true };
  const pois = w.pois.map((poi) => (poi.id === CARE_DOOR.id ? openCarePoi() : poi));
  if (!pois.some((poi) => poi.id === HOUSE_HALL.id)) pois.push(houseHallPoi());
  const signs = w.signs.some((s) => s.id === HOUSE_HALL.id) ? w.signs : [...w.signs, hallPlaque()];
  return { pois, signs, careOpen: true };
}

function plantGarden(w: Pick<WorldState, "rites" | "pois">): Pick<WorldState, "rites" | "pois"> {
  if (w.rites.some((r) => r.kind === "garden")) return { rites: w.rites, pois: w.pois };
  const pois = w.pois.some((p) => p.id === WRECK_GARDEN.id) ? w.pois : [...w.pois, gardenPoi(false)];
  return { rites: [...w.rites, { ...GARDEN_RITE }], pois };
}

function openOrgans(w: WorldState): Pick<WorldState, "signs" | "pois"> {
  let signs = w.signs;
  for (const s of ORGAN_PLAQUES) {
    if (!signs.some((x) => x.id === s.id)) signs = [...signs, { ...s }];
  }
  let pois = w.pois;
  const organs: [string, number, number, string][] = [
    [ORGAN_STRAIT.id, ORGAN_STRAIT.x, ORGAN_STRAIT.y, "The Strait"],
    [ORGAN_FOUNDRY.id, ORGAN_FOUNDRY.x, ORGAN_FOUNDRY.y, "The Foundry"],
    [ORGAN_CABLE.id, ORGAN_CABLE.x, ORGAN_CABLE.y, "The Cable"],
  ];
  for (const [id, x, y, name] of organs) {
    if (!pois.some((p) => p.id === id)) {
      pois = [...pois, organPoi(id as "organ-strait" | "organ-foundry" | "organ-cable", x, y, name)];
    }
  }
  return { signs, pois };
}

export function applyCare(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0) return w;
  if (!nearPoint(p.x, p.y, CARE_DOOR.x, CARE_DOOR.y, 56)) return w;
  if (w.fourfoldHeld && w.careOpen) return applyLastGod(w, playerId);
  const players = new Map(w.players);
  if (p.guest || p.locked || !w.careOpen || !p.beats.under) {
    players.set(playerId, { ...p, heard: p.guest || p.locked ? CARE_SPECTATOR : p.heard, wink: visibleWink(true, WINK_CARE) });
    return { ...w, players };
  }
  const first = !p.beats.care;
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, care: true },
    inCare: true,
    wink: visibleWink(false, WINK_CARE),
    heard: WINK_CARE,
    readiness: p.readiness + (first ? 1 : 0),
    x: first ? HOUSE_HALL.x - 48 : p.x,
    y: first ? HOUSE_HALL.y : p.y,
    lastCareX: HOUSE_HALL.x,
    lastCareY: HOUSE_HALL.y,
  });
  return { ...w, players };
}

export function applyLastGod(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, CARE_DOOR.x, CARE_DOOR.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: LAST_GOD_SPECTATOR, wink: visibleWink(true, WINK_LAST_GOD) });
    return { ...w, players };
  }
  if (!w.fourfoldHeld || !w.careOpen) {
    players.set(playerId, { ...p, heard: LAST_GOD_NEED });
    return { ...w, players };
  }
  if (w.lastGodBuried) {
    players.set(playerId, {
      ...p,
      heard: NARA_GOD_LATER,
      wink: visibleWink(false, WINK_NARA_GOD),
      inCare: true,
    });
    return { ...w, players };
  }
  if (w.lastGodNamed && p.beats.lastGod) {
    players.set(playerId, {
      ...p,
      heard: LAST_GOD_HELD,
      wink: visibleWink(false, WINK_LAST_GOD),
      inCare: true,
    });
    return { ...w, players };
  }
  const firstCare = !p.beats.care;
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, lastGod: true, care: true },
    heard: LAST_GOD_COPY,
    wink: visibleWink(false, WINK_LAST_GOD),
    inCare: true,
    readiness: p.readiness + (p.beats.lastGod ? 0 : 1),
    x: firstCare ? HOUSE_HALL.x - 48 : p.x,
    y: firstCare ? HOUSE_HALL.y : p.y,
    lastCareX: HOUSE_HALL.x,
    lastCareY: HOUSE_HALL.y,
  });
  const pois = w.pois.map((poi) => (poi.id === CARE_DOOR.id ? lastGodPoi() : poi));
  const signs = w.signs.some((s) => s.id === CARE_DOOR.id)
    ? w.signs.map((s) => (s.id === CARE_DOOR.id ? { ...LAST_GOD_PLAQUE } : s))
    : [...w.signs, { ...LAST_GOD_PLAQUE }];
  return { ...w, players, lastGodNamed: true, pois, signs };
}

export function applyOrdLast(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: ORD_LAST_SPECTATOR, wink: visibleWink(true, WINK_ORD_LAST) });
    return { ...w, players };
  }
  if (!w.lastGodNamed) {
    players.set(playerId, { ...p, heard: ORD_LAST_NEED });
    return { ...w, players };
  }
  if (w.ordAtCare && p.beats.ordLast) {
    players.set(playerId, { ...p, heard: ORD_LAST_LATER, wink: visibleWink(false, WINK_ORD_LAST) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, ordLast: true, ord: true },
    heard: ORD_LAST,
    wink: visibleWink(false, WINK_ORD_LAST),
    readiness: p.readiness + 1,
  });
  const pois = w.pois.map((poi) => (poi.id === CARE_DOOR.id ? lastGodOrdPoi() : poi));
  const signs = w.signs.some((s) => s.id === CARE_DOOR.id)
    ? w.signs.map((s) => (s.id === CARE_DOOR.id ? { ...LAST_GOD_ORD_PLAQUE } : s))
    : [...w.signs, { ...LAST_GOD_ORD_PLAQUE }];
  return { ...w, players, ordAtCare: true, pois, signs };
}

export function applyHang(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, CLEARING_STALL.x, CLEARING_STALL.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: QUILL_HANG_SPECTATOR, wink: visibleWink(true, WINK_HANG) });
    return { ...w, players };
  }
  if (w.stallDark || p.beats.hang) {
    players.set(playerId, { ...p, heard: STALL_DARK_COPY, wink: visibleWink(false, WINK_HANG) });
    return { ...w, players };
  }
  if (!p.cultWink) {
    players.set(playerId, { ...p, heard: QUILL_HANG_NEED });
    return { ...w, players };
  }
  if (!p.beats.hangAsk) {
    players.set(playerId, { ...p, heard: QUILL_HANG_WAIT });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, hang: true },
    cultWink: true,
    heard: QUILL_HANG,
    wink: visibleWink(false, WINK_HANG),
    readiness: p.readiness + 1,
  });
  return {
    ...w,
    players,
    stallDark: true,
    quillAtGrid: true,
    pois: w.pois.map((poi) => (poi.id === CLEARING_STALL.id ? stallDarkPoi() : poi)),
    signs: w.signs.map((s) => (s.id === CLEARING_STALL.id ? { ...STALL_DARK_PLAQUE } : s)),
  };
}

export function applyMarket(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, CLEARING_STALL.x, CLEARING_STALL.y, 56)) return w;
  const players = new Map(w.players);
  if (w.stallDark) {
    players.set(playerId, { ...p, heard: STALL_DARK_COPY, wink: visibleWink(p.guest, WINK_HANG) });
    return { ...w, players };
  }
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: MARKET_SPECTATOR, wink: visibleWink(true, WINK_MARKET) });
    return { ...w, players };
  }
  if (!p.beats.hall) {
    players.set(playerId, { ...p, heard: MARKET_NEED_HALL });
    return { ...w, players };
  }
  if (!p.beats.market) {
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, market: true },
      heard: MARKET_LISTING,
      wink: visibleWink(false, WINK_MARKET),
      readiness: p.readiness + 1,
    });
    return { ...w, players };
  }
  const spent = spendBestand(p, CLEARING_PRICE);
  if (!spent) {
    players.set(playerId, { ...p, heard: MARKET_LISTING });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    bestand: spent.bestand,
    banked: spent.banked,
    aura: Math.max(0, p.aura - 2),
    heard: vaultHeard(MARKET_BUY, spent.fromVault),
    wink: visibleWink(false, WINK_MARKET),
  });
  return { ...w, players, clearingOpen: false };
}

export function applyFreeze(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, SAFETY_ANNEX.x, SAFETY_ANNEX.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: FREEZE_SPECTATOR, wink: visibleWink(true, WINK_FREEZE) });
    return { ...w, players };
  }
  if (!p.beats.hall) {
    players.set(playerId, { ...p, heard: FREEZE_NEED_HALL });
    return { ...w, players };
  }
  if (w.frozen) {
    players.set(playerId, { ...p, heard: FREEZE_COPY, wink: visibleWink(false, WINK_FREEZE) });
    return { ...w, players };
  }
  const spent = spendBestand(p, FREEZE_COST);
  if (!spent) {
    players.set(playerId, { ...p, heard: FREEZE_NEED });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    bestand: spent.bestand,
    banked: spent.banked,
    beats: { ...p.beats, freeze: true },
    heard: vaultHeard(FREEZE_COPY, spent.fromVault),
    wink: visibleWink(false, WINK_FREEZE),
    readiness: p.readiness + (p.beats.freeze ? 0 : 1),
  });
  return {
    ...w,
    players,
    frozen: true,
    passing: starvedPassing(),
    pois: w.pois.map((poi) => (poi.id === SAFETY_ANNEX.id ? annexPoi(true) : poi)),
  };
}

export function applyVesperNoGod(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0) return w;
  const atDesk = nearPoint(p.x, p.y, OPERATOR_DESK.x, OPERATOR_DESK.y, 56);
  const atVesper = nearPoint(p.x, p.y, VESPER.x, VESPER.y);
  if (!atDesk && !atVesper) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: VESPER_NOGOD_SPECTATOR, wink: visibleWink(true, WINK_NOGOD) });
    return { ...w, players };
  }
  if (!w.lastGodNamed) {
    players.set(playerId, { ...p, heard: VESPER_NOGOD_NEED });
    return { ...w, players };
  }
  if (w.vesperNoGod && p.beats.vesperNoGod) {
    players.set(playerId, { ...p, heard: VESPER_NOGOD_LATER, wink: visibleWink(false, WINK_NOGOD) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, vesperNoGod: true },
    heard: VESPER_NOGOD,
    wink: visibleWink(false, WINK_NOGOD),
    readiness: p.readiness + 1,
  });
  return {
    ...w,
    players,
    vesperNoGod: true,
    pois: w.pois.map((poi) => (poi.id === OPERATOR_DESK.id ? noGodPoi() : poi)),
    signs: w.signs.map((s) => (s.id === OPERATOR_DESK.id ? { ...NOGOD_PLAQUE } : s)),
  };
}

export function applyOperator(
  w: WorldState,
  playerId: string,
  choice: "hear" | "take" | "refuse",
): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, OPERATOR_DESK.x, OPERATOR_DESK.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: OPERATOR_SPECTATOR, wink: visibleWink(true, WINK_OPERATOR) });
    return { ...w, players };
  }
  if (w.vesperGone) {
    players.set(playerId, { ...p, heard: VESPER_LEAVE_HELD, wink: visibleWink(false, WINK_VESPER_LEAVE) });
    return { ...w, players };
  }
  if (!p.beats.hall) {
    players.set(playerId, { ...p, heard: OPERATOR_NEED_HALL });
    return { ...w, players };
  }
  if (w.vesperAtFoundry || w.foundryDark || p.beats.foundryDark) {
    players.set(playerId, { ...p, heard: OPERATOR_VACANT, wink: visibleWink(false, WINK_FOUNDRY_DARK) });
    return { ...w, players };
  }
  if (!p.beats.cold && !p.beats.refuse && (choice === "hear" || !p.beats.yield)) {
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, yield: true },
      heard: OPERATOR_OFFER,
      wink: visibleWink(false, WINK_OPERATOR),
      readiness: p.readiness + (p.beats.yield ? 0 : 1),
    });
    return { ...w, players };
  }
  if (p.beats.cold || p.beats.refuse) {
    if (p.beats.refuse) {
      players.set(playerId, { ...p, heard: OPERATOR_REFUSE });
      return { ...w, players };
    }
    if (p.beats.foundryAsk) {
      players.set(playerId, { ...p, heard: VESPER_UNLIGHT_WAIT, wink: visibleWink(false, WINK_FOUNDRY_DARK) });
      return { ...w, players };
    }
    if (p.beats.foundry) {
      players.set(playerId, {
        ...p,
        beats: { ...p.beats, foundryAsk: true },
        heard: VESPER_UNLIGHT_ASK,
        wink: visibleWink(false, WINK_FOUNDRY_DARK),
        readiness: p.readiness + 1,
      });
      return { ...w, players };
    }
    players.set(playerId, { ...p, heard: VESPER_NEED_FOUNDRY, wink: visibleWink(false, WINK_OPERATOR) });
    return { ...w, players };
  }
  if (choice === "take") {
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, cold: true },
      current: "cold",
      bestand: p.bestand + PRIVATE_YIELD,
      heard: OPERATOR_TAKE,
      wink: visibleWink(false, WINK_OPERATOR),
    });
    let pois = w.pois.map((poi) => (poi.id === "m3-door" ? m3Poi(true) : poi));
    if (!pois.some((poi) => poi.id === "m3-door")) pois.push(m3Poi(true));
    const organs = openOrgans({ ...w, pois });
    return {
      ...w,
      players,
      m3Open: true,
      pois: organs.pois,
      signs: organs.signs,
      gestell: Math.min(100, w.gestell + 8),
    };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, refuse: true },
    current: "readiness",
    readiness: p.readiness + 2,
    heard: OPERATOR_REFUSE,
    wink: visibleWink(false, WINK_OPERATOR),
  });
  return { ...w, players };
}

export function applyOrgan(w: WorldState, playerId: string, sign: Sign): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, sign.x, sign.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: M3_SPECTATOR, wink: "" });
    return { ...w, players };
  }
  if (!w.m3Open) {
    players.set(playerId, { ...p, heard: ORGAN_NEED_M3 });
    return { ...w, players };
  }
  if (sign.id === ORGAN_STRAIT.id) {
    if (w.straitBuried || p.beats.canalBury) {
      if (!p.guest && !p.locked && p.house === "divinities") return applyDivStanding(w, playerId);
      players.set(playerId, { ...p, heard: NARA_CANAL_LATER, wink: visibleWink(p.guest, WINK_CANAL) });
      return { ...w, players };
    }
    if (w.straitRefused || p.beats.straitRefuse) {
      players.set(playerId, { ...p, heard: STRAIT_REFUSED_LATER, wink: visibleWink(p.guest, WINK_STRAIT_REFUSE) });
      return { ...w, players };
    }
    if (w.foundryDark && !p.guest && !p.locked) return applyStraitRefuse(w, playerId);
  }
  if (sign.id === ORGAN_FOUNDRY.id) {
    if (w.foundryDark || p.beats.foundryDark) {
      if (!p.guest && !p.locked && p.house === "earth") return applyEarthStanding(w, playerId);
      players.set(playerId, { ...p, heard: FOUNDRY_DARK_LATER, wink: visibleWink(p.guest, WINK_FOUNDRY_DARK) });
      return { ...w, players };
    }
    if (p.beats.foundryAsk && !p.guest && !p.locked) return applyUnlight(w, playerId);
  }
  if (sign.id === ORGAN_CABLE.id) {
    if (w.cableDark || p.beats.cableDark) {
      if (!p.guest && !p.locked && p.house === "sky") return applySkyStanding(w, playerId);
      players.set(playerId, { ...p, heard: CABLE_DARK_LATER, wink: visibleWink(p.guest, WINK_CABLE_DARK) });
      return { ...w, players };
    }
    if ((w.straitRefused || w.straitBuried || p.beats.straitRefuse) && !p.guest && !p.locked) {
      return applyCableDark(w, playerId);
    }
  }
  const key = sign.id === ORGAN_STRAIT.id ? "strait" : sign.id === ORGAN_FOUNDRY.id ? "foundry" : "cable";
  const beats = { ...p.beats, [key]: true };
  const done = organsComplete(beats);
  players.set(playerId, {
    ...p,
    beats,
    heard: `${sign.title}: ${sign.text}`,
    wink: visibleWink(false, done ? WINK_ORGANS : p.wink),
    readiness: p.readiness + (p.beats[key] ? 0 : 1),
  });
  return { ...w, players };
}

export function applyDivStanding(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, ORGAN_STRAIT.x, ORGAN_STRAIT.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: DIV_SPECTATOR, wink: visibleWink(true, WINK_DIV) });
    return { ...w, players };
  }
  if (!w.straitBuried && !p.beats.canalBury) {
    players.set(playerId, { ...p, heard: DIV_NEED });
    return { ...w, players };
  }
  if (p.house !== "divinities") {
    players.set(playerId, { ...p, heard: DIV_WRONG, wink: visibleWink(false, WINK_DIV) });
    return { ...w, players };
  }
  if (w.divStanding || p.beats.divStanding) {
    players.set(playerId, { ...p, heard: DIV_HELD, wink: visibleWink(false, WINK_DIV) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, divStanding: true },
    heard: DIV_STANDING,
    wink: visibleWink(false, WINK_DIV),
    readiness: p.readiness + 1,
  });
  return {
    ...w,
    players,
    divStanding: true,
    standing: { ...w.standing, divinities: w.standing.divinities + 1 },
    pois: w.pois.map((poi) => (poi.id === ORGAN_STRAIT.id ? divStandingPoi() : poi)),
    signs: w.signs.map((s) => (s.id === ORGAN_STRAIT.id ? { ...DIV_PLAQUE } : s)),
  };
}

export function applyEarthStanding(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, ORGAN_FOUNDRY.x, ORGAN_FOUNDRY.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: EARTH_SPECTATOR, wink: visibleWink(true, WINK_EARTH) });
    return { ...w, players };
  }
  if (!w.foundryDark && !p.beats.foundryDark) {
    players.set(playerId, { ...p, heard: EARTH_NEED });
    return { ...w, players };
  }
  if (p.house !== "earth") {
    players.set(playerId, { ...p, heard: EARTH_WRONG, wink: visibleWink(false, WINK_EARTH) });
    return { ...w, players };
  }
  if (w.earthStanding || p.beats.earthStanding) {
    players.set(playerId, { ...p, heard: EARTH_HELD, wink: visibleWink(false, WINK_EARTH) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, earthStanding: true },
    heard: EARTH_STANDING,
    wink: visibleWink(false, WINK_EARTH),
    readiness: p.readiness + 1,
  });
  return {
    ...w,
    players,
    earthStanding: true,
    standing: { ...w.standing, earth: w.standing.earth + 1 },
    pois: w.pois.map((poi) => (poi.id === ORGAN_FOUNDRY.id ? earthStandingPoi() : poi)),
    signs: w.signs.map((s) => (s.id === ORGAN_FOUNDRY.id ? { ...EARTH_PLAQUE } : s)),
  };
}

export function applySkyStanding(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, ORGAN_CABLE.x, ORGAN_CABLE.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: SKY_SPECTATOR, wink: visibleWink(true, WINK_SKY) });
    return { ...w, players };
  }
  if (!w.cableDark && !p.beats.cableDark) {
    players.set(playerId, { ...p, heard: SKY_NEED });
    return { ...w, players };
  }
  if (p.house !== "sky") {
    players.set(playerId, { ...p, heard: SKY_WRONG, wink: visibleWink(false, WINK_SKY) });
    return { ...w, players };
  }
  if (w.skyStanding || p.beats.skyStanding) {
    players.set(playerId, { ...p, heard: SKY_HELD, wink: visibleWink(false, WINK_SKY) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, skyStanding: true },
    heard: SKY_STANDING,
    wink: visibleWink(false, WINK_SKY),
    readiness: p.readiness + 1,
  });
  return {
    ...w,
    players,
    skyStanding: true,
    standing: { ...w.standing, sky: w.standing.sky + 1 },
    pois: w.pois.map((poi) => (poi.id === ORGAN_CABLE.id ? skyStandingPoi() : poi)),
    signs: w.signs.map((s) => (s.id === ORGAN_CABLE.id ? { ...SKY_PLAQUE } : s)),
  };
}

export function applyCableDark(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, ORGAN_CABLE.x, ORGAN_CABLE.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: CABLE_DARK_SPECTATOR, wink: visibleWink(true, WINK_CABLE_DARK) });
    return { ...w, players };
  }
  if (w.cableDark || p.beats.cableDark) {
    players.set(playerId, { ...p, heard: CABLE_DARK_LATER, wink: visibleWink(false, WINK_CABLE_DARK) });
    return { ...w, players };
  }
  if (!w.straitRefused && !w.straitBuried && !p.beats.straitRefuse) {
    players.set(playerId, { ...p, heard: CABLE_NEED_STRAIT });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, cableDark: true, cable: true },
    heard: CABLE_DARK,
    wink: visibleWink(false, WINK_CABLE_DARK),
    readiness: p.readiness + 1,
  });
  return {
    ...w,
    players,
    cableDark: true,
    gestell: Math.max(0, w.gestell - 2),
    pois: w.pois.map((poi) => (poi.id === ORGAN_CABLE.id ? cableDarkPoi() : poi)),
    signs: w.signs.map((s) => (s.id === ORGAN_CABLE.id ? { ...CABLE_DARK_PLAQUE } : s)),
  };
}

export function applyUnlight(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, ORGAN_FOUNDRY.x, ORGAN_FOUNDRY.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: FOUNDRY_SPECTATOR, wink: visibleWink(true, WINK_FOUNDRY_DARK) });
    return { ...w, players };
  }
  if (w.foundryDark || p.beats.foundryDark) {
    players.set(playerId, { ...p, heard: FOUNDRY_DARK_LATER, wink: visibleWink(false, WINK_FOUNDRY_DARK) });
    return { ...w, players };
  }
  if (!p.beats.cold) {
    players.set(playerId, { ...p, heard: FOUNDRY_NEED_COLD });
    return { ...w, players };
  }
  if (!p.beats.foundryAsk) {
    players.set(playerId, { ...p, heard: VESPER_NEED_FOUNDRY, wink: visibleWink(false, WINK_FOUNDRY_DARK) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, foundryDark: true, foundry: true },
    heard: FOUNDRY_DARK_COPY,
    wink: visibleWink(false, WINK_FOUNDRY_DARK),
    readiness: p.readiness + 1,
  });
  return {
    ...w,
    players,
    foundryDark: true,
    vesperAtFoundry: true,
    pois: w.pois
      .map((poi) => (poi.id === ORGAN_FOUNDRY.id ? foundryDarkPoi() : poi.id === OPERATOR_DESK.id ? operatorVacantPoi() : poi))
      .concat(w.pois.some((poi) => poi.id === OPERATOR_DESK.id) ? [] : [operatorVacantPoi()]),
    signs: w.signs
      .map((s) =>
        s.id === ORGAN_FOUNDRY.id
          ? { ...FOUNDRY_DARK_PLAQUE }
          : s.id === OPERATOR_DESK.id
            ? { ...OPERATOR_VACANT_PLAQUE }
            : s,
      )
      .concat(w.signs.some((s) => s.id === OPERATOR_DESK.id) ? [] : [{ ...OPERATOR_VACANT_PLAQUE }]),
  };
}

export function applyStraitRefuse(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, ORGAN_STRAIT.x, ORGAN_STRAIT.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: STRAIT_SPECTATOR, wink: visibleWink(true, WINK_STRAIT_REFUSE) });
    return { ...w, players };
  }
  if (w.straitRefused || p.beats.straitRefuse) {
    players.set(playerId, { ...p, heard: STRAIT_REFUSED_LATER, wink: visibleWink(false, WINK_STRAIT_REFUSE) });
    return { ...w, players };
  }
  if (!w.foundryDark) {
    players.set(playerId, { ...p, heard: STRAIT_NEED_DARK });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, straitRefuse: true, strait: true },
    heard: STRAIT_REFUSE,
    wink: visibleWink(false, WINK_STRAIT_REFUSE),
    readiness: p.readiness + 1,
  });
  return {
    ...w,
    players,
    straitRefused: true,
    gestell: Math.max(0, w.gestell - 2),
    pois: w.pois.map((poi) => (poi.id === ORGAN_STRAIT.id ? straitRefusedPoi() : poi)),
    signs: w.signs.map((s) => (s.id === ORGAN_STRAIT.id ? { ...STRAIT_REFUSED_PLAQUE } : s)),
  };
}

export function applyWatch(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0) return w;
  const mark = visibleFailed(p.guest, p.serial, w.failed, p.house, p.storm).find((m) => nearPoint(p.x, p.y, m.x, m.y, 56));
  if (!mark) {
    if (w.failed.some((m) => nearPoint(p.x, p.y, m.x, m.y, 56))) {
      const players = new Map(w.players);
      players.set(playerId, { ...p, heard: FAILED_SPECTATOR, wink: "" });
      return { ...w, players };
    }
    return w;
  }
  const players = new Map(w.players);
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, failed: true },
    heard: WATCH_FAILED,
    wink: visibleWink(false, WINK_FAILED),
    readiness: p.readiness + (p.beats.failed ? 0 : 1),
  });
  return { ...w, players };
}

export function applyM3(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, M3_DOOR.x, M3_DOOR.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: M3_SPECTATOR, wink: "" });
    return { ...w, players };
  }
  if (!w.m3Open) {
    players.set(playerId, { ...p, heard: ORGAN_NEED_M3 });
    return { ...w, players };
  }
  const first = !p.beats.m3;
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, m3: true },
    inM3: true,
    wink: visibleWink(false, WINK_ORGANS),
    heard: M3_ENTER,
    readiness: p.readiness + (first ? 1 : 0),
    x: first ? ORGAN_STRAIT.x : p.x,
    y: first ? ORGAN_STRAIT.y : p.y,
  });
  return { ...w, players };
}

export function applyDesk(w: WorldState, playerId: string, choice: "file" | "take" | "bank"): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, CLAIMS_DESK.x, CLAIMS_DESK.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: choice === "bank" ? BANK_SPECTATOR : DESK_SPECTATOR });
    return { ...w, players };
  }
  if (choice === "bank") {
    if (p.bestand <= 0) {
      players.set(playerId, { ...p, heard: BANK_EMPTY, wink: visibleWink(false, WINK_BANK) });
      return { ...w, players };
    }
    players.set(playerId, {
      ...p,
      banked: p.banked + p.bestand,
      bestand: 0,
      heard: BANK_COPY,
      wink: visibleWink(false, WINK_BANK),
    });
    return {
      ...w,
      players,
      deskVaulted: true,
      pois: w.pois.map((poi) => (poi.id === CLAIMS_DESK.id ? bankPoi() : poi)),
      signs: w.signs.map((s) => (s.id === CLAIMS_DESK.id ? { ...BANK_PLAQUE } : s)),
    };
  }
  if (choice === "file") {
    if (p.bestand <= 0) {
      players.set(playerId, { ...p, heard: DESK_EMPTY });
      return { ...w, players };
    }
    const claim: Claim = {
      id: `c-${playerId}-${w.now}`,
      amount: p.bestand,
      created: w.now,
      readyAt: w.now + CLAIM_HOLD,
    };
    players.set(playerId, {
      ...p,
      bestand: 0,
      claims: [...p.claims, claim],
      heard: DESK_FILE,
    });
    return { ...w, players };
  }
  const due = p.claims.find((c) => w.now >= c.readyAt);
  if (!due) {
    players.set(playerId, { ...p, heard: p.claims.length ? DESK_WAIT : DESK_EMPTY });
    return { ...w, players };
  }
  if (!CLAIMS_ARMED) {
    players.set(playerId, { ...p, heard: DESK_DISARMED });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    bestand: p.bestand + due.amount,
    claims: p.claims.filter((c) => c.id !== due.id),
    heard: DESK_DISARMED,
  });
  return { ...w, players };
}

export function applyFlag(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !inWetGrid(p.x, p.y)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: FLAG_SPECTATOR, flagged: false });
    return { ...w, players };
  }
  if (w.wetCult || p.beats.unflag) {
    players.set(playerId, { ...p, flagged: false, heard: FLAG_CULT, wink: visibleWink(false, WINK_UNFLAG) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    flagged: true,
    heard: FLAG_COPY,
  });
  return { ...w, players };
}

export function applyUnflag(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !inWetGrid(p.x, p.y)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: UNFLAG_SPECTATOR, wink: visibleWink(true, WINK_UNFLAG) });
    return { ...w, players };
  }
  if (w.wetCult || p.beats.unflag) {
    players.set(playerId, { ...p, flagged: false, heard: UNFLAG_LATER, wink: visibleWink(false, WINK_UNFLAG) });
    return { ...w, players };
  }
  if (!p.beats.hang || !p.cultWink) {
    players.set(playerId, { ...p, heard: UNFLAG_NEED });
    return { ...w, players };
  }
  if (!p.beats.unflagAsk) {
    players.set(playerId, { ...p, heard: QUILL_UNFLAG_WAIT, wink: visibleWink(false, WINK_UNFLAG) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, unflag: true },
    flagged: false,
    heard: UNFLAG_COPY,
    wink: visibleWink(false, WINK_UNFLAG),
    readiness: p.readiness + 1,
  });
  return {
    ...w,
    players,
    wetCult: true,
    pois: w.pois.map((poi) => (poi.id === WET_GRID.id ? wetCultPoi() : poi)),
    signs: w.signs.map((s) => (s.id === WET_GRID.id ? { ...UNFLAG_PLAQUE } : s)),
  };
}

export function applyForge(
  w: WorldState,
  playerId: string,
  choice: "hear" | "spot" | "sell",
): WorldState {
  const p = w.players.get(playerId);
  const atTray = p && nearPoint(p.x, p.y, FORGE_TRAY.x, FORGE_TRAY.y, 64);
  const atQuill = p && nearPoint(p.x, p.y, 1080, 504, 64);
  if (!p || p.hp <= 0 || (!atTray && !atQuill)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: FORGE_SPECTATOR, wink: visibleWink(true, WINK_FORGE) });
    return { ...w, players };
  }
  if (!p.beats.market) {
    players.set(playerId, { ...p, heard: FORGE_NEED_MARKET });
    return { ...w, players };
  }
  if (choice === "hear" || !p.beats.forge) {
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, forge: true },
      heard: FORGE_LESSON,
      wink: visibleWink(false, WINK_FORGE),
      readiness: p.readiness + (p.beats.forge ? 0 : 1),
    });
    return { ...w, players };
  }
  if (choice === "spot") {
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, spot: true },
      cultWink: true,
      heard: FORGE_SPOT,
      wink: visibleWink(false, WINK_FORGE),
      readiness: p.readiness + (p.beats.spot ? 0 : 1),
    });
    return { ...w, players };
  }
  if (p.cultWink) {
    players.set(playerId, { ...p, heard: CULT_NO_LIST, wink: visibleWink(false, WINK_FORGE) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, sold: true },
    fakeWinke: p.fakeWinke + 1,
    bestand: p.bestand + FORGE_PAY - LISTING_FEE,
    aura: Math.max(0, p.aura - 3),
    cultWink: false,
    heard: FORGE_SELL,
    wink: visibleWink(false, WINK_FORGE),
  });
  return withQuillLeave({ ...w, players, forgedSold: true }, playerId);
}

function withQuillLeave(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.guest || p.locked || w.quillGone || p.beats.hang || w.stallDark) return w;
  const players = new Map(w.players);
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, quillGone: true },
    heard: QUILL_LEAVE,
    wink: visibleWink(false, WINK_QUILL_LEAVE),
  });
  const pois = w.pois.some((poi) => poi.id === "quill-gone") ? w.pois : [...w.pois, quillGonePoi()];
  const signs = w.signs.some((s) => s.id === "quill-gone") ? w.signs : [...w.signs, { ...QUILL_GONE_PLAQUE }];
  return { ...w, players, quillGone: true, pois, signs };
}

export function applyYieldEmpty(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, 192, 400, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: YIELD_EMPTY_SPECTATOR });
    return { ...w, players };
  }
  const desksClear =
    (p.beats.clockOut || !w.clerks.some((c) => c.id === "clerk-desk-three")) &&
    (p.beats.annexHome || w.annexHome);
  if (!desksClear) {
    players.set(playerId, { ...p, heard: YIELD_EMPTY_NEED });
    return { ...w, players };
  }
  if (p.beats.yieldEmpty) {
    players.set(playerId, { ...p, heard: YIELD_EMPTY_LATER, wink: visibleWink(false, WINK_YIELD_EMPTY) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, yieldEmpty: true },
    heard: YIELD_EMPTY,
    wink: visibleWink(false, WINK_YIELD_EMPTY),
    readiness: p.readiness + 1,
  });
  return {
    ...w,
    players,
    signs: w.signs.map((s) => (s.id === "safety-plaque" ? { ...YIELD_EMPTY_PLAQUE } : s)),
    pois: w.pois.some((poi) => poi.kind === "yield-empty")
      ? w.pois
      : [...w.pois, yieldEmptyPoi()],
  };
}

export function applyClockOut(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0) return w;
  const clerk = w.clerks.find((c) => nearPoint(p.x, p.y, c.x, c.y, 70));
  if (clerk?.id === "clerk-annex" || (!clerk && (w.annexHome || p.beats.annexHome))) {
    return applyAnnexHome(w, playerId);
  }
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: CLOCK_SPECTATOR });
    return { ...w, players };
  }
  if (!clerk) return w;
  if (clerk.id !== "clerk-desk-three") return w;
  if (!w.weatherNamed) {
    players.set(playerId, { ...p, heard: CLOCK_NEED });
    return { ...w, players };
  }
  if (p.beats.clockOut && !w.clerks.some((c) => c.id === "clerk-desk-three")) {
    players.set(playerId, { ...p, heard: CLOCK_GONE, wink: visibleWink(false, WINK_CLOCK) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, clockOut: true },
    heard: CLOCK_OUT,
    wink: visibleWink(false, WINK_CLOCK),
    readiness: p.readiness + 1,
  });
  const left = w.clerks.filter((c) => c.id !== clerk.id);
  const pois = w.pois.some((poi) => poi.id === `empty-${clerk.id}`)
    ? w.pois
    : [...w.pois, deskEmptyPoi(clerk)];
  return { ...w, players, clerks: left, pois };
}

export function applyAnnexHome(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0) return w;
  const clerk = w.clerks.find((c) => c.id === "clerk-annex");
  const atRunner = clerk ? nearPoint(p.x, p.y, clerk.x, clerk.y, 70) : false;
  const atRoute = w.pois.some((poi) => poi.kind === "annex-route" && nearPoint(p.x, p.y, poi.x, poi.y, 70));
  const atAnnex = nearPoint(p.x, p.y, SAFETY_ANNEX.x, SAFETY_ANNEX.y, 56);
  const players = new Map(w.players);
  if (!atRunner && !atRoute && !atAnnex) return w;
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: ANNEX_SPECTATOR, wink: visibleWink(true, WINK_ANNEX) });
    return { ...w, players };
  }
  if (w.annexHome || !clerk) {
    players.set(playerId, { ...p, heard: ANNEX_GONE, wink: visibleWink(false, WINK_ANNEX) });
    return { ...w, players };
  }
  if (!w.frozen) {
    players.set(playerId, { ...p, heard: ANNEX_NEED });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, annexHome: true },
    heard: ANNEX_HOME,
    wink: visibleWink(false, WINK_ANNEX),
    readiness: p.readiness + 1,
  });
  const left = w.clerks.filter((c) => c.id !== clerk.id);
  const pois = w.pois
    .map((poi) => (poi.id === SAFETY_ANNEX.id ? annexHomePoi() : poi))
    .concat(w.pois.some((poi) => poi.id === `empty-${clerk.id}`) ? [] : [annexRoutePoi(clerk)]);
  const signs = w.signs.map((s) => (s.id === SAFETY_ANNEX.id ? { ...ANNEX_HOME_PLAQUE } : s));
  return { ...w, players, clerks: left, pois, signs, annexHome: true };
}

export function applyLink(w: WorldState, playerId: string, serial: number, sig: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0) return w;
  if (sig !== MOCK_SIG || serial !== TEST_SERIAL) return w;
  const players = new Map(w.players);
  players.set(playerId, {
    ...p,
    guest: false,
    serial,
    house: houseFor(serial),
    messenger: messengerFor(serial),
    aura: Math.max(p.aura, auraSeed(serial)),
    locked: false,
    heard: `Angel ${formatSerial(serial)} linked. ${houseName(houseFor(serial))}. ${messengerName(messengerFor(serial))} kit. Perception, not a stick. Claims stay disarmed.`,
  });
  const mark = serialHistory(serial);
  const history = mark && !w.history.some((m) => m.id === mark.id) ? [...w.history, mark] : w.history;
  return { ...w, players, history };
}

export function snapshot(w: WorldState) {
  return {
    t: "snap" as const,
    now: w.now,
    gestell: w.gestell,
    players: [...w.players.values()],
    nodes: w.nodes,
    wreckage: w.wreckage,
    rites: w.rites,
    clerks: w.clerks,
    npcs: liveNpcs(w.ioneGone, w.ordAtCable, w.naraAtStrait, w.quillAtGrid, w.vesperAtFoundry, w.ordAtStrait, w.wetCult, w.straitBuried, w.ordAtCare, w.naraAtCare, w.quillNoPrint, w.vesperNoGod, w.naraAtClearing, w.ordAtHijack, w.vesperAtHijack, w.naraGone, w.ordGone, w.quillGone, w.vesperGone),
    stallDark: w.stallDark,
    wetCult: w.wetCult,
    vesperAtFoundry: w.vesperAtFoundry,
    foundryDark: w.foundryDark,
    annexHome: w.annexHome,
    straitRefused: w.straitRefused,
    ordAtStrait: w.ordAtStrait,
    straitBuried: w.straitBuried,
    cableDark: w.cableDark,
    skyStanding: w.skyStanding,
    earthStanding: w.earthStanding,
    divStanding: w.divStanding,
    hallLamp: w.hallLamp,
    fourfoldHeld: w.fourfoldHeld,
    lastGodNamed: w.lastGodNamed,
    ordAtCare: w.ordAtCare,
    naraAtCare: w.naraAtCare,
    lastGodBuried: w.lastGodBuried,
    quillNoPrint: w.quillNoPrint,
    restraintHeld: w.restraintHeld,
    vesperNoGod: w.vesperNoGod,
    deskVaulted: w.deskVaulted,
    appearSlow: w.appearSlow,
    appearWorld: w.appearWorld,
    naraAtClearing: w.naraAtClearing,
    hijacked: w.hijacked,
    hijackBy: w.hijackBy,
    ordAtHijack: w.ordAtHijack,
    vesperAtHijack: w.vesperAtHijack,
    clearingFailed: w.clearingFailed,
    stormHeld: w.stormHeld,
    blitzHeld: w.blitzHeld,
    blitzMarks: w.blitzMarks,
    cyberHeld: w.cyberHeld,
    glamourHeld: w.glamourHeld,
    dwellHeld: w.dwellHeld,
    naraGone: w.naraGone,
    ordGone: w.ordGone,
    quillGone: w.quillGone,
    vesperGone: w.vesperGone,
    standing: w.standing,
    signs: w.signs,
    pois: w.pois,
    weatherNamed: w.weatherNamed,
    careOpen: w.careOpen,
    frozen: w.frozen,
    passing: w.passing,
    tax: gestellTax(w.gestell),
    history: w.history,
    failed: w.failed,
    clearingOpen: w.clearingOpen,
    m3Open: w.m3Open,
    forgedSold: w.forgedSold,
    ioneGone: w.ioneGone,
    announced: w.announced,
    war: w.war,
  };
}

export function applyFourfold(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, HOUSE_HALL.x, HOUSE_HALL.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: FOURFOLD_SPECTATOR, wink: visibleWink(true, WINK_FOURFOLD) });
    return { ...w, players };
  }
  if (!fourfoldReady(w.standing)) {
    players.set(playerId, { ...p, heard: FOURFOLD_NEED });
    return { ...w, players };
  }
  if (w.fourfoldHeld && p.beats.fourfold) {
    players.set(playerId, { ...p, heard: FOURFOLD_HELD, wink: visibleWink(false, WINK_FOURFOLD) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, fourfold: true, hall: true },
    heard: FOURFOLD_HOLD,
    wink: visibleWink(false, WINK_FOURFOLD),
    readiness: p.readiness + 1,
    lastCareX: HOUSE_HALL.x,
    lastCareY: HOUSE_HALL.y,
  });
  return {
    ...w,
    players,
    fourfoldHeld: true,
    pois: w.pois.map((poi) => (poi.id === HOUSE_HALL.id ? fourfoldPoi() : poi)),
    signs: w.signs.map((s) => (s.id === HOUSE_HALL.id ? { ...FOURFOLD_PLAQUE } : s)),
  };
}

export function applyStanding(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, HOUSE_HALL.x, HOUSE_HALL.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: STANDING_SPECTATOR, wink: visibleWink(true, WINK_STANDING) });
    return { ...w, players };
  }
  if (!p.beats.garden) {
    players.set(playerId, { ...p, heard: STANDING_NEED });
    return { ...w, players };
  }
  if (p.house !== "mortals") {
    players.set(playerId, { ...p, heard: STANDING_WRONG, wink: visibleWink(false, WINK_STANDING) });
    return { ...w, players };
  }
  if (w.hallLamp || p.beats.standing) {
    players.set(playerId, { ...p, heard: STANDING_HELD, wink: visibleWink(false, WINK_STANDING) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, standing: true },
    heard: STANDING_COPY,
    wink: visibleWink(false, WINK_STANDING),
    readiness: p.readiness + 1,
    lastCareX: HOUSE_HALL.x,
    lastCareY: HOUSE_HALL.y,
  });
  return {
    ...w,
    players,
    hallLamp: true,
    standing: { ...w.standing, mortals: w.standing.mortals + 1 },
    pois: w.pois.map((poi) => (poi.id === HOUSE_HALL.id ? hallStandingPoi() : poi)),
    signs: w.signs.map((s) => (s.id === HOUSE_HALL.id ? { ...HALL_STANDING_PLAQUE } : s)),
  };
}

export function applyTithe(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, HOUSE_HALL.x, HOUSE_HALL.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: TITHE_SPECTATOR, wink: visibleWink(true, WINK_WAR) });
    return { ...w, players };
  }
  if (!w.war.winner) {
    players.set(playerId, { ...p, heard: TITHE_NONE });
    return { ...w, players };
  }
  if (p.house !== w.war.winner) {
    players.set(playerId, { ...p, heard: TITHE_WRONG, wink: visibleWink(false, WINK_WAR) });
    return { ...w, players };
  }
  if (w.war.tithePaid) {
    players.set(playerId, { ...p, heard: TITHE_HELD, wink: visibleWink(false, WINK_WAR) });
    return { ...w, players };
  }
  const spent = spendBestand(p, TITHE_COST);
  if (!spent) {
    players.set(playerId, { ...p, heard: TITHE_NEED });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    bestand: spent.bestand,
    banked: spent.banked,
    heard: vaultHeard(TITHE_COPY, spent.fromVault),
    wink: visibleWink(false, WINK_WAR),
    lastCareX: HOUSE_HALL.x,
    lastCareY: HOUSE_HALL.y,
  });
  return { ...w, players, war: { ...w.war, tithePaid: true } };
}

export function applyAnnounce(w: WorldState, playerId: string, nodeId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0) return w;
  const node = w.nodes.find((n) => n.id === nodeId);
  if (!node || !nearNode(p.x, p.y, node)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: ANNOUNCE_SPECTATOR, wink: visibleWink(true, WINK_ANNOUNCE) });
    return { ...w, players };
  }
  if (p.messenger !== "herald" || !node.kept) {
    players.set(playerId, { ...p, heard: ANNOUNCE_NEED });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    heard: ANNOUNCE_COPY,
    wink: visibleWink(false, WINK_ANNOUNCE),
    readiness: p.readiness + (w.announced === node.id ? 0 : 1),
  });
  return { ...w, players, announced: node.id };
}

export function applyBlitz(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0) return w;
  const grave = w.wreckage.find((r) => nearPoint(p.x, p.y, r.x, r.y, 56));
  const players = new Map(w.players);
  if (!grave) return w;
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: BLITZ_SPECTATOR, wink: visibleWink(true, WINK_BLITZ) });
    return { ...w, players };
  }
  if (p.messenger !== "witness") {
    players.set(playerId, { ...p, heard: BLITZ_NEED });
    return { ...w, players };
  }
  if (w.blitzHeld || p.beats.blitz) {
    players.set(playerId, { ...p, heard: BLITZ_HELD, wink: visibleWink(false, WINK_BLITZ) });
    return { ...w, players };
  }
  const marks = lastWrecks(w.wreckage);
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, blitz: true },
    heard: BLITZ_COPY,
    wink: visibleWink(false, WINK_BLITZ),
    readiness: p.readiness + 1,
  });
  const pois = w.pois.some((poi) => poi.id === "blitz-trace")
    ? w.pois.map((poi) => (poi.id === "blitz-trace" ? blitzPoi(grave.x, grave.y) : poi))
    : [...w.pois, blitzPoi(grave.x, grave.y)];
  return { ...w, players, blitzHeld: true, blitzMarks: marks, pois };
}

export function applyCyber(w: WorldState, playerId: string, nodeId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0) return w;
  const node = w.nodes.find((n) => n.id === nodeId);
  if (!node || node.depleted || !nearNode(p.x, p.y, node)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: CYBER_SPECTATOR, wink: visibleWink(true, WINK_CYBER) });
    return { ...w, players };
  }
  if (p.messenger !== "cybernetic") {
    players.set(playerId, { ...p, heard: CYBER_NEED });
    return { ...w, players };
  }
  if (w.cyberHeld && p.beats.cyber) {
    players.set(playerId, { ...p, heard: CYBER_HELD, wink: visibleWink(false, WINK_CYBER) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, cyber: true },
    heard: CYBER_COPY,
    wink: visibleWink(false, WINK_CYBER),
    readiness: p.readiness + 1,
  });
  const plaque = { ...CYBER_PLAQUE, x: node.x, y: node.y };
  const pois = w.pois.some((poi) => poi.id === "process-read")
    ? w.pois.map((poi) => (poi.id === "process-read" ? cyberPoi(node.x, node.y) : poi))
    : [...w.pois, cyberPoi(node.x, node.y)];
  const signs = w.signs.some((s) => s.id === "process-read")
    ? w.signs.map((s) => (s.id === "process-read" ? plaque : s))
    : [...w.signs, plaque];
  return { ...w, players, cyberHeld: true, pois, signs };
}

export function applyGlamour(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, CLEARING_STALL.x, CLEARING_STALL.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: GLAMOUR_SPECTATOR, wink: visibleWink(true, WINK_GLAMOUR) });
    return { ...w, players };
  }
  if (p.messenger !== "iridescent") {
    players.set(playerId, { ...p, heard: GLAMOUR_NEED });
    return { ...w, players };
  }
  if (w.stallDark) {
    players.set(playerId, { ...p, heard: GLAMOUR_DARK, wink: visibleWink(false, WINK_GLAMOUR) });
    return { ...w, players };
  }
  if (w.glamourHeld || p.beats.glamour) {
    players.set(playerId, { ...p, heard: GLAMOUR_HELD, wink: visibleWink(false, WINK_GLAMOUR) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, glamour: true },
    surface: true,
    heard: GLAMOUR_COPY,
    wink: visibleWink(false, WINK_GLAMOUR),
    readiness: p.readiness + 1,
  });
  const pois = w.pois.some((poi) => poi.id === CLEARING_STALL.id)
    ? w.pois.map((poi) => (poi.id === CLEARING_STALL.id ? glamourPoi() : poi))
    : [...w.pois, glamourPoi()];
  const signs = w.signs.some((s) => s.id === CLEARING_STALL.id)
    ? w.signs.map((s) => (s.id === CLEARING_STALL.id ? { ...GLAMOUR_PLAQUE } : s))
    : [...w.signs, { ...GLAMOUR_PLAQUE }];
  return { ...w, players, glamourHeld: true, pois, signs };
}

export function applyDwell(w: WorldState, playerId: string, nodeId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0) return w;
  const node = w.nodes.find((n) => n.id === nodeId);
  if (!node || !nearNode(p.x, p.y, node)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: DWELL_SPECTATOR, wink: visibleWink(true, WINK_DWELL) });
    return { ...w, players };
  }
  if (p.messenger !== "dweller" || !node.kept) {
    players.set(playerId, { ...p, heard: DWELL_NEED });
    return { ...w, players };
  }
  if (w.dwellHeld || p.beats.dwell) {
    players.set(playerId, { ...p, heard: DWELL_HELD, wink: visibleWink(false, WINK_DWELL) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, dwell: true },
    heard: DWELL_COPY,
    wink: visibleWink(false, WINK_DWELL),
    readiness: p.readiness + 1,
  });
  const plaque = { ...DWELL_PLAQUE, x: node.x, y: node.y };
  const pois = w.pois.some((poi) => poi.id === "clearing-seed")
    ? w.pois.map((poi) => (poi.id === "clearing-seed" ? dwellPoi(node.x, node.y) : poi))
    : [...w.pois, dwellPoi(node.x, node.y)];
  const signs = w.signs.some((s) => s.id === "clearing-seed")
    ? w.signs.map((s) => (s.id === "clearing-seed" ? plaque : s))
    : [...w.signs, plaque];
  return { ...w, players, dwellHeld: true, pois, signs };
}

export function applyLastWord(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, IONE.x, IONE.y, 56)) return w;
  const players = new Map(w.players);
  if (w.ioneGone) {
    players.set(playerId, { ...p, heard: LAST_WORD_GONE });
    return { ...w, players };
  }
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: IONE_SPECTATOR, wink: visibleWink(true, WINK_TURN) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, lastWord: true },
    heard: LAST_WORD,
    wink: visibleWink(false, WINK_TURN),
    readiness: p.readiness + (p.beats.lastWord ? 0 : 1),
  });
  const pois = w.pois.some((poi) => poi.id === IONE.id) ? w.pois : [...w.pois, ioneGonePoi()];
  const signs = w.signs.some((s) => s.id === IONE.id) ? w.signs : [...w.signs, { ...IONE_GONE_PLAQUE }];
  return { ...w, players, ioneGone: true, pois, signs };
}

export function applyIoneMark(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, IONE.x, IONE.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: IONE_MARK_SPECTATOR, wink: visibleWink(true, WINK_ABSENCE) });
    return { ...w, players };
  }
  if (!w.ioneGone) return w;
  if (p.beats.ioneMark) {
    players.set(playerId, { ...p, heard: IONE_MARK_LATER, wink: visibleWink(false, WINK_ABSENCE) });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, ioneMark: true },
    heard: IONE_MARK,
    wink: visibleWink(false, WINK_ABSENCE),
    readiness: p.readiness + 1,
  });
  return { ...w, players };
}

export function applyClearing(
  w: WorldState,
  playerId: string,
  choice: "keep" | "extract" | "pass",
): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, CLEARING_RING.x, CLEARING_RING.y, 64)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: CLEARING_SPECTATOR, wink: visibleWink(true, WINK_TURN) });
    return { ...w, players };
  }
  if (choice === "extract") {
    const war = scoreWar(w.war, p.house, "extract");
    players.set(playerId, {
      ...p,
      bestand: p.bestand + CONTEST_PAY,
      aura: Math.max(0, p.aura - 2),
      current: p.current || "cold",
      heard: war.winner && !w.war.winner ? war.omen : CLEARING_CONTEST,
      wink: visibleWink(false, war.winner ? WINK_WAR : WINK_TURN),
    });
    return {
      ...w,
      players,
      war,
      clearingOpen: false,
      gestell: Math.min(100, w.gestell + 8),
      pois: w.pois.map((poi) => (poi.id === CLEARING_RING.id ? clearingPoi(false) : poi)),
    };
  }
  if (choice === "pass" || (choice === "keep" && p.beats.clearing && w.clearingOpen)) {
    return applyPassing(w, playerId);
  }
  if (!p.beats.garden) {
    players.set(playerId, { ...p, heard: CLEARING_NEED_GARDEN });
    return { ...w, players };
  }
  if (!p.beats.lastWord) {
    players.set(playerId, { ...p, heard: CLEARING_NEED_MORTAL });
    return { ...w, players };
  }
  const war = scoreWar(w.war, p.house, "keep");
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, clearing: true },
    heard: war.winner && !w.war.winner ? war.omen : CLEARING_PREPARE,
    wink: visibleWink(false, war.winner ? WINK_WAR : WINK_TURN),
    readiness: p.readiness + (p.beats.clearing ? 0 : 1),
  });
  return withVesperLeave({
    ...w,
    players,
    war,
    clearingOpen: true,
    gestell: Math.max(0, w.gestell - 4),
    pois: w.pois.map((poi) => (poi.id === CLEARING_RING.id ? clearingPoi(true) : poi)),
  }, playerId);
}

function withVesperLeave(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.guest || p.locked || w.vesperGone) return w;
  if (!p.beats.cold && p.current !== "cold") return w;
  if (w.foundryDark || p.beats.foundryDark) return w;
  const players = new Map(w.players);
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, vesperGone: true },
    heard: VESPER_LEAVE,
    wink: visibleWink(false, WINK_VESPER_LEAVE),
  });
  const pois = w.pois.some((poi) => poi.id === "vesper-gone") ? w.pois : [...w.pois, vesperGonePoi()];
  const signs = w.signs.some((s) => s.id === "vesper-gone") ? w.signs : [...w.signs, { ...VESPER_GONE_PLAQUE }];
  return { ...w, players, vesperGone: true, pois, signs };
}

export function applyStorm(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, CLEARING_RING.x, CLEARING_RING.y, 64)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: STORM_SPECTATOR, wink: visibleWink(true, WINK_STORM) });
    return { ...w, players };
  }
  if (!w.clearingFailed && w.passing.outcome !== "failed") {
    players.set(playerId, { ...p, heard: STORM_NEED });
    return { ...w, players };
  }
  if (w.stormHeld || p.beats.storm || p.storm) {
    players.set(playerId, { ...p, heard: STORM_HELD, wink: visibleWink(false, WINK_STORM), storm: true });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, storm: true },
    storm: true,
    restraint: false,
    readiness: Math.max(0, p.readiness - STORM_BURN),
    heard: p.restraint ? STORM_BURNS : STORM_COPY,
    wink: visibleWink(false, WINK_STORM),
  });
  return {
    ...w,
    players,
    stormHeld: true,
    pois: w.pois.map((poi) => (poi.id === CLEARING_RING.id ? stormPoi() : poi)),
    signs: w.signs.map((s) => (s.id === CLEARING_RING.id ? { ...STORM_PLAQUE } : s)).concat(
      w.signs.some((s) => s.id === CLEARING_RING.id) ? [] : [{ ...STORM_PLAQUE }],
    ),
  };
}

export function applyPassing(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, CLEARING_RING.x, CLEARING_RING.y, 64)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: CLEARING_SPECTATOR, wink: visibleWink(true, WINK_TURN) });
    return { ...w, players };
  }
  if (!w.clearingOpen) {
    const failed = p.beats.clearing;
    if (!failed) {
      players.set(playerId, { ...p, heard: PASSING_NEED, wink: visibleWink(false, WINK_TURN) });
      return { ...w, players };
    }
    if (w.clearingFailed && p.beats.passing) return applyStorm(w, playerId);
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, passing: true },
      heard: passingCopy("failed"),
      wink: visibleWink(false, WINK_PASS_FAIL),
    });
    const failedMarks = w.failed.some((f) => f.id === FAILED_PASSING.id) ? w.failed : [...w.failed, { ...FAILED_PASSING }];
    return {
      ...w,
      players,
      passing: { ...w.passing, ready: 0, starved: true, outcome: "failed" },
      clearingFailed: true,
      gestell: Math.min(100, w.gestell + 4),
      failed: failedMarks,
      pois: w.pois.map((poi) => (poi.id === CLEARING_RING.id ? failPoi() : poi)),
      signs: w.signs.map((s) => (s.id === CLEARING_RING.id ? { ...FAIL_PLAQUE } : s)).concat(
        w.signs.some((s) => s.id === CLEARING_RING.id) ? [] : [{ ...FAIL_PLAQUE }],
      ),
    };
  }
  const dwellers = [...w.players.values()].filter((x) => !x.guest && !x.locked && x.beats.clearing).length;
  const willing = partyWilling(w);
  const outcome = passingResult({
    starved: w.passing.starved || w.frozen,
    gestell: w.gestell,
    clearingOpen: w.clearingOpen,
    dwellers,
    cold: p.current === "cold",
    partyWilling: willing,
  });
  const hijacked = outcome === "hijack";
  const emptyParty = outcome === "absence" && !willing;
  const by = hijacked ? hijackByOf(w.frozen, w.passing.starved, p.current === "cold") : w.hijackBy;
  players.set(playerId, {
    ...p,
    beats: {
      ...p.beats,
      passing: true,
      absenceHour: outcome === "absence" ? true : p.beats.absenceHour,
      hijacked: hijacked ? true : p.beats.hijacked,
    },
    heard: emptyParty ? PARTY_STAND : passingCopy(outcome),
    wink: visibleWink(
      false,
      outcome === "appearance"
        ? WINK_STIPEND
        : emptyParty
          ? WINK_PARTY
          : outcome === "absence"
            ? WINK_PASS_ABSENCE
            : hijacked
              ? WINK_HIJACK
              : WINK_TURN,
    ),
    readiness: p.readiness + (outcome === "appearance" && !p.beats.passing ? 2 : 0),
    stipend: outcome === "appearance" ? p.stipend + STIPEND : p.stipend,
  });
  const absent = outcome === "absence";
  const plaque = hijacked && by ? hijackPlaque(by) : null;
  const mark = hijacked && p.serial != null ? hijackMark(p.serial) : null;
  return {
    ...w,
    players,
    passing: {
      ready: outcome === "appearance" ? w.passing.ready : 0,
      starved: outcome !== "appearance" ? true : w.passing.starved,
      outcome,
    },
    appearSlow: outcome === "appearance" ? true : w.appearSlow,
    appearWorld: outcome === "appearance" ? true : w.appearWorld,
    naraAtClearing: absent && !w.naraGone ? true : w.naraAtClearing,
    hijacked: hijacked ? true : w.hijacked,
    hijackBy: hijacked && by ? by : w.hijackBy,
    ordAtHijack: hijacked && by === "safety" ? true : w.ordAtHijack,
    vesperAtHijack: hijacked && by === "cold" ? true : w.vesperAtHijack,
    history:
      mark && !w.history.some((h) => h.id === mark.id) ? [...w.history, mark] : w.history,
    pois: emptyParty
      ? w.pois.map((poi) => (poi.id === CLEARING_RING.id ? emptyPartyPoi() : poi))
      : absent
      ? w.pois.map((poi) => (poi.id === CLEARING_RING.id ? absencePoi() : poi))
      : outcome === "appearance"
        ? w.pois.map((poi) => (poi.id === CLEARING_RING.id ? appearPoi() : poi))
      : hijacked && by
        ? w.pois.map((poi) => (poi.id === CLEARING_RING.id ? hijackPoi(by) : poi))
        : w.pois,
    signs: emptyParty
      ? w.signs.map((s) => (s.id === CLEARING_RING.id ? { ...PARTY_PLAQUE } : s)).concat(
          w.signs.some((s) => s.id === CLEARING_RING.id) ? [] : [{ ...PARTY_PLAQUE }],
        )
      : absent
      ? w.signs.map((s) => (s.id === CLEARING_RING.id ? { ...ABSENCE_PLAQUE } : s)).concat(
          w.signs.some((s) => s.id === CLEARING_RING.id) ? [] : [{ ...ABSENCE_PLAQUE }],
        )
      : outcome === "appearance"
        ? w.signs.map((s) => (s.id === CLEARING_RING.id ? { ...APPEAR_PLAQUE } : s)).concat(
            w.signs.some((s) => s.id === CLEARING_RING.id) ? [] : [{ ...APPEAR_PLAQUE }],
          )
      : plaque
        ? w.signs.map((s) => (s.id === CLEARING_RING.id ? { ...plaque } : s)).concat(
            w.signs.some((s) => s.id === CLEARING_RING.id) ? [] : [{ ...plaque }],
          )
        : w.signs,
  };
}
