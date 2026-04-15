import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Phone, MessageSquare, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authGoogle } from '../services/api';
import Logo from '../components/Logo';

export default function Login() {
  const { loginGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || location.state?.from || '/';

  const [step, setStep] = useState('contact');   // 'contact' | 'google'
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [contactError, setContactError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContactNext = (e) => {
    e.preventDefault();
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setContactError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setContactError('');
    setStep('google');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setLoginError('');
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const res = await authGoogle({
        ...decoded,
        phone: `+91${phone}`,
        whatsapp: `+91${sameAsPhone ? phone : whatsapp}`,
      });
      if (res.status === 'success') {
        loginGoogle({ user: res.user, token: credentialResponse.credential });
        // Skip onboarding — phone already captured here
        navigate(from, { replace: true });
      }
    } catch {
      setLoginError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const wa = sameAsPhone ? phone : whatsapp;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#040408', padding: 'max(1.5rem, 4vw)', position: 'relative', overflow: 'hidden'
    }}>
      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)', filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(155,89,245,0.06) 0%, transparent 70%)', filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', maxWidth: '440px', borderRadius: '32px',
          padding: 'clamp(2rem, 5vw, 2.75rem)',
          background: 'rgba(10,12,20,0.5)',
          backdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          position: 'relative', zIndex: 10, textAlign: 'center'
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '2rem' }}>
          <Logo size={64} showText={false} />
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginTop: '1.25rem', color: '#fff', letterSpacing: '-0.04em' }}>
            {step === 'contact' ? 'Access Properties' : 'Verify Identity'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: '0.6rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {step === 'contact'
              ? 'Enter your contact so our agent can reach you.'
              : `Great! Now sign in with Google to continue.`}
          </p>
        </div>

        {/* Step Indicators */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '2rem' }}>
          {['contact', 'google'].map((s, i) => (
            <div key={s} style={{ height: '4px', flex: 1, maxWidth: '60px', borderRadius: '4px', background: step === s || (s === 'contact' && step === 'google') ? 'var(--gold)' : 'rgba(255,255,255,0.12)', transition: 'background 0.3s ease' }} />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* STEP 1: Phone + WhatsApp */}
          {step === 'contact' && (
            <motion.form
              key="contact"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleContactNext}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}
            >
              {/* Mobile */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  <Phone size={13} color="var(--gold)" /> Mobile Number
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', overflow: 'hidden' }}>
                  <span style={{ padding: '0 14px', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.08)', height: '52px', display: 'flex', alignItems: 'center' }}>+91</span>
                  <input
                    type="tel" inputMode="numeric" maxLength={10} placeholder="98XXXXXXXX" value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    onFocus={e => e.target.parentElement.style.borderColor = 'rgba(212,175,55,0.6)'}
                    onBlur={e => e.target.parentElement.style.borderColor = 'rgba(255,255,255,0.12)'}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '1rem', fontWeight: 600, padding: '0 16px', height: '52px', letterSpacing: '0.06em' }}
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  <MessageSquare size={13} color="#25D366" /> WhatsApp Number
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: sameAsPhone ? 'rgba(37,211,102,0.04)' : 'rgba(255,255,255,0.04)', border: `1px solid ${sameAsPhone ? 'rgba(37,211,102,0.3)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '14px', overflow: 'hidden', transition: 'all 0.2s' }}>
                  <span style={{ padding: '0 14px', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.08)', height: '52px', display: 'flex', alignItems: 'center' }}>+91</span>
                  <input
                    type="tel" inputMode="numeric" maxLength={10} placeholder="WhatsApp number"
                    value={sameAsPhone ? phone : whatsapp}
                    onChange={e => { setSameAsPhone(false); setWhatsapp(e.target.value.replace(/\D/g, '')); }}
                    disabled={sameAsPhone}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '1rem', fontWeight: 600, padding: '0 16px', height: '52px', letterSpacing: '0.06em', opacity: sameAsPhone ? 0.5 : 1 }}
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer' }}
                  onClick={() => setSameAsPhone(v => !v)}>
                  <div style={{ width: '17px', height: '17px', borderRadius: '4px', border: `1px solid ${sameAsPhone ? '#25D366' : 'rgba(255,255,255,0.2)'}`, background: sameAsPhone ? '#25D366' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                    {sameAsPhone && <CheckCircle2 size={11} color="#fff" />}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', userSelect: 'none' }}>Same as mobile number</span>
                </label>
              </div>

              {contactError && (
                <div style={{ background: 'rgba(240,93,94,0.1)', border: '1px solid rgba(240,93,94,0.3)', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#f87171' }}>
                  {contactError}
                </div>
              )}

              <motion.button type="submit" whileTap={{ scale: 0.97 }}
                style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, var(--gold) 0%, #d4a017 100%)', border: 'none', color: '#0a0c14', fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 24px rgba(212,175,55,0.3)', marginTop: '0.25rem' }}>
                Continue <ArrowRight size={18} />
              </motion.button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ShieldCheck size={13} color="var(--emerald)" />
                <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)' }}>Your number is private &amp; never shared</span>
              </div>
            </motion.form>
          )}

          {/* STEP 2: Google Sign-In */}
          {step === 'google' && (
            <motion.div
              key="google"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}
            >
              {/* Contact summary */}
              <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                <CheckCircle2 size={18} color="#25D366" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contact Saved</div>
                  <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 700, marginTop: '2px' }}>+91 {phone} · WhatsApp +91 {wa || phone}</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px', padding: '6px', display: 'flex', justifyContent: 'center' }}>
                {loading ? (
                  <div style={{ height: '48px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--gold)' }}>
                    <div style={{ width: '18px', height: '18px', border: '2px solid transparent', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Connecting...</span>
                  </div>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setLoginError('Google Login Failed')}
                    theme="filled_black"
                    shape="circle"
                    size="large"
                  />
                )}
              </div>

              {loginError && (
                <div style={{ background: 'rgba(240,93,94,0.1)', border: '1px solid rgba(240,93,94,0.3)', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#f87171' }}>
                  {loginError}
                </div>
              )}

              <button onClick={() => setStep('contact')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
                ← Change my contact
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)', lineHeight: 1.7 }}>
          By continuing you agree to our{' '}
          <a href="/terms" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Terms</a> &amp;{' '}
          <a href="/privacy" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Privacy Policy</a>.
        </p>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
