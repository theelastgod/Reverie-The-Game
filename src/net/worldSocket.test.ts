import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WorldSocket } from "./worldSocket";

class Socket {
  static OPEN = 1;
  static instances: Socket[] = [];
  readyState = 0;
  onmessage?: (e: { data: string }) => void;
  onclose?: (e: { code: number }) => void;
  onerror?: () => void;
  send = vi.fn();
  constructor() { Socket.instances.push(this); }
  close(code = 1000) { this.readyState = 3; this.onclose?.({ code }); }
  hello() { this.readyState = 1; this.onmessage?.({ data: JSON.stringify({ t: "hello", id: "a", you: { id: "a" } }) }); }
}

beforeEach(() => {
  vi.useFakeTimers();
  Socket.instances = [];
  vi.stubGlobal("WebSocket", Socket);
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true })));
  vi.stubGlobal("location", { protocol: "https:", host: "game.example" });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("world transport", () => {
  it("does not swallow input before the handshake and resends held input", async () => {
    const net = new WorldSocket();
    const right = { up: false, down: false, left: false, right: true };
    net.sendIntent(right);
    expect(net.lastIntent).toBe("");
    await net.connect();
    const ws = Socket.instances[0]; ws.hello();
    net.sendIntent(right);
    net.sendIntent(right);
    expect(ws.send).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(251);
    net.sendIntent(right);
    expect(ws.send).toHaveBeenCalledTimes(2);
    net.disconnect();
  });

  it("reconnects without replaying strikes and resends the same direction", async () => {
    const net = new WorldSocket(); await net.connect();
    Socket.instances[0].hello();
    net.sendIntent({ up: true, down: false, left: false, right: false });
    Socket.instances[0].close(1006);
    net.strike();
    expect(net.status).toBe("reconnecting");
    await vi.advanceTimersByTimeAsync(1000);
    expect(Socket.instances).toHaveLength(2);
    Socket.instances[1].hello();
    net.sendIntent({ up: true, down: false, left: false, right: false });
    expect(Socket.instances[1].send).toHaveBeenCalledTimes(1);
    expect(Socket.instances[1].send.mock.calls[0][0]).toContain('"intent"');
    net.disconnect();
  });

  it("does not fight another tab for ownership or reconnect after scene shutdown", async () => {
    const net = new WorldSocket(); await net.connect();
    Socket.instances[0].hello(); Socket.instances[0].close(4001);
    await vi.advanceTimersByTimeAsync(20000);
    expect(net.status).toBe("elsewhere");
    expect(Socket.instances).toHaveLength(1);
    net.disconnect();
    await vi.advanceTimersByTimeAsync(20000);
    expect(net.status).toBe("closed");
    expect(Socket.instances).toHaveLength(1);
  });
});
