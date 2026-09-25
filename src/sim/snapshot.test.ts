import { describe, expect, it, vi } from "vitest";

/** Per-viewer snapshots against a tiny inline content fixture. */
const FIX = vi.hoisted(() => {
  const per = (v: string) => ({ herald: v, witness: v, ruin: v, dweller: v, cybernetic: v, iridescent: v });
  const LINES = {
    GUEST_LOCK: "A guest cannot prepare the ground.", SPECTATOR: "Spectator.", ALREADY: "Already.", CANT_AFFORD: "Short.", CANT_USE: "No.",
    FROZEN: "Frozen.", DODGE_COPY: "Dodged.", DODGE_WHIFF: "Whiff.", INTERRUPT: "Interrupted.", HIT_COPY: "Hit.", ARENA_HIT: "Dummy.",
    GUEST_GRIEF: "Grief.", TRUCE_ACTIVE: "Truce holds.", PRACTICE_SAFE: "Practice.", PVP_FLAG_REQUIRED: "Flag.", FLAG_GUEST: "No flag.",
    FLAG_WHERE: "Not here.", FLAG_ON: "On.", FLAG_OFF: "Off.", TRUCE_COPY: "Truce.", SPOILS_COPY: "Spoils.", CAMP_COPY: "Camp.",
    DUEL_COPY: "Duel.", SPECTATE_COPY: "Watched.", STORM_PRESS: "Press.", STORM_FALLEN: "Fallen.", KIT_GUEST: "No kit.", KIT_COOLDOWN: "Cools.",
    KIT_NEED: per("Need."), KIT_COPY: per("Kit."), CLAIMS_GUEST: "Guests cannot claim.", CLAIMS_FILED: "Filed.", CLAIMS_HELD: "Held.",
    CLAIMS_TAKEN: "Taken.", CLAIMS_CAP: "Capped.", BANKED: "Banked.", LINK_ELSEWHERE: "Elsewhere.",
    LINK_COPY: (serial: number, house: string, messenger: string) => `Sealed ${serial} ${house} ${messenger}.`,
    NARA_LEAVES: "Nara leaves.", NARA_WAITS: "Nara waits.", LOOT_COPY: "Looted.", BURY_COPY: "Buried.",
    DEATH_BY: (name: string) => `${name} did their job.`, INSURANCE_USED: "Paper burned.",
    WEATHER_LABELS: {}, WEATHER_NAMES: [], WINKE: { hint: ["h"], wreckage: ["w"], omen: ["o"], dwelling: ["d"], process: ["p"], surface: ["s"] }, CREDITS: [],
  };
  type AnyCtx = { p: { flags: Record<string, number> } };
  const NPCS = {
    nara: {
      id: "nara", name: "Nara Vale", role: "Sexton", home: "nara", portrait: "nara.jpg", sprite: "nara", party: true,
      entry: () => "hello",
      nodes: { hello: { id: "hello", text: "Hello.", wink: "A private line.", choices: [{ id: "a", label: "Go on" }] } },
    },
    quill: {
      id: "quill", name: "Quill", role: "Forger", home: "quill", portrait: "quill.jpg", sprite: "quill", party: true,
      personal: (ctx: AnyCtx) => (ctx.p.flags["quill:forge"] ? { x: 2856, y: 2136, district: "wet" } : ctx.p.flags["hide:quill"] ? { present: false } : null),
      entry: () => "hi",
      nodes: { hi: { id: "hi", text: "Hi." } },
    },
  };
  const POI_CONFIGS = {
    "safety-plaque": { id: "safety-plaque", label: "Office of Safety plaque", verbs: [{ key: "F", label: "Read", choice: "read", once: "read:plaque" }] },
    "care-shrine": { id: "care-shrine", label: "Care shrine", verbs: [{ key: "F", label: "Rest", choice: "rest", guest: "deny" }] },
  };
  const QUESTS = [
    {
      id: "m1-diagnosis", title: "Diagnosis", kind: "spine", movement: 1, district: "nave", guestLegal: true, changes: "spine",
      available: () => true,
      steps: [{ id: "read", title: "Read the plaque", detail: "F", target: "safety-plaque", plate: "plate-arena.jpg", done: (ctx: AnyCtx) => !!ctx.p.flags["read:plaque"] }],
    },
  ];
  return { LINES, NPCS, POI_CONFIGS, QUESTS, NEWS: {} };
});

