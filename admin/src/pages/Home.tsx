import { Button } from '../components/ui/Button';
import { PropertyCard } from '../components/ui/PropertyCard';
import { Logo } from '../components/ui/Logo';
import { Building, Home as HomeIcon, Tractor, Key, MapPin } from 'lucide-react';
import './Home.css';

const FEATURED_PROPERTIES = [
  {
    id: 1,
    title: 'Premium 3BHK Apartment',
    price: '₹ 85,00,000',
    location: 'Amaravati Capital Region, AP',
    beds: 3,
    baths: 3,
    sqft: 1800,
    type: 'Apartment',
    condition: '1st Hand',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    title: 'Luxury Villa with Garden',
    price: '₹ 2,50,00,000',
    location: 'Guntur District, AP',
    beds: 4,
    baths: 4,
    sqft: 3200,
    type: 'Villa',
    condition: '2nd Hand',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    title: 'Rich Agriculture Land',
    price: '₹ 1,20,00,000 / Acre',
    location: 'Mangalagiri, AP',
    beds: 0,
    baths: 0,
    sqft: 43560,
    type: 'Agriculture',
    condition: '',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

const CATEGORIES = [
  { id: 1, title: 'Agriculture Land', icon: <Tractor size={32} /> },
  { id: 2, title: 'Flats & Apartments', icon: <Building size={32} /> },
  { id: 3, title: 'Luxury Villas', icon: <HomeIcon size={32} /> },
  { id: 4, title: '1st & 2nd Hand', icon: <Key size={32} /> },
];

const ANDHRA_CITIES = [
  { id: 1, name: 'Amaravati Region', count: '142+ Properties', image: 'https://images.unsplash.com/photo-1548625361-ec85374dfb1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80' },
  { id: 2, name: 'Vijayawada', count: '89+ Properties', image: 'https://images.unsplash.com/photo-1596422846543-74c6d64eb070?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80' },
  { id: 3, name: 'Guntur', count: '64+ Properties', image: 'https://images.unsplash.com/photo-1623057000041-3a216a928eeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80' },
  { id: 4, name: 'Mangalagiri', count: '35+ Properties', image: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80' },
];

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header animate-fade-in">
        <nav className="navbar container">
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Logo size={32} />
            <span>Snap<span className="text-gold">Adda</span></span>
          </div>
          <div className="nav-links">
            <a href="#properties">Properties</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <Button variant="outline" size="sm" onClick={() => window.location.href='/admin'}>Mediator Login</Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content container animate-fade-in">
            <h1>Discover Your <span className="text-gold">Dream Home</span></h1>
            <p className="hero-subtitle text-muted">
              Exclusive properties, uncompromising luxury, and unparalleled service.
            </p>
            <div className="hero-actions">
              <Button size="lg">Explore Properties</Button>
              <Button variant="outline" size="lg">Contact Us</Button>
            </div>
          </div>
          <div className="hero-overlay"></div>
        </section>

        {/* Categories Section */}
        <section className="categories-section container">
          <div className="section-header text-center">
            <h2>Explore by Property Type</h2>
            <p className="text-muted">Find exactly what you are looking for in Andhra Pradesh.</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="category-card">
                <div className="category-icon">{cat.icon}</div>
                <h3>{cat.title}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Cities Section */}
        <section className="cities-section container">
          <div className="section-header">
            <h2>Discover Andhra Region</h2>
            <Button variant="ghost">View All Districts</Button>
          </div>
          <div className="cities-grid">
            {ANDHRA_CITIES.map(city => (
              <div key={city.id} className="city-card">
                <img src={city.image} alt={city.name} className="city-image" />
                <div className="city-overlay">
                  <h3><MapPin size={20} className="inline-icon" /> {city.name}</h3>
                  <p>{city.count}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="properties" className="properties-section container">
          <div className="section-header">
            <h2>Featured Properties</h2>
            <Button variant="ghost">View All Properties</Button>
          </div>
          <div className="properties-grid">
            {FEATURED_PROPERTIES.map((prop) => (
              <PropertyCard key={prop.id} {...prop} />
            ))}
          </div>
        </section>

        <section id="contact" className="contact-section container">
          <div className="contact-card">
            <h2 className="text-gold">Connect with a Mediator</h2>
            <p className="text-muted">Our exclusive agents are ready to assist you in finding your perfect estate.</p>
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Your Name" />
              <input type="email" placeholder="Email Address" />
              <input type="tel" placeholder="Phone Number" />
              <textarea placeholder="How can we help you?" rows={4}></textarea>
              <Button size="lg" fullWidth>Request Consultation</Button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-md)' }}>
              <Logo size={28} />
              <span>Snap<span className="text-gold">Adda</span></span>
            </div>
            <p className="text-muted">The premier real estate platform for Andhra and Amaravati regions.</p>
          </div>
          <div className="footer-links">
            <div className="link-column">
              <h4>Property Types</h4>
              <a href="#">Agriculture Land</a>
              <a href="#">Flats & Apartments</a>
              <a href="#">Villas</a>
              <a href="#">1st & 2nd Hand</a>
            </div>
            <div className="link-column">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Mediators</a>
              <a href="#">Careers</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom container">
          <p className="text-muted">&copy; 2026 SnapAdda. Specializing in Amaravati & Andhra Real Estate.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
