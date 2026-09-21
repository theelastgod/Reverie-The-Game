import { describe, expect, it } from "vitest";
import {
  GUEST_LOCK,
  GOING_UNDER,
  movementReady,
  NAVE_NPCS,
  NAVE_SIGNS,
  NPC_LINES,
  displayName,
} from "./campaign";
import {
  applyBury,
  applyGoingUnder,
  applyTalk,
  applyUse,
  emptyWorld,
  guestCanClaim,
  spawnGuest,
} from "./world";

function placeNear(id: string, x: number, y: number, extra: Partial<ReturnType<typeof spawnGuest>> = {}) {
  const w = emptyWorld();
  w.players.set(id, { ...spawnGuest(id), x, y, ...extra });
  return w;
}

describe("Movement I beats", () => {
  it("names Nara Vale, Quill, and Ord — not ids", () => {
    expect(displayName("nara")).toBe("Nara Vale");
    expect(displayName("quill")).toBe("Quill");
    expect(displayName("ord")).toBe("Ord");
    expect(NAVE_NPCS.every((n) => !n.name.includes("_"))).toBe(true);
    expect(NPC_LINES.nara.first).toContain("body in the ground");
    expect(NPC_LINES.quill.first).toContain("Copies travel");
    expect(NPC_LINES.ord.first).toContain("the process");
  });

  it("wires a Safety plaque as a second visible sign", () => {
    expect(NAVE_SIGNS[0]?.title).toBe("Office of Safety");
    expect(NAVE_SIGNS[0]?.text).toContain("stable");
  });

  it("talk is proximity-gated and records the beat", () => {
    const nara = NAVE_NPCS.find((n) => n.id === "nara")!;
    const far = placeNear("a", 80, 80);
    expect(applyTalk(far, "a", "nara").players.get("a")?.beats.nara).toBe(false);
    const near = placeNear("a", nara.x, nara.y);
    const after = applyTalk(near, "a", "nara");
    expect(after.players.get("a")?.beats.nara).toBe(true);
    expect(after.players.get("a")?.heard).toBe(NPC_LINES.nara.first);
    expect(after.players.get("a")?.heard).not.toMatch(/nara_|npc-/);
  });

  it("Nara burial completes the plot and raises readiness", () => {
    const plot = emptyWorld().rites.find((r) => r.kind === "burial")!;
    const w = placeNear("a", plot.x, plot.y);
    const after = applyBury(w, "a");
    expect(after.rites.find((r) => r.kind === "burial")?.done).toBe(true);
    expect(after.players.get("a")?.beats.burial).toBe(true);
    expect(after.players.get("a")?.beats.nara).toBe(true);
    expect(after.players.get("a")?.readiness).toBe(1);
  });

  it("guest lock copy fires at going-under after the three intros and burial", () => {
    const w = placeNear("a", GOING_UNDER.x, GOING_UNDER.y, {
      beats: { nara: true, quill: true, ord: true, burial: true },
    });
    expect(movementReady(w.players.get("a")!.beats)).toBe(true);
    const locked = applyGoingUnder(w, "a");
    const p = locked.players.get("a")!;
    expect(p.locked).toBe(true);
    expect(p.heard).toBe(GUEST_LOCK);
    expect(guestCanClaim(p)).toBe(false);
  });

  it("going-under does not fire before the beats", () => {
    const w = placeNear("a", GOING_UNDER.x, GOING_UNDER.y);
    const after = applyGoingUnder(w, "a");
    expect(after.players.get("a")?.locked).toBe(false);
  });

  it("locked guests cannot extract sacred nodes", () => {
    const node = emptyWorld().nodes[0];
    const w = placeNear("a", node.x, node.y, { locked: true });
    const after = applyUse(w, "a", node.id, "extract");
    expect(after.players.get("a")?.bestand).toBe(0);
    expect(guestCanClaim(after.players.get("a")!)).toBe(false);
  });

  it("angel stub may go under; still no claim", () => {
    const w = placeNear("a", GOING_UNDER.x, GOING_UNDER.y, {
      guest: false,
      aura: 12,
      beats: { nara: true, quill: true, ord: true, burial: true },
    });
    const after = applyGoingUnder(w, "a");
    const p = after.players.get("a")!;
    expect(p.locked).toBe(false);
    expect(p.winke).toBe(1);
    expect(p.heard).toContain("Care");
    expect(guestCanClaim(p)).toBe(false);
  });
});
