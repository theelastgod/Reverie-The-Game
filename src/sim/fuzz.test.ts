// The player-defect sweep, round twenty-one: a seeded random-play fuzzer through the real reducers (applyAction, tickWorld, snapshotFor).
// Runs FUZZ_RUNS seeds (env, default below), 1–3 bodies each, guests and Angels (linked through applyLink with the mock
// sig), FUZZ_ACTIONS ops a run, biased toward the journal objective. Every op is logged so a failure replays from its seed.
// It records findings and prints a report; under FUZZ_STRICT=1 (the npm script's default) it fails on any.
import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AURA_MAX, CLAIM_CAP, DT, LAUNCH_OFFSET, MAX_HP, MOCK_SIG, READINESS_MAX, RESTRAINT_MAX, SEASON_LENGTH } from "./constants";
import { COLS, GATES, POSITIONS, ROWS, blockedFor, circleHitsWalls, districtAt, gateOpenFor, idx, tileOf } from "./map";
import { F } from "./content/ids";
import { LINES, NPCS } from "./content";
import type { ClientMsg } from "./protocol";
import type { Player, Prompt, WorldState } from "./types";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { applyAction } from "./actions";
import { npcView, promptFor, snapshotFor, stepViews } from "./snapshot";
import { questById } from "./quests";

export type Op =
  | { k: "place"; id: string; x: number; y: number }
  | { k: "act"; id: string; msg: ClientMsg; label: string; verb?: boolean }
  | { k: "tick"; n: number };

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FORBIDDEN = new Set(["care", "clearing", "organs"]);
const POS_KEYS = Object.keys(POSITIONS);

/** walksBetween, by connected components per gate set (the same answer; walksBetween's own cache thrashes on many starts). */
const LABELS = new Map<string, Int32Array>();
export function walks(p: Pick<Player, "guest" | "flags">, from: { x: number; y: number }, to: { x: number; y: number }): boolean {
  const key = GATES.map(g => (gateOpenFor(p, g) ? 1 : 0)).join("");
  let lab = LABELS.get(key);
  if (!lab) {
    lab = new Int32Array(COLS * ROWS).fill(-1);
    let next = 0;
    for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++) {
      if (lab[idx(tx, ty)] !== -1 || blockedFor(p, tx, ty)) continue;
      const q = [idx(tx, ty)];
      lab[q[0]] = next;
      while (q.length) {
        const c = q.pop()!;
        const cx = c % COLS, cy = Math.floor(c / COLS);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
          const n = idx(nx, ny);
          if (lab[n] !== -1 || blockedFor(p, nx, ny)) continue;
          lab[n] = next;
          q.push(n);
        }
      }
      next++;
    }
    LABELS.set(key, lab);
  }
  const a = lab[idx(tileOf(from.x), tileOf(from.y))];
  return a !== -1 && a === lab[idx(tileOf(to.x), tileOf(to.y))];
}

function setP(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}

export function applyOp(w: WorldState, op: Op): WorldState {
  if (op.k === "place") {
    const p = w.players.get(op.id)!;
    return setP(w, { ...p, x: op.x, y: op.y, district: districtAt(op.x, op.y) });
  }
  if (op.k === "tick") {
    let cur = w;
    for (let i = 0; i < op.n; i++) cur = tickWorld(cur, DT);
    return cur;
  }
  return applyAction(w, op.id, op.msg);
}

/** A cheap fingerprint of what a press can change: the presser and the shared state. */
function fp(w: WorldState, id: string): string {
  const p = w.players.get(id)!;
  return JSON.stringify([p, w.pois, w.flags, w.nodes, w.wreckage, w.clearing, w.market, w.npcs, w.news.length, w.gestell, w.frozen, w.houses, w.passing, w.graves.length, w.enemies.map(e => [e.id, e.state, e.hp])]);
}

export type Finding = { seed: number; kind: string; detail: string; opIndex: number; ops: Op[] };

type RunStats = { maxMovement: number[]; earners: Map<string, number>; cover?: Set<string>; stays?: Map<string, { n: number; seed: number; id: string }>; bare?: Map<string, { seed: number; detail: string; district: string }> };

