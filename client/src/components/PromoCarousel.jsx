import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Timer, ExternalLink, ArrowRight, Zap } from 'lucide-react';
import { fetchPromotions, trackPromotionView, trackPromotionClick } from '../services/api';

/**
 * Cloudinary Transformation Utility
 * Ensures promotional banners are optimized for speed and device width.
 */
const optimizeImage = (url, width = 800, isContain = false) => {
  if (!url || !url.includes('cloudinary')) return url;
  const transform = isContain ? `q_auto,f_auto,w_${width},c_limit` : `q_auto,f_auto,w_${width},c_fill,h_400`;
  return url.replace('/upload/', `/upload/${transform}/`);
};

const isVideoUrl = (url) => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.quicktime'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext)) || url.includes('video/upload');
};

const FALLBACK = [
  { id: 'f1', type: 'ad', title: 'Elite Gated Community — Vijayawada', subtitle: 'Launch offers live. CRDA & RERA certified.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', actionText: 'Explore Now', cardColor: 'gold' },
  { id: 'f2', type: 'institutional', title: 'Institutional Assets & Bulk Land', subtitle: 'Strategic parcels for educational, medical, and industrial sectors.', image: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=1200&q=80', actionText: 'View Institutional', cardColor: 'dark' },
  { id: 'f3', type: 'ad', title: '0% Registration Charges', subtitle: 'Limited slots available for selected premium plots in Amaravati.', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', actionText: 'Claim Offer', cardColor: 'dark', countdownActive: true, expiryDate: new Date(Date.now() + 86400000 * 2) },
];

const BG = { 
  dark: 'linear-gradient(135deg,rgba(7,7,12,0.95),rgba(15,15,35,0.85))', 
  gold: 'linear-gradient(135deg,rgba(40,30,5,0.95),rgba(10,10,2,0.9))' 
};
const ACCENT = { dark: '#e8b84b', gold: '#f5c842' };

const Slide = memo(({ slide, index, accent, bg, theme, countdown, onNext, onPrev }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    drag="x"
    dragConstraints={{ left: 0, right: 0 }}
    dragElastic={0.2}
    dragMomentum={false}
    onDragEnd={(e, info) => {
      if (info.offset.x > 80) onPrev();
      else if (info.offset.x < -80) onNext();
    }}
    style={{ 
      position: 'relative', minHeight: '220px', borderRadius: '24px', 
      border: `1px solid ${accent}44`, overflow: 'hidden', display: 'flex', alignItems: 'stretch',
      cursor: 'grab', boxShadow: `0 12px 24px ${accent}15`
    }}
    whileTap={{ cursor: 'grabbing' }}
    whileHover={{ scale: 1.02, rotateY: 2, rotateX: 1 }}
    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    viewport={{ once: true }}
    onViewportEnter={() => {
      if (slide._id && !slide.viewTracked) {
        trackPromotionView(slide._id);
        slide.viewTracked = true; // Prevents re-tracking on the same mount
      }
    }}
  >
    {slide.image && (
      <>
        {isVideoUrl(slide.image) ? (
          <video 
            src={slide.image} 
            autoPlay muted loop playsInline 
            style={{ position: 'absolute', inset: 0, zIndex: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }} 
          />
        ) : (
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ 
              position: 'absolute', inset: 0, zIndex: 0, 
              backgroundImage: `url(${optimizeImage(slide.image, 1200, slide.mediaSettings?.find((s) => s.url === slide.image)?.objectFit === 'contain')})`, 
              backgroundSize: slide.mediaSettings?.find((s) => s.url === slide.image)?.objectFit === 'contain' ? 'contain' : 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center', 
              filter: 'brightness(0.7)' 
            }} 
          />
        )}
      </>
    )}
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(225deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 100%)' }} />
    <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05, fontSize: '8rem', fontWeight: 900, color: accent, zIndex: 1, pointerEvents: 'none', userSelect: 'none' }}>EXCLUSIVE</div>

    <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
        <motion.span 
          animate={{ boxShadow: [`0 0 0px ${accent}00`, `0 0 15px ${accent}66`, `0 0 0px ${accent}00`] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ padding: '4px 12px', borderRadius: '40px', background: `${accent}20`, border: `1px solid ${accent}66`, fontSize: '0.6rem', fontWeight: 950, textTransform: 'uppercase', color: accent, display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Zap size={10} fill={accent} /> {slide.type || 'LUXURY SELECTION'}
        </motion.span>
        {countdown && (
          <span style={{ fontSize: '0.65rem', color: '#ff4b4b', fontWeight: 900, background: 'rgba(255,75,75,0.1)', padding: '4px 12px', borderRadius: '40px', border: '1px solid rgba(255,75,75,0.3)', backdropFilter: 'blur(10px)' }}>
            ⏱ {countdown}
          </span>
        )}
      </div>

      <div style={{ maxWidth: '650px' }}>
        <h3 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.8rem)', fontWeight: 950, color: 'white', marginBottom: '0.5rem', lineHeight: 1.1, letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          {slide.title || slide.headline}
        </h3>
        <p style={{ fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, marginBottom: '1.25rem', maxWidth: '500px' }}>
          {slide.subtitle || slide.subheadline}
        </p>
        
        <motion.a 
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
          href={slide.actionUrl || slide.ctaUrl || '#'} 
          onClick={() => {
            if (slide._id) trackPromotionClick(slide._id);
          }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 28px',
            background: `linear-gradient(135deg, ${accent}, #fff)`, color: '#07070f', borderRadius: '40px',
            fontSize: '0.85rem', fontWeight: 900, textDecoration: 'none', boxShadow: `0 8px 16px ${accent}44`
          }}>
          {slide.actionText || slide.ctaText} <ArrowRight size={16} />
        </motion.a>
      </div>
    </div>
  </motion.div>
));

export default function PromoCarousel({ promotions }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timer = useRef(null);

  const slides = (Array.isArray(promotions) && promotions.length > 0) ? promotions : FALLBACK;

  const next = useCallback(() => setIndex(i => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setIndex(i => (i - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (hovered || slides.length <= 1) return;
    timer.current = setInterval(next, 5000);
    return () => clearInterval(timer.current);
  }, [next, hovered, slides.length]);

  const slide = slides[index];
  const theme = slide?.cardColor === 'gold-gradient' ? 'gold' : 'dark';
  const accent = ACCENT[theme] || ACCENT.dark;
  const bg = BG[theme] || BG.dark;

  const getCountdown = (date) => {
    if (!date) return null;
    const diff = new Date(date).getTime() - Date.now();
    if (diff <= 0) return null;
    const d = Math.floor(diff / 86400000), h = Math.floor(diff % 86400000 / 3600000);
    return d > 0 ? `${d}d ${h}h Left` : `${h}h Left`;
  };

  return (
    <div 
      style={{ position: 'relative', borderRadius: '28px', overflow: 'hidden' }}
      onMouseEnter={() => setHovered(true)} 
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence mode="wait">
        <Slide 
          key={slide?._id || index}
          slide={slide} 
          index={index} 
          accent={accent} 
          bg={bg} 
          theme={theme}
          countdown={getCountdown(slide.expiryDate || slide.endDate)}
          onNext={next}
          onPrev={prev}
        />
      </AnimatePresence>

      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', gap: '8px', zIndex: 20 }}>
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setIndex(i)}
              style={{ 
                width: i === index ? '30px' : '8px', height: '8px', borderRadius: '10px',
                background: i === index ? accent : 'rgba(255,255,255,0.2)', border: 'none',
                cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

