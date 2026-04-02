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
      className={`city-card${isActive ? ' active' : ''}`}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: '600px' }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
    >
      <div
        className="city-card-bg"
        style={{
          backgroundImage: cityPhoto
            ? `linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.72) 100%), url(${cityPhoto})`
            : fallbackGradient,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.5s ease',
        }}
      />
      {/* Gradient overlay ensuring text contrast */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
        zIndex: 1,
        borderRadius: 'inherit',
      }} />
      <div className="city-card-content" style={{ position: 'relative', zIndex: 2 }}>
        <div className="city-card-name" style={{ color: '#fff', fontWeight: 800, textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
          {city.name}
        </div>
        {count > 0 && (
          <div className="city-card-count">
            <MapPin size={10} style={{ marginRight: 2 }} />
            {count} properties
          </div>
        )}
        {!count && (
          <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>
            {city.district || 'Andhra Pradesh'}
          </div>
        )}
      </div>
    </motion.div>
  );
}
