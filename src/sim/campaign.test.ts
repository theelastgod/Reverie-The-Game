import { describe, expect, it } from "vitest";
import {
  CARE_DOOR,
  CARE_SPECTATOR,
  CLEARING_PRICE,
  CLEARING_STALL,
  GUEST_LOCK,
  GUEST_ARENA,
  ARENA_COPY,
  ARENA_HELD,
  ARENA_HIT,
  ARENA_OPEN_PLAQUE,
  SCREENING,
  SCREENING_COPY,
  WINK_SCREENING,
  SCREENING_HELD,
  SCREENING_SPECTATOR,
  SCREENING_OPEN_PLAQUE,
  PARTICIPANT_COPY,
  WINK_PARTICIPANT,
  PARTICIPANT_NEED,
  PARTICIPANT_HELD,
  PARTICIPANT_SPECTATOR,
  PARTICIPANT_PLAQUE,
  FOUNDER_COPY,
  WINK_FOUNDER,
  FOUNDER_NEED,
  FOUNDER_HELD,
  FOUNDER_SPECTATOR,
  FOUNDER_PLAQUE,
  STILL,
  STILL_COPY,
  STILL_NEED,
  STILL_HELD,
  STILL_SPECTATOR,
  STILL_PLAQUE,
  winkSchoolFor,
  schoolWink,
  logCopy,
  emptyLog,
  WINK_LOG,
  LOG_NEED,
  LOG_HELD,
  LOG_SPECTATOR,
  LOG_PLAQUE,
  CLERK_HP,
  GOING_UNDER,
  FREEZE_COPY,
  FREEZE_COST,
  FREEZE_NEED,
  FREEZE_EXTRACT,
  FREEZE_NEED_HALL,
  FREEZE_SPECTATOR,
  HALL_PLAQUE,
  HALL_STANDING_PLAQUE,
  STANDING_COPY,
  STANDING_NEED,
  STANDING_WRONG,
  STANDING_HELD,
  STANDING_SPECTATOR,
  FOURFOLD_HOLD,
  WINK_FOURFOLD,
  FOURFOLD_NEED,
  FOURFOLD_HELD,
  FOURFOLD_SPECTATOR,
  FOURFOLD_PLAQUE,
  fourfoldReady,
  LAST_GOD_COPY,
  WINK_LAST_GOD,
  LAST_GOD_NEED,
  LAST_GOD_HELD,
  LAST_GOD_SPECTATOR,
  LAST_GOD_PLAQUE,
  RESTRAINT_COPY,
  WINK_RESTRAINT,
  RESTRAINT_NEED,
  RESTRAINT_HELD,
  RESTRAINT_SPECTATOR,
  RESTRAINT_PLAQUE,
  STANCE_COPY,
  WINK_STANCE,
  STANCE_HELD,
  STANCE_STORM,
  STANCE_NEED,
  STANCE_SPECTATOR,
  STANCE_PLAQUE,
  STORM_BURNS,
  RESTRAINT_YIELD,
  DODGE_COPY,
  HIT_STOP,
  HIT_STOP_COPY,
  WINK_HIT_STOP,
  HIT_STOP_PLAQUE,
  AURA_ADDRESS,
  ADDRESSED_COPY,
  WINK_ADDRESSED,
  ADDRESSED_NEED,
  ADDRESSED_WEATHER,
  ADDRESSED_HELD,
  ADDRESSED_SPECTATOR,
  ADDRESSED_PLAQUE,
  PARTY_COPY,
  PART_COPY,
  WINK_PART,
  PART_NEED,
  PART_HELD,
  PART_PLAQUE,
  HEAVY_HOLD,
  HEAVY_COPY,
  WINK_HEAVY,
  HEAVY_PLAQUE,
  TRUCE_HOLD,
  TRUCE_COPY,
  WINK_TRUCE,
  TRUCE_NEED,
  TRUCE_HELD,
  TRUCE_SPECTATOR,
  TRUCE_PLAQUE,
  HANDOFF_COPY,
  WINK_HANDOFF,
  HANDOFF_AGAIN,
  HANDOFF_NEED,
  HANDOFF_NONE,
  HANDOFF_FEE,
  HANDOFF_SPECTATOR,
  HANDOFF_CULT,
  HANDOFF_DARK,
  HANDOFF_PLAQUE,
  CARE_PEOPLE_COPY,
  WINK_CARE_PEOPLE,
  CARE_PEOPLE_NEED,
  CARE_PEOPLE_HELD,
  CARE_PEOPLE_SPECTATOR,
  CARE_PEOPLE_PLAQUE,
  SHRINE_PEOPLE_COPY,
  WINK_SHRINE_PEOPLE,
  SHRINE_PEOPLE_NEED,
  SHRINE_PEOPLE_HELD,
  SHRINE_PEOPLE_SPECTATOR,
  SHRINE_PEOPLE_PLAQUE,
  SAFETY_PEOPLE_COPY,
  WINK_SAFETY_PEOPLE,
  SAFETY_PEOPLE_NEED,
  SAFETY_PEOPLE_HELD,
  SAFETY_PEOPLE_SPECTATOR,
  SAFETY_PEOPLE_PLAQUE,
  DESK_PEOPLE_COPY,
  WINK_DESK_PEOPLE,
  DESK_PEOPLE_NEED,
  DESK_PEOPLE_HELD,
  DESK_PEOPLE_SPECTATOR,
  DESK_PEOPLE_PLAQUE,
  HALL_PEOPLE_COPY,
  WINK_HALL_PEOPLE,
  HALL_PEOPLE_NEED,
  HALL_PEOPLE_HELD,
  HALL_PEOPLE_SPECTATOR,
  HALL_PEOPLE_PLAQUE,
  CLEARING_PEOPLE_COPY,
  WINK_CLEARING_PEOPLE,
  CLEARING_PEOPLE_NEED,
  CLEARING_PEOPLE_HELD,
  CLEARING_PEOPLE_SPECTATOR,
  CLEARING_PEOPLE_PLAQUE,
  WET_PEOPLE_COPY,
  WINK_WET_PEOPLE,
  WET_PEOPLE_NEED,
  WET_PEOPLE_HELD,
  WET_PEOPLE_SPECTATOR,
  WET_PEOPLE_PLAQUE,
  STALL_PEOPLE_COPY,
  WINK_STALL_PEOPLE,
  STALL_PEOPLE_NEED,
  STALL_PEOPLE_HELD,
  STALL_PEOPLE_SPECTATOR,
  STALL_PEOPLE_PLAQUE,
  FOUNDRY_PEOPLE_COPY,
  WINK_FOUNDRY_PEOPLE,
  FOUNDRY_PEOPLE_NEED,
  FOUNDRY_PEOPLE_HELD,
  FOUNDRY_PEOPLE_SPECTATOR,
  FOUNDRY_PEOPLE_PLAQUE,
  STRAIT_PEOPLE_COPY,
  WINK_STRAIT_PEOPLE,
  STRAIT_PEOPLE_NEED,
  STRAIT_PEOPLE_HELD,
  STRAIT_PEOPLE_SPECTATOR,
  STRAIT_PEOPLE_PLAQUE,
  CABLE_PEOPLE_COPY,
  WINK_CABLE_PEOPLE,
  CABLE_PEOPLE_NEED,
  CABLE_PEOPLE_HELD,
  CABLE_PEOPLE_SPECTATOR,
  CABLE_PEOPLE_PLAQUE,
  organsPeopleReady,
  ORGANS_PEOPLE_COPY,
  WINK_ORGANS_PEOPLE,
  ORGANS_PEOPLE_NEED,
  ORGANS_PEOPLE_HELD,
  ORGANS_PEOPLE_SPECTATOR,
  ORGANS_PEOPLE_PLAQUE,
  VESPER_PEOPLE_COPY,
  WINK_VESPER_PEOPLE,
  VESPER_PEOPLE_NEED,
  VESPER_PEOPLE_HELD,
  VESPER_PEOPLE_SPECTATOR,
  VESPER_PEOPLE_PLAQUE,
  M3_PEOPLE_COPY,
  WINK_M3_PEOPLE,
  M3_PEOPLE_NEED,
  M3_PEOPLE_HELD,
  M3_PEOPLE_SPECTATOR,
  M3_PEOPLE_PLAQUE,
  SCREENING_PEOPLE_COPY,
  WINK_SCREENING_PEOPLE,
  SCREENING_PEOPLE_NEED,
  SCREENING_PEOPLE_HELD,
  SCREENING_PEOPLE_SPECTATOR,
  SCREENING_PEOPLE_PLAQUE,
  ANNEX_PEOPLE_COPY,
  WINK_ANNEX_PEOPLE,
  ANNEX_PEOPLE_NEED,
  ANNEX_PEOPLE_HELD,
  ANNEX_PEOPLE_SPECTATOR,
  ANNEX_PEOPLE_PLAQUE,
  ARENA_PEOPLE_COPY,
  WINK_ARENA_PEOPLE,
  ARENA_PEOPLE_NEED,
  ARENA_PEOPLE_HELD,
  ARENA_PEOPLE_SPECTATOR,
  ARENA_PEOPLE_PLAQUE,
  UNDER_PEOPLE_COPY,
  WINK_UNDER_PEOPLE,
  UNDER_PEOPLE_NEED,
  UNDER_PEOPLE_HELD,
  UNDER_PEOPLE_SPECTATOR,
  UNDER_PEOPLE_PLAQUE,
  GARDEN_PEOPLE_COPY,
  WINK_GARDEN_PEOPLE,
  GARDEN_PEOPLE_NEED,
  GARDEN_PEOPLE_HELD,
  GARDEN_PEOPLE_SPECTATOR,
  GARDEN_PEOPLE_PLAQUE,
  BURIAL_PLOT,
  BURIAL_PEOPLE_COPY,
  WINK_BURIAL_PEOPLE,
  BURIAL_PEOPLE_NEED,
  BURIAL_PEOPLE_HELD,
  BURIAL_PEOPLE_SPECTATOR,
  BURIAL_PEOPLE_PLAQUE,
  WEATHER_PEOPLE_COPY,
  WINK_WEATHER_PEOPLE,
  NAVE_PEOPLE_COPY,
  WINK_NAVE_PEOPLE,
  NAVE_PEOPLE_NEED,
  NAVE_PEOPLE_HELD,
  NAVE_PEOPLE_SPECTATOR,
  NAVE_PEOPLE_PLAQUE,
  CREDITS_PEOPLE_COPY,
  WINK_CREDITS_PEOPLE,
  CREDITS_PEOPLE_NEED,
  CREDITS_PEOPLE_HELD,
  CREDITS_PEOPLE_SPECTATOR,
  CREDITS_PEOPLE_PLAQUE,
  STILL_PEOPLE_COPY,
  WINK_STILL_PEOPLE,
  STILL_PEOPLE_NEED,
  STILL_PEOPLE_HELD,
  STILL_PEOPLE_SPECTATOR,
  STILL_PEOPLE_PLAQUE,
  SEASON_PEOPLE_COPY,
  WINK_SEASON_PEOPLE,
  SEASON_PEOPLE_NEED,
  SEASON_PEOPLE_HELD,
  SEASON_PEOPLE_SPECTATOR,
  SEASON_PEOPLE_PLAQUE,
  BRACKET_PEOPLE_COPY,
  WINK_BRACKET_PEOPLE,
  BRACKET_PEOPLE_NEED,
  BRACKET_PEOPLE_HELD,
  BRACKET_PEOPLE_SPECTATOR,
  BRACKET_PEOPLE_PLAQUE,
  LOG_PEOPLE_COPY,
  WINK_LOG_PEOPLE,
  LOG_PEOPLE_NEED,
  LOG_PEOPLE_HELD,
  LOG_PEOPLE_SPECTATOR,
  LOG_PEOPLE_PLAQUE,
  FOUNDER_PEOPLE_COPY,
  WINK_FOUNDER_PEOPLE,
  FOUNDER_PEOPLE_NEED,
  FOUNDER_PEOPLE_HELD,
  FOUNDER_PEOPLE_SPECTATOR,
  FOUNDER_PEOPLE_PLAQUE,
  ROOMS_PEOPLE_COPY,
  WINK_ROOMS_PEOPLE,
  ROOMS_PEOPLE_NEED,
  ROOMS_PEOPLE_HELD,
  ROOMS_PEOPLE_SPECTATOR,
  ROOMS_PEOPLE_PLAQUE,
  STORM_PEOPLE_COPY,
  WINK_STORM_PEOPLE,
  STORM_PEOPLE_NEED,
  STORM_PEOPLE_HELD,
  STORM_PEOPLE_SPECTATOR,
  STORM_PEOPLE_PLAQUE,
  BOUNTY_PEOPLE_COPY,
  WINK_BOUNTY_PEOPLE,
  BOUNTY_PEOPLE_NEED,
  BOUNTY_PEOPLE_HELD,
  BOUNTY_PEOPLE_SPECTATOR,
  BOUNTY_PEOPLE_PLAQUE,
  FLAG_PEOPLE_COPY,
  WINK_FLAG_PEOPLE,
  FLAG_PEOPLE_NEED,
  FLAG_PEOPLE_HELD,
  FLAG_PEOPLE_SPECTATOR,
  FLAG_PEOPLE_PLAQUE,
  TRUCE_PEOPLE_COPY,
  WINK_TRUCE_PEOPLE,
  TRUCE_PEOPLE_NEED,
  TRUCE_PEOPLE_MATE,
  TRUCE_PEOPLE_HELD,
  TRUCE_PEOPLE_SPECTATOR,
  TRUCE_PEOPLE_PLAQUE,
  WEATHER_PEOPLE_NEED,
  WEATHER_PEOPLE_HELD,
  WEATHER_PEOPLE_SPECTATOR,
  WEATHER_PEOPLE_PLAQUE,
  WINK_PARTY_WALK,
  PARTY_NEED,
  PARTY_HELD,
  PARTY_SPECTATOR,
  PARTY_WALK_PLAQUE,
  DODGE_WHIFF,
  STORM_GEAR,
  STORM_SKIM,
  STORM_PRESS,
  STORM_SKIM_COPY,
  STORM_FALLEN,
  WINK_STORM_PRESS,
  STORM_PROGRESS_PLAQUE,
  stormProgress,
  alreadyFallen,
  intentMoving,
  RESTRAINT_PAY,
  VESPER_NOGOD,
  WINK_NOGOD,
  VESPER_NOGOD_LATER,
  VESPER_NOGOD_NEED,
  VESPER_NOGOD_SPECTATOR,
  NOGOD_PLAQUE,
  NARA_GOD_ASK,
  NARA_GOD,
  NARA_GOD_LATER,
  NARA_GOD_SPECTATOR,
  WINK_NARA_GOD,
  LAST_GOD_BURIED_PLAQUE,
  QUILL_NOPRINT,
  WINK_NOPRINT,
  QUILL_NOPRINT_LATER,
  QUILL_NOPRINT_SPECTATOR,
  NOPRINT_PLAQUE,
  ORD_LAST,
  WINK_ORD_LAST,
  ORD_LAST_LATER,
  ORD_LAST_NEED,
  ORD_LAST_SPECTATOR,
  LAST_GOD_ORD_PLAQUE,
  WINK_STANDING,
  HISTORY_7777,
  HOUSE_HALL,
  PASSING_READY,
  SAFETY_ANNEX,
  MOCK_SIG,
  TEST_SERIAL,
  WINK_CARE,
  WINK_FREEZE,
  WINK_HISTORY,
  WINK_SEED_COPY,
  WINK_SEED,
  WINK_SEED_NEED,
  WINK_SEED_HELD,
  WINK_SEED_PLAQUE,
  palindromeSerial,
  WINK_HALL,
  WINK_MARKET,
  MARKET_BUY,
  MARKET_LISTING,
  MARKET_NEED_HALL,
  MARKET_SPECTATOR,
  M3_DOOR,
  OPERATOR_DESK,
  OPERATOR_NEED_HALL,
  OPERATOR_OFFER,
  OPERATOR_REFUSE,
  OPERATOR_SPECTATOR,
  OPERATOR_TAKE,
  PRIVATE_YIELD,
  WINK_OPERATOR,
  WINK_GARDEN,
  WINK_ORGANS,
  WRECK_GARDEN,
  NARA_SILENCE,
  NARA_AFTER_GARDEN,
  NARA_MARK,
  NARA_MARK_LATER,
  WINK_SEXTON,
  SEXTON_SPECTATOR,
  liveNpcs,
  GARDEN_BURY,
  M3_ENTER,
  M3_SPECTATOR,
  ORD_MAP,
  ORGAN_STRAIT,
  ORGAN_FOUNDRY,
  ORGAN_CABLE,
  ORGAN_PLAQUES,
  FAILED_PASSING,
  WATCH_FAILED,
  WINK_FAILED,
  FORGE_TRAY,
  FORGE_PAY,
  LISTING_FEE,
  EXHIBIT_DECAY,
  CULT_NO_LIST,
  DECAY_COPY,
  FORGE_LESSON,
  FORGE_NEED_MARKET,
  FORGE_SELL,
  QUILL_LEAVE,
  WINK_QUILL_LEAVE,
  VESPER_LEAVE,
  WINK_VESPER_LEAVE,
  VESPER_LEAVE_HELD,
  VESPER_GONE_PLAQUE,
  QUILL_GONE_PLAQUE,
  FORGE_SPOT,
  FORGE_SPECTATOR,
  WINK_FORGE,
  QUILL_HANG_ASK,
  QUILL_HANG,
  QUILL_HANG_WAIT,
  QUILL_HANG_NEED,
  QUILL_UNFLAG_ASK,
  QUILL_UNFLAG_WAIT,
  UNFLAG_COPY,
  WINK_UNFLAG,
  UNFLAG_NEED,
  UNFLAG_LATER,
  UNFLAG_SPECTATOR,
  FLAG_CULT,
  UNFLAG_PLAQUE,
  NARA_CANAL_ASK,
  NARA_CANAL,
  NARA_CANAL_LATER,
  WINK_CANAL,
  CANAL_SPECTATOR,
  CANAL_PLAQUE,
  QUILL_HANG_SPECTATOR,
  WINK_HANG,
  STALL_DARK_COPY,
  STALL_DARK_PLAQUE,
  FAILED_SPECTATOR,
  CLEARING_RING,
  CLEARING_PREPARE,
  CLEARING_NEED_MORTAL,
  CLEARING_NEED_GARDEN,
  CLEARING_SPECTATOR,
  CLEARING_CONTEST,
  CONTEST_PAY,
  GESTELL_HOT,
  IONE,
  IONE_SPECTATOR,
  LAST_WORD,
  LAST_WORD_GONE,
  IONE_MARK,
  IONE_MARK_LATER,
  IONE_MARK_SPECTATOR,
  peopleReady,
  PEOPLE_COPY,
  WINK_PEOPLE,
  PEOPLE_NEED,
  PEOPLE_HELD,
  PEOPLE_SPECTATOR,
  PEOPLE_PLAQUE,
  WINK_ABSENCE,
  IONE_GONE_PLAQUE,
  ioneGonePoi,
  WINK_TURN,
  PASSING_APPEAR,
  STIPEND,
  WINK_STIPEND,
  STIPEND_SINK,
  APPEAR_PLAQUE,
  CREDITS_COPY,
  WINK_CREDITS,
  CREDITS_NEED,
  CREDITS_HELD,
  CREDITS_SPECTATOR,
  CREDITS_PLAQUE,
  SEASON_COPY,
  WINK_SEASON,
  SEASON_NEED,
  SEASON_HELD,
  SEASON_SPECTATOR,
  SEASON_CULT,
  SEASON_PLAQUE,
  BRACKET_COPY,
  WINK_BRACKET,
  BRACKET_NEED,
  BRACKET_HELD,
  BRACKET_SPECTATOR,
  BRACKET_PLAQUE,
  wetGridDefaultFlag,
  PARTY_BLIND,
  WINK_PARTY_BLIND,
  PARTY_BLIND_HELD,
  PARTY_BLIND_NEED,
  PARTY_BLIND_SPECTATOR,
  PARTY_BLIND_PLAQUE,
  AURA_DECAY,
  APPEAR_SLOW,
  auraTowardSeed,
  PASSING_ABSENCE,
  PARTY_STAND,
  WINK_PARTY,
  PARTY_PLAQUE,
  partyWilling,
  NARA_STAYS,
  NARA_STAYS_LATER,
  WINK_PASS_ABSENCE,
  ABSENCE_PLAQUE,
  PASSING_HIJACK,
  WINK_HIJACK,
  HIJACK_MARK_LINE,
  hijackPlaque,
  PASSING_FAIL,
  FAIL_PLAQUE,
  WINK_PASS_FAIL,
  FAIL_LATER,
  STORM_COPY,
  WINK_STORM,
  STORM_HELD,
  STORM_NEED,
  STORM_SPECTATOR,
  STORM_PLAQUE,
  PASSING_NEED,
  dwellNeed,
  passingResult,
  ruinSight,
  visibleFailed,
  houseFor,
  houseName,
  earthTax,
  divinitiesKeep,
  messengerFor,
  messengerName,
  ANNOUNCE_COPY,
  ANNOUNCE_NEED,
  ANNOUNCE_SPECTATOR,
  WINK_ANNOUNCE,
  BLITZ_COPY,
  WINK_BLITZ,
  BLITZ_NEED,
  BLITZ_HELD,
  BLITZ_SPECTATOR,
  BLITZ_COUNT,
  lastWrecks,
  RUIN_BACK,
  WINK_RUIN_BACK,
  RUIN_BACK_NEED,
  RUIN_BACK_HELD,
  RUIN_BACK_SPECTATOR,
  RUIN_BACK_PLAQUE,
  CYBER_COPY,
  WINK_CYBER,
  CYBER_NEED,
  CYBER_HELD,
  CYBER_SPECTATOR,
  CYBER_PLAQUE,
  GLAMOUR_COPY,
  WINK_GLAMOUR,
  GLAMOUR_NEED,
  GLAMOUR_HELD,
  GLAMOUR_SPECTATOR,
  GLAMOUR_DARK,
  GLAMOUR_PLAQUE,
  DWELL_COPY,
  WINK_DWELL,
  DWELL_NEED,
  DWELL_HELD,
  DWELL_SPECTATOR,
  DWELL_PLAQUE,
  NARA_LEAVE,
  WINK_NARA_LEAVE,
  NARA_LEAVE_GESTELL,
  NARA_GONE_PLAQUE,
  NARA_PERSON,
  WINK_NARA_PERSON,
  NARA_PERSON_HELD,
  NARA_PERSON_NEED,
  NARA_PERSON_SPECTATOR,
  NARA_PERSON_PLAQUE,
  QUILL_PERSON,
  WINK_QUILL_PERSON,
  QUILL_PERSON_HELD,
  QUILL_PERSON_NEED,
  QUILL_PERSON_SPECTATOR,
  QUILL_PERSON_PLAQUE,
  ORD_PERSON,
  WINK_ORD_PERSON,
  ORD_PERSON_HELD,
  ORD_PERSON_NEED,
  ORD_PERSON_SPECTATOR,
  ORD_PERSON_PLAQUE,
  VESPER_PERSON,
  WINK_VESPER_PERSON,
  VESPER_PERSON_HELD,
  VESPER_PERSON_NEED,
  VESPER_PERSON_SPECTATOR,
  VESPER_PERSON_PLAQUE,
  VESPER,
  ORD_LEAVE_GESTELL,
  ORD_LEAVE,
  WINK_ORD_LEAVE,
  ORD_GONE_PLAQUE,
  ORD_ERRAND,
  ORD_CABLE_LATER,
  CABLE_QUIET_COPY,
  CABLE_QUIET_PLAQUE,
  ERRAND_EXTRACT,
  WINK_ERRAND,
  WAR_WIN,
  WAR_TITHE,
  TITHE_COST,
  TITHE_COPY,
  TITHE_NEED,
  TITHE_SPECTATOR,
  TITHE_WRONG,
  TITHE_NONE,
  TITHE_HELD,
  BOUNTY_PAY,
  BOUNTY_COPY,
  WINK_BOUNTY,
  BOUNTY_NEED,
  BOUNTY_HELD,
  BOUNTY_SPECTATOR,
  BOUNTY_WRONG,
  BOUNTY_PLAQUE,
  WAR_OMEN_KEEP,
  WAR_OMEN_EXTRACT,
  WINK_WAR,
  warTax,
  emptyWar,
  WET_GRID,
  FLAG_COPY,
  FLAG_SPECTATOR,
  SPOILS_COPY,
  GUEST_GRIEF,
  CAMP_COPY,
  CLAIMS_DESK,
  CLAIMS_ARMED,
  CLAIM_HOLD,
  DESK_FILE,
  DESK_WAIT,
  DESK_DISARMED,
  DESK_EMPTY,
  DESK_SPECTATOR,
  BANK_COPY,
  WINK_BANK,
  BANK_EMPTY,
  BANK_SPECTATOR,
  BANK_PLAQUE,
  VAULT_COVER,
  spendBestand,
  DUEL_COPY,
  SPECTATE_COPY,
  SPECTATE_CAP,
  WINK_DUEL,
  gestellTax,
  hallCopy,
  auraSeed,
  formatSerial,
  movementReady,
  NAVE_NPCS,
  NAVE_SIGNS,
  NPC_LINES,
  displayName,
  emptyBeats,
  visibleHistory,
  visibleWink,
  winkeVisible,
  FUNERAL_COST,
  FUNERAL_COPY,
  FUNERAL_NEED,
  SHRINE_COST,
  SHRINE_COPY,
  SHRINE_NEED,
  SHRINE_SPECTATOR,
  AURA_DIM,
  RESTORE_COST,
  RESTORE_GAIN,
  RESTORE_COPY,
  RESTORE_NEED,
  RESTORE_FULL,
  RESTORE_SPECTATOR,
  INSURANCE_COST,
  INSURANCE_COPY,
  INSURANCE_NEED,
  INSURANCE_HELD,
  INSURANCE_USED,
  INSURANCE_SPECTATOR,
  WINK_SINK,
  CLOCK_OUT,
  CLOCK_NEED,
  CLOCK_SPECTATOR,
  WINK_CLOCK,
  YIELD_EMPTY,
  YIELD_EMPTY_NEED,
  YIELD_EMPTY_SPECTATOR,
  YIELD_EMPTY_PLAQUE,
  WINK_YIELD_EMPTY,
  ANNEX_HOME,
  ANNEX_NEED,
  ANNEX_GONE,
  ANNEX_SPECTATOR,
  WINK_ANNEX,
  ANNEX_HOME_PLAQUE,
  STRAIT_REFUSE,
  WINK_STRAIT_REFUSE,
  STRAIT_NEED_DARK,
  STRAIT_REFUSED_LATER,
  STRAIT_SPECTATOR,
  STRAIT_REFUSED_PLAQUE,
  ORD_WITNESS,
  ORD_WITNESS_LATER,
  WINK_WITNESS,
  ORD_WITNESS_SPECTATOR,
  VESPER,
  VESPER_NEED_FOUNDRY,
  VESPER_UNLIGHT_ASK,
  VESPER_UNLIGHT_WAIT,
  FOUNDRY_DARK_COPY,
  WINK_FOUNDRY_DARK,
  FOUNDRY_NEED_COLD,
  FOUNDRY_DARK_LATER,
  FOUNDRY_SPECTATOR,
  OPERATOR_VACANT,
  VESPER_FOUNDRY_LATER,
  FOUNDRY_DARK_PLAQUE,
  CABLE_DARK,
  WINK_CABLE_DARK,
  CABLE_NEED_STRAIT,
  CABLE_DARK_LATER,
  CABLE_DARK_SPECTATOR,
  CABLE_DARK_PLAQUE,
  SKY_STANDING,
  WINK_SKY,
  SKY_NEED,
  SKY_WRONG,
  SKY_HELD,
  SKY_SPECTATOR,
  SKY_PLAQUE,
  EARTH_STANDING,
  WINK_EARTH,
  EARTH_WRONG,
  EARTH_NEED,
  EARTH_HELD,
  EARTH_SPECTATOR,
  EARTH_PLAQUE,
  DIV_STANDING,
  WINK_DIV,
  DIV_NEED,
  DIV_WRONG,
  DIV_HELD,
  DIV_SPECTATOR,
  DIV_PLAQUE,
  REPAIR_COST,
  REPAIR_COPY,
  REPAIR_NEED,
  REPAIR_NONE,
  REPAIR_SPECTATOR,
  SHRINE,
} from "./campaign";
import {
  applyBury,
  applyCare,
  applyFreeze,
  applyGoingUnder,
  applyLink,
  applyM3,
  applyWatch,
  applyForge,
  applyHang,
  applyFlag,
  applyUnflag,
  applyDesk,
  applyShrine,
  applyRestraint,
  applyRestraintStance,
  applyRestore,
  applyInsure,
  applyRepair,
  applyLastWord,
  applyIoneMark,
  applyPeople,
  applyClearing,
  applyPassing,
  applyCredits,
  applySeason,
  applyBracket,
  applyPartyBlind,
  applyStorm,
  applyAnnounce,
  applyBlitz,
  applyRuinBack,
  applyArena,
  applyScreening,
  applyParticipant,
  applyFounder,
  applyStill,
  applyLog,
  applyCyber,
  applyGlamour,
  applyDwell,
  applyTithe,
  applyBounty,
  applyClockOut,
  applyYieldEmpty,
  applyAnnexHome,
  applyStraitRefuse,
  applyCableDark,
  applySkyStanding,
  applyEarthStanding,
  applyDivStanding,
  applyUnlight,
  applyStanding,
  applyFourfold,
  applyLastGod,
  applyOrdLast,
  applyMarket,
  applyOperator,
  applyVesperNoGod,
  applyRead,
  snapshot,
  applyStrike,
  applyAddressed,
  applyParty,
  applyPart,
  applyHeavy,
  applyTruce,
  applyHandoff,
  applyCarePeople,
  applyShrinePeople,
  applySafetyPeople,
  applyDeskPeople,
  applyHallPeople,
  applyClearingPeople,
  applyWetPeople,
  applyStallPeople,
  applyFoundryPeople,
  applyStraitPeople,
  applyCablePeople,
  applyOrgansPeople,
  applyVesperPeople,
  applyM3People,
  applyScreeningPeople,
  applyAnnexPeople,
  applyArenaPeople,
  applyUnderPeople,
  applyGardenPeople,
  applyBurialPeople,
  applyWeatherPeople,
  applyNavePeople,
  applyCreditsPeople,
  applyStillPeople,
  applySeasonPeople,
  applyBracketPeople,
  applyLogPeople,
  applyFounderPeople,
  applyRoomsPeople,
  applyStormPeople,
  applyBountyPeople,
  applyFlagPeople,
  applyTrucePeople,
  STRIKE_COOLDOWN,
  applyTalk,
  applyNaraPerson,
  applyQuillPerson,
  applyOrdPerson,
  applyVesperPerson,
  applyUse,
  damageFor,
  emptyWorld,
  guestCanClaim,
  spawnGuest,
  tickWorld,
  tickAura,
  NAVE_SPAWN_X,
  NAVE_SPAWN_Y,
} from "./world";

function placeNear(id: string, x: number, y: number, extra: Partial<ReturnType<typeof spawnGuest>> = {}) {
  const w = emptyWorld();
  w.players.set(id, { ...spawnGuest(id), x, y, ...extra });
  return w;
}

describe("Movement I beats", () => {
  it("names Nara Vale, Quill, and Ord — not ids", () => {
    expect(displayName("nara")).toBe("Nara Vale");
    expect(displayName("quill")).toBe("Quill");
    expect(displayName("ord")).toBe("Ord");
    expect(NAVE_NPCS.every((n) => !n.name.includes("_"))).toBe(true);
    expect(NPC_LINES.nara.first).toContain("body in the ground");
    expect(NPC_LINES.quill.first).toContain("Copies travel");
    expect(NPC_LINES.ord.first).toContain("the process");
  });

  it("wires a Safety plaque as a second visible sign", () => {
    expect(NAVE_SIGNS[0]?.title).toBe("Office of Safety");
    expect(NAVE_SIGNS[0]?.text).toContain("stable");
  });

  it("talk is proximity-gated and records the beat", () => {
    const nara = NAVE_NPCS.find((n) => n.id === "nara")!;
    const far = placeNear("a", 80, 80);
    expect(applyTalk(far, "a", "nara").players.get("a")?.beats.nara).toBe(false);
    const near = placeNear("a", nara.x, nara.y);
    const after = applyTalk(near, "a", "nara");
    expect(after.players.get("a")?.beats.nara).toBe(true);
    expect(after.players.get("a")?.heard).toBe(NPC_LINES.nara.first);
    expect(after.players.get("a")?.heard).not.toMatch(/nara_|npc-/);
  });

  it("Nara burial completes the plot and raises readiness", () => {
    const plot = emptyWorld().rites.find((r) => r.kind === "burial")!;
    const w = placeNear("a", plot.x, plot.y);
    const after = applyBury(w, "a");
    expect(after.rites.find((r) => r.kind === "burial")?.done).toBe(true);
    expect(after.players.get("a")?.beats.burial).toBe(true);
    expect(after.players.get("a")?.beats.nara).toBe(true);
    expect(after.players.get("a")?.readiness).toBe(1);
  });

  it("guest lock copy fires at going-under after the three intros and burial", () => {
    const w = placeNear("a", GOING_UNDER.x, GOING_UNDER.y, {
      beats: { nara: true, quill: true, ord: true, burial: true, under: false, care: false, hall: false, freeze: false, market: false },
    });
    expect(movementReady(w.players.get("a")!.beats)).toBe(true);
    const locked = applyGoingUnder(w, "a");
    const p = locked.players.get("a")!;
    expect(p.locked).toBe(true);
    expect(p.heard).toBe(GUEST_LOCK);
    expect(guestCanClaim(p)).toBe(false);
  });

  it("going-under does not fire before the beats", () => {
    const w = placeNear("a", GOING_UNDER.x, GOING_UNDER.y);
    const after = applyGoingUnder(w, "a");
    expect(after.players.get("a")?.locked).toBe(false);
  });

  it("locked guests cannot extract sacred nodes", () => {
    const node = emptyWorld().nodes[0];
    const w = placeNear("a", node.x, node.y, { locked: true });
    const after = applyUse(w, "a", node.id, "extract");
    expect(after.players.get("a")?.bestand).toBe(0);
    expect(guestCanClaim(after.players.get("a")!)).toBe(false);
  });

  it("angel stub may go under; still no claim", () => {
    const w = placeNear("a", GOING_UNDER.x, GOING_UNDER.y, {
      guest: false,
      aura: 12,
      beats: { nara: true, quill: true, ord: true, burial: true, under: false, care: false, hall: false, freeze: false, market: false },
    });
    const after = applyGoingUnder(w, "a");
    const p = after.players.get("a")!;
    expect(p.locked).toBe(false);
    expect(p.winke).toBe(1);
    expect(p.heard).toContain("Care");
    expect(p.beats.under).toBe(true);
    expect(after.careOpen).toBe(true);
    expect(after.pois.find((poi) => poi.id === CARE_DOOR.id)?.kind).toBe("care-open");
    expect(after.pois.find((poi) => poi.id === HOUSE_HALL.id)?.name).toBe("House of Mortals");
    expect(after.signs.find((s) => s.id === HOUSE_HALL.id)?.title).toBe("House of Mortals");
    expect(guestCanClaim(p)).toBe(false);
  });
});

