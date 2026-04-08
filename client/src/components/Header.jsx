import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, MapPin, Phone, User, LogOut, LayoutDashboard, Search, Building2, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';

export default function Header() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'en' ? 'te' : 'en');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: t('nav.properties', 'Browse'), path: '/#properties', icon: <Building2 size={18} /> },
    { label: t('nav.locations', 'Locations'), path: '/#cities', icon: <MapPin size={18} /> },
    { label: t('nav.contact', 'Contact'), path: '/#contact', icon: <Phone size={18} /> },
    { label: t('nav.about', 'About Us'), path: '/#about', icon: <User size={18} /> },
  ];

  if (user) {
    navLinks.push({ label: t('nav.dashboard', 'Dashboard'), path: '/dashboard', icon: <LayoutDashboard size={18} /> });
  }

  return (
    <>
      <header
        className="app-nav"
        style={{
          background: scrolled || mobileMenuOpen ? 'rgba(7,7,15,0.98)' : 'transparent',
          backdropFilter: scrolled || mobileMenuOpen ? 'blur(20px)' : 'none',
          borderBottom: scrolled || mobileMenuOpen ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
          boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="container nav-inner">
          <Link to="/" className="nav-logo-wrap">
            <Logo size={36} showText />
          </Link>

          <nav className="nav-links-center">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.path.startsWith('/#') ? link.path.substring(1) : link.path}
                className="nav-link"
                aria-current={location.pathname === link.path ? 'page' : undefined}
                style={{
                  color: location.pathname === link.path ? 'var(--gold)' : 'var(--txt-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="nav-right">
            {/* Unified Lang Toggle */}
            <button 
              onClick={toggleLang} 
              aria-label={i18n.language === 'en' ? 'Switch to Telugu' : 'Switch to English'}
              style={{ 
                background: 'transparent', 
                border: '1px solid rgba(212,175,55,0.4)', 
                color: 'var(--gold)', 
                padding: '0.4rem 0.6rem', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                marginRight: '0.75rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              <Globe size={14} /> {i18n.language === 'en' ? 'తెలుగు' : 'English'}
            </button>

            {/* Desktop Only Auth */}
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--txt-muted)' }}>{user.name}</span>
                  <button className="nav-signout-btn btn-3d" style={{ padding: '0.45rem 1.1rem', background: 'rgba(240, 93, 94, 0.1)', color: '#f05d5e', border: '1px solid rgba(240, 93, 94, 0.3)' }} onClick={logout}>{t('nav.signOut', 'Sign Out')}</button>
                </div>
              ) : (
                <Link to="/login" className="nav-signin-btn btn-3d">{t('nav.signIn', 'Sign In')}</Link>
              )}
            </div>

            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-nav-overlay open"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div style={{ width: '100%', padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.path.startsWith('/#') ? link.path.substring(1) : link.path}
                  className="gold-shimmer-text"
                  style={{ display: 'block', margin: '0.5rem 0', textDecoration: 'none' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />
              {user ? (
                <button
                  className="mobile-auth-btn-glass logout btn-3d"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                >
                  <LogOut size={18} style={{ marginRight: '8px' }} /> {t('nav.signOut', 'Sign Out')}
                </button>
              ) : (
                <Link to="/login" className="mobile-auth-btn-glass login btn-3d" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setMobileMenuOpen(false)}>
                  <User size={18} style={{ marginRight: '8px' }} /> Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
