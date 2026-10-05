import { describe, expect, it } from "vitest";

/**
 * The spine, played through twice against the real content with nothing but
 * the public reducers: spawnGuest, tickWorld, applyAction with real ClientMsg
 * shapes. The only shortcut is `place`, which sets the body down at a named
 * position instead of walking it there.
 *
 * Run one extracts, dismantles the recorder, calls the weather the process,
 * refuses the freeze, takes the private yield, sells the print, and has its
 * hour claimed by Cold. Run two keeps, leaves the voice running, calls it the
 * end of world as world, signs the freeze, refuses the yield, buries the
 * garden, spots the copy, and reaches every outcome the Passing can have.
 */
import { CLEARING_LIST_PRICE, CLEARING_PRICE_MOVE, COPY_PRICE, DT, FREEZE_FEE, M3_DOOR_PRICE, MOCK_SIG, OPERATOR_YIELD, PASSING_STIPEND, READINESS_PASSING_MIN, READINESS_REFUSE, TEST_SERIAL, TITHE_COST } from "./constants";
import { GATES, GUEST_SPAWN, POSITIONS, blockedFor, districtAt, gateOpenFor, idx, reachableTiles, tileOf } from "./map";
import { cityFigure, type ClientMsg } from "./protocol";
import { C, F, Q, W } from "./content/ids";
import { SIDE_PLACES } from "./content/side";
import { CLEARING_LISTING, clearingPrice } from "./content/market";
import { verbsFor } from "./interact";
import { openNode } from "./dialogue";
import { applyListing } from "./economy";
import { LINES, NPCS, QUESTS } from "./content";
import { WAKING_WINK } from "./content/lines";
import type { Ctx, Effect, Player, Quest, WorldState } from "./types";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { applyAction } from "./actions";
import { questById, questProgress, resolveTarget } from "./quests";
import { npcView, snapshotFor } from "./snapshot";

const ME = "me";
const ALLY = "ally";
const SHRINE = POSITIONS["care-shrine"];
const CARE_GATE = { tx: 17, ty: 56 }; // a tile of gate-nave-care; it opens for `under`

// ---------------------------------------------------------------- helpers

function me(w: WorldState, id = ME): Player {
  const p = w.players.get(id);
  if (!p) throw new Error(`no player ${id}`);
  return p;
}

function add(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}

/** The test's one shortcut: the body is set down at a point. Everything else goes through the reducers. */
function place(w: WorldState, id: string, x: number, y: number): WorldState {
  return add(w, { ...me(w, id), x, y, district: districtAt(x, y), facing: { dx: 1, dy: 0 } });
}

function goTo(w: WorldState, id: string, positionId: string): WorldState {
  const pos = POSITIONS[positionId];
  if (!pos) throw new Error(`no position ${positionId}`);
  return place(w, id, pos.x, pos.y);
}

function tick(w: WorldState, n = 1): WorldState {
  let cur = w;
  for (let i = 0; i < n; i++) cur = tickWorld(cur, DT);
  expectReachable(cur);
  return cur;
}

const act = (w: WorldState, id: string, msg: ClientMsg): WorldState => {
  const next = applyAction(w, id, msg);
  expectReachable(next);
  return next;
};
const interact = (w: WorldState, id: string, targetId: string, choice: string): WorldState => act(w, id, { t: "interact", targetId, choice });

/** Stand at a POI and press a spine verb the way the client would: it must be in the prompt first (a side hour can take its key). */
function use(w: WorldState, poiId: string, choice: string): WorldState {
  const cur = goTo(w, ME, poiId);
  const offered = verbsFor({ w: cur, p: me(cur), now: cur.now }, poiId).map(v => v.choice);
  expect(offered, `${poiId} offers ${choice} in the prompt`).toContain(choice);
  return interact(cur, ME, poiId, choice);
}

/** Stand where this viewer sees the person and speak. The party first notices a Wink they could not see; that node is closed through. */
function talkTo(w: WorldState, id: string, npcId: string): WorldState {
  const shared = w.npcs[npcId];
  const view = shared ? npcView({ w, p: me(w, id), now: w.now }, shared) : null;
  if (!view) throw new Error(`${npcId} is not present for ${id}`);
  let cur = place(w, id, view.x, view.y);
  cur = act(cur, id, { t: "talk", npcId });
  expect(me(cur, id).dialogue, `${npcId} answers`).not.toBeNull();
  if (me(cur, id).dialogue?.node === "blind") {
    expect(me(cur, id).dialogue?.text).toContain(LINES.PARTY_BLIND);
    cur = act(cur, id, { t: "close" });
    expect(me(cur, id).dialogue, `${npcId} goes on after the blind line`).not.toBeNull();
  }
  return cur;
}

function choose(w: WorldState, id: string, choiceId: string): WorldState {
  const d = me(w, id).dialogue;
  expect(d, "a dialogue is open").not.toBeNull();
  expect(d!.choices.map(c => c.id), `${d!.npc}/${d!.node} offers ${choiceId}`).toContain(choiceId);
  return act(w, id, { t: "choose", choiceId });
}

function closeAll(w: WorldState, id: string): WorldState {
  let cur = w;
  for (let i = 0; i < 8 && me(cur, id).dialogue; i++) cur = act(cur, id, { t: "close" });
  expect(me(cur, id).dialogue).toBeNull();
  return cur;
}

function expectStep(w: WorldState, questId: string, step: number, id = ME): void {
  expect(questProgress(me(w, id), questId).step, `${questId} at step ${step}`).toBe(step);
}

function expectDone(w: WorldState, questId: string, id = ME): void {
  expect(questProgress(me(w, id), questId), `${questId} finished`).toMatchObject({ started: true, done: true });
}

/** With no spine step live, the journal shows a side hour or nothing; never a movement. */
function expectNoSpineObjective(w: WorldState, id = ME): void {
  const objective = snapshotFor(w, id).objective;
  if (objective) expect(questById(objective.quest)?.kind, `${objective.quest} is a side hour`).toBe("side");
}

const pass = (w: WorldState): WorldState => interact(goTo(w, ME, "clearing-ring"), ME, "clearing-ring", "pass");
const ready = (w: WorldState, over: Partial<Player>): WorldState => add(w, { ...me(w), ...over });

/** Strike the Intake Clerk until it falls with this body among the participants. */
function fightIntake(w: WorldState, id: string): WorldState {
  const clerk = POSITIONS["enemy:intake-clerk"];
  let cur = place(w, id, clerk.x - 40, clerk.y);
  for (let i = 0; i < 40 && !(me(cur, id).flags[F.INTAKE] ?? 0); i++) {
    cur = act(cur, id, { t: "strike" });
    cur = tick(cur, 10);
  }
  expect(me(cur, id).flags[F.INTAKE], "the Intake Clerk fell with this body in it").toBe(1);
  expect(me(cur, id).heard, "the clerk's fall (I.2)").toBe(LINES.FALL_LINES.intake);
  expect(cur.enemies.find(e => e.id === "intake-clerk")?.state).toBe("dead");
  expect(cur.wreckage.some(r => r.fromId === "intake-clerk")).toBe(true);
  expect(me(cur, id).dead).toBe(false);
  return cur;
}

/** Strike Desk Three until it falls with this body among the participants. */
function fightDeskThree(w: WorldState, id: string): WorldState {
  const clerk = POSITIONS["enemy:desk-three"];
  let cur = place(w, id, clerk.x - 40, clerk.y);
  for (let i = 0; i < 40 && !(me(cur, id).flags[F.DESK_THREE] ?? 0); i++) {
    cur = act(cur, id, { t: "strike" });
    cur = tick(cur, 10);
  }
  expect(me(cur, id).flags[F.DESK_THREE], "Desk Three fell with this body in it").toBe(1);
  expect(me(cur, id).heard, "Desk Three's fall (I.4)").toBe(LINES.FALL_LINES["desk-three"]);
  expect(cur.enemies.find(e => e.id === "desk-three")?.state).toBe("dead");
  expect(me(cur, id).dead).toBe(false);
  return cur;
}

/** Catch the Annex Runner on its corridor and strike it until it falls: a courier answers only a fight, so the body stands in its way each swing. */
function fellRunner(w: WorldState, id: string): WorldState {
  let cur = w;
  for (let i = 0; i < 40 && !(me(cur, id).flags[F.BULLETIN] ?? 0); i++) {
    const runner = cur.enemies.find(e => e.id === "annex-runner")!;
    expect(runner.state, "the Runner is on its corridor").not.toBe("dead");
    cur = place(cur, id, runner.x - 40, runner.y);
    cur = act(cur, id, { t: "strike" });
    cur = tick(cur, 10);
  }
  expect(me(cur, id).flags[F.BULLETIN], "the Runner fell with this body in it").toBe(1);
  expect(me(cur, id).heard).toBe(LINES.FALL_LINES.bulletin);
  expect(cur.enemies.find(e => e.id === "annex-runner")?.state).toBe("dead");
  expect(me(cur, id).dead).toBe(false);
  return cur;
}

// ---------------------------------------------------------------- the city's gates

/**
 * The reach audit (2026-10-03), held after every action and tick of every run in this file: wherever the journal or a
 * hand-out points a body, it can walk there through the gates it can open at that moment (the Care's at the going-under,
 * the Organs' at the third hour's door, the Clearing's to Angels). A side hour's later steps count as well, since a body
 * can run ahead of the spine; the spine's own steps only while live, since a later one may need a gate an earlier one opens.
 * Every person who could hand out an hour now must stand where the body can reach, and never hand a guest an Angel's hour.
 */
const walkableByGates = new Map<string, Set<number>>();
function walkable(p: Player): Set<number> {
  const key = GATES.map(g => (gateOpenFor(p, g) ? "1" : "0")).join("");
  let tiles = walkableByGates.get(key);
  if (!tiles) {
    tiles = reachableTiles(tileOf(GUEST_SPAWN.x), tileOf(GUEST_SPAWN.y), (tx, ty) => blockedFor(p, tx, ty));
    walkableByGates.set(key, tiles);
  }
  return tiles;
}

function unreachable(w: WorldState): string[] {
  const faults: string[] = [];
  for (const p of w.players.values()) {
    if (p.locked) continue;
    const tiles = walkable(p);
    const walks = (at: { x: number; y: number }) => tiles.has(idx(tileOf(at.x), tileOf(at.y)));
    const check = (ctx: Ctx, q: Quest, i: number, why: string) => {
      const step = q.steps[i];
      if (!step.target) return;
      const at = resolveTarget(ctx, step.target);
      if (!at) {
        if (typeof step.target === "string") faults.push(`${p.id}: ${why}${q.id}'s ${step.id} points at ${step.target}, which is nowhere`);
      } else if (!walks(at)) faults.push(`${p.id}: ${why}${q.id}'s ${step.id} points into ${at.district}, past a gate this body cannot open`);
    };
    const ctx: Ctx = { w, p, now: w.now };
    for (const q of QUESTS) {
      const s = p.quests[q.id];
      if (s === undefined) continue;
      for (let i = s; i < q.steps.length; i++) {
        check(ctx, q, i, "");
        if (q.kind === "spine") break;
      }
    }
    for (const npc of Object.values(NPCS)) {
      for (const node of Object.values(npc.nodes)) {
        for (const c of node.choices ?? []) {
          if (c.when && !c.when(ctx)) continue;
          const effects: Effect[] = typeof c.effects === "function" ? c.effects(ctx) : c.effects ?? [];
          for (const e of effects) {
            if (e.kind !== "quest" || e.op !== "start" || p.quests[e.id] !== undefined) continue;
            const q = questById(e.id)!;
            const why = `${npc.id}'s ${c.id} would start `;
            if (p.guest && !q.guestLegal) faults.push(`${p.id}: ${why}${q.id}, an Angel's hour, for a guest`);
            const shared = w.npcs[npc.id];
            const view = shared ? npcView(ctx, shared) : null;
            if (view && !walks(view)) faults.push(`${p.id}: ${why}${q.id} from ${view.district}, past a gate this body cannot open`);
            const started: Ctx = { ...ctx, p: { ...p, quests: { ...p.quests, [q.id]: 0 } } };
            q.steps.forEach((_, i) => check(started, q, i, why));
          }
        }
      }
    }
  }
  return faults;
}

