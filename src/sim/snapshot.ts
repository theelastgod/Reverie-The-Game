/**
 * Per-viewer snapshots. Everything the client draws comes from here: an area
 * of interest around the viewer, other bodies as public shapes, wreckage and
 * marks under the visibility rules, NPCs with personal overrides, the nearest
 * interaction and the journal objective. Winke never leave for a guest;
 * history marks go only to their owner; failed Passings only to Ruin-sight,
 * Storm stance or the House of Sky.
 */
import { AOI_RADIUS, AURA_DIM, AURA_PRESENT, CITY_SELLER, MAX_HP, WRECKAGE_TTL_BONUS } from "./constants";
import { POSITIONS } from "./map";
import { NPCS, POI_CONFIGS } from "./content";
import { PROTOCOL_VERSION, WEATHER_LABEL, weatherBand, type EnemyView, type FastFrame, type NodeView, type NpcView, type PoiView, type PublicPlayer, type SlowFrame, type SlowKey, type Snap, type WreckageView, type YouView } from "./protocol";
import type { Ctx, Enemy, FailedPassing, HistoryMark, NpcState, Player, PoiConfig, Prompt, PromptVerb, Wreckage, WorldState, YieldNode } from "./types";
import { nodeYield } from "./economy";
import { perception } from "./houses";
import { npcOffers, objectiveFor, sideObjectivesFor } from "./quests";
import { NODE_REACH, NPC_REACH, PLAYER_REACH, POI_REACH, WRECKAGE_REACH, nodeVerbs, npcVerbs, playerVerbs, poiVerbs, wreckageVerbs } from "./interact";
import { newFrameCache, splitPlayer, YOU_OFF_WIRE, YOU_SLOW_KEYS, type FrameCache, type YouSlow } from "./frames";

const MARKET_TOP = 12;

const d2 = (ax: number, ay: number, bx: number, by: number) => (ax - bx) * (ax - bx) + (ay - by) * (ay - by);

function kitActive(p: Player, verb: Player["messenger"], now: number): boolean {
  return !!p.kit && p.kit.verb === verb && p.kit.until > now;
}

// ---------------------------------------------------------------- public shapes

export function publicPlayer(p: Player, now: number): PublicPlayer {
  let auraTier: PublicPlayer["auraTier"] = 3;
  if (p.guest) auraTier = 0;
  else if (p.aura < AURA_DIM) auraTier = 1;
  else if (p.aura < AURA_PRESENT) auraTier = 2;
  // Positions and timers to a tenth (see `tenth`): another body is never drawn finer.
  return {
    id: p.id,
    name: p.name,
    x: Math.round(p.x * 10) / 10,
    y: Math.round(p.y * 10) / 10,
    facing: p.facing,
    district: p.district,
    guest: p.guest,
    locked: p.locked,
    house: p.house,
    messenger: p.messenger,
    hpFrac: Math.round(Math.max(0, Math.min(1, p.hp / MAX_HP)) * 1000) / 1000,
    dead: p.dead,
    dodgeT: Math.round(p.dodgeT * 100) / 100,
    stance: p.stance,
    flagged: p.flagged,
    truce: p.truceUntil > now,
    auraTier,
    kit: p.kit && p.kit.until > now ? p.kit.verb : "",
    heavyWindup: Math.round(p.heavyWindup * 100) / 100,
    hitStop: Math.round(p.hitStop * 100) / 100,
  };
}

/** Where the person stands for this viewer: the shared state under the authored personal override. Null when absent for them. */
function npcStateFor(ctx: Ctx, npc: NpcState): NpcState | null {
  const def = NPCS[npc.id];
  if (!def) return null;
  let merged: NpcState = npc;
  if (def.personal) {
    const override = def.personal(ctx, npc);
    if (override) {
      merged = { ...npc };
      for (const [k, v] of Object.entries(override)) {
        if (v !== undefined) (merged as unknown as Record<string, unknown>)[k] = v;
      }
    }
  }
  return merged.present ? merged : null;
}

