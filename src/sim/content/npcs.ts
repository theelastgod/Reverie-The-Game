/**
 * The party and the two named operators. Each has a job and a lie.
 * Nara buries. Quill sells. Ord counts. Vesper prices. Ione leaves.
 * Content returns Effects; it never touches state.
 */
import type { Ctx, DialogueNode, Effect, NpcDef, NpcState } from "../types";
import { POSITIONS } from "../map";
import { AURA_ADDRESS_GLAMOUR, AURA_DIM, COPY_PRICE, M3_DOOR_PRICE, OPERATOR_YIELD, READINESS_BURY, READINESS_REFUSE, READINESS_WATCH } from "../constants";
import { C, F, W } from "./ids";
import { PARTY_BLIND } from "./lines";

type NpcOverride = Partial<NpcState> | null;

// ---------------------------------------------------------------- helpers

const has = (ctx: Ctx, key: string): boolean => (ctx.p.flags[key] ?? 0) > 0;
const chose = (ctx: Ctx, key: string, value: string): boolean => ctx.p.choices[key] === value;
const worldHas = (ctx: Ctx, key: string): boolean => (ctx.w.flags[key] ?? 0) > 0;

const BLIND_WINDOW = 20; // seconds after a Wink in which the party notices you looking

/** True for an Angel the city does not look up at: aura dark, and no Glamour painting some on. Guests are addressed as unsealed instead. */
function dark(ctx: Ctx): boolean {
  const { p, now } = ctx;
  if (p.guest) return false;
  const glamour = !!p.kit && p.kit.verb === "iridescent" && p.kit.until > now;
  return p.aura + (glamour ? AURA_ADDRESS_GLAMOUR : 0) < AURA_DIM;
}

/** True when the viewer acted on a Wink this NPC could not see and has not been told so yet. */
function unseenWink(ctx: Ctx, npc: string): boolean {
  const { p, now } = ctx;
  if (p.guest || !p.wink || p.winkAt <= 0) return false;
  if (now - p.winkAt > BLIND_WINDOW) return false;
  return (p.flags[`blind:${npc}`] ?? 0) < p.winkAt;
}

const blindEffects = (npc: string) => (ctx: Ctx): Effect[] => [
  { kind: "flag", key: `blind:${npc}`, value: Math.max(1, Math.ceil(ctx.now)) },
];

function station(id: string): { x: number; y: number; district: NpcState["district"] } {
  const s = POSITIONS[`station:${id}`];
  return { x: s.x, y: s.y, district: s.district };
}

const outcome = (ctx: Ctx): string => ctx.p.choices[C.PASSING] ?? "";

// ================================================================ NARA VALE — sexton

function naraRoute(ctx: Ctx): string {
  const { p } = ctx;
  if (p.movement >= 5 || has(ctx, F.PASSING)) return "after";
  if (p.party.nara === "gone") return "gone";
  if (has(ctx, F.OPERATOR) && !has(ctx, F.GARDEN)) return "garden-silent";
  if (p.party.nara === "waiting") return "waiting";
  if (has(ctx, F.GARDEN) && !p.choices[C.GARDEN] && p.movement < 4) return "garden-plate";
  if (has(ctx, F.GARDEN) && has(ctx, F.PREPARE)) return "ring";
  if (has(ctx, F.GARDEN) && p.movement >= 4 && !has(ctx, F.MORTALITY)) return "stand-offer";
  if (has(ctx, F.GARDEN)) return "garden-buried";
  if (has(ctx, F.UNDER)) return "care";
  if (!has(ctx, F.TALKED_NARA)) return "first";
  if (!has(ctx, F.MEMORIAL)) return "memorial";
  if (!has(ctx, F.BURIED_NARA)) return "plot";
  if (!has(ctx, F.WEATHER_NARA)) return "weather";
  if (!has(ctx, F.WEATHER_NAMED)) return "buried";
  return "threshold";
}

