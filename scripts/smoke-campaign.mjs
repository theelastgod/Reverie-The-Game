// Drives Movement I over the real WebSocket using only public messages, then
// links the test Angel and goes under. With --movement=2 it goes on through
// Movement II (the Care shrine, the hall, the Annex desk, the history, the
// board, Vesper) to the Organs door; with --movement=3 through the Organs, the
// garden, the Kerb's glass and Quill's forge to Movement IV. Run against local Wrangler:
//   npx wrangler dev --port 8788      (in another shell)
//   node scripts/smoke-campaign.mjs [origin] [--movement=2|3]
// Default origin http://127.0.0.1:8788. Deadline 90 s; 240 s with Movement II; 480 s with III.
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';

const origin = process.argv.find(a => a.startsWith('http')) ?? 'http://127.0.0.1:8788';
const MOVEMENT = Number((process.argv.find(a => a.startsWith('--movement=')) ?? '').split('=')[1] || 1);
const DEADLINE_S = MOVEMENT >= 3 ? 480 : MOVEMENT >= 2 ? 240 : 90;
const deadline = setTimeout(() => { console.error(`FAIL: campaign deadline (${DEADLINE_S} s) exceeded`); process.exit(1); }, DEADLINE_S * 1000);

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

// Movement II, after the wake at the Care shrine. Positions from src/sim/map.ts; lanes avoid the Care's
// pillars (x 14 rows 65/69/73), the hall room's walls (door at 11,71), the Annex cubicles (the corridor
// is x 15..20; the freeze room's door is 17,9), the Wet Grid's shop blocks (rows 33..35 and 45..47) and
// the operator's room (door at 64,47).
const T2 = {
  shrine: at(17, 61),          // care-shrine; the wake
  sexton: at(18, 64),          // home:sexton, Pim Ashe, beside the shrine
  hall: at(7, 71),             // hall-mortals (serial 7777 is House of Mortals)
  officer: at(17, 13),         // home:officer, Corvin Slate, in the Annex corridor
  desk: at(17, 6),             // safety-desk, the Annex
  window: at(7, 22),           // tax-window, west of the corridor past the cubicles
  board: at(58, 38),           // listing-board, the Wet Grid
  operator: at(64, 50),        // operator-desk; Vesper stands at 65,50
};
const ROUTE2 = {
  toHall: [at(13, 63), at(13, 71), at(9, 71)],
  hallToOfficer: [at(13, 71), at(13, 63), at(17, 58), at(17, 50), at(17, 30), at(17, 27), at(17, 15)],
  officerToDesk: [at(17, 11), at(17, 7)],
  deskToWindow: [at(17, 11), at(17, 23), at(9, 22)],
  windowToShrine: [at(17, 23), at(17, 27), at(17, 30), at(17, 50), at(17, 58), at(17, 62)],
  shrineToBoard: [at(17, 58), at(17, 50), at(17, 42), at(35, 42), at(38, 41), at(58, 41), at(58, 39)],
  boardToOperator: [at(58, 41), at(64, 44), at(64, 48), at(64, 50)],
};

