import { describe, expect, it } from "vitest";
import { EXHIBIT_DECAY, COPY_PRICE } from "./constants";
import { listOwn, tickMarket, applyMarket } from "./economy";
import { emptyWorld, spawnGuest } from "./world";
import { snapshotFor, stepViews } from "./snapshot";
import type { Player, WorldState } from "./types";

const copy = () => ({ id: "copy:wink", kind: "exhibition" as const, name: "Printed Wink", qty: 1, value: COPY_PRICE });
const add = (w: WorldState, p: Player): WorldState => ({ ...w, players: new Map(w.players).set(p.id, p) });
const angel = (id: string, n: number): Player => ({ ...spawnGuest(id), guest: false, serial: n, name: `#${n}`, bestand: 0 });

describe("probe", () => {
  it("13 sellers: the first still sees and cancels their own listing, and decay removes a row at value 0", () => {
    let w = emptyWorld();
    for (let i = 1; i <= 13; i++) w = add(w, angel(`s${i}`, i));
    for (let i = 1; i <= 13; i++) w = listOwn(w, `s${i}`, copy(), 9);
    expect(w.market).toHaveLength(13);
    const step = stepViews(w);
    expect(step.market).toHaveLength(12);
    expect(step.market.some(l => l.sellerId === "s1")).toBe(false);
    const snap = snapshotFor(w, "s1", step);
    const mine = snap.market.filter(l => l.sellerId === "s1");
    expect(mine).toHaveLength(1);
    expect((mine[0] as unknown as { fee?: number }).fee).toBeUndefined();
    const cancelled = applyMarket(w, "s1", "cancel", { listingId: mine[0].id });
    expect(cancelled.market).toHaveLength(12);
    expect(cancelled.players.get("s1")!.items.some(i => i.id === "copy:wink")).toBe(true);
    // decay to zero removes the row
    let d = tickMarket(w, 0);
    for (let i = 0; i < 20; i++) d = tickMarket({ ...d, now: d.now + EXHIBIT_DECAY }, 0);
    expect(d.market).toHaveLength(0);
  });
});
