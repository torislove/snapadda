import { useState, useEffect } from 'react';
import { Landmark, ShieldCheck, IndianRupee, Home, CheckCircle2, MapPin, Award, Square, Compass, Building2 } from 'lucide-react';
import { fetchSetting } from '../services/api';

const ICONS = { Landmark, ShieldCheck, IndianRupee, Home, CheckCircle2, MapPin, Award, Square, Compass, Building2 };

const DEFAULT = {
  speed1: 30, speed2: 35,
  band1: [
    { id: '1', label: 'Amaravati Region', link: '#cities', icon: 'Landmark' },
    { id: '2', label: 'Verified Listings ✅', link: '#properties', icon: 'ShieldCheck' },
    { id: '3', label: 'Under 50 Lakhs 🔥', link: '#search', icon: 'IndianRupee' },
    { id: '4', label: 'Premium Villas', link: '#search', icon: 'Home' },
    { id: '5', label: 'Zero Brokerage', link: '#contact', icon: 'CheckCircle2' },
  ],
  band2: [
    { id: '6', label: 'Vijayawada Central', link: '#cities', icon: 'MapPin' },
    { id: '7', label: 'CRDA Approved 🏛️', link: '#properties', icon: 'Award' },
    { id: '8', label: 'Invest in Plots ✨', link: '#search', icon: 'Square' },
    { id: '9', label: 'East Facing Homes 🧭', link: '#search', icon: 'Compass' },
    { id: '10', label: 'Guntur Tech Park', link: '#cities', icon: 'Building2' },
  ],
};

function MarqueeIcon({ name }) {
  const Icon = ICONS[name];
  return Icon ? <Icon size={14} className="marquee-icon" /> : null;
}

function Band({ items, speed, reverse }) {
  if (!items?.length) return null;
  const repeated = [...items, ...items, ...items, ...items];
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
      .then(data => { if (data?.band1?.length > 0) setConfig(data); })
      .catch(console.error);
  }, []);

  return (
    <div className="animated-marquee-wrapper">
      <div className="marquee-band marquee-band-1"><Band items={config.band1} speed={config.speed1 || 30} reverse={false} /></div>
      <div className="marquee-band marquee-band-2"><Band items={config.band2} speed={config.speed2 || 35} reverse={true} /></div>
    </div>
  );
}
