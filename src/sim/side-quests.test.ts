import { describe, expect, it } from "vitest";

/**
 * Every side hour, walked through the public reducers against the real
 * content. An Angel who has done the spine (every other side hour already
 * behind them, so only the hour under test can wake) is set down at each
 * target and does exactly what the hour's own verbs and dialogue ask: an
 * interaction on a POI, a node, a wreckage, or a line with the secondary
 * cast. Each step must advance on the next tick; at the end the change the
 * hour promises (a POI state, a person's place, a cult object, a House
 * standing) must be visible in the world.
 */
import { DT } from "./constants";
import { POSITIONS, districtAt } from "./map";
import type { ClientMsg } from "./protocol";
import { C, F, Q, W } from "./content/ids";
import { LINES } from "./content";
import { SIDE, SIDE_BY_ID, SIDE_ITEMS, SIDE_PLACES, SQ, SW, offerKey } from "./content/side";
import type { Fourfold, Item, Player, WorldState } from "./types";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { applyAction } from "./actions";
import { verbsFor } from "./interact";
import { questById, questProgress } from "./quests";
import { npcView, snapshotFor } from "./snapshot";

const ME = "me";
const CAST = ["officer", "omen", "keeper", "sexton", "desk"];
const REFUSALS = [LINES.ALREADY, LINES.CANT_AFFORD, LINES.GUEST_LOCK, LINES.SPECTATOR, LINES.FROZEN];

// ---------------------------------------------------------------- helpers

function me(w: WorldState, id = ME): Player {
  const p = w.players.get(id);
  if (!p) throw new Error(`no player ${id}`);
  return p;
}

function add(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}

/** The test's one shortcut: the body is set down at a point. */
function place(w: WorldState, id: string, x: number, y: number): WorldState {
  return add(w, { ...me(w, id), x, y, district: districtAt(x, y), facing: { dx: 1, dy: 0 } });
}

function goTo(w: WorldState, id: string, positionId: string): WorldState {
  const pos = POSITIONS[positionId];
  if (!pos) throw new Error(`no position ${positionId}`);
  return place(w, id, pos.x, pos.y);
}

function tick(w: WorldState, n = 1): WorldState {
  let cur = w;
  for (let i = 0; i < n; i++) cur = tickWorld(cur, DT);
  return cur;
}

const act = (w: WorldState, id: string, msg: ClientMsg): WorldState => applyAction(w, id, msg);
const interact = (w: WorldState, targetId: string, choice: string): WorldState => act(w, ME, { t: "interact", targetId, choice });

function closeAll(w: WorldState): WorldState {
  let cur = w;
  for (let i = 0; i < 8 && me(cur).dialogue; i++) cur = act(cur, ME, { t: "close" });
  expect(me(cur).dialogue).toBeNull();
  return cur;
}

/** Stand where this viewer sees the person, speak, pick a line from their hub, take the "go" if the hour is handed out, and leave. */
function talkChoose(w: WorldState, npcId: string, choiceId: string): WorldState {
  const shared = w.npcs[npcId];
  const view = shared ? npcView({ w, p: me(w), now: w.now }, shared) : null;
  if (!view) throw new Error(`${npcId} is not present`);
  let cur = place(w, ME, view.x, view.y);
  cur = act(cur, ME, { t: "talk", npcId });
  const d = me(cur).dialogue;
  expect(d, `${npcId} answers`).not.toBeNull();
  expect(d!.node, `${npcId} opens the hub`).toBe("hub");
  expect(d!.choices.map(c => c.id), `${npcId}'s hub offers ${choiceId}`).toContain(choiceId);
  cur = act(cur, ME, { t: "choose", choiceId });
  const next = me(cur).dialogue;
  expect(next, `${npcId}/${choiceId} opens a node`).not.toBeNull();
  if (next!.choices.some(c => c.id === "go")) cur = act(cur, ME, { t: "choose", choiceId: "go" });
  return closeAll(cur);
}

