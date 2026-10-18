import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Reveal from './Reveal.jsx';
import { PROJECTS } from '../data/projects.js';
import { goHome } from '../route.js';

/* ---------- clickable architecture diagram ---------- */
function Architecture({ rows }) {
  const reduce = useReducedMotion();
  const [sel, setSel] = useState(rows[0].nodes[0].id);
  const all = rows.flatMap((r) => r.nodes);
  const node = all.find((n) => n.id === sel) || all[0];

  return (
    <div className="arch">
      {rows.map((row) => (
        <div className="arch-lane" key={row.title}>
          <div className="arch-lane-title mono">{row.title}</div>
          <div className="arch-row" role="group" aria-label={row.title}>
            {row.nodes.map((n, i) => (
              <div className="arch-cell" key={n.id}>
                <button
                  type="button"
                  className={'arch-node' + (sel === n.id ? ' is-on' : '')}
                  aria-pressed={sel === n.id}
                  onClick={() => setSel(n.id)}
                >
                  <span className="arch-label">{n.label}</span>
                  <span className="arch-sub">{n.sub}</span>
                </button>
                {i < row.nodes.length - 1 && (
                  <span className="arch-link" aria-hidden="true"><i /></span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="arch-hint mono">Tap any box to see what it does and why I chose it</div>

      <div className="arch-panel" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={node.id}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            <h3 className="arch-panel-title disp">{node.label}</h3>
            <p className="arch-panel-text">{node.what}</p>
            {node.why && (
              <div className="arch-why">
                <span className="mono">Why this choice</span>
                <p>{node.why}</p>
              </div>
            )}
            {node.facts && (
              <ul className="arch-facts">
                {node.facts.map((f) => <li key={f}>{f}</li>)}
              </ul>
            )}
            {node.files && (
              <div className="arch-files mono">
                {node.files.map((f) => <span key={f}>{f}</span>)}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Bar({ label, value, tone, max = 100, unit = '%' }) {
  const reduce = useReducedMotion();
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <motion.div
          className={'bar-fill ' + tone}
          initial={reduce ? false : { width: 0 }}
          whileInView={{ width: Math.max(1.5, (value / max) * 100) + '%' }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </div>
      <span className="bar-val">{value}{unit}</span>
    </div>
  );
}

// project image: sits behind the header on the right and fades into the page
function CoverBg({ src }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <div className="pj-bg" aria-hidden="true">
      <img src={'/' + src} alt="" onError={() => setOk(false)} />
    </div>
  );
}

// demo video: poster first, plays muted when scrolled into view, pauses when it leaves
function Demo({ video }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); },
      { threshold: 0.5 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  const base = import.meta.env.BASE_URL;
  return (
    <figure className="pj-demo">
      <video
        ref={ref}
        className="pj-demo-video"
        src={base + video.src}
        poster={base + video.poster}
        muted
        loop
        playsInline
        controls
        preload="metadata"
      />
      <figcaption className="pj-demo-cap">{video.caption}</figcaption>
    </figure>
  );
}

export default function ProjectPage({ slug }) {
  const p = PROJECTS[slug];

  if (!p) {
    return (
      <main className="wrap pj">
        <button type="button" className="pj-back" onClick={() => goHome('work')}>← All projects</button>
        <h1 className="pj-title disp">Project not found</h1>
      </main>
    );
  }

  return (
    <main className="pj" id="project">
      <CoverBg src={p.cover} />
      <div className="wrap">
        <button type="button" className="pj-back" onClick={() => goHome('work')}>← All projects</button>

        <header className="pj-head">
          <Reveal className="eyebrow">{p.category}</Reveal>
          <Reveal as="h1" className="pj-title disp" delay={0.05}>{p.title}</Reveal>
          <Reveal as="p" className="pj-lead" delay={0.1}>{p.lead}</Reveal>
          <Reveal className="pj-actions" delay={0.15}>
            {p.demo && <a className="pj-btn is-primary" href={p.demo} target="_blank" rel="noopener noreferrer">Live demo ↗</a>}
            <a className="pj-btn" href={p.github} target="_blank" rel="noopener noreferrer">View code ↗</a>
          </Reveal>
        </header>

        <section className="pj-stats" aria-label="Key results">
          {p.stats.map((s) => (
            <Reveal className="pj-stat" key={s.label}>
              <div className="pj-stat-value disp">{s.value}</div>
              <div className="pj-stat-label">{s.label}</div>
              {s.note && <div className="pj-stat-note mono">{s.note}</div>}
            </Reveal>
          ))}
        </section>

        <section className="pj-sec">
          <Reveal className="eyebrow">The problem</Reveal>
          <Reveal as="p" className="pj-body pj-body-lg">{p.problem}</Reveal>
        </section>

        {p.video && (
          <section className="pj-sec">
            <Reveal className="eyebrow">See it work</Reveal>
            <Reveal as="h2" className="pj-h2 disp">The whole flow, live</Reveal>
            <Reveal><Demo video={p.video} /></Reveal>
          </section>
        )}

        {(p.shots || (p.shot ? [p.shot] : [])).length > 0 && (
          <section className="pj-sec">
            <Reveal className="eyebrow">{(p.shotsTitle || {}).eyebrow || 'The dashboard'}</Reveal>
            <Reveal as="h2" className="pj-h2 disp">{(p.shotsTitle || {}).heading || 'Where I watch it run'}</Reveal>
            {(p.shots || [p.shot]).map((sh) => (
              <Reveal key={sh.src} className="pj-shot-wrap">
                <figure className="pj-demo">
                  <img className="pj-demo-video pj-shot" src={import.meta.env.BASE_URL + sh.src} alt={sh.alt} loading="lazy" />
                  <figcaption className="pj-demo-cap">{sh.caption}</figcaption>
                </figure>
              </Reveal>
            ))}
          </section>
        )}

        <section className="pj-sec">
          <Reveal className="eyebrow">How it works</Reveal>
          <Reveal as="h2" className="pj-h2 disp">Architecture</Reveal>
          <Reveal><Architecture rows={p.rows} /></Reveal>
        </section>

        <section className="pj-sec">
          <Reveal className="eyebrow">Biggest challenge</Reveal>
          <Reveal as="h2" className="pj-h2 disp">{p.challenge.title}</Reveal>
          <Reveal as="p" className="pj-body">{p.challenge.text}</Reveal>
          <Reveal className="bars">
            {p.challenge.bars.map((b) => (
              <div className="bars-group" key={b.name}>
                <div className="bars-name">{b.name}</div>
                {(p.challenge.series || [
                  { label: 'Normal test photos', key: 'clean', tone: 'is-clean' },
                  { label: 'Backgrounds swapped', key: 'swapped', tone: 'is-swap' }
                ]).map((sr) => (
                  <Bar key={sr.key} label={sr.label} value={b[sr.key]} tone={sr.tone}
                    max={p.challenge.max || 100} unit={p.challenge.unit || '%'} />
                ))}
              </div>
            ))}
          </Reveal>
        </section>

        {p.rag && (
          <section className="pj-sec">
            <Reveal className="eyebrow">{p.rag.eyebrow || 'Retrieval quality'}</Reveal>
            <Reveal as="h2" className="pj-h2 disp">{p.rag.title}</Reveal>
            <Reveal as="p" className="pj-body">{p.rag.text}</Reveal>
            <div className="pj-stats pj-stats-tight">
              {p.rag.stats.map((s) => (
                <Reveal className="pj-stat" key={s.label}>
                  <div className="pj-stat-value disp">{s.value}</div>
                  <div className="pj-stat-label">{s.label}</div>
                  <div className="pj-stat-note mono">{s.note}</div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <section className="pj-sec">
          <Reveal className="eyebrow">Decisions</Reveal>
          <Reveal as="h2" className="pj-h2 disp">What I changed, and why</Reveal>
          <div className="pj-decisions">
            {p.decisions.map((d, i) => (
              <Reveal className="pj-decision" key={d.title}>
                <span className="pj-decision-n mono">{String(i + 1).padStart(2, '0')}</span>
                <h3>{d.title}</h3>
                <p>{d.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="pj-sec">
          <Reveal className="eyebrow">Honest limits</Reveal>
          <ul className="pj-limits">
            {p.limits.map((l) => <Reveal as="li" key={l}>{l}</Reveal>)}
          </ul>
        </section>

        <section className="pj-sec">
          <Reveal className="eyebrow">Built with</Reveal>
          <Reveal as="ul" className="pj-chips">
            {p.stack.map((s) => <li key={s}>{s}</li>)}
          </Reveal>
        </section>

        <div className="pj-end">
          <button type="button" className="pj-btn is-primary" onClick={() => goHome('work')}>← Back to all projects</button>
          <a className="pj-btn" href={p.github} target="_blank" rel="noopener noreferrer">View code ↗</a>
        </div>
      </div>
    </main>
  );
}
