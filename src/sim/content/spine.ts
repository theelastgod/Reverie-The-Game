/**
 * The four movements as quests. Each step: a title, a detail with the key to
 * press, a target the marker can point at, a plate for the journal, a done
 * predicate, and the effects of completing it. The engine advances steps;
 * content never touches state.
 */
import type { Ctx, Effect, Quest, QuestStep } from "../types";
import { GUEST_SPAWN } from "../map";
import { C, F, Q, W } from "./ids";
import { LAST_SEASON_WINK } from "./pois";

const has = (ctx: Ctx, key: string): boolean => (ctx.p.flags[key] ?? 0) > 0;
const chose = (ctx: Ctx, key: string, value: string): boolean => ctx.p.choices[key] === value;
const poiState = (ctx: Ctx, id: string): string => ctx.w.pois[id]?.state ?? "";

const ARRIVE_RADIUS = 96;
const farFromSpawn = (ctx: Ctx): boolean => Math.hypot(ctx.p.x - GUEST_SPAWN.x, ctx.p.y - GUEST_SPAWN.y) > ARRIVE_RADIUS;

/** A prior hour of this serial stands in the Care when its written-back log put one there. */
const hasHistoryMark = (ctx: Ctx): boolean => ctx.p.serial !== null && ctx.w.history.some(m => m.serial === ctx.p.serial);

/** Ruin-sight, the Storm and the House of Sky see last season's hole itself; the rest read it off the glass. */
const seesFailed = (ctx: Ctx): boolean => !ctx.p.guest && (ctx.p.messenger === "ruin" || ctx.p.stance === "storm" || ctx.p.house === "sky");
const HOLE_REACH = 64;
const failedMarkNear = (ctx: Ctx): boolean => ctx.w.failed.some(f => Math.hypot(f.x - ctx.p.x, f.y - ctx.p.y) <= HOLE_REACH);
const nearestFailedMark = (ctx: Ctx): string | undefined => {
  let best: string | undefined;
  let bestD = Infinity;
  for (const f of ctx.w.failed) {
    const d = Math.hypot(f.x - ctx.p.x, f.y - ctx.p.y);
    if (d < bestD) { bestD = d; best = f.id; }
  }
  return best;
};

const notice = (text: string, tone: "ink" | "gold" | "hot" | "acid" | "sky" = "ink"): Effect => ({ kind: "notice", text, tone });

// ---------------------------------------------------------------- Movement I — Diagnosis

