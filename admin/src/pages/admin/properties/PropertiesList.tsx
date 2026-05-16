import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, List, RefreshCw, LayoutGrid } from 'lucide-react';
import { AdminPropertyCard } from '../../../components/ui/AdminPropertyCard';
import { useToast } from '../../../components/ui/Toast';

interface PropertiesListProps {
  filteredProperties: any[];
  search: string;
  setSearch: (s: string) => void;
  viewMode: 'grid' | 'cards';
  setViewMode: (v: 'grid' | 'cards') => void;
  handleEdit: (prop: any) => void;
  updateProperty: (id: string, payload: any) => Promise<any>;
  createProperty: (payload: any) => Promise<any>;
  loadProperties: () => void;
}

export const PropertiesList: React.FC<PropertiesListProps> = ({
  filteredProperties, search, setSearch, viewMode, setViewMode,
  handleEdit, updateProperty, createProperty, loadProperties
}) => {
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = React.useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkStatus = async (status: string) => {
    if (selectedIds.length === 0 || isBulkUpdating) return;
    setIsBulkUpdating(true);
    try {
      await Promise.all(selectedIds.map(id => updateProperty(id, { status })));
      setSelectedIds([]);
      loadProperties();
      showToast(`Successfully moved ${selectedIds.length} assets to ${status}.`);
    } catch {
      showToast('Partial failure in bulk synchronization.', 'error');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const finalFiltered = React.useMemo(() => {
    if (statusFilter === 'all') return filteredProperties;
    if (statusFilter === 'Pending Review') return filteredProperties.filter(p => p.verificationStatus === 'Draft');
    return filteredProperties.filter(p => p.status === statusFilter);
  }, [filteredProperties, statusFilter]);

  return (
    <motion.div
      key="list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="glass-card" style={{ padding: '1rem', background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.2)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--gold)', color: 'black', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.7rem' }}>
                  {selectedIds.length}
                </div>
                <div style={{ fontWeight: 800, color: 'white', fontSize: '0.85rem' }}>SELECTED</div>
                <button onClick={() => setSelectedIds([])} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>Cancel</button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleBulkStatus('Active')} disabled={isBulkUpdating} style={{ background: 'rgba(16,217,140,0.1)', border: '1px solid rgba(16,217,140,0.2)', color: '#10d98c', padding: '6px 14px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>SET LIVE</button>
                <button onClick={() => handleBulkStatus('Sold')} disabled={isBulkUpdating} style={{ background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.2)', color: 'var(--gold)', padding: '6px 14px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>SET SOLD</button>
                <button onClick={() => handleBulkStatus('Draft')} disabled={isBulkUpdating} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px 14px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>SET DRAFT</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card" style={{ padding: '1rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search inventory..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', outline: 'none' }}
              />
            </div>
            <button onClick={() => { loadProperties(); showToast('Inventory synchronized. 🔄'); }} style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}><RefreshCw size={16} /></button>
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {['all', 'Active', 'Sold', 'Pending', 'Draft'].map(f => (
                <button 
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  style={{ 
                    padding: '8px 16px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer',
                    background: statusFilter === f ? 'var(--violet)' : 'transparent',
                    color: statusFilter === f ? 'white' : 'var(--text-muted)',
                    border: 'none', whiteSpace: 'nowrap'
                  }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{finalFiltered.length} Assets Found</div>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px' }}>
          {[
            { id: 'cards', icon: LayoutGrid },
            { id: 'grid', icon: List }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              style={{
                background: viewMode === mode.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none', padding: '6px 10px', borderRadius: '8px',
                color: viewMode === mode.id ? 'white' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer'
              }}
            >
              <mode.icon size={16} />
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: viewMode === 'grid' ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem'
      }}>
        <AnimatePresence>
          {finalFiltered.map((prop) => (
            <AdminPropertyCard
              key={(prop._id || prop.id)?.toString()}
              prop={prop}
              handleEdit={handleEdit}
              updateProperty={updateProperty}
              createProperty={createProperty}
              loadProperties={loadProperties}
              selected={selectedIds.includes(prop._id || prop.id)}
              onSelect={toggleSelect}
            />
          ))}
        </AnimatePresence>
      </div>

      {finalFiltered.length === 0 && (
        <div style={{ padding: '6rem', textAlign: 'center', opacity: 0.2 }}>
          <LayoutGrid size={48} style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>No assets match your search.</div>
        </div>
      )}
    </motion.div>
  );
};
