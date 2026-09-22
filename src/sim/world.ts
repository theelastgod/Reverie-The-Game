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
  weatherComplete,
  WeatherHeard,
  WEATHER_NAMED,
  MOCK_SIG,
  TEST_SERIAL,
  auraSeed,
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
  WINK_CARE,
  WINK_FREEZE,
  WINK_HALL,
  WINK_MARKET,
  gestellTax,
  hallCopy,
  hallPlaque,
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
  LAST_WORD,
  LAST_WORD_GONE,
  WINK_TURN,
  PASSING_NEED,
  clearingPoi,
  liveNpcs,
  passingCopy,
  passingResult,
  House,
  houseFor,
  houseName,
  earthTax,
  divinitiesKeep,
  emptyWar,
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
    fakeWinke: p.fakeWinke,
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
  return {
    ...afterDecay,
    wreckage: afterDecay.wreckage.filter((r) => r.until > now),
  };
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
    players.set(playerId, { ...p, bestand: p.bestand + Math.max(0, 40 - tax) });
    return { ...w, nodes, players, gestell: Math.min(100, w.gestell + 6) };
  }
  nodes[idx] = { ...node, depleted: true, kept: true };
  players.set(playerId, { ...p, winke: p.winke + divinitiesKeep(p.house), readiness: p.readiness + 1 });
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
  const npc = npcById(npcId);
  if (!p || p.hp <= 0 || !npc || !nearPoint(p.x, p.y, npc.x, npc.y)) return w;
  const id = npc.id as NpcId;
  const players = new Map(w.players);
  const gardenOpen = w.rites.some((r) => r.kind === "garden" && !r.done);
  if (id === "nara" && gardenOpen && (p.beats.under || w.m3Open)) {
    players.set(playerId, { ...p, heard: NARA_SILENCE });
    return { ...w, players };
  }
  if (id === "ione") return applyLastWord(w, playerId);
  if (id === "quill" && p.beats.market && !p.guest && !p.locked) {
    return applyForge(w, playerId, "hear");
  }
  if (id === "ord" && w.m3Open && !p.guest) {
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, ord: true, map: true },
      heard: ORD_MAP,
      wink: visibleWink(false, WINK_ORGANS),
      readiness: p.readiness + (p.beats.map ? 0 : 1),
    });
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
  if (sign.id === HOUSE_HALL.id) {
    if (!p.inCare || p.guest || p.locked) return w;
    if (p.beats.hall && w.war.winner) return applyTithe(w, playerId);
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
  if (sign.id === SAFETY_ANNEX.id) return applyFreeze(w, playerId);
  if (sign.id === CLEARING_STALL.id) return applyMarket(w, playerId);
  if (sign.id === FORGE_TRAY.id) return applyForge(w, playerId, "hear");
  if (sign.id === WET_GRID.id) return applyFlag(w, playerId);
  if (sign.id === CLAIMS_DESK.id) return applyDesk(w, playerId, "file");
  if (sign.id === SHRINE.id) return applyShrine(w, playerId);
  if (sign.id === CLEARING_RING.id) return applyClearing(w, playerId, "keep");
  if (sign.id === OPERATOR_DESK.id) return applyOperator(w, playerId, "hear");
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
    if (p.bestand < FUNERAL_COST) {
      players.set(playerId, { ...p, heard: FUNERAL_NEED });
      return { ...w, players };
    }
    players.set(playerId, {
      ...p,
      bestand: p.bestand - FUNERAL_COST,
      readiness: p.readiness + (p.house === "earth" ? 2 : 1),
      heard: FUNERAL_COPY,
      wink: visibleWink(p.guest, WINK_SINK),
    });
    return { ...w, players, wreckage: w.wreckage.filter((r) => r.id !== wreck.id) };
  }
  const mark = visibleHistory(p.guest, p.serial, w.history).find((m) => nearPoint(p.x, p.y, m.x, m.y, 56));
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

