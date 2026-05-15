import { usePropertyManager } from './properties/usePropertyManager';
import { PropertiesList } from './properties/PropertiesList';
import { PropertyForm } from './properties/PropertyForm';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, CheckCircle2 } from 'lucide-react';
import { formatSnapAddaPrice } from '../../utils/priceUtils';
import { ConnectivityBanner } from '../../components/ui/ConnectivityBanner';
import { useState, useEffect, useMemo } from 'react';
import { fetchRealtors } from '../../services/api';

const VerificationQueue = () => {

  const manager = usePropertyManager();
  const [realtors, setRealtors] = useState<any[]>([]);

  useEffect(() => {
    fetchRealtors()
      .then(setRealtors)
      .catch(() => setRealtors([]));
  }, []);

  // Filter for ONLY pending properties
  const pendingProperties = useMemo(() => {
    return manager.properties.filter((p: any) => p.status === 'Pending');
  }, [manager.properties]);

  const stats = {
    total: pendingProperties.length,
    urgent: pendingProperties.filter((p: any) => {
       const hours = (new Date().getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60);
       return hours > 24;
    }).length
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <ConnectivityBanner />
      <div style={{ background: 'rgba(155,89,245,0.05)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(155,89,245,0.1)', marginBottom: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--violet)', fontWeight: 600 }}>
          💡 <strong>Help:</strong> This is your "To-Do List" for new property requests. When other people (Realtors or Owners) submit properties to your site, they wait here for you to check and "Verify" them before they go live.
        </p>
      </div>
      <div className="flex-row-mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.18em', color: 'var(--violet)', marginBottom: '0.6rem', fontFamily: 'var(--font-mono)' }}>✦ QUALITY ASSURANCE</div>
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
            Verification Queue
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px' }}>Audit and approve property submissions from external Realtors and Owners.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ 
                background: 'rgba(155,89,245,0.05)', border: '1px solid rgba(155,89,245,0.2)', 
                padding: '0.75rem 1.25rem', borderRadius: '16px', textAlign: 'center'
            }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--violet)', textTransform: 'uppercase' }}>In Queue</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>{stats.total}</div>
            </div>
            {stats.urgent > 0 && (
                <div style={{ 
                    background: 'rgba(245,57,123,0.05)', border: '1px solid rgba(245,57,123,0.2)', 
                    padding: '0.75rem 1.25rem', borderRadius: '16px', textAlign: 'center'
                }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--rose)', textTransform: 'uppercase' }}>Overdue ({'>'}24h)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--rose)' }}>{stats.urgent}</div>
                </div>
            )}
        </div>
      </div>

      {pendingProperties.length === 0 && !manager.isAdding ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
                padding: '4rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', 
                borderRadius: '32px', border: '2px dashed rgba(255,255,255,0.05)'
            }}
          >
              <CheckCircle2 size={48} style={{ color: 'var(--emerald)', margin: '0 auto 1.5rem', opacity: 0.5 }} />
              <h2 style={{ color: 'white', fontWeight: 800, marginBottom: '0.5rem' }}>Queue is Clear</h2>
              <p style={{ color: 'var(--text-muted)' }}>All external submissions have been processed.</p>
          </motion.div>
      ) : (
        <AnimatePresence mode="wait">
            {manager.isAdding ? (
            <PropertyForm 
                {...manager} 
                formatPriceAdminLocal={formatSnapAddaPrice}
                realtors={realtors}
            />
            ) : (
            <PropertiesList 
                filteredProperties={pendingProperties}
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
      )}

      {!manager.isAdding && pendingProperties.length > 0 && (
          <div style={{ 
              background: 'rgba(232,184,75,0.05)', border: '1px solid rgba(232,184,75,0.1)', 
              padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' 
          }}>
              <Info size={16} color="var(--gold)" />
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                  Properties in this queue are **hidden** from the public until you change their status to <strong>Active</strong>.
              </p>
          </div>
      )}
    </div>
  );
};

export default VerificationQueue;
