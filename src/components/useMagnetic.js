import { useEffect } from 'react';

/*
 * Magnetic buttons: any element with data-magnetic leans toward the cursor
 * when it comes close, then springs back. Mouse only; off for reduced motion.
 */
export default function useMagnetic() {
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    const RANGE = 70;   // px around the button where the pull starts
    const PULL = 0.32;  // how far it follows the cursor
    // keep the buttons' own hover transitions working alongside the pull
    const KEEP = ', background-color .25s, color .25s, border-color .25s, box-shadow .25s, gap .25s';
    const EASE_IN = 'transform .18s ease-out' + KEEP;
    const EASE_OUT = 'transform .5s cubic-bezier(.2,.7,.2,1)' + KEEP;
    let raf = 0;
    let mx = -9999, my = -9999;

    const tick = () => {
      raf = 0;
      document.querySelectorAll('[data-magnetic]').forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = mx - cx, dy = my - cy;
        const near = Math.abs(dx) < r.width / 2 + RANGE && Math.abs(dy) < r.height / 2 + RANGE;
        if (near) {
          el.style.transition = EASE_IN;
          el.style.transform = `translate(${dx * PULL}px, ${dy * PULL}px)`;
          el.classList.add('is-magnet');
        } else if (el.classList.contains('is-magnet')) {
          el.style.transition = EASE_OUT;
          el.style.transform = '';
          el.classList.remove('is-magnet');
        }
      });
    };
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
      document.querySelectorAll('[data-magnetic]').forEach((el) => { el.style.transform = ''; });
    };
  }, []);
}
