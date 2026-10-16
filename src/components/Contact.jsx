import { useState } from 'react';
import Reveal from './Reveal.jsx';

export default function Contact() {
  const [sent, setSent] = useState(false);

  // NOTE: this form does not send anything yet - connect it to Formspree,
  // Web3Forms, EmailJS or your own API inside onSubmit.
  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="wrap" id="contact">
      <div className="contact-grid">
        <div className="contact-left">
          <Reveal className="eyebrow">Get in touch</Reveal>
          <Reveal as="h2" className="disp">Contact.</Reveal>
          <Reveal as="p">Ready to turn AI knowledge into real-world systems.</Reveal>
          <Reveal className="socials">
            <a href="https://github.com/praneeth-hari" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <span className="social-icon">GH</span>
              <span className="social-tip" aria-hidden="true">GitHub</span>
            </a>
            <a href="https://www.instagram.com/harii_praneeth/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <span className="social-icon">◎</span>
              <span className="social-tip" aria-hidden="true">Instagram</span>
            </a>
            <a href="https://www.linkedin.com/in/kurapati-hari-praneeth-0a6699259/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <span className="social-icon">in</span>
              <span className="social-tip" aria-hidden="true">LinkedIn</span>
            </a>
          </Reveal>
        </div>

        <Reveal as="form" className="form-panel" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" placeholder="Enter your name" required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="Enter your email" required />
          </div>
          <div className="field">
            <label htmlFor="project">Your project</label>
            <textarea id="project" rows="4" placeholder="Tell me about your project" />
          </div>
          <button className="submit-btn" type="submit" aria-live="polite">
            {sent ? 'Sent ✓' : 'Submit'}
          </button>
        </Reveal>
      </div>
    </section>
  );
}
