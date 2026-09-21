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
  applyRead,
  applyStrike,
  applyTalk,
  applyUse,
  damageFor,
  emptyWorld,
  guestCanClaim,
  spawnGuest,
  tickWorld,
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

describe("Gestell clerks and weather", () => {
  it("clerks are job titles, not demons", () => {
    const w = emptyWorld();
    expect(w.clerks.map((c) => c.name)).toEqual(["Desk Three", "Annex Runner"]);
    expect(w.clerks.every((c) => !/demon|devil|fiend/i.test(c.name))).toBe(true);
  });

  it("clerk telegraphs then strikes; strike drops named wreckage", () => {
    const w = emptyWorld();
    const clerk = w.clerks[0];
    w.players.set("a", { ...spawnGuest("a"), x: clerk.x, y: clerk.y });
    const wound = tickWorld(w, 0.05);
    expect(wound.clerks[0].telegraph).toBeGreaterThan(0);
    expect(wound.players.get("a")?.hp).toBe(100);
    let cur = wound;
    for (let i = 0; i < 20; i++) cur = tickWorld(cur, 0.05);
    expect(cur.players.get("a")!.hp).toBeLessThan(100);

    const fight = emptyWorld();
    fight.players.set("a", { ...spawnGuest("a"), x: clerk.x, y: clerk.y });
    const after = applyStrike(fight, "a");
    expect(after.clerks.find((c) => c.id === clerk.id)?.hp).toBeLessThan(clerk.hp);
    const dead = { ...fight, clerks: fight.clerks.map((c) => ({ ...c, hp: 10 })) };
    dead.players.set("a", { ...spawnGuest("a"), x: clerk.x, y: clerk.y });
    const kill = applyStrike(dead, "a");
    expect(kill.clerks.find((c) => c.id === clerk.id)).toBeUndefined();
    expect(kill.wreckage[0]?.fromName).toBe("Desk Three");
  });

  it("damageFor ignores token-shaped extras", () => {
    const a = spawnGuest("a");
    const rich = { ...a, bestand: 9999 } as typeof a & { reverie?: number };
    rich.reverie = 1_000_000;
    expect(damageFor(rich)).toBe(damageFor(a));
    expect(guestCanClaim(rich)).toBe(false);
  });

  it("naming the weather from Safety, Ord, and Nara strikes the plaque POI", () => {
    const nara = NAVE_NPCS.find((n) => n.id === "nara")!;
    const ord = NAVE_NPCS.find((n) => n.id === "ord")!;
    const sign = NAVE_SIGNS[0];
    let w = emptyWorld();
    w.players.set("a", { ...spawnGuest("a"), x: nara.x, y: nara.y });
    w = applyTalk(w, "a", "nara");
    w.players.set("a", { ...w.players.get("a")!, x: ord.x, y: ord.y });
    w = applyTalk(w, "a", "ord");
    expect(w.weatherNamed).toBe(false);
    w.players.set("a", { ...w.players.get("a")!, x: sign.x, y: sign.y });
    w = applyRead(w, "a", "safety-plaque");
    expect(w.players.get("a")?.namedWeather).toBe(true);
    expect(w.weatherNamed).toBe(true);
    expect(w.signs[0]?.title).toBe("Office of Safety — struck");
    expect(w.pois[0]?.kind).toBe("named-weather");
    expect(w.pois[0]?.name).toBe("Named weather");
    expect(w.players.get("a")?.heard).toContain("named the weather");
    expect(guestCanClaim(w.players.get("a")!)).toBe(false);
  });
});

