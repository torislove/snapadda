import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, X, MessageSquare, Send, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService';

/**
 * SnapAdda AI Concierge
 * Floating assistant for elite property drafting and inquiries.
 * Offloaded to Web Worker for buttery smooth performance.
 */

export default function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const handleInitialize = async () => {
    setLoading(true);
    try {
      await aiService.init((p) => setProgress(Math.floor(p * 100)));
    } catch (err) {
      console.error('AI Boot Failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const text = await aiService.draftResponse(input);
      setResponse(text);
    } catch (err) {
      setResponse('Drafting error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger - Positioned at bottom-left to avoid conflict with Calculator (bottom-right) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="ai-concierge-trigger"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, backgroundColor: 'var(--gold)' }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open AI Assistant"
        style={{
          position: 'fixed',
          left: '24px',
          bottom: '24px',
          zIndex: 9999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(212, 175, 55, 0.15)',
          border: '1px solid var(--gold-border)',
          backdropFilter: 'blur(10px)',
          color: 'var(--gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          cursor: 'pointer'
        }}
      >
        <Sparkles size={24} className={loading ? 'animate-spin' : ''} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            style={{
              position: 'fixed',
              bottom: '96px',
              left: '24px',
              width: 'calc(100% - 48px)',
              maxWidth: '360px',
              background: 'rgba(5, 5, 12, 0.98)',
              border: '1px solid var(--gold-border)',
              borderRadius: '24px',
              padding: '1.5rem',
              zIndex: 10000,
              boxShadow: '0 40px 100px rgba(0,0,0,0.9)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bot size={20} color="var(--gold)" />
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', letterSpacing: '0.1em' }}>AI_CONCIERGE</span>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--txt-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {aiService.status !== 'ready' ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ color: 'var(--txt-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                  Initialize advanced property drafting engine.
                </div>
                <button 
                  onClick={handleInitialize} 
                  disabled={loading}
                  className="btn-3d" 
                  style={{ width: '100%', fontSize: '0.75rem', padding: '12px' }}
                >
                  {loading ? `BOOTING ${progress}%` : 'ACTIVATE ENGINE'}
                  <Activity size={14} style={{ marginLeft: '8px' }} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div 
                  style={{ 
                    minHeight: '120px', 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '0.85rem',
                    color: response ? '#fff' : 'var(--txt-muted)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  {loading ? 'Thinking...' : (response || 'Ask me to draft a professional property inquiry or description...')}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter context..."
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    style={{
                      width: '42px', height: '42px', borderRadius: '10px',
                      background: 'var(--gold)', color: '#000', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
