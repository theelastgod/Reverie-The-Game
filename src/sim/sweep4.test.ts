// The player-defect sweep, round four (2026-10-04): after the credits, the Winke and their schools, the news and the
// notices, the server's routes and storage, the phone and keyboard HUD, the Phase B and C set pieces. Each case here is
// one finding, reproduced through the real reducers and held with the real content.
import { describe, expect, it } from "vitest";
import type { Ctx, Player, WorldState } from "./types";
import { DT, LAUNCH_OFFSET, RESTRAINT_WINK_MIN } from "./constants";
import { NPC_STATIONS, POSITIONS, districtAt } from "./map";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { applyAction } from "./actions";
import { verbsFor } from "./interact";
import { resolveWink } from "./dialogue";
import { applyEffects } from "./effects";
import { tickHouseWar } from "./houses";
import { houseFor, winkSchoolFor } from "./identity";
import { C, F, Q, W, seasonPassingFlag } from "./content/ids";
import { LINES, NPCS } from "./content";
import { WAKING_WINK, WINKE } from "./content/lines";

function body(w: WorldState, id: string, x: number, y: number, patch: Partial<Player> = {}): WorldState {
  const players = new Map(w.players);
  const serial = 40 + players.size;
  players.set(id, { ...spawnGuest(id, w.now), guest: false, serial, name: `#00${serial}`, house: "earth", x, y, district: districtAt(x, y), ...patch });
  return { ...w, players };
}
const me = (w: WorldState, id: string): Player => w.players.get(id)!;
const ticks = (w: WorldState, n: number): WorldState => {
  let cur = w;
  for (let i = 0; i < n; i++) cur = tickWorld(cur, DT);
  return cur;
};
const ring = POSITIONS["clearing-ring"];
const sentences = (text: string): string[] => text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);

describe("after the credits", () => {
  /** An Angel who walked the spine and passed in season 1, standing at the ring. */
  const veteran = (w: WorldState, id: string): WorldState => body(w, id, ring.x, ring.y, {
    movement: 5,
    readiness: 85,
    flags: { [F.UNDER]: 1, [F.MORTALITY]: 1, [F.PREPARE]: 1, [F.PASSING]: 1, [seasonPassingFlag(1)]: 1, [F.CREDITS]: 1 },
    choices: { [C.PARTY]: "with", [C.CLEARING]: "keep", [C.PASSING]: "appearance" },
  });

  it("a veteran stands for a later season's rite, then opens the set ring again: nothing else in the city opens one", () => {
    let w = veteran({ ...emptyWorld(), season: { id: 2, startedAt: 0 } }, "v");
    const fKey = () => verbsFor({ w, p: me(w, "v"), now: w.now }, "clearing-ring").filter(v => v.key === "F").map(v => v.choice);
    // before this season's rite, F is the rite (a prepared Angel may stand for it again: CONTRACTS, the seasonal rite)
    expect(fKey()[0]).toBe("pass");
    expect(w.clearing.open).toBe(false);
    w = applyAction(w, "v", { t: "interact", targetId: "clearing-ring", choice: "pass" });
    expect(me(w, "v").flags[seasonPassingFlag(2)]).toBe(1);
    w = { ...w, clearing: { ...w.clearing, open: false, contest: null } };
    // after it, F opens the ground: the contest is the rest of life, and only the ring's prepare verb opens the hole
    expect(fKey()[0]).toBe("prepare");
    w = applyAction(w, "v", { t: "interact", targetId: "clearing-ring", choice: "prepare" });
    expect(w.clearing.open, "the veteran opened the hole").toBe(true);
    expect(w.news.at(-1)?.text).toBe("A Clearing was prepared.");
    // the notice does not promise a rite the season has already had
    expect(me(w, "v").notices.at(-1)?.text).toBe("The Clearing is prepared. E keeps it. Q extracts it.");
    // and the hole once open, F is the after line, never the rite twice
    expect(fKey()).not.toContain("pass");
  });
});

