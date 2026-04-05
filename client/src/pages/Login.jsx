import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authGoogle } from '../services/api';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';

export default function Login() {
  const { t } = useTranslation();
  const { loginGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || location.state?.from || '/';
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
        if (!res.user.onboardingCompleted) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setError('Connection timeout or authentication error. Please retry.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#05050a', 
      padding: '1.5rem', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      {/* Dynamic Ambient Background */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.03, 0.08, 0.03],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', background: 'var(--gold)', filter: 'blur(150px)', borderRadius: '50%' }} 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.02, 0.06, 0.02],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60%', height: '60%', background: '#0a8040', filter: 'blur(150px)', borderRadius: '50%' }} 
      />

      <motion.div
        className="glass-heavy login-card-premium"
        style={{ 
          width: '100%', 
          maxWidth: '440px', 
          borderRadius: '40px', 
          padding: '3.5rem 2.5rem',
          border: '1px solid rgba(255,255,255,0.1)', 
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)'
        }}
        initial={{ opacity: 0, scale: 0.9, y: 40 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <div style={{ marginBottom: '3.5rem' }}>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Logo size={72} showText={true} textSize="1.5rem" />
          </motion.div>
          
          <motion.h1 
            style={{ fontSize: '2.25rem', fontWeight: 900, marginTop: '2.5rem', color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {t('auth.welcome')}
          </motion.h1>
          <motion.p 
            style={{ color: 'var(--txt-muted)', marginTop: '1rem', fontSize: '1rem', fontWeight: 500 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Exclusively for members. Sign in to your estate.
          </motion.p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            style={{ background: 'rgba(240,93,94,0.15)', border: '1px solid rgba(240,93,94,0.4)', borderRadius: '16px', padding: '1rem', marginBottom: '2rem', fontSize: '0.85rem', color: '#ff7070', fontWeight: 600 }}
          >
            {error}
          </motion.div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              width: '100%', 
              padding: '6px', 
              background: 'rgba(232, 184, 75, 0.05)', 
              borderRadius: '20px', 
              border: '1px solid rgba(232, 184, 75, 0.2)',
              position: 'relative'
            }}
          >
            {loading ? (
              <div style={{ padding: '0.85rem', color: 'var(--gold)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <div className="loader-mini" style={{ width: '18px', height: '18px', border: '2px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                Authenticating...
              </div>
            ) : (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Authentication Interrupted')}
                  useOneTap
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  width="100%"
                />
              </div>
            )}
          </motion.div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', opacity: 0.4 }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
            <LogIn size={16} />
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
          </div>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--txt-muted)', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            One-tap secure access. No passwords, no guest browsing—only verified estate control.
          </p>
        </div>

        <div style={{ marginTop: '4rem', fontSize: '0.75rem', color: 'var(--txt-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p>Protected by SnapAdda Vault™ 256-bit Encryption</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}>{t('auth.tos')}</span>
            <span style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}>{t('auth.privacy')}</span>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-card-premium::before {
          content: "";
          position: absolute;
          top: -1px; left: -1px; right: -1px; height: 100px;
          background: linear-gradient(180deg, rgba(232, 184, 75, 0.15) 0%, transparent 100%);
          border-radius: 40px 40px 0 0;
          pointer-events: none;
          z-index: -1;
        }
      `}</style>
    </div>
  );
}

