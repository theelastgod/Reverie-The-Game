// The player-defect sweep, round five (2026-10-05): death and the wreckage, the Houses, the first ten minutes, the side
// hours' lines against their effects, saved records, and the object under interleavings. Each case is one finding,
// reproduced through the real reducers and held with the real content.
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { NPC_HOMES, POSITIONS, circleHitsWalls, districtAt } from "./map";
import { BODY_R } from "./constants";
import { emptyWorld, killPlayer, rebindBody, spawnGuest, tickWorld } from "./world";
import { verbsFor } from "./interact";
import { F, Q } from "./content/ids";
import { questById } from "./quests";
import { NPCS } from "./content";
import { LINES } from "./content";
import { DT, TEST_SERIAL } from "./constants";
import { applyAction } from "./actions";
import { houseFor } from "./identity";
import { SIDE, SIDE_PLACES, SQ } from "./content/side";
import type { Ctx, Effect } from "./types";

function body(w: WorldState, id: string, patch: Partial<Player> = {}): WorldState {
  const players = new Map(w.players);
  const serial = 40 + players.size;
  players.set(id, { ...spawnGuest(id, w.now), guest: false, serial, name: `#00${serial}`, house: "earth", ...patch });
  return { ...w, players };
}

describe("saved records and the wallet's restore", () => {
  it("moves every reference the city holds to a body from its old id to its new one, and no other", () => {
    let w = body(emptyWorld(), "new");
    w = body(w, "other", { duel: { with: "old", until: 50, accepted: false }, lastKillId: "old" });
    const item = { id: "copy:1", kind: "exhibition" as const, name: "A copy", value: 20, qty: 1 };
    w = {
      ...w,
      market: [{ id: "listing:old:5:1", sellerId: "old", sellerName: "#0042", item, price: 20, at: 5 }, { id: "listing:x:1:1", sellerId: "x", sellerName: "#0007", item, price: 9, at: 1 }],
      nodes: w.nodes.map((n, i) => (i === 0 ? { ...n, kept: true, keptBy: "old", keepers: ["old", "x"] } : n)),
      wreckage: [{ id: "wreck:old:1", x: 0, y: 0, district: districtAt(0, 0), fromId: "old", fromName: "#0042", fromSerial: 42, killerId: "x", at: 0, until: 90, buried: false, looted: false, bestand: 5, items: [], fromHistory: { passings: 0, buried: 0, looted: 0 } } as never],
      enemies: w.enemies.map((e, i) => (i === 0 ? { ...e, targetId: "old", participants: ["old", "x"] } : e)),
      graves: [{ id: "g", x: 0, y: 0, district: districtAt(0, 0), name: "n", by: "old", at: 0, until: 9 }],
      pois: { ...w.pois, "nave-plot": { state: "dug", by: "old", at: 1, count: 1 } },
      clearing: { ...w.clearing, contest: { active: true, keep: 1, extract: 0, endsAt: 60, votes: { old: "keep" } } },
      passing: { ...w.passing, lastBy: "old" },
    };
    const out = rebindBody(w, "old", "new");
    expect(out.market.map(l => l.sellerId)).toEqual(["new", "x"]);
    expect(out.nodes[0].keptBy).toBe("new");
    expect(out.nodes[0].keepers).toEqual(["new", "x"]);
    expect(out.wreckage[0].fromId).toBe("new");
    expect(out.wreckage[0].killerId).toBe("x");
    expect(out.enemies[0].targetId).toBe("new");
    expect(out.enemies[0].participants).toEqual(["new", "x"]);
    expect(out.graves[0].by).toBe("new");
    expect(out.pois["nave-plot"].by).toBe("new");
    expect(out.clearing.contest?.votes).toEqual({ new: "keep" });
    expect(out.passing.lastBy).toBe("new");
    expect(out.players.get("other")?.duel?.with).toBe("new");
    expect(out.players.get("other")?.lastKillId).toBe("new");
    // the rest of the city is the same objects
    expect(out.nodes[1]).toBe(w.nodes[1]);
    expect(rebindBody(w, "old", "old")).toBe(w);
  });
});

