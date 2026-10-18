import { useState } from 'react';
import Reveal from './Reveal.jsx';
import SplitHeading from './SplitHeading.jsx';

// Three cards. Edit the 2nd and 3rd when your posts are ready.
// A card with an `href` becomes a link; `image` is optional (file in public/).
const POSTS = [
  {
    date: 'Feb 2023',
    title: '1st Prize at Project Expo, and a finished B.Tech',
    excerpt: 'What the win taught me about pressure, teamwork and defending an idea.',
    image: 'awards/expo-1.jpg',
    href: 'https://www.linkedin.com/posts/kurapati-hari-praneeth-0a6699259_btech-projectexpo-engineering-ugcPost-7481316427795271680-vfcR'
  },
  {
    date: '2023 · Volunteering',
    title: 'Volunteering for the Go Extra Mile app',
    excerpt: 'Explained the app, helped run the event and spoke on stage, and learned to make a product simple for anyone.',
    image: 'awards/volunteer-1.jpg'
    // href: 'paste your LinkedIn post link here once it is posted'
  },
  { date: 'Coming soon', title: 'Next post', excerpt: '' }
];

function CardImage({ src }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return <img className="work-img" src={import.meta.env.BASE_URL + src} alt="" loading="lazy" onError={() => setOk(false)} />;
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
            {p.image && <CardImage src={p.image} />}
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
