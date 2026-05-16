import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, ArrowRight, Building2, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { AP_DISTRICTS } from '../utils/LocationData';

export default function RegionalDirectory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDistricts = AP_DISTRICTS.filter(d => 
    d.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.mandals.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="regional-directory-page" style={{ background: '#020408', minHeight: '100vh', padding: '6rem 0' }}>
      <SEO 
        title="Andhra Pradesh Real Estate Directory | All Districts & Mandals"
        description="Explore verified real estate opportunities across all 26 districts and 600+ mandals of Andhra Pradesh. SnapAdda provides the most comprehensive regional property coverage."
        keywords={['AP Real Estate Directory', 'Andhra Pradesh Mandals', 'District wise properties', 'Amaravati Real Estate Hub']}
      />

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '8px', 
              background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.2)',
              borderRadius: '40px', padding: '8px 20px', color: 'var(--gold)',
              fontSize: '0.75rem', fontWeight: 900, marginBottom: '1.5rem',
              letterSpacing: '0.1em', textTransform: 'uppercase'
            }}
          >
            <MapPin size={14} /> Institutional Regional Registry
          </motion.div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 950, color: 'white', marginBottom: '1.5rem' }}>
            Andhra Pradesh <span style={{ color: 'var(--gold)' }}>Property Network</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
            Browse institutional-grade real estate across every mandal and district in the state. 
            All locations are verified and audited for registry accuracy.
          </p>

          {/* Search Bar */}
          <div style={{ maxWidth: '600px', margin: '3rem auto 0', position: 'relative' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '15px'
            }}>
              <Search size={20} color="var(--gold)" />
              <input 
                type="text" 
                placeholder="Search for a district or mandal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1rem', flex: 1, outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
          {filteredDistricts.map((district, idx) => (
            <motion.div
              key={district.district}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.02 }}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '24px',
                padding: '2rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
              whileHover={{ 
                y: -5, 
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(232,184,75,0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '45px', height: '45px', borderRadius: '14px', 
                  background: 'rgba(232,184,75,0.1)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' 
                }}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', margin: 0 }}>{district.district}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px', fontWeight: 700 }}>
                    HQ: {district.hq} • {district.mandals.length} Mandals
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {district.mandals.slice(0, 6).map(mandal => (
                  <Link 
                    key={mandal}
                    to={`/search?keyword=${encodeURIComponent(mandal)}`}
                    style={{
                      fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)',
                      textDecoration: 'none', display: 'flex', alignItems: 'center',
                      gap: '6px', transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--gold)'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}
                  >
                    <ChevronRight size={10} /> {mandal}
                  </Link>
                ))}
                {district.mandals.length > 6 && (
                  <Link 
                    to={`/search?keyword=${encodeURIComponent(district.district)}`}
                    style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    + {district.mandals.length - 6} More
                  </Link>
                )}
              </div>

              <button 
                onClick={() => navigate(`/search?keyword=${encodeURIComponent(district.district)}`)}
                style={{
                  marginTop: '1.5rem', width: '100%', padding: '12px',
                  background: 'rgba(255,255,255,0.05)', border: 'none',
                  borderRadius: '12px', color: 'white', fontSize: '0.8rem',
                  fontWeight: 900, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                EXPLORE {district.hq.toUpperCase()} <ArrowRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