/** Strike a clerk until it falls, then bury what it left. */
function slay(w: WorldState, enemyId: string): WorldState {
  const e0 = w.enemies.find(e => e.id === enemyId);
  expect(e0, `${enemyId} exists`).toBeDefined();
  expect(e0!.state).not.toBe("dead");
  let cur = place(w, ME, e0!.x - 40, e0!.y);
  for (let i = 0; i < 40; i++) {
    if (cur.enemies.find(e => e.id === enemyId)!.state === "dead") break;
    cur = act(cur, ME, { t: "strike" });
    cur = tick(cur, 10);
  }
  expect(cur.enemies.find(e => e.id === enemyId)!.state, `${enemyId} fell`).toBe("dead");
  expect(me(cur).dead).toBe(false);
  const wreck = cur.wreckage.find(r => r.fromId === enemyId && !r.buried);
  expect(wreck, `${enemyId} left wreckage`).toBeDefined();
  cur = place(cur, ME, wreck!.x, wreck!.y);
  const buried = me(cur).history.buried;
  cur = interact(cur, wreck!.id, "bury");
  expect(cur.wreckage.find(r => r.id === wreck!.id)!.buried).toBe(true);
  expect(cur.graves.some(g => g.id === `grave-${wreck!.id}`)).toBe(true);
  expect(me(cur).history.buried).toBe(buried + 1);
  return cur;
}

// ---------------------------------------------------------------- the fixture

function baseFlags(): Record<string, number> {
  const flags: Record<string, number> = {};
  for (const key of Object.values(F)) flags[key] = 1;
  for (const who of CAST) {
    flags[`side:${who}:met`] = 1;
    flags[`side:${who}:visits`] = 2;
  }
  return flags;
}

/** An Angel with the spine behind them and every side hour but one already done, so only that one can wake. */
function angel(questId: string, extraFlags: Record<string, number>, untouched: string[]): Player {
  const quests: Record<string, number> = {};
  for (const q of SIDE) if (q.id !== questId && !untouched.includes(q.id)) quests[q.id] = q.steps.length;
  for (const id of Object.values(Q)) quests[id] = questById(id)!.steps.length;
  return {
    ...spawnGuest(ME),
    guest: false,
    serial: 42,
    name: "#0042",
    house: "mortals",
    messenger: "herald",
    winkSchool: "hint",
    auraSeed: 10,
    aura: 20,
    bestand: 200,
    movement: 4,
    flags: { ...baseFlags(), ...extraFlags },
    choices: {
      [C.FREEZE]: "signed",
      [C.FORGE]: "spot",
      [C.OPERATOR]: "take",
      [C.MEMORIAL]: "voice",
      [C.WEATHER]: "process",
      [C.MORTALITY]: "lastword",
    },
    quests,
  };
}

function world(script: Script): WorldState {
  const w = emptyWorld();
  const pois = { ...w.pois };
  for (const [id, state] of Object.entries(script.pois ?? {})) pois[id] = { state, by: "", at: 0, count: 1 };
  const flags = { [W.MEMORIAL_VOICE]: 1, [W.VESPER_GONE]: 1, [W.GARDEN_BURIED]: 1 };
  return add({ ...w, pois, flags }, angel(script.id, script.flags ?? {}, script.untouched ?? []));
}

// ---------------------------------------------------------------- scripts

type Act =
  | { kind: "poi"; id: string; choice: string; times: number }
  | { kind: "node"; id: string; choice: "keep" | "extract" }
  | { kind: "talk"; npc: string; choice: string }
  | { kind: "slay"; enemy: string }
  | { kind: "craft" };

type Check = (w: WorldState, p: Player) => void;