describe("Care door and Wink", () => {
  const ready = {
    guest: false,
    serial: TEST_SERIAL,
    aura: auraSeed(TEST_SERIAL),
    beats: { nara: true, quill: true, ord: true, burial: true, under: false, care: false, hall: false, freeze: false, market: false },
  };

  it("linked Angel going-under opens the Care; guest lock does not", () => {
    const guestW = placeNear("g", GOING_UNDER.x, GOING_UNDER.y, {
      beats: { nara: true, quill: true, ord: true, burial: true, under: false, care: false, hall: false, freeze: false, market: false },
    });
    const guestAfter = applyGoingUnder(guestW, "g");
    expect(guestAfter.careOpen).toBe(false);
    expect(visibleWink(true, WINK_CARE)).toBe("");

    const angelW = placeNear("a", GOING_UNDER.x, GOING_UNDER.y, ready);
    const open = applyGoingUnder(angelW, "a");
    expect(open.careOpen).toBe(true);
    const atDoor = { ...open };
    atDoor.players.set("a", { ...open.players.get("a")!, x: CARE_DOOR.x, y: CARE_DOOR.y });
    const seen = applyCare(atDoor, "a");
    const p = seen.players.get("a")!;
    expect(p.wink).toBe(WINK_CARE);
    expect(p.inCare).toBe(true);
    expect(p.beats.care).toBe(true);
    expect(visibleWink(p.guest, p.wink)).toBe(WINK_CARE);
    expect(guestCanClaim(p)).toBe(false);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("b")));
  });

  it("guest at an open Care door is a spectator and never hears the Wink", () => {
    const w = placeNear("a", GOING_UNDER.x, GOING_UNDER.y, ready);
    const open = applyGoingUnder(w, "a");
    open.players.set("g", {
      ...spawnGuest("g"),
      x: CARE_DOOR.x,
      y: CARE_DOOR.y,
      locked: true,
      heard: GUEST_LOCK,
    });
    const after = applyCare(open, "g");
    const g = after.players.get("g")!;
    expect(g.wink).toBe("");
    expect(g.inCare).toBe(false);
    expect(g.heard).toBe(CARE_SPECTATOR);
    expect(visibleWink(g.guest, WINK_CARE)).toBe("");
    expect(guestCanClaim(g)).toBe(false);
  });
});

describe("Movement II House hall", () => {
  const ready = {
    guest: false,
    serial: TEST_SERIAL,
    aura: auraSeed(TEST_SERIAL),
    beats: { nara: true, quill: true, ord: true, burial: true, under: false, care: false, hall: false, freeze: false, market: false },
  };

  function angelInHall() {
    const w = placeNear("a", GOING_UNDER.x, GOING_UNDER.y, ready);
    const open = applyGoingUnder(w, "a");
    open.players.set("a", { ...open.players.get("a")!, x: CARE_DOOR.x, y: CARE_DOOR.y });
    const care = applyCare(open, "a");
    const p = care.players.get("a")!;
    care.players.set("a", { ...p, x: HOUSE_HALL.x, y: HOUSE_HALL.y });
    return care;
  }

  it("gestell tax is a climate number and never a damage stick", () => {
    expect(gestellTax(12)).toBe(3);
    expect(gestellTax(0)).toBe(0);
    expect(gestellTax(100)).toBe(25);
    expect(gestellTax(-4)).toBe(0);
    const snap = snapshot(emptyWorld());
    expect(snap.tax).toBe(gestellTax(snap.gestell));
    const rich = { ...spawnGuest("a"), bestand: 9999, beats: { ...emptyBeats(), hall: true } };
    expect(damageFor(rich)).toBe(damageFor(spawnGuest("b")));
    expect(damageFor({ ...rich, aura: 99 })).toBe(damageFor(spawnGuest("b")));
    expect(guestCanClaim(rich)).toBe(false);
  });

  it("linked Angel in the Care reads the House hall and hears the tithe", () => {
    const w = angelInHall();
    const after = applyRead(w, "a", HOUSE_HALL.id);
    const p = after.players.get("a")!;
    const tax = gestellTax(after.gestell);
    expect(p.beats.hall).toBe(true);
    expect(p.heard).toBe(hallCopy(tax));
    expect(p.heard).toContain(String(tax));
    expect(p.heard).toContain("House of Mortals");
    expect(p.heard).not.toMatch(/house_hall|HOUSE_HALL/);
    expect(p.wink).toBe(WINK_HALL);
    expect(visibleWink(p.guest, p.wink)).toBe(WINK_HALL);
    expect(HALL_PLAQUE.title).toBe("House of Mortals");
    expect(damageFor(p)).toBe(damageFor(spawnGuest("b")));
    expect(guestCanClaim(p)).toBe(false);
  });

  it("Mortals standing names the garden in the hall; other Houses cannot", () => {
    const w = emptyWorld();
    w.pois = [...w.pois, { id: HOUSE_HALL.id, name: "House of Mortals", x: HOUSE_HALL.x, y: HOUSE_HALL.y, kind: "house-hall" }];
    w.signs = [...w.signs, { ...HALL_PLAQUE }];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      house: "mortals",
      inCare: true,
      beats: { ...emptyBeats(), hall: true, garden: true },
      x: HOUSE_HALL.x,
      y: HOUSE_HALL.y,
    });
    const need = applyStanding(
      { ...w, players: new Map([["a", { ...w.players.get("a")!, beats: { ...emptyBeats(), hall: true } }]]) },
      "a",
    );
    expect(need.players.get("a")?.heard).toBe(STANDING_NEED);
    expect(need.standing.mortals).toBe(0);

    const paid = applyStanding(w, "a");
    const p = paid.players.get("a")!;
    expect(p.heard).toBe(STANDING_COPY);
    expect(p.beats.standing).toBe(true);
    expect(p.wink).toBe(WINK_STANDING);
    expect(paid.hallLamp).toBe(true);
    expect(paid.standing.mortals).toBe(1);
    expect(paid.pois.find((poi) => poi.id === HOUSE_HALL.id)?.kind).toBe("house-standing");
    expect(paid.signs.find((s) => s.id === HOUSE_HALL.id)?.title).toBe(HALL_STANDING_PLAQUE.title);
    expect(applyStanding(paid, "a").players.get("a")?.heard).toBe(STANDING_HELD);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const earth = emptyWorld();
    earth.players.set("e", {
      ...spawnGuest("e"),
      guest: false,
      house: "earth",
      inCare: true,
      beats: { ...emptyBeats(), hall: true, garden: true },
      x: HOUSE_HALL.x,
      y: HOUSE_HALL.y,
    });
    expect(applyStanding(earth, "e").players.get("e")?.heard).toBe(STANDING_WRONG);
    expect(applyStanding(earth, "e").standing.mortals).toBe(0);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: HOUSE_HALL.x, y: HOUSE_HALL.y, locked: true });
    expect(applyStanding(gWorld, "g").players.get("g")?.heard).toBe(STANDING_SPECTATOR);
    expect(guestCanClaim(gWorld.players.get("g")!)).toBe(false);
  });

  it("guest cannot read the House hall even when the Care is open", () => {
    const w = angelInHall();
    w.players.set("g", {
      ...spawnGuest("g"),
      x: HOUSE_HALL.x,
      y: HOUSE_HALL.y,
      locked: true,
    });
    const after = applyRead(w, "g", HOUSE_HALL.id);
    const g = after.players.get("g")!;
    expect(g.beats.hall).toBe(false);
    expect(g.wink).toBe("");
    expect(g.heard).not.toBe(hallCopy(gestellTax(w.gestell)));
    expect(guestCanClaim(g)).toBe(false);
  });

  it("hall tax skims extract Bestand and still does not change damage", () => {
    const w = angelInHall();
    const taxed = applyRead(w, "a", HOUSE_HALL.id);
    const node = taxed.nodes[0];
    taxed.players.set("a", { ...taxed.players.get("a")!, x: node.x, y: node.y });
    const tax = gestellTax(taxed.gestell);
    const after = applyUse(taxed, "a", node.id, "extract");
    const p = after.players.get("a")!;
    expect(p.bestand).toBe(40 - tax);
    expect(p.bestand).toBeLessThan(40);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("b")));
    expect(guestCanClaim(p)).toBe(false);
  });
});

describe("the fourfold holds", () => {
  it("gathers four House standings in the hall; guests cannot", () => {
    expect(fourfoldReady({ earth: 1, sky: 1, mortals: 1, divinities: 1 })).toBe(true);
    expect(fourfoldReady({ earth: 1, sky: 1, mortals: 1, divinities: 0 })).toBe(false);
    const w = emptyWorld();
    w.standing = { earth: 1, sky: 1, mortals: 1, divinities: 1 };
    w.signs = [
      ...w.signs,
      { id: HOUSE_HALL.id, title: "Hall", text: "Nodes.", x: HOUSE_HALL.x, y: HOUSE_HALL.y },
    ];
    w.pois = [
      ...w.pois,
      { id: HOUSE_HALL.id, name: "House of Mortals", x: HOUSE_HALL.x, y: HOUSE_HALL.y, kind: "house-hall" },
    ];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      house: "mortals",
      inCare: true,
      beats: { ...emptyBeats(), hall: true },
      x: HOUSE_HALL.x,
      y: HOUSE_HALL.y,
    });
    const held = applyRead(w, "a", HOUSE_HALL.id);
    const p = held.players.get("a")!;
    expect(p.heard).toBe(FOURFOLD_HOLD);
    expect(p.wink).toBe(WINK_FOURFOLD);
    expect(p.beats.fourfold).toBe(true);
    expect(held.fourfoldHeld).toBe(true);
    expect(held.pois.find((poi) => poi.id === HOUSE_HALL.id)?.kind).toBe("fourfold-held");
    expect(held.signs.find((s) => s.id === HOUSE_HALL.id)?.title).toBe(FOURFOLD_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyFourfold(held, "a").players.get("a")?.heard).toBe(FOURFOLD_HELD);

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      inCare: true,
      beats: { ...emptyBeats(), hall: true },
      x: HOUSE_HALL.x,
      y: HOUSE_HALL.y,
    });
    expect(applyFourfold(early, "a").players.get("a")?.heard).toBe(FOURFOLD_NEED);

    const gWorld = emptyWorld();
    gWorld.standing = { earth: 1, sky: 1, mortals: 1, divinities: 1 };
    gWorld.players.set("g", { ...spawnGuest("g"), x: HOUSE_HALL.x, y: HOUSE_HALL.y, locked: true });
    expect(applyFourfold(gWorld, "g").players.get("g")?.heard).toBe(FOURFOLD_SPECTATOR);
    expect(gWorld.fourfoldHeld).toBe(false);
  });
});

describe("the last god is not here", () => {
  it("names absence at the Care after the fourfold; guests cannot", () => {
    const w = emptyWorld();
    w.careOpen = true;
    w.fourfoldHeld = true;
    w.pois = w.pois.map((poi) =>
      poi.id === CARE_DOOR.id ? { ...poi, name: "The Care", kind: "care-open" } : poi,
    );
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), under: true, care: true, hall: true, fourfold: true },
      x: CARE_DOOR.x,
      y: CARE_DOOR.y,
    });
    const named = applyCare(w, "a");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(LAST_GOD_COPY);
    expect(p.wink).toBe(WINK_LAST_GOD);
    expect(p.beats.lastGod).toBe(true);
    expect(named.lastGodNamed).toBe(true);
    expect(named.pois.find((poi) => poi.id === CARE_DOOR.id)?.kind).toBe("last-god-absent");
    expect(named.signs.find((s) => s.id === CARE_DOOR.id)?.title).toBe(LAST_GOD_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyLastGod(named, "a").players.get("a")?.heard).toBe(LAST_GOD_HELD);

    const early = emptyWorld();
    early.careOpen = true;
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), under: true, care: true },
      x: CARE_DOOR.x,
      y: CARE_DOOR.y,
    });
    expect(applyLastGod(early, "a").players.get("a")?.heard).toBe(LAST_GOD_NEED);

    const gWorld = emptyWorld();
    gWorld.careOpen = true;
    gWorld.fourfoldHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: CARE_DOOR.x, y: CARE_DOOR.y, locked: true });
    expect(applyLastGod(gWorld, "g").players.get("g")?.heard).toBe(LAST_GOD_SPECTATOR);
    expect(gWorld.lastGodNamed).toBe(false);
  });
});

describe("Ord will not number the last god", () => {
  it("walks to the Care after absence is named; guests cannot take him", () => {
    const ord = NAVE_NPCS.find((n) => n.id === "ord")!;
    const w = emptyWorld();
    w.lastGodNamed = true;
    w.careOpen = true;
    w.pois = w.pois.map((poi) =>
      poi.id === CARE_DOOR.id ? { ...poi, name: "The last god — not here", kind: "last-god-absent" } : poi,
    );
    w.signs = [...w.signs, { ...LAST_GOD_PLAQUE }];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), lastGod: true, fourfold: true, under: true, care: true },
      x: ord.x,
      y: ord.y,
    });
    const walked = applyTalk(w, "a", "ord");
    const p = walked.players.get("a")!;
    expect(p.heard).toBe(ORD_LAST);
    expect(p.wink).toBe(WINK_ORD_LAST);
    expect(p.beats.ordLast).toBe(true);
    expect(walked.ordAtCare).toBe(true);
    expect(walked.pois.find((poi) => poi.id === CARE_DOOR.id)?.name).toBe(LAST_GOD_ORD_PLAQUE.title);
    expect(walked.signs.find((s) => s.id === CARE_DOOR.id)?.title).toBe(LAST_GOD_ORD_PLAQUE.title);
    const moved = liveNpcs(false, false, false, false, false, false, false, false, true).find((n) => n.id === "ord")!;
    expect(moved.role).toBe("Will not number it");
    expect(moved.x).toBe(CARE_DOOR.x - 48);
    walked.players.set("a", { ...p, x: moved.x, y: moved.y });
    expect(applyTalk(walked, "a", "ord").players.get("a")?.heard).toBe(ORD_LAST_LATER);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      x: ord.x,
      y: ord.y,
    });
    expect(applyOrdLast(early, "a").players.get("a")?.heard).toBe(ORD_LAST_NEED);

    const gWorld = emptyWorld();
    gWorld.lastGodNamed = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: ord.x, y: ord.y, locked: true });
    const g = applyTalk(gWorld, "g", "ord");
    expect(g.players.get("g")?.heard).toBe(ORD_LAST_SPECTATOR);
    expect(g.ordAtCare).toBe(false);
  });
});

describe("Quill will not print the last god", () => {
  it("after absence is named, talk to Quill unlistes it; guests cannot", () => {
    const quill = NAVE_NPCS.find((n) => n.id === "quill")!;
    const w = emptyWorld();
    w.lastGodNamed = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), market: true, hall: true, lastGod: true, quill: true },
      x: quill.x,
      y: quill.y,
    });
    const said = applyTalk(w, "a", "quill");
    const p = said.players.get("a")!;
    expect(p.heard).toBe(QUILL_NOPRINT);
    expect(p.wink).toBe(WINK_NOPRINT);
    expect(p.beats.quillNoPrint).toBe(true);
    expect(said.quillNoPrint).toBe(true);
    expect(said.pois.find((poi) => poi.id === CLEARING_STALL.id)?.kind).toBe("last-god-unlisted");
    expect(said.signs.find((s) => s.id === CLEARING_STALL.id)?.title).toBe(NOPRINT_PLAQUE.title);
    expect(liveNpcs(false, false, false, false, false, false, false, false, false, false, true).find((n) => n.id === "quill")?.role).toBe(
      "Will not print it",
    );
    expect(applyTalk(said, "a", "quill").players.get("a")?.heard).toBe(QUILL_NOPRINT_LATER);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const gWorld = emptyWorld();
    gWorld.lastGodNamed = true;
    gWorld.players.set("g", {
      ...spawnGuest("g"),
      x: quill.x,
      y: quill.y,
      locked: true,
      beats: { ...emptyBeats(), market: true, spot: true },
    });
    const g = applyTalk(gWorld, "g", "quill");
    expect(g.players.get("g")?.heard).toBe(QUILL_NOPRINT_SPECTATOR);
    expect(g.quillNoPrint).toBe(false);
  });
});

describe("Nara buries the last god", () => {
  it("sexton plus named absence lets an Angel bury it; guests cannot", () => {
    const nara = NAVE_NPCS.find((n) => n.id === "nara")!;
    const w = emptyWorld();
    w.lastGodNamed = true;
    w.careOpen = true;
    w.pois = w.pois.map((poi) =>
      poi.id === CARE_DOOR.id ? { ...poi, name: "The last god — not here", kind: "last-god-absent" } : poi,
    );
    w.signs = [...w.signs, { ...LAST_GOD_PLAQUE }];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), garden: true, sexton: true, sextonAsk: true, lastGod: true, nara: true },
      cultWink: true,
      x: nara.x,
      y: nara.y,
    });
    const asked = applyTalk(w, "a", "nara");
    expect(asked.players.get("a")?.heard).toBe(NARA_GOD_ASK);
    expect(asked.players.get("a")?.beats.naraGodAsk).toBe(true);
    const buried = applyTalk(asked, "a", "nara");
    const p = buried.players.get("a")!;
    expect(p.heard).toBe(NARA_GOD);
    expect(p.wink).toBe(WINK_NARA_GOD);
    expect(p.beats.naraGod).toBe(true);
    expect(buried.lastGodBuried).toBe(true);
    expect(buried.naraAtCare).toBe(true);
    expect(buried.pois.find((poi) => poi.id === CARE_DOOR.id)?.kind).toBe("last-god-buried");
    expect(buried.signs.find((s) => s.id === CARE_DOOR.id)?.title).toBe(LAST_GOD_BURIED_PLAQUE.title);
    const moved = liveNpcs(false, false, false, false, false, false, false, false, false, true).find((n) => n.id === "nara")!;
    expect(moved.role).toBe("Burying absence");
    expect(moved.x).toBe(CARE_DOOR.x + 40);
    buried.players.set("a", { ...p, x: moved.x, y: moved.y });
    expect(applyTalk(buried, "a", "nara").players.get("a")?.heard).toBe(NARA_GOD_LATER);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const gWorld = emptyWorld();
    gWorld.lastGodNamed = true;
    gWorld.players.set("g", {
      ...spawnGuest("g"),
      x: nara.x,
      y: nara.y,
      locked: true,
      beats: { ...emptyBeats(), garden: true, sexton: true },
    });
    const g = applyTalk(gWorld, "g", "nara");
    expect(g.players.get("g")?.heard).toBe(NARA_GOD_SPECTATOR);
    expect(g.lastGodBuried).toBe(false);
    expect(g.naraAtCare).toBe(false);
  });
});

describe("holding-back at the shrine", () => {
  it("names holding-back after the last god; guests cannot; keep still costs", () => {
    const w = emptyWorld();
    w.lastGodNamed = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      bestand: 20,
      beats: { ...emptyBeats(), lastGod: true, fourfold: true },
      x: SHRINE.x,
      y: SHRINE.y,
    });
    const named = applyRead(w, "a", SHRINE.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(RESTRAINT_COPY);
    expect(p.wink).toBe(WINK_RESTRAINT);
    expect(p.beats.restraint).toBe(true);
    expect(p.bestand).toBe(20);
    expect(named.restraintHeld).toBe(true);
    expect(named.pois.find((poi) => poi.id === SHRINE.id)?.kind).toBe("shrine-restraint");
    expect(named.signs.find((s) => s.id === SHRINE.id)?.title).toBe(RESTRAINT_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyRestraint(named, "a").players.get("a")?.heard).toBe(RESTRAINT_HELD);
    const kept = applyShrine(named, "a");
    expect(kept.players.get("a")?.bestand).toBe(20 - 8);

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      x: SHRINE.x,
      y: SHRINE.y,
    });
    expect(applyRestraint(early, "a").players.get("a")?.heard).toBe(RESTRAINT_NEED);

    const gWorld = emptyWorld();
    gWorld.lastGodNamed = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: SHRINE.x, y: SHRINE.y, locked: true });
    expect(applyRestraint(gWorld, "g").players.get("g")?.heard).toBe(RESTRAINT_SPECTATOR);
    expect(gWorld.restraintHeld).toBe(false);
  });
});

describe("Restraint stance", () => {
  it("thins extract yield and extra Winke on keep; Storm burns it; guests cannot", () => {
    const w = emptyWorld();
    w.restraintHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), restraint: true },
      x: SHRINE.x,
      y: SHRINE.y,
    });
    const stood = applyRead(w, "a", SHRINE.id);
    const p = stood.players.get("a")!;
    expect(p.heard).toBe(STANCE_COPY);
    expect(p.wink).toBe(WINK_STANCE);
    expect(p.restraint).toBe(true);
    expect(stood.pois.find((poi) => poi.id === SHRINE.id)?.kind).toBe("shrine-stance");
    expect(stood.signs.find((s) => s.id === SHRINE.id)?.title).toBe(STANCE_PLAQUE.title);
    expect(applyRestraintStance(stood, "a").players.get("a")?.heard).toBe(STANCE_HELD);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const node = stood.nodes[0];
    stood.players.set("a", { ...p, x: node.x, y: node.y });
    const took = applyUse(stood, "a", node.id, "extract");
    expect(took.players.get("a")?.bestand).toBe(RESTRAINT_PAY);
    expect(took.players.get("a")?.heard).toBe(RESTRAINT_YIELD);

    const keepW = emptyWorld();
    keepW.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      restraint: true,
      x: node.x,
      y: node.y,
    });
    const kept = applyUse(keepW, "a", node.id, "keep");
    expect(kept.players.get("a")?.winke).toBe(2);

    const burned = applyStorm(
      {
        ...emptyWorld(),
        clearingFailed: true,
        restraintHeld: true,
        players: new Map([["a", { ...p, x: CLEARING_RING.x, y: CLEARING_RING.y, restraint: true, readiness: 4 }]]),
      },
      "a",
    );
    expect(burned.players.get("a")?.restraint).toBe(false);
    expect(burned.players.get("a")?.storm).toBe(true);
    expect(burned.players.get("a")?.heard).toBe(STORM_BURNS);
    burned.players.set("a", { ...burned.players.get("a")!, x: SHRINE.x, y: SHRINE.y });
    expect(applyRestraintStance(burned, "a").players.get("a")?.heard).toBe(STANCE_STORM);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: SHRINE.x, y: SHRINE.y });
    expect(applyRestraintStance(early, "a").players.get("a")?.heard).toBe(STANCE_NEED);

    const gWorld = emptyWorld();
    gWorld.restraintHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: SHRINE.x, y: SHRINE.y, locked: true });
    expect(applyRestraintStance(gWorld, "g").players.get("g")?.heard).toBe(STANCE_SPECTATOR);
    expect(gWorld.players.get("g")?.restraint).toBe(false);
  });
});

describe("Restraint dodge window", () => {
  it("moving Restraint skips a strike; standing still does not; damageFor is unchanged", () => {
    expect(intentMoving({ up: true, down: false, left: false, right: false })).toBe(true);
    expect(intentMoving({ up: false, down: false, left: false, right: false })).toBe(false);
    const w = emptyWorld();
    w.players.set("a", { ...spawnGuest("a"), guest: false, x: 200, y: 480 });
    w.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      serial: TEST_SERIAL,
      restraint: true,
      hp: 20,
      x: 220,
      y: 480,
    });
    w.intents.set("b", { up: true, down: false, left: false, right: false });
    const missed = applyStrike(w, "a");
    expect(missed.players.get("b")?.hp).toBe(20);
    expect(missed.players.get("b")?.heard).toBe(DODGE_COPY);
    expect(missed.players.get("a")?.heard).toBe(DODGE_WHIFF);
    expect(missed.wreckage).toHaveLength(0);
    expect(damageFor(missed.players.get("b")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(missed.players.get("b")!)).toBe(false);
    expect(DODGE_COPY).not.toMatch(/heidegger|midgar|\$REVERIE/i);

    const still = emptyWorld();
    still.players.set("a", { ...spawnGuest("a"), guest: false, x: 200, y: 480 });
    still.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      restraint: true,
      hp: 20,
      x: 220,
      y: 480,
    });
    const hit = applyStrike(still, "a");
    expect(hit.wreckage.length).toBe(1);
    expect(damageFor(hit.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
  });
});

describe("Hit-stop", () => {
  it("connecting strike holds the hit without buying damage; dodge does not", () => {
    const w = emptyWorld();
    w.players.set("a", { ...spawnGuest("a"), guest: false, x: 200, y: 480 });
    w.players.set("b", { ...spawnGuest("b"), guest: false, hp: 80, x: 220, y: 480 });
    const held = applyStrike(w, "a");
    const p = held.players.get("a")!;
    expect(p.heard).toBe(HIT_STOP_COPY);
    expect(p.wink).toBe(WINK_HIT_STOP);
    expect(p.beats.hitStop).toBe(true);
    expect(p.strikeCd).toBeCloseTo(STRIKE_COOLDOWN + HIT_STOP);
    expect(held.hitStopHeld).toBe(true);
    expect(held.pois.find((poi) => poi.kind === "hit-stop")?.x).toBe(220);
    expect(held.signs.find((s) => s.id === "hit-stop")?.title).toBe(HIT_STOP_PLAQUE.title);
    expect(held.players.get("b")?.hp).toBe(80 - 22);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const dodge = emptyWorld();
    dodge.players.set("a", { ...spawnGuest("a"), guest: false, x: 200, y: 480 });
    dodge.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      restraint: true,
      hp: 80,
      x: 220,
      y: 480,
    });
    dodge.intents.set("b", { up: true, down: false, left: false, right: false });
    const missed = applyStrike(dodge, "a");
    expect(missed.hitStopHeld).toBe(false);
    expect(missed.players.get("a")?.heard).toBe(DODGE_WHIFF);
    expect(missed.players.get("a")?.strikeCd).toBe(STRIKE_COOLDOWN);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: 200, y: 480 });
    gWorld.players.set("b", { ...spawnGuest("b"), hp: 80, x: 220, y: 480 });
    const guestHit = applyStrike(gWorld, "g");
    expect(guestHit.hitStopHeld).toBe(true);
    expect(guestHit.players.get("g")?.heard).toBe(HIT_STOP_COPY);
    expect(guestCanClaim(guestHit.players.get("g")!)).toBe(false);
  });
});

describe("High aura address", () => {
  it("named weather plus high aura: the city addresses you; low aura and guests cannot", () => {
    expect(AURA_ADDRESS).toBe(12);
    const w = emptyWorld();
    w.weatherNamed = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: 17,
      x: 192,
      y: 400,
    });
    const named = applyAddressed(w, "a");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(ADDRESSED_COPY);
    expect(p.wink).toBe(WINK_ADDRESSED);
    expect(p.beats.addressed).toBe(true);
    expect(named.addressedHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "addressed")?.id).toBe("addressed");
    expect(named.signs.find((s) => s.id === "safety-plaque")?.title).toBe(ADDRESSED_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyAddressed(named, "a").players.get("a")?.heard).toBe(ADDRESSED_HELD);
    expect(applyRead(w, "a", "safety-plaque").addressedHeld).toBe(true);

    const thin = emptyWorld();
    thin.weatherNamed = true;
    thin.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      aura: 4,
      x: 192,
      y: 400,
    });
    expect(applyAddressed(thin, "a").players.get("a")?.heard).toBe(ADDRESSED_NEED);

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      aura: 17,
      x: 192,
      y: 400,
    });
    expect(applyAddressed(early, "a").players.get("a")?.heard).toBe(ADDRESSED_WEATHER);

    const gWorld = emptyWorld();
    gWorld.weatherNamed = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: 192, y: 400, locked: true, aura: 17 });
    expect(applyAddressed(gWorld, "g").players.get("g")?.heard).toBe(ADDRESSED_SPECTATOR);
    expect(gWorld.addressedHeld).toBe(false);
  });
});

describe("Party walk", () => {
  it("named weather plus a nearby Angel walks the hour; guests cannot", () => {
    const w = emptyWorld();
    w.weatherNamed = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      x: 200,
      y: 480,
    });
    w.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      serial: 2,
      x: 220,
      y: 480,
    });
    const walked = applyParty(w, "a");
    const a = walked.players.get("a")!;
    const b = walked.players.get("b")!;
    expect(a.heard).toBe(PARTY_COPY);
    expect(a.wink).toBe(WINK_PARTY_WALK);
    expect(a.beats.party).toBe(true);
    expect(a.partyOf).toBe("b");
    expect(b.partyOf).toBe("a");
    expect(walked.partyHeld).toBe(true);
    expect(walked.pois.find((poi) => poi.kind === "party-walk")?.id).toBe("party-walk");
    expect(walked.signs.find((s) => s.id === "party-walk")?.title).toBe(PARTY_WALK_PLAQUE.title);
    expect(a.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(a)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(a)).toBe(false);
    expect(applyParty(walked, "a").players.get("a")?.heard).toBe(PART_COPY);
    const parted = applyParty(walked, "a");
    expect(parted.players.get("a")?.partyOf).toBe("");
    expect(parted.players.get("b")?.partyOf).toBe("");
    expect(parted.partedHeld).toBe(true);
    expect(parted.partyHeld).toBe(false);
    expect(parted.pois.find((poi) => poi.kind === "party-parted")?.id).toBe("party-walk");
    expect(parted.signs.find((s) => s.id === "party-walk")?.title).toBe(PART_PLAQUE.title);
    expect(applyPart(parted, "a").players.get("a")?.heard).toBe(PART_HELD);
    expect(applyParty(parted, "a").players.get("a")?.heard).toBe(PARTY_COPY);

    const alone = emptyWorld();
    alone.weatherNamed = true;
    alone.players.set("a", { ...spawnGuest("a"), guest: false, x: 200, y: 480 });
    expect(applyParty(alone, "a").players.get("a")?.heard).toBe(PARTY_NEED);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: 200, y: 480 });
    early.players.set("b", { ...spawnGuest("b"), guest: false, x: 220, y: 480 });
    expect(applyParty(early, "a").players.get("a")?.heard).toBe(PARTY_NEED);

    const gWorld = emptyWorld();
    gWorld.weatherNamed = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: 200, y: 480, locked: true });
    gWorld.players.set("b", { ...spawnGuest("b"), guest: false, x: 220, y: 480 });
    expect(applyParty(gWorld, "g").players.get("g")?.heard).toBe(PARTY_SPECTATOR);
    expect(gWorld.partyHeld).toBe(false);
  });
});

describe("Heavy strike", () => {
  it("holds longer, drops clerk telegraph, does not buy damage", () => {
    const w = emptyWorld();
    w.clerks = [{ id: "c1", name: "Yield clerk", x: 210, y: 480, hp: 40, telegraph: 0.4 }];
    w.players.set("a", { ...spawnGuest("a"), guest: false, x: 200, y: 480 });
    w.players.set("b", { ...spawnGuest("b"), guest: false, hp: 80, x: 220, y: 480 });
    const heavy = applyHeavy(w, "a");
    const p = heavy.players.get("a")!;
    expect(p.heard).toBe(HEAVY_COPY);
    expect(p.wink).toBe(WINK_HEAVY);
    expect(p.beats.heavy).toBe(true);
    expect(p.strikeCd).toBeCloseTo(STRIKE_COOLDOWN + HIT_STOP + HEAVY_HOLD);
    expect(heavy.heavyHeld).toBe(true);
    expect(heavy.clerks.find((c) => c.id === "c1")?.telegraph).toBe(0);
    expect(heavy.pois.find((poi) => poi.kind === "heavy")?.id).toBe("heavy");
    expect(heavy.signs.find((s) => s.id === "heavy")?.title).toBe(HEAVY_PLAQUE.title);
    expect(heavy.players.get("b")?.hp).toBe(80 - 22);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const dodge = emptyWorld();
    dodge.players.set("a", { ...spawnGuest("a"), guest: false, x: 200, y: 480 });
    dodge.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      restraint: true,
      hp: 80,
      x: 220,
      y: 480,
    });
    dodge.intents.set("b", { up: true, down: false, left: false, right: false });
    const missed = applyHeavy(dodge, "a");
    expect(missed.heavyHeld).toBe(false);
    expect(missed.players.get("a")?.heard).toBe(DODGE_WHIFF);
    expect(missed.players.get("a")?.strikeCd).toBe(STRIKE_COOLDOWN);
  });
});

describe("Truce", () => {
  it("unflags two Angels, holds the street, does not buy damage", () => {
    const w = emptyWorld();
    w.seasonHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      flagged: true,
      x: 720,
      y: 520,
    });
    w.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      serial: 2,
      flagged: true,
      x: 736,
      y: 520,
    });
    const truced = applyTruce(w, "a");
    const a = truced.players.get("a")!;
    const b = truced.players.get("b")!;
    expect(a.heard).toBe(TRUCE_COPY);
    expect(a.wink).toBe(WINK_TRUCE);
    expect(a.beats.truce).toBe(true);
    expect(a.flagged).toBe(false);
    expect(b.flagged).toBe(false);
    expect(a.truceUntil).toBe(TRUCE_HOLD);
    expect(b.truceUntil).toBe(TRUCE_HOLD);
    expect(truced.truceHeld).toBe(true);
    expect(truced.pois.find((poi) => poi.kind === "truce")?.name).toBe("Truce");
    expect(truced.signs.find((s) => s.id === "truce")?.title).toBe(TRUCE_PLAQUE.title);
    expect(a.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(a)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(a)).toBe(false);

    const held = tickWorld(truced, 1);
    expect(held.players.get("a")?.flagged).toBe(false);
    expect(held.now).toBe(1);
    expect(applyTruce(truced, "a").players.get("a")?.heard).toBe(TRUCE_HELD);

    const expired = tickWorld({ ...truced, now: TRUCE_HOLD }, 1);
    expect(expired.players.get("a")?.flagged).toBe(true);
    expect(expired.players.get("b")?.flagged).toBe(true);

    const alone = emptyWorld();
    alone.players.set("a", { ...spawnGuest("a"), guest: false, flagged: true, x: 720, y: 520 });
    expect(applyTruce(alone, "a").players.get("a")?.heard).toBe(TRUCE_NEED);

    const unflagged = emptyWorld();
    unflagged.players.set("a", { ...spawnGuest("a"), guest: false, flagged: false, x: 720, y: 520 });
    unflagged.players.set("b", { ...spawnGuest("b"), guest: false, flagged: true, x: 736, y: 520 });
    expect(applyTruce(unflagged, "a").players.get("a")?.heard).toBe(TRUCE_NEED);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), flagged: true, x: 720, y: 520, locked: true });
    gWorld.players.set("b", { ...spawnGuest("b"), guest: false, flagged: true, x: 736, y: 520 });
    expect(applyTruce(gWorld, "g").players.get("g")?.heard).toBe(TRUCE_SPECTATOR);
    expect(gWorld.truceHeld).toBe(false);
    expect(gWorld.players.get("b")?.flagged).toBe(true);
  });
});

