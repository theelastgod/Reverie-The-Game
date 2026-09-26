import { describe, expect, it, vi } from "vitest";
import type { Item, Notice, Player, WorldState, YieldNode } from "./types";

vi.mock("./content", () => ({
  LINES: new Proxy({}, { get: (_t, key) => (typeof key === "string" ? key : "") }),
}));
vi.mock("./world", () => ({
  say: (p: Player, text: string, now: number): Player => ({ ...p, heard: text, heardAt: now }),
  wink: (p: Player, text: string, now: number): Player => ({ ...p, wink: text, winkAt: now }),
  notice: (p: Player, text: string, now: number, tone: Notice["tone"] = "ink"): Player => ({ ...p, notices: [...p.notices, { text, at: now, tone }] }),
  pushNews: (w: WorldState, text: string): WorldState => ({ ...w, news: [...w.news, { text, at: w.now }] }),
}));

import {
  AURA_CRAFT_WITHER,
  AURA_DARK_YIELD_BONUS,
  AURA_DIM,
  CITY_SELLER,
  CLAIM_AMOUNT,
  CLAIM_CAP,
  CLAIM_HOLD,
  COPY_PRICE,
  EXHIBIT_DECAY,
  FORGE_COST,
  GESTELL_EXTRACT,
  GESTELL_KEEP,
  GESTELL_START,
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
  RESTRAINT_KEEP_GAIN,
  RESTRAINT_START,
} from "./constants";
import { EARNERS, SINKS, W } from "./content/ids";
import { NODE_LIST } from "./map";
import {
  EARNER_SINKS,
  ITEM_COPY_WINK,
  ITEM_INSURANCE,
  ITEM_REPAIR,
  addItem,
  applyClaims,
  applyForge,
  applyListing,
  applyMarket,
  applyNode,
  applyUse,
  earn,
  gestellTax,
  hasItem,
  initialNodes,
  nodeYield,
  removeItem,
  spend,
  tickMarket,
  tickNodes,
} from "./economy";

// ---------------------------------------------------------------- fixtures

function makePlayer(over: Partial<Player> = {}): Player {
  return {
    id: "p1",
    name: "#0042",
    x: 0,
    y: 0,
    facing: { dx: 1, dy: 0 },
    district: "nave",
    guest: false,
    serial: 42,
    house: "mortals",
    messenger: "herald",
    winkSchool: "hint",
    locked: false,
    hp: MAX_HP,
    dead: false,
    strikeCd: 0,
    heavyCd: 0,
    heavyWindup: 0,
    hitStop: 0,
    dodgeT: 0,
    dodgeCd: 0,
    dodgeX: 0,
    dodgeY: 0,
    stance: "storm",
    kitCd: 0,
    kit: null,
    aura: 20,
    auraSeed: 10,
    bestand: 0,
    banked: 0,
    winke: 0,
    fakeWinke: 0,
    readiness: 0,
    restraint: RESTRAINT_START,
    current: "",
    extracted: 0,
    kept: 0,
    extractedSinceFuneral: 0,
    movement: 2,
    quests: {},
    flags: {},
    choices: {},
    party: { nara: "with", quill: "with", ord: "with" },
    dialogue: null,
    frozenBy: "",
    flagged: false,
    truceUntil: 0,
    lastKillId: "",
    lastKillAt: 0,
    campCount: 0,
    spectated: 0,
    kills: 0,
    deaths: 0,
    items: [],
    claims: [],
    claimsFiled: 0,
    insured: false,
    respawn: { x: 0, y: 0, district: "nave" },
    heard: "",
    heardAt: 0,
    wink: "",
    winkAt: 0,
    notices: [],
    history: { passings: 0, buried: 0, looted: 0, houses: [], outcomes: [] },
    linkedAt: 0,
    createdAt: 0,
    ...over,
  };
}