function expectReachable(w: WorldState): void {
  expect(unreachable(w), "every place the journal or a hand-out points at is one the body can walk to").toEqual([]);
}

// ---------------------------------------------------------------- Movement I

type Opening = { node: "extract" | "keep"; extra: string[]; memorial: "copper" | "voice"; weather: "stability" | "process" | "end"; bulletin?: boolean };

/** Movement I up to and including the first use of the threshold. Returns the world right after that press. */
function movementOne(w0: WorldState, o: Opening): WorldState {
  let w = tick(w0);
  expectStep(w, Q.M1, 0);
  expect(me(w).movement).toBe(1);
  expect(snapshotFor(w, ME).objective).toMatchObject({ quest: Q.M1, step: "arrive", movement: 1 });

  // arrive
  w = tick(goTo(w, ME, "nave-node-1"));
  expectStep(w, Q.M1, 1);
  expect(me(w).flags[F.ARRIVED]).toBe(1);

  // intake
  w = fightIntake(w, ME);
  expectStep(w, Q.M1, 2);

  // first node
  w = goTo(w, ME, "nave-node-1");
  w = tick(interact(w, ME, "nave-node-1", o.node));
  expectStep(w, Q.M1, 3);
  expect(me(w).choices[C.FIRST_NODE]).toBe(o.node);
  expect(me(w).flags[F.FIRST_NODE]).toBe(1);
  for (const nodeId of o.extra) {
    const purse = me(w).bestand;
    w = interact(goTo(w, ME, nodeId), ME, nodeId, "extract");
    expect(me(w).bestand, `${nodeId} pays`).toBeGreaterThan(purse);
  }

  // Desk Three, then the second node (already answered when the extras took it)
  w = fightDeskThree(w, ME);
  w = tick(w);
  if (me(w).extracted + me(w).kept < 2) {
    expectStep(w, Q.M1, 4);
    w = goTo(w, ME, "nave-node-2");
    w = interact(w, ME, "nave-node-2", o.node);
  }
  w = tick(w, 2);
  expectStep(w, Q.M1, 5);
  expect(me(w).flags[F.SECOND_NODE]).toBe(1);
  expect(["keep", "extract", "split"]).toContain(me(w).choices[C.SECOND_NODE]);

  // Quill: three answers, then her offer
  w = talkTo(w, ME, "quill");
  expect(me(w).dialogue?.node).toBe("first");
  w = choose(w, ME, "sells");
  expect(me(w).dialogue?.node).toBe("market");
  w = act(w, ME, { t: "close" });
  expect(me(w).dialogue?.node).toBe("owners");
  w = act(w, ME, { t: "close" });
  expect(me(w).dialogue?.node).toBe("offer");
  w = closeAll(choose(w, ME, "print"), ME);
  expect(me(w).choices[C.QUILL_PRINT]).toBe("printed");
  expect(me(w).items.find(i => i.id === "copy:face")).toMatchObject({ kind: "exhibition", qty: 1 });
  w = tick(w);
  expectStep(w, Q.M1, 6);
  expect(me(w).party.quill).toBe("with");

  // Ord
  w = talkTo(w, ME, "ord");
  expect(me(w).dialogue?.node).toBe("first");
  w = closeAll(choose(w, ME, "leave"), ME);
  w = tick(w);
  expectStep(w, Q.M1, 7);
  expect(me(w).party.ord).toBe("with");

  // Nara, then the recorder: it is heard before it is decided
  w = talkTo(w, ME, "nara");
  expect(me(w).dialogue?.node).toBe("first");
  if (me(w).guest) {
    expect(me(w).wink).toBe("");
    expect(me(w).dialogue?.wink).toBe("");
  }
  w = choose(w, ME, "help");
  expect(me(w).dialogue?.node).toBe("memorial");
  expect(me(w).dialogue?.choices.map(c => c.id)).toEqual(["look"]);
  w = closeAll(choose(w, ME, "look"), ME);
  w = tick(w);
  expectStep(w, Q.M1, 8);
  w = goTo(w, ME, "memorial-recorder");
  expect(verbsFor({ w, p: me(w), now: w.now }, "memorial-recorder").map(v => v.choice)).toEqual(["listen"]);
  w = interact(w, ME, "memorial-recorder", "listen");
  expect(me(w).flags[F.HEARD_RECORDER]).toBe(1);
  if (o.memorial === "voice") {
    w = talkTo(w, ME, "nara");
    expect(me(w).dialogue?.node).toBe("memorial");
    w = choose(w, ME, "voice");
    expect(me(w).dialogue?.node).toBe("memorial-voice");
    w = closeAll(w, ME);
    w = tick(w);
    expectStep(w, Q.M1, 9);
    expect(w.flags[W.MEMORIAL_VOICE]).toBe(1);
    expect(w.pois["memorial-recorder"].state).toBe("playing");
  } else {
    w = tick(interact(w, ME, "memorial-recorder", "copper"));
    expectStep(w, Q.M1, 9);
    expect(w.pois["memorial-recorder"].state).toBe("dismantled");
    expect(me(w).items.find(i => i.id === "cult:copper-binding")).toMatchObject({ kind: "cult", bound: true });
  }
  expect(me(w).choices[C.MEMORIAL]).toBe(o.memorial);
  expect(me(w).flags[F.MEMORIAL]).toBe(1);
  expect(me(w).party.nara).toBe("with");

  // burial
  w = goTo(w, ME, "nara-plot");
  w = tick(interact(w, ME, "nara-plot", "bury"));
  expectStep(w, Q.M1, 10);
  expect(w.pois["nara-plot"].state).toBe("closed");
  expect(me(w).history.buried).toBe(1);
  expect(me(w).flags[F.BURIED_NARA]).toBe(1);

  // three names for the weather
  w = goTo(w, ME, "safety-plaque");
  w = tick(interact(w, ME, "safety-plaque", "read"));
  expectStep(w, Q.M1, 11);
  expect(me(w).flags[F.WEATHER_SAFETY]).toBe(1);
  w = talkTo(w, ME, "ord");
  expect(me(w).dialogue?.node).toBe("weather");
  w = act(w, ME, { t: "close" });
  expect(me(w).dialogue?.node).toBe("ledger");
  w = closeAll(choose(w, ME, "enter"), ME);
  expect(me(w).choices[C.ORD_LEDGER]).toBe("entered");
  expect(w.news.some(n => n.text.includes("Ord's ledger"))).toBe(true);
  w = talkTo(w, ME, "ord");
  expect(me(w).dialogue?.node).toBe("later");
  expect(me(w).dialogue?.choices[0]?.id).toBe("pair");
  w = closeAll(choose(w, ME, "pair"), ME);
  expect(me(w).flags[F.ORD_PAIR]).toBe(1);
  expect(me(talkTo(w, ME, "ord")).dialogue?.choices.map(c => c.id), "the pair is read once").toEqual(["number", "leave"]);
  w = closeAll(w, ME);
  w = tick(w);
  expectStep(w, Q.M1, 12);
  expect(me(w).flags[F.WEATHER_ORD]).toBe(1);
  w = talkTo(w, ME, "nara");
  expect(me(w).dialogue?.node).toBe("weather");
  expect(me(w).dialogue?.text, "Nara sees the print").toContain("a print of you");
  w = tick(closeAll(w, ME));
  expectStep(w, Q.M1, 13);
  expect(me(w).flags[F.WEATHER_NARA]).toBe(1);

  // the optional courier on the way back: the hour's number, off the Runner
  if (o.bulletin) w = fellRunner(w, ME);

  // name it
  w = goTo(w, ME, "safety-plaque");
  w = interact(w, ME, "safety-plaque", o.weather);
  if (o.bulletin) {
    expect(me(w).heard, "the naming reads the slip").toContain(o.weather === "stability" ? "fold the slip away" : "pin the slip under the word");
    expect(me(w).heard).toContain(String(Math.floor(w.gestell)));
  }
  w = tick(w);
  expectStep(w, Q.M1, 14);
  expect(me(w).choices[C.WEATHER]).toBe(o.weather);
  expect(me(w).flags[F.WEATHER_NAMED]).toBe(1);
  expect(w.pois["safety-plaque"].state).toBe("named");
  expect(w.flags[W.WEATHER_NAMES]).toBe(1);
  if (o.bulletin && o.weather !== "stability") {
    expect(w.flags[W.BULLETIN_POSTED]).toBe(1);
    expect(w.flags[W.BULLETIN_NUMBER], "the figure is pinned with the pin").toBe(Math.floor(w.gestell));
    expect(w.news.some(n => n.text.includes(`pinned the Annex's own number, ${Math.floor(w.gestell)},`))).toBe(true);
    expect(me(interact(w, ME, "safety-plaque", "reread")).heard).toContain(`pinned in someone's hand: the Annex's own number, ${Math.floor(w.gestell)}.`);
  } else {
    expect(w.flags[W.BULLETIN_POSTED]).toBeUndefined();
    expect(w.news.some(n => n.text.includes("pinned"))).toBe(false);
  }
  expect(snapshotFor(w, ME).objective).toMatchObject({ quest: Q.M1, step: "going-under" });

  // the threshold
  w = goTo(w, ME, "going-under");
  return interact(w, ME, "going-under", "under");
}

/** A guest stops at the lip. Asserts the lock and what it forbids, then links the test serial and goes under. */
function guestLockAndLink(w0: WorldState): WorldState {
  let w = w0;
  let p = me(w);
  expect(p.guest).toBe(true);
  expect(p.locked).toBe(true);
  expect(p.heard).toBe(LINES.GUEST_LOCK);
  expect(p.district).toBe("nave");
  expect(w.pois["going-under"].state).toBe("open");

  w = tick(w);
  expectDone(w, Q.M1);
  expect(me(w).movement).toBe(1);
  expect(me(w).flags[F.UNDER]).toBeUndefined();
  expect(me(w).quests[Q.M2]).toBeUndefined();
  const snap = snapshotFor(w, ME);
  expect(snap.you.wink).toBe("");
  expect(snap.you.locked).toBe(true);
  expectNoSpineObjective(w);

  // a locked guest cannot claim, flag, extract or enter the Care
  w = interact(goTo(w, ME, "claims-desk"), ME, "claims-desk", "file");
  expect(me(w).claims).toEqual([]);
  expect(me(w).claimsFiled).toBe(0);
  expect(me(w).heard).toBe(LINES.SPECTATOR);
  w = act(goTo(w, ME, "hot-street"), ME, { t: "flag" });
  expect(me(w).flagged).toBe(false);
  expect(me(w).heard).toBe(LINES.FLAG_GUEST);
  const extracted = me(w).extracted;
  w = interact(goTo(w, ME, "nave-node-3"), ME, "nave-node-3", "extract");
  expect(me(w).extracted).toBe(extracted);
  expect(me(w).heard).toBe(LINES.GUEST_LOCK);
  expect(blockedFor(me(w), CARE_GATE.tx, CARE_GATE.ty)).toBe(true);
  w = tick(w);
  expect(me(w).quests[Q.M2]).toBeUndefined();

  // the link
  w = act(w, ME, { t: "link", serial: TEST_SERIAL, sig: MOCK_SIG });
  p = me(w);
  expect(p.guest).toBe(false);
  expect(p.serial).toBe(TEST_SERIAL);
  expect(p.name).toBe("#7777");
  expect(p.house).toBe("mortals");
  expect(p.messenger).toBe("herald");
  expect(p.locked).toBe(false);
  expect(p.flags[F.ANGEL]).toBe(1);
  expect(p.flags[F.UNDER]).toBeUndefined();
  expect(p.movement).toBe(1);
  expect(p.aura).toBe(p.auraSeed);
  expect(p.auraSeed).toBeGreaterThan(0);
  expect(w.history.some(m => m.serial === TEST_SERIAL)).toBe(true);
  w = tick(w);
  expect(me(w).flags[F.UNDER]).toBeUndefined();
  expect(me(w).quests[Q.M2]).toBeUndefined();

  // the threshold again: an Angel goes under as death and wakes in the Care
  w = interact(goTo(w, ME, "going-under"), ME, "going-under", "under");
  p = me(w);
  expect(p.flags[F.UNDER]).toBe(1);
  expect(p.district).toBe("care");
  expect(p.movement).toBe(2);
  expect([p.x, p.y]).toEqual([SHRINE.x, SHRINE.y]);
  expect(p.respawn).toEqual({ x: SHRINE.x, y: SHRINE.y, district: "care" });
  expect(p.hp).toBe(100);
  expect(blockedFor(p, CARE_GATE.tx, CARE_GATE.ty)).toBe(false);
  w = tick(w);
  expectStep(w, Q.M2, 0);
  // The test serial is a Wink seed, so the school's extra line rides behind the authored one.
  expect(me(w).wink, "the first hint of an Angel's life waits in the Care, not at the lip").toContain(WAKING_WINK);
  expect(snapshotFor(w, ME).you.wink).toContain(WAKING_WINK);
  expect(snapshotFor(w, ME).objective).toMatchObject({ quest: Q.M2, step: "shrine", movement: 2 });
  return w;
}

