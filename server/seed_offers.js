import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Promotion from './api/models/Promotion.js';

const seedInstitutionalOffers = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snapadda';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    const sampleOffers = [
      {
        type: 'institutional',
        title: 'Institutional Grade Yield',
        subtitle: 'Prime Commercial Assets in Amaravati Capital Region',
        actionText: 'Explore Portfolios',
        actionUrl: '/search?isFeatured=true',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070',
        cardColor: 'gold-glass',
        isActive: true,
        displayOrder: 0,
        displaySegment: 'both'
      },
      {
        type: 'offer',
        title: 'Monsoon Investor Special',
        subtitle: 'Instant 12% ROI on Selected Agricultural Plots',
        actionText: 'Lock Opportunity',
        actionUrl: '/search?purpose=Investment',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070',
        cardColor: 'glass-dark',
        isActive: true,
        displayOrder: 1,
        displaySegment: 'both'
      },
      {
        type: 'institutional',
        title: 'Elite Commercial Hub',
        subtitle: 'Pre-leased Grade A Office Spaces',
        actionText: 'View Inventory',
        actionUrl: '/search?type=Commercial',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2070',
        cardColor: 'gold-glass',
        isActive: true,
        displayOrder: 2,
        displaySegment: 'both'
      },
      {
        type: 'festival',
        title: 'Akshaya Tritiya Elite',
        subtitle: 'Complimentary Gold Coins on Property Booking',
        actionText: 'Claim Offer',
        actionUrl: '/search',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070',
        cardColor: 'gold-gradient',
        isActive: true,
        displayOrder: 3,
        displaySegment: 'both'
      }
    ];

    // Clear existing to ensure fresh 4
    await Promotion.deleteMany({});
    
    await Promotion.insertMany(sampleOffers);
    console.log('Successfully seeded 4 premium offers.');
    
    process.exit(0);
  } catch (err) {
    console.error('SEED_ERROR:', err);
    process.exit(1);
  }
};

seedInstitutionalOffers();
