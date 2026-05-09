import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import GlobalLoader from './components/GlobalLoader';
import FloatingOffers from './components/FloatingOffers';
import { useNotifications } from './hooks/useNotifications';

// Global HUD components - Symmetrically aligned
import UnitConverter from './components/UnitConverter';
import ComparisonHud from './components/ComparisonHud';
import MobileBottomNav from './components/MobileBottomNav';

// Page components - Critical (Static)
import Home from './pages/Home';

// Page components - Secondary (Lazy Loaded)
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const Login = lazy(() => import('./pages/Login'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RequestPage = lazy(() => import('./pages/RequestPage'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const ComparisonRadar = lazy(() => import('./pages/ComparisonRadar'));
const PostProperty = lazy(() => import('./pages/PostProperty'));

import Logo from './components/Logo';
import { useGoogleMarketing } from './utils/useGoogleMarketing';
import ScrollToTop from './components/ScrollToTop';
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
  useGoogleMarketing();
  const location = useLocation();
  const showHeader = location.pathname !== '/login';

  return (
    <>
      {showHeader && <Header />}
      <div style={{ 
        width: '100%',
        paddingBottom: 0,
      }} className="app-main-content">
        <Suspense fallback={<EliteLoader />}>
          <Routes location={location}>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/post-property" element={<PostProperty />} />
            <Route path="/compare" element={<ComparisonRadar />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Dashboard defaultTab="profile" /></ProtectedRoute>} />
            <Route path="/request-callback" element={<RequestPage />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
      <UnitConverter />
      <ComparisonHud />
      <FloatingOffers />
      <MobileBottomNav />
    </>
  );
}


export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Instant Load - no artificial delay
    setIsAppLoading(false);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isAppLoading && <GlobalLoader key="loader" />}
      </AnimatePresence>
      <LazyMotion features={domAnimation}>
        <BrowserRouter>
          <ScrollToTop />
          <AppContent />
        </BrowserRouter>
      </LazyMotion>
    </>
  );
}
