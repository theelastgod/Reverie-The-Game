/**
 * Wallet login, client side. EIP-6963 discovers the injected wallets (with
 * window.ethereum as the fallback); the chosen wallet signs a server challenge
 * with personal_sign; the server answers with the outcome. Never a seed, never
 * a transaction, never a chain call from the page.
 */
export type Eip1193 = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
export type ProviderInfo = { uuid: string; name: string; icon: string; rdns: string };
export type Announced = { info: ProviderInfo; provider: Eip1193 };

export type WalletReason = "no-wallet" | "rejected" | "no-session" | "bad-signature" | "disarmed" | "chain" | "network";
export type WalletOutcome =
  | { ok: true; address: string; serial: number | null }
  | { ok: false; reason: WalletReason; detail?: string };

const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const PREFERRED = ["io.metamask", "com.coinbase.wallet", "io.rabby", "app.phantom"];

type WindowWithEthereum = Window & { ethereum?: Eip1193 };

/** Asks the page for EIP-6963 providers and resolves after a short window with whatever announced itself. */
export function discoverProviders(win: Window = window, waitMs = 250): Promise<Announced[]> {
  return new Promise(resolve => {
    const found: Announced[] = [];
    const onAnnounce = (ev: Event) => {
      const d = (ev as CustomEvent<Announced>).detail;
      if (d?.provider && d.info?.uuid && !found.some(f => f.info.uuid === d.info.uuid)) found.push(d);
    };
    win.addEventListener("eip6963:announceProvider", onAnnounce);
    win.dispatchEvent(new Event("eip6963:requestProvider"));
    setTimeout(() => {
      win.removeEventListener("eip6963:announceProvider", onAnnounce);
      const legacy = (win as WindowWithEthereum).ethereum;
      if (!found.length && legacy && typeof legacy.request === "function") {
        found.push({ info: { uuid: "legacy", name: "Injected wallet", icon: "", rdns: "window.ethereum" }, provider: legacy });
      }
      resolve(found);
    }, waitMs);
  });
}

/** A known wallet first when several announce; otherwise the first to answer. */
export function pickProvider(list: Announced[], prefer: string[] = PREFERRED): Announced | null {
  for (const rdns of prefer) {
    const hit = list.find(a => a.info.rdns === rdns);
    if (hit) return hit;
  }
  return list[0] ?? null;
}

const utf8Hex = (s: string): string => "0x" + [...new TextEncoder().encode(s)].map(b => b.toString(16).padStart(2, "0")).join("");

/**
 * The whole handshake: pick a wallet, ask for an account, fetch the challenge,
 * sign it, send the signature. Every failure is a reason the lock panel can say.
 */
export async function linkWallet(fetcher: typeof fetch = (...a) => fetch(...a), win: Window = window): Promise<WalletOutcome> {
  const chosen = pickProvider(await discoverProviders(win));
  if (!chosen) return { ok: false, reason: "no-wallet" };

  let address = "";
  try {
    const accounts = await chosen.provider.request({ method: "eth_requestAccounts" });
    address = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : "";
  } catch {
    return { ok: false, reason: "rejected" };
  }
  if (!ADDRESS.test(address)) return { ok: false, reason: "rejected" };

  // The challenge is issued for this address and names the city's domain, so the wallet shows both and a signature phished elsewhere is worthless here.
  let message = "";
  try {
    const r = await fetcher("/wallet/challenge", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    if (r.status === 409) return { ok: false, reason: "no-session" };
    if (!r.ok) return { ok: false, reason: "network", detail: String(r.status) };
    message = ((await r.json()) as { message?: string }).message ?? "";
  } catch {
    return { ok: false, reason: "network" };
  }
  if (!message) return { ok: false, reason: "network" };

  let signature = "";
  try {
    signature = String(await chosen.provider.request({ method: "personal_sign", params: [utf8Hex(message), address] }));
  } catch {
    return { ok: false, reason: "rejected" };
  }

  try {
    const r = await fetcher("/wallet/link", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, signature }),
    });
    const body = (await r.json().catch(() => ({}))) as { ok?: boolean; serial?: number | null; reason?: string };
    if (r.ok && body.ok) return { ok: true, address: address.toLowerCase(), serial: typeof body.serial === "number" ? body.serial : null };
    const reason: WalletReason = body.reason === "bad-signature" || body.reason === "no-session" || body.reason === "disarmed" || body.reason === "chain" ? body.reason : "network";
    return { ok: false, reason, detail: body.reason ?? String(r.status) };
  } catch {
    return { ok: false, reason: "network" };
  }
}

/** One line for the lock panel, in the city's register. */
export function walletLine(o: WalletOutcome): string {
  if (o.ok) {
    return o.serial === null
      ? `This wallet holds no Angel yet. The city keeps ${short(o.address)}. You remain a guest.`
      : `Sealed. Angel #${String(o.serial).padStart(4, "0")} walks in ${short(o.address)}.`;
  }
  switch (o.reason) {
    case "no-wallet": return "No wallet answered. Install one that speaks EIP-6963, then try again.";
    case "rejected": return "The wallet declined. Nothing was signed.";
    case "no-session": return "The city cannot see this session. Enter the city first.";
    case "bad-signature": return "The signature did not match the address. Nothing changed.";
    case "disarmed": return "The link is disarmed on this city. Nothing changed.";
    case "chain": return "The chain did not answer, so the city could not read the Angel. Nothing changed. Try again in a minute.";
    default: return "The desk did not answer. Try again in a moment.";
  }
}

export const short = (address: string): string => `${address.slice(0, 6)}…${address.slice(-4)}`;
