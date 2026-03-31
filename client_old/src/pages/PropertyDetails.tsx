import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Bed, Bath, Square, ShieldCheck, Compass, CheckCircle2, Play, Image as ImageIcon, ImageOff, MessageSquare, Send, Calculator, MessageCircle, Building2, User, ChevronRight } from 'lucide-react';
import { fetchPropertyById, fetchSetting } from '../services/api';
import { PropertyCard } from '../components/ui/PropertyCard';
import { Button } from '../components/ui/Button';
import { LeadModal } from '../components/ui/LeadModal';
import './PropertyDetails.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'video'>('photos');
  const [activeSection, setActiveSection] = useState('overview');

  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [qName, setQName] = useState('');
  const [qContact, setQContact] = useState('');
  const [qStatus, setQStatus] = useState('');
  const [supportInfo, setSupportInfo] = useState<any>(null);

  // EMI Calculator
  const [loanPercent, setLoanPercent] = useState(80);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'callback' | 'contact'>('callback');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    window.scrollTo(0, 0);

    fetchPropertyById(id)
      .then(data => {
        setProperty(data.data || data);
      })
      .catch(err => {
        console.error("Property not found or database error:", err);
        setProperty(null);
      })
      .finally(() => setLoading(false));

    // Similar properties
    fetch(`${API_URL}/properties/${id}/similar`)
      .then(r => r.json())
      .then(data => { if (data.data) setSimilarProperties(data.data); })
      .catch(() => {});

    // Inquiries
    fetch(`${API_URL}/inquiries/property/${id}`)
      .then(r => r.json())
      .then(data => { if (data.status === 'success') setInquiries(data.data || []); })
      .catch(() => {});

    // Support Info
    fetchSetting('support_info').then(data => {
      setSupportInfo(data || {});
    }).catch(console.error);
  }, [id]);

  const images = (property?.images && property.images.length > 0)
    ? property.images
    : [property?.image, ...(property?.gallery || [])].filter(Boolean);

  const generateDescription = (p: any) => {
    if (!p) return '';
    if (p.description) return p.description;
    const facingText = p.facing && p.facing !== 'Any' ? `${p.facing} facing ` : '';
    const approvalText = (p.approvalAuthority || p.approval) ? ` with ${p.approvalAuthority || p.approval} approval` : '';
    return `This premium ${facingText}${p.type || 'property'} is located in ${p.location}${approvalText}. Spanning ${p.areaSize || p.sqft} ${p.measurementUnit || 'Sq.Ft'}, it offers ${p.beds ? p.beds + ' bedrooms, ' + p.baths + ' bathrooms, and ' : ''}exceptional value for both living and investment. Contact us for a site visit today.`;
  };

  /* ═══ SEO & Structured Data ═══ */
  useEffect(() => {
    if (!property) return;

    const seoData = {
      title: `${property.title} in ${property.location} | SnapAdda`,
      description: generateDescription(property),
      image: images[0] || '',
      schema: {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": property.title,
        "description": generateDescription(property),
        "url": window.location.href,
        "image": images[0] || '',
        "address": {
          "@type": "PostalAddress",
          "addressLocality": property.location,
          "addressRegion": property.district || "Andhra Pradesh",
          "addressCountry": "IN"
        },
        "offers": {
          "@type": "Offer",
          "price": property.price,
          "priceCurrency": "INR"
        }
      }
    };

    window.dispatchEvent(new CustomEvent('snap_seo_update', { detail: seoData }));

    // Reset on unmount
    return () => {
      window.dispatchEvent(new CustomEvent('snap_seo_update', { detail: null }));
    };
  }, [property, images]);

  /* ═══ Save to Recent Views History (Local Storage) ═══ */
  useEffect(() => {
    if (!property || !property._id) return;

    try {
      const existing = localStorage.getItem('snapadda_recent_views');
      let views: any[] = existing ? JSON.parse(existing) : [];

      // Remove this property if it's already in the history to avoid duplicates
      views = views.filter(v => v._id !== property._id);

      // Create a minimized payload
      const miniProp = {
        _id: property._id,
        title: property.title,
        price: property.price,
        location: property.location,
        type: property.type,
        images: property.images?.length > 0 ? [property.images[0]] : [],
        beds: property.beds,
        baths: property.baths,
        sqft: property.sqft
      };

      // Add to front of history
      views.unshift(miniProp);

      // Keep only the 6 most recent views
      if (views.length > 6) views.length = 6;

      localStorage.setItem('snapadda_recent_views', JSON.stringify(views));
    } catch (err) {
      console.warn('Failed to save recent view history:', err);
    }
  }, [property]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion || !qName || !qContact || !id) return;
    setQStatus('Sending...');
    try {
      const res = await fetch(`${API_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: id, clientName: qName, clientContact: qContact, question: newQuestion })
      });
      if (res.ok) {
        setQStatus('Question submitted! Agent will respond soon.');
        setNewQuestion(''); setQName(''); setQContact('');
        setTimeout(() => setQStatus(''), 5000);
      } else setQStatus('Failed to submit.');
    } catch { setQStatus('Network error.'); }
  };

  const handleTriggerLead = (type: 'callback' | 'contact') => { setModalType(type); setIsModalOpen(true); };

  const handleWhatsApp = () => {
    if (!property) return;
    const msg = `Hi SnapAdda, I am interested in "${property.title}" listed for ${property.price}. Is it still available?`;
    const wa = supportInfo?.whatsapp || '919999999911';
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const calculateEMI = () => {
    if (!property?.price) return 0;
    let num = parseInt((property.price + '').replace(/[^0-9]/g, ''), 10);
    if ((property.price + '').toLowerCase().includes('crore')) num = parseFloat((property.price + '').replace(/[^0-9.]/g, '')) * 10000000;
    if ((property.price + '').toLowerCase().includes('lakh')) num = parseFloat((property.price + '').replace(/[^0-9.]/g, '')) * 100000;
    if (isNaN(num)) return 0;
    const p = (num * loanPercent) / 100;
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;
    return Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  };

  const getEmbedUrl = (url: string) => {
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
  };

  if (loading) {
    return (
      <div className="property-loading-screen">
        <div className="loader"></div>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container" style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Property Not Found</h2>
        <Button onClick={() => navigate('/')} style={{ marginTop: '20px' }}>Return Home</Button>
      </div>
    );
  }

  const displayApproval = property.approvalAuthority || property.approval;

  const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'description', label: 'Details' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'emi', label: 'EMI Calculator' },
    { id: 'qna', label: 'Q&A' },
  ];

  return (
    <motion.div className="property-details-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Top Bar */}
      <div className="pd-topbar glass">
        <div className="container pd-topbar-inner">
          <button className="back-button" onClick={() => navigate('/')} aria-label="Go back">
            <ArrowLeft size={20} /> Back
          </button>
          <div className="pd-topbar-actions">
            <Button size="sm" className="btn-3d" onClick={() => handleTriggerLead('callback')}>Callback</Button>
            <Button size="sm" className="btn-3d-emerald" style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: 'white', border: 'none' }} onClick={handleWhatsApp}>
              <MessageCircle size={16} /> WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* Full Width Gallery */}
      <section className="pd-gallery">
        <div className="pd-gallery-tabs">
          <button className={`media-tab ${activeMediaTab === 'photos' ? 'active' : ''}`} onClick={() => setActiveMediaTab('photos')}>
            <ImageIcon size={16} /> Photos
          </button>
          <button className={`media-tab ${activeMediaTab === 'video' ? 'active' : ''}`} onClick={() => setActiveMediaTab('video')}>
            <Play size={16} /> Virtual Tour
          </button>
        </div>

        {activeMediaTab === 'photos' ? (
          <div className="pd-gallery-grid">
            <div className="pd-main-image">
              {images[0] ? <img src={images[0]} alt={property.title} /> : <div className="property-no-image"><ImageOff size={48} /></div>}
            </div>
            <div className="pd-side-images">
              {images.slice(1, 3).map((img: string, idx: number) => (
                <div key={idx} className="pd-side-img">
                  <img src={img} alt={`View ${idx + 2}`} />
                </div>
              ))}
              {images.length < 3 && <div className="pd-side-img pd-placeholder"><ImageOff size={32} opacity={0.3} /></div>}
            </div>
          </div>
        ) : (
          <div className="pd-video-frame">
            {property.videoUrl ? (
              <iframe src={getEmbedUrl(property.videoUrl)} title="Virtual Tour" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            ) : (
              <div className="pd-video-empty">
                <Play size={48} />
                <p>Virtual Tour Coming Soon</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Price & Title Bar */}
      <section className="pd-title-bar">
        <div className="container">
          <div className="pd-title-row">
            <div className="pd-title-left">
              <div className="pd-badges">
                {property.isVerified && <span className="pd-badge pd-badge-green"><ShieldCheck size={13} /> Verified</span>}
                {property.type && <span className="pd-badge pd-badge-gold">{property.type}</span>}
                {property.condition && property.condition !== 'N/A' && <span className="pd-badge pd-badge-muted">{property.condition}</span>}
                {property.listerType && (
                  <span className="pd-badge" style={{ color: property.listerType === 'Verified Builder' ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                    {property.listerType === 'Verified Builder' ? <Building2 size={12} /> : <User size={12} />} {property.listerType}
                  </span>
                )}
              </div>
              <h1 className="pd-title">{property.title}</h1>
              <p className="pd-location"><MapPin size={16} /> {property.location}</p>
            </div>
            <div className="pd-price-block">
              <div className="pd-price">{property.price}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Tab Nav */}
      <div className="pd-tab-nav-wrapper">
        <div className="container">
          <div className="pd-tab-nav">
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} className={`pd-tab ${activeSection === s.id ? 'active' : ''}`} onClick={() => setActiveSection(s.id)}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container pd-content-grid">
        <div className="pd-main">

          {/* Overview */}
          <section id="overview" className="pd-section">
            <h2>Property Overview</h2>
            <div className="pd-overview-cards">
              {property.type !== 'Agriculture' && (
                <>
                  <div className="pd-ov-card"><Bed size={22} className="text-gold" /><div><span className="pd-ov-val">{property.beds}</span><span className="pd-ov-label">Bedrooms</span></div></div>
                  <div className="pd-ov-card"><Bath size={22} className="text-gold" /><div><span className="pd-ov-val">{property.baths}</span><span className="pd-ov-label">Bathrooms</span></div></div>
                </>
              )}
              <div className="pd-ov-card"><Square size={22} className="text-gold" /><div><span className="pd-ov-val">{property.areaSize || property.sqft}</span><span className="pd-ov-label">{property.measurementUnit || 'Sq.Ft'}</span></div></div>
              {property.facing && property.facing !== 'Any' && (
                <div className="pd-ov-card"><Compass size={22} className="text-gold" /><div><span className="pd-ov-val">{property.facing}</span><span className="pd-ov-label">Facing</span></div></div>
              )}
              {displayApproval && displayApproval !== 'N/A' && (
                <div className="pd-ov-card"><ShieldCheck size={22} style={{ color: 'var(--success)' }} /><div><span className="pd-ov-val">{displayApproval}</span><span className="pd-ov-label">Approval</span></div></div>
              )}
            </div>
          </section>

          {/* Description */}
          <section id="description" className="pd-section">
            <h2>About this Property</h2>
            <p className="pd-description">{generateDescription(property)}</p>
          </section>

          {/* Custom Features */}
          {property.customFeatures && property.customFeatures.length > 0 && (
            <section className="pd-section">
              <h2>Key Highlights</h2>
              <div className="pd-highlights-grid">
                {property.customFeatures.map((feat: any, idx: number) => (
                  <div key={idx} className="pd-highlight-card">
                    <div className="pd-hl-label">{feat.label}</div>
                    <div className="pd-hl-value">{feat.value}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Amenities */}
          <section id="amenities" className="pd-section">
            <h2>Amenities & Features</h2>
            <div className="pd-amenities-grid">
              {(property.amenities || ['Power Backup', 'Water Supply', 'Clear Title', 'Vastu Compliant']).map((a: string, i: number) => (
                <div key={i} className="pd-amenity"><CheckCircle2 size={16} className="text-gold" /><span>{a}</span></div>
              ))}
            </div>
          </section>

          {/* EMI Calculator */}
          <section id="emi" className="pd-section">
            <h2><Calculator size={22} className="text-gold" /> EMI Calculator</h2>
            <div className="pd-emi-grid">
              <div className="pd-emi-sliders">
                <div className="pd-emi-slider-row">
                  <label>Loan Amount</label><span>{loanPercent}%</span>
                  <input type="range" min="10" max="90" value={loanPercent} onChange={e => setLoanPercent(parseInt(e.target.value))} />
                </div>
                <div className="pd-emi-slider-row">
                  <label>Interest Rate</label><span>{interestRate}%</span>
                  <input type="range" min="6" max="15" step="0.1" value={interestRate} onChange={e => setInterestRate(parseFloat(e.target.value))} />
                </div>
                <div className="pd-emi-slider-row">
                  <label>Tenure</label><span>{tenureYears} years</span>
                  <input type="range" min="5" max="30" value={tenureYears} onChange={e => setTenureYears(parseInt(e.target.value))} />
                </div>
              </div>
              <div className="pd-emi-result glass-heavy tilt-3d" style={{ padding: '2rem', border: '1px solid var(--royal-gold)', borderRadius: '16px' }}>
                <p>Estimated Monthly EMI</p>
                <h3 className="text-royal-gold">₹ {calculateEMI().toLocaleString('en-IN')}</h3>
                <small>*Estimate only. Terms vary by bank.</small>
              </div>
            </div>
          </section>

          {/* Q&A */}
          <section id="qna" className="pd-section">
            <h2><MessageSquare size={22} className="text-gold" /> Property Q&A</h2>
            <div className="pd-qna-list">
              {inquiries.length === 0 ? (
                <p className="text-muted" style={{ fontStyle: 'italic' }}>No questions yet. Be the first to ask!</p>
              ) : inquiries.map(inq => (
                <div key={inq._id} className="pd-qna-item">
                  <div className="pd-qna-q">Q: {inq.question}</div>
                  <div className="pd-qna-a"><span className="text-gold">A:</span> {inq.answer}</div>
                </div>
              ))}
            </div>

            <div className="pd-ask-form glass-heavy tilt-3d" style={{ padding: '2rem', borderRadius: '16px' }}>
              <h3>Ask the Agent</h3>
              <form onSubmit={handleAskQuestion}>
                <div className="pd-ask-row">
                  <input type="text" placeholder="Your Name" value={qName} onChange={e => setQName(e.target.value)} required />
                  <input type="text" placeholder="Phone or Email" value={qContact} onChange={e => setQContact(e.target.value)} required />
                </div>
                <textarea placeholder="What do you want to know?" value={newQuestion} onChange={e => setNewQuestion(e.target.value)} rows={3} required></textarea>
                <div className="pd-ask-footer">
                  <span style={{ color: qStatus.includes('submitted') ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.85rem' }}>{qStatus}</span>
                  <Button type="submit" className="btn-3d"><Send size={14} /> Submit</Button>
                </div>
              </form>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="pd-sidebar">
          <div className="pd-contact-card glass-heavy tilt-3d" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h3>Interested?</h3>
            <p className="text-muted">Connect directly with the owner or agent.</p>
            <div className="pd-contact-actions">
              <Button size="lg" fullWidth className="btn-3d" onClick={() => handleTriggerLead('callback')}>Request Callback</Button>
              <div className="pd-divider">or</div>
              <Button size="lg" fullWidth className="btn-3d-emerald" style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: 'white', border: 'none' }} onClick={handleWhatsApp}>
                <MessageCircle size={18} /> WhatsApp
              </Button>
            </div>
            <div className="pd-trust-badges">
              <div className="pd-trust"><ShieldCheck size={15} className="text-gold" /> Verified Listing</div>
              <div className="pd-trust"><CheckCircle2 size={15} className="text-gold" /> SnapAdda Guaranteed</div>
            </div>
          </div>
        </aside>
      </div>

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <section className="pd-similar-section">
          <div className="container">
            <div className="section-title-row">
              <h2>Similar Properties</h2>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="pd-similar-grid">
              {similarProperties.map(p => (
                <PropertyCard key={p._id || p.id} {...p} approval={p.approvalAuthority || p.approval} onTriggerLead={handleTriggerLead} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mobile Sticky Footer */}
      <div className="mobile-sticky-footer glass-heavy" style={{ padding: '1rem', borderTop: '1px solid var(--border-light)' }}>
        <Button size="lg" className="btn-3d" style={{ flex: 1, height: '48px' }} onClick={() => handleTriggerLead('callback')}>Callback</Button>
        <Button size="lg" className="btn-3d-emerald" style={{ flex: 1, height: '48px', backgroundColor: '#25D366', borderColor: '#25D366', color: 'white', border: 'none' }} onClick={handleWhatsApp}>WhatsApp</Button>
      </div>

      <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} type={modalType} />
    </motion.div>
  );
};

export default PropertyDetails;
