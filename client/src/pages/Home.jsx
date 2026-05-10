import React, { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Search, SlidersHorizontal, MapPin, Phone, MessageSquare, ShieldCheck, Star,
  Building2, Home as HomeIcon, Square, Leaf, Filter, ChevronDown, X, ArrowRight,
  Zap, Shield, Clock, IndianRupee, Compass, Users, TrendingUp, CheckCircle2, Navigation2, Flame,
  Warehouse, Factory, Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchProperties, fetchCities, fetchTestimonials, fetchSetting, fetchPromotions } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import ContactModal from '../components/ContactModal';
import ClientReviews from '../components/ClientReviews';
import { logUserActivity, ACTIONS } from '../services/activityTracker';
import FilterSidebar from '../components/FilterSidebar';
import OfferSection from '../components/OfferSection';
import Marquee from '../components/Marquee';
import CityMarquee from '../components/CityMarquee';
import Logo from '../components/Logo';
import { SkeletonCityCard, SkeletonPropertyCard } from '../components/SkeletonLoaders';
import { parseSmartSearch, getFuzzySuggestions, loadAndhraData } from '../services/SearchParser';
import { useSEO } from '../utils/useSEO';
import HorizontalPropertySection from '../components/HorizontalPropertySection';
import MobileOnboarding from '../components/MobileOnboarding';
import { useBehaviorTracker } from '../hooks/useBehaviorTracker';
import { getCachedProperties, setCachedProperties } from '../hooks/usePropertyCache';


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
      willChange: 'transform, opacity',
      transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
      opacity: visible ? 1 : 0, 
      transform: visible ? 'scale(1)' : 'scale(0.98)'
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

