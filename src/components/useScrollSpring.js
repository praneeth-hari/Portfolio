import { useEffect } from 'react';
import { useSpring } from 'framer-motion';

/*
 * useSpring for scroll progress, plus one extra: when the router restores a scroll position it fires
 * SETTLE_EVENT, and every spring snaps to where its scroll progress already is. Without that, the page
 * would visibly animate from "scrolled to the top" to the restored position while it fades in.
 */
export const SETTLE_EVENT = 'app:settle-springs';

export default function useScrollSpring(source, config) {
  const spring = useSpring(source, config);
  useEffect(() => {
    const settle = () => spring.jump(source.get());
    window.addEventListener(SETTLE_EVENT, settle);
    return () => window.removeEventListener(SETTLE_EVENT, settle);
  }, [spring, source]);
  return spring;
}