/** The person's standing for this viewer, present ones only: what the prompt needs of them, without their offers. */
function npcStatesFor(ctx: Ctx): NpcState[] {
  const out: NpcState[] = [];
  for (const npc of Object.values(ctx.w.npcs)) {
    const state = npcStateFor(ctx, npc);
    if (state) out.push(state);
  }
  return out;
}

/** The view of a person who is present for the viewer: who they are, and whether they have an hour to hand over (`npcOffers`, the dear part). */
function npcViewOf(ctx: Ctx, state: NpcState): NpcView {
  const def = NPCS[state.id];
  return { ...state, name: def.name, role: def.role, sprite: def.sprite, party: ctx.p.party[state.id] ?? "none", offers: npcOffers(ctx, def) };
}

/** The NPC as this viewer sees them: the shared state under the authored personal override. Null when absent for them. */
export function npcView(ctx: Ctx, npc: NpcState): NpcView | null {
  const state = npcStateFor(ctx, npc);
  return state ? npcViewOf(ctx, state) : null;
}

/** Wreckage this viewer can see: until, plus the House / messenger bonus, plus the storm; a Witness blitz shows all. */
export function visibleWreckage(w: WorldState, p: Player): Wreckage[] {
  if (kitActive(p, "witness", w.now)) return w.wreckage;
  const bonus = perception(p).wreckageBonus + (!p.guest && p.stance === "storm" ? WRECKAGE_TTL_BONUS : 0);
  return w.wreckage.filter(r => r.until + bonus > w.now);
}

// ---------------------------------------------------------------- prompt

/** A thing within reach, before its verbs are read: they, and a POI's label, are read only as far as the one that wins. */
type Candidate = { d: number; targetId: string; targetKind: Prompt["targetKind"]; name: string | ((ctx: Ctx) => string); verbs: () => PromptVerb[] };

/** What the prompt needs of a person: where they stand for this viewer. An `NpcView` is one. */
export type NpcPlace = Pick<NpcState, "id" | "x" | "y">;

/** Every placed POI with its reach squared, gathered once: authored content that does not move. */
type PoiPlace = { cfg: PoiConfig; x: number; y: number; r2: number };
let POI_PLACES: PoiPlace[] | null = null;
function poiPlaces(): PoiPlace[] {
  if (!POI_PLACES) {
    POI_PLACES = [];
    for (const cfg of Object.values(POI_CONFIGS)) {
      const pos = POSITIONS[cfg.id];
      if (!pos) continue;
      const reach = cfg.reach ?? POI_REACH;
      POI_PLACES.push({ cfg, x: pos.x, y: pos.y, r2: reach * reach });
    }
  }
  return POI_PLACES;
}

/** The NPCs as this viewer sees them, present ones only. */
export function npcViews(ctx: Ctx): NpcView[] {
  return npcStatesFor(ctx).map(state => npcViewOf(ctx, state));
}

/**
 * The nearest interactable thing and its keys. Everything within reach is
 * gathered by distance first; verbs are read nearest first and only until
 * one thing has a verb to offer (a POI without an available verb, or a body
 * the viewer cannot flag or duel, is passed over for the next), so a crowd
 * within reach costs one verb lookup, not one per body. `npcs` are the
 * viewer's own NPC standings when the caller has them already.
 */
