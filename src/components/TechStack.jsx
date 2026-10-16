import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from 'framer-motion';
import Reveal from './Reveal.jsx';

/*
 * Tech stack as a bento grid. Edit the tiles below to change what shows up.
 *  - cls:   layout / color variant (t-feature, t-wide, t-dark, t-strip, or '')
 *  - tags:  small chips at the bottom of each tile
 *  - points: optional bullet list (used by the feature tile)
 */
const TILES = [
  {
    cls: 't-feature',
    title: 'AI Engineering',
    desc: 'Designing intelligent systems that connect models, retrieval, APIs, and software engineering.',
    tags: ['Python', 'LLMs', 'RAG', 'LangGraph', 'FastAPI'],
    points: ['AI application architecture', 'RAG pipelines', 'Agent workflows', 'Model orchestration'],
    opensModal: true
  },
  {
    cls: 't-wide',
    title: 'AI & Machine Learning',
    desc: 'Building and deploying intelligent models that learn and adapt.',
    tags: ['Python', 'PyTorch', 'Transformers', 'LLMs']
  },
  {
    cls: '',
    title: 'Backend & Architecture',
    desc: 'Designing reliable systems and scalable data layers.',
    tags: ['FastAPI', 'Node.js', 'PostgreSQL', 'Redis']
  },
  {
    cls: 't-dark',
    title: 'AI Tooling & Data',
    desc: 'Connecting models to real-world data at scale.',
    tags: ['Vector DBs', 'RAG Pipelines', 'Embeddings']
  },
  {
    cls: 't-strip',
    title: 'Frontend Engineering',
    desc: 'Crafting fast, accessible interfaces with modern frameworks.',
    tags: ['React', 'Next.js', 'TypeScript', 'Tailwind']
  }
];

function Tile({ tile, index, onOpenSkill }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // soft spotlight that follows the cursor inside the tile
  const glow = useMotionTemplate`radial-gradient(280px circle at ${mx}px ${my}px, rgba(120, 160, 255, 0.22), transparent 70%)`;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  return (
    <Reveal
      className={'bento-tile ' + tile.cls}
      delay={index * 0.07}
      onMouseMove={reduce ? undefined : onMove}
      whileHover={reduce ? undefined : { y: -4, transition: { type: 'spring', stiffness: 300, damping: 24 } }}
    >
      <motion.div className="bento-glow" style={{ background: glow }} aria-hidden="true" />

      <div className="bento-main">
        <div className="bento-index mono">{String(index + 1).padStart(2, '0')}</div>
        <h3 className="bento-title disp">{tile.title}</h3>
        <p className="bento-desc">{tile.desc}</p>

        {tile.points && (
          <ul className="bento-points">
            {tile.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="bento-foot">
        <div className="bento-tags">
          {tile.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        {tile.opensModal && (
          <button type="button" className="bento-cta" onClick={onOpenSkill}>
            View skills →
          </button>
        )}
      </div>
    </Reveal>
  );
}

export default function TechStack({ onOpenSkill }) {
  return (
    <section className="wrap" id="stack">
      <div className="section-head">
        <div>
          <Reveal className="eyebrow">Core expertise</Reveal>
          <Reveal as="h2" className="disp">Tech Stack</Reveal>
        </div>
      </div>

      <div className="bento">
        {TILES.map((t, i) => (
          <Tile key={t.title} tile={t} index={i} onOpenSkill={onOpenSkill} />
        ))}
      </div>
    </section>
  );
}
