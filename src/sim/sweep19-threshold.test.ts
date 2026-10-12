// The player-defect sweep, round nineteen (out-of-order progression): the threshold asked only for a named weather and a closed plot, not for
// Movement I's earlier steps. Going under early: an Angel's movement is set to 2 by the under effect while the journal is
// still in Movement I (so the hall counts, and Vesper's offer is decided in the first hour after all); a guest locks with
// its Movement I unfinishable.
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { DT } from "./constants";
import { GUEST_SPAWN, POSITIONS, districtAt, walksBetween } from "./map";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { applyAction } from "./actions";
import { snapshotFor } from "./snapshot";
import { questById, tickQuests } from "./quests";
import { applyInteract } from "./interact";
import { C, F, Q } from "./content/ids";

const stepIdx = (q: string, s: string) => questById(q)!.steps.findIndex(x => x.id === s);
const on = (...keys: string[]) => Object.fromEntries(keys.map(k => [k, 1]));
const me = (w: WorldState, id = "me"): Player => w.players.get(id)!;
// Everything the threshold asks for, and nothing of the clerks, the nodes or Quill.
const SOCIAL = [F.ARRIVED, F.TALKED_ORD, F.TALKED_NARA, F.HEARD_RECORDER, F.MEMORIAL, F.BURIED_NARA, F.WEATHER_SAFETY, F.WEATHER_ORD, F.WEATHER_NARA, F.WEATHER_NAMED];

function standAt(w: WorldState, at: string, id = "me"): WorldState {
  const pos = POSITIONS[at];
  const players = new Map(w.players);
  players.set(id, { ...me(w, id), x: pos.x, y: pos.y + 20, district: districtAt(pos.x, pos.y + 20), dialogue: null });
  return { ...w, players };
}
const press = (w: WorldState, at: string, choice: string, id = "me") => tickQuests(applyInteract(standAt(w, at, id), id, at, choice), id);

function world(guest: boolean): WorldState {
  const w = emptyWorld();
  const base = spawnGuest("me", 0);
  const p: Player = {
    ...base, guest, serial: guest ? null : 41, name: guest ? "GUEST" : "#0041", house: guest ? "" : "sky", aura: 20, auraSeed: 20, bestand: 40,
    flags: on(...SOCIAL, ...(guest ? [] : [F.ANGEL])), choices: { [C.MEMORIAL]: "voice", [C.WEATHER]: "end" },
    quests: { [Q.M1]: stepIdx(Q.M1, "intake") },
  };
  return { ...w, players: new Map(w.players).set("me", p) };
}

describe("the threshold before the clerks", () => {
  it("the funeral street and the threshold are walkable from the spawn without passing anything the journal asks first", () => {
    const g = me(world(true));
    expect(walksBetween(g, GUEST_SPAWN, POSITIONS["home:nara"])).toBe(true);
    expect(walksBetween(g, GUEST_SPAWN, POSITIONS["going-under"])).toBe(true);
    expect(walksBetween(g, GUEST_SPAWN, POSITIONS["home:ord"])).toBe(true);
  });

  it("a guest at the threshold with its Intake step open is not locked out of the hour; the threshold says the first hour is not done", () => {
    const w = press(world(true), "going-under", "under");
    expect(me(w).locked).toBe(false);
    expect(me(w).quests[Q.M1]).toBe(stepIdx(Q.M1, "intake"));
    const look = press(world(true), "going-under", "look");
    expect(me(look).heard).toContain("The first hour is not done with you");
  });

  it("an Angel there with its Intake step open does not go under, so nothing of the second hour opens early", () => {
    const w = press(world(false), "going-under", "under");
    expect(me(w).flags[F.UNDER]).toBeUndefined();
    expect(me(w).movement).toBe(1);
  });
});
