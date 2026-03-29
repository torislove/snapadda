import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './contexts/AdminAuthContext';
import AdminLayout from './pages/admin/Layout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProperties from './pages/admin/Properties';
import AdminCities from './pages/admin/Cities';
import AdminLeads from './pages/admin/Leads';
import AdminSettings from './pages/admin/Settings';
import AdminClients from './pages/admin/Clients';
import AdminContacts from './pages/admin/Contacts';
import AdminFranchise from './pages/admin/Franchise';
import AdminLogin from './pages/admin/Login';

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { adminUser, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', color: '#c9a84c' }}>Authenticating...</div>;
  }

  if (!adminUser || adminUser.role !== 'admin') {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
};

const AntiAuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { adminUser, isLoading } = useAdminAuth();
  if (!isLoading && adminUser?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        <Route path="/admin/login" element={
          <AntiAuthRoute>
            <AdminLogin />
          </AntiAuthRoute>
        } />

        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="cities" element={<AdminCities />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="franchise" element={<AdminFranchise />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="clients" element={<AdminClients />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
