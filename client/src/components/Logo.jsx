import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Logo({ className = '', size = 48, showText = false, textSize = '1.1rem' }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`snapadda-logo-container ${className}`}
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
        <svg width={size} height={size} viewBox="0 0 400 400" className="logo-svg-main" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="premiumGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c5a059" />
              <stop offset="35%" stopColor="#f4d03f" />
              <stop offset="65%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#c5a059" />
            </linearGradient>
            <clipPath id="buildingClip">
              <rect x="150" y="50" width="100" height="300" rx="4" />
              <rect x="80" y="160" width="65" height="190" rx="4" />
              <rect x="255" y="160" width="65" height="190" rx="4" />
            </clipPath>
          </defs>
          
          {/* Shadows / Depth */}
          <rect x="158" y="58" width="100" height="300" rx="4" fill="rgba(0,0,0,0.3)" />
          
          {/* Main Tower */}
          <rect x="150" y="50" width="100" height="300" rx="4" fill="url(#premiumGold)" />
          <path d="M150 50 L200 10 L250 50 Z" fill="url(#premiumGold)" />
          
          {/* Side Wings */}
          <rect x="80" y="160" width="65" height="190" rx="4" fill="rgba(255,255,255,0.1)" stroke="url(#premiumGold)" strokeWidth="3" />
          <rect x="255" y="160" width="65" height="190" rx="4" fill="rgba(255,255,255,0.1)" stroke="url(#premiumGold)" strokeWidth="3" />
          
          {/* Animated Windows - Symmetrical & Centered */}
          {[
            // Main Tower
            {x:172, y:90}, {x:210, y:90}, {x:172, y:130}, {x:210, y:130},
            {x:172, y:170}, {x:210, y:170}, {x:172, y:210}, {x:210, y:210},
            {x:172, y:250}, {x:210, y:250}, {x:172, y:290}, {x:210, y:290},
            // Left Wing
            {x:93, y:185}, {x:114, y:185}, {x:93, y:225}, {x:114, y:225},
            // Right Wing
            {x:268, y:185}, {x:289, y:185}, {x:268, y:225}, {x:289, y:225}
          ].map((w, i) => (
            <rect 
              key={i} x={w.x} y={w.y} width="16" height="22" rx="2" 
              fill="#fff" className="window-light sparkle-slow"
              style={{ animationDelay: `${i * 0.08}s` }}
            />
          ))}

          {/* Roof Details */}
          <rect x="195" y="20" width="10" height="30" fill="url(#premiumGold)" />
          <circle cx="200" cy="15" r="4" fill="var(--gold)" className="sparkle-slow" />
        </svg>

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
