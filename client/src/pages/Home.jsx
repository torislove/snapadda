import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Search, SlidersHorizontal, MapPin, Phone, MessageSquare, ShieldCheck, Star,
  Building2, Home as HomeIcon, Square, Leaf, Filter, ChevronDown, X, ArrowRight,
  Zap, Shield, Clock, IndianRupee, Compass, Users, TrendingUp, CheckCircle2, Navigation2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchProperties, fetchCities, fetchTestimonials, fetchSetting } from '../services/api';
import { db } from '../firebase';
import { ref, onValue, off } from 'firebase/database';
import PropertyCard from '../components/PropertyCard';
import ContactModal from '../components/ContactModal';
import FilterSidebar from '../components/FilterSidebar';
import PromoCarousel from '../components/PromoCarousel';
import Marquee from '../components/Marquee';
import CityCard from '../components/CityCard';
import Logo from '../components/Logo';
import { SkeletonCityCard, SkeletonPropertyCard } from '../components/SkeletonLoaders';
import { parseSmartSearch, getFuzzySuggestions, loadAndhraData } from '../services/SearchParser';
import { useSEO } from '../utils/useSEO';

const TYPE_TABS = (t) => [
  { label: t('filter.all', 'All'), value: 'all', icon: <Filter size={15} /> },
  { label: t('types.apartments', 'Apartments'), value: 'Apartment', icon: <Building2 size={15} /> },
  { label: t('types.villas', 'Villas'), value: 'Villa', icon: <HomeIcon size={15} /> },
  { label: t('types.plots', 'Plots'), value: 'Plot', icon: <Square size={15} /> },
  { label: t('types.agriculture', 'Agriculture'), value: 'Agriculture', icon: <Leaf size={15} /> },
];

const SMART_PILLS = (t) => [
  { label: t('pills.all', 'All'), key: 'all' },
  { label: `🔥 ${t('pills.under50l', 'Under ₹50L')}`, key: 'budget' },
  { label: `✅ ${t('pills.ready', 'Ready to Move')}`, key: 'ready' },
  { label: `🧭 ${t('pills.east', 'East Facing')}`, key: 'east' },
  { label: `🏛️ ${t('pills.crda', 'CRDA Approved')}`, key: 'crda' },
  { label: `✔️ ${t('pills.verified_only', 'Verified Only')}`, key: 'verified' },
];

const SORT_OPTIONS = (t) => [
  { label: t('sort.newest', 'Newest First'), value: 'newest' },
  { label: t('sort.price_low', 'Price: Low → High'), value: 'price_asc' },
  { label: t('sort.price_high', 'Price: High → Low'), value: 'price_desc' },
  { label: t('sort.featured', 'Featured First'), value: 'featured' },
];

const INTENT_TABS = (t) => [
  { label: t('intent.buy', 'Buy'), value: 'Buy', icon: <HomeIcon size={24} /> },
  { label: t('intent.rent', 'Rent'), value: 'Rent', icon: <Building2 size={24} /> }
];

const BUDGET_OPTIONS = (t) => [
  { label: t('budget.any', 'Any'), value: '' },
  { label: t('budget.under25', 'Under ₹25L'), value: '2500000' },
  { label: t('budget.25to50', '₹25L–50L'), value: '5000000' },
  { label: t('budget.50to1', '₹50L–1Cr'), value: '10000000' },
  { label: t('budget.1to2', '₹1Cr–2Cr'), value: '20000000' },
  { label: t('budget.over2', '₹2Cr+'), value: '999999999' },
];

const WHY_CARDS = (t) => [
  { icon: <ShieldCheck size={24} />, title: t('why.c1title'), desc: t('why.c1desc'), color: '#10d98c' },
  { icon: <Star size={24} />, title: t('why.c2title'), desc: t('why.c2desc'), color: '#f5c842' },
  { icon: <Phone size={24} />, title: t('why.c3title'), desc: t('why.c3desc'), color: '#9b59f5' },
  { icon: <IndianRupee size={24} />, title: t('why.c4title'), desc: t('why.c4desc'), color: '#22d9e0' },
  { icon: <Compass size={24} />, title: t('why.c5title'), desc: t('why.c5desc'), color: '#f5397b' },
  { icon: <CheckCircle2 size={24} />, title: t('why.c6title'), desc: t('why.c6desc'), color: '#ff8c42' },
];

