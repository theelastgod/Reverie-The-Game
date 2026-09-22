import { describe, expect, it } from "vitest";
import {
  CARE_DOOR,
  CARE_SPECTATOR,
  CLEARING_PRICE,
  CLEARING_STALL,
  GUEST_LOCK,
  GOING_UNDER,
  FREEZE_COPY,
  FREEZE_EXTRACT,
  FREEZE_NEED_HALL,
  FREEZE_SPECTATOR,
  HALL_PLAQUE,
  HISTORY_7777,
  HOUSE_HALL,
  PASSING_READY,
  SAFETY_ANNEX,
  MOCK_SIG,
  TEST_SERIAL,
  WINK_CARE,
  WINK_FREEZE,
  WINK_HISTORY,
  WINK_HALL,
  WINK_MARKET,
  MARKET_BUY,
  MARKET_LISTING,
  MARKET_NEED_HALL,
  MARKET_SPECTATOR,
  M3_DOOR,
  OPERATOR_DESK,
  OPERATOR_NEED_HALL,
  OPERATOR_OFFER,
  OPERATOR_REFUSE,
  OPERATOR_SPECTATOR,
  OPERATOR_TAKE,
  PRIVATE_YIELD,
  WINK_OPERATOR,
  WINK_GARDEN,
  WINK_ORGANS,
  WRECK_GARDEN,
  NARA_SILENCE,
  NARA_AFTER_GARDEN,
  GARDEN_BURY,
  M3_ENTER,
  M3_SPECTATOR,
  ORD_MAP,
  ORGAN_STRAIT,
  ORGAN_FOUNDRY,
  ORGAN_CABLE,
  FAILED_PASSING,
  WATCH_FAILED,
  WINK_FAILED,
  FORGE_TRAY,
  FORGE_PAY,
  FORGE_LESSON,
  FORGE_NEED_MARKET,
  FORGE_SELL,
  FORGE_SPOT,
  FORGE_SPECTATOR,
  WINK_FORGE,
  FAILED_SPECTATOR,
  CLEARING_RING,
  CLEARING_PREPARE,
  CLEARING_NEED_MORTAL,
  CLEARING_NEED_GARDEN,
  CLEARING_SPECTATOR,
  CLEARING_CONTEST,
  CONTEST_PAY,
  GESTELL_HOT,
  IONE,
  IONE_SPECTATOR,
  LAST_WORD,
  LAST_WORD_GONE,
  WINK_TURN,
  PASSING_APPEAR,
  PASSING_ABSENCE,
  PASSING_HIJACK,
  PASSING_FAIL,
  PASSING_NEED,
  dwellNeed,
  passingResult,
  ruinSight,
  visibleFailed,
  houseFor,
  houseName,
  earthTax,
  divinitiesKeep,
  messengerFor,
  messengerName,
  ANNOUNCE_COPY,
  ANNOUNCE_NEED,
  ANNOUNCE_SPECTATOR,
  WINK_ANNOUNCE,
  WAR_WIN,
  WAR_TITHE,
  WAR_OMEN_KEEP,
  WAR_OMEN_EXTRACT,
  WINK_WAR,
  warTax,
  emptyWar,
  WET_GRID,
  FLAG_COPY,
  FLAG_SPECTATOR,
  SPOILS_COPY,
  GUEST_GRIEF,
  CAMP_COPY,
  CLAIMS_DESK,
  CLAIMS_ARMED,
  CLAIM_HOLD,
  DESK_FILE,
  DESK_WAIT,
  DESK_DISARMED,
  DESK_EMPTY,
  DESK_SPECTATOR,
  DUEL_COPY,
  SPECTATE_COPY,
  SPECTATE_CAP,
  WINK_DUEL,
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
  visibleHistory,
  visibleWink,
  winkeVisible,
  FUNERAL_COST,
  FUNERAL_COPY,
  FUNERAL_NEED,
  SHRINE_COST,
  SHRINE_COPY,
  SHRINE_NEED,
  SHRINE_SPECTATOR,
  WINK_SINK,
  SHRINE,
} from "./campaign";
import {
  applyBury,
  applyCare,
  applyFreeze,
  applyGoingUnder,
  applyLink,
  applyM3,
  applyWatch,
  applyForge,
  applyFlag,
  applyDesk,
  applyShrine,
  applyLastWord,
  applyClearing,
  applyPassing,
  applyAnnounce,
  applyMarket,
  applyOperator,
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
      beats: { nara: true, quill: true, ord: true, burial: true, under: false, care: false, hall: false, freeze: false, market: false },
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
      beats: { nara: true, quill: true, ord: true, burial: true, under: false, care: false, hall: false, freeze: false, market: false },
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
    beats: { nara: true, quill: true, ord: true, burial: true, under: false, care: false, hall: false, freeze: false, market: false },
  };

  it("linked Angel going-under opens the Care; guest lock does not", () => {
    const guestW = placeNear("g", GOING_UNDER.x, GOING_UNDER.y, {
      beats: { nara: true, quill: true, ord: true, burial: true, under: false, care: false, hall: false, freeze: false, market: false },
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
    beats: { nara: true, quill: true, ord: true, burial: true, under: false, care: false, hall: false, freeze: false, market: false },
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

describe("Iridescent Clearing listing", () => {
  function angelAtStall(hall = true, extra: Partial<ReturnType<typeof spawnGuest>> = {}) {
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), hall, nara: true, quill: true, ord: true, burial: true },
      x: CLEARING_STALL.x,
      y: CLEARING_STALL.y,
      ...extra,
    });
    return w;
  }

  it("hall-read Angel sees the listing Wink; buying a copy does not open the Clearing", () => {
    const w = angelAtStall(true, { bestand: 80 });
    const listed = applyMarket(w, "a");
    const p = listed.players.get("a")!;
    expect(p.beats.market).toBe(true);
    expect(p.heard).toBe(MARKET_LISTING);
    expect(p.wink).toBe(WINK_MARKET);
    expect(listed.clearingOpen).toBe(false);
    expect(CLEARING_PRICE).toBe(40);

    const bought = applyMarket(listed, "a");
    const b = bought.players.get("a")!;
    expect(b.bestand).toBe(40);
    expect(b.aura).toBe(auraSeed(TEST_SERIAL) - 2);
    expect(b.heard).toBe(MARKET_BUY);
    expect(bought.clearingOpen).toBe(false);
    expect(damageFor(b)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(b)).toBe(false);
  });

  it("without the hall the stall is unread; guests never hear the Wink", () => {
    const closed = applyMarket(angelAtStall(false), "a");
    expect(closed.players.get("a")?.heard).toBe(MARKET_NEED_HALL);
    expect(closed.players.get("a")?.beats.market).toBe(false);

    const w = emptyWorld();
    w.players.set("g", { ...spawnGuest("g"), x: CLEARING_STALL.x, y: CLEARING_STALL.y });
    const after = applyMarket(w, "g");
    expect(after.players.get("g")?.heard).toBe(MARKET_SPECTATOR);
    expect(after.players.get("g")?.wink).toBe("");
    expect(after.clearingOpen).toBe(false);
    expect(guestCanClaim(after.players.get("g")!)).toBe(false);
  });
});

