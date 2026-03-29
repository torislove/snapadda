interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo = ({ className = '', size = 36 }: LogoProps) => (
  <>
    <style>{`
      .snapadda-logo:hover {
        filter: drop-shadow(0 0 10px rgba(201, 168, 76, 0.4));
      }
    `}</style>
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`snapadda-logo ${className}`}
      style={{ minWidth: size, minHeight: size, transition: 'filter 0.3s ease' }}
    >
      <path d="M32 6L6 28V58H24V42H40V58H58V28L32 6Z" fill="url(#adminGold)" />
      <path d="M32 18L14 33V50H22V40H42V50H50V33L32 18Z" fill="var(--bg-primary, #111)" />
      <circle cx="32" cy="32" r="7" fill="url(#adminGold)" />
      <circle cx="32" cy="32" r="2.5" fill="var(--bg-primary, #111)" />
      <line x1="32" y1="6" x2="32" y2="1" stroke="url(#adminGold)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="0" r="1.5" fill="url(#adminGold)" />
      <defs>
        <linearGradient id="adminGold" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dbbf5c" />
          <stop offset="0.5" stopColor="#c9a84c" />
          <stop offset="1" stopColor="#a08838" />
        </linearGradient>
      </defs>
    </svg>
  </>
);
