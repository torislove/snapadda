import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Search, SlidersHorizontal, MapPin, Phone, MessageSquare, ShieldCheck, Star,
  Building2, Home as HomeIcon, Square, Leaf, Filter, ChevronDown, X, ArrowRight,
  Zap, Shield, Clock, IndianRupee, Compass, Users, TrendingUp, CheckCircle2, Navigation2, Flame,
  Warehouse, Factory
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchProperties, fetchCities, fetchTestimonials, fetchSetting } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import ContactModal from '../components/ContactModal';
import ClientReviews from '../components/ClientReviews';
import { logUserActivity, ACTIONS } from '../services/activityTracker';
import FilterSidebar from '../components/FilterSidebar';
import PromoCarousel from '../components/PromoCarousel';
import Marquee from '../components/Marquee';
import CityCard from '../components/CityCard';
import Logo from '../components/Logo';
import { SkeletonCityCard, SkeletonPropertyCard } from '../components/SkeletonLoaders';
import { parseSmartSearch, getFuzzySuggestions, loadAndhraData } from '../services/SearchParser';
import { useSEO } from '../utils/useSEO';
import HorizontalPropertySection from '../components/HorizontalPropertySection';

// ─── Recently Sold Live Ticker ─────────────────────────────────────────────
const SOLD_FEED = [
  { emoji: '🏡', text: 'గుంటూరులో రెసిడెన్షియల్ ప్లాట్ ఇప్పుడే రిజర్వ్ చేయబడింది', time: '2నిమి క్రితం', price: '₹18L' },
  { emoji: '🌾', text: 'కృష్ణా జిల్లాలో వ్యవసాయ భూమి అమ్ముడైపోయింది', time: '5నిమి క్రితం', price: '₹45L' },
  { emoji: '🏢', text: 'విజయవాడలో కమర్షియల్ స్పేస్ బుక్ అయింది', time: '12నిమి క్రితం', price: '₹1.2Cr' },
  { emoji: '🏘️', text: 'అమరావతిలో గేటెడ్ కమ్యూనిటీ విల్లా రిజర్వ్ చేయబడింది', time: '18నిమి క్రితం', price: '₹95L' },
  { emoji: '📐', text: 'తాడేపల్లిలో CRDA ప్లాట్ కొనుగోలు చేయబడింది', time: '27నిమి క్రితం', price: '₹28L' },
  { emoji: '🌳', text: 'నెల్లూరులో ఫామ్‌హౌస్ హైదరాబాద్ ఇన్వెస్టర్‌కు విక్రయించబడింది', time: '35నిమి క్రితం', price: '₹2.1Cr' },
];

function RecentlySoldTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % SOLD_FEED.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  const item = SOLD_FEED[idx];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      background: 'rgba(16,217,140,0.07)', border: '1px solid rgba(16,217,140,0.2)',
      borderRadius: '40px', padding: '8px 16px', width: 'fit-content', maxWidth: '100%',
      overflow: 'hidden', marginBottom: '1.5rem',
      transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)', opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.98)'
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10d98c', flexShrink: 0, animation: 'pulseDot 1.4s ease-in-out infinite' }} />
      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {item.emoji} {item.text} — <strong style={{ color: '#10d98c' }}>{item.price}</strong>
      </span>
      <span style={{ fontSize: '0.7rem', color: 'var(--txt-muted)', flexShrink: 0, marginLeft: '4px' }}>{item.time}</span>
    </div>
  );
}

const TYPE_TABS = (t) => [
  { label: t('filter.all', 'All Properties'), value: 'all', icon: <Filter size={15} /> },
  { label: t('types.apartments', 'Apartments'), value: 'Apartment', icon: <Building2 size={15} /> },
  { label: t('types.villas', 'Villas'), value: 'Villa', icon: <HomeIcon size={15} /> },
  { label: t('types.plots', 'Plots / Gajalu'), value: 'Plot', icon: <Square size={15} /> },
  { label: t('types.agriculture', 'Agri Land / Acres'), value: 'Agriculture', icon: <Leaf size={15} /> },
];

