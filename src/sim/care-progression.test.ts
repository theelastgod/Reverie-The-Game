import { describe, expect, it } from "vitest";
import { applyBury, applyCare, applyOperator, applyRead, applyTalk, campaignNpcs, emptyWorld, spawnGuest } from "./world";
import { CARE_DOOR, GARDEN_RITE, HOUSE_HALL, M3_DOOR, OPERATOR_DESK, PRIVATE_YIELD, WRECK_GARDEN, WINK_CARE, hallPlaque } from "./campaign";

function advancedWorld() {
  const w = emptyWorld();
  Object.assign(w, { careOpen: true, m3Open: true, peopleHeld: true, lastGodNamed: true,
    fourfoldHeld: true, keepPeopleHeld: true, underPeopleHeld: true,
    vesperGone: true, vesperAtFoundry: true, foundryDark: true });
  w.signs.push(hallPlaque(), { ...OPERATOR_DESK, title: "Vacant", text: "Gone." },
    { ...WRECK_GARDEN, title: "Garden — people", text: "Others came before." });
  w.rites.push({ ...GARDEN_RITE, done: true });
  w.pois.push({ ...WRECK_GARDEN, name: "Sexton mark", kind: "sexton-mark" },
    { ...M3_DOOR, name: "Movement III — people", kind: "m3-people" });
  const p = spawnGuest("new");
  w.players.set(p.id, { ...p, guest: false, beats: { ...p.beats, under: true },
    x: CARE_DOOR.x, y: CARE_DOOR.y });
  return w;
}

describe("Movement II in an advanced shared world", () => {
  it("preserves first Care entry before later global branches", () => {
    const w = advancedWorld();
    const after = applyCare(w, "new");
    const p = after.players.get("new")!;
    expect(p.beats.care).toBe(true);
    expect(p.inCare).toBe(true);
    expect(p.heard).toBe(WINK_CARE);
    expect(p.beats.lastGod).toBe(false);
    expect(p.beats.carePeople).toBe(false);
    expect(p.x).toBe(HOUSE_HALL.x - 48);
    expect(after.signs).toEqual(w.signs);
    expect(after.pois).toEqual(w.pois);
  });

  it("shared Care and garden progress cannot substitute for going under", () => {
    for (const guest of [true, false]) {
      const w = advancedWorld();
      const p = w.players.get("new")!;
      w.players.set(p.id, { ...p, guest, beats: { ...p.beats, under: false } });
      expect(applyCare(w, p.id).players.get(p.id)!.beats.care).toBe(false);
      w.players.set(p.id, { ...w.players.get(p.id)!, x: WRECK_GARDEN.x, y: WRECK_GARDEN.y });
      expect(applyBury(w, p.id)).toBe(w);
    }
  });

  it("a first House hall visit cannot be consumed by the shared tithe branch", () => {
    const w = applyCare(advancedWorld(), "new");
    w.players.set("new", { ...w.players.get("new")!, x: HOUSE_HALL.x, y: HOUSE_HALL.y });
    const p = applyRead(w, "new", HOUSE_HALL.id).players.get("new")!;
    expect(p.beats.hall).toBe(true);
    expect(p.beats.tithePeople).toBe(false);
    expect(p.readiness).toBe(w.players.get("new")!.readiness + 1);
  });

  it.each(["take", "refuse"] as const)("keeps the personal %s route available after Vesper leaves", choice => {
    const w = advancedWorld();
    const p = w.players.get("new")!;
    w.players.set("new", { ...p, x: OPERATOR_DESK.x, y: OPERATOR_DESK.y,
      beats: { ...p.beats, care: true, hall: true } });
    const vesper = campaignNpcs(w, w.players.get("new")).find(n => n.id === "vesper")!;
    expect([vesper.x, vesper.y]).toEqual([OPERATOR_DESK.x, OPERATOR_DESK.y]);
    const heard = applyTalk(w, "new", "vesper");
    expect(heard.players.get("new")!.beats.yield).toBe(true);
    expect(applyRead(w, "new", OPERATOR_DESK.id).players.get("new")!.beats.yield).toBe(true);
    const chosen = applyOperator(heard, "new", choice);
    const after = chosen.players.get("new")!;
    expect(after.beats.cold).toBe(choice === "take");
    expect(after.beats.refuse).toBe(choice === "refuse");
    expect(after.bestand).toBe(choice === "take" ? PRIVATE_YIELD : 0);
    expect(chosen.pois).toEqual(expect.arrayContaining(w.pois));
    expect(chosen.pois.find(poi => poi.id === M3_DOOR.id)).toEqual(w.pois.find(poi => poi.id === M3_DOOR.id));
    expect(chosen.vesperGone).toBe(true);
    expect(chosen.foundryDark).toBe(true);
    const repeat = applyOperator(chosen, "new", choice === "take" ? "refuse" : "take");
    expect(repeat.players.get("new")!.beats).toEqual(after.beats);
    expect(repeat.players.get("new")!.bestand).toBe(after.bestand);
    expect(repeat.players.get("new")!.readiness).toBe(after.readiness);
  });

  it("changed garden signs allow personal mourning without rewriting the shared memorial", () => {
    const w = advancedWorld();
    w.players.set("new", { ...w.players.get("new")!, x: WRECK_GARDEN.x, y: WRECK_GARDEN.y });
    const after = applyRead(w, "new", WRECK_GARDEN.id);
    const p = after.players.get("new")!;
    expect(p.beats.garden).toBe(true);
    expect(p.beats.gardenPeople).toBe(false);
    expect(p.readiness).toBe(w.players.get("new")!.readiness + 1);
    expect(after.pois).toEqual(w.pois);
    expect(after.signs).toEqual(w.signs);
    expect(applyRead(after, "new", WRECK_GARDEN.id).players.get("new")!.readiness).toBe(p.readiness);
  });
});
