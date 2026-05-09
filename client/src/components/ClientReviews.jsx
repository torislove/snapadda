import { useState, useEffect, useRef } from 'react';
import { Star, Quote, MapPin } from 'lucide-react';

export default function ClientReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => {
        const list = data?.data || (Array.isArray(data) ? data : []);
        setReviews(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (trackRef.current && reviews.length > 0) {
      setTrackWidth(trackRef.current.scrollWidth / 3);
    }
  }, [reviews]);

  if (loading || reviews.length === 0) return null;

  // Pause helpers
  const pause = () => setPaused(true);
  const resume = () => setPaused(false);

  return (
    <section className="section-wrap" style={{ 
      padding: '6rem 0', 
      background: 'linear-gradient(to bottom, transparent, rgba(212,175,55,0.03), transparent)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Decorative background elements */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'var(--gold)', opacity: 0.03, filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '300px', height: '300px', background: 'var(--cyan)', opacity: 0.03, filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative', zIndex: 5 }}>
        <div className="section-head" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div
            className="section-eyebrow"
            style={{ color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.1)', padding: '6px 16px', borderRadius: '20px', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '1px' }}
          >
            <Star size={12} fill="var(--gold)" /> TRUSTED BY THOUSANDS
          </div>
          <h2 className="section-title" style={{ color: '#ffffff', marginTop: '1.5rem', fontSize: '2.5rem' }}>What Our Clients Say</h2>
          <p className="section-subtitle" style={{ color: 'var(--txt-secondary)', maxWidth: '600px', margin: '1rem auto 0' }}>
            Experience the SnapAdda difference through the eyes of our successful investors and homeowners.
          </p>
        </div>
      </div>

      <div
        style={{ position: 'relative', width: '100%' }}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
      >
        {/* Edge Fades */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', background: 'linear-gradient(to right, var(--bg-deep) 0%, transparent 15%, transparent 85%, var(--bg-deep) 100%)' }} />

        {/* Marquee track — CSS animation for reliable pause */}
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: '2.5rem',
            width: 'max-content',
            padding: '1rem 2rem',
            animation: `snapadda-marquee 160s linear infinite`,
            animationPlayState: paused ? 'paused' : 'running',
            willChange: 'transform',
          }}
        >
          {[...reviews, ...reviews, ...reviews].map((r, i) => (
            <div
              key={`${r._id}-${i}`}
              className="review-card glass-premium"
              style={{
                width: '420px',
                padding: '2.5rem',
                borderRadius: '32px',
                border: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(10,12,20,0.6)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                position: 'relative',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                flexShrink: 0,
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 28px 55px rgba(0,0,0,0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
              }}
            >
              <Quote size={48} style={{ color: 'rgba(212,175,55,0.05)', position: 'absolute', top: '2rem', right: '2rem' }} />
              
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array(5).fill(0).map((_, idx) => (
                  <Star
                    key={idx}
                    size={14}
                    fill={idx < (r.rating || 5) ? "var(--gold)" : "transparent"}
                    color={idx < (r.rating || 5) ? "var(--gold)" : "rgba(255,255,255,0.1)"}
                  />
                ))}
              </div>
              
              <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.05rem', lineHeight: '1.7', flex: 1, fontWeight: 500 }}>
                &ldquo;{r.text}&rdquo;
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem' }}>
                <div style={{ position: 'relative' }}>
                  {r.image ? (
                    <img src={r.image} alt={r.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }} />
                  ) : (
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--gold), #f5c842)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--midnight)', fontSize: '1.4rem' }}>
                      {(r.name || 'U').charAt(0)}
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: -2, right: -2, background: 'var(--emerald)', width: '16px', height: '16px', borderRadius: '50%', border: '3px solid #0a0c14' }} title="Verified Review" />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.5px' }}>{r.name}</div>
                  {r.location && (
                    <div style={{ color: 'var(--txt-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <MapPin size={12} style={{ color: 'var(--gold)' }} /> {r.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keyframe definition — injected once */}
      <style>{`
        @keyframes snapadda-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
}
