import { describe, expect, it, vi } from "vitest";

/**
 * The engine glue against a tiny inline content fixture: one NPC with a
 * three-node conversation, one POI with F / E / Q verbs (a cost, a once flag,
 * a guest-denied verb), a two-step spine quest, a one-step side quest.
 */
const FIX = vi.hoisted(() => {
  const per = (v: string) => ({ herald: v, witness: v, ruin: v, dweller: v, cybernetic: v, iridescent: v });
  const LINES = {
    GUEST_LOCK: "A guest cannot prepare the ground.",
    SPECTATOR: "You see a door. You do not see what it is for.",
    ALREADY: "You already did.",
    CANT_AFFORD: "The purse is short.",
    CANT_USE: "That does not use.",
    FROZEN: "Frozen.",
    DODGE_COPY: "Dodged.",
    DODGE_WHIFF: "Whiff.",
    INTERRUPT: "Interrupted.",
    HIT_COPY: "Hit.",
    ARENA_HIT: "The dummy stands back up.",
    GUEST_GRIEF: "A guest is not a spoils path.",
    TRUCE_ACTIVE: "A truce holds.",
    PRACTICE_SAFE: "Practice ground.",
    PVP_FLAG_REQUIRED: "Both must be flagged.",
    FLAG_GUEST: "You are not flagged. You are not spoils.",
    FLAG_WHERE: "Not here.",
    FLAG_ON: "Flagged.",
    FLAG_OFF: "Unflagged.",
    TRUCE_COPY: "Truce.",
    SPOILS_COPY: "Spoils.",
    CAMP_COPY: "Camping.",
    DUEL_COPY: "A duel at a wreckage.",
    SPECTATE_COPY: "You watched.",
    STORM_PRESS: "Storm presses.",
    STORM_FALLEN: "Already fallen.",
    KIT_GUEST: "No kit.",
    KIT_COOLDOWN: "The kit cools.",
    KIT_NEED: per("Need."),
    KIT_COPY: per("Kit."),
    CLAIMS_GUEST: "A period on a ledger. Guests cannot claim.",
    CLAIMS_FILED: "Filed.",
    CLAIMS_HELD: "Held.",
    CLAIMS_TAKEN: "Taken.",
    CLAIMS_CAP: "Capped.",
    BANKED: "Banked.",
    LINK_ELSEWHERE: "That serial walks in another body.",
    LINK_COPY: (serial: number, house: string, messenger: string) => `Sealed. #${serial} ${house} ${messenger}.`,
    NARA_LEAVES: "Nara leaves.",
    NARA_WAITS: "Nara waits.",
    LOOT_COPY: "You loot the fallen.",
    BURY_COPY: "You bury the fallen.",
    DEATH_BY: (name: string) => `${name} did their job.`,
    INSURANCE_USED: "The paper burned for you.",
    WEATHER_LABELS: { stability: "stability", process: "the process", end: "the end of world as world" },
    WEATHER_NAMES: ["stability", "the process", "the end of world as world"],
    WINKE: { hint: ["h"], wreckage: ["w"], omen: ["o"], dwelling: ["d"], process: ["p"], surface: ["s"] },
    CREDITS: ["REVERIE: THE GAME"],
  };

  type AnyCtx = { w: { flags: Record<string, number> }; p: { flags: Record<string, number>; readiness: number; movement: number } };

  const NPCS = {
    nara: {
      id: "nara", name: "Nara Vale", role: "Sexton", home: "nara", portrait: "nara.jpg", sprite: "nara", party: true,
      entry: () => "hello",
      nodes: {
        hello: {
          id: "hello", text: "Hello.", wink: "A private line.",
          choices: [
            { id: "a", label: "Go on", effects: [{ kind: "flag", key: "chose:a" }], next: "second" },
            { id: "b", label: "Leave", effects: [{ kind: "say", text: "Left." }] },
            { id: "hidden", label: "Hidden", when: (ctx: AnyCtx) => !!ctx.p.flags["never"] },
          ],
        },
        second: { id: "second", text: "Second.", next: "third", effects: [{ kind: "count", key: "opened:second", delta: 1 }] },
        third: { id: "third", text: "Third." },
      },
    },
    quill: {
      id: "quill", name: "Quill", role: "Forger", home: "quill", portrait: "quill.jpg", sprite: "quill", party: true,
      personal: (ctx: AnyCtx) => (ctx.p.flags["hide:quill"] ? { present: false } : null),
      entry: () => "hi",
      nodes: { hi: { id: "hi", text: "Hi." } },
    },
  };

  const POI_CONFIGS = {
    "safety-plaque": {
      id: "safety-plaque", label: "Office of Safety plaque",
      verbs: [
        { key: "F", label: "Read", choice: "read", once: "read:plaque", effects: [{ kind: "flag", key: "weather:safety" }], say: "Read it." },
        { key: "E", label: "Pay", choice: "pay", cost: { bestand: 5, sink: "tax" }, effects: [{ kind: "readiness", delta: 4 }, { kind: "flag", key: "paid" }], say: "Paid." },
        { key: "Q", label: "Sacred", choice: "sacred", guest: "deny", effects: [{ kind: "flag", key: "sacred" }], say: "Sacred." },
      ],
    },
    "care-shrine": {
      id: "care-shrine", label: "Care shrine",
      verbs: [{ key: "F", label: "Rest", choice: "rest", guest: "spectate", effects: [{ kind: "flag", key: "shrine" }] }],
    },
  };

  const QUESTS = [
    {
      id: "m1-diagnosis", title: "Diagnosis", kind: "spine", movement: 1, district: "nave", guestLegal: true, changes: "spine",
      available: () => true,
      onStart: [{ kind: "flag", key: "m1:started" }],
      steps: [
        { id: "read", title: "Read the plaque", detail: "F to read", target: "safety-plaque", plate: "plate-arena.jpg", done: (ctx: AnyCtx) => !!ctx.p.flags["weather:safety"], onComplete: [{ kind: "notice", text: "Read." }] },
        { id: "pay", title: "Pay", detail: "E to pay", target: "nara", done: (ctx: AnyCtx) => !!ctx.p.flags["paid"] },
      ],
      onFinish: [{ kind: "count", key: "m1:finished", delta: 1 }],
    },
    {
      id: "m2-techno-feudal", title: "Techno-feudal", kind: "spine", movement: 2, district: "care", guestLegal: false, changes: "spine",
      available: (ctx: AnyCtx) => ctx.p.movement >= 2,
      steps: [{ id: "wait", title: "Wait", detail: "", target: "care-shrine", done: () => false }],
    },
    {
      id: "side-nave-test", title: "A side", kind: "side", movement: 1, district: "nave", guestLegal: true, changes: "poi",
      available: (ctx: AnyCtx) => !!ctx.p.flags["weather:safety"],
      steps: [{ id: "s", title: "Side step", detail: "", target: "nara", done: (ctx: AnyCtx) => ctx.p.readiness > 0, onComplete: [{ kind: "poi", id: "crt-altar-1", state: "lit" }] }],
      onFinish: [{ kind: "worldFlag", key: "side:done" }],
    },
  ];

  return { LINES, NPCS, POI_CONFIGS, QUESTS, NEWS: {} };
});

