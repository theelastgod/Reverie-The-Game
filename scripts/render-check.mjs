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
// Every element on the page honours the hidden attribute (round thirty-seven): a class that sets display beats the UA's
// [hidden] rule unless the stylesheet re-asserts it, which is how a deployed title kept its local test row (round
// thirty-six). Each element is hidden for the measure and put back; the Phaser canvas sets its own display and is
// never hidden by the game.
// Text contrast against WCAG AA (round thirty-nine): 4.5:1, or 3:1 for large text (24px, or 18.66px bold). The
// background is the first opaque one up the tree, translucent layers blended over it; text with nothing opaque behind it
// stands over the world (the canvas) and is not judged here. Returns the failures, one per class and colour.
const lowContrast = () => {
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const bgOf = e => {
    const layers = [];
    for (let x = e; x; x = x.parentElement) {
      const c = parse(getComputedStyle(x).backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
      if ((x.tagName === 'BODY' || x.id === 'hud') && (!layers.length || layers[layers.length - 1].a < 1)) return null;
    }
    let bg = { r: 255, g: 255, b: 255, a: 1 };
    for (const l of layers.reverse()) bg = blend(l, bg);
    return bg;
  };
  const out = new Set();
  for (const e of document.querySelectorAll('body *')) {
    if (!e.getClientRects().length) continue;
    const cs = getComputedStyle(e);
    if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    const bg = bgOf(e);
    if (!bg) continue;
    const fg = blend(parse(cs.color), bg), size = parseFloat(cs.fontSize);
    const ratio = (Math.max(lum(fg), lum(bg)) + 0.05) / (Math.min(lum(fg), lum(bg)) + 0.05);
    const need = size >= 24 || (+cs.fontWeight >= 700 && size >= 18.66) ? 3 : 4.5;
    if (ratio < need) out.add(`${e.id ? '#' + e.id : e.tagName.toLowerCase()}${typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/)[0] : ''} ${ratio.toFixed(2)}:1`);
  }
  return [...out];
};
// Every control shows a focus ring when the keyboard reaches it (round forty): each shown control is focused after a
// key press (so Chromium's :focus-visible applies) and needs an outline of at least 2px. Names the ones without.
const ringless = (scope) => {
  const out = [];
  for (const e of document.querySelectorAll(`${scope} :is(button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"]))`)) {
    if (!e.getClientRects().length || e.disabled || getComputedStyle(e).visibility === 'hidden') continue;
    e.focus({ preventScroll: true });
    const cs = getComputedStyle(e);
    if (document.activeElement === e && !(e.matches(':focus-visible') && cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2)) out.push(e.id ? '#' + e.id : e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/)[0] : ''));
    e.blur();
  }
  return [...new Set(out)];
};
const ignoresHidden = () => {
  const out = [];
  for (const e of document.querySelectorAll('body *')) {
    if (['SCRIPT', 'STYLE', 'TEMPLATE', 'CANVAS'].includes(e.tagName)) continue;
    const was = e.hidden;
    e.hidden = true;
    if (getComputedStyle(e).display !== 'none') out.push((e.id ? '#' + e.id : e.tagName.toLowerCase()) + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : ''));
    e.hidden = was;
  }
  return [...new Set(out)];
};
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

  // The title on short screens (round thirty-four): the mark, the word, the way in and the guest line all on the screen at
  // a phone on its side and a laptop at 200%, with the local test row both shown and hidden (a deployed city hides it).
  {
    const before = page.viewportSize();
    const cut = [];
    for (const [w, h] of [[844, 390], [740, 360], [640, 360]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(150);
      for (const deployed of [false, true]) {
        const off = await page.evaluate((deployed) => {
          const row = document.querySelector('.title-link'); const was = row?.hidden;
          if (row && deployed) row.hidden = true;
          const out = [];
          const shown = !!(row && deployed && row.getClientRects().length);
          for (const s of ['.title-mark', '.title-word', '#title-enter', '#title-link', '.title-fine']) {
            const e = document.querySelector(s);
            if (!e || !e.getClientRects().length) continue;
            const b = e.getBoundingClientRect();
            if (b.top < -1 || b.bottom > innerHeight + 1) out.push(s);
          }
          if (row) row.hidden = was;
          return { out, shown };
        }, deployed);
        if (off.shown) cut.push(`${w}x${h} deployed: the test row still shows with hidden set`);
        if (off.out.length) cut.push(`${w}x${h}${deployed ? ' deployed' : ''}: ${off.out.join(', ')} off the screen`);
      }
    }
    if (before) await page.setViewportSize(before);
    await page.waitForTimeout(150);
    failures.push(...cut.map(c => `title: ${c}`));
    console.log(`title on short screens: ${cut.length ? cut.join('; ') : 'the mark, the word, the way in and the guest line on the screen at 844x390, 740x360 and 640x360'}`);
  }

  {
    const loose = await page.evaluate(ignoresHidden);
    failures.push(...loose.map(e => `title: ${e} shows with hidden set`));
    console.log(`hidden on the title: ${loose.length ? loose.join(', ') + ' ignore it' : 'every element honours it'}`);
  }
  {
    const dim = await page.evaluate(lowContrast);
    failures.push(...dim.map(e => `title contrast: ${e}`));
    console.log(`contrast on the title: ${dim.length ? dim.join(', ') + ' below AA' : 'every line at AA or better'}`);
  }
  {
    await page.keyboard.press('Shift');
    const bare = await page.evaluate(ringless, '#title');
    failures.push(...bare.map(e => `title: ${e} has no focus ring`));
    console.log(`focus rings on the title: ${bare.length ? bare.join(', ') + ' without one' : 'every control has one'}`);
  }

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

  // The guest lock and the heard chip (round twenty-three): with the panel up the chip is hidden, not half under it.
  const lockHides = await page.evaluate(() => {
    const lock = document.getElementById('hud-lock');
    const heard = document.getElementById('hud-heard');
    if (!lock || !heard) return 'no lock or heard element';
    const was = [lock.hidden, heard.hidden, heard.textContent];
    lock.hidden = false; heard.hidden = false; heard.textContent = 'A guest cannot prepare the ground.';
    const v = getComputedStyle(heard).visibility;
    [lock.hidden, heard.hidden, heard.textContent] = was;
    return v === 'hidden' ? '' : `heard chip ${v} under the lock panel`;
  });
  if (lockHides) failures.push(lockHides);
  console.log(`lock panel over the heard chip: ${lockHides || 'chip hidden'}`);
  // The journal's bearing under a long detail (round twenty-three): it stays inside the panel's box, not below its fold.
  const bearingHeld = await page.evaluate(() => {
    const journal = document.getElementById('hud-journal');
    const detail = journal?.querySelector('.journal-detail');
    const bearing = journal?.querySelector('.journal-bearing');
    if (!journal || !detail || !bearing) return 'no journal, detail or bearing';
    if (journal.classList.contains('closed') || getComputedStyle(journal.querySelector('.journal-body')).display === 'none') return '';
    const was = detail.textContent;
    detail.textContent = 'A long step. '.repeat(120);
    const j = journal.getBoundingClientRect();
    const b = bearing.getBoundingClientRect();
    detail.textContent = was;
    return b.top >= j.top - 1 && b.bottom <= j.bottom + 1 ? '' : `bearing at ${Math.round(b.top)}-${Math.round(b.bottom)} outside the journal ${Math.round(j.top)}-${Math.round(j.bottom)}`;
  });
  if (bearingHeld) failures.push(bearingHeld);
  console.log(`journal bearing under a long detail: ${bearingHeld || 'held in the panel'}`);
  // A small window with everything long at once (round twenty-four): the heard line stands clear of a prompt wrapped to two
  // rows, the newest notice stays above the bars, and the prompt's third verb stays inside the prompt.
  // At 1024x768 too (round twenty-seven): two world events at once keep off the journal's tab and the left column.
  // And short (round thirty-three: a phone on its side, a laptop at 200%): the reach keeps off the minimap, the wink and
  // the bars, and every verb chip stays on the screen.
  {
    const loose = await page.evaluate(ignoresHidden);
    failures.push(...loose.map(e => `hud: ${e} shows with hidden set`));
    console.log(`hidden in the HUD: ${loose.length ? loose.join(', ') + ' ignore it' : 'every element honours it'}`);
  }
  {
    const dim = await page.evaluate(lowContrast);
    const credits = await page.evaluate((src) => {
      const c = document.querySelector('#hud-credits'); if (!c) return ['#hud-credits is missing'];
      const was = c.hidden; c.hidden = false;
      const out = eval(src)();
      c.hidden = was;
      return out;
    }, '(' + lowContrast.toString() + ')');
    failures.push(...dim.map(e => `hud contrast: ${e}`), ...credits.map(e => `credits contrast: ${e}`));
    console.log(`contrast in the HUD and the credits: ${dim.length + credits.length ? [...dim, ...credits].join(', ') + ' below AA' : 'every line at AA or better'}`);
  }
  {
    await page.keyboard.press('Shift');
    const bare = await page.evaluate(ringless, '#hud');
    failures.push(...bare.map(e => `hud: ${e} has no focus ring`));
    console.log(`focus rings in the HUD: ${bare.length ? bare.join(', ') + ' without one' : 'every control has one'}`);
  }
  const before = page.viewportSize();
  const crowd = [];
  const sizes = [[900, 600], [1024, 768], [844, 390], [740, 360]];
  for (const [w, h] of sizes) {
  await page.setViewportSize({ width: w, height: h });
  await page.waitForTimeout(200);
  const found = await page.evaluate(() => {
    const $ = s => document.querySelector(s);
    const heard = $('#hud-heard'), prompt = $('#hud-prompt'), notices = $('#hud-notices'), bars = $('#hud-bars'), events = $('#hud-events'), journal = $('#hud-journal'), wink = $('#hud-wink'), minimap = $('#hud-minimap');
    if (!heard || !prompt || !notices || !bars || !events || !journal || !wink || !minimap) return ['a HUD element is missing'];
    // Fill the HUD's own children (it holds them by reference) and put their content back after.
    const pname = prompt.querySelector('.prompt-name'), pverbs = prompt.querySelector('.prompt-verbs');
    const was = { heard: [heard.hidden, heard.textContent], prompt: [prompt.hidden, pname.textContent, [...pverbs.childNodes]], notices: [...notices.childNodes], events: [events.hidden, [...events.childNodes]], wink: wink.hidden };
    events.hidden = false; wink.hidden = false;
    events.innerHTML = ['HOUSE WAR|the Clearing · nobody holds · 0:07', 'THE LAUNCH|the vans at the lip · window open · 4:12'].map(t => t.split('|')).map(([l, d]) => `<div class="event"><div class="event-label">${l}</div><div class="event-detail"><span>${d}</span></div></div>`).join('');
    heard.hidden = false; heard.textContent = 'You leave the recorder running. Nara tears her coat into binding cloth. The voice has another night, and the street hears it.';
    prompt.hidden = false;
    pname.textContent = 'MEMORIAL RECORDER';
    pverbs.innerHTML = [['F', 'LISTEN'], ['E', 'DISMANTLE THE COPPER'], ['Q', 'PRESERVE THE VOICE']].map(([k, l]) => `<button class="verb"><kbd class="cap">${k}</kbd>${l}</button>`).join('');
    notices.innerHTML = ['Buried. Readiness. Nothing was paid.', 'Buried. Readiness. The city stops counting that body.', 'The recorder plays on. Cloth for the coffin.', 'Safety calls it stability. One more name to hear.', 'Entered.', 'The sexton. She puts things in the ground.', 'A new line in Ord\'s ledger. Honest.', 'The last line, the newest.'].map(t => `<div class="notice">${t}</div>`).join('');
    const r = e => e.getBoundingClientRect();
    const bad = [];
    if (r(heard).bottom > r(prompt).top + 1) bad.push(`the heard line (to ${Math.round(r(heard).bottom)}) runs under the prompt (from ${Math.round(r(prompt).top)})`);
    const newest = notices.lastElementChild;
    if (r(newest).bottom > r(bars).top + 1) bad.push(`the newest notice (to ${Math.round(r(newest).bottom)}) runs under the bars (from ${Math.round(r(bars).top)})`);
    for (const v of prompt.querySelectorAll('.verb')) if (r(v).right > r(prompt).right + 1) bad.push(`a verb runs past the prompt's edge`);
    const meets = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
    for (const [name, el] of [['minimap', minimap], ['wink', wink], ['bars', bars]]) {
      if (meets(r(heard), r(el)) || meets(r(prompt), r(el))) bad.push(`the reach lies over the ${name}`);
    }
    for (const chip of document.querySelectorAll('#hud-verbs .chip')) {
      if (chip.getClientRects().length && r(chip).right > innerWidth + 1) bad.push(`a verb chip runs off the screen's edge`);
    }
    // A banner that stands down while the heard line shows (a short screen, hud.css) is not in the way; so the banners
    // are measured again with the line gone (round thirty-six), when they are back on the screen.
    const banners = (when) => { for (const ev of getComputedStyle(events).opacity === '0' ? [] : events.children) {
      if (meets(r(ev), r(journal))) bad.push(`an event banner lies over the journal${when}`);
      if (meets(r(ev), r(wink))) bad.push(`an event banner lies over the left column${when}`);
    } };
    banners('');
    heard.hidden = true;
    if (getComputedStyle(events).opacity === '0') bad.push('the banners stay down with no heard line');
    banners(' (no heard line)');
    events.hidden = was.events[0]; events.replaceChildren(...was.events[1]); wink.hidden = was.wink;
    heard.hidden = was.heard[0]; heard.textContent = was.heard[1];
    prompt.hidden = was.prompt[0]; pname.textContent = was.prompt[1]; pverbs.replaceChildren(...was.prompt[2]);
    notices.replaceChildren(...was.notices);
    return bad;
  });
  crowd.push(...found.map(f => `${w}x${h}: ${f}`));
  }
  if (before) await page.setViewportSize(before);
  failures.push(...crowd);
  console.log(`a crowded HUD at ${sizes.map(s => s.join('x')).join(', ')}: ${crowd.length ? crowd.join('; ') : 'heard over the prompt, the newest notice above the bars, every verb inside and on the screen, the reach clear of the minimap, the wink and the bars, the events clear of the journal and the left column'}`);

  // The journal opened on a short screen (round thirty-five): it takes the height under the top chips, its title and
  // objective on the screen and inside the panel, and the event banners keep clear of it.
  {
    const before = page.viewportSize();
    await page.setViewportSize({ width: 740, height: 360 });
    await page.waitForTimeout(200);
    const tab = page.locator('#hud-journal .journal-tab');
    const journalWas = await page.evaluate(() => document.querySelector('#hud-journal')?.className ?? '');
    await tab.click();
    await page.waitForTimeout(200);
    const found = await page.evaluate(() => {
      const $ = s => document.querySelector(s), r = e => e.getBoundingClientRect();
      const j = $('#hud-journal'), title = $('#hud-journal .journal-title'), events = $('#hud-events');
      if (!j || !title || !events) return ['a journal element is missing'];
      const bad = [];
      if (!j.classList.contains('open')) bad.push('the tab did not open the journal');
      const t = r(title), jb = r(j);
      if (!title.getClientRects().length || t.top < jb.top || t.bottom > jb.bottom + 1 || t.bottom > innerHeight) bad.push(`the title (${Math.round(t.top)}-${Math.round(t.bottom)}) is not in the open journal (${Math.round(jb.top)}-${Math.round(jb.bottom)})`);
      const was = [events.hidden, [...events.childNodes]];
      events.hidden = false;
      events.innerHTML = '<div class="event"><div class="event-label">NEXT WAR</div><div class="event-detail"><span>the Clearing · 4:12</span></div></div>';
      for (const ev of events.children) { const e = r(ev); if (Math.min(e.right, jb.right) - Math.max(e.left, jb.left) > 2 && Math.min(e.bottom, jb.bottom) - Math.max(e.top, jb.top) > 2) bad.push('an event banner lies under the open journal'); }
      events.hidden = was[0]; events.replaceChildren(...was[1]);
      return bad;
    });
    // Closing it at this width would leave it `.closed` (journal.ts) for the rest of the run at the desktop size.
    await page.evaluate((cls) => { const j = document.querySelector('#hud-journal'); if (j) j.className = cls; }, journalWas);
    if (before) await page.setViewportSize(before);
    await page.waitForTimeout(150);
    failures.push(...found.map(f => `short journal: ${f}`));
    console.log(`journal open at 740x360: ${found.length ? found.join('; ') : 'its title in the panel and on the screen, the banners clear of it'}`);
  }

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

  // The ledger: L opens the panel and it lists the purse (the player-defect sweep: the panel was never filled, so nobody could
  // buy, list or cancel on the Grid); L again closes it.
  await page.keyboard.press('KeyL');
  await page.waitForTimeout(400);
  const ledgerPanel = await page.evaluate(() => {
    const el = document.querySelector('#hud-ledger-panel');
    return { shown: !!el && !el.hidden, text: (el?.textContent ?? '').replace(/\s+/g, ' ').trim() };
  });
  if (!ledgerPanel.shown || !/LEDGER/.test(ledgerPanel.text) || ledgerPanel.text.length < 40) failures.push(`L opened no filled ledger (${JSON.stringify(ledgerPanel.text.slice(0, 120))})`);
  else console.log(`ledger: ${ledgerPanel.text.slice(0, 120)}`);
  await page.keyboard.press('KeyL');
  await page.waitForTimeout(200);

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
  // A HUD button pressed with the mouse hands the keys back: focus left on it would make Space press it again and Tab
  // walk the HUD (the player-defect sweep, round two). Clicked twice so the stance is where it was.
  await page.click('#hud-stance');
  const afterClick = await focusedControl();
  await page.click('#hud-stance');
  if (afterClick) failures.push(`a mouse click left focus on ${afterClick}: Space would press it again`);
  console.log(`pointer: a click on the stance chip → focus ${afterClick || 'with the game'}`);

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
