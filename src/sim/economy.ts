/**
 * Economy: yield nodes, Gestell tax, earners and their sinks, items, the
 * disarmed claims desk, the exhibition market and Quill's forge tray.
 *
 * Every number here is server-owned. Nothing in this module touches damage.
 * Every earner in EARNERS maps to a sink in EARNER_SINKS; a test asserts it.
 */
import {
  AURA_CRAFT_WITHER,
  AURA_DARK_YIELD_BONUS,
  AURA_DIM,
  AURA_MAX,
  BANK_FEE,
  CLAIM_AMOUNT,
  CLAIM_CAP,
  CLAIM_HOLD,
  COPY_PRICE,
  EXHIBIT_DECAY,
  FORGE_COST,
  GESTELL_EXTRACT,
  GESTELL_FAT,
  GESTELL_KEEP,
  KIT_DURATION,
  LISTING_FEE,
  MAX_HP,
  NARA_THRESHOLD,
  NODE_CHARGES,
  NODE_FAT_MULT,
  NODE_REGEN,
  NODE_RESTRAINT_MULT,
  NODE_YIELD,
  READINESS_KEEP,
  READINESS_MAX,
  RESTRAINT_KEEP_GAIN,
  RESTRAINT_MAX,
} from "./constants";
import type { Claim, Item, Listing, Player, WorldState, YieldNode } from "./types";
import { NODE_LIST, nearPoint } from "./map";
import { EARNERS, SINKS, W } from "./content/ids";
import { LINES } from "./content";
import { say } from "./world";
import { perception } from "./houses";

export type EarnerId = (typeof EARNERS)[number];
export type SinkId = (typeof SINKS)[number];

/** Every earner ships a sink. The integration test walks EARNERS against this table. */
export const EARNER_SINKS: Record<EarnerId, SinkId> = {
  node: "tax",
  spoils: "repair",
  craft: "listing",
  bounty: "tithe",
  claim: "bank",
  stipend: "upkeep",
  operator: "door",
};

/** Item ids the engine knows by name. */
export const ITEM_COPY_WINK = "copy:wink";
export const ITEM_INSURANCE = "paper:insurance";
export const ITEM_REPAIR = "paper:repair";

// Copy owned by this module. Cold, short, concrete noun first.
const NODE_REACH = 56;
const NODE_SPENT = "The node is spent. The weather will fill it again. It always does.";
const NODE_EXTRACTED = (amount: number, tax: number) =>
  amount > 0
    ? `Yield. ${amount} Bestand after the tax of ${tax}. The weather thickens a little.`
    : `Yield. Nothing after the tax. The weather thickens all the same.`;
const NODE_KEPT = "You leave it unspent. Readiness. No pay.";
const NODE_KEEP_FIRST = "It has to be kept before it can be named safe.";
const NODE_SEEDED = "A seed in the ground under the node. The Clearing will know it.";
const REPAIR_USED = "The print holds again. Cult objects were never cracked.";
const MARKET_GUEST = "A stall of lights. A guest cannot list or buy a sky they cannot see.";
const MARKET_NOT_EXHIBITION = "Cult does not list. It stays in the hand that buried it.";
const MARKET_NO_ITEM = "You do not hold that.";
const MARKET_BAD_PRICE = "Price it between one and nine hundred ninety-nine. The stall does not do zero.";
const MARKET_LISTED = (price: number, fee: number) =>
  fee > 0 ? `Listed at ${price}. Listing fee ${fee}. Exhibition decays.` : `Listed at ${price}. Glamour waived the fee. Exhibition still decays.`;
const MARKET_NO_LISTING = "That listing is gone.";
const MARKET_SELLER_AWAY = "The seller is not on the Grid. The listing waits.";
const MARKET_OWN_LISTING = "It is your listing. Cancel it if you want it back.";
const MARKET_BOUGHT = (price: number) => `Bought for ${price}. A copy travels. The hole does not.`;
const MARKET_CANCELLED = "The listing comes down. The print is back in your hand.";
const FORGE_CRAFTED = "A print. It looks like a Wink. It lists. It will not open the hole.";
const FORGE_SPOTTED = "You keep the eye. The printed ones go to the tray. The buried one opens.";
const FORGE_NOTHING_TO_SPOT = "Nothing in your hand is a copy.";
const FORGE_NOTHING_TO_SELL = "Nothing in your hand is a print. Craft one first.";
const FORGE_SOLD = "You sold a copy. Aura thins. Cult does not list.";
const CRAFT_WINDOW_AT = "craft:windowAt"; // personal: when the current run of prints began
const CRAFT_WINDOW_N = "craft:windowN"; // personal: prints in that run; the second and later thin the aura

