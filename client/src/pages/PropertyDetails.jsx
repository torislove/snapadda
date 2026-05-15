import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Share2, Heart, Shield, ShieldCheck, Phone, MessageSquare,
  ChevronLeft, ChevronRight, Eye, CheckCircle2, Building, User,
  BedDouble, Bath, Square, Compass, Award, Send, Star, Leaf, Maximize2,
  Droplets, Truck, FileText, ZoomIn, X, TreePine, TrendingUp, IndianRupee,
  LayoutGrid, Play, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchProperty, fetchSetting, askQuestion, fetchPropertyFAQs, likeProperty, shareProperty, fetchSimilarProperties, logActivity } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { formatSnapAddaPrice, formatSnapAddaPriceRange, formatLandSize, calcAgriTotalValue, getAcres, getCents, getEffectivePricePerUnit } from '../utils/priceUtils';
import { useTranslation } from 'react-i18next';
import VisualCompass from '../components/VisualCompass';
import EliteLightBox from '../components/EliteLightBox';
import { useBehaviorTracker } from '../hooks/useBehaviorTracker';
import { prefetchRoute } from '../utils/PerformanceUtilities';
import { useRealtimeProperties } from '../hooks/useRealtimeProperties';
import { Helmet } from 'react-helmet-async';
import PropertyMap from '../components/PropertyMap';
import ShareControlCenter from '../components/ShareControlCenter';
import { DOMAIN } from '../utils/shareUtils';

// ----------------------------------------------------------------------------------
// Toast
// ----------------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------------
// LightBox
// ----------------------------------------------------------------------------------
// EliteLightBox is now imported from components

// ----------------------------------------------------------------------------------
// Spec Card
// ----------------------------------------------------------------------------------
function SpecCard({ label, value, accent = 'white', icon }) {
  if (!value || value === 'N/A' || value === '0') return null;
  return (
    <div className="pd-spec-item" style={{ 
      '--ov-accent': accent, 
      padding: '1.25rem', 
      background: 'rgba(255,255,255,0.05)', 
      border: '1px solid rgba(255,255,255,0.12)', 
      borderRadius: '20px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '8px' 
    }}>
      <div className="pd-spec-lbl" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {icon} {label}
      </div>
      <div className="pd-spec-val" style={{ color: 'white', fontSize: '1rem', fontWeight: 900 }}>{value}</div>
    </div>
  );
}