describe("Exhibition handoff", () => {
  it("passes a print at the stall for a listing fee; cult and guests cannot", () => {
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      fakeWinke: 1,
      bestand: 12,
      aura: 20,
      x: CLEARING_STALL.x,
      y: CLEARING_STALL.y,
    });
    w.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      serial: 2,
      fakeWinke: 0,
      x: CLEARING_STALL.x + 8,
      y: CLEARING_STALL.y,
    });
    const passed = applyHandoff(w, "a");
    const a = passed.players.get("a")!;
    const b = passed.players.get("b")!;
    expect(a.heard).toBe(HANDOFF_COPY);
    expect(a.wink).toBe(WINK_HANDOFF);
    expect(a.beats.handoff).toBe(true);
    expect(a.fakeWinke).toBe(0);
    expect(a.bestand).toBe(12 - LISTING_FEE);
    expect(a.aura).toBe(19);
    expect(b.fakeWinke).toBe(1);
    expect(passed.handoffHeld).toBe(true);
    expect(passed.pois.find((poi) => poi.kind === "stall-handoff")?.name).toBe("The stall — handoff");
    expect(passed.signs.find((s) => s.id === "stall-handoff")?.title).toBe(HANDOFF_PLAQUE.title);
    expect(a.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(a)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(a)).toBe(false);

    passed.players.set("a", { ...passed.players.get("a")!, fakeWinke: 1, bestand: 10 });
    const again = applyHandoff(passed, "a");
    expect(again.players.get("a")?.heard).toBe(HANDOFF_AGAIN);
    expect(again.players.get("b")?.fakeWinke).toBe(2);

    const broke = emptyWorld();
    broke.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      fakeWinke: 1,
      bestand: 0,
      x: CLEARING_STALL.x,
      y: CLEARING_STALL.y,
    });
    broke.players.set("b", { ...spawnGuest("b"), guest: false, x: CLEARING_STALL.x + 8, y: CLEARING_STALL.y });
    expect(applyHandoff(broke, "a").players.get("a")?.heard).toBe(HANDOFF_FEE);

    const none = emptyWorld();
    none.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      fakeWinke: 0,
      bestand: 20,
      x: CLEARING_STALL.x,
      y: CLEARING_STALL.y,
    });
    none.players.set("b", { ...spawnGuest("b"), guest: false, x: CLEARING_STALL.x + 8, y: CLEARING_STALL.y });
    expect(applyHandoff(none, "a").players.get("a")?.heard).toBe(HANDOFF_NONE);

    const alone = emptyWorld();
    alone.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      fakeWinke: 1,
      bestand: 20,
      x: CLEARING_STALL.x,
      y: CLEARING_STALL.y,
    });
    expect(applyHandoff(alone, "a").players.get("a")?.heard).toBe(HANDOFF_NEED);

    const cult = emptyWorld();
    cult.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      cultWink: true,
      fakeWinke: 1,
      bestand: 20,
      x: CLEARING_STALL.x,
      y: CLEARING_STALL.y,
    });
    cult.players.set("b", { ...spawnGuest("b"), guest: false, x: CLEARING_STALL.x + 8, y: CLEARING_STALL.y });
    expect(applyHandoff(cult, "a").players.get("a")?.heard).toBe(HANDOFF_CULT);
    expect(cult.players.get("a")?.fakeWinke).toBe(1);

    const dark = emptyWorld();
    dark.stallDark = true;
    dark.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      fakeWinke: 1,
      bestand: 20,
      x: CLEARING_STALL.x,
      y: CLEARING_STALL.y,
    });
    dark.players.set("b", { ...spawnGuest("b"), guest: false, x: CLEARING_STALL.x + 8, y: CLEARING_STALL.y });
    expect(applyHandoff(dark, "a").players.get("a")?.heard).toBe(HANDOFF_DARK);

    const gWorld = emptyWorld();
    gWorld.players.set("g", {
      ...spawnGuest("g"),
      fakeWinke: 1,
      locked: true,
      x: CLEARING_STALL.x,
      y: CLEARING_STALL.y,
    });
    gWorld.players.set("b", { ...spawnGuest("b"), guest: false, x: CLEARING_STALL.x + 8, y: CLEARING_STALL.y });
    expect(applyHandoff(gWorld, "g").players.get("g")?.heard).toBe(HANDOFF_SPECTATOR);
    expect(gWorld.handoffHeld).toBe(false);
  });
});

describe("The Care — people", () => {
  it("names the Care as a house of people after the gathering; guests cannot", () => {
    const w = emptyWorld();
    w.careOpen = true;
    w.peopleHeld = true;
    w.lastGodNamed = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), under: true, care: true, lastGod: true, people: true },
      x: CARE_DOOR.x,
      y: CARE_DOOR.y,
    });
    const named = applyCare(w, "a");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(CARE_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_CARE_PEOPLE);
    expect(p.beats.carePeople).toBe(true);
    expect(named.carePeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "care-people")?.name).toBe("The Care — people");
    expect(named.signs.find((s) => s.id === "care-people")?.title).toBe(CARE_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Restore still costs");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyCarePeople(named, "a").players.get("a")?.heard).toBe(CARE_PEOPLE_HELD);

    const early = emptyWorld();
    early.careOpen = true;
    early.peopleHeld = true;
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: CARE_DOOR.x, y: CARE_DOOR.y });
    expect(applyCarePeople(early, "a").players.get("a")?.heard).toBe(CARE_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.careOpen = true;
    gWorld.peopleHeld = true;
    gWorld.lastGodNamed = true;
    gWorld.players.set("g", { ...spawnGuest("g"), locked: true, x: CARE_DOOR.x, y: CARE_DOOR.y });
    expect(applyCarePeople(gWorld, "g").players.get("g")?.heard).toBe(CARE_PEOPLE_SPECTATOR);
    expect(gWorld.carePeopleHeld).toBe(false);
  });
});

describe("The shrine — people", () => {
  it("names the shrine as a house of people after the Care; keep still costs; guests cannot", () => {
    const w = emptyWorld();
    w.carePeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      bestand: 20,
      beats: { ...emptyBeats(), carePeople: true },
      x: SHRINE.x,
      y: SHRINE.y,
    });
    const named = applyRead(w, "a", SHRINE.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(SHRINE_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_SHRINE_PEOPLE);
    expect(p.beats.shrinePeople).toBe(true);
    expect(p.bestand).toBe(20);
    expect(named.shrinePeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.id === SHRINE.id)?.kind).toBe("shrine-people");
    expect(named.signs.find((s) => s.id === SHRINE.id)?.title).toBe(SHRINE_PEOPLE_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyShrinePeople(named, "a").players.get("a")?.heard).toBe(SHRINE_PEOPLE_HELD);
    const kept = applyShrine(named, "a");
    expect(kept.players.get("a")?.bestand).toBe(12);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: SHRINE.x, y: SHRINE.y });
    expect(applyShrinePeople(early, "a").players.get("a")?.heard).toBe(SHRINE_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.carePeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: SHRINE.x, y: SHRINE.y, locked: true });
    expect(applyShrinePeople(gWorld, "g").players.get("g")?.heard).toBe(SHRINE_PEOPLE_SPECTATOR);
    expect(gWorld.shrinePeopleHeld).toBe(false);
  });
});

describe("Safety — people", () => {
  it("names Safety as a house of people after the shrine; freeze still costs; guests cannot", () => {
    const w = emptyWorld();
    w.shrinePeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), shrinePeople: true },
      x: 192,
      y: 400,
    });
    const named = applyRead(w, "a", "safety-plaque");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(SAFETY_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_SAFETY_PEOPLE);
    expect(p.beats.safetyPeople).toBe(true);
    expect(named.safetyPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "safety-people")?.name).toBe("Safety — people");
    expect(named.signs.find((s) => s.id === "safety-people")?.title).toBe(SAFETY_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("freeze still costs");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applySafetyPeople(named, "a").players.get("a")?.heard).toBe(SAFETY_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: 192, y: 400 });
    expect(applySafetyPeople(early, "a").players.get("a")?.heard).toBe(SAFETY_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.shrinePeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: 192, y: 400, locked: true });
    expect(applySafetyPeople(gWorld, "g").players.get("g")?.heard).toBe(SAFETY_PEOPLE_SPECTATOR);
    expect(gWorld.safetyPeopleHeld).toBe(false);
  });
});

describe("DESK — people", () => {
  it("will not price people after Safety; TAKE stays disarmed; guests cannot", () => {
    const w = emptyWorld();
    w.safetyPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      bestand: 30,
      beats: { ...emptyBeats(), safetyPeople: true },
      x: CLAIMS_DESK.x,
      y: CLAIMS_DESK.y,
    });
    const named = applyRead(w, "a", CLAIMS_DESK.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(DESK_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_DESK_PEOPLE);
    expect(p.beats.deskPeople).toBe(true);
    expect(p.bestand).toBe(30);
    expect(named.deskPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "desk-people")?.name).toBe("DESK — people");
    expect(named.signs.find((s) => s.id === "desk-people")?.title).toBe(DESK_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("TAKE stays disarmed");
    expect(p.heard).not.toMatch(/heidegger|midgar|APY|yield/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyDeskPeople(named, "a").players.get("a")?.heard).toBe(DESK_PEOPLE_HELD);
    const filed = applyDesk(named, "a", "file");
    expect(filed.players.get("a")?.bestand).toBe(0);
    expect(filed.players.get("a")?.claims.length).toBe(1);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: CLAIMS_DESK.x, y: CLAIMS_DESK.y });
    expect(applyDeskPeople(early, "a").players.get("a")?.heard).toBe(DESK_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.safetyPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: CLAIMS_DESK.x, y: CLAIMS_DESK.y, locked: true });
    expect(applyDeskPeople(gWorld, "g").players.get("g")?.heard).toBe(DESK_PEOPLE_SPECTATOR);
    expect(gWorld.deskPeopleHeld).toBe(false);
  });
});

describe("The hall — people", () => {
  it("names the hall as a house of people after the desk; tithe still costs; guests cannot", () => {
    const w = emptyWorld();
    w.deskPeopleHeld = true;
    w.signs = [...w.signs, { id: HOUSE_HALL.id, title: "House of Mortals", text: "Hall.", x: HOUSE_HALL.x, y: HOUSE_HALL.y }];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      inCare: true,
      beats: { ...emptyBeats(), hall: true, deskPeople: true },
      x: HOUSE_HALL.x,
      y: HOUSE_HALL.y,
    });
    const named = applyRead(w, "a", HOUSE_HALL.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(HALL_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_HALL_PEOPLE);
    expect(p.beats.hallPeople).toBe(true);
    expect(named.hallPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "hall-people")?.name).toBe("The hall — people");
    expect(named.signs.find((s) => s.id === "hall-people")?.title).toBe(HALL_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Tithe still costs");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyHallPeople(named, "a").players.get("a")?.heard).toBe(HALL_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, inCare: true, x: HOUSE_HALL.x, y: HOUSE_HALL.y });
    expect(applyHallPeople(early, "a").players.get("a")?.heard).toBe(HALL_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.deskPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: HOUSE_HALL.x, y: HOUSE_HALL.y, locked: true });
    expect(applyHallPeople(gWorld, "g").players.get("g")?.heard).toBe(HALL_PEOPLE_SPECTATOR);
    expect(gWorld.hallPeopleHeld).toBe(false);
  });
});

describe("The Clearing — people", () => {
  it("names the Clearing as a house of people after the hall; guests cannot", () => {
    const w = emptyWorld();
    w.hallPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), hallPeople: true, garden: true, lastWord: true },
      x: CLEARING_RING.x,
      y: CLEARING_RING.y,
    });
    const named = applyClearing(w, "a", "keep");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(CLEARING_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_CLEARING_PEOPLE);
    expect(p.beats.clearingPeople).toBe(true);
    expect(named.clearingPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.id === CLEARING_RING.id)?.kind).toBe("clearing-people");
    expect(named.signs.find((s) => s.id === CLEARING_RING.id)?.title).toBe(CLEARING_PEOPLE_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyClearingPeople(named, "a").players.get("a")?.heard).toBe(CLEARING_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: CLEARING_RING.x, y: CLEARING_RING.y });
    expect(applyClearingPeople(early, "a").players.get("a")?.heard).toBe(CLEARING_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.hallPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: CLEARING_RING.x, y: CLEARING_RING.y, locked: true });
    expect(applyClearing(gWorld, "g", "keep").players.get("g")?.heard).toBe(CLEARING_SPECTATOR);
    expect(applyClearingPeople(gWorld, "g").players.get("g")?.heard).toBe(CLEARING_PEOPLE_SPECTATOR);
    expect(gWorld.clearingPeopleHeld).toBe(false);
  });
});

describe("Wet Grid — people", () => {
  it("names the street as people after the Clearing; flag still opts in; guests cannot", () => {
    const w = emptyWorld();
    w.clearingPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), clearingPeople: true },
      x: WET_GRID.x,
      y: WET_GRID.y,
    });
    const named = applyRead(w, "a", WET_GRID.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(WET_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_WET_PEOPLE);
    expect(p.beats.wetPeople).toBe(true);
    expect(named.wetPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.id === WET_GRID.id)?.kind).toBe("wet-people");
    expect(named.signs.find((s) => s.id === WET_GRID.id)?.title).toBe(WET_PEOPLE_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyWetPeople(named, "a").players.get("a")?.heard).toBe(WET_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: WET_GRID.x, y: WET_GRID.y });
    expect(applyWetPeople(early, "a").players.get("a")?.heard).toBe(WET_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.clearingPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: WET_GRID.x, y: WET_GRID.y, locked: true });
    expect(applyWetPeople(gWorld, "g").players.get("g")?.heard).toBe(WET_PEOPLE_SPECTATOR);
    expect(gWorld.wetPeopleHeld).toBe(false);
  });
});

describe("The stall — people", () => {
  it("names the stall as people after the Wet Grid; listing still costs; guests cannot", () => {
    const w = emptyWorld();
    w.wetPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), wetPeople: true },
      x: CLEARING_STALL.x,
      y: CLEARING_STALL.y,
    });
    const named = applyRead(w, "a", CLEARING_STALL.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(STALL_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_STALL_PEOPLE);
    expect(p.beats.stallPeople).toBe(true);
    expect(named.stallPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.id === CLEARING_STALL.id)?.kind).toBe("stall-people");
    expect(named.signs.find((s) => s.id === CLEARING_STALL.id)?.title).toBe(STALL_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Listing still costs");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyStallPeople(named, "a").players.get("a")?.heard).toBe(STALL_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: CLEARING_STALL.x, y: CLEARING_STALL.y });
    expect(applyStallPeople(early, "a").players.get("a")?.heard).toBe(STALL_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.wetPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: CLEARING_STALL.x, y: CLEARING_STALL.y, locked: true });
    expect(applyStallPeople(gWorld, "g").players.get("g")?.heard).toBe(STALL_PEOPLE_SPECTATOR);
    expect(gWorld.stallPeopleHeld).toBe(false);
  });
});

describe("The Foundry — people", () => {
  it("names the Foundry as people after the stall; unlight still works; guests cannot", () => {
    const w = emptyWorld();
    w.stallPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), stallPeople: true },
      x: ORGAN_FOUNDRY.x,
      y: ORGAN_FOUNDRY.y,
    });
    const named = applyFoundryPeople(w, "a");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(FOUNDRY_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_FOUNDRY_PEOPLE);
    expect(p.beats.foundryPeople).toBe(true);
    expect(named.foundryPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.id === ORGAN_FOUNDRY.id)?.kind).toBe("foundry-people");
    expect(named.signs.find((s) => s.id === ORGAN_FOUNDRY.id)?.title).toBe(FOUNDRY_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Unlight still works");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyFoundryPeople(named, "a").players.get("a")?.heard).toBe(FOUNDRY_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: ORGAN_FOUNDRY.x, y: ORGAN_FOUNDRY.y });
    expect(applyFoundryPeople(early, "a").players.get("a")?.heard).toBe(FOUNDRY_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.stallPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: ORGAN_FOUNDRY.x, y: ORGAN_FOUNDRY.y, locked: true });
    expect(applyFoundryPeople(gWorld, "g").players.get("g")?.heard).toBe(FOUNDRY_PEOPLE_SPECTATOR);
    expect(gWorld.foundryPeopleHeld).toBe(false);
  });
});

describe("The Strait — people", () => {
  it("names the Strait as people after the Foundry; refuse still works; guests cannot", () => {
    const w = emptyWorld();
    w.foundryPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), foundryPeople: true },
      x: ORGAN_STRAIT.x,
      y: ORGAN_STRAIT.y,
    });
    const named = applyStraitPeople(w, "a");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(STRAIT_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_STRAIT_PEOPLE);
    expect(p.beats.straitPeople).toBe(true);
    expect(named.straitPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.id === ORGAN_STRAIT.id)?.kind).toBe("strait-people");
    expect(named.signs.find((s) => s.id === ORGAN_STRAIT.id)?.title).toBe(STRAIT_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Refuse still works");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyStraitPeople(named, "a").players.get("a")?.heard).toBe(STRAIT_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: ORGAN_STRAIT.x, y: ORGAN_STRAIT.y });
    expect(applyStraitPeople(early, "a").players.get("a")?.heard).toBe(STRAIT_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.foundryPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: ORGAN_STRAIT.x, y: ORGAN_STRAIT.y, locked: true });
    expect(applyStraitPeople(gWorld, "g").players.get("g")?.heard).toBe(STRAIT_PEOPLE_SPECTATOR);
    expect(gWorld.straitPeopleHeld).toBe(false);
  });
});

describe("The Cable — people", () => {
  it("names the Cable as people after the Strait; quiet still works; guests cannot", () => {
    const w = emptyWorld();
    w.straitPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), straitPeople: true },
      x: ORGAN_CABLE.x,
      y: ORGAN_CABLE.y,
    });
    const named = applyCablePeople(w, "a");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(CABLE_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_CABLE_PEOPLE);
    expect(p.beats.cablePeople).toBe(true);
    expect(named.cablePeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.id === ORGAN_CABLE.id)?.kind).toBe("cable-people");
    expect(named.signs.find((s) => s.id === ORGAN_CABLE.id)?.title).toBe(CABLE_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Quiet still works");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyCablePeople(named, "a").players.get("a")?.heard).toBe(CABLE_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: ORGAN_CABLE.x, y: ORGAN_CABLE.y });
    expect(applyCablePeople(early, "a").players.get("a")?.heard).toBe(CABLE_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.straitPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: ORGAN_CABLE.x, y: ORGAN_CABLE.y, locked: true });
    expect(applyCablePeople(gWorld, "g").players.get("g")?.heard).toBe(CABLE_PEOPLE_SPECTATOR);
    expect(gWorld.cablePeopleHeld).toBe(false);
  });
});

describe("The organs — people", () => {
  it("gathers Foundry, Strait, and Cable as people in the hall; tithe still costs; guests cannot", () => {
    expect(
      organsPeopleReady({ foundryPeopleHeld: true, straitPeopleHeld: true, cablePeopleHeld: true }),
    ).toBe(true);
    expect(
      organsPeopleReady({ foundryPeopleHeld: true, straitPeopleHeld: true, cablePeopleHeld: false }),
    ).toBe(false);
    const w = emptyWorld();
    w.foundryPeopleHeld = true;
    w.straitPeopleHeld = true;
    w.cablePeopleHeld = true;
    w.signs = [...w.signs, { id: HOUSE_HALL.id, title: "House of Mortals", text: "Hall.", x: HOUSE_HALL.x, y: HOUSE_HALL.y }];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      inCare: true,
      beats: { ...emptyBeats(), hall: true },
      x: HOUSE_HALL.x,
      y: HOUSE_HALL.y,
    });
    const named = applyRead(w, "a", HOUSE_HALL.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(ORGANS_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_ORGANS_PEOPLE);
    expect(p.beats.organsPeople).toBe(true);
    expect(named.organsPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "organs-people")?.name).toBe("The organs — people");
    expect(named.signs.find((s) => s.id === "organs-people")?.title).toBe(ORGANS_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Tithe still costs");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyOrgansPeople(named, "a").players.get("a")?.heard).toBe(ORGANS_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: HOUSE_HALL.x, y: HOUSE_HALL.y });
    expect(applyOrgansPeople(early, "a").players.get("a")?.heard).toBe(ORGANS_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.foundryPeopleHeld = true;
    gWorld.straitPeopleHeld = true;
    gWorld.cablePeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: HOUSE_HALL.x, y: HOUSE_HALL.y, locked: true });
    expect(applyOrgansPeople(gWorld, "g").players.get("g")?.heard).toBe(ORGANS_PEOPLE_SPECTATOR);
    expect(gWorld.organsPeopleHeld).toBe(false);
  });
});

describe("Vesper — people", () => {
  it("names Vesper's desk as people after the organs; she will not sell a god; guests cannot", () => {
    const w = emptyWorld();
    w.organsPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), organsPeople: true },
      x: OPERATOR_DESK.x,
      y: OPERATOR_DESK.y,
    });
    const named = applyRead(w, "a", OPERATOR_DESK.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(VESPER_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_VESPER_PEOPLE);
    expect(p.beats.vesperPeople).toBe(true);
    expect(named.vesperPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "vesper-people")?.name).toBe("Vesper — people");
    expect(named.signs.find((s) => s.id === "vesper-people")?.title).toBe(VESPER_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("will not sell a god");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyVesperPeople(named, "a").players.get("a")?.heard).toBe(VESPER_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: OPERATOR_DESK.x, y: OPERATOR_DESK.y });
    expect(applyVesperPeople(early, "a").players.get("a")?.heard).toBe(VESPER_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.organsPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: OPERATOR_DESK.x, y: OPERATOR_DESK.y, locked: true });
    expect(applyVesperPeople(gWorld, "g").players.get("g")?.heard).toBe(VESPER_PEOPLE_SPECTATOR);
    expect(gWorld.vesperPeopleHeld).toBe(false);
  });
});

describe("M3 — people", () => {
  it("names M3 as people after Vesper; going-under still works; guests cannot", () => {
    const w = emptyWorld();
    w.vesperPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), vesperPeople: true },
      x: M3_DOOR.x,
      y: M3_DOOR.y,
    });
    const named = applyM3(w, "a");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(M3_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_M3_PEOPLE);
    expect(p.beats.m3People).toBe(true);
    expect(named.m3PeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.id === M3_DOOR.id)?.kind).toBe("m3-people");
    expect(named.signs.find((s) => s.id === M3_DOOR.id)?.title).toBe(M3_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Going-under still works");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyM3People(named, "a").players.get("a")?.heard).toBe(M3_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: M3_DOOR.x, y: M3_DOOR.y });
    expect(applyM3People(early, "a").players.get("a")?.heard).toBe(M3_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.vesperPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: M3_DOOR.x, y: M3_DOOR.y, locked: true });
    expect(applyM3(gWorld, "g").players.get("g")?.heard).toBe(M3_SPECTATOR);
    expect(applyM3People(gWorld, "g").players.get("g")?.heard).toBe(M3_PEOPLE_SPECTATOR);
    expect(gWorld.m3PeopleHeld).toBe(false);
  });
});

describe("Dispatch — people", () => {
  it("names the screening as people after M3; observer proximity still holds; guests cannot", () => {
    const w = emptyWorld();
    w.m3PeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), m3People: true },
      x: SCREENING.x,
      y: SCREENING.y,
    });
    const named = applyRead(w, "a", SCREENING.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(SCREENING_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_SCREENING_PEOPLE);
    expect(p.beats.screeningPeople).toBe(true);
    expect(named.screeningPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "screening-people")?.name).toBe("Dispatch — people");
    expect(named.signs.find((s) => s.id === "screening-people")?.title).toBe(SCREENING_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Observer proximity");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyScreeningPeople(named, "a").players.get("a")?.heard).toBe(SCREENING_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: SCREENING.x, y: SCREENING.y });
    expect(applyScreeningPeople(early, "a").players.get("a")?.heard).toBe(SCREENING_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.m3PeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: SCREENING.x, y: SCREENING.y, locked: true });
    expect(applyScreeningPeople(gWorld, "g").players.get("g")?.heard).toBe(SCREENING_PEOPLE_SPECTATOR);
    expect(gWorld.screeningPeopleHeld).toBe(false);
  });
});

describe("Annex — people", () => {
  it("names the Annex as people after the screening; freeze still costs; guests cannot", () => {
    const w = emptyWorld();
    w.screeningPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), screeningPeople: true },
      x: SAFETY_ANNEX.x,
      y: SAFETY_ANNEX.y,
    });
    const named = applyRead(w, "a", SAFETY_ANNEX.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(ANNEX_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_ANNEX_PEOPLE);
    expect(p.beats.annexPeople).toBe(true);
    expect(named.annexPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "annex-people")?.name).toBe("Annex — people");
    expect(named.signs.find((s) => s.id === "annex-people")?.title).toBe(ANNEX_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("freeze still costs");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyAnnexPeople(named, "a").players.get("a")?.heard).toBe(ANNEX_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: SAFETY_ANNEX.x, y: SAFETY_ANNEX.y });
    expect(applyAnnexPeople(early, "a").players.get("a")?.heard).toBe(ANNEX_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.screeningPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: SAFETY_ANNEX.x, y: SAFETY_ANNEX.y, locked: true });
    expect(applyAnnexPeople(gWorld, "g").players.get("g")?.heard).toBe(ANNEX_PEOPLE_SPECTATOR);
    expect(gWorld.annexPeopleHeld).toBe(false);
  });
});

describe("Arena — people", () => {
  it("names the arena as people after the Annex; practice still has no spoils; guests cannot", () => {
    const w = emptyWorld();
    w.annexPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), annexPeople: true },
      x: GUEST_ARENA.x,
      y: GUEST_ARENA.y,
    });
    const named = applyRead(w, "a", GUEST_ARENA.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(ARENA_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_ARENA_PEOPLE);
    expect(p.beats.arenaPeople).toBe(true);
    expect(named.arenaPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.id === GUEST_ARENA.id)?.kind).toBe("arena-people");
    expect(named.signs.find((s) => s.id === GUEST_ARENA.id)?.title).toBe(ARENA_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("no spoils");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyArenaPeople(named, "a").players.get("a")?.heard).toBe(ARENA_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: GUEST_ARENA.x, y: GUEST_ARENA.y });
    expect(applyArenaPeople(early, "a").players.get("a")?.heard).toBe(ARENA_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.annexPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: GUEST_ARENA.x, y: GUEST_ARENA.y, locked: true });
    expect(applyArenaPeople(gWorld, "g").players.get("g")?.heard).toBe(ARENA_PEOPLE_SPECTATOR);
    expect(gWorld.arenaPeopleHeld).toBe(false);
  });
});

describe("Going-under — people", () => {
  it("names going-under as people after the arena; the first hour still works; guests cannot", () => {
    const w = emptyWorld();
    w.arenaPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), arenaPeople: true },
      x: GOING_UNDER.x,
      y: GOING_UNDER.y,
    });
    const named = applyUnderPeople(w, "a");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(UNDER_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_UNDER_PEOPLE);
    expect(p.beats.underPeople).toBe(true);
    expect(named.underPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.id === "going-under")?.kind).toBe("under-people");
    expect(named.signs.find((s) => s.id === "going-under")?.title).toBe(UNDER_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("first hour still works");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyUnderPeople(named, "a").players.get("a")?.heard).toBe(UNDER_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: GOING_UNDER.x, y: GOING_UNDER.y });
    expect(applyUnderPeople(early, "a").players.get("a")?.heard).toBe(UNDER_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.arenaPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: GOING_UNDER.x, y: GOING_UNDER.y, locked: true });
    expect(applyUnderPeople(gWorld, "g").players.get("g")?.heard).toBe(UNDER_PEOPLE_SPECTATOR);
    expect(gWorld.underPeopleHeld).toBe(false);
  });
});

describe("Garden — people", () => {
  it("names the wreckage garden as people after going-under; bury still works; guests cannot", () => {
    const w = emptyWorld();
    w.underPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), underPeople: true },
      x: WRECK_GARDEN.x,
      y: WRECK_GARDEN.y,
    });
    const named = applyGardenPeople(w, "a");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(GARDEN_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_GARDEN_PEOPLE);
    expect(p.beats.gardenPeople).toBe(true);
    expect(named.gardenPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.id === WRECK_GARDEN.id)?.kind).toBe("garden-people");
    expect(named.signs.find((s) => s.id === WRECK_GARDEN.id)?.title).toBe(GARDEN_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Bury still works");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyGardenPeople(named, "a").players.get("a")?.heard).toBe(GARDEN_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: WRECK_GARDEN.x, y: WRECK_GARDEN.y });
    expect(applyGardenPeople(early, "a").players.get("a")?.heard).toBe(GARDEN_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.underPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: WRECK_GARDEN.x, y: WRECK_GARDEN.y, locked: true });
    expect(applyGardenPeople(gWorld, "g").players.get("g")?.heard).toBe(GARDEN_PEOPLE_SPECTATOR);
    expect(gWorld.gardenPeopleHeld).toBe(false);
  });
});

describe("The plot — people", () => {
  it("names the unnamed plot as people after the garden; bury still works; guests cannot", () => {
    const w = emptyWorld();
    w.gardenPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), gardenPeople: true },
      x: BURIAL_PLOT.x,
      y: BURIAL_PLOT.y,
    });
    const named = applyBury(w, "a");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(BURIAL_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_BURIAL_PEOPLE);
    expect(p.beats.burialPeople).toBe(true);
    expect(p.beats.burial).toBe(false);
    expect(named.burialPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "burial-people")?.name).toBe("The plot — people");
    expect(named.signs.find((s) => s.id === BURIAL_PLOT.id)?.title).toBe(BURIAL_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Bury still works");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyBurialPeople(named, "a").players.get("a")?.heard).toBe(BURIAL_PEOPLE_HELD);
    const buried = applyBury(named, "a");
    expect(buried.players.get("a")?.beats.burial).toBe(true);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: BURIAL_PLOT.x, y: BURIAL_PLOT.y });
    expect(applyBurialPeople(early, "a").players.get("a")?.heard).toBe(BURIAL_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.gardenPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: BURIAL_PLOT.x, y: BURIAL_PLOT.y, locked: true });
    expect(applyBurialPeople(gWorld, "g").players.get("g")?.heard).toBe(BURIAL_PEOPLE_SPECTATOR);
    expect(gWorld.burialPeopleHeld).toBe(false);
  });
});

describe("Weather — people", () => {
  it("names the weather as people after the plot; naming still happens by speaking; guests cannot", () => {
    const w = emptyWorld();
    w.burialPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), burialPeople: true },
      x: 192,
      y: 340,
    });
    const named = applyRead(w, "a", "weather");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(WEATHER_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_WEATHER_PEOPLE);
    expect(p.beats.weatherPeople).toBe(true);
    expect(named.weatherPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.id === "weather")?.kind).toBe("weather-people");
    expect(named.signs.find((s) => s.id === "weather")?.title).toBe(WEATHER_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("speaking");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyWeatherPeople(named, "a").players.get("a")?.heard).toBe(WEATHER_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: 192, y: 340 });
    expect(applyWeatherPeople(early, "a").players.get("a")?.heard).toBe(WEATHER_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.burialPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: 192, y: 340, locked: true });
    expect(applyWeatherPeople(gWorld, "g").players.get("g")?.heard).toBe(WEATHER_PEOPLE_SPECTATOR);
    expect(gWorld.weatherPeopleHeld).toBe(false);
  });
});

describe("The Nave — people", () => {
  it("gathers the Nave as people after the weather; extract still costs; guests cannot", () => {
    const w = emptyWorld();
    w.weatherPeopleHeld = true;
    w.signs = [...w.signs, { id: "weather", title: "Weather — people", text: "People.", x: 192, y: 340 }];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), weatherPeople: true },
      x: 192,
      y: 340,
    });
    const named = applyRead(w, "a", "weather");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(NAVE_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_NAVE_PEOPLE);
    expect(p.beats.navePeople).toBe(true);
    expect(named.navePeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "nave-people")?.name).toBe("The Nave — people");
    expect(named.signs.find((s) => s.id === "nave-people")?.title).toBe(NAVE_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Extract still costs");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyNavePeople(named, "a").players.get("a")?.heard).toBe(NAVE_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: 192, y: 340 });
    expect(applyNavePeople(early, "a").players.get("a")?.heard).toBe(NAVE_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.weatherPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: 192, y: 340, locked: true });
    expect(applyNavePeople(gWorld, "g").players.get("g")?.heard).toBe(NAVE_PEOPLE_SPECTATOR);
    expect(gWorld.navePeopleHeld).toBe(false);
  });
});

describe("Credits — people", () => {
  it("names credits as people after the Nave; TAKE stays disarmed; guests cannot", () => {
    const w = emptyWorld();
    w.navePeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), navePeople: true },
      x: CLEARING_RING.x,
      y: CLEARING_RING.y,
    });
    const named = applyClearing(w, "a", "keep");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(CREDITS_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_CREDITS_PEOPLE);
    expect(p.beats.creditsPeople).toBe(true);
    expect(named.creditsPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "credits-people")?.name).toBe("Credits — people");
    expect(named.signs.find((s) => s.id === "credits-people")?.title).toBe(CREDITS_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("TAKE stays disarmed");
    expect(p.heard).not.toMatch(/heidegger|midgar|APY/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyCreditsPeople(named, "a").players.get("a")?.heard).toBe(CREDITS_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: CLEARING_RING.x, y: CLEARING_RING.y });
    expect(applyCreditsPeople(early, "a").players.get("a")?.heard).toBe(CREDITS_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.navePeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: CLEARING_RING.x, y: CLEARING_RING.y, locked: true });
    expect(applyCreditsPeople(gWorld, "g").players.get("g")?.heard).toBe(CREDITS_PEOPLE_SPECTATOR);
    expect(gWorld.creditsPeopleHeld).toBe(false);
  });
});

describe("The still — people", () => {
  it("names the still as people after credits; optional Wink still optional; guests cannot", () => {
    const w = emptyWorld();
    w.creditsPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), creditsPeople: true },
      x: STILL.x,
      y: STILL.y,
    });
    const named = applyStillPeople(w, "a");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(STILL_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_STILL_PEOPLE);
    expect(p.beats.stillPeople).toBe(true);
    expect(named.stillPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "still-people")?.name).toBe("The still — people");
    expect(named.signs.find((s) => s.id === "still-people")?.title).toBe(STILL_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Optional Wink still optional");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyStillPeople(named, "a").players.get("a")?.heard).toBe(STILL_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: STILL.x, y: STILL.y });
    expect(applyStillPeople(early, "a").players.get("a")?.heard).toBe(STILL_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.creditsPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: STILL.x, y: STILL.y, locked: true });
    expect(applyStillPeople(gWorld, "g").players.get("g")?.heard).toBe(STILL_PEOPLE_SPECTATOR);
    expect(gWorld.stillPeopleHeld).toBe(false);
  });
});

describe("The season — people", () => {
  it("names the residual season as people after the still; flag still opts in; guests cannot", () => {
    const w = emptyWorld();
    w.stillPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), stillPeople: true },
      x: WET_GRID.x,
      y: WET_GRID.y,
    });
    const named = applyRead(w, "a", WET_GRID.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(SEASON_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_SEASON_PEOPLE);
    expect(p.beats.seasonPeople).toBe(true);
    expect(named.seasonPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "season-people")?.name).toBe("The season — people");
    expect(named.signs.find((s) => s.id === "season-people")?.title).toBe(SEASON_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Flag still opts in");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applySeasonPeople(named, "a").players.get("a")?.heard).toBe(SEASON_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: WET_GRID.x, y: WET_GRID.y });
    expect(applySeasonPeople(early, "a").players.get("a")?.heard).toBe(SEASON_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.stillPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: WET_GRID.x, y: WET_GRID.y, locked: true });
    expect(applySeasonPeople(gWorld, "g").players.get("g")?.heard).toBe(SEASON_PEOPLE_SPECTATOR);
    expect(gWorld.seasonPeopleHeld).toBe(false);
  });
});

describe("The bracket — people", () => {
  it("names the bracket as people after the season; serials stay visible; guests cannot", () => {
    const w = emptyWorld();
    w.seasonPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), seasonPeople: true },
      x: WET_GRID.x,
      y: WET_GRID.y,
    });
    const named = applyRead(w, "a", WET_GRID.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(BRACKET_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_BRACKET_PEOPLE);
    expect(p.beats.bracketPeople).toBe(true);
    expect(named.bracketPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "bracket-people")?.name).toBe("The bracket — people");
    expect(named.signs.find((s) => s.id === "bracket-people")?.title).toBe(BRACKET_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Serials stay visible");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyBracketPeople(named, "a").players.get("a")?.heard).toBe(BRACKET_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: WET_GRID.x, y: WET_GRID.y });
    expect(applyBracketPeople(early, "a").players.get("a")?.heard).toBe(BRACKET_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.seasonPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: WET_GRID.x, y: WET_GRID.y, locked: true });
    expect(applyBracketPeople(gWorld, "g").players.get("g")?.heard).toBe(BRACKET_PEOPLE_SPECTATOR);
    expect(gWorld.bracketPeopleHeld).toBe(false);
  });
});

