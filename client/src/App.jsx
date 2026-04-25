import { useState, useEffect } from 'react';
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

// Page components
import Home from './pages/Home';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import RequestPage from './pages/RequestPage';
import SearchResults from './pages/SearchResults';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

import Logo from './components/Logo';
import { useGoogleMarketing } from './utils/useGoogleMarketing';

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

import MobileNav from './components/MobileNav';

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
        paddingBottom: showHeader ? 'calc(65px + env(safe-area-inset-bottom))' : 0,
        // Only apply bottom padding on mobile/app context
        '--mobile-padding': '70px'
      }} className="app-main-content">
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
      <UnitConverter />
      <ComparisonHud />
      <FloatingOffers />
      <MobileNav />
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
          <AppContent />
        </BrowserRouter>
      </LazyMotion>
    </>
  );
}
