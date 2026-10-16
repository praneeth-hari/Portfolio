import { useCallback, useEffect, useState } from 'react';
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
import SkillModal from './components/SkillModal.jsx';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  const [loading, setLoading] = useState(() => !prefersReducedMotion());
  const [skillOpen, setSkillOpen] = useState(false);
  const done = useCallback(() => setLoading(false), []);
  useSmoothScroll(loading || skillOpen);
  useMagnetic();
  const openSkill = useCallback(() => setSkillOpen(true), []);
  const closeSkill = useCallback(() => setSkillOpen(false), []);

  // lock page scroll while the preloader covers the screen
  useEffect(() => {
    document.documentElement.classList.toggle('pl-active', loading);
    return () => document.documentElement.classList.remove('pl-active');
  }, [loading]);

  return (
    <>
      <AnimatePresence>{loading && <Preloader key="preloader" onDone={done} />}</AnimatePresence>
      <GradientBackground palette="aurora" />
      <ScrollProgress />
      <Nav />
      <main>
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
      {!loading && <ChatBot />}
      <SkillModal open={skillOpen} onClose={closeSkill} />
    </>
  );
}
