import { useEffect } from 'react';
import Lenis from 'lenis';
import { getDeviceProfile } from '../device.js';

/*
 * Butter-smooth page scrolling (eased, slightly inertial), like the Salix template.
 * Skipped for reduced-motion, touch/narrow mobile viewports, and constrained/low-end
 * hardware so native scrolling handles them directly. Exposed on window.__lenis.
 */
export default function useSmoothScroll(paused) {
  useEffect(() => {
    const { tier, isTouchOrSmall, reducedMotion } = getDeviceProfile();
    if (reducedMotion || isTouchOrSmall || tier !== 'capable') return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 4), // ease-out quart
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2
    });
    window.__lenis = lenis;
    document.documentElement.classList.add('lenis');

    let raf = 0;
    let alive = true;
    const loop = (t) => {
      raf = 0;
      if (!alive) return;
      lenis.raf(t);
      if (lenis.animate.isRunning || lenis.isScrolling === 'smooth') {
        raf = requestAnimationFrame(loop);
      }
    };
    const kick = () => {
      if (!alive || raf) return;
      lenis.time = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const unsubVirtual = lenis.on('virtual-scroll', kick);
    const origScrollTo = lenis.scrollTo.bind(lenis);
    lenis.scrollTo = (...args) => {
      const res = origScrollTo(...args);
      if (lenis.animate.isRunning || lenis.isScrolling === 'smooth') kick();
      return res;
    };

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      unsubVirtual?.();
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
