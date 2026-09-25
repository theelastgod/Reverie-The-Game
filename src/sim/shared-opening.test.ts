import { describe, expect, it } from "vitest";
import { applyBury, applyGoingUnder, applyRead, applyTalk, applyUse, emptyWorld, snapshot, spawnGuest } from "./world";
import { MEMORIAL } from "./memorial";
import { BURIAL_PLOT, GOING_UNDER, NAVE_NPCS, NAVE_SIGNS, WRECK_GARDEN } from "./campaign";

function advancedWorld() {
  const w = emptyWorld();
  w.arenaPeopleHeld = true; w.gardenPeopleHeld = true;
  w.weatherNamed = true; w.m3Open = true; w.naraGone = true; w.quillGone = true; w.ordGone = true;
  w.naraAtClearing = true; w.wetCult = true; w.frozen = true; w.shrinePeopleHeld = true;
  w.rites = [...w.rites.map(r => ({ ...r, done: true })), { ...WRECK_GARDEN, done: false }];
  return w;
}

describe("personal opening in a shared city", () => {
  it.each([true, false])("a new arrival (guest=%s) can finish the opening after the party left", guest => {
    let w = advancedWorld();
    w.players.set("new", { ...spawnGuest("new"), guest });
    const originalClimate = w.gestell;
    const safety = NAVE_SIGNS.find(s => s.id === "safety-plaque")!;
    w.players.set("new", { ...w.players.get("new")!, x: safety.x, y: safety.y });
    w = applyRead(w, "new", safety.id);
    expect(w.players.get("new")!.weather.safety).toBe(true);
    for (const n of NAVE_NPCS) {
      expect(snapshot(w, "new").npcs.find(person => person.id === n.id)).toEqual(n);
      w.players.set("new", { ...w.players.get("new")!, x: n.x, y: n.y });
      w = applyTalk(w, "new", n.id);
      expect(w.players.get("new")!.beats[n.id as "nara" | "quill" | "ord"]).toBe(true);
    }
    expect(w.players.get("new")!.namedWeather).toBe(true);
    w.players.set("new", { ...w.players.get("new")!, x: MEMORIAL.x, y: MEMORIAL.y });
    w = applyUse(w, "new", MEMORIAL.id, "keep");
    w.players.set("new", { ...w.players.get("new")!, x: BURIAL_PLOT.x, y: BURIAL_PLOT.y });
    w = applyBury(w, "new");
    expect(w.players.get("new")!.beats.burial).toBe(true);
    w.players.set("new", { ...w.players.get("new")!, x: GOING_UNDER.x, y: GOING_UNDER.y });
    w = applyGoingUnder(w, "new");
    expect(w.players.get("new")!.locked).toBe(guest);
    expect(w.players.get("new")!.beats.under).toBe(!guest);
    const earned = w.players.get("new")!.winke;
    for (let i = 0; i < 10; i++) w = applyGoingUnder(w, "new");
    expect(w.players.get("new")!.winke).toBe(earned);
    expect(w.naraGone && w.quillGone && w.ordGone).toBe(true);
    expect(w.gestell).toBe(originalClimate);
  });

  it("uses the visible opening position for distance checks and grants no repeat readiness", () => {
    let w = advancedWorld(); w.naraGone = false;
    const p = spawnGuest("new"); w.players.set(p.id, p);
    const moved = snapshot(w).npcs.find(n => n.id === "nara")!;
    const original = NAVE_NPCS.find(n => n.id === "nara")!;
    expect(moved.x !== original.x || moved.y !== original.y).toBe(true);
    w.players.set(p.id, { ...p, x: moved.x, y: moved.y });
    expect(applyTalk(w, p.id, "nara").players.get(p.id)!.beats.nara).toBe(false);
    w.players.set(p.id, { ...p, x: original.x, y: original.y });
    w = applyTalk(w, p.id, "nara");
    const readiness = w.players.get(p.id)!.readiness;
    for (let i = 0; i < 20; i++) w = applyTalk(w, p.id, "nara");
    expect(w.players.get(p.id)!.readiness).toBe(readiness);
    expect(w.players.get(p.id)!.wink).toBe("");
  });

  it("a veteran keeps the shared departures while a newcomer sees the opening party", () => {
    const w = advancedWorld(); const veteran = spawnGuest("old");
    w.players.set("old", { ...veteran, guest: false, beats: { ...veteran.beats, under: true } });
    w.players.set("new", spawnGuest("new"));
    expect(snapshot(w, "new").npcs.filter(n => NAVE_NPCS.some(first => first.id === n.id))).toHaveLength(3);
    expect(snapshot(w, "old").npcs.filter(n => NAVE_NPCS.some(first => first.id === n.id))).toHaveLength(0);
  });
});