vi.mock("./content", () => FIX);
vi.mock("./content/lines", () => FIX.LINES);

import { MOCK_SIG } from "./constants";
import { NPC_HOMES, POSITIONS } from "./map";
import type { ClientMsg } from "./protocol";
import type { Player, WorldState } from "./types";
import { emptyWorld, spawnGuest } from "./world";
import { applyEffects } from "./effects";
import { applyChoose, applyClose, applyTalk } from "./dialogue";
import { applyInteract, verbsFor } from "./interact";
import { objectiveFor, questProgress, tickQuests } from "./quests";
import { applyAction, applyLink } from "./actions";

// ---------------------------------------------------------------- fixtures

function add(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}

function at(p: Player, x: number, y: number): Player {
  return { ...p, x, y };
}

function guest(id: string): Player {
  return spawnGuest(id);
}

function angel(id: string, serial = 42): Player {
  return { ...spawnGuest(id), guest: false, serial, name: `#${String(serial).padStart(4, "0")}`, house: "earth", messenger: "herald", winkSchool: "hint", auraSeed: 10, aura: 10, flags: { angel: 1 } };
}

const me = (w: WorldState, id: string) => w.players.get(id)!;
const NARA = NPC_HOMES.nara;
const PLAQUE = POSITIONS["safety-plaque"];

