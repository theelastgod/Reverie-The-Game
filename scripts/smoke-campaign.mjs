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
// the low walls (x 13 rows 49..53; x 24 rows 50..53) and Desk Three's aggro (21,38). The Annex Runner walks the west
// corridor (17,30 → 6,30 → 6,47 and back) and never starts a fight; the bot hunts it on the way back to the plaque.
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

const STALL_MS = 3000; // the city ticks at 20 Hz; a socket this quiet has lost its object (a local reload, usually)

function wait(state, predicate, label, ms = 20000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(() => {
      let ok = false;
      try { ok = predicate(); } catch { ok = false; }
      if (ok) { clearInterval(timer); resolve(true); }
      else if (state.error || state.ws.readyState === WebSocket.CLOSED) { clearInterval(timer); reject(state.error ?? new Error(`${label}: socket closed`)); }
      else if (state.snapAt && Date.now() - state.snapAt > STALL_MS) { clearInterval(timer); reject(new Error(`${label}: no snapshot for ${((Date.now() - state.snapAt) / 1000).toFixed(1)} s (did the local server reload?)`)); }
      else if (Date.now() - start > ms) { clearInterval(timer); reject(new Error(`${label} did not complete`)); }
    }, 40);
  });
}

/**
 * `wrangler dev` reloads the local server whenever site/ changes (a fresh
 * `stage-play`), a quarter second later and for a second or two; a reload
 * mid-run drops every object and stalls every socket. Start only once the
 * Worker has answered three probes in a row.
 */
