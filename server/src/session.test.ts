import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker, { ReverieWorld, restoreWorld, sameOrigin, serializeWorld, sessionToken } from "./index";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { addressOfPublicKey, personalMessageHash, recoverAddress } from "./wallet";
import { LINES } from "../../src/sim/content";

const WORLD_KEY = "world:v2";
const PLAYER_PREFIX = "player:v2:";
import { emptyWorld, spawnGuest, tickWorld } from "../../src/sim/world";
import { DODGE_COOLDOWN, DODGE_DURATION, RESTRAINT_DODGE_BONUS, RESTRAINT_MAX, TEST_SERIAL } from "../../src/sim/constants";
import { PROTOCOL_VERSION, type FastFrame } from "../../src/sim/protocol";
import { applySlow, mergeFrames, type SlowState } from "../../src/sim/frames";
import type { Player, WorldState } from "../../src/sim/types";

beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(0); });
afterEach(() => { vi.useRealTimers(); });

const token = "12345678-1234-4123-8123-123456789abc";
const otherToken = "22345678-1234-4123-8123-123456789abc";
const playerKey = (t: string) => `${PLAYER_PREFIX}${t}`;
const seenKey = (t: string) => `seen:v2:${t}`;

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
    get: vi.fn(async (key: string | string[]) =>
      Array.isArray(key)
        ? new Map(key.filter(k => data.has(k)).map(k => [k, structuredClone(data.get(k))]))
        : structuredClone(data.get(key))),
    put: vi.fn(async (values: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(values)) data.set(key, structuredClone(value));
    }),
    setAlarm: vi.fn(async () => {}),
    getAlarm: vi.fn(async () => data.get("scheduled") ?? null),
    delete: vi.fn(async (key: string | string[]) => {
      const keys = Array.isArray(key) ? key : [key];
      return keys.filter(k => data.delete(k)).length;
    }),
    /** Keys in order, as the real storage lists them: a prefix, a page, a cursor. */
    list: vi.fn(async ({ prefix = "", limit = Infinity, startAfter = "" }: { prefix?: string; limit?: number; startAfter?: string }) =>
      new Map([...data.keys()].filter(k => k.startsWith(prefix) && k > startAfter).sort().slice(0, limit).map(k => [k, structuredClone(data.get(k))]))),
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
    expect(data.get(playerKey(token)), "one body, one record").toMatchObject({ id: hello.id });
    expect(savedWorld(data).players, "the world record carries no bodies").toHaveLength(0);
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
  it("names the staged release on /health, read once through the assets binding, and stays silent without one", async () => {
    const health = (env: unknown) => worker.fetch(new Request("https://game.example/health"), env as never).then(r => r.json());
    const silent = { ok: true, v: PROTOCOL_VERSION };
    /** An assets binding that answers as told and counts how often it was asked. */
    const binding = (answer: () => Response) => {
      const b = { asked: 0, path: "", fetch: async (req: Request) => { b.asked++; b.path = new URL(req.url).pathname; return answer(); } };
      return b;
    };
    let staged = () => Response.json({ revision: "abc123", builtAt: "2026-09-27T11:00:00.000Z" });
    const good = binding(() => staged());
    expect(await health({ ASSETS: good })).toEqual({ ...silent, release: { revision: "abc123", builtAt: "2026-09-27T11:00:00.000Z" } });
    staged = () => new Response("not any more", { status: 404 });
    expect(await health({ ASSETS: good }), "a good read is remembered for the binding").toMatchObject({ release: { revision: "abc123" } });
    expect([good.asked, good.path]).toEqual([1, "/play/release.json"]);
    // nothing staged (a 404) names nothing, and is remembered: an isolate's assets never change
    const missing = binding(() => new Response("no", { status: 404 }));
    expect(await health({ ASSETS: missing })).toEqual(silent);
    expect(await health({ ASSETS: missing })).toEqual(silent);
    expect(missing.asked).toBe(1);
    // a malformed file, or one with the fields missing, names nothing and is remembered too
    const malformed = binding(() => new Response("{not json"));
    expect(await health({ ASSETS: malformed })).toEqual(silent);
    expect(await health({ ASSETS: malformed })).toEqual(silent);
    expect(malformed.asked).toBe(1);
    expect(await health({ ASSETS: binding(() => Response.json({ revision: 7 })) })).toEqual(silent);
    // a binding that throws or fails is a missing release, not a failed health, and is asked again next time
    const down = binding(() => { throw new Error("down"); });
    expect(await health({ ASSETS: down })).toEqual(silent);
    expect(await health({ ASSETS: down })).toEqual(silent);
    expect(down.asked).toBe(2);
    const failing = binding(() => new Response("later", { status: 503 }));
    expect(await health({ ASSETS: failing })).toEqual(silent);
    expect(await health({ ASSETS: failing })).toEqual(silent);
    expect(failing.asked).toBe(2);
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
    expect(data.get(playerKey(token))).toMatchObject({ serial: 42, wallet: addressOf(HOLDER) });
    // the nonce was spent
    const again = await world.fetch(post("/wallet/link", token, { address: addressOf(HOLDER), signature: ethSign(message, HOLDER) }));
    expect(again.status).toBe(409);
    expect(await again.json()).toEqual({ ok: false, reason: "no-challenge" });
  });

  it("tells a holder whose Angel walks in another body that it walks, not that the wallet holds none (the player-defect sweep)", async () => {
    const { world } = await worldHarness(null);
    await world.join(token, socket() as never);
    let message = await challenge(world, HOLDER);
    expect(await (await world.fetch(post("/wallet/link", token, { address: addressOf(HOLDER), signature: ethSign(message, HOLDER) }))).json()).toMatchObject({ serial: 42 });
    await world.join(otherToken, socket("b", otherToken) as never);
    message = await challenge(world, HOLDER, otherToken);
    const second = await world.fetch(post("/wallet/link", otherToken, { address: addressOf(HOLDER), signature: ethSign(message, HOLDER) }));
    expect(await second.json()).toEqual({ ok: true, address: addressOf(HOLDER), serial: null, walking: true });
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
      expect(data.get(playerKey(token))).toMatchObject({ serial: 7 });
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

  it("an action is checkpointed before its snapshot goes; a second action inside 20 ms rides the next alarm, checkpointed first and broadcast forced", async () => {
    const ws = socket();
    const { world, storage } = await worldHarness(saved(angel("a")), [ws]);
    vi.setSystemTime(1000);
    const puts = () => storage.put.mock.calls.length;
    const sends = () => ws.send.mock.calls.length;
    const before = puts();
    await world.webSocketMessage(ws as never, '{"t":"stance"}');
    expect(puts(), "the first action checkpoints at once").toBe(before + 1);
    expect(last(ws).you.stance).toBe("storm");
    const sentAfterFirst = sends();
    vi.setSystemTime(1005);
    await world.webSocketMessage(ws as never, '{"t":"stance"}');
    expect(puts(), "a second action inside the window is not checkpointed on its own").toBe(before + 1);
    expect(sends(), "and not broadcast on its own").toBe(sentAfterFirst);
    vi.setSystemTime(1050);
    await world.alarm();
    expect(puts(), "the alarm checkpoints the coalesced action first").toBe(before + 2);
    expect(sends()).toBeGreaterThan(sentAfterFirst);
    expect(last(ws).you.stance, "both actions are in the frame the alarm sent").toBe("restraint");
    // the checkpoint the alarm wrote carries the action, so a restart would keep it
    const written = storage.put.mock.calls[puts() - 1][0] as Record<string, Player>;
    expect(written[playerKey(token)].stance).toBe("restraint");
    // quiet for a while: the next action is immediate again
    vi.setSystemTime(2000);
    await world.webSocketMessage(ws as never, '{"t":"stance"}');
    expect(puts()).toBe(before + 3);
    expect(last(ws).you.stance).toBe("storm");
    // a message that changes nothing costs nothing: a strike lands its cooldown, a second strike inside it is a no-op
    vi.setSystemTime(3000);
    await world.webSocketMessage(ws as never, '{"t":"strike"}');
    expect(puts()).toBe(before + 4);
    const sentAfterStrike = sends();
    vi.setSystemTime(3100);
    await world.webSocketMessage(ws as never, '{"t":"strike"}');
    expect(puts(), "no checkpoint for a no-op").toBe(before + 4);
    expect(sends(), "no broadcast for a no-op").toBe(sentAfterStrike);
  });

  it("a flood past the socket's budget is dropped unread and counted on /world; the budget refills with time", async () => {
    const ws = socket();
    const { world, storage } = await worldHarness(saved(angel("a")), [ws]);
    vi.setSystemTime(1000);
    const before = storage.put.mock.calls.length;
    for (let i = 0; i < 200; i++) await world.webSocketMessage(ws as never, '{"t":"stance"}');
    // 120 admitted (an even number of stance flips: back where it began), 80 dropped; the first checkpointed and
    // broadcast at once, the rest coalesced into the next alarm: two checkpoints for the lot
    expect(last(ws).you.stance, "the first flip went out at once").toBe("storm");
    expect(storage.put.mock.calls.length).toBe(before + 1);
    vi.setSystemTime(1050);
    await world.alarm();
    expect(last(ws).you.stance, "the alarm carried the rest").toBe("restraint");
    expect(storage.put.mock.calls.length).toBe(before + 2);
    let body = (await (await world.fetch(new Request(`${ORIGIN}/world`))).json()) as { load: { dropped: number } };
    expect(body.load.dropped).toBe(80);
    // half a second later thirty tokens are back: thirty-one messages, one dropped
    vi.setSystemTime(1500);
    for (let i = 0; i < 31; i++) await world.webSocketMessage(ws as never, '{"t":"stance"}');
    body = (await (await world.fetch(new Request(`${ORIGIN}/world`))).json()) as { load: { dropped: number } };
    expect(body.load.dropped).toBe(81);
    // another socket has a budget of its own
    const other = socket("b", otherToken);
    await world.join(otherToken, other as never);
    vi.setSystemTime(1501);
    await world.webSocketMessage(other as never, '{"t":"intent","intent":{"right":true}}');
    body = (await (await world.fetch(new Request(`${ORIGIN}/world`))).json()) as { load: { dropped: number } };
    expect(body.load.dropped).toBe(81);
  });

  it("stamps a saved body when an action checkpoints it and when its socket closes", async () => {
    const ws = socket();
    const { world, data } = await worldHarness(saved(spawnGuest("a")), [ws]);
    vi.setSystemTime(1000);
    await world.webSocketMessage(ws as never, '{"t":"stance"}');
    expect(data.get(seenKey(token))).toBe(1000);
    expect(data.get(playerKey(token))).toMatchObject({ id: "a", stance: "storm" });
    vi.setSystemTime(1200);
    await world.webSocketMessage(ws as never, '{"t":"stance"}');
    expect(data.get(seenKey(token)), "once per session: the second checkpoint writes no stamp").toBe(1000);
    expect(data.get(playerKey(token))).toMatchObject({ stance: "restraint" });
    vi.setSystemTime(1500);
    await world.webSocketClose(ws as never);
    expect(data.get(seenKey(token))).toBe(1500);
    expect(data.get(playerKey(token))).toMatchObject({ id: "a" });
  });

  it("budgets joins per address and then for the city, refusing with 429 and counting; the buckets refill; full address buckets are forgotten; an oversize message is dropped and counted", async () => {
    const ws = socket();
    const { world, ctx } = await worldHarness(saved(spawnGuest("a")), [ws]);
    const joinFrom = (address: string, n: number) => world.join(`${address}-${n}`, socket(`${address}-${n}`, `${address}-${n}`) as never, address);
    vi.setSystemTime(1000);
    for (let i = 0; i < 30; i++) expect(await joinFrom("10.0.0.1", i), `join ${i}`).not.toBeNull();
    expect(await joinFrom("10.0.0.1", 30), "the 31st from one address").toBeNull();
    expect(await joinFrom("10.0.0.2", 0), "another address still joins").not.toBeNull();
    let body = (await (await world.fetch(new Request(`${ORIGIN}/world`))).json()) as { load: { refused: number; dropped: number; sessions: number } };
    expect(body.load.refused).toBe(1);
    expect(body.load.sessions).toBe(32);
    // the city's own bucket holds sixty in one instant from everyone: 31 are in, 29 more from fresh addresses, then no more
    for (let i = 0; i < 29; i++) expect(await joinFrom(`10.0.1.${i}`, 0), `city join ${i}`).not.toBeNull();
    expect(await joinFrom("10.0.2.1", 0), "the city's 61st").toBeNull();
    body = (await (await world.fetch(new Request(`${ORIGIN}/world`))).json()) as { load: { refused: number; dropped: number; sessions: number } };
    expect(body.load.refused).toBe(2);
    // the upgrade answers 429 when the join is refused (the pair the runtime makes is a double here; no CF-Connecting-IP is "local")
    const g = globalThis as { WebSocketPair?: unknown };
    g.WebSocketPair = class { 0 = socket("c", token); 1 = socket("s", token); };
    try {
      const upgrade = await world.fetch(new Request(`${ORIGIN}/ws`, { headers: { Upgrade: "websocket", Origin: ORIGIN, Cookie: `reverie_session=${token}` } }));
      expect(upgrade.status).toBe(429);
      expect(upgrade.headers.get("Retry-After")).toBe("1");
    } finally {
      delete g.WebSocketPair;
    }
    expect(ctx.acceptWebSocket).toHaveBeenCalledTimes(60);
    // a tenth of a second later the first address has a token back and the city three
    vi.setSystemTime(1100);
    expect(await joinFrom("10.0.0.1", 31)).not.toBeNull();
    // address buckets that are full again are forgotten once the map is past its size: refused joins from fresh
    // addresses fill it cheaply (the city's two remaining tokens admit two), and three seconds on every bucket is full
    const joins = (world as unknown as { joins: Map<string, unknown> }).joins;
    for (let i = joins.size; i < 1024; i++) await joinFrom(`10.1.${i >> 8}.${i & 255}`, 0);
    expect(joins.size).toBe(1024);
    vi.setSystemTime(4100);
    expect(await joinFrom("10.2.0.1", 0)).not.toBeNull();
    expect(joins.size, "the full buckets are gone; the new address stays").toBe(1);
    // an oversize message spends its token, is dropped unread and counted
    await world.webSocketMessage(ws as never, `{"t":"stance","pad":"${"x".repeat(5000)}"}`);
    body = (await (await world.fetch(new Request(`${ORIGIN}/world`))).json()) as { load: { refused: number; dropped: number; sessions: number } };
    expect(body.load.dropped).toBe(1);
    expect(last(ws).you.stance).toBe("restraint");
  });

  it("a sweep that throws leaves the tick armed and is tried again an hour later", async () => {
    const DAY = 86_400_000;
    const ws = socket();
    const { world, storage, data } = await worldHarness(saved(spawnGuest("a")), [ws], [[playerKey("g1"), spawnGuest("g1")], [seenKey("g1"), 0]]);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    storage.list.mockRejectedValueOnce(new Error("storage down"));
    vi.setSystemTime(31 * DAY);
    await expect(world.alarm()).resolves.toBeUndefined();
    expect(storage.setAlarm).toHaveBeenCalled();
    expect(data.has(playerKey("g1")), "nothing swept").toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
    vi.setSystemTime(31 * DAY + 3_600_000);
    await world.alarm();
    expect(data.has(playerKey("g1")), "swept an hour later").toBe(false);
    warn.mockRestore();
  });

  it("sweeps a guest unseen for thirty days once an hour, a page at a time; keeps the Angel, the bound wallet, the fresh guest and the live body; a record from before the stamps enters the clock", async () => {
    const DAY = 86_400_000;
    const ws = socket();
    const { world, storage, data } = await worldHarness(saved(spawnGuest("a")), [ws], [
      [playerKey("g1"), spawnGuest("g1")], [seenKey("g1"), 0], // a guest, unseen for 31 days
      [playerKey("a1"), angel("a1")], [seenKey("a1"), 0], // an Angel's body, as old
      [playerKey("w1"), { ...spawnGuest("w1"), wallet: "0xabc" }], [seenKey("w1"), 0], // a guest who bound a wallet
      [playerKey("f1"), spawnGuest("f1")], [seenKey("f1"), 31 * DAY - 1000], // a guest seen a second ago
      [playerKey("l1"), spawnGuest("l1")], // a record from before the stamps
    ]);
    // a new city waits an hour before its first sweep: the first tick carries none
    vi.setSystemTime(50);
    await world.alarm();
    expect(storage.list).not.toHaveBeenCalled();
    vi.setSystemTime(31 * DAY);
    await world.webSocketMessage(ws as never, '{"t":"stance"}'); // the live body is saved and stamped by its action
    await world.alarm();
    expect(storage.list).toHaveBeenCalledTimes(1);
    expect(data.get("sweep:v2"), "the clock and the cursor are kept in storage").toEqual({ at: 31 * DAY, after: playerKey("w1") });
    // a new instance over the same storage picks the clock and the cursor up: no sweep inside the hour, then the page after the cursor
    const again = await worldHarness(null, [socket()], [...data.entries()].filter(([k]) => k !== WORLD_KEY).concat([[WORLD_KEY, data.get(WORLD_KEY)]]));
    vi.setSystemTime(31 * DAY + 100);
    await again.world.alarm();
    expect(again.storage.list).not.toHaveBeenCalled();
    vi.setSystemTime(31 * DAY + 3_600_000);
    await again.world.alarm();
    expect(again.storage.list.mock.calls[0][0]).toMatchObject({ startAfter: playerKey("w1") });
    expect(again.storage.list.mock.calls[1][0], "past the end: the page from the top").toMatchObject({ startAfter: undefined });
    expect(data.has(playerKey("g1")), "the stale guest is gone").toBe(false);
    expect(data.has(seenKey("g1")), "with its stamp").toBe(false);
    for (const t of ["a1", "w1", "f1", "l1"]) expect(data.has(playerKey(t)), `${t} is kept`).toBe(true);
    expect(data.get(seenKey("l1")), "the old record is stamped now").toBe(31 * DAY);
    expect(data.get(seenKey(token)), "the live body's checkpoint stamped it").toBe(31 * DAY);
    expect(data.has(playerKey(token))).toBe(true);
    let body = (await (await world.fetch(new Request(`${ORIGIN}/world`))).json()) as { load: { swept: number } };
    expect(body.load.swept).toBe(1);
    // a step later: no second sweep inside the hour
    vi.setSystemTime(31 * DAY + 50);
    await world.alarm();
    expect(storage.list).toHaveBeenCalledTimes(1);
    // thirty-one days on: the cursor is past the end, so the sweep starts over, and the once-fresh guest and the
    // once-unstamped record are stale now; the Angel, the bound wallet and the live body stay
    vi.setSystemTime(62 * DAY);
    await world.alarm();
    expect(data.has(playerKey("f1"))).toBe(false);
    expect(data.has(playerKey("l1"))).toBe(false);
    expect(data.has(seenKey("l1"))).toBe(false);
    for (const t of ["a1", "w1", token]) expect(data.has(playerKey(t)), `${t} is kept`).toBe(true);
    body = (await (await world.fetch(new Request(`${ORIGIN}/world`))).json()) as { load: { swept: number } };
    expect(body.load.swept).toBe(3);
  });

  it("keeps bodies out of the world record and writes a body's record only when it changed; a body from an embedded world is written once", async () => {
    const a = socket("a", token);
    const b = socket("b", otherToken);
    // b stands still at full restraint with no timers running: the tick keeps its object, so it is written once and no more
    const { world, storage, data } = await worldHarness(saved(spawnGuest("a"), { ...spawnGuest("b"), restraint: RESTRAINT_MAX }), [a, b]);
    vi.setSystemTime(1000);
    await world.webSocketMessage(a as never, '{"t":"stance"}');
    let put = storage.put.mock.calls.at(-1)![0] as Record<string, unknown>;
    expect(Object.keys(put).sort(), "the first checkpoint: the world, both bodies (b came from the old embedding), both stamps")
      .toEqual([playerKey(token), playerKey(otherToken), seenKey(token), seenKey(otherToken), WORLD_KEY].sort());
    expect((put[WORLD_KEY] as { players: unknown[] }).players, "the world record carries no bodies").toEqual([]);
    expect(data.get(playerKey(otherToken))).toMatchObject({ id: "b" });
    vi.setSystemTime(1100);
    await world.webSocketMessage(a as never, '{"t":"stance"}');
    put = storage.put.mock.calls.at(-1)![0] as Record<string, unknown>;
    expect(Object.keys(put).sort(), "the second: the world and the body that changed").toEqual([playerKey(token), WORLD_KEY].sort());
    expect(data.get(playerKey(token))).toMatchObject({ stance: "restraint" });
  });

  it("restores a hibernated socket's body from its record through the migration, never rewriting it unchanged; closes one with neither a record nor an embedded body", async () => {
    const ws = socket("a", token);
    const b = socket("b", otherToken);
    const partial = socket("c", "t-c");
    const orphan = socket("zz", "t-zz");
    // A body's first tick hands it the opening quest and its notice, so a record as a body stands after that (and
    // at full restraint, with no timer running) is one the ticks leave alone.
    const settled = (id: string) => ({ ...tickWorld(saved(spawnGuest(id)), 0.05).players.get(id)!, restraint: RESTRAINT_MAX });
    const { world, storage, data } = await worldHarness(saved(), [ws, b, partial, orphan], [
      [playerKey(token), { ...settled("a"), bestand: 5, banked: 9, dodgeT: 0.3 }],
      [playerKey(otherToken), settled("b")],
      [playerKey("t-c"), { id: "c", bestand: 3 }], // a record from a build with fewer fields: the migration fills it, the first tick gives it its quest
    ]);
    expect(orphan.close).toHaveBeenCalledWith(1012, expect.any(String));
    expect(ws.close).not.toHaveBeenCalled();
    vi.setSystemTime(200);
    await world.alarm();
    expect(last(ws).you, "the record's fields, its transient dodge dropped by the migration").toMatchObject({ id: "a", bestand: 5, banked: 9, dodgeT: 0 });
    expect(last(partial).you, "the partial record filled in by the migration").toMatchObject({ id: "c", bestand: 3, hp: 100, movement: 1, quests: {} });
    expect(last(ws).players.map((p: { id: string }) => p.id)).not.toContain("zz");
    // b acts: its checkpoint writes the world, b, c (its first quest) and the first stamps, and not a, which stands as
    // its record has it
    vi.setSystemTime(1000);
    await world.webSocketMessage(b as never, '{"t":"stance"}');
    let put = storage.put.mock.calls.at(-1)![0] as Record<string, unknown>;
    expect(Object.keys(put).sort()).toEqual([playerKey(otherToken), playerKey("t-c"), seenKey(token), seenKey(otherToken), seenKey("t-c"), WORLD_KEY].sort());
    expect(data.get(playerKey("t-c")), "c's record now carries its quest").toMatchObject({ id: "c", bestand: 3, quests: { "m1-diagnosis": 0 } });
    // a leaves unchanged: the close writes its stamp and not its body
    vi.setSystemTime(1100);
    await world.webSocketClose(ws as never);
    put = storage.put.mock.calls.at(-1)![0] as Record<string, unknown>;
    expect(Object.keys(put).sort(), "the close: the world and a's stamp").toEqual([seenKey(token), WORLD_KEY].sort());
    expect(data.get(playerKey(token)), "the record stands as it was").toMatchObject({ bestand: 5, dodgeT: 0.3 });
    // a comes back: the join's checkpoint writes the world and a's stamp, and not the body it just read
    vi.setSystemTime(1200);
    const again = socket("a", token);
    expect(await world.join(token, again as never)).toMatchObject({ id: "a" });
    put = storage.put.mock.calls.at(-1)![0] as Record<string, unknown>;
    expect(Object.keys(put).sort(), "the join: the world and a's stamp").toEqual([seenKey(token), WORLD_KEY].sort());
    expect(last(again).you).toMatchObject({ id: "a", bestand: 5 });
  });

  it("a put that throws leaves the body owed to the next checkpoint", async () => {
    const ws = socket();
    const { world, storage } = await worldHarness(saved(spawnGuest("a")), [ws]);
    vi.setSystemTime(1000);
    storage.put.mockRejectedValueOnce(new Error("storage down"));
    await expect(world.webSocketMessage(ws as never, '{"t":"stance"}')).rejects.toThrow("storage down");
    // the action stands in memory and is still pending; the next alarm checkpoints it, body included, although
    // its object has not changed since the put that failed
    vi.setSystemTime(1050);
    await world.alarm();
    const put = storage.put.mock.calls.at(-1)![0] as Record<string, unknown>;
    expect(Object.keys(put)).toContain(playerKey(token));
    expect((put[playerKey(token)] as Player).stance).toBe("storm");
    expect(last(ws).you.stance).toBe("storm");
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

describe("one body per Angel (the player-defect sweep, 2026-10-04)", () => {
  // Two sessions, one Angel: the first walked as it and was saved; the second linked it while the first was away. The index
  // (serial:v2:<serial>) names the newest body checkpointed with the serial, and the first comes back unsealed.
  const first = () => angel("a", { serial: TEST_SERIAL, name: "#7777", movement: 3, flags: { angel: 1, under: 1, m3: 1 }, quests: { "m3-organs": 2 }, x: 3000, y: 2000, district: "organs" });

  async function relinkedElsewhere() {
    const h = await worldHarness(saved(), [], [[playerKey(token), first()]]);
    const ws2 = socket("b", otherToken);
    await h.world.join(otherToken, ws2 as never);
    await h.world.webSocketMessage(ws2 as never, JSON.stringify({ t: "link", serial: TEST_SERIAL, sig: "mock" }));
    expect(h.data.get(`serial:v2:${TEST_SERIAL}`), "the index names the newest body with the serial").toBe(otherToken);
    return { ...h, ws2 };
  }

  it("while the other body walks, the saved one comes back unsealed: a locked guest at the threshold, its progress kept, told why", async () => {
    const { world, data, ws2 } = await relinkedElsewhere();
    const ws1 = socket("a", token);
    const hello = await world.join(token, ws1 as never);
    expect(hello).toMatchObject({ guest: true });
    const back = data.get(playerKey(token)) as Player;
    expect(back).toMatchObject({ guest: true, serial: null, locked: true, movement: 3, district: "nave", heard: LINES.LINK_MOVED });
    expect(back.quests["m3-organs"], "progress stays with the body").toBe(2);
    expect(back.flags.angel).toBeUndefined();
    expect(last(ws2).you).toMatchObject({ guest: false, serial: TEST_SERIAL });
  });

  it("with the other body away, the index still decides; and the body the index names comes back sealed", async () => {
    const { world, data, ws2 } = await relinkedElsewhere();
    await world.webSocketClose(ws2 as never);
    await world.join(token, socket("a", token) as never);
    expect(data.get(playerKey(token))).toMatchObject({ guest: true, serial: null, locked: true });
    const { world: later, data: d2 } = await worldHarness(saved(), [], [...data.entries()].filter(([k]) => k !== "world:v2"));
    await later.join(otherToken, socket("b", otherToken) as never);
    expect(d2.get(playerKey(otherToken))).toMatchObject({ guest: false, serial: TEST_SERIAL });
  });

  it("a saved Angel nobody else holds comes back as it was, and claims the index", async () => {
    const { world, data } = await worldHarness(saved(), [], [[playerKey(token), first()]]);
    await world.join(token, socket("a", token) as never);
    expect(data.get(playerKey(token))).toMatchObject({ guest: false, serial: TEST_SERIAL, district: "organs" });
    expect(data.get(`serial:v2:${TEST_SERIAL}`)).toBe(token);
  });
});
