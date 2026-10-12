// r19 client probe: a side hour's step detail (function-produced, where the sweeps put their instructions) never reaches
// the screen while a spine step is the objective. Real sim reducers, the real snapshot, the real journal panel over a
// tiny fake DOM.
import { describe, expect, it } from "vitest";
import type { Player, WorldState } from "../sim/types";
import { POSITIONS, districtAt } from "../sim/map";
import { emptyWorld, spawnGuest } from "../sim/world";
import { questById, tickQuests } from "../sim/quests";
import { C, F, Q } from "../sim/content/ids";
import { SF, SQ } from "../sim/content/side";
import { applyChoose, applyTalk } from "../sim/dialogue";
import { npcView, promptFor, snapshotFor } from "../sim/snapshot";
import { applyInteract } from "../sim/interact";
import { mountJournal } from "./journal";

// ---- a fake DOM just big enough for mountJournal
type FakeEl = {
  className: string; textContent: string; hidden: boolean; children: FakeEl[]; dataset: Record<string, string>;
  classList: { contains: (c: string) => boolean; toggle: (c: string, on?: boolean) => void; add: (c: string) => void; remove: (c: string) => void };
  append: (...k: FakeEl[]) => void; replaceChildren: (...k: FakeEl[]) => void; addEventListener: () => void; removeEventListener: () => void;
  querySelector: (s: string) => FakeEl | null; parentElement: null;
};
function el(): FakeEl {
  const classes = new Set<string>();
  const e: FakeEl = {
    className: "", textContent: "", hidden: false, children: [], dataset: {}, parentElement: null,
    classList: { contains: c => classes.has(c), toggle: (c, on) => { if (on ?? !classes.has(c)) classes.add(c); else classes.delete(c); }, add: c => classes.add(c), remove: c => classes.delete(c) },
    append: (...k) => { e.children.push(...k); }, replaceChildren: (...k) => { e.children = [...k]; },
    addEventListener: () => {}, removeEventListener: () => {}, querySelector: () => null,
  };
  return e;
}
const allText = (e: FakeEl): string => [e.textContent, ...e.children.map(allText)].join(" ");

const stepIdx = (q: string, s: string) => questById(q)!.steps.findIndex(x => x.id === s);
const M1_DONE = [F.ARRIVED, F.INTAKE, F.FIRST_NODE, F.DESK_THREE, F.SECOND_NODE, F.TALKED_QUILL, F.TALKED_ORD, F.TALKED_NARA, F.HEARD_RECORDER, F.MEMORIAL, F.BURIED_NARA, F.WEATHER_SAFETY, F.WEATHER_ORD, F.WEATHER_NARA, F.WEATHER_NAMED, F.UNDER, F.ANGEL, F.CARE];
const on = (...keys: string[]) => Object.fromEntries(keys.map(k => [k, 1]));
const CH1 = { [C.FIRST_NODE]: "keep", [C.SECOND_NODE]: "keep", [C.MEMORIAL]: "voice", [C.WEATHER]: "end" };
function angel(patch: Partial<Player>): WorldState {
  const w = emptyWorld();
  const base = spawnGuest("me", 0);
  const p: Player = { ...base, guest: false, serial: 41, name: "#0041", house: "mortals", aura: 15, auraSeed: 15, bestand: 60, extracted: 1, kept: 1, ...patch, party: { ...base.party, ...(patch.party ?? {}) } };
  return { ...w, players: new Map(w.players).set("me", p) };
}
const me = (w: WorldState) => w.players.get("me")!;
const put = (w: WorldState, x: number, y: number) => ({ ...w, players: new Map(w.players).set("me", { ...me(w), x, y, district: districtAt(x, y) }) });
const at = (w: WorldState, poi: string) => put(w, POSITIONS[poi].x, POSITIONS[poi].y);
const ctx = (w: WorldState) => ({ w, p: me(w), now: w.now });

describe("the side hour's detail on the screen", () => {
  it("Form 9's 'Decide the tithe first' reaches the journal while Movement II is the objective", () => {
    let w = angel({ movement: 2, flags: on(...M1_DONE, F.SHRINE, F.TALKED_SEXTON, F.HALL, F.TALKED_OFFICER, SF.OFFICER_MET), choices: { ...CH1, [C.ANNEX]: "held" }, quests: { [Q.M1]: 99, [Q.M2]: stepIdx(Q.M2, "freeze") } });
    w = at(w, "safety-desk");
    const v = promptFor(ctx(w))!;
    w = tickQuests(applyInteract(w, "me", "safety-desk", v.verbs.find(x => x.key === "F")!.choice), "me");
    const o = npcView(ctx(w), w.npcs.officer)!;
    w = applyTalk(put(w, o.x, o.y), "me", "officer");
    w = tickQuests(applyChoose(w, "me", "form9", "hub"), "me");
    const snap = snapshotFor(w, "me");
    const side = snap.sideObjectives.find(s => s.quest === SQ.FORM9)!;
    expect(side.detail).toContain("Decide the tithe first"); // the server's instruction
    expect(snap.objective?.quest).toBe(Q.M2); // the spine holds the journal's detail line

    const panel = el();
    const quests = el();
    const detail = el();
    const title = el();
    const sel: Record<string, FakeEl> = { ".journal-quests": quests, ".journal-detail": detail, ".journal-title": title };
    panel.querySelector = s => sel[s] ?? null;
    const root = { querySelector: (s: string) => (s === "#hud-journal" ? panel : null) } as unknown as HTMLElement;
    const g = globalThis as unknown as { document?: unknown };
    const hadDoc = "document" in g;
    g.document = { createElement: () => el() };
    try {
      const j = mountJournal(root);
      j.set(snap.objective, snap.you, snap.sideObjectives, false, snap.glass, snap.now);
    } finally {
      if (!hadDoc) delete g.document;
    }
    const screen = allText(panel) + " " + allText(quests) + " " + allText(detail) + " " + allText(title);
    expect(screen).toContain("Form 9"); // the row is there
    expect(screen).toContain("Decide the tithe first"); // and its instruction with it
  });
});