// ---------------------------------------------------------------- dialogue

describe("dialogue", () => {
  it("talk opens the entry node for an Angel in reach, with the Wink; a guest gets no Wink; out of reach nothing opens", () => {
    let w = add(emptyWorld(), at(angel("a"), NARA.x + 20, NARA.y));
    w = applyTalk(w, "a", "nara");
    const d = me(w, "a").dialogue!;
    expect(d.node).toBe("hello");
    expect(d.speaker).toBe("Nara Vale");
    expect(d.portrait).toBe("nara.jpg");
    expect(d.text).toBe("Hello.");
    expect(d.wink).toBe("A private line.");
    expect(d.choices.map(c => c.id)).toEqual(["a", "b"]);

    let g = add(emptyWorld(), at(guest("g"), NARA.x, NARA.y + 10));
    g = applyTalk(g, "g", "nara");
    expect(me(g, "g").dialogue!.wink).toBe("");
    expect(me(g, "g").wink).toBe("");

    const far = add(emptyWorld(), at(angel("f"), NARA.x + 300, NARA.y));
    expect(applyTalk(far, "f", "nara")).toBe(far);
  });

  it("an NPC absent for this viewer cannot be spoken to", () => {
    const q = NPC_HOMES.quill;
    const w = add(emptyWorld(), { ...at(angel("a"), q.x, q.y), flags: { "hide:quill": 1 } });
    expect(applyTalk(w, "a", "quill")).toBe(w);
    const w2 = add(emptyWorld(), at(angel("a"), q.x, q.y));
    expect(me(applyTalk(w2, "a", "quill"), "a").dialogue?.node).toBe("hi");
  });

  it("choose applies the choice effects and follows next; a hidden choice cannot be picked", () => {
    let w = applyTalk(add(emptyWorld(), at(angel("a"), NARA.x, NARA.y)), "a", "nara");
    expect(applyChoose(w, "a", "hidden")).toBe(w);
    w = applyChoose(w, "a", "a");
    const p = me(w, "a");
    expect(p.flags["chose:a"]).toBe(1);
    expect(p.dialogue?.node).toBe("second");
    expect(p.flags["opened:second"]).toBe(1);
  });

  it("a choice without next closes the dialogue after its effects", () => {
    let w = applyTalk(add(emptyWorld(), at(angel("a"), NARA.x, NARA.y)), "a", "nara");
    w = applyChoose(w, "a", "b");
    expect(me(w, "a").dialogue).toBeNull();
    expect(me(w, "a").heard).toBe("Left.");
  });

  it("close follows node.next when the node has no choices, then closes", () => {
    let w = applyTalk(add(emptyWorld(), at(angel("a"), NARA.x, NARA.y)), "a", "nara");
    w = applyChoose(w, "a", "a");
    w = applyClose(w, "a");
    expect(me(w, "a").dialogue?.node).toBe("third");
    w = applyClose(w, "a");
    expect(me(w, "a").dialogue).toBeNull();
    expect(applyClose(w, "a")).toBe(w);
  });
});

// ---------------------------------------------------------------- interact