// ---------------------------------------------------------------- helpers

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clampGestell = (g: number) => clamp(g, 0, 100);

function setPlayer(w: WorldState, p: Player): WorldState {
  const players = new Map(w.players);
  players.set(p.id, p);
  return { ...w, players };
}

function bumpFlag(w: WorldState, key: string, delta: number): WorldState {
  return { ...w, flags: { ...w.flags, [key]: (w.flags[key] ?? 0) + delta } };
}

function speak(w: WorldState, p: Player, text: string): WorldState {
  return setPlayer(w, say(p, text, w.now));
}

function kitActive(p: Player, verb: Player["messenger"], now: number): boolean {
  return !!p.kit && p.kit.verb === verb && p.kit.until > now;
}

function isFrozen(w: WorldState, district: string): boolean {
  return (w.frozen[district] ?? 0) > w.now;
}

// ---------------------------------------------------------------- nodes

export function initialNodes(): YieldNode[] {
  return NODE_LIST.map(n => ({
    id: n.id,
    district: n.district,
    x: n.x,
    y: n.y,
    charges: NODE_CHARGES,
    regenAt: 0,
    kept: false,
    keptBy: "",
    announcedUntil: 0,
    seed: false,
  }));
}

/** Regenerates one charge per NODE_REGEN while a node is below full; expires announcements. */
export function tickNodes(w: WorldState, _dt: number): WorldState {
  let changed = false;
  const nodes = w.nodes.map(n => {
    let next = n;
    if (n.charges < NODE_CHARGES && n.regenAt <= w.now) {
      const charges = n.charges + 1;
      next = { ...next, charges, regenAt: charges < NODE_CHARGES ? w.now + NODE_REGEN : 0 };
    }
    if (next.announcedUntil > 0 && next.announcedUntil <= w.now) {
      next = { ...next, announcedUntil: 0 };
    }
    if (next !== n) changed = true;
    return next;
  });
  return changed ? { ...w, nodes } : w;
}

/** Gestell tax in percentage points: 0 at clear weather, 25 at meltdown. */
export function gestellTax(gestell: number): number {
  return Math.floor(clampGestell(gestell) / 4);
}

/** What one extraction pays this player at this node, after the tax. Frozen districts pay nothing; a dark aura farms a little better. */
export function nodeYield(w: WorldState, p: Player, node: YieldNode): number {
  if (isFrozen(w, node.district)) return 0;
  const fat = w.gestell >= GESTELL_FAT;
  const dark = !p.guest && p.aura < AURA_DIM;
  const base = NODE_YIELD * (fat ? NODE_FAT_MULT : 1) * (p.stance === "restraint" ? NODE_RESTRAINT_MULT : 1) * (dark ? 1 + AURA_DARK_YIELD_BONUS : 1);
  const taxPoints = Math.max(0, gestellTax(w.gestell) - perception(p).groundResist);
  return Math.max(0, Math.floor(base * (1 - taxPoints / 100)));
}