describe("the news and the notices", () => {
  it("one opened hole is one 'A Clearing was prepared.': a body that joins it posts none", () => {
    // both on the spine's prepare step (Movement IV's third), as two Angels reaching the ring together are
    const fourth = { [F.UNDER]: 1, [F.MORTALITY]: 1 };
    const onStep = { movement: 4 as const, flags: fourth, choices: { [C.PARTY]: "with" }, quests: { [Q.M1]: 99, [Q.M2]: 99, [Q.M3]: 99, [Q.M4]: 2 } };
    let w = body(emptyWorld(), "a", ring.x, ring.y, onStep);
    w = body(w, "b", ring.x + 10, ring.y, onStep);
    w = applyAction(w, "a", { t: "interact", targetId: "clearing-ring", choice: "prepare" });
    w = ticks(w, 2);
    expect(verbsFor({ w, p: me(w, "b"), now: w.now }, "clearing-ring").map(v => v.choice)).toContain("join");
    w = applyAction(w, "b", { t: "interact", targetId: "clearing-ring", choice: "join" });
    w = ticks(w, 3);
    expect(w.news.filter(n => n.text === "A Clearing was prepared.")).toHaveLength(1);
  });

  it("an Angel who stood alone keeps the possessive on the name when the rite fails", () => {
    let w = body(emptyWorld(), "a", ring.x, ring.y, {
      movement: 4, readiness: 10,
      flags: { [F.UNDER]: 1, [F.MORTALITY]: 1, [F.PREPARE]: 1 },
      choices: { [C.PARTY]: "alone", [C.CLEARING]: "keep" },
    });
    w = applyAction(w, "a", { t: "interact", targetId: "clearing-ring", choice: "pass" });
    expect(me(w, "a").choices[C.PASSING]).toBe("failed");
    expect(w.news.some(n => n.text === `${me(w, "a").name}'s Passing failed. Gestell kept the weather.`)).toBe(true);
    expect(w.news.some(n => n.text.includes(", alone,'s"))).toBe(false);
  });

  it("a tied House hold is posted as tied, not as nobody standing in it", () => {
    let w = emptyWorld();
    const war = { ...w.houses.war, active: true, endsAt: w.now + 0.01, held: { earth: 120, sky: 120, mortals: 0, divinities: 0 } };
    w = { ...w, houses: { ...w.houses, war } };
    w = tickHouseWar({ ...w, now: w.now + 1 }, 0);
    expect(w.houses.war.winner).toBe("");
    expect(w.news.at(-1)?.text).toMatch(/was tied\. No House takes the omen\./);
  });
});

describe("the Winke and their schools", () => {
  const dense = (serial: number): Player => ({ ...spawnGuest("d"), guest: false, serial, house: "divinities", winkSchool: winkSchoolFor(serial), aura: 20, restraint: 60 });

  it("a dense body's school line never says again a sentence of the Wink it follows", () => {
    const w = emptyWorld();
    for (const authored of ["The Clearing holds when people do.", "The Wet Grid looks like freedom. It is a stall. The sky is already priced."]) {
      for (let serial = 4; serial <= 400; serial += 4) {
        if (houseFor(serial) !== "divinities") continue;
        const line = resolveWink({ w, p: dense(serial), now: 0 }, authored);
        const said = sentences(line);
        expect(new Set(said).size, `#${serial}: ${line}`).toBe(said.length);
      }
    }
  });

  it("a serial with no hour written back is never told it had one", () => {
    const w = emptyWorld();
    for (let serial = 1; serial <= 600; serial++) {
      if (winkSchoolFor(serial) !== "wreckage") continue;
      const p = dense(serial);
      expect(resolveWink({ w, p, now: 0 }, WAKING_WINK), `#${serial}`).not.toContain("A prior hour.");
    }
    expect(WINKE.wreckage.some(l => l.startsWith("A prior hour."))).toBe(true); // the line stays for a serial whose mark stands
  });

  it("a Wink the same act already gave is kept before the node's own: the garden's burial, then Nara's plate", () => {
    const w = body(emptyWorld(), "a", 0, 0, { aura: 20, restraint: 60 });
    const buried = "You took a hole and called it weather. It came back as earth. Only burial makes it world again.";
    const out = applyEffects(w, "a", [{ kind: "wink", text: buried }, { kind: "dialogue", npc: "nara", node: "garden-plate" }]);
    const plate = NPCS.nara.nodes["garden-plate"].wink;
    expect(me(out, "a").wink.startsWith(buried)).toBe(true);
    expect(typeof plate === "string" ? me(out, "a").wink.endsWith(plate) : true).toBe(true);
  });

  it("the waking hint waits in Movement II until the body can see it, then is heard once", () => {
    let w = body(emptyWorld(), "a", POSITIONS["care-shrine"].x, POSITIONS["care-shrine"].y, {
      movement: 2, aura: 20, restraint: RESTRAINT_WINK_MIN - 1,
      flags: { [F.UNDER]: 1 }, quests: { [Q.M1]: 99 },
    });
    w = ticks(w, 2);
    expect(me(w, "a").quests[Q.M2], "Movement II started").toBe(0);
    expect(me(w, "a").wink, "spent restraint cannot see it").toBe("");
    w = { ...w, players: new Map(w.players).set("a", { ...me(w, "a"), restraint: 60 }) };
    w = ticks(w, 1);
    expect(me(w, "a").wink).toContain(WAKING_WINK);
    expect(me(w, "a").flags[F.WAKING]).toBe(1);
    const heard = me(w, "a").winkAt;
    w = ticks(w, 5);
    expect(me(w, "a").winkAt, "once").toBe(heard);
  });
});

