/**
 * Side quests. Thirty-three named hours across the eight districts. Every one
 * of them changes the city: a POI takes a new state, a person changes their
 * schedule, a cult object enters a hand, a House stands taller or shorter.
 * Nothing here is a fetch. Predicates read flags, choices, counters and POI
 * states that the side content itself sets; the world change is applied by
 * the quest's own effects, never by the verb that reports it.
 *
 * Keys are stable once shipped. Add, never rename.
 */
import { POSITIONS, TILE } from "../map";
import { C, F, W } from "./ids";
import type { Ctx, DistrictId, Effect, Fourfold, Item, Player, Quest, QuestStep, Vec, WorldState } from "../types";

// ---------------------------------------------------------------- ids

/** Side quest ids: "side-<district>-<slug>". */
export const SQ = {
  THIRD_ALTAR: "side-nave-third-altar",
  UNSPENT: "side-nave-unspent",
  ANOTHER_NIGHT: "side-nave-another-night",
  DOING_A_JOB: "side-nave-doing-a-job",
  VAN: "side-wet-armored-van",
  COPY: "side-wet-copy-of-a-hole",
  LISTING_FEE: "side-wet-listing-fee",
  TRAY: "side-wet-tray-warm",
  DESK: "side-wet-desk-closed",
  LEDGER: "side-care-unnamed-ledger",
  TWELVE: "side-care-number-twelve",
  STANDING: "side-care-standing",
  LAMP: "side-care-lamp",
  FORM9: "side-annex-form-nine",
  HONEST: "side-annex-other-honest-answer",
  TAX: "side-annex-tax-is-climate",
  NOTICE: "side-annex-notice-for-the-bell",
  CENSUS: "side-annex-bell-census",
  HOUR: "side-kerb-hour-that-does-not-strike",
  FRONT: "side-kerb-storm-front",
  HOURS: "side-kerb-hours-for-sale",
  SKY_GLASS: "side-kerb-omen-glass",
  MUTE: "side-ring-mute-bell",
  UPKEEP: "side-ring-cult-upkeep",
  VAULT: "side-ring-what-the-vault-keeps",
  STEP: "side-ring-sweeping-is-not-keeping",
  TOLL: "side-organs-strait-toll",
  CABLE: "side-organs-cable-quiet",
  FOUNDRY: "side-organs-foundry-dark",
  COLUMN: "side-organs-second-column",
  SEED: "side-clearing-seed",
  CONTEST: "side-clearing-contest",
  SEASON: "side-clearing-last-season",
} as const;

/** A quest handed out by a person or a verb carries this personal flag; `available` reads it. */
export const offerKey = (questId: string): string => `side:offer:${questId}`;

/** Personal flags and counters the side content sets (Player.flags). */
export const SF = {
  // the secondary cast
  OFFICER_MET: "side:officer:met",
  OFFICER_VISITS: "side:officer:visits",
  OMEN_MET: "side:omen:met",
  OMEN_VISITS: "side:omen:visits",
  KEEPER_MET: "side:keeper:met",
  KEEPER_VISITS: "side:keeper:visits",
  SEXTON_MET: "side:sexton:met",
  SEXTON_VISITS: "side:sexton:visits",
  DESK_MET: "side:desk:met",
  DESK_VISITS: "side:desk:visits",
  // nave
  ALTAR_COUNTED: "side:altar:counted",
  ALTAR_LIT: "side:altar:lit",
  UNSPENT_BASE: "side:unspent:base",
  UNSPENT_TOUCHED: "side:unspent:touched",
  NIGHT_SAT: "side:night:sat",
  NIGHT_HEARD: "side:night:heard",
  JOB_BASE: "side:job:base",
  JOB_NAMES: "side:job:names",
  // wet
  VAN_ASKED: "side:van:asked",
  VAN_WAVED: "side:van:waved",
  COPY_READ: "side:copy:read",
  COPY_DOWN: "side:copy:down",
  FEE_1: "side:fee:stall-1",
  FEE_2: "side:fee:stall-2",
  FEE_3: "side:fee:stall-3",
  FEE_4: "side:fee:stall-4",
  TRAY_BANKED: "side:tray:banked",
  TRAY_TAKEN: "side:tray:taken",
  DESK_READ: "side:desk:read",
  DESK_CLOSED: "side:desk:closed",
  // care
  LEDGER_BASE: "side:ledger:base",
  LEDGER_REPORTED: "side:ledger:reported",
  TWELVE_PLATE: "side:twelve:plate",
  TWELVE_BURIED: "side:twelve:buried",
  TWELVE_NAMED: "side:twelve:named",
  STANDING_FUNERAL: "side:standing:funeral",
  STANDING_ENTERED: "side:standing:entered",
  LAMP_LIT: "side:lamp:lit",
  LAMP_TOLD: "side:lamp:told",
  // annex
  FORM9_ASKED: "side:form9:asked",
  FORM9_FILED: "side:form9:filed",
  HONEST_FOUND: "side:honest:found",
  HONEST_TOLD: "side:honest:told",
  TAX_READ: "side:tax:read",
  TAX_PAID: "side:tax:paid",
  NOTICE_REFUSED: "side:notice:refused",
  NOTICE_REPORTED: "side:notice:reported",
  CENSUS_FIRST: "side:census:first",
  CENSUS_LAST: "side:census:last",
  CENSUS_REPORTED: "side:census:reported",
  // kerb
  HOUR_WAITED: "side:hour:waited", // counter
  HOUR_TOLD: "side:hour:told",
  FRONT_READ: "side:front:read",
  FRONT_TOLD: "side:front:told",
  HOURS_BOUGHT: "side:hours:bought",
  HOURS_WAITED: "side:hours:waited",
  HOURS_CONFRONTED: "side:hours:confronted",
  GLASS_TAKEN: "side:glass:taken",
  // ring
  MUTE_TONGUE: "side:mute:tongue",
  MUTE_HUNG: "side:mute:hung",
  SWEEP_1: "side:sweep:1",
  SWEEP_2: "side:sweep:2",
  SWEEP_3: "side:sweep:3",
  VAULT_LEFT: "side:vault:left",
  VAULT_TOLD: "side:vault:told",
  STEP_SWEPT: "side:step:swept",
  STEP_TOLD: "side:step:told",
  // organs
  TOLL_DECIDED: "side:toll:decided",
  TOLL_TOLD: "side:toll:told",
  CABLE_BASE: "side:cable:base",
  CABLE_TOLD: "side:cable:told",
  FOUNDRY_RAKED: "side:foundry:raked",
  FOUNDRY_TOLD: "side:foundry:told",
  COLUMN_STRAIT: "side:column:strait",
  COLUMN_FOUNDRY: "side:column:foundry",
  COLUMN_CABLE: "side:column:cable",
  // clearing
  SEED_EARTH: "side:seed:earth",
  SEED_TURNED: "side:seed:turned",
  CONTEST_HELD: "side:contest:held", // counter
  CONTEST_READ: "side:contest:read",
  SEASON_FACED: "side:season:faced",
  SEASON_TOLD: "side:season:told",
} as const;

/** Decisions the side content records (Player.choices). */
export const SC = {
  FORM9: "side:form9", // "filed" | "refused"
  TOLL: "side:toll", // "paid" | "refused"
} as const;