vi.mock("./content", () => FIX);
vi.mock("./content/lines", () => FIX.LINES);

import { AOI_RADIUS, WRECKAGE_TTL_BONUS } from "./constants";
import { NPC_HOMES, POSITIONS } from "./map";
import type { FailedPassing, HistoryMark, Player, WorldState, Wreckage } from "./types";
import { emptyWorld, spawnGuest } from "./world";
import { applyTalk } from "./dialogue";
import { npcView, promptFor, publicPlayer, snapshotFor, visibleWreckage } from "./snapshot";

function add(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}
const at = (p: Player, x: number, y: number): Player => ({ ...p, x, y });
const guest = (id: string): Player => spawnGuest(id);
const angel = (id: string, house: Player["house"] = "earth", serial = 42): Player => ({
  ...spawnGuest(id), guest: false, serial, name: `#${String(serial).padStart(4, "0")}`, house, messenger: "herald", winkSchool: "hint", auraSeed: 10, aura: 10, flags: { angel: 1 },
});
const me = (w: WorldState, id: string) => w.players.get(id)!;
const NARA = NPC_HOMES.nara;
const PLAQUE = POSITIONS["safety-plaque"];

const failed: FailedPassing = { id: "failed-1", x: POSITIONS["failed-1"].x, y: POSITIONS["failed-1"].y, district: "clearing", season: 1, line: "Last season." };
const mark: HistoryMark = { id: "history:7777", serial: 7777, x: POSITIONS["history:7777"].x, y: POSITIONS["history:7777"].y, district: "care", line: "A prior hour." };
const wreck = (id: string, x: number, y: number, until: number, extra: Partial<Wreckage> = {}): Wreckage => ({
  id, x, y, district: "nave", fromId: "e", fromName: "Desk Three", fromSerial: null, killerId: "a", at: 0, until, buried: false, looted: false, bestand: 3, items: [], ...extra,
});

