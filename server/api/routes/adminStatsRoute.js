import express from 'express';
import Property from '../models/Property.js';
import Lead from '../models/Lead.js';
import Inquiry from '../models/Inquiry.js';

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [propertyCount, recentProperties] = await Promise.all([
      Property.countDocuments(),
      Property.find().sort({ createdAt: -1 }).limit(5).select('title price location status createdAt'),
    ]);

    const verifiedCount = await Property.countDocuments({ isVerified: true });
    const activeCount = await Property.countDocuments({ status: 'Active' });

    // Enforce Zero counts for extraneous metrics as per "only keep property" directive
    const leadCount = 0;
    const inquiryCount = 0;
    const pendingInquiries = 0;
    const totalLikes = 0;
    const totalShares = 0;
    const recentInquiries = [];

    // Format the Trend Data into a 7-day flatline map
    const chartDataMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      chartDataMap[key] = { name: dayName, leads: 0, inquiries: 0 };
    }

    const chartData = Object.values(chartDataMap);

    res.status(200).json({
      status: 'success',
      data: {
        propertyCount,
        leadCount,
        inquiryCount,
        verifiedCount,
        activeCount,
        pendingInquiries,
        totalLikes,
        totalShares,
        recentProperties,
        recentInquiries,
        chartData
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