export function promptFor(ctx: Ctx, npcs: readonly NpcPlace[] = npcStatesFor(ctx)): Prompt | null {
  const { w, p } = ctx;
  const found: Candidate[] = [];

  for (const npc of npcs) {
    const d = d2(p.x, p.y, npc.x, npc.y);
    if (d <= NPC_REACH * NPC_REACH && w.npcs[npc.id]) found.push({ d, targetId: npc.id, targetKind: "npc", name: NPCS[npc.id]?.name ?? npc.id, verbs: npcVerbs });
  }

  for (const { cfg, x, y, r2 } of poiPlaces()) {
    const d = d2(p.x, p.y, x, y);
    if (d <= r2) found.push({ d, targetId: cfg.id, targetKind: "poi", name: cfg.label, verbs: () => poiVerbs(ctx, cfg) });
  }

  for (const n of w.nodes) {
    const d = d2(p.x, p.y, n.x, n.y);
    if (d <= NODE_REACH * NODE_REACH) found.push({ d, targetId: n.id, targetKind: "node", name: "Yield node", verbs: () => nodeVerbs(ctx, n) });
  }

  for (const r of visibleWreckage(w, p)) {
    if (r.buried) continue;
    const d = d2(p.x, p.y, r.x, r.y);
    if (d <= WRECKAGE_REACH * WRECKAGE_REACH) found.push({ d, targetId: r.id, targetKind: "wreckage", name: `Wreckage · ${r.fromName}`, verbs: () => wreckageVerbs(ctx, r) });
  }

  // Nothing passes between guests, the locked and the fallen; a viewer who can do nothing with a body gathers none.
  if (!p.guest && !p.locked) {
    for (const o of w.players.values()) {
      if (o.id === p.id || o.dead || o.guest || o.locked) continue;
      const d = d2(p.x, p.y, o.x, o.y);
      if (d <= PLAYER_REACH * PLAYER_REACH) found.push({ d, targetId: o.id, targetKind: "player", name: o.name, verbs: () => playerVerbs(ctx, o) });
    }
  }

  if (found.length > 1) found.sort((a, b) => a.d - b.d); // stable: at one distance the kind gathered first stands
  for (const c of found) {
    const verbs = c.verbs();
    if (verbs.length === 0) continue;
    return { targetId: c.targetId, targetKind: c.targetKind, name: typeof c.name === "function" ? c.name(ctx) : c.name, verbs };
  }
  return null;
}

/** What the Face reads off an Angel's own log: the marks they can see, then the counts, then the last outcome. */
function kitReadout(p: Player, marks: string[]): string[] {
  const h = p.history;
  const out = [...marks, `Passings ${h.passings}. Buried ${h.buried}. Looted ${h.looted}. Fell ${p.deaths} times.`];
  const last = h.outcomes[h.outcomes.length - 1];
  if (last) out.push(`The last hour: ${last}.`);
  return out;
}

/** Positions and timers to a tenth: a body is never drawn finer, and the digits were a third of every frame. */
export const tenth = (v: number): number => Math.round(v * 10) / 10;

/** What a viewer sees of an enemy; its participants, its home and its respawn stay with the server. */
export function enemyView(e: Enemy): EnemyView {
  return { id: e.id, kind: e.kind, name: e.name, x: tenth(e.x), y: tenth(e.y), hp: tenth(e.hp), maxHp: e.maxHp, state: e.state, t: tenth(e.t), tint: e.tint, targetId: e.targetId };
}

// ---------------------------------------------------------------- shared per step

/**
 * What every viewer sees the same, built once per step: the server makes
 * one `stepViews(w)` per broadcast and snapshots every viewer with it, so a
 * body's public shape, an enemy's view, the POI list, the market and the
 * news are made once and shared, and the frames' cache encodes each once.
 * Sections that read one world section are kept across steps while that
 * section is the same object, so an unchanged section keeps its identity
 * from step to step and the slow tracker sends nothing without a stringify.
 * The sim never mutates a world in place; that is what makes an object's
 * identity its version number.
 */
export type StepViews = {
  players: Map<string, PublicPlayer>;
  enemies: { e: Enemy; view: EnemyView }[]; // alive ones
  nodes: NodeView[]; // parallel to w.nodes, without the kit hints
  pois: PoiView[];
  frozen: string[];
  market: Snap["market"];
  news: string[];
  clearing: Snap["clearing"];
  passing: Snap["passing"];
  historyFor: (serial: number) => HistoryMark[];
  frames: FrameCache;
};

/** One output kept while its input is the same object. */
class Keep<I, O> {
  private input: I | undefined;
  private output: O | undefined;
  get(input: I, build: (input: I) => O): O {
    if (this.input !== input || this.output === undefined) return this.set(input, build(input));
    return this.output;
  }
  set(input: I, output: O): O {
    this.input = input;
    this.output = output;
    return output;
  }
}