describe("snapshotFor", () => {
  it("guests never receive a Wink, in the body or in the dialogue", () => {
    let w = add(emptyWorld(), at(guest("g"), NARA.x, NARA.y));
    w = applyTalk(w, "g", "nara");
    w = add(w, { ...me(w, "g"), wink: "leaked", dialogue: { ...me(w, "g").dialogue!, wink: "leaked" } });
    const snap = snapshotFor(w, "g");
    expect(snap.you.wink).toBe("");
    expect(snap.you.dialogue?.wink).toBe("");
    expect(snap.you.dialogue?.text).toBe("Hello.");

    let a = add(emptyWorld(), at(angel("a"), NARA.x, NARA.y));
    a = applyTalk(a, "a", "nara");
    expect(snapshotFor(a, "a").you.dialogue?.wink).toBe("A private line.");
    expect(snapshotFor(a, "a").you.wink).toBe("A private line.");
  });

  it("history marks go only to the serial that owns them", () => {
    let w = add(add({ ...emptyWorld(), history: [mark] }, angel("owner", "mortals", 7777)), angel("other", "earth", 42));
    w = add(w, guest("g"));
    expect(snapshotFor(w, "owner").history.map(m => m.id)).toEqual(["history:7777"]);
    expect(snapshotFor(w, "other").history).toEqual([]);
    expect(snapshotFor(w, "g").history).toEqual([]);
  });

  it("failed Passings are hidden from an earth-house Angel in Restraint and shown to the House of Sky, Storm stance and a Ruin-angel", () => {
    let w: WorldState = { ...emptyWorld(), failed: [failed] };
    w = add(w, angel("earth", "earth"));
    w = add(w, angel("sky", "sky", 43));
    w = add(w, { ...angel("storm", "earth", 44), stance: "storm" });
    w = add(w, { ...angel("ruin", "earth", 45), messenger: "ruin" });
    w = add(w, { ...guest("g"), stance: "storm" });
    expect(snapshotFor(w, "earth").failed).toEqual([]);
    expect(snapshotFor(w, "sky").failed).toHaveLength(1);
    expect(snapshotFor(w, "storm").failed).toHaveLength(1);
    expect(snapshotFor(w, "ruin").failed).toHaveLength(1);
    expect(snapshotFor(w, "g").failed).toEqual([]);
  });

  it("the area of interest excludes a player 3000 px away and includes one nearby; the viewer is not among the others", () => {
    let w = add(emptyWorld(), at(angel("a"), 600, 2000));
    w = add(w, at(angel("near", "sky", 43), 600 + 500, 2000));
    w = add(w, at(angel("far", "sky", 44), 600 + 3000, 2000));
    const snap = snapshotFor(w, "a");
    expect(snap.players.map(p => p.id)).toEqual(["near"]);
    expect(snap.you.id).toBe("a");
    expect(snap.district).toBe("nave");
    expect(snap.enemies.every(e => Math.hypot(e.x - 600, e.y - 2000) <= AOI_RADIUS)).toBe(true);
    expect(snap.nodes.every(n => Math.hypot(n.x - 600, n.y - 2000) <= AOI_RADIUS)).toBe(true);
  });

  it("public players carry no purse, flags or Winke and tier their aura by style only", () => {
    const p = { ...angel("a"), bestand: 99, wink: "secret", aura: 50, truceUntil: 10 };
    const pub = publicPlayer(p, 5) as unknown as Record<string, unknown>;
    expect(pub.bestand).toBeUndefined();
    expect(pub.wink).toBeUndefined();
    expect(pub.flags).toBeUndefined();
    expect(pub.auraTier).toBe(3);
    expect(pub.truce).toBe(true);
    expect(publicPlayer(guest("g"), 0).auraTier).toBe(0);
    expect(publicPlayer({ ...angel("b"), aura: 2 }, 0).auraTier).toBe(1);
    expect(publicPlayer({ ...angel("c"), aura: 20 }, 0).auraTier).toBe(2);
  });

  it("nodes carry hints only under a cybernetic kit and safe only while announced", () => {
    const base = emptyWorld();
    const node = base.nodes[0];
    let w = add({ ...base, nodes: [{ ...node, announcedUntil: 30 }, ...base.nodes.slice(1)] }, at(angel("a"), node.x, node.y));
    expect(snapshotFor(w, "a").nodes[0]).toMatchObject({ safe: true });
    expect(snapshotFor(w, "a").nodes[0].yieldHint).toBeUndefined();
    w = add(w, { ...me(w, "a"), messenger: "cybernetic", kit: { verb: "cybernetic", until: 60 } });
    const view = snapshotFor(w, "a").nodes[0];
    expect(view.chargesHint).toBe(node.charges);
    expect(typeof view.yieldHint).toBe("number");
    w = { ...w, now: 40 };
    expect(snapshotFor(w, "a").nodes[0].safe).toBe(false);
  });

  it("uses the NPC's personal override and reports the objective and prompt", () => {
    let w = add(emptyWorld(), { ...at(angel("a"), PLAQUE.x, PLAQUE.y), flags: { angel: 1, "quill:forge": 1 }, quests: { "m1-diagnosis": 0 } });
    let snap = snapshotFor(w, "a");
    const quill = snap.npcs.find(n => n.id === "quill")!;
    expect([quill.x, quill.y, quill.district]).toEqual([2856, 2136, "wet"]);
    expect(quill.name).toBe("Quill");
    expect(snap.objective?.step).toBe("read");
    expect(snap.prompt?.targetId).toBe("safety-plaque");
    expect(snap.prompt?.verbs).toEqual([{ key: "F", label: "Read", choice: "read" }]);
    w = add(w, { ...me(w, "a"), flags: { angel: 1, "hide:quill": 1 } });
    snap = snapshotFor(w, "a");
    expect(snap.npcs.some(n => n.id === "quill")).toBe(false);
    expect(npcView({ w, p: me(w, "a"), now: 0 }, w.npcs.quill)).toBeNull();
  });
});