describe("The log — people", () => {
  it("names the history log as people after the bracket; uniqueness still a log; guests cannot", () => {
    const w = emptyWorld();
    w.bracketPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), bracketPeople: true },
      x: SCREENING.x,
      y: SCREENING.y,
    });
    const named = applyRead(w, "a", SCREENING.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(LOG_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_LOG_PEOPLE);
    expect(p.beats.logPeople).toBe(true);
    expect(named.logPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "log-people")?.name).toBe("The log — people");
    expect(named.signs.find((s) => s.id === "log-people")?.title).toBe(LOG_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("log still holds");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyLogPeople(named, "a").players.get("a")?.heard).toBe(LOG_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: SCREENING.x, y: SCREENING.y });
    expect(applyLogPeople(early, "a").players.get("a")?.heard).toBe(LOG_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.bracketPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: SCREENING.x, y: SCREENING.y, locked: true });
    expect(applyLogPeople(gWorld, "g").players.get("g")?.heard).toBe(LOG_PEOPLE_SPECTATOR);
    expect(gWorld.logPeopleHeld).toBe(false);
  });
});

describe("Founder — people", () => {
  it("names Founder as people after the log; proximity still holds; guests cannot", () => {
    const w = emptyWorld();
    w.logPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), logPeople: true },
      x: SCREENING.x,
      y: SCREENING.y,
    });
    const named = applyFounderPeople(w, "a");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(FOUNDER_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_FOUNDER_PEOPLE);
    expect(p.beats.founderPeople).toBe(true);
    expect(named.founderPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "founder-people")?.name).toBe("Founder — people");
    expect(named.signs.find((s) => s.id === "founder-people")?.title).toBe(FOUNDER_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Proximity still holds");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyFounderPeople(named, "a").players.get("a")?.heard).toBe(FOUNDER_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: SCREENING.x, y: SCREENING.y });
    expect(applyFounderPeople(early, "a").players.get("a")?.heard).toBe(FOUNDER_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.logPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: SCREENING.x, y: SCREENING.y, locked: true });
    expect(applyFounderPeople(gWorld, "g").players.get("g")?.heard).toBe(FOUNDER_PEOPLE_SPECTATOR);
    expect(gWorld.founderPeopleHeld).toBe(false);
  });
});

describe("The rooms — people", () => {
  it("gathers Observer, Participant, Founder as people; proximity still holds; guests cannot", () => {
    const w = emptyWorld();
    w.founderPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), founderPeople: true },
      x: SCREENING.x,
      y: SCREENING.y,
    });
    const named = applyRead(w, "a", SCREENING.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(ROOMS_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_ROOMS_PEOPLE);
    expect(p.beats.roomsPeople).toBe(true);
    expect(named.roomsPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "rooms-people")?.name).toBe("The rooms — people");
    expect(named.signs.find((s) => s.id === "rooms-people")?.title).toBe(ROOMS_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Proximity still holds");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyRoomsPeople(named, "a").players.get("a")?.heard).toBe(ROOMS_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: SCREENING.x, y: SCREENING.y });
    expect(applyRoomsPeople(early, "a").players.get("a")?.heard).toBe(ROOMS_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.founderPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: SCREENING.x, y: SCREENING.y, locked: true });
    expect(applyRoomsPeople(gWorld, "g").players.get("g")?.heard).toBe(ROOMS_PEOPLE_SPECTATOR);
    expect(gWorld.roomsPeopleHeld).toBe(false);
  });
});

describe("Storm — people", () => {
  it("names the failed hole as people after the rooms; Storm still burns readiness; guests cannot", () => {
    const w = emptyWorld();
    w.roomsPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), roomsPeople: true },
      x: CLEARING_RING.x,
      y: CLEARING_RING.y,
    });
    const named = applyClearing(w, "a", "keep");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(STORM_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_STORM_PEOPLE);
    expect(p.beats.stormPeople).toBe(true);
    expect(named.stormPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "storm-people")?.name).toBe("Storm — people");
    expect(named.signs.find((s) => s.id === "storm-people")?.title).toBe(STORM_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Storm still burns");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyStormPeople(named, "a").players.get("a")?.heard).toBe(STORM_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: CLEARING_RING.x, y: CLEARING_RING.y });
    expect(applyStormPeople(early, "a").players.get("a")?.heard).toBe(STORM_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.roomsPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: CLEARING_RING.x, y: CLEARING_RING.y, locked: true });
    expect(applyStormPeople(gWorld, "g").players.get("g")?.heard).toBe(STORM_PEOPLE_SPECTATOR);
    expect(gWorld.stormPeopleHeld).toBe(false);
  });
});

describe("The bounty — people", () => {
  it("names the bounty as people after Storm; one omen one purse; guests cannot", () => {
    const w = emptyWorld();
    w.stormPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), stormPeople: true, hall: true },
      inCare: true,
      x: HOUSE_HALL.x,
      y: HOUSE_HALL.y,
    });
    const named = applyBountyPeople(w, "a");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(BOUNTY_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_BOUNTY_PEOPLE);
    expect(p.beats.bountyPeople).toBe(true);
    expect(named.bountyPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "bounty-people")?.name).toBe("The bounty — people");
    expect(named.signs.find((s) => s.id === "bounty-people")?.title).toBe(BOUNTY_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("One omen, one purse");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyBountyPeople(named, "a").players.get("a")?.heard).toBe(BOUNTY_PEOPLE_HELD);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: HOUSE_HALL.x, y: HOUSE_HALL.y });
    expect(applyBountyPeople(early, "a").players.get("a")?.heard).toBe(BOUNTY_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.stormPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: HOUSE_HALL.x, y: HOUSE_HALL.y, locked: true });
    expect(applyBountyPeople(gWorld, "g").players.get("g")?.heard).toBe(BOUNTY_PEOPLE_SPECTATOR);
    expect(gWorld.bountyPeopleHeld).toBe(false);
  });
});

describe("Flag — people", () => {
  it("names the flag as people after bounty; guests cannot; protocol reject; flag still opts in", () => {
    const w = emptyWorld();
    w.bountyPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), bountyPeople: true },
      x: WET_GRID.x,
      y: WET_GRID.y,
    });
    const named = applyRead(w, "a", WET_GRID.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(FLAG_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_FLAG_PEOPLE);
    expect(p.beats.flagPeople).toBe(true);
    expect(named.flagPeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "flag-people")?.name).toBe("Flag — people");
    expect(named.signs.find((s) => s.id === "flag-people")?.title).toBe(FLAG_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Flag still opts in");
    expect(p.heard).toContain("Guests are not loot");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyFlagPeople(named, "a").players.get("a")?.heard).toBe(FLAG_PEOPLE_HELD);

    const flagged = applyFlag(named, "a");
    expect(flagged.players.get("a")?.flagged).toBe(true);
    expect(flagged.players.get("a")?.heard).toBe(FLAG_COPY);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: WET_GRID.x, y: WET_GRID.y });
    expect(applyFlagPeople(early, "a").players.get("a")?.heard).toBe(FLAG_PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.bountyPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: WET_GRID.x, y: WET_GRID.y, locked: true });
    expect(applyFlagPeople(gWorld, "g").players.get("g")?.heard).toBe(FLAG_PEOPLE_SPECTATOR);
    expect(gWorld.flagPeopleHeld).toBe(false);
  });
});

describe("Truce — people", () => {
  it("names the truce as people after the flag; both stay flagged until the truce; guests cannot", () => {
    const w = emptyWorld();
    w.flagPeopleHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      flagged: true,
      beats: { ...emptyBeats(), flagPeople: true },
      x: 720,
      y: 520,
    });
    w.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      serial: 2,
      flagged: true,
      x: 736,
      y: 520,
    });
    const named = applyTruce(w, "a");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(TRUCE_PEOPLE_COPY);
    expect(p.wink).toBe(WINK_TRUCE_PEOPLE);
    expect(p.beats.trucePeople).toBe(true);
    expect(p.flagged).toBe(true);
    expect(named.players.get("b")?.flagged).toBe(true);
    expect(named.trucePeopleHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "truce-people")?.name).toBe("Truce — people");
    expect(named.signs.find((s) => s.id === "truce-people")?.title).toBe(TRUCE_PEOPLE_PLAQUE.title);
    expect(p.heard).toContain("Both unflag");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyTrucePeople(named, "a").players.get("a")?.heard).toBe(TRUCE_PEOPLE_HELD);

    const truced = applyTruce(named, "a");
    expect(truced.players.get("a")?.flagged).toBe(false);
    expect(truced.players.get("b")?.flagged).toBe(false);
    expect(truced.players.get("a")?.heard).toBe(TRUCE_COPY);

    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, flagged: true, x: 720, y: 520 });
    early.players.set("b", { ...spawnGuest("b"), guest: false, flagged: true, x: 736, y: 520 });
    expect(applyTrucePeople(early, "a").players.get("a")?.heard).toBe(TRUCE_PEOPLE_NEED);

    const nomate = emptyWorld();
    nomate.flagPeopleHeld = true;
    nomate.players.set("a", { ...spawnGuest("a"), guest: false, flagged: true, x: 720, y: 520 });
    expect(applyTrucePeople(nomate, "a").players.get("a")?.heard).toBe(TRUCE_PEOPLE_MATE);

    const gWorld = emptyWorld();
    gWorld.flagPeopleHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: 720, y: 520, locked: true, flagged: true });
    expect(applyTrucePeople(gWorld, "g").players.get("g")?.heard).toBe(TRUCE_PEOPLE_SPECTATOR);
    expect(gWorld.trucePeopleHeld).toBe(false);
  });
});

describe("Storm vs high-progress", () => {
  it("skims geared graves, not fallen ones, and does not buy damage", () => {
    expect(stormProgress({ guest: false, bestand: STORM_GEAR, fakeWinke: 0 })).toBe(true);
    expect(stormProgress({ guest: false, bestand: 0, fakeWinke: 1 })).toBe(true);
    expect(stormProgress({ guest: true, bestand: 99, fakeWinke: 2 })).toBe(false);
    expect(alreadyFallen({ hp: 10, x: 0, y: 0 }, [])).toBe(true);
    expect(alreadyFallen({ hp: 80, x: 0, y: 0 }, [])).toBe(false);

    const w = emptyWorld();
    w.players.set("a", { ...spawnGuest("a"), guest: false, storm: true, x: 200, y: 480 });
    w.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      hp: 80,
      bestand: 40,
      fakeWinke: 1,
      x: 220,
      y: 480,
    });
    const press = applyStrike(w, "a");
    expect(press.players.get("b")?.hp).toBe(80 - 22);
    expect(press.players.get("b")?.heard).toBe(STORM_PRESS);
    expect(press.players.get("b")?.damaged).toBe(1);
    expect(press.players.get("a")?.heard).toBe(STORM_PRESS);
    expect(press.players.get("a")?.wink).toBe(WINK_STORM_PRESS);
    expect(press.stormPressHeld).toBe(true);
    expect(press.pois.find((poi) => poi.kind === "storm-progress")?.x).toBe(220);
    expect(press.signs.find((s) => s.id === "storm-progress")?.title).toBe(STORM_PROGRESS_PLAQUE.title);
    expect(press.players.get("a")?.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(press.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(press.players.get("a")!)).toBe(false);

    const kill = emptyWorld();
    kill.players.set("a", { ...spawnGuest("a"), guest: false, storm: true, flagged: true, x: 200, y: 480 });
    kill.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      flagged: true,
      hp: 20,
      bestand: 100,
      x: 220,
      y: 480,
    });
    const skim = applyStrike(kill, "a");
    expect(skim.players.get("a")?.heard).toBe(STORM_SKIM_COPY);
    expect(skim.players.get("a")?.bestand).toBe(Math.floor(100 * 0.3) + Math.floor(100 * STORM_SKIM));
    expect(damageFor(skim.players.get("a")!)).toBe(damageFor(spawnGuest("g")));

    const rag = emptyWorld();
    rag.wreckage = [{ id: "g", x: 220, y: 480, fromId: "z", fromName: "Angel", until: 40 }];
    rag.players.set("a", { ...spawnGuest("a"), guest: false, storm: true, x: 200, y: 480 });
    rag.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      hp: 80,
      bestand: 40,
      x: 220,
      y: 480,
    });
    const weak = applyStrike(rag, "a");
    expect(weak.players.get("a")?.heard).toBe(STORM_FALLEN);
    expect(weak.players.get("b")?.hp).toBe(80 - 22);
    expect(weak.stormPressHeld).toBe(false);
    expect(guestCanClaim(weak.players.get("b")!)).toBe(false);
  });
});

describe("Vesper will not sell the last god", () => {
  it("closes the yield desk after absence is named; guests cannot", () => {
    const w = emptyWorld();
    w.lastGodNamed = true;
    w.vesperAtFoundry = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), lastGod: true, yield: true, cold: true },
      x: OPERATOR_DESK.x,
      y: OPERATOR_DESK.y,
    });
    const closed = applyRead(w, "a", OPERATOR_DESK.id);
    const p = closed.players.get("a")!;
    expect(p.heard).toBe(VESPER_NOGOD);
    expect(p.wink).toBe(WINK_NOGOD);
    expect(p.beats.vesperNoGod).toBe(true);
    expect(closed.vesperNoGod).toBe(true);
    expect(closed.pois.find((poi) => poi.id === OPERATOR_DESK.id)?.kind).toBe("operator-no-god");
    expect(closed.signs.find((s) => s.id === OPERATOR_DESK.id)?.title).toBe(NOGOD_PLAQUE.title);
    const vesper = liveNpcs(false, false, false, false, true, false, false, false, false, false, false, true).find((n) => n.id === "vesper")!;
    expect(vesper.role).toBe("Will not sell it");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyVesperNoGod(closed, "a").players.get("a")?.heard).toBe(VESPER_NOGOD_LATER);

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      x: OPERATOR_DESK.x,
      y: OPERATOR_DESK.y,
    });
    expect(applyVesperNoGod(early, "a").players.get("a")?.heard).toBe(VESPER_NOGOD_NEED);

    const gWorld = emptyWorld();
    gWorld.lastGodNamed = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: OPERATOR_DESK.x, y: OPERATOR_DESK.y, locked: true });
    expect(applyVesperNoGod(gWorld, "g").players.get("g")?.heard).toBe(VESPER_NOGOD_SPECTATOR);
    expect(gWorld.vesperNoGod).toBe(false);
  });
});

describe("Safety Annex freeze", () => {
  function angelAtAnnex(hall = true) {
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), hall, care: true, under: true, nara: true, quill: true, ord: true, burial: true },
      inCare: false,
      bestand: 20,
      x: SAFETY_ANNEX.x,
      y: SAFETY_ANNEX.y,
    });
    return w;
  }

  it("Passing starts ready and is not starved", () => {
    const snap = snapshot(emptyWorld());
    expect(snap.passing.ready).toBe(PASSING_READY);
    expect(snap.passing.starved).toBe(false);
    expect(snap.frozen).toBe(false);
  });

  it("Angel who read the hall may sign; freeze starves the Passing and blocks extract", () => {
    const w = angelAtAnnex(true);
    const after = applyFreeze(w, "a");
    const p = after.players.get("a")!;
    expect(p.beats.freeze).toBe(true);
    expect(p.heard).toBe(FREEZE_COPY);
    expect(p.bestand).toBe(20 - FREEZE_COST);
    expect(FREEZE_COST).toBe(10);
    expect(p.wink).toBe(WINK_FREEZE);
    expect(after.frozen).toBe(true);
    expect(after.passing.starved).toBe(true);
    expect(after.passing.ready).toBe(0);
    expect(after.pois.find((poi) => poi.id === SAFETY_ANNEX.id)?.kind).toBe("safety-frozen");
    expect(p.heard).not.toMatch(/heidegger|katechon|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("b")));
    expect(guestCanClaim(p)).toBe(false);

    const node = after.nodes[0];
    after.players.set("a", { ...p, x: node.x, y: node.y });
    const blocked = applyUse(after, "a", node.id, "extract");
    expect(blocked.players.get("a")?.bestand).toBe(20 - FREEZE_COST);
    expect(blocked.nodes[0].depleted).toBe(false);
    expect(blocked.players.get("a")?.heard).toBe(FREEZE_EXTRACT);

    const poor = angelAtAnnex(true);
    poor.players.set("a", { ...poor.players.get("a")!, bestand: 4 });
    const unpaid = applyFreeze(poor, "a");
    expect(unpaid.frozen).toBe(false);
    expect(unpaid.players.get("a")?.heard).toBe(FREEZE_NEED);
    expect(unpaid.players.get("a")?.bestand).toBe(4);
    expect(unpaid.players.get("a")?.beats.freeze).toBe(false);
  });

  it("without the hall the Annex refuses the signature", () => {
    const w = angelAtAnnex(false);
    const after = applyFreeze(w, "a");
    expect(after.frozen).toBe(false);
    expect(after.passing.starved).toBe(false);
    expect(after.players.get("a")?.heard).toBe(FREEZE_NEED_HALL);
    expect(after.players.get("a")?.beats.freeze).toBe(false);
  });

  it("guest cannot sign the freeze", () => {
    const w = emptyWorld();
    w.players.set("g", { ...spawnGuest("g"), x: SAFETY_ANNEX.x, y: SAFETY_ANNEX.y, locked: true });
    const after = applyFreeze(w, "g");
    expect(after.frozen).toBe(false);
    expect(after.players.get("g")?.heard).toBe(FREEZE_SPECTATOR);
    expect(after.players.get("g")?.wink).toBe("");
    expect(guestCanClaim(after.players.get("g")!)).toBe(false);
  });
});

describe("Iridescent Clearing listing", () => {
  function angelAtStall(hall = true, extra: Partial<ReturnType<typeof spawnGuest>> = {}) {
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), hall, nara: true, quill: true, ord: true, burial: true },
      x: CLEARING_STALL.x,
      y: CLEARING_STALL.y,
      ...extra,
    });
    return w;
  }

  it("hall-read Angel sees the listing Wink; buying a copy does not open the Clearing", () => {
    const w = angelAtStall(true, { bestand: 80 });
    const listed = applyMarket(w, "a");
    const p = listed.players.get("a")!;
    expect(p.beats.market).toBe(true);
    expect(p.heard).toBe(MARKET_LISTING);
    expect(p.wink).toBe(WINK_MARKET);
    expect(listed.clearingOpen).toBe(false);
    expect(CLEARING_PRICE).toBe(40);

    const bought = applyMarket(listed, "a");
    const b = bought.players.get("a")!;
    expect(b.bestand).toBe(40);
    expect(b.aura).toBe(auraSeed(TEST_SERIAL) - 2);
    expect(b.heard).toBe(MARKET_BUY);
    expect(bought.clearingOpen).toBe(false);
    expect(damageFor(b)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(b)).toBe(false);
  });

  it("without the hall the stall is unread; guests never hear the Wink", () => {
    const closed = applyMarket(angelAtStall(false), "a");
    expect(closed.players.get("a")?.heard).toBe(MARKET_NEED_HALL);
    expect(closed.players.get("a")?.beats.market).toBe(false);

    const w = emptyWorld();
    w.players.set("g", { ...spawnGuest("g"), x: CLEARING_STALL.x, y: CLEARING_STALL.y });
    const after = applyMarket(w, "g");
    expect(after.players.get("g")?.heard).toBe(MARKET_SPECTATOR);
    expect(after.players.get("g")?.wink).toBe("");
    expect(after.clearingOpen).toBe(false);
    expect(guestCanClaim(after.players.get("g")!)).toBe(false);
  });
});

describe("Vesper Hale private yield", () => {
  function angelAtDesk(hall = true) {
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), hall, nara: true, quill: true, ord: true, burial: true, under: true, care: true },
      inCare: true,
      x: OPERATOR_DESK.x,
      y: OPERATOR_DESK.y,
    });
    return w;
  }

  it("offer then take funds Movement III the Cold way without buying damage", () => {
    const heard = applyOperator(angelAtDesk(true), "a", "hear");
    const p = heard.players.get("a")!;
    expect(p.heard).toBe(OPERATOR_OFFER);
    expect(p.wink).toBe(WINK_OPERATOR);
    expect(p.beats.yield).toBe(true);
    expect(heard.m3Open).toBe(false);

    const took = applyOperator(heard, "a", "take");
    const t = took.players.get("a")!;
    expect(t.bestand).toBe(PRIVATE_YIELD);
    expect(t.current).toBe("cold");
    expect(t.beats.cold).toBe(true);
    expect(t.heard).toBe(OPERATOR_TAKE);
    expect(took.m3Open).toBe(true);
    expect(took.pois.find((poi) => poi.id === M3_DOOR.id)?.kind).toBe("m3-open");
    expect(took.gestell).toBeGreaterThan(heard.gestell);
    expect(damageFor(t)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(t)).toBe(false);
    expect(t.heard).not.toMatch(/heidegger|sephiroth|\$REVERIE/i);
  });

  it("refuse is Readiness and does not open Movement III", () => {
    const heard = applyOperator(angelAtDesk(true), "a", "hear");
    const refused = applyOperator(heard, "a", "refuse");
    const p = refused.players.get("a")!;
    expect(p.current).toBe("readiness");
    expect(p.beats.refuse).toBe(true);
    expect(p.heard).toBe(OPERATOR_REFUSE);
    expect(p.bestand).toBe(0);
    expect(refused.m3Open).toBe(false);
    expect(guestCanClaim(p)).toBe(false);
  });

  it("hall is required; guests never hear the Wink", () => {
    expect(applyOperator(angelAtDesk(false), "a", "hear").players.get("a")?.heard).toBe(OPERATOR_NEED_HALL);
    const w = emptyWorld();
    w.players.set("g", { ...spawnGuest("g"), x: OPERATOR_DESK.x, y: OPERATOR_DESK.y, locked: true });
    const after = applyOperator(w, "g", "take");
    expect(after.players.get("g")?.heard).toBe(OPERATOR_SPECTATOR);
    expect(after.players.get("g")?.wink).toBe("");
    expect(after.m3Open).toBe(false);
    expect(guestCanClaim(after.players.get("g")!)).toBe(false);
  });
});

describe("Movement III organs", () => {
  const ready = {
    guest: false,
    serial: TEST_SERIAL,
    aura: auraSeed(TEST_SERIAL),
    beats: { ...emptyBeats(), nara: true, quill: true, ord: true, burial: true, hall: true, under: true, care: true, yield: true },
  };

  function funded() {
    const w = emptyWorld();
    w.players.set("a", { ...spawnGuest("a"), ...ready, x: OPERATOR_DESK.x, y: OPERATOR_DESK.y, inCare: true });
    return applyOperator(applyOperator(w, "a", "hear"), "a", "take");
  }

  it("going-under plants the wrecked Clearing; Nara is silent until burial", () => {
    const nara = NAVE_NPCS.find((n) => n.id === "nara")!;
    const w = placeNear("a", GOING_UNDER.x, GOING_UNDER.y, {
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), nara: true, quill: true, ord: true, burial: true },
    });
    const under = applyGoingUnder(w, "a");
    expect(under.rites.find((r) => r.kind === "garden")?.done).toBe(false);
    expect(under.pois.find((p) => p.id === WRECK_GARDEN.id)?.name).toBe("Wreckage garden");
    under.players.set("a", { ...under.players.get("a")!, x: nara.x, y: nara.y });
    const silent = applyTalk(under, "a", "nara");
    expect(silent.players.get("a")?.heard).toBe(NARA_SILENCE);
    silent.players.set("a", { ...silent.players.get("a")!, x: WRECK_GARDEN.x, y: WRECK_GARDEN.y });
    const buried = applyBury(silent, "a");
    const p = buried.players.get("a")!;
    expect(p.beats.garden).toBe(true);
    expect(p.heard).toBe(GARDEN_BURY);
    expect(p.wink).toBe(WINK_GARDEN);
    expect(buried.rites.find((r) => r.kind === "garden")?.done).toBe(true);
    buried.players.set("a", { ...p, x: nara.x, y: nara.y });
    const after = applyTalk(buried, "a", "nara");
    expect(after.players.get("a")?.heard).toBe(NARA_AFTER_GARDEN);
    expect(guestCanClaim(p)).toBe(false);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));

    const marked = applyTalk(after, "a", "nara");
    const m = marked.players.get("a")!;
    expect(m.heard).toBe(NARA_MARK);
    expect(m.cultMark).toBe(true);
    expect(m.cultWink).toBe(true);
    expect(m.wink).toBe(WINK_SEXTON);
    expect(marked.naraAtStrait).toBe(true);
    expect(marked.pois.find((poi) => poi.id === WRECK_GARDEN.id)?.kind).toBe("sexton-mark");
    const naraMoved = liveNpcs(false, false, true).find((n) => n.id === "nara")!;
    expect(naraMoved.role).toBe("At the Strait");
    marked.players.set("a", { ...m, x: naraMoved.x, y: naraMoved.y });
    expect(applyTalk(marked, "a", "nara").players.get("a")?.heard).toBe(NARA_MARK_LATER);
    expect(guestCanClaim(m)).toBe(false);
  });

  it("Cold-funded door opens Strait / Foundry / Cable; guests cannot enter", () => {
    const open = funded();
    expect(open.m3Open).toBe(true);
    expect(open.pois.find((p) => p.id === ORGAN_STRAIT.id)?.name).toBe("The Strait");
    expect(open.pois.find((p) => p.id === ORGAN_FOUNDRY.id)?.name).toBe("The Foundry");
    expect(open.pois.find((p) => p.id === ORGAN_CABLE.id)?.name).toBe("The Cable");
    expect(open.signs.find((s) => s.id === ORGAN_STRAIT.id)?.text).not.toMatch(/hormuz|hsinchu|palantir|midgar/i);

    open.players.set("a", { ...open.players.get("a")!, x: M3_DOOR.x, y: M3_DOOR.y });
    const inside = applyM3(open, "a");
    const p = inside.players.get("a")!;
    expect(p.inM3).toBe(true);
    expect(p.beats.m3).toBe(true);
    expect(p.heard).toBe(M3_ENTER);
    expect(p.x).toBe(ORGAN_STRAIT.x);

    inside.players.set("a", { ...p, x: ORGAN_STRAIT.x, y: ORGAN_STRAIT.y });
    const strait = applyRead(inside, "a", ORGAN_STRAIT.id);
    expect(strait.players.get("a")?.beats.strait).toBe(true);
    strait.players.set("a", { ...strait.players.get("a")!, x: ORGAN_FOUNDRY.x, y: ORGAN_FOUNDRY.y });
    const foundry = applyRead(strait, "a", ORGAN_FOUNDRY.id);
    foundry.players.set("a", { ...foundry.players.get("a")!, x: ORGAN_CABLE.x, y: ORGAN_CABLE.y });
    const cable = applyRead(foundry, "a", ORGAN_CABLE.id);
    expect(cable.players.get("a")?.beats.cable).toBe(true);
    expect(cable.players.get("a")?.wink).toBe(WINK_ORGANS);

    const ord = NAVE_NPCS.find((n) => n.id === "ord")!;
    cable.players.set("a", { ...cable.players.get("a")!, x: ord.x, y: ord.y });
    const mapped = applyTalk(cable, "a", "ord");
    expect(mapped.players.get("a")?.heard).toBe(ORD_MAP);
    expect(mapped.players.get("a")?.heard).not.toMatch(/hormuz|taiwan|iran/i);
    expect(damageFor(mapped.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(mapped.players.get("a")!)).toBe(false);

    const gWorld = funded();
    gWorld.players.set("g", { ...spawnGuest("g"), x: M3_DOOR.x, y: M3_DOOR.y, locked: true });
    const guest = applyM3(gWorld, "g");
    expect(guest.players.get("g")?.inM3).toBe(false);
    expect(guest.players.get("g")?.heard).toBe(M3_SPECTATOR);
  });
});

describe("Ord's Cable errand", () => {
  it("keeping a node quiets the Cable plaque and moves Ord; extract does not", () => {
    const ord = NAVE_NPCS.find((n) => n.id === "ord")!;
    const w = emptyWorld();
    w.m3Open = true;
    w.pois = [...w.pois, { id: ORGAN_CABLE.id, name: "The Cable", x: ORGAN_CABLE.x, y: ORGAN_CABLE.y, kind: "organ-cable" }];
    w.signs = [...w.signs, ORGAN_PLAQUES.find((s) => s.id === ORGAN_CABLE.id)!];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), map: true, m3: true },
      x: ord.x,
      y: ord.y,
    });
    const asked = applyTalk(w, "a", "ord");
    expect(asked.players.get("a")?.heard).toBe(ORD_ERRAND);
    expect(asked.players.get("a")?.beats.errand).toBe(true);
    expect(asked.ordAtCable).toBe(false);

    const node = asked.nodes[0];
    asked.players.set("a", { ...asked.players.get("a")!, x: node.x, y: node.y });
    const kept = applyUse(asked, "a", node.id, "keep");
    const p = kept.players.get("a")!;
    expect(p.beats.cableQuiet).toBe(true);
    expect(p.heard).toBe(CABLE_QUIET_COPY);
    expect(p.wink).toBe(WINK_ERRAND);
    expect(kept.ordAtCable).toBe(true);
    expect(kept.pois.find((poi) => poi.id === ORGAN_CABLE.id)?.kind).toBe("organ-cable-quiet");
    expect(kept.signs.find((s) => s.id === ORGAN_CABLE.id)?.title).toBe(CABLE_QUIET_PLAQUE.title);
    const moved = liveNpcs(false, true).find((n) => n.id === "ord")!;
    expect(moved.x).toBe(ORGAN_CABLE.x);
    expect(moved.role).toBe("At the Cable");
    kept.players.set("a", { ...p, x: moved.x, y: moved.y });
    const later = applyTalk(kept, "a", "ord");
    expect(later.players.get("a")?.heard).toBe(ORD_CABLE_LATER);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const extractW = emptyWorld();
    extractW.m3Open = true;
    extractW.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), errand: true, map: true },
      x: node.x,
      y: node.y,
    });
    const extracted = applyUse(extractW, "a", node.id, "extract");
    expect(extracted.players.get("a")?.heard).toBe(ERRAND_EXTRACT);
    expect(extracted.ordAtCable).toBe(false);
    expect(extracted.pois.find((poi) => poi.id === ORGAN_CABLE.id)?.kind).not.toBe("organ-cable-quiet");
  });
});

describe("failed Passing ruin-sight", () => {
  it("only mock #7777 sees last season; watching is not loot and not damage", () => {
    const w = placeNear("a", GOING_UNDER.x, GOING_UNDER.y, {
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), nara: true, quill: true, ord: true, burial: true },
    });
    const under = applyGoingUnder(w, "a");
    expect(under.failed).toEqual([{ ...FAILED_PASSING }]);
    expect(visibleFailed(true, null, under.failed)).toEqual([]);
    expect(ruinSight(false, TEST_SERIAL)).toBe(true);
    expect(visibleFailed(false, TEST_SERIAL, under.failed)).toHaveLength(1);

    under.players.set("a", { ...under.players.get("a")!, x: FAILED_PASSING.x, y: FAILED_PASSING.y });
    const watched = applyWatch(under, "a");
    const p = watched.players.get("a")!;
    expect(p.beats.failed).toBe(true);
    expect(p.heard).toBe(WATCH_FAILED);
    expect(p.wink).toBe(WINK_FAILED);
    expect(watched.failed).toHaveLength(1);
    expect(p.bestand).toBe(0);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const gWorld = { ...under };
    gWorld.players.set("g", { ...spawnGuest("g"), x: FAILED_PASSING.x, y: FAILED_PASSING.y, locked: true });
    const guest = applyWatch(gWorld, "g");
    expect(guest.players.get("g")?.beats.failed).toBe(false);
    expect(guest.players.get("g")?.heard).toBe(FAILED_SPECTATOR);
    expect(visibleFailed(true, null, guest.failed)).toEqual([]);
  });
});

describe("forged Winke", () => {
  function angelAtQuill(market = true) {
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), market, hall: true, quill: true },
      x: FORGE_TRAY.x,
      y: FORGE_TRAY.y,
    });
    return w;
  }

  it("Quill teaches cult vs copy; spotting keeps the cult hint; selling does not open anything", () => {
    const heard = applyForge(angelAtQuill(true), "a", "hear");
    const p = heard.players.get("a")!;
    expect(p.heard).toBe(FORGE_LESSON);
    expect(p.wink).toBe(WINK_FORGE);
    expect(p.beats.forge).toBe(true);
    expect(p.cultWink).toBe(false);

    const spotted = applyForge(heard, "a", "spot");
    const s = spotted.players.get("a")!;
    expect(s.cultWink).toBe(true);
    expect(s.fakeWinke).toBe(0);
    expect(s.heard).toBe(FORGE_SPOT);
    expect(spotted.forgedSold).toBe(false);
    expect(damageFor(s)).toBe(damageFor(spawnGuest("g")));

    const sold = applyForge(heard, "a", "sell");
    const k = sold.players.get("a")!;
    expect(k.bestand).toBe(FORGE_PAY - LISTING_FEE);
    expect(k.fakeWinke).toBe(1);
    expect(k.cultWink).toBe(false);
    expect(k.aura).toBe(auraSeed(TEST_SERIAL) - 3);
    expect(k.heard).toBe(QUILL_LEAVE);
    expect(sold.forgedSold).toBe(true);
    expect(sold.quillGone).toBe(true);
    expect(sold.clearingOpen).toBe(false);
    expect(guestCanClaim(k)).toBe(false);
  });

  it("without the listing Quill will not teach; guests never hear the Wink", () => {
    expect(applyForge(angelAtQuill(false), "a", "hear").players.get("a")?.heard).toBe(FORGE_NEED_MARKET);
    const w = emptyWorld();
    w.players.set("g", { ...spawnGuest("g"), x: FORGE_TRAY.x, y: FORGE_TRAY.y, locked: true });
    const after = applyForge(w, "g", "sell");
    expect(after.players.get("g")?.heard).toBe(FORGE_SPECTATOR);
    expect(after.players.get("g")?.wink).toBe("");
    expect(after.forgedSold).toBe(false);
    expect(guestCanClaim(after.players.get("g")!)).toBe(false);
  });

  it("cult cannot list; listing fee sinks Bestand; prints decay", () => {
    const heard = applyForge(angelAtQuill(true), "a", "hear");
    const spotted = applyForge(heard, "a", "spot");
    const blocked = applyForge(spotted, "a", "sell");
    expect(blocked.players.get("a")?.heard).toBe(CULT_NO_LIST);
    expect(blocked.players.get("a")?.cultWink).toBe(true);
    expect(blocked.forgedSold).toBe(false);
    expect(LISTING_FEE).toBe(5);
    expect(FORGE_PAY - LISTING_FEE).toBe(20);

    const sold = applyForge(heard, "a", "sell");
    expect(sold.players.get("a")?.bestand).toBe(20);
    let decay = sold;
    for (let i = 0; i < 410; i++) decay = tickWorld(decay, 0.05);
    expect(decay.players.get("a")?.fakeWinke).toBe(0);
    expect(decay.players.get("a")?.heard).toBe(DECAY_COPY);
    expect(EXHIBIT_DECAY).toBe(20);
    expect(damageFor(sold.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(sold.players.get("a")!)).toBe(false);
  });
});

