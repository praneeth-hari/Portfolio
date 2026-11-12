import { useSyncExternalStore } from 'react';

/*
 * Light / dark theme. The choice lives on <html data-theme="light|dark">, which the CSS tokens key off.
 * The inline script in index.html sets it before first paint (saved choice, else the OS setting), so
 * there is no flash of the wrong theme. Every storage access is guarded: it can throw in private
 * windows or with blocked site data.
 */
const KEY = 'hp-theme';
export const THEME_EVENT = 'app:theme';
const META_COLOR = { light: '#f0eee6', dark: '#11100e' };

export const getTheme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

function apply(theme) {
  document.documentElement.dataset.theme = theme;
  // the browser UI (mobile address bar etc.) follows the page
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    m.setAttribute('content', META_COLOR[theme]);
    m.removeAttribute('media');
  });
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function setTheme(theme) {
  if (theme === getTheme()) return;
  try {
    window.localStorage.setItem(KEY, theme);
  } catch {
    /* the choice just will not persist */
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof document.startViewTransition === 'function' && !reduced) {
    // cross-fade the whole page (see 31-view-transitions.css)
    document.startViewTransition(() => apply(theme));
  } else {
    apply(theme);
  }
}

export const toggleTheme = () => setTheme(getTheme() === 'dark' ? 'light' : 'dark');

const subscribe = (cb) => {
  window.addEventListener(THEME_EVENT, cb);
  return () => window.removeEventListener(THEME_EVENT, cb);
};

/** The current theme, as a React hook (re-renders when it changes). */
export const useTheme = () => useSyncExternalStore(subscribe, getTheme, () => 'light');
