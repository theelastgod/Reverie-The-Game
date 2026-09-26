import { describe, expect, it } from "vitest";
import { POSITIONS } from "../sim/map";
import { C, F } from "../sim/content/ids";
import type { Snap } from "../sim/protocol";
import type { Enemy } from "../sim/types";
import { COMBAT_ENTER_MS, COMBAT_LEAVE_MS, MUSIC_IDLE, baseTrack, bedFor, musicInputs, musicStep, sfxFor, type MusicInputs, type MusicState } from "./cues";

type Over = { district?: Snap["district"]; you?: Partial<Snap["you"]>; enemies?: Partial<Enemy>[] };

/** The slice of a snapshot the cues read. */
function snap(over: Over = {}): Snap {
  const you = {
    x: 1000, y: 1000, hp: 100, dead: false, kept: 0, extracted: 0, wink: "", flags: {}, choices: {}, history: { buried: 0 },
    ...over.you,
  };
  const enemies = (over.enemies ?? []).map((e, i) => ({ id: `e${i}`, state: "idle", x: 0, y: 0, ...e }));
  return { district: over.district ?? "nave", you, enemies } as unknown as Snap;
}

describe("bedFor", () => {
  it("names the bed after the district", () => {
    expect(bedFor(snap({ district: "nave" }))).toBe("bed-nave");
    expect(bedFor(snap({ district: "clearing" }))).toBe("bed-clearing");
  });
});

describe("musicInputs", () => {
  it("sees combat only from a fighting enemy in range", () => {
    expect(musicInputs(snap({ enemies: [{ state: "aggro", x: 1100, y: 1000 }] }), "city").combat).toBe(true);
    expect(musicInputs(snap({ enemies: [{ state: "telegraph", x: 1000, y: 1300 }] }), "city").combat).toBe(true);
    expect(musicInputs(snap({ enemies: [{ state: "recover", x: 1000, y: 1319 }] }), "city").combat).toBe(true);
    expect(musicInputs(snap({ enemies: [{ state: "aggro", x: 1000, y: 1400 }] }), "city").combat).toBe(false);
    expect(musicInputs(snap({ enemies: [{ state: "idle", x: 1010, y: 1000 }, { state: "dead", x: 1000, y: 1000 }] }), "city").combat).toBe(false);
  });

  it("grieves at the plot, in the Care and when dead", () => {
    const plot = POSITIONS["nara-plot"];
    expect(musicInputs(snap({ you: { x: plot.x + 100, y: plot.y } }), "city").grief).toBe(true);
    expect(musicInputs(snap({ you: { x: plot.x + 400, y: plot.y } }), "city").grief).toBe(false);
    expect(musicInputs(snap({ district: "care" }), "city").grief).toBe(true);
    expect(musicInputs(snap({ you: { dead: true } }), "city").grief).toBe(true);
  });
});

describe("baseTrack", () => {
  const at = (district: MusicInputs["district"], extra: Partial<MusicInputs> = {}): MusicInputs => ({ scene: "city", district, combat: false, grief: false, ...extra });
  it("follows the place, then grief, then the title", () => {
    expect(baseTrack(at("nave"))).toBe("nave-underscore");
    expect(baseTrack(at("annex"))).toBe("nave-underscore");
    expect(baseTrack(at("wet"))).toBe("grid-underscore");
    expect(baseTrack(at("kerb"))).toBe("grid-underscore");
    expect(baseTrack(at("clearing"))).toBe("clearing-rite");
    expect(baseTrack(at("ring"))).toBe("clearing-rite");
    expect(baseTrack(at("organs"))).toBeNull();
    expect(baseTrack(at("care"))).toBeNull();
    expect(baseTrack(at("nave", { grief: true }))).toBe("burial-elegy");
    expect(baseTrack(at("nave", { scene: "title" }))).toBe("title-theme");
    expect(baseTrack(at("organs", { scene: "credits" }))).toBe("title-theme");
  });
});

