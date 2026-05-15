import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ShieldCheck, Star, Phone, MessageSquare, Building, LayoutGrid, Users } from 'lucide-react';
import { fetchProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { useSEO } from '../utils/useSEO';

export default function LocalAgency() {
  const { city } = useParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supportInfo, setSupportInfo] = useState({ phone: '+91 93467 93364', whatsapp: '919346793364' });

  useEffect(() => {
    import('../services/api').then(api => {
      api.fetchSetting('marketing_settings').then(data => {
        if (data) setSupportInfo({
          phone: data.supportPhone,
          whatsapp: data.waNumber
        });
      });
    });
  }, []);

  // Dynamic SEO for the City
  useSEO({
    title: `Best Real Estate Agency in ${city} | SnapAdda™ Verified Properties`,
    description: `SnapAdda is the #1 real estate agency in ${city}, Andhra Pradesh. Find verified plots, apartments, and villas near you with institutional-grade security.`,
    keywords: `real estate agency in ${city}, best real estate near me, snapadda ${city}, properties in ${city}, real estate agents ${city}`,
    canonical: `https://snapadda.com/local-agency/${city}`
  });

  useEffect(() => {
    setLoading(true);
    fetchProperties({ city, limit: 6 })
      .then(res => {
        setProperties(res?.data || (Array.isArray(res) ? res : []));
      })
      .finally(() => setLoading(false));
  }, [city]);

  return (
    <div className="local-agency-page" style={{ paddingTop: 'var(--nav-h)', background: 'var(--bg-deep)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{ padding: '4rem 0', background: 'linear-gradient(180deg, rgba(232,184,75,0.05) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="section-eyebrow" style={{ color: 'var(--gold)' }}>
              <MapPin size={14} style={{ marginRight: '6px' }} /> Certified Agency in {city}
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'white', marginBottom: '1.5rem', lineHeight: 1.1 }}>
              SnapAdda™: The Best Real Estate <br /> <span style={{ color: 'var(--gold)' }}>Agency in {city}</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--txt-secondary)', maxWidth: '800px', lineHeight: 1.6 }}>
              Serving the {city} region with verified institutional-grade property listings. Whether you're looking for plots, 
              luxury villas, or modern apartments, SnapAdda is your trusted local partner in Andhra Pradesh.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(16,217,140,0.1)', padding: '12px 24px', borderRadius: '14px', border: '1px solid rgba(16,217,140,0.2)', color: '#10d98c', fontWeight: 800, fontSize: '0.9rem' }}>
                ✓ Verified Assets
              </div>
              <div style={{ background: 'rgba(34,217,224,0.1)', padding: '12px 24px', borderRadius: '14px', border: '1px solid rgba(34,217,224,0.2)', color: 'var(--cyan)', fontWeight: 800, fontSize: '0.9rem' }}>
                ✓ Transparent Pricing
              </div>
              <div style={{ background: 'rgba(245,200,66,0.1)', padding: '12px 24px', borderRadius: '14px', border: '1px solid rgba(245,200,66,0.2)', color: 'var(--gold)', fontWeight: 800, fontSize: '0.9rem' }}>
                ✓ Local Expertise
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured in City */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', color: 'white', fontWeight: 900 }}>Featured Properties in {city}</h2>
            <Link to={`/search?city=${city}`} style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              VIEW ALL <LayoutGrid size={18} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} style={{ height: '400px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', animation: 'pulse 2s infinite' }} />
              ))
            ) : properties.length > 0 ? (
              properties.map(p => <PropertyCard key={p._id} {...p} />)
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
                <p style={{ color: 'var(--txt-secondary)' }}>No live listings in {city} right now. Contact our agent for off-market deals.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust & Stats */}
      <section style={{ padding: '4rem 0', background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="glass-premium" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Users size={32} color="var(--gold)" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ color: 'white', fontSize: '1.4rem', marginBottom: '1rem' }}>Local Network</h3>
              <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem' }}>We have the largest network of verified sellers and buyers in {city}.</p>
            </div>
            <div className="glass-premium" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <ShieldCheck size={32} color="#10d98c" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ color: 'white', fontSize: '1.4rem', marginBottom: '1rem' }}>Institutional Verification</h3>
              <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem' }}>Every property in {city} undergoes a 12-point document verification process.</p>
            </div>
            <div className="glass-premium" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Star size={32} color="#22d9e0" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ color: 'white', fontSize: '1.4rem', marginBottom: '1rem' }}>5-Star Service</h3>
              <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem' }}>Our dedicated {city} relationship managers are available 24/7 for site visits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <div className="glass-heavy" style={{ padding: '4rem 2rem', borderRadius: '32px', textAlign: 'center', border: '1px solid var(--gold)', boxShadow: '0 0 50px rgba(232,184,75,0.1)' }}>
            <h2 style={{ fontSize: '2.5rem', color: 'white', fontWeight: 900, marginBottom: '1.5rem' }}>Talk to our {city} Expert</h2>
            <p style={{ color: 'var(--txt-secondary)', fontSize: '1.1rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
              Get a free consultation on market values and upcoming projects in {city}.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`tel:${supportInfo.phone.replace(/\s+/g, '')}`} style={{ background: 'var(--gold)', color: 'black', padding: '1rem 3rem', borderRadius: '12px', fontWeight: 900, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={20} /> CALL AGENCY
              </a>
              <a href={`https://wa.me/${supportInfo.whatsapp}?text=${encodeURIComponent(`Hi SnapAdda, I'm interested in properties in ${city}.`)}`} style={{ background: '#25D366', color: 'white', padding: '1rem 3rem', borderRadius: '12px', fontWeight: 900, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageSquare size={20} /> WHATSAPP
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
