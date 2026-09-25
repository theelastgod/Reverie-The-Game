import { describe, expect, it } from "vitest";
import { BURIAL_PLOT, NAVE_NPCS } from "./campaign";
import { MEMORIAL, MEMORIAL_BURIAL, MEMORIAL_NEED } from "./memorial";
import { nextObjective } from "./journal";
import { applyBury, applyTalk, applyUse, emptyWorld, snapshot, spawnGuest, tickClerks, type WorldState } from "./world";

function move(w: WorldState, id: string, target: { x: number; y: number }) {
  w.players.set(id, { ...w.players.get(id)!, x: target.x, y: target.y });
}
function meetNara(w: WorldState, id: string) {
  move(w, id, NAVE_NPCS.find(n => n.id === "nara")!);
  return applyTalk(w, id, "nara");
}

describe("a personal memorial choice in the shared city", () => {
  it.each(["extract", "keep"] as const)("carries %s through Nara's burial without creating currency", choice => {
    let w = emptyWorld();
    w.players.set("a", { ...spawnGuest("a"), openingCombat: true });
    w = meetNara(w, "a");
    expect(nextObjective(w.players.get("a")!).id).toBe("memorial-choice");
    const before = w.players.get("a")!;
    move(w, "a", MEMORIAL);
    w = applyUse(w, "a", MEMORIAL.id, choice);
    expect(nextObjective(w.players.get("a")!).id).toBe("first-burial");
    for (const field of ["bestand", "banked", "aura", "winke", "readiness"] as const) expect(w.players.get("a")![field]).toBe(before[field]);
    expect(w.gestell).toBe(emptyWorld().gestell);
    expect(w.nodes).toEqual(emptyWorld().nodes);
    move(w, "a", BURIAL_PLOT);
    w = applyBury(w, "a");
    expect(w.players.get("a")!.beats.burial).toBe(true);
    expect(w.players.get("a")!.heard).toBe(MEMORIAL_BURIAL[choice]);
    expect(w.players.get("a")!.readiness).toBe(before.readiness + 1);
    expect(applyBury(w, "a").players.get("a")!.readiness).toBe(before.readiness + 1);
  });

  it("supports both arrivals after shared resources are gone, including during a freeze", () => {
    let w = emptyWorld(); w.frozen = true; w.naraGone = true;
    w.nodes = w.nodes.map(n => ({ ...n, depleted: true }));
    w.rites = w.rites.map(r => ({ ...r, done: true }));
    for (const id of ["a", "b"]) w.players.set(id, { ...spawnGuest(id), guest: id === "a" });
    for (const [id, choice] of [["a", "extract"], ["b", "keep"]] as const) {
      w = meetNara(w, id); move(w, id, MEMORIAL);
      w = applyUse(w, id, MEMORIAL.id, choice);
      move(w, id, BURIAL_PLOT); w = applyBury(w, id);
      expect(w.players.get(id)!.beats.burial).toBe(true);
    }
    expect(w.players.get("a")!.openingChoice).toBe("extract");
    expect(w.players.get("b")!.openingChoice).toBe("keep");
    expect(snapshot(w).nodes.find(n => n.id === MEMORIAL.id)).toMatchObject({ kept: true, depleted: true });
    expect(w.naraGone && w.frozen).toBe(true);
  });

  it("rejects premature, remote, locked and late-story decisions, without bypassing the burial choice", () => {
    let w = emptyWorld(); const original = { ...spawnGuest("a"), ...{ x: MEMORIAL.x, y: MEMORIAL.y } };
    w.players.set("a", original);
    expect(applyUse(w, "a", MEMORIAL.id, "keep")).toBe(w);
    move(w, "a", BURIAL_PLOT);
    const denied = applyBury(w, "a").players.get("a")!;
    expect(denied.beats.burial).toBe(false);
    expect(denied.heard).toBe(MEMORIAL_NEED);
    w = meetNara(w, "a");
    expect(applyUse(w, "a", MEMORIAL.id, "keep")).toBe(w);
    for (const extra of [{ locked: true }, { hp: 0 }, { beats: { ...original.beats, nara: true, under: true } }]) {
      w.players.set("a", { ...original, beats: { ...original.beats, nara: true }, ...extra });
      expect(applyUse(w, "a", MEMORIAL.id, "extract")).toBe(w);
    }
  });

  it("cannot reverse a recorded choice or farm numeric rewards by replaying either packet", () => {
    let w = emptyWorld(); w.players.set("a", spawnGuest("a"));
    w = meetNara(w, "a"); move(w, "a", MEMORIAL);
    w = applyUse(w, "a", MEMORIAL.id, "keep");
    const after = structuredClone(w);
    for (let i = 0; i < 100; i++) {
      w = applyUse(w, "a", MEMORIAL.id, "extract");
      w = applyUse(w, "a", MEMORIAL.id, "keep");
    }
    expect(w).toEqual(after);
  });

  it("preserves the personal decision through death and saved-world restoration", () => {
    let w = emptyWorld(); w.players.set("a", spawnGuest("a"));
    w = meetNara(w, "a"); move(w, "a", MEMORIAL);
    w = applyUse(w, "a", MEMORIAL.id, "extract");
    w.players.set("a", { ...w.players.get("a")!, hp: 1 });
    w.clerks = [{ ...MEMORIAL, name: "Clerk", hp: 44, telegraph: .01, targetId: "a" }];
    w = structuredClone(tickClerks(w, .05));
    expect(w.players.get("a")!.openingChoice).toBe("extract");
    expect(w.memorialKept).toBe(false);
  });

  it("does not send a previously completed burial back through the new gate", () => {
    const w = emptyWorld(); const p = spawnGuest("old");
    w.players.set("old", { ...p, beats: { ...p.beats, nara: true, burial: true } });
    expect(nextObjective(w.players.get("old")!).id).toBe("safety-weather");
    move(w, "old", MEMORIAL);
    expect(applyUse(w, "old", MEMORIAL.id, "keep")).toBe(w);
  });
});
