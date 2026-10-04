// The player-defect sweep (2026-10-04): six lenses (the hard rules, state shared between bodies, repeatable gains, save and
// restore, the dialogue graphs, the client against the server) hunted defects a player would meet, each reproduced through
// the real reducers and challenged by a skeptic. Each case here is one of them, held with the real content.
import { describe, expect, it } from "vitest";
import type { Ctx, Item, Player, WorldState, Wreckage } from "./types";
import { FLAG_NEWS_GAP, GESTELL_FAT, GESTELL_MELTDOWN, READINESS_KEEP } from "./constants";
import { weatherBand } from "./protocol";
import { GATES, POSITIONS, districtAt, gateOpenFor } from "./map";
import { C, F } from "./content/ids";
import { LINES, NPCS, POI_CONFIGS } from "./content";
import { SIDE_BY_ID, SIDE_PLACES, SQ, SF } from "./content/side";
import { verbsFor } from "./interact";
import { applyAction, unsealBody } from "./actions";
import { npcOffers, startQuest } from "./quests";
import { addItem } from "./economy";
import { emptyWorld, killPlayer, spawnGuest, tickWorld } from "./world";
import { DT } from "./constants";
import { framesFor, snapshotFor, stepViews } from "./snapshot";
import { applySlow, encodeFast, mergeFrames } from "./frames";

function body(w: WorldState, id: string, positionId: string, patch: Partial<Player> = {}, dx = 0): WorldState {
  const pos = POSITIONS[positionId];
  const players = new Map(w.players);
  const serial = 40 + players.size;
  players.set(id, { ...spawnGuest(id, w.now), guest: false, serial, name: `#00${serial}`, house: "earth", x: pos.x + dx, y: pos.y, district: districtAt(pos.x + dx, pos.y), flags: { [F.ANGEL]: 1 }, ...patch });
  return { ...w, players };
}
const me = (w: WorldState, id: string): Player => w.players.get(id)!;
const ctxOf = (w: WorldState, id: string): Ctx => ({ w, p: me(w, id), now: w.now });
const keys = (w: WorldState, id: string, place: string) => verbsFor(ctxOf(w, id), place).map(v => v.choice);
const act = (w: WorldState, id: string, targetId: string, choice: string) => applyAction(w, id, { t: "interact", targetId, choice });

describe("repeatable gains", () => {
  it("the trace is faced once: its readiness is paid once, and the place reads the same line after", () => {
    const lit = { ...emptyWorld(), gestell: 38 };
    let w = body(lit, "a", "last-god-trace", { winke: 2, aura: 60, movement: 3 });
    expect(keys(w, "a", "last-god-trace")).toEqual(["face"]);
    const before = me(w, "a").readiness;
    w = act(w, "a", "last-god-trace", "face");
    expect(me(w, "a").readiness).toBe(before + 2);
    expect(keys(w, "a", "last-god-trace"), "faced, the trace offers only its look").toEqual(["look"]);
    const again = act(w, "a", "last-god-trace", "face");
    expect(me(again, "a").readiness, "a second face pays nothing").toBe(before + 2);
    expect(me(act(w, "a", "last-god-trace", "look"), "a").heard).toContain("That is the whole visit.");
  });

  it("a fresh print merged into a decayed stack is averaged in, and a print decayed to nothing does not list", () => {
    const print = (value: number, qty = 1): Item => ({ id: "copy:wink", kind: "exhibition", name: "Printed Wink", qty, value });
    const p = addItem({ ...spawnGuest("p"), items: [print(0, 2)] }, print(9));
    expect(p.items[0]).toMatchObject({ qty: 3, value: 3 });
    let w = body(emptyWorld(), "a", "stall-1", { bestand: 20, items: [print(0)] });
    w = applyAction(w, "a", { t: "market", op: "list", itemId: "copy:wink", price: 50 });
    expect(w.market.listings ?? [], "nothing listed").toHaveLength(0);
    expect(me(w, "a").heard).toBe("That print has decayed to nothing. The stall does not list nothing.");
  });
});

