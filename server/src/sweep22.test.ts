// The player-defect sweep, round twenty-two (2026-10-12): what the session fuzzer (sessionFuzz.test.ts) found, each case one finding.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { serializeWorld } from "./index";
import { emptyWorld, spawnGuest } from "../../src/sim/world";
import { MOCK_SIG, TEST_SERIAL } from "../../src/sim/constants";
import { LINES } from "../../src/sim/content";
import { makeEnv, priv, type Sock } from "./sessionFuzz.test";
import type { Player } from "../../src/sim/types";

beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(1_000_000); });
afterEach(() => { vi.useRealTimers(); });

const A = "12345678-1234-4123-8123-123456789abc";
const B = "22345678-1234-4123-8123-123456789abc";
const claim = { id: "claim:a:1", label: "Claim 1", amount: 10, filedAt: 0, readyAt: 0, settled: false };
const angel = (id: string, extra: Partial<Player> = {}): Player =>
  ({ ...spawnGuest(id), guest: false, serial: TEST_SERIAL, name: "#7777", flags: { angel: 1 }, ...extra });

describe("an Angel unsealed at its join holds its claims off the guest", () => {
  it("the unsealed guest holds no claim and is sent none; its claims wait for its next link", async () => {
    const env = makeEnv();
    env.data.set("world:v2", serializeWorld(emptyWorld()));
    // A's saved Angel filed a claim; the serial's index names B (a newer link), so A comes back unsealed
    env.data.set(`player:v2:${A}`, angel("a", { claims: [claim], claimsFiled: 1 }));
    env.data.set(`serial:v2:${TEST_SERIAL}`, B);
    const o = await env.make();
    const ws = env.sock(A);
    const hello = await o.join(A, ws as never);
    expect(hello).toMatchObject({ guest: true });
    const body = priv(o).w.players.get(hello!.id)!;
    expect(body).toMatchObject({ guest: true, serial: null, locked: true });
    expect(body.claims, "a guest holds no claims (AGENTS.md)").toEqual([]);
    const sent = ws.frames.map(f => JSON.parse(f)).find(f => f.t === "slow" && f.youSlow);
    expect(sent?.youSlow.claims ?? []).toEqual([]);
    expect(sent?.youSlow.parkedClaims).toBeUndefined(); // held off the wire
    // and a link seals it again with its claims back
    await o.webSocketMessage(ws as never, JSON.stringify({ t: "link", serial: 42, sig: MOCK_SIG }));
    await o.alarm();
    const linked = priv(o).w.players.get(hello!.id)!;
    expect(linked.guest).toBe(false);
    expect(linked.claims.map(c => c.id)).toEqual([claim.id]);
  });
});

describe("the sweep takes a swept guest's wallet challenge with it", () => {
  it("challenge:v1:<token> goes with the token's body and stamp", async () => {
    const env = makeEnv();
    env.data.set("world:v2", serializeWorld(emptyWorld()));
    const o = await env.make();
    const ws = env.sock(A);
    await o.join(A, ws as never);
    const res = await o.fetch(new Request("https://game.example/wallet/challenge", {
      method: "POST", headers: { Origin: "https://game.example", Cookie: `reverie_session=${A}`, "Content-Type": "application/json" },
      body: JSON.stringify({ address: "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf" }),
    }));
    expect(res.status).toBe(200);
    ws.closing = true; env.open.delete(ws);
    await o.webSocketClose(ws as never);
    // another session keeps the alarm going; 31 days pass
    const keeper = env.sock(B);
    await o.join(B, keeper as never);
    vi.setSystemTime(1_000_000 + 31 * 86_400_000);
    await o.alarm();
    expect(env.data.has(`player:v2:${A}`)).toBe(false); // swept
    expect(env.data.has(`seen:v2:${A}`)).toBe(false);
    expect(env.data.has(`challenge:v1:${A}`), "swept with the body").toBe(false);
  });
});

describe("a hibernation restore handed two sockets of one token (if the runtime ever does)", () => {
  it("the stale one's close leaves the body with the live one", async () => {
    const env = makeEnv();
    const w = emptyWorld();
    env.data.set("world:v2", serializeWorld(w));
    env.data.set(`player:v2:${A}`, { ...spawnGuest("a") });
    const stale = env.sock(A); stale.attachment = { id: "a", token: A };
    const live = env.sock(A); live.attachment = { id: "a", token: A };
    env.open.add(stale); env.open.add(live);
    const o = await env.make();
    expect([...priv(o).sessions.values()].filter(s => s.id === "a")).toHaveLength(2);
    (stale as Sock).closing = true; env.open.delete(stale);
    await o.webSocketClose(stale as never, 4001, "");
    expect(priv(o).sessions.get(live)?.id).toBe("a");
    expect(priv(o).w.players.has("a"), "the live socket keeps its body").toBe(true);
  });
});