const SMART_PILLS = (t) => [
  { label: t('pills.all', 'All'), key: 'all' },
  { label: `🔥 ${t('pills.under50l', 'Budget: Under ₹50L')}`, key: 'budget' },
  { label: `✅ ${t('pills.ready', 'Ready to Move')}`, key: 'ready' },
  { label: `🧭 ${t('pills.east', 'East Facing (Vastu)')}`, key: 'east' },
  { label: `🏛️ ${t('pills.crda', 'CRDA Approved')}`, key: 'crda' },
  { label: `✔️ ${t('pills.verified_only', 'Verified by SnapAdda')}`, key: 'verified' },
];

const SORT_OPTIONS = (t) => [
  { label: t('sort.newest', 'Newest First'), value: 'newest' },
  { label: t('sort.price_low', 'Price: Low → High'), value: 'price_asc' },
  { label: t('sort.price_high', 'Price: High → Low'), value: 'price_desc' },
  { label: t('sort.featured', 'Featured First'), value: 'featured' },
];

const INTENT_TABS = (t) => [
  { label: t('intent.buy', 'I want to Buy'), value: 'Buy', icon: <HomeIcon size={24} /> },
  { label: t('intent.rent', 'I want to Rent'), value: 'Rent', icon: <Building2 size={24} /> }
];

const BUDGET_OPTIONS = (t) => [
  { label: t('budget.any', 'Any'), value: '' },
  { label: t('budget.under25', 'Under ₹25L'), value: '2500000' },
  { label: t('budget.25to50', '₹25L–50L'), value: '5000000' },
  { label: t('budget.50to1', '₹50L–1Cr'), value: '10000000' },
  { label: t('budget.1to2', '₹1Cr–2Cr'), value: '20000000' },
  { label: t('budget.over2', '₹2Cr+'), value: '999999999' },
];