describe("Quill darkens the stall", () => {
  it("hanging the cult sheet unlists the stall and moves Quill; selling cannot", () => {
    const quill = NAVE_NPCS.find((n) => n.id === "quill")!;
    const heard = applyForge(
      (() => {
        const w = emptyWorld();
        w.players.set("a", {
          ...spawnGuest("a"),
          guest: false,
          serial: TEST_SERIAL,
          aura: auraSeed(TEST_SERIAL),
          beats: { ...emptyBeats(), market: true, hall: true, quill: true },
          x: FORGE_TRAY.x,
          y: FORGE_TRAY.y,
        });
        return w;
      })(),
      "a",
      "hear",
    );
    const spotted = applyForge(heard, "a", "spot");
    spotted.players.set("a", { ...spotted.players.get("a")!, x: quill.x, y: quill.y });
    const asked = applyTalk(spotted, "a", "quill");
    expect(asked.players.get("a")?.heard).toBe(QUILL_HANG_ASK);
    expect(asked.players.get("a")?.beats.hangAsk).toBe(true);
    expect(asked.quillAtGrid).toBe(false);
    expect(applyTalk(asked, "a", "quill").players.get("a")?.heard).toBe(QUILL_HANG_WAIT);

    asked.players.set("a", { ...asked.players.get("a")!, x: CLEARING_STALL.x, y: CLEARING_STALL.y, bestand: 80 });
    const hung = applyHang(asked, "a");
    const p = hung.players.get("a")!;
    expect(p.heard).toBe(QUILL_HANG);
    expect(p.beats.hang).toBe(true);
    expect(p.cultWink).toBe(true);
    expect(p.wink).toBe(WINK_HANG);
    expect(hung.stallDark).toBe(true);
    expect(hung.quillAtGrid).toBe(true);
    expect(hung.pois.find((poi) => poi.id === CLEARING_STALL.id)?.kind).toBe("stall-dark");
    expect(hung.signs.find((s) => s.id === CLEARING_STALL.id)?.title).toBe(STALL_DARK_PLAQUE.title);
    const moved = liveNpcs(false, false, false, true).find((n) => n.id === "quill")!;
    expect(moved.role).toBe("On the wet street");
    expect(moved.x).toBe(WET_GRID.x + 48);
    hung.players.set("a", { ...p, x: moved.x, y: moved.y });
    expect(applyTalk(hung, "a", "quill").players.get("a")?.heard).toBe(QUILL_UNFLAG_ASK);

    hung.players.set("a", { ...p, x: CLEARING_STALL.x, y: CLEARING_STALL.y, bestand: 80 });
    const buy = applyMarket(hung, "a");
    expect(buy.players.get("a")?.heard).toBe(STALL_DARK_COPY);
    expect(buy.players.get("a")?.bestand).toBe(80);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const soldW = applyForge(heard, "a", "sell");
    soldW.players.set("a", { ...soldW.players.get("a")!, x: quill.x, y: quill.y });
    const refused = applyTalk(soldW, "a", "quill");
    expect(refused.players.get("a")?.heard).toBe(QUILL_HANG_NEED);
    expect(refused.stallDark).toBe(false);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: CLEARING_STALL.x, y: CLEARING_STALL.y, locked: true, beats: { ...emptyBeats(), hangAsk: true } });
    const g = applyHang(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(QUILL_HANG_SPECTATOR);
    expect(g.stallDark).toBe(false);
    expect(guestCanClaim(g.players.get("g")!)).toBe(false);
  });
});

describe("Movement IV Clearing and Passing", () => {
  function angelAt(x: number, y: number, extra: Partial<ReturnType<typeof spawnGuest>> = {}) {
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: {
        ...emptyBeats(),
        nara: true,
        quill: true,
        ord: true,
        burial: true,
        under: true,
        care: true,
        hall: true,
        garden: true,
      },
      x,
      y,
      ...extra,
    });
    return w;
  }

  it("Ione Kade last word is the mortality act; guests never hear it", () => {
    const w = angelAt(IONE.x, IONE.y);
    const after = applyLastWord(w, "a");
    const p = after.players.get("a")!;
    expect(p.beats.lastWord).toBe(true);
    expect(p.heard).toBe(LAST_WORD);
    expect(p.heard).toContain("Ione Kade");
    expect(p.wink).toBe(WINK_TURN);
    expect(after.ioneGone).toBe(true);
    expect(snapshot(after).npcs.find((n) => n.id === "ione")).toBeUndefined();
    expect(after.pois.find((poi) => poi.id === IONE.id)?.kind).toBe("ione-gone");
    expect(after.signs.find((s) => s.id === IONE.id)?.title).toBe(IONE_GONE_PLAQUE.title);
    expect(applyLastWord(after, "a").players.get("a")?.heard).toBe(LAST_WORD_GONE);
    const marked = applyRead(after, "a", IONE.id);
    expect(marked.players.get("a")?.heard).toBe(IONE_MARK);
    expect(marked.players.get("a")?.wink).toBe(WINK_ABSENCE);
    expect(marked.players.get("a")?.beats.ioneMark).toBe(true);
    expect(applyIoneMark(marked, "a").players.get("a")?.heard).toBe(IONE_MARK_LATER);
    expect(damageFor(marked.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: IONE.x, y: IONE.y, locked: true });
    const guest = applyLastWord(gWorld, "g");
    expect(guest.ioneGone).toBe(false);
    expect(guest.players.get("g")?.heard).toBe(IONE_SPECTATOR);
    expect(guest.players.get("g")?.wink).toBe("");
    expect(guestCanClaim(guest.players.get("g")!)).toBe(false);
    gWorld.ioneGone = true;
    expect(applyIoneMark(gWorld, "g").players.get("g")?.heard).toBe(IONE_MARK_SPECTATOR);
  });

  it("when the four stay as people, Ione's hole is a gathering; guests cannot", () => {
    expect(peopleReady({ naraPersonHeld: true, quillPersonHeld: true, ordPersonHeld: true, vesperPersonHeld: true })).toBe(true);
    expect(peopleReady({ naraPersonHeld: true, quillPersonHeld: true, ordPersonHeld: true, vesperPersonHeld: false })).toBe(false);
    const w = emptyWorld();
    w.ioneGone = true;
    w.naraPersonHeld = true;
    w.quillPersonHeld = true;
    w.ordPersonHeld = true;
    w.vesperPersonHeld = true;
    w.pois = [...w.pois, ioneGonePoi()];
    w.signs = [...w.signs, { ...IONE_GONE_PLAQUE }];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      x: IONE.x,
      y: IONE.y,
    });
    const gathered = applyIoneMark(w, "a");
    const p = gathered.players.get("a")!;
    expect(p.heard).toBe(PEOPLE_COPY);
    expect(p.wink).toBe(WINK_PEOPLE);
    expect(p.beats.people).toBe(true);
    expect(gathered.peopleHeld).toBe(true);
    expect(gathered.pois.find((poi) => poi.id === IONE.id)?.kind).toBe("ione-people");
    expect(gathered.signs.find((s) => s.id === IONE.id)?.title).toBe(PEOPLE_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyPeople(gathered, "a").players.get("a")?.heard).toBe(PEOPLE_HELD);

    const early = emptyWorld();
    early.ioneGone = true;
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: IONE.x, y: IONE.y });
    expect(applyPeople(early, "a").players.get("a")?.heard).toBe(PEOPLE_NEED);

    const gWorld = emptyWorld();
    gWorld.ioneGone = true;
    gWorld.naraPersonHeld = true;
    gWorld.quillPersonHeld = true;
    gWorld.ordPersonHeld = true;
    gWorld.vesperPersonHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: IONE.x, y: IONE.y, locked: true });
    expect(applyPeople(gWorld, "g").players.get("g")?.heard).toBe(PEOPLE_SPECTATOR);
    expect(gWorld.peopleHeld).toBe(false);
  });

  it("Clearing needs garden and last word; keeping does not mint", () => {
    const noGarden = applyClearing(angelAt(CLEARING_RING.x, CLEARING_RING.y, { beats: { ...emptyBeats(), lastWord: true } }), "a", "keep");
    expect(noGarden.players.get("a")?.heard).toBe(CLEARING_NEED_GARDEN);
    expect(noGarden.clearingOpen).toBe(false);

    const noWord = applyClearing(angelAt(CLEARING_RING.x, CLEARING_RING.y), "a", "keep");
    expect(noWord.players.get("a")?.heard).toBe(CLEARING_NEED_MORTAL);
    expect(noWord.clearingOpen).toBe(false);

    const ready = angelAt(CLEARING_RING.x, CLEARING_RING.y, { beats: { ...emptyBeats(), garden: true, lastWord: true } });
    const held = applyClearing(ready, "a", "keep");
    const p = held.players.get("a")!;
    expect(p.beats.clearing).toBe(true);
    expect(p.heard).toBe(CLEARING_PREPARE);
    expect(held.clearingOpen).toBe(true);
    expect(held.pois.find((poi) => poi.id === CLEARING_RING.id)?.kind).toBe("clearing-held");
    expect(held.gestell).toBeLessThan(ready.gestell);
    expect(guestCanClaim(p)).toBe(false);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
  });

  it("extract contests the Clearing and does not open a Passing", () => {
    const ready = angelAt(CLEARING_RING.x, CLEARING_RING.y, { beats: { ...emptyBeats(), garden: true, lastWord: true } });
    const held = applyClearing(ready, "a", "keep");
    const took = applyClearing(held, "a", "extract");
    const p = took.players.get("a")!;
    expect(p.bestand).toBe(CONTEST_PAY);
    expect(p.heard).toBe(CLEARING_CONTEST);
    expect(took.clearingOpen).toBe(false);
    expect(took.passing.outcome).toBe("");
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
  });

  it("Gestell 100 blocks Passing without a Clearing", () => {
    expect(dwellNeed(100)).toBe(2);
    expect(dwellNeed(12)).toBe(1);
    expect(passingResult({ starved: false, gestell: 100, clearingOpen: false, dwellers: 1, cold: false })).toBe("failed");
    const w = angelAt(CLEARING_RING.x, CLEARING_RING.y, {
      beats: { ...emptyBeats(), garden: true, lastWord: true },
    });
    w.gestell = 100;
    const attempt = applyPassing(w, "a");
    const p = attempt.players.get("a")!;
    expect(p.heard).toBe(PASSING_NEED);
    expect(attempt.passing.outcome).toBe("");
    const forced = applyClearing(w, "a", "pass");
    expect(forced.players.get("a")?.heard).toBe(PASSING_NEED);
    expect(guestCanClaim(p)).toBe(false);
  });

  it("failed Passing writes the hole; Gestell drinks; no stipend; guests cannot", () => {
    const w = angelAt(CLEARING_RING.x, CLEARING_RING.y, {
      beats: { ...emptyBeats(), garden: true, lastWord: true, clearing: true },
    });
    w.clearingOpen = false;
    w.gestell = 90;
    const failed = applyPassing(w, "a");
    const p = failed.players.get("a")!;
    expect(p.heard).toBe(PASSING_FAIL);
    expect(p.wink).toBe(WINK_PASS_FAIL);
    expect(p.beats.passing).toBe(true);
    expect(p.stipend).toBe(0);
    expect(failed.passing.outcome).toBe("failed");
    expect(failed.clearingFailed).toBe(true);
    expect(failed.gestell).toBe(94);
    expect(failed.pois.find((poi) => poi.id === CLEARING_RING.id)?.kind).toBe("clearing-failed");
    expect(failed.signs.find((s) => s.id === CLEARING_RING.id)?.title).toBe(FAIL_PLAQUE.title);
    expect(failed.failed.some((f) => f.id === FAILED_PASSING.id)).toBe(true);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    const stormed = applyPassing(failed, "a");
    expect(stormed.players.get("a")?.heard).toBe(STORM_COPY);
    expect(stormed.players.get("a")?.wink).toBe(WINK_STORM);
    expect(stormed.players.get("a")?.storm).toBe(true);
    expect(stormed.players.get("a")?.beats.storm).toBe(true);
    expect(stormed.players.get("a")?.readiness).toBe(Math.max(0, p.readiness - 3));
    expect(stormed.stormHeld).toBe(true);
    expect(stormed.pois.find((poi) => poi.id === CLEARING_RING.id)?.kind).toBe("clearing-storm");
    expect(stormed.signs.find((s) => s.id === CLEARING_RING.id)?.title).toBe(STORM_PLAQUE.title);
    const foreign = { id: "h-x", x: 10, y: 10, serial: 2, line: "other" };
    expect(visibleHistory(false, 1, [foreign], false)).toEqual([]);
    expect(visibleHistory(false, 1, [foreign], true)).toEqual([foreign]);
    expect(visibleFailed(false, 1, stormed.failed, "sky", true)).toHaveLength(stormed.failed.length);
    expect(visibleFailed(false, 1, stormed.failed, "sky", false)).toEqual([]);
    expect(damageFor(stormed.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(applyStorm(stormed, "a").players.get("a")?.heard).toBe(STORM_HELD);

    const gWorld = emptyWorld();
    gWorld.clearingOpen = false;
    gWorld.players.set("g", {
      ...spawnGuest("g"),
      x: CLEARING_RING.x,
      y: CLEARING_RING.y,
      locked: true,
      beats: { ...emptyBeats(), clearing: true },
    });
    const g = applyPassing(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(CLEARING_SPECTATOR);
    expect(g.clearingFailed).toBe(false);
    expect(applyStorm(gWorld, "g").players.get("g")?.heard).toBe(STORM_SPECTATOR);
    const early = emptyWorld();
    early.players.set("a", { ...spawnGuest("a"), guest: false, x: CLEARING_RING.x, y: CLEARING_RING.y });
    expect(applyStorm(early, "a").players.get("a")?.heard).toBe(STORM_NEED);
  });

  it("solo cannot force Appearance when Gestell is maxed even with a held Clearing", () => {
    const w = angelAt(CLEARING_RING.x, CLEARING_RING.y, {
      beats: { ...emptyBeats(), garden: true, lastWord: true },
    });
    const held = applyClearing(w, "a", "keep");
    held.gestell = 100;
    const after = applyPassing(held, "a");
    const p = after.players.get("a")!;
    expect(p.heard).toBe(PASSING_ABSENCE);
    expect(p.wink).toBe(WINK_PASS_ABSENCE);
    expect(p.beats.absenceHour).toBe(true);
    expect(after.passing.outcome).toBe("absence");
    expect(after.passing.ready).toBe(0);
    expect(after.naraAtClearing).toBe(true);
    expect(after.pois.find((poi) => poi.id === CLEARING_RING.id)?.kind).toBe("clearing-absence");
    expect(after.signs.find((s) => s.id === CLEARING_RING.id)?.title).toBe(ABSENCE_PLAQUE.title);
    expect(p.heard).toContain("Nara Vale");
    const stayed = liveNpcs(false, false, false, false, false, false, false, false, false, false, false, false, true).find((n) => n.id === "nara")!;
    expect(stayed.role).toBe("Stays");
    after.players.set("a", { ...p, x: stayed.x, y: stayed.y });
    const stayedTalk = applyTalk(after, "a", "nara");
    expect(stayedTalk.players.get("a")?.heard).toBe(NARA_STAYS);
    stayedTalk.players.set("a", { ...stayedTalk.players.get("a")!, x: stayed.x, y: stayed.y });
    expect(applyTalk(stayedTalk, "a", "nara").players.get("a")?.heard).toBe(NARA_STAYS_LATER);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
  });

  it("two dwellers can pass a maxed Gestell; freeze hijacks; Cold hijacks", () => {
    const w = angelAt(CLEARING_RING.x, CLEARING_RING.y, {
      beats: { ...emptyBeats(), garden: true, lastWord: true, clearing: true },
    });
    w.clearingOpen = true;
    w.gestell = 100;
    w.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), clearing: true },
      x: CLEARING_RING.x,
      y: CLEARING_RING.y,
    });
    const appear = applyPassing(w, "a");
    expect(appear.players.get("a")?.heard).toBe(PASSING_APPEAR);
    expect(appear.passing.outcome).toBe("appearance");
    expect(appear.passing.ready).toBe(PASSING_READY);
    expect(appear.players.get("a")?.heard).not.toMatch(/\$REVERIE|APY|heidegger/i);
    expect(appear.players.get("a")?.heard).toContain("No mint");

    const frozen = angelAt(CLEARING_RING.x, CLEARING_RING.y, {
      beats: { ...emptyBeats(), garden: true, lastWord: true, clearing: true },
    });
    frozen.clearingOpen = true;
    frozen.frozen = true;
    frozen.passing = { ready: 0, starved: true, outcome: "" };
    const hijack = applyPassing(frozen, "a");
    const hp = hijack.players.get("a")!;
    expect(hp.heard).toBe(PASSING_HIJACK);
    expect(hp.wink).toBe(WINK_HIJACK);
    expect(hp.beats.hijacked).toBe(true);
    expect(hijack.passing.outcome).toBe("hijack");
    expect(hijack.hijacked).toBe(true);
    expect(hijack.hijackBy).toBe("safety");
    expect(hijack.ordAtHijack).toBe(true);
    expect(hijack.pois.find((poi) => poi.id === CLEARING_RING.id)?.kind).toBe("clearing-hijack");
    expect(hijack.signs.find((s) => s.id === CLEARING_RING.id)?.title).toBe(hijackPlaque("safety").title);
    expect(visibleHistory(false, TEST_SERIAL, hijack.history).some((h) => h.line === HIJACK_MARK_LINE)).toBe(true);
    expect(visibleHistory(true, null, hijack.history)).toEqual([]);
    const ord = liveNpcs(false, false, false, false, false, false, false, false, false, false, false, false, false, true).find((n) => n.id === "ord")!;
    expect(ord.role).toBe("Claimed the rite");
    expect(hp.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(hp)).toBe(damageFor(spawnGuest("g")));

    const cold = angelAt(CLEARING_RING.x, CLEARING_RING.y, {
      beats: { ...emptyBeats(), garden: true, lastWord: true, clearing: true },
      current: "cold",
    });
    cold.clearingOpen = true;
    cold.gestell = 80;
    const coldHijack = applyPassing(cold, "a");
    expect(coldHijack.passing.outcome).toBe("hijack");
    expect(coldHijack.hijackBy).toBe("cold");
    expect(coldHijack.vesperAtHijack).toBe(true);
    expect(coldHijack.signs.find((s) => s.id === CLEARING_RING.id)?.title).toBe(hijackPlaque("cold").title);
    const vesper = liveNpcs(false, false, false, false, false, false, false, false, false, false, false, false, false, false, true).find((n) => n.id === "vesper")!;
    expect(vesper.role).toBe("Claimed the yield");
    expect(guestCanClaim(coldHijack.players.get("a")!)).toBe(false);
  });

  it("Appearance needs the party willing; a gone sexton is absence, not a stick", () => {
    expect(partyWilling({})).toBe(true);
    expect(partyWilling({ naraGone: true })).toBe(false);
    expect(passingResult({ starved: false, gestell: 12, clearingOpen: true, dwellers: 1, cold: false, partyWilling: false })).toBe("absence");
    const w = angelAt(CLEARING_RING.x, CLEARING_RING.y, {
      beats: { ...emptyBeats(), garden: true, lastWord: true },
    });
    const held = applyClearing(w, "a", "keep");
    held.naraGone = true;
    const after = applyPassing(held, "a");
    const p = after.players.get("a")!;
    expect(p.heard).toBe(PARTY_STAND);
    expect(p.wink).toBe(WINK_PARTY);
    expect(p.beats.absenceHour).toBe(true);
    expect(p.stipend).toBe(0);
    expect(after.passing.outcome).toBe("absence");
    expect(after.appearWorld).toBe(false);
    expect(after.naraAtClearing).toBe(false);
    expect(after.pois.find((poi) => poi.id === CLEARING_RING.id)?.kind).toBe("clearing-empty");
    expect(after.signs.find((s) => s.id === CLEARING_RING.id)?.title).toBe(PARTY_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const quillGone = angelAt(CLEARING_RING.x, CLEARING_RING.y, {
      beats: { ...emptyBeats(), garden: true, lastWord: true, clearing: true },
    });
    quillGone.clearingOpen = true;
    quillGone.quillGone = true;
    expect(applyPassing(quillGone, "a").passing.outcome).toBe("absence");

    const gWorld = emptyWorld();
    gWorld.clearingOpen = true;
    gWorld.naraGone = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: CLEARING_RING.x, y: CLEARING_RING.y, locked: true });
    expect(applyPassing(gWorld, "g").players.get("g")?.heard).toBe(CLEARING_SPECTATOR);
    expect(applyPassing(gWorld, "g").passing.outcome).toBe("");
  });

  it("low Gestell Appearance is a trace; guests cannot keep the hole", () => {
    const w = angelAt(CLEARING_RING.x, CLEARING_RING.y, {
      beats: { ...emptyBeats(), garden: true, lastWord: true },
    });
    const held = applyClearing(w, "a", "keep");
    const after = applyPassing(held, "a");
    expect(after.players.get("a")?.heard).toBe(PASSING_APPEAR);
    expect(after.passing.outcome).toBe("appearance");
    expect(after.appearSlow).toBe(true);
    expect(after.appearWorld).toBe(true);
    expect(after.players.get("a")?.stipend).toBe(STIPEND);
    expect(after.players.get("a")?.wink).toBe(WINK_STIPEND);
    expect(after.pois.find((poi) => poi.id === CLEARING_RING.id)?.kind).toBe("clearing-appear");
    expect(after.signs.find((s) => s.id === CLEARING_RING.id)?.title).toBe(APPEAR_PLAQUE.title);
    after.players.set("a", { ...after.players.get("a")!, x: SHRINE.x, y: SHRINE.y, bestand: 40 });
    const sunk = applyShrine(after, "a");
    expect(sunk.players.get("a")?.heard).toBe(STIPEND_SINK);
    expect(sunk.players.get("a")?.stipend).toBe(STIPEND - 1);
    expect(sunk.players.get("a")?.bestand).toBe(40);
    expect(sunk.gestell).toBeLessThan(after.gestell);
    expect(damageFor(sunk.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(GESTELL_HOT).toBe(91);
    expect(PASSING_FAIL).toContain("Clearing");

    sunk.players.set("a", { ...sunk.players.get("a")!, x: CLEARING_RING.x, y: CLEARING_RING.y });
    const named = applyPassing(sunk, "a");
    expect(named.players.get("a")?.heard).toBe(CREDITS_COPY);
    expect(named.players.get("a")?.wink).toBe(WINK_CREDITS);
    expect(named.players.get("a")?.beats.credits).toBe(true);
    expect(named.creditsHeld).toBe(true);
    expect(named.pois.find((poi) => poi.id === CLEARING_RING.id)?.kind).toBe("clearing-credits");
    expect(named.signs.find((s) => s.id === CLEARING_RING.id)?.title).toBe(CREDITS_PLAQUE.title);
    expect(named.players.get("a")?.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(applyCredits(named, "a").players.get("a")?.heard).toBe(CREDITS_HELD);

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      x: CLEARING_RING.x,
      y: CLEARING_RING.y,
    });
    expect(applyCredits(early, "a").players.get("a")?.heard).toBe(CREDITS_NEED);

    const gCredits = emptyWorld();
    gCredits.appearWorld = true;
    gCredits.players.set("g", {
      ...spawnGuest("g"),
      x: CLEARING_RING.x,
      y: CLEARING_RING.y,
      locked: true,
      beats: { ...emptyBeats(), passing: true },
    });
    expect(applyCredits(gCredits, "g").players.get("g")?.heard).toBe(CREDITS_SPECTATOR);
    expect(gCredits.creditsHeld).toBe(false);
  });

  it("after credits, F at Wet Grid names the residual season and flags by default", () => {
    expect(wetGridDefaultFlag({ wetCult: false, seasonHeld: true, gestell: 12 })).toBe(true);
    expect(wetGridDefaultFlag({ wetCult: false, seasonHeld: false, gestell: GESTELL_HOT })).toBe(true);
    expect(wetGridDefaultFlag({ wetCult: true, seasonHeld: true, gestell: 100 })).toBe(false);
    expect(wetGridDefaultFlag({ wetCult: false, seasonHeld: false, gestell: 12 })).toBe(false);

    const w = emptyWorld();
    w.creditsHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), credits: true },
      x: WET_GRID.x,
      y: WET_GRID.y,
    });
    const named = applySeason(w, "a");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(SEASON_COPY);
    expect(p.wink).toBe(WINK_SEASON);
    expect(p.beats.season).toBe(true);
    expect(p.flagged).toBe(true);
    expect(named.seasonHeld).toBe(true);
    expect(named.pois.find((poi) => poi.id === WET_GRID.id)?.kind).toBe("wet-grid-season");
    expect(named.signs.find((s) => s.id === WET_GRID.id)?.title).toBe(SEASON_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(snapshot(named).seasonHeld).toBe(true);
    expect(applySeason(named, "a").players.get("a")?.heard).toBe(BRACKET_COPY);
    expect(applyRead(w, "a", WET_GRID.id).seasonHeld).toBe(true);

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      x: WET_GRID.x,
      y: WET_GRID.y,
    });
    expect(applySeason(early, "a").players.get("a")?.heard).toBe(SEASON_NEED);
    expect(applySeason(early, "a").seasonHeld).toBe(false);

    const cult = emptyWorld();
    cult.creditsHeld = true;
    cult.wetCult = true;
    cult.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      x: WET_GRID.x,
      y: WET_GRID.y,
    });
    expect(applySeason(cult, "a").players.get("a")?.heard).toBe(SEASON_CULT);
    expect(applySeason(cult, "a").seasonHeld).toBe(false);

    const hot = emptyWorld();
    hot.gestell = GESTELL_HOT;
    hot.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      x: WET_GRID.x,
      y: WET_GRID.y,
    });
    const ticked = tickWorld(hot, 0.05);
    expect(ticked.players.get("a")?.flagged).toBe(true);
    expect(damageFor(ticked.players.get("a")!)).toBe(damageFor(spawnGuest("g")));

    const gWorld = emptyWorld();
    gWorld.creditsHeld = true;
    gWorld.gestell = GESTELL_HOT;
    gWorld.players.set("g", { ...spawnGuest("g"), x: WET_GRID.x, y: WET_GRID.y, locked: true });
    expect(applySeason(gWorld, "g").players.get("g")?.heard).toBe(SEASON_SPECTATOR);
    expect(applySeason(gWorld, "g").seasonHeld).toBe(false);
    expect(tickWorld(gWorld, 0.05).players.get("g")?.flagged).toBe(false);
  });

  it("optional equalized bracket after season; serials stay visible; not a stick", () => {
    const w = emptyWorld();
    w.seasonHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), season: true },
      x: WET_GRID.x,
      y: WET_GRID.y,
    });
    w.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      serial: 2,
      beats: { ...emptyBeats(), season: true },
      x: WET_GRID.x + 8,
      y: WET_GRID.y,
    });
    const eq = applySeason(w, "a");
    const p = eq.players.get("a")!;
    expect(p.heard).toBe(BRACKET_COPY);
    expect(p.wink).toBe(WINK_BRACKET);
    expect(p.beats.bracket).toBe(true);
    expect(eq.bracketHeld).toBe(true);
    expect(eq.pois.find((poi) => poi.id === WET_GRID.id)?.kind).toBe("wet-grid-bracket");
    expect(eq.signs.find((s) => s.id === WET_GRID.id)?.title).toBe(BRACKET_PLAQUE.title);
    expect(formatSerial(p.serial)).toBe("#7777");
    expect(formatSerial(eq.players.get("b")?.serial ?? null)).toBe("#0002");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(eq.players.get("b")!));
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyBracket(eq, "a").players.get("a")?.heard).toBe(BRACKET_HELD);
    expect(applySeason(eq, "a").players.get("a")?.heard).toBe(SEASON_HELD);

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      x: WET_GRID.x,
      y: WET_GRID.y,
    });
    expect(applyBracket(early, "a").players.get("a")?.heard).toBe(BRACKET_NEED);

    const gWorld = emptyWorld();
    gWorld.seasonHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: WET_GRID.x, y: WET_GRID.y, locked: true });
    expect(applyBracket(gWorld, "g").players.get("g")?.heard).toBe(BRACKET_SPECTATOR);
    expect(gWorld.bracketHeld).toBe(false);
  });

  it("party reacts to a Wink they cannot see; guests cannot", () => {
    const nara = NAVE_NPCS.find((n) => n.id === "nara")!;
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      wink: WINK_CREDITS,
      beats: { ...emptyBeats(), nara: true, quill: true, ord: true },
      x: nara.x,
      y: nara.y,
    });
    const seen = applyTalk(w, "a", "nara");
    const p = seen.players.get("a")!;
    expect(p.heard).toBe(PARTY_BLIND);
    expect(p.wink).toBe(WINK_PARTY_BLIND);
    expect(p.beats.winkBlind).toBe(true);
    expect(seen.winkBlindHeld).toBe(true);
    expect(seen.pois.find((poi) => poi.kind === "party-blind")?.x).toBe(nara.x);
    expect(seen.signs.find((s) => s.id === "party-blind")?.title).toBe(PARTY_BLIND_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyTalk(seen, "a", "nara").players.get("a")?.heard).toBe(PARTY_BLIND_HELD);
    expect(applyPartyBlind(w, "a", nara).winkBlindHeld).toBe(true);

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      wink: WINK_CREDITS,
      beats: { ...emptyBeats(), nara: true },
      x: nara.x,
      y: nara.y,
    });
    expect(applyTalk(early, "a", "nara").players.get("a")?.heard).toBe(PARTY_BLIND_NEED);
    expect(applyTalk(early, "a", "nara").winkBlindHeld).toBe(false);

    const gWorld = emptyWorld();
    gWorld.players.set("g", {
      ...spawnGuest("g"),
      wink: WINK_CREDITS,
      locked: true,
      x: nara.x,
      y: nara.y,
    });
    expect(applyTalk(gWorld, "g", "nara").players.get("g")?.heard).toBe(PARTY_BLIND_SPECTATOR);
    expect(gWorld.winkBlindHeld).toBe(false);
  });

  it("low Gestell Appearance leftover guest lock still holds", () => {
    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: CLEARING_RING.x, y: CLEARING_RING.y });
    const guest = applyClearing(gWorld, "g", "keep");
    expect(guest.clearingOpen).toBe(false);
    expect(guest.players.get("g")?.heard).toBe(CLEARING_SPECTATOR);
    expect(guest.players.get("g")?.wink).toBe("");
  });

  it("Appearance slows aura toward seed; guests stay 0; damage is unchanged", () => {
    const seed = auraSeed(TEST_SERIAL);
    expect(auraTowardSeed({ aura: seed + 8, seed, dt: 1, slow: false, guest: false })).toBe(seed + 8 - AURA_DECAY);
    expect(auraTowardSeed({ aura: seed + 8, seed, dt: 1, slow: true, guest: false })).toBe(seed + 8 - APPEAR_SLOW * AURA_DECAY);
    expect(auraTowardSeed({ aura: 20, seed, dt: 1, slow: false, guest: true })).toBe(0);
    const w = emptyWorld();
    w.appearSlow = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: seed + 8,
    });
    w.players.set("g", { ...spawnGuest("g"), aura: 12 });
    const slow = tickAura(w, 1);
    expect(slow.players.get("a")?.aura).toBe(seed + 8 - APPEAR_SLOW * AURA_DECAY);
    expect(slow.players.get("g")?.aura).toBe(0);
    const fast = emptyWorld();
    fast.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: seed + 8,
    });
    expect(tickAura(fast, 1).players.get("a")?.aura).toBe(seed + 8 - AURA_DECAY);
    expect(damageFor(slow.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(slow.players.get("a")!)).toBe(false);
    expect(PASSING_APPEAR).not.toMatch(/heidegger|midgar|\$REVERIE strike/i);
  });
});

