// The player-defect sweep, round two (2026-10-04): six new lenses (enemies and the body in a fight, the shared systems,
// the money paths, the side hours in a shared world, the client's input and panels, time at its edges), each finding
// reproduced through the real reducers and challenged by a skeptic. Each case here is one of them, held with the real content.
import { describe, expect, it } from "vitest";
import type { Enemy, Player, WorldState, Wreckage } from "./types";
import { DT, WAR_HOLD } from "./constants";
import { POSITIONS, TILE, districtAt } from "./map";
import { emptyWorld, killPlayer, spawnGuest, tickWorld } from "./world";
import { tickEnemies } from "./combat";
import { tickHouseWar } from "./houses";
import { applyAction } from "./actions";
import { verbsFor } from "./interact";
import { npcOffers } from "./quests";
import { F } from "./content/ids";
import { LINES, NPCS } from "./content";
import { SF, SIDE_BY_ID, SIDE_PLACES, SQ } from "./content/side";

function body(w: WorldState, id: string, x: number, y: number, patch: Partial<Player> = {}): WorldState {
  const players = new Map(w.players);
  const serial = 40 + players.size;
  players.set(id, { ...spawnGuest(id, w.now), guest: false, serial, name: `#00${serial}`, house: "earth", x, y, district: districtAt(x, y), ...patch });
  return { ...w, players };
}
const me = (w: WorldState, id: string): Player => w.players.get(id)!;
const enemy = (w: WorldState, id: string): Enemy => w.enemies.find(e => e.id === id)!;
const setEnemy = (w: WorldState, id: string, patch: Partial<Enemy>): WorldState => ({ ...w, enemies: w.enemies.map(e => (e.id === id ? { ...e, ...patch } : e)) });
const ticks = (w: WorldState, seconds: number): WorldState => {
  let cur = w;
  for (let i = 0; i < Math.round(seconds / DT); i++) cur = tickWorld(cur, DT);
  return cur;
};

describe("enemies and the body in a fight", () => {
  it("a walk home that a wall stops ends with the enemy set down whole at its post, not blind in `return` for good", () => {
    // Desk Three's own row has a pillar two tiles east of its desk: leashed east of it, the straight walk home stops there.
    const home = enemy(emptyWorld(), "desk-three").home;
    let w = setEnemy(emptyWorld(), "desk-three", { x: 24.35 * TILE, y: 38.5 * TILE, state: "return", t: 0, targetId: "", hp: 60 });
    w = ticks(w, 31);
    expect(enemy(w, "desk-three")).toMatchObject({ x: home.x, y: home.y, state: "idle", hp: enemy(emptyWorld(), "desk-three").maxHp, targetId: "" });
  });

  it("a body an enemy fells is let go: the enemy that felled it and every other on it walk back, and nobody is chased into the Care", () => {
    const desk = enemy(emptyWorld(), "enforcer-1");
    let w = body(emptyWorld(), "a", desk.home.x + 30, desk.home.y, { hp: 5, flagged: false });
    // Both cold desks on the same body; the first swings now.
    w = setEnemy(w, "enforcer-1", { state: "telegraph", t: 0.01, targetId: "a" });
    w = setEnemy(w, "enforcer-2", { state: "aggro", t: 0, targetId: "a" });
    w = tickEnemies(w, DT);
    expect(me(w, "a").deaths, "the swing felled it").toBe(1);
    expect(enemy(w, "enforcer-1").targetId).toBe("");
    expect(enemy(w, "enforcer-2").targetId, "the other desk lets it go in the same tick").toBe("");
    w = ticks(w, 40);
    for (const id of ["enforcer-1", "enforcer-2"]) {
      const e = enemy(w, id);
      expect(e.state, id).toBe("idle");
      expect(Math.hypot(e.x - e.home.x, e.y - e.home.y), `${id} is back at its post`).toBeLessThan(5);
    }
  });

  it("any fall ends a live ruin duel for both bodies, an enemy's included", () => {
    const at = POSITIONS["stall-3"];
    let w = body(emptyWorld(), "a", at.x, at.y, { flagged: true, duel: { with: "b", until: 60, accepted: true } });
    w = body(w, "b", at.x + 30, at.y, { flagged: true, duel: { with: "a", until: 60, accepted: true } });
    w = killPlayer(w, "a", "enforcer-2", "Cold desk · two did their job.");
    expect(me(w, "a").duel).toBeUndefined();
    expect(me(w, "b").duel, "the partner is free the moment the ring is one body").toBeUndefined();
  });
});