describe("Vesper Hale private yield", () => {
  function angelAtDesk(hall = true) {
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), hall, nara: true, quill: true, ord: true, burial: true, under: true, care: true },
      inCare: true,
      x: OPERATOR_DESK.x,
      y: OPERATOR_DESK.y,
    });
    return w;
  }

  it("offer then take funds Movement III the Cold way without buying damage", () => {
    const heard = applyOperator(angelAtDesk(true), "a", "hear");
    const p = heard.players.get("a")!;
    expect(p.heard).toBe(OPERATOR_OFFER);
    expect(p.wink).toBe(WINK_OPERATOR);
    expect(p.beats.yield).toBe(true);
    expect(heard.m3Open).toBe(false);

    const took = applyOperator(heard, "a", "take");
    const t = took.players.get("a")!;
    expect(t.bestand).toBe(PRIVATE_YIELD);
    expect(t.current).toBe("cold");
    expect(t.beats.cold).toBe(true);
    expect(t.heard).toBe(OPERATOR_TAKE);
    expect(took.m3Open).toBe(true);
    expect(took.pois.find((poi) => poi.id === M3_DOOR.id)?.kind).toBe("m3-open");
    expect(took.gestell).toBeGreaterThan(heard.gestell);
    expect(damageFor(t)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(t)).toBe(false);
    expect(t.heard).not.toMatch(/heidegger|sephiroth|\$REVERIE/i);
  });

  it("refuse is Readiness and does not open Movement III", () => {
    const heard = applyOperator(angelAtDesk(true), "a", "hear");
    const refused = applyOperator(heard, "a", "refuse");
    const p = refused.players.get("a")!;
    expect(p.current).toBe("readiness");
    expect(p.beats.refuse).toBe(true);
    expect(p.heard).toBe(OPERATOR_REFUSE);
    expect(p.bestand).toBe(0);
    expect(refused.m3Open).toBe(false);
    expect(guestCanClaim(p)).toBe(false);
  });

  it("hall is required; guests never hear the Wink", () => {
    expect(applyOperator(angelAtDesk(false), "a", "hear").players.get("a")?.heard).toBe(OPERATOR_NEED_HALL);
    const w = emptyWorld();
    w.players.set("g", { ...spawnGuest("g"), x: OPERATOR_DESK.x, y: OPERATOR_DESK.y, locked: true });
    const after = applyOperator(w, "g", "take");
    expect(after.players.get("g")?.heard).toBe(OPERATOR_SPECTATOR);
    expect(after.players.get("g")?.wink).toBe("");
    expect(after.m3Open).toBe(false);
    expect(guestCanClaim(after.players.get("g")!)).toBe(false);
  });
});

