import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Search, Plus, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { triggerMicroLead } from '../utils/tracker';
import { useSoundEffects } from '../utils/useSoundEffects';

const HIDE_PATHS = ['/login', '/post-property'];

export default function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { playTick } = useSoundEffects();

  // Hide on specified paths
  if (HIDE_PATHS.includes(location.pathname)) return null;
  const navItems = [
    { label: t('nav.home', 'Home'),    path: '/',          icon: Home },
    { label: t('nav.search', 'Search'),  path: '/search',    icon: Search },
    { label: t('nav.post', 'Post Property'),    path: '/post-property', icon: Plus, primary: true },
    { label: t('nav.activity', 'Activity'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('nav.profile', 'Profile'), path: user ? '/dashboard' : '/login', icon: User },
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
                id={`btn-mobnav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                key={item.label}
                to={item.path}
                onClick={() => {
                  playTick();
                  triggerMicroLead({ source: 'Post Property Intent', message: 'User clicked Post Property from Mobile Nav' });
                }}
                className="bottom-nav-item bottom-nav-center"
                aria-label={item.label}
              >
                <div className="nav-item-content">
                  <motion.div
                    className="btn-glowing-center-premium"
                    whileTap={{ scale: 0.88, rotate: 45 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  >
                    <Icon size={22} strokeWidth={2.5} color="#000" />
                  </motion.div>
                  <span className="nav-label label-primary" style={{ color: 'var(--gold)', fontWeight: 800 }}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          }

          return (
            <Link
              id={`btn-mobnav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              key={item.label}
              to={item.path}
              onClick={() => {
                playTick();
              }}
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
