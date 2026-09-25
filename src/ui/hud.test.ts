import { describe, expect, it } from "vitest";
import {
  auraTier, bearingTo, dodgeLine, formatSerial, identityLine, joinNews, kitLine, kitVerb, ledgerLine, marqueeSeconds,
  pad2, parseSerial, pct, questLabel, questRows, roman, seconds, stanceLine, statusLine,
} from "./format";
import { TILE } from "../sim/map";

describe("formatSerial", () => {
  it("pads to four digits", () => {
    expect(formatSerial(42)).toBe("#0042");
    expect(formatSerial(7777)).toBe("#7777");
    expect(formatSerial(1)).toBe("#0001");
  });
  it("is GUEST for nothing", () => {
    expect(formatSerial(null)).toBe("GUEST");
    expect(formatSerial(undefined)).toBe("GUEST");
    expect(formatSerial(0)).toBe("GUEST");
  });
});

describe("parseSerial", () => {
  it("accepts 1..7777 with or without a hash", () => {
    expect(parseSerial("7777")).toBe(7777);
    expect(parseSerial("#0042")).toBe(42);
    expect(parseSerial(1)).toBe(1);
  });
  it("rejects everything else", () => {
    expect(parseSerial("0")).toBeNull();
    expect(parseSerial("7778")).toBeNull();
    expect(parseSerial("-4")).toBeNull();
    expect(parseSerial("4.5")).toBeNull();
    expect(parseSerial("")).toBeNull();
    expect(parseSerial(null)).toBeNull();
  });
});

describe("roman", () => {
  it("covers the movements", () => {
    expect([1, 2, 3, 4, 5].map(roman)).toEqual(["I", "II", "III", "IV", "V"]);
  });
  it("handles larger and empty values", () => {
    expect(roman(9)).toBe("IX");
    expect(roman(14)).toBe("XIV");
    expect(roman(0)).toBe("");
    expect(roman(-1)).toBe("");
  });
});

describe("numbers", () => {
  it("pads two digits", () => {
    expect(pad2(3)).toBe("03");
    expect(pad2(12)).toBe("12");
    expect(pad2(-1)).toBe("00");
  });
  it("formats seconds", () => {
    expect(seconds(0.62)).toBe("0.7s");
    expect(seconds(0.6)).toBe("0.6s");
    expect(seconds(12.4)).toBe("13s");
    expect(seconds(0)).toBe("");
    expect(seconds(-1)).toBe("");
  });
  it("clamps percentages", () => {
    expect(pct(50, 100)).toBe(50);
    expect(pct(150, 100)).toBe(100);
    expect(pct(-5, 100)).toBe(0);
    expect(pct(5, 0)).toBe(0);
  });
});

describe("identity and ledger", () => {
  it("names a guest", () => {
    expect(identityLine({ guest: true, serial: null, house: "", messenger: "", aura: 0 })).toBe("GUEST · AURA 0");
  });
  it("names an angel", () => {
    expect(identityLine({ guest: false, serial: 42, house: "mortals", messenger: "herald", aura: 30 })).toBe("#0042 · HOUSE OF MORTALS · HERALD");
  });
  it("keeps the ledger cold", () => {
    expect(ledgerLine({ guest: false, bestand: 12.9, banked: 40, winke: 2 })).toBe("BESTAND 12 · BANKED 40 · WINKE 2");
    expect(ledgerLine({ guest: true, bestand: 3, banked: 0, winke: 0 })).toBe("BESTAND 3 · GUEST LEDGER");
  });
  it("tiers aura for display only", () => {
    expect(auraTier(90, true)).toBe(0);
    expect(auraTier(0, false)).toBe(0);
    expect(auraTier(3, false)).toBe(1);
    expect(auraTier(30, false)).toBe(2);
    expect(auraTier(75, false)).toBe(3);
  });
});

