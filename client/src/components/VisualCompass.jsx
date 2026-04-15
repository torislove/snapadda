import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';

const FACING_MAP = {
  'East': 90,
  'West': 270,
  'North': 0,
  'South': 180,
  'North-East': 45,
  'North-West': 315,
  'South-East': 135,
  'South-West': 225,
  'NE': 45,
  'NW': 315,
  'SE': 135,
  'SW': 225,
};

export default function VisualCompass({ facing, size = 64 }) {
  const rotation = FACING_MAP[facing] || 0;

  return (
    <div style={{ 
      position: 'relative', 
      width: size, 
      height: size, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'rgba(212,175,55,0.05)',
      borderRadius: '50%',
      border: '1px solid rgba(212,175,55,0.2)',
      boxShadow: '0 0 20px rgba(212,175,55,0.1)'
    }}>
      {/* Compass Dial Labels */}
      <span style={{ position: 'absolute', top: '2px', fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>N</span>
      <span style={{ position: 'absolute', right: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>E</span>
      <span style={{ position: 'absolute', bottom: '2px', fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>S</span>
      <span style={{ position: 'absolute', left: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>W</span>

      {/* Rotating Needle */}
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: rotation }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        style={{ 
          position: 'relative', 
          width: '2px', 
          height: '80%', 
          background: 'linear-gradient(to bottom, #e8b84b 50%, rgba(255,255,255,0.1) 50%)',
          borderRadius: '2px'
        }}
      >
        <div style={{ 
          position: 'absolute', 
          top: '-4px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderBottom: '6px solid #e8b84b'
        }} />
      </motion.div>

      {/* Center Pin */}
      <div style={{ 
        position: 'absolute', 
        width: '6px', 
        height: '6px', 
        background: '#e8b84b', 
        borderRadius: '50%',
        boxShadow: '0 0 10px #e8b84b' 
      }} />
    </div>
  );
}
