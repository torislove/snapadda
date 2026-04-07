import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, RefreshCcw, CheckCircle, FileCode, Zap, Sparkles, Brain
} from 'lucide-react';
import { useAI } from '../../hooks/useAI';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  type?: 'analysis' | 'patch' | 'error' | 'success';
  data?: any;
}

const AIDeveloper: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { init, generate, loading: aiLoading, ready: aiReady } = useAI();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      text: "Elite AI Developer active. I am now running locally in your browser for maximum security and speed. What are we building today?",
      type: 'analysis'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Lazy Load AI
  useEffect(() => {
    if (!aiReady && !aiLoading) {
      init('text-generation', 'Xenova/Llama-3.2-1B-Instruct');
    }
  }, [aiReady, aiLoading, init]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading || aiLoading) return;

    const userQuery = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setLoading(true);

    try {
      // 1. Browser AI logic parsing
      let aiAnalysis = "";
      if (aiReady) {
        aiAnalysis = await generate(`System Context: Senior Fullstack Dev. Task: ${userQuery}. Suggest a short technical optimization approach.`);
      }

      // 2. Call server for actual codebase analysis (Phi-3)
      const res = await fetch(`${API_URL}/ai/analyze-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery })
      });
      const data = await res.json();

      if (data.status === 'success') {
        const fullResponse = aiAnalysis ? `${aiAnalysis}\n\n--- DETAILED REPOSITORY ANALYSIS (PHI-3) ---\n${data.data}` : data.data;
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: fullResponse,
          type: 'analysis'
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: aiAnalysis || "Analysis failed. Ensure the AI server is reachable.",
          type: 'error'
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "Connection error. AI Developer offline.",
        type: 'error'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
          ✦ BROWSER-NATIVE AI ARCHITECTURE
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--gold), #ffda7c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.3rem', fontFamily: 'var(--font-heading)' }}>
          Elite AI Developer
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Real-time codebase analysis, optimization, and automated patching via Transformers.js.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Chat Console */}
        <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', border: '1px solid rgba(232,184,75,0.1)' }}>
          <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(232,184,75,0.05)', borderBottom: '1px solid rgba(232,184,75,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', left: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Terminal size={16} color="var(--gold)" />
              <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--gold)' }}>DEV_CONSOLE_v1.0.TRANSFORMERS</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: aiReady ? 'var(--emerald)' : 'var(--gold)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AnimatePresence mode="wait">
                  {aiLoading ? (
                    <motion.div
                      key="loading"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    >
                      <Brain size={14} />
                    </motion.div>
                  ) : aiReady ? (
                    <motion.div
                      key="ready"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Sparkles size={14} />
                    </motion.div>
                  ) : (
                    <span style={{ width: '6px', height: '6px', background: 'var(--gold)', borderRadius: '50%' }} />
                  )}
                </AnimatePresence>
              </div>
              <span>{aiLoading ? 'SYNCHRONIZING BRAIN...' : aiReady ? 'TRANSFORMERS ACTIVE' : 'INITIALIZING...'}</span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ 
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%',
                    width: m.role === 'assistant' ? '100%' : 'auto'
                  }}
                >
                  <div style={{ 
                    padding: '12px 16px', borderRadius: '12px', fontSize: '0.88rem',
                    background: m.role === 'user' ? 'rgba(232,184,75,0.1)' : 'rgba(255,255,255,0.02)',
                    border: m.role === 'user' ? '1px solid rgba(232,184,75,0.2)' : '1px solid rgba(255,255,255,0.05)',
                    color: m.role === 'user' ? 'var(--gold)' : 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: m.role === 'assistant' ? 'var(--font-mono)' : 'inherit',
                    lineHeight: 1.6
                  }}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {(loading || aiLoading) && (
              <div style={{ display: 'flex', gap: '8px', padding: '10px' }}>
                <RefreshCcw size={16} className="animate-spin" color="var(--gold)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 600 }}>{aiLoading ? 'Loading AI Model...' : 'Analyzing Codebase...'}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleAnalyze} style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: 'Analyze the property search logic' or 'Optimize image loading'..."
                style={{
                  width: '100%', padding: '14px 100px 14px 16px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s',
                  fontFamily: 'var(--font-mono)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button 
                type="submit" 
                disabled={!query.trim() || loading || aiLoading}
                className="btn btn-gold"
                style={{
                  position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                  padding: '8px 16px', fontSize: '0.75rem', borderRadius: '8px'
                }}
              >
                <Zap size={14} style={{ marginRight: '6px' }} /> Analyze
              </button>
            </div>
          </form>
        </div>

        {/* Quick Actions / Info */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '1rem', letterSpacing: '0.05em' }}>SYSTEM STATUS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={14} color="var(--emerald)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Transformers.js active</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={14} color="var(--emerald)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Phi-3 (Web-Node) Sync</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={14} color="var(--gold)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Auto-Optimization ON</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCode size={14} color="var(--gold)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>File Sync Authorized</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', flex: 1 }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.05em' }}>RECENT PATCHES</h3>
            <div style={{ opacity: 0.5, textAlign: 'center', paddingTop: '2rem' }}>
              <FileCode size={30} style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.7rem' }}>No patches applied in this session.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDeveloper;