const NARA_NODES: Record<string, DialogueNode> = {
  dark: {
    id: "dark",
    text: "Nara Vale does not look up. A body with no presence on the funeral street is a shape the weather made. The shrine in the Care restores what the city looks at. Come back when it can see you.",
  },
  blind: {
    id: "blind",
    text: `${PARTY_BLIND} Whatever it is, I cannot bury it for you. Say what you need.`,
    effects: blindEffects("nara"),
    next: naraRoute,
  },
  first: {
    id: "first",
    text: "A body on the funeral street. Desk Six. They did a job and the job finished them. I am the sexton. I put things in the ground. You look like you came in unsealed and did not know the city was already over.",
    wink: "She has buried people who called this stability. She has not forgiven any of it.",
    effects: [{ kind: "flag", key: F.TALKED_NARA }, { kind: "party", npc: "nara", state: "with" }],
    choices: [
      { id: "who", label: "Who was it?", next: "who" },
      { id: "help", label: "What do you need?", next: "memorial" },
      { id: "leave", label: "Not now." },
    ],
  },
  who: {
    id: "who",
    text: "A clerk. Fourteen years at a yield desk. They counted what the street gave up and signed it as civic duty. The Gestell took the street and then it took the counting. Nobody strikes a clerk in the end. The weather does.",
    next: "memorial",
  },
  memorial: {
    id: "memorial",
    text: (ctx) => (has(ctx, F.HEARD_RECORDER)
      ? "You heard it. Its copper would close the coffin. Leave the voice running, or give its body to this one. I won't choose for you."
      : "A voice survived in that recorder, on a crate east of here. Its copper would close the coffin. Go and hear it first. I won't choose for you, and I won't let you choose deaf."),
    wink: "A voice or a vessel. Neither one pays. That is the point of the street.",
    choices: [
      { id: "voice", label: "Leave the voice running.", when: ctx => !has(ctx, F.MEMORIAL) && has(ctx, F.HEARD_RECORDER), next: "memorial-voice" },
      { id: "copper", label: "Take the copper for the coffin.", when: ctx => !has(ctx, F.MEMORIAL) && has(ctx, F.HEARD_RECORDER), next: "memorial-copper" },
      { id: "look", label: "I want to hear it first.", when: ctx => !has(ctx, F.HEARD_RECORDER) || has(ctx, F.MEMORIAL) },
    ],
  },
  "memorial-voice": {
    id: "memorial-voice",
    text: "You leave the recorder running. Nara tears her coat into binding cloth. The voice has another night.",
    effects: [
      { kind: "choice", key: C.MEMORIAL, value: "voice" },
      { kind: "flag", key: F.MEMORIAL },
      { kind: "worldFlag", key: W.MEMORIAL_VOICE, value: 1 },
      { kind: "notice", text: "The recorder plays on. Cloth for the coffin.", tone: "ink" },
    ],
    next: "plot",
  },
  "memorial-copper": {
    id: "memorial-copper",
    text: "You lift the coil from the recorder. The voice stops mid-breath. Nara folds the copper around the coffin. No part goes to market.",
    effects: [
      { kind: "choice", key: C.MEMORIAL, value: "copper" },
      { kind: "flag", key: F.MEMORIAL },
      { kind: "item", add: { id: "cult:copper-binding", kind: "cult", name: "Copper binding", qty: 1, value: 0, bound: true } },
      { kind: "poi", id: "memorial-recorder", state: "dismantled" },
      { kind: "notice", text: "Copper binding. Cult. It does not list.", tone: "ink" },
    ],
    next: "plot",
  },
  plot: {
    id: "plot",
    text: (ctx) => chose(ctx, C.MEMORIAL, "voice")
      ? "The cloth is ready and the voice is still playing. The plot is west of me. Press F there and close the earth. Do not thank me."
      : "The copper holds. The plot is west of me. Press F there and close the earth. Do not thank me.",
    wink: "Burial does not list. She respects that more than she says.",
  },
  weather: {
    id: "weather",
    text: (ctx) => {
      const print = ctx.p.items.some(i => i.id === "copy:face")
        ? "There is a print of you in your coat. She does not ask to see it. \"Paper. It will go grey before the earth does.\" "
        : ctx.p.choices[C.QUILL_PRINT] === "kept" ? "\"You kept your name off Quill's plate.\" She notices it the way she notices a body without a number. \"Good. The earth does not take prints.\" " : "";
      return print + "It's in the earth. Don't thank me. You want a name for the weather. Safety calls it stability. Ord will call it the process. I call it the end of world as world. Remember that when he shows you a number.";
    },
    wink: "Three names. Only one of them has a body under it.",
    effects: [{ kind: "flag", key: F.WEATHER_NARA }],
  },
  buried: {
    id: "buried",
    text: "You have three names now. Go to the plaque by the Annex gate and give the weather one of them. Not from a plaque. From what you heard.",
  },
  threshold: {
    id: "threshold",
    text: (ctx) => ctx.p.guest
      ? "The threshold is east of the plot. The Care is under it. Angels go under as death. A guest stops at the lip. I do not make the rule. I bury what it makes."
      : "The threshold is east of the plot. The Care is under it. You go under as death, not as a cutscene. I will be there when you wake. I am usually there.",
    wink: "Dying-as-death is a verb here. Nothing else opens the Care.",
  },
  care: {
    id: "care",
    text: "You woke. Most do. The Care does not keep you. It only lets you be mortal in a warehouse. Touch the shrine so the city knows where to put you back. Then read your hall and find out who owns the nodes you were standing on.",
    wink: "What is not here is not in the next room either. She knows. She checked.",
  },
  waiting: {
    id: "waiting",
    text: "I am on the funeral street. I have not left. There is a body that nobody has paid to bury and you are the one who made it. Pay the desk. Then we talk.",
    wink: "Waiting is not forgiveness. It is a held door.",
  },
  gone: {
    id: "gone",
    text: "She does not turn. She will not stand with a city that will not bury. The hole in the Care is still a grave. Put it in the ground and she will speak.",
  },
  "garden-silent": {
    id: "garden-silent",
    text: "Nara Vale looks at the garden that used to be a hole. The node you turned on in the first hour. She will not speak until it is in the ground. Press F at the garden.",
    wink: "You took a hole and called it weather. It came back as earth. Only burial makes it world again.",
  },
  "garden-plate": {
    id: "garden-plate",
    text: "It is in the earth. Nara Vale kneels and puts her hand flat on it. There is a plate. It has the node's number on it, or it does not. The Care keeps the numbered ones in the book. The unnumbered ones it keeps anyway. Which is this one?",
    wink: "The twelve numbers in the sexton's coat are numbers because nobody chose. This one, somebody does.",
    choices: [
      { id: "numbered", label: "Number it. Put it in the book.", when: ctx => !ctx.p.choices[C.GARDEN], next: "garden-numbered" },
      { id: "unnumbered", label: "No number. Earth is enough.", when: ctx => !ctx.p.choices[C.GARDEN], next: "garden-unnumbered" },
      { id: "later", label: "Let me look at it first." },
    ],
  },
  "garden-numbered": {
    id: "garden-numbered",
    text: "She scratches the node's number into the plate with the edge of the trowel. It is in the book now. Pim Ashe will read it at the next wake and somebody will hear it who never stood here. Nobody can say it was not a place.",
    wink: "A number is a name the city can pronounce. It is not the same as being remembered. It is close enough to argue with.",
    effects: [
      { kind: "choice", key: C.GARDEN, value: "numbered" },
      { kind: "news", text: "A garden in the Care went into the book under its number." },
      { kind: "notice", text: "The garden is numbered. The Care's book has it.", tone: "ink" },
    ],
  },
  "garden-unnumbered": {
    id: "garden-unnumbered",
    text: "She leaves the plate blank and stands. The Care will keep it anyway. It keeps the unnamed ledger for exactly this: twelve numbers in a coat and one blank plate. That is the honest count. I would rather a blank plate than a number that is only there so a clerk can stop looking.",
    wink: "Unnumbered is not unremembered. It is remembered by someone instead of by something.",
    effects: [
      { kind: "choice", key: C.GARDEN, value: "unnumbered" },
      { kind: "aura", delta: 1 },
      { kind: "notice", text: "The garden is unnumbered. The Care keeps it anyway.", tone: "ink" },
    ],
  },
  "garden-buried": {
    id: "garden-buried",
    text: (ctx) => (chose(ctx, C.GARDEN, "numbered")
      ? "You put it in the earth and a number on it. I will not forgive the factory. I will walk to the Strait if you go there. I will not carry the earth for you twice."
      : "You put it in the earth and left the plate blank. I will not forgive the factory. I will walk to the Strait if you go there. I will not carry the earth for you twice."),
    wink: "A person who buried someone. Not a function.",
  },
  "stand-offer": {
    id: "stand-offer",
    text: "The Clearing wants a mortality act before it takes anyone. Watch, or a burial, or a last word. I have a grave in the garden with your hands on it. Stand at it with me. It counts. It is not a costume.",
    choices: [
      { id: "stand", label: "Stand at the grave with her.", when: ctx => !has(ctx, F.MORTALITY), next: "stand" },
      { id: "later", label: "Not yet." },
    ],
  },
  stand: {
    id: "stand",
    text: "You stand. She does not say anything for a long time. Then: that is the act. Do not make a story of it. Now the ring.",
    effects: [
      { kind: "choice", key: C.MORTALITY, value: "burial" },
      { kind: "flag", key: F.MORTALITY },
      { kind: "readiness", delta: READINESS_BURY },
      { kind: "notice", text: "A mortality act. Burial. The Clearing will take you now.", tone: "gold" },
    ],
  },
  ring: {
    id: "ring",
    text: "I am in the ring. I will stand in the hole as long as it is a hole. If the process takes it I will still be here; I will just be standing in stock. Press F at the ring when the party is ready.",
    wink: "The Clearing holds when people do.",
  },
  after: {
    id: "after",
    text: (ctx) => {
      switch (outcome(ctx)) {
        case "appearance": return "A trace. Not a face. The city was world for a minute and I saw you see it. That is all I ever wanted from the street. Now bury the next one.";
        case "absence": return "The hour went by. Absence is honest. I stay. The hole is still a grave. Nothing you did was wrong. Nothing you did was enough. That is what the word means.";
        case "hijack": return "Somebody claimed the hour. Cold or Safety, it does not matter to the body. You are marked. Marks are not sins. They are places. I bury places.";
        case "failed": return "Gestell kept the weather. No hole. I stood in the ring anyway. Nobody can say I did not. Next season there will be earth again.";
        default: return "It is in the earth. All of it. I still will not forgive the factory.";
      }
    },
    wink: "She buried the outcome the way she buries everything: without a number.",
  },
};

