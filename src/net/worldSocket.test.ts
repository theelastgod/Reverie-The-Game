import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { INTENT_THROTTLE_MS, WorldSocket } from "./worldSocket";
import { CLIENT_MSG_TYPES, PROTOCOL_VERSION, isClientMsg, type ClientMsg } from "../sim/protocol";

class FakeSocket {
  static OPEN = 1;
  static CLOSED = 3;
  static instances: FakeSocket[] = [];
  readyState = 0;
  url: string;
  onmessage: ((e: { data: string }) => void) | null = null;
  onclose: ((e: { code: number }) => void) | null = null;
  onerror: (() => void) | null = null;
  send = vi.fn<(data: string) => void>();
  constructor(url: string) {
    this.url = url;
    FakeSocket.instances.push(this);
  }
  close(code = 1000) {
    if (this.readyState === FakeSocket.CLOSED) return;
    this.readyState = FakeSocket.CLOSED;
    this.onclose?.({ code });
  }
  open() {
    this.readyState = FakeSocket.OPEN;
  }
  message(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
  hello(id = "p1") {
    this.open();
    this.message({ t: "hello", v: PROTOCOL_VERSION, id, guest: true, you: { id, name: "GUEST", x: 1, y: 2 } });
  }
  sent(): ClientMsg[] {
    return this.send.mock.calls.map((c) => JSON.parse(c[0]) as ClientMsg);
  }
}

const fetchMock = vi.fn(async () => ({ ok: true }));

async function online(): Promise<{ net: WorldSocket; ws: FakeSocket }> {
  const net = new WorldSocket();
  await net.connect();
  const ws = FakeSocket.instances[FakeSocket.instances.length - 1];
  ws.hello();
  return { net, ws };
}

beforeEach(() => {
  vi.useFakeTimers();
  FakeSocket.instances = [];
  fetchMock.mockClear();
  vi.stubGlobal("WebSocket", FakeSocket);
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("location", { protocol: "https:", host: "game.example" });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("handshake", () => {
  it("posts /session then opens wss://host/ws and reads hello", async () => {
    const net = new WorldSocket();
    expect(net.status).toBe("connecting");
    await net.connect();
    expect(fetchMock).toHaveBeenCalledWith("/session", expect.objectContaining({ method: "POST" }));
    const ws = FakeSocket.instances[0];
    expect(ws.url).toBe("wss://game.example/ws");
    const hellos: string[] = [];
    net.onHello = (h) => hellos.push(h.id);
    ws.hello("abc");
    expect(net.id).toBe("abc");
    expect(net.you?.id).toBe("abc");
    expect(net.status).toBe("online");
    expect(hellos).toEqual(["abc"]);
    net.disconnect();
  });

  it("replaces snap and you on every snapshot and bumps seq", async () => {
    const { net, ws } = await online();
    const seen: number[] = [];
    net.onSnap = (s) => seen.push(s.tick);
    expect(net.seq).toBe(0);
    ws.message({ t: "snap", v: PROTOCOL_VERSION, tick: 7, you: { id: "p1", x: 10, y: 20 } });
    ws.message({ t: "snap", v: PROTOCOL_VERSION, tick: 8, you: { id: "p1", x: 11, y: 21 } });
    expect(net.snap?.tick).toBe(8);
    expect(net.you?.x).toBe(11);
    expect(net.seq).toBe(2);
    expect(seen).toEqual([7, 8]);
    net.disconnect();
  });

  it("merges v3 fast frames over the slow sections, and a slow frame alone republishes the merged view", async () => {
    const { net, ws } = await online();
    const seen: string[] = [];
    net.onSnap = (s) => seen.push(`${s.tick}:${(s.news ?? []).join("|")}:${s.you.x}`);
    ws.message({ t: "slow", v: PROTOCOL_VERSION, news: ["First."], pois: [{ id: "p", state: "open", count: 0 }], gestell: 40 });
    expect(net.snap, "a slow frame before any fast frame publishes nothing").toBeNull();
    ws.message({ t: "fast", v: PROTOCOL_VERSION, now: 1, tick: 7, you: { id: "p1", x: 10, y: 20 }, players: [], enemies: [], prompt: null });
    expect(net.snap).toMatchObject({ t: "snap", tick: 7, news: ["First."], gestell: 40, you: { x: 10 } });
    expect(net.snap?.pois).toEqual([{ id: "p", state: "open", count: 0 }]);
    ws.message({ t: "fast", v: PROTOCOL_VERSION, now: 2, tick: 8, you: { id: "p1", x: 11, y: 21 }, players: [{ id: "o", x: 1, y: 2, facing: { dx: 1, dy: 0 }, hpFrac: 1, dead: false, dodgeT: 0, heavyWindup: 0, hitStop: 0 }], enemies: [], prompt: null });
    expect(net.snap).toMatchObject({ tick: 8, news: ["First."], you: { x: 11 } });
    expect(net.snap?.players, "a body without a roster entry waits").toEqual([]);
    ws.message({ t: "slow", v: PROTOCOL_VERSION, news: ["First.", "Second."], roster: [{ id: "o", name: "#0042", guest: false, locked: false, house: "sky", messenger: "witness", district: "nave", stance: "restraint", flagged: false, truce: false, auraTier: 2, kit: "" }] });
    expect(net.snap).toMatchObject({ tick: 8, news: ["First.", "Second."], gestell: 40, you: { x: 11 } });
    expect(net.snap?.players).toEqual([{ id: "o", x: 1, y: 2, facing: { dx: 1, dy: 0 }, hpFrac: 1, dead: false, dodgeT: 0, heavyWindup: 0, hitStop: 0, name: "#0042", guest: false, locked: false, house: "sky", messenger: "witness", district: "nave", stance: "restraint", flagged: false, truce: false, auraTier: 2, kit: "" }]);
    expect(net.seq).toBe(3);
    expect(seen).toEqual(["7:First.:10", "8:First.:11", "8:First.|Second.:11"]);
    // a reconnect forgets the slow state: the server sends it all again after the hello
    ws.close(1006);
    await vi.advanceTimersByTimeAsync(1000);
    const ws2 = FakeSocket.instances[1];
    ws2.hello();
    ws2.message({ t: "fast", v: PROTOCOL_VERSION, now: 3, tick: 9, you: { id: "p1", x: 12, y: 22 }, players: [], enemies: [], prompt: null });
    expect(net.snap?.news).toBeUndefined();
    net.disconnect();
  });

  it("ignores junk frames", async () => {
    const { net, ws } = await online();
    ws.onmessage?.({ data: "not json" });
    ws.onmessage?.({ data: "null" });
    ws.message({ t: "unknown" });
    expect(net.status).toBe("online");
    expect(net.snap).toBeNull();
    net.disconnect();
  });

  it("reports the status sequence through onStatus", async () => {
    const net = new WorldSocket();
    const statuses: string[] = [];
    net.onStatus = (s) => statuses.push(s);
    await net.connect();
    FakeSocket.instances[0].hello();
    FakeSocket.instances[0].close(1006);
    net.disconnect();
    expect(statuses).toEqual(["online", "reconnecting", "closed"]);
  });
});

describe("reconnect", () => {
  it("backs off 1 s, 2 s, 4 s ... capped at 10 s", async () => {
    const net = new WorldSocket();
    await net.connect();
    FakeSocket.instances[0].hello();
    FakeSocket.instances[0].close(1006);
    expect(net.status).toBe("reconnecting");
    expect(FakeSocket.instances).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(999);
    expect(FakeSocket.instances).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(FakeSocket.instances).toHaveLength(2);
    FakeSocket.instances[1].close(1006);
    await vi.advanceTimersByTimeAsync(1999);
    expect(FakeSocket.instances).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(FakeSocket.instances).toHaveLength(3);
    FakeSocket.instances[2].close(1006);
    await vi.advanceTimersByTimeAsync(4000);
    expect(FakeSocket.instances).toHaveLength(4);
    FakeSocket.instances[3].close(1006);
    await vi.advanceTimersByTimeAsync(8000);
    expect(FakeSocket.instances).toHaveLength(5);
    FakeSocket.instances[4].close(1006);
    await vi.advanceTimersByTimeAsync(9999);
    expect(FakeSocket.instances).toHaveLength(5);
    await vi.advanceTimersByTimeAsync(1);
    expect(FakeSocket.instances).toHaveLength(6);
    // a fresh hello resets the backoff
    FakeSocket.instances[5].hello();
    FakeSocket.instances[5].close(1006);
    await vi.advanceTimersByTimeAsync(1000);
    expect(FakeSocket.instances).toHaveLength(7);
    net.disconnect();
  });

  it("retries when the session request fails", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });
    const net = new WorldSocket();
    await net.connect();
    expect(FakeSocket.instances).toHaveLength(0);
    expect(net.status).toBe("reconnecting");
    await vi.advanceTimersByTimeAsync(1000);
    expect(FakeSocket.instances).toHaveLength(1);
    net.disconnect();
  });

  it("does not replay strikes across a reconnect and resends the same direction", async () => {
    const { net, ws } = await online();
    const up = { up: true, down: false, left: false, right: false };
    net.sendIntent(up, 0);
    ws.close(1006);
    expect(net.strike()).toBe(false);
    await vi.advanceTimersByTimeAsync(1000);
    const ws2 = FakeSocket.instances[1];
    ws2.hello();
    expect(net.sendIntent(up, 10)).toBe(true);
    expect(ws2.sent()).toEqual([{ t: "intent", intent: up }]);
    net.disconnect();
  });

  it("stands down on 4001 (elsewhere) and stays down", async () => {
    const { net, ws } = await online();
    ws.close(4001);
    expect(net.status).toBe("elsewhere");
    await vi.advanceTimersByTimeAsync(30000);
    expect(FakeSocket.instances).toHaveLength(1);
    expect(net.strike()).toBe(false);
    net.disconnect();
  });

  it("never reconnects after disconnect()", async () => {
    const { net, ws } = await online();
    net.disconnect();
    expect(net.status).toBe("closed");
    expect(ws.readyState).toBe(FakeSocket.CLOSED);
    await vi.advanceTimersByTimeAsync(30000);
    await net.connect();
    expect(FakeSocket.instances).toHaveLength(1);
  });
});

