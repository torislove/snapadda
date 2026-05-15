import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchSetting('marquee_strips')
      .then(data => {
        if (data && (data.band1 || data.band2)) {
          const merged = [...(data.band1 || DEFAULT.band1), ...(data.band2 || [])];
          setConfig(prev => ({ ...prev, band1: merged.length > 0 ? merged : prev.band1 }));
        }
      })
      .catch(() => {});
  }, []);

  const items = config.band1 || DEFAULT.band1;
  const repeated = [...items, ...items, ...items, ...items];

  if (!ready) return <div style={{ height: '40px', background: 'rgba(5, 5, 10, 0.6)' }} />;

  return (
    <div className="animated-marquee-wrapper">
      <div className="marquee-band-container">
        <motion.div
          className="marquee-track"
          animate={{ x: ['0%', '-25%'] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: config.speed1 || 28,
              ease: "linear",
            },
          }}
          style={{ display: 'flex', width: 'max-content' }}
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
        </motion.div>
      </div>
    </div>
  );
}
