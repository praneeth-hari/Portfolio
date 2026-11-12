import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import Preloader from './components/Preloader.jsx';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Experience from './components/Experience.jsx';
import Work from './components/Work.jsx';
import TechStack from './components/TechStack.jsx';
import Credentials from './components/Credentials.jsx';
import Statement from './components/Statement.jsx';
import Thoughts from './components/Thoughts.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import GradientBackground from './components/GradientBackground.jsx';
import useSmoothScroll from './components/useSmoothScroll.js';
import useMagnetic from './components/useMagnetic.js';
import ScrollProgress from './components/ScrollProgress.jsx';
import ChatBot from './components/ChatBot.jsx';
import SectionRail from './components/SectionRail.jsx';
import SkillModal from './components/SkillModal.jsx';
// case-study pages (and their data) only load when someone opens one
import ProjectRoute, { loadProjectPage } from './components/ProjectRoute.jsx';
import { consumeSharedElement, getProjectSlug, onRouteChange } from './route.js';
import { SHARED_NAME, canViewTransition, visibleCardImage } from './viewTransition.js';
import { SETTLE_EVENT } from './components/useScrollSpring.js';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The loading screen plays once per browser session: reloads and return visits in the same tab skip it.
// sessionStorage can throw (private windows, blocked site data), so every access is guarded.
const PRELOADER_KEY = 'hp-preloader-seen';
const preloaderSeen = () => {
  try {
    return window.sessionStorage.getItem(PRELOADER_KEY) === '1';
  } catch {
    return false;
  }
};
const markPreloaderSeen = () => {
  try {
    window.sessionStorage.setItem(PRELOADER_KEY, '1');
  } catch {
    /* storage unavailable: the loading screen simply plays again next time */
  }
};

// Where the page should be after a route change: the top of a case study, or (back on the home page)
// the requested section / the spot the visitor left.
// `html { scroll-behavior: smooth }` would turn window.scrollTo into a visible glide, so jump explicitly.
const jumpTo = (top) => window.scrollTo({ top, left: 0, behavior: 'instant' });

function scrollForRoute(slug) {
  const lenis = window.__lenis;
  if (slug) {
    jumpTo(0);
    lenis?.scrollTo(0, { immediate: true, force: true });
    return;
  }
  const id = window.__pendingScroll;
  window.__pendingScroll = null;
  const el = id && document.getElementById(id);
  if (el) {
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    jumpTo(el.getBoundingClientRect().top + window.scrollY - margin);
  } else {
    jumpTo(window.__homeY || 0);
  }
  lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
}

// resolves after n animation frames (with a timeout, in case frames are paused)
const nextFrames = (n) =>
  new Promise((resolve) => {
    const timer = setTimeout(resolve, 200);
    const step = (left) =>
      requestAnimationFrame(() => {
        if (left <= 1) {
          clearTimeout(timer);
          resolve();
        } else {
          step(left - 1);
        }
      });
    step(n);
  });

export default function App() {
  const [loading, setLoading] = useState(() => !prefersReducedMotion() && !preloaderSeen());
  const [skillOpen, setSkillOpen] = useState(false);
  const [slug, setSlug] = useState(getProjectSlug);
  const toTop = () => {
    window.scrollTo(0, 0);
    window.__lenis?.scrollTo(0, { immediate: true, force: true });
  };
  const done = useCallback(() => {
    toTop(); // always land exactly on the top of the hero
    markPreloaderSeen();
    setLoading(false);
  }, []);

  // don't let the browser restore an old scroll position on refresh
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    if (!window.location.hash) toTop();
  }, []);
  useSmoothScroll(loading || skillOpen);
  useMagnetic();
  // hash routing owns location.hash, so the skip link moves focus instead of navigating
  const skipToContent = useCallback((e) => {
    e.preventDefault();
    const main = document.getElementById('main-content');
    if (!main) return;
    main.focus({ preventScroll: true });
    main.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, []);
  const openSkill = useCallback(() => setSkillOpen(true), []);
  const closeSkill = useCallback(() => setSkillOpen(false), []);

  // case-study pages live at #/project/<name>. Moving between them and the home page runs inside a
  // view transition: the clicked card's image morphs into the case-study cover and back.
  const slugRef = useRef(slug);
  const positionedByTransition = useRef(false); // the transition already scrolled the page
  useEffect(() => {
    const navigate = async () => {
      const next = getProjectSlug();
      const prev = slugRef.current;
      // popstate and hashchange both fire for one navigation; the second one has nothing left to do (and
      // must not touch the DOM, or the transition would capture the wrong "old" page)
      if (next === prev) return;
      if (next) await loadProjectPage(); // so the transition lands on the real page, not a placeholder
      slugRef.current = next;
      const fromCard = consumeSharedElement();
      if (!canViewTransition()) {
        setSlug(next);
        return;
      }
      if (fromCard) fromCard.style.viewTransitionName = SHARED_NAME;
      let toCard = null;
      const transition = document.startViewTransition(() => {
        positionedByTransition.current = true;
        flushSync(() => setSlug(next));
        scrollForRoute(next);
        if (!next) {
          toCard = visibleCardImage(prev);
          if (toCard) toCard.style.viewTransitionName = SHARED_NAME;
        }
      });
      const cleanup = () => {
        if (fromCard) fromCard.style.viewTransitionName = '';
        if (toCard) toCard.style.viewTransitionName = '';
      };
      // Frames (and scroll events) are frozen while the update callback runs, so the scroll-linked springs
      // can only be snapped to the restored position once the transition is under way. The incoming page
      // is still almost transparent at that point, so the correction is not visible.
      transition.ready
        .then(() => nextFrames(2))
        .then(() => window.dispatchEvent(new Event(SETTLE_EVENT)))
        .then(() => nextFrames(4)) // once more, in case the first pass ran before the scroll event was handled
        .then(() => window.dispatchEvent(new Event(SETTLE_EVENT)))
        .catch(() => {});
      transition.finished.then(cleanup, cleanup);
    };
    return onRouteChange(navigate);
  }, []);
  const firstRoute = useRef(true);
  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return undefined;
    }
    if (positionedByTransition.current) {
      positionedByTransition.current = false;
      return undefined;
    }
    if (slug) {
      scrollForRoute(slug);
      return undefined;
    }
    // back on the home page without a transition: wait a moment for the layout, then scroll
    const t = setTimeout(() => scrollForRoute(null), 60);
    return () => clearTimeout(t);
  }, [slug]);

  // lock page scroll while the preloader covers the screen
  useEffect(() => {
    document.documentElement.classList.toggle('pl-active', loading);
    return () => document.documentElement.classList.remove('pl-active');
  }, [loading]);

  return (
    <>
      <AnimatePresence>{loading && <Preloader key="preloader" onDone={done} />}</AnimatePresence>
      <a className="skip-link" href="#main-content" onClick={skipToContent}>
        Skip to content
      </a>
      <GradientBackground palette="aurora" />
      <ScrollProgress />
      <Nav />
      {!slug && !loading && <SectionRail />}
      {slug ? (
        <ProjectRoute slug={slug} />
      ) : (
        <main id="main-content" tabIndex={-1}>
          <Hero />
          <About />
          <Experience />
          <Work />
          <TechStack onOpenSkill={openSkill} />
          <Credentials />
          <Statement />
          <Thoughts />
          <Contact />
          <Footer />
        </main>
      )}
      {/* chatbot only runs locally (npm run dev); hidden on the live site */}
      {!loading && import.meta.env.DEV && <ChatBot />}
      <SkillModal open={skillOpen} onClose={closeSkill} />
    </>
  );
}
