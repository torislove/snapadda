import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Timer, ExternalLink, ArrowRight } from 'lucide-react';
import { fetchPromotions } from '../services/api';

const FALLBACK = [
  { id: 'f1', type: 'ad', title: 'Grand Villa Launch — Amaravati', subtitle: 'Exclusive presale pricing. CRDA approved.', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', actionText: 'View Details', cardColor: 'dark' },
  { id: 'f2', type: 'ad', title: 'Flat 12% Off Brokerage', subtitle: 'Limited time offer on all luxury 3BHK apartments in Vijayawada.', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', actionText: 'Claim Offer', cardColor: 'gold', countdownActive: true },
  { id: 'f3', type: 'update', title: 'New: Virtual 3D Tours Live', subtitle: 'Tour premium properties from anywhere in the world.', actionText: 'Try Now', cardColor: 'teal' },
  { id: 'f4', type: 'ad', title: 'Premium Farmland in Guntur', subtitle: 'RERA certified agriculture plots starting ₹18L.', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', actionText: 'Explore Now', cardColor: 'green' },
];

const BG = { dark: 'linear-gradient(135deg,rgba(7,7,15,0.92),rgba(18,18,42,0.85))', gold: 'linear-gradient(135deg,rgba(80,50,5,0.88),rgba(25,20,5,0.9))', teal: 'linear-gradient(135deg,rgba(5,50,60,0.88),rgba(5,20,30,0.9))', green: 'linear-gradient(135deg,rgba(5,45,20,0.88),rgba(5,20,10,0.9))' };
const ACCENT = { dark: 'rgba(232,184,75,0.6)', gold: '#e8b84b', teal: '#0fa3b1', green: '#27c97d' };

function getCountdown(date) {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000), h = Math.floor(diff % 86400000 / 3600000), m = Math.floor(diff % 3600000 / 60000);
  return d > 0 ? `${d}d ${h}h left` : `${h}h ${m}m left`;
}

export default function PromoCarousel() {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const timer = useRef(null);
  const touchStart = useRef(0);

  useEffect(() => {
    fetchPromotions()
      .then(data => { const active = (data || []).filter(d => d.isActive !== false); setSlides(active.length > 0 ? active : FALLBACK); })
      .catch(() => setSlides(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const next = useCallback(() => setIndex(i => (i + 1) % Math.max(slides.length, 1)), [slides.length]);
  const prev = () => setIndex(i => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (hovered || slides.length <= 1) return;
    timer.current = setInterval(next, 4500);
    return () => clearInterval(timer.current);
  }, [next, hovered, slides.length]);

  if (loading) return <div style={{ height: '180px', borderRadius: 'var(--r-lg)', background: 'linear-gradient(90deg,var(--midnight-1) 25%,var(--midnight-2) 50%,var(--midnight-1) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.8s infinite' }} />;

  const slide = slides[index] || FALLBACK[0];
  const theme = slide.cardColor || 'dark';
  const accent = ACCENT[theme] || ACCENT.dark;
  const bg = BG[theme] || BG.dark;
  const countdown = getCountdown(slide.expiryDate);

  return (
    <div style={{ position: 'relative', borderRadius: 'var(--r-xl)', overflow: 'hidden', userSelect: 'none' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onTouchStart={e => { touchStart.current = e.touches[0].clientX; }}
      onTouchEnd={e => { const dx = touchStart.current - e.changedTouches[0].clientX; if (Math.abs(dx) > 40) dx > 0 ? next() : prev(); }}>

      <AnimatePresence mode="wait">
        <motion.div key={slide._id || slide.id}
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ position: 'relative', minHeight: '190px', borderRadius: 'var(--r-xl)', border: `1px solid ${accent}30`, overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>

          {slide.image && <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: bg }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to top,rgba(7,7,15,0.8) 0%,transparent 60%)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', zIndex: 5, background: `linear-gradient(90deg,transparent,${accent}80,transparent)` }} />

          <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ padding: '3px 10px', borderRadius: '99px', background: `${accent}18`, border: `1px solid ${accent}40`, fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent }}>
                  {slide.type === 'festival' ? '🎉 Event' : slide.type === 'update' ? '⚡ New Feature' : '🏡 Promotion'}
                </span>
                {countdown && <span style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 10px', borderRadius: '99px', background: 'rgba(240,93,94,0.15)', border: '1px solid rgba(240,93,94,0.3)', fontSize: '0.65rem', fontWeight: 700, color: '#f05d5e' }}><Timer size={10} /> {countdown}</span>}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.1rem,3vw,1.6rem)', fontWeight: 700, color: 'white', marginBottom: '0.4rem', lineHeight: 1.2 }}>{slide.headline || slide.title}</h3>
              {(slide.subheadline || slide.subtitle) && <p style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginBottom: '1.1rem', maxWidth: '500px' }}>{slide.subheadline || slide.subtitle}</p>}
              {(slide.ctaText || slide.actionText) && (
                <a href={slide.ctaUrl || slide.actionUrl || '#'} target={slide.ctaUrl ? '_blank' : '_self'} rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem', background: `linear-gradient(135deg,${accent},${accent}cc)`, color: theme === 'gold' ? '#07070f' : 'white', borderRadius: 'var(--r-full)', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', transition: 'all 0.25s' }}>
                  {slide.ctaText || slide.actionText}
                  {slide.ctaUrl ? <ExternalLink size={12} /> : <ArrowRight size={12} />}
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button onClick={prev} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 20, width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(7,7,15,0.7)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
          <button onClick={next} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 20, width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(7,7,15,0.7)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={16} /></button>
          <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px', zIndex: 20 }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} style={{ width: i === index ? '20px' : '6px', height: '6px', borderRadius: '99px', background: i === index ? accent : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
