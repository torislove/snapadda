import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, ShieldAlert, Cpu, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import Logo from './Logo';
import HolographicWrapper from './HolographicWrapper';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
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
          background: '#020205',
          color: '#fff',
          fontFamily: 'var(--font-body)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <HolographicWrapper 
            intensity={1.5} 
            iridescent 
            style={{ maxWidth: '500px', width: '100%', borderRadius: '32px' }}
          >
          <div style={{
            padding: '3.5rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ 
                width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(245, 57, 123, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem',
                border: '1px solid rgba(245, 57, 123, 0.3)',
                boxShadow: '0 0 30px rgba(245, 57, 123, 0.2)'
              }}
            >
              <ShieldAlert size={48} color="#f5397b" />
            </motion.div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>System Divergence</h1>
            <p style={{ color: 'var(--txt-muted)', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              A critical synchronization error has occurred. Our neural link to the Andhra estate registry was temporarily interrupted.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-3d-liquid"
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  background: 'var(--gold)',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  boxShadow: '0 15px 35px rgba(232, 184, 75, 0.3)'
                }}
              >
                <RefreshCcw size={20} /> RESTORE CONNECTION
              </button>

              <button
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '0.5rem'
                }}
              >
                <Terminal size={14} /> 
                {this.state.showDetails ? 'HIDE CORE DUMP' : 'VIEW DIAGNOSTICS'}
                {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {this.state.showDetails && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  style={{ 
                    textAlign: 'left', 
                    background: 'rgba(0,0,0,0.3)', 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    marginTop: '1rem',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                >
                  <pre style={{ margin: 0, fontSize: '0.65rem', color: '#f5397b', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>
                    {this.state.error?.toString()}
                    {"\n\n"}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </motion.div>
              )}
            </div>
          </div>
          </HolographicWrapper>

          <div style={{ marginTop: '3rem', opacity: 0.2 }}>
            <Logo size={28} showText />
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