describe("Movement III organs", () => {
  const ready = {
    guest: false,
    serial: TEST_SERIAL,
    aura: auraSeed(TEST_SERIAL),
    beats: { ...emptyBeats(), nara: true, quill: true, ord: true, burial: true, hall: true, under: true, care: true, yield: true },
  };

  function funded() {
    const w = emptyWorld();
    w.players.set("a", { ...spawnGuest("a"), ...ready, x: OPERATOR_DESK.x, y: OPERATOR_DESK.y, inCare: true });
    return applyOperator(applyOperator(w, "a", "hear"), "a", "take");
  }

  it("going-under plants the wrecked Clearing; Nara is silent until burial", () => {
    const nara = NAVE_NPCS.find((n) => n.id === "nara")!;
    const w = placeNear("a", GOING_UNDER.x, GOING_UNDER.y, {
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), nara: true, quill: true, ord: true, burial: true },
    });
    const under = applyGoingUnder(w, "a");
    expect(under.rites.find((r) => r.kind === "garden")?.done).toBe(false);
    expect(under.pois.find((p) => p.id === WRECK_GARDEN.id)?.name).toBe("Wreckage garden");
    under.players.set("a", { ...under.players.get("a")!, x: nara.x, y: nara.y });
    const silent = applyTalk(under, "a", "nara");
    expect(silent.players.get("a")?.heard).toBe(NARA_SILENCE);
    silent.players.set("a", { ...silent.players.get("a")!, x: WRECK_GARDEN.x, y: WRECK_GARDEN.y });
    const buried = applyBury(silent, "a");
    const p = buried.players.get("a")!;
    expect(p.beats.garden).toBe(true);
    expect(p.heard).toBe(GARDEN_BURY);
    expect(p.wink).toBe(WINK_GARDEN);
    expect(buried.rites.find((r) => r.kind === "garden")?.done).toBe(true);
    buried.players.set("a", { ...p, x: nara.x, y: nara.y });
    const after = applyTalk(buried, "a", "nara");
    expect(after.players.get("a")?.heard).toBe(NARA_AFTER_GARDEN);
    expect(guestCanClaim(p)).toBe(false);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
  });

  it("Cold-funded door opens Strait / Foundry / Cable; guests cannot enter", () => {
    const open = funded();
    expect(open.m3Open).toBe(true);
    expect(open.pois.find((p) => p.id === ORGAN_STRAIT.id)?.name).toBe("The Strait");
    expect(open.pois.find((p) => p.id === ORGAN_FOUNDRY.id)?.name).toBe("The Foundry");
    expect(open.pois.find((p) => p.id === ORGAN_CABLE.id)?.name).toBe("The Cable");
    expect(open.signs.find((s) => s.id === ORGAN_STRAIT.id)?.text).not.toMatch(/hormuz|hsinchu|palantir|midgar/i);

    open.players.set("a", { ...open.players.get("a")!, x: M3_DOOR.x, y: M3_DOOR.y });
    const inside = applyM3(open, "a");
    const p = inside.players.get("a")!;
    expect(p.inM3).toBe(true);
    expect(p.beats.m3).toBe(true);
    expect(p.heard).toBe(M3_ENTER);
    expect(p.x).toBe(ORGAN_STRAIT.x);

    inside.players.set("a", { ...p, x: ORGAN_STRAIT.x, y: ORGAN_STRAIT.y });
    const strait = applyRead(inside, "a", ORGAN_STRAIT.id);
    expect(strait.players.get("a")?.beats.strait).toBe(true);
    strait.players.set("a", { ...strait.players.get("a")!, x: ORGAN_FOUNDRY.x, y: ORGAN_FOUNDRY.y });
    const foundry = applyRead(strait, "a", ORGAN_FOUNDRY.id);
    foundry.players.set("a", { ...foundry.players.get("a")!, x: ORGAN_CABLE.x, y: ORGAN_CABLE.y });
    const cable = applyRead(foundry, "a", ORGAN_CABLE.id);
    expect(cable.players.get("a")?.beats.cable).toBe(true);
    expect(cable.players.get("a")?.wink).toBe(WINK_ORGANS);

    const ord = NAVE_NPCS.find((n) => n.id === "ord")!;
    cable.players.set("a", { ...cable.players.get("a")!, x: ord.x, y: ord.y });
    const mapped = applyTalk(cable, "a", "ord");
    expect(mapped.players.get("a")?.heard).toBe(ORD_MAP);
    expect(mapped.players.get("a")?.heard).not.toMatch(/hormuz|taiwan|iran/i);
    expect(damageFor(mapped.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(mapped.players.get("a")!)).toBe(false);

    const gWorld = funded();
    gWorld.players.set("g", { ...spawnGuest("g"), x: M3_DOOR.x, y: M3_DOOR.y, locked: true });
    const guest = applyM3(gWorld, "g");
    expect(guest.players.get("g")?.inM3).toBe(false);
    expect(guest.players.get("g")?.heard).toBe(M3_SPECTATOR);
  });
});

describe("failed Passing ruin-sight", () => {
  it("only mock #7777 sees last season; watching is not loot and not damage", () => {
    const w = placeNear("a", GOING_UNDER.x, GOING_UNDER.y, {
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), nara: true, quill: true, ord: true, burial: true },
    });
    const under = applyGoingUnder(w, "a");
    expect(under.failed).toEqual([{ ...FAILED_PASSING }]);
    expect(visibleFailed(true, null, under.failed)).toEqual([]);
    expect(ruinSight(false, TEST_SERIAL)).toBe(true);
    expect(visibleFailed(false, TEST_SERIAL, under.failed)).toHaveLength(1);

    under.players.set("a", { ...under.players.get("a")!, x: FAILED_PASSING.x, y: FAILED_PASSING.y });
    const watched = applyWatch(under, "a");
    const p = watched.players.get("a")!;
    expect(p.beats.failed).toBe(true);
    expect(p.heard).toBe(WATCH_FAILED);
    expect(p.wink).toBe(WINK_FAILED);
    expect(watched.failed).toHaveLength(1);
    expect(p.bestand).toBe(0);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const gWorld = { ...under };
    gWorld.players.set("g", { ...spawnGuest("g"), x: FAILED_PASSING.x, y: FAILED_PASSING.y, locked: true });
    const guest = applyWatch(gWorld, "g");
    expect(guest.players.get("g")?.beats.failed).toBe(false);
    expect(guest.players.get("g")?.heard).toBe(FAILED_SPECTATOR);
    expect(visibleFailed(true, null, guest.failed)).toEqual([]);
  });
});

describe("forged Winke", () => {
  function angelAtQuill(market = true) {
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), market, hall: true, quill: true },
      x: FORGE_TRAY.x,
      y: FORGE_TRAY.y,
    });
    return w;
  }

  it("Quill teaches cult vs copy; spotting keeps the cult hint; selling does not open anything", () => {
    const heard = applyForge(angelAtQuill(true), "a", "hear");
    const p = heard.players.get("a")!;
    expect(p.heard).toBe(FORGE_LESSON);
    expect(p.wink).toBe(WINK_FORGE);
    expect(p.beats.forge).toBe(true);
    expect(p.cultWink).toBe(false);

    const spotted = applyForge(heard, "a", "spot");
    const s = spotted.players.get("a")!;
    expect(s.cultWink).toBe(true);
    expect(s.fakeWinke).toBe(0);
    expect(s.heard).toBe(FORGE_SPOT);
    expect(spotted.forgedSold).toBe(false);
    expect(damageFor(s)).toBe(damageFor(spawnGuest("g")));

    const sold = applyForge(heard, "a", "sell");
    const k = sold.players.get("a")!;
    expect(k.bestand).toBe(FORGE_PAY);
    expect(k.fakeWinke).toBe(1);
    expect(k.cultWink).toBe(false);
    expect(k.aura).toBe(auraSeed(TEST_SERIAL) - 3);
    expect(k.heard).toBe(FORGE_SELL);
    expect(sold.forgedSold).toBe(true);
    expect(sold.clearingOpen).toBe(false);
    expect(guestCanClaim(k)).toBe(false);
  });

  it("without the listing Quill will not teach; guests never hear the Wink", () => {
    expect(applyForge(angelAtQuill(false), "a", "hear").players.get("a")?.heard).toBe(FORGE_NEED_MARKET);
    const w = emptyWorld();
    w.players.set("g", { ...spawnGuest("g"), x: FORGE_TRAY.x, y: FORGE_TRAY.y, locked: true });
    const after = applyForge(w, "g", "sell");
    expect(after.players.get("g")?.heard).toBe(FORGE_SPECTATOR);
    expect(after.players.get("g")?.wink).toBe("");
    expect(after.forgedSold).toBe(false);
    expect(guestCanClaim(after.players.get("g")!)).toBe(false);
  });
});

