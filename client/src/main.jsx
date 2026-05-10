import { StrictMode } from 'react';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for Instant PWA Loading
registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
});
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './i18n';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "placeholder_if_missing"}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
