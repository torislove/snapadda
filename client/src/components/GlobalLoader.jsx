import { motion } from 'framer-motion';

export default function GlobalLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999999,
        background: '#090a12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem'
      }}
    >
      <div style={{ position: 'relative', width: '120px', height: '120px' }}>
        {/* Animated Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            inset: 0,
            border: '2px solid rgba(232,184,75,0.1)',
            borderTop: '2px solid #e8b84b',
            borderRadius: '50%'
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            inset: '15px',
            border: '2px solid rgba(232,184,75,0.05)',
            borderRight: '2px solid #e8b84b',
            borderRadius: '50%',
            opacity: 0.5
          }}
        />
        
        {/* High-Fidelity Brand Identity */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span 
            className="logo-text-shimmer"
            style={{ 
              fontSize: '1.4rem', 
              fontWeight: 950, 
              color: '#e8b84b', 
              letterSpacing: '0.15em',
              textAlign: 'center',
              textShadow: '0 0 20px rgba(232,184,75,0.4)'
            }}
          >
            SNAPADDA
          </span>
        </motion.div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '8px' }}
        >
          Initializing SnapAdda Elite
        </motion.div>
        <div style={{ width: '200px', height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ height: '100%', background: 'linear-gradient(90deg, transparent, #e8b84b, transparent)' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
