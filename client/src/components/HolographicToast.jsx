import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const HolographicToast = ({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose,
  duration = 3000 
}) => {
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const icons = {
    success: <CheckCircle2 size={18} style={{ color: '#10d98c' }} />,
    error: <AlertCircle size={18} style={{ color: '#f5397b' }} />,
    info: <Info size={18} style={{ color: 'var(--gold)' }} />
  };

  const colors = {
    success: 'rgba(16, 217, 140, 0.2)',
    error: 'rgba(245, 57, 123, 0.2)',
    info: 'rgba(232, 184, 75, 0.2)'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            padding: '12px 24px',
            borderRadius: '16px',
            background: 'rgba(10, 12, 20, 0.9)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors[type] || colors.info}`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '280px',
            maxWidth: '90vw'
          }}
        >
          <div style={{ flexShrink: 0 }}>
            {icons[type]}
          </div>
          
          <div style={{ flex: 1 }}>
            <p style={{ 
              margin: 0, 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              color: 'white',
              letterSpacing: '0.02em',
              lineHeight: 1.4
            }}>
              {message}
            </p>
          </div>

          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'rgba(255,255,255,0.3)', 
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={16} />
          </button>

          {/* Holographic Reflection Streak */}
          <motion.div 
            style={{
              position: 'absolute',
              top: 0, left: '-100%', width: '50%', height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              transform: 'skewX(-20deg)',
              pointerEvents: 'none'
            }}
            animate={{ left: '150%' }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HolographicToast;
