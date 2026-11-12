/* global axe -- injected into the page from axe-core at runtime */
/*
 * Automated accessibility test (axe-core, WCAG 2 A/AA + best practices) on the built site.
 * The words of the About and Statement paragraphs fade in as you scroll, so axe sees them
 * mid-fade; they are excluded here (`.rw` and `.sw`).
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { start, BASE, PAGES, THEMES, newPage } from './helpers.mjs';

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const app = await start();
let failures = 0;
try {
  for (const theme of THEMES) {
    for (const [name, route, width, height] of PAGES) {
      const { ctx, page } = await newPage(app.browser, { width, height, theme });
      await page.goto(BASE + '/' + route);
      await page.waitForSelector('main', { timeout: 15000 });
      await page.waitForTimeout(2500);
      await page.evaluate(axeSource);
      const result = await page.evaluate(() =>
        axe.run({ runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] })
      );
      const issues = [];
      for (const v of result.violations)
        for (const n of v.nodes) {
          const target = n.target.join(' ');
          if (/^\.(rw|sw)\b/.test(target)) continue;
          issues.push(`${v.id} (${v.impact}): ${target}`);
        }
      console.log(`${name} [${theme}]: ${issues.length ? issues.length + ' issue(s)' : 'ok'}`);
      issues.slice(0, 10).forEach((i) => console.log('   ' + i));
      failures += issues.length;
      await ctx.close();
    }
  }
} finally {
  await app.stop();
}
process.exit(failures ? 1 : 0);
