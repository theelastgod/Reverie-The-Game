import { describe, expect, it } from "vitest";
import { ANGEL_SUPPLY, MOCK_SIG, TEST_SERIAL } from "./constants";
import { POSITIONS } from "./map";
import {
  HOUSES, MESSENGERS, SCHOOLS, auraSeed, formatSerial, historyMarkFor, houseFor, houseName, isWinkSeed, kitVerb, messengerFor, messengerName,
  schoolName, serialHistoryMark, validLink, winkSchoolFor,
} from "./identity";

describe("identity mappings", () => {
  it("cycles Houses by serial and pins the test serial to Mortals", () => {
    expect(HOUSES).toEqual(["earth", "sky", "mortals", "divinities"]);
    expect(houseFor(1)).toBe("earth");
    expect(houseFor(2)).toBe("sky");
    expect(houseFor(3)).toBe("mortals");
    expect(houseFor(4)).toBe("divinities");
    expect(houseFor(5)).toBe("earth");
    expect(houseFor(TEST_SERIAL)).toBe("mortals");
  });

  it("cycles messengers and Wink schools by serial", () => {
    expect(MESSENGERS).toEqual(["herald", "witness", "ruin", "dweller", "cybernetic", "iridescent"]);
    expect(SCHOOLS).toEqual(["hint", "wreckage", "omen", "dwelling", "process", "surface"]);
    for (let s = 1; s <= 12; s++) {
      expect(messengerFor(s)).toBe(MESSENGERS[(s - 1) % 6]);
      expect(winkSchoolFor(s)).toBe(SCHOOLS[(s - 1) % 6]);
    }
    expect(messengerFor(TEST_SERIAL)).toBe("herald");
    expect(winkSchoolFor(TEST_SERIAL)).toBe(SCHOOLS[(TEST_SERIAL - 1) % 6]);
  });

  it("seeds aura between 8 and 20 for every serial in the supply", () => {
    expect(auraSeed(1)).toBe(9);
    expect(auraSeed(13)).toBe(8);
    expect(auraSeed(12)).toBe(20);
    for (let s = 1; s <= ANGEL_SUPPLY; s++) {
      const a = auraSeed(s);
      expect(a).toBeGreaterThanOrEqual(8);
      expect(a).toBeLessThanOrEqual(20);
    }
  });

  it("names Wink seeds without making them stat sticks", () => {
    expect(isWinkSeed(1221)).toBe(true);
    expect(isWinkSeed(777)).toBe(true);
    expect(isWinkSeed(1111)).toBe(true);
    expect(isWinkSeed(707)).toBe(true);
    expect(isWinkSeed(4077)).toBe(true);
    expect(isWinkSeed(7777)).toBe(true);
    expect(isWinkSeed(1234)).toBe(false);
    expect(isWinkSeed(7)).toBe(false);
    expect(isWinkSeed(0)).toBe(false);
    expect(isWinkSeed(-121)).toBe(false);
  });

  it("names things for the HUD", () => {
    expect(houseName("mortals")).toBe("House of Mortals");
    expect(houseName("")).toBe("Unsealed");
    expect(messengerName("ruin")).toBe("Ruin-angel");
    expect(messengerName("")).toBe("Unsealed");
    expect(kitVerb("herald")).toBe("Announce");
    expect(kitVerb("witness")).toBe("Blitz");
    expect(kitVerb("ruin")).toBe("Face the wreckage");
    expect(kitVerb("dweller")).toBe("Keep");
    expect(kitVerb("cybernetic")).toBe("Read the Gestell");
    expect(kitVerb("iridescent")).toBe("Glamour");
    expect(kitVerb("")).toBe("");
    expect(schoolName("omen")).toBe("Omen");
    expect(schoolName("")).toBe("Unsealed");
  });
});

describe("formatSerial", () => {
  it("pads to four digits and calls the unsealed a guest", () => {
    expect(formatSerial(42)).toBe("#0042");
    expect(formatSerial(1)).toBe("#0001");
    expect(formatSerial(7777)).toBe("#7777");
    expect(formatSerial(null)).toBe("GUEST");
    expect(formatSerial(0)).toBe("GUEST");
  });
});

describe("validLink", () => {
  it("accepts only an integer serial inside the supply with the mock signature", () => {
    expect(validLink(TEST_SERIAL, MOCK_SIG)).toBe(true);
    expect(validLink(1, MOCK_SIG)).toBe(true);
    expect(validLink(ANGEL_SUPPLY, MOCK_SIG)).toBe(true);
    expect(validLink(0, MOCK_SIG)).toBe(false);
    expect(validLink(ANGEL_SUPPLY + 1, MOCK_SIG)).toBe(false);
    expect(validLink(1.5, MOCK_SIG)).toBe(false);
    expect(validLink(Number.NaN, MOCK_SIG)).toBe(false);
    expect(validLink(Number.POSITIVE_INFINITY, MOCK_SIG)).toBe(false);
    expect(validLink(42, "wrong")).toBe(false);
    expect(validLink(42, "")).toBe(false);
  });
});

describe("historyMarkFor", () => {
  const empty = { passings: 0, buried: 0, looted: 0, houses: [], outcomes: [] };

  it("writes a serial's log back as a mark in the Care, and nothing for a log with nothing in it", () => {
    expect(historyMarkFor(42, empty)).toBeNull();
    expect(historyMarkFor(42, empty, 0)).toBeNull();
    expect(historyMarkFor(0, { ...empty, buried: 3 })).toBeNull();
    const buried = historyMarkFor(42, { ...empty, buried: 1 })!;
    expect(buried).toMatchObject({ id: "history:42", serial: 42, district: "care", x: POSITIONS["history:mark"].x, y: POSITIONS["history:mark"].y });
    expect(buried.line).toContain("in the ground");
    expect(historyMarkFor(42, { ...empty, looted: 2, buried: 1 })!.line).toContain("took from the fallen");
    expect(historyMarkFor(42, empty, 2)!.line).toContain("left the body in the weather");
    expect(historyMarkFor(42, { ...empty, passings: 1, outcomes: ["absence"] })!.line).toContain("Nothing came");
    expect(historyMarkFor(42, { ...empty, passings: 2, outcomes: ["absence", "appearance"] })!.line).toContain("A trace came");
  });
});

describe("serialHistoryMark", () => {
  it("gives the test serial a prior hour in the Care and nobody else one", () => {
    const mark = serialHistoryMark(TEST_SERIAL);
    expect(mark).not.toBeNull();
    expect(mark!.serial).toBe(TEST_SERIAL);
    expect(mark!.x).toBe(POSITIONS["history:7777"].x);
    expect(mark!.y).toBe(POSITIONS["history:7777"].y);
    expect(mark!.district).toBe("care");
    expect(mark!.line.length).toBeGreaterThan(0);
    expect(serialHistoryMark(42)).toBeNull();
    expect(serialHistoryMark(1)).toBeNull();
  });
});