const sameList = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && a.every((v, i) => v === b[i]);

const keptPois = new Keep<WorldState["pois"], PoiView[]>();
const keptMarket = new Keep<WorldState["market"], Snap["market"]>();
const keptNews = new Keep<WorldState["news"], string[]>();
const keptClearing = new Keep<WorldState["clearing"], Snap["clearing"]>();
const keptPassing = new Keep<WorldState["passing"], Keep<number, Snap["passing"]>>();
const keptHistory = new Keep<WorldState["history"], Map<number, HistoryMark[]>>();
const keptNodes = new Keep<WorldState["nodes"], NodeView[]>();
let keptFrozen: string[] = [];
let lastFrames: FrameCache | null = null; // the last step's cache: the encodings of the sections that stand, and the bodies' splits
const NO_FAILED: FailedPassing[] = [];

const nodeView = (n: YieldNode, now: number): NodeView => ({ ...n, safe: n.announcedUntil > now });

export function stepViews(w: WorldState): StepViews {
  const now = w.now;

  const players = new Map<string, PublicPlayer>();
  for (const o of w.players.values()) players.set(o.id, publicPlayer(o, now));

  const enemies: StepViews["enemies"] = [];
  for (const e of w.enemies) if (e.state !== "dead") enemies.push({ e, view: enemyView(e) });

  // A node's `safe` flips when its announcement lapses: the kept views stand while every flag still reads the same.
  let nodes = keptNodes.get(w.nodes, list => list.map(n => nodeView(n, now)));
  if (nodes.some((v, i) => v.safe !== (w.nodes[i].announcedUntil > now))) nodes = keptNodes.set(w.nodes, w.nodes.map(n => nodeView(n, now)));

  const frozen = Object.entries(w.frozen).filter(([, until]) => until > now).map(([d]) => d);
  if (!sameList(frozen, keptFrozen)) keptFrozen = frozen;

  const bySerial = keptHistory.get(w.history, () => new Map<number, HistoryMark[]>());
  const historyFor = (serial: number): HistoryMark[] => {
    let marks = bySerial.get(serial);
    if (!marks) {
      marks = w.history.filter(m => m.serial === serial);
      bySerial.set(serial, marks);
    }
    return marks;
  };

  const frames = newFrameCache(lastFrames); // a body whose roster fields stand keeps its roster entry from the last step
  const shared: StepViews = {
    players,
    enemies,
    nodes,
    pois: keptPois.get(w.pois, pois => Object.entries(pois).map(([id, s]) => ({ id, state: s.state, count: s.count }))),
    frozen: keptFrozen,
    // The city's own listings stand first, whatever else is up: a price to watch, never pushed off the board by prints.
    market: keptMarket.get(w.market, market => [
      ...market.filter(l => l.sellerId === CITY_SELLER),
      ...market.filter(l => l.sellerId !== CITY_SELLER).slice(-MARKET_TOP).reverse(),
    ]),
    news: keptNews.get(w.news, news => news.map(n => n.text)),
    clearing: keptClearing.get(w.clearing, c => ({ open: c.open, reserve: c.reserve, contest: c.contest, lastOutcome: c.lastOutcome, dwellers: c.heldBy.length })),
    passing: keptPassing.get(w.passing, () => new Keep()).get(w.season.id, season => ({ ...w.passing, season })),
    historyFor,
    frames,
  };
  // A section that stood since the last step keeps its encoding too.
  if (lastFrames) {
    for (const o of [shared.pois, shared.frozen, shared.market, shared.news, shared.clearing, shared.passing, w.houses, w.failed, NO_FAILED] as object[]) {
      const s = lastFrames.fragments.get(o);
      if (s !== undefined) frames.fragments.set(o, s);
    }
  }
  lastFrames = frames;
  return shared;
}

// ---------------------------------------------------------------- the snapshot

/**
 * The viewer's side of one step, in two parts. The fast part is what moves
 * every step: the bodies and enemies in the area of interest, where each
 * person stands for this viewer, and the prompt. The slow part is the rest:
 * the persons with their offers, the nodes, the wreckage, the graves, the
 * marks, the objectives, and the Ruin kit's readout; it is built only when
 * a slow frame is due (`framesFor`), or for a whole `Snap`.
 */
