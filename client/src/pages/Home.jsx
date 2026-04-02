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
import { fetchProperties, fetchCities, fetchTestimonials, fetchSetting, validateProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import ContactModal from '../components/ContactModal';
import FilterSidebar from '../components/FilterSidebar';
import PromoCarousel from '../components/PromoCarousel';
import Marquee from '../components/Marquee';
import CityCard from '../components/CityCard';
import Logo from '../components/Logo';
import { SkeletonCityCard, SkeletonPropertyCard } from '../components/SkeletonLoaders';
import { parseSmartSearch, getFuzzySuggestions, loadAndhraData } from '../services/SearchParser';

const TYPE_TABS = [
  { label: 'All', value: 'all', icon: <Filter size={15} /> },
  { label: 'Apartments', value: 'Apartment', icon: <Building2 size={15} /> },
  { label: 'Villas', value: 'Villa', icon: <HomeIcon size={15} /> },
  { label: 'Plots', value: 'Plot', icon: <Square size={15} /> },
  { label: 'Agriculture', value: 'Agriculture', icon: <Leaf size={15} /> },
];

const SMART_PILLS = [
  { label: 'All', key: 'all' },
  { label: '🔥 Under ₹50L', key: 'budget' },
  { label: '✅ Ready to Move', key: 'ready' },
  { label: '🧭 East Facing', key: 'east' },
  { label: '🏛️ CRDA Approved', key: 'crda' },
  { label: '✔️ Verified Only', key: 'verified' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Featured First', value: 'featured' },
];

const INTENT_TABS = ['Buy', 'Rent', 'Plot'];
const BUDGET_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'Under ₹25L', value: '2500000' },
  { label: '₹25L–50L', value: '5000000' },
  { label: '₹50L–1Cr', value: '10000000' },
  { label: '₹1Cr–2Cr', value: '20000000' },
  { label: '₹2Cr+', value: '999999999' },
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  // 120Hz Smooth Geolocation & Data Sync
  useEffect(() => {
    // Request location on mount
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          console.log('Elite Location identified:', pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation access declined or unavailable:', err.message);
          setLocationDenied(true);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
    
    fetchCities().then(d => { setCities(d); setCitiesLoading(false); }).catch(console.error);
    fetchTestimonials().then(setTestimonials).catch(console.error);
    fetchSetting('appearance').then(d => setAppearance(d || {})).catch(console.error);
    fetchSetting('support_info').then(d => setSupportInfo(d || {})).catch(console.error);
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
    
    // Smart Parsing (Refined V3)
    const smart = parseSmartSearch(keyword);
    
    fetchProperties({
      ...advFilters,
      search: smart?.city ? smart.keyword.replace(new RegExp(smart.city, 'gi'), '').trim() : keyword,
      type: smart?.type || (typeFilter === 'all' ? undefined : typeFilter),
      city: smart?.city || cityFilter || undefined,
      purpose: intent === 'Buy' ? 'Buy' : intent === 'Rent' ? 'Rent' : undefined,
      approval: advFilters.approval === 'All' ? undefined : advFilters.approval,
      maxPrice: smart?.maxPrice || budget || advFilters.maxPrice || undefined,
      minPrice: smart?.minPrice || advFilters.minPrice || undefined,
      bhk: smart?.bhk || advFilters.bhk || undefined,
    })
      .then(res => setProperties(res?.data || (Array.isArray(res) ? res : [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [advFilters, keyword, typeFilter, cityFilter, intent, budget]);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  const sortedProperties = useMemo(() => {
    const arr = [...properties];
    if (sortBy === 'price_asc') return arr.sort((a, b) => parseFloat(String(a.price).replace(/[^0-9.]/g, '')) - parseFloat(String(b.price).replace(/[^0-9.]/g, '')));
    if (sortBy === 'price_desc') return arr.sort((a, b) => parseFloat(String(b.price).replace(/[^0-9.]/g, '')) - parseFloat(String(a.price).replace(/[^0-9.]/g, '')));
    if (sortBy === 'featured') return arr.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    return arr;
  }, [properties, sortBy]);

  const openLead = (type) => { setModalType(type); setModalOpen(true); };
  const resetFilters = () => { setTypeFilter('all'); setCityFilter(null); setKeyword(''); setSmartPill('all'); setAdvFilters({ ...EMPTY_FILTERS }); setSortBy('newest'); setBudget(''); };

  const isHome = true;

  return (
    <div className={`app-container ${appearance?.enable3D !== false ? 'scene-3d' : ''}`}>
      {/* Background */}
      {appearance?.bgUrl
        ? <div className="site-bg-overlay" style={{ backgroundImage: `url(${appearance.bgUrl})`, opacity: 0.22, position: 'fixed', inset: 0, backgroundSize: 'cover', zIndex: 0 }} />
        : (
          <div className="animated-bg" style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(10,80,40,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(130,60,0,0.08) 0%, transparent 60%), var(--bg-deep)' }} />
        )
      }

      <main style={{ flex: 1, paddingTop: 'var(--nav-h)' }}>
        {/* Marquee */}
        <Marquee />

        {/* Promo Carousel */}
        <section className="promo-section-top">
          <div className="container">
            <div className="promo-header-label"><Zap size={13} /> Featured Promotions &amp; Offers</div>
            <PromoCarousel />
          </div>
        </section>

        {/* Search Platform — NOW AT TOP BELOW HEADER */}
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
              <div className="search-tabs">
                {INTENT_TABS.map(t => <button key={t} className={`search-tab${intent === t ? ' active' : ''}`} onClick={() => setIntent(t)}>{t}</button>)}
              </div>
              <div className="search-main-row">
                <div className="search-bar-wrap">
                  <Search size={18} className="s-icon" />
                  <input
                    type="text" className="search-bar-input" placeholder="Location, project, keyword..."
                    value={keyword} onChange={e => setKeyword(e.target.value)}
                    onFocus={(e) => { loadAndhraData(); setShowAutocomplete(true); }}
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
                <div className="search-selects-row">
                  <div className="search-select-wrap">
                    <Building2 size={15} className="sel-icon" />
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="search-select">
                      <option value="all">All Types</option>
                      {TYPE_TABS.filter(t => t.value !== 'all').map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="search-select-wrap">
                    <IndianRupee size={15} className="sel-icon" />
                    <select value={budget} onChange={e => setBudget(e.target.value)} className="search-select">
                      {BUDGET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="search-select-wrap">
                    <MapPin size={15} className="sel-icon" />
                    <select value={cityFilter || ''} onChange={e => setCityFilter(e.target.value || null)} className="search-select">
                      <option value="">All Locations</option>
                      {cities.map(c => <option key={c._id || c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="search-action-row">
                  <button className="search-go-btn" onClick={loadProperties}><Search size={18} /> Search</button>
                  <button className="search-filter-btn" onClick={() => setFilterOpen(true)}>
                    <SlidersHorizontal size={16} />
                    {filterCount > 0 && <span className="filter-badge">{filterCount}</span>}
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

        {/* Hero */}
        <section className="hero-section" style={{ paddingBottom: '2.5rem' }}>
          <div className="container">
            <motion.div className="hero-eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <MapPin size={12} /> {t('hero.eyebrow')}
            </motion.div>
            <motion.h1 className="hero-title" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}>
              {t('hero.title1')}
              <span className="gold-line text-royal-gold" style={{ display: 'block' }}>
                {typedWord}<span style={{ color: 'var(--gold)', opacity: 0.7 }}>|</span>
              </span>
              {t('hero.title2')}
            </motion.h1>
            <motion.p className="hero-subtitle" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              {t('hero.subtitle')}
            </motion.p>
            <motion.div className="hero-ctas" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.3 }}>
              <a href="#cities" className="hero-btn hero-btn-primary"><Navigation2 size={18} /> {t('hero.browseBtn')}</a>
              <button className="hero-btn hero-btn-glass" onClick={() => openLead('callback')}><Phone size={18} /> {t('hero.callBtn')}</button>
            </motion.div>
            <motion.div className="hero-stats-row" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
              {[
                { icon: <ShieldCheck size={15} />, val: `${properties.filter(p => p.isVerified).length || 0}+`, label: t('stats.verified') },
                { icon: <MapPin size={15} />, val: `${cities.length}`, label: t('stats.cities') },
                { icon: <Users size={15} />, val: '2,400+', label: t('stats.clients') },
                { icon: <Star size={15} />, val: 'CRDA', label: t('stats.approved') },
              ].map((s, i) => (
                <div key={i} className="hero-stat-chip">
                  {s.icon}
                  <div>
                    <div className="hero-stat-val">{s.val}</div>
                    <div className="hero-stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Cities */}
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
            {cityFilter && (
              <motion.div className="active-city-tag" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <MapPin size={13} /> {t('cities.filtering')} <strong>{cityFilter}</strong>
                <button onClick={() => setCityFilter(null)}><X size={13} /></button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Nearby Regional Assets — AnimatePresence for zero empty-space */}
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
                  <div className="section-eyebrow" style={{ color: 'var(--gold)' }}>
                    <Navigation2 size={14} /> REGIONAL HOTSPOTS {userCoords ? '(200KM RADIUS)' : 'TOP PICKS'}
                  </div>
                  <h2 className="section-title" style={{ color: '#ffffff' }}>Regional Growth Hotspots</h2>
                  <p className="section-subtitle" style={{ color: 'var(--txt-secondary)' }}>
                    {userCoords ? 'Verified assets and developments near your current location.' : 'Allow location access for personalised nearby listings.'}
                  </p>
                </div>

                {locationDenied && (
                  <motion.div
                    className="location-permission-banner"
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)',
                      borderRadius: '14px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <Navigation2 size={18} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)', flex: 1 }}>
                      <strong style={{ color: 'var(--txt-primary)' }}>Location access denied.</strong> Showing top picks from across Andhra Pradesh instead.
                    </span>
                  </motion.div>
                )}

                <div className="properties-grid">
                  {sortedProperties.slice(0, 6).map((p, i) => (
                    <motion.div key={`nearby-${p._id}`} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                      <PropertyCard {...p} onTriggerLead={() => navigate('/request-callback')} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Type Tabs + Smart Pills */}
        <section style={{ padding: '0 0 1.5rem' }}>
          <div className="container">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="type-tabs-bar">
                {TYPE_TABS.map(t => (
                  <button key={t.value} className={`type-tab${typeFilter === t.value ? ' active' : ''}`} onClick={() => setTypeFilter(t.value)}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
              <div className="smart-filter-pills">
                {SMART_PILLS.map(p => (
                  <button key={p.key} className={`smart-pill${smartPill === p.key ? ' active' : ''}`} onClick={() => setSmartPill(p.key)}>{p.label}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
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
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {(filterCount > 0 || cityFilter || budget || typeFilter !== 'all') && (
                  <button className="btn btn-glass btn-sm" onClick={resetFilters}><X size={12} /> {t('search.clear')}</button>
                )}
              </div>
            </div>

            <div className="properties-grid">
              {loading ? (
                Array(3).fill(0).map((_, i) => <SkeletonPropertyCard key={i} />)
              ) : sortedProperties.length > 0 ? (
                sortedProperties.map((p, i) => (
                  <motion.div key={p._id || p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <PropertyCard {...p} approval={p.approvalAuthority || p.approval} onTriggerLead={openLead} />
                  </motion.div>
                ))
              ) : (
                <div className="empty-state">
                  <Search size={48} />
                  <h3>{t('properties.none')}</h3>
                  <p>{t('properties.adjust')}</p>
                  <button className="hero-btn hero-btn-primary" style={{ marginTop: '0.5rem' }} onClick={resetFilters}>{t('search.clear')}</button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stats Band */}
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

        {/* Why SnapAdda */}
        <section className="section-wrap why-section">
          <div className="container">
            <div className="section-head" style={{ textAlign: 'center' }}>
              <div className="section-eyebrow" style={{ justifyContent: 'center' }}>{t('why.eyebrow')}</div>
              <h2 className="section-title" style={{ color: '#ffffff' }}>{t('why.title')}</h2>
              <p className="section-subtitle" style={{ color: 'var(--txt-secondary)' }}>Everything you need to find, verify, and close a property deal</p>
            </div>
            <div className="why-grid">
              {WHY_CARDS(t).map((c, i) => (
                <motion.div key={i} className="why-card glass-heavy tilt-3d" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="why-icon-wrap" style={{ color: c.color, background: `${c.color}18`, border: `1px solid ${c.color}30` }}>{c.icon}</div>
                  <h3 className="why-title">{c.title}</h3>
                  <p className="why-desc">{c.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className="section-wrap" style={{ overflow: 'hidden' }}>
            <div className="container">
            <div className="section-head" style={{ textAlign: 'center' }}>
              <div className="section-eyebrow" style={{ justifyContent: 'center' }}>{t('testimonials.eyebrow')}</div>
              <h2 className="section-title" style={{ color: '#ffffff' }}>{t('testimonials.title')}</h2>
              <p className="section-subtitle" style={{ color: 'var(--txt-secondary)' }}>Thousands of families have found their home with SnapAdda</p>
            </div>
            </div>
            <div className="testimonial-marquee-container">
              <div className="testimonial-marquee-track">
                {[...testimonials, ...testimonials].map((t, i) => (
                  <motion.div key={`t-${t._id || i}-${i}`} className="testimonial-card glass-heavy">
                    <div className="test-quote">"</div>
                    <p className="test-text">{t.text}</p>
                    <div className="test-footer">
                      <div className="test-avatar" style={{ background: t.color || 'var(--gold)' }}>{t.name?.charAt(0) || 'U'}</div>
                      <div className="test-info">
                        <div className="test-name">{t.name}</div>
                        <div className="test-loc">{t.location}</div>
                      </div>
                      <div className="test-rating">
                        {[1,2,3,4,5].map(n => <Star key={n} size={12} fill={n <= (t.rating || 5) ? 'var(--gold)' : 'none'} color="var(--gold)" />)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section id="contact" className="cta-section">
          <div className="container">
            <motion.div className="cta-card glass-heavy" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.75 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
              <div className="cta-content" style={{ flex: 1, minWidth: '300px' }}>
                <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>Ready to Start Your Journey?</h2>
                <p style={{ fontSize: '1.05rem', color: 'var(--txt-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                  Connect with our verified property experts today and get a free consultation on the <strong>{cityFilter || 'Andhra'}</strong> real estate market.
                </p>
                <div className="cta-buttons" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <button type="button" className="hero-btn hero-btn-primary pulse-primary btn-3d" onClick={() => navigate('/request-callback')}>
                    <Phone size={18} style={{ marginRight: '6px' }} /> {t('contact.send')}
                  </button>
                  <a href={`https://wa.me/${supportInfo?.whatsapp || '919999999911'}?text=Hello, I am interested in property in Andhra.`} className="hero-btn hero-btn-whatsapp pulse-green btn-3d-emerald" style={{ textDecoration: 'none' }}>
                    <MessageSquare size={18} style={{ marginRight: '6px' }} /> WhatsApp Us
                  </a>
                </div>
              </div>
              <div className="cta-visual" style={{ flex: 0.4, minWidth: '240px', position: 'relative', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="cta-orb gold-orb" style={{ width: '200px', height: '200px', opacity: 0.15 }} />
                <Building2 size={80} style={{ color: 'var(--gold)', opacity: 0.3, position: 'absolute', filter: 'blur(1px)' }} />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="app-footer glass-3d-heavy">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-col">
                <Logo size={28} showText />
                <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--txt-muted)', lineHeight: 1.6 }}>
                  Andhra Pradesh's most trusted 3D interactive property portal. We simplify search, verify authenticity, and deliver dreams.
                </p>
              </div>
              <div className="footer-col">
                <h4>{t('footer.quick')}</h4>
                <a href="#properties">{t('nav.properties')}</a>
                <a href="#cities">{t('nav.locations')}</a>
                <a href="#contact">{t('nav.contact')}</a>
              </div>
              <div className="footer-col" id="about">
                <h4>About SnapAdda</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--txt-muted)', lineHeight: 1.6, marginTop: '0.2rem' }}>
                  SnapAdda is AP's fastest-growing premium property portal. We ensure 100% verified, CRDA approved properties to eliminate fraud and provide a seamless real estate experience.
                </p>
              </div>
              <div className="footer-col">
                <h4>Support</h4>
                <a href={`mailto:${supportInfo?.email || 'info@snapadda.com'}`}>{supportInfo?.email || 'info@snapadda.com'}</a>
                <a href={`tel:${(supportInfo?.phone || '+919999999999').replace(/\s+/g, '')}`}>{supportInfo?.phone || '+91 99999 99999'}</a>
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--gold)' }}>Developer</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--txt-muted)' }}>Built with ❤️ by <strong>SnapAdda Tech</strong></p>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© 2026 SnapAdda. All rights reserved.</span>
              <div className="footer-badges">
                <span className="badge-crda">AP CRDA Approved</span>
                <span className="badge-rera">AP RERA Registered</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Sticky Mobile Quick Contact */}
      <div className="mobile-sticky-quick-contact">
        <button className="hero-btn hero-btn-primary pulse-primary btn-3d" onClick={() => openLead('callback')} style={{ flex: 1 }}>
          <Phone size={16} style={{ marginRight: '4px' }} /> Callback
        </button>
        <a href={`https://wa.me/${supportInfo?.whatsapp || '919999999911'}?text=Hello,%20I'm%20looking%20for%20assistance.`} className="hero-btn hero-btn-whatsapp pulse-green btn-3d-emerald" style={{ flex: 1, textDecoration: 'none', background: '#25D366' }}>
          <MessageSquare size={16} style={{ marginRight: '4px' }} /> WhatsApp
        </a>
      </div>

      {/* FABs */}
      <button className="fab-callback" onClick={() => openLead('callback')}><Phone size={28} /></button>
      <button className="fab-filters" onClick={() => setFilterOpen(true)}><SlidersHorizontal size={24} /></button>

      {/* Modals */}
      <FilterSidebar isOpen={filterOpen} onClose={() => setFilterOpen(false)} filters={advFilters} setFilters={setAdvFilters} onApply={() => setFilterOpen(false)} />
      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} type={modalType} />
    </div>
  );
}
