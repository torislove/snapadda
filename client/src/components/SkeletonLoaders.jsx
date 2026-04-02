import React from 'react';

export const SkeletonCityCard = () => (
  <div className="skeleton-card" style={{ 
    width: '100%', 
    aspectRatio: '1', 
    borderRadius: '24px', 
    background: 'rgba(255,255,255,0.03)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div className="shimmer-effect" />
  </div>
);

export const SkeletonPropertyCard = () => (
  <div className="skeleton-card" style={{ 
    width: '100%', 
    height: '420px', 
    borderRadius: '32px', 
    background: 'rgba(255,255,255,0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{ width: '100%', height: '220px', borderRadius: '24px', background: 'rgba(255,255,255,0.05)' }} />
    <div style={{ width: '60%', height: '24px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }} />
    <div style={{ width: '40%', height: '16px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)' }} />
    <div className="shimmer-effect" />
  </div>
);

// Add these to App.css to power the shimmer
/*
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.shimmer-effect {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(212,175,55,0.05), transparent);
  animation: shimmer 1.5s infinite;
}
*/
