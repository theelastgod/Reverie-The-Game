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
import { PROTOCOL_VERSION, WEATHER_LABEL, weatherBand, type NodeView, type NpcView, type PoiView, type PublicPlayer, type Snap, type WreckageView, type YouView } from "./protocol";
import type { Ctx, NpcState, Player, Prompt, Wreckage, WorldState } from "./types";
import { nodeYield } from "./economy";
import { perception } from "./houses";
import { objectiveFor, sideObjectivesFor } from "./quests";
import { NODE_REACH, NPC_REACH, PLAYER_REACH, POI_REACH, WRECKAGE_REACH, verbsFor } from "./interact";

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
  return {
    id: p.id,
    name: p.name,
    x: p.x,
    y: p.y,
    facing: p.facing,
    district: p.district,
    guest: p.guest,
    locked: p.locked,
    house: p.house,
    messenger: p.messenger,
    hpFrac: Math.max(0, Math.min(1, p.hp / MAX_HP)),
    dead: p.dead,
    dodgeT: p.dodgeT,
    stance: p.stance,
    flagged: p.flagged,
    truce: p.truceUntil > now,
    auraTier,
    kit: p.kit && p.kit.until > now ? p.kit.verb : "",
    heavyWindup: p.heavyWindup,
    hitStop: p.hitStop,
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
  return { ...merged, name: def.name, role: def.role, sprite: def.sprite, party: ctx.p.party[npc.id] ?? "none" };
}

/** Wreckage this viewer can see: until, plus the House / messenger bonus, plus the storm; a Witness blitz shows all. */
export function visibleWreckage(w: WorldState, p: Player): Wreckage[] {
  if (kitActive(p, "witness", w.now)) return w.wreckage;
  const bonus = perception(p).wreckageBonus + (!p.guest && p.stance === "storm" ? WRECKAGE_TTL_BONUS : 0);
  return w.wreckage.filter(r => r.until + bonus > w.now);
}

// ---------------------------------------------------------------- prompt

type Candidate = { d: number; prompt: Prompt };

/** The nearest interactable thing and its keys. POIs without an available verb are skipped. */
export function promptFor(ctx: Ctx): Prompt | null {
  const { w, p } = ctx;
  let best: Candidate | null = null;
  const offer = (d: number, prompt: Prompt) => {
    if (prompt.verbs.length === 0) return;
    if (!best || d < best.d) best = { d, prompt };
  };

  for (const npc of Object.values(w.npcs)) {
    const view = npcView(ctx, npc);
    if (!view) continue;
    const d = d2(p.x, p.y, view.x, view.y);
    if (d <= NPC_REACH * NPC_REACH) offer(d, { targetId: npc.id, targetKind: "npc", name: view.name, verbs: verbsFor(ctx, npc.id) });
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

// ---------------------------------------------------------------- the snapshot

export function snapshotFor(w: WorldState, viewerId: string): Snap {
  const p = w.players.get(viewerId);
  if (!p) throw new Error(`snapshotFor: unknown viewer ${viewerId}`);
  const now = w.now;
  const ctx: Ctx = { w, p, now };
  const r2 = AOI_RADIUS * AOI_RADIUS;
  const near = (x: number, y: number) => d2(p.x, p.y, x, y) <= r2;

  const players: PublicPlayer[] = [];
  for (const o of w.players.values()) {
    if (o.id === p.id || !near(o.x, o.y)) continue;
    players.push(publicPlayer(o, now));
  }

  const npcs: NpcView[] = [];
  for (const npc of Object.values(w.npcs)) {
    const view = npcView(ctx, npc);
    if (view) npcs.push(view);
  }

  const cybernetic = kitActive(p, "cybernetic", now);
  const nodes: NodeView[] = [];
  for (const n of w.nodes) {
    if (!near(n.x, n.y)) continue;
    const view: NodeView = { ...n, safe: n.announcedUntil > now };
    if (cybernetic) {
      view.yieldHint = nodeYield(w, p, n);
      view.chargesHint = n.charges;
    }
    nodes.push(view);
  }

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

  const pois: PoiView[] = Object.entries(w.pois).map(([id, s]) => ({ id, state: s.state, count: s.count }));
  const history = p.serial === null ? [] : w.history.filter(m => m.serial === p.serial);
  const seesFailed = !p.guest && (p.messenger === "ruin" || p.stance === "storm" || p.house === "sky");
  const failed = seesFailed ? w.failed : [];
  const frozen = Object.entries(w.frozen).filter(([, until]) => until > now).map(([d]) => d);

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
    frozen,
    district: p.district,
    you,
    players,
    enemies: w.enemies.filter(e => e.state !== "dead" && near(e.x, e.y)),
    npcs,
    nodes,
    wreckage,
    graves: w.graves.filter(g => near(g.x, g.y)),
    pois,
    history,
    failed,
    houses: w.houses,
    clearing: { open: w.clearing.open, reserve: w.clearing.reserve, contest: w.clearing.contest, lastOutcome: w.clearing.lastOutcome, dwellers: w.clearing.heldBy.length },
    passing: { ...w.passing, season: w.season.id },
    market: w.market.slice(-MARKET_TOP).reverse(),
    news: w.news.map(n => n.text),
    prompt: promptFor(ctx),
    objective: objectiveFor(ctx),
    sideObjectives: sideObjectivesFor(ctx),
    notices: p.notices,
  };
}
