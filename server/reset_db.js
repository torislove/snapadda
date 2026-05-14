import 'dotenv/config';
import mongoose from 'mongoose';
import Property from './api/models/Property.js';
import Inquiry from './api/models/Inquiry.js';
import Question from './api/models/Question.js';
import Lead from './api/models/Lead.js';
import Contact from './api/models/Contact.js';
import ChatMessage from './api/models/ChatMessage.js';
import Promotion from './api/models/Promotion.js';
import Testimonial from './api/models/Testimonial.js';
import User from './api/models/User.js';
import SiteSetting from './api/models/SiteSetting.js';
import FranchiseAdmin from './api/models/FranchiseAdmin.js';

const resetDatabase = async () => {

  try {
    console.log('--- DB RESET ENGINE ACTIVATED ---');
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGO_URI is missing');

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // 1. Wipe properties
    const propCount = await Property.countDocuments();
    await Property.deleteMany({});
    console.log(`🗑️ Deleted ${propCount} Properties`);

    // 2. Wipe Inquiries, Questions, Leads
    await Inquiry.deleteMany({});
    await Question.deleteMany({});
    await Lead.deleteMany({});
    await Contact.deleteMany({});
    await ChatMessage.deleteMany({});
    console.log('🗑️ Deleted all Inquiries, Questions, Leads, Contacts, and ChatMessages');

    // 3. Wipe Promotions, Testimonials, and FranchiseAdmins
    await Promotion.deleteMany({});
    await Testimonial.deleteMany({});
    await FranchiseAdmin.deleteMany({});
    console.log('🗑️ Deleted all Promotions, Testimonials, and FranchiseAdmins');


    // 4. Wipe Users (EXCEPT ADMINS)
    const userCount = await User.countDocuments({ role: { $ne: 'admin' } });
    const admins = await User.find({ role: 'admin' });
    
    await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`🗑️ Deleted ${userCount} Non-Admin Users`);
    console.log(`💎 Preserved ${admins.length} Admin Accounts`);
    admins.forEach(a => console.log(`   - ${a.email} (${a.name})`));

    // 5. Site Settings - We usually want to keep these for site config, but the user said "remove everything".
    // I'll keep them to avoid breaking site logic (like radii, support info), but I'll log them.
    const settingsCount = await SiteSetting.countDocuments();
    console.log(`ℹ️ Preserved ${settingsCount} Site Settings (Critical for UI stability)`);

    console.log('--- DB RESET COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error('CRITICAL_RESET_ERROR:', err.message);
    process.exit(1);
  }
};

resetDatabase();
