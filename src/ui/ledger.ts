/**
 * The ledger: what you hold, what you have claimed, what the Grid lists.
 * ledgerModel is pure so it can be tested; mountLedger renders it into a
 * paper panel and reports clicks. Numbers are cold; nothing is promised.
 */
import type { Snap } from "../sim/protocol";
import type { Claim, Item, Listing } from "../sim/types";
import { BANK_FEE, CITY_SELLER, CLAIM_AMOUNT, CLAIM_CAP, LISTING_FEE } from "../sim/constants";
import { num, setText, show } from "./format";

export type ItemRow = { id: string; name: string; qty: number; note: string; listable: boolean };
export type ClaimRow = { id: string; label: string; amount: number; status: "hold" | "ready" | "settled"; detail: string };
/** `city`: a listing the city posted, a price to watch and never a sale; it has no button. */
export type ListingRow = { id: string; seller: string; item: string; price: number; mine: boolean; canBuy: boolean; city: boolean };

export type LedgerModel = {
  guest: boolean;
  purse: number;
  banked: number;
  spectator: string;
  cult: ItemRow[];
  exhibition: ItemRow[];
  paper: ItemRow[];
  claims: ClaimRow[];
  claimsLine: string;
  deskLine: string;
  listings: ListingRow[];
  marketLine: string;
};

const GUEST_LINE = "A period on a ledger. Guests cannot claim, list or buy.";

