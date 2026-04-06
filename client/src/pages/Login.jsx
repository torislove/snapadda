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
        <div style={{ marginBottom: '3rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', background: 'var(--gold)', filter: 'blur(40px)', opacity: 0.1, zIndex: -1 }}></div>
          <Logo size={64} showText={true} textSize="1.3rem" />
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginTop: '2rem', color: '#fff', letterSpacing: '-0.03em' }}>{t('auth.welcome')}</h1>
          <p style={{ color: 'var(--txt-muted)', marginTop: '0.75rem', fontSize: '0.95rem', fontWeight: 500 }}>
            {t('auth.subtitle')}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(240,93,94,0.1)', border: '1px solid rgba(240,93,94,0.3)', borderRadius: '12px', padding: '0.85rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#f05d5e' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ 
            width: '100%', 
            padding: '4px', 
            background: 'rgba(255, 255, 255, 0.03)', 
            borderRadius: 'var(--r-full)', 
            border: '1px solid rgba(255,255,255,0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0.5 }}></div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                useOneTap
                theme="filled_black"
                shape="pill"
                size="large"
                logo_alignment="center"
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5 }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
            <span style={{ fontSize: '0.75rem', color: 'var(--txt-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Secure Identity Verification</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.8rem', color: 'var(--txt-muted)', lineHeight: 1.6 }}>
          {t('auth.terms')} <br />
          <span style={{ color: 'var(--gold)', cursor: 'pointer' }}>{t('auth.tos')}</span> and <span style={{ color: 'var(--gold)', cursor: 'pointer' }}>{t('auth.privacy')}</span>.
        </p>
      </motion.div>
    </div>
  );
}
