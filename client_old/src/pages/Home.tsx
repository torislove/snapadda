import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, PhoneCall, MessageCircle, Menu, X, 
  ShieldCheck, TrendingUp, Building2, Star, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '../components/ui/Logo';
import { PropertyCard } from '../components/ui/PropertyCard';
import { FilterSidebar } from '../components/ui/FilterSidebar';
import { LeadModal } from '../components/ui/LeadModal';
import { AdCarousel } from '../components/ui/AdCarousel';
import { HeroSection } from '../components/ui/HeroSection';
import { PremiumCarousel } from '../components/ui/PremiumCarousel';
import { PropertyBackground } from '../components/ui/PropertyBackground';
import { 
  fetchProperties, fetchCities, fetchSetting, 
  validateProperties, fetchTestimonials 
} from '../services/api'; 
import './Home.css';

const useScrolled = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  return scrolled;
};

const EMPTY_FILTERS = {
  bhk: '',
  minPrice: '',
  maxPrice: '',
  facing: 'Any',
  furnishing: 'N/A',
  constructionStatus: 'N/A',
  verified: false,
  approval: 'All',
  propertyType: 'All',
  keyword: ''
};

const CityCard = ({ city, count, isActive, onClick }: any) => {
  return (
    <motion.div 
      className={`city-card ${isActive ? 'active' : ''} glass-heavy border border-white/10 rounded-[32px] overflow-hidden relative group h-[320px] cursor-pointer`} 
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 z-0">
        <img src={city.image || '/cities/default.jpg'} alt={city.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />
      </div>
      <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end">
        <span className="text-3xl mb-2">{city.emoji || '📍'}</span>
        <h3 className="text-2xl font-black text-white mb-1">{city.name}</h3>
        <p className="text-sm text-white/60 mb-4 font-medium">{city.tagline || 'Explore Properties'}</p>
        <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-widest bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <MapPin size={12} /> {count} Listings
        </div>
      </div>
      {isActive && <div className="absolute inset-0 border-2 border-gold rounded-[32px] z-20 pointer-events-none" />}
    </motion.div>
  );
};

const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };
  return { user, logout };
};

