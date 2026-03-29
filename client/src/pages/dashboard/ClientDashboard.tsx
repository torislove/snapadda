import { Outlet, Link, useLocation } from 'react-router-dom';
import { Heart, User, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Explore', icon: Search },
    { path: '/dashboard/favorites', label: 'Saved', icon: Heart },
    { path: '/dashboard/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="client-dashboard">
      <main className="dashboard-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="page-wrapper"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation — App-like experience */}
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="icon-wrapper">
                <Icon size={24} />
                {isActive && (
                  <motion.div
                    className="active-indicator"
                    layoutId="nav-indicator"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default ClientDashboard;