export function runSeed(seed: number, nActions: number, findings: Finding[], stats: RunStats, stopAtFirst = true): Op[] {
  const r = mulberry32(seed);
  const ri = (n: number) => Math.floor(r() * n);
  const pick = <T,>(xs: readonly T[]): T => xs[ri(xs.length)];
  const ops: Op[] = [];
  let w: WorldState = emptyWorld();
  // a world that has been running: some seeds start just before the launch's hour or the season's roll, in any weather
  const start = r();
  if (start < 0.2) w = { ...w, now: LAUNCH_OFFSET - 1 - ri(40) };
  else if (start < 0.35) w = { ...w, now: SEASON_LENGTH - 1 - ri(40) };
  if (r() < 0.4) w = { ...w, gestell: ri(101) };
  const nBodies = 1 + ri(3);
  const ids: string[] = [];
  const usedSerials = new Set<number>();
  let found = false;
  const linkedSince = new Set<string>();
  const report = (kind: string, detail: string) => {
    if (found && stopAtFirst) return;
    found = true;
    findings.push({ seed, kind, detail, opIndex: ops.length, ops: ops.slice() });
  };
  const run = (op: Op): void => {
    ops.push(op);
    if (op.k === "act" && op.msg.t === "link") linkedSince.add(op.id);
    w = applyOp(w, op);
  };
  for (let i = 0; i < nBodies; i++) {
    const id = `b${i}`;
    ids.push(id);
    w = setP(w, spawnGuest(id, w.now));
  }
  // Angels: linked through the real reducer
  for (const id of ids) {
    if (r() < 0.55) {
      let s = 1 + ri(7777);
      while (usedSerials.has(s)) s = 1 + ri(7777);
      usedSerials.add(s);
      run({ k: "act", id, msg: { t: "link", serial: s, sig: MOCK_SIG }, label: "link" });
    }
  }
  run({ k: "tick", n: 1 });

  // per-body memory
  const prevMovement = new Map<string, number>();
  const prevQuests = new Map<string, Record<string, number>>();
  const objMem = new Map<string, { key: string; count: number }>();
  const follows = new Map<string, number>();
  for (const id of ids) { prevMovement.set(id, w.players.get(id)!.movement); prevQuests.set(id, { ...w.players.get(id)!.quests }); }

  const check = (lastOp: Op | null, stuckLimit: number) => {
    void lastOp;
    let sv: ReturnType<typeof stepViews> | null = null;
    for (const e of w.enemies) if (!(e.hp >= 0 && e.hp <= e.maxHp)) report("enemy-hp", `${e.id} hp=${e.hp}/${e.maxHp}`);
    for (const n of w.nodes) if (!(n.charges >= 0) || !Number.isFinite(n.charges)) report("node-charges", `${n.id} ${n.charges}`);
    if (!(w.clearing.reserve >= 0)) report("clearing-reserve", `${w.clearing.reserve}`);
    for (const [h, v] of Object.entries(w.houses.standing)) if (!Number.isFinite(v)) report("standing-nan", `${h} ${v}`);
    for (const r0 of w.wreckage) if (!(r0.bestand >= 0)) report("wreck-bestand", `${r0.id} ${r0.bestand}`);
    for (const l of w.market) {
      if (!(l.price > 0) || !Number.isFinite(l.price)) report("listing-price", `${l.id} ${l.price}`);
      const seller = w.players.get(l.sellerId);
      if (seller?.guest) report("guest-listing", `${l.id} by ${l.sellerId}`);
    }
    for (const id of ids) {
      const p = w.players.get(id)!;
      for (const k of ["bestand", "aura", "restraint", "hp", "readiness", "banked"] as const) {
        const v = p[k];
        if (typeof v !== "number" || Number.isNaN(v)) report(`nan:${k}`, `${id} ${k}=${v}`);
        else if (k !== "readiness" && v < 0) report(`neg:${k}`, `${id} ${k}=${v}`);
      }
      if (p.hp > MAX_HP) report("hp>max", `${id} hp=${p.hp}`);
      if (p.aura > AURA_MAX) report("aura>max", `${id} aura=${p.aura}`);
      if (p.restraint > RESTRAINT_MAX) report("restraint>max", `${id} restraint=${p.restraint}`);
      if (p.readiness > READINESS_MAX) report("readiness>max", `${id} readiness=${p.readiness}`);
      if (p.winke < 0 || p.fakeWinke < 0 || !Number.isFinite(p.winke) || !Number.isFinite(p.fakeWinke)) report("neg:winke", `${id} ${p.winke}/${p.fakeWinke}`);
      if (!Number.isInteger(p.bestand) || !Number.isInteger(p.banked)) report("frac:bestand", `${id} bestand=${p.bestand} banked=${p.banked}`);
      const stacks = new Set<string>();
      for (const it of p.items) {
        if (!(it.qty > 0) || !Number.isInteger(it.qty)) report("item-qty", `${id} ${it.id} qty=${it.qty}`);
        if (stacks.has(it.id)) report("item-dup", `${id} ${it.id}`);
        stacks.add(it.id);
        if (!Number.isFinite(it.value)) report("item-value", `${id} ${it.id} value=${it.value}`);
      }
      if (p.claims.filter(c => !c.settled).length > CLAIM_CAP + 3) report("claims-many", `${id} ${p.claims.length}`);
      if (p.dead) report("dead-after-step", `${id}`);
      if (Number.isNaN(w.gestell)) report("nan:gestell", `${w.gestell}`);
      if (p.movement < prevMovement.get(id)!) report("movement-down", `${id} ${prevMovement.get(id)} -> ${p.movement}`);
      prevMovement.set(id, p.movement);
      const pq = prevQuests.get(id)!;
      const isLink = linkedSince.has(id);
      linkedSince.delete(id);
      for (const [q, s] of Object.entries(pq)) {
        const now = p.quests[q];
        if (now === undefined || now < s) { if (!isLink) report("quest-down", `${id} ${q} ${s} -> ${now}`); }
      }
      prevQuests.set(id, { ...p.quests });
      if (p.guest) {
        if ((p.flags[F.UNDER] ?? 0) > 0) report("guest-under", `${id}`);
        if (FORBIDDEN.has(p.district)) report("guest-district", `${id} in ${p.district} at ${p.x},${p.y}`);
        if (p.claims.length > 0) report("guest-claim", `${id} claims ${JSON.stringify(p.claims)}`);
        if (p.flagged) report("guest-flagged", `${id}`);
        if (p.wink) report("guest-wink", `${id} wink=${p.wink}`);
        if (p.dialogue?.wink) report("guest-wink-dialogue", `${id} ${p.dialogue.npc}/${p.dialogue.node}`);
      }
      let snap;
      try {
        sv ??= stepViews(w);
        snap = snapshotFor(w, id, sv);
      } catch (e) {
        report("snapshot-throw", `${id} ${(e as Error).stack?.slice(0, 600)}`);
        continue;
      }
      if (p.guest && snap.you.wink) report("guest-wink-snap", `${id}`);
      const objs = [snap.objective, ...(snap.sideObjectives ?? [])].filter(Boolean) as NonNullable<typeof snap.objective>[];
      for (const o of objs) {
        const q = questById(o.quest);
        const step = q?.steps.find(s => s.id === o.step);
        if (step?.target && !o.target) {
          const t = typeof step.target === "function" ? step.target({ w, p, now: w.now }) : step.target;
          if (t) report("objective-unresolved", `${id} ${o.quest}/${o.step} -> ${t}`);
        }
        if (o.target && !p.locked && !p.dead && !walks(p, p, o.target)) {
          report("objective-unreachable", `${id} (${p.guest ? "guest" : "angel"} m${p.movement} at ${p.district} ${Math.round(p.x)},${Math.round(p.y)}) ${o.quest}/${o.step} -> ${o.target.district} ${o.target.x},${o.target.y}`);
        }
      }
      // soft lock memory: count only follow-ops by this body
      const key = snap.objective ? `${snap.objective.quest}/${snap.objective.step}` : "";
      const mem = objMem.get(id);
      if (!mem || mem.key !== key) objMem.set(id, { key, count: 0 });
      else if (key && mem.count > stuckLimit && !p.locked) report("stuck", `${id} (${p.guest ? "guest" : "angel"} m${p.movement}) at ${key} for ${mem.count} follow-ops`);
    }
  };

  const stuckLimit = 250;
  const place = (id: string, x: number, y: number): boolean => {
    const p = w.players.get(id)!;
    if (circleHitsWalls(x, y, 12, p)) return false;
    if (!walks(p, p, { x, y })) return false;
    run({ k: "place", id, x, y });
    return true;
  };

  const pressPrompt = (id: string): void => {
    const p = w.players.get(id)!;
    let prompt: Prompt | null;
    try { prompt = promptFor({ w, p, now: w.now }); } catch (e) { report("prompt-throw", (e as Error).message); return; }
    if (!prompt || prompt.verbs.length === 0) return;
    // the client hides the prompt under an open window; Speak to the person already speaking is the double-press guard
    if (prompt.targetKind === "npc" && p.dialogue?.npc === prompt.targetId) return;
    const v = pick(prompt.verbs);
    let msg: ClientMsg;
    if (v.key === "V") msg = { t: "flag" };
    else if (v.key === "T") msg = { t: "truce" };
    else if (prompt.targetKind === "npc") msg = { t: "talk", npcId: prompt.targetId };
    else msg = { t: "interact", targetId: prompt.targetId, choice: v.choice };
    const before = w;
    const fBefore = fp(w, id);
    const heardAtBefore = p.heardAt;
    const label = `${prompt.targetKind}:${prompt.targetId}:${v.choice}`;
    const bBefore = p.bestand;
    run({ k: "act", id, msg, label, verb: true });
    const after = w.players.get(id)!;
    if (after.bestand > bBefore) stats.earners.set(label, (stats.earners.get(label) ?? 0) + 1);
    stats.cover?.add(`verb ${label.replace(/wreck-\d+-b\d/, "wreck").replace(/:b\d:/, ":body:")}`);
    if (after.heardAt !== heardAtBefore) {
      if (after.heard === LINES.ALREADY) report("offered-already", `${id} ${label}`);
      if (after.heard === LINES.GUEST_LOCK && !p.guest && !p.locked) report("angel-guest-lock", `${id} ${label}`);
      // the threshold's "Go under" locks a guest with this very line (CONTRACTS "under": guest -> lock): by design
      if (after.heard === LINES.GUEST_LOCK && p.guest && !p.locked && v.choice !== "under") report("offered-then-guest-lock", `${id} (${p.locked ? "locked" : "unlocked"} guest) ${label}`);
    }
    if (w === before || (fp(w, id) === fBefore && after.heardAt === heardAtBefore)) {
      report("silent-verb", `${id} (${p.guest ? "guest" : "angel"} m${p.movement}${p.locked ? " locked" : ""}) ${label} [${v.key} ${v.label}] at ${Math.round(p.x)},${Math.round(p.y)}`);
    }
  };

  const dialogueSteps = (id: string): void => {
    for (let i = 0; i < 6; i++) {
      const p = w.players.get(id)!;
      const d = p.dialogue;
      if (!d) return;
      const bBefore = p.bestand;
      let label: string;
      if (d.choices.length && r() < 0.9) {
        const c = pick(d.choices);
        label = `choose:${d.npc}/${d.node}/${c.id}`;
        stats.cover?.add(`node ${d.npc}/${d.node}`);
        run({ k: "act", id, msg: { t: "choose", choiceId: c.id, node: d.node }, label });
      } else {
        label = `close:${d.npc}/${d.node}`;
        run({ k: "act", id, msg: { t: "close", node: d.node }, label });
      }
      const after = w.players.get(id)!;
      if (after.bestand > bBefore) stats.earners.set(label, (stats.earners.get(label) ?? 0) + 1);
      run({ k: "tick", n: 1 });
      check(ops[ops.length - 2], stuckLimit);
    }
  };

  const fight = (id: string): void => {
    const p0 = w.players.get(id)!;
    const near = w.enemies.filter(e => e.state !== "dead" && Math.hypot(e.x - p0.x, e.y - p0.y) < 200);
    if (!near.length) return;
    const target = pick(near);
    for (let i = 0; i < 20; i++) {
      const e = w.enemies.find(x => x.id === target.id)!;
      if (e.state === "dead") break;
      const p = w.players.get(id)!;
      if (!place(id, e.x - 40, e.y) && !place(id, e.x + 40, e.y)) break;
      const bBefore = p.bestand;
      run({ k: "act", id, msg: r() < 0.8 ? { t: "strike" } : { t: "heavy" }, label: "strike" });
      run({ k: "tick", n: 10 });
      const after = w.players.get(id)!;
      if (after.bestand > bBefore) stats.earners.set(`fight:${target.kind}`, (stats.earners.get(`fight:${target.kind}`) ?? 0) + 1);
      check(null, stuckLimit);
      if (found && stopAtFirst) return;
    }
  };

  for (let step = 0; step < nActions && !(found && stopAtFirst); step++) {
    const id = pick(ids);
    const p = w.players.get(id)!;
    const roll = r();
    let followed = false;
    if (p.dialogue && r() < 0.7) {
      dialogueSteps(id);
    } else if (roll < 0.6) {
      // follow the journal: the spine, else a side hour
      const snap = snapshotFor(w, id);
      const objs = [snap.objective, ...(snap.sideObjectives ?? [])].filter(o => o?.target) as NonNullable<typeof snap.objective>[];
      const o = objs.length ? (r() < 0.8 ? objs[0] : pick(objs)) : null;
      if (o?.target) {
        followed = true;
        const mem = objMem.get(id);
        if (mem && snap.objective && o === snap.objective) mem.count++;
        const fk = `${o.quest}/${o.step}`;
        const ck = `${id}|${fk}|${w.players.get(id)!.quests[o.quest]}`;
        const n = (follows.get(ck) ?? 0) + 1;
        follows.set(ck, n);
        if (stats.stays && n > (stats.stays.get(fk)?.n ?? 0)) stats.stays.set(fk, { n, seed, id });
        const exact = place(id, o.target.x, o.target.y);
        if (exact && stats.bare) {
          const pp = w.players.get(id)!;
          const pr = promptFor({ w, p: pp, now: w.now });
          if (!pr || !pr.verbs.length) {
            const k = `${o.quest}/${o.step}`;
            if (!stats.bare.has(k)) stats.bare.set(k, { seed, detail: o.detail.slice(0, 160), district: o.target.district });
          }
        }
        const placed = exact || place(id, o.target.x + 30, o.target.y) || place(id, o.target.x, o.target.y + 30);
        run({ k: "tick", n: 1 });
        if (placed) {
          if (o.target && w.enemies.some(e => e.state !== "dead" && Math.hypot(e.x - o.target!.x, e.y - o.target!.y) < 120) && r() < 0.6) fight(id);
          else {
            pressPrompt(id);
            run({ k: "tick", n: 1 });
            dialogueSteps(id);
          }
        }
      }
    }
    if (!followed && !p.dialogue) {
      if (roll < 0.75) {
        const key = pick(POS_KEYS);
        const pos = POSITIONS[key];
        if (place(id, pos.x + (ri(3) - 1) * 20, pos.y + (ri(3) - 1) * 20)) {
          run({ k: "tick", n: 1 });
          pressPrompt(id);
          run({ k: "tick", n: 1 });
          dialogueSteps(id);
        }
      } else if (roll < 0.83) {
        const ctx = { w, p, now: w.now };
        const views = Object.values(w.npcs).map(n => npcView(ctx, n)).filter(Boolean) as NonNullable<ReturnType<typeof npcView>>[];
        if (views.length) {
          const v = pick(views);
          if (NPCS[v.id] && place(id, v.x, v.y)) {
            run({ k: "act", id, msg: { t: "talk", npcId: v.id }, label: `talk:${v.id}` });
            run({ k: "tick", n: 1 });
            dialogueSteps(id);
          }
        }
      } else if (roll < 0.91) {
        const c = ri(12);
        if (c < 3) fight(id);
        else if (c === 8 || c === 9) {
          // walk: a real intent for a while (gates and walls by the reducer), then stop
          const dirs = [{ up: true }, { down: true }, { left: true }, { right: true }, { up: true, left: true }, { down: true, right: true }];
          run({ k: "act", id, msg: { t: "intent", intent: pick(dirs) }, label: "intent" });
          run({ k: "tick", n: 5 + ri(80) });
          if (r() < 0.3) run({ k: "act", id, msg: { t: "dodge", dx: r() * 2 - 1, dy: r() * 2 - 1 }, label: "dodge" });
          run({ k: "act", id, msg: { t: "intent", intent: {} }, label: "intent" });
          run({ k: "tick", n: 1 });
        } else if (c >= 10 && ids.length > 1) {
          // another body: stand beside it and press what the prompt offers, or swing
          const o = w.players.get(pick(ids.filter(x => x !== id)))!;
          if (place(id, o.x + 30, o.y) || place(id, o.x, o.y + 30)) {
            run({ k: "tick", n: 1 });
            if (r() < 0.5) pressPrompt(id);
            else run({ k: "act", id, msg: r() < 0.7 ? { t: "strike" } : { t: "heavy" }, label: "pvp-strike" });
            run({ k: "tick", n: 1 + ri(12) });
          }
        } else {
          const msg: ClientMsg = c === 3 ? { t: "heavy" } : c === 4 ? { t: "flag" } : c === 5 ? { t: "stance" } : c === 6 ? { t: "truce" } : { t: "kit" };
          run({ k: "act", id, msg, label: msg.t });
          run({ k: "tick", n: 1 + ri(10) });
        }
      } else if (roll < 0.96) {
        run({ k: "tick", n: 20 + ri(200) });
      } else {
        const c = ri(4);
        if (c === 0 && p.items.length) run({ k: "act", id, msg: { t: "use", itemId: pick(p.items).id }, label: "use" });
        else if (c === 1 && p.items.length) run({ k: "act", id, msg: { t: "market", op: "list", itemId: pick(p.items).id, price: 1 + ri(50) }, label: "list" });
        else if (c === 2 && w.market.length) run({ k: "act", id, msg: { t: "market", op: "buy", listingId: pick(w.market).id }, label: "buy" });
        else if (p.guest && (p.locked || r() < 0.2)) {
          let s = 1 + ri(7777);
          while (usedSerials.has(s)) s = 1 + ri(7777);
          usedSerials.add(s);
          run({ k: "act", id, msg: { t: "link", serial: s, sig: MOCK_SIG }, label: "link" });
        }
        run({ k: "tick", n: 1 });
      }
    }
    const last = ops[ops.length - 1];
    check(last, stuckLimit);
    void followed;
  }
  ids.forEach((id, i) => {
    const p = w.players.get(id)!;
    stats.maxMovement[i] = p.movement;
    for (const [q, st] of Object.entries(p.quests)) { const qq = questById(q); stats.cover?.add(`quest ${q} ${qq && st >= qq.steps.length ? "done" : "step" + st}`); }
  });
  return ops;
}

