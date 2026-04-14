import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Share2, Heart, ShieldCheck, Phone, MessageSquare,
  ChevronLeft, ChevronRight, Eye, CheckCircle2, Building2, User,
  BedDouble, Bath, Square, Compass, Award, Send, Star, Leaf, Maximize2,
  Droplets, Truck, FileText, ZoomIn, X, TreePine, TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchProperty, fetchSetting, askQuestion, fetchPropertyFAQs, likeProperty, shareProperty } from '../services/api';
import { formatSnapAddaPrice, formatLandSize, calcAgriTotalValue, getAcres, getCents } from '../utils/priceUtils';
import { useTranslation } from 'react-i18next';

// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────
function Toast({ msg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      style={{
        position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(10,10,20,0.97)', border: '1px solid rgba(232,184,75,0.3)',
        color: '#e8b84b', padding: '12px 24px', borderRadius: '40px',
        fontSize: '0.85rem', fontWeight: 700, zIndex: 99999,
        backdropFilter: 'blur(30px)', boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
        whiteSpace: 'nowrap',
      }}
    >{msg}</motion.div>
  );
}

// ─────────────────────────────────────────────
// LightBox
// ─────────────────────────────────────────────
function LightBox({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '44px', height: '44px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <X size={20}/>
      </button>
      <button onClick={(e) => { e.stopPropagation(); prev(); }}
        style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '52px', height: '52px', borderRadius: '50%', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ChevronLeft size={28}/>
      </button>
      <img src={images[idx]} alt="" style={{ maxWidth: '90vw', maxHeight: '86vh', objectFit: 'contain', borderRadius: '12px' }} onClick={e => e.stopPropagation()} />
      <button onClick={(e) => { e.stopPropagation(); next(); }}
        style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '52px', height: '52px', borderRadius: '50%', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ChevronRight size={28}/>
      </button>
      <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
        {idx + 1} / {images.length}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Spec Card
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// Spec Card
// ─────────────────────────────────────────────
function SpecCard({ label, value, accent = 'rgba(255,255,255,0.6)', icon }) {
  if (!value || value === 'N/A' || value === '0') return null;
  return (
    <div className="pd-spec-item" style={{ '--ov-accent': accent }}>
      <div className="pd-spec-lbl">
        {icon} {label}
      </div>
      <div className="pd-spec-val" style={{ color: accent }}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [qna, setQna] = useState([]);
  const [supportInfo, setSupportInfo] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [toast, setToast] = useState('');
  const galleryRef = useRef(null);

  // Q&A
  const [qText, setQText] = useState('');
  const [qStatus, setQStatus] = useState('');
  const [qSubmitting, setQSubmitting] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    fetchProperty(id)
      .then(res => {
        const data = res.data || res;
        setProperty(data);
        setLikeCount(data.likeCount || 0);
        setLiked(data.isLiked || false);
        // Recent views
        try {
          const arr = JSON.parse(localStorage.getItem('snapadda_recent_views') || '[]');
          const filtered = arr.filter(p => p._id !== data._id);
          filtered.unshift({ _id: data._id, title: data.title, price: data.price, location: data.location, type: data.type, image: data.images?.[0] || data.image });
          localStorage.setItem('snapadda_recent_views', JSON.stringify(filtered.slice(0, 6)));
        } catch {}
      })
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));

    fetchPropertyFAQs(id).then(setQna).catch(() => setQna([]));
    fetchSetting('support_info').then(setSupportInfo).catch(console.error);
    
    // Sync Metadata for Search/Social
    if (property) {
      document.title = `${property.title} | ${property.type} in ${property.location} | SnapAdda`;
    }
  }, [id]);

  const property_images = property?.images?.length
    ? property.images
    : [property?.image, ...(property?.gallery || [])].filter(Boolean);

  const isAgri = property?.type === 'Agricultural Land';
  const isPlot = property?.type?.includes('Plot');
  const isResidential = ['Apartment', 'Villa', 'Independent House', 'Farmhouse'].includes(property?.type);

  const agriAcres = getAcres(property?.totalAcres);
  const agriCents = getCents(property?.totalAcres);
  const pricePerCent = property?.pricePerAcre ? Math.round(Number(property.pricePerAcre) / 100) : 0;
  const agriTotalValue = calcAgriTotalValue(property?.pricePerAcre, property?.totalAcres);
  const displayPrice = (isAgri && agriTotalValue > 0) ? agriTotalValue : property?.price;

  const handleLike = async () => {
    if (!user) { navigate('/login', { state: { from: window.location.pathname } }); return; }
    try {
      const res = await likeProperty(id, user._id || user.id);
      if (res.status === 'success') {
        setLiked(res.data.liked);
        setLikeCount(res.data.likeCount);
        showToast(res.data.liked ? '❤️ Saved to favourites!' : '💔 Removed from saved');
      }
    } catch { showToast('⚠️ Could not save — try again'); }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareText = `Check out this ${property?.type} in ${property?.location} on SnapAdda.\n\nPrice: ${formatSnapAddaPrice(displayPrice)}\n\nView details:`;
    
    try {
      if (navigator.share) {
        await navigator.share({ 
          title: `SnapAdda: ${property?.title}`, 
          text: shareText, 
          url 
        });
        shareProperty(id, 'native', user?._id);
      } else {
        await navigator.clipboard.writeText(`${shareText} ${url}`);
        showToast('🔗 Link & details copied!');
        shareProperty(id, 'clipboard', user?._id);
      }
    } catch { 
      await navigator.clipboard.writeText(url);
      showToast('🔗 Link copied!'); 
    }
  };

  const handleWhatsApp = () => {
    const wa = supportInfo?.whatsapp || '919346793364';
    const waMsg = `Hi SnapAdda! I'm interested in this property:\n\n*${property?.title}*\nType: ${property?.type}\nLocation: ${property?.location}\nPrice: ${formatSnapAddaPrice(displayPrice)}\n\nLink: ${window.location.href}`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(waMsg)}`, '_blank');
  };

  const handleAskSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login', { state: { from: window.location.pathname } }); return; }
    if (!qText.trim()) return;
    setQSubmitting(true);
    setQStatus('');
    try {
      const userData = user?.user || user; // Handle nested vs flattened user structure
      const res = await askQuestion({
        propertyId: id,
        userId: userData?._id || userData?.id,
        authType: user.token ? 'Google' : 'Email',
        clientName: userData?.name || userData?.displayName || 'Interested Client',
        clientContact: userData?.email || userData?.phone || userData?.phoneNumber || 'No contact provided',
        question: qText,
      });
      if (res.status === 'success') {
        setQStatus('success');
        setQText('');
        showToast('✅ Question submitted! Agent will respond soon.');
        setTimeout(() => setQStatus(''), 5000);
      } else {
        setQStatus('error');
      }
    } catch {
      setQStatus('error');
    } finally {
      setQSubmitting(false);
    }
  };

  const scrollGallery = (dir) => {
    if (galleryRef.current) galleryRef.current.scrollBy({ left: dir * 380, behavior: 'smooth' });
  };

  const generateDesc = (p) => {
    if (p.description && p.description.length > 50) return p.description;
    let d = `This ${(p.type || 'property').toLowerCase()} is located in the growing area of ${p.location || 'Andhra Pradesh'}. `;
    if (isAgri) {
      d += `Spanning ${formatLandSize(p.totalAcres)} of land, it presents a strong investment with a valuation of ${formatSnapAddaPrice(agriTotalValue || p.price || 0)}. `;
      if (p.waterSource && p.waterSource !== 'N/A') d += `Water source: ${String(p.waterSource)}. `;
      if (p.roadType && p.roadType !== 'N/A') d += `Road access: ${String(p.roadType)}. `;
    } else if (isPlot) {
      d += `Measuring ${p.areaSize || 0} ${p.measurementUnit || 'Sq.Yds'}, this ${p.isGated ? 'gated ' : ''}plot is ideal for development. `;
    } else if (isResidential) {
      if (p.bhk) d += `A ${p.bhk} BHK ${p.furnishing && p.furnishing !== 'N/A' ? String(p.furnishing).toLowerCase() + ' ' : ''}unit with modern interiors. `;
    }
    if (p.facing && p.facing !== 'Any') d += `${p.facing}-facing orientation ensures natural light and Vastu compliance. `;
    d += `Contact SnapAdda for a site visit!`;
    return d;
  };

  if (loading) return (
    <div className="property-loading-screen">
      <div className="loader"/>
      <p>Loading property details...</p>
    </div>
  );

  if (!property) return (
    <div className="pd-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
      <Building2 size={64} style={{ opacity: 0.2 }}/>
      <h2>Property details could not be retrieved</h2>
      <button className="pd-btn-primary" onClick={() => navigate('/')}>← Back to Home</button>
    </div>
  );

  const supportPhone = (supportInfo?.phone || '+919346793364').replace(/\s+/g, '');
  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'specs', label: 'Details' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'qna', label: 'Q&A' },
  ];

  return (
    <div className="pd-page">
      <AnimatePresence>{toast && <Toast msg={toast}/>}</AnimatePresence>
      <AnimatePresence>{lightbox && <LightBox images={property_images} startIdx={imgIdx} onClose={() => setLightbox(false)}/>}</AnimatePresence>

      <div className="pd-back-bar">
        <div className="container">
          <button className="pd-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16}/> BACK TO SEARCH
          </button>
        </div>
      </div>

      <section className="pd-gallery-section">
        <div className="pd-gallery-main-wrap">
          <div className="pd-gallery-hero" onClick={() => { setImgIdx(0); setLightbox(true); }}>
            {property_images[0] ? (
              <img src={property_images[0]} alt={property.title} className="pd-gallery-hero-img"/>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                <Building2 size={64} style={{ opacity: 0.2 }}/>
              </div>
            )}
            <div className="pd-gallery-hero-overlay">
              <Maximize2 size={16}/> VIEW ALL {property_images.length} PHOTOS
            </div>
          </div>

          {property_images.length > 1 && (
            <div className="pd-gallery-strip">
              <button className="pd-strip-arrow" onClick={() => scrollGallery(-1)}><ChevronLeft size={20}/></button>
              <div className="pd-strip-scroller" ref={galleryRef}>
                {property_images.map((img, i) => (
                  <div key={i} className={`pd-thumb ${i === imgIdx ? 'active' : ''}`}
                    onClick={() => { setImgIdx(i); setLightbox(true); }}>
                    <img src={img} alt={`Thumb ${i+1}`} loading="lazy"/>
                    {i === 0 && property.videoUrl && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', color: 'var(--gold)' }}>▶</div>}
                  </div>
                ))}
              </div>
              <button className="pd-strip-arrow" onClick={() => scrollGallery(1)}><ChevronRight size={20}/></button>
            </div>
          )}
        </div>
      </section>

      <section className="pd-title-section">
        <div className="container">
          <div className="pd-title-grid">
            <div className="pd-title-info">
              <div className="pd-title-badges">
                {property.isVerified && <span className="pd-badge-green"><ShieldCheck size={12}/> VERIFIED</span>}
                <span className="pd-badge-type">{property.type}</span>
                <span className="pd-badge-purpose" style={{ 
                  background: property.purpose === 'Rent' ? 'rgba(34,217,224,0.1)' : 'rgba(39,201,125,0.1)',
                  color: property.purpose === 'Rent' ? '#22d9e0' : '#27c97d',
                  border: `1px solid ${property.purpose === 'Rent' ? '#22d9e033' : '#27c97d33'}`,
                  fontSize: '0.65rem', fontWeight: 900, padding: '4px 12px', borderRadius: '20px'
                }}>
                  {property.purpose === 'Rent' ? 'FOR RENT' : 'FOR SALE'}
                </span>
                {property.isFeatured && <span className="pd-badge-gold">FEATURED</span>}
              </div>
              <h1 className="pd-h1">{property.title}</h1>
              <div className="pd-location-row">
                <MapPin size={16} style={{ color: 'var(--gold)' }}/>
                <span>{property.location}</span>
                {property.googleMapsLink && (
                  <a href={property.googleMapsLink} target="_blank" rel="noopener noreferrer" className="pd-maps-link">
                    VIEW ON MAP
                  </a>
                )}
              </div>
            </div>

            <div className="pd-price-block">
              <div className="pd-price-main">{formatSnapAddaPrice(displayPrice)}</div>
              <div className="pd-price-sub">Professional Valuation Guarantee</div>
              <div className="pd-price-actions">
                <button className={`pd-action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
                  <Heart size={18} fill={liked ? 'currentColor' : 'none'}/> {liked ? 'SAVED' : 'SAVE'}
                </button>
                <button className="pd-action-btn" onClick={handleShare}>
                  <Share2 size={18}/> SHARE
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="pd-tab-sticky">
        <div className="container">
          <nav className="pd-tab-nav">
            {TABS.map(tab => (
              <a key={tab.id} href={`#pd-${tab.id}`}
                className={`pd-tab-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="pd-body-grid">
          <main className="pd-main-col">
            <section id="pd-overview" className="pd-section">
              <h2 className="pd-section-h">Property Overview</h2>
              <div className="pd-overview-grid">
                {isAgri && (
                  <>
                    <div className="pd-ov-card" style={{ '--ov-accent': '#27c97d' }}>
                      <Leaf size={24} style={{ color: '#27c97d' }}/>
                      <div className="pd-ov-val">{agriAcres} ACRES</div>
                      <div className="pd-ov-lbl">TOTAL LAND</div>
                    </div>
                    {agriCents > 0 && (
                      <div className="pd-ov-card" style={{ '--ov-accent': '#27c97d' }}>
                        <Square size={24} style={{ color: '#27c97d' }}/>
                        <div className="pd-ov-val">{agriCents} CENTS</div>
                        <div className="pd-ov-lbl">REMAINING AREA</div>
                      </div>
                    )}
                    <div className="pd-ov-card" style={{ '--ov-accent': 'var(--gold)' }}>
                      <TrendingUp size={24} style={{ color: 'var(--gold)' }}/>
                      <div className="pd-ov-val">{formatSnapAddaPrice(property.pricePerAcre)}</div>
                      <div className="pd-ov-lbl">PER ACRE</div>
                    </div>
                  </>
                )}
                {isResidential && (
                  <>
                    <div className="pd-ov-card">
                      <BedDouble size={24} style={{ color: 'var(--gold)' }}/>
                      <div className="pd-ov-val">{property.bhk || property.beds} BHK</div>
                      <div className="pd-ov-lbl">CONFIG</div>
                    </div>
                    <div className="pd-ov-card">
                      <Bath size={24} style={{ color: 'var(--gold)' }}/>
                      <div className="pd-ov-val">{property.baths} BATHS</div>
                      <div className="pd-ov-lbl">WASHRMS</div>
                    </div>
                  </>
                )}
                <div className="pd-ov-card">
                  <Square size={24} style={{ color: 'var(--gold)' }}/>
                  <div className="pd-ov-val">{property.areaSize} {property.measurementUnit || 'Sq.Yds'}</div>
                  <div className="pd-ov-lbl">TOTAL AREA</div>
                </div>
                <div className="pd-ov-card">
                  <Compass size={24} style={{ color: 'var(--gold)' }}/>
                  <div className="pd-ov-val">{property.facing || 'ANY'}</div>
                  <div className="pd-ov-lbl">FACING</div>
                </div>
              </div>
            </section>

            <section id="pd-specs" className="pd-section">
              <h2 className="pd-section-h">Elite Specifications</h2>
              <p className="pd-desc-text" style={{ marginBottom: '2rem' }}>{generateDesc(property)}</p>
              
              <div className="pd-specs-grid">
                <SpecCard label="Ownership" value={property.ownershipType} accent="white"/>
                <SpecCard label="Transaction" value={property.transactionType} accent="white"/>
                <SpecCard label="Furnishing" value={property.furnishing} accent="var(--gold)"/>
                <SpecCard label="Parking" value={property.parking} accent="white"/>
                <SpecCard label="RERA ID" value={property.reraId} accent="var(--gold)"/>
                {isAgri && <SpecCard label="Survey No." value={property.surveyNo} accent="#9b59f5"/>}
                <SpecCard label="Road Access" value={property.roadWidth ? `${property.roadWidth} Ft` : property.roadType} accent="white"/>
              </div>
            </section>

            <section id="pd-amenities" className="pd-section">
              <h2 className="pd-section-h">Amenities & Extras</h2>
              <div className="pd-amenities-grid">
                {(property.amenities?.length > 0 ? property.amenities : ['Clear Title', 'Water Supply', 'Power Terminal', 'Security Wall', 'Vastu Optimized']).map((a, i) => (
                  <div key={i} className="pd-amenity-item">
                    <CheckCircle2 size={16} style={{ color: '#27c97d' }}/> {a}
                  </div>
                ))}
              </div>
            </section>

            <section id="pd-qna" className="pd-section">
              <h2 className="pd-section-h">Verified Q&A</h2>
              <div className="pd-qna-list">
                {qna.map((q, i) => (
                  <div key={i} className="pd-qna-item">
                    <div className="pd-qna-q"><span className="pd-qna-qlabel">Q:</span> {q.question}</div>
                    {q.answer && <div className="pd-qna-a"><span className="pd-qna-alabel">A:</span> {q.answer}</div>}
                  </div>
                ))}
              </div>
              
              <div className="pd-ask-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
                  <MessageSquare size={18} style={{ color: 'var(--gold)' }}/> INQUIRE ABOUT THIS LISTING
                </h3>
                <form onSubmit={handleAskSubmit} style={{ marginTop: '1.5rem' }}>
                   <textarea
                     value={qText}
                     onChange={e => setQText(e.target.value)}
                     placeholder="Message our senior agent regarding pricing or site visit..."
                     className="pd-textarea"
                     style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', color: 'white', marginBottom: '1rem', outline: 'none' }}
                   />
                   <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                     <button type="submit" disabled={qSubmitting} className="pd-btn-primary" style={{ padding: '0.8rem 2rem' }}>
                       {qSubmitting ? 'SENDING...' : 'SUBMIT INTEREST'}
                     </button>
                   </div>
                </form>
              </div>
            </section>
          </main>

          <aside className="pd-sidebar-col">
            <div className="pd-contact-sticky">
              <div className="pd-contact-card">
                <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem' }}>CONTACT SNAPADDA AGENT</div>
                <button onClick={() => window.location.href = `tel:${supportPhone}`} className="pd-btn-primary" style={{ width: '100%', background: '#05050a', color: 'white', border: 'none', padding: '1.25rem' }}>
                  <Phone size={20}/> CALL AGENT
                </button>
                <div style={{ textAlign: 'center', margin: '1rem 0', opacity: 0.5, fontSize: '0.75rem' }}>OR</div>
                <button onClick={handleWhatsApp} className="pd-btn-wa" style={{ width: '100%', padding: '1.25rem' }}>
                  <MessageSquare size={20}/> WHATSAPP CHAT
                </button>
                <div className="pd-trust-row">
                  <div className="pd-trust-item"><ShieldCheck size={14}/> 100% VERIFIED BY SNAPADDA</div>
                  <div className="pd-trust-item"><Award size={14}/> PREMIUM LISTING STATUS</div>
                </div>
              </div>

              <div className="pd-quick-specs">
                <div style={{ fontSize: '0.7rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--gold)' }}>QUICK STATS</div>
                <div className="pd-quick-row"><span className="pd-quick-lbl">Total Price</span><span className="pd-quick-val" style={{ color: 'var(--gold)' }}>{formatSnapAddaPrice(displayPrice)}</span></div>
                <div className="pd-quick-row"><span className="pd-quick-lbl">Unit Size</span><span className="pd-quick-val">{property.areaSize} {property.measurementUnit}</span></div>
                <div className="pd-quick-row"><span className="pd-quick-lbl">Facing</span><span className="pd-quick-val">{property.facing}</span></div>
                <div className="pd-quick-row"><span className="pd-quick-lbl">Authority</span><span className="pd-quick-val" style={{ color: '#27c97d' }}>{property.approvalAuthority || 'YES'}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="pd-mobile-bar">
        <button onClick={() => window.location.href = `tel:${supportPhone}`} className="pd-mobile-bar-btn pd-btn-primary">
          <Phone size={18}/> CALL
        </button>
        <button onClick={handleWhatsApp} className="pd-mobile-bar-btn pd-btn-wa">
          <MessageSquare size={18}/> WHATSAPP
        </button>
      </div>
    </div>
  );
}