describe("House war on the Clearing", () => {
  function mortal(id: string, extra: Partial<ReturnType<typeof spawnGuest>> = {}) {
    return {
      ...spawnGuest(id),
      guest: false,
      serial: TEST_SERIAL,
      house: "mortals" as const,
      beats: { ...emptyBeats(), garden: true, lastWord: true },
      x: CLEARING_RING.x,
      y: CLEARING_RING.y,
      ...extra,
    };
  }

  it("two House keeps win tithe and omen, never damage", () => {
    const w = emptyWorld();
    w.players.set("a", mortal("a"));
    w.players.set("b", mortal("b", { serial: 1 }));
    const first = applyClearing(w, "a", "keep");
    expect(first.war.keep.mortals).toBe(1);
    expect(first.war.winner).toBe("");
    const won = applyClearing(first, "b", "keep");
    expect(won.war.winner).toBe("mortals");
    expect(won.war.titheCut).toBe(WAR_TITHE);
    expect(won.war.omen).toBe(WAR_OMEN_KEEP);
    expect(won.players.get("b")?.heard).toBe(WAR_OMEN_KEEP);
    expect(won.players.get("b")?.wink).toBe(WINK_WAR);
    expect(snapshot(won).war.winner).toBe("mortals");
    expect(damageFor(won.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(damageFor(won.players.get("b")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(won.players.get("a")!)).toBe(false);
  });

  it("two extracts win the Cold omen; guests do not score", () => {
    const w = emptyWorld();
    w.players.set("e", {
      ...spawnGuest("e"),
      guest: false,
      house: "earth",
      x: CLEARING_RING.x,
      y: CLEARING_RING.y,
    });
    const one = applyClearing(w, "e", "extract");
    expect(one.war.winner).toBe("");
    const two = applyClearing(one, "e", "extract");
    expect(two.war.winner).toBe("earth");
    expect(two.war.omen).toBe(WAR_OMEN_EXTRACT);
    expect(two.war.titheCut).toBe(WAR_TITHE);
    expect(WAR_WIN).toBe(2);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: CLEARING_RING.x, y: CLEARING_RING.y });
    const guest = applyClearing(gWorld, "g", "extract");
    expect(guest.war.extract.earth).toBe(0);
    expect(guest.war.winner).toBe("");
    expect(guestCanClaim(guest.players.get("g")!)).toBe(false);
  });

  it("winning House skims less tithe only after upkeep, never a strike", () => {
    expect(warTax(8, "mortals", { ...emptyWar(), winner: "mortals", titheCut: 2, tithePaid: true })).toBe(6);
    expect(warTax(8, "mortals", { ...emptyWar(), winner: "mortals", titheCut: 2, tithePaid: false })).toBe(8);
    expect(warTax(8, "sky", { ...emptyWar(), winner: "mortals", titheCut: 2, tithePaid: true })).toBe(8);
    const w = emptyWorld();
    w.war = { ...emptyWar(), winner: "mortals", titheCut: WAR_TITHE, omen: WAR_OMEN_KEEP, tithePaid: true };
    const node = w.nodes[0];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      house: "mortals",
      beats: { ...emptyBeats(), hall: true },
      x: node.x,
      y: node.y,
    });
    const tax = gestellTax(w.gestell);
    const after = applyUse(w, "a", node.id, "extract");
    expect(after.players.get("a")?.bestand).toBe(40 - warTax(earthTax(tax, "mortals"), "mortals", w.war));
    expect(after.players.get("a")?.bestand).toBeGreaterThan(40 - tax);
    expect(damageFor(after.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(after.players.get("a")!)).toBe(false);
  });

  it("House tithe spends Bestand to arm the omen cut", () => {
    const w = emptyWorld();
    w.war = { ...emptyWar(), winner: "mortals", titheCut: WAR_TITHE, omen: WAR_OMEN_KEEP };
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      house: "mortals",
      beats: { ...emptyBeats(), hall: true, care: true },
      inCare: true,
      bestand: 4,
      x: HOUSE_HALL.x,
      y: HOUSE_HALL.y,
    });
    const poor = applyTithe(w, "a");
    expect(poor.war.tithePaid).toBe(false);
    expect(poor.players.get("a")?.heard).toBe(TITHE_NEED);

    w.players.set("a", { ...w.players.get("a")!, bestand: 20 });
    const paid = applyTithe(w, "a");
    expect(paid.war.tithePaid).toBe(true);
    expect(paid.players.get("a")?.bestand).toBe(20 - TITHE_COST);
    expect(paid.players.get("a")?.heard).toBe(TITHE_COPY);
    expect(paid.players.get("a")?.wink).toBe(WINK_WAR);
    expect(TITHE_COST).toBe(6);
    expect(damageFor(paid.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(paid.players.get("a")!)).toBe(false);

    const again = applyTithe(paid, "a");
    expect(again.players.get("a")?.heard).toBe(TITHE_HELD);
    expect(again.players.get("a")?.bestand).toBe(20 - TITHE_COST);

    const none = emptyWorld();
    none.players.set("a", { ...spawnGuest("a"), guest: false, house: "mortals", inCare: true, x: HOUSE_HALL.x, y: HOUSE_HALL.y, bestand: 20 });
    expect(applyTithe(none, "a").players.get("a")?.heard).toBe(TITHE_NONE);

    const wrong = emptyWorld();
    wrong.war = { ...emptyWar(), winner: "sky", titheCut: WAR_TITHE };
    wrong.players.set("a", { ...spawnGuest("a"), guest: false, house: "mortals", inCare: true, x: HOUSE_HALL.x, y: HOUSE_HALL.y, bestand: 20 });
    expect(applyTithe(wrong, "a").players.get("a")?.heard).toBe(TITHE_WRONG);

    const gWorld = emptyWorld();
    gWorld.war = { ...emptyWar(), winner: "mortals", titheCut: WAR_TITHE };
    gWorld.players.set("g", { ...spawnGuest("g"), x: HOUSE_HALL.x, y: HOUSE_HALL.y, bestand: 20 });
    const g = applyTithe(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(TITHE_SPECTATOR);
    expect(g.war.tithePaid).toBe(false);
    expect(g.players.get("g")?.bestand).toBe(20);
  });

  it("House bounty pays from the tithe pool once; Gestell drinks; guests cannot", () => {
    const w = emptyWorld();
    w.war = { ...emptyWar(), winner: "mortals", titheCut: WAR_TITHE, omen: WAR_OMEN_KEEP, tithePaid: true };
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      house: "mortals",
      beats: { ...emptyBeats(), hall: true, care: true },
      inCare: true,
      bestand: 10,
      aura: 8,
      x: HOUSE_HALL.x,
      y: HOUSE_HALL.y,
    });
    const paid = applyBounty(w, "a");
    const p = paid.players.get("a")!;
    expect(p.heard).toBe(BOUNTY_COPY);
    expect(p.wink).toBe(WINK_BOUNTY);
    expect(p.beats.bounty).toBe(true);
    expect(p.bestand).toBe(10 + BOUNTY_PAY);
    expect(p.aura).toBe(7);
    expect(paid.bountyHeld).toBe(true);
    expect(paid.gestell).toBe(w.gestell + 2);
    expect(paid.pois.find((poi) => poi.kind === "house-bounty")?.id).toBe(HOUSE_HALL.id);
    expect(paid.signs.find((s) => s.id === HOUSE_HALL.id)?.title).toBe(BOUNTY_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyBounty(paid, "a").players.get("a")?.heard).toBe(BOUNTY_HELD);
    expect(applyBounty(paid, "a").players.get("a")?.bestand).toBe(10 + BOUNTY_PAY);
    const viaRead = emptyWorld();
    viaRead.war = { ...emptyWar(), winner: "mortals", titheCut: WAR_TITHE, omen: WAR_OMEN_KEEP, tithePaid: true };
    viaRead.signs = [...viaRead.signs, { id: HOUSE_HALL.id, title: "House of Mortals", text: "Hall", x: HOUSE_HALL.x, y: HOUSE_HALL.y }];
    viaRead.players.set("a", { ...w.players.get("a")! });
    expect(applyRead(viaRead, "a", HOUSE_HALL.id).bountyHeld).toBe(true);

    const early = emptyWorld();
    early.war = { ...emptyWar(), winner: "mortals", titheCut: WAR_TITHE };
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      house: "mortals",
      beats: { ...emptyBeats(), hall: true },
      inCare: true,
      x: HOUSE_HALL.x,
      y: HOUSE_HALL.y,
    });
    expect(applyBounty(early, "a").players.get("a")?.heard).toBe(BOUNTY_NEED);

    const wrong = emptyWorld();
    wrong.war = { ...emptyWar(), winner: "sky", tithePaid: true };
    wrong.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      house: "mortals",
      inCare: true,
      x: HOUSE_HALL.x,
      y: HOUSE_HALL.y,
    });
    expect(applyBounty(wrong, "a").players.get("a")?.heard).toBe(BOUNTY_WRONG);

    const gWorld = emptyWorld();
    gWorld.war = { ...emptyWar(), winner: "mortals", tithePaid: true };
    gWorld.players.set("g", { ...spawnGuest("g"), x: HOUSE_HALL.x, y: HOUSE_HALL.y, locked: true });
    expect(applyBounty(gWorld, "g").players.get("g")?.heard).toBe(BOUNTY_SPECTATOR);
    expect(gWorld.bountyHeld).toBe(false);
  });

  it("holding the ring ticks a keep win without extra damage", () => {
    const w = emptyWorld();
    w.clearingOpen = true;
    w.players.set("a", mortal("a"));
    let cur = w;
    for (let i = 0; i < 50; i++) cur = tickWorld(cur, 0.05);
    expect(cur.war.winner).toBe("mortals");
    expect(cur.war.omen).toBe(WAR_OMEN_KEEP);
    expect(damageFor(cur.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
  });
});

describe("Wet Grid flagged PvP", () => {
  function angel(id: string, extra: Partial<ReturnType<typeof spawnGuest>> = {}) {
    return {
      ...spawnGuest(id),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      flagged: true,
      x: WET_GRID.x,
      y: WET_GRID.y,
      ...extra,
    };
  }

  it("flagging is opt-in; guests cannot flag", () => {
    const w = emptyWorld();
    w.players.set("a", angel("a", { flagged: false }));
    const flagged = applyFlag(w, "a");
    expect(flagged.players.get("a")?.flagged).toBe(true);
    expect(flagged.players.get("a")?.heard).toBe(FLAG_COPY);
    w.players.set("g", { ...spawnGuest("g"), x: WET_GRID.x, y: WET_GRID.y, locked: true });
    const g = applyFlag(w, "g");
    expect(g.players.get("g")?.flagged).toBe(false);
    expect(g.players.get("g")?.heard).toBe(FLAG_SPECTATOR);
    expect(guestCanClaim(g.players.get("g")!)).toBe(false);
  });

  it("flagged kill takes unbanked and copies, never cult or banked, never extra damage", () => {
    const w = emptyWorld();
    w.players.set("a", angel("a", { bestand: 10 }));
    w.players.set("b", angel("b", { x: WET_GRID.x + 20, y: WET_GRID.y, bestand: 100, banked: 80, cultWink: true, fakeWinke: 2, hp: 20 }));
    const after = applyStrike(w, "a");
    const a = after.players.get("a")!;
    const b = after.players.get("b")!;
    expect(a.bestand).toBe(10 + 30);
    expect(a.fakeWinke).toBe(1);
    expect(a.heard).toBe(SPOILS_COPY);
    expect(b.banked).toBe(80);
    expect(b.cultWink).toBe(true);
    expect(b.fakeWinke).toBe(0);
    expect(b.damaged).toBe(1);
    expect(b.bestand).toBe(70);
    expect(damageFor(a)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(a)).toBe(false);
  });

  it("guest kills pay nothing; camping the same grave feeds Gestell and thins aura", () => {
    const w = emptyWorld();
    w.players.set("a", angel("a"));
    w.players.set("g", { ...spawnGuest("g"), x: WET_GRID.x + 10, y: WET_GRID.y, hp: 20, bestand: 90 });
    const grief = applyStrike(w, "a");
    expect(grief.players.get("a")?.heard).toBe(GUEST_GRIEF);
    expect(grief.players.get("a")?.bestand).toBe(0);
    expect(grief.players.get("g")?.bestand).toBe(90);
    expect(grief.players.get("g")?.hp).toBe(20);
    expect(grief.wreckage.length).toBe(0);
    expect(damageFor(grief.players.get("a")!)).toBe(damageFor(spawnGuest("g")));

    const duel = emptyWorld();
    duel.players.set("a", angel("a", { lastKillId: "b" }));
    duel.players.set("b", angel("b", { x: WET_GRID.x + 16, y: WET_GRID.y, hp: 20, bestand: 40 }));
    const camp = applyStrike(duel, "a");
    expect(camp.players.get("a")?.heard).toBe(CAMP_COPY);
    expect(camp.players.get("a")?.aura).toBeLessThan(auraSeed(TEST_SERIAL));
    expect(camp.gestell).toBeGreaterThan(duel.gestell);
    expect(guestCanClaim(camp.players.get("a")!)).toBe(false);
  });
});

describe("Witness Blitz", () => {
  it("traces the last eight graves at a wreck; other kits and guests cannot", () => {
    const graves = Array.from({ length: 9 }, (_, i) => ({
      id: `w-${i}`,
      x: 200 + i * 80,
      y: 480,
      fromId: `p${i}`,
      fromName: `Angel ${i}`,
      until: 99,
    }));
    expect(lastWrecks(graves)).toHaveLength(BLITZ_COUNT);
    expect(lastWrecks(graves)[0]?.id).toBe("w-1");
    const w = emptyWorld();
    w.wreckage = graves;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: 2,
      messenger: "witness",
      x: graves[8].x,
      y: graves[8].y,
    });
    const traced = applyBlitz(w, "a");
    const p = traced.players.get("a")!;
    expect(p.heard).toBe(BLITZ_COPY);
    expect(p.wink).toBe(WINK_BLITZ);
    expect(p.beats.blitz).toBe(true);
    expect(traced.blitzHeld).toBe(true);
    expect(traced.blitzMarks).toHaveLength(BLITZ_COUNT);
    expect(traced.pois.find((poi) => poi.kind === "blitz-trace")?.x).toBe(graves[8].x);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyBlitz(traced, "a").players.get("a")?.heard).toBe(BLITZ_HELD);

    const herald = emptyWorld();
    herald.wreckage = graves;
    herald.players.set("h", {
      ...spawnGuest("h"),
      guest: false,
      messenger: "herald",
      x: graves[8].x,
      y: graves[8].y,
    });
    expect(applyBlitz(herald, "h").players.get("h")?.heard).toBe(BLITZ_NEED);
    expect(applyBlitz(herald, "h").blitzHeld).toBe(false);

    const gWorld = emptyWorld();
    gWorld.wreckage = graves;
    gWorld.players.set("g", { ...spawnGuest("g"), x: graves[8].x, y: graves[8].y, locked: true });
    expect(applyBlitz(gWorld, "g").players.get("g")?.heard).toBe(BLITZ_SPECTATOR);
    expect(gWorld.blitzHeld).toBe(false);
  });
});

describe("Ruin-angel storm at your back", () => {
  it("names the storm at a grave; wreckage vision without burning readiness; other kits cannot", () => {
    expect(messengerFor(3)).toBe("ruin-angel");
    const w = emptyWorld();
    w.wreckage = [{ id: "grave", x: 200, y: 480, fromId: "z", fromName: "Angel", until: 40 }];
    w.history = [{ id: "h-sky", serial: 9, x: 10, y: 10, line: "A foreign hour." }];
    w.failed = [{ ...FAILED_PASSING }];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: 3,
      messenger: "ruin-angel",
      readiness: 4,
      x: 200,
      y: 480,
    });
    const named = applyRuinBack(w, "a");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(RUIN_BACK);
    expect(p.wink).toBe(WINK_RUIN_BACK);
    expect(p.ruinBack).toBe(true);
    expect(p.beats.ruinBack).toBe(true);
    expect(p.readiness).toBe(5);
    expect(named.ruinBackHeld).toBe(true);
    expect(named.pois.find((poi) => poi.kind === "storm-back")?.x).toBe(200);
    expect(named.signs.find((s) => s.id === "storm-back")?.title).toBe(RUIN_BACK_PLAQUE.title);
    expect(visibleHistory(false, 3, named.history, p.ruinBack)).toHaveLength(1);
    expect(visibleFailed(false, 3, named.failed, "sky", p.ruinBack)).toHaveLength(1);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyRuinBack(named, "a").players.get("a")?.heard).toBe(RUIN_BACK_HELD);

    const herald = emptyWorld();
    herald.wreckage = w.wreckage;
    herald.players.set("h", {
      ...spawnGuest("h"),
      guest: false,
      messenger: "herald",
      x: 200,
      y: 480,
    });
    expect(applyRuinBack(herald, "h").players.get("h")?.heard).toBe(RUIN_BACK_NEED);
    expect(applyRuinBack(herald, "h").ruinBackHeld).toBe(false);

    const gWorld = emptyWorld();
    gWorld.wreckage = w.wreckage;
    gWorld.players.set("g", { ...spawnGuest("g"), x: 200, y: 480, locked: true });
    expect(applyRuinBack(gWorld, "g").players.get("g")?.heard).toBe(RUIN_BACK_SPECTATOR);
    expect(gWorld.ruinBackHeld).toBe(false);
  });
});

describe("Guest arena", () => {
  it("opens a practice dummy with no spoils; guests can; Gestell does not drink", () => {
    const w = emptyWorld();
    w.players.set("g", { ...spawnGuest("g"), x: GUEST_ARENA.x, y: GUEST_ARENA.y });
    const opened = applyArena(w, "g");
    const p = opened.players.get("g")!;
    expect(p.heard).toBe(ARENA_COPY);
    expect(p.beats.arena).toBe(true);
    expect(opened.arenaHeld).toBe(true);
    expect(opened.clerks.some((c) => c.dummy && c.id === "dummy-practice")).toBe(true);
    expect(opened.pois.find((poi) => poi.id === GUEST_ARENA.id)?.name).toBe("Guest arena — practice");
    expect(opened.signs.find((s) => s.id === GUEST_ARENA.id)?.title).toBe(ARENA_OPEN_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("x")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyArena(opened, "g").players.get("g")?.heard).toBe(ARENA_HELD);
    expect(applyRead(w, "g", GUEST_ARENA.id).arenaHeld).toBe(true);

    const dummy = opened.clerks.find((c) => c.dummy)!;
    opened.players.set("g", { ...opened.players.get("g")!, x: dummy.x, y: dummy.y, strikeCd: 0 });
    const first = applyStrike(opened, "g");
    expect(first.wreckage).toHaveLength(0);
    expect(first.gestell).toBe(opened.gestell);
    first.players.set("g", { ...first.players.get("g")!, strikeCd: 0 });
    const second = applyStrike(first, "g");
    expect(second.players.get("g")?.heard).toBe(ARENA_HIT);
    expect(second.wreckage).toHaveLength(0);
    expect(second.gestell).toBe(opened.gestell);
    expect(second.clerks.find((c) => c.dummy)?.hp).toBe(CLERK_HP);
    expect(guestCanClaim(second.players.get("g")!)).toBe(false);

    const locked = emptyWorld();
    locked.players.set("g", { ...spawnGuest("g"), x: GUEST_ARENA.x, y: GUEST_ARENA.y, locked: true });
    expect(applyArena(locked, "g").arenaHeld).toBe(true);

    const angel = emptyWorld();
    angel.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      x: GUEST_ARENA.x,
      y: GUEST_ARENA.y,
    });
    const aOpen = applyArena(angel, "a");
    expect(aOpen.arenaHeld).toBe(true);
    expect(damageFor(aOpen.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
  });
});

describe("Public screening", () => {
  it("Angels take a dispatch; guests cannot; combat is not", () => {
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      x: SCREENING.x,
      y: SCREENING.y,
    });
    const shown = applyScreening(w, "a");
    const p = shown.players.get("a")!;
    expect(p.heard).toBe(SCREENING_COPY);
    expect(p.wink).toBe(WINK_SCREENING);
    expect(p.beats.screening).toBe(true);
    expect(shown.screeningHeld).toBe(true);
    expect(shown.pois.find((poi) => poi.id === SCREENING.id)?.name).toBe("Dispatch");
    expect(shown.signs.find((s) => s.id === SCREENING.id)?.title).toBe(SCREENING_OPEN_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyScreening(shown, "a").players.get("a")?.heard).toBe(SCREENING_HELD);
    expect(applyRead(w, "a", SCREENING.id).screeningHeld).toBe(true);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: SCREENING.x, y: SCREENING.y, locked: true });
    expect(applyScreening(gWorld, "g").players.get("g")?.heard).toBe(SCREENING_SPECTATOR);
    expect(gWorld.screeningHeld).toBe(false);
  });

  it("gone-under Angels enter Participant room; guests cannot; combat is not", () => {
    const w = emptyWorld();
    w.screeningHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), screening: true, under: true },
      filmRoom: "observer",
      x: SCREENING.x,
      y: SCREENING.y,
    });
    const room = applyScreening(w, "a");
    const p = room.players.get("a")!;
    expect(p.heard).toBe(PARTICIPANT_COPY);
    expect(p.wink).toBe(WINK_PARTICIPANT);
    expect(p.beats.participant).toBe(true);
    expect(p.filmRoom).toBe("participant");
    expect(room.participantHeld).toBe(true);
    expect(room.pois.find((poi) => poi.id === SCREENING.id)?.kind).toBe("screening-participant");
    expect(room.signs.find((s) => s.id === SCREENING.id)?.title).toBe(PARTICIPANT_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyParticipant(room, "a").players.get("a")?.heard).toBe(PARTICIPANT_HELD);

    const observer = emptyWorld();
    observer.screeningHeld = true;
    observer.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), screening: true },
      x: SCREENING.x,
      y: SCREENING.y,
    });
    expect(applyParticipant(observer, "a").players.get("a")?.heard).toBe(PARTICIPANT_NEED);
    expect(applyScreening(observer, "a").players.get("a")?.heard).toBe(SCREENING_HELD);

    const gWorld = emptyWorld();
    gWorld.screeningHeld = true;
    gWorld.players.set("g", {
      ...spawnGuest("g"),
      x: SCREENING.x,
      y: SCREENING.y,
      locked: true,
      beats: { ...emptyBeats(), screening: true, under: true },
    });
    expect(applyParticipant(gWorld, "g").players.get("g")?.heard).toBe(PARTICIPANT_SPECTATOR);
    expect(gWorld.participantHeld).toBe(false);
  });

  it("optional production still personalizes the screening Wink; guests cannot", () => {
    expect(winkSchoolFor(TEST_SERIAL)).toBe("hint");
    expect(winkSchoolFor(2)).toBe("wreckage");
    expect(schoolWink("hint")).not.toBe(schoolWink("wreckage"));
    const w = emptyWorld();
    w.screeningHeld = true;
    w.participantHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      winkSchool: "hint",
      beats: { ...emptyBeats(), screening: true, under: true, participant: true },
      x: STILL.x,
      y: STILL.y,
    });
    const still = applyStill(w, "a");
    const p = still.players.get("a")!;
    expect(p.heard).toBe(STILL_COPY);
    expect(p.wink).toBe(schoolWink("hint"));
    expect(p.beats.still).toBe(true);
    expect(still.stillHeld).toBe(true);
    expect(still.pois.find((poi) => poi.id === STILL.id)?.name).toBe("Still — hint");
    expect(still.signs.find((s) => s.id === STILL.id)?.title).toBe(STILL_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyStill(still, "a").players.get("a")?.heard).toBe(STILL_HELD);

    const other = emptyWorld();
    other.screeningHeld = true;
    other.participantHeld = true;
    other.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      serial: 2,
      winkSchool: "wreckage",
      beats: { ...emptyBeats(), screening: true, under: true, participant: true },
      x: STILL.x,
      y: STILL.y,
    });
    expect(applyStill(other, "b").players.get("b")?.wink).toBe(schoolWink("wreckage"));
    expect(applyStill(other, "b").pois.find((poi) => poi.id === STILL.id)?.name).toBe("Still — wreckage");

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      x: STILL.x,
      y: STILL.y,
    });
    expect(applyStill(early, "a").players.get("a")?.heard).toBe(STILL_NEED);

    const gWorld = emptyWorld();
    gWorld.participantHeld = true;
    gWorld.players.set("g", {
      ...spawnGuest("g"),
      x: STILL.x,
      y: STILL.y,
      locked: true,
      beats: { ...emptyBeats(), participant: true },
    });
    expect(applyStill(gWorld, "g").players.get("g")?.heard).toBe(STILL_SPECTATOR);
    expect(gWorld.stillHeld).toBe(false);
  });

  it("credits plus Participant enter Founder room; guests cannot; combat is not", () => {
    const w = emptyWorld();
    w.screeningHeld = true;
    w.participantHeld = true;
    w.creditsHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), screening: true, under: true, participant: true, credits: true },
      filmRoom: "participant",
      x: SCREENING.x,
      y: SCREENING.y,
    });
    const room = applyScreening(w, "a");
    const p = room.players.get("a")!;
    expect(p.heard).toBe(FOUNDER_COPY);
    expect(p.wink).toBe(WINK_FOUNDER);
    expect(p.beats.founder).toBe(true);
    expect(p.filmRoom).toBe("founder");
    expect(room.founderHeld).toBe(true);
    expect(room.pois.find((poi) => poi.id === SCREENING.id)?.kind).toBe("screening-founder");
    expect(room.signs.find((s) => s.id === SCREENING.id)?.title).toBe(FOUNDER_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyFounder(room, "a").players.get("a")?.heard).toBe(FOUNDER_HELD);
    expect(applyScreening(room, "a").players.get("a")?.heard).toBe(FOUNDER_HELD);

    const early = emptyWorld();
    early.screeningHeld = true;
    early.participantHeld = true;
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), screening: true, under: true, participant: true },
      filmRoom: "participant",
      x: SCREENING.x,
      y: SCREENING.y,
    });
    expect(applyFounder(early, "a").players.get("a")?.heard).toBe(FOUNDER_NEED);
    expect(applyFounder(early, "a").founderHeld).toBe(false);

    const gWorld = emptyWorld();
    gWorld.screeningHeld = true;
    gWorld.participantHeld = true;
    gWorld.creditsHeld = true;
    gWorld.players.set("g", {
      ...spawnGuest("g"),
      x: SCREENING.x,
      y: SCREENING.y,
      locked: true,
      beats: { ...emptyBeats(), screening: true, under: true, participant: true, credits: true },
    });
    expect(applyFounder(gWorld, "g").players.get("g")?.heard).toBe(FOUNDER_SPECTATOR);
    expect(gWorld.founderHeld).toBe(false);
  });
});

describe("Ruin-angel history log", () => {
  it("writes Passings/burials/loot/Houses and reads them in Founder room; other kits cannot", () => {
    const log = { passings: 1, buried: 2, looted: 1, houses: ["earth" as const] };
    expect(logCopy(log)).toContain("Passings 1");
    expect(logCopy(emptyLog())).toContain("Houses none");
    const w = emptyWorld();
    w.founderHeld = true;
    w.participantHeld = true;
    w.creditsHeld = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: 3,
      messenger: "ruin-angel",
      beats: { ...emptyBeats(), founder: true, participant: true, credits: true },
      filmRoom: "founder",
      historyLog: log,
      x: SCREENING.x,
      y: SCREENING.y,
    });
    const read = applyLog(w, "a");
    const p = read.players.get("a")!;
    expect(p.heard).toBe(logCopy(log));
    expect(p.wink).toBe(WINK_LOG);
    expect(p.beats.log).toBe(true);
    expect(read.logHeld).toBe(true);
    expect(read.pois.find((poi) => poi.id === SCREENING.id)?.kind).toBe("screening-log");
    expect(read.signs.find((s) => s.id === SCREENING.id)?.title).toBe(LOG_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyLog(read, "a").players.get("a")?.heard).toBe(LOG_HELD);

    const herald = emptyWorld();
    herald.founderHeld = true;
    herald.participantHeld = true;
    herald.creditsHeld = true;
    herald.players.set("h", {
      ...spawnGuest("h"),
      guest: false,
      messenger: "herald",
      beats: { ...emptyBeats(), founder: true, participant: true, credits: true },
      x: SCREENING.x,
      y: SCREENING.y,
    });
    expect(applyLog(herald, "h").players.get("h")?.heard).toBe(LOG_NEED);
    expect(applyFounder(herald, "h").players.get("h")?.heard).toBe(FOUNDER_HELD);

    const gWorld = emptyWorld();
    gWorld.founderHeld = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: SCREENING.x, y: SCREENING.y, locked: true });
    expect(applyLog(gWorld, "g").players.get("g")?.heard).toBe(LOG_SPECTATOR);
    expect(gWorld.logHeld).toBe(false);
  });
});

describe("Cybernetic process read", () => {
  it("reads a live node as process; other kits and guests cannot", () => {
    expect(messengerFor(5)).toBe("cybernetic");
    const w = emptyWorld();
    const node = w.nodes[0];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: 5,
      messenger: "cybernetic",
      x: node.x,
      y: node.y,
    });
    const read = applyCyber(w, "a", node.id);
    const p = read.players.get("a")!;
    expect(p.heard).toBe(CYBER_COPY);
    expect(p.wink).toBe(WINK_CYBER);
    expect(p.beats.cyber).toBe(true);
    expect(read.cyberHeld).toBe(true);
    expect(read.pois.find((poi) => poi.kind === "process-read")?.x).toBe(node.x);
    expect(read.signs.find((s) => s.id === "process-read")?.title).toBe(CYBER_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyCyber(read, "a", node.id).players.get("a")?.heard).toBe(CYBER_HELD);

    const herald = emptyWorld();
    herald.players.set("h", {
      ...spawnGuest("h"),
      guest: false,
      messenger: "herald",
      x: node.x,
      y: node.y,
    });
    expect(applyCyber(herald, "h", node.id).players.get("h")?.heard).toBe(CYBER_NEED);
    expect(applyCyber(herald, "h", node.id).cyberHeld).toBe(false);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: node.x, y: node.y, locked: true });
    expect(applyCyber(gWorld, "g", node.id).players.get("g")?.heard).toBe(CYBER_SPECTATOR);
    expect(gWorld.cyberHeld).toBe(false);
  });
});

describe("Iridescent Glamour", () => {
  it("paints a live stall as surface; other kits and guests cannot", () => {
    expect(messengerFor(6)).toBe("iridescent");
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: 6,
      messenger: "iridescent",
      x: CLEARING_STALL.x,
      y: CLEARING_STALL.y,
    });
    const painted = applyGlamour(w, "a");
    const p = painted.players.get("a")!;
    expect(p.heard).toBe(GLAMOUR_COPY);
    expect(p.wink).toBe(WINK_GLAMOUR);
    expect(p.beats.glamour).toBe(true);
    expect(p.surface).toBe(true);
    expect(painted.glamourHeld).toBe(true);
    expect(painted.pois.find((poi) => poi.id === CLEARING_STALL.id)?.kind).toBe("stall-glamour");
    expect(painted.signs.find((s) => s.id === CLEARING_STALL.id)?.title).toBe(GLAMOUR_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyGlamour(painted, "a").players.get("a")?.heard).toBe(GLAMOUR_HELD);
    expect(snapshot(painted).glamourHeld).toBe(true);

    const viaRead = emptyWorld();
    viaRead.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      messenger: "iridescent",
      x: CLEARING_STALL.x,
      y: CLEARING_STALL.y,
    });
    expect(applyRead(viaRead, "a", CLEARING_STALL.id).glamourHeld).toBe(true);

    const herald = emptyWorld();
    herald.players.set("h", {
      ...spawnGuest("h"),
      guest: false,
      messenger: "herald",
      x: CLEARING_STALL.x,
      y: CLEARING_STALL.y,
    });
    expect(applyGlamour(herald, "h").players.get("h")?.heard).toBe(GLAMOUR_NEED);
    expect(applyGlamour(herald, "h").glamourHeld).toBe(false);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: CLEARING_STALL.x, y: CLEARING_STALL.y, locked: true });
    expect(applyGlamour(gWorld, "g").players.get("g")?.heard).toBe(GLAMOUR_SPECTATOR);
    expect(gWorld.glamourHeld).toBe(false);

    const dark = emptyWorld();
    dark.stallDark = true;
    dark.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      messenger: "iridescent",
      x: CLEARING_STALL.x,
      y: CLEARING_STALL.y,
    });
    expect(applyGlamour(dark, "a").players.get("a")?.heard).toBe(GLAMOUR_DARK);
    expect(applyGlamour(dark, "a").glamourHeld).toBe(false);

    const hung = applyHang({
      ...painted,
      players: new Map([
        [
          "a",
          {
            ...p,
            beats: { ...p.beats, hangAsk: true },
            cultWink: true,
          },
        ],
      ]),
    }, "a");
    expect(hung.stallDark).toBe(true);
    expect(hung.pois.find((poi) => poi.id === CLEARING_STALL.id)?.kind).toBe("stall-dark");
    expect(damageFor(hung.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
  });
});

describe("Dweller Keep seed", () => {
  it("plants a Clearing seed on a kept tile; other kits and guests cannot", () => {
    expect(messengerFor(4)).toBe("dweller");
    const w = emptyWorld();
    const node = w.nodes[0];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: 4,
      messenger: "dweller",
      x: node.x,
      y: node.y,
    });
    const kept = applyUse(w, "a", node.id, "keep");
    expect(kept.nodes[0].kept).toBe(true);
    const seeded = applyDwell(kept, "a", node.id);
    const p = seeded.players.get("a")!;
    expect(p.heard).toBe(DWELL_COPY);
    expect(p.wink).toBe(WINK_DWELL);
    expect(p.beats.dwell).toBe(true);
    expect(seeded.dwellHeld).toBe(true);
    expect(seeded.pois.find((poi) => poi.kind === "clearing-seed")?.x).toBe(node.x);
    expect(seeded.signs.find((s) => s.id === "clearing-seed")?.title).toBe(DWELL_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyDwell(seeded, "a", node.id).players.get("a")?.heard).toBe(DWELL_HELD);
    expect(snapshot(seeded).dwellHeld).toBe(true);

    const raw = emptyWorld();
    raw.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      messenger: "dweller",
      x: node.x,
      y: node.y,
    });
    expect(applyDwell(raw, "a", node.id).dwellHeld).toBe(false);
    expect(applyDwell(raw, "a", node.id).players.get("a")?.heard).toBe(DWELL_NEED);

    const herald = emptyWorld();
    herald.nodes[0] = { ...node, depleted: true, kept: true };
    herald.players.set("h", {
      ...spawnGuest("h"),
      guest: false,
      messenger: "herald",
      x: node.x,
      y: node.y,
    });
    expect(applyDwell(herald, "h", node.id).players.get("h")?.heard).toBe(DWELL_NEED);
    expect(applyDwell(herald, "h", node.id).dwellHeld).toBe(false);

    const gWorld = emptyWorld();
    gWorld.nodes[0] = { ...node, depleted: true, kept: true };
    gWorld.players.set("g", { ...spawnGuest("g"), x: node.x, y: node.y, locked: true });
    expect(applyDwell(gWorld, "g", node.id).players.get("g")?.heard).toBe(DWELL_SPECTATOR);
    expect(gWorld.dwellHeld).toBe(false);
  });
});

describe("Nara leaves the party", () => {
  it("extract past fat Gestell without a funeral walks her off; a funeral keeps her", () => {
    expect(NARA_LEAVE_GESTELL).toBe(71);
    const w = emptyWorld();
    const node = w.nodes[0];
    w.gestell = 70;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      x: node.x,
      y: node.y,
    });
    const left = applyUse(w, "a", node.id, "extract");
    const p = left.players.get("a")!;
    expect(left.gestell).toBeGreaterThanOrEqual(NARA_LEAVE_GESTELL);
    expect(left.naraGone).toBe(true);
    expect(p.beats.naraGone).toBe(true);
    expect(p.heard).toBe(NARA_LEAVE);
    expect(p.wink).toBe(WINK_NARA_LEAVE);
    expect(left.pois.find((poi) => poi.kind === "nara-gone")?.id).toBe("nara-gone");
    expect(left.signs.find((s) => s.id === "nara-gone")?.title).toBe(NARA_GONE_PLAQUE.title);
    expect(liveNpcs(false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true).some((n) => n.id === "nara")).toBe(false);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(snapshot(left).naraGone).toBe(true);

    const kept = emptyWorld();
    kept.gestell = 70;
    kept.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), funeral: true },
      x: node.x,
      y: node.y,
    });
    const stayed = applyUse(kept, "a", node.id, "extract");
    expect(stayed.naraGone).toBe(false);
    expect(stayed.players.get("a")?.heard).not.toBe(NARA_LEAVE);
    expect(liveNpcs(false).some((n) => n.id === "nara")).toBe(true);

    const gWorld = emptyWorld();
    gWorld.gestell = 70;
    gWorld.players.set("g", { ...spawnGuest("g"), x: node.x, y: node.y });
    const guest = applyUse(gWorld, "g", node.id, "extract");
    expect(guest.naraGone).toBe(false);
    expect(guest.gestell).toBeGreaterThanOrEqual(NARA_LEAVE_GESTELL);
  });
});

describe("Nara stays as a person", () => {
  it("after a funeral she stays as a person, not a function; guests cannot", () => {
    const nara = NAVE_NPCS.find((n) => n.id === "nara")!;
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), funeral: true },
      x: nara.x,
      y: nara.y,
    });
    const stayed = applyTalk(w, "a", "nara");
    const p = stayed.players.get("a")!;
    expect(p.heard).toBe(NARA_PERSON);
    expect(p.wink).toBe(WINK_NARA_PERSON);
    expect(p.beats.naraPerson).toBe(true);
    expect(stayed.naraPersonHeld).toBe(true);
    expect(stayed.pois.find((poi) => poi.kind === "nara-person")?.id).toBe("nara-person");
    expect(stayed.signs.find((s) => s.id === "nara-person")?.title).toBe(NARA_PERSON_PLAQUE.title);
    expect(liveNpcs(false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true).find((n) => n.id === "nara")?.role).toBe("Stays");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyTalk(stayed, "a", "nara").players.get("a")?.heard).toBe(NARA_PERSON_HELD);

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      x: nara.x,
      y: nara.y,
    });
    expect(applyNaraPerson(early, "a").players.get("a")?.heard).toBe(NARA_PERSON_NEED);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: nara.x, y: nara.y, locked: true, beats: { ...emptyBeats(), funeral: true } });
    expect(applyTalk(gWorld, "g", "nara").players.get("g")?.heard).toBe(NARA_PERSON_SPECTATOR);
    expect(gWorld.naraPersonHeld).toBe(false);
  });
});

describe("Quill stays as a person", () => {
  it("after unflag she stays as a person, not a listing; guests cannot", () => {
    const quill = NAVE_NPCS.find((n) => n.id === "quill")!;
    const w = emptyWorld();
    w.wetCult = true;
    w.quillAtGrid = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), unflag: true, hang: true, market: true },
      x: WET_GRID.x + 48,
      y: WET_GRID.y,
    });
    const stayed = applyTalk(w, "a", "quill");
    const p = stayed.players.get("a")!;
    expect(p.heard).toBe(QUILL_PERSON);
    expect(p.wink).toBe(WINK_QUILL_PERSON);
    expect(p.beats.quillPerson).toBe(true);
    expect(stayed.quillPersonHeld).toBe(true);
    expect(stayed.pois.find((poi) => poi.kind === "quill-person")?.id).toBe("quill-person");
    expect(stayed.signs.find((s) => s.id === "quill-person")?.title).toBe(QUILL_PERSON_PLAQUE.title);
    expect(liveNpcs(false, false, false, true, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, true).find((n) => n.id === "quill")?.role).toBe("Stays");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyTalk(stayed, "a", "quill").players.get("a")?.heard).toBe(QUILL_PERSON_HELD);

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      x: quill.x,
      y: quill.y,
    });
    expect(applyQuillPerson(early, "a").players.get("a")?.heard).toBe(QUILL_PERSON_NEED);

    const gWorld = emptyWorld();
    gWorld.wetCult = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: quill.x, y: quill.y, locked: true, beats: { ...emptyBeats(), unflag: true } });
    expect(applyTalk(gWorld, "g", "quill").players.get("g")?.heard).toBe(QUILL_PERSON_SPECTATOR);
    expect(gWorld.quillPersonHeld).toBe(false);
  });
});

