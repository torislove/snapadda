import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';

const Privacy = () => {
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
          <div className="inline-flex p-3 bg-emerald/10 rounded-2xl mb-6 border border-emerald/20">
            <ShieldCheck size={32} className="text-emerald" />
          </div>
          <h1 className="text-5xl font-serif mb-4">Privacy Policy</h1>
          <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-black">Last Updated: March 2026</p>
        </motion.div>

        <section className="glass-heavy p-8 md:p-12 rounded-[40px] border border-white/10 space-y-12 leading-relaxed text-white/70">
          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-white">1. Data Collection</h2>
            <p>
              SnapAdda collects information you provide directly to us when requesting a callback or inquire about a property. This includes your name, phone number, WhatsApp number, and property preferences.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-white">2. Use of Information</h2>
            <p>
              We use your data primarily to facilitate contact between you and property experts. Your preferences (property type, budget) help us provide more relevant property suggestions.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-white">3. Information Sharing</h2>
            <p>
              SnapAdda does not sell your personal data. We share your contact details only with verified property owners or authorized real estate advisors to fulfill your specific service requests.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-white">4. Data Security</h2>
            <p>
              We implement industry-standard encryption and security measures to protect your information from unauthorized access. Our interactive portal is designed with privacy-first principles.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-white">5. Cookies and Analytics</h2>
            <p>
              We use limited cookies to enhance your browsing experience and understand platform usage. This data is anonymized and used for ecosystem optimization.
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

export default Privacy;
