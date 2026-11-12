import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/*
 * A small pill that follows the pointer and says what a click will do. Any element can opt in with
 * data-cursor="View case study"; moving off it hides the pill again. It is purely decorative
 * (aria-hidden, pointer-events: none) and never replaces the real cursor.
 * Only for real mice: no touch screens, and nothing for visitors who prefer reduced motion.
 */
const OFFSET = 16; // px from the pointer
const FOLLOW = 0.22; // how quickly the pill catches up (lower = floatier)

export default function CursorLabel() {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    if (reduce) return undefined;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    let tx = 0; // where the pointer is
    let ty = 0;
    let x = 0; // where the pill is
    let y = 0;
    let raf = 0;
    let shown = false;

    const draw = () => {
      raf = 0;
      x += (tx - x) * FOLLOW;
      y += (ty - y) * FOLLOW;
      el.style.transform = `translate3d(${x + OFFSET}px, ${y + OFFSET}px, 0)`;
      if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) raf = requestAnimationFrame(draw);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const hide = () => {
      shown = false;
      el.classList.remove('is-on');
    };
    const show = (label) => {
      if (el.textContent !== label) el.textContent = label;
      if (!shown) {
        shown = true;
        x = tx; // appear at the pointer instead of flying in from the last spot
        y = ty;
        el.classList.add('is-on');
      }
    };
    // decide from whatever is under the pointer (also used after scrolling, when no pointer event fires)
    const evaluate = (target) => {
      const host = target instanceof Element ? target.closest('[data-cursor]') : null;
      const label = host && host.getAttribute('data-cursor');
      if (label) show(label);
      else if (shown) hide();
    };

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      evaluate(e.target);
      if (shown) kick();
    };
    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf || !shown) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        evaluate(document.elementFromPoint(tx, ty));
      });
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    document.documentElement.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);
    window.addEventListener('app:route', hide);
    window.addEventListener('hashchange', hide);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('scroll', onScroll, { capture: true });
      document.documentElement.removeEventListener('pointerleave', hide);
      window.removeEventListener('blur', hide);
      window.removeEventListener('app:route', hide);
      window.removeEventListener('hashchange', hide);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
    };
  }, [reduce]);

  return <div className="cursor-label" ref={ref} aria-hidden="true" />;
}
