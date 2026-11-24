/*
 * Pointer interactions: the cursor label, press feedback and the magnetic pull.
 *   - the label shows over opted-in elements (data-cursor) with the right text and follows the pointer
 *   - it hides over the card's own links and over empty space
 *   - touch devices and reduced motion never show it
 *   - buttons scale down while pressed and come back
 *   - magnetic buttons lean toward a nearby pointer and return
 */
import { start, BASE } from './helpers.mjs';

const app = await start();
let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : '  ' + detail}`);
  if (!ok) failures++;
};
const label = (page) =>
  page.evaluate(() => {
    const el = document.querySelector('.cursor-label');
    return el
      ? {
          on: el.classList.contains('is-on'),
          text: el.textContent,
          rect: el.getBoundingClientRect().toJSON()
        }
      : null;
  });

try {
  // ---- desktop mouse, full motion
  const ctx = await app.browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE + '/');
  await page.waitForFunction(() => !document.documentElement.classList.contains('pl-active'), null, {
    timeout: 30000
  });
  await page.waitForTimeout(1000);
  const y = await page.evaluate(() => {
    const o = document.querySelector('.hs-outer');
    const r = o.getBoundingClientRect();
    return Math.round(r.top + scrollY + (o.offsetHeight - innerHeight) * 0.33);
  });
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  await page.waitForTimeout(2000);
  const rects = await page.evaluate(() => {
    const card = document.querySelector('.work-card[data-study="mediplant"]').getBoundingClientRect();
    const gh = document
      .querySelector('.work-card[data-study="mediplant"] .card-links a:last-child')
      .getBoundingClientRect();
    return {
      card: { x: card.left + card.width / 2, y: card.top + card.height * 0.4 },
      gh: { x: gh.left + gh.width / 2, y: gh.top + gh.height / 2 }
    };
  });

  await page.mouse.move(rects.card.x - 30, rects.card.y - 30);
  await page.mouse.move(rects.card.x, rects.card.y, { steps: 6 });
  await page.waitForTimeout(700);
  let l = await label(page);
  check('label shows over a project card', l?.on === true, JSON.stringify(l));
  check('label text names the action', l?.text === 'View case study', l?.text);
  check(
    'label sits next to the pointer',
    l && Math.abs(l.rect.left - (rects.card.x + 16)) < 25 && Math.abs(l.rect.top - (rects.card.y + 16)) < 25,
    JSON.stringify(l?.rect)
  );

  await page.mouse.move(rects.gh.x, rects.gh.y, { steps: 6 });
  await page.waitForTimeout(400);
  l = await label(page);
  check("label hides over the card's own GitHub link", l?.on === false, JSON.stringify(l));

  await page.mouse.move(rects.card.x, rects.card.y, { steps: 4 });
  await page.waitForTimeout(300);
  await page.mouse.move(720, 800, { steps: 6 });
  await page.waitForTimeout(400);
  l = await label(page);
  check('label hides over empty space', l?.on === false, JSON.stringify(l));

  // every button-like control shares one timing and curve (the style snapshot runs in reduced motion,
  // which zeroes transitions, so check it here)
  const timing = await page.evaluate(() =>
    ['.mn-btn', '.mn-theme', '.view-all', '.cv-btn', '.pj-btn', '.bento-cta']
      .map((sel) => document.querySelector(sel))
      .filter(Boolean)
      .map((el) => {
        const cs = getComputedStyle(el);
        return [el.className.split(' ')[0], cs.transitionDuration.split(',')[0], cs.transitionTimingFunction];
      })
  );
  check(
    'controls share the --dur-base timing',
    timing.length >= 3 &&
      timing.every(
        ([, d, f]) => d === '0.28s' && f.startsWith('cubic-bezier(0.2, 0.8, 0.2, 1)') && !f.includes('ease,')
      ),
    JSON.stringify(timing)
  );

  // ---- press feedback and magnetic pull on the "Hire me" button
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(800);
  const hire = await page.evaluate(() => {
    const r = document.querySelector('.mn-hire').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width };
  });
  await page.mouse.move(hire.x + hire.w / 2 + 40, hire.y + 30, { steps: 5 }); // near, not on it
  await page.waitForTimeout(500);
  const lean = await page.evaluate(() => document.querySelector('.mn-hire').style.transform);
  check('magnetic: button leans toward a nearby pointer', /translate/.test(lean), lean);
  await page.mouse.move(hire.x, hire.y, { steps: 4 });
  await page.waitForTimeout(500);
  const pos = await page.evaluate(() => {
    const r = document.querySelector('.mn-hire').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.move(pos.x, pos.y);
  await page.mouse.down();
  await page.waitForTimeout(250);
  const pressed = await page.evaluate(() => getComputedStyle(document.querySelector('.mn-hire')).scale);
  check('press: button scales down while held', pressed === '0.96', pressed);
  await page.mouse.up({ button: 'left' }).catch(() => {});
  await page.waitForTimeout(600);
  const released = await page.evaluate(() => getComputedStyle(document.querySelector('.mn-hire')).scale);
  check('press: scale returns on release', released === 'none' || released === '1', released);
  await page.mouse.move(700, 600, { steps: 6 });
  await page.waitForTimeout(900);
  const back = await page.evaluate(() => document.querySelector('.mn-hire').style.transform);
  check('magnetic: button returns when the pointer leaves', back === '' || back === 'none', back);
  check('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();

  // ---- touch device: the label never shows
  const touch = await app.browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const tp = await touch.newPage();
  await tp.addInitScript(() => sessionStorage.setItem('hp-preloader-seen', '1'));
  await tp.goto(BASE + '/');
  await tp.waitForTimeout(2000);
  await tp.evaluate(() => {
    const el = document.querySelector('.work-card .card-hit');
    el?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 50, clientY: 50 }));
  });
  await tp.waitForTimeout(300);
  l = await label(tp);
  check('touch device: label never shows', !l || l.on === false, JSON.stringify(l));
  await touch.close();

  // ---- reduced motion: no label, no magnetic pull
  const rm = await app.browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce'
  });
  const rp = await rm.newPage();
  await rp.goto(BASE + '/');
  await rp.waitForTimeout(2500);
  await rp.evaluate(() => document.querySelector('.work-card .card-hit').scrollIntoView({ block: 'center' }));
  await rp.waitForTimeout(500);
  const c = await rp.evaluate(() => {
    const r = document.querySelector('.work-card .card-hit').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await rp.mouse.move(c.x - 20, c.y - 20);
  await rp.mouse.move(c.x, c.y, { steps: 5 });
  await rp.waitForTimeout(500);
  l = await label(rp);
  check('reduced motion: label never shows', !l || l.on === false, JSON.stringify(l));
  await rm.close();
} finally {
  await app.stop();
}
process.exit(failures ? 1 : 0);
