import { describe, expect, it, vi } from "vitest";
import { ago, logLines, mountCityLog } from "../../site/log.js";

const NOW = 1_760_000_000_000;
const news = (text: string, agoMs: number, over: Record<string, unknown> = {}) => ({ at: NOW - agoMs, worldNow: 0, kind: "news", player: "", serial: null, detail: { text }, ...over });

describe("the city's log on the landing page", () => {
  it("says how long ago in plain words", () => {
    expect(ago(NOW, NOW)).toBe("just now");
    expect(ago(NOW - 44_000, NOW)).toBe("just now");
    expect(ago(NOW - 70_000, NOW)).toBe("a minute ago");
    expect(ago(NOW - 5 * 60_000, NOW)).toBe("5 minutes ago");
    expect(ago(NOW - 61 * 60_000, NOW)).toBe("an hour ago");
    expect(ago(NOW - 5 * 3_600_000, NOW)).toBe("5 hours ago");
    expect(ago(NOW - 26 * 3_600_000, NOW)).toBe("a day ago");
    expect(ago(NOW - 3 * 86_400_000, NOW)).toBe("3 days ago");
    expect(ago(NOW + 60_000, NOW), "a clock ahead of the page reads as now").toBe("just now");
  });

  it("keeps the news lines with a text, newest first as the route gives them, eight at most, and leaves everything else out", () => {
    const events = [
      news("An Angel took the private yield.", 30_000),
      news("the resistance prices A Clearing, the hole scheduled at 48, up from 40.", 90_000),
      { at: NOW, kind: "passing", player: "#0042", serial: 42, detail: { outcome: "appearance" } },
      news("", 1000),
      news("   ", 1000),
      { at: "yesterday", kind: "news", detail: { text: "A line with no clock." } },
      null,
      { kind: "news", detail: {} },
      ...Array.from({ length: 10 }, (_, i) => news(`Line ${i}.`, (i + 3) * 60_000)),
    ];
    const lines = logLines(events, NOW);
    expect(lines).toHaveLength(8);
    expect(lines[0]).toEqual({ text: "An Angel took the private yield.", when: "just now" });
    expect(lines[1]).toEqual({ text: "the resistance prices A Clearing, the hole scheduled at 48, up from 40.", when: "a minute ago" });
    expect(lines.slice(2).map(l => l.text)).toEqual(["Line 0.", "Line 1.", "Line 2.", "Line 3.", "Line 4.", "Line 5."]);
    expect(logLines(undefined, NOW)).toEqual([]);
    expect(logLines({ not: "a list" }, NOW)).toEqual([]);
  });

  it("mounts the lines into the band as text and shows it; a route that does not answer, or answers nothing, leaves the band hidden", async () => {
    const page = () => {
      const band = { hidden: true, dataset: {} as Record<string, string> };
      const items: { children: string[][] }[] = [];
      const list = {
        replaceChildren: () => items.splice(0),
        append: (li: { children: string[][] }) => items.push(li),
      };
      const doc = {
        getElementById: (id: string) => (id === "city-log-band" ? band : id === "city-log" ? list : null),
        createElement: (tag: string) => {
          const el: { tag: string; className: string; textContent: string; children: string[][]; append: (...c: { className: string; textContent: string }[]) => void } = {
            tag, className: "", textContent: "", children: [],
            append: (...c) => { for (const child of c) el.children.push([child.className, child.textContent]); },
          };
          return el;
        },
      };
      return { doc: doc as unknown as Document, band, items };
    };
    const answering = vi.fn(async () => ({ ok: true, json: async () => ({ ok: true, events: [news("<b>A line</b> the city wrote.", 3_000), news("Another.", 120_000)] }) })) as unknown as typeof fetch;
    const shown = page();
    expect(await mountCityLog(shown.doc, answering, () => NOW)).toBe(2);
    expect(shown.band.hidden).toBe(false);
    expect(shown.band.dataset.state).toBe("done");
    expect(shown.items.map(li => li.children)).toEqual([[["when", "just now"], ["", "<b>A line</b> the city wrote."]], [["when", "2 minutes ago"], ["", "Another."]]]);
    expect((answering as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe("./log/recent?kind=news&limit=8");

    const silent = page();
    const noLog = vi.fn(async () => ({ ok: false, status: 404, json: async () => ({ ok: false }) })) as unknown as typeof fetch;
    expect(await mountCityLog(silent.doc, noLog, () => NOW)).toBe(0);
    expect(silent.band.hidden).toBe(true);
    expect(silent.band.dataset.state).toBe("done");

    const empty = page();
    const nothingYet = vi.fn(async () => ({ ok: true, json: async () => ({ ok: true, events: [] }) })) as unknown as typeof fetch;
    expect(await mountCityLog(empty.doc, nothingYet, () => NOW)).toBe(0);
    expect(empty.band.hidden).toBe(true);

    const down = page();
    const throwing = vi.fn(async () => { throw new Error("offline"); }) as unknown as typeof fetch;
    expect(await mountCityLog(down.doc, throwing, () => NOW)).toBe(0);
    expect(down.band.hidden).toBe(true);

    // a page without the band is left alone
    expect(await mountCityLog({ getElementById: () => null } as unknown as Document, answering, () => NOW)).toBe(0);
  });
});