describe("state shared between bodies", () => {
  it("another body's keep never takes the choice away: each body keeps a node once a cycle, and a spent node still answers E", () => {
    let w = body(emptyWorld(), "a", "nave-node-1");
    w = body(w, "b", "nave-node-1", {}, 4);
    w = act(w, "a", "nave-node-1", "keep");
    expect(keys(w, "b", "nave-node-1"), "b still has both keys").toEqual(["extract", "keep"]);
    expect(keys(w, "a", "nave-node-1"), "a has kept this one").toEqual(["extract"]);
    const r = me(w, "b").readiness;
    w = act(w, "b", "nave-node-1", "keep");
    expect(me(w, "b").readiness).toBe(r + READINESS_KEEP);
    expect(me(act(w, "a", "nave-node-1", "keep"), "a").heard).toBe(LINES.ALREADY);
    // drained by another: E stays and says so; Q keeps
    const drained = { ...w, nodes: w.nodes.map(n => (n.id === "nave-node-2" ? { ...n, charges: 0, kept: false, keptBy: "", keepers: [] } : n)) };
    const c = body(drained, "c", "nave-node-2");
    expect(keys(c, "c", "nave-node-2")).toEqual(["extract", "keep"]);
  });

  it("a freeze postpones extraction, not the choice: E answers the freeze's line, Q keeps", () => {
    let w = body({ ...emptyWorld(), frozen: { nave: 1800 } }, "g", "nave-node-1", { guest: true, serial: null, flags: {} });
    expect(keys(w, "g", "nave-node-1")).toEqual(["extract", "keep"]);
    expect(me(act(w, "g", "nave-node-1", "extract"), "g").heard).toBe(LINES.FROZEN);
    w = act(w, "g", "nave-node-1", "keep");
    expect(me(w, "g").kept).toBe(1);
  });

  it("a truce never reaches into a live ruin duel from outside it", () => {
    const at = POSITIONS["stall-3"];
    let w = body(emptyWorld(), "a", "stall-3", { flagged: true }, 40);
    w = body(w, "b", "stall-3", { flagged: true }, 0);
    w = body(w, "c", "stall-3", { flagged: true }, -40);
    const wreck: Wreckage = { id: "wreck-1", x: at.x, y: at.y, district: "wet", fromId: "x", fromName: "#0009", fromSerial: 9, killerId: "", at: 0, until: w.now + 600, buried: false, looted: false, bestand: 0, items: [] };
    w = { ...w, wreckage: [wreck] };
    w = act(w, "a", "b", "duel");
    w = act(w, "b", "a", "duel");
    expect(me(w, "b").duel?.accepted).toBe(true);
    expect(verbsFor(ctxOf(w, "c"), "b").map(v => v.choice), "no truce offered into the ring").not.toContain("truce");
    w = applyAction(w, "c", { t: "truce" });
    expect(me(w, "b")).toMatchObject({ flagged: true, truceUntil: 0 });
  });

  it("a duel is two bodies' or none: one left alone in it (a reload drops a restored body's duel) is freed on the next tick", () => {
    let w = body(emptyWorld(), "a", "stall-3", { flagged: true, duel: { with: "b", until: 60, accepted: true } });
    w = body(w, "b", "stall-3", { flagged: true }, 30); // b came back from its record: no duel
    w = tickWorld(w, DT);
    expect(me(w, "a").duel).toBeUndefined();
  });

  it("a duel offered to a body reaches that body's own view (the offer lives on the offerer's record), over the wire too, until it is answered", () => {
    let w = body(emptyWorld(), "a", "stall-3", { flagged: true }, 40);
    w = body(w, "b", "stall-3", { flagged: true }, 0);
    const at = POSITIONS["stall-3"];
    const wreck: Wreckage = { id: "wreck-1", x: at.x, y: at.y, district: "wet", fromId: "x", fromName: "#0009", fromSerial: 9, killerId: "", at: 0, until: w.now + 600, buried: false, looted: false, bestand: 0, items: [] };
    w = act({ ...w, wreckage: [wreck] }, "a", "b", "duel");
    const until = me(w, "a").duel!.until;
    expect(me(w, "b").duel, "the offered body's record carries nothing").toBeUndefined();
    expect(snapshotFor(w, "b").you.duelOffer).toEqual({ from: "a", until });
    expect(snapshotFor(w, "a").you.duelOffer).toBeUndefined();
    const step = stepViews(w);
    const frames = framesFor(w, "b", step);
    const wire = { fast: JSON.parse(encodeFast(frames.fast, step.frames)), slow: JSON.parse(JSON.stringify(frames.slow())) };
    expect(mergeFrames(applySlow({}, wire.slow), wire.fast).you.duelOffer).toEqual({ from: "a", until });
    w = act(w, "b", "a", "duel");
    expect(me(w, "b").duel?.accepted).toBe(true);
    expect(snapshotFor(w, "b").you.duelOffer, "answered, the offer is the duel").toBeUndefined();
  });

  it("the hour bell's news is the one strike's, and a flag makes the news once a while, not on every press", () => {
    let w = body(emptyWorld(), "a", "hour-bell", { movement: 3 });
    w = act(w, "a", "hour-bell", "strike");
    w = act(w, "a", "hour-bell", "strike");
    expect(w.news.filter(n => n.text === "The hour bell was struck on the Kerb.")).toHaveLength(1);
    let h = body(emptyWorld(), "f", "hot-street");
    for (let i = 0; i < 6; i++) h = applyAction(h, "f", { t: "flag" });
    expect(h.news.filter(n => n.text.includes("raised a flag")), "three raises, one line").toHaveLength(1);
    h = { ...h, now: h.now + FLAG_NEWS_GAP };
    h = applyAction(h, "f", { t: "flag" });
    expect(h.news.filter(n => n.text.includes("raised a flag")), "a raise after the gap is news again").toHaveLength(2);
  });

  it("the third altar's light and its news are the lighter's: a body whose step closes on another's light hears only the Wink", () => {
    const step = SIDE_BY_ID[SQ.THIRD_ALTAR].steps[1];
    const complete = (p: Partial<Player>) => (step.onComplete as (c: Ctx) => { kind: string }[])(ctxOf(body(emptyWorld(), "b", "crt-altar-3", p), "b")).map(e => e.kind);
    expect(complete({ flags: { [SF.ALTAR_LIT]: 1 } })).toEqual(["poi", "worldFlag", "news", "wink"]);
    expect(complete({})).toEqual(["wink"]);
  });

  it("the recorder is each body's own: another's copper leaves both keys to the next, and Another night follows one's own voice", () => {
    let w = body(emptyWorld(), "a", "memorial-recorder", { flags: { [F.ANGEL]: 1, [F.TALKED_NARA]: 1, [F.HEARD_RECORDER]: 1 } });
    w = body(w, "b", "memorial-recorder", { flags: { [F.ANGEL]: 1, [F.TALKED_NARA]: 1, [F.HEARD_RECORDER]: 1 } }, 4);
    w = act(w, "a", "memorial-recorder", "copper");
    expect(keys(w, "b", "memorial-recorder")).toEqual(expect.arrayContaining(["copper", "voice"]));
    expect(me(act(w, "b", "memorial-recorder", "listen"), "b").heard).toContain("somebody keeps it running");
    w = act(w, "b", "memorial-recorder", "voice");
    const night = SIDE_BY_ID[SQ.ANOTHER_NIGHT];
    const buried = (id: string) => ({ ...ctxOf(w, id), p: { ...me(w, id), flags: { ...me(w, id).flags, [F.BURIED_NARA]: 1 } } });
    expect(night.available(buried("a")), "the copper's taker is never handed the voice's hour").toBe(false);
    expect(night.available(buried("b"))).toBe(true);
  });
});

