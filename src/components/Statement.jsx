import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// words wrapped in * get the accent colour and a drawn underline
const TEXT = 'I build *AI* *systems* that hold up in *production:* retrieval, agents and validation, shipped for *healthcare.*';

function Word({ raw, i, n, p }) {
  const hl = raw.startsWith('*') && raw.endsWith('*');
  const w = hl ? raw.slice(1, -1) : raw;
  const start = (i / n) * 0.8;
  const end = start + 0.2;
  const opacity = useTransform(p, [start, end], [0.14, 1]);
  const line = useTransform(p, [start + 0.05, end + 0.08], [0, 1]);
  return (
    <>
      <motion.span style={{ opacity }} className={'sw' + (hl ? ' sw-hl' : '')}>
        {w}
        {hl && <motion.i className="sw-u" style={{ scaleX: line }} aria-hidden="true" />}
      </motion.span>{' '}
    </>
  );
}

export default function Statement() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 50%'] });
  const words = TEXT.split(' ');
  return (
    <section className="statement wrap" ref={ref}>
      <p aria-label={TEXT.replaceAll('*', '')}>
        {words.map((w, i) => (
          <Word key={i} raw={w} i={i} n={words.length} p={scrollYProgress} />
        ))}
      </p>
    </section>
  );
}