const PROPERTY_TYPES = (t) => [
  { label: 'Apartment', value: 'Apartment', icon: <Building2 size={24} /> },
  { label: 'Independent House', value: 'Independent House', icon: <HomeIcon size={24} /> },
  { label: 'Villa / Duplex', value: 'Villa', icon: <HomeIcon size={24} /> },
  { label: 'Residential Plot', value: 'Residential Plot', icon: <Square size={24} /> },
  { label: 'Gated Community Plot', value: 'Gated Community Plot', icon: <Square size={24} /> },
  { label: 'CRDA Approved Plot', value: 'CRDA Approved Plot', icon: <ShieldCheck size={24} /> },
  { label: 'Open Plot', value: 'Open Plot', icon: <Square size={24} /> },
  { label: 'Layout Plot', value: 'Layout Plot', icon: <Square size={24} /> },
  { label: 'Commercial Plot', value: 'Commercial Plot', icon: <Building2 size={24} /> },
  { label: 'Commercial Space', value: 'Commercial Space', icon: <Building2 size={24} /> },
  { label: 'Office Space', value: 'Office Space', icon: <Building2 size={24} /> },
  { label: 'Showroom / Retail', value: 'Showroom', icon: <Building2 size={24} /> },
  { label: 'Agricultural Land', value: 'Agricultural Land', icon: <Leaf size={24} /> },
  { label: 'Farmhouse / Farm Villa', value: 'Farmhouse', icon: <HomeIcon size={24} /> },
  { label: 'Industrial Shed', value: 'Industrial Shed', icon: <Warehouse size={24} /> },
  { label: 'Warehouse', value: 'Warehouse', icon: <Warehouse size={24} /> },
  { label: 'Factory', value: 'Factory', icon: <Factory size={24} /> },
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
  const smx = useSpring(mx, { stiffness: 300, damping: 30 }), smy = useSpring(my, { stiffness: 300, damping: 30 });
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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
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
    
    fetchCities().then(d => { setCities(d); setCitiesLoading(false); }).catch(console.error);
    fetchTestimonials().then(setTestimonials).catch(console.error);
    fetchSetting('appearance').then(d => setAppearance(d || {})).catch(console.error);
    fetchSetting('support_info').then(d => setSupportInfo(d || {})).catch(console.error);
    fetchSetting('hero_content').then(setHeroContent).catch(console.error);
    fetchSetting('site_stats').then(setSiteStats).catch(console.error);
    fetchSetting('seo').then(setSeoData).catch(console.error);
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
      search: smart?.city ? smart.keyword.replace(new RegExp(smart.city, 'gi'), '').trim() : debouncedKeyword,
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
  }, [advFilters, debouncedKeyword, typeFilter, cityFilter, intent, budget]);

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

  const supportPhone = (supportInfo?.phone || '+919346793364').replace(/\s+/g, '');
  const supportWA = supportInfo?.whatsapp || '919346793364';

  // Sectional Data Filters
  // Sectional Data Filters - Robust grouping for regional property types
  const villas = useMemo(() => properties.filter(p => ['Villa', 'Independent House', 'Duplex'].includes(p.type)).slice(0, 8), [properties]);
  const apartments = useMemo(() => properties.filter(p => ['Apartment', 'Apartment / Flat', 'Flat'].includes(p.type)).slice(0, 8), [properties]);
  const plots = useMemo(() => properties.filter(p => ['Plot', 'Residential Plot', 'Commercial Plot', 'Gated Community Plot', 'CRDA Approved Plot', 'Open Plot', 'Layout Plot'].includes(p.type)).slice(0, 8), [properties]);
  const agri = useMemo(() => properties.filter(p => ['Agricultural Land', 'Farmhouse', 'Farm Villa'].includes(p.type)).slice(0, 8), [properties]);

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

            {/* Elite Unified Hero Search Platform (Responsive) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
              className="hero-search-platform glass-heavy"
              style={{ 
                maxWidth: '900px', 
                margin: '2rem auto 3rem', 
                padding: '2rem', 
                borderRadius: '32px',
                background: 'rgba(5, 10, 20, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                boxShadow: '0 30px 100px rgba(0,0,0,0.8)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                textAlign: 'left'
              }}
            >
              {/* 1. Keyword Search */}
              <div className="search-group">
                <label style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '10px', display: 'block' }}>KEYWORDS / LOCATION</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '0 15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Search size={16} style={{ color: 'rgba(255,255,255,0.4)', marginRight: '10px' }} />
                  <input 
                    type="text" 
                    placeholder="Search by project, mandal..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.95rem', width: '100%', padding: '12px 0', outline: 'none' }}
                  />
                </div>
              </div>

              {/* 2. Property Type Cards */}
              <div className="search-group">
                <label style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '10px', display: 'block' }}>PROPERTY TYPE</label>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px', margin: '0 -5px' }} className="hide-scrollbar">
                  {PROPERTY_TYPES(t).map(type => (
                    <button 
                      key={type.value}
                      onClick={() => setTypeFilter(typeFilter === type.value ? 'all' : type.value)}
                      style={{ 
                        flexShrink: 0,
                        padding: '10px 16px',
                        borderRadius: '14px',
                        background: typeFilter === type.value ? 'var(--gold)' : 'rgba(255,255,255,0.03)',
                        border: '1px solid',
                        borderColor: typeFilter === type.value ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                        color: typeFilter === type.value ? 'black' : 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        minWidth: '90px',
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                    >
                      <div style={{ opacity: 0.8 }}>{React.cloneElement(type.icon, { size: 18 })}</div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. City Cards with Photos */}
              <div className="search-group">
                <label style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '12px', display: 'block' }}>CHOOSE CITY</label>
                <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', margin: '0 -5px' }} className="hide-scrollbar">
                  {cities.map(city => (
                    <button 
                      key={city._id}
                      onClick={() => setCityFilter(cityFilter === city.name ? null : city.name)}
                      style={{ 
                        flexShrink: 0,
                        position: 'relative',
                        width: '120px',
                        height: '80px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: cityFilter === city.name ? '3px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      {city.image ? (
                        <img 
                          src={city.image} 
                          alt={city.name} 
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
                        />
                      ) : (
                        <div style={{ position: 'absolute', inset: 0, background: '#222' }} />
                      )}
                      <div style={{ 
                        position: 'absolute', inset: 0, 
                        background: cityFilter === city.name ? 'rgba(212,175,55,0.2)' : 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 2
                      }}>
                        <span style={{ 
                          color: cityFilter === city.name ? 'var(--gold)' : 'white', 
                          fontSize: '0.8rem', 
                          fontWeight: 900,
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}>
                          {city.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Budget Slide & Search */}
              <div className="search-footer-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ width: '100%' }}>
                  <label style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>MAX BUDGET</span>
                    <span style={{ color: 'white', fontWeight: 800 }}>{budget ? `₹${(budget/10000000).toFixed(2)} Cr` : 'Any'}</span>
                  </label>
                  <div style={{ padding: '5px 0' }}>
                    <input 
                      type="range" 
                      min="500000" 
                      max="100000000" 
                      step="500000"
                      value={budget || 100000000}
                      onChange={(e) => setBudget(e.target.value)}
                      style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer', height: '6px', borderRadius: '5px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
                    <span>₹5L</span>
                    <span>₹10Cr+</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (keyword) params.set('keyword', keyword);
                    if (typeFilter !== 'all') params.set('type', typeFilter);
                    if (cityFilter) params.set('city', cityFilter);
                    if (budget && budget < 100000000) params.set('maxPrice', budget);
                    navigate(`/search?${params.toString()}`);
                  }}
                  className="btn-3d-glass"
                  style={{ 
                    background: 'var(--gold)', 
                    color: 'black', 
                    padding: '16px', 
                    borderRadius: '16px', 
                    fontWeight: 900, 
                    fontSize: '1rem',
                    width: '100%',
                    boxShadow: '0 10px 30px rgba(232,184,75,0.3)'
                  }}
                >
                  <Zap size={18} style={{ marginRight: '8px' }} />
                  {t('hero.searchBtn', 'EXPLORE ESTATES')}
                </button>
              </div>

              <style>{`
                .hero-search-platform {
                  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                  margin: 0 auto;
                  max-width: 900px; /* Center it nicely */
                  width: 100%;
                }
                .hero-search-platform:hover {
                  border-color: rgba(212, 175, 55, 0.4);
                  box-shadow: 0 40px 120px rgba(0,0,0,0.9);
                }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                @media (max-width: 600px) {
                  .hero-search-platform {
                    padding: 1.5rem !important;
                    margin: 1.5rem 12px !important;
                    border-radius: 28px !important;
                    gap: 1.75rem !important;
                    background: rgba(8, 12, 25, 0.95) !important;
                  }
                  .search-group label {
                    font-size: 0.65rem !important;
                    opacity: 0.6;
                  }
                  .search-group input {
                    font-size: 1.05rem !important;
                  }
                  .search-footer-mobile {
                    gap: 1.75rem !important;
                  }
                  .search-group .hide-scrollbar {
                    gap: 12px !important;
                    padding-bottom: 15px !important;
                    overflow-x: auto !important;
                    -webkit-overflow-scrolling: touch;
                  }
                  /* Make cards slightly larger for touch */
                  .search-group button {
                    padding: 14px 22px !important;
                    min-width: 110px !important;
                    border-radius: 18px !important;
                  }
                  /* Increase budget slider height for touch */
                  input[type="range"]::-webkit-slider-runnable-track {
                    height: 10px !important;
                  }
                  input[type="range"]::-webkit-slider-thumb {
                    width: 24px !important;
                    height: 24px !important;
                    margin-top: -7px !important;
                  }
                }
              `}</style>
            </motion.div>
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
              {siteStats.length > 0 ? (
                siteStats.map((s, i) => (
                  <div key={i} className="hero-stat-chip">
                    <div className="stat-v">{s.value}</div>
                    <div className="stat-l">{s.label}</div>
                  </div>
                ))
              ) : (
                [
                  { icon: <ShieldCheck size={15} />, val: `${properties.filter(p => p.isVerified).length || 0}+`, label: t('stats.verified') },
                  { icon: <MapPin size={15} />, val: `${cities.length}`, label: t('stats.cities') },
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
                  {sortedProperties.slice(0, 9).map((p, i) => (
                    <motion.div key={`nearby-${p._id}`} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: i * 0.05 }}>
                      <PropertyCard {...p} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section id="properties" style={{ paddingTop: '2rem' }}>
          <HorizontalPropertySection 
            title="ఎలైట్ విల్లాలు (Elite Villas)" 
            eyebrow="Luxury Living" 
            properties={villas} 
            type="Villa"
            loading={loading}
          />
          
          <HorizontalPropertySection 
            title="మోడ్రన్ అపార్ట్‌మెంట్లు (Modern Apartments)" 
            eyebrow="Urban Excellence" 
            properties={apartments} 
            type="Apartment"
            loading={loading}
          />

          <HorizontalPropertySection 
            title="ప్రీమియం ప్లాట్లు (Premium Plots)" 
            eyebrow="Investment Ready" 
            properties={plots} 
            type="Plot"
            loading={loading}
          />

          <HorizontalPropertySection 
            title="వ్యవసాయ భూములు (Agricultural Land)" 
            eyebrow="Natural Assets" 
            properties={agri} 
            type="Agriculture"
            loading={loading}
          />
        </section>

        <div className="container" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <ClientReviews />
        </div>

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
                  <a href={`tel:${supportPhone}`} className="hero-btn hero-btn-primary pulse-primary btn-3d-liquid" style={{ textDecoration: 'none', padding: '1.25rem 3rem', minWidth: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gold)', color: 'var(--midnight)' }}>
                    <Phone size={22} style={{ marginRight: '12px' }} /> CALL SENIOR AGENT
                  </a>
                  <a href={`https://wa.me/${supportWA}?text=Hello, I am interested in property in Andhra.`} className="hero-btn hero-btn-whatsapp pulse-green btn-3d-emerald" style={{ textDecoration: 'none', padding: '1.25rem 3rem', minWidth: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={22} style={{ marginRight: '12px' }} /> {t('cta.whatsapp')}
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
            <div className="footer-legal-links">
              <a href="/terms">Terms of Service</a>
              <a href="/privacy">Privacy Policy</a>
              <a href="/#contact">Contact Us</a>
              <a href="/#about">About SnapAdda</a>
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
          .mobile-sticky-quick-contact {
            display: flex !important;
            bottom: calc(64px + env(safe-area-inset-bottom, 0px)) !important;
          }
        }
      `}</style>

      <FilterSidebar isOpen={filterOpen} onClose={() => setFilterOpen(false)} filters={advFilters} setFilters={setAdvFilters} onApply={() => {
        const params = new URLSearchParams();
        if (keyword) params.set('keyword', keyword);
        if (intent && intent !== 'Any') params.set('purpose', intent);
        if (budget && budget !== '999999999') params.set('maxPrice', budget);
        if (cityFilter) params.set('city', cityFilter);
        if (advFilters.propertyType && advFilters.propertyType !== 'All') params.set('type', advFilters.propertyType);
        if (advFilters.bhk) params.set('bhk', advFilters.bhk);
        if (advFilters.minPrice) params.set('minPrice', advFilters.minPrice);
        if (advFilters.maxPrice) params.set('maxPrice', advFilters.maxPrice);
        if (advFilters.facing && advFilters.facing !== 'Any') params.set('facing', advFilters.facing);
        if (advFilters.approval && advFilters.approval !== 'All') params.set('approval', advFilters.approval);
        if (advFilters.verified) params.set('verified', 'true');
        navigate(`/search?${params.toString()}`);
        setFilterOpen(false);
      }} />
      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} type={modalType} />
    </div>
  );
}
