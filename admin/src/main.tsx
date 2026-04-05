import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AdminAuthProvider>
        <App />
      </AdminAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
