/*
 * Tiny hash router: "#/project/<slug>" shows a case-study page, anything else shows the home page.
 * (No router library needed.)
 */
export const getProjectSlug = () => {
  const m = window.location.hash.match(/^#\/project\/([\w-]+)/);
  return m ? m[1] : null;
};

export function openProject(slug) {
  window.__homeY = window.scrollY; // so "back" returns to the same spot
  window.location.hash = '#/project/' + slug;
}

// leave a project page; optionally scroll to a home-page section afterwards
export function goHome(sectionId) {
  window.__pendingScroll = sectionId || null;
  const url = window.location.pathname + window.location.search;
  window.history.pushState(null, '', url);
  window.dispatchEvent(new Event('app:route'));
}

export function onRouteChange(cb) {
  window.addEventListener('hashchange', cb);
  window.addEventListener('popstate', cb);
  window.addEventListener('app:route', cb);
  return () => {
    window.removeEventListener('hashchange', cb);
    window.removeEventListener('popstate', cb);
    window.removeEventListener('app:route', cb);
  };
}
