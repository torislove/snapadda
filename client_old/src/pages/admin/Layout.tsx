import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building, Users, MapPin, LogOut } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import './Layout.css';

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="logo-link" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Logo size={28} />
            <span style={{ color: 'var(--text-primary)' }}>Snap<span className="text-gold">Adda</span></span>
          </Link>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/admin/properties" className={`nav-item ${location.pathname.includes('/admin/properties') ? 'active' : ''}`}>
            <Building size={20} /> Properties
          </Link>
          <Link to="/admin/cities" className={`nav-item ${location.pathname.includes('/admin/cities') ? 'active' : ''}`}>
            <MapPin size={20} /> Regions & Cities
          </Link>
          <Link to="/admin/leads" className={`nav-item ${location.pathname.includes('/admin/leads') ? 'active' : ''}`}>
            <Users size={20} /> Leads
          </Link>
        </nav>
        <div className="sidebar-footer">
          <Link to="/" className="nav-item">
            <LogOut size={20} /> Exit Admin
          </Link>
        </div>
      </aside>
      <main className="admin-content">
        <header className="admin-topbar">
          <h2>Mediator Portal</h2>
          <div className="user-profile">
            <img src="https://ui-avatars.com/api/?name=Mediator&background=d4af37&color=0a0a0a" alt="Avatar" className="avatar" />
          </div>
        </header>
        <div className="admin-page-content animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
