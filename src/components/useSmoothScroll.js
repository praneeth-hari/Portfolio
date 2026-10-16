import { useEffect } from 'react';
import Lenis from 'lenis';

/*
 * Butter-smooth page scrolling (eased, slightly inertial), like the Salix template.
 * Skipped for reduced-motion users. Exposed on window.__lenis so the nav can use it.
 * `paused` stops scrolling (e.g. while the preloader is on screen).
 */
export default function useSmoothScroll(paused) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 4), // ease-out quart
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2
    });
    window.__lenis = lenis;
    document.documentElement.classList.add('lenis');
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
      document.documentElement.classList.remove('lenis');
    };
  }, []);

  useEffect(() => {
    const l = window.__lenis;
    if (!l) return;
    paused ? l.stop() : l.start();
  }, [paused]);
}