// ---------------------------------------------------------------- Movement II

type Feudal = { freeze: "sign" | "refuse"; operator: "take" | "refuse"; plate?: Plate };
type Cut = "strait" | "foundry" | "cable" | "whole";
type Plate = "numbered" | "unnumbered";

/** Bury the wreckage garden: Nara kneels at it and asks about the plate; the answer is a decision. */
function buryTheGarden(w0: WorldState, plate: Plate): WorldState {
  let w = use(w0, "wreckage-garden", "bury");
  expect(me(w).flags[F.GARDEN]).toBe(1);
  expect(me(w).dialogue?.node, "Nara asks about the plate").toBe("garden-plate");
  expect(me(w).dialogue?.choices.map(c => c.id)).toEqual(["numbered", "unnumbered", "later"]);
  w = closeAll(choose(w, ME, plate), ME);
  expect(me(w).choices[C.GARDEN]).toBe(plate);
  expect(me(talkTo(w, ME, "nara")).dialogue?.text, "she remembers the plate").toContain(plate === "numbered" ? "a number on it" : "left the plate blank");
  w = closeAll(w, ME);
  return tick(w);
}

function movementTwo(w0: WorldState, o: Feudal): WorldState {
  let w = w0;
  expectStep(w, Q.M2, 0);

  w = tick(use(w, "care-shrine", "rest"));
  expectStep(w, Q.M2, 1);
  expect(me(w).flags[F.SHRINE]).toBe(1);

  // Pim Ashe at the wake: the Care's own book
  expect(snapshotFor(w, ME).objective).toMatchObject({ step: "sexton", target: POSITIONS["home:sexton"] });
  w = talkTo(w, ME, "sexton");
  expect(me(w).dialogue?.node).toBe("wake");
  expect(me(w).dialogue?.text).toContain("You are in the book now");
  w = closeAll(choose(w, ME, "lie"), ME);
  w = tick(w);
  expectStep(w, Q.M2, 2);
  expect(me(w).flags[F.TALKED_SEXTON]).toBe(1);
  expect(me(talkTo(w, ME, "sexton")).dialogue?.node, "met once at the wake, then his hub").toBe("hub");
  w = closeAll(w, ME);

  w = tick(use(w, "hall-mortals", "read"));
  expectStep(w, Q.M2, 3);
  expect(me(w).flags[F.HALL]).toBe(1);
  expect(w.pois["hall-mortals"].state).toBe("lit");
  expect(me(w).wink, "an Angel sees the Wink").not.toBe("");

  // Corvin Slate in the corridor: say what you want the weather to be, then the desk remembers
  expect(snapshotFor(w, ME).objective).toMatchObject({ step: "officer", target: POSITIONS["home:officer"] });
  w = talkTo(w, ME, "officer");
  expect(me(w).dialogue?.node).toBe("corridor");
  expect(me(w).dialogue?.choices.map(c => c.id)).toEqual(["held", "hungry"]);
  const said = o.freeze === "sign" ? "hungry" : "held"; // the desk contradicts the corridor either way
  w = closeAll(choose(w, ME, said), ME);
  w = tick(w);
  expectStep(w, Q.M2, 4);
  expect(me(w).flags[F.TALKED_OFFICER]).toBe(1);
  expect(me(w).choices[C.ANNEX]).toBe(said);
  expect(me(talkTo(w, ME, "officer")).dialogue?.node, "stopped once in the corridor, then his hub").toBe("hub");
  w = closeAll(w, ME);

  const purse = me(w).bestand;
  w = tick(use(w, "safety-desk", o.freeze));
  expectStep(w, Q.M2, 5);
  expect(me(w).heard, "the desk keeps both").toContain(`You said ${said} in the corridor.`);
  if (o.freeze === "sign") {
    expect(me(w).choices[C.FREEZE]).toBe("signed");
    expect(me(w).bestand).toBe(purse - FREEZE_FEE);
    expect(w.frozen.nave).toBeGreaterThan(w.now);
    expect(w.flags[W.FREEZES]).toBe(1);
    expect(w.pois["safety-desk"].state).toBe("frozen");
    expect(snapshotFor(w, ME).frozen).toEqual(["nave"]);
  } else {
    expect(me(w).choices[C.FREEZE]).toBe("refused");
    expect(me(w).bestand).toBe(purse);
    expect(w.frozen.nave).toBeUndefined();
  }

  // The tax window on the way back: pay the hour's tithe now, or let the weather take it at the node
  expect(snapshotFor(w, ME).objective).toMatchObject({ step: "tithe", target: POSITIONS["tax-window"] });
  const beforeTithe = me(w).bestand;
  const standingBefore = w.houses.standing;
  // Both spine verbs stand in the prompt: the Annex's side hours share this window's E and Q and wait for the decision.
  const atWindow = verbsFor({ w: goTo(w, ME, "tax-window"), p: me(w), now: w.now }, "tax-window");
  expect(atWindow.map(v => `${v.key}:${v.choice}`), "the tithe is the window's decision").toEqual(expect.arrayContaining(["E:pay", "Q:ride"]));
  expect(questProgress(me(w), "side-annex-tax-is-climate").started, "the tax hour waits for the tithe").toBe(false);
  w = tick(use(w, "tax-window", o.freeze === "sign" ? "ride" : "pay"));
  expectStep(w, Q.M2, 6);
  expect(me(w).flags[F.TITHE]).toBe(1);
  if (o.freeze === "sign") {
    expect(me(w).choices[C.TITHE]).toBe("rode");
    expect(me(w).bestand).toBe(beforeTithe);
    expect(w.houses.standing).toEqual(standingBefore);
  } else {
    expect(me(w).choices[C.TITHE]).toBe("paid");
    expect(me(w).bestand).toBe(beforeTithe - TITHE_COST);
    expect(w.flags["sunk:tithe"]).toBe(TITHE_COST);
    expect(JSON.stringify(w.houses.standing)).not.toBe(JSON.stringify(standingBefore));
  }
  expect(verbsFor({ w, p: me(w), now: w.now }, "tax-window").map(v => v.choice), "decided once").not.toContain("pay");
  expect(verbsFor({ w, p: me(w), now: w.now }, "tax-window").map(v => v.choice)).not.toContain("ride");

  const history = snapshotFor(w, ME).objective!;
  expect(history.step).toBe("history");
  expect(history.target).toEqual(POSITIONS["history:7777"]);
  w = tick(use(w, "care-shrine", "history"));
  expectStep(w, Q.M2, 7);
  expect(me(w).flags[F.HISTORY]).toBe(1);
  expect(snapshotFor(w, ME).history.map(m => m.serial)).toEqual([TEST_SERIAL]);

  w = tick(use(w, "listing-board", "read"));
  expectStep(w, Q.M2, 8);
  expect(me(w).flags[F.BOARD]).toBe(1);
  expect(w.flags[W.CLEARING_LISTED]).toBe(1);
  expect(w.pois["listing-board"].state).toBe("clearing-listed");
  // the board puts the resistance's Clearing on the Grid, priced, for everyone; the read and the label say the price
  const priced = () => w.market.find(l => l.id === CLEARING_LISTING);
  expect(priced()).toMatchObject({ sellerId: "", sellerName: "the resistance", price: CLEARING_LIST_PRICE });
  expect(me(w).heard).toContain(`${CLEARING_LIST_PRICE} Bestand, the resistance's price today`);
  expect(snapshotFor(w, ME).prompt?.name).toBe(`Listing board — a Clearing at ${CLEARING_LIST_PRICE}`);
  expect(snapshotFor(w, ME).market[0]?.id).toBe(CLEARING_LISTING);
  expect(w.news[w.news.length - 1].text).toBe(`the resistance lists A Clearing, the hole scheduled at ${CLEARING_LIST_PRICE}.`);
  expect(tick(use(w, "listing-board", "read")).market.find(l => l.id === CLEARING_LISTING)?.price, "a second read leaves the price").toBe(CLEARING_LIST_PRICE);

  const organs = POSITIONS["gate-wet-organs"];
  expect(blockedFor(me(w), Math.floor(organs.x / 48), Math.floor(organs.y / 48))).toBe(true);

  if (o.operator === "take") {
    const before = me(w).bestand;
    w = talkTo(w, ME, "vesper");
    expect(me(w).dialogue?.node).toBe("offer");
    w = choose(w, ME, "take");
    expect(me(w).dialogue?.node).toBe("take");
    w = closeAll(w, ME);
    expect(me(w).choices[C.OPERATOR]).toBe("take");
    // the yield funds the door: the desk keeps the door's price back out of it
    expect(me(w).bestand).toBe(before + OPERATOR_YIELD - M3_DOOR_PRICE);
    expect(w.flags["earned:operator"]).toBe(OPERATOR_YIELD);
    expect(w.flags["sunk:door"]).toBe(M3_DOOR_PRICE);
    expect(me(w).current).toBe("cold");
    expect(me(w).flags[F.M3]).toBe(1);
    expect(me(w).party.nara).toBe("waiting");
    expect(w.flags[W.VESPER_GONE]).toBe(1);
    expect(w.pois["operator-desk"].state).toBe("closed");
    // Cold bought an hour: the resistance's price moves up, and the news says by how much
    expect(priced()?.price).toBe(CLEARING_LIST_PRICE + CLEARING_PRICE_MOVE.taken);
    expect(w.news.some(n => n.text === `the resistance prices A Clearing, the hole scheduled at ${CLEARING_LIST_PRICE + CLEARING_PRICE_MOVE.taken}, up from ${CLEARING_LIST_PRICE}.`)).toBe(true);
    w = tick(w);
    // the offer and the door fall in one tick; the movement turns
    expect(snapshotFor(w, ME).npcs.some(n => n.id === "vesper")).toBe(false);
  } else {
    w = tick(use(w, "operator-desk", "refuse"));
    expectStep(w, Q.M2, 9);
    expect(me(w).choices[C.OPERATOR]).toBe("refuse");
    expect(priced()?.price, "an hour not for sale: the price gives").toBe(CLEARING_LIST_PRICE + CLEARING_PRICE_MOVE.refused);
    expect(me(w).flags[F.M3]).toBeUndefined();
    expect(me(w).current).toBe("");
    expect(w.pois["wreckage-garden"].state).toBe("wreck");
    expect(snapshotFor(w, ME).objective).toMatchObject({ step: "door", target: POSITIONS["wreckage-garden"] });
    w = buryTheGarden(w, o.plate ?? "unnumbered");
    expect(w.pois["wreckage-garden"].state).toBe("buried");
    expect(w.flags[W.GARDEN_BURIED]).toBe(1);
    expect(me(w).flags[F.GARDEN]).toBe(1);
    expect(me(w).flags[F.M3]).toBe(1);
    expect(me(w).party.nara).toBe("with");
  }
  expectDone(w, Q.M2);
  expect(me(w).movement).toBe(3);
  expectStep(w, Q.M3, 0);
  expect(blockedFor(me(w), Math.floor(organs.x / 48), Math.floor(organs.y / 48))).toBe(false);
  return w;
}

