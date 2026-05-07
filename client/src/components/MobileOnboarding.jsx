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
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(5,10,20,0.85)', backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'flex-end', padding: '16px'
        }}
      >
        <motion.div 
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            background: 'var(--midnight)', width: '100%', borderRadius: '32px',
            padding: '2rem 1.5rem', border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 -20px 60px rgba(0,0,0,0.5)', position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Holographic BG */}
          <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'var(--gold)', filter: 'blur(80px)', opacity: 0.15, borderRadius: '50%' }} />

          <button onClick={finishOnboarding} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>

          {step === 1 ? (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <div style={{ width: 60, height: 60, background: 'rgba(212,175,55,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Globe size={32} color="var(--gold)" />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>Choose Language</h2>
              <p style={{ color: 'var(--txt-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Select your preferred language for the best experience.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  onClick={() => handleLanguageSelect('en')}
                  style={{ padding: '1rem', background: selectedLang === 'en' ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${selectedLang === 'en' ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', color: 'white', fontSize: '1.1rem', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  English
                  {selectedLang === 'en' && <CheckCircle2 size={20} color="var(--gold)" />}
                </button>
                <button 
                  onClick={() => handleLanguageSelect('te')}
                  style={{ padding: '1rem', background: selectedLang === 'te' ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${selectedLang === 'te' ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', color: 'white', fontSize: '1.1rem', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  తెలుగు (Telugu)
                  {selectedLang === 'te' && <CheckCircle2 size={20} color="var(--gold)" />}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <div style={{ width: 60, height: 60, background: 'rgba(34,217,224,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <MapPin size={32} color="var(--cyan)" />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>Find Local Properties</h2>
              <p style={{ color: 'var(--txt-muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>
                Enable location to automatically discover elite real estate listings near you.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  onClick={handleLocation}
                  disabled={loadingLoc}
                  style={{ padding: '1.1rem', background: 'var(--cyan)', border: 'none', borderRadius: '16px', color: '#000', fontSize: '1rem', fontWeight: 900, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: loadingLoc ? 0.7 : 1 }}
                >
                  {loadingLoc ? 'Detecting Location...' : '📍 Detect My Location'}
                </button>
                <button 
                  onClick={finishOnboarding}
                  style={{ padding: '1.1rem', background: 'transparent', border: 'none', borderRadius: '16px', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 700 }}
                >
                  Skip for now
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
