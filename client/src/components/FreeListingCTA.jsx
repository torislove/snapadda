import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Phone, CheckCircle2, Zap, Camera, FileText, Star } from 'lucide-react';

const STEPS = [
  { icon: <Camera size={22} />, label: 'Send Photos & Details', desc: 'WhatsApp us your property photos and info', color: '#10d98c' },
  { icon: <FileText size={22} />, label: 'We Handle Everything', desc: 'Our team uploads & verifies your listing', color: 'var(--gold)' },
  { icon: <Zap size={22} />, label: 'Goes Live in 24hrs', desc: 'Thousands of buyers see your property', color: '#9b59f5' },
];

export default function FreeListingCTA({ supportWA = '919346793364', supportPhone = '919346793364' }) {
  const [activeStep, setActiveStep] = useState(0);
  const [count, setCount] = useState(500);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(s => (s + 1) % STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const waMsg = encodeURIComponent(
    `నమస్కారం SnapAdda! నా ప్రాపర్టీని FREE గా లిస్ట్ చేయాలని ఉంది.\n\nProperty Details:\n📍 Location: \n🏡 Type: \n💰 Price: \n📐 Area: \n\nPhotos follow in next messages.`
  );

  return (
    <section style={{
      background: 'rgba(5, 5, 10, 0.45)', // Deep glass background
      backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
      borderRadius: '32px',
      padding: 'clamp(2rem, 5vw, 4rem)',
      margin: '3rem 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Intense Glow blobs for 3D effect */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,184,75,0.15) 0%, transparent 60%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,89,245,0.12) 0%, transparent 60%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(16,217,140,0.1)', border: '1px solid rgba(16,217,140,0.3)',
            color: '#10d98c', padding: '8px 20px', borderRadius: '40px',
            fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.15em',
            marginBottom: '1.5rem', boxShadow: '0 0 20px rgba(16,217,140,0.2)'
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10d98c', animation: 'pulseDot 1.4s ease-in-out infinite', boxShadow: '0 0 10px #10d98c' }} />
          100% FREE — NO COMMISSION
        </motion.div>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', fontWeight: 950, color: 'white',
          lineHeight: 1.15, marginBottom: '1rem', letterSpacing: '-0.03em'
        }}>
          List Your Property on{' '}
          <span style={{ background: 'linear-gradient(135deg, var(--gold), #ffdf91)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 40px rgba(232,184,75,0.3)' }}>SnapAdda</span>{' '}
          for <span style={{ color: '#10d98c', textShadow: '0 0 30px rgba(16,217,140,0.3)' }}>FREE</span>
        </h2>

        <p style={{ color: 'var(--txt-secondary)', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Just send us your <strong style={{ color: 'white' }}>photos & property details</strong> on WhatsApp. We'll put your listing online within <strong style={{ color: 'var(--gold)' }}>24 hours</strong> — no paperwork, no fees.
        </p>

        {/* Social Proof */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '10px 24px', borderRadius: '99px', width: 'fit-content', margin: '1.5rem auto 0', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex' }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--gold)" color="var(--gold)" style={{ marginLeft: i > 0 ? '-4px' : '0' }} />)}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
            Join <strong style={{ color: 'white', fontWeight: 800 }}>{count}+ owners</strong> who listed for free
          </span>
        </div>
      </div>

      {/* 3-Step Visual (Bento Style Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '3.5rem', position: 'relative', zIndex: 1 }}>
        {STEPS.map((step, i) => (
          <motion.div
            key={i}
            animate={{ 
              borderColor: activeStep === i ? step.color : 'rgba(255,255,255,0.05)', 
              background: activeStep === i ? `linear-gradient(180deg, ${step.color}15 0%, rgba(255,255,255,0.02) 100%)` : 'rgba(255,255,255,0.02)',
              boxShadow: activeStep === i ? `0 20px 40px -10px ${step.color}30, inset 0 1px 0 rgba(255,255,255,0.1)` : '0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.02)'
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ borderRadius: '24px', padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
          >
            {/* Step Number Background */}
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '6rem', fontWeight: 900, color: 'rgba(255,255,255,0.02)', lineHeight: 1, pointerEvents: 'none' }}>
              {i + 1}
            </div>

            <motion.div
              animate={{ 
                color: activeStep === i ? step.color : 'rgba(255,255,255,0.2)',
                scale: activeStep === i ? 1.1 : 1
              }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}
            >
              {step.icon}
            </motion.div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{step.label}</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{step.desc}</div>
            
            <AnimatePresence>
              {activeStep === i && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  style={{ position: 'absolute', top: '16px', right: '16px' }}
                >
                  <CheckCircle2 size={20} style={{ color: step.color, filter: `drop-shadow(0 0 8px ${step.color}80)` }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* CTA Buttons - Premium Liquid 3D */}
      <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        <motion.a
          whileHover={{ scale: 1.03, boxShadow: '0 20px 50px rgba(37,211,102,0.4)' }}
          whileTap={{ scale: 0.96 }}
          href={`https://wa.me/${supportWA}?text=${waMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            background: 'linear-gradient(135deg, #25d366 0%, #1da851 100%)',
            color: 'white', padding: '18px 36px', borderRadius: '24px',
            fontWeight: 900, fontSize: '1.05rem', textDecoration: 'none',
            boxShadow: '0 15px 35px rgba(37,211,102,0.3), inset 0 2px 0 rgba(255,255,255,0.3)', 
            letterSpacing: '0.02em', border: 'none'
          }}
        >
          <MessageSquare size={22} fill="currentColor" />
          WhatsApp చేయండి — FREE లిస్టింగ్
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.08)' }}
          whileTap={{ scale: 0.96 }}
          href={`tel:+${supportPhone}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'white', padding: '18px 32px', borderRadius: '24px',
            fontWeight: 800, fontSize: '1rem', textDecoration: 'none',
            backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}
        >
          <Phone size={20} />
          కాల్ చేయండి
        </motion.a>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.02em', position: 'relative', zIndex: 1 }}>
        Zero fees · No hidden charges · SnapAdda verified listing within 24 hours
      </div>
    </section>
  );
}