// ---------------------------------------------------------------- Movement III

function movementThree(w0: WorldState, o: { forge: "spot" | "sell"; cut: Cut; plate: Plate }): WorldState {
  let w = w0;
  const organs: [number, string, string][] = [[0, "organ-strait", F.STRAIT], [1, "organ-foundry", F.FOUNDRY], [2, "organ-cable", F.CABLE]];
  for (const [step, organ, flag] of organs) {
    expectStep(w, Q.M3, step);
    w = tick(use(w, organ, "study"));
    expect(me(w).flags[flag], organ).toBe(1);
  }
  expectStep(w, Q.M3, 3);

  // Ord draws the map and asks where you would cut it; closing without an answer draws nothing
  const ord = npcView({ w, p: me(w), now: w.now }, w.npcs.ord)!;
  expect(ord).toMatchObject({ state: "strait", x: POSITIONS["station:ord-strait"].x, y: POSITIONS["station:ord-strait"].y });
  w = talkTo(w, ME, "ord");
  expect(me(w).dialogue?.node).toBe("map");
  expect(me(w).dialogue?.choices.map(c => c.id)).toEqual(["strait", "foundry", "cable", "whole"]);
  w = tick(closeAll(w, ME));
  expect(me(w).flags[F.MAP], "no answer, no map").toBeUndefined();
  expectStep(w, Q.M3, 3);
  w = talkTo(w, ME, "ord");
  expect(me(w).dialogue?.node).toBe("map");
  w = choose(w, ME, o.cut);
  expect(me(w).dialogue?.node).toBe(`map-${o.cut}`);
  w = tick(closeAll(w, ME));
  expect(me(w).flags[F.MAP]).toBe(1);
  expect(me(w).choices[C.MAP]).toBe(o.cut);
  expect(me(talkTo(w, ME, "ord")).dialogue?.text, "Ord remembers the cut").toContain(o.cut === "strait" ? "You said the water." : o.cut === "whole" ? "You said nowhere." : "You said the");
  expect(w.news.some(n => n.text.includes("told Ord's ledger they would cut it")), "the cut is news").toBe(true);
  w = closeAll(w, ME);

  // the cold desk posts the cut organ's hour first; drawn whole, they come as they are
  w = talkTo(w, ME, "desk");
  if (me(w).dialogue?.node === "greet") w = choose(w, ME, "number");
  w = choose(w, ME, "back");
  expect(me(w).dialogue?.node).toBe("hub");
  const offered = me(w).dialogue!.choices.map(c => c.id);
  if (o.cut === "whole") {
    expect(offered).toEqual(expect.arrayContaining(["toll", "cable", "foundry"]));
    expect(me(w).dialogue?.text).toContain("in the order they are");
  } else {
    const first = { strait: "toll", foundry: "foundry", cable: "cable" }[o.cut];
    expect(offered.filter(id => ["toll", "cable", "foundry"].includes(id)), "only the cut organ's hour").toEqual([first]);
    expect(me(w).dialogue?.text).toContain(`I post the ${o.cut === "strait" ? "Strait" : o.cut === "foundry" ? "Foundry" : "Cable"} first.`);
    w = closeAll(choose(w, ME, first), ME);
    w = talkTo(w, ME, "desk");
    expect(me(w).dialogue!.choices.map(c => c.id), "the others follow once it is offered").toEqual(expect.arrayContaining(["toll", "cable", "foundry"].filter(id => id !== first)));
  }
  w = closeAll(w, ME);

  if (me(w).flags[F.GARDEN]) {
    expectStep(w, Q.M3, 5);
  } else {
    expectStep(w, Q.M3, 4);
    expect(me(w).party.nara).toBe("waiting");
    w = buryTheGarden(w, o.plate);
    expectStep(w, Q.M3, 5);
    expect(me(w).flags[F.GARDEN]).toBe(1);
    expect(me(w).party.nara).toBe("with");
    expect(w.pois["wreckage-garden"].state).toBe("buried");
  }

  // the hour bell once, on the way to the glass: the House of Sky's hour opens on it
  expect(snapshotFor(w, ME).objective).toMatchObject({ step: "bell", target: POSITIONS["hour-bell"] });
  w = tick(use(w, "hour-bell", "strike"));
  expectStep(w, Q.M3, 6);
  expect(me(w).flags[F.BELL]).toBe(1);
  expect(w.pois["hour-bell"].state).toBe("struck");
  expect(me(w).heard).toContain("once, on the way to the glass");
  expect(me(w).quests["side-kerb-omen-glass"], "the sky hour woke on the strike").toBe(0);

  // before the glass, Ord sends you to it; he is not there yet
  expect(me(talkTo(w, ME, "ord")).dialogue?.text).toContain("Face the glass; I will be behind it.");
  w = closeAll(w, ME);
  expect(npcView({ w, p: me(w), now: w.now }, w.npcs.ord)!.state).not.toBe("glass");

  w = tick(use(w, "forecast-glass", "season"));
  expectStep(w, Q.M3, 6);
  expect(me(w).flags[F.FAILED]).toBe(1);
  expect(me(w).heard).toContain("the recorders still standing in it");
  expect(snapshotFor(w, ME).objective, "the step now points at the room behind the glass").toMatchObject({ step: "failed", target: POSITIONS["station:caul-glass"] });

  // the glass faced, Ord is beside it with the figure: last season was captured, not short; read once, then he is at the gate again
  const ordAtGlass = npcView({ w, p: me(w), now: w.now }, w.npcs.ord)!;
  expect(ordAtGlass).toMatchObject({ state: "glass", x: POSITIONS["station:ord-glass"].x, y: POSITIONS["station:ord-glass"].y });

  // the forge taken first takes Ord back to the gate, and the jump from Caul's menu goes with him (a fork; the walk below keeps the order)
  {
    const early = closeAll(choose(talkTo(w, ME, "quill"), ME, o.forge), ME);
    expect(me(early).flags[F.FORGE]).toBe(1);
    expect(npcView({ w: early, p: me(early), now: early.now }, early.npcs.ord)!.state).not.toBe("glass");
    expect(me(talkTo(early, ME, "caul")).dialogue?.choices.map(c => c.id), "no jump to a man who has left the room").not.toContain("figure");
  }

  // the room behind the glass: Anselm Caul in person, the sample, the offer; a reader on one run, the light put out on the other
  expect(npcView({ w, p: me(w), now: w.now }, w.npcs.caul)).toMatchObject({ state: "glass", x: POSITIONS["station:caul-glass"].x, y: POSITIONS["station:caul-glass"].y });
  w = talkTo(w, ME, "caul");
  expect(me(w).dialogue?.node).toBe("glass");
  expect(me(w).dialogue?.text).toContain(me(w).name);
  expect(me(w).dialogue?.text).toContain(me(w).choices[C.FIRST_NODE] === "keep" ? "You kept the first node." : "You extracted at the first node.");
  w = choose(w, ME, "figure");
  expect(me(w).dialogue, "a choice can hand the window to another person").toMatchObject({ npc: "ord", node: "figure" });
  expect(me(w).dialogue?.text).toContain("It was not short of anything.");
  expect(me(w).flags[F.FIGURE]).toBe(1);
  w = choose(w, ME, "back");
  expect(me(w).dialogue, "and back across the desk").toMatchObject({ npc: "caul", node: "offer" });
  expect(me(w).flags[F.CAUL_MET]).toBe(1);
  expect(me(w).flags[F.CAUL_OFFER]).toBe(1);
  w = closeAll(w, ME);
  expect(npcView({ w, p: me(w), now: w.now }, w.npcs.ord)!.state, "he stays in the room until the glass is decided").toBe("glass");
  expect(me(talkTo(w, ME, "ord")).dialogue?.node, "the figure once; then his later line").toBe("figure-after");
  w = closeAll(w, ME);
  w = talkTo(w, ME, "caul");
  expect(me(w).dialogue?.node, "the offer stands until it is decided").toBe("offer");
  if (o.forge === "sell") {
    w = choose(w, ME, "reader");
    expect(me(w).dialogue?.node).toBe("reader");
    expect(me(w).choices[C.GLASS]).toBe("read");
    expect(me(w).current).toBe("cold");
    expect(w.flags[W.GLASS_LINES]).toBe(1);
    w = act(w, ME, { t: "close" });
    expect(me(w).dialogue?.node, "then the question").toBe("looked");
    w = choose(w, ME, "told");
    expect(me(w).flags[F.TOLD_CAUL]).toBe(1);
    w = closeAll(w, ME);
    const glass = snapshotFor(w, ME).glass;
    expect(glass, "the glass in the reader's journal from now on").toMatchObject({ launch: expect.stringMatching(/^season \d+, day 7, 00:00$/), figure: cityFigure(w), hole: w.clearing.heldBy.length });
    expect(glass!.at).toBeGreaterThan(w.now);
    expect(me(use(w, "forecast-glass", "read")).heard, "the reader reads the glass the way the company sees it").toMatch(/Your line is in it, the length of your readiness. The city\x27s figure: \d+\. In the hole: \d+\./);
    const verbs = snapshotFor(goTo(w, ME, "oval-glass"), ME).prompt?.verbs.map(v => v.choice) ?? [];
    expect(verbs, "a reader is never offered the light").not.toContain("dark");
  } else {
    w = choose(w, ME, "no");
    expect(me(w).dialogue?.node).toBe("declined");
    w = act(w, ME, { t: "close" });
    expect(me(w).dialogue?.node).toBe("looked");
    w = closeAll(choose(w, ME, "untold"), ME);
    expect(me(w).choices[C.GLASS]).toBeUndefined();
    expectStep(tick(w), Q.M3, 6);
    expect(snapshotFor(w, ME).objective, "the light is the other way out of the room").toMatchObject({ step: "failed", target: POSITIONS["oval-glass"] });
    // the light put out: readiness, a dark light for everyone, the omen-reader at the glass, and his voice in the dark
    w = use(w, "oval-glass", "dark");
    expect(me(w).choices[C.GLASS]).toBe("dark");
    expect(snapshotFor(w, ME).glass, "no glass in the journal of one who put the light out").toBeNull();
    expect(w.flags[W.DARK_LIGHTS]).toBe(1);
    expect(w.npcs.omen).toMatchObject({ state: "glass", x: SIDE_PLACES["omen-glass"].x, y: SIDE_PLACES["omen-glass"].y });
    expect(w.news.some(n => n.text === "A light went out behind the forecast glass. 1 is dark.")).toBe(true);
    expect(me(w).dialogue, "his voice in the dark").toMatchObject({ npc: "caul", node: "dark" });
    expect(me(w).dialogue?.text, "and the clerks on the stair").toContain("The clerks are on the stair.");
    expect(w.flags[W.CLERKS_DESCENT], "the hour clerks come down the stair for the hour").toBeGreaterThan(w.now);
    expect(tick(w).enemies.some(e => e.id === "hour-clerk-stair-1"), "the first starts down").toBe(true);
    w = closeAll(w, ME);
    w = talkTo(w, ME, "omen");
    expect(me(w).dialogue?.choices.map(c => c.id)).toContain("light");
    w = closeAll(choose(w, ME, "light"), ME);
  }
  expect(me(w).flags[F.CAUL_ASKED]).toBe(1);
  w = tick(w);
  expectStep(w, Q.M3, 7);
  expect(me(talkTo(w, ME, "caul")).dialogue?.node, "later visits").toBe("after");
  if (o.forge !== "sell") expect(me(talkTo(w, ME, "caul")).dialogue?.text, "the clerks still on the stair").toContain("They will be, for the hour.");
  w = closeAll(w, ME);
  expect(npcView({ w, p: me(w), now: w.now }, w.npcs.ord)!.state, "the glass decided, Ord is back at the gate").not.toBe("glass");

  // Quill hands over the print from the Grid with your own serial in the margin; after the choice, the plate she would not cut
  const priceBefore = clearingPrice(w);
  expect(priceBefore).not.toBeNull();
  if (o.forge === "sell") {
    w = interact(goTo(w, ME, "forge-tray"), ME, "forge-tray", "hear");
    expect(me(w).dialogue?.node).toBe("forge-lesson");
    expect(me(w).dialogue?.text).toContain(`Read the margin. ${me(w).name}.`);
    expect(w.pois["forge-tray"].state).toBe("warm");
    w = act(choose(w, ME, "sell"), ME, { t: "close" });
    expect(me(w).dialogue?.node, "the plate follows the print").toBe("forge-plate");
    w = choose(w, ME, "margin");
    expect(me(w).dialogue?.text).toContain("I sold them the margin.");
    w = closeAll(w, ME);
    // the print never reaches your hands: it is on the board at her price, yours when a body buys it; the Clearing is dearer; Cold is your current
    expect(me(w).items.some(i => i.id === "copy:wink")).toBe(false);
    const listing = w.market.find(l => l.sellerId === ME)!;
    expect(listing).toMatchObject({ price: COPY_PRICE, item: { id: "copy:wink", qty: 1 } });
    expect(me(w).fakeWinke, "nothing is held, so nothing is counted in the hand").toBe(0);
    expect(me(w).current).toBe("cold");
    expect(clearingPrice(w), "a hint sold to the Grid makes the Clearing dearer").toBe(priceBefore! + CLEARING_PRICE_MOVE.taken);
    expect(w.news.some(n => n.text === "An Angel listed their own hint on the Grid. The Clearing is dearer.")).toBe(true);
    // her later line follows the print: on the board, sold, back in the hand, or gone to the tray (forks; the walk keeps the board)
    expect(me(talkTo(w, ME, "quill")).dialogue?.text).toContain("Your hint is on the board. It has not sold yet.");
    const buyer = add(w, { ...spawnGuest("buyer"), guest: false, serial: 43, name: "#0043", bestand: 50 });
    const sold = act(buyer, "buyer", { t: "market", op: "buy", listingId: listing.id });
    expect(sold.market.find(l => l.sellerId === ME)).toBeUndefined();
    expect(me(sold).banked, "the price is the seller's when a body buys it").toBe(me(w).banked + COPY_PRICE);
    expect(me(talkTo(sold, ME, "quill")).dialogue?.text).toContain("It sold. The price went to your bank and the fee stayed with me.");
    const down = act(w, ME, { t: "market", op: "cancel", listingId: listing.id });
    expect(me(down).items.some(i => i.id === "copy:wink")).toBe(true);
    expect(me(talkTo(down, ME, "quill")).dialogue?.text).toContain("You took it down. You hold the print.");
    const spotted = interact(goTo(w, ME, "forge-tray"), ME, "forge-tray", "spot");
    expect(spotted.market.find(l => l.sellerId === ME), "Q at the tray takes the print off the board").toBeUndefined();
    expect(me(spotted).items.some(i => i.id === "copy:wink")).toBe(false);
    expect(me(spotted).aura).toBe(me(w).aura + 1);
    expect(me(spotted).heard).toBe("You keep the eye. Your own print comes off the board and goes to the tray. The buried one opens.");
    expect(me(talkTo(spotted, ME, "quill")).dialogue?.text).toContain("It is off the board. Taken down to the tray, or decayed to nothing");
  } else {
    w = talkTo(w, ME, "quill");
    expect(me(w).dialogue?.node).toBe("forge-lesson");
    w = act(choose(w, ME, "spot"), ME, { t: "close" });
    expect(me(w).dialogue?.node, "the plate follows the lesson").toBe("forge-plate");
    w = choose(w, ME, "him");
    expect(me(w).dialogue?.text).toContain("Only time I've been quoted and not paid.");
    w = closeAll(w, ME);
    expect(me(w).items.some(i => i.id === "copy:wink")).toBe(false);
    expect(me(w).fakeWinke).toBe(0);
    // the pull: the board feels it and the street goes hot, for everyone
    expect(clearingPrice(w), "a hint pulled off the Grid gives a little").toBe(priceBefore! + CLEARING_PRICE_MOVE.refused);
    expect(w.pois["hot-street"].state).toBe("hot");
    expect(w.news.some(n => n.text === "An Angel pulled their own hint off the Grid. The hot street is hot.")).toBe(true);
  }
  expect(me(w).choices[C.FORGE]).toBe(o.forge);
  expect(me(w).flags[F.FORGE]).toBe(1);
  w = tick(w);
  expectDone(w, Q.M3);
  expect(me(w).movement).toBe(4);
  expectStep(w, Q.M4, 0);
  return w;
}

