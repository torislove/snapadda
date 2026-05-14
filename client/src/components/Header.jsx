import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, User, LogOut, LayoutDashboard, Building, Globe,
  ChevronDown, UserCircle2, PlusCircle, Search, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import LanguageToggle from './LanguageToggle';

// ─── Avatar Dropdown ─────────────────────────────────────────────────────────
function AvatarDropdown({ user, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, []);

  const avatarUrl = user?.picture || user?.avatar || user?.photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e8b84b&color=000&bold=true&size=128`;

  const menuItems = [
    { icon: <UserCircle2 size={15} />, label: 'My Profile',  action: () => { navigate('/dashboard'); setOpen(false); } },
    { icon: <LayoutDashboard size={15} />, label: 'Dashboard', action: () => { navigate('/dashboard'); setOpen(false); } },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        id="btn-nav-user-menu"
        onClick={() => setOpen(o => !o)}
        aria-label="User menu"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          padding: '4px 10px 4px 4px', borderRadius: '40px',
          background: open ? 'rgba(232,184,75,0.12)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${open ? 'rgba(232,184,75,0.35)' : 'rgba(255,255,255,0.1)'}`,
          cursor: 'pointer', transition: 'all 0.2s',
          minHeight: '40px',
        }}
      >
        <img
          src={avatarUrl} alt={user?.name || 'Profile'}
          style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(232,184,75,0.4)' }}
          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e8b84b&color=000`; }}
        />
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', maxWidth: '72px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.name?.split(' ')[0] || 'Me'}
        </span>
        <ChevronDown size={12} style={{ color: 'rgba(255,255,255,0.4)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.14 }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: '210px', background: 'rgba(8,10,22,0.98)',
              backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '18px', padding: '6px', zIndex: 9999,
              boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* User info */}
            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={avatarUrl} alt="" style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(232,184,75,0.35)', flexShrink: 0 }} onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e8b84b&color=000`; }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
              </div>
            </div>

            {menuItems.map(item => (
              <button 
                id={`btn-nav-user-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                key={item.label} onClick={item.action}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 12px', borderRadius: '12px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s', minHeight: '40px' }}
                onPointerEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onPointerLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: 'var(--gold)' }}>{item.icon}</span>{item.label}
              </button>
            ))}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px', paddingTop: '4px' }}>
              <button 
                id="btn-nav-user-signout"
                onClick={() => { logout(); setOpen(false); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 12px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#f0515f', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', minHeight: '40px' }}
                onPointerEnter={e => e.currentTarget.style.background = 'rgba(240,81,95,0.08)'}
                onPointerLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────
export default function Header() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'en' ? 'te' : 'en');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location]);

  const navLinks = [
    { label: 'BUY', path: '/search?intent=Buy', icon: <Search size={15} /> },
    { label: 'RENT', path: '/search?intent=Rent', icon: <Building size={15} /> },
    { label: 'POST PROPERTY', path: '/post-property', icon: <PlusCircle size={15} /> },
    { label: 'HELP', path: '/request-callback', icon: <Phone size={15} /> },
  ];

  const avatarUrl = user?.picture || user?.avatar || user?.photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e8b84b&color=000&bold=true&size=128`;

  return (
    <>
      {/* ─── TOP NAV BAR ─── */}
      <header
        className={`app-nav ${scrolled ? 'is-sticky' : ''}`}
        role="banner"
      >
        <div className="nav-inner">
          {/* Logo */}
          <Link 
            id="lnk-nav-logo"
            to="/" aria-label="SnapAdda Home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
            <Logo size={scrolled ? 13 : 15} showText />
          </Link>

          {/* Desktop center links */}
          <nav id="nav-main-desktop" className="nav-links-center desktop-only" aria-label="Site navigation" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {navLinks.map((link) => (
              <a
                id={`lnk-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                key={link.label}
                href={link.path.startsWith('/#') ? link.path.substring(1) : link.path}
                style={{
                  color: location.pathname === link.path.split('#')[0] ? 'var(--gold)' : 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: '5px',
                  minHeight: '36px',
                }}
                onPointerEnter={e => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.background = 'rgba(232,184,75,0.07)'; }}
                onPointerLeave={e => { e.currentTarget.style.color = location.pathname === link.path.split('#')[0] ? 'var(--gold)' : 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}
              >
                {link.icon} {link.label}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="nav-actions-right" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
            {/* Language toggle — desktop */}
            <div className="desktop-only">
              <LanguageToggle variant="compact" />
            </div>

            {/* Auth area */}
            {user ? (
              <AvatarDropdown user={user} logout={logout} />
            ) : (
              <Link
                id="lnk-nav-login"
                to="/login"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '0 16px', borderRadius: '40px',
                  background: 'var(--gold)', color: '#000',
                  fontWeight: 900, fontSize: '0.75rem',
                  textDecoration: 'none',
                  boxShadow: '0 6px 16px rgba(232,184,75,0.25)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  minHeight: '38px',
                }}
              >
                <User size={13} /> LOGIN
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              id="btn-nav-mobile-hamburger"
              className="mobile-only"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: mobileMenuOpen ? 'rgba(232,184,75,0.1)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${mobileMenuOpen ? 'rgba(232,184,75,0.3)' : 'rgba(255,255,255,0.1)'}`,
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mobileMenuOpen ? 'x' : 'menu'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileMenuOpen ? <X size={18} /> : (
                    <div style={{ width: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ display: 'block', height: '2px', background: 'white', borderRadius: '2px' }} />
                      <span style={{ display: 'block', height: '2px', background: 'white', borderRadius: '2px', width: '75%', marginLeft: 'auto' }} />
                      <span style={{ display: 'block', height: '2px', background: 'white', borderRadius: '2px' }} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* ─── MOBILE SLIDE-DOWN MENU ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '26px', left: 0, right: 0,
              background: 'rgba(4, 4, 10, 0.97)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              zIndex: 9997,
              padding: '1rem 1.25rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            {/* User strip */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.75rem', background: 'rgba(232,184,75,0.06)', borderRadius: '14px', marginBottom: '0.875rem', border: '1px solid rgba(232,184,75,0.12)' }}>
                <img src={avatarUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(232,184,75,0.4)', flexShrink: 0 }} onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e8b84b&color=000`; }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '0.875rem' }}>
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.path.startsWith('/#') ? link.path.substring(1) : link.path}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 12px', borderRadius: '12px',
                    color: '#fff', textDecoration: 'none',
                    fontSize: '0.95rem', fontWeight: 600,
                    transition: 'background 0.15s',
                    minHeight: '48px',
                  }}
                  onPointerEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onPointerLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ color: 'var(--gold)', opacity: 0.85 }}>{link.icon}</span>
                  {link.label}
                </motion.a>
              ))}
            </div>

            {/* Footer actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={toggleLang}
                style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '48px' }}
              >
                <Globe size={15} /> {i18n.language === 'en' ? 'తెలుగు లో చదవండి' : 'Switch to English'}
              </button>

              {user ? (
                <button onClick={() => { logout(); setMobileMenuOpen(false); }}
                  style={{ padding: '12px', background: 'rgba(240,81,95,0.08)', color: '#f0515f', border: '1px solid rgba(240,81,95,0.25)', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '48px' }}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ padding: '14px', background: 'var(--gold)', color: '#000', borderRadius: '12px', fontWeight: 900, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', minHeight: '48px' }}
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
