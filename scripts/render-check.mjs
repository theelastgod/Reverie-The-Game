// Loads the built client in the preinstalled Chromium, screenshots the title,
// the Nave with the HUD and (when a prompt shows) a dialogue, and reports
// frame pacing. Usage: node scripts/render-check.mjs [origin]
// Default origin http://127.0.0.1:8788/play/ (local Wrangler serving site/play).
// Browsers are preinstalled under PLAYWRIGHT_BROWSERS_PATH; this never runs `playwright install`.
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const origin = process.argv[2] ?? 'http://127.0.0.1:8788/play/';
const shots = '.rebuild/shots';
// A GPU-less sandbox (SwiftShader) rasterises the canvas in software at ~16 fps; set RENDER_MIN_FPS to run there.
const MIN_FPS = Number(process.env.RENDER_MIN_FPS ?? 30);
// Two page loads on the landing page and two city boots (desktop, then phone) on software WebGL: four minutes is the bound.
const deadline = setTimeout(() => { console.error('FAIL: render-check deadline (240 s) exceeded'); process.exit(1); }, 240000);

function findChromium() {
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers', join(process.env.HOME ?? '', '.cache/ms-playwright')].filter(Boolean);
  for (const root of roots) {
    if (!existsSync(root)) continue;
    const dirs = readdirSync(root).filter(d => /^chromium(_headless_shell)?-\d+$/.test(d)).sort((a, b) => (a.startsWith('chromium-') ? -1 : 1));
    for (const dir of dirs) {
      for (const bin of ['chrome-linux/chrome', 'chrome-linux/headless_shell', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-win/chrome.exe']) {
        const path = join(root, dir, bin);
        if (existsSync(path)) return path;
      }
    }
  }
  return undefined; // fall back to whatever playwright-core resolves itself
}

mkdirSync(shots, { recursive: true });
// RENDER_CHROMIUM names a browser outright (GitHub's runner has Chrome at /usr/bin/google-chrome); else the preinstalled one.
const executablePath = process.env.RENDER_CHROMIUM || findChromium();
console.log(`chromium: ${executablePath ?? '(playwright default)'}`);
const browser = await chromium.launch({ executablePath, headless: true, args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const failures = [];
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  // A failed resource names only its status in the console; its URL is the message's location, kept so the list
  // tells the proxy's refusals (the fonts) from a file the city itself failed to serve.
  page.on('console', m => { if (m.type() === 'error') errors.push(m.location()?.url ? `${m.text()} @ ${m.location().url}` : m.text()); });

  // The landing page first, and the city's log on it: when the log route has lines, the band must show them.
  const root = origin.replace(/play\/?$/, '');
  if (root !== origin) {
    await page.goto(root, { waitUntil: 'load', timeout: 30000 });
    await page.waitForFunction(() => document.getElementById('city-log-band')?.dataset.state === 'done', null, { timeout: 15000 })
      .catch(() => failures.push('the landing page never finished reading the city log'));
    const shown = await page.locator('#city-log li').count();
    const route = await fetch(`${root}log/recent?kind=news&limit=8`).then(r => (r.ok ? r.json() : null)).catch(() => null);
    const written = route?.ok && Array.isArray(route.events) ? route.events.length : 0;
    if (route?.ok && !Array.isArray(route.events)) failures.push('the log route answered without an events array');
    await page.screenshot({ path: join(shots, '00-landing.png'), fullPage: true });
    console.log(`landing: ${shown} log line(s) shown; the route has ${route ? written : 'no answer'}`);
    if (written > 0 && shown === 0) failures.push('the city log has lines but the landing page shows none');
    if (written === 0 && shown > 0) failures.push('the landing page shows log lines the route does not have');
  }

  await page.goto(origin, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('#title', { timeout: 15000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(shots, '01-title.png') });

  // Enter the city: the title's primary button, else any key.
  const enter = page.locator('#title button', { hasText: /enter/i }).first();
  if (await enter.count()) await enter.click(); else await page.keyboard.press('Enter');
  await page.waitForSelector('#hud:not([hidden])', { timeout: 20000 });
  await page.waitForSelector('canvas', { timeout: 20000 });
  await page.waitForFunction(() => {
    const el = document.querySelector('#hud-connection');
    return !el || /online/i.test(el.textContent ?? '');
  }, null, { timeout: 20000 }).catch(() => failures.push('connection chip never reported online'));
  await page.waitForTimeout(500);

  // Two exchanges through the server and back, walked by time (170 px/s over 48 px tiles, src/sim/constants.ts),
  // each leg nudged by half tiles until the verb shows. First Nara Vale at her home (8,49): seven tiles south and
  // three east of the guest spawn (5,42) with nothing in the way (the pillar columns start at x 9, the Intake
  // Clerk's aggro at 13,42 reaches five tiles), and any present person offers Speak, which opens a dialogue.
  await page.mouse.click(683, 384);
  const tileMs = (1000 * 48) / 170;
  const hold = async (key, ms) => { await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key); await page.waitForTimeout(350); };
  // The HUD hides the prompt when nothing is in reach and leaves the last name and buttons in the DOM, so a hidden
  // prompt reads as empty here; otherwise a thing walked away from would still seem in reach.
  const readPrompt = () => page.evaluate(() => { const p = document.querySelector('#hud-prompt'); return p && !p.hidden ? (p.textContent ?? '') : ''; }).catch(() => '');
  const readVerbs = () => page.evaluate(() => {
    const p = document.querySelector('#hud-prompt');
    if (!p || p.hidden) return [];
    return [...p.querySelectorAll('.prompt-verbs button')]
      .map(b => ({ key: (b.querySelector('kbd')?.textContent ?? '').trim(), label: (b.textContent ?? '').replace(/^\s*[A-Z]\s*/, '').trim() }))
      .filter(v => /^[A-Z]$/.test(v.key));
  }).catch(() => []);
  const dialogueShown = () => page.evaluate(() => { const d = document.querySelector('#hud-dialogue'); return !!d && !d.hidden; });
  const focusedName = () => page.evaluate(() => { const a = document.activeElement; return !a || a === document.body ? 'the game' : `${a.tagName.toLowerCase()}#${a.id || a.className.split(' ')[0]}`; });
  const readA11y = () => page.evaluate(() => {
    const dialogue = document.querySelector('#hud-dialogue');
    const speaker = document.getElementById(dialogue?.getAttribute('aria-labelledby') ?? '');
    const meters = [...document.querySelectorAll('#hud-bars .bar')].map(bar => ({
      name: bar.getAttribute('aria-label'),
      role: bar.getAttribute('role'),
      now: Number(bar.getAttribute('aria-valuenow')),
      max: Number(bar.getAttribute('aria-valuemax')),
      shown: Number(bar.querySelector('.bar-value')?.textContent),
    }));
    return {
      dialogRole: dialogue?.getAttribute('role'),
      dialogOpen: !!dialogue && !dialogue.hidden,
      speakerNamed: !!speaker && (speaker.textContent ?? '').trim().length > 0,
      noticesLive: document.querySelector('#hud-notices')?.getAttribute('aria-live'),
      connectionRole: document.querySelector('#hud-connection')?.getAttribute('role'),
      meters,
      map: document.querySelector('#hud-minimap canvas')?.getAttribute('aria-label') ?? '',
      district: (document.querySelector('#hud-district .chip-text')?.textContent ?? '').trim(),
    };
  });
  /** Walks the legs, then nudges by half tiles until a wanted verb shows; the nudges taken are kept on the result. */
  const walkTo = async (legs, wanted, nudgeKey, nudges) => {
    for (const [key, tiles] of legs) await hold(key, tiles * tileMs);
    let verbs = await readVerbs();
    let nudged = 0;
    for (; nudged < nudges && !verbs.some(v => wanted.test(v.label)); nudged++) {
      await hold(nudgeKey, tileMs / 2);
      verbs = await readVerbs();
    }
    verbs.nudged = nudged;
    return verbs;
  };
  // Anchored on the low wall at x 13 (rows 49 to 53): south past her row, east into the wall (an over-walk stops
  // there whatever the drift), four tiles west; a leg walked by time alone missed her reach one run in a few.
  let verbs = await walkTo([['KeyS', 8], ['KeyD', 10], ['KeyA', 4]], /speak/i, 'KeyW', 4);
  await page.screenshot({ path: join(shots, '02-nave.png') });
  let promptText = await readPrompt();
  const speak = verbs.find(v => /speak/i.test(v.label));
  let exchange = 'no one in reach';
  let focusStep = 'no dialogue opened; skipped';
  let a11y = null;
  if (speak) {
    await page.keyboard.press(`Key${speak.key}`);
    const opened = await page.waitForFunction(() => { const d = document.querySelector('#hud-dialogue'); return !!d && !d.hidden; }, null, { timeout: 5000 }).then(() => true).catch(() => false);
    await page.waitForTimeout(300);
    exchange = opened ? `a dialogue after ${speak.label}` : `no dialogue after ${speak.label}`;
    if (!opened) failures.push(`${speak.label} opened no dialogue`);
    await page.screenshot({ path: join(shots, '03-dialogue.png') });
    if (opened) {
      a11y = await readA11y(); // with the dialogue open: a dialog named by its speaker
      // The opened dialogue takes focus itself (the verb was pressed from the canvas, so nothing else had it):
      // Tab reaches its first choice, Escape closes it through the server (a Continue node's close advances to
      // the next line first, so Escape repeats until the panel is gone), and focus goes back to the game.
      const onPanel = await page.evaluate(() => document.activeElement?.id === 'hud-dialogue');
      await page.keyboard.press('Tab');
      const onChoice = await page.evaluate(() => !!document.activeElement?.matches('#hud-dialogue .dlg-choices button'));
      let closed = false;
      for (let i = 0; i < 6 && !closed; i++) {
        await page.keyboard.press('Escape');
        closed = await page.waitForFunction(() => document.querySelector('#hud-dialogue')?.hidden === true, null, { timeout: 1500 }).then(() => true).catch(() => false);
      }
      const back = await focusedName();
      if (!onPanel) failures.push('the opened dialogue did not take focus');
      if (!onChoice) failures.push('Tab from the dialogue did not reach its first choice');
      if (!closed) failures.push('Escape inside the dialogue did not close it');
      else if (back !== 'the game') failures.push(`focus stayed on ${back} after the dialogue closed`);
      focusStep = `${onPanel ? 'the dialogue took focus' : 'focus not taken'}, Tab → ${onChoice ? 'its first choice' : 'elsewhere'}, Escape → ${closed ? 'closed' : 'still open'}, focus → ${back}`;
    }
  } else {
    failures.push(`no one offered Speak at Nara's home (prompt: ${JSON.stringify(promptText.trim())})`);
    await page.screenshot({ path: join(shots, '03-dialogue.png') });
  }
  console.log(`exchange: ${exchange}`);
  console.log(`dialogue focus: ${focusStep}`);

  // Then a node, whose verb answers without a dialogue (an extract is a heard line and a ledger change; a keep, a
  // heard line; a refusal, a heard line too). Two tiles west to the x 6 lane (the courier's corridor, clear from
  // row 48 up to row 30 and walled to the east between), then north into the wall at the corridor's top: an
  // over-walk stops there whatever the drift so far, so the wall is the anchor every later leg starts from.
  // Four tiles south is the fourth Nave node at 6,34. When it offers nothing (a keep holds until someone
  // extracts and charges come back one per 300 s, which two checks in a row on a lived-in world leave it in),
  // back to the wall, five tiles east along the row 30 crossing and six south is the first node at 11,36.
  const isNodeVerb = v => /extract|keep/i.test(v.label);
  verbs = await walkTo([['KeyA', 2], ['KeyW', 22], ['KeyS', 4]], /extract|keep/i, 'KeyS', 4);
  let nodeName = 'the fourth node';
  if (!verbs.some(isNodeVerb)) {
    verbs = await walkTo([['KeyW', 8], ['KeyD', 5], ['KeyS', 6]], /extract|keep/i, 'KeyS', 4);
    nodeName = 'the first node (the fourth offered nothing)';
  }
  promptText = await readPrompt();
  const nodeVerb = verbs.find(isNodeVerb);
  let node = 'nothing in reach';
  if (nodeVerb) {
    // The notices list is capped, so its count can stay flat when a line arrives; the HUD keys the list by its lines.
    const answer = () => page.evaluate(() => ({
      notices: document.querySelector('#hud-notices')?.getAttribute('data-key') ?? '',
      heard: (document.querySelector('#hud-heard')?.textContent ?? '').trim(),
      ledger: (document.querySelector('#hud-ledger')?.textContent ?? '').trim(),
    }));
    const before = await answer();
    await page.keyboard.press(`Key${nodeVerb.key}`);
    await page.waitForTimeout(900);
    const after = await answer();
    const seen = [];
    if (after.heard && after.heard !== before.heard) seen.push(`heard "${after.heard}"`);
    if (after.ledger !== before.ledger) seen.push(`the ledger reads "${after.ledger}"`);
    if (after.notices !== before.notices) seen.push('a notice');
    if (await dialogueShown()) seen.push('a dialogue');
    node = seen.length ? `after ${nodeVerb.label} at ${nodeName}: ${seen.join(', ')}` : `no visible answer to ${nodeVerb.label} at ${nodeName}`;
    if (!seen.length) failures.push(`the node's ${nodeVerb.label} verb changed nothing visible`);
  } else {
    failures.push(`neither Nave node offered a verb (prompt: ${JSON.stringify(promptText.trim())})`);
  }
  console.log(`node: ${node}`);

  // Keyboard reach: from the canvas, Shift+Tab enters the HUD's controls (the browser starts from their end),
  // another Shift+Tab moves within them, and Escape hands the keys back to the game (focus leaves the HUD).
  const focusedControl = () => page.evaluate(() => {
    const a = document.activeElement;
    const hud = document.getElementById('hud');
    if (!a || !hud || !hud.contains(a) || a === hud) return '';
    // Named by id, else by class and text, so two verb buttons (E, Q) read as different controls.
    return a.id ? `${a.tagName.toLowerCase()}#${a.id}` : `${a.tagName.toLowerCase()}.${a.className.split(' ')[0]} "${(a.textContent ?? '').replace(/\s+/g, ' ').trim()}"`;
  });
  await page.mouse.click(683, 384);
  await page.keyboard.press('Shift+Tab');
  const first = await focusedControl();
  await page.keyboard.press('Shift+Tab');
  const second = await focusedControl();
  await page.keyboard.press('Escape');
  const after = await focusedControl();
  if (!first) failures.push('Shift+Tab from the canvas focused nothing in the HUD');
  else if (!second || second === first) failures.push(`a second Shift+Tab did not move focus within the HUD (${first} → ${second || 'nothing'})`);
  if (after) failures.push(`Escape left focus on ${after}`);
  console.log(`keyboard: Shift+Tab → ${first || 'nothing'}, again → ${second || 'nothing'}, Escape → ${after || 'the game'}`);

  // What assistive technology is told: the dialogue is a dialog named by its speaker (read while it was open,
  // above), the notices and the connection chip are live, and every bar is a meter whose value is the number it shows.
  if (!a11y) a11y = await readA11y();
  // The map's sentence names the district the chip shows.
  if (!a11y.map.startsWith('City map.') || !a11y.district || !a11y.map.toUpperCase().includes(a11y.district.toUpperCase())) {
    failures.push(`the map's label "${a11y.map}" does not name the district "${a11y.district}"`);
  }
  if (a11y.dialogRole !== 'dialog') failures.push('the dialogue panel is not a dialog');
  if (a11y.dialogOpen && !a11y.speakerNamed) failures.push('the open dialogue names no speaker for assistive tech');
  if (a11y.noticesLive !== 'polite') failures.push('the notices are not a live region');
  if (a11y.connectionRole !== 'status') failures.push('the connection chip is not a status');
  if (a11y.meters.length !== 4) failures.push(`${a11y.meters.length} bars, not 4`);
  for (const m of a11y.meters) {
    if (m.role !== 'meter' || !m.name) failures.push(`bar ${m.name ?? '?'} is not a named meter`);
    if (!(m.max > 0) || m.now < 0 || m.now > m.max || m.now !== m.shown) failures.push(`meter ${m.name}: value ${m.now} of ${m.max}, shows ${m.shown}`);
  }
  console.log(`a11y: dialog ${a11y.dialogOpen ? 'open, named' : 'closed'}; meters ${a11y.meters.map(m => `${m.name} ${m.now}/${m.max}`).join(', ')}; map "${a11y.map}"`);

  // Frame pacing over three seconds.
  const fps = await page.evaluate(() => new Promise(resolve => {
    let frames = 0;
    const start = performance.now();
    const tick = () => {
      frames++;
      if (performance.now() - start >= 3000) resolve(frames / ((performance.now() - start) / 1000));
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }));
  const canvases = await page.locator('canvas').count();
  const renderer = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2') ?? document.createElement('canvas').getContext('webgl');
    const info = gl?.getExtension('WEBGL_debug_renderer_info');
    return gl && info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : 'no webgl';
  }).catch(() => 'unknown');
  console.log(`canvas: ${canvases}  avg fps: ${fps.toFixed(1)}  gl: ${renderer}  prompt: ${JSON.stringify(promptText.trim())}`);
  if (/swiftshader|software|llvmpipe/i.test(String(renderer))) console.log('note: software WebGL; frame pacing here does not reflect a GPU-backed browser');
  if (errors.length) console.log(`page errors: ${errors.slice(0, 5).join(' | ')}`);
  // Errors the proxy causes (the fonts' certificate) are the container's; a request the city's own origin failed
  // (a 404 on a file the client asks for by name, as the generated manifest was until it was committed) is ours.
  const own = errors.filter(e => /Failed to load resource/.test(e) && e.includes(`@ ${origin.replace(/\/play\/?$/, '')}`));
  if (own.length) failures.push(`the city failed to serve ${own.length} file(s) the client asked for: ${own.slice(0, 3).map(e => e.replace(/^.*@ /, '')).join(', ')}`);
  if (canvases === 0) failures.push('no canvas rendered');
  if (fps < MIN_FPS) failures.push(`fps ${fps.toFixed(1)} < ${MIN_FPS}`);

  // A phone, 390 by 844: the landing page, then the city. Nothing of the HUD may run off the screen, the page must not
  // scroll sideways, and the minimap and the journal's tab must sit under the top chips, not on them. The desktop page
  // closes first: two cities rendering in software at once starve each other's boot. This pass also asks for reduced
  // motion, so the HUD's CSS branch and the canvas's (a strike flash and a dodge fading in place) run in a browser.
  await page.close();
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const phoneErrors = [];
  phone.on('pageerror', e => phoneErrors.push(String(e)));
  phone.on('console', m => { if (m.type() === 'error') phoneErrors.push(m.location()?.url ? `${m.text()} @ ${m.location().url}` : m.text()); });
  // A strike and a heavy leave no line in the HUD, so the phone pass reads the wire: every message the client
  // sends is noted by its kind, and the touch step asks what a tap and a held second finger sent.
  await phone.addInitScript(() => {
    window.__sent = [];
    const send = WebSocket.prototype.send;
    WebSocket.prototype.send = function (data) {
      try { window.__sent.push(JSON.parse(String(data)).t); } catch { /* not a message of ours */ }
      return send.call(this, data);
    };
  });
  try {
    if (root !== origin) {
      await phone.goto(root, { waitUntil: 'load', timeout: 30000 });
      await phone.waitForFunction(() => document.getElementById('city-log-band')?.dataset.state === 'done', null, { timeout: 15000 }).catch(() => {});
      // Not fullPage: a full-page shot resizes the emulated screen and Chromium drops the touch emulation with it
      // (maxTouchPoints 0, pointer: coarse false from then on), and the touch step below needs both.
      await phone.screenshot({ path: join(shots, '05-phone-landing.png') });
    }
    await phone.goto(origin, { waitUntil: 'load', timeout: 30000 });
    await phone.waitForSelector('#title', { timeout: 15000 });
    const enterPhone = phone.locator('#title button', { hasText: /enter/i }).first();
    if (await enterPhone.count()) await enterPhone.click(); else await phone.keyboard.press('Enter');
    await phone.waitForSelector('#hud:not([hidden])', { timeout: 30000 });
    await phone.waitForTimeout(1500);
    console.log(`phone pointer: ${await phone.evaluate(() => `coarse ${matchMedia('(pointer: coarse)').matches}, touch points ${navigator.maxTouchPoints}, width ${window.innerWidth}`)}`);
    const fit = await phone.evaluate(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const box = el => el.getBoundingClientRect();
      const visible = el => { const r = box(el); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
      const name = el => el.id || el.className.split(' ')[0];
      const off = [];
      for (const el of document.querySelectorAll('#hud .chip, #hud .panel')) {
        if (!visible(el)) continue;
        const r = box(el);
        if (r.right > w + 1 || r.left < -1 || r.bottom > h + 1) off.push(`${name(el)} at ${Math.round(r.left)},${Math.round(r.top)} to ${Math.round(r.right)},${Math.round(r.bottom)}`);
      }
      const chips = [...document.querySelectorAll('#hud-top .chip')].filter(visible).map(box);
      const chipsBottom = Math.max(0, ...chips.map(r => r.bottom));
      const minimap = document.getElementById('hud-minimap');
      const journal = document.getElementById('hud-journal');
      const stacked = [];
      if (minimap && visible(minimap) && box(minimap).top < chipsBottom - 1) stacked.push('the minimap sits on the top chips');
      if (journal && minimap && visible(journal) && box(journal).top < box(minimap).bottom - 1) stacked.push("the journal's tab sits on the minimap");
      return { off, stacked, scrollW: document.documentElement.scrollWidth, w };
    });
    await phone.screenshot({ path: join(shots, '06-phone-nave.png') });
    console.log(`phone: ${fit.off.length} element(s) off the screen, ${fit.stacked.length} stacked${fit.off.length ? `: ${fit.off.join('; ')}` : ''}${fit.stacked.length ? `: ${fit.stacked.join('; ')}` : ''}`);
    // Under reduced motion: the page sees the query, the marquee's animation is off, and a strike and a dodge (the
    // canvas's fade-in-place branches) run without a script error, which the phone-only error check below catches.
    await phone.keyboard.press('Space');
    await phone.keyboard.down('Shift');
    await phone.keyboard.press('KeyD');
    await phone.keyboard.up('Shift');
    await phone.waitForTimeout(500);
    const motion = await phone.evaluate(() => {
      const marquee = document.querySelector('.marquee-text');
      return {
        reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
        marquee: marquee ? getComputedStyle(marquee).animationName : 'no marquee',
      };
    });
    console.log(`reduced motion: query ${motion.reduced ? 'seen' : 'not seen'}; marquee animation ${motion.marquee}`);
    if (!motion.reduced) failures.push('the phone pass asked for reduced motion and the page did not see it');
    if (motion.marquee !== 'no marquee' && motion.marquee !== 'none') failures.push(`the marquee still animates under reduced motion (${motion.marquee})`);

    // The one-stick touch scheme, with real touch events: a finger down on the canvas plants the stick, a drag
    // north walks (the map's sentence moves the objective), a second finger held while the stick is down sends a
    // heavy and its lift sends nothing, the first finger up hides the stick, a tap sends a strike, and the dodge
    // chip is a button whose press starts the cooldown.
    const mapLabel = () => phone.evaluate(() => document.querySelector('#hud-minimap canvas')?.getAttribute('aria-label') ?? '');
    const stickShown = () => phone.evaluate(() => !document.getElementById('hud-stick')?.hidden);
    const sentSince = mark => phone.evaluate(from => window.__sent.slice(from).filter(t => t !== 'intent'), mark);
    const sentCount = () => phone.evaluate(() => window.__sent.length);
    const cdp = await phone.context().newCDPSession(phone);
    const mapBefore = await mapLabel();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 470 }] });
    await phone.waitForTimeout(100);
    const planted = await stickShown();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y: 400 }] });
    await phone.waitForTimeout(1200);
    await phone.screenshot({ path: join(shots, '07-phone-stick.png') });
    // The second finger, held past the heavy threshold (350 ms) while the first still drags.
    const beforeHeavy = await sentCount();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 400, id: 0 }, { x: 300, y: 600, id: 1 }] });
    await phone.waitForTimeout(600);
    const heldSent = await sentSince(beforeHeavy);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: 195, y: 400, id: 0 }] });
    await phone.waitForTimeout(200);
    const liftSent = (await sentSince(beforeHeavy)).slice(heldSent.length);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await phone.waitForTimeout(400);
    const lifted = !(await stickShown());
    const mapAfter = await mapLabel();
    const beforeTap = await sentCount();
    await phone.touchscreen.tap(260, 470);
    await phone.waitForTimeout(300);
    const tapSent = await sentSince(beforeTap);
    const dodgeChip = phone.locator('#hud-dodge');
    const dodgeVisible = await dodgeChip.isVisible();
    if (dodgeVisible) await dodgeChip.tap();
    await phone.waitForTimeout(500);
    const dodgeText = (await dodgeChip.textContent().catch(() => '')) ?? '';
    const dodgeState = await phone.evaluate(() => { const d = document.getElementById('hud-dodge'); return `coarse ${matchMedia('(pointer: coarse)').matches}, display ${d ? getComputedStyle(d).display : 'no chip'}`; });
    const walked = mapAfter !== mapBefore;
    console.log(`touch: stick ${planted ? 'planted' : 'not planted'}, ${lifted ? 'lifted' : 'still shown'}; drag north ${walked ? 'walked' : 'did not walk'} ("${mapBefore.replace(/^.*objective, /, '')}" → "${mapAfter.replace(/^.*objective, /, '')}"); second finger held → sent [${heldSent}], lifted → sent [${liftSent}]; tap → sent [${tapSent}]; dodge chip ${dodgeVisible ? `pressed → "${dodgeText.trim()}"` : `not shown (${dodgeState})`}`);
    if (!planted) failures.push('a finger on the canvas did not plant the stick');
    if (!lifted) failures.push('the stick stayed after the finger lifted');
    if (!walked) failures.push('a drag on the stick did not walk the body');
    if (heldSent.join() !== 'heavy') failures.push(`a second finger held on the stick sent [${heldSent}], not one heavy`);
    if (liftSent.length) failures.push(`the second finger's lift after a heavy sent [${liftSent}]`);
    if (tapSent.join() !== 'strike') failures.push(`a tap on the canvas sent [${tapSent}], not one strike`);
    if (!dodgeVisible) failures.push(`the dodge chip is not a visible button on a coarse pointer (${dodgeState})`);
    else if (!/STEP/.test(dodgeText)) failures.push(`the dodge button did not start a cooldown ("${dodgeText.trim()}")`);
    if (fit.off.length) failures.push(`phone: off the screen: ${fit.off.join('; ')}`);
    if (fit.stacked.length) failures.push(`phone: ${fit.stacked.join('; ')}`);
    if (fit.scrollW > fit.w) failures.push(`phone: the page scrolls sideways (${fit.scrollW} > ${fit.w})`);
    // A script error the HUD throws only at this width (a layout that divides by a zero size, a missing element) is a
    // failure the boxes cannot show; the desktop pass only prints its errors, since its list also holds the proxy's.
    const phoneOnly = phoneErrors.filter(e => !errors.includes(e));
    if (phoneErrors.length) console.log(`phone page errors: ${phoneErrors.slice(0, 5).join(' | ')}`);
    if (phoneOnly.some(e => !/Failed to load resource/.test(e))) failures.push(`phone: script error(s) the desktop pass did not have: ${phoneOnly.filter(e => !/Failed to load resource/.test(e)).slice(0, 3).join(' | ')}`);
  } finally {
    await phone.close();
  }
} catch (error) {
  failures.push(error.message);
} finally {
  await browser.close();
  clearTimeout(deadline);
}
if (failures.length) { console.error(`FAIL: ${failures.join('; ')}`); process.exit(1); }
console.log(`PASS: landing page and its log, title, Nave + HUD, a dialogue with focus and a node's answer, keyboard reach, frame pacing >= ${MIN_FPS} fps, the phone's HUD in its screen under reduced motion, the touch stick with its tap, its second finger's heavy and the dodge button (screenshots in ${shots})`);
