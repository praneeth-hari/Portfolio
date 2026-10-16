import Reveal from './Reveal.jsx';

const JOBS = [
  {
    dates: 'Jun 2026 – Present',
    role: 'AI Engineering Intern',
    company: 'Breviq AI',
    place: 'Hyderabad, India',
    project: 'Navent AI — Clinical AI Platform',
    stack: ['Python', 'FastAPI', 'LangGraph', 'Pinecone', 'PostgreSQL', 'AWS S3', 'AWS Chime', 'LLMs'],
    points: [
      'Built clinical documentation workflows in Python, FastAPI, and LangGraph that pair RAG retrieval with LLM analysis across 5 healthcare domains.',
      'Migrated clinical-code retrieval from ClinicalBERT to BGE on Pinecone: CDT Recall@10 rose from 61.3% to 84.7% while embedding storage dropped 69%.',
      'Implemented deterministic Python validators for medical, dental, and physical-therapy coding, including 12 medical inference guards, negation checks, dental billing rules, and CMS 8-minute validation.',
      'Built Navent Voice, a real-time CDI query resolution system integrating AWS Chime, Transcribe, Polly, and LLMs with conversational state management and safety guardrails.',
      'Extended the FastAPI backend with event-loop offloading, S3/STS storage, SQS batch processing, PostgreSQL persistence, and document merging.'
    ]
  }
];

export default function Experience() {
  return (
    <section className="wrap" id="experience">
      <div className="section-head">
        <div>
          <Reveal className="eyebrow">Experience</Reveal>
          <Reveal as="h2" className="disp">Where I&rsquo;ve worked</Reveal>
        </div>
      </div>

      <div className="exp-list">
        {JOBS.map((j) => (
          <Reveal key={j.company} className="exp-item">
            <div className="exp-meta">
              <div className="exp-dates mono">{j.dates}</div>
              <div className="exp-company">{j.company}</div>
              <div className="exp-place">{j.place}</div>
            </div>

            <div className="exp-body">
              <h3 className="exp-role disp">{j.role}</h3>
              <div className="exp-project">{j.project}</div>
              <ul className="exp-points">
                {j.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div className="exp-tags">
                {j.stack.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