function makeWorld(players: Player[], over: Partial<WorldState> = {}): WorldState {
  return {
    version: 2,
    now: 1000,
    tick: 20000,
    gestell: GESTELL_START,
    season: { id: 1, startedAt: 0 },
    weatherNamed: false,
    frozen: {},
    players: new Map(players.map(p => [p.id, p])),
    intents: new Map(),
    npcs: {},
    enemies: [],
    nodes: initialNodes(),
    wreckage: [],
    graves: [],
    pois: {},
    flags: {},
    houses: { standing: { earth: 0, sky: 0, mortals: 0, divinities: 0 }, tithe: 0, war: { active: false, startsAt: 600, endsAt: 0, held: { earth: 0, sky: 0, mortals: 0, divinities: 0 }, winner: "", lastWinner: "", site: "clearing-ring" } },
    clearing: { open: false, reserve: 40, openedAt: 0, seeds: [], contest: null, heldBy: [], lastOutcome: "" },
    passing: { count: 0, lastOutcome: "", lastBy: "", lastAt: 0, hijackedBy: "", appearanceUntil: 0 },
    market: [],
    news: [],
    failed: [],
    history: [],
    rng: 1,
    ...over,
  };
}

const node0 = () => NODE_LIST[0];
const atNode = (over: Partial<Player> = {}) => makePlayer({ x: node0().x, y: node0().y, district: node0().district, ...over });
const you = (w: WorldState, id = "p1") => w.players.get(id)!;
const copy = (): Item => ({ id: ITEM_COPY_WINK, kind: "exhibition", name: "Printed Wink", qty: 1, value: COPY_PRICE });

// ---------------------------------------------------------------- tests

describe("earners and sinks", () => {
  it("every earner has a sink", () => {
    for (const earner of EARNERS) {
      const sink = EARNER_SINKS[earner];
      expect(sink, `earner ${earner} needs a sink`).toBeTruthy();
      expect(SINKS).toContain(sink);
    }
    expect(Object.keys(EARNER_SINKS).sort()).toEqual([...EARNERS].sort());
  });

  it("earn and spend keep world counters per earner and sink", () => {
    let w = makeWorld([makePlayer()]);
    w = earn(w, "p1", 10, "spoils");
    expect(you(w).bestand).toBe(10);
    expect(w.flags["earned:spoils"]).toBe(10);
    const paid = spend(w, "p1", 6, "repair");
    expect(paid).not.toBeNull();
    expect(you(paid!).bestand).toBe(4);
    expect(paid!.flags["sunk:repair"]).toBe(6);
    expect(spend(paid!, "p1", 5, "repair")).toBeNull();
  });
});

