import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, List, Plus } from 'lucide-react';
import { AdminPropertyCard } from '../../../components/ui/AdminPropertyCard';

interface PropertiesListProps {
  filteredProperties: any[];
  search: string;
  setSearch: (s: string) => void;
  viewMode: 'grid' | 'cards';
  setViewMode: (v: 'grid' | 'cards') => void;
  handleEdit: (prop: any) => void;
  updateProperty: (id: string, payload: any) => Promise<any>;
  createProperty: (payload: any) => Promise<any>;
  deleteProperty: (id: string) => Promise<any>;
  loadProperties: () => void;
  setIsAdding?: (v: boolean) => void;
}

export const PropertiesList: React.FC<PropertiesListProps> = ({
  filteredProperties, search, setSearch, viewMode, setViewMode,
  handleEdit, updateProperty, createProperty, deleteProperty, loadProperties, setIsAdding
}) => {
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
    } catch (e) {
      console.error(e);
      alert("Bulk update failed partially.");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || isBulkUpdating) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} properties?`)) return;
    setIsBulkUpdating(true);
    try {
      await Promise.all(selectedIds.map(id => deleteProperty(id)));
      setSelectedIds([]);
      loadProperties();
    } catch (e) {
      console.error(e);
      alert("Bulk delete failed partially.");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const finalFiltered = React.useMemo(() => {
    if (statusFilter === 'all') return filteredProperties;
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
      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="glass-card" style={{ padding: '1rem 2rem', background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.3)', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--gold)', color: 'black', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>
                  {selectedIds.length}
                </div>
                <div style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>ASSETS SELECTED</div>
                <button onClick={() => setSelectedIds([])} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>Deselect All</button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, alignSelf: 'center', marginRight: '10px' }}>BULK ACTIONS:</span>
                <button onClick={() => handleBulkStatus('Active')} disabled={isBulkUpdating} style={{ background: 'rgba(16,217,140,0.1)', border: '1px solid rgba(16,217,140,0.3)', color: '#10d98c', padding: '8px 16px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>SET LIVE</button>
                <button onClick={() => handleBulkStatus('Sold')} disabled={isBulkUpdating} style={{ background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.3)', color: 'var(--gold)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>SET SOLD</button>
                <button onClick={() => handleBulkStatus('Draft')} disabled={isBulkUpdating} style={{ background: 'rgba(155,89,245,0.1)', border: '1px solid rgba(155,89,245,0.3)', color: '#9b59f5', padding: '8px 16px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>SET DRAFT</button>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 5px' }} />
                <button onClick={handleBulkDelete} disabled={isBulkUpdating} style={{ background: 'rgba(245,57,123,0.1)', border: '1px solid rgba(245,57,123,0.3)', color: '#f5397b', padding: '8px 16px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>DELETE ALL</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toolbar */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderRadius: '18px' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(212,175,55,0.8)' }}
            />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '12px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          {/* Status Filters */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {['all', 'Active', 'Sold', 'Pending', 'Draft'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                style={{
                  padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                  background: statusFilter === f ? 'rgba(212,175,55,0.15)' : 'transparent',
                  color: statusFilter === f ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.2s'
                }}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
            {finalFiltered.length} matching
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px' }}>
            {[
              { id: 'cards', icon: LayoutGrid },
              { id: 'grid', icon: List }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                style={{
                  background: viewMode === mode.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                  border: 'none', padding: '6px 8px', borderRadius: '8px',
                  color: viewMode === mode.id ? 'white' : 'rgba(255,255,255,0.3)',
                  cursor: 'pointer'
                }}
              >
                <mode.icon size={16} />
              </button>
            ))}
          </div>

          {setIsAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="desktop-only-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--gold, #e8b84b)', color: '#07070f', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(232,184,75,0.2)' }}
            >
              <Plus size={14} /> NEW ASSET
            </button>
          )}

          {/* Mobile-only FAB (Floating Action Button) */}
          {setIsAdding && (
            <motion.button
              className="mobile-only-btn"
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsAdding(true)}
              style={{
                position: 'fixed', bottom: '20px', right: '20px',
                width: '60px', height: '60px', borderRadius: '30px',
                background: 'linear-gradient(135deg, #e8b84b, #b9933a)',
                color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.4)', zIndex: 1000, border: 'none', cursor: 'pointer'
              }}
            >
              <Plus size={32} strokeWidth={2.5} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Property Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: viewMode === 'grid'
          ? '1fr'
          : 'repeat(auto-fill, minmax(310px, 1fr))',
        gap: '1.5rem'
      }}>
        <AnimatePresence>
          {finalFiltered.length === 0 ? (
            <div key="empty" style={{ gridColumn: '1 / -1', padding: '5rem', textAlign: 'center', opacity: 0.15 }}>
              <LayoutGrid size={56} style={{ marginBottom: '1rem' }} />
              <p>No properties match your filter.</p>
            </div>
          ) : (
            finalFiltered.map((prop) => (
              <AdminPropertyCard
                key={prop._id || prop.id}
                prop={prop}
                handleEdit={handleEdit}
                updateProperty={updateProperty}
                createProperty={createProperty}
                deleteProperty={deleteProperty}
                loadProperties={loadProperties}
                selected={selectedIds.includes(prop._id || prop.id)}
                onSelect={toggleSelect}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
