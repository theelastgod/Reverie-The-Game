import assert from 'node:assert/strict';
import { WebSocket } from 'ws';

// Two fresh mock Angels, public movement and actions only. Never attacks another session.
const origin = process.argv[2] ?? 'http://127.0.0.1:8788';
const deadline = setTimeout(() => { console.error('FAIL: PvP integration deadline exceeded'); process.exit(1); }, 90000);
const sockets = [];
async function connect(cookie) {
  if (!cookie) {
    const response = await fetch(`${origin}/session`, { method: 'POST', headers: { Origin: origin } });
    assert.equal(response.status, 204);
    cookie = response.headers.get('set-cookie').split(';')[0];
  }
  const ws = new WebSocket(origin.replace(/^http/, 'ws') + '/ws', { headers: { Cookie: cookie, Origin: origin } });
  sockets.push(ws);
  const state = { ws, cookie, hello: undefined, snap: undefined, error: undefined };
  ws.on('error', error => { state.error = error; });
  ws.on('message', raw => {
    const data = JSON.parse(raw.toString());
    if (data.t === 'hello') state.hello = data;
    if (data.t === 'snap') state.snap = data;
  });
  await wait(state, () => state.hello && state.snap, 'connection');
  return state;
}
function wait(state, predicate, label) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(() => {
      if (predicate()) { clearInterval(timer); resolve(); }
      else if (state.error || state.ws.readyState === WebSocket.CLOSED || Date.now() - start > 20000) {
        clearInterval(timer); reject(state.error ?? new Error(`${label} did not complete`));
      }
    }, 50);
  });
}
const me = state => state.snap.players.find(p => p.id === state.hello.id);
const send = (state, packet) => state.ws.send(JSON.stringify(packet));
async function approach(state, x, y) {
  const drive = setInterval(() => {
    const p = me(state);
    if (!p || state.ws.readyState !== WebSocket.OPEN) return;
    send(state, { t: 'intent', intent: { right: p.x < x - 3, left: p.x > x + 3, down: p.y < y - 3, up: p.y > y + 3 } });
  }, 100);
  try { await wait(state, () => Math.hypot(me(state).x - x, me(state).y - y) < 8, `approach ${x},${y}`); }
  finally { clearInterval(drive); send(state, { t: 'intent', intent: {} }); }
}
async function hit(a, b, type, loss) {
  await wait(a, () => me(a).strikeCd === 0, 'strike cooldown');
  const p = me(a);
  assert.ok(!a.snap.players.some(o => o.id !== p.id && o.id !== b.hello.id && Math.hypot(o.x - p.x, o.y - p.y) < 80), 'test area free of other players');
  assert.ok(!a.snap.clerks.some(c => Math.hypot(c.x - p.x, c.y - p.y) < 80), 'test area free of clerks');
  const hp = a.snap.players.find(o => o.id === b.hello.id).hp;
  send(a, { t: type });
  await wait(a, () => me(a).strikeCd > 0, 'attack acknowledged');
  assert.equal(a.snap.players.find(o => o.id === b.hello.id).hp, hp - loss, `${type} expected damage`);
}
try {
  const a = await connect(); const b = await connect();
  for (const state of [a, b]) {
    send(state, { t: 'link', serial: 7777, sig: 'mock' });
    await wait(state, () => !me(state).guest, 'mock Angel link');
  }
  // Cross the first aisle through its opening at y=408, clear of the named clerk.
  await Promise.all([a, b].map(state => approach(state, 192, 408)));
  await Promise.all([approach(a, 706, 408), approach(b, 728, 408)]);
  await Promise.all([approach(a, 706, 520), approach(b, 728, 520)]);
  await hit(a, b, 'strike', 0);
  send(a, { t: 'flag' });
  await wait(a, () => me(a).flagged, 'first flag');
  await hit(a, b, 'heavy', 0);
  send(b, { t: 'flag' });
  await wait(a, () => a.snap.players.find(p => p.id === b.hello.id).flagged, 'second flag');
  await hit(a, b, 'strike', 22);
  send(a, { t: 'truce' });
  await wait(a, () => !me(a).flagged && me(a).truceUntil > a.snap.now, 'truce');
  assert.equal(a.snap.players.find(p => p.id === b.hello.id).flagged, false);
  send(a, { t: 'flag' });
  await wait(a, () => me(a).heard.includes('Neither side'), 'reflag refused');
  await hit(a, b, 'heavy', 0);
  const closed = new Promise(resolve => a.ws.once('close', resolve));
  a.ws.close(); await closed;
  const restored = await connect(a.cookie);
  assert.equal(restored.hello.id, a.hello.id);
  assert.equal(me(restored).flagged, false);
  assert.ok(me(restored).truceUntil > restored.snap.now, 'saved truce');
  console.log('PASS: two Angels, unflagged protection, one-sided flag protection, explicit PvP hit, truce, reflag refusal, saved reconnect');
} finally {
  for (const ws of sockets) ws.close();
  clearTimeout(deadline);
}
