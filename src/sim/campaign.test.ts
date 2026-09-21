import { describe, expect, it } from "vitest";
import {
  CARE_DOOR,
  CARE_SPECTATOR,
  GUEST_LOCK,
  GOING_UNDER,
  FREEZE_COPY,
  FREEZE_EXTRACT,
  FREEZE_NEED_HALL,
  FREEZE_SPECTATOR,
  HALL_PLAQUE,
  HOUSE_HALL,
  PASSING_READY,
  SAFETY_ANNEX,
  MOCK_SIG,
  TEST_SERIAL,
  WINK_CARE,
  WINK_FREEZE,
  WINK_HALL,
  gestellTax,
  hallCopy,
  auraSeed,
  formatSerial,
  movementReady,
  NAVE_NPCS,
  NAVE_SIGNS,
  NPC_LINES,
  displayName,
  emptyBeats,
  visibleWink,
  winkeVisible,
} from "./campaign";
import {
  applyBury,
  applyCare,
  applyFreeze,
  applyGoingUnder,
  applyLink,
  applyRead,
  snapshot,
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
      beats: { nara: true, quill: true, ord: true, burial: true, under: false, care: false, hall: false, freeze: false },
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
      beats: { nara: true, quill: true, ord: true, burial: true, under: false, care: false, hall: false, freeze: false },
    });
    const after = applyGoingUnder(w, "a");
    const p = after.players.get("a")!;
    expect(p.locked).toBe(false);
    expect(p.winke).toBe(1);
    expect(p.heard).toContain("Care");
    expect(p.beats.under).toBe(true);
    expect(after.careOpen).toBe(true);
    expect(after.pois.find((poi) => poi.id === CARE_DOOR.id)?.kind).toBe("care-open");
    expect(after.pois.find((poi) => poi.id === HOUSE_HALL.id)?.name).toBe("House of Mortals");
    expect(after.signs.find((s) => s.id === HOUSE_HALL.id)?.title).toBe("House of Mortals");
    expect(guestCanClaim(p)).toBe(false);
  });
});

describe("Care door and Wink", () => {
  const ready = {
    guest: false,
    serial: TEST_SERIAL,
    aura: auraSeed(TEST_SERIAL),
    beats: { nara: true, quill: true, ord: true, burial: true, under: false, care: false, hall: false, freeze: false },
  };

  it("linked Angel going-under opens the Care; guest lock does not", () => {
    const guestW = placeNear("g", GOING_UNDER.x, GOING_UNDER.y, {
      beats: { nara: true, quill: true, ord: true, burial: true, under: false, care: false, hall: false, freeze: false },
    });
    const guestAfter = applyGoingUnder(guestW, "g");
    expect(guestAfter.careOpen).toBe(false);
    expect(visibleWink(true, WINK_CARE)).toBe("");

    const angelW = placeNear("a", GOING_UNDER.x, GOING_UNDER.y, ready);
    const open = applyGoingUnder(angelW, "a");
    expect(open.careOpen).toBe(true);
    const atDoor = { ...open };
    atDoor.players.set("a", { ...open.players.get("a")!, x: CARE_DOOR.x, y: CARE_DOOR.y });
    const seen = applyCare(atDoor, "a");
    const p = seen.players.get("a")!;
    expect(p.wink).toBe(WINK_CARE);
    expect(p.inCare).toBe(true);
    expect(p.beats.care).toBe(true);
    expect(visibleWink(p.guest, p.wink)).toBe(WINK_CARE);
    expect(guestCanClaim(p)).toBe(false);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("b")));
  });

  it("guest at an open Care door is a spectator and never hears the Wink", () => {
    const w = placeNear("a", GOING_UNDER.x, GOING_UNDER.y, ready);
    const open = applyGoingUnder(w, "a");
    open.players.set("g", {
      ...spawnGuest("g"),
      x: CARE_DOOR.x,
      y: CARE_DOOR.y,
      locked: true,
      heard: GUEST_LOCK,
    });
    const after = applyCare(open, "g");
    const g = after.players.get("g")!;
    expect(g.wink).toBe("");
    expect(g.inCare).toBe(false);
    expect(g.heard).toBe(CARE_SPECTATOR);
    expect(visibleWink(g.guest, WINK_CARE)).toBe("");
    expect(guestCanClaim(g)).toBe(false);
  });
});

