import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageSquare, MapPin, X, ChevronUp } from 'lucide-react';

export default function FloatingHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setIsVisible(true);
      else setIsVisible(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const actions = [
    { 
      icon: <Phone size={20} />, 
      label: 'Call Expert', 
      href: 'tel:+919346793364',
      bg: 'var(--emerald)',
      color: '#000'
    },
    { 
      icon: <MessageSquare size={20} />, 
      label: 'WhatsApp', 
      href: 'https://wa.me/919346793364',
      bg: '#25D366',
      color: '#fff'
    },
    { 
      icon: <MapPin size={20} />, 
      label: 'Office Map', 
      href: 'https://maps.google.com',
      bg: 'var(--gold)',
      color: '#000'
    }
  ];

  return (
    <div className="floating-hub-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
      <AnimatePresence>
        {isVisible && (
          <>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '8px' }}
              >
                {actions.map((action, i) => (
                  <motion.a
                    key={i}
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-diamond"
                    style={{ 
                      padding: '12px 20px', 
                      borderRadius: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      textDecoration: 'none',
                      color: 'var(--txt-primary)',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: action.bg, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {action.icon}
                    </div>
                    {action.label}
                  </motion.a>
                ))}
              </motion.div>
            )}

            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="glass-diamond"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold)',
                cursor: 'pointer',
                border: '2px solid var(--gold-border)'
              }}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div key="close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <X size={28} />
                  </motion.div>
                ) : (
                  <motion.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ChevronUp size={24} style={{ marginBottom: '-8px' }} />
                    <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em' }}>HUB</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