describe("interact", () => {
  it("applies cost, effects and the spoken line", () => {
    let w = add(emptyWorld(), { ...at(angel("a"), PLAQUE.x + 10, PLAQUE.y), bestand: 10 });
    w = applyInteract(w, "a", "safety-plaque", "pay");
    const p = me(w, "a");
    expect(p.bestand).toBe(5);
    expect(p.readiness).toBe(4);
    expect(p.flags.paid).toBe(1);
    expect(p.heard).toBe("Paid.");
    expect(w.flags["sunk:tax"]).toBe(5);
  });

  it("refuses a cost the purse cannot cover", () => {
    let w = add(emptyWorld(), { ...at(angel("a"), PLAQUE.x, PLAQUE.y), bestand: 2 });
    w = applyInteract(w, "a", "safety-plaque", "pay");
    expect(me(w, "a").bestand).toBe(2);
    expect(me(w, "a").heard).toBe(FIX.LINES.CANT_AFFORD);
  });

  it("a once verb runs once and then says so; verbsFor hides it afterwards", () => {
    let w = add(emptyWorld(), at(angel("a"), PLAQUE.x, PLAQUE.y));
    expect(verbsFor({ w, p: me(w, "a"), now: 0 }, "safety-plaque").map(v => v.key)).toEqual(["F", "E", "Q"]);
    w = applyInteract(w, "a", "safety-plaque", "read");
    expect(me(w, "a").flags["weather:safety"]).toBe(1);
    expect(me(w, "a").flags["read:plaque"]).toBe(1);
    expect(me(w, "a").heard).toBe("Read it.");
    w = applyInteract(w, "a", "safety-plaque", "read");
    expect(me(w, "a").heard).toBe(FIX.LINES.ALREADY);
    expect(verbsFor({ w, p: me(w, "a"), now: 0 }, "safety-plaque").map(v => v.key)).toEqual(["E", "Q"]);
  });

  it("refuses guests on a denied verb with the guest lock line and omits it from their verbs; spectate says the spectator line", () => {
    let w = add(emptyWorld(), at(guest("g"), PLAQUE.x, PLAQUE.y));
    expect(verbsFor({ w, p: me(w, "g"), now: 0 }, "safety-plaque").map(v => v.key)).toEqual(["F", "E"]);
    w = applyInteract(w, "g", "safety-plaque", "sacred");
    expect(me(w, "g").flags.sacred).toBeUndefined();
    expect(me(w, "g").heard).toBe(FIX.LINES.GUEST_LOCK);

    const shrine = POSITIONS["care-shrine"];
    let s = add(emptyWorld(), at(guest("g"), shrine.x, shrine.y));
    s = applyInteract(s, "g", "care-shrine", "rest");
    expect(me(s, "g").heard).toBe(FIX.LINES.SPECTATOR);
    expect(me(s, "g").flags.shrine).toBeUndefined();
  });

  it("does nothing out of reach or for an unknown verb", () => {
    const w = add(emptyWorld(), at(angel("a"), PLAQUE.x + 200, PLAQUE.y));
    expect(applyInteract(w, "a", "safety-plaque", "read")).toBe(w);
    const near = add(emptyWorld(), at(angel("a"), PLAQUE.x, PLAQUE.y));
    expect(applyInteract(near, "a", "safety-plaque", "nope")).toBe(near);
    expect(applyInteract(near, "a", "no-such-thing", "read")).toBe(near);
  });

  it("routes node ids to the economy and npc ids to talk", () => {
    const node = emptyWorld().nodes[0];
    let w = add(emptyWorld(), at(angel("a"), node.x, node.y));
    w = applyInteract(w, "a", node.id, "keep");
    expect(w.nodes[0].kept).toBe(true);
    let t = add(emptyWorld(), at(angel("a"), NARA.x, NARA.y));
    t = applyInteract(t, "a", "nara", "talk");
    expect(me(t, "a").dialogue?.node).toBe("hello");
  });
});

// ---------------------------------------------------------------- quests

