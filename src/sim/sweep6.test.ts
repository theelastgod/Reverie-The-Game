// The player-defect sweep, round six (2026-10-05): a city run for weeks, guests everywhere, the purse's numbers, one Angel
// griefing another, where a body can stand, and the screen against the server. Each case is one finding, reproduced
// through the real reducers and held with the real content.
import { describe, expect, it } from "vitest";
import type { Ctx, Player, WorldState } from "./types";
import { CAMP_WINDOW, DT, FLAG_HOLD, GESTELL_CAMP, MAX_HP } from "./constants";
import { POSITIONS, districtAt } from "./map";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { applyAction } from "./actions";
import { verbsFor } from "./interact";
import { snapshotFor } from "./snapshot";
import { questById } from "./quests";
import { C, F, Q, W } from "./content/ids";
import { LINES, NPCS } from "./content";
import { SIDE_BY_ID, SQ } from "./content/side";
import { chipVerbs } from "../ui/format";
import { ledgerModel } from "../ui/ledger";

function body(w: WorldState, id: string, at: { x: number; y: number }, patch: Partial<Player> = {}): WorldState {
  const players = new Map(w.players);
  const serial = 40 + players.size;
  players.set(id, { ...spawnGuest(id, w.now), guest: false, serial, name: `#00${serial}`, house: "earth", x: at.x, y: at.y, district: districtAt(at.x, at.y), flags: { [F.ANGEL]: 1, [F.UNDER]: 1 }, ...patch });
  return { ...w, players };
}
function guest(w: WorldState, id: string, at: { x: number; y: number }, patch: Partial<Player> = {}): WorldState {
  const players = new Map(w.players);
  players.set(id, { ...spawnGuest(id, w.now), x: at.x, y: at.y, district: districtAt(at.x, at.y), ...patch });
  return { ...w, players };
}
const me = (w: WorldState, id: string): Player => w.players.get(id)!;
const set = (w: WorldState, id: string, patch: Partial<Player>): WorldState => {
  const players = new Map(w.players);
  players.set(id, { ...me(w, id), ...patch });
  return { ...w, players };
};
const ctxOf = (w: WorldState, id: string): Ctx => ({ w, p: me(w, id), now: w.now });
const street = POSITIONS["stall-3"];

