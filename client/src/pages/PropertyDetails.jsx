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
function SpecCard({ label, value, accent = 'rgba(255,255,255,0.6)', icon }) {
  if (!value || value === 'N/A' || value === '0') return null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '14px', padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '6px',
    }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
        {icon} {label}
      </div>
      <div style={{ color: accent, fontWeight: 700, fontSize: '0.95rem' }}>{value}</div>
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
  }, [id, property]);

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'var(--nav-h)', flexDirection: 'column', gap: '1.5rem', color: 'var(--txt-muted)' }}>
      <div className="loader"/>
      <p style={{ fontSize: '0.85rem' }}>Loading property...</p>
    </div>
  );

  if (!property) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 'var(--nav-h)', gap: '1rem' }}>
      <Building2 size={48} style={{ opacity: 0.3 }}/>
      <h2>Property not found</h2>
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
    <div className="pd-page" style={{ paddingTop: 'var(--nav-h)' }}>
      <AnimatePresence>{toast && <Toast msg={toast}/>}</AnimatePresence>
      <AnimatePresence>{lightbox && <LightBox images={property_images} startIdx={imgIdx} onClose={() => setLightbox(false)}/>}</AnimatePresence>

      {/* ── BACK BAR ── */}
      <div className="pd-back-bar">
        <div className="container">
          <button className="pd-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16}/> Back to Search
          </button>
        </div>
      </div>

      {/* ── MEDIA GALLERY ── */}
      <section className="pd-gallery-section">
        <div className="pd-gallery-main-wrap">
          {/* Main image */}
          <div className="pd-gallery-hero" onClick={() => { setImgIdx(0); setLightbox(true); }}>
            {property_images[0] ? (
              <img src={property_images[0]} alt={property.title} className="pd-gallery-hero-img"/>
            ) : (
              <div className="pd-img-empty"><Building2 size={64} style={{ opacity: 0.2 }}/></div>
            )}
            <div className="pd-gallery-hero-overlay">
              <ZoomIn size={20}/> View All {property_images.length} Photos
            </div>
          </div>

          {/* Thumbnail strip */}
          {property_images.length > 1 && (
            <div className="pd-gallery-strip">
              <button className="pd-strip-arrow left" onClick={() => scrollGallery(-1)}><ChevronLeft size={18}/></button>
              <div className="pd-strip-scroller" ref={galleryRef}>
                {property_images.map((img, i) => (
                  <div key={i} className={`pd-thumb ${i === imgIdx ? 'active' : ''}`}
                    onClick={() => { setImgIdx(i); setLightbox(true); }}>
                    <img src={img} alt={`View ${i+1}`} loading="lazy"/>
                    {i === 0 && property.videoUrl && (
                      <span className="pd-thumb-play">▶</span>
                    )}
                  </div>
                ))}
                {property.videoUrl && (
                  <a href={property.videoUrl} target="_blank" rel="noopener noreferrer" className="pd-thumb pd-thumb-video">
                    <span style={{ fontSize: '2rem' }}>▶</span>
                    <span style={{ fontSize: '0.65rem', color: '#e8b84b', fontWeight: 800 }}>VIDEO TOUR</span>
                  </a>
                )}
              </div>
              <button className="pd-strip-arrow right" onClick={() => scrollGallery(1)}><ChevronRight size={18}/></button>
            </div>
          )}
        </div>
      </section>

      {/* ── TITLE SECTION ── */}
      <section className="pd-title-section">
        <div className="container">
          <div className="pd-title-grid">
            {/* Left: title info */}
            <div className="pd-title-info">
              <div className="pd-title-badges">
                {property.isVerified && <span className="pd-badge-green"><ShieldCheck size={12}/> Verified</span>}
                {property.type && <span className="pd-badge-type">{property.type}</span>}
                {property.purpose && <span className="pd-badge-purpose" style={{ background: property.purpose === 'Rent' ? 'rgba(34,217,224,0.15)' : 'rgba(16,217,140,0.15)', color: property.purpose === 'Rent' ? '#22d9e0' : '#10d98c', border: `1px solid ${property.purpose === 'Rent' ? 'rgba(34,217,224,0.3)' : 'rgba(16,217,140,0.3)'}` }}>
                  {property.purpose === 'Rent' ? 'FOR RENT' : 'FOR SALE'}
                </span>}
                {property.isFeatured && <span className="pd-badge-gold">⭐ Featured</span>}
              </div>
              <h1 className="pd-h1">{property.title}</h1>
              <div className="pd-location-row">
                <MapPin size={14} style={{ color: 'var(--gold)', flexShrink: 0 }}/>
                <span>{property.location}</span>
                {property.address && <span style={{ color: 'var(--txt-muted)', fontSize: '0.82rem' }}>— {property.address}</span>}
                {property.googleMapsLink && (
                  <a href={property.googleMapsLink} target="_blank" rel="noopener noreferrer" className="pd-maps-link">
                    <MapPin size={10}/> View Map
                  </a>
                )}
              </div>
              {property.listerType && (
                <div style={{ fontSize: '0.78rem', color: 'var(--txt-muted)', marginTop: '4px' }}>
                  {property.listerType.includes('Builder') ? '🏗️' : '👤'} {property.listerType}
                </div>
              )}
            </div>

            {/* Right: price + actions */}
            <div className="pd-price-block">
              <div className="pd-price-main">{formatSnapAddaPrice(displayPrice)}</div>
              {isAgri && agriTotalValue > 0 && agriTotalValue !== Number(property.price) && (
                <div className="pd-price-sub">Auto-calculated total value</div>
              )}
              <div className="pd-price-actions">
                <button className={`pd-action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
                  <Heart size={18} fill={liked ? 'currentColor' : 'none'}/>
                  <span>{likeCount > 0 ? likeCount : ''} Save</span>
                </button>
                <button className="pd-action-btn" onClick={handleShare}>
                  <Share2 size={18}/>
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STICKY TAB NAV ── */}
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

      {/* ── MAIN CONTENT ── */}
      <div className="container">
        <div className="pd-body-grid">

          {/* ── LEFT MAIN ── */}
          <main className="pd-main-col">

            {/* OVERVIEW */}
            <section id="pd-overview" className="pd-section">
              <h2 className="pd-section-h">Property Overview</h2>

              <div className="pd-overview-grid">
                {/* AGRICULTURE */}
                {isAgri && (
                  <>
                    {agriAcres > 0 && (
                      <div className="pd-ov-card" style={{ '--ov-accent': '#10d98c' }}>
                        <Leaf size={20} style={{ color: '#10d98c' }}/>
                        <div className="pd-ov-val" style={{ color: '#10d98c' }}>{agriAcres}</div>
                        <div className="pd-ov-lbl">Acres</div>
                      </div>
                    )}
                    {agriCents > 0 && (
                      <div className="pd-ov-card" style={{ '--ov-accent': '#10d98c' }}>
                        <Square size={20} style={{ color: '#10d98c' }}/>
                        <div className="pd-ov-val">{agriCents}</div>
                        <div className="pd-ov-lbl">Cents</div>
                      </div>
                    )}
                    {property.pricePerAcre > 0 && (
                      <div className="pd-ov-card" style={{ '--ov-accent': '#e8b84b' }}>
                        <TrendingUp size={20} style={{ color: '#e8b84b' }}/>
                        <div className="pd-ov-val" style={{ fontSize: '0.95rem', color: '#e8b84b' }}>{formatSnapAddaPrice(property.pricePerAcre)}</div>
                        <div className="pd-ov-lbl">Per Acre</div>
                      </div>
                    )}
                    {pricePerCent > 0 && (
                      <div className="pd-ov-card" style={{ '--ov-accent': '#a8ff78' }}>
                        <Award size={20} style={{ color: '#a8ff78' }}/>
                        <div className="pd-ov-val" style={{ fontSize: '0.88rem', color: '#a8ff78' }}>₹{pricePerCent.toLocaleString('en-IN')}</div>
                        <div className="pd-ov-lbl">Per Cent</div>
                      </div>
                    )}
                  </>
                )}

                {/* RESIDENTIAL */}
                {isResidential && (
                  <>
                    {(property.bhk || property.beds) > 0 && (
                      <div className="pd-ov-card">
                        <BedDouble size={20} style={{ color: 'var(--gold)' }}/>
                        <div className="pd-ov-val">{property.bhk || property.beds}</div>
                        <div className="pd-ov-lbl">BHK</div>
                      </div>
                    )}
                    {property.baths > 0 && (
                      <div className="pd-ov-card">
                        <Bath size={20} style={{ color: 'var(--gold)' }}/>
                        <div className="pd-ov-val">{property.baths}</div>
                        <div className="pd-ov-lbl">Baths</div>
                      </div>
                    )}
                  </>
                )}

                {/* COMMON */}
                {property.areaSize > 0 && (
                  <div className="pd-ov-card">
                    <Square size={20} style={{ color: 'var(--gold)' }}/>
                    <div className="pd-ov-val">{property.areaSize}</div>
                    <div className="pd-ov-lbl">{property.measurementUnit || 'Sq.Yds'}</div>
                  </div>
                )}
                {property.facing && property.facing !== 'Any' && (
                  <div className="pd-ov-card">
                    <Compass size={20} style={{ color: 'var(--gold)' }}/>
                    <div className="pd-ov-val" style={{ fontSize: '0.9rem' }}>{property.facing}</div>
                    <div className="pd-ov-lbl">Facing</div>
                  </div>
                )}
                {property.approvalAuthority && property.approvalAuthority !== 'N/A' && (
                  <div className="pd-ov-card">
                    <ShieldCheck size={20} style={{ color: '#10d98c' }}/>
                    <div className="pd-ov-val" style={{ fontSize: '0.88rem', color: '#10d98c' }}>{property.approvalAuthority}</div>
                    <div className="pd-ov-lbl">Approval</div>
                  </div>
                )}
              </div>
            </section>

            {/* ABOUT */}
            <section id="pd-specs" className="pd-section">
              <h2 className="pd-section-h">About this Property</h2>
              <p className="pd-desc-text">{generateDesc(property)}</p>

              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', marginTop: '2rem', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Technical Specifications
              </h3>
              <div className="pd-specs-grid">
                <SpecCard label="Carpet Area" value={property.carpetArea > 0 ? `${property.carpetArea} Sq.Ft` : null} accent="white"/>
                <SpecCard label="Built-up Area" value={property.superBuiltupArea > 0 ? `${property.superBuiltupArea} Sq.Ft` : null} accent="white"/>
                <SpecCard label="Floor" value={property.floorNo > 0 ? `${property.floorNo} of ${property.totalFloors}` : null} accent="white"/>
                <SpecCard label="Parking" value={property.parking !== 'N/A' ? property.parking : null} accent="white"/>
                <SpecCard label="Furnishing" value={property.furnishing !== 'N/A' ? property.furnishing : null} accent="#e8b84b"/>
                <SpecCard label="Age of Property" value={property.propertyAge !== 'N/A' ? property.propertyAge : null} accent="white"/>
                <SpecCard label="Ownership" value={property.ownershipType !== 'N/A' ? property.ownershipType : null} accent="white"/>
                <SpecCard label="Transaction" value={property.transactionType !== 'N/A' ? property.transactionType : null} accent="white"/>
                <SpecCard label="RERA ID" value={property.reraId} accent="#e8b84b" icon={<FileText size={9}/>}/>

                {/* Land & Plot specific */}
                {(isAgri || isPlot) && <>
                  <SpecCard label="Road Width" value={property.roadWidth > 0 ? `${property.roadWidth} Ft` : null} accent="#22d9e0" icon={<Truck size={9}/>}/>
                  <SpecCard label="Boundary Wall" value={property.boundaryWall ? 'Constructed' : null} accent="#10d98c"/>
                  <SpecCard label="Community" value={property.isGated ? 'Gated' : null} accent="#e8b84b"/>
                </>}

                {/* Agriculture specific */}
                {isAgri && <>
                  <SpecCard label="Survey No." value={property.surveyNo} accent="#9b59f5" icon={<FileText size={9}/>}/>
                  <SpecCard label="Water Source" value={property.waterSource !== 'N/A' ? property.waterSource : null} accent="#22d9e0" icon={<Droplets size={9}/>}/>
                  <SpecCard label="Road Type" value={property.roadType !== 'N/A' ? property.roadType : null} accent="#ff8c42" icon={<Truck size={9}/>}/>
                  <SpecCard label="Total Area" value={property.totalAcres ? formatLandSize(property.totalAcres) : null} accent="#10d98c" icon={<Leaf size={9}/>}/>
                </>}

                {property.customFeatures?.map((f, i) => (
                  <SpecCard key={i} label={f.label} value={f.value} accent="#e8b84b"/>
                ))}
              </div>
            </section>

            {/* AMENITIES */}
            <section id="pd-amenities" className="pd-section">
              <h2 className="pd-section-h">Amenities & Features</h2>
              <div className="pd-amenities-grid">
                {(property.amenities?.length > 0
                  ? property.amenities
                  : ['Clear Title', 'Power Backup', 'Water Supply', 'Vastu Compliant', 'Gated Entry', '24/7 Security']
                ).map((a, i) => (
                  <div key={i} className="pd-amenity-item">
                    <CheckCircle2 size={14} style={{ color: '#10d98c', flexShrink: 0 }}/> {a}
                  </div>
                ))}
              </div>
            </section>


            {/* Q&A */}
            <section id="pd-qna" className="pd-section">
              <h2 className="pd-section-h">Property Q&A</h2>

              {/* Existing Q&As */}
              {qna.length > 0 ? (
                <div className="pd-qna-list">
                  {qna.map((q, i) => (
                    <div key={q._id || i} className="pd-qna-item">
                      <div className="pd-qna-q">
                        <span className="pd-qna-qlabel">Q:</span> {q.question}
                      </div>
                      {q.answer && (
                        <div className="pd-qna-a">
                          <span className="pd-qna-alabel">A:</span> {q.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--txt-muted)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                  No questions yet — be the first to ask!
                </p>
              )}

              {/* Ask Form */}
              <div className="pd-ask-card">
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={16} style={{ color: 'var(--gold)' }}/> Ask the Agent
                </h3>
                {!user ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <p style={{ color: 'var(--txt-muted)', marginBottom: '1rem' }}>Sign in to ask questions and track agent responses.</p>
                    <button className="pd-btn-primary" onClick={() => navigate('/login', { state: { from: window.location.pathname } })}>
                      Sign In to Ask
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAskSubmit}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <div className="pd-ask-field" style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--txt-muted)', fontWeight: 600 }}>Your Name</span>
                        <div style={{ fontWeight: 700, color: 'white', fontSize: '0.88rem' }}>{user.name || user.displayName || 'User'}</div>
                      </div>
                      <div className="pd-ask-field" style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--txt-muted)', fontWeight: 600 }}>Email / Phone</span>
                        <div style={{ fontWeight: 700, color: 'white', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email || user.phone || '—'}</div>
                      </div>
                    </div>
                    <textarea
                      value={qText}
                      onChange={e => setQText(e.target.value)}
                      placeholder="What would you like to know about this property?"
                      rows={3}
                      required
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.9rem 1rem', color: 'white', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: '12px', fontFamily: 'inherit' }}
                      onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {qStatus === 'success' && <span style={{ color: '#10d98c', fontSize: '0.82rem', fontWeight: 600 }}>✅ Question submitted!</span>}
                      {qStatus === 'error' && <span style={{ color: 'var(--rose)', fontSize: '0.82rem', fontWeight: 600 }}>⚠️ Failed — please try again</span>}
                      {!qStatus && <span/>}
                      <button type="submit" disabled={qSubmitting} className="pd-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.75rem 1.5rem' }}>
                        <Send size={14}/> {qSubmitting ? 'Sending...' : 'Submit Question'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>
          </main>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="pd-sidebar-col">
            <div className="pd-contact-sticky">

              {/* Contact Card */}
              <div className="pd-contact-card">
                <div style={{ fontSize: '0.72rem', color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '0.75rem' }}>
                  Get Expert Assistance
                </div>
                <a href={`tel:${supportPhone}`} className="pd-btn-primary" style={{ textDecoration: 'none', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem', padding: '1rem' }}>
                  <Phone size={18}/> Call Agent Now
                </a>
                <div style={{ textAlign: 'center', color: 'var(--txt-muted)', fontSize: '0.75rem', margin: '0.75rem 0' }}>or</div>
                <button onClick={handleWhatsApp} className="pd-btn-wa" style={{ width: '100%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem', padding: '1rem' }}>
                  <MessageSquare size={18}/> WhatsApp
                </button>
                <div className="pd-trust-row">
                  <div className="pd-trust-item"><ShieldCheck size={13} style={{ color: '#10d98c' }}/> Verified Listing</div>
                  <div className="pd-trust-item"><Award size={13} style={{ color: '#e8b84b' }}/> CRDA Approved</div>
                </div>
              </div>

              {/* Quick Specs */}
              <div className="pd-quick-specs">
                <div style={{ fontSize: '0.72rem', color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '1rem' }}>Quick Facts</div>
                {[
                  { label: 'Price', value: formatSnapAddaPrice(displayPrice), accent: '#e8b84b' },
                  isAgri && { label: 'Total Area', value: formatLandSize(property.totalAcres), accent: '#10d98c' },
                  isAgri && property.pricePerAcre > 0 && { label: 'Per Acre', value: formatSnapAddaPrice(property.pricePerAcre), accent: 'white' },
                  isAgri && pricePerCent > 0 && { label: 'Per Cent', value: `₹${pricePerCent.toLocaleString('en-IN')}`, accent: '#a8ff78' },
                  !isAgri && property.areaSize > 0 && { label: 'Area', value: `${property.areaSize} ${property.measurementUnit || 'Sq.Yds'}`, accent: 'white' },
                  property.facing && { label: 'Facing', value: property.facing, accent: 'white' },
                  property.approvalAuthority && { label: 'Approval', value: property.approvalAuthority, accent: '#10d98c' },
                  property.type && { label: 'Type', value: property.type, accent: 'white' },
                ].filter(Boolean).map((s, i) => (
                  <div key={i} className="pd-quick-row">
                    <span className="pd-quick-lbl">{s.label}</span>
                    <span className="pd-quick-val" style={{ color: s.accent }}>{s.value}</span>
                  </div>
                ))}
              </div>

            </div>
          </aside>
        </div>
      </div>

      {/* ── MOBILE STICKY BAR ── */}
      <div className="pd-mobile-bar">
        <a href={`tel:${supportPhone}`} className="pd-mobile-bar-btn pd-btn-primary" style={{ textDecoration: 'none' }}>
          <Phone size={18}/> Call
        </a>
        <button className="pd-mobile-bar-btn pd-btn-wa" onClick={handleWhatsApp}>
          <MessageSquare size={18}/> WhatsApp
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pd-mobile-bar { display: flex !important; }
          .pd-sidebar-col { display: none !important; }
          .pd-page { padding-bottom: 80px; }
        }
      `}</style>
    </div>
  );
}
