import { useEffect, useState } from 'react';
import { animate, motion } from 'framer-motion';

/*
 * Loading screen: your role words slide across the screen while a pill counts
 * 0 -> 100%, turns into "WELCOME", then swells to fill the screen and the site fades in from black.
 * Change the words here:
 */
const WORDS = ['AI ENGINEER', 'SOFTWARE ENGINEER'];

export default function Preloader({ onDone }) {
  const [n, setN] = useState(0);
  const done = n >= 100;
  const [grow, setGrow] = useState(false); // the pill swells to fill the screen

  useEffect(() => {
    let timer;
    const controls = animate(0, 100, {
      duration: 2.1,
      ease: [0.45, 0.05, 0.25, 1],
      onUpdate: (v) => setN(Math.round(v)),
      onComplete: () => {
        setN(100);
        timer = setTimeout(() => {
          setGrow(true); // after WELCOME, the pill fills the whole screen
          timer = setTimeout(onDone, 750);
        }, 750);
      }
    });
    return () => {
      controls.stop();
      clearTimeout(timer);
    };
  }, [onDone]);

  return (
    <motion.div
      className="preloader"
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={n}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
    >
      <div className="pl2-top">
        <span className="pl2-name">Hari Praneeth</span>
        <span className="pl2-bars" aria-hidden="true"><i /><i /><i /><i /><i /></span>
      </div>

      <div className="pl2-marquee" aria-hidden="true">
        <div className="pl2-track">
          {[0, 1].map((k) => (
            <div className="pl2-set" key={k}>
              {WORDS.map((w) => (
                <span key={w + k}>{w}<i /></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <motion.div
        className={'pl2-pill' + (done ? ' is-done' : '')}
        initial={false}
        animate={
          grow
            ? { width: window.innerWidth, height: window.innerHeight, borderRadius: 0, color: '#121210', boxShadow: '0 0 0 rgba(18,18,16,0)' }
            : { width: done ? 260 : 156, height: done ? 62 : 46, borderRadius: 100 }
        }
        transition={grow ? { duration: 0.75, ease: [0.76, 0, 0.24, 1] } : { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <motion.span className="pl2-fill" aria-hidden="true" initial={false} animate={{ opacity: grow ? 1 : 0 }} transition={{ duration: 0.6 }} />
        <motion.span className="pl2-glow" aria-hidden="true" initial={false} animate={{ opacity: grow ? 0 : 1 }} transition={{ duration: 0.4 }} />
        {done ? (
          <motion.span
            className="pl2-welcome"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
          >
            WELCOME
          </motion.span>
        ) : (
          <span className="pl2-count">
            <span className="pl2-label">LOADING</span>
            <span className="pl2-num">{n}%</span>
            <span className="pl2-block" />
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
