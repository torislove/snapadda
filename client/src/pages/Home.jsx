import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Search, SlidersHorizontal, MapPin, Phone, MessageSquare, ShieldCheck, Star,
  Building2, Home as HomeIcon, Square, Leaf, Filter, X, ChevronDown, 
  IndianRupee, Compass, Users, TrendingUp, CheckCircle2, Navigation2,
  Trees, Warehouse, ArrowRight, Zap, Shield, Clock, Zap as FastIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchProperties, fetchCities, fetchTestimonials, fetchSetting, fetchNearbyProperties } from '../services/api';
import { db } from '../firebase';
import { ref, onValue, off } from 'firebase/database';
import PropertyCard from '../components/PropertyCard';
import PromoCarousel from '../components/PromoCarousel';
import Marquee from '../components/Marquee';
import CityCard from '../components/CityCard';
import { SkeletonCityCard, SkeletonPropertyCard } from '../components/SkeletonLoaders';
import { parseSmartSearch, getFuzzySuggestions, loadAndhraData } from '../services/SearchParser';
import { useSEO } from '../utils/useSEO';

// Performance Optimization: Defer heavy interactions
const FilterSidebar = lazy(() => import('../components/FilterSidebar'));
const ContactModal = lazy(() => import('../components/ContactModal'));

const PROP_TYPE_CARDS = [
  { label: 'Apartments', value: 'Apartment', icon: <Building2 size={20}/>, color: '#9b59f5', bg: 'rgba(155,89,245,0.12)' },
  { label: 'Villas', value: 'Villa', icon: <HomeIcon size={20}/>, color: '#e8b84b', bg: 'rgba(232,184,75,0.12)' },
  { label: 'Plots', value: 'Residential Plot', icon: <Square size={20}/>, color: '#22d9e0', bg: 'rgba(34,217,224,0.12)' },
  { label: 'Agriculture', value: 'Agricultural Land', icon: <Leaf size={20}/>, color: '#10d98c', bg: 'rgba(16,217,140,0.12)' },
  { label: 'Houses', value: 'Independent House', icon: <HomeIcon size={20}/>, color: '#ff8c42', bg: 'rgba(255,140,66,0.12)' },
  { label: 'Commercial', value: 'Commercial Space', icon: <Warehouse size={20}/>, color: '#f5397b', bg: 'rgba(245,57,123,0.12)' },
  { label: 'Farmhouses', value: 'Farmhouse', icon: <Trees size={20}/>, color: '#a8ff78', bg: 'rgba(168,255,120,0.1)' },
  { label: 'For Rent', value: '', icon: <Building2 size={20}/>, color: '#22d9e0', bg: 'rgba(34,217,224,0.1)', purpose: 'Rent' },
];

const WHY_CARDS = (t) => [
  { icon: <ShieldCheck size={24} />, title: t('why.c1title', 'Verified Only'), desc: t('why.c1desc', 'Zero spam. High-tier vetted listings.'), color: '#10d98c' },
  { icon: <Star size={24} />, title: t('why.c2title', 'Premium Support'), desc: t('why.c2desc', 'Personal elite property advisory.'), color: '#f5c842' },
  { icon: <Phone size={24} />, title: t('why.c3title', 'Callback Guarantee'), desc: t('why.c3desc', 'Connecting you within 30 minutes.'), color: '#9b59f5' },
];

function useTypewriter(words = [], speed = 100, pause = 2000) {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!words.length) return;
    const word = words[wordIdx % words.length];
    const delay = deleting ? speed / 2 : speed;
    const t = setTimeout(() => {
      setText(prev => {
        const next = deleting ? prev.slice(0, -1) : word.slice(0, prev.length + 1);
        if (!deleting && next === word) setTimeout(() => setDeleting(true), pause);
        if (deleting && next === '') { setDeleting(false); setWordIdx(i => i + 1); }
        return next;
      });
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, wordIdx, words, speed, pause]);

  return text;
}

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, [threshold]);
  return scrolled;
}