describe("one Angel griefing another", () => {
  /** x strikes v down in one blow where they stand: v at 1 hp beside x, x facing it. */
  const fell = (w: WorldState, victim: string): WorldState => {
    let cur = set(w, victim, { x: street.x + 30, y: street.y, district: districtAt(street.x + 30, street.y), hp: 1, flagged: true, dead: false });
    cur = set(cur, "x", { x: street.x, y: street.y, district: districtAt(street.x, street.y), strikeCd: 0, facing: { dx: 1, dy: 0 } });
    return applyAction(cur, "x", { t: "strike" });
  };

  it("camping feeds the weather once a window per camper, while the camper's aura pays every camp", () => {
    let w = body(emptyWorld(), "x", street, { flagged: true, aura: 60, auraSeed: 10 });
    w = body(w, "y", street, { flagged: true });
    w = body(w, "z", POSITIONS["stall-1"], { flagged: true }); // out of the strike's reach until it is felled
    const g0 = w.gestell;
    for (let i = 0; i < 15; i++) w = fell(w, "y");
    expect(me(w, "y").deaths).toBe(15);
    expect(me(w, "x").campCount, "every camp is counted").toBe(14);
    expect(w.gestell, "fifteen falls in a breath feed the weather once").toBeCloseTo(g0 + GESTELL_CAMP, 5);
    // rotating victims inside the window does not multiply the heat
    w = fell(fell(w, "z"), "z");
    expect(w.gestell).toBeCloseTo(g0 + GESTELL_CAMP, 5);
    // a camp after the window feeds it again
    w = { ...w, now: w.now + CAMP_WINDOW + 1 };
    w = fell(fell(w, "y"), "y");
    expect(w.gestell).toBeCloseTo(g0 + 2 * GESTELL_CAMP, 5);
  });

  it("a landed blow holds both raised flags up, so a flag lowered around a strike cannot dodge the answer", () => {
    let w = body(emptyWorld(), "a", street, { flagged: true, facing: { dx: 1, dy: 0 } });
    w = body(w, "b", { x: street.x + 30, y: street.y }, { flagged: true, facing: { dx: -1, dy: 0 } });
    w = applyAction(w, "a", { t: "strike" });
    expect(me(w, "b").hp).toBeLessThan(MAX_HP);
    w = applyAction(w, "a", { t: "flag" });
    expect(me(w, "a").flagged, "the striker's flag is held").toBe(true);
    expect(me(w, "a").heard).toBe(LINES.FLAG_HELD);
    const hp = me(w, "a").hp;
    w = applyAction(w, "b", { t: "strike" });
    expect(me(w, "a").hp, "the answer lands").toBeLessThan(hp);
    // the hold runs out ten seconds past the last blow
    w = { ...w, now: w.now + FLAG_HOLD + 0.1 };
    w = applyAction(w, "a", { t: "flag" });
    expect(me(w, "a").flagged).toBe(false);
    // raising is never held, and a refused strike starts no hold
    w = applyAction(w, "a", { t: "flag" });
    expect(me(w, "a").flagged).toBe(true);
    let c = body(emptyWorld(), "c", street, { flagged: true, facing: { dx: 1, dy: 0 } });
    c = body(c, "d", { x: street.x + 30, y: street.y }, { flagged: false });
    c = applyAction(c, "c", { t: "strike" });
    c = applyAction(c, "c", { t: "flag" });
    expect(me(c, "c").flagged, "a refused strike holds nothing").toBe(false);
  });

  it("a truce still lowers both held flags, and a fall frees the fallen while the killer stays held", () => {
    let w = body(emptyWorld(), "a", street, { flagged: true, facing: { dx: 1, dy: 0 } });
    w = body(w, "b", { x: street.x + 30, y: street.y }, { flagged: true, facing: { dx: -1, dy: 0 } });
    w = applyAction(w, "a", { t: "strike" });
    const t = applyAction(w, "b", { t: "truce" });
    expect([me(t, "a").flagged, me(t, "b").flagged]).toEqual([false, false]);
    w = set(w, "b", { hp: 1 });
    w = set(w, "a", { strikeCd: 0 });
    w = applyAction(w, "a", { t: "strike" });
    expect(me(w, "b").deaths).toBe(1);
    expect((me(w, "b").flagHeldUntil ?? 0) > w.now, "the fallen stands down").toBe(false);
    w = applyAction(w, "b", { t: "flag" });
    expect(me(w, "b").flagged).toBe(false);
    w = applyAction(w, "a", { t: "flag" });
    expect(me(w, "a").flagged, "the killer's hold runs on").toBe(true);
  });

  it("a flag raised on the Grid is lowered wherever the body wakes; only raising needs flag ground", () => {
    const shrine = POSITIONS["care-shrine"];
    let w = body(emptyWorld(), "b", shrine, { flagged: true });
    w = body(w, "a", { x: shrine.x + 30, y: shrine.y }, { flagged: true, facing: { dx: -1, dy: 0 } });
    expect(me(w, "b").district).toBe("care");
    expect(chipVerbs(me(w, "b"), null, w.now).flag).toBe("LOWER FLAG");
    expect(verbsFor(ctxOf(w, "b"), "a").map(v => `${v.key}:${v.label}`)).toContain("V:Unflag");
    w = applyAction(w, "b", { t: "flag" });
    expect(me(w, "b").flagged).toBe(false);
    expect(me(w, "b").heard).toBe(LINES.FLAG_OFF);
    w = applyAction(w, "a", { t: "strike" });
    expect(me(w, "b").hp, "an unflagged body at the shrine is not struck").toBe(MAX_HP);
    // and an unflagged body still cannot raise one there
    w = applyAction(w, "b", { t: "flag" });
    expect(me(w, "b").flagged).toBe(false);
    expect(me(w, "b").heard).toBe(LINES.FLAG_WHERE);
    expect(chipVerbs(me(w, "b"), null, w.now).flag).toBeNull();
  });
});

