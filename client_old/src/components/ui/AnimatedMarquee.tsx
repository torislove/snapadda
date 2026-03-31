import { useState, useEffect } from 'react';
import { fetchSetting } from '../../services/api';
import * as Icons from 'lucide-react';
import './AnimatedMarquee.css';

interface MarqueeItem {
  id: string;
  label: string;
  link?: string;
  icon?: string;
}

interface MarqueeSetting {
  band1: MarqueeItem[];
  band2: MarqueeItem[];
  speed1: number;
  speed2: number;
}

const DEFAULT_STRIPS: MarqueeSetting = {
  speed1: 30,
  speed2: 35,
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
  ]
};

// Dynamic Icon Renderer
const DynamicIcon = ({ name }: { name: string }) => {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return null;
  return <IconComponent size={14} className="marquee-icon" />;
};

export const AnimatedMarquee = () => {
  const [settings, setSettings] = useState<MarqueeSetting>(DEFAULT_STRIPS);

  useEffect(() => {
    fetchSetting('marquee_strips')
      .then(data => {
        if (data && data.band1 && data.band1.length > 0) {
          setSettings(data);
        }
      })
      .catch(console.error);
  }, []);

  // For seamless infinite scroll, we duplicate the arrays
  const renderBand = (items: MarqueeItem[], speed: number, direction: 'normal' | 'reverse') => {
    if (!items || items.length === 0) return null;
    
    // Create an array that repeats enough to fill the screen
    const repeatArray = [...items, ...items, ...items, ...items];

    return (
      <div className="marquee-band-container">
        <div 
          className="marquee-track"
          style={{ 
            animationDuration: `${speed}s`,
            animationDirection: direction 
          }}
        >
          {repeatArray.map((item, index) => (
            <a 
              key={`${item.id}-${index}`} 
              href={item.link || '#'} 
              className="marquee-item tilt-3d shimmer-3d"
            >
              {item.icon && <DynamicIcon name={item.icon} />}
              <span className="marquee-label">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animated-marquee-wrapper">
      <div className="marquee-band marquee-band-1">
        {renderBand(settings.band1, settings.speed1 || 30, 'normal')}
      </div>
      <div className="marquee-band marquee-band-2">
        {renderBand(settings.band2, settings.speed2 || 35, 'reverse')}
      </div>
    </div>
  );
};
