import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './contexts/AdminAuthContext';
import { Toaster } from 'react-hot-toast';

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
    width: '100vw',
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#05050a', 
    color: '#e8b84b',
    gap: '2rem',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999
  }}>
    <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="shimmer-ring" style={{ 
        position: 'absolute', 
        inset: -10, 
        border: '2px solid rgba(232,184,75,0.05)', 
        borderTop: '2px solid #e8b84b', 
        borderRadius: '50%',
        animation: 'spin 1.5s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite'
      }} />
      <img 
        src="/favicon-round.png" 
        alt="SnapAdda" 
        style={{ width: '80px', height: '80px', objectFit: 'contain', animation: 'pulse-glow 2s infinite alternate', borderRadius: '50%', boxShadow: '0 0 30px rgba(232,184,75,0.3)' }} 
      />
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '16px' }}>
        SnapAdda Console
      </div>
      <div style={{ width: '200px', height: '2px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ 
          height: '100%', 
          width: '60%',
          background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
          animation: 'shimmer-bar 2s infinite ease-in-out'
        }} />
      </div>
    </div>
    <style>{`
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes shimmer-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
      @keyframes pulse-glow { 0% { filter: drop-shadow(0 0 5px rgba(232,184,75,0.2)); opacity: 0.8; transform: scale(1); } 100% { filter: drop-shadow(0 0 20px rgba(232,184,75,0.5)); opacity: 1; transform: scale(1.05); } }
    `}</style>
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
      <Toaster position="top-right" toastOptions={{
        style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      }} />
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