describe("Ord stays as a person", () => {
  it("after a freeze he stays as a person, not a number; guests cannot", () => {
    const ord = NAVE_NPCS.find((n) => n.id === "ord")!;
    const w = emptyWorld();
    w.frozen = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), freeze: true },
      x: ord.x,
      y: ord.y,
    });
    const stayed = applyTalk(w, "a", "ord");
    const p = stayed.players.get("a")!;
    expect(p.heard).toBe(ORD_PERSON);
    expect(p.wink).toBe(WINK_ORD_PERSON);
    expect(p.beats.ordPerson).toBe(true);
    expect(stayed.ordPersonHeld).toBe(true);
    expect(stayed.pois.find((poi) => poi.kind === "ord-person")?.id).toBe("ord-person");
    expect(stayed.signs.find((s) => s.id === "ord-person")?.title).toBe(ORD_PERSON_PLAQUE.title);
    expect(liveNpcs(false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true).find((n) => n.id === "ord")?.role).toBe("Stays");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyTalk(stayed, "a", "ord").players.get("a")?.heard).toBe(ORD_PERSON_HELD);

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      x: ord.x,
      y: ord.y,
    });
    expect(applyOrdPerson(early, "a").players.get("a")?.heard).toBe(ORD_PERSON_NEED);

    const gWorld = emptyWorld();
    gWorld.frozen = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: ord.x, y: ord.y, locked: true, beats: { ...emptyBeats(), freeze: true } });
    expect(applyTalk(gWorld, "g", "ord").players.get("g")?.heard).toBe(ORD_PERSON_SPECTATOR);
    expect(gWorld.ordPersonHeld).toBe(false);
  });
});

describe("Vesper stays as a person", () => {
  it("after unlight she stays as a person, not a concentrator; guests cannot", () => {
    const w = emptyWorld();
    w.foundryDark = true;
    w.vesperAtFoundry = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), foundryDark: true },
      x: VESPER.x,
      y: VESPER.y,
    });
    const stayed = applyTalk(w, "a", "vesper");
    const p = stayed.players.get("a")!;
    expect(p.heard).toBe(VESPER_PERSON);
    expect(p.wink).toBe(WINK_VESPER_PERSON);
    expect(p.beats.vesperPerson).toBe(true);
    expect(stayed.vesperPersonHeld).toBe(true);
    expect(stayed.pois.find((poi) => poi.kind === "vesper-person")?.id).toBe("vesper-person");
    expect(stayed.signs.find((s) => s.id === "vesper-person")?.title).toBe(VESPER_PERSON_PLAQUE.title);
    expect(liveNpcs(false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true).find((n) => n.id === "vesper")?.role).toBe("Stays");
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyTalk(stayed, "a", "vesper").players.get("a")?.heard).toBe(VESPER_PERSON_HELD);

    const early = emptyWorld();
    early.vesperAtFoundry = true;
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      x: VESPER.x,
      y: VESPER.y,
    });
    expect(applyVesperPerson(early, "a").players.get("a")?.heard).toBe(VESPER_PERSON_NEED);

    const gWorld = emptyWorld();
    gWorld.foundryDark = true;
    gWorld.vesperAtFoundry = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: VESPER.x, y: VESPER.y, locked: true, beats: { ...emptyBeats(), foundryDark: true } });
    expect(applyTalk(gWorld, "g", "vesper").players.get("g")?.heard).toBe(VESPER_PERSON_SPECTATOR);
    expect(gWorld.vesperPersonHeld).toBe(false);
  });
});

describe("Ord leaves the party", () => {
  it("extract at max Gestell without a freeze walks him off; a freeze keeps him", () => {
    expect(ORD_LEAVE_GESTELL).toBe(100);
    const w = emptyWorld();
    const node = w.nodes[0];
    w.gestell = 96;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      x: node.x,
      y: node.y,
    });
    const left = applyUse(w, "a", node.id, "extract");
    const p = left.players.get("a")!;
    expect(left.gestell).toBe(100);
    expect(left.ordGone).toBe(true);
    expect(p.beats.ordGone).toBe(true);
    expect(p.heard).toBe(ORD_LEAVE);
    expect(p.wink).toBe(WINK_ORD_LEAVE);
    expect(left.pois.find((poi) => poi.kind === "ord-gone")?.id).toBe("ord-gone");
    expect(left.signs.find((s) => s.id === "ord-gone")?.title).toBe(ORD_GONE_PLAQUE.title);
    expect(liveNpcs(false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true).some((n) => n.id === "ord")).toBe(false);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(snapshot(left).ordGone).toBe(true);

    const frozen = emptyWorld();
    frozen.gestell = 96;
    frozen.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), freeze: true },
      x: node.x,
      y: node.y,
    });
    const stayed = applyUse(frozen, "a", node.id, "extract");
    expect(stayed.ordGone).toBe(false);
    expect(stayed.players.get("a")?.heard).not.toBe(ORD_LEAVE);
    expect(liveNpcs(false).some((n) => n.id === "ord")).toBe(true);

    const held = emptyWorld();
    held.gestell = 96;
    held.frozen = true;
    held.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      x: node.x,
      y: node.y,
    });
    expect(applyUse(held, "a", node.id, "extract").ordGone).toBe(false);

    const gWorld = emptyWorld();
    gWorld.gestell = 96;
    gWorld.players.set("g", { ...spawnGuest("g"), x: node.x, y: node.y });
    const guest = applyUse(gWorld, "g", node.id, "extract");
    expect(guest.ordGone).toBe(false);
    expect(guest.gestell).toBe(100);
  });
});

describe("Quill leaves the party", () => {
  it("selling a copy without hanging the prayer walks her off; hang keeps her", () => {
    const tray = emptyWorld();
    tray.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), market: true, forge: true },
      x: FORGE_TRAY.x,
      y: FORGE_TRAY.y,
    });
    const left = applyForge(tray, "a", "sell");
    const p = left.players.get("a")!;
    expect(left.quillGone).toBe(true);
    expect(p.beats.quillGone).toBe(true);
    expect(p.heard).toBe(QUILL_LEAVE);
    expect(p.wink).toBe(WINK_QUILL_LEAVE);
    expect(left.pois.find((poi) => poi.kind === "quill-gone")?.id).toBe("quill-gone");
    expect(left.signs.find((s) => s.id === "quill-gone")?.title).toBe(QUILL_GONE_PLAQUE.title);
    expect(liveNpcs(false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true).some((n) => n.id === "quill")).toBe(false);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(snapshot(left).quillGone).toBe(true);

    const hung = emptyWorld();
    hung.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), market: true, forge: true, hang: true },
      x: FORGE_TRAY.x,
      y: FORGE_TRAY.y,
    });
    const stayed = applyForge(hung, "a", "sell");
    expect(stayed.quillGone).toBe(false);
    expect(stayed.players.get("a")?.heard).toBe(FORGE_SELL);
    expect(liveNpcs(false).some((n) => n.id === "quill")).toBe(true);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: FORGE_TRAY.x, y: FORGE_TRAY.y, locked: true });
    const guest = applyForge(gWorld, "g", "sell");
    expect(guest.quillGone).toBe(false);
    expect(guest.forgedSold).toBe(false);
  });
});

describe("Vesper leaves the desk", () => {
  it("keeping a Clearing with live Cold heat walks her off; unlight keeps her", () => {
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      beats: { ...emptyBeats(), garden: true, lastWord: true, cold: true },
      current: "cold",
      x: CLEARING_RING.x,
      y: CLEARING_RING.y,
    });
    const left = applyClearing(w, "a", "keep");
    const p = left.players.get("a")!;
    expect(left.clearingOpen).toBe(true);
    expect(left.vesperGone).toBe(true);
    expect(p.beats.vesperGone).toBe(true);
    expect(p.heard).toBe(VESPER_LEAVE);
    expect(p.wink).toBe(WINK_VESPER_LEAVE);
    expect(left.pois.find((poi) => poi.kind === "vesper-gone")?.id).toBe("vesper-gone");
    expect(left.signs.find((s) => s.id === "vesper-gone")?.title).toBe(VESPER_GONE_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(snapshot(left).vesperGone).toBe(true);
    left.players.set("a", { ...p, x: OPERATOR_DESK.x, y: OPERATOR_DESK.y });
    expect(applyOperator(left, "a", "hear").players.get("a")?.heard).toBe(VESPER_LEAVE_HELD);

    const unlit = emptyWorld();
    unlit.foundryDark = true;
    unlit.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), garden: true, lastWord: true, cold: true, foundryDark: true },
      current: "cold",
      x: CLEARING_RING.x,
      y: CLEARING_RING.y,
    });
    const stayed = applyClearing(unlit, "a", "keep");
    expect(stayed.vesperGone).toBe(false);
    expect(stayed.players.get("a")?.heard).toBe(CLEARING_PREPARE);

    const refused = emptyWorld();
    refused.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), garden: true, lastWord: true, refuse: true },
      x: CLEARING_RING.x,
      y: CLEARING_RING.y,
    });
    expect(applyClearing(refused, "a", "keep").vesperGone).toBe(false);

    const gWorld = emptyWorld();
    gWorld.players.set("g", {
      ...spawnGuest("g"),
      x: CLEARING_RING.x,
      y: CLEARING_RING.y,
      locked: true,
      beats: { ...emptyBeats(), garden: true, lastWord: true, cold: true },
    });
    expect(applyClearing(gWorld, "g", "keep").vesperGone).toBe(false);
  });
});

describe("Desk vault", () => {
  it("banks unbanked so spoils cannot take it; guests cannot; TAKE stays disarmed", () => {
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      bestand: 40,
      banked: 5,
      x: CLAIMS_DESK.x,
      y: CLAIMS_DESK.y,
    });
    const vault = applyDesk(w, "a", "bank");
    const p = vault.players.get("a")!;
    expect(p.heard).toBe(BANK_COPY);
    expect(p.wink).toBe(WINK_BANK);
    expect(p.bestand).toBe(0);
    expect(p.banked).toBe(45);
    expect(vault.deskVaulted).toBe(true);
    expect(vault.pois.find((poi) => poi.id === CLAIMS_DESK.id)?.kind).toBe("claims-vault");
    expect(vault.signs.find((s) => s.id === CLAIMS_DESK.id)?.title).toBe(BANK_PLAQUE.title);
    expect(p.heard).not.toMatch(/APY|yield faucet|\$REVERIE settle live/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyDesk(vault, "a", "take").players.get("a")?.heard).toBe(DESK_EMPTY);
    expect(applyDesk(vault, "a", "bank").players.get("a")?.heard).toBe(BANK_EMPTY);

    const fight = emptyWorld();
    fight.players.set("k", {
      ...spawnGuest("k"),
      guest: false,
      flagged: true,
      x: WET_GRID.x,
      y: WET_GRID.y,
    });
    fight.players.set("v", {
      ...spawnGuest("v"),
      guest: false,
      flagged: true,
      x: WET_GRID.x + 10,
      y: WET_GRID.y,
      hp: 20,
      bestand: 0,
      banked: 45,
    });
    const after = applyStrike(fight, "k");
    expect(after.players.get("k")?.bestand).toBe(0);
    expect(after.players.get("v")?.banked).toBe(45);

    w.players.set("g", { ...spawnGuest("g"), x: CLAIMS_DESK.x, y: CLAIMS_DESK.y, locked: true, bestand: 99 });
    const g = applyDesk(w, "g", "bank");
    expect(g.players.get("g")?.heard).toBe(BANK_SPECTATOR);
    expect(g.players.get("g")?.banked).toBe(0);
    expect(g.deskVaulted).toBe(false);
  });

  it("vault covers shrine keep when the pocket is short; guests still cannot", () => {
    expect(spendBestand({ bestand: 8, banked: 0 }, 8)).toEqual({ bestand: 0, banked: 0, fromVault: 0 });
    expect(spendBestand({ bestand: 3, banked: 10 }, 8)).toEqual({ bestand: 0, banked: 5, fromVault: 5 });
    expect(spendBestand({ bestand: 2, banked: 2 }, 8)).toBeNull();
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      bestand: 3,
      banked: 10,
      x: SHRINE.x,
      y: SHRINE.y,
    });
    const paid = applyShrine(w, "a");
    const p = paid.players.get("a")!;
    expect(p.bestand).toBe(0);
    expect(p.banked).toBe(5);
    expect(p.heard).toBe(`${SHRINE_COPY} ${VAULT_COVER}`);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const broke = emptyWorld();
    broke.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      bestand: 1,
      banked: 1,
      x: SHRINE.x,
      y: SHRINE.y,
    });
    expect(applyShrine(broke, "a").players.get("a")?.heard).toBe(SHRINE_NEED);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: SHRINE.x, y: SHRINE.y, locked: true, banked: 99 });
    expect(applyShrine(gWorld, "g").players.get("g")?.heard).toBe(SHRINE_SPECTATOR);
    expect(gWorld.players.get("g")?.banked).toBe(99);
  });
});

describe("Claims desk disarmed", () => {
  it("Angel files a claim; TAKE stays disarmed; guests cannot claim", () => {
    expect(CLAIMS_ARMED).toBe(false);
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      bestand: 40,
      x: CLAIMS_DESK.x,
      y: CLAIMS_DESK.y,
    });
    const filed = applyDesk(w, "a", "file");
    const p = filed.players.get("a")!;
    expect(p.bestand).toBe(0);
    expect(p.claims).toHaveLength(1);
    expect(p.claims[0]?.amount).toBe(40);
    expect(p.claims[0]?.readyAt).toBe(CLAIM_HOLD);
    expect(p.heard).toBe(DESK_FILE);
    expect(p.heard).toMatch(/not a yield/i);
    expect(guestCanClaim(p)).toBe(false);

    const early = applyDesk(filed, "a", "take");
    expect(early.players.get("a")?.heard).toBe(DESK_WAIT);
    expect(early.players.get("a")?.bestand).toBe(0);

    filed.now = CLAIM_HOLD;
    const take = applyDesk(filed, "a", "take");
    expect(take.players.get("a")?.heard).toBe(DESK_DISARMED);
    expect(take.players.get("a")?.bestand).toBe(0);
    expect(take.players.get("a")?.claims).toHaveLength(1);
    expect(take.players.get("a")?.heard).not.toMatch(/APY|settle live/i);
    expect(damageFor(take.players.get("a")!)).toBe(damageFor(spawnGuest("g")));

    const empty = applyDesk({ ...w, players: new Map([["a", { ...p, bestand: 0, claims: [] }]]) }, "a", "file");
    expect(empty.players.get("a")?.heard).toBe(DESK_EMPTY);

    w.players.set("g", { ...spawnGuest("g"), x: CLAIMS_DESK.x, y: CLAIMS_DESK.y, locked: true, bestand: 99 });
    const guest = applyDesk(w, "g", "file");
    expect(guest.players.get("g")?.heard).toBe(DESK_SPECTATOR);
    expect(guest.players.get("g")?.claims).toEqual([]);
    expect(guest.players.get("g")?.bestand).toBe(99);
    expect(guestCanClaim(guest.players.get("g")!)).toBe(false);
  });
});

describe("Ruin duel", () => {
  it("1v1 at a wreckage takes unbanked not cult; spectators gain capped aura", () => {
    const w = emptyWorld();
    w.wreckage = [{ id: "grave", x: 200, y: 480, fromId: "z", fromName: "Angel", until: 40 }];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      messenger: "ruin-angel",
      aura: auraSeed(TEST_SERIAL),
      x: 200,
      y: 480,
      bestand: 5,
    });
    w.players.set("b", {
      ...spawnGuest("b"),
      guest: false,
      serial: 2,
      messenger: "herald",
      x: 210,
      y: 480,
      hp: 20,
      bestand: 100,
      banked: 50,
      cultWink: true,
      fakeWinke: 1,
    });
    w.players.set("s", {
      ...spawnGuest("s"),
      guest: false,
      serial: 3,
      aura: 4,
      x: 200,
      y: 500,
    });
    w.players.set("g", { ...spawnGuest("g"), x: 200, y: 490 });
    const after = applyStrike(w, "a");
    const a = after.players.get("a")!;
    const b = after.players.get("b")!;
    const s = after.players.get("s")!;
    expect(a.heard).toBe(DUEL_COPY);
    expect(a.wink).toBe(WINK_DUEL);
    expect(a.bestand).toBe(5 + 30);
    expect(b.banked).toBe(50);
    expect(b.cultWink).toBe(true);
    expect(s.aura).toBe(5);
    expect(s.spectated).toBe(1);
    expect(s.heard).toBe(SPECTATE_COPY);
    expect(after.players.get("g")?.aura).toBe(0);
    expect(SPECTATE_CAP).toBe(3);
    expect(damageFor(a)).toBe(damageFor({ ...spawnGuest("h"), messenger: "herald" }));
    expect(guestCanClaim(a)).toBe(false);

    s.hp = 100;
    after.players.set("s", { ...s, x: 200, y: 500 });
    after.players.set("a", { ...a, strikeCd: 0 });
    after.players.set("c", {
      ...spawnGuest("c"),
      guest: false,
      x: 208,
      y: 480,
      hp: 20,
      bestand: 10,
    });
    let cur = after;
    for (let i = 0; i < 4; i++) {
      cur.players.set("a", { ...cur.players.get("a")!, strikeCd: 0, hp: 100 });
      cur.wreckage = [{ id: "grave", x: 200, y: 480, fromId: "z", fromName: "Angel", until: 40 }];
      cur.players.set("c", {
        ...spawnGuest("c"),
        guest: false,
        x: 208,
        y: 480,
        hp: 20,
        bestand: 10,
      });
      cur = applyStrike(cur, "a");
    }
    expect(cur.players.get("s")!.spectated).toBe(SPECTATE_CAP);
    expect(cur.players.get("s")!.aura).toBe(4 + SPECTATE_CAP);
  });
});

describe("Bestand sinks", () => {
  it("funeral on wreckage costs Bestand; the plot stays free", () => {
    const plot = emptyWorld().rites.find((r) => r.kind === "burial")!;
    const free = emptyWorld();
    free.players.set("a", { ...spawnGuest("a"), x: plot.x, y: plot.y, bestand: 0 });
    const buried = applyBury(free, "a");
    expect(buried.rites.find((r) => r.kind === "burial")?.done).toBe(true);
    expect(buried.players.get("a")?.bestand).toBe(0);

    const w = emptyWorld();
    w.wreckage = [{ id: "g", x: 200, y: 480, fromId: "z", fromName: "Angel", until: 40 }];
    w.players.set("a", { ...spawnGuest("a"), guest: false, x: 200, y: 480, bestand: 5 });
    const poor = applyBury(w, "a");
    expect(poor.wreckage).toHaveLength(1);
    expect(poor.players.get("a")?.heard).toBe(FUNERAL_NEED);

    w.players.set("a", { ...spawnGuest("a"), guest: false, x: 200, y: 480, bestand: 40 });
    const paid = applyBury(w, "a");
    expect(paid.wreckage).toHaveLength(0);
    expect(paid.players.get("a")?.bestand).toBe(40 - FUNERAL_COST);
    expect(paid.players.get("a")?.heard).toBe(FUNERAL_COPY);
    expect(paid.players.get("a")?.beats.funeral).toBe(true);
    expect(paid.players.get("a")?.wink).toBe(WINK_SINK);
    expect(FUNERAL_COST).toBe(12);
    expect(damageFor(paid.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(paid.players.get("a")!)).toBe(false);
  });

  it("shrine upkeep spends Bestand and thins Gestell, never damage", () => {
    const w = emptyWorld();
    w.players.set("a", { ...spawnGuest("a"), guest: false, x: SHRINE.x, y: SHRINE.y, bestand: 4 });
    const poor = applyShrine(w, "a");
    expect(poor.players.get("a")?.heard).toBe(SHRINE_NEED);
    expect(poor.gestell).toBe(w.gestell);

    w.players.set("a", { ...spawnGuest("a"), guest: false, x: SHRINE.x, y: SHRINE.y, bestand: 20 });
    const paid = applyShrine(w, "a");
    expect(paid.players.get("a")?.bestand).toBe(20 - SHRINE_COST);
    expect(paid.players.get("a")?.heard).toBe(SHRINE_COPY);
    expect(paid.gestell).toBe(w.gestell - 2);
    expect(SHRINE_COST).toBe(8);
    expect(damageFor(paid.players.get("a")!)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(paid.players.get("a")!)).toBe(false);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: SHRINE.x, y: SHRINE.y, bestand: 20 });
    const guest = applyShrine(gWorld, "g");
    expect(guest.players.get("g")?.heard).toBe(SHRINE_SPECTATOR);
    expect(guest.players.get("g")?.bestand).toBe(20);
    expect(guest.gestell).toBe(gWorld.gestell);
  });

  it("aura restore spends Bestand, un-dims Winke, never damage", () => {
    expect(visibleWink(false, WINK_SINK, 2)).toBe("");
    expect(visibleWink(false, WINK_SINK, AURA_DIM)).toBe(WINK_SINK);
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: 2,
      wink: WINK_SINK,
      bestand: 4,
      x: SHRINE.x,
      y: SHRINE.y,
    });
    const poor = applyRestore(w, "a");
    expect(poor.players.get("a")?.heard).toBe(RESTORE_NEED);
    expect(poor.players.get("a")?.aura).toBe(2);

    w.players.set("a", { ...poor.players.get("a")!, bestand: 20 });
    const paid = applyRestore(w, "a");
    const p = paid.players.get("a")!;
    expect(p.bestand).toBe(20 - RESTORE_COST);
    expect(p.aura).toBe(2 + RESTORE_GAIN);
    expect(p.heard).toBe(RESTORE_COPY);
    expect(p.wink).toBe(WINK_SINK);
    expect(visibleWink(false, p.wink, p.aura)).toBe(WINK_SINK);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const full = applyRestore({ ...paid, players: new Map([["a", { ...p, aura: 40, bestand: 40 }]]) }, "a");
    expect(full.players.get("a")?.heard).toBe(RESTORE_FULL);
    expect(full.players.get("a")?.bestand).toBe(40);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: SHRINE.x, y: SHRINE.y, bestand: 40 });
    const g = applyRestore(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(RESTORE_SPECTATOR);
    expect(g.players.get("g")?.aura).toBe(0);
    expect(guestCanClaim(g.players.get("g")!)).toBe(false);
  });

  it("insurance paper sinks Bestand and walks death to the shrine, never damage", () => {
    const w = emptyWorld();
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      x: SHRINE.x,
      y: SHRINE.y,
      bestand: 10,
    });
    const poor = applyInsure(w, "a");
    expect(poor.players.get("a")?.heard).toBe(INSURANCE_NEED);
    expect(poor.players.get("a")?.insured).toBe(false);

    w.players.set("a", { ...poor.players.get("a")!, bestand: 40 });
    const paid = applyInsure(w, "a");
    const p = paid.players.get("a")!;
    expect(p.bestand).toBe(40 - INSURANCE_COST);
    expect(p.insured).toBe(true);
    expect(p.heard).toBe(INSURANCE_COPY);
    expect(p.lastCareX).toBe(SHRINE.x);
    expect(p.lastCareY).toBe(SHRINE.y);
    expect(p.wink).toBe(WINK_SINK);
    expect(INSURANCE_COST).toBe(18);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const twice = applyInsure({ ...paid, players: new Map([["a", { ...p, bestand: 40 }]]) }, "a");
    expect(twice.players.get("a")?.heard).toBe(INSURANCE_HELD);
    expect(twice.players.get("a")?.bestand).toBe(40);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: SHRINE.x, y: SHRINE.y, bestand: 40 });
    const g = applyInsure(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(INSURANCE_SPECTATOR);
    expect(g.players.get("g")?.insured).toBe(false);
    expect(g.players.get("g")?.bestand).toBe(40);

    const fight = emptyWorld();
    fight.players.set("k", { ...spawnGuest("k"), guest: false, x: 200, y: 480 });
    fight.players.set("v", {
      ...spawnGuest("v"),
      guest: false,
      serial: TEST_SERIAL,
      x: 220,
      y: 480,
      hp: 20,
      aura: 12,
      bestand: 30,
      insured: true,
      lastCareX: SHRINE.x,
      lastCareY: SHRINE.y,
    });
    const dead = applyStrike(fight, "k");
    const v = dead.players.get("v")!;
    expect(v.hp).toBe(100);
    expect(v.x).toBe(SHRINE.x);
    expect(v.y).toBe(SHRINE.y);
    expect(v.insured).toBe(false);
    expect(v.aura).toBe(4);
    expect(v.heard).toBe(INSURANCE_USED);
    expect(damageFor(v)).toBe(damageFor(dead.players.get("k")!));

    const bare = emptyWorld();
    bare.players.set("k", { ...spawnGuest("k"), guest: false, x: 200, y: 480 });
    bare.players.set("v", {
      ...spawnGuest("v"),
      guest: false,
      x: 220,
      y: 480,
      hp: 20,
      aura: 12,
      insured: false,
    });
    const walked = applyStrike(bare, "k");
    const raw = walked.players.get("v")!;
    expect(raw.x).toBe(NAVE_SPAWN_X);
    expect(raw.y).toBe(NAVE_SPAWN_Y);
    expect(raw.hp).toBe(100);
    expect(raw.aura).toBe(4);
    expect(raw.heard).not.toBe(INSURANCE_USED);
  });

  it("death cracks remaining prints; Quill repairs them for Bestand, never cult", () => {
    const fight = emptyWorld();
    fight.players.set("k", { ...spawnGuest("k"), guest: false, x: 200, y: 480 });
    fight.players.set("v", {
      ...spawnGuest("v"),
      guest: false,
      x: 220,
      y: 480,
      hp: 20,
      fakeWinke: 2,
      cultWink: true,
      bestand: 30,
    });
    const dead = applyStrike(fight, "k");
    const v = dead.players.get("v")!;
    expect(v.fakeWinke).toBe(0);
    expect(v.damaged).toBe(2);
    expect(v.cultWink).toBe(true);

    const stall = emptyWorld();
    stall.players.set("a", {
      ...v,
      id: "a",
      x: CLEARING_STALL.x,
      y: CLEARING_STALL.y,
      bestand: 4,
    });
    const poor = applyRepair(stall, "a");
    expect(poor.players.get("a")?.heard).toBe(REPAIR_NEED);
    expect(poor.players.get("a")?.damaged).toBe(2);

    stall.players.set("a", { ...stall.players.get("a")!, bestand: 20 });
    const paid = applyRepair(stall, "a");
    const p = paid.players.get("a")!;
    expect(p.bestand).toBe(20 - REPAIR_COST);
    expect(p.damaged).toBe(1);
    expect(p.fakeWinke).toBe(1);
    expect(p.cultWink).toBe(true);
    expect(p.heard).toBe(REPAIR_COPY);
    expect(REPAIR_COST).toBe(7);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const none = applyRepair({ ...paid, players: new Map([["a", { ...p, damaged: 0, fakeWinke: 1, bestand: 20 }]]) }, "a");
    expect(none.players.get("a")?.heard).toBe(REPAIR_NONE);
    expect(none.players.get("a")?.bestand).toBe(20);

    const gWorld = emptyWorld();
    gWorld.players.set("g", { ...spawnGuest("g"), x: CLEARING_STALL.x, y: CLEARING_STALL.y, damaged: 2, bestand: 20 });
    const g = applyRepair(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(REPAIR_SPECTATOR);
    expect(g.players.get("g")?.damaged).toBe(2);
    expect(g.players.get("g")?.bestand).toBe(20);
  });
});

describe("Desk Three clocks out", () => {
  it("named weather lets an Angel empty the desk; guests cannot", () => {
    const w = emptyWorld();
    const desk = w.clerks.find((c) => c.id === "clerk-desk-three")!;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      x: desk.x,
      y: desk.y,
    });
    const early = applyClockOut(w, "a");
    expect(early.players.get("a")?.heard).toBe(CLOCK_NEED);
    expect(early.clerks).toHaveLength(2);

    w.weatherNamed = true;
    const gone = applyClockOut(w, "a");
    const p = gone.players.get("a")!;
    expect(p.heard).toBe(CLOCK_OUT);
    expect(p.wink).toBe(WINK_CLOCK);
    expect(p.beats.clockOut).toBe(true);
    expect(gone.clerks.find((c) => c.id === "clerk-desk-three")).toBeUndefined();
    expect(gone.pois.find((poi) => poi.kind === "desk-empty")?.name).toBe("Desk Three — empty");
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const gWorld = emptyWorld();
    gWorld.weatherNamed = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: desk.x, y: desk.y, locked: true });
    const g = applyClockOut(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(CLOCK_SPECTATOR);
    expect(g.clerks).toHaveLength(2);
  });
});

describe("unmanned yield", () => {
  it("empty desks let an Angel rename Safety; guests cannot", () => {
    const w = emptyWorld();
    w.weatherNamed = true;
    w.annexHome = true;
    w.clerks = w.clerks.filter((c) => c.id !== "clerk-desk-three" && c.id !== "clerk-annex");
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), clockOut: true, annexHome: true },
      x: 192,
      y: 400,
    });
    const need = applyYieldEmpty(
      {
        ...emptyWorld(),
        players: new Map([
          [
            "a",
            {
              ...spawnGuest("a"),
              guest: false,
              x: 192,
              y: 400,
              beats: { ...emptyBeats(), clockOut: true },
            },
          ],
        ]),
      },
      "a",
    );
    expect(need.players.get("a")?.heard).toBe(YIELD_EMPTY_NEED);

    const named = applyRead(w, "a", "safety-plaque");
    const p = named.players.get("a")!;
    expect(p.heard).toBe(YIELD_EMPTY);
    expect(p.wink).toBe(WINK_YIELD_EMPTY);
    expect(p.beats.yieldEmpty).toBe(true);
    expect(named.signs.find((s) => s.id === "safety-plaque")?.title).toBe(YIELD_EMPTY_PLAQUE.title);
    expect(named.pois.find((poi) => poi.kind === "yield-empty")?.name).toBe("Yield — unmanned");
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const gWorld = emptyWorld();
    gWorld.annexHome = true;
    gWorld.clerks = [];
    gWorld.players.set("g", { ...spawnGuest("g"), x: 192, y: 400, locked: true, beats: { ...emptyBeats(), clockOut: true } });
    expect(applyYieldEmpty(gWorld, "g").players.get("g")?.heard).toBe(YIELD_EMPTY_SPECTATOR);
  });
});

describe("The Strait is refused", () => {
  it("after the Foundry is dark, an Angel can shut the water; guests cannot", () => {
    const w = emptyWorld();
    w.m3Open = true;
    w.foundryDark = true;
    w.pois = [
      ...w.pois,
      { id: ORGAN_STRAIT.id, name: "The Strait", x: ORGAN_STRAIT.x, y: ORGAN_STRAIT.y, kind: "organ-strait" },
    ];
    w.signs = [...w.signs, ORGAN_PLAQUES.find((s) => s.id === ORGAN_STRAIT.id)!];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), foundryDark: true, foundry: true, m3: true },
      x: ORGAN_STRAIT.x,
      y: ORGAN_STRAIT.y,
    });
    const shut = applyRead(w, "a", ORGAN_STRAIT.id);
    const p = shut.players.get("a")!;
    expect(p.heard).toBe(STRAIT_REFUSE);
    expect(p.wink).toBe(WINK_STRAIT_REFUSE);
    expect(p.beats.straitRefuse).toBe(true);
    expect(shut.straitRefused).toBe(true);
    expect(shut.pois.find((poi) => poi.id === ORGAN_STRAIT.id)?.kind).toBe("organ-strait-refused");
    expect(shut.signs.find((s) => s.id === ORGAN_STRAIT.id)?.title).toBe(STRAIT_REFUSED_PLAQUE.title);
    expect(shut.gestell).toBeLessThan(w.gestell);
    expect(p.heard).not.toMatch(/heidegger|hormuz|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyRead(shut, "a", ORGAN_STRAIT.id).players.get("a")?.heard).toBe(STRAIT_REFUSED_LATER);

    const live = emptyWorld();
    live.m3Open = true;
    live.pois = [...w.pois];
    live.signs = [...w.signs];
    live.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), m3: true },
      x: ORGAN_STRAIT.x,
      y: ORGAN_STRAIT.y,
    });
    const early = applyStraitRefuse(live, "a");
    expect(early.players.get("a")?.heard).toBe(STRAIT_NEED_DARK);
    expect(early.straitRefused).toBe(false);

    const gWorld = emptyWorld();
    gWorld.m3Open = true;
    gWorld.foundryDark = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: ORGAN_STRAIT.x, y: ORGAN_STRAIT.y, locked: true });
    const g = applyStraitRefuse(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(STRAIT_SPECTATOR);
    expect(g.straitRefused).toBe(false);
  });
});

describe("House of Sky standing on the dark Cable", () => {
  it("Sky Angel names the dark line; other Houses and guests cannot", () => {
    const w = emptyWorld();
    w.m3Open = true;
    w.cableDark = true;
    w.pois = [
      ...w.pois,
      { id: ORGAN_CABLE.id, name: "The Cable — dark", x: ORGAN_CABLE.x, y: ORGAN_CABLE.y, kind: "organ-cable-dark" },
    ];
    w.signs = [...w.signs, { id: ORGAN_CABLE.id, title: "The Cable — dark", text: "Cut.", x: ORGAN_CABLE.x, y: ORGAN_CABLE.y }];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: 2,
      house: "sky",
      beats: { ...emptyBeats(), cableDark: true, hall: true, m3: true },
      x: ORGAN_CABLE.x,
      y: ORGAN_CABLE.y,
    });
    const named = applyRead(w, "a", ORGAN_CABLE.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(SKY_STANDING);
    expect(p.wink).toBe(WINK_SKY);
    expect(p.beats.skyStanding).toBe(true);
    expect(named.skyStanding).toBe(true);
    expect(named.standing.sky).toBe(1);
    expect(named.pois.find((poi) => poi.id === ORGAN_CABLE.id)?.kind).toBe("organ-cable-sky");
    expect(named.signs.find((s) => s.id === ORGAN_CABLE.id)?.title).toBe(SKY_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applySkyStanding(named, "a").players.get("a")?.heard).toBe(SKY_HELD);

    const mortals = emptyWorld();
    mortals.cableDark = true;
    mortals.players.set("m", {
      ...spawnGuest("m"),
      guest: false,
      house: "mortals",
      beats: { ...emptyBeats(), cableDark: true },
      x: ORGAN_CABLE.x,
      y: ORGAN_CABLE.y,
    });
    expect(applySkyStanding(mortals, "m").players.get("m")?.heard).toBe(SKY_WRONG);
    expect(applySkyStanding(mortals, "m").standing.sky).toBe(0);

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      house: "sky",
      x: ORGAN_CABLE.x,
      y: ORGAN_CABLE.y,
    });
    expect(applySkyStanding(early, "a").players.get("a")?.heard).toBe(SKY_NEED);

    const gWorld = emptyWorld();
    gWorld.cableDark = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: ORGAN_CABLE.x, y: ORGAN_CABLE.y, locked: true });
    expect(applySkyStanding(gWorld, "g").players.get("g")?.heard).toBe(SKY_SPECTATOR);
    expect(gWorld.skyStanding).toBe(false);
  });
});