// ================================================================ QUILL — forger

function quillRoute(ctx: Ctx): string {
  const { p } = ctx;
  if (p.movement >= 5 || has(ctx, F.PASSING)) return "after";
  if (!has(ctx, F.TALKED_QUILL)) return "first";
  if (!has(ctx, F.UNDER)) return "later";
  if (has(ctx, F.FORGE)) return "forge-after";
  if (p.movement >= 3 || has(ctx, F.M3)) return "forge-lesson";
  if (!has(ctx, F.BOARD)) return "board-hint";
  return "board-read";
}

/** After her first three answers Quill makes her offer, once. */
const quillOffer = (ctx: Ctx): string | undefined => (ctx.p.choices[C.QUILL_PRINT] ? undefined : "offer");

const QUILL_NODES: Record<string, DialogueNode> = {
  dark: {
    id: "dark",
    text: "Quill looks through you at the stall behind. No aura, no customer. She sells surfaces and you are not on one. Restore it at the Care shrine; she will find you funny again.",
  },
  blind: {
    id: "blind",
    text: `${PARTY_BLIND} I can sell you a print of it if you describe it well. Joke. Half a joke.`,
    effects: blindEffects("quill"),
    next: quillRoute,
  },
  first: {
    id: "first",
    text: "Copies travel. Aura doesn't. If you sell the face, keep the name. That's the only honest stall left on this kerb. Quill. Forger. I print what people want to have seen.",
    wink: "She is lying about being honest and honest about lying. It is a style.",
    effects: [{ kind: "flag", key: F.TALKED_QUILL }, { kind: "party", npc: "quill", state: "with" }],
    choices: [
      { id: "sells", label: "What sells?", next: "market" },
      { id: "owns", label: "Who owns the stalls?", next: "owners" },
      { id: "street", label: "There is a body on the funeral street.", next: "burial-joke" },
    ],
  },
  market: {
    id: "market",
    text: "Exhibition. Prints, copies, surfaces. Things that can be in two hands at once. They decay, which is the joke. Cult objects are the other kind: one hand, one place, no listing. Nobody buys cult. Everybody wants it. That is the whole market in two sentences and I charge for the third.",
    next: "owners",
  },
  owners: {
    id: "owners",
    text: "The Houses, on paper. The weather, in fact. Go through the east gate to the Wet Grid and stand at the listing board when you have eyes for it. You do not yet. Come back with a grave on you.",
    wink: "The Wet Grid looks like freedom. It is a stall. The sky is already priced.",
    next: quillOffer,
  },
  "burial-joke": {
    id: "burial-joke",
    text: "You look like you might bury something. Cute. Burial doesn't list. I still respect it. Go see the sexton. She will not laugh. Someone on this street has to and she has decided it is me.",
    next: quillOffer,
  },
  offer: {
    id: "offer",
    text: "One more thing, since you are standing there. I can print you. Unsealed face, a surface; it travels, and the aura stays where it is, which is nowhere yet. Or keep the name and I print nobody. Cheaper. Lonelier.",
    wink: "She wants the print because a face on the kerb is a customer she can find again.",
    choices: [
      { id: "print", label: "Print me.", next: "print-yes" },
      { id: "keep", label: "Keep the name.", next: "print-no" },
    ],
  },
  "print-yes": {
    id: "print-yes",
    text: "She prints you in one pass and hands it over wet. It is you the way a plaque is a district. \"It will decay. Everything on paper does. List it on the Grid when you have eyes, or keep it and watch it go grey.\"",
    effects: [
      { kind: "choice", key: C.QUILL_PRINT, value: "printed" },
      { kind: "item", add: { id: "copy:face", kind: "exhibition", name: "A print of your face", qty: 1, value: 3 } },
      { kind: "notice", text: "A print of your face. Exhibition. It decays.", tone: "ink" },
    ],
  },
  "print-no": {
    id: "print-no",
    text: "\"Kept the name.\" She shrugs and wipes the plate. \"Nobody will ask for it either. That is the honest version of privacy.\"",
    effects: [
      { kind: "choice", key: C.QUILL_PRINT, value: "kept" },
      { kind: "notice", text: "You kept the name. Nothing printed.", tone: "ink" },
    ],
  },
  later: {
    id: "later",
    text: (ctx) => {
      const print = ctx.p.choices[C.QUILL_PRINT] === "printed"
        ? "Your face is on the kerb. Nobody has asked whose it is. "
        : ctx.p.choices[C.QUILL_PRINT] === "kept" ? "Still no print of you. Nobody has asked for one either. " : "";
      return print + (has(ctx, F.WEATHER_NAMED)
        ? "You named it. Good. Now the threshold. I am not going under. Someone has to keep the lights on. Also I am not dead yet, which is a requirement."
        : "Still here. Still printing. Ord is up by the Annex gate with his numbers and Nara is on the funeral street with her earth. Between them you get the weather. I get the middle.");
    },
  },
  "board-hint": {
    id: "board-hint",
    text: "You went under. You have the eyes now. The listing board is by my old stall on the Grid. Read it. Then tell me it is not funny.",
  },
  "board-read": {
    id: "board-read",
    text: "Quill listed a Clearing. Forty Bestand. Copies travel. The hole does not. The people who say they are against the process are pricing it. I am not against anything. I just print faster. That is the difference and it is not in my favour.",
    wink: "The resistance is a stall with better lighting.",
  },
  "forge-lesson": {
    id: "forge-lesson",
    text: "Quill fans two hints. One was buried. One was printed. The printed one lists. The buried one opens. I can teach the difference. I can also sell the print. Pick. I will not think less of you either way. I will think exactly the same amount.",
    wink: "The hint can be forged. Exhibition Winke travel. Cult Winke stay in the hand that buried.",
    choices: [
      { id: "spot", label: "Teach me to spot the copy.", when: ctx => !has(ctx, F.FORGE), next: "forge-spot" },
      { id: "sell", label: "Sell me the print.", when: ctx => !has(ctx, F.FORGE), next: "forge-sell" },
      { id: "think", label: "Let me think." },
    ],
  },
  "forge-spot": {
    id: "forge-spot",
    text: "Look at the edge. A buried hint has dirt in the grain. A print has a margin. You keep the eye. The cult hint does not list. Copies will not open the hole. The tray is warm if you want to try your hand.",
    effects: [
      { kind: "choice", key: C.FORGE, value: "spot" },
      { kind: "flag", key: F.FORGE },
      { kind: "aura", delta: 1 },
      { kind: "readiness", delta: 2 },
      { kind: "notice", text: "You can spot a copy. The tray will show you.", tone: "ink" },
    ],
  },
  "forge-sell": {
    id: "forge-sell",
    text: "Sold. A copy of a hint. It lists. It decays. It will not open anything and it will look wonderful doing it. Aura thins when you hold a print of the sacred. Everybody does it once.",
    effects: [
      { kind: "choice", key: C.FORGE, value: "sell" },
      { kind: "flag", key: F.FORGE },
      { kind: "item", add: { id: "copy:wink", kind: "exhibition", name: "Printed hint", qty: 1, value: COPY_PRICE } },
      { kind: "fakeWinke", delta: 1 },
      { kind: "aura", delta: -1 },
      { kind: "notice", text: "A printed hint. Exhibition. It decays.", tone: "hot" },
    ],
  },
  "forge-after": {
    id: "forge-after",
    text: (ctx) => chose(ctx, C.FORGE, "spot")
      ? "You keep the eye. Every print on the Grid looks a little worse to you now. That is what learning costs. E at the tray crafts a copy anyway, if you want to know how it feels."
      : "You hold the print. It is thinning already. Q at the tray if you want to learn what you bought. E if you want another. I am not judging. I am counting.",
    wink: "A stall can be a shrine. She will not say it out loud on the Grid.",
  },
  repair: {
    id: "repair",
    text: "Cracked prints. Six Bestand a sheet at the clinic or at stall two. Cult objects were never cracked. That is the other thing about cult: it does not need me.",
  },
  street: {
    id: "street",
    text: "The wet street south of here is flagged. Opt in, spoils, seconds. Unbanked and copies. Cult and banked stay. Guests are not loot. If you go, bank first. I have watched a lot of confident people not bank first.",
  },
  ring: {
    id: "ring",
    text: "I am not standing in your hole. I am keeping the lights on over here where it is dry. Go. If a trace comes I want a print of it. If it does not, I want a print of that.",
  },
  after: {
    id: "after",
    text: (ctx) => {
      switch (outcome(ctx)) {
        case "appearance": return "A trace. I did not print it. Do not look at me like that. I did not print it. Somebody will and it will be worse than mine.";
        case "absence": return "Nothing came. I have a print of nothing if you want one. It is my best seller this season.";
        case "hijack": return "Somebody claimed the hour. Not me. I only claim margins. You are marked. Marks sell, by the way. I am telling you as a friend.";
        case "failed": return "Gestell ate the hole. The stall is fine. The stall is always fine. That is the horror of the stall.";
        default: return "Copies travel. You didn't. Good.";
      }
    },
  },
};