export function applyShrine(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, SHRINE.x, SHRINE.y, 56)) return w;
  const players = new Map(w.players);
  const atShrine = { lastCareX: SHRINE.x, lastCareY: SHRINE.y };
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, ...atShrine, heard: SHRINE_SPECTATOR, wink: visibleWink(true, WINK_SINK) });
    return { ...w, players };
  }
  if (p.bestand < SHRINE_COST) {
    players.set(playerId, { ...p, ...atShrine, heard: SHRINE_NEED });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    ...atShrine,
    bestand: p.bestand - SHRINE_COST,
    readiness: p.readiness + 1,
    heard: SHRINE_COPY,
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
  if (p.bestand < RESTORE_COST) {
    players.set(playerId, { ...p, ...atShrine, heard: RESTORE_NEED, wink: visibleWink(false, p.wink, p.aura) });
    return { ...w, players };
  }
  const aura = p.aura + RESTORE_GAIN;
  players.set(playerId, {
    ...p,
    ...atShrine,
    bestand: p.bestand - RESTORE_COST,
    aura,
    heard: RESTORE_COPY,
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
  if (p.bestand < INSURANCE_COST) {
    players.set(playerId, { ...p, ...atShrine, heard: INSURANCE_NEED });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    ...atShrine,
    bestand: p.bestand - INSURANCE_COST,
    insured: true,
    heard: INSURANCE_COPY,
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

export function applyMarket(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, CLEARING_STALL.x, CLEARING_STALL.y, 56)) return w;
  const players = new Map(w.players);
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
  if (p.bestand < CLEARING_PRICE) {
    players.set(playerId, { ...p, heard: MARKET_LISTING });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    bestand: p.bestand - CLEARING_PRICE,
    aura: Math.max(0, p.aura - 2),
    heard: MARKET_BUY,
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
  if (p.bestand < FREEZE_COST) {
    players.set(playerId, { ...p, heard: FREEZE_NEED });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    bestand: p.bestand - FREEZE_COST,
    beats: { ...p.beats, freeze: true },
    heard: FREEZE_COPY,
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
  if (!p.beats.hall) {
    players.set(playerId, { ...p, heard: OPERATOR_NEED_HALL });
    return { ...w, players };
  }
  if (choice === "hear" || !p.beats.yield) {
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
    players.set(playerId, { ...p, heard: p.beats.cold ? OPERATOR_TAKE : OPERATOR_REFUSE });
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

export function applyWatch(w: WorldState, playerId: string): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0) return w;
  const mark = visibleFailed(p.guest, p.serial, w.failed, p.house).find((m) => nearPoint(p.x, p.y, m.x, m.y, 56));
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

export function applyDesk(w: WorldState, playerId: string, choice: "file" | "take"): WorldState {
  const p = w.players.get(playerId);
  if (!p || p.hp <= 0 || !nearPoint(p.x, p.y, CLAIMS_DESK.x, CLAIMS_DESK.y, 56)) return w;
  const players = new Map(w.players);
  if (p.guest || p.locked) {
    players.set(playerId, { ...p, heard: DESK_SPECTATOR });
    return { ...w, players };
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
  players.set(playerId, {
    ...p,
    flagged: true,
    heard: FLAG_COPY,
  });
  return { ...w, players };
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
  return { ...w, players, forgedSold: true };
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
    npcs: liveNpcs(w.ioneGone),
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
  if (p.bestand < TITHE_COST) {
    players.set(playerId, { ...p, heard: TITHE_NEED });
    return { ...w, players };
  }
  players.set(playerId, {
    ...p,
    bestand: p.bestand - TITHE_COST,
    heard: TITHE_COPY,
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
  return { ...w, players, ioneGone: true };
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
  return {
    ...w,
    players,
    war,
    clearingOpen: true,
    gestell: Math.max(0, w.gestell - 4),
    pois: w.pois.map((poi) => (poi.id === CLEARING_RING.id ? clearingPoi(true) : poi)),
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
    players.set(playerId, {
      ...p,
      beats: { ...p.beats, passing: failed },
      heard: failed ? passingCopy("failed") : PASSING_NEED,
      wink: visibleWink(false, WINK_TURN),
    });
    return failed
      ? { ...w, players, passing: { ...w.passing, ready: 0, outcome: "failed" } }
      : { ...w, players };
  }
  const dwellers = [...w.players.values()].filter((x) => !x.guest && !x.locked && x.beats.clearing).length;
  const outcome = passingResult({
    starved: w.passing.starved || w.frozen,
    gestell: w.gestell,
    clearingOpen: w.clearingOpen,
    dwellers,
    cold: p.current === "cold",
  });
  players.set(playerId, {
    ...p,
    beats: { ...p.beats, passing: true },
    heard: passingCopy(outcome),
    wink: visibleWink(false, WINK_TURN),
    readiness: p.readiness + (outcome === "appearance" && !p.beats.passing ? 2 : 0),
  });
  return {
    ...w,
    players,
    passing: {
      ready: outcome === "appearance" ? w.passing.ready : 0,
      starved: outcome !== "appearance" ? true : w.passing.starved,
      outcome,
    },
  };
}