describe("Movement IV Clearing and Passing", () => {
  function angelAt(x: number, y: number, extra: Partial<ReturnType<typeof spawnGuest>> = {}) {
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: {
        ...emptyBeats(),
        nara: true,
        quill: true,
        ord: true,
        burial: true,
        under: true,
        care: true,
        hall: true,
        garden: true,
      },
      x,
      y,
      ...extra,
    });
    return w;
  }

  it("Ione Kade last word is the mortality act; guests never hear it", () => {
    const w = angelAt(IONE.x, IONE.y);
    const after = applyLastWord(w, "a");
    const p = after.players.get("a")!;
    expect(p.beats.lastWord).toBe(true);
    expect(p.heard).toBe(LAST_WORD);
    expect(p.heard).toContain("Ione Kade");
    expect(p.wink).toBe(WINK_TURN);
    expect(after.ioneGone).toBe(true);
    expect(snapshot(after).npcs.find((n) => n.id === "ione")).toBeUndefined();
    expect(applyLastWord(after, "a").players.get("a")?.heard).toBe(LAST_WORD_GONE);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: IONE.x, y: IONE.y, locked: true });
    const guest = applyLastWord(gWorld, "g");
    expect(guest.ioneGone).toBe(false);
    expect(guest.players.get("g")?.heard).toBe(IONE_SPECTATOR);
    expect(guest.players.get("g")?.wink).toBe("");
    expect(guestCanClaim(guest.players.get("g")!)).toBe(false);
  });

  it("Clearing needs garden and last word; keeping does not mint", () => {
    const noGarden = applyClearing(angelAt(CLEARING_RING.x, CLEARING_RING.y, { beats: { ...emptyBeats(), lastWord: true } }), "a", "keep");
    expect(noGarden.players.get("a")?.heard).toBe(CLEARING_NEED_GARDEN);
    expect(noGarden.clearingOpen).toBe(false);

    const noWord = applyClearing(angelAt(CLEARING_RING.x, CLEARING_RING.y), "a", "keep");
    expect(noWord.players.get("a")?.heard).toBe(CLEARING_NEED_MORTAL);
    expect(noWord.clearingOpen).toBe(false);

    const ready = angelAt(CLEARING_RING.x, CLEARING_RING.y, { beats: { ...emptyBeats(), garden: true, lastWord: true } });
    const held = applyClearing(ready, "a", "keep");
    const p = held.players.get("a")!;
    expect(p.beats.clearing).toBe(true);
    expect(p.heard).toBe(CLEARING_PREPARE);
    expect(held.clearingOpen).toBe(true);
    expect(held.pois.find((poi) => poi.id === CLEARING_RING.id)?.kind).toBe("clearing-held");
    expect(held.gestell).toBeLessThan(ready.gestell);
    expect(guestCanClaim(p)).toBe(false);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
  });

  it("extract contests the Clearing and does not open a Passing", () => {
    const ready = angelAt(CLEARING_RING.x, CLEARING_RING.y, { beats: { ...emptyBeats(), garden: true, lastWord: true } });
    const held = applyClearing(ready, "a", "keep");
    const took = applyClearing(held, "a", "extract");
    const p = took.players.get("a")!;
    expect(p.bestand).toBe(CONTEST_PAY);
    expect(p.heard).toBe(CLEARING_CONTEST);
    expect(took.clearingOpen).toBe(false);
    expect(took.passing.outcome).toBe("");
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
  });

  it("Gestell 100 blocks Passing without a Clearing", () => {
    expect(dwellNeed(100)).toBe(2);
    expect(dwellNeed(12)).toBe(1);
    expect(passingResult({ starved: false, gestell: 100, clearingOpen: false, dwellers: 1, cold: false })).toBe("failed");
    const w = angelAt(CLEARING_RING.x, CLEARING_RING.y, {
      beats: { ...emptyBeats(), garden: true, lastWord: true },
    });
    w.gestell = 100;
    const attempt = applyPassing(w, "a");
    const p = attempt.players.get("a")!;
    expect(p.heard).toBe(PASSING_NEED);
    expect(attempt.passing.outcome).toBe("");
    const forced = applyClearing(w, "a", "pass");
    expect(forced.players.get("a")?.heard).toBe(PASSING_NEED);
    expect(guestCanClaim(p)).toBe(false);
  });

  it("solo cannot force Appearance when Gestell is maxed even with a held Clearing", () => {
    const w = angelAt(CLEARING_RING.x, CLEARING_RING.y, {
      beats: { ...emptyBeats(), garden: true, lastWord: true },
    });
    const held = applyClearing(w, "a", "keep");
    held.gestell = 100;
    const after = applyPassing(held, "a");
    const p = after.players.get("a")!;
    expect(p.heard).toBe(PASSING_ABSENCE);
    expect(after.passing.outcome).toBe("absence");
    expect(after.passing.ready).toBe(0);
    expect(p.heard).toContain("Nara Vale");
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
  });

  it("two dwellers can pass a maxed Gestell; freeze hijacks; Cold hijacks", () => {
    const w = angelAt(CLEARING_RING.x, CLEARING_RING.y, {
      beats: { ...emptyBeats(), garden: true, lastWord: true, clearing: true },
    });
    w.clearingOpen = true;
    w.gestell = 100;
    w.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), clearing: true },
      x: CLEARING_RING.x,
      y: CLEARING_RING.y,
    });
    const appear = applyPassing(w, "a");
    expect(appear.players.get("a")?.heard).toBe(PASSING_APPEAR);
    expect(appear.passing.outcome).toBe("appearance");
    expect(appear.passing.ready).toBe(PASSING_READY);
    expect(appear.players.get("a")?.heard).not.toMatch(/\$REVERIE|APY|heidegger/i);
    expect(appear.players.get("a")?.heard).toContain("No mint");

    const frozen = angelAt(CLEARING_RING.x, CLEARING_RING.y, {
      beats: { ...emptyBeats(), garden: true, lastWord: true, clearing: true },
    });
    frozen.clearingOpen = true;
    frozen.frozen = true;
    frozen.passing = { ready: 0, starved: true, outcome: "" };
    const hijack = applyPassing(frozen, "a");
    expect(hijack.players.get("a")?.heard).toBe(PASSING_HIJACK);
    expect(hijack.passing.outcome).toBe("hijack");

    const cold = angelAt(CLEARING_RING.x, CLEARING_RING.y, {
      beats: { ...emptyBeats(), garden: true, lastWord: true, clearing: true },
      current: "cold",
    });
    cold.clearingOpen = true;
    cold.gestell = 80;
    const coldHijack = applyPassing(cold, "a");
    expect(coldHijack.passing.outcome).toBe("hijack");
    expect(guestCanClaim(coldHijack.players.get("a")!)).toBe(false);
  });

  it("low Gestell Appearance is a trace; guests cannot keep the hole", () => {
    const w = angelAt(CLEARING_RING.x, CLEARING_RING.y, {
      beats: { ...emptyBeats(), garden: true, lastWord: true },
    });
    const held = applyClearing(w, "a", "keep");
    const after = applyPassing(held, "a");
    expect(after.players.get("a")?.heard).toBe(PASSING_APPEAR);
    expect(after.passing.outcome).toBe("appearance");
    expect(GESTELL_HOT).toBe(91);
    expect(PASSING_FAIL).toContain("Clearing");

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: CLEARING_RING.x, y: CLEARING_RING.y });
    const guest = applyClearing(gWorld, "g", "keep");
    expect(guest.clearingOpen).toBe(false);
    expect(guest.players.get("g")?.heard).toBe(CLEARING_SPECTATOR);
    expect(guest.players.get("g")?.wink).toBe("");
    expect(guestCanClaim(guest.players.get("g")!)).toBe(false);
  });
});