describe("musicStep", () => {
  const inputs = (combat: boolean, scene: MusicInputs["scene"] = "city"): MusicInputs => ({ scene, district: "nave", combat, grief: false });
  const run = (state: MusicState, steps: [boolean, number][]): MusicState[] => {
    const out: MusicState[] = [];
    let s = state;
    for (const [combat, t] of steps) { s = musicStep(s, inputs(combat), t); out.push(s); }
    return out;
  };

  it("starts the pulse only after sustained contact and keeps it through short gaps", () => {
    const states = run(MUSIC_IDLE, [[true, 0], [true, 200], [true, COMBAT_ENTER_MS], [false, 1000], [false, COMBAT_ENTER_MS + COMBAT_LEAVE_MS - 1], [true, 5000]]);
    expect(states.map(s => s.track)).toEqual(["nave-underscore", "nave-underscore", "combat-pulse", "combat-pulse", "combat-pulse", "combat-pulse"]);
  });

  it("a brush of contact shorter than the threshold never starts it", () => {
    const states = run(MUSIC_IDLE, [[true, 0], [false, 100], [false, 100 + COMBAT_LEAVE_MS]]);
    expect(states.map(s => s.track)).toEqual(["nave-underscore", "nave-underscore", "nave-underscore"]);
    expect(states[2].contactSince).toBeNull();
  });

  it("stops four seconds after the last contact and can start again", () => {
    const states = run(MUSIC_IDLE, [[true, 0], [true, 600], [false, 700], [false, 700 + COMBAT_LEAVE_MS], [true, 10000], [true, 10000 + COMBAT_ENTER_MS]]);
    expect(states.map(s => s.pulse)).toEqual([false, true, true, false, false, true]);
  });

  it("drops the pulse when the scene leaves the city", () => {
    let s = musicStep(MUSIC_IDLE, inputs(true), 0);
    s = musicStep(s, inputs(true), 600);
    expect(s.track).toBe("combat-pulse");
    s = musicStep(s, inputs(true, "credits"), 700);
    expect(s).toMatchObject({ track: "title-theme", pulse: false, contactSince: null });
  });
});

describe("sfxFor", () => {
  it("is quiet without a previous snapshot or a change", () => {
    expect(sfxFor(null, snap())).toEqual([]);
    expect(sfxFor(snap(), snap())).toEqual([]);
  });

  it("hears every diff once", () => {
    const a = snap();
    expect(sfxFor(a, snap({ you: { hp: 80 } }))).toEqual(["hit"]);
    expect(sfxFor(a, snap({ you: { hp: 0, dead: true } }))).toEqual(["death"]);
    expect(sfxFor(a, snap({ you: { kept: 1 } }))).toEqual(["keep"]);
    expect(sfxFor(a, snap({ you: { extracted: 1 } }))).toEqual(["extract"]);
    expect(sfxFor(a, snap({ you: { wink: "A hint." } }))).toEqual(["wink"]);
    expect(sfxFor(snap({ you: { wink: "A hint." } }), snap({ you: { wink: "" } }))).toEqual([]);
    expect(sfxFor(a, snap({ you: { flags: { [F.UNDER]: 1 } } }))).toEqual(["under"]);
    expect(sfxFor(a, snap({ you: { history: { buried: 1 } as never } }))).toEqual(["bury"]);
    expect(sfxFor(a, snap({ you: { flags: { [F.FREEZE]: 1 } } }))).toEqual(["freeze"]);
    expect(sfxFor(a, snap({ you: { choices: { [C.PASSING]: "appearance" } } }))).toEqual(["appearance"]);
    expect(sfxFor(a, snap({ you: { choices: { [C.PASSING]: "hijack" } } }))).toEqual(["hijack"]);
    expect(sfxFor(a, snap({ you: { choices: { [C.PASSING]: "failed" } } }))).toEqual([]);
    const same = snap({ you: { choices: { [C.PASSING]: "appearance" } } });
    expect(sfxFor(same, same)).toEqual([]);
  });

  it("orders several diffs the way they happened to the body", () => {
    expect(sfxFor(snap(), snap({ you: { hp: 60, kept: 1, extracted: 1 } }))).toEqual(["hit", "keep", "extract"]);
  });
});
