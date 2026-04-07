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
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#040408',
      padding: 'max(1.5rem, 4vw)', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      {/* ── LUXURY BACKGROUND ELEMENTS ── */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)', filter: 'blur(80px)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(155,89,245,0.06) 0%, transparent 70%)', filter: 'blur(80px)', borderRadius: '50%' }} />
      
      {/* Floating Glass Orbs */}
      <motion.div 
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', top: '15%', right: '15%', width: '120px', height: '120px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} 
      />
      <motion.div 
        animate={{ y: [0, 40, 0], x: [0, -25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ position: 'absolute', bottom: '20%', left: '10%', width: '80px', height: '80px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(8px)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} 
      />

      <motion.div
        className="glass-heavy"
        style={{ 
          width: '100%', 
          maxWidth: '440px', 
          borderRadius: '40px', 
          padding: 'max(2.5rem, 5vw)',
          border: '1px solid rgba(255,255,255,0.1)', 
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
          background: 'rgba(10,12,20,0.45)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(40px) saturate(180%)'
        }}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Glow Header */}
        <div style={{ marginBottom: '3.5rem', position: 'relative' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'inline-block', position: 'relative', zIndex: 1 }}
          >
            <Logo size={72} showText={false} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100px', height: '100px', background: 'var(--gold)', filter: 'blur(45px)', opacity: 0.15, zIndex: -1 }} />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ fontSize: '2.25rem', fontWeight: 900, marginTop: '2rem', color: '#fff', letterSpacing: '-0.04em' }}
          >
            {t('auth.welcome')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.75rem', fontSize: '1rem', fontWeight: 400 }}
          >
            {t('auth.subtitle')}
          </motion.p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: 'rgba(240,93,94,0.1)', border: '1px solid rgba(240,93,94,0.3)', borderRadius: '16px', padding: '1rem', marginBottom: '2rem', fontSize: '0.85rem', color: '#f87171', fontWeight: 500 }}
          >
            {error}
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          {/* Animated Google Carrier */}
          <div style={{ 
            width: '100%', 
            padding: '2px', 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))', 
            borderRadius: '100px', 
            border: '1px solid rgba(255,255,255,0.08)',
            position: 'relative',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            {/* Top Shine */}
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }} />
            
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', transform: 'translateY(0px)' }}>
              {loading ? (
                <div style={{ height: '48px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--gold)' }}>
                  <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid transparent', borderTopColor: 'currentColor', borderRadius: '50%' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Connecting...</span>
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Login Failed')}
                  theme="filled_black"
                  shape="circle"
                  size="large"
                  width="100%"
                />
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '0 1rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Exclusive Access</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ textAlign: 'center', marginTop: '3.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}
        >
          {t('auth.terms')} <br />
          <span style={{ color: 'var(--gold)', cursor: 'pointer', borderBottom: '1px solid rgba(212,175,55,0.3)' }}>{t('auth.tos')}</span> and <span style={{ color: 'var(--gold)', cursor: 'pointer', borderBottom: '1px solid rgba(212,175,55,0.3)' }}>{t('auth.privacy')}</span>.
        </motion.p>
      </motion.div>

      {/* LUXURY BADGE (Bottom Mobile-Perfect Position) */}
      <div style={{ position: 'absolute', bottom: '2rem', left: '0', right: '0', textAlign: 'center', opacity: 0.2 }}>
        <span style={{ fontSize: '0.65rem', color: '#fff', letterSpacing: '0.4em', textTransform: 'uppercase' }}>Built by SnapAdda Elite</span>
      </div>
    </div>
  );
}
