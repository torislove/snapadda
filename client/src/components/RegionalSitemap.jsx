import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Search, ArrowRight, Building2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AP_DISTRICTS, searchLocations } from '../utils/LocationData';

// ── Colour palette cycling for districts ─────────────────────────────────────
const ACCENT_COLORS = [
  '#E8B84B', '#10d98c', '#9b59f5', '#3b82f6', '#f43f5e',
  '#f97316', '#06b6d4', '#84cc16', '#ec4899', '#a855f7',
  '#22d3ee', '#fb923c', '#4ade80', '#f472b6', '#60a5fa',
  '#facc15', '#34d399', '#c084fc', '#38bdf8', '#fbbf24',
  '#a3e635', '#e879f9', '#2dd4bf', '#fb7185', '#818cf8'
];

export default function RegionalSitemap() {
  const navigate = useNavigate();
  const [expandedDistrict, setExpandedDistrict] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleDistrictClick = (districtName) => {
    setExpandedDistrict(prev => prev === districtName ? null : districtName);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    setSearchResults(searchLocations(q, 12));
  };

  const handleLocationClick = (location) => {
    navigate(`/search?keyword=${encodeURIComponent(location)}`);
  };

  return (
    <section
      className="regional-sitemap-section"
      style={{
        padding: '4rem 0 5rem',
        background: 'linear-gradient(180deg, rgba(4,6,14,0) 0%, rgba(4,6,14,0.95) 8%, rgba(4,6,14,1) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,184,75,0.04) 0%, transparent 70%)', top: '-10%', left: '20%' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,89,245,0.04) 0%, transparent 70%)', bottom: '5%', right: '10%' }} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '2.5rem', textAlign: 'center' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.2)',
            borderRadius: 40, padding: '6px 16px', marginBottom: '1.25rem',
            fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.15em',
            color: 'var(--gold)', textTransform: 'uppercase'
          }}>
            <MapPin size={11} /> Regional Asset Coverage
          </div>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.5rem)',
            fontWeight: 950, color: 'white', marginBottom: '0.75rem', lineHeight: 1.1
          }}>
            Real Estate in <span style={{ color: 'var(--gold)' }}>Andhra Pradesh</span>
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem',
            maxWidth: 620, margin: '0 auto', lineHeight: 1.6
          }}>
            Explore verified residential, commercial &amp; agricultural properties across every district and mandal.
            SnapAdda provides the most comprehensive asset discovery platform in AP.
          </p>
        </motion.div>

        {/* Smart Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          style={{ maxWidth: 560, margin: '0 auto 3rem', position: 'relative' }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, padding: '12px 20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            transition: 'border-color 0.2s',
          }}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(232,184,75,0.5)'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
          >
            <Search size={16} color="rgba(255,255,255,0.4)" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search any mandal, city or town in AP..."
              style={{
                flex: 1, background: 'transparent', border: 'none',
                color: 'white', fontSize: '0.9rem', outline: 'none'
              }}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0 }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 6, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
                  background: 'rgba(8,10,22,0.97)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 16, padding: '8px 0', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                {searchResults.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => handleLocationClick(loc)}
                    style={{
                      width: '100%', padding: '10px 20px', background: 'none', border: 'none',
                      color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', cursor: 'pointer',
                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,184,75,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <MapPin size={12} color="var(--gold)" style={{ flexShrink: 0 }} />
                    {loc}
                    <ArrowRight size={10} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* District Grid — 3 col desktop / 2 col mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
        }}
          className="regional-districts-grid"
        >
          {AP_DISTRICTS.map((region, idx) => {
            const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
            const isExpanded = expandedDistrict === region.district;

            return (
              <motion.div
                key={region.district}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: idx * 0.03, duration: 0.4 }}
                style={{ gridColumn: isExpanded ? 'span 3' : 'span 1' }}
                className="regional-district-card"
              >
                {/* District Button */}
                <button
                  onClick={() => handleDistrictClick(region.district)}
                  style={{
                    width: '100%', textAlign: 'left', cursor: 'pointer',
                    background: isExpanded
                      ? `linear-gradient(135deg, ${color}18 0%, rgba(4,6,18,0.95) 100%)`
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isExpanded ? color + '50' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: isExpanded ? '20px 20px 0 0' : 20,
                    padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => { if (!isExpanded) { e.currentTarget.style.borderColor = color + '40'; e.currentTarget.style.background = color + '0a'; } }}
                  onMouseLeave={e => { if (!isExpanded) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: `${color}18`, border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Building2 size={15} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.8rem', fontWeight: 800, color: 'white',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {region.district}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                      {region.mandals.length} locations
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChevronDown size={15} color={isExpanded ? color : 'rgba(255,255,255,0.3)'} />
                  </motion.div>
                </button>

                {/* Expanded Mandal Grid */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        background: `linear-gradient(135deg, ${color}0a 0%, rgba(4,6,18,0.98) 100%)`,
                        border: `1px solid ${color}30`,
                        borderTop: 'none',
                        borderRadius: '0 0 20px 20px',
                        padding: '20px',
                      }}>
                        <div style={{
                          fontSize: '0.6rem', fontWeight: 900, color,
                          letterSpacing: '0.15em', textTransform: 'uppercase',
                          marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6
                        }}>
                          <MapPin size={10} />
                          {region.district} — All Locations
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                          gap: '6px'
                        }}>
                          {region.mandals.map(mandal => (
                            <button
                              key={mandal}
                              onClick={() => handleLocationClick(mandal)}
                              style={{
                                padding: '8px 12px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: 10, cursor: 'pointer',
                                color: 'rgba(255,255,255,0.65)',
                                fontSize: '0.78rem', fontWeight: 600,
                                textAlign: 'left', transition: 'all 0.15s',
                                display: 'flex', alignItems: 'center', gap: 6,
                                whiteSpace: 'nowrap', overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = `${color}18`;
                                e.currentTarget.style.borderColor = `${color}40`;
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                              }}
                            >
                              <ArrowRight size={9} style={{ flexShrink: 0, opacity: 0.4 }} />
                              {mandal}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => navigate(`/search?keyword=${encodeURIComponent(region.hq)}`)}
                          style={{
                            marginTop: 16, padding: '10px 20px',
                            background: `${color}18`, border: `1px solid ${color}40`,
                            borderRadius: 12, cursor: 'pointer',
                            color, fontSize: '0.75rem', fontWeight: 900,
                            display: 'flex', alignItems: 'center', gap: 6,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${color}30`; }}
                          onMouseLeave={e => { e.currentTarget.style.background = `${color}18`; }}
                        >
                          View all in {region.district} <ArrowRight size={13} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: '3.5rem', padding: '2rem 2.5rem',
            borderRadius: 24,
            background: 'rgba(232,184,75,0.04)',
            border: '1px solid rgba(232,184,75,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem'
          }}
        >
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>
              Looking for a specific location?
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
              600+ mandals covered. Use our smart search to find exactly what you need.
            </div>
          </div>
          <button
            onClick={() => navigate('/search')}
            style={{
              padding: '12px 28px', background: 'var(--gold)', color: '#000',
              border: 'none', borderRadius: 14, fontWeight: 900, fontSize: '0.82rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              whiteSpace: 'nowrap', boxShadow: '0 6px 20px rgba(232,184,75,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              letterSpacing: '0.05em'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(232,184,75,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(232,184,75,0.3)'; }}
          >
            <Search size={15} /> SMART SEARCH
          </button>
        </motion.div>
      </div>

      {/* Responsive grid CSS */}
      <style>{`
        @media (max-width: 900px) {
          .regional-districts-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .regional-district-card[style*="span 3"] {
            grid-column: span 2 !important;
          }
        }
        @media (max-width: 480px) {
          .regional-districts-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .regional-district-card[style*="span 3"] {
            grid-column: 1 / -1 !important;
          }
        }
      `}</style>
    </section>
  );
}
