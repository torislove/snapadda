import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import UnitConverter from './components/UnitConverter';

// Lazy loading all routes for maximum startup speed
const Home = lazy(() => import('./pages/Home'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const Login = lazy(() => import('./pages/Login'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RequestPage = lazy(() => import('./pages/RequestPage'));

// Minimalist High-Performance Loader
const EliteLoader = () => (
  <div style={{ 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#07070f',
    color: 'var(--gold)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    letterSpacing: '0.2em'
  }}>
    <div className="shimmer" style={{ width: '40px', height: '2px', background: 'var(--gold)', marginBottom: '1rem' }} />
    ELITE LOADING...
  </div>
);

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <EliteLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.role !== 'client') return <Navigate to="/" replace />;
  if (!user.onboardingCompleted && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const showHeader = location.pathname !== '/login';

  return (
    <>
      {showHeader && <Header />}
      <Suspense fallback={<EliteLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/property/:id" element={<ProtectedRoute><PropertyDetails /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/request-callback" element={<RequestPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <UnitConverter />
      </Suspense>
    </>
  );
}

export default function App() {
  console.log('App router rendering...');
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
