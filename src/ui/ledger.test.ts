import { describe, expect, it } from "vitest";
import { CLAIM_CAP } from "../sim/constants";
import { claimRow, holdClock, ledgerModel } from "./ledger";

const you = (over: Record<string, unknown> = {}) => ({
  id: "me", guest: false, bestand: 20, banked: 5, claimsFiled: 1,
  items: [
    { id: "cult:copper-binding", kind: "cult", name: "Copper binding", qty: 1, value: 0, bound: true },
    { id: "copy:wink", kind: "exhibition", name: "A print of a hint", qty: 2, value: 7 },
    { id: "paper:insurance", kind: "paper", name: "Insurance paper", qty: 1, value: 0 },
  ],
  claims: [
    { id: "c1", label: "Campaign claim", amount: 25, filedAt: 0, readyAt: 100, settled: false },
    { id: "c2", label: "Campaign claim", amount: 25, filedAt: 0, readyAt: 90000, settled: false },
    { id: "c3", label: "Campaign claim", amount: 25, filedAt: 0, readyAt: 10, settled: true },
  ],
  ...over,
});

describe("holdClock", () => {
  it("shows hours only when there are any", () => {
    expect(holdClock(45)).toBe("0:45");
    expect(holdClock(3600)).toBe("1:00:00");
    expect(holdClock(86399)).toBe("23:59:59");
    expect(holdClock(-1)).toBe("0:00");
  });
});

describe("claimRow", () => {
  it("reads hold, ready and settled from the clock", () => {
    const c = { id: "c", label: "L", amount: 25, filedAt: 0, readyAt: 100, settled: false };
    expect(claimRow(c, 40)).toMatchObject({ status: "hold", detail: "hold 1:00" });
    expect(claimRow(c, 100)).toMatchObject({ status: "ready" });
    expect(claimRow({ ...c, settled: true }, 100)).toMatchObject({ status: "settled" });
  });
});

describe("ledgerModel", () => {
  it("groups holdings, states claims and prices the Grid for an Angel", () => {
    const m = ledgerModel({ now: 500, you: you() as never, market: [
      { id: "l1", sellerId: "other", sellerName: "#0042", item: { id: "copy:wink", kind: "exhibition", name: "A print", qty: 1, value: 5 }, price: 9, at: 0 },
      { id: "l2", sellerId: "me", sellerName: "#0007", item: { id: "copy:wink", kind: "exhibition", name: "A print", qty: 1, value: 5 }, price: 12, at: 0 },
      { id: "l3", sellerId: "other", sellerName: "#0042", item: { id: "copy:wink", kind: "exhibition", name: "A print", qty: 1, value: 5 }, price: 99, at: 0 },
    ] });
    expect(m.guest).toBe(false);
    expect(m.cult.map((r) => r.name)).toEqual(["Copper binding"]);
    expect(m.cult[0].listable).toBe(false);
    expect(m.exhibition[0]).toMatchObject({ qty: 2, listable: true });
    expect(m.paper[0].note).toContain("I uses");
    expect(m.claims.map((c) => c.status)).toEqual(["ready", "hold", "settled"]);
    expect(m.claimsLine).toContain(`1 of ${CLAIM_CAP}`);
    expect(m.listings.map((l) => [l.mine, l.canBuy])).toEqual([[false, true], [true, false], [false, false]]);
    expect(m.purse).toBe(20);
    expect(m.banked).toBe(5);
  });

  it("refuses everything for a guest without hiding what they hold", () => {
    const m = ledgerModel({ now: 0, you: you({ guest: true, claims: [] }) as never, market: [
      { id: "l1", sellerId: "other", sellerName: "#0042", item: { id: "copy:wink", kind: "exhibition", name: "A print", qty: 1, value: 5 }, price: 1, at: 0 },
    ] });
    expect(m.guest).toBe(true);
    expect(m.spectator).toContain("Guests cannot claim");
    expect(m.exhibition[0].listable).toBe(true);
    expect(m.listings[0].canBuy).toBe(false);
    expect(m.claims).toEqual([]);
  });
});
