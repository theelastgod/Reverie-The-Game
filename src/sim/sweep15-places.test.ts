// The player-defect sweep, round fifteen (places): a place's prompt and line against the body and the world.
// Each case is one finding, through the real reducers (applyAction, snapshotFor).
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { POSITIONS, districtAt } from "./map";
import { emptyWorld, spawnGuest } from "./world";
import { applyAction } from "./actions";
import { snapshotFor } from "./snapshot";
import { C, F, seasonPassingFlag } from "./content/ids";
import { AURA_MAX, WAR_PERIOD } from "./constants";

const M1 = [F.ARRIVED, F.INTAKE, F.FIRST_NODE, F.DESK_THREE, F.SECOND_NODE, F.TALKED_QUILL, F.TALKED_ORD, F.TALKED_NARA, F.HEARD_RECORDER, F.MEMORIAL, F.BURIED_NARA, F.WEATHER_SAFETY, F.WEATHER_ORD, F.WEATHER_NARA, F.WEATHER_NAMED, F.UNDER];
const M2 = [F.ANGEL, F.SHRINE, F.CARE, F.TALKED_SEXTON, F.HALL, F.TALKED_OFFICER, F.FREEZE, F.TITHE, F.BOARD, F.OPERATOR, F.GARDEN, F.M3];
const M3 = [F.STRAIT, F.FOUNDRY, F.CABLE, F.MAP, F.BELL, F.FAILED, F.CAUL_MET, F.CAUL_OFFER, F.CAUL_ASKED, F.FORGE];
const on = (...keys: string[]) => Object.fromEntries(keys.map(k => [k, 1]));

function put(w: WorldState, id: string, at: string, patch: Partial<Player>): WorldState {
  const base = spawnGuest(id, w.now);
  const pos = POSITIONS[at];
  const serial = 40 + w.players.size;
  const p: Player = { ...base, guest: false, serial, name: `#00${serial}`, house: "mortals", aura: 30, auraSeed: 30, bestand: 50, ...patch, x: pos.x, y: pos.y, district: districtAt(pos.x, pos.y), party: { ...base.party, ...(patch.party ?? {}) } };
  const players = new Map(w.players); players.set(id, p);
  return { ...w, players };
}
const press = (w: WorldState, id: string, target: string, choice: string) => applyAction(w, id, { t: "interact", targetId: target, choice });
const prompt = (w: WorldState, id: string) => snapshotFor(w, id).prompt!;
const heard = (w: WorldState, id: string) => w.players.get(id)!.heard;

describe("the cult vault reads open to a body it stays sealed to", () => {
  // Path: Angel A took the copper at the recorder (I.8: a cult object, Copper binding) and opens the vault on the Gold Ring;
  // Angel B kept the voice and carries no cult object. B's prompt names the vault open; B's F says it is sealed.
  it("label and line agree for a body without a key", () => {
    let w = { ...emptyWorld(), now: 100 };
    w = put(w, "a", "cult-vault", { movement: 2, flags: on(...M1, F.ANGEL), choices: { [C.MEMORIAL]: "copper" }, items: [{ id: "cult:copper-binding", kind: "cult", name: "Copper binding", qty: 1, value: 0, bound: true }] });
    w = press(w, "a", "cult-vault", "open");
    expect(w.pois["cult-vault"].state).toBe("open");
    w = put(w, "b", "cult-vault", { movement: 2, flags: on(...M1, F.ANGEL), choices: { [C.MEMORIAL]: "voice" } });
    const pr = prompt(w, "b");
    expect(pr.verbs.map(v => v.choice)).toEqual(["try"]);
    w = press(w, "b", "cult-vault", "try");
    expect(heard(w, "b")).toContain("Sealed.");
    expect(pr.name, `B hears: ${heard(w, "b")}`).not.toBe("Cult vault — open");
  });
});

describe("prepare tells a body that chose to stand alone that the party stands in the hole", () => {
  // Path: an Angel through Movement III keeps watch at the buried garden (mortality), answers Ord at the Care gate
  // "Alone. Count from the gate." (C.PARTY alone: the party waits at the gate, Ord counts from there), and presses F at the ring.
  it("alone", () => {
    let w = { ...emptyWorld(), now: 100 };
    w = put(w, "me", "clearing-ring", { movement: 4, flags: on(...M1, ...M2, ...M3, F.MORTALITY, F.GATE), choices: { [C.MORTALITY]: "watch", [C.PARTY]: "alone" }, party: { nara: "with", quill: "with", ord: "with" } });
    expect(prompt(w, "me").verbs[0].choice).toBe("prepare");
    w = press(w, "me", "clearing-ring", "prepare");
    expect(w.players.get("me")!.flags[F.PREPARE]).toBe(1);
    expect(heard(w, "me")).not.toContain("The party still willing stands in it");
  });
});

