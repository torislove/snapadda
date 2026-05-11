import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Search, Plus, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { triggerHaptic } from '../utils/haptics';

const HIDE_PATHS = ['/login', '/post-property'];

export default function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  // Hide on property detail pages and specified paths
  if (location.pathname.startsWith('/property/')) return null;
  if (HIDE_PATHS.includes(location.pathname)) return null;

  const navItems = [
    { label: 'Home',    path: '/',          icon: Home },
    { label: 'Search',  path: '/search',    icon: Search },
    { label: 'Post',    path: '/post-property', icon: Plus, primary: true },
    { label: 'Activity',path: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: user ? '/dashboard' : '/login', icon: User },
  ];

  return (
    <div className="mobile-nav-container">
      <nav className="premium-glass-island" role="navigation" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          const Icon = item.icon;

          if (item.primary) {
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => triggerHaptic('light')}
                className="bottom-nav-item bottom-nav-center"
                aria-label={item.label}
              >
                <motion.div
                  className="btn-glowing-center-premium"
                  whileTap={{ scale: 0.88, rotate: 45 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                >
                  <Icon size={22} strokeWidth={2.5} color="#000" />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => triggerHaptic('light')}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="nav-item-content">
                {/* Active indicator pill */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="nav-active-pill"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </AnimatePresence>

                <motion.div
                  animate={isActive
                    ? { scale: 1.15, y: -1 }
                    : { scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.75}
                    color={isActive ? 'var(--gold)' : 'rgba(255,255,255,0.38)'}
                  />
                </motion.div>

                <span className={`nav-label ${isActive ? 'label-active' : ''}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
