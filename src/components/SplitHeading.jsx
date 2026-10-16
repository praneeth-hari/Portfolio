import { Fragment } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/*
 * Section heading that slides up word by word from behind a mask
 * the first time it scrolls into view.
 */
export default function SplitHeading({ children, className = 'disp' }) {
  const reduce = useReducedMotion();
  const words = String(children).split(' ');
  if (reduce) return <h2 className={className}>{children}</h2>;
  return (
    <motion.h2
      className={className + ' split-h'}
      aria-label={children}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      transition={{ staggerChildren: 0.08 }}
    >
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="split-w" aria-hidden="true">
            <motion.span
              className="split-i"
              variants={{ hidden: { y: '110%' }, show: { y: '0%' } }}
              transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </motion.h2>
  );
}
