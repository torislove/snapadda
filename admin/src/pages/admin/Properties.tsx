import { usePropertyManager } from './properties/usePropertyManager';
import { PropertiesList } from './properties/PropertiesList';
import { PropertyForm } from './properties/PropertyForm';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { formatSnapAddaPrice } from '../../utils/priceUtils';
import { ConnectivityBanner } from '../../components/ui/ConnectivityBanner';

const AdminProperties = () => {
  const manager = usePropertyManager();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Connectivity status — shown only when degraded */}
      <ConnectivityBanner />
      
      {/* Header Section */}
      <div className="flex-row-mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.18em', color: 'var(--gold)', marginBottom: '0.6rem', fontFamily: 'var(--font-mono)' }}>✦ ASSET INTELLIGENCE</div>
          <h1 style={{ lineHeight: 1.2, fontWeight: 800, background: 'linear-gradient(135deg,#fff,#9b59f5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
            Property Command
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px' }}>Simple management of property assets across the SnapAdda regional network.</p>
        </div>
        {!manager.isAdding && (
          <div className="flex-row-mobile-stack" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => { manager.setLiveData({ type: 'Apartment' }); manager.setIsAdding(true); }}
              className="btn btn-ghost" 
              style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid var(--violet)', color: 'var(--violet)' }}
            >
              + ADD FLAT
            </button>
            <button 
              onClick={() => { manager.setLiveData({ type: 'Agricultural Land' }); manager.setIsAdding(true); }}
              className="btn btn-ghost" 
              style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid var(--emerald)', color: 'var(--emerald)' }}
            >
              + ADD LAND
            </button>
            <button 
              onClick={() => manager.setIsAdding(true)}
              className="btn btn-violet btn-3d-liquid" 
              style={{ padding: '0.85rem 2.5rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 900, boxShadow: '0 15px 35px rgba(155,89,245,0.3)', background: 'var(--violet)' }}
            >
              <Plus size={22} /> CREATE NEW ASSET
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {manager.isAdding ? (
          <PropertyForm 
            {...manager} 
            formatPriceAdminLocal={formatSnapAddaPrice}
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
            deleteProperty={manager.deleteProperty}
            loadProperties={manager.loadProperties}
            setIsAdding={manager.setIsAdding}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProperties;
