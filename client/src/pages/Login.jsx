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
  const from = location.state?.from || '/';
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
        // Correct logic: if not completed, go to onboarding. 
        if (!res.user.onboardingCompleted) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setError('Google login failed. Please try again.');
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '1.5rem', color: 'white' }}>{t('auth.welcome')}</h1>
          <p style={{ color: 'var(--txt-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {t('auth.subtitle')}
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
        </div>

        <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.75rem', color: 'var(--txt-muted)', lineHeight: 1.5 }}>
          {t('auth.terms')} <br />
          <span style={{ color: 'var(--gold)', cursor: 'pointer' }}>{t('auth.tos')}</span> and <span style={{ color: 'var(--gold)', cursor: 'pointer' }}>{t('auth.privacy')}</span>.
        </p>
      </motion.div>
    </div>
  );
}