// ================================================================ ORD — ex-Safety

function ordRoute(ctx: Ctx): string {
  const { p } = ctx;
  if (p.movement >= 5 || has(ctx, F.PASSING)) return "after";
  if (p.party.ord === "gone") return "gone";
  if (!has(ctx, F.TALKED_ORD)) return "first";
  if (!has(ctx, F.UNDER)) return has(ctx, F.WEATHER_ORD) ? "later" : "weather";
  if (has(ctx, F.MAP) && has(ctx, F.PREPARE)) return "ring";
  if (has(ctx, F.MAP)) return "after-map";
  if (has(ctx, F.M3)) {
    return has(ctx, F.STRAIT) && has(ctx, F.FOUNDRY) && has(ctx, F.CABLE) ? "map" : "organs";
  }
  if (!has(ctx, F.HALL)) return "hall";
  if (!has(ctx, F.FREEZE)) return "freeze";
  if (!has(ctx, F.OPERATOR)) return "freeze-after";
  return "door";
}

/** Ord writes down where you would cut the process: the map is drawn, readiness moves, and the cold desk reads the entry. */
const mapEffects = (cut: "strait" | "foundry" | "cable" | "whole"): Effect[] => [
  { kind: "choice", key: C.MAP, value: cut },
  { kind: "flag", key: F.MAP },
  { kind: "readiness", delta: 2 },
  { kind: "notice", text: cut === "whole" ? "Ord's map, drawn whole. Three organs, one weather." : `Ord's map. You would cut it at the ${cut === "strait" ? "water" : cut === "foundry" ? "heat" : "light"}. The cold desk will post that organ first.`, tone: "sky" },
];

