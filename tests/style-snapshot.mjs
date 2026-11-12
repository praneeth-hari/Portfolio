/*
 * Style snapshot test. Records the computed design properties (colour, type, spacing,
 * radius, shadow, motion...) of every element on the home page and the case-study pages,
 * and compares them with tests/style-baseline.json.
 *
 *   npm run test:styles            compare with the baseline (fails on any difference)
 *   npm run test:styles -- --update  accept the current look as the new baseline
 *
 * Use it around CSS refactors: if nothing was meant to change, nothing may differ.
 * Layout-dependent values (width, height, transform) are left out on purpose so the
 * result does not depend on font rendering differences between machines.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { start, BASE, PAGES, THEMES, newPage } from './helpers.mjs';

const BASELINE = new URL('./style-baseline.json', import.meta.url);
const UPDATE = process.argv.includes('--update');
const PROPS = [
  'color',
  'background-color',
  'background-image',
  'border-top-color',
  'border-top-width',
  'border-top-left-radius',
  'box-shadow',
  'font-family',
  'font-size',
  'font-weight',
  'letter-spacing',
  'line-height',
  'margin-top',
  'margin-bottom',
  'padding-top',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'opacity',
  'display',
  'position',
  'gap',
  'transition-duration',
  'transition-timing-function',
  'animation-name',
  'animation-timing-function',
  'outline-color',
  'outline-width',
  'text-transform',
  'z-index',
  'filter',
  'backdrop-filter'
];

const hash = (s) => createHash('sha1').update(s).digest('hex').slice(0, 10);

const app = await start();
const current = {};
const detail = {};
try {
  for (const theme of THEMES) {
    for (const [pageName, route, width, height] of PAGES) {
      const name = `${pageName}-${theme}`;
      // reduced motion makes the page static, so the result is deterministic
      const { ctx, page } = await newPage(app.browser, { width, height, theme });
      await page.goto(BASE + '/' + route);
      await page.waitForSelector('main', { timeout: 15000 });
      await page.waitForTimeout(2500);
      const rows = await page.evaluate((props) => {
        const out = [];
        document.querySelectorAll('body *').forEach((el, i) => {
          if (['CANVAS', 'SCRIPT', 'STYLE'].includes(el.tagName)) return;
          const cs = getComputedStyle(el);
          const cls = typeof el.className === 'string' ? el.className : '';
          out.push([
            `${i}:${el.tagName.toLowerCase()}.${cls}`,
            props.map((p) => `${p}: ${cs.getPropertyValue(p)}`).join('; ')
          ]);
        });
        return out;
      }, PROPS);
      current[name] = Object.fromEntries(rows.map(([k, v]) => [k, hash(v)]));
      detail[name] = Object.fromEntries(rows);
      await ctx.close();
    }
  }
} finally {
  await app.stop();
}

if (UPDATE || !existsSync(BASELINE)) {
  writeFileSync(BASELINE, JSON.stringify(current) + '\n');
  console.log(
    `Baseline written: ${Object.values(current).reduce((n, p) => n + Object.keys(p).length, 0)} elements.`
  );
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
let total = 0;
let changed = 0;
for (const name of Object.keys(current)) {
  const before = baseline[name] || {};
  const after = current[name];
  if (Object.keys(before).length !== Object.keys(after).length) {
    console.error(
      `${name}: element count changed (${Object.keys(before).length} -> ${Object.keys(after).length})`
    );
    changed++;
  }
  for (const key of Object.keys(after)) {
    total++;
    if (before[key] !== after[key]) {
      changed++;
      if (changed <= 12) console.error(`${name}  ${key}\n    now: ${detail[name][key]}`);
    }
  }
}
if (changed) {
  console.error(
    `\n${changed} difference(s) in ${total} elements. If the change is intended, run: npm run test:styles -- --update`
  );
  process.exit(1);
}
console.log(`Style snapshot OK: ${total} elements unchanged.`);
