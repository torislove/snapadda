import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, ArrowRight, Trash2, ChartBar, Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatSnapAddaPrice } from '../utils/priceUtils';

export default function ComparisonHud() {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleToggle = (e) => {
      const property = e.detail;
      setItems(prev => {
        const exists = prev.find(p => p.id === property.id);
        if (exists) {
          return prev.filter(p => p.id !== property.id);
        }
        if (prev.length >= 4) return prev; // Max 4
        setIsOpen(true);
        return [...prev, property];
      });
    };

    window.addEventListener('toggle-compare', handleToggle);
    return () => window.removeEventListener('toggle-compare', handleToggle);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="comparison-hud-root" style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000, width: '100%', maxWidth: '800px', pointerEvents: 'none' }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            style={{ 
              pointerEvents: 'auto',
              background: 'rgba(10, 10, 20, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(232, 184, 75, 0.3)',
              borderRadius: '24px',
              padding: '1rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(232,184,75,0.1)',
              margin: '0 1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: 'var(--gold)', color: 'var(--midnight)', padding: '4px', borderRadius: '6px' }}>
                  <SlidersHorizontal size={14} />
                </div>
                <span style={{ color: 'white', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                  {t('comparison.title', 'COMPARE ASSETS')} <span style={{ color: 'var(--gold)' }}>({items.length}/4)</span>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                 <button onClick={() => setItems([])} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                   <Trash2 size={16} />
                 </button>
                 <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                   <X size={20} />
                 </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: '12px', marginBottom: '1rem' }}>
              {items.map(p => (
                <motion.div 
                  layout
                  key={p.id} 
                  style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <img src={p.image} alt={p.title} style={{ width: '100%', height: '60px', objectFit: 'cover' }} />
                  <div style={{ padding: '8px' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--gold)', fontWeight: 700 }}>{formatSnapAddaPrice(p.price)}</div>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {p.isFeatured && <TrendingUp size={10} color="var(--gold)" />}
                        {p.isVerified && <Star size={10} color="var(--emerald)" />}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setItems(items.filter(i => i.id !== p.id))}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
                  >
                    <X size={10} />
                  </button>
                </motion.div>
              ))}
              {items.length < 4 && (
                <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                  <ChartBar size={24} />
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                const ids = items.map(i => i.id).join(',');
                navigate(`/compare?ids=${ids}`);
                setIsOpen(false);
              }}
              className="btn-3d"
              style={{ 
                width: '100%', 
                padding: '0.8rem', 
                background: 'var(--gold)', 
                color: 'var(--midnight)', 
                fontWeight: 900, 
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {t('comparison.launch', 'LAUNCH COMPARISON RADAR')} <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && items.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          style={{ 
            pointerEvents: 'auto',
            background: 'var(--gold)',
            color: 'var(--midnight)',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(232,184,75,0.4)',
            border: 'none',
            cursor: 'pointer',
            position: 'absolute',
            bottom: '20px',
            right: '20px'
          }}
        >
          <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--rose)', color: 'white', fontSize: '0.65rem', fontWeight: 900, width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-deep)' }}>
            {items.length}
          </div>
          <SlidersHorizontal size={20} />
        </motion.button>
      )}
    </div>
  );
}
