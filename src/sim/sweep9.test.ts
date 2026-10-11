// The player-defect sweep, round nine (2026-10-11): the cues against what happened (cues.test.ts holds those), systems
// colliding in one step, and a guest becoming an Angel. Each case is one finding, reproduced through the real reducers.
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { DT, LAUNCH_OFFSET } from "./constants";
import { NPC_STATIONS, POSITIONS, districtAt } from "./map";
import { emptyWorld, spawnGuest, tickWorld } from "./world";
import { npcView, snapshotFor } from "./snapshot";
import { applyAction, unsealBody } from "./actions";
import { GUEST_LOCK } from "./content/lines";
import { F } from "./content/ids";

function body(w: WorldState, id: string, at: { x: number; y: number }, patch: Partial<Player> = {}): WorldState {
  const players = new Map(w.players);
  const serial = 40 + players.size;
  players.set(id, { ...spawnGuest(id, w.now), guest: false, serial, name: `#00${serial}`, house: "mortals", aura: 20, restraint: 60, x: at.x, y: at.y, district: districtAt(at.x, at.y), flags: { [F.ANGEL]: 1, [F.UNDER]: 1 }, ...patch });
  return { ...w, players };
}
const me = (w: WorldState, id = "a"): Player => w.players.get(id)!;

describe("systems colliding in one step", () => {
  it("the launch's voice does not send Caul to the Grid's gate for a body that sees him at his desk", () => {
    const desk = NPC_STATIONS["caul-glass"];
    let w = body(emptyWorld(), "a", { x: desk.x, y: desk.y + 30 }, { movement: 3, flags: { [F.ANGEL]: 1, [F.UNDER]: 1, [F.M3]: 1, [F.FAILED]: 1 } });
    w = { ...w, now: LAUNCH_OFFSET - 0.01 };
    w = tickWorld(w, DT);
    expect(me(w).dialogue?.node).toBe("oval-launch");
    expect(npcView({ w, p: me(w), now: w.now }, w.npcs.caul)?.state).toBe("glass");
    expect(me(w).dialogue?.text).not.toContain("Grid's gate");
  });
});

describe("a guest becoming an Angel, and an Angel unsealed back to a guest", () => {
  it("an unsealed Angel at the threshold hears the guest's lock, and its journal holds no Movement II step it cannot take", () => {
    let w = body(emptyWorld(), "a", { x: 0, y: 0 }, { movement: 2, flags: { [F.ANGEL]: 1, [F.UNDER]: 1 } });
    const players = new Map(w.players);
    players.set("a", unsealBody(me(w), w.now));
    w = tickWorld({ ...w, players }, DT);
    const at = POSITIONS["going-under"];
    expect(Math.hypot(me(w).x - at.x, me(w).y - at.y)).toBeLessThan(80);
    w = applyAction(w, "a", { t: "interact", targetId: "going-under", choice: "look" });
    expect(me(w).heard).toBe(GUEST_LOCK);
    const objective = snapshotFor(w, "a").objective;
    expect(objective?.id ?? "", "no Movement II step for a sealless body").not.toMatch(/^m2/);
  });
});
