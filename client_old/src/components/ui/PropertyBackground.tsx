/* Floating property SVG background */
export const PropertyBackground = () => {
  const House = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 32L32 10L56 32V58H40V42H24V58H8V32Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="8" y1="32" x2="56" y2="32" stroke="currentColor" strokeWidth="1"/>
      <rect x="14" y="38" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="42" y="38" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="26" y="44" width="12" height="14" rx="5" ry="5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
  const Building = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="12" width="44" height="50" rx="2" stroke="currentColor" strokeWidth="2"/>
      <rect x="16" y="20" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="28" y="20" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="40" y="20" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="16" y="34" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="28" y="34" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="40" y="34" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="24" y="46" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="10" y1="12" x2="54" y2="12" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="32" y1="4" x2="32" y2="12" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
  const Villa = () => (
    <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 36L22 16L40 36" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M40 36L58 16L76 36" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <rect x="4" y="36" width="36" height="26" stroke="currentColor" strokeWidth="2"/>
      <rect x="40" y="36" width="36" height="26" stroke="currentColor" strokeWidth="2"/>
      <rect x="12" y="44" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="24" y="44" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="48" y="44" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="60" y="44" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
  const Pin = () => (
    <svg viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2"/>
      <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M20 36L20 54" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  const Key = () => (
    <svg viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="16" r="10" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="16" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="22" y1="16" x2="56" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="46" y1="16" x2="46" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="54" y1="16" x2="54" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const items = [
    { Comp: House,    cls: 'prop-svg-1'  },
    { Comp: Building, cls: 'prop-svg-2'  },
    { Comp: Villa,    cls: 'prop-svg-3'  },
    { Comp: Pin,      cls: 'prop-svg-4'  },
    { Comp: House,    cls: 'prop-svg-5'  },
    { Comp: Key,      cls: 'prop-svg-6'  },
    { Comp: Building, cls: 'prop-svg-7'  },
    { Comp: House,    cls: 'prop-svg-8'  },
    { Comp: Villa,    cls: 'prop-svg-9'  },
    { Comp: Pin,      cls: 'prop-svg-10' },
    { Comp: House,    cls: 'prop-svg-11' },
    { Comp: Building, cls: 'prop-svg-12' },
    { Comp: Key,      cls: 'prop-svg-13' },
    { Comp: Villa,    cls: 'prop-svg-14' },
    { Comp: House,    cls: 'prop-svg-15' },
  ];

  return (
    <div className="property-bg" aria-hidden="true">
      {items.map(({ Comp, cls }, i) => (
        <div key={i} className={cls} style={{ position: 'absolute', color: '#e8b84b' }}>
          <Comp />
        </div>
      ))}
    </div>
  );
};
