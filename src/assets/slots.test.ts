import { describe, expect, it } from "vitest";
import { NODE_LIST, POI_LIST, POSITIONS } from "../sim/map";
import {
  CREDITS_PLATE, PROP_KINDS, PROP_SIZE, ambientFor, badgeFor, loopFor, passingLoopFor, plateFor, portraitFor, propTarget, sealFor, spriteFor,
  staticPropSlots,
} from "./slots";

describe("generated-asset slots", () => {
  it("names a portrait for the five secondary people and nothing for the party or strangers", () => {
    for (const id of ["officer", "omen", "keeper", "sexton", "desk"]) expect(portraitFor(id)).toBe(`portraits/${id}.jpg`);
    for (const id of ["nara", "quill", "ord", "ione", "vesper", "", "officer2"]) expect(portraitFor(id)).toBeNull();
  });

  it("names a sprite for wardens, enforcers and the hour clerks only", () => {
    expect(spriteFor({ kind: "warden", id: "warden-1" })).toBe("sprites/warden.png");
    expect(spriteFor({ kind: "enforcer", id: "cable-enforcer" })).toBe("sprites/enforcer.png");
    expect(spriteFor({ kind: "clerk", id: "hour-clerk-2" })).toBe("sprites/hour-clerk.png");
    expect(spriteFor({ kind: "clerk", id: "desk-three" })).toBeNull();
    expect(spriteFor({ kind: "courier", id: "annex-runner" })).toBeNull();
    expect(spriteFor({ kind: "dummy", id: "practice-dummy" })).toBeNull();
  });

  it("names seals by House and badges by messenger, never for the unsealed", () => {
    expect(sealFor("sky")).toBe("seals/sky.png");
    expect(sealFor("")).toBeNull();
    expect(sealFor("void")).toBeNull();
    expect(badgeFor("ruin")).toBe("badges/ruin.png");
    expect(badgeFor("")).toBeNull();
  });

  it("names plates by district, the hot street only while hot, and the credits", () => {
    expect(plateFor("kerb")).toBe("plate-kerb.jpg");
    expect(plateFor("nave")).toBe("plate-nave.jpg");
    expect(plateFor("wet")).toBeNull();
    expect(plateFor("wet", true)).toBe("plate-hot-street.jpg");
    expect(plateFor("care")).toBeNull();
    expect(CREDITS_PLATE).toBe("plate-credits.jpg");
  });

  it("names loops under video/, the Passing overlays by outcome and the ambients by district", () => {
    expect(loopFor("title-mark")).toBe("video/title-mark.mp4");
    expect(passingLoopFor("appearance")).toBe("video/passing-appearance.mp4");
    expect(passingLoopFor("failed")).toBe("video/passing-failed.mp4");
    expect(passingLoopFor("")).toBeNull();
    expect(ambientFor("organs")).toBe("video/ambient-strait.mp4");
    expect(ambientFor("nave")).toBe("video/ambient-hall.mp4");
    expect(ambientFor("wet")).toBe("video/ambient-wet.mp4");
    expect(ambientFor("care")).toBeNull();
  });

  it("gives every prop kind a target and a size", () => {
    for (const k of PROP_KINDS) {
      expect(propTarget(k)).toBe(`props/${k}.png`);
      expect(PROP_SIZE[k].w).toBeGreaterThan(0);
      expect(PROP_SIZE[k].h).toBeGreaterThan(0);
    }
  });

  it("stands the static props on level positions: nodes, shrines, bells, stalls, desks, the foundry, the board, the hot street", () => {
    const slots = staticPropSlots();
    const of = (kind: string) => slots.filter(s => s.kind === kind);
    expect(of("yield-node").length).toBe(NODE_LIST.length);
    expect(of("crt-altar").length).toBe(NODE_LIST.length + POI_LIST.filter(p => p.id.startsWith("crt-altar")).length);
    expect(of("oval-light").map(s => s.id)).toEqual(POI_LIST.filter(p => p.kind === "shrine").map(p => `${p.id}:light`));
    expect(of("shrine-bell").map(s => s.id).sort()).toEqual(["hour-bell", "mute-bell", "shrine-1", "shrine-2", "shrine-3"]);
    expect(of("market-stall").map(s => s.id).sort()).toEqual(["forge-tray", "stall-1", "stall-2", "stall-3", "stall-4"]);
    expect(of("office-desk").map(s => s.id).sort()).toEqual(["claims-desk", "cold-desk", "funeral-desk", "safety-desk"]);
    expect(of("furnace").map(s => s.id)).toEqual(["organ-foundry"]);
    expect(of("listing-board").map(s => s.id)).toEqual(["listing-board"]);
    expect(of("armored-van").length).toBe(2);
    for (const s of slots) {
      const base = POSITIONS[s.id.replace(/:(base|light)$/, "")];
      if (base) expect(Math.hypot(s.x - base.x, s.y - base.y), `${s.id} stands at its position`).toBeLessThan(24);
    }
    // nothing placed live is listed here
    expect(of("wreckage")).toEqual([]);
    expect(of("grave-slab")).toEqual([]);
    expect(of("clearing-seed")).toEqual([]);
    // ids are unique
    expect(new Set(slots.map(s => s.id)).size).toBe(slots.length);
  });
});