type Script = {
  id: string;
  /** Personal flags the hour needs before it is offered, on top of the finished spine. */
  flags?: Record<string, number>;
  /** POI states the world starts in for this hour. */
  pois?: Record<string, string>;
  /** Where the body starts, when the hour opens by standing somewhere. */
  at?: string;
  /** Who hands the hour out, and which line asks for it. Absent: the hour wakes on its own. */
  offer?: { npc: string; choice: string };
  /** Offered hours left unstarted instead of finished, when a finished one would outrank this hour's change for the viewer. */
  untouched?: string[];
  /** What the body does for each step, in order. */
  steps: Act[][];
  /** The change the hour promises. */
  check: Check;
};

const poi = (id: string, choice: string, times = 1): Act => ({ kind: "poi", id, choice, times });
const node = (id: string, choice: "keep" | "extract"): Act => ({ kind: "node", id, choice });
const talk = (npc: string, choice: string): Act => ({ kind: "talk", npc, choice });
const slayAct = (enemy: string): Act => ({ kind: "slay", enemy });
const craft: Act = { kind: "craft" };

const poiIs = (id: string, state: string): Check => w => {
  expect(w.pois[id].state, `${id} is ${state}`).toBe(state);
  expect(snapshotFor(w, ME).pois.find(p => p.id === id)?.state).toBe(state);
};

const npcAt = (id: string, placeId: string, state: string): Check => w => {
  const pos = SIDE_PLACES[placeId];
  expect(w.npcs[id], `${id} moved to ${placeId}`).toMatchObject({ x: pos.x, y: pos.y, district: pos.district, present: true, state });
  expect(snapshotFor(w, ME).npcs.find(n => n.id === id), `${id} is seen at ${placeId}`).toMatchObject({ x: pos.x, y: pos.y, state });
};

const holds = (item: Item): Check => (w, p) => {
  expect(p.items.find(i => i.id === item.id), `${item.name} in hand`).toMatchObject({ kind: "cult", bound: true, qty: 1 });
  // cult does not list
  const listed = act(w, ME, { t: "market", op: "list", itemId: item.id, price: 5 });
  expect(listed.market).toEqual([]);
  expect(me(listed).items.find(i => i.id === item.id)?.qty).toBe(1);
};

const standing = (house: Fourfold, n: number): Check => w => {
  expect(w.houses.standing[house], `${house} stands at ${n}`).toBe(n);
  expect(snapshotFor(w, ME).houses.standing[house]).toBe(n);
};

const all = (...checks: Check[]): Check => (w, p) => checks.forEach(c => c(w, p));

