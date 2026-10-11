// The player-defect sweep, round eleven: closing the tab is not a way out of a fight one is losing. A body whose socket
// closes while its flag is held (or a ruin duel runs) stands in the city, idle, until the fight is over.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReverieWorld, serializeWorld } from "./index";
import { emptyWorld, spawnGuest } from "../../src/sim/world";
import { POSITIONS, districtAt } from "../../src/sim/map";
import { F } from "../../src/sim/content/ids";
import type { Player, WorldState } from "../../src/sim/types";

beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(0); });
afterEach(() => { vi.useRealTimers(); });

const tokA = "12345678-1234-4123-8123-123456789abc";
const tokB = "22345678-1234-4123-8123-123456789abc";
const WORLD_KEY = "world:v2";

function socket(id: string, t: string) {
  return { deserializeAttachment: () => ({ id, token: t }), serializeAttachment: vi.fn(), send: vi.fn(), close: vi.fn() };
}
function angel(id: string, serial: number, dx: number, extra: Partial<Player> = {}): Player {
  const pos = POSITIONS["stall-3"];
  return {
    ...spawnGuest(id), guest: false, serial, name: `#00${serial}`, house: "earth", flags: { [F.ANGEL]: 1 },
    x: pos.x + dx, y: pos.y, district: districtAt(pos.x + dx, pos.y), flagged: true, ...extra,
  };
}
async function harness(w: WorldState, sockets: unknown[]) {
  const data = new Map<string, unknown>([[WORLD_KEY, serializeWorld(w)]]);
  let ready: Promise<unknown>;
  const storage = {
    get: vi.fn(async (key: string | string[]) => Array.isArray(key) ? new Map(key.filter(k => data.has(k)).map(k => [k, structuredClone(data.get(k))])) : structuredClone(data.get(key))),
    put: vi.fn(async (values: Record<string, unknown>) => { for (const [k, v] of Object.entries(values)) data.set(k, structuredClone(v)); }),
    setAlarm: vi.fn(async () => {}), getAlarm: vi.fn(async () => null),
    delete: vi.fn(async () => 0), list: vi.fn(async () => new Map()),
  };
  const ctx = { storage, getWebSockets: () => sockets, waitUntil: vi.fn(), acceptWebSocket: vi.fn(), blockConcurrencyWhile: (fn: () => Promise<unknown>) => (ready = fn()) };
  const world = new ReverieWorld(ctx as never, { MOCK_LINK: "1" } as never);
  await ready!;
  return { world, data };
}
const peek = (world: ReverieWorld) => (world as unknown as { w: WorldState }).w;

describe("a body that leaves a flagged fight it is losing", () => {
  async function setup() {
    const w = emptyWorld();
    w.players.set("a", angel("a", 41, 0, { facing: { dx: 1, dy: 0 }, bestand: 0 }));
    w.players.set("b", angel("b", 42, 24, { facing: { dx: -1, dy: 0 }, bestand: 80, hp: 40 }));
    const wsA = socket("a", tokA);
    const wsB = socket("b", tokB);
    const h = await harness(w, [wsA, wsB]);
    vi.setSystemTime(100);
    await h.world.webSocketMessage(wsA as never, JSON.stringify({ t: "strike" }));
    return { ...h, wsA, wsB };
  }

  it("stays where the fight is: the next blow fells it and the winner takes the spoils", async () => {
    const { world, wsA, wsB, data } = await setup();
    expect(peek(world).players.get("b")!.hp).toBe(18);
    await world.webSocketClose(wsB as never);
    expect(peek(world).players.has("b"), "the body stands while its flag is held").toBe(true);
    for (let t = 200; t <= 1500; t += 100) { vi.setSystemTime(t); await world.alarm(); }
    await world.webSocketMessage(wsA as never, JSON.stringify({ t: "strike" }));
    const w = peek(world);
    expect(w.players.get("b")?.deaths ?? (data.get(`player:v2:${tokB}`) as Player).deaths).toBe(1);
    expect(w.players.get("a")!.bestand).toBeGreaterThan(0);
  });

  it("leaves the city once the hold runs out untouched, its record written as it stood", async () => {
    const { world, wsB, data } = await setup();
    await world.webSocketClose(wsB as never);
    for (let t = 200; t <= 13_000; t += 100) { vi.setSystemTime(t); await world.alarm(); }
    expect(peek(world).players.has("b")).toBe(false);
    expect(data.get(`player:v2:${tokB}`)).toMatchObject({ hp: 18, bestand: 80, deaths: 0 });
  });

  it("its own token joining while the fight runs takes the standing body back, not its older record", async () => {
    const { world, wsB } = await setup();
    await world.webSocketClose(wsB as never);
    vi.setSystemTime(600);
    await world.alarm();
    const back = socket("b", tokB);
    await world.join(tokB, back as never);
    const b = peek(world).players.get("b")!;
    expect(b).toMatchObject({ hp: 18, bestand: 80 });
    expect([...peek(world).players.keys()].filter(id => id === "b")).toHaveLength(1);
  });

  it("a fall it takes while standing is written with the blow that felled it: the victim's loss lands with the killer's spoils", async () => {
    const { world, wsA, wsB, data } = await setup();
    await world.webSocketClose(wsB as never);
    for (let t = 200; t <= 1500; t += 100) { vi.setSystemTime(t); await world.alarm(); }
    vi.setSystemTime(1550);
    await world.webSocketMessage(wsA as never, JSON.stringify({ t: "strike" }));
    expect(peek(world).players.get("b")!.deaths).toBe(1);
    const a = data.get(`player:v2:${tokA}`) as Player;
    const b = data.get(`player:v2:${tokB}`) as Player;
    expect(a.bestand).toBeGreaterThan(0);
    expect(b).toMatchObject({ deaths: 1 });
    expect(b.bestand).toBeLessThan(80);
  });

  it("a release whose write throws leaves the body standing, owed to the next alarm, with what it took after the close", async () => {
    const { world, wsA, wsB, data } = await setup();
    await world.webSocketClose(wsB as never);
    for (let t = 200; t <= 1000; t += 100) { vi.setSystemTime(t); await world.alarm(); }
    const storage = (world as unknown as { ctx: { storage: { put: ReturnType<typeof vi.fn> } } }).ctx.storage;
    let t = 1000;
    let failed = false;
    while (peek(world).players.has("b") && t < 20_000) {
      t += 100; vi.setSystemTime(t);
      const held = peek(world).players.get("b")!;
      const due = !failed && !((held.flagHeldUntil ?? 0) > peek(world).now + 0.15);
      if (due) { storage.put.mockImplementationOnce(async () => { throw new Error("storage down"); }); failed = true; }
      try { await world.alarm(); } catch { /* the alarm retries */ }
      if (due) expect(peek(world).players.has("b"), "a failed write takes nobody out").toBe(true);
    }
    expect(peek(world).players.has("b")).toBe(false);
    expect((data.get(`player:v2:${tokB}`) as Player).hp).toBe(18);
    void wsA;
  });

  it("a body in no fight leaves at once, as before", async () => {
    const w = emptyWorld();
    w.players.set("c", angel("c", 43, 0, { flagged: false }));
    const wsC = socket("c", tokA);
    const { world } = await harness(w, [wsC]);
    await world.webSocketClose(wsC as never);
    expect(peek(world).players.has("c")).toBe(false);
  });
});
