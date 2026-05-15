import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, MessageCircle, Send, Instagram, Mail, Twitter } from 'lucide-react';

const SharePortal = ({ isOpen, onClose, property }) => {
  const [copied, setCopied] = React.useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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
      name: 'Email', 
      icon: <Mail size={24} />, 
      color: '#EA4335', 
      url: `mailto:?subject=${encodeURIComponent(property?.title)}&body=${encodeURIComponent(shareText)}` 
    },
    { 
      name: 'Twitter', 
      icon: <Twitter size={24} />, 
      color: '#1DA1F2', 
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}` 
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200000 }}>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,10,0.85)', backdropFilter: 'blur(15px)' }}
          />

          {/* Liquid Modal */}
          <motion.div 
            initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'absolute',
              bottom: isMobile ? 0 : 'auto',
              top: isMobile ? 'auto' : '50%',
              left: isMobile ? 0 : '50%',
              transform: isMobile ? 'none' : 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: isMobile ? '100%' : '380px',
              height: isMobile ? '70vh' : 'auto',
              background: 'linear-gradient(165deg, #10121a 0%, #050508 100%)',
              borderRadius: isMobile ? '32px 32px 0 0' : '32px',
              border: '1px solid rgba(255,255,255,0.12)',
              borderBottom: isMobile ? 'none' : '1px solid rgba(255,255,255,0.12)',
              padding: isMobile ? '2rem 1.5rem' : '2.5rem 2rem',
              boxShadow: '0 -20px 80px rgba(0,0,0,0.8)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Grabber for Mobile */}
            {isMobile && (
              <div style={{ width: '40px', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', marginBottom: '1.5rem' }} />
            )}

            <button 
              onClick={onClose}
              style={{ 
                position: 'absolute', 
                top: '1.25rem', 
                right: '1.25rem', 
                background: 'rgba(255,255,255,0.08)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: 'white', 
                cursor: 'pointer', 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ 
              width: '80px', height: '80px', borderRadius: '24px', 
              background: 'rgba(232,184,75,0.1)', color: 'var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.5rem', border: '1px solid rgba(232,184,75,0.2)'
            }}>
              <Share2 size={40} />
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 950, color: 'white', marginBottom: '0.5rem', textAlign: 'center' }}>Share Center</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', marginBottom: '2.5rem', textAlign: 'center', maxWidth: '300px' }}>
              Spread the word about this premium asset.
            </p>

            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', width: '100%', marginBottom: '3rem' 
            }}>
              {shareOptions.map(opt => (
                <a 
                  key={opt.name}
                  href={opt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', 
                    textDecoration: 'none', color: 'rgba(255,255,255,0.6)', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = opt.color; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ 
                    width: '64px', height: '64px', borderRadius: '20px', 
                    background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                    color: 'white'
                  }}>
                    {React.cloneElement(opt.icon, { size: 28, color: opt.color })}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{opt.name}</span>
                </a>
              ))}
            </div>

            <div style={{ width: '100%', marginTop: 'auto' }}>
                <div style={{ 
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px', padding: '12px 12px 12px 24px', display: 'flex', alignItems: 'center', gap: '15px'
                }}>
                  <span style={{ 
                    color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left', fontWeight: 600
                  }}>
                    {shareUrl}
                  </span>
                  <button 
                    onClick={copyToClipboard}
                    style={{
                      background: copied ? '#27c97d' : 'var(--gold)',
                      color: copied ? 'white' : 'black',
                      border: 'none', borderRadius: '14px', padding: '12px 20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      cursor: 'pointer', transition: 'all 0.3s ease', fontWeight: 900, fontSize: '0.8rem'
                    }}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'COPIED' : 'COPY'}
                  </button>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SharePortal;