describe("quests", () => {
  it("auto-starts the first spine quest, advances on predicates, applies onComplete and onFinish once", () => {
    let w = add(emptyWorld(), at(angel("a"), PLAQUE.x, PLAQUE.y));
    w = tickQuests(w, "a");
    expect(questProgress(me(w, "a"), "m1-diagnosis")).toEqual({ started: true, step: 0, done: false });
    expect(me(w, "a").flags["m1:started"]).toBe(1);
    expect(questProgress(me(w, "a"), "m2-techno-feudal").started).toBe(false);
    expect(questProgress(me(w, "a"), "side-nave-test").started).toBe(false);

    w = applyInteract(w, "a", "safety-plaque", "read");
    w = tickQuests(w, "a");
    expect(questProgress(me(w, "a"), "m1-diagnosis").step).toBe(1);
    expect(me(w, "a").notices.some(n => n.text === "Read.")).toBe(true);
    expect(questProgress(me(w, "a"), "side-nave-test")).toEqual({ started: true, step: 0, done: false });

    w = add(w, { ...me(w, "a"), bestand: 10 });
    w = applyInteract(w, "a", "safety-plaque", "pay");
    w = tickQuests(w, "a");
    expect(questProgress(me(w, "a"), "m1-diagnosis")).toEqual({ started: true, step: 2, done: true });
    expect(me(w, "a").flags["m1:finished"]).toBe(1);
    expect(questProgress(me(w, "a"), "side-nave-test").done).toBe(true);
    expect(w.flags["side:done"]).toBe(1);
    expect(w.pois["crt-altar-1"].state).toBe("lit");

    w = tickQuests(tickQuests(w, "a"), "a");
    expect(me(w, "a").flags["m1:finished"]).toBe(1);
    expect(w.pois["crt-altar-1"].count).toBe(1);
  });

  it("starts the next spine quest only when the previous one is finished and the movement matches", () => {
    let w = add(emptyWorld(), { ...angel("a"), movement: 2 });
    w = tickQuests(w, "a");
    expect(questProgress(me(w, "a"), "m2-techno-feudal").started).toBe(false);
    w = add(w, { ...me(w, "a"), quests: { "m1-diagnosis": 2 } });
    w = tickQuests(w, "a");
    expect(questProgress(me(w, "a"), "m2-techno-feudal").started).toBe(true);
  });

  it("a guest starts only guest-legal quests and a locked body starts nothing", () => {
    let w = add(emptyWorld(), { ...guest("g"), movement: 2, quests: { "m1-diagnosis": 2 } });
    w = tickQuests(w, "g");
    expect(questProgress(me(w, "g"), "m2-techno-feudal").started).toBe(false);
    let l = add(emptyWorld(), { ...guest("l"), locked: true });
    l = tickQuests(l, "l");
    expect(Object.keys(me(l, "l").quests)).toEqual([]);
  });

  it("objectiveFor resolves the current spine step and its target position", () => {
    let w = add(emptyWorld(), at(angel("a"), PLAQUE.x, PLAQUE.y));
    w = tickQuests(w, "a");
    let o = objectiveFor({ w, p: me(w, "a"), now: 0 })!;
    expect(o.quest).toBe("m1-diagnosis");
    expect(o.step).toBe("read");
    expect(o.title).toBe("Read the plaque");
    expect(o.plate).toBe("plate-arena.jpg");
    expect(o.target).toEqual({ x: PLAQUE.x, y: PLAQUE.y, district: PLAQUE.district });

    w = applyInteract(w, "a", "safety-plaque", "read");
    w = tickQuests(w, "a");
    o = objectiveFor({ w, p: me(w, "a"), now: 0 })!;
    expect(o.step).toBe("pay");
    expect(o.target).toEqual({ x: NARA.x, y: NARA.y, district: NARA.district });
  });

  it("without an active spine step the most recently started side quest is the objective", () => {
    const w = add(emptyWorld(), { ...angel("a"), quests: { "m1-diagnosis": 2, "side-nave-test": 0 } });
    const o = objectiveFor({ w, p: me(w, "a"), now: 0 })!;
    expect(o.quest).toBe("side-nave-test");
    expect(o.target).toEqual({ x: NARA.x, y: NARA.y, district: NARA.district });
    const done = add(emptyWorld(), { ...angel("a"), quests: { "m1-diagnosis": 2, "side-nave-test": 1 } });
    expect(objectiveFor({ w: done, p: me(done, "a"), now: 0 })).toBeNull();
  });

  it("quest effects start, advance and complete a quest with onFinish once", () => {
    let w = add(emptyWorld(), angel("a"));
    w = applyEffects(w, "a", [{ kind: "quest", id: "side-nave-test", op: "start" }]);
    expect(questProgress(me(w, "a"), "side-nave-test").step).toBe(0);
    w = applyEffects(w, "a", [{ kind: "quest", id: "side-nave-test", op: "advance" }]);
    expect(questProgress(me(w, "a"), "side-nave-test").done).toBe(true);
    expect(w.pois["crt-altar-1"].state).toBe("lit");
    expect(w.flags["side:done"]).toBe(1);
    const again = applyEffects(w, "a", [{ kind: "quest", id: "side-nave-test", op: "complete" }]);
    expect(again.pois["crt-altar-1"].count).toBe(1);
  });
});

