
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Building2, Users, FileText } from 'lucide-react';

export const AdminMobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dash', path: '/' },
    { id: 'properties', icon: Building2, label: 'Assets', path: '/properties' },
    { id: 'leads', icon: Users, label: 'Clients', path: '/clients' },
    { id: 'settings', icon: FileText, label: 'Pages', path: '/pages' },
  ];

  // Only show on mobile
  return (
    <nav
      className="admin-mobile-nav"
      style={{
        position: 'fixed', bottom: '15px', left: '15px', right: '15px',
        height: '68px',
        background: 'rgba(10, 10, 20, 0.95)',
        backdropFilter: 'blur(30px) saturate(200%)',
        WebkitBackdropFilter: 'blur(30px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        zIndex: 9999, padding: '0 10px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1)',
        transform: 'translateZ(0)',
      }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path ||
          (item.path !== '/' && location.pathname.startsWith(item.path));
          
        return (
          <motion.button
            key={item.id}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(40);
              navigate(item.path);
            }}
            whileTap={{ scale: 0.88 }}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '4px',
              border: 'none', background: 'none',
              color: isActive ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease', position: 'relative', height: '100%', cursor: 'pointer',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="admin-nav-bg-glow"
                style={{ position: 'absolute', width: '45px', height: '45px', background: 'rgba(232,184,75,0.12)', borderRadius: '16px', filter: 'blur(10px)', zIndex: -1 }}
              />
            )}
            <item.icon
              size={22} strokeWidth={isActive ? 2.5 : 1.8}
              style={{ filter: isActive ? 'drop-shadow(0 0 10px rgba(232,184,75,0.6))' : 'none', transform: isActive ? 'translateY(-2px)' : 'none', transition: 'all 0.3s ease' }}
            />
            <span style={{ fontSize: '0.62rem', fontWeight: isActive ? 900 : 600, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: isActive ? 1 : 0.7 }}>
              {item.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="admin-nav-indicator"
                style={{ position: 'absolute', bottom: '6px', width: '4px', height: '4px', background: 'var(--gold)', borderRadius: '50%', boxShadow: '0 0 8px var(--gold)' }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
};
