// The keys a player is told to press, and the verb the key really reaches (the key audit, 2026-10-03): a line that names a
// key must name one the place answers to in the state the line is heard in, and no verb a body needs may sit hidden behind
// another live verb on the same key (interact.ts poiVerbs offers the first live verb per key; a place's side verbs come first).
import { describe, expect, it } from "vitest";
import type { Ctx, Player, WorldState, Wreckage } from "./types";
import { POSITIONS, districtAt } from "./map";
import { C, F } from "./content/ids";
import { NPCS } from "./content/npcs";
import { LINES, POI_CONFIGS } from "./content";
import { SIDE_BY_ID, SQ, SF } from "./content/side";
import { verbsFor } from "./interact";
import { applyAction } from "./actions";
import { promptFor } from "./snapshot";
import { emptyWorld, spawnGuest } from "./world";

const ME = "me";

function angelAt(w: WorldState, id: string, positionId: string, patch: Partial<Player> = {}, dx = 0): WorldState {
  const pos = POSITIONS[positionId];
  const players = new Map(w.players);
  const serial = 40 + players.size;
  players.set(id, { ...spawnGuest(id, w.now), guest: false, serial, name: `#00${serial}`, house: "earth", x: pos.x + dx, y: pos.y, district: districtAt(pos.x + dx, pos.y), ...patch });
  return { ...w, players };
}
const ctxOf = (w: WorldState, id = ME): Ctx => ({ w, p: w.players.get(id)!, now: w.now });
const keyOf = (w: WorldState, place: string, key: string, id = ME): string | undefined => verbsFor(ctxOf(w, id), place).find(v => v.key === key)?.choice;
const flags = (...keys: string[]): Record<string, number> => Object.fromEntries(keys.map(k => [k, 1]));