// ---------------------------------------------------------------- Movement IV

/** The mortality act with Ione Kade, Ord at the gate and the prepared ring. Returns the world standing at the brink of the Passing. */
function movementFourToTheRing(w0: WorldState, party: "with" | "alone"): WorldState {
  let w = w0;
  expect(snapshotFor(w, ME).npcs.some(n => n.id === "ione")).toBe(true);
  // Caul is on the Grid's edge at its gate from the fourth hour, silent until the hole is kept; the mark Nara looks up at
  expect(npcView({ w, p: me(w), now: w.now }, w.npcs.caul)).toMatchObject({ state: "lip", x: POSITIONS["station:caul-lip"].x, y: POSITIONS["station:caul-lip"].y });
  expect(me(talkTo(w, ME, "caul")).dialogue?.node, "no word until the hole is kept").toBe("lip-silent");
  w = talkTo(w, ME, "ione");
  expect(me(w).dialogue?.node).toBe("offer");
  expect(me(w).dialogue?.text, "the voice on the crate is hers").toContain("You know the voice before she speaks.");
  expect(me(w).dialogue?.text).toContain(me(w).choices[C.MEMORIAL] === "voice" ? "You left it running." : "You took the coil out of it.");
  w = choose(w, ME, "say");
  expect(me(w).dialogue?.node).toBe("lastword");
  expect(me(w).dialogue?.text).toContain("Reverie. The word on the crate; the word on the first form.");
  w = tick(closeAll(w, ME));
  expectStep(w, Q.M4, 1);
  expect(me(w).flags[F.MORTALITY]).toBe(1);
  expect(me(w).choices[C.MORTALITY]).toBe("lastword");
  expect(w.flags[W.IONE_GONE]).toBe(1);
  expect(snapshotFor(w, ME).npcs.some(n => n.id === "ione"), "Ione Kade does not return").toBe(false);

  // Ord at the Care gate with the ledger: the party stands in the ring with you, or you stand alone
  expect(snapshotFor(w, ME).objective).toMatchObject({ step: "party", target: POSITIONS["station:ord-gate"] });
  const ordAtGate = npcView({ w, p: me(w), now: w.now }, w.npcs.ord)!;
  expect(ordAtGate).toMatchObject({ state: "gate", x: POSITIONS["station:ord-gate"].x, y: POSITIONS["station:ord-gate"].y });
  w = talkTo(w, ME, "ord");
  expect(me(w).dialogue?.node).toBe("gate");
  expect(me(w).dialogue?.choices.map(c => c.id)).toEqual(["with", "alone", "later"]);
  const readinessBefore = me(w).readiness;
  const restraintBefore = me(w).restraint;
  w = choose(w, ME, party);
  expect(me(w).dialogue?.node).toBe(`gate-${party}`);
  w = tick(closeAll(w, ME));
  expectStep(w, Q.M4, 2);
  expect(me(w).choices[C.PARTY]).toBe(party);
  expect(me(w).flags[F.GATE]).toBe(1);
  // the tick after the choice drifts restraint by a hundredth; the deltas are the point
  if (party === "with") {
    expect(me(w).readiness).toBeCloseTo(readinessBefore + 4, 1);
    expect(me(w).restraint).toBeCloseTo(restraintBefore, 1);
  } else {
    expect(me(w).readiness).toBeCloseTo(readinessBefore, 1);
    expect(me(w).restraint).toBeCloseTo(restraintBefore + 8, 1);
  }
  expect(me(talkTo(w, ME, "ord")).dialogue?.node, "decided once").toBe("gate-after");
  w = closeAll(w, ME);

  // Nara is at the ring before it is a ring, and reads the number against the floor; so does the journal
  const nara = npcView({ w, p: me(w), now: w.now }, w.npcs.nara)!;
  expect(nara).toMatchObject({ state: "clearing", x: POSITIONS["station:nara-clearing"].x, y: POSITIONS["station:nara-clearing"].y });
  w = talkTo(w, ME, "nara");
  expect(me(w).dialogue?.node).toBe("brink");
  expect(me(w).dialogue?.text).toContain(`Readiness ${Math.round(me(w).readiness)}`);
  expect(me(w).dialogue?.text).toContain(`floor is ${READINESS_PASSING_MIN}`);
  expect(me(w).dialogue?.text, "three numbers").toContain(`The weather at ${Math.floor(w.gestell)}. Then the bodies: ${w.clearing.heldBy.length} in the ring.`);
  w = act(w, ME, { t: "close" });
  expect(me(w).dialogue?.node, "her confession follows, once, with the garden in the ground").toBe("lid");
  expect(me(w).dialogue?.text).toContain("A Clearing is a grave with the lid off.");
  expect(me(w).dialogue?.text).toContain(me(w).choices[C.GARDEN] === "numbered" ? "You put a number on the garden." : "You left the plate blank.");
  w = closeAll(w, ME);
  expect(me(w).flags[F.BRINK]).toBe(1);
  expect(me(w).flags[F.LID]).toBe(1);
  w = talkTo(w, ME, "nara");
  expect(me(w).dialogue?.node).toBe("brink");
  w = act(w, ME, { t: "close" });
  expect(me(w).dialogue, "the lid is said once").toBeNull();
  expect(snapshotFor(w, ME).objective?.detail).toContain(`Readiness ${Math.round(me(w).readiness)} of ${READINESS_PASSING_MIN}`);

  w = tick(use(w, "clearing-ring", "prepare"));
  expectStep(w, Q.M4, 3);
  expect(me(w).flags[F.PREPARE]).toBe(1);
  expect(w.clearing.open).toBe(true);
  expect(w.clearing.contest?.active).toBe(true);
  expect(w.pois["clearing-ring"].state).toBe("open");
  expect(w.clearing.heldBy).toEqual([ME]);
  expect(snapshotFor(w, ME).objective).toMatchObject({ quest: Q.M4, step: "stance" });
  // with the party, Ord walks in behind you; alone, he counts from the gate; either way he reads the number
  const ordAfter = npcView({ w, p: me(w), now: w.now }, w.npcs.ord)!;
  expect(ordAfter.state).toBe(party === "with" ? "clearing" : "gate");
  expect(me(talkTo(w, ME, "ord")).dialogue?.text, "Ord reads the number").toContain(`Readiness ${Math.round(me(w).readiness)}`);
  w = closeAll(w, ME);

  // the first stance is the spine's: keep the hole, and the ring counts it
  const before = me(w).readiness;
  w = tick(use(w, "clearing-ring", "keep"));
  expectStep(w, Q.M4, 4);
  expect(me(w).choices[C.CLEARING]).toBe("keep");
  expect(w.clearing.contest?.votes).toEqual({ [ME]: "keep" });
  expect(me(w).readiness).toBeGreaterThan(before);
  expect(snapshotFor(w, ME).objective).toMatchObject({ quest: Q.M4, step: "passing" });
  expect(snapshotFor(w, ME).objective?.detail).toMatch(/Readiness \d+/);

  // Caul at the lip, now the hole is kept: the hour sold at the desk gets the line, not the form; the hour refused there is offered the signature
  w = talkTo(w, ME, "caul");
  if (me(w).choices[C.OPERATOR] === "take") {
    expect(me(w).dialogue?.node).toBe("lip-sold");
    expect(me(w).dialogue?.text).toContain(`"${me(w).name}. You sold it already. Stand where you like."`);
    expect(me(w).dialogue?.text).toContain(`${OPERATOR_YIELD}, no tax, the door out of it.`);
    w = closeAll(w, ME);
  } else {
    expect(me(w).dialogue?.node).toBe("lip");
    expect(me(w).dialogue?.text).toContain(`"${me(w).name}." He says it the way the clerk wrote it`);
    expect(me(w).dialogue?.text).toContain(`Vesper priced it. ${OPERATOR_YIELD}, no tax, and the door out of it.`);
    expect(me(w).dialogue?.text).toContain("This is the signature.");
    expect((me(w).dialogue?.text ?? "").includes("Mine is on the back of it."), "Safety's form is named only when it was signed").toBe(me(w).choices[C.FREEZE] === "signed");
    expect(me(w).dialogue?.wink).toContain("never once heard this");
    expect(me(w).dialogue?.choices.map(c => c.id)).toEqual(["sign", "refuse", "walk"]);
    // a fork signs: Cold is the current, nothing is paid, he does not ask twice, and the lip's key claims the hour the way the desk's does
    const signed = closeAll(choose(w, ME, "sign"), ME);
    expect(me(signed).choices[C.LIP]).toBe("signed");
    expect(me(signed).current).toBe("cold");
    expect(me(signed).bestand).toBe(me(w).bestand);
    expect(me(talkTo(signed, ME, "caul")).dialogue?.text).toContain(`"${me(w).name}. You signed it already. Stand where you like."`);
    const claimed = pass(ready(signed, { readiness: 85 }));
    expect(me(claimed).choices[C.PASSING], "two keys, one door").toBe("hijack");
    expect(claimed.passing).toMatchObject({ lastOutcome: "hijack", hijackedBy: "cold", lastBy: ME });
    expect(me(claimed).heard).toContain("Cold claimed the hour. Whatever would have crossed, the recorders had it, with a margin.");
    expect(me(talkTo(claimed, ME, "ord")).dialogue?.text).toContain("Cold claimed the hour. You signed for it at the gate, for nothing.");
    expect(me(talkTo(claimed, ME, "caul")).dialogue?.text).toBe("\"Thank you. It is exactly what I was told it would be like.\"");
    // a trace was on the way at 85: the altars now play the marked Angel's own sky, the Appearance with their serial in the margin
    expect(me(claimed).flags).toMatchObject({ [F.HIJACKED_COLD]: 1, [F.HIJACKED_SAFETY]: 0, [F.HIJACK_TRACE]: 1 });
    expect(me(use(claimed, "crt-altar-2", "watch")).heard).toBe(`The Reverie of the Passing: the Appearance, with a margin, and in the margin, small, ${me(w).name}.`);
    // the walk refuses: readiness, a little; the current stands; he waits, and the form is not offered again
    const readinessBefore = me(w).readiness;
    const currentBefore = me(w).current;
    w = closeAll(choose(w, ME, "refuse"), ME);
    expect(me(w).choices[C.LIP]).toBe("refused");
    expect(me(w).readiness).toBeCloseTo(readinessBefore + 4, 5);
    expect(me(w).current).toBe(currentBefore);
    expect(me(talkTo(w, ME, "caul")).dialogue?.node, "decided once: he waits in silence").toBe("lip-silent");
  }
  return goTo(w, ME, "clearing-ring"); // back in the ring, where the walk left the body
}

