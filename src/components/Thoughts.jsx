import { useState } from 'react';
import Reveal from './Reveal.jsx';
import SplitHeading from './SplitHeading.jsx';
import OptimizedImage from './OptimizedImage.jsx';

// Highlight cards. Add a new object here when you have another highlight.
// A card with an `href` becomes a link; `image` is optional (file in public/).
const POSTS = [
  {
    date: 'Feb 2023',
    title: '1st Prize at Project Expo',
    excerpt: 'What the win taught me about pressure, teamwork and defending an idea.',
    image: 'awards/expo-1.jpg',
    width: 1036,
    height: 945,
    widths: [640, 1036],
    href: 'https://www.linkedin.com/posts/kurapati-hari-praneeth-0a6699259_btech-projectexpo-engineering-ugcPost-7481316427795271680-vfcR'
  },
  {
    date: '2023 · Volunteering',
    title: 'Volunteering for the Go Extra Mile app',
    excerpt: 'Explained the app, helped run the event and spoke on stage, and learned to make a product simple for anyone.',
    image: 'awards/volunteer-1.jpg',
    width: 580,
    height: 580
    // href: 'paste your LinkedIn post link here once it is posted'
  }
];

function CardImage({ src, width, height, widths }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <OptimizedImage
      className="work-img"
      src={src}
      alt=""
      widths={widths}
      sizes="(max-width: 900px) calc(100vw - 64px), 570px"
      width={width}
      height={height}
      loading="eager"
      fetchPriority="low"
      decoding="async"
      onError={() => setOk(false)}
    />
  );
}

export default function Thoughts() {
  return (
    <section className="wrap" id="thoughts">
      <div className="section-head">
        <div>
          <Reveal className="eyebrow">Moments</Reveal>
          <SplitHeading>{"Highlights"}</SplitHeading>
        </div>
      </div>

      <div className="thought-grid">
        {POSTS.map((p, i) => (
          <Reveal key={i} className={'thought image' + (p.image ? ' has-photo' : '')} delay={i * 0.08}>
            {p.image && <CardImage src={p.image} width={p.width} height={p.height} widths={p.widths} />}
            <div className="thought-body">
              <div className="date">{p.date}</div>
              <h3 className="thought-title disp">{p.title}</h3>
              {p.excerpt && <p className="thought-excerpt">{p.excerpt}</p>}
            </div>
            {p.href && (
              <a className="card-hit" href={p.href} target="_blank" rel="noopener noreferrer" aria-label={p.title + ' on LinkedIn'} />
            )}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
