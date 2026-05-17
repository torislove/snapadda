import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children, disabled = false }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef(null);
  const controls = useAnimation();

  // Threshold to trigger refresh
  const TRIGGER_THRESHOLD = 90;
  // Maximum distance to allow pulling
  const MAX_PULL_DISTANCE = 160;

  const handleTouchStart = (e) => {
    if (disabled || refreshing || isPulling.current) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling.current || refreshing || disabled) return;

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0) {
      // Apply exponential resistance
      const pull = Math.min(MAX_PULL_DISTANCE, diff * 0.45);
      setPullDistance(pull);

      // Prevent native pull-to-refresh on mobile browsers (like Chrome/Safari)
      if (e.cancelable) {
        e.preventDefault();
      }
    } else {
      isPulling.current = false;
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current || refreshing || disabled) return;

    isPulling.current = false;
    
    if (pullDistance >= TRIGGER_THRESHOLD) {
      // Trigger refresh
      setRefreshing(true);
      setPullDistance(TRIGGER_THRESHOLD);
      controls.start({ y: TRIGGER_THRESHOLD });
      
      try {
        await onRefresh();
      } catch (err) {
        console.error("Refresh failed:", err);
      } finally {
        setRefreshing(false);
        setPullDistance(0);
        controls.start({ y: 0, transition: { type: 'spring', stiffness: 400, damping: 28 } });
      }
    } else {
      // Snap back
      setPullDistance(0);
      controls.start({ y: 0, transition: { type: 'spring', stiffness: 500, damping: 25 } });
    }
  };

  return (
    <div 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative', overflow: 'hidden', minHeight: '100%' }}
    >
      {/* Immersive Pull Loading Indicator */}
      {pullDistance > 0 && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${pullDistance}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 9999,
          overflow: 'hidden',
          transition: refreshing ? 'none' : 'height 0.1s linear'
        }}>
          <motion.div 
            style={{
              padding: '10px 20px',
              borderRadius: '24px',
              background: 'rgba(10, 12, 22, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              scale: Math.min(1.1, 0.6 + (pullDistance / TRIGGER_THRESHOLD) * 0.4)
            }}
          >
            <motion.div
              animate={refreshing ? { rotate: 360 } : { rotate: (pullDistance / TRIGGER_THRESHOLD) * 360 }}
              transition={refreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0.1 }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <Loader2 size={16} color="var(--gold)" />
            </motion.div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'white', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {refreshing ? 'Updating Feed...' : pullDistance >= TRIGGER_THRESHOLD ? 'Release to update' : 'Pull to refresh'}
            </span>
          </motion.div>
        </div>
      )}

      {/* Main Content Layout */}
      <motion.div 
        animate={refreshing ? { y: TRIGGER_THRESHOLD } : { y: pullDistance }}
        transition={refreshing ? { type: 'tween', duration: 0.1 } : { type: 'spring', stiffness: 500, damping: 25 }}
        style={{ willChange: 'transform' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
