/*
 * Typography test: measures how every text block actually wraps in the browser (desktop widths).
 *   - paragraphs ending on a single stranded word (text-wrap: pretty / balance)  -> at most 2 on the whole site
 *   - headings whose last line is a short fragment (text-wrap: balance)            -> at most 1
 *   - prose wider than ~82 average characters per line                             -> none
 *   - text smaller than 12px                                                       -> none
 * The small budgets leave room for ordinary copy edits; the checks catch a lost rule or an over-wide column.
 */
import { start, BASE, newPage } from './helpers.mjs';

const ROUTES = ['', '#/project/trader', '#/project/mediplant', '#/project/securecloud', '#/project/bob'];
const WIDTHS = [1440, 1920];
const app = await start();
const orphans = new Set();
const unbalanced = new Set();
const wide = new Set();
const tiny = new Set();
let blocks = 0;

try {
  for (const width of WIDTHS) {
    for (const route of ROUTES) {
      const { ctx, page } = await newPage(app.browser, { width, height: 900 });
      await page.goto(BASE + '/' + route);
      await page.waitForSelector('main', { timeout: 15000 });
      await page.waitForTimeout(2200);
      await page.evaluate(() => document.fonts.ready);
      const r = await page.evaluate(() => {
        const res = { blocks: 0, orphans: [], unbalanced: [], wide: [], tiny: [] };
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
            const re = /\S+/g;
            for (let m = re.exec(n.textContent); m; m = re.exec(n.textContent)) {
              const range = document.createRange();
              range.setStart(n, m.index);
              range.setEnd(n, m.index + m[0].length);
              const rc = range.getClientRects()[0];
              if (rc && rc.width) words.push({ top: Math.round(rc.top / 4), left: rc.left, right: rc.right });
            }
          }
          if (words.length < 4) return;
          res.blocks++;
          const lines = [];
          for (const w of words) {
            let l = lines.find((x) => x.top === w.top);
            if (!l) lines.push((l = { top: w.top, n: 0, l: 1e9, r: 0 }));
            l.n++;
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
          if (lines.length >= 2 && text.length / lines.length > 82) res.wide.push(label);
        });
        return res;
      });
      blocks += r.blocks;
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
    [...items].slice(0, 8).forEach((x) => console.log('       ' + x));
  }
};
console.log(`measured ${blocks} text blocks`);
check('paragraphs ending on a single word', orphans, 2);
check('headings with a short last line', unbalanced, 1);
check('prose wider than ~82 characters per line', wide, 0);
check('text smaller than 12px', tiny, 0);
process.exit(failures ? 1 : 0);
