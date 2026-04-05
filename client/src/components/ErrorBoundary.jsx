import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import Logo from './Logo';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("SnapAdda Caught Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', padding: '2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'var(--gold)', filter: 'blur(120px)', opacity: 0.05 }} />
          
          <motion.div 
            className="glass-heavy"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: '100%', maxWidth: '460px', padding: '3rem', borderRadius: '32px', textAlign: 'center', border: '1px solid rgba(232, 184, 75, 0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <div style={{ padding: '20px', background: 'rgba(232, 184, 75, 0.1)', borderRadius: '50%', border: '1px solid rgba(232, 184, 75, 0.3)' }}>
                <AlertTriangle size={48} color="var(--gold)" />
              </div>
            </div>
            
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>Connection Interrupted</h1>
            <p style={{ color: 'var(--txt-muted)', marginBottom: '2.5rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
              We've encountered a temporary issue while syncing with the SnapAdda network. Don't worry, your data is safe. Let's try gently refreshing the portal.
            </p>
            
            <button 
              onClick={() => window.location.reload()}
              className="btn-3d"
              style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '1rem' }}
            >
              <RefreshCcw size={18} /> Restore Connection
            </button>
            
            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
              <Logo size={24} showText={false} />
            </div>
          </motion.div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