describe("the hard rules", () => {
  it("the weather's band turns where its rules do: 90.5 reads fat while the street is not flagged, 91 reads meltdown and it is", () => {
    for (const g of [30, 30.5, 70.5, 70.99, 71, 90.5, 90.99, 91, 95.2]) {
      expect(weatherBand(g) === "meltdown", `${g}`).toBe(g >= GESTELL_MELTDOWN);
      expect(weatherBand(g) === "fat" || weatherBand(g) === "meltdown", `${g}`).toBe(g >= GESTELL_FAT);
    }
    const street = (gestell: number) => {
      let w = body({ ...emptyWorld(), gestell }, "a", "stall-3", {}, 0);
      w = body(w, "b", "stall-3", {}, 20);
      w = applyAction(w, "a", { t: "strike" });
      return { weather: snapshotFor(w, "a").weather, hp: me(w, "b").hp };
    };
    expect(street(90.5)).toMatchObject({ weather: "Fat weather", hp: me(body(emptyWorld(), "b", "stall-3"), "b").hp });
    const hot = street(91);
    expect(hot.weather).toBe("Meltdown weather");
    expect(hot.hp, "at the rule's line an unflagged strike on the wet street lands").toBeLessThan(me(body(emptyWorld(), "b", "stall-3"), "b").hp);
  });

  it("a guest's fall leaves a body to bury and nothing to take", () => {
    const print: Item = { id: "copy:face", kind: "exhibition", name: "Print of your face", qty: 1, value: 9 };
    let w = body(emptyWorld(), "g", "hot-street", { guest: true, serial: null, flags: {}, bestand: 24, items: [print] });
    w = killPlayer(w, "g", "cold-desk-1", "test");
    const wreck = w.wreckage.find(r => r.fromId === "g")!;
    expect(wreck).toMatchObject({ bestand: 0, items: [] });
    expect(me(w, "g").bestand).toBe(24);
  });

  it("a locked guest is handed no hour, starts none, and changes nothing it presses; its side hours stand", () => {
    let w = body(emptyWorld(), "g", "shrine-1", { guest: true, serial: null, flags: {}, locked: true, quests: { [SQ.THIRD_ALTAR]: 0 } });
    expect(startQuest(w, "g", SQ.CENSUS).players.get("g")!.quests[SQ.CENSUS]).toBeUndefined();
    for (const npc of Object.values(NPCS)) expect(npcOffers(ctxOf(w, "g"), npc), `${npc.id} offers nothing to a locked guest`).toBe(false);
    // its side hour does not move, whatever it presses
    w = body(w, "g", "crt-altar-1", { guest: true, serial: null, flags: {}, locked: true, quests: { [SQ.THIRD_ALTAR]: 0 } });
    w = act(w, "g", "crt-altar-1", "side:altar:count");
    expect(me(tickWorld(w, DT), "g").quests[SQ.THIRD_ALTAR]).toBe(0);
    // a press that would change the city answers with the lock; a reading still reads
    const ready = { guest: true, serial: null, flags: { [F.TALKED_NARA]: 1, [F.HEARD_RECORDER]: 1 }, locked: true };
    let r = body(emptyWorld(), "g", "memorial-recorder", ready);
    r = act(r, "g", "memorial-recorder", "copper");
    expect(me(r, "g").heard).toBe(LINES.GUEST_LOCK);
    expect(r.pois["memorial-recorder"].state, "the recorder untouched").not.toBe("dismantled");
    expect(me(act(r, "g", "memorial-recorder", "listen"), "g").heard).toContain("A woman's voice, on a loop.");
    // an Angel's hour is never started for a guest by any door
    const g2 = body(emptyWorld(), "h", "shrine-1", { guest: true, serial: null, flags: {} });
    expect(startQuest(g2, "h", SQ.VAULT).players.get("h")!.quests[SQ.VAULT]).toBeUndefined();
  });

  it("an Angel's body unsealed (its serial linked in another body) is a locked guest at the threshold, its progress kept, and no guest passes the Care's or the Organs' doors whatever its flags", () => {
    const angel: Player = { ...spawnGuest("a"), guest: false, serial: 42, name: "#0042", house: "sky", messenger: "witness", movement: 3, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.M3]: 1 }, quests: { m3: 2 } };
    const u = unsealBody(angel, 10);
    expect(u).toMatchObject({ guest: true, serial: null, house: "", messenger: "", locked: true, movement: 3, district: "nave", heard: LINES.LINK_MOVED });
    expect(u.quests.m3).toBe(2);
    expect(u.flags[F.ANGEL]).toBeUndefined();
    for (const g of GATES.filter(g => g.requires === "under" || g.requires === "m3")) expect(gateOpenFor(u, g), g.id).toBe(false);
    expect(Object.keys(POI_CONFIGS).length).toBeGreaterThan(0);
  });
});

