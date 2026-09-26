/**
 * Interaction: F / E / Q over the nearest thing. A target is a POI (authored
 * verbs), a yield node, a wreckage or an NPC. Verbs are looked up by the
 * choice string the client sends; the server decides reach, guest policy,
 * cost, once-flags and which module owns the outcome.
 */
import { DISTRICT_BY_ID, POSITIONS, nearPoint } from "./map";
import { LINES, NPCS, POI_CONFIGS } from "./content";
import type { Ctx, Player, PoiConfig, PoiVerb, PromptVerb, WorldState, Wreckage, YieldNode } from "./types";
import { say } from "./world";
import { applyNode, applyClaims, applyForge, spend } from "./economy";
import { applyBounty, applyTithe } from "./houses";
import { applyPassing } from "./clearing";
import { applyDuel, duelBlockReason } from "./combat";
import { applyEffects } from "./effects";
import { applyTalk } from "./dialogue";
import { visibleWreckage } from "./snapshot";

export const POI_REACH = 56;
export const NODE_REACH = 56;
export const WRECKAGE_REACH = 64;
export const NPC_REACH = 72;
export const PLAYER_REACH = 96;

const HALLS = new Set(["hall-mortals", "hall-sky", "hall-divinities", "hall-earth"]);

function setPlayer(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}

function speak(w: WorldState, p: Player, text: string): WorldState {
  return setPlayer(w, say(p, text, w.now));
}

function isFrozen(w: WorldState, district: string): boolean {
  return (w.frozen[district] ?? 0) > w.now;
}

function verbAvailable(ctx: Ctx, v: PoiVerb): boolean {
  if (v.once && (ctx.p.flags[v.once] ?? 0) > 0) return false;
  if (v.when && !v.when(ctx)) return false;
  return true;
}

/** Special routing the content relies on: these verbs carry no effects; a module owns them. */
function route(w: WorldState, id: string, targetId: string, choice: string): WorldState | null {
  if (targetId === "claims-desk" && (choice === "file" || choice === "bank" || choice === "take")) return applyClaims(w, id, choice);
  if (HALLS.has(targetId) && choice === "tithe") return applyTithe(w, id);
  if (HALLS.has(targetId) && choice === "bounty") return applyBounty(w, id);
  if (targetId === "forge-tray" && (choice === "craft" || choice === "spot" || choice === "sell")) return applyForge(w, id, choice);
  if (targetId === "clearing-ring" && choice === "pass") return applyPassing(w, id);
  return null;
}

function interactPoi(w: WorldState, p: Player, cfg: PoiConfig, choice: string): WorldState {
  const pos = POSITIONS[cfg.id];
  if (!pos || !nearPoint(p.x, p.y, pos.x, pos.y, cfg.reach ?? POI_REACH)) return w;
  const ctx: Ctx = { w, p, now: w.now };
  const verb = cfg.verbs.find(v => v.choice === choice && (!v.when || v.when(ctx)));
  if (!verb) return w;

  if (p.guest) {
    const policy = verb.guest ?? "allow";
    if (policy === "deny") return speak(w, p, LINES.GUEST_LOCK);
    if (policy === "spectate") return speak(w, p, LINES.SPECTATOR);
  }
  if (verb.once && (p.flags[verb.once] ?? 0) > 0) return speak(w, p, LINES.ALREADY);

  // A verb on the world closes whatever conversation was left open; a decision made at a desk cannot be made again in a stale window.
  const closed: WorldState = p.dialogue ? setPlayer(w, { ...p, dialogue: null }) : w;
  const routed = route(closed, p.id, cfg.id, choice);
  let cur: WorldState;
  if (routed) {
    cur = routed;
  } else {
    if (verb.cost && verb.cost.bestand > 0) {
      const paid = spend(closed, p.id, verb.cost.bestand, verb.cost.sink);
      if (!paid) return speak(w, p, LINES.CANT_AFFORD);
      cur = paid;
    } else {
      cur = closed;
    }
  }

  if (verb.once) {
    const me = cur.players.get(p.id);
    if (me) cur = setPlayer(cur, { ...me, flags: { ...me.flags, [verb.once]: 1 } });
  }
  cur = applyEffects(cur, p.id, verb.effects);
  if (!routed && verb.say !== undefined) {
    const me = cur.players.get(p.id);
    if (me) {
      const line = typeof verb.say === "function" ? verb.say({ w: cur, p: me, now: cur.now }) : verb.say;
      cur = speak(cur, me, line);
    }
  }
  return cur;
}

