import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Phone, Send, CheckCircle2, Navigation2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProperties, submitLead } from '../services/api';
import PropertyCard from '../components/PropertyCard';

export default function RequestPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    purpose: 'Sale',
    propertyType: 'Apartment',
    requirements: ''
  });
  const [nearby, setNearby] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setLoadingNearby(true);
    fetchProperties({ limit: 4 })
      .then(res => {
        setNearby(res?.data || []);
        setLoadingNearby(false);
      })
      .catch(() => setLoadingNearby(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const message = `Purpose: ${formData.purpose} | Type: ${formData.propertyType} | Requirements: ${formData.requirements || 'N/A'}`;
      await submitLead({
        name: formData.name,
        phone: formData.phone,
        message: message,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to submit Elite Request Lead:', err);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="elite-request-container" style={{ minHeight: '100vh', backgroundColor: '#05050a', color: '#fff' }}>
      {/* Back Header */}
      <header style={{ 
        position: 'sticky', top: 'var(--nav-h, 74px)', zIndex: 100, 
        padding: '1rem 5%', background: 'rgba(5,5,10,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <button onClick={() => navigate(-1)} className="btn-3d-elite" style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
          <ArrowLeft size={16} /> BACK TO SEARCH
        </button>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '2px' }}>ELITE REQUEST PORTAL</div>
      </header>

      <main style={{ padding: '3rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4rem' }}>
          
          {/* Centered Sticky Form Card */}
          <div style={{ width: '100%', maxWidth: '480px' }}>
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <div className="request-glass-card">
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                      <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#fff', fontFamily: 'var(--font-serif)' }}>
                        Elite <span style={{ color: 'var(--gold)' }}>Callback</span>
                      </h1>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', letterSpacing: '0.02em' }}>Precision matching for your property needs.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div className="request-input-group">
                        <label className="request-label">Your Name</label>
                        <div style={{ position: 'relative' }}>
                          <input required type="text" className="request-input" placeholder="Enter Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                          <User size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, color: 'var(--gold)' }} />
                        </div>
                      </div>

                      <div className="request-input-group">
                        <label className="request-label">Phone Number</label>
                        <div style={{ position: 'relative' }}>
                          <input required type="tel" className="request-input" placeholder="+91" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                          <Phone size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, color: 'var(--gold)' }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
                        <div>
                          <label className="request-label">Purpose</label>
                          <select className="request-input" value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })}>
                            <option>Sale</option><option>Rent</option><option>Lease</option>
                          </select>
                        </div>
                        <div>
                          <label className="request-label">Type</label>
                          <select className="request-input" value={formData.propertyType} onChange={e => setFormData({ ...formData, propertyType: e.target.value })}>
                            <option>Apartment</option><option>Plot</option><option>Villa</option><option>Agricultural</option><option>Commercial</option>
                          </select>
                        </div>
                      </div>

                      <div className="request-input-group">
                        <label className="request-label">Special Requirements</label>
                        <textarea 
                          className="request-input" 
                          style={{ minHeight: '120px', resize: 'none' }}
                          placeholder="e.g., East facing, CRDA approved, Near Highway..."
                          value={formData.requirements}
                          onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                        />
                      </div>

                      <button type="submit" className="request-btn-submit">
                        <Send size={18} style={{ marginRight: '10px' }} /> SEND REQUEST
                      </button>
                    </form>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                   key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                   className="request-glass-card" 
                   style={{ textAlign: 'center' }}
                >
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,217,140,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                    <CheckCircle2 size={40} style={{ color: '#10d98c' }} />
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>Request Logged</h2>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6 }}>Our senior consultants will analyze your requirements and call you shortly for a precision match.</p>
                  <button onClick={() => navigate('/')} className="request-btn-submit" style={{ marginTop: '2.5rem', width: 'auto', padding: '1rem 3rem' }}>RETURN HOME</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nearby Section */}
          <section style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <Navigation2 size={24} className="text-gold" />
                EXPLORE NEARBY <span style={{ color: 'var(--gold)', opacity: 0.5 }}>• REGIONAL HOTSPOTS</span>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {loadingNearby ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '350px', borderRadius: '28px' }} />) 
              : nearby.map((item, idx) => (
                <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: idx * 0.1 }}>
                  <PropertyCard {...item} />
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
