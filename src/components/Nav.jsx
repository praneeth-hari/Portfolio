import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { getProjectSlug, goHome, onRouteChange } from '../route.js';
import { toggleTheme, useTheme } from '../theme.js';

const EMAIL = 'kurapatiharipraneeth2004@gmail.com';
const GITHUB = 'https://github.com/praneeth-hari';
const LINKEDIN = 'https://www.linkedin.com/in/kurapati-hari-praneeth-0a6699259/';

const SECTIONS = [
  { id: 'top', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'work', label: 'Work' },
  { id: 'stack', label: 'Tech Stack' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'contact', label: 'Contact' }
];

/*
 * Full-screen menu: a small top bar (name, current section, Menu button) and an
 * Aurora-coloured overlay with big numbered links. Esc or a click on a link closes it.
 */
export default function Nav() {
  const reduce = useReducedMotion();
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('top');
  const [hovered, setHovered] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [inProject, setInProject] = useState(() => !!getProjectSlug());

  useEffect(() => onRouteChange(() => setInProject(!!getProjectSlug())), []);

  /* scroll-spy */
  useEffect(() => {
    let lastScrolled = window.scrollY > 40;
    // one-time read of the real scroll position (it is not available during render)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScrolled(lastScrolled);
    const onScroll = () => {
      const next = window.scrollY > 40;
      if (next !== lastScrolled) {
        lastScrolled = next;
        setScrolled(next);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    let io = null;
    if (!inProject && 'IntersectionObserver' in window) {
      const vis = new Array(SECTIONS.length).fill(false);
      const indexById = new Map(SECTIONS.map((s, k) => [s.id, k]));
      io = new IntersectionObserver(
        (entries) => {
          for (const en of entries) {
            const k = indexById.get(en.target.id);
            if (k !== undefined) vis[k] = en.isIntersecting;
          }
          let n = -1;
          for (let k = vis.length - 1; k >= 0; k--) {
            if (vis[k]) {
              n = k;
              break;
            }
          }
          if (n >= 0) setActive(SECTIONS[n].id);
        },
        { rootMargin: '0px 0px -65% 0px', threshold: 0 }
      );
      SECTIONS.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el) io.observe(el);
      });
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (io) io.disconnect();
    };
  }, [inProject]);

  /* Esc closes; page scroll is paused while the menu is open */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  /* the page behind the full-screen menu must not take focus (or be read out) while it is open */
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) return undefined;
    main.inert = open;
    return () => {
      main.inert = false;
    };
  }, [open, inProject]);

  useEffect(() => {
    const l = window.__lenis;
    document.documentElement.classList.toggle('menu-open', open);
    if (l) open ? l.stop() : l.start();
    return () => document.documentElement.classList.remove('menu-open');
  }, [open]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = window.__lenis;
    if (lenis) {
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      lenis.scrollTo(id === 'top' ? 0 : el, { offset: -margin, duration: 1.4 });
    } else {
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const goTo = (e, id) => {
    e.preventDefault();
    setOpen(false);
    if (getProjectSlug()) {
      goHome(id);
      return;
    } // leave the case-study page first
    setActive(id);
    // wait a moment so the menu has started to close, then scroll
    setTimeout(() => scrollTo(id), reduce ? 0 : 350);
  };

  const theme = useTheme();
  const label = inProject ? 'Case study' : (SECTIONS.find((s) => s.id === active)?.label ?? 'Home');
  const dim = hovered ?? null;

  return (
    <>
      <header className={'mn-bar' + (scrolled ? ' is-scrolled' : '')}>
        <a
          href="#top"
          className="mn-logo"
          onClick={(e) => goTo(e, 'top')}
          aria-label="HP Hari Praneeth, back to top"
        >
          <span className="mn-mark">HP</span>
          <span className="mn-name">Hari Praneeth</span>
        </a>

        <div className="mn-right">
          <span className="mn-section" aria-hidden="true">
            <i className="mn-dot" />
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={label}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {label}
              </m.span>
            </AnimatePresence>
          </span>
          <button
            type="button"
            className="mn-theme"
            data-magnetic
            onClick={toggleTheme}
            aria-pressed={theme === 'dark'}
            aria-label="Dark theme"
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <svg className="mn-theme-sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3 7 7M17 17l1.7 1.7M5.3 18.7 7 17M17 7l1.7-1.7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <svg className="mn-theme-moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <a href="#contact" className="mn-hire" data-magnetic onClick={(e) => goTo(e, 'contact')}>
            Hire me
          </a>
          <button
            ref={btnRef}
            type="button"
            className={'mn-btn' + (open ? ' is-open' : '')}
            aria-expanded={open}
            aria-controls="mn-overlay"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="mn-btn-text">{open ? 'Close' : 'Menu'}</span>
            <span className="mn-burger" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <m.nav
            id="mn-overlay"
            className="mn-overlay"
            aria-label="Primary"
            initial={reduce ? { opacity: 0 } : { clipPath: 'circle(0px at calc(100% - 70px) 42px)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'circle(150% at calc(100% - 70px) 42px)' }}
            exit={reduce ? { opacity: 0 } : { clipPath: 'circle(0px at calc(100% - 70px) 42px)' }}
            transition={{ duration: reduce ? 0.2 : 0.75, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="mn-list" onMouseLeave={() => setHovered(null)}>
              {SECTIONS.map((s, i) => (
                <li
                  key={s.id}
                  className={
                    'mn-item' + (active === s.id ? ' is-active' : '') + (dim && dim !== s.id ? ' is-dim' : '')
                  }
                  onMouseEnter={() => setHovered(s.id)}
                >
                  <a
                    href={'#' + s.id}
                    onClick={(e) => goTo(e, s.id)}
                    onFocus={() => setHovered(s.id)}
                    onBlur={() => setHovered(null)}
                  >
                    <span className="mn-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="mn-clip">
                      <m.span
                        className="mn-word"
                        initial={reduce ? false : { y: '110%' }}
                        animate={{ y: 0 }}
                        exit={{ y: 0 }}
                        transition={{
                          delay: reduce ? 0 : 0.28 + i * 0.05,
                          duration: 0.7,
                          ease: [0.2, 0.8, 0.2, 1]
                        }}
                      >
                        {s.label}
                      </m.span>
                    </span>
                    <span className="mn-arrow" aria-hidden="true">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mn-foot">
              <a href={'mailto:' + EMAIL}>{EMAIL}</a>
              <span className="mn-social">
                <a href={GITHUB} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
                <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </span>
            </div>
          </m.nav>
        )}
      </AnimatePresence>
    </>
  );
}
