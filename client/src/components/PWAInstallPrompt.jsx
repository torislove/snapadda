import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Zap, ShieldCheck } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Only show if not already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Delay showing the prompt for better UX (after 10 seconds or property views)
      setTimeout(() => {
        setIsVisible(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, we can't detect 'beforeinstallprompt', so we show instructions
    if (isIOSDevice) {
        setTimeout(() => {
            setIsVisible(true);
        }, 15000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="mobile-only"
        style={{
          position: 'fixed',
          bottom: '100px', // Above the mobile nav
          left: '15px',
          right: '15px',
          zIndex: 10000,
          background: 'rgba(10, 10, 25, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '20px',
          border: '1px solid rgba(232, 184, 75, 0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}
      >
        <button 
          onClick={() => setIsVisible(false)}
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)' }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
            width: '50px', height: '50px', borderRadius: '14px', 
            background: 'linear-gradient(135deg, #e8b84b, #b9933a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black',
            boxShadow: '0 8px 20px rgba(232, 184, 75, 0.3)'
          }}>
            <Smartphone size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'white' }}>Install SnapAdda App</h4>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
              Fastest way to browse elite estates.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(16,217,140,0.1)', border: '1px solid rgba(16,217,140,0.2)', color: '#10d98c', fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={10} fill="#10d98c" /> 2X FASTER
            </div>
            <div style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(34,217,224,0.1)', border: '1px solid rgba(34,217,224,0.2)', color: '#22d9e0', fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={10} fill="#22d9e0" /> SECURE ACCESS
            </div>
        </div>

        {isIOS ? (
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                Tap the <strong style={{ color: 'var(--gold)' }}>Share</strong> button and select <strong style={{ color: 'var(--gold)' }}>"Add to Home Screen"</strong> to install.
            </div>
        ) : (
            <button
                onClick={handleInstall}
                className="btn-3d-liquid"
                style={{
                    background: 'var(--gold)',
                    color: 'black',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '12px',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    boxShadow: '0 8px 25px rgba(232, 184, 75, 0.3)'
                }}
            >
                <Download size={18} /> INSTALL NOW
            </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