describe("intent throttling", () => {
  it("sends unchanged intent at most every 250 ms, changed intent at once", async () => {
    const { net, ws } = await online();
    const right = { up: false, down: false, left: false, right: true };
    const left = { up: false, down: false, left: true, right: false };
    expect(net.sendIntent(right, 0)).toBe(true);
    expect(net.sendIntent(right, 100)).toBe(false);
    expect(net.sendIntent(right, INTENT_THROTTLE_MS - 1)).toBe(false);
    expect(net.sendIntent(right, INTENT_THROTTLE_MS)).toBe(true);
    expect(net.sendIntent(left, INTENT_THROTTLE_MS + 1)).toBe(true);
    expect(net.sendIntent(left, INTENT_THROTTLE_MS + 2)).toBe(false);
    expect(ws.send).toHaveBeenCalledTimes(3);
    net.disconnect();
  });

  it("does not swallow input before the handshake", async () => {
    const net = new WorldSocket();
    const right = { up: false, down: false, left: false, right: true };
    expect(net.sendIntent(right, 0)).toBe(false);
    await net.connect();
    const ws = FakeSocket.instances[0];
    ws.open();
    expect(net.sendIntent(right, 1)).toBe(false); // open but no hello yet
    ws.hello();
    expect(net.sendIntent(right, 2)).toBe(true);
    net.disconnect();
  });

  it("defaults to idle and coerces partial intents to booleans", async () => {
    const { net, ws } = await online();
    net.sendIntent(undefined, 0);
    net.sendIntent({ up: 1 as unknown as boolean, down: false, left: false, right: false }, 1);
    expect(ws.sent()).toEqual([
      { t: "intent", intent: { up: false, down: false, left: false, right: false } },
      { t: "intent", intent: { up: true, down: false, left: false, right: false } },
    ]);
    net.disconnect();
  });
});

