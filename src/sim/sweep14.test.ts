// The player-defect sweep, round fourteen (2026-10-11): a person's opening against the body's state (a scan of 6,000
// coherent bodies against every person shown to them), and a body with nothing (no purse, no aura). Each case is one finding.
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { POSITIONS, districtAt } from "./map";
import { emptyWorld, spawnGuest } from "./world";
import { questById, objectiveFor } from "./quests";
import { C, F, Q } from "./content/ids";
import { applyChoose, applyClose, applyTalk } from "./dialogue";
import { npcView } from "./snapshot";

const stepIdx = (q: string, s: string) => questById(q)!.steps.findIndex(x => x.id === s);
const M1_DONE = [F.ARRIVED, F.INTAKE, F.FIRST_NODE, F.DESK_THREE, F.SECOND_NODE, F.TALKED_QUILL, F.TALKED_ORD, F.TALKED_NARA, F.HEARD_RECORDER, F.MEMORIAL, F.BURIED_NARA, F.WEATHER_SAFETY, F.WEATHER_ORD, F.WEATHER_NARA, F.WEATHER_NAMED, F.UNDER];
const M2_DONE = [F.SHRINE, F.CARE, F.TALKED_SEXTON, F.HALL, F.TALKED_OFFICER, F.FREEZE, F.TITHE, F.BOARD, F.OPERATOR, F.GARDEN, F.M3];
const M3_DONE = [F.STRAIT, F.FOUNDRY, F.CABLE, F.MAP, F.BELL, F.FAILED, F.CAUL_MET, F.CAUL_OFFER, F.CAUL_ASKED, F.FORGE];
const on = (...keys: string[]) => Object.fromEntries(keys.map(k => [k, 1]));
const CH = { [C.FIRST_NODE]: "keep", [C.SECOND_NODE]: "keep", [C.MEMORIAL]: "voice", [C.WEATHER]: "end", [C.FREEZE]: "refused", [C.OPERATOR]: "refuse", [C.GARDEN]: "numbered", [C.MAP]: "whole", [C.GLASS]: "dark", [C.FORGE]: "spot" };

function angel(patch: Partial<Player>): WorldState {
  const w = emptyWorld();
  const base = spawnGuest("me", 0);
  const p: Player = { ...base, guest: false, serial: 41, name: "#0041", house: "mortals", aura: 15, auraSeed: 15, extracted: 1, kept: 1, ...patch, party: { ...base.party, ...(patch.party ?? {}) } };
  const players = new Map(w.players); players.set("me", p);
  return { ...w, players };
}
/** Stand the body where this viewer sees the person, and talk. */
function talk(w: WorldState, npc: string): WorldState {
  const p = w.players.get("me")!;
  const v = npcView({ w, p, now: w.now }, w.npcs[npc])!;
  expect(v, `${npc} present`).toBeTruthy();
  const players = new Map(w.players); players.set("me", { ...p, x: v.x, y: v.y, district: districtAt(v.x, v.y) });
  return applyTalk({ ...w, players }, "me", npc);
}
const dlg = (w: WorldState) => w.players.get("me")!.dialogue!;

