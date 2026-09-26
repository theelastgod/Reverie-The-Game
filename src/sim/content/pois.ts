/**
 * Base verbs for every POI in the map. Side quests append verbs later.
 * Each verb: key, label, choice string, when-gate, guest policy, cost with a
 * sink, once-flag, spoken line, and the Effects the engine applies.
 * Sacred POIs are "spectate" for guests: a refusal, never a lecture.
 */
import type { Ctx, Effect, Fourfold, PoiConfig, PoiVerb, WinkBySchool } from "../types";
import {
  AURA_ADDRESS_GLAMOUR, AURA_DIM, AURA_PRESENT, FREEZE_FEE, FUNERAL_COST, GESTELL_BASELINE, GESTELL_FAT, INSURE_COST, M3_DOOR_PRICE, MAX_HP,
  OPERATOR_YIELD, READINESS_BURY, READINESS_REFUSE, READINESS_WATCH, REPAIR_COST, RESTORE_AURA, RESTORE_COST, RESTRAINT_BURY_GAIN, TITHE_COST, UPKEEP_COST,
  WAR_PERIOD,
} from "../constants";
import { weatherBand } from "../protocol";
import { C, F, W, seasonPassingFlag } from "./ids";
import { WEATHER_LABELS, WEATHER_NAMED } from "./lines";

// ---------------------------------------------------------------- helpers

const has = (ctx: Ctx, key: string): boolean => (ctx.p.flags[key] ?? 0) > 0;
const chose = (ctx: Ctx, key: string, value: string): boolean => ctx.p.choices[key] === value;
const poiState = (ctx: Ctx, id: string): string => ctx.w.pois[id]?.state ?? "";
const gestellTax = (g: number): number => Math.floor(Math.max(0, Math.min(100, g)) / 4);
const partyWilling = (ctx: Ctx): boolean => ctx.p.party.nara !== "gone" && ctx.p.party.ord !== "gone";
const hasCult = (ctx: Ctx): boolean => ctx.p.items.some(i => i.kind === "cult");
const hallOf = (house: string): string => (house ? `hall-${house}` : "");
/** The aura the city addresses: the body's, plus what a Glamour paints on. Guests are 0. */
const addressAura = (ctx: Ctx): number => {
  const { p, now } = ctx;
  if (p.guest) return 0;
  const glamour = !!p.kit && p.kit.verb === "iridescent" && p.kit.until > now;
  return p.aura + (glamour ? AURA_ADDRESS_GLAMOUR : 0);
};
/** Sacred doors: dark to a dark aura, dim in fat weather to anyone the city does not look up at. Guests are refused elsewhere. */
const sacredOpen = (ctx: Ctx): boolean => {
  if (ctx.p.guest) return true;
  const aura = addressAura(ctx);
  if (aura < AURA_DIM) return false;
  return !(ctx.w.gestell >= GESTELL_FAT && aura < AURA_PRESENT);
};
const SACRED_DARK = "The door does not know you are here. Your aura is dark; the city does not look up. Restore it at the Care shrine.";
const SACRED_DIM = "Fat weather. The sacred doors dim. The city looks up only at the present. Keep, bury, dwell; come back with more aura or less weather.";
const sacredRefusal = (ctx: Ctx): string => (addressAura(ctx) < AURA_DIM ? SACRED_DARK : SACRED_DIM);
/** Whether this Angel has a prior hour standing in the Care: a history mark of their own serial. */
const hasHistoryMark = (ctx: Ctx): boolean => ctx.p.serial !== null && ctx.w.history.some(m => m.serial === ctx.p.serial);
/** Once per season the ring takes the rite; the first one is the campaign's Turn. */
const passedThisSeason = (ctx: Ctx): boolean => (ctx.p.flags[seasonPassingFlag(ctx.w.season.id)] ?? 0) > 0;
/**
 * The ring's ground, as the engine's `open` op will judge it (clearing.ts: never over a live contest or an open
 * hole, never with the reserve spent, never within WAR_PERIOD of the last opening): "open" is joined, "ok" is
 * prepared, "soon" and "spent" are stood at. The prompt only offers what the op will take, so the flag follows the hole.
 */
type Ground = "open" | "ok" | "soon" | "spent";
const ringGround = (ctx: Ctx): Ground => {
  const c = ctx.w.clearing;
  if ((c.contest && c.contest.active) || poiState(ctx, "clearing-ring") === "open") return "open";
  if (c.reserve <= 0) return "spent";
  if (c.openedAt > 0 && ctx.w.now - c.openedAt < WAR_PERIOD) return "soon";
  return "ok";
};
const settingSeconds = (ctx: Ctx): number => Math.max(0, Math.ceil(WAR_PERIOD - (ctx.w.now - ctx.w.clearing.openedAt)));
const HOUSE_NAME: Record<string, string> = {
  earth: "House of Earth",
  sky: "House of Sky",
  mortals: "House of Mortals",
  divinities: "House of Divinities",
};

const spectate: PoiVerb["guest"] = "spectate";

// ---------------------------------------------------------------- the Nave of Tubes

/** The slip off the Annex Runner: Safety's own number for the hour, which the plaque never prints. */
const slipNumber = (ctx: Ctx): number => Math.round(ctx.w.gestell);
const bulletinLine = (ctx: Ctx): string => (has(ctx, F.BULLETIN) && !has(ctx, F.WEATHER_NAMED)
  ? ` The slip in your coat is Safety's own, sealed for the funeral street. It does not say stability. It says ${slipNumber(ctx)}.`
  : "");
const pinnedLine = (ctx: Ctx): string => ((ctx.w.flags[W.BULLETIN_POSTED] ?? 0) > 0 ? " Under the word, pinned in someone's hand: the Annex's own number." : "");

const weatherNameVerb = (key: PoiVerb["key"], choice: "stability" | "process" | "end", label: string): PoiVerb => ({
  key,
  label,
  choice,
  when: ctx => has(ctx, F.WEATHER_SAFETY) && has(ctx, F.WEATHER_ORD) && has(ctx, F.WEATHER_NARA) && !has(ctx, F.WEATHER_NAMED),
  guest: "allow",
  say: ctx => WEATHER_NAMED[choice] + (!has(ctx, F.BULLETIN) ? ""
    : choice === "stability" ? ` You fold the slip away. The word stays on the plaque; the number, ${slipNumber(ctx)}, stays in your coat.`
    : ` You pin the slip under the word. It says ${slipNumber(ctx)}. Both stay up; anyone who reads the plaque now reads the number too.`),
  effects: ctx => [
    { kind: "choice", key: C.WEATHER, value: choice },
    { kind: "flag", key: F.WEATHER_NAMED },
    { kind: "poi", id: "safety-plaque", state: "named" },
    { kind: "worldCount", key: W.WEATHER_NAMES, delta: 1 },
    { kind: "notice", text: "You named the weather. The city can address you now.", tone: "gold" },
    ...(has(ctx, F.BULLETIN) && choice !== "stability"
      ? [{ kind: "worldFlag", key: W.BULLETIN_POSTED, value: 1 } as const, { kind: "news", text: "An arrival pinned the Annex's own number under the word stability." } as const]
      : []),
  ],
});

