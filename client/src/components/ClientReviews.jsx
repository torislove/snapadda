import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, MapPin, X } from 'lucide-react';
import { fetchSetting } from '../services/api';

export default function ClientReviews({ testimonials = [] }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [speed, setSpeed] = useState(100);

  useEffect(() => {
    fetchSetting('marquee_strips')
      .then(res => {
        if (res && res.reviewsSpeed) setSpeed(res.reviewsSpeed);
      })
      .catch(() => {});
  }, []);

  const FALLBACK_REVIEWS = [
    { id: 'f1', name: 'Ravi Teja', role: 'Investor', text: 'SnapAdda made my land investment in Amaravati seamless. Truly professional.', avatar: 'RT' },
    { id: 'f2', name: 'Anitha Rao', role: 'Home Buyer', text: 'Found our dream villa in Visakhapatnam. The verification status gave us peace of mind.', avatar: 'AR' },
    { id: 'f3', name: 'Kalyan Chakravarthy', role: 'Business Owner', text: 'The best platform for commercial properties in Vijayawada. Highly recommended.', avatar: 'KC' }
  ];

  useEffect(() => {
    // If props provided, use them immediately
    if (testimonials && testimonials.length > 0) {
      setReviews(testimonials);
      setLoading(false);
      return;
    }

    // Otherwise fetch or use fallbacks
    const loadTestimonials = async () => {
      try {
        const res = await fetch('/api/testimonials');
        if (!res.ok) throw new Error('API down');
        const data = await res.json();
        const finalData = (data.data && data.data.length > 0) ? data.data : FALLBACK_REVIEWS;
        setReviews(finalData);
      } catch (err) {
        console.warn('Using fallback testimonials');
        setReviews(FALLBACK_REVIEWS);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, [testimonials]);

  useEffect(() => {
    if (trackRef.current && reviews.length > 0) {
      setTrackWidth(trackRef.current.scrollWidth / 3);
    }
  }, [reviews]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0', textAlign: 'center' }}>
        <div className="pulse-primary" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gold)', margin: '0 auto' }} />
        <p style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 800, marginTop: '1rem', letterSpacing: '0.1em' }}>GATHERING SUCCESS STORIES...</p>
      </div>
    );
  }

  if (reviews.length === 0) return null;

  // Pause helpers
  const pause = () => setPaused(true);
  const resume = () => setPaused(false);

  return (
    <section className="section-wrap" style={{ 
      padding: '1.5rem 0', 
      background: 'linear-gradient(to bottom, transparent, rgba(212,175,55,0.03), transparent)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Decorative background elements */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'var(--gold)', opacity: 0.03, filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '300px', height: '300px', background: 'var(--cyan)', opacity: 0.03, filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative', zIndex: 5 }}>
        <div className="section-head" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            className="section-eyebrow"
            style={{ color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.1)', padding: '4px 12px', borderRadius: '20px', fontWeight: 800, fontSize: '0.65rem', letterSpacing: '1px' }}
          >
            <Star size={10} fill="var(--gold)" /> TRUSTED BY THOUSANDS
          </div>
          <h2 className="section-title" style={{ color: '#ffffff', marginTop: '0.75rem', fontSize: '1.5rem' }}>What Our Clients Say</h2>
          <p className="section-subtitle" style={{ color: 'var(--txt-secondary)', maxWidth: '550px', margin: '0.5rem auto 0', fontSize: '0.85rem' }}>
            Experience the SnapAdda difference through the eyes of our successful investors and homeowners.
          </p>
        </div>
      </div>

      <div
        style={{ position: 'relative', width: '100%', minHeight: '320px' }}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
      >
        {/* Edge Fades */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', background: 'linear-gradient(to right, var(--bg-deep) 0%, transparent 15%, transparent 85%, var(--bg-deep) 100%)' }} />

        {/* Marquee track — Framer Motion for stability */}
        <motion.div
          ref={trackRef}
          animate={paused ? {} : { x: ['0%', '-25%'] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: speed,
              ease: "linear",
            },
          }}
          style={{
            display: 'flex',
            gap: '1.5rem',
            width: 'max-content',
            padding: '1rem',
          }}
        >
          {[...reviews, ...reviews, ...reviews, ...reviews].map((r, i) => (
            <div
              key={`${r._id}-${i}`}
              className="review-card glass-premium"
              style={{
                width: '260px',
                padding: '1.25rem',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(10,12,20,0.6)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                position: 'relative',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                flexShrink: 0,
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedReview(r)}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 20px 45px rgba(0,0,0,0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)';
              }}
            >
              <Quote size={24} style={{ color: 'rgba(212,175,55,0.05)', position: 'absolute', top: '1.25rem', right: '1.25rem' }} />
              
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array(5).fill(0).map((_, idx) => (
                  <Star
                    key={idx}
                    size={12}
                    fill={idx < (r.rating || 5) ? "var(--gold)" : "transparent"}
                    color={idx < (r.rating || 5) ? "var(--gold)" : "rgba(255,255,255,0.1)"}
                  />
                ))}
              </div>
              
              <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.9rem', lineHeight: '1.6', flex: 1, fontWeight: 500 }}>
                &ldquo;{r.text}&rdquo;
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                <div style={{ position: 'relative' }}>
                  {r.image ? (
                    <img src={r.image} alt={r.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--gold), #f5c842)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--midnight)', fontSize: '1.2rem' }}>
                      {(r.name || 'U').charAt(0)}
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: -1, right: -1, background: 'var(--emerald)', width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #0a0c14' }} title="Verified Review" />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.5px' }}>{r.name}</div>
                  {r.location && (
                    <div style={{ color: 'var(--txt-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={10} style={{ color: 'var(--gold)' }} /> {r.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(5, 5, 10, 0.8)', backdropFilter: 'blur(10px)'
        }} onClick={() => setSelectedReview(null)}>
          <div style={{
            width: '90%', maxWidth: '500px', background: 'var(--bg-panel)', border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '24px', padding: '2rem', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedReview(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', color: 'white' }}
            >
              <X size={16} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              {selectedReview.image ? (
                <img src={selectedReview.image} alt={selectedReview.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }} />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--gold), #f5c842)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--midnight)', fontSize: '1.8rem' }}>
                  {(selectedReview.name || 'U').charAt(0)}
                </div>
              )}
              <div>
                <div style={{ color: 'white', fontWeight: 900, fontSize: '1.2rem' }}>{selectedReview.name}</div>
                {selectedReview.location && (
                  <div style={{ color: 'var(--txt-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <MapPin size={12} style={{ color: 'var(--gold)' }} /> {selectedReview.location}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
              {Array(5).fill(0).map((_, idx) => (
                <Star key={idx} size={16} fill={idx < (selectedReview.rating || 5) ? "var(--gold)" : "transparent"} color={idx < (selectedReview.rating || 5) ? "var(--gold)" : "rgba(255,255,255,0.1)"} />
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.1rem', lineHeight: '1.8', fontWeight: 500 }}>
              &ldquo;{selectedReview.text}&rdquo;
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
