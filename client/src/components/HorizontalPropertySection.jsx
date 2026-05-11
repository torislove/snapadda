import { useRef, memo } from 'react';
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
    <section style={{ padding: '0 0 1.25rem', overflow: 'hidden' }}>
      <div className="container">
        {/* ── Section Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.75rem' }}>
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

        {/* ── Horizontal Scroll Track ── */}
        <div
          ref={scrollRef}
          className="hide-scrollbar"
          style={{
            display: 'flex',
            gap: isMobile ? '10px' : '14px',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            paddingLeft: isMobile ? '1px' : '0',
            paddingRight: isMobile ? '24px' : '4rem',
            scrollSnapType: 'x mandatory',
            willChange: 'transform',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {loading
            ? [...Array(4)].map((_, i) => (
                <div key={i} style={{
                  minWidth: cardW, maxWidth: cardW, height: isMobile ? '320px' : '380px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '20px',
                  flexShrink: 0, scrollSnapAlign: 'start',
                  animation: 'pulse 2s ease-in-out infinite'
                }} />
              ))
            : properties.map((p) => (
                <div key={p._id} style={{
                  minWidth: cardW, maxWidth: cardW,
                  scrollSnapAlign: 'start', flexShrink: 0,
                }}>
                  <PropertyCard {...p} designTokens={designTokens} />
                </div>
              ))
          }

          {/* View All Card */}
          {!loading && properties.length >= 4 && (
            <div
              onClick={() => navigate('/search', { state: { typeFilter: type } })}
              style={{
                minWidth: isMobile ? '160px' : '200px',
                height: isMobile ? '320px' : '380px',
                background: 'rgba(232,184,75,0.04)',
                border: '1.5px dashed rgba(232,184,75,0.2)',
                borderRadius: '20px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '12px',
                cursor: 'pointer', flexShrink: 0, scrollSnapAlign: 'start',
                transition: 'all 0.2s',
              }}
              onPointerEnter={e => { e.currentTarget.style.background = 'rgba(232,184,75,0.08)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onPointerLeave={e => { e.currentTarget.style.background = 'rgba(232,184,75,0.04)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--gold)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={22} />
              </div>
              <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '0.8rem', textAlign: 'center', padding: '0 1rem' }}>
                View All
              </span>
            </div>
          )}
        </div>

        {/* ── Scroll indicator dot ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '0.5rem' }}>
          {[...Array(Math.min(3, Math.ceil((properties?.length || 0) / 2)))].map((_, i) => (
            <div key={i} style={{ width: i === 0 ? '18px' : '5px', height: '3px', borderRadius: '3px', background: i === 0 ? 'var(--gold)' : 'rgba(255,255,255,0.15)', transition: 'width 0.3s' }} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default HorizontalPropertySection;