const NAVE: PoiConfig[] = [
  {
    id: "safety-plaque",
    label: ctx => (poiState(ctx, "safety-plaque") === "named" ? "Office of Safety — struck" : "Office of Safety"),
    plate: "safety-annex.jpg",
    verbs: [
      {
        key: "F",
        label: "Read the plaque",
        choice: "read",
        when: ctx => !has(ctx, F.WEATHER_SAFETY),
        guest: "allow",
        once: F.WEATHER_SAFETY,
        say: ctx => (poiState(ctx, "safety-plaque") === "named"
          ? "Office of Safety. Stability was the name they sold. Someone struck it. The weather has another name now. Speak with the living before you pick one."
          : "Office of Safety. This district is stable. Extraction is civic duty. Do not name the weather otherwise. Under it, smaller: do not name it from a plaque. Speak with the living.")
          + pinnedLine(ctx) + bulletinLine(ctx),
        effects: [{ kind: "notice", text: "Safety calls it stability. Two more names to hear.", tone: "ink" }],
      },
      weatherNameVerb("F", "stability", "Name it: stability"),
      weatherNameVerb("E", "process", "Name it: the process"),
      weatherNameVerb("Q", "end", "Name it: the end of world as world"),
      {
        key: "F",
        label: "Read the plaque",
        choice: "reread",
        when: ctx => has(ctx, F.WEATHER_SAFETY) && !(has(ctx, F.WEATHER_ORD) && has(ctx, F.WEATHER_NARA) && !has(ctx, F.WEATHER_NAMED)),
        guest: "allow",
        say: ctx => (has(ctx, F.WEATHER_NAMED)
          ? `Office of Safety. You called it ${ctx.p.choices[C.WEATHER] === "end" ? "the end of world as world" : ctx.p.choices[C.WEATHER] === "process" ? "the process" : "stability"}. The plaque still says stability. Plaques do.`
          : "Office of Safety. Stability, it says. You have one name. Ord and Nara have the other two. Do not name it from a plaque.")
          + pinnedLine(ctx) + bulletinLine(ctx),
      },
    ],
  },
  {
    id: "memorial-recorder",
    label: ctx => (poiState(ctx, "memorial-recorder") === "dismantled" ? "Memorial recorder — dismantled" : "Memorial recorder"),
    plate: "memorial-recorder-v1.jpg",
    verbs: [
      {
        key: "F",
        label: "Listen",
        choice: "listen",
        guest: "allow",
        effects: ctx => (has(ctx, F.TALKED_NARA) ? [{ kind: "flag", key: F.HEARD_RECORDER }] : []),
        say: ctx => {
          if (!has(ctx, F.TALKED_NARA)) return "A recorder on a crate. A voice in it, mid-sentence, on a loop. Nara holds the grave open west of here. Speak with her first.";
          if (poiState(ctx, "memorial-recorder") === "dismantled") return "The recorder is open. The coil is gone. The voice stopped mid-breath and did not start again. The copper is in a coffin.";
          return "A voice. It is reading a list of names, and its own is not on it. Between the words there is a silence that is also on the loop.";
        },
      },
      {
        key: "E",
        label: "Dismantle the copper",
        choice: "copper",
        when: ctx => has(ctx, F.TALKED_NARA) && has(ctx, F.HEARD_RECORDER) && !has(ctx, F.MEMORIAL),
        guest: "allow",
        once: F.MEMORIAL,
        say: "You lift the coil from the recorder. The voice stops mid-breath. Nara folds the copper around the coffin. No part goes to market.",
        effects: [
          { kind: "choice", key: C.MEMORIAL, value: "copper" },
          { kind: "item", add: { id: "cult:copper-binding", kind: "cult", name: "Copper binding", qty: 1, value: 0, bound: true } },
          { kind: "poi", id: "memorial-recorder", state: "dismantled" },
          { kind: "notice", text: "Copper binding. Cult. It does not list.", tone: "ink" },
        ],
      },
      {
        key: "Q",
        label: "Preserve the voice",
        choice: "voice",
        when: ctx => has(ctx, F.TALKED_NARA) && has(ctx, F.HEARD_RECORDER) && !has(ctx, F.MEMORIAL),
        guest: "allow",
        once: F.MEMORIAL,
        say: "You leave the recorder running. Nara tears her coat into binding cloth. The voice has another night.",
        effects: [
          { kind: "choice", key: C.MEMORIAL, value: "voice" },
          { kind: "worldFlag", key: W.MEMORIAL_VOICE, value: 1 },
          { kind: "notice", text: "The recorder plays on. Cloth for the coffin.", tone: "ink" },
        ],
      },
    ],
  },
  {
    id: "nara-plot",
    label: ctx => (poiState(ctx, "nara-plot") === "closed" ? "Burial plot — closed" : "Burial plot"),
    plate: "plate-burial.jpg",
    verbs: [
      {
        key: "F",
        label: "Close the earth",
        choice: "bury",
        when: ctx => has(ctx, F.MEMORIAL) && !has(ctx, F.BURIED_NARA),
        guest: "allow",
        say: ctx => {
          const shared = poiState(ctx, "nara-plot") === "closed";
          if (shared) return "Someone closed the earth before you. Nara makes room beside the name. The watch is still yours to keep.";
          return chose(ctx, C.MEMORIAL, "copper")
            ? "The copper holds. Under the earth, something that spoke has become something that carries. Nara waits until your hands are empty."
            : "The cloth holds. The recorder carries a voice across the funeral street. Nara stays until you hear the silence between its words.";
        },
        effects: [
          { kind: "flag", key: F.BURIED_NARA },
          { kind: "poi", id: "nara-plot", state: "closed" },
          { kind: "readiness", delta: READINESS_BURY },
          { kind: "restraint", delta: RESTRAINT_BURY_GAIN },
          { kind: "history", buried: 1 },
          { kind: "notice", text: "Buried. Readiness. Nothing was paid.", tone: "gold" },
        ],
      },
      {
        key: "F",
        label: "Stand at the plot",
        choice: "stand",
        when: ctx => has(ctx, F.BURIED_NARA),
        guest: "allow",
        say: "Closed earth. A name on a slat. The recorder can be heard from here if the wind is right.",
      },
    ],
  },
  {
    id: "going-under",
    label: "The threshold",
    plate: "plate-under.jpg",
    verbs: [
      {
        key: "F",
        label: "Go under",
        choice: "under",
        when: ctx => has(ctx, F.WEATHER_NAMED) && has(ctx, F.BURIED_NARA) && !has(ctx, F.UNDER),
        guest: "allow",
        effects: [{ kind: "poi", id: "going-under", state: "open" }, { kind: "under" }],
      },
      {
        key: "F",
        label: "Look down",
        choice: "look",
        when: ctx => !(has(ctx, F.WEATHER_NAMED) && has(ctx, F.BURIED_NARA)) || has(ctx, F.UNDER),
        guest: "allow",
        say: ctx => {
          if (has(ctx, F.UNDER)) return "The threshold. You have been under it. The Care is south, through the gate.";
          if (!has(ctx, F.BURIED_NARA)) return "A lip of concrete and under it, a dark that is a floor. Nara holds a grave open. Close it first.";
          return "A lip of concrete. The weather has no name yet. Give it one at the plaque before you go under it.";
        },
      },
    ],
  },
  {
    id: "guest-arena",
    label: "Practice ground",
    plate: "plate-arena.jpg",
    verbs: [
      {
        key: "F",
        label: "Read the rules",
        choice: "read",
        guest: "allow",
        say: "Practice ground. Strike the dummy; people are safe here. Click or Space to strike. Shift and a direction to step through a swing. R for the heavy: slower, same number, it stops a swing mid-air. No spoils. Guests are not loot.",
      },
    ],
  },
  {
    id: "crt-altar-1",
    label: "CRT altar",
    verbs: [
      {
        key: "F",
        label: "Watch",
        choice: "watch",
        guest: "allow",
        say: "A stack of screens with the tubes still warm. Static, then a room, then static. Nobody is in the room.",
        effects: [{ kind: "wink", text: "The room on the screen is this one. It is empty because you are looking at the screen." }, { kind: "poi", id: "crt-altar-1", state: "lit" }],
      },
    ],
  },
  {
    id: "crt-altar-2",
    label: "CRT altar",
    verbs: [
      {
        key: "F",
        label: "Watch",
        choice: "watch",
        guest: "allow",
        say: "Screens in a ring. One of them shows the yield desk from above. The clerk is at it. The clerk is also on the street behind you, doing the job.",
        effects: [{ kind: "wink", text: "A copy of a person doing a job. The copy does not clock out." }],
      },
    ],
  },
];

