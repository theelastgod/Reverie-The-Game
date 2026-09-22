import { describe, expect, it } from "vitest";
import {
  CARE_DOOR,
  CARE_SPECTATOR,
  CLEARING_PRICE,
  CLEARING_STALL,
  GUEST_LOCK,
  GOING_UNDER,
  FREEZE_COPY,
  FREEZE_COST,
  FREEZE_NEED,
  FREEZE_EXTRACT,
  FREEZE_NEED_HALL,
  FREEZE_SPECTATOR,
  HALL_PLAQUE,
  HALL_STANDING_PLAQUE,
  STANDING_COPY,
  STANDING_NEED,
  STANDING_WRONG,
  STANDING_HELD,
  STANDING_SPECTATOR,
  WINK_STANDING,
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
  NARA_MARK,
  NARA_MARK_LATER,
  WINK_SEXTON,
  SEXTON_SPECTATOR,
  liveNpcs,
  GARDEN_BURY,
  M3_ENTER,
  M3_SPECTATOR,
  ORD_MAP,
  ORGAN_STRAIT,
  ORGAN_FOUNDRY,
  ORGAN_CABLE,
  ORGAN_PLAQUES,
  FAILED_PASSING,
  WATCH_FAILED,
  WINK_FAILED,
  FORGE_TRAY,
  FORGE_PAY,
  LISTING_FEE,
  EXHIBIT_DECAY,
  CULT_NO_LIST,
  DECAY_COPY,
  FORGE_LESSON,
  FORGE_NEED_MARKET,
  FORGE_SELL,
  FORGE_SPOT,
  FORGE_SPECTATOR,
  WINK_FORGE,
  QUILL_HANG_ASK,
  QUILL_HANG,
  QUILL_HANG_WAIT,
  QUILL_HANG_NEED,
  QUILL_UNFLAG_ASK,
  QUILL_UNFLAG_WAIT,
  UNFLAG_COPY,
  WINK_UNFLAG,
  UNFLAG_NEED,
  UNFLAG_LATER,
  UNFLAG_SPECTATOR,
  FLAG_CULT,
  UNFLAG_PLAQUE,
  NARA_CANAL_ASK,
  NARA_CANAL,
  NARA_CANAL_LATER,
  WINK_CANAL,
  CANAL_SPECTATOR,
  CANAL_PLAQUE,
  QUILL_HANG_SPECTATOR,
  WINK_HANG,
  STALL_DARK_COPY,
  STALL_DARK_PLAQUE,
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
  ORD_ERRAND,
  ORD_CABLE_LATER,
  CABLE_QUIET_COPY,
  CABLE_QUIET_PLAQUE,
  ERRAND_EXTRACT,
  WINK_ERRAND,
  WAR_WIN,
  WAR_TITHE,
  TITHE_COST,
  TITHE_COPY,
  TITHE_NEED,
  TITHE_SPECTATOR,
  TITHE_WRONG,
  TITHE_NONE,
  TITHE_HELD,
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
  AURA_DIM,
  RESTORE_COST,
  RESTORE_GAIN,
  RESTORE_COPY,
  RESTORE_NEED,
  RESTORE_FULL,
  RESTORE_SPECTATOR,
  INSURANCE_COST,
  INSURANCE_COPY,
  INSURANCE_NEED,
  INSURANCE_HELD,
  INSURANCE_USED,
  INSURANCE_SPECTATOR,
  WINK_SINK,
  CLOCK_OUT,
  CLOCK_NEED,
  CLOCK_SPECTATOR,
  WINK_CLOCK,
  YIELD_EMPTY,
  YIELD_EMPTY_NEED,
  YIELD_EMPTY_SPECTATOR,
  YIELD_EMPTY_PLAQUE,
  WINK_YIELD_EMPTY,
  ANNEX_HOME,
  ANNEX_NEED,
  ANNEX_GONE,
  ANNEX_SPECTATOR,
  WINK_ANNEX,
  ANNEX_HOME_PLAQUE,
  STRAIT_REFUSE,
  WINK_STRAIT_REFUSE,
  STRAIT_NEED_DARK,
  STRAIT_REFUSED_LATER,
  STRAIT_SPECTATOR,
  STRAIT_REFUSED_PLAQUE,
  ORD_WITNESS,
  ORD_WITNESS_LATER,
  WINK_WITNESS,
  ORD_WITNESS_SPECTATOR,
  VESPER,
  VESPER_NEED_FOUNDRY,
  VESPER_UNLIGHT_ASK,
  VESPER_UNLIGHT_WAIT,
  FOUNDRY_DARK_COPY,
  WINK_FOUNDRY_DARK,
  FOUNDRY_NEED_COLD,
  FOUNDRY_DARK_LATER,
  FOUNDRY_SPECTATOR,
  OPERATOR_VACANT,
  VESPER_FOUNDRY_LATER,
  FOUNDRY_DARK_PLAQUE,
  CABLE_DARK,
  WINK_CABLE_DARK,
  CABLE_NEED_STRAIT,
  CABLE_DARK_LATER,
  CABLE_DARK_SPECTATOR,
  CABLE_DARK_PLAQUE,
  SKY_STANDING,
  WINK_SKY,
  SKY_NEED,
  SKY_WRONG,
  SKY_HELD,
  SKY_SPECTATOR,
  SKY_PLAQUE,
  REPAIR_COST,
  REPAIR_COPY,
  REPAIR_NEED,
  REPAIR_NONE,
  REPAIR_SPECTATOR,
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
  applyHang,
  applyFlag,
  applyUnflag,
  applyDesk,
  applyShrine,
  applyRestore,
  applyInsure,
  applyRepair,
  applyLastWord,
  applyClearing,
  applyPassing,
  applyAnnounce,
  applyTithe,
  applyClockOut,
  applyYieldEmpty,
  applyAnnexHome,
  applyStraitRefuse,
  applyCableDark,
  applySkyStanding,
  applyUnlight,
  applyStanding,
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
  NAVE_SPAWN_X,
  NAVE_SPAWN_Y,
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

  it("Mortals standing names the garden in the hall; other Houses cannot", () => {
    const w = emptyWorld();
    w.pois = [...w.pois, { id: HOUSE_HALL.id, name: "House of Mortals", x: HOUSE_HALL.x, y: HOUSE_HALL.y, kind: "house-hall" }];
    w.signs = [...w.signs, { ...HALL_PLAQUE }];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      house: "mortals",
      inCare: true,
      beats: { ...emptyBeats(), hall: true, garden: true },
      x: HOUSE_HALL.x,
      y: HOUSE_HALL.y,
    });
    const need = applyStanding(
      { ...w, players: new Map([["a", { ...w.players.get("a")!, beats: { ...emptyBeats(), hall: true } }]]) },
      "a",
    );
    expect(need.players.get("a")?.heard).toBe(STANDING_NEED);
    expect(need.standing.mortals).toBe(0);

    const paid = applyStanding(w, "a");
    const p = paid.players.get("a")!;
    expect(p.heard).toBe(STANDING_COPY);
    expect(p.beats.standing).toBe(true);
    expect(p.wink).toBe(WINK_STANDING);
    expect(paid.hallLamp).toBe(true);
    expect(paid.standing.mortals).toBe(1);
    expect(paid.pois.find((poi) => poi.id === HOUSE_HALL.id)?.kind).toBe("house-standing");
    expect(paid.signs.find((s) => s.id === HOUSE_HALL.id)?.title).toBe(HALL_STANDING_PLAQUE.title);
    expect(applyStanding(paid, "a").players.get("a")?.heard).toBe(STANDING_HELD);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const earth = emptyWorld();
    earth.players.set("e", {
      ...spawnGuest("e"),
      guest: false,
      house: "earth",
      inCare: true,
      beats: { ...emptyBeats(), hall: true, garden: true },
      x: HOUSE_HALL.x,
      y: HOUSE_HALL.y,
    });
    expect(applyStanding(earth, "e").players.get("e")?.heard).toBe(STANDING_WRONG);
    expect(applyStanding(earth, "e").standing.mortals).toBe(0);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: HOUSE_HALL.x, y: HOUSE_HALL.y, locked: true });
    expect(applyStanding(gWorld, "g").players.get("g")?.heard).toBe(STANDING_SPECTATOR);
    expect(guestCanClaim(gWorld.players.get("g")!)).toBe(false);
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
      bestand: 20,
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
    expect(p.bestand).toBe(20 - FREEZE_COST);
    expect(FREEZE_COST).toBe(10);
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
    expect(blocked.players.get("a")?.bestand).toBe(20 - FREEZE_COST);
    expect(blocked.nodes[0].depleted).toBe(false);
    expect(blocked.players.get("a")?.heard).toBe(FREEZE_EXTRACT);

    const poor = angelAtAnnex(true);
    poor.players.set("a", { ...poor.players.get("a")!, bestand: 4 });
    const unpaid = applyFreeze(poor, "a");
    expect(unpaid.frozen).toBe(false);
    expect(unpaid.players.get("a")?.heard).toBe(FREEZE_NEED);
    expect(unpaid.players.get("a")?.bestand).toBe(4);
    expect(unpaid.players.get("a")?.beats.freeze).toBe(false);
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

    const marked = applyTalk(after, "a", "nara");
    const m = marked.players.get("a")!;
    expect(m.heard).toBe(NARA_MARK);
    expect(m.cultMark).toBe(true);
    expect(m.cultWink).toBe(true);
    expect(m.wink).toBe(WINK_SEXTON);
    expect(marked.naraAtStrait).toBe(true);
    expect(marked.pois.find((poi) => poi.id === WRECK_GARDEN.id)?.kind).toBe("sexton-mark");
    const naraMoved = liveNpcs(false, false, true).find((n) => n.id === "nara")!;
    expect(naraMoved.role).toBe("At the Strait");
    marked.players.set("a", { ...m, x: naraMoved.x, y: naraMoved.y });
    expect(applyTalk(marked, "a", "nara").players.get("a")?.heard).toBe(NARA_MARK_LATER);
    expect(guestCanClaim(m)).toBe(false);
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

