/**
 * Every tuning number in one place. The server owns these; the client only
 * reads them for labels and prediction of cosmetic timing.
 */

// Simulation
export const TICK_HZ = 20;
export const DT = 1 / TICK_HZ;

// Body and movement (px, seconds)
export const TILE = 48;
export const BODY_R = 12;
export const SPEED = 170;
export const DODGE_SPEED = 440;
export const DODGE_DURATION = 0.18;
export const DODGE_COOLDOWN = 0.9;
export const RESTRAINT_DODGE_BONUS = 0.06;

// Combat
export const MAX_HP = 100;
export const STRIKE_RANGE = 56;
export const STRIKE_DAMAGE = 22;
export const STRIKE_COOLDOWN = 0.42;
export const HIT_STOP = 0.08;
export const HEAVY_RANGE = 64;
export const HEAVY_DAMAGE = 34;
export const HEAVY_COOLDOWN = 1.1;
export const HEAVY_WINDUP = 0.25;
export const STORM_GEARED_BONUS = 0.25; // the mixed-weather bonus; STORM_BAND_BONUS scales it by climate band
export const STORM_BAND_BONUS = { clear: 0.15, mixed: STORM_GEARED_BONUS, fat: 0.35, meltdown: 0.4 } as const;
export const STORM_FALLEN_PENALTY = 0.25;
export const STORM_GEARED_BESTAND = 60;
export const DUEL_CHALLENGE_SECONDS = 20; // a ruin duel offer waits this long for the answer
export const DUEL_SECONDS = 60; // an accepted ruin duel closes the ring for this long
export const STORM_RESTRAINT_BURN = 1; // per second while in Storm stance
export const KIT_COOLDOWN = 30;
export const KIT_DURATION = 60;
export const BLITZ_DURATION = 20;
export const BLITZ_COUNT = 8;
export const FACE_DURATION = 20;

// Enemies
export const ENEMY = {
  clerk: { hp: 44, damage: 14, telegraph: 0.6, recovery: 0.85, aggro: 96, reach: 44, speed: 110, respawn: 40 },
  intake: { hp: 176, damage: 14, telegraph: 0.7, recovery: 0.85, aggro: 120, reach: 44, speed: 100, respawn: 12 },
  warden: { hp: 90, damage: 20, telegraph: 0.8, recovery: 1.0, aggro: 110, reach: 52, speed: 90, respawn: 60 },
  enforcer: { hp: 70, damage: 18, telegraph: 0.5, recovery: 0.7, aggro: 130, reach: 48, speed: 150, respawn: 50 },
  dummy: { hp: 60, damage: 0, telegraph: 0, recovery: 0, aggro: 0, reach: 0, speed: 0, respawn: 0 },
  courier: { hp: 36, damage: 10, telegraph: 0.5, recovery: 0.8, aggro: 0, reach: 40, speed: 130, respawn: 60 }, // walks its route; never starts a fight, answers one
} as const;
export const ENEMY_LEASH = 320; // px from its anchor (home, or the current point of its route) before an enemy gives up and walks back

// Death and wreckage
export const UNBANKED_DROP = 0.3;
export const EXHIBITION_DROP_CHANCE = 0.5;
export const AURA_WOUND = 8;
export const WRECKAGE_TTL = 45;
export const WRECKAGE_TTL_BONUS = 45; // Mortals house / Ruin-angel / Storm see wreckage this much longer
export const GRAVE_TTL = 600; // a buried wreckage leaves a grave marker this long