// ---------------------------------------------------------------- the Wet Grid

const browse = (id: string, say: string): PoiVerb => ({ key: "F", label: "Browse", choice: "browse", guest: "allow", say, effects: [{ kind: "poi", id, state: "open" }] });

const WET: PoiConfig[] = [
  {
    id: "stall-1",
    label: "Stall · surfaces",
    plate: "stall-surface.jpg",
    verbs: [browse("stall-1", "Surfaces. Halo prints, wing decals, a coin with an open angel on it. None of it is the angel. All of it is for sale.")],
  },
  {
    id: "stall-2",
    label: "Stall · copies",
    plate: "stall-surface.jpg",
    verbs: [
      browse("stall-2", "Copies. Repair paper for cracked prints. Six Bestand. The stallholder is not Quill and says so twice."),
      {
        key: "E",
        label: "Buy repair paper (6)",
        choice: "repair",
        guest: "allow",
        cost: { bestand: REPAIR_COST, sink: "repair" },
        say: "Repair paper. Six Bestand. Press I to use it. It mends a body, not a print. Cult was never cracked.",
        effects: [{ kind: "item", add: { id: "paper:repair", kind: "paper", name: "Repair paper", qty: 1, value: 0 } }],
      },
    ],
  },
  {
    id: "stall-3",
    label: "Stall · plants",
    plate: "stall-surface.jpg",
    verbs: [browse("stall-3", "Plants in armored pots. Living, which is the luxury. The stallholder waters them with a measuring cup and writes it down.")],
  },
  {
    id: "stall-4",
    label: "Stall · vans",
    plate: "stall-surface.jpg",
    verbs: [
      browse("stall-4", "Armored vans, parts of. Insurance paper by the box. Ten Bestand a sheet. One death, one walk back."),
      {
        key: "E",
        label: `Buy insurance paper (${INSURE_COST})`,
        choice: "insurance",
        guest: "allow",
        cost: { bestand: INSURE_COST, sink: "insurance" },
        say: "Insurance paper. Ten Bestand. Press I to hold it. Death walks you back to where you fell. It is a walk, not a revive.",
        effects: [{ kind: "item", add: { id: "paper:insurance", kind: "paper", name: "Insurance paper", qty: 1, value: 0 } }],
      },
    ],
  },
  {
    id: "forge-tray",
    label: ctx => (poiState(ctx, "forge-tray") === "warm" ? "Forge tray — warm" : "Forge tray"),
    plate: "plate-forge.jpg",
    reach: 64,
    verbs: [
      {
        key: "F",
        label: "Hear Quill on copies",
        choice: "hear",
        when: ctx => has(ctx, F.TALKED_QUILL) && !has(ctx, F.FORGE),
        guest: "allow",
        effects: [{ kind: "poi", id: "forge-tray", state: "warm" }, { kind: "dialogue", npc: "quill", node: "forge-lesson" }],
      },
      {
        // The engine routes "craft" on forge-tray to economy.applyForge; effects stay empty here.
        key: "E",
        label: "Craft a copy",
        choice: "craft",
        when: ctx => has(ctx, F.TALKED_QUILL),
        guest: "allow",
        effects: [],
      },
      {
        // The engine routes "spot" on forge-tray to economy.applyForge; effects stay empty here.
        key: "Q",
        label: "Spot the copies",
        choice: "spot",
        when: ctx => has(ctx, F.TALKED_QUILL),
        guest: "allow",
        effects: [],
      },
      {
        // The engine routes "sell" on forge-tray to economy.applyForge; effects stay empty here.
        key: "F",
        label: "Sell a copy",
        choice: "sell",
        when: ctx => has(ctx, F.FORGE) && chose(ctx, C.FORGE, "sell"),
        guest: "allow",
        effects: [],
      },
      {
        key: "F",
        label: "Look at the tray",
        choice: "look",
        when: ctx => !has(ctx, F.TALKED_QUILL) || (has(ctx, F.FORGE) && !chose(ctx, C.FORGE, "sell")),
        guest: "allow",
        say: ctx => (has(ctx, F.TALKED_QUILL)
          ? "Two sheets on the tray. One has dirt in the grain. One has a margin. You can tell now. It does not make the print worth less to anyone but you."
          : "A tray of wet sheets and a warm plate. Someone prints here. Quill, on the Nave, would tell you what."),
      },
    ],
  },
  {
    id: "listing-board",
    label: ctx => (poiState(ctx, "listing-board") === "clearing-listed" ? "Listing board — a Clearing, priced" : "Listing board"),
    plate: "clearing-stall.jpg",
    verbs: [
      {
        key: "F",
        label: "Read the board",
        choice: "read",
        guest: spectate,
        say: "Quill listed a Clearing. Forty Bestand. Copies travel. The hole does not. Below it, smaller hands: keep-groups, hold-rates, a schedule of who will stand in which hole for what.",
        effects: [
          { kind: "flag", key: F.BOARD },
          { kind: "worldFlag", key: W.CLEARING_LISTED, value: 1 },
          { kind: "poi", id: "listing-board", state: "clearing-listed" },
          { kind: "wink", text: "It looks like freedom. It is a stall. The sky is already priced." },
          { kind: "notice", text: "The resistance is pricing Clearings.", tone: "hot" },
        ],
      },
    ],
  },
  {
    id: "claims-desk",
    label: "Claims desk",
    plate: "plate-claims.jpg",
    verbs: [
      // The engine routes file / bank / take on claims-desk to economy.applyClaims; effects stay empty here.
      { key: "F", label: "File a claim", choice: "file", guest: spectate, effects: [] },
      { key: "E", label: "Bank", choice: "bank", guest: spectate, effects: [] },
      { key: "Q", label: "Take", choice: "take", guest: spectate, effects: [] },
    ],
  },
  {
    id: "operator-desk",
    label: ctx => (poiState(ctx, "operator-desk") === "closed" ? "Operator's desk — vacant" : "Operator's desk"),
    plate: "plate-operator.jpg",
    verbs: [
      {
        key: "F",
        label: "Hear the offer",
        choice: "hear",
        when: ctx => has(ctx, F.HALL) && !has(ctx, F.OPERATOR),
        guest: spectate,
        effects: [{ kind: "dialogue", npc: "vesper", node: "offer" }],
      },
      {
        key: "F",
        label: "Look at the desk",
        choice: "look",
        when: ctx => !has(ctx, F.HALL) || has(ctx, F.OPERATOR),
        guest: spectate,
        say: ctx => {
          if (!has(ctx, F.HALL)) return "A woman at a desk with one number on it. She does not look up. Vesper Hale will not quote a private node to someone who has not read who owns the public ones.";
          if (chose(ctx, C.OPERATOR, "take")) return "The desk is closed. The yield is in your hand. Private yield still wants a body and it has yours.";
          return "The desk is here. The offer is not. She does not quote twice.";
        },
      },
      {
        key: "E",
        label: "Take the private yield",
        choice: "take",
        when: ctx => has(ctx, F.HALL) && !has(ctx, F.OPERATOR),
        guest: spectate,
        once: F.OPERATOR,
        say: "You took the private yield. Cold is a current, not a costume. The Organs door is paid for out of it. Nara Vale has stopped speaking to you.",
        effects: [
          { kind: "choice", key: C.OPERATOR, value: "take" },
          { kind: "bestand", delta: OPERATOR_YIELD, earner: "operator" },
          // The yield funds the door: the desk keeps the door's price back and opens it. The rest is yours, Cold.
          { kind: "bestand", delta: -M3_DOOR_PRICE, sink: "door" },
          { kind: "current", value: "cold" },
          { kind: "flag", key: F.M3 },
          { kind: "worldFlag", key: W.VESPER_GONE, value: 1 },
          { kind: "party", npc: "nara", state: "waiting" },
          { kind: "poi", id: "operator-desk", state: "closed" },
          { kind: "notice", text: `Private yield. ${OPERATOR_YIELD} Bestand, ${M3_DOOR_PRICE} of it to the Organs door. The door is open.`, tone: "hot" },
        ],
      },
      {
        key: "Q",
        label: "Refuse it",
        choice: "refuse",
        when: ctx => has(ctx, F.HALL) && !has(ctx, F.OPERATOR),
        guest: spectate,
        once: F.OPERATOR,
        say: "You refused. Go back to the wreckage garden and bury what our work destroyed. Then take the Organs door. There is another way through.",
        effects: [
          { kind: "choice", key: C.OPERATOR, value: "refuse" },
          { kind: "readiness", delta: READINESS_REFUSE },
          { kind: "notice", text: "You refused the private yield. Readiness. The garden opens the door.", tone: "gold" },
        ],
      },
    ],
  },
  {
    id: "hot-street",
    label: ctx => (poiState(ctx, "hot-street") === "hot" ? "Hot street — flagged" : "Hot street"),
    plate: "house-war.jpg",
    verbs: [
      {
        key: "F",
        label: "Read the street",
        choice: "read",
        guest: "allow",
        say: ctx => (ctx.p.guest
          ? "A wet street. Painted on the kerb: opt in, seconds, spoils from people. You are not flagged. You are not spoils."
          : "A wet street. Painted on the kerb: opt in, seconds, spoils from people, not from the street. Press V to flag. Unbanked and copies drop. Cult and banked stay. Guests are not loot. In meltdown weather the street flags itself."),
      },
    ],
  },
];