const honestNumber = (ctx: Ctx): string => {
  const g = Math.round(ctx.w.gestell);
  const tax = Math.floor(Math.max(0, Math.min(100, g)) / 4);
  return `Gestell ${g}. Tax ${tax} percent on every node. The number goes up because people extract. I will not pretty it.`;
};

/** After the weather, Ord opens the second ledger, once. */
const ordLedger = (ctx: Ctx): string | undefined => (ctx.p.choices[C.ORD_LEDGER] ? undefined : "ledger");

const ORD_NODES: Record<string, DialogueNode> = {
  dark: {
    id: "dark",
    text: "Ord does not look up from the ledger. A body with no aura is not a line he can write honest. Restore it at the Care shrine and he will count you.",
  },
  blind: {
    id: "blind",
    text: `${PARTY_BLIND} I do not need to see it. I need it to be true. Is it?`,
    effects: blindEffects("ord"),
    next: ordRoute,
  },
  first: {
    id: "first",
    text: "Ord. I was Safety. I signed freezes. I am here now so the number stays honest. Safety calls it stability. I call it the process. The number goes up because you extract. I will not pretty it.",
    wink: "He left Safety. He did not leave the ledger. Nobody leaves the ledger.",
    effects: [{ kind: "flag", key: F.TALKED_ORD }, { kind: "party", npc: "ord", state: "with" }],
    choices: [
      { id: "weather", label: "What do you call the weather?", next: "weather" },
      { id: "nodes", label: "The nodes. What are they?", next: "nodes" },
      { id: "leave", label: "Not now." },
    ],
  },
  weather: {
    id: "weather",
    text: "The process. Not stability. Stability is what you call a thing when you are paid by the thing. The process is what it is when you count it. It goes up. It does not care what you call it. Safety knows the number; it sends a runner down the west corridor every hour with the figure on a slip, so the funeral street can dig to schedule. The slip is honest. The runner is only fast. Nara will give you a third word. Hers is the one that hurts.",
    effects: [{ kind: "flag", key: F.WEATHER_ORD }],
    wink: "The number is honest. Honest is not the same as kind.",
    next: ordLedger,
  },
  ledger: {
    id: "ledger",
    text: "\"I keep a second ledger. Not Safety's. Honest lines only: who came in, what they did, what it cost. It has no column for stability.\" He turns it so you can see the pen. \"Give me a line, or stay off it. Both are honest. Only one is remembered.\"",
    wink: "The second ledger is the only book in the city that counts the dead as people.",
    choices: [
      { id: "enter", label: "Enter me.", next: "ledger-yes" },
      { id: "off", label: "Leave me off it.", next: "ledger-no" },
    ],
  },
  "ledger-yes": {
    id: "ledger-yes",
    text: (ctx) => `He writes without looking up. "${ctx.p.guest ? "Unsealed" : ctx.p.name}. Came in. ${ctx.p.choices[C.FIRST_NODE] === "extract" ? "Extracted at the first node." : "Kept the first node."}" He reads it back once. "That is the whole line. It will get longer. They always do."`,
    effects: [
      { kind: "choice", key: C.ORD_LEDGER, value: "entered" },
      { kind: "news", text: "A new line in Ord's ledger. Honest." },
      { kind: "notice", text: "Entered in the honest ledger.", tone: "ink" },
    ],
  },
  "ledger-no": {
    id: "ledger-no",
    text: "\"Off it.\" He closes the book. \"Then the number is one short and honest about that too. Safety's ledger has you anyway. It has everyone.\"",
    effects: [
      { kind: "choice", key: C.ORD_LEDGER, value: "off" },
      { kind: "notice", text: "Off the honest ledger. Safety's has you anyway.", tone: "ink" },
    ],
  },
  nodes: {
    id: "nodes",
    text: "Standing-reserve. A place that has been told what it is for. E extracts: Bestand in your hand, one point on the weather. Q keeps: nothing in your hand, readiness, the weather eases. Both are honest. Only one of them is paid.",
    next: "weather",
  },
  later: {
    id: "later",
    text: (ctx) => {
      const line = ctx.p.choices[C.ORD_LEDGER] === "entered"
        ? "Your line is in the book. It has not got longer yet. "
        : ctx.p.choices[C.ORD_LEDGER] === "off" ? "You are off the book. The number is one short. " : "";
      return line + (has(ctx, F.WEATHER_NAMED)
        ? "You named it. Whatever you called it, the number did not move. That is not a criticism. It is the number."
        : "Grief is not a ledger item. The process continues whether you keep the node or not. I am here so the number stays honest. Go and hear the other two names.");
    },
    choices: [
      { id: "pair", label: "The second node.", when: ctx => has(ctx, F.SECOND_NODE) && !has(ctx, F.ORD_PAIR), next: "pair" },
      { id: "number", label: "Give me the number.", next: "number" },
      { id: "leave", label: "That is enough." },
    ],
  },
  pair: {
    id: "pair",
    text: (ctx) => ctx.p.choices[C.SECOND_NODE] === "keep"
      ? "\"Two kept.\" He writes it. \"The number eased twice. On Safety's books that is a loss. On mine it is the only kind of line I like writing. Do not expect it to be paid.\""
      : ctx.p.choices[C.SECOND_NODE] === "extract"
        ? "\"Two extracted.\" He writes it. \"Up two. Honest. It will come back as earth, and I will write that down too, when it does.\""
        : "\"One and one.\" He writes it. \"Most people. The number does not care that you tried both. It counts both. So do I.\"",
    wink: "He counts the pair. Safety counts the extraction. Only one of them counts you.",
    effects: [{ kind: "flag", key: F.ORD_PAIR }],
  },
  number: {
    id: "number",
    text: honestNumber,
  },
  hall: {
    id: "hall",
    text: "You went under. Now read your hall. It will tell you the tax and it will not tell you who set it. The Houses own the nodes on paper. The weather owns them in fact. The tax is climate. Read it anyway. Numbers you have read are harder to lie to you.",
    choices: [
      { id: "number", label: "Give me the number.", next: "number" },
      { id: "leave", label: "I will read it." },
    ],
  },
  freeze: {
    id: "freeze",
    text: "The Annex has a desk. Sign a freeze and the Nave holds: no extraction, no yield, no weather for half an hour. It also starves the Passing. Refuse and the Nave stays a mouth. I signed a hundred of them. I will not tell you which was right. I will tell you both are honest.",
    wink: "Peace is a kind of weather. It does not come free and it does not come back.",
  },
  "freeze-after": {
    id: "freeze-after",
    text: (ctx) => chose(ctx, C.FREEZE, "signed")
      ? "You signed. The district holds. The hour does not. There is a woman in an office on the Grid who will offer you a private node next. She is not a demon. She is a number with a name. Read the listing board first."
      : "You refused. The Nave stays a mouth. The Passing stays possible. There is a woman in an office on the Grid who will offer you a private node next. Read the listing board first. Then decide what you are.",
  },
  door: {
    id: "door",
    text: (ctx) => chose(ctx, C.OPERATOR, "take")
      ? "You took it. Cold is a current, not a costume. The Organs door is open to you and the number knows why. I will be at the Strait."
      : "You refused. The door to the Organs opens through the garden in the Care. There is a hole there with your hands on it. Put it in the ground. I will be at the Strait after.",
  },
  organs: {
    id: "organs",
    text: "Walk the Strait, the Foundry and the Cable first. See what each one feeds. Then bring those three places back to me. I will draw it once. I will not draw it twice.",
    wink: "Three organs. One weather.",
  },
  map: {
    id: "map",
    text: "Strait, Foundry, Cable. Extract in the Strait and the Foundry lights. The Foundry lights and the Cable drinks. There is no country here. There is only the process. The node you turned on in the Nave in the first hour: it is a garden now. That is not a map. That is the same map. Ord turns it to you. If you could cut it once, where? I will write down what you say. The cold desk reads what I write.",
    wink: "Extraction here lights a factory there. You are the wire. He is asking where you would cut yourself.",
    choices: [
      { id: "strait", label: "At the water. Stop the Strait.", when: ctx => !has(ctx, F.MAP), next: "map-strait" },
      { id: "foundry", label: "At the heat. Darken the Foundry.", when: ctx => !has(ctx, F.MAP), next: "map-foundry" },
      { id: "cable", label: "At the light. Quiet the Cable.", when: ctx => !has(ctx, F.MAP), next: "map-cable" },
      { id: "whole", label: "Nowhere. Draw it whole.", when: ctx => !has(ctx, F.MAP), next: "map-whole" },
    ],
  },
  "map-strait": {
    id: "map-strait",
    text: "The water. He writes it. Stop the Strait and the Foundry goes hungry and the Cable goes dark on its own, a day later, honest. The Strait has a verb for that. I did not tell you to use it. Renn at the cold desk will post the Strait first now. That is what writing it down does.",
    wink: "Cutting at the source is the cleanest cut and the only one the city notices.",
    effects: mapEffects("strait"),
  },
  "map-foundry": {
    id: "map-foundry",
    text: "The heat. He writes it. Darken the Foundry and the Strait keeps paying into a room. The Cable drinks what was already lit. Cold is honest; it is not the last word. Renn will post the Foundry first. He has never posted a zero. You may be the reason he does.",
    wink: "Cutting in the middle leaves both ends running. It feels like a decision. It is a delay.",
    effects: mapEffects("foundry"),
  },
  "map-cable": {
    id: "map-cable",
    text: "The light. He writes it. Quiet the Cable and nothing upstream notices; the Strait pays, the Foundry burns, and the signal that told you so goes soft. Renn will post the Cable first. The Cable has no switch. It has a desk and a node you can choose not to extract.",
    wink: "Cutting at the end is what most people mean by resistance. The process does not mind.",
    effects: mapEffects("cable"),
  },
  "map-whole": {
    id: "map-whole",
    text: "Nowhere. He writes that too, and underlines it. The number is the whole column. Cut it anywhere and you have two columns and a lie between them. I drew it once. I will not draw it twice. Renn posts them in the order they are.",
    wink: "Refusing to cut is also a cut. It is the one that leaves your hands clean and the map honest.",
    effects: mapEffects("whole"),
  },
  "after-map": {
    id: "after-map",
    text: (ctx) => {
      const cut = ctx.p.choices[C.MAP];
      const said = cut === "strait" ? "You said the water. " : cut === "foundry" ? "You said the heat. " : cut === "cable" ? "You said the light. " : cut === "whole" ? "You said nowhere. " : "";
      if (worldHas(ctx, "foundryDark")) return `${said}The Foundry is dark. The Cable still drinks on what the Strait already paid. Nobody unlights a debt. The number is quieter. I will not pretty it.`;
      if (ctx.w.pois["organ-strait"]?.state === "refused") return `${said}You refused the water. I will stand at the Strait. The number is quieter. I will not pretty it.`;
      return `${said}The map is drawn. Quill has something for you on the Grid about hints and what they cost to copy. Then the Clearing. I will be there if the number lets me.`;
    },
    choices: [
      { id: "number", label: "Give me the number.", next: "number" },
      { id: "leave", label: "Enough." },
    ],
  },
  ring: {
    id: "ring",
    text: (ctx) => ctx.w.gestell >= 91
      ? "Gestell is maxed. I have to tell you: the hour will not open unless enough of you hold the ring. I cannot make that number smaller by wanting it. Nobody can."
      : "I am in the ring. I am counting. If the hour opens I will write it down honest. If it does not I will write that. Press F when the party is ready.",
    wink: "A solo cannot force the hour. He knows the arithmetic and hates it.",
  },
  gone: {
    id: "gone",
    text: "Ord is gone. He will not number a city that will not freeze. His desk is a chair and a ledger with the last honest line still wet.",
  },
  after: {
    id: "after",
    text: (ctx) => {
      switch (outcome(ctx)) {
        case "appearance": return "A trace. I wrote it down. One line. The number did not move and I wrote that too. Both are true. I have never had both be true before.";
        case "absence": return "Nothing came. I wrote that down. It is the most honest line in the ledger. You stood there for it. That is in the ledger too.";
        case "hijack": return chose(ctx, C.OPERATOR, "take")
          ? "Cold claimed the hour. You funded it. I am not blaming you. I am telling you the number. You are marked and the mark is accurate."
          : "Safety claimed the hour. The freeze ate the rite. I signed a hundred of those. This one had your name on it. The number is accurate.";
        case "failed": return "Gestell kept the weather. The hole did not open. I told you the arithmetic. Being right is not a comfort. I stopped expecting it to be.";
        default: return "The number is still honest. That is all I am for.";
      }
    },
  },
};

