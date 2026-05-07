import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { useNavigate } from 'react-router-dom';

const HorizontalPropertySection = ({ title, eyebrow, properties, type, loading }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!loading && (!properties || properties.length === 0)) return null;

  return (
    <section className="horizontal-section-wrap" style={{ padding: '4rem 0', overflow: 'hidden' }}>
      <div className="container">
        <div className="section-head" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="section-eyebrow" style={{ color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>
              {eyebrow}
            </div>
            <h2 className="section-title" style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', margin: 0 }}>
              {title}
            </h2>
          </div>
          
          <div className="desktop-only" style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => scroll('left')}
              className="scroll-nav-btn glass-premium"
              style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="scroll-nav-btn glass-premium"
              style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          style={{ 
            display: 'flex', 
            gap: window.innerWidth <= 600 ? '12px' : '24px', 
            overflowX: 'auto', 
            paddingBottom: '2.5rem',
            scrollSnapType: 'x mandatory',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            paddingLeft: window.innerWidth <= 600 ? '15px' : '0',
            paddingRight: window.innerWidth <= 600 ? '30px' : '4rem',
            position: 'relative'
          }}
          className="hide-scrollbar holographic-carousel"
        >
          {loading ? (
             [...Array(4)].map((_, i) => (
                <div key={i} style={{ minWidth: window.innerWidth <= 600 ? '280px' : '320px', height: '450px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', animate: 'pulse 2s infinite' }} />
             ))
          ) : (
            properties.map((p) => (
              <div key={p._id} style={{ minWidth: window.innerWidth <= 600 ? '290px' : '320px', maxWidth: window.innerWidth <= 600 ? '290px' : '320px', scrollSnapAlign: 'start' }}>
                <PropertyCard {...p} />
              </div>
            ))
          )}

          {!loading && properties.length >= 5 && (
            <div 
              onClick={() => navigate('/search', { state: { typeFilter: type } })}
              style={{ 
                minWidth: window.innerWidth <= 600 ? '200px' : '240px', 
                height: window.innerWidth <= 600 ? '420px' : '450px', 
                background: 'rgba(212,175,55,0.05)', 
                border: '2px dashed rgba(212,175,55,0.2)', 
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                scrollSnapAlign: 'start'
              }}
              className="view-more-card"
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gold)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={28} />
              </div>
              <div style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '0.9rem' }}>అన్నీ చూడండి (View All)</div>
            </div>
          )}
        </div>

        {/* Holographic Scroll Progress (Elite Touch Indicator) */}
        <div style={{ 
          width: '120px', 
          height: '3px', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '10px', 
          margin: '0 auto', 
          position: 'relative',
          overflow: 'hidden' 
        }}>
          <motion.div 
            style={{ 
              position: 'absolute', 
              top: 0, left: 0, height: '100%', 
              width: '40px', 
              background: 'var(--gold)',
              boxShadow: '0 0 10px var(--gold)',
              borderRadius: 'inherit'
            }}
            animate={{ 
              x: [0, 80, 0] // Simple bounce if no scroll listener, but better with listener
            }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .view-more-card:hover { background: rgba(212,175,55,0.1) !important; transform: translateY(-5px); }
        .scroll-nav-btn:hover { background: rgba(255,255,255,0.2) !important; color: var(--gold) !important; border-color: var(--gold) !important; }
      `}} />
    </section>
  );
};

export default HorizontalPropertySection;
