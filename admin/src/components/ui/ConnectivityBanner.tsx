import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Database, Cloud, Server, CheckCircle2, X, ShieldCheck } from 'lucide-react';
import { useServerHealth } from '../../hooks/useServerHealth';
import HolographicWrapper from './HolographicWrapper';

interface ConnectivityBannerProps {
  alwaysShow?: boolean;
  compact?: boolean;
}

export const ConnectivityBanner: React.FC<ConnectivityBannerProps> = ({
  alwaysShow = false,
  compact = false,
}) => {
  const { loading, serverOk, mongoOk, cloudinaryOk, allOk, lastChecked, error, refetch } =
    useServerHealth(30000);

  const [dismissed, setDismissed] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (!allOk) setDismissed(false);
  }, [allOk]);

  const handleRefetch = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const formattedTime = lastChecked
    ? lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--';

  if (compact) {
    const dotColor = loading ? '#888' : allOk ? '#10d98c' : !serverOk ? '#f5397b' : '#f5c842';
    const label = loading ? 'SYNCING...' : allOk ? 'SYSTEMS SECURE' : !serverOk ? 'OFFLINE' : 'DEGRADED';

    return (
      <button
        onClick={handleRefetch}
        className="glass-holographic"
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 14px', borderRadius: '99px',
          background: 'rgba(10,12,20,0.8)', backdropFilter: 'blur(10px)',
          border: `1px solid ${allOk ? 'rgba(16,217,140,0.2)' : 'rgba(245,57,123,0.3)'}`,
          cursor: 'pointer', fontSize: '0.65rem', fontWeight: 900, color: dotColor,
          letterSpacing: '0.1em', boxShadow: allOk ? '0 0 15px rgba(16,217,140,0.1)' : '0 0 15px rgba(245,57,123,0.1)'
        }}
      >
        <ShieldCheck size={14} style={{ animation: loading ? 'pulse 2s infinite' : 'none' }} />
        {label}
        {isRefreshing && <RefreshCw size={10} style={{ animation: 'spin 0.6s linear infinite' }} />}
      </button>
    );
  }

  const shouldRender = alwaysShow || (!allOk && !loading);

  return (
    <AnimatePresence>
      {shouldRender && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          style={{ marginBottom: '2rem' }}
        >
          <HolographicWrapper intensity={0.5} iridescent={!allOk} style={{ borderRadius: '20px' }}>
            <div style={{
              padding: '1.25rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ 
                width: '42px', height: '42px', borderRadius: '12px',
                background: allOk ? 'rgba(16,217,140,0.1)' : 'rgba(245,57,123,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${allOk ? 'rgba(16,217,140,0.3)' : 'rgba(245,57,123,0.3)'}`
              }}>
                {allOk ? <CheckCircle2 size={24} color="#10d98c" /> : <AlertTriangle size={24} color={!serverOk ? '#f5397b' : '#f5c842'} />}
              </div>

              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: 'white', marginBottom: '4px', letterSpacing: '0.02em' }}>
                  {allOk ? 'NEURAL LINK SECURE' : !serverOk ? 'CORE GATEWAY UNREACHABLE' : 'INTELLIGENCE DEGRADED'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                  {error || 'Monitoring real-time sync status for all regional estate assets.'} · Checked {formattedTime}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <ServiceDot icon={Server} ok={serverOk} label="API" />
                <ServiceDot icon={Database} ok={mongoOk} label="DB" />
                <ServiceDot icon={Cloud} ok={cloudinaryOk} label="MEDIA" />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleRefetch}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 18px', borderRadius: '12px',
                    background: 'var(--gold)', color: '#000',
                    fontSize: '0.75rem', fontWeight: 900, border: 'none',
                    cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 8px 20px rgba(245,200,66,0.2)'
                  }}
                >
                  <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 0.6s linear infinite' : 'none' }} />
                  FORCE SYNC
                </button>
                
                {allOk && (
                  <button onClick={() => setDismissed(true)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </HolographicWrapper>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ServiceDot: React.FC<{ icon: React.FC<any>; ok: boolean; label: string; }> = ({ icon: Icon, ok, label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
    <div style={{
      width: '32px', height: '32px', borderRadius: '10px',
      background: ok ? 'rgba(16,217,140,0.08)' : 'rgba(245,57,123,0.08)',
      border: `1px solid ${ok ? 'rgba(16,217,140,0.2)' : 'rgba(245,57,123,0.2)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: ok ? '#10d98c' : '#f5397b',
      boxShadow: ok ? '0 0 10px rgba(16,217,140,0.1)' : 'none'
    }}>
      <Icon size={14} />
    </div>
    <span style={{ fontSize: '0.55rem', color: ok ? '#10d98c' : '#f5397b', fontWeight: 900, letterSpacing: '0.1em' }}>
      {label.toUpperCase()}
    </span>
  </div>
);

export default ConnectivityBanner;
