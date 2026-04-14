import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Scale, CheckCircle2 } from 'lucide-react';

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-page" style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(232,184,75,0.1)', padding: '15px', borderRadius: '20px', marginBottom: '1.5rem', border: '1px solid rgba(232,184,75,0.2)' }}>
            <Scale size={40} color="var(--gold)" />
          </div>
          <h1 className="gold-shimmer-text" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem' }}>Terms of Service</h1>
          <p style={{ color: 'var(--txt-muted)', fontSize: '1.1rem' }}>Last Updated: {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric'})}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-premium" style={{ padding: '3rem', borderRadius: '24px', color: 'var(--txt-secondary)' }}>
          <section className="mb-8">
            <h2 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={20} color="var(--gold)"/> 1. Acceptance of Terms</h2>
            <p style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
              By accessing and using SnapAdda, you agree to comply with and be bound by the following terms and conditions. If you do not agree with these terms, please do not use our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck size={20} color="var(--emerald)"/> 2. Property Listings & Verification</h2>
            <p style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
              While SnapAdda employs strict verification protocols ("SnapAdda Gold Certified"), we act strictly as an intermediary and marketplace. All real estate transactions, legal diligence, and title verifications are the ultimate responsibility of the buyer and seller.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'start' }}><CheckCircle2 size={16} color="var(--gold)" style={{ marginTop: '4px' }}/> We may remove fraudulent listings without notice.</li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'start' }}><CheckCircle2 size={16} color="var(--gold)" style={{ marginTop: '4px' }}/> "Price Per Sq Yard" metrics are estimations and strictly non-binding.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>3. User Conduct</h2>
            <p style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
              Users must not use the platform for unauthorized advertising, scraping, or lead reselling. Our AI concierge and data pipelines are protected intellectual property.
            </p>
          </section>
          
          <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.5)', borderRadius: '16px', borderLeft: '4px solid var(--gold)', marginTop: '3rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Legal Disclaimer</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--txt-muted)' }}>
              SnapAdda is a technology platform, not a registered real estate brokerage under RERA. All investments in physical land carry inherent risks. Please consult an advocate before making financial commitments.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