// ---------------------------------------------------------------- the Care

const CARE: PoiConfig[] = [
  {
    id: "care-shrine",
    label: "Care shrine",
    plate: "plate-care.jpg",
    verbs: [
      {
        key: "F",
        label: "Rest",
        choice: "rest",
        guest: spectate,
        say: "You rest at the shrine. The body mends. The city knows where to put you back now. Not a revive; a place.",
        effects: [
          { kind: "heal", amount: MAX_HP },
          { kind: "respawnAt", poi: "care-shrine" },
          { kind: "flag", key: F.SHRINE },
          { kind: "flag", key: F.CARE },
        ],
      },
      {
        key: "E",
        label: `Restore aura (${RESTORE_COST})`,
        choice: "restore",
        guest: spectate,
        cost: { bestand: RESTORE_COST, sink: "restore" },
        say: "You spent Bestand. Aura returns. The Wink can be held again.",
        effects: [{ kind: "aura", delta: RESTORE_AURA }],
      },
      {
        key: "Q",
        label: "Face the history",
        choice: "history",
        when: ctx => hasHistoryMark(ctx) && !has(ctx, F.HISTORY),
        guest: spectate,
        once: F.HISTORY,
        say: ctx => {
          const mark = ctx.w.history.find(m => m.serial === ctx.p.serial);
          return `${mark?.line ?? "A prior hour. You stood here and left the body in the weather."} Only you can face this wreckage. The serial remembers. The city does not.`;
        },
        effects: [
          { kind: "flag", key: F.HISTORY },
          { kind: "wink", text: "The serial remembers. The city does not. That is the only privacy left." },
          { kind: "readiness", delta: 2 },
        ],
      },
    ],
  },
  {
    id: "clinic",
    label: "Clinic",
    plate: "plate-care.jpg",
    verbs: [
      {
        key: "F",
        label: `Repair (${REPAIR_COST})`,
        choice: "repair",
        guest: spectate,
        cost: { bestand: REPAIR_COST, sink: "repair" },
        say: "Six Bestand. The body holds again. The clinic does not heal the Gestell. It says so on the door.",
        effects: [{ kind: "heal", amount: MAX_HP }],
      },
      {
        key: "E",
        label: `Insurance (${INSURE_COST})`,
        choice: "insure",
        guest: spectate,
        cost: { bestand: INSURE_COST, sink: "insurance" },
        say: "Ten Bestand. Death walks you back to where you fell, once. It is a walk, not a bigger strike.",
        effects: [{ kind: "insure" }],
      },
    ],
  },
  {
    id: "funeral-desk",
    label: "Funeral desk",
    plate: "plate-burial.jpg",
    verbs: [
      {
        key: "F",
        label: `Pay for a burial (${FUNERAL_COST})`,
        choice: "pay",
        guest: spectate,
        cost: { bestand: FUNERAL_COST, sink: "funeral" },
        say: ctx => (ctx.p.party.nara === "waiting"
          ? "You paid Nara Vale's street. Five Bestand. The body is in the ground. She will speak again."
          : "You paid Nara Vale's street. Five Bestand. A body nobody claimed is in the ground. The desk writes a name it made up."),
        effects: ctx => {
          const out: Effect[] = [
            { kind: "readiness", delta: 2 },
            { kind: "worldCount", key: W.BURIALS, delta: 1 },
          ];
          if (ctx.p.party.nara === "waiting") out.push({ kind: "party", npc: "nara", state: "with" });
          return out;
        },
      },
    ],
  },
  {
    id: "wreckage-garden",
    label: ctx => (poiState(ctx, "wreckage-garden") === "buried" ? "Wreckage garden — buried" : "Wreckage garden"),
    plate: "wreckage-garden.jpg",
    reach: 64,
    verbs: [
      {
        key: "F",
        label: "Bury the garden",
        choice: "bury",
        // The refuse route reaches the garden before the door: the offer must be decided, not the door opened.
        when: ctx => has(ctx, F.OPERATOR) && !has(ctx, F.GARDEN),
        guest: spectate,
        say: ctx => (poiState(ctx, "wreckage-garden") === "buried"
          ? "The garden has been buried. You stay beside it until the city stops counting your time. Nara Vale will speak."
          : "The Clearing from the first hour is wreckage now. You put it in the ground. Nara Vale will speak."),
        effects: [
          { kind: "flag", key: F.GARDEN },
          { kind: "flag", key: F.M3 },
          { kind: "poi", id: "wreckage-garden", state: "buried" },
          { kind: "worldFlag", key: W.GARDEN_BURIED, value: 1 },
          { kind: "readiness", delta: READINESS_BURY },
          { kind: "restraint", delta: RESTRAINT_BURY_GAIN },
          { kind: "party", npc: "nara", state: "with" },
          { kind: "history", buried: 1 },
          { kind: "wink", text: "You took a hole and called it weather. It came back as earth. Only burial makes it world again." },
          { kind: "notice", text: "The garden is in the ground. The Organs door is open.", tone: "gold" },
          // Nara kneels at it: the plate is numbered or it is not, and she asks which.
          { kind: "dialogue", npc: "nara", node: "garden-plate" },
        ],
      },
      {
        key: "Q",
        label: "Keep watch",
        choice: "watch",
        when: ctx => (ctx.w.flags[W.GARDEN_BURIED] ?? 0) > 0 && !has(ctx, F.MORTALITY),
        guest: spectate,
        say: "You keep watch over buried ground. Nothing happens. That is the act. Readiness is slower than salvage.",
        effects: [
          { kind: "readiness", delta: READINESS_WATCH },
          { kind: "flag", key: F.MORTALITY },
          { kind: "choice", key: C.MORTALITY, value: "watch" },
          { kind: "notice", text: "A mortality act. Watch. The Clearing will take you now.", tone: "gold" },
        ],
      },
      {
        key: "F",
        label: "Look at the garden",
        choice: "look",
        when: ctx => !(has(ctx, F.OPERATOR) && !has(ctx, F.GARDEN)),
        guest: spectate,
        say: ctx => (has(ctx, F.GARDEN)
          ? "Buried ground. A garden in the sense that things are under it. Nara Vale comes here when nobody is dying."
          : "A hole with a fence around it. Wreckage in the shape of a node. Someone will have to answer for it before it can be earth."),
      },
    ],
  },
];

