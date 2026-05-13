import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Promotion from '../api/models/Promotion.js';

dotenv.config({ path: './server/.env' });

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/snapadda";

const promotions = [
  {
    type: 'festival',
    title: 'Summer Invest Flash',
    subtitle: 'Get exclusive 15% discount on Amaravati CRDA approved plots. Limited time offer for early investors.',
    actionText: 'Grab Offer',
    actionUrl: '/search?category=Plot',
    image: 'https://res.cloudinary.com/dmv7690/image/upload/v1715500000/offers/amaravati_plots.jpg',
    countdownActive: true,
    size: '2x1',
    cardColor: 'gold-glass',
    displayOrder: 0,
    isActive: true,
    displaySegment: 'both'
  },
  {
    type: 'ad',
    title: 'NRI Premier Access',
    subtitle: 'Special site visit arrangements and legal assistance for our NRI clients. Explore Guntur luxury villas.',
    actionText: 'Inquire Now',
    actionUrl: '/request-callback',
    image: 'https://res.cloudinary.com/dmv7690/image/upload/v1715500000/offers/luxury_villa.jpg',
    size: '1x1',
    cardColor: 'royal-blue',
    displayOrder: 1,
    isActive: true,
    displaySegment: 'both'
  },
  {
    type: 'update',
    title: 'Festival Heritage',
    subtitle: 'Own a piece of Andhra heritage. Special rates on fertile agricultural lands near Mangalagiri.',
    actionText: 'View Lands',
    actionUrl: '/search?category=Agri',
    image: 'https://res.cloudinary.com/dmv7690/image/upload/v1715500000/offers/agri_land.jpg',
    size: '1x1',
    cardColor: 'emerald-glass',
    displayOrder: 2,
    isActive: true,
    displaySegment: 'hero'
  },
  {
    type: 'ad',
    title: 'Smart Property Swap',
    subtitle: 'Upgrade your current property. Instant valuation and seamless transition to your dream home.',
    actionText: 'Start Swap',
    actionUrl: '/post-property',
    image: 'https://res.cloudinary.com/dmv7690/image/upload/v1715500000/offers/modern_house.jpg',
    size: '2x2',
    cardColor: 'purple-deep',
    displayOrder: 3,
    isActive: true,
    displaySegment: 'floating'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('CONNECTED to MongoDB');

    // Clear existing dummy ones if needed, or just add new ones
    // await Promotion.deleteMany({ title: { $in: promotions.map(p => p.title) } });
    
    // Check if they already exist to avoid duplicates
    for (const p of promotions) {
        const exists = await Promotion.findOne({ title: p.title });
        if (!exists) {
            await Promotion.create(p);
            console.log(`CREATED: ${p.title}`);
        } else {
            console.log(`SKIPPED (Already exists): ${p.title}`);
        }
    }

    console.log('SEEDING COMPLETE');
    process.exit(0);
  } catch (err) {
    console.error('SEEDING ERROR:', err);
    process.exit(1);
  }
}

seed();
