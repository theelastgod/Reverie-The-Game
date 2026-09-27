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

  // Walk right for two seconds.
  await page.mouse.click(683, 384);
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(2000);
  await page.keyboard.up('KeyD');
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(shots, '02-nave.png') });

  // If something is in reach, use its F verb and capture the exchange.
  const promptText = (await page.locator('#hud-prompt').textContent().catch(() => '')) ?? '';
  if (/\bF\b/.test(promptText)) {
    await page.keyboard.press('KeyF');
    await page.waitForTimeout(700);
  }
  await page.screenshot({ path: join(shots, '03-dialogue.png') });

  // What assistive technology is told: the dialogue is a dialog named by its speaker, the notices and the
  // connection chip are live, and every bar is a meter whose value is the number it shows.
  const a11y = await page.evaluate(() => {
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
console.log(`PASS: landing page and its log, title, Nave + HUD, dialogue shot, frame pacing >= ${MIN_FPS} fps, the phone's HUD in its screen (screenshots in ${shots})`);
