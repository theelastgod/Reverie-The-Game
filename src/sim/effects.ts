/**
 * Effects: the one place authored content mutates state. Content returns
 * Effect[]; this switch applies them in order and hands each number to the
 * module that owns it. Nothing here touches damage.
 */
import {
  AURA_LOOT_PENALTY, AURA_MAX, CLAIM_AMOUNT, CLAIM_CAP, CLAIM_HOLD, GESTELL_BURY, GRAVE_TTL, MAX_HP, READINESS_BURY, READINESS_MAX,
  RESTRAINT_BURY_GAIN, RESTRAINT_MAX,
} from "./constants";
import { POSITIONS, districtAt, nearPoint } from "./map";
import { F, W } from "./content/ids";
import { LINES } from "./content";
import type { Claim, Ctx, Effect, Enemy, EnemyKind, Grave, NpcState, Player, WorldState, Wreckage } from "./types";
import { notice, pushNews, say, wink } from "./world";
import { addItem, applyNode, earn, removeItem, spend } from "./economy";
import { applyStanding } from "./houses";
import { applyClearing, applyPassing } from "./clearing";
import { spawnEnemy } from "./enemies";
import { openNode, resolveWink } from "./dialogue";
import { advanceQuest, completeQuest, startQuest } from "./quests";

const WRECKAGE_REACH = 64;
const ANGEL_UNDER = "The ground takes you the way it takes anyone. You wake in the Care.";
const ENEMY_NAMES: Record<EnemyKind, string> = {
  clerk: "Clerk",
  intake: "Intake Clerk",
  warden: "Warden",
  enforcer: "Cold desk",
  dummy: "Practice dummy",
};
const ENEMY_TINTS: Record<EnemyKind, Enemy["tint"]> = {
  clerk: "lavender",
  intake: "lavender",
  warden: "sky",
  enforcer: "wine",
  dummy: "paper",
};

// ---------------------------------------------------------------- helpers

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function setPlayer(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}

function bump(w: WorldState, key: string, delta: number): WorldState {
  return { ...w, flags: { ...w.flags, [key]: (w.flags[key] ?? 0) + delta } };
}

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "claim";
}

function liveWreckage(w: WorldState, p: Player, id: string | undefined, want: (r: Wreckage) => boolean): number {
  if (id) {
    const i = w.wreckage.findIndex(r => r.id === id && want(r));
    return i >= 0 && nearPoint(p.x, p.y, w.wreckage[i].x, w.wreckage[i].y, WRECKAGE_REACH) ? i : -1;
  }
  let best = -1;
  let bestD = WRECKAGE_REACH * WRECKAGE_REACH;
  w.wreckage.forEach((r, i) => {
    if (!want(r)) return;
    const d = (r.x - p.x) * (r.x - p.x) + (r.y - p.y) * (r.y - p.y);
    if (d <= bestD) { bestD = d; best = i; }
  });
  return best;
}

// ---------------------------------------------------------------- wreckage

function bury(w: WorldState, p: Player, id?: string): WorldState {
  const i = liveWreckage(w, p, id, r => !r.buried);
  if (i < 0) return w;
  const r = w.wreckage[i];
  const now = w.now;
  const wreckage = w.wreckage.slice();
  wreckage[i] = { ...r, buried: true };
  const grave: Grave = { id: `grave-${r.id}`, x: r.x, y: r.y, district: r.district, name: r.fromName, by: p.id, at: now, until: now + GRAVE_TTL };
  let cur: WorldState = { ...w, wreckage, graves: [...w.graves, grave], gestell: clamp(w.gestell + GESTELL_BURY, 0, 100) };
  cur = bump(cur, W.BURIALS, 1);
  let me: Player = {
    ...p,
    readiness: clamp(p.readiness + READINESS_BURY, 0, READINESS_MAX),
    restraint: clamp(p.restraint + RESTRAINT_BURY_GAIN, 0, RESTRAINT_MAX),
    extractedSinceFuneral: 0,
    history: { ...p.history, buried: p.history.buried + 1 },
  };
  if (me.party.nara === "gone") {
    me = notice({ ...me, party: { ...me.party, nara: "waiting" } }, LINES.NARA_WAITS, now, "ink");
  }
  return setPlayer(cur, say(me, LINES.BURY_COPY, now));
}