describe("the dialogue against the shared world", () => {
  it("another body's census walks Corvin Slate to the Ring, but an Angel's corridor beat still finds him in the Annex, and he thanks only the counter", () => {
    let w = body(emptyWorld(), "a", "home:officer", { movement: 2, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.HALL]: 1 } });
    w = { ...w, npcs: { ...w.npcs, officer: { ...w.npcs.officer, state: "ring", x: SIDE_PLACES["officer-ring"].x, y: SIDE_PLACES["officer-ring"].y, district: "ring" } } };
    const view = NPCS.officer.personal!(ctxOf(w, "a"), w.npcs.officer);
    expect(view, "the corridor beat keeps him in the Annex for this body").toMatchObject({ state: "home", district: "annex" });
    expect(NPCS.officer.entry(ctxOf(w, "a"))).toBe("corridor");
    // a body past the corridor sees him where the census walked him, and is not told its count was right
    const later = body(w, "b", "shrine-2", { movement: 2, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.HALL]: 1, [F.TALKED_OFFICER]: 1, [SF.OFFICER_MET]: 1 } });
    const hub = NPCS.officer.nodes.hub.text as (c: Ctx) => string;
    expect(hub(ctxOf(later, "b"))).toContain("Somebody counted them for Safety.");
    const counter = { ...ctxOf(later, "b"), p: { ...me(later, "b"), quests: { [SQ.CENSUS]: SIDE_BY_ID[SQ.CENSUS].steps.length } } };
    expect(hub(counter)).toContain("Your count was right.");
  });
});
