import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BotAvatar } from 'bot-avatars';

/*
 * "Ask about Hari" chat. Sends the conversation to /api/chat (RAG over
 * api/_knowledge.js with Claude Haiku). The answer streams in word by word and is
 * followed by the sources it used.
 */
const SUGGESTIONS = [
  'What does Hari work on at Breviq AI?',
  'Tell me about his projects',
  'What are his main skills?',
  'How can I contact him?'
];

const HELLO = {
  id: 0,
  role: 'assistant',
  content: "Hi! I'm a bot that answers questions about Hari's work, projects and skills. What would you like to know?"
};

let nextId = 1;

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
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce || busy ? 'auto' : 'smooth' });
  }, [messages, busy, reduce]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
    const onKey = (e) => { if (e.key === 'Escape' && open) { setOpen(false); btnRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const patch = (id, fn) => setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, ...fn(m) } : m)));

  const ask = async (text) => {
    const q = text.trim();
    if (!q || busy) return;
    const userMsg = { id: nextId++, role: 'user', content: q };
    const botId = nextId++;
    const history = [...messages, userMsg];
    // the greeting is UI only and failed answers are not worth sending back
    const payload = history.slice(1).filter((m) => !m.error).map(({ role, content }) => ({ role, content }));
    setMessages([...history, { id: botId, role: 'assistant', content: '', streaming: true }]);
    setInput('');
    setBusy(true);

    const fail = (message) => patch(botId, () => ({ content: message, error: true, streaming: false }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stream: true, messages: payload })
      });
      const ctype = res.headers.get('content-type') || '';

      if (!res.ok || !ctype.includes('ndjson') || !res.body) {
        // plain JSON: an error, or a server that does not stream
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.answer) patch(botId, () => ({ content: data.answer, sources: data.sources, streaming: false }));
        else fail(data.error || 'The bot could not answer right now.');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let sawDone = false;
      const handle = (evt) => {
        if (evt.type === 'delta') {
          patch(botId, (m) => ({ content: m.content + evt.text }));
        } else if (evt.type === 'done') {
          sawDone = true;
          patch(botId, () => ({ streaming: false, sources: evt.sources }));
        } else if (evt.type === 'error') {
          sawDone = true;
          patch(botId, (m) => (m.content ? { streaming: false } : { content: evt.message, error: true, streaming: false }));
        }
      };
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          try { handle(JSON.parse(line)); } catch { /* ignore a broken line */ }
        }
      }
      if (!sawDone) patch(botId, (m) => (m.content ? { streaming: false } : { content: 'The bot could not answer right now.', error: true, streaming: false }));
    } catch {
      patch(botId, (m) => (m.content
        ? { streaming: false }
        : { content: 'Could not reach the bot. Check your connection and try again.', error: true, streaming: false }));
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e) => { e.preventDefault(); ask(input); };
  const showSuggestions = messages.length === 1 && !busy;
  const lastDone = [...messages].reverse().find((m) => m.role === 'assistant' && !m.streaming && m.id !== 0);

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

            {/* the list is not a live region (it would read out every streamed word); the finished answer is announced below */}
            <div className="chat-list" ref={listRef} data-lenis-prevent aria-busy={busy}>
              {messages.map((m) => (
                <div key={m.id} className={'chat-msg ' + m.role + (m.error ? ' error' : '')}>
                  {m.streaming && !m.content ? (
                    <div className="chat-bubble chat-typing" aria-label="Thinking"><i /><i /><i /></div>
                  ) : (
                    <div className="chat-bubble">
                      {m.content}
                      {m.streaming && <span className="chat-caret" aria-hidden="true" />}
                    </div>
                  )}
                  {m.sources?.length > 0 && (
                    <div className="chat-sources">
                      {m.sources.map((src) => <span key={src}>{src}</span>)}
                    </div>
                  )}
                </div>
              ))}
              {showSuggestions && (
                <div className="chat-suggest">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => ask(s)}>{s}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="chat-sr" role="status" aria-live="polite">{lastDone ? lastDone.content : ''}</div>

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