function throughTheCredits(w0: WorldState): WorldState {
  const w = tick(w0);
  expectDone(w, Q.M4);
  expect(me(w).flags[F.CREDITS]).toBe(1);
  expect(me(w).movement).toBe(5);
  expect(me(w).notices.some(n => n.text.includes("REVERIE: THE GAME"))).toBe(true);
  expectNoSpineObjective(w);
  expect(w.news.some(n => n.text.includes("credits"))).toBe(true);
  return w;
}

// ---------------------------------------------------------------- the ring's ground

describe("the ring's ground follows the hole", () => {
  /** An Angel with the act done, the gate decided and the party willing, standing at the ring of a world whose Clearing is as given. */
  function atTheRing(clearing: Partial<WorldState["clearing"]>, ring?: string, gate: "with" | "alone" | "" = "with"): WorldState {
    const w = emptyWorld();
    const p: Player = {
      ...spawnGuest(ME), guest: false, serial: 42, name: "#0042", house: "sky", messenger: "witness", winkSchool: "omen", auraSeed: 12, aura: 12,
      movement: 4, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.TALKED_ORD]: 1, [F.MAP]: 1, [F.GARDEN]: 1, [F.MORTALITY]: 1, ...(gate ? { [F.GATE]: 1 } : {}) },
      choices: gate ? { [C.PARTY]: gate } : {},
      party: { nara: "with", quill: "with", ord: "with" }, quests: { [Q.M1]: 15, [Q.M2]: 10, [Q.M3]: 8, [Q.M4]: gate ? 2 : 1 },
    };
    const pois = ring ? { ...w.pois, "clearing-ring": { state: ring, by: "other", at: w.now, count: 1 } } : w.pois;
    return goTo(add({ ...w, clearing: { ...w.clearing, ...clearing }, pois }, p), ME, "clearing-ring");
  }
  const offered = (w: WorldState) => verbsFor({ w, p: me(w), now: w.now }, "clearing-ring").map(v => v.choice);

  it("waits for the gate: before Ord's question is answered the ring only stands, whatever the ground, and Ord still asks it", () => {
    const w = atTheRing({}, undefined, "");
    expect(offered(w)).toEqual(["look"]);
    expect(me(interact(w, ME, "clearing-ring", "prepare")).flags[F.PREPARE]).toBeUndefined();
    expect(me(interact(w, ME, "clearing-ring", "look")).heard).toContain("decided there, before the ground");
    const open = atTheRing({ open: true, openedAt: 50, contest: { active: true, keep: 1, extract: 0, endsAt: 500, votes: { other: "keep" } } }, "open", "");
    expect(offered(open)).toEqual(["look"]);
    // Ord asks at the gate whatever the ring's state, and after the answer the ring opens up
    expect(me(talkTo(w, ME, "ord")).dialogue?.node).toBe("gate");
    const decided = closeAll(choose(talkTo(w, ME, "ord"), ME, "alone"), ME);
    expect(offered(goTo(decided, ME, "clearing-ring"))).toContain("prepare");
    // alone and prepared: Ord counts from the gate and says so
    const prepared = interact(goTo(decided, ME, "clearing-ring"), ME, "clearing-ring", "prepare");
    expect(npcView({ w: prepared, p: me(prepared), now: prepared.now }, prepared.npcs.ord)?.state).toBe("gate");
    expect(me(talkTo(prepared, ME, "ord")).dialogue?.text).toContain("I count from the gate");
  });

  it("prepares a set, unspent ring and opens the hole", () => {
    const w = atTheRing({});
    expect(offered(w)).toContain("prepare");
    const after = interact(w, ME, "clearing-ring", "prepare");
    expect(me(after).flags[F.PREPARE]).toBe(1);
    expect(after.clearing.open).toBe(true);
    expect(after.clearing.contest?.active).toBe(true);
  });

  it("while the last hole sets, offers only to stand, says how long, and the flag does not move", () => {
    const w = atTheRing({ openedAt: 100, open: false, contest: null }, "failed");
    const w2 = { ...w, now: 100 + 60 };
    expect(offered(w2)).toEqual(["look"]);
    const pressed = interact(w2, ME, "clearing-ring", "prepare");
    expect(me(pressed).flags[F.PREPARE], "a verb not offered does nothing").toBeUndefined();
    expect(pressed.clearing.open).toBe(false);
    const stood = interact(w2, ME, "clearing-ring", "look");
    expect(me(stood).heard).toContain("has not set: 540 seconds");
    // the period passes: the ground can be prepared again
    expect(offered({ ...w, now: 100 + 600 })).toContain("prepare");
  });

  it("joins a hole another Angel opened instead of opening a second one", () => {
    const w = atTheRing({ open: true, openedAt: 50, contest: { active: true, keep: 1, extract: 0, endsAt: 500, votes: { other: "keep" } } }, "open");
    expect(offered(w)).toEqual(["join"]);
    const after = interact(w, ME, "clearing-ring", "join");
    expect(me(after).flags[F.PREPARE]).toBe(1);
    expect(after.clearing.openedAt, "no second contest").toBe(50);
    expect(after.clearing.contest?.votes).toEqual({ other: "keep" });
    expect(me(after).heard).toContain("open already");
    // and the stance counts on the shared contest
    const kept = interact(after, ME, "clearing-ring", "keep");
    expect(kept.clearing.contest?.votes).toMatchObject({ [ME]: "keep" });
    expect(me(kept).choices[C.CLEARING]).toBe("keep");
  });

  it("with the reserve spent, offers only to stand and says so", () => {
    const w = atTheRing({ reserve: 0 });
    expect(offered(w)).toEqual(["look"]);
    expect(me(interact(w, ME, "clearing-ring", "look")).heard).toContain("reserve is spent");
  });

  it("a hole its last contest kept open, its reserve spent, is stood in: the late Angel joins it, takes its stance and reaches the rite", () => {
    // Kept by its contest and drained after (the reserve fills back only while closed): nothing can open it again this season.
    const held = atTheRing({ open: true, openedAt: 50, reserve: 0, contest: { active: false, keep: 1, extract: 1, endsAt: 170, votes: {} }, lastOutcome: "kept" }, "held");
    const w = { ...held, now: 50 + 6000 };
    expect(offered(w)).toEqual(["join"]);
    const joined = interact(w, ME, "clearing-ring", "join");
    expect(me(joined).flags[F.PREPARE]).toBe(1);
    const kept = interact(joined, ME, "clearing-ring", "keep");
    expect(me(kept).choices[C.CLEARING]).toBe("keep");
    const step = tick(kept);
    expect(offered(step), "the stance taken, the rite is offered").toContain("pass");
    // still setting after a kept contest, the open hole is stood in too, not waited at
    expect(offered({ ...held, now: 50 + 60, clearing: { ...held.clearing, reserve: 20 } })).toEqual(["join"]);
  });
});

// ---------------------------------------------------------------- the desk and the window

