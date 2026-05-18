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
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 400 400" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="logo-svg-main"
          >
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c5a059" />
                <stop offset="50%" stopColor="#f4d03f" />
                <stop offset="100%" stopColor="#c5a059" />
              </linearGradient>
            </defs>
            <rect x="150" y="50" width="100" height="300" rx="6" fill="url(#goldGrad)" />
            <path d="M150 50 L200 8 L250 50 Z" fill="url(#goldGrad)" />
            <rect x="80" y="160" width="60" height="190" rx="5" fill="rgba(255,255,255,0.18)" stroke="url(#goldGrad)" strokeWidth="10" />
            <rect x="260" y="160" width="60" height="190" rx="5" fill="rgba(255,255,255,0.18)" stroke="url(#goldGrad)" strokeWidth="10" />
            <rect x="175" y="90" width="18" height="22" rx="3" fill="white" className="window-light" style={{ animationDelay: '0.1s' }} />
            <rect x="207" y="90" width="18" height="22" rx="3" fill="white" className="window-light" style={{ animationDelay: '0.2s' }} />
            <rect x="175" y="130" width="18" height="22" rx="3" fill="white" className="window-light" style={{ animationDelay: '0.3s' }} />
            <rect x="207" y="130" width="18" height="22" rx="3" fill="white" className="window-light" style={{ animationDelay: '0.4s' }} />
            <rect x="175" y="170" width="18" height="22" rx="3" fill="white" className="window-light" style={{ animationDelay: '0.5s' }} />
            <rect x="207" y="170" width="18" height="22" rx="3" fill="white" className="window-light" style={{ animationDelay: '0.6s' }} />
          </svg>
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
