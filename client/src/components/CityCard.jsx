import { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { MapPin } from 'lucide-react';

// Distinct gradient palettes for each city (cycles)
const CITY_GRADIENTS = [
  'linear-gradient(135deg, #1a3a2a 0%, #0d5735 40%, #c9a84c33 100%)',
  'linear-gradient(135deg, #2a1a10 0%, #7c3a00 40%, #e8b84b33 100%)',
  'linear-gradient(135deg, #0a1a3a 0%, #0d2f6e 40%, #4fa3e833 100%)',
  'linear-gradient(135deg, #2a0a1a 0%, #6e0d3a 40%, #e84fa333 100%)',
  'linear-gradient(135deg, #0a2a2a 0%, #0d6e6e 40%, #4fe8e833 100%)',
  'linear-gradient(135deg, #1a2a0a 0%, #3a6e0d 40%, #a3e84f33 100%)',
];

export default function CityCard({ city, count, cityPhoto, isActive, onClick, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x), sy = useSpring(y);
  const rotateX = useTransform(sy, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(sx, [-0.5, 0.5], ['-6deg', '6deg']);

  const fallbackGradient = city.color
    ? `linear-gradient(135deg, ${city.color}55, ${city.color}22)`
    : CITY_GRADIENTS[index % CITY_GRADIENTS.length];

  return (
    <motion.div
      className={`city-card premium-bezel-less-card ${isActive ? ' active' : ''}`}
      style={{ 
        rotateX, 
        rotateY, 
        transformStyle: 'preserve-3d', 
        perspective: '1000px',
        height: '100%' 
      }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
    >
      <div
        className="city-card-bg"
        style={{
          backgroundImage: cityPhoto
            ? `linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.85) 100%), url(${cityPhoto})`
            : fallbackGradient,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      {/* Dynamic HUD for Native App feel */}
      <div className="city-card-info" style={{ position: 'absolute', bottom: '15px', left: '15px', right: '15px', zIndex: 2 }}>
        <div className="city-card-name" style={{ 
          color: '#fff', 
          fontWeight: 900, 
          fontSize: '1.35rem',
          lineHeight: '1.2',
          textShadow: '0 2px 10px rgba(0,0,0,0.8)',
          fontFamily: 'var(--font-serif)',
          letterSpacing: '-0.02em',
          marginBottom: '4px'
        }}>
          {city.name}
        </div>
        {count > 0 && (
          <div className="city-card-count" style={{
            background: 'var(--gold)',
            color: 'var(--midnight)',
            padding: '2px 10px',
            borderRadius: '99px',
            fontSize: '0.65rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <MapPin size={10} />
            {count} PROPERTIES
          </div>
        )}
        {!count && (
          <div style={{ 
            fontSize: '0.68rem', 
            color: 'rgba(255,255,255,0.7)', 
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {city.district || 'Andhra Pradesh'}
          </div>
        )}
      </div>
    </motion.div>
  );
}