describe("House war on the Clearing", () => {
  function mortal(id: string, extra: Partial<ReturnType<typeof spawnGuest>> = {}) {
    return {
      ...spawnGuest(id),
      guest: false,
      serial: TEST_SERIAL,
      house: "mortals" as const,
      beats: { ...emptyBeats(), garden: true, lastWord: true },
      x: CLEARING_RING.x,
      y: CLEARING_RING.y,
      ...extra,
    };
  }

  it("two House keeps win tithe and omen, never damage", () => {
    const w = emptyWorld();
    w.players.set("a", mortal("a"));
    w.players.set("b", mortal("b", { serial: 1 }));
    const first = applyClearing(w, "a", "keep");
    expect(first.war.keep.mortals).toBe(1);
    expect(first.war.winner).toBe("");
    const won = applyClearing(first, "b", "keep");
    expect(won.war.winner).toBe("mortals");
    expect(won.war.titheCut).toBe(WAR_TITHE);
    expect(won.war.omen).toBe(WAR_OMEN_KEEP);
    expect(won.players.get("b")?.heard).toBe(WAR_OMEN_KEEP);
    expect(won.players.get("b")?.wink).toBe(WINK_WAR);
    expect(snapshot(won).war.winner).toBe("mortals");
    expect(damageFor(won.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(damageFor(won.players.get("b")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(won.players.get("a")!)).toBe(false);
  });

  it("two extracts win the Cold omen; guests do not score", () => {
    const w = emptyWorld();
    w.players.set("e", {
      ...spawnGuest("e"),
      guest: false,
      house: "earth",
      x: CLEARING_RING.x,
      y: CLEARING_RING.y,
    });
    const one = applyClearing(w, "e", "extract");
    expect(one.war.winner).toBe("");
    const two = applyClearing(one, "e", "extract");
    expect(two.war.winner).toBe("earth");
    expect(two.war.omen).toBe(WAR_OMEN_EXTRACT);
    expect(two.war.titheCut).toBe(WAR_TITHE);
    expect(WAR_WIN).toBe(2);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: CLEARING_RING.x, y: CLEARING_RING.y });
    const guest = applyClearing(gWorld, "g", "extract");
    expect(guest.war.extract.earth).toBe(0);
    expect(guest.war.winner).toBe("");
    expect(guestCanClaim(guest.players.get("g")!)).toBe(false);
  });

  it("winning House skims less tithe and still cannot buy a strike", () => {
    expect(warTax(8, "mortals", { ...emptyWar(), winner: "mortals", titheCut: 2 })).toBe(6);
    expect(warTax(8, "sky", { ...emptyWar(), winner: "mortals", titheCut: 2 })).toBe(8);
    const w = emptyWorld();
    w.war = { ...emptyWar(), winner: "mortals", titheCut: WAR_TITHE, omen: WAR_OMEN_KEEP };
    const node = w.nodes[0];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      house: "mortals",
      beats: { ...emptyBeats(), hall: true },
      x: node.x,
      y: node.y,
    });
    const tax = gestellTax(w.gestell);
    const after = applyUse(w, "a", node.id, "extract");
    expect(after.players.get("a")?.bestand).toBe(40 - warTax(earthTax(tax, "mortals"), "mortals", w.war));
    expect(after.players.get("a")?.bestand).toBeGreaterThan(40 - tax);
    expect(damageFor(after.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(after.players.get("a")!)).toBe(false);
  });

  it("holding the ring ticks a keep win without extra damage", () => {
    const w = emptyWorld();
    w.clearingOpen = true;
    w.players.set("a", mortal("a"));
    let cur = w;
    for (let i = 0; i < 50; i++) cur = tickWorld(cur, 0.05);
    expect(cur.war.winner).toBe("mortals");
    expect(cur.war.omen).toBe(WAR_OMEN_KEEP);
    expect(damageFor(cur.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
  });
});

describe("Wet Grid flagged PvP", () => {
  function angel(id: string, extra: Partial<ReturnType<typeof spawnGuest>> = {}) {
    return {
      ...spawnGuest(id),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      flagged: true,
      x: WET_GRID.x,
      y: WET_GRID.y,
      ...extra,
    };
  }

  it("flagging is opt-in; guests cannot flag", () => {
    const w = emptyWorld();
    w.players.set("a", angel("a", { flagged: false }));
    const flagged = applyFlag(w, "a");
    expect(flagged.players.get("a")?.flagged).toBe(true);
    expect(flagged.players.get("a")?.heard).toBe(FLAG_COPY);
    w.players.set("g", { ...spawnGuest("g"), x: WET_GRID.x, y: WET_GRID.y, locked: true });
    const g = applyFlag(w, "g");
    expect(g.players.get("g")?.flagged).toBe(false);
    expect(g.players.get("g")?.heard).toBe(FLAG_SPECTATOR);
    expect(guestCanClaim(g.players.get("g")!)).toBe(false);
  });

  it("flagged kill takes unbanked and copies, never cult or banked, never extra damage", () => {
    const w = emptyWorld();
    w.players.set("a", angel("a", { bestand: 10 }));
    w.players.set("b", angel("b", { x: WET_GRID.x + 20, y: WET_GRID.y, bestand: 100, banked: 80, cultWink: true, fakeWinke: 2, hp: 20 }));
    const after = applyStrike(w, "a");
    const a = after.players.get("a")!;
    const b = after.players.get("b")!;
    expect(a.bestand).toBe(10 + 30);
    expect(a.fakeWinke).toBe(1);
    expect(a.heard).toBe(SPOILS_COPY);
    expect(b.banked).toBe(80);
    expect(b.cultWink).toBe(true);
    expect(b.fakeWinke).toBe(1);
    expect(b.bestand).toBe(70);
    expect(damageFor(a)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(a)).toBe(false);
  });

  it("guest kills pay nothing; camping the same grave feeds Gestell and thins aura", () => {
    const w = emptyWorld();
    w.players.set("a", angel("a"));
    w.players.set("g", { ...spawnGuest("g"), x: WET_GRID.x + 10, y: WET_GRID.y, hp: 20, bestand: 90 });
    const grief = applyStrike(w, "a");
    expect(grief.players.get("a")?.heard).toBe(GUEST_GRIEF);
    expect(grief.players.get("a")?.bestand).toBe(0);
    expect(grief.players.get("g")?.bestand).toBe(90);

    const duel = emptyWorld();
    duel.players.set("a", angel("a", { lastKillId: "b" }));
    duel.players.set("b", angel("b", { x: WET_GRID.x + 16, y: WET_GRID.y, hp: 20, bestand: 40 }));
    const camp = applyStrike(duel, "a");
    expect(camp.players.get("a")?.heard).toBe(CAMP_COPY);
    expect(camp.players.get("a")?.aura).toBeLessThan(auraSeed(TEST_SERIAL));
    expect(camp.gestell).toBeGreaterThan(duel.gestell);
    expect(guestCanClaim(camp.players.get("a")!)).toBe(false);
  });
});

describe("Claims desk disarmed", () => {
  it("Angel files a claim; TAKE stays disarmed; guests cannot claim", () => {
    expect(CLAIMS_ARMED).toBe(false);
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      bestand: 40,
      x: CLAIMS_DESK.x,
      y: CLAIMS_DESK.y,
    });
    const filed = applyDesk(w, "a", "file");
    const p = filed.players.get("a")!;
    expect(p.bestand).toBe(0);
    expect(p.claims).toHaveLength(1);
    expect(p.claims[0]?.amount).toBe(40);
    expect(p.claims[0]?.readyAt).toBe(CLAIM_HOLD);
    expect(p.heard).toBe(DESK_FILE);
    expect(p.heard).toMatch(/not a yield/i);
    expect(guestCanClaim(p)).toBe(false);

    const early = applyDesk(filed, "a", "take");
    expect(early.players.get("a")?.heard).toBe(DESK_WAIT);
    expect(early.players.get("a")?.bestand).toBe(0);

    filed.now = CLAIM_HOLD;
    const take = applyDesk(filed, "a", "take");
    expect(take.players.get("a")?.heard).toBe(DESK_DISARMED);
    expect(take.players.get("a")?.bestand).toBe(0);
    expect(take.players.get("a")?.claims).toHaveLength(1);
    expect(take.players.get("a")?.heard).not.toMatch(/APY|settle live/i);
    expect(damageFor(take.players.get("a")!)).toBe(damageFor(spawnGuest("g")));

    const empty = applyDesk({ ...w, players: new Map([["a", { ...p, bestand: 0, claims: [] }]]) }, "a", "file");
    expect(empty.players.get("a")?.heard).toBe(DESK_EMPTY);

    w.players.set("g", { ...spawnGuest("g"), x: CLAIMS_DESK.x, y: CLAIMS_DESK.y, locked: true, bestand: 99 });
    const guest = applyDesk(w, "g", "file");
    expect(guest.players.get("g")?.heard).toBe(DESK_SPECTATOR);
    expect(guest.players.get("g")?.claims).toEqual([]);
    expect(guest.players.get("g")?.bestand).toBe(99);
    expect(guestCanClaim(guest.players.get("g")!)).toBe(false);
  });
});

