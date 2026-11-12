import { m, useReducedMotion, useScroll } from 'framer-motion';
import useScrollSpring from './useScrollSpring.js';

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useScrollSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  return <m.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

/* Thin mint-to-blue line across the top that fills as you scroll down. */
export default function ScrollProgress() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return <ScrollProgressBar />;
}
