import { useEffect, useRef, useState } from 'react';
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
    href: 'https://github.com/praneeth-hari/ai-stock-trader',
    study: 'trader' // opens the case-study page inside this site
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
    desc: 'Network intrusion detection comparing 5 models side by side (XGBoost 99.99% accuracy), with AES-256 encryption on uploads and a JWT-secured API.',
    meta: 'Flask · XGBoost · TensorFlow · Docker · 2026',
    href: 'https://github.com/praneeth-hari/Secure-Cloud-Ml',
    study: 'securecloud' // opens the case-study page inside this site
  },
  {
    cls: 'work-4',
    image: 'projects/bob-assistant.png',
    category: 'Local LLM · Automation',
    name: 'BOB Personal AI Assistant',
    desc: 'A local-first Windows voice assistant: Whisper listens, a local Ollama model or NVIDIA’s cloud decides, and 11 tools act, with allow-listed apps and protected system processes.',
    meta: 'Python · Ollama · faster-whisper · Piper · 2026',
    href: 'https://github.com/praneeth-hari/BOB-Personal-AI-Assistant',
    study: 'bob' // opens the case-study page inside this site
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

// Pinned horizontal scroll: the section sticks to the screen and the cards slide sideways
// as you scroll down. On phones it falls back to a normal vertical list.
function HScroll({ children, count }) {
  const outer = useRef(null);
  const track = useRef(null);
  const reduce = useReducedMotion();
  const [dist, setDist] = useState(0);   // how far the track must travel
  const distRef = useRef(0);
  const [on, setOn] = useState(false);   // horizontal mode active?

  useEffect(() => {
    const measure = () => {
      const wide = window.innerWidth > 900 && !reduce;
      setOn(wide);
      if (wide && track.current) {
        const pad = Math.max(24, (window.innerWidth - 1240) / 2 + 24);
        const d = Math.max(0, track.current.scrollWidth - window.innerWidth + pad);
        distRef.current = d;
        setDist(d);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    const t = setTimeout(measure, 400);
    return () => { window.removeEventListener('resize', measure); clearTimeout(t); };
  }, [reduce, count]);

  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const x = useTransform(p, (v) => -v * distRef.current);
  const bar = useTransform(p, [0, 1], ['0%', '100%']);
  const [idx, setIdx] = useState(0);
  useEffect(() => p.on('change', (v) => setIdx(Math.min(count - 1, Math.round(v * (count - 1))))), [p, count]);

  return (
    <div ref={outer} className={on ? 'hs-outer' : 'work-grid'} style={on ? { height: `calc(100vh + ${dist}px)` } : undefined}>
      {on ? (
        <div className="hs-stick">
          <div className="hs-meta">
            <span className="hs-count"><b>{String(idx + 1).padStart(2, '0')}</b> / {String(count).padStart(2, '0')}</span>
            <span className="hs-line"><motion.i style={{ width: bar }} /></span>
            <span className="hs-hint">Keep scrolling</span>
          </div>
          <motion.div ref={track} className="hs-track" style={{ x }}>{children}</motion.div>
        </div>
      ) : children}
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

      <HScroll count={PROJECTS.length}>
        {PROJECTS.map((p, i) => (
          <div key={i} className={'work-card hs-card ' + p.cls}>
              <span className="hs-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
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
          </div>
        ))}
      </HScroll>
    </section>
  );
}
