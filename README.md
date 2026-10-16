# Hari Praneeth – Portfolio (React + Framer Motion)

Your portfolio rebuilt with **Vite + React 19 + Framer Motion**. The design, colors, copy and the WebGL fluid hero are the same as the single-file `index.html`; the animations are now driven by Framer Motion.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
npm run preview    # serve the production build locally
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

| Feature | File |
| --- | --- |
| Scroll-in reveals (`whileInView`) | `src/components/Reveal.jsx` |
| Preloader counter and slide-up exit | `src/components/Preloader.jsx` |
| Nav: shared-layout sliding highlight (`layoutId`), label morph, scroll-progress ring, toast | `src/components/Nav.jsx` |
| Hero tagline rotator (`AnimatePresence`) | `src/components/Hero.jsx` |
| About: scroll-linked word reveal (`useScroll` + `useTransform`) | `src/components/About.jsx` |
| Tech stack fan: spring-animated cards | `src/components/TechStack.jsx` |
| Skills dialog enter/exit | `src/components/SkillModal.jsx` |

The WebGL fluid text (`src/components/FluidText.jsx`) is plain WebGL, ported as-is with cleanup.

## Editing content

Each section is its own component in `src/components/`. Placeholders look like `[[ PROJECT NAME ]]` (Work, Thoughts). Styles live in `src/styles.css`; the block at the bottom ("Framer Motion overrides") switches off the old CSS transitions that Framer Motion now handles.

## Known to-dos

- **Contact form** does not send anything yet. Connect it in `src/components/Contact.jsx` (`onSubmit`) to Formspree, Web3Forms or EmailJS.
- CV buttons (`About.jsx`) and the X links (`Contact.jsx`, `Footer.jsx`) still point to `#`.
- Add `og:url` / `og:image` in `index.html` once deployed.

## Deploy

`npm run build`, then upload `dist/` to Vercel, Netlify or GitHub Pages (the build uses relative paths).