const EMPTY_FILTERS = { bhk: '', minPrice: '', maxPrice: '', facing: 'Any', furnishing: 'N/A', constructionStatus: 'N/A', verified: false, approval: 'All', propertyType: 'All', keyword: '' };

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const scrolled = useScrolled();
  const typedWord = useTypewriter(['Apartments', 'Villas', 'Farmland', 'Premium Plots', 'CRDA Homes']);
  const searchRef = useRef(null);

  // 3D search platform tilt
  const mx = useMotionValue(0), my = useMotionValue(0);
  const smx = useSpring(mx), smy = useSpring(my);
  const rotateX = useTransform(smy, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(smx, [-0.5, 0.5], ['-6deg', '6deg']);

  // State
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [heroContent, setHeroContent] = useState(null);
  const [siteStats, setSiteStats] = useState([]);
  const [seoData, setSeoData] = useState(null);
  const [supportInfo, setSupportInfo] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [nearbyProps, setNearbyProps] = useState([]);
  
  const [filterOpen, setFilterOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('callback');

  // Search state
  const [keyword, setKeyword] = useState('');
  const [cityFilter, setCityFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('Sale'); // Default to Buy/Sale
  const [budget, setBudget] = useState('');
  const [advFilters, setAdvFilters] = useState({ ...EMPTY_FILTERS });

  useSEO(seoData);

  // Sync Data
  useEffect(() => {
    const loadMeta = async () => {
      try {
        fetchSetting('hero_content').then(d => d && setHeroContent(d));
        fetchSetting('site_stats').then(d => d && setSiteStats(d));
        fetchSetting('seo').then(d => d && setSeoData(d));
        fetchSetting('support_info').then(d => d && setSupportInfo(d));
        fetchCities().then(d => d && setCities(d));
      } catch (err) { console.error('Meta load error:', err); }
    };
    loadMeta();

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          fetchNearbyProperties(coords.lat, coords.lng)
            .then(res => setNearbyProps(res?.data || []))
            .catch(() => {});
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    if (db) {
      const citiesRef = ref(db, 'cities');
      onValue(citiesRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const list = Object.values(data)
              .filter(c => c && typeof c === 'object')
              .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setCities(list);
          }
        } catch {}
      });
      return () => off(citiesRef);
    }
  }, []);

  useEffect(() => {
    if (db) {
      const promoRef = ref(db, 'promotions');
      onValue(promoRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const list = Object.values(data)
              .filter(p => p && typeof p === 'object')
              .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
            setPromotions(list);
          }
        } catch {}
      });
      return () => off(promoRef);
    }
  }, []);

  const loadProperties = useCallback(() => {
    setLoading(true);
    fetchProperties({ sort: 'featured', limit: 6 })
      .then(res => setProperties(res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (cityFilter) params.set('city', cityFilter);
    if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter);
    if (purposeFilter) params.set('purpose', purposeFilter);
    if (budget && budget !== '999999999') params.set('maxPrice', budget);
    navigate(`/search?${params.toString()}`);
  };

  const supportPhone = (supportInfo?.phone || '+919346793364').replace(/\s+/g, '');
  const supportWA = supportInfo?.whatsapp || '919346793364';

  return (
    <div className="app-container" style={{ background: '#07070f', minHeight: '100vh', color: '#fff' }}>
      <main style={{ flex: 1, paddingTop: 'var(--nav-h)' }}>
        <Marquee />

        <section className="promo-section-top" style={{ marginTop: '1rem' }}>
          <div className="container">
            <PromoCarousel promotions={promotions} />
          </div>
        </section>
        
        <section className="search-section" style={{ padding: '2rem 1rem' }}>
          <div className="container">
             <motion.div
              ref={searchRef}
              className="search-platform glass-heavy"
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d', maxWidth: '1000px', margin: '0 auto' }}
              onMouseMove={e => {
                if (!searchRef.current) return;
                const r = searchRef.current.getBoundingClientRect();
                mx.set((e.clientX - r.left) / r.width - 0.5);
                my.set((e.clientY - r.top) / r.height - 0.5);
              }}
              onMouseLeave={() => { mx.set(0); my.set(0); }}
            >
              <div className="search-platform-top-row" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <div className="purpose-selector glass-pill" style={{ display: 'flex', gap: '5px', padding: '5px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button 
                    className={`purpose-btn ${purposeFilter === 'Sale' ? 'active' : ''}`}
                    onClick={() => setPurposeFilter('Sale')}
                    style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, transition: 'all 0.3s' }}
                  >
                    BUY PROPERTY
                  </button>
                  <button 
                    className={`purpose-btn ${purposeFilter === 'Rent' ? 'active' : ''}`}
                    onClick={() => setPurposeFilter('Rent')}
                    style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, transition: 'all 0.3s' }}
                  >
                    RENT HOME
                  </button>
                </div>
              </div>

              <div className="search-prop-types-row" style={{ marginBottom: '2.5rem' }}>
                <div className="hero-prop-type-scroller">
                  {PROP_TYPE_CARDS.map(card => (
                    <button key={card.label} 
                      className={`hero-type-pill ${typeFilter === card.value ? 'active' : ''}`}
                      onClick={() => setTypeFilter(card.value)}
                      style={{ '--accent': card.color, '--bg': card.bg }}
                    >
                      {card.icon} <span>{card.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="search-main-row" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ flex: 2, minWidth: '300px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Search size={20} style={{ color: 'var(--gold)', marginRight: '12px' }} />
                    <input type="text" placeholder="Location, project, developer..." value={keyword} onChange={e => setKeyword(e.target.value)} 
                      style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '1rem' }} />
                  </div>
                </div>

                <div className="city-select-wrapper" style={{ flex: 1.2, minWidth: '220px' }}>
                   <div className="city-select-card" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.08)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 900, marginBottom: '8px', letterSpacing: '0.1em' }}>SELECT REGION</div>
                      <div className="hero-city-cards-grid centered-grid">
                        <div className={`city-image-pill compact-pill ${!cityFilter ? 'active' : ''}`} onClick={() => setCityFilter(null)}>
                          <span>All AP</span>
                        </div>
                        {cities.slice(0, 8).map(c => (
                          <div key={c.name} className={`city-image-pill compact-pill ${cityFilter === c.name ? 'active' : ''}`} onClick={() => setCityFilter(c.name)}>
                            {c.image && <img src={c.image} alt={c.name} loading="lazy" />}
                            <span>{c.name}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                   <div className="budget-card" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '0.75rem 1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 800, marginBottom: '8px' }}>
                        {(!budget || budget === '999999999') ? 'ANY BUDGET' : `UP TO ₹${Number(budget) >= 10000000 ? (Number(budget)/10000000) + 'CR' : (Number(budget)/100000) + 'L'}`}
                      </div>
                      <input type="range" min="1000000" max="50000000" step="1000000" value={budget && budget !== '999999999' ? budget : 50000000} 
                        onChange={e => setBudget(e.target.value === '50000000' ? '999999999' : e.target.value)} style={{ width: '100%', accentColor: 'var(--gold)' }} />
                   </div>
                </div>
              </div>

              <div className="search-btn-wrapper" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', width: '100%' }}>
                <button className="search-btn btn-3d" onClick={handleSearch}>
                  INITIALIZE ACQUISITION
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="hero-section" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="hero-title" style={{ fontSize: '3.5rem', fontWeight: 950, marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', lineHeight: 1.1 }}>
                Discover <span style={{ color: 'var(--gold)' }}>{typedWord}</span><br />
                in Andhra Pradesh
              </h1>
              <p className="hero-subtitle" style={{ fontSize: '1.25rem', color: 'var(--txt-secondary)', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
                AP's gold standard for real estate. Verified listings, real-time sync, and professional acquisition support.
              </p>
            </motion.div>
          </div>
        </section>

        <section id="cities" className="section-wrap" style={{ padding: '4rem 1rem' }}>
          <div className="container">
            <div className="section-head" style={{ marginBottom: '3rem', textAlign: 'center' }}>
              <div className="section-eyebrow" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.7rem', fontWeight: 900, marginBottom: '10px' }}>REGIONAL HOTSPOTS</div>
              <h2 className="section-title" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>Explore the Growth Centers</h2>
            </div>
            <div className="city-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {cities.length > 0 ? cities.map((c, i) => (
                   <motion.div key={c.name} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/search?city=${encodeURIComponent(c.name)}`)} style={{ cursor: 'pointer' }}>
                     <CityCard city={c} count={c.propertyCount || 0} cityPhoto={c.image} index={i} />
                   </motion.div>
                )) : Array(4).fill(0).map((_, i) => <SkeletonCityCard key={i} />)}
            </div>
          </div>
        </section>

        {userCoords && nearbyProps.length > 0 && (
           <section className="section-wrap" style={{ padding: '4rem 1rem', background: 'rgba(212,175,55,0.02)' }}>
              <div className="container">
                <div className="section-head" style={{ marginBottom: '3rem' }}>
                  <div className="section-eyebrow" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '8px' }}><Navigation2 size={14}/> LOCATED NEARBY</div>
                  <h2 className="section-title">Verified In Your Area</h2>
                </div>
                <div className="properties-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                  {nearbyProps.slice(0, 3).map(p => <PropertyCard key={p._id} {...p} />)}
                </div>
              </div>
           </section>
        )}

        <section id="properties" className="section-wrap" style={{ padding: '4rem 1rem' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
              <div>
                <div className="section-eyebrow">CURATED SELECTION</div>
                <h2 className="section-title" style={{ margin: 0 }}>Featured Elite Assets</h2>
              </div>
              <button 
                onClick={() => navigate('/search?sort=featured')} 
                style={{ background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.2)', padding: '10px 24px', borderRadius: '12px', color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                VIEW ALL <ArrowRight size={16}/>
              </button>
            </div>
            <div className="properties-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {loading ? Array(3).fill(0).map((_, i) => <SkeletonPropertyCard key={i} />) : 
                properties.map(p => <PropertyCard key={p._id} {...p} />)
              }
            </div>
          </div>
        </section>

        <section className="section-wrap" style={{ padding: '6rem 1rem' }}>
          <div className="container">
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
              {WHY_CARDS(t).map((card, i) => (
                <motion.div key={i} className="glass-card" style={{ padding: '3rem 2rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div style={{ color: card.color, marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>{card.icon}</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>{card.title}</h3>
                  <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <footer className="app-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '5rem 1rem 3rem', background: '#05050a' }}>
          <div className="container">
            <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>SNAPADDA</h2>
                <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                  Andhra Pradesh's premier real-time real estate verification and acquisition platform. Bridging the gap between elite investors and high-growth assets.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={18}/></div>
                   <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={18}/></div>
                </div>
              </div>
              
              <div>
                <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem' }}>QUICK_ACCESS</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Link to="/search" style={{ color: 'var(--txt-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Browse Properties</Link>
                  <Link to="/onboarding" style={{ color: 'var(--txt-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Join Investor Lobby</Link>
                  <a href="#cities" style={{ color: 'var(--txt-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Regional Analysis</a>
                </div>
              </div>

              <div>
                <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem' }}>SUPPORT_PROTOCOL</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <span style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem' }}>{supportInfo?.email || 'acquisition@snapadda.com'}</span>
                  <span style={{ color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 900 }}>{supportInfo?.phone || '+91 93467 93364'}</span>
                  <div style={{ background: 'rgba(16,217,140,0.1)', color: '#10d98c', padding: '6px 12px', borderRadius: '30px', fontSize: '0.65rem', fontWeight: 900, alignSelf: 'flex-start' }}>ONLINE_NOW</div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ color: 'var(--txt-muted)', fontSize: '0.75rem' }}>© 2026 SNAPADDA ACQUISITION GROUP. ALL CREDENTIALS RESERVED.</div>
              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.75rem', color: 'var(--txt-muted)' }}>
                <span>PRIVACY_ENCRYPTED</span>
                <span>TERMS_OF_ACCESS</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Sticky Mobile Bar Restoration */}
      <div className="mobile-sticky-quick-contact" style={{ 
        display: 'none', gap: '0.75rem', padding: '1rem', background: 'rgba(7,7,15,0.95)', 
        backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.1)',
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000
      }}>
        <a href={`tel:${supportPhone}`} className="hero-btn hero-btn-primary btn-3d" style={{ flex: 1, padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
          <Phone size={18} style={{ marginRight: '8px' }} /> CALL
        </a>
        <a href={`https://wa.me/${supportWA}`} target="_blank" rel="noopener noreferrer" className="hero-btn hero-btn-whatsapp btn-3d-emerald" style={{ flex: 1, textDecoration: 'none', background: '#25D366', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
          <MessageSquare size={18} style={{ marginRight: '8px' }} /> WHATSAPP
        </a>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-sticky-quick-contact { display: flex !important; }
          .section-wrap { padding-bottom: 100px !important; }
        }
      `}</style>

      <Suspense fallback={null}>
        <FilterSidebar isOpen={filterOpen} onClose={() => setFilterOpen(false)} filters={advFilters} setFilters={setAdvFilters} />
      </Suspense>
      <Suspense fallback={null}>
        <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} type={modalType} />
      </Suspense>
    </div>
  );
}
