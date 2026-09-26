import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker, { ReverieWorld, restoreWorld, sameOrigin, serializeWorld, sessionToken } from "./index";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { addressOfPublicKey, personalMessageHash, recoverAddress } from "./wallet";
import { LINES } from "../../src/sim/content";

const WORLD_KEY = "world:v2";
const PLAYER_PREFIX = "player:v2:";
import { emptyWorld, spawnGuest } from "../../src/sim/world";
import { DODGE_COOLDOWN, DODGE_DURATION, RESTRAINT_DODGE_BONUS, TEST_SERIAL } from "../../src/sim/constants";
import { PROTOCOL_VERSION, type FastFrame } from "../../src/sim/protocol";
import { applySlow, mergeFrames, type SlowState } from "../../src/sim/frames";
import type { Player, WorldState } from "../../src/sim/types";

beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(0); });
afterEach(() => { vi.useRealTimers(); });

const token = "12345678-1234-4123-8123-123456789abc";
const otherToken = "22345678-1234-4123-8123-123456789abc";
const playerKey = (t: string) => `${PLAYER_PREFIX}${t}`;

function socket(id = "a", t = token) {
  return { deserializeAttachment: () => ({ id, token: t }), serializeAttachment: vi.fn(), send: vi.fn(), close: vi.fn() };
}
type Sock = ReturnType<typeof socket>;

/** A world with the given players already in it, checkpointed the way the object saves it. */
function saved(...players: Player[]): WorldState {
  const w = emptyWorld();
  for (const p of players) w.players.set(p.id, p);
  return w;
}
function angel(id: string, extra: Partial<Player> = {}): Player {
  return {
    ...spawnGuest(id), guest: false, serial: 42, name: "#0042", house: "sky", messenger: "witness", winkSchool: "wreckage",
    aura: 24, auraSeed: 12, winke: 3, bestand: 17, wink: "The bell knows where you stood.", winkAt: 0, ...extra,
  };
}

/** The object under test runs like `wrangler dev`: the test link on, one known holder. Pass env to change that. */
const DEV_ENV = { MOCK_LINK: "1", ANGEL_HOLDERS: JSON.stringify({ "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf": 42 }) };

async function worldHarness(world: WorldState | null, sockets: Sock[] = [], extra: [string, unknown][] = [], env: Record<string, string> = DEV_ENV) {
  const data = new Map<string, unknown>(extra);
  if (world) data.set(WORLD_KEY, serializeWorld(world));
  let ready: Promise<unknown>;
  const storage = {
    get: vi.fn(async (key: string) => structuredClone(data.get(key))),
    put: vi.fn(async (values: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(values)) data.set(key, structuredClone(value));
    }),
    setAlarm: vi.fn(async () => {}),
    getAlarm: vi.fn(async () => data.get("scheduled") ?? null),
    delete: vi.fn(async (key: string) => data.delete(key)),
  };
  const ctx = {
    storage, getWebSockets: () => sockets, waitUntil: vi.fn(), acceptWebSocket: vi.fn(),
    blockConcurrencyWhile: (fn: () => Promise<unknown>) => (ready = fn()),
  };
  const dobj = new ReverieWorld(ctx as never, env as never);
  await ready!;
  return { world: dobj, storage, data, ctx };
}
/**
 * The viewer's current view: every frame the socket was sent, folded the way
 * the client folds them (v3 fast frames over slow sections; a full snap
 * stands alone). Reads as one `snap`.
 */
function last(ws: Sock): Record<string, any> {
  let slow: SlowState = {};
  let fast: FastFrame | null = null;
  for (const call of ws.send.mock.calls) {
    const data = JSON.parse(call[0]);
    if (data.t === "slow") slow = applySlow(slow, data);
    else if (data.t === "fast") fast = data;
  }
  if (!fast) throw new Error("no fast frame was sent");
  return mergeFrames(slow, fast);
}
/** Every frame sent on the socket, parsed, in order. */
const frames = (ws: Sock): Record<string, any>[] => ws.send.mock.calls.map(c => JSON.parse(c[0]));
const savedWorld = (data: Map<string, unknown>) => data.get(WORLD_KEY) as ReturnType<typeof serializeWorld>;

