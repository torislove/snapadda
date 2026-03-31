import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SiteSetting from './server/api/models/SiteSetting.js';

dotenv.config();

const settings = [
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
];

async function update() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    for (const s of settings) {
      await SiteSetting.findOneAndUpdate(
        { key: s.key },
        { value: s.value },
        { upsert: true, new: true }
      );
    }
    console.log('Successfully updated site settings');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

update();