type ViewerFast = {
  ctx: Ctx;
  step: StepViews;
  near: (x: number, y: number) => boolean;
  players: PublicPlayer[];
  enemies: EnemyView[];
  npcs: NpcState[];
  prompt: Prompt | null;
};

type ViewerSlow = {
  npcs: NpcView[];
  nodes: NodeView[];
  wreckage: WreckageView[];
  graves: WorldState["graves"];
  history: HistoryMark[];
  failed: FailedPassing[];
  objective: Snap["objective"];
  sideObjectives: Snap["sideObjectives"];
  kitReadout?: string[];
};

function viewerFast(w: WorldState, viewerId: string, step: StepViews): ViewerFast {
  const p = w.players.get(viewerId);
  if (!p) throw new Error(`snapshotFor: unknown viewer ${viewerId}`);
  const now = w.now;
  const ctx: Ctx = { w, p, now };
  const r2 = AOI_RADIUS * AOI_RADIUS;
  const near = (x: number, y: number) => d2(p.x, p.y, x, y) <= r2;

  const players: PublicPlayer[] = [];
  for (const o of w.players.values()) {
    if (o.id === p.id || !near(o.x, o.y)) continue;
    // A body the step's map does not know was put into the world after its views were built; it is still drawn.
    players.push(step.players.get(o.id) ?? publicPlayer(o, now));
  }

  const enemies: EnemyView[] = [];
  for (const { e, view } of step.enemies) if (near(e.x, e.y)) enemies.push(view);

  const npcs = npcStatesFor(ctx);
  return { ctx, step, near, players, enemies, npcs, prompt: promptFor(ctx, npcs) };
}

function viewerSlow(fast: ViewerFast): ViewerSlow {
  const { ctx, step, near } = fast;
  const { w, p, now } = ctx;

  const cybernetic = kitActive(p, "cybernetic", now);
  const nodes: NodeView[] = [];
  w.nodes.forEach((n, i) => {
    if (!near(n.x, n.y)) return;
    nodes.push(cybernetic ? { ...step.nodes[i], yieldHint: nodeYield(w, p, n), chargesHint: n.charges } : step.nodes[i]);
  });

  const facing = kitActive(p, "ruin", now); // the Ruin-angel kit reads the written-back log: theirs and the fallen's
  const wreckage: WreckageView[] = [];
  for (const r of visibleWreckage(w, p)) {
    if (!near(r.x, r.y)) continue;
    const view: WreckageView = {
      id: r.id, x: r.x, y: r.y, district: r.district, fromName: r.fromName, fromSerial: r.fromSerial, buried: r.buried, looted: r.looted, until: r.until,
      yours: r.fromId === p.id,
    };
    if (!p.guest) view.bestand = r.bestand;
    if (facing && r.fromHistory && r.fromSerial !== null) view.passings = r.fromHistory.passings;
    wreckage.push(view);
  }

  const history = p.serial === null ? step.historyFor(-1) : step.historyFor(p.serial);
  const seesFailed = !p.guest && (p.messenger === "ruin" || p.stance === "storm" || p.house === "sky");
  const graves = w.graves.filter(g => near(g.x, g.y));

  const out: ViewerSlow = {
    npcs: fast.npcs.map(state => npcViewOf(ctx, state)),
    nodes,
    wreckage,
    graves: graves.length === w.graves.length ? w.graves : graves,
    history,
    failed: seesFailed ? w.failed : NO_FAILED,
    objective: objectiveFor(ctx),
    sideObjectives: sideObjectivesFor(ctx),
  };
  if (facing) out.kitReadout = kitReadout(p, history.map(m => m.line));
  return out;
}

