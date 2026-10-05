import { describe, expect, it } from "vitest";
import {
  auraTier, bearingTo, dodgeLine, formatSerial, heardStep, identityLine, joinNews, kitLine, kitVerb, ledgerLine, mapLabel, marqueeSeconds,
  noticeDiff, pad2, parseSerial, pct, questLabel, questRows, roman, seconds, stanceLine, statusLine,
  glassRows, creditRows, chipVerbs,
} from "./format";
import { TILE } from "../sim/map";
import { AURA_PRESENT } from "../sim/constants";
import { CREDITS as LINES_CREDITS } from "../sim/content/lines";

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

describe("heardStep", () => {
  const fresh = { at: -1, held: false };
  const window = { npc: "caul", node: "oval-hour" };

  it("puts a new line up and arms its fade at once when no window covers it; the same line does nothing more", () => {
    const up = heardStep(fresh, { heard: "The time on the slip comes and goes.", heardAt: 10, dialogue: null }, 10.1, 8);
    expect(up).toEqual({ state: { at: 10, held: false }, show: "The time on the slip comes and goes.", arm: true });
    expect(heardStep(up.state, { heard: "The time on the slip comes and goes.", heardAt: 10, dialogue: null }, 10.2, 8)).toEqual({ state: up.state, show: null, arm: false });
  });

  it("holds the fade of a line heard under an open window, and arms it the frame the window closes, once", () => {
    // the bell's wait: the press opens Caul's window and says the bell's line in the same step
    const up = heardStep(fresh, { heard: "The bell.", heardAt: 10, dialogue: window }, 10.1, 8);
    expect(up).toEqual({ state: { at: 10, held: true }, show: "The bell.", arm: false });
    const reading = heardStep(up.state, { heard: "The bell.", heardAt: 10, dialogue: window }, 40, 8);
    expect(reading, "however long the window stays up").toEqual({ state: up.state, show: null, arm: false });
    const closed = heardStep(reading.state, { heard: "The bell.", heardAt: 10, dialogue: null }, 41, 8);
    expect(closed).toEqual({ state: { at: 10, held: false }, show: null, arm: true });
    expect(heardStep(closed.state, { heard: "The bell.", heardAt: 10, dialogue: null }, 42, 8)).toEqual({ state: closed.state, show: null, arm: false });
  });

  it("a newer line under the window replaces the held one; an empty or stale line puts nothing up and holds nothing", () => {
    const held = heardStep(fresh, { heard: "First.", heardAt: 10, dialogue: window }, 10, 8).state;
    expect(heardStep(held, { heard: "Second.", heardAt: 12, dialogue: window }, 12, 8)).toEqual({ state: { at: 12, held: true }, show: "Second.", arm: false });
    expect(heardStep(fresh, { heard: "", heardAt: 5, dialogue: window }, 5, 8)).toEqual({ state: { at: 5, held: false }, show: null, arm: false });
    expect(heardStep(fresh, { heard: "Old.", heardAt: 0, dialogue: null }, 20, 8)).toEqual({ state: { at: 0, held: false }, show: null, arm: false });
    // a window opening later over a line already fading changes nothing: the fade was armed when the line went up
    const shown = heardStep(fresh, { heard: "Said.", heardAt: 10, dialogue: null }, 10, 8).state;
    expect(heardStep(shown, { heard: "Said.", heardAt: 10, dialogue: window }, 11, 8)).toEqual({ state: shown, show: null, arm: false });
  });
});

