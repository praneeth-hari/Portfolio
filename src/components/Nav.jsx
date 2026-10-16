import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion } from 'framer-motion';

const EMAIL = 'kurapatiharipraneeth2004@gmail.com';

// single source of truth: pill label while closed + link text in the open menu
const SECTIONS = [
  { id: 'top', label: 'Hero', navLabel: 'Home' },
  { id: 'about', label: 'About', navLabel: 'About' },
  { id: 'experience', label: 'Experience', navLabel: 'Experience' },
  { id: 'work', label: 'Work', navLabel: 'Work' },
  { id: 'stack', label: 'Tech Stack', navLabel: 'Tech Stack' },
  { id: 'credentials', label: 'Credentials', navLabel: 'Credentials' },
  { id: 'contact', label: 'Contact', navLabel: 'Contact' }
];

const isMobileMenu = () => window.matchMedia('(max-width: 640px)').matches;

export default function Nav() {
  const reduce = useReducedMotion();
  const navRef = useRef(null);
  const toggleRef = useRef(null);
  const activeRef = useRef('top');
  const prevActive = useRef('top');
  const toastTimer = useRef(null);

  const [active, setActive] = useState('top');
  const [open, setOpen] = useState(() => !isMobileMenu()); // Hero starts expanded on desktop
  const [hovered, setHovered] = useState(null);
  const [toast, setToast] = useState('');

  // scroll progress (0..1) -> ring around the toggle
  const progress = useMotionValue(0);

  /* ---- scroll-spy: last section whose top crossed a reference line ---- */
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const line = window.innerHeight * 0.35;
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      activeRef.current = current;
      setActive(current);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.set(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    // page height changes when the preloader releases the scroll lock
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (ro) ro.observe(document.body);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (ro) ro.disconnect();
    };
  }, [progress]);

  /* ---- Hero auto-expands on entry and auto-collapses on exit ---- */
  useEffect(() => {
    const prev = prevActive.current;
    prevActive.current = active;
    if (active === 'top' && prev !== 'top' && !isMobileMenu()) setOpen(true);
    else if (prev === 'top' && active !== 'top') setOpen(false);
  }, [active]);

  /* ---- click outside closes (but never on the hero) / Escape closes ---- */
  useEffect(() => {
    const onDoc = (e) => {
      if (navRef.current && !navRef.current.contains(e.target) && activeRef.current !== 'top') {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = window.__lenis;
    if (lenis) {
      // same landing spot as scroll-margin-top in styles.css
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      lenis.scrollTo(id === 'top' ? 0 : el, { offset: -margin, duration: 1.4 });
    } else {
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const goTo = (e, id) => {
    e.preventDefault();
    setOpen(false);
    activeRef.current = id;
    setActive(id);
    scrollTo(id);
  };

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };

  const copyEmail = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(EMAIL);
      ok = true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = EMAIL;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      ta.remove();
    }
    showToast(ok ? 'Email copied ✓' : 'Copy failed — ' + EMAIL);
  };

  const label = SECTIONS.find((s) => s.id === active)?.label ?? 'Hero';
  const highlightId = hovered ?? active;
  const tab = open ? 0 : -1;

  return (
    <>
      <nav className="dyn-nav" id="dynNav" aria-label="Primary" ref={navRef}>
        <div className={'dyn-nav-pill' + (open ? ' open' : '')} id="dynNavPill">
          <div className="dyn-nav-row">
            <div className="dyn-nav-label-wrap">
              <div className="dyn-nav-label-row">
                <span className="dyn-nav-status" role="img" aria-label="Open to work" title="Open to work" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={label}
                    className="dyn-nav-label"
                    initial={reduce ? false : { opacity: 0, filter: 'blur(4px)', y: 6 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(4px)', y: -6 }}
                    transition={{ duration: 0.22 }}
                  >
                    {label}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            <div className="dyn-nav-links" id="dynNavLinks">
              <div className="dyn-nav-links-inner" onMouseLeave={() => setHovered(null)}>
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={'#' + s.id}
                    className={active === s.id ? 'is-active' : undefined}
                    aria-current={active === s.id ? 'true' : undefined}
                    tabIndex={tab}
                    onClick={(e) => goTo(e, s.id)}
                    onMouseEnter={() => setHovered(s.id)}
                    onFocus={() => setHovered(s.id)}
                    onBlur={() => setHovered(null)}
                  >
                    {highlightId === s.id && (
                      <motion.span
                        layoutId="dyn-nav-highlight"
                        className="dyn-nav-hl"
                        aria-hidden="true"
                        transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                      />
                    )}
                    {s.navLabel}
                  </a>
                ))}

                <a
                  className="dyn-nav-hire"
                  href="#contact"
                  tabIndex={tab}
                  onClick={(e) => goTo(e, 'contact')}
                >
                  Hire me
                </a>
                <button
                  type="button"
                  className="dyn-nav-copy"
                  aria-label="Copy email address"
                  tabIndex={tab}
                  onClick={copyEmail}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="9" y="9" width="11" height="11" rx="2" />
                    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                  </svg>
                  <span className="dyn-nav-copy-label">Copy email</span>
                </button>
              </div>
            </div>

            <button
              ref={toggleRef}
              className="dyn-nav-toggle"
              id="dynNavToggle"
              aria-expanded={open}
              aria-controls="dynNavLinks"
              aria-label="Toggle navigation"
              onClick={() => setOpen((o) => !o)}
            >
              <svg className="dyn-nav-ring" viewBox="0 0 44 44" aria-hidden="true">
                <circle className="dyn-nav-ring-bg" cx="22" cy="22" r="20" />
                <motion.circle
                  className="dyn-nav-ring-fg"
                  cx="22"
                  cy="22"
                  r="20"
                  style={{ pathLength: progress }}
                />
              </svg>
              <span className="dyn-nav-icon" aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      <div className="dyn-toast-wrap" role="status" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast}
              className="dyn-toast"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
