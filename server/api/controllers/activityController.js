import Lead from '../models/Lead.js';
import User from '../models/User.js';

/**
 * Log a user activity event (Search, View, Filter)
 * If a matching Lead exists by phone/email, it attaches the intent to it.
 */
export const logActivity = async (req, res) => {
  try {
    const { type, payload, userId, context } = req.body;
    const timestamp = new Date();

    const activityEvent = {
      type, // 'SEARCH', 'PROPERTY_VIEW', 'FILTER_CHANGE'
      payload, 
      context, // e.g., current URL or page
      timestamp
    };

    // 1. If user is logged in, push to User model (if we decide to store it there)
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: { 'activityLog': activityEvent }
      });
    }

    // 2. Predictive Lead Connection: 
    // If this search leads to an inquiry later, we'll have a session-based intent map.
    // For now, we return success. In a more advanced version, we'd use session IDs 
    // to link guest activity to future lead submissions.
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Activity Logging Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Get Intent Profile for a specific Lead (Admin only)
 */
export const getLeadIntent = async (req, res) => {
  try {
    const { phone } = req.params;
    // Find the user or lead by phone and return their activity history
    const user = await User.findOne({ phone }).select('activityLog');
    res.json({ status: 'success', data: user?.activityLog || [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
