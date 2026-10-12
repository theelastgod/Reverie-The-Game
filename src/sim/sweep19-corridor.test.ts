// Probe (round nineteen, out-of-order progression): the freeze desk opens on the hall alone, so a body can sign (or refuse) it
// before Movement II's corridor beat. Corvin Slate then still stops it "before the desk" and sells it the freeze it already
// signed, and the desk's line that answers the corridor ("You said hungry in the corridor") never has a corridor to answer.
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { POSITIONS, districtAt } from "./map";
import { emptyWorld, spawnGuest } from "./world";
import { npcView, snapshotFor } from "./snapshot";
import { questById, tickQuests } from "./quests";
import { applyChoose, applyTalk } from "./dialogue";
import { applyInteract } from "./interact";
import { C, F, Q } from "./content/ids";

const stepIdx = (q: string, s: string) => questById(q)!.steps.findIndex(x => x.id === s);
const on = (...keys: string[]) => Object.fromEntries(keys.map(k => [k, 1]));
const me = (w: WorldState): Player => w.players.get("me")!;
const M1_DONE = [F.ARRIVED, F.INTAKE, F.FIRST_NODE, F.DESK_THREE, F.SECOND_NODE, F.TALKED_QUILL, F.TALKED_ORD, F.TALKED_NARA, F.HEARD_RECORDER, F.MEMORIAL, F.BURIED_NARA, F.WEATHER_SAFETY, F.WEATHER_ORD, F.WEATHER_NARA, F.WEATHER_NAMED, F.UNDER, F.ANGEL, F.CARE];

describe("the freeze desk before the corridor", () => {
  it("the desk waits for the corridor: it will not take a signature from a body the Officer has not stopped", () => {
    const w0 = emptyWorld();
    const base = spawnGuest("me", 0);
    const p: Player = {
      ...base, guest: false, serial: 41, name: "#0041", house: "mortals", aura: 20, auraSeed: 20, bestand: 40, movement: 2,
      flags: on(...M1_DONE, F.SHRINE, F.TALKED_SEXTON, F.HALL), quests: { [Q.M1]: 99, [Q.M2]: stepIdx(Q.M2, "officer") },
    };
    let w: WorldState = { ...w0, players: new Map(w0.players).set("me", p) };
    expect(snapshotFor(w, "me").objective?.step).toBe("officer");
    const desk = POSITIONS["safety-desk"];
    w = { ...w, players: new Map(w.players).set("me", { ...me(w), x: desk.x, y: desk.y + 20, district: districtAt(desk.x, desk.y + 20) }) };
    expect(snapshotFor(w, "me").prompt!.verbs.map(v => v.choice)).toEqual(["read"]);
    w = tickQuests(applyInteract(w, "me", "safety-desk", "sign"), "me");
    expect(me(w).choices[C.FREEZE]).toBeUndefined();
    w = tickQuests(applyInteract(w, "me", "safety-desk", "read"), "me");
    expect(me(w).heard).toContain("Go and be stopped");
  });
});