describe("Ord's Cable errand", () => {
  it("keeping a node quiets the Cable plaque and moves Ord; extract does not", () => {
    const ord = NAVE_NPCS.find((n) => n.id === "ord")!;
    const w = emptyWorld();
    w.m3Open = true;
    w.pois = [...w.pois, { id: ORGAN_CABLE.id, name: "The Cable", x: ORGAN_CABLE.x, y: ORGAN_CABLE.y, kind: "organ-cable" }];
    w.signs = [...w.signs, ORGAN_PLAQUES.find((s) => s.id === ORGAN_CABLE.id)!];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), map: true, m3: true },
      x: ord.x,
      y: ord.y,
    });
    const asked = applyTalk(w, "a", "ord");
    expect(asked.players.get("a")?.heard).toBe(ORD_ERRAND);
    expect(asked.players.get("a")?.beats.errand).toBe(true);
    expect(asked.ordAtCable).toBe(false);

    const node = asked.nodes[0];
    asked.players.set("a", { ...asked.players.get("a")!, x: node.x, y: node.y });
    const kept = applyUse(asked, "a", node.id, "keep");
    const p = kept.players.get("a")!;
    expect(p.beats.cableQuiet).toBe(true);
    expect(p.heard).toBe(CABLE_QUIET_COPY);
    expect(p.wink).toBe(WINK_ERRAND);
    expect(kept.ordAtCable).toBe(true);
    expect(kept.pois.find((poi) => poi.id === ORGAN_CABLE.id)?.kind).toBe("organ-cable-quiet");
    expect(kept.signs.find((s) => s.id === ORGAN_CABLE.id)?.title).toBe(CABLE_QUIET_PLAQUE.title);
    const moved = liveNpcs(false, true).find((n) => n.id === "ord")!;
    expect(moved.x).toBe(ORGAN_CABLE.x);
    expect(moved.role).toBe("At the Cable");
    kept.players.set("a", { ...p, x: moved.x, y: moved.y });
    const later = applyTalk(kept, "a", "ord");
    expect(later.players.get("a")?.heard).toBe(ORD_CABLE_LATER);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const extractW = emptyWorld();
    extractW.m3Open = true;
    extractW.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), errand: true, map: true },
      x: node.x,
      y: node.y,
    });
    const extracted = applyUse(extractW, "a", node.id, "extract");
    expect(extracted.players.get("a")?.heard).toBe(ERRAND_EXTRACT);
    expect(extracted.ordAtCable).toBe(false);
    expect(extracted.pois.find((poi) => poi.id === ORGAN_CABLE.id)?.kind).not.toBe("organ-cable-quiet");
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
    expect(k.bestand).toBe(FORGE_PAY - LISTING_FEE);
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

  it("cult cannot list; listing fee sinks Bestand; prints decay", () => {
    const heard = applyForge(angelAtQuill(true), "a", "hear");
    const spotted = applyForge(heard, "a", "spot");
    const blocked = applyForge(spotted, "a", "sell");
    expect(blocked.players.get("a")?.heard).toBe(CULT_NO_LIST);
    expect(blocked.players.get("a")?.cultWink).toBe(true);
    expect(blocked.forgedSold).toBe(false);
    expect(LISTING_FEE).toBe(5);
    expect(FORGE_PAY - LISTING_FEE).toBe(20);

    const sold = applyForge(heard, "a", "sell");
    expect(sold.players.get("a")?.bestand).toBe(20);
    let decay = sold;
    for (let i = 0; i < 410; i++) decay = tickWorld(decay, 0.05);
    expect(decay.players.get("a")?.fakeWinke).toBe(0);
    expect(decay.players.get("a")?.heard).toBe(DECAY_COPY);
    expect(EXHIBIT_DECAY).toBe(20);
    expect(damageFor(sold.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(sold.players.get("a")!)).toBe(false);
  });
});

