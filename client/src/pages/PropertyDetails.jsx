import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Share2, Heart, Shield, ShieldCheck, Phone, MessageSquare,
  ChevronLeft, ChevronRight, Eye, CheckCircle2, Building2, User,
  BedDouble, Bath, Square, Compass, Award, Send, Star, Leaf, Maximize2,
  Droplets, Truck, FileText, ZoomIn, X, TreePine, TrendingUp, IndianRupee
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchProperty, fetchSetting, askQuestion, fetchPropertyFAQs, likeProperty, shareProperty, fetchSimilarProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { formatSnapAddaPrice, formatLandSize, calcAgriTotalValue, getAcres, getCents } from '../utils/priceUtils';
import tr from '../utils/teluguTranslations';
import { useTranslation } from 'react-i18next';
import VisualCompass from '../components/VisualCompass';
import EliteLightBox from '../components/EliteLightBox';
import { useBehaviorTracker } from '../hooks/useBehaviorTracker';

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
// EliteLightBox is now imported from components

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
  const { logPropertyView } = useBehaviorTracker();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [qna, setQna] = useState([]);
  const [supportInfo, setSupportInfo] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [similar, setSimilar] = useState([]);
  const [toast, setToast] = useState('');
  const [shareModal, setShareModal] = useState(false);
  const galleryRef = useRef(null);

  // Q&A
  const [qText, setQText] = useState('');
  const [qStatus, setQStatus] = useState('');
  const [qSubmitting, setQSubmitting] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Utility: robustly extract userId from any auth shape (Email or Google)
  const getUserId = (u) => {
    if (!u) return null;
    const inner = u.user || u;
    return (inner._id || inner.id || inner.uid)?.toString() || null;
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const uid = getUserId(user);
    fetchProperty(id, uid)
      .then(res => {
        const data = res.data || res;
        setProperty(data);
        setLikeCount(data.likeCount || 0);
        setLiked(data.isLiked || false);

        // Fetch Similar Properties
        if (data?.category || data?.type) {
          fetchSimilarProperties(data.category || data.type, id).then(s => setSimilar(s.data || [])).catch(() => {});
        }

        // Recent views
        try {
          const arr = JSON.parse(localStorage.getItem('snapadda_recent_views') || '[]');
          const filtered = arr.filter(p => p._id !== data._id);
          filtered.unshift({ _id: data._id, title: data.title, price: data.price, location: data.location, type: data.type, image: data.images?.[0] || data.image });
          localStorage.setItem('snapadda_recent_views', JSON.stringify(filtered.slice(0, 6)));
        } catch {}

        // Smart Recommendation Engine: Log View
        logPropertyView(data.type, data.location);

        // Update page title
        document.title = `${data.title} | ${data.type} in ${data.location} | SnapAdda`;
      })
      .catch((err) => {
        console.error('FETCH_PROPERTY_ERROR:', err);
        setProperty(null);
      })
      .finally(() => setLoading(false));

    fetchPropertyFAQs(id).then(setQna).catch(() => setQna([]));
    fetchSetting('support_info').then(setSupportInfo).catch(console.error);
  }, [id]);

  // Elite Image Priority logic: Filter dummies, limit to 10 photos, include up to 3 videos
  const isValidMedia = (media) => {
    if (!media || typeof media !== 'string') return false;
    if (media.trim() === '' || media.length < 5) return false;
    if (media.includes('placeholder') || media.includes('dummy') || media === 'null' || media === 'undefined') return false;
    return true;
  };

  const rawImages = [
    ...(property?.images || []),
    ...(property?.gallery || []),
    property?.image
  ];
  
  const validPhotos = rawImages
    .filter(isValidMedia)
    .slice(0, 10);
  
  // Deduplicate
  const uniquePhotos = [...new Set(validPhotos)];

  const validVideos = [
    ...(property?.videos || []),
    property?.videoUrl
  ].filter(isValidMedia)
    .slice(0, 3);
  
  const uniqueVideos = [...new Set(validVideos)];

  // Final gallery set for the scroller
  const property_images = uniquePhotos;
  const property_videos = uniqueVideos;

  // Fallback Google Maps Link generation if missing
  const finalGoogleMapsLink = property?.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property?.title} ${property?.location} ${property?.district || ''}`)}`;

  const isAgri = ['agricultural land', 'farmhouse'].some(t => (property?.type || '').toLowerCase().includes(t));
  const isPlot = ['plot', 'crda', 'layout'].some(t => (property?.type || '').toLowerCase().includes(t));
  const isResidential = ['Apartment', 'Villa', 'Independent House', 'Farmhouse', 'Villa / Duplex', 'Apartment / Flat'].some(t => (property?.type || '').includes(t));
  const isIndustrial = ['industrial', 'warehouse', 'factory'].some(t => (property?.type || '').toLowerCase().includes(t));

  const agriAcres = getAcres(property?.totalAcres);
  const agriCents = getCents(property?.totalAcres);
  const pricePerCent = property?.pricePerAcre ? Math.round(Number(property.pricePerAcre) / 100) : 0;
  const agriTotalValue = calcAgriTotalValue(property?.pricePerAcre, property?.totalAcres);
  const displayPrice = (isAgri && agriTotalValue > 0) ? agriTotalValue : property?.price;

  const handleLike = async () => {
    if (!user) { navigate('/login', { state: { from: window.location.pathname } }); return; }
    // Optimistic update
    const wasLiked = liked;
    const prevCount = likeCount;
    setLiked(!wasLiked);
    setLikeCount(c => wasLiked ? Math.max(0, c - 1) : c + 1);
    try {
      const uid = getUserId(user);
      const res = await likeProperty(id, uid);
      if (res.status === 'success') {
        setLiked(res.data.liked);
        setLikeCount(res.data.likeCount);
        showToast(res.data.liked ? '❤️ సేవ్ చేయబడింది!' : '💔 తీసివేయబడింది');
      } else {
        // Rollback
        setLiked(wasLiked); setLikeCount(prevCount);
        showToast('⚠️ మళ్ళీ ప్రయత్నించండి');
      }
    } catch {
      setLiked(wasLiked); setLikeCount(prevCount);
      showToast('⚠️ నెట్‌వర్క్ లోపం');
    }
  };

  // Share helpers
  const getShareUrl  = () => window.location.href;
  const getShareText = () => {
    const price = (isAgri && agriTotalValue > 0) ? agriTotalValue : property?.price;
    const code  = property?.propertyCode || '';
    return `🏠 *${property?.title}*\n📍 ${property?.location}, ${property?.district || ''}\n🏷️ Code: *${code}*\n💰 ${formatSnapAddaPrice(price)}\n\n🔗 ${getShareUrl()}\n\n_SnapAdda – Andhra's Leading Property Platform_`;
  };

  const handleShare = () => setShareModal(true);

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(getShareText())}`, '_blank');
    shareProperty(id, 'whatsapp', getUserId(user));
    setShareModal(false);
    showToast('📱 WhatsApp తెరవబడింది!');
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    let ok = false;
    try { await navigator.clipboard.writeText(url); ok = true; } catch {}
    if (!ok) {
      try {
        const ta = document.createElement('textarea');
        ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.focus(); ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {}
    }
    showToast(ok ? '🔗 లింక్ కాపీ చేయబడింది!' : '⚠️ కాపీ చేయడం సాధ్యం కాలేదు');
    shareProperty(id, 'clipboard', getUserId(user));
    setShareModal(false);
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: `SnapAdda: ${property?.title}`, text: getShareText(), url: getShareUrl() });
      shareProperty(id, 'native', getUserId(user));
      showToast('✅ షేర్ చేయబడింది!');
    } catch {}
    setShareModal(false);
  };

  const handleWhatsApp = () => {
    const wa = supportInfo?.whatsapp || '919346793364';
    const waMsg = `నమస్కారం SnapAdda! ఈ ప్రాపర్టీలో నాకు ఆసక్తి ఉంది:\n\n*${property?.title}*\nరకం: ${tr(property?.type)}\nప్రాంతం: ${property?.location}\nధర: ${formatSnapAddaPrice(displayPrice)}\n\nలింక్: ${window.location.href}`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(waMsg)}`, '_blank');
  };

  const handleAskSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login', { state: { from: window.location.pathname } }); return; }
    if (!qText.trim()) return;
    setQSubmitting(true);
    setQStatus('');
    setTimeout(async () => {
      try {
        const userData = user?.user || user;
        const res = await askQuestion({
          propertyId: id,
          userId: userData?._id || userData?.id,
          authType: user.token ? 'Google' : 'Email',
          clientName: userData?.name || userData?.displayName || 'VIP Client',
          clientContact: userData?.email || userData?.phone || userData?.phoneNumber || 'No contact provided',
          question: qText,
        });
        if (res.status === 'success') {
          setQStatus('success');
          setQText('');
          showToast('✅ మీ ప్రశ్న పంపబడింది. ఏజెంట్ త్వరలో సంప్రదిస్తారు.');
          setTimeout(() => setQStatus(''), 5000);
        } else {
          setQStatus('error');
        }
      } catch {
        setQStatus('error');
      } finally {
        setQSubmitting(false);
      }
    }, 800);
  };

  const scrollGallery = (dir) => {
    if (galleryRef.current) galleryRef.current.scrollBy({ left: dir * 380, behavior: 'smooth' });
  };

  const generateDesc = (p) => {
    if (p.description && p.description.length > 50) return p.description;
    const loc = p.location || 'Andhra Pradesh';
    const dist = p.district ? ` in ${p.district} district` : '';
    let d = `This ${(p.type || 'property').toLowerCase()} is located in the growing area of ${loc}${dist}. `;
    
    if (p.approvalAuthority && p.approvalAuthority !== 'N/A' && p.approvalAuthority !== 'None') {
      d += `This asset is ${p.approvalAuthority} approved, ensuring institutional-grade security. `;
    }

    if (isAgri) {
      d += `Spanning ${formatLandSize(p.totalAcres)} of land, it presents a strong investment with a valuation of ${formatSnapAddaPrice(agriTotalValue || p.price || 0)}. `;
    } else if (isPlot) {
      d += `Measuring ${p.areaSize || 0} ${p.measurementUnit || 'Sq.Yards'}, this ${p.isGated ? 'gated ' : ''}plot is ideal for immediate development. `;
    } else if (isResidential) {
      if (p.bhk) d += `A ${p.bhk} BHK ${p.furnishing && p.furnishing !== 'N/A' ? String(p.furnishing).toLowerCase() + ' ' : ''}unit with premium finishes. `;
    }
    
    if (p.facing && p.facing !== 'Any') d += `The ${p.facing}-facing orientation ensures natural light and Vastu compliance. `;
    d += `Professional consultation and site visits available via SnapAdda.`;
    return d;
  };

  if (loading) return (
    <div className="property-loading-screen">
      <div className="loader"/>
      <p>వివరాలు లోడ్ అవుతున్నాయి...</p>
    </div>
  );

  if (!property) return (
    <div className="pd-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
      <Building2 size={64} style={{ opacity: 0.2 }}/>
      <h2>క్షమించండి! ప్రాపర్టీ వివరాలు అందుబాటులో లేవు.</h2>
      <button className="pd-btn-primary" onClick={() => navigate('/')}>← హోమ్ పేజీకి వెళ్ళండి</button>
    </div>
  );

  const supportPhone = (supportInfo?.phone || '+919346793364').replace(/\s+/g, '');
  // Cloudinary Optimization Helper
  const getOptimizedImg = (url, width = 800) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    return `${parts[0]}/upload/f_auto,q_auto:good,w_${width},c_fill/${parts[1]}`;
  };

  const TABS = [
    { id: 'overview', label: 'అవలోకనం' },
    { id: 'specs', label: 'వివరాలు' },
    { id: 'amenities', label: 'సదుపాయాలు' },
    { id: 'qna', label: 'ప్రశ్నలు & జవాబులు' },
  ];

  return (
    <div className="pd-page">
      <AnimatePresence>{toast && <Toast msg={toast}/>}</AnimatePresence>
      <AnimatePresence>
        {lightbox && (
          <EliteLightBox 
            images={property_images.map(img => getOptimizedImg(img, 1200))} 
            videos={property_videos} 
            startIdx={imgIdx} 
            title={property.title}
            onClose={() => setLightbox(false)}
          />
        )}
      </AnimatePresence>

      <div className="pd-back-bar">
        <div className="container">
          <button className="pd-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16}/> వెనక్కి వెళ్ళండి
          </button>
        </div>
      </div>

      {/* Cinematic Property Gallery (Phase 3) */}
      <section className="pd-gallery-section" style={{ position: 'relative', width: '100%', overflow: 'hidden', background: '#05050a' }}>
        <div 
          className="pd-snap-gallery hide-scrollbar" 
          style={{ 
            display: 'flex', 
            overflowX: 'auto', 
            scrollSnapType: 'x mandatory', 
            WebkitOverflowScrolling: 'touch',
            height: '55vh',
            minHeight: '400px'
          }}
        >
          {property_images.length > 0 ? (
            property_images.map((img, i) => (
              <div
                key={i}
                style={{
                  flex: '0 0 100%',
                  scrollSnapAlign: 'start',
                  position: 'relative',
                  height: '100%',       // ← critical fix: explicit height propagation
                  cursor: 'pointer',
                  background: '#05050a'
                }}
                onClick={() => { setImgIdx(i); setLightbox(true); }}
              >
                <img
                  src={getOptimizedImg(img, 800)}
                  alt={`${property.title} - ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.display = 'flex');
                  }}
                />
                {/* Fallback shown when image fails */}
                <div style={{ display: 'none', position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', background: '#111', flexDirection: 'column', gap: '12px' }}>
                  <Building2 size={48} style={{ opacity: 0.2 }}/>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Image unavailable</span>
                </div>
                <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, zIndex: 2 }}>
                  {i + 1} / {property_images.length}
                </div>
                {/* Cinematic Data Overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, transparent 100%)',
                  padding: '40px 20px 20px',
                  display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        {property.isVerified && <span style={{ background: 'var(--gold)', color: 'black', fontSize: '0.65rem', fontWeight: 900, padding: '4px 8px', borderRadius: '12px' }}><ShieldCheck size={10} style={{ display: 'inline', verticalAlign: 'text-top' }}/> VERIFIED</span>}
                        <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', fontSize: '0.65rem', fontWeight: 900, padding: '4px 8px', borderRadius: '12px' }}>{tr(property.type)}</span>
                      </div>
                      <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 900, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{property.title}</h1>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <span style={{ background: 'rgba(232,184,75,0.2)', border: '1px solid rgba(232,184,75,0.4)', color: '#e8b84b', padding: '2px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.05em' }}>
                          CODE: {property.propertyCode || `SNA-${(id || '').toString().slice(-5).toUpperCase()}`}
                        </span>
                        {property.reraNumber && (
                          <span style={{ background: 'rgba(34,217,224,0.15)', border: '1px solid rgba(34,217,224,0.4)', color: '#22d9e0', padding: '2px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 900 }}>
                            RERA: {property.reraNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--gold)', fontSize: '1.4rem', fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        {formatSnapAddaPrice(displayPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ flex: '0 0 100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
              <Building2 size={64} style={{ opacity: 0.2 }}/>
            </div>
          )}
        </div>
      </section>

      <section className="pd-title-section">
        <div className="container">
          <div className="pd-title-grid">
            <div className="pd-title-info">
              <div className="pd-title-badges">
                {property.isVerified && <span className="pd-badge-green"><ShieldCheck size={12}/> వెరిఫైడ్</span>}
                {property.status === 'Sold' && <span className="pd-badge-sold" style={{ background: 'var(--emerald)', color: 'white', fontSize: '0.65rem', fontWeight: 900, padding: '4px 12px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(16,217,140,0.3)' }}>అమ్మబడినది</span>}
                <span className="pd-badge-type">{tr(property.type)}</span>
                <span className="pd-badge-purpose" style={{ 
                   background: property.purpose === 'Rent' ? 'rgba(34,217,224,0.1)' : 'rgba(39,201,125,0.1)',
                   color: property.purpose === 'Rent' ? '#22d9e0' : '#27c97d',
                   border: `1px solid ${property.purpose === 'Rent' ? '#22d9e033' : '#27c97d33'}`,
                   fontSize: '0.65rem', fontWeight: 900, padding: '4px 12px', borderRadius: '20px'
                }}>
                   {tr(property.purpose === 'Rent' ? 'For Rent' : 'For Sale')}
                </span>
                {property.isFeatured && <span className="pd-badge-gold">ఎలైట్</span>}
              </div>
              {/* Title hidden on mobile as it's injected into the gallery overlay */}
              <h1 className="pd-h1" style={{ display: 'none' }}>{property.title}</h1>
              
              <div className="pd-location-row" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={18} style={{ color: 'var(--gold)' }}/>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{property.location} {property.district ? `(${property.district})` : ''}</span>
                </div>
                
                {property.address && (
                  <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', marginLeft: '26px', borderLeft: '2px solid var(--gold)', paddingLeft: '12px' }}>
                    {property.address}
                  </div>
                )}

                {/* Show Google Maps button ALWAYS, with fallback search link */}
                <div style={{ marginTop: '1.5rem', width: '100%', maxWidth: '500px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>ప్రాంతం మ్యాప్ (Location Map)</div>
                  <a 
                    href={finalGoogleMapsLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-3d-glass"
                    style={{ 
                      width: '100%',
                      padding: '1.2rem', fontSize: '1rem', fontWeight: 900, borderRadius: '20px',
                      textDecoration: 'none'
                    }}
                  >
                    <MapPin size={24}/> గూగుల్ మ్యాప్స్‌లో చూడండి
                  </a>
                </div>
              </div>
            </div>

            <div className="pd-price-block" style={{ display: 'none' }}> {/* Hidden on mobile, shown via overlay */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', background: 'rgba(39, 201, 125, 0.1)', border: '1px solid rgba(39, 201, 125, 0.3)', padding: '6px 12px', borderRadius: '12px' }}>
                 <ShieldCheck size={14} color="#27c97d"/> <span style={{ color: '#27c97d', fontSize: '0.7rem', fontWeight: 900 }}>100% వెరిఫైడ్ టైటిల్</span>
              </div>
              <div className="pd-price-main">{formatSnapAddaPrice(displayPrice)}</div>
              <div className="pd-price-sub" style={{ color: 'var(--gold)', fontWeight: 600 }}>SnapAdda ప్రత్యేక విలువ</div>
              <div className="pd-price-actions" style={{ marginTop: '1.5rem' }}>
                <button className={`pd-action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
                  <Heart size={18} fill={liked ? 'currentColor' : 'none'}/> {liked ? 'సేవ్ చేయబడింది' : 'సేవ్ చేయండి'}
                </button>
                <button className="pd-action-btn" onClick={handleShare}>
                  <Share2 size={18}/> షేర్ చేయండి
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
              <h2 className="pd-section-h">ప్రాపర్టీ అవలోకనం (Overview)</h2>
              <div className="pd-overview-grid">
                {isAgri && (
                  <>
                    <div className="pd-ov-card" style={{ '--ov-accent': '#27c97d' }}>
                      <Leaf size={24} style={{ color: '#27c97d' }}/>
                      <div className="pd-ov-val">{formatLandSize(property.totalAcres, false)}</div>
                      <div className="pd-ov-lbl">మొత్తం విస్తీర్ణం</div>
                    </div>
                    <div className="pd-ov-card" style={{ '--ov-accent': 'var(--gold)' }}>
                      <TrendingUp size={24} style={{ color: 'var(--gold)' }}/>
                      <div className="pd-ov-val">{formatSnapAddaPrice(property.pricePerAcre)}</div>
                      <div className="pd-ov-lbl">ఎకరా ధర</div>
                    </div>
                  </>
                )}
                {isPlot && (
                  <div className="pd-ov-card" style={{ '--ov-accent': '#22d9e0' }}>
                    <Square size={24} style={{ color: '#22d9e0' }} />
                    <div className="pd-ov-val">{property.areaSize} {tr(property.measurementUnit || 'Sq.Yards')}</div>
                    <div className="pd-ov-lbl">మొత్తం స్థలం విస్తీర్ణం</div>
                  </div>
                )}
                {isResidential && (
                  <div className="pd-ov-card">
                    <BedDouble size={24} style={{ color: 'var(--gold)' }}/>
                    <div className="pd-ov-val">{property.bhk || property.beds} BHK</div>
                    <div className="pd-ov-lbl">కాన్ఫిగరేషన్</div>
                  </div>
                )}
                <div className="pd-ov-card" style={{ gap: '12px' }}>
                  <VisualCompass facing={property.facing} size={48} />
                  <div style={{ textAlign: 'center' }}>
                    <div className="pd-ov-val" style={{ textTransform: 'uppercase' }}>{tr(property.facing || 'Any')}</div>
                    <div className="pd-ov-lbl">ఫేసింగ్ (Facing)</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="pd-section glass-premium shadow-hover" style={{ border: '1px solid rgba(212,175,55,0.2)', padding: '2.5rem', borderRadius: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.08, pointerEvents: 'none' }}>
                <ShieldCheck size={160} color="var(--gold)" />
              </div>
              
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>✦ SNAPADDA QUALITY</div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', margin: 0 }}>నమ్మకమైన సమాచారం (Trust Scorecard)</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Shield size={20} color="var(--gold)" />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>{property.approvalAuthority || 'CRDA వెరిఫైడ్'}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>ప్రభుత్వ అనుమతి</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <TrendingUp size={20} color="var(--gold)" />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>అధిక లాభం</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>పెట్టుబడి రాబడి</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <MapPin size={20} color="var(--gold)" />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>{property.cornerProperty ? 'కార్నర్ ప్లాట్' : 'ప్రధాన ప్రాంతం'}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>భౌగోళిక స్థానం</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h4 style={{ color: 'white', fontSize: '0.9rem', fontWeight: 800, marginBottom: '1.2rem' }}>
                   <IndianRupee size={16} color="var(--gold)" style={{ verticalAlign: 'middle', marginRight: '8px' }}/> ధర విశ్లేషణ (Price Analysis)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                   {isAgri && (
                     <>
                        <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                           <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 700 }}>సెంట్ ధర</div>
                           <div style={{ color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 900 }}>{formatSnapAddaPrice(pricePerCent)}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                           <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 700 }}>ఎకరా ధర</div>
                           <div style={{ color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 900 }}>{formatSnapAddaPrice(property.pricePerAcre)}</div>
                        </div>
                     </>
                   )}
                   {isPlot && property.areaSize > 0 && (
                     <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 700 }}>గజం ధర (Sq.Yard)</div>
                        <div style={{ color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 900 }}>₹{Math.round(property.price / property.areaSize).toLocaleString()}</div>
                     </div>
                   )}
                   <div style={{ padding: '0.75rem', background: 'rgba(232,184,75,0.1)', borderRadius: '12px', border: '1px solid rgba(232,184,75,0.2)' }}>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 700 }}>మొత్తం విలువ</div>
                      <div style={{ color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 900 }}>{formatSnapAddaPrice(displayPrice)}</div>
                   </div>
                </div>
              </div>
            </section>

            <section id="pd-specs" className="pd-section">
              <h2 className="pd-section-h">ముఖ్యమైన వివరాలు (Specifications)</h2>

              {/* Property Code Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.4)', padding: '8px 16px', borderRadius: '14px' }}>
                  <FileText size={14} style={{ color: 'var(--gold)' }}/>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 700 }}>Property Code:</span>
                  <span style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 900, letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                    {property.propertyCode || `SNA-${id.slice(-5).toUpperCase()}`}
                  </span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>ఏజెంట్‌కు ఈ కోడ్ చెప్పండి (Share this code with our agent)</span>
              </div>

              <p className="pd-desc-text" style={{ marginBottom: '2rem' }}>{generateDesc(property)}</p>
              
              <div className="pd-specs-grid">
                <SpecCard label="యాజమాన్యం" value={tr(property.ownershipType)} accent="white"/>
                <SpecCard label="లావాదేవీ రకం" value={tr(property.transactionType)} accent="white"/>
                <SpecCard label="ఫర్నిషింగ్" value={tr(property.furnishing)} accent="var(--gold)"/>
                <SpecCard label="పార్కింగ్" value={tr(property.parking)} accent="white"/>
                <SpecCard label="RERA ID" value={property.reraId} accent="var(--gold)"/>
                {isAgri && <SpecCard label="సర్వే నంబర్" value={property.surveyNo} accent="#9b59f5"/>}
                <SpecCard label="రోడ్డు వెడల్పు" value={property.roadWidth ? `${property.roadWidth} Ft` : property.roadType} accent="white"/>
              </div>
            </section>

            {/* Listed By — Realtor Section */}
            {property.realtor?.name && (
              <section id="pd-realtor" className="pd-section" style={{ padding: '1.5rem', background: 'rgba(232,184,75,0.04)', border: '1px solid rgba(232,184,75,0.15)', borderRadius: '20px' }}>
                <h2 className="pd-section-h" style={{ marginBottom: '1.25rem' }}>Listed By (సమర్పించిన వ్యక్తి)</h2>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Avatar */}
                  {property.realtor.photo ? (
                    <img src={property.realtor.photo} alt={property.realtor.name} onError={e => { e.currentTarget.style.display = 'none'; }}
                      style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),#f5c842)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.8rem', color: 'black', flexShrink: 0 }}>
                      {property.realtor.name.charAt(0)}
                    </div>
                  )}
                  
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ color: 'white', fontWeight: 900, fontSize: '1.05rem' }}>{property.realtor.name}</span>
                      {property.realtor.contactId && (
                        <span style={{ background: 'rgba(16,217,140,0.15)', border: '1px solid rgba(16,217,140,0.3)', color: 'var(--emerald)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 800 }}>
                          ✓ Verified SnapAdda Partner
                        </span>
                      )}
                    </div>
                    {property.realtor.agency && (
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '4px' }}>🏢 {property.realtor.agency}</div>
                    )}
                    {property.realtor.licenseNo && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.25)', padding: '3px 10px', borderRadius: '8px', fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, marginBottom: '10px' }}>
                        <FileText size={11}/> RERA: {property.realtor.licenseNo}
                      </div>
                    )}

                    {property.realtor.phone && (
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                        <a href={`tel:${property.realtor.phone}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,217,224,0.1)', border: '1px solid rgba(34,217,224,0.3)', color: 'var(--cyan)', padding: '7px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '0.8rem', textDecoration: 'none' }}>
                          📞 Call Agent
                        </a>
                        <a href={`https://wa.me/91${property.realtor.phone.replace(/[^0-9]/g,'')}?text=Hi, I saw property ${property.propertyCode || ''} on SnapAdda. Can you share more details?`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)', color: '#25d366', padding: '7px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '0.8rem', textDecoration: 'none' }}>
                          💬 WhatsApp Agent
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            <section id="pd-amenities" className="pd-section">
              <h2 className="pd-section-h">సదుపాయాలు (Amenities)</h2>
              <div className="pd-amenities-grid">
                {(property?.amenities?.length > 0 ? property.amenities : ['Clear Title', 'Water Supply', 'Power Terminal', 'Security Wall', 'Vastu Optimized']).map((a, i) => (
                  <div key={i} className="pd-amenity-item">
                    <CheckCircle2 size={16} style={{ color: '#27c97d' }}/> {a}
                  </div>
                ))}
              </div>
            </section>

            <section id="pd-qna" className="pd-section">
              <h2 className="pd-section-h">ప్రశ్నలు & జవాబులు (Verified Q&A)</h2>
              <div className="pd-qna-list">
                {qna.map((q, i) => (
                  <div key={i} className="pd-qna-item">
                    <div className="pd-qna-q"><span className="pd-qna-qlabel">ప్రశ్న:</span> {q.question}</div>
                    {q.answer && <div className="pd-qna-a"><span className="pd-qna-alabel">జవాబు:</span> {q.answer}</div>}
                  </div>
                ))}
              </div>
              
              <div className="pd-ask-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
                  <MessageSquare size={18} style={{ color: 'var(--gold)' }}/> ఈ ప్రాపర్టీ గురించి అడగండి
                </h3>
                <form onSubmit={handleAskSubmit} style={{ marginTop: '1.5rem' }}>
                   <textarea
                     value={qText}
                     onChange={e => setQText(e.target.value)}
                     placeholder="ధర లేదా సైట్ విజిట్ గురించి మెసేజ్ చేయండి..."
                     className="pd-textarea"
                     style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', color: 'white', marginBottom: '1rem', outline: 'none' }}
                   />
                   <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                     <button type="submit" disabled={qSubmitting} className="pd-btn-primary" style={{ padding: '0.8rem 2rem', background: 'var(--gold)', color: '#000', fontWeight: 800 }}>
                       {qSubmitting ? 'కనెక్ట్ అవుతోంది...' : 'వివరాలు అడగండి'}
                     </button>
                   </div>
                </form>
              </div>
            </section>
          </main>

          <aside className="pd-sidebar-col">
            <div className="pd-contact-sticky">
              <div className="pd-contact-card">
                <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem' }}>ఏజెంట్‌ను సంప్రదించండి</div>
                <button onClick={() => window.location.href = `tel:${supportPhone}`} className="btn-3d-glass" style={{ width: '100%' }}>
                  <Phone size={20}/> కాల్ చేయండి
                </button>
                <div style={{ textAlign: 'center', margin: '0.75rem 0', opacity: 0.5, fontSize: '0.7rem', fontWeight: 800 }}>లేదా (OR)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button onClick={handleWhatsApp} className="btn-3d-glass-emerald" style={{ width: '100%' }}>
                    <MessageSquare size={18}/> వాట్సాప్ చాట్
                  </button>
                  <button onClick={() => navigate('/request-callback')} className="btn-3d-glass-dark" style={{ width: '100%' }}>
                    <Send size={18}/> కాల్‌బ్యాక్ రిక్వెస్ట్
                  </button>
                </div>
                <div className="pd-trust-row">
                  <div className="pd-trust-item"><ShieldCheck size={14}/> 100% SnapAdda వెరిఫైడ్</div>
                  <div className="pd-trust-item"><Award size={14}/> ప్రీమియం లిస్టింగ్</div>
                </div>
              </div>

              <div className="pd-quick-specs">
                <div style={{ fontSize: '0.7rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--gold)' }}>త్వరిత వివరాలు</div>
                <div className="pd-quick-row"><span className="pd-quick-lbl">మొత్తం ధర</span><span className="pd-quick-val" style={{ color: 'var(--gold)' }}>{formatSnapAddaPrice(displayPrice)}</span></div>
                <div className="pd-quick-row"><span className="pd-quick-lbl">విస్తీర్ణం</span><span className="pd-quick-val">{property.areaSize} {tr(property.measurementUnit)}</span></div>
                <div className="pd-quick-row"><span className="pd-quick-lbl">ఫేసింగ్</span><span className="pd-quick-val">{tr(property.facing)}</span></div>
                <div className="pd-quick-row"><span className="pd-quick-lbl">అనుమతి</span><span className="pd-quick-val" style={{ color: '#27c97d' }}>{property.approvalAuthority || 'అవును'}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="section-wrap" style={{ background: 'rgba(255,255,255,0.02)', padding: '4rem 0' }}>
          <div className="container">
            <div className="section-head" style={{ marginBottom: '3rem' }}>
              <div className="section-eyebrow">మీ కోసం ప్రత్యేకంగా</div>
              <h2 className="section-title">ఇలాంటి మరిన్ని ఆస్తులు</h2>
            </div>
            <div className="properties-grid">
              {similar.slice(0, 3).map(p => <PropertyCard key={p._id} {...p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ─── Share Modal ─── */}
      <AnimatePresence>
        {shareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShareModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9998, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(10px)', padding: '0 0 80px' }}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'rgba(10,10,20,0.98)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '28px 28px 0 0', padding: '28px 24px 24px', width: '100%', maxWidth: '500px', boxShadow: '0 -20px 60px rgba(0,0,0,0.8)' }}
            >
              {/* Handle bar */}
              <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', margin: '0 auto 20px' }} />
              <div style={{ fontWeight: 900, fontSize: '1.05rem', color: 'white', marginBottom: '20px', textAlign: 'center' }}>
                📤 షేర్ చేయండి
              </div>
              {/* Property preview */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                <div style={{ fontWeight: 800, color: 'white', marginBottom: '4px' }}>{property?.title}</div>
                <div>{property?.location} · {formatSnapAddaPrice((isAgri && agriTotalValue > 0) ? agriTotalValue : property?.price)}</div>
              </div>
              {/* Share options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={handleShareWhatsApp}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: '16px', color: '#25D366', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', width: '100%' }}>
                  <span style={{ fontSize: '1.4rem' }}>💬</span> WhatsApp షేర్
                </button>
                <button onClick={handleCopyLink}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.3)', borderRadius: '16px', color: '#e8b84b', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', width: '100%' }}>
                  <span style={{ fontSize: '1.4rem' }}>🔗</span> లింక్ కాపీ చేయండి
                </button>
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button onClick={handleNativeShare}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: 'rgba(155,89,245,0.1)', border: '1px solid rgba(155,89,245,0.3)', borderRadius: '16px', color: '#9b59f5', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', width: '100%' }}>
                    <span style={{ fontSize: '1.4rem' }}>📲</span> More Options
                  </button>
                )}
                <button onClick={() => setShareModal(false)}
                  style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', width: '100%' }}>
                  రద్దు చేయండి
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Bar */}
      <div className="pd-mobile-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(7, 7, 15, 0.98)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px', display: 'flex', gap: '8px', zIndex: 100001, boxShadow: '0 -10px 40px rgba(0,0,0,0.8)' }}>
        <button onClick={() => window.location.href = `tel:${supportPhone}`} className="btn-3d-glass" style={{ flex: 2, padding: '11px 6px', fontSize: '0.78rem' }}>
          <Phone size={16}/> కాల్
        </button>
        <button onClick={handleWhatsApp} className="btn-3d-glass-emerald" style={{ flex: 2, padding: '11px 6px', fontSize: '0.78rem' }}>
          <MessageSquare size={16}/> వాట్సాప్
        </button>
        <button
          onClick={handleLike}
          style={{
            flex: 1, padding: '11px 6px', fontSize: '0.78rem',
            background: liked ? 'rgba(255,80,80,0.18)' : 'rgba(255,255,255,0.07)',
            border: `1px solid ${liked ? 'rgba(255,80,80,0.5)' : 'rgba(255,255,255,0.12)'}`,
            color: liked ? '#ff5050' : 'rgba(255,255,255,0.75)',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px',
            transition: 'all 0.25s',
          }}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'}/>
          {likeCount > 0 && <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>{likeCount}</span>}
        </button>
        <button
          onClick={handleShare}
          style={{
            flex: 1, padding: '11px 6px', fontSize: '0.78rem',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.75)',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px',
            transition: 'all 0.25s',
          }}
        >
          <Share2 size={16}/>
          <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>షేర్</span>
        </button>
      </div>
    </div>
  );
}
