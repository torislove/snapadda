import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MapPin, Phone, User, LogOut, LayoutDashboard, Building2, Globe } from 'lucide-react';
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
    { label: t('nav.callback', 'VIP Callback'), path: '/request-callback', icon: <Phone size={18} /> },
  ];

  if (user) {
    navLinks.push({ label: t('nav.dashboard', 'Dashboard'), path: '/dashboard', icon: <LayoutDashboard size={18} /> });
  }

  return (
    <>
      {/* ─── TOP NAVIGATION BAR ─── */}
      <header
        className="app-nav"
        style={{
          background: scrolled || mobileMenuOpen ? 'rgba(5, 5, 10, 0.98)' : 'rgba(5, 5, 10, 0.85)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderBottom: scrolled || mobileMenuOpen ? '1px solid rgba(212,175,55,0.25)' : '1px solid rgba(212,175,55,0.1)',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 9998,
          transform: 'translateZ(0)', /* GPU acceleration to prevent flicker */
        }}
      >
        <div className="container nav-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 clamp(0.75rem, 4vw, 2rem)' }}>
          
          {/* ─── LOGO ─── */}
          <Link to="/" className="nav-logo-wrap" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
            <Logo size={32} showText />
          </Link>

          {/* ─── DESKTOP NAV LINKS ─── */}
          <nav className="nav-links-center desktop-only" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.path.startsWith('/#') ? link.path.substring(1) : link.path}
                className="nav-link"
                style={{
                  color: location.pathname === link.path ? 'var(--gold)' : 'var(--txt-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  transition: 'color 0.2s',
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* ─── RIGHT SIDE: Lang + Auth (desktop) + Hamburger (mobile) ─── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            
            {/* Language Toggle — visible on all viewports */}
            <button
              onClick={toggleLang}
              aria-label={i18n.language === 'en' ? 'Switch to Telugu' : 'Switch to English'}
              className="btn-3d-liquid"
              style={{
                background: 'rgba(212,175,55,0.05)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: 'var(--gold)',
                padding: '0.4rem 0.75rem',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 800,
                minHeight: '38px',
                whiteSpace: 'nowrap',
                boxShadow: scrolled ? '0 5px 15px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              <Globe size={14} />
              <span className="desktop-only" style={{ display: 'inline' }}>{i18n.language === 'en' ? 'తెలుగు' : 'ENGLISH'}</span>
              <span className="mobile-only">{i18n.language === 'en' ? 'TE' : 'EN'}</span>
            </button>

            {/* Desktop Auth */}
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {user ? (
                <>
                  <span style={{ fontSize: '0.82rem', color: 'var(--txt-muted)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                  <button
                    style={{ padding: '0.4rem 1rem', background: 'rgba(240,93,94,0.1)', color: '#f05d5e', border: '1px solid rgba(240,93,94,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={logout}
                  >
                    <LogOut size={14} /> {t('nav.signOut', 'Sign Out')}
                  </button>
                </>
              ) : (
                <Link to="/login" style={{ padding: '0.4rem 1.2rem', background: 'linear-gradient(135deg, #e8b84b, #b9933a)', color: '#07070f', borderRadius: '8px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 800 }}>
                  {t('nav.signIn', 'Sign In')}
                </Link>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="mobile-only"
              style={{
                background: mobileMenuOpen ? 'rgba(240,93,94,0.15)' : 'rgba(212,175,55,0.12)',
                border: `1.5px solid ${mobileMenuOpen ? 'rgba(240,93,94,0.4)' : 'rgba(212,175,55,0.35)'}`,
                color: mobileMenuOpen ? '#f05d5e' : 'var(--gold)',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── MOBILE FULLSCREEN MENU OVERLAY ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '60px',
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(4, 4, 10, 0.98)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              zIndex: 9997,
              padding: '1.25rem 1.5rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Nav Links */}
            {navLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.path.startsWith('/#') ? link.path.substring(1) : link.path}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '1rem 0.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                }}
              >
                <span style={{ color: 'var(--gold)', opacity: 0.8 }}>{link.icon}</span>
                {link.label}
              </motion.a>
            ))}

            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {user ? (
                <>
                  <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--txt-muted)' }}>
                    Signed in as <strong style={{ color: '#fff' }}>{user.name}</strong>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    style={{ width: '100%', padding: '0.9rem', background: 'rgba(240,93,94,0.1)', color: '#f05d5e', border: '1px solid rgba(240,93,94,0.3)', borderRadius: '14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #e8b84b, #b9933a)', color: '#07070f', borderRadius: '14px', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
                >
                  <User size={16} /> Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
