/*
 * Page-transition test: opening a case study from the Work section and coming back (browser Back and the
 * "All projects" button). Guards the things that went wrong while building the View Transitions:
 *   - exactly one transition per navigation (popstate + hashchange both fire; the second must do nothing)
 *   - the home page scroll position comes back exactly (it was clamped by a short placeholder layout,
 *     and smoothed by `scroll-behavior: smooth`)
 *   - no leftover view-transition names, no console errors
 *   - nothing animates for users who prefer reduced motion
 */
import { start, BASE } from './helpers.mjs';

const app = await start();
let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : '  ' + detail}`);
  if (!ok) failures++;
};
const spy = () => {
  window.__vtCalls = 0;
  window.__vtOldStateChanged = false;
  const original = document.startViewTransition?.bind(document);
  if (original)
    document.startViewTransition = (callback) => {
      window.__vtCalls++;
      // the browser captures the "old" page before it runs the callback; if the DOM changed between
      // asking for the transition and the callback, the old snapshot shows the wrong page
      const before = document.querySelector('main')?.innerHTML.length;
      return original(() => {
        if (document.querySelector('main')?.innerHTML.length !== before) window.__vtOldStateChanged = true;
        return callback();
      });
    };
};

try {
  const ctx = await app.browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.addInitScript(spy);
  await page.goto(BASE + '/');
  await page.waitForFunction(() => !document.documentElement.classList.contains('pl-active'), null, {
    timeout: 30000
  });
  await page.waitForTimeout(1000);

  // scroll so the 2nd project card sits in the middle of the pinned stage
  const y = await page.evaluate(() => {
    const o = document.querySelector('.hs-outer');
    const r = o.getBoundingClientRect();
    return Math.round(r.top + scrollY + (o.offsetHeight - innerHeight) * 0.33);
  });
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  await page.waitForTimeout(2000);
  const homeY = await page.evaluate(() => scrollY);
  const card = await page.evaluate(() => {
    const r = document.querySelector('.work-card[data-study="mediplant"]').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  // --- forward: click the card
  await page.mouse.move(card.x, card.y);
  await page.waitForTimeout(600); // hover preloads the case-study page
  await page.mouse.click(card.x, card.y);
  await page.waitForFunction(
    () => document.querySelector('main h1')?.textContent === 'Medicinal Plant Detection',
    null,
    { timeout: 10000 }
  );
  await page.waitForTimeout(1500);
  let s = await page.evaluate(() => ({
    scrollY: Math.round(scrollY),
    vt: window.__vtCalls,
    named: [...document.querySelectorAll('*')].filter((e) => e.style.viewTransitionName).length
  }));
  check('forward: case study opens at the top', s.scrollY === 0, `scrollY ${s.scrollY}`);
  check('forward: exactly one transition', s.vt === 1, `calls ${s.vt}`);
  check(
    'forward: old page untouched until the browser captured it',
    !(await page.evaluate(() => window.__vtOldStateChanged))
  );
  check('forward: no leftover transition names', s.named === 0, `${s.named} left`);

  // --- back with the browser button
  await page.goBack();
  await page.waitForSelector('.hs-outer', { timeout: 10000 });
  await page.waitForTimeout(2000);
  s = await page.evaluate(() => ({
    scrollY: Math.round(scrollY),
    vt: window.__vtCalls,
    named: [...document.querySelectorAll('*')].filter((e) => e.style.viewTransitionName).length
  }));
  check(
    'back: scroll position restored exactly',
    Math.abs(s.scrollY - homeY) <= 1,
    `got ${s.scrollY}, expected ${homeY}`
  );
  check('back: exactly one more transition', s.vt === 2, `calls ${s.vt}`);
  check(
    'back: old page untouched until the browser captured it',
    !(await page.evaluate(() => window.__vtOldStateChanged))
  );
  check('back: no leftover transition names', s.named === 0, `${s.named} left`);

  // --- "All projects" button returns to the Work section
  await page.mouse.click(card.x, card.y);
  await page.waitForSelector('.pj-back', { timeout: 10000 });
  await page.waitForTimeout(1500);
  await page.click('.pj-back');
  await page.waitForSelector('#work', { timeout: 10000 });
  await page.waitForTimeout(2000);
  const workTop = await page.evaluate(() =>
    Math.round(document.getElementById('work').getBoundingClientRect().top)
  );
  check('"All projects" lands on the Work section', Math.abs(workTop) < 80, `work top at ${workTop}`);
  check('no console errors', errors.length === 0, errors.join(' | '));
  await ctx.close();

  // --- reduced motion: the page just swaps
  const reduced = await app.browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce'
  });
  const rp = await reduced.newPage();
  await rp.addInitScript(spy);
  await rp.goto(BASE + '/');
  await rp.waitForTimeout(2000);
  await rp.evaluate(() => {
    location.hash = '#/project/bob';
  });
  await rp.waitForFunction(
    () => document.querySelector('main h1')?.textContent === 'BOB Personal AI Assistant',
    null,
    { timeout: 10000 }
  );
  check('reduced motion: no view transition', (await rp.evaluate(() => window.__vtCalls)) === 0);
  await reduced.close();
} finally {
  await app.stop();
}
process.exit(failures ? 1 : 0);
