import { motion, useReducedMotion } from 'framer-motion';

/*
 * Scroll-in reveal (replaces the old IntersectionObserver + .reveal class).
 * Renders any HTML element via `as`, fades/slides it in once when it enters
 * the viewport, and is skipped entirely for reduced-motion users.
 */
export default function Reveal({ as = 'div', delay = 0, y = 24, children, ...rest }) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, ease: [0.2, 0.7, 0.3, 1], delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
