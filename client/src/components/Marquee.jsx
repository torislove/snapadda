import { useState, useEffect } from 'react';
import { Landmark, ShieldCheck, IndianRupee, Home as HomeIcon, CheckCircle2, MapPin, Award, Square, Compass, Building2, Phone, ArrowRight } from 'lucide-react';
import { fetchSetting } from '../services/api';

const ICONS = { Landmark, ShieldCheck, IndianRupee, Home: HomeIcon, CheckCircle2, MapPin, Award, Square, Compass, Building2, Phone, ArrowRight };

const DEFAULT = {
  speed1: 28,
  band1: [
    { id: '1', label: 'Amaravati Region', link: '#cities', icon: 'Landmark' },
    { id: '2', label: 'Verified Listings ✅', link: '#properties', icon: 'ShieldCheck' },
    { id: '3', label: 'Under 50 Lakhs 🔥', link: '#search', icon: 'IndianRupee' },
    { id: '4', label: 'Premium Villas', link: '#search', icon: 'Home' },
    { id: '5', label: 'Vijayawada Central', link: '#cities', icon: 'MapPin' },
    { id: '6', label: 'CRDA Approved 🏛️', link: '#properties', icon: 'Award' },
    { id: '7', label: 'Invest in Plots ✨', link: '#search', icon: 'Square' },
    { id: '8', label: '24/7 Expert Support', link: '#contact', icon: 'Phone' },
    { id: '9', label: 'Guntur District Plots', link: '#cities', icon: 'MapPin' },
    { id: '10', label: 'Agricultural Land', link: '#search', icon: 'Square' },
  ],
};

function MarqueeIcon({ name }) {
  const Icon = ICONS[name];
  return Icon ? <Icon size={12} style={{ flexShrink: 0 }} /> : null;
}

export default function Marquee() {
  const [config, setConfig] = useState(DEFAULT);

  useEffect(() => {
    fetchSetting('marquee_strips')
      .then(data => {
        if (data && (data.band1 || data.band2)) {
          // Merge both bands into one for single-band layout
          const merged = [
            ...(data.band1 || DEFAULT.band1),
            ...(data.band2 || []),
          ];
          setConfig(prev => ({ ...prev, band1: merged.length > 0 ? merged : prev.band1 }));
        }
      })
      .catch(() => {}); // Silent fail - defaults are fine
  }, []);

  const items = config.band1 || DEFAULT.band1;
  // Triplicate for seamless loop (50% = 1 set, so we need at least 2 sets)
  const repeated = [...items, ...items, ...items];

  return (
    <div className="animated-marquee-wrapper">
      <div className="marquee-band-container">
        <div
          className="marquee-track"
          style={{ animationDuration: `${config.speed1 || 28}s` }}
        >
          {repeated.map((item, i) => {
            const normalized = typeof item === 'string'
              ? { id: `m-${i}`, label: item, icon: 'ArrowRight' }
              : item;
            return (
              <a
                key={`${normalized.id}-${i}`}
                href={normalized.link || '#'}
                className="marquee-item"
              >
                {normalized.icon && <MarqueeIcon name={normalized.icon} />}
                <span>{normalized.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
