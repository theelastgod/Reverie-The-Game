// The player-defect sweep, round three (2026-10-04): the K kits and the messengers, personas on the spine, two bodies on
// the spine together, the journal and the map, reconnects and the protocol's edges, and the content that reads the weather.
// Each case here is one finding, reproduced through the real reducers and held with the real content.
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "./types";
import { KIT_COOLDOWN } from "./constants";
import { districtAt } from "./map";
import { emptyWorld, spawnGuest } from "./world";
import { applyAction } from "./actions";
import { LINES } from "./content";
import { SIDE_POI_VERBS } from "./content/side-pois";
import { POI_CONFIGS } from "./content/pois";
import type { Ctx } from "./types";

function body(w: WorldState, id: string, x: number, y: number, patch: Partial<Player> = {}): WorldState {
  const players = new Map(w.players);
  const serial = 40 + players.size;
  players.set(id, { ...spawnGuest(id, w.now), guest: false, serial, name: `#00${serial}`, house: "earth", x, y, district: districtAt(x, y), ...patch });
  return { ...w, players };
}
const me = (w: WorldState, id: string): Player => w.players.get(id)!;

describe("the K kits", () => {
  it("a Dweller's K plants in the nearest bare node in reach and spends nothing when every node in reach is seeded", () => {
    const n = emptyWorld().nodes[0];
    let w = body(emptyWorld(), "a", n.x + 10, n.y, { messenger: "dweller" });
    w = body(w, "b", n.x + 10, n.y, { messenger: "dweller" });
    w = applyAction(w, "a", { t: "kit" });
    expect(w.nodes[0].seed).toBe(true);
    expect(me(w, "a").kitCd).toBe(KIT_COOLDOWN);
    // The only node in reach holds a seed already: the second Dweller's press says why and keeps its kit.
    w = applyAction(w, "b", { t: "kit" });
    expect(me(w, "b").kitCd, "nothing planted, nothing spent").toBe(0);
    expect(me(w, "b").heard).toBe(LINES.KIT_NEED.dweller);
  });
});

describe("the content that reads the weather", () => {
  const say = (verb: { say?: unknown } | undefined, ctx: Ctx): string => {
    const s = verb?.say;
    return typeof s === "function" ? (s as (c: Ctx) => string)(ctx) : String(s ?? "");
  };
  it("the front's read at the forecast glass says the drift the glass says, and the way the weather is moving", () => {
    for (const gestell of [60, 20]) {
      const w = { ...emptyWorld(), gestell };
      const ctx: Ctx = { w, p: { ...spawnGuest("a"), guest: false, house: "sky" }, now: w.now };
      const front = say(SIDE_POI_VERBS["forecast-glass"].find(v => v.choice === "side:front:read"), ctx);
      const glass = say(POI_CONFIGS["forecast-glass"].verbs.find(v => v.choice === "read"), ctx);
      const moving = gestell > 40 ? "The drift is down: the weather eases toward baseline." : "The drift is up: the weather climbs toward baseline.";
      expect(glass, `the glass at ${gestell}`).toContain(moving);
      expect(front, `the front's read at ${gestell}`).toContain(moving);
      expect(front, "the band is its own sentence").toMatch(/^\w+ weather\. The drift/);
    }
  });
});
