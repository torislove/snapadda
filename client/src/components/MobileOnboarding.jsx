import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MapPin, Globe, CheckCircle2, X } from 'lucide-react';

const MobileOnboarding = ({ onComplete, onLocationDetected }) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on mobile and if not onboarded
    const onboarded = localStorage.getItem('snapadda_onboarded');
    if (!onboarded && window.innerWidth <= 768) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'unset';
    };
  }, [isVisible]);

  const handleLanguageSelect = (lang) => {
    setSelectedLang(lang);
    i18n.changeLanguage(lang);
    setStep(2);
  };

  const handleLocation = async () => {
    setLoadingLoc(true);
    if (!navigator.geolocation) {
      finishOnboarding();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Reverse geocode using free client API
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();
          const city = data.city || data.locality || data.principalSubdivision;
          
          if (city && onLocationDetected) {
            onLocationDetected(city);
          }
        } catch (e) {
          console.error('Location fetch failed', e);
        } finally {
          finishOnboarding();
        }
      },
      () => {
        // User denied or error
        finishOnboarding();
      },
      { timeout: 10000 }
    );
  };

  const finishOnboarding = () => {
    localStorage.setItem('snapadda_onboarded', 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999,
          background: 'rgba(5,10,20,0.95)', backdropFilter: 'blur(40px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          overflow: 'hidden', touchAction: 'none'
        }}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          style={{
            background: 'var(--midnight)', width: '100%', maxWidth: '400px', borderRadius: '32px',
            padding: '2.5rem 1.75rem', border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.8)', position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Enhanced Holographic Aura */}
          <div style={{ position: 'absolute', top: -100, right: -100, width: 250, height: 250, background: 'var(--gold)', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -80, width: 200, height: 200, background: 'var(--cyan)', filter: 'blur(80px)', opacity: 0.05, borderRadius: '50%' }} />

          <button 
            onClick={finishOnboarding} 
            style={{ 
              position: 'absolute', top: 20, right: 20, 
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
              color: 'rgba(255,255,255,0.6)', width: '36px', height: '36px', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10
            }}
          >
            <X size={18} />
          </button>

          {step === 1 ? (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{ 
                width: 70, height: 70, background: 'rgba(212,175,55,0.08)', 
                borderRadius: '24px', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', marginBottom: '1.5rem',
                border: '1px solid rgba(212,175,55,0.15)',
                boxShadow: '0 10px 30px rgba(212,175,55,0.1)'
              }}>
                <Globe size={36} color="var(--gold)" />
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', marginBottom: '12px', letterSpacing: '-0.02em' }}>Choose Language</h2>
              <p style={{ color: 'var(--txt-muted)', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.5 }}>Select your preferred language for an elite property browsing experience.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleLanguageSelect('en')}
                  style={{ 
                    padding: '1.25rem', background: selectedLang === 'en' ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)', 
                    border: `1px solid ${selectedLang === 'en' ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`, 
                    borderRadius: '20px', color: 'white', fontSize: '1.15rem', fontWeight: 800, 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  English
                  {selectedLang === 'en' && <CheckCircle2 size={22} color="var(--gold)" />}
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleLanguageSelect('te')}
                  style={{ 
                    padding: '1.25rem', background: selectedLang === 'te' ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)', 
                    border: `1px solid ${selectedLang === 'te' ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`, 
                    borderRadius: '20px', color: 'white', fontSize: '1.15rem', fontWeight: 800, 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  తెలుగు (Telugu)
                  {selectedLang === 'te' && <CheckCircle2 size={22} color="var(--gold)" />}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{ 
                width: 70, height: 70, background: 'rgba(34,217,224,0.08)', 
                borderRadius: '24px', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', marginBottom: '1.5rem',
                border: '1px solid rgba(34,217,224,0.15)',
                boxShadow: '0 10px 30px rgba(34,217,224,0.1)'
              }}>
                <MapPin size={36} color="var(--cyan)" />
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', marginBottom: '12px', letterSpacing: '-0.02em' }}>Find Local Gems</h2>
              <p style={{ color: 'var(--txt-muted)', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                Enable location to instantly discover high-yield real estate opportunities near your current position.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLocation}
                  disabled={loadingLoc}
                  style={{ 
                    padding: '1.25rem', background: 'var(--cyan)', border: 'none', 
                    borderRadius: '20px', color: '#000', fontSize: '1.1rem', fontWeight: 900, 
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', 
                    opacity: loadingLoc ? 0.7 : 1,
                    boxShadow: '0 10px 25px rgba(34,217,224,0.3)'
                  }}
                >
                  {loadingLoc ? 'Syncing Coordinates...' : '📍 Auto-Detect Location'}
                </motion.button>
                <button 
                  onClick={finishOnboarding}
                  style={{ 
                    padding: '1rem', background: 'transparent', border: 'none', 
                    borderRadius: '20px', color: 'rgba(255,255,255,0.4)', 
                    fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Enter Platform Manually
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileOnboarding;
