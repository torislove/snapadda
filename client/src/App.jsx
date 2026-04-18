import { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import GlobalLoader from './components/GlobalLoader';
import FloatingOffers from './components/FloatingOffers';
import { useNotifications } from './hooks/useNotifications';

// Global HUD components - Symmetrically aligned
const UnitConverter = lazy(() => import('./components/UnitConverter'));
const ComparisonHud = lazy(() => import('./components/ComparisonHud'));

// Page components
const Home = lazy(() => import('./pages/Home'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const Login = lazy(() => import('./pages/Login'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RequestPage = lazy(() => import('./pages/RequestPage'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));

import Logo from './components/Logo';

// Minimalist High-Performance Loader
const EliteLoader = () => (
  <div style={{ 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'var(--bg-deep)',
  }}>
    <Logo size={42} showText={false} />
    <div className="shimmer" style={{ width: '80px', height: '3px', background: 'var(--gold)', marginTop: '1.5rem', borderRadius: '4px' }} />
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
  useNotifications();
  const location = useLocation();
  const showHeader = location.pathname !== '/login';

  return (
    <>
      {showHeader && <Header />}
      <Suspense fallback={<EliteLoader />}>
        {/* Instant Routing without artificial delays */}
        <div style={{ width: '100%' }}>
          <Routes location={location}>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/request-callback" element={<RequestPage />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Suspense>
      <Suspense fallback={null}>
        {/* Global HUD Elements Restored and Symmetrically Positioned */}
        <UnitConverter />
        <ComparisonHud />
        <FloatingOffers />
      </Suspense>
    </>
  );
}

export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Initial Load Sequence
    const timer = setTimeout(() => setIsAppLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isAppLoading && <GlobalLoader key="loader" />}
      </AnimatePresence>
      <LazyMotion features={domAnimation}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </LazyMotion>
    </>
  );
}
