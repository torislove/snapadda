import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './contexts/AdminAuthContext';

// Page components - Critical
import AdminLayout from './pages/admin/Layout';
import AdminDashboard from './pages/admin/Dashboard';

// Page components - Secondary (Lazy Loaded)
const AdminProperties = lazy(() => import('./pages/admin/Properties'));
const AdminCities = lazy(() => import('./pages/admin/Cities'));
const AdminLeads = lazy(() => import('./pages/admin/Leads'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminClients = lazy(() => import('./pages/admin/Clients'));
const AdminContacts = lazy(() => import('./pages/admin/Contacts'));
const AdminPromotions = lazy(() => import('./pages/admin/Promotions'));
const AdminTestimonials = lazy(() => import('./pages/admin/Testimonials'));
const AdminFranchise = lazy(() => import('./pages/admin/Franchise'));
const AdminQuestions = lazy(() => import('./pages/admin/Questions'));
const AdminMarquee = lazy(() => import('./pages/admin/MarqueeStrips'));
const AdminEngagement = lazy(() => import('./pages/admin/AdminEngagement'));
const SystemGuide = lazy(() => import('./pages/admin/SystemGuide'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminCommsHub = lazy(() => import('./pages/admin/CommsHub'));

const AdminLoader = () => (
  <div style={{ 
    height: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#0a0a0a', 
    color: 'var(--gold)' 
  }}>
    <div className="shimmer" style={{ width: '120px', height: '4px', background: 'var(--gold)', borderRadius: '4px' }} />
  </div>
);


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
  // --- BROWSWER CACHE & VERSIONING SYNC ---
  useEffect(() => {
    // @ts-ignore
    const currentVersion = import.meta.env.VITE_APP_VERSION;
    const storedVersion = localStorage.getItem('snapadda_admin_version');

    if (currentVersion && storedVersion && currentVersion !== storedVersion) {
      console.log('🚀 New admin version detected. Purging cache and reloading...');
      localStorage.clear(); 
      localStorage.setItem('snapadda_admin_version', currentVersion);
      window.location.reload();
    } else if (currentVersion) {
      localStorage.setItem('snapadda_admin_version', currentVersion);
    }
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<AdminLoader />}>
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
            <Route path="settings" element={<AdminSettings />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="franchise" element={<AdminFranchise />} />
            <Route path="questions" element={<AdminQuestions />} />
            <Route path="engagement" element={<AdminEngagement />} />
            <Route path="marquee" element={<AdminMarquee />} />
            <Route path="comms" element={<AdminCommsHub />} />
            <Route path="guide" element={<SystemGuide />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
