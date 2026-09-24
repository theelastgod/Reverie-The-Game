import assert from 'node:assert/strict';
import { WebSocket } from 'ws';

// Uses the public guest protocol: no debug coordinates, injected progress, or Angel link.
const origin = process.argv[2] ?? 'http://127.0.0.1:8788';
const deadline = setTimeout(() => { console.error('FAIL: intake integration deadline exceeded'); process.exit(1); }, 60000);
const response = await fetch(`${origin}/session`, { method: 'POST', headers: { Origin: origin } });
assert.equal(response.status, 204, 'session creation');
const cookie = response.headers.get('set-cookie').split(';')[0];
const sockets = [];

async function connect() {
  const ws = new WebSocket(origin.replace(/^http/, 'ws') + '/ws', { headers: { Cookie: cookie, Origin: origin } });
  sockets.push(ws);
  const state = { ws, snap: undefined, hello: undefined };
  ws.on('message', raw => {
    const data = JSON.parse(raw.toString());
    if (data.t === 'hello') state.hello = data;
    if (data.t === 'snap') state.snap = data;
  });
  await wait(state, () => state.hello, 'hello');
  return state;
}

function wait(state, predicate, label) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(() => {
      if (predicate()) { clearInterval(timer); resolve(); }
      else if (state.ws.readyState === WebSocket.CLOSED || Date.now() - start > 20000) {
        clearInterval(timer); reject(new Error(`${label} did not complete`));
      }
    }, 50);
  });
}

const me = state => state.snap?.players.find(p => p.id === state.hello.id);
const clerk = state => state.snap?.clerks.find(c => c.id === 'clerk-intake');
const send = (state, packet) => state.ws.send(JSON.stringify(packet));

async function approach(state, x, y) {
  const drive = setInterval(() => {
    const p = me(state);
    if (!p || state.ws.readyState !== WebSocket.OPEN) return;
    send(state, { t: 'intent', intent: { right: p.x < x - 5, left: p.x > x + 5, down: p.y < y - 5, up: p.y > y + 5 } });
  }, 100);
  try { await wait(state, () => me(state) && Math.hypot(me(state).x - x, me(state).y - y) < 10, 'approach'); }
  finally { clearInterval(drive); send(state, { t: 'intent', intent: {} }); }
}

try {
  const first = await connect();
  const initial = first.hello.you;
  await wait(first, () => clerk(first), 'relief shift');
  const target = clerk(first);
  assert.equal(target.maxHp, 88, 'server encounter health');
  await approach(first, target.x - 30, target.y);
  await wait(first, () => clerk(first)?.telegraph > 0, 'attack anticipation');
  send(first, { t: 'heavy' });
  await wait(first, () => clerk(first)?.recovery > 0 && clerk(first)?.hp < target.hp, 'heavy interruption');
  for (let i = 0; i < 8 && !me(first)?.openingCombat; i++) {
    await wait(first, () => me(first)?.strikeCd === 0, 'strike recovery');
    send(first, { t: 'strike' });
    await wait(first, () => me(first)?.strikeCd > 0 || me(first)?.openingCombat, 'strike response');
  }
  assert.equal(me(first)?.openingCombat, true, 'personal completion');
  for (const field of ['bestand', 'banked', 'winke', 'aura', 'readiness']) assert.equal(me(first)[field], initial[field], `no ${field} reward`);
  const closed = new Promise(resolve => first.ws.once('close', resolve));
  first.ws.close(); await closed;
  const second = await connect();
  assert.equal(second.hello.id, first.hello.id, 'same guest');
  assert.equal(second.hello.you.openingCombat, true, 'saved encounter completion');
  console.log('PASS: guest approach, clerk anticipation, heavy recovery, combat completion, no currency reward, persisted participation');
} finally {
  for (const ws of sockets) ws.close();
  clearTimeout(deadline);
}