const M1_STEPS: QuestStep[] = [
  {
    id: "arrive",
    title: "The first threshold",
    detail: "You arrived unsealed in the Nave of Tubes. The city is already over. WASD moves. Walk.",
    target: "enemy:intake-clerk",
    plate: "plate-arena.jpg",
    done: farFromSpawn,
    onComplete: [{ kind: "flag", key: F.ARRIVED }, notice("The Nave of Tubes. Extraction is civic duty, the plaque says.")],
  },
  {
    id: "intake",
    title: "Your name in the ledger",
    detail: "The Intake Clerk bars the southern aisle. Click or Space strikes. Shift and a direction steps through the red warning. R interrupts it.",
    target: "enemy:intake-clerk",
    plate: "plate-arena.jpg",
    done: ctx => has(ctx, F.INTAKE),
    onComplete: [notice("The Intake Clerk falls. They were doing a job.")],
  },
  {
    id: "first-node",
    title: "Leave something unspent",
    detail: "A yield node hums in the aisle. E extracts it: Bestand in your hand, the weather up one. Q keeps it: nothing in your hand, Readiness.",
    target: "nave-node-1",
    plate: "plate-arena.jpg",
    done: ctx => ctx.p.extracted + ctx.p.kept >= 1,
    onComplete: ctx => [
      { kind: "choice", key: C.FIRST_NODE, value: ctx.p.extracted > 0 ? "extract" : "keep" },
      { kind: "flag", key: F.FIRST_NODE },
      notice(ctx.p.extracted > 0 ? "You extracted. The number went up. It will come back as earth." : "You kept it. Readiness. The number eased.", ctx.p.extracted > 0 ? "hot" : "gold"),
    ],
  },
  {
    id: "desk-three",
    title: "The second clerk",
    detail: "Desk Three counts the aisle between the first node and the east gate. It winds up slower than the Intake Clerk. Wait for the red, step through it with Shift, and answer with R while it recovers.",
    target: "enemy:desk-three",
    plate: "plate-arena.jpg",
    done: ctx => has(ctx, F.DESK_THREE),
    onComplete: [notice("Desk Three falls. The aisle is quiet. It will be staffed again.")],
  },
  {
    id: "second-node",
    title: "The same question twice",
    detail: "A second node hums south of Desk Three; two more sit further along the aisle. E extracts, Q keeps. The city reads the pair, not the choice.",
    target: "nave-node-2",
    plate: "plate-arena.jpg",
    done: ctx => ctx.p.extracted + ctx.p.kept >= 2,
    onComplete: ctx => {
      const pair = ctx.p.extracted >= 1 && ctx.p.kept >= 1 ? "split" : ctx.p.extracted >= 2 ? "extract" : "keep";
      return [
        { kind: "choice", key: C.SECOND_NODE, value: pair },
        { kind: "flag", key: F.SECOND_NODE },
        notice(
          pair === "split" ? "One kept, one extracted. The number went up and eased. That is most people."
            : pair === "extract" ? "Two extracted. Bestand twice. The weather is up two and it will come back as earth."
            : "Two kept. Readiness twice. Nothing in your hand and the number eased twice.",
          pair === "keep" ? "gold" : pair === "extract" ? "hot" : "ink",
        ),
      ];
    },
  },
  {
    id: "quill",
    title: "A copy of a hole",
    detail: "Quill keeps a stall by the east gate. F speaks. She will explain the market without meaning to.",
    target: "home:quill",
    plate: "plate-forge.jpg",
    done: ctx => has(ctx, F.TALKED_QUILL),
    onComplete: [notice("Copies travel. Aura doesn't.")],
  },
  {
    id: "ord",
    title: "Ask who owns the numbers",
    detail: "Ord stands by the Annex gate at the north of the Nave. F speaks. He was Safety. He will not pretty it.",
    target: "home:ord",
    plate: "safety-annex.jpg",
    done: ctx => has(ctx, F.TALKED_ORD),
    onComplete: [notice("The number goes up because you extract.")],
  },
  {
    id: "nara",
    title: "A name for the dead",
    detail: "Nara Vale holds a grave open on the funeral street, south-west. F speaks.",
    target: "home:nara",
    plate: "plate-burial.jpg",
    done: ctx => has(ctx, F.TALKED_NARA),
    onComplete: [notice("The sexton. She puts things in the ground.")],
  },
  {
    id: "memorial",
    title: "A voice or a vessel",
    detail: "At the recorder east of Nara: F listens first. Then E dismantles it for coffin bindings, or Q preserves the voice and Nara supplies cloth. Neither choice pays Bestand.",
    target: "memorial-recorder",
    plate: "memorial-recorder-v1.jpg",
    done: ctx => has(ctx, F.MEMORIAL),
    onComplete: ctx => [notice(chose(ctx, C.MEMORIAL, "voice") ? "The voice has another night." : "The copper closes the coffin.")],
  },
  {
    id: "burial",
    title: "What survives you",
    detail: ctx => (chose(ctx, C.MEMORIAL, "voice")
      ? "Return to the burial plot west of Nara. The cloth is ready and the voice is still playing. Press F to close the earth."
      : "Carry the copper bindings to the burial plot west of Nara. Press F to close the earth."),
    target: "nara-plot",
    plate: "plate-burial.jpg",
    done: ctx => has(ctx, F.BURIED_NARA),
    onComplete: [notice("Buried. Readiness. The city stops counting that body.", "gold")],
  },
  {
    id: "weather-safety",
    title: "The official weather",
    detail: "Read the Office of Safety plaque by the Annex gate with F. Someone has called this stability.",
    target: "safety-plaque",
    plate: "safety-annex.jpg",
    done: ctx => has(ctx, F.WEATHER_SAFETY),
  },
  {
    id: "weather-ord",
    title: "The process",
    detail: "Return to Ord by the Annex gate. F. Ask him what he calls the weather.",
    target: "home:ord",
    plate: "safety-annex.jpg",
    done: ctx => has(ctx, F.WEATHER_ORD),
  },
  {
    id: "weather-nara",
    title: "The end of world as world",
    detail: "Return to Nara on the funeral street. F. You have heard the numbers; listen to what they leave out.",
    target: "home:nara",
    plate: "plate-burial.jpg",
    done: ctx => has(ctx, F.WEATHER_NARA),
  },
  {
    id: "name",
    title: "Name the weather",
    detail: "At the Office of Safety plaque: F names it stability. E names it the process. Q names it the end of world as world. The plaque will not change. You will. The Annex Runner carries the hour's real figure down the west corridor on a slip; taken off the Runner, it reads at the plaque.",
    target: "safety-plaque",
    plate: "safety-annex.jpg",
    done: ctx => has(ctx, F.WEATHER_NAMED),
    onComplete: ctx => [
      { kind: "readiness", delta: chose(ctx, C.WEATHER, "stability") ? 0 : 2 },
      { kind: "news", text: "An arrival named the weather in the Nave." },
    ],
  },
  {
    id: "going-under",
    title: "The going-under",
    detail: ctx => (ctx.p.guest
      ? "The threshold is east of the burial plot. Press F. A guest stops here; an Angel goes under as death."
      : "The threshold is east of the burial plot. Press F. You go under as death, not as a cutscene, and wake in the Care."),
    target: "going-under",
    plate: "plate-under.jpg",
    done: ctx => poiState(ctx, "going-under") === "open" && (ctx.p.locked || has(ctx, F.UNDER)),
    onComplete: ctx => (ctx.p.guest
      ? [notice("Movement I is complete. Link an Angel to go under, or remain in the Nave.", "gold")]
      : [notice("You went under. The Care is open.", "gold"), { kind: "news", text: "An Angel went under in the Nave." }]),
  },
];

