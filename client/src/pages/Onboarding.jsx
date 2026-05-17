import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import { triggerContinuousConfetti } from '../utils/CelebrationEngine';

/**
 * SnapAdda Onboarding — Phone & WhatsApp only, no questions.
 */
export default function Onboarding() {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // If already completed, bounce home
  useEffect(() => {
    if (user?.onboardingCompleted) navigate('/', { replace: true });
  }, [user, navigate]);

  // Sync WhatsApp with phone when checkbox ticked
  useEffect(() => {
    if (sameAsPhone) setWhatsapp(phone);
  }, [sameAsPhone, phone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await completeOnboarding({ phone: phone.trim(), whatsapp: sameAsPhone ? phone.trim() : whatsapp.trim() });
      triggerContinuousConfetti(3.5);
      navigate('/', { replace: true });
    } catch {
      setError('Could not save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: '#05050a', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', position: 'relative', overflow: 'hidden'
    }}>
      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '20%', right: '10%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', left: '5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(39,201,125,0.06) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', maxWidth: '440px',
          background: 'rgba(10,12,22,0.6)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(212,175,55,0.18)',
          borderRadius: '28px',
          padding: 'clamp(2rem, 5vw, 3rem)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          position: 'relative', zIndex: 10
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Logo size={52} showText={false} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', marginTop: '1.25rem', letterSpacing: '-0.03em' }}>
            One last step
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.6rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Enter your contact so our agent can reach you instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Mobile Number */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              <Phone size={14} color="var(--gold)" /> Mobile Number
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
              <span style={{ padding: '0 14px', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.08)', height: '52px', display: 'flex', alignItems: 'center' }}>+91</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="98XXXXXXXX"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                onFocus={e => e.target.parentElement.style.borderColor = 'rgba(212,175,55,0.6)'}
                onBlur={e => e.target.parentElement.style.borderColor = 'rgba(255,255,255,0.12)'}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: 'white', fontSize: '1rem', fontWeight: 600, padding: '0 16px',
                  height: '52px', letterSpacing: '0.06em'
                }}
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              <MessageSquare size={14} color="#25D366" /> WhatsApp Number
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: sameAsPhone ? 'rgba(37,211,102,0.04)' : 'rgba(255,255,255,0.04)', border: `1px solid ${sameAsPhone ? 'rgba(37,211,102,0.25)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '14px', overflow: 'hidden', transition: 'all 0.2s' }}>
              <span style={{ padding: '0 14px', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.08)', height: '52px', display: 'flex', alignItems: 'center' }}>+91</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="WhatsApp number"
                value={sameAsPhone ? phone : whatsapp}
                onChange={e => { setSameAsPhone(false); setWhatsapp(e.target.value.replace(/\D/g, '')); }}
                onFocus={e => !sameAsPhone && (e.target.parentElement.style.borderColor = 'rgba(37,211,102,0.5)')}
                onBlur={e => !sameAsPhone && (e.target.parentElement.style.borderColor = 'rgba(255,255,255,0.12)')}
                disabled={sameAsPhone}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: 'white', fontSize: '1rem', fontWeight: 600, padding: '0 16px',
                  height: '52px', letterSpacing: '0.06em', opacity: sameAsPhone ? 0.6 : 1
                }}
              />
            </div>
            {/* Same as mobile checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', cursor: 'pointer' }}>
              <div
                onClick={() => setSameAsPhone(v => !v)}
                style={{
                  width: '18px', height: '18px', borderRadius: '5px',
                  background: sameAsPhone ? '#25D366' : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${sameAsPhone ? '#25D366' : 'rgba(255,255,255,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', flexShrink: 0
                }}
              >
                {sameAsPhone && <CheckCircle2 size={12} color="#fff" />}
              </div>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', userSelect: 'none' }}
                onClick={() => setSameAsPhone(v => !v)}>
                Same as mobile number
              </span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(240,93,94,0.1)', border: '1px solid rgba(240,93,94,0.3)', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#f87171' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            disabled={isSubmitting}
            style={{
              width: '100%', padding: '1rem', borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--gold) 0%, #d4a017 100%)',
              border: 'none', color: '#0a0c14', fontWeight: 900,
              fontSize: '0.95rem', cursor: 'pointer', letterSpacing: '0.05em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              opacity: isSubmitting ? 0.7 : 1, boxShadow: '0 8px 24px rgba(212,175,55,0.35)',
              marginTop: '0.5rem'
            }}
          >
            {isSubmitting ? 'Saving...' : 'Start Browsing Properties'}
            {!isSubmitting && <ArrowRight size={18} />}
          </motion.button>

          {/* Trust signals */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={14} color="var(--emerald)" />
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>Safe & Intelligent Search</span>
            </div>
            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.5, padding: '0 10px' }}>
              We collect your contact and location data to deliver relevant advertisements and properties matching your specific searches. This ensures a significantly faster experience tailored to your requirements.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
