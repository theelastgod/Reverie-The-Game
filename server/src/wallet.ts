/**
 * Wallet login, disarmed. A personal_sign (EIP-191) over a server nonce proves
 * an address; the Angel serial for that address comes from a holders map in
 * the environment until the contract exists. Never a seed, never a chain call,
 * never a value. Pure functions; the Durable Object owns the nonce.
 */
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { ANGEL_SUPPLY } from "../../src/sim/constants.ts";

export const CHALLENGE_TTL_MS = 10 * 60 * 1000;
/** Base mainnet: where the Angels stand. The chain id is in the message so a wallet can show it; nothing is sent to it. */
export const CHAIN_ID = 8453;
const ADDRESS = /^0x[0-9a-fA-F]{40}$/;

export function isAddress(s: unknown): s is string {
  return typeof s === "string" && ADDRESS.test(s);
}

export const normalizeAddress = (a: string): string => a.toLowerCase();

/** What a challenge is bound to: the city's host and origin (from the request the object served) and the address that asked. */
export type ChallengeBinding = { domain: string; uri: string; address: string };

/**
 * The text a wallet signs, in the Sign-In with Ethereum shape (EIP-4361):
 * human-readable, single purpose, and bound to this city's domain, to the
 * signer's own address, to the chain and to one session by the nonce. A
 * wallet shows the domain and can warn when it is not the page asking; a
 * signature a stranger phished elsewhere names their site and their
 * address, and neither will match what the city rebuilds.
 */
export function challengeMessage(nonce: string, issuedAt: number, bind: ChallengeBinding): string {
  return [
    `${bind.domain} wants you to sign in with your Ethereum account:`,
    bind.address,
    "",
    "Reverie: The Game. Link an Angel to this session. This signature costs nothing and moves nothing.",
    "",
    `URI: ${bind.uri}`,
    "Version: 1",
    `Chain ID: ${CHAIN_ID}`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date(issuedAt).toISOString()}`,
    `Expiration Time: ${new Date(issuedAt + CHALLENGE_TTL_MS).toISOString()}`,
  ].join("\n");
}

function bytesOf(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function hexOf(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += b.toString(16).padStart(2, "0");
  return s;
}

/** keccak256 of "\x19Ethereum Signed Message:\n" + length + message: what personal_sign signs. */
export function personalMessageHash(message: string): Uint8Array {
  const body = new TextEncoder().encode(message);
  const prefix = new TextEncoder().encode(`\x19Ethereum Signed Message:\n${body.length}`);
  const all = new Uint8Array(prefix.length + body.length);
  all.set(prefix, 0);
  all.set(body, prefix.length);
  return keccak_256(all);
}

/** The address of a public key (65 bytes uncompressed, or 64 without the prefix). */
export function addressOfPublicKey(pub: Uint8Array): string {
  const body = pub.length === 65 ? pub.subarray(1) : pub;
  return "0x" + hexOf(keccak_256(body).subarray(12));
}

/** The lowercase address that produced a 65-byte r||s||v personal_sign signature over the message, or null. */
export function recoverAddress(message: string, signature: unknown): string | null {
  if (typeof signature !== "string") return null;
  const hex = signature.startsWith("0x") ? signature.slice(2) : signature;
  if (!/^[0-9a-fA-F]{130}$/.test(hex)) return null;
  const bytes = bytesOf(hex);
  let v = bytes[64];
  if (v >= 27) v -= 27;
  if (v !== 0 && v !== 1) return null;
  try {
    const sig = secp256k1.Signature.fromBytes(bytes.subarray(0, 64), "compact").addRecoveryBit(v);
    const pub = sig.recoverPublicKey(personalMessageHash(message)).toBytes(false);
    return addressOfPublicKey(pub);
  } catch {
    return null;
  }
}

/** The holders map from the environment: lowercase address → serial inside the supply. Malformed entries are dropped. */
export function parseHolders(json: string | undefined): Map<string, number> {
  const out = new Map<string, number>();
  if (!json) return out;
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return out;
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!isAddress(k) || typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > ANGEL_SUPPLY) continue;
    out.set(normalizeAddress(k), v);
  }
  return out;
}