describe("durable world sessions", () => {
  it("restores the world and live bodies after hibernation, with idle movement", async () => {
    const player = { ...spawnGuest("a"), bestand: 91, banked: 33 };
    const w = saved(player, spawnGuest("orphan"));
    w.intents.set("a", { up: false, down: false, left: false, right: true });
    w.gestell = 74;
    w.weatherNamed = true;
    const ws = socket();
    const { world, storage, data } = await worldHarness(w, [ws]);
    vi.setSystemTime(200);
    await world.alarm();
    const snap = last(ws);
    expect(snap.t).toBe("snap");
    expect(snap.v).toBe(PROTOCOL_VERSION);
    expect(snap.you).toMatchObject({ id: "a", x: player.x, y: player.y, bestand: 91, banked: 33 });
    expect(snap.players.map((p: { id: string }) => p.id)).not.toContain("orphan");
    expect(snap.gestell).toBeCloseTo(74, 2);
    expect(snap.weatherNamed).toBe(true);
    expect(storage.setAlarm).toHaveBeenCalled();
    await world.webSocketClose(ws as never);
    expect(data.get(playerKey(token))).toMatchObject({ id: "a", bestand: 91, banked: 33 });
    expect(savedWorld(data).players).toHaveLength(0);
  });

  it("round-trips the checkpoint shape (Maps as arrays, intents dropped)", () => {
    const w = saved(spawnGuest("a"));
    w.intents.set("a", { up: true, down: false, left: false, right: false });
    const s = serializeWorld(w);
    expect(Array.isArray(s.players)).toBe(true);
    expect("intents" in s).toBe(false);
    const back = restoreWorld(JSON.parse(JSON.stringify(s)));
    expect(back.players.get("a")?.id).toBe("a");
    expect(back.intents.size).toBe(0);
    expect(restoreWorld(undefined).players.size).toBe(0);
  });

  it("ignores prototype saves under the old key", async () => {
    const ws = socket();
    const { world } = await worldHarness(null, [], [["world:v1", { players: [["a", spawnGuest("a")]], gestell: 99 }]]);
    await world.join(token, ws as never);
    expect(JSON.parse(ws.send.mock.calls[0][0]).you.guest).toBe(true);
    expect(last(ws).gestell).not.toBe(99);
  });

  it("restores a checkpoint from an older build through the shape migration", async () => {
    // An old checkpoint: a retired node and POI, a stale enemy, a moved NPC, a player missing newer fields.
    const oldPlayer = { ...spawnGuest("a"), bestand: 77, flags: { under: 1 }, party: { nara: "with" }, hp: 40 } as Record<string, unknown>;
    delete oldPlayer.history;
    delete oldPlayer.respawn;
    const old = {
      gestell: 58,
      now: 900,
      nodes: [{ id: "nave-node-1", x: 0, y: 0, charges: 0, kept: true }, { id: "retired", x: 1, y: 1, charges: 3 }],
      enemies: [{ id: "stale", kind: "clerk", hp: 1 }],
      pois: { "safety-plaque": { state: "named", by: "a", at: 1, count: 1 }, retired: { state: "x" } },
      npcs: { nara: { x: 999, y: 999, district: "care", present: true, state: "garden" } },
      players: [["a", oldPlayer]],
    };
    const ws = socket();
    const { world, data } = await worldHarness(old as never, [ws]);
    await world.alarm();
    const snap = last(ws);
    expect(snap.gestell).toBe(58);
    expect(snap.you.bestand).toBe(77);
    expect(snap.you.hp).toBe(40);
    expect(snap.you.flags.under).toBe(1);
    expect(snap.you.party).toEqual({ nara: "with", quill: "none", ord: "none" });
    expect(snap.you.history).toEqual({ passings: 0, buried: 0, looted: 0, houses: [], outcomes: [] });
    const node = snap.nodes.find((n: { id: string }) => n.id === "nave-node-1");
    expect(node?.kept).toBe(true);
    expect(snap.nodes.some((n: { id: string }) => n.id === "retired")).toBe(false);
    expect(snap.enemies.some((e: { id: string }) => e.id === "stale")).toBe(false);
    expect(snap.enemies.length).toBeGreaterThan(0);
    // The next checkpoint is stamped with the current shape.
    const stored = data.get("world:v2") as { shape?: number } | undefined;
    expect(stored?.shape).toBe(2);
  });

  it("persists an action before broadcasting it and rejects malformed packets", async () => {
    const ws = socket();
    const { world, data, storage } = await worldHarness(saved(spawnGuest("a")), [ws]);
    for (const packet of ["null", "[]", "{", "0", '{"t":"nope"}', '{"t":1}', "x".repeat(5000)]) await world.webSocketMessage(ws as never, packet);
    expect(storage.put).not.toHaveBeenCalled();
    expect(ws.send).not.toHaveBeenCalled();
    await world.webSocketMessage(ws as never, JSON.stringify({ t: "link", serial: TEST_SERIAL, sig: "mock" }));
    expect(data.get(playerKey(token))).toMatchObject({ serial: TEST_SERIAL, guest: false });
    expect(storage.put.mock.invocationCallOrder[0]).toBeLessThan(ws.send.mock.invocationCallOrder[0]);
    expect(last(ws).you.serial).toBe(TEST_SERIAL);
  });

  it("an unknown or replaced socket cannot mutate or remove a live body", async () => {
    const ws = socket();
    const { world, storage } = await worldHarness(saved(spawnGuest("a")), [ws]);
    await world.webSocketMessage(socket() as never, JSON.stringify({ t: "link", serial: TEST_SERIAL, sig: "mock" }));
    await world.webSocketClose(socket() as never);
    expect(storage.put).not.toHaveBeenCalled();
    await world.alarm();
    expect(last(ws).you.guest).toBe(true);
  });

  it("expires held movement if the client stops sending heartbeats", async () => {
    const ws = socket();
    const { world, storage } = await worldHarness(saved(spawnGuest("a")), [ws]);
    vi.setSystemTime(50);
    await world.webSocketMessage(ws as never, '{"t":"intent","intent":{"right":true}}');
    expect(storage.put).not.toHaveBeenCalled(); // intents never checkpoint
    vi.setSystemTime(100);
    await world.alarm();
    const moved = last(ws).you.x;
    expect(moved).toBeGreaterThan(spawnGuest("a").x);
    vi.setSystemTime(1151);
    await world.alarm();
    expect(last(ws).you.x).toBe(moved);
  });

  it("gives a second tab the same body and closes the first with 4001", async () => {
    const { world, ctx, data } = await worldHarness(null);
    const first = socket();
    const hello = await world.join(token, first as never);
    expect(hello).toMatchObject({ t: "hello", v: PROTOCOL_VERSION, guest: true });
    expect(hello.you.id).toBe(hello.id);
    expect(ctx.acceptWebSocket).toHaveBeenCalledWith(first);
    expect(first.serializeAttachment).toHaveBeenCalledWith({ id: hello.id, token });
    const sendsBeforeTakeover = first.send.mock.calls.length;
    const second = socket();
    const again = await world.join(token, second as never);
    expect(again.id).toBe(hello.id);
    expect(first.close).toHaveBeenCalledWith(4001, expect.any(String));
    await world.alarm();
    const snap = last(second);
    expect(snap.you.id).toBe(hello.id);
    expect(snap.players.filter((p: { id: string }) => p.id === hello.id)).toHaveLength(0);
    expect(first.send.mock.calls.length).toBe(sendsBeforeTakeover);
    expect(savedWorld(data).players).toHaveLength(1);
  });

  it("a body that joins between two frames is in the other viewer's next frame, and gone from it when it leaves", async () => {
    const { world } = await worldHarness(null);
    const first = socket("a", token);
    const hello = await world.join(token, first as never);
    vi.setSystemTime(50);
    await world.alarm();
    expect(last(first).players).toEqual([]);
    // the second body arrives on the same world object the first viewer was just snapshotted from
    const second = socket("b", otherToken);
    const other = await world.join(otherToken, second as never);
    expect(last(first).players.map((p: { id: string }) => p.id), "seen on the join's own broadcast").toEqual([other.id]);
    vi.setSystemTime(100);
    await world.alarm();
    expect(last(first).players.map((p: { id: string }) => p.id), "seen on the next step").toEqual([other.id]);
    expect(last(second).players.map((p: { id: string }) => p.id)).toEqual([hello.id]);
    expect(first.close).not.toHaveBeenCalled();
    expect(second.close).not.toHaveBeenCalled();
    for (const frame of [...frames(first), ...frames(second)]) expect(["hello", "fast", "slow"]).toContain(frame.t);
    await world.webSocketClose(second as never);
    expect(last(first).players).toEqual([]);
    vi.setSystemTime(150);
    await world.alarm();
    expect(last(first).players).toEqual([]);
  });

  it("restores a saved body for a returning session and spawns a guest for a new one", async () => {
    const kept = { ...spawnGuest("kept"), bestand: 12 };
    const { world } = await worldHarness(null, [], [[playerKey(token), kept]]);
    const back = await world.join(token, socket("kept") as never);
    expect(back.id).toBe("kept");
    expect(back.you.bestand).toBe(12);
    const fresh = await world.join(otherToken, socket("x", otherToken) as never);
    expect(fresh.id).not.toBe("kept");
    expect(fresh.guest).toBe(true);
    expect(fresh.you.aura).toBe(0);
  });

  it("sends every viewer their own snapshot: Winke never reach the guest", async () => {
    const guest = spawnGuest("g");
    const a = angel("b", { x: guest.x + 40, y: guest.y });
    const gs = socket("g", token);
    const as = socket("b", otherToken);
    const { world } = await worldHarness(saved(guest, a), [gs, as]);
    await world.alarm();
    const guestSnap = last(gs);
    const angelSnap = last(as);
    expect(guestSnap.you.id).toBe("g");
    expect(angelSnap.you.id).toBe("b");
    expect(guestSnap.you.wink).toBe("");
    expect(guestSnap.you.winke).toBe(0);
    expect(angelSnap.you.wink).toBe(a.wink);
    expect(angelSnap.you.winke).toBe(3);
    const seen = guestSnap.players.find((p: { id: string }) => p.id === "b");
    expect(seen).toBeDefined();
    for (const secret of ["wink", "winke", "bestand", "banked", "claims", "items", "flags", "quests"]) expect(seen).not.toHaveProperty(secret);
    expect(seen.guest).toBe(false);
    expect(JSON.stringify(guestSnap)).not.toContain(a.wink);
    expect(guestSnap).not.toEqual(angelSnap);
  });

  it("accepts only a direction for dodge and persists the bounded server result", async () => {
    const ws = socket();
    const { world, data } = await worldHarness(saved(spawnGuest("a")), [ws]);
    await world.webSocketMessage(ws as never, JSON.stringify({ t: "dodge", dx: "fast", dy: 0 }));
    expect(data.get(playerKey(token)) ?? spawnGuest("a")).toMatchObject({ dodgeT: 0 });
    await world.webSocketMessage(ws as never, JSON.stringify({ t: "dodge", dx: 90000, dy: 0, dodgeT: 999 }));
    const p = data.get(playerKey(token)) as Player;
    expect(p.dodgeT).toBeCloseTo(DODGE_DURATION + RESTRAINT_DODGE_BONUS);
    expect(p.dodgeX).toBe(1);
    expect(p.dodgeCd).toBeCloseTo(DODGE_COOLDOWN);
    expect(p.guest).toBe(true);
  });

  it("closes legacy sockets that cannot be recovered", async () => {
    const ws = socket();
    await worldHarness(null, [ws]);
    expect(ws.close).toHaveBeenCalledWith(1012, expect.any(String));
  });

  it("owns flag eligibility: a guest cannot flag whatever the packet claims", async () => {
    const ws = socket();
    const { world, data } = await worldHarness(saved(spawnGuest("a")), [ws]);
    await world.webSocketMessage(ws as never, JSON.stringify({ t: "flag", guest: false, flagged: true, x: 9999 }));
    expect(data.get(playerKey(token))).toMatchObject({ guest: true, flagged: false, x: spawnGuest("a").x });
  });

  it("tracks elapsed time through delayed and duplicate alarm callbacks", async () => {
    const ws = socket();
    const { world } = await worldHarness(saved(spawnGuest("a")), [ws]);
    await world.webSocketMessage(ws as never, '{"t":"intent","intent":{"right":true}}');
    for (let i = 1; i <= 10; i++) { vi.setSystemTime(i * 83); await world.alarm(); }
    const snap = last(ws);
    expect(snap.now).toBeCloseTo(0.8);
    expect(snap.you.x).toBeGreaterThan(spawnGuest("a").x);
    await world.alarm();
    expect(last(ws).now).toBeCloseTo(0.8);
    expect(last(ws).you.x).toBe(snap.you.x);
  });

  it("bounds outage catch-up and clears stale movement", async () => {
    const ws = socket();
    const { world } = await worldHarness(saved(spawnGuest("a")), [ws]);
    await world.webSocketMessage(ws as never, '{"t":"intent","intent":{"right":true}}');
    vi.setSystemTime(60000);
    await world.alarm();
    const snap = last(ws);
    expect(snap.now).toBeCloseTo(0.25);
    expect(snap.you.x).toBe(spawnGuest("a").x);
  });

  it("settles old elapsed time before applying a fresh dodge request", async () => {
    const ws = socket();
    const { world, data } = await worldHarness(saved(spawnGuest("a")), [ws]);
    vi.setSystemTime(125);
    await world.webSocketMessage(ws as never, '{"t":"dodge","dx":1,"dy":0,"elapsed":999999}');
    const full = DODGE_DURATION + RESTRAINT_DODGE_BONUS;
    expect((data.get(playerKey(token)) as Player).dodgeT).toBeCloseTo(full);
    vi.setSystemTime(150);
    await world.alarm();
    const snap = last(ws);
    expect(snap.now).toBeCloseTo(0.15);
    expect(snap.you.dodgeT).toBeCloseTo(full - 0.05);
  });

  it("preserves an alarm already scheduled before hibernation", async () => {
    const ws = socket();
    const { world, storage } = await worldHarness(saved(spawnGuest("a")), [ws], [["scheduled", 50]]);
    expect(storage.getAlarm).toHaveBeenCalled();
    expect(storage.setAlarm).not.toHaveBeenCalled();
    vi.setSystemTime(50); await world.alarm();
    expect(last(ws).now).toBeCloseTo(0.05);
    await world.webSocketClose(ws as never);
    storage.setAlarm.mockClear();
    vi.setSystemTime(60000); await world.alarm();
    expect(storage.setAlarm).not.toHaveBeenCalled();
  });
});

