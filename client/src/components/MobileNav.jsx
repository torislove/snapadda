import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, Heart, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'search', icon: Search, label: 'Search', path: '/search' },
    { id: 'saved', icon: Heart, label: 'Saved', path: '/dashboard/saved' },
    { id: 'support', icon: MessageCircle, label: 'VIP Callback', path: '/request-callback' },
    { id: 'profile', icon: User, label: 'Profile', path: '/dashboard' },
  ];

  // Hide on login and onboarding
  if (['/login', '/onboarding'].includes(location.pathname)) return null;

  return (
    <nav 
      className="mobile-only"
      style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 'calc(65px + env(safe-area-inset-bottom))',
      background: 'rgba(5, 5, 10, 0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 1000,
      padding: '0 10px',
      boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
    }}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.id === 'profile' && location.pathname.startsWith('/dashboard'));
        
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '4px', border: 'none', background: 'none',
              color: isActive ? 'var(--gold)' : 'var(--txt-muted)',
              transition: 'color 0.2s ease',
              position: 'relative',
              padding: '10px 0',
            }}
          >
            <item.icon 
              size={22} 
              strokeWidth={isActive ? 2.5 : 2}
              style={{ filter: isActive ? 'drop-shadow(0 0 8px rgba(232, 184, 75, 0.3))' : 'none' }}
            />
            <span style={{ 
              fontSize: '0.65rem', 
              fontWeight: isActive ? 800 : 500,
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}>
              {item.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="nav-glow"
                style={{
                  position: 'absolute', top: -1, width: '40px', height: '2px',
                  background: 'var(--gold)', borderRadius: '99px',
                  boxShadow: '0 0 10px var(--gold)',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
