import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker, { ReverieWorld, restoreWorld, sameOrigin, serializeWorld, sessionToken, WORLD_KEY, PLAYER_PREFIX } from "./index";
import { emptyWorld, spawnGuest } from "../../src/sim/world";
import { DODGE_COOLDOWN, DODGE_DURATION, RESTRAINT_DODGE_BONUS, TEST_SERIAL } from "../../src/sim/constants";
import { PROTOCOL_VERSION } from "../../src/sim/protocol";
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

async function worldHarness(world: WorldState | null, sockets: Sock[] = [], extra: [string, unknown][] = []) {
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
  };
  const ctx = {
    storage, getWebSockets: () => sockets, waitUntil: vi.fn(), acceptWebSocket: vi.fn(),
    blockConcurrencyWhile: (fn: () => Promise<unknown>) => (ready = fn()),
  };
  const dobj = new ReverieWorld(ctx as never, {} as never);
  await ready!;
  return { world: dobj, storage, data, ctx };
}
const last = (ws: Sock) => JSON.parse(ws.send.mock.calls.at(-1)![0]);
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
    expect(snap.gestell).toBe(74);
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
