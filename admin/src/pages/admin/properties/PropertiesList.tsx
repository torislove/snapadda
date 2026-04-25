import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, List, MapPin, CheckCircle2, Edit3, Trash2, Zap } from 'lucide-react';
import { LivePreviewCard } from '../../../components/ui/LivePreviewCard';
import { AssetEngagementChart, ListingHealthScore } from './PropertyAnalytics';
import { getFuzzySuggestions } from '../../../services/SearchParser';

interface PropertiesListProps {
  filteredProperties: any[];
  search: string;
  setSearch: (s: string) => void;
  viewMode: 'grid' | 'cards';
  setViewMode: (v: 'grid' | 'cards') => void;
  handleEdit: (prop: any) => void;
  updateProperty: (id: string, payload: any) => Promise<any>;
  deleteProperty: (id: string) => Promise<any>;
  loadProperties: () => void;
}

export const PropertiesList: React.FC<PropertiesListProps> = ({ 
  filteredProperties, search, setSearch, viewMode, setViewMode, 
  handleEdit, updateProperty, deleteProperty, loadProperties 
}) => {
  return (
    <motion.div 
      key="list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* Toolbar */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
        <div style={{ position: 'relative', width: 'clamp(300px, 40vw, 500px)' }}>
          <Search 
            size={18} 
            style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(212,175,55,0.8)' }} 
          />
          <input 
            type="text" 
            placeholder="Search assets (e.g. 'Flat in Guntur 50L')..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.9rem 1.2rem 0.9rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '14px', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
          {search.length >= 2 && getFuzzySuggestions(search).length > 0 && (
            <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'rgba(7,7,15,0.95)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', zIndex: 100, overflow: 'hidden', backdropFilter: 'blur(15px)' }}>
              <div style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 800, background: 'rgba(212,175,55,0.05)', letterSpacing: '0.1em' }}>SUGGESTED ASSET LOCATIONS</div>
              {getFuzzySuggestions(search).map((s: any) => (
                <button 
                  key={`${s.name}-${s.type}`}
                  onClick={() => setSearch(s.name)}
                  style={{ width: '100%', padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  <MapPin size={14} style={{ color: 'var(--gold)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', color: '#fff' }}>{s.name}</span>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{s.type} • {s.district || 'Andhra'}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '15px' }}>
          {[
            { id: 'cards', icon: LayoutGrid },
            { id: 'grid', icon: List }
          ].map(mode => (
            <button 
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)} 
              style={{ 
                background: viewMode === mode.id ? 'rgba(255,255,255,0.1)' : 'transparent', 
                border: 'none', padding: '0.6rem 0.8rem', borderRadius: '10px', 
                color: viewMode === mode.id ? 'white' : 'var(--text-muted)', 
                cursor: 'pointer', transition: 'all 0.2s' 
              }}
            >
              <mode.icon size={20} />
            </button>
          ))}
        </div>
      </div>

      {/* Asset List */}
      <div className="admin-properties-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: viewMode === 'grid' ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '1.5rem' 
      }}>
        <AnimatePresence>
          {filteredProperties.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '5rem', textAlign: 'center', opacity: 0.2 }}>
              <LayoutGrid size={60} style={{ marginBottom: '1rem' }} />
              <p>No assets found in current sector.</p>
            </div>
          ) : (
            filteredProperties.map((prop) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={prop._id || prop.id}
                style={{ position: 'relative' }}
              >
                <LivePreviewCard {...prop} />
                <ListingHealthScore prop={prop} />
                <AssetEngagementChart views={prop.views} likes={prop.likeCount} />
                <div style={{ position: 'absolute', top: 0, right: 0, margin: '15px', zIndex: 100, display: 'flex', gap: '8px' }}>
                  {prop.status !== 'Sold' && (
                    <button 
                      onClick={() => updateProperty(prop._id || prop.id, { ...prop, status: 'Sold' }).then(loadProperties)} 
                      style={{ background: 'rgba(16,217,140,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(16,217,140,0.4)', padding: '10px', borderRadius: '50%', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} 
                      title="Mark as SOLD"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                  <button onClick={() => handleEdit(prop)} style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', borderRadius: '50%', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} title="Edit">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => { if(window.confirm('Wipe asset data?')) deleteProperty(prop._id || prop.id).then(loadProperties); }} style={{ background: 'rgba(245,57,123,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(245,57,123,0.4)', padding: '10px', borderRadius: '50%', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} title="Delete">
                    <Trash2 size={18} />
                  </button>
                  <a 
                    href={`https://snapadda-7a6e6.web.app/property/${prop._id || prop.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ background: 'var(--gold)', backdropFilter: 'blur(10px)', border: '1px solid var(--gold)', padding: '10px', borderRadius: '50%', color: 'var(--midnight)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                    title="Launch to Site"
                  >
                    <Zap size={18} fill="currentColor" />
                  </a>
                </div>
                {prop.status === 'Sold' && (
                  <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 101, background: 'rgba(16,217,140,0.9)', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.1em', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                    SOLD OUT
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