const WhyMarquee = ({ cards }) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    if (trackRef.current) {
      setTrackWidth(trackRef.current.scrollWidth / 2);
    }
  }, [cards]);

  return (
    <div className="why-marquee-container" style={{ overflow: 'hidden', padding: '2rem 0', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: 'linear-gradient(to right, var(--bg-deep) 0%, transparent 15%, transparent 85%, var(--bg-deep) 100%)' }} />
      <motion.div 
        ref={trackRef}
        className="why-marquee-track"
        animate={{ x: [0, -(trackWidth || 2000)] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', gap: '2rem', width: 'max-content' }}
        onHoverStart={(e) => { e.target.closest('.why-marquee-track').style.animationPlayState = 'paused'; }} // CSS is better for pause but this is JS
      >
        {[...cards, ...cards, ...cards].map((card, i) => (
          <div key={i} className="why-card glass-premium"
            style={{ width: '380px', padding: '2.5rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,12,20,0.4)', borderTop: `2px solid ${card.color}`, flexShrink: 0 }}>
            <div style={{ color: card.color, marginBottom: '1.5rem', transform: 'scale(1.2)', transformOrigin: 'left' }}>{card.icon}</div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: 'white' }}>{card.title}</h3>
            <p style={{ color: 'var(--txt-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>{card.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const typedWord = useTypewriter(['Apartments', 'Villas', 'Farmland', 'Premium Plots', 'CRDA Homes']);
  const searchRef = useRef(null);
  const { getTopPreferences } = useBehaviorTracker();

  // Hero animations (Simplified for performance)
  const mx = useMotionValue(0), my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 100, damping: 20 }), smy = useSpring(my, { stiffness: 100, damping: 20 });
  const rotateX = useTransform(smy, [-0.5, 0.5], ['2deg', '-2deg']);
  const rotateY = useTransform(smx, [-0.5, 0.5], ['-2deg', '2deg']);

  // State
  const [properties, setProperties] = useState(getCachedProperties() || []);
  const [loading, setLoading] = useState(!getCachedProperties());
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
  const [apiError, setApiError] = useState(false);  
  const [promotions, setPromotions] = useState([]);
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
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
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
    fetchPromotions('segment=hero').then(d => {
      setPromotions(d?.data || (Array.isArray(d) ? d : []));
    }).catch(console.error);

    return () => window.removeEventListener('resize', handleResize);
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

  const loadProperties = useCallback((isInitial = false) => {
    if (isInitial) setLoading(true);
    setApiError(false);
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
      .then(res => { 
        setApiError(false); 
        let data = [...(res?.data || (Array.isArray(res) ? res : []))];
        
        const prefs = getTopPreferences();
        if (prefs && prefs.preferredType) {
          data.sort((a, b) => {
            const aScore = (a.type === prefs.preferredType ? 10 : 0) + (a.location?.includes(prefs.preferredLocation) ? 5 : 0);
            const bScore = (b.type === prefs.preferredType ? 10 : 0) + (b.location?.includes(prefs.preferredLocation) ? 5 : 0);
            return bScore - aScore;
          });
        }

        // --- CRITICAL: Instant first render, background transitions for updates ---
        if (isInitial) {
          setProperties(data);
          setLoading(false);
        } else {
          startTransition(() => {
            setProperties(data); 
          });
        }

        if (data.length > 0) {
          setCachedProperties(data);
        }
      })
      .catch(() => setApiError(true))
      .finally(() => { if (isInitial) setLoading(false); });
  }, [advFilters, debouncedKeyword, typeFilter, cityFilter, intent, budget]);

  useEffect(() => { 
    const isFirst = properties.length === 0;
    loadProperties(isFirst); 
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

  const optimizedBg = useMemo(() => {
    const url = appearance?.bgUrl;
    if (!url || !url.includes('cloudinary')) return url;
    return url.replace('/upload/', '/upload/q_auto,f_auto,w_1920/');
  }, [appearance?.bgUrl]);

  // Sectional Data Filters - Robust grouping for regional property types
  const villas = useMemo(() => properties.filter(p => {
    const t = (p.type || '').toLowerCase();
    return t.includes('villa') || t.includes('duplex') || t.includes('independent house') || t.includes('house');
  }).slice(0, 8), [properties]);

  const apartments = useMemo(() => properties.filter(p => {
    const t = (p.type || '').toLowerCase();
    return t.includes('apartment') || t.includes('flat') || t.includes('bhk');
  }).slice(0, 8), [properties]);

  const plots = useMemo(() => properties.filter(p => {
    const t = (p.type || '').toLowerCase();
    return t.includes('plot') || t.includes('layout') || t.includes('gajalu') || t.includes('crda');
  }).slice(0, 8), [properties]);

  const agri = useMemo(() => properties.filter(p => {
    const t = (p.type || '').toLowerCase();
    return t.includes('agricultural') || t.includes('farm') || t.includes('acre') || t.includes('land');
  }).slice(0, 8), [properties]);

  const commercial = useMemo(() => properties.filter(p => {
    const t = (p.type || '').toLowerCase();
    return t.includes('commercial') || t.includes('office') || t.includes('showroom') || t.includes('industrial') || t.includes('warehouse') || t.includes('factory');
  }).slice(0, 8), [properties]);

  const latestListings = useMemo(() => {
    return [...properties].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
  }, [properties]);

  const recommended = useMemo(() => {
    // Exclude ones already shown in top sections to avoid duplicates
    const shownIds = new Set([
      ...latestListings.map(p => p._id),
      ...villas.map(p => p._id),
      ...apartments.map(p => p._id),
      ...plots.map(p => p._id),
      ...agri.map(p => p._id),
      ...commercial.map(p => p._id)
    ]);
    return properties.filter(p => !shownIds.has(p._id)).slice(0, 12);
  }, [properties, latestListings, villas, apartments, plots, agri, commercial]);

  return (
    <>
      <MobileOnboarding onLocationDetected={(city) => { setKeyword(city); setDebouncedKeyword(city); }} />
      <div 
        className="app-container"
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-deep)', '--brand-primary': appearance?.primaryColor || '#e8b84b', '--brand-glow': (appearance?.primaryColor || '#e8b84b') + '44' }}
      >

      {optimizedBg
        ? <div className="site-bg-overlay floating-bg" style={{ backgroundImage: `url(${optimizedBg})`, opacity: 0.22, position: 'fixed', inset: 0, backgroundSize: 'cover', zIndex: 0 }} />
        : <div className="animated-bg floating-bg" style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(10,80,40,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(130,60,0,0.08) 0%, transparent 60%), var(--bg-deep)' }} />
      }

      <main style={{ flex: 1, paddingTop: 'var(--nav-h)' }}>
        <Marquee />

        <section className="promo-section-top" style={{ padding: isMobile ? '1.5rem 0 0.5rem' : '1rem 0' }}>
          <div className="container">
            <div className="section-head" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Exclusive Deals</div>
              <h2 className="section-title" style={{ fontSize: '1.5rem', color: 'white' }}>Institutional Offers</h2>
            </div>
          </div>
          <OfferSection />
        </section>

        {/* Hero Section */}
        <section 
          className="hero-section" 
          style={{ 
            padding: isMobile ? '60px 0 30px' : '90px 0 50px', 
            position: 'relative', 
            overflow: 'hidden',
            minHeight: isMobile ? 'auto' : '85vh',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <div className="container" style={{ position: 'relative', zIndex: 10, height: '100%' }}>
            <RecentlySoldTicker />
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

            {/* Compact Search Platform */}
            <motion.div 
              className="search-platform-card glass-premium" 
              style={{ 
                padding: isMobile ? '1.25rem' : '1.75rem', 
                borderRadius: '24px', 
                border: '1px solid rgba(255,255,255,0.15)', 
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                maxWidth: '900px',
                margin: '2rem auto'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr 1fr', gap: isMobile ? '0.75rem' : '1.25rem', marginBottom: '1.25rem' }}>
                <div className="search-group">
                  <label style={{ color: 'var(--gold)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '8px', display: 'block' }}>LOCATION / PROJECT</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Search size={14} style={{ color: 'rgba(255,255,255,0.4)', marginRight: '8px' }} />
                    <input 
                      type="text" 
                      placeholder="Search mandal, area..."
                      value={keyword}
                      aria-label="Location or project search"
                      onChange={(e) => setKeyword(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.85rem', width: '100%', padding: '10px 0', outline: 'none' }}
                    />
                  </div>
                </div>

                <div className="search-group">
                  <label style={{ color: 'var(--gold)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '8px', display: 'block' }}>PROPERTY TYPE</label>
                  <select 
                    value={typeFilter}
                    aria-label="Filter by property type"
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px', color: 'white', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="all" style={{ background: '#050a14' }}>All Types</option>
                    {PROPERTY_TYPES(t).map(type => (
                      <option key={type.value} value={type.value} style={{ background: '#050a14' }}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="search-group">
                  <label style={{ color: 'var(--gold)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '8px', display: 'block' }}>CITY</label>
                  <select 
                    value={cityFilter || ''}
                    aria-label="Filter by city"
                    onChange={(e) => setCityFilter(e.target.value || null)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px', color: 'white', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="" style={{ background: '#050a14' }}>Any City</option>
                    {cities.map(city => (
                      <option key={city._id} value={city.name} style={{ background: '#050a14' }}>{city.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budget Slide & Search */}
              <div className="search-footer-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.05em' }}>MAX BUDGET</label>
                    <span style={{ color: 'white', fontWeight: 800, fontSize: '0.85rem' }}>{budget ? `₹${(budget/10000000).toFixed(2)} Cr` : 'Any'}</span>
                  </div>
                  <div style={{ padding: '2px 0' }}>
                    <input 
                      type="range" 
                      min="500000" 
                      max="100000000" 
                      step="500000"
                      value={budget || 100000000}
                      aria-label="Budget slider"
                      onChange={(e) => setBudget(e.target.value)}
                      style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer', height: '4px' }}
                    />
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
                  aria-label="Search properties"
                  style={{ 
                    background: 'var(--gold)', 
                    color: 'black', 
                    padding: '12px', 
                    borderRadius: '12px', 
                    fontWeight: 900, 
                    fontSize: '0.95rem',
                    width: '100%',
                    boxShadow: '0 8px 25px rgba(232,184,75,0.3)',
                    marginTop: '8px'
                  }}
                  whileTap={{ scale: 0.96 }}
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

        {/* ── Latest Listings & Categories (Moved Up for Elite Visibility) ── */}
        <section id="properties" style={{ paddingTop: '2.5rem', background: 'rgba(212,175,55,0.02)' }}>
          <HorizontalPropertySection 
            title="తాజా ప్రాపర్టీలు (Latest Listings)" 
            eyebrow="New on Market" 
            properties={latestListings} 
            type="All"
            loading={loading}
          />

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

          <HorizontalPropertySection 
            title="కమర్షియల్ & ఇండస్ట్రియల్ (Commercial & Industrial)" 
            eyebrow="Business Assets" 
            properties={commercial} 
            type="Commercial"
            loading={loading}
          />
        </section>

        <section style={{ padding: '4rem 0', background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
          <div className="container">
            <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>{t('why.title', 'Why Choose SnapAdda?')}</h2>
            <p style={{ textAlign: 'center', color: 'var(--txt-secondary)', marginBottom: '3rem' }}>Institutional Excellence in Every Transaction</p>
          </div>
          <WhyMarquee cards={WHY_CARDS(t)} />
        </section>        {/* ── High-Productivity Operations Hub (Bento) ── */}
        <section className="section-wrap" style={{ padding: '0.5rem 0 1.5rem' }}>
          <div className="container">
            <div className="bento-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '1rem',
              gridAutoRows: 'minmax(140px, auto)'
            }}>
              {/* Primary Action: Post */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => navigate('/post-property')}
                className="glass-elite bento-item" 
                style={{ 
                  gridColumn: 'span 2', 
                  background: 'linear-gradient(135deg, rgba(16,217,140,0.15) 0%, rgba(5,10,20,0.8) 100%)',
                  border: '1px solid rgba(16,217,140,0.2)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem',
                  cursor: 'pointer', position: 'relative', overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }}>
                  <Plus size={120} color="var(--emerald)" />
                </div>
                <div style={{ color: 'var(--emerald)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', marginBottom: '8px' }}>✦ MARKET READY</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', margin: 0 }}>Post Property</h3>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>Get verified leads instantly</p>
              </motion.div>

              {/* Expert Support */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => window.open('https://wa.me/911234567890', '_blank')}
                className="glass-elite bento-item" 
                style={{ 
                  background: 'linear-gradient(135deg, rgba(245,200,66,0.1) 0%, rgba(5,10,20,0.8) 100%)',
                  border: '1px solid rgba(245,200,66,0.15)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
                  padding: '1.25rem', cursor: 'pointer'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245,200,66,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', marginBottom: '10px' }}>
                  <Zap size={20} fill="var(--gold)" />
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'white' }}>Expert Help</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--gold)', fontWeight: 800, marginTop: '2px' }}>LIVE ASSIST</div>
              </motion.div>

              {/* Verify Asset */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => navigate('/services/verification')}
                className="glass-elite bento-item" 
                style={{ 
                  background: 'linear-gradient(135deg, rgba(34,217,224,0.1) 0%, rgba(5,10,20,0.8) 100%)',
                  border: '1px solid rgba(34,217,224,0.15)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
                  padding: '1.25rem', cursor: 'pointer'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(34,217,224,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)', marginBottom: '10px' }}>
                  <ShieldCheck size={20} />
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'white' }}>Verify Asset</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--cyan)', fontWeight: 800, marginTop: '2px' }}>TRUST FIRST</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Offers & Promotions (Revamped) ── */}
        <section className="section-wrap" style={{ padding: '0.5rem 0' }}>
          <div className="container">
            <div className="section-head" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Limited Deals</div>
              <h2 className="section-title" style={{ fontSize: '1.5rem', color: 'white' }}>Exclusive Opportunities</h2>
            </div>
          </div>
          <OfferSection />
        </section>
        <section id="cities" className="section-wrap" style={{ padding: '1.5rem 0' }}>
          <div className="container">
            <div className="section-head" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div className="section-eyebrow" style={{ justifyContent: 'center' }}>{t('cities.eyebrow')}</div>
              <h2 className="section-title" style={{ color: '#ffffff' }}>{t('cities.title')}</h2>
            </div>
          </div>
          <CityMarquee cities={cities} loading={citiesLoading} />
        </section>

        <div className="container" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <ClientReviews testimonials={testimonials} />
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

        {/* Sell Property CTA */}
        <section className="section-wrap animate-on-scroll" style={{ background: 'linear-gradient(180deg, transparent, rgba(16,217,140,0.02))', padding: '1.5rem 0' }}>
          <div className="container">
            <motion.div 
              className="glass-elite" 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{ height: 'auto', padding: '2.5rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(5,10,20,0.8) 0%, rgba(16,217,140,0.03) 100%)', border: '1px solid rgba(16,217,140,0.15)', borderRadius: '32px' }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--emerald)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                <Zap size={14} fill="var(--emerald)" /> Direct Posting
              </div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', marginBottom: '0.75rem', color: 'white', fontWeight: 900 }}>మీ ప్రాపర్టీని అమ్మాలనుకుంటున్నారా?</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--txt-secondary)', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                వేలాది మంది కొనుగోలుదారులకు మీ ప్రాపర్టీని నేరుగా చూపండి.
              </p>
              <button 
                onClick={() => navigate('/post-property')}
                className="hero-btn hero-btn-primary btn-3d-liquid" 
                style={{ padding: '1rem 3rem', fontSize: '1rem', background: '#10d98c', color: 'black' }}
              >
                POST PROPERTY <Plus size={18} style={{ marginLeft: '8px' }} />
              </button>
            </motion.div>
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
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/#contact">Contact Us</Link>
              <Link to="/#about">About SnapAdda</Link>
            </div>
            <div className="footer-bottom"><span>© 2026 SnapAdda. {t('footer.rights')}</span></div>
          </div>
        </footer>
      </main>

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
  </>
  );
}