// ================================================================ VESPER HALE — concentrator

function vesperRoute(ctx: Ctx): string {
  if (!has(ctx, F.HALL)) return "cold";
  if (has(ctx, F.OPERATOR)) {
    if (chose(ctx, C.OPERATOR, "take")) return worldHas(ctx, "foundryDark") ? "foundry" : "taken";
    return ctx.p.movement >= 4 ? "nogod" : "refused";
  }
  return "offer";
}

const VESPER_NODES: Record<string, DialogueNode> = {
  dark: {
    id: "dark",
    text: "Vesper Hale does not price what the city cannot see. She does not look up. Come back with an aura on you and she will tell you what your hour is worth.",
  },
  blind: {
    id: "blind",
    text: `${PARTY_BLIND} I do not price what I cannot see. Sit down when you are back.`,
    effects: blindEffects("vesper"),
    next: vesperRoute,
  },
  cold: {
    id: "cold",
    text: "Vesper Hale will not quote a private node to someone who has not read who owns the public ones. Your hall is in the Care. Read the plaque. Then come back and I will tell you what your hour is worth.",
  },
  offer: {
    id: "offer",
    text: "Vesper Hale, Concentrator. A private node. Sixty Bestand, yours, now, no tax. Take it and the Third Movement opens the ugly way. Refuse and you stay mortal and walk to the Organs through a garden. I do not lie about the price. I only lie about whether it matters.",
    wink: "She is not a boss. She is a person who already priced your hour. The yield is honest. The door it buys is not.",
    choices: [
      { id: "take", label: "Take the private yield.", when: ctx => !has(ctx, F.OPERATOR), next: "take" },
      { id: "refuse", label: "Refuse it.", when: ctx => !has(ctx, F.OPERATOR), next: "refuse" },
      { id: "wait", label: "Not yet." },
    ],
  },
  take: {
    id: "take",
    text: "You took the private yield. Cold is a current, not a costume. The Organs door is paid for out of it; I keep the door's price back and open it. Nara Vale has stopped speaking to you; she will start again when you pay a funeral. I would not wait. Sextons keep accounts too.",
    effects: [
      { kind: "choice", key: C.OPERATOR, value: "take" },
      { kind: "bestand", delta: OPERATOR_YIELD, earner: "operator" },
      // The yield funds the door: the desk keeps the door's price back and opens it.
      { kind: "bestand", delta: -M3_DOOR_PRICE, sink: "door" },
      { kind: "current", value: "cold" },
      { kind: "flag", key: F.OPERATOR },
      { kind: "flag", key: F.M3 },
      { kind: "worldFlag", key: W.VESPER_GONE, value: 1 },
      { kind: "party", npc: "nara", state: "waiting" },
      { kind: "poi", id: "operator-desk", state: "closed" },
      { kind: "notice", text: `Private yield. ${OPERATOR_YIELD} Bestand, ${M3_DOOR_PRICE} of it to the Organs door. The door is open.`, tone: "hot" },
    ],
  },
  refuse: {
    id: "refuse",
    text: "You refused. Go back to the wreckage garden and bury what our work destroyed. Then take the Organs door. There is another way through. It is slower and it has your hands in it.",
    effects: [
      { kind: "choice", key: C.OPERATOR, value: "refuse" },
      { kind: "readiness", delta: READINESS_REFUSE },
      { kind: "flag", key: F.OPERATOR },
      { kind: "notice", text: "You refused the private yield. Readiness. The garden opens the door.", tone: "gold" },
    ],
  },
  taken: {
    id: "taken",
    text: "The yield is in your hand. The Foundry is lit on it. Read the Foundry plaque when you are in the Organs. I will not unlight a thing you have not seen.",
  },
  refused: {
    id: "refused",
    text: "You refused. The desk is still here. The offer is not. I do not quote twice. Go and bury your garden.",
  },
  foundry: {
    id: "foundry",
    text: "Somebody unlit the heat. The Cable still drinks on what the Strait paid. I am standing in the dark I sold. I will not quote another private node. That is not remorse. That is inventory.",
    wink: "Cold is honest. It is not the last word.",
  },
  nogod: {
    id: "nogod",
    text: "You are going to the Clearing. I will not quote a body that is not here. Private yield does not list absence. The desk stays empty of gods. It is the one thing I have never had for sale.",
    wink: "No god for sale. She checked the price once.",
  },
  after: {
    id: "after",
    text: "The hour passed or it did not. The desk is closed either way. I priced a lot of hours. I never priced that one.",
  },
};

