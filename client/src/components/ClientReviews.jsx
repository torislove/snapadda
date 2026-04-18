import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, MapPin } from 'lucide-react';

export default function ClientReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => {
        setReviews(data?.data || (Array.isArray(data) ? data : []));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <section className="section-wrap" style={{ padding: '4rem 0', background: 'rgba(212,175,55,0.02)', borderTop: '1px solid rgba(212,175,55,0.05)', borderBottom: '1px solid rgba(212,175,55,0.05)' }}>
      <div className="container">
        <div className="section-head" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="section-eyebrow" style={{ color: 'var(--gold)' }}><Star size={14} fill="currentColor" /> EXPERIENCES</div>
          <h2 className="section-title" style={{ color: '#ffffff' }}>What Our Clients Say</h2>
          <p className="section-subtitle" style={{ color: 'var(--txt-secondary)' }}>
            Real reviews from property buyers, sellers, and investors across Andhra Pradesh.
          </p>
        </div>

        <div className="reviews-scroller" style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '2rem', 
          paddingBottom: '2rem',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none', // Firefox
          WebkitOverflowScrolling: 'touch'
        }}>
          <style>{`.reviews-scroller::-webkit-scrollbar { display: none; }`}</style>
          
          {reviews.map((r, i) => (
            <motion.div 
              key={r._id || i}
              className="review-card glass-heavy"
              style={{
                flex: '0 0 calc(90vw - 2rem)',
                maxWidth: '400px',
                scrollSnapAlign: 'start',
                padding: '2rem',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                borderTop: `2px solid ${r.color || 'var(--gold)'}`
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Quote size={32} style={{ color: 'rgba(255,255,255,0.1)' }} />
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array(r.rating || 5).fill(0).map((_, idx) => (
                    <Star key={idx} size={14} fill="var(--gold)" color="var(--gold)" />
                  ))}
                </div>
              </div>
              
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem', lineHeight: '1.6', flex: 1, fontStyle: 'italic' }}>
                "{r.text}"
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {r.image ? (
                  <img src={r.image} alt={r.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--gold)', fontSize: '1.2rem' }}>
                    {r.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem' }}>{r.name}</div>
                  {r.location && (
                    <div style={{ color: 'var(--txt-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={10} /> {r.location}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
