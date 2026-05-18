import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Loader2, LogIn, Sparkles, AlertCircle, CheckCircle2
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { authGoogle } from '../services/api';
import { triggerGoldBurst } from '../utils/CelebrationEngine';
import GoldParticleNet from '../components/GoldParticleNet';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        containerRef.current.style.setProperty('--mouse-x', `${x}%`);
        containerRef.current.style.setProperty('--mouse-y', `${y}%`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const res = await authGoogle({ 
        token: credentialResponse.credential
      });
      triggerGoldBurst();
      login(res.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Google synchronization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#020205', position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-body)'
    }}>
      {/* Dynamic Background Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(232,184,75,0.08) 0%, transparent 70%)', filter: 'blur(100px)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(155,89,245,0.05) 0%, transparent 70%)', filter: 'blur(100px)', borderRadius: '50%' }} />
      <GoldParticleNet />

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-3d-liquid"
        style={{
          width: '100%', maxWidth: '420px', margin: '1rem', zIndex: 10,
          display: 'flex', flexDirection: 'column'
        }}
      >
        <div className="liquid-glow" />
        
        {/* Progress Tracker (Static for single-view) */}
        <div style={{ height: '3px', width: '100%', background: 'rgba(255,255,255,0.05)', position: 'relative', zIndex: 2 }}>
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            style={{ height: '100%', background: 'var(--gold)', boxShadow: '0 0 15px var(--gold-glow)' }}
          />
        </div>

        <div style={{ padding: '3.5rem 2.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(232,184,75,0.05)', borderRadius: '24px', border: '1px solid var(--border-gold)' }}>
              <Shield size={48} className="text-gold" strokeWidth={1.5} />
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'white', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>Institutional Access</h1>
            <p style={{ color: 'var(--txt-muted)', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.6 }}>
              Secure identity verification via Google Institutional Authentication.
            </p>
          </div>

          {/* Primary Interaction: Google Institutional */}
          <div style={{ position: 'relative', minHeight: '60px' }}>
            {loading && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(2,2,5,0.5)', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                <Loader2 className="animate-spin text-gold" size={24} />
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Authentication Failed')}
                theme="dark"
                shape="pill"
                size="large"
                width="100%"
                text="continue_with"
                useOneTap
              />
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              By continuing, you agree to SnapAdda's <br />
              <span style={{ color: 'var(--gold)' }}>Terms of Service</span> & <span style={{ color: 'var(--gold)' }}>Privacy Policy</span>
            </p>
          </div>
        </div>

        {/* Liquid Status Footer */}
        <div style={{ background: 'rgba(255,255,255,0.01)', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10d98c', boxShadow: '0 0 10px rgba(16,217,140,0.4)' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Secure Gateway Enabled
            </span>
          </div>
        </div>

        {/* Instant Feedback Overlay */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem',
                padding: '1rem 1.5rem', borderRadius: '16px', background: 'rgba(245,57,123,0.1)',
                border: '1px solid rgba(245,57,123,0.2)',
                color: 'var(--rose)', fontSize: '0.85rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '12px', zIndex: 100, backdropFilter: 'blur(20px)'
              }}
            >
              <AlertCircle size={18} />
              {error}
              <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                <LogIn size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .text-gold { color: var(--gold); }
      `}</style>
    </div>
  );
}
