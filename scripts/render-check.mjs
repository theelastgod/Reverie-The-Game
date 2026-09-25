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
const MIN_FPS = 30;
const deadline = setTimeout(() => { console.error('FAIL: render-check deadline (120 s) exceeded'); process.exit(1); }, 120000);

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
  console.log(`canvas: ${canvases}  avg fps: ${fps.toFixed(1)}  prompt: ${JSON.stringify(promptText.trim())}`);
  if (errors.length) console.log(`page errors: ${errors.slice(0, 5).join(' | ')}`);
  if (canvases === 0) failures.push('no canvas rendered');
  if (fps < MIN_FPS) failures.push(`fps ${fps.toFixed(1)} < ${MIN_FPS}`);
} catch (error) {
  failures.push(error.message);
} finally {
  await browser.close();
  clearTimeout(deadline);
}
if (failures.length) { console.error(`FAIL: ${failures.join('; ')}`); process.exit(1); }
console.log(`PASS: title, Nave + HUD, dialogue shot, frame pacing >= ${MIN_FPS} fps (screenshots in ${shots})`);
