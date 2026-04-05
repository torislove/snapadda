import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import UnitConverter from './components/UnitConverter';
import FloatingHub from './components/ui/FloatingHub';

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
  if (!user.onboardingCompleted && location.pathname !== '/onboarding' && location.pathname !== '/') return <Navigate to="/onboarding" replace />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const showHeader = location.pathname !== '/login';
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX - 300, y: e.clientY - 300 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div className="cursor-glow" style={{ transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)` }} />
      {showHeader && <Header />}
      <Suspense fallback={<EliteLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}><Login /></motion.div>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <motion.div initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(10px)' }} transition={{ duration: 0.4 }}><Home /></motion.div>
              </ProtectedRoute>
            } />
            <Route path="/property/:id" element={
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}><PropertyDetails /></motion.div>
            } />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/request-callback" element={
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><RequestPage /></motion.div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
        <UnitConverter />
      </Suspense>
      <FloatingHub />
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