function loot(w: WorldState, p: Player, id?: string): WorldState {
  const i = liveWreckage(w, p, id, r => !r.buried && !r.looted);
  if (i < 0) return w;
  const r = w.wreckage[i];
  const now = w.now;
  const wreckage = w.wreckage.slice();
  wreckage[i] = { ...r, looted: true, bestand: 0, items: [] };
  let cur: WorldState = { ...w, wreckage };
  let me: Player = {
    ...p,
    aura: p.guest ? 0 : Math.max(0, p.aura - AURA_LOOT_PENALTY),
    history: { ...p.history, looted: p.history.looted + 1 },
  };
  for (const item of r.items) me = addItem(me, item);
  cur = setPlayer(cur, me);
  if (r.bestand > 0) cur = earn(cur, p.id, r.bestand, "spoils");
  me = cur.players.get(p.id) ?? me;
  return setPlayer(cur, say(me, LINES.LOOT_COPY, now));
}

// ---------------------------------------------------------------- the going-under

function under(w: WorldState, p: Player): WorldState {
  const now = w.now;
  if (p.guest) return setPlayer(w, say({ ...p, locked: true }, LINES.GUEST_LOCK, now));
  const shrine = POSITIONS["care-shrine"];
  if (!shrine) return w;
  let me: Player = {
    ...p,
    flags: { ...p.flags, [F.UNDER]: 1 },
    x: shrine.x,
    y: shrine.y,
    district: shrine.district,
    respawn: { x: shrine.x, y: shrine.y, district: shrine.district },
    hp: MAX_HP,
    dead: false,
    aura: Math.max(p.aura, p.auraSeed),
    movement: p.movement < 2 ? 2 : p.movement,
    dodgeT: 0,
    heavyWindup: 0,
  };
  me = notice(me, ANGEL_UNDER, now, "gold");
  return setPlayer(w, say(me, ANGEL_UNDER, now));
}

// ---------------------------------------------------------------- one effect

