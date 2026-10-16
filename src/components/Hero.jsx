import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import Reveal from './Reveal.jsx';
import FluidText from './FluidText.jsx';
import PaintReveal from './PaintReveal.jsx';

const PHRASES = [
  'Building intelligent, reliable systems.',
  'Architecting scalable AI & ML pipelines.',
  'Crafting high-performance software.'
];

export default function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref);
  const [i, setI] = useState(0);

  // rotate the tagline only while the hero is on screen
  useEffect(() => {
    if (reduce || !inView) return;
    const t = setInterval(() => setI((v) => (v + 1) % PHRASES.length), 3600);
    return () => clearInterval(t);
  }, [reduce, inView]);

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-stage">
        <Reveal className="hero-title">
          <FluidText />
        </Reveal>
        <Reveal className="hero-portrait" delay={0.15}>
          <PaintReveal
            base={import.meta.env.BASE_URL + 'hero/hero-base.png'}
            reveal={import.meta.env.BASE_URL + 'hero/hero-reveal.png'}
            alt="Portrait of Hari Praneeth"
          />
        </Reveal>
      </div>

      <div className="wrap">
        <Reveal className="hero-top">
          <div className="eyebrow mono">Portfolio · 2026</div>
        </Reveal>

        <Reveal className="hero-meta">
          <p className="hero-name disp">Hari Praneeth</p>
          <div className="hero-tagline" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={i}
                className="hero-tagline-text"
                initial={{ opacity: 0, filter: 'blur(8px)', y: 14 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(8px)', y: -14 }}
                transition={{ duration: 0.5 }}
              >
                {PHRASES[i]}
              </motion.span>
            </AnimatePresence>
          </div>
          <a href="#work" className="cta">See my work →</a>
        </Reveal>

        <Reveal className="role-foot mono">
          <span>© 2026</span>
          <span>kurapatiharipraneeth2004@gmail.com</span>
        </Reveal>
      </div>
    </section>
  );
}
