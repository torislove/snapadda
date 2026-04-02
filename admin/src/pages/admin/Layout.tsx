import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building, Users, MapPin, 
  Settings, UserPlus, Menu, Contact2, Megaphone, X, LogOut, Layers, BookOpen, Activity, Search,
  MessageSquare, Shield
} from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import './Layout.css';

/* ── 2-click Logout Button ── */
const LogoutButton = ({ onLogout }: { onLogout: () => void }) => {
  const [confirm, setConfirm] = useState(false);
  if (confirm) return (
    <button
      onClick={onLogout}
      style={{
        width: '100%', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer',
        background: 'var(--rose)', color: '#fff', border: 'none',
        fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        animation: 'fadeInUp 0.2s ease',
      }}
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

const NAV_ITEMS = [
  { to: '/admin',            label: 'Dashboard',      icon: LayoutDashboard, exact: true,  activeClass: 'active-dashboard',  color: 'var(--gold)'    },
  { to: '/admin/properties', label: 'Properties',     icon: Building,        exact: false, activeClass: 'active-properties', color: 'var(--violet)'  },
  { to: '/admin/cities',     label: 'Regions & Cities',icon: MapPin,         exact: false, activeClass: 'active-cities',     color: 'var(--cyan)'    },
  { to: '/admin/contacts',   label: 'CRM Contacts',   icon: Contact2,        exact: false, activeClass: 'active-contacts',   color: 'var(--rose)'    },
  { to: '/admin/leads',      label: 'Leads',          icon: Users,           exact: false, activeClass: 'active-leads',      color: 'var(--emerald)' },
  { to: '/admin/clients',    label: 'Clients',        icon: UserPlus,        exact: false, activeClass: 'active-clients',    color: 'var(--orange)'  },
  { to: '/admin/promotions', label: 'Promotions',     icon: Megaphone,       exact: false, activeClass: 'active-promotions', color: 'var(--gold)'    },
  { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare,   exact: false, activeClass: 'active-promotions', color: 'var(--orange)'  },
  { to: '/admin/franchise',  label: 'Franchise Mgt',  icon: Shield,          exact: false, activeClass: 'active-cities',     color: 'var(--cyan)'    },
  { to: '/admin/engagement', label: 'User Engagement',icon: Activity,        exact: false, activeClass: 'active-engagement', color: 'var(--rose)'    },
  { to: '/admin/marquee',    label: 'Scrolling Bands',icon: Layers,          exact: false, activeClass: 'active-promotions', color: 'var(--cyan)'    },
  { to: '/admin/settings',   label: 'Settings',       icon: Settings,        exact: false, activeClass: 'active-settings',   color: 'var(--violet)'  },
  { to: '/admin/questions',  label: 'Questions & FAQ',icon: MessageSquare,   exact: false, activeClass: 'active-promotions', color: 'var(--gold)'    },
  { to: '/admin/guide',      label: 'System Guide',   icon: BookOpen,        exact: false, activeClass: 'active-settings',   color: 'var(--emerald)' },
];

const AdminLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { adminLogout, adminUser } = useAdminAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const getPageTitle = () => {
    const match = NAV_ITEMS.find(n => isActive(n));
    return match?.label || 'Admin Portal';
  };

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="logo-link">
            <Logo size={30} />
            <div>
              <div className="logo-text">Snap<span>Adda</span></div>
              <span className="sidebar-badge">Admin Portal</span>
            </div>
          </Link>
          <button 
            className="sidebar-close-btn"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>

          {NAV_ITEMS.slice(0, 4).map(item => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                className={`nav-item ${active ? item.activeClass : ''} ${active ? 'active' : ''}`}
              >
                <span className="nav-icon" style={active ? { color: item.color } : {}}>
                  <Icon size={17} />
                </span>
                {item.label}
              </Link>
            );
          })}

          <div className="nav-section-label" style={{ marginTop: '0.5rem' }}>Management</div>

          {NAV_ITEMS.slice(4).map(item => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                className={`nav-item ${active ? item.activeClass : ''} ${active ? 'active' : ''}`}
              >
                <span className="nav-icon" style={active ? { color: item.color } : {}}>
                  <Icon size={17} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{
            margin: '0 0.75rem 0.5rem',
            padding: '0.75rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <img
                src={adminUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminUser?.name || 'Admin')}&background=9b59f5&color=fff&bold=true`}
                alt="Admin"
                style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--violet)' }}
              />
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{adminUser?.name || 'Admin'}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--violet)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>● Authenticated</div>
              </div>
            </div>
            <LogoutButton onLogout={adminLogout} />
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
              <span className="topbar-title desktop-only">{getPageTitle()}</span>
              {/* Mobile-Only Title */}
              <span className="topbar-title mobile-only" style={{ display: 'none', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {getPageTitle()}
              </span>
              
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
            <span className="topbar-time">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="topbar-divider" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="topbar-status-dot" />
              <span className="topbar-status-text">Server Online</span>
            </div>
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
      </main>
    </div>
  );
};

export default AdminLayout;
