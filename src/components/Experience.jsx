import { useEffect, useRef } from 'react';
import { m, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import Reveal from './Reveal.jsx';
import SplitHeading from './SplitHeading.jsx';

const JOBS = [
  {
    dates: 'Jun 2026 – Present',
    role: 'AI Engineering Intern',
    company: 'Breviq AI',
    place: 'Hyderabad, India',
    project: 'Navent AI — Clinical AI Platform',
    stack: ['Python', 'FastAPI', 'LangGraph', 'Pinecone', 'PostgreSQL', 'AWS S3', 'AWS Chime', 'LLMs'],
    points: [
      'Built clinical documentation workflows in Python, FastAPI, and LangGraph that pair RAG retrieval with LLM analysis across 5 healthcare domains.',
      'Migrated clinical-code retrieval from ClinicalBERT to BGE on Pinecone: CDT Recall@10 rose from 61.3% to 84.7% while embedding storage dropped 69%.',
      'Implemented deterministic Python validators for medical, dental, and physical-therapy coding, including 12 medical inference guards, negation checks, dental billing rules, and CMS 8-minute validation.',
      'Built Navent Voice, a real-time CDI query resolution system integrating AWS Chime, Transcribe, Polly, and LLMs with conversational state management and safety guardrails.',
      'Extended the FastAPI backend with event-loop offloading, S3/STS storage, SQS batch processing, PostgreSQL persistence, and document merging.'
    ]
  }
];

// wrap the numbers in a bullet so the impact stands out
const hi = (text) =>
  text.split(/((?<![A-Za-z])\d+(?:\.\d+)?%?)/g).map((part, i) =>
    i % 2 ? (
      <b key={i} className="num">
        {part}
      </b>
    ) : (
      part
    )
  );

function Timeline({ points }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const itemRefs = useRef([]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 65%', 'end 55%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.4 });

  useEffect(() => {
    const items = itemRefs.current.filter(Boolean);
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          en.target.classList.toggle('is-in', en.isIntersecting);
        }
      },
      { rootMargin: '0px 0px -38% 0px', threshold: 0 }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduce, points.length]);

  return (
    <div className="tl" ref={ref}>
      <div className="tl-track" aria-hidden="true">
        <m.div className="tl-fill" style={reduce ? { scaleY: 1 } : { scaleY: fill }} />
      </div>
      {points.map((p, i) => (
        <div
          key={p}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          className={'tl-item' + (reduce ? ' is-in' : '')}
        >
          <span className="tl-dot" aria-hidden="true" />
          <p>{hi(p)}</p>
        </div>
      ))}
    </div>
  );
}

export default function Experience() {
  return (
    <section className="wrap" id="experience">
      <div className="section-head">
        <div>
          <Reveal className="eyebrow">Experience</Reveal>
          <SplitHeading>{'Where I’ve worked'}</SplitHeading>
        </div>
      </div>

      <div className="exp-list">
        {JOBS.map((j) => (
          <Reveal key={j.company} className="exp-item">
            <div className="exp-meta">
              <div className="exp-dates mono">{j.dates}</div>
              <div className="exp-company">{j.company}</div>
              <div className="exp-place">{j.place}</div>
            </div>

            <div className="exp-body">
              <h3 className="exp-role disp">{j.role}</h3>
              <div className="exp-project">{j.project}</div>
              <Timeline points={j.points} />
              <div className="exp-tags">
                {j.stack.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
