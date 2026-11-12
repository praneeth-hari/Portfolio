import { Fragment, useEffect, useRef } from 'react';
import { useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import useScrollSpring from './useScrollSpring.js';

const TEXT =
  'Hi, I\u2019m Hari Praneeth, a Generative AI Engineer building LLM and RAG applications in Python. ' +
  'As an AI Engineering Intern at Breviq AI, I work on clinical AI workflows with FastAPI, LangGraph ' +
  'and Pinecone, from retrieval and evaluation to real-time voice. I care about systems that are ' +
  'measured, reliable and useful.';

const WORDS = TEXT.split(' ');
const N = WORDS.length;
const SOFT = 7; // how many words are mid-fade at once (bigger = softer wave)
const SOFT_FRAC = SOFT / N;

export default function About() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const wordRefs = useRef([]);
  const lastOps = useRef(new Array(N).fill(''));
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.92', 'end 0.3']
  });
  // spring smoothing so fast scrolling still reveals gently
  const smooth = useScrollSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.6 });

  const applyProgress = (v) => {
    if (reduce) return;
    for (let i = 0; i < N; i++) {
      const el = wordRefs.current[i];
      if (!el) continue;
      const start = (i / N) * (1 - SOFT_FRAC);
      const raw = (v - start) / SOFT_FRAC;
      const t = raw <= 0 ? 0 : raw >= 1 ? 1 : raw;
      const op = (0.15 + t * 0.85).toFixed(3);
      if (lastOps.current[i] !== op) {
        lastOps.current[i] = op;
        el.style.opacity = op;
      }
    }
  };

  useMotionValueEvent(smooth, 'change', applyProgress);
  // re-apply only when reduced-motion flips; applyProgress is recreated every render on purpose
  useEffect(() => {
    applyProgress(smooth.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return (
    <section className="wrap about-section" id="about">
      <div className="eyebrow">About me</div>
      <p className="about-text" ref={ref}>
        {WORDS.map((w, i) => (
          <Fragment key={i}>
            <span
              className="rw"
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              style={reduce ? { opacity: 1 } : undefined}
            >
              {w}
            </span>{' '}
          </Fragment>
        ))}
      </p>

      <div className="cv-actions">
        <a
          href="./Hari_Praneeth_Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="cv-btn cv-btn-primary"
          data-magnetic
        >
          Read My CV
        </a>
        <a
          href="./Hari_Praneeth_Resume.pdf"
          download="Hari_Praneeth_Resume.pdf"
          className="cv-btn cv-btn-secondary"
          data-magnetic
        >
          Download CV ↓
        </a>
      </div>
    </section>
  );
}
