/*
 * Theme test (light / dark). Guards:
 *   - the theme is set before first paint, by the inline script in index.html (checked with all JS blocked)
 *   - a saved choice wins over the OS setting; with nothing saved the OS setting is used
 *   - the toggle flips the theme, updates aria-pressed, persists, and survives a reload
 *   - it works from the keyboard
 *   - blocked localStorage does not break the page or the toggle
 */
import { start, BASE } from './helpers.mjs';

const app = await start();
let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : '  ' + detail}`);
  if (!ok) failures++;
};
const theme = (page) => page.evaluate(() => document.documentElement.dataset.theme);
const bg = (page) => page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);

async function fresh({ colorScheme = 'light', saved, blockJs = false, blockStorage = false } = {}) {
  const ctx = await app.browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme,
    reducedMotion: 'reduce'
  });
  if (saved) await ctx.addInitScript((t) => localStorage.setItem('hp-theme', t), saved);
  if (blockStorage)
    await ctx.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('blocked', 'SecurityError');
        }
      });
    });
  const page = await ctx.newPage();
  if (blockJs) await page.route(/\/assets\/.*\.js/, (route) => route.abort());
  return { ctx, page };
}

try {
  // before first paint: with the app's JavaScript blocked, the inline script alone must set the theme
  let { ctx, page } = await fresh({ colorScheme: 'dark', blockJs: true });
  await page.goto(BASE + '/');
  check('dark OS setting -> dark before the app loads', (await theme(page)) === 'dark');
  check('page background is already dark', (await bg(page)) === 'rgb(17, 16, 14)', await bg(page));
  await ctx.close();

  ({ ctx, page } = await fresh({ colorScheme: 'light', blockJs: true }));
  await page.goto(BASE + '/');
  check('light OS setting -> light before the app loads', (await theme(page)) === 'light');
  await ctx.close();

  // a saved choice beats the OS setting
  ({ ctx, page } = await fresh({ colorScheme: 'dark', saved: 'light' }));
  await page.goto(BASE + '/');
  await page.waitForSelector('.mn-theme');
  check('saved "light" beats a dark OS setting', (await theme(page)) === 'light');
  await ctx.close();

  // the toggle
  ({ ctx, page } = await fresh({ colorScheme: 'light' }));
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE + '/');
  await page.waitForSelector('.mn-theme');
  check(
    'starts light, button not pressed',
    (await theme(page)) === 'light' && (await page.getAttribute('.mn-theme', 'aria-pressed')) === 'false'
  );
  await page.click('.mn-theme');
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  check('click -> dark', true);
  check('aria-pressed is true in dark', (await page.getAttribute('.mn-theme', 'aria-pressed')) === 'true');
  check('choice is saved', (await page.evaluate(() => localStorage.getItem('hp-theme'))) === 'dark');
  check(
    'theme-color meta follows',
    (await page.evaluate(() => document.querySelector('meta[name="theme-color"]').content)) === '#11100e'
  );
  await page.reload();
  await page.waitForSelector('.mn-theme');
  check('dark survives a reload', (await theme(page)) === 'dark');

  // keyboard: focus the toggle and press Enter, then Space
  await page.focus('.mn-theme');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  check('Enter toggles back to light', true);
  await page.keyboard.press('Space');
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  check('Space toggles to dark', true);
  check('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();

  // blocked storage: the page and the toggle must keep working for the session
  ({ ctx, page } = await fresh({ colorScheme: 'light', blockStorage: true }));
  const e2 = [];
  page.on('pageerror', (e) => e2.push(e.message));
  await page.goto(BASE + '/');
  await page.waitForSelector('.mn-theme');
  await page.click('.mn-theme');
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  check('blocked storage: toggle still works', true);
  check('blocked storage: no page errors', e2.length === 0, e2.join(' | '));
  await ctx.close();
} finally {
  await app.stop();
}
process.exit(failures ? 1 : 0);
