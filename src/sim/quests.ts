/**
 * The quest engine. Quests are authored data with predicates; this module
 * starts them, walks their steps, applies their effects through effects.ts
 * and turns the current step into a journal objective with a bearing target.
 */
import { POSITIONS } from "./map";
import { QUESTS as CONTENT_QUESTS } from "./content";
import type { Ctx, Objective, Player, Quest, QuestStep, WorldState } from "./types";
import { applyEffects } from "./effects";
import { npcView } from "./snapshot";

const MAX_ADVANCES = 8;

export const QUESTS: Quest[] = CONTENT_QUESTS;

/** Spine quests in movement order. */
function spine(): Quest[] {
  return QUESTS.filter(q => q.kind === "spine").sort((a, b) => a.movement - b.movement);
}

export function questById(id: string): Quest | undefined {
  return QUESTS.find(q => q.id === id);
}

export function questProgress(p: Player, id: string): { started: boolean; step: number; done: boolean } {
  const q = questById(id);
  const step = p.quests[id];
  if (step === undefined) return { started: false, step: 0, done: false };
  return { started: true, step, done: !!q && step >= q.steps.length };
}

function finished(p: Player, q: Quest): boolean {
  const step = p.quests[q.id];
  return step !== undefined && step >= q.steps.length;
}

function setStep(w: WorldState, id: string, questId: string, step: number): WorldState {
  const p = w.players.get(id);
  if (!p) return w;
  const players = new Map(w.players);
  players.set(id, { ...p, quests: { ...p.quests, [questId]: step } });
  return { ...w, players };
}

// ---------------------------------------------------------------- transitions

/** Starts a quest for a player (no-op when already started or unknown) and applies onStart. */
export function startQuest(w: WorldState, id: string, questId: string): WorldState {
  const q = questById(questId);
  const p = w.players.get(id);
  if (!q || !p || p.quests[questId] !== undefined) return w;
  let cur = setStep(w, id, questId, 0);
  cur = applyEffects(cur, id, q.onStart);
  // A quest with no steps finishes as it starts.
  if (q.steps.length === 0) cur = applyEffects(cur, id, q.onFinish);
  return cur;
}

/** Completes the current step: onComplete, then the next step; onFinish once when the steps run out. */
export function advanceQuest(w: WorldState, id: string, questId: string): WorldState {
  const q = questById(questId);
  const p = w.players.get(id);
  if (!q || !p) return w;
  const step = p.quests[questId];
  if (step === undefined || step >= q.steps.length) return w;
  let cur = applyEffects(w, id, q.steps[step].onComplete);
  const next = step + 1;
  cur = setStep(cur, id, questId, next);
  if (next >= q.steps.length) cur = applyEffects(cur, id, q.onFinish);
  return cur;
}

/** Marks a quest finished (starting it first if needed) and applies onFinish once. Skipped steps do not fire onComplete. */
export function completeQuest(w: WorldState, id: string, questId: string): WorldState {
  const q = questById(questId);
  const p = w.players.get(id);
  if (!q || !p) return w;
  if (finished(p, q)) return w;
  let cur = w;
  if (p.quests[questId] === undefined) {
    cur = setStep(cur, id, questId, 0);
    cur = applyEffects(cur, id, q.onStart);
    const after = cur.players.get(id);
    if (!after || finished(after, q)) return cur;
  }
  cur = setStep(cur, id, questId, q.steps.length);
  return applyEffects(cur, id, q.onFinish);
}

// ---------------------------------------------------------------- the tick

function canStart(ctx: Ctx, q: Quest, order: Quest[]): boolean {
  const p = ctx.p;
  if (p.quests[q.id] !== undefined) return false;
  if (p.locked) return false;
  if (p.guest && !q.guestLegal) return false;
  if (q.kind === "spine") {
    if (p.movement !== q.movement) return false;
    const i = order.indexOf(q);
    if (i > 0 && !finished(p, order[i - 1])) return false;
  }
  return q.available(ctx);
}

/**
 * One player's quests for one tick: start what is available, complete what
 * is done. Every change re-reads the player so predicates see fresh state;
 * at most MAX_ADVANCES changes per call keep the tick bounded.
 */
export function tickQuests(w: WorldState, id: string): WorldState {
  let cur = w;
  let advances = 0;
  const order = spine();
  while (advances < MAX_ADVANCES) {
    const p = cur.players.get(id);
    if (!p) return cur;
    const ctx: Ctx = { w: cur, p, now: cur.now };
    let changed = false;

    for (const q of QUESTS) {
      if (!canStart(ctx, q, order)) continue;
      cur = startQuest(cur, id, q.id);
      changed = true;
      break;
    }
    if (!changed) {
      for (const q of QUESTS) {
        const step = p.quests[q.id];
        if (step === undefined || step >= q.steps.length) continue;
        if (!q.steps[step].done(ctx)) continue;
        cur = advanceQuest(cur, id, q.id);
        changed = true;
        break;
      }
    }
    if (!changed) break;
    advances++;
  }
  return cur;
}

// ---------------------------------------------------------------- objectives

function resolveTarget(ctx: Ctx, target: QuestStep["target"]): Objective["target"] {
  const id = typeof target === "function" ? target(ctx) : target;
  if (!id) return null;
  const pos = POSITIONS[id];
  if (pos) {
    // A named NPC home follows the person, not the map, when the viewer sees them elsewhere.
    if (id.startsWith("home:")) {
      const npcId = id.slice(5);
      const shared = ctx.w.npcs[npcId];
      const view = shared ? npcView(ctx, shared) : null;
      if (view) return { x: view.x, y: view.y, district: view.district };
    }
    return { x: pos.x, y: pos.y, district: pos.district };
  }
  const shared = ctx.w.npcs[id];
  if (shared) {
    const view = npcView(ctx, shared);
    if (view) return { x: view.x, y: view.y, district: view.district };
    const home = POSITIONS[`home:${id}`];
    return home ? { x: home.x, y: home.y, district: home.district } : null;
  }
  return null;
}

function objectiveOf(ctx: Ctx, q: Quest, step: QuestStep): Objective {
  return {
    quest: q.id,
    step: step.id,
    title: step.title,
    detail: typeof step.detail === "function" ? step.detail(ctx) : step.detail,
    target: resolveTarget(ctx, step.target),
    plate: step.plate ?? "",
    movement: q.movement,
  };
}

export function activeQuests(ctx: Ctx): { quest: Quest; step: QuestStep }[] {
  const out: { quest: Quest; step: QuestStep }[] = [];
  const p = ctx.p;
  for (const q of spine()) {
    const s = p.quests[q.id];
    if (s !== undefined && s < q.steps.length) out.push({ quest: q, step: q.steps[s] });
  }
  for (const questId of Object.keys(p.quests)) {
    const q = questById(questId);
    if (!q || q.kind !== "side") continue;
    const s = p.quests[questId];
    if (s < q.steps.length) out.push({ quest: q, step: q.steps[s] });
  }
  return out;
}

/** The current spine step, else the most recently started side quest's step. */
export function objectiveFor(ctx: Ctx): Objective | null {
  const p = ctx.p;
  for (const q of spine()) {
    const s = p.quests[q.id];
    if (s !== undefined && s < q.steps.length) return objectiveOf(ctx, q, q.steps[s]);
  }
  const started = Object.keys(p.quests);
  for (let i = started.length - 1; i >= 0; i--) {
    const q = questById(started[i]);
    if (!q || q.kind !== "side") continue;
    const s = p.quests[q.id];
    if (s < q.steps.length) return objectiveOf(ctx, q, q.steps[s]);
  }
  return null;
}
