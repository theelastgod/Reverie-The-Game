// Drives Movement I over the real WebSocket using only public messages, then
// links the test Angel and goes under. Run against local Wrangler:
//   npx wrangler dev --port 8788      (in another shell)
//   node scripts/smoke-campaign.mjs [origin]
// Default origin http://127.0.0.1:8788. Deadline 90 s.
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';

const origin = process.argv[2] ?? 'http://127.0.0.1:8788';
const deadline = setTimeout(() => { console.error('FAIL: campaign deadline (90 s) exceeded'); process.exit(1); }, 90000);

// Tile coordinates duplicated from src/sim/map.ts (Nave of Tubes, 48 px tiles).
// Keep in sync with POI_LIST / NODE_LIST / NPC_HOMES / ENEMY_SPAWNS / GUEST_SPAWN.
const TILE = 48;
const at = (tx, ty) => ({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 });
const T = {
  spawn: at(5, 42),            // GUEST_SPAWN
  intake: at(13, 42),          // enemy intake-clerk
  node1: at(11, 36),           // nave-node-1
  deskThree: at(21, 38),       // enemy desk-three
  node2: at(21, 45),           // nave-node-2
  node3: at(27, 47),           // nave-node-3
  ord: at(19, 32),             // home:ord
  quill: at(31, 41),           // home:quill
  nara: at(8, 49),             // home:nara
  recorder: at(10, 51),        // memorial-recorder
  plot: at(6, 51),             // nara-plot
  plaque: at(16, 31),          // safety-plaque
  under: at(16, 52),           // going-under
};
// Walking lanes that avoid the pillar columns (x 9, 16, 23 on rows 32..47 step 3),
// the low walls (x 13 rows 49..53; x 24 rows 50..53) and the clerks' aggro (Desk Three at 21,38; Annex Runner at 26,43).
const ROUTE = {
  toIntake: [at(11, 42)],
  toNode: [at(11, 36)],
  toDeskThree: [at(18, 36), at(20, 37)],
  toNode2: [at(18, 40), at(20, 45)],
  toNode3: [at(26, 45), at(27, 46)],
  toOrd: [at(18, 45), at(18, 36), at(19, 33)],
  toQuill: [at(30, 33), at(30, 41)],
  toNara: [at(30, 46), at(8, 46), at(8, 48)],
  toRecorder: [at(10, 48), at(10, 51)],
  toPlot: [at(7, 51)],
  backToNara: [at(8, 48)],
  toPlaque: [at(6, 48), at(6, 30), at(15, 30), at(15, 31)],
  toUnder: [at(15, 52)],
};

const sockets = [];

// ---- measurement: how long the opening takes a bot, and how much a person reads on the way.
const T0 = Date.now();
const phases = [];
let phaseStart = T0;
let phaseLabel = 'connect';
function phase(label) {
  const now = Date.now();
  phases.push({ label: phaseLabel, ms: now - phaseStart });
  phaseLabel = label;
  phaseStart = now;
}
const words = text => (typeof text === 'string' && text.trim() ? text.trim().split(/\s+/).length : 0);
const read = { dialogue: 0, spoken: 0, journal: 0, notices: 0, decisions: 0 };
const seenText = new Set();
function readOnce(bucket, text) {
  if (!text || seenText.has(text)) return;
  seenText.add(text);
  read[bucket] += words(text);
}

function wait(state, predicate, label, ms = 20000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(() => {
      let ok = false;
      try { ok = predicate(); } catch { ok = false; }
      if (ok) { clearInterval(timer); resolve(true); }
      else if (state.error || state.ws.readyState === WebSocket.CLOSED) { clearInterval(timer); reject(state.error ?? new Error(`${label}: socket closed`)); }
      else if (Date.now() - start > ms) { clearInterval(timer); reject(new Error(`${label} did not complete`)); }
    }, 40);
  });
}
/** Like wait, but resolves false instead of rejecting when the time runs out. */
const settle = (state, predicate, label, ms) => wait(state, predicate, label, ms).catch(() => false);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function connect(cookie) {
  const ws = new WebSocket(origin.replace(/^http/, 'ws') + '/ws', { headers: { Cookie: cookie, Origin: origin } });
  sockets.push(ws);
  const state = { ws, hello: undefined, snap: undefined, error: undefined };
  ws.on('error', error => { state.error = error; });
  ws.on('message', raw => {
    const data = JSON.parse(raw.toString());
    if (data.t === 'hello') state.hello = data;
    if (data.t === 'snap') {
      state.snap = data;
      const y = data.you;
      readOnce('spoken', y.heard);
      readOnce('spoken', y.wink);
      for (const n of y.notices ?? []) readOnce('notices', n.text);
      if (data.objective) { readOnce('journal', data.objective.title); readOnce('journal', data.objective.detail); }
      if (y.dialogue) { readOnce('dialogue', y.dialogue.text); readOnce('dialogue', y.dialogue.wink); for (const c of y.dialogue.choices) readOnce('dialogue', c.label); }
    }
  });
  await wait(state, () => state.hello && state.snap, 'connection');
  return state;
}
async function newSession() {
  const response = await fetch(`${origin}/session`, { method: 'POST', headers: { Origin: origin } });
  assert.equal(response.status, 204, 'session cookie');
  const cookie = response.headers.get('set-cookie').split(';')[0];
  return { cookie, state: await connect(cookie) };
}
const you = state => state.snap.you;
const send = (state, data) => state.ws.send(JSON.stringify(data));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