describe("Movement II House hall", () => {
  const ready = {
    guest: false,
    serial: TEST_SERIAL,
    aura: auraSeed(TEST_SERIAL),
    beats: { nara: true, quill: true, ord: true, burial: true, under: false, care: false, hall: false, freeze: false },
  };

  function angelInHall() {
    const w = placeNear("a", GOING_UNDER.x, GOING_UNDER.y, ready);
    const open = applyGoingUnder(w, "a");
    open.players.set("a", { ...open.players.get("a")!, x: CARE_DOOR.x, y: CARE_DOOR.y });
    const care = applyCare(open, "a");
    const p = care.players.get("a")!;
    care.players.set("a", { ...p, x: HOUSE_HALL.x, y: HOUSE_HALL.y });
    return care;
  }

  it("gestell tax is a climate number and never a damage stick", () => {
    expect(gestellTax(12)).toBe(3);
    expect(gestellTax(0)).toBe(0);
    expect(gestellTax(100)).toBe(25);
    expect(gestellTax(-4)).toBe(0);
    const snap = snapshot(emptyWorld());
    expect(snap.tax).toBe(gestellTax(snap.gestell));
    const rich = { ...spawnGuest("a"), bestand: 9999, beats: { ...emptyBeats(), hall: true } };
    expect(damageFor(rich)).toBe(damageFor(spawnGuest("b")));
    expect(damageFor({ ...rich, aura: 99 })).toBe(damageFor(spawnGuest("b")));
    expect(guestCanClaim(rich)).toBe(false);
  });

  it("linked Angel in the Care reads the House hall and hears the tithe", () => {
    const w = angelInHall();
    const after = applyRead(w, "a", HOUSE_HALL.id);
    const p = after.players.get("a")!;
    const tax = gestellTax(after.gestell);
    expect(p.beats.hall).toBe(true);
    expect(p.heard).toBe(hallCopy(tax));
    expect(p.heard).toContain(String(tax));
    expect(p.heard).toContain("House of Mortals");
    expect(p.heard).not.toMatch(/house_hall|HOUSE_HALL/);
    expect(p.wink).toBe(WINK_HALL);
    expect(visibleWink(p.guest, p.wink)).toBe(WINK_HALL);
    expect(HALL_PLAQUE.title).toBe("House of Mortals");
    expect(damageFor(p)).toBe(damageFor(spawnGuest("b")));
    expect(guestCanClaim(p)).toBe(false);
  });

  it("guest cannot read the House hall even when the Care is open", () => {
    const w = angelInHall();
    w.players.set("g", {
      ...spawnGuest("g"),
      x: HOUSE_HALL.x,
      y: HOUSE_HALL.y,
      locked: true,
    });
    const after = applyRead(w, "g", HOUSE_HALL.id);
    const g = after.players.get("g")!;
    expect(g.beats.hall).toBe(false);
    expect(g.wink).toBe("");
    expect(g.heard).not.toBe(hallCopy(gestellTax(w.gestell)));
    expect(guestCanClaim(g)).toBe(false);
  });

  it("hall tax skims extract Bestand and still does not change damage", () => {
    const w = angelInHall();
    const taxed = applyRead(w, "a", HOUSE_HALL.id);
    const node = taxed.nodes[0];
    taxed.players.set("a", { ...taxed.players.get("a")!, x: node.x, y: node.y });
    const tax = gestellTax(taxed.gestell);
    const after = applyUse(taxed, "a", node.id, "extract");
    const p = after.players.get("a")!;
    expect(p.bestand).toBe(40 - tax);
    expect(p.bestand).toBeLessThan(40);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("b")));
    expect(guestCanClaim(p)).toBe(false);
  });
});

