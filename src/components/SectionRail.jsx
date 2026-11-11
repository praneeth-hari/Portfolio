import { useEffect, useState } from 'react';

// Small fixed marker on the left edge: "03 / Work". Updates as you scroll.
const LIST = [
  ['top', 'Intro'], ['about', 'About'], ['experience', 'Experience'], ['work', 'Work'],
  ['stack', 'Stack'], ['credentials', 'Credentials'], ['thoughts', 'Highlights'], ['contact', 'Contact']
];

export default function SectionRail() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const active = new Array(LIST.length).fill(false);
    const indexById = new Map(LIST.map(([id], k) => [id, k]));
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          const k = indexById.get(en.target.id);
          if (k !== undefined) active[k] = en.isIntersecting;
        }
        let n = -1;
        for (let k = active.length - 1; k >= 0; k--) {
          if (active[k]) { n = k; break; }
        }
        if (n >= 0) setI(n);
      },
      { rootMargin: '0px 0px -50% 0px', threshold: 0 }
    );
    LIST.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return (
    <div className="rail" aria-hidden="true">
      <span className="rail-num" key={i}>{String(i + 1).padStart(2, '0')}</span>
      <span className="rail-name">{LIST[i][1]}</span>
      <span className="rail-total">/ {String(LIST.length).padStart(2, '0')}</span>
    </div>
  );
}
