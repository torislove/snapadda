import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Database, Cloud, Server, RefreshCw, X, AlertCircle } from 'lucide-react';

const ConnectivityShield = () => {
  const [status, setStatus] = useState({
    loading: true,
    serverOk: false,
    mongoOk: false,
    cloudinaryOk: false,
    allOk: false
  });
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);

  const checkHealth = async () => {
    setStatus(s => ({ ...s, loading: true }));
    try {
      // Use the deep health check endpoint
      const res = await fetch('/api/health/deep');
      if (res.ok || res.status === 207) {
        const data = await res.json();
        const newState = {
          loading: false,
          serverOk: data.services.server.ok,
          mongoOk: data.services.mongodb.ok,
          cloudinaryOk: data.services.cloudinary.ok,
          allOk: data.status === 'healthy'
        };
        setStatus(newState);
        // Auto-hide if all OK after 5s, unless expanded
        if (newState.allOk) {
          setTimeout(() => { if (!expanded) setVisible(false); }, 5000);
        } else {
          setVisible(true);
        }
      } else {
        throw new Error('Health check failed');
      }
    } catch (err) {
      setStatus({
        loading: false,
        serverOk: false,
        mongoOk: false,
        cloudinaryOk: false,
        allOk: false
      });
      setVisible(true);
    }
  };

  useEffect(() => {
    checkHealth();
    // Re-check every 60 seconds
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!visible && status.allOk) return null;

  return (
    <div style={{ position: 'fixed', bottom: '100px', right: '20px', zIndex: 9999 }}>
      <AnimatePresence>
        {visible && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="glass-holographic"
            style={{
              padding: expanded ? '1.5rem' : '0.75rem',
              borderRadius: expanded ? '24px' : '99px',
              background: 'rgba(10, 12, 20, 0.85)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${status.allOk ? 'rgba(16, 217, 140, 0.2)' : 'rgba(245, 57, 123, 0.3)'}`,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              color: 'white',
              cursor: 'pointer',
              minWidth: expanded ? '280px' : 'auto',
              maxWidth: '90vw'
            }}
            onClick={() => !expanded && setExpanded(true)}
          >
            {!expanded ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '10px', height: '10px', borderRadius: '50%', 
                  background: status.allOk ? '#10d98c' : '#f5397b',
                  boxShadow: `0 0 10px ${status.allOk ? '#10d98c' : '#f5397b'}`,
                  animation: status.loading ? 'pulse 1s infinite' : 'none'
                }} />
                <Shield size={18} style={{ color: status.allOk ? '#10d98c' : '#f5397b' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                  {status.allOk ? 'SYSTEMS SECURE' : 'CONNECTION ALERT'}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={20} style={{ color: 'var(--gold)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.1em' }}>CONNECTIVITY SHIELD</span>
                  </div>
                  <X size={18} onClick={(e) => { e.stopPropagation(); setExpanded(false); }} style={{ opacity: 0.5 }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <StatusRow icon={Server} label="API GATEWAY" ok={status.serverOk} loading={status.loading} />
                  <StatusRow icon={Database} label="MONGODB ATLAS" ok={status.mongoOk} loading={status.loading} />
                  <StatusRow icon={Cloud} label="CLOUDINARY MEDIA" ok={status.cloudinaryOk} loading={status.loading} />
                </div>

                {!status.allOk && (
                  <div style={{ 
                    padding: '0.75rem', 
                    background: 'rgba(245, 57, 123, 0.1)', 
                    border: '1px solid rgba(245, 57, 123, 0.2)', 
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '10px'
                  }}>
                    <AlertCircle size={16} style={{ color: '#f5397b', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.7rem', margin: 0, lineHeight: 1.4, color: 'rgba(255,255,255,0.8)' }}>
                      We're having trouble reaching some services. This might be due to a weak network or server maintenance.
                    </p>
                  </div>
                )}

                <button 
                  onClick={(e) => { e.stopPropagation(); checkHealth(); }}
                  disabled={status.loading}
                  style={{
                    background: 'var(--gold)',
                    color: 'black',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    fontWeight: 900,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={16} style={{ animation: status.loading ? 'spin 1s linear infinite' : 'none' }} />
                  REFRESH CONNECTION
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatusRow = ({ icon: Icon, label, ok, loading }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Icon size={16} style={{ opacity: 0.6 }} />
      <span style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.8 }}>{label}</span>
    </div>
    <div style={{ 
      padding: '4px 8px', 
      borderRadius: '6px', 
      fontSize: '0.6rem', 
      fontWeight: 900,
      background: loading ? 'rgba(255,255,255,0.05)' : ok ? 'rgba(16, 217, 140, 0.1)' : 'rgba(245, 57, 123, 0.1)',
      color: loading ? 'rgba(255,255,255,0.4)' : ok ? '#10d98c' : '#f5397b',
      border: `1px solid ${loading ? 'transparent' : ok ? 'rgba(16, 217, 140, 0.2)' : 'rgba(245, 57, 123, 0.2)'}`
    }}>
      {loading ? 'CHECKING...' : ok ? 'ONLINE' : 'OFFLINE'}
    </div>
  </div>
);

export default ConnectivityShield;
