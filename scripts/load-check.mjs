// Load check against a running Worker: N guests walk the Nave at once and strike
// what they meet, while the object's own load meter and every bot's snapshot
// cadence are sampled. Prints `measure:` lines; PASS when the object kept its
// 20 Hz within the tolerances below. Usage:
//   node scripts/load-check.mjs [origin] [--bots=20] [--seconds=20]
// The default is a size one object must carry anywhere; .rebuild/ZONES.md keeps the
// knee measured on this container's workerd (about 40 bodies) and what to do about it.
import { WebSocket } from 'ws';

const origin = process.argv.find(a => a.startsWith('http')) ?? 'http://127.0.0.1:8788';
const arg = (name, fallback) => Number((process.argv.find(a => a.startsWith(`--${name}=`)) ?? '').split('=')[1] || fallback);
const BOTS = arg('bots', 20);
const SECONDS = arg('seconds', 20);
const STEP_MS = 50;
const MAX_MEAN_INTERVAL_MS = 80; // a bot should see a snapshot about every 50 ms; past this the object is behind
const MAX_LATE_MS = 100; // the alarm may drift, not stall

const deadline = setTimeout(() => { console.error(`FAIL: load deadline (${SECONDS + 60} s) exceeded`); process.exit(1); }, (SECONDS + 60) * 1000);
const sleep = ms => new Promise(r => setTimeout(r, ms));

// The Worker reloads after site/ changes; start once three probes in a row answer.
for (let quiet = 0, i = 0; quiet < 3; i++) {
  if (i >= 60) { console.error(`FAIL: the Worker at ${origin} does not answer`); process.exit(1); }
  try { quiet = (await fetch(`${origin}/world`)).ok ? quiet + 1 : 0; } catch { quiet = 0; }
  if (quiet < 3) await sleep(500);
}

async function bot(i) {
  const res = await fetch(`${origin}/session`, { method: 'POST', headers: { Origin: origin } });
  const cookie = res.headers.get('set-cookie').split(';')[0];
  const ws = new WebSocket(origin.replace(/^http/, 'ws') + '/ws', { headers: { Cookie: cookie, Origin: origin } });
  const b = { i, ws, snap: null, snaps: 0, lastAt: 0, intervals: [], errors: 0, bytes: 0, slowBytes: 0 };
  let slow = {};
  ws.on('error', () => { b.errors++; });
  ws.on('message', raw => {
    const at = Date.now();
    b.bytes += raw.length;
    const d = JSON.parse(raw.toString());
    if (d.t === 'slow') {
      b.slowBytes += raw.length;
      const { t, v, roster, ...rest } = d;
      slow = { ...slow, ...rest };
      if (roster) { const byId = new Map((slow.roster ?? []).map(r => [r.id, r])); for (const r of roster) byId.set(r.id, r); slow.roster = [...byId.values()]; }
      return;
    }
    if (d.t !== 'fast' && d.t !== 'snap') return;
    if (b.lastAt) b.intervals.push(at - b.lastAt);
    b.lastAt = at;
    if (d.t === 'fast') {
      const { roster = [], youSlow = {}, ...sections } = slow;
      const byId = new Map(roster.map(r => [r.id, r]));
      b.snap = { ...sections, ...d, players: d.players.flatMap(m => (byId.has(m.id) ? [{ ...byId.get(m.id), ...m }] : [])), you: { ...youSlow, ...d.you }, t: 'snap' };
    } else b.snap = d;
    b.snaps++;
  });
  await new Promise((resolve, reject) => { ws.once('open', resolve); ws.once('error', reject); });
  return b;
}

const t0 = Date.now();
const bots = [];
for (let i = 0; i < BOTS; i++) {
  try { bots.push(await bot(i)); } catch (e) { console.log(`note: bot ${i} could not connect: ${e.message}`); }
  if (i % 10 === 9) await sleep(100);
}
console.log(`connected ${bots.length} bots in ${((Date.now() - t0) / 1000).toFixed(1)} s`);