describe("glassRows", () => {
  const base = { launch: "season 2, day 7, 00:00", at: 1000, dark: 3, figure: 61, hole: 4 };
  it("is nothing for a body that is no reader", () => {
    expect(glassRows(null, 0)).toBeNull();
    expect(glassRows(undefined, 0)).toBeNull();
  });
  it("runs the count down against the world's clock and gives the figures in the glass's words", () => {
    expect(glassRows(base, 1000 - 62)).toEqual({ launch: "The launch: season 2, day 7, 00:00 · 0d 00:01:02", figures: "The city's figure: 61 · In the hole: 4" });
    expect(glassRows(base, 2000)?.launch, "a count past its moment stops at zero").toBe("The launch: season 2, day 7, 00:00 · 0d 00:00:00");
  });
  it("says now through the window, and no date past the threshold with the lights out", () => {
    expect(glassRows({ ...base, launch: "now", at: 0 }, 0)?.launch).toBe("The launch: now");
    expect(glassRows({ ...base, launch: "no date", at: 0, dark: 7 }, 0)?.launch).toBe("The launch: no date · 7 lights out on the Kerb");
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
    // the server's tier (publicPlayer): at AURA_PRESENT a body is tier 3 on the HUD as it is to every other viewer
    expect(auraTier(AURA_PRESENT - 1, false)).toBe(2);
    expect(auraTier(AURA_PRESENT, false)).toBe(3);
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
    expect(dodgeLine(0, true), "a finger has no Shift").toBe("DODGE");
    expect(dodgeLine(0.6, true)).toBe("STEP · 0.6s");
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

describe("mapLabel", () => {
  const objective = (target: { x: number; y: number; district: "nave" | "care" } | null) =>
    ({ quest: "m1-diagnosis", step: "intake", title: "Your name in the ledger", detail: "", target, plate: "", movement: 1 as const });
  it("names your district and the objective's bearing in words, with its district when it is not yours", () => {
    expect(mapLabel({ district: "nave", frozen: [], objective: objective({ x: TILE * 10, y: 0, district: "nave" }), you: { x: 0, y: 0 } }))
      .toBe("City map. You are in Nave of Tubes. The objective, Your name in the ledger, lies east, 10 tiles.");
    expect(mapLabel({ district: "nave", frozen: [], objective: objective({ x: 0, y: TILE * 40, district: "care" }), you: { x: 0, y: 0 } }))
      .toBe("City map. You are in Nave of Tubes. The objective, Your name in the ledger, lies south, 40 tiles, in The Care.");
  });
  it("says here, no objective, and what is under a freeze", () => {
    expect(mapLabel({ district: "nave", frozen: [], objective: objective({ x: 20, y: 0, district: "nave" }), you: { x: 0, y: 0 } }))
      .toBe("City map. You are in Nave of Tubes. The objective, Your name in the ledger, is here.");
    expect(mapLabel({ district: "care", frozen: ["nave"], objective: null, you: { x: 0, y: 0 } }))
      .toBe("City map. You are in The Care. No objective. Under a freeze: Nave of Tubes.");
    expect(mapLabel({ district: "nave", frozen: [], objective: objective(null), you: { x: 0, y: 0 } }))
      .toBe("City map. You are in Nave of Tubes. The objective: Your name in the ledger.");
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
    // the world keeps news oldest first; the marquee leads with the newest (the player-defect sweep, round four)
    expect(joinNews(["A fell.", "", "  The bell struck. "])).toBe("The bell struck. · A fell.");
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

describe("creditRows", () => {
  it("sets the game's name as a title and every other line of the script's roll as prose under it", () => {
    expect(creditRows(LINES_CREDITS)).toEqual(LINES_CREDITS.map(text => ({ text, title: text === "REVERIE: THE GAME" })));
    expect(creditRows(LINES_CREDITS).filter(r => r.title)).toHaveLength(1);
    expect(creditRows([])).toEqual([]);
  });
});

describe("noticeDiff", () => {
  it("adds only what arrived and removes only what left; the rows that stay are left in place (the player-defect sweep, round four)", () => {
    expect(noticeDiff([], ["a"])).toEqual({ remove: [], add: ["a"] });
    expect(noticeDiff(["a"], ["a", "b"])).toEqual({ remove: [], add: ["b"] });
    expect(noticeDiff(["a", "b", "c", "d"], ["b", "c", "d", "e"])).toEqual({ remove: ["a"], add: ["e"] });
    expect(noticeDiff(["a", "b"], ["b"])).toEqual({ remove: ["a"], add: [] });
    expect(noticeDiff(["a", "b"], ["a", "b"])).toEqual({ remove: [], add: [] });
    // a row whose place changed is taken out and added again in the new order
    expect(noticeDiff(["a", "b"], ["b", "x", "a"])).toEqual({ remove: ["a"], add: ["x", "a"] });
  });
});

describe("chipVerbs", () => {
  const angel = { guest: false, locked: false, dead: false, flagged: false, truceUntil: 0, district: "wet" as const };
  it("shows USE while a paper is worth using, to any living body that holds one", () => {
    expect(chipVerbs(angel, "item-repair", 10).use).toBe(true);
    expect(chipVerbs(angel, null, 10).use).toBe(false);
    // a guest may buy paper at the stall and use it: the chip repeats I for it too (the player-defect sweep, round five)
    expect(chipVerbs({ ...angel, guest: true }, "item-repair", 10).use).toBe(true);
    expect(chipVerbs({ ...angel, dead: true }, "item-repair", 10).use).toBe(false);
  });
  it("shows the flag where the street allows it, worded for what V would do, and hides it in a truce or a quiet district", () => {
    expect(chipVerbs(angel, null, 10).flag).toBe("RAISE FLAG");
    expect(chipVerbs({ ...angel, flagged: true }, null, 10).flag).toBe("LOWER FLAG");
    expect(chipVerbs({ ...angel, district: "organs" }, null, 10).flag).toBe("RAISE FLAG");
    expect(chipVerbs({ ...angel, district: "kerb" }, null, 10).flag).toBeNull();
    expect(chipVerbs({ ...angel, truceUntil: 20 }, null, 10).flag).toBeNull();
    expect(chipVerbs({ ...angel, locked: true }, null, 10).flag).toBeNull();
  });
});