/** Shared world flags the side content raises (WorldState.flags). */
export const SW = {
  ALTAR_LIT: "side:altarLit",
  VAN_PARKED: "side:vanParked",
  FEES_PAID: "side:feesPaid",
  DESK_CLOSED: "side:deskClosed",
  TWELVE_NAMED: "side:twelveNamed",
  LAMP_LIT: "side:lampLit",
  FORM9_FILED: "side:form9Filed",
  OFFICER_WALKED: "side:officerWalked",
  HOUR_STRUCK: "side:hourStruck",
  FRONT_NAMED: "side:frontNamed",
  BELL_RANG: "side:bellRang",
  SHRINES_SWEPT: "side:shrinesSwept",
  CABLE_QUIET: "side:cableQuiet",
  FOUNDRY_DARK: "side:foundryDark",
  SEEDED: "side:seeded",
} as const;

// ---------------------------------------------------------------- places and objects

const at = (tx: number, ty: number, district: DistrictId): Vec & { district: DistrictId } => ({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2, district });

/** Where the secondary cast stands after a side hour changes their schedule. Stations first; the rest are floor tiles beside a POI. */
export const SIDE_PLACES: Record<string, Vec & { district: DistrictId }> = {
  "officer-clearing": POSITIONS["station:officer-clearing"],
  "quill-board": POSITIONS["station:quill-board"],
  "officer-ring": at(86, 11, "ring"), // outside the shrine of the mute bell
  "omen-glass": at(59, 11, "kerb"), // beside the forecast glass
  "keeper-bell": at(86, 16, "ring"), // under the mute bell
  "sexton-garden": at(26, 70, "care"), // in the wreckage garden
  "desk-foundry": at(87, 39, "organs"), // beside the raked Foundry
};

const cult = (id: string, name: string): Item => ({ id, kind: "cult", name, qty: 1, value: 0, bound: true });

/** Cult objects the side hours put in a hand. They do not list, drop or strike. */
export const SIDE_ITEMS = {
  silence: cult("cult:silence-between-words", "The silence between its words"),
  spottedHint: cult("cult:spotted-hint", "A hint that does not list"),
  twelfthName: cult("cult:twelfth-name", "The twelfth name"),
  omenGlass: cult("cult:omen-glass", "Omen glass"),
  vaultSeal: cult("cult:vault-seal", "Vault seal"),
  secondColumn: cult("cult:second-column", "The second column"),
  seasonMark: cult("cult:season-mark", "Last season's mark"),
} as const;

/** The forged copy the forge tray makes; the vault takes one. */
export const COPY_ITEM_ID = "copy:wink";

// ---------------------------------------------------------------- helpers

export const has = (p: Player, key: string): boolean => (p.flags[key] ?? 0) > 0;
export const count = (p: Player, key: string): number => p.flags[key] ?? 0;
export const poiIs = (w: WorldState, id: string, state: string): boolean => w.pois[id]?.state === state;
export const offered = (p: Player, questId: string): boolean => has(p, offerKey(questId));
export const stepOf = (p: Player, questId: string): number | undefined => p.quests[questId];
export const hasCopy = (p: Player): boolean => p.items.some(i => i.id === COPY_ITEM_ID && i.qty > 0);

const flag = (key: string, value?: number): Effect => (value === undefined ? { kind: "flag", key } : { kind: "flag", key, value });
const worldFlag = (key: string): Effect => ({ kind: "worldFlag", key });
const poi = (id: string, state: string): Effect => ({ kind: "poi", id, state });
const news = (text: string): Effect => ({ kind: "news", text });
const wink = (text: string): Effect => ({ kind: "wink", text });
const notice = (text: string): Effect => ({ kind: "notice", text, tone: "ink" });
const give = (item: Item): Effect => ({ kind: "item", add: item });
const standing = (house: Fourfold, delta: number): Effect => ({ kind: "standing", house, delta });
const moveNpc = (id: string, place: string, state: string): Effect => {
  const pos = SIDE_PLACES[place];
  return { kind: "npc", id, x: pos.x, y: pos.y, district: pos.district, present: true, state };
};

const HOUSE_NAME: Record<Fourfold, string> = { earth: "House of Earth", sky: "House of Sky", mortals: "House of Mortals", divinities: "House of Divinities" };
const ownHouse = (p: Player): Fourfold | null => (p.house === "" ? null : p.house);

/** Standing for the player's own House; nothing for an unsealed body. */
const ownStanding = (delta: number, line: (house: string) => string) => (ctx: Ctx): Effect[] => {
  const h = ownHouse(ctx.p);
  if (!h) return [];
  return [standing(h, delta), news(line(HOUSE_NAME[h]))];
};

const angel = (p: Player): boolean => !p.guest && !p.locked;

type Draft = Omit<Quest, "kind"> & { kind?: "side" };
const quest = (q: Draft): Quest => ({ ...q, kind: "side" });
const step = (s: QuestStep): QuestStep => s;

// ---------------------------------------------------------------- the Nave of Tubes