describe("a tithe at a dark hall says the lamp holds", () => {
  // Path: a Mortals Angel goes under, walks to its own hall in the Care and presses E (Tithe) before reading the plaque. The hall
  // is dark (no `— lit` in the prompt), and the same hall's Bounty answers "The hall is dark".
  it("own hall, unread", () => {
    let w = { ...emptyWorld(), now: 100 };
    w = put(w, "me", "hall-mortals", { movement: 2, flags: on(...M1, F.ANGEL, F.CARE, F.SHRINE), bestand: 20 });
    const pr = prompt(w, "me");
    expect(pr.name).toBe("House of Mortals hall");
    expect(pr.verbs.some(v => v.choice === "tithe")).toBe(true);
    w = press(w, "me", "hall-mortals", "tithe");
    expect(w.pois["hall-mortals"].state).toBe("dark");
    expect(heard(w, "me"), "the lamp is dark").not.toContain("The lamp holds");
  });
});

describe("the plaque's reread says stability under a struck word", () => {
  // Path: a body names the weather "the process" at the plaque ("The plaque is struck."; poi named). Then it, and a second
  // body that has read the plaque and heard Ord, press F again. Both prompts read "Office of Safety — struck".
  it("the body that struck it", () => {
    let w = { ...emptyWorld(), now: 100 };
    w = put(w, "me", "safety-plaque", { guest: true, serial: null, name: "GUEST", aura: 0, house: "", flags: on(...M1.filter(f => f !== F.WEATHER_NAMED && f !== F.UNDER)), choices: { [C.MEMORIAL]: "voice" } });
    w = press(w, "me", "safety-plaque", "process");
    expect(heard(w, "me")).toContain("The plaque is struck.");
    expect(prompt(w, "me").name).toBe("Office of Safety — struck");
    w = press(w, "me", "safety-plaque", "reread");
    expect(heard(w, "me")).not.toContain("The plaque still says stability");
  });
  it("a body struck before", () => {
    let w = { ...emptyWorld(), now: 100 };
    w = put(w, "a", "safety-plaque", { guest: true, serial: null, name: "GUEST", aura: 0, house: "", flags: on(...M1.filter(f => f !== F.WEATHER_NAMED && f !== F.UNDER)), choices: { [C.MEMORIAL]: "voice" } });
    w = put(w, "b", "safety-plaque", { guest: true, serial: null, name: "GUEST", aura: 0, house: "", flags: on(F.ARRIVED, F.TALKED_ORD, F.WEATHER_SAFETY, F.WEATHER_ORD) });
    w = press(w, "a", "safety-plaque", "process");
    expect(prompt(w, "b").name).toBe("Office of Safety — struck");
    w = press(w, "b", "safety-plaque", "reread");
    expect(heard(w, "b")).not.toContain("Stability, it says.");
  });
});

describe("after the rite the ring says it is asphalt while a hole stands open in it", () => {
  // Path: Angel A stood for this season's Passing (appearance). The asphalt sets (WAR_PERIOD); Angel B, prepared through its
  // own fourth hour, opens a new hole. A at the ring: the prompt says "The Clearing — open"; A's F is "Stand in what is left".
  it("appearance", () => {
    let w: WorldState = { ...emptyWorld(), now: 5000 };
    w = { ...w, clearing: { ...w.clearing, open: false, openedAt: 5000 - WAR_PERIOD - 10, contest: null } };
    const m4 = { movement: 4, flags: on(...M1, ...M2, ...M3, F.MORTALITY, F.GATE), choices: { [C.MORTALITY]: "watch", [C.PARTY]: "with" }, party: { nara: "with" as const, quill: "with" as const, ord: "with" as const } };
    w = put(w, "a", "clearing-ring", { ...m4, flags: { ...m4.flags, ...on(F.PREPARE, F.PASSING, seasonPassingFlag(1)) }, choices: { ...m4.choices, [C.CLEARING]: "keep", [C.PASSING]: "appearance" } });
    w = put(w, "b", "clearing-ring", m4);
    w = press(w, "b", "clearing-ring", "prepare");
    const pr = prompt(w, "a");
    expect(pr.name).toBe("The Clearing — open");
    expect(pr.verbs.find(v => v.key === "F")?.choice).toBe("after");
    w = press(w, "a", "clearing-ring", "after");
    expect(heard(w, "a"), pr.name).not.toContain("It is a ring in the asphalt again");
  });
});

describe("a shrine's upkeep promises aura to a full aura", () => {
  // Path: an Angel keeps the first shrine until its aura is full (each keep is +1; nothing stops a keep at the cap) and keeps again.
  it("aura at max", () => {
    let w = { ...emptyWorld(), now: 100, gestell: 30 };
    w = put(w, "me", "shrine-1", { movement: 2, flags: on(...M1, F.ANGEL), aura: AURA_MAX, auraSeed: 30, bestand: 20 });
    w = press(w, "me", "shrine-1", "keep");
    expect(w.players.get("me")!.aura).toBe(AURA_MAX);
    expect(heard(w, "me")).not.toContain("Aura thickens a little");
  });
});
