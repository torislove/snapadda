import { useState, useEffect } from 'react';
import { Landmark, ShieldCheck, IndianRupee, Home as HomeIcon, CheckCircle2, MapPin, Award, Square, Compass, Building2, Phone, ArrowRight } from 'lucide-react';
import { fetchSetting } from '../services/api';

const ICONS = { Landmark, ShieldCheck, IndianRupee, Home: HomeIcon, CheckCircle2, MapPin, Award, Square, Compass, Building2, Phone, ArrowRight };

const DEFAULT = {
  speed1: 30, speed2: 35,
  band1: [
    { id: '1', label: 'Amaravati Region', link: '#cities', icon: 'Landmark' },
    { id: '2', label: 'Verified Listings ✅', link: '#properties', icon: 'ShieldCheck' },
    { id: '3', label: 'Under 50 Lakhs 🔥', link: '#search', icon: 'IndianRupee' },
    { id: '4', label: 'Premium Villas', link: '#search', icon: 'Home' },
  ],
  band2: [
    { id: '5', label: 'Vijayawada Central', link: '#cities', icon: 'MapPin' },
    { id: '6', label: 'CRDA Approved 🏛️', link: '#properties', icon: 'Award' },
    { id: '7', label: 'Invest in Plots ✨', link: '#search', icon: 'Square' },
    { id: '8', label: '24/7 Expert Support', link: '#contact', icon: 'Phone' },
  ],
};

function MarqueeIcon({ name }) {
  const Icon = ICONS[name];
  return Icon ? <Icon size={14} className="marquee-icon" /> : null;
}

function Band({ items, speed, reverse }) {
  // Normalize items to handle string arrays from malformed backend data
  const normalized = (items || []).map((item, idx) => 
    typeof item === 'string' ? { id: `m-${idx}`, label: item, icon: 'ArrowRight' } : item
  );
  
  if (!normalized.length) return null;
  const repeated = [...normalized, ...normalized, ...normalized, ...normalized];
  
  return (
    <div className="marquee-band-container">
      <div className="marquee-track" style={{ animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }}>
        {repeated.map((item, i) => (
          <a key={`${item.id}-${i}`} href={item.link || '#'} className="marquee-item tilt-3d shimmer-3d">
            {item.icon && <MarqueeIcon name={item.icon} />}
            <span className="marquee-label">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  const [config, setConfig] = useState(DEFAULT);
  
  useEffect(() => {
    fetchSetting('marquee_strips')
      .then(data => { 
        if (data && (data.band1 || data.band2)) {
          setConfig(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="animated-marquee-wrapper">
      <div className="marquee-band marquee-band-1">
        <Band items={config.band1} speed={config.speed1 || 30} reverse={false} />
      </div>
      <div className="marquee-band marquee-band-2">
        <Band items={config.band2} speed={config.speed2 || 35} reverse={true} />
      </div>
    </div>
  );
}
