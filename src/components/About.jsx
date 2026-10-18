import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

const TEXT =
  "Hi, I\u2019m Hari Praneeth, a Generative AI Engineer building LLM and RAG applications in Python. " +
  'As an AI Engineering Intern at Breviq AI, I work on clinical AI workflows with FastAPI, LangGraph ' +
  'and Pinecone, from retrieval and evaluation to real-time voice. I care about systems that are ' +
  'measured, reliable and useful.';

const WORDS = TEXT.split(' ');
const N = WORDS.length;
const SOFT = 7; // how many words are mid-fade at once (bigger = softer wave)

// each word fades from 15% to 100% as the paragraph scrolls into view
function Word({ children, index, progress, still }) {
  const start = (index / N) * (1 - SOFT / N);
  const opacity = useTransform(progress, [start, start + SOFT / N], [0.15, 1]);
  return (
    <>
      <motion.span className="rw" style={{ opacity: still ? 1 : opacity }}>
        {children}
      </motion.span>{' '}
    </>
  );
}

export default function About() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.92', 'end 0.3']
  });
  // spring smoothing so fast scrolling still reveals gently
  const smooth = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.6 });

  return (
    <section className="wrap about-section" id="about">
      <div className="eyebrow">About me</div>
      <p className="about-text" ref={ref}>
        {WORDS.map((w, i) => (
          <Word key={i} index={i} progress={smooth} still={!!reduce}>
            {w}
          </Word>
        ))}
      </p>

      <div className="cv-actions">
        <a href="./Hari_Praneeth_Resume.pdf" target="_blank" rel="noopener noreferrer" className="cv-btn cv-btn-primary" data-magnetic>Read My CV</a>
        <a href="./Hari_Praneeth_Resume.pdf" download="Hari_Praneeth_Resume.pdf" className="cv-btn cv-btn-secondary" data-magnetic>Download CV ↓</a>
      </div>
    </section>
  );
}