// Opt-in: `npm run test:fuzz` (FUZZ_RUNS, FUZZ_ACTIONS, FUZZ_BASE, FUZZ_OUT, FUZZ_STRICT). Off in `npm test`: it runs for minutes.
describe.skipIf(!process.env.FUZZ_RUNS)("round twenty-one: seeded random play through the real reducers", () => {
  it("holds the invariants across many seeds", () => {
    const runs = Number(process.env.FUZZ_RUNS ?? 250);
    const actions = Number(process.env.FUZZ_ACTIONS ?? 250);
    const base = Number(process.env.FUZZ_BASE ?? 1);
    const findings: Finding[] = [];
    const hist: Record<number, number> = {};
    const earners = new Map<string, number>();
    const t0 = Date.now();
    let bodies = 0;
    for (let s = base; s < base + runs; s++) {
      const stats: RunStats = { maxMovement: [], earners };
      try {
        runSeed(s, actions, findings, stats);
      } catch (e) {
        findings.push({ seed: s, kind: "throw", detail: (e as Error).stack?.slice(0, 800) ?? String(e), opIndex: -1, ops: [] });
      }
      for (const m of stats.maxMovement) { hist[m] = (hist[m] ?? 0) + 1; bodies++; }
    }
    const byKind = new Map<string, Finding>();
    const counts = new Map<string, number>();
    for (const f of findings) {
      const key = `${f.kind}|${f.detail.replace(/b\d/g, "b").replace(/at -?\d+,-?\d+/g, "").replace(/\d+ follow-ops/, "")}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
      const cur = byKind.get(key);
      if (!cur || f.opIndex < cur.opIndex) byKind.set(key, f);
    }
    const lines = [`runs ${runs} x ${actions} ops, ${bodies} bodies, ${((Date.now() - t0) / 1000).toFixed(1)} s`, `movement at end: ${JSON.stringify(hist)}`, `earners: ${JSON.stringify([...earners.entries()].sort((a, b) => b[1] - a[1]))}`];
    for (const [key, f] of [...byKind.entries()].sort((a, b) => (counts.get(b[0])! - counts.get(a[0])!))) lines.push(`[${counts.get(key)}x] ${f.kind} seed=${f.seed} op=${f.opIndex}: ${f.detail}`);
    console.log(lines.join("\n"));
    if (process.env.FUZZ_OUT) writeFileSync(process.env.FUZZ_OUT, lines.join("\n"));
    if (process.env.FUZZ_STRICT === "1") expect(findings).toEqual([]);
  }, 600_000);
});
