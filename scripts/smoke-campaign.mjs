import assert from 'node:assert/strict';
import { WebSocket } from 'ws';

const origin = process.argv[2] ?? 'http://127.0.0.1:8788';
const deadline = setTimeout(() => { console.error('FAIL: campaign integration deadline exceeded'); process.exit(1); }, 240000);
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
async function action(state, packet, predicate, label) {
  send(state, packet);
  await wait(state, () => predicate(me(state)), label);
}
async function walk(state, ...points) {
  for (const [x, y] of points) await approach(state, { x, y });
}
async function newSession() {
  const response = await fetch(`${origin}/session`, { method: 'POST', headers: { Origin: origin } });
  assert.equal(response.status, 204);
  const cookie = response.headers.get('set-cookie').split(';')[0];
  return { cookie, state: await connect(cookie) };
}
try {
  const { cookie, state: first } = await newSession();
  await walk(first, [240, 720]);
  await action(first, { t: 'talk', npcId: 'nara' }, p => p.beats.nara, 'Nara');
  await walk(first, [336, 720]);
  await action(first, { t: 'use', nodeId: 'nara-memorial', choice: 'keep' }, p => p.openingChoice === 'keep', 'memorial');
  await walk(first, [240, 780]);
  await action(first, { t: 'bury' }, p => p.beats.burial, 'burial');
  await walk(first, [192, 780], [192, 400]);
  await action(first, { t: 'read', signId: 'safety-plaque' }, p => p.weather.safety, 'Safety');
  await walk(first, [400, 400], [400, 260]);
  await action(first, { t: 'talk', npcId: 'ord' }, p => p.beats.ord && p.namedWeather, 'Ord and weather');
  await walk(first, [400, 408], [1080, 408], [1080, 504]);
  await action(first, { t: 'talk', npcId: 'quill' }, p => p.beats.quill, 'Quill');
  await walk(first, [1080, 120], [696, 120]);
  await action(first, { t: 'under' }, p => p.locked, 'guest threshold');
  await action(first, { t: 'link', serial: 7777, sig: 'mock' }, p => !p.guest && !p.locked, 'test Angel');
  await action(first, { t: 'under' }, p => p.beats.under, 'going under');
  await walk(first, [1104, 120], [1104, 168]);
  await action(first, { t: 'care' }, p => p.beats.care, 'Care');
  await walk(first, [1184, 248]);
  await action(first, { t: 'read', signId: 'house-hall' }, p => p.beats.hall, 'House hall');
  await walk(first, [1260, 360]);
  await action(first, { t: 'operator', choice: 'hear' }, p => p.beats.yield, 'Vesper offer');
  await action(first, { t: 'operator', choice: 'refuse' }, p => p.beats.refuse, 'refusal');
  await walk(first, [1260, 408], [240, 408], [240, 700], [360, 700]);
  await action(first, { t: 'bury' }, p => p.beats.garden, 'wreckage garden');
  await walk(first, [240, 700], [240, 408], [1260, 408], [1260, 120]);
  await action(first, { t: 'm3' }, p => p.beats.m3 && p.inM3, 'Movement III');
  assert.ok(Math.abs(me(first).x - 240) < 12, 'first entry reaches Strait');
  await walk(first, [400, 88], [400, 260]);
  await action(first, { t: 'talk', npcId: 'ord' }, p => p.heard.startsWith('Walk the Strait'), 'incomplete map refused');
  assert.equal(me(first).beats.map, false);
  await walk(first, [400, 88]);
  const before = me(first).readiness;
  for (const [key, x] of [['strait', 240], ['foundry', 520], ['cable', 800]]) {
    await walk(first, [x, 88]);
    await action(first, { t: 'read', signId: `organ-${key}` }, p => p.beats[key], key);
  }
  assert.equal(me(first).readiness, before + 3, 'one award per introduction');
  await walk(first, [400, 88], [400, 260]);
  await action(first, { t: 'talk', npcId: 'ord' }, p => p.beats.map, 'Ord map');
  assert.match(me(first).heard, /^Strait, Foundry, Cable/);
  assert.equal(me(first).bestand, 0, 'Readiness path needs no private yield');
  const closed = new Promise(resolve => first.ws.once('close', resolve));
  first.ws.close(); await closed;
  const restored = await connect(cookie);
  for (const key of ['m3', 'strait', 'foundry', 'cable', 'map']) assert.equal(restored.hello.you.beats[key], true, `saved ${key}`);
  assert.equal(restored.hello.you.openingChoice, 'keep');
  restored.ws.close();
  // A new Angel arrives after the first character has opened the shared organs.
  const { state: newcomer } = await newSession();
  await action(newcomer, { t: 'link', serial: 7777, sig: 'mock' }, p => !p.guest, 'new Angel');
  await walk(newcomer, [240, 480], [240, 88]);
  for (const [key, x] of [['strait', 240], ['foundry', 520], ['cable', 800]]) {
    await walk(newcomer, [x, 88]);
    const now = newcomer.snap.now;
    send(newcomer, { t: 'read', signId: `organ-${key}` });
    await wait(newcomer, () => newcomer.snap.now > now && me(newcomer).heard.startsWith('Enter through the Third Movement door'), `gate ${key}`);
    assert.equal(me(newcomer).beats[key], false, `no shared ${key} shortcut`);
  }
  console.log('PASS: public Movement I, guest threshold, refusal route, personal M3 entry, all three organs, Ord map, saved reconnect, and new-arrival organ gates');
} finally {
  for (const ws of sockets) ws.close();
  clearTimeout(deadline);
}
