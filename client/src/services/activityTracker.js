import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * SnapAdda Activity Tracker
 * Logs high-intent user actions to build the Buyer Intent Profile.
 */
export const logUserActivity = async (type, payload = {}, userId = null) => {
  try {
    // Non-blocking call
    axios.post(`${API_URL}/activity/log`, {
      type, // SEARCH, PROPERTY_VIEW, FILTER
      payload,
      userId,
      context: window.location.pathname
    }).catch(() => {}); // Fail silently
  } catch (err) {
    // Silently fail to not interrupt user UX
  }
};

/**
 * Standard Action Types
 */
export const ACTIONS = {
  SEARCH: 'SEARCH',
  PROPERTY_VIEW: 'PROPERTY_VIEW',
  FILTER: 'FILTER',
  SHARE: 'SHARE',
  LIKE: 'LIKE'
};
