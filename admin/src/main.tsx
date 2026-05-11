import { StrictMode } from 'react'
import { registerSW } from 'virtual:pwa-register'

// Register Service Worker for Instant Admin PWA Loading
registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
})
import { createRoot } from 'react-dom/client'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/index.css'
import App from './App.tsx'
import './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AdminAuthProvider>
        <App />
      </AdminAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