// ---------------------------------------------------------------- Movement II — Techno-Feudal

const M2_STEPS: QuestStep[] = [
  {
    id: "shrine",
    title: "The price of shelter",
    detail: "Touch the Care shrine with F. The city learns where to put you back. E restores aura for Bestand.",
    target: "care-shrine",
    plate: "plate-care.jpg",
    done: ctx => has(ctx, F.SHRINE),
    onComplete: [notice("The Care does not keep you. It only lets you be mortal in a warehouse.")],
  },
  {
    id: "sexton",
    title: "Counted here",
    detail: "Pim Ashe digs beside the shrine. F speaks. The Care has a book too; ask him what he counts in it.",
    target: "home:sexton",
    plate: "plate-burial.jpg",
    done: ctx => has(ctx, F.TALKED_SEXTON),
    onComplete: [notice("The Care keeps a ledger. It is shorter than Safety's and it gets shorter when someone does their job.")],
  },
  {
    id: "hall",
    title: "Who owns the nodes",
    detail: ctx => `Read your House hall plaque with F. ${ctx.p.house === "mortals" ? "The House of Mortals hall is in the Care, west of the garden." : ctx.p.house === "sky" ? "The House of Sky hall is on the Kerb of Hours." : ctx.p.house === "divinities" ? "The House of Divinities hall is on the Gold Ring." : ctx.p.house === "earth" ? "The House of Earth hall is in the Organs; the door opens in Movement III, so tithe later." : "Your hall is where your House stands."} The city has owners even here.`,
    target: ctx => (ctx.p.house === "earth" ? "tax-window" : ctx.p.house ? `hall-${ctx.p.house}` : "hall-mortals"),
    plate: "house-hall.jpg",
    // Earth's hall is behind the Organs door; an Earth Angel reads it later and the step lets them through on the shrine.
    done: ctx => has(ctx, F.HALL) || (ctx.p.house === "earth" && has(ctx, F.SHRINE)),
    onComplete: ctx => (has(ctx, F.HALL)
      ? [notice("The tax is climate. It will never make you hit harder.")]
      : [{ kind: "flag", key: F.HALL }, notice("House of Earth. Your hall is in the Organs. The tax is read from the window for now.")]),
  },
  {
    id: "officer",
    title: "The other honest answer",
    detail: "Corvin Slate, Officer of Safety, stands in the Annex corridor between the gate and the desk. F. He will say what a freeze buys before the desk sells you one. Tell him what you want the weather to be.",
    target: "home:officer",
    plate: "safety-annex.jpg",
    done: ctx => has(ctx, F.TALKED_OFFICER),
    onComplete: ctx => [notice(chose(ctx, C.ANNEX, "held") ? "You told Safety you want it held. The desk will have the form ready." : "You told Safety hungry is honest. The desk keeps refusals too.", "ink")],
  },
  {
    id: "freeze",
    title: "Peace is a kind of weather",
    detail: "The freeze desk is in the Safety Annex, north of the Nave. F signs a freeze: the Nave holds, the Passing goes hungry. Q refuses.",
    target: "safety-desk",
    plate: "safety-annex.jpg",
    done: ctx => has(ctx, F.FREEZE),
    onComplete: ctx => [notice(chose(ctx, C.FREEZE, "signed") ? "You bought time. You spent an hour." : "The Nave stays a mouth. The Passing stays possible.", chose(ctx, C.FREEZE, "signed") ? "sky" : "gold")],
  },
  {
    id: "tithe",
    title: "The rate is the weather",
    detail: "The tax window is west of the corridor, past the cubicles. F reads the rate. E pays this hour's tithe now, into your House's standing before the weather takes it. Q lets it ride.",
    target: "tax-window",
    plate: "safety-annex.jpg",
    done: ctx => has(ctx, F.TITHE),
    onComplete: ctx => [notice(chose(ctx, C.TITHE, "paid") ? "Paid before it was taken. Your House stands a little higher." : "You let it ride. The weather will take its share at the node.", chose(ctx, C.TITHE, "paid") ? "sky" : "ink")],
  },
  {
    id: "history",
    title: "A prior hour",
    detail: ctx => (hasHistoryMark(ctx)
      ? "Wreckage only you can see stands in the Care. Q at the Care shrine faces it."
      : "The serial has no prior hour written yet. The Care shrine keeps the place for one. Walk on."),
    target: ctx => (hasHistoryMark(ctx) ? "history:mark" : "care-shrine"),
    plate: "serial-wreckage.jpg",
    // A serial whose log has nothing written back has no wreckage to face; the beat is theirs the next time they link.
    done: ctx => has(ctx, F.HISTORY) || !hasHistoryMark(ctx),
    onComplete: ctx => (hasHistoryMark(ctx) ? [notice("The serial remembers. The city does not.", "sky")] : []),
  },
  {
    id: "board",
    title: "The sky is already priced",
    detail: "The listing board is on the Wet Grid by Quill's forge tray. Read it with F.",
    target: "listing-board",
    plate: "clearing-stall.jpg",
    done: ctx => has(ctx, F.BOARD),
    onComplete: [notice("The resistance is pricing Clearings.", "hot")],
  },
  {
    id: "operator",
    title: "The private hour",
    detail: "Vesper Hale keeps an office at the south-east of the Wet Grid. F hears the offer. E takes the private yield. Q refuses it.",
    target: "operator-desk",
    plate: "plate-operator.jpg",
    done: ctx => has(ctx, F.OPERATOR),
    onComplete: ctx => [
      notice(chose(ctx, C.OPERATOR, "take") ? "Cold is a current, not a costume. The door is funded." : "You refused. The garden opens the door.", chose(ctx, C.OPERATOR, "take") ? "hot" : "gold"),
      { kind: "news", text: chose(ctx, C.OPERATOR, "take") ? "An Angel took the private yield." : "An Angel refused the private yield." },
    ],
  },
  {
    id: "door",
    title: "The city has organs",
    detail: ctx => (chose(ctx, C.OPERATOR, "take")
      ? "The Organs door is east of the Wet Grid. Walk through it."
      : "Bury the wreckage garden in the Care with F. Nara will speak. Then the Organs door east of the Wet Grid opens."),
    target: ctx => (chose(ctx, C.OPERATOR, "take") ? "gate-wet-organs" : "wreckage-garden"),
    plate: "plate-m3.jpg",
    done: ctx => has(ctx, F.M3),
    onComplete: [notice("The Third Movement is organs, not nations.", "sky")],
  },
];

