import axios from 'axios';

/**
 * Triggers a silent activity event for micro-interactions.
 * Routes to /api/activity (NOT /api/leads) to avoid polluting the leads database.
 * @param {Object} data - Interaction data (source, propertyId, message, metadata)
 */
export const triggerMicroLead = async (data) => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    // Get stored user info if available
    const userStr = localStorage.getItem('snapadda_user');
    let user = null;
    try { if (userStr) user = JSON.parse(userStr); } catch (e) {}

    const payload = {
      type: 'micro-interaction',
      userId: user?._id || user?.id || 'anonymous',
      source: data.source || 'Website',
      message: data.message || 'User interaction tracked',
      propertyId: data.propertyId || null,
      metadata: {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userName: user?.name || 'Anonymous',
        userEmail: user?.email || null,
        ...data.metadata
      }
    };

    // Silent POST to activity endpoint (low-priority, fire-and-forget)
    await axios.post(`${API_URL}/activity/log`, payload);
  } catch (error) {
    // Fail silently — never disrupt user experience
    console.warn('Silent activity tracking failed:', error.message);
  }
};