describe("the shared systems", () => {
  it("the omen's notice names where the House held, as the news does: the windows alternate between the ring and the hot street", () => {
    let w = emptyWorld();
    // the second window is at the hot street
    w = { ...w, houses: { ...w.houses, war: { ...w.houses.war, site: "hot-street", startsAt: w.now } } };
    const street = POSITIONS["hot-street"];
    w = body(w, "e", street.x, street.y, { house: "earth" });
    w = tickHouseWar(w, DT);
    w = tickHouseWar({ ...w, now: w.now + WAR_HOLD / 2 }, WAR_HOLD / 2);
    w = tickHouseWar({ ...w, now: w.now + WAR_HOLD }, DT);
    expect(w.news.map(n => n.text)).toContain("House of Earth held the hot street. Standing and an omen. Not a bigger stick.");
    expect(me(w, "e").notices.map(n => n.text)).toContain("Your House held the hot street. Tithe eases while the omen lasts.");
  });
});

describe("the money paths", () => {
  it("a wreckage the body can no longer see is neither looted nor buried by its id", () => {
    const at = POSITIONS["stall-1"];
    let w = body(emptyWorld(), "v", at.x, at.y, { bestand: 100 });
    w = body(w, "a", at.x + 10, at.y, { house: "earth" });
    w = killPlayer(w, "v", "enforcer-1", "Cold desk · one did their job.");
    const wreck = w.wreckage.find(r => r.fromId === "v")!;
    expect(wreck.bestand).toBe(30);
    const late = { ...w, now: wreck.until + 20 };
    expect(verbsFor({ w: late, p: me(late, "a"), now: late.now }, wreck.id), "the prompt offers nothing past its hour").toEqual([]);
    const looted = applyAction(late, "a", { t: "interact", targetId: wreck.id, choice: "loot" });
    expect(me(looted, "a").bestand).toBe(me(late, "a").bestand);
    const buried = applyAction(late, "a", { t: "interact", targetId: wreck.id, choice: "bury" });
    expect(buried.wreckage.find(r => r.id === wreck.id)?.buried).toBe(false);
    // in its hour the same press loots
    expect(me(applyAction(w, "a", { t: "interact", targetId: wreck.id, choice: "loot" }), "a").bestand).toBe(me(w, "a").bestand + 30);
  });

  it("the clinic and the shrine sell nothing that would do nothing: no repair to a whole body, no second insurance, no aura past full", () => {
    const clinic = POSITIONS["clinic"];
    const shrine = POSITIONS["care-shrine"];
    const keysAt = (w: WorldState, place: string) => verbsFor({ w, p: me(w, "a"), now: w.now }, place).map(v => v.choice);
    let w = body(emptyWorld(), "a", clinic.x, clinic.y, { bestand: 30, hp: 100 });
    expect(keysAt(w, "clinic")).toEqual(["insure"]);
    w = applyAction(w, "a", { t: "interact", targetId: "clinic", choice: "insure" });
    expect(me(w, "a")).toMatchObject({ insured: true, bestand: 20 });
    expect(keysAt(w, "clinic"), "insured, a second paper is not sold").toEqual([]);
    const again = applyAction(w, "a", { t: "interact", targetId: "clinic", choice: "insure" });
    expect(me(again, "a").bestand, "a press of the hidden verb costs nothing").toBe(20);
    const hurt = body(emptyWorld(), "a", clinic.x, clinic.y, { bestand: 30, hp: 40 });
    expect(keysAt(hurt, "clinic")).toEqual(["repair", "insure"]);
    const full = body(emptyWorld(), "a", shrine.x, shrine.y, { bestand: 30, aura: 100 });
    expect(keysAt(full, "care-shrine")).not.toContain("restore");
    expect(keysAt({ ...full, players: new Map([["a", { ...me(full, "a"), aura: 40 }]]) }, "care-shrine")).toContain("restore");
  });
});

