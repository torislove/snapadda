import express from 'express';
import Property from '../models/Property.js';
import Lead from '../models/Lead.js';
import Inquiry from '../models/Inquiry.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [propertyCount, leadCount, inquiryCount, recentProperties, recentInquiries, recentLeads] = await Promise.all([
      Property.countDocuments(),
      Lead.countDocuments(),
      Inquiry.countDocuments(),
      Property.find().sort({ createdAt: -1 }).limit(5).select('title price location status createdAt'),
      Inquiry.find().sort({ createdAt: -1 }).limit(5).populate('propertyId', 'title'),
      Lead.find().sort({ createdAt: -1 }).limit(5).populate('propertyId', 'title')
    ]);

    const verifiedCount = await Property.countDocuments({ isVerified: true });
    const activeCount = await Property.countDocuments({ status: 'Active' });
    const pendingInquiries = await Inquiry.countDocuments({ status: 'Pending' });
    const pendingSubmissions = await Property.countDocuments({ status: 'Pending' });

    // Aggregate engagement stats
    const engagementStats = await Property.aggregate([
      {
        $group: {
          _id: null,
          totalLikes: { $sum: "$likeCount" },
          totalShares: { $sum: "$shareCount" }
        }
      }
    ]);

    const totalLikes = engagementStats.length > 0 ? engagementStats[0].totalLikes : 0;
    const totalShares = engagementStats.length > 0 ? engagementStats[0].totalShares : 0;

    // --- SNAPADDA CONVERGENCE: Market Intelligence ---
    
    // 1. Search Location Heatmap (Based on User Activity Logs)
    const searchHeatmap = await User.aggregate([
      { $unwind: "$activityLog" },
      { $match: { "activityLog.type": "SEARCH" } },
      { $group: { _id: "$activityLog.payload.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 2. User Intent Stream (Last 10 Actions across Platform)
    const recentActivity = await User.aggregate([
      { $unwind: "$activityLog" },
      { $sort: { "activityLog.timestamp": -1 } },
      { $limit: 10 },
      { $project: { name: 1, email: 1, action: "$activityLog" } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        propertyCount,
        leadCount,
        inquiryCount,
        verifiedCount,
        activeCount,
        pendingInquiries,
        pendingSubmissions,
        totalLikes,
        totalShares,
        recentProperties,
        recentInquiries,
        recentLeads,
        marketIntelligence: {
          heatmap: searchHeatmap,
          activityStream: recentActivity
        }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