const SCRIPTS: Script[] = [
  // ---------------------------------------------------------------- Nave
  {
    id: SQ.THIRD_ALTAR,
    steps: [[poi("crt-altar-1", "side:altar:count")], [poi("crt-altar-2", "side:altar:light")]],
    check: all(poiIs("crt-altar-2", "lit"), w => expect(w.flags[SW.ALTAR_LIT]).toBe(1)),
  },
  {
    id: SQ.UNSPENT,
    steps: [[node("nave-node-1", "keep"), node("nave-node-2", "keep")], [poi("crt-altar-1", "side:unspent:touch")]],
    check: all(poiIs("crt-altar-1", "lit"), w => expect(w.nodes.filter(n => n.kept).map(n => n.id)).toEqual(["nave-node-1", "nave-node-2"])),
  },
  {
    id: SQ.ANOTHER_NIGHT,
    steps: [[poi("memorial-recorder", "side:night:sit")], [poi("memorial-recorder", "side:night:listen")]],
    check: holds(SIDE_ITEMS.silence),
  },
  {
    id: SQ.DOING_A_JOB,
    steps: [[slayAct("desk-three")], [poi("safety-plaque", "side:job:names")]],
    check: standing("mortals", 1),
  },
  // ---------------------------------------------------------------- Wet Grid
  {
    id: SQ.VAN,
    at: "stall-4",
    steps: [[poi("stall-4", "side:van:ask")], [poi("hot-street", "side:van:wave")]],
    check: all(poiIs("hot-street", "hot"), w => expect(w.flags[SW.VAN_PARKED]).toBe(1)),
  },
  {
    id: SQ.COPY,
    steps: [[poi("listing-board", "side:copy:read")], [poi("listing-board", "side:copy:down")]],
    check: w => {
      // the shared Quill went to the board; a viewer who went under still finds her at the forge
      const pos = SIDE_PLACES["quill-board"];
      expect(w.npcs.quill).toMatchObject({ x: pos.x, y: pos.y, district: pos.district, present: true, state: "board" });
      expect(w.flags["sunk:listing"]).toBe(2);
    },
  },
  {
    id: SQ.LISTING_FEE,
    steps: [[poi("stall-1", "side:fee:pay"), poi("stall-2", "side:fee:pay")], [poi("stall-3", "side:fee:pay"), poi("stall-4", "side:fee:pay")]],
    check: all(standing("mortals", 1), w => expect(w.flags[SW.FEES_PAID]).toBe(1), w => expect(w.flags["sunk:listing"]).toBe(8)),
  },
  {
    id: SQ.TRAY,
    steps: [[poi("forge-tray", "side:tray:bank")], [poi("forge-tray", "side:tray:take")]],
    check: all(holds(SIDE_ITEMS.spottedHint), poiIs("forge-tray", "warm")),
  },
  {
    id: SQ.DESK,
    steps: [[poi("operator-desk", "side:desk:read")], [poi("operator-desk", "side:desk:close")]],
    check: all(poiIs("operator-desk", "closed"), w => expect(w.flags[SW.DESK_CLOSED]).toBe(1)),
  },
  // ---------------------------------------------------------------- the Care
  {
    id: SQ.LEDGER,
    offer: { npc: "sexton", choice: "ledger" },
    steps: [[slayAct("desk-three"), slayAct("annex-runner")], [talk("sexton", "ledger-done")]],
    check: npcAt("sexton", "sexton-garden", "garden"),
  },
  {
    id: SQ.TWELVE,
    flags: { [offerKey(SQ.LEDGER)]: 1 },
    offer: { npc: "sexton", choice: "twelve" },
    steps: [[poi("funeral-desk", "side:twelve:plate")], [poi("wreckage-garden", "side:twelve:bury")], [talk("sexton", "twelve-named")]],
    check: all(holds(SIDE_ITEMS.twelfthName), w => expect(w.flags[SW.TWELVE_NAMED]).toBe(1), (_w, p) => expect(p.history.buried).toBe(1)),
  },
  {
    id: SQ.STANDING,
    steps: [[poi("funeral-desk", "side:standing:funeral")], [poi("care-shrine", "side:standing:enter")]],
    check: standing("mortals", 2),
  },
  {
    id: SQ.LAMP,
    offer: { npc: "sexton", choice: "lamp" },
    steps: [[poi("funeral-desk", "side:lamp:light")], [talk("sexton", "lamp-told")]],
    check: all(poiIs("hall-mortals", "lit"), w => expect(w.flags[SW.LAMP_LIT]).toBe(1)),
  },
  // ---------------------------------------------------------------- Safety Annex
  {
    id: SQ.FORM9,
    steps: [[talk("officer", "form9")], [poi("tax-window", "side:form9:file")]],
    check: all(poiIs("safety-desk", "frozen"), w => expect(w.flags[SW.FORM9_FILED]).toBe(1)),
  },
  {
    id: SQ.HONEST,
    offer: { npc: "officer", choice: "grief" },
    steps: [[poi("wreckage-garden", "side:honest:look")], [talk("officer", "twelve")]],
    check: all(npcAt("officer", "officer-clearing", "clearing"), w => expect(w.flags[SW.OFFICER_WALKED]).toBe(1)),
  },
  {
    id: SQ.TAX,
    steps: [[poi("tax-window", "side:tax:read")], [poi("tax-window", "side:tax:pay")]],
    check: standing("mortals", 1),
  },
  {
    id: SQ.NOTICE,
    flags: { [offerKey(SQ.CENSUS)]: 1 },
    offer: { npc: "officer", choice: "notice" },
    steps: [[talk("keeper", "notice")], [talk("officer", "notice-report")]],
    check: npcAt("keeper", "keeper-bell", "guarding"),
  },
  {
    id: SQ.CENSUS,
    offer: { npc: "officer", choice: "census" },
    // the Officer's later hour outranks the census for a viewer who did both; here he has not yet
    untouched: [SQ.HONEST],
    steps: [[poi("shrine-1", "side:census:first")], [poi("shrine-3", "side:census:last")], [talk("officer", "census-report")]],
    check: npcAt("officer", "officer-ring", "ring"),
  },
  // ---------------------------------------------------------------- Kerb of Hours
  {
    id: SQ.HOUR,
    offer: { npc: "omen", choice: "bell" },
    steps: [[poi("hour-bell", "side:hour:wait", 3)], [talk("omen", "struck")]],
    check: all(poiIs("hour-bell", "struck"), w => expect(w.flags[SW.HOUR_STRUCK]).toBe(1)),
  },
  {
    id: SQ.FRONT,
    steps: [[poi("forecast-glass", "side:front:read")], [talk("omen", "front")]],
    check: all(standing("sky", 2), poiIs("forecast-glass", "lit")),
  },
  {
    id: SQ.HOURS,
    offer: { npc: "omen", choice: "buy" },
    steps: [[poi("omen-terrace", "side:hours:buy")], [poi("hour-bell", "side:hours:wait")], [talk("omen", "confront")]],
    check: npcAt("omen", "omen-glass", "glass"),
  },
  {
    id: SQ.SKY_GLASS,
    pois: { "hour-bell": "struck" },
    steps: [[poi("forecast-glass", "side:front:read")], [poi("forecast-glass", "side:skyhall:take")]],
    check: holds(SIDE_ITEMS.omenGlass),
  },
  // ---------------------------------------------------------------- Gold Ring
  {
    id: SQ.MUTE,
    offer: { npc: "keeper", choice: "mute" },
    steps: [[poi("shrine-2", "side:mute:look")], [poi("mute-bell", "side:mute:hang")]],
    check: all(poiIs("mute-bell", "rung"), (_w, p) => expect(p.winke).toBe(1)),
  },
  {
    id: SQ.UPKEEP,
    offer: { npc: "keeper", choice: "upkeep" },
    steps: [[poi("shrine-1", "side:sweep:first"), poi("shrine-2", "side:sweep:second")], [poi("shrine-3", "side:sweep:last")]],
    check: all(standing("divinities", 2), w => expect(w.flags["sunk:upkeep"]).toBe(15)),
  },
  {
    id: SQ.VAULT,
    offer: { npc: "keeper", choice: "vault" },
    steps: [[craft, poi("cult-vault", "side:vault:leave")], [talk("keeper", "vault-done")]],
    check: all(holds(SIDE_ITEMS.vaultSeal), poiIs("cult-vault", "open"), (_w, p) => expect(p.items.some(i => i.id === "copy:wink")).toBe(false)),
  },
  {
    id: SQ.STEP,
    offer: { npc: "keeper", choice: "sweep" },
    steps: [[poi("shrine-1", "side:step:sweep")], [talk("keeper", "swept")]],
    check: poiIs("shrine-1", "kept"),
  },
  // ---------------------------------------------------------------- the Organs
  {
    id: SQ.TOLL,
    offer: { npc: "desk", choice: "toll" },
    steps: [[poi("cold-desk", "side:toll:pay")], [poi("organ-strait", "side:toll:read")]],
    check: all(standing("earth", 2), w => expect(w.flags["sunk:tax"]).toBe(6)),
  },
  {
    id: SQ.CABLE,
    offer: { npc: "desk", choice: "cable" },
    steps: [[node("organ-node-strait", "keep")], [talk("desk", "cable-told")]],
    check: all(poiIs("organ-cable", "quiet"), w => expect(w.flags[SW.CABLE_QUIET]).toBe(1)),
  },
  {
    id: SQ.FOUNDRY,
    offer: { npc: "desk", choice: "foundry" },
    steps: [[poi("organ-foundry", "side:foundry:rake")], [talk("desk", "foundry-told")]],
    check: all(npcAt("desk", "desk-foundry", "foundry"), poiIs("organ-foundry", "dark")),
  },
  {
    id: SQ.COLUMN,
    offer: { npc: "desk", choice: "column" },
    steps: [[poi("organ-strait", "side:column:strait")], [poi("organ-foundry", "side:column:foundry")], [poi("organ-cable", "side:column:cable")]],
    check: holds(SIDE_ITEMS.secondColumn),
  },
  // ---------------------------------------------------------------- the Clearing
  {
    id: SQ.SEED,
    offer: { npc: "sexton", choice: "seed" },
    steps: [[poi("wreckage-garden", "side:seed:take")], [poi("seed-1", "side:seed:turn")]],
    check: all(poiIs("seed-1", "seeded"), w => expect(w.flags[SW.SEEDED]).toBe(1)),
  },
  {
    id: SQ.CONTEST,
    steps: [[poi("seed-2", "side:contest:stand", 3)], [poi("seed-3", "side:contest:read")]],
    check: standing("mortals", 2),
  },
  {
    id: SQ.SEASON,
    steps: [[poi("seed-4", "side:season:face")], [talk("omen", "season")]],
    check: holds(SIDE_ITEMS.seasonMark),
  },
];

