// The player-defect sweep, round sixteen (2026-10-11): every notice, news line and Wink an act produces, against the state after it.
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { DT } from "./constants";
import { POSITIONS, districtAt } from "./map";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { applyAction } from "./actions";
import { questById, tickQuests } from "./quests";
import { C, F, Q, W } from "./content/ids";
import { SF, SQ } from "./content/side";
import { applyChoose, openNode } from "./dialogue";
import { promptFor } from "./snapshot";
import { applyInteract } from "./interact";

const stepIdx = (q: string, s: string) => questById(q)!.steps.findIndex(x => x.id === s);
const M1_DONE = [F.ARRIVED, F.INTAKE, F.FIRST_NODE, F.DESK_THREE, F.SECOND_NODE, F.TALKED_QUILL, F.TALKED_ORD, F.TALKED_NARA, F.HEARD_RECORDER, F.MEMORIAL, F.BURIED_NARA, F.WEATHER_SAFETY, F.WEATHER_ORD, F.WEATHER_NARA, F.WEATHER_NAMED, F.UNDER, F.ANGEL, F.CARE];
const M2_DONE = [F.SHRINE, F.TALKED_SEXTON, F.HALL, F.TALKED_OFFICER, F.FREEZE, F.TITHE, F.BOARD, F.OPERATOR, F.GARDEN, F.M3];
const M3_DONE = [F.STRAIT, F.FOUNDRY, F.CABLE, F.MAP, F.BELL, F.FAILED, F.CAUL_MET, F.CAUL_OFFER, F.CAUL_ASKED, F.FORGE];
const on = (...keys: string[]) => Object.fromEntries(keys.map(k => [k, 1]));
const CH1 = { [C.FIRST_NODE]: "keep", [C.SECOND_NODE]: "keep", [C.MEMORIAL]: "voice", [C.WEATHER]: "end" };
const CH3 = { ...CH1, [C.ANNEX]: "held", [C.FREEZE]: "refused", [C.TITHE]: "paid", [C.OPERATOR]: "refuse", [C.GARDEN]: "numbered", [C.MAP]: "whole", [C.GLASS]: "dark", [C.FORGE]: "spot" };

function body(w: WorldState, id: string, poi: string, patch: Partial<Player> = {}): WorldState {
  const players = new Map(w.players);
  const serial = 40 + players.size;
  const at = POSITIONS[poi];
  const base = spawnGuest(id, w.now);
  players.set(id, { ...base, guest: false, serial, name: `#00${serial}`, house: "mortals", aura: 20, auraSeed: 12, restraint: 60, bestand: 60, x: at.x, y: at.y, district: districtAt(at.x, at.y), ...patch, party: { ...base.party, ...(patch.party ?? {}) } });
  return { ...w, players };
}
const me = (w: WorldState, id = "me"): Player => w.players.get(id)!;
const put = (w: WorldState, id: string, poi: string) => ({ ...w, players: new Map(w.players).set(id, { ...me(w, id), x: POSITIONS[poi].x, y: POSITIONS[poi].y, district: POSITIONS[poi].district }) });
const ticks = (w: WorldState, n: number) => { for (let i = 0; i < n; i++) w = tickWorld(w, DT); return w; };
const lastNotice = (w: WorldState, id = "me") => me(w, id).notices.at(-1)?.text ?? "";
const ringPrompt = (w: WorldState, id = "me") => {
  const v = promptFor({ w, p: me(w, id), now: w.now })!;
  expect(v.targetId).toBe("clearing-ring");
  return v;
};

describe("Organs study notices after another body changed the organ", () => {
  it("the Strait refused by A: B's study notice still says the Strait feeds the Foundry", () => {
    let w = body(emptyWorld(), "a", "organ-strait", { movement: 3, flags: on(...M1_DONE, ...M2_DONE) });
    w = body(w, "b", "organ-strait", { movement: 3, flags: on(...M1_DONE, ...M2_DONE) });
    w = applyAction(w, "a", { t: "interact", targetId: "organ-strait", choice: "refuse" });
    expect(w.pois["organ-strait"].state).toBe("refused");
    w = applyAction(w, "b", { t: "interact", targetId: "organ-strait", choice: "study" });
    expect(me(w, "b").heard).toContain("Someone stopped the water");
    expect(lastNotice(w, "b")).not.toBe("The Strait feeds the Foundry.");
  });
  it("the Foundry darkened by A: B's study notice still says the Foundry lights the Cable", () => {
    let w = body(emptyWorld(), "a", "organ-foundry", { movement: 3, flags: on(...M1_DONE, ...M2_DONE) });
    w = body(w, "b", "organ-foundry", { movement: 3, flags: on(...M1_DONE, ...M2_DONE) });
    w = applyAction(w, "a", { t: "interact", targetId: "organ-foundry", choice: "darken" });
    expect(w.pois["organ-foundry"].state).toBe("dark");
    w = applyAction(w, "b", { t: "interact", targetId: "organ-foundry", choice: "study" });
    expect(me(w, "b").heard).toContain("Someone unlit the heat");
    expect(lastNotice(w, "b")).not.toBe("The Foundry lights the Cable.");
  });
});

