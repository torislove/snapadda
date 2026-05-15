import { StrictMode } from 'react';
import { registerSW } from 'virtual:pwa-register';

// ─── Zero-Cost Backend Wake-up (Pre-flight) ───
const API_URL = import.meta.env.VITE_API_URL || '/api';
fetch(`${API_URL.replace(/\/+$/, '')}/health`, { method: 'HEAD', mode: 'no-cors' }).catch(() => {});

// Register Service Worker for Instant PWA Loading and Auto Update
const updateSW = registerSW({
  onNeedRefresh() {
    // Automatically force update when new version is available
    updateSW(true);
  },
  onOfflineReady() {},
});
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './i18n';

import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "placeholder_if_missing"}>
        <AuthProvider>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