// ================================================================ IONE KADE — last word

function ioneRoute(ctx: Ctx): string {
  const { p } = ctx;
  if (chose(ctx, C.MORTALITY, "lastword")) return "gone";
  if (has(ctx, F.MORTALITY)) return "other";
  if (p.movement >= 4) return "offer";
  if (p.movement === 3) return "watching";
  return "early";
}

const IONE_NODES: Record<string, DialogueNode> = {
  dark: {
    id: "dark",
    text: "The bench. She does not look up. There is nobody there for her to look at yet. The shrine in the Care restores an aura. Then sit.",
  },
  blind: {
    id: "blind",
    text: `${PARTY_BLIND} Keep looking. I will not be looking much longer.`,
    effects: blindEffects("ione"),
    next: ioneRoute,
  },
  early: {
    id: "early",
    text: "A woman on a bench at the edge of the garden. She is not waiting for anyone. Ione Kade. I sit here. It is a job if you do it long enough. Go and touch your shrine.",
    wink: "She is counting something. Not Bestand.",
  },
  watching: {
    id: "watching",
    text: "You have been to the Organs. You have the look. Everything feeds everything and none of it feeds anyone. I am not going to explain it. I am going to be here a little while longer and then I am not.",
  },
  offer: {
    id: "offer",
    text: "Ione Kade: I will not be in the next hour. Do not make a story of it. Stand in the hole. If you want a last word I have one. It is not for the city. It is for whoever is standing here when I say it.",
    wink: "The hour does not arrive as a body. It is a trace, or it is not. You cannot buy it.",
    choices: [
      { id: "say", label: "Say it.", when: ctx => !has(ctx, F.MORTALITY), next: "lastword" },
      { id: "wait", label: "Not yet." },
    ],
  },
  lastword: {
    id: "lastword",
    text: "She says it. It is short. It is not written down anywhere and it will not be. When you look up the bench is a bench. That was the last word.",
    effects: [
      { kind: "choice", key: C.MORTALITY, value: "lastword" },
      { kind: "flag", key: F.MORTALITY },
      { kind: "worldFlag", key: W.IONE_GONE, value: 1 },
      { kind: "readiness", delta: READINESS_WATCH },
      { kind: "notice", text: "A last word. Ione Kade is not here. Do not make a story of it.", tone: "ink" },
    ],
  },
  other: {
    id: "other",
    text: "You chose another act. Good. I stay a while longer then. Not for you. The bench is comfortable and the garden is quiet now that it is a grave.",
  },
  gone: {
    id: "gone",
    text: "Ione Kade is not here. That was the last word.",
  },
};

