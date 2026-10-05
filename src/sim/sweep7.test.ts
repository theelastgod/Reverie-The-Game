// The player-defect sweep, round seven (2026-10-05): time jumps, a raw-socket cheater, dialogue against a moving world, the
// season boundary in the middle of an hour, and text against state. Each case is one finding, reproduced through the real
// reducers and held with the real content.
import { describe, expect, it } from "vitest";
import type { Ctx, Player, WorldState } from "./types";
import { CLEARING_LIST_PRICE, CLEARING_PRICE_MOVE, DT, SEASON_LENGTH, WRECKAGE_TTL } from "./constants";
import { NPC_STATIONS, POSITIONS, districtAt } from "./map";
import { emptyWorld, killPlayer, spawnGuest, tickWorld } from "./world";
import { applyAction } from "./actions";
import { applyDuel } from "./combat";
import { verbsFor } from "./interact";
import { npcView, snapshotFor } from "./snapshot";
import { questById } from "./quests";
import { formatSerial, houseFor, messengerFor, winkSchoolFor } from "./identity";
import { C, F, Q, seasonPassingFlag } from "./content/ids";
import { NPCS } from "./content";
import { applyEffects } from "./effects";
import { listClearing, moveClearing } from "./content/market";
import { sfxFor } from "../audio/cues";

function body(w: WorldState, id: string, at: { x: number; y: number }, patch: Partial<Player> = {}): WorldState {
  const players = new Map(w.players);
  const serial = 40 + players.size;
  players.set(id, { ...spawnGuest(id, w.now), guest: false, serial, name: `#00${serial}`, house: "mortals", aura: 20, restraint: 60, x: at.x, y: at.y, district: districtAt(at.x, at.y), flags: { [F.ANGEL]: 1, [F.UNDER]: 1 }, ...patch });
  return { ...w, players };
}
const me = (w: WorldState, id = "a"): Player => w.players.get(id)!;
const set = (w: WorldState, id: string, patch: Partial<Player>): WorldState => {
  const players = new Map(w.players);
  players.set(id, { ...me(w, id), ...patch });
  return { ...w, players };
};
const ctxOf = (w: WorldState, id = "a"): Ctx => ({ w, p: me(w, id), now: w.now });
const near = (id: string) => ({ x: NPC_STATIONS[id].x, y: NPC_STATIONS[id].y + 24 });
const roll = (w: WorldState): WorldState => tickWorld({ ...w, now: w.season.startedAt + SEASON_LENGTH }, DT);
const sentences = (text: string): string[] => text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
const notices = (w: WorldState): string[] => me(w).notices.map(n => n.text);

describe("time jumps", () => {
  it("a fall is heard as the death cue: the body wakes in the step it fell, so the count is what the client reads", () => {
    const street = POSITIONS["stall-3"];
    let w = body(emptyWorld(), "a", street, { hp: 5 });
    w = body(w, "x", street);
    const prev = snapshotFor(w, "a");
    w = killPlayer(w, "a", "x", "strike");
    const next = snapshotFor(w, "a");
    expect(next.you.dead, "no frame ever reads the body dead").toBe(false);
    expect(next.you.deaths).toBe(1);
    expect(sfxFor(prev, next)).toContain("death");
    expect(sfxFor(prev, next), "a killing blow is not a hit").not.toContain("hit");
  });
});

