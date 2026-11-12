import { Fragment, useEffect, useRef } from 'react';
import { useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';

// words wrapped in * get the accent colour and a drawn underline
const TEXT =
  'I build *AI* *systems* that hold up in *production:* retrieval, agents and validation, shipped for *healthcare.*';
const TOKENS = TEXT.split(' ').map((raw) => {
  const hl = raw.startsWith('*') && raw.endsWith('*');
  return { hl, word: hl ? raw.slice(1, -1) : raw };
});
const N = TOKENS.length;

export default function Statement() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const wordRefs = useRef([]);
  const lineRefs = useRef([]);
  const lastOps = useRef(new Array(N).fill(''));
  const lastScales = useRef(new Array(N).fill(''));
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 50%'] });

  const applyProgress = (v) => {
    if (reduce) return;
    for (let i = 0; i < N; i++) {
      const wEl = wordRefs.current[i];
      const start = (i / N) * 0.8;
      if (wEl) {
        const raw = (v - start) / 0.2;
        const t = raw <= 0 ? 0 : raw >= 1 ? 1 : raw;
        const op = (0.14 + t * 0.86).toFixed(3);
        if (lastOps.current[i] !== op) {
          lastOps.current[i] = op;
          wEl.style.opacity = op;
        }
      }
      const lEl = lineRefs.current[i];
      if (lEl) {
        const rawL = (v - (start + 0.05)) / 0.23;
        const tL = rawL <= 0 ? 0 : rawL >= 1 ? 1 : rawL;
        const sc = tL.toFixed(3);
        if (lastScales.current[i] !== sc) {
          lastScales.current[i] = sc;
          lEl.style.transform = `scaleX(${sc})`;
        }
      }
    }
  };

  useMotionValueEvent(scrollYProgress, 'change', applyProgress);
  // re-apply only when reduced-motion flips; applyProgress is recreated every render on purpose
  useEffect(() => {
    applyProgress(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return (
    <section className="statement wrap" ref={ref}>
      <p aria-label={TEXT.replaceAll('*', '')}>
        {TOKENS.map(({ hl, word }, i) => (
          <Fragment key={i}>
            <span
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              style={{ opacity: reduce ? 1 : 0.14 }}
              className={'sw' + (hl ? ' sw-hl' : '')}
            >
              {word}
              {hl && (
                <i
                  ref={(el) => {
                    lineRefs.current[i] = el;
                  }}
                  className="sw-u"
                  style={{ transform: reduce ? 'scaleX(1)' : 'scaleX(0)' }}
                  aria-hidden="true"
                />
              )}
            </span>{' '}
          </Fragment>
        ))}
      </p>
    </section>
  );
}