describe("Quill darkens the stall", () => {
  it("hanging the cult sheet unlists the stall and moves Quill; selling cannot", () => {
    const quill = NAVE_NPCS.find((n) => n.id === "quill")!;
    const heard = applyForge(
      (() => {
        const w = emptyWorld();
        w.players.set("a", {
          ...spawnGuest("a"),
          guest: false,
          serial: TEST_SERIAL,
          aura: auraSeed(TEST_SERIAL),
          beats: { ...emptyBeats(), market: true, hall: true, quill: true },
          x: FORGE_TRAY.x,
          y: FORGE_TRAY.y,
        });
        return w;
      })(),
      "a",
      "hear",
    );
    const spotted = applyForge(heard, "a", "spot");
    spotted.players.set("a", { ...spotted.players.get("a")!, x: quill.x, y: quill.y });
    const asked = applyTalk(spotted, "a", "quill");
    expect(asked.players.get("a")?.heard).toBe(QUILL_HANG_ASK);
    expect(asked.players.get("a")?.beats.hangAsk).toBe(true);
    expect(asked.quillAtGrid).toBe(false);
    expect(applyTalk(asked, "a", "quill").players.get("a")?.heard).toBe(QUILL_HANG_WAIT);

    asked.players.set("a", { ...asked.players.get("a")!, x: CLEARING_STALL.x, y: CLEARING_STALL.y, bestand: 80 });
    const hung = applyHang(asked, "a");
    const p = hung.players.get("a")!;
    expect(p.heard).toBe(QUILL_HANG);
    expect(p.beats.hang).toBe(true);
    expect(p.cultWink).toBe(true);
    expect(p.wink).toBe(WINK_HANG);
    expect(hung.stallDark).toBe(true);
    expect(hung.quillAtGrid).toBe(true);
    expect(hung.pois.find((poi) => poi.id === CLEARING_STALL.id)?.kind).toBe("stall-dark");
    expect(hung.signs.find((s) => s.id === CLEARING_STALL.id)?.title).toBe(STALL_DARK_PLAQUE.title);
    const moved = liveNpcs(false, false, false, true).find((n) => n.id === "quill")!;
    expect(moved.role).toBe("On the wet street");
    expect(moved.x).toBe(WET_GRID.x + 48);
    hung.players.set("a", { ...p, x: moved.x, y: moved.y });
    expect(applyTalk(hung, "a", "quill").players.get("a")?.heard).toBe(QUILL_UNFLAG_ASK);

    hung.players.set("a", { ...p, x: CLEARING_STALL.x, y: CLEARING_STALL.y, bestand: 80 });
    const buy = applyMarket(hung, "a");
    expect(buy.players.get("a")?.heard).toBe(STALL_DARK_COPY);
    expect(buy.players.get("a")?.bestand).toBe(80);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const soldW = applyForge(heard, "a", "sell");
    soldW.players.set("a", { ...soldW.players.get("a")!, x: quill.x, y: quill.y });
    const refused = applyTalk(soldW, "a", "quill");
    expect(refused.players.get("a")?.heard).toBe(QUILL_HANG_NEED);
    expect(refused.stallDark).toBe(false);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: CLEARING_STALL.x, y: CLEARING_STALL.y, locked: true, beats: { ...emptyBeats(), hangAsk: true } });
    const g = applyHang(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(QUILL_HANG_SPECTATOR);
    expect(g.stallDark).toBe(false);
    expect(guestCanClaim(g.players.get("g")!)).toBe(false);
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

  it("winning House skims less tithe only after upkeep, never a strike", () => {
    expect(warTax(8, "mortals", { ...emptyWar(), winner: "mortals", titheCut: 2, tithePaid: true })).toBe(6);
    expect(warTax(8, "mortals", { ...emptyWar(), winner: "mortals", titheCut: 2, tithePaid: false })).toBe(8);
    expect(warTax(8, "sky", { ...emptyWar(), winner: "mortals", titheCut: 2, tithePaid: true })).toBe(8);
    const w = emptyWorld();
    w.war = { ...emptyWar(), winner: "mortals", titheCut: WAR_TITHE, omen: WAR_OMEN_KEEP, tithePaid: true };
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

  it("House tithe spends Bestand to arm the omen cut", () => {
    const w = emptyWorld();
    w.war = { ...emptyWar(), winner: "mortals", titheCut: WAR_TITHE, omen: WAR_OMEN_KEEP };
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      house: "mortals",
      beats: { ...emptyBeats(), hall: true, care: true },
      inCare: true,
      bestand: 4,
      x: HOUSE_HALL.x,
      y: HOUSE_HALL.y,
    });
    const poor = applyTithe(w, "a");
    expect(poor.war.tithePaid).toBe(false);
    expect(poor.players.get("a")?.heard).toBe(TITHE_NEED);

    w.players.set("a", { ...w.players.get("a")!, bestand: 20 });
    const paid = applyTithe(w, "a");
    expect(paid.war.tithePaid).toBe(true);
    expect(paid.players.get("a")?.bestand).toBe(20 - TITHE_COST);
    expect(paid.players.get("a")?.heard).toBe(TITHE_COPY);
    expect(paid.players.get("a")?.wink).toBe(WINK_WAR);
    expect(TITHE_COST).toBe(6);
    expect(damageFor(paid.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(paid.players.get("a")!)).toBe(false);

    const again = applyTithe(paid, "a");
    expect(again.players.get("a")?.heard).toBe(TITHE_HELD);
    expect(again.players.get("a")?.bestand).toBe(20 - TITHE_COST);

    const none = emptyWorld();
    none.players.set("a", { ...spawnGuest("a"), guest: false, house: "mortals", inCare: true, x: HOUSE_HALL.x, y: HOUSE_HALL.y, bestand: 20 });
    expect(applyTithe(none, "a").players.get("a")?.heard).toBe(TITHE_NONE);

    const wrong = emptyWorld();
    wrong.war = { ...emptyWar(), winner: "sky", titheCut: WAR_TITHE };
    wrong.players.set("a", { ...spawnGuest("a"), guest: false, house: "mortals", inCare: true, x: HOUSE_HALL.x, y: HOUSE_HALL.y, bestand: 20 });
    expect(applyTithe(wrong, "a").players.get("a")?.heard).toBe(TITHE_WRONG);

    const gWorld = emptyWorld();
    gWorld.war = { ...emptyWar(), winner: "mortals", titheCut: WAR_TITHE };
    gWorld.players.set("g", { ...spawnGuest("g"), x: HOUSE_HALL.x, y: HOUSE_HALL.y, bestand: 20 });
    const g = applyTithe(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(TITHE_SPECTATOR);
    expect(g.war.tithePaid).toBe(false);
    expect(g.players.get("g")?.bestand).toBe(20);
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
    expect(b.fakeWinke).toBe(0);
    expect(b.damaged).toBe(1);
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

  it("aura restore spends Bestand, un-dims Winke, never damage", () => {
    expect(visibleWink(false, WINK_SINK, 2)).toBe("");
    expect(visibleWink(false, WINK_SINK, AURA_DIM)).toBe(WINK_SINK);
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: 2,
      wink: WINK_SINK,
      bestand: 4,
      x: SHRINE.x,
      y: SHRINE.y,
    });
    const poor = applyRestore(w, "a");
    expect(poor.players.get("a")?.heard).toBe(RESTORE_NEED);
    expect(poor.players.get("a")?.aura).toBe(2);

    w.players.set("a", { ...poor.players.get("a")!, bestand: 20 });
    const paid = applyRestore(w, "a");
    const p = paid.players.get("a")!;
    expect(p.bestand).toBe(20 - RESTORE_COST);
    expect(p.aura).toBe(2 + RESTORE_GAIN);
    expect(p.heard).toBe(RESTORE_COPY);
    expect(p.wink).toBe(WINK_SINK);
    expect(visibleWink(false, p.wink, p.aura)).toBe(WINK_SINK);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const full = applyRestore({ ...paid, players: new Map([["a", { ...p, aura: 40, bestand: 40 }]]) }, "a");
    expect(full.players.get("a")?.heard).toBe(RESTORE_FULL);
    expect(full.players.get("a")?.bestand).toBe(40);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: SHRINE.x, y: SHRINE.y, bestand: 40 });
    const g = applyRestore(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(RESTORE_SPECTATOR);
    expect(g.players.get("g")?.aura).toBe(0);
    expect(guestCanClaim(g.players.get("g")!)).toBe(false);
  });

  it("insurance paper sinks Bestand and walks death to the shrine, never damage", () => {
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      x: SHRINE.x,
      y: SHRINE.y,
      bestand: 10,
    });
    const poor = applyInsure(w, "a");
    expect(poor.players.get("a")?.heard).toBe(INSURANCE_NEED);
    expect(poor.players.get("a")?.insured).toBe(false);

    w.players.set("a", { ...poor.players.get("a")!, bestand: 40 });
    const paid = applyInsure(w, "a");
    const p = paid.players.get("a")!;
    expect(p.bestand).toBe(40 - INSURANCE_COST);
    expect(p.insured).toBe(true);
    expect(p.heard).toBe(INSURANCE_COPY);
    expect(p.lastCareX).toBe(SHRINE.x);
    expect(p.lastCareY).toBe(SHRINE.y);
    expect(p.wink).toBe(WINK_SINK);
    expect(INSURANCE_COST).toBe(18);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const twice = applyInsure({ ...paid, players: new Map([["a", { ...p, bestand: 40 }]]) }, "a");
    expect(twice.players.get("a")?.heard).toBe(INSURANCE_HELD);
    expect(twice.players.get("a")?.bestand).toBe(40);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: SHRINE.x, y: SHRINE.y, bestand: 40 });
    const g = applyInsure(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(INSURANCE_SPECTATOR);
    expect(g.players.get("g")?.insured).toBe(false);
    expect(g.players.get("g")?.bestand).toBe(40);

    const fight = emptyWorld();
    fight.players.set("k", { ...spawnGuest("k"), guest: false, x: 200, y: 480 });
    fight.players.set("v", {
      ...spawnGuest("v"),
      guest: false,
      serial: TEST_SERIAL,
      x: 220,
      y: 480,
      hp: 20,
      aura: 12,
      bestand: 30,
      insured: true,
      lastCareX: SHRINE.x,
      lastCareY: SHRINE.y,
    });
    const dead = applyStrike(fight, "k");
    const v = dead.players.get("v")!;
    expect(v.hp).toBe(100);
    expect(v.x).toBe(SHRINE.x);
    expect(v.y).toBe(SHRINE.y);
    expect(v.insured).toBe(false);
    expect(v.aura).toBe(4);
    expect(v.heard).toBe(INSURANCE_USED);
    expect(damageFor(v)).toBe(damageFor(dead.players.get("k")!));

    const bare = emptyWorld();
    bare.players.set("k", { ...spawnGuest("k"), guest: false, x: 200, y: 480 });
    bare.players.set("v", {
      ...spawnGuest("v"),
      guest: false,
      x: 220,
      y: 480,
      hp: 20,
      aura: 12,
      insured: false,
    });
    const walked = applyStrike(bare, "k");
    const raw = walked.players.get("v")!;
    expect(raw.x).toBe(NAVE_SPAWN_X);
    expect(raw.y).toBe(NAVE_SPAWN_Y);
    expect(raw.hp).toBe(100);
    expect(raw.aura).toBe(4);
    expect(raw.heard).not.toBe(INSURANCE_USED);
  });

  it("death cracks remaining prints; Quill repairs them for Bestand, never cult", () => {
    const fight = emptyWorld();
    fight.players.set("k", { ...spawnGuest("k"), guest: false, x: 200, y: 480 });
    fight.players.set("v", {
      ...spawnGuest("v"),
      guest: false,
      x: 220,
      y: 480,
      hp: 20,
      fakeWinke: 2,
      cultWink: true,
      bestand: 30,
    });
    const dead = applyStrike(fight, "k");
    const v = dead.players.get("v")!;
    expect(v.fakeWinke).toBe(0);
    expect(v.damaged).toBe(2);
    expect(v.cultWink).toBe(true);

    const stall = emptyWorld();
    stall.players.set("a", {
      ...v,
      id: "a",
      x: CLEARING_STALL.x,
      y: CLEARING_STALL.y,
      bestand: 4,
    });
    const poor = applyRepair(stall, "a");
    expect(poor.players.get("a")?.heard).toBe(REPAIR_NEED);
    expect(poor.players.get("a")?.damaged).toBe(2);

    stall.players.set("a", { ...stall.players.get("a")!, bestand: 20 });
    const paid = applyRepair(stall, "a");
    const p = paid.players.get("a")!;
    expect(p.bestand).toBe(20 - REPAIR_COST);
    expect(p.damaged).toBe(1);
    expect(p.fakeWinke).toBe(1);
    expect(p.cultWink).toBe(true);
    expect(p.heard).toBe(REPAIR_COPY);
    expect(REPAIR_COST).toBe(7);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const none = applyRepair({ ...paid, players: new Map([["a", { ...p, damaged: 0, fakeWinke: 1, bestand: 20 }]]) }, "a");
    expect(none.players.get("a")?.heard).toBe(REPAIR_NONE);
    expect(none.players.get("a")?.bestand).toBe(20);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: CLEARING_STALL.x, y: CLEARING_STALL.y, damaged: 2, bestand: 20 });
    const g = applyRepair(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(REPAIR_SPECTATOR);
    expect(g.players.get("g")?.damaged).toBe(2);
    expect(g.players.get("g")?.bestand).toBe(20);
  });
});