describe("the season boundary in the middle of an hour", () => {
  it("Caul's word on a rite is filed under the season it began in, so a window held across the roll does not take the next season's", () => {
    let w = body(emptyWorld(), "a", near("caul-lip"), {
      movement: 4,
      flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.PREPARE]: 1, [F.PASSING]: 1, [seasonPassingFlag(1)]: 1 },
      choices: { [C.PASSING]: "appearance" },
    });
    w = applyAction(w, "a", { t: "talk", npcId: "caul" });
    expect(me(w).dialogue?.node).toBe("lip-crew");
    expect(me(w).flags["caul:lip:said:1"], "the word is said as it opens").toBe(1);
    w = roll(w);
    expect(w.season.id).toBe(2);
    w = applyAction(w, "a", { t: "close" });
    expect(me(w).dialogue?.node).toBe("lip-appearance");
    w = applyAction(w, "a", { t: "close" });
    expect(me(w).dialogue).toBeNull();
    expect(me(w).flags["caul:lip:said:2"], "season two's word is still his to say").toBeUndefined();
    w = set(w, "a", { flags: { ...me(w).flags, [seasonPassingFlag(2)]: 1 } });
    expect(NPCS.caul.entry(ctxOf(w))).toBe("lip-crew");
  });

  it("the stance step says the hole is closed when a roll has closed it under a body still deciding, and F prepares it again", () => {
    const stance = questById(Q.M4)!.steps.find(s => s.id === "stance")!;
    const detail = (w: WorldState) => (stance.detail as (ctx: Ctx) => string)(ctxOf(w));
    const ring = POSITIONS["clearing-ring"];
    let w = body(emptyWorld(), "a", ring, {
      movement: 4,
      flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.MORTALITY]: 1, [F.PREPARE]: 1 },
      party: { nara: "with", quill: "with", ord: "with" },
      choices: { [C.PARTY]: "with" },
    });
    w = { ...w, clearing: { ...w.clearing, open: true, openedAt: 0 } };
    expect(detail(w)).toMatch(/^The hole is open/);
    w = roll(w);
    expect(w.clearing.open).toBe(false);
    expect(detail(w)).toMatch(/^The Clearing is not open\. Open it first, or stand in it while someone does: press F at the ring to prepare the ground\./);
    expect(verbsFor(ctxOf(w), "clearing-ring").find(v => v.key === "F")?.choice, "what the step says F does, F does").toBe("prepare");
  });
});

