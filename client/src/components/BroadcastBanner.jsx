import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X, Bell, Info, ShieldCheck, AlertTriangle } from 'lucide-react';
import { fetchSetting } from '../services/api';

export default function BroadcastBanner() {
  const [config, setConfig] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchSetting('broadcast_config')
      .then(data => {
        if (data && data.isActive && data.message) {
          setConfig(data);
        }
      })
      .catch(() => {});
  }, []);

  if (!config || dismissed) return null;

  const getColors = () => {
    switch (config.type) {
      case 'emergency': return { bg: '#f5397b', txt: '#fff', icon: <Bell size={16} /> };
      case 'warning': return { bg: '#e8b84b', txt: '#000', icon: <AlertTriangle size={16} /> };
      case 'success': return { bg: '#10d98c', txt: '#000', icon: <ShieldCheck size={16} /> };
      default: return { bg: '#22d9e0', txt: '#000', icon: <Info size={16} /> };
    }
  };

  const theme = getColors();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        style={{
          background: theme.bg,
          color: theme.txt,
          position: 'relative',
          zIndex: 1000,
          overflow: 'hidden'
        }}
      >
        <div className="container" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '12px',
          padding: '10px 40px 10px 20px',
          minHeight: '44px',
          position: 'relative'
        }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ flexShrink: 0 }}
          >
            {theme.icon}
          </motion.div>
          
          <p style={{ 
            margin: 0, 
            fontSize: '0.85rem', 
            fontWeight: 800, 
            textAlign: 'center',
            letterSpacing: '0.02em',
            lineHeight: 1.4
          }}>
            {config.message}
          </p>

          <button
            onClick={() => setDismissed(true)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: theme.txt
            }}
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
