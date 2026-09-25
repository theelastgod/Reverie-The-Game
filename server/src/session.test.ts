import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker, { ReverieWorld, sameOrigin, sessionToken } from "./index";
import { emptyWorld, spawnGuest } from "../../src/sim/world";
import { CLERK_DAMAGE, WET_GRID } from "../../src/sim/campaign";

beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(0); });
afterEach(() => { vi.useRealTimers(); });

const token = "12345678-1234-4123-8123-123456789abc";
function socket(id = "a") {
  return { deserializeAttachment: () => ({ id, token }), send: vi.fn(), close: vi.fn() };
}
async function worldHarness(data = new Map<string, unknown>(), sockets: ReturnType<typeof socket>[] = []) {
  let ready: Promise<unknown>;
  const storage = {
    get: vi.fn(async (key: string) => structuredClone(data.get(key))),
    put: vi.fn(async (values: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(values)) data.set(key, structuredClone(value));
    }),
    setAlarm: vi.fn(async () => {}),
    getAlarm: vi.fn(async () => data.get("scheduled") ?? null),
  };
  const ctx = { storage, getWebSockets: () => sockets, waitUntil: vi.fn(),
    blockConcurrencyWhile: (fn: () => Promise<unknown>) => (ready = fn()) };
  const world = new ReverieWorld(ctx as never, {} as never);
  await ready!;
  return { world, storage, data };
}