describe("browser session boundary", () => {
  it("issues a host-only HttpOnly cookie and refuses foreign origins", async () => {
    const req = new Request("https://game.example/session", { method: "POST", headers: { Origin: "https://game.example" } });
    const res = await worker.fetch(req, {} as never);
    expect(res.status).toBe(204);
    expect(res.headers.get("Set-Cookie")).toContain("HttpOnly; SameSite=Strict; Path=/");
    expect(res.headers.get("Set-Cookie")).toContain("Secure");
    const bad = new Request(req, { headers: { Origin: "https://elsewhere.example" } });
    expect((await worker.fetch(bad, {} as never)).status).toBe(403);
    expect((await worker.fetch(new Request("https://game.example/session"), {} as never)).status).toBe(405);
  });
  it("only accepts opaque session tokens, never public player ids", () => {
    expect(sessionToken(new Request("https://game.example", { headers: { Cookie: `other=x; reverie_session=${token}` } }))).toBe(token);
    expect(sessionToken(new Request("https://game.example", { headers: { Cookie: "reverie_session=player-a" } }))).toBeNull();
    expect(sameOrigin(new Request("https://game.example"))).toBe(false);
  });
  it("reports health with the protocol version and routes sockets to the v2 city", async () => {
    const res = await worker.fetch(new Request("https://game.example/health"), {} as never);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, v: PROTOCOL_VERSION });
    const names: string[] = [];
    const env = {
      ASSETS: { fetch: async () => new Response("asset") },
      WORLD: { idFromName: (n: string) => { names.push(n); return n; }, get: () => ({ fetch: async () => new Response("world") }) },
    };
    expect(await (await worker.fetch(new Request("https://game.example/ws"), env as never)).text()).toBe("world");
    expect(names).toEqual(["city-v2"]);
    expect(await (await worker.fetch(new Request("https://game.example/play/"), env as never)).text()).toBe("asset");
  });
});

