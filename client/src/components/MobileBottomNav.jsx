import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, PlusCircle, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  // Hide on PropertyDetails page to avoid overlap with action bar
  if (location.pathname.startsWith('/property/')) return null;
  // Hide on PostProperty page to give more space
  if (location.pathname === '/post-property') return null;

  const navItems = [
    { label: 'Home', path: '/', icon: <Home size={22} /> },
    { label: 'Search', path: '/search', icon: <Search size={22} /> },
    { label: 'Post', path: '/post-property', icon: <PlusCircle size={28} />, primary: true },
    { label: 'Dash', path: '/dashboard', icon: <LayoutDashboard size={22} /> },
    { label: 'Profile', path: '/profile', icon: <User size={22} /> },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.label} 
            to={item.path} 
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            style={{ 
              position: 'relative',
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '4px',
              color: isActive ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
              textDecoration: 'none',
              height: '100%'
            }}
          >
            {item.primary ? (
              <div style={{ 
                marginTop: '-30px', 
                background: 'var(--gold)', 
                color: 'black', 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(232,184,75,0.4)',
                border: '4px solid #050a14'
              }}>
                {item.icon}
              </div>
            ) : (
              item.icon
            )}
            {!item.primary && <span style={{ fontSize: '0.62rem', fontWeight: 800 }}>{item.label}</span>}
            {isActive && !item.primary && (
              <motion.div 
                layoutId="nav-glow"
                style={{ 
                  position: 'absolute', top: 0, width: '30px', height: '2px', 
                  background: 'var(--gold)', boxShadow: '0 0 10px var(--gold)',
                  borderRadius: '0 0 4px 4px'
                }} 
              />
            )}
          </Link>
        );
      })}

      <style>{`
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 65px;
          background: rgba(7, 7, 15, 0.98);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.1);
          display: none;
          justify-content: space-around;
          align-items: center;
          z-index: 100000;
          padding-bottom: env(safe-area-inset-bottom);
          box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
        }

        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: flex;
          }
        }

        .bottom-nav-item {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .bottom-nav-item:active {
          transform: scale(0.9);
        }
      `}</style>
    </nav>
  );
}
