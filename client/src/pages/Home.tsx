import { PropertyCard } from '../components/ui/PropertyCard';
import { Logo } from '../components/ui/Logo';
import { LeadModal } from '../components/ui/LeadModal';
import { MapPin, Menu, X, Search, SlidersHorizontal, Phone, Star, TrendingUp, Building2, Sprout, Home as HomeIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProperties } from '../services/api';
import { Button } from '../components/ui/Button';
import './Home.css';

// Real AP City Data — no copyrighted images, CSS gradient backgrounds
const AP_CITIES = [
  { id: 'amaravati', name: 'Amaravati', gradient: 'linear-gradient(135deg, #c9a84c 0%, #8c7326 100%)', count: 0 },
  { id: 'vijayawada', name: 'Vijayawada', gradient: 'linear-gradient(135deg, #7c9473 0%, #4a6b40 100%)', count: 0 },
  { id: 'guntur', name: 'Guntur', gradient: 'linear-gradient(135deg, #9b7653 0%, #6b4e32 100%)', count: 0 },
  { id: 'mangalagiri', name: 'Mangalagiri', gradient: 'linear-gradient(135deg, #5b7ea1 0%, #3d5a7a 100%)', count: 0 },
  { id: 'tirupati', name: 'Tirupati', gradient: 'linear-gradient(135deg, #a0648c 0%, #7a4268 100%)', count: 0 },
  { id: 'visakhapatnam', name: 'Visakhapatnam', gradient: 'linear-gradient(135deg, #64a0a0 0%, #3a7272 100%)', count: 0 },
];

const PROPERTY_TYPES = [
  { label: 'All', value: 'all', icon: <SlidersHorizontal size={18} /> },
  { label: 'Apartments', value: 'Apartment', icon: <Building2 size={18} /> },
  { label: 'Villas', value: 'Villa', icon: <HomeIcon size={18} /> },
  { label: 'Flats', value: 'Flat', icon: <Building2 size={18} /> },
  { label: 'Agriculture', value: 'Agriculture', icon: <Sprout size={18} /> },
];

const SMART_FILTERS = [
  "All",
  "Under ₹50 Lakhs",
  "Ready to Move",
  "East Facing",
  "CRDA Approved",
  "Verified Only",
];

