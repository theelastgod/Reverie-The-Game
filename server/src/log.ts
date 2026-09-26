/**
 * The writeback log's events: what changed between two world states that is
 * worth remembering outside the checkpoint. Pure. Names are the public ones
 * (a serial's name or GUEST); no session token or internal id ever leaves
 * the object through here.
 */
import type { Player, WorldState } from "../../src/sim/types.ts";
import { F } from "../../src/sim/content/ids.ts";

export type LogKind = "link" | "wallet" | "under" | "burial" | "claim.filed" | "claim.settled" | "passing" | "credits" | "news";
export type LogEvent = {
  at: number; // wall clock, ms
  worldNow: number; // the world's clock, seconds
  kind: LogKind;
  player: string; // public name, or "" for a world event without a body
  serial: number | null;
  detail: Record<string, unknown>;
};

/** The kinds the public read route serves. Claims and wallets stay in the table only. */
export const PUBLIC_LOG_KINDS: readonly LogKind[] = ["passing", "news", "burial", "link"];

const flag = (p: Player, key: string): number => p.flags[key] ?? 0;

function playerEvents(prev: Player, next: Player, at: number, worldNow: number): LogEvent[] {
  const out: LogEvent[] = [];
  const ev = (kind: LogKind, detail: Record<string, unknown>): LogEvent => ({ at, worldNow, kind, player: next.name, serial: next.serial, detail });
  if (prev.guest && !next.guest) out.push(ev("link", { serial: next.serial }));
  if (next.wallet && next.wallet !== prev.wallet) out.push(ev("wallet", { address: next.wallet }));
  if (flag(next, F.UNDER) > 0 && flag(prev, F.UNDER) === 0) out.push(ev("under", {}));
  if (next.history.buried > prev.history.buried) out.push(ev("burial", { count: next.history.buried - prev.history.buried }));
  const before = new Map(prev.claims.map(c => [c.id, c]));
  for (const c of next.claims) {
    const was = before.get(c.id);
    if (!was) out.push(ev("claim.filed", { id: c.id, amount: c.amount }));
    else if (c.settled && !was.settled) out.push(ev("claim.settled", { id: c.id, amount: c.amount }));
  }
  if (flag(next, F.CREDITS) > 0 && flag(prev, F.CREDITS) === 0) out.push(ev("credits", {}));
  return out;
}

/** Everything that happened between two world states, in the order the bodies appear. */
export function logEventsFor(prev: WorldState, next: WorldState, at: number): LogEvent[] {
  const out: LogEvent[] = [];
  const worldNow = next.now;
  for (const [id, p] of next.players) {
    const was = prev.players.get(id);
    if (was) out.push(...playerEvents(was, p, at, worldNow));
  }
  if (next.passing.count > prev.passing.count) {
    const by = next.players.get(next.passing.lastBy);
    out.push({
      at, worldNow, kind: "passing",
      player: by?.name ?? "",
      serial: by?.serial ?? null,
      detail: { outcome: next.passing.lastOutcome, hijackedBy: next.passing.hijackedBy, count: next.passing.count },
    });
  }
  const seen = new Set(prev.news.map(n => `${n.at}|${n.text}`));
  for (const n of next.news) {
    if (seen.has(`${n.at}|${n.text}`)) continue;
    out.push({ at, worldNow, kind: "news", player: "", serial: null, detail: { text: n.text, at: n.at } });
  }
  return out;
}
