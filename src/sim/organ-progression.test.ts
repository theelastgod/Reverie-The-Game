import { describe, expect, it } from "vitest";
import { applyM3, applyOrgan, applyRead, applyTalk, campaignNpcs, emptyWorld, snapshot, spawnGuest } from "./world";
import { M3_DOOR, M3_ENTER, M3_SPECTATOR, NAVE_NPCS, ORGAN_NEED_M3, ORGAN_PLAQUES, ORD_MAP, ORD_NEED_ORGANS, organBeat } from "./campaign";

function advancedWorld(entered = false) {
  const w = emptyWorld();
  Object.assign(w, { m3Open: true, foundryDark: true, straitBuried: true, straitRefused: true,
    cableDark: true, stallPeopleHeld: true, foundryPeopleHeld: true, straitPeopleHeld: true,
    cablePeopleHeld: true, ordGone: true, lastGodNamed: true });
  w.signs.push(...ORGAN_PLAQUES.map(s => ({ ...s, text: "Others have changed this place." })));
  const p = spawnGuest("arrival");
  w.players.set(p.id, { ...p, guest: false, beats: { ...p.beats, under: true, m3: entered } });
  return w;
}

describe("personal Movement III progression", () => {
  it("shared organ states cannot grant introductions, house standing or world changes before entry", () => {
    for (const sign of ORGAN_PLAQUES) {
      for (const house of ["mortals", "earth", "sky", "divinities"] as const) {
        const w = advancedWorld();
        w.players.set("arrival", { ...w.players.get("arrival")!, house, x: sign.x, y: sign.y });
        const before = w.players.get("arrival")!;
        const after = applyRead(w, "arrival", sign.id);
        expect(after.players.get("arrival")).toEqual({ ...before, heard: ORGAN_NEED_M3 });
        expect({ ...after, players: undefined }).toEqual({ ...w, players: undefined });
      }
    }
  });

  it("guests remain spectators even with stale Movement III progress", () => {
    const w = advancedWorld(true);
    const sign = ORGAN_PLAQUES[0];
    w.players.set("arrival", { ...w.players.get("arrival")!, guest: true, x: sign.x, y: sign.y });
    const after = applyRead(w, "arrival", sign.id).players.get("arrival")!;
    expect(after.heard).toBe(M3_SPECTATOR);
    expect(after.beats.strait).toBe(false);
  });

  it("preserves every arrival's introductions and the shared city's changed state", () => {
    let w = advancedWorld(true);
    const start = w.players.get("arrival")!.readiness;
    for (const original of ORGAN_PLAQUES) {
      w.players.set("arrival", { ...w.players.get("arrival")!, x: original.x, y: original.y });
      const before = w;
      w = applyRead(w, "arrival", original.id);
      const p = w.players.get("arrival")!;
      expect(p.beats[organBeat(original.id)!]).toBe(true);
      expect(p.heard).toContain(original.text);
      expect(p.heard).toContain("Others have changed this place.");
      expect({ ...w, players: undefined }).toEqual({ ...before, players: undefined });
      const repeat = applyRead(w, "arrival", original.id);
      expect(repeat.players.get("arrival")!.readiness).toBe(p.readiness);
    }
    expect(w.players.get("arrival")!.readiness).toBe(start + 3);
    expect(w.players.get("arrival")!.bestand).toBe(0);
  });

  it("rejects distant reads and fabricated organ coordinates", () => {
    const w = advancedWorld(true);
    expect(applyRead(w, "arrival", ORGAN_PLAQUES[0].id)).toBe(w);
    const p = w.players.get("arrival")!;
    expect(applyOrgan(w, "arrival", { ...ORGAN_PLAQUES[0], x: p.x, y: p.y })).toBe(w);
    expect(applyOrgan(w, "arrival", { id: "fake", x: p.x, y: p.y, title: "Fake", text: "Fake" })).toBe(w);
  });

  it("a changed door still performs a qualified character's first entry", () => {
    const w = advancedWorld();
    w.vesperPeopleHeld = true;
    w.signs.push({ ...M3_DOOR, title: "Movement III — people", text: "Someone came before." });
    w.players.set("arrival", { ...w.players.get("arrival")!, x: M3_DOOR.x, y: M3_DOOR.y,
      beats: { ...w.players.get("arrival")!.beats, hall: true, refuse: true, garden: true } });
    const after = applyRead(w, "arrival", M3_DOOR.id);
    const p = after.players.get("arrival")!;
    expect(p.heard).toBe(M3_ENTER);
    expect(p.beats.m3).toBe(true);
    expect(p.inM3).toBe(true);
    expect(p.x).toBe(ORGAN_PLAQUES[0].x);
    expect(after.m3PeopleHeld).toBe(false);
    expect(applyM3(w, "arrival").players.get("arrival")).toEqual(p);
  });

  it("Ord's personal map remains reachable after departure and requires all three introductions", () => {
    let w = advancedWorld(true);
    const ord = NAVE_NPCS.find(n => n.id === "ord")!;
    expect(campaignNpcs(w, w.players.get("arrival")).find(n => n.id === "ord")).toEqual(ord);
    expect(snapshot(w, "arrival").npcs.find(n => n.id === "ord")).toEqual(ord);
    w.players.set("arrival", { ...w.players.get("arrival")!, x: ord.x, y: ord.y });
    w = applyTalk(w, "arrival", "ord");
    expect(w.players.get("arrival")!.heard).toBe(ORD_NEED_ORGANS);
    expect(w.players.get("arrival")!.beats.map).toBe(false);
    for (const sign of ORGAN_PLAQUES) {
      w.players.set("arrival", { ...w.players.get("arrival")!, x: sign.x, y: sign.y });
      w = applyRead(w, "arrival", sign.id);
    }
    const before = w.players.get("arrival")!;
    w.players.set("arrival", { ...before, x: ord.x, y: ord.y });
    const mapped = applyTalk(w, "arrival", "ord");
    expect(mapped.players.get("arrival")!.heard).toBe(ORD_MAP);
    expect(mapped.players.get("arrival")!.beats.map).toBe(true);
    expect(mapped.players.get("arrival")!.readiness).toBe(before.readiness + 1);
    expect(mapped.ordGone).toBe(true);
    expect(mapped.signs).toEqual(w.signs);
  });
});
