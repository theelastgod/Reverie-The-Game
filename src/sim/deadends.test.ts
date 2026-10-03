// Dead ends (the dead-end audit, 2026-10-03): a journal step that an event the body does not control could leave with no way
// to finish, and the window that must show every line a step sends the body back with. Real content, no mocks.
import { describe, expect, it } from "vitest";
import type { Ctx, Player, WorldState } from "./types";
import { POSITIONS, districtAt } from "./map";
import { C, F } from "./content/ids";
import { SIDE_NPCS } from "./content/side-npcs";
import { SQ, SF } from "./content/side";
import { verbsFor } from "./interact";
import { emptyWorld, spawnGuest } from "./world";
import { MAX_CHOICES } from "../ui/dialogue";

const ME = "me";
const flags = (...keys: string[]): Record<string, number> => Object.fromEntries(keys.map(k => [k, 1]));

function at(w: WorldState, positionId: string, patch: Partial<Player>): WorldState {
  const pos = POSITIONS[positionId];
  const players = new Map(w.players);
  players.set(ME, { ...spawnGuest(ME, w.now), guest: false, serial: 42, name: "#0042", house: "earth", x: pos.x, y: pos.y, district: districtAt(pos.x, pos.y), ...patch });
  return { ...w, players };
}
const ctxOf = (w: WorldState): Ctx => ({ w, p: w.players.get(ME)!, now: w.now });
const ring = (w: WorldState, key: string) => verbsFor(ctxOf(w), "clearing-ring").find(v => v.key === key)?.choice;

describe("the first stance at the ring (IV, the stance step)", () => {
  const fourth = { movement: 4, party: { nara: "with" as const, quill: "with" as const, ord: "with" as const }, choices: { [C.PARTY]: "with" } };

  it("the rite waits for the stance, as the journal's steps do: a Passing before it could close the hole the stance needs", () => {
    const prepared = at(emptyWorld(), "clearing-ring", { ...fourth, flags: flags(F.ANGEL, F.UNDER, F.MORTALITY, F.PREPARE) });
    const open = { ...prepared, clearing: { ...prepared.clearing, open: true, openedAt: prepared.now }, pois: { ...prepared.pois, "clearing-ring": { state: "open", by: ME, at: prepared.now, count: 1 } } };
    expect(ring(open, "E")).toBe("keep");
    expect(ring(open, "Q")).toBe("extract");
    expect(ring(open, "F"), "no Passing before the stance").toBeUndefined();
    const stood = { ...open, players: new Map(open.players).set(ME, { ...open.players.get(ME)!, choices: { ...fourth.choices, [C.CLEARING]: "keep" } }) };
    expect(ring(stood, "F")).toBe("pass");
  });

  it("a prepared body whose hole closed before its stance (a season's roll, another body's extract) prepares the ground again", () => {
    // the hole closed and the ground has set: prepared, no stance, nothing open
    const w = at(emptyWorld(), "clearing-ring", { ...fourth, flags: flags(F.ANGEL, F.UNDER, F.MORTALITY, F.PREPARE) });
    expect(w.clearing.open).toBe(false);
    expect(ring(w, "F"), "the ground can be kept again").toBe("prepare");
    // the ground still setting: the ring says how long, as it does before the first preparing
    const setting = { ...w, now: 100, clearing: { ...w.clearing, openedAt: 90 } };
    expect(ring(setting, "F")).toBe("look");
    // once the stance is taken, preparing is done for good: the ring is the rest of life, and the rite is next
    const stood = { ...w, players: new Map(w.players).set(ME, { ...w.players.get(ME)!, choices: { ...fourth.choices, [C.CLEARING]: "extract" } }) };
    expect(ring(stood, "F")).toBe("pass");
  });
});

describe("the hubs show every line the journal sends a body back with", () => {
  const live = (npc: string, p: Partial<Player>) => {
    const w = at(emptyWorld(), "clearing-ring", p);
    const ctx = ctxOf(w);
    return (SIDE_NPCS[npc].nodes.hub.choices ?? []).filter(c => !c.when || c.when(ctx)).map(c => c.id);
  };

  it("Dov Marrow: the vault's report is among the first four however many hours he still offers", () => {
    const ids = live("keeper", { movement: 3, flags: flags(F.ANGEL, F.UNDER, F.FORGE), quests: { [SQ.NOTICE]: 0, [SQ.CENSUS]: 0, [SQ.VAULT]: 1 } });
    expect(ids.length, "more lines than the four number keys of old").toBeGreaterThan(4);
    expect(ids.slice(0, 4)).toEqual(expect.arrayContaining(["notice", "census", "vault-done"]));
    expect(ids.length).toBeLessThanOrEqual(MAX_CHOICES);
  });

  it("Halla Voss: the front's and the season's reports are among the first four", () => {
    const ids = live("omen", { movement: 4, flags: flags(F.ANGEL, F.UNDER, F.BELL), choices: { [C.GLASS]: "dark" }, quests: { [SQ.HOURS]: 2, [SQ.FRONT]: 1, [SQ.SEASON]: 1 } });
    expect(ids.slice(0, 4)).toEqual(expect.arrayContaining(["confront", "front", "season"]));
    expect(ids.length).toBeLessThanOrEqual(MAX_CHOICES);
  });

  it("no hub offers more lines than the window has number keys, whatever a body has offered and started", () => {
    const everything = { movement: 4, flags: { ...flags(F.ANGEL, F.UNDER, F.FORGE, F.BELL), [SF.KEEPER_VISITS]: 5 }, choices: { [C.GLASS]: "dark" } };
    for (const npc of Object.keys(SIDE_NPCS)) {
      const hub = SIDE_NPCS[npc].nodes.hub;
      if (!hub) continue;
      expect((hub.choices ?? []).length, `${npc}'s hub, every line at once`).toBeLessThanOrEqual(MAX_CHOICES);
      expect(live(npc, everything).length).toBeLessThanOrEqual(MAX_CHOICES);
    }
  });
});
