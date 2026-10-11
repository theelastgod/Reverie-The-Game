// The player-defect sweep, round fifteen (2026-10-11): every journal step's text and target against coherent bodies at that step
// (45 spine steps, 79 side steps) and every place's verbs and lines. Each case is one finding, through the real reducers.
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { POSITIONS, districtAt } from "./map";
import { emptyWorld, spawnGuest } from "./world";
import { questById, objectiveFor, sideObjectivesFor, tickQuests } from "./quests";
import { C, F, Q } from "./content/ids";
import { SF, SQ } from "./content/side";
import { applyChoose, applyClose, applyTalk } from "./dialogue";
import { npcView, promptFor } from "./snapshot";
import { applyInteract } from "./interact";

const stepIdx = (q: string, s: string) => questById(q)!.steps.findIndex(x => x.id === s);
const M1_DONE = [F.ARRIVED, F.INTAKE, F.FIRST_NODE, F.DESK_THREE, F.SECOND_NODE, F.TALKED_QUILL, F.TALKED_ORD, F.TALKED_NARA, F.HEARD_RECORDER, F.MEMORIAL, F.BURIED_NARA, F.WEATHER_SAFETY, F.WEATHER_ORD, F.WEATHER_NARA, F.WEATHER_NAMED, F.UNDER, F.ANGEL, F.CARE];
const M2_DONE = [F.SHRINE, F.TALKED_SEXTON, F.HALL, F.TALKED_OFFICER, F.FREEZE, F.TITHE, F.BOARD, F.OPERATOR, F.GARDEN, F.M3];
const M3_DONE = [F.STRAIT, F.FOUNDRY, F.CABLE, F.MAP, F.BELL, F.FAILED, F.CAUL_MET, F.CAUL_OFFER, F.CAUL_ASKED, F.FORGE];
const on = (...keys: string[]) => Object.fromEntries(keys.map(k => [k, 1]));
const CH1 = { [C.FIRST_NODE]: "keep", [C.SECOND_NODE]: "keep", [C.MEMORIAL]: "voice", [C.WEATHER]: "end" };
const CH3 = { ...CH1, [C.ANNEX]: "held", [C.FREEZE]: "refused", [C.TITHE]: "paid", [C.OPERATOR]: "refuse", [C.GARDEN]: "numbered", [C.MAP]: "whole", [C.GLASS]: "dark", [C.FORGE]: "spot" };

function angel(patch: Partial<Player>): WorldState {
  const w = emptyWorld();
  const base = spawnGuest("me", 0);
  const p: Player = { ...base, guest: false, serial: 41, name: "#0041", house: "mortals", aura: 15, auraSeed: 15, bestand: 60, extracted: 1, kept: 1, ...patch, party: { ...base.party, ...(patch.party ?? {}) } };
  return { ...w, players: new Map(w.players).set("me", p) };
}
const me = (w: WorldState) => w.players.get("me")!;
const put = (w: WorldState, x: number, y: number) => ({ ...w, players: new Map(w.players).set("me", { ...me(w), x, y, district: districtAt(x, y) }) });
const at = (w: WorldState, poi: string) => put(w, POSITIONS[poi].x, POSITIONS[poi].y);
const ctx = (w: WorldState) => ({ w, p: me(w), now: w.now });
const press = (w: WorldState, poi: string, key: string) => {
  const v = promptFor(ctx(w))!;
  expect(v.targetId).toBe(poi);
  const verb = v.verbs.find(x => x.key === key);
  expect(verb, `${key} at ${poi}: ${JSON.stringify(v.verbs)}`).toBeTruthy();
  return tickQuests(applyInteract(w, "me", poi, verb!.choice), "me");
};
function talk(w: WorldState, npc: string): WorldState {
  const v = npcView(ctx(w), w.npcs[npc])!;
  expect(v, `${npc} present`).toBeTruthy();
  return applyTalk(put(w, v.x, v.y), "me", npc);
}

