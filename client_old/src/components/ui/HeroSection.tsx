import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Search, MapPin, PhoneCall, Building2, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  content: any;
  onTriggerLead: (type: 'callback' | 'contact') => void;
  enable3D?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ content, onTriggerLead, enable3D = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Parallax effects
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // 3D Tilt for the search card
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const c = content || {
    eyebrow: "Andhra Pradesh's #1 Property Platform",
    title: "Discover Your Dream Place in Andhra",
    subtitle: "Browse verified listings across Amaravati, Vijayawada, Guntur & beyond.",
    cta1Text: "BROWSE PROPERTIES",
    cta1Url: "#search",
    cta2Text: "FREE EXPERT CALL",
    cta2Url: "callback"
  };

  return (
    <section 
      ref={containerRef}
      className="hero-section relative min-h-[90vh] flex items-center justify-center pt-20 pb-24 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic Background Elements */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ y: y1, opacity }}
      >
        <div className="absolute top-[15%] left-[5%] w-64 h-64 bg-gold/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-emerald/10 rounded-full blur-[120px]" />
      </motion.div>

      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center">
          
          {/* Hero Eyebrow */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <Zap size={14} className="text-gold animate-pulse" />
            <span className="text-[10px] sm:text-[11px] uppercase font-black tracking-[0.25em] text-gold/90">{c.eyebrow}</span>
          </motion.div>

          {/* Hero Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="hero-title-elite text-5xl sm:text-7xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent"
          >
            {c.title.split(' ').map((word: string, i: number) => (
              <span key={i} className={i === 2 || i === 3 ? "text-gold italic font-serif" : ""}>
                {word}{" "}
              </span>
            ))}
          </motion.h1>

          {/* Hero Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hero-subtitle-elite text-lg sm:text-xl text-white/60 max-w-2xl mb-12 font-medium leading-relaxed"
          >
            {c.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto"
          >
            <button 
              onClick={() => {
                if (c.cta1Url.startsWith('#')) {
                  document.getElementById(c.cta1Url.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = c.cta1Url;
                }
              }}
              className="btn-elite-gold group relative h-[64px] px-8 rounded-2xl flex items-center justify-center gap-3 bg-gold text-midnight font-black tracking-wider shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.5)] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              <Search size={22} />
              {c.cta1Text}
            </button>
            
            <button 
              onClick={() => {
                if (c.cta2Url === 'callback') onTriggerLead('callback');
                else window.location.href = c.cta2Url;
              }}
              className="btn-elite-glass h-[64px] px-8 rounded-2xl flex items-center justify-center gap-3 bg-white/5 border border-white/10 backdrop-blur-xl text-white font-black tracking-wider hover:bg-white/10 hover:border-gold/30 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            >
              <PhoneCall size={22} className="text-gold" />
              {c.cta2Text}
              <ArrowRight size={18} className="text-gold group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Advanced Search Card with 3D Tilt */}
          <motion.div 
            className="w-full max-w-4xl"
            style={{ 
              perspective: "1000px",
              rotateX: enable3D ? rotateX : 0,
              rotateY: enable3D ? rotateY : 0,
              transformStyle: "preserve-3d"
            }}
          >
            <div className="glass-heavy p-8 rounded-[40px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative">
              {/* Internal elements with Z-translation */}
              <div style={{ transform: "translateZ(50px)" }}>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
                  <div className="relative group">
                    <Search size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search locations, projects, or keywords..."
                      className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 text-white text-lg font-medium placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all"
                    />
                  </div>
                  <button className="h-16 px-10 bg-white/10 rounded-2xl flex items-center gap-3 text-white font-bold hover:bg-white/20 transition-all border border-white/10">
                    <MapPin size={22} className="text-gold" />
                    All Cities
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {['Apartment', 'Villa', 'Plot', 'Farmland'].map((type) => (
                    <button key={type} className="h-12 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-white/40 hover:text-white hover:border-gold/30 hover:bg-white/10 transition-all">
                      <Building2 size={14} />
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decorative light reflection */}
              <div className="absolute top-0 right-0 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-50" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating 3D Elements Decorative */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden sm:block hidden">
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[10%] opacity-20"
        >
          <Building2 size={120} className="text-gold" strokeWidth={0.5} />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] left-[8%] opacity-20"
        >
          <ShieldCheck size={100} className="text-emerald" strokeWidth={0.5} />
        </motion.div>
      </div>
    </section>
  );
};