describe("guests everywhere", () => {
  it("a locked guest reads the first altar and browses the stalls; its read leaves no mark on the place", () => {
    for (const id of ["crt-altar-1", "stall-1", "stall-2", "stall-3", "stall-4"]) {
      const at = POSITIONS[id];
      const w = guest(emptyWorld(), "g", at, { locked: true });
      const choice = id.startsWith("crt") ? "watch" : "browse";
      const out = applyAction(w, "g", { t: "interact", targetId: id, choice });
      expect(me(out, "g").heard, id).not.toBe(LINES.GUEST_LOCK);
      expect(out.pois[id], `${id} keeps its state`).toEqual(w.pois[id]);
    }
    // the threshold still refuses
    const t = POSITIONS["going-under"];
    const w = guest(emptyWorld(), "g", t, { locked: true, flags: { [F.WEATHER_NAMED]: 1, [F.BURIED_NARA]: 1 } });
    expect(me(applyAction(w, "g", { t: "interact", targetId: "going-under", choice: "under" }), "g").heard).toBe(LINES.GUEST_LOCK);
  });

  it("a locked guest is not invited to carry paper, wait under a bell or hold a broom; an unlocked guest still is", () => {
    const hubs: [string, string, string][] = [["officer", "side:officer:met", "carry paper"], ["omen", "side:omen:met", "wait under a bell"], ["keeper", "side:keeper:met", "hold a broom"]];
    for (const [npc, met, invite] of hubs) {
      const home = POSITIONS[`home:${npc}`] ?? POSITIONS[npc];
      const at = home ?? { x: 0, y: 0 };
      const talk = (locked: boolean) => {
        let w = guest(emptyWorld(), "g", at, { locked, flags: { [met]: 1 } });
        w = { ...w, npcs: { ...w.npcs, [npc]: { ...w.npcs[npc], x: at.x, y: at.y } } };
        return applyAction(w, "g", { t: "talk", npcId: npc });
      };
      const locked = me(talk(true), "g").dialogue;
      expect(locked?.text, npc).toBe(LINES.GUEST_LOCK);
      expect(locked?.choices.map(c => c.id), npc).toEqual(["leave"]);
      expect(me(talk(false), "g").dialogue?.text, npc).toContain(invite);
    }
  });

  it("the van is waved through at the van, clear of the hot street's enforcers", () => {
    const van = POSITIONS["armored-van"];
    let w = guest(emptyWorld(), "g", { x: van.x, y: van.y + 10 }, { quests: { [SQ.VAN]: 1 } });
    expect(verbsFor(ctxOf(w, "g"), "armored-van").map(v => v.choice)).toContain("side:van:wave");
    expect(SIDE_BY_ID[SQ.VAN].steps[1].target).toBe("armored-van");
    for (let i = 0; i < 60; i++) w = tickWorld(w, DT);
    expect(me(w, "g").hp, "nobody engages a body at the van").toBe(MAX_HP);
    w = applyAction(w, "g", { t: "interact", targetId: "armored-van", choice: "side:van:wave" });
    w = tickWorld(w, DT);
    expect(w.pois["hot-street"].state).toBe("hot");
  });
});

