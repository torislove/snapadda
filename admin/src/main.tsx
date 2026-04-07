import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import App from './App.tsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "placeholder_if_missing";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AdminAuthProvider>
          <App />
        </AdminAuthProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
