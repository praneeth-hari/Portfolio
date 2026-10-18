import { useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from 'framer-motion';
import Reveal from './Reveal.jsx';
import SplitHeading from './SplitHeading.jsx';
import { openProject } from '../route.js';

/*
 * Tech stack as a bento grid. Edit the tiles below to change what shows up.
 *  - cls:   layout / color variant (t-feature, t-wide, t-dark, t-strip, or '')
 *  - tags:  small chips at the bottom of each tile
 *  - points: optional bullet list (used by the feature tile)
 */
// "Where I used it" on the back of each tile: project, one-line result, optional link.
const USED = {
  'AI Engineering': [
    { name: 'Navent AI · Breviq', result: 'Recall@10 rose from 61.3% to 84.7% on BGE + Pinecone.' },
    { name: 'Medicinal Plant Detection', result: '78 plants in about 9 ms, answers cite sources.', study: 'mediplant' },
    { name: 'BOB Assistant', result: 'Fully offline voice assistant, 11 tools.', href: 'https://github.com/praneeth-hari/BOB-Personal-AI-Assistant' }
  ],
  'Backend & Data': [
    { name: 'Navent AI · Breviq', result: 'FastAPI with SQS batches, S3/STS and PostgreSQL.' },
    { name: 'Medicinal Plant Detection', result: 'FAISS retrieval over reviewed monographs.', study: 'mediplant' },
    { name: 'Secure Cloud ML', result: 'JWT-secured API, AES-256 encrypted transfer.', href: 'https://github.com/praneeth-hari/Secure-Cloud-Ml' }
  ],
  'Frontend & Delivery': [
    { name: 'Medicinal Plant Detection', result: 'React app: photo in, plant out, then ask.', study: 'mediplant' },
    { name: 'Secure Cloud ML', result: 'Flask app packaged with Docker.', href: 'https://github.com/praneeth-hari/Secure-Cloud-Ml' },
    { name: 'BOB Assistant', result: 'Local LLM through Ollama, no cloud.', href: 'https://github.com/praneeth-hari/BOB-Personal-AI-Assistant' }
  ]
};

const TILES = [
  {
    cls: 't-feature',
    title: 'AI Engineering',
    desc: 'LLM, RAG and agent systems that connect models, retrieval and APIs.',
    tags: ['Python', 'LLMs', 'RAG', 'LangGraph', 'PyTorch'],
    opensModal: true
  },
  {
    cls: '',
    title: 'Backend & Data',
    desc: 'Reliable APIs, vector search and data pipelines behind the models.',
    tags: ['FastAPI', 'PostgreSQL', 'Pinecone', 'FAISS', 'AWS']
  },
  {
    cls: 't-dark',
    title: 'Frontend & Delivery',
    desc: 'Interfaces and packaging that make the work usable.',
    tags: ['React', 'Docker', 'Flask', 'Ollama']
  }
];

function Tile({ tile, index, onOpenSkill }) {
  const reduce = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const used = USED[tile.title] || [];
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

      <div className={'tile-face tile-front' + (flipped ? ' is-away' : '')} aria-hidden={flipped}>
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
        <button type="button" className="flip-btn" onClick={() => setFlipped(true)} tabIndex={flipped ? -1 : 0}>Where I used it <span aria-hidden="true">↻</span></button>
      </div>

      <div className={'tile-face tile-back' + (flipped ? '' : ' is-away')} aria-hidden={!flipped}>
        <div className="back-k mono">{String(index + 1).padStart(2, '0')} · Where I used it</div>
        <ul className="back-list">
          {used.map((u) => (
            <li key={u.name}>
              <b>{u.name}</b>
              <span>{u.result}</span>
              {u.study && (
                <a href={'#/project/' + u.study} onClick={(e) => { e.preventDefault(); openProject(u.study); }}>Case study →</a>
              )}
              {!u.study && u.href && (
                <a href={u.href} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              )}
            </li>
          ))}
        </ul>
        <button type="button" className="flip-btn" onClick={() => setFlipped(false)} tabIndex={flipped ? 0 : -1}>
          <span aria-hidden="true">↺</span> Back
        </button>
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
          <SplitHeading>{"Tech Stack"}</SplitHeading>
        </div>
      </div>

      <div className="bento bento-3">
        {TILES.map((t, i) => (
          <Tile key={t.title} tile={t} index={i} onOpenSkill={onOpenSkill} />
        ))}
      </div>
    </section>
  );
}
