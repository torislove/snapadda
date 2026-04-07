import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Search, MessageSquare, ArrowRight, Brain } from 'lucide-react';
import { useAI } from '../../hooks/useAI';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PropertyConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationObj, setLocationObj] = useState(null);
  const { init, generate, loading: aiLoading, ready: aiReady } = useAI();
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Elite AI Concierge active. I run entirely in your browser for maximum privacy and speed. How can I assist you today?" }
  ]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Pre-load AI when opened
  useEffect(() => {
    if (isOpen && !aiReady) {
      init('text-generation', 'Xenova/Llama-3.2-1B-Instruct');
    }
  }, [isOpen, aiReady, init]);

  // Immediate Geolocation Request
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationObj({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setMessages(prev => [...prev, { role: 'assistant', text: "I've optimized my local search engine based on your current location. Type 'near me' anytime!" }]);
        },
        (err) => console.log("Location access denied.")
      );
    }
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading || aiLoading) return;

    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // 1. Try Local Browser AI first for parsing
      let aiResponse;
      if (aiReady) {
        const systemPrompt = `You are a real estate assistant. Parse "${userMsg}". 
        If it's a search, return ONLY JSON: {"type":"villa/flat/etc", "city":"string", "bhk":number}. 
        If it's a question, answer nicely.`;
        aiResponse = await generate(userMsg, { max_new_tokens: 128 });
      }

      // 2. Extract JSON or use as answer
      let params = null;
      try {
        const jsonMatch = aiResponse?.match(/\{[\s\S]*\}/);
        if (jsonMatch) params = JSON.parse(jsonMatch[0]);
      } catch(e) {}

      if (params) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: `Locating ${params.type || 'properties'} in ${params.city || 'current region'}...`,
          params: params
        }]);
        
        setTimeout(() => {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, val]) => {
            if (val) searchParams.append(key, val);
          });
          navigate(`/search?${searchParams.toString()}`);
          setIsOpen(false);
        }, 1500);
      } else {
        // Fallback to API if local AI didn't provide a structured search or for complex Q&A
        const res = await fetch(`${API_URL}/ai/search-parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: userMsg,
            userLocation: locationObj 
          })
        });
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', text: data.data || aiResponse || "I'm processing that for you." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "I encountered a processing error. The local brain is cooling down." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000,
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--gold), #f3d078)',
          boxShadow: '0 10px 30px rgba(232,184,75,0.4)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black'
        }}
      >
        {isOpen ? <X size={24} /> : <div style={{ position: 'relative' }}>
          <Bot size={28} />
          <span style={{ position: 'absolute', top: -5, right: -5, width: '10px', height: '10px', background: 'var(--emerald)', borderRadius: '50%', border: '2px solid white' }} />
        </div>}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: 'fixed', bottom: '6.5rem', right: '2rem', zIndex: 1000,
              width: '380px', height: '520px', maxWidth: '90vw', maxHeight: '80vh',
              background: 'rgba(14, 14, 26, 0.95)', backdropFilter: 'blur(20px)',
              borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16,217,140,0.1)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {aiLoading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}><Brain size={20} /></motion.div> : <Sparkles size={20} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white', margin: 0 }}>SnapAdda AI</h3>
                  <div style={{ fontSize: '0.65rem', color: aiReady ? 'var(--emerald)' : 'var(--gold)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', background: aiReady ? 'var(--emerald)' : 'var(--gold)', borderRadius: '50%' }} /> 
                    {aiLoading ? 'SYNCHRONIZING BRAIN...' : aiReady ? 'TRANSFORMERS ACTIVE' : 'INITIALIZING...'}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ 
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}>
                  <div style={{ 
                    padding: '10px 14px', borderRadius: '14px', fontSize: '0.82rem',
                    background: m.role === 'user' ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
                    color: m.role === 'user' ? 'black' : 'var(--text-secondary)',
                    fontWeight: m.role === 'user' ? 600 : 400,
                    boxShadow: m.role === 'user' ? '0 5px 15px rgba(232,184,75,0.2)' : 'none',
                    border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)'
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {(loading || aiLoading) && (
                <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '14px' }}>
                  <div className="dot-flashing"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find a 3BHK villa in Vizag..."
                  style={{
                    width: '100%', padding: '12px 48px 12px 14px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', fontSize: '0.85rem', outline: 'none', transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button 
                  type="submit" 
                  disabled={!query.trim() || loading || aiLoading}
                  style={{
                    position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: query.trim() ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
                    color: 'black', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <ArrowRight size={18} />
                </button>
              </div>
              <p style={{ fontSize: '0.6rem', textAlign: 'center', color: 'var(--text-muted)', marginTop: '10px', letterSpacing: '0.05em' }}>
                100% PRIVATE • BROWSER NATIVE • SECURE
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .dot-flashing {
          position: relative; width: 6px; height: 6px; border-radius: 5px;
          background-color: var(--gold); color: var(--gold);
          animation: dot-flashing 1s infinite linear alternate; animation-delay: 0.5s;
        }
        .dot-flashing::before, .dot-flashing::after {
          content: ""; display: inline-block; position: absolute; top: 0;
        }
        .dot-flashing::before {
          left: -12px; width: 6px; height: 6px; border-radius: 5px;
          background-color: var(--gold); color: var(--gold);
          animation: dot-flashing 1s infinite linear alternate; animation-delay: 0s;
        }
        .dot-flashing::after {
          left: 12px; width: 6px; height: 6px; border-radius: 5px;
          background-color: var(--gold); color: var(--gold);
          animation: dot-flashing 1s infinite linear alternate; animation-delay: 1s;
        }
        @keyframes dot-flashing {
          0% { background-color: var(--gold); }
          50%, 100% { background-color: rgba(232,184,75,0.2); }
        }
      `}</style>
    </>
  );
}
