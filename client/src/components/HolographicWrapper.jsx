import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const HolographicWrapper = ({ 
  children, 
  intensity = 1, 
  iridescent = false, 
  tilt = true,
  className = "",
  style = {}
}) => {
  const containerRef = useRef(null);
  
  // Motion values for tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth spring physics
  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10 * intensity, -10 * intensity]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10 * intensity, 10 * intensity]), springConfig);
  
  // Holographic highlight position
  const highlightX = useSpring(useTransform(x, [-0.5, 0.5], ["0%", "100%"]), springConfig);
  const highlightY = useSpring(useTransform(y, [-0.5, 0.5], ["0%", "100%"]), springConfig);

  const handleMouseMove = (e) => {
    if (!tilt || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Gyroscope effect for mobile (optional, but premium)
  useEffect(() => {
    const handleOrientation = (e) => {
      if (!tilt) return;
      // Map beta/gamma to x/y
      const gamma = e.gamma || 0; // -90 to 90
      const beta = e.beta || 0;   // -180 to 180
      
      x.set(Math.min(Math.max(gamma / 30, -0.5), 0.5));
      y.set(Math.min(Math.max((beta - 45) / 30, -0.5), 0.5));
    };

    if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
      // Permission required for iOS
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [tilt, x, y]);

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`holographic-container ${className}`}
      style={{
        ...style,
        rotateX: tilt ? rotateX : 0,
        rotateY: tilt ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="holographic-card-bg" />
      
      {/* Iridescent Edge */}
      <div className={`holographic-edge ${iridescent ? 'holographic-edge-iridescent' : ''}`} />
      
      {/* Moving Highlight */}
      <motion.div 
        className="holographic-overlay"
        style={{
          left: useTransform(highlightX, (v) => `calc(${v} - 50%)`),
          top: useTransform(highlightY, (v) => `calc(${v} - 50%)`),
        }}
      />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, transform: "translateZ(20px)", height: '100%' }}>
        {children}
      </div>
    </motion.div>
  );
};

export default HolographicWrapper;