export function applyNode(w: WorldState, id: string, nodeId: string, op: "extract" | "keep" | "announce" | "seed"): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead) return w;
  const index = w.nodes.findIndex(n => n.id === nodeId);
  if (index < 0) return w;
  const node = w.nodes[index];
  const near = nearPoint(p.x, p.y, node.x, node.y, NODE_REACH);

  const withNode = (ww: WorldState, next: YieldNode): WorldState => {
    const nodes = ww.nodes.slice();
    nodes[index] = next;
    return { ...ww, nodes };
  };

  switch (op) {
    case "extract": {
      if (!near) return w;
      if (isFrozen(w, node.district)) return speak(w, p, LINES.FROZEN);
      if (node.charges <= 0) return speak(w, p, NODE_SPENT);
      const pay = nodeYield(w, p, node);
      const tax = Math.max(0, gestellTax(w.gestell) - perception(p).groundResist);
      const charges = node.charges - 1;
      let next = withNode(w, {
        ...node,
        charges,
        regenAt: node.regenAt > w.now ? node.regenAt : w.now + NODE_REGEN,
        kept: false,
        keptBy: "",
        announcedUntil: 0,
      });
      next = { ...next, gestell: clampGestell(next.gestell + GESTELL_EXTRACT) };
      next = bumpFlag(next, W.EXTRACTIONS, 1);
      const extractedSinceFuneral = p.extractedSinceFuneral + 1;
      let me: Player = { ...p, extracted: p.extracted + 1, extractedSinceFuneral };
      next = setPlayer(next, me);
      if (pay > 0) next = earn(next, id, pay, "node");
      me = next.players.get(id) ?? me;
      if (extractedSinceFuneral >= NARA_THRESHOLD && me.party.nara === "with") {
        me = { ...me, party: { ...me.party, nara: "gone" } };
        return speak(next, me, LINES.NARA_LEAVES);
      }
      return speak(next, me, NODE_EXTRACTED(pay, tax));
    }
    case "keep": {
      if (!near) return w;
      if (node.kept) return speak(w, p, LINES.ALREADY);
      let next = withNode(w, { ...node, kept: true, keptBy: id });
      next = { ...next, gestell: clampGestell(next.gestell + GESTELL_KEEP) };
      const me: Player = {
        ...p,
        kept: p.kept + 1,
        readiness: clamp(p.readiness + READINESS_KEEP, 0, READINESS_MAX),
        restraint: clamp(p.restraint + RESTRAINT_KEEP_GAIN, 0, RESTRAINT_MAX),
      };
      return speak(next, me, NODE_KEPT);
    }
    case "announce": {
      if (!node.kept) return speak(w, p, NODE_KEEP_FIRST);
      return withNode(w, { ...node, announcedUntil: w.now + KIT_DURATION });
    }
    case "seed": {
      if (node.seed) return speak(w, p, LINES.ALREADY);
      let next = withNode(w, { ...node, seed: true });
      const seeds = next.clearing.seeds.includes(node.id) ? next.clearing.seeds : [...next.clearing.seeds, node.id];
      next = { ...next, clearing: { ...next.clearing, seeds } };
      return speak(next, p, NODE_SEEDED);
    }
    default:
      return w;
  }
}

// ---------------------------------------------------------------- purse

/** Credits the purse and the world's `earned:<earner>` counter. */
export function earn(w: WorldState, id: string, amount: number, earner: EarnerId | string): WorldState {
  const p = w.players.get(id);
  if (!p || !(amount > 0)) return w;
  const next = setPlayer(w, { ...p, bestand: p.bestand + amount });
  return bumpFlag(next, `earned:${earner}`, amount);
}

/** Debits the purse into a sink; null when the purse cannot cover it (caller says LINES.CANT_AFFORD). */
export function spend(w: WorldState, id: string, amount: number, sink: SinkId | string): WorldState | null {
  const p = w.players.get(id);
  if (!p) return null;
  if (amount <= 0) return w;
  if (p.bestand < amount) return null;
  const next = setPlayer(w, { ...p, bestand: p.bestand - amount });
  return bumpFlag(next, `sunk:${sink}`, amount);
}

// ---------------------------------------------------------------- items

export function addItem(p: Player, item: Item): Player {
  const qty = Math.max(1, Math.floor(item.qty || 1));
  const index = p.items.findIndex(i => i.id === item.id);
  if (index < 0) return { ...p, items: [...p.items, { ...item, qty }] };
  const items = p.items.slice();
  const held = items[index];
  items[index] = { ...held, qty: held.qty + qty, value: Math.max(held.value, item.value) };
  return { ...p, items };
}

export function removeItem(p: Player, id: string, qty = 1): Player {
  const index = p.items.findIndex(i => i.id === id);
  if (index < 0) return p;
  const held = p.items[index];
  const items = p.items.slice();
  if (held.qty - qty <= 0) items.splice(index, 1);
  else items[index] = { ...held, qty: held.qty - qty };
  return { ...p, items };
}

export function hasItem(p: Player, id: string, qty = 1): boolean {
  const held = p.items.find(i => i.id === id);
  return !!held && held.qty >= qty;
}

export function applyUse(w: WorldState, id: string, itemId: string): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead) return w;
  if (!hasItem(p, itemId)) return speak(w, p, LINES.CANT_USE);
  if (itemId === ITEM_INSURANCE) {
    if (p.insured) return speak(w, p, LINES.ALREADY);
    return speak(w, removeItem({ ...p, insured: true }, itemId), LINES.INSURANCE_USED);
  }
  if (itemId === ITEM_REPAIR) {
    return speak(w, removeItem({ ...p, hp: MAX_HP }, itemId), REPAIR_USED);
  }
  return speak(w, p, LINES.CANT_USE);
}

// ---------------------------------------------------------------- claims desk (disarmed)

/**
 * The desk is disarmed. `file` moves purse into a held claim, `take` settles a
 * ripe claim into banked Bestand once and only once. Nothing here is real value.
 */