describe("visibleWreckage", () => {
  it("expired wreckage stays visible to the Mortals House, a Ruin-angel and Storm stance, and to a Witness blitz", () => {
    const w: WorldState = { ...emptyWorld(), now: 50, wreckage: [wreck("w1", 300, 2000, 45)] };
    expect(visibleWreckage(w, angel("plain"))).toEqual([]);
    expect(visibleWreckage(w, guest("g"))).toEqual([]);
    expect(visibleWreckage(w, { ...guest("g"), stance: "storm" })).toEqual([]);
    expect(visibleWreckage(w, angel("m", "mortals"))).toHaveLength(1);
    expect(visibleWreckage(w, { ...angel("r"), messenger: "ruin" })).toHaveLength(1);
    expect(visibleWreckage(w, { ...angel("s"), stance: "storm" })).toHaveLength(1);
    const gone: WorldState = { ...w, now: 45 + WRECKAGE_TTL_BONUS + 1 };
    expect(visibleWreckage(gone, angel("m", "mortals"))).toEqual([]);
    expect(visibleWreckage(gone, { ...angel("w"), messenger: "witness", kit: { verb: "witness", until: 999 } })).toHaveLength(1);
  });
});

describe("promptFor", () => {
  it("picks the nearest thing and lists E / Q for a node", () => {
    const base = emptyWorld();
    const node = base.nodes[0];
    let w: WorldState = { ...base, wreckage: [wreck("w1", node.x + 80, node.y, 999)] };
    w = add(w, at(angel("a"), node.x + 30, node.y));
    const near = promptFor({ w, p: me(w, "a"), now: 0 })!;
    expect(near.targetKind).toBe("node");
    expect(near.targetId).toBe(node.id);
    expect(near.verbs).toEqual([{ key: "E", label: "Extract", choice: "extract" }, { key: "Q", label: "Keep", choice: "keep" }]);

    w = add(w, at(me(w, "a"), node.x + 70, node.y));
    const wreckPrompt = promptFor({ w, p: me(w, "a"), now: 0 })!;
    expect(wreckPrompt.targetKind).toBe("wreckage");
    expect(wreckPrompt.verbs.map(v => v.key)).toEqual(["F", "E"]);

    w = add(w, { ...at(guest("g"), node.x + 70, node.y) });
    const guestPrompt = promptFor({ w, p: me(w, "g"), now: 0 })!;
    expect(guestPrompt.targetKind).toBe("wreckage");
    expect(guestPrompt.verbs.map(v => v.key)).toEqual(["F"]);
  });

  it("hides a frozen node, skips a POI without verbs for the viewer, and offers Speak at an NPC", () => {
    const base = emptyWorld();
    const node = base.nodes[0];
    const frozen: WorldState = { ...base, frozen: { [node.district]: 100 } };
    const w = add(frozen, at(angel("a"), node.x, node.y));
    expect(promptFor({ w, p: me(w, "a"), now: 0 })).toBeNull();

    const shrine = POSITIONS["care-shrine"];
    const g = add(emptyWorld(), at(guest("g"), shrine.x, shrine.y));
    expect(promptFor({ w: g, p: me(g, "g"), now: 0 })).toBeNull();
    const a = add(emptyWorld(), at(angel("a"), shrine.x, shrine.y));
    expect(promptFor({ w: a, p: me(a, "a"), now: 0 })?.targetId).toBe("care-shrine");

    const n = add(emptyWorld(), at(angel("a"), NARA.x + 10, NARA.y));
    const p = promptFor({ w: n, p: me(n, "a"), now: 0 })!;
    expect(p).toMatchObject({ targetId: "nara", targetKind: "npc", name: "Nara Vale" });
    expect(p.verbs).toEqual([{ key: "F", label: "Speak", choice: "talk" }]);
  });

  it("offers V Flag to Angels on a flag-legal street and T Truce when both are flagged, never to guests", () => {
    const hot = POSITIONS["hot-street"];
    let w = add(emptyWorld(), { ...at(angel("a"), hot.x, hot.y), district: "wet" });
    w = add(w, { ...at(angel("b", "sky", 43), hot.x + 40, hot.y), district: "wet", flagged: true });
    let p = promptFor({ w, p: me(w, "a"), now: 0 })!;
    expect(p.targetKind).toBe("player");
    expect(p.verbs.map(v => v.key)).toEqual(["V"]);
    w = add(w, { ...me(w, "a"), flagged: true });
    p = promptFor({ w, p: me(w, "a"), now: 0 })!;
    expect(p.verbs.map(v => v.key)).toEqual(["V", "T"]);
    w = add(w, { ...at(guest("g"), hot.x + 10, hot.y), district: "wet" });
    expect(promptFor({ w, p: me(w, "g"), now: 0 })).toBeNull();
  });
});
