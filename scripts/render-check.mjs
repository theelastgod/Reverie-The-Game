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
const executablePath = findChromium();
console.log(`chromium: ${executablePath ?? '(playwright default)'}`);
const browser = await chromium.launch({ executablePath, headless: true, args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const failures = [];
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

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
  const readPrompt = async () => (await page.locator('#hud-prompt').textContent().catch(() => '')) ?? '';
  const readVerbs = () => page.evaluate(() => [...document.querySelectorAll('#hud-prompt .prompt-verbs button')]
    .map(b => ({ key: (b.querySelector('kbd')?.textContent ?? '').trim(), label: (b.textContent ?? '').replace(/^\s*[A-Z]\s*/, '').trim() }))
    .filter(v => /^[A-Z]$/.test(v.key))).catch(() => []);
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
  const walkTo = async (legs, wanted, nudgeKey, nudges) => {
    for (const [key, tiles] of legs) await hold(key, tiles * tileMs);
    let verbs = await readVerbs();
    for (let i = 0; i < nudges && !verbs.some(v => wanted.test(v.label)); i++) {
      await hold(nudgeKey, tileMs / 2);
      verbs = await readVerbs();
    }
    return verbs;
  };
  let verbs = await walkTo([['KeyD', 2.8], ['KeyS', 6.5]], /speak/i, 'KeyS', 4);
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
  // heard line; a refusal, a heard line too): two tiles west to the x 6 lane (the courier's corridor, clear from
  // row 48 up to 30) and north to the fourth Nave node at 6,34.
  verbs = await walkTo([['KeyA', 2], ['KeyW', 14.5]], /extract|keep/i, 'KeyW', 6);
  promptText = await readPrompt();
  const nodeVerb = verbs.find(v => /extract|keep/i.test(v.label)) ?? verbs[0];
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
    node = seen.length ? `after ${nodeVerb.label}: ${seen.join(', ')}` : `no visible answer to ${nodeVerb.label}`;
    if (!seen.length) failures.push(`the node's ${nodeVerb.label} verb changed nothing visible`);
  } else {
    failures.push(`nothing offered a verb at the node (prompt: ${JSON.stringify(promptText.trim())})`);
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
  if (canvases === 0) failures.push('no canvas rendered');
  if (fps < MIN_FPS) failures.push(`fps ${fps.toFixed(1)} < ${MIN_FPS}`);

  // A phone, 390 by 844: the landing page, then the city. Nothing of the HUD may run off the screen, the page must not
  // scroll sideways, and the minimap and the journal's tab must sit under the top chips, not on them. The desktop page
  // closes first: two cities rendering in software at once starve each other's boot.
  await page.close();
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const phoneErrors = [];
  phone.on('pageerror', e => phoneErrors.push(String(e)));
  phone.on('console', m => { if (m.type() === 'error') phoneErrors.push(m.text()); });
  try {
    if (root !== origin) {
      await phone.goto(root, { waitUntil: 'load', timeout: 30000 });
      await phone.waitForFunction(() => document.getElementById('city-log-band')?.dataset.state === 'done', null, { timeout: 15000 }).catch(() => {});
      await phone.screenshot({ path: join(shots, '05-phone-landing.png'), fullPage: true });
    }
    await phone.goto(origin, { waitUntil: 'load', timeout: 30000 });
    await phone.waitForSelector('#title', { timeout: 15000 });
    const enterPhone = phone.locator('#title button', { hasText: /enter/i }).first();
    if (await enterPhone.count()) await enterPhone.click(); else await phone.keyboard.press('Enter');
    await phone.waitForSelector('#hud:not([hidden])', { timeout: 30000 });
    await phone.waitForTimeout(1500);
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
console.log(`PASS: landing page and its log, title, Nave + HUD, a dialogue with focus and a node's answer, keyboard reach, frame pacing >= ${MIN_FPS} fps, the phone's HUD in its screen (screenshots in ${shots})`);
