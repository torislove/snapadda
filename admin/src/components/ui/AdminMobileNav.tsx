import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Building2, Users, Settings, MessageSquare } from 'lucide-react';

interface AdminMobileNavProps {
  isVisible?: boolean;
}

const navItems = [
  { id: 'dashboard',   icon: LayoutDashboard, label: 'Home',      path: '/admin' },
  { id: 'properties',  icon: Building2,       label: 'Listings',  path: '/admin/properties' },
  { id: 'leads',       icon: Users,           label: 'Leads',     path: '/admin/leads' },
  { id: 'contacts',    icon: MessageSquare,   label: 'Contacts',  path: '/admin/contacts' },
  { id: 'settings',    icon: Settings,        label: 'Settings',  path: '/admin/settings' },
];

export const AdminMobileNav: React.FC<AdminMobileNavProps> = ({ isVisible = true }) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!isVisible) return null;

  return (
    <nav
      className="admin-mobile-nav"
      role="navigation"
      aria-label="Admin navigation"
    >
      {navItems.map((item) => {
        const isActive =
          item.path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.path);

        const Icon = item.icon;

        return (
          <motion.button
            key={item.id}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(30);
              navigate(item.path);
            }}
            whileTap={{ scale: 0.88 }}
            className={`admin-mobile-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            style={{ border: 'none', cursor: 'pointer', background: 'none' }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Active glow bg */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="admin-nav-glow"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    style={{
                      position: 'absolute', inset: '-8px',
                      background: 'rgba(124,58,237,0.1)',
                      borderRadius: '12px', zIndex: 0,
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Active top indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="admin-nav-dot"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    style={{
                      position: 'absolute', top: '-12px', left: '50%',
                      transform: 'translateX(-50%)',
                      width: '20px', height: '2.5px',
                      background: 'var(--violet)',
                      borderRadius: '0 0 4px 4px',
                    }}
                  />
                )}
              </AnimatePresence>

              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.75}
                style={{ position: 'relative', zIndex: 1 }}
              />
            </div>

            <span style={{
              fontSize: '0.57rem', fontWeight: isActive ? 700 : 500,
              letterSpacing: '0.03em',
            }}>
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
};
