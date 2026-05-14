import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, FileText, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchPromotions, trackPromotionView, trackPromotionClick } from '../services/api';

const OfferCard = ({ promo, isMobile }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  
  // Advanced Interaction Logic
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    if (isMobile || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const intensity = 12;
    const rX = ((mouseY - centerY) / (rect.height / 2)) * -intensity;
    const rY = ((mouseX - centerX) / (rect.width / 2)) * intensity;
    
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

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

  // Advanced Scaled Dimensions (Mini-Hero v6 Scale)
  const cardWidth = isMobile ? '9rem' : '12rem';
  const cardHeight = isMobile ? '14rem' : '18rem';

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY, scale: rotateX !== 0 ? 1.05 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={() => navigate(`/promotion/${promo._id}`)}
      className="elite-promo-card-v6"
      style={{
        perspective: '1200px',
        minWidth: cardWidth,
        width: cardWidth,
        height: cardHeight,
        borderRadius: '1.25rem',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        background: '#04040a',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
        scrollSnapAlign: 'center',
        flexShrink: 0,
        transformStyle: 'preserve-3d',
        transition: 'border-color 0.3s'
      }}
      onPointerEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
      onPointerLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
    >
      {/* Iridescent Border Light Shifting (Advanced Liquid Glass v6) */}
      <div style={{ 
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: `radial-gradient(circle at ${50 + rotateY}% ${50 - rotateX}%, rgba(232,184,75,0.15) 0%, transparent 60%)`,
        opacity: rotateX !== 0 ? 1 : 0.4, transition: 'opacity 0.3s'
      }} />

      {/* Video Background Preview (Auto-play muted) */}
      {(promo.videoUrl || (promo.image && promo.image.endsWith('.mp4'))) ? (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <video 
            src={promo.videoUrl || promo.image} 
            autoPlay muted loop playsInline 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #04040a 0%, rgba(4,4,10,0.3) 100%)' }} />
        </div>
      ) : promo.image ? (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: rotateX !== 0 ? 1.2 : 1.1 }}
            src={getOptimizedImg(promo.image, 600)} 
            alt={promo.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #04040a 0%, rgba(4,4,10,0.4) 100%)' }} />
        </div>
      ) : null}

      {/* Media Type Badges */}
      <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 20, display: 'flex', gap: '5px' }}>
        {(promo.videoUrl || (promo.image && promo.image.endsWith('.mp4'))) && (
          <div style={{ padding: '4px', borderRadius: '8px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Play size={10} fill="white" />
          </div>
        )}
        {(promo.pdfUrl || promo.documentUrl) && (
          <div style={{ padding: '4px', borderRadius: '8px', background: 'rgba(232,184,75,0.2)', backdropFilter: 'blur(8px)', color: 'var(--gold)', border: '1px solid var(--gold)' }}>
            <FileText size={10} />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div style={{ 
        position: 'relative', zIndex: 10, height: '100%', padding: '0.8rem', 
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        transform: 'translateZ(30px)',
        background: (!promo.title && !promo.subtitle) ? 'transparent' : 'linear-gradient(to top, rgba(4,4,10,0.95) 0%, rgba(4,4,10,0.4) 40%, transparent 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: (promo.title || promo.subtitle) ? '8px' : '0' }}>
          <motion.span 
            animate={{ boxShadow: ['0 0 0px var(--gold)', '0 0 10px var(--gold)', '0 0 0px var(--gold)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ 
              fontSize: '0.55rem', fontWeight: 950, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '3px 10px', borderRadius: '40px', background: 'rgba(232,184,75,0.2)', color: 'var(--gold)',
              border: '1px solid var(--gold)', backdropFilter: 'blur(8px)'
            }}
          >
            {promo.type || 'EXCLUSIVE'}
          </motion.span>
        </div>

          <h4 style={{ 
            color: 'white', fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 950, lineHeight: 1.2, marginBottom: '4px', 
            letterSpacing: '-0.02em', textShadow: '0 4px 10px rgba(0,0,0,0.5)' 
          }}>{promo.title}</h4>
        
        {promo.subtitle && (
          <p style={{ 
            color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', lineHeight: 1.4, marginBottom: '0.75rem', 
            fontWeight: 500, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
          }}>
            {promo.subtitle}
          </p>
        )}

        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold)', fontWeight: 800, fontSize: '0.75rem',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          marginTop: (!promo.title && !promo.subtitle) ? 'auto' : '0'
        }}>
          Explore Details <ArrowRight size={14} />
        </div>
      </div>
    </motion.div>
  );
};

export default function OfferSection({ designTokens, promotions: externalPromos }) {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      const progress = (el.scrollLeft / (el.scrollWidth - el.clientWidth)) * 100;
      setScrollProgress(progress);
    };

    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollEl) scrollEl.removeEventListener('scroll', handleScroll);
    };
  }, [loading]);

  useEffect(() => {
    if (externalPromos && externalPromos.length > 0) {
      setPromotions(externalPromos);
      setLoading(false);
      return;
    }
    
    fetchPromotions()
      .then(res => {
        if (res.status === 'success') setPromotions(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [externalPromos]);

  if (!loading && promotions.length === 0) return null;

  return (
    <div className="offer-section-v5-wrap" style={{ padding: isMobile ? '1rem 0' : '2.5rem 0', position: 'relative' }}>
      <div style={{ position: 'relative' }}>
          <div 
          ref={scrollRef}
          className="hide-scrollbar"
          style={{ 
            display: 'flex', 
            gap: isMobile ? '0.75rem' : '1.25rem', 
            overflowX: 'auto', 
            padding: isMobile ? '0.5rem 0 1.5rem' : '1rem 0 2rem',
            scrollSnapType: 'x mandatory',
            paddingLeft: isMobile ? '1rem' : 'max(1.5rem, calc((100vw - 1200px) / 2))',
            paddingRight: '1rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} style={{ minWidth: isMobile ? '9rem' : '12rem', height: isMobile ? '14rem' : '18rem', borderRadius: '1.25rem', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
            ))
          ) : (
            promotions.map(p => <OfferCard key={p._id} promo={p} isMobile={isMobile} />)
          )}
        </div>

        {!isMobile && promotions.length > 3 && (
          <div style={{ position: 'absolute', top: '-60px', right: '0', display: 'flex', gap: '10px' }}>
            <button onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })} style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onPointerEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onPointerLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}><ChevronLeft size={20} /></button>
            <button onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })} style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onPointerEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onPointerLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}><ChevronRight size={20} /></button>
          </div>
        )}
      </div>

      {/* Sophisticated Liquid Progress */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-15px' }}>
        <div style={{ width: '100px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
          <motion.div 
            initial={{ width: '20%' }}
            animate={{ width: `${Math.max(20, scrollProgress)}%` }}
            style={{ height: '100%', background: 'var(--gold)', borderRadius: '10px', boxShadow: '0 0 10px rgba(232,184,75,0.5)' }} 
          />
        </div>
      </div>
    </div>
  );
}
