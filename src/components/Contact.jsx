import { useState } from 'react';
import Reveal from './Reveal.jsx';
import SplitHeading from './SplitHeading.jsx';

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
            <input id="name" name="name" type="text" placeholder="Enter your name" autoComplete="name" required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="Enter your email" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="project">Your project</label>
            <textarea id="project" name="message" rows="4" placeholder="Tell me about your project" required />
          </div>
          <input type="checkbox" name="botcheck" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button className="submit-btn" type="submit" data-magnetic disabled={status === 'sending'}>
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
