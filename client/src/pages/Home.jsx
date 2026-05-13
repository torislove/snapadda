import React, { useState, useEffect, useRef, useCallback, useMemo, startTransition, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Search, SlidersHorizontal, MapPin, Phone, MessageSquare, ShieldCheck, Star,
  Building, Home as HomeIcon, Square, Leaf, Filter, ChevronDown, X, ArrowRight,
  Zap, Shield, Clock, IndianRupee, Compass, Users, TrendingUp, CheckCircle2, Navigation2, Flame,
  Warehouse, Factory, Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchProperties, fetchCities, fetchTestimonials, fetchSetting, fetchPromotions } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import LocationAutocomplete from '../components/LocationAutocomplete';
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
import { useRealtimeProperties } from '../hooks/useRealtimeProperties';
import { prefetchRoute } from '../utils/PerformanceUtilities';
import { triggerMicroLead } from '../utils/tracker';
import { Helmet } from 'react-helmet-async';
import PropertyMap from '../components/PropertyMap';

// Lazy Loaded Regional Sitemap for SEO
const RegionalSitemap = lazy(() => import('../components/RegionalSitemap'));


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
  { label: t('types.apartments', 'Apartments'), value: 'Apartment', icon: <Building size={15} /> },
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
  { label: t('intent.rent', 'I want to Rent'), value: 'Rent', icon: <Building size={24} /> }
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
  { label: 'Apartment', value: 'Apartment', icon: <Building size={24} /> },
  { label: 'Independent House', value: 'Independent House', icon: <HomeIcon size={24} /> },
  { label: 'Villa', value: 'Villa', icon: <HomeIcon size={24} /> },
  { label: 'Gated Community Plot', value: 'Gated Community Plot', icon: <Square size={24} /> },
  { label: 'Residential Plot', value: 'Residential Plot', icon: <Square size={24} /> },
  { label: 'CRDA Approved Plot', value: 'CRDA Approved Plot', icon: <ShieldCheck size={24} /> },
  { label: 'Open Plot', value: 'Open Plot', icon: <Square size={24} /> },
  { label: 'Layout Plot', value: 'Layout Plot', icon: <Square size={24} /> },
  { label: 'Commercial Plot', value: 'Commercial Plot', icon: <Building size={24} /> },
  { label: 'Commercial Space', value: 'Commercial Space', icon: <Building size={24} /> },
  { label: 'Office Space', value: 'Office Space', icon: <Building size={24} /> },
  { label: 'Showroom', value: 'Showroom', icon: <Building size={24} /> },
  { label: 'Agricultural Land', value: 'Agricultural Land', icon: <Leaf size={24} /> },
  { label: 'Farmhouse', value: 'Farmhouse', icon: <HomeIcon size={24} /> },
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
    <div className="why-marquee-container" style={{ overflow: 'hidden', padding: '1rem 0', position: 'relative' }}>
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
            style={{ width: '280px', padding: '1.5rem', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,12,20,0.4)', borderTop: `2px solid ${card.color}`, flexShrink: 0 }}>
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
  const [heroMode, setHeroMode] = useState('selection'); // 'selection' or 'search'

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [apiError, setApiError] = useState(false);  
  const [promotions, setPromotions] = useState([]);
  // Dynamic Settings
  const [heroContent, setHeroContent] = useState(null);
  const [designTokens, setDesignTokens] = useState(null);
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [siteStats, setSiteStats] = useState([]);

  const [seoData, setSeoData] = useState(null);
  const [siteControl, setSiteControl] = useState({ postPropertyEnabled: true, expertHelpEnabled: true, verifyAssistEnabled: true });

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
  const [isSearchSticky, setIsSearchSticky] = useState(false);

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
    const handleScroll = () => {
      setIsSearchSticky(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
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
    
    // Parallelize settings fetch for faster FCP
    Promise.all([
      fetchCities().then(d => { setCities(d); setCitiesLoading(false); }),
      fetchTestimonials().then(setTestimonials),
      fetchSetting('appearance').then(d => setAppearance(d || {})),
      fetchSetting('support_info').then(d => setSupportInfo(d || {})),
      fetchSetting('hero_content').then(setHeroContent),
      fetchSetting('site_stats').then(setSiteStats),
      fetchSetting('seo').then(setSeoData),
      fetchSetting('design_tokens').then(setDesignTokens),
      fetchSetting('site_control').then(d => setSiteControl(d || { postPropertyEnabled: true, expertHelpEnabled: true, verifyAssistEnabled: true })),
      fetchPromotions('segment=hero').then(d => {
        setPromotions(d?.data || (Array.isArray(d) ? d : []));
      })
    ]).catch(err => {
      console.error('Error fetching settings:', err);
    });

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

  const { data: liveList } = useRealtimeProperties();

  useEffect(() => {
    if (liveList && liveList.length > 0) {
      setProperties(prev => {
        const prevMap = new Map((prev || []).map(p => [p._id || p.id, p]));
        let hasChanges = false;
        
        liveList.forEach(lp => {
          const id = lp._id || lp.id;
          if (!id) return; // skip entries with no valid ID
          const existing = prevMap.get(id);
          // Only update if data is different or new
          if (!existing || JSON.stringify(existing) !== JSON.stringify(lp)) {
            prevMap.set(id, { ...(existing || {}), ...lp });
            hasChanges = true;
          }
        });
        
        if (!hasChanges) return prev;
        
        // Deduplicate and sort — Map already guarantees unique _id keys
        return Array.from(prevMap.values()).sort((a, b) => 
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
      });
    }
  }, [liveList]);

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
        const raw = [...(res?.data || (Array.isArray(res) ? res : []))];
        // Deduplicate by _id to prevent duplicate React key warnings
        const seenIds = new Map();
        raw.forEach(p => { const id = p._id || p.id; if (id) seenIds.set(id, p); });
        let data = Array.from(seenIds.values());
        
        // --- ADVANCED PROXIMITY DISCOVERY ENGINE ---
        // Hierarchy: 1. Exact City Match, 2. Same District Match, 3. Preference Match, 4. Global Fallback
        const prefs = getTopPreferences();
        const smart = parseSmartSearch(debouncedKeyword);
        const searchCity = smart?.city || cityFilter;
        
        data.sort((a, b) => {
          let aScore = 0;
          let bScore = 0;

          // 1. Precise Geolocation Match (Highest Priority)
          if (userCoords && a.coordinates && b.coordinates) {
            const getDist = (c1, c2) => Math.sqrt(Math.pow(c1.lat - c2.lat, 2) + Math.pow(c1.lng - c2.lng, 2));
            const distA = getDist(userCoords, a.coordinates);
            const distB = getDist(userCoords, b.coordinates);
            if (distA < distB) aScore += 150;
            else if (distB < distA) bScore += 150;
          }

          // 2. City Relevance
          if (searchCity) {
            if (a.location?.toLowerCase().includes(searchCity.toLowerCase())) aScore += 100;
            if (b.location?.toLowerCase().includes(searchCity.toLowerCase())) bScore += 100;
          }

          // 3. District Relevance
          const searchDist = smart?.detectedLocation?.district;
          if (searchDist) {
            if (a.district?.toLowerCase() === searchDist.toLowerCase()) aScore += 50;
            if (b.district?.toLowerCase() === searchDist.toLowerCase()) bScore += 50;
          }

          // 4. User Behavioral Preferences
          if (prefs) {
            if (a.type === prefs.preferredType) aScore += 20;
            if (b.type === prefs.preferredType) bScore += 20;
            if (a.location?.includes(prefs.preferredLocation)) aScore += 10;
            if (b.location?.includes(prefs.preferredLocation)) bScore += 10;
          }

          // 5. Featured Status
          if (a.isFeatured) aScore += 5;
          if (b.isFeatured) bScore += 5;

          return bScore - aScore;
        });

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
      <Helmet>
        <title>SnapAdda | Best Real Estate Website in Andhra Pradesh | Amaravathi Plots</title>
        <meta name="description" content="SnapAdda is the #1 real estate platform in Andhra Pradesh. Buy or Rent verified apartments, villas, and plots in Vijayawada, Guntur, and Vizag. Trusted by thousands." />
        <meta property="og:title" content="SnapAdda | Best Real Estate in Andhra Pradesh" />
        <meta property="og:description" content="Discover verified properties and institutional grade listings across all AP districts." />
        <meta property="og:image" content="https://snapadda.com/og-image.jpg" />
        <link rel="canonical" href="https://snapadda.com/" />
      </Helmet>
      <AnimatePresence>
        {isSearchSticky && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            style={{ 
              position: 'fixed', top: '15px', left: '50%', transform: 'translateX(-50%)',
              width: '90%', maxWidth: '600px', zIndex: 9999,
              background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(30px)',
              border: '1px solid rgba(232,184,75,0.3)', borderRadius: '40px',
              padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
            }}
          >
            <Search size={18} color="var(--gold)" />
            <input 
              type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search mandal, city, project..."
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '0.9rem', outline: 'none' }}
            />
            <button 
              id="btn-home-sticky-search"
              onClick={() => navigate(`/search?keyword=${keyword}`)}
              style={{ background: 'var(--gold)', color: 'black', border: 'none', padding: '6px 16px', borderRadius: '20px', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer' }}
            >
              GO
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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

        <section className="promo-section-top" style={{ padding: isMobile ? '1rem 0 0.5rem' : '0.5rem 0' }}>
          <div className="container">
            <div className="section-head" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Exclusive Deals</div>
              <h2 className="section-title" style={{ fontSize: '1.5rem', color: 'white' }}>Institutional Offers</h2>
            </div>
          </div>
          <OfferSection designTokens={designTokens?.adCard} />
        </section>

        {/* Hero Section */}
        <section 
          className="hero-section" 
          style={{ 
            padding: isMobile ? '24px 0 12px' : '40px 0 24px', 
            position: 'relative', 
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <div className="container" style={{ position: 'relative', zIndex: 10, height: '100%' }}>
            <RecentlySoldTicker />
            
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hero-eyebrow" style={{ margin: '0 auto 1.25rem', background: 'rgba(232,184,75,0.1)', color: 'var(--gold)', border: '1px solid rgba(232,184,75,0.2)' }}>
                <ShieldCheck size={12} /> ANDHRA'S #1 TRUSTED NETWORK
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="hero-title" style={{ fontSize: isMobile ? '2.2rem' : '4.5rem', lineHeight: 1.05, marginBottom: '1.25rem', fontWeight: 950 }}
              >
                {heroMode === 'selection' ? "ఆంధ్రా రియల్ ఎస్టేట్ గమ్యం" : "Find Your Perfect Asset"}
                <span className="gold-line text-royal-gold" style={{ display: 'block', fontSize: isMobile ? '1.8rem' : '3.5rem', opacity: 0.9 }}>
                  {heroMode === 'selection' ? "SnapAdda Elite Platform" : `Verified ${intent} Listings`}
                </span>
              </motion.h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: isMobile ? '0.95rem' : '1.15rem', maxWidth: '700px', margin: '0 auto', lineHeight: 1.7, fontWeight: 500 }}>
                {heroMode === 'selection' 
                  ? "Discover premium properties across Vijayawada, Vizag, Guntur & more. Institutional grade verification for every listing."
                  : "Use our advanced spatial filters to locate verified properties near you."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {heroMode === 'selection' ? (
                <motion.div 
                  key="selection"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: isMobile ? '1rem' : '2rem', 
                    maxWidth: '800px',
                    margin: '0 auto 2.5rem'
                  }}>
                    {/* BUY CTA */}
                    <motion.div 
                      whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(16,217,140,0.15)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setIntent('Buy'); setHeroMode('search');  }}
                      className="glass-premium"
                      style={{ padding: isMobile ? '2rem 1.5rem' : '3.5rem 2rem', borderRadius: '32px', border: '1px solid rgba(16,217,140,0.2)', background: 'rgba(16,217,140,0.03)', cursor: 'pointer', textAlign: 'center' }}
                    >
                      <div style={{ width: '64px', height: '64px', borderRadius: '22px', background: 'rgba(16,217,140,0.1)', color: '#10d98c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 20px rgba(16,217,140,0.1)' }}>
                        <HomeIcon size={32} />
                      </div>
                      <h3 style={{ fontSize: '1.6rem', fontWeight: 950, marginBottom: '0.5rem', color: '#fff', letterSpacing: '0.05em' }}>BUY</h3>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>VERIFIED ASSETS</p>
                    </motion.div>

                    {/* RENT CTA */}
                    <motion.div 
                      whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(155,89,245,0.15)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setIntent('Rent'); setHeroMode('search');  }}
                      className="glass-premium"
                      style={{ padding: isMobile ? '2rem 1.5rem' : '3.5rem 2rem', borderRadius: '32px', border: '1px solid rgba(155,89,245,0.2)', background: 'rgba(155,89,245,0.03)', cursor: 'pointer', textAlign: 'center' }}
                    >
                      <div style={{ width: '64px', height: '64px', borderRadius: '22px', background: 'rgba(155,89,245,0.1)', color: '#9b59f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 20px rgba(155,89,245,0.1)' }}>
                        <Building size={32} />
                      </div>
                      <h3 style={{ fontSize: '1.6rem', fontWeight: 950, marginBottom: '0.5rem', color: '#fff', letterSpacing: '0.05em' }}>RENT</h3>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>LUXURY SPACES</p>
                    </motion.div>
                  </div>

                  {/* Centered SELL Button */}
                  <div style={{ textAlign: 'center' }}>
                    <motion.button
                      whileHover={{ scale: 1.05, background: 'rgba(232,184,75,0.15)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/post-property')}
                      className="glass-premium"
                      style={{ 
                        padding: '1.2rem 3rem', borderRadius: '24px', border: '1px solid var(--gold)', 
                        background: 'rgba(232,184,75,0.05)', cursor: 'pointer', color: 'var(--gold)',
                        fontSize: '1rem', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: '12px',
                        letterSpacing: '0.1em'
                      }}
                    >
                      <Plus size={20} /> SELL / POST PROPERTY
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="search"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="glass-premium" style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(5,5,15,0.85)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', paddingLeft: '8px' }}>
                      <button 
                        onClick={() => setHeroMode('selection')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '8px 12px', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> BACK
                      </button>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Searching for {intent} in Andhra Pradesh</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                      <div className="field-group">
                        <label className="elite-lbl" style={{ color: 'var(--gold)', fontSize: '0.6rem', fontWeight: 900, marginBottom: '10px', display: 'block', letterSpacing: '0.15em' }}>WHERE IN ANDHRA?</label>
                        <LocationAutocomplete 
                          value={keyword} 
                          onChange={(val) => setKeyword(val)}
                          onSelect={(loc) => { setKeyword(loc.name); setCityFilter(loc.name);  }}
                          placeholder="Area, Mandal, or City..."
                        />
                      </div>

                      <div className="field-group">
                        <label className="elite-lbl" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', fontWeight: 900, marginBottom: '10px', display: 'block' }}>TYPE</label>
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: 'white', outline: 'none' }}>
                          <option value="all">All Types</option>
                          {PROPERTY_TYPES(t).map(tp => <option key={tp.value} value={tp.value} style={{ background: '#0a0f1e' }}>{tp.label}</option>)}
                        </select>
                      </div>

                      <div className="field-group">
                        <label className="elite-lbl" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', fontWeight: 900, marginBottom: '10px', display: 'block' }}>BUDGET</label>
                        <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: 'white', outline: 'none' }}>
                          <option value="all">Any Budget</option>
                          <option value="0-500000">Below 5L</option>
                          <option value="500000-2500000">5L - 25L</option>
                          <option value="2500000-5000000">25L - 50L</option>
                          <option value="5000000-10000000">50L - 1Cr</option>
                          <option value="10000000-50000000">1Cr - 5Cr</option>
                          <option value="50000000-500000000">Above 5Cr</option>
                        </select>
                      </div>

                      <motion.button 
                        onClick={() => {
                          const p = new URLSearchParams();
                          if (keyword) p.set('keyword', keyword);
                          if (typeFilter !== 'all') p.set('type', typeFilter);
                          if (intent) p.set('intent', intent);
                          if (budgetFilter !== 'all') p.set('budget', budgetFilter);
                          navigate(`/search?${p.toString()}`);
                        }}
                        whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--brand-glow)' }}
                        whileTap={{ scale: 0.95 }}
                        style={{ height: '52px', width: '52px', borderRadius: '16px', background: 'var(--gold)', color: 'black', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Search size={22} strokeWidth={2.5} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div className="hero-stats-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ marginTop: '3rem' }}>
              {[
                { icon: <ShieldCheck size={15} />, val: 'Verified', label: '100% Secure' },
                { icon: <Navigation2 size={15} />, val: 'Smart', label: 'Spatial Search' },
                { icon: <Zap size={15} />, val: 'Instant', label: 'Connectivity' },
              ].map((s, i) => (
                <div key={i} className="hero-stat-chip" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: 'var(--gold)' }}>{s.icon}</div>
                  <div className="stat-v" style={{ fontSize: '0.8rem' }}>{s.val}</div>
                  <div className="stat-l" style={{ fontSize: '0.6rem' }}>{s.label}</div>
                </div>
              ))}
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
            designTokens={designTokens?.propertyCard}
          />

          <HorizontalPropertySection 
            title="ఎలైట్ విల్లాలు (Elite Villas)" 
            eyebrow="Luxury Living" 
            properties={villas} 
            type="Villa"
            loading={loading}
            designTokens={designTokens?.propertyCard}
          />
          
          <HorizontalPropertySection 
            title="మోడ్రన్ అపార్ట్‌మెంట్లు (Modern Apartments)" 
            eyebrow="Urban Excellence" 
            properties={apartments} 
            type="Apartment"
            loading={loading}
            designTokens={designTokens?.propertyCard}
          />

          <HorizontalPropertySection 
            title="ప్రీమియం ప్లాట్లు (Premium Plots)" 
            eyebrow="Investment Ready" 
            properties={plots} 
            type="Plot"
            loading={loading}
            designTokens={designTokens?.propertyCard}
          />

          <HorizontalPropertySection 
            title="వ్యవసాయ భూములు (Agricultural Land)" 
            eyebrow="Natural Assets" 
            properties={agri} 
            type="Agriculture"
            loading={loading}
            designTokens={designTokens?.propertyCard}
          />

          <HorizontalPropertySection 
            title="కమర్షియల్ & ఇండస్ట్రియల్ (Commercial & Industrial)" 
            eyebrow="Business Assets" 
            properties={commercial} 
            type="Commercial"
            loading={loading}
            designTokens={designTokens?.propertyCard}
          />
        </section>

        {/* ── Services Bento Grid ── */}
        <section className="section-wrap" style={{ padding: '1rem 0 3rem' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              {siteControl.postPropertyEnabled && (
                <motion.div 
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={() => {
                    triggerMicroLead({ source: 'Post Property Bento', message: 'User clicked Post Property bento item' });
                    navigate('/post-property');
                  }}
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
              )}

              {siteControl.expertHelpEnabled && (
                <motion.div 
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={() => {
                    triggerMicroLead({ source: 'Expert Help Intent', message: 'User clicked Expert Help WhatsApp link' });
                    window.open(`https://wa.me/${supportWA}`, '_blank');
                  }}
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
              )}

              {siteControl.verifyAssistEnabled && (
                <motion.div 
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={() => {
                    triggerMicroLead({ source: 'Verify Asset Intent', message: 'User clicked Verify Asset service' });
                    navigate('/services/verification');
                  }}
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
              )}
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
          <OfferSection designTokens={designTokens?.adCard} />
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
                <motion.div key={s.label} className="stat-card" whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value">{s.val}</div>
                  <div className="stat-label">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Sell Property CTA */}
        {siteControl.postPropertyEnabled && (
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
                  onClick={() => {
                    triggerMicroLead({ source: 'Post Property CTA', message: 'User clicked Sell Property CTA button' });
                    navigate('/post-property');
                  }}
                  className="hero-btn hero-btn-primary btn-3d-liquid" 
                  style={{ padding: '1rem 3rem', fontSize: '1rem', background: '#10d98c', color: 'black' }}
                >
                  POST PROPERTY <Plus size={18} style={{ marginLeft: '8px' }} />
                </button>
              </motion.div>
            </div>
          </section>
        )}

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

        {/* Regional Market Hotspots (Interactive Map) */}
        <section id="hotspots" className="map-discovery-section" style={{ padding: '5rem 0', background: 'rgba(0,0,0,0.25)', position: 'relative', minHeight: '600px' }}>
          <div className="container">
            <div className="section-head" style={{ marginBottom: '3rem', textAlign: isMobile ? 'center' : 'left' }}>
              <div className="section-eyebrow" style={{ justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <Navigation2 size={14} style={{ marginRight: '6px' }} /> Visual Discovery
              </div>
              <h2 className="section-title" style={{ color: 'white', fontSize: isMobile ? '2rem' : '2.8rem' }}>Explore Market Hotspots</h2>
              <p className="section-subtitle" style={{ maxWidth: '700px', margin: isMobile ? '0 auto' : '0' }}>
                Browse premium listings across Andhra Pradesh using our interactive spatial search. 
                Discover price trends and high-demand zones instantly.
              </p>
            </div>
            
            <div style={{ 
              height: isMobile ? '400px' : '550px', 
              width: '100%', 
              borderRadius: '32px', 
              overflow: 'hidden', 
              border: '1px solid rgba(232,184,75,0.25)', 
              boxShadow: '0 30px 70px rgba(0,0,0,0.6)',
              background: 'rgba(10,15,30,0.4)',
              position: 'relative'
            }}>
              {loading && !properties.length ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', background: 'rgba(10,15,30,0.8)', zIndex: 10 }}>
                  <div className="pulse-primary" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gold)' }} />
                  <p style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em' }}>INITIALIZING SPATIAL GRID...</p>
                </div>
              ) : (
                <PropertyMap properties={properties.slice(0, 100)} />
              )}
            </div>
          </div>
        </section>

        {/* Regional Sitemap - High Density Keyword Hub for Google Search */}
        <Suspense fallback={<div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading regions...</div>}>
          <RegionalSitemap />
        </Suspense>

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