const NAVE: Quest[] = [
  quest({
    id: SQ.THIRD_ALTAR,
    title: "The third altar",
    movement: 1,
    district: "nave",
    guestLegal: true,
    changes: "poi",
    available: ({ p }) => has(p, F.WEATHER_SAFETY),
    steps: [
      step({
        id: "count",
        title: "Count the altars",
        detail: "The plaque says the Nave has two altars. Stand at the lit one and press E to count.",
        target: "crt-altar-1",
        plate: "wing-star.png",
        done: ({ p }) => has(p, SF.ALTAR_COUNTED),
      }),
      step({
        id: "light",
        title: "Light the one they did not count",
        detail: "The altar across the aisle is dark. Safety counted two and this is the third. Press E to light it.",
        target: "crt-altar-2",
        plate: "wing-star.png",
        done: ({ p, w }) => has(p, SF.ALTAR_LIT) || poiIs(w, "crt-altar-2", "lit"),
        onComplete: [
          poi("crt-altar-2", "lit"),
          worldFlag(SW.ALTAR_LIT),
          news("Someone lit the altar Safety did not count."),
          wink("Three screens. Two on the ledger. The one that is not counted is the one that is still a place."),
        ],
      }),
    ],
    onFinish: [{ kind: "readiness", delta: 2 }, notice("The third altar is lit. The plaque still says two.")],
  }),

  quest({
    id: SQ.UNSPENT,
    title: "Leave something unspent",
    movement: 1,
    district: "nave",
    guestLegal: true,
    changes: "poi",
    available: ({ p }) => has(p, F.FIRST_NODE),
    onStart: ({ p }) => [flag(SF.UNSPENT_BASE, p.kept)],
    steps: [
      step({
        id: "keep",
        title: "Keep two nodes",
        detail: "Two yield nodes, left with their charges in them. Stand at a node and press Q to keep it.",
        target: ({ p, w }) => w.nodes.find(n => n.district === "nave" && !n.kept)?.id ?? (p.district === "nave" ? "nave-node-1" : "gate-nave-wet"),
        plate: "plate-arena.jpg",
        done: ({ p }) => p.kept - count(p, SF.UNSPENT_BASE) >= 2,
        onComplete: [notice("Two nodes kept. The ground noticed. Nothing else did, yet.")],
      }),
      step({
        id: "touch",
        title: "Put your hand on the dark glass",
        detail: "The lit altar has a dark twin screen. Press E with kept nodes behind you.",
        target: "crt-altar-1",
        plate: "wing-star.png",
        done: ({ p, w }) => has(p, SF.UNSPENT_TOUCHED) || poiIs(w, "crt-altar-1", "lit"),
        onComplete: [
          poi("crt-altar-1", "lit"),
          news("An altar in the Nave lit for two nodes nobody drained."),
          wink("A kept node is a place. An extracted node was one. The glass knows the difference."),
        ],
      }),
    ],
    onFinish: [{ kind: "restraint", delta: 3 }],
  }),

  quest({
    id: SQ.ANOTHER_NIGHT,
    title: "Another night",
    movement: 2,
    district: "nave",
    guestLegal: false,
    changes: "cult",
    available: ({ p, w }) => angel(p) && (w.flags[W.MEMORIAL_VOICE] ?? 0) === 1 && has(p, F.BURIED_NARA),
    steps: [
      step({
        id: "sit",
        title: "Sit with the voice",
        detail: "The recorder is still running. Press E and stay until it repeats.",
        target: "memorial-recorder",
        plate: "memorial-recorder-v1.jpg",
        done: ({ p }) => has(p, SF.NIGHT_SAT),
      }),
      step({
        id: "listen",
        title: "Hear the silence between its words",
        detail: "Come back after you have gone under. Press E at the recorder. It sounds different from the other side.",
        target: "memorial-recorder",
        plate: "memorial-recorder-v1.jpg",
        done: ({ p }) => has(p, SF.NIGHT_HEARD),
      }),
    ],
    onFinish: [
      give(SIDE_ITEMS.silence),
      { kind: "readiness", delta: 3 },
      wink("The voice is not the cult object. The gap it leaves is. You can carry that. It does not list."),
      notice("You hold the silence between its words. Cult. It does not list."),
    ],
  }),

  quest({
    id: SQ.DOING_A_JOB,
    title: "They were doing a job",
    movement: 1,
    district: "nave",
    guestLegal: false,
    changes: "standing",
    available: ({ p }) => angel(p) && has(p, F.INTAKE),
    onStart: ({ p }) => [flag(SF.JOB_BASE, p.history.buried)],
    steps: [
      step({
        id: "bury",
        title: "Bury a clerk",
        detail: "A clerk falls and leaves wreckage on the aisle. Find it before the weather takes it. Press F to bury.",
        target: "enemy:desk-three",
        plate: "plate-burial.jpg",
        done: ({ p }) => p.history.buried - count(p, SF.JOB_BASE) >= 1,
        onComplete: [notice("A clerk is in the ground. They had a desk number. Now they have earth.")],
      }),
      step({
        id: "names",
        title: "Strike their names in",
        detail: "The Office of Safety plaque lists civic duties. Press E to write the clerks under it.",
        target: "safety-plaque",
        plate: "plate-burial.jpg",
        done: ({ p }) => has(p, SF.JOB_NAMES),
      }),
    ],
    onFinish: [
      standing("mortals", 1),
      news("Someone buried a clerk on the Nave and wrote the desk number on Safety's plaque. Mortals noticed."),
      wink("The city counts extractions. It does not count who fell. You made it count one."),
    ],
  }),
];

// ---------------------------------------------------------------- the Wet Grid

const WET: Quest[] = [
  quest({
    id: SQ.VAN,
    title: "The armored van",
    movement: 1,
    district: "wet",
    guestLegal: true,
    changes: "poi",
    available: ({ p }) => p.district === "wet",
    steps: [
      step({
        id: "ask",
        title: "Ask about the van",
        detail: "Stall four sells vans. Press E and ask what they carry.",
        target: "stall-4",
        plate: "stall-surface.jpg",
        done: ({ p }) => has(p, SF.VAN_ASKED),
      }),
      step({
        id: "wave",
        title: "Wave it through",
        detail: "The van wants the street at the south end. Press E to wave it through.",
        target: "hot-street",
        plate: "stall-surface.jpg",
        done: ({ p, w }) => has(p, SF.VAN_WAVED) || poiIs(w, "hot-street", "hot"),
        onComplete: [
          poi("hot-street", "hot"),
          worldFlag(SW.VAN_PARKED),
          news("An armored van parked on the wet street. The street went hot."),
          wink("It looks like freedom. It is a stall with wheels. The street it parks on stops being a street."),
        ],
      }),
    ],
    onFinish: [notice("The street is hot. Flags are raised here now. Guests are not loot.")],
  }),

  quest({
    id: SQ.COPY,
    title: "A copy of a hole",
    movement: 2,
    district: "wet",
    guestLegal: true,
    changes: "npc",
    available: ({ p }) => has(p, F.BOARD),
    steps: [
      step({
        id: "read",
        title: "Find the copy on the board",
        detail: "A Clearing is listed. Press E to read the price.",
        target: "listing-board",
        plate: "clearing-stall.jpg",
        done: ({ p }) => has(p, SF.COPY_READ),
      }),
      step({
        id: "down",
        title: "Take the copy down",
        detail: "Unlisting costs the fee the seller paid. Press E to pay it and take the copy off the board.",
        target: "listing-board",
        plate: "clearing-stall.jpg",
        done: ({ p }) => has(p, SF.COPY_DOWN),
        onComplete: [
          moveNpc("quill", "quill-board", "board"),
          news("Someone took a Clearing off the listing board. Quill went to look."),
          wink("A copy travels. The hole does not. You paid to make the board say nothing. That is not nothing."),
        ],
      }),
    ],
    onFinish: [{ kind: "aura", delta: 1 }, notice("The board is quiet. Quill is standing at it, reading the space.")],
  }),

  quest({
    id: SQ.LISTING_FEE,
    title: "Listing fee",
    movement: 2,
    district: "wet",
    guestLegal: false,
    changes: "standing",
    available: ({ p }) => angel(p) && p.house !== "" && has(p, F.BOARD),
    steps: [
      step({
        id: "two",
        title: "Pay two stalls in your House's name",
        detail: "Stalls one and two. Press E at each to pay the listing fee under your House.",
        target: ({ p }) => (has(p, SF.FEE_1) ? "stall-2" : "stall-1"),
        plate: "stall-surface.jpg",
        done: ({ p }) => has(p, SF.FEE_1) && has(p, SF.FEE_2),
      }),
      step({
        id: "four",
        title: "Pay the other two",
        detail: "Stalls three and four. Press E at each. Four stalls carry one name.",
        target: ({ p }) => (has(p, SF.FEE_3) ? "stall-4" : "stall-3"),
        plate: "stall-surface.jpg",
        done: ({ p }) => has(p, SF.FEE_3) && has(p, SF.FEE_4),
      }),
    ],
    onFinish: (ctx) => [
      ...ownStanding(1, h => `${h} paid the fees on four stalls. The market says the name now.`)(ctx),
      worldFlag(SW.FEES_PAID),
      wink("A fee is a sink. A name on four stalls is a standing. Neither one strikes."),
    ],
  }),

  quest({
    id: SQ.TRAY,
    title: "The tray stays warm",
    movement: 3,
    district: "wet",
    guestLegal: false,
    changes: "cult",
    available: ({ p }) => angel(p) && p.choices[C.FORGE] === "spot",
    steps: [
      step({
        id: "bank",
        title: "Bank the coals",
        detail: "Quill's tray goes cold between prints. Press E to bank the coals so the spotted hint keeps.",
        target: "forge-tray",
        plate: "plate-forge.jpg",
        done: ({ p, w }) => has(p, SF.TRAY_BANKED) || poiIs(w, "forge-tray", "warm"),
        onComplete: [poi("forge-tray", "warm"), news("Someone banked the forge tray. The print that was not a print stays warm.")],
      }),
      step({
        id: "take",
        title: "Take the hint that does not list",
        detail: "It is on the tray. Press E. It will not go to market because it cannot.",
        target: "forge-tray",
        plate: "plate-forge.jpg",
        done: ({ p }) => has(p, SF.TRAY_TAKEN),
      }),
    ],
    onFinish: [
      give(SIDE_ITEMS.spottedHint),
      wink("You kept the eye. The cult hint does not list. Copies will not open the hole."),
      notice("A hint that does not list. Cult. It stays in the hand that spotted it."),
    ],
  }),

  quest({
    id: SQ.DESK,
    title: "The desk stays empty",
    movement: 3,
    district: "wet",
    guestLegal: false,
    changes: "poi",
    available: ({ p, w }) => angel(p) && has(p, F.OPERATOR) && (w.flags[W.VESPER_GONE] ?? 0) === 1,
    steps: [
      step({
        id: "read",
        title: "Read the vacant desk",
        detail: "The Concentrator walked. Press E to read what she left open.",
        target: "operator-desk",
        plate: "plate-operator.jpg",
        done: ({ p }) => has(p, SF.DESK_READ),
      }),
      step({
        id: "close",
        title: "Close the ledger",
        detail: "Private yield still wants a body. Press E to close the book so it stops asking.",
        target: "operator-desk",
        plate: "plate-operator.jpg",
        done: ({ p, w }) => has(p, SF.DESK_CLOSED) || poiIs(w, "operator-desk", "closed"),
        onComplete: [
          poi("operator-desk", "closed"),
          worldFlag(SW.DESK_CLOSED),
          news("Someone closed the Concentrator's desk. Yield still wants a body. It will have to ask elsewhere."),
          wink("A desk is a mouth. You shut it. The number it quoted was honest. The door it bought was not."),
        ],
      }),
    ],
    onFinish: [{ kind: "restraint", delta: 2 }],
  }),
];

