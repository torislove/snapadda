import { useState, useEffect, useCallback, useRef, useMemo, startTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, MapPin, Filter, ChevronLeft, ChevronRight,
  ArrowLeft, Building, Home as HomeIcon, Square, Leaf, Trees, IndianRupee,
  ShieldCheck, Compass, AlertCircle, NavigationOff, Navigation2, Radar as RadarIcon, Award, Maximize2
} from 'lucide-react';
import { fetchProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { SkeletonPropertyCard } from '../components/SkeletonLoaders';
import { parseSmartSearch, getFuzzySuggestions, loadAndhraData } from '../services/SearchParser';
import { triggerMicroLead } from '../utils/tracker';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';
import PropertyMap from '../components/PropertyMap';
import FilterDrawer from '../components/FilterDrawer';

const getPropertyTypes = (t) => [
  { label: t('types.all', 'All Types'), value: '', icon: <Filter size={14}/> },
  { label: t('types.apartment_flat', 'Apartment / Flat'), value: 'Apartment', icon: <Building size={14}/> },
  { label: t('types.independent_house', 'Independent House'), value: 'Independent House', icon: <HomeIcon size={14}/> },
  { label: t('types.villa_duplex', 'Villa / Duplex'), value: 'Villa', icon: <HomeIcon size={14}/> },
  { label: t('types.gated_community_plot', 'Gated Community Plot'), value: 'Gated Community Plot', icon: <Square size={14}/> },
  { label: t('types.residential_plot', 'Residential Plot'), value: 'Residential Plot', icon: <Square size={14}/> },
  { label: t('types.crda_approved_plot', 'CRDA Approved Plot'), value: 'CRDA Approved Plot', icon: <Award size={14}/> },
  { label: t('types.open_plot', 'Open Plot'), value: 'Open Plot', icon: <Square size={14}/> },
  { label: t('types.layout_plot', 'Layout Plot'), value: 'Layout Plot', icon: <Square size={14}/> },
  { label: t('types.commercial_plot', 'Commercial Plot'), value: 'Commercial Plot', icon: <Square size={14}/> },
  { label: t('types.commercial_space', 'Commercial Space'), value: 'Commercial Space', icon: <Building size={14}/> },
  { label: t('types.office_space', 'Office Space'), value: 'Office Space', icon: <Building size={14}/> },
  { label: t('types.showroom', 'Showroom / Retail'), value: 'Showroom', icon: <Building size={14}/> },
  { label: t('types.agricultural_land', 'Agricultural Land'), value: 'Agricultural Land', icon: <Leaf size={14}/> },
  { label: t('types.farmhouse', 'Farmhouse'), value: 'Farmhouse', icon: <Trees size={14}/> },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Featured First', value: 'featured' },
];

const BUDGET_PRESETS = [
  { label: 'Any', min: '', max: '' },
  { label: 'Under 25L', min: '', max: '2500000' },
  { label: '25L–50L', min: '2500000', max: '5000000' },
  { label: '50L–1Cr', min: '5000000', max: '10000000' },
  { label: '1Cr–2Cr', min: '10000000', max: '20000000' },
  { label: '2Cr–5Cr', min: '20000000', max: '50000000' },
  { label: '5Cr+', min: '50000000', max: '' },
];

const PAGE_SIZE = 12;

export default function SearchResults() {
  const { t } = useTranslation();
  const locationState = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
  const [apiError, setApiError] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showBottomHub, setShowBottomHub] = useState(false);
  const [debouncedKeyword, setDebouncedKeyword] = useState(searchParams.get('keyword') || '');
  const searchRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Read all filters from URL
  const getParam = (key, def = '') => searchParams.get(key) || def;

  const [keyword, setKeyword] = useState(getParam('keyword'));
  const [type, setType] = useState(getParam('type') || locationState.state?.typeFilter || '');
  const [city, setCity] = useState(getParam('city'));
  const [purpose, setPurpose] = useState(getParam('purpose'));
  const [minPrice, setMinPrice] = useState(getParam('minPrice'));
  const [maxPrice, setMaxPrice] = useState(getParam('maxPrice'));
  const [bhk, setBhk] = useState(getParam('bhk'));
  const [facing, setFacing] = useState(getParam('facing'));
  const [approval, setApproval] = useState(getParam('approval'));
  const [vastu, setVastu] = useState(getParam('vastu') === 'true');
  const [verified, setVerified] = useState(getParam('verified') === 'true');
  const [sort, setSort] = useState(getParam('sort', 'newest'));
  const [page, setPage] = useState(parseInt(getParam('page', '1')));

  // Filter setter for Drawer
  const setDrawerFilter = (key, val) => {
    if (key === 'type') setType(val);
    if (key === 'bhk') setBhk(val);
    if (key === 'minPrice') setMinPrice(val);
    if (key === 'maxPrice') setMaxPrice(val);
    if (key === 'keyword') setKeyword(val);
    if (key === 'facing') setFacing(val);
    if (key === 'vastu') setVastu(val);
    if (key === 'verified') setVerified(val);
    setPage(1);
  };

  const drawerFilters = {
    type, bhk, minPrice, maxPrice, keyword, facing, vastu, verified
  };

  // Debounce effect for keyword
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Sync URL → state on initial load  
  // Build current filter object
  const buildFilters = useCallback(() => {
    const smart = parseSmartSearch(debouncedKeyword);
    return {
      search: smart?.keyword || debouncedKeyword || undefined,
      type: smart?.type || type || undefined,
      city: smart?.city || city || undefined,
      purpose: purpose || undefined,
      minPrice: smart?.minPrice || minPrice || undefined,
      maxPrice: smart?.maxPrice || maxPrice || undefined,
      bhk: smart?.bhk || bhk || undefined,
      facing: facing || undefined,
      approval: approval || undefined,
      vastu: vastu ? 'true' : undefined,
      verified: verified ? 'true' : undefined,
      sort,
      page,
      limit: viewMode === 'map' ? 100 : PAGE_SIZE,
    };
  }, [debouncedKeyword, type, city, purpose, minPrice, maxPrice, bhk, facing, approval, vastu, verified, sort, page, viewMode]);

  // Sync filters → URL
  const syncToUrl = useCallback(() => {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (type) params.type = type;
    if (city) params.city = city;
    if (purpose) params.purpose = purpose;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (bhk) params.bhk = bhk;
    if (facing) params.facing = facing;
    if (approval) params.approval = approval;
    if (vastu) params.vastu = 'true';
    if (verified) params.verified = 'true';
    if (sort !== 'newest') params.sort = sort;
    if (page > 1) params.page = String(page);
    setSearchParams(params, { replace: true });
  }, [keyword, type, city, purpose, minPrice, maxPrice, bhk, facing, approval, vastu, verified, sort, page, setSearchParams]);

  const loadResults = useCallback(() => {
    if (page === 1) setLoading(true);
    setApiError(false);
    const filters = buildFilters();
    fetchProperties(filters)
      .then(res => {
        const newData = res?.data || [];
        startTransition(() => {
          setProperties(prev => page > 1 ? [...prev, ...newData] : newData);
        });
        setMeta(res?.meta || { total: res?.data?.length || 0, totalPages: 1, page: filters.page });
        setApiError(false);
        
        // Silent Lead Capture: Log the search intent
        if (keyword || type || city) {
          triggerMicroLead({ 
            source: 'Search Intent', 
            message: `User searched for: ${[keyword, type, city].filter(Boolean).join(', ')}`,
            metadata: filters
          });
        }
      })
      .catch(() => { setApiError(true); if (page === 1) setProperties([]); })
      .finally(() => setLoading(false));
  }, [buildFilters, page]);

  const handleAutoLocation = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const data = await res.json();
        const detectedCity = data.city || data.locality || data.principalSubdivision;
        if (detectedCity) {
          setCity(detectedCity);
          setKeyword(detectedCity);
          setPage(1);
        }
      } catch (e) {
        console.error('Location fetch failed', e);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    syncToUrl();
    loadResults();
  }, [debouncedKeyword, type, city, purpose, minPrice, maxPrice, bhk, facing, approval, vastu, verified, sort, page]);

  // Infinite Scroll Observer
  const loadMoreRef = useRef(null);
  useEffect(() => {
    if (!loadMoreRef.current || loading || page >= meta.totalPages) return;
    const observer = new IntersectionObserver(([ent]) => {
      if (ent.isIntersecting) setPage(p => p + 1);
    }, { rootMargin: '200px' });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loading, page, meta.totalPages]);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (keyword) chips.push({ label: `"${keyword}"`, clear: () => { setKeyword(''); setPage(1); } });
    if (type) chips.push({ label: type, clear: () => { setType(''); setPage(1); } });
    if (city) chips.push({ label: `📍 ${city}`, clear: () => { setCity(''); setPage(1); } });
    if (purpose) chips.push({ label: purpose, clear: () => { setPurpose(''); setPage(1); } });
    if (minPrice || maxPrice) {
      const label = minPrice && maxPrice ? `₹${Number(minPrice)/100000}L–₹${Number(maxPrice)/100000}L` : minPrice ? `From ₹${Number(minPrice)/100000}L` : `Up to ₹${Number(maxPrice)/100000}L`;
      chips.push({ label, clear: () => { setMinPrice(''); setMaxPrice(''); setPage(1); } });
    }
    if (bhk) chips.push({ label: `${bhk} BHK`, clear: () => { setBhk(''); setPage(1); } });
    if (facing) chips.push({ label: `${facing} Facing`, clear: () => { setFacing(''); setPage(1); } });
    if (approval) chips.push({ label: approval, clear: () => { setApproval(''); setPage(1); } });
    if (vastu) chips.push({ label: '🧭 Vastu', clear: () => { setVastu(false); setPage(1); } });
    if (verified) chips.push({ label: '✅ Verified', clear: () => { setVerified(false); setPage(1); } });
    return chips;
  }, [keyword, type, city, purpose, minPrice, maxPrice, bhk, facing, approval, vastu, verified]);

  const resetAll = () => {
    setKeyword(''); setType(''); setCity(''); setPurpose('');
    setMinPrice(''); setMaxPrice(''); setBhk(''); setFacing('');
    setApproval(''); setVastu(false); setVerified(false);
    setSort('newest'); setPage(1);
  };

  const filterPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label className="sr-filter-label">{t('search.placeholder', 'Keyword / Location')}</label>
          <button 
            onClick={handleAutoLocation}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--gold)', 
              fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <Navigation2 size={10} /> DETECT
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }}/>
          <input
            id="input-search-keyword"
            ref={searchRef}
            type="text"
            className="dropdown-3d-glass"
            style={{ width: '100%', paddingLeft: '36px', fontSize: '0.85rem', boxSizing: 'border-box' }}
            placeholder="City, area, keyword..."
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(1); }}
            onFocus={() => { loadAndhraData(); setShowAutocomplete(true); }}
            onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
          />
          {showAutocomplete && keyword.length >= 2 && (
            <div className="search-autocomplete-dropdown" style={{ left: 0, right: 0, top: '100%' }}>
              {getFuzzySuggestions(keyword).slice(0, 6).map(c => (
                <button key={c.name} className="autocomplete-item" onClick={() => { setKeyword(c.name); setCity(c.name); setShowAutocomplete(false); }}>
                  <MapPin size={12}/> {c.name} <span className="ac-badge">{c.district}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="sr-filter-label">{t('filter.category', 'Property Type')}</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {getPropertyTypes(t).map(tp => (
            <button 
              id={`btn-filter-type-${tp.value.toLowerCase().replace(/\s+/g, '-')}`}
              key={tp.value} onClick={() => { setType(tp.value); setPage(1); }}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', 
                borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', 
                border: type === tp.value ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.06)', 
                background: type === tp.value ? 'rgba(232,184,75,0.12)' : 'rgba(255,255,255,0.02)', 
                color: type === tp.value ? 'var(--gold)' : 'rgba(255,255,255,0.6)', 
                transition: 'all 0.25s var(--ease-butter)',
                textAlign: 'left'
              }}>
              <span style={{ opacity: type === tp.value ? 1 : 0.5 }}>{tp.icon}</span> 
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Purpose */}
      <div>
        <label className="sr-filter-label">I want to...</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['', 'Sale', 'Rent', 'Lease'].map(p => (
            <button key={p} onClick={() => { setPurpose(p); setPage(1); }}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', border: purpose === p ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', background: purpose === p ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.04)', color: purpose === p ? 'var(--gold)' : 'rgba(255,255,255,0.7)', transition: 'all 0.15s' }}>
              {p || 'Buy / Rent'}
            </button>
          ))}
        </div>
      </div>

      {/* Budget Range */}
      <div>
        <label className="sr-filter-label">{t('filter.budgetMax', 'Budget Range')}</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '14px' }}>
          {BUDGET_PRESETS.map(b => {
            const active = minPrice === b.min && maxPrice === b.max;
            return (
              <button key={b.label} onClick={() => { setMinPrice(b.min); setMaxPrice(b.max); setPage(1); }}
                style={{ 
                  padding: '7px 4px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', 
                  border: active ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)', 
                  background: active ? 'rgba(232,184,75,0.18)' : 'rgba(255,255,255,0.03)', 
                  color: active ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s'
                }}>
                {b.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
             <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>₹</span>
             <input 
              className="elite-input-minimal" 
              type="number" 
              placeholder="Min" 
              value={minPrice} 
              onChange={e => { setMinPrice(e.target.value); setPage(1); }} 
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.85rem', paddingLeft: '20px' }}
             />
          </div>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ flex: 1, position: 'relative' }}>
             <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>₹</span>
             <input 
              className="elite-input-minimal" 
              type="number" 
              placeholder="Max" 
              value={maxPrice} 
              onChange={e => { setMaxPrice(e.target.value); setPage(1); }} 
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.85rem', paddingLeft: '20px' }}
             />
          </div>
        </div>
      </div>

      {/* BHK */}
      <div>
        <label className="sr-filter-label">{t('card.config', 'BHK Configuration')}</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['', '1', '2', '3', '4'].map(b => (
            <button key={b} onClick={() => { setBhk(b); setPage(1); }}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', border: bhk === b ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', background: bhk === b ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.04)', color: bhk === b ? 'var(--gold)' : 'rgba(255,255,255,0.7)', transition: 'all 0.15s' }}>
              {b ? `${b}${b === '4' ? '+' : ''}` : 'Any'}
            </button>
          ))}
        </div>
      </div>

      {/* Facing */}
      <div>
        <label className="sr-filter-label">{t('filter.facing', 'Facing')}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['', 'East', 'North', 'West', 'South', 'North-East', 'South-West'].map(f => (
            <button key={f} onClick={() => { setFacing(f); setPage(1); }}
              style={{ flex: '1 1 calc(33% - 8px)', padding: '8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', border: facing === f ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', background: facing === f ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.04)', color: facing === f ? 'var(--gold)' : 'rgba(255,255,255,0.7)', transition: 'all 0.15s' }}>
              {f || 'Any'}
            </button>
          ))}
        </div>
      </div>

      {/* Approval */}
      <div>
        <label className="sr-filter-label">{t('filter.approval', 'Approval Authority')}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['', 'AP CRDA', 'AP RERA', 'VMRDA', 'DTCP', 'TUDA', 'Panchayat'].map(a => (
            <button key={a} onClick={() => { setApproval(a); setPage(1); }}
              style={{ flex: '1 1 calc(50% - 8px)', padding: '8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', border: approval === a ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', background: approval === a ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.04)', color: approval === a ? 'var(--gold)' : 'rgba(255,255,255,0.7)', transition: 'all 0.15s' }}>
              {a || 'Any / All'}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {[{ label: '🧭 Vastu Only', state: vastu, set: setVastu }, { label: '✅ Verified Only', state: verified, set: setVerified }].map(t => (
          <button key={t.label} onClick={() => { t.set(!t.state); setPage(1); }}
            style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', border: t.state ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', background: t.state ? 'rgba(232,184,75,0.1)' : 'transparent', color: t.state ? 'var(--gold)' : 'rgba(255,255,255,0.6)', transition: 'all 0.2s' }}>
            {t.label}
          </button>
        ))}
      </div>

      <button 
        id="btn-filter-clear-all"
        onClick={resetAll} 
        style={{ 
          width: '100%', 
          padding: '12px', 
          borderRadius: '14px', 
          background: 'rgba(245,57,123,0.05)', 
          border: '1px solid rgba(245,57,123,0.15)', 
          color: '#f5397b', 
          fontSize: '0.8rem', 
          fontWeight: 800, 
          cursor: 'pointer',
          marginTop: '1rem',
          transition: 'all 0.3s ease'
        }}
        onPointerEnter={e => e.currentTarget.style.background = 'rgba(245,57,123,0.1)'}
        onPointerLeave={e => e.currentTarget.style.background = 'rgba(245,57,123,0.05)'}
      >
        <X size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }}/> {t('filter.clearAll', 'Reset Everything')}
      </button>
    </div>
  );

  return (
    <>
      <div style={{ minHeight: '100vh', width: '100%', paddingTop: 'var(--nav-h)', background: 'var(--midnight)' }}>
      <SEO 
        title={keyword ? `Search results for "${keyword}"` : type ? `${type} for Sale/Rent` : city ? `Properties in ${city}` : 'Browse Properties'}
        description={`Find the best ${type || 'properties'} in ${city || keyword || 'Andhra Pradesh'}. Browse through ${meta.total} exclusive, verified listings on SnapAdda.`}
        keywords={[type, city, keyword, 'Real Estate Search', 'AP Properties'].filter(Boolean)}
      />
      {/* Sticky Action Bar (Unified Header) */}
      <div style={{ 
        borderBottom: '1px solid rgba(255,255,255,0.07)', 
        background: 'rgba(7,7,15,0.95)', 
        backdropFilter: 'blur(30px)', 
        position: 'sticky', 
        top: 'var(--nav-h)', 
        zIndex: 1000 
      }}>
        <div className="search-header-inner" style={{ padding: isMobile ? '0.75rem 0.75rem' : '0.75rem 1.25rem', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Row 1: Back + Search + Map Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', marginBottom: '12px', width: '100%' }}>
            <button 
              onClick={() => navigate(-1)} 
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ArrowLeft size={18}/>
            </button>
            
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)' }} />
              <input 
                value={keyword} 
                onChange={e => { setKeyword(e.target.value); setPage(1); }} 
                placeholder="Search localities, projects or property types..." 
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 12px 10px 38px', color: '#fff', fontSize: '0.85rem', fontWeight: 600, outline: 'none' }} 
              />
            </div>

            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              style={{ 
                background: viewMode === 'map' ? 'var(--gold)' : 'rgba(255,255,255,0.05)', 
                border: viewMode === 'map' ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', 
                color: viewMode === 'map' ? '#000' : '#fff', 
                padding: '10px 16px', 
                borderRadius: '12px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                transition: 'all 0.3s ease'
              }}
            >
              {viewMode === 'list' ? <MapPin size={16}/> : <Building size={16}/>}
              <span style={{ display: isMobile ? 'none' : 'block' }}>{viewMode === 'list' ? 'MAP' : 'LIST'}</span>
            </button>
          </div>

          {/* Row 2: Filters (Horizontal Scrollable) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div className="hide-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', flex: 1, paddingBottom: '4px' }}>
              {/* Type Filter */}
              <div style={{ position: 'relative' }}>
                <select 
                  value={type} 
                  onChange={e => { setType(e.target.value); setPage(1); }}
                  className="filter-pill-select"
                  style={{ appearance: 'none', background: type ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.05)', border: type ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', color: type ? 'var(--gold)' : 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                >
                  <option value="">{t('filter.category', 'Property Type')}</option>
                  {getPropertyTypes(t).slice(1).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Budget Filter */}
              <div style={{ position: 'relative' }}>
                <select 
                  value={maxPrice} 
                  onChange={e => { setMaxPrice(e.target.value); setPage(1); }}
                  className="filter-pill-select"
                  style={{ appearance: 'none', background: maxPrice ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.05)', border: maxPrice ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', color: maxPrice ? 'var(--gold)' : 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                >
                  <option value="">Budget</option>
                  {BUDGET_PRESETS.slice(1).map(b => <option key={b.label} value={b.max}>{b.label}</option>)}
                </select>
              </div>

              {/* BHK Filter */}
              <div style={{ position: 'relative' }}>
                <select 
                  value={bhk} 
                  onChange={e => { setBhk(e.target.value); setPage(1); }}
                  className="filter-pill-select"
                  style={{ appearance: 'none', background: bhk ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.05)', border: bhk ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', color: bhk ? 'var(--gold)' : 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                >
                  <option value="">BHK</option>
                  {['1', '2', '3', '4'].map(b => <option key={b} value={b}>{b} BHK</option>)}
                </select>
              </div>

              {/* Purpose */}
              <div style={{ position: 'relative' }}>
                <select 
                  value={purpose} 
                  onChange={e => { setPurpose(e.target.value); setPage(1); }}
                  className="filter-pill-select"
                  style={{ appearance: 'none', background: purpose ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.05)', border: purpose ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', color: purpose ? 'var(--gold)' : 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                >
                  <option value="">I want to...</option>
                  {['Sale', 'Rent', 'Lease'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* More Filters (Trigger) */}
              <button 
                onClick={() => setShowMobileFilter(true)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px', 
                  padding: '10px 18px', borderRadius: '25px', fontSize: '0.75rem', fontWeight: 800, 
                  cursor: 'pointer', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.15)', 
                  background: 'rgba(255,255,255,0.1)', color: '#fff',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}
              >
                <SlidersHorizontal size={14} style={{ color: 'var(--gold)' }}/> {t('filter.title', 'All Filters')}
              </button>
            </div>

            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 900, letterSpacing: '0.05em' }}>{meta.total} LISTINGS</span>
                <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
                <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Body */}
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem', width: '100%', maxWidth: '1400px' }}>
        <main style={{ width: '100%' }}>
          {viewMode === 'list' ? (
            loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {Array(8).fill(0).map((_, i) => <SkeletonPropertyCard key={i}/>)}
              </div>
            ) : properties.length > 0 ? (
              <>
                <div 
                  className="properties-grid" 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '2rem',
                    width: '100%',
                    minHeight: '400px'
                  }}
                >
                  {properties.map((p) => (
                    <PropertyCard key={p._id || p.id} {...p} />
                  ))}
                </div>

                {/* Pagination / Infinite Scroll Node */}
                {meta.totalPages > 1 && (
                  <div style={{ textAlign: 'center', marginTop: '4rem', padding: '1rem' }}>
                    {page < meta.totalPages ? (
                      <div ref={loadMoreRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', color: 'var(--txt-muted)' }}>
                        <div className="pulse-primary" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} /> Loading more properties...
                      </div>
                    ) : (
                      <span style={{ color: 'var(--txt-muted)', fontSize: '0.85rem' }}>You've reached the end of the results.</span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <AlertCircle size={52} style={{ color: 'rgba(255,255,255,0.15)' }}/>
                <h3 style={{ color: 'white', fontSize: '1.35rem', fontWeight: 800 }}>No properties found</h3>
                <p style={{ color: 'var(--txt-muted)', fontSize: '0.88rem', maxWidth: '340px' }}>
                  Try widening your filters — remove the budget limit, change the city, or pick a broader property type.
                </p>
                <button onClick={resetAll} style={{ marginTop: '1rem', padding: '0.75rem 2rem', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer' }}>
                  Clear All Filters
                </button>
              </motion.div>
            )
          ) : (
            <div style={{ height: 'calc(100vh - 280px)', width: '100%', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <PropertyMap properties={properties} />
            </div>
          )}
        </main>
      </div>
    </div>

      {/* Filter Drawer for "All Filters" */}
      <FilterDrawer 
        isOpen={showMobileFilter} 
        onClose={() => setShowMobileFilter(false)} 
        filters={drawerFilters}
        setFilter={setDrawerFilter}
        totalMatches={meta.total}
        propertyTypes={getPropertyTypes(t)}
        budgetPresets={BUDGET_PRESETS}
        onApply={() => { setShowMobileFilter(false); setPage(1); }}
      />

      <style>{`
        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .filter-pill-select {
          transition: all 0.2s ease;
          outline: none;
        }
        .filter-pill-select:hover {
          background: rgba(255,255,255,0.1) !important;
        }
        
        @media (max-width: 900px) {
          .properties-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .container { padding: 0 1rem; }
        }
      `}</style>
    </>
  );
}