// Each bot wanders: a heading held for a second or two, then another; a strike when an enemy is close.
const drive = setInterval(() => {
  const now = Date.now();
  for (const b of bots) {
    if (b.ws.readyState !== WebSocket.OPEN || !b.snap) continue;
    if (!b.headingUntil || now > b.headingUntil) {
      b.heading = { up: Math.random() < 0.35, down: Math.random() < 0.35, left: Math.random() < 0.35, right: Math.random() < 0.35 };
      b.headingUntil = now + 800 + Math.random() * 1600;
    }
    b.ws.send(JSON.stringify({ t: 'intent', intent: b.heading }));
    const you = b.snap.you;
    const near = (b.snap.enemies ?? []).some(e => e.state !== 'dead' && Math.hypot(e.x - you.x, e.y - you.y) < 60);
    if (near && Math.random() < 0.5) b.ws.send(JSON.stringify({ t: 'strike' }));
  }
}, 100);

// Sample the object's meter once a second.
const samples = [];
const sampler = setInterval(async () => {
  try {
    const r = await fetch(`${origin}/world`);
    const body = await r.json();
    if (body.load) samples.push(body.load);
  } catch { /* a missed sample is fine */ }
}, 1000);

await sleep(SECONDS * 1000);
clearInterval(drive);
clearInterval(sampler);
for (const b of bots) b.ws.send(JSON.stringify({ t: 'intent', intent: {} }));
await sleep(300);

// ---- the numbers
const all = bots.flatMap(b => b.intervals.slice(20)); // the first second settles
const mean = all.length ? all.reduce((a, v) => a + v, 0) / all.length : 0;
const sorted = all.slice().sort((a, b) => a - b);
const pct = p => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : 0);
const last = samples.at(-1) ?? {};
const worstLate = Math.max(0, ...samples.map(s => s.maxLateMs ?? 0));
const worstCatchUp = Math.max(0, ...samples.map(s => s.maxCatchUp ?? 0));
const stalls = last.stalls ?? 0;
const bytes = bots.reduce((a, b) => a + b.bytes, 0);
const slowBytes = bots.reduce((a, b) => a + b.slowBytes, 0);
const snaps = bots.reduce((a, b) => a + b.snaps, 0);
const errors = bots.reduce((a, b) => a + b.errors, 0);
console.log(`measure: ${bots.length} bots for ${SECONDS} s: ${snaps} fast frames, ${(bytes / 1024 / 1024).toFixed(1)} MB down (${((bytes - slowBytes) / Math.max(1, snaps)).toFixed(0)} B per fast frame, ${(slowBytes / 1024).toFixed(0)} KB of slow frames), ${errors} socket errors`);
console.log(`measure: snapshot interval mean ${mean.toFixed(1)} ms, p50 ${pct(0.5)} ms, p95 ${pct(0.95)} ms, p99 ${pct(0.99)} ms (the step is ${STEP_MS} ms)`);
const worstCheckpoint = Math.max(0, ...samples.map(s => s.maxCheckpointMs ?? 0));
console.log(`measure: object: sessions ${last.sessions ?? '?'}, bodies ${last.bodies ?? '?'}, alarm late mean ${last.lateMs ?? '?'} ms, worst ${worstLate} ms; catch-up mean ${last.catchUp ?? '?'} steps, worst ${worstCatchUp}; stalls ${stalls}; checkpoint mean ${last.checkpointMs ?? '?'} ms, worst ${worstCheckpoint} ms; ${last.charsPerViewer ?? '?'} chars per viewer per broadcast`);

for (const b of bots) b.ws.close();
clearTimeout(deadline);
const failures = [];
if (bots.length < BOTS) failures.push(`${BOTS - bots.length} bots could not connect`);
if (mean > MAX_MEAN_INTERVAL_MS) failures.push(`snapshot interval mean ${mean.toFixed(1)} ms > ${MAX_MEAN_INTERVAL_MS} ms`);
if (worstLate > MAX_LATE_MS) failures.push(`alarm ${worstLate} ms late > ${MAX_LATE_MS} ms`);
if (stalls > 0) failures.push(`${stalls} stalls (simulation time dropped)`);
if (failures.length) { console.log(`FAIL: ${failures.join('; ')}`); process.exit(1); }
console.log(`PASS: one object carried ${bots.length} bodies at 20 Hz`);
process.exit(0);