export function applyClaims(w: WorldState, id: string, op: "file" | "bank" | "take", claimId?: string): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead) return w;
  if (p.guest) return speak(w, p, LINES.CLAIMS_GUEST);

  switch (op) {
    case "file": {
      if (claimId && p.claims.some(c => c.id === claimId)) return w; // idempotent by id
      if (p.claimsFiled >= CLAIM_CAP) return speak(w, p, LINES.CLAIMS_CAP);
      if (p.bestand < CLAIM_AMOUNT) return speak(w, p, LINES.CANT_AFFORD);
      const serialNo = p.claimsFiled + 1;
      const claim: Claim = {
        id: claimId ?? `claim:${id}:${serialNo}`,
        label: claimId ?? `Claim ${serialNo}`,
        amount: CLAIM_AMOUNT,
        filedAt: w.now,
        readyAt: w.now + CLAIM_HOLD,
        settled: false,
      };
      const me: Player = { ...p, bestand: p.bestand - CLAIM_AMOUNT, claims: [...p.claims, claim], claimsFiled: serialNo };
      return speak(w, me, LINES.CLAIMS_FILED);
    }
    case "bank": {
      if (p.bestand <= 0) return speak(w, p, LINES.CANT_AFFORD);
      const kept = Math.floor(p.bestand * (1 - BANK_FEE));
      const fee = p.bestand - kept;
      let next = setPlayer(w, { ...p, bestand: 0, banked: p.banked + kept });
      if (fee > 0) next = bumpFlag(next, "sunk:bank", fee);
      const me = next.players.get(id) ?? p;
      return speak(next, me, LINES.BANKED);
    }
    case "take": {
      const index = claimId ? p.claims.findIndex(c => c.id === claimId) : p.claims.findIndex(c => !c.settled && c.readyAt <= w.now);
      if (index < 0) return w;
      const claim = p.claims[index];
      if (claim.settled) return w; // never twice
      if (claim.readyAt > w.now) return speak(w, p, LINES.CLAIMS_HELD);
      const claims = p.claims.slice();
      claims[index] = { ...claim, settled: true };
      let next = setPlayer(w, { ...p, claims, banked: p.banked + claim.amount });
      next = bumpFlag(next, "earned:claim", claim.amount);
      const me = next.players.get(id) ?? p;
      return speak(next, me, LINES.CLAIMS_TAKEN);
    }
    default:
      return w;
  }
}

// ---------------------------------------------------------------- market

export function applyMarket(
  w: WorldState,
  id: string,
  op: "list" | "buy" | "cancel",
  args: { itemId?: string; listingId?: string; price?: number },
): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead) return w;
  if (p.guest) return speak(w, p, MARKET_GUEST);

  switch (op) {
    case "list": {
      const itemId = args.itemId ?? "";
      const held = p.items.find(i => i.id === itemId);
      if (!held) return speak(w, p, MARKET_NO_ITEM);
      if (held.kind !== "exhibition" || held.bound) return speak(w, p, MARKET_NOT_EXHIBITION);
      const price = args.price ?? 0;
      if (!Number.isInteger(price) || price < 1 || price > 999) return speak(w, p, MARKET_BAD_PRICE);
      const fee = kitActive(p, "iridescent", w.now) ? 0 : LISTING_FEE;
      const paid = spend(w, id, fee, "listing");
      if (!paid) return speak(w, p, LINES.CANT_AFFORD);
      const payer = paid.players.get(id) ?? p;
      const listing: Listing = {
        id: `listing:${id}:${w.tick}:${paid.market.length}`,
        sellerId: id,
        sellerName: p.name,
        item: { ...held, qty: 1 },
        price,
        at: w.now,
      };
      const next = { ...paid, market: [...paid.market, listing] };
      // Putting a thing up for reproduction thins the one who does it. Surface is honest about its price.
      const seller = removeItem({ ...payer, aura: payer.guest ? 0 : Math.max(0, payer.aura - AURA_CRAFT_WITHER) }, itemId, 1);
      return speak(next, seller, MARKET_LISTED(price, fee));
    }
    case "buy": {
      const index = w.market.findIndex(l => l.id === args.listingId);
      if (index < 0) return speak(w, p, MARKET_NO_LISTING);
      const listing = w.market[index];
      if (listing.sellerId === id) return speak(w, p, MARKET_OWN_LISTING);
      // Bestand stays inside the sim: no seller on the Grid, no sale. The listing waits for them or their cancel.
      const seller = w.players.get(listing.sellerId);
      if (!seller) return speak(w, p, MARKET_SELLER_AWAY);
      if (p.bestand < listing.price) return speak(w, p, LINES.CANT_AFFORD);
      const market = w.market.slice();
      market.splice(index, 1);
      let next: WorldState = { ...w, market };
      const buyer = addItem({ ...p, bestand: p.bestand - listing.price }, listing.item);
      next = setPlayer(next, buyer);
      next = setPlayer(next, { ...seller, banked: seller.banked + listing.price });
      next = bumpFlag(next, "earned:craft", listing.price);
      return speak(next, buyer, MARKET_BOUGHT(listing.price));
    }
    case "cancel": {
      const index = w.market.findIndex(l => l.id === args.listingId && l.sellerId === id);
      if (index < 0) return speak(w, p, MARKET_NO_LISTING);
      const listing = w.market[index];
      const market = w.market.slice();
      market.splice(index, 1);
      return speak({ ...w, market }, addItem(p, listing.item), MARKET_CANCELLED);
    }
    default:
      return w;
  }
}

