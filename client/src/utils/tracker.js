import axios from 'axios';

/**
 * Triggers a silent lead submission for micro-interactions.
 * @param {Object} data - The lead data (source, propertyId, message, etc.)
 */
export const triggerMicroLead = async (data) => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    // Get stored user info if available
    const userStr = localStorage.getItem('snapadda_user');
    let user = null;
    try { if (userStr) user = JSON.parse(userStr); } catch (e) {}

    const payload = {
      name: user?.name || 'Anonymous Visitor',
      phone: user?.phone || 'N/A',
      email: user?.email || 'anonymous@snapadda.com',
      source: data.source || 'Micro Interaction',
      message: data.message || `User interacted with: ${data.source}`,
      propertyId: data.propertyId || null,
      priority: 'Low', // Micro-leads are lower priority by default
      metadata: {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...data.metadata
      }
    };

    // Silent POST
    await axios.post(`${API_URL}/leads`, payload);
  } catch (error) {
    // Fail silently to not disrupt UX
    console.warn('Silent tracking failed:', error.message);
  }
};