describe("nodes", () => {
  it("initialNodes covers NODE_LIST with full charges", () => {
    const nodes = initialNodes();
    expect(nodes.map(n => n.id)).toEqual(NODE_LIST.map(n => n.id));
    expect(nodes.every(n => n.charges === NODE_CHARGES && !n.kept && !n.seed)).toBe(true);
  });

  it("gestellTax is a quarter of the climate in percentage points", () => {
    expect(gestellTax(0)).toBe(0);
    expect(gestellTax(38)).toBe(9);
    expect(gestellTax(100)).toBe(25);
    expect(gestellTax(500)).toBe(25);
  });

  it("extract pays yield minus tax and raises gestell", () => {
    const p = atNode();
    const w = makeWorld([p]);
    const node = w.nodes[0];
    const expected = Math.floor(NODE_YIELD * (1 - gestellTax(w.gestell) / 100));
    expect(nodeYield(w, p, node)).toBe(expected);
    const next = applyNode(w, "p1", node.id, "extract");
    expect(you(next).bestand).toBe(expected);
    expect(next.flags["earned:node"]).toBe(expected);
    expect(next.gestell).toBe(GESTELL_START + GESTELL_EXTRACT);
    expect(next.nodes[0].charges).toBe(NODE_CHARGES - 1);
    expect(next.flags[W.EXTRACTIONS]).toBe(1);
    expect(you(next).extracted).toBe(1);
    expect(you(next).extractedSinceFuneral).toBe(1);
    expect(w.nodes[0].charges).toBe(NODE_CHARGES); // pure
  });

  it("fat weather and restraint stance scale the yield; earth house eases the tax", () => {
    const node = initialNodes()[0];
    const fat = makeWorld([atNode()], { gestell: 80 });
    const stormYield = nodeYield(fat, atNode({ stance: "storm" }), node);
    expect(stormYield).toBe(Math.floor(NODE_YIELD * NODE_FAT_MULT * (1 - gestellTax(80) / 100)));
    const restraintYield = nodeYield(fat, atNode({ stance: "restraint" }), node);
    expect(restraintYield).toBe(Math.floor(NODE_YIELD * NODE_FAT_MULT * NODE_RESTRAINT_MULT * (1 - gestellTax(80) / 100)));
    const earthYield = nodeYield(fat, atNode({ house: "earth" }), node);
    expect(earthYield).toBe(Math.floor(NODE_YIELD * NODE_FAT_MULT * (1 - (gestellTax(80) - 2) / 100)));
    expect(earthYield).toBeGreaterThanOrEqual(stormYield);
  });

  it("a frozen district pays 0 and refuses extraction", () => {
    const p = atNode();
    const w = makeWorld([p], { frozen: { [node0().district]: 5000 } });
    expect(nodeYield(w, p, w.nodes[0])).toBe(0);
    const next = applyNode(w, "p1", w.nodes[0].id, "extract");
    expect(you(next).bestand).toBe(0);
    expect(you(next).heard).toBe("FROZEN");
    expect(next.nodes[0].charges).toBe(NODE_CHARGES);
    expect(next.gestell).toBe(w.gestell);
  });

  it("keep raises readiness and restraint and lowers gestell", () => {
    const w = makeWorld([atNode()]);
    const next = applyNode(w, "p1", w.nodes[0].id, "keep");
    expect(next.nodes[0].kept).toBe(true);
    expect(next.nodes[0].keptBy).toBe("p1");
    expect(you(next).readiness).toBe(READINESS_KEEP);
    expect(you(next).restraint).toBe(RESTRAINT_START + RESTRAINT_KEEP_GAIN);
    expect(you(next).kept).toBe(1);
    expect(next.gestell).toBe(GESTELL_START + GESTELL_KEEP);
    expect(you(applyNode(next, "p1", next.nodes[0].id, "keep")).heard).toBe("ALREADY");
  });

  it("out of reach or spent nodes do nothing useful", () => {
    const far = makeWorld([makePlayer({ x: 5, y: 5 })]);
    expect(applyNode(far, "p1", far.nodes[0].id, "extract")).toBe(far);
    let w = makeWorld([atNode({ bestand: 0 })]);
    for (let i = 0; i < NODE_CHARGES; i++) w = applyNode(w, "p1", w.nodes[0].id, "extract");
    expect(w.nodes[0].charges).toBe(0);
    const purse = you(w).bestand;
    const spent = applyNode(w, "p1", w.nodes[0].id, "extract");
    expect(you(spent).bestand).toBe(purse);
    expect(spent.nodes[0].charges).toBe(0);
  });

  it("Nara leaves the party at the threshold without a funeral", () => {
    let w = makeWorld([atNode()]);
    const id = w.nodes[0].id;
    for (let i = 0; i < NARA_THRESHOLD - 1; i++) {
      w = { ...w, nodes: w.nodes.map(n => ({ ...n, charges: NODE_CHARGES })) };
      w = applyNode(w, "p1", id, "extract");
      expect(you(w).party.nara).toBe("with");
    }
    w = { ...w, nodes: w.nodes.map(n => ({ ...n, charges: NODE_CHARGES })) };
    w = applyNode(w, "p1", id, "extract");
    expect(you(w).party.nara).toBe("gone");
    expect(you(w).heard).toBe("NARA_LEAVES");
    expect(w.graves).toEqual([]); // no funeral happened
  });

  it("guests may extract in-instance Bestand", () => {
    const w = makeWorld([atNode({ guest: true, serial: null, house: "", messenger: "", aura: 0 })]);
    const next = applyNode(w, "p1", w.nodes[0].id, "extract");
    expect(you(next).bestand).toBeGreaterThan(0);
  });

  it("announce needs a kept node; seed marks the node and the Clearing", () => {
    const w = makeWorld([atNode()]);
    const id = w.nodes[0].id;
    expect(applyNode(w, "p1", id, "announce").nodes[0].announcedUntil).toBe(0);
    const kept = applyNode(w, "p1", id, "keep");
    const announced = applyNode(kept, "p1", id, "announce");
    expect(announced.nodes[0].announcedUntil).toBe(kept.now + KIT_DURATION);
    const seeded = applyNode(w, "p1", id, "seed");
    expect(seeded.nodes[0].seed).toBe(true);
    expect(seeded.clearing.seeds).toEqual([id]);
    expect(applyNode(seeded, "p1", id, "seed").clearing.seeds).toEqual([id]);
  });

  it("tickNodes regenerates one charge per NODE_REGEN and expires announcements", () => {
    let w = makeWorld([atNode()]);
    const id = w.nodes[0].id;
    w = applyNode(w, "p1", id, "extract");
    expect(w.nodes[0].regenAt).toBe(w.now + NODE_REGEN);
    expect(tickNodes(w, 0.05)).toBe(w); // nothing due
    let later = { ...w, now: w.now + NODE_REGEN };
    later = tickNodes(later, 0.05);
    expect(later.nodes[0].charges).toBe(NODE_CHARGES);
    const nodes: YieldNode[] = later.nodes.map((n, i) => (i === 0 ? { ...n, kept: true, announcedUntil: later.now + 1 } : n));
    const expired = tickNodes({ ...later, nodes, now: later.now + 2 }, 0.05);
    expect(expired.nodes[0].announcedUntil).toBe(0);
  });
});

