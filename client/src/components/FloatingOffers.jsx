import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ArrowRight, MessageCircle } from 'lucide-react';
import { fetchPromotions, trackPromotionView, trackPromotionClick } from '../services/api';

const FloatingOffers = () => {
  const [promos, setPromos] = useState([]);
  const [activePromo, setActivePromo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchPromotions('segment=floating').then(res => {
      const active = (res?.data || []).filter(p => p.isActive);
      if (active.length > 0) {
        setPromos(active);
        setActivePromo(active[0]);
        // Show after 3s delay for "Elite" entrance
        setTimeout(() => {
          setIsVisible(true);
          // Track View
          if (active[0]._id) trackPromotionView(active[0]._id);
        }, 3000);
      }
    });
  }, []);

  if (!activePromo || !isVisible) return null;

  return (
    <>
      <div style={{ position: 'fixed', bottom: '100px', left: '20px', zIndex: 5000 }}>
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: -20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '30px',
                background: 'linear-gradient(135deg, #e8b84b, #b9933a)',
                color: '#07070f', fontWeight: 800, fontSize: '0.75rem',
                border: 'none', boxShadow: '0 8px 24px rgba(232, 184, 75, 0.4)',
                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em'
              }}
            >
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%', background: '#ff3b3b',
                boxShadow: '0 0 8px #ff3b3b', animation: 'pulse 1.5s infinite'
              }} />
              <Zap size={14} />
              Special Offer
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20, originX: 0, originY: 1 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="glass-premium"
              style={{
                width: '300px', borderRadius: '24px', padding: '1.5rem',
                border: '1px solid rgba(232, 184, 75, 0.3)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                background: 'rgba(7,7,15,0.95)', backdropFilter: 'blur(15px)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ 
                  padding: '4px 10px', borderRadius: '8px', background: 'rgba(232,184,75,0.15)', 
                  color: '#e8b84b', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em'
                }}>
                  Exclusive Deal
                </span>
                <button 
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.2 }}>
                {activePromo.title}
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {activePromo.subtitle}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a 
                  href={activePromo.actionUrl || '#'} 
                  onClick={() => {
                    setIsOpen(false);
                    if (activePromo._id) trackPromotionClick(activePromo._id);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '12px', borderRadius: '14px', background: '#e8b84b', color: '#07070f',
                    textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem'
                  }}
                >
                  {activePromo.actionText || 'Claim Now'} <ArrowRight size={14} />
                </a>
                <button 
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '12px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, fontSize: '0.85rem'
                  }}
                >
                  <MessageCircle size={14} /> WhatsApp Agent
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


    </>
  );
};

export default FloatingOffers;
