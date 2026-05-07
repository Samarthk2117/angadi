import React, { useState, useRef, useEffect } from 'react';

// ─────────────────────────────────────────────────────────
// Direct call to Python FastAPI — no Node proxy in between.
// Python has allow_origins=["*"] CORS so this works fine.
// ─────────────────────────────────────────────────────────
const PYTHON_API = 'http://127.0.0.1:8000/chat';

const getThreadId = () => {
  const k = 'sentinel_thread_id';
  const v = localStorage.getItem(k) || `t_${Date.now()}`;
  localStorage.setItem(k, v);
  return v;
};

const CyberChat = ({ initialScore = 0 }) => {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [score, setScore]         = useState(initialScore);
  const [quiz, setQuiz]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const bottomRef                 = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newHistory = [...messages, { role: 'user', content: text }];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(PYTHON_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history:      newHistory,
          score:        score,
          current_quiz: quiz,
          thread_id:    getThreadId(),
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Python returned ${res.status}: ${errText}`);
      }

      const data = await res.json();
      console.log('[Sentinel AI] response:', data);

      setMessages(prev => [...prev, { role: 'assistant', content: data.message || '(no reply)' }]);
      setScore(data.score ?? score);
      setQuiz(data.quiz ?? null);
    } catch (err) {
      console.error('[Sentinel AI] error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Could not reach AI service.\n\nMake sure the Python server is running:\npython -m uvicorn app.main:app\n\nError: ${err.message}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  /* ── Styles ───────────────────────────────────────────── */
  const s = {
    wrap:    { position:'fixed', bottom:20, right:20, zIndex:9999, fontFamily:'system-ui,sans-serif' },
    fab:     { width:56, height:56, borderRadius:'50%', background:'#6366f1', color:'#fff',
               border:'none', cursor:'pointer', fontSize:22, boxShadow:'0 4px 20px rgba(99,102,241,.5)',
               display:'flex', alignItems:'center', justifyContent:'center', transition:'transform .15s' },
    panel:   { position:'absolute', bottom:68, right:0, width:360, height:520,
               background:'#0f172a', borderRadius:16, display:'flex', flexDirection:'column',
               border:'1px solid #1e293b', boxShadow:'0 24px 64px rgba(0,0,0,.6)', overflow:'hidden' },
    head:    { padding:'14px 18px', background:'#0a101e', borderBottom:'1px solid #1e293b',
               display:'flex', justifyContent:'space-between', alignItems:'center' },
    badge:   { background:'#10b981', color:'#000', fontWeight:700, borderRadius:12,
               padding:'2px 10px', fontSize:11 },
    msgs:    { flex:1, padding:14, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 },
    bubble:  (role) => ({
               alignSelf: role==='user' ? 'flex-end' : 'flex-start',
               background: role==='user' ? '#6366f1' : '#1e293b',
               padding:'9px 13px', borderRadius:12, maxWidth:'82%',
               fontSize:13, lineHeight:1.55, whiteSpace:'pre-wrap', wordBreak:'break-word',
             }),
    empty:   { color:'#475569', fontSize:13, textAlign:'center', margin:'auto', lineHeight:1.8 },
    typing:  { alignSelf:'flex-start', background:'#1e293b', padding:'9px 14px',
               borderRadius:12, fontSize:13, color:'#94a3b8' },
    footer:  { padding:'10px 14px', borderTop:'1px solid #1e293b', display:'flex', gap:8 },
    inp:     { flex:1, background:'#1e293b', border:'1px solid #334155', color:'#fff',
               padding:'8px 12px', borderRadius:8, fontSize:13, outline:'none' },
    send:    { background:'#6366f1', color:'#fff', border:'none', padding:'8px 18px',
               borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer' },
  };

  return (
    <div style={s.wrap}>
      <button style={s.fab} onClick={() => setIsOpen(o => !o)}>
        {isOpen ? '✕' : '🤖'}
      </button>

      {isOpen && (
        <div style={s.panel}>
          {/* Header */}
          <div style={s.head}>
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>Sentinel Assistant</div>
              <div style={{ fontSize:11, color:'#64748b' }}>AI-powered cyber guide</div>
            </div>
            <span style={s.badge}>Score: {score}</span>
          </div>

          {/* Messages */}
          <div style={s.msgs}>
            {messages.length === 0 && (
              <div style={s.empty}>
                👋 Hi! I am your Sentinel AI guide.<br/>
                Ask me about cybersecurity, scams,<br/>or phishing attacks.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={s.bubble(m.role)}>{m.content}</div>
            ))}
            {loading && <div style={s.typing}>● ● ●</div>}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={s.footer}>
            <input
              style={s.inp}
              value={input}
              placeholder="Ask me anything..."
              disabled={loading}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            />
            <button style={{ ...s.send, opacity: loading ? 0.5 : 1 }} onClick={sendMessage} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CyberChat;