async function settled() {
  let quiet = 0;
  for (let i = 0; i < 60 && quiet < 3; i++) {
    try { quiet = (await fetch(`${origin}/world`)).ok ? quiet + 1 : 0; } catch { quiet = 0; }
    if (quiet < 3) await sleep(500);
  }
  assert.equal(quiet, 3, `the Worker at ${origin} answers`);
}
/** Like wait, but resolves false instead of rejecting when the time runs out. */
const settle = (state, predicate, label, ms) => wait(state, predicate, label, ms).catch(() => false);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function connect(cookie) {
  const ws = new WebSocket(origin.replace(/^http/, 'ws') + '/ws', { headers: { Cookie: cookie, Origin: origin } });
  sockets.push(ws);
  const state = { ws, hello: undefined, snap: undefined, error: undefined };
  ws.on('error', error => { state.error = error; });
  // Protocol v3: fast frames every step, slow sections when they change; fold them the way the client does
  // (other bodies joined from the roster by id; the slow frame alone refreshes the last view).
  let slow = {};
  let lastFast = null;
  const fold = fast => {
    const { roster = [], ...sections } = slow;
    const byId = new Map(roster.map(r => [r.id, r]));
    const players = fast.players.flatMap(m => (byId.has(m.id) ? [{ ...byId.get(m.id), ...m }] : []));
    return { ...sections, ...fast, players, t: 'snap' };
  };
  ws.on('message', raw => {
    let data = JSON.parse(raw.toString());
    if (data.t === 'hello') state.hello = data;
    if (data.t === 'slow') {
      const { t, v, roster, ...rest } = data;
      slow = { ...slow, ...rest };
      if (roster) { const byId = new Map((slow.roster ?? []).map(r => [r.id, r])); for (const r of roster) byId.set(r.id, r); slow.roster = [...byId.values()]; }
      if (lastFast) data = fold(lastFast); else return;
    }
    else if (data.t === 'fast') { lastFast = data; data = fold(data); }
    if (data.t === 'snap') {
      state.snap = data;
      state.snapAt = Date.now();
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

async function approach(state, target, within = 10) {
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
  try { await wait(state, () => dist(you(state), target) < within, `approach ${Math.round(target.x)},${Math.round(target.y)}`, 25000); }
  finally { clearInterval(drive); send(state, { t: 'intent', intent: {} }); }
}
const walk = async (state, points) => { for (const point of points) await approach(state, point); };

/**
 * Walk toward `target` until an enemy is in view and standing, then chase it and strike whenever it
 * is in reach, until `done`. A courier never starts the fight, so the bot has to. Resolves false when
 * the time runs out (the enemy was not on this stretch, or fell to someone else).
 */
async function hunt(state, enemyId, target, done, label, ms = 20000) {
  let strikes = null;
  const drive = setInterval(() => {
    const p = you(state);
    if (!p || state.ws.readyState !== WebSocket.OPEN) return;
    const e = (state.snap.enemies ?? []).find(x => x.id === enemyId && x.state !== 'dead');
    const goal = e ?? target;
    // Keep walking at it even in reach: a courier keeps walking too, and the strike lands only in front.
    send(state, { t: 'intent', intent: { right: p.x < goal.x - 5, left: p.x > goal.x + 5, down: p.y < goal.y - 5, up: p.y > goal.y + 5 } });
    const close = e && dist(p, e) < 50;
    if (close && !strikes) { send(state, { t: 'strike' }); strikes = setInterval(() => send(state, { t: 'strike' }), 450); }
    if (!close && strikes) { clearInterval(strikes); strikes = null; }
  }, 100);
  try { return await settle(state, done, label, ms); }
  finally { clearInterval(drive); if (strikes) clearInterval(strikes); send(state, { t: 'intent', intent: {} }); }
}
/**
 * Stand inside an interaction's reach (56 px for nodes and plots, 72 for people). The lanes end a
 * tile (48 px) from their target and a stop 10 px past the lane's end is out of reach; step in first.
 */
const stand = (state, target, reach = 56) => approach(state, target, reach - 16);

/** Use a verb at a POI through the prompt the server offers; never guess content ids. */
async function useVerb(state, poiId, pick, done, label) {
  if (done()) return;
  await wait(state, () => state.snap.prompt?.targetId === poiId, `prompt for ${poiId}`, 6000).catch(error => {
    const p = you(state);
    throw new Error(`${error.message} (standing at ${Math.round(p.x)},${Math.round(p.y)}; the prompt shows ${JSON.stringify(state.snap.prompt)}; flags ${JSON.stringify(p.flags)})`);
  });
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
  await settled();
  const { state: me } = await newSession();
  assert.equal(me.hello.v, 3, 'protocol v3');
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

  // Nodes: the world persists between runs, so each beat takes the first op the Nave still offers
  // (keep when nobody has; else extract while charges last, one back every 300 s). The pair needs two.
  const taken = () => you(me).kept + you(me).extracted;
  const takeNode = async (nodeId, target) => {
    await stand(me, target);
    const node = me.snap.nodes.find(n => n.id === nodeId);
    assert.ok(node, `${nodeId} is in view`);
    const op = node.kept ? (node.charges > 0 ? 'extract' : null) : 'keep';
    if (!op) { console.log(`note: ${nodeId} is kept and empty; skipped`); return false; }
    const before = taken();
    send(me, { t: 'interact', targetId: nodeId, choice: op });
    await wait(me, () => taken() > before, `${op} ${nodeId}`);
    return true;
  };
  phase('walk: node');
  await walk(me, ROUTE.toNode);
  read.decisions++;
  await takeNode('nave-node-1', T.node1);

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
  if (taken() < 2) await takeNode('nave-node-2', T.node2);
  if (taken() < 2) { await walk(me, ROUTE.toNode3); await takeNode('nave-node-3', T.node3); }
  if (taken() >= 2) await wait(me, () => !!you(me).flags['node:second'], 'the pair is read', 6000);
  else console.log(`note: the Nave is spent (${taken()} of the pair taken; every node kept and empty); the pair beat waits for a charge and is skipped here`);

  // The party, in the Nave.
  phase('walk: ord');
  await walk(me, ROUTE.toOrd);
  phase('talk: ord');
  await converse(me, 'ord', 'talked:ord');
  await converse(me, 'ord', 'weather:ord');
  read.decisions++; // the honest ledger
  assert.ok(you(me).choices['ord:ledger'], 'Ord\'s ledger was answered');
  if (you(me).flags['node:second']) await converse(me, 'ord', 'ord:pair');
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
  await stand(me, T.recorder);
  read.decisions++;
  phase('verb: memorial');
  await useVerb(me, 'memorial-recorder', byKey('F'), () => !!you(me).flags['heard:recorder'], 'hear the recorder');
  await useVerb(me, 'memorial-recorder', byKey('Q'), () => !!you(me).flags.memorial, 'memorial decision');
  phase('walk: plot');
  await walk(me, ROUTE.toPlot);
  await stand(me, T.plot);
  phase('verb: burial');
  await useVerb(me, 'nara-plot', byKey('F'), () => !!you(me).flags['buried:nara'], 'burial');
  assert.ok(you(me).readiness > 0, 'burial gives readiness');
  phase('walk: nara again');
  await walk(me, ROUTE.backToNara);
  phase('talk: nara weather');
  await converse(me, 'nara', 'weather:nara');

  // The Annex Runner walks the west corridor with the hour's number; take it on the way back (optional: it may be down already).
  phase('fight: runner');
  await walk(me, ROUTE.toPlaque.slice(0, 1));
  const slip = await hunt(me, 'annex-runner', at(6, 30), () => !!you(me).flags.bulletin, 'the Runner falls');
  if (slip) read.decisions++; // pin the number or fold it away
  else {
    const seen = (me.snap.enemies ?? []).find(e => e.id === 'annex-runner');
    console.log(`note: the Annex Runner was not met on the corridor (bot at ${Math.round(you(me).x)},${Math.round(you(me).y)}; runner ${seen ? `${Math.round(seen.x)},${Math.round(seen.y)} ${seen.state} hp ${seen.hp}` : 'not in view: down or elsewhere'}); the slip beat is skipped`);
  }

  // Name the weather at the Safety plaque.
  phase('walk: plaque');
  await walk(me, ROUTE.toPlaque.slice(1));
  await stand(me, T.plaque);
  read.decisions++;
  phase('verb: plaque');
  await useVerb(me, 'safety-plaque', byKey('F'), () => !!you(me).flags['weather:safety'], 'read the plaque');
  assert.ok(you(me).flags['weather:ord'] && you(me).flags['weather:nara'], 'Ord and Nara each gave their weather');
  await useVerb(me, 'safety-plaque', verbs => verbs.find(v => v.key === 'E') ?? verbs.find(v => v.key === 'F'), () => !!you(me).flags['weather:named'], 'name the weather');
  assert.ok(you(me).choices.weather, 'the weather has a name');
  if (slip) assert.match(you(me).heard, /pin the slip under the word|fold the slip away/, 'the slip was read at the naming');

  // The going-under threshold locks a guest.
  phase('walk: threshold');
  await walk(me, ROUTE.toUnder);
  await stand(me, T.under);
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