describe("Desk Three clocks out", () => {
  it("named weather lets an Angel empty the desk; guests cannot", () => {
    const w = emptyWorld();
    const desk = w.clerks.find((c) => c.id === "clerk-desk-three")!;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      x: desk.x,
      y: desk.y,
    });
    const early = applyClockOut(w, "a");
    expect(early.players.get("a")?.heard).toBe(CLOCK_NEED);
    expect(early.clerks).toHaveLength(2);

    w.weatherNamed = true;
    const gone = applyClockOut(w, "a");
    const p = gone.players.get("a")!;
    expect(p.heard).toBe(CLOCK_OUT);
    expect(p.wink).toBe(WINK_CLOCK);
    expect(p.beats.clockOut).toBe(true);
    expect(gone.clerks.find((c) => c.id === "clerk-desk-three")).toBeUndefined();
    expect(gone.pois.find((poi) => poi.kind === "desk-empty")?.name).toBe("Desk Three — empty");
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const gWorld = emptyWorld();
    gWorld.weatherNamed = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: desk.x, y: desk.y, locked: true });
    const g = applyClockOut(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(CLOCK_SPECTATOR);
    expect(g.clerks).toHaveLength(2);
  });
});

describe("unmanned yield", () => {
  it("empty desks let an Angel rename Safety; guests cannot", () => {
    const w = emptyWorld();
    w.weatherNamed = true;
    w.annexHome = true;
    w.clerks = w.clerks.filter((c) => c.id !== "clerk-desk-three" && c.id !== "clerk-annex");
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), clockOut: true, annexHome: true },
      x: 192,
      y: 400,
    });
    const need = applyYieldEmpty(
      {
        ...emptyWorld(),
        players: new Map([
          [
            "a",
            {
              ...spawnGuest("a"),
              guest: false,
              x: 192,
              y: 400,
              beats: { ...emptyBeats(), clockOut: true },
            },
          ],
        ]),
      },
      "a",
    );
    expect(need.players.get("a")?.heard).toBe(YIELD_EMPTY_NEED);

    const named = applyRead(w, "a", "safety-plaque");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(YIELD_EMPTY);
    expect(p.wink).toBe(WINK_YIELD_EMPTY);
    expect(p.beats.yieldEmpty).toBe(true);
    expect(named.signs.find((s) => s.id === "safety-plaque")?.title).toBe(YIELD_EMPTY_PLAQUE.title);
    expect(named.pois.find((poi) => poi.kind === "yield-empty")?.name).toBe("Yield — unmanned");
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const gWorld = emptyWorld();
    gWorld.annexHome = true;
    gWorld.clerks = [];
    gWorld.players.set("g", { ...spawnGuest("g"), x: 192, y: 400, locked: true, beats: { ...emptyBeats(), clockOut: true } });
    expect(applyYieldEmpty(gWorld, "g").players.get("g")?.heard).toBe(YIELD_EMPTY_SPECTATOR);
  });
});