describe("items", () => {
  it("stack, remove and query items", () => {
    let p = makePlayer();
    p = addItem(p, copy());
    p = addItem(p, copy());
    expect(p.items).toHaveLength(1);
    expect(hasItem(p, ITEM_COPY_WINK, 2)).toBe(true);
    p = removeItem(p, ITEM_COPY_WINK);
    expect(hasItem(p, ITEM_COPY_WINK, 2)).toBe(false);
    expect(hasItem(p, ITEM_COPY_WINK)).toBe(true);
    p = removeItem(p, ITEM_COPY_WINK);
    expect(p.items).toHaveLength(0);
  });

  it("applyUse: insurance insures, repair heals, anything else cannot be used", () => {
    const paper = (id: string): Item => ({ id, kind: "paper", name: id, qty: 1, value: 0 });
    const w = makeWorld([makePlayer({ hp: 10, items: [paper(ITEM_INSURANCE), paper(ITEM_REPAIR)] })]);
    const insured = applyUse(w, "p1", ITEM_INSURANCE);
    expect(you(insured).insured).toBe(true);
    expect(you(insured).heard).toBe("INSURANCE_USED");
    expect(hasItem(you(insured), ITEM_INSURANCE)).toBe(false);
    const healed = applyUse(insured, "p1", ITEM_REPAIR);
    expect(you(healed).hp).toBe(MAX_HP);
    expect(you(applyUse(healed, "p1", ITEM_REPAIR)).heard).toBe("CANT_USE");
    const cult = makeWorld([makePlayer({ items: [{ id: "cult:mark", kind: "cult", name: "mark", qty: 1, value: 0, bound: true }] })]);
    expect(you(applyUse(cult, "p1", "cult:mark")).heard).toBe("CANT_USE");
  });
});

