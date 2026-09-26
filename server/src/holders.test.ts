import { describe, expect, it, vi } from "vitest";
import { ANGEL_SUPPLY } from "../../src/sim/constants";
import { CACHE_MAX, CACHE_TTL_MS, SELECTOR_BALANCE_OF, SELECTOR_TOKEN_OF_OWNER_BY_INDEX, decodeUint, encodeCall, serialFor, serialFromChain, type HolderCache, type HoldersEnv } from "./holders";

const ADDR = "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf";
const LOWER = ADDR.toLowerCase();
const CONTRACT = "0x00000000000000000000000000000000000000a1";
const ENV: HoldersEnv = { ANGEL_CONTRACT: CONTRACT, ANGEL_RPC_URL: "https://rpc.example/v1" };
const hexWord = (n: bigint) => "0x" + n.toString(16).padStart(64, "0");

/** An RPC double: answers balanceOf and tokenOfOwnerByIndex by calldata prefix, records what it was asked. */
function rpc(balance: bigint | "0x" | "error" | "down", token: bigint | "0x" = 0n) {
  const calls: { to: string; data: string }[] = [];
  const fetcher = vi.fn(async (_url: string, init?: RequestInit) => {
    const req = JSON.parse(String(init?.body)) as { params: [{ to: string; data: string }] };
    calls.push(req.params[0]);
    const data = req.params[0].data;
    if (balance === "down") return { ok: false, status: 502, json: async () => ({}) } as unknown as Response;
    if (balance === "error") return { ok: true, status: 200, json: async () => ({ jsonrpc: "2.0", id: 1, error: { code: -32000, message: "execution reverted" } }) } as unknown as Response;
    const result = data.startsWith(SELECTOR_BALANCE_OF) ? (balance === "0x" ? "0x" : hexWord(balance)) : (token === "0x" ? "0x" : hexWord(token));
    return { ok: true, status: 200, json: async () => ({ jsonrpc: "2.0", id: 1, result }) } as unknown as Response;
  });
  return { fetcher, calls };
}

describe("ABI words", () => {
  it("encodes both calls exactly and decodes a word", () => {
    expect(encodeCall(SELECTOR_BALANCE_OF, ADDR)).toBe("0x70a08231" + "0".repeat(24) + LOWER.slice(2));
    expect(encodeCall(SELECTOR_TOKEN_OF_OWNER_BY_INDEX, ADDR, 0n)).toBe("0x2f745c59" + "0".repeat(24) + LOWER.slice(2) + "0".repeat(64));
    expect(encodeCall(SELECTOR_TOKEN_OF_OWNER_BY_INDEX, ADDR, 255n)).toMatch(/00ff$/);
    expect(decodeUint(hexWord(42n))).toBe(42n);
    expect(decodeUint("0x2a")).toBe(42n);
    expect(decodeUint("0x")).toBeNull();
    expect(decodeUint("0xzz")).toBeNull();
    expect(decodeUint("0x" + "f".repeat(65))).toBeNull();
    expect(decodeUint(42)).toBeNull();
  });
});