describe("Form 9 at the window before the spine's tithe is decided", () => {
  it("the journal says to decide the tithe first, and once it is, Q there refuses Form 9", () => {
    let w = angel({ movement: 2, flags: on(...M1_DONE, F.SHRINE, F.TALKED_SEXTON, F.HALL, F.TALKED_OFFICER, SF.OFFICER_MET), choices: { ...CH1, [C.ANNEX]: "held" }, quests: { [Q.M1]: 99, [Q.M2]: stepIdx(Q.M2, "freeze") } });
    w = at(w, "safety-desk");
    w = press(w, "safety-desk", "F");
    w = tickQuests(w, "me");
    w = talk(w, "officer");
    w = applyChoose(w, "me", "form9", "hub");
    w = tickQuests(w, "me");
    expect(me(w).quests[SQ.FORM9]).toBe(1);
    const before = sideObjectivesFor(ctx(w)).find(x => x.quest === SQ.FORM9)!;
    expect(before.detail).not.toContain("Press Q to refuse");
    expect(before.detail).toContain("Decide the tithe first");
    w = at(w, "tax-window");
    w = press(w, "tax-window", "E"); // the hour's tithe
    w = tickQuests(w, "me");
    const after = sideObjectivesFor(ctx(w)).find(x => x.quest === SQ.FORM9)!;
    expect(after.detail).toContain("Press Q to refuse");
    w = press(w, "tax-window", "Q");
    w = tickQuests(w, "me");
    expect(me(w).quests[SQ.FORM9]).toBe(2);
  });
});

describe("the vault's hour for a body with no copy in hand", () => {
  it("sends it to the tray for one first, where E is offered", () => {
    let w = angel({ movement: 4, flags: on(...M1_DONE, ...M2_DONE, ...M3_DONE, SF.KEEPER_MET), choices: CH3, quests: { [Q.M1]: 99, [Q.M2]: 99, [Q.M3]: 99, [Q.M4]: 0 } });
    w = tickQuests(w, "me");
    w = talk(w, "keeper");
    w = applyChoose(w, "me", "vault", "hub");
    w = tickQuests(w, "me");
    const o = sideObjectivesFor(ctx(w)).find(x => x.quest === SQ.VAULT)!;
    expect(o.detail).toContain("forge tray");
    w = put(w, o.target!.x, o.target!.y);
    const pr = promptFor(ctx(w));
    expect(pr?.targetId).toBe("forge-tray");
    expect(pr!.verbs.map(v => v.key)).toContain("E");
  });
});

describe("the mortality step says Nara offers a burial to a body she has left", () => {
  // Path: an Angel past the going-under extracts four nodes without a funeral (economy.ts: nara gone), then walks the rest of
  // Movement II and III (refused the yield, buried the garden itself). At IV's first step the journal lists her burial.
  for (const nara of ["gone", "waiting"] as const) {
    it(`Nara ${nara}`, () => {
      const w = angel({ movement: 4, flags: on(...M1_DONE, ...M2_DONE, ...M3_DONE), choices: CH3, quests: { [Q.M1]: 99, [Q.M2]: 99, [Q.M3]: 99, [Q.M4]: stepIdx(Q.M4, "mortality") }, party: { nara, quill: "with", ord: "with" } as Player["party"] });
      const o = objectiveFor(ctx(w))!;
      expect(o.step).toBe("mortality");
      const said = me(talk(w, "nara")).dialogue!;
      expect(said.node).toBe(nara);
      expect(said.choices?.map(c => c.id) ?? []).not.toContain("stand");
      expect(o.detail, `Nara: "${said.text}"`).not.toContain("Nara offers a burial");
    });
  }
});

describe("both of Halla's hours under the bell", () => {
  it("E waits first for the bought hour, and the three waits of the other hour follow in one stay", () => {
    let w = angel({ movement: 2, flags: on(...M1_DONE), choices: CH1, quests: { [Q.M1]: 99, [Q.M2]: 0 } });
    w = talk(w, "omen");
    w = applyChoose(w, "me", "buy", me(w).dialogue!.node);
    w = applyChoose(w, "me", "go", me(w).dialogue!.node);
    w = applyClose(w, "me");
    w = tickQuests(w, "me");
    w = talk(w, "omen");
    w = applyChoose(w, "me", "bell", "hub");
    w = applyChoose(w, "me", "go", me(w).dialogue!.node);
    w = applyClose(w, "me");
    w = tickQuests(w, "me");
    w = at(w, "omen-terrace");
    w = press(w, "omen-terrace", "E");
    expect(me(w).quests[SQ.HOURS]).toBe(1);
    w = at(w, "hour-bell");
    w = press(w, "hour-bell", "E");
    w = tickQuests(w, "me");
    expect(me(w).quests[SQ.HOURS], "the bought hour waited").toBe(2);
    expect(w.pois["hour-bell"]?.state ?? "still").not.toBe("struck");
    w = applyClose(w, "me");
    for (let i = 0; i < 3; i++) w = press(w, "hour-bell", "E");
    expect(w.pois["hour-bell"]?.state).toBe("struck");
  });
});
