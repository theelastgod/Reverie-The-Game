// The numbers a player is told (the numbers audit, 2026-10-04): a price, a count or a time a line names must be the one the
// server uses, or the line is a lie the code tells. Real content, no mocks.
import { describe, expect, it } from "vitest";
import { BLITZ_COUNT, BLITZ_DURATION, CLAIM_CAP, FREEZE_SECONDS, KIT_COOLDOWN, KIT_DURATION, TRUCE_SECONDS } from "./constants";
import { LINES, POI_CONFIGS } from "./content";
import { POSITIONS } from "./map";
import { visibleWreckage } from "./snapshot";
import type { Ctx, Effect, Player, Wreckage } from "./types";
import { emptyWorld, spawnGuest } from "./world";

const WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
};
const word = (n: number): string => Object.keys(WORDS).find(k => WORDS[k] === n) ?? String(n);
const Word = (n: number): string => word(n)[0].toUpperCase() + word(n).slice(1);

describe("the numbers a player is told", () => {
  it("every place that charges Bestand names the price it charges, on its label and in what it says", () => {
    const w0 = emptyWorld();
    let named = 0;
    for (const [id, cfg] of Object.entries(POI_CONFIGS)) {
      const at = POSITIONS[id] ?? { x: 0, y: 0 };
      const p: Player = { ...spawnGuest("me", w0.now), guest: false, serial: 42, name: "#0042", house: "earth", x: at.x, y: at.y };
      const ctx: Ctx = { w: { ...w0, players: new Map([["me", p]]) }, p, now: w0.now };
      for (const v of cfg.verbs) {
        if (!v.cost) continue;
        const label = v.label.match(/\((\d+)\)/)?.[1];
        if (label !== undefined) expect(Number(label), `${id}/${v.choice}'s label`).toBe(v.cost.bestand);
        const say = typeof v.say === "function" ? v.say(ctx) : v.say ?? "";
        for (const [said, n] of say.matchAll(/\b([A-Za-z]+|\d+) Bestand\b/g)) {
          const value = WORDS[n.toLowerCase()] ?? (/^\d+$/.test(n) ? Number(n) : undefined);
          if (value === undefined) continue;
          expect(value, `${id}/${v.choice} says "${said}"`).toBe(v.cost.bestand);
          named++;
        }
      }
    }
    expect(named, "the check reads the lines it means to").toBeGreaterThan(10);
  });

  it("the kits, the truce and the desk say the seconds and the counts the server keeps", () => {
    expect(LINES.KIT_COPY.witness).toBe(`A flash. The last ${word(BLITZ_COUNT)} who fell are traced on the ground. ${Word(BLITZ_DURATION)} seconds.`);
    expect(KIT_DURATION, "the Herald's and the Iridescent's minute").toBe(60);
    expect(LINES.KIT_COPY.herald).toContain("for a minute");
    expect(LINES.KIT_COPY.iridescent).toContain("for a minute");
    expect(LINES.KIT_COOLDOWN).toContain(`${Word(KIT_COOLDOWN)} seconds.`);
    expect(LINES.TRUCE_COPY).toContain(`${Word(TRUCE_SECONDS)} seconds.`);
    expect(LINES.CLAIMS_CAP).toContain(`${Word(CLAIM_CAP)} claims`);
  });

  it("the freeze holds the Nave for the half hour its form, its news and its people name", () => {
    expect(FREEZE_SECONDS).toBe(30 * 60);
    const sign = POI_CONFIGS["safety-desk"].verbs.find(v => v.choice === "sign")!;
    const effects = sign.effects as Effect[];
    expect(effects).toContainEqual({ kind: "freeze", district: "nave", seconds: FREEZE_SECONDS });
    expect(effects).toContainEqual(expect.objectContaining({ kind: "news", text: expect.stringContaining("The Nave holds for half an hour.") }));
  });
});

describe("a Witness's Blitz (the numbers audit: it showed every wreckage the city still held, not the last eight)", () => {
  const wreck = (n: number, until: number): Wreckage => ({
    id: `wreck-${n}`, x: 0, y: 0, district: "wet", fromId: `body-${n}`, fromName: `#00${n}`, fromSerial: n, killerId: "", at: n, until,
    buried: false, looted: false, bestand: 0, items: [],
  });
  const witness = (now: number, kit: boolean): Player => ({
    ...spawnGuest("me", now), guest: false, serial: 42, messenger: "witness", stance: "guard",
    kit: kit ? { verb: "witness", until: now + BLITZ_DURATION } : null,
  });

  it("traces the last eight who fell, however old their wreckage, and nothing older", () => {
    const now = 100;
    // twelve falls: the first ten past what any body sees, the last two fresh
    const wreckage = Array.from({ length: 12 }, (_, i) => wreck(i + 1, i < 10 ? now - 1 : now + 30));
    const w = { ...emptyWorld(), now, wreckage };
    const ids = (p: Player) => visibleWreckage(w, p).map(r => r.id);
    expect(ids(witness(now, false)), "without the Blitz, only the fresh").toEqual(["wreck-11", "wreck-12"]);
    expect(ids(witness(now, true))).toEqual([5, 6, 7, 8, 9, 10, 11, 12].map(n => `wreck-${n}`));
    expect(BLITZ_COUNT).toBe(8);
  });

  it("never hides what the body already sees: more than eight fresh falls all stay in sight", () => {
    const now = 100;
    const wreckage = Array.from({ length: 11 }, (_, i) => wreck(i + 1, now + 30));
    const w = { ...emptyWorld(), now, wreckage };
    expect(visibleWreckage(w, witness(now, true))).toHaveLength(11);
  });
});