describe("Ruin duel", () => {
  it("1v1 at a wreckage takes unbanked not cult; spectators gain capped aura", () => {
    const w = emptyWorld();
    w.wreckage = [{ id: "grave", x: 200, y: 480, fromId: "z", fromName: "Angel", until: 40 }];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      messenger: "ruin-angel",
      aura: auraSeed(TEST_SERIAL),
      x: 200,
      y: 480,
      bestand: 5,
    });
    w.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      serial: 2,
      messenger: "herald",
      x: 210,
      y: 480,
      hp: 20,
      bestand: 100,
      banked: 50,
      cultWink: true,
      fakeWinke: 1,
    });
    w.players.set("s", {
      ...spawnGuest("s"),
      guest: false,
      serial: 3,
      aura: 4,
      x: 200,
      y: 500,
    });
    w.players.set("g", { ...spawnGuest("g"), x: 200, y: 490 });
    const after = applyStrike(w, "a");
    const a = after.players.get("a")!;
    const b = after.players.get("b")!;
    const s = after.players.get("s")!;
    expect(a.heard).toBe(DUEL_COPY);
    expect(a.wink).toBe(WINK_DUEL);
    expect(a.bestand).toBe(5 + 30);
    expect(b.banked).toBe(50);
    expect(b.cultWink).toBe(true);
    expect(s.aura).toBe(5);
    expect(s.spectated).toBe(1);
    expect(s.heard).toBe(SPECTATE_COPY);
    expect(after.players.get("g")?.aura).toBe(0);
    expect(SPECTATE_CAP).toBe(3);
    expect(damageFor(a)).toBe(damageFor({ ...spawnGuest("h"), messenger: "herald" }));
    expect(guestCanClaim(a)).toBe(false);

    s.hp = 100;
    after.players.set("s", { ...s, x: 200, y: 500 });
    after.players.set("a", { ...a, strikeCd: 0 });
    after.players.set("c", {
      ...spawnGuest("c"),
      guest: false,
      x: 208,
      y: 480,
      hp: 20,
      bestand: 10,
    });
    let cur = after;
    for (let i = 0; i < 4; i++) {
      cur.players.set("a", { ...cur.players.get("a")!, strikeCd: 0, hp: 100 });
      cur.wreckage = [{ id: "grave", x: 200, y: 480, fromId: "z", fromName: "Angel", until: 40 }];
      cur.players.set("c", {
        ...spawnGuest("c"),
        guest: false,
        x: 208,
        y: 480,
        hp: 20,
        bestand: 10,
      });
      cur = applyStrike(cur, "a");
    }
    expect(cur.players.get("s")!.spectated).toBe(SPECTATE_CAP);
    expect(cur.players.get("s")!.aura).toBe(4 + SPECTATE_CAP);
  });
});