const Home = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProps, setFilteredProps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'callback' | 'contact'>('callback');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [activeSmartFilter, setActiveSmartFilter] = useState('All');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchProperties()
      .then(data => {
        const props = data?.data || (Array.isArray(data) ? data : []);
        setProperties(props);
        setFilteredProps(props);
      })
      .catch(() => {
        // Fallback mock data with real AP locations
        const mockData = [
          { _id: 'p1', title: 'East Facing 3BHK near Undavalli Caves', price: '₹ 85,00,000', location: 'Amaravati', beds: 3, baths: 3, sqft: 1800, type: 'Apartment', condition: '1st Hand', facing: 'East', approvalAuthority: 'AP CRDA', isVerified: true, listerType: 'Verified Builder', areaSize: 1800, measurementUnit: 'SqFt' },
          { _id: 'p2', title: 'Luxury Villa with Vastu', price: '₹ 2,50,00,000', location: 'Vijayawada', beds: 4, baths: 4, sqft: 3200, type: 'Villa', condition: '1st Hand', facing: 'East', approvalAuthority: 'AP RERA', isVerified: true, listerType: 'Verified Builder', areaSize: 3200, measurementUnit: 'SqFt' },
          { _id: 'p3', title: 'Premium Agriculture Land near Capital', price: '₹ 1,20,00,000', location: 'Mangalagiri', beds: 0, baths: 0, sqft: 43560, type: 'Agriculture', condition: 'N/A', facing: 'Any', approvalAuthority: 'Panchayat', isVerified: false, listerType: 'Individual Owner', areaSize: 5, measurementUnit: 'Acres' },
          { _id: 'p4', title: '2BHK Semi Furnished Flat', price: '₹ 48,00,000', location: 'Guntur', beds: 2, baths: 2, sqft: 1100, type: 'Flat', condition: '2nd Hand', facing: 'North', approvalAuthority: 'AP RERA', isVerified: true, listerType: 'Individual Owner', areaSize: 1100, measurementUnit: 'SqFt' },
          { _id: 'p5', title: 'CRDA Approved Plot in Tadepalli', price: '₹ 35,00,000', location: 'Amaravati', beds: 0, baths: 0, sqft: 200, type: 'Agriculture', condition: 'N/A', facing: 'East', approvalAuthority: 'AP CRDA', isVerified: true, listerType: 'Verified Builder', areaSize: 200, measurementUnit: 'SqYards' },
          { _id: 'p6', title: 'Gated Community 3BHK near Beach', price: '₹ 1,10,00,000', location: 'Visakhapatnam', beds: 3, baths: 2, sqft: 1650, type: 'Apartment', condition: '1st Hand', facing: 'East', approvalAuthority: 'VMRDA', isVerified: true, listerType: 'Verified Builder', areaSize: 1650, measurementUnit: 'SqFt' },
        ];
        setProperties(mockData);
        setFilteredProps(mockData);
      })
      .finally(() => setLoading(false));
  }, []);

  // Apply combined filters
  useEffect(() => {
    let result = [...properties];

    // City filter
    if (selectedCity) {
      result = result.filter(p => (p.location || '').toLowerCase().includes(selectedCity.toLowerCase()));
    }

    // Type filter
    if (activeType !== 'all') {
      result = result.filter(p => p.type === activeType);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q) ||
        (p.type || '').toLowerCase().includes(q)
      );
    }

    // Smart filter
    if (activeSmartFilter !== 'All') {
      result = result.filter(p => {
        if (activeSmartFilter === 'Under ₹50 Lakhs') {
          const num = parseInt((p.price || '').replace(/[^0-9]/g, ''), 10);
          return num > 0 && num < 5000000;
        }
        if (activeSmartFilter === 'Ready to Move') return p.condition === '1st Hand';
        if (activeSmartFilter === 'East Facing') return p.facing === 'East';
        if (activeSmartFilter === 'CRDA Approved') return p.approvalAuthority === 'AP CRDA';
        if (activeSmartFilter === 'Verified Only') return p.isVerified === true;
        return true;
      });
    }

    setFilteredProps(result);
  }, [properties, selectedCity, activeType, searchQuery, activeSmartFilter]);

  // Count properties per city
  const cityCounts = AP_CITIES.map(city => ({
    ...city,
    count: properties.filter(p => (p.location || '').toLowerCase().includes(city.name.toLowerCase())).length
  }));

  const handleTriggerLead = (type: 'callback' | 'contact') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* ===== STICKY NAV BAR (Glass) ===== */}
      <header className="app-nav glass">
        <div className="container nav-inner">
          <div className="nav-brand">
            <Logo size={28} />
            <span className="brand-text">Snap<span className="text-gold">Adda</span></span>
          </div>

          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menu">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
            <a href="#search" onClick={() => setIsMobileMenuOpen(false)}>Search</a>
            <a href="#properties" onClick={() => setIsMobileMenuOpen(false)}>Properties</a>
            <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {/* ===== SEARCH BAR SECTION ===== */}
        <section id="search" className="search-section">
          <div className="container">
            <div className="search-bar glass">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search by location, property name, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ===== CIRCULAR CITY EXPLORER ===== */}
        <section className="cities-section">
          <div className="container">
            <div className="section-title-row">
              <h2>Explore Andhra Pradesh</h2>
            </div>
            <div className="cities-scroll">
              {cityCounts.map((city, idx) => (
                <motion.button
                  key={city.id}
                  className={`city-circle ${selectedCity === city.name ? 'active' : ''}`}
                  onClick={() => setSelectedCity(selectedCity === city.name ? null : city.name)}
                  whileTap={{ scale: 0.92 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <div className="city-circle-ring">
                    <div className="city-circle-inner" style={{ background: city.gradient }}>
                      <MapPin size={24} />
                    </div>
                  </div>
                  <span className="city-name">{city.name}</span>
                  <span className="city-count">{city.count} listings</span>
                </motion.button>
              ))}
            </div>
            {selectedCity && (
              <motion.div
                className="active-city-tag"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <MapPin size={14} /> Showing: {selectedCity}
                <button onClick={() => setSelectedCity(null)}><X size={14} /></button>
              </motion.div>
            )}
          </div>
        </section>

        {/* ===== PROPERTY TYPE TABS ===== */}
        <section className="type-tabs-section">
          <div className="container">
            <div className="type-tabs-scroll">
              {PROPERTY_TYPES.map(pt => (
                <button
                  key={pt.value}
                  className={`type-tab ${activeType === pt.value ? 'active' : ''}`}
                  onClick={() => setActiveType(pt.value)}
                >
                  {pt.icon}
                  <span>{pt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SMART FILTER PILLS ===== */}
        <section className="smart-filters-section">
          <div className="container">
            <div className="smart-pills-scroll">
              {SMART_FILTERS.map(filter => (
                <button
                  key={filter}
                  className={`smart-pill ${activeSmartFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveSmartFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PROPERTIES GRID ===== */}
        <section id="properties" className="properties-section">
          <div className="container">
            <div className="section-title-row">
              <h2>{selectedCity ? `Properties in ${selectedCity}` : 'Featured Properties'}</h2>
              <span className="result-count">{filteredProps.length} found</span>
            </div>

            {loading ? (
              <div className="properties-grid">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-md)' }}></div>
                    <div className="skeleton" style={{ height: '18px', width: '70%', marginTop: '12px' }}></div>
                    <div className="skeleton" style={{ height: '14px', width: '50%', marginTop: '8px' }}></div>
                  </div>
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeType + activeSmartFilter + selectedCity + searchQuery}
                  className="properties-grid"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  {filteredProps.length > 0 ? filteredProps.map((prop) => (
                    <PropertyCard
                      key={prop._id || prop.id}
                      {...prop}
                      approval={prop.approvalAuthority || prop.approval}
                      onTriggerLead={handleTriggerLead}
                    />
                  )) : (
                    <div className="empty-state">
                      <Search size={48} />
                      <h3>No properties found</h3>
                      <p>Try adjusting your filters or search query.</p>
                      <Button onClick={() => { setActiveType('all'); setActiveSmartFilter('All'); setSelectedCity(null); setSearchQuery(''); }}>
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* ===== STATS BAR ===== */}
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card glass-gold">
                <TrendingUp size={20} />
                <div className="stat-value">{properties.length}+</div>
                <div className="stat-label">Properties</div>
              </div>
              <div className="stat-card glass-gold">
                <Star size={20} />
                <div className="stat-value">{properties.filter(p => p.isVerified).length}+</div>
                <div className="stat-label">Verified</div>
              </div>
              <div className="stat-card glass-gold">
                <MapPin size={20} />
                <div className="stat-value">{new Set(properties.map(p => p.location)).size}+</div>
                <div className="stat-label">Locations</div>
              </div>
              <div className="stat-card glass-gold">
                <Phone size={20} />
                <div className="stat-value">24/7</div>
                <div className="stat-label">Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="testimonials-section">
          <div className="container">
            <div className="section-title-row">
              <h2>What Our Clients Say</h2>
            </div>
            <div className="testimonials-grid">
              {[
                { name: 'Rajesh Kumar', location: 'Vijayawada', text: 'SnapAdda helped me find the perfect 3BHK apartment near Benz Circle. The entire process was smooth and transparent. Highly recommended!', rating: 5 },
                { name: 'Lakshmi Devi', location: 'Amaravati', text: 'I was looking for agriculture land near Mangalagiri. SnapAdda connected me with verified sellers and I got a great deal with CRDA approval.', rating: 5 },
                { name: 'Venkat Rao', location: 'Guntur', text: 'Purchased a villa through SnapAdda. The virtual tour feature saved me so much time. The team is very professional and knowledgeable.', rating: 4 },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  className="testimonial-card glass"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <div className="testimonial-stars">
                    {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                  </div>
                  <p className="testimonial-text">"{t.text}"</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar" style={{ background: `hsl(${i * 80 + 30}, 40%, 35%)` }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="testimonial-name">{t.name}</div>
                      <div className="testimonial-location"><MapPin size={12} /> {t.location}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CONTACT SECTION ===== */}
        <section id="contact" className="contact-section">
          <div className="container">
            <div className="contact-card glass">
              <h2>Connect with an Expert</h2>
              <p className="text-muted">Our agents specialize in Andhra Pradesh real estate.</p>
              <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                <input type="text" placeholder="Your Name" required />
                <input type="tel" placeholder="Phone Number" required />
                <textarea placeholder="What are you looking for?" rows={3}></textarea>
                <Button size="lg" fullWidth>Request Callback</Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="app-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <Logo size={24} />
            <span>Snap<span className="text-gold">Adda</span></span>
            <p className="text-muted">Andhra Pradesh's trusted property platform.</p>
          </div>
          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Properties</h4>
              <a href="#">Agriculture Land</a>
              <a href="#">Flats & Apartments</a>
              <a href="#">Villas</a>
            </div>
            <div className="footer-col">
              <h4>Regions</h4>
              <a href="#">Amaravati</a>
              <a href="#">Vijayawada</a>
              <a href="#">Guntur</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom container">
          <p className="text-muted">© 2026 SnapAdda. Andhra Pradesh Real Estate.</p>
        </div>
      </footer>

      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
      />
    </div>
  );
};

export default Home;
