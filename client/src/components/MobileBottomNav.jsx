import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Plus, User, LayoutDashboard, Compass } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { triggerHaptic } from '../utils/haptics';

export default function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  // Hide on PropertyDetails page to avoid overlap with action bar
  if (location.pathname.startsWith('/property/')) return null;
  // Hide on PostProperty page to give more space
  if (location.pathname === '/post-property') return null;

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Explore', path: '/search', icon: Compass },
    { label: 'Post', path: '/post-property', icon: Plus, primary: true },
    { label: 'Activity', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="mobile-nav-container">
      <nav className="mobile-bottom-nav premium-glass-island">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.label} 
              to={item.path} 
              onClick={() => triggerHaptic('light')}
              className={`bottom-nav-item ${item.primary ? 'bottom-nav-center' : ''} ${isActive ? 'active' : ''}`}
            >
              {item.primary ? (
                <motion.div 
                  className="btn-glowing-center-premium"
                  whileTap={{ scale: 0.9, rotate: 90 }}
                >
                  <Icon size={24} strokeWidth={3} />
                </motion.div>
              ) : (
                <div className="nav-item-content">
                  <motion.div
                    animate={isActive ? { scale: 1.2, y: -2 } : { scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Icon 
                      size={20} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      color={isActive ? 'var(--gold)' : 'rgba(255,255,255,0.45)'}
                    />
                  </motion.div>
                  
                  <span className={`nav-label ${isActive ? 'label-active' : ''}`}>
                    {item.label}
                  </span>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        layoutId="active-pill"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="nav-active-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

