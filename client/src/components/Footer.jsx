import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ExternalLink, ShieldCheck, Globe, Instagram, Facebook, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';

export default function Footer() {
  const { t } = useTranslation();

  const districts = [
    'Vijayawada', 'Amaravati', 'Guntur', 'Visakhapatnam', 'Tirupati', 'Nellore', 'Kurnool'
  ];

  return (
    <footer className="app-footer" style={{
      background: 'linear-gradient(180deg, rgba(10,12,20,0) 0%, rgba(5,7,12,1) 10%, #020408 100%)',
      padding: '4rem 0 2rem',
      borderTop: '1px solid rgba(255,255,255,0.03)',
      marginTop: '4rem',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '3rem',
          marginBottom: '4rem'
        }}>
          {/* Brand Col */}
          <div className="footer-col">
            <Logo size={28} showText />
            <p style={{ 
              marginTop: '1.5rem', 
              fontSize: '0.88rem', 
              color: 'rgba(255,255,255,0.45)', 
              lineHeight: 1.7,
              maxWidth: '300px'
            }}>
              Andhra Pradesh's most trusted 3D interactive property portal. We simplify search, verify authenticity, and deliver dreams.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '1.5rem' }}>
              <a href="https://instagram.com/snapadda" target="_blank" rel="noreferrer" className="social-link"><Instagram size={18} /></a>
              <a href="https://facebook.com/snapadda" target="_blank" rel="noreferrer" className="social-link"><Facebook size={18} /></a>
              <a href="https://twitter.com/snapadda" target="_blank" rel="noreferrer" className="social-link"><Twitter size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 style={{ color: 'white', fontWeight: 900, fontSize: '0.9rem', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>INSTITUTIONAL</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/search" className="footer-link">Explore Assets</Link>
              <Link to="/post-property" className="footer-link" style={{ color: 'var(--gold)' }}>Post Your Property</Link>
              <Link to="/compare" className="footer-link">Comparison Radar</Link>
              <Link to="/dashboard" className="footer-link">Investor Dashboard</Link>
            </div>
          </div>

          {/* Regional SEO Links */}
          <div className="footer-col">
            <h4 style={{ color: 'white', fontWeight: 900, fontSize: '0.9rem', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>REGIONAL COVERAGE</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {districts.map(city => (
                <Link 
                  key={city} 
                  to={`/search?keyword=${encodeURIComponent(city)}`} 
                  className="footer-pill-link"
                >
                  {city}
                </Link>
              ))}
              <Link to="/regional-directory" className="footer-pill-link" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>
                View All 600+ Mandals
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4 style={{ color: 'white', fontWeight: 900, fontSize: '0.9rem', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>ELITE SUPPORT</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="mailto:info@snapadda.com" className="footer-contact-item">
                <Mail size={14} color="var(--gold)" /> info@snapadda.com
              </a>
              <a href="tel:+919346793364" className="footer-contact-item">
                <Phone size={14} color="var(--gold)" /> +91 93467 93364
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal */}
        <div style={{ 
          paddingTop: '2rem', 
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
            © 2026 SnapAdda Enterprise. Built with ❤️ in Andhra Pradesh.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/terms" className="footer-legal-link">Terms</Link>
            <Link to="/privacy" className="footer-legal-link">Privacy</Link>
            <a href="/sitemap.xml" target="_blank" className="footer-legal-link" style={{ color: 'var(--gold)' }}>Dynamic Sitemap</a>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link {
          color: rgba(255,255,255,0.5);
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link:hover { color: white; }
        
        .footer-pill-link {
          padding: 6px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: rgba(255,255,255,0.6);
          font-size: 0.75rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
        }
        .footer-pill-link:hover {
          background: rgba(255,255,255,0.08);
          color: white;
          border-color: rgba(255,255,255,0.2);
        }

        .footer-contact-item {
          color: rgba(255,255,255,0.7);
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: none;
          display: flex;
          alignItems: center;
          gap: 10px;
        }

        .footer-legal-link {
          color: rgba(255,255,255,0.3);
          font-size: 0.72rem;
          font-weight: 700;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .footer-legal-link:hover { color: rgba(255,255,255,0.6); }

        .social-link {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.5);
          transition: all 0.2s;
        }
        .social-link:hover {
          background: var(--gold);
          color: black;
          transform: translateY(-2px);
        }
      `}</style>
    </footer>
  );
}