// Movement III, from the operator's desk with the Organs door funded. The Organs (x 72..101, rows
// 29..54): the Strait canal at x 74..75 with its bridge on rows 40..43, furnace blocks at x 84..90
// rows 32..34 and x 84..86 rows 41..42, cable trunks at x 94 and 98 rows 31..38 and 45..52. The
// garden is back in the Care (walls at x 19 rows 66..68 and 72..74, the gap at 69..71). The Kerb
// (x 37..68, rows 2..25): terraces on row 6 and row 21 (a gap at x 49), a wall at x 45 rows 13..18.
const T3 = {
  door: at(70, 41),            // gate-wet-organs
  strait: at(77, 41),          // organ-strait
  foundry: at(86, 38),         // organ-foundry
  cable: at(96, 41),           // organ-cable
  ordStrait: at(78, 40),       // station:ord-strait, where Ord waits for the map
  garden: at(25, 70),          // wreckage-garden, the Care
  glass: at(60, 10),           // forecast-glass, the Kerb
  quillForge: at(59, 44),      // station:quill-forge, the Wet Grid
};
const ROUTE3 = {
  toStrait: [at(64, 48), at(64, 44), at(68, 41), at(70, 41), at(73, 41), at(76, 41)],
  toFoundry: [at(80, 41), at(82, 38), at(85, 38)],
  toCable: [at(88, 38), at(92, 40), at(95, 41)],
  toOrd: [at(92, 40), at(88, 38), at(80, 40)],
  // The garden's wall stands at x 19 rows 66..68: come down x 17 to row 70 first, then east through the gap.
  toGarden: [at(76, 41), at(73, 41), at(70, 41), at(68, 41), at(64, 44), at(38, 41), at(35, 42), at(20, 42), at(17, 42), at(17, 50), at(17, 58), at(17, 63), at(17, 70), at(19, 70), at(23, 70)],
  toGlass: [at(19, 70), at(17, 70), at(17, 63), at(17, 58), at(17, 50), at(17, 30), at(17, 27), at(17, 15), at(20, 14), at(33, 14), at(35, 13), at(38, 13), at(40, 10), at(58, 10)],
  toForge: [at(58, 10), at(49, 19), at(49, 23), at(53, 26), at(53, 27), at(53, 30), at(53, 38), at(58, 41)],
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
    const { roster = [], youSlow = {}, ...sections } = slow;
    const byId = new Map(roster.map(r => [r.id, r]));
    const players = fast.players.flatMap(m => (byId.has(m.id) ? [{ ...byId.get(m.id), ...m }] : []));
    return { ...sections, ...fast, players, you: { ...youSlow, ...fast.you }, t: 'snap' };
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
  // No fallback: the client can only send what the prompt offers, so a missing verb is the finding.
  const verb = pick ? pick(verbs) : verbs[0];
  assert.ok(verb, `${label}: the verb at ${poiId} is not in the prompt (offered ${JSON.stringify(verbs.map(v => `${v.key}:${v.choice}`))})`);
  send(state, { t: 'interact', targetId: poiId, choice: verb.choice });
  await wait(state, done, label, 8000).catch(error => {
    const p = you(state);
    throw new Error(`${error.message} (sent ${verb.choice} of ${JSON.stringify(verbs.map(v => `${v.key}:${v.choice}`))}; bestand ${p.bestand}; heard: ${p.heard})`);
  });
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

/** A later movement, measured the same way as the opening, from its first beat to its last. `numeral` prefixes its phase labels. */
function reportMovement(numeral, t1, read1, from) {
  const total = (Date.now() - t1) / 1000;
  const mine = phases.slice(from);
  const sum = prefix => mine.filter(p => p.label.startsWith(`${numeral} ${prefix}`)).reduce((a, p) => a + p.ms, 0) / 1000;
  const walk = sum('walk'), fight = sum('fight'), talk = sum('talk') + sum('verb');
  const words = { dialogue: read.dialogue - read1.dialogue, spoken: read.spoken - read1.spoken, journal: read.journal - read1.journal, notices: read.notices - read1.notices };
  const wordsTotal = words.dialogue + words.spoken + words.journal + words.notices;
  const decisions = read.decisions - read1.decisions;
  const fights = mine.filter(p => p.label.startsWith(`${numeral} fight`)).map(p => p.ms / 1000);
  const fightMin = fights.reduce((a, s) => a + Math.max(s, 25), 0) / 60;
  const estimate = ((walk * 1.8) / 60 + fightMin + wordsTotal / 180 + (decisions * 40) / 60).toFixed(1);
  console.log(`measure: Movement ${numeral} bot ${total.toFixed(1)} s (walk ${walk.toFixed(1)} s, fight ${fight.toFixed(1)} s, talk+verbs ${talk.toFixed(1)} s)`);
  console.log(`measure: Movement ${numeral} words shown ${wordsTotal} (dialogue ${words.dialogue}, spoken ${words.spoken}, journal ${words.journal}, notices ${words.notices}); decisions ${decisions}; estimate ${estimate} min on the spine alone`);
  for (const p of mine) console.log(`  ${p.label.padEnd(22)} ${(p.ms / 1000).toFixed(1)} s`);
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
  // Walk at the clerk wherever it stands (a load run may have left it dead, returning or on the far side of its leash) and strike in reach.
  const fell = await hunt(me, 'intake-clerk', T.intake, () => !!you(me).flags.intake, 'intake clerk falls', 40000);
  if (!fell) {
    const p = you(me);
    const clerk = (me.snap.enemies ?? []).find(e => e.id === 'intake-clerk');
    throw new Error(`intake clerk falls did not complete (bot at ${Math.round(p.x)},${Math.round(p.y)} hp ${p.hp} dead ${p.dead}; clerk ${clerk ? `${clerk.state} hp ${clerk.hp} at ${Math.round(clerk.x)},${Math.round(clerk.y)}` : 'not in view'}; heard: ${p.heard})`);
  }
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
  console.log('PASS: Movement I — intake, first node, Ord / Quill / Nara, memorial, burial, weather named, guest lock; link 7777; under → the Care, Movement II');

  if (MOVEMENT >= 2) {
    const T1 = Date.now();
    const read1 = { ...read };
    const from = phases.length;

    // The wake is at the shrine: rest, then read your House hall in the Care.
    phase('II verb: shrine');
    assert.ok(dist(you(me), T2.shrine) < 60, 'woke at the Care shrine');
    await stand(me, T2.shrine);
    await useVerb(me, 'care-shrine', byKey('F'), () => !!you(me).flags.shrine, 'rest at the shrine');
    assert.equal(you(me).house, 'mortals', 'serial 7777 is House of Mortals');
    phase('II talk: sexton');
    await stand(me, T2.sexton, 72);
    await converse(me, 'sexton', 'talked:sexton');
    phase('II walk: hall');
    await walk(me, ROUTE2.toHall);
    await stand(me, T2.hall);
    phase('II verb: hall');
    await useVerb(me, 'hall-mortals', byKey('F'), () => !!you(me).flags.hall, 'read the hall plaque');
    assert.ok(you(me).wink, 'an Angel sees the Wink');

    // The Officer stops you in the Annex corridor: say what you want the weather to be (the bot says held).
    phase('II walk: annex');
    await walk(me, ROUTE2.hallToOfficer);
    await stand(me, T2.officer, 72);
    assert.equal(me.snap.district, 'annex', 'through the Nave to the Annex');
    read.decisions++;
    phase('II talk: officer');
    await converse(me, 'officer', 'talked:officer');
    assert.equal(you(me).choices['annex:weather'], 'held', 'told the Officer: held');
    // Then the freeze desk: refuse (it costs nothing and keeps the Passing possible); the desk keeps both answers.
    phase('II walk: desk');
    await walk(me, ROUTE2.officerToDesk);
    await stand(me, T2.desk);
    read.decisions++;
    phase('II verb: freeze');
    await useVerb(me, 'safety-desk', byKey('Q'), () => !!you(me).flags.freeze, 'refuse the freeze');
    assert.equal(you(me).choices.freeze, 'refused', 'the freeze was refused');
    assert.match(you(me).heard, /You said held in the corridor/, 'the desk remembers the corridor');

    // The tax window on the way back: pay the hour's tithe now when the purse allows, else let it ride.
    phase('II walk: window');
    await walk(me, ROUTE2.deskToWindow);
    await stand(me, T2.window);
    read.decisions++;
    phase('II verb: tithe');
    // The window also carries a side hour's verb on E, so pick the spine's verbs by their choice, not their key.
    const canPay = you(me).bestand >= 4;
    await useVerb(me, 'tax-window', verbs => verbs.find(v => v.choice === (canPay ? 'pay' : 'ride')), () => !!you(me).flags.tithe, 'the tithe decided');
    assert.equal(you(me).choices.tithe, canPay ? 'paid' : 'rode', 'the tithe was decided');

    // The history: a prior hour of this serial stands in the Care; Q at the shrine faces it.
    phase('II walk: shrine again');
    await walk(me, ROUTE2.windowToShrine);
    await stand(me, T2.shrine);
    phase('II verb: history');
    if ((me.snap.history ?? []).some(m => m.serial === 7777)) {
      await useVerb(me, 'care-shrine', byKey('Q'), () => !!you(me).flags.history, 'face the history');
    } else console.log('note: serial 7777 has no history mark on this world; the history beat walks on');

    // The listing board on the Wet Grid, then Vesper's office.
    phase('II walk: board');
    await walk(me, ROUTE2.shrineToBoard);
    await stand(me, T2.board);
    assert.equal(me.snap.district, 'wet', 'through the Nave to the Wet Grid');
    phase('II verb: board');
    await useVerb(me, 'listing-board', byKey('F'), () => !!you(me).flags.board, 'read the board');
    phase('II walk: operator');
    await walk(me, ROUTE2.boardToOperator);
    await stand(me, T2.operator, 72);
    read.decisions++;
    phase('II talk: vesper');
    await converse(me, 'vesper', 'operator');
    assert.equal(you(me).choices.operator, 'take', 'took the private yield');
    await wait(me, () => you(me).flags.m3 === 1 && you(me).movement === 3, 'Movement III opens', 6000).catch(error => {
      const p = you(me);
      throw new Error(`${error.message} (movement ${p.movement}, m3 ${p.flags.m3}, quests ${JSON.stringify(p.quests)}, operator ${p.choices.operator}, tithe ${p.choices.tithe}, history ${p.flags.history}, board ${p.flags.board}; heard: ${p.heard})`);
    });
    assert.equal(you(me).current, 'cold', 'Cold is a current');

    phase('end II');
    reportMovement('II', T1, read1, from);
    console.log('PASS: Movement II — the shrine, Pim Ashe at the wake, the hall, Corvin Slate in the corridor, the freeze refused, the tithe decided, the history faced, the board read, the private yield taken → Movement III');
  }

  if (MOVEMENT >= 3) {
    const T2s = Date.now();
    const read2 = { ...read };
    const from = phases.length;

    // The Organs door is funded: through it to the three organs, west to east.
    phase('III walk: strait');
    await walk(me, ROUTE3.toStrait);
    await stand(me, T3.strait);
    assert.equal(me.snap.district, 'organs', 'through the funded door into the Organs');
    phase('III verb: strait');
    await useVerb(me, 'organ-strait', verbs => verbs.find(v => v.choice === 'study'), () => !!you(me).flags.strait, 'study the Strait');
    phase('III walk: foundry');
    await walk(me, ROUTE3.toFoundry);
    await stand(me, T3.foundry);
    phase('III verb: foundry');
    await useVerb(me, 'organ-foundry', verbs => verbs.find(v => v.choice === 'study'), () => !!you(me).flags.foundry, 'study the Foundry');
    phase('III walk: cable');
    await walk(me, ROUTE3.toCable);
    await stand(me, T3.cable);
    phase('III verb: cable');
    await useVerb(me, 'organ-cable', verbs => verbs.find(v => v.choice === 'study'), () => !!you(me).flags.cable, 'study the Cable');

    // Ord at the Strait puts the three together.
    phase('III walk: ord');
    await walk(me, ROUTE3.toOrd);
    await stand(me, T3.ordStrait, 72);
    phase('III talk: ord');
    await converse(me, 'ord', 'map');

    // The garden in the Care: the yield was taken, so Nara waits until it is in the ground.
    assert.equal(you(me).party.nara, 'waiting', 'Nara waits on the garden after the yield');
    phase('III walk: garden');
    await walk(me, ROUTE3.toGarden);
    await stand(me, T3.garden, 64);
    assert.equal(me.snap.district, 'care', 'back in the Care');
    phase('III verb: garden');
    await useVerb(me, 'wreckage-garden', verbs => verbs.find(v => v.choice === 'bury'), () => !!you(me).flags.garden, 'bury the garden');
    assert.equal(you(me).party.nara, 'with', 'Nara speaks again');

    // Last season, in the forecast glass on the Kerb.
    phase('III walk: glass');
    await walk(me, ROUTE3.toGlass);
    await stand(me, T3.glass);
    assert.equal(me.snap.district, 'kerb', 'through the Annex to the Kerb');
    phase('III verb: glass');
    await useVerb(me, 'forecast-glass', verbs => verbs.find(v => v.choice === 'season'), () => !!you(me).flags.failed, 'face last season');

    // Quill at the forge tray: learn to spot the copy (the first choice), which turns the movement.
    phase('III walk: forge');
    await walk(me, ROUTE3.toForge);
    await stand(me, T3.quillForge, 72);
    assert.equal(me.snap.district, 'wet', 'down to the Wet Grid');
    read.decisions++;
    phase('III talk: quill');
    await converse(me, 'quill', 'forge');
    assert.equal(you(me).choices.forge, 'spot', 'learned to spot the copy');
    await wait(me, () => you(me).movement === 4, 'Movement IV opens', 6000).catch(error => {
      const p = you(me);
      throw new Error(`${error.message} (movement ${p.movement}, quests ${JSON.stringify(p.quests)}, flags strait ${p.flags.strait} foundry ${p.flags.foundry} cable ${p.flags.cable} map ${p.flags.map} garden ${p.flags.garden} failed ${p.flags.failed} forge ${p.flags.forge})`);
    });

    phase('end III');
    reportMovement('III', T2s, read2, from);
    console.log('PASS: Movement III — the Strait, the Foundry, the Cable, Ord\'s map, the garden buried, last season in the glass, the copy spotted → Movement IV');
  }

  clearTimeout(deadline);
  for (const ws of sockets) ws.close();
  process.exit(0);
} catch (error) {
  console.error('FAIL:', error.message);
  for (const ws of sockets) { try { ws.close(); } catch { /* closed */ } }
  process.exit(1);
}