describe("The Strait is refused", () => {
  it("after the Foundry is dark, an Angel can shut the water; guests cannot", () => {
    const w = emptyWorld();
    w.m3Open = true;
    w.foundryDark = true;
    w.pois = [
      ...w.pois,
      { id: ORGAN_STRAIT.id, name: "The Strait", x: ORGAN_STRAIT.x, y: ORGAN_STRAIT.y, kind: "organ-strait" },
    ];
    w.signs = [...w.signs, ORGAN_PLAQUES.find((s) => s.id === ORGAN_STRAIT.id)!];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), foundryDark: true, foundry: true, m3: true },
      x: ORGAN_STRAIT.x,
      y: ORGAN_STRAIT.y,
    });
    const shut = applyRead(w, "a", ORGAN_STRAIT.id);
    const p = shut.players.get("a")!;
    expect(p.heard).toBe(STRAIT_REFUSE);
    expect(p.wink).toBe(WINK_STRAIT_REFUSE);
    expect(p.beats.straitRefuse).toBe(true);
    expect(shut.straitRefused).toBe(true);
    expect(shut.pois.find((poi) => poi.id === ORGAN_STRAIT.id)?.kind).toBe("organ-strait-refused");
    expect(shut.signs.find((s) => s.id === ORGAN_STRAIT.id)?.title).toBe(STRAIT_REFUSED_PLAQUE.title);
    expect(shut.gestell).toBeLessThan(w.gestell);
    expect(p.heard).not.toMatch(/heidegger|hormuz|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyRead(shut, "a", ORGAN_STRAIT.id).players.get("a")?.heard).toBe(STRAIT_REFUSED_LATER);

    const live = emptyWorld();
    live.m3Open = true;
    live.pois = [...w.pois];
    live.signs = [...w.signs];
    live.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), m3: true },
      x: ORGAN_STRAIT.x,
      y: ORGAN_STRAIT.y,
    });
    const early = applyStraitRefuse(live, "a");
    expect(early.players.get("a")?.heard).toBe(STRAIT_NEED_DARK);
    expect(early.straitRefused).toBe(false);

    const gWorld = emptyWorld();
    gWorld.m3Open = true;
    gWorld.foundryDark = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: ORGAN_STRAIT.x, y: ORGAN_STRAIT.y, locked: true });
    const g = applyStraitRefuse(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(STRAIT_SPECTATOR);
    expect(g.straitRefused).toBe(false);
  });
});

