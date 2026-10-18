import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import Reveal from './Reveal.jsx';
import SplitHeading from './SplitHeading.jsx';
import { openProject } from '../route.js';

const PROJECTS = [
  {
    cls: 'work-1',
    image: 'projects/ai-stock-trader.png',
    category: 'Machine Learning · FinTech',
    name: 'AI Stock Trader',
    desc: 'Paper-trading system for 25 US stocks: ML signals, a risk engine that can veto any trade, walk-forward backtests and a live dashboard. Benchmarked honestly against SPY.',
    meta: 'Python · scikit-learn · Streamlit · SQLAlchemy · 2026',
    href: 'https://github.com/praneeth-hari/ai-stock-trader'
  },
  {
    cls: 'work-2',
    image: 'projects/medicinal-plant.png',
    category: 'Computer Vision + RAG',
    name: 'Medicinal Plant Detection',
    desc: 'Identifies 78 medicinal plants from a photo in about 9 ms, then answers questions with a local RAG assistant that cites its sources.',
    meta: 'PyTorch · FastAPI · React · FAISS · Ollama · 2025',
    href: 'https://github.com/praneeth-hari/Medicinal-Plant-Detection',
    demo: 'https://ai-medicinal-plant-identification.vercel.app/',
    study: 'mediplant' // opens the case-study page inside this site
  },
  {
    cls: 'work-3',
    image: 'projects/secure-cloud-ml.png',
    category: 'Machine Learning · Security',
    name: 'Secure Cloud ML',
    desc: 'Network intrusion detection comparing 5 models side by side (XGBoost 99.99% accuracy), with AES-256 encrypted data transfer and a JWT-secured API.',
    meta: 'Flask · XGBoost · TensorFlow · Docker · 2026',
    href: 'https://github.com/praneeth-hari/Secure-Cloud-Ml'
  },
  {
    cls: 'work-4',
    image: 'projects/bob-assistant.png',
    category: 'Local LLM · Automation',
    name: 'BOB Personal AI Assistant',
    desc: 'A 100% offline Windows assistant: local LLM through Ollama, 11 PC-control tools, and voice in and out with Whisper and Piper.',
    meta: 'Python · Ollama · faster-whisper · Piper · 2026',
    href: 'https://github.com/praneeth-hari/BOB-Personal-AI-Assistant'
  }
];

// Cover image for a card. If the file is missing, the card keeps its gradient.
function CardImage({ src, alt }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <img
      className="work-img"
      src={import.meta.env.BASE_URL + src}
      alt={alt}
      loading="lazy"
      onError={() => setOk(false)}
    />
  );
}

// Card tilts back and grows into place as it scrolls up the screen (Salix-style)
function RiseCard({ className, children }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.55'] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.5 });
  const rotateX = useTransform(p, [0, 1], [14, 0]);
  const scale = useTransform(p, [0, 1], [0.9, 1]);
  const opacity = useTransform(p, [0, 0.6], [0.35, 1]);
  return (
    <div ref={ref} className="rise-wrap">
      <motion.div
        className={className}
        style={reduce ? undefined : { rotateX, scale, opacity, transformPerspective: 1200 }}
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function Work() {
  return (
    <section className="wrap" id="work">
      <div className="section-head">
        <div>
          <Reveal className="eyebrow">Selected work</Reveal>
          <SplitHeading>{"Featured Projects"}</SplitHeading>
        </div>
        <Reveal as="a" href="https://github.com/praneeth-hari" target="_blank" rel="noopener noreferrer" className="view-all">View GitHub ↗</Reveal>
      </div>

      <div className="work-grid">
        {PROJECTS.map((p, i) => (
          <RiseCard key={i} className={'work-card ' + p.cls}>
              <CardImage src={p.image} alt={p.name + ' preview'} />
              <span className="card-badge">{p.category}</span>
              <h3 className="disp">{p.name}</h3>
              <p className="work-desc">{p.desc}</p>
              <div className="sub">{p.meta}</div>
              {/* whole card opens the case study (if there is one), the live demo, or the repo */}
              {p.study ? (
                <a
                  className="card-hit"
                  href={'#/project/' + p.study}
                  aria-label={p.name + ' case study'}
                  onClick={(e) => { e.preventDefault(); openProject(p.study); }}
                />
              ) : (
                <a
                  className="card-hit"
                  href={p.demo || p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={p.name + (p.demo ? ' live demo' : ' on GitHub')}
                />
              )}
              {p.study && <span className="card-case">Case study →</span>}
              <span className="card-links">
                {p.demo && (
                  <a href={p.demo} target="_blank" rel="noopener noreferrer">Live demo ↗</a>
                )}
                <a href={p.href} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              </span>
          </RiseCard>
        ))}
      </div>
    </section>
  );
}
