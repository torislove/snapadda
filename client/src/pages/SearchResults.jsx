import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, MapPin, Filter, ChevronLeft, ChevronRight,
  ArrowLeft, Building2, Home as HomeIcon, Square, Leaf, Trees, IndianRupee,
  ShieldCheck, Compass, AlertCircle, NavigationOff, Navigation2, Radar as RadarIcon, Award, Maximize2
} from 'lucide-react';
import { fetchProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { SkeletonPropertyCard } from '../components/SkeletonLoaders';
import { parseSmartSearch, getFuzzySuggestions, loadAndhraData } from '../services/SearchParser';

const PROPERTY_TYPES = [
  { label: 'All Types', value: '', icon: <Filter size={14}/> },
  { label: 'Apartment / Flat', value: 'Apartment', icon: <Building2 size={14}/> },
  { label: 'Independent House', value: 'Independent House', icon: <HomeIcon size={14}/> },
  { label: 'Villa / Duplex', value: 'Villa', icon: <HomeIcon size={14}/> },
  { label: 'Residential Plot', value: 'Residential Plot', icon: <Square size={14}/> },
  { label: 'Gated Community Plot', value: 'Gated Community Plot', icon: <Square size={14}/> },
  { label: 'CRDA Approved Plot', value: 'CRDA Approved Plot', icon: <Award size={14}/> },
  { label: 'Open Plot', value: 'Open Plot', icon: <Square size={14}/> },
  { label: 'Layout Plot', value: 'Layout Plot', icon: <Square size={14}/> },
  { label: 'Commercial Plot', value: 'Commercial Plot', icon: <Square size={14}/> },
  { label: 'Commercial Space', value: 'Commercial Space', icon: <Building2 size={14}/> },
  { label: 'Office Space', value: 'Office Space', icon: <Building2 size={14}/> },
  { label: 'Showroom / Retail', value: 'Showroom', icon: <Building2 size={14}/> },
  { label: 'Agricultural Land', value: 'Agricultural Land', icon: <Leaf size={14}/> },
  { label: 'Farmhouse / Farm Villa', value: 'Farmhouse', icon: <HomeIcon size={14}/> },
  { label: 'Industrial Shed', value: 'Industrial Shed', icon: <Maximize2 size={14}/> },
  { label: 'Warehouse', value: 'Warehouse', icon: <Maximize2 size={14}/> },
  { label: 'Factory', value: 'Factory', icon: <Maximize2 size={14}/> },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Featured First', value: 'featured' },
];

const BUDGET_PRESETS = [
  { label: 'Any Budget', min: '', max: '' },
  { label: 'Under ₹25L', min: '', max: '2500000' },
  { label: '₹25L–50L', min: '2500000', max: '5000000' },
  { label: '₹50L–1Cr', min: '5000000', max: '10000000' },
  { label: '₹1Cr–2Cr', min: '10000000', max: '20000000' },
  { label: '₹2Cr+', min: '20000000', max: '' },
];

const PAGE_SIZE = 12;

export default function SearchResults() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
  const [apiError, setApiError] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const searchRef = useRef(null);
  // Read all filters from URL
  const getParam = (key, def = '') => searchParams.get(key) || def;

  const [keyword, setKeyword] = useState(getParam('keyword'));
  const [type, setType] = useState(getParam('type'));
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

  // Sync URL → state on initial load  
  // Build current filter object
  const buildFilters = useCallback(() => {
    const smart = parseSmartSearch(keyword);
    return {
      search: smart?.keyword || keyword || undefined,
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
      limit: PAGE_SIZE,
    };
  }, [keyword, type, city, purpose, minPrice, maxPrice, bhk, facing, approval, vastu, verified, sort, page]);

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
        setProperties(prev => page > 1 ? [...prev, ...newData] : newData);
        setMeta(res?.meta || { total: res?.data?.length || 0, totalPages: 1, page: filters.page });
        setApiError(false);
      })
      .catch(() => { setApiError(true); if (page === 1) setProperties([]); })
      .finally(() => setLoading(false));
  }, [buildFilters, page]);

  useEffect(() => {
    syncToUrl();
    loadResults();
  }, [keyword, type, city, purpose, minPrice, maxPrice, bhk, facing, approval, vastu, verified, sort, page]);

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
        <label className="sr-filter-label">{t('search.placeholder', 'Keyword / Location')}</label>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }}/>
          <input
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {PROPERTY_TYPES.map(t => (
            <button key={t.value} onClick={() => { setType(t.value); setPage(1); }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', border: type === t.value ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', background: type === t.value ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.04)', color: type === t.value ? 'var(--gold)' : 'rgba(255,255,255,0.7)', transition: 'all 0.15s' }}>
              {t.icon} {t.label}
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

      {/* Budget */}
      <div>
        <label className="sr-filter-label">{t('filter.budgetMax', 'Budget')}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
          {BUDGET_PRESETS.map(b => {
            const active = minPrice === b.min && maxPrice === b.max;
            return (
              <button key={b.label} onClick={() => { setMinPrice(b.min); setMaxPrice(b.max); setPage(1); }}
                style={{ padding: '5px 9px', borderRadius: '7px', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', border: active ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', background: active ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.04)', color: active ? 'var(--gold)' : 'rgba(255,255,255,0.6)' }}>
                {b.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
             <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', fontSize: '0.8rem' }}>₹</span>
             <input className="dropdown-3d-glass" type="number" placeholder="Min" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1); }} style={{ width: '100%', boxSizing: 'border-box', fontSize: '0.8rem', paddingLeft: '22px' }}/>
          </div>
          <div style={{ position: 'relative' }}>
             <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', fontSize: '0.8rem' }}>₹</span>
             <input className="dropdown-3d-glass" type="number" placeholder="Max" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1); }} style={{ width: '100%', boxSizing: 'border-box', fontSize: '0.8rem', paddingLeft: '22px' }}/>
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
        <select className="dropdown-3d-glass" value={facing} onChange={e => { setFacing(e.target.value); setPage(1); }} style={{ width: '100%', fontSize: '0.82rem', boxSizing: 'border-box' }}>
          <option value="">Any Direction</option>
          <option>East</option><option>North</option><option>West</option>
          <option>South</option><option>North-East</option><option>South-West</option>
        </select>
      </div>

      {/* Approval */}
      <div>
        <label className="sr-filter-label">{t('filter.approval', 'Approval Authority')}</label>
        <select className="dropdown-3d-glass" value={approval} onChange={e => { setApproval(e.target.value); setPage(1); }} style={{ width: '100%', fontSize: '0.82rem', boxSizing: 'border-box' }}>
          <option value="">Any / All</option>
          <option>AP CRDA</option><option>AP RERA</option>
          <option>VMRDA</option><option>DTCP</option>
          <option>TUDA</option><option>Panchayat</option>
        </select>
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

      <button onClick={resetAll} style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'rgba(245,57,123,0.08)', border: '1px solid rgba(245,57,123,0.2)', color: '#f5397b', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
        <X size={12} style={{ marginRight: '6px' }}/> {t('filter.clearAll', 'Clear All Filters')}
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: 'var(--nav-h)', background: 'var(--bg-deep)' }}>
      {/* Top bar */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0.75rem 0', background: 'rgba(7,7,15,0.95)', backdropFilter: 'blur(20px)', position: 'sticky', top: 'var(--nav-h)', zIndex: 100 }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
              <ArrowLeft size={14}/> Back
            </button>
            {/* Inline search bar */}
            <div style={{ flex: 1, position: 'relative', minWidth: '180px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', pointerEvents: 'none' }}/>
              <input type="text" value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }}
                onKeyDown={e => e.key === 'Enter' && loadResults()}
                style={{ width: '100%', paddingLeft: '34px', paddingRight: '36px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', height: '36px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Search location, project..."
              />
              {keyword && <button onClick={() => { setKeyword(''); setPage(1); }} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '2px' }}><X size={13}/></button>}
            </div>
            {/* Sort */}
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', padding: '7px 10px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {/* Filter button (mobile) — always visible on mobile via CSS */}
            <button onClick={() => setShowMobileFilter(true)} className="sr-mobile-filter-btn"
              style={{ alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>
              <SlidersHorizontal size={14}/> Filters {activeFilterChips.length > 0 && `(${activeFilterChips.length})`}
            </button>
            {/* Result count */}
            <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {loading ? 'Searching...' : `${meta.total} properties`}
            </span>
          </div>

          {/* Active filter chips */}
          {activeFilterChips.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', marginTop: '10px', paddingBottom: '4px' }}>
              <style>{`.container ::-webkit-scrollbar { display: none; }`}</style>
              {activeFilterChips.map((chip, i) => (
                <motion.button key={i} initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={chip.clear}
                  style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.3)', color: 'var(--gold)', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                  {chip.label} <X size={10}/>
                </motion.button>
              ))}
              <button onClick={resetAll} style={{ flexShrink: 0, padding: '4px 10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', borderRadius: '20px', fontSize: '0.68rem', cursor: 'pointer' }}>Clear all</button>
            </div>
          )}

          {/* Professional Quick Action Chips (Industry Standard) */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', padding: '12px 0 5px', marginTop: '5px' }} className="hide-scrollbar">
            {[
              { label: 'Under ₹50L', action: () => { setMaxPrice('5000000'); setPage(1); } },
              { label: 'Ready to Move', action: () => { setApproval('DTCP'); setPage(1); } },
              { label: 'East Facing', action: () => { setFacing('East'); setPage(1); } },
              { label: 'CRDA Approved', action: () => { setApproval('AP CRDA'); setPage(1); } },
              { label: 'Verified Only', action: () => { setVerified(true); setPage(1); } },
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={q.action}
                style={{
                  flexShrink: 0, padding: '8px 16px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Body */}
      <div className="container sr-results-grid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', paddingTop: '2rem', paddingBottom: '4rem', alignItems: 'start' }}>
        {/* LEFT: Filter Panel */}
        <aside className="sr-filter-panel glass-panel" style={{ position: 'sticky', top: 'calc(var(--nav-h) + 80px)', padding: '1.5rem', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 800, color: 'white' }}>
              <SlidersHorizontal size={15} style={{ color: 'var(--gold)' }}/> Filters
            </div>
            {activeFilterChips.length > 0 && (
              <span style={{ background: 'var(--gold)', color: '#000', fontSize: '0.6rem', fontWeight: 900, borderRadius: '20px', padding: '2px 8px' }}>{activeFilterChips.length} active</span>
            )}
          </div>
          {filterPanel}
        </aside>

        {/* RIGHT: Results */}
        <main>
          {viewMode === 'list' ? (
            loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {Array(6).fill(0).map((_, i) => <SkeletonPropertyCard key={i}/>)}
              </div>
            ) : properties.length > 0 ? (
              <>
                <motion.div 
                  className="properties-grid" 
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 }
                    }
                  }}
                >
                  {properties.map((p) => (
                    <PropertyCard key={p._id || p.id} {...p} />
                  ))}
                </motion.div>

                {/* Pagination / Infinite Scroll Node */}
                {meta.totalPages > 1 && (
                  <div style={{ textAlign: 'center', marginTop: '3rem', padding: '1rem' }}>
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
            /* Professional Map View Placeholder */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ 
                height: 'calc(100vh - 250px)', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '32px', 
                border: '1px solid rgba(232,184,75,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(212,175,55,0.3) 1px, transparent 0)', backgroundSize: '30px 30px' }} />
              <div className="radar-animation" style={{ marginBottom: '2rem' }}>
                <RadarIcon size={80} style={{ color: 'var(--gold)' }} />
              </div>
              <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 900, marginBottom: '10px' }}>Interactive Map View</h3>
              <p style={{ color: 'var(--txt-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '400px' }}>
                Discover elite properties in your area. Visual search and location-based hotspots are coming soon.
              </p>
              <button 
                onClick={() => setViewMode('list')}
                style={{ marginTop: '2rem', padding: '12px 24px', borderRadius: '14px', background: 'rgba(232,184,75,0.1)', border: '1px solid var(--gold)', color: 'var(--gold)', fontWeight: 800, cursor: 'pointer' }}
              >
                Back to List View
              </button>
            </motion.div>
          )}
        </main>
      </div>

      {/* Mobile Filter Fullscreen Modal */}
      <AnimatePresence>
        {showMobileFilter && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}
            onClick={() => setShowMobileFilter(false)}>
            <motion.div 
              initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '480px', background: 'var(--midnight)', borderTop: '1px solid var(--border-glass)', borderRadius: '32px 32px 0 0', padding: '2rem 1.5rem 1.5rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 -20px 80px rgba(0,0,0,0.8)', position: 'absolute', bottom: 0 }}>
              <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <div style={{ fontWeight: 800, color: 'white', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SlidersHorizontal size={18} style={{ color: 'var(--gold)' }}/> Advanced Filters
                </div>
                <button onClick={() => setShowMobileFilter(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16}/></button>
              </div>
              {filterPanel}
              <div style={{ position: 'sticky', bottom: '-1.5rem', left: 0, right: 0, background: 'linear-gradient(to top, rgba(9,9,18,1) 50%, rgba(9,9,18,0))', padding: '1.5rem 0', marginTop: '1rem', zIndex: 10 }}>
                <button onClick={() => setShowMobileFilter(false)} className="btn-3d-liquid" style={{ width: '100%', padding: '1.25rem', background: 'var(--gold)', color: 'var(--midnight)', border: 'none', borderRadius: '18px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 12px 30px rgba(232,184,75,0.4)' }}>
                  {t('filter.apply', 'APPLY FILTERS')} ({meta.total})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Floating View Switcher (Airbnb/Zillow Style) */}
      <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          background: '#000', 
          borderRadius: '30px', 
          padding: '4px', 
          display: 'flex', 
          gap: '2px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <button 
            onClick={() => setViewMode('list')}
            style={{ 
              padding: '10px 20px', borderRadius: '26px', border: 'none',
              background: viewMode === 'list' ? 'var(--gold)' : 'transparent',
              color: viewMode === 'list' ? 'black' : 'white',
              fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'
            }}
          >
            <Building2 size={16} /> List
          </button>
          <button 
            onClick={() => setViewMode('map')}
            style={{ 
              padding: '10px 20px', borderRadius: '26px', border: 'none',
              background: viewMode === 'map' ? 'var(--gold)' : 'transparent',
              color: viewMode === 'map' ? 'black' : 'white',
              fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'
            }}
          >
            <MapPin size={16} /> Map
          </button>
        </div>
      </div>

      <style>{`
        .sr-filter-label { color: rgba(255,255,255,0.5); font-size: 0.62rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 8px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .sr-mobile-filter-btn { display: none; }
        
        /* Desktop filter sidebar styles */
        .sr-filter-panel {
          scrollbar-width: thin;
          scrollbar-color: rgba(232,184,75,0.2) transparent;
        }
        .sr-filter-panel::-webkit-scrollbar { width: 4px; }
        .sr-filter-panel::-webkit-scrollbar-track { background: transparent; }
        .sr-filter-panel::-webkit-scrollbar-thumb { background: rgba(232,184,75,0.2); border-radius: 4px; }

        /* Tablet breakpoint */
        @media (max-width: 1100px) {
          .sr-filter-panel { min-width: 240px !important; }
        }

        /* Mobile breakpoint — hide sidebar, show filter button */
        @media (max-width: 900px) {
          .sr-filter-panel { display: none !important; }
          .sr-mobile-filter-btn { display: flex !important; }
          .sr-results-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
        }

        /* Small mobile */
        @media (max-width: 600px) {
          .sr-topbar-row { flex-wrap: wrap; gap: 8px !important; }
          .sr-topbar-row > div:first-child { width: 100%; }
          .sr-topbar-row select { flex: 1; }
          .container { padding-bottom: 150px !important; }
          .sr-mobile-filter-btn { width: 100%; justify-content: center; }
        }

        /* Active filter chip row */
        .filter-chip-row::-webkit-scrollbar { display: none; }
        .filter-chip-row { -ms-overflow-style: none; scrollbar-width: none; }

        /* Quick action chips row */
        .quick-chips-row::-webkit-scrollbar { display: none; }
        .quick-chips-row { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