// ---------------------------------------------------------------- the Care

const CARE: Quest[] = [
  quest({
    id: SQ.LEDGER,
    title: "The unnamed ledger",
    movement: 2,
    district: "care",
    guestLegal: false,
    changes: "npc",
    available: ({ p }) => angel(p) && offered(p, SQ.LEDGER),
    onStart: ({ p }) => [flag(SF.LEDGER_BASE, p.history.buried)],
    steps: [
      step({
        id: "bury",
        title: "Bury two the city did not count",
        detail: "Wreckage anywhere. Two bodies in the ground before the weather takes them. Press F at wreckage to bury.",
        target: "wreckage-garden",
        plate: "wreckage-garden.jpg",
        done: ({ p }) => p.history.buried - count(p, SF.LEDGER_BASE) >= 2,
        onComplete: [notice("Two lines for Pim's ledger. Numbers, not names. Numbers are a start.")],
      }),
      step({
        id: "report",
        title: "Bring the numbers to Pim",
        detail: "Pim Ashe keeps the ledger Nara will not. Press F to give him the count.",
        target: "home:sexton",
        plate: "wreckage-garden.jpg",
        done: ({ p }) => has(p, SF.LEDGER_REPORTED),
      }),
    ],
    onFinish: [
      moveNpc("sexton", "sexton-garden", "garden"),
      news("The sexton's apprentice took his ledger into the wreckage garden. He is numbering what is there."),
      wink("A ledger of the unnamed is still a ledger. It is the only one in the city that shrinks when someone does their job."),
    ],
  }),

  quest({
    id: SQ.TWELVE,
    title: "A name for number twelve",
    movement: 2,
    district: "care",
    guestLegal: false,
    changes: "cult",
    available: ({ p }) => angel(p) && offered(p, SQ.TWELVE),
    steps: [
      step({
        id: "plate",
        title: "Find the twelfth plate",
        detail: "The funeral desk keeps the plates. Press E and ask for twelve.",
        target: "funeral-desk",
        plate: "plate-burial.jpg",
        done: ({ p }) => has(p, SF.TWELVE_PLATE),
      }),
      step({
        id: "bury",
        title: "Bury number twelve under a name",
        detail: "The garden has a plot that was left as a number. Press E. The funeral costs what funerals cost.",
        target: "wreckage-garden",
        plate: "plate-burial.jpg",
        done: ({ p }) => has(p, SF.TWELVE_BURIED),
        onComplete: [{ kind: "readiness", delta: 4 }, { kind: "history", buried: 1 }],
      }),
      step({
        id: "name",
        title: "Tell Pim the name",
        detail: "Press F. If you know the name, say it. If you do not, give one anyway. A number is not a grave.",
        target: "home:sexton",
        plate: "plate-burial.jpg",
        done: ({ p }) => has(p, SF.TWELVE_NAMED),
      }),
    ],
    onFinish: ({ p }) => [
      give(SIDE_ITEMS.twelfthName),
      worldFlag(SW.TWELVE_NAMED),
      news(has(p, SF.HONEST_FOUND) ? "Number twelve has a name. Aldo Slate. The ledger is one line shorter." : "Number twelve has a name. The ledger is one line shorter."),
      wink("You put a name where the city put a number. Cult. It does not list. It does not strike. It stays."),
    ],
  }),

  quest({
    id: SQ.STANDING,
    title: "Standing, not a stick",
    movement: 2,
    district: "care",
    guestLegal: false,
    changes: "standing",
    available: ({ p }) => angel(p) && has(p, F.HALL) && has(p, F.CARE),
    steps: [
      step({
        id: "funeral",
        title: "Pay for an unnamed funeral",
        detail: "The funeral desk buries whoever is paid for. Press E and pay for one nobody claimed.",
        target: "funeral-desk",
        plate: "plate-care.jpg",
        done: ({ p }) => has(p, SF.STANDING_FUNERAL),
      }),
      step({
        id: "enter",
        title: "Enter the burial in the book",
        detail: "The Care shrine keeps the House of Mortals book. Press Q to enter what you paid for.",
        target: "care-shrine",
        plate: "house-hall.jpg",
        done: ({ p }) => has(p, SF.STANDING_ENTERED),
      }),
    ],
    onFinish: [
      standing("mortals", 2),
      news("A funeral nobody claimed was entered at the Mortals hall. The House stands taller."),
      wink("Standing is a name on a dead line. It will never make you hit harder. That is what makes it standing."),
    ],
  }),

  quest({
    id: SQ.LAMP,
    title: "A lamp you can light",
    movement: 2,
    district: "care",
    guestLegal: false,
    changes: "poi",
    available: ({ p }) => angel(p) && offered(p, SQ.LAMP),
    steps: [
      step({
        id: "light",
        title: "Light the Mortals lamp for the buried",
        detail: "The hall lamp is dark for anyone who is not Mortals. The funeral desk keeps its wick; Pim gave you oil. Press E at the desk and pay the tithe to light it.",
        target: "funeral-desk",
        plate: "house-hall.jpg",
        done: ({ p, w }) => has(p, SF.LAMP_LIT) || poiIs(w, "hall-mortals", "lit"),
        onComplete: [
          poi("hall-mortals", "lit"),
          worldFlag(SW.LAMP_LIT),
          news("Someone lit the Mortals lamp for the buried. Not their House. Their dead."),
        ],
      }),
      step({
        id: "tell",
        title: "Tell Pim it is lit",
        detail: "Press F. He will not thank you. He will write it down.",
        target: "home:sexton",
        plate: "house-hall.jpg",
        done: ({ p }) => has(p, SF.LAMP_TOLD),
      }),
    ],
    onFinish: [{ kind: "readiness", delta: 2 }, wink("A lamp you can light. Not a lamp you own. The hall does not ask whose hand.")],
  }),
];