export function applyInteract(w: WorldState, id: string, targetId: string, choice: string): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead) return w;

  if (NPCS[targetId] && w.npcs[targetId]) {
    return choice === "talk" ? applyTalk(w, id, targetId) : w;
  }

  const node = w.nodes.find(n => n.id === targetId);
  if (node) {
    if (choice !== "extract" && choice !== "keep") return w;
    if (p.locked) return speak(w, p, LINES.GUEST_LOCK);
    return applyNode(w, id, targetId, choice);
  }

  const wreck = w.wreckage.find(r => r.id === targetId);
  if (wreck) {
    if (choice !== "bury" && choice !== "loot") return w;
    if (p.locked || (choice === "loot" && p.guest)) return speak(w, p, LINES.GUEST_LOCK);
    return applyEffects(w, id, [{ kind: "wreckage", op: choice, id: targetId }]);
  }

  const other = w.players.get(targetId);
  if (other && other.id !== id) {
    return choice === "duel" ? applyDuel(w, id, targetId) : w;
  }

  const cfg = POI_CONFIGS[targetId];
  if (cfg) return interactPoi(w, p, cfg, choice);
  return w;
}

/** The verbs a prompt may show for a target right now. Denied verbs are omitted for guests; spectated ones still show and refuse. */
// ---------------------------------------------------------------- the verbs a thing offers this viewer

const SPEAK: PromptVerb[] = [{ key: "F", label: "Speak", choice: "talk" }];

/** A person who is present: speak. */
export const npcVerbs = (): PromptVerb[] => SPEAK.slice();

export function nodeVerbs(ctx: Ctx, node: YieldNode): PromptVerb[] {
  const { w, p } = ctx;
  if (isFrozen(w, node.district) || p.locked) return [];
  const out: PromptVerb[] = [];
  if (node.charges > 0) out.push({ key: "E", label: "Extract", choice: "extract" });
  if (!node.kept) out.push({ key: "Q", label: "Keep", choice: "keep" });
  return out;
}

export function wreckageVerbs(ctx: Ctx, wreck: Wreckage): PromptVerb[] {
  const { w, p } = ctx;
  if (wreck.buried || p.locked || !visibleWreckage(w, p).some(r => r.id === wreck.id)) return [];
  const out: PromptVerb[] = [{ key: "F", label: "Bury", choice: "bury" }];
  if (!p.guest && !wreck.looted && (wreck.bestand > 0 || wreck.items.length > 0)) out.push({ key: "E", label: "Loot", choice: "loot" });
  return out;
}

/** Another body: a Ruin duel, the flag, a truce. Nothing between guests, the locked or the fallen. */
export function playerVerbs(ctx: Ctx, other: Player): PromptVerb[] {
  const { w, p } = ctx;
  if (other.id === p.id || p.guest || p.locked || other.guest || other.locked || other.dead) return [];
  const out: PromptVerb[] = [];
  if (!duelBlockReason(p, other, w)) {
    const offered = !!other.duel && !other.duel.accepted && other.duel.with === p.id && other.duel.until > w.now;
    out.push({ key: "F", label: offered ? "Answer the duel" : "Ruin duel", choice: "duel" });
  }
  if (DISTRICT_BY_ID[p.district].flagLegal && p.truceUntil <= w.now) out.push({ key: "V", label: p.flagged ? "Unflag" : "Flag", choice: "flag" });
  if (p.flagged && other.flagged) out.push({ key: "T", label: "Truce", choice: "truce" });
  return out;
}

/** A POI's authored verbs that are available to this viewer, the first per key. */
export function poiVerbs(ctx: Ctx, cfg: PoiConfig): PromptVerb[] {
  const out: PromptVerb[] = [];
  const taken = new Set<string>();
  for (const v of cfg.verbs) {
    if (taken.has(v.key)) continue;
    if (!verbAvailable(ctx, v)) continue;
    if (ctx.p.guest && (v.guest ?? "allow") === "deny") continue;
    taken.add(v.key);
    out.push({ key: v.key, label: v.label, choice: v.choice });
  }
  return out;
}

/** The verbs of a thing by its id, whatever kind it is; the prompt, which knows the kind, calls the kind's own. */
export function verbsFor(ctx: Ctx, targetId: string): PromptVerb[] {
  const { w } = ctx;
  if (NPCS[targetId] && w.npcs[targetId]) return npcVerbs();
  const node = w.nodes.find(n => n.id === targetId);
  if (node) return nodeVerbs(ctx, node);
  const wreck = w.wreckage.find(r => r.id === targetId);
  if (wreck) return wreckageVerbs(ctx, wreck);
  const other = w.players.get(targetId);
  if (other) return playerVerbs(ctx, other);
  const cfg = POI_CONFIGS[targetId];
  return cfg ? poiVerbs(ctx, cfg) : [];
}
