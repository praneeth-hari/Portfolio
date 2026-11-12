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

## Loading screen

The preloader plays once per browser session (`sessionStorage` key `hp-preloader-seen`, see `src/App.jsx`). Reloads, return visits in the same tab and users with reduced motion go straight to the hero. To see it again, open the site in a new tab or private window, or clear that key in DevTools.

## Dark theme

The theme lives on `<html data-theme="light|dark">`. An inline script in `index.html` sets it before first paint (saved choice, else the OS setting), so there is no flash; `src/theme.js` holds the toggle logic (saved in `localStorage` key `hp-theme`, cross-faded with a view transition). The sun/moon button is in the nav.

How it is built, and what to know when you add UI:

- Only token values change in dark (`src/styles/32-dark-theme.css`). Write new CSS with the tokens (`--paper`, `--ink`, `--ink-soft`, `--link`, `--card`...), not literal colours, and it will follow the theme.
- `--ink` is "the text colour", so buttons and pills that use `background: var(--ink)` invert in dark. Surfaces that must stay dark in both themes (footer, awards, certificates, contact panel, preloader pill...) are listed in the `:is(...)` block of `32-dark-theme.css`; inside them the light-theme token values are restored.
- White "glass" panels use `rgba(var(--glass-rgb), calc(<alpha> * var(--glass-k)))`, which becomes a faint lift in dark. Shadows use `--shadow-rgb` (always dark).
- The WebGL background has darkened versions of every palette (`GradientBackground.jsx`) and the hero text reads `--ink`; both react to the `app:theme` event.
- `tests/theme.mjs` covers the behaviour; the accessibility and style-snapshot tests run in both themes.

## Page transitions

Opening a case study from the Work section (and coming back) runs inside the browser's View Transitions API: the clicked card's image morphs into the case-study cover, the nav stays put and the rest of the page fades. It is wired up in `src/App.jsx` (`navigate`), `src/viewTransition.js` and `src/styles/31-view-transitions.css`. Browsers without the API, and visitors who prefer reduced motion, just get the plain page swap.

Things to know if you touch it:

- The case-study page is loaded _before_ the transition starts (`ProjectRoute.jsx`), so it never morphs into a loading placeholder.
- The scroll position is restored inside the transition with an instant jump (`html` has `scroll-behavior: smooth`, which would otherwise visibly glide), and `useScrollSpring` snaps scroll-linked springs to the restored position.
- Frames and scroll events are frozen while a transition's update callback runs, so never `await` animation frames in there.
- `tests/transitions.mjs` guards all of this (one transition per navigation, exact scroll restore, the old page untouched until captured).

## Tests and CI

`npm test` builds the site and runs two browser checks (headless Chromium, `tests/`):

- **`tests/a11y.mjs`** runs axe-core (WCAG 2 A/AA and best practices) on the home page and the four case studies, on desktop and mobile sizes.
- **`tests/style-snapshot.mjs`** compares the computed design properties of every element with `tests/style-baseline.json`. Use it around CSS refactors: if nothing was meant to change, nothing may differ. When a visual change is intended, accept it with `npm run test:styles -- --update` and commit the new baseline.

GitHub Actions (`.github/workflows/ci.yml`) runs lint, format check and build, and in a second job `npm test`, on every push.