describe("serialFromChain", () => {
  it("is null without a configured chain and never calls out", async () => {
    const { fetcher } = rpc(1n, 41n);
    expect(await serialFromChain(ADDR, {}, fetcher, 0, new Map())).toBeNull();
    expect(await serialFromChain(ADDR, { ANGEL_CONTRACT: "nope", ANGEL_RPC_URL: "https://rpc" }, fetcher, 0, new Map())).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("reads a balance of zero as no Angel and caches it", async () => {
    const { fetcher, calls } = rpc(0n);
    const cache: HolderCache = new Map();
    expect(await serialFromChain(ADDR, ENV, fetcher, 1000, cache)).toBeNull();
    expect(calls).toEqual([{ to: CONTRACT, data: encodeCall(SELECTOR_BALANCE_OF, LOWER) }]);
    expect(cache.get(LOWER)).toEqual({ serial: null, at: 1000 });
  });

  it("reads the first token as the serial, with the offset, inside the supply", async () => {
    expect(await serialFromChain(ADDR, ENV, rpc(2n, 41n).fetcher, 0, new Map())).toBe(41);
    expect(await serialFromChain(ADDR, { ...ENV, ANGEL_TOKEN_OFFSET: "1" }, rpc(1n, 41n).fetcher, 0, new Map())).toBe(42);
    expect(await serialFromChain(ADDR, { ...ENV, ANGEL_TOKEN_OFFSET: "1" }, rpc(1n, 0n).fetcher, 0, new Map())).toBe(1);
    expect(await serialFromChain(ADDR, ENV, rpc(1n, 0n).fetcher, 0, new Map())).toBeNull();
    expect(await serialFromChain(ADDR, ENV, rpc(1n, BigInt(ANGEL_SUPPLY + 1)).fetcher, 0, new Map())).toBeNull();
    expect(await serialFromChain(ADDR, ENV, rpc(1n, "0x").fetcher, 0, new Map())).toBeNull();
    const { calls } = rpc(1n, 41n);
    expect(calls.length).toBe(0);
  });

  it("answers from the cache for five minutes, then asks again", async () => {
    const { fetcher } = rpc(1n, 41n);
    const cache: HolderCache = new Map();
    expect(await serialFromChain(ADDR, ENV, fetcher, 0, cache)).toBe(41);
    expect(await serialFromChain(LOWER, ENV, fetcher, CACHE_TTL_MS - 1, cache)).toBe(41);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(await serialFromChain(ADDR, ENV, fetcher, CACHE_TTL_MS, cache)).toBe(41);
    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it("keeps at most a thousand addresses, forgetting the oldest", async () => {
    const cache: HolderCache = new Map();
    for (let i = 0; i < CACHE_MAX + 1; i++) {
      const a = "0x" + i.toString(16).padStart(40, "0");
      await serialFromChain(a, ENV, rpc(0n).fetcher, i, cache);
    }
    expect(cache.size).toBe(CACHE_MAX);
    expect(cache.has("0x" + "0".repeat(40))).toBe(false);
    expect(cache.has("0x" + (CACHE_MAX).toString(16).padStart(40, "0"))).toBe(true);
  });

  it("reports an unreadable chain as unknown and caches nothing", async () => {
    for (const bad of ["down", "error"] as const) {
      const cache: HolderCache = new Map();
      expect(await serialFromChain(ADDR, ENV, rpc(bad).fetcher, 0, cache)).toBeUndefined();
      expect(cache.size).toBe(0);
    }
    const throwing = vi.fn(async () => { throw new Error("dns"); });
    expect(await serialFromChain(ADDR, ENV, throwing as never, 0, new Map())).toBeUndefined();
    const junk = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ jsonrpc: "2.0", id: 1, result: "0xzz" }) }) as unknown as Response);
    expect(await serialFromChain(ADDR, ENV, junk as never, 0, new Map())).toBeUndefined();
    const nothing = vi.fn(async () => ({ ok: true, status: 200, json: async () => null }) as unknown as Response);
    expect(await serialFromChain(ADDR, ENV, nothing as never, 0, new Map())).toBeUndefined();
  });
});

describe("serialFor", () => {
  it("lets the holders map win, then the chain, then nothing", async () => {
    const map = JSON.stringify({ [ADDR]: 7 });
    const { fetcher } = rpc(1n, 41n);
    expect(await serialFor(ADDR, { ...ENV, ANGEL_HOLDERS: map }, fetcher, 0, new Map())).toBe(7);
    expect(fetcher).not.toHaveBeenCalled();
    expect(await serialFor(ADDR, ENV, fetcher, 0, new Map())).toBe(41);
    expect(await serialFor(ADDR, { ANGEL_HOLDERS: map }, fetcher, 0, new Map())).toBe(7);
    expect(await serialFor("0x" + "1".repeat(40), { ANGEL_HOLDERS: map }, fetcher, 0, new Map())).toBeNull();
    expect(await serialFor(ADDR, { ...ENV, ANGEL_HOLDERS: "{}" }, rpc("down").fetcher, 0, new Map())).toBeUndefined();
  });
});
