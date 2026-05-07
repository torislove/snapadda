import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { triggerHaptic } from '../utils/haptics';

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const avatarUrl = user?.picture || user?.avatar || user?.photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e8b84b&color=000&bold=true&size=64`;

  const navItems = [
    { id: 'home',    icon: Home,          label: 'Home',        path: '/' },
    { id: 'search',  icon: Search,        label: 'Search',      path: '/search' },
    { id: 'saved',   icon: Heart,         label: 'Saved',       path: '/dashboard/saved' },
    { id: 'support', icon: MessageCircle, label: 'Call VIP',    path: '/request-callback' },
  ];

  // Hide on login and onboarding
  if (['/login', '/onboarding'].includes(location.pathname)) return null;

  const isProfileActive = location.pathname.startsWith('/dashboard');

  return (
    <nav
      className="mobile-only"
      style={{
        position: 'fixed', bottom: '20px', left: '15px', right: '15px',
        height: '68px',
        background: 'rgba(10, 10, 20, 0.85)',
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
          (item.id === 'saved' && location.pathname === '/dashboard/saved');
        return (
          <motion.button
            key={item.id}
            onClick={() => {
              triggerHaptic('light');
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
                layoutId="nav-bg-glow"
                style={{ position: 'absolute', width: '45px', height: '45px', background: 'rgba(232,184,75,0.12)', borderRadius: '16px', filter: 'blur(10px)', zIndex: -1 }}
              />
            )}
            <item.icon
              size={24} strokeWidth={isActive ? 2.5 : 1.8}
              style={{ filter: isActive ? 'drop-shadow(0 0 10px rgba(232,184,75,0.6))' : 'none', transform: isActive ? 'translateY(-2px)' : 'none', transition: 'all 0.3s ease' }}
            />
            <span style={{ fontSize: '0.62rem', fontWeight: isActive ? 900 : 600, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: isActive ? 1 : 0.7 }}>
              {item.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                style={{ position: 'absolute', bottom: '6px', width: '4px', height: '4px', background: 'var(--gold)', borderRadius: '50%', boxShadow: '0 0 8px var(--gold)' }}
              />
            )}
          </motion.button>
        );
      })}

      {/* Profile button with Google avatar */}
      <motion.button
        onClick={() => {
          triggerHaptic('light');
          navigate('/dashboard');
        }}
        whileTap={{ scale: 0.88 }}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '4px',
          border: 'none', background: 'none',
          color: isProfileActive ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
          transition: 'all 0.3s ease', position: 'relative', height: '100%', cursor: 'pointer',
        }}
      >
        {isProfileActive && (
          <motion.div
            layoutId="nav-bg-glow"
            style={{ position: 'absolute', width: '45px', height: '45px', background: 'rgba(232,184,75,0.12)', borderRadius: '16px', filter: 'blur(10px)', zIndex: -1 }}
          />
        )}
        {user ? (
          <img
            src={avatarUrl}
            alt="Profile"
            style={{
              width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover',
              border: `2px solid ${isProfileActive ? 'var(--gold)' : 'rgba(255,255,255,0.2)'}`,
              filter: isProfileActive ? 'drop-shadow(0 0 8px rgba(232,184,75,0.6))' : 'none',
              transform: isProfileActive ? 'translateY(-2px)' : 'none',
              transition: 'all 0.3s ease',
            }}
            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e8b84b&color=000&bold=true`; }}
          />
        ) : (
          <div style={{
            width: '26px', height: '26px', borderRadius: '50%',
            background: isProfileActive ? 'rgba(232,184,75,0.3)' : 'rgba(255,255,255,0.08)',
            border: `2px solid ${isProfileActive ? 'var(--gold)' : 'rgba(255,255,255,0.15)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: 900, color: isProfileActive ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
            transform: isProfileActive ? 'translateY(-2px)' : 'none',
            transition: 'all 0.3s ease',
          }}>
            ?
          </div>
        )}
        <span style={{ fontSize: '0.62rem', fontWeight: isProfileActive ? 900 : 600, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: isProfileActive ? 1 : 0.7 }}>
          {user ? user.name?.split(' ')[0] || 'Me' : 'Login'}
        </span>
        {isProfileActive && (
          <motion.div
            layoutId="nav-indicator"
            style={{ position: 'absolute', bottom: '6px', width: '4px', height: '4px', background: 'var(--gold)', borderRadius: '50%', boxShadow: '0 0 8px var(--gold)' }}
          />
        )}
      </motion.button>
    </nav>
  );
};

export default MobileNav;
