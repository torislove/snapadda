import { useEffect, useRef } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

export const Logo = ({ className = '', size = 36, animate = true }: LogoProps) => {
  const pathRef = useRef<SVGPathElement>(null);
  const innerRef = useRef<SVGPathElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!animate) return;
    
    // Stroke draw animation
    [pathRef.current, innerRef.current].forEach((el, i) => {
      if (!el) return;
      const length = el.getTotalLength?.() || 200;
      el.style.strokeDasharray = `${length}`;
      el.style.strokeDashoffset = `${length}`;
      el.style.animation = `drawStroke 1.2s ${i * 0.3}s ease-out forwards`;
    });

    // Circle pop animation
    if (circleRef.current) {
      circleRef.current.style.transform = 'scale(0)';
      circleRef.current.style.transformOrigin = 'center';
      circleRef.current.style.animation = 'popIn 0.5s 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    }
  }, [animate]);

  return (
    <>
      <style>{`
        @keyframes drawStroke {
          to { stroke-dashoffset: 0; }
        }
        @keyframes popIn {
          to { transform: scale(1); }
        }
        @keyframes logoGlow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(201, 168, 76, 0.2)); }
          50% { filter: drop-shadow(0 0 12px rgba(201, 168, 76, 0.5)); }
        }
        .snapadda-logo:hover {
          animation: logoGlow 1.5s ease-in-out infinite;
        }
      `}</style>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`snapadda-logo ${className}`}
        style={{ minWidth: size, minHeight: size, transition: 'transform 0.3s ease' }}
      >
        {/* Outer house shape */}
        <path
          ref={pathRef}
          d="M32 6L6 28V58H24V42H40V58H58V28L32 6Z"
          fill="url(#snapGold)"
          stroke="url(#snapGold)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner cutout */}
        <path
          ref={innerRef}
          d="M32 18L14 33V50H22V40H42V50H50V33L32 18Z"
          fill="var(--bg-primary, #111)"
          stroke="var(--bg-primary, #111)"
          strokeWidth="0.5"
        />
        {/* Center circle — the "Adda" meeting point */}
        <circle
          ref={circleRef}
          cx="32" cy="32" r="7"
          fill="url(#snapGold)"
        />
        {/* Inner dot */}
        <circle cx="32" cy="32" r="2.5" fill="var(--bg-primary, #111)" />
        {/* Roof antenna / pin accent */}
        <line x1="32" y1="6" x2="32" y2="1" stroke="url(#snapGold)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="32" cy="0" r="1.5" fill="url(#snapGold)" />
        <defs>
          <linearGradient id="snapGold" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#dbbf5c" />
            <stop offset="0.5" stopColor="#c9a84c" />
            <stop offset="1" stopColor="#a08838" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
};
