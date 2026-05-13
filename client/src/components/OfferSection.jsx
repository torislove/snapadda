import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap, ArrowRight, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchPromotions, trackPromotionView, trackPromotionClick } from '../services/api';

const OfferCard = ({ promo }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (promo._id) trackPromotionView(promo._id);
  }, [promo._id]);

  const handleAction = (e) => {
    e.preventDefault();
    if (promo._id) trackPromotionClick(promo._id);
    if (promo.actionUrl) {
      if (promo.actionUrl.startsWith('http')) {
        window.open(promo.actionUrl, '_blank');
      } else {
        navigate(promo.actionUrl);
      }
    }
  };

  const getOptimizedImg = (url, width = 600) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    const parts = url.split('/upload/');
    return `${parts[0]}/upload/f_auto,q_auto:good,w_${width},c_fill/${parts[1]}`;
  };

  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleAction}
      className="elite-promo-card"
      style={{
        minWidth: '320px',
        width: '320px',
        height: '450px',
        borderRadius: '32px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        background: '#0a0a15',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        scrollSnapAlign: 'center',
        flexShrink: 0
      }}
    >
      {/* Background with Parallax effect */}
      {promo.image && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <motion.img 
            initial={{ scale: 1.1 }}
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.6 }}
            src={getOptimizedImg(promo.image)} 
            alt={promo.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a15 10%, rgba(10,10,21,0.4) 60%, transparent 100%)' }} />
        </div>
      )}

      {/* Holographic Glow */}
      <div style={{ 
        position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
        background: 'radial-gradient(circle at center, rgba(232,184,75,0.05) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, height: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ 
            fontSize: '0.65rem', fontWeight: 950, letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '6px 14px', borderRadius: '40px', background: 'rgba(232,184,75,0.15)', color: 'var(--gold)',
            border: '1px solid rgba(232,184,75,0.2)', backdropFilter: 'blur(10px)'
          }}>
            {promo.type || 'EXCLUSIVE'}
          </span>
          {promo.countdownActive && (
            <span style={{ 
                color: '#ff4b4b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 900,
                background: 'rgba(255,75,75,0.1)', padding: '6px 14px', borderRadius: '40px', border: '1px solid rgba(255,75,75,0.2)'
            }}>
              <Timer size={12} /> FLASH
            </span>
          )}
        </div>

        <h4 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 950, lineHeight: 1.1, marginBottom: '10px', letterSpacing: '-0.02em' }}>{promo.title}</h4>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem', fontWeight: 500 }}>
          {promo.subtitle}
        </p>

        <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'black', fontWeight: 900, fontSize: '0.85rem',
            background: 'var(--gold)', padding: '12px 24px', borderRadius: '16px', width: 'fit-content',
            boxShadow: '0 10px 25px rgba(232,184,75,0.3)'
        }}>
          {promo.actionText || 'Explore Now'} <ArrowRight size={18} />
        </div>
      </div>

      {/* 3D Liquid Reflection */}
      <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%, rgba(255,255,255,0.05) 100%)',
          pointerEvents: 'none', opacity: 0.4
      }} />
    </motion.div>
  );
};

export default function OfferSection({ designTokens }) {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchPromotions()
      .then(res => {
        if (res.status === 'success') setPromotions(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const amount = dir === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (!loading && promotions.length === 0) return null;

  return (
    <div className="offer-section-wrap animate-on-scroll" style={{ padding: '1rem 0' }}>
      <div style={{ position: 'relative' }}>
        <div 
          ref={scrollRef}
          className="hide-scrollbar"
          style={{ 
            display: 'flex', 
            gap: designTokens?.gap || '16px', 
            overflowX: 'auto', 
            padding: '10px 0 20px',
            scrollSnapType: 'x mandatory',
            paddingLeft: 'max(1rem, calc((100% - 1280px) / 2))',
            paddingRight: '1rem'
          }}
        >
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} style={{ minWidth: '240px', height: '320px', borderRadius: designTokens?.borderRadius || '24px', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
            ))
          ) : (
            promotions.map(p => <OfferCard key={p._id} promo={p} designTokens={designTokens} />)
          )}
        </div>

        {/* Desktop Nav Controls */}
        <div className="desktop-only" style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'space-between', padding: '0 10px', pointerEvents: 'none' }}>
           <button onClick={() => scroll('left')} aria-label="Scroll left" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', pointerEvents: 'auto' }}>
             <ChevronLeft size={20} />
           </button>
           <button onClick={() => scroll('right')} aria-label="Scroll right" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', pointerEvents: 'auto' }}>
             <ChevronRight size={20} />
           </button>
        </div>
      </div>
    </div>
  );
}
