import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CityMarquee = ({ cities, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '20px', padding: '20px 0', overflow: 'hidden' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ minWidth: '200px', height: '130px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    );
  }

  // Duplicate items for infinite scroll
  const repeatedCities = [...cities, ...cities, ...cities, ...cities];

  return (
    <div className="city-marquee-outer" style={{ position: 'relative', width: '100%', overflow: 'hidden', padding: '1rem 0' }}>
      <div className="city-marquee-track" style={{ 
        display: 'flex', 
        gap: '20px', 
        width: 'max-content',
        animation: 'cityScroll 40s linear infinite',
        willChange: 'transform'
      }}>
        {repeatedCities.map((city, idx) => (
          <motion.div
            key={`${city._id || city.name}-${idx}`}
            whileHover={{ scale: 1.02, translateY: -5 }}
            onClick={() => navigate(`/search?city=${encodeURIComponent(city.name)}`)}
            style={{
              position: 'relative',
              width: '200px',
              height: '130px',
              borderRadius: '24px',
              overflow: 'hidden',
              cursor: 'pointer',
              background: 'var(--midnight-deep)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}
          >
            {/* Background Image */}
            <img 
              src={city.image || 'https://images.unsplash.com/photo-1590059132718-568eaef80ee1?auto=format&fit=crop&q=80&w=600'} 
              alt={city.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65, transition: '0.4s' }}
              className="city-bg-img"
            />
            
            {/* Overlay Gradient */}
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'linear-gradient(to top, rgba(5,5,10,0.95) 0%, rgba(5,5,10,0.2) 50%, transparent 100%)' 
            }} />

            {/* Content */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold)', marginBottom: '4px' }}>
                <Navigation2 size={12} fill="var(--gold)" />
                <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {city.propertyCount || 0} Assets
                </span>
              </div>
              <h4 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>{city.name}</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', opacity: 0.6 }}>
                <MapPin size={10} color="white" />
                <span style={{ color: 'white', fontSize: '0.7rem' }}>Andhra Pradesh</span>
              </div>
            </div>

            {/* Interactive Shine */}
            <div className="city-shine" />
          </motion.div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cityScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-200px * ${cities.length} - 20px * ${cities.length})); }
        }
        .city-marquee-outer:hover .city-marquee-track {
          animation-play-state: paused;
        }
        .city-marquee-track:hover .city-bg-img {
          opacity: 0.85 !important;
          transform: scale(1.05);
        }
        .city-shine {
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
          transform: skewX(-25deg);
          transition: 0.75s;
        }
        .city-marquee-track div:hover .city-shine {
          left: 150%;
        }
      `}} />
    </div>
  );
};

export default CityMarquee;