const Home = () => {
  const { user, logout } = useAuth();
  const scrolled = useScrolled();

  /* State */
  const [properties, setProperties] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'callback'|'contact'>('callback');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string|null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({ ...EMPTY_FILTERS });
  const [sortBy, setSortBy] = useState('newest');
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [supportInfo, setSupportInfo] = useState<any>(null);
  const [heroContent, setHeroContent] = useState<any>(null);
  const [siteStats, setSiteStats] = useState<any[]>([]);

  const siteThemeVars = siteSettings?.primaryColor ? {
    '--gold': siteSettings.primaryColor,
    '--royal-gold': siteSettings.primaryColor,
  } as any : undefined;
  
  const enable3D = siteSettings?.enable3D !== false;
  const themeClass = siteSettings?.themeMode === 'royal' ? 'theme-royal' : '';

  /* Load dynamic data from DB */
  useEffect(() => {
    fetchSetting('appearance').then(d => setSiteSettings(d || {})).catch(console.error);
    fetchSetting('support_info').then(d => setSupportInfo(d || {})).catch(console.error);
    fetchSetting('hero_content').then(d => setHeroContent(d || null)).catch(console.error);
    fetchSetting('site_stats').then(d => setSiteStats(d || [])).catch(console.error);
    fetchCities().then(setCities).catch(console.error);
    fetchTestimonials().then(setTestimonials).catch(console.error);

    try {
      const history = localStorage.getItem('snapadda_recent_views');
      if (history) {
        const parsed = JSON.parse(history);
        const ids = parsed.map((p: any) => p._id || p.id);
        if (ids.length > 0) {
          validateProperties(ids).then(res => {
            if (res.status === 'success') {
              localStorage.setItem('snapadda_recent_views', JSON.stringify(res.data));
            }
          }).catch(() => {});
        }
      }
    } catch(err) { console.warn("Could not load recent views", err); }
  }, []);

  /* Load properties */
  const loadProperties = useCallback(() => {
    const params: any = {
      ...advancedFilters,
      search: advancedFilters.keyword || searchQuery,
      city: selectedCity || undefined,
      approval: advancedFilters.approval !== 'All' ? advancedFilters.approval : undefined,
    };
    fetchProperties(params)
      .then(d => setProperties(d?.data || (Array.isArray(d) ? d : [])))
      .catch(console.error);
  }, [selectedCity, searchQuery, advancedFilters]);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  const sortedProperties = useMemo(() => {
    const arr = [...properties];
    if (sortBy === 'price_asc')  return arr.sort((a,b) => parseFloat(String(a.price).replace(/[^0-9.]/g,'')) - parseFloat(String(b.price).replace(/[^0-9.]/g,'')));
    if (sortBy === 'price_desc') return arr.sort((a,b) => parseFloat(String(b.price).replace(/[^0-9.]/g,'')) - parseFloat(String(a.price).replace(/[^0-9.]/g,'')));
    if (sortBy === 'featured')   return arr.sort((a,b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    return arr;
  }, [properties, sortBy]);

  const handleTriggerLead = (type: 'callback'|'contact') => { setModalType(type); setIsModalOpen(true); };

  const clearAll = () => {
    setSelectedCity(null); setSearchQuery('');
    setAdvancedFilters({ ...EMPTY_FILTERS });
    setSortBy('newest');
  };

  const handleSearch = () => loadProperties();

  return (
    <div className={`app-container ${enable3D ? 'scene-3d' : ''} ${themeClass}`} style={siteThemeVars}>
      {siteSettings?.bgUrl ? (
        <div className="site-bg-overlay fixed inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url(${siteSettings.bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      ) : (
        <PropertyBackground />
      )}

      {/* Floating WhatsApp */}
      <motion.a 
        href={`https://wa.me/${supportInfo?.whatsapp || '9123456789'}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-8 right-8 z-[2000] w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(37,211,102,0.4)] border border-white/20 active:scale-95 transition-all"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ rotate: 12, scale: 1.1 }}
      >
        <MessageCircle size={32} className="text-white" />
      </motion.a>

      {/* NAVIGATION */}
      <header className="app-nav fixed top-0 left-0 right-0 z-[1000] transition-all duration-500" style={{
        background: scrolled ? 'rgba(7,7,15,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        height: scrolled ? '70px' : '90px'
      }}>
        <div className="container h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3"><Logo size={32} showText /></Link>
          
          <nav className="hidden md:flex items-center gap-10">
            <a href="#properties" className="text-xs font-black uppercase tracking-widest text-white/60 hover:text-gold transition-colors">Properties</a>
            <a href="#cities" className="text-xs font-black uppercase tracking-widest text-white/60 hover:text-gold transition-colors">Locations</a>
            <a href="#contact" className="text-xs font-black uppercase tracking-widest text-white/60 hover:text-gold transition-colors">Advantage</a>
          </nav>

          <div className="flex items-center gap-6">
            <div className="hidden sm:block">
              {user ? (
                <button className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors" onClick={logout}>Sign Out</button>
              ) : (
                <Link to="/login" className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Sign In</Link>
              )}
            </div>
            <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24}/></button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[3000] bg-midnight/95 backdrop-blur-2xl p-10 flex flex-col items-center justify-center text-center gap-10"
        >
          <button className="absolute top-10 right-10 text-white" onClick={() => setIsMobileMenuOpen(false)}><X size={32}/></button>
          <a href="#properties" className="text-3xl font-black text-white" onClick={() => setIsMobileMenuOpen(false)}>Properties</a>
          <a href="#cities" className="text-3xl font-black text-white" onClick={() => setIsMobileMenuOpen(false)}>Locations</a>
          <a href="#contact" className="text-3xl font-black text-white" onClick={() => setIsMobileMenuOpen(false)}>Advantage</a>
          <div className="w-20 h-[1px] bg-white/10" />
          {user ? (
            <button className="text-xl font-bold text-rose" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>Sign Out</button>
          ) : (
            <Link to="/login" className="text-xl font-bold text-gold" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
          )}
        </motion.div>
      )}

      <main className="relative z-10 pt-[90px]">
        {/* Top Promo Stripe */}
        <section className="py-10">
          <div className="container">
            <div className="flex items-center gap-2 mb-6">
              <Zap size={14} className="text-gold animate-pulse" />
              <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Limited Time Offers</span>
            </div>
            <AdCarousel />
          </div>
        </section>

        {/* Hero Section */}
        <HeroSection 
          content={heroContent} 
          onTriggerLead={handleTriggerLead} 
          enable3D={enable3D} 
        />

        {/* Stats Stripe */}
        <section className="py-16 border-y border-white/5 bg-white/5 backdrop-blur-xl">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {(siteStats.length > 0 ? siteStats : [
                { label: 'Verified Listings', value: '1,200+', icon: 'ShieldCheck' },
                { label: 'Cities Covered', value: '12', icon: 'MapPin' },
                { label: 'Happy Clients', value: '2,400+', icon: 'TrendingUp' },
                { label: 'Approved Properties', value: 'CRDA', icon: 'Building2' }
              ]).map((stat: any, i: number) => {
                const Icon = stat.icon === 'ShieldCheck' ? ShieldCheck : 
                             stat.icon === 'MapPin' ? MapPin :
                             stat.icon === 'TrendingUp' ? TrendingUp : Building2;
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center text-center group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gold mb-6 border border-white/10 group-hover:bg-gold group-hover:text-midnight transition-all duration-500">
                      <Icon size={24} />
                    </div>
                    <span className="text-3xl font-black text-white mb-1 tracking-tight">{stat.value}</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">{stat.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Explore Cities Carousel */}
        <section id="cities" className="py-32 bg-black/50">
          <PremiumCarousel 
            title="Explore AP Cities"
            subtitle="Premium Locations"
            items={cities}
            itemsPerView={4}
            renderItem={(city) => (
              <CityCard 
                city={city} 
                count={city.propertyCount || 0} 
                isActive={selectedCity===city.name} 
                onClick={() => setSelectedCity(selectedCity===city.name ? null : city.name)} 
              />
            )}
          />
        </section>

        {/* Featured Properties Carousel */}
        <section id="properties" className="py-32 overflow-hidden">
          <PremiumCarousel 
            title="Elite Listings"
            subtitle="Verified Properties"
            items={sortedProperties}
            itemsPerView={3}
            renderItem={(prop) => (
              <PropertyCard key={prop._id||prop.id} {...prop} onTriggerLead={handleTriggerLead} />
            )}
          />

          {sortedProperties.length === 0 && (
            <div className="container">
              <div className="flex flex-col items-center justify-center text-center py-20 bg-white/5 rounded-[40px] border border-white/10">
                <Search size={48} className="text-white/20 mb-6" />
                <h3 className="text-2xl font-black text-white mb-2">No Properties Found</h3>
                <p className="text-white/40 mb-8 max-w-sm">We couldn't find anything matching your current filters.</p>
                <button className="btn-elite-gold px-10 h-14 font-black rounded-2xl bg-gold text-midnight" onClick={clearAll}>Clear All Filters</button>
              </div>
            </div>
          )}
        </section>

        {/* Why Choose Us Advantage */}
        <section id="contact" className="py-32 bg-black/40 border-t border-white/5">
          <div className="container">
            <div className="max-w-3xl mb-20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-[2px] bg-gold" />
                <span className="text-[10px] uppercase font-black tracking-widest text-gold text-center">Security & Trust</span>
              </div>
              <h2 className="text-5xl font-black font-serif text-white tracking-tight leading-tight">The SnapAdda Advantage</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <motion.div 
                 whileHover={{ y: -10 }}
                 className="glass-heavy border border-white/5 p-10 rounded-[40px] flex flex-col gap-8 hover:border-gold/30 transition-all"
               >
                  <div className="w-16 h-16 rounded-2xl bg-emerald/10 flex items-center justify-center text-emerald shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                     <ShieldCheck size={32} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white mb-4">Full Verification</h3>
                     <p className="text-white/50 leading-relaxed font-medium">Every property undergoes a 42-point field check before being listed on our platform.</p>
                  </div>
               </motion.div>

               <motion.div 
                 whileHover={{ y: -10 }}
                 className="glass-heavy border border-white/5 p-10 rounded-[40px] flex flex-col gap-8 hover:border-gold/30 transition-all"
               >
                  <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                     <Star size={32} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white mb-4">Regulatory Compliance</h3>
                     <p className="text-white/50 leading-relaxed font-medium">Only CRDA, VMRDA, and RERA approved listings make it to our premium collection.</p>
                  </div>
               </motion.div>

               <motion.div 
                 whileHover={{ y: -10 }}
                 className="glass-heavy border border-white/5 p-10 rounded-[40px] flex flex-col gap-8 hover:border-gold/30 transition-all"
               >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                     <PhoneCall size={32} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white mb-4">Direct Connectivity</h3>
                     <p className="text-white/50 leading-relaxed font-medium">Talk directly to property owners or verified agents with zero mediation interference.</p>
                  </div>
               </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className="py-32 overflow-hidden border-t border-white/5 bg-black">
             <PremiumCarousel 
               title="Client Experiences"
               subtitle="Wall of Trust"
               items={testimonials}
               itemsPerView={3}
               renderItem={(t) => (
                 <div className="glass-heavy border border-white/10 p-10 rounded-[40px] h-full flex flex-col justify-between hover:border-gold/30 transition-colors">
                    <div>
                      <div className="flex gap-1 mb-8">
                        {[...Array(5)].map((_, j) => (
                           <Star key={j} size={16} fill={j < (t.rating || 5) ? "var(--gold)" : "none"} stroke="var(--gold)" />
                        ))}
                      </div>
                      <p className="text-lg text-white/70 italic leading-relaxed mb-10">"{t.text}"</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold font-black border border-gold/30">{t.name?.charAt(0)}</div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest text-white">{t.name}</div>
                        <div className="text-[10px] text-white/30 font-bold mt-1 flex items-center gap-1"><MapPin size={10} /> {t.location}</div>
                      </div>
                    </div>
                 </div>
               )}
             />
          </section>
        )}
      </main>

      <footer className="py-32 bg-black border-t border-white/5 relative z-10 text-center">
        <div className="container">
          <Logo size={48} />
          <div className="mt-12 flex flex-wrap justify-center gap-x-12 gap-y-6">
            <Link to="/terms" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-gold transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-gold transition-colors">Privacy Policy</Link>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/10">© {new Date().getFullYear()} SnapAdda Elite. Built by Manoj.</span>
          </div>
        </div>
      </footer>

      <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} filters={advancedFilters} setFilters={setAdvancedFilters} onApply={handleSearch} />
      <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} type={modalType} />
    </div>
  );
};

export default Home;