// ---------------------------------------------------------------- one act

function perform(w: WorldState, a: Act): WorldState {
  switch (a.kind) {
    case "poi": {
      let cur = goTo(w, ME, a.id);
      for (let i = 0; i < a.times; i++) {
        const before = me(cur);
        // the client only sends what the prompt offers: the hour's verb must win its key while the hour is live
        const offered = verbsFor({ w: cur, p: before, now: cur.now }, a.id).map(v => v.choice);
        expect(offered, `${a.id} offers ${a.choice} in the prompt`).toContain(a.choice);
        const prompt = snapshotFor(cur, ME).prompt;
        expect(prompt?.targetId, `the nearest prompt is ${a.id}`).toBe(a.id);
        cur = interact(cur, a.id, a.choice);
        expect(me(cur), `${a.id} ${a.choice} did something`).not.toBe(before);
        expect(REFUSALS, `${a.id} ${a.choice} was not refused`).not.toContain(me(cur).heard);
      }
      return cur;
    }
    case "node": {
      const before = w.nodes.find(n => n.id === a.id)!;
      const cur = interact(goTo(w, ME, a.id), a.id, a.choice);
      expect(REFUSALS, `${a.id} ${a.choice} was not refused`).not.toContain(me(cur).heard);
      const after = cur.nodes.find(n => n.id === a.id)!;
      if (a.choice === "keep") expect(after.kept).toBe(true);
      else expect(after.charges).toBe(before.charges - 1);
      return cur;
    }
    case "talk":
      return talkChoose(w, a.npc, a.choice);
    case "slay":
      return slay(w, a.enemy);
    case "craft": {
      const cur = interact(goTo(w, ME, "forge-tray"), "forge-tray", "craft");
      expect(me(cur).items.find(i => i.id === "copy:wink")).toMatchObject({ kind: "exhibition" });
      return cur;
    }
    default:
      return w;
  }
}