// Aura, readiness, restraint, gestell
export const AURA_MAX = 100;
export const AURA_DRIFT = 0.02; // per second toward seed
export const AURA_DIM = 6; // below this, Winke go dark for an Angel and the city stops addressing them
export const AURA_PRESENT = 40; // at this the city looks up; late Winke stay lit in fat weather
export const AURA_ADDRESS_GLAMOUR = 10; // an Iridescent Glamour counts this much extra aura for address
export const AURA_DARK_YIELD_BONUS = 0.1; // a dark aura farms a little more efficiently
export const AURA_CRAFT_WITHER = 1; // per craft beyond the first inside a KIT_DURATION window, and per listing
export const AURA_LOOT_PENALTY = 2;
export const AURA_CAMP_PENALTY = 4;
export const AURA_DWELL_GAIN = 0.05; // per second dwelling in a Clearing or at a shrine
export const AURA_SPECTATE_GAIN = 1;
export const SPECTATE_CAP = 5;
export const RESTRAINT_START = 60;
export const RESTRAINT_MAX = 100;
export const RESTRAINT_WINK_MIN = 30;
export const RESTRAINT_CHAIN_KILL_PENALTY = 10;
export const RESTRAINT_KEEP_GAIN = 5;
export const RESTRAINT_BURY_GAIN = 8;
export const READINESS_MAX = 100;
export const READINESS_KEEP = 3;
export const READINESS_BURY = 8;
export const READINESS_WATCH = 6;
export const READINESS_REFUSE = 10;
export const READINESS_PASSING_MIN = 60;
export const READINESS_APPEARANCE_MIN = 80;
export const GESTELL_START = 38;
export const GESTELL_BASELINE = 40;
export const GESTELL_DRIFT = 0.02 / 60; // per second toward baseline
export const GESTELL_EXTRACT = 1;
export const GESTELL_KEEP = -0.5;
export const GESTELL_BURY = -0.25;
export const GESTELL_CAMP = 4;
export const GESTELL_CLEARING_HOLD = -0.01; // per second per dwelling Angel in an open Clearing
export const GESTELL_MELTDOWN = 91;
export const GESTELL_FAT = 71;
export const GESTELL_CLEAR = 30;
export const NARA_THRESHOLD = 4; // extractions without a funeral before Nara leaves the party

// Economy
export const NODE_YIELD = 12;
export const NODE_CHARGES = 3;
export const NODE_REGEN = 300; // seconds per charge
export const NODE_FAT_MULT = 1.5;
export const NODE_RESTRAINT_MULT = 0.8;
export const REPAIR_COST = 6;
export const INSURE_COST = 10;
export const RESTORE_COST = 8;
export const RESTORE_AURA = 4;
export const UPKEEP_COST = 5;
export const TITHE_COST = 4;
export const FREEZE_FEE = 15;
export const LISTING_FEE = 2;
export const LISTING_PRICE_MIN = 1; // the stall's bounds, for a player's print and for the city's own listing alike
export const LISTING_PRICE_MAX = 999;
/** The seller id of a listing the city posts: no body on the Grid sells it, so nobody buys it and nobody cancels it. */
export const CITY_SELLER = "";
export const FUNERAL_COST = 5;
export const FORGE_COST = 6;
export const COPY_PRICE = 9;
export const EXHIBIT_DECAY = 600; // seconds before an exhibition item loses a unit of value
export const CLAIM_HOLD = 24 * 60 * 60; // simulation seconds
export const CLAIM_CAP = 3; // authored campaign claims per Angel
export const CLAIM_AMOUNT = 25;
export const BANK_FEE = 0.05;
export const OPERATOR_YIELD = 60;
export const M3_DOOR_PRICE = 40;
/** The resistance's Clearing on the listing board: the opening price, and how far it moves when the city does. */
export const CLEARING_LIST_PRICE = 40;
export const CLEARING_PRICE_MOVE = { taken: 8, refused: -4, appearance: 12, absence: 4, hijack: 8, failed: -6 } as const;

// PvP
export const TRUCE_SECONDS = 20;
export const RUIN_DUEL_RADIUS = 72;
export const SPECTATE_RADIUS = 96;
export const CAMP_WINDOW = 120; // seconds; killing the same Angel twice inside it is camping

// Houses and Clearings
export const WAR_PERIOD = 600; // seconds between holds
export const WAR_HOLD = 120; // seconds a hold lasts
export const WAR_RADIUS = 96;
export const CLEARING_RESERVE = 40;
export const CLEARING_EXTRACT = 10;
export const CLEARING_RADIUS = 120;
export const CLEARING_HOLD_ANGELS = 2; // dwellers needed to hold a Passing at meltdown
export const CLEARING_HOLD_SCALE = { clear: 1.5, mixed: 1, fat: 1, meltdown: 0.5 } as const; // WAR_HOLD scaled by climate band
export const PASSING_STIPEND = 20;
export const SEASON_LENGTH = 7 * 24 * 60 * 60; // a season rolls the Clearing, the omens and the Passing rite

// Snapshot / area of interest
export const AOI_RADIUS = 1040;
export const NEWS_KEEP = 8;
export const NOTICE_KEEP = 4;
export const NOTICE_TTL = 6;

// Identity
export const ANGEL_SUPPLY = 7777;
export const TEST_SERIAL = 7777;
export const MOCK_SIG = "mock";
