import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, ChevronRight, Sparkles } from 'lucide-react';
import { getFuzzySuggestions, loadAndhraData } from '../services/SearchParser';

const LocationAutocomplete = ({ value, onChange, placeholder = "City, Mandal, or Village...", onSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    loadAndhraData(); // Ensure data is loaded
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setShow(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = async (val) => {
    onChange(val);
    
    // Check if it's a 6-digit pincode
    if (/^\d{6}$/.test(val)) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data[0]?.Status === 'Success' && data[0].PostOffice?.length) {
          const poResults = data[0].PostOffice.map((po) => ({
            name: po.Name,
            district: po.District,
            mandal: po.Block !== 'NA' ? po.Block : po.Name,
            state: po.State,
            pincode: val,
            type: 'Village / Post Office'
          }));
          setSuggestions(poResults);
          setShow(true);
          return;
        }
      } catch (err) {
        console.error("Pincode API failed in autocomplete:", err);
      }
    }

    if (val.length >= 2) {
      const results = getFuzzySuggestions(val);
      setSuggestions(results);
      setShow(results.length > 0);
    } else {
      setSuggestions([]);
      setShow(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <input 
          type="text" 
          value={value} 
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => value.length >= 2 && setShow(suggestions.length > 0)}
          placeholder={placeholder}
          className="elite-input"
          style={{ paddingLeft: '44px' }}
        />
        <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
      </div>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="glass-premium"
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
              zIndex: 1000, borderRadius: '16px', overflow: 'hidden',
              background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
          >
            {suggestions.map((loc, i) => (
              <div 
                key={i}
                onClick={() => {
                  onSelect(loc);
                  setShow(false);
                }}
                style={{
                  padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', borderBottom: i === suggestions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(232,184,75,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Search size={14} style={{ color: 'var(--gold)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{loc.name} {loc.pincode && <span style={{ color: 'var(--gold)', fontSize: '0.8rem', marginLeft: '4px' }}>- {loc.pincode}</span>}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                      {loc.type} {loc.district ? `• ${loc.district}` : ''} {loc.mandal ? `• ${loc.mandal}` : ''}
                    </div>
                  </div>

                </div>
                <ChevronRight size={14} style={{ opacity: 0.2 }} />
              </div>
            ))}
            <div style={{ padding: '8px 20px', background: 'rgba(232,184,75,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={12} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>AI Powered Location Intelligence</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(LocationAutocomplete);