describe("dialogue against a moving world", () => {
  it("a press made against a window the server has moved past picks and closes nothing the player has not seen", () => {
    const flags = { [F.ANGEL]: 1, [F.UNDER]: 1, [F.FAILED]: 1, [F.CAUL_MET]: 1, [F.CAUL_OFFER]: 1 };
    let w = body(emptyWorld(), "a", near("caul-glass"), { movement: 3, flags, quests: { [Q.M1]: 99, [Q.M2]: 99 } });
    w = applyAction(w, "a", { t: "talk", npcId: "caul" });
    expect(me(w).dialogue?.node).toBe("offer");
    expect(applyAction(w, "a", { t: "choose", choiceId: "reader", node: "sample" }), "a choice drawn on another node").toBe(w);
    w = applyAction(w, "a", { t: "choose", choiceId: "reader", node: "offer" });
    expect(me(w).dialogue?.node).toBe("reader");
    w = applyAction(w, "a", { t: "close", node: "reader" });
    expect(me(w).dialogue?.node, "Continue: his question").toBe("looked");
    // the same Continue pressed twice (a double click, Escape held) does not close the question it never saw
    expect(applyAction(w, "a", { t: "close", node: "reader" })).toBe(w);
    expect(me(applyAction(w, "a", { t: "choose", choiceId: "told", node: "reader" })).flags[F.TOLD_CAUL]).toBeUndefined();
    expect(me(applyAction(w, "a", { t: "choose", choiceId: "told", node: "looked" })).flags[F.TOLD_CAUL]).toBe(1);
    expect(me(applyAction(w, "a", { t: "close", node: "looked" })).dialogue, "a close on the window it names").toBeNull();
    expect(me(applyAction(w, "a", { t: "close" })).dialogue, "a bare close is the old message").toBeNull();
    // the node is a short string, or the message is not one
    expect(applyAction(w, "a", { t: "close", node: 5 } as never)).toBe(w);
    expect(applyAction(w, "a", { t: "close", node: "x".repeat(65) })).toBe(w);
    expect(applyAction(w, "a", { t: "choose", choiceId: "told", node: 7 } as never)).toBe(w);
  });

  it("Pim stays at the wake for the whole of its window, wherever another body's ledger walked him, and is the garden's after", () => {
    const home = POSITIONS["home:sexton"];
    let w = body(emptyWorld(), "a", home, { movement: 2, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.SHRINE]: 1 } });
    const garden = { x: home.x + 300, y: home.y + 200 };
    w = { ...w, npcs: { ...w.npcs, sexton: { ...w.npcs.sexton, state: "garden", x: garden.x, y: garden.y } } };
    const view = (cur: WorldState) => npcView(ctxOf(cur), cur.npcs.sexton)!;
    expect(view(w)).toMatchObject({ state: "home", x: home.x, y: home.y });
    w = applyAction(w, "a", { t: "talk", npcId: "sexton" });
    expect(me(w).dialogue?.node).toBe("wake");
    expect(me(w).flags[F.TALKED_SEXTON]).toBe(1);
    expect(view(w), "the wake's own opening does not send him to the garden").toMatchObject({ state: "home", x: home.x, y: home.y });
    w = applyAction(w, "a", { t: "choose", choiceId: "work" });
    expect(me(w).dialogue?.node).toBe("hub");
    expect(me(w).dialogue?.text, "the hub said beside the shrine is the shrine's").not.toContain("wreckage garden");
    w = applyAction(w, "a", { t: "close" });
    expect(me(w).dialogue).toBeNull();
    expect(view(w).state, "the window closed, he is where the ledger left him").toBe("garden");
    w = set(w, "a", { x: garden.x, y: garden.y + 24, district: districtAt(garden.x, garden.y + 24) });
    w = applyAction(w, "a", { t: "talk", npcId: "sexton" });
    expect(me(w).dialogue?.text).toContain("wreckage garden");
  });

  it("Nara kneels at the garden while her plate is this body's to answer, and through the answer's own window", () => {
    const at = NPC_STATIONS["nara-garden"];
    let w = body(emptyWorld(), "a", POSITIONS["wreckage-garden"], { movement: 3, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.OPERATOR]: 1 } });
    const view = (cur: WorldState) => npcView(ctxOf(cur), cur.npcs.nara)!;
    w = applyAction(w, "a", { t: "interact", targetId: "wreckage-garden", choice: "bury" });
    expect(me(w).dialogue?.node).toBe("garden-plate");
    expect(view(w), "as the plate opens").toMatchObject({ state: "garden", x: at.x, y: at.y });
    w = applyAction(w, "a", { t: "choose", choiceId: "later" });
    expect(me(w).dialogue).toBeNull();
    expect(view(w), "after \"later\": the plate is still hers to ask").toMatchObject({ state: "garden", x: at.x, y: at.y });
    w = set(w, "a", { x: at.x, y: at.y + 24, district: districtAt(at.x, at.y + 24) });
    w = { ...w, now: w.now + 30 }; // past the party's notice of a fresh Wink
    w = applyAction(w, "a", { t: "talk", npcId: "nara" });
    expect(me(w).dialogue?.node).toBe("garden-plate");
    w = applyAction(w, "a", { t: "choose", choiceId: "numbered" });
    expect(me(w).dialogue?.node).toBe("garden-numbered");
    expect(me(w).choices[C.GARDEN]).toBe("numbered");
    expect(view(w), "in the answer's window").toMatchObject({ state: "garden", x: at.x, y: at.y });
    w = applyAction(w, "a", { t: "close" });
    expect(me(w).dialogue).toBeNull();
    expect(view(w).state, "answered and closed: she goes on").not.toBe("garden");
  });
});

