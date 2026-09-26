/**
 * Angel serials from the chain, disarmed. When a contract and an RPC are
 * configured, the Worker reads ownership with two eth_calls (ERC-721
 * Enumerable: balanceOf, then tokenOfOwnerByIndex) and remembers the answer
 * for five minutes per address. The holders map in the environment wins for
 * test serials. Nothing here signs, sends or settles anything.
 */
import { ANGEL_SUPPLY } from "../../src/sim/constants.ts";
import { isAddress, normalizeAddress, parseHolders } from "./wallet.ts";

export const CACHE_TTL_MS = 5 * 60 * 1000;
export const CACHE_MAX = 1000;
export const SELECTOR_BALANCE_OF = "0x70a08231";
export const SELECTOR_TOKEN_OF_OWNER_BY_INDEX = "0x2f745c59";

export type HoldersEnv = {
  ANGEL_HOLDERS?: string; // JSON { "0xaddress": serial }: test serials, and the only source until the contract exists
  ANGEL_CONTRACT?: string; // the ERC-721's address
  ANGEL_RPC_URL?: string; // a JSON-RPC endpoint the Worker may call
  ANGEL_TOKEN_OFFSET?: string; // serial = tokenId + offset; "0" when token ids start at 1
};
export type HolderCache = Map<string, { serial: number | null; at: number }>;
export type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

const word = (hex: string): string => hex.replace(/^0x/, "").toLowerCase().padStart(64, "0");

/** selector + address word (+ index word): the calldata of the two calls. */
export function encodeCall(selector: string, address: string, index?: bigint): string {
  let data = selector + word(address);
  if (index !== undefined) data += index.toString(16).padStart(64, "0");
  return data;
}

/** One 32-byte unsigned word, or null when the hex is not one. */
export function decodeUint(hex: unknown): bigint | null {
  if (typeof hex !== "string") return null;
  const h = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (!/^[0-9a-fA-F]{1,64}$/.test(h)) return null;
  return BigInt("0x" + h);
}

export const chainConfigured = (env: HoldersEnv): boolean => isAddress(env.ANGEL_CONTRACT) && typeof env.ANGEL_RPC_URL === "string" && env.ANGEL_RPC_URL.length > 0;

/** An eth_call as a word: null for an empty `0x` (no code, or a revert without data), undefined for anything wrong. */
async function callWord(env: HoldersEnv, data: string, fetcher: Fetcher, id: number): Promise<bigint | null | undefined> {
  const res = await fetcher(env.ANGEL_RPC_URL as string, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method: "eth_call", params: [{ to: env.ANGEL_CONTRACT, data }, "latest"] }),
  });
  if (!res.ok) return undefined;
  const body = (await res.json()) as { result?: unknown; error?: unknown } | null;
  if (!body || typeof body !== "object" || body.error !== undefined || typeof body.result !== "string") return undefined;
  if (body.result === "0x") return null;
  return decodeUint(body.result) ?? undefined;
}

function remember(cache: HolderCache, key: string, serial: number | null, at: number): void {
  if (!cache.has(key) && cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.delete(key);
  cache.set(key, { serial, at });
}

/**
 * The serial the chain says this address holds: a number, null when it holds
 * none (or the token maps outside the supply), undefined when the chain could
 * not be read. Only definite answers are cached.
 */
export async function serialFromChain(address: string, env: HoldersEnv, fetcher: Fetcher, nowMs: number, cache: HolderCache): Promise<number | null | undefined> {
  if (!chainConfigured(env)) return null;
  const key = normalizeAddress(address);
  const hit = cache.get(key);
  if (hit && nowMs - hit.at < CACHE_TTL_MS) return hit.serial;
  try {
    const balance = await callWord(env, encodeCall(SELECTOR_BALANCE_OF, key), fetcher, 1);
    if (balance === undefined) return undefined;
    let serial: number | null = null;
    if (balance !== null && balance > 0n) {
      const token = await callWord(env, encodeCall(SELECTOR_TOKEN_OF_OWNER_BY_INDEX, key, 0n), fetcher, 2);
      if (token === undefined) return undefined;
      if (token !== null) {
        const offset = BigInt(Number.parseInt(env.ANGEL_TOKEN_OFFSET ?? "0", 10) || 0);
        const s = token + offset;
        serial = s >= 1n && s <= BigInt(ANGEL_SUPPLY) ? Number(s) : null;
      }
    }
    remember(cache, key, serial, nowMs);
    return serial;
  } catch {
    return undefined;
  }
}

/** The map wins; then the chain when configured; otherwise no Angel. */
export async function serialFor(address: string, env: HoldersEnv, fetcher: Fetcher, nowMs: number, cache: HolderCache): Promise<number | null | undefined> {
  const key = normalizeAddress(address);
  const mapped = parseHolders(env.ANGEL_HOLDERS).get(key);
  if (mapped !== undefined) return mapped;
  if (!chainConfigured(env)) return null;
  return serialFromChain(key, env, fetcher, nowMs, cache);
}
