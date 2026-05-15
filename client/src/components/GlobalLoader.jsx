import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

const STATUS_MESSAGES = [
  "Initializing Asset Intelligence...",
  "Synchronizing Global Grid...",
  "Optimizing Secure Channels...",
  "Fetching Real-time Inventory...",
  "Calibrating Elite Layout...",
  "SnapAdda: Andhra's Leading Platform"
];

export default function GlobalLoader({ mode = 'full' }) {
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIdx(prev => (prev + 1) % STATUS_MESSAGES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const containerStyle = mode === 'full' ? {
    position: 'fixed',
    inset: 0,
    zIndex: 9999999,
    background: '#05050a',
  } : {
    width: '100%',
    height: '60vh',
    background: 'transparent',
  };

  return (
    <motion.div
      initial={{ opacity: mode === 'full' ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="quantum-loader-root"
      style={{
        ...containerStyle,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3.5rem',
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* ── Layered 3D Orbital Rings ── */}
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>
          <motion.div
            animate={{ rotate: 360, rotateY: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="quantum-ring"
            style={{ inset: '0', borderTopColor: '#e8b84b', borderWidth: '2px' }}
          />
          <motion.div
            animate={{ rotate: -360, rotateX: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="quantum-ring"
            style={{ inset: '15px', borderRightColor: 'rgba(34, 217, 224, 0.4)', borderWidth: '1px' }}
          />
          <motion.div
            animate={{ rotate: 360, rotateZ: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="quantum-ring"
            style={{ inset: '30px', borderBottomColor: 'rgba(39, 201, 125, 0.4)', borderWidth: '1px' }}
          />
        </div>

        {/* ── Holographic Floor Glow ── */}
        <div style={{ 
          position: 'absolute', bottom: '-40px', width: '120px', height: '20px', 
          background: 'radial-gradient(ellipse at center, rgba(232,184,75,0.2) 0%, transparent 70%)',
          filter: 'blur(8px)', borderRadius: '50%', animation: 'luminous-pulse 2s infinite'
        }} />
        
        {/* ── Core Brand Identity ── */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              filter: ['drop-shadow(0 0 10px rgba(232,184,75,0.2))', 'drop-shadow(0 0 30px rgba(232,184,75,0.6))', 'drop-shadow(0 0 10px rgba(232,184,75,0.2))']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Logo size={58} showText={false} />
          </motion.div>
        </div>
      </div>

      <div style={{ textAlign: 'center', minHeight: '60px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={statusIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '0.75rem', 
              fontWeight: 800, 
              letterSpacing: '0.2em', 
              textTransform: 'uppercase', 
              marginBottom: '1.5rem',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {STATUS_MESSAGES[statusIdx]}
          </motion.div>
        </AnimatePresence>

        <div style={{ 
          width: '260px', height: '4px', background: 'rgba(255,255,255,0.05)', 
          borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)',
          margin: '0 auto'
        }}>
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ 
              height: '100%', width: '50%', 
              background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
              boxShadow: '0 0 15px var(--gold-glow)'
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
