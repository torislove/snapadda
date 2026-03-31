import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { fetchSetting } from './services/api';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import ClientDashboard from './pages/dashboard/ClientDashboard';
import Explore from './pages/dashboard/Explore';
import Favorites from './pages/dashboard/Favorites';
import Profile from './pages/dashboard/Profile';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Ensure only clients can access the client panel
  if (user.role !== 'client') {
    return <Navigate to="/" replace />;
  }

  if (!user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

import { useState } from 'react';

const SeoManager = () => {
  const location = useLocation();
  const [globalSeo, setGlobalSeo] = useState<any>(null);

  useEffect(() => {
    fetchSetting('seo')
      .then((data) => {
        setGlobalSeo(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const applySeo = (overrides?: any) => {
      const origin = window.location.origin;
      const url = `${origin}${location.pathname}`;
      const defaultTitle = 'SnapAdda — Plots, Apartments & Villas';
      
      const seo = {
        title: overrides?.title || globalSeo?.title || defaultTitle,
        description: overrides?.description || globalSeo?.description || '',
        keywords: overrides?.keywords || globalSeo?.keywords || '',
        image: overrides?.image || globalSeo?.image || `${origin}/favicon.svg`,
        robots: overrides?.robots || globalSeo?.robots || 'index, follow',
        canonical: overrides?.canonical || globalSeo?.canonical || url,
        schema: overrides?.schema || null
      };

      // Apply to DOM
      document.title = seo.title;

      const updateMeta = (attr: 'name' | 'property', key: string, value: string) => {
        if (!value) return;
        const selector = attr === 'property' ? `meta[property="${key}"]` : `meta[name="${key}"]`;
        let tag = document.head.querySelector(selector) as HTMLMetaElement | null;
        if (!tag) {
          tag = document.createElement('meta');
          if (attr === 'property') tag.setAttribute('property', key);
          else tag.setAttribute('name', key);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', value);
      };

      const setCanonical = (href: string) => {
        let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement('link');
          link.setAttribute('rel', 'canonical');
          document.head.appendChild(link);
        }
        link.setAttribute('href', href);
      };

      updateMeta('name', 'description', seo.description);
      updateMeta('name', 'keywords', seo.keywords);
      updateMeta('property', 'og:title', seo.title);
      updateMeta('property', 'og:description', seo.description);
      updateMeta('property', 'og:image', seo.image);
      updateMeta('property', 'og:url', url);
      updateMeta('name', 'twitter:title', seo.title);
      updateMeta('name', 'twitter:description', seo.description);
      updateMeta('name', 'twitter:image', seo.image);
      updateMeta('name', 'robots', seo.robots);
      setCanonical(seo.canonical);

      // JSON-LD
      let script = document.getElementById('snap-json-ld') as HTMLScriptElement | null;
      if (seo.schema) {
        if (!script) {
          script = document.createElement('script');
          script.id = 'snap-json-ld';
          script.type = 'application/ld+json';
          document.head.appendChild(script);
        }
        script.text = JSON.stringify(seo.schema);
      } else if (script) {
        script.remove();
      }
    };

    const handleSeoUpdate = (e: any) => {
      applySeo(e.detail);
    };

    // Initial apply for current route
    applySeo();

    window.addEventListener('snap_seo_update', handleSeoUpdate);
    return () => window.removeEventListener('snap_seo_update', handleSeoUpdate);
  }, [location.pathname, globalSeo]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <SeoManager />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        
        {/* Protected Client Application */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/property/:id" element={
          <ProtectedRoute>
            <PropertyDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />

        {/* Client App Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<Explore />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