describe("House of Sky standing on the dark Cable", () => {
  it("Sky Angel names the dark line; other Houses and guests cannot", () => {
    const w = emptyWorld();
    w.m3Open = true;
    w.cableDark = true;
    w.pois = [
      ...w.pois,
      { id: ORGAN_CABLE.id, name: "The Cable — dark", x: ORGAN_CABLE.x, y: ORGAN_CABLE.y, kind: "organ-cable-dark" },
    ];
    w.signs = [...w.signs, { id: ORGAN_CABLE.id, title: "The Cable — dark", text: "Cut.", x: ORGAN_CABLE.x, y: ORGAN_CABLE.y }];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: 2,
      house: "sky",
      beats: { ...emptyBeats(), cableDark: true, hall: true, m3: true },
      x: ORGAN_CABLE.x,
      y: ORGAN_CABLE.y,
    });
    const named = applyRead(w, "a", ORGAN_CABLE.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(SKY_STANDING);
    expect(p.wink).toBe(WINK_SKY);
    expect(p.beats.skyStanding).toBe(true);
    expect(named.skyStanding).toBe(true);
    expect(named.standing.sky).toBe(1);
    expect(named.pois.find((poi) => poi.id === ORGAN_CABLE.id)?.kind).toBe("organ-cable-sky");
    expect(named.signs.find((s) => s.id === ORGAN_CABLE.id)?.title).toBe(SKY_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applySkyStanding(named, "a").players.get("a")?.heard).toBe(SKY_HELD);

    const mortals = emptyWorld();
    mortals.cableDark = true;
    mortals.players.set("m", {
      ...spawnGuest("m"),
      guest: false,
      house: "mortals",
      beats: { ...emptyBeats(), cableDark: true },
      x: ORGAN_CABLE.x,
      y: ORGAN_CABLE.y,
    });
    expect(applySkyStanding(mortals, "m").players.get("m")?.heard).toBe(SKY_WRONG);
    expect(applySkyStanding(mortals, "m").standing.sky).toBe(0);

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      house: "sky",
      x: ORGAN_CABLE.x,
      y: ORGAN_CABLE.y,
    });
    expect(applySkyStanding(early, "a").players.get("a")?.heard).toBe(SKY_NEED);

    const gWorld = emptyWorld();
    gWorld.cableDark = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: ORGAN_CABLE.x, y: ORGAN_CABLE.y, locked: true });
    expect(applySkyStanding(gWorld, "g").players.get("g")?.heard).toBe(SKY_SPECTATOR);
    expect(gWorld.skyStanding).toBe(false);
  });
});

describe("The Cable goes dark", () => {
  it("after the Strait is refused, an Angel can cut the Cable; guests cannot", () => {
    const w = emptyWorld();
    w.m3Open = true;
    w.straitRefused = true;
    w.pois = [
      ...w.pois,
      { id: ORGAN_CABLE.id, name: "The Cable", x: ORGAN_CABLE.x, y: ORGAN_CABLE.y, kind: "organ-cable" },
    ];
    w.signs = [...w.signs, ORGAN_PLAQUES.find((s) => s.id === ORGAN_CABLE.id)!];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), straitRefuse: true, m3: true },
      x: ORGAN_CABLE.x,
      y: ORGAN_CABLE.y,
    });
    const cut = applyRead(w, "a", ORGAN_CABLE.id);
    const p = cut.players.get("a")!;
    expect(p.heard).toBe(CABLE_DARK);
    expect(p.wink).toBe(WINK_CABLE_DARK);
    expect(p.beats.cableDark).toBe(true);
    expect(cut.cableDark).toBe(true);
    expect(cut.pois.find((poi) => poi.id === ORGAN_CABLE.id)?.kind).toBe("organ-cable-dark");
    expect(cut.signs.find((s) => s.id === ORGAN_CABLE.id)?.title).toBe(CABLE_DARK_PLAQUE.title);
    expect(cut.gestell).toBeLessThan(w.gestell);
    expect(p.heard).not.toMatch(/heidegger|hormuz|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyRead(cut, "a", ORGAN_CABLE.id).players.get("a")?.heard).toBe(CABLE_DARK_LATER);

    const live = emptyWorld();
    live.m3Open = true;
    live.pois = [...w.pois];
    live.signs = [...w.signs];
    live.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), m3: true },
      x: ORGAN_CABLE.x,
      y: ORGAN_CABLE.y,
    });
    const early = applyCableDark(live, "a");
    expect(early.players.get("a")?.heard).toBe(CABLE_NEED_STRAIT);
    expect(early.cableDark).toBe(false);

    const gWorld = emptyWorld();
    gWorld.m3Open = true;
    gWorld.straitRefused = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: ORGAN_CABLE.x, y: ORGAN_CABLE.y, locked: true });
    const g = applyCableDark(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(CABLE_DARK_SPECTATOR);
    expect(g.cableDark).toBe(false);
  });
});

describe("Nara buries the refused Strait", () => {
  it("sexton plus refused canal lets an Angel bury the organ; guests cannot", () => {
    const nara = NAVE_NPCS.find((n) => n.id === "nara")!;
    const w = emptyWorld();
    w.straitRefused = true;
    w.naraAtStrait = true;
    w.pois = [
      ...w.pois,
      {
        id: ORGAN_STRAIT.id,
        name: "The Strait — refused",
        x: ORGAN_STRAIT.x,
        y: ORGAN_STRAIT.y,
        kind: "organ-strait-refused",
      },
    ];
    w.signs = [...w.signs, { id: ORGAN_STRAIT.id, title: "The Strait — refused", text: "Shut.", x: ORGAN_STRAIT.x, y: ORGAN_STRAIT.y }];
    const at = liveNpcs(false, false, true).find((n) => n.id === "nara")!;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), garden: true, sexton: true, sextonAsk: true, straitRefuse: true, nara: true },
      cultWink: true,
      x: at.x,
      y: at.y,
    });
    const asked = applyTalk(w, "a", "nara");
    expect(asked.players.get("a")?.heard).toBe(NARA_CANAL_ASK);
    expect(asked.players.get("a")?.beats.canalAsk).toBe(true);
    const buried = applyTalk(asked, "a", "nara");
    const p = buried.players.get("a")!;
    expect(p.heard).toBe(NARA_CANAL);
    expect(p.wink).toBe(WINK_CANAL);
    expect(p.beats.canalBury).toBe(true);
    expect(buried.straitBuried).toBe(true);
    expect(buried.naraAtStrait).toBe(true);
    expect(buried.pois.find((poi) => poi.id === ORGAN_STRAIT.id)?.kind).toBe("organ-strait-buried");
    expect(buried.signs.find((s) => s.id === ORGAN_STRAIT.id)?.title).toBe(CANAL_PLAQUE.title);
    expect(liveNpcs(false, false, true, false, false, false, false, true).find((n) => n.id === "nara")?.role).toBe(
      "Burying the canal",
    );
    expect(p.heard).not.toMatch(/heidegger|hormuz|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyTalk(buried, "a", "nara").players.get("a")?.heard).toBe(NARA_CANAL_LATER);

    const live = emptyWorld();
    live.naraAtStrait = true;
    live.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), garden: true, sexton: true },
      x: nara.x,
      y: nara.y,
    });
    expect(applyTalk(live, "a", "nara").players.get("a")?.heard).not.toBe(NARA_CANAL_ASK);

    const gWorld = emptyWorld();
    gWorld.straitRefused = true;
    gWorld.players.set("g", {
      ...spawnGuest("g"),
      x: nara.x,
      y: nara.y,
      locked: true,
      beats: { ...emptyBeats(), garden: true, sexton: true },
    });
    const g = applyTalk(gWorld, "g", "nara");
    expect(g.players.get("g")?.heard).toBe(SEXTON_SPECTATOR);
    expect(g.straitBuried).toBe(false);
  });
});

