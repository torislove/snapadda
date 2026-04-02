import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { LogIn, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authGoogle, authGuest } from '../services/api';
import Logo from '../components/Logo';

export default function Login() {
  const { loginGoogle, loginGuest } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const res = await authGoogle(decoded);
      if (res.status === 'success') {
        loginGoogle({ user: res.user, token: credentialResponse.credential });
        navigate(res.user.onboardingCompleted ? '/' : '/onboarding', { replace: true });
      }
    } catch (err) {
      setError('Google login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authGuest();
      if (res.status === 'success') {
        loginGuest(res);
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError('Guest login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      {/* Background Orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'var(--gold)', filter: 'blur(120px)', opacity: 0.05, borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'var(--accent-emerald)', filter: 'blur(120px)', opacity: 0.05, borderRadius: '50%' }} />

      <motion.div
        className="glass-heavy login-card"
        style={{ 
          width: '100%', 
          maxWidth: '420px', 
          borderRadius: '32px', 
          border: '1px solid rgba(255,255,255,0.08)', 
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ marginBottom: '2.5rem' }}>
          <Logo size={56} showText />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '1.5rem', color: 'white' }}>Welcome to SnapAdda</h1>
          <p style={{ color: 'var(--txt-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Experience the future of real estate in Andhra Pradesh.
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(240,93,94,0.1)', border: '1px solid rgba(240,93,94,0.3)', borderRadius: '12px', padding: '0.85rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#f05d5e' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              useOneTap
              theme="filled_black"
              shape="pill"
              text="continue_with"
              width="100%"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ padding: '0 1rem', fontSize: '0.75rem', color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <button
            onClick={handleGuestLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '50px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.03)',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
          >
            <UserCircle size={20} />
            <span>Continue as Guest</span>
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.75rem', color: 'var(--txt-muted)', lineHeight: 1.5 }}>
          By continuing, you agree to SnapAdda's <br />
          <span style={{ color: 'var(--gold)', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: 'var(--gold)', cursor: 'pointer' }}>Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
  );
}