// ---------------------------------------------------------------- the Safety Annex

const ANNEX: Quest[] = [
  quest({
    id: SQ.FORM9,
    title: "Form 9",
    movement: 2,
    district: "annex",
    guestLegal: false,
    changes: "poi",
    available: ({ p }) => angel(p) && p.choices[C.FREEZE] === "signed",
    steps: [
      step({
        id: "ask",
        title: "Ask the Officer about the fee",
        detail: "The freeze you signed had a fee. The fee had a form. Press F and ask Corvin Slate for it.",
        target: "home:officer",
        plate: "safety-annex.jpg",
        done: ({ p }) => has(p, SF.FORM9_ASKED),
      }),
      step({
        id: "file",
        title: "File Form 9, or refuse it",
        detail: "The tax window takes Form 9. Press E to pay the freeze fee and file it. Press Q to refuse and let the freeze lapse on paper.",
        target: "tax-window",
        plate: "safety-annex.jpg",
        done: ({ p }) => has(p, SF.FORM9_FILED) || p.choices[SC.FORM9] === "refused",
        onComplete: ({ p }) =>
          p.choices[SC.FORM9] === "refused"
            ? [{ kind: "readiness", delta: 2 }, news("Someone refused Form 9. The freeze holds on the ground and lapses on paper."), wink("You signed the freeze and would not pay for it twice. Paper remembers. Weather does not.")]
            : [
                poi("safety-desk", "frozen"),
                worldFlag(SW.FORM9_FILED),
                news("Form 9 was filed. The freeze is on paper now. Paper holds longer than weather."),
                wink("You bought time. You spent a god. The hour does not forgive the signature. Form 9 does not ask it to."),
              ],
      }),
    ],
    onFinish: [notice("Form 9 is decided. The Annex does not have a Form 10.")],
  }),

  quest({
    id: SQ.HONEST,
    title: "The other honest answer",
    movement: 2,
    district: "annex",
    guestLegal: false,
    changes: "npc",
    available: ({ p }) => angel(p) && offered(p, SQ.HONEST),
    steps: [
      step({
        id: "find",
        title: "Look for the frozen name",
        detail: "Corvin Slate's brother went under during his first freeze. The wreckage garden is where the unclaimed go. Press E to look.",
        target: "wreckage-garden",
        plate: "failed-passing.jpg",
        done: ({ p }) => has(p, SF.HONEST_FOUND),
        onComplete: [notice("Number twelve. No plate. A number. The Officer's brother.")],
      }),
      step({
        id: "tell",
        title: "Tell the Officer",
        detail: "Press F. He has been telling people nobody was lost under a freeze. Tell him the number.",
        target: "home:officer",
        plate: "safety-annex.jpg",
        done: ({ p }) => has(p, SF.HONEST_TOLD),
      }),
    ],
    onFinish: [
      moveNpc("officer", "officer-clearing", "clearing"),
      worldFlag(SW.OFFICER_WALKED),
      news("The Officer of Safety left the Annex. He is standing where the Passing failed."),
      wink("Safety was the other honest answer. He still is. He just stopped saying it where it was safe."),
    ],
  }),

  quest({
    id: SQ.TAX,
    title: "The tax is climate",
    movement: 2,
    district: "annex",
    guestLegal: false,
    changes: "standing",
    available: ({ p }) => angel(p) && p.house !== "" && has(p, F.HALL),
    steps: [
      step({
        id: "read",
        title: "Read who pays",
        detail: "The tax window posts the rate. Press E to read it. The rate is the weather, in percent.",
        target: "tax-window",
        plate: "safety-annex.jpg",
        done: ({ p }) => has(p, SF.TAX_READ),
      }),
      step({
        id: "pay",
        title: "Pay your House's share",
        detail: "Press E to pay the share under your House's name. Nobody else at the window will.",
        target: "tax-window",
        plate: "safety-annex.jpg",
        done: ({ p }) => has(p, SF.TAX_PAID),
      }),
    ],
    onFinish: (ctx) => [
      ...ownStanding(1, h => `${h} paid its share at the tax window. The Annex wrote the name down.`)(ctx),
      wink("The tax is climate. The climate is you, added up. You paid for a House to be counted as weather."),
    ],
  }),

  quest({
    id: SQ.NOTICE,
    title: "A notice for the bell",
    movement: 1,
    district: "annex",
    guestLegal: true,
    changes: "npc",
    available: ({ p }) => offered(p, SQ.NOTICE),
    steps: [
      step({
        id: "deliver",
        title: "Deliver the notice to the keeper",
        detail: "Safety wants the mute bell registered as an hour. Press F at the keeper of the Ring and hand it over.",
        target: "home:keeper",
        plate: "shrine-upkeep.jpg",
        done: ({ p }) => has(p, SF.NOTICE_REFUSED),
        onComplete: [notice("The keeper read it and did not sign. He put the notice in the shrine cloth.")],
      }),
      step({
        id: "report",
        title: "Report to the Officer",
        detail: "Press F. Tell Corvin Slate the bell has no tongue and no signature.",
        target: "home:officer",
        plate: "safety-annex.jpg",
        done: ({ p }) => has(p, SF.NOTICE_REPORTED),
      }),
    ],
    onFinish: [
      moveNpc("keeper", "keeper-bell", "guarding"),
      news("The keeper of the Ring refused a Safety notice. He is standing under the mute bell."),
      wink("A bell with no tongue cannot be scheduled. That was the point of cutting it."),
    ],
  }),

  quest({
    id: SQ.CENSUS,
    title: "The bell census",
    movement: 1,
    district: "annex",
    guestLegal: true,
    changes: "npc",
    available: ({ p }) => offered(p, SQ.CENSUS),
    steps: [
      step({
        id: "first",
        title: "Count the first bell",
        detail: "The Gold Ring. Shrine of the first bell. Press E to count it for Safety.",
        target: "shrine-1",
        plate: "shrine-upkeep.jpg",
        done: ({ p }) => has(p, SF.CENSUS_FIRST),
      }),
      step({
        id: "last",
        title: "Count the last bell",
        detail: "Shrine of the last bell, east end of the Ring. Press E to count it.",
        target: "shrine-3",
        plate: "shrine-upkeep.jpg",
        done: ({ p }) => has(p, SF.CENSUS_LAST),
      }),
      step({
        id: "report",
        title: "Report the count",
        detail: "Two bells with tongues, one without. Press F at the Officer and give him the number.",
        target: "home:officer",
        plate: "safety-annex.jpg",
        done: ({ p }) => has(p, SF.CENSUS_REPORTED),
      }),
    ],
    onFinish: [
      moveNpc("officer", "officer-ring", "ring"),
      news("The Officer of Safety went to the Ring to count the bells himself."),
      wink("He did not want the count. He wanted to know if the keeper would talk to someone Safety sent."),
    ],
  }),
];

