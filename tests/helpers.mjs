import { preview } from 'vite';
import { chromium } from 'playwright';

export const PORT = 4173;
export const BASE = `http://localhost:${PORT}`;

/** Serve the production build (run `npm run build` first) and open a headless browser. */
export async function start() {
  const server = await preview({ preview: { port: PORT, strictPort: true, open: false } });
  // software WebGL so the hero canvases work on machines without a GPU (CI)
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  return {
    browser,
    async stop() {
      await browser.close();
      await new Promise((resolve) => server.httpServer.close(resolve));
    }
  };
}

/** Pages every test visits: [name, hash route, width, height]. */
export const PAGES = [
  ['home-desktop', '', 1440, 900],
  ['home-mobile', '', 390, 844],
  ['project-trader', '#/project/trader', 1440, 900],
  ['project-mediplant', '#/project/mediplant', 1440, 900],
  ['project-securecloud', '#/project/securecloud', 1440, 900],
  ['project-bob', '#/project/bob', 390, 844]
];

/** Both themes are tested; the saved choice is what the page's inline script reads before first paint. */
export const THEMES = ['light', 'dark'];

export async function newPage(browser, { width, height, theme = 'light', reducedMotion = 'reduce' }) {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion });
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem('hp-theme', t);
    } catch {
      /* ignore */
    }
  }, theme);
  return { ctx, page: await ctx.newPage() };
}
