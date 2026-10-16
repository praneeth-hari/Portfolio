import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/* Skill detail dialog for the "AI Engineering" card. */
export default function SkillModal({ open, onClose }) {
  const modalRef = useRef(null);
  const closeRef = useRef(null);
  const opener = useRef(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement; // return focus here on close
    document.documentElement.classList.add('modal-lock');
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !modalRef.current) return;
      const items = Array.from(
        modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('modal-lock');
      opener.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="skill-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="skill-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="skillModalTitle"
            tabIndex={-1}
            ref={modalRef}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <button className="skill-modal-close" ref={closeRef} aria-label="Close" onClick={onClose}>✕</button>
            <h3 className="disp skill-modal-title" id="skillModalTitle">AI Engineering</h3>
            <p className="skill-modal-desc">
              Designing intelligent systems that connect models, retrieval, APIs, and software engineering.
            </p>
            <div className="skill-modal-section">
              <div className="skill-modal-label">Core</div>
              <p className="skill-modal-tags">Python · LLMs · RAG · LangGraph · FastAPI</p>
            </div>
            <div className="skill-modal-section">
              <div className="skill-modal-label">Systems</div>
              <ul className="skill-modal-list has-bullets">
                <li>AI application architecture</li>
                <li>RAG pipelines</li>
                <li>Agent workflows</li>
                <li>Model orchestration</li>
                <li>API integration</li>
                <li>Production-oriented AI systems</li>
              </ul>
            </div>
            <div className="skill-modal-section">
              <div className="skill-modal-label">Related work</div>
              <ul className="skill-modal-list">
                <li>Medical Coding &amp; CDI</li>
                <li>Dental CAC</li>
                <li>Medicinal Plant RAG</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
