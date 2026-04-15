import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, X, MessageSquare, Send, Activity, FileText, BarChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { aiService } from '../services/aiService';
import { notifyAIInteraction } from '../services/api';
import { useTranslation } from 'react-i18next';

export default function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const { t } = useTranslation();
  const location = useLocation();

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

  const handleGenerate = async (customPrompt = null) => {
    const textToGen = customPrompt || input;
    if (!textToGen.trim()) return;
    
    setLoading(true);
    setResponse('');
    try {
      const pageCtx = location.pathname.includes('/property/') ? `this property (${location.pathname.split('/').pop()})` : 'general real estate in Andhra';
      const result = await aiService.draftResponse(`User asks about ${pageCtx}: ${textToGen}`, 'inquiry');
      setResponse(result);

      // Notify Admin of high-intent activity
      if (textToGen.length > 5 || customPrompt) {
        notifyAIInteraction({
          type: textToGen.toLowerCase().includes('inquiry') || customPrompt?.includes('inquiry') ? 'inquiry' : 'analysis',
          clientContext: pageCtx,
          previewText: result
        });
      }
    } catch (err) {
      setResponse('Drafting error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-init on first open
  useEffect(() => {
    if (isOpen && aiService.status === 'idle') {
      handleInitialize();
    }
  }, [isOpen]);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="ai-concierge-trigger"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(212, 175, 55, 0.3)' }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'fixed', left: '24px', bottom: '24px', zIndex: 9999,
          width: '56px', height: '56px', borderRadius: '18px',
          background: 'rgba(5, 5, 12, 0.9)', border: '1px solid var(--gold-border)',
          backdropFilter: 'blur(10px)', color: 'var(--gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', cursor: 'pointer'
        }}
      >
        <Sparkles size={24} className={loading ? 'animate-spin' : ''} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            style={{
              position: 'fixed', bottom: '96px', left: '24px',
              width: 'calc(100% - 48px)', maxWidth: '380px',
              background: 'rgba(7, 7, 18, 0.98)', border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '24px', padding: '1.5rem', zIndex: 10000,
              boxShadow: '0 40px 100px rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bot size={18} color="var(--gold)" />
                <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#fff', letterSpacing: '0.15em' }}>{t('ai.title', 'SNAPADDA_AI')}</span>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--txt-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {aiService.status !== 'ready' ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ color: 'var(--txt-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                  {loading ? t('ai.loading', 'CALIBRATING INTELLIGENCE...') : t('ai.init', 'Initialize the elite acquisition assistant.')}
                </div>
                <button 
                  onClick={handleInitialize} 
                  disabled={loading}
                  className="btn-3d" 
                  style={{ width: '100%', fontSize: '0.75rem' }}
                >
                  {loading ? `${t('nav.loading', 'LOADING')} ${progress}%` : t('ai.activate', 'ACTIVATE AI CORE')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div 
                  style={{ 
                    minHeight: '100px', maxHeight: '240px', overflowY: 'auto',
                    background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
                    padding: '14px', fontSize: '0.88rem', lineHeight: 1.6,
                    color: response ? '#fff' : 'var(--txt-muted)', border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  {loading ? t('ai.processing', 'Processing context...') : (response || t('ai.placeholder', 'Ask for a property analysis or professional draft...'))}
                </div>

                {/* Quick Actions */}
                {!response && !loading && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button onClick={() => handleGenerate('Draft a professional property inquiry')} style={{ background: 'rgba(155,89,245,0.1)', border: '1px solid rgba(155,89,245,0.2)', color: '#fff', padding: '8px', borderRadius: '10px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <FileText size={12} /> {t('ai.draftInquiry', 'DRAFT INQUIRY')}
                        </button>
                        <button onClick={() => handleGenerate('Give me 3 pros and cons for this area')} style={{ background: 'rgba(16,217,140,0.1)', border: '1px solid rgba(16,217,140,0.2)', color: '#fff', padding: '8px', borderRadius: '10px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <BarChart size={12} /> {t('ai.analysis', 'ANALYSIS')}
                        </button>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    placeholder={t('ai.entry', 'Message assistant...')}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                  />
                  <button 
                    onClick={() => handleGenerate()} disabled={loading}
                    style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--gold)', color: '#000', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
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
