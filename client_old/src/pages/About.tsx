import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  TrendingUp, 
  ArrowLeft,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
  Zap,
  Globe,
  Database,
  Code
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';

// ─── 3D TILT CARD COMPONENT ───
const TiltCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={`relative h-full w-full rounded-[40px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl transition-all hover:bg-white/[0.05] ${className}`}
    >
      <div style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }} className="h-full w-full">
        {children}
      </div>
    </motion.div>
  );
};

const About = () => {
  // Type-safe animation props
  const fadeInProps: any = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 1.2, ease: "easeOut" }
  };

  return (
    <div className="min-h-screen bg-[#030306] text-white selection:bg-[#d4af37]/30 overflow-x-hidden">
      {/* ─── NAVIGATION ─── */}
      <nav className="fixed top-0 left-0 right-0 z-[1000] px-8 py-10 flex justify-between items-center bg-gradient-to-b from-black/95 to-transparent">
        <Link to="/" className="group flex items-center gap-2">
          <ArrowLeft size={24} className="text-[#d4af37] group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase tracking-[0.6em] font-black text-[#d4af37] opacity-60 group-hover:opacity-100">Back</span>
        </Link>
        <Logo size={32} showText />
      </nav>

      <main className="pt-52 pb-40 px-6 container max-w-7xl mx-auto">
        {/* ─── HERO SECTION (MASSIVE) ─── */}
        <section className="text-center mb-48 relative">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#d4af37]/5 blur-[150px] rounded-full -z-10 animate-pulse" />
          
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, ease: "easeOut" as const }}
          >
            <h1 className="font-calligraphy text-9xl md:text-[15rem] gold-shimmer-text mb-4 leading-none filter drop-shadow-[0_0_80px_rgba(212,175,55,0.4)]">
              Manoj
            </h1>
            <p className="font-calligraphy text-4xl md:text-6xl text-[#d4af37] opacity-60 mt-[-10px]">
              Master Architect
            </p>
          </motion.div>
          
          <motion.div 
            className="mt-16 max-w-3xl mx-auto text-xl md:text-2xl font-light opacity-60 leading-relaxed px-4"
            initial={fadeInProps.initial}
            whileInView={fadeInProps.whileInView}
            viewport={fadeInProps.viewport}
            transition={fadeInProps.transition}
          >
            I engineered <span className="text-[#d4af37] font-bold">SnapAdda</span> as an ultra-high-velocity real estate discovery platform. Every line of code is optimized for elite property acquisition and administrative precision.
          </motion.div>
        </section>

        {/* ─── ADVANCED 3D GLASS CARDS ─── */}
        <section className="mb-48">
          <motion.h2 
            className="text-[10px] uppercase tracking-[0.8em] text-center mb-24 opacity-20 font-black"
            initial={fadeInProps.initial}
            whileInView={fadeInProps.whileInView}
            viewport={fadeInProps.viewport}
            transition={fadeInProps.transition}
          >
            Terminal Infrastructure
          </motion.h2>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Client Card */}
            <motion.div 
              initial={fadeInProps.initial}
              whileInView={fadeInProps.whileInView}
              viewport={fadeInProps.viewport}
              transition={{ ...fadeInProps.transition, delay: 0.1 }}
            >
              <TiltCard className="p-12 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-3xl group-hover:bg-[#d4af37]/10 transition-colors" />
                <div className="w-16 h-16 rounded-3xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center mb-10 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                  <Terminal size={32} className="text-[#d4af37]" />
                </div>
                <h3 className="text-3xl font-bold mb-6 tracking-tight">Vite-Powered UI</h3>
                <p className="opacity-40 text-lg mb-8 leading-relaxed">A high-fidelity parallax interaction engine built for absolute fluidity.</p>
                <div className="space-y-4">
                  {['3D Discovery Matrix', 'Instant Filter Response', 'Optimized Asset Loading'].map(item => (
                    <div key={item} className="flex items-center gap-3 text-sm font-medium opacity-80">
                      <CheckCircle2 size={18} className="text-[#d4af37]" /> {item}
                    </div>
                  ))}
                </div>
              </TiltCard>
            </motion.div>

            {/* Server Card */}
            <motion.div 
              initial={fadeInProps.initial}
              whileInView={fadeInProps.whileInView}
              viewport={fadeInProps.viewport}
              transition={{ ...fadeInProps.transition, delay: 0.2 }}
            >
              <TiltCard className="p-12 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-3xl group-hover:bg-[#d4af37]/10 transition-colors" />
                <div className="w-16 h-16 rounded-3xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center mb-10 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                  <Cpu size={32} className="text-[#d4af37]" />
                </div>
                <h3 className="text-3xl font-bold mb-6 tracking-tight">API Command</h3>
                <p className="opacity-40 text-lg mb-8 leading-relaxed">Secure Node.js orchestration handling complex data lead pipelines.</p>
                <div className="space-y-4">
                  {['JWT Encryption Layer', 'Dynamic Lead Pipeline', 'Mongo Scalability'].map(item => (
                    <div key={item} className="flex items-center gap-3 text-sm font-medium opacity-80">
                      <Lock size={18} className="text-[#d4af37]" /> {item}
                    </div>
                  ))}
                </div>
              </TiltCard>
            </motion.div>

            {/* Admin Card */}
            <motion.div 
              initial={fadeInProps.initial}
              whileInView={fadeInProps.whileInView}
              viewport={fadeInProps.viewport}
              transition={{ ...fadeInProps.transition, delay: 0.3 }}
            >
              <TiltCard className="p-12 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-3xl group-hover:bg-[#d4af37]/10 transition-colors" />
                <div className="w-16 h-16 rounded-3xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center mb-10 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                  <Layers size={32} className="text-[#d4af37]" />
                </div>
                <h3 className="text-3xl font-bold mb-6 tracking-tight">Global CMS</h3>
                <p className="opacity-40 text-lg mb-8 leading-relaxed">Real-time platform authority with zero-latency settings control.</p>
                <div className="space-y-4">
                  {['Lead Management Hub', 'Dynamic Page Builder', 'Platform Overrides'].map(item => (
                    <div key={item} className="flex items-center gap-3 text-sm font-medium opacity-80">
                      <Zap size={18} className="text-[#d4af37]" /> {item}
                    </div>
                  ))}
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </section>

        {/* ─── ELITE ACQUISITION CENTER (GIGANTIC) ─── */}
        <section className="mb-48 relative">
          <motion.div 
            className="p-1.5 rounded-[60px] bg-gradient-to-br from-[#d4af37] to-transparent shadow-[0_0_100px_rgba(212,175,55,0.2)]"
            initial={fadeInProps.initial}
            whileInView={fadeInProps.whileInView}
            viewport={fadeInProps.viewport}
            transition={fadeInProps.transition}
          >
            <div className="bg-[#05050a] rounded-[56px] p-16 md:p-32 text-center relative overflow-hidden backdrop-blur-3xl">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/10 blur-[120px] rounded-full animate-pulse" />
              
              <motion.div 
                className="relative z-10"
                initial={fadeInProps.initial}
                whileInView={fadeInProps.whileInView}
                viewport={fadeInProps.viewport}
                transition={fadeInProps.transition}
              >
                <span className="inline-block px-6 py-2 rounded-full border border-[#d4af37]/30 text-[#d4af37] text-[12px] font-black uppercase tracking-[0.4em] mb-12 bg-[#d4af37]/5 backdrop-blur-md">
                  Proprietary Digital Asset Sale
                </span>
                
                <h2 className="font-calligraphy text-5xl md:text-7xl mb-12 leading-tight">
                  The Platinum <br /> <span className="gold-shimmer-text">SnapAdda Portfolio</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-4xl mx-auto">
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center group hover:bg-[#d4af37]/5 transition-all">
                    <Globe size={40} className="text-[#d4af37] mb-4 opacity-50 group-hover:opacity-100" />
                    <span className="text-xs font-bold uppercase tracking-widest">Global Domain</span>
                  </div>
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center group hover:bg-[#d4af37]/5 transition-all">
                    <Code size={40} className="text-[#d4af37] mb-4 opacity-50 group-hover:opacity-100" />
                    <span className="text-xs font-bold uppercase tracking-widest">Source Code</span>
                  </div>
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center group hover:bg-[#d4af37]/5 transition-all">
                    <Database size={40} className="text-[#d4af37] mb-4 opacity-50 group-hover:opacity-100" />
                    <span className="text-xs font-bold uppercase tracking-widest">Master DB</span>
                  </div>
                </div>

                <div className="relative group inline-block transform-gpu">
                  <div className="absolute inset-0 bg-[#d4af37] blur-[150px] opacity-20 animate-pulse" />
                  <motion.div 
                    className="relative bg-black/60 border border-[#d4af37]/50 backdrop-blur-3xl px-16 py-12 md:px-28 md:py-24 rounded-[60px] shadow-[0_0_100px_rgba(212,175,55,0.2)] flex flex-col items-center gap-4 group-hover:scale-[1.05] transition-all duration-700"
                    whileHover={{ rotate: 1 }}
                  >
                    <span className="text-[12px] font-black uppercase tracking-[0.8em] text-[#d4af37] mb-4">Final Valuation</span>
                    <span className="font-calligraphy text-8xl md:text-[14rem] gold-shimmer-text leading-none filter drop-shadow-[0_0_50px_rgba(212,175,55,0.3)]">
                      ₹50 Lakhs
                    </span>
                  </motion.div>
                </div>

                <p className="mt-20 text-xs opacity-20 uppercase tracking-[0.5em] font-bold">Absolute IP Transference & Documentation Included</p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ─── CONTACT HUB (VERY BIG) ─── */}
        <section>
          <motion.div 
            className="flex flex-col md:grid md:grid-cols-2 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={{
              animate: { transition: { staggerChildren: 0.2 } }
            }}
          >
            <motion.a 
              href="tel:9346793364" 
              className="group p-12 md:p-20 rounded-[60px] bg-white/[0.02] border border-white/5 hover:bg-[#d4af37]/5 hover:border-[#d4af37]/40 transition-all flex flex-col items-center text-center backdrop-blur-3xl"
              initial={fadeInProps.initial}
              whileInView={fadeInProps.whileInView}
              viewport={fadeInProps.viewport}
              transition={fadeInProps.transition}
            >
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-10 group-hover:bg-[#d4af37]/20 transition-all">
                <Phone size={40} className="text-[#d4af37]" />
              </div>
              <span className="text-[12px] uppercase tracking-[0.8em] text-[#d4af37] font-black mb-6 opacity-40">Cellular</span>
              <span className="text-5xl md:text-8xl font-black gold-shimmer-text tracking-tighter">9346793364</span>
            </motion.a>

            <motion.a 
              href="mailto:manojkadiyala8@gmail.com" 
              className="group p-12 md:p-20 rounded-[60px] bg-white/[0.02] border border-white/5 hover:bg-[#d4af37]/5 hover:border-[#d4af37]/40 transition-all flex flex-col items-center text-center backdrop-blur-3xl"
              initial={fadeInProps.initial}
              whileInView={fadeInProps.whileInView}
              viewport={fadeInProps.viewport}
              transition={fadeInProps.transition}
            >
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-10 group-hover:bg-[#d4af37]/20 transition-all">
                <Mail size={40} className="text-[#d4af37]" />
              </div>
              <span className="text-[12px] uppercase tracking-[0.8em] text-[#d4af37] font-black mb-6 opacity-40">Master Correspondence</span>
              <span className="text-2xl md:text-4xl font-bold break-all gold-shimmer-text">manojkadiyala8@gmail.com</span>
            </motion.a>
          </motion.div>

          <motion.div 
            className="mt-32 text-center"
            initial={fadeInProps.initial}
            whileInView={fadeInProps.whileInView}
            viewport={fadeInProps.viewport}
            transition={fadeInProps.transition}
          >
            <Link to="/contact" className="inline-flex items-center gap-4 text-sm font-black uppercase tracking-[0.5em] text-[#d4af37] border-b border-[#d4af37]/20 pb-2 hover:border-[#d4af37] transition-all group">
              Access The Presentation Deck <TrendingUp className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </section>
      </main>

      {/* ─── FINAL FOOTER ─── */}
      <footer className="py-24 border-t border-white/5 text-center px-6 bg-black">
        <Logo size={40} />
        <p className="mt-8 text-[12px] uppercase tracking-[1em] opacity-20 font-black">SnapAdda Real Estate Ecosystem Architected by Manoj</p>
      </footer>
    </div>
  );
};

export default About;
