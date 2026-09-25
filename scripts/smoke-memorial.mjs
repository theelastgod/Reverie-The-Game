import assert from 'node:assert/strict';
import { WebSocket } from 'ws';

const origin = process.argv[2] ?? 'http://127.0.0.1:8788';
const deadline = setTimeout(() => { console.error('FAIL: memorial integration deadline exceeded'); process.exit(1); }, 90000);
const sockets = [];
async function connect(cookie) {
  const ws = new WebSocket(origin.replace(/^http/, 'ws') + '/ws', { headers: { Cookie: cookie, Origin: origin } });
  sockets.push(ws);
  const state = { ws, hello: undefined, snap: undefined, error: undefined };
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
const send = (state, data) => state.ws.send(JSON.stringify(data));
async function approach(state, target) {
  const drive = setInterval(() => {
    const p = me(state);
    if (!p || state.ws.readyState !== WebSocket.OPEN) return;
    send(state, { t: 'intent', intent: { right: p.x < target.x - 5, left: p.x > target.x + 5, down: p.y < target.y - 5, up: p.y > target.y + 5 } });
  }, 100);
  try { await wait(state, () => Math.hypot(me(state).x - target.x, me(state).y - target.y) < 10, 'approach'); }
  finally { clearInterval(drive); send(state, { t: 'intent', intent: {} }); }
}
try {
  for (const choice of ['extract', 'keep']) {
    const response = await fetch(`${origin}/session`, { method: 'POST', headers: { Origin: origin } });
    assert.equal(response.status, 204);
    const cookie = response.headers.get('set-cookie').split(';')[0];
    const first = await connect(cookie);
    await approach(first, first.snap.npcs.find(n => n.id === 'nara'));
    send(first, { t: 'talk', npcId: 'nara' });
    await wait(first, () => me(first).beats.nara, 'Nara introduction');
    const node = first.snap.nodes.find(n => n.id === 'nara-memorial');
    assert.ok(node, 'memorial available in saved shared world');
    await approach(first, node);
    const before = me(first);
    send(first, { t: 'use', nodeId: node.id, choice });
    await wait(first, () => me(first).openingChoice === choice, 'personal choice');
    assert.equal(first.snap.nodes.find(n => n.id === node.id).kept, choice === 'keep', 'shared visual consequence');
    for (const field of ['bestand', 'banked', 'winke', 'aura', 'readiness']) assert.equal(me(first)[field], before[field], `no ${field} reward`);
    const now = first.snap.now;
    send(first, { t: 'use', nodeId: node.id, choice: choice === 'keep' ? 'extract' : 'keep' });
    await wait(first, () => first.snap.now > now, 'repeat input');
    assert.equal(me(first).openingChoice, choice, 'choice cannot be reversed');
    await approach(first, first.snap.rites.find(r => r.kind === 'burial'));
    send(first, { t: 'bury' });
    await wait(first, () => me(first).beats.burial, 'burial');
    assert.match(me(first).heard, choice === 'keep' ? /cloth holds/ : /copper holds/);
    assert.equal(me(first).readiness, before.readiness + 1, 'one existing burial reward');
    const closed = new Promise(resolve => first.ws.once('close', resolve));
    first.ws.close(); await closed;
    const restored = await connect(cookie);
    assert.equal(restored.hello.id, first.hello.id);
    assert.equal(restored.hello.you.openingChoice, choice, 'saved choice');
    assert.equal(restored.hello.you.beats.burial, true, 'saved burial');
    restored.ws.close();
  }
  console.log('PASS: both guest memorial choices, shared recorder state, no currency reward, repeat protection, burial consequences, saved reconnect');
} finally {
  for (const ws of sockets) ws.close();
  clearTimeout(deadline);
}