describe("the Houses", () => {
  const serialOf = (house: string): number => { for (let n = 1; n < 50; n++) if (houseFor(n) === house) return n; throw new Error(house); };

  it("an Angel wakes at its own hall once it has read it, and at the shrine again once it rests there (PROMPT §8.2)", () => {
    for (const house of ["mortals", "sky", "divinities", "earth"] as const) {
      const hall = POSITIONS[`hall-${house}`];
      expect(circleHitsWalls(hall.x, hall.y, BODY_R), `${house}: the hall is ground a body can stand on`).toBe(false);
      let w = body(emptyWorld(), "a", { serial: serialOf(house), house, x: hall.x, y: hall.y + 10, district: districtAt(hall.x, hall.y + 10), flags: { under: 1, m3: 1 } });
      w = applyAction(w, "a", { t: "interact", targetId: `hall-${house}`, choice: "read" });
      expect(w.players.get("a")!.respawn, house).toMatchObject({ x: hall.x, y: hall.y, district: hall.district });
      w = killPlayer(w, "a", "x", "gone");
      expect(w.players.get("a")!, house).toMatchObject({ x: hall.x, y: hall.y, district: hall.district, dead: false });
    }
    const shrine = POSITIONS["care-shrine"];
    let w = body(emptyWorld(), "b", { serial: serialOf("mortals"), house: "mortals", respawn: { x: 1, y: 1, district: "care" }, x: shrine.x, y: shrine.y + 10, district: districtAt(shrine.x, shrine.y + 10), flags: { under: 1 } });
    w = applyAction(w, "b", { t: "interact", targetId: "care-shrine", choice: "rest" });
    expect(w.players.get("b")!.respawn).toMatchObject({ x: shrine.x, y: shrine.y });
  });

  it("the bounty's refusals name its real gate: standing, then a purse a war's span; never an omen", () => {
    const hall = POSITIONS["hall-mortals"];
    let w = body(emptyWorld(), "a", { serial: serialOf("mortals"), house: "mortals", x: hall.x, y: hall.y + 10, district: districtAt(hall.x, hall.y + 10), flags: { under: 1 }, bestand: 40 });
    w = { ...w, houses: { ...w.houses, tithe: 20 } };
    w = applyAction(w, "a", { t: "interact", targetId: "hall-mortals", choice: "read" });
    w = applyAction(w, "a", { t: "interact", targetId: "hall-mortals", choice: "bounty" });
    expect(w.players.get("a")!.heard).toBe("Your House has no standing here yet. Tithe, or hold a site.");
    w = applyAction(w, "a", { t: "interact", targetId: "hall-mortals", choice: "tithe" });
    w = applyAction(w, "a", { t: "interact", targetId: "hall-mortals", choice: "bounty" });
    w = applyAction(w, "a", { t: "interact", targetId: "hall-mortals", choice: "bounty" });
    expect(w.players.get("a")!.heard).toBe("The bounty already paid. One purse a war's span.");
    expect(w.players.get("a")!.heard).not.toMatch(/omen/i);
  });
});

