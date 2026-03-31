import mongoose from 'mongoose';
import dotenv from 'dotenv';
import City from './models/City.js';
import Property from './models/Property.js';
import Lead from './models/Lead.js';
import Inquiry from './models/Inquiry.js';
import Testimonial from './models/Testimonial.js';
import SiteSetting from './models/SiteSetting.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");
    console.log("URI being used:", process.env.MONGODB_URI?.substring(0, 30) + '...');

    // Clear existing data
    await City.deleteMany({});
    await Property.deleteMany({});
    await Lead.deleteMany({});
    await Inquiry.deleteMany({});
    await Testimonial.deleteMany({});
    await SiteSetting.deleteMany({});

    console.log("Clearing existing data... Done.");

    /* ── 1. Seed Cities ── */
    const cities = await City.insertMany([
      { name: 'Amaravati', image: 'https://images.unsplash.com/photo-1596422846543-1586bd211428?q=80&w=2070', emoji: '🏛️', tagline: 'Capital Region', color: '#c9a84c', description: 'The Capital Region of Andhra Pradesh.', status: 'Active' },
      { name: 'Vijayawada', image: 'https://images.unsplash.com/photo-1600673882341-fc1765c56c24?q=80&w=1974', emoji: '🌊', tagline: 'Commercial Hub', color: '#4a8c5c', description: 'Fastest growing commercial hub of AP.', status: 'Active' },
      { name: 'Visakhapatnam', image: 'https://images.unsplash.com/photo-1542704792-e30dac463c90?q=80&w=2070', emoji: '⛵', tagline: 'Port City', color: '#2a7272', description: 'The beautiful City of Destiny on the coast.', status: 'Active' },
      { name: 'Guntur', image: 'https://images.unsplash.com/photo-1582233479366-6d38bc390a08?q=80&w=2073', emoji: '🌾', tagline: 'Business City', color: '#8c5a3a', description: 'Rapidly developing business city.', status: 'Active' },
      { name: 'Mangalagiri', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070', emoji: '✨', tagline: 'Smart Township', color: '#3a6b8c', description: 'Smart township near the Capital.', status: 'Active' },
      { name: 'Tirupati', image: 'https://images.unsplash.com/photo-1621370609355-68d712ce6a84?q=80&w=2070', emoji: '🏔️', tagline: 'Pilgrimage City', color: '#7a3a6b', description: 'The spiritual heart of Andhra Pradesh.', status: 'Active' }
    ]);
    console.log("Seeded Cities.");

    /* ── 1.5 Seed Site Settings ── */
    await SiteSetting.insertMany([
      { 
        key: 'support_info', 
        value: {
          phone: '+91 91234 56789',
          email: 'hello@snapadda.com',
          whatsapp: '919123456789',
          address: 'D.No 4-56, Benz Circle, Vijayawada, AP 520010',
          workingHours: 'Mon-Sat 9 AM - 7 PM'
        }
      },
      {
        key: 'appearance',
        value: {
          bgUrl: 'https://images.unsplash.com/photo-1600585154340-be6199fce10c?auto=format&fit=crop&q=80&w=1920',
          themeMode: 'royal',
          primaryColor: '#e8b84b',
          enable3D: true,
          glassIntensity: 'high'
        }
      },
      {
        key: 'hero_content',
        value: {
          eyebrow: "Andhra Pradesh's #1 Property Platform",
          title: "Discover Your Dream Place in Andhra",
          subtitle: "Browse verified listings across Amaravati, Vijayawada, Guntur & beyond. CRDA-approved properties. Real prices. Trusted sellers.",
          cta1Text: "BROWSE PROPERTIES",
          cta1Url: "#search",
          cta2Text: "FREE EXPERT CALL",
          cta2Url: "callback"
        }
      },
      {
        key: 'site_stats',
        value: [
          { label: 'Verified Listings', value: '1,200+', icon: 'ShieldCheck' },
          { label: 'Cities Covered', value: '12', icon: 'MapPin' },
          { label: 'Happy Clients', value: '2,400+', icon: 'TrendingUp' },
          { label: 'Approved Properties', value: 'CRDA', icon: 'Building2' }
        ]
      }
    ]);
    console.log("Seeded Site Settings.");

    /* ── 2. Seed Testimonials ── */
    await Testimonial.insertMany([
      { name: 'Rajesh Kumar',  location: 'Vijayawada', text: 'SnapAdda helped me find the perfect 3BHK near Benz Circle. Smooth, transparent, and professional. Highly recommended!', rating: 5, color: '#6b4226' },
      { name: 'Lakshmi Devi',  location: 'Amaravati',  text: 'Found CRDA-approved agriculture land near Mangalagiri through SnapAdda. Verified sellers and great pricing!',            rating: 5, color: '#264a6b' },
      { name: 'Venkat Rao',    location: 'Guntur',     text: 'Purchased a villa via SnapAdda. The virtual tour feature saved house. Very knowledgeable team throughout.',               rating: 4, color: '#3d266b' },
      { name: 'Anitha Reddy',  location: 'Visakhapatnam', text: 'Stunning beachfront apartment found in Rushikonda. The team was very patient and helped with legal works.',            rating: 5, color: '#266b4a' },
      { name: 'Srinivasa Rao', location: 'Tenali',       text: 'The best platform for finding AP RERA approved plots. I bought one in Laxmipuram and the dealing was totally transparent.', rating: 5, color: '#8c3a5a' },
      { name: 'Kalyani S',     location: 'Narasaraopet', text: 'I sold my farmland near the bypass road instantly through their active buyers list. Zero hassle and fast processing.', rating: 5, color: '#3a8c5a' },
      { name: 'Brahma Naidu',  location: 'Sattenapalli', text: 'Great investment deals on open plots. Their team verified all the link documents before we made the advance payment.', rating: 4, color: '#6b3a8c' },
      { name: 'Sireesha T',    location: 'Mangalagiri',  text: 'Looking for a flat near AIIMS was a headache until finding SnapAdda. We closed the deal in under a week!', rating: 5, color: '#8c5a3a' },
      { name: 'Ramakrishna V', location: 'Guntur',       text: 'Transparent pricing with no hidden charges. The CRM portal kept me updated on my site visit schedules.', rating: 5, color: '#2a7272' },
      { name: 'Praveen Y',     location: 'Vijayawada',   text: 'I loved the 3D property view. It gave me a perfect idea of the East-facing villa before I even visited Kanuru.', rating: 5, color: '#5a3a8c' },
      { name: 'Swapna D',      location: 'Tenali',       text: 'Highly reliable service. They cross-checked the panchyat layout approvals and saved me from a risky deal.', rating: 4, color: '#8c722a' },
      { name: 'Vamsi Krishna', location: 'Amaravati',    text: 'Capital region properties are booming, and SnapAdda has the most authentic database of sellers. Five stars!', rating: 5, color: '#722a5a' },
      { name: 'Naveen Reddy',  location: 'Sattenapalli', text: 'Excellent support staff. They guided us on the exact registration value for our new commercial space.', rating: 5, color: '#2a5a72' },
      { name: 'Kavitha P',     location: 'Narasaraopet', text: 'Secured a well-lit corner plot through their app. The user interface is so simple and the listings are real.', rating: 5, color: '#5a722a' },
      { name: 'Koteswara Rao', location: 'Guntur',       text: 'From search to registry, everything was handled professionally. Highly recommend their smart filtering system.', rating: 4, color: '#724a2a' }
    ]);
    console.log("Seeded 15 Testimonials.");

    /* ── 3. Seed Properties ── */
    const props = [
      {
        title: '3BHK Eco-Friendly Villa in Amaravati',
        description: 'Vastu-compliant luxury villa with solar power and rain-water harvesting. Within 5km of the Capital Secretariat.',
        price: 18500000,
        location: 'Amaravati',
        cityId: cities[0]._id,
        type: 'Villa',
        facing: 'East',
        approvalAuthority: 'AP CRDA',
        measurementUnit: 'SqYards',
        areaSize: 320,
        beds: 3,
        baths: 3,
        isFeatured: true,
        isVerified: true,
        images: ['https://images.unsplash.com/photo-1600585154340-be6199fce10c?auto=format&fit=crop&q=80&w=1200']
      },
      {
        title: 'Modern Apartment in Benz Circle',
        description: 'High-rise luxury living in the heart of Vijayawada. Gated community with clubhouse and infinity pool.',
        price: 9500000,
        location: 'Benz Circle, Vijayawada',
        cityId: cities[1]._id,
        type: 'Apartment',
        facing: 'North-East',
        approvalAuthority: 'Municipal',
        measurementUnit: 'SqFt',
        areaSize: 1850,
        beds: 3,
        baths: 2,
        isFeatured: true,
        isVerified: true,
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200']
      },
      {
        title: 'Beachfront High-Rise in Rushikonda',
        description: 'Wake up to the sound of waves. Ultra-luxurious apartment with panoramic views of the Bay of Bengal.',
        price: 24000000,
        location: 'Rushikonda, Visakhapatnam',
        cityId: cities[2]._id,
        type: 'Flat',
        facing: 'East',
        approvalAuthority: 'VMRDA',
        measurementUnit: 'SqFt',
        areaSize: 2600,
        beds: 4,
        baths: 4,
        isFeatured: true,
        isVerified: true,
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200']
      },
      {
        title: 'Premium Gated Plots in Mangalagiri',
        description: 'Investment opportunity of the decade. Plot near AIIMS and IT Parks with black-top roads and underground drainage.',
        price: 4500000,
        location: 'Mangalagiri, Guntur Highway',
        cityId: cities[4]._id,
        type: 'Plot',
        facing: 'West',
        approvalAuthority: 'AP RERA',
        measurementUnit: 'SqYards',
        areaSize: 200,
        isFeatured: false,
        isVerified: true,
        images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200']
      },
      {
        title: 'Productive Farmland near Gorantla',
        description: '5 Acres of fertile land perfect for horticulture or farmhouses. Clear titles with canal irrigation facility.',
        price: 35000000,
        location: 'Gorantla, Guntur',
        cityId: cities[3]._id,
        type: 'Agriculture',
        facing: 'Any',
        approvalAuthority: 'Panchayat',
        measurementUnit: 'Acres',
        areaSize: 5,
        isFeatured: false,
        isVerified: true,
        images: ['https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1200']
      },
      {
        title: 'Spacious Villa in Madhurawada',
        description: 'Elegant independent villa in the quiet valleys of Madhurawada. Premium teak wood finishes and lush garden.',
        price: 16500000,
        location: 'Madhurawada, Vizag',
        cityId: cities[2]._id,
        type: 'Villa',
        facing: 'North',
        approvalAuthority: 'VMRDA',
        measurementUnit: 'SqYards',
        areaSize: 280,
        beds: 3,
        baths: 3,
        isFeatured: false,
        isVerified: true,
        images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200']
      }
    ];
    await Property.insertMany(props);
    console.log("Seeded Properties.");

    const seededProps = await Property.find();

    /* ── 4. Seed Leads & Inquiries ── */
    const sampleLeads = await Lead.insertMany([
      { 
        name: 'Suresh Babu', 
        phone: '9876543210', 
        status: 'New', 
        propertyId: seededProps[0]._id, 
        message: 'Interested in site visit this weekend.' 
      },
      { 
        name: 'Priyanka T', 
        phone: '8765432109', 
        status: 'Contacted', 
        propertyId: seededProps[1]._id, 
        message: 'Asked about loan facility.' 
      }
    ]);

    await Inquiry.insertMany([
      { 
        propertyId: seededProps[0]._id,
        clientName: 'Suresh Babu', 
        clientContact: '9876543210',
        question: 'Is the CRDA approval valid for LRS?', 
        answer: 'Yes, it is a fully sanctioned CRDA layout with LRS clearance.',
        status: 'Answered'
      },
      { 
        propertyId: seededProps[1]._id,
        clientName: 'Rahul Khanna', 
        clientContact: '9123456789',
        question: 'What are the maintenance charges per month?', 
        status: 'Pending'
      }
    ]);
    console.log("Seeded CRM Data.");

    console.log("\n✅ Database Seeding Complete!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seedDatabase();
