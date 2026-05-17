import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Filter, ChevronRight, SlidersHorizontal, 
  IndianRupee, Building, MapPin, ShieldCheck, 
  Compass, LayoutGrid, CheckCircle2, Navigation2
} from 'lucide-react';

const TABS = [
  { id: 'essentials', label: 'Basics', icon: <Building size={16}/> },
  { id: 'budget', label: 'Price', icon: <IndianRupee size={16}/> },
  { id: 'location', label: 'Area', icon: <MapPin size={16}/> },
  { id: 'advanced', label: 'Elite', icon: <ShieldCheck size={16}/> },
];

export default function FilterDrawer({ 
  isOpen, 
  onClose, 
  filters, 
  setFilter, 
  totalMatches, 
  onApply,
  propertyTypes = [],
  budgetPresets = []
}) {
  const [activeTab, setActiveTab] = useState('essentials');

  const containerVariants = {
    hidden: { y: '100%', opacity: 1 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', damping: 25, stiffness: 350 }
    },
    exit: { 
      y: '100%', 
      opacity: 1,
      transition: { type: 'tween', duration: 0.3, ease: 'easeInOut' }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'essentials':
        return (
          <motion.div key="essentials" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="drawer-tab-pane">
            <label className="drawer-section-label">Property Category</label>
            <div className="drawer-pill-grid">
              {propertyTypes.map(t => (
                <button 
                  key={t.value} 
                  onClick={() => setFilter('type', t.value)}
                  className={`drawer-pill ${filters.type === t.value ? 'active' : ''}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <label className="drawer-section-label" style={{ marginTop: '1.5rem' }}>BHK Requirement</label>
            <div className="drawer-pill-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {['1', '2', '3', '4+'].map(b => (
                <button 
                  key={b} 
                  onClick={() => setFilter('bhk', b)}
                  className={`drawer-pill ${filters.bhk === b ? 'active' : ''}`}
                >
                  {b} BHK
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 'budget':
        return (
          <motion.div key="budget" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="drawer-tab-pane">
            <label className="drawer-section-label">Price Range</label>
            <div className="drawer-pill-grid">
              {budgetPresets.map(b => (
                <button 
                  key={b.label} 
                  onClick={() => { setFilter('minPrice', b.min); setFilter('maxPrice', b.max); }}
                  className={`drawer-pill ${filters.minPrice === b.min && filters.maxPrice === b.max ? 'active' : ''}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            
            <div className="drawer-budget-inputs">
              <div className="drawer-input-group">
                <span>₹</span>
                <input 
                  type="number" placeholder="Min Price" 
                  value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value)} 
                />
              </div>
              <div className="drawer-input-group">
                <span>₹</span>
                <input 
                  type="number" placeholder="Max Price" 
                  value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)} 
                />
              </div>
            </div>
          </motion.div>
        );
      case 'location':
        return (
          <motion.div key="location" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="drawer-tab-pane">
            <label className="drawer-section-label">Target City / Area</label>
            <div className="drawer-search-box">
              <MapPin size={18} />
              <input 
                type="text" placeholder="Enter location name..." 
                value={filters.keyword} onChange={e => setFilter('keyword', e.target.value)} 
              />
            </div>
            
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <div className="drawer-location-badge">
                <Navigation2 size={14} /> USE CURRENT LOCATION
              </div>
            </div>
          </motion.div>
        );
      case 'advanced':
        return (
          <motion.div key="advanced" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="drawer-tab-pane">
            <label className="drawer-section-label">Orientation & Compliance</label>
            <div className="drawer-pill-grid">
              {['East', 'North', 'West', 'South'].map(f => (
                <button 
                  key={f} onClick={() => setFilter('facing', f)}
                  className={`drawer-pill ${filters.facing === f ? 'active' : ''}`}
                >
                  {f} Facing
                </button>
              ))}
            </div>

            <div className="drawer-toggle-row">
               <button onClick={() => setFilter('vastu', !filters.vastu)} className={`drawer-toggle-btn ${filters.vastu ? 'active' : ''}`}>
                 <Compass size={16} /> Vastu Compliant
               </button>
               <button onClick={() => setFilter('verified', !filters.verified)} className={`drawer-toggle-btn ${filters.verified ? 'active' : ''}`}>
                 <CheckCircle2 size={16} /> Verified Only
               </button>
            </div>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div key="drawer-root">
        <motion.div 
          className="drawer-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end' }}
        >
          <motion.div 
            className="drawer-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
            drag="y"
            dragConstraints={{ top: 0 }}
            onDragEnd={(e, info) => { if (info.offset.y > 100) onClose(); }}
            style={{ 
              width: '100%', 
              background: '#0a0a0f',
              backgroundImage: 'radial-gradient(circle at top, rgba(232,184,75,0.05) 0%, transparent 50%)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '32px 32px 0 0',
              padding: '1.5rem',
              position: 'relative',
              maxHeight: '85vh',
              display: 'flex', 
              flexDirection: 'column',
              boxShadow: '0 -20px 100px rgba(0,0,0,0.8)',
              overflow: 'hidden'
            }}
          >
            {/* Handle */}
            <div style={{ width: '40px', height: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', margin: '0 auto 1.5rem', flexShrink: 0 }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 900, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.01em' }}>
                <SlidersHorizontal size={18} color="var(--gold)" />
                <span>Advanced Filters</span>
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
              {TABS.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '4px', padding: '10px 5px', border: 'none', 
                    background: activeTab === tab.id ? 'rgba(232,184,75,0.1)' : 'transparent', 
                    color: activeTab === tab.id ? 'var(--gold)' : 'rgba(255,255,255,0.4)', 
                    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s'
                  }}
                >
                  {tab.icon}
                  <span style={{ fontSize: '0.62rem', fontStretch: 'condensed', fontWeight: 900, textTransform: 'uppercase' }}>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '1rem' }} className="hide-scrollbar">
              <AnimatePresence mode="wait">
                {renderTabContent()}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', gap: '12px', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
              <button onClick={() => onApply(true)} style={{ padding: '15px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: rgba(255,255,255,0.5), fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>Reset</button>
              <button 
                onClick={onClose} 
                style={{ 
                  flex: 1, padding: '15px', borderRadius: '16px', border: 'none',
                  background: 'linear-gradient(135deg, var(--gold) 0%, #d4a030 100%)',
                  color: '#000', fontWeight: 950, fontSize: '0.9rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justify_content: 'center', gap: '8px',
                  boxShadow: '0 10px 30px rgba(232,184,75,0.3)'
                }}
              >
                SHOW {totalMatches} RESULTS <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        </motion.div>
        </div>
      )}
      <style>{`
        .drawer-pill-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .drawer-pill { padding: 12px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.6); font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; text-align: left; }
        .drawer-pill.active { background: rgba(232,184,75,0.12); border-color: var(--gold); color: var(--gold); }
        .drawer-section-label { display: block; font-size: 0.65rem; font-weight: 900; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.8rem; }
        .drawer-budget-inputs { display: flex; gap: 10px; margin-top: 1.5rem; }
        .drawer-input-group { flex: 1; display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 12px; }
        .drawer-input-group span { color: rgba(232,184,75,0.4); font-weight: 900; }
        .drawer-input-group input { background: transparent; border: none; color: #fff; width: 100%; outline: none; font-weight: 700; font-size: 0.9rem; }
        .drawer-toggle-row { display: flex; flex-direction: column; gap: 10px; margin-top: 1rem; }
        .drawer-toggle-btn { display: flex; align-items: center; gap: 12px; padding: 15px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.6); font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.3s; }
        .drawer-toggle-btn.active { background: rgba(232,184,75,0.1); border-color: var(--gold); color: #fff; }
        .drawer-search-box { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 15px; color: var(--gold); }
        .drawer-search-box input { background: transparent; border: none; color: #fff; width: 100%; outline: none; font-weight: 600; }
        .drawer-location-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(232,184,75,0.1); color: var(--gold); padding: 8px 16px; border-radius: 50px; font-size: 0.65rem; font-weight: 900; border: 1px solid rgba(232,184,75,0.2); margin-top: 1rem; }
      `}</style>
    </AnimatePresence>
  );
}

function rgba(r, g, b, a) { return `rgba(${r},${g},${b},${a})`; }
