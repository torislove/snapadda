import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AP_REGIONS = [
  {
    district: 'NTR District (Vijayawada)',
    mandals: ['Vijayawada (Urban)', 'Vijayawada (Rural)', 'Ibrahimpatnam', 'Jaggayyapeta', 'Kanchikacherla', 'Kondapalli', 'Mylavaram', 'Nandigama', 'Tiruvuru', 'Vatsavai']
  },
  {
    district: 'Guntur',
    mandals: ['Guntur (Urban)', 'Guntur (Rural)', 'Mangalagiri', 'Tadepalle', 'Tenali', 'Ponnur', 'Prathipadu', 'Pedakakani', 'Tadikonda', 'Chebrolu']
  },
  {
    district: 'Visakhapatnam',
    mandals: ['Visakhapatnam (Urban)', 'Gajuwaka', 'Maharani Peta', 'Mulagada', 'Seethammadhara', 'Bheemunipatnam', 'Anandapuram', 'Padmanabham', 'Pendurthi']
  },
  {
    district: 'Amaravathi (Capital Region)',
    mandals: ['Thullur', 'Tulluru', 'Ananthavaram', 'Nelapadu', 'Sakhamuru', 'Mandadam', 'Venkatapalem', 'Undavalli', 'Penumaka', 'Rayapudi']
  },
  {
    district: 'Krishna',
    mandals: ['Machilipatnam', 'Gudivada', 'Nuzvid', 'Pamarru', 'Penamaluru', 'Gannavaram', 'Unguturu', 'Vuyyuru', 'Movva', 'Challapalli']
  },
  {
    district: 'East Godavari',
    mandals: ['Rajahmundry (Urban)', 'Rajahmundry (Rural)', 'Kovvur', 'Nidadavolu', 'Anaparthi', 'Rajanagaram', 'Gopalapuram', 'Devarapalle']
  },
  {
    district: 'West Godavari',
    mandals: ['Bhimavaram', 'Palacole', 'Tanuku', 'Narasapuram', 'Tadepalligudem', 'Undi', 'Achanta', 'Iragavaram']
  },
  {
    district: 'Kakinada',
    mandals: ['Kakinada (Urban)', 'Kakinada (Rural)', 'Pithapuram', 'Samalkota', 'Peddapuram', 'Tuni', 'Prathipadu', 'Jaggampeta']
  },
  {
    district: 'Konaseema',
    mandals: ['Amalapuram', 'Razole', 'Mummidivaram', 'Kothapeta', 'Ravulapalem', 'P.Gannavaram', 'Malamuru']
  },
  {
    district: 'Tirupati',
    mandals: ['Tirupati (Urban)', 'Tirupati (Rural)', 'Srikalahasti', 'Chandragiri', 'Renigunta', 'Yerpedu', 'Puttur', 'Narayanavanam']
  },
  {
    district: 'SPSR Nellore',
    mandals: ['Nellore (Urban)', 'Nellore (Rural)', 'Kavali', 'Gudur', 'Sullurpeta', 'Atmakur', 'Vinjamur', 'Buchireddypalem']
  },
  {
    district: 'Kurnool',
    mandals: ['Kurnool (Urban)', 'Adoni', 'Yemmiganur', 'Kodumur', 'Guduru', 'Mantralayam', 'Panyam']
  },
  {
    district: 'Nandyal',
    mandals: ['Nandyal', 'Allagadda', 'Srisailam', 'Atmakur', 'Koilkuntla', 'Banaganapalle', 'Dhone']
  },
  {
    district: 'Anantapur',
    mandals: ['Anantapur', 'Guntakal', 'Tadipatri', 'Rayanadurg', 'Kalyandurg', 'Uravakonda']
  },
  {
    district: 'Sri Sathya Sai',
    mandals: ['Puttaparthi', 'Hindupur', 'Kadiri', 'Dharmavaram', 'Penukonda', 'Madakasira']
  },
  {
    district: 'YSR Kadapa',
    mandals: ['Kadapa', 'Proddatur', 'Pulivendula', 'Jammalamadugu', 'Mydukur', 'Kamalapuram']
  },
  {
    district: 'Annamayya',
    mandals: ['Rayachoti', 'Madanapalle', 'Rajampet', 'Railway Koduru', 'Pileru', 'Tamballapalle']
  },
  {
    district: 'Chittoor',
    mandals: ['Chittoor', 'Palamaner', 'Kuppam', 'Nagari', 'Gangadhara Nellore', 'Puthalapattu']
  },
  {
    district: 'Bapatla',
    mandals: ['Bapatla', 'Chirala', 'Repalle', 'Addanki', 'Parchur', 'Martur']
  },
  {
    district: 'Palnadu',
    mandals: ['Narasaraopet', 'Sattenapalle', 'Gurazala', 'Macherla', 'Vinukonda', 'Chilakaluripet']
  },
  {
    district: 'Prakasam',
    mandals: ['Ongole', 'Markapur', 'Kandukur', 'Giddalur', 'Kanigiri', 'Podili']
  },
  {
    district: 'Eluru',
    mandals: ['Eluru', 'Jangareddygudem', 'Chintalapudi', 'Polavaram', 'Nuzvid', 'Kaikaluru']
  },
  {
    district: 'Srikakulam',
    mandals: ['Srikakulam', 'Narasannapeta', 'Tekkali', 'Palasa', 'Ichapuram', 'Amadalavalasa']
  },
  {
    district: 'Vizianagaram',
    mandals: ['Vizianagaram', 'Bobbili', 'Gajapathinagaram', 'Cheepurupalle', 'Nellimarla']
  },
  {
    district: 'Parvathipuram Manyam',
    mandals: ['Parvathipuram', 'Palakonda', 'Salur', 'Kurupam', 'Gummalaxmipuram']
  },
  {
    district: 'Anakapalli',
    mandals: ['Anakapalli', 'Chodavaram', 'Madugula', 'Narsipatnam', 'Elamanchili', 'Payakaraopeta']
  },
  {
    district: 'Alluri Sitharama Raju',
    mandals: ['Paderu', 'Araku Valley', 'Rampachodavaram', 'Chinturu', 'Addateegala']
  }
];