/** h:mm:ss for a hold; m:ss under an hour. */
export function holdClock(seconds: number): string {
  const s = Math.max(0, Math.ceil(Number.isFinite(seconds) ? seconds : 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = `${m < 10 && h > 0 ? "0" : ""}${m}:${r < 10 ? "0" : ""}${r}`;
  return h > 0 ? `${h}:${mm}` : mm;
}

function itemRow(i: Item): ItemRow {
  const note = i.kind === "cult" ? "cult · does not list" : i.kind === "exhibition" ? `value ${num(i.value)} · decays` : "paper · I uses";
  return { id: i.id, name: i.name, qty: i.qty, note, listable: i.kind === "exhibition" && !i.bound && i.qty > 0 };
}

export function claimRow(c: Claim, now: number): ClaimRow {
  if (c.settled) return { id: c.id, label: c.label, amount: c.amount, status: "settled", detail: "settled into the vault" };
  if (c.readyAt <= now) return { id: c.id, label: c.label, amount: c.amount, status: "ready", detail: "ready · Q at the desk takes it" };
  return { id: c.id, label: c.label, amount: c.amount, status: "hold", detail: `hold ${holdClock(c.readyAt - now)}` };
}

export function ledgerModel(snap: Pick<Snap, "now" | "you" | "market">): LedgerModel {
  const you = snap.you;
  const guest = you.guest;
  const items = you.items ?? [];
  const cult = items.filter((i) => i.kind === "cult").map(itemRow);
  const exhibition = items.filter((i) => i.kind === "exhibition").map(itemRow);
  const paper = items.filter((i) => i.kind === "paper").map(itemRow);
  const claims = (you.claims ?? []).map((c) => claimRow(c, snap.now));
  const filed = you.claimsFiled ?? 0;
  const claimsLine = guest ? GUEST_LINE : `${filed} of ${CLAIM_CAP} campaign claims filed · ${CLAIM_AMOUNT} each · a day's hold`;
  const deskLine = guest
    ? "The desk does not see a guest."
    : `F files a claim from the purse · E banks the purse (${Math.round(BANK_FEE * 100)}% fee) · Q takes a ready claim into the vault`;
  const listings: ListingRow[] = (snap.market ?? []).map((l: Listing) => {
    const city = l.sellerId === CITY_SELLER;
    return {
      id: l.id,
      seller: l.sellerName,
      item: `${l.item.name}${l.item.qty > 1 ? ` ×${l.item.qty}` : ""}`,
      price: l.price,
      mine: !city && l.sellerId === you.id,
      canBuy: !guest && !city && l.sellerId !== you.id && you.bestand >= l.price,
      city,
    };
  });
  const marketLine = guest ? "A stall of lights. You cannot afford a sky you cannot see." : `listing fee ${LISTING_FEE} · exhibition only · cult never lists`;
  return { guest, purse: you.bestand, banked: you.banked, spectator: guest ? GUEST_LINE : "", cult, exhibition, paper, claims, claimsLine, deskLine, listings, marketLine };
}

export type LedgerCallbacks = {
  market: (op: "list" | "buy" | "cancel", args: { itemId?: string; listingId?: string; price?: number }) => void;
};

export type LedgerPanel = { set: (model: LedgerModel) => void; toggle: () => void; open: (on: boolean) => void; isOpen: () => boolean };

function el(tag: string, cls: string, text = ""): HTMLElement {
  const e = document.createElement(tag);
  e.className = cls;
  if (text) e.textContent = text;
  return e;
}

/** Renders the ledger; rebuilds sections only when their row keys change. */
export function mountLedger(root: HTMLElement | null, cb: LedgerCallbacks): LedgerPanel {
  if (!root) return { set: () => {}, toggle: () => {}, open: () => {}, isOpen: () => false };
  let opened = false;
  let lastKey = "";
  const head = el("div", "ledger-head");
  const title = el("div", "ledger-title", "LEDGER");
  const totals = el("div", "ledger-totals");
  head.append(title, totals);
  const body = el("div", "ledger-body");
  root.append(head, body);
  show(root, false);

  function section(label: string, line: string): HTMLElement {
    const s = el("section", "ledger-section");
    s.append(el("div", "ledger-label", label));
    if (line) s.append(el("div", "ledger-line", line));
    return s;
  }

  function itemList(rows: ItemRow[], empty: string, listable: boolean): HTMLElement {
    const ul = el("div", "ledger-rows");
    if (!rows.length) { ul.append(el("div", "ledger-empty", empty)); return ul; }
    for (const r of rows) {
      const row = el("div", "ledger-row");
      row.append(el("span", "ledger-name", `${r.name}${r.qty > 1 ? ` ×${r.qty}` : ""}`), el("span", "ledger-note", r.note));
      if (listable && r.listable) {
        const price = document.createElement("input");
        price.type = "number"; price.min = "1"; price.max = "999"; price.value = "9"; price.className = "ledger-price"; price.setAttribute("aria-label", "price");
        const btn = el("button", "ledger-btn", "LIST") as HTMLButtonElement;
        btn.type = "button";
        btn.addEventListener("click", () => cb.market("list", { itemId: r.id, price: Math.max(1, Math.min(999, Number(price.value) || 1)) }));
        row.append(price, btn);
      }
      ul.append(row);
    }
    return ul;
  }

  return {
    set(m) {
      setText(totals, `PURSE ${num(m.purse)} · VAULT ${num(m.banked)}`);
      const key = [
        m.guest ? "g" : "a",
        m.cult.map((r) => r.id + r.qty).join(","),
        m.exhibition.map((r) => r.id + r.qty + r.note).join(","),
        m.paper.map((r) => r.id + r.qty).join(","),
        m.claims.map((r) => r.id + r.status).join(","),
        m.listings.map((r) => r.id + r.canBuy).join(","),
        m.purse >= 0 ? "" : "",
      ].join("|");
      if (key === lastKey) {
        // Only the clocks move between rebuilds.
        const clocks = body.querySelectorAll<HTMLElement>("[data-claim]");
        clocks.forEach((c) => {
          const row = m.claims.find((r) => r.id === c.dataset.claim);
          if (row) setText(c, row.detail);
        });
        return;
      }
      lastKey = key;
      body.innerHTML = "";
      if (m.guest) body.append(el("div", "ledger-spectator", m.spectator));

      const inv = section("HOLDINGS", "");
      inv.append(el("div", "ledger-sub", "CULT"), itemList(m.cult, "nothing placed", false));
      inv.append(el("div", "ledger-sub", "EXHIBITION"), itemList(m.exhibition, "nothing to show", !m.guest));
      inv.append(el("div", "ledger-sub", "PAPER"), itemList(m.paper, "no paper", false));
      body.append(inv);

      const claims = section("CLAIMS", m.claimsLine);
      const list = el("div", "ledger-rows");
      if (!m.claims.length) list.append(el("div", "ledger-empty", m.guest ? "" : "no claims filed"));
      for (const c of m.claims) {
        const row = el("div", `ledger-row claim ${c.status}`);
        row.append(el("span", "ledger-name", `${c.label} · ${num(c.amount)}`));
        const detail = el("span", "ledger-note", c.detail);
        detail.dataset.claim = c.id;
        row.append(detail);
        list.append(row);
      }
      claims.append(list, el("div", "ledger-line", m.deskLine));
      body.append(claims);

      const market = section("THE GRID", m.marketLine);
      const rows = el("div", "ledger-rows");
      if (!m.listings.length) rows.append(el("div", "ledger-empty", "nothing listed"));
      for (const l of m.listings) {
        const row = el("div", "ledger-row");
        row.append(el("span", "ledger-name", l.item), el("span", "ledger-note", `${l.seller} · ${num(l.price)}${l.city ? " · a price, not a sale" : ""}`));
        if (!l.city) {
          const btn = el("button", "ledger-btn", l.mine ? "CANCEL" : "BUY") as HTMLButtonElement;
          btn.type = "button";
          btn.disabled = !l.mine && !l.canBuy;
          btn.addEventListener("click", () => cb.market(l.mine ? "cancel" : "buy", { listingId: l.id }));
          row.append(btn);
        }
        rows.append(row);
      }
      market.append(rows);
      body.append(market);
    },
    toggle() { opened = !opened; show(root, opened); },
    open(on) { opened = on; show(root, opened); },
    isOpen: () => opened,
  };
}