describe("the keys a player is told to press", () => {
  it("Nara at the brink sends you to Ord's gate first while the party is undecided: the ring takes the ground only after it (IV.3)", () => {
    const w = angelAt(emptyWorld(), ME, "clearing-ring", { movement: 4, flags: flags(F.ANGEL, F.UNDER, F.MORTALITY), party: { nara: "with", quill: "with", ord: "with" } });
    const brink = NPCS.nara.nodes.brink.text as (c: Ctx) => string;
    const before = brink(ctxOf(w));
    expect(before).toContain("Ord has the ledger open at the Care gate. Tell him who stands in it first. Press F at the ring and keep the ground;");
    expect(keyOf(w, "clearing-ring", "F"), "F at the ring only looks until the gate").toBe("look");
    const decided = { ...ctxOf(w), p: { ...ctxOf(w).p, choices: { [C.PARTY]: "with" } } };
    expect(brink(decided)).not.toContain("Ord has the ledger open");
    expect(brink(decided)).toContain("I will stand in it either way. Press F at the ring and keep the ground;");
  });

  it("an offered ruin duel is answered with F, as its notice says, though the wreckage it is fought over is nearer", () => {
    const at = POSITIONS["stall-3"];
    let w = angelAt(emptyWorld(), "a", "stall-3", { flagged: true }, 50);
    w = angelAt(w, ME, "stall-3", { flagged: true }, 5);
    expect(districtAt(at.x, at.y), "a street where a flag holds").toBe("wet");
    const wreck: Wreckage = { id: "wreck-1", x: at.x, y: at.y, district: "wet", fromId: "x", fromName: "#0009", fromSerial: 9, killerId: "", at: 0, until: w.now + 600, buried: false, looted: false, bestand: 3, items: [] };
    w = { ...w, wreckage: [wreck] };
    w = applyAction(w, "a", { t: "interact", targetId: ME, choice: "duel" });
    expect(w.players.get("a")!.duel).toMatchObject({ with: ME, accepted: false });
    expect(w.players.get(ME)!.notices.some(n => n.text.includes("F answers it"))).toBe(true);
    const prompt = promptFor(ctxOf(w));
    expect(prompt).toMatchObject({ targetId: "a", targetKind: "player" });
    expect(prompt!.verbs.find(v => v.key === "F")).toMatchObject({ label: "Answer the duel", choice: "duel" });
    // answered, the offer no longer leads: the prompt is the nearest thing again, with no duel to answer
    w = applyAction(w, ME, { t: "interact", targetId: "a", choice: "duel" });
    expect(w.players.get(ME)!.duel?.accepted).toBe(true);
    expect(promptFor(ctxOf(w))!.verbs.some(v => v.choice === "duel")).toBe(false);
  });

  it("the street and the strike tell a flagged body about the other one, never to press V (which would lower its own flag)", () => {
    let w = angelAt(emptyWorld(), ME, "hot-street", { flagged: true });
    const read = POI_CONFIGS["hot-street"].verbs.find(v => v.choice === "read")!;
    const say = (c: Ctx) => (typeof read.say === "function" ? read.say(c) : read.say ?? "");
    expect(say(ctxOf(w))).toContain("You are flagged. Press V to lower it.");
    expect(say(ctxOf(w))).not.toContain("Press V to flag.");
    expect(say({ ...ctxOf(w), p: { ...ctxOf(w).p, flagged: false } })).toContain("Press V to flag.");
    // a flagged striker at an unflagged Angel
    w = angelAt(w, "b", "hot-street", { flagged: false, facing: { dx: -1, dy: 0 } }, 30);
    const struck = applyAction(w, ME, { t: "strike" });
    expect(struck.players.get(ME)!.heard).toBe(LINES.PVP_OTHER_UNFLAGGED);
    expect(applyAction(w, "b", { t: "strike" }).players.get("b")!.heard).toBe(LINES.PVP_FLAG_REQUIRED);
  });

  it("the tax hour and Form 9 never share E at the window: the hour waits for a Form 9 at the window, and filing waits for the hour", () => {
    expect(SIDE_BY_ID[SQ.TAX].steps, "the tax hour reads, then pays (taxing() in side-pois.ts counts two)").toHaveLength(2);
    const base = { movement: 2, house: "earth" as const, bestand: 20, flags: flags(F.ANGEL, F.UNDER, F.HALL, F.TITHE), choices: { [C.FREEZE]: "signed" } };
    // Form 9 at the window: the tax hour does not start, and E files it
    const filing = angelAt(emptyWorld(), ME, "tax-window", { ...base, quests: { [SQ.FORM9]: 1 } });
    expect(SIDE_BY_ID[SQ.TAX].available(ctxOf(filing))).toBe(false);
    expect(keyOf(filing, "tax-window", "E")).toBe("side:form9:file");
    expect(keyOf(filing, "tax-window", "Q")).toBe("side:form9:refuse");
    // the tax hour under way when Form 9 comes to the window: E is the hour's, refusing stays on Q, filing waits
    const taxing = angelAt(emptyWorld(), ME, "tax-window", { ...base, quests: { [SQ.TAX]: 0, [SQ.FORM9]: 1 } });
    expect(keyOf(taxing, "tax-window", "E")).toBe("side:tax:read");
    expect(keyOf(taxing, "tax-window", "Q")).toBe("side:form9:refuse");
    const paying = angelAt(emptyWorld(), ME, "tax-window", { ...base, quests: { [SQ.TAX]: 1, [SQ.FORM9]: 1 }, flags: { ...base.flags, [SF.TAX_READ]: 1 } });
    expect(keyOf(paying, "tax-window", "E")).toBe("side:tax:pay");
    const done = angelAt(emptyWorld(), ME, "tax-window", { ...base, quests: { [SQ.TAX]: 2, [SQ.FORM9]: 1 } });
    expect(keyOf(done, "tax-window", "E"), "the hour done, Form 9 files").toBe("side:form9:file");
    // with no Form 9 at the window the hour starts as before
    expect(SIDE_BY_ID[SQ.TAX].available(ctxOf(angelAt(emptyWorld(), ME, "tax-window", { ...base, choices: {} })))).toBe(true);
  });

  it("the garden's free handful is never hidden by twelve's paid burial", () => {
    const w = angelAt(emptyWorld(), ME, "wreckage-garden", { movement: 3, bestand: 3, flags: flags(F.ANGEL, F.UNDER, F.GARDEN), quests: { [SQ.TWELVE]: 1, [SQ.SEED]: 0 } });
    expect(keyOf(w, "wreckage-garden", "E")).toBe("side:seed:take");
    const taken = angelAt(emptyWorld(), ME, "wreckage-garden", { movement: 3, bestand: 3, flags: flags(F.ANGEL, F.UNDER, F.GARDEN, SF.SEED_EARTH), quests: { [SQ.TWELVE]: 1, [SQ.SEED]: 1 } });
    expect(keyOf(taken, "wreckage-garden", "E"), "then the burial").toBe("side:twelve:bury");
  });

  it("the warm tray's hour is on F, so the tray's Q stays the spine's spot for a copy in hand", () => {
    const print = { id: "copy:wink", kind: "exhibition" as const, name: "Printed Wink", qty: 1, value: 1 };
    const w = angelAt(emptyWorld(), ME, "forge-tray", { movement: 3, bestand: 0, items: [print], fakeWinke: 1, flags: flags(F.ANGEL, F.UNDER, F.TALKED_QUILL, F.BOARD, F.FORGE), choices: { [C.FORGE]: "spot" }, quests: { [SQ.TRAY]: 0 } });
    expect(keyOf(w, "forge-tray", "F")).toBe("side:tray:bank");
    expect(keyOf(w, "forge-tray", "Q")).toBe("spot");
    expect(SIDE_BY_ID[SQ.TRAY].steps.map(s => (typeof s.detail === "string" ? s.detail : "")).every(d => /Press F\b/.test(d))).toBe(true);
  });

  it("the care shrine's Q faces the history first while the spine points at it; the standing hour's entry follows", () => {
    const pending = (extra: Record<string, number>) => {
      const w = angelAt(emptyWorld(), ME, "care-shrine", { movement: 2, flags: flags(F.ANGEL, F.UNDER, F.HALL, F.CARE, SF.STANDING_FUNERAL, ...Object.keys(extra)), quests: { [SQ.STANDING]: 1 } });
      const serial = w.players.get(ME)!.serial!;
      return { ...w, history: [{ id: `history:${serial}`, serial, x: 0, y: 0, district: "care" as const, line: "A prior hour." }] };
    };
    expect(keyOf(pending({}), "care-shrine", "Q")).toBe("history");
    expect(keyOf(pending({ [F.HISTORY]: 1 }), "care-shrine", "Q")).toBe("side:standing:enter");
    // a body with no mark in the Care has no history to face: the hour's entry is on Q at once
    const unmarked = angelAt(emptyWorld(), ME, "care-shrine", { movement: 2, flags: flags(F.ANGEL, F.UNDER, F.HALL, F.CARE, SF.STANDING_FUNERAL), quests: { [SQ.STANDING]: 1 } });
    expect(keyOf(unmarked, "care-shrine", "Q")).toBe("side:standing:enter");
  });
});
