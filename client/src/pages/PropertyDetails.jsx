import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Share2, Heart, ShieldCheck, Clock, 
  Calendar, Layers, Phone, MessageSquare, ChevronRight, Eye,
  LayoutDashboard, Download, Info, CheckCircle2, Navigation, Building2, User, BedDouble, Bath, Square, Compass, Award, Send, Star, Image, Video
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { fetchProperty, fetchSetting, submitLead, askQuestion, fetchPropertyFAQs, likeProperty, shareProperty } from '../services/api';
import { formatSnapAddaPrice } from '../utils/priceUtils';


export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mediaTab, setMediaTab] = useState('photos');
  const [activeSection, setActiveSection] = useState('overview');
  const [similar, setSimilar] = useState([]);
  const [qna, setQna] = useState([]);
  const [supportInfo, setSupportInfo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('callback');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Q&A form
  const [qName, setQName] = useState('');
  const [qContact, setQContact] = useState('');
  const [qText, setQText] = useState('');
  const [qStatus, setQStatus] = useState('');

  // EMI
  const [loanPct, setLoanPct] = useState(80);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    window.scrollTo(0, 0);
    
    fetchProperty(id)
      .then(res => {
        const data = res.data || res;
        setProperty(data);
        setLikeCount(data.likeCount || 0);
        setLiked(data.isLiked || false);
        
        // Add to Recently Viewed in localStorage
        const recent = JSON.parse(localStorage.getItem('snapadda_recent_viewed') || '[]');
        const updated = [data, ...recent.filter(r => r._id !== data._id)].slice(0, 4);
        localStorage.setItem('snapadda_recent_viewed', JSON.stringify(updated));
      })
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));

    fetchPropertyFAQs(id).then(setQna).catch(console.error);
    fetchSetting('support_info').then(setSupportInfo).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!property) return;
    try {
      const stored = localStorage.getItem('snapadda_recent_views');
      const arr = stored ? JSON.parse(stored) : [];
      const propertyId = id || property?._id || property?.id;
      const filtered = arr.filter(p => p._id !== property._id);
      filtered.unshift({ _id: property._id, title: property.title, price: property.price, location: property.location, type: property.type, images: property.images?.slice(0, 1) || [], beds: property.beds, baths: property.baths, sqft: property.sqft });
      if (filtered.length > 6) filtered.length = 6;
      localStorage.setItem('snapadda_recent_views', JSON.stringify(filtered));
    } catch {}
  }, [property]);

  const images = property?.images?.length ? property.images : [property?.image, ...(property?.gallery || [])].filter(Boolean);
  const authority = property?.approvalAuthority || property?.approval;

  const calcEMI = () => {
    if (!property?.price) return 0;
    let raw = parseInt((property.price + '').replace(/[^0-9]/g, ''), 10);
    const ps = (property.price + '').toLowerCase();
    if (ps.includes('crore')) raw = parseFloat(ps.replace(/[^0-9.]/g, '')) * 1e7;
    if (ps.includes('lakh')) raw = parseFloat(ps.replace(/[^0-9.]/g, '')) * 1e5;
    if (isNaN(raw)) return 0;
    const principal = raw * loanPct / 100;
    const mr = rate / 12 / 100;
    const n = tenure * 12;
    return Math.round(principal * mr * Math.pow(1 + mr, n) / (Math.pow(1 + mr, n) - 1));
  };

  const handleLike = async () => {
    if (!user) { alert('Please sign in with Google to like properties'); return; }
    try {
      const res = await likeProperty(id, user._id || user.id);
      if (res.status === 'success') {
        setLiked(res.data.liked);
        setLikeCount(res.data.likeCount);
      }
    } catch (err) { console.error('Like failed', err); }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareId = user?._id;
    try {
      if (navigator.share) {
        await navigator.share({ title: `SnapAdda: ${property?.title}`, text: `Check out this property in ${property?.location}`, url });
        await shareProperty(id, 'native', shareId);
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied!');
        await shareProperty(id, 'clipboard', shareId);
      }
    } catch (err) { console.error('Share failed', err); }
  };

  const handleWhatsApp = () => {
    const waPhone = supportInfo?.whatsapp || '919346793364';
    const text = encodeURIComponent(`Hi SnapAdda, I am interested in "${property?.title || 'this property'}" located in ${property?.location || 'Andhra Pradesh'}. (ID: ${id})`);
    window.open(`https://wa.me/${waPhone}?text=${text}`, '_blank');
  };


  const handleAsk = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    if (!qText || !id) return;
    setQStatus('Sending...');
    try {
      const res = await askQuestion({ 
        propertyId: id, 
        userId: user._id || user.id,
        authType: user.token ? 'Google' : 'Email',
        clientName: user.name || qName, 
        clientContact: user.email || user.phone || qContact, 
        question: qText 
      });
      if (res.status === 'success') { 
        setQStatus('Question submitted! Agent will respond soon.'); 
        setQText(''); setQName(''); setQContact(''); 
        setTimeout(() => setQStatus(''), 5000); 
      } else {
        setQStatus('Failed to submit question.');
      }
    } catch { setQStatus('Network error.'); }
  };

  function getYouTubeEmbed(url) {
    if (!url) return '';
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let vid = '';
        if (url.includes('v=')) vid = url.split('v=')[1];
        else if (url.includes('youtu.be/')) vid = url.split('youtu.be/')[1];
        const amp = vid.indexOf('&');
        if (amp !== -1) vid = vid.substring(0, amp);
        return `https://www.youtube.com/embed/${vid}?rel=0`;
      }
      return url;
    } catch { return ''; }
  }

  const generateDesc = (prop) => {
    if (prop.description && prop.description.length > 50) return prop.description;
    
    let desc = `This premium ${prop.type || 'property'} is located in the sought-after area of ${prop.location || 'Andhra Pradesh'}. `;
    
    if (prop.type === 'Agricultural Land') {
      desc += `It spans a total of ${prop.areaSize || prop.totalAcres} ${prop.measurementUnit || 'Acres'} of fertile land, offering excellent potential for cultivation or long-term investment. `;
      if (prop.roadWidth > 0) desc += `The property features a ${prop.roadWidth} ft wide road access, ensuring easy logistical connectivity. `;
    } else if (prop.type?.includes('Plot')) {
      desc += `Measuring ${prop.areaSize} ${prop.measurementUnit || 'Sq.Yards'}, this plot is ideal for ${prop.purpose === 'Sale' ? 'building your dream home' : 'commercial development'}. `;
      if (prop.isGated) desc += `Situated within a secure gated community, it offers both privacy and premium infrastructure. `;
    } else {
      if (prop.bhk) desc += `A spacious ${prop.bhk} BHK configuration with modern layouts. `;
      if (prop.furnishing && prop.furnishing !== 'N/A') desc += `The property comes ${prop.furnishing} and is ready for immediate occupancy. `;
    }
    
    if (prop.facing && prop.facing !== 'Any') desc += `The ${prop.facing}-facing orientation ensures optimal natural light and adherence to Vastu principles. `;
    
    return desc + "Contact SnapAdda today for an exclusive site visit and detailed walkthrough.";
  };

  if (loading) return (
    <div className="property-loading-screen">
      <div className="loader" />
      <p>Loading property details...</p>
    </div>
  );

  if (!property) return (
    <div className="container" style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
      <h2>Property Not Found</h2>
      <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>Return Home</button>
    </div>
  );

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'description', label: 'Details' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'emi', label: 'EMI Calculator' },
    { id: 'qna', label: 'Q&A' },
  ];

  return (
    <motion.div className="property-details-page" style={{ paddingTop: 'var(--nav-h)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="container" style={{ padding: '1.2rem 0' }}>
        <button className="back-button" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--txt-secondary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <ArrowLeft size={18} /> Back to Search
        </button>
      </div>

      {/* Premium Horizontal Gallery */}
      <section className="pd-gallery-premium-wrapper">
        <div className="pd-gallery-container-main">
          <div className="pd-gallery-scroller" id="pd-gallery-scroller">
            {/* Unified Media Stream */}
            {[...images, ...(property.videoUrl ? [property.videoUrl] : [])].map((item, index) => (
              <div key={index} className="pd-media-item-card">
                {item.includes('youtube.com') || item.includes('youtu.be') ? (
                  <div className="pd-video-item-wrapper">
                    <iframe 
                      src={getYouTubeEmbed(item)} 
                      title="Virtual Tour" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen 
                    />
                  </div>
                ) : (
                  <img src={item} alt={`${property.title} - View ${index + 1}`} loading="lazy" />
                )}
              </div>
            ))}
            {images.length === 0 && !property.videoUrl && (
              <div className="pd-media-item-card empty">
                <div className="property-no-image"><Building2 size={64} /><p>No media available</p></div>
              </div>
            )}
          </div>

          {/* Gallery Navigation Controls (Desktop) */}
          <div className="pd-gallery-nav-overlay desktop-only">
            <button 
              className="pd-gallery-nav-btn prev" 
              onClick={() => document.getElementById('pd-gallery-scroller')?.scrollBy({ left: -400, behavior: 'smooth' })}
            >
              <ArrowLeft size={24} />
            </button>
            <button 
              className="pd-gallery-nav-btn next" 
              onClick={() => document.getElementById('pd-gallery-scroller')?.scrollBy({ left: 400, behavior: 'smooth' })}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Media Indicators */}
          <div className="pd-gallery-info-badge">
            <div className="media-count-chip">
              <Image size={14} /> {images.length} Photos
            </div>
            {property.videoUrl && (
              <div className="media-count-chip video">
                <Video size={14} /> 1 Video
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Title Bar */}
      <section className="pd-title-bar">
        <div className="container">
          <div className="pd-title-row">
            <div className="pd-title-left">
              <div className="pd-badges">
                {property.isVerified && <span className="pd-badge pd-badge-green"><ShieldCheck size={13} /> Verified</span>}
                {property.type && <span className="pd-badge pd-badge-gold">{property.type}</span>}
                {property.listerType && (
                  <span className="pd-badge" style={{ color: property.listerType === 'Verified Builder' ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                    {property.listerType === 'Verified Builder' ? <Building2 size={12} /> : <User size={12} />} {property.listerType}
                  </span>
                )}
              </div>
              <h1 className="pd-title">{property.title}</h1>
              <p className="pd-location">
                <MapPin size={16} /> {property.location}
                {property.googleMapsLink && (
                  <a 
                    href={property.googleMapsLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      marginLeft: '12px', 
                      fontSize: '0.75rem', 
                      color: 'var(--gold)', 
                      textDecoration: 'none', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      background: 'rgba(232, 184, 75, 0.1)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      border: '1px solid rgba(232, 184, 75, 0.2)'
                    }}
                  >
                    View on Maps
                  </a>
                )}
              </p>
              {property.address && (
                <p className="pd-address" style={{ fontSize: '0.9rem', color: 'var(--txt-muted)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                  {property.address}
                </p>
              )}
            </div>
            <div className="pd-price-block">
              <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  onClick={handleLike}
                  style={{ 
                    background: liked ? 'rgba(240, 93, 94, 0.15)' : 'rgba(255,255,255,0.05)', 
                    border: liked ? '1px solid var(--rose)' : '1px solid rgba(255,255,255,0.1)', 
                    color: liked ? 'var(--rose)' : 'white',
                    padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 700 
                  }}
                >
                  <Heart size={18} fill={liked ? 'var(--rose)' : 'none'} /> {likeCount}
                </button>
                <button 
                  onClick={handleShare}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700 }}
                >
                  <Share2 size={18} /> Share
                </button>
              </div>
              <div className="pd-price">{formatSnapAddaPrice(property.price)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Nav */}
      <div className="pd-tab-nav-wrapper">
        <div className="container">
          <div className="pd-tab-nav">
            {TABS.map(t => (
              <a key={t.id} href={`#${t.id}`} className={`pd-tab${activeSection === t.id ? ' active' : ''}`} onClick={() => setActiveSection(t.id)}>{t.label}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container pd-content-grid">
        <div className="pd-main">
          <section id="overview" className="pd-section">
            <h2>Property Overview</h2>
            <div className="pd-overview-cards">
              {property.type !== 'Agriculture' && (
                <>
                  <div className="pd-ov-card"><BedDouble size={22} className="text-gold" /><div><span className="pd-ov-val">{property.beds}</span><span className="pd-ov-label">Bedrooms</span></div></div>
                  <div className="pd-ov-card"><Bath size={22} className="text-gold" /><div><span className="pd-ov-val">{property.baths}</span><span className="pd-ov-label">Bathrooms</span></div></div>
                </>
              )}
              <div className="pd-ov-card"><Square size={22} className="text-gold" /><div><span className="pd-ov-val">{property.areaSize || property.sqft}</span><span className="pd-ov-label">{property.measurementUnit || 'Sq.Yds'} {property.totalAcres ? `(${property.totalAcres} Acres)` : ''}</span></div></div>
              {property.pricePerAcre > 0 && property.type === 'Agricultural Land' && (
                <div className="pd-ov-card"><Building2 size={22} className="text-emerald" /><div><span className="pd-ov-val">₹ {Number(property.pricePerAcre).toLocaleString('en-IN')}</span><span className="pd-ov-label">Per Acre</span></div></div>
              )}
              {property.facing && property.facing !== 'Any' && <div className="pd-ov-card"><Compass size={22} className="text-gold" /><div><span className="pd-ov-val">{property.facing}</span><span className="pd-ov-label">Facing</span></div></div>}
              {authority && authority !== 'N/A' && <div className="pd-ov-card"><ShieldCheck size={22} style={{ color: 'var(--success)' }} /><div><span className="pd-ov-val">{authority}</span><span className="pd-ov-label">Approval</span></div></div>}
            </div>
            
            {/* Extended Detail Grid */}
            <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '2.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem' }}>Technical Specifications</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                 {property.carpetArea > 0 && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}><div style={{ color: 'var(--txt-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Carpet Area</div><div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{property.carpetArea} Sq.Ft</div></div>}
                 {property.superBuiltupArea > 0 && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}><div style={{ color: 'var(--txt-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Super Builtup</div><div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{property.superBuiltupArea} Sq.Ft</div></div>}
                 {property.transactionType && property.transactionType !== 'N/A' && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}><div style={{ color: 'var(--txt-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Transaction</div><div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{property.transactionType}</div></div>}
                 {property.propertyAge && property.propertyAge !== 'N/A' && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}><div style={{ color: 'var(--txt-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Age of Asset</div><div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{property.propertyAge}</div></div>}
                 {property.ownershipType && property.ownershipType !== 'N/A' && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}><div style={{ color: 'var(--txt-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Ownership</div><div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{property.ownershipType}</div></div>}
                 {property.floorNo > 0 && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}><div style={{ color: 'var(--txt-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Floor Level</div><div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{property.floorNo} of {property.totalFloors}</div></div>}
                 {property.parking && property.parking !== 'N/A' && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}><div style={{ color: 'var(--txt-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Parking</div><div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{property.parking}</div></div>}
                 
                 {/* Land & Plot Specifics */}
                 {(property.type === 'Agricultural Land' || property.type?.includes('Plot')) && (
                   <>
                     {property.roadWidth > 0 && <div style={{ background: 'rgba(6,217,140,0.05)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(6,217,140,0.1)' }}><div style={{ color: 'var(--emerald)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Road Width</div><div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{property.roadWidth} Ft</div></div>}
                     {property.boundaryWall && <div style={{ background: 'rgba(6,217,140,0.05)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(6,217,140,0.1)' }}><div style={{ color: 'var(--emerald)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Boundary</div><div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>Constructed</div></div>}
                     {property.isGated && <div style={{ background: 'rgba(232,184,75,0.05)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(232,184,75,0.1)' }}><div style={{ color: 'var(--gold)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Community</div><div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>Gated</div></div>}
                   </>
                 )}
                 {property.reraId && <div style={{ background: 'rgba(232,184,75,0.05)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(232,184,75,0.1)' }}><div style={{ color: 'var(--gold)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>RERA ID</div><div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{property.reraId}</div></div>}
              </div>
            </div>
          </section>

          <section id="description" className="pd-section">
            <h2>About this Property</h2>
            <p className="pd-description">{generateDesc(property)}</p>
          </section>

          {property.customFeatures?.length > 0 && (
            <section className="pd-section">
              <h2>Key Highlights</h2>
              <div className="pd-highlights-grid">
                {property.customFeatures.map((f, i) => <div key={i} className="pd-highlight-card"><div className="pd-hl-label">{f.label}</div><div className="pd-hl-value">{f.value}</div></div>)}
              </div>
            </section>
          )}

          <section id="amenities" className="pd-section">
            <h2>Amenities &amp; Features</h2>
            <div className="pd-amenities-grid">
              {(property.amenities || ['Power Backup', 'Water Supply', 'Clear Title', 'Vastu Compliant']).map((a, i) => (
                <div key={i} className="pd-amenity"><Award size={16} className="text-gold" /><span>{a}</span></div>
              ))}
            </div>
          </section>

          <section id="emi" className="pd-section">
            <h2><Star size={22} className="text-gold" /> EMI Calculator</h2>
            <div className="pd-emi-grid">
              <div className="pd-emi-sliders">
                {[
                  { label: 'Loan Amount', val: loanPct, set: setLoanPct, min: 10, max: 90, step: 1, unit: '%' },
                  { label: 'Interest Rate', val: rate, set: setRate, min: 6, max: 15, step: 0.1, unit: '%' },
                  { label: 'Tenure', val: tenure, set: setTenure, min: 5, max: 30, step: 1, unit: ' years' },
                ].map(({ label, val, set, min, max, step, unit }) => (
                  <div key={label} className="pd-emi-slider-row">
                    <label>{label}</label>
                    <span>{val}{unit}</span>
                    <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(parseFloat(e.target.value))} />
                  </div>
                ))}
              </div>
              <div className="pd-emi-result glass-heavy tilt-3d" style={{ padding: '2rem', border: '1px solid var(--royal-gold)', borderRadius: '16px' }}>
                <p>Estimated Monthly EMI</p>
                <h3 className="text-royal-gold">₹ {calcEMI().toLocaleString('en-IN')}</h3>
                <small>*Estimate only. Terms vary by bank.</small>
              </div>
            </div>
          </section>

          <section id="qna" className="pd-section">
            <h2>Property Q&amp;A</h2>
            <div className="pd-qna-list">
              {qna.length === 0 ? <p className="text-muted" style={{ fontStyle: 'italic' }}>No questions yet. Be the first to ask!</p>
                : qna.map(q => (
                  <div key={q._id} className="pd-qna-item">
                    <div className="pd-qna-q">Q: {q.question}</div>
                    <div className="pd-qna-a"><span className="text-gold">A:</span> {q.answer}</div>
                  </div>
                ))}
            </div>
            <div className="pd-ask-form glass-heavy tilt-3d" style={{ padding: '2rem', borderRadius: '16px' }}>
              <h3>Ask the Agent</h3>
              {!user ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <p style={{ color: 'var(--txt-muted)', marginBottom: '1.5rem' }}>Login to your elite account to ask questions and track responses.</p>
                  <button 
                    onClick={() => navigate('/login', { state: { from: window.location.pathname } })} 
                    className="btn btn-primary btn-3d"
                    style={{ width: 'auto', padding: '0.8rem 2rem' }}
                  >
                    Login to Ask Question
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAsk}>
                  <div className="pd-ask-row">
                    <input type="text" placeholder="Your Name" value={user.name || qName} disabled />
                    <input type="text" placeholder="Phone or Email" value={user.email || user.phone || qContact} disabled />
                  </div>
                  <textarea placeholder="What do you want to know?" value={qText} onChange={e => setQText(e.target.value)} rows={3} required />
                  <div className="pd-ask-footer">
                    <span style={{ color: qStatus.includes('submitted') ? 'var(--gold)' : 'var(--text-muted)', fontSize: '0.85rem' }}>{qStatus}</span>
                    <button type="submit" className="btn btn-primary btn-3d"><Send size={14} /> Submit</button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="pd-sidebar">
          <div className="pd-contact-card glass-heavy tilt-3d" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h3>Interested?</h3>
            <p className="text-muted">Connect directly with the owner or agent.</p>
            <div className="pd-contact-actions">
              <a href={`tel:${(supportInfo?.phone || '+919346793364').replace(/\s+/g, '')}`} className="btn btn-primary btn-lg btn-full btn-3d" style={{ textDecoration: 'none' }}>Call Agent Now</a>
              <div className="pd-divider">or</div>
              <button className="btn btn-lg btn-full btn-3d-emerald" style={{ backgroundColor: '#25D366', color: 'white', border: 'none' }} onClick={handleWhatsApp}>
                <MessageSquare size={18} /> WhatsApp
              </button>
            </div>
            <div className="pd-trust-badges">
              <div className="pd-trust"><ShieldCheck size={15} className="text-gold" /> <span>Verified Listing</span></div>
              <div className="pd-trust"><Award size={15} className="text-gold" /> <span>CRDA Approved</span></div>
            </div>
          </div>
        </aside>
      </div>

      {/* Elite Mobile Sticky Action Bar */}
      <div className="mobile-sticky-action-bar" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(5,5,10,0.95)',
        padding: '1.2rem 1.5rem',
        zIndex: 1000,
        backdropFilter: 'blur(30px)',
        borderTop: '1px solid rgba(212,175,55,0.25)',
        display: 'none', 
        gap: '1rem',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
      }}>
        <a 
          href={`tel:${(supportInfo?.phone || '+919346793364').replace(/\s+/g, '')}`}
          className="hero-btn hero-btn-primary pulse-primary btn-3d" 
          style={{ flex: 1, padding: '1rem', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.5px', textDecoration: 'none' }}
        >
          <Phone size={18} /> CALL AGENT NOW
        </a>
        <button 
          className="hero-btn hero-btn-whatsapp" 
          onClick={handleWhatsApp} 
          style={{ width: '60px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#25D366', border: 'none' }}
        >
          <MessageSquare size={22} color="white" />
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-sticky-action-bar { display: flex !important; }
          .pd-contact-card { display: none !important; }
          .property-details-page { padding-bottom: 80px !important; }
        }
      `}</style>
    </motion.div>
  );
}