describe("Bestand sinks", () => {
  it("funeral on wreckage costs Bestand; the plot stays free", () => {
    const plot = emptyWorld().rites.find((r) => r.kind === "burial")!;
    const free = emptyWorld();
    free.players.set("a", { ...spawnGuest("a"), x: plot.x, y: plot.y, bestand: 0 });
    const buried = applyBury(free, "a");
    expect(buried.rites.find((r) => r.kind === "burial")?.done).toBe(true);
    expect(buried.players.get("a")?.bestand).toBe(0);

    const w = emptyWorld();
    w.wreckage = [{ id: "g", x: 200, y: 480, fromId: "z", fromName: "Angel", until: 40 }];
    w.players.set("a", { ...spawnGuest("a"), guest: false, x: 200, y: 480, bestand: 5 });
    const poor = applyBury(w, "a");
    expect(poor.wreckage).toHaveLength(1);
    expect(poor.players.get("a")?.heard).toBe(FUNERAL_NEED);

    w.players.set("a", { ...spawnGuest("a"), guest: false, x: 200, y: 480, bestand: 40 });
    const paid = applyBury(w, "a");
    expect(paid.wreckage).toHaveLength(0);
    expect(paid.players.get("a")?.bestand).toBe(40 - FUNERAL_COST);
    expect(paid.players.get("a")?.heard).toBe(FUNERAL_COPY);
    expect(paid.players.get("a")?.wink).toBe(WINK_SINK);
    expect(FUNERAL_COST).toBe(12);
    expect(damageFor(paid.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(paid.players.get("a")!)).toBe(false);
  });

  it("shrine upkeep spends Bestand and thins Gestell, never damage", () => {
    const w = emptyWorld();
    w.players.set("a", { ...spawnGuest("a"), guest: false, x: SHRINE.x, y: SHRINE.y, bestand: 4 });
    const poor = applyShrine(w, "a");
    expect(poor.players.get("a")?.heard).toBe(SHRINE_NEED);
    expect(poor.gestell).toBe(w.gestell);

    w.players.set("a", { ...spawnGuest("a"), guest: false, x: SHRINE.x, y: SHRINE.y, bestand: 20 });
    const paid = applyShrine(w, "a");
    expect(paid.players.get("a")?.bestand).toBe(20 - SHRINE_COST);
    expect(paid.players.get("a")?.heard).toBe(SHRINE_COPY);
    expect(paid.gestell).toBe(w.gestell - 2);
    expect(SHRINE_COST).toBe(8);
    expect(damageFor(paid.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(paid.players.get("a")!)).toBe(false);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: SHRINE.x, y: SHRINE.y, bestand: 20 });
    const guest = applyShrine(gWorld, "g");
    expect(guest.players.get("g")?.heard).toBe(SHRINE_SPECTATOR);
    expect(guest.players.get("g")?.bestand).toBe(20);
    expect(guest.gestell).toBe(gWorld.gestell);
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
    expect(p.house).toBe("mortals");
    expect(p.messenger).toBe("herald");
    expect(houseFor(TEST_SERIAL)).toBe("mortals");
    expect(messengerFor(TEST_SERIAL)).toBe("herald");
    expect(houseName(p.house)).toBe("House of Mortals");
    expect(messengerName(p.messenger)).toBe("Herald");
    expect(p.heard).toContain("House of Mortals");
    expect(p.heard).toContain("Herald");
    expect(p.heard).not.toMatch(/\$REVERIE|APY|yield/i);
    expect(linked.history).toEqual([{ ...HISTORY_7777 }]);
    expect(visibleHistory(true, null, linked.history)).toEqual([]);
    expect(visibleHistory(false, TEST_SERIAL, linked.history)).toHaveLength(1);
  });
});

