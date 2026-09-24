import assert from 'node:assert/strict';
import { WebSocket } from 'ws';

const deadline = setTimeout(() => { console.error('FAIL: integration deadline exceeded'); process.exit(1); }, 45000);
const origin = process.argv[2] ?? 'http://127.0.0.1:8788';
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
function snapshot(ws, predicate) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { ws.off('message', receive); reject(new Error('snapshot timeout')); }, 15000);
    function receive(raw) {
      const data = JSON.parse(raw.toString());
      if (data.t === 'snap' && predicate(data)) { clearTimeout(timer); ws.off('message', receive); resolve(data); }
    }
    ws.on('message', receive);
  });
}
const first = await connect();
const id = first.hello.id;
const x = first.hello.you.x;
const moved = snapshot(first.ws, snap => snap.players.find(p => p.id === id)?.x > x);
first.ws.send(JSON.stringify({ t: 'intent', intent: { right: true } }));
const after = await moved;
first.ws.send(JSON.stringify({ t: 'intent', intent: {} }));
const dodged = snapshot(first.ws, snap => (snap.players.find(p => p.id === id)?.dodgeT ?? 0) > 0);
first.ws.send(JSON.stringify({ t: 'dodge', dx: 1, dy: 0 }));
const dodgeSnap = await dodged;
assert.ok(dodgeSnap.players.find(p => p.id === id).dodgeCd > 0, 'server-owned dodge recovery');
const closed = new Promise(resolve => first.ws.once('close', resolve));
first.ws.close(); await closed;
const second = await connect();
assert.equal(second.hello.id, id, 'same character after reconnect');
assert.ok(second.hello.you.x > x, 'server-saved position after reconnect');
assert.equal(second.hello.you.guest, true, 'guest identity preserved');
const replaced = new Promise(resolve => second.ws.once('close', code => resolve(code)));
const third = await connect();
assert.equal(await replaced, 4001, 'duplicate tab ownership');
assert.equal(third.hello.id, id);
const snap = await snapshot(third.ws, state => state.now > after.now);
assert.equal(snap.players.filter(p => p.id === id).length, 1, 'only one body');
third.ws.close();
clearTimeout(deadline);
console.log('PASS: live ticks, movement, timed dodge, saved reconnect, guest identity, single-tab ownership');