describe("durable world sessions", () => {
  it("restores the world and live bodies after hibernation, with idle movement", async () => {
    const saved = emptyWorld();
    const player = { ...spawnGuest("a"), bestand: 91, banked: 33 };
    saved.players.set("a", player);
    saved.players.set("orphan", spawnGuest("orphan"));
    saved.intents.set("a", { up: false, down: false, left: false, right: true });
    saved.gestell = 74;
    saved.weatherNamed = true;
    const ws = socket();
    const { world, storage, data } = await worldHarness(new Map([["world:v1", saved]]), [ws]);
    await world.alarm();
    const snap = JSON.parse(ws.send.mock.calls.at(-1)![0]);
    expect(snap.players).toHaveLength(1);
    expect(snap.players[0]).toMatchObject({ id: "a", x: player.x, bestand: 91, banked: 33 });
    expect(snap.gestell).toBe(74);
    expect(snap.weatherNamed).toBe(true);
    expect(storage.setAlarm).toHaveBeenCalled();
    await world.webSocketClose(ws as never);
    expect(data.get(`player:${token}`)).toMatchObject({ id: "a", bestand: 91, banked: 33 });
    expect((data.get("world:v1") as ReturnType<typeof emptyWorld>).players.size).toBe(0);
  });

  it("persists an action before broadcasting it and rejects malformed packets", async () => {
    const saved = emptyWorld(); saved.players.set("a", spawnGuest("a"));
    const ws = socket();
    const { world, data } = await worldHarness(new Map([["world:v1", saved]]), [ws]);
    for (const packet of ["null", "[]", "{", "0"]) await world.webSocketMessage(ws as never, packet);
    await world.webSocketMessage(ws as never, JSON.stringify({ t: "link", serial: 7777, sig: "mock" }));
    expect(data.get(`player:${token}`)).toMatchObject({ serial: 7777, guest: false });
    expect(JSON.parse(ws.send.mock.calls.at(-1)![0]).players[0].serial).toBe(7777);
  });

  it("an unknown or replaced socket cannot mutate or remove a live body", async () => {
    const saved = emptyWorld(); saved.players.set("a", spawnGuest("a"));
    const ws = socket();
    const { world, storage } = await worldHarness(new Map([["world:v1", saved]]), [ws]);
    await world.webSocketMessage(socket() as never, '{"t":"link","serial":7777,"sig":"mock"}');
    await world.webSocketClose(socket() as never);
    expect(storage.put).not.toHaveBeenCalled();
    await world.alarm();
    expect(JSON.parse(ws.send.mock.calls.at(-1)![0]).players[0].guest).toBe(true);
  });

  it("expires held movement if the client stops sending heartbeats", async () => {
    const saved = emptyWorld(); saved.players.set("a", spawnGuest("a"));
    const ws = socket();
    const { world } = await worldHarness(new Map([["world:v1", saved]]), [ws]);
    vi.setSystemTime(50);
    await world.webSocketMessage(ws as never, '{"t":"intent","intent":{"right":true}}');
    vi.setSystemTime(100);
    await world.alarm();
    const moved = JSON.parse(ws.send.mock.calls.at(-1)![0]).players[0].x;
    expect(moved).toBeGreaterThan(spawnGuest("a").x);
    vi.setSystemTime(1151);
    await world.alarm();
    expect(JSON.parse(ws.send.mock.calls.at(-1)![0]).players[0].x).toBe(moved);
  });

  it("broadcasts opening encounters to newcomers while veterans see shared departures", async () => {
    const saved = emptyWorld();
    saved.naraGone = true; saved.ordGone = true; saved.quillGone = true;
    saved.players.set("new", spawnGuest("new"));
    const veteran = spawnGuest("old");
    saved.players.set("old", { ...veteran, guest: false, beats: { ...veteran.beats, under: true } });
    const newcomerSocket = socket("new"); const veteranSocket = socket("old");
    const { world } = await worldHarness(new Map([["world:v1", saved]]), [newcomerSocket, veteranSocket]);
    await world.alarm();
    const fresh = JSON.parse(newcomerSocket.send.mock.calls.at(-1)![0]);
    const old = JSON.parse(veteranSocket.send.mock.calls.at(-1)![0]);
    expect(fresh.npcs.map((n: { id: string }) => n.id)).toEqual(expect.arrayContaining(["nara", "quill", "ord"]));
    expect(old.npcs.map((n: { id: string }) => n.id)).not.toContain("nara");
    expect(old.players).toEqual(fresh.players);
    expect(old.gestell).toBe(fresh.gestell);
  });

  it("accepts only a direction for dodge and persists the bounded server result", async () => {
    const saved = emptyWorld(); saved.players.set("a", spawnGuest("a"));
    const ws = socket();
    const { world, data } = await worldHarness(new Map([["world:v1", saved]]), [ws]);
    await world.webSocketMessage(ws as never, JSON.stringify({ t: "dodge", dx: "fast", dy: 0 }));
    expect(ws.send).not.toHaveBeenCalled();
    await world.webSocketMessage(ws as never, JSON.stringify({ t: "dodge", dx: 90000, dy: 0, dodgeT: 999 }));
    const p = data.get(`player:${token}`) as ReturnType<typeof spawnGuest>;
    expect(p.dodgeT).toBe(.18);
    expect(p.dodgeX).toBe(1);
    expect(p.dodgeCd).toBe(.95);
    expect(p.guest).toBe(true);
  });

  it("closes legacy sockets that cannot be recovered", async () => {
    const ws = socket();
    await worldHarness(new Map(), [ws]);
    expect(ws.close).toHaveBeenCalledWith(1012, expect.any(String));
  });

  it("owns flag eligibility and persists the explicit request without accepting supplied state", async () => {
    const saved = emptyWorld(); saved.players.set("a", spawnGuest("a"));
    const ws = socket();
    const { world, data } = await worldHarness(new Map([["world:v1", saved]]), [ws]);
    await world.webSocketMessage(ws as never, JSON.stringify({ t: "flag", x: WET_GRID.x, y: WET_GRID.y, guest: false, flagged: true }));
    expect(data.get(`player:${token}`)).toMatchObject({ guest: true, flagged: false, x: 192 });
    const ready = emptyWorld();
    ready.players.set("a", { ...spawnGuest("a"), guest: false, x: WET_GRID.x, y: WET_GRID.y });
    const linked = await worldHarness(new Map([["world:v1", ready]]), [ws]);
    await linked.world.webSocketMessage(ws as never, '{"t":"flag"}');
    expect(linked.data.get(`player:${token}`)).toMatchObject({ guest: false, flagged: true });
  });

  it("tracks elapsed time through delayed and duplicate alarm callbacks", async () => {
    const saved = emptyWorld(); saved.players.set("a", spawnGuest("a"));
    const ws = socket();
    const { world } = await worldHarness(new Map([["world:v1", saved]]), [ws]);
    await world.webSocketMessage(ws as never, '{"t":"intent","intent":{"right":true}}');
    for (let i = 1; i <= 10; i++) { vi.setSystemTime(i * 83); await world.alarm(); }
    const snap = JSON.parse(ws.send.mock.calls.at(-1)![0]);
    expect(snap.now).toBeCloseTo(.8);
    expect(snap.players[0].x).toBeGreaterThan(spawnGuest("a").x);
    await world.alarm();
    expect(JSON.parse(ws.send.mock.calls.at(-1)![0])).toEqual(snap);
  });

  it("bounds outage catch-up, clears stale movement and does not replay a minute of attacks", async () => {
    const saved = emptyWorld(); saved.players.set("a", spawnGuest("a"));
    saved.clerks = [{ id: "test", name: "Clerk", x: 200, y: 480, hp: 44, telegraph: .1, targetId: "a" }];
    const ws = socket();
    const { world } = await worldHarness(new Map([["world:v1", saved]]), [ws]);
    await world.webSocketMessage(ws as never, '{"t":"intent","intent":{"right":true}}');
    vi.setSystemTime(60000);
    await world.alarm();
    const snap = JSON.parse(ws.send.mock.calls.at(-1)![0]);
    expect(snap.now).toBeCloseTo(.25);
    expect(snap.players[0]).toMatchObject({ x: spawnGuest("a").x, hp: 100 - CLERK_DAMAGE });
  });

  it("settles old elapsed time before applying a fresh dodge request", async () => {
    const saved = emptyWorld(); saved.players.set("a", spawnGuest("a"));
    const ws = socket();
    const { world, data } = await worldHarness(new Map([["world:v1", saved]]), [ws]);
    vi.setSystemTime(125);
    await world.webSocketMessage(ws as never, '{"t":"dodge","dx":1,"dy":0,"elapsed":999999}');
    expect(data.get(`player:${token}`)).toMatchObject({ dodgeT: .18 });
    vi.setSystemTime(150);
    await world.alarm();
    const snap = JSON.parse(ws.send.mock.calls.at(-1)![0]);
    expect(snap.now).toBeCloseTo(.15);
    expect(snap.players[0].dodgeT).toBeCloseTo(.13);
  });

  it("preserves an alarm already scheduled before hibernation", async () => {
    const saved = emptyWorld(); saved.players.set("a", spawnGuest("a"));
    const ws = socket();
    const { world, storage } = await worldHarness(new Map<string, unknown>([["world:v1", saved], ["scheduled", 50]]), [ws]);
    expect(storage.getAlarm).toHaveBeenCalled();
    expect(storage.setAlarm).not.toHaveBeenCalled();
    vi.setSystemTime(50); await world.alarm();
    expect(JSON.parse(ws.send.mock.calls.at(-1)![0]).now).toBeCloseTo(.05);
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
  });
  it("only accepts opaque session tokens, never public player ids", () => {
    expect(sessionToken(new Request("https://game.example", { headers: { Cookie: `other=x; reverie_session=${token}` } }))).toBe(token);
    expect(sessionToken(new Request("https://game.example", { headers: { Cookie: "reverie_session=player-a" } }))).toBeNull();
    expect(sameOrigin(new Request("https://game.example"))).toBe(false);
  });
});