describe("death and the wreckage", () => {
  const ticks = (w: WorldState, n: number): WorldState => { let cur = w; for (let i = 0; i < n; i++) cur = tickWorld(cur, DT); return cur; };

  it("the body that fell is offered no Loot on its own wreckage; another Angel is", () => {
    const at = POSITIONS["stall-1"];
    let w = body(emptyWorld(), "v", { x: at.x, y: at.y, district: districtAt(at.x, at.y), bestand: 100, flags: { under: 1 } });
    w = body(w, "o", { x: at.x + 10, y: at.y, district: districtAt(at.x, at.y) });
    w = killPlayer(w, "v", "enforcer-1", "gone");
    const wreck = w.wreckage.find(r => r.fromId === "v")!;
    expect(wreck.bestand).toBeGreaterThan(0);
    // the fallen body walks back to its wreckage: Bury, never Loot
    w = { ...w, players: new Map(w.players).set("v", { ...w.players.get("v")!, x: wreck.x, y: wreck.y, district: wreck.district }) };
    expect(verbsFor({ w, p: w.players.get("v")!, now: w.now }, wreck.id).map(v => v.choice)).toEqual(["bury"]);
    const tried = applyAction(w, "v", { t: "interact", targetId: wreck.id, choice: "loot" });
    expect(tried.players.get("v")!.bestand).toBe(w.players.get("v")!.bestand);
    expect(verbsFor({ w, p: w.players.get("o")!, now: w.now }, wreck.id).map(v => v.choice)).toContain("loot");
  });

  it("a bystander's burial does not take a live duel's grave: the fall is still the duel's, watchers and all", () => {
    const at = POSITIONS["stall-3"];
    let w = { ...emptyWorld(), now: 50 };
    w = body(w, "k", { x: at.x, y: at.y, district: "wet", flagged: true, duel: { with: "v", until: 100, accepted: true } });
    w = body(w, "v", { x: at.x + 20, y: at.y, district: "wet", flagged: true, hp: 10, duel: { with: "k", until: 100, accepted: true } });
    w = body(w, "s", { x: at.x - 60, y: at.y, district: "wet" });
    w = body(w, "t", { x: at.x + 10, y: at.y + 20, district: "wet" });
    const grave = { id: "g1", x: at.x + 10, y: at.y, district: "wet" as const, fromId: "z", fromName: "#0009", fromSerial: 9, killerId: "", at: 40, until: 85, buried: false, looted: false, bestand: 0, items: [] };
    w = { ...w, wreckage: [grave] };
    w = applyAction(w, "t", { t: "interact", targetId: "g1", choice: "bury" });
    expect(w.wreckage[0].buried).toBe(true);
    w = { ...w, players: new Map(w.players).set("t", { ...w.players.get("t")!, x: at.x + 200 }) }; // the bystander walks off
    const aura = w.players.get("s")!.aura;
    w = applyAction(w, "k", { t: "strike" });
    expect(w.players.get("v")!.deaths).toBe(1);
    expect(w.players.get("k")!.heard).toContain("A ruin duel. The grave is the ring.");
    expect(w.players.get("s")!.aura, "the watcher is paid").toBeGreaterThan(aura);
  });

  it("a fall wounds aura toward the seed and never raises one already under it", () => {
    let w = body(emptyWorld(), "d", { aura: 2, auraSeed: 20 });
    w = killPlayer(w, "d", "x", "gone");
    expect(w.players.get("d")!.aura).toBe(2);
    void ticks;
  });
});

describe("the first ten minutes", () => {
  it("a guest locked at the lip and linked there is led back to the threshold, and goes under with the Angel's news and notices", () => {
    const m1 = questById(Q.M1)!;
    const lip = POSITIONS["going-under"];
    const guest: Player = {
      ...spawnGuest("g", 0), x: lip.x, y: lip.y + 10, district: districtAt(lip.x, lip.y + 10), locked: true,
      flags: { [F.WEATHER_NAMED]: 1, [F.BURIED_NARA]: 1, [F.INTAKE]: 1 }, quests: { [Q.M1]: m1.steps.length },
    };
    let w: WorldState = { ...emptyWorld(), players: new Map([["g", guest]]), pois: { ...emptyWorld().pois, "going-under": { state: "open", by: "", at: 0, count: 0 } } };
    w = applyAction(w, "g", { t: "link", serial: TEST_SERIAL, sig: "mock" });
    w = tickWorld(tickWorld(w, DT), DT);
    const me = () => w.players.get("g")!;
    expect(me().guest).toBe(false);
    expect(m1.steps[me().quests[Q.M1]]?.id, "the field notes lead to the threshold").toBe("going-under");
    w = applyAction(w, "g", { t: "interact", targetId: "going-under", choice: "under" });
    w = tickWorld(tickWorld(w, DT), DT);
    expect(me().movement).toBe(2);
    expect(w.news.some(n => n.text === "An Angel went under in the Nave.")).toBe(true);
    const notes = me().notices.map(n => n.text);
    expect(notes).toContain("You went under. The Care is open.");
    expect(notes).toContain("Movement II. Techno-Feudal.");
  });
});

