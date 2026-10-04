import { describe, expect, it } from "vitest";
import { countdown, eventRows } from "./events";

const held = { earth: 0, sky: 0, mortals: 0, divinities: 0 };
const base = () => ({
  now: 1000,
  houses: { standing: { ...held }, tithe: 0, war: { active: false, startsAt: 5000, endsAt: 0, held: { ...held }, winner: "" as const, lastWinner: "" as const, site: "clearing-ring" } },
  clearing: { open: false, reserve: 40, contest: null, lastOutcome: "" as const, dwellers: 0 },
  you: { duel: undefined } as { duel?: { with: string; until: number; accepted: boolean }; duelOffer?: { from: string; until: number } },
  players: [{ id: "b", name: "#0042" }],
});

describe("countdown", () => {
  it("formats m:ss and never goes negative", () => {
    expect(countdown(0)).toBe("0:00");
    expect(countdown(65)).toBe("1:05");
    expect(countdown(599.2)).toBe("10:00");
    expect(countdown(-4)).toBe("0:00");
    expect(countdown(Number.NaN)).toBe("0:00");
  });
});

describe("eventRows", () => {
  it("is empty when nothing is contested and the next war is far off", () => {
    expect(eventRows(base() as never)).toEqual([]);
  });

  it("counts down to a war inside the window and shows the holder during it", () => {
    const s = base();
    s.houses.war.startsAt = 1200;
    let rows = eventRows(s as never);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: "war-next", label: "NEXT WAR" });
    expect(rows[0].detail).toContain("3:20");
    s.houses.war = { ...s.houses.war, active: true, endsAt: 1090, held: { ...held, sky: 12, earth: 3 } };
    rows = eventRows(s as never);
    expect(rows[0]).toMatchObject({ id: "war", tone: "hot" });
    expect(rows[0].detail).toContain("House of Sky holds");
    expect(rows[0].detail).toContain("1:30");
    // two Houses on the same seconds: a tie gives no winner, and the strip says tied, never that the first in order holds
    // (the player-defect sweep, round four)
    s.houses.war = { ...s.houses.war, held: { ...held, earth: 60.05, sky: 60.05 } };
    expect(eventRows(s as never)[0].detail).toContain("tied");
    expect(eventRows(s as never)[0].detail).not.toContain("holds");
    s.houses.war = { ...s.houses.war, held: { ...held, earth: 60.05, sky: 60.05, mortals: 61 } };
    expect(eventRows(s as never)[0].detail).toContain("House of Mortals holds");
  });

  it("shows the contest with a keep/extract bar and the dwellers", () => {
    const s = base();
    s.clearing = { ...s.clearing, open: true, dwellers: 3, contest: { active: true, keep: 2, extract: 1, endsAt: 1045 } as never };
    const rows = eventRows(s as never);
    expect(rows[0]).toMatchObject({ id: "contest", tone: "gold", bar: { keep: 2, extract: 1 } });
    expect(rows[0].detail).toBe("KEEP 2 · EXTRACT 1 · 3 in the ring · 0:45");
    // the countdown rides apart, for the timer span a screen reader does not read out every second (the sweep, round four)
    expect(rows[0].count).toBe("0:45");
    expect(rows[0].detail.endsWith(` · ${rows[0].count}`)).toBe(true);
  });

  it("gives every row that counts down its count apart, and a row that does not none", () => {
    const s = base() as ReturnType<typeof base> & { you: { kitReadout?: string[] } };
    s.houses.war.startsAt = 1200;
    s.you.duel = { with: "b", until: 1020, accepted: true };
    s.you.kitReadout = ["#0042 fell here once."];
    const rows = eventRows(s as never);
    for (const r of rows) {
      if (r.id === "face") expect(r.count, r.id).toBeUndefined();
      else expect(r.detail.endsWith(` · ${r.count}`), r.id).toBe(true);
    }
    expect(rows.map(r => r.id)).toEqual(expect.arrayContaining(["war-next", "duel", "face"]));
  });

  it("reads the Ruin-angel's Face back as a row while it lasts, and nothing without it (the player-defect sweep)", () => {
    const s = base() as ReturnType<typeof base> & { you: { kitReadout?: string[] } };
    expect(eventRows(s as never).some(r => r.id === "face")).toBe(false);
    s.you.kitReadout = ["#0042 fell here once.", "Passings 2. Buried 3. Looted 1. Fell 4 times."];
    expect(eventRows(s as never).find(r => r.id === "face")).toMatchObject({ label: "THE WRECKAGE, FACED", detail: "#0042 fell here once. · Passings 2. Buried 3. Looted 1. Fell 4 times." });
    const facing = s as typeof s & { you: { kit?: { verb: string; until: number } | null } };
    facing.you.kit = { verb: "ruin", until: 1010 };
    expect(eventRows(facing as never).some(r => r.id === "face"), "while the Face is up").toBe(true);
    facing.you.kit = { verb: "ruin", until: 1000 };
    expect(eventRows(facing as never).some(r => r.id === "face"), "the Face is down before the slow frame says so").toBe(false);
  });

  it("names the duel opponent from the public players and distinguishes an offer from a live duel", () => {
    const s = base();
    s.you.duel = { with: "b", until: 1020, accepted: false };
    let rows = eventRows(s as never);
    expect(rows[0]).toMatchObject({ id: "duel", tone: "sky", label: "RUIN DUEL OFFERED" });
    expect(rows[0].detail).toContain("#0042");
    // the offer on your own body is the one you made: the strip waits, and never sends you to press F at the wreckage
    expect(rows[0].detail).toContain("waiting for the answer");
    expect(rows[0].detail).not.toContain("F at the wreckage");
    s.you.duel = { with: "b", until: 1060, accepted: true };
    rows = eventRows(s as never);
    expect(rows[0]).toMatchObject({ id: "duel", tone: "hot", label: "RUIN DUEL" });
    expect(rows[0].detail).toContain("1:00");
    s.you.duel = { with: "b", until: 900, accepted: true };
    expect(eventRows(s as never)).toEqual([]);
  });

  it("shows the offered body the duel it was asked to, with the key that answers, until it lapses or a duel is live", () => {
    const s = base();
    s.you.duelOffer = { from: "b", until: 1030 };
    let rows = eventRows(s as never);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: "duel-offer", tone: "gold", label: "RUIN DUEL ASKED" });
    expect(rows[0].detail).toBe("#0042 · F on them answers · 0:30");
    s.you.duel = { with: "c", until: 1060, accepted: false }; // your own offer to another stands beside it, under its own id
    rows = eventRows(s as never);
    expect(rows.map(r => r.id)).toEqual(["duel", "duel-offer"]);
    s.you.duel = { with: "c", until: 1060, accepted: true }; // in a live duel the ask is moot
    expect(eventRows(s as never).map(r => r.id)).toEqual(["duel"]);
    s.you.duel = undefined;
    s.you.duelOffer = { from: "z", until: 999 };
    expect(eventRows(s as never)).toEqual([]);
    s.you.duelOffer = { from: "z", until: 1010 };
    expect(eventRows(s as never)[0].detail).toContain("an Angel");
  });
});