async function approach(state, target) {
  let lastPos = { x: you(state).x, y: you(state).y };
  let lastProgress = Date.now();
  let nudge = null;
  const drive = setInterval(() => {
    const p = you(state);
    if (!p || state.ws.readyState !== WebSocket.OPEN) return;
    if (dist(p, lastPos) > 6) { lastPos = { x: p.x, y: p.y }; lastProgress = Date.now(); }
    else if (Date.now() - lastProgress > 1200 && !nudge) {
      // Stuck on a corner: step sideways for a moment, then resume.
      const dx = target.x - p.x, dy = target.y - p.y;
      nudge = Math.abs(dx) > Math.abs(dy) ? { up: dy <= 0, down: dy > 0 } : { left: dx <= 0, right: dx > 0 };
      setTimeout(() => { nudge = null; lastProgress = Date.now(); }, 300);
    }
    const intent = nudge ?? { right: p.x < target.x - 5, left: p.x > target.x + 5, down: p.y < target.y - 5, up: p.y > target.y + 5 };
    send(state, { t: 'intent', intent });
  }, 100);
  try { await wait(state, () => dist(you(state), target) < 10, `approach ${Math.round(target.x)},${Math.round(target.y)}`, 25000); }
  finally { clearInterval(drive); send(state, { t: 'intent', intent: {} }); }
}
const walk = async (state, points) => { for (const point of points) await approach(state, point); };

/** Use a verb at a POI through the prompt the server offers; never guess content ids. */
async function useVerb(state, poiId, pick, done, label) {
  if (done()) return;
  await wait(state, () => state.snap.prompt?.targetId === poiId, `prompt for ${poiId}`, 6000);
  const verbs = state.snap.prompt.verbs;
  const verb = pick(verbs) ?? verbs[0];
  assert.ok(verb, `${label}: a verb at ${poiId} (got ${JSON.stringify(verbs)})`);
  send(state, { t: 'interact', targetId: poiId, choice: verb.choice });
  await wait(state, done, label, 8000);
}
const byKey = key => verbs => verbs.find(v => v.key === key);

/** Talk to an NPC and walk the dialogue until the flag is set; retries with a different first choice. */
async function converse(state, npcId, flag) {
  for (let attempt = 0; attempt < 3 && !you(state).flags[flag]; attempt++) {
    send(state, { t: 'talk', npcId });
    const opened = await settle(state, () => you(state).dialogue, `dialogue with ${npcId}`, 4000);
    if (!opened) continue;
    for (let i = 0; i < 24 && you(state).dialogue; i++) {
      const d = you(state).dialogue;
      const before = `${d.node}:${d.text}`;
      if (d.choices.length) send(state, { t: 'choose', choiceId: d.choices[Math.min(i === 0 ? attempt : 0, d.choices.length - 1)].id });
      else send(state, { t: 'close' });
      await settle(state, () => { const n = you(state).dialogue; return !n || `${n.node}:${n.text}` !== before; }, 'dialogue step', 1500);
    }
    for (let i = 0; i < 6 && you(state).dialogue; i++) { send(state, { t: 'close' }); await sleep(120); }
  }
  assert.ok(you(state).flags[flag], `${npcId} conversation sets ${flag}`);
}

