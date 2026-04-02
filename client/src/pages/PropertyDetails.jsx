import Logo from '../components/Logo';
import { fetchProperty, fetchSetting, submitLead, askQuestion, fetchPropertyFAQs } from '../services/api';


export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mediaTab, setMediaTab] = useState('photos');
  const [activeSection, setActiveSection] = useState('overview');
  const [similar, setSimilar] = useState([]);
  const [qna, setQna] = useState([]);
  const [supportInfo, setSupportInfo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('callback');

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
      .then(res => setProperty(res.data || res))
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

  const handleWhatsApp = () => {
    if (!property) return;
    const url = `${window.location.origin}/property/${property._id || id}`;
    const msg = `Hi SnapAdda, I am interested in "${property.title}" listed for ${property.price}. Link: ${url} - Is it still available?`;
    window.open(`https://wa.me/${supportInfo?.whatsapp || '919999999911'}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!qText || !qName || !qContact || !id) return;
    setQStatus('Sending...');
    try {
      const res = await askQuestion({ propertyId: id, clientName: qName, clientContact: qContact, question: qText });
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

  const generateDesc = (p) => {
    if (!p) return '';
    if (p.description) return p.description;
    const face = p.facing && p.facing !== 'Any' ? `${p.facing} facing ` : '';
    const appr = authority ? ` with ${authority} approval` : '';
    return `This premium ${face}${p.type || 'property'} is located in ${p.location}${appr}. Spanning ${p.areaSize || p.sqft} ${p.measurementUnit || 'Sq.Yds'}, it offers ${p.beds ? `${p.beds} bedrooms, ${p.baths} bathrooms, and ` : ''}exceptional value for both living and investment.`;
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

      {/* Gallery */}
      <section className="pd-gallery">
        <div className="pd-gallery-tabs">
          <button className={`media-tab${mediaTab === 'photos' ? ' active' : ''}`} onClick={() => setMediaTab('photos')}><Image size={16} /> Photos</button>
          <button className={`media-tab${mediaTab === 'video' ? ' active' : ''}`} onClick={() => setMediaTab('video')}><Video size={16} /> Virtual Tour</button>
        </div>
        {mediaTab === 'photos' ? (
          <div className="pd-gallery-grid">
            <div className="pd-main-image">
              {images[0] ? <img src={images[0]} alt={property.title} /> : <div className="property-no-image"><Building2 size={48} /></div>}
            </div>
            <div className="pd-side-images">
              {images.slice(1, 3).map((img, i) => <div key={i} className="pd-side-img"><img src={img} alt={`View ${i + 2}`} /></div>)}
            </div>
          </div>
        ) : (
          <div className="pd-video-frame">
            {property.videoUrl
              ? <iframe src={getYouTubeEmbed(property.videoUrl)} title="Virtual Tour" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              : <div className="pd-video-empty"><Video size={48} /><p>Virtual Tour Coming Soon</p></div>}
          </div>
        )}
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
              <p className="pd-location"><MapPin size={16} /> {property.location}</p>
            </div>
            <div className="pd-price-block">
              <div className="pd-price">{property.price}</div>
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
              <div className="pd-ov-card"><Square size={22} className="text-gold" /><div><span className="pd-ov-val">{property.areaSize || property.sqft}</span><span className="pd-ov-label">{property.measurementUnit || 'Sq.Yds'}</span></div></div>
              {property.facing && property.facing !== 'Any' && <div className="pd-ov-card"><Compass size={22} className="text-gold" /><div><span className="pd-ov-val">{property.facing}</span><span className="pd-ov-label">Facing</span></div></div>}
              {authority && authority !== 'N/A' && <div className="pd-ov-card"><ShieldCheck size={22} style={{ color: 'var(--success)' }} /><div><span className="pd-ov-val">{authority}</span><span className="pd-ov-label">Approval</span></div></div>}
            </div>
            
            {/* Extended Detail Grid */}
            <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '2.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem' }}>Technical Specifications</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                 {property.carpetArea > 0 && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}><div style={{ color: 'var(--txt-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Carpet Area</div><div style={{ fontWeight: 700 }}>{property.carpetArea} Sq.Ft</div></div>}
                 {property.superBuiltupArea > 0 && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}><div style={{ color: 'var(--txt-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Super Builtup</div><div style={{ fontWeight: 700 }}>{property.superBuiltupArea} Sq.Ft</div></div>}
                 {property.transactionType && property.transactionType !== 'N/A' && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}><div style={{ color: 'var(--txt-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Transaction</div><div style={{ fontWeight: 700 }}>{property.transactionType}</div></div>}
                 {property.propertyAge && property.propertyAge !== 'N/A' && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}><div style={{ color: 'var(--txt-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Age of Asset</div><div style={{ fontWeight: 700 }}>{property.propertyAge}</div></div>}
                 {property.ownershipType && property.ownershipType !== 'N/A' && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}><div style={{ color: 'var(--txt-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Ownership</div><div style={{ fontWeight: 700 }}>{property.ownershipType}</div></div>}
                 {property.floorNo > 0 && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}><div style={{ color: 'var(--txt-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Floor Level</div><div style={{ fontWeight: 700 }}>{property.floorNo} of {property.totalFloors}</div></div>}
                 {property.parking && property.parking !== 'N/A' && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}><div style={{ color: 'var(--txt-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Parking</div><div style={{ fontWeight: 700 }}>{property.parking}</div></div>}
                 {property.waterSupply && property.waterSupply !== 'N/A' && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}><div style={{ color: 'var(--txt-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Water Supply</div><div style={{ fontWeight: 700 }}>{property.waterSupply}</div></div>}
                 {property.reraId && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}><div style={{ color: 'var(--txt-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>RERA Registration</div><div style={{ fontWeight: 700 }}>{property.reraId}</div></div>}
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
              <form onSubmit={handleAsk}>
                <div className="pd-ask-row">
                  <input type="text" placeholder="Your Name" value={qName} onChange={e => setQName(e.target.value)} required />
                  <input type="text" placeholder="Phone or Email" value={qContact} onChange={e => setQContact(e.target.value)} required />
                </div>
                <textarea placeholder="What do you want to know?" value={qText} onChange={e => setQText(e.target.value)} rows={3} required />
                <div className="pd-ask-footer">
                  <span style={{ color: qStatus.includes('submitted') ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.85rem' }}>{qStatus}</span>
                  <button type="submit" className="btn btn-primary btn-3d"><Send size={14} /> Submit</button>
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
              <button className="btn btn-primary btn-lg btn-full btn-3d" onClick={() => navigate('/request-callback')}>Request Callback</button>
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
        <button 
          className="hero-btn hero-btn-primary pulse-primary btn-3d" 
          onClick={() => navigate('/request-callback')} 
          style={{ flex: 1, padding: '1rem', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.5px' }}
        >
          <Phone size={18} /> REQUEST CALLBACK
        </button>
        <button 
          className="hero-btn hero-btn-whatsapp" 
          onClick={handleWhatsApp} 
          style={{ width: '60px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#25D366' }}
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
