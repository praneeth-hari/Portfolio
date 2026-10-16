import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BotAvatar } from 'bot-avatars';

/*
 * "Ask about Hari" chat. Sends the conversation to /api/chat (RAG over
 * api/_knowledge.js with Gemini) and shows the answer plus its sources.
 */
const SUGGESTIONS = [
  'What does Hari work on at Breviq AI?',
  'Tell me about his projects',
  'What are his main skills?',
  'How can I contact him?'
];

const HELLO = {
  role: 'assistant',
  content: "Hi! I'm a bot that answers questions about Hari's work, projects and skills. What would you like to know?"
};

export default function ChatBot() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([HELLO]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }, [messages, busy, reduce]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
    const onKey = (e) => { if (e.key === 'Escape' && open) { setOpen(false); btnRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const ask = async (text) => {
    const q = text.trim();
    if (!q || busy) return;
    const next = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // the greeting is UI only, so it is not sent
        body: JSON.stringify({ messages: next.slice(1).map(({ role, content }) => ({ role, content })) })
      });
      const data = await res.json().catch(() => ({}));
      setMessages((m) => [...m, res.ok
        ? { role: 'assistant', content: data.answer, sources: data.sources }
        : { role: 'assistant', content: data.error || 'The bot could not answer right now.', error: true }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Could not reach the bot. Check your connection and try again.', error: true }]);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e) => { e.preventDefault(); ask(input); };
  const showSuggestions = messages.length === 1 && !busy;

  return (
    <>
      <button
        ref={btnRef}
        className={'chat-fab' + (open ? ' is-open' : '')}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? 'Close chat' : 'Ask about Hari'}
      >
        <span className="chat-fab-ghost" aria-hidden="true"><BotAvatar type="ghost" shading="plastic" size={26} state={busy ? 'working' : 'default'} /></span>
        <span className="chat-fab-label">{open ? 'Close' : 'Ask about Hari'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.section
            id="chat-panel"
            className="chat-panel"
            role="dialog"
            aria-label="Ask about Hari"
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <header className="chat-head">
              <span className="chat-head-ghost" aria-hidden="true"><BotAvatar type="ghost" shading="plastic" size={44} state={busy ? 'working' : 'default'} /></span>
              <div className="chat-head-text">
                <div className="chat-title">Ask about Hari</div>
                <div className="chat-sub mono">RAG · answers from his resume &amp; projects</div>
              </div>
              <button className="chat-x" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
            </header>

            <div className="chat-list" ref={listRef} data-lenis-prevent aria-live="polite">
              {messages.map((m, i) => (
                <div key={i} className={'chat-msg ' + m.role + (m.error ? ' error' : '')}>
                  <div className="chat-bubble">{m.content}</div>
                  {m.sources?.length > 0 && (
                    <div className="chat-sources">
                      {m.sources.map((s) => <span key={s}>{s}</span>)}
                    </div>
                  )}
                </div>
              ))}
              {busy && (
                <div className="chat-msg assistant">
                  <div className="chat-bubble chat-typing" aria-label="Thinking"><i /><i /><i /></div>
                </div>
              )}
              {showSuggestions && (
                <div className="chat-suggest">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => ask(s)}>{s}</button>
                  ))}
                </div>
              )}
            </div>

            <form className="chat-form" onSubmit={onSubmit}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about his work…"
                maxLength={500}
                aria-label="Your question"
              />
              <button type="submit" disabled={!input.trim() || busy} aria-label="Send">→</button>
            </form>
            <div className="chat-note">AI answers can be wrong. For anything important, email Hari.</div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