/** The opening, measured: bot time by phase, words a person reads, and an estimate of a first playthrough. */
function report() {
  const total = (Date.now() - T0) / 1000;
  const sum = prefix => phases.filter(p => p.label.startsWith(prefix)).reduce((a, p) => a + p.ms, 0) / 1000;
  const walk = sum('walk'), fight = sum('fight'), talk = sum('talk') + sum('verb');
  const wordsTotal = read.dialogue + read.spoken + read.journal + read.notices;
  const readingMin = wordsTotal / 180; // a careful reader
  const humanWalkMin = (walk * 1.8) / 60; // a person wanders, looks, misses a corner
  const fights = phases.filter(p => p.label.startsWith('fight')).map(p => p.ms / 1000);
  const fightMin = fights.reduce((a, s, i) => a + Math.max(s, i === 0 ? 45 : 25), 0) / 60; // the first fight teaches the dodge; a later one still costs a person a look
  const decideMin = (read.decisions * 40) / 60; // forty seconds per real choice
  const lowerBound = (total / 60 + readingMin).toFixed(1);
  const estimate = (humanWalkMin + fightMin + readingMin + decideMin).toFixed(1);
  console.log(`measure: bot ${total.toFixed(1)} s (walk ${walk.toFixed(1)} s, fight ${fight.toFixed(1)} s, talk+verbs ${talk.toFixed(1)} s)`);
  console.log(`measure: words shown ${wordsTotal} (dialogue ${read.dialogue}, spoken ${read.spoken}, journal ${read.journal}, notices ${read.notices}); decisions ${read.decisions}`);
  console.log(`measure: first playthrough lower bound ${lowerBound} min; estimate ${estimate} min (target 15–20)`);
  for (const p of phases) console.log(`  ${p.label.padEnd(22)} ${(p.ms / 1000).toFixed(1)} s`);
}