export default function RegionalSitemap() {
  return (
    <section className="regional-sitemap-section" style={{ padding: '4rem 0', background: 'rgba(5,10,20,0.8)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="container">
        <div className="section-head" style={{ marginBottom: '3rem' }}>
          <div className="section-eyebrow"><MapPin size={14} style={{ marginRight: '6px' }} /> Regional Asset Coverage</div>
          <h2 className="section-title" style={{ fontSize: '2rem', color: 'white' }}>Real Estate in Andhra Pradesh</h2>
          <p style={{ color: 'var(--txt-secondary)', maxWidth: '700px', marginTop: '1rem' }}>
            Explore verified residential, commercial, and agricultural properties across every district and mandal. 
            SnapAdda provides the most comprehensive asset discovery platform in AP.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '2.5rem' 
        }}>
          {AP_REGIONS.map((region, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <h3 style={{ 
                fontSize: '1.1rem', 
                color: 'var(--gold)', 
                fontWeight: 900, 
                marginBottom: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                borderBottom: '1px solid rgba(232,184,75,0.2)',
                paddingBottom: '8px'
              }}>
                {region.district}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {region.mandals.map((mandal, mIdx) => (
                  <li key={mIdx}>
                    <Link 
                      to={`/local-agency/${mandal}`}
                      style={{ 
                        color: 'rgba(255,255,255,0.6)', 
                        fontSize: '0.85rem', 
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => e.target.style.color = 'white'}
                      onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
                    >
                      <ArrowRight size={10} style={{ opacity: 0.5 }} /> {mandal}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: '4rem', padding: '2rem', borderRadius: '24px', background: 'rgba(232,184,75,0.05)', border: '1px solid rgba(232,184,75,0.1)', textAlign: 'center' }}>
          <h4 style={{ color: 'white', marginBottom: '1rem' }}>Looking for something specific?</h4>
          <p style={{ color: 'var(--txt-secondary)', marginBottom: '2rem' }}>We have listings in 600+ mandals. Use our smart search to find exactly what you need.</p>
          <Link to="/search" className="btn-3d-glass" style={{ padding: '12px 32px', display: 'inline-flex', background: 'var(--gold)', color: 'black', borderRadius: '12px', fontWeight: 900, textDecoration: 'none' }}>
            START SMART SEARCH
          </Link>
        </div>
      </div>
    </section>
  );
}