describe("Safety Annex freeze", () => {
  function angelAtAnnex(hall = true) {
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), hall, care: true, under: true, nara: true, quill: true, ord: true, burial: true },
      inCare: false,
      x: SAFETY_ANNEX.x,
      y: SAFETY_ANNEX.y,
    });
    return w;
  }

  it("Passing starts ready and is not starved", () => {
    const snap = snapshot(emptyWorld());
    expect(snap.passing.ready).toBe(PASSING_READY);
    expect(snap.passing.starved).toBe(false);
    expect(snap.frozen).toBe(false);
  });

  it("Angel who read the hall may sign; freeze starves the Passing and blocks extract", () => {
    const w = angelAtAnnex(true);
    const after = applyFreeze(w, "a");
    const p = after.players.get("a")!;
    expect(p.beats.freeze).toBe(true);
    expect(p.heard).toBe(FREEZE_COPY);
    expect(p.wink).toBe(WINK_FREEZE);
    expect(after.frozen).toBe(true);
    expect(after.passing.starved).toBe(true);
    expect(after.passing.ready).toBe(0);
    expect(after.pois.find((poi) => poi.id === SAFETY_ANNEX.id)?.kind).toBe("safety-frozen");
    expect(p.heard).not.toMatch(/heidegger|katechon|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("b")));
    expect(guestCanClaim(p)).toBe(false);

    const node = after.nodes[0];
    after.players.set("a", { ...p, x: node.x, y: node.y });
    const blocked = applyUse(after, "a", node.id, "extract");
    expect(blocked.players.get("a")?.bestand).toBe(0);
    expect(blocked.nodes[0].depleted).toBe(false);
    expect(blocked.players.get("a")?.heard).toBe(FREEZE_EXTRACT);
  });

  it("without the hall the Annex refuses the signature", () => {
    const w = angelAtAnnex(false);
    const after = applyFreeze(w, "a");
    expect(after.frozen).toBe(false);
    expect(after.passing.starved).toBe(false);
    expect(after.players.get("a")?.heard).toBe(FREEZE_NEED_HALL);
    expect(after.players.get("a")?.beats.freeze).toBe(false);
  });

  it("guest cannot sign the freeze", () => {
    const w = emptyWorld();
    w.players.set("g", { ...spawnGuest("g"), x: SAFETY_ANNEX.x, y: SAFETY_ANNEX.y, locked: true });
    const after = applyFreeze(w, "g");
    expect(after.frozen).toBe(false);
    expect(after.players.get("g")?.heard).toBe(FREEZE_SPECTATOR);
    expect(after.players.get("g")?.wink).toBe("");
    expect(guestCanClaim(after.players.get("g")!)).toBe(false);
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

describe("Angel link stub", () => {
  it("guest stays #0000 with aura 0 and hidden Winke", () => {
    const g = spawnGuest("g1");
    expect(formatSerial(g.serial)).toBe("#0000");
    expect(g.aura).toBe(0);
    expect(winkeVisible(g.guest)).toBe(false);
    expect(guestCanClaim(g)).toBe(false);
  });

  it("mock #7777 seeds aura, still cannot claim, damage unchanged", () => {
    const w = emptyWorld();
    w.players.set("a", spawnGuest("a"));
    expect(applyLink(w, "a", 1, MOCK_SIG).players.get("a")?.guest).toBe(true);
    expect(applyLink(w, "a", TEST_SERIAL, "wallet").players.get("a")?.guest).toBe(true);
    const linked = applyLink(w, "a", TEST_SERIAL, MOCK_SIG);
    const p = linked.players.get("a")!;
    expect(p.guest).toBe(false);
    expect(p.serial).toBe(7777);
    expect(p.aura).toBe(auraSeed(7777));
    expect(p.aura).toBeGreaterThan(0);
    expect(formatSerial(p.serial)).toBe("#7777");
    expect(winkeVisible(p.guest)).toBe(true);
    expect(guestCanClaim(p)).toBe(false);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("b")));
    expect(p.heard).not.toMatch(/\$REVERIE|APY|yield/i);
  });
});