// ---------------------------------------------------------------- Movement III — Geopolitics

const M3_STEPS: QuestStep[] = [
  {
    id: "strait",
    title: "Where the city feeds",
    detail: "Through the Organs door, west: the Strait. Press F to study the waterway that feeds the Foundry. E refuses the feed.",
    target: "organ-strait",
    plate: "organ-strait.jpg",
    done: ctx => has(ctx, F.STRAIT),
  },
  {
    id: "foundry",
    title: "What the heat consumes",
    detail: "North-centre of the Organs: the Foundry. Press F to trace the heat into the Cable. Q darkens it.",
    target: "organ-foundry",
    plate: "organ-foundry-dark.jpg",
    done: ctx => has(ctx, F.FOUNDRY),
  },
  {
    id: "cable",
    title: "Who pays for the light",
    detail: "East of the Organs: the Cable. Press F to see what keeps its signal alive.",
    target: "organ-cable",
    plate: "organ-cable-dark.jpg",
    done: ctx => has(ctx, F.CABLE),
  },
  {
    id: "map",
    title: "Three organs, one weather",
    detail: "Return to Ord at the Strait. Press F to put the three places together, and tell him where you would cut it: the water, the heat, the light, or nowhere. The cold desk posts that organ first.",
    target: "station:ord-strait",
    plate: "plate-m3.jpg",
    done: ctx => has(ctx, F.MAP),
    onComplete: [notice("Extraction here lights a factory there.", "sky")],
  },
  {
    id: "garden",
    title: "What the work destroyed",
    detail: "The node you turned on in the first hour is the wreckage garden in the Care. F buries it. Nara will not speak until it is in the ground.",
    target: "wreckage-garden",
    plate: "wreckage-garden.jpg",
    done: ctx => has(ctx, F.GARDEN) || chose(ctx, C.MORTALITY, "watch"),
    onComplete: [notice("It is in the earth. She will not forgive the factory.", "gold")],
  },
  {
    id: "bell",
    title: "One strike, on the way",
    detail: "The hour bell stands north of the Kerb's terraces, through the gap in the low wall. Press F to strike it once before the glass. The omen-reader hears it; the House of Sky's hour opens on it.",
    target: "hour-bell",
    plate: "clearing-ring.jpg",
    done: ctx => has(ctx, F.BELL),
    onComplete: [notice("The note went over the Kerb. The glass is east of the bell.", "sky")],
  },
  {
    id: "failed",
    title: "Last season",
    detail: ctx => (seesFailed(ctx) && ctx.w.failed.length > 0
      ? "You can see the hole itself: last season's Passing failed there. Stand at it. The forecast glass on the Kerb shows it too; press F there."
      : "On the Kerb of Hours, the forecast glass. Press F to face last season's Passing. Ruin-sight, the Storm and the House of Sky would show you the hole itself."),
    target: ctx => (seesFailed(ctx) && nearestFailedMark(ctx)) || "forecast-glass",
    plate: "failed-passing.jpg",
    // The glass for everyone; the hole itself for those who can see it, by standing at it.
    done: ctx => has(ctx, F.FAILED) || (seesFailed(ctx) && failedMarkNear(ctx)),
    onComplete: ctx => (has(ctx, F.FAILED)
      ? [notice("Last season's Passing failed. The city kept the weather.", "sky")]
      : [
          { kind: "flag", key: F.FAILED },
          { kind: "wink", text: LAST_SEASON_WINK },
          { kind: "readiness", delta: 2 },
          notice("Last season's Passing failed here. The hour went by. You did not loot it.", "sky"),
        ]),
  },
  {
    id: "forge",
    title: "The hint can be forged",
    detail: "Quill is at the forge tray on the Wet Grid. F speaks. She will teach you to spot copies, or sell you one.",
    target: "station:quill-forge",
    plate: "plate-forge.jpg",
    done: ctx => has(ctx, F.FORGE),
    onComplete: ctx => [notice(chose(ctx, C.FORGE, "spot") ? "You keep the eye. Copies will not open the hole." : "A print of a hint. It lists. It decays.", chose(ctx, C.FORGE, "spot") ? "gold" : "hot")],
  },
];

