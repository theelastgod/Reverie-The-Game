// The city's own log on the landing page: the last news lines the Worker wrote
// back (GET /log/recent?kind=news), each with how long ago. Pure functions
// first, so a test can read them; the mount at the bottom runs in the page.
// The band stays hidden until the route answers with lines; a city without a
// log yet, or a route that does not answer, leaves the page as it was.

const LINES = 8;

/** "just now", "a minute ago", "3 hours ago", "2 days ago": from a wall-clock ms stamp and now. */
export function ago(at, now) {
  const s = Math.max(0, Math.floor((now - at) / 1000));
  if (s < 45) return "just now";
  const m = Math.floor(s / 60);
  if (m < 2) return "a minute ago";
  if (m < 60) return `${m} minutes ago`;
  const h = Math.floor(m / 60);
  if (h < 2) return "an hour ago";
  if (h < 24) return `${h} hours ago`;
  const d = Math.floor(h / 24);
  return d < 2 ? "a day ago" : `${d} days ago`;
}

/** The lines to show, newest first as the route gives them: news events with a text, at most LINES; anything else is left out. */
export function logLines(events, now) {
  const out = [];
  for (const e of Array.isArray(events) ? events : []) {
    if (!e || e.kind !== "news" || !e.detail || typeof e.detail.text !== "string" || !e.detail.text.trim()) continue;
    if (typeof e.at !== "number" || !Number.isFinite(e.at)) continue;
    out.push({ text: e.detail.text.trim(), when: ago(e.at, now) });
    if (out.length >= LINES) break;
  }
  return out;
}

/** Fills the band from the route; resolves to the number of lines shown. Never throws: a city without a log shows nothing. */
export async function mountCityLog(doc = globalThis.document, fetcher = globalThis.fetch, now = () => Date.now()) {
  const band = doc?.getElementById("city-log-band");
  const list = doc?.getElementById("city-log");
  if (!band || !list) return 0;
  let lines = [];
  try {
    const res = await fetcher(`./log/recent?kind=news&limit=${LINES}`, { headers: { Accept: "application/json" } });
    if (res.ok) {
      const body = await res.json();
      if (body && body.ok) lines = logLines(body.events, now());
    }
  } catch {
    lines = [];
  }
  list.replaceChildren();
  for (const line of lines) {
    const li = doc.createElement("li");
    const when = doc.createElement("span");
    when.className = "when";
    when.textContent = line.when;
    const text = doc.createElement("span");
    text.textContent = line.text;
    li.append(when, text);
    list.append(li);
  }
  band.hidden = lines.length === 0;
  band.dataset.state = "done";
  return lines.length;
}

if (typeof document !== "undefined" && document.getElementById("city-log-band")) {
  mountCityLog();
}