// ---------------------------------------------------------------- effects

describe("effects", () => {
  it("the going-under locks a guest with the guest lock line and sends an Angel to the Care", () => {
    let g = add(emptyWorld(), guest("g"));
    g = applyEffects(g, "g", [{ kind: "under" }]);
    expect(me(g, "g").locked).toBe(true);
    expect(me(g, "g").heard).toBe(FIX.LINES.GUEST_LOCK);
    expect(me(g, "g").movement).toBe(1);

    const shrine = POSITIONS["care-shrine"];
    let a = add(emptyWorld(), { ...angel("a"), hp: 30, aura: 3 });
    a = applyEffects(a, "a", [{ kind: "under" }]);
    const p = me(a, "a");
    expect(p.flags.under).toBe(1);
    expect([p.x, p.y, p.district]).toEqual([shrine.x, shrine.y, "care"]);
    expect(p.respawn).toEqual({ x: shrine.x, y: shrine.y, district: "care" });
    expect(p.hp).toBe(100);
    expect(p.aura).toBe(10);
    expect(p.movement).toBe(2);
  });

  it("bury and loot act on the nearest wreckage within reach", () => {
    const base = emptyWorld();
    const wreck = { id: "wreck-1", x: 400, y: 2000, district: "nave" as const, fromId: "x", fromName: "Desk Three", fromSerial: null, killerId: "a", at: 0, until: 45, buried: false, looted: false, bestand: 7, items: [] };
    let w = add({ ...base, wreckage: [wreck] }, at(angel("a"), 420, 2000));
    const looted = applyEffects(w, "a", [{ kind: "wreckage", op: "loot" }]);
    expect(me(looted, "a").bestand).toBe(7);
    expect(me(looted, "a").aura).toBe(8);
    expect(looted.wreckage[0].looted).toBe(true);
    expect(me(looted, "a").history.looted).toBe(1);

    w = add(w, { ...me(w, "a"), party: { nara: "gone", quill: "none", ord: "none" }, extractedSinceFuneral: 3 });
    const buried = applyEffects(w, "a", [{ kind: "wreckage", op: "bury" }]);
    expect(buried.wreckage[0].buried).toBe(true);
    expect(buried.graves).toHaveLength(1);
    expect(me(buried, "a").readiness).toBe(8);
    expect(me(buried, "a").extractedSinceFuneral).toBe(0);
    expect(me(buried, "a").party.nara).toBe("waiting");
    expect(buried.flags.burials).toBe(1);
    const far = add({ ...base, wreckage: [wreck] }, at(angel("a"), 800, 2000));
    expect(applyEffects(far, "a", [{ kind: "wreckage", op: "bury" }])).toBe(far);
  });

  it("freeze, teleport, poi, npc, claim and the purse effects land where the contract says", () => {
    let w = add(emptyWorld(), { ...angel("a"), bestand: 3 });
    w = applyEffects(w, "a", [
      { kind: "freeze", district: "nave", seconds: 100 },
      { kind: "teleport", to: "hall-sky" },
      { kind: "poi", id: "hour-bell", state: "struck" },
      { kind: "npc", id: "ord", present: false, state: "gone" },
      { kind: "claim", label: "The first hour" },
      { kind: "bestand", delta: 10, earner: "operator" },
      { kind: "bestand", delta: -4, sink: "door" },
      { kind: "spawn", enemy: "clerk", at: "spawn:guest", name: "Runner" },
      { kind: "history", buried: 2, outcome: "absence" },
    ]);
    const p = me(w, "a");
    expect(w.frozen.nave).toBe(100);
    expect(w.flags.freezes).toBe(1);
    expect(p.district).toBe("kerb");
    expect(w.pois["hour-bell"]).toMatchObject({ state: "struck", by: "a", count: 1 });
    expect(w.npcs.ord).toMatchObject({ present: false, state: "gone" });
    expect(p.claims).toHaveLength(1);
    expect(p.claims[0].settled).toBe(false);
    expect(p.bestand).toBe(9);
    expect(w.flags["earned:operator"]).toBe(10);
    expect(w.flags["sunk:door"]).toBe(4);
    expect(w.enemies.some(e => e.name === "Runner" && e.kind === "clerk")).toBe(true);
    expect(p.history).toMatchObject({ buried: 2, outcomes: ["absence"] });
    const again = applyEffects(w, "a", [{ kind: "claim", label: "The first hour" }]);
    expect(me(again, "a").claims).toHaveLength(1);
  });

  it("a guest never gains aura and never files a claim", () => {
    let g = add(emptyWorld(), guest("g"));
    g = applyEffects(g, "g", [{ kind: "aura", delta: 20 }, { kind: "claim", label: "Nope" }]);
    expect(me(g, "g").aura).toBe(0);
    expect(me(g, "g").claims).toHaveLength(0);
    expect(me(g, "g").heard).toBe(FIX.LINES.CLAIMS_GUEST);
  });
});

