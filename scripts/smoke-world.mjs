// Live-server smoke: session cookie, hello v2, intent movement, dodge, reconnect
// to the same body, single-tab takeover (4001) and one body per session.
// Usage: node scripts/smoke-world.mjs [origin]   (default http://127.0.0.1:8788)
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';

const origin = process.argv[2] ?? 'http://127.0.0.1:8788';
const PROTOCOL_VERSION = 2;
const deadline = setTimeout(() => { console.error('FAIL: smoke deadline (90 s) exceeded'); process.exit(1); }, 90000);

const health = await fetch(`${origin}/health`);
assert.equal(health.status, 200, 'health');
assert.deepEqual(await health.json(), { ok: true, v: PROTOCOL_VERSION }, 'health body');

const response = await fetch(`${origin}/session`, { method: 'POST', headers: { Origin: origin } });
assert.equal(response.status, 204, 'session creation');
const cookie = response.headers.get('set-cookie').split(';')[0];

function connect() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(origin.replace(/^http/, 'ws') + '/ws', { headers: { Cookie: cookie, Origin: origin } });
    const timer = setTimeout(() => { ws.terminate(); reject(new Error('hello timeout')); }, 15000);
    ws.once('error', reject);
    ws.on('message', raw => {
      const data = JSON.parse(raw.toString());
      if (data.t === 'hello') { clearTimeout(timer); resolve({ ws, hello: data }); }
    });
  });
}
function snapshot(ws, predicate, label = 'snapshot') {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { ws.off('message', receive); reject(new Error(`${label} timeout`)); }, 15000);
    function receive(raw) {
      const data = JSON.parse(raw.toString());
      if (data.t === 'snap' && predicate(data)) { clearTimeout(timer); ws.off('message', receive); resolve(data); }
    }
    ws.on('message', receive);
  });
}
const send = (ws, msg) => ws.send(JSON.stringify(msg));

const first = await connect();
assert.equal(first.hello.v, PROTOCOL_VERSION, 'hello protocol version');
assert.equal(first.hello.guest, true, 'a fresh session is a guest');
assert.equal(first.hello.you.id, first.hello.id, 'hello carries your own view');
assert.equal(first.hello.you.aura, 0, 'guest aura is 0');
assert.equal(first.hello.you.wink, '', 'guest never has a Wink');
const id = first.hello.id;
const x = first.hello.you.x;

const firstSnap = await snapshot(first.ws, s => s.you?.id === id, 'first snapshot');
assert.equal(firstSnap.v, PROTOCOL_VERSION);
assert.equal(firstSnap.players.filter(p => p.id === id).length, 0, 'you are not listed among the others');

const moved = snapshot(first.ws, snap => snap.you.x > x, 'movement');
const heartbeat = setInterval(() => send(first.ws, { t: 'intent', intent: { right: true } }), 200);
send(first.ws, { t: 'intent', intent: { right: true } });
const after = await moved;
clearInterval(heartbeat);
send(first.ws, { t: 'intent', intent: {} });

const dodged = snapshot(first.ws, snap => (snap.you.dodgeT ?? 0) > 0, 'dodge');
send(first.ws, { t: 'dodge', dx: 1, dy: 0 });
const dodgeSnap = await dodged;
assert.ok(dodgeSnap.you.dodgeCd > 0, 'server-owned dodge recovery');

// Malformed and oversized packets are ignored, never fatal.
send(first.ws, { t: 'nope' });
first.ws.send('{');
first.ws.send('x'.repeat(5000));
await snapshot(first.ws, s => s.now > dodgeSnap.now, 'still alive after junk');

const closed = new Promise(resolve => first.ws.once('close', resolve));
first.ws.close(); await closed;

const second = await connect();
assert.equal(second.hello.id, id, 'same body after reconnect');
assert.ok(second.hello.you.x > x, 'server-saved position after reconnect');
assert.equal(second.hello.guest, true, 'guest identity preserved');

const replaced = new Promise(resolve => second.ws.once('close', code => resolve(code)));
const third = await connect();
assert.equal(await replaced, 4001, 'duplicate tab ownership');
assert.equal(third.hello.id, id, 'the new tab owns the same body');
const snap = await snapshot(third.ws, state => state.now > after.now, 'post-takeover snapshot');
assert.equal(snap.you.id, id, 'one body, seen as you');
assert.equal(snap.players.filter(p => p.id === id).length, 0, 'never duplicated among the others');
third.ws.close();
clearTimeout(deadline);
console.log('PASS: health, hello v2, live ticks, movement, timed dodge, junk ignored, saved reconnect, guest identity, single-tab ownership');
