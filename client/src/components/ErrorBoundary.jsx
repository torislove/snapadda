import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw, ShieldAlert } from 'lucide-react';
import Logo from './Logo';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.group('🔴 SnapAdda Critical System Fault');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #070710 0%, #030308 100%)',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '500px',
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(20px)',
            borderRadius: '32px',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            padding: '3rem',
            boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
          }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
              }}>
                <ShieldAlert size={42} color="#f4d03f" />
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Connection Interrupted</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                We've encountered a temporary issue while syncing with the SnapAdda network. Don't worry, your data is safe.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  width: '100%',
                  padding: '1.1rem',
                  borderRadius: '16px',
                  background: 'linear-gradient(90deg, #e8b84b, #b9933a)',
                  color: '#07070f',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 10px 30px rgba(232, 184, 75, 0.25)'
                }}
              >
                <RefreshCcw size={18} /> Restore Connection
              </button>

              <button
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {this.state.showDetails ? 'Hide' : 'View'} Technical Details
              </button>
            </div>

            {this.state.showDetails && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '12px',
                textAlign: 'left',
                fontSize: '0.7rem',
                color: '#f87171',
                overflow: 'auto',
                maxHeight: '200px',
                fontFamily: 'monospace',
                border: '1px solid rgba(248, 113, 113, 0.2)'
              }}>
                <div style={{ fontWeight: 900, marginBottom: '0.5rem' }}>Error: {this.state.error?.message}</div>
                <div style={{ whiteSpace: 'pre-wrap', opacity: 0.8 }}>
                  {this.state.errorInfo?.componentStack}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '3rem', opacity: 0.4 }}>
            <Logo size={24} showText />
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
