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
const AdminBroadcast = lazy(() => import('./pages/admin/Broadcast'));
const AdminQuestions = lazy(() => import('./pages/admin/Questions'));
const AdminMarquee = lazy(() => import('./pages/admin/MarqueeStrips'));
const AdminEngagement = lazy(() => import('./pages/admin/AdminEngagement'));
const SystemGuide = lazy(() => import('./pages/admin/SystemGuide'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminFranchise = lazy(() => import('./pages/admin/Franchise'));
const VerificationQueue = lazy(() => import('./pages/admin/VerificationQueue'));

const AdminLoader = () => (
  <div style={{ 
    height: '100vh', 
    width: '100vw',
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    background: 'var(--midnight)', 
    color: 'var(--gold)',
    gap: '2.5rem',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999
  }}>
    <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="shimmer-ring" style={{ 
        position: 'absolute', 
        inset: -15, 
        border: '3px solid rgba(244,208,63,0.05)', 
        borderTop: '3px solid var(--gold)', 
        borderRadius: '50%',
        animation: 'spin 1.2s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite'
      }} />
      <img 
        src="/favicon-round.png" 
        alt="SnapAdda" 
        style={{ width: '90px', height: '90px', objectFit: 'contain', animation: 'pulse-glow 2s infinite alternate', borderRadius: '50%', boxShadow: '0 0 40px var(--gold-glow)' }} 
      />
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: '20px', opacity: 0.8 }}>
        SnapAdda Console
      </div>
      <div style={{ width: '220px', height: '3px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ 
          height: '100%', 
          width: '60%',
          background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
          animation: 'shimmer-bar 1.5s infinite ease-in-out'
        }} />
      </div>
    </div>
    <style>{`
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes shimmer-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
      @keyframes pulse-glow { 0% { filter: drop-shadow(0 0 10px var(--gold-glow)); opacity: 0.8; transform: scale(1); } 100% { filter: drop-shadow(0 0 30px var(--gold-glow)); opacity: 1; transform: scale(1.05); } }
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

    // ─── Passive Backend Keep-Alive (Zero Cost) ───
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const keepWarm = () => {
      fetch(`${API_URL.replace(/\/+$/, '')}/health`, { method: 'HEAD', mode: 'no-cors' }).catch(() => {});
    };
    
    // Ping every 10 minutes to prevent serverless suspension during business hours
    const interval = setInterval(keepWarm, 10 * 60 * 1000);
    keepWarm(); // Initial ping
    
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { 
          background: 'var(--bg-glass-heavy)', 
          color: 'var(--txt-primary)', 
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--border-glass)',
          borderRadius: '16px',
          padding: '12px 20px',
          fontWeight: 700,
          boxShadow: 'var(--shadow-elite)'
        }
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
            <Route path="broadcast" element={<AdminBroadcast />} />
            <Route path="verification" element={<VerificationQueue />} />
            <Route path="guide" element={<SystemGuide />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
