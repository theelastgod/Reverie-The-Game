/**
 * Per-viewer snapshots. Everything the client draws comes from here: an area
 * of interest around the viewer, other bodies as public shapes, wreckage and
 * marks under the visibility rules, NPCs with personal overrides, the nearest
 * interaction and the journal objective. Winke never leave for a guest;
 * history marks go only to their owner; failed Passings only to Ruin-sight,
 * Storm stance or the House of Sky.
 */
import { AOI_RADIUS, AURA_DIM, AURA_PRESENT, MAX_HP, WRECKAGE_TTL_BONUS } from "./constants";
import { POSITIONS } from "./map";
import { NPCS, POI_CONFIGS } from "./content";
import { PROTOCOL_VERSION, WEATHER_LABEL, weatherBand, type EnemyView, type NodeView, type NpcView, type PoiView, type PublicPlayer, type Snap, type WreckageView, type YouView } from "./protocol";
import type { Ctx, Enemy, FailedPassing, HistoryMark, NpcState, Player, Prompt, Wreckage, WorldState, YieldNode } from "./types";
import { nodeYield } from "./economy";
import { perception } from "./houses";
import { npcOffers, objectiveFor, sideObjectivesFor } from "./quests";
import { NODE_REACH, NPC_REACH, PLAYER_REACH, POI_REACH, WRECKAGE_REACH, verbsFor } from "./interact";
import { newFrameCache, type FrameCache } from "./frames";

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

/** The NPC as this viewer sees them: the shared state under the authored personal override. Null when absent for them. */
export function npcView(ctx: Ctx, npc: NpcState): NpcView | null {
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
  if (!merged.present) return null;
  return { ...merged, name: def.name, role: def.role, sprite: def.sprite, party: ctx.p.party[npc.id] ?? "none", offers: npcOffers(ctx, def) };
}

/** Wreckage this viewer can see: until, plus the House / messenger bonus, plus the storm; a Witness blitz shows all. */
export function visibleWreckage(w: WorldState, p: Player): Wreckage[] {
  if (kitActive(p, "witness", w.now)) return w.wreckage;
  const bonus = perception(p).wreckageBonus + (!p.guest && p.stance === "storm" ? WRECKAGE_TTL_BONUS : 0);
  return w.wreckage.filter(r => r.until + bonus > w.now);
}

// ---------------------------------------------------------------- prompt

type Candidate = { d: number; prompt: Prompt };

/** The NPCs as this viewer sees them, present ones only. */
export function npcViews(ctx: Ctx): NpcView[] {
  const out: NpcView[] = [];
  for (const npc of Object.values(ctx.w.npcs)) {
    const view = npcView(ctx, npc);
    if (view) out.push(view);
  }
  return out;
}

/** The nearest interactable thing and its keys. POIs without an available verb are skipped. `npcs` are the viewer's own NPC views when the caller has them already. */
export function promptFor(ctx: Ctx, npcs: NpcView[] = npcViews(ctx)): Prompt | null {
  const { w, p } = ctx;
  let best: Candidate | null = null;
  const offer = (d: number, prompt: Prompt) => {
    if (prompt.verbs.length === 0) return;
    if (!best || d < best.d) best = { d, prompt };
  };

  for (const view of npcs) {
    const d = d2(p.x, p.y, view.x, view.y);
    if (d <= NPC_REACH * NPC_REACH) offer(d, { targetId: view.id, targetKind: "npc", name: view.name, verbs: verbsFor(ctx, view.id) });
  }

  for (const cfg of Object.values(POI_CONFIGS)) {
    const pos = POSITIONS[cfg.id];
    if (!pos) continue;
    const reach = cfg.reach ?? POI_REACH;
    const d = d2(p.x, p.y, pos.x, pos.y);
    if (d > reach * reach) continue;
    const name = typeof cfg.label === "function" ? cfg.label(ctx) : cfg.label;
    offer(d, { targetId: cfg.id, targetKind: "poi", name, verbs: verbsFor(ctx, cfg.id) });
  }

  for (const n of w.nodes) {
    const d = d2(p.x, p.y, n.x, n.y);
    if (d <= NODE_REACH * NODE_REACH) offer(d, { targetId: n.id, targetKind: "node", name: "Yield node", verbs: verbsFor(ctx, n.id) });
  }

  for (const r of visibleWreckage(w, p)) {
    if (r.buried) continue;
    const d = d2(p.x, p.y, r.x, r.y);
    if (d <= WRECKAGE_REACH * WRECKAGE_REACH) offer(d, { targetId: r.id, targetKind: "wreckage", name: `Wreckage · ${r.fromName}`, verbs: verbsFor(ctx, r.id) });
  }

  for (const o of w.players.values()) {
    if (o.id === p.id || o.dead) continue;
    const d = d2(p.x, p.y, o.x, o.y);
    if (d <= PLAYER_REACH * PLAYER_REACH) offer(d, { targetId: o.id, targetKind: "player", name: o.name, verbs: verbsFor(ctx, o.id) });
  }

  return best ? (best as Candidate).prompt : null;
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
let lastFragments: Map<object, string> | null = null; // the last step's encodings, for the sections that stand
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

  const frames = newFrameCache();
  const shared: StepViews = {
    players,
    enemies,
    nodes,
    pois: keptPois.get(w.pois, pois => Object.entries(pois).map(([id, s]) => ({ id, state: s.state, count: s.count }))),
    frozen: keptFrozen,
    market: keptMarket.get(w.market, market => market.slice(-MARKET_TOP).reverse()),
    news: keptNews.get(w.news, news => news.map(n => n.text)),
    clearing: keptClearing.get(w.clearing, c => ({ open: c.open, reserve: c.reserve, contest: c.contest, lastOutcome: c.lastOutcome, dwellers: c.heldBy.length })),
    passing: keptPassing.get(w.passing, () => new Keep()).get(w.season.id, season => ({ ...w.passing, season })),
    historyFor,
    frames,
  };
  // A section that stood since the last step keeps its encoding too.
  if (lastFragments) {
    for (const o of [shared.pois, shared.frozen, shared.market, shared.news, shared.clearing, shared.passing, w.houses, w.failed, NO_FAILED] as object[]) {
      const s = lastFragments.get(o);
      if (s !== undefined) frames.fragments.set(o, s);
    }
  }
  lastFragments = frames.fragments;
  return shared;
}

