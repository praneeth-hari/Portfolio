import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import Reveal from './Reveal.jsx';
import FluidText from './FluidText.jsx';
import PaintReveal from './PaintReveal.jsx';

// The hero stays pinned for a little extra scroll: the title swells and blurs away,
// the portrait pushes toward you, then the page melts into the next section.
export default function Hero() {
  const outer = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  const titleScale = useTransform(p, [0, 1], [1, 2.4]);
  const titleOpacity = useTransform(p, [0, 0.55], [1, 0]);
  const titleBlur = useTransform(p, [0, 0.55], ['blur(0px)', 'blur(14px)']);
  const portraitScale = useTransform(p, [0, 1], [1, 1.28]);
  const portraitY = useTransform(p, [0, 1], ['0%', '6%']);
  const portraitOpacity = useTransform(p, [0.7, 1], [1, 0]);

  const fx = reduce;
  return (
    <div className="hero-scroll" ref={outer}>
      <section className="hero" id="top">
        <div className="hero-stage">
          <motion.div className="hero-layer hl-title" style={fx ? undefined : { scale: titleScale, opacity: titleOpacity, filter: titleBlur }}>
            <Reveal className="hero-title">
              <FluidText />
            </Reveal>
          </motion.div>
          <motion.div className="hero-layer hl-portrait" style={fx ? undefined : { scale: portraitScale, y: portraitY, opacity: portraitOpacity }}>
            <Reveal className="hero-portrait" delay={0.15}>
              <PaintReveal
                base={import.meta.env.BASE_URL + 'hero/hero-base.webp'}
                reveal={import.meta.env.BASE_URL + 'hero/hero-reveal.webp'}
                alt="Portrait of Hari Praneeth"
              />
            </Reveal>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