// ---------------------------------------------------------------- the halls

const hall = (house: "mortals" | "sky" | "divinities" | "earth", plaque: string, otherLine: string): PoiConfig => {
  const id = `hall-${house}`;
  return {
    id,
    label: ctx => (poiState(ctx, id) === "lit" ? `${HOUSE_NAME[house]} hall — lit` : `${HOUSE_NAME[house]} hall`),
    plate: "house-hall.jpg",
    verbs: [
      {
        key: "F",
        label: "Read the plaque",
        choice: "read",
        when: ctx => ctx.p.house === house,
        guest: spectate,
        say: ctx => `${plaque} Tithe ${gestellTax(ctx.w.gestell)} percent. The nodes belong to the process. The tax is climate. It will never make you hit harder.`,
        effects: [
          { kind: "flag", key: F.HALL },
          { kind: "poi", id, state: "lit" },
          { kind: "wink", text: "Who owns the nodes: the Houses on paper, and the weather in fact." },
          { kind: "notice", text: `${HOUSE_NAME[house]}. Your hall is lit.`, tone: "sky" },
        ],
      },
      {
        key: "F",
        label: "Read the plaque",
        choice: "read-other",
        when: ctx => ctx.p.house !== house,
        guest: spectate,
        say: ctx => `${otherLine} This hall keeps ${HOUSE_NAME[house]} standing. Your House is ${ctx.p.house ? HOUSE_NAME[ctx.p.house] : "unsealed"}; its hall is elsewhere.`,
      },
      // The engine routes "tithe" and "bounty" on the four halls to houses.applyTithe / applyBounty; effects stay empty here.
      { key: "E", label: "Tithe", choice: "tithe", when: ctx => ctx.p.house === house, guest: spectate, effects: [] },
      { key: "Q", label: "Bounty", choice: "bounty", when: ctx => ctx.p.house === house && poiState(ctx, id) === "lit", guest: spectate, effects: [] },
    ],
  };
};

// ---------------------------------------------------------------- the Safety Annex