describe("kit, stance, dodge", () => {
  it("names every messenger verb and none for guests", () => {
    expect(kitVerb("herald")).toBe("Announce");
    expect(kitVerb("witness")).toBe("Blitz");
    expect(kitVerb("ruin")).toBe("Face");
    expect(kitVerb("dweller")).toBe("Keep");
    expect(kitVerb("cybernetic")).toBe("Read");
    expect(kitVerb("iridescent")).toBe("Glamour");
    expect(kitVerb("")).toBe("");
  });
  it("builds the kit chip", () => {
    expect(kitLine("", 0, false)).toBe("NO KIT");
    expect(kitLine("herald", 0, false)).toBe("ANNOUNCE");
    expect(kitLine("herald", 12, false)).toBe("ANNOUNCE · 12s");
    expect(kitLine("herald", 12, true)).toBe("ANNOUNCE · ACTIVE");
  });
  it("builds the stance chip", () => {
    expect(stanceLine("restraint", false, 1)).toEqual({ text: "RESTRAINT", hint: "SEE WINKE · WIDER STEP" });
    expect(stanceLine("storm", false, 1)).toEqual({ text: "STORM", hint: "BURNS RESTRAINT 1/S" });
    expect(stanceLine("storm", true, 1).hint).toBe("FACE · NO BURN");
  });
  it("builds the dodge chip", () => {
    expect(dodgeLine(0)).toBe("SHIFT + MOVE · DODGE");
    expect(dodgeLine(0.6)).toBe("STEP · 0.6s");
  });
});

describe("bearingTo", () => {
  it("is HERE within reach", () => {
    expect(bearingTo({ x: 100, y: 100, district: "nave" }, { x: 120, y: 100, district: "nave" })).toBe("HERE");
  });
  it("gives a direction and a tile count", () => {
    expect(bearingTo({ x: 0, y: 0, district: "nave" }, { x: TILE * 10, y: 0, district: "nave" })).toBe("E · 10 TILES");
    expect(bearingTo({ x: 0, y: 0 }, { x: 0, y: TILE * 4 })).toBe("S · 4 TILES");
  });
  it("names another district", () => {
    expect(bearingTo({ x: 0, y: 0, district: "nave" }, { x: 0, y: TILE * 40, district: "care" })).toBe("S · 40 TILES · THE CARE");
  });
  it("has no bearing without a target", () => {
    expect(bearingTo({ x: 0, y: 0 }, null)).toBe("NO BEARING");
  });
});

describe("journal quests", () => {
  it("labels spine quests with a numeral", () => {
    expect(questLabel("m1-diagnosis")).toBe("I · DIAGNOSIS");
    expect(questLabel("m4-the-turn")).toBe("IV · THE TURN");
    expect(questLabel("bury-the-garden")).toBe("BURY THE GARDEN");
  });
  it("lists spine first with step numbers", () => {
    const rows = questRows({ "bury-the-garden": 0, "m2-techno-feudal": 2, "a-side": 1 });
    expect(rows.map(r => r.id)).toEqual(["m2-techno-feudal", "a-side", "bury-the-garden"]);
    expect(rows[0].step).toBe("03");
    expect(rows[0].spine).toBe(true);
    expect(rows[1].spine).toBe(false);
  });
});

describe("marquee and status", () => {
  it("joins news with a dot and drops blanks", () => {
    expect(joinNews(["A fell.", "", "  The bell struck. "])).toBe("A fell. · The bell struck.");
    expect(joinNews([])).toBe("");
  });
  it("scales the marquee duration", () => {
    expect(marqueeSeconds("short")).toBe(20);
    expect(marqueeSeconds("x".repeat(500))).toBe(80);
  });
  it("names every connection status", () => {
    expect(statusLine("online")).toBe("ONLINE");
    expect(statusLine("elsewhere")).toContain("ANOTHER TAB");
    expect(statusLine("closed")).toBe("CONNECTION CLOSED");
  });
});

describe("assetUrl", () => {
  it("respects the deploy base", async () => {
    const { assetUrl } = await import("./format");
    expect(assetUrl("nara.jpg", "/")).toBe("/assets/nara.jpg");
    expect(assetUrl("nara.jpg", "/play/")).toBe("/play/assets/nara.jpg");
    expect(assetUrl("/nara.jpg", "/play")).toBe("/play/assets/nara.jpg");
  });
});
