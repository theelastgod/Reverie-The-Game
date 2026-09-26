import { describe, expect, it } from "vitest";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { addressOfPublicKey, CHAIN_ID, CHALLENGE_TTL_MS, challengeMessage, isAddress, parseHolders, personalMessageHash, recoverAddress } from "./wallet";
import { ANGEL_SUPPLY } from "../../src/sim/constants";

const hex = (b: Uint8Array) => [...b].map(x => x.toString(16).padStart(2, "0")).join("");
const key = (n: number): Uint8Array => { const k = new Uint8Array(32); k[31] = n; return k; };
const BIND = { domain: "game.example", uri: "https://game.example", address: "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf" };

/** What a wallet returns from personal_sign: r||s||v with v in {27, 28}. */
function ethSign(message: string, priv: Uint8Array): string {
  const compact = secp256k1.sign(personalMessageHash(message), priv, { prehash: false });
  const address = addressOfPublicKey(secp256k1.getPublicKey(priv, false));
  for (const v of [27, 28]) {
    const sig = "0x" + hex(compact) + v.toString(16);
    if (recoverAddress(message, sig) === address) return sig;
  }
  throw new Error("no recovery bit matched");
}

describe("wallet proofs", () => {
  it("derives the well-known address of secret key 1", () => {
    expect(addressOfPublicKey(secp256k1.getPublicKey(key(1), false))).toBe("0x7e5f4552091a69125d5dfcb7b8c2659029395bdf");
  });

  it("binds the challenge to the city's domain, the signer's address, the chain, the nonce and a window", () => {
    const at = 1_700_000_000_000;
    const message = challengeMessage("nonce-1", at, BIND);
    const lines = message.split("\n");
    expect(lines[0]).toBe("game.example wants you to sign in with your Ethereum account:");
    expect(lines[1]).toBe(BIND.address);
    expect(message).toContain("costs nothing and moves nothing");
    expect(message).toContain("URI: https://game.example");
    expect(message).toContain(`Chain ID: ${CHAIN_ID}`);
    expect(message).toContain("Nonce: nonce-1");
    expect(message).toContain(`Issued At: ${new Date(at).toISOString()}`);
    expect(message).toContain(`Expiration Time: ${new Date(at + CHALLENGE_TTL_MS).toISOString()}`);
    // another site, another address or another nonce is another message
    expect(challengeMessage("nonce-1", at, { ...BIND, domain: "phish.example", uri: "https://phish.example" })).not.toBe(message);
    expect(challengeMessage("nonce-1", at, { ...BIND, address: "0x0000000000000000000000000000000000000001" })).not.toBe(message);
    expect(challengeMessage("nonce-2", at, BIND)).not.toBe(message);
  });

  it("recovers the signer of a personal_sign over the challenge and rejects everything else", () => {
    const priv = key(7);
    const address = addressOfPublicKey(secp256k1.getPublicKey(priv, false));
    const message = challengeMessage("nonce-1", 1_700_000_000_000, { ...BIND, address });
    const sig = ethSign(message, priv);
    expect(recoverAddress(message, sig)).toBe(address);
    expect(recoverAddress(message, sig.replace(/^0x/, ""))).toBe(address);
    expect(recoverAddress(challengeMessage("nonce-2", 1_700_000_000_000, { ...BIND, address }), sig)).not.toBe(address);
    expect(recoverAddress(challengeMessage("nonce-1", 1_700_000_000_000, { ...BIND, address, domain: "phish.example" }), sig), "a signature over another site's text").not.toBe(address);
    expect(recoverAddress(message, sig.slice(0, -2) + "1c1b")).toBeNull();
    expect(recoverAddress(message, sig.slice(0, -2) + "05")).toBeNull();
    expect(recoverAddress(message, "0x" + "00".repeat(65))).toBeNull();
    expect(recoverAddress(message, 42)).toBeNull();
    expect(recoverAddress(message, "")).toBeNull();
  });

  it("hashes with the EIP-191 prefix and the byte length, not the character count", () => {
    const ascii = personalMessageHash("hello");
    expect(hex(ascii)).toBe("50b2c43fd39106bafbba0da34fc430e1f91e3c96ea2acee2bc34119f92b37750");
    expect(hex(personalMessageHash("hé"))).not.toBe(hex(personalMessageHash("he")));
  });

  it("reads the holders map and drops anything that is not an address with a serial in the supply", () => {
    const m = parseHolders(JSON.stringify({
      "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf": 42,
      "0x0000000000000000000000000000000000000001": ANGEL_SUPPLY,
      "0x0000000000000000000000000000000000000002": 0,
      "0x0000000000000000000000000000000000000003": ANGEL_SUPPLY + 1,
      "0x0000000000000000000000000000000000000004": "7",
      "not an address": 5,
    }));
    expect([...m.entries()]).toEqual([
      ["0x7e5f4552091a69125d5dfcb7b8c2659029395bdf", 42],
      ["0x0000000000000000000000000000000000000001", ANGEL_SUPPLY],
    ]);
    expect(parseHolders(undefined).size).toBe(0);
    expect(parseHolders("nope").size).toBe(0);
    expect(parseHolders("[1,2]").size).toBe(0);
    expect(isAddress("0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf")).toBe(true);
    expect(isAddress("0x7E5F")).toBe(false);
  });
});
