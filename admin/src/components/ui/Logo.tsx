import { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textSize?: string;
}

export const Logo = ({ className = '', size = 48, showText = false, textSize = '1.1rem' }: LogoProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`snapadda-logo-container ${className}`}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.45rem',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        @keyframes goldShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .logo-text-shimmer {
          background: linear-gradient(
            90deg, 
            #ffffff 0%, 
            #f4d03f 40%, 
            #c5a059 50%, 
            #f4d03f 60%, 
            #ffffff 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: goldShimmer 4s infinite linear;
          text-decoration: none !important;
          border-bottom: none !important;
        }
        .logo-building {
          transition: filter 0.4s ease, transform 0.4s ease;
          filter: drop-shadow(0 0 10px rgba(244, 208, 63, 0.45));
        }
        .logo-container-hover .logo-building {
          filter: drop-shadow(0 0 24px rgba(244, 208, 63, 0.75));
          transform: scale(1.1) rotate(-2deg);
        }
        .window-sparkle {
          animation: sparkle 1.5s infinite alternate ease-in-out;
        }
        @keyframes sparkle {
          0% { opacity: 0.3; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
      
      <div 
        className={isHovered ? 'logo-container-hover' : ''}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem',
          textDecoration: 'none'
        }}
      >
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src="/favicon-round.png" 
            alt="SnapAdda" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              filter: isHovered ? 'drop-shadow(0 0 20px rgba(232,184,75,0.4))' : 'drop-shadow(0 0 10px rgba(0,0,0,0.3))',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)'
            }} 
          />
        </div>

        {showText && (
          <div style={{ display: 'flex', alignItems: 'center', fontFamily: "'Inter', sans-serif", textDecoration: 'none' }}>
            <span 
              className="logo-text-shimmer"
              style={{ 
                fontSize: textSize, 
                fontWeight: 900, 
                letterSpacing: '-0.045em',
                textTransform: 'uppercase',
                textShadow: '0 2px 4px rgba(0,0,0,0.18)',
                userSelect: 'none',
                lineHeight: 1,
                display: 'inline-block'
              }}
            >
              SnapAdda
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
