import { useState } from 'react';
import Reveal from './Reveal.jsx';
import SplitHeading from './SplitHeading.jsx';

// Real brand icons (simple-icons paths, 24x24).
const ICONS = {
  github: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
};
const Icon = ({ name }) => (
  <svg className="social-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={ICONS[name]} fill="currentColor" /></svg>
);

// Web3Forms access key: public by design (it only lets people email YOU from this form).
const ACCESS_KEY = '6fe68283-7477-4173-a8b0-1ea9c3ab055b';

export default function Contact() {
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get('botcheck')) return; // hidden spam trap: bots tick it, people never see it
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: 'New message from your portfolio',
          from_name: 'Portfolio contact form',
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message')
        })
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setStatus('sent');
        form.reset();
      } else {
        setStatus('error');
        setError(json.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setError('Could not send. Check your connection and try again.');
    }
  };

  return (
    <section className="wrap" id="contact">
      <div className="contact-grid">
        <div className="contact-left">
          <Reveal className="eyebrow">Get in touch</Reveal>
          <SplitHeading>{"Contact."}</SplitHeading>
          <Reveal as="p">Ready to turn AI knowledge into real-world systems.</Reveal>
          <Reveal className="socials">
            <a href="https://github.com/praneeth-hari" target="_blank" rel="noopener noreferrer" aria-label="GitHub" data-b="gh">
              <span className="social-icon"><Icon name="github" /></span>
              <span className="social-tip" aria-hidden="true">GitHub</span>
            </a>
            <a href="https://www.instagram.com/harii_praneeth/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" data-b="ig">
              <span className="social-icon"><Icon name="instagram" /></span>
              <span className="social-tip" aria-hidden="true">Instagram</span>
            </a>
            <a href="https://www.linkedin.com/in/kurapati-hari-praneeth-0a6699259/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" data-b="li">
              <span className="social-icon"><Icon name="linkedin" /></span>
              <span className="social-tip" aria-hidden="true">LinkedIn</span>
            </a>
          </Reveal>
        </div>

        <Reveal as="form" className="form-panel" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" placeholder="Enter your name" autoComplete="name" required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="Enter your email" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="project">About the role</label>
            <textarea id="project" name="message" rows="4" placeholder="Tell me about the role you are hiring for" required />
          </div>
          <input type="checkbox" name="botcheck" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button className="submit-btn" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent ✓' : 'Submit'}
          </button>
          <div className={'form-status' + (status === 'error' ? ' is-error' : '')} role="status" aria-live="polite">
            {status === 'sent' && "Thanks! Your message was sent. I'll get back to you soon."}
            {status === 'error' && error}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