describe("the purse's numbers", () => {
  it("the funeral desk paid, or the garden buried, starts Nara's count of extractions again", () => {
    const desk = POSITIONS["funeral-desk"];
    let w = body(emptyWorld(), "a", desk, { bestand: 50, extractedSinceFuneral: 3, party: { ...spawnGuest("x").party, nara: "waiting" } });
    w = applyAction(w, "a", { t: "interact", targetId: "funeral-desk", choice: "pay" });
    expect(me(w, "a").party.nara).toBe("with");
    expect(me(w, "a").extractedSinceFuneral).toBe(0);
    const garden = POSITIONS["wreckage-garden"];
    let g = body(emptyWorld(), "b", garden, { extractedSinceFuneral: 4, party: { ...spawnGuest("x").party, nara: "waiting" }, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.OPERATOR]: 1 }, choices: { [C.OPERATOR]: "take" } });
    g = applyAction(g, "b", { t: "interact", targetId: "wreckage-garden", choice: "bury" });
    expect(me(g, "b").party.nara).toBe("with");
    expect(me(g, "b").extractedSinceFuneral).toBe(0);
  });

  it("the people who quote the weather quote the HUD's floored figure and the tax the node charges", () => {
    let w = body({ ...emptyWorld(), gestell: 39.6 }, "a", street);
    const ord = NPCS.ord.nodes.number.text as (ctx: Ctx) => string;
    expect(ord(ctxOf(w, "a"))).toContain("The process, at 39. Tax 9 percent");
    w = { ...w, gestell: 90.6 };
    const brink = NPCS.nara.nodes.brink.text as (ctx: Ctx) => string;
    const line = brink(ctxOf(w, "a"));
    expect(line).toContain("The weather at 90.");
    expect(line).not.toContain("ninety-one");
    w = { ...w, gestell: 91 };
    expect(brink(ctxOf(w, "a"))).toContain("At ninety-one");
  });

  it("a whole body keeps its repair paper", () => {
    const paper = { id: "paper:repair", kind: "paper" as const, name: "Repair paper", value: 6, qty: 1 };
    let w = body(emptyWorld(), "a", street, { hp: MAX_HP, items: [paper] });
    w = applyAction(w, "a", { t: "use", itemId: "paper:repair" });
    expect(me(w, "a").items.find(i => i.id === "paper:repair")?.qty).toBe(1);
    expect(me(w, "a").heard).toBe("Nothing to mend. The paper keeps.");
    w = set(w, "a", { hp: 40 });
    w = applyAction(w, "a", { t: "use", itemId: "paper:repair" });
    w = applyAction(w, "a", { t: "use", itemId: "paper:repair" });
    expect(me(w, "a").hp).toBe(MAX_HP);
    expect(me(w, "a").items.some(i => i.id === "paper:repair"), "a second press before the healed frame spends nothing").toBe(false);
  });

  it("the upkeep hour's journal does not promise a weather the sweeps never move", () => {
    const step = SIDE_BY_ID[SQ.UPKEEP].steps[0];
    expect(typeof step.detail === "string" ? step.detail : "").not.toContain("Gestell thins");
  });
});

describe("a city run for weeks", () => {
  it("an extraction digs a node's seed up, so the next Dweller's K has ground again", () => {
    let w = emptyWorld();
    const node = w.nodes[0];
    w = { ...w, nodes: w.nodes.map((n, i) => (i === 0 ? { ...n, seed: true } : n)), clearing: { ...w.clearing, seeds: [node.id] } };
    w = body(w, "a", node);
    w = applyAction(w, "a", { t: "interact", targetId: node.id, choice: "extract" });
    expect(w.nodes[0].seed).toBe(false);
    expect(w.clearing.seeds).not.toContain(node.id);
  });

  it("a body keeps one flag for the contest it last kept, not one per contest", () => {
    const ring = POSITIONS["clearing-ring"];
    let w = body(emptyWorld(), "v", ring, { movement: 5, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.MORTALITY]: 1, [F.PREPARE]: 1 } });
    for (let k = 1; k <= 3; k++) {
      w = { ...w, now: k * 1000, clearing: { ...w.clearing, open: true, openedAt: k * 1000, contest: { active: true, keep: 0, extract: 0, endsAt: k * 1000 + 60, votes: {} } } };
      const before = me(w, "v").readiness;
      w = applyAction(w, "v", { t: "interact", targetId: "clearing-ring", choice: "keep" });
      expect(me(w, "v").readiness, `contest ${k} pays`).toBeGreaterThan(before);
      const again = applyAction(w, "v", { t: "interact", targetId: "clearing-ring", choice: "keep" });
      expect(me(again, "v").readiness, `contest ${k} pays once`).toBe(me(w, "v").readiness);
    }
    const kept = Object.keys(me(w, "v").flags).filter(k => k.startsWith("clearing:kept"));
    expect(kept).toEqual([F.CLEARING_KEPT]);
    expect(me(w, "v").flags[F.CLEARING_KEPT]).toBe(3000);
  });
});

