import { useRef, useEffect } from 'react';
import { SlidersHorizontal, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const DEFAULT_FILTERS = {
  bhk: '', minPrice: '', maxPrice: '', facing: 'Any', furnishing: 'N/A',
  constructionStatus: 'N/A', verified: false, approval: 'All',
  propertyType: 'All', keyword: '', vastu: false, listerType: 'All',
  highwayFrontage: false
};

export default function FilterSidebar({ isOpen, onClose, filters, setFilters, onApply }) {
  const { t } = useTranslation();
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        if (sidebarRef.current) sidebarRef.current.scrollTop = 0;
        if (contentRef.current) contentRef.current.scrollTop = 0;
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const set = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  const handleClearAll = () => {
    setFilters({ ...DEFAULT_FILTERS });
  };

  const toggleStyle = (active) => ({
    flex: 1,
    fontSize: '0.72rem',
    padding: '12px 10px',
    background: active 
      ? 'linear-gradient(135deg, rgba(232,184,75,0.95), rgba(185,147,58,0.7))' 
      : 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: active 
      ? '0 10px 25px rgba(232,184,75,0.4), inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.3)' 
      : 'inset 0 1px 1px rgba(255,255,255,0.05), 0 5px 15px rgba(0,0,0,0.2)',
    color: active ? '#000' : 'rgba(255,255,255,0.6)',
    border: active ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    transform: active ? 'translateY(-1px)' : 'translateY(0)',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="filter-sidebar-overlay open"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 9999, 
            background: 'rgba(5,5,15,0.85)', 
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <motion.div
            ref={sidebarRef}
            className="filter-sidebar"
            onClick={e => e.stopPropagation()}
            initial={window.innerWidth <= 600 ? { x: '100%', opacity: 1 } : { scale: 0.9, opacity: 0 }}
            animate={window.innerWidth <= 600 ? { x: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
            exit={window.innerWidth <= 600 ? { x: '100%', opacity: 1 } : { scale: 0.9, opacity: 0 }}
            transition={window.innerWidth <= 600 ? { type: 'tween', duration: 0.25 } : { type: 'spring', damping: 25, stiffness: 350 }}
            style={{
              background: 'rgba(10,10,20,0.95)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              border: '1px solid rgba(212,175,55,0.4)',
              borderRadius: window.innerWidth <= 600 ? '0' : '28px',
              width: window.innerWidth <= 600 ? '100vw' : '100%',
              maxWidth: '480px',
              height: window.innerWidth <= 600 ? '100vh' : 'auto',
              maxHeight: window.innerWidth <= 600 ? '100vh' : '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 40px 100px rgba(0,0,0,0.9)',
              overflow: 'hidden',
              position: window.innerWidth <= 600 ? 'fixed' : 'relative',
              top: 0,
              right: 0
            }}
          >
            {/* Header */}
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(212,175,55,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <button
                onClick={onClose}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', padding: '8px 14px', borderRadius: '10px', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', touchAction: 'manipulation' }}
              >
                <ArrowLeft size={15} /> {t('filter.back')}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={16} style={{ color: 'var(--gold)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>{t('filter.title')}</h3>
              </div>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px', touchAction: 'manipulation' }}>
                <X size={20} />
              </button>
            </div>

            {/* Scrollable content */}
            <div
              ref={contentRef}
              style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}
            >
              {/* Keywords */}
              <div className="filter-card-elite">
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>{t('filter.keywords')}</label>
                <input
                  type="text"
                  className="dropdown-3d-glass"
                  placeholder="e.g. Pool, Gated, CRDA..."
                  value={filters.keyword || ''}
                  onChange={e => set('keyword', e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              {/* Category + Budget max */}
              <div className="filter-card-elite">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>{t('filter.category')}</label>
                    <select
                      className="dropdown-3d-glass"
                      value={filters.propertyType || 'All'}
                      onChange={e => set('propertyType', e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="All">{t('filter.items')}</option>
                      <option value="Apartment">Apartment / Flat</option>
                      <option value="Independent House">Independent House</option>
                      <option value="Villa">Villa / Duplex</option>
                      <option value="Residential Plot">Residential Plot</option>
                      <option value="Gated Community Plot">Gated Plot</option>
                      <option value="CRDA Approved Plot">CRDA Plot</option>
                      <option value="Open Plot">Open Plot</option>
                      <option value="Layout Plot">Layout Plot</option>
                      <option value="Commercial Plot">Commercial Plot</option>
                      <option value="Commercial Space">Commercial Space</option>
                      <option value="Office Space">Office Space</option>
                      <option value="Showroom">Showroom / Retail</option>
                      <option value="Agricultural Land">Agricultural Land</option>
                      <option value="Farmhouse">Farmhouse / Farm Villa</option>
                      <option value="Industrial Shed">Industrial Shed</option>
                      <option value="Warehouse">Warehouse</option>
                      <option value="Factory">Factory</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>{t('filter.budgetMax')}</label>
                    <input
                      type="number"
                      className="dropdown-3d-glass"
                      placeholder="e.g. 5000000"
                      value={filters.maxPrice}
                      onChange={e => set('maxPrice', e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Facing + Approval */}
              <div className="filter-card-elite">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>{t('filter.facing')}</label>
                    <select
                      className="dropdown-3d-glass"
                      value={filters.facing}
                      onChange={e => set('facing', e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="Any">{t('filter.any')}</option>
                      <option value="East">East</option>
                      <option value="North">North</option>
                      <option value="West">West</option>
                      <option value="South">South</option>
                      <option value="North-East">North-East</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>{t('filter.approval')}</label>
                    <select
                      className="dropdown-3d-glass"
                      value={filters.approval || 'All'}
                      onChange={e => set('approval', e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="All">{t('filter.any')}</option>
                      <option value="AP CRDA">AP CRDA</option>
                      <option value="AP RERA">AP RERA</option>
                      <option value="VMRDA">VMRDA</option>
                      <option value="DTCP">DTCP</option>
                      <option value="TUDA">TUDA</option>
                      <option value="Panchayat">Panchayat</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Toggle Buttons */}
              <div className="filter-card-elite">
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>PROPERTY FLAGS</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <button
                    style={toggleStyle(filters.vastu)}
                    onClick={() => set('vastu', !filters.vastu)}
                    type="button"
                  >
                    🧭 {t('filter.vastu')}
                  </button>
                  <button
                    style={toggleStyle(filters.verified)}
                    onClick={() => set('verified', !filters.verified)}
                    type="button"
                  >
                    ⭐ {t('filter.elite')}
                  </button>
                  <button
                    style={toggleStyle(filters.highwayFrontage)}
                    onClick={() => set('highwayFrontage', !filters.highwayFrontage)}
                    type="button"
                  >
                    🛣️ HIGHWAY FRONT
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '10px', flexShrink: 0 }}>
              <button
                onClick={handleClearAll}
                className="btn-3d-glass-dark"
                style={{ flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, touchAction: 'manipulation' }}
              >
                {t('filter.clearAll')}
              </button>
              <button
                onClick={onApply}
                className="btn-3d-glass"
                style={{ flex: 2, padding: '12px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.82rem', touchAction: 'manipulation' }}
              >
                {t('filter.apply')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