const EMPTY_FILTERS = { bhk: '', minPrice: '', maxPrice: '', facing: 'Any', furnishing: 'N/A', constructionStatus: 'N/A', verified: false, approval: 'All', propertyType: 'All', keyword: '' };

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

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [supportInfo, setSupportInfo] = useState(null);
  const [appearance, setAppearance] = useState({});
  const [userCoords, setUserCoords] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [recentViews, setRecentViews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('callback');
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Dynamic Settings
  const [heroContent, setHeroContent] = useState(null);
  const [siteStats, setSiteStats] = useState([]);
  const [seoData, setSeoData] = useState(null);

  // SEO Injection
  useSEO(seoData);

  // Search / filter state
  const [keyword, setKeyword] = useState('');
  const [intent, setIntent] = useState('Buy');
  const [budget, setBudget] = useState('');
  const [cityFilter, setCityFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [smartPill, setSmartPill] = useState('all');
  const [advFilters, setAdvFilters] = useState({ ...EMPTY_FILTERS });
  const [sortBy, setSortBy] = useState('newest');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filterCount, setFilterCount] = useState(0);

  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 400);
    return () => clearTimeout(handler);
  }, [keyword]);

  // 120Hz Smooth Geolocation & Data Sync
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          setLocationDenied(true);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
    
    // Initial fetch for non-realtime settings
    fetchTestimonials().then(setTestimonials).catch(console.error);
    fetchSetting('appearance').then(d => setAppearance(d || {})).catch(console.error);
    fetchSetting('support_info').then(d => setSupportInfo(d || {})).catch(console.error);
    fetchSetting('hero_content').then(setHeroContent).catch(console.error);
    fetchSetting('site_stats').then(setSiteStats).catch(console.error);
    fetchSetting('seo').then(setSeoData).catch(console.error);

    // 1. ALWAYS FETCH REST API first (ensures data is visible even if Firebase hangs)
    fetchCities().then(setCities).catch(console.error).finally(() => setCitiesLoading(false));

    // 2. ATTACH REAL-TIME LISTENER (optional/background update)
    if (db) {
      const citiesRef = ref(db, 'cities');
      onValue(citiesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const cityList = Object.values(data);
          setCities(cityList.sort((a, b) => a.name.localeCompare(b.name)));
        }
      }, (err) => {
        console.warn("RTDB City sync warning:", err.message);
      });

      return () => off(citiesRef);
    }
  }, []);


  useEffect(() => {
    try {
      const stored = localStorage.getItem('snapadda_recent_views');
      if (stored) {
        const ids = JSON.parse(stored);
        if (ids.length) setRecentViews(ids);
      }
    } catch {}
  }, []);

  useEffect(() => {
    let n = 0;
    if (advFilters.bhk) n++;
    if (advFilters.minPrice) n++;
    if (advFilters.maxPrice) n++;
    if (advFilters.facing !== 'Any') n++;
    if (advFilters.furnishing !== 'N/A') n++;
    if (advFilters.constructionStatus !== 'N/A') n++;
    if (advFilters.verified) n++;
    if (advFilters.approval !== 'All') n++;
    if (advFilters.propertyType !== 'All') n++;
    setFilterCount(n);
  }, [advFilters]);

  useEffect(() => {
    const smartMap = { budget: { maxPrice: '5000000' }, ready: { constructionStatus: 'Ready to Move' }, east: { facing: 'East' }, crda: { approval: 'CRDA' }, verified: { verified: true }, all: EMPTY_FILTERS };
    if (smartMap[smartPill]) setAdvFilters(prev => ({ ...prev, ...smartMap[smartPill] }));
  }, [smartPill]);

  const loadProperties = useCallback(() => {
    setLoading(true);
    const smart = parseSmartSearch(keyword);
    fetchProperties({
      ...advFilters,
      search: (smart?.city && smart?.keyword) ? smart.keyword.replace(new RegExp(smart.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '').trim() : debouncedKeyword,
      type: smart?.type || (typeFilter === 'all' ? undefined : typeFilter),
      city: smart?.city || cityFilter || undefined,
      purpose: intent === 'Buy' ? 'Buy' : intent === 'Rent' ? 'Rent' : undefined,
      approval: advFilters.approval === 'All' ? undefined : advFilters.approval,
      maxPrice: smart?.maxPrice || budget || advFilters.maxPrice || undefined,
      minPrice: smart?.minPrice || advFilters.minPrice || undefined,
      bhk: smart?.bhk || advFilters.bhk || undefined,
    })
      .then(res => {
        const initialProps = res?.data || (Array.isArray(res) ? res : []);
        setProperties(initialProps);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [advFilters, debouncedKeyword, typeFilter, cityFilter, intent, budget]);

  useEffect(() => { 
    loadProperties(); 

    // REST API is already handled by loadProperties() above.
    // Attach real-time listener ONLY for updates to existing properties.
    if (db) {
      const propsRef = ref(db, 'properties');
      onValue(propsRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        
        const firebaseProps = Object.values(data);
        
        // Merge updates from Firebase into existing state
        setProperties(prev => {
          let reversedPrev = [...prev];
          let changed = false;
          const next = reversedPrev.map(p => {
            const updated = firebaseProps.find(fp => fp.id === (p._id || p.id).toString());
            if (updated && (updated.price !== p.price || updated.status !== p.status || updated.title !== p.title)) {
              changed = true;
              return { ...p, ...updated, _id: p._id };
            }
            return p;
          });
          return changed ? next : prev;
        });
      }, (err) => {
        console.warn("RTDB Property sync warning:", err.message);
      });

      return () => off(propsRef);
    }
  }, [loadProperties]);


  const sortedProperties = useMemo(() => {
    const arr = [...properties];
    if (sortBy === 'price_asc') return arr.sort((a, b) => parseFloat(String(a.price).replace(/[^0-9.]/g, '')) - parseFloat(String(b.price).replace(/[^0-9.]/g, '')));
    if (sortBy === 'price_desc') return arr.sort((a, b) => parseFloat(String(b.price).replace(/[^0-9.]/g, '')) - parseFloat(String(a.price).replace(/[^0-9.]/g, '')));
    if (sortBy === 'featured') return arr.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    return arr;
  }, [properties, sortBy]);

  const openLead = (type) => { setModalType(type); setModalOpen(true); };
  const resetFilters = () => { setTypeFilter('all'); setCityFilter(null); setKeyword(''); setSmartPill('all'); setAdvFilters({ ...EMPTY_FILTERS }); setSortBy('newest'); setBudget(''); };

  const supportPhone = (supportInfo?.phone || '+919346793364').replace(/\s+/g, '');
  const supportWA = supportInfo?.whatsapp || '919346793364';

  return (
    <div 
      className={`app-container ${appearance?.enable3D !== false ? 'scene-3d' : ''}`}
      style={{ 
        '--brand-primary': appearance?.primaryColor || '#e8b84b',
        '--brand-glow': (appearance?.primaryColor || '#e8b84b') + '44'
      }}
    >
      {appearance?.bgUrl
        ? <div className="site-bg-overlay" style={{ backgroundImage: `url(${appearance.bgUrl})`, opacity: 0.22, position: 'fixed', inset: 0, backgroundSize: 'cover', zIndex: 0 }} />
        : <div className="animated-bg" style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(10,80,40,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(130,60,0,0.08) 0%, transparent 60%), var(--bg-deep)' }} />
      }

      <main style={{ flex: 1, paddingTop: 'var(--nav-h)' }}>
        <Marquee />

        <section className="promo-section-top">
          <div className="container">
            <div className="promo-header-label"><Zap size={13} /> Featured Promotions &amp; Offers</div>
            <PromoCarousel />
          </div>
        </section>

        <section id="search" className="search-section" style={{ paddingTop: '1rem' }}>
          <div className="container">
            <motion.div
              ref={searchRef}
              className="search-platform glass-heavy"
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
              onMouseMove={e => {
                if (!searchRef.current) return;
                const r = searchRef.current.getBoundingClientRect();
                mx.set((e.clientX - r.left) / r.width - 0.5);
                my.set((e.clientY - r.top) / r.height - 0.5);
              }}
              onMouseLeave={() => { mx.set(0); my.set(0); }}
            >
              <div className="intent-cards">
                {INTENT_TABS(t).map(tab => (
                  <button key={tab.value} className={`intent-card${intent === tab.value ? ' active' : ''}`} onClick={() => setIntent(tab.value)}>
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
              <div className="search-main-row">
                <div className="search-bar-wrap">
                  <Search size={18} className="s-icon" />
                  <input
                    type="text" className="search-bar-input" placeholder="Location, project, keyword..."
                    value={keyword} onChange={e => setKeyword(e.target.value)}
                    onFocus={() => { loadAndhraData(); setShowAutocomplete(true); }}
                    onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                    onKeyDown={e => e.key === 'Enter' && loadProperties()}
                  />
                  {showAutocomplete && keyword.length >= 2 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="search-autocomplete-dropdown">
                      {getFuzzySuggestions(keyword).length > 0 ? (
                        <>
                          <div className="autocomplete-header">Suggested Locations (Andhra Pradesh)</div>
                          {getFuzzySuggestions(keyword).map(c => (
                            <button key={`${c.name}-${c.type}`} className="autocomplete-item" onClick={() => { setKeyword(c.name); setCityFilter(c.name); setShowAutocomplete(false); }}>
                              <MapPin size={14} className="ac-icon" />
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.name}</span>
                                <span className="ac-badge" style={{ fontSize: '0.65rem' }}>{c.type === 'District' ? 'District' : c.district || 'Andhra Pradesh'} • {c.type}</span>
                              </div>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="autocomplete-header">Continue typing for all Mandals/Cities...</div>
                      )}
                    </motion.div>
                  )}
                  {keyword && <button className="search-clear" onMouseDown={e => { e.preventDefault(); setKeyword(''); }}><X size={14} /></button>}
                </div>
                <div className="search-selects-row" style={{ flexDirection: 'column', gap: '1.25rem', width: '100%', alignItems: 'stretch', paddingTop: '0.5rem' }}>
                  {/* City Cards Selection */}
                  <div className="city-select-card">
                    <div style={{ fontSize: '0.85rem', color: 'var(--txt-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} style={{ color: 'var(--gold)' }}/> Explore Regions
                    </div>
                    <div className="hero-city-cards-scroller" style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                      <div className={`city-image-pill ${!cityFilter ? 'active' : ''}`} onClick={() => setCityFilter(null)}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--midnight) 0%, rgba(212,175,55,0.4) 100%)', zIndex: 0 }}></div>
                        <span>All AP</span>
                      </div>
                      {cities.map(c => (
                        <div key={c._id || c.id} className={`city-image-pill ${cityFilter === c.name ? 'active' : ''}`} onClick={() => setCityFilter(c.name)}>
                          {c.image && <img src={c.image} alt={c.name} />}
                          <span>{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Budget Slider */}
                  <div className="budget-card">
                    <div style={{ fontSize: '0.85rem', color: 'var(--txt-primary)', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IndianRupee size={14} style={{ color: 'var(--gold)' }}/> Investment Range</span>
                      <span style={{ color: 'var(--gold)', background: 'var(--gold-dim)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                        {(!budget || budget === '999999999') ? 'Any Budget' : `Up to ₹${Number(budget) >= 10000000 ? (Number(budget)/10000000) + ' Cr' : (Number(budget)/100000) + ' Lakhs'}`}
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="1000000" 
                      max="50000000" 
                      step="1000000" 
                      value={budget && budget !== '999999999' ? budget : 50000000} 
                      onChange={e => setBudget(e.target.value === '50000000' ? '999999999' : e.target.value)} 
                      style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer', height: '4px' }} 
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--txt-muted)', fontWeight: 600 }}>
                      <span>₹10L</span>
                      <span>₹5Cr+</span>
                    </div>
                  </div>
                </div>
                <div className="search-action-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem' }}>
                  <button className="search-filter-btn" onClick={() => setFilterOpen(true)} style={{ width: 'auto', padding: '0.8rem 1.5rem', background: 'var(--gold)', color: 'var(--midnight)', fontWeight: 800 }}>
                    <SlidersHorizontal size={18} style={{ marginRight: '8px' }} />
                    Advanced Filters
                    {filterCount > 0 && <span className="filter-badge" style={{ position: 'relative', top: 0, right: 0, marginLeft: '8px', border: '1px solid currentColor' }}>{filterCount}</span>}
                  </button>
                </div>
              </div>
              <div className="search-quick-chips">
                {['1 BHK', '2 BHK', '3 BHK', '4+ BHK'].map(b => (
                  <button key={b} className={`quick-chip${advFilters.bhk === b.split(' ')[0] ? ' active' : ''}`} onClick={() => setAdvFilters(prev => ({ ...prev, bhk: prev.bhk === b.split(' ')[0] ? '' : b.split(' ')[0] }))}>{b}</button>
                ))}
                <div className="chip-divider" />
                {[['Under 50L', '', '5000000'], ['50L-1Cr', '5000000', '10000000'], ['1Cr-2Cr', '10000000', '20000000'], ['2Cr+', '20000000', '']].map(([label, min, max]) => {
                  const active = advFilters.minPrice === min && advFilters.maxPrice === max;
                  return <button key={label} className={`quick-chip${active ? ' active' : ''}`} onClick={() => setAdvFilters(prev => active ? { ...prev, minPrice: '', maxPrice: '' } : { ...prev, minPrice: min, maxPrice: max })}>₹{label}</button>;
                })}
                {filterCount > 0 && <button className="quick-chip clear-chip" onClick={resetFilters}><X size={12} /> Clear</button>}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="hero-section" style={{ paddingBottom: '2.5rem' }}>
          <div className="container">
            <motion.div className="hero-eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <MapPin size={12} /> {heroContent?.eyebrow || t('hero.eyebrow')}
            </motion.div>
            <motion.h1 className="hero-title" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}>
              {heroContent?.title?.split('|')[0] || t('hero.title1')}
              <span className="gold-line text-royal-gold" style={{ display: 'block' }}>
                {typedWord}<span style={{ color: 'var(--gold)', opacity: 0.7 }}>|</span>
              </span>
              {heroContent?.title?.split('|')[1] || t('hero.title2')}
            </motion.h1>
            <motion.p className="hero-subtitle" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              {heroContent?.subtitle || t('hero.subtitle')}
            </motion.p>
            <motion.div className="hero-ctas" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.3 }}>
              <a href={heroContent?.cta1Url || "#cities"} className="hero-btn hero-btn-primary">
                <Navigation2 size={18} /> {heroContent?.cta1Text || t('hero.browseBtn')}
              </a>
              <a href={heroContent?.cta2Url === 'callback' ? '#' : (heroContent?.cta2Url || `tel:${supportPhone}`)} 
                 onClick={(e) => { if (heroContent?.cta2Url === 'callback') { e.preventDefault(); openLead('callback'); } }}
                 className="hero-btn hero-btn-glass">
                 <Phone size={18} /> {heroContent?.cta2Text || 'CALL AGENT NOW'}
              </a>
            </motion.div>
            <motion.div className="hero-stats-row" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
              {Array.isArray(siteStats) && siteStats.length > 0 ? (
                siteStats.map((s, i) => (
                  <div key={i} className="hero-stat-chip">
                    <div className="stat-v">{s?.value}</div>
                    <div className="stat-l">{s?.label}</div>
                  </div>
                ))
              ) : (
                [
                  { icon: <ShieldCheck size={15} />, val: `${(properties || []).filter(p => p?.isVerified).length || 0}+`, label: t('stats.verified') },
                  { icon: <MapPin size={15} />, val: `${(cities || []).length}`, label: t('stats.cities') },
                  { icon: <Users size={15} />, val: '2,400+', label: t('stats.clients') },
                  { icon: <Star size={15} />, val: 'CRDA', label: t('stats.approved') },
                ].map((s, i) => (
                  <div key={i} className="hero-stat-chip">
                    <div className="stat-v">{s.val}</div>
                    <div className="stat-l">{s.label}</div>
                  </div>
                ))
              )}
            </motion.div>
          </div>
        </section>

        <section id="cities" className="section-wrap" style={{ paddingBottom: '1rem' }}>
          <div className="container">
            <div className="section-head">
              <div className="section-eyebrow">{t('cities.eyebrow')}</div>
              <h2 className="section-title" style={{ color: '#ffffff' }}>{t('cities.title')}</h2>
              <p className="section-subtitle" style={{ color: 'var(--txt-secondary)' }}>{t('cities.subtitle')}</p>
            </div>
            <div className="city-cards-grid">
              {citiesLoading ? (
                Array(6).fill(0).map((_, i) => <SkeletonCityCard key={i} />)
              ) : (
                cities.map((c, i) => (
                  <motion.div key={c._id || c.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                    <CityCard city={c} count={c.propertyCount || 0} cityPhoto={c.image} isActive={cityFilter === c.name} onClick={() => setCityFilter(cityFilter === c.name ? null : c.name)} index={i} />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

        <AnimatePresence>
          {(userCoords || locationDenied) && (
            <motion.section
              key="nearby-section"
              className="section-wrap"
              style={{ background: 'rgba(212,175,55,0.02)', borderTop: '1px solid rgba(212,175,55,0.05)', borderBottom: '1px solid rgba(212,175,55,0.05)' }}
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="container">
                <div className="section-head">
                  <div className="section-eyebrow" style={{ color: 'var(--gold)' }}><Navigation2 size={14} /> {t('geo.hotspotsTitle', 'REGIONAL HOTSPOTS')}</div>
                  <h2 className="section-title" style={{ color: '#ffffff' }}>{t('geo.hotspotsHeadline', 'Regional Growth Hotspots')}</h2>
                  <p className="section-subtitle" style={{ color: 'var(--txt-secondary)' }}>
                    {userCoords ? 'Verified assets and developments near your current location.' : 'Allow location access for personalised nearby listings.'}
                  </p>
                </div>
                <div className="properties-grid">
                  {sortedProperties.slice(0, 6).map((p, i) => (
                    <motion.div key={`nearby-${p._id}`} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                      <PropertyCard {...p} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section style={{ padding: '0 0 1.5rem' }}>
          <div className="container">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="section-head" style={{ marginBottom: '0.5rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.25rem' }}>Asset Classification</h3>
                <p style={{ color: 'var(--txt-muted)', fontSize: '0.85rem' }}>Filter properties uniquely structured for your needs.</p>
              </div>
              <div className="type-cards-grid">
                {TYPE_TABS(t).map(tOpt => (
                  <button key={tOpt.value} className={`type-card${typeFilter === tOpt.value ? ' active' : ''}`} onClick={() => setTypeFilter(tOpt.value)}>
                    {tOpt.icon} 
                    <span>{tOpt.label}</span>
                  </button>
                ))}
              </div>
              <div className="smart-filter-pills">
                {SMART_PILLS(t).map(p => (
                  <button key={p.key} className={`smart-pill${smartPill === p.key ? ' active' : ''}`} onClick={() => setSmartPill(p.key)}>{p.label}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="properties" className="section-wrap" style={{ paddingTop: '0.5rem' }}>
          <div className="container">
            <div className="section-title-row">
              <div>
                <h2 style={{ fontSize: '1.35rem', marginBottom: '2px', color: '#ffffff' }}>
                  {cityFilter ? `${t('properties.propsIn')} ${cityFilter}` : intent === 'Rent' ? t('properties.rentals') : intent === 'Plot' ? t('properties.plots') : t('properties.featured')}
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--txt-muted)' }}>{t('properties.showing')}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="result-count">{sortedProperties.length} {t('properties.found')}</span>
                <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  {SORT_OPTIONS(t).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {(filterCount > 0 || cityFilter || budget || typeFilter !== 'all') && (
                  <button className="btn btn-glass btn-sm" onClick={resetFilters}><X size={12} /> {t('search.clear')}</button>
                )}
              </div>
            </div>

            <div className="properties-grid">
              {loading ? Array(3).fill(0).map((_, i) => <SkeletonPropertyCard key={i} />) : sortedProperties.length > 0 ? (
                sortedProperties.map((p, i) => (
                  <motion.div key={p._id || p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <PropertyCard {...p} />
                  </motion.div>
                ))
              ) : (
                <div className="empty-state">
                  <Search size={48} />
                  <h3>{t('properties.none')}</h3>
                  <button className="hero-btn hero-btn-primary" onClick={resetFilters}>{t('search.clear')}</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="stats-band">
          <div className="container">
            <div className="stats-grid">
              {[
                { icon: <TrendingUp size={22} />, val: `${properties.length}+`, label: 'Total Listings' },
                { icon: <ShieldCheck size={22} />, val: `${properties.filter(p => p.isVerified).length}+`, label: 'Verified Properties' },
                { icon: <MapPin size={22} />, val: `${new Set(properties.map(p => p.location)).size}+`, label: 'Locations' },
                { icon: <Phone size={22} />, val: '24/7', label: 'Expert Support' },
              ].map((s, i) => (
                <motion.div key={i} className="stat-card" whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value">{s.val}</div>
                  <div className="stat-label">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="cta-section">
          <div className="container">
            <motion.div className="cta-card glass-heavy" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '2rem', padding: '3rem 2rem' }}>
              <div style={{ maxWidth: '800px' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{t('cta.title')}</h2>
                <p style={{ fontSize: '1.15rem', color: 'var(--txt-secondary)', marginBottom: '2.5rem' }}>{t('cta.subtitle')}</p>
                <div className="cta-buttons" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <a href={`tel:${supportPhone}`} className="hero-btn hero-btn-primary pulse-primary btn-3d" style={{ textDecoration: 'none', padding: '1.1rem 2.5rem', minWidth: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={20} style={{ marginRight: '10px' }} /> CALL AGENT NOW
                  </a>
                  <a href={`https://wa.me/${supportWA}?text=Hello, I am interested in property in Andhra.`} className="hero-btn hero-btn-whatsapp pulse-green btn-3d-emerald" style={{ textDecoration: 'none', padding: '1.1rem 2.5rem', minWidth: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={20} style={{ marginRight: '10px' }} /> {t('cta.whatsapp')}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <footer className="app-footer">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-col"><Logo size={28} showText /><p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--txt-muted)' }}>{t('footer.aboutText')}</p></div>
              <div className="footer-col"><h4>{t('footer.quick')}</h4><a href="#properties">Properties</a><a href="#cities">Locations</a><a href="#contact">Contact</a></div>
              <div className="footer-col"><h4>{t('footer.support')}</h4><a href={`mailto:${supportInfo?.email || 'info@snapadda.com'}`}>{supportInfo?.email || 'info@snapadda.com'}</a><a href={`tel:${supportPhone}`}>{supportInfo?.phone || '+91 93467 93364'}</a></div>
            </div>
            <div className="footer-bottom"><span>© 2026 SnapAdda. {t('footer.rights')}</span></div>
          </div>
        </footer>
      </main>

      <div className="mobile-sticky-quick-contact" style={{ 
        display: 'none', 
        gap: '0.75rem', 
        padding: '1rem', 
        background: 'rgba(7,7,15,0.95)', 
        backdropFilter: 'blur(20px)', 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        pointerEvents: 'none'
      }}>
        <a href={`tel:${supportPhone}`} className="hero-btn hero-btn-primary pulse-primary btn-3d" style={{ flex: 1, padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', pointerEvents: 'auto' }}>
          <Phone size={18} style={{ marginRight: '8px' }} /> CALL NOW
        </a>
        <a href={`https://wa.me/${supportWA}?text=Hello,%20I'm%20looking%20for%20assistance.`} className="hero-btn hero-btn-whatsapp pulse-green btn-3d-emerald" style={{ flex: 1, textDecoration: 'none', background: '#25D366', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', pointerEvents: 'auto' }}>
          <MessageSquare size={18} style={{ marginRight: '8px' }} /> WHATSAPP
        </a>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-sticky-quick-contact { display: flex !important; }
          .section-wrap { padding-bottom: 100px !important; }
        }
      `}</style>

      <FilterSidebar isOpen={filterOpen} onClose={() => setFilterOpen(false)} filters={advFilters} setFilters={setAdvFilters} onApply={() => setFilterOpen(false)} />
      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} type={modalType} />
    </div>
  );
}