describe("the private yield is decided once", () => {
  /** An Angel who has read their hall, standing at Vesper's desk with the purse empty. */
  function atTheDesk(): WorldState {
    const p: Player = {
      ...spawnGuest(ME), guest: false, serial: 42, name: "#0042", house: "sky", messenger: "witness", winkSchool: "omen", auraSeed: 12, aura: 12,
      movement: 2, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.SHRINE]: 1, [F.HALL]: 1 },
      party: { nara: "with", quill: "with", ord: "with" }, quests: { [Q.M1]: 15 },
    };
    return goTo(add(emptyWorld(), p), ME, "operator-desk");
  }

  it("hear at the desk, then E at the desk, then the stale window's take: sixty is paid once and the window is gone", () => {
    let w = atTheDesk();
    w = interact(w, ME, "operator-desk", "hear");
    expect(me(w).dialogue?.node).toBe("offer");
    expect(me(w).dialogue?.choices.map(c => c.id)).toEqual(["take", "refuse", "wait"]);
    w = interact(w, ME, "operator-desk", "take");
    expect(me(w).flags[F.OPERATOR]).toBe(1);
    expect(me(w).bestand).toBe(OPERATOR_YIELD - M3_DOOR_PRICE);
    // The verb closes the stale offer window and opens the oval's line: the Concern's chief, by serial, through the guest's portrait.
    expect(me(w).dialogue, "the stale window is gone; the oval speaks").toMatchObject({ npc: "vesper", node: "oval-taken", speaker: "Anselm Caul", portrait: "guest.jpg", choices: [] });
    expect(me(w).dialogue?.text).toContain(`${me(w).name}. You sold it. I will buy the rest.`);
    w = act(w, ME, { t: "choose", choiceId: "take" });
    expect(me(w).bestand).toBe(OPERATOR_YIELD - M3_DOOR_PRICE);
    expect(w.flags["earned:operator"]).toBe(OPERATOR_YIELD);
    expect(w.flags["sunk:door"]).toBe(M3_DOOR_PRICE);
  });

  it("a window forced open after the decision offers neither take nor refuse, and a raw choose is refused", () => {
    let w = atTheDesk();
    w = interact(w, ME, "operator-desk", "refuse");
    expect(me(w).readiness).toBe(READINESS_REFUSE);
    // a client that keeps the offer open and sends choose anyway
    const forced = add(w, { ...me(w), dialogue: { npc: "vesper", node: "offer", speaker: "Vesper Hale", portrait: "vesper.jpg", text: "", wink: "", choices: [{ id: "take", label: "Take the private yield." }] } });
    const taken = act(forced, ME, { t: "choose", choiceId: "take" });
    expect(me(taken).bestand).toBe(0);
    expect(me(taken).choices[C.OPERATOR]).toBe("refuse");
    expect(me(taken).current).toBe("");
    // and Vesper, spoken to afterwards, does not quote twice
    w = talkTo(w, ME, "vesper");
    expect(me(w).dialogue?.node).toBe("refused");
  });

  it("the forge's listing and pull are Angels' and Movement III's: a guest at the tray moves nothing, and the lesson waits for the third hour", () => {
    // a guest who met Quill walks the open gate to the tray: the verb is not theirs (the board's read is Angels'), and even with the flags forced the policy speaks the spectator's line, no node opens, the city stands
    let w = add(emptyWorld(), { ...spawnGuest("g"), flags: { [F.TALKED_QUILL]: 1 } });
    w = applyListing(w, { id: CLEARING_LISTING, seller: "the resistance", item: { id: "city:clearing", kind: "exhibition", name: "A Clearing", qty: 1, value: 0 }, price: CLEARING_LIST_PRICE });
    expect(verbsFor({ w: goTo(w, "g", "forge-tray"), p: me(goTo(w, "g", "forge-tray"), "g"), now: w.now }, "forge-tray").map(v => v.choice)).not.toContain("hear");
    const guest = { ...me(w, "g"), movement: 3, flags: { [F.TALKED_QUILL]: 1, [F.BOARD]: 1 } };
    w = add(w, guest);
    const at = goTo(w, "g", "forge-tray");
    const tried = interact(at, "g", "forge-tray", "hear");
    expect(me(tried, "g").dialogue).toBeNull();
    expect(me(tried, "g").heard).toBe(LINES.SPECTATOR);
    expect(tried.pois["forge-tray"]?.state).not.toBe("warm");
    expect(clearingPrice(tried)).toBe(CLEARING_LIST_PRICE);
    // belt and braces: the node itself offers a guest neither the listing nor the pull
    const opened = openNode(at, "g", "quill", "forge-lesson");
    expect(me(opened, "g").dialogue?.choices.map(c => c.id)).toEqual(["think"]);
    const forced = act(add(opened, { ...me(opened, "g"), dialogue: { ...me(opened, "g").dialogue!, choices: [{ id: "spot", label: "Pull it." }] } }), "g", { t: "choose", choiceId: "spot" });
    expect(clearingPrice(forced)).toBe(CLEARING_LIST_PRICE);
    expect(forced.pois["hot-street"]?.state).not.toBe("hot");
    expect(forced.news.some(n => n.text.includes("pulled their own hint"))).toBe(false);
    // an Angel who met Quill in the first hour is not offered the lesson at the tray until Movement III, and never before the board is read
    const trayVerbs = (world: WorldState) => verbsFor({ w: goTo(world, ME, "forge-tray"), p: me(goTo(world, ME, "forge-tray")), now: world.now }, "forge-tray").map(v => v.choice);
    const early = add(w, { ...spawnGuest(ME), guest: false, serial: 42, name: "#0042", aura: 20, auraSeed: 20, flags: { [F.TALKED_QUILL]: 1, [F.BOARD]: 1, [F.UNDER]: 1 }, movement: 2 });
    expect(trayVerbs(early)).not.toContain("hear");
    const doorOnly = add(early, { ...me(early), flags: { [F.TALKED_QUILL]: 1, [F.M3]: 1, [F.UNDER]: 1 } });
    expect(trayVerbs(doorOnly), "the Organs door alone does not open the lesson: the price it moves is not on the board yet").not.toContain("hear");
    expect(me(talkTo(doorOnly, ME, "quill")).dialogue?.node).toBe("board-hint");
    const third = add(early, { ...me(early), movement: 3 });
    expect(trayVerbs(third)).toContain("hear");
    expect(me(talkTo(third, ME, "quill")).dialogue?.node).toBe("forge-lesson");
  });

  it("a swing at the man on the lip answers with the guest line and strikes nothing: an Angel in the fourth hour, or a guest on the Grid", () => {
    const lip = POSITIONS["station:caul-lip"];
    const beside = { x: lip.x - 40, y: lip.y, district: districtAt(lip.x - 40, lip.y), facing: { dx: 1, dy: 0 } };
    const angel = add(emptyWorld(), { ...spawnGuest(ME), guest: false, serial: 42, name: "#0042", movement: 4, flags: { [F.UNDER]: 1, [F.ANGEL]: 1 }, ...beside });
    const struck = act(angel, ME, { t: "strike" });
    expect(me(struck).heard).toBe(LINES.GUEST_GRIEF);
    expect(struck.enemies).toEqual(angel.enemies);
    expect(me(struck).strikeCd, "the swing was still a swing").toBeGreaterThan(0);
    // facing away from him, or in the third hour when he is not on the lip, the swing says nothing of him
    expect(me(act(add(angel, { ...me(angel), facing: { dx: -1, dy: 0 } }), ME, { t: "strike" })).heard).not.toBe(LINES.GUEST_GRIEF);
    expect(me(act(add(angel, { ...me(angel), movement: 3 }), ME, { t: "strike" })).heard).not.toBe(LINES.GUEST_GRIEF);
    // a body beside him keeps the sweep's own answer: an unflagged Angel in reach is refused for the flag, not for the guest
    const crowded = add(angel, { ...spawnGuest("other"), guest: false, serial: 43, name: "#0043", movement: 4, flags: { [F.UNDER]: 1, [F.ANGEL]: 1 }, ...beside, x: lip.x - 10 });
    expect(me(act(crowded, ME, { t: "strike" })).heard).toBe(LINES.PVP_FLAG_REQUIRED);
    // the heavy answers the same
    const wound = act(angel, ME, { t: "heavy" });
    const landed = tick(wound, 20);
    expect(me(landed).heard).toBe(LINES.GUEST_GRIEF);
    // a guest who walks the Grid finds him on the lip too: the same line for the swing, and his own for the talk
    const guest = add(emptyWorld(), { ...spawnGuest("g"), ...beside });
    expect(me(act(guest, "g", { t: "strike" }), "g").heard).toBe(LINES.GUEST_GRIEF);
    expect(me(talkTo(guest, "g", "caul"), "g").dialogue?.node).toBe("lip-guest");
    expect(me(talkTo(guest, "g", "caul"), "g").dialogue?.text).toContain("He does not say a serial; you have none.");
  });

  it("the memorial, the last word and the forge lesson cannot be chosen twice either", () => {
    let w = add(emptyWorld(), spawnGuest(ME));
    w = talkTo(w, ME, "nara");
    w = closeAll(choose(w, ME, "leave"), ME);
    w = interact(goTo(w, ME, "memorial-recorder"), ME, "memorial-recorder", "listen");
    w = talkTo(w, ME, "nara");
    expect(me(w).dialogue?.node).toBe("memorial");
    w = choose(w, ME, "voice");
    w = closeAll(w, ME);
    expect(me(w).flags[F.MEMORIAL]).toBe(1);
    const again = add(w, { ...me(w), dialogue: { npc: "nara", node: "memorial", speaker: "Nara Vale", portrait: "nara.jpg", text: "", wink: "", choices: [{ id: "copper", label: "x" }] } });
    const copper = act(again, ME, { t: "choose", choiceId: "copper" });
    expect(me(copper).choices[C.MEMORIAL]).toBe("voice");
    expect(me(copper).items).toEqual([]);
  });
});

// ---------------------------------------------------------------- the runs

