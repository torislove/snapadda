import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, IndianRupee, MapPin, Target, ChevronRight, ChevronLeft, 
  CheckCircle2, Sparkles, HelpCircle, Activity, ShieldCheck, 
  Cpu, Zap, Layers 
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, off } from 'firebase/database';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';

/**
 * SnapAdda Elite Onboarding
 * Real-time, Admin-Controlled, Quiet Luxury UX
 */
export default function Onboarding() {
  const { t } = useTranslation();
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // --- Real-time Question Pulse ---
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const qRef = ref(db, 'onboarding_questions');
    const unsubscribe = onValue(qRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const active = Object.values(data)
            .filter(q => q && q.enabled)
            .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
          
          setQuestions(active);
          
          // Sync form keys without wiping existing answers
          setFormData(prev => {
            const next = { ...prev };
            active.forEach(q => {
              if (q.key && next[q.key] === undefined) {
                next[q.key] = '';
              }
            });
            return next;
          });
        }
      } catch (err) {
        console.error('Onboarding Sync Failure:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => off(qRef, 'value', unsubscribe);
  }, []);

  // Stability: Redirect if already qualified
  useEffect(() => { 
    if (user?.onboardingCompleted && !isFinished) {
      const t = setTimeout(() => navigate('/'), 2000);
      return () => clearTimeout(t);
    }
  }, [user, navigate, isFinished]);

  const handleNext = () => setStep(s => Math.min(s + 1, questions.length + 1));
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding(formData);
      setIsFinished(true);
      setStep(questions.length + 1);
    } catch (e) {
      console.error('Qualification sync failure:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (key) => {
    const props = { size: 28, strokeWidth: 1.5 };
    switch(key) {
      case 'propertyType': return <Home {...props} />;
      case 'budget': return <IndianRupee {...props} />;
      case 'purpose': return <Target {...props} />;
      case 'locations': return <MapPin {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#05050a', gap: '2rem' }}>
      <Logo size={60} />
      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
            style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)' }} />
        ))}
      </div>
    </div>
  );

  const currentQuestion = step > 0 && step <= questions.length ? questions[step - 1] : null;
  const isLastQuestion = step === questions.length;
  const isFinalStep = step === questions.length + 1;

  return (
    <div style={{ 
      minHeight: '100vh', width: '100%', background: '#05050a', position: 'relative', 
      display: 'flex', flexDirection: 'column', overflow: 'hidden' 
    }}>
      {/* Dynamic Background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, #064e3b11 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, #e8b84b09 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <header style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 100 }}>
        <Link to="/" style={{ textDecoration: 'none' }}><Logo size={32} showText /></Link>
        <div style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.4em', fontWeight: 900 }}>SECURE_PROTOCOL // {isFinalStep ? 'QUALIFIED' : `STEP_${step}`}</div>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', zIndex: 10 }}>
        <motion.div 
          layout
          style={{ 
            width: '100%', maxWidth: '480px', background: 'rgba(255,255,255,0.02)', 
            backdropFilter: 'blur(20px)', borderRadius: '32px', border: '1px solid rgba(212,175,55,0.1)',
            padding: '2.5rem', boxShadow: '0 40px 100px rgba(0,0,0,0.5)', position: 'relative'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {step === 0 && (
                <div style={{ textAlign: 'center' }}>
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ marginBottom: '2rem', color: 'var(--gold)' }}><Zap size={48} strokeWidth={1} /></motion.div>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 950, color: '#fff', marginBottom: '1rem', fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em' }}>
                    {t('onboarding.welcomeTitle', 'Elite Access')}
                  </h2>
                  <p style={{ color: 'var(--txt-secondary)', lineHeight: 1.6, marginBottom: '2.5rem', fontSize: '1rem' }}>
                    Welcome to the specialized acquisition portal. To align with our premium inventory, we require your investment parameters.
                  </p>
                  <button onClick={handleNext} className="btn-3d" style={{ width: '100%', padding: '1.2rem', borderRadius: '20px', fontSize: '1rem' }}>
                    {t('onboarding.getStarted', 'Initialize Profile')} <ChevronRight size={18} style={{ marginLeft: '10px' }} />
                  </button>
                </div>
              )}

              {currentQuestion && (
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                      <div style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', padding: '14px', borderRadius: '18px' }}>
                        {getIcon(currentQuestion.key)}
                      </div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.2em' }}>ACQUISITION_PARAMETER</div>
                   </div>
                   
                   <h3 style={{ fontSize: '1.75rem', fontWeight: 950, color: '#fff', marginBottom: '2rem', lineHeight: 1.2 }}>
                     {t(`onboarding.q.${currentQuestion.key}`, currentQuestion.title)}
                   </h3>

                   {currentQuestion.type === 'options' ? (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                       {(currentQuestion.options || []).map(opt => {
                         const active = formData[currentQuestion.key] === opt;
                         return (
                           <motion.button 
                             key={opt}
                             whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                             whileTap={{ scale: 0.98 }}
                             onClick={() => setFormData({...formData, [currentQuestion.key]: opt})}
                             style={{ 
                               width: '100%', padding: '1.2rem', borderRadius: '20px', textAlign: 'left',
                               background: active ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                               border: active ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                               color: active ? 'var(--gold)' : '#fff', fontWeight: 700, cursor: 'pointer',
                               display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                               transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                             }}
                           >
                             <span>{opt}</span>
                             {active && <CheckCircle2 size={18} />}
                           </motion.button>
                         );
                       })}
                     </div>
                   ) : (
                     <textarea 
                       placeholder="Detail your requirements..."
                       value={formData[currentQuestion.key] || ''}
                       onChange={(e) => setFormData({...formData, [currentQuestion.key]: e.target.value})}
                       style={{ 
                         width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', 
                         borderRadius: '24px', padding: '1.5rem', color: '#fff', outline: 'none', resize: 'none', height: '160px',
                         fontSize: '1rem', transition: '0.3s border-color'
                       }}
                       onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
                       onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                     />
                   )}
                </div>
              )}

              {isFinalStep && (
                <div style={{ textAlign: 'center' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    style={{ margin: '0 auto 2rem', color: 'var(--gold)', display: 'flex', justifyContent: 'center' }}><Layers size={60} strokeWidth={1} /></motion.div>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 950, color: 'var(--emerald)', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
                    {t('onboarding.finishTitle', 'Credential Verified')}
                  </h2>
                  <p style={{ color: 'var(--txt-secondary)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                    Your investment profile is now synchronized. You are authorized to access our premium verified inventory across Andhra Pradesh.
                  </p>
                  <button className="btn-3d btn-3d-emerald" onClick={() => navigate('/')} style={{ width: '100%', padding: '1.2rem', borderRadius: '20px' }}>
                    Enter Portal <ChevronRight size={18} style={{ marginLeft: '10px' }} />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          {step > 0 && !isFinalStep && (
            <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleBack} 
                style={{ flex: 1, padding: '1.2rem', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <ChevronLeft size={20} />
              </motion.button>
              
              {!isLastQuestion ? (
                <button className="btn-3d" onClick={handleNext} disabled={!formData[currentQuestion?.key]} style={{ flex: 4, opacity: !formData[currentQuestion?.key] ? 0.5 : 1 }}>
                  Continue <ChevronRight size={18} style={{ marginLeft: '10px' }} />
                </button>
              ) : (
                <button className="btn-3d btn-3d-emerald" onClick={handleFinish} disabled={isSubmitting || !formData[currentQuestion?.key]} style={{ flex: 4, opacity: (isSubmitting || !formData[currentQuestion?.key]) ? 0.5 : 1 }}>
                  {isSubmitting ? 'SECURE_SYNCING...' : 'Synchronize Profile'} <ChevronRight size={18} style={{ marginLeft: '10px' }} />
                </button>
              )}
            </div>
          )}
        </motion.div>
      </main>

      <footer style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.3 }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)' }} />
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.3em', fontWeight: 900 }}>REALTIME_SYNC</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.3 }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--emerald)' }} />
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.3em', fontWeight: 900 }}>ENCRYPTED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