describe("the first ten minutes, the city's people", () => {
  it("Vesper Hale gives a guest the spectator's line, never a hall to read (SCRIPT.md II.10: Angels only)", () => {
    const w = emptyWorld();
    expect(NPCS.vesper.entry({ w, p: spawnGuest("g"), now: 0 })).toBe("guest");
    const node = NPCS.vesper.nodes.guest;
    expect(node.text).toBe(LINES.SPECTATOR);
    expect(node.choices ?? []).toHaveLength(0);
  });
});

describe("the side hours' lines against their effects", () => {
  it("'Bury a clerk' closes on a clerk's wreckage, never on another Angel's or a plate", () => {
    const at = POSITIONS["stall-1"];
    let w = body(emptyWorld(), "a", { x: at.x, y: at.y, district: districtAt(at.x, at.y), flags: { under: 1, [F.INTAKE]: 1 } });
    w = { ...w, players: new Map(w.players).set("a", { ...w.players.get("a")!, quests: { "side-nave-doing-a-job": 0 }, flags: { ...w.players.get("a")!.flags, "side:job:base": 0 } }) };
    const wreck = (id: string, fromId: string, fromSerial: number | null) => ({ id, x: at.x + 5, y: at.y, district: districtAt(at.x, at.y), fromId, fromName: "x", fromSerial, killerId: "", at: w.now, until: w.now + 45, buried: false, looted: false, bestand: 0, items: [] });
    w = { ...w, wreckage: [wreck("an-angel", "z", 41)] };
    w = applyAction(w, "a", { t: "interact", targetId: "an-angel", choice: "bury" });
    w = tickWorld(w, DT);
    expect(w.players.get("a")!.quests["side-nave-doing-a-job"], "another Angel's wreckage is not a clerk").toBe(0);
    w = { ...w, wreckage: [...w.wreckage, wreck("a-clerk", "desk-three", null)] };
    w = applyAction(w, "a", { t: "interact", targetId: "a-clerk", choice: "bury" });
    w = tickWorld(w, DT);
    expect(w.players.get("a")!.quests["side-nave-doing-a-job"]).toBe(1);
    expect(w.players.get("a")!.notices.map(n => n.text)).toContain("A clerk is in the ground. They had a desk number. Now they have earth.");
  });
});

describe("a locked body and the hubs", () => {
  it("a locked guest is neither offered nor answered a report its frozen hour would not land", () => {
    const home = NPC_HOMES.omen;
    const locked: Player = { ...spawnGuest("g", 0), x: home.x, y: home.y + 24, district: home.district, locked: true, flags: { "side:omen:met": 1 }, quests: { "side-kerb-hours-for-sale": 2 } };
    const free: Player = { ...locked, id: "f", locked: false };
    const w: WorldState = { ...emptyWorld(), players: new Map([["g", locked], ["f", free]]) };
    const choices = (id: string) => {
      const opened = applyAction(w, id, { t: "talk", npcId: "omen" });
      return (opened.players.get(id)!.dialogue?.choices ?? []).map(c => c.id);
    };
    expect(choices("f"), "an unlocked body at the step is offered the report").toContain("confront");
    expect(choices("g"), "the locked body is not").not.toContain("confront");
    // and a raw choose of it does nothing
    let cur = applyAction(w, "g", { t: "talk", npcId: "omen" });
    const before = cur.players.get("g")!;
    cur = applyAction(cur, "g", { t: "choose", choiceId: "confront" });
    expect(cur.players.get("g")!.flags).toEqual(before.flags);
  });
});

