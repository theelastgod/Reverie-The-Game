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
import { DT, FREEZE_FEE, M3_DOOR_PRICE, MOCK_SIG, OPERATOR_YIELD, PASSING_STIPEND, READINESS_PASSING_MIN, READINESS_REFUSE, TEST_SERIAL, TITHE_COST } from "./constants";
import { POSITIONS, blockedFor, districtAt } from "./map";
import type { ClientMsg } from "./protocol";
import { C, F, Q, W } from "./content/ids";
import { verbsFor } from "./interact";
import { LINES } from "./content";
import type { Player, WorldState } from "./types";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { applyAction } from "./actions";
import { questById, questProgress } from "./quests";
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
  return cur;
}

const act = (w: WorldState, id: string, msg: ClientMsg): WorldState => applyAction(w, id, msg);
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
    expect(me(w).heard).toContain(String(Math.round(w.gestell)));
  }
  w = tick(w);
  expectStep(w, Q.M1, 14);
  expect(me(w).choices[C.WEATHER]).toBe(o.weather);
  expect(me(w).flags[F.WEATHER_NAMED]).toBe(1);
  expect(w.pois["safety-plaque"].state).toBe("named");
  expect(w.flags[W.WEATHER_NAMES]).toBe(1);
  if (o.bulletin && o.weather !== "stability") {
    expect(w.flags[W.BULLETIN_POSTED]).toBe(1);
    expect(w.news.some(n => n.text.includes("pinned the Annex's own number"))).toBe(true);
    expect(me(interact(w, ME, "safety-plaque", "reread")).heard).toContain("pinned in someone's hand");
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
    w = tick(w);
    // the offer and the door fall in one tick; the movement turns
    expect(snapshotFor(w, ME).npcs.some(n => n.id === "vesper")).toBe(false);
  } else {
    w = tick(use(w, "operator-desk", "refuse"));
    expectStep(w, Q.M2, 9);
    expect(me(w).choices[C.OPERATOR]).toBe("refuse");
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

  w = tick(use(w, "forecast-glass", "season"));
  expectStep(w, Q.M3, 7);
  expect(me(w).flags[F.FAILED]).toBe(1);

  if (o.forge === "sell") {
    w = interact(goTo(w, ME, "forge-tray"), ME, "forge-tray", "hear");
    expect(me(w).dialogue?.node).toBe("forge-lesson");
    expect(w.pois["forge-tray"].state).toBe("warm");
    w = closeAll(choose(w, ME, "sell"), ME);
    expect(me(w).items.find(i => i.id === "copy:wink")).toMatchObject({ kind: "exhibition", qty: 1 });
    expect(me(w).fakeWinke).toBe(1);
  } else {
    w = talkTo(w, ME, "quill");
    expect(me(w).dialogue?.node).toBe("forge-lesson");
    w = closeAll(choose(w, ME, "spot"), ME);
    expect(me(w).items.some(i => i.id === "copy:wink")).toBe(false);
    expect(me(w).fakeWinke).toBe(0);
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
  w = talkTo(w, ME, "ione");
  expect(me(w).dialogue?.node).toBe("offer");
  w = choose(w, ME, "say");
  expect(me(w).dialogue?.node).toBe("lastword");
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
  w = closeAll(w, ME);
  expect(me(w).flags[F.BRINK]).toBe(1);
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
  return w;
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
  /** An Angel with the act done and the party willing, standing at the ring of a world whose Clearing is as given. */
  function atTheRing(clearing: Partial<WorldState["clearing"]>, ring?: string): WorldState {
    const w = emptyWorld();
    const p: Player = {
      ...spawnGuest(ME), guest: false, serial: 42, name: "#0042", house: "sky", messenger: "witness", winkSchool: "omen", auraSeed: 12, aura: 12,
      movement: 4, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.GARDEN]: 1, [F.MORTALITY]: 1 },
      party: { nara: "with", quill: "with", ord: "with" }, quests: { [Q.M1]: 15, [Q.M2]: 10, [Q.M3]: 8, [Q.M4]: 1 },
    };
    const pois = ring ? { ...w.pois, "clearing-ring": { state: ring, by: "other", at: w.now, count: 1 } } : w.pois;
    return goTo(add({ ...w, clearing: { ...w.clearing, ...clearing }, pois }, p), ME, "clearing-ring");
  }
  const offered = (w: WorldState) => verbsFor({ w, p: me(w), now: w.now }, "clearing-ring").map(v => v.choice);

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
    expect(me(w).dialogue, "a verb on the world closes the stale window").toBeNull();
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
    expect(w.flags[W.PASSINGS] ?? 0).toBe(0);
    expect(a.flags[W.PASSINGS]).toBe(1);
    expect(pass(a).passing.count, "the Passing resolves once per Angel").toBe(1);
    a = throughTheCredits(a);

    // the party after the hour
    a = talkTo(a, ME, "nara");
    expect(me(a).dialogue?.node).toBe("after");
    expect(me(a).dialogue?.text).toContain("claimed the hour");
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
      a = talkTo(a, ME, "ord");
      expect(me(a).dialogue?.node).toBe("after");
      expect(me(a).dialogue?.text).toContain("A trace");
    }

    // absence: enough to stand, not enough for a trace
    {
      const a = pass(ready(brink, { readiness: 65 }));
      expect(me(a).choices[C.PASSING]).toBe("absence");
      expect(a.passing).toMatchObject({ lastOutcome: "absence", hijackedBy: "" });
      expect(me(a).bestand).toBe(me(brink).bestand);
      expect(a.passing.appearanceUntil).toBe(0);
    }

    // hijack: the freeze was signed and restraint is spent; Safety eats the rite
    {
      const a = pass(ready(brink, { readiness: 85, restraint: 40 }));
      expect(me(a).choices[C.PASSING]).toBe("hijack");
      expect(a.passing).toMatchObject({ lastOutcome: "hijack", hijackedBy: "safety" });
    }

    // failed: readiness under the floor
    {
      const a = pass(ready(brink, { readiness: 50 }));
      expect(me(a).choices[C.PASSING]).toBe("failed");
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