// ---------------------------------------------------------------- the Kerb of Hours

const KERB: Quest[] = [
  quest({
    id: SQ.HOUR,
    title: "The hour that does not strike",
    movement: 1,
    district: "kerb",
    guestLegal: true,
    changes: "poi",
    available: ({ p }) => offered(p, SQ.HOUR),
    steps: [
      step({
        id: "wait",
        title: "Wait under the bell",
        detail: "The hour bell is on a schedule nobody signed. Stand under it and press E. Three times. Do not leave between.",
        target: "hour-bell",
        plate: "wing-star.png",
        done: ({ p }) => count(p, SF.HOUR_WAITED) >= 3,
        onComplete: [
          poi("hour-bell", "struck"),
          worldFlag(SW.HOUR_STRUCK),
          news("The hour bell struck. Nobody signed for it."),
          wink("The bell you did not hear is the one that rang. This one you heard. That is rarer."),
        ],
      }),
      step({
        id: "tell",
        title: "Tell Halla Voss",
        detail: "Press F at the omen-reader. She said it would not strike. Tell her it did.",
        target: "home:omen",
        plate: "wing-star.png",
        done: ({ p }) => has(p, SF.HOUR_TOLD),
      }),
    ],
    onFinish: [{ kind: "readiness", delta: 2 }, notice("The hour struck once for someone who waited. The schedule did not change.")],
  }),

  quest({
    id: SQ.FRONT,
    title: "Storm front",
    movement: 2,
    district: "kerb",
    guestLegal: false,
    changes: "standing",
    available: ({ p }) => angel(p) && p.movement >= 2 && has(p, F.HALL),
    steps: [
      step({
        id: "read",
        title: "Read the front",
        detail: "The forecast glass shows the band. Press E to read the front behind it.",
        target: "forecast-glass",
        plate: "house-hall.jpg",
        done: ({ p }) => has(p, SF.FRONT_READ),
      }),
      step({
        id: "tell",
        title: "Name it to the omen-reader",
        detail: "Press F at Halla Voss. She sells hours. She does not sell fronts. Give her this one for nothing.",
        target: "home:omen",
        plate: "house-hall.jpg",
        done: ({ p }) => has(p, SF.FRONT_TOLD),
      }),
    ],
    onFinish: [
      standing("sky", 2),
      poi("forecast-glass", "lit"),
      worldFlag(SW.FRONT_NAMED),
      news("A storm front was named on the Kerb. The House of Sky stands taller. The glass is lit."),
      wink("Look at the drift, not the number. The number is what Safety sells. The front is what the sky does."),
    ],
  }),

  quest({
    id: SQ.HOURS,
    title: "Hours for sale",
    movement: 1,
    district: "kerb",
    guestLegal: true,
    changes: "npc",
    available: ({ p }) => offered(p, SQ.HOURS),
    steps: [
      step({
        id: "buy",
        title: "Buy an hour",
        detail: "Halla Voss sells hours at the omen terrace. Press E to buy one. Three Bestand.",
        target: "omen-terrace",
        plate: "wing-star.png",
        done: ({ p }) => has(p, SF.HOURS_BOUGHT),
      }),
      step({
        id: "wait",
        title: "Wait for it",
        detail: "Stand under the hour bell and press E. The hour you bought should strike.",
        target: "hour-bell",
        plate: "wing-star.png",
        done: ({ p }) => has(p, SF.HOURS_WAITED),
        onComplete: [notice("The bought hour did not come. The bell is on Safety's schedule. So is she.")],
      }),
      step({
        id: "confront",
        title: "Ask for it back",
        detail: "Press F at the omen-reader. Ask what you bought.",
        target: "home:omen",
        plate: "wing-star.png",
        done: ({ p }) => has(p, SF.HOURS_CONFRONTED),
      }),
    ],
    onFinish: [
      moveNpc("omen", "omen-glass", "glass"),
      news("Halla Voss stopped selling hours. She is reading the forecast glass for nothing."),
      wink("A forecast is a lie with a time on it. She stopped putting the time on. The lie stayed. So did she."),
      { kind: "readiness", delta: 1 },
    ],
  }),

  quest({
    id: SQ.SKY_GLASS,
    title: "A sky you can name",
    movement: 2,
    district: "kerb",
    guestLegal: false,
    changes: "cult",
    available: ({ p, w }) => angel(p) && has(p, F.HALL) && poiIs(w, "hour-bell", "struck"),
    steps: [
      step({
        id: "front",
        title: "Read the front",
        detail: "The forecast glass. Press E. The bell has struck; the glass shows more now.",
        target: "forecast-glass",
        plate: "house-hall.jpg",
        done: ({ p }) => has(p, SF.FRONT_READ),
      }),
      step({
        id: "take",
        title: "Take the omen glass",
        detail: "A sliver of the forecast glass belongs to whoever named a front. Press Q at the glass to take it.",
        target: "forecast-glass",
        plate: "house-hall.jpg",
        done: ({ p }) => has(p, SF.GLASS_TAKEN),
      }),
    ],
    onFinish: [
      give(SIDE_ITEMS.omenGlass),
      wink("The sky is a schedule nobody signed. You hold a piece of it. It shows the drift. It does not show the hour."),
      notice("Omen glass. Cult. It shows the drift, never the hour."),
    ],
  }),
];

// ---------------------------------------------------------------- the Gold Ring

