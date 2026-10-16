import Reveal from './Reveal.jsx';

const EMAIL = 'kurapatiharipraneeth2004@gmail.com';

export default function Footer() {
  return (
    <div className="footer-band">
      <div className="wrap">
        <Reveal as="h2" className="disp footer-headline">PRANEETH.</Reveal>

        <div className="footer-cols">
          <div>
            <h3>Quick links</h3>
            <div className="chip-row">
              <a className="chip" href="#top">Home</a>
              <a className="chip" href="#about">About</a>
              <a className="chip" href="#experience">Experience</a>
              <a className="chip" href="#work">Work</a>
              <a className="chip" href="#contact">Contact</a>
            </div>
          </div>
          <div>
            <h3>Contact</h3>
            <a className="email" href={'mailto:' + EMAIL}>{EMAIL}</a>
          </div>
          <div>
            <h3>Elsewhere</h3>
            <div className="chip-row">
              <a className="chip" href="https://github.com/praneeth-hari" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a className="chip" href="https://www.instagram.com/harii_praneeth/" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a className="chip" href="https://www.linkedin.com/in/kurapati-hari-praneeth-0a6699259/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Hari Praneeth. All rights reserved.</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </div>
  );
}
