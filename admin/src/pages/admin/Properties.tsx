import { usePropertyManager } from './properties/usePropertyManager';
import { PropertiesList } from './properties/PropertiesList';
import { PropertyForm } from './properties/PropertyForm';
import { AnimatePresence } from 'framer-motion';
import { Plus, Share2, Building, TreePine } from 'lucide-react';
import { formatSnapAddaPrice } from '../../utils/priceUtils';
import { ConnectivityBanner } from '../../components/ui/ConnectivityBanner';
import { fetchRealtors } from '../../services/api';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AdminProperties = () => {
  const manager = usePropertyManager();
  const [realtors, setRealtors] = useState<any[]>([]);

  useEffect(() => {
    fetchRealtors()
      .then(setRealtors)
      .catch(() => setRealtors([]));
  }, []);

  const handleShare = () => {
    const url = 'https://snapadda.com/post-property';
    navigator.clipboard.writeText(`List your property for FREE on SnapAdda. Fast, secure, and easy!\n${url}`);
    toast.success('Link copied! Ready to share. 🔗');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <ConnectivityBanner />
      
      <div style={{ background: 'rgba(155,89,245,0.05)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(155,89,245,0.1)', marginBottom: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--violet)', fontWeight: 600 }}>
          💡 <strong>Tip:</strong> Managed assets are synchronized across the spatial grid. New listings appear instantly to verified clients.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2rem', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.5rem' }}>✦ ASSET REGISTRY</div>
          <h1 style={{ fontWeight: 900, color: 'white', margin: 0 }}>Inventory Hub</h1>
        </div>
        
        {!manager.isAdding && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={handleShare} style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Share2 size={14} /> SHARE LINK
            </button>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
            <button onClick={() => { manager.setLiveData({ type: 'Apartment' }); manager.setIsAdding(true); }} style={{ padding: '10px 16px', borderRadius: '12px', background: 'rgba(155,89,245,0.1)', color: 'var(--violet)', border: '1px solid rgba(155,89,245,0.2)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building size={14} /> + FLAT
            </button>
            <button onClick={() => { manager.setLiveData({ type: 'Agricultural Land' }); manager.setIsAdding(true); }} style={{ padding: '10px 16px', borderRadius: '12px', background: 'rgba(16,217,140,0.1)', color: 'var(--emerald)', border: '1px solid rgba(16,217,140,0.2)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TreePine size={14} /> + LAND
            </button>
            <button onClick={() => manager.setIsAdding(true)} style={{ padding: '10px 24px', borderRadius: '12px', background: 'var(--gold)', color: 'black', border: 'none', fontSize: '0.85rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 20px rgba(232,184,75,0.2)' }}>
              <Plus size={18} /> ADD NEW
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {manager.isAdding ? (
          <PropertyForm 
            {...manager} 
            formatPriceAdminLocal={formatSnapAddaPrice}
            realtors={realtors}
          />
        ) : (
          <PropertiesList 
            filteredProperties={manager.filteredProperties}
            search={manager.search}
            setSearch={manager.setSearch}
            viewMode={manager.viewMode}
            setViewMode={manager.setViewMode}
            handleEdit={manager.handleEdit}
            updateProperty={manager.updateProperty}
            createProperty={manager.createProperty}
            loadProperties={manager.loadProperties}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProperties;