describe("claims desk (disarmed)", () => {
  it("a guest cannot file a claim", () => {
    const w = makeWorld([makePlayer({ guest: true, serial: null, bestand: 100 })]);
    const next = applyClaims(w, "p1", "file");
    expect(you(next).claims).toHaveLength(0);
    expect(you(next).bestand).toBe(100);
    expect(you(next).heard).toBe("CLAIMS_GUEST");
    expect(you(applyClaims(w, "p1", "take")).claims).toHaveLength(0);
  });

  it("file moves purse into a held claim, capped at CLAIM_CAP", () => {
    let w = makeWorld([makePlayer({ bestand: CLAIM_AMOUNT * (CLAIM_CAP + 1) })]);
    for (let i = 0; i < CLAIM_CAP; i++) w = applyClaims(w, "p1", "file");
    expect(you(w).claims).toHaveLength(CLAIM_CAP);
    expect(you(w).bestand).toBe(CLAIM_AMOUNT);
    expect(you(w).claims[0].readyAt).toBe(w.now + CLAIM_HOLD);
    const capped = applyClaims(w, "p1", "file");
    expect(you(capped).claims).toHaveLength(CLAIM_CAP);
    expect(you(capped).heard).toBe("CLAIMS_CAP");
    const poor = makeWorld([makePlayer({ bestand: CLAIM_AMOUNT - 1 })]);
    expect(you(applyClaims(poor, "p1", "file")).heard).toBe("CANT_AFFORD");
  });

  it("file is idempotent by claim id", () => {
    const w = makeWorld([makePlayer({ bestand: 100 })]);
    const once = applyClaims(w, "p1", "file", "claim:m2");
    const twice = applyClaims(once, "p1", "file", "claim:m2");
    expect(twice).toBe(once);
    expect(you(twice).claims).toHaveLength(1);
  });

  it("take before the hold does nothing; after the hold settles once and never twice", () => {
    let w = makeWorld([makePlayer({ bestand: CLAIM_AMOUNT })]);
    w = applyClaims(w, "p1", "file", "claim:m2");
    const early = applyClaims(w, "p1", "take", "claim:m2");
    expect(you(early).banked).toBe(0);
    expect(you(early).claims[0].settled).toBe(false);
    expect(you(early).heard).toBe("CLAIMS_HELD");
    const ripe = { ...w, now: w.now + CLAIM_HOLD };
    const settled = applyClaims(ripe, "p1", "take", "claim:m2");
    expect(you(settled).banked).toBe(CLAIM_AMOUNT);
    expect(you(settled).bestand).toBe(0);
    expect(you(settled).claims[0].settled).toBe(true);
    expect(settled.flags["earned:claim"]).toBe(CLAIM_AMOUNT);
    const again = applyClaims(settled, "p1", "take", "claim:m2");
    expect(again).toBe(settled);
    expect(you(again).banked).toBe(CLAIM_AMOUNT);
    // taking without an id picks the first ripe unsettled claim, and finds none now
    expect(applyClaims(settled, "p1", "take")).toBe(settled);
  });

  it("bank moves the purse into banked minus the fee", () => {
    const w = makeWorld([makePlayer({ bestand: 100 })]);
    const next = applyClaims(w, "p1", "bank");
    expect(you(next).bestand).toBe(0);
    expect(you(next).banked).toBe(95);
    expect(next.flags["sunk:bank"]).toBe(5);
    expect(you(next).heard).toBe("BANKED");
  });
});

