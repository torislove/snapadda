import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, EyeOff, Server, Lock } from 'lucide-react';

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-page" style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(39, 201, 125, 0.1)', padding: '15px', borderRadius: '20px', marginBottom: '1.5rem', border: '1px solid rgba(39, 201, 125, 0.2)' }}>
            <Lock size={40} color="var(--emerald)" />
          </div>
          <h1 className="gold-shimmer-text" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem' }}>Privacy Policy</h1>
          <p style={{ color: 'var(--txt-muted)', fontSize: '1.1rem' }}>Transparency deeply encoded in our architecture.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-premium" style={{ padding: '3rem', borderRadius: '24px', color: 'var(--txt-secondary)' }}>
          <section className="mb-8">
            <h2 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Server size={20} color="var(--cyan)"/> 1. Data Collection</h2>
            <p style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
              We collect necessary telemetry to provide a premium marketplace experience. This includes basic identity data (Phone, Name), interaction data (Likes, Shares), and search behavior (Filters applied). We do not collect granular financial documents unless explicitly uploaded for verification.
            </p>
          </section>

          <section className="mb-8">
             <h2 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}><EyeOff size={20} color="#f05d5e"/> 2. Data Protection</h2>
            <p style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
              Your data is encrypted in transit and at rest using modern secure protocols. Only authorized SnapAdda administrators have access to intent pools, strictly to facilitate real estate connections. We do not sell your personal data to non-affiliated third party advertisement networks.
            </p>
          </section>

          <section className="mb-8">
             <h2 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck size={20} color="var(--gold)"/> 3. Analytics & Telemetry</h2>
            <p style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
              We utilize anonymized user session metrics (such as the number of views on a specific property) to calculate scarcity flags and market velocity. This anonymized data may be publicly displayed as aggregate "Viewers" counters.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
