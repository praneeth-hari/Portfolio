import { useEffect, useState } from 'react';

/*
 * Loads the case-study page on demand. It is kept in a module variable (instead of React.lazy) so the
 * router can load it *before* a view transition starts: the transition then lands on the real page
 * instead of a loading placeholder.
 */
let Page = null;

export const loadProjectPage = () =>
  Page
    ? Promise.resolve(Page)
    : import('./ProjectPage.jsx').then((mod) => {
        Page = mod.default;
        return Page;
      });

export default function ProjectRoute({ slug }) {
  const [, rerender] = useState(0);

  useEffect(() => {
    if (Page) return undefined;
    let live = true;
    loadProjectPage().then(() => live && rerender((n) => n + 1));
    return () => {
      live = false;
    };
  }, []);

  if (!Page) return <main id="main-content" tabIndex={-1} className="pj" aria-busy="true" />;
  return <Page slug={slug} />;
}
