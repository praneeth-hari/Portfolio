import { useEffect, useRef, useState } from 'react';
import { m, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import Reveal from './Reveal.jsx';
import SplitHeading from './SplitHeading.jsx';
import OptimizedImage from './OptimizedImage.jsx';
import { openProject } from '../route.js';
import { BP, maxTablet } from '../breakpoints.js';

const PROJECTS = [
  {
    cls: 'work-1',
    image: 'projects/ai-stock-trader.webp',
    category: 'Machine Learning · FinTech',
    name: 'AI Stock Trader',
    desc: 'Paper-trading system for 25 US stocks: ML signals, a risk engine that can veto any trade, walk-forward backtests and a live dashboard. Benchmarked honestly against SPY.',
    meta: 'Python · scikit-learn · Streamlit · SQLAlchemy · 2026',
    href: 'https://github.com/praneeth-hari/ai-stock-trader',
    study: 'trader' // opens the case-study page inside this site
  },
  {
    cls: 'work-2',
    image: 'projects/medicinal-plant.webp',
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
    image: 'projects/secure-cloud-ml.webp',
    category: 'Machine Learning · Security',
    name: 'Secure Cloud ML',
    desc: 'Network intrusion detection comparing 5 models side by side (XGBoost 99.99% accuracy), with AES-256 encryption on uploads and a JWT-secured API.',
    meta: 'Flask · XGBoost · TensorFlow · Docker · 2026',
    href: 'https://github.com/praneeth-hari/Secure-Cloud-Ml',
    study: 'securecloud' // opens the case-study page inside this site
  },
  {
    cls: 'work-4',
    image: 'projects/bob-assistant.webp',
    category: 'Local LLM · Automation',
    name: 'BOB Personal AI Assistant',
    desc: "A local-first Windows voice assistant: Whisper listens, a local Ollama model or NVIDIA's cloud decides, and 11 tools act, with allow-listed apps and protected system processes.",
    meta: 'Python · Ollama · faster-whisper · Piper · 2026',
    href: 'https://github.com/praneeth-hari/BOB-Personal-AI-Assistant',
    study: 'bob' // opens the case-study page inside this site
  }
];

// Cover image for a card. If the file is missing, the card keeps its gradient.
// Cards sit inside a horizontal transform track, so eager + low fetchPriority + async decode
// prevents off-screen horizontal cards from popping in late when scrolled into view.
function CardImage({ src, alt }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <OptimizedImage
      className="work-img"
      src={src}
      alt={alt}
      widths={[640, 1024, 1448]}
      sizes={`${maxTablet} calc(100vw - 64px), min(64vw, 760px)`}
      width={1448}
      height={1086}
      loading="eager"
      fetchPriority="low"
      decoding="async"
      onError={() => setOk(false)}
    />
  );
}

const prefetched = new Set();
function prefetchStudy(slug) {
  if (!slug || prefetched.has(slug)) return;
  prefetched.add(slug);
  // the case-study data is its own chunk; fetch it only when a card is hovered or focused
  import('../data/projects.js').then(({ PROJECTS }) => {
    const study = PROJECTS[slug];
    if (!study) return;
    const list = [...(study.shots || []), ...(study.shot ? [study.shot] : [])];
    for (const item of list) {
      const img = new Image();
      img.decoding = 'async';
      img.src = import.meta.env.BASE_URL + item.src;
    }
  });
}

// Pinned horizontal scroll: the section sticks to the screen and the cards slide sideways
// as you scroll down. On phones it falls back to a normal vertical list.
function HScroll({ children, count }) {
  const outer = useRef(null);
  const track = useRef(null);
  const reduce = useReducedMotion();
  const [dist, setDist] = useState(0); // how far the track must travel
  const distRef = useRef(0);
  const [on, setOn] = useState(false); // horizontal mode active?

  useEffect(() => {
    const measure = () => {
      const wide = window.innerWidth > BP.tablet && !reduce;
      setOn(wide);
      if (wide && track.current) {
        // the left padding of the track is set in CSS (25-projects.css); read it so the two cannot drift apart
        const pad = parseFloat(getComputedStyle(track.current).paddingLeft) || 24;
        const d = Math.max(0, track.current.scrollWidth - window.innerWidth + pad);
        distRef.current = d;
        setDist(d);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    const t = setTimeout(measure, 400);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, [reduce, count]);

  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const x = useTransform(p, (v) => -v * distRef.current);
  const bar = useTransform(p, [0, 1], [0, 1]);
  const [idx, setIdx] = useState(0);
  useEffect(
    () => p.on('change', (v) => setIdx(Math.min(count - 1, Math.round(v * (count - 1))))),
    [p, count]
  );

  return (
    <div
      ref={outer}
      className={on ? 'hs-outer' : 'work-grid'}
      style={on ? { height: `calc(100vh + ${dist}px)` } : undefined}
    >
      {on ? (
        <div className="hs-stick">
          <div className="hs-meta">
            <span className="hs-count">
              <b>{String(idx + 1).padStart(2, '0')}</b> / {String(count).padStart(2, '0')}
            </span>
            <span className="hs-line">
              <m.i style={{ scaleX: bar }} />
            </span>
            <span className="hs-hint">Keep scrolling</span>
          </div>
          <m.div ref={track} className="hs-track" style={{ x }}>
            {children}
          </m.div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default function Work() {
  return (
    <section className="wrap" id="work">
      <div className="section-head">
        <div>
          <Reveal className="eyebrow">Selected work</Reveal>
          <SplitHeading>{'Featured Projects'}</SplitHeading>
        </div>
        <Reveal
          as="a"
          href="https://github.com/praneeth-hari"
          target="_blank"
          rel="noopener noreferrer"
          className="view-all"
        >
          View GitHub ↗
        </Reveal>
      </div>

      <HScroll count={PROJECTS.length}>
        {PROJECTS.map((p, i) => (
          <div
            key={i}
            className={'work-card hs-card ' + p.cls}
            onMouseEnter={p.study ? () => prefetchStudy(p.study) : undefined}
            onFocus={p.study ? () => prefetchStudy(p.study) : undefined}
          >
            <span className="hs-num" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
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
                onClick={(e) => {
                  e.preventDefault();
                  openProject(p.study);
                }}
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
                <a href={p.demo} target="_blank" rel="noopener noreferrer">
                  Live demo ↗
                </a>
              )}
              <a href={p.href} target="_blank" rel="noopener noreferrer">
                GitHub ↗
              </a>
            </span>
          </div>
        ))}
      </HScroll>
    </section>
  );
}
