import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building, Users, MapPin, LogOut, Settings, UserPlus, Menu, Contact2, Shield } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import './Layout.css';

const AdminLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      {isSidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
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
          <Link to="/admin/contacts" className={`nav-item ${location.pathname.includes('/admin/contacts') ? 'active' : ''}`}>
            <Contact2 size={20} /> CRM Contacts
          </Link>
          <Link to="/admin/leads" className={`nav-item ${location.pathname.includes('/admin/leads') ? 'active' : ''}`}>
            <Users size={20} /> Leads
          </Link>
          <Link to="/admin/clients" className={`nav-item ${location.pathname.includes('/admin/clients') ? 'active' : ''}`}>
            <UserPlus size={20} /> Clients
          </Link>
          <Link to="/admin/franchise" className={`nav-item ${location.pathname.includes('/admin/franchise') ? 'active' : ''}`}>
            <Shield size={20} /> Franchise
          </Link>
          <Link to="/admin/settings" className={`nav-item ${location.pathname.includes('/admin/settings') ? 'active' : ''}`}>
            <Settings size={20} /> Settings
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
          <div className="flex items-center gap-3">
            <button className="admin-mobile-toggle" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2>Admin Portal</h2>
          </div>
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
