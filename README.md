# Hari Praneeth – Portfolio (React + Framer Motion)

Your portfolio rebuilt with **Vite + React 19 + Framer Motion**. The design, colors, copy and the WebGL fluid hero are the same as the single-file `index.html`; the animations are now driven by Framer Motion.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
npm run preview    # serve the production build locally
npm run lint       # ESLint (React, hooks and jsx-a11y rules)
npm run format     # Prettier
npm test           # build, then axe accessibility scan + style snapshot (needs a Chromium; `npx playwright install chromium`)
```

## Fonts (do this once)

Copy your existing `fonts/` files into **`public/fonts/`**:

```
public/fonts/archivo-400.woff2   archivo-700.woff2   archivo-900.woff2
public/fonts/geist-400.woff2     geist-500.woff2      geist-600.woff2
public/fonts/geistmono-400.woff2 geistmono-500.woff2
```

Without them the site falls back to system fonts.

## Where Framer Motion is used

Components use the small `m` component inside `<LazyMotion>` (`src/main.jsx`), and the animation features load as their own chunk (`src/motionFeatures.js`). `strict` mode turns a stray full `motion.*` component into an error, so the bundle can't quietly grow back. Layout animations and drag are not loaded; if you need them, switch the loader to `domMax`.

| Feature                                                         | File                            |
| --------------------------------------------------------------- | ------------------------------- |
| Scroll-in reveals (`whileInView`)                               | `src/components/Reveal.jsx`     |
| Preloader counter and slide-up exit                             | `src/components/Preloader.jsx`  |
| Nav: full-screen menu (`AnimatePresence`), label morph          | `src/components/Nav.jsx`        |
| Hero tagline rotator (`AnimatePresence`)                        | `src/components/Hero.jsx`       |
| About: scroll-linked word reveal (`useScroll` + `useTransform`) | `src/components/About.jsx`      |
| Tech stack fan: spring-animated cards                           | `src/components/TechStack.jsx`  |
| Skills dialog enter/exit                                        | `src/components/SkillModal.jsx` |

The WebGL fluid text (`src/components/FluidText.jsx`) is plain WebGL, ported as-is with cleanup.

## Editing content

Each section is its own component in `src/components/`. Placeholders look like `[[ PROJECT NAME ]]` (Work, Thoughts). Styles live in `src/styles/`: `00-tokens.css` holds every colour, size, radius, easing curve and spacing value as a CSS variable, and the numbered files (one per section) are imported in order by `index.css`, because the cascade depends on that order. Breakpoints are listed in `00-tokens.css` and mirrored in `src/breakpoints.js` for scripts.

## Known to-dos

- **Contact form** does not send anything yet. Connect it in `src/components/Contact.jsx` (`onSubmit`) to Formspree, Web3Forms or EmailJS.
- CV buttons (`About.jsx`) and the X links (`Contact.jsx`, `Footer.jsx`) still point to `#`.
- Add `og:url` / `og:image` in `index.html` once deployed.

## Deploy

`npm run build`, then upload `dist/` to Vercel, Netlify or GitHub Pages (the build uses relative paths).

## Tests and CI

`npm test` builds the site and runs two browser checks (headless Chromium, `tests/`):

- **`tests/a11y.mjs`** runs axe-core (WCAG 2 A/AA and best practices) on the home page and the four case studies, on desktop and mobile sizes.
- **`tests/style-snapshot.mjs`** compares the computed design properties of every element with `tests/style-baseline.json`. Use it around CSS refactors: if nothing was meant to change, nothing may differ. When a visual change is intended, accept it with `npm run test:styles -- --update` and commit the new baseline.

GitHub Actions (`.github/workflows/ci.yml`) runs lint, format check and build, and in a second job `npm test`, on every push.
