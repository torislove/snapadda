import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, MapPin, Filter, ChevronLeft, ChevronRight,
  ArrowLeft, Building2, Home as HomeIcon, Square, Leaf, Trees, IndianRupee,
  ShieldCheck, Compass, AlertCircle, NavigationOff, Navigation2
} from 'lucide-react';
import { fetchProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { SkeletonPropertyCard } from '../components/SkeletonLoaders';
import { parseSmartSearch, getFuzzySuggestions, loadAndhraData } from '../services/SearchParser';

const PROPERTY_TYPES = [
  { label: 'All Types', value: '', icon: <Filter size={14}/> },
  { label: 'Apartment', value: 'Apartment', icon: <Building2 size={14}/> },
  { label: 'Villa', value: 'Villa', icon: <HomeIcon size={14}/> },
  { label: 'Independent House', value: 'Independent House', icon: <HomeIcon size={14}/> },
  { label: 'Residential Plot', value: 'Residential Plot', icon: <Square size={14}/> },
  { label: 'Commercial Plot', value: 'Commercial Plot', icon: <Square size={14}/> },
  { label: 'Agricultural Land', value: 'Agricultural Land', icon: <Leaf size={14}/> },
  { label: 'Farmhouse', value: 'Farmhouse', icon: <Trees size={14}/> },
  { label: 'Commercial Space', value: 'Commercial Space', icon: <Building2 size={14}/> },
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
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
    setLoading(true);
    const filters = buildFilters();
    fetchProperties(filters)
      .then(res => {
        setProperties(res?.data || []);
        setMeta(res?.meta || { total: res?.data?.length || 0, totalPages: 1, page: 1 });
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [buildFilters]);

  useEffect(() => {
    syncToUrl();
    loadResults();
  }, [keyword, type, city, purpose, minPrice, maxPrice, bhk, facing, approval, vastu, verified, sort, page]);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (keyword) chips.push({ label: `"${keyword}"`, clear: () => setKeyword('') });
    if (type) chips.push({ label: type, clear: () => setType('') });
    if (city) chips.push({ label: `📍 ${city}`, clear: () => setCity('') });
    if (purpose) chips.push({ label: purpose, clear: () => setPurpose('') });
    if (minPrice || maxPrice) {
      const label = minPrice && maxPrice ? `₹${Number(minPrice)/100000}L–₹${Number(maxPrice)/100000}L` : minPrice ? `From ₹${Number(minPrice)/100000}L` : `Up to ₹${Number(maxPrice)/100000}L`;
      chips.push({ label, clear: () => { setMinPrice(''); setMaxPrice(''); } });
    }
    if (bhk) chips.push({ label: `${bhk} BHK`, clear: () => setBhk('') });
    if (facing) chips.push({ label: `${facing} Facing`, clear: () => setFacing('') });
    if (approval) chips.push({ label: approval, clear: () => setApproval('') });
    if (vastu) chips.push({ label: '🧭 Vastu', clear: () => setVastu(false) });
    if (verified) chips.push({ label: '✅ Verified', clear: () => setVerified(false) });
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
        <label className="sr-filter-label">Keyword / Location</label>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }}/>
          <input
            ref={searchRef}
            type="text"
            className="admin-input"
            style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
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
        <label className="sr-filter-label">Property Type</label>
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
        <label className="sr-filter-label">Purpose</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['', 'Sale', 'Rent', 'Lease'].map(p => (
            <button key={p} onClick={() => { setPurpose(p); setPage(1); }}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', border: purpose === p ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', background: purpose === p ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.04)', color: purpose === p ? 'var(--gold)' : 'rgba(255,255,255,0.7)', transition: 'all 0.15s' }}>
              {p || 'Any'}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="sr-filter-label">Budget</label>
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
          <input className="admin-input" type="number" placeholder="Min (₹)" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1); }} style={{ fontSize: '0.8rem' }}/>
          <input className="admin-input" type="number" placeholder="Max (₹)" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1); }} style={{ fontSize: '0.8rem' }}/>
        </div>
      </div>

      {/* BHK */}
      <div>
        <label className="sr-filter-label">BHK Configuration</label>
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
        <label className="sr-filter-label">Facing</label>
        <select className="admin-select" value={facing} onChange={e => { setFacing(e.target.value); setPage(1); }} style={{ width: '100%', fontSize: '0.82rem' }}>
          <option value="">Any Direction</option>
          <option>East</option><option>North</option><option>West</option>
          <option>South</option><option>North-East</option><option>South-West</option>
        </select>
      </div>

      {/* Approval */}
      <div>
        <label className="sr-filter-label">Approval Authority</label>
        <select className="admin-select" value={approval} onChange={e => { setApproval(e.target.value); setPage(1); }} style={{ width: '100%', fontSize: '0.82rem' }}>
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
        <X size={12} style={{ marginRight: '6px' }}/> Clear All Filters
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
            {/* Filter button (mobile) */}
            <button onClick={() => setShowMobileFilter(true)} className="sr-mobile-filter-btn"
              style={{ display: 'none', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
              <SlidersHorizontal size={14}/> Filters {activeFilterChips.length > 0 && `(${activeFilterChips.length})`}
            </button>
            {/* Result count */}
            <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {loading ? 'Searching...' : `${meta.total} properties`}
            </span>
          </div>

          {/* Active filter chips */}
          {activeFilterChips.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
              {activeFilterChips.map((chip, i) => (
                <motion.button key={i} initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={chip.clear}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.3)', color: 'var(--gold)', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                  {chip.label} <X size={10}/>
                </motion.button>
              ))}
              <button onClick={resetAll} style={{ padding: '4px 10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', borderRadius: '20px', fontSize: '0.68rem', cursor: 'pointer' }}>Clear all</button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', paddingTop: '2rem', paddingBottom: '4rem', alignItems: 'start' }}>
        {/* LEFT: Filter Panel */}
        <aside className="sr-filter-panel" style={{ position: 'sticky', top: 'calc(var(--nav-h) + 80px)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.5rem', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
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
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {Array(6).fill(0).map((_, i) => <SkeletonPropertyCard key={i}/>)}
            </div>
          ) : properties.length > 0 ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {properties.map((p, i) => (
                  <motion.div key={p._id || p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <PropertyCard {...p}/>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '3rem' }}>
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                    style={{ padding: '8px 16px', borderRadius: '10px', background: page > 1 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: page > 1 ? 'white' : 'rgba(255,255,255,0.3)', cursor: page > 1 ? 'pointer' : 'not-allowed', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ChevronLeft size={15}/> Prev
                  </button>
                  {Array.from({ length: Math.min(7, meta.totalPages) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        style={{ width: '36px', height: '36px', borderRadius: '8px', border: page === p ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', background: page === p ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.04)', color: page === p ? 'var(--gold)' : 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
                        {p}
                      </button>
                    );
                  })}
                  <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}
                    style={{ padding: '8px 16px', borderRadius: '10px', background: page < meta.totalPages ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: page < meta.totalPages ? 'white' : 'rgba(255,255,255,0.3)', cursor: page < meta.totalPages ? 'pointer' : 'not-allowed', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Next <ChevronRight size={15}/>
                  </button>
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
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showMobileFilter && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowMobileFilter(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(7,7,15,0.99)', borderRadius: '20px 20px 0 0', padding: '1.5rem', maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 800, color: 'white', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SlidersHorizontal size={16} style={{ color: 'var(--gold)' }}/> Search Filters
                </div>
                <button onClick={() => setShowMobileFilter(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16}/></button>
              </div>
              {filterPanel}
              <button onClick={() => setShowMobileFilter(false)} style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}>
                Show {meta.total} Results
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .sr-filter-label { color: rgba(255,255,255,0.5); font-size: 0.62rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 8px; }
        @media (max-width: 900px) {
          .sr-filter-panel { display: none !important; }
          .sr-mobile-filter-btn { display: flex !important; }
          .container > main { grid-column: 1; }
          .container { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .container { padding-bottom: 100px !important; }
        }
      `}</style>
    </div>
  );
}