// ---------------------------------------------------------------- Movement IV — The Turn

const M4_STEPS: QuestStep[] = [
  {
    id: "mortality",
    title: "The act",
    detail: "A mortality act before the ring takes anyone. Q at the buried garden keeps watch. Nara offers a burial. Ione Kade in the Care has a last word; she will not return. F speaks.",
    target: ctx => (chose(ctx, C.MORTALITY, "lastword") || (ctx.w.flags[W.IONE_GONE] ?? 0) > 0 ? "wreckage-garden" : "home:ione"),
    plate: "plate-ione.jpg",
    done: ctx => has(ctx, F.MORTALITY),
    onComplete: ctx => [notice(chose(ctx, C.MORTALITY, "lastword") ? "That was the last word. Do not make a story of it." : chose(ctx, C.MORTALITY, "burial") ? "You stood at the grave. It counts." : "You kept watch. It counts.", "gold")],
  },
  {
    id: "prepare",
    title: "Keep the hole",
    detail: "The Clearing is south of the Wet Grid. With the party still willing, press F at the ring to prepare the ground. E keeps it. Q extracts it.",
    target: "clearing-ring",
    plate: "clearing-ring.jpg",
    done: ctx => has(ctx, F.PREPARE),
    onComplete: [notice("The hole is kept. The Passing is not yet the weather.", "gold"), { kind: "news", text: "A Clearing was prepared." }],
  },
  {
    id: "passing",
    title: "The Passing",
    detail: ctx => (ctx.w.gestell >= 91
      ? "Gestell is maxed. The hour will not open unless enough Angels hold the ring. Press F at the ring for the Passing when they do."
      : "Press F at the ring for the Passing. Appearance, absence, hijack, or failed: all of them are written."),
    target: "clearing-ring",
    plate: "clearing-ring.jpg",
    done: ctx => has(ctx, F.PASSING),
    onComplete: ctx => {
      const o = ctx.p.choices[C.PASSING] ?? "";
      const line = o === "appearance" ? "A trace, not a face. The city is briefly world again."
        : o === "absence" ? "The hour went by. Absence is honest. Nara Vale stays."
        : o === "hijack" ? "The hour was claimed. You are marked. The world continues."
        : "Gestell kept the weather. No hole. No stipend.";
      return [notice(line, o === "appearance" ? "gold" : o === "hijack" ? "hot" : "sky")];
    },
  },
  {
    id: "credits",
    title: "The rest is the city",
    detail: "The Passing resolved. The credits name only the game. Then the city.",
    target: "clearing-ring",
    plate: "wing-star.png",
    done: () => true,
    onComplete: [
      { kind: "flag", key: F.CREDITS },
      { kind: "movement", value: 5 },
      notice("REVERIE: THE GAME. The rest is the city.", "gold"),
    ],
  },
];

