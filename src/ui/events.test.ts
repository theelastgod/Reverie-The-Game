import { describe, expect, it } from "vitest";
import { countdown, eventRows } from "./events";

const held = { earth: 0, sky: 0, mortals: 0, divinities: 0 };
const base = () => ({
  now: 1000,
  houses: { standing: { ...held }, tithe: 0, war: { active: false, startsAt: 5000, endsAt: 0, held: { ...held }, winner: "" as const, lastWinner: "" as const, site: "clearing-ring" } },
  clearing: { open: false, reserve: 40, contest: null, lastOutcome: "" as const, dwellers: 0 },
  you: { duel: undefined } as { duel?: { with: string; until: number; accepted: boolean } },
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
  });

  it("shows the contest with a keep/extract bar and the dwellers", () => {
    const s = base();
    s.clearing = { ...s.clearing, open: true, dwellers: 3, contest: { active: true, keep: 2, extract: 1, endsAt: 1045 } as never };
    const rows = eventRows(s as never);
    expect(rows[0]).toMatchObject({ id: "contest", tone: "gold", bar: { keep: 2, extract: 1 } });
    expect(rows[0].detail).toBe("KEEP 2 · EXTRACT 1 · 3 in the ring · 0:45");
  });

  it("names the duel opponent from the public players and distinguishes an offer from a live duel", () => {
    const s = base();
    s.you.duel = { with: "b", until: 1020, accepted: false };
    let rows = eventRows(s as never);
    expect(rows[0]).toMatchObject({ id: "duel", tone: "sky", label: "RUIN DUEL OFFERED" });
    expect(rows[0].detail).toContain("#0042");
    s.you.duel = { with: "b", until: 1060, accepted: true };
    rows = eventRows(s as never);
    expect(rows[0]).toMatchObject({ id: "duel", tone: "hot", label: "RUIN DUEL" });
    expect(rows[0].detail).toContain("1:00");
    s.you.duel = { with: "b", until: 900, accepted: true };
    expect(eventRows(s as never)).toEqual([]);
  });
});