const DECAY_KEY = "exhibit:decayAt";

/** Exhibition decays: every EXHIBIT_DECAY seconds every exhibition item loses a unit of value (min 0). */
export function tickMarket(w: WorldState, _dt: number): WorldState {
  const due = w.flags[DECAY_KEY];
  if (due === undefined) return { ...w, flags: { ...w.flags, [DECAY_KEY]: w.now + EXHIBIT_DECAY } };
  if (w.now < due) return w;
  const decay = (item: Item): Item => (item.kind === "exhibition" && item.value > 0 ? { ...item, value: item.value - 1 } : item);
  const market = w.market.map(l => (l.item.kind === "exhibition" && l.item.value > 0 ? { ...l, item: decay(l.item) } : l));
  const players = new Map(w.players);
  for (const [pid, p] of w.players) {
    if (!p.items.some(i => i.kind === "exhibition" && i.value > 0)) continue;
    players.set(pid, { ...p, items: p.items.map(decay) });
  }
  return { ...w, market, players, flags: { ...w.flags, [DECAY_KEY]: due + EXHIBIT_DECAY } };
}

// ---------------------------------------------------------------- forge tray

function copyItem(): Item {
  return { id: ITEM_COPY_WINK, kind: "exhibition", name: "Printed Wink", qty: 1, value: COPY_PRICE };
}

export function applyForge(w: WorldState, id: string, op: "craft" | "spot" | "sell"): WorldState {
  const p = w.players.get(id);
  if (!p || p.dead) return w;
  if (p.guest) return speak(w, p, LINES.SPECTATOR);

  switch (op) {
    case "craft": {
      const paid = spend(w, id, FORGE_COST, "forge");
      if (!paid) return speak(w, p, LINES.CANT_AFFORD);
      const payer = paid.players.get(id) ?? p;
      // One print is a lesson. A run of them is mass reproduction, and the aura withers for every one past the first.
      const windowAt = payer.flags[CRAFT_WINDOW_AT] ?? -Infinity;
      const inWindow = w.now - windowAt < KIT_DURATION;
      const n = (inWindow ? payer.flags[CRAFT_WINDOW_N] ?? 0 : 0) + 1;
      const flags = { ...payer.flags, [CRAFT_WINDOW_AT]: inWindow ? windowAt : w.now, [CRAFT_WINDOW_N]: n };
      const aura = n > 1 ? Math.max(0, payer.aura - AURA_CRAFT_WITHER) : payer.aura;
      const me = addItem({ ...payer, fakeWinke: payer.fakeWinke + 1, flags, aura }, copyItem());
      return speak(paid, me, FORGE_CRAFTED);
    }
    case "spot": {
      const held = p.items.find(i => i.id === ITEM_COPY_WINK);
      if (!held && p.fakeWinke <= 0) return speak(w, p, FORGE_NOTHING_TO_SPOT);
      const me: Player = {
        ...p,
        items: p.items.filter(i => i.id !== ITEM_COPY_WINK),
        fakeWinke: 0,
        aura: p.guest ? 0 : Math.min(AURA_MAX, p.aura + 1),
      };
      return speak(w, me, FORGE_SPOTTED);
    }
    case "sell": {
      if (!hasItem(p, ITEM_COPY_WINK)) return speak(w, p, FORGE_NOTHING_TO_SELL);
      const listed = applyMarket(w, id, "list", { itemId: ITEM_COPY_WINK, price: COPY_PRICE });
      const me = listed.players.get(id);
      if (!me || listed.market.length === w.market.length) return listed; // could not list; its line already spoke
      return speak(listed, me, FORGE_SOLD); // the listing itself thinned the aura
    }
    default:
      return w;
  }
}
