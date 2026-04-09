const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = RAW_API_URL.replace(/\/+$/, ''); // Ensure no trailing slash

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
      if (filters[k] !== undefined && filters[k] !== null && filters[k] !== 'all' && filters[k] !== '') {
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

export const fetchNearbyProperties = async (lat, lng) => {
  try {
    const res = await safeFetch(`${API_BASE}/properties/nearby?lat=${lat}&lng=${lng}`);
    if (!res.ok) throw new Error('Failed to fetch nearby properties');
    return await res.json();
  } catch (e) {
    console.error('API Error:', e);
    return { status: 'error', data: [], meta: { total: 0 } };
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

// Hardcoded defaults — Admin can override via backend
const SETTING_DEFAULTS = {
  support_info: {
    phone: '+919346793364',
    whatsapp: '919346793364',
    email: 'snapadda@snapadda.com',
  },
  appearance: {
    primaryColor: '#e8b84b',
    secondaryColor: '#10d98c',
    logoUrl: '/logo.png',
  },
  hero_content: {
    title: 'Discover Your Dream Place in Andhra',
    subtitle: 'Browse verified listings across Amaravati, Vijayawada, Guntur & beyond.',
    backgroundImage: '',
  },
  site_stats: [
    { label: 'Verified Listings', value: '1,200+' },
    { label: 'Cities Covered', value: '18+' },
    { label: 'Happy Clients', value: '2,400+' },
    { label: 'Approved Properties', value: 'CRDA/RERA' }
  ],
  marquee_strips: {
    speed1: 30, speed2: 35,
    band1: [
      { id: '1', label: 'Amaravati Region', link: '#cities', icon: 'Landmark' },
      { id: '2', label: 'Verified Listings ✅', link: '#properties', icon: 'ShieldCheck' },
      { id: '3', label: 'Under 50 Lakhs 🔥', link: '#search', icon: 'IndianRupee' },
      { id: '4', label: 'Premium Villas', link: '#search', icon: 'Home' },
    ],
    band2: [
      { id: '5', label: 'Vijayawada Central', link: '#cities', icon: 'MapPin' },
      { id: '6', label: 'CRDA Approved 🏛️', link: '#properties', icon: 'Award' },
      { id: '7', label: 'Invest in Plots ✨', link: '#search', icon: 'Square' },
      { id: '8', label: '24/7 Expert Support', link: '#contact', icon: 'Phone' },
    ]
  },
  onboarding_questions: [
    { id: 'propertyType', key: 'propertyType', title: 'I am looking for', type: 'options', options: ['Apartment', 'Villa', 'Agriculture Land', 'Commercial', 'Plot'], enabled: true },
    { id: 'budget', key: 'budget', title: 'My budget is', type: 'options', options: ['Under 50 Lakhs', '50L - 1 Crore', '1Cr - 5 Crore', '5 Crore+'], enabled: true },
    { id: 'purpose', key: 'purpose', title: 'Preferred purpose', type: 'options', options: ['Personal Use', 'Investment', 'Agriculture'], enabled: true },
    { id: 'additionalNotes', key: 'additionalNotes', title: 'Additional details', type: 'text', options: [], enabled: true }
  ],
};

export const fetchSetting = async (key) => {
  try {
    const res = await fetch(`${API_BASE}/settings/${key}`);
    const isArrayType = key === 'onboarding_questions' || key === 'site_stats';
    const defaultVal = SETTING_DEFAULTS[key] || (isArrayType ? [] : {});

    if (!res.ok) return defaultVal;
    
    const json = await res.json();
    const data = json.data;

    // Handle Object merge
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return { ...defaultVal, ...data };
    }

    return data || defaultVal;
  } catch (e) {
    console.warn(`[fetchSetting] Using default for '${key}':`, e.message);
    const isArrayType = key === 'onboarding_questions' || key === 'site_stats';
    return SETTING_DEFAULTS[key] || (isArrayType ? [] : {});
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

/**
 * Property Q&A Interaction
 */
export const askQuestion = async (payload) => {
  try {
    const res = await fetch(`${API_BASE}/questions/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit question');
    return await res.json();
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
};

export const fetchPropertyFAQs = async (propertyId) => {
  try {
    const res = await fetch(`${API_BASE}/questions/faqs/${propertyId}`);
    if (!res.ok) throw new Error('Failed to fetch FAQs');
    return (await res.json()).data || [];
  } catch (e) {
    console.error('API Error:', e);
    return [];
  }
};

export const fetchUserQuestions = async (userId) => {
  try {
    const token = JSON.parse(localStorage.getItem('snapadda_user'))?.token || 'mock_token';
    const res = await fetch(`${API_BASE}/questions/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch user questions');
    return (await res.json()).data || [];
  } catch (e) {
    console.error('API Error:', e);
    return [];
  }
};