function applyOne(w: WorldState, id: string, e: Effect): WorldState {
  const p = w.players.get(id);
  if (!p) return w;
  const now = w.now;

  switch (e.kind) {
    case "flag":
      return setPlayer(w, { ...p, flags: { ...p.flags, [e.key]: e.value ?? 1 } });
    case "count":
      return setPlayer(w, { ...p, flags: { ...p.flags, [e.key]: (p.flags[e.key] ?? 0) + e.delta } });
    case "worldFlag":
      return { ...w, flags: { ...w.flags, [e.key]: e.value ?? 1 } };
    case "worldCount":
      return bump(w, e.key, e.delta);
    case "choice":
      return setPlayer(w, { ...p, choices: { ...p.choices, [e.key]: e.value } });
    case "readiness":
      return setPlayer(w, { ...p, readiness: clamp(p.readiness + e.delta, 0, READINESS_MAX) });
    case "restraint":
      return setPlayer(w, { ...p, restraint: clamp(p.restraint + e.delta, 0, RESTRAINT_MAX) });
    case "aura":
      return setPlayer(w, { ...p, aura: p.guest ? 0 : clamp(p.aura + e.delta, 0, AURA_MAX) });
    case "winke":
      return setPlayer(w, { ...p, winke: Math.max(0, p.winke + e.delta) });
    case "fakeWinke":
      return setPlayer(w, { ...p, fakeWinke: Math.max(0, p.fakeWinke + e.delta) });
    case "bestand": {
      if (e.delta > 0) return earn(w, id, e.delta, e.earner ?? "node");
      if (e.delta < 0) {
        const amount = Math.min(-e.delta, p.bestand);
        return spend(w, id, amount, e.sink ?? "tax") ?? w;
      }
      return w;
    }
    case "banked":
      return setPlayer(w, { ...p, banked: Math.max(0, p.banked + e.delta) });
    case "gestell":
      return { ...w, gestell: clamp(w.gestell + e.delta, 0, 100) };
    case "current":
      return setPlayer(w, { ...p, current: e.value });
    case "movement":
      return setPlayer(w, { ...p, movement: e.value });
    case "party":
      return setPlayer(w, { ...p, party: { ...p.party, [e.npc]: e.state } });
    case "npc": {
      const shared = w.npcs[e.id] ?? { id: e.id, x: 0, y: 0, district: "nave", present: false, state: "home" };
      const next: NpcState = {
        ...shared,
        x: e.x ?? shared.x,
        y: e.y ?? shared.y,
        district: e.district ?? (e.x !== undefined && e.y !== undefined ? districtAt(e.x, e.y) : shared.district),
        present: e.present ?? shared.present,
        state: e.state ?? shared.state,
      };
      return { ...w, npcs: { ...w.npcs, [e.id]: next } };
    }
    case "poi": {
      const cur = w.pois[e.id] ?? { state: "", by: "", at: 0, count: 0 };
      return { ...w, pois: { ...w.pois, [e.id]: { state: e.state, by: id, at: now, count: cur.count + 1 } } };
    }
    case "news":
      return pushNews(w, e.text);
    case "say":
      return setPlayer(w, say(p, e.text, now));
    case "wink":
      return setPlayer(w, wink(p, resolveWink({ w, p, now }, e.text), now, w.gestell));
    case "notice":
      return setPlayer(w, notice(p, e.text, now, e.tone));
    case "item": {
      let me = p;
      if (e.add) me = addItem(me, e.add);
      if (e.remove) me = removeItem(me, e.remove, e.qty ?? 1);
      return me === p ? w : setPlayer(w, me);
    }
    case "claim": {
      // An authored claim. The desk is disarmed: it settles into banked Bestand only, through `take`.
      if (p.guest) return setPlayer(w, say(p, LINES.CLAIMS_GUEST, now));
      const claimId = `claim:${slug(e.label)}`;
      if (p.claims.some(c => c.id === claimId)) return w;
      if (p.claimsFiled >= CLAIM_CAP) return setPlayer(w, say(p, LINES.CLAIMS_CAP, now));
      const claim: Claim = { id: claimId, label: e.label, amount: e.amount ?? CLAIM_AMOUNT, filedAt: now, readyAt: now + CLAIM_HOLD, settled: false };
      return setPlayer(w, say({ ...p, claims: [...p.claims, claim], claimsFiled: p.claimsFiled + 1 }, LINES.CLAIMS_FILED, now));
    }
    case "standing":
      return applyStanding(w, e.house, e.delta);
    case "spawn": {
      const pos = POSITIONS[e.at];
      if (!pos) return w;
      const enemyId = `${e.enemy}:${e.at}`;
      const enemy = spawnEnemy(
        { id: enemyId, kind: e.enemy, district: pos.district, x: pos.x, y: pos.y, name: e.name ?? ENEMY_NAMES[e.enemy], tint: ENEMY_TINTS[e.enemy] },
        now,
        e.name,
      );
      const enemies = w.enemies.filter(x => x.id !== enemyId);
      return { ...w, enemies: [...enemies, enemy] };
    }
    case "node":
      return applyNode(w, id, e.id, e.op);
    case "wreckage":
      return e.op === "bury" ? bury(w, p, e.id) : loot(w, p, e.id);
    case "lock":
      return setPlayer(w, { ...p, locked: true });
    case "under":
      return under(w, p);
    case "respawnAt": {
      const pos = POSITIONS[e.poi];
      return pos ? setPlayer(w, { ...p, respawn: { x: pos.x, y: pos.y, district: pos.district } }) : w;
    }
    case "heal":
      return setPlayer(w, { ...p, hp: clamp(p.hp + e.amount, 0, MAX_HP) });
    case "insure":
      return setPlayer(w, { ...p, insured: true });
    case "teleport": {
      const pos = POSITIONS[e.to];
      return pos ? setPlayer(w, { ...p, x: pos.x, y: pos.y, district: pos.district, dodgeT: 0 }) : w;
    }
    case "freeze": {
      const next: WorldState = { ...w, frozen: { ...w.frozen, [e.district]: now + e.seconds } };
      return bump(next, W.FREEZES, 1);
    }
    case "quest":
      if (e.op === "start") return startQuest(w, id, e.id);
      if (e.op === "advance") return advanceQuest(w, id, e.id);
      return completeQuest(w, id, e.id);
    case "clearing":
      return applyClearing(w, id, e.op);
    case "passing":
      return applyPassing(w, id);
    case "dialogue":
      return openNode(w, id, e.npc, e.node);
    case "history": {
      const h = p.history;
      return setPlayer(w, {
        ...p,
        history: {
          ...h,
          passings: h.passings + (e.passings ?? 0),
          buried: h.buried + (e.buried ?? 0),
          looted: h.looted + (e.looted ?? 0),
          outcomes: e.outcome ? [...h.outcomes, e.outcome] : h.outcomes,
        },
      });
    }
    default:
      return w;
  }
}

/** Applies effects in order for one player. A function form is resolved once, against the state before any of them ran. */
export function applyEffects(w: WorldState, id: string, effects: Effect[] | ((ctx: Ctx) => Effect[]) | undefined): WorldState {
  if (!effects) return w;
  const p = w.players.get(id);
  if (!p) return w;
  const list = typeof effects === "function" ? effects({ w, p, now: w.now }) : effects;
  let cur = w;
  for (const e of list) cur = applyOne(cur, id, e);
  return cur;
}
