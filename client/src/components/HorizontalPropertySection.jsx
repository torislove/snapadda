import { useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { useNavigate } from 'react-router-dom';

const HorizontalPropertySection = memo(({ title, eyebrow, properties, type, loading, designTokens }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  if (!loading && (!properties || properties.length === 0)) return null;

  const cardW = isMobile ? '260px' : '300px';

  return (
    <section style={{ padding: '0 0 1.25rem', overflow: 'visible' }}>
      <div className="container" style={{ alignItems: 'flex-start' }}>
        {/* ── Section Header ── */}
        <div style={{ display: 'flex', width: '100%', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.75rem' }}>
          <div>
            {eyebrow && (
              <div className="section-eyebrow">
                <span style={{ width: '16px', height: '1.5px', background: 'var(--gold)', display: 'inline-block', opacity: 0.6 }} />
                {eyebrow}
              </div>
            )}
            <h2 className="section-title" style={{ fontSize: 'clamp(1.1rem, 4vw, 1.6rem)' }}>
              {title}
            </h2>
          </div>

          <button
            onClick={() => navigate('/search', { state: { typeFilter: type } })}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '8px 14px', borderRadius: '10px', flexShrink: 0,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem',
              fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.2s', minHeight: '36px',
            }}
            onPointerEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
            onPointerLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
          >
            View All <ArrowRight size={12} />
          </button>
        </div>

        {/* ── Horizontal Scroll Track (Mathematical Edge-to-Edge) ── */}
        <div style={{ position: 'relative', width: isMobile ? '100vw' : '100%', margin: isMobile ? '0 calc((100vw - 92%) / -2)' : '0' }}>
          <motion.div
            drag="x"
            dragConstraints={{ 
              left: -((properties.length * (isMobile ? 270 : 314)) + (properties.length >= 4 ? (isMobile ? 160 : 200) : 0) - window.innerWidth + (isMobile ? 40 : 100)), 
              right: 0 
            }}
            dragElastic={0.08}
            className="hide-scrollbar"
            style={{
              display: 'flex',
              gap: isMobile ? '12px' : '14px',
              paddingBottom: '3rem',
              paddingLeft: isMobile ? 'calc((100vw - 92%) / 2)' : '0',
              paddingRight: '4rem',
              cursor: 'grab',
              willChange: 'transform',
            }}
            whileTap={{ cursor: 'grabbing' }}
          >
            {loading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} style={{
                    minWidth: cardW, maxWidth: cardW, height: isMobile ? '350px' : '380px',
                    background: 'rgba(255,255,255,0.03)', borderRadius: '20px',
                    flexShrink: 0,
                    animation: 'pulse 2s ease-in-out infinite'
                  }} />
                ))
              : properties.map((p, idx) => (
                  <motion.div 
                    key={p._id} 
                    style={{
                      minWidth: cardW, maxWidth: cardW,
                      flexShrink: 0,
                    }}
                  >
                    <PropertyCard {...p} designTokens={designTokens} priority={idx < 2} />
                  </motion.div>
                ))
            }

            {/* View All Card */}
            {!loading && properties.length >= 4 && (
              <motion.div
                onClick={() => navigate('/search', { state: { typeFilter: type } })}
                whileHover={{ background: 'rgba(232,184,75,0.08)', scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  minWidth: isMobile ? '160px' : '200px',
                  height: isMobile ? '350px' : '380px',
                  background: 'rgba(232,184,75,0.04)',
                  border: '1.5px dashed rgba(232,184,75,0.2)',
                  borderRadius: '20px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '12px',
                  cursor: 'pointer', flexShrink: 0,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--gold)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRight size={22} />
                </div>
                <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '0.8rem', textAlign: 'center', padding: '0 1rem' }}>
                  View All
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* ── Scroll indicator dot ── */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'center', gap: '4px', marginTop: '0.5rem' }}>
          {[...Array(Math.min(3, Math.ceil((properties?.length || 0) / 2)))].map((_, i) => (
            <div key={i} style={{ width: i === 0 ? '18px' : '5px', height: '3px', borderRadius: '3px', background: i === 0 ? 'var(--gold)' : 'rgba(255,255,255,0.15)', transition: 'width 0.3s' }} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default HorizontalPropertySection;
