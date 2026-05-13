import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MessageSquare, Mail, Share2, Copy, Check, 
  Smartphone, ExternalLink, ShieldCheck, Zap, Globe,
  ArrowRight
} from 'lucide-react';
import { 
  generateShareTemplates, 
  generatePropertySnapshot,
  DOMAIN 
} from '../utils/shareUtils';

const ShareControlCenter = ({ isOpen, onClose, property }) => {
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState('en');

  if (!property) return null;

  const templates = useMemo(() => generateShareTemplates(property, lang), [property, lang]);

  const handleCopy = () => {
    navigator.clipboard.writeText(templates.whatsapp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(templates.whatsapp);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleEmail = () => {
    const { subject, body } = templates.email;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSMS = () => {
    const msg = encodeURIComponent(templates.sms);
    window.location.href = `sms:?body=${msg}`;
  };

  const handleNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: templates.whatsapp,
          url: `${DOMAIN}/property/${property.id || property._id}`
        });
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleSnapshot = async () => {
    const dataUrl = await generatePropertySnapshot(property);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `SnapAdda_${property.propertyCode || 'Asset'}.png`;
    link.click();
  };

  // --- PORTAL ENFORCEMENT ---
  // Ensuring the modal is always at document.body level to avoid clipping and containment issues.
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="share-modal-overlay" 
          onClick={onClose}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 1000000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1rem', 
            background: 'rgba(2, 2, 5, 0.9)', 
            backdropFilter: 'blur(16px)' 
          }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-premium"
            style={{ 
              width: '100%', 
              maxWidth: '550px', 
              borderRadius: '32px', 
              overflow: 'hidden', 
              border: '1px solid rgba(232, 184, 75, 0.3)',
              background: 'linear-gradient(165deg, #0a0c14 0%, #050a14 100%)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.9)'
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 950, letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: '4px' }}>SHARE HUB</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', margin: 0 }}>Interactive Sharing System</h2>
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem 2rem' }}>
              {/* Language Selector */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                <button 
                  onClick={() => setLang('en')}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid',
                    borderColor: lang === 'en' ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                    background: lang === 'en' ? 'rgba(232,184,75,0.1)' : 'transparent',
                    color: lang === 'en' ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
                    fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Globe size={14} /> ENGLISH
                </button>
                <button 
                  onClick={() => setLang('te')}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid',
                    borderColor: lang === 'te' ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                    background: lang === 'te' ? 'rgba(232,184,75,0.1)' : 'transparent',
                    color: lang === 'te' ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
                    fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  తెలుగు (TELUGU)
                </button>
              </div>

              {/* Bento Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
                {/* Main WhatsApp Card */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsApp}
                  style={{ 
                    gridColumn: 'span 2',
                    background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(37, 211, 102, 0.05) 100%)',
                    border: '1px solid rgba(37, 211, 102, 0.2)',
                    borderRadius: '24px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#25d366'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#25d366', color: 'white', width: '45px', height: '45px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageSquare size={24} fill="currentColor" />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 900 }}>WhatsApp Premium</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Structured template with emojis</div>
                    </div>
                  </div>
                  <ArrowRight size={20} />
                </motion.button>

                {/* Email Card */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEmail}
                  style={{ 
                    background: 'rgba(245, 57, 123, 0.08)',
                    border: '1px solid rgba(245, 57, 123, 0.15)',
                    borderRadius: '20px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', color: '#f5397b'
                  }}
                >
                  <Mail size={22} />
                  <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Send via Email</div>
                </motion.button>

                {/* SMS Card */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSMS}
                  style={{ 
                    background: 'rgba(34, 217, 224, 0.08)',
                    border: '1px solid rgba(34, 217, 224, 0.15)',
                    borderRadius: '20px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', color: '#22d9e0'
                  }}
                >
                  <Smartphone size={22} />
                  <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Text SMS</div>
                </motion.button>

                {/* Smart Copy */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopy}
                  style={{ 
                    gridColumn: 'span 1',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: copied ? '#10d98c' : 'white'
                  }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{copied ? 'Copied!' : 'Smart Copy'}</div>
                </motion.button>

                {/* Universal Share */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNative}
                  style={{ 
                    background: 'rgba(155, 89, 245, 0.08)',
                    border: '1px solid rgba(155, 89, 245, 0.15)',
                    borderRadius: '20px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#9b59f5'
                  }}
                >
                  <Share2 size={18} />
                  <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>Universal</div>
                </motion.button>

                {/* Visual Snapshot */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSnapshot}
                  style={{ 
                    background: 'rgba(232, 184, 75, 0.12)',
                    border: '1px solid rgba(232, 184, 75, 0.3)',
                    borderRadius: '20px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--gold)'
                  }}
                >
                  <Zap size={18} fill="currentColor" />
                  <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>Elite Snapshot</div>
                </motion.button>
              </div>

              {/* Live Preview */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Content Preview</label>
                <div style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  borderRadius: '20px', 
                  padding: '1.25rem', 
                  fontSize: '0.8rem', 
                  lineHeight: '1.6', 
                  color: 'rgba(255,255,255,0.7)',
                  whiteSpace: 'pre-wrap',
                  border: '1px solid rgba(255,255,255,0.05)',
                  maxHeight: '160px',
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.1 }}>
                    <MessageSquare size={40} />
                  </div>
                  {templates.whatsapp}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '1.25rem 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <ShieldCheck size={14} color="#10d98c" />
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>SNAPADDA INSTITUTIONAL GRADE SHARING</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default ShareControlCenter;
