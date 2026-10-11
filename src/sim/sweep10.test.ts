// The player-defect sweep, round ten (2026-10-11): what one viewer learns of another over the wire, a body crossing from one
// movement to the next with something still open, and where a body comes back. Each case is one finding, reproduced through
// the real reducers. (The unsealed body's listings are held in server/src/session.test.ts: the join does that.)
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { DT } from "./constants";
import { POSITIONS, districtAt } from "./map";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { npcView, snapshotFor } from "./snapshot";
import { applyAction, unsealBody } from "./actions";
import { applyNode } from "./economy";
import { applyClearing } from "./clearing";
import { questById } from "./quests";
import { C, F, Q } from "./content/ids";
import { SQ } from "./content/side";

function body(w: WorldState, id: string, at: { x: number; y: number }, patch: Partial<Player> = {}): WorldState {
  const players = new Map(w.players);
  const serial = 40 + players.size;
  players.set(id, { ...spawnGuest(id, w.now), guest: false, serial, name: `#00${serial}`, house: "mortals", aura: 20, restraint: 60, x: at.x, y: at.y, district: districtAt(at.x, at.y), flags: { [F.ANGEL]: 1, [F.UNDER]: 1 }, ...patch });
  return { ...w, players };
}
function guest(w: WorldState, id: string, at: { x: number; y: number }, patch: Partial<Player> = {}): WorldState {
  const players = new Map(w.players);
  players.set(id, { ...spawnGuest(id, w.now), x: at.x, y: at.y, district: districtAt(at.x, at.y), ...patch });
  return { ...w, players };
}
const me = (w: WorldState, id = "a"): Player => w.players.get(id)!;
const len = (q: string) => questById(q)!.steps.length;
function talk(w: WorldState, npc: string): WorldState {
  const v = npcView({ w, p: me(w), now: w.now }, w.npcs[npc])!;
  w = body(w, "a", { x: v.x + 20, y: v.y }, { ...me(w), x: v.x + 20, y: v.y, district: districtAt(v.x + 20, v.y) });
  return applyAction(w, "a", { t: "talk", npcId: npc });
}

describe("privacy over the wire", () => {
  it("the Clearing contest goes out as a tally: no viewer, a guest least of all, reads which body kept and which extracted", () => {
    const ring = POSITIONS["clearing-ring"];
    let w = body(emptyWorld(), "a", ring);
    w = body(w, "b", ring);
    w = guest(w, "g", ring);
    w = applyClearing(w, "a", "open");
    w = applyClearing(w, "a", "extract");
    w = applyClearing(w, "b", "keep");
    const contest = snapshotFor(w, "g").clearing.contest as Record<string, unknown> | null;
    expect(contest).toMatchObject({ active: true, keep: 1, extract: 1 });
    expect(contest?.votes).toBeUndefined();
  });

  it("who kept a node stays the server's: neither its keepers nor its first keeper ride the node view", () => {
    let w = emptyWorld();
    const n = w.nodes[0];
    w = body(w, "a", { x: n.x, y: n.y });
    w = guest(w, "g", { x: n.x, y: n.y });
    w = applyNode(w, "a", n.id, "keep");
    const view = snapshotFor(w, "g").nodes.find(v => v.id === n.id)! as Record<string, unknown>;
    expect(view.kept).toBe(true);
    expect(view.keepers).toBeUndefined();
    expect(view.keptBy).toBeUndefined();
  });
});

describe("where a body comes back: an Angel unsealed to a guest", () => {
  it("its journal does not point the guest into the Care with a side hour it cannot take", () => {
    let w = body(emptyWorld(), "a", POSITIONS["care-shrine"], { movement: 2, quests: { "side-care-unnamed-ledger": 0 } });
    expect(snapshotFor(w, "a").objective?.target?.district).toBe("care");
    const players = new Map(w.players);
    players.set("a", unsealBody(me(w), w.now));
    w = tickWorld({ ...w, players }, DT);
    const snap = snapshotFor(w, "a");
    expect(snap.objective?.quest ?? "").not.toBe("side-care-unnamed-ledger");
    expect((snap.sideObjectives ?? []).map(s => s.quest)).not.toContain("side-care-unnamed-ledger");
  });
});

