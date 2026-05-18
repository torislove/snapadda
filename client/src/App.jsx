import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LazyMotion, domAnimation, AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import GlobalLoader from './components/GlobalLoader';
import FloatingOffers from './components/FloatingOffers';
import { useBehaviorTracker } from './hooks/useBehaviorTracker';
import LeadCaptureModal from './components/LeadCaptureModal';
import { pruneResources } from './utils/PerformanceUtilities';

// Global HUD components - Symmetrically aligned (Lazy Loaded to unblock main thread)
const ComparisonHud = lazy(() => import('./components/ComparisonHud'));
const MobileBottomNav = lazy(() => import('./components/MobileBottomNav'));

// Page components - Critical (Static previously, now Lazy for FCP)
const Home = lazy(() => import('./pages/Home'));

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
const LocalAgency = lazy(() => import('./pages/LocalAgency'));
const PromotionDetail = lazy(() => import('./pages/PromotionDetail'));
const RegionalDirectory = lazy(() => import('./pages/RegionalDirectory'));

import Logo from './components/Logo';
import { useGoogleMarketing } from './utils/useGoogleMarketing';
import ScrollToTop from './components/ScrollToTop';
import PwaInstallBanner from './components/PwaInstallBanner';
// SnapAdda Quantum Loader (Imported above)

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <GlobalLoader mode="inline" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  
  // Allow both clients and admins to access client routes to prevent redirect loops
  const hasAccess = user.role === 'client' || user.role === 'admin';
  if (!hasAccess) return <Navigate to="/" replace />;
  
  // Enforce mandatory onboarding for clients to ensure lead quality
  if (user.role === 'client' && !user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}


import Footer from './components/Footer';

function PageTransitionWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      style={{ width: '100%', minHeight: '100%', willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

function AppContent() {

  useGoogleMarketing();
  const { showModal, setShowModal, getTopPreferences } = useBehaviorTracker();
  const location = useLocation();

  useEffect(() => {
    // Prune memory-heavy resources on every route change for snappy performance
    pruneResources();
  }, [location]);

  const showHeader = location.pathname !== '/login';
  const showFooter = location.pathname !== '/login';

  return (
    <>
      {showHeader && <Header />}
      <div style={{ 
        width: '100%',
        paddingBottom: '20px', 
      }} className="app-main-content">
        <Suspense fallback={<GlobalLoader mode="inline" />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/login" element={<PageTransitionWrapper><Login /></PageTransitionWrapper>} />
              <Route path="/" element={<PageTransitionWrapper><Home /></PageTransitionWrapper>} />
              <Route path="/search" element={<PageTransitionWrapper><SearchResults /></PageTransitionWrapper>} />
              <Route path="/property/:id" element={<ProtectedRoute><PageTransitionWrapper><PropertyDetails /></PageTransitionWrapper></ProtectedRoute>} />
              <Route path="/promotion/:id" element={<PageTransitionWrapper><PromotionDetail /></PageTransitionWrapper>} />
              <Route path="/local-agency/:city" element={<PageTransitionWrapper><LocalAgency /></PageTransitionWrapper>} />
              <Route path="/post-property" element={<PageTransitionWrapper><PostProperty /></PageTransitionWrapper>} />
              <Route path="/compare" element={<PageTransitionWrapper><ComparisonRadar /></PageTransitionWrapper>} />
              <Route path="/onboarding" element={<ProtectedRoute><PageTransitionWrapper><Onboarding /></PageTransitionWrapper></ProtectedRoute>} />
              <Route path="/dashboard/*" element={<ProtectedRoute><PageTransitionWrapper><Dashboard /></PageTransitionWrapper></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><PageTransitionWrapper><Dashboard defaultTab="profile" /></PageTransitionWrapper></ProtectedRoute>} />
              <Route path="/request-callback" element={<PageTransitionWrapper><RequestPage /></PageTransitionWrapper>} />
              <Route path="/terms" element={<PageTransitionWrapper><Terms /></PageTransitionWrapper>} />
              <Route path="/privacy" element={<PageTransitionWrapper><Privacy /></PageTransitionWrapper>} />
              <Route path="/regional-directory" element={<PageTransitionWrapper><RegionalDirectory /></PageTransitionWrapper>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>
      {showFooter && <Footer />}
      <ComparisonHud />
      <FloatingOffers />
      <MobileBottomNav />
      <PwaInstallBanner />
      <LeadCaptureModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        preferredLocation={getTopPreferences()?.preferredLocation} 
      />
    </>
  );
}


import { Toaster } from 'react-hot-toast';

export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  // --- BROWSER CACHE & VERSIONING SYNC ---
  useEffect(() => {
    setIsAppLoading(false);
    
    const currentVersion = import.meta.env.VITE_APP_VERSION;
    const storedVersion = localStorage.getItem('snapadda_app_version');

    if (currentVersion && storedVersion && currentVersion !== storedVersion) {
      // Selective cache clear — preserve user session to prevent forced logout on deploy
      const savedUser = localStorage.getItem('snapadda_user');
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key !== 'snapadda_user' && key !== 'snapadda_app_version') keysToRemove.push(key);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      if (savedUser) localStorage.setItem('snapadda_user', savedUser);
      localStorage.setItem('snapadda_app_version', currentVersion);
      // Removed redundant window.location.reload() to prevent double-reload with PWA Service Worker
    } else if (currentVersion) {
      localStorage.setItem('snapadda_app_version', currentVersion);
    }
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnimatePresence>
        {isAppLoading && <GlobalLoader key="loader" />}
      </AnimatePresence>
      <LazyMotion features={domAnimation}>
        <AppContent />
        <Toaster 
          position="bottom-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--bg-glass-heavy)',
              color: 'var(--txt-primary)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-glass)',
              borderRadius: '20px',
              padding: '16px 24px',
              fontSize: '0.9rem',
              fontWeight: '600',
              boxShadow: 'var(--shadow-elite)',
            },
            success: {
              iconTheme: {
                primary: 'var(--emerald)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--rose)',
                secondary: 'white',
              },
            },
          }}
        />
      </LazyMotion>
    </BrowserRouter>
  );
}