// ---------------------------------------------------------------- the walk

describe("every side hour, walked", () => {
  it("has a script for every side quest and nothing else", () => {
    expect(SCRIPTS.map(s => s.id).sort()).toEqual(SIDE.map(q => q.id).sort());
    expect(new Set(SCRIPTS.map(s => s.id)).size).toBe(SCRIPTS.length);
  });

  for (const script of SCRIPTS) {
    const q = SIDE_BY_ID[script.id];
    it(`${q.id}: ${q.title}`, () => {
      expect(q, script.id).toBeDefined();
      expect(script.steps.length, "one act list per step").toBe(q.steps.length);

      let w = world(script);
      if (script.at) w = goTo(w, ME, script.at);
      w = tick(w);
      if (script.offer) {
        expect(questProgress(me(w), q.id).started, `${q.id} waits for the offer`).toBe(false);
        w = talkChoose(w, script.offer.npc, script.offer.choice);
        expect(me(w).flags[offerKey(q.id)]).toBe(1);
      }
      expect(questProgress(me(w), q.id)).toEqual({ started: true, step: 0, done: false });
      for (const other of SIDE) {
        if (other.id === q.id) continue;
        if (script.untouched?.includes(other.id)) expect(questProgress(me(w), other.id).started, `${other.id} stays unstarted`).toBe(false);
        else expect(questProgress(me(w), other.id).done, `${other.id} stays finished`).toBe(true);
      }
      expect(snapshotFor(w, ME).objective).toMatchObject({ quest: q.id, step: q.steps[0].id, movement: q.movement });

      q.steps.forEach((s, i) => {
        expect(questProgress(me(w), q.id).step, `${q.id}/${s.id} is live`).toBe(i);
        const objective = snapshotFor(w, ME).objective;
        expect(objective?.step).toBe(s.id);
        expect(objective?.target, `${q.id}/${s.id} points somewhere`).not.toBeNull();
        for (const a of script.steps[i]) w = perform(w, a);
        w = tick(w);
        expect(questProgress(me(w), q.id).step, `${q.id}/${s.id} advances`).toBe(i + 1);
      });

      expect(questProgress(me(w), q.id).done).toBe(true);
      script.check(w, me(w));
      expect(me(w).dead).toBe(false);
      expect(me(w).guest).toBe(false);

      // finishing is once: more ticks change none of what the hour changed
      const later = tick(w, 4);
      expect(questProgress(me(later), q.id).done).toBe(true);
      expect(later.pois).toEqual(w.pois);
      expect(later.houses.standing).toEqual(w.houses.standing);
      expect(later.npcs).toEqual(w.npcs);
      expect(me(later).items).toEqual(me(w).items);
    });
  }
});