/** The slow sections of the viewer's snapshot, in the protocol's order. */
function sectionsOf(fast: ViewerFast, slow: ViewerSlow): Pick<Snap, SlowKey> {
  const { w, p } = fast.ctx;
  const shared = fast.step;
  return {
    gestell: w.gestell,
    weather: WEATHER_LABEL[weatherBand(w.gestell)],
    weatherNamed: w.weatherNamed,
    frozen: shared.frozen,
    district: p.district,
    npcs: slow.npcs,
    nodes: slow.nodes,
    wreckage: slow.wreckage,
    graves: slow.graves,
    pois: shared.pois,
    history: slow.history,
    failed: slow.failed,
    houses: w.houses,
    clearing: shared.clearing,
    passing: shared.passing,
    market: shared.market,
    news: shared.news,
    objective: slow.objective,
    sideObjectives: slow.sideObjectives,
    notices: p.notices,
  };
}

/** The viewer's own record as they may see it: Winke never leave for a guest, whatever content did. The record itself when nothing has to be hidden. */
function youOf(p: Player): YouView {
  if (!p.guest || (!p.wink && !p.dialogue?.wink)) return p;
  return { ...p, wink: "", dialogue: p.dialogue ? { ...p.dialogue, wink: "" } : null };
}

/** The viewer's snapshot. `step` is the views this step shares; the server passes one for every viewer of a broadcast. */
export function snapshotFor(w: WorldState, viewerId: string, step: StepViews = stepViews(w)): Snap {
  const fast = viewerFast(w, viewerId, step);
  const slow = viewerSlow(fast);
  const p = fast.ctx.p;
  // The wire's `you` never carries what the snapshot has a section for (the notices); the frames leave it out the same way.
  let you: YouView = { ...youOf(p) };
  for (const k of YOU_OFF_WIRE) delete you[k];
  if (slow.kitReadout) you = { ...you, kitReadout: slow.kitReadout };
  return {
    t: "snap",
    v: PROTOCOL_VERSION,
    now: w.now,
    tick: w.tick,
    you,
    players: fast.players,
    enemies: fast.enemies,
    prompt: fast.prompt,
    ...sectionsOf(fast, slow),
  };
}

export type ViewerFrames = { fast: FastFrame; slow: () => SlowFrame };

/**
 * The viewer's frames for one step: the fast frame now, the slow frame when
 * asked for. The object asks only when a slow frame is due (every fifth
 * step, after an action, for a new socket, or when the bodies in view
 * changed), so on the steps between, the viewer's slow side (the persons'
 * offers, the nodes, the wreckage, the marks, the objectives) is not built
 * at all. The frames are what `splitSnap(snapshotFor(...))` gives, byte for
 * byte, with every body's split and fragment from the step's cache.
 */
export function framesFor(w: WorldState, viewerId: string, step: StepViews = stepViews(w)): ViewerFrames {
  const view = viewerFast(w, viewerId, step);
  const split = view.players.map(pub => splitPlayer(pub, step.frames));
  // `you` in two as `splitYou` does, but in one native copy with the slow keys (and what never rides) left in as `undefined`,
  // which JSON leaves out: the frame's bytes are the same and the copy costs half. `mergeFrames` skips them too.
  const record = youOf(view.ctx.p) as unknown as Record<string, unknown>;
  const youFast = { ...record };
  const youSlow: Record<string, unknown> = {};
  for (const k of YOU_SLOW_KEYS) {
    if (!(k in record)) continue;
    youSlow[k] = record[k];
    youFast[k] = undefined;
  }
  for (const k of YOU_OFF_WIRE) youFast[k] = undefined;
  const fast: FastFrame = {
    t: "fast",
    v: PROTOCOL_VERSION,
    now: w.now,
    tick: w.tick,
    you: youFast as unknown as YouView,
    players: split.map(s => s.motion),
    enemies: view.enemies,
    prompt: view.prompt,
  };
  const slow = (): SlowFrame => {
    const rest = viewerSlow(view);
    return {
      t: "slow",
      v: PROTOCOL_VERSION,
      ...sectionsOf(view, rest),
      roster: split.map(s => s.roster),
      youSlow: (rest.kitReadout ? { ...youSlow, kitReadout: rest.kitReadout } : youSlow) as YouSlow,
    };
  };
  return { fast, slow };
}