// ---------------------------------------------------------------- wallet login, disarmed

const hexOf = (b: Uint8Array) => [...b].map(x => x.toString(16).padStart(2, "0")).join("");
const keyOf = (n: number): Uint8Array => { const k = new Uint8Array(32); k[31] = n; return k; };
const addressOf = (priv: Uint8Array) => addressOfPublicKey(secp256k1.getPublicKey(priv, false));
/** What a wallet returns from personal_sign over the message: r||s||v, v in {27, 28}. */
function ethSign(message: string, priv: Uint8Array): string {
  const compact = secp256k1.sign(personalMessageHash(message), priv, { prehash: false });
  for (const v of [27, 28]) {
    const sig = "0x" + hexOf(compact) + v.toString(16);
    if (recoverAddress(message, sig) === addressOf(priv)) return sig;
  }
  throw new Error("no recovery bit matched");
}
const ORIGIN = "https://game.example";
const post = (path: string, t: string, body?: unknown, origin = ORIGIN) =>
  new Request(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { Origin: origin, Cookie: `reverie_session=${t}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });

describe("wallet login", () => {
  const HOLDER = keyOf(1); // 0x7e5f…5bdf, serial 42 in DEV_ENV
  const STRANGER = keyOf(9);

  /** A challenge for one address: the message names this city's host and origin, the address, the chain and the nonce. */
  async function challenge(world: ReverieWorld, priv: Uint8Array = HOLDER, t = token): Promise<string> {
    const res = await world.fetch(post("/wallet/challenge", t, { address: addressOf(priv) }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; message: string };
    expect(body.message.split("\n")[0]).toBe("game.example wants you to sign in with your Ethereum account:");
    expect(body.message.split("\n")[1]).toBe(addressOf(priv));
    expect(body.message).toContain("URI: https://game.example");
    expect(body.message).toContain("Nonce:");
    expect(body.message).toContain("costs nothing");
    return body.message;
  }

  it("issues a challenge only to a live same-origin session, by POST, for an address", async () => {
    const { world } = await worldHarness(null);
    expect((await world.fetch(post("/wallet/challenge", token, { address: addressOf(HOLDER) }))).status).toBe(409);
    await world.join(token, socket() as never);
    expect((await world.fetch(new Request(`${ORIGIN}/wallet/challenge`, { headers: { Cookie: `reverie_session=${token}` } }))).status).toBe(405);
    expect((await world.fetch(post("/wallet/challenge", token, { address: addressOf(HOLDER) }, "https://elsewhere.example"))).status).toBe(403);
    expect((await world.fetch(post("/wallet/challenge", token))).status).toBe(400);
    expect((await world.fetch(post("/wallet/challenge", token, { address: "0x1234" }))).status).toBe(400);
    await challenge(world);
  });

  it("a challenge issued for one address seals no other, and a signature over another site's text seals nothing", async () => {
    const { world } = await worldHarness(null);
    const ws = socket();
    await world.join(token, ws as never);
    // the challenge was for the holder's address: a stranger's own valid signature over it does not link the stranger
    let message = await challenge(world, HOLDER);
    const swapped = await world.fetch(post("/wallet/link", token, { address: addressOf(STRANGER), signature: ethSign(message, STRANGER) }));
    expect(swapped.status).toBe(403);
    expect(await swapped.json()).toEqual({ ok: false, reason: "bad-signature" });
    expect(last(ws).you).toMatchObject({ guest: true, wallet: "" });
    // the same nonce and address, but the text a lookalike site would show: the city rebuilds its own and the signer does not match
    message = await challenge(world, HOLDER);
    const phished = message.replace("game.example wants", "phish.example wants").replace("URI: https://game.example", "URI: https://phish.example");
    const elsewhere = await world.fetch(post("/wallet/link", token, { address: addressOf(HOLDER), signature: ethSign(phished, HOLDER) }));
    expect(elsewhere.status).toBe(403);
    expect(last(ws).you).toMatchObject({ guest: true, wallet: "" });
  });

  it("seals the body with the holder's serial after a valid signature, and spends the nonce", async () => {
    const { world, data } = await worldHarness(null);
    const ws = socket();
    const hello = await world.join(token, ws as never);
    expect(hello.mockLink).toBe(true);
    const message = await challenge(world, HOLDER);
    const res = await world.fetch(post("/wallet/link", token, { address: addressOf(HOLDER).toUpperCase().replace("0X", "0x"), signature: ethSign(message, HOLDER) }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, address: addressOf(HOLDER), serial: 42 });
    const you = last(ws).you;
    expect(you).toMatchObject({ guest: false, serial: 42, name: "#0042", wallet: addressOf(HOLDER) });
    expect(you.flags.angel).toBe(1);
    expect(savedWorld(data).players[0][1]).toMatchObject({ serial: 42, wallet: addressOf(HOLDER) });
    // the nonce was spent
    const again = await world.fetch(post("/wallet/link", token, { address: addressOf(HOLDER), signature: ethSign(message, HOLDER) }));
    expect(again.status).toBe(409);
    expect(await again.json()).toEqual({ ok: false, reason: "no-challenge" });
  });

  it("binds a wallet that holds no Angel without sealing it, and says so", async () => {
    const { world } = await worldHarness(null);
    const ws = socket();
    await world.join(token, ws as never);
    const message = await challenge(world, STRANGER);
    const res = await world.fetch(post("/wallet/link", token, { address: addressOf(STRANGER), signature: ethSign(message, STRANGER) }));
    expect(await res.json()).toEqual({ ok: true, address: addressOf(STRANGER), serial: null });
    const you = last(ws).you;
    expect(you).toMatchObject({ guest: true, serial: null, wallet: addressOf(STRANGER), heard: LINES.LINK_NO_ANGEL });
  });

  it("refuses a signature that does not match the address, an expired nonce and a malformed body", async () => {
    const { world } = await worldHarness(null);
    const ws = socket();
    await world.join(token, ws as never);
    let message = await challenge(world, HOLDER);
    const forged = await world.fetch(post("/wallet/link", token, { address: addressOf(HOLDER), signature: ethSign(message, STRANGER) }));
    expect(forged.status).toBe(403);
    expect(await forged.json()).toEqual({ ok: false, reason: "bad-signature" });
    expect(last(ws).you).toMatchObject({ guest: true, wallet: "" });
    message = await challenge(world, HOLDER);
    expect((await world.fetch(post("/wallet/link", token, { address: "0x1234", signature: ethSign(message, HOLDER) }))).status).toBe(400);
    message = await challenge(world, HOLDER);
    vi.setSystemTime(11 * 60 * 1000);
    const stale = await world.fetch(post("/wallet/link", token, { address: addressOf(HOLDER), signature: ethSign(message, HOLDER) }));
    expect(stale.status).toBe(409);
    const junk = await world.fetch(new Request(`${ORIGIN}/wallet/link`, { method: "POST", headers: { Origin: ORIGIN, Cookie: `reverie_session=${token}` }, body: "{" }));
    expect(junk.status).toBe(400);
  });

  it("reads the serial from the chain when a contract is configured, and refuses the link while the chain is unreadable", async () => {
    const CHAIN_ENV = { MOCK_LINK: "0", ANGEL_HOLDERS: JSON.stringify({ [addressOf(HOLDER)]: 42 }), ANGEL_CONTRACT: "0x00000000000000000000000000000000000000a1", ANGEL_RPC_URL: "https://rpc.example/v1" };
    const word = (n: bigint) => "0x" + n.toString(16).padStart(64, "0");
    let down = false;
    const rpc = vi.fn(async (_url: string, init?: RequestInit) => {
      if (down) return new Response("bad gateway", { status: 502 });
      const data = (JSON.parse(String(init?.body)) as { params: [{ data: string }] }).params[0].data;
      return Response.json({ jsonrpc: "2.0", id: 1, result: data.startsWith("0x70a08231") ? word(1n) : word(7n) });
    });
    vi.stubGlobal("fetch", rpc);
    try {
      const { world, data } = await worldHarness(null, [], [], CHAIN_ENV);
      const ws = socket();
      await world.join(token, ws as never);
      // the chain is down: nothing changes, the nonce is spent, the client is told why
      down = true;
      let message = await challenge(world, STRANGER);
      const refused = await world.fetch(post("/wallet/link", token, { address: addressOf(STRANGER), signature: ethSign(message, STRANGER) }));
      expect(refused.status).toBe(503);
      expect(await refused.json()).toEqual({ ok: false, reason: "chain" });
      expect(last(ws).you).toMatchObject({ guest: true, wallet: "" });
      expect(rpc).toHaveBeenCalledTimes(1);
      // the chain answers: balance 1, first token 7
      down = false;
      message = await challenge(world, STRANGER);
      const res = await world.fetch(post("/wallet/link", token, { address: addressOf(STRANGER), signature: ethSign(message, STRANGER) }));
      expect(await res.json()).toEqual({ ok: true, address: addressOf(STRANGER), serial: 7 });
      expect(last(ws).you).toMatchObject({ guest: false, serial: 7, name: "#0007", wallet: addressOf(STRANGER) });
      expect(savedWorld(data).players[0][1]).toMatchObject({ serial: 7 });
      expect(rpc).toHaveBeenCalledTimes(3);
      expect((rpc.mock.calls[1][1] as RequestInit).method).toBe("POST");
      expect(JSON.parse(String((rpc.mock.calls[1][1] as RequestInit).body))).toMatchObject({ method: "eth_call", params: [{ to: CHAIN_ENV.ANGEL_CONTRACT }, "latest"] });
      // the map still wins, without a chain call
      const ws2 = socket("b", otherToken);
      await world.join(otherToken, ws2 as never);
      message = await challenge(world, HOLDER, otherToken);
      const mapped = await world.fetch(post("/wallet/link", otherToken, { address: addressOf(HOLDER), signature: ethSign(message, HOLDER) }));
      expect(await mapped.json()).toEqual({ ok: true, address: addressOf(HOLDER), serial: 42 });
      expect(rpc).toHaveBeenCalledTimes(3);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("accepts the test link only where the environment turns it on", async () => {
    const off = await worldHarness(null, [], [], { ANGEL_HOLDERS: "{}" });
    const ws = socket();
    const hello = await off.world.join(token, ws as never);
    expect(hello.mockLink).toBe(false);
    await off.world.webSocketMessage(ws as never, JSON.stringify({ t: "link", serial: TEST_SERIAL, sig: "mock" }));
    expect(off.world["w"].players.get(hello.id)?.guest).toBe(true);

    const on = await worldHarness(null);
    const ws2 = socket();
    const hello2 = await on.world.join(token, ws2 as never);
    await on.world.webSocketMessage(ws2 as never, JSON.stringify({ t: "link", serial: TEST_SERIAL, sig: "mock" }));
    expect(on.world["w"].players.get(hello2.id)).toMatchObject({ guest: false, serial: TEST_SERIAL });
  });

  it("reports its load on /world: sessions, bodies, alarm lateness, catch-up, the last broadcast", async () => {
    const { world } = await worldHarness(null);
    const ws = socket();
    await world.join(token, ws as never);
    vi.setSystemTime(120); // the first alarm was due at 50 ms
    await world.alarm();
    const res = await world.fetch(new Request(`${ORIGIN}/world`));
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const body = (await res.json()) as { ok: boolean; players: number; load: Record<string, number> };
    expect(body.ok).toBe(true);
    expect(body.players).toBe(1);
    expect(body.load).toMatchObject({ sessions: 1, bodies: 1, alarms: 1, stalls: 0, catchUp: 2, maxCatchUp: 2 });
    expect(body.load.lateMs).toBe(70);
    expect(body.load.broadcastChars).toBeGreaterThan(100);
    expect(body.load.charsPerViewer).toBe(body.load.broadcastChars);
  });

  it("routes the wallet endpoints to the city", async () => {
    const names: string[] = [];
    const env = {
      ASSETS: { fetch: async () => new Response("asset") },
      WORLD: { idFromName: (n: string) => { names.push(n); return n; }, get: () => ({ fetch: async () => new Response("world") }) },
    };
    expect(await (await worker.fetch(new Request(`${ORIGIN}/wallet/challenge`, { method: "POST" }), env as never)).text()).toBe("world");
    expect(await (await worker.fetch(new Request(`${ORIGIN}/wallet/link`, { method: "POST" }), env as never)).text()).toBe("world");
    expect(names).toEqual(["city-v2", "city-v2"]);
  });
});

// ---------------------------------------------------------------- the writeback log

/** A D1 double that keeps every batch and can answer a read. */
function logDb(rows: unknown[] = []) {
  const batches: { sql: string; values: unknown[] }[][] = [];
  return {
    batches,
    prepare: (sql: string) => ({
      bind: (...values: unknown[]) => ({ sql, values, all: async () => ({ results: rows }) }),
    }),
    batch: vi.fn(async (statements: { sql: string; values: unknown[] }[]) => { batches.push(statements); return []; }),
  };
}

describe("the writeback log", () => {
  it("writes what changed after a checkpoint, in the flush the object hands to waitUntil", async () => {
    const d = logDb();
    const { world, ctx } = await worldHarness(null, [], [], { ...DEV_ENV, LOG: d as never });
    const ws = socket();
    await world.join(token, ws as never);
    await world.webSocketMessage(ws as never, JSON.stringify({ t: "link", serial: TEST_SERIAL, sig: "mock" }));
    for (const call of (ctx.waitUntil as ReturnType<typeof vi.fn>).mock.calls) await call[0];
    const kinds = d.batches.flat().map(s => s.values[2]);
    expect(kinds).toEqual(["link"]);
    expect(d.batches[0][0].values).toEqual([0, expect.any(Number), "link", `#${TEST_SERIAL}`, TEST_SERIAL, JSON.stringify({ serial: TEST_SERIAL })]);
    // movement alone is not an event
    await world.webSocketMessage(ws as never, JSON.stringify({ t: "intent", intent: { up: true, down: false, left: false, right: false } }));
    await world.alarm();
    for (const call of (ctx.waitUntil as ReturnType<typeof vi.fn>).mock.calls) await call[0];
    expect(d.batches.flat().length).toBe(1);
  });

  it("writes nothing and never touches waitUntil without the binding", async () => {
    const { world, ctx } = await worldHarness(null);
    const ws = socket();
    await world.join(token, ws as never);
    await world.webSocketMessage(ws as never, JSON.stringify({ t: "link", serial: TEST_SERIAL, sig: "mock" }));
    expect(ctx.waitUntil).not.toHaveBeenCalled();
  });

  it("serves the public kinds newest first and refuses the rest", async () => {
    const rows = [{ at: 5, world_now: 2, kind: "passing", player: "#0042", serial: 42, detail: JSON.stringify({ outcome: "appearance", hijackedBy: "", count: 1 }) }];
    const env = { LOG: logDb(rows), ASSETS: { fetch: async () => new Response("asset") }, WORLD: { idFromName: () => "x", get: () => ({ fetch: async () => new Response("world") }) } };
    const ok = await worker.fetch(new Request("https://game.example/log/recent?kind=passing&limit=5"), env as never);
    expect(ok.status).toBe(200);
    expect(ok.headers.get("Cache-Control")).toContain("max-age=15");
    expect(await ok.json()).toEqual({ ok: true, events: [{ at: 5, worldNow: 2, kind: "passing", player: "#0042", serial: 42, detail: { outcome: "appearance", hijackedBy: "", count: 1 } }] });
    expect((await worker.fetch(new Request("https://game.example/log/recent?kind=wallet"), env as never)).status).toBe(400);
    expect((await worker.fetch(new Request("https://game.example/log/recent?kind=claim.filed"), env as never)).status).toBe(400);
    expect((await worker.fetch(new Request("https://game.example/log/recent?limit=0"), env as never)).status).toBe(400);
    expect((await worker.fetch(new Request("https://game.example/log/recent?limit=51"), env as never)).status).toBe(400);
    const none = { ...env, LOG: undefined };
    expect((await worker.fetch(new Request("https://game.example/log/recent"), none as never)).status).toBe(404);
  });
});