// ---------------------------------------------------------------- the spine

export const SPINE: Quest[] = [
  {
    id: Q.M1,
    title: "Diagnosis",
    kind: "spine",
    movement: 1,
    district: "nave",
    guestLegal: true,
    available: () => true,
    steps: M1_STEPS,
    onStart: [notice("Movement I. Diagnosis.", "ink")],
    onFinish: ctx => (ctx.p.guest ? [] : [{ kind: "movement", value: 2 }, notice("Movement II. Techno-Feudal.", "ink")]),
    changes: "spine",
  },
  {
    id: Q.M2,
    title: "Techno-Feudal",
    kind: "spine",
    movement: 2,
    district: "care",
    guestLegal: false,
    available: ctx => !ctx.p.guest && ctx.p.movement >= 2,
    steps: M2_STEPS,
    onFinish: [{ kind: "movement", value: 3 }, notice("Movement III. Geopolitics.", "ink")],
    changes: "spine",
  },
  {
    id: Q.M3,
    title: "Geopolitics",
    kind: "spine",
    movement: 3,
    district: "organs",
    guestLegal: false,
    available: ctx => !ctx.p.guest && ctx.p.movement >= 3,
    steps: M3_STEPS,
    onFinish: [{ kind: "movement", value: 4 }, notice("Movement IV. The Turn.", "ink")],
    changes: "spine",
  },
  {
    id: Q.M4,
    title: "The Turn",
    kind: "spine",
    movement: 4,
    district: "clearing",
    guestLegal: false,
    available: ctx => !ctx.p.guest && ctx.p.movement >= 4,
    steps: M4_STEPS,
    onFinish: [{ kind: "news", text: "An Angel reached the credits. The city continues." }],
    changes: "spine",
  },
];
