import { motion, useScroll, useSpring } from 'framer-motion';

/* Thin mint-to-blue line across the top that fills as you scroll down. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}