describe("Fourfold houses", () => {
  it("houses change perception and gather, never damage", () => {
    expect(houseFor(TEST_SERIAL)).toBe("mortals");
    expect(houseName("earth")).toBe("House of Earth");
    expect(houseName("sky")).toBe("House of Sky");
    expect(houseName("divinities")).toBe("House of Divinities");
    expect(earthTax(8, "earth")).toBe(6);
    expect(earthTax(8, "sky")).toBe(8);
    expect(divinitiesKeep("divinities")).toBe(2);
    expect(divinitiesKeep("mortals")).toBe(1);

    const earth = { ...spawnGuest("e"), house: "earth" as const, guest: false };
    const sky = { ...spawnGuest("s"), house: "sky" as const, guest: false };
    const mortals = { ...spawnGuest("m"), house: "mortals" as const, guest: false };
    const divinities = { ...spawnGuest("d"), house: "divinities" as const, guest: false };
    expect(damageFor(earth)).toBe(damageFor(spawnGuest("g")));
    expect(damageFor(sky)).toBe(damageFor(divinities));
    expect(damageFor(mortals)).toBe(damageFor(earth));
    expect(guestCanClaim(earth)).toBe(false);
  });

  it("Earth skims less tax; Divinities keep extra Winke; Mortals see the failed hour", () => {
    const w = emptyWorld();
    const node = w.nodes[0];
    w.players.set("e", {
      ...spawnGuest("e"),
      guest: false,
      house: "earth",
      beats: { ...emptyBeats(), hall: true },
      x: node.x,
      y: node.y,
    });
    const tax = gestellTax(w.gestell);
    const after = applyUse(w, "e", node.id, "extract");
    expect(after.players.get("e")?.bestand).toBe(40 - earthTax(tax, "earth"));
    expect(after.players.get("e")?.bestand).toBeGreaterThan(40 - tax);
    expect(damageFor(after.players.get("e")!)).toBe(damageFor(spawnGuest("g")));

    const keepW = emptyWorld();
    const n = keepW.nodes[0];
    keepW.players.set("d", {
      ...spawnGuest("d"),
      guest: false,
      house: "divinities",
      x: n.x,
      y: n.y,
    });
    const kept = applyUse(keepW, "d", n.id, "keep");
    expect(kept.players.get("d")?.winke).toBe(2);

    expect(visibleFailed(false, 1, [{ ...FAILED_PASSING }], "mortals")).toHaveLength(1);
    expect(visibleFailed(false, 1, [{ ...FAILED_PASSING }], "sky")).toEqual([]);
    expect(visibleFailed(true, null, [{ ...FAILED_PASSING }], "")).toEqual([]);
    expect(ruinSight(false, 2, "mortals")).toBe(true);
    expect(guestCanClaim(kept.players.get("d")!)).toBe(false);
  });
});

describe("Herald Announce", () => {
  it("pings a kept node and never buys damage", () => {
    const w = emptyWorld();
    const node = w.nodes[0];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      messenger: "herald",
      house: "mortals",
      x: node.x,
      y: node.y,
    });
    const kept = applyUse(w, "a", node.id, "keep");
    expect(kept.nodes[0].kept).toBe(true);
    const ping = applyAnnounce(kept, "a", node.id);
    const p = ping.players.get("a")!;
    expect(ping.announced).toBe(node.id);
    expect(p.heard).toBe(ANNOUNCE_COPY);
    expect(p.wink).toBe(WINK_ANNOUNCE);
    expect(snapshot(ping).announced).toBe(node.id);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const raw = emptyWorld();
    raw.players.set("a", { ...spawnGuest("a"), guest: false, messenger: "herald", x: node.x, y: node.y });
    expect(applyAnnounce(raw, "a", node.id).announced).toBeNull();
    expect(applyAnnounce(raw, "a", node.id).players.get("a")?.heard).toBe(ANNOUNCE_NEED);

    const cyber = emptyWorld();
    cyber.nodes[0] = { ...node, depleted: true, kept: true };
    cyber.players.set("c", {
      ...spawnGuest("c"),
      guest: false,
      messenger: "cybernetic",
      x: node.x,
      y: node.y,
    });
    expect(applyAnnounce(cyber, "c", node.id).announced).toBeNull();
    expect(applyAnnounce(cyber, "c", node.id).players.get("c")?.heard).toBe(ANNOUNCE_NEED);

    const gWorld = emptyWorld();
    gWorld.nodes[0] = { ...node, depleted: true, kept: true };
    gWorld.players.set("g", { ...spawnGuest("g"), x: node.x, y: node.y });
    const guest = applyAnnounce(gWorld, "g", node.id);
    expect(guest.announced).toBeNull();
    expect(guest.players.get("g")?.heard).toBe(ANNOUNCE_SPECTATOR);
    expect(guest.players.get("g")?.wink).toBe("");
  });
});

describe("serial history wreckage", () => {
  it("only the linked serial sees and may bury the prior hour", () => {
    const w = emptyWorld();
    w.players.set("a", spawnGuest("a"));
    const linked = applyLink(w, "a", TEST_SERIAL, MOCK_SIG);
    expect(visibleHistory(false, 1, linked.history)).toEqual([]);
    const angel = linked.players.get("a")!;
    linked.players.set("a", { ...angel, x: HISTORY_7777.x, y: HISTORY_7777.y });
    const buried = applyBury(linked, "a");
    const p = buried.players.get("a")!;
    expect(p.heard).toBe(HISTORY_7777.line);
    expect(p.wink).toBe(WINK_HISTORY);
    expect(buried.history).toEqual([]);
    expect(p.readiness).toBe(angel.readiness + 1);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("b")));
    expect(guestCanClaim(p)).toBe(false);
  });

  it("guest standing on the mark sees nothing and cannot bury it", () => {
    const w = emptyWorld();
    w.history = [{ ...HISTORY_7777 }];
    w.players.set("g", { ...spawnGuest("g"), x: HISTORY_7777.x, y: HISTORY_7777.y });
    const after = applyBury(w, "g");
    expect(after.history).toHaveLength(1);
    expect(after.players.get("g")?.wink).toBe("");
    expect(visibleHistory(true, null, after.history)).toEqual([]);
    expect(guestCanClaim(after.players.get("g")!)).toBe(false);
  });
});