describe("the side hours in a shared world", () => {
  const angelAt = (w: WorldState, id: string, place: string, patch: Partial<Player> = {}) => {
    const pos = POSITIONS[place] ?? SIDE_PLACES[place];
    return body(w, id, pos.x, pos.y, { movement: 3, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, ...(patch.flags ?? {}) }, ...patch, ...(patch.flags ? { flags: { [F.ANGEL]: 1, [F.UNDER]: 1, ...patch.flags } } : {}) });
  };
  const stepOf = (quest: string, stepId: string) => SIDE_BY_ID[quest].steps.findIndex(s => s.id === stepId);

  it("a step that closes on another body's act (the lit lamp, the rung bell, the seeded ground) posts no news and stamps nothing: the act is the actor's", () => {
    for (const [quest, stepId, poiId, state, news] of [
      [SQ.LAMP, "light", "hall-mortals", "lit", "Someone lit the Mortals lamp"],
      [SQ.MUTE, "hang", "mute-bell", "rung", "The mute bell rang once"],
      [SQ.SEED, "turn", "seed-1", "seeded", "Someone turned garden earth"],
    ] as const) {
      let w = emptyWorld();
      w = { ...w, pois: { ...w.pois, [poiId]: { state, by: "x", at: 0, count: 1 } } };
      w = angelAt(w, "b", "shrine-1", { quests: { [quest]: stepOf(quest, stepId) } });
      const before = w.pois[poiId];
      w = tickWorld(w, DT);
      expect(me(w, "b").quests[quest], `${quest}: the step closed on its own`).toBeGreaterThan(stepOf(quest, stepId));
      expect(w.news.some(n => n.text.startsWith(news)), `${quest}: no news for an act the body did not do`).toBe(false);
      expect(w.pois[poiId], `${quest}: the place keeps its own stamp`).toEqual(before);
    }
  });

  it("Movement I's Quill keeps her stall and Movement II's Pim his wake, wherever another body's hour walked them", () => {
    let w = emptyWorld();
    w = { ...w, npcs: { ...w.npcs, quill: { ...w.npcs.quill, state: "board" }, sexton: { ...w.npcs.sexton, state: "garden" } } };
    const guestPos = POSITIONS["home:quill"];
    w = body(w, "g", guestPos.x, guestPos.y, { guest: true, serial: null, flags: {} });
    const quill = NPCS.quill.personal!({ w, p: me(w, "g"), now: w.now }, w.npcs.quill);
    expect(quill).toMatchObject({ state: "home", x: guestPos.x, y: guestPos.y });
    w = angelAt(w, "a", "care-shrine", { movement: 2 });
    const pim = NPCS.sexton.personal!({ w, p: me(w, "a"), now: w.now }, w.npcs.sexton);
    expect(pim).toMatchObject({ state: "home", district: "care" });
    // an Angel not yet under is handed nothing by the man behind the Care's door
    w = body(w, "m", guestPos.x, guestPos.y, { flags: { [F.ANGEL]: 1 }, movement: 1 });
    expect(npcOffers({ w, p: me(w, "m"), now: w.now }, NPCS.sexton)).toBe(false);
  });

  it("a locked guest's side hour stands, and the place does not tell it the hour's act was done", () => {
    const altar = POSITIONS["crt-altar-3"];
    let w = body(emptyWorld(), "g", altar.x, altar.y, { guest: true, serial: null, flags: {}, locked: true, quests: { [SQ.THIRD_ALTAR]: 1 } });
    expect(verbsFor({ w, p: me(w, "g"), now: w.now }, "crt-altar-3").map(v => v.choice)).not.toContain("side:altar:light");
    w = applyAction(w, "g", { t: "interact", targetId: "crt-altar-3", choice: "side:altar:light" });
    expect(me(w, "g").heard).toBe(LINES.GUEST_LOCK);
    expect(me(w, "g").flags[SF.ALTAR_LIT]).toBeUndefined();
  });
});

describe("what the prompt offers against what the server does", () => {
  it("T is offered on the body a truce would be called with, never on another the prompt names first", () => {
    const at = POSITIONS["stall-3"];
    let w = body(emptyWorld(), "a", at.x, at.y, { flagged: true });
    w = body(w, "b", at.x + 40, at.y, { flagged: true });
    w = body(w, "c", at.x + 20, at.y, { flagged: true });
    const offered = (target: string) => verbsFor({ w, p: me(w, "a"), now: w.now }, target).map(v => v.choice);
    expect(offered("b"), "b is not the truce's body").not.toContain("truce");
    expect(offered("c")).toContain("truce");
    const after = applyAction(w, "a", { t: "truce" });
    expect(me(after, "c").flagged, "the truce lands on the body the prompt named").toBe(false);
    expect(me(after, "b").flagged).toBe(true);
  });
});

describe("time at its edges", () => {
  it("an answered duel's fall is the duel's for its sixty seconds, even after its grave's own hour", () => {
    const at = POSITIONS["stall-3"];
    let w = { ...emptyWorld(), now: 50 };
    w = body(w, "k", at.x, at.y, { flagged: true, duel: { with: "v", until: 100, accepted: true } });
    w = body(w, "v", at.x + 20, at.y, { flagged: true, hp: 10, duel: { with: "k", until: 100, accepted: true } });
    w = body(w, "s", at.x - 60, at.y, { flagged: false });
    const grave: Wreckage = { id: "old", x: at.x + 10, y: at.y, district: "wet", fromId: "z", fromName: "#0009", fromSerial: 9, killerId: "", at: 0, until: 45, buried: false, looted: false, bestand: 0, items: [] };
    w = { ...w, wreckage: [grave] };
    const aura = me(w, "s").aura;
    w = applyAction(w, "k", { t: "strike" });
    expect(me(w, "v").deaths).toBe(1);
    expect(me(w, "k").heard).toContain("A ruin duel. The grave is the ring.");
    expect(me(w, "s").aura, "the watcher is paid").toBeGreaterThan(aura);
  });
});