describe("the spine, played through", () => {
  it("has four movements of the authored length", () => {
    expect(questById(Q.M1)!.steps.length).toBe(15);
    expect(questById(Q.M2)!.steps.length).toBe(10);
    expect(questById(Q.M3)!.steps.length).toBe(8);
    expect(questById(Q.M4)!.steps.length).toBe(6);
  });

  it("an Angel linked before the first step walks the first hour as a guest would and wakes in the Care at the going-under", () => {
    // the runs below link at the guest's lock; here the link comes first, so the hand-outs and the journal are read for an
    // Angel with no `under` all through Movement I (the reach check after every action)
    let w = add(emptyWorld(), spawnGuest(ME));
    w = act(w, ME, { t: "link", serial: TEST_SERIAL, sig: MOCK_SIG });
    expect(me(w)).toMatchObject({ guest: false, movement: 1 });
    w = movementOne(w, { node: "extract", extra: [], memorial: "copper", weather: "process", bulletin: true });
    expect(me(w)).toMatchObject({ locked: false, movement: 2, district: "care" });
    expect(me(w).flags[F.UNDER]).toBe(1);
    w = tick(w);
    expectStep(w, Q.M2, 0);
  });

  it("run one: extract, the copper, the process, refuse the freeze, take the private yield, sell the print, Cold claims the hour", () => {
    let w = add(emptyWorld(), spawnGuest(ME));
    w = movementOne(w, { node: "extract", extra: [], memorial: "copper", weather: "process", bulletin: true });
    expect(me(w).extracted, "both nodes extracted").toBe(2);
    expect(w.flags[W.EXTRACTIONS]).toBe(2);
    w = guestLockAndLink(w);

    w = movementTwo(w, { freeze: "refuse", operator: "take" });
    expect(me(w).current).toBe("cold");
    w = movementThree(w, { forge: "sell", cut: "strait", plate: "numbered" });
    const brink = movementFourToTheRing(w, "with");

    // readiness below the floor: the hour does not open, whoever funded the door
    const short = pass(brink);
    expect(me(short).choices[C.PASSING]).toBe("failed");

    // with the ground ready, Cold claims the hour the private yield paid for
    let a = pass(ready(brink, { readiness: 70 }));
    expect(me(a).flags[F.PASSING]).toBe(1);
    expect(me(a).choices[C.PASSING]).toBe("hijack");
    expect(a.passing).toMatchObject({ count: 1, lastOutcome: "hijack", hijackedBy: "cold", lastBy: ME });
    expect(me(a).history).toMatchObject({ passings: 1, outcomes: ["hijack"] });
    expect(me(a).heard).toContain("Cold claimed the hour. Whatever would have crossed, the recorders had it, with a margin.");
    expect(a.news.some(n => n.text === `${me(a).name} sold their Passing. Cold claimed the hour at their Clearing; the margin has a serial in it.`)).toBe(true);
    const thanked = talkTo(a, ME, "caul");
    expect(me(thanked).dialogue?.text, "he does not gloat").toBe("\"Thank you. It is exactly what I was told it would be like.\"");
    expect(me(talkTo(closeAll(thanked, ME), ME, "caul")).dialogue?.node, "his word on the rite is said once").toBe("lip-silent");
    expect(me(talkTo(a, ME, "ord")).dialogue?.text).toContain("Cold claimed the hour. You funded it.");
    expect(w.flags[W.PASSINGS] ?? 0).toBe(0);
    expect(a.flags[W.PASSINGS]).toBe(1);
    expect(pass(a).passing.count, "the Passing resolves once per Angel").toBe(1);
    a = throughTheCredits(a);
    // the hour taken under the appearance floor: every altar this Angel passes plays an empty sky with their serial in the margin; the dark altar too
    expect(me(a).flags).toMatchObject({ [F.HIJACKED_COLD]: 1, [F.HIJACKED_SAFETY]: 0, [F.HIJACK_TRACE]: 0 });
    const reel = `The Reverie of the Passing: an empty sky through an oval, with a margin, and in the margin, small, ${me(a).name}.`;
    expect(me(use(a, "crt-altar-2", "watch")).heard).toBe(reel);
    const dark = use(a, "crt-altar-1", "watch");
    expect(me(dark).heard).toBe(reel);
    expect(me(dark).wink, "the room's hint is not given over the marked body's own sky").not.toContain("The room on the screen is this one.");
    expect(dark.pois["crt-altar-1"].state, "the shared altar still lights").toBe("lit");
    // another body at the same altar sees its own sky: the catalog as it always played
    const other = add(a, { ...spawnGuest("other"), guest: false, serial: 43, name: "#0043", flags: { [F.UNDER]: 1, [F.ANGEL]: 1 } });
    expect(me(interact(goTo(other, "other", "crt-altar-2"), "other", "crt-altar-2", "watch"), "other").heard).toContain("The kneelers call it a reverie.");

    // the party after the hour
    a = talkTo(a, ME, "nara");
    expect(me(a).dialogue?.node).toBe("after");
    expect(me(a).dialogue?.text).toContain("claimed the hour");
    a = closeAll(a, ME);
    a = talkTo(a, ME, "quill");
    expect(me(a).dialogue?.text).toContain("Your serial is in the margin of the sky now.");
  });

  it("run two: keep, the voice, the end of world as world, sign the freeze, refuse the yield, bury the garden, spot the copy, every outcome", () => {
    let w = add(emptyWorld(), spawnGuest(ME));
    w = movementOne(w, { node: "keep", extra: ["nave-node-2", "nave-node-2"], memorial: "voice", weather: "end" });
    expect(me(w).kept).toBe(1);
    expect(me(w).extracted).toBe(2);
    expect(me(w).bestand).toBeGreaterThanOrEqual(FREEZE_FEE);
    w = guestLockAndLink(w);

    w = movementTwo(w, { freeze: "sign", operator: "refuse", plate: "unnumbered" });
    w = movementThree(w, { forge: "spot", cut: "whole", plate: "unnumbered" });
    const brink = movementFourToTheRing(w, "alone");
    expect(me(brink).restraint).toBeGreaterThanOrEqual(50);
    expect(me(brink).party).toMatchObject({ nara: "with", ord: "with" });

    // appearance: readiness at the threshold, the weather mixed, nobody claiming
    {
      let a = pass(ready(brink, { readiness: 85 }));
      expect(me(a).choices[C.PASSING]).toBe("appearance");
      expect(a.passing).toMatchObject({ lastOutcome: "appearance", hijackedBy: "", lastBy: ME, count: 1 });
      expect(a.news.some(n => n.text.includes(`${me(a).name}, alone, prepared the ground`)), "the city writes that you stood alone").toBe(true);
      expect(a.passing.appearanceUntil).toBeGreaterThan(a.now);
      expect(me(a).bestand).toBe(me(brink).bestand + PASSING_STIPEND);
      expect(a.flags["earned:stipend"]).toBe(PASSING_STIPEND);
      expect(me(a).history.outcomes).toEqual(["appearance"]);
      a = throughTheCredits(a);
      // after the credits the altars play on (IV.8)
      expect(me(use(a, "crt-altar-1", "watch")).heard).toBe("The altar plays. Ninety seconds of someone's sky, a bell, a serial in the margin. People kneel. The tubes are warm.");
      a = talkTo(a, ME, "ord");
      expect(me(a).dialogue?.node).toBe("after");
      expect(me(a).dialogue?.text).toContain("A trace");
      // first the crew in the van beside the lip (IV.7), then his question
      const crew = talkTo(a, ME, "caul");
      expect(me(crew).dialogue?.text).toBe("At the van beside the lip, to the crew: \"Play it again.\" The crew, in the van, rewinding: \"There is nothing on it.\" \"Then sell that.\"");
      expect(me(act(crew, ME, { t: "close" })).dialogue?.text, "he stood still for the whole of it").toContain("The second time, the only question he asks twice: \"What did it look like.\"");
      // after a trace Nara goes home from the ring; only an Absence keeps her there
      expect(npcView({ w: a, p: me(a), now: a.now }, a.npcs.nara)?.state).not.toBe("clearing");
    }

    // absence: enough to stand, not enough for a trace
    {
      const a = pass(ready(brink, { readiness: 65 }));
      expect(me(a).choices[C.PASSING]).toBe("absence");
      expect(a.passing).toMatchObject({ lastOutcome: "absence", hijackedBy: "" });
      expect(me(a).wink, "the hint on an absence").toBe("You went under once and came back. The hour did the same. Neither of you arrived.");
      expect(me(a).bestand).toBe(me(brink).bestand);
      expect(a.passing.appearanceUntil).toBe(0);
      // through the mast's oval first (IV.7), then pleasantly, to you
      const oval = talkTo(a, ME, "caul");
      expect(me(oval).dialogue?.text).toBe("Through the mast's oval, after a while: \"Absence has a margin too.\"");
      expect(me(act(oval, ME, { t: "close" })).dialogue?.text).toContain("Next season. Same ring. I will have the number by then.");
      // this season's altars play the empty sky the rite made
      expect(me(use(a, "crt-altar-2", "watch")).heard).toBe("Ninety seconds of an empty sky through an oval, with a margin, and the tag in the corner. People kneel.");
      // Nara stays at the ring after an Absence, through the credits and after, and says so
      const stayed = throughTheCredits(a);
      expect(npcView({ w: stayed, p: me(stayed), now: stayed.now }, stayed.npcs.nara)).toMatchObject({ state: "clearing", x: POSITIONS["station:nara-clearing"].x, y: POSITIONS["station:nara-clearing"].y });
      expect(me(talkTo(stayed, ME, "nara")).dialogue?.text).toContain("The hour went by. Absence is honest. I stay.");
      // after the credits the altars play on, someone's sky (IV.8); the Absence's own reel is this season's and comes first
      expect(me(use(stayed, "crt-altar-2", "watch")).heard).toBe("Ninety seconds of an empty sky through an oval, with a margin, and the tag in the corner. People kneel.");
    }

    // hijack: the freeze was signed and restraint is spent; Safety eats the rite
    {
      const a = pass(ready(brink, { readiness: 85, restraint: 40 }));
      expect(me(a).choices[C.PASSING]).toBe("hijack");
      expect(a.passing).toMatchObject({ lastOutcome: "hijack", hijackedBy: "safety" });
      expect(me(talkTo(a, ME, "caul")).dialogue?.text).toBe("\"Safety's form. Mine on the back. Thank you. It is exactly what I was told it would be like.\"");
      expect(me(talkTo(a, ME, "ord")).dialogue?.text).toContain("Safety claimed the hour. The freeze ate the rite.");
      // Safety's reel on the altars: the district holding still, the form under it
      expect(me(a).flags).toMatchObject({ [F.HIJACKED_COLD]: 0, [F.HIJACKED_SAFETY]: 1, [F.HIJACK_TRACE]: 1 });
      expect(me(use(a, "crt-altar-2", "watch")).heard).toBe("A district holding still, sold back to it by the hour. Under the reel, the form; under the form, smaller, funded by.");
    }

    // failed: readiness under the floor
    {
      const a = pass(ready(brink, { readiness: 50 }));
      expect(me(a).choices[C.PASSING]).toBe("failed");
      expect(me(talkTo(a, ME, "caul")).dialogue?.text, "already leaving").toContain("\"Next season. Same ring.\"");
    }

    // failed: the party walked
    {
      const a = pass(ready(brink, { readiness: 85, party: { ...me(brink).party, nara: "gone" } }));
      expect(me(a).choices[C.PASSING]).toBe("failed");
      expect(a.passing.lastOutcome).toBe("failed");
    }

    // failed: meltdown, and one Angel cannot hold the ring alone
    {
      let a = pass({ ...ready(brink, { readiness: 85 }), gestell: 95 });
      expect(me(a).choices[C.PASSING]).toBe("failed");
      expect(a.passing).toMatchObject({ lastOutcome: "failed", hijackedBy: "" });
      // this season's hole joins last season's, which every shard starts with
      expect(a.failed.filter(f => f.season === a.season.id).map(f => f.id)).toEqual(["failed-1"]);
      expect(a.failed.some(f => f.season === 0)).toBe(true);
      expect(a.pois["clearing-ring"].state).toBe("failed");
      expect(a.clearing.open).toBe(false);
      expect(me(a).bestand).toBe(me(brink).bestand);
      // the failed mark shows to Ruin-sight, Storm or Sky; a Herald of Mortals in Restraint sees the ring, not the hole
      expect(snapshotFor(a, ME).failed).toEqual([]);
      expect(snapshotFor(act(a, ME, { t: "stance" }), ME).failed.map(f => f.id)).toContain("failed-1");
      a = throughTheCredits(a);
      expect(me(a).history.outcomes).toEqual(["failed"]);
    }

    // held: at the same meltdown, two Angels dwelling in the ring keep the hour open
    {
      let h = add(brink, spawnGuest(ALLY, brink.now));
      h = act(h, ALLY, { t: "link", serial: 42, sig: MOCK_SIG });
      expect(me(h, ALLY).guest).toBe(false);
      h = tick(goTo(h, ALLY, "clearing-ring"));
      expect([...h.clearing.heldBy].sort()).toEqual([ALLY, ME].sort());
      h = pass({ ...ready(h, { readiness: 85 }), gestell: 95 });
      expect(h.gestell).toBeGreaterThanOrEqual(91);
      expect(me(h).choices[C.PASSING]).toBe("appearance");
      expect(me(h, ALLY).flags[F.PASSING], "the rite is the preparer's").toBeUndefined();
      expect(me(h, ALLY).flags[F.CREDITS]).toBeUndefined();
    }
  });
});
