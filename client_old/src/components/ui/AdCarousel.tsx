import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Clock, Zap } from 'lucide-react';
import { fetchPromotions } from '../../services/api';

export interface PromotionalCard {
  id: string; _id?: string;
  type?: 'festival' | 'ad' | 'update';
  title: string; subtitle?: string;
  image?: string; actionText?: string; actionUrl?: string;
  countdownActive?: boolean; cardColor?: string;
  size?: '1x1' | '2x1' | '2x2';
  isActive?: boolean; displayPriority?: number;
  theme?: string; headline?: string; subheadline?: string;
  ctaText?: string; ctaUrl?: string; targetLocation?: string;
  startDate?: string; expiryDate?: string;
}

const STATIC_FALLBACKS: PromotionalCard[] = [
  {
    id: 'f1', type: 'ad',
    title: 'Grand Villa Launch — Amaravati',
    subtitle: 'Exclusive presale pricing. CRDA approved. Book your plot today.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    actionText: 'View Details', cardColor: 'dark',
  },
  {
    id: 'f2', type: 'ad',
    title: 'Flat 12% Off Brokerage',
    subtitle: 'Limited time offer on all luxury 3BHK apartments in Vijayawada.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    actionText: 'Claim Offer', cardColor: 'gold', countdownActive: true,
  },
  {
    id: 'f3', type: 'update',
    title: 'New: Virtual 3D Tours Live',
    subtitle: 'Tour premium properties from anywhere in the world.',
    actionText: 'Try Now', cardColor: 'teal',
  },
  {
    id: 'f4', type: 'ad',
    title: 'Premium Farmland in Guntur',
    subtitle: 'RERA certified agriculture plots starting ₹18L. Vastu compliant.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    actionText: 'Explore Now', cardColor: 'green',
  },
];

const CARD_GRADIENTS: Record<string, string> = {
  dark:  'linear-gradient(135deg, rgba(7,7,15,0.92), rgba(18,18,42,0.85))',
  gold:  'linear-gradient(135deg, rgba(80,50,5,0.88), rgba(25,20,5,0.9))',
  teal:  'linear-gradient(135deg, rgba(5,50,60,0.88), rgba(5,20,30,0.9))',
  green: 'linear-gradient(135deg, rgba(5,45,20,0.88), rgba(5,20,10,0.9))',
  red:   'linear-gradient(135deg, rgba(60,10,10,0.88), rgba(25,5,5,0.9))',
  violet:'linear-gradient(135deg, rgba(40,10,70,0.88), rgba(15,5,30,0.9))',
  'Deep Midnight Glass (Default)': 'linear-gradient(135deg, rgba(7,7,15,0.92), rgba(18,18,42,0.85))',
};

const getCountdown = (expiry?: string) => {
  if (!expiry) return null;
  const diff = new Date(expiry).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return days > 0 ? `${days}d ${hrs}h left` : `${hrs}h ${mins}m left`;
};

export const AdCarousel: React.FC = () => {
  const [cards, setCards] = useState<PromotionalCard[]>([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    fetchPromotions()
      .then(data => {
        const live = (data || []).filter((p: PromotionalCard) => p.isActive !== false);
        setCards(live.length > 0 ? live : STATIC_FALLBACKS);
      })
      .catch(() => setCards(STATIC_FALLBACKS))
      .finally(() => setLoading(false));
  }, []);

  const advance = useCallback(() => {
    setCurrent(c => (c + 1) % Math.max(cards.length, 1));
  }, [cards.length]);

  const prev = () => setCurrent(c => (c - 1 + cards.length) % cards.length);
  const next = () => { advance(); };

  useEffect(() => {
    if (paused || cards.length <= 1) return;
    intervalRef.current = setInterval(advance, 6000); // Slower, more premium feel
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [advance, paused, cards.length]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
  };

  if (loading) {
    return (
      <div className="skeleton-glow h-[220px] rounded-3xl" />
    );
  }

  const card = cards[current] || STATIC_FALLBACKS[0];
  const theme = card.cardColor || card.theme || 'dark';
  const bgGradient = CARD_GRADIENTS[theme] || CARD_GRADIENTS['dark'];
  const countdown = getCountdown(card.expiryDate);

  return (
    <div
      className="promo-stripe-container relative rounded-[32px] overflow-hidden group shadow-[0_40px_80px_rgba(0,0,0,0.4)] border border-white/5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={card._id || card.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative min-h-[220px] flex items-stretch"
        >
          {/* Background image with subtle zoom */}
          {card.image && (
            <motion.div 
              style={{
                position:'absolute', inset:0, zIndex:0,
                backgroundImage:`url(${card.image})`,
                backgroundSize:'cover', backgroundPosition:'center',
              }}
              animate={{ scale: paused ? 1.05 : 1 }}
              transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            />
          )}

          {/* Master Overlay */}
          <div className="absolute inset-0 z-1 bg-gradient-to-r from-midnight via-midnight/90 to-transparent" style={{ background: bgGradient }} />
          <div className="absolute inset-0 z-2 opacity-50 bg-[radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.1),transparent)]" />

          {/* Content Wrapper */}
          <div className="relative z-10 w-full px-8 py-10 sm:px-12 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <motion.div 
                initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}
                className="flex items-center gap-3"
              >
                <div className="p-1 px-3 rounded-lg bg-gold/10 border border-gold/20 flex items-center gap-2">
                   <Zap size={12} className="text-gold" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-gold">Featured Launch</span>
                </div>
                {countdown && (
                  <div className="p-1 px-3 rounded-lg bg-rose/10 border border-rose/20 flex items-center gap-2">
                     <Clock size={12} className="text-rose" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-rose">{countdown}</span>
                  </div>
                )}
              </motion.div>
              
              <div className="hidden sm:flex gap-1">
                 {cards.map((_, i) => (
                   <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-gold' : 'w-2 bg-white/10'}`} />
                 ))}
              </div>
            </div>

            <div className="mt-6">
              <motion.h2 
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
                className="text-4xl sm:text-5xl font-black font-serif text-white mb-4 leading-tight tracking-tight max-w-2xl"
              >
                {card.headline || card.title}
              </motion.h2>
              <motion.p 
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
                className="text-lg text-white/50 mb-8 max-w-xl leading-relaxed"
              >
                {card.subheadline || card.subtitle}
              </motion.p>
              
              <motion.div 
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
                className="flex items-center gap-6"
              >
                <a
                  href={card.ctaUrl || card.actionUrl || '#'}
                  className="group py-4 px-10 bg-gold rounded-2xl flex items-center gap-3 text-midnight font-black tracking-wider shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:bg-white hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all"
                >
                  {card.ctaText || card.actionText || 'EXPLORE NOW'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
                
                {cards.length > 1 && (
                  <div className="flex gap-4">
                    <button onClick={prev} className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={next} className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Glossy Reflection overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent z-20 mix-blend-overlay" />
    </div>
  );
};