// ---------------------------------------------------------------- actions

describe("actions", () => {
  it("rejects malformed messages without throwing: 200 random JSON shapes", () => {
    let seed = 12345;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const types = ["intent", "dodge", "strike", "heavy", "stance", "kit", "interact", "talk", "choose", "close", "link", "flag", "truce", "use", "market", "bogus", 7, null, undefined, {}];
    const values = () => {
      const r = rnd();
      if (r < 0.1) return NaN;
      if (r < 0.2) return Infinity;
      if (r < 0.3) return "x".repeat(65);
      if (r < 0.4) return { nested: true };
      if (r < 0.5) return [1, 2];
      if (r < 0.6) return Math.floor(rnd() * 10000);
      if (r < 0.7) return "ok";
      if (r < 0.8) return true;
      if (r < 0.9) return null;
      return undefined;
    };
    const keys = ["intent", "dx", "dy", "targetId", "choice", "npcId", "choiceId", "serial", "sig", "itemId", "op", "listingId", "price", "__proto__", "constructor"];
    const w0 = add(emptyWorld(), guest("g"));
    for (let i = 0; i < 200; i++) {
      const msg: Record<string, unknown> = { t: types[Math.floor(rnd() * types.length)] };
      const n = Math.floor(rnd() * 4);
      for (let k = 0; k < n; k++) msg[keys[Math.floor(rnd() * keys.length)]] = values();
      const shapes: unknown[] = [msg, JSON.parse(JSON.stringify(msg)), null, 42, "strike", [msg], msg.t];
      for (const s of shapes) {
        expect(() => applyAction(w0, "g", s as ClientMsg)).not.toThrow();
        expect(() => applyAction(w0, "nobody", s as ClientMsg)).not.toThrow();
      }
    }
  });

  it("refuses non-finite numbers, long strings, unknown enums and prototype-pollution keys", () => {
    const w = add(emptyWorld(), guest("g"));
    expect(applyAction(w, "g", { t: "dodge", dx: NaN, dy: 1 })).toBe(w);
    expect(applyAction(w, "g", { t: "dodge", dx: Infinity, dy: 1 })).toBe(w);
    expect(applyAction(w, "g", { t: "interact", targetId: "x".repeat(65), choice: "read" })).toBe(w);
    expect(applyAction(w, "g", { t: "market", op: "steal" } as unknown as ClientMsg)).toBe(w);
    expect(applyAction(w, "g", { t: "market", op: "buy", price: "9" } as unknown as ClientMsg)).toBe(w);
    expect(applyAction(w, "g", JSON.parse('{"t":"strike","__proto__":{"polluted":1}}') as ClientMsg)).toBe(w);
    expect(applyAction(w, "g", { t: "nope" } as unknown as ClientMsg)).toBe(w);
    expect(applyAction(w, "g", { t: "intent", intent: "up" } as unknown as ClientMsg)).toBe(w);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("coerces intent fields to booleans", () => {
    const w = add(emptyWorld(), guest("g"));
    const next = applyAction(w, "g", { t: "intent", intent: { up: "yes" as unknown as boolean, left: 0 as unknown as boolean } });
    expect(next.intents.get("g")).toEqual({ up: true, down: false, left: false, right: false });
  });

  it("rejects a link with a bad signature and accepts the mock one", () => {
    const w = add(emptyWorld(), guest("g"));
    expect(applyAction(w, "g", { t: "link", serial: 42, sig: "forged" })).toBe(w);
    expect(applyLink(w, "g", 0, MOCK_SIG)).toBe(w);
    expect(applyLink(w, "g", 7778, MOCK_SIG)).toBe(w);
    expect(applyLink(w, "g", 4.5, MOCK_SIG)).toBe(w);
    const linked = applyAction(w, "g", { t: "link", serial: 42, sig: MOCK_SIG });
    const p = me(linked, "g");
    expect(p.guest).toBe(false);
    expect(p.serial).toBe(42);
    expect(p.name).toBe("#0042");
    expect(p.house).toBe("sky");
    expect(p.flags.angel).toBe(1);
    expect(p.aura).toBeGreaterThan(0);
    expect(p.aura).toBe(p.auraSeed);
    expect(p.locked).toBe(false);
  });

  it("refuses a serial already walking in another connected body, and pushes the test serial's history mark", () => {
    let w = add(add(emptyWorld(), guest("a")), guest("b"));
    w = applyLink(w, "a", 7777, MOCK_SIG);
    expect(me(w, "a").serial).toBe(7777);
    expect(w.history.some(m => m.serial === 7777)).toBe(true);
    w = applyLink(w, "b", 7777, MOCK_SIG);
    expect(me(w, "b").guest).toBe(true);
    expect(me(w, "b").heard).toBe(FIX.LINES.LINK_ELSEWHERE);
  });

  it("a locked guest who links is unlocked but not sent under until the threshold is used again", () => {
    let w = add(emptyWorld(), { ...guest("g"), locked: true });
    w = applyLink(w, "g", 42, MOCK_SIG);
    expect(me(w, "g").locked).toBe(false);
    expect(me(w, "g").flags.under).toBeUndefined();
    expect(me(w, "g").movement).toBe(1);
  });

  it("routes well-formed messages to the owning modules", () => {
    let w = add(emptyWorld(), at(angel("a"), NARA.x, NARA.y));
    w = applyAction(w, "a", { t: "talk", npcId: "nara" });
    expect(me(w, "a").dialogue?.node).toBe("hello");
    w = applyAction(w, "a", { t: "choose", choiceId: "a" });
    expect(me(w, "a").dialogue?.node).toBe("second");
    w = applyAction(w, "a", { t: "close" });
    expect(me(w, "a").dialogue?.node).toBe("third");
    w = applyAction(w, "a", { t: "close" });
    expect(me(w, "a").dialogue).toBeNull();
    w = applyAction(w, "a", { t: "stance" });
    expect(me(w, "a").stance).toBe("storm");
    w = applyAction(w, "a", { t: "dodge", dx: 1, dy: 0 });
    expect(me(w, "a").dodgeT).toBeGreaterThan(0);
  });
});