describe("a person walks once in a shared city", () => {
  it("the second body's report moves no one, posts no second marquee line, and does not promise a walk already made", () => {
    const home = NPC_HOMES.omen;
    const at = { x: home.x, y: home.y + 24, district: home.district };
    const hour = { flags: { "side:omen:met": 1 }, quests: { [SQ.HOURS]: 2 } };
    let w = body(emptyWorld(), "a", { ...at, ...hour });
    const glass = SIDE_PLACES["omen-glass"];
    w = body(w, "b", { x: glass.x, y: glass.y + 24, district: glass.district, ...hour });
    const WALK = "Halla Voss stopped selling hours. She is reading the forecast glass for nothing.";
    const confront = (cur: WorldState, id: string) => {
      cur = applyAction(cur, id, { t: "talk", npcId: "omen" });
      cur = applyAction(cur, id, { t: "choose", choiceId: "confront" });
      return cur;
    };
    w = confront(w, "a");
    expect(w.players.get("a")!.dialogue?.text).toContain("I am going to stand at the glass.");
    w = tickWorld(w, DT);
    expect(w.players.get("a")!.quests[SQ.HOURS]).toBe(3);
    expect(w.npcs.omen.state).toBe("glass");
    expect(w.news.filter(n => n.text === WALK)).toHaveLength(1);
    const moved = w.npcs.omen;

    w = confront(w, "b");
    const told = w.players.get("b")!.dialogue?.text ?? "";
    expect(told).toContain("I am here now.");
    expect(told).not.toContain("I am going to stand at the glass.");
    w = tickWorld(w, DT);
    expect(w.players.get("b")!.quests[SQ.HOURS], "the second body's hour still finishes").toBe(3);
    expect(w.news.filter(n => n.text === WALK), "the marquee announces the walk once").toHaveLength(1);
    expect(w.npcs.omen, "the person is not moved again").toEqual(moved);
  });
});

describe("every side hour that walks a person", () => {
  it("walks them and posts the news only while they are not already standing there", () => {
    const w0 = body(emptyWorld(), "a");
    const resolve = (e: Effect[] | ((ctx: Ctx) => Effect[]) | undefined, w: WorldState): Effect[] =>
      typeof e === "function" ? e({ w, p: w.players.get("a")!, now: w.now }) : e ?? [];
    let walks = 0;
    for (const q of SIDE) {
      for (const list of [q.onFinish, ...q.steps.map(s => s.onComplete)]) {
        const first = resolve(list, w0);
        const walk = first.find(e => e.kind === "npc");
        if (!walk || walk.kind !== "npc" || !walk.state) continue;
        walks++;
        expect(first.some(e => e.kind === "news"), `${q.id} announces the walk`).toBe(true);
        const there: WorldState = { ...w0, npcs: { ...w0.npcs, [walk.id]: { ...w0.npcs[walk.id], state: walk.state } } };
        const again = resolve(list, there);
        expect(again.filter(e => e.kind === "npc" && e.id === walk.id), `${q.id} does not walk ${walk.id} twice`).toEqual([]);
        expect(again.filter(e => e.kind === "news"), `${q.id} does not announce it twice`).toEqual([]);
      }
    }
    expect(walks).toBe(7);
  });
});

describe("the first hands at Nara's plot", () => {
  it("hear the line for closing the earth, and the next body hears that someone closed it before them", () => {
    const plot = POSITIONS["nara-plot"];
    const at = { x: plot.x, y: plot.y + 24, district: plot.district };
    const ready = { flags: { [F.MEMORIAL]: 1 }, choices: { memorial: "copper" } };
    let w = body(emptyWorld(), "a", { ...at, ...ready });
    w = body(w, "b", { ...at, ...ready });
    w = applyAction(w, "a", { t: "interact", targetId: "nara-plot", choice: "bury" });
    expect(w.pois["nara-plot"].state).toBe("closed");
    expect(w.players.get("a")!.heard).toContain("The copper holds.");
    w = applyAction(w, "b", { t: "interact", targetId: "nara-plot", choice: "bury" });
    expect(w.players.get("b")!.heard).toContain("Someone closed the earth before you.");
  });
});
