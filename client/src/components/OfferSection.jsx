import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, FileText, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchPromotions, trackPromotionView, trackPromotionClick } from '../services/api';
import MediaViewerContainer from './MediaViewerContainer';

// Import Swiper components & modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const OfferCard = ({ promo, isMobile, onSelect }) => {
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
    if (parts.length !== 2) return url;

    const isContain = promo.mediaSettings?.find((s) => s.url === url)?.objectFit === 'contain';
    const transform = isContain 
      ? `f_auto,q_auto:good,w_${width},c_limit` 
      : `f_auto,q_auto:good,w_${width},c_fill,h_800`;

    return `${parts[0]}/upload/${transform}/${parts[1]}`;
  };

  // Advanced Scaled Dimensions (Precise Vertical 3:4 Aspect Ratio)
  const cardWidth = isMobile ? '12rem' : '18rem';
  const cardHeight = isMobile ? '16rem' : '24rem';

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY, scale: rotateX !== 0 ? 1.05 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={() => {
        if (promo._id) trackPromotionClick(promo._id);
        onSelect(promo);
      }}
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
      {(promo.promotionType === 'video' || promo.videoUrl || (promo.image && promo.image.endsWith('.mp4'))) ? (
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
            style={{ 
              width: '100%', height: '100%', 
              objectFit: promo.mediaSettings?.find((s) => s.url === promo.image)?.objectFit || 'cover', 
              opacity: 0.8 
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #04040a 0%, rgba(4,4,10,0.4) 100%)' }} />
        </div>
      ) : null}

      {/* Media Type Badges */}
      <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 20, display: 'flex', gap: '5px' }}>
        {(promo.promotionType === 'video' || promo.videoUrl || (promo.image && promo.image.endsWith('.mp4'))) && (
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
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="offer-section-v5-wrap" style={{ padding: isMobile ? '0.5rem 0' : '2rem 0', position: 'relative' }}>
      <div style={{ position: 'relative', width: '100%' }}>
        {loading ? (
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'hidden', padding: '1rem 20px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ minWidth: isMobile ? '12rem' : '18rem', height: isMobile ? '16rem' : '24rem', borderRadius: '1.25rem', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : (
          <Swiper
            effect={isMobile ? 'coverflow' : 'slide'}
            grabCursor={true}
            centeredSlides={isMobile}
            slidesPerView={'auto'}
            spaceBetween={isMobile ? 12 : 24}
            coverflowEffect={{
              rotate: 15,
              stretch: 0,
              depth: 80,
              modifier: 1,
              slideShadows: false,
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            modules={[EffectCoverflow, Pagination, Autoplay]}
            style={{ 
              width: '100%', 
              padding: '1rem 0 3.5rem',
              paddingLeft: isMobile ? '0' : 'max(1.5rem, calc((100vw - 1200px) / 2))',
              paddingRight: isMobile ? '0' : '1.5rem',
            }}
          >
            {promotions.map(p => (
              <SwiperSlide key={p._id} style={{ width: 'auto', display: 'flex', justifyContent: 'center' }}>
                <OfferCard promo={p} isMobile={isMobile} onSelect={setSelectedPromo} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <style>{`
        .swiper-pagination {
          bottom: 10px !important;
        }
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.25) !important;
          opacity: 1 !important;
        }
        .swiper-pagination-bullet-active {
          background: var(--gold) !important;
          box-shadow: 0 0 10px rgba(232, 184, 75, 0.6) !important;
        }
      `}</style>

      <MediaViewerContainer
        isOpen={!!selectedPromo}
        onClose={() => setSelectedPromo(null)}
        promotionType={selectedPromo?.promotionType || 'photo'}
        image={selectedPromo?.image || ''}
        videoUrl={selectedPromo?.videoUrl || ''}
        pdfUrl={selectedPromo?.pdfUrl || selectedPromo?.documentUrl || ''}
        title={selectedPromo?.title || ''}
        description={selectedPromo?.description || ''}
        mediaSettings={selectedPromo?.mediaSettings || []}
      />
    </div>
  );
}
