// Probe (round nineteen, out-of-order progression): the bell census is a first-hour side hour (guest-legal, movement 1). A body
// that finished its own census before going under meets Movement II's corridor beat with the Officer under the mute bell on the
// Gold Ring: the officer's `personal` puts its own census walk ahead of the corridor guard that holds him in the Annex.
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { POSITIONS, districtAt } from "./map";
import { emptyWorld, spawnGuest } from "./world";
import { snapshotFor, npcView } from "./snapshot";
import { questById, tickQuests } from "./quests";
import { applyChoose, applyTalk } from "./dialogue";
import { C, F, Q } from "./content/ids";
import { SF, SIDE_BY_ID, SIDE_PLACES, SQ, offerKey } from "./content/side";

const stepIdx = (q: string, s: string) => questById(q)!.steps.findIndex(x => x.id === s);
const on = (...keys: string[]) => Object.fromEntries(keys.map(k => [k, 1]));
const me = (w: WorldState): Player => w.players.get("me")!;
const M1_DONE = [F.ARRIVED, F.INTAKE, F.FIRST_NODE, F.DESK_THREE, F.SECOND_NODE, F.TALKED_QUILL, F.TALKED_ORD, F.TALKED_NARA, F.HEARD_RECORDER, F.MEMORIAL, F.BURIED_NARA, F.WEATHER_SAFETY, F.WEATHER_ORD, F.WEATHER_NARA, F.WEATHER_NAMED, F.UNDER, F.ANGEL, F.CARE];

describe("the Officer's corridor beat after the body's own first-hour census", () => {
  it("the journal, the bearing and the man all stand in the Annex corridor", () => {
    const w0 = emptyWorld();
    const base = spawnGuest("me", 0);
    const census = SIDE_BY_ID[SQ.CENSUS].steps.length;
    const p: Player = {
      ...base, guest: false, serial: 41, name: "#0041", house: "mortals", aura: 20, auraSeed: 20, bestand: 40, movement: 2,
      flags: on(...M1_DONE, F.SHRINE, F.TALKED_SEXTON, F.HALL, offerKey(SQ.CENSUS), SF.CENSUS_FIRST, SF.CENSUS_LAST, SF.CENSUS_REPORTED, SF.OFFICER_MET),
      quests: { [Q.M1]: 99, [Q.M2]: stepIdx(Q.M2, "officer"), [SQ.CENSUS]: census },
    };
    // the census's onFinish walked the shared Officer to the Ring (walkOnce)
    let w: WorldState = { ...w0, players: new Map(w0.players).set("me", p), npcs: { ...w0.npcs, officer: { ...w0.npcs.officer, ...SIDE_PLACES["officer-ring"], state: "ring", present: true } } };
    w = tickQuests(w, "me");
    const obj = snapshotFor(w, "me").objective!;
    expect(obj.step).toBe("officer");
    expect(obj.detail).toContain("Annex corridor");
    expect(obj.target?.district).toBe("annex");
    const view = npcView({ w, p: me(w), now: w.now }, w.npcs.officer)!;
    expect(view.district).toBe("annex");
    // talk to him where he is: the corridor node, which says he is in the corridor between the gate and the desk
    const players = new Map(w.players);
    players.set("me", { ...me(w), x: view.x, y: view.y + 20, district: districtAt(view.x, view.y + 20) });
    w = applyTalk({ ...w, players }, "me", "officer");
    expect(me(w).dialogue?.node).toBe("corridor");
    w = tickQuests(applyChoose(w, "me", "held", "corridor"), "me");
    expect(me(w).flags[F.TALKED_OFFICER]).toBe(1);
    expect(me(w).choices[C.ANNEX]).toBe("held");
    // a body whose census another Angel finished meets him in the Annex (sweep.test.ts), so this is the body's own census only
    expect(POSITIONS["home:officer"].district).toBe("annex");
  });
});
