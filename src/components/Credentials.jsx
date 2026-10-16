import Reveal from './Reveal.jsx';

const EDUCATION = [
  { years: '2022–2026', title: 'B.Tech, Information Technology', sub: "St. Peter's Engineering College · CGPA 7.0/10" },
  { years: '2020–2022', title: 'Intermediate Education', sub: "Bhavan's Sri Aurobindo Junior College · Science, Mathematics" }
];

const CERTS = [
  { mark: 'AI', title: 'AI Engineer Associate Certificate Course', sub: 'Udemy · Sep 2026' },
  { mark: 'ML', title: 'Machine Learning & AI Foundations Course', sub: 'Data Science Academy · Udemy · Sep 2026' }
];

export default function Credentials() {
  return (
    <section className="wrap" id="credentials">
      <div className="section-head">
        <div>
          <Reveal className="eyebrow">Credentials</Reveal>
          <Reveal as="h2" className="disp">Certifications &amp; Education</Reveal>
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
          <div className="cred-col-label mono">Certifications</div>
          <div className="cert-list">
            {CERTS.map((c) => (
              <div className="cert-card" key={c.title}>
                <div className="cert-mark mono">{c.mark}</div>
                <div className="cert-body">
                  <h3>{c.title}</h3>
                  <div className="cert-sub">{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
