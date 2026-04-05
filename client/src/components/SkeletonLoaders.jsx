import React from 'react';

export const SkeletonCityCard = () => (
  <div className="skeleton-card" style={{ 
    width: '100%', 
    aspectRatio: '1', 
    borderRadius: '24px', 
    background: 'rgba(255,255,255,0.03)',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.05)'
  }}>
    <div className="shimmer-luxury" />
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
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.05)'
  }}>
    <div style={{ width: '100%', height: '220px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)' }} />
    <div style={{ width: '60%', height: '24px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }} />
    <div style={{ width: '40%', height: '16px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', marginTop: 'auto' }} />
    <div className="shimmer-luxury" />
  </div>
);
