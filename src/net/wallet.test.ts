import { describe, expect, it, vi } from "vitest";
import { discoverProviders, linkWallet, pickProvider, walletLine, type Announced } from "./wallet";

const info = (rdns: string, uuid = rdns) => ({ uuid, name: rdns, icon: "", rdns });
const ADDR = "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf";

function fakeWallet(rdns: string, requests: Record<string, unknown | Error>): Announced {
  return {
    info: info(rdns),
    provider: {
      request: vi.fn(async ({ method }: { method: string }) => {
        const r = requests[method];
        if (r instanceof Error) throw r;
        return r;
      }),
    },
  };
}

type Page = Window & { ethereum?: unknown };

/** A page where the given wallets answer the EIP-6963 request: an event target is all the handshake needs. */
function pageWith(...wallets: Announced[]): Page {
  const win = new EventTarget() as unknown as Page;
  win.addEventListener("eip6963:requestProvider", () => {
    for (const w of wallets) win.dispatchEvent(new CustomEvent("eip6963:announceProvider", { detail: w }));
  });
  return win;
}

const jsonResponse = (status: number, body: unknown) => ({ ok: status < 300, status, json: async () => body }) as unknown as Response;
const requestsOf = (w: Announced) => (w.provider.request as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0] as { method: string; params?: unknown[] });

describe("discovery", () => {
  it("collects announced providers once each and prefers a known wallet", async () => {
    const mm = fakeWallet("io.metamask", {});
    const other = fakeWallet("xyz.other", {});
    const list = await discoverProviders(pageWith(other, mm, mm), 10);
    expect(list.map(a => a.info.rdns)).toEqual(["xyz.other", "io.metamask"]);
    expect(pickProvider(list)?.info.rdns).toBe("io.metamask");
    expect(pickProvider([other])?.info.rdns).toBe("xyz.other");
    expect(pickProvider([])).toBeNull();
  });

  it("falls back to window.ethereum when nothing announces", async () => {
    const win = pageWith();
    win.ethereum = { request: vi.fn(async () => []) };
    const list = await discoverProviders(win, 10);
    expect(list.map(a => a.info.rdns)).toEqual(["window.ethereum"]);
    expect(await discoverProviders(pageWith(), 10)).toEqual([]);
  });
});

describe("the handshake", () => {
  it("signs the server's challenge as hex and reports the serial the server assigned", async () => {
    const wallet = fakeWallet("io.metamask", { eth_requestAccounts: [ADDR], personal_sign: "0xsig" });
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
      if (url === "/wallet/challenge") return jsonResponse(200, { message: "Reverie: The Game\nNonce: n1" });
      return jsonResponse(200, { ok: true, serial: 42 });
    });
    const out = await linkWallet(fetcher as unknown as typeof fetch, pageWith(wallet));
    expect(out).toEqual({ ok: true, address: ADDR.toLowerCase(), serial: 42 });
    const sign = requestsOf(wallet).find(c => c.method === "personal_sign")!;
    const hex = String(sign.params![0]);
    expect(hex).toMatch(/^0x[0-9a-f]+$/);
    expect(Buffer.from(hex.slice(2), "hex").toString("utf8")).toBe("Reverie: The Game\nNonce: n1");
    expect(sign.params![1]).toBe(ADDR);
    expect(calls.map(c => c.url)).toEqual(["/wallet/challenge", "/wallet/link"]);
    expect(JSON.parse(String(calls[1].init?.body))).toEqual({ address: ADDR, signature: "0xsig" });
    expect(walletLine(out)).toContain("#0042");
  });

  it("says why when there is no wallet, the wallet declines, the session is unknown or the signature fails", async () => {
    const none = vi.fn();
    expect(await linkWallet(none as unknown as typeof fetch, pageWith())).toEqual({ ok: false, reason: "no-wallet" });
    expect(none).not.toHaveBeenCalled();

    const declines = fakeWallet("io.metamask", { eth_requestAccounts: new Error("user rejected") });
    expect(await linkWallet(none as unknown as typeof fetch, pageWith(declines))).toEqual({ ok: false, reason: "rejected" });

    const signs = () => fakeWallet("io.metamask", { eth_requestAccounts: [ADDR], personal_sign: "0xsig" });
    const noSession = vi.fn(async () => jsonResponse(409, {}));
    expect(await linkWallet(noSession as unknown as typeof fetch, pageWith(signs()))).toEqual({ ok: false, reason: "no-session" });

    const bad = vi.fn(async (url: string) => (url === "/wallet/challenge" ? jsonResponse(200, { message: "m" }) : jsonResponse(403, { ok: false, reason: "bad-signature" })));
    const out = await linkWallet(bad as unknown as typeof fetch, pageWith(signs()));
    expect(out).toMatchObject({ ok: false, reason: "bad-signature" });
    expect(walletLine(out)).toContain("did not match");

    const noAngel = vi.fn(async (url: string) => (url === "/wallet/challenge" ? jsonResponse(200, { message: "m" }) : jsonResponse(200, { ok: true, serial: null })));
    const bound = await linkWallet(noAngel as unknown as typeof fetch, pageWith(signs()));
    expect(bound).toEqual({ ok: true, address: ADDR.toLowerCase(), serial: null });
    expect(walletLine(bound)).toContain("no Angel yet");

    const refuses = fakeWallet("io.metamask", { eth_requestAccounts: [ADDR], personal_sign: new Error("denied") });
    const challengeOnly = vi.fn(async () => jsonResponse(200, { message: "m" }));
    expect(await linkWallet(challengeOnly as unknown as typeof fetch, pageWith(refuses))).toEqual({ ok: false, reason: "rejected" });
  });
});
