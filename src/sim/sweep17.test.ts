// The player-defect sweep, round seventeen (2026-10-11): every dialogue path past the opening, walked to depth five for
// 2,500 coherent bodies (24,765 dialogues, 167 of 185 nodes). Each case is one finding, through the real reducers.
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { districtAt } from "./map";
import { emptyWorld, spawnGuest } from "./world";
import { objectiveFor, questById } from "./quests";
import { C, F, Q, W } from "./content/ids";
import { applyChoose, applyTalk } from "./dialogue";
import { npcView } from "./snapshot";

const stepIdx = (q: string, s: string) => questById(q)!.steps.findIndex(x => x.id === s);
const M1_DONE = [F.ARRIVED, F.INTAKE, F.FIRST_NODE, F.DESK_THREE, F.SECOND_NODE, F.TALKED_QUILL, F.TALKED_ORD, F.TALKED_NARA, F.HEARD_RECORDER, F.MEMORIAL, F.BURIED_NARA, F.WEATHER_SAFETY, F.WEATHER_ORD, F.WEATHER_NARA, F.WEATHER_NAMED, F.UNDER];
const M2_DONE = [F.SHRINE, F.CARE, F.TALKED_SEXTON, F.HALL, F.TALKED_OFFICER, F.FREEZE, F.TITHE, F.BOARD, F.OPERATOR, F.GARDEN, F.M3];
const M3_DONE = [F.STRAIT, F.FOUNDRY, F.CABLE, F.MAP, F.BELL, F.FAILED, F.CAUL_MET, F.CAUL_OFFER, F.CAUL_ASKED, F.FORGE];
const on = (...keys: string[]) => Object.fromEntries(keys.map(k => [k, 1]));
const CH = { [C.FIRST_NODE]: "keep", [C.SECOND_NODE]: "keep", [C.MEMORIAL]: "voice", [C.WEATHER]: "end", [C.FREEZE]: "refused", [C.OPERATOR]: "refuse", [C.GARDEN]: "numbered", [C.MAP]: "whole", [C.GLASS]: "dark", [C.FORGE]: "spot", [C.MORTALITY]: "watch" };

function m4(nara: Player["party"]["nara"]): WorldState {
  const w = emptyWorld();
  const base = spawnGuest("me", 0);
  const p: Player = {
    ...base, guest: false, serial: 41, name: "#0041", house: "mortals", aura: 15, auraSeed: 15, extracted: 1, kept: 1, movement: 4,
    flags: on(...M1_DONE, ...M2_DONE, ...M3_DONE, F.MORTALITY), choices: { ...CH },
    quests: { [Q.M1]: 99, [Q.M2]: 99, [Q.M3]: 99, [Q.M4]: stepIdx(Q.M4, "party") },
    party: { ...base.party, nara, quill: "with", ord: "with" },
  };
  const players = new Map(w.players); players.set("me", p);
  return { ...w, players };
}
function talk(w: WorldState, npc: string): WorldState {
  const p = w.players.get("me")!;
  const v = npcView({ w, p, now: w.now }, w.npcs[npc])!;
  const players = new Map(w.players); players.set("me", { ...p, x: v.x, y: v.y, district: districtAt(v.x, v.y) });
  return applyTalk({ ...w, players }, "me", npc);
}
const dlg = (w: WorldState) => w.players.get("me")!.dialogue!;

describe("Ord's gate-alone names Nara in the ring when she is not with this body", () => {
  // Path: an Angel past the going-under extracts four nodes without a funeral (economy.ts NARA_THRESHOLD: Nara gone), or
  // buries a fallen body's wreckage after (effects.ts bury: gone -> waiting); the garden, the glass, the forge; keeps watch
  // at the buried garden (the mortality act); the journal's `party` step sends it to Ord at the Care gate; "Alone."
  for (const nara of ["gone", "waiting"] as const) {
    it(`Nara ${nara}`, () => {
      let w = talk(m4(nara), "ord");
      expect(dlg(w).node).toBe("gate");
      expect(dlg(w).text).not.toContain("Nara is in there already"); // the gate itself says she is not there
      w = applyChoose(w, "me", "alone", "gate");
      expect(dlg(w).node).toBe("gate-alone");
      expect(w.players.get("me")!.party.nara).toBe(nara);
      // she is not at the ring for this body (npcs.ts nara.personal), so she does not "not leave the ring"
      expect(dlg(w).text).not.toContain("Nara will not leave the ring");
    });
  }
});

describe("the mortality step's bearing after another Angel had Ione's last word", () => {
  it("points this body at Ione on her bench, where it still sees her and she still offers it", () => {
    let w = m4("with");
    const p = w.players.get("me")!;
    const players = new Map(w.players);
    players.set("me", { ...p, flags: on(...M1_DONE, ...M2_DONE, ...M3_DONE), choices: { ...CH, [C.MORTALITY]: undefined as never }, quests: { ...p.quests, [Q.M4]: stepIdx(Q.M4, "mortality") } });
    w = { ...w, players, flags: { ...w.flags, [W.IONE_GONE]: 1 } };
    const me = w.players.get("me")!;
    const o = objectiveFor({ w, p: me, now: w.now })!;
    expect(o.step).toBe("mortality");
    const ione = npcView({ w, p: me, now: w.now }, w.npcs.ione);
    expect(ione, "she is on her bench for this body").toBeTruthy();
    expect(Math.hypot(o.target!.x - ione!.x, o.target!.y - ione!.y)).toBeLessThan(120);
  });
});
