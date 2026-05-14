import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { motion } from 'framer-motion';

const LanguageToggle = ({ variant = 'default' }) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'te' ? 'en' : 'te';
    i18n.changeLanguage(nextLang);
    // Trigger a custom event for other parts of the app if needed
    window.dispatchEvent(new Event('languageChanged'));
  };

  const isTelugu = i18n.language === 'te';

  if (variant === 'compact') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleLanguage}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'var(--gold)', padding: '6px 12px',
          borderRadius: '20px', cursor: 'pointer',
          fontSize: '0.75rem', fontWeight: 900,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}
      >
        <Languages size={14} />
        {isTelugu ? 'ENGLISH' : 'తెలుగు'}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05, background: 'rgba(232,184,75,0.15)' }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(232,184,75,0.05)',
        border: '1px solid var(--gold)',
        color: 'var(--gold)', padding: '8px 16px',
        borderRadius: '24px', cursor: 'pointer',
        fontSize: '0.85rem', fontWeight: 900,
        boxShadow: '0 4px 15px rgba(232,184,75,0.15)',
        transition: 'all 0.3s ease'
      }}
    >
      <Languages size={16} />
      <span style={{ display: 'flex', gap: '4px' }}>
        <span style={{ opacity: isTelugu ? 0.5 : 1 }}>EN</span>
        <span style={{ opacity: 0.3 }}>/</span>
        <span style={{ opacity: isTelugu ? 1 : 0.5 }}>TE</span>
      </span>
    </motion.button>
  );
};

export default LanguageToggle;
