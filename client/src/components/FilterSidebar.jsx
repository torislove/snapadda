import { useRef, useEffect } from 'react';
import { SlidersHorizontal, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const DEFAULT_FILTERS = {
  bhk: '', minPrice: '', maxPrice: '', facing: 'Any', furnishing: 'N/A',
  constructionStatus: 'N/A', verified: false, approval: 'All',
  propertyType: 'All', keyword: '', vastu: false, listerType: 'All'
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
    padding: '11px 8px',
    background: active ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
    color: active ? '#000' : 'rgba(255,255,255,0.8)',
    border: active ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: active ? 800 : 600,
    transition: 'all 0.2s ease',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            style={{
              background: 'rgba(12,12,24,0.98)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '480px',
              height: 'auto',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.1)',
              overflow: 'hidden',
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
              style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}
            >
              {/* Keywords */}
              <div>
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
                    <option value="Apartment">Apartment</option>
                    <option value="Independent House">House</option>
                    <option value="Villa">{t('types.villa')}</option>
                    <option value="Residential Plot">{t('types.plot')}</option>
                    <option value="Commercial Plot">Comm. Plot</option>
                    <option value="Agricultural Land">{t('types.agriculture')}</option>
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

              {/* Facing + Approval */}
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

              {/* Toggle Buttons */}
              <div>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>PROPERTY FLAGS</label>
                <div style={{ display: 'flex', gap: '10px' }}>
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
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '10px', flexShrink: 0 }}>
              <button
                onClick={handleClearAll}
                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderRadius: '12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, touchAction: 'manipulation' }}
              >
                {t('filter.clearAll')}
              </button>
              <button
                onClick={onApply}
                style={{ flex: 2, padding: '12px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 800, touchAction: 'manipulation' }}
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