const RING: Quest[] = [
  quest({
    id: SQ.MUTE,
    title: "Mute bell",
    movement: 2,
    district: "ring",
    guestLegal: false,
    changes: "poi",
    available: ({ p }) => angel(p) && offered(p, SQ.MUTE),
    steps: [
      step({
        id: "look",
        title: "Look under the second altar",
        detail: "The keeper says the bell was cast mute. Press E under the altar of the mute bell's shrine.",
        target: "shrine-2",
        plate: "shrine-upkeep.jpg",
        done: ({ p }) => has(p, SF.MUTE_TONGUE),
        onComplete: [notice("A bell's tongue in shrine cloth. Cut clean. Not cast. Cut.")],
      }),
      step({
        id: "hang",
        title: "Hang the tongue",
        detail: "Press E at the mute bell. It will ring once. Then the keeper will take the tongue back.",
        target: "mute-bell",
        plate: "shrine-upkeep.jpg",
        done: ({ p, w }) => has(p, SF.MUTE_HUNG) || poiIs(w, "mute-bell", "rung"),
        onComplete: [
          poi("mute-bell", "rung"),
          worldFlag(SW.BELL_RANG),
          news("The mute bell rang once. Then it was mute again."),
          wink("An omen is a bell that rings before the hour and is not wrong. This one rang once and was right about nothing. It was still a bell."),
        ],
      }),
    ],
    onFinish: [{ kind: "winke", delta: 1 }, notice("The bell rang once. The keeper has the tongue again. He will not say where.")],
  }),

  quest({
    id: SQ.UPKEEP,
    title: "Cult upkeep",
    movement: 2,
    district: "ring",
    guestLegal: false,
    changes: "standing",
    available: ({ p }) => angel(p) && offered(p, SQ.UPKEEP),
    steps: [
      step({
        id: "two",
        title: "Sweep the first two shrines",
        detail: "Upkeep costs Bestand. Press E at the first shrine, then the second. The Gestell thins a little for each.",
        target: ({ p }) => (has(p, SF.SWEEP_1) ? "shrine-2" : "shrine-1"),
        plate: "shrine-upkeep.jpg",
        done: ({ p }) => has(p, SF.SWEEP_1) && has(p, SF.SWEEP_2),
      }),
      step({
        id: "last",
        title: "Sweep the last",
        detail: "The shrine of the last bell has no keeper. Press E. Pay it anyway.",
        target: "shrine-3",
        plate: "shrine-upkeep.jpg",
        done: ({ p }) => has(p, SF.SWEEP_3),
      }),
    ],
    onFinish: [
      standing("divinities", 2),
      worldFlag(SW.SHRINES_SWEPT),
      news("Three shrines swept in one hour. The House of Divinities stands taller."),
      wink("Every earner has a hole. Bestand goes into the ground. Three shrines are three holes. That is the whole rite."),
    ],
  }),

  quest({
    id: SQ.VAULT,
    title: "What the vault keeps",
    movement: 3,
    district: "ring",
    guestLegal: false,
    changes: "cult",
    available: ({ p }) => angel(p) && offered(p, SQ.VAULT),
    steps: [
      step({
        id: "leave",
        title: "Bring a copy to the vault",
        detail: "A forged hint from Quill's tray. Press E at the cult vault to leave it there. It will not come back.",
        target: "cult-vault",
        plate: "wet-grid-cult.jpg",
        done: ({ p }) => has(p, SF.VAULT_LEFT),
        onComplete: [notice("The copy went into the vault. It is the only thing in there that lists. It never will again.")],
      }),
      step({
        id: "tell",
        title: "Tell the keeper",
        detail: "Press F at Dov Marrow. He wanted to see if you would give up something that sells.",
        target: "home:keeper",
        plate: "wet-grid-cult.jpg",
        done: ({ p }) => has(p, SF.VAULT_TOLD),
      }),
    ],
    onFinish: [
      give(SIDE_ITEMS.vaultSeal),
      poi("cult-vault", "open"),
      wink("A copy travels. What it copies stays in the hand that buried it. You buried a copy. That is a first."),
      notice("Vault seal. Cult. The vault is open to you. There is nothing in it for sale."),
    ],
  }),

  quest({
    id: SQ.STEP,
    title: "Sweeping is not keeping",
    movement: 1,
    district: "ring",
    guestLegal: true,
    changes: "poi",
    available: ({ p }) => offered(p, SQ.STEP),
    steps: [
      step({
        id: "sweep",
        title: "Sweep the step",
        detail: "The shrine of the first bell. Press E to sweep the step. No Bestand. A guest can hold a broom.",
        target: "shrine-1",
        plate: "shrine-upkeep.jpg",
        done: ({ p }) => has(p, SF.STEP_SWEPT),
      }),
      step({
        id: "tell",
        title: "Tell the keeper",
        detail: "Press F at Dov Marrow. He will tell you what the city will call it.",
        target: "home:keeper",
        plate: "shrine-upkeep.jpg",
        done: ({ p }) => has(p, SF.STEP_TOLD),
      }),
    ],
    onFinish: [
      poi("shrine-1", "kept"),
      news("Someone swept the first shrine's step. The city counts it as kept. That is the city's problem."),
      notice("The step is swept. The ledger says kept. The keeper says sweeping is not keeping. Both are true."),
    ],
  }),
];

// ---------------------------------------------------------------- the Organs

