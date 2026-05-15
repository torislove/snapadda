import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchSetting } from '../services/api';

const CityMarquee = ({ cities, loading }) => {
  const navigate = useNavigate();
  const [speed, setSpeed] = React.useState(80);

  React.useEffect(() => {
    fetchSetting('marquee_strips')
      .then(res => {
        if (res && res.citiesSpeed) setSpeed(res.citiesSpeed);
      })
      .catch(() => {});
  }, []);

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
      <motion.div
        className="city-marquee-track"
        animate={{ x: ['0%', '-25%'] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
        style={{ 
          display: 'flex', 
          gap: '20px', 
          width: 'max-content',
        }}
      >
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
      </motion.div>
    </div>
  );
};

export default CityMarquee;