try {
  const { state: me } = await newSession();
  assert.equal(me.hello.v, 2, 'protocol v2');
  assert.equal(you(me).guest, true, 'fresh session is a guest');
  assert.equal(you(me).movement, 1, 'Movement I');
  assert.ok(dist(you(me), T.spawn) < 4, 'spawned at the guest spawn');

  // Intake: the clerk comes to you; strike until it falls.
  phase('walk: intake');
  await walk(me, ROUTE.toIntake);
  phase('fight: intake');
  const strikes = setInterval(() => send(me, { t: 'strike' }), 450);
  try { await wait(me, () => you(me).flags.intake, 'intake clerk falls', 25000); }
  finally { clearInterval(strikes); }
  assert.ok(you(me).hp > 0, 'still standing after intake');

  // First node: keep it when nobody has; the world persists between runs, so fall back to extracting.
  phase('walk: node');
  await walk(me, ROUTE.toNode);
  read.decisions++;
  const node = me.snap.nodes.find(n => n.id === 'nave-node-1');
  assert.ok(node, 'nave-node-1 is in view');
  const op = node.kept ? (node.charges > 0 ? 'extract' : null) : 'keep';
  if (op) {
    send(me, { t: 'interact', targetId: 'nave-node-1', choice: op });
    await wait(me, () => you(me).kept + you(me).extracted >= 1, `${op} the first node`);
  } else console.log('note: nave-node-1 already kept and empty; skipping the node beat');

  // Desk Three holds the aisle to the east gate: the second fight, then the second node.
  phase('walk: desk three');
  await walk(me, ROUTE.toDeskThree);
  phase('fight: desk three');
  await settle(me, () => me.snap.enemies.some(e => e.id === 'desk-three' && e.state !== 'dead'), 'desk three staffed', 50000);
  const strikes2 = setInterval(() => send(me, { t: 'strike' }), 450);
  try { await wait(me, () => you(me).flags['desk-three'], 'desk three falls', 25000); }
  finally { clearInterval(strikes2); }
  assert.ok(you(me).hp > 0, 'still standing after desk three');
  phase('walk: node 2');
  await walk(me, ROUTE.toNode2);
  read.decisions++;
  const secondNode = async (nodeId) => {
    const node = me.snap.nodes.find(n => n.id === nodeId);
    assert.ok(node, `${nodeId} is in view`);
    const op = node.kept ? (node.charges > 0 ? 'extract' : null) : 'keep';
    if (!op) return false;
    send(me, { t: 'interact', targetId: nodeId, choice: op });
    await wait(me, () => you(me).kept + you(me).extracted >= 2, `${op} the second node`);
    return true;
  };
  if (!(await secondNode('nave-node-2'))) {
    console.log('note: nave-node-2 already kept and empty; taking the third node instead');
    await walk(me, ROUTE.toNode3);
    if (!(await secondNode('nave-node-3'))) console.log('note: nave-node-3 too; the second-node beat is skipped');
  }
  await wait(me, () => !!you(me).flags['node:second'], 'the pair is read', 6000);

  // The party, in the Nave.
  phase('walk: ord');
  await walk(me, ROUTE.toOrd);
  phase('talk: ord');
  await converse(me, 'ord', 'talked:ord');
  await converse(me, 'ord', 'weather:ord');
  read.decisions++; // the honest ledger
  assert.ok(you(me).choices['ord:ledger'], 'Ord\'s ledger was answered');
  phase('walk: quill');
  await walk(me, ROUTE.toQuill);
  phase('talk: quill');
  await converse(me, 'quill', 'talked:quill');
  read.decisions++; // the print
  assert.ok(you(me).choices['quill:print'], 'Quill\'s offer was answered');
  phase('walk: nara');
  await walk(me, ROUTE.toNara);
  phase('talk: nara');
  await converse(me, 'nara', 'talked:nara');

  // The memorial recorder, then the burial.
  phase('walk: recorder');
  await walk(me, ROUTE.toRecorder);
  read.decisions++;
  phase('verb: memorial');
  await useVerb(me, 'memorial-recorder', byKey('F'), () => !!you(me).flags['heard:recorder'], 'hear the recorder');
  await useVerb(me, 'memorial-recorder', byKey('Q'), () => !!you(me).flags.memorial, 'memorial decision');
  phase('walk: plot');
  await walk(me, ROUTE.toPlot);
  phase('verb: burial');
  await useVerb(me, 'nara-plot', byKey('F'), () => !!you(me).flags['buried:nara'], 'burial');
  assert.ok(you(me).readiness > 0, 'burial gives readiness');
  phase('walk: nara again');
  await walk(me, ROUTE.backToNara);
  phase('talk: nara weather');
  await converse(me, 'nara', 'weather:nara');

  // Name the weather at the Safety plaque.
  phase('walk: plaque');
  await walk(me, ROUTE.toPlaque);
  read.decisions++;
  phase('verb: plaque');
  await useVerb(me, 'safety-plaque', byKey('F'), () => !!you(me).flags['weather:safety'], 'read the plaque');
  assert.ok(you(me).flags['weather:ord'] && you(me).flags['weather:nara'], 'Ord and Nara each gave their weather');
  await useVerb(me, 'safety-plaque', verbs => verbs.find(v => v.key === 'E') ?? verbs.find(v => v.key === 'F'), () => !!you(me).flags['weather:named'], 'name the weather');
  assert.ok(you(me).choices.weather, 'the weather has a name');

  // The going-under threshold locks a guest.
  phase('walk: threshold');
  await walk(me, ROUTE.toUnder);
  read.decisions++;
  phase('verb: threshold');
  await useVerb(me, 'going-under', byKey('F'), () => you(me).locked, 'guest lock');
  assert.equal(you(me).guest, true, 'still a guest');
  assert.equal(you(me).wink, '', 'a guest never gets a Wink');
  assert.equal(you(me).aura, 0, 'guest aura stays 0');
  send(me, { t: 'interact', targetId: 'claims-desk', choice: 'file' });
  await sleep(300);
  assert.equal(you(me).claims.length, 0, 'a guest cannot claim');

  // Link the test Angel, then go under for real.
  send(me, { t: 'link', serial: 7777, sig: 'mock' });
  await wait(me, () => !you(me).guest && you(me).serial === 7777 && !you(me).locked, 'test Angel link');
  assert.ok(you(me).aura > 0, 'an Angel has aura');
  await useVerb(me, 'going-under', byKey('F'), () => you(me).flags.under === 1, 'going under');
  await wait(me, () => me.snap.district === 'care', 'wake in the Care');
  assert.equal(you(me).movement, 2, 'Movement II');
  assert.equal(you(me).hp, 100, 'woke whole');

  phase('end');
  report();
  clearTimeout(deadline);
  console.log('PASS: Movement I — intake, first node, Ord / Quill / Nara, memorial, burial, weather named, guest lock; link 7777; under → the Care, Movement II');
  for (const ws of sockets) ws.close();
  process.exit(0);
} catch (error) {
  console.error('FAIL:', error.message);
  for (const ws of sockets) { try { ws.close(); } catch { /* closed */ } }
  process.exit(1);
}
