/**
 * Houses: halls, standing, tithe, bounties, the timed House war and the
 * perception each House grants. Standing is a lamp, never a stick: nothing in
 * this module changes damage.
 */
import { GESTELL_MELTDOWN, TITHE_COST, WAR_HOLD, WAR_PERIOD, WAR_RADIUS, WRECKAGE_TTL_BONUS } from "./constants";
import type { Fourfold, House, HouseScores, HouseWar, Player, WorldState } from "./types";
import { POSITIONS, nearPoint } from "./map";
import { LINES } from "./content";
import { notice, pushNews, say } from "./world";
import { earn, spend } from "./economy";

export const WAR_SITES = ["clearing-ring", "hot-street"] as const;
export const BOUNTY_AMOUNT = 5;
export const WAR_STANDING = 3;
const HALL_REACH = 56;
const BOUNTY_FLAG = "bounty:at";

const HOUSE_NAMES: Record<Fourfold, string> = {
  earth: "House of Earth",
  sky: "House of Sky",
  mortals: "House of Mortals",
  divinities: "House of Divinities",
};
const SITE_NAMES: Record<string, string> = { "clearing-ring": "the Clearing", "hot-street": "the hot street" };

// Copy owned by this module.
const TITHE_WRONG_HALL = "This hall keeps another House standing. Yours is elsewhere.";
const TITHE_PAID = (cost: number) => `Tithe. ${cost} Bestand. Upkeep, not a stick. The lamp holds.`;
const BOUNTY_DARK = "The hall is dark. Read the plaque before you ask the pool for anything.";
const BOUNTY_NONE = "No omen yet. Win the hole first.";
const BOUNTY_POOL = "The pool is thin. Tithe is upkeep; bounty comes after.";
const BOUNTY_HELD = "The bounty already paid. One omen, one purse.";
const BOUNTY_PAID = `Bounty. ${BOUNTY_AMOUNT} Bestand from the tithe pool. It was already priced.`;
const WAR_OPENS = (site: string) => `A House hold opens at ${site}. Stand there. Standing is all it pays.`;
const WAR_WON = (house: Fourfold, site: string) => `${HOUSE_NAMES[house]} held ${site}. Standing and an omen. Not a bigger stick.`;
const WAR_NONE = (site: string) => `The hold at ${site} passed. No House stood in it long enough.`;
const WAR_OMEN = "Your House held the hole. Tithe eases while the omen lasts.";

// ---------------------------------------------------------------- helpers

const zeroScores = (): HouseScores => ({ earth: 0, sky: 0, mortals: 0, divinities: 0 });
const isFourfold = (h: House): h is Fourfold => h === "earth" || h === "sky" || h === "mortals" || h === "divinities";

function setPlayer(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}

function speak(w: WorldState, p: Player, text: string): WorldState {
  return setPlayer(w, say(p, text, w.now));
}

/** True while this House holds the omen from the last war. */
export function hasOmen(w: WorldState, house: Fourfold): boolean {
  return (w.flags[`omen:${house}`] ?? 0) > 0;
}

// ---------------------------------------------------------------- state

export function initialHouses(): WorldState["houses"] {
  return {
    standing: zeroScores(),
    tithe: 0,
    war: {
      active: false,
      startsAt: WAR_PERIOD,
      endsAt: 0,
      held: zeroScores(),
      winner: "",
      lastWinner: "",
      site: WAR_SITES[0],
    },
  };
}

export function hallFor(house: Fourfold): string {
  return `hall-${house}`;
}

// ---------------------------------------------------------------- house war

function counts(p: Player): p is Player & { house: Fourfold } {
  return !p.guest && !p.locked && !p.dead && isFourfold(p.house);
}

export function tickHouseWar(w: WorldState, dt: number): WorldState {
  const war = w.houses.war;

  if (!war.active) {
    if (w.now < war.startsAt) return w;
    const opened: HouseWar = { ...war, active: true, endsAt: war.startsAt + WAR_HOLD, held: zeroScores(), winner: "" };
    const next: WorldState = { ...w, houses: { ...w.houses, war: opened } };
    return pushNews(next, WAR_OPENS(SITE_NAMES[war.site] ?? war.site));
  }

  const site = POSITIONS[war.site];
  const held: HouseScores = { ...war.held };
  if (site && dt > 0) {
    for (const p of w.players.values()) {
      if (!counts(p)) continue;
      if (!nearPoint(p.x, p.y, site.x, site.y, WAR_RADIUS)) continue;
      held[p.house] += dt;
    }
  }

  if (w.now < war.endsAt) {
    return { ...w, houses: { ...w.houses, war: { ...war, held } } };
  }

  // Resolve the window.
  let winner: House = "";
  let best = 0;
  let tie = false;
  for (const house of Object.keys(held) as Fourfold[]) {
    const seconds = held[house];
    if (seconds <= 0) continue;
    if (seconds > best) { best = seconds; winner = house; tie = false; }
    else if (seconds === best) tie = true;
  }
  if (tie) winner = "";

  const siteName = SITE_NAMES[war.site] ?? war.site;
  const nextSite = war.site === WAR_SITES[0] ? WAR_SITES[1] : WAR_SITES[0];
  const closed: HouseWar = {
    ...war,
    active: false,
    held,
    winner,
    lastWinner: winner || war.lastWinner,
    startsAt: war.endsAt + WAR_PERIOD,
    endsAt: war.endsAt,
    site: nextSite,
  };
  let next: WorldState = { ...w, houses: { ...w.houses, war: closed } };

  if (!isFourfold(winner)) return pushNews(next, WAR_NONE(siteName));

  const standing = { ...next.houses.standing, [winner]: next.houses.standing[winner] + WAR_STANDING };
  const flags = { ...next.flags };
  for (const house of Object.keys(HOUSE_NAMES) as Fourfold[]) delete flags[`omen:${house}`];
  flags[`omen:${winner}`] = 1;
  next = { ...next, flags, houses: { ...next.houses, standing } };
  next = pushNews(next, WAR_WON(winner, siteName));
  const players = new Map(next.players);
  for (const p of next.players.values()) {
    if (p.guest || p.house !== winner) continue;
    players.set(p.id, notice(p, WAR_OMEN, next.now, "gold"));
  }
  return { ...next, players };
}