describe("House of Divinities standing on the buried Strait", () => {
  it("Divinities Angel names the buried water; other Houses and guests cannot", () => {
    const w = emptyWorld();
    w.m3Open = true;
    w.straitBuried = true;
    w.pois = [
      ...w.pois,
      {
        id: ORGAN_STRAIT.id,
        name: "The Strait — buried",
        x: ORGAN_STRAIT.x,
        y: ORGAN_STRAIT.y,
        kind: "organ-strait-buried",
      },
    ];
    w.signs = [
      ...w.signs,
      { id: ORGAN_STRAIT.id, title: "The Strait — buried", text: "Grave.", x: ORGAN_STRAIT.x, y: ORGAN_STRAIT.y },
    ];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: 4,
      house: "divinities",
      beats: { ...emptyBeats(), canalBury: true, hall: true, m3: true },
      x: ORGAN_STRAIT.x,
      y: ORGAN_STRAIT.y,
    });
    const named = applyRead(w, "a", ORGAN_STRAIT.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(DIV_STANDING);
    expect(p.wink).toBe(WINK_DIV);
    expect(p.beats.divStanding).toBe(true);
    expect(named.divStanding).toBe(true);
    expect(named.standing.divinities).toBe(1);
    expect(named.pois.find((poi) => poi.id === ORGAN_STRAIT.id)?.kind).toBe("organ-strait-divinities");
    expect(named.signs.find((s) => s.id === ORGAN_STRAIT.id)?.title).toBe(DIV_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyDivStanding(named, "a").players.get("a")?.heard).toBe(DIV_HELD);

    const earth = emptyWorld();
    earth.straitBuried = true;
    earth.players.set("e", {
      ...spawnGuest("e"),
      guest: false,
      house: "earth",
      beats: { ...emptyBeats(), canalBury: true },
      x: ORGAN_STRAIT.x,
      y: ORGAN_STRAIT.y,
    });
    expect(applyDivStanding(earth, "e").players.get("e")?.heard).toBe(DIV_WRONG);
    expect(applyDivStanding(earth, "e").standing.divinities).toBe(0);

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      house: "divinities",
      x: ORGAN_STRAIT.x,
      y: ORGAN_STRAIT.y,
    });
    expect(applyDivStanding(early, "a").players.get("a")?.heard).toBe(DIV_NEED);

    const gWorld = emptyWorld();
    gWorld.straitBuried = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: ORGAN_STRAIT.x, y: ORGAN_STRAIT.y, locked: true });
    expect(applyDivStanding(gWorld, "g").players.get("g")?.heard).toBe(DIV_SPECTATOR);
    expect(gWorld.divStanding).toBe(false);
  });
});

describe("House of Earth standing on the dark Foundry", () => {
  it("Earth Angel names the dark heat; other Houses and guests cannot", () => {
    const w = emptyWorld();
    w.m3Open = true;
    w.foundryDark = true;
    w.pois = [
      ...w.pois,
      { id: ORGAN_FOUNDRY.id, name: "The Foundry — dark", x: ORGAN_FOUNDRY.x, y: ORGAN_FOUNDRY.y, kind: "organ-foundry-dark" },
    ];
    w.signs = [...w.signs, { id: ORGAN_FOUNDRY.id, title: "The Foundry — dark", text: "Off.", x: ORGAN_FOUNDRY.x, y: ORGAN_FOUNDRY.y }];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: 1,
      house: "earth",
      beats: { ...emptyBeats(), foundryDark: true, hall: true, m3: true },
      x: ORGAN_FOUNDRY.x,
      y: ORGAN_FOUNDRY.y,
    });
    const named = applyRead(w, "a", ORGAN_FOUNDRY.id);
    const p = named.players.get("a")!;
    expect(p.heard).toBe(EARTH_STANDING);
    expect(p.wink).toBe(WINK_EARTH);
    expect(p.beats.earthStanding).toBe(true);
    expect(named.earthStanding).toBe(true);
    expect(named.standing.earth).toBe(1);
    expect(named.pois.find((poi) => poi.id === ORGAN_FOUNDRY.id)?.kind).toBe("organ-foundry-earth");
    expect(named.signs.find((s) => s.id === ORGAN_FOUNDRY.id)?.title).toBe(EARTH_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyEarthStanding(named, "a").players.get("a")?.heard).toBe(EARTH_HELD);

    const sky = emptyWorld();
    sky.foundryDark = true;
    sky.players.set("s", {
      ...spawnGuest("s"),
      guest: false,
      house: "sky",
      beats: { ...emptyBeats(), foundryDark: true },
      x: ORGAN_FOUNDRY.x,
      y: ORGAN_FOUNDRY.y,
    });
    expect(applyEarthStanding(sky, "s").players.get("s")?.heard).toBe(EARTH_WRONG);

    const early = emptyWorld();
    early.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      house: "earth",
      x: ORGAN_FOUNDRY.x,
      y: ORGAN_FOUNDRY.y,
    });
    expect(applyEarthStanding(early, "a").players.get("a")?.heard).toBe(EARTH_NEED);

    const gWorld = emptyWorld();
    gWorld.foundryDark = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: ORGAN_FOUNDRY.x, y: ORGAN_FOUNDRY.y, locked: true });
    expect(applyEarthStanding(gWorld, "g").players.get("g")?.heard).toBe(EARTH_SPECTATOR);
    expect(gWorld.earthStanding).toBe(false);
  });
});

describe("The Cable goes dark", () => {
  it("after the Strait is refused, an Angel can cut the Cable; guests cannot", () => {
    const w = emptyWorld();
    w.m3Open = true;
    w.straitRefused = true;
    w.pois = [
      ...w.pois,
      { id: ORGAN_CABLE.id, name: "The Cable", x: ORGAN_CABLE.x, y: ORGAN_CABLE.y, kind: "organ-cable" },
    ];
    w.signs = [...w.signs, ORGAN_PLAQUES.find((s) => s.id === ORGAN_CABLE.id)!];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), straitRefuse: true, m3: true },
      x: ORGAN_CABLE.x,
      y: ORGAN_CABLE.y,
    });
    const cut = applyRead(w, "a", ORGAN_CABLE.id);
    const p = cut.players.get("a")!;
    expect(p.heard).toBe(CABLE_DARK);
    expect(p.wink).toBe(WINK_CABLE_DARK);
    expect(p.beats.cableDark).toBe(true);
    expect(cut.cableDark).toBe(true);
    expect(cut.pois.find((poi) => poi.id === ORGAN_CABLE.id)?.kind).toBe("organ-cable-dark");
    expect(cut.signs.find((s) => s.id === ORGAN_CABLE.id)?.title).toBe(CABLE_DARK_PLAQUE.title);
    expect(cut.gestell).toBeLessThan(w.gestell);
    expect(p.heard).not.toMatch(/heidegger|hormuz|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyRead(cut, "a", ORGAN_CABLE.id).players.get("a")?.heard).toBe(CABLE_DARK_LATER);

    const live = emptyWorld();
    live.m3Open = true;
    live.pois = [...w.pois];
    live.signs = [...w.signs];
    live.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), m3: true },
      x: ORGAN_CABLE.x,
      y: ORGAN_CABLE.y,
    });
    const early = applyCableDark(live, "a");
    expect(early.players.get("a")?.heard).toBe(CABLE_NEED_STRAIT);
    expect(early.cableDark).toBe(false);

    const gWorld = emptyWorld();
    gWorld.m3Open = true;
    gWorld.straitRefused = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: ORGAN_CABLE.x, y: ORGAN_CABLE.y, locked: true });
    const g = applyCableDark(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(CABLE_DARK_SPECTATOR);
    expect(g.cableDark).toBe(false);
  });
});

describe("Nara buries the refused Strait", () => {
  it("sexton plus refused canal lets an Angel bury the organ; guests cannot", () => {
    const nara = NAVE_NPCS.find((n) => n.id === "nara")!;
    const w = emptyWorld();
    w.straitRefused = true;
    w.naraAtStrait = true;
    w.pois = [
      ...w.pois,
      {
        id: ORGAN_STRAIT.id,
        name: "The Strait — refused",
        x: ORGAN_STRAIT.x,
        y: ORGAN_STRAIT.y,
        kind: "organ-strait-refused",
      },
    ];
    w.signs = [...w.signs, { id: ORGAN_STRAIT.id, title: "The Strait — refused", text: "Shut.", x: ORGAN_STRAIT.x, y: ORGAN_STRAIT.y }];
    const at = liveNpcs(false, false, true).find((n) => n.id === "nara")!;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), garden: true, sexton: true, sextonAsk: true, straitRefuse: true, nara: true },
      cultWink: true,
      x: at.x,
      y: at.y,
    });
    const asked = applyTalk(w, "a", "nara");
    expect(asked.players.get("a")?.heard).toBe(NARA_CANAL_ASK);
    expect(asked.players.get("a")?.beats.canalAsk).toBe(true);
    const buried = applyTalk(asked, "a", "nara");
    const p = buried.players.get("a")!;
    expect(p.heard).toBe(NARA_CANAL);
    expect(p.wink).toBe(WINK_CANAL);
    expect(p.beats.canalBury).toBe(true);
    expect(buried.straitBuried).toBe(true);
    expect(buried.naraAtStrait).toBe(true);
    expect(buried.pois.find((poi) => poi.id === ORGAN_STRAIT.id)?.kind).toBe("organ-strait-buried");
    expect(buried.signs.find((s) => s.id === ORGAN_STRAIT.id)?.title).toBe(CANAL_PLAQUE.title);
    expect(liveNpcs(false, false, true, false, false, false, false, true).find((n) => n.id === "nara")?.role).toBe(
      "Burying the canal",
    );
    expect(p.heard).not.toMatch(/heidegger|hormuz|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyTalk(buried, "a", "nara").players.get("a")?.heard).toBe(NARA_CANAL_LATER);

    const live = emptyWorld();
    live.naraAtStrait = true;
    live.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), garden: true, sexton: true },
      x: nara.x,
      y: nara.y,
    });
    expect(applyTalk(live, "a", "nara").players.get("a")?.heard).not.toBe(NARA_CANAL_ASK);

    const gWorld = emptyWorld();
    gWorld.straitRefused = true;
    gWorld.players.set("g", {
      ...spawnGuest("g"),
      x: nara.x,
      y: nara.y,
      locked: true,
      beats: { ...emptyBeats(), garden: true, sexton: true },
    });
    const g = applyTalk(gWorld, "g", "nara");
    expect(g.players.get("g")?.heard).toBe(SEXTON_SPECTATOR);
    expect(g.straitBuried).toBe(false);
  });
});

describe("Quill unflags the Wet Grid", () => {
  it("after hanging cult, unflag ends spoils; guests cannot", () => {
    const quill = NAVE_NPCS.find((n) => n.id === "quill")!;
    const w = emptyWorld();
    w.stallDark = true;
    w.quillAtGrid = true;
    w.pois = w.pois.map((poi) => (poi.id === WET_GRID.id ? { ...poi } : poi));
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), hang: true, hangAsk: true, spot: true, market: true, hall: true },
      cultWink: true,
      flagged: true,
      x: quill.x,
      y: quill.y,
    });
    const atStreet = liveNpcs(false, false, false, true).find((n) => n.id === "quill")!;
    w.players.set("a", { ...w.players.get("a")!, x: atStreet.x, y: atStreet.y });
    const asked = applyTalk(w, "a", "quill");
    expect(asked.players.get("a")?.heard).toBe(QUILL_UNFLAG_ASK);
    expect(asked.players.get("a")?.beats.unflagAsk).toBe(true);
    expect(applyTalk(asked, "a", "quill").players.get("a")?.heard).toBe(QUILL_UNFLAG_WAIT);

    asked.players.set("a", { ...asked.players.get("a")!, x: WET_GRID.x, y: WET_GRID.y });
    const done = applyRead(asked, "a", WET_GRID.id);
    const p = done.players.get("a")!;
    expect(p.heard).toBe(UNFLAG_COPY);
    expect(p.wink).toBe(WINK_UNFLAG);
    expect(p.beats.unflag).toBe(true);
    expect(p.flagged).toBe(false);
    expect(done.wetCult).toBe(true);
    expect(done.pois.find((poi) => poi.id === WET_GRID.id)?.kind).toBe("wet-grid-cult");
    expect(done.signs.find((s) => s.id === WET_GRID.id)?.title).toBe(UNFLAG_PLAQUE.title);
    expect(liveNpcs(false, false, false, true, false, false, true).find((n) => n.id === "quill")?.role).toBe(
      "Keeping the street",
    );
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyFlag(done, "a").players.get("a")?.heard).toBe(FLAG_CULT);
    expect(applyFlag(done, "a").players.get("a")?.flagged).toBe(false);

    done.players.set("a", { ...p, x: atStreet.x, y: atStreet.y });
    expect(applyTalk(done, "a", "quill").players.get("a")?.heard).toBe(QUILL_PERSON);

    const need = emptyWorld();
    need.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), unflagAsk: true },
      x: WET_GRID.x,
      y: WET_GRID.y,
    });
    expect(applyUnflag(need, "a").players.get("a")?.heard).toBe(UNFLAG_NEED);
    expect(applyUnflag(need, "a").wetCult).toBe(false);

    const gWorld = emptyWorld();
    gWorld.quillAtGrid = true;
    gWorld.players.set("g", {
      ...spawnGuest("g"),
      x: WET_GRID.x,
      y: WET_GRID.y,
      locked: true,
      beats: { ...emptyBeats(), unflagAsk: true, hang: true },
    });
    const g = applyUnflag(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(UNFLAG_SPECTATOR);
    expect(g.wetCult).toBe(false);
  });
});

describe("Ord witnesses the refused Strait", () => {
  it("after the canal is shut Ord walks there; guests cannot take him", () => {
    const ord = NAVE_NPCS.find((n) => n.id === "ord")!;
    const w = emptyWorld();
    w.straitRefused = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), straitRefuse: true, map: true },
      x: ord.x,
      y: ord.y,
    });
    const walked = applyTalk(w, "a", "ord");
    const p = walked.players.get("a")!;
    expect(p.heard).toBe(ORD_WITNESS);
    expect(p.wink).toBe(WINK_WITNESS);
    expect(p.beats.ordWitness).toBe(true);
    expect(walked.ordAtStrait).toBe(true);
    const moved = liveNpcs(false, false, false, false, false, true).find((n) => n.id === "ord")!;
    expect(moved.role).toBe("At the Strait");
    expect(moved.x).toBe(ORGAN_STRAIT.x);
    walked.players.set("a", { ...p, x: moved.x, y: moved.y });
    expect(applyTalk(walked, "a", "ord").players.get("a")?.heard).toBe(ORD_WITNESS_LATER);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const gWorld = emptyWorld();
    gWorld.straitRefused = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: ord.x, y: ord.y, locked: true });
    const g = applyTalk(gWorld, "g", "ord");
    expect(g.players.get("g")?.heard).toBe(ORD_WITNESS_SPECTATOR);
    expect(g.ordAtStrait).toBe(false);
  });
});

describe("Annex Runner comes in", () => {
  it("freeze lets an Angel send the runner inside; weather-named clock-out does not steal them", () => {
    const w = emptyWorld();
    const runner = w.clerks.find((c) => c.id === "clerk-annex")!;
    w.weatherNamed = true;
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      x: runner.x,
      y: runner.y,
    });
    const weather = applyClockOut(w, "a");
    expect(weather.players.get("a")?.heard).toBe(ANNEX_NEED);
    expect(weather.clerks.find((c) => c.id === "clerk-annex")).toBeDefined();
    expect(weather.annexHome).toBe(false);

    w.frozen = true;
    const gone = applyClockOut(w, "a");
    const p = gone.players.get("a")!;
    expect(p.heard).toBe(ANNEX_HOME);
    expect(p.wink).toBe(WINK_ANNEX);
    expect(p.beats.annexHome).toBe(true);
    expect(gone.annexHome).toBe(true);
    expect(gone.frozen).toBe(true);
    expect(gone.clerks.find((c) => c.id === "clerk-annex")).toBeUndefined();
    expect(gone.clerks.find((c) => c.id === "clerk-desk-three")).toBeDefined();
    expect(gone.pois.find((poi) => poi.kind === "annex-route")?.name).toBe("Annex route — empty");
    expect(gone.pois.find((poi) => poi.id === SAFETY_ANNEX.id)?.kind).toBe("safety-annex-home");
    expect(gone.signs.find((s) => s.id === SAFETY_ANNEX.id)?.title).toBe(ANNEX_HOME_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|fetch quest|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    gone.players.set("a", { ...p, x: SAFETY_ANNEX.x, y: SAFETY_ANNEX.y });
    expect(applyAnnexHome(gone, "a").players.get("a")?.heard).toBe(ANNEX_GONE);

    const gWorld = emptyWorld();
    gWorld.frozen = true;
    gWorld.players.set("g", { ...spawnGuest("g"), x: runner.x, y: runner.y, locked: true });
    const g = applyClockOut(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(ANNEX_SPECTATOR);
    expect(g.clerks.find((c) => c.id === "clerk-annex")).toBeDefined();
    expect(g.annexHome).toBe(false);
  });
});

describe("Vesper unlights the Foundry", () => {
  it("Cold take then Foundry read lets an Angel unlight; Vesper walks; guests cannot", () => {
    const w = emptyWorld();
    w.m3Open = true;
    w.pois = [
      ...w.pois,
      { id: ORGAN_FOUNDRY.id, name: "The Foundry", x: ORGAN_FOUNDRY.x, y: ORGAN_FOUNDRY.y, kind: "organ-foundry" },
    ];
    w.signs = [...w.signs, ORGAN_PLAQUES.find((s) => s.id === ORGAN_FOUNDRY.id)!];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      aura: auraSeed(TEST_SERIAL),
      beats: { ...emptyBeats(), hall: true, yield: true, cold: true, m3: true },
      current: "cold",
      x: OPERATOR_DESK.x,
      y: OPERATOR_DESK.y,
    });
    const early = applyOperator(w, "a", "hear");
    expect(early.players.get("a")?.heard).toBe(VESPER_NEED_FOUNDRY);
    expect(early.vesperAtFoundry).toBe(false);

    early.players.set("a", { ...early.players.get("a")!, x: ORGAN_FOUNDRY.x, y: ORGAN_FOUNDRY.y });
    const read = applyRead(early, "a", ORGAN_FOUNDRY.id);
    expect(read.players.get("a")?.beats.foundry).toBe(true);

    read.players.set("a", { ...read.players.get("a")!, x: OPERATOR_DESK.x, y: OPERATOR_DESK.y });
    const asked = applyOperator(read, "a", "hear");
    expect(asked.players.get("a")?.heard).toBe(VESPER_UNLIGHT_ASK);
    expect(asked.players.get("a")?.beats.foundryAsk).toBe(true);
    expect(asked.vesperAtFoundry).toBe(false);
    expect(applyOperator(asked, "a", "hear").players.get("a")?.heard).toBe(VESPER_UNLIGHT_WAIT);

    asked.players.set("a", { ...asked.players.get("a")!, x: ORGAN_FOUNDRY.x, y: ORGAN_FOUNDRY.y });
    const dark = applyRead(asked, "a", ORGAN_FOUNDRY.id);
    const p = dark.players.get("a")!;
    expect(p.heard).toBe(FOUNDRY_DARK_COPY);
    expect(p.wink).toBe(WINK_FOUNDRY_DARK);
    expect(p.beats.foundryDark).toBe(true);
    expect(dark.foundryDark).toBe(true);
    expect(dark.vesperAtFoundry).toBe(true);
    expect(dark.pois.find((poi) => poi.id === ORGAN_FOUNDRY.id)?.kind).toBe("organ-foundry-dark");
    expect(dark.pois.find((poi) => poi.id === OPERATOR_DESK.id)?.kind).toBe("operator-vacant");
    expect(dark.signs.find((s) => s.id === ORGAN_FOUNDRY.id)?.title).toBe(FOUNDRY_DARK_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|hormuz|hsinchu|palantir|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const moved = liveNpcs(false, false, false, false, true).find((n) => n.id === "vesper")!;
    expect(moved.name).toBe("Vesper Hale");
    expect(moved.role).toBe("At the Foundry");
    expect(moved.x).toBe(VESPER.x);
    dark.players.set("a", { ...p, x: moved.x, y: moved.y });
    expect(applyTalk(dark, "a", "vesper").players.get("a")?.heard).toBe(VESPER_PERSON);

    dark.players.set("a", { ...p, x: OPERATOR_DESK.x, y: OPERATOR_DESK.y });
    expect(applyOperator(dark, "a", "hear").players.get("a")?.heard).toBe(OPERATOR_VACANT);
    dark.players.set("a", { ...p, x: ORGAN_FOUNDRY.x, y: ORGAN_FOUNDRY.y });
    expect(applyRead(dark, "a", ORGAN_FOUNDRY.id).players.get("a")?.heard).toBe(FOUNDRY_DARK_LATER);

    const refuseW = emptyWorld();
    refuseW.m3Open = true;
    refuseW.pois = [...w.pois];
    refuseW.signs = [...w.signs];
    refuseW.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      beats: { ...emptyBeats(), hall: true, yield: true, refuse: true, foundry: true, foundryAsk: true },
      x: ORGAN_FOUNDRY.x,
      y: ORGAN_FOUNDRY.y,
    });
    const refused = applyUnlight(refuseW, "a");
    expect(refused.players.get("a")?.heard).toBe(FOUNDRY_NEED_COLD);
    expect(refused.foundryDark).toBe(false);

    const gWorld = emptyWorld();
    gWorld.m3Open = true;
    gWorld.foundryDark = false;
    gWorld.players.set("g", {
      ...spawnGuest("g"),
      x: ORGAN_FOUNDRY.x,
      y: ORGAN_FOUNDRY.y,
      locked: true,
      beats: { ...emptyBeats(), foundryAsk: true, cold: true },
    });
    const g = applyUnlight(gWorld, "g");
    expect(g.players.get("g")?.heard).toBe(FOUNDRY_SPECTATOR);
    expect(g.vesperAtFoundry).toBe(false);
    expect(g.foundryDark).toBe(false);
  });
});

describe("Gestell clerks and weather", () => {
  it("clerks are job titles, not demons", () => {
    const w = emptyWorld();
    expect(w.clerks.map((c) => c.name)).toEqual(["Desk Three", "Annex Runner"]);
    expect(w.clerks.every((c) => !/demon|devil|fiend/i.test(c.name))).toBe(true);
  });

  it("clerk telegraphs then strikes; strike drops named wreckage", () => {
    const w = emptyWorld();
    const clerk = w.clerks[0];
    w.players.set("a", { ...spawnGuest("a"), x: clerk.x, y: clerk.y });
    const wound = tickWorld(w, 0.05);
    expect(wound.clerks[0].telegraph).toBeGreaterThan(0);
    expect(wound.players.get("a")?.hp).toBe(100);
    let cur = wound;
    for (let i = 0; i < 20; i++) cur = tickWorld(cur, 0.05);
    expect(cur.players.get("a")!.hp).toBeLessThan(100);

    const fight = emptyWorld();
    fight.players.set("a", { ...spawnGuest("a"), x: clerk.x, y: clerk.y });
    const after = applyStrike(fight, "a");
    expect(after.clerks.find((c) => c.id === clerk.id)?.hp).toBeLessThan(clerk.hp);
    const dead = { ...fight, clerks: fight.clerks.map((c) => ({ ...c, hp: 10 })) };
    dead.players.set("a", { ...spawnGuest("a"), x: clerk.x, y: clerk.y });
    const kill = applyStrike(dead, "a");
    expect(kill.clerks.find((c) => c.id === clerk.id)).toBeUndefined();
    expect(kill.wreckage[0]?.fromName).toBe("Desk Three");
  });

  it("damageFor ignores token-shaped extras", () => {
    const a = spawnGuest("a");
    const rich = { ...a, bestand: 9999 } as typeof a & { reverie?: number };
    rich.reverie = 1_000_000;
    expect(damageFor(rich)).toBe(damageFor(a));
    expect(guestCanClaim(rich)).toBe(false);
  });

  it("naming the weather from Safety, Ord, and Nara strikes the plaque POI", () => {
    const nara = NAVE_NPCS.find((n) => n.id === "nara")!;
    const ord = NAVE_NPCS.find((n) => n.id === "ord")!;
    const sign = NAVE_SIGNS[0];
    let w = emptyWorld();
    w.players.set("a", { ...spawnGuest("a"), x: nara.x, y: nara.y });
    w = applyTalk(w, "a", "nara");
    w.players.set("a", { ...w.players.get("a")!, x: ord.x, y: ord.y });
    w = applyTalk(w, "a", "ord");
    expect(w.weatherNamed).toBe(false);
    w.players.set("a", { ...w.players.get("a")!, x: sign.x, y: sign.y });
    w = applyRead(w, "a", "safety-plaque");
    expect(w.players.get("a")?.namedWeather).toBe(true);
    expect(w.weatherNamed).toBe(true);
    expect(w.signs[0]?.title).toBe("Office of Safety — struck");
    expect(w.pois[0]?.kind).toBe("named-weather");
    expect(w.pois[0]?.name).toBe("Named weather");
    expect(w.players.get("a")?.heard).toContain("named the weather");
    expect(guestCanClaim(w.players.get("a")!)).toBe(false);
  });
});

describe("Angel link stub", () => {
  it("guest stays #0000 with aura 0 and hidden Winke", () => {
    const g = spawnGuest("g1");
    expect(formatSerial(g.serial)).toBe("#0000");
    expect(g.aura).toBe(0);
    expect(winkeVisible(g.guest)).toBe(false);
    expect(guestCanClaim(g)).toBe(false);
  });

  it("mock #7777 seeds aura, still cannot claim, damage unchanged", () => {
    const w = emptyWorld();
    w.players.set("a", spawnGuest("a"));
    expect(applyLink(w, "a", 1, MOCK_SIG).players.get("a")?.guest).toBe(true);
    expect(applyLink(w, "a", TEST_SERIAL, "wallet").players.get("a")?.guest).toBe(true);
    const linked = applyLink(w, "a", TEST_SERIAL, MOCK_SIG);
    const p = linked.players.get("a")!;
    expect(p.guest).toBe(false);
    expect(p.serial).toBe(7777);
    expect(p.aura).toBe(auraSeed(7777));
    expect(p.aura).toBeGreaterThan(0);
    expect(formatSerial(p.serial)).toBe("#7777");
    expect(winkeVisible(p.guest)).toBe(true);
    expect(guestCanClaim(p)).toBe(false);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("b")));
    expect(p.house).toBe("mortals");
    expect(p.messenger).toBe("herald");
    expect(houseFor(TEST_SERIAL)).toBe("mortals");
    expect(messengerFor(TEST_SERIAL)).toBe("herald");
    expect(houseName(p.house)).toBe("House of Mortals");
    expect(messengerName(p.messenger)).toBe("Herald");
    expect(p.heard).toContain("House of Mortals");
    expect(p.heard).toContain("Herald");
    expect(p.heard).not.toMatch(/\$REVERIE|APY|yield/i);
    expect(linked.history).toEqual([{ ...HISTORY_7777 }]);
    expect(visibleHistory(true, null, linked.history)).toEqual([]);
    expect(visibleHistory(false, TEST_SERIAL, linked.history)).toHaveLength(1);
  });
});

describe("Fourfold houses", () => {
  it("houses change perception and gather, never damage", () => {
    expect(houseFor(TEST_SERIAL)).toBe("mortals");
    expect(houseName("earth")).toBe("House of Earth");
    expect(houseName("sky")).toBe("House of Sky");
    expect(houseName("divinities")).toBe("House of Divinities");
    expect(earthTax(8, "earth")).toBe(6);
    expect(earthTax(8, "sky")).toBe(8);
    expect(divinitiesKeep("divinities")).toBe(2);
    expect(divinitiesKeep("mortals")).toBe(1);

    const earth = { ...spawnGuest("e"), house: "earth" as const, guest: false };
    const sky = { ...spawnGuest("s"), house: "sky" as const, guest: false };
    const mortals = { ...spawnGuest("m"), house: "mortals" as const, guest: false };
    const divinities = { ...spawnGuest("d"), house: "divinities" as const, guest: false };
    expect(damageFor(earth)).toBe(damageFor(spawnGuest("g")));
    expect(damageFor(sky)).toBe(damageFor(divinities));
    expect(damageFor(mortals)).toBe(damageFor(earth));
    expect(guestCanClaim(earth)).toBe(false);
  });

  it("Earth skims less tax; Divinities keep extra Winke; Mortals see the failed hour", () => {
    const w = emptyWorld();
    const node = w.nodes[0];
    w.players.set("e", {
      ...spawnGuest("e"),
      guest: false,
      house: "earth",
      beats: { ...emptyBeats(), hall: true },
      x: node.x,
      y: node.y,
    });
    const tax = gestellTax(w.gestell);
    const after = applyUse(w, "e", node.id, "extract");
    expect(after.players.get("e")?.bestand).toBe(40 - earthTax(tax, "earth"));
    expect(after.players.get("e")?.bestand).toBeGreaterThan(40 - tax);
    expect(damageFor(after.players.get("e")!)).toBe(damageFor(spawnGuest("g")));

    const keepW = emptyWorld();
    const n = keepW.nodes[0];
    keepW.players.set("d", {
      ...spawnGuest("d"),
      guest: false,
      house: "divinities",
      x: n.x,
      y: n.y,
    });
    const kept = applyUse(keepW, "d", n.id, "keep");
    expect(kept.players.get("d")?.winke).toBe(2);

    expect(visibleFailed(false, 1, [{ ...FAILED_PASSING }], "mortals")).toHaveLength(1);
    expect(visibleFailed(false, 1, [{ ...FAILED_PASSING }], "sky")).toEqual([]);
    expect(visibleFailed(true, null, [{ ...FAILED_PASSING }], "")).toEqual([]);
    expect(ruinSight(false, 2, "mortals")).toBe(true);
    expect(guestCanClaim(kept.players.get("d")!)).toBe(false);
  });
});

describe("Herald Announce", () => {
  it("pings a kept node and never buys damage", () => {
    const w = emptyWorld();
    const node = w.nodes[0];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      messenger: "herald",
      house: "mortals",
      x: node.x,
      y: node.y,
    });
    const kept = applyUse(w, "a", node.id, "keep");
    expect(kept.nodes[0].kept).toBe(true);
    const ping = applyAnnounce(kept, "a", node.id);
    const p = ping.players.get("a")!;
    expect(ping.announced).toBe(node.id);
    expect(p.heard).toBe(ANNOUNCE_COPY);
    expect(p.wink).toBe(WINK_ANNOUNCE);
    expect(snapshot(ping).announced).toBe(node.id);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);

    const raw = emptyWorld();
    raw.players.set("a", { ...spawnGuest("a"), guest: false, messenger: "herald", x: node.x, y: node.y });
    expect(applyAnnounce(raw, "a", node.id).announced).toBeNull();
    expect(applyAnnounce(raw, "a", node.id).players.get("a")?.heard).toBe(ANNOUNCE_NEED);

    const cyber = emptyWorld();
    cyber.nodes[0] = { ...node, depleted: true, kept: true };
    cyber.players.set("c", {
      ...spawnGuest("c"),
      guest: false,
      messenger: "cybernetic",
      x: node.x,
      y: node.y,
    });
    expect(applyAnnounce(cyber, "c", node.id).announced).toBeNull();
    expect(applyAnnounce(cyber, "c", node.id).players.get("c")?.heard).toBe(ANNOUNCE_NEED);

    const gWorld = emptyWorld();
    gWorld.nodes[0] = { ...node, depleted: true, kept: true };
    gWorld.players.set("g", { ...spawnGuest("g"), x: node.x, y: node.y });
    const guest = applyAnnounce(gWorld, "g", node.id);
    expect(guest.announced).toBeNull();
    expect(guest.players.get("g")?.heard).toBe(ANNOUNCE_SPECTATOR);
    expect(guest.players.get("g")?.wink).toBe("");
  });
});

describe("serial history wreckage", () => {
  it("only the linked serial sees and may bury the prior hour", () => {
    const w = emptyWorld();
    w.players.set("a", spawnGuest("a"));
    const linked = applyLink(w, "a", TEST_SERIAL, MOCK_SIG);
    expect(visibleHistory(false, 1, linked.history)).toEqual([]);
    const angel = linked.players.get("a")!;
    linked.players.set("a", { ...angel, x: HISTORY_7777.x, y: HISTORY_7777.y });
    const seeded = applyBury(linked, "a");
    expect(seeded.players.get("a")?.heard).toBe(WINK_SEED_COPY);
    expect(seeded.history).toHaveLength(1);
    const buried = applyBury(seeded, "a");
    const p = buried.players.get("a")!;
    expect(p.heard).toBe(HISTORY_7777.line);
    expect(p.wink).toBe(WINK_HISTORY);
    expect(buried.history).toEqual([]);
    expect(p.readiness).toBe(angel.readiness + 1);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("b")));
    expect(guestCanClaim(p)).toBe(false);
  });

  it("guest standing on the mark sees nothing and cannot bury it", () => {
    const w = emptyWorld();
    w.history = [{ ...HISTORY_7777 }];
    w.players.set("g", { ...spawnGuest("g"), x: HISTORY_7777.x, y: HISTORY_7777.y });
    const after = applyBury(w, "g");
    expect(after.history).toHaveLength(1);
    expect(after.players.get("g")?.wink).toBe("");
    expect(visibleHistory(true, null, after.history)).toEqual([]);
    expect(guestCanClaim(after.players.get("g")!)).toBe(false);
  });
});

describe("Palindrome Wink seed", () => {
  it("palindrome serials seed a Wink at the prior hour; other serials bury; not a stick", () => {
    expect(palindromeSerial(7777)).toBe(true);
    expect(palindromeSerial(1111)).toBe(true);
    expect(palindromeSerial(707)).toBe(true);
    expect(palindromeSerial(1234)).toBe(false);
    const w = emptyWorld();
    w.history = [{ ...HISTORY_7777 }];
    w.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: TEST_SERIAL,
      x: HISTORY_7777.x,
      y: HISTORY_7777.y,
    });
    const seeded = applyBury(w, "a");
    const p = seeded.players.get("a")!;
    expect(p.heard).toBe(WINK_SEED_COPY);
    expect(p.wink).toBe(WINK_SEED);
    expect(p.beats.winkSeed).toBe(true);
    expect(seeded.winkSeedHeld).toBe(true);
    expect(seeded.history).toHaveLength(1);
    expect(seeded.pois.find((poi) => poi.kind === "wink-seed")?.x).toBe(HISTORY_7777.x);
    expect(seeded.signs.find((s) => s.id === "wink-seed")?.title).toBe(WINK_SEED_PLAQUE.title);
    expect(p.heard).not.toMatch(/heidegger|midgar|\$REVERIE/i);
    expect(damageFor(p)).toBe(damageFor(spawnGuest("g")));
    expect(guestCanClaim(p)).toBe(false);
    expect(applyBury(seeded, "a").players.get("a")?.heard).toBe(HISTORY_7777.line);

    const other = emptyWorld();
    other.history = [{ ...HISTORY_7777, serial: 1234 }];
    other.players.set("a", {
      ...spawnGuest("a"),
      guest: false,
      serial: 1234,
      x: HISTORY_7777.x,
      y: HISTORY_7777.y,
    });
    const buried = applyBury(other, "a");
    expect(buried.players.get("a")?.heard).toBe(HISTORY_7777.line);
    expect(buried.winkSeedHeld).toBe(false);
    expect(buried.history).toEqual([]);
  });
});

