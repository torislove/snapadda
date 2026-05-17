import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, FileText, Download, Play, Pause, 
  ExternalLink, Share2, MapPin, Calendar, ShieldCheck,
  CheckCircle2, Info
} from 'lucide-react';
import { fetchPromotionById } from '../services/api';
import Logo from '../components/Logo';
import MediaViewerContainer from '../components/MediaViewerContainer';

export default function PromotionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchPromotionById(id)
      .then(res => {
        if (res.status === 'success') setPromo(res.data);
        else setError('Promotion not found');
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load promotion details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-deep)' }}>
        <div className="elite-shimmer-loader" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error || !promo) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-deep)', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'white', marginBottom: '1rem' }}>{error || 'Promotion not found'}</h2>
        <button onClick={() => navigate('/')} style={{ padding: '0.75rem 2rem', borderRadius: '12px', background: 'var(--gold)', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Back to Home</button>
      </div>
    );
  }

  const isVideo = promo.promotionType === 'video' || promo.videoUrl || (promo.image && promo.image.endsWith('.mp4'));
  const hasPdf = promo.pdfUrl || promo.documentUrl;

  return (
    <div className="promo-detail-page" style={{ minHeight: '100vh', background: 'var(--bg-deep)', color: 'white', paddingBottom: '100px' }}>
      {/* --- Sticky Header --- */}
      <header style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, 
        padding: '1rem', background: 'rgba(5,5,10,0.8)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '1rem'
      }}>
        <button onClick={() => navigate(-1)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gold)' }}>Exclusive Opportunity</h1>
          {promo.title && (
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{promo.title}</div>
          )}
        </div>
        <button onClick={() => {
          if (navigator.share) {
            navigator.share({ title: promo.title || 'Exclusive Opportunity', text: promo.subtitle || '', url: window.location.href });
          }
        }} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Share2 size={18} />
        </button>
      </header>

      {/* --- Hero Media Section --- */}
      <section 
        onClick={() => setViewerOpen(true)}
        style={{ width: '100%', height: (!promo.title && !promo.subtitle) ? '85vh' : '60vh', minHeight: '400px', position: 'relative', marginTop: '60px', overflow: 'hidden', cursor: 'pointer' }}
      >
        {isVideo ? (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <video 
              src={promo.videoUrl || promo.image} 
              autoPlay={videoPlaying} 
              muted 
              loop 
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', zIndex: 10 }}>
              <button 
                onClick={() => setVideoPlaying(!videoPlaying)}
                style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
              >
                {videoPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
              </button>
            </div>
          </div>
        ) : (
          <img src={promo.image} alt={promo.title || 'Exclusive Opportunity'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-deep) 0%, transparent 40%, rgba(0,0,0,0.4) 100%)' }} />
        
        {/* Float Badge */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '1.5rem', zIndex: 10 }}>
          <motion.div 
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            style={{ padding: '0.5rem 1rem', background: 'rgba(232,184,75,0.2)', border: '1px solid var(--gold)', borderRadius: '12px', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ShieldCheck size={16} color="var(--gold)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.05em' }}>VERIFIED INSTITUTIONAL OFFER</span>
          </motion.div>
        </div>
      </section>

      {/* --- Content Area --- */}
      <div className="container" style={{ marginTop: (!promo.title && !promo.subtitle) ? '-6rem' : '-2rem', position: 'relative', zIndex: 20 }}>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(15,18,25,0.8)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', background: 'rgba(15,163,177,0.15)', color: '#2ec4d2', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>{promo.type || 'Exclusive'}</span>
            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>Venture ID: {promo._id?.slice(-6)}</span>
          </div>

          {promo.title && (
            <h2 style={{ fontSize: '2.5rem', fontWeight: 950, lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-0.02em' }}>{promo.title}</h2>
          )}
          {promo.subtitle && (
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '2rem', fontWeight: 500 }}>{promo.subtitle}</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>
                <MapPin size={16} /> <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Location</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>{promo.location || 'Strategic Andhra Region'}</div>
            </div>
            <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>
                <Calendar size={16} /> <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Available Until</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>{promo.expiryDate ? new Date(promo.expiryDate).toLocaleDateString() : 'Limited Time Only'}</div>
            </div>
          </div>

          {/* Description Section */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Info size={20} color="var(--gold)" /> Property Highlights
            </h3>
            <div style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
              {promo.description || "Experience unprecedented luxury and strategic positioning with this exclusive institutional offer. Detailed insights and premium features are available through our verified network partners. Contact us for the complete venture portfolio."}
            </div>
          </div>

          {/* Feature List (if any) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
            {[
              "Institutional Grade Verification",
              "Clear Titles & Legal Assurance",
              "Strategic Growth Corridor",
              "High-Yield Potential Asset"
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', background: 'rgba(39,201,125,0.05)', border: '1px solid rgba(39,201,125,0.1)' }}>
                <CheckCircle2 size={18} color="var(--emerald)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{f}</span>
              </div>
            ))}
          </div>

          {/* --- Document / PDF Section (Auto-Embedded Viewer) --- */}
          {hasPdf && (
            <div style={{ 
              marginTop: '3rem', padding: '2rem', borderRadius: '24px', 
              background: 'rgba(232,184,75,0.02)', border: '1px solid rgba(232,184,75,0.15)',
              display: 'flex', flexDirection: 'column', gap: '1.5rem'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                    <FileText size={28} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Venture Brochure & Plans</h4>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Complete details in institutional PDF format</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => setViewerOpen(true)}
                    style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'white', color: 'black', textDecoration: 'none', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', border: 'none', cursor: 'pointer' }}
                  >
                    <ExternalLink size={14} /> FULL SCREEN
                  </button>
                  <a 
                    href={promo.pdfUrl || promo.documentUrl} 
                    download
                    style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Download size={14} /> DOWNLOAD
                  </a>
                </div>
              </div>

              {/* Automatic PDF Page Embed Reader */}
              <div style={{ 
                width: '100%', height: '650px', borderRadius: '16px', overflow: 'hidden', 
                background: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', position: 'relative'
              }}>
                <iframe 
                  src={`${promo.pdfUrl || promo.documentUrl}#toolbar=0`}
                  title="Brochure PDF Viewer"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Sticky CTA Bar --- */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        padding: '1.5rem', background: 'rgba(5,5,10,0.85)', backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '600px', display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/request-callback')}
            style={{ flex: 1, padding: '1rem', borderRadius: '16px', background: 'var(--gold)', color: 'black', border: 'none', fontWeight: 950, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(232,184,75,0.3)' }}
          >
            INTERESTED? CONTACT AGENT
          </button>
        </div>
      </div>

      <MediaViewerContainer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        promotionType={promo.promotionType || 'photo'}
        image={promo.image || ''}
        videoUrl={promo.videoUrl || ''}
        pdfUrl={promo.pdfUrl || promo.documentUrl || ''}
        title={promo.title || ''}
        description={promo.description || ''}
        mediaSettings={promo.mediaSettings || []}
      />
    </div>
  );
}
