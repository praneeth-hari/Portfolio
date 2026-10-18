import { useEffect, useState } from 'react';

// Small fixed marker on the left edge: "03 / Work". Updates as you scroll.
const LIST = [
  ['top', 'Intro'], ['about', 'About'], ['experience', 'Experience'], ['work', 'Work'],
  ['stack', 'Stack'], ['credentials', 'Credentials'], ['thoughts', 'Highlights'], ['contact', 'Contact']
];

export default function SectionRail() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const pick = () => {
      let n = 0;
      LIST.forEach(([id], k) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) n = k;
      });
      setI(n);
    };
    window.addEventListener('scroll', pick, { passive: true });
    pick();
    return () => window.removeEventListener('scroll', pick);
  }, []);
  return (
    <div className="rail" aria-hidden="true">
      <span className="rail-num" key={i}>{String(i + 1).padStart(2, '0')}</span>
      <span className="rail-name">{LIST[i][1]}</span>
      <span className="rail-total">/ {String(LIST.length).padStart(2, '0')}</span>
    </div>
  );
}
