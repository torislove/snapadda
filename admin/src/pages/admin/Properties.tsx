import { usePropertyManager } from './properties/usePropertyManager';
import { PropertiesList } from './properties/PropertiesList';
import { PropertyForm } from './properties/PropertyForm';
import { AnimatePresence } from 'framer-motion';
import { Plus, Share2 } from 'lucide-react';
import { formatSnapAddaPrice } from '../../utils/priceUtils';
import { ConnectivityBanner } from '../../components/ui/ConnectivityBanner';
import { fetchRealtors } from '../../services/api';
import { useState, useEffect } from 'react';

const AdminProperties = () => {
  const manager = usePropertyManager();
  const [realtors, setRealtors] = useState<any[]>([]);

  useEffect(() => {
    fetchRealtors()
      .then(setRealtors)
      .catch(() => setRealtors([]));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Connectivity status — shown only when degraded */}
      <ConnectivityBanner />
      
      {/* Header Section */}
      <div style={{ background: 'rgba(155,89,245,0.05)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(155,89,245,0.1)', marginBottom: '2rem' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--violet)', fontWeight: 600 }}>
          💡 <strong>Help:</strong> On this page, you can manage all your real estate listings. You can add new properties, edit existing ones, or change their status (like marking them as "Sold").
        </p>
      </div>

      <div className="flex-row-mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.18em', color: 'var(--gold)', marginBottom: '0.6rem', fontFamily: 'var(--font-mono)' }}>✦ PROPERTY REGISTRY</div>
          <h1 style={{ 
            lineHeight: 1.2, 
            fontWeight: 800, 
            color: 'white',
            background: 'linear-gradient(135deg, #ffffff 0%, #9b59f5 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            fontFamily: 'var(--font-heading)', 
            letterSpacing: '-0.02em' 
          }}>
            All Assets
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px' }}>Unified view of all property assets across the SnapAdda network.</p>
        </div>
        {!manager.isAdding && (
          <div className="flex-row-mobile-stack" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => { manager.setLiveData({ type: 'Apartment' }); manager.setIsAdding(true); }}
              className="btn btn-ghost" 
              style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid var(--violet)', color: 'var(--violet)' }}
            >
              + NEW FLAT
            </button>
            <button 
              onClick={() => {
                const url = 'https://snapadda.com/post-property';
                navigator.clipboard.writeText(`List your property for FREE on SnapAdda. Fast, secure, and easy!\n${url}`);
                alert('Copied Shareable Link to clipboard!');
              }}
              className="btn btn-ghost" 
              style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid var(--gold)', color: 'var(--gold)', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <Share2 size={14} /> SHARE POST LINK
            </button>
            <button 
              onClick={() => { manager.setLiveData({ type: 'Agricultural Land' }); manager.setIsAdding(true); }}
              className="btn btn-ghost" 
              style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid var(--emerald)', color: 'var(--emerald)' }}
            >
              + NEW LAND
            </button>
            <button 
              onClick={() => manager.setIsAdding(true)}
              className="btn btn-violet btn-3d-liquid" 
              style={{ padding: '0.85rem 2.5rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 900, boxShadow: '0 15px 35px rgba(155,89,245,0.3)', background: 'var(--violet)' }}
            >
              <Plus size={22} /> ADD NEW
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
            setIsAdding={manager.setIsAdding}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProperties;
