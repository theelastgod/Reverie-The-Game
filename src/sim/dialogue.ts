/**
 * The dialogue engine: open a node, choose, close. Nodes are authored data;
 * their effects go through effects.ts. A Wink is resolved here but shown only
 * by the rules in world.wink: never to a guest, never to a dark aura or a
 * spent restraint.
 */
import { AURA_DIM, RESTRAINT_WINK_MIN } from "./constants";
import { NPCS } from "./content";
import type { Ctx, DialogueChoiceView, DialogueNode, DialogueView, NpcDef, Player, WorldState } from "./types";
import { wink } from "./world";
import { applyEffects } from "./effects";
import { npcView } from "./snapshot";

export const TALK_REACH = 72;

function setPlayer(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}

function text(ctx: Ctx, value: string | ((ctx: Ctx) => string) | undefined): string {
  if (value === undefined) return "";
  return typeof value === "function" ? value(ctx) : value;
}

/** True when this player may be shown a private line right now. */
function canSeeWink(p: Player): boolean {
  return !p.guest && p.aura >= AURA_DIM && p.restraint >= RESTRAINT_WINK_MIN;
}

function visibleChoices(ctx: Ctx, node: DialogueNode): DialogueChoiceView[] {
  return (node.choices ?? []).filter(c => !c.when || c.when(ctx)).map(c => ({ id: c.id, label: c.label }));
}

function nodeOf(p: Player): { def: NpcDef; node: DialogueNode } | null {
  if (!p.dialogue) return null;
  const def = NPCS[p.dialogue.npc];
  const node = def?.nodes[p.dialogue.node];
  return def && node ? { def, node } : null;
}

/** Speak to an NPC who is present for this viewer and within reach. Opens the NPC's entry node. */
export function applyTalk(w: WorldState, id: string, npcId: string): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead) return w;
  const def = NPCS[npcId];
  const shared = w.npcs[npcId];
  if (!def || !shared) return w;
  const ctx: Ctx = { w, p, now: w.now };
  const view = npcView(ctx, shared);
  if (!view) return w;
  const dx = view.x - p.x;
  const dy = view.y - p.y;
  if (dx * dx + dy * dy > TALK_REACH * TALK_REACH) return w;
  return openNode(w, id, npcId, def.entry(ctx));
}

/**
 * Opens a node: text, Wink and choices are resolved against the state before
 * the node's effects run; the effects run once per opening; the view is then
 * set on the player as they stand after those effects.
 */
export function openNode(w: WorldState, id: string, npcId: string, nodeId: string): WorldState {
  const p = w.players.get(id);
  if (!p) return w;
  const def = NPCS[npcId];
  const node = def?.nodes[nodeId];
  if (!def || !node) return w;
  const ctx: Ctx = { w, p, now: w.now };

  const speakerDef = node.speaker ? NPCS[node.speaker] ?? def : def;
  const winkText = canSeeWink(p) ? text(ctx, node.wink) : "";
  const view: DialogueView = {
    npc: npcId,
    node: nodeId,
    speaker: speakerDef.name,
    portrait: speakerDef.portrait,
    text: text(ctx, node.text),
    wink: winkText,
    choices: visibleChoices(ctx, node),
  };

  let cur = applyEffects(w, id, node.effects);
  const after = cur.players.get(id);
  if (!after) return cur;
  let me: Player = { ...after, dialogue: view };
  if (winkText) me = wink(me, winkText, cur.now);
  return setPlayer(cur, me);
}

/** Picks a visible choice: its effects, then its next node, or the dialogue closes. */
export function applyChoose(w: WorldState, id: string, choiceId: string): WorldState {
  const p = w.players.get(id);
  if (!p || !p.dialogue) return w;
  const open = nodeOf(p);
  if (!open) return setPlayer(w, { ...p, dialogue: null });
  const ctx: Ctx = { w, p, now: w.now };
  const choice = (open.node.choices ?? []).find(c => c.id === choiceId && (!c.when || c.when(ctx)));
  if (!choice) return w;
  const npcId = p.dialogue.npc;
  let cur = applyEffects(w, id, choice.effects);
  if (choice.next) return openNode(cur, id, npcId, choice.next);
  const after = cur.players.get(id);
  if (after && after.dialogue) cur = setPlayer(cur, { ...after, dialogue: null });
  return cur;
}

/** Continue: a node without choices follows its `next`; anything else closes. */
export function applyClose(w: WorldState, id: string): WorldState {
  const p = w.players.get(id);
  if (!p || !p.dialogue) return w;
  const open = nodeOf(p);
  if (open && p.dialogue.choices.length === 0) {
    const ctx: Ctx = { w, p, now: w.now };
    const next = typeof open.node.next === "function" ? open.node.next(ctx) : open.node.next;
    if (next && open.def.nodes[next]) return openNode(w, id, p.dialogue.npc, next);
  }
  return setPlayer(w, { ...p, dialogue: null });
}