const ORGANS: Quest[] = [
  quest({
    id: SQ.TOLL,
    title: "Strait toll",
    movement: 3,
    district: "organs",
    guestLegal: false,
    changes: "standing",
    available: ({ p }) => angel(p) && has(p, F.M3) && offered(p, SQ.TOLL),
    steps: [
      step({
        id: "decide",
        title: "Pay the toll, or refuse it",
        detail: "The Strait charges every body that crosses the bridge; the cold desk collects. Press E at the desk to pay it into the House of Earth. Press Q to refuse.",
        target: "cold-desk",
        plate: "organ-strait.jpg",
        done: ({ p }) => p.choices[SC.TOLL] === "paid" || p.choices[SC.TOLL] === "refused",
        onComplete: ({ p }) =>
          p.choices[SC.TOLL] === "paid"
            ? [standing("earth", 2), news("Someone paid the Strait toll into the House of Earth. Earth stands taller."), wink("Ore that will not strike. You paid a House to keep being ground.")]
            : [standing("earth", -1), { kind: "readiness", delta: 2 }, news("Someone refused the Strait toll. Earth took the loss and kept the bridge open."), wink("A refusal is not free. Somebody's standing paid for it. You did not pretty it.")],
      }),
      step({
        id: "read",
        title: "Read the toll plaque",
        detail: "Cross to the Strait. Press Q at the plaque. The toll goes in the column either way.",
        target: "organ-strait",
        plate: "organ-strait.jpg",
        done: ({ p }) => has(p, SF.TOLL_TOLD),
      }),
    ],
    onFinish: [notice("The toll is in the column. The bridge does not remember who paid.")],
  }),

  quest({
    id: SQ.CABLE,
    title: "Cable quiet",
    movement: 3,
    district: "organs",
    guestLegal: false,
    changes: "poi",
    available: ({ p }) => angel(p) && has(p, F.M3) && offered(p, SQ.CABLE),
    onStart: ({ p }) => [flag(SF.CABLE_BASE, p.kept)],
    steps: [
      step({
        id: "keep",
        title: "Keep a node in the Organs",
        detail: "One node, left with its charges. Press Q at a node in the Strait, the Foundry or the Cable. Do not extract.",
        target: ({ w }) => w.nodes.find(n => n.district === "organs" && !n.kept)?.id ?? "organ-node-cable",
        plate: "organ-cable-dark.jpg",
        done: ({ p }) => p.kept - count(p, SF.CABLE_BASE) >= 1,
        onComplete: [notice("You kept the node. The hum is less. The Foundry will not thank you.")],
      }),
      step({
        id: "tell",
        title: "Tell Renn Coil",
        detail: "Press F at the cold desk. The number will go down. He will post it.",
        target: "home:desk",
        plate: "organ-cable-dark.jpg",
        done: ({ p }) => has(p, SF.CABLE_TOLD),
      }),
    ],
    onFinish: [
      poi("organ-cable", "quiet"),
      worldFlag(SW.CABLE_QUIET),
      news("Someone kept a node. The hum is less. The Foundry notices."),
      wink("Quiet was a keep. Dark would be a grave. You chose the one you can still hear."),
    ],
  }),

  quest({
    id: SQ.FOUNDRY,
    title: "Foundry dark",
    movement: 3,
    district: "organs",
    guestLegal: false,
    changes: "npc",
    available: ({ p }) => angel(p) && has(p, F.FOUNDRY) && offered(p, SQ.FOUNDRY),
    steps: [
      step({
        id: "rake",
        title: "Rake the coals out",
        detail: "The Foundry is heat without a nation. Press E to rake it out. The Cable will drink less.",
        target: "organ-foundry",
        plate: "organ-foundry-dark.jpg",
        done: ({ p, w }) => has(p, SF.FOUNDRY_RAKED) || poiIs(w, "organ-foundry", "dark"),
        onComplete: [poi("organ-foundry", "dark"), worldFlag(SW.FOUNDRY_DARK), news("Someone raked the Foundry out. Heat without a nation, ended.")],
      }),
      step({
        id: "tell",
        title: "Tell the cold desk",
        detail: "Press F at Renn Coil. He posts the number. This one is zero.",
        target: "home:desk",
        plate: "organ-foundry-dark.jpg",
        done: ({ p }) => has(p, SF.FOUNDRY_TOLD),
      }),
    ],
    onFinish: [
      moveNpc("desk", "desk-foundry", "foundry"),
      news("The cold desk clerk left the desk. He is standing at the dark Foundry with the number."),
      wink("Every furnace is a mouth. Every mouth was a place. He went to see what the place was."),
    ],
  }),

  quest({
    id: SQ.COLUMN,
    title: "The second column",
    movement: 3,
    district: "organs",
    guestLegal: false,
    changes: "cult",
    available: ({ p }) => angel(p) && has(p, F.MAP) && offered(p, SQ.COLUMN),
    steps: [
      step({
        id: "strait",
        title: "Read what the Strait was",
        detail: "Press E at the Strait. The second column is on the back of the plaque.",
        target: "organ-strait",
        plate: "plate-m3.jpg",
        done: ({ p }) => has(p, SF.COLUMN_STRAIT),
      }),
      step({
        id: "foundry",
        title: "Read what the Foundry was",
        detail: "Press E at the Foundry. Back of the plaque.",
        target: "organ-foundry",
        plate: "plate-m3.jpg",
        done: ({ p }) => has(p, SF.COLUMN_FOUNDRY),
      }),
      step({
        id: "cable",
        title: "Read what the Cable was",
        detail: "Press E at the Cable. The last line of the second column.",
        target: "organ-cable",
        plate: "plate-m3.jpg",
        done: ({ p }) => has(p, SF.COLUMN_CABLE),
      }),
    ],
    onFinish: [
      give(SIDE_ITEMS.secondColumn),
      wink("The number is honest. Honest is not the same as whole. You hold the half that was left out."),
      notice("The second column. Cult. What each organ was before it was a number."),
    ],
  }),
];

// ---------------------------------------------------------------- the Clearing

const CLEARING: Quest[] = [
  quest({
    id: SQ.SEED,
    title: "Seed",
    movement: 3,
    district: "clearing",
    guestLegal: false,
    changes: "poi",
    available: ({ p }) => angel(p) && has(p, F.GARDEN) && offered(p, SQ.SEED),
    steps: [
      step({
        id: "earth",
        title: "Take a handful of the garden",
        detail: "The wreckage garden is buried now. Press E to take a handful of what it became.",
        target: "wreckage-garden",
        plate: "wreckage-garden.jpg",
        done: ({ p }) => has(p, SF.SEED_EARTH),
      }),
      step({
        id: "turn",
        title: "Turn it into the seed ground",
        detail: "The Clearing has four seed grounds. Press E at the first and turn the garden earth in.",
        target: "seed-1",
        plate: "clearing-ring.jpg",
        done: ({ p, w }) => has(p, SF.SEED_TURNED) || poiIs(w, "seed-1", "seeded"),
        onComplete: [
          poi("seed-1", "seeded"),
          worldFlag(SW.SEEDED),
          news("Someone turned garden earth into the seed ground. A promise nobody can cash."),
          wink("A seed is a promise you cannot cash. You planted one with what a hole became."),
        ],
      }),
    ],
    onFinish: [{ kind: "readiness", delta: 3 }],
  }),

  quest({
    id: SQ.CONTEST,
    title: "Contest",
    movement: 4,
    district: "clearing",
    guestLegal: false,
    changes: "standing",
    available: ({ p }) => angel(p) && p.house !== "" && p.movement >= 4,
    steps: [
      step({
        id: "hold",
        title: "Hold the ring for your House",
        detail: "Stand on the east seed ground beside the ring and press E three times. Each time, the ring asks whose you are.",
        target: "seed-2",
        plate: "house-war.jpg",
        done: ({ p }) => count(p, SF.CONTEST_HELD) >= 3,
        onComplete: ownStanding(2, h => `${h} held the ring. Tithe and omen, never a bigger stick.`),
      }),
      step({
        id: "read",
        title: "Read the ring's ledger",
        detail: "The south-west seed ground keeps the ledger. Press E. The ring writes who stood. It does not write who won.",
        target: "seed-3",
        plate: "house-war.jpg",
        done: ({ p }) => has(p, SF.CONTEST_READ),
      }),
    ],
    onFinish: [wink("Friends split here. Tithe and omen, never a bigger stick."), notice("The ring has your House in it. It will have others.")],
  }),

  quest({
    id: SQ.SEASON,
    title: "Last season's hole",
    movement: 3,
    district: "clearing",
    guestLegal: false,
    changes: "cult",
    available: ({ p }) => angel(p) && p.movement >= 3,
    steps: [
      step({
        id: "face",
        title: "Face last season",
        detail: "The south-east seed ground looks onto the corner where a Passing failed. Press E there to face it. Do not loot it.",
        target: "seed-4",
        plate: "failed-passing.jpg",
        done: ({ p }) => has(p, SF.SEASON_FACED),
        onComplete: [notice("Last season's Passing failed. The hour went by. The city kept the weather.")],
      }),
      step({
        id: "tell",
        title: "Tell the omen-reader",
        detail: "Press F at Halla Voss. She reads fronts. She has never read one that already went by.",
        target: "home:omen",
        plate: "failed-passing.jpg",
        done: ({ p }) => has(p, SF.SEASON_TOLD),
      }),
    ],
    onFinish: [
      give(SIDE_ITEMS.seasonMark),
      { kind: "readiness", delta: 2 },
      wink("You face the wreckage. The storm is at your back. This is not a fight bonus."),
      notice("Last season's mark. Cult. Readiness is slower than salvage."),
    ],
  }),
];

// ---------------------------------------------------------------- export

export const SIDE: Quest[] = [...NAVE, ...WET, ...CARE, ...ANNEX, ...KERB, ...RING, ...ORGANS, ...CLEARING];

export const SIDE_BY_ID: Record<string, Quest> = Object.fromEntries(SIDE.map(q => [q.id, q]));
