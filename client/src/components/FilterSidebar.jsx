import { useRef, useEffect } from 'react';
import { SlidersHorizontal, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const DEFAULT_FILTERS = { bhk: '', minPrice: '', maxPrice: '', facing: 'Any', furnishing: 'N/A', constructionStatus: 'N/A', verified: false, approval: 'All', propertyType: 'All', keyword: '', vastu: false, listerType: 'All' };

export default function FilterSidebar({ isOpen, onClose, filters, setFilters, onApply }) {
  const { t } = useTranslation();
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);

  // Always scroll sidebar and content back to very top when opened
  useEffect(() => {
    if (isOpen) {
      // Scroll after animation frame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (sidebarRef.current) sidebarRef.current.scrollTop = 0;
        if (contentRef.current) contentRef.current.scrollTop = 0;
      });
    }
  }, [isOpen]);

  // Lock body scroll when filter is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const set = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

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
        >
          <motion.div
            ref={sidebarRef}
            className="filter-sidebar"
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.92, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Header with 3D BACK Button */}
            <div className="filter-header" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
              <button 
                onClick={onClose} 
                className="btn-3d-elite" 
                style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.7rem' }}
              >
                <ArrowLeft size={16} /> {t('filter.back')}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={16} className="text-gold" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{t('filter.title')}</h3>
              </div>
            </div>

            {/* Compact content area */}
            <div className="filter-content" style={{ padding: '16px 20px', gap: '16px', overflow: 'hidden' }}>
              <div className="filter-group">
                <label style={{ color: '#fff', fontSize: '0.65rem' }}>{t('filter.keywords')}</label>
                <input 
                  type="text" 
                  className="dropdown-3d-glass"
                  placeholder="e.g. Pool, Gated..." 
                  value={filters.keyword || ''} 
                  onChange={e => set('keyword', e.target.value)} 
                  style={{ width: '100%' }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="filter-group">
                  <label style={{ color: '#fff', fontSize: '0.65rem' }}>{t('filter.category')}</label>
                  <select 
                    className="dropdown-3d-glass"
                    value={filters.propertyType || 'All'} 
                    onChange={e => set('propertyType', e.target.value)}
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

                <div className="filter-group">
                  <label style={{ color: '#fff', fontSize: '0.65rem' }}>{t('filter.budgetMax')}</label>
                  <input 
                    type="number" 
                    className="dropdown-3d-glass"
                    placeholder="Max" 
                    value={filters.maxPrice} 
                    onChange={e => set('maxPrice', e.target.value)} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="filter-group">
                  <label style={{ color: '#fff', fontSize: '0.65rem' }}>{t('filter.facing')}</label>
                  <select 
                    className="dropdown-3d-glass"
                    value={filters.facing} 
                    onChange={e => set('facing', e.target.value)}
                  >
                    <option value="Any">Any</option>
                    <option value="East">East</option>
                    <option value="North">North</option>
                    <option value="West">West</option>
                    <option value="South">South</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label style={{ color: '#fff', fontSize: '0.65rem' }}>{t('filter.approval')}</label>
                  <select 
                    className="dropdown-3d-glass"
                    value={filters.approval || 'All'} 
                    onChange={e => set('approval', e.target.value)}
                  >
                    <option value="All">Any</option>
                    <option value="AP CRDA">AP CRDA</option>
                    <option value="AP RERA">AP RERA</option>
                    <option value="DTCP">DTCP</option>
                  </select>
                </div>
              </div>

              <div className="filter-group">
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className={`btn-3d-elite ${filters.vastu ? 'active' : ''}`} 
                    onClick={() => set('vastu', !filters.vastu)}
                    style={{ flex: 1, fontSize: '0.7rem', padding: '10px', background: filters.vastu ? 'var(--gold)' : '' }}
                  >
                    {t('filter.vastu')}
                  </button>
                  <button 
                    className={`btn-3d-elite ${filters.verified ? 'active' : ''}`} 
                    onClick={() => set('verified', !filters.verified)}
                    style={{ flex: 1, fontSize: '0.7rem', padding: '10px', background: filters.verified ? 'var(--gold)' : '' }}
                  >
                    {t('filter.elite')}
                  </button>
                </div>
              </div>
            </div>

            <div className="filter-footer" style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button 
                className="btn-3d-elite" 
                style={{ flex: 1, padding: '12px', background: 'var(--gold)', color: '#000' }} 
                onClick={onApply}
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
