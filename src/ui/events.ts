/**
 * The events strip: what the city is contesting right now. House war
 * windows, the Clearing contest and your ruin duel, each as a row with a
 * countdown. eventRows is pure so it can be tested; mountEvents renders.
 */
import type { Snap } from "../sim/protocol";
import type { Fourfold } from "../sim/types";
import { houseLabel, setClass, setText, show } from "./format";

export type EventTone = "ink" | "gold" | "hot" | "sky";
export type EventRow = {
  id: "war" | "war-next" | "contest" | "duel";
  tone: EventTone;
  label: string;
  detail: string;
  bar?: { keep: number; extract: number };
};

const NEXT_WAR_WINDOW = 300; // seconds before a war window that the strip starts counting down
const SITE_NAMES: Record<string, string> = { "clearing-ring": "the Clearing", "hot-street": "the hot street" };

/** m:ss for a countdown; never negative. */
export function countdown(seconds: number): string {
  const s = Math.max(0, Math.ceil(Number.isFinite(seconds) ? seconds : 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? "0" : ""}${r}`;
}

function leader(held: Record<Fourfold, number>): Fourfold | "" {
  let best: Fourfold | "" = "";
  let top = 0;
  for (const h of ["earth", "sky", "mortals", "divinities"] as const) {
    if (held[h] > top) { top = held[h]; best = h; }
  }
  return best;
}

function siteName(id: string): string {
  return SITE_NAMES[id] ?? id;
}

export function eventRows(snap: Pick<Snap, "now" | "houses" | "clearing" | "you" | "players">): EventRow[] {
  const rows: EventRow[] = [];
  const now = snap.now;
  const war = snap.houses.war;
  if (war.active) {
    const lead = leader(war.held);
    const who = lead ? `${houseLabel(lead)} holds` : "nobody holds";
    rows.push({ id: "war", tone: "hot", label: "HOUSE WAR", detail: `${siteName(war.site)} · ${who} · ${countdown(war.endsAt - now)}` });
  } else if (war.startsAt > now && war.startsAt - now <= NEXT_WAR_WINDOW) {
    rows.push({ id: "war-next", tone: "ink", label: "NEXT WAR", detail: `${siteName(war.site)} · ${countdown(war.startsAt - now)}` });
  }
  const contest = snap.clearing.contest;
  if (contest && contest.active) {
    const keep = Math.max(0, contest.keep);
    const extract = Math.max(0, contest.extract);
    rows.push({
      id: "contest",
      tone: "gold",
      label: "CLEARING CONTEST",
      detail: `KEEP ${keep} · EXTRACT ${extract} · ${snap.clearing.dwellers} in the ring · ${countdown(contest.endsAt - now)}`,
      bar: { keep, extract },
    });
  }
  const duel = snap.you.duel;
  if (duel && duel.until > now) {
    const other = snap.players.find((p) => p.id === duel.with);
    const name = other ? other.name : "an Angel";
    rows.push(duel.accepted
      ? { id: "duel", tone: "hot", label: "RUIN DUEL", detail: `${name} · the grave is the ring · ${countdown(duel.until - now)}` }
      : { id: "duel", tone: "sky", label: "RUIN DUEL OFFERED", detail: `${name} · F at the wreckage · ${countdown(duel.until - now)}` });
  }
  return rows;
}

export type EventsPanel = { set: (rows: EventRow[]) => void };

/** Renders rows into #hud-events; rebuilds only when the row set changes, updates text otherwise. */
export function mountEvents(root: HTMLElement | null): EventsPanel {
  if (!root) return { set: () => {} };
  let shape = "";
  const rowEls = new Map<string, { el: HTMLElement; detail: HTMLElement; keep: HTMLElement | null; extract: HTMLElement | null }>();
  return {
    set(rows) {
      const nextShape = rows.map((r) => r.id + ":" + r.tone + ":" + (r.bar ? "b" : "")).join("|");
      if (nextShape !== shape) {
        shape = nextShape;
        root.innerHTML = "";
        rowEls.clear();
        for (const r of rows) {
          const el = document.createElement("div");
          el.className = `event ${r.tone}`;
          const label = document.createElement("div");
          label.className = "event-label";
          label.textContent = r.label;
          const detail = document.createElement("div");
          detail.className = "event-detail";
          el.append(label, detail);
          let keep: HTMLElement | null = null;
          let extract: HTMLElement | null = null;
          if (r.bar) {
            const bar = document.createElement("div");
            bar.className = "event-bar";
            keep = document.createElement("div");
            keep.className = "event-bar-keep";
            extract = document.createElement("div");
            extract.className = "event-bar-extract";
            bar.append(keep, extract);
            el.append(bar);
          }
          root.append(el);
          rowEls.set(r.id, { el, detail, keep, extract });
        }
      }
      for (const r of rows) {
        const e = rowEls.get(r.id);
        if (!e) continue;
        setText(e.detail, r.detail);
        setClass(e.el, "live", true);
        if (r.bar && e.keep && e.extract) {
          const total = r.bar.keep + r.bar.extract || 1;
          e.keep.style.width = `${Math.round((r.bar.keep / total) * 100)}%`;
          e.extract.style.width = `${Math.round((r.bar.extract / total) * 100)}%`;
        }
      }
      show(root, rows.length > 0);
    },
  };
}