// ---------------------------------------------------------------- the snapshot

/** The viewer's snapshot. `step` is the views this step shares; the server passes one for every viewer of a broadcast. */
export function snapshotFor(w: WorldState, viewerId: string, step: StepViews = stepViews(w)): Snap {
  const p = w.players.get(viewerId);
  if (!p) throw new Error(`snapshotFor: unknown viewer ${viewerId}`);
  const now = w.now;
  const ctx: Ctx = { w, p, now };
  const r2 = AOI_RADIUS * AOI_RADIUS;
  const near = (x: number, y: number) => d2(p.x, p.y, x, y) <= r2;
  const shared = step;

  const players: PublicPlayer[] = [];
  for (const o of w.players.values()) {
    if (o.id === p.id || !near(o.x, o.y)) continue;
    // A body the step's map does not know was put into the world after its views were built; it is still drawn.
    players.push(shared.players.get(o.id) ?? publicPlayer(o, now));
  }

  const enemies: EnemyView[] = [];
  for (const { e, view } of shared.enemies) if (near(e.x, e.y)) enemies.push(view);

  const npcs = npcViews(ctx);

  const cybernetic = kitActive(p, "cybernetic", now);
  const nodes: NodeView[] = [];
  w.nodes.forEach((n, i) => {
    if (!near(n.x, n.y)) return;
    nodes.push(cybernetic ? { ...shared.nodes[i], yieldHint: nodeYield(w, p, n), chargesHint: n.charges } : shared.nodes[i]);
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

  const history = p.serial === null ? shared.historyFor(-1) : shared.historyFor(p.serial);
  const seesFailed = !p.guest && (p.messenger === "ruin" || p.stance === "storm" || p.house === "sky");
  const failed = seesFailed ? w.failed : NO_FAILED;
  const graves = w.graves.filter(g => near(g.x, g.y));

  // Winke never leave for a guest, whatever content did.
  let you: YouView = p.guest
    ? { ...p, wink: "", dialogue: p.dialogue ? { ...p.dialogue, wink: "" } : null }
    : p;
  if (facing) you = { ...you, kitReadout: kitReadout(p, history.map(m => m.line)) };

  return {
    t: "snap",
    v: PROTOCOL_VERSION,
    now,
    tick: w.tick,
    gestell: w.gestell,
    weather: WEATHER_LABEL[weatherBand(w.gestell)],
    weatherNamed: w.weatherNamed,
    frozen: shared.frozen,
    district: p.district,
    you,
    players,
    enemies,
    npcs,
    nodes,
    wreckage,
    graves: graves.length === w.graves.length ? w.graves : graves,
    pois: shared.pois,
    history,
    failed,
    houses: w.houses,
    clearing: shared.clearing,
    passing: shared.passing,
    market: shared.market,
    news: shared.news,
    prompt: promptFor(ctx, npcs),
    objective: objectiveFor(ctx),
    sideObjectives: sideObjectivesFor(ctx),
    notices: p.notices,
  };
}