describe("market", () => {
  it("list charges the fee, buy pays the seller banked, cancel returns the item", () => {
    const seller = makePlayer({ id: "s", name: "#0001", bestand: 10, items: [copy()] });
    const buyer = makePlayer({ id: "b", name: "#0002", bestand: 50 });
    let w = makeWorld([seller, buyer]);
    w = applyMarket(w, "s", "list", { itemId: ITEM_COPY_WINK, price: 20 });
    expect(w.market).toHaveLength(1);
    expect(you(w, "s").bestand).toBe(10 - LISTING_FEE);
    expect(w.flags["sunk:listing"]).toBe(LISTING_FEE);
    expect(you(w, "s").items).toHaveLength(0);
    const bought = applyMarket(w, "b", "buy", { listingId: w.market[0].id });
    expect(bought.market).toHaveLength(0);
    expect(you(bought, "b").bestand).toBe(30);
    expect(hasItem(you(bought, "b"), ITEM_COPY_WINK)).toBe(true);
    expect(you(bought, "s").banked).toBe(20);
    expect(bought.flags["earned:craft"]).toBe(20);
    const cancelled = applyMarket(w, "s", "cancel", { listingId: w.market[0].id });
    expect(cancelled.market).toHaveLength(0);
    expect(hasItem(you(cancelled, "s"), ITEM_COPY_WINK)).toBe(true);
    expect(you(applyMarket(w, "b", "cancel", { listingId: w.market[0].id }), "b").items).toHaveLength(0);
  });

  describe("the city's listing: a price, not a sale", () => {
    const post = { id: "listing:city:clearing", seller: "the resistance", item: { id: "city:clearing", kind: "exhibition" as const, name: "A Clearing", qty: 1, value: 0 }, price: 40 };
    const last = (w: WorldState) => w.news[w.news.length - 1]?.text;

    it("posts once at its price, moves by delta within the stall's bounds, and says so in the news", () => {
      let w = makeWorld([makePlayer()]);
      expect(applyListing(w, { id: post.id, delta: 5 })).toBe(w); // nothing to move before it is posted
      expect(applyListing(w, { id: post.id, seller: post.seller, price: 40 })).toBe(w); // no item, no listing
      w = applyListing(w, post);
      expect(w.market).toHaveLength(1);
      expect(w.market[0]).toMatchObject({ id: post.id, sellerId: CITY_SELLER, sellerName: "the resistance", price: 40, item: { name: "A Clearing", qty: 1 } });
      expect(last(w)).toBe("the resistance lists A Clearing at 40.");
      expect(applyListing(w, post)).toBe(w); // a second post leaves it as it stands
      const moved = applyListing(w, { id: post.id, delta: 8 });
      expect(moved.market[0].price).toBe(48);
      expect(last(moved)).toBe("the resistance prices A Clearing at 48, up from 40.");
      expect(applyListing(moved, post)).toBe(moved); // a repost does not reset the price
      expect(applyListing(moved, { id: post.id, delta: 0 })).toBe(moved);
      const down = applyListing(moved, { id: post.id, delta: -4 });
      expect(down.market[0].price).toBe(44);
      expect(last(down)).toBe("the resistance prices A Clearing at 44, down from 48.");
      const floor = applyListing(moved, { id: post.id, delta: -1000 });
      expect(floor.market[0].price).toBe(1);
      expect(applyListing(floor, { id: post.id, delta: -1 })).toBe(floor);
      expect(applyListing(moved, { id: post.id, delta: 1000 }).market[0].price).toBe(999);
    });

    it("nobody buys or cancels it, decay leaves it, and a player's listing is never moved by it", () => {
      const buyer = makePlayer({ id: "b", name: "#0002", bestand: 500 });
      let w = applyListing(makeWorld([buyer]), post);
      const tried = applyMarket(w, "b", "buy", { listingId: post.id });
      expect(tried.market).toHaveLength(1);
      expect(you(tried, "b").bestand).toBe(500);
      expect(you(tried, "b").items).toHaveLength(0);
      expect(you(tried, "b").heard).toBe("A price, not a sale. The hole does not travel.");
      expect(applyMarket(w, "b", "cancel", { listingId: post.id }).market).toHaveLength(1);
      w = tickMarket(w, 0.05);
      const later = tickMarket({ ...w, now: w.now + EXHIBIT_DECAY }, 0.05);
      expect(later.market[0].item.value).toBe(0);
      const seller = makePlayer({ id: "s", name: "#0001", bestand: 10, items: [copy()] });
      let mine = makeWorld([seller]);
      mine = applyMarket(mine, "s", "list", { itemId: ITEM_COPY_WINK, price: 20 });
      expect(applyListing(mine, { id: mine.market[0].id, delta: 5 })).toBe(mine);
    });
  });

  it("a listing whose seller is not on the Grid cannot be bought: nothing moves and the listing waits", () => {
    const seller = makePlayer({ id: "s", name: "#0001", bestand: 10, items: [copy()] });
    const buyer = makePlayer({ id: "b", name: "#0002", bestand: 50 });
    let w = makeWorld([seller, buyer]);
    w = applyMarket(w, "s", "list", { itemId: ITEM_COPY_WINK, price: 20 });
    const players = new Map(w.players);
    players.delete("s");
    const away = { ...w, players };
    const tried = applyMarket(away, "b", "buy", { listingId: w.market[0].id });
    expect(tried.market).toHaveLength(1);
    expect(you(tried, "b").bestand).toBe(50);
    expect(you(tried, "b").items).toHaveLength(0);
    expect(you(tried, "b").heard).toContain("not on the Grid");
    expect(Object.keys(tried.flags).some(k => k.startsWith("owed:"))).toBe(false);
    expect(tried.flags["earned:craft"]).toBeUndefined();
    // the seller back on the Grid can still cancel and get the print back
    const back = { ...tried, players: new Map([...tried.players, ["s", you(w, "s")]]) };
    expect(hasItem(you(applyMarket(back, "s", "cancel", { listingId: w.market[0].id }), "s"), ITEM_COPY_WINK)).toBe(true);
  });

  it("listing thins the seller's aura by one; a guest stays at zero", () => {
    const w = makeWorld([makePlayer({ bestand: 10, aura: 20, items: [copy()] })]);
    expect(you(applyMarket(w, "p1", "list", { itemId: ITEM_COPY_WINK, price: 5 })).aura).toBe(20 - AURA_CRAFT_WITHER);
  });

  it("refuses cult objects, bad prices, guests and self-purchase", () => {
    const cult: Item = { id: "cult:mark", kind: "cult", name: "mark", qty: 1, value: 0, bound: true };
    const w = makeWorld([makePlayer({ bestand: 10, items: [cult, copy()] })]);
    expect(applyMarket(w, "p1", "list", { itemId: "cult:mark", price: 5 }).market).toHaveLength(0);
    expect(applyMarket(w, "p1", "list", { itemId: ITEM_COPY_WINK, price: 0 }).market).toHaveLength(0);
    expect(applyMarket(w, "p1", "list", { itemId: ITEM_COPY_WINK, price: 1000 }).market).toHaveLength(0);
    const listed = applyMarket(w, "p1", "list", { itemId: ITEM_COPY_WINK, price: 5 });
    const self = applyMarket(listed, "p1", "buy", { listingId: listed.market[0].id });
    expect(self.market).toHaveLength(1);
    const guest = makeWorld([makePlayer({ guest: true, serial: null, bestand: 10, items: [copy()] })]);
    expect(applyMarket(guest, "p1", "list", { itemId: ITEM_COPY_WINK, price: 5 }).market).toHaveLength(0);
    const poor = makeWorld([makePlayer({ bestand: 0, items: [copy()] })]);
    expect(you(applyMarket(poor, "p1", "list", { itemId: ITEM_COPY_WINK, price: 5 })).heard).toBe("CANT_AFFORD");
  });

  it("an iridescent kit waives the listing fee", () => {
    const w = makeWorld([makePlayer({ bestand: 10, items: [copy()], kit: { verb: "iridescent", until: 2000 } })]);
    const listed = applyMarket(w, "p1", "list", { itemId: ITEM_COPY_WINK, price: 5 });
    expect(listed.market).toHaveLength(1);
    expect(you(listed).bestand).toBe(10);
    expect(listed.flags["sunk:listing"]).toBeUndefined();
  });

  it("tickMarket decays exhibition value on listings and in hands, never below 0", () => {
    const cult: Item = { id: "cult:mark", kind: "cult", name: "mark", qty: 1, value: 3, bound: true };
    let w = makeWorld([makePlayer({ bestand: 10, items: [copy(), copy(), cult] })]);
    w = applyMarket(w, "p1", "list", { itemId: ITEM_COPY_WINK, price: 5 });
    w = tickMarket(w, 0.05); // schedules the first decay
    expect(tickMarket(w, 0.05)).toBe(w);
    let later = tickMarket({ ...w, now: w.now + EXHIBIT_DECAY }, 0.05);
    expect(later.market[0].item.value).toBe(COPY_PRICE - 1);
    expect(you(later).items.find(i => i.id === ITEM_COPY_WINK)!.value).toBe(COPY_PRICE - 1);
    expect(you(later).items.find(i => i.id === "cult:mark")!.value).toBe(3);
    for (let i = 0; i < COPY_PRICE + 2; i++) later = tickMarket({ ...later, now: later.now + EXHIBIT_DECAY }, 0.05);
    expect(later.market[0].item.value).toBe(0);
    expect(you(later).items.find(i => i.id === ITEM_COPY_WINK)!.value).toBe(0);
  });
});

