const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api';

/**
 * Resilient fetch wrapper with Exponential Backoff
 * Handles flaky 4G/3G connections commonly found in tier-2/3 cities.
 */
const safeFetch = async (url, options = {}, retries = 2, backoff = 300) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok && response.status >= 500 && retries > 0) {
      throw new Error('Server Error, retrying...');
    }
    return response;
  } catch (err) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, backoff));
      return safeFetch(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
};

export const authGoogle = async (payload) => {
  try {
    const res = await fetch(`${API_BASE}/users/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload }),
    });
    if (!res.ok) throw new Error('Google authentication failed');
    return await res.json();
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
};

export const authGuest = async () => {
  try {
    const res = await fetch(`${API_BASE}/users/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Guest authentication failed');
    return await res.json();
  } catch (e) {
    console.warn('Backend unavailable, using mock guest response:', e);
    return {
      status: 'success',
      user: {
        _id: 'guest_' + Date.now(),
        name: 'Guest User',
        email: 'guest@snapadda.local',
        role: 'client',
        onboardingCompleted: true,
        preferences: {}
      }
    };
  }
};

export const getFavorites = async (userId) => {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/favorites`);
    if (!res.ok) throw new Error('Failed to fetch favorites');
    return (await res.json()).data || [];
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
};

export const fetchProperties = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(k => {
      if (filters[k] !== undefined && filters[k] !== null && filters[k] !== 'all') {
        params.set(k, filters[k]);
      }
    });
    const res = await safeFetch(`${API_BASE}/properties?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch properties: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
};

export const fetchProperty = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/properties/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch property: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
};

export const submitLead = async (data) => {
  try {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to submit lead: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
};

export const fetchPromotions = async () => {
  try {
    const res = await fetch(`${API_BASE}/promotions`);
    if (!res.ok) throw new Error('Failed to fetch promotions');
    return (await res.json()).data || [];
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
};

export const fetchSetting = async (key) => {
  // Hardcoded defaults — Admin can override via backend
  const DEFAULTS = {
    support_info: {
      phone: '+919346793364',
      whatsapp: '919346793364',
      email: 'snapadda@snapadda.com',
    },
  };

  try {
    const res = await fetch(`${API_BASE}/settings/${key}`);
    if (!res.ok) throw new Error(`Failed to fetch setting: ${key}`);
    const data = (await res.json()).data || null;
    // Merge backend data over defaults so admin overrides take effect
    return data ? { ...DEFAULTS[key], ...data } : DEFAULTS[key] || null;
  } catch (e) {
    console.warn(`[fetchSetting] Using default for '${key}':`, e.message);
    return DEFAULTS[key] || null;
  }
};

export const fetchTestimonials = async () => {
  try {
    const res = await safeFetch(`${API_BASE}/testimonials`);
    if (!res.ok) throw new Error('Failed to fetch testimonials');
    const data = await res.json();
    return data.data || (Array.isArray(data) ? data : []);
  } catch (e) {
    console.error('API Error:', e);
    return [];
  }
};

export const fetchCities = async () => {
  try {
    const res = await safeFetch(`${API_BASE}/cities`);
    if (!res.ok) throw new Error('Failed to fetch cities');
    const data = await res.json();
    return data.data || (Array.isArray(data) ? data : []);
  } catch (e) {
    console.error('API Error:', e);
    return [];
  }
};

export const likeProperty = async (propertyId, userId) => {
  try {
    const res = await fetch(`${API_BASE}/properties/${propertyId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to like property');
    return await res.json();
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
};

export const updatePreferences = async (userId, data) => {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update preferences');
    return await res.json();
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
};

export const shareProperty = async (propertyId, platform, userId) => {
  try {
    const res = await fetch(`${API_BASE}/properties/${propertyId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, userId }),
    });
    if (!res.ok) throw new Error('Failed to log share');
    return await res.json();
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
};

export const validateProperties = async (ids) => {
  try {
    const res = await fetch(`${API_BASE}/properties/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error('Failed to validate properties');
    return await res.json();
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
};