const ANNEX: PoiConfig[] = [
  {
    id: "safety-desk",
    label: ctx => (poiState(ctx, "safety-desk") === "frozen" ? "Freeze desk — a freeze holds" : "Freeze desk"),
    plate: "safety-annex.jpg",
    verbs: [
      {
        key: "F",
        label: `Sign the freeze (${FREEZE_FEE})`,
        choice: "sign",
        when: ctx => has(ctx, F.HALL) && !has(ctx, F.FREEZE),
        guest: spectate,
        cost: { bestand: FREEZE_FEE, sink: "freeze" },
        once: F.FREEZE,
        say: ctx => "You signed the freeze. Fifteen Bestand. The Nave holds. The Passing will go hungry. Peace is a kind of weather."
          + (chose(ctx, C.ANNEX, "hungry") ? " You said hungry in the corridor. The signature says otherwise. Safety keeps both." : ""),
        effects: [
          { kind: "choice", key: C.FREEZE, value: "signed" },
          { kind: "freeze", district: "nave", seconds: 1800 },
          { kind: "poi", id: "safety-desk", state: "frozen" },
          { kind: "wink", text: "You bought time. You spent an hour. The signature does not get it back." },
          { kind: "news", text: "A freeze was signed at the Annex. The Nave holds for half an hour." },
        ],
      },
      {
        key: "Q",
        label: "Refuse to sign",
        choice: "refuse",
        when: ctx => has(ctx, F.HALL) && !has(ctx, F.FREEZE),
        guest: spectate,
        once: F.FREEZE,
        say: ctx => "You refused. The Nave stays a mouth. The Passing stays possible. The clerk stamps a form that says you were here and did nothing, which is the form for that."
          + (chose(ctx, C.ANNEX, "held") ? " You said held in the corridor. The refusal says otherwise. Safety keeps both." : ""),
        effects: [
          { kind: "choice", key: C.FREEZE, value: "refused" },
          { kind: "readiness", delta: 4 },
          { kind: "notice", text: "You refused the freeze. Readiness.", tone: "gold" },
        ],
      },
      {
        key: "F",
        label: "Read the desk",
        choice: "read",
        when: ctx => !has(ctx, F.HALL) || has(ctx, F.FREEZE),
        guest: spectate,
        say: ctx => {
          if (!has(ctx, F.HALL)) return "Safety Annex. Fifteen Bestand. Sign here. The district holds. The hour does not. The Annex will not take a name that has not read the hall.";
          return chose(ctx, C.FREEZE, "signed")
            ? "Your signature, in the ledger. The Nave held for half an hour on it. The Passing went hungry for the same half hour."
            : "Your refusal, in the ledger. They keep those too. Safety keeps everything. It is what keeping means to them.";
        },
      },
    ],
  },
  {
    id: "tax-window",
    label: "Tax window",
    plate: "safety-annex.jpg",
    verbs: [
      {
        key: "F",
        label: "Read the tax",
        choice: "read",
        guest: "allow",
        say: ctx => {
          const tax = gestellTax(ctx.w.gestell);
          const earth = ctx.p.house === "earth" ? ` House of Earth pays ${Math.max(0, tax - 2)} on ground nodes.` : "";
          const decided = chose(ctx, C.TITHE, "paid") ? " Your tithe for this hour is in the ledger, paid before it was taken."
            : chose(ctx, C.TITHE, "rode") ? " You let this hour's tithe ride. The node will take it, at whatever the weather is then." : "";
          return `Tax window. Current tax ${tax} percent on every extraction, taken before the yield reaches your hand.${earth} The rate is the weather divided by four. Nobody at this window set it.${decided}`;
        },
      },
      // Movement II: an Angel who has read their hall decides this hour's tithe once. Paying is the hall's tithe by another window; riding is the weather's.
      {
        key: "E",
        label: `Pay this hour's tithe (${TITHE_COST})`,
        choice: "pay",
        when: ctx => has(ctx, F.HALL) && !!ctx.p.house && !has(ctx, F.TITHE),
        guest: spectate,
        cost: { bestand: TITHE_COST, sink: "tithe" },
        once: F.TITHE,
        say: ctx => `Paid. ${TITHE_COST} Bestand, before the weather could take it at the node. The clerk writes ${HOUSE_NAME[ctx.p.house] ?? "your House"} beside it. Standing is what a House calls money that arrived early.`,
        effects: ctx => [
          { kind: "choice", key: C.TITHE, value: "paid" },
          { kind: "standing", house: ctx.p.house as Fourfold, delta: 1 },
          { kind: "wink", text: "The tithe was always going to be taken. Paying it first only changes who writes your name." },
          { kind: "notice", text: `Tithe paid early. ${HOUSE_NAME[ctx.p.house] ?? "Your House"} stands a little higher.`, tone: "sky" },
        ],
      },
      {
        key: "Q",
        label: "Let it ride",
        choice: "ride",
        when: ctx => has(ctx, F.HALL) && !!ctx.p.house && !has(ctx, F.TITHE),
        guest: spectate,
        once: F.TITHE,
        say: "You let it ride. The clerk does not write anything; the node will, at whatever the weather is when you next extract. Nobody at this window set the rate, and nobody here can hold it for you.",
        effects: [
          { kind: "choice", key: C.TITHE, value: "rode" },
          { kind: "wink", text: "Riding is a bet on the weather easing. The weather has never once been asked." },
          { kind: "notice", text: "The tithe rides. The node will take its share.", tone: "ink" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------- the Kerb of Hours

/** Last season's hole, by school. Each points at what is not there; none names it. */
export const LAST_SEASON_WINK: WinkBySchool = {
  default: "You face the wreckage. The storm is at your back. That is the whole stance.",
  hint: "A hole where nobody stood is still a door. It was held open for no one.",
  wreckage: "You face the wreckage. The storm is at your back. That is the whole stance.",
  omen: "The front came and went while the glass showed a number. The number was not wrong. It was not the weather.",
  dwelling: "The hole needed people in it. There were none. Rooms do not hold themselves.",
  process: "The ledger has the season as a line: opened, unheld, closed. The line is honest. Honest is not the same as enough.",
  surface: "Last season's hole lists for nothing. It is the one thing on the Kerb that could not be copied.",
};

const forecastLine = (ctx: Ctx): string => {
  const band = weatherBand(ctx.w.gestell);
  const base = WEATHER_LABELS[band];
  if (ctx.p.house !== "sky") return `Forecast glass. ${base}`;
  const drift = ctx.w.gestell > GESTELL_BASELINE + 0.5 ? "The drift is down: the weather eases toward baseline." : ctx.w.gestell < GESTELL_BASELINE - 0.5 ? "The drift is up: the weather climbs toward baseline." : "No drift. The weather sits at baseline.";
  return `Forecast glass. ${base} ${drift} Only Sky sees the front.`;
};

const KERB: PoiConfig[] = [
  {
    id: "omen-terrace",
    label: "Omen terrace",
    plate: "failed-passing.jpg",
    verbs: [
      {
        key: "F",
        label: "Read the terrace",
        choice: "read",
        guest: spectate,
        say: "Terraces of poured concrete with oval windows that look at nothing. A halo of thin pink light on the top step, at the wrong hour for it.",
        effects: [
          { kind: "poi", id: "omen-terrace", state: "read" },
          { kind: "wink", text: "An omen is a bell that rings before the hour and is not wrong." },
        ],
      },
    ],
  },
  {
    id: "hour-bell",
    label: ctx => (poiState(ctx, "hour-bell") === "struck" ? "Hour bell — struck" : "Hour bell"),
    plate: "clearing-ring.jpg",
    verbs: [
      {
        key: "F",
        label: "Strike the bell",
        choice: "strike",
        guest: spectate,
        // The line is read after the effects land, so the flag it set cannot gate it: the glass not yet faced is "on the way".
        say: ctx => (ctx.p.movement >= 3 && !has(ctx, F.FAILED)
          ? "You strike the hour bell once, on the way to the glass. The note goes over the Kerb and does not come back. On the terrace below, the omen-reader looks up from her slip with a time on it; the time is wrong by exactly one strike."
          : "You strike the hour bell. The note goes over the Kerb and does not come back. Somebody below looks up and then goes on extracting."),
        effects: [
          { kind: "flag", key: F.BELL },
          { kind: "poi", id: "hour-bell", state: "struck" },
          { kind: "news", text: "The hour bell was struck on the Kerb." },
        ],
      },
    ],
  },
  {
    id: "forecast-glass",
    label: "Forecast glass",
    plate: "failed-passing.jpg",
    verbs: [
      {
        key: "F",
        label: "Read the forecast",
        choice: "read",
        when: ctx => !(ctx.p.movement >= 3 && !has(ctx, F.FAILED)),
        guest: spectate,
        say: forecastLine,
        effects: [{ kind: "poi", id: "forecast-glass", state: "lit" }],
      },
      {
        key: "F",
        label: "Face last season",
        choice: "season",
        when: ctx => ctx.p.movement >= 3 && !has(ctx, F.FAILED),
        guest: spectate,
        say: "In the glass, behind the forecast: last season's Passing failed. The hour went by. The city kept the weather. There is a hole in the Clearing where nobody stood. You watched. You did not loot it.",
        effects: [
          { kind: "flag", key: F.FAILED },
          { kind: "poi", id: "forecast-glass", state: "lit" },
          { kind: "wink", text: LAST_SEASON_WINK },
          { kind: "readiness", delta: 2 },
          { kind: "notice", text: "A failed Passing from last season. Ruin-sight, the Storm and the House of Sky can stand at the hole itself.", tone: "sky" },
        ],
      },
    ],
  },
  hall("sky", "House of Sky. Hours, omens, Passing timing. You see the front others do not.", "A sky you cannot name."),
];

// ---------------------------------------------------------------- the Gold Ring

const shrine = (id: string, name: string, line: string): PoiConfig => ({
  id,
  label: ctx => (poiState(ctx, id) === "kept" ? `${name} — kept` : name),
  plate: "shrine-upkeep.jpg",
  verbs: [
    {
      key: "F",
      label: `Keep upkeep (${UPKEEP_COST})`,
      choice: "keep",
      when: sacredOpen,
      guest: spectate,
      cost: { bestand: UPKEEP_COST, sink: "upkeep" },
      say: `${line} Five Bestand into the ground. A Wink. Aura thickens a little.`,
      effects: [
        { kind: "poi", id, state: "kept" },
        { kind: "winke", delta: 1 },
        { kind: "aura", delta: 1 },
      ],
    },
    {
      key: "F",
      label: "Stand at the shrine",
      choice: "stand",
      when: ctx => !sacredOpen(ctx),
      guest: spectate,
      say: sacredRefusal,
    },
  ],
});

const RING: PoiConfig[] = [
  shrine("shrine-1", "Shrine of the first bell", "You keep the first shrine. The bell above it has a tongue and has never used it."),
  shrine("shrine-2", "Shrine of the mute bell", "You keep the second shrine. The mute bell hangs below it, further down the Ring."),
  shrine("shrine-3", "Shrine of the last bell", "You keep the last shrine. It is the one nobody keeps. The dust says so."),
  {
    id: "mute-bell",
    label: ctx => (poiState(ctx, "mute-bell") === "rung" ? "Mute bell — rung" : "Mute bell"),
    plate: "shrine-upkeep.jpg",
    verbs: [
      {
        key: "F",
        label: "Ring the bell",
        choice: "ring",
        when: ctx => poiState(ctx, "shrine-2") === "kept" && sacredOpen(ctx),
        guest: spectate,
        say: "You ring the mute bell. No sound. Every bird on the Ring leaves at once.",
        effects: [
          { kind: "poi", id: "mute-bell", state: "rung" },
          { kind: "wink", text: "The bell you did not hear is the one that rang." },
        ],
      },
      {
        key: "F",
        label: "Look at the bell",
        choice: "look",
        when: ctx => !(poiState(ctx, "shrine-2") === "kept" && sacredOpen(ctx)),
        guest: spectate,
        say: ctx => (poiState(ctx, "shrine-2") !== "kept"
          ? "A bell with no tongue. The shrine above it is unkept. Keep it and the bell will take a hand."
          : sacredRefusal(ctx)),
      },
    ],
  },
  {
    id: "last-god-trace",
    label: ctx => (poiState(ctx, "last-god-trace") === "seen" ? "A trace — seen" : "A trace"),
    plate: "wet-grid-cult.jpg",
    verbs: [
      {
        key: "F",
        label: "Face the trace",
        choice: "face",
        when: ctx => ctx.p.winke >= 2 && sacredOpen(ctx),
        guest: spectate,
        say: "A place on the stone where the light is a different age. Nothing is here. It was, in the way a door was open. You face it. That is the whole visit.",
        effects: [
          { kind: "poi", id: "last-god-trace", state: "seen" },
          { kind: "wink", text: "You will not meet it. You will notice where it was standing." },
          { kind: "readiness", delta: 2 },
        ],
      },
      {
        key: "F",
        label: "Look",
        choice: "look",
        when: ctx => !(ctx.p.winke >= 2 && sacredOpen(ctx)),
        guest: spectate,
        say: ctx => (ctx.p.winke < 2
          ? "A faint place on the stone. You do not have the Winke to see what it is a trace of. Keep two shrines."
          : sacredRefusal(ctx)),
      },
    ],
  },
  {
    id: "cult-vault",
    label: ctx => (poiState(ctx, "cult-vault") === "open" ? "Cult vault — open" : "Cult vault"),
    plate: "wet-grid-cult.jpg",
    verbs: [
      {
        key: "F",
        label: "Open the vault",
        choice: "open",
        when: ctx => hasCult(ctx) && sacredOpen(ctx),
        guest: spectate,
        say: "The vault takes the cult object in your hand as a key and gives it back. Inside: shelves of things that have never been listed. Yours goes on a shelf in your mind and nowhere else.",
        effects: [
          { kind: "poi", id: "cult-vault", state: "open" },
          { kind: "wink", text: "A copy travels. What it copies stays in the hand that buried it." },
        ],
      },
      {
        key: "F",
        label: "Try the door",
        choice: "try",
        when: ctx => !(hasCult(ctx) && sacredOpen(ctx)),
        guest: spectate,
        say: ctx => (!hasCult(ctx)
          ? "Sealed. The lock wants a cult object: something bound, something that does not list. You are carrying only things that can be in two hands."
          : sacredRefusal(ctx)),
      },
    ],
  },
  hall("divinities", "House of Divinities. Winke, shrines, traces. Fragile where the weather is fat.", "A Wink you cannot name."),
];

// ---------------------------------------------------------------- the Organs

const ORGANS: PoiConfig[] = [
  {
    id: "organ-strait",
    label: ctx => (poiState(ctx, "organ-strait") === "refused" ? "The Strait — refused" : "The Strait"),
    plate: "organ-strait.jpg",
    reach: 64,
    verbs: [
      {
        key: "F",
        label: "Study the Strait",
        choice: "study",
        when: ctx => has(ctx, F.M3),
        guest: spectate,
        say: ctx => (poiState(ctx, "organ-strait") === "refused"
          ? "The Strait. Someone stopped the water. No country here. Only a closed mouth."
          : "The Strait. Water that is not water. Ore and hulls pass. Extract here and the Foundry breathes."),
        effects: [{ kind: "flag", key: F.STRAIT }, { kind: "notice", text: "The Strait feeds the Foundry.", tone: "sky" }],
      },
      {
        key: "E",
        label: "Refuse the feed",
        choice: "refuse",
        when: ctx => has(ctx, F.M3) && poiState(ctx, "organ-strait") === "feeding",
        guest: spectate,
        say: "You refused the water. The Strait stops paying a furnace. The number is quieter. Nara Vale does not have to forgive it.",
        effects: [
          { kind: "poi", id: "organ-strait", state: "refused" },
          { kind: "gestell", delta: -1 },
          { kind: "news", text: "Someone refused the Strait. The water is not paying." },
        ],
      },
    ],
  },
  {
    id: "organ-foundry",
    label: ctx => (poiState(ctx, "organ-foundry") === "dark" ? "The Foundry — dark" : "The Foundry"),
    plate: "organ-foundry-dark.jpg",
    reach: 64,
    verbs: [
      {
        key: "F",
        label: "Study the Foundry",
        choice: "study",
        when: ctx => has(ctx, F.M3),
        guest: spectate,
        say: ctx => (poiState(ctx, "organ-foundry") === "dark"
          ? "The Foundry. Someone unlit the heat. The Cable still drinks on what was already paid."
          : "The Foundry. Heat without a nation. The Cable drinks what you take."),
        effects: [{ kind: "flag", key: F.FOUNDRY }, { kind: "notice", text: "The Foundry lights the Cable.", tone: "sky" }],
      },
      {
        key: "Q",
        label: "Darken the Foundry",
        choice: "darken",
        when: ctx => has(ctx, F.M3) && poiState(ctx, "organ-foundry") === "lit",
        guest: spectate,
        say: "You shut the heat. The furnace goes from a mouth to a room. Cold is honest. It is not the last word.",
        effects: [
          { kind: "poi", id: "organ-foundry", state: "dark" },
          { kind: "worldFlag", key: "foundryDark", value: 1 },
          { kind: "news", text: "Someone darkened the Foundry. The heat is off." },
        ],
      },
    ],
  },
  {
    id: "organ-cable",
    label: ctx => (poiState(ctx, "organ-cable") === "quiet" ? "The Cable — quiet" : "The Cable"),
    plate: "organ-cable-dark.jpg",
    reach: 64,
    verbs: [
      {
        key: "F",
        label: "Study the Cable",
        choice: "study",
        when: ctx => has(ctx, F.M3),
        guest: spectate,
        say: ctx => (poiState(ctx, "organ-cable") === "quiet"
          ? "The Cable. Someone kept a node. The hum is less. The Foundry notices."
          : "The Cable. Signal as flesh. The Strait is already paying for this light."),
        effects: [{ kind: "flag", key: F.CABLE }, { kind: "notice", text: "The Cable drinks what the Strait paid. Ord will draw it.", tone: "sky" }],
      },
    ],
  },
  hall("earth", "House of Earth. Ground, ore, withdrawal. The tax bites less on ground nodes.", "A ground you cannot name."),
  {
    id: "cold-desk",
    label: "Cold desk",
    plate: "plate-vesper.jpg",
    verbs: [
      {
        key: "F",
        label: "Read the honest number",
        choice: "read",
        guest: spectate,
        say: ctx => {
          const g = Math.round(ctx.w.gestell);
          const ex = ctx.w.flags[W.EXTRACTIONS] ?? 0;
          const bu = ctx.w.flags[W.BURIALS] ?? 0;
          return `Cold desk. Gestell ${g}. Extractions ${ex}. Burials ${bu}. Tax ${gestellTax(g)} percent. Nobody at this desk will pretty it.`;
        },
      },
    ],
  },
];

// ---------------------------------------------------------------- the Clearing

const seed = (id: string): PoiConfig => ({
  id,
  label: ctx => (poiState(ctx, id) === "seeded" ? "Seed ground — seeded" : "Seed ground"),
  plate: "clearing-ring.jpg",
  verbs: [
    {
      key: "F",
      label: "Plant a seed",
      choice: "plant",
      when: ctx => ctx.p.messenger === "dweller" && poiState(ctx, id) !== "seeded",
      guest: spectate,
      say: "A seed in the kept ground. A promise you cannot cash. The Clearing will hold a little longer for it.",
      effects: [{ kind: "poi", id, state: "seeded" }],
    },
    {
      key: "F",
      label: "Look at the ground",
      choice: "look",
      when: ctx => ctx.p.messenger !== "dweller" || poiState(ctx, id) === "seeded",
      guest: spectate,
      say: ctx => (poiState(ctx, id) === "seeded" ? "A seed in the ground. Someone dwelt here long enough to leave one." : "Bare ground inside the ring. A Dweller could seed it. You are not one."),
    },
  ],
});

const CLEARING: PoiConfig[] = [
  {
    id: "clearing-ring",
    label: ctx => {
      const s = poiState(ctx, "clearing-ring");
      return s === "open" ? "The Clearing — open" : s === "held" ? "The Clearing — held" : s === "failed" ? "The Clearing — failed" : "The Clearing";
    },
    plate: "clearing-ring.jpg",
    reach: 64,
    verbs: [
      {
        key: "F",
        label: "Prepare the ground",
        choice: "prepare",
        // Who stands in it is decided with Ord at the Care gate first: the spine's step order holds at the ring too.
        when: ctx => has(ctx, F.MORTALITY) && !!ctx.p.choices[C.PARTY] && partyWilling(ctx) && !has(ctx, F.PREPARE) && ringGround(ctx) === "ok",
        guest: spectate,
        say: "You keep the hole. The party still willing stands in it. The Passing is not yet the weather.",
        effects: [
          { kind: "flag", key: F.PREPARE },
          { kind: "clearing", op: "open" },
          { kind: "notice", text: "The Clearing is prepared. E keeps it. Q extracts it. F passes.", tone: "gold" },
        ],
      },
      {
        // Someone else's hole is open: the ground is theirs and yours; no second contest is opened over a live one.
        key: "F",
        label: "Stand in the open hole",
        choice: "join",
        when: ctx => has(ctx, F.MORTALITY) && !!ctx.p.choices[C.PARTY] && partyWilling(ctx) && !has(ctx, F.PREPARE) && ringGround(ctx) === "open",
        guest: spectate,
        say: "The hole is open already. Somebody prepared it and it has not set. You stand in it with them; the ring counts bodies, not who opened it.",
        effects: [
          { kind: "flag", key: F.PREPARE },
          { kind: "notice", text: "You stand in an open Clearing. E keeps it. Q extracts it. F passes.", tone: "gold" },
        ],
      },
      {
        key: "F",
        label: "Stand at the ring",
        choice: "look",
        when: ctx => !has(ctx, F.PREPARE) && !passedThisSeason(ctx) && (!has(ctx, F.MORTALITY) || !ctx.p.choices[C.PARTY] || !partyWilling(ctx) || ringGround(ctx) === "soon" || ringGround(ctx) === "spent"),
        guest: spectate,
        say: ctx => {
          if (!has(ctx, F.MORTALITY)) return "A ring in the asphalt. Keep the hole. The hour is not a character. A mortality act is required first: watch, a burial, or a last word.";
          if (!ctx.p.choices[C.PARTY]) return "A ring in the asphalt. Ord is at the Care gate with the ledger open: who stands in it is decided there, before the ground.";
          if (!partyWilling(ctx)) return "A ring in the asphalt. The party will not stand. Someone walked. You cannot force the hour alone.";
          if (ringGround(ctx) === "spent") return "A ring in the asphalt. The Clearing's reserve is spent; there is nothing left to open until it fills back, a point at a time.";
          return `A ring in the asphalt. The last hole was contested lately and the asphalt has not set: ${settingSeconds(ctx)} seconds. Wait for the hour, or stand here while it sets.`;
        },
      },
      {
        // Once prepared, the ring is the rest of life: keep or extract whenever a hole is open, one stance per contest.
        key: "E",
        label: "Keep the hole",
        choice: "keep",
        when: ctx => has(ctx, F.PREPARE),
        guest: spectate,
        effects: [{ kind: "clearing", op: "keep" }],
      },
      {
        key: "Q",
        label: "Extract the hole",
        choice: "extract",
        when: ctx => has(ctx, F.PREPARE),
        guest: spectate,
        effects: [{ kind: "clearing", op: "extract" }],
      },
      {
        // The rite is seasonal: the first Passing is the Turn; every season after, a prepared Angel may stand for it again.
        key: "F",
        label: "The Passing",
        choice: "pass",
        when: ctx => has(ctx, F.PREPARE) && !passedThisSeason(ctx),
        guest: spectate,
        // The engine routes "pass" on clearing-ring to clearing.applyPassing; the effect below is the content-side signal.
        effects: [{ kind: "passing" }],
      },
      {
        key: "F",
        label: "Stand in what is left",
        choice: "after",
        when: passedThisSeason,
        guest: spectate,
        say: ctx => {
          switch (ctx.p.choices[C.PASSING]) {
            case "appearance": return "A trace. The city was world for a minute. It is a ring in the asphalt again. That is not a loss. That is what a trace is.";
            case "absence": return "The hour went by. Absence is honest. The ring is a ring. Nara Vale stays.";
            case "hijack": return "The hour was claimed. You are marked. The world continues. So do you.";
            case "failed": return "No hole. Gestell kept the weather. No stipend. Next season there is asphalt again and people to stand on it.";
            default: return "A ring in the asphalt.";
          }
        },
      },
    ],
  },
  seed("seed-1"),
  seed("seed-2"),
  seed("seed-3"),
  seed("seed-4"),
];

// ---------------------------------------------------------------- export

const ALL: PoiConfig[] = [
  ...NAVE,
  ...WET,
  ...CARE,
  hall("mortals", "House of Mortals. Wreckage, funerals, care. You see the fallen longer than anyone.", "A hall of names you cannot gather."),
  ...ANNEX,
  ...KERB,
  ...RING,
  ...ORGANS,
  ...CLEARING,
];

export const POI_CONFIGS: Record<string, PoiConfig> = Object.fromEntries(ALL.map(c => [c.id, c]));

/** The hall POI id for a House, for quest targets. */
export function hallPoiFor(house: string): string {
  return hallOf(house) || "hall-mortals";
}