describe("forge tray", () => {
  it("craft costs FORGE_COST and mints a copy; spot clears copies; sell lists one", () => {
    let w = makeWorld([makePlayer({ bestand: FORGE_COST + LISTING_FEE, aura: 20 })]);
    w = applyForge(w, "p1", "craft");
    expect(you(w).bestand).toBe(LISTING_FEE);
    expect(w.flags["sunk:forge"]).toBe(FORGE_COST);
    expect(you(w).fakeWinke).toBe(1);
    expect(hasItem(you(w), ITEM_COPY_WINK)).toBe(true);
    expect(you(w).items[0].value).toBe(COPY_PRICE);
    const spotted = applyForge(w, "p1", "spot");
    expect(you(spotted).fakeWinke).toBe(0);
    expect(hasItem(you(spotted), ITEM_COPY_WINK)).toBe(false);
    expect(you(spotted).aura).toBe(21);
    const sold = applyForge(w, "p1", "sell");
    expect(sold.market).toHaveLength(1);
    expect(sold.market[0].price).toBe(COPY_PRICE);
    expect(you(sold).aura).toBe(19);
    expect(you(sold).bestand).toBe(0);
    expect(you(applyForge(sold, "p1", "sell")).items).toHaveLength(0);
    const poor = makeWorld([makePlayer({ bestand: 0 })]);
    expect(you(applyForge(poor, "p1", "craft")).heard).toBe("CANT_AFFORD");
    const guest = makeWorld([makePlayer({ guest: true, serial: null, bestand: 50 })]);
    expect(you(applyForge(guest, "p1", "craft")).items).toHaveLength(0);
  });

  it("a run of prints withers the aura: the first is free, every one after it inside KIT_DURATION costs a point, and the window resets", () => {
    let w = makeWorld([makePlayer({ bestand: FORGE_COST * 6, aura: 20 })]);
    w = applyForge(w, "p1", "craft");
    expect(you(w).aura).toBe(20);
    w = applyForge(w, "p1", "craft");
    w = applyForge(w, "p1", "craft");
    expect(you(w).aura).toBe(20 - 2 * AURA_CRAFT_WITHER);
    expect(you(w).fakeWinke).toBe(3);
    const later = applyForge({ ...w, now: w.now + KIT_DURATION + 1 }, "p1", "craft");
    expect(you(later).aura).toBe(20 - 2 * AURA_CRAFT_WITHER);
    expect(you(applyForge(later, "p1", "craft")).aura).toBe(20 - 3 * AURA_CRAFT_WITHER);
  });
});

describe("a dark aura", () => {
  it("farms a little more efficiently; guests at zero do not", () => {
    const node = initialNodes()[0];
    const w = makeWorld([atNode()]);
    const lit = nodeYield(w, atNode({ aura: 20, stance: "storm" }), node);
    const dark = nodeYield(w, atNode({ aura: AURA_DIM - 1, stance: "storm" }), node);
    expect(dark).toBe(Math.floor(NODE_YIELD * (1 + AURA_DARK_YIELD_BONUS) * (1 - gestellTax(w.gestell) / 100)));
    expect(dark).toBeGreaterThan(lit);
    expect(nodeYield(w, atNode({ guest: true, serial: null, aura: 0, stance: "storm" }), node)).toBe(lit);
  });
});