describe("text against state", () => {
  it("a dense body's plate Wink at the garden does not say again a sentence the burial's Wink just said", () => {
    const base = emptyWorld();
    const plate = NPCS.nara.nodes["garden-plate"].wink as string;
    const garden = POSITIONS["wreckage-garden"];
    let dense = 0;
    for (let serial = 1; serial <= 2000; serial++) {
      const house = houseFor(serial);
      const w = body(base, "a", garden, {
        serial, name: formatSerial(serial), house, messenger: messengerFor(serial), winkSchool: winkSchoolFor(serial),
        movement: 3, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.OPERATOR]: 1 },
      });
      const out = applyAction(w, "a", { t: "interact", targetId: "wreckage-garden", choice: "bury" });
      const p = me(out);
      expect(p.flags[F.GARDEN], formatSerial(serial)).toBe(1);
      const window = p.dialogue!.wink;
      if (window === plate) continue;
      dense++;
      const said = sentences(p.wink);
      expect(new Set(said).size, `${formatSerial(serial)}: ${p.wink}`).toBe(said.length);
      expect(p.wink.startsWith("You took a hole and called it weather."), formatSerial(serial)).toBe(true);
      expect(p.wink.endsWith(window), formatSerial(serial)).toBe(true);
      expect(window.length, "the school line is kept").toBeGreaterThan(plate.length);
    }
    expect(dense).toBeGreaterThan(400);
  });

  it("the Face counts one fall as one time", () => {
    const street = POSITIONS["stall-3"];
    const face = (deaths: number) => {
      const w = body(emptyWorld(), "a", street, { messenger: "ruin", deaths, kit: { verb: "ruin", until: 10 } });
      return snapshotFor(w, "a").you.kitReadout?.find(l => l.startsWith("Passings"));
    };
    expect(face(1)).toContain("Fell 1 time.");
    expect(face(2)).toContain("Fell 2 times.");
    expect(face(0)).toContain("Fell 0 times.");
  });

  describe("the three names of the weather", () => {
    const plaque = POSITIONS["safety-plaque"];
    const read = (w: WorldState, choice: "read" | "reread") => applyAction(w, "a", { t: "interact", targetId: "safety-plaque", choice });
    const m1 = (flags: string[]) => body(emptyWorld(), "a", plaque, { movement: 1, flags: Object.fromEntries([F.ANGEL, ...flags].map(f => [f, 1])) });
    const naraSays = (w: WorldState): string => {
      const at = POSITIONS["home:nara"];
      const there = set(w, "a", { x: at.x, y: at.y + 24, district: districtAt(at.x, at.y + 24) });
      const out = applyAction(there, "a", { t: "talk", npcId: "nara" });
      expect(me(out).dialogue?.node).toBe("buried");
      return me(out).dialogue!.text;
    };

    it("Ord's name heard first: the plaque counts one more to hear, and its second reading says who has the third", () => {
      let w = read(m1([F.WEATHER_ORD, F.BURIED_NARA]), "read");
      expect(notices(w)).toContain("Safety calls it stability. One more name to hear.");
      w = read(w, "reread");
      expect(me(w).heard).toContain("You have two names. Nara has the third.");
    });

    it("Ord's and Nara's heard first: the plaque's reading gives the third, and the naming is on the same press", () => {
      const w = read(m1([F.WEATHER_ORD, F.WEATHER_NARA, F.BURIED_NARA]), "read");
      expect(notices(w)).toContain("Safety calls it stability. You have three names now.");
      expect(verbsFor(ctxOf(w), "safety-plaque").map(v => v.choice)).toEqual(expect.arrayContaining(["stability", "process", "end"]));
    });

    it("Nara's heard first: she does not send a body with one name to name the weather, and the plaque says Ord has the third", () => {
      const heard = [F.TALKED_NARA, F.MEMORIAL, F.BURIED_NARA, F.WEATHER_NARA];
      let w = m1(heard);
      expect(naraSays(w)).toContain("Ord has not given you his, and the plaque by the Annex gate has Safety's.");
      w = read(w, "read");
      expect(notices(w)).toContain("Safety calls it stability. One more name to hear.");
      w = read(w, "reread");
      expect(me(w).heard).toContain("You have two names. Ord has the third.");
      expect(naraSays(w)).toMatch(/^Ord has not given you his\. He is at the Annex gate\./);
      w = set(w, "a", { flags: { ...me(w).flags, [F.WEATHER_ORD]: 1 } });
      expect(naraSays(w)).toMatch(/^You have three names now\./);
      // the plaque's own name only, as before
      expect(me(read(m1([F.WEATHER_SAFETY]), "reread")).heard).toContain("You have one name. Ord and Nara have the other two.");
    });
  });

  it("the resistance's listing reads as news: a capital, and its price in Bestand rather than an hour after \"scheduled\"", () => {
    let w = body(emptyWorld(), "a", POSITIONS["stall-3"]);
    w = applyEffects(w, "a", [listClearing(), moveClearing("taken")]);
    expect(w.news.at(-2)?.text).toBe(`The resistance lists A Clearing, the hole scheduled. ${CLEARING_LIST_PRICE} Bestand.`);
    const posted = w.news.at(-1)?.text ?? "";
    expect(posted).toBe(`The resistance prices A Clearing, the hole scheduled. ${CLEARING_LIST_PRICE + CLEARING_PRICE_MOVE.taken} Bestand, up from ${CLEARING_LIST_PRICE}.`);
  });

  it("a ruin duel's news names an Angel's wreckage, and an enforcer's or a guest's is a wreckage", () => {
    const ring = POSITIONS["clearing-ring"];
    const duelNews = (fromName: string, fromSerial: number | null) => {
      let w = body(emptyWorld(), "a", { x: ring.x - 15, y: ring.y }, { messenger: "ruin", flagged: true, facing: { dx: 1, dy: 0 } });
      w = body(w, "b", { x: ring.x + 15, y: ring.y }, { messenger: "ruin", flagged: true, facing: { dx: -1, dy: 0 } });
      w = { ...w, wreckage: [{ id: "old", x: ring.x, y: ring.y + 20, district: "clearing", fromId: "z", fromName, fromSerial, killerId: "", at: 0, until: w.now + WRECKAGE_TTL, buried: false, looted: false, bestand: 0, items: [] }] };
      w = applyDuel(applyDuel(w, "a", "b"), "b", "a");
      expect(me(w).duel?.accepted).toBe(true);
      return w.news.at(-1)?.text ?? "";
    };
    expect(duelNews("Cold desk · one", null)).toBe("A ruin duel at a wreckage. #0041 and #0040. The grave is the ring.");
    expect(duelNews("GUEST", null)).toMatch(/^A ruin duel at a wreckage\./);
    expect(duelNews("#0009", 9)).toMatch(/^A ruin duel at #0009's wreckage\./);
  });

  it("an opened hole is one news line, the prepare verb's own", () => {
    const ring = POSITIONS["clearing-ring"];
    const onStep = { movement: 4 as const, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.MORTALITY]: 1 }, choices: { [C.PARTY]: "with" }, quests: { [Q.M1]: 99, [Q.M2]: 99, [Q.M3]: 99, [Q.M4]: 2 } };
    const w = body(emptyWorld(), "a", ring, onStep);
    const out = applyAction(w, "a", { t: "interact", targetId: "clearing-ring", choice: "prepare" });
    expect(out.clearing.open).toBe(true);
    expect(out.news.slice(w.news.length).map(n => n.text)).toEqual(["A Clearing was prepared."]);
  });

  it("Corvin does not tell a House of Earth Angel it has read a hall still behind the Organs door", () => {
    const corridor = (house: Player["house"]) => {
      const flags = { [F.ANGEL]: 1, [F.UNDER]: 1, [F.SHRINE]: 1, [F.TALKED_SEXTON]: 1, [F.HALL]: 1 };
      let w = body(emptyWorld(), "a", POSITIONS["home:officer"], { movement: 2, house, flags });
      w = applyAction(w, "a", { t: "talk", npcId: "officer" });
      expect(me(w).dialogue?.node).toBe("corridor");
      return me(w).dialogue!.text;
    };
    expect(corridor("earth")).not.toContain("You have read your hall");
    expect(corridor("earth")).toContain("The desk ahead will sell you a freeze");
    expect(corridor("mortals")).toContain("You have read your hall. Good. The desk ahead will sell you a freeze");
  });
});
