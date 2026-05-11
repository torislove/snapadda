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
        background: '#05050a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5rem'
      }}
    >
      <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Animated Rings - Multiple Layers for Elite feel */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            inset: 0,
            border: '2px solid rgba(232,184,75,0.05)',
            borderTop: '2px solid #e8b84b',
            borderRadius: '50%'
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            inset: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRight: '1px solid rgba(232,184,75,0.4)',
            borderRadius: '50%',
          }}
        />
        
        {/* High-Fidelity Brand Identity - ROUND LOGO */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            filter: [
              'drop-shadow(0 0 10px rgba(232,184,75,0.3))',
              'drop-shadow(0 0 25px rgba(232,184,75,0.6))',
              'drop-shadow(0 0 10px rgba(232,184,75,0.3))'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <img 
            src="/favicon-round.png" 
            alt="SnapAdda" 
            style={{ width: '85px', height: '85px', objectFit: 'contain', borderRadius: '50%' }} 
          />
        </motion.div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '16px' }}
        >
          SnapAdda Premium Experience
        </motion.div>
        <div style={{ width: '220px', height: '2px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg, transparent, #e8b84b, transparent)' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
