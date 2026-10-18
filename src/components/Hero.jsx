import { useRef } from 'react';
import Reveal from './Reveal.jsx';
import FluidText from './FluidText.jsx';
import PaintReveal from './PaintReveal.jsx';

export default function Hero() {
  const ref = useRef(null);

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-stage">
        <Reveal className="hero-title">
          <FluidText />
        </Reveal>
        <Reveal className="hero-portrait" delay={0.15}>
          <PaintReveal
            base={import.meta.env.BASE_URL + 'hero/hero-base.webp'}
            reveal={import.meta.env.BASE_URL + 'hero/hero-reveal.webp'}
            alt="Portrait of Hari Praneeth"
          />
        </Reveal>
      </div>
    </section>
  );
}