describe("side objectives in the snapshot", () => {
  it("lists every active side hour with its title and a resolved target, newest first, capped", async () => {
    const { snapshotFor } = await import("./snapshot");
    const { applyEffects } = await import("./effects");
    let w = emptyWorld();
    const a: Player = { ...spawnGuest("a"), guest: false, serial: 42, name: "#0042", house: "earth", messenger: "herald", winkSchool: "hint", auraSeed: 10, aura: 10, flags: { angel: 1, under: 1, m3: 1 }, movement: 3 };
    w = { ...w, players: new Map([["a", a]]) };
    const started = SIDE.slice(0, 8);
    for (const q of started) w = applyEffects(w, "a", [{ kind: "quest", id: q.id, op: "start" }]);
    const snap = snapshotFor(w, "a");
    expect(snap.sideObjectives.length).toBeLessThanOrEqual(6);
    expect(snap.sideObjectives.length).toBeGreaterThan(0);
    for (const so of snap.sideObjectives) {
      const q = SIDE_BY_ID[so.quest];
      expect(q, so.quest).toBeTruthy();
      expect(so.questTitle).toBe(q.title);
      expect(so.district).toBe(q.district);
      expect(so.title).toBe(q.steps[w.players.get("a")!.quests[q.id]].title);
      if (so.target) expect(Number.isFinite(so.target.x) && Number.isFinite(so.target.y)).toBe(true);
    }
    // Newest first: the last started quest that is still active leads.
    const activeIds = started.filter(q => (w.players.get("a")!.quests[q.id] ?? 0) < q.steps.length).map(q => q.id);
    expect(snap.sideObjectives[0].quest).toBe(activeIds[activeIds.length - 1]);
    // Guests never carry side hours they cannot start; a fresh guest has none.
    const g = { ...w, players: new Map([["g", spawnGuest("g")]]) };
    expect(snapshotFor(g, "g").sideObjectives).toEqual([]);
  });
});