describe("the Phase B and C set pieces", () => {
  /** A world inside this season's lit launch hour. */
  const launchHour = (w: WorldState): WorldState => ({ ...w, now: w.season.startedAt + LAUNCH_OFFSET + 10, flags: { ...w.flags, [W.LAUNCH_SEASON]: w.season.id } });
  const ctxOf = (w: WorldState, p: Player): Ctx => ({ w, p, now: w.now });

  it("a locked guest watches the lit altar: the catalog's line, and in the launch hour his reel over the count", () => {
    const at = POSITIONS["crt-altar-2"];
    const locked = (w: WorldState) => {
      const players = new Map(w.players);
      players.set("g", { ...spawnGuest("g", w.now), locked: true, x: at.x, y: at.y + 20, district: districtAt(at.x, at.y + 20) });
      return { ...w, players };
    };
    let w = applyAction(locked(emptyWorld()), "g", { t: "interact", targetId: "crt-altar-2", choice: "watch" });
    expect(me(w, "g").heard).toContain("Screens in a ring.");
    expect(me(w, "g").heard).not.toBe(LINES.GUEST_LOCK);
    w = applyAction(locked(launchHour(emptyWorld())), "g", { t: "interact", targetId: "crt-altar-2", choice: "watch" });
    expect(me(w, "g").heard).toContain("Every screen in the aisle on one reel");
    expect(me(w, "g").dialogue?.node).toBe("reel-launch");
  });

  it("inside a lit launch hour Caul's oval-hour says the glass reads now, not that the date is on it", () => {
    const node = NPCS.caul.nodes["oval-hour"];
    const text = (w: WorldState) => (typeof node.text === "function" ? node.text(ctxOf(w, spawnGuest("g"))) : node.text);
    expect(text(emptyWorld())).toContain("The date is on the glass. Until then, the altars.");
    const lit = text(launchHour(emptyWorld()));
    expect(lit).toContain("The glass says now. The altars are counting it.");
    expect(lit).not.toContain("The date is on the glass");
    expect(lit).not.toContain("Until then");
  });

  it("his first question waits at the lip for a body that decided the glass and was never asked", () => {
    const w = emptyWorld();
    const p = { ...spawnGuest("a"), guest: false, serial: 44, movement: 4 as const, flags: { [F.CAUL_OFFER]: 1, [F.FAILED]: 1 }, choices: { [C.GLASS]: "read" } };
    expect(NPCS.caul.entry(ctxOf(w, p))).toBe("looked");
    expect(NPCS.caul.entry(ctxOf(w, { ...p, flags: { ...p.flags, [F.CAUL_ASKED]: 1 } }))).not.toBe("looked");
  });
});

describe("found by the round's skeptics", () => {
  it("Caul's offer stands for a body that said no: the reader's post is his entry until the glass is decided, and he does not ask twice", () => {
    const desk = NPC_STATIONS["caul-glass"];
    const asked = { [F.UNDER]: 1, [F.FAILED]: 1, [F.CAUL_MET]: 1, [F.CAUL_OFFER]: 1, [F.CAUL_ASKED]: 1 };
    let w = body(emptyWorld(), "a", desk.x, desk.y + 24, { movement: 3, flags: asked, quests: { [Q.M1]: 99, [Q.M2]: 99 } });
    w = applyAction(w, "a", { t: "talk", npcId: "caul" });
    expect(me(w, "a").dialogue?.node, "SCRIPT.md III.7: `offer` until the glass is decided").toBe("offer");
    w = applyAction(w, "a", { t: "choose", choiceId: "reader" });
    w = ticks(w, 1);
    expect(me(w, "a").choices[C.GLASS]).toBe("read");
    // the question was his already: the reader's post closes the window rather than asking it a second time at the glass
    expect(me(w, "a").dialogue?.node).not.toBe("looked");
    w = applyAction(w, "a", { t: "talk", npcId: "caul" });
    expect(me(w, "a").dialogue?.node, "decided: the after line").toBe("after");
  });
});

/** The ctx type is used by the helpers above only through resolveWink; kept for the reader. */
export type { Ctx };