// ================================================================ roster

export const NPCS: Record<string, NpcDef> = {
  nara: {
    id: "nara",
    name: "Nara Vale",
    role: "Sexton",
    home: "home:nara",
    portrait: "nara.jpg",
    sprite: "nara",
    party: true,
    personal: (ctx: Ctx): NpcOverride => {
      const { p } = ctx;
      if (p.movement >= 5) return null;
      if (has(ctx, F.OPERATOR) && !has(ctx, F.GARDEN)) return { ...station("nara-garden"), state: "garden" };
      if (has(ctx, F.PREPARE) && p.party.nara !== "gone" && !has(ctx, F.PASSING)) return { ...station("nara-clearing"), state: "clearing" };
      if (has(ctx, F.UNDER) && !has(ctx, F.OPERATOR) && p.party.nara !== "waiting") return { ...station("nara-care"), state: "care" };
      return null;
    },
    entry: (ctx: Ctx) => (dark(ctx) ? "dark" : unseenWink(ctx, "nara") ? "blind" : naraRoute(ctx)),
    nodes: NARA_NODES,
  },
  quill: {
    id: "quill",
    name: "Quill",
    role: "Forger",
    home: "home:quill",
    portrait: "quill.jpg",
    sprite: "quill",
    party: true,
    personal: (ctx: Ctx): NpcOverride => {
      if (has(ctx, F.UNDER)) return { ...station("quill-forge"), state: "forge" };
      return null;
    },
    entry: (ctx: Ctx) => (dark(ctx) ? "dark" : unseenWink(ctx, "quill") ? "blind" : quillRoute(ctx)),
    nodes: QUILL_NODES,
  },
  ord: {
    id: "ord",
    name: "Ord",
    role: "Ex-Safety",
    home: "home:ord",
    portrait: "ord.jpg",
    sprite: "ord",
    party: true,
    personal: (ctx: Ctx): NpcOverride => {
      const { p } = ctx;
      if (p.party.ord === "gone") return { present: false, state: "gone" };
      if (has(ctx, F.PREPARE) && has(ctx, F.MAP) && !has(ctx, F.PASSING)) return { ...station("ord-clearing"), state: "clearing" };
      if ((p.movement >= 3 || has(ctx, F.M3)) && !has(ctx, F.MAP)) return { ...station("ord-strait"), state: "strait" };
      return null;
    },
    entry: (ctx: Ctx) => (dark(ctx) ? "dark" : unseenWink(ctx, "ord") ? "blind" : ordRoute(ctx)),
    nodes: ORD_NODES,
  },
  vesper: {
    id: "vesper",
    name: "Vesper Hale",
    role: "Concentrator",
    home: "home:vesper",
    portrait: "vesper.jpg",
    sprite: "vesper",
    party: false,
    personal: (ctx: Ctx): NpcOverride => {
      if (has(ctx, F.OPERATOR) && worldHas(ctx, W.VESPER_GONE)) return { present: false, state: "gone" };
      return null;
    },
    entry: (ctx: Ctx) => (dark(ctx) ? "dark" : unseenWink(ctx, "vesper") ? "blind" : vesperRoute(ctx)),
    nodes: VESPER_NODES,
  },
  ione: {
    id: "ione",
    name: "Ione Kade",
    role: "Last word",
    home: "home:ione",
    portrait: "ione.jpg",
    sprite: "ione",
    party: false,
    personal: (ctx: Ctx): NpcOverride => {
      if (chose(ctx, C.MORTALITY, "lastword")) return { present: false, state: "gone" };
      return null;
    },
    entry: (ctx: Ctx) => (dark(ctx) ? "dark" : unseenWink(ctx, "ione") ? "blind" : ioneRoute(ctx)),
    nodes: IONE_NODES,
  },
};
