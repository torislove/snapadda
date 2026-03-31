import express from 'express';
import Property from '../models/Property.js';
import Lead from '../models/Lead.js';
import Inquiry from '../models/Inquiry.js';

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [propertyCount, leadCount, inquiryCount, recentProperties, recentInquiries] = await Promise.all([
      Property.countDocuments(),
      Lead.countDocuments(),
      Inquiry.countDocuments(),
      Property.find().sort({ createdAt: -1 }).limit(5).select('title price location status createdAt'),
      Inquiry.find().sort({ createdAt: -1 }).limit(5).populate('propertyId', 'title'),
    ]);

    const verifiedCount = await Property.countDocuments({ isVerified: true });
    const activeCount = await Property.countDocuments({ status: 'Active' });
    const pendingInquiries = await Inquiry.countDocuments({ status: 'Pending' });

    res.status(200).json({
      status: 'success',
      data: {
        propertyCount,
        leadCount,
        inquiryCount,
        verifiedCount,
        activeCount,
        pendingInquiries,
        recentProperties,
        recentInquiries,
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