describe("Quill unflags the Wet Grid", () => {
  it("after hanging cult, unflag ends spoils; guests cannot", () => {
    const quill = NAVE_NPCS.find((n) => n.id === "quill")!;
    const w = emptyWorld();
    w.stallDark = true;
    w.quillAtGrid = true;
    w.pois = w.pois.map((poi) => (poi.id === WET_GRID.id ? { ...poi } : poi));
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), hang: true, hangAsk: true, spot: true, market: true, hall: true },
      cultWink: true,
      flagged: true,
      x: quill.x,
      y: quill.y,
    });
    const atStreet = liveNpcs(false, false, false, true).find((n) => n.id === "quill")!;
    w.players.set("a", { ...w.players.get("a")!, x: atStreet.x, y: atStreet.y });
    const asked = applyTalk(w, "a", "quill");
    expect(asked.players.get("a")?.heard).toBe(QUILL_UNFLAG_ASK);
    expect(asked.players.get("a")?.beats.unflagAsk).toBe(true);
    expect(applyTalk(asked, "a", "quill").players.get("a")?.heard).toBe(QUILL_UNFLAG_WAIT);

    asked.players.set("a", { ...asked.players.get("a")!, x: WET_GRID.x, y: WET_GRID.y });
    const done = applyRead(asked, "a", WET_GRID.id);
    const p = done.players.get("a")!;
    expect(p.heard).toBe(UNFLAG_COPY);
    expect(p.wink).toBe(WINK_UNFLAG);
    expect(p.beats.unflag).toBe(true);
    expect(p.flagged).toBe(false);
    expect(done.wetCult).toBe(true);
    expect(done.pois.find((poi) => poi.id === WET_GRID.id)?.kind).toBe("wet-grid-cult");
    expect(done.signs.find((s) => s.id === WET_GRID.id)?.title).toBe(UNFLAG_PLAQUE.title);
    expect(liveNpcs(false, false, false, true, false, false, true).find((n) => n.id === "quill")?.role).toBe(
      "Keeping the street",
    );
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyFlag(done, "a").players.get("a")?.heard).toBe(FLAG_CULT);
    expect(applyFlag(done, "a").players.get("a")?.flagged).toBe(false);

    done.players.set("a", { ...p, x: atStreet.x, y: atStreet.y });
    expect(applyTalk(done, "a", "quill").players.get("a")?.heard).toBe(UNFLAG_LATER);

    const need = emptyWorld();
    need.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), unflagAsk: true },
      x: WET_GRID.x,
      y: WET_GRID.y,
    });
    expect(applyUnflag(need, "a").players.get("a")?.heard).toBe(UNFLAG_NEED);
    expect(applyUnflag(need, "a").wetCult).toBe(false);

    const gWorld = emptyWorld();
    gWorld.quillAtGrid = true;
    gWorld.players.set("g", {
      ...spawnGuest("g"),
      x: WET_GRID.x,
      y: WET_GRID.y,
      locked: true,
      beats: { ...emptyBeats(), unflagAsk: true, hang: true },
    });
    const g = applyUnflag(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(UNFLAG_SPECTATOR);
    expect(g.wetCult).toBe(false);
  });
});

describe("Ord witnesses the refused Strait", () => {
  it("after the canal is shut Ord walks there; guests cannot take him", () => {
    const ord = NAVE_NPCS.find((n) => n.id === "ord")!;
    const w = emptyWorld();
    w.straitRefused = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), straitRefuse: true, map: true },
      x: ord.x,
      y: ord.y,
    });
    const walked = applyTalk(w, "a", "ord");
    const p = walked.players.get("a")!;
    expect(p.heard).toBe(ORD_WITNESS);
    expect(p.wink).toBe(WINK_WITNESS);
    expect(p.beats.ordWitness).toBe(true);
    expect(walked.ordAtStrait).toBe(true);
    const moved = liveNpcs(false, false, false, false, false, true).find((n) => n.id === "ord")!;
    expect(moved.role).toBe("At the Strait");
    expect(moved.x).toBe(ORGAN_STRAIT.x);
    walked.players.set("a", { ...p, x: moved.x, y: moved.y });
    expect(applyTalk(walked, "a", "ord").players.get("a")?.heard).toBe(ORD_WITNESS_LATER);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const gWorld = emptyWorld();
    gWorld.straitRefused = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: ord.x, y: ord.y, locked: true });
    const g = applyTalk(gWorld, "g", "ord");
    expect(g.players.get("g")?.heard).toBe(ORD_WITNESS_SPECTATOR);
    expect(g.ordAtStrait).toBe(false);
  });
});

