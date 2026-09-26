import { describe, expect, it } from "vitest";
import { logEventsFor } from "./log";
import { emptyWorld, spawnGuest } from "../../src/sim/world";
import { F } from "../../src/sim/content/ids";
import type { Player, WorldState } from "../../src/sim/types";

function withPlayers(w: WorldState, ...players: Player[]): WorldState {
  const map = new Map(w.players);
  for (const p of players) map.set(p.id, p);
  return { ...w, players: map, now: 10 };
}

const guest = (over: Partial<Player> = {}): Player => ({ ...spawnGuest("a"), ...over });
const angel = (over: Partial<Player> = {}): Player => guest({ guest: false, serial: 42, name: "#0042", ...over });

describe("logEventsFor", () => {
  it("is silent for an unchanged world and for a body that only appeared", () => {
    const w = withPlayers(emptyWorld(), angel());
    expect(logEventsFor(w, w, 1)).toEqual([]);
    expect(logEventsFor(emptyWorld(), w, 1)).toEqual([]);
  });

  it("records a link, a wallet, the going-under, burials and the credits with the public name only", () => {
    const before = withPlayers(emptyWorld(), guest());
    const after = withPlayers(emptyWorld(), angel({ wallet: "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf", flags: { [F.UNDER]: 1, [F.CREDITS]: 1 }, history: { ...spawnGuest("a").history, buried: 2 } }));
    const events = logEventsFor(before, after, 1234);
    expect(events.map(e => e.kind)).toEqual(["link", "wallet", "under", "burial", "credits"]);
    for (const e of events) expect(e).toMatchObject({ at: 1234, worldNow: 10, player: "#0042", serial: 42 });
    expect(events[0].detail).toEqual({ serial: 42 });
    expect(events[1].detail).toEqual({ address: "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf" });
    expect(events[3].detail).toEqual({ count: 2 });
    expect(JSON.stringify(events)).not.toContain('"a"');
  });

  it("records claims when filed and once when settled", () => {
    const claim = { id: "c1", label: "Campaign claim", amount: 25, filedAt: 0, readyAt: 100, settled: false };
    const none = withPlayers(emptyWorld(), angel());
    const filed = withPlayers(emptyWorld(), angel({ claims: [claim] }));
    const settled = withPlayers(emptyWorld(), angel({ claims: [{ ...claim, settled: true }] }));
    expect(logEventsFor(none, filed, 1).map(e => [e.kind, e.detail])).toEqual([["claim.filed", { id: "c1", amount: 25 }]]);
    expect(logEventsFor(filed, settled, 1).map(e => [e.kind, e.detail])).toEqual([["claim.settled", { id: "c1", amount: 25 }]]);
    expect(logEventsFor(settled, settled, 1)).toEqual([]);
  });

  it("records a Passing by the body that stood in the ring, and each new news line once", () => {
    const base = withPlayers(emptyWorld(), angel());
    const passed: WorldState = {
      ...base,
      passing: { ...base.passing, count: base.passing.count + 1, lastOutcome: "appearance", lastBy: "a", hijackedBy: "" },
      news: [...base.news, { text: "An Angel reached the Clearing.", at: 9 }, { text: "The weather was named.", at: 9 }],
    };
    const events = logEventsFor(base, passed, 5);
    expect(events.map(e => e.kind)).toEqual(["passing", "news", "news"]);
    expect(events[0]).toMatchObject({ player: "#0042", serial: 42, detail: { outcome: "appearance", hijackedBy: "", count: 1 } });
    expect(events[1]).toMatchObject({ player: "", serial: null, detail: { text: "An Angel reached the Clearing.", at: 9 } });
    expect(logEventsFor(passed, passed, 6)).toEqual([]);
    const rolled: WorldState = { ...passed, news: passed.news.slice(1).concat({ text: "A third line.", at: 12 }) };
    expect(logEventsFor(passed, rolled, 7).map(e => e.detail.text)).toEqual(["A third line."]);
  });
});
