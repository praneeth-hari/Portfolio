/*
 * Helpers for animating between the home page and a case study with the View Transitions API.
 * Browsers without it (and users who prefer reduced motion) simply get the plain page swap.
 */
export const canViewTransition = () =>
  typeof document !== 'undefined' &&
  typeof document.startViewTransition === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The element the user came from / returns to shares this name with the case-study cover (.pj-bg),
// which is what makes the image morph between the two pages.
export const SHARED_NAME = 'project-cover';

// The cover image of a Work card, but only if it is actually on screen (otherwise a plain fade is nicer
// than an image flying in from outside the viewport).
export function visibleCardImage(slug) {
  const img = document.querySelector(`.work-card[data-study="${slug}"] .work-img`);
  if (!img) return null;
  const r = img.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  return cx > 0 && cx < window.innerWidth && cy > 0 && cy < window.innerHeight ? img : null;
}