describe("Annex Runner comes in", () => {
  it("freeze lets an Angel send the runner inside; weather-named clock-out does not steal them", () => {
    const w = emptyWorld();
    const runner = w.clerks.find((c) => c.id === "clerk-annex")!;
    w.weatherNamed = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      x: runner.x,
      y: runner.y,
    });
    const weather = applyClockOut(w, "a");
    expect(weather.players.get("a")?.heard).toBe(ANNEX_NEED);
    expect(weather.clerks.find((c) => c.id === "clerk-annex")).toBeDefined();
    expect(weather.annexHome).toBe(false);

    w.frozen = true;
    const gone = applyClockOut(w, "a");
    const p = gone.players.get("a")!;
    expect(p.heard).toBe(ANNEX_HOME);
    expect(p.wink).toBe(WINK_ANNEX);
    expect(p.beats.annexHome).toBe(true);
    expect(gone.annexHome).toBe(true);
    expect(gone.frozen).toBe(true);
    expect(gone.clerks.find((c) => c.id === "clerk-annex")).toBeUndefined();
    expect(gone.clerks.find((c) => c.id === "clerk-desk-three")).toBeDefined();
    expect(gone.pois.find((poi) => poi.kind === "annex-route")?.name).toBe("Annex route — empty");
    expect(gone.pois.find((poi) => poi.id === SAFETY_ANNEX.id)?.kind).toBe("safety-annex-home");
    expect(gone.signs.find((s) => s.id === SAFETY_ANNEX.id)?.title).toBe(ANNEX_HOME_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|fetch quest|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    gone.players.set("a", { ...p, x: SAFETY_ANNEX.x, y: SAFETY_ANNEX.y });
    expect(applyAnnexHome(gone, "a").players.get("a")?.heard).toBe(ANNEX_GONE);

    const gWorld = emptyWorld();
    gWorld.frozen = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: runner.x, y: runner.y, locked: true });
    const g = applyClockOut(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(ANNEX_SPECTATOR);
    expect(g.clerks.find((c) => c.id === "clerk-annex")).toBeDefined();
    expect(g.annexHome).toBe(false);
  });
});

describe("Vesper unlights the Foundry", () => {
  it("Cold take then Foundry read lets an Angel unlight; Vesper walks; guests cannot", () => {
    const w = emptyWorld();
    w.m3Open = true;
    w.pois = [
      ...w.pois,
      { id: ORGAN_FOUNDRY.id, name: "The Foundry", x: ORGAN_FOUNDRY.x, y: ORGAN_FOUNDRY.y, kind: "organ-foundry" },
    ];
    w.signs = [...w.signs, ORGAN_PLAQUES.find((s) => s.id === ORGAN_FOUNDRY.id)!];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), hall: true, yield: true, cold: true, m3: true },
      current: "cold",
      x: OPERATOR_DESK.x,
      y: OPERATOR_DESK.y,
    });
    const early = applyOperator(w, "a", "hear");
    expect(early.players.get("a")?.heard).toBe(VESPER_NEED_FOUNDRY);
    expect(early.vesperAtFoundry).toBe(false);

    early.players.set("a", { ...early.players.get("a")!, x: ORGAN_FOUNDRY.x, y: ORGAN_FOUNDRY.y });
    const read = applyRead(early, "a", ORGAN_FOUNDRY.id);
    expect(read.players.get("a")?.beats.foundry).toBe(true);

    read.players.set("a", { ...read.players.get("a")!, x: OPERATOR_DESK.x, y: OPERATOR_DESK.y });
    const asked = applyOperator(read, "a", "hear");
    expect(asked.players.get("a")?.heard).toBe(VESPER_UNLIGHT_ASK);
    expect(asked.players.get("a")?.beats.foundryAsk).toBe(true);
    expect(asked.vesperAtFoundry).toBe(false);
    expect(applyOperator(asked, "a", "hear").players.get("a")?.heard).toBe(VESPER_UNLIGHT_WAIT);

    asked.players.set("a", { ...asked.players.get("a")!, x: ORGAN_FOUNDRY.x, y: ORGAN_FOUNDRY.y });
    const dark = applyRead(asked, "a", ORGAN_FOUNDRY.id);
    const p = dark.players.get("a")!;
    expect(p.heard).toBe(FOUNDRY_DARK_COPY);
    expect(p.wink).toBe(WINK_FOUNDRY_DARK);
    expect(p.beats.foundryDark).toBe(true);
    expect(dark.foundryDark).toBe(true);
    expect(dark.vesperAtFoundry).toBe(true);
    expect(dark.pois.find((poi) => poi.id === ORGAN_FOUNDRY.id)?.kind).toBe("organ-foundry-dark");
    expect(dark.pois.find((poi) => poi.id === OPERATOR_DESK.id)?.kind).toBe("operator-vacant");
    expect(dark.signs.find((s) => s.id === ORGAN_FOUNDRY.id)?.title).toBe(FOUNDRY_DARK_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|hormuz|hsinchu|palantir|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const moved = liveNpcs(false, false, false, false, true).find((n) => n.id === "vesper")!;
    expect(moved.name).toBe("Vesper Hale");
    expect(moved.role).toBe("At the Foundry");
    expect(moved.x).toBe(VESPER.x);
    dark.players.set("a", { ...p, x: moved.x, y: moved.y });
    expect(applyTalk(dark, "a", "vesper").players.get("a")?.heard).toBe(VESPER_FOUNDRY_LATER);

    dark.players.set("a", { ...p, x: OPERATOR_DESK.x, y: OPERATOR_DESK.y });
    expect(applyOperator(dark, "a", "hear").players.get("a")?.heard).toBe(OPERATOR_VACANT);
    dark.players.set("a", { ...p, x: ORGAN_FOUNDRY.x, y: ORGAN_FOUNDRY.y });
    expect(applyRead(dark, "a", ORGAN_FOUNDRY.id).players.get("a")?.heard).toBe(FOUNDRY_DARK_LATER);

    const refuseW = emptyWorld();
    refuseW.m3Open = true;
    refuseW.pois = [...w.pois];
    refuseW.signs = [...w.signs];
    refuseW.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), hall: true, yield: true, refuse: true, foundry: true, foundryAsk: true },
      x: ORGAN_FOUNDRY.x,
      y: ORGAN_FOUNDRY.y,
    });
    const refused = applyUnlight(refuseW, "a");
    expect(refused.players.get("a")?.heard).toBe(FOUNDRY_NEED_COLD);
    expect(refused.foundryDark).toBe(false);

    const gWorld = emptyWorld();
    gWorld.m3Open = true;
    gWorld.foundryDark = false;
    gWorld.players.set("g", {
      ...spawnGuest("g"),
      x: ORGAN_FOUNDRY.x,
      y: ORGAN_FOUNDRY.y,
      locked: true,
      beats: { ...emptyBeats(), foundryAsk: true, cold: true },
    });
    const g = applyUnlight(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(FOUNDRY_SPECTATOR);
    expect(g.vesperAtFoundry).toBe(false);
    expect(g.foundryDark).toBe(false);
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

