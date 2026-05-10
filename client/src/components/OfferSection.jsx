import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap, ArrowRight, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchPromotions, trackPromotionView, trackPromotionClick } from '../services/api';

const OfferCard = ({ promo, designTokens }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  
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

  const getOptimizedImg = (url, width = designTokens?.imageWidth || 400, height = designTokens?.imageHeight || 530) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    return `${parts[0]}/upload/f_auto,q_auto:good,w_${width},h_${height},c_fill/${parts[1]}`;
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="offer-card-vertical"
      onClick={handleAction}
      style={{
        minWidth: '240px',
        width: '240px',
        height: '320px',
        borderRadius: designTokens?.borderRadius || '24px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        background: '#0a0a12',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
        scrollSnapAlign: 'start',
        flexShrink: 0
      }}
    >
        {/* Background Media */}
      {promo.image && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img 
            src={getOptimizedImg(promo.image)} 
            alt={promo.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />
        </div>
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, height: '100%', padding: designTokens?.padding || '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ 
            fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: '40px', background: 'rgba(255,255,255,0.1)', color: 'var(--gold)',
            border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'
          }}>
            {promo.type || 'OFFER'}
          </span>
          {promo.countdownActive && (
            <span style={{ color: '#ff4b4b', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.65rem', fontWeight: 800 }}>
              <Timer size={10} /> LIMITED
            </span>
          )}
        </div>

        <h4 style={{ color: 'white', fontSize: '1.15rem', fontWeight: 900, lineHeight: 1.15, marginBottom: '6px' }}>{promo.title}</h4>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', lineHeight: 1.4, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {promo.subtitle}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', fontWeight: 800, fontSize: '0.75rem' }}>
          {promo.actionText || 'Learn More'} <ArrowRight size={14} />
        </div>
      </div>

      {/* Interaction Layer */}
      <div className="card-shine" />
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
