import { describe, expect, it } from "vitest";
import {
  applyBury, applyClearing, applyGoingUnder, applyM3, applyOperator,
  applyPassing, applyShrine, damageFor, emptyWorld, spawnGuest,
} from "./world";
import { CLEARING_RING, CONTEST_PAY, GOING_UNDER, M3_DOOR, OPERATOR_DESK, SHRINE, STIPEND, WRECK_GARDEN } from "./campaign";

function angel(id: string) {
  const p = spawnGuest(id);
  return { ...p, guest: false, serial: 7777, aura: 30, x: CLEARING_RING.x, y: CLEARING_RING.y,
    beats: { ...p.beats, garden: true, lastWord: true } };
}

describe("finite Clearing reserve", () => {
  it("closed ground cannot pay, wound aura, alter climate, or score a war", () => {
    let w = emptyWorld(); w.players.set("a", angel("a"));
    for (let i = 0; i < 100; i++) w = applyClearing(w, "a", "extract");
    expect(w.players.get("a")!.bestand).toBe(0);
    expect(w.players.get("a")!.aura).toBe(30);
    expect(w.gestell).toBe(emptyWorld().gestell);
    expect(w.war).toEqual(emptyWorld().war);
    expect(w.clearingReserve).toBe(CONTEST_PAY);
  });
  it("pays from one shared reserve, even across keep/extract cycles and players", () => {
    let w = emptyWorld(); w.players.set("a", angel("a")); w.players.set("b", angel("b"));
    const damage = damageFor(w.players.get("a")!);
    for (let i = 0; i < 20; i++) {
      w = applyClearing(w, "a", "keep");
      w = applyClearing(w, i % 2 ? "a" : "b", "extract");
    }
    expect([...w.players.values()].reduce((total, p) => total + p.bestand, 0)).toBe(CONTEST_PAY);
    expect(w.clearingReserve).toBe(0);
    expect(w.clearingOpen).toBe(false);
    expect(w.gestell).toBeGreaterThan(emptyWorld().gestell);
    expect(damageFor(w.players.get("a")!)).toBe(damage);
    expect(structuredClone(w).clearingReserve).toBe(0);
  });
  it("guests cannot consume the reserve or close a prepared Clearing", () => {
    const w = emptyWorld(); w.clearingOpen = true;
    w.players.set("g", { ...spawnGuest("g"), x: CLEARING_RING.x, y: CLEARING_RING.y });
    const after = applyClearing(w, "g", "extract");
    expect(after.clearingReserve).toBe(CONTEST_PAY);
    expect(after.clearingOpen).toBe(true);
    expect(after.players.get("g")!.bestand).toBe(0);
  });
  it("revisiting an Appearance cannot replenish a spent stipend", () => {
    let w = emptyWorld(); w.players.set("a", angel("a"));
    w = applyPassing(applyClearing(w, "a", "keep"), "a");
    expect(w.players.get("a")!.stipend).toBe(STIPEND);
    w.players.set("a", { ...w.players.get("a")!, x: SHRINE.x, y: SHRINE.y });
    w = applyShrine(w, "a");
    const spent = w.players.get("a")!.stipend;
    expect(spent).toBeLessThan(STIPEND);
    w.players.set("a", { ...w.players.get("a")!, x: CLEARING_RING.x, y: CLEARING_RING.y });
    for (let i = 0; i < 20; i++) w = applyPassing(w, "a");
    expect(w.players.get("a")!.stipend).toBe(spent);
    expect(w.players.get("a")!.historyLog.passings).toBe(1);
  });
});

describe("Readiness route into Movement III", () => {
  it("refusal plus mourning opens the organs without private yield or extra climate", () => {
    let w = emptyWorld(); const p = angel("a");
    w.players.set("a", { ...p, x: GOING_UNDER.x, y: GOING_UNDER.y,
      beats: { ...p.beats, nara: true, quill: true, ord: true, burial: true, hall: true, garden: false } });
    w = applyGoingUnder(w, "a");
    w.players.set("a", { ...w.players.get("a")!, x: OPERATOR_DESK.x, y: OPERATOR_DESK.y });
    w = applyOperator(applyOperator(w, "a", "hear"), "a", "refuse");
    const climate = w.gestell;
    w.players.set("a", { ...w.players.get("a")!, x: M3_DOOR.x, y: M3_DOOR.y });
    w = applyM3(w, "a");
    expect(w.m3Open).toBe(false);
    w.players.set("a", { ...w.players.get("a")!, x: WRECK_GARDEN.x, y: WRECK_GARDEN.y });
    w = applyBury(w, "a");
    expect(w.players.get("a")!.beats.garden).toBe(true);
    w.players.set("a", { ...w.players.get("a")!, x: M3_DOOR.x, y: M3_DOOR.y });
    w = applyM3(w, "a");
    expect(w.m3Open).toBe(true);
    expect(w.players.get("a")!.inM3).toBe(true);
    expect(w.players.get("a")!.current).toBe("readiness");
    expect(w.players.get("a")!.bestand).toBe(0);
    expect(w.players.get("a")!.beats.cold).toBe(false);
    expect(w.gestell).toBe(climate);
    expect(w.pois.find(poi => poi.id === M3_DOOR.id)?.kind).toBe("m3-open");
    expect(w.signs.some(sign => sign.id === "organ-strait")).toBe(true);
  });
});
