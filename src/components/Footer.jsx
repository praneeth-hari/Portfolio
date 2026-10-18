import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Reveal from './Reveal.jsx';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion';

const EMAIL = 'kurapatiharipraneeth2004@gmail.com';

function useISTClock() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
      .format(new Date()).toUpperCase();
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const ROLES = ['AI Engineer', 'Software Engineer', 'Generative AI Engineer'];

function RoleRotator() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  // measure every role once so the chip can shrink and grow to fit the word that is showing
  const measure = useRef([]);
  const [widths, setWidths] = useState(null);
  useLayoutEffect(() => {
    const read = () => setWidths(measure.current.map((el) => (el ? Math.ceil(el.getBoundingClientRect().width) : 0)));
    read();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(read);
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % ROLES.length), 2400);
    return () => clearInterval(id);
  }, [reduce]);
  return (
    <motion.span
      className="role-rot"
      aria-live="off"
      animate={widths ? { width: widths[i] } : undefined}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={ROLES[i]}
          className="role-word"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {ROLES[i]}
        </motion.span>
      </AnimatePresence>
      <span className="role-measure" aria-hidden="true">
        {ROLES.map((r, k) => (
          <span key={r} className="role-word" ref={(el) => { measure.current[k] = el; }}>{r}</span>
        ))}
      </span>
    </motion.span>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    try { await navigator.clipboard.writeText(EMAIL); } catch { /* clipboard blocked: mailto still works */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button type="button" className="email email-copy" onClick={onClick} aria-label={'Copy email address ' + EMAIL}>
      <span className="email-text">{EMAIL}</span>
      <span className={'copy-tag' + (copied ? ' is-done' : '')} aria-live="polite">{copied ? 'Copied ✓' : 'Copy'}</span>
    </button>
  );
}

export default function Footer() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const time = useISTClock();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : -110, 0]);
  const radius = useTransform(scrollYProgress, [0, 1], [reduce ? 40 : 110, 40]);

  return (
    <motion.div ref={ref} className="footer-band footer-curtain" style={{ borderTopLeftRadius: radius, borderTopRightRadius: radius }}>
      <motion.div className="wrap" style={{ y }}>
        <div className="footer-top">
          <div className="status-strip">
            <span className="status-dot" aria-hidden="true" />
            <span>Open to roles:</span>
            <RoleRotator />
            <span className="status-sep" aria-hidden="true">·</span>
            <span className="status-time">{time} IST</span>
          </div>
          <a className="cv-foot" href="./Hari_Praneeth_Resume.pdf" download="Hari_Praneeth_Resume.pdf">Download CV <span aria-hidden="true">↓</span></a>
        </div>

        <Reveal as="h2" className="disp footer-headline">PRANEETH.</Reveal>

        <div className="footer-cols">
          <div>
            <h3>Quick links</h3>
            <div className="chip-row">
              <a className="chip" href="#top">Home</a>
              <a className="chip" href="#about">About</a>
              <a className="chip" href="#experience">Experience</a>
              <a className="chip" href="#work">Work</a>
              <a className="chip" href="#contact">Contact</a>
            </div>
          </div>
          <div>
            <h3>Contact</h3>
            <CopyEmail />
          </div>
          <div>
            <h3>Elsewhere</h3>
            <div className="chip-row">
              <a className="chip" href="https://github.com/praneeth-hari" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a className="chip" href="https://www.instagram.com/harii_praneeth/" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a className="chip" href="https://www.linkedin.com/in/kurapati-hari-praneeth-0a6699259/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Hari Praneeth. All rights reserved.</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </motion.div>
    </motion.div>
  );
}
