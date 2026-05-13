import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, MessageCircle, Send, Instagram } from 'lucide-react';

const SharePortal = ({ isOpen, onClose, property }) => {
  const [copied, setCopied] = React.useState(false);
  const shareUrl = window.location.href;
  const shareText = `🏡 *${property?.title}*\n📍 ${property?.location}, ${property?.district || ''}\nCode: *${property?.propertyCode || ''}*\n\n🔗 ${shareUrl}\n\n_SnapAdda 📍 Andhra's Leading Property Platform_`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { 
      name: 'WhatsApp', 
      icon: <MessageCircle size={24} />, 
      color: '#25D366', 
      url: `https://wa.me/?text=${encodeURIComponent(shareText)}` 
    },
    { 
      name: 'Telegram', 
      icon: <Send size={24} />, 
      color: '#0088cc', 
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}` 
    },
    { 
      name: 'Instagram', 
      icon: <Instagram size={24} />, 
      color: '#E1306C', 
      url: `https://www.instagram.com/` 
    },
    { 
      name: 'Twitter', 
      icon: <Share2 size={24} />, 
      color: '#1DA1F2', 
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}` 
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)'
        }}
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#0a0a12',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '32px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
            textAlign: 'center'
          }}
        >
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>

          <div style={{ 
            width: '64px', height: '64px', borderRadius: '20px', 
            background: 'var(--gold-dim)', color: 'var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', border: '1px solid var(--gold-border)'
          }}>
            <Share2 size={32} />
          </div>

          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem', color: 'white' }}>Share Property</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '2rem' }}>Invite others to explore this exclusive asset.</p>

          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' 
          }}>
            {shareOptions.map(opt => (
              <a 
                key={opt.name}
                href={opt.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', 
                  textDecoration: 'none', color: 'rgba(255,255,255,0.6)', transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.color = opt.color}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              >
                <div style={{ 
                  width: '50px', height: '50px', borderRadius: '16px', 
                  background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  {opt.icon}
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>{opt.name}</span>
              </a>
            ))}
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px', padding: '10px 10px 10px 20px', display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <span style={{ 
              color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left'
            }}>
              {shareUrl}
            </span>
            <button 
              onClick={copyToClipboard}
              style={{
                background: copied ? 'var(--emerald)' : 'var(--gold)',
                color: copied ? 'white' : 'black',
                border: 'none', borderRadius: '10px', padding: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.3s ease'
              }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SharePortal;