// ----------------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------------
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

  useEffect(() => {
    fetchSetting('marketing_settings').then(data => {
      if (data) setSupportInfo({
        phone: data.supportPhone,
        whatsapp: data.waNumber,
        email: data.supportEmail
      });
    });
  }, []);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [similar, setSimilar] = useState([]);
  const [toast, setToast] = useState('');
  const [shareModal, setShareModal] = useState(false);
  const galleryRef = useRef(null);

  // Derived from property — safe defaults prevent ReferenceError
  const isVerified = property?.isVerified ?? false;
  const isFeatured = property?.isFeatured ?? false;
  const isElite = property?.isElite ?? false;
  const isTrustVerified = property?.isTrustVerified ?? false;



  // Q&A
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [qText, setQText] = useState('');
  const [qStatus, setQStatus] = useState('');
  const [qSubmitting, setQSubmitting] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Real-time synchronization
  const { data: liveData } = useRealtimeProperties(id);

  // Sync liveData to property state
  useEffect(() => {
    if (liveData) {
      setProperty(prev => {
        const next = { ...prev, ...liveData };
        // HEAL: If liveData (Firebase) is missing the link but prev (MongoDB) has it, preserve MongoDB's link.
        // This handles cases where Firebase sync might have been delayed or failed.
        if (!liveData.googleMapsLink && prev?.googleMapsLink) {
          next.googleMapsLink = prev.googleMapsLink;
        }
        return next;
      });
      if (liveData.likeCount !== undefined) setLikeCount(liveData.likeCount);
    }
  }, [liveData]);

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

        // Server-side Activity Logging for Admin Tracking
        logActivity({
          type: 'PROPERTY_VIEW',
          payload: { propertyId: data._id, title: data.title, type: data.type, location: data.location },
          context: window.location.pathname
        });

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
    if (media.includes('placeholder') || media.includes('dummy') || media === 'null' || media === 'undefined' || media.includes('no-image') || media.includes('default-property')) return false;
    return true;
  };

  const rawImages = [
    ...(property?.images || []),
    ...(property?.gallery || []),
    property?.image
  ].filter(isValidMedia);
  
  // Deduplicate
  const uniqueRaw = [...new Set(rawImages)];

  const photoUrls = uniqueRaw.filter(url => !url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i));
  const videoUrlsFromImages = uniqueRaw.filter(url => url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i));

  const validPhotos = photoUrls.slice(0, 15);
  
  const validVideos = [
    ...videoUrlsFromImages,
    ...(property?.videos || []),
    property?.videoUrl
  ].filter(isValidMedia)
    .slice(0, 5);
  
  const uniqueVideos = [...new Set(validVideos)];

  // Final gallery set for the scroller
  let galleryMedia = [
    ...validPhotos.map(url => ({ type: 'image', url })),
    ...uniqueVideos.map(url => ({ type: 'video', url }))
  ];

  const actualMediaCount = (validPhotos || []).length + (uniqueVideos || []).length;
  // If absolutely no media, provide a premium architectural placeholder
  if (galleryMedia.length === 0) {
    galleryMedia = [{ 
      type: 'image', 
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
      isPlaceholder: true 
    }];
  }
  // Fallback Google Maps Link generation if missing
  const finalGoogleMapsLink = property?.googleMapsLink?.trim().startsWith('http') 
    ? property.googleMapsLink.trim() 
    : (property?.googleMapsLink ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.googleMapsLink.trim())}` : null);
  const hasMapLink = !!finalGoogleMapsLink;  
  
  const propType = (property?.type || '').toLowerCase();
  const isAgri = propType.includes('agri') || propType.includes('farm');
  const isPlot = propType.includes('plot') || propType.includes('layout') || propType.includes('crda');
  const isCommercial = propType.includes('commercial') || propType.includes('shop') || propType.includes('office') || propType.includes('showroom');
  const isIndustrial = propType.includes('industrial') || propType.includes('shed') || propType.includes('warehouse') || propType.includes('factory');
  const isLand = isAgri || isPlot || isIndustrial;
  const isResidential = !isLand && !isCommercial && !isIndustrial;

  const specGroups = useMemo(() => {
    if (!property) return [];
    const p = property;
    
    return [
      {
        title: 'చట్టపరమైన & గుర్తింపు (SnapAdda ID)',
        icon: <Shield size={18} />,
        items: [
          { label: 'Asset ID', value: `SNA-${(p._id || '').toString().slice(-6).toUpperCase()}` },
          { label: 'Property Code', value: p.propertyCode },
          { label: 'RERA ID', value: p.reraId },
          { label: 'Approval Authority', value: p.approvalAuthority },
          { label: 'Approval Number (L.P. No)', value: p.approvalNumber },
          { label: 'Layout / Venture Name', value: p.layoutName },
          { label: 'Survey Number', value: p.surveyNo },
          { label: 'Ownership Type', value: p.ownershipType },
          { label: 'Vastu Compliant', value: p.vastuCompliant ? 'Yes ✅' : 'No' }
        ]
      },
      {
        title: 'ప్రాంతం & రహదారి (Location & Road)',
        icon: <MapPin size={18} />,
        items: [
          { label: 'Mandal / Tahsil', value: p.mandal },
          { label: 'Village / Locality', value: p.village },
          { label: 'District', value: p.district },
          { label: 'Pincode', value: p.pincode },
          { label: 'Road Type', value: p.roadType },
          { label: 'Road Width', value: p.roadWidth ? `${p.roadWidth} Feet` : null },
          { label: 'Overlooking', value: p.overlooking }
        ]
      },
      {
        title: 'నిర్మాణం & రూపకల్పన (Building & Structure)',
        icon: <Building size={18} />,
        items: [
          { label: 'Configuration', value: p.bhk ? `${p.bhk} BHK` : p.beds ? `${p.beds} Bedrooms` : null },
          { label: 'Floor Level', value: p.floorNo ? `Floor ${p.floorNo}` : null },
          { label: 'Total Floors', value: p.totalFloors },
          { label: 'Property Age', value: p.propertyAge },
          { label: 'Construction Status', value: p.constructionStatus },
          { label: 'Furnishing', value: p.furnishing },
          { label: 'Corner Property', value: p.cornerProperty ? 'Yes' : null }
        ]
      },
      {
        title: 'సౌకర్యాలు & నిర్వహణ (Utilities & Maint)',
        icon: <Zap size={18} />,
        items: [
          { label: 'Parking', value: p.parking },
          { label: 'Water Supply', value: p.waterSupply || p.waterSource },
          { label: 'Electricity Power', value: p.powerKVA ? `${p.powerKVA} KVA` : null },
          { label: 'Security Level', value: p.securityLevel },
          { label: 'Fire Safety', value: p.fireSafety ? 'Certified ✅' : null },
          { label: 'Maintenance Fee', value: p.maintenanceFee ? `₹ ${p.maintenanceFee} / Mo` : null }
        ]
      },
      {
        title: 'పారిశ్రామిక & సాంకేతిక (Industrial & Technical)',
        icon: <Zap size={18} />,
        items: [
          { label: 'Ceiling Height', value: p.ceilingHeight ? `${p.ceilingHeight} Feet` : null },
          { label: 'Loading Docks', value: p.loadingDocks || null },
          { label: 'Floor Type', value: p.floorType !== 'N/A' ? p.floorType : null },
          { label: 'Water Source', value: p.waterSource !== 'N/A' ? p.waterSource : null }
        ]
      }
    ].map(g => ({
      ...g,
      items: g.items.filter(i => i.value && i.value !== 'N/A' && i.value !== '0' && i.value !== 0)
    })).filter(g => g.items.length > 0);
  }, [property]);

  const pricePerUnitLabel = useMemo(() => {
    if (!property) return '';
    if (isAgri) return 'ఎకరా ధర (Per Acre)';
    if (isPlot) return 'గజం ధర (Per Sq.Yard)';
    return 'చదరపు అడుగు ధర (Per Sq.Ft)';
  }, [property, isAgri, isPlot]);

  const agriAcres = getAcres(property?.areaSize);
  const agriCents = getCents(property?.areaSize);
  
  // Robust pricing derivation via standardized utility
  const unitPrices = getEffectivePricePerUnit(property);
  const effectivePricePerAcre = unitPrices?.acre || 0;
  const pricePerCent = unitPrices?.cent || 0;
  const agriTotalValue = calcAgriTotalValue(effectivePricePerAcre, property?.areaSize);
  
  // Effective price for single-value logic (like sharing)
  const displayPrice = (isAgri && agriTotalValue > 0) ? agriTotalValue : property?.price;
  const rangeDisplay = formatSnapAddaPriceRange(property);

  const handleLike = async () => {
    if (!user) { navigate('/login', { state: { from: window.location.pathname } }); return; }
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
        showToast(res.data.liked ? 'ప్రాపర్టీని ఇష్టపడ్డారు!' : 'ప్రాపర్టీని ఇష్టపడలేదు');
      } else {
        setLiked(wasLiked); setLikeCount(prevCount);
        showToast('ఏదో తేడా జరిగింది, దయచేసి మళ్ళీ ప్రయత్నించండి');
      }
    } catch {
      setLiked(wasLiked); setLikeCount(prevCount);
      showToast('సర్వర్ లోపం, దయచేసి మళ్ళీ ప్రయత్నించండి');
    }
  };

  const getShareUrl  = () => window.location.href;
  const getShareText = () => {
    const price = (isAgri && agriTotalValue > 0) ? agriTotalValue : property?.price;
    const code  = property?.propertyCode || '';
    const displayPriceStr = property?.priceDisplay || formatSnapAddaPriceRange(property);
    return `🏡 *${property?.title}*\n📍 ${property?.location}, ${property?.district || ''}\n🪪 Code: *${code}*\n${displayPriceStr}\n\n🔗 ${getShareUrl()}\n\n_SnapAdda 📍 Andhra's Leading Property Platform_`;
  };

  const handleShare = () => setShareModal(true);

  const handleWhatsApp = () => {
    const wa = supportInfo?.whatsapp || '919346793364';
    const waMsg = `నమస్కారం SnapAdda! మీ ప్లాట్‌ఫారమ్‌లోని ఈ ప్రాపర్టీ పై ఆసక్తి ఉంది:\n\n*${property?.title}*\nరకం: ${t(`types.${(property?.type || 'apartment').toLowerCase()}`)}\nప్రాంతం: ${property?.location}\nధర: ${formatSnapAddaPriceRange(property)}\n\nలింక్: ${window.location.href}`;
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
          showToast('మీ ప్రశ్న పంపబడింది. త్వరలోనే మీకు సమాధానం లభిస్తుంది.');
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

  const generateDesc = (p) => {
    if (p.description && p.description.length > 50) return p.description;
    const loc = p.location || 'Andhra Pradesh';
    const dist = p.district ? ` in ${p.district} district` : '';
    let d = `This ${(p.type || 'property').toLowerCase()} is located in the growing area of ${loc}${dist}. `;
    
    if (p.approvalAuthority && p.approvalAuthority !== 'N/A' && p.approvalAuthority !== 'None') {
      d += `This asset is ${p.approvalAuthority} approved, ensuring institutional-grade security. `;
    }

    if (isAgri) {
      d += `Spanning ${formatLandSize(p.areaSize)} of land, it presents a strong investment with a valuation of ${formatSnapAddaPrice(agriTotalValue || p.price || 0)}. `;
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
      <p>ప్రాపర్టీ వివరాలు లోడ్ అవుతున్నాయి...</p>
    </div>
  );

  // --- PREMIUM AUTH GATE ---
  // Show a blurred preview with a sign-in overlay for guests
  if (!loading && !user && property) {
    return (
      <div style={{ minHeight: '100vh', background: '#05050a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Blurred background preview */}
        <div style={{ position: 'absolute', inset: 0, filter: 'blur(12px)', opacity: 0.3, backgroundImage: `url(${property.images?.[0] || property.image || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,10,0.85)' }} />
        
        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'relative', zIndex: 10,
            width: '90%', maxWidth: '480px',
            background: 'rgba(10,12,20,0.95)',
            border: '1px solid rgba(232,184,75,0.3)',
            borderRadius: '32px', padding: '2.5rem',
            boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(232,184,75,0.05)',
            backdropFilter: 'blur(40px)',
            textAlign: 'center'
          }}
        >
          {/* Property Preview Info */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>SnapAdda Premium Listing</div>
            <h2 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1.3 }}>{property.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <MapPin size={14} style={{ color: 'var(--gold)' }} />
              {property.location}{property.district ? `, ${property.district}` : ''}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 950, color: 'var(--gold)', letterSpacing: '-0.02em' }}>
              {property.priceDisplay || formatSnapAddaPriceRange(property)}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '1.5rem 0' }} />

          {/* Sign-in CTA */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              🔒 Sign in to view full property details, contact the agent, and save this listing
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                sessionStorage.setItem('snapadda_redirect', `/property/${id}`);
                navigate('/login');
              }}
              style={{
                width: '100%', padding: '16px', borderRadius: '18px',
                background: 'linear-gradient(135deg, var(--gold), #f5c842)',
                color: 'black', border: 'none', fontWeight: 950,
                fontSize: '1rem', cursor: 'pointer', letterSpacing: '0.05em',
                boxShadow: '0 15px 35px rgba(232,184,75,0.3)'
              }}
            >
              Sign In to View Details →
            </motion.button>
            <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', fontWeight: 700 }}>
              Free · 10 seconds · No spam
            </div>
          </div>

          {/* Back link */}
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700 }}
          >
            ← Back to Listings
          </button>
        </motion.div>
      </div>
    );
  }

  if (!property) return (
    <div className="pd-page" style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      minHeight: '80vh', gap: '2rem', textAlign: 'center', padding: '2rem',
      background: 'radial-gradient(circle at center, #0a0c14 0%, #05050a 100%)'
    }}>
      <div style={{ position: 'relative' }}>
        <Building size={120} style={{ color: 'var(--gold)', opacity: 0.1 }}/>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={48} style={{ color: 'var(--gold)', opacity: 0.4 }}/>
        </div>
      </div>
      <div>
        <h2 style={{ color: 'white', fontWeight: 900, fontSize: '1.5rem', marginBottom: '1rem' }}>క్షమించండి! ఈ ప్రాపర్టీ వివరాలు అందుబాటులో లేవు.</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '400px', margin: '0 auto 2rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Requested asset could not be retrieved. It may have been sold or removed from the SnapAdda inventory.
        </p>
      </div>
      <button 
        className="btn-3d-glass" 
        onClick={() => navigate('/')}
        style={{ padding: '12px 32px', borderRadius: '40px', background: 'var(--gold)', color: 'black', fontWeight: 900, border: 'none', cursor: 'pointer' }}
      >
        మళ్ళీ ప్రయత్నించండి (Back to Inventory)
      </button>
    </div>
  );


  const supportPhone = (supportInfo?.phone || '+91 93467 93364').replace(/\s+/g, '');
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
    { id: 'qna', label: 'ప్రశ్నలు & సమాధానాలు' },
  ];

  return (
    <>
      <div className="pd-page" style={{ 
          width: isMobile ? '100%' : '50%', 
          margin: '0 auto', 
          background: '#05050a', 
          minHeight: '100vh',
          borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,0.05)',
          borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.05)'
      }}>
      <Helmet>
        <title>{property?.title ? `${property.title} | SnapAdda` : 'Property Details | SnapAdda'}</title>
        <meta name="description" content={generateDesc(property || {})} />
        
        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={property?.title || 'Premium Property on SnapAdda'} />
        <meta property="og:description" content={generateDesc(property || {})} />
        <meta property="og:image" content={property?.images?.[0] || property?.image || '/og-image.jpg'} />
        <meta property="og:site_name" content="SnapAdda" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={window.location.href} />
        <meta name="twitter:title" content={property?.title || 'Premium Property on SnapAdda'} />
        <meta name="twitter:description" content={generateDesc(property || {})} />
        <meta name="twitter:image" content={property?.images?.[0] || property?.image || '/og-image.jpg'} />

        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <ShareControlCenter 
        isOpen={shareModal} 
        onClose={() => setShareModal(false)} 
        property={property} 
      />

      {/* --- UNIFIED SPLIT HERO SECTION --- */}
      <section className="pd-hero-split" style={{ background: '#05050a', paddingTop: isMobile ? '0' : '2rem' }}>
        <div className="container" style={{ maxWidth: '1440px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1fr', 
            gap: isMobile ? '0' : '3rem',
            alignItems: 'start'
          }}>
            
            {/* LEFT SIDE: Media & Gallery (Smaller) */}
            <div style={{ position: 'relative', width: '100%', borderRadius: isMobile ? '0' : '24px', overflow: 'hidden', boxShadow: isMobile ? 'none' : '0 30px 60px rgba(0,0,0,0.5)' }}>
              {isMobile ? (
                <div style={{ position: 'relative' }}>
                  <div 
                    className="pd-snap-gallery hide-scrollbar" 
                    style={{ 
                      display: 'flex', 
                      overflowX: 'auto', 
                      scrollSnapType: 'x mandatory', 
                      height: '45vh',
                      width: '100%',
                      background: '#000'
                    }}
                  >
                    {galleryMedia.map((media, i) => (
                      <div key={i} style={{ flex: '0 0 100%', scrollSnapAlign: 'start', position: 'relative' }} onClick={() => { setImgIdx(i); setLightbox(true); }}>
                        {media.type === 'video' ? (
                          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(232,184,75,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Play size={24} fill="black" color="black" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img src={getOptimizedImg(media.url, 800)} alt={`${property.title} - ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)' }} />
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setLightbox(true)}
                    style={{
                      position: 'absolute', bottom: '20px', right: '15px',
                      background: 'rgba(232,184,75,0.9)', backdropFilter: 'blur(10px)', border: 'none',
                      color: 'black', padding: '10px 16px', borderRadius: '15px', fontSize: '0.7rem', fontWeight: 900,
                      display: 'flex', alignItems: 'center', gap: '6px', zIndex: 10
                    }}
                  >
                    <LayoutGrid size={14} /> {actualMediaCount} PHOTOS
                  </button>
                </div>
              ) : (
                <div style={{ height: '560px', position: 'relative', cursor: 'pointer' }} onClick={() => { setImgIdx(0); setLightbox(true); }}>
                   <img src={getOptimizedImg(galleryMedia[0]?.url, 1000)} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                   <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', display: 'flex', justifyContent: 'center' }}>
                      <button style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '12px 24px', borderRadius: '40px', fontWeight: 900, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <LayoutGrid size={16} color="var(--gold)"/> VIEW ALL {actualMediaCount} MEDIA
                      </button>
                   </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDE: Header Info & Actions */}
            <div style={{ padding: isMobile ? '2rem 1.5rem' : '1rem 0' }}>
               <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  <span style={{ background: 'rgba(232,184,75,0.1)', color: 'var(--gold)', border: '1px solid rgba(232,184,75,0.25)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>SNA-{(id || '').toString().slice(-6).toUpperCase()}</span>
                  <span style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>{t(`types.${(property?.type || 'apartment').toLowerCase()}`)}</span>
                  {isVerified && <span style={{ background: 'rgba(16,217,140,0.1)', color: '#10d98c', border: '1px solid rgba(16,217,140,0.3)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>సర్టిఫైడ్ (VERIFIED)</span>}
                  {isElite && (
                    <span style={{ background: 'linear-gradient(45deg, #0f172a, #1e293b)', color: '#e8b84b', border: '1px solid #e8b84b', boxShadow: '0 0 15px rgba(232,184,75,0.3)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <Award size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> ELITE ASSET
                    </span>
                  )}
                  {isTrustVerified && (
                    <span style={{ background: 'rgba(232,184,75,0.1)', color: 'var(--gold)', border: '1px solid rgba(232,184,75,0.3)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>
                      <CheckCircle2 size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> TRUST SEAL
                    </span>
                  )}
                  <span style={{ 
                      background: property.purpose === 'Rent' ? 'rgba(34,217,224,0.1)' : 'rgba(39,201,125,0.1)',
                      color: property.purpose === 'Rent' ? '#22d9e0' : '#27c97d',
                      border: `1px solid ${property.purpose === 'Rent' ? '#22d9e033' : '#27c97d33'}`,
                      fontSize: '0.65rem', fontWeight: 900, padding: '6px 14px', borderRadius: '30px', textTransform: 'uppercase'
                  }}>
                      {t(`purposes.${(property.purpose || 'Sale').toLowerCase()}`)}
                  </span>
               </div>

               <h1 style={{ 
                  fontSize: isMobile ? '1.8rem' : '2.8rem', 
                  fontWeight: 950, 
                  lineHeight: 1.15,
                  marginBottom: '1rem', 
                  color: 'white', 
                  letterSpacing: '-0.02em'
               }}>
                 {property.title}
               </h1>

               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                  <MapPin size={22} style={{ color: 'var(--gold)' }}/>
                  <div>
                    <div style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 800, color: 'white' }}>{property.location} {property.district ? `(${property.district})` : ''}</div>
                    {(property.address || property.village) && (
                      <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                        {property.village ? `${property.village}, ` : ''}{property.address || ''} {property.pincode ? `- ${property.pincode}` : ''}
                      </div>
                    )}
                  </div>
               </div>

               <div style={{ 
                  background: 'rgba(232,184,75,0.03)', 
                  border: '1px solid rgba(232,184,75,0.15)', 
                  padding: '1.5rem', 
                  borderRadius: '24px', 
                  marginBottom: '2rem' 
               }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
                    {property.priceType === 'range' ? 'Expected Price Range' : 'Snapshot Pricing'}
                  </div>
                  <div style={{ fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 950, color: 'var(--gold)', lineHeight: 1 }}>
                    {property.priceDisplay || formatSnapAddaPriceRange(property)}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#27c97d', fontWeight: 700 }}>
                    {property.pricePerUnit ? `≈ ${formatSnapAddaPrice(property.pricePerUnit)} ${pricePerUnitLabel}` : 'Exclusive Valuation'}
                  </div>
               </div>

               <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => {
                      const el = document.getElementById('pd-contact-box');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{ flex: 1, padding: '16px', borderRadius: '18px', background: 'var(--gold)', color: 'black', border: 'none', fontWeight: 950, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 15px 30px rgba(232,184,75,0.3)' }}
                  >
                    CONTACT AGENT
                  </button>
                  <button 
                    onClick={handleLike}
                    style={{ width: '56px', height: '56px', borderRadius: '18px', background: liked ? 'var(--gold)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: liked ? 'black' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
                  >
                    <Heart size={24} fill={liked ? 'currentColor' : 'none'}/>
                  </button>
                  <button 
                    onClick={handleShare}
                    style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Share2 size={24}/>
                  </button>
               </div>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>{toast && <Toast msg={toast}/>}</AnimatePresence>
      <AnimatePresence>
        {lightbox && (
          <EliteLightBox 
            images={validPhotos.map(img => getOptimizedImg(img, 1200))} 
            videos={uniqueVideos} 
            startIdx={imgIdx} 
            title={property.title}
            onClose={() => setLightbox(false)}
          />
        )}
      </AnimatePresence>

      <div className="container" style={{ marginTop: isMobile ? '1.5rem' : '3rem' }}>
        <div className="pd-body-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: isMobile ? '2rem' : '3rem', 
          alignItems: 'start',
          paddingBottom: '8rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <main className="pd-main-col" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '2.5rem' : '4rem' }}>
            <section id="pd-overview" className="pd-section" style={{ background: 'rgba(255,255,255,0.02)', padding: isMobile ? '1.5rem' : '2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="pd-section-h" style={{ margin: 0 }}>ప్రాంతం యొక్క అవలోకనం (Property DNA)</h2>
                {property.isVerified && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,217,140,0.1)', padding: '6px 12px', borderRadius: '12px', border: '1px solid rgba(16,217,140,0.2)' }}>
                    <ShieldCheck size={14} color="#10d98c" />
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#10d98c', textTransform: 'uppercase' }}>100% Verified Asset</span>
                  </div>
                )}
              </div>

              <div className="pd-overview-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {isAgri && (
                  <>
                    <div className="pd-ov-card" style={{ '--ov-accent': '#27c97d', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Leaf size={24} style={{ color: '#27c97d' }}/>
                      <div style={{ fontSize: '1.1rem', fontWeight: 950, color: 'white' }}>{formatLandSize(property.areaSize, false)}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>మొత్తం విస్తీర్ణం</div>
                    </div>
                    <div className="pd-ov-card" style={{ '--ov-accent': 'var(--gold)', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <TrendingUp size={24} style={{ color: 'var(--gold)' }}/>
                      <div style={{ fontSize: '1.1rem', fontWeight: 950, color: 'white' }}>{formatSnapAddaPrice(effectivePricePerAcre)}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>ఎకరా ధర (Per Acre)</div>
                    </div>
                  </>
                )}
                {isPlot && (
                  <>
                    <div className="pd-ov-card" style={{ '--ov-accent': '#22d9e0', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Square size={24} style={{ color: '#22d9e0' }} />
                      <div style={{ fontSize: '1.1rem', fontWeight: 950, color: 'white' }}>{property.areaSize} {t(`units.${(property.measurementUnit || 'Sq.Yards').toLowerCase()}`)}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>మొత్తం విస్తీర్ణం</div>
                    </div>
                    {property.approvalAuthority && (
                      <div className="pd-ov-card" style={{ '--ov-accent': 'var(--gold)', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Award size={24} style={{ color: 'var(--gold)' }}/>
                        <div style={{ fontSize: '1.1rem', fontWeight: 950, color: 'white' }}>{property.approvalAuthority}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>అప్రూవల్ (Authority)</div>
                      </div>
                    )}
                  </>
                )}
                {isResidential && (
                  <>
                    <div className="pd-ov-card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <BedDouble size={24} style={{ color: 'var(--gold)' }}/>
                      <div style={{ fontSize: '1.1rem', fontWeight: 950, color: 'white' }}>{property.bhk || property.beds} BHK</div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 800, textTransform: 'uppercase' }}>కాన్ఫిగరేషన్</div>
                    </div>
                    {property.areaSize > 0 && (
                      <div className="pd-ov-card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Square size={24} style={{ color: 'var(--cyan)' }}/>
                        <div style={{ fontSize: '1.1rem', fontWeight: 950, color: 'white' }}>{property.areaSize} {t(`units.${(property.measurementUnit || 'Sq.Ft').toLowerCase()}`)}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 800, textTransform: 'uppercase' }}>విస్తీర్ణం (SFT)</div>
                      </div>
                    )}
                  </>
                )}
                
                <div className="pd-ov-card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <VisualCompass facing={property.facing} size={40} />
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 950, color: 'white', textTransform: 'uppercase' }}>{t(`facing.${(property.facing || 'any').toLowerCase()}`)}</div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 800, textTransform: 'uppercase' }}>దిశ (Facing)</div>
                  </div>
                </div>
              </div>

              {/* ── NEW: ELITE ANIMATED MAP ACCESS BAR ── */}
              <div style={{ marginTop: '2rem' }}>
                <motion.button
                  whileHover={{ scale: 1.01, background: 'rgba(232,184,75,0.12)' }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    const link = property.googleMapsLink?.trim();
                    if (link) {
                      window.open(link.startsWith('http') ? link : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(link)}`, '_blank');
                    } else {
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.location} ${property.district} Andhra Pradesh`)}`, '_blank');
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '1.5rem',
                    background: 'rgba(232,184,75,0.06)',
                    border: '1.5px solid rgba(232,184,75,0.3)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ position: 'relative', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ position: 'absolute', width: '100%', height: '100%', background: 'var(--gold)', borderRadius: '50%', filter: 'blur(10px)' }}
                      />
                      {/* Colorful Google Maps Logo Pin (Custom SVG) */}
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ zIndex: 2 }}>
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#EA4335" />
                        <circle cx="12" cy="9" r="3" fill="#FBBC05" />
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 10.53 5.46 12.01 6.22 13.31L12 22L17.78 13.31C18.54 12.01 19 10.53 19 9C19 5.13 15.87 2 12 2Z" fill="url(#mapGradient)" opacity="0.3" />
                        <defs>
                          <linearGradient id="mapGradient" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#4285F4" />
                            <stop offset="1" stopColor="#34A853" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: 'white', fontWeight: 950, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>GOOGLE MAPS LOCATION</div>
                      <div style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>View Site Direction & Proximity</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '12px', color: 'white', fontWeight: 900, fontSize: '0.75rem' }}>
                    OPEN MAP →
                  </div>
                </motion.button>
              </div>
            </section>

            <section id="pd-specs" className="pd-section">
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 className="pd-section-h" style={{ marginBottom: '0.5rem' }}>మరిన్ని వివరాలు (Specifications)</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Detailed breakdown of property attributes, legal status, and amenities.</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                 {/* AI Description with Dual Language Support */}
                 <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                      <FileText size={20} style={{ color: 'var(--gold)' }}/>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', margin: 0 }}>వివరణ (Description)</h3>
                    </div>
                    <p className="pd-desc-text" style={{ fontSize: '1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', whiteSpace: 'pre-wrap' }}>
                      {property.description || generateDesc(property)}
                    </p>
                 </div>

                 {/* Full Address Card */}
                 <div style={{ background: 'rgba(232,184,75,0.05)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(232,184,75,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                      <MapPin size={20} style={{ color: 'var(--gold)' }}/>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', margin: 0 }}>పూర్తి చిరునామా (Full Address & Location)</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '2rem' }}>
                       <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 800 }}>STREET ADDRESS</div>
                          <div style={{ fontSize: '1.1rem', color: 'white', fontWeight: 800, lineHeight: 1.6 }}>
                            {property.address || 'Contact agent for exact street details'}
                          </div>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div>
                             <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>VILLAGE / MANDAL</div>
                             <div style={{ color: 'white', fontWeight: 800 }}>{property.village || property.mandal || property.location}</div>
                          </div>
                          <div>
                             <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>DISTRICT & PINCODE</div>
                             <div style={{ color: 'white', fontWeight: 800 }}>{property.district} {property.pincode ? `- ${property.pincode}` : ''}</div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Structured Spec Groups */}
                 <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                   {specGroups.map((group, idx) => (
                     <div key={idx} style={{ background: 'rgba(255,255,255,0.04)', padding: '1.75rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                           <div style={{ color: 'var(--gold)' }}>{group.icon}</div>
                           <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{group.title}</h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                           {group.items.map((item, i) => (
                             <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
                                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{item.label}</span>
                                <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 900, textAlign: 'right' }}>{item.value}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                   ))}
                 </div>

                 {/* Property Features Tags */}
                 {property.amenities?.length > 0 && (
                    <div id="pd-amenities" style={{ background: 'rgba(232,184,75,0.03)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(232,184,75,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <Award size={20} style={{ color: 'var(--gold)' }}/>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', margin: 0 }}>సదుపాయాలు (Amenities & Features)</h3>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {property.amenities.map((item, idx) => (
                          <span key={idx} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                 )}
              </div>
            </section>

            <section id="pd-neighborhood" className="pd-section">
              <h2 className="pd-section-h">Neighborhood Intelligence (పరిసర ప్రాంతాల విశ్లేషణ)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {/* Connectivity Score */}
                <div className="glass-premium" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(34,217,224,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ color: 'var(--cyan)', fontWeight: 900, fontSize: '0.85rem' }}>Connectivity</div>
                    <div style={{ color: 'white', fontWeight: 900 }}>9.2/10</div>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} whileInView={{ width: '92%' }} transition={{ duration: 1 }} style={{ height: '100%', background: 'var(--cyan)' }} />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '10px' }}>Excellent access to National Highway and proposed Metro station.</p>
                </div>
                {/* Healthcare Score */}
                <div className="glass-premium" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(16,217,140,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ color: 'var(--emerald)', fontWeight: 900, fontSize: '0.85rem' }}>Medical Care</div>
                    <div style={{ color: 'white', fontWeight: 900 }}>8.5/10</div>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} whileInView={{ width: '85%' }} transition={{ duration: 1 }} style={{ height: '100%', background: 'var(--emerald)' }} />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '10px' }}>3 multi-speciality hospitals within a 5km radius.</p>
                </div>
                {/* Investment Potential */}
                <div className="glass-premium" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(232,184,75,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '0.85rem' }}>High Growth Hub</div>
                    <div style={{ color: 'white', fontWeight: 900 }}>Elite</div>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} whileInView={{ width: '95%' }} transition={{ duration: 1 }} style={{ height: '100%', background: 'var(--gold)' }} />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '10px' }}>Predicted 18-22% appreciation in next 24 months.</p>
                </div>
              </div>

              {/* Interactive Location Map */}
              {hasMapLink && (
                <a
                  href={finalGoogleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    marginTop: '1.5rem', marginBottom: '1rem',
                    background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.3)',
                    color: '#4285f4', padding: '12px 20px', borderRadius: '14px',
                    fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <MapPin size={18} />
                  Google Maps లో చూడండి (Open in Google Maps)
                </a>
              )}
              <div style={{ marginTop: '1rem', height: '400px', width: '100%', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <PropertyMap 
                  properties={[property]} 
                  selectedProperty={property}
                />
              </div>
            </section>

            {property.realtor?.name && (
              <section id="pd-realtor" className="pd-section" style={{ padding: '1.5rem', background: 'rgba(232,184,75,0.04)', border: '1px solid rgba(232,184,75,0.15)', borderRadius: '20px' }}>
                <h2 className="pd-section-h" style={{ marginBottom: '1.25rem' }}>Listed By (సమర్పించిన వ్యక్తి)</h2>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {property.realtor.photo ? (
                    <img src={property.realtor.photo} alt={property.realtor.name} onError={e => { e.currentTarget.style.display = 'none'; }}
                      style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),#f5c842)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.8rem', color: 'black', flexShrink: 0 }}>
                      {property.realtor.name.charAt(0)}
                    </div>
                  )}
                  
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ color: 'white', fontWeight: 900, fontSize: '1.05rem' }}>{property.realtor.name}</span>
                      {property.realtor.contactId && (
                        <span style={{ background: 'rgba(16,217,140,0.15)', border: '1px solid rgba(16,217,140,0.3)', color: 'var(--emerald)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 800 }}>
                           Verified SnapAdda Partner
                        </span>
                      )}
                    </div>
                    {property.realtor.agency && (
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '4px' }}>𨘻 {property.realtor.agency}</div>
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
                           Call Agent
                        </a>
                        <a href={`https://wa.me/91${property.realtor.phone.replace(/[^0-9]/g,'')}?text=Hi, I saw property ${property.propertyCode || ''} on SnapAdda. Can you share more details?`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)', color: '#25d366', padding: '7px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '0.8rem', textDecoration: 'none' }}>
                          俥 WhatsApp Agent
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

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
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', marginBottom: '1.5rem' }}>
                  <MessageSquare size={18} style={{ color: 'var(--gold)' }}/> ఈ ప్రాపర్టీ గురించి అడగండి
                </h3>
                <form onSubmit={handleAskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <textarea 
                    value={qText} onChange={e => setQText(e.target.value)}
                    placeholder="మీ ప్రశ్న ఇక్కడ రాయండి..."
                    style={{ width: '100%', minHeight: '100px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', borderRadius: '16px', fontSize: '0.95rem' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={qSubmitting} className="pd-btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '0.9rem' }}>
                      {qSubmitting ? 'పంపుతున్నాము...' : 'ప్రశ్న అడగండి'}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </main>

          <aside className="pd-sidebar-col">
            <div className="pd-contact-sticky">
              <div className="pd-contact-card">
                <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem' }}>
                  {property.isOwnerListing ? 'సంప్రదించండి (Contact Owner)' : 'వివరాల కోసం సంప్రదించండి'}
                </div>
                
                <button 
                  onClick={() => window.location.href = `tel:${property.displayContactType === 'Lister' && property.realtor?.phone ? property.realtor.phone : supportPhone}`} 
                  className="btn-3d-glass" 
                  style={{ width: '100%' }}
                >
                  <Phone size={20}/> కాల్ చేయండి
                </button>

                <div style={{ textAlign: 'center', margin: '0.75rem 0', opacity: 0.5, fontSize: '0.7rem', fontWeight: 800 }}>లేదా (OR)</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button 
                    onClick={() => {
                      const phone = (property.displayContactType === 'Lister' && property.realtor?.phone) ? property.realtor.phone : (supportInfo?.whatsapp || '919346793364');
                      const waMsg = `నమస్కారం! మీ ప్లాట్‌ఫారమ్‌లోని ఈ ప్రాపర్టీ పై ఆసక్తి ఉంది:\n\n*${property?.title}*\nID: SNA-${(id || '').slice(-6).toUpperCase()}\n\nలింక్: ${window.location.href}`;
                      window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`, '_blank');
                    }} 
                    className="btn-3d-glass-emerald" 
                    style={{ width: '100%' }}
                  >
                    <MessageSquare size={18}/> వాట్సాప్ చాట్
                  </button>
                  <button onClick={() => navigate('/request-callback')} className="btn-3d-glass-dark" style={{ width: '100%' }}>
                    <Send size={18}/> కాల్‌బ్యాక్ అభ్యర్థించండి
                  </button>
                </div>
                
                <div className="pd-trust-row">
                  <div className="pd-trust-item"><ShieldCheck size={14}/> 100% SnapAdda వెరిఫైడ్</div>
                  <div className="pd-trust-item"><Award size={14}/> నమ్మకమైన ప్లాట్‌ఫారమ్</div>
                </div>
              </div>


              <div className="pd-quick-specs">
                <div style={{ fontSize: '0.7rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--gold)', textAlign: 'center' }}>{isVerified && isFeatured ? '💎 Institutional Grade Asset' : 'ముఖ్యమైన వివరాలు'}</div>
                <div className="pd-quick-row"><span className="pd-quick-lbl">మొత్తం ధర</span><span className="pd-quick-val" style={{ color: 'var(--gold)' }}>{formatSnapAddaPrice(displayPrice)}</span></div>
                <div className="pd-quick-row"><span className="pd-quick-lbl">విస్తీర్ణం</span><span className="pd-quick-val">{property.areaSize} {t(`units.${(property.measurementUnit || 'Sq.Yards').toLowerCase()}`)}</span></div>
                <div className="pd-quick-row"><span className="pd-quick-lbl">దిశ</span><span className="pd-quick-val">{t(`facing.${(property.facing || 'any').toLowerCase()}`)}</span></div>
                <div className="pd-quick-row"><span className="pd-quick-lbl">అనుమతి</span><span className="pd-quick-val" style={{ color: '#27c97d' }}>{property.approvalAuthority || 'అందుబాటులో లేదు'}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="section-wrap" style={{ background: 'rgba(255,255,255,0.02)', padding: '4rem 0' }}>
          <div className="container">
            <div className="section-head" style={{ marginBottom: '3rem' }}>
              <div className="section-eyebrow">ఇదే రకమైన ఇతర ప్రాపర్టీలు</div>
              <h2 className="section-title">మీకు నచ్చవచ్చు</h2>
            </div>
            <div className="properties-grid">
              {similar.slice(0, 3).map(p => <PropertyCard key={p._id} {...p} />)}
            </div>
          </div>
        </section>
      )}



      {/* Floating Gallery FAB (Mobile Only) */}
      {isMobile && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setLightbox(true)}
          style={{
            position: 'fixed', bottom: '100px', right: '20px', 
            zIndex: 100001, width: '56px', height: '56px',
            borderRadius: '50%', background: 'var(--gold)', color: 'black',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 15px 35px rgba(232,184,75,0.4)',
            border: 'none', cursor: 'pointer'
          }}
        >
          <LayoutGrid size={24} />
        </motion.button>
      )}

      {/* Mobile Sticky Navigation (Refined) */}

      <div className="pd-mobile-ribbon" style={{ 
        position: 'fixed', bottom: '25px', left: '15px', right: '15px', 
        zIndex: 100002, display: isMobile ? 'flex' : 'none', gap: '12px', alignItems: 'center',
        background: 'rgba(12,15,25,0.92)', backdropFilter: 'blur(30px)',
        padding: '10px 14px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
      }}>
        <div style={{ flex: 1, paddingLeft: '8px' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em' }}>{property.isOwnerListing ? 'CONTACT OWNER' : 'STARTING FROM'}</div>
          <div style={{ color: 'var(--gold)', fontSize: '1.25rem', fontWeight: 950, letterSpacing: '-0.02em' }}>{formatSnapAddaPrice(displayPrice)}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => {
              const phone = (property.displayContactType === 'Lister' && property.realtor?.phone) ? property.realtor.phone : (supportInfo?.phone || '9346793364');
              window.location.href = `tel:${phone}`;
            }}
            style={{ width: '50px', height: '50px', borderRadius: '18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Phone size={22}/>
          </button>
          <button 
            onClick={() => {
              const phone = (property.displayContactType === 'Lister' && property.realtor?.phone) ? property.realtor.phone : (supportInfo?.whatsapp || '919346793364');
              const waMsg = `నమస్కారం! మీ ప్లాట్‌ఫారమ్‌లోని ఈ ప్రాపర్టీ పై ఆసక్తి ఉంది:\n\n*${property?.title}*\nID: SNA-${(id || '').slice(-6).toUpperCase()}\n\nలింక్: ${window.location.href}`;
              window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`, '_blank');
            }}
            className="btn-3d-liquid" 
            style={{ background: 'var(--gold)', color: 'black', padding: '0 24px', height: '50px', borderRadius: '18px', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.05em' }}
          >
            ENQUIRE
          </button>
        </div>
      </div>
    </div>

      <ShareControlCenter 
        isOpen={shareModal} 
        onClose={() => setShareModal(false)} 
        property={property} 
      />
    </>
  );
}