describe("the screen against the server", () => {
  it("the weather chip reads the viewer's own naming", () => {
    let w = body(emptyWorld(), "a", street, { flags: { [F.ANGEL]: 1, [F.WEATHER_NAMED]: 1 } });
    w = body(w, "b", street);
    expect(snapshotFor(w, "a").weatherNamed).toBe(true);
    expect(snapshotFor(w, "b").weatherNamed).toBe(false);
  });

  it("a hot street reads hot, not flagged: two unflagged Angels on it are not a fight", () => {
    const hot = POSITIONS["hot-street"];
    let w: WorldState = { ...emptyWorld(), gestell: 50 };
    w = { ...w, pois: { ...w.pois, "hot-street": { ...w.pois["hot-street"], state: "hot" } } };
    w = body(w, "a", hot, { facing: { dx: 1, dy: 0 } });
    w = body(w, "b", { x: hot.x + 30, y: hot.y });
    expect(snapshotFor(w, "a").prompt?.name ?? "").not.toContain("flagged");
    w = applyAction(w, "a", { t: "strike" });
    expect(me(w, "b").hp).toBe(MAX_HP);
    expect(me(w, "a").heard).toBe(LINES.PVP_FLAG_REQUIRED);
  });

  it("the ledger does not light BUY for a seller who is not on the Grid, nor LIST for a print decayed to nothing", () => {
    const print = { id: "copy:x", kind: "exhibition" as const, name: "A copy", value: 9, qty: 1 };
    let w = body(emptyWorld(), "seller", street, { items: [print], bestand: 50 });
    w = body(w, "buyer", street, { bestand: 50 });
    w = applyAction(w, "seller", { t: "market", op: "list", itemId: "copy:x", price: 20 });
    const row = () => ledgerModel(snapshotFor(w, "buyer")).listings.find(l => l.seller === me(w0, "seller").name)!;
    const w0 = w;
    expect(row().canBuy, "the seller is here").toBe(true);
    const players = new Map(w.players);
    players.delete("seller");
    w = { ...w, players };
    expect(row().canBuy, "the seller has gone").toBe(false);
    expect(row().away).toBe(true);
    w = w0;
    expect(row().away, "back on the Grid").toBe(false);
    const decayed = { ...print, value: 0 };
    const wd = set(w0, "buyer", { items: [decayed] });
    expect(ledgerModel(snapshotFor(wd, "buyer")).exhibition[0].listable).toBe(false);
  });

  it("the operator's desk reads vacant only to a body Vesper has gone for", () => {
    const desk = POSITIONS["operator-desk"];
    const hall = { [F.ANGEL]: 1, [F.UNDER]: 1, [F.HALL]: 1 };
    let w = body(emptyWorld(), "a", desk, { movement: 2, flags: hall });
    w = body(w, "b", desk, { movement: 2, flags: hall });
    w = applyAction(w, "a", { t: "interact", targetId: "operator-desk", choice: "take" });
    expect(w.pois["operator-desk"].state).toBe("closed");
    expect(snapshotFor(w, "a").prompt?.name).toBe("Operator's desk — vacant");
    expect(snapshotFor(w, "b").prompt?.name).toBe("Operator's desk");
  });

  it("the prepare step says where Nara stands for this body", () => {
    const prepare = questById(Q.M4)!.steps.find(s => s.id === "prepare")!;
    const detail = (flags: Record<string, number>, nara: Player["party"]["nara"]) => {
      const w = body(emptyWorld(), "a", street, { flags, party: { ...spawnGuest("x").party, nara } });
      return (prepare.detail as (ctx: Ctx) => string)(ctxOf(w, "a"));
    };
    expect(detail({ [F.OPERATOR]: 1 }, "waiting")).toContain("gone to the garden");
    expect(detail({ [F.OPERATOR]: 1, [F.GARDEN]: 1 }, "with")).toContain("at the ring already");
    expect(detail({ [F.OPERATOR]: 1, [F.GARDEN]: 1 }, "gone")).toContain(LINES.NARA_LEAVES ?? "Nara Vale is gone.");
  });
});

void W;
