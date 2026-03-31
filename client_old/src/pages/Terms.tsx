import { motion } from 'framer-motion';
import { ArrowLeft, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';

const Terms = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-gold selection:text-black">
      {/* Header */}
      <header className="p-6 border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gold hover:opacity-80 transition-opacity">
            <ArrowLeft size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Home</span>
          </Link>
          <Logo size={32} />
          <div className="w-24 hidden md:block" /> {/* Spacer */}
        </div>
      </header>

      <main className="container max-w-4xl py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex p-3 bg-gold/10 rounded-2xl mb-6 border border-gold/20">
            <Scale size={32} className="text-gold" />
          </div>
          <h1 className="text-5xl font-serif mb-4">Terms & Conditions</h1>
          <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-black">Last Updated: March 2026</p>
        </motion.div>

        <section className="glass-heavy p-8 md:p-12 rounded-[40px] border border-white/10 space-y-12 leading-relaxed text-white/70">
          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing and using SnapAdda, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our platform. SnapAdda reserves the right to modify these terms at any time without prior notice.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-white">2. Platform Purpose</h2>
            <p>
              SnapAdda is an interactive property portal designed to showcase real estate listings in Andhra Pradesh. We provide 3D visualization, verification status, and expert callback services to facilitate property discovery.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-white">3. Property Verification</h2>
            <p>
              While we strive to verify all listings (AP CRDA/RERA standards), SnapAdda acts as a technology facilitator. Users are advised to perform their own due diligence before entering into any financial or legal commitments.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-white">4. User Conduct</h2>
            <p>
              You agree to use the platform only for lawful purposes. You shall not engage in any activity that interferes with or disrupts the services provided by SnapAdda.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-white">5. Limitation of Liability</h2>
            <p>
              SnapAdda shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the platform or any property transactions initiated through it.
            </p>
          </div>
        </section>

        <footer className="mt-20 text-center text-white/30 text-xs">
          <p>© 2026 SnapAdda Ecosystem. Developed by Manoj.</p>
        </footer>
      </main>
    </div>
  );
};

export default Terms;
