import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Logo({ className = '', size = 48, showText = false, textSize = '1.1rem' }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`snapadda-logo-container ${className}`}
      role="img"
      aria-label="SnapAdda Real Estate Logo"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textDecoration: 'none', transition: 'all 0.4s ease' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <style>{`
        @keyframes goldShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .logo-text-shimmer { background: linear-gradient(90deg,#fff 0%,#f4d03f 40%,#c5a059 50%,#f4d03f 60%,#fff 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:goldShimmer 4s infinite linear; text-decoration:none!important; border-bottom:none!important; }
        
        .logo-svg-main { transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); filter: drop-shadow(0 0 12px rgba(244,208,63,0.3)); }
        .logo-container-hover .logo-svg-main { transform: scale(1.15) rotate(-3deg); filter: drop-shadow(0 0 24px rgba(244,208,63,0.6)); }
        
        /* Sequential Lights Entry */
        .window-light { 
          opacity: 0; 
          transform: scale(0.5); 
          transform-origin: center; 
          transform-box: fill-box; 
          animation: lightUp 0.8s forwards ease-out; 
        }
        @keyframes lightUp { 0%{opacity:0;transform:scale(0.5)} 100%{opacity:1;transform:scale(1)} }
        
        .sparkle-slow { animation: sparklePulse 3s infinite alternate ease-in-out; }
        @keyframes sparklePulse { 0%{opacity:0.4} 100%{opacity:1} }
      `}</style>

      <div className={hovered ? 'logo-container-hover' : ''} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src="/favicon-round.png" 
            alt="SnapAdda" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              filter: hovered ? 'drop-shadow(0 0 20px rgba(232,184,75,0.4))' : 'drop-shadow(0 0 10px rgba(0,0,0,0.3))',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: hovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)'
            }} 
          />
        </div>

        {showText && (
          <div style={{ display: 'flex', alignItems: 'center', fontFamily: "'Inter',sans-serif", textDecoration: 'none' }}>
            <span className="logo-text-shimmer" style={{ fontSize: textSize, fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', userSelect: 'none', lineHeight: 1 }}>
              SnapAdda
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
