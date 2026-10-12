// Probe (round nineteen, out-of-order progression): Nara's "four extractions without a funeral" is meant to count only after
// the going-under (economy.ts: "Nobody is walked out on before the going-under"), but the counter it reads,
// extractedSinceFuneral, runs from the first hour and is not reset by the burial she herself holds at her plot. A body that
// extracted Movement I's two nodes (the spine's own "Two extracted") loses her on its second extraction after waking.
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { NARA_THRESHOLD } from "./constants";
import { POSITIONS, districtAt } from "./map";
import { emptyWorld, spawnGuest } from "./world";
import { questById, tickQuests } from "./quests";
import { applyInteract } from "./interact";
import { C, F, Q } from "./content/ids";

const stepIdx = (q: string, s: string) => questById(q)!.steps.findIndex(x => x.id === s);
const on = (...keys: string[]) => Object.fromEntries(keys.map(k => [k, 1]));
const me = (w: WorldState): Player => w.players.get("me")!;
function stand(w: WorldState, at: string): WorldState {
  const pos = POSITIONS[at] ?? w.nodes.find(n => n.id === at)!;
  return { ...w, players: new Map(w.players).set("me", { ...me(w), x: pos.x, y: pos.y + 20, district: districtAt(pos.x, pos.y + 20), dialogue: null }) };
}
const act = (w: WorldState, at: string, choice: string) => tickQuests(applyInteract(stand(w, at), "me", at, choice), "me");

describe("Nara's count across the going-under", () => {
  it("first-hour extractions do not count past her plot: two in the second hour leave her with you", () => {
    const w0 = emptyWorld();
    const base = spawnGuest("me", 0);
    const p: Player = {
      ...base, guest: false, serial: 41, name: "#0041", house: "mortals", aura: 20, auraSeed: 20, movement: 1,
      flags: on(F.ANGEL, F.ARRIVED, F.INTAKE), quests: { [Q.M1]: stepIdx(Q.M1, "first-node") },
      party: { ...base.party, nara: "with" },
    };
    let w: WorldState = { ...w0, players: new Map(w0.players).set("me", p) };
    // the spine's two nodes, both extracted
    w = act(w, "nave-node-1", "extract");
    w = { ...w, players: new Map(w.players).set("me", { ...me(w), flags: { ...me(w).flags, [F.DESK_THREE]: 1 } }) };
    w = tickQuests(w, "me");
    w = act(w, "nave-node-2", "extract");
    expect(me(w).choices[C.SECOND_NODE]).toBe("extract");
    expect(me(w).extractedSinceFuneral).toBe(2);
    // the rest of the first hour, then her plot closed with her and the threshold
    w = { ...w, players: new Map(w.players).set("me", { ...me(w), flags: { ...me(w).flags, ...on(F.TALKED_QUILL, F.TALKED_ORD, F.TALKED_NARA, F.HEARD_RECORDER, F.MEMORIAL, F.WEATHER_SAFETY, F.WEATHER_ORD) }, choices: { ...me(w).choices, [C.MEMORIAL]: "voice" } }) };
    w = act(w, "nara-plot", "bury");
    expect(me(w).flags[F.BURIED_NARA]).toBe(1);
    expect(me(w).extractedSinceFuneral, "her plot closed is a burial: the four start again").toBe(0);
    w = { ...w, players: new Map(w.players).set("me", { ...me(w), flags: { ...me(w).flags, ...on(F.WEATHER_NARA, F.WEATHER_NAMED) }, choices: { ...me(w).choices, [C.WEATHER]: "end" }, quests: { ...me(w).quests, [Q.M1]: stepIdx(Q.M1, "going-under") } }) };
    w = act(w, "going-under", "under");
    expect(me(w).flags[F.UNDER]).toBe(1);
    expect(me(w).movement).toBe(2);
    expect(me(w).party.nara).toBe("with");
    // two extractions after waking
    w = act(w, "nave-node-3", "extract");
    expect(me(w).party.nara).toBe("with");
    w = act(w, "nave-node-3", "extract");
    expect(NARA_THRESHOLD).toBe(4);
    expect(me(w).party.nara, "two of four").toBe("with");
  });
});
