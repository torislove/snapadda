import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent default browser install bar from displaying
      e.preventDefault();
      // Store event so it can be triggered later
      setDeferredPrompt(e);
      // Show the customized floating invite card
      // Delay slightly for premium initial layout load
      const timer = setTimeout(() => {
        // Only show if user hasn't dismissed it this session
        const dismissed = sessionStorage.getItem('pwa_dismissed');
        if (!dismissed) {
          setShowBanner(true);
        }
      }, 5000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Track successful installations
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      toast.success('SnapAdda installed successfully! Enjoy direct launch from your home screen.');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Trigger browser PWA install dialogue prompt
    deferredPrompt.prompt();

    // Check user's choice
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast.success('Initializing installation...');
    }
    
    // Clear prompt state
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa_dismissed', 'true');
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          style={{
            position: 'fixed',
            bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
            left: '16px',
            right: '16px',
            maxWidth: '480px',
            margin: '0 auto',
            zIndex: 99999,
            background: 'rgba(10, 12, 22, 0.85)',
            border: '1px solid rgba(244, 208, 63, 0.35)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(24px)',
            borderRadius: '24px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            willChange: 'transform, opacity'
          }}
        >
          {/* Left Block Details */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-royal) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'black',
              boxShadow: '0 8px 20px rgba(244, 208, 63, 0.25)',
              flexShrink: 0
            }}>
              <Zap size={20} fill="black" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'white', display: 'block' }}>
                Install SnapAdda App
              </span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.6)', display: 'block', marginTop: '2px', lineHeight: 1.3 }}>
                Fast loading, zero cellular lag, and instant offline access!
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={handleInstallClick}
              style={{
                background: 'white',
                color: 'black',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.72rem',
                padding: '10px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                letterSpacing: '0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 8px 16px rgba(255, 255, 255, 0.15)'
              }}
            >
              INSTALL <Download size={12} strokeWidth={2.5} />
            </button>
            <button
              onClick={handleDismiss}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.5)',
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
