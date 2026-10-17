import Reveal from './Reveal.jsx';
import SplitHeading from './SplitHeading.jsx';

const EDUCATION = [
  { years: '2022–2026', title: 'B.Tech, Information Technology', sub: "St. Peter's Engineering College · CGPA 7.0/10" },
  { years: '2020–2022', title: 'Intermediate Education', sub: "Bhavan's Sri Aurobindo Junior College · Science, Mathematics" }
];

const CERTS = [
  { mark: '1st', title: '1st Prize — College Project Expo', sub: "St. Peter's Engineering College" },
  { mark: 'AI', title: 'AI Engineer Associate Certificate Course', sub: 'Udemy · Sep 2026', url: 'https://www.udemy.com/certificate/UC-0d473352-ad8a-4e7a-a42f-340ef7b065b7/' },
  { mark: 'ML', title: 'Machine Learning & AI Foundations Course', sub: 'Data Science Academy · Udemy · Sep 2026', url: 'https://www.udemy.com/certificate/UC-421f46bc-f392-4f4e-b9c3-9c3966ce9469/' }
];

export default function Credentials() {
  return (
    <section className="wrap" id="credentials">
      <div className="section-head">
        <div>
          <Reveal className="eyebrow">Credentials</Reveal>
          <SplitHeading>{"Certifications & Education"}</SplitHeading>
        </div>
      </div>

      <div className="cred-grid">
        <Reveal>
          <div className="cred-col-label mono">Education</div>
          <div className="edu-list">
            {EDUCATION.map((e) => (
              <div className="edu-item" key={e.title}>
                <div className="edu-year mono">{e.years}</div>
                <div>
                  <h3>{e.title}</h3>
                  <div className="edu-sub">{e.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="cred-col-label mono">Certifications &amp; awards</div>
          <div className="cert-list">
            {CERTS.map((c) => {
              const inner = (
                <>
                  <div className="cert-mark mono">{c.mark}</div>
                  <div className="cert-body">
                    <h3>{c.title}</h3>
                    <div className="cert-sub">{c.sub}</div>
                  </div>
                  {c.url && <span className="cert-go mono" aria-hidden="true">View certificate ↗</span>}
                </>
              );
              return c.url ? (
                <a className="cert-card is-link" key={c.title} href={c.url} target="_blank" rel="noopener noreferrer"
                   aria-label={c.title + ' — view certificate (opens in a new tab)'}>{inner}</a>
              ) : (
                <div className="cert-card" key={c.title}>{inner}</div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