describe("Ord at the Care gate names Nara in the ring when she is not with this body", () => {
  // Path: an Angel past the going-under extracts four nodes without a funeral (economy.ts NARA_THRESHOLD: nara gone), and
  // buries a fallen body's wreckage after (effects.ts: gone -> waiting); then the garden, the glass, the forge, and the
  // mortality act by watch at the buried garden. The journal's `party` step sends it to Ord at the gate.
  const m4 = (nara: "gone" | "waiting", extra: Partial<Player> = {}) => angel({
    movement: 4,
    flags: on(...M1_DONE, ...M2_DONE, ...M3_DONE, F.MORTALITY),
    choices: { ...CH, [C.MORTALITY]: "watch" },
    quests: { [Q.M1]: 99, [Q.M2]: 99, [Q.M3]: 99, [Q.M4]: stepIdx(Q.M4, "party") },
    party: { nara, quill: "with", ord: "with" } as Player["party"],
    ...extra,
  });
  for (const nara of ["gone", "waiting"] as const) {
    it(`gate, Nara ${nara}`, () => {
      const w = m4(nara);
      expect(objectiveFor({ w, p: w.players.get("me")!, now: 0 })?.step).toBe("party");
      const gate = dlg(talk(w, "ord"));
      expect(gate.node).toBe("gate");
      const sheSays = dlg(talk(w, "nara"));
      const at = npcView({ w, p: w.players.get("me")!, now: 0 }, w.npcs["nara"])!;
      const ring = POSITIONS["station:nara-clearing"];
      expect(Math.hypot(at.x - ring.x, at.y - ring.y)).toBeGreaterThan(100); // she is not at the ring for this body
      expect(sheSays.node).toBe(nara);
      // Ord tells the body she is already in it
      expect(gate.text, `Nara: "${sheSays.text}"`).not.toContain("Nara is in there already");
    });
  }
  it("gate-after, Nara waiting, party with", () => {
    const w = m4("waiting", { flags: on(...M1_DONE, ...M2_DONE, ...M3_DONE, F.MORTALITY, F.GATE), choices: { ...CH, [C.MORTALITY]: "watch", [C.PARTY]: "with" }, quests: { [Q.M1]: 99, [Q.M2]: 99, [Q.M3]: 99, [Q.M4]: stepIdx(Q.M4, "prepare") } });
    const after = dlg(talk(w, "ord"));
    expect(after.node).toBe("gate-after");
    expect(dlg(talk(w, "nara")).text).toContain("I am on the funeral street");
    expect(after.text).not.toContain("Nara is at the ring already");
  });
});

describe("Vesper tells a third-hour refuser to bury the garden it already buried", () => {
  // Path: an Angel refuses the private yield (II.10), buries the wreckage garden to open the Organs door (F.GARDEN, F.M3),
  // walks the third hour, and stops at the Concentrator's desk on the Grid; nobody on the server took the yield (her desk stays).
  it("refused, garden in the ground", () => {
    const w = angel({ movement: 3, flags: on(...M1_DONE, ...M2_DONE), choices: { ...CH }, quests: { [Q.M1]: 99, [Q.M2]: 99, [Q.M3]: stepIdx(Q.M3, "strait") } });
    const v = dlg(talk(w, "vesper"));
    expect(v.node).toBe("refused");
    expect(w.pois["wreckage-garden"]).toBeTruthy();
    expect(v.text).not.toContain("Go and bury your garden");
  });
});

describe("Ord's honest ledger writes a first node the body has not decided", () => {
  // Path: a fresh arrival (guest or Angel) walks north to Ord before the Intake Clerk and the first node: first ->
  // "What do you call the weather?" -> weather -> ledger -> "Enter me."
  it("ledger-yes before any node", () => {
    let w = angel({ movement: 1, extracted: 0, kept: 0, flags: {}, choices: {}, quests: { [Q.M1]: 0 } });
    w = talk(w, "ord");
    expect(dlg(w).node).toBe("first");
    w = applyChoose(w, "me", "weather", "first");
    expect(dlg(w).node).toBe("weather");
    w = applyClose(w, "me", "weather");
    expect(dlg(w).node).toBe("ledger");
    w = applyChoose(w, "me", "enter", "ledger");
    const me = w.players.get("me")!;
    expect(me.choices[C.FIRST_NODE]).toBeUndefined();
    expect(me.extracted + me.kept).toBe(0);
    expect(dlg(w).text).not.toContain("Kept the first node.");
  });
});

describe("a body with nothing: the dark lines name only what the body can reach", () => {
  it("a first-hour Angel with a dark aura is not sent to the Care's shrine it cannot enter; one that went under is", () => {
    for (const npc of ["ord", "quill", "nara"]) {
      const first = angel({ movement: 1, aura: 2, bestand: 0, flags: {}, choices: {}, quests: { [Q.M1]: 0 } });
      const said = dlg(talk(first, npc));
      expect(said.node, npc).toBe("dark");
      expect(said.text, npc).not.toMatch(/Care/);
      const under = angel({ movement: 2, aura: 2, bestand: 0, flags: on(...M1_DONE), choices: { ...CH }, quests: { [Q.M1]: 99, [Q.M2]: 0 } });
      const there = dlg(talk(under, npc));
      if (there.node === "dark") expect(there.text, npc).toMatch(/Care/);
    }
  });
});
