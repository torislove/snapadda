import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface WelcomeOverlayProps {
  adminName: string;
  adminAvatar?: string;
  onComplete?: () => void;
}

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ adminName, adminAvatar, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 5, 10, 0.95)',
            backdropFilter: 'blur(30px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Animated Background Orbs */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{
              position: 'absolute',
              width: '600px',
              height: '600px',
              background: 'radial-gradient(circle, rgba(155, 89, 245, 0.15) 0%, transparent 70%)',
              filter: 'blur(80px)',
              zIndex: 0,
            }}
          />

          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
            {/* Avatar Hexagon/Circle with Glow */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 }}
              style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 2rem' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{
                  position: 'absolute',
                  inset: -10,
                  borderRadius: '50%',
                  border: '2px dashed rgba(212, 175, 55, 0.3)',
                }}
              />
              <img
                src={adminAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=9b59f5&color=fff&size=256&bold=true`}
                alt="Admin"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid var(--violet, #9b59f5)',
                  boxShadow: '0 0 40px rgba(155, 89, 245, 0.4)',
                }}
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: 'spring' }}
                style={{
                  position: 'absolute',
                  bottom: 5,
                  right: 5,
                  background: '#10d98c',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(16, 217, 140, 0.4)',
                  border: '3px solid #05050a',
                }}
              >
                <ShieldCheck size={16} />
              </motion.div>
            </motion.div>

            {/* Welcome Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <Sparkles size={18} style={{ color: 'var(--gold, #d4af37)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.2em', color: 'var(--gold, #d4af37)', textTransform: 'uppercase' }}>
                  Secure Access Granted
                </span>
              </div>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: 900, 
                color: '#fff', 
                fontFamily: 'var(--font-heading, "Playfair Display", serif)',
                margin: 0,
                background: 'linear-gradient(135deg, #fff 30%, #9b59f5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-1px'
              }}>
                Welcome back, {adminName.split(' ')[0]}
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: '1rem', fontSize: '1.1rem' }}>
                Initializing SNAPADDA Admin Control System...
              </p>
            </motion.div>

            {/* Progress Bar */}
            <div style={{ width: '240px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', margin: '2.5rem auto 0', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 4, ease: "easeInOut" }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #9b59f5, #10d98c)' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