describe("crossing a movement with something open", () => {
  it("Nara's plate left for later can still be answered after the third hour closes", () => {
    const flags = { [F.ANGEL]: 1, [F.UNDER]: 1, [F.OPERATOR]: 1, [F.GARDEN]: 1, [F.M3]: 1, [F.STRAIT]: 1, [F.FOUNDRY]: 1, [F.CABLE]: 1, [F.MAP]: 1, [F.BELL]: 1, [F.FAILED]: 1, [F.FORGE]: 1, [F.CAUL_MET]: 1, [F.CAUL_OFFER]: 1, [F.CAUL_ASKED]: 1, [F.BOARD]: 1, [F.TALKED_QUILL]: 1, [F.TALKED_NARA]: 1, [F.WAKING]: 1 };
    let w = body(emptyWorld(), "a", { x: 0, y: 0 }, {
      movement: 3, flags, party: { nara: "with", quill: "with", ord: "with" },
      choices: { [C.OPERATOR]: "refuse", [C.GLASS]: "read", [C.FORGE]: "spot" },
      quests: { [Q.M1]: len(Q.M1), [Q.M2]: len(Q.M2), [Q.M3]: len(Q.M3) - 1 },
    });
    w = talk(w, "nara");
    expect(me(w).dialogue?.node).toBe("garden-plate");
    w = applyAction(w, "a", { t: "choose", choiceId: "later" });
    for (let i = 0; i < 3; i++) w = tickWorld(w, DT);
    expect(me(w).movement).toBe(4);
    w = talk(w, "nara");
    expect(me(w).dialogue?.node, "the plate is still hers to ask").toBe("garden-plate");
  });

  it("a guest locked at the going-under with a side hour mid-way is not pointed at a step its prompt no longer offers", () => {
    const at = questById(Q.M1)!.steps.findIndex(s => s.id === "going-under");
    let w = guest(emptyWorld(), "g", POSITIONS["going-under"], { flags: { [F.WEATHER_NAMED]: 1, [F.BURIED_NARA]: 1, [F.TALKED_NARA]: 1 }, quests: { [Q.M1]: at, [SQ.VAN]: 0 } });
    w = applyAction(w, "g", { t: "interact", targetId: "going-under", choice: "under" });
    for (let i = 0; i < 3; i++) w = tickWorld(w, DT);
    expect(me(w, "g").locked).toBe(true);
    const snap = snapshotFor(w, "g");
    expect(snap.objective?.quest ?? "").not.toBe(SQ.VAN);
    expect((snap.sideObjectives ?? []).map(s => s.quest)).not.toContain(SQ.VAN);
  });

  it("a Nara waiting on her street in the fourth hour stands there, as she says, not at the ring", () => {
    const flags = { [F.ANGEL]: 1, [F.UNDER]: 1, [F.OPERATOR]: 1, [F.GARDEN]: 1, [F.M3]: 1, [F.MORTALITY]: 1, [F.TALKED_NARA]: 1 };
    let w = body(emptyWorld(), "a", { x: 0, y: 0 }, {
      movement: 4, flags, party: { nara: "waiting", quill: "with", ord: "with" },
      choices: { [C.OPERATOR]: "refuse", [C.GLASS]: "read", [C.FORGE]: "spot", [C.GARDEN]: "numbered", [C.MORTALITY]: "watch" },
      quests: { [Q.M1]: len(Q.M1), [Q.M2]: len(Q.M2), [Q.M3]: len(Q.M3), [Q.M4]: 1 },
    });
    const v = npcView({ w, p: me(w), now: w.now }, w.npcs.nara)!;
    expect(v.district).not.toBe("clearing");
    w = talk(w, "nara");
    expect(me(w).dialogue?.node).toBe("waiting");
  });
});
