/*
 * Typography test: measures how every text block actually wraps in the browser (desktop widths).
 *   - paragraphs ending on a single stranded word (text-wrap: pretty / balance)  -> at most 2 on the whole site
 *   - headings whose last line is a short fragment (text-wrap: balance)            -> at most 1
 *   - any line longer than 85 characters (counted per line, not averaged)          -> none
 *   - text smaller than 12px                                                       -> none
 * The small budgets leave room for ordinary copy edits; the checks catch a lost rule or an over-wide column.
 */
import { start, BASE, newPage } from './helpers.mjs';

const ROUTES = ['', '#/project/trader', '#/project/mediplant', '#/project/securecloud', '#/project/bob'];
const WIDTHS = [1440, 1920];
// Comfortable reading is roughly 45-75 characters per line. The site is built to stay at or under ~78; the limit
// has a few characters of margin so small rendering differences between machines (CI) do not cause false alarms.
const MAX_CHARS = Number(process.env.MAX_CHARS || 85);
const app = await start();
const orphans = new Set();
const unbalanced = new Set();
const wide = new Set();
const tiny = new Set();
let blocks = 0;
const longest = [];

try {
  for (const width of WIDTHS) {
    for (const route of ROUTES) {
      const { ctx, page } = await newPage(app.browser, { width, height: 900 });
      await page.goto(BASE + '/' + route);
      await page.waitForSelector('main', { timeout: 15000 });
      await page.waitForTimeout(2200);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate((v) => (window.__MAX_CHARS = v), MAX_CHARS);
      const r = await page.evaluate(() => {
        const res = { blocks: 0, orphans: [], unbalanced: [], wide: [], tiny: [], measure: [] };
        const MAX_CHARS = window.__MAX_CHARS;
        const sel = 'p, h1, h2, h3, h4, li, blockquote, .eyebrow, label, dd, figcaption';
        document.querySelectorAll(sel).forEach((el) => {
          if (el.closest('.cursor-label, canvas, .pl2, .mn-overlay') || !el.offsetParent) return;
          const text = el.textContent.trim();
          if (text.length < 3) return;
          const label = `${el.tagName.toLowerCase()}.${(el.className + '').split(' ')[0]} "${text.slice(0, 34)}"`;
          if (parseFloat(getComputedStyle(el).fontSize) < 12) res.tiny.push(label);
          // group words into lines by their vertical position
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          const words = [];
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            // split at hyphens too: the browser can break "SPY-with-a-filter" between its parts
            const re = /\S+?(?:-(?=\S)|(?=\s|$))/g;
            for (let m = re.exec(n.textContent); m; m = re.exec(n.textContent)) {
              const range = document.createRange();
              range.setStart(n, m.index);
              range.setEnd(n, m.index + m[0].length);
              const rc = range.getClientRects()[0];
              if (rc && rc.width)
                words.push({ top: Math.round(rc.top / 4), left: rc.left, right: rc.right, len: m[0].length });
            }
          }
          if (words.length < 4) return;
          res.blocks++;
          const lines = [];
          for (const w of words) {
            let l = lines.find((x) => x.top === w.top);
            if (!l) lines.push((l = { top: w.top, n: 0, l: 1e9, r: 0, chars: 0 }));
            l.n++;
            l.chars += w.len + 1;
            l.l = Math.min(l.l, w.left);
            l.r = Math.max(l.r, w.right);
          }
          lines.sort((a, b) => a.top - b.top);
          if (lines.length >= 2 && lines.at(-1).n === 1 && words.length > 5) res.orphans.push(label);
          const isHeading = /^H[1-4]$/.test(el.tagName) || /disp|title|heading/.test(el.className);
          if (isHeading && lines.length >= 2) {
            const widest = Math.max(...lines.map((l) => l.r - l.l));
            const last = lines.at(-1);
            if (last.r - last.l < widest * 0.35) res.unbalanced.push(label);
          }
          // the longest line that is not the last one, in real characters (the last line is naturally short)
          // display-size text (20px+) is meant to run wider, e.g. the About intro
          if (lines.length >= 2 && parseFloat(getComputedStyle(el).fontSize) < 20) {
            const longest = Math.max(...lines.slice(0, -1).map((l) => l.chars));
            res.measure.push([longest, label]);
            if (longest > MAX_CHARS) res.wide.push(`${label} (${longest} chars)`);
          }
        });
        return res;
      });
      blocks += r.blocks;
      r.measure.forEach((x) => longest.push(x));
      r.orphans.forEach((x) => orphans.add(x));
      r.unbalanced.forEach((x) => unbalanced.add(x));
      r.wide.forEach((x) => wide.add(x));
      r.tiny.forEach((x) => tiny.add(x));
      await ctx.close();
    }
  }
} finally {
  await app.stop();
}

let failures = 0;
const check = (name, items, max) => {
  const ok = items.size <= max;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${items.size} (allowed ${max})`);
  if (!ok) {
    failures++;
    [...items].slice(0, 40).forEach((x) => console.log('       ' + x));
  }
};
console.log(`measured ${blocks} text blocks`);
longest.sort((a, b) => b[0] - a[0]);
console.log(
  'longest lines (chars):',
  longest
    .slice(0, 4)
    .map((x) => x[0])
    .join(', ')
);
check('paragraphs ending on a single word', orphans, 2);
if (orphans.size) [...orphans].forEach((x) => console.log('       ' + x));
check('headings with a short last line', unbalanced, 1);
check(`lines longer than ${MAX_CHARS} characters`, wide, 0);
check('text smaller than 12px', tiny, 0);
process.exit(failures ? 1 : 0);
