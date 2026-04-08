import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';

// Lazy load complex global features
const UnitConverter = lazy(() => import('./components/UnitConverter'));

// Lazy imports for performance optimization
const Home = lazy(() => import('./pages/Home'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const Login = lazy(() => import('./pages/Login'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RequestPage = lazy(() => import('./pages/RequestPage'));
const SearchResults = lazy(() => import('./pages/SearchResults'));

// Minimalist High-Performance Loader (Used only for Auth states)
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
  
  // If user is not a client, they shouldn't be here. Redirect to login to force a correct account.
  if (user.role !== 'client') {
    console.warn('Unauthorized role access:', user.role);
    return <Navigate to="/login" replace />;
  }

  if (!user.onboardingCompleted && location.pathname !== '/onboarding' && location.pathname !== '/') {
    return <Navigate to="/onboarding" replace />;
  }
  
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
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/request-callback" element={<RequestPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Suspense fallback={null}>
        <UnitConverter />
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <LazyMotion features={domAnimation}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </LazyMotion>
  );
}