describe("the mortality act's notice says the Clearing will take you now", () => {
  const m4 = (patch: Partial<Player> = {}) => {
    let w = body(emptyWorld(), "me", "wreckage-garden", { movement: 4, flags: on(...M1_DONE, ...M2_DONE, ...M3_DONE), choices: CH3, quests: { [Q.M1]: 99, [Q.M2]: 99, [Q.M3]: 99, [Q.M4]: stepIdx(Q.M4, "mortality") }, ...patch });
    return { ...w, flags: { ...w.flags, [W.GARDEN_BURIED]: 1 } };
  };
  it("keep watch: the notice promises the ring; the ring sends the body to Ord's gate", () => {
    let w = applyAction(m4(), "me", { t: "interact", targetId: "wreckage-garden", choice: "watch" });
    w = tickQuests(w, "me");
    expect(me(w).flags[F.MORTALITY]).toBe(1);
    const claim = lastNotice(w).includes("The Clearing will take you now");
    w = put(w, "me", "clearing-ring");
    const v = ringPrompt(w);
    const prepare = v.verbs.some(x => x.choice === "prepare" || x.choice === "join");
    const said = me(applyInteract(w, "me", "clearing-ring", "look")).heard;
    expect(claim && !prepare, `notice: "${lastNotice(w)}"; ring: "${said}"`).toBe(false);
  });
  it("Nara's stand: the same", () => {
    let w = openNode(m4(), "me", "nara", "stand");
    expect(me(w).flags[F.MORTALITY]).toBe(1);
    const claim = lastNotice(w).includes("The Clearing will take you now");
    w = put(w, "me", "clearing-ring");
    const prepare = ringPrompt(w).verbs.some(x => x.choice === "prepare" || x.choice === "join");
    expect(claim && !prepare).toBe(false);
  });
});

describe("Ord's gate-with notice with Nara gone", () => {
  it("says the party stands with you; the ring then says the party will not stand", () => {
    let w = body(emptyWorld(), "me", "clearing-ring", { movement: 4, flags: on(...M1_DONE, ...M2_DONE, ...M3_DONE, F.MORTALITY), choices: { ...CH3, [C.MORTALITY]: "watch" }, quests: { [Q.M1]: 99, [Q.M2]: 99, [Q.M3]: 99, [Q.M4]: stepIdx(Q.M4, "party") }, party: { nara: "gone" } as Player["party"] });
    w = openNode(w, "me", "ord", "gate");
    expect(me(w).dialogue?.choices?.map(c => c.id)).toContain("with");
    w = applyChoose(w, "me", "with", "gate");
    const n = lastNotice(w);
    const prepare = ringPrompt(w).verbs.some(x => x.choice === "prepare" || x.choice === "join");
    const said = me(applyInteract(w, "me", "clearing-ring", "look")).heard;
    expect(n.includes("The party stands with you") && !prepare, `notice "${n}"; ring "${said}"`).toBe(false);
  });
});

describe("the Cable gone quiet is posted per body", () => {
  it("two bodies finishing 'the Cable hums' post 'Someone kept a node' twice over one quiet Cable", () => {
    const flags = { ...on(...M1_DONE, ...M2_DONE, F.STRAIT, F.FOUNDRY, F.CABLE), [`side:offer:${SQ.CABLE}`]: 1 };
    let w = emptyWorld();
    for (const id of ["a", "b"]) w = body(w, id, "cold-desk", { movement: 3, flags, quests: { [Q.M1]: 99, [Q.M2]: 99, [Q.M3]: 0, [SQ.CABLE]: 1 } });
    for (const id of ["a", "b"]) {
      w = openNode(w, id, "desk", "cable-told");
      expect(me(w, id).flags[SF.CABLE_TOLD], id).toBe(1);
      w = tickQuests(w, id);
      w = ticks(w, 1);
    }
    expect(w.pois["organ-cable"].state).toBe("quiet");
    expect(w.news.filter(x => x.text.startsWith("Someone kept a node")).length).toBe(1);
  });
});
