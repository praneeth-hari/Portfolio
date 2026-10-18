import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getProjectSlug, goHome, onRouteChange } from '../route.js';

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
    let ticking = false;
    const update = () => {
      const line = window.innerHeight * 0.35;
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive(current);
      setScrolled(window.scrollY > 40);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  /* Esc closes; page scroll is paused while the menu is open */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && open) { setOpen(false); btnRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const l = window.__lenis;
    document.documentElement.classList.toggle('menu-open', open);
    if (l) (open ? l.stop() : l.start());
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
    if (getProjectSlug()) { goHome(id); return; } // leave the case-study page first
    setActive(id);
    // wait a moment so the menu has started to close, then scroll
    setTimeout(() => scrollTo(id), reduce ? 0 : 350);
  };

  const label = inProject ? 'Case study' : (SECTIONS.find((s) => s.id === active)?.label ?? 'Home');
  const dim = hovered ?? null;

  return (
    <>
      <header className={'mn-bar' + (scrolled ? ' is-scrolled' : '')}>
        <a href="#top" className="mn-logo" onClick={(e) => goTo(e, 'top')} aria-label="Hari Praneeth, back to top">
          <span className="mn-mark">HP</span>
          <span className="mn-name">Hari Praneeth</span>
        </a>

        <div className="mn-right">
          <span className="mn-section" aria-hidden="true">
            <i className="mn-dot" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={label}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {label}
              </motion.span>
            </AnimatePresence>
          </span>
          <a href="#contact" className="mn-hire" onClick={(e) => goTo(e, 'contact')}>Hire me</a>
          <button
            ref={btnRef}
            type="button"
            className={'mn-btn' + (open ? ' is-open' : '')}
            aria-expanded={open}
            aria-controls="mn-overlay"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="mn-btn-text">{open ? 'Close' : 'Menu'}</span>
            <span className="mn-burger" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
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
                  <a href={'#' + s.id} onClick={(e) => goTo(e, s.id)} onFocus={() => setHovered(s.id)} onBlur={() => setHovered(null)}>
                    <span className="mn-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="mn-clip">
                      <motion.span
                        className="mn-word"
                        initial={reduce ? false : { y: '110%' }}
                        animate={{ y: 0 }}
                        exit={{ y: 0 }}
                        transition={{ delay: reduce ? 0 : 0.28 + i * 0.05, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                      >
                        {s.label}
                      </motion.span>
                    </span>
                    <span className="mn-arrow" aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mn-foot">
              <a href={'mailto:' + EMAIL}>{EMAIL}</a>
              <span className="mn-social">
                <a href={GITHUB} target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </span>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