describe("senders emit exact ClientMsg shapes", () => {
  it("covers every message type in protocol.ts", async () => {
    const { net, ws } = await online();
    net.sendIntent({ up: true, down: false, left: false, right: true }, 0);
    net.dodge(-3, 0.5);
    net.strike();
    net.heavy();
    net.stance();
    net.kit();
    net.kit("nave-node-1");
    net.interact("safety-plaque", "read");
    net.talk("nara");
    net.choose("c1");
    net.close();
    net.link(7777);
    net.link(42, "sig");
    net.flag();
    net.truce();
    net.use("paper:insurance");
    net.market("list", { itemId: "copy:wink", price: 9 });
    net.market("buy", { listingId: "l1" });
    net.market("cancel");
    const sent = ws.sent();
    expect(sent).toEqual([
      { t: "intent", intent: { up: true, down: false, left: false, right: true } },
      { t: "dodge", dx: -1, dy: 1 },
      { t: "strike" },
      { t: "heavy" },
      { t: "stance" },
      { t: "kit" },
      { t: "kit", targetId: "nave-node-1" },
      { t: "interact", targetId: "safety-plaque", choice: "read" },
      { t: "talk", npcId: "nara" },
      { t: "choose", choiceId: "c1" },
      { t: "close" },
      { t: "link", serial: 7777, sig: "mock" },
      { t: "link", serial: 42, sig: "sig" },
      { t: "flag" },
      { t: "truce" },
      { t: "use", itemId: "paper:insurance" },
      { t: "market", op: "list", itemId: "copy:wink", price: 9 },
      { t: "market", op: "buy", listingId: "l1" },
      { t: "market", op: "cancel" },
    ]);
    for (const msg of sent) expect(isClientMsg(msg)).toBe(true);
    const types = new Set(sent.map((m) => m.t));
    for (const t of CLIENT_MSG_TYPES) expect(types.has(t)).toBe(true);
    net.disconnect();
  });

  it("drops sends while offline and reports false", async () => {
    const net = new WorldSocket();
    expect(net.strike()).toBe(false);
    expect(net.link(1)).toBe(false);
    await net.connect();
    FakeSocket.instances[0].open();
    expect(net.heavy()).toBe(false);
    expect(FakeSocket.instances[0].send).not.toHaveBeenCalled();
    net.disconnect();
  });
});
