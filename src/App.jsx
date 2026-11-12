import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
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
const ProjectPage = lazy(() => import('./components/ProjectPage.jsx'));
import { getProjectSlug, onRouteChange } from './route.js';

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

  // case-study pages live at #/project/<name>
  useEffect(() => onRouteChange(() => setSlug(getProjectSlug())), []);
  const firstRoute = useRef(true);
  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    const lenis = window.__lenis;
    if (slug) {
      window.scrollTo(0, 0);
      lenis?.scrollTo(0, { immediate: true, force: true });
      return;
    }
    // back on the home page: go to the requested section, or return to where we were
    const id = window.__pendingScroll;
    window.__pendingScroll = null;
    const y = window.__homeY || 0;
    const t = setTimeout(() => {
      const el = id && document.getElementById(id);
      if (el) {
        const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - margin);
      } else {
        window.scrollTo(0, y);
      }
      lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
    }, 60);
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
        <Suspense fallback={<main id="main-content" tabIndex={-1} className="pj" aria-busy="true" />}>
          <ProjectPage slug={slug} />
        </Suspense>
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
