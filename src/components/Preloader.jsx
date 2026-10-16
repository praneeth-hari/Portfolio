import { useEffect, useState } from 'react';
import { animate, motion } from 'framer-motion';

/* 0 -> 100% counter with a line that draws across; slides up when done. */
export default function Preloader({ onDone }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    let timer;
    const controls = animate(0, 100, {
      duration: 2,
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (v) => setN(Math.round(v)),
      onComplete: () => {
        setN(100);
        timer = setTimeout(onDone, 350);
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
      exit={{ y: '-100%', transition: { duration: 0.9, ease: [0.65, 0, 0.2, 1] } }}
    >
      <div className="pl-top">
        <span className="pl-name disp">Hari Praneeth</span>
        <span className="pl-role mono">AI Engineer · Portfolio 2026</span>
      </div>
      <motion.div
        className="pl-line"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.1, ease: [0.6, 0, 0.15, 1] }}
      />
      <div className="pl-bottom">
        <div className="pl-percent">
          <span>{n}</span>
          <span className="sign">%</span>
        </div>
      </div>
    </motion.div>
  );
}
