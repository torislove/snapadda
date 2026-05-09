import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, User, LogOut, LayoutDashboard, Building2, Globe, ChevronDown, UserCircle2, PlusCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';

// ─── Avatar Dropdown ────────────────────────────────────────────────────────
function AvatarDropdown({ user, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const avatarUrl = user?.picture || user?.avatar || user?.photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e8b84b&color=000&bold=true&size=128`;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '3px 10px 3px 3px',
          borderRadius: '40px',
          background: open ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${open ? 'rgba(232,184,75,0.4)' : 'rgba(255,255,255,0.1)'}`,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <img
          src={avatarUrl}
          alt={user?.name || 'Profile'}
          style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(232,184,75,0.5)' }}
          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e8b84b&color=000&bold=true`; }}
        />
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.name?.split(' ')[0] || 'Profile'}
        </span>
        <ChevronDown size={13} style={{ color: 'rgba(255,255,255,0.5)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: '220px', background: 'rgba(10,10,22,0.98)',
              backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '18px', padding: '8px', zIndex: 9999,
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            }}
          >
            {/* User Info */}
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={avatarUrl} alt="" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(232,184,75,0.4)' }} onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e8b84b&color=000&bold=true`; }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff' }}>{user?.name || 'User'}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '130px' }}>{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            {[
              { icon: <UserCircle2 size={15} />, label: 'My Profile', action: () => { navigate('/dashboard'); setOpen(false); } },
              { icon: <LayoutDashboard size={15} />, label: 'Dashboard', action: () => { navigate('/dashboard'); setOpen(false); } },
            ].map(item => (
              <button key={item.label} onClick={item.action} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '12px', border: 'none',
                background: 'transparent', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem',
                fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: 'var(--gold)' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '6px', paddingTop: '6px' }}>
              <button onClick={() => { logout(); setOpen(false); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '12px', border: 'none',
                background: 'transparent', color: '#f5397b', fontSize: '0.82rem',
                fontWeight: 700, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,57,123,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Header ─────────────────────────────────────────────────────────────
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

  useEffect(() => { setMobileMenuOpen(false); }, [location]);

  const navLinks = [
    { label: t('nav.properties', 'Browse'), path: '/#properties', icon: <Building2 size={18} /> },
    { label: t('nav.post', 'Post Property'), path: '/post-property', icon: <PlusCircle size={18} /> },
    { label: t('nav.locations', 'Locations'), path: '/#cities', icon: <MapPin size={18} /> },
    { label: t('nav.callback', 'VIP Callback'), path: '/request-callback', icon: <Phone size={18} /> },
  ];
  if (user) {
    navLinks.push({ label: t('nav.dashboard', 'Dashboard'), path: '/dashboard', icon: <LayoutDashboard size={18} /> });
  }

  const avatarUrl = user?.picture || user?.avatar || user?.photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e8b84b&color=000&bold=true&size=128`;

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
          zIndex: 9998, transform: 'translateZ(0)',
          position: 'fixed', top: 0, left: 0, right: 0, height: '70px',
        }}
      >
        <div className="container nav-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 15px' }}>

          {/* ─── LOGO ─── */}
          <Link to="/" className="nav-logo-wrap" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
            <Logo size={28} showText={!scrolled} />
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
                  textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600,
                  letterSpacing: '0.02em', transition: 'color 0.2s',
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* ─── RIGHT SIDE ─── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="btn-3d-liquid desktop-only"
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', padding: '0.4rem 0.8rem', borderRadius: '10px',
                fontSize: '0.7rem', fontWeight: 800, minHeight: '40px', cursor: 'pointer',
              }}
            >
              {i18n.language === 'en' ? 'తెలుగు' : 'EN'}
            </button>

            {/* Auth: Logged-in avatar OR Sign In button */}
            {user ? (
              <AvatarDropdown user={user} logout={logout} />
            ) : (
              <Link
                to="/login"
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '8px 20px', borderRadius: '40px',
                  background: 'linear-gradient(135deg, #e8b84b, #c89a32)',
                  color: '#07070f', fontWeight: 800, fontSize: '0.82rem',
                  textDecoration: 'none', letterSpacing: '0.04em',
                  boxShadow: '0 4px 20px rgba(232,184,75,0.35)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                <User size={15} /> Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="mobile-only"
              onClick={() => setMobileMenuOpen(o => !o)}
              style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <div style={{ width: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ display: 'block', height: '2px', background: 'white', borderRadius: '2px', transform: mobileMenuOpen ? 'rotate(45deg) translate(4px, 6px)' : 'none', transition: '0.25s' }} />
                <span style={{ display: 'block', height: '2px', background: 'white', borderRadius: '2px', opacity: mobileMenuOpen ? 0 : 1, transition: '0.25s' }} />
                <span style={{ display: 'block', height: '2px', background: 'white', borderRadius: '2px', transform: mobileMenuOpen ? 'rotate(-45deg) translate(4px, -6px)' : 'none', transition: '0.25s' }} />
              </div>
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
              position: 'fixed', top: '70px', left: 0, right: 0, bottom: 0,
              background: 'rgba(4, 4, 10, 0.98)', backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)', zIndex: 9997,
              padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column',
            }}
          >
            {/* User info strip (mobile) */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', marginBottom: '1rem', border: '1px solid rgba(232,184,75,0.15)' }}>
                <img src={avatarUrl} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(232,184,75,0.5)' }} onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e8b84b&color=000&bold=true`; }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{user.email}</div>
                </div>
              </div>
            )}

            {navLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.path.startsWith('/#') ? link.path.substring(1) : link.path}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '1rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
                  color: '#fff', textDecoration: 'none', fontSize: '1.05rem', fontWeight: 600,
                }}
              >
                <span style={{ color: 'var(--gold)', opacity: 0.8 }}>{link.icon}</span>
                {link.label}
              </motion.a>
            ))}

            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Language toggle in mobile */}
              <button onClick={toggleLang} style={{ padding: '0.9rem', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Globe size={16} /> {i18n.language === 'en' ? 'తెలుగు లో చదవండి' : 'Switch to English'}
              </button>

              {user ? (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  style={{ width: '100%', padding: '0.9rem', background: 'rgba(245,57,123,0.1)', color: '#f5397b', border: '1px solid rgba(245,57,123,0.3)', borderRadius: '14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #e8b84b, #b9933a)', color: '#07070f', borderRadius: '14px', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
                >
                  <User size={16} /> Sign In with Google
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
