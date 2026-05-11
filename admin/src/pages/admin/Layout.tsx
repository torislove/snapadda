import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building, Users, 
  Settings, Menu, Megaphone, X, LogOut, BookOpen, Activity, Search,
  MessageSquare, Plus
} from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { ConnectivityBanner } from '../../components/ui/ConnectivityBanner';
import { AdminMobileNav } from '../../components/ui/AdminMobileNav';
import { useTranslation } from 'react-i18next';
import { triggerHaptic } from '../../utils/haptics';
// Styles imported via main entry point

/* ── 2-click Logout Button ── */
const LogoutButton = ({ onLogout }: { onLogout: () => void }) => {
  const [confirm, setConfirm] = useState(false);
  if (confirm) return (
    <button
      onClick={onLogout}
      className="btn-elite"
      style={{ width: '100%', background: 'var(--rose)', color: '#fff' }}
    >
      <LogOut size={13} /> Confirm Sign Out
    </button>
  );
  return (
    <button
      onClick={() => setConfirm(true)}
      style={{
        width: '100%', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer',
        background: 'rgba(245,57,123,0.08)', color: 'var(--rose)',
        border: '1px solid rgba(245,57,123,0.2)', fontSize: '0.78rem', fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,57,123,0.15)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,57,123,0.08)'; }}
    >
      <LogOut size={13} /> Sign Out
    </button>
  );
};

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLng = i18n.language || 'en';

  const toggle = (lng: string) => {
    triggerHaptic('light');
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ 
      display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', 
      padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)',
      marginRight: '8px'
    }}>
      {['en', 'te'].map(lng => (
        <button
          key={lng}
          onClick={() => toggle(lng)}
          style={{
            padding: '4px 8px', borderRadius: '6px', border: 'none',
            fontSize: '0.62rem', fontWeight: 900, cursor: 'pointer',
            background: currentLng === lng ? 'var(--gold)' : 'transparent',
            color: currentLng === lng ? '#000' : 'rgba(255,255,255,0.4)',
            transition: '0.3s'
          }}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

const NAV_ITEMS = [
  { to: '/admin',            label: 'nav.dashboard',      icon: LayoutDashboard, exact: true,  activeClass: 'active-dashboard',  color: 'var(--gold)'    },
  { to: '/admin/properties', label: 'nav.properties',     icon: Building,        exact: false, activeClass: 'active-properties', color: 'var(--violet)'  },
  { to: '/admin/leads',      label: 'nav.leads',          icon: Users,           exact: false, activeClass: 'active-leads',      color: 'var(--emerald)' },
  { to: '/admin/promotions', label: 'nav.engagement',     icon: Megaphone,       exact: false, activeClass: 'active-promotions', color: 'var(--gold)'    },
  { to: '/admin/engagement', label: 'nav.analytics',      icon: Activity,        exact: false, activeClass: 'active-engagement', color: 'var(--rose)'    },
  { to: '/admin/comms',      label: 'nav.messages',       icon: MessageSquare,   exact: false, activeClass: 'active-settings',   color: 'var(--cyan)'    },
  { to: '/admin/settings',   label: 'nav.settings',       icon: Settings,        exact: false, activeClass: 'active-settings',   color: 'var(--violet)'  },
  { to: '/admin/guide',      label: 'nav.help',           icon: BookOpen,        exact: false, activeClass: 'active-settings',   color: 'var(--emerald)' },
];



const AdminLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { adminLogout, adminUser } = useAdminAuth();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => { setIsSidebarOpen(false); }, [location.pathname]);

  // Swipe gesture: swipe right from left edge to open, swipe left to close
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (dy > 60) return; // mostly vertical — ignore
    if (dx > 80 && touchStartX.current < 32) { triggerHaptic('light'); setIsSidebarOpen(true); }
    if (dx < -80 && isSidebarOpen) { triggerHaptic('light'); setIsSidebarOpen(false); }
  }, [isSidebarOpen]);

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const getPageTitle = () => {
    const match = NAV_ITEMS.find(n => isActive(n));
    return match ? t(match.label) : 'Admin Portal';
  };

  return (
    <div
      className="admin-layout"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => { triggerHaptic('light'); setIsSidebarOpen(false); }} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <a href="https://snapadda-7a6e6.web.app/" className="logo-link" style={{ textDecoration: 'none' }}>
            <Logo size={30} />
            <div>
              <div className="logo-text">Snap<span>Adda</span></div>
              <span className="sidebar-badge">Control Center</span>
            </div>
          </a>
          <button 
            className="sidebar-close-btn"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">PROPERTIES</div>

          {NAV_ITEMS.slice(0, 4).map(item => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => {
                  triggerHaptic('light');
                  setIsSidebarOpen(false);
                }}
                className={`nav-item ${active ? item.activeClass : ''} ${active ? 'active' : ''}`}
              >
                <span className="nav-icon" style={active ? { color: item.color } : {}}>
                  <Icon size={17} />
                </span>
                {t(item.label)}
              </Link>
            );
          })}

          <div className="nav-section-label" style={{ marginTop: '1rem' }}>RESOURCES</div>

          {NAV_ITEMS.slice(4).map(item => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => {
                  triggerHaptic('light');
                  setIsSidebarOpen(false);
                }}
                className={`nav-item ${active ? item.activeClass : ''} ${active ? 'active' : ''}`}
              >
                <span className="nav-icon" style={active ? { color: item.color } : {}}>
                  <Icon size={17} />
                </span>
                {t(item.label)}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{
            margin: '0 0.75rem 0.75rem',
            padding: '1rem',
            background: 'var(--bg-tertiary)',
            borderRadius: '14px',
            border: '1px solid rgba(0,0,0,0.07)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.875rem' }}>
              <img
                src={adminUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminUser?.name || 'Admin')}&background=e8b84b&color=000&bold=true`}
                alt="Admin"
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--gold)', flexShrink: 0 }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminUser?.name || 'Admin'}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '1px' }}>Administrator</div>
              </div>
            </div>
            <LogoutButton onLogout={adminLogout} />
            
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                style={{
                  width: '100%', marginTop: '0.75rem', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer',
                  background: 'rgba(232,184,75,0.1)', color: 'var(--gold)',
                  border: '1px solid rgba(232,184,75,0.3)', fontSize: '0.78rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <Plus size={13} style={{ transform: 'rotate(45deg)' }} /> Install App
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="admin-content">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="admin-mobile-toggle"
              onClick={() => setIsSidebarOpen(s => !s)}
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="topbar-left-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="topbar-title">{getPageTitle()}</span>
              {/* Command Search Shortcut UI */}
              <div className="command-search-bar desktop-only" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0.4rem 0.8rem', borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'text',
                width: '180px', transition: 'all 0.2s'
              }}>
                <Search size={14} />
                <span>Search...</span>
                <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.1)' }}>⌘ K</span>
              </div>
            </div>
          </div>

          <div className="topbar-right">
            <LanguageSwitcher />
            {/* Live connectivity pill */}
            <ConnectivityBanner compact />
            <span className="topbar-time">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="topbar-divider" />
            <img
              src={adminUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminUser?.name || 'Admin')}&background=9b59f5&color=fff&bold=true`}
              alt={adminUser?.name ? `${adminUser.name} Avatar` : 'Admin Avatar'}
              className="topbar-avatar"
            />
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-page-content animate-fade-in">
          <Outlet />
        </div>

        {/* Mobile Floating Action Button (FAB) - Hidden on Properties page as it has its own FAB */}
        {location.pathname !== '/admin/properties' && (
          <Link to="/admin/properties" className="admin-fab mobile-only" style={{ bottom: '90px', zIndex: 100 }}>
            <Building size={24} />
          </Link>
        )}
        
        <div className="mobile-only">
           <AdminMobileNav isVisible={!isSidebarOpen} />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