export function applyStanding(w: WorldState, house: Fourfold, delta: number): WorldState {
  if (!Number.isFinite(delta) || delta === 0) return w;
  const standing = { ...w.houses.standing, [house]: w.houses.standing[house] + delta };
  return { ...w, houses: { ...w.houses, standing } };
}

// ---------------------------------------------------------------- perception

/** What a House and a messenger let you perceive. Never a damage number. With the weather given, Divinities go blind at meltdown. */
export function perception(p: Player, gestell?: number): { wreckageBonus: number; forecast: boolean; winkDensity: number; groundResist: number; funeralSight: boolean } {
  const out = { wreckageBonus: 0, forecast: false, winkDensity: p.guest ? 0 : 1, groundResist: 0, funeralSight: false };
  if (p.guest) return out;
  switch (p.house) {
    case "mortals":
      out.wreckageBonus = WRECKAGE_TTL_BONUS;
      out.funeralSight = true;
      break;
    case "sky":
      out.forecast = true;
      break;
    case "divinities":
      // Winke density, and fragile where the weather is at its worst.
      out.winkDensity = gestell !== undefined && gestell >= GESTELL_MELTDOWN ? 0 : 2;
      break;
    case "earth":
      out.groundResist = 2;
      break;
    default:
      break;
  }
  if (p.messenger === "ruin") out.wreckageBonus = Math.max(out.wreckageBonus, WRECKAGE_TTL_BONUS);
  return out;
}

// ---------------------------------------------------------------- tithe and bounty

function atOwnHall(p: Player & { house: Fourfold }): boolean {
  const hall = POSITIONS[hallFor(p.house)];
  return !!hall && nearPoint(p.x, p.y, hall.x, hall.y, HALL_REACH);
}

/** Tithe cost for this House right now; the omen eases it by one. */
export function titheCost(w: WorldState, house: Fourfold): number {
  return Math.max(1, TITHE_COST - (hasOmen(w, house) ? 1 : 0));
}

export function applyTithe(w: WorldState, id: string): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead) return w;
  if (p.guest || !isFourfold(p.house)) return speak(w, p, LINES.SPECTATOR);
  const house = p.house;
  if (!atOwnHall({ ...p, house })) return speak(w, p, TITHE_WRONG_HALL);
  const cost = titheCost(w, house);
  const paid = spend(w, id, cost, "tithe");
  if (!paid) return speak(w, p, LINES.CANT_AFFORD);
  const standing = { ...paid.houses.standing, [house]: paid.houses.standing[house] + 1 };
  const next: WorldState = { ...paid, houses: { ...paid.houses, standing, tithe: paid.houses.tithe + cost } };
  const me = next.players.get(id) ?? p;
  return speak(next, me, TITHE_PAID(cost));
}

export function applyBounty(w: WorldState, id: string): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead) return w;
  if (p.guest || !isFourfold(p.house)) return speak(w, p, LINES.SPECTATOR);
  const house = p.house;
  if (!atOwnHall({ ...p, house })) return speak(w, p, TITHE_WRONG_HALL);
  if (w.pois[hallFor(house)]?.state !== "lit") return speak(w, p, BOUNTY_DARK);
  if (w.houses.standing[house] <= 0) return speak(w, p, BOUNTY_NONE);
  if (w.houses.tithe < BOUNTY_AMOUNT) return speak(w, p, BOUNTY_POOL);
  const last = p.flags[BOUNTY_FLAG];
  if (last !== undefined && w.now - last < WAR_PERIOD) return speak(w, p, BOUNTY_HELD);
  let next: WorldState = { ...w, houses: { ...w.houses, tithe: w.houses.tithe - BOUNTY_AMOUNT } };
  next = setPlayer(next, { ...p, flags: { ...p.flags, [BOUNTY_FLAG]: w.now } });
  next = earn(next, id, BOUNTY_AMOUNT, "bounty");
  const me = next.players.get(id) ?? p;
  return speak(next, me, BOUNTY_PAID);
}
