const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchProperties = async (params: any = {}) => {
  try {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== 'all') {
        query.set(key, params[key]);
      }
    });

    const response = await fetch(`${API_URL}/properties?${query.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch properties');
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const fetchPropertyById = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/properties/${id}`);
    if (!response.ok) throw new Error('Failed to fetch property details');
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const submitLead = async (leadData: any) => {
  try {
    const response = await fetch(`${API_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    if (!response.ok) throw new Error('Failed to submit lead');
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const fetchPromotions = async () => {
  try {
    const response = await fetch(`${API_URL}/promotions`);
    if (!response.ok) throw new Error('Failed to fetch promotions');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const fetchSetting = async (key: string) => {
  try {
    const response = await fetch(`${API_URL}/settings/${key}`);
    if (!response.ok) throw new Error(`Failed to fetch setting: ${key}`);
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const fetchTestimonials = async () => {
  try {
    const response = await fetch(`${API_URL}/testimonials`);
    if (!response.ok) throw new Error('Failed to fetch testimonials');
    const data = await response.json();
    return data.data || (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

export const fetchCities = async () => {
  try {
    const response = await fetch(`${API_URL}/cities`);
    if (!response.ok) throw new Error('Failed to fetch cities');
    const data = await response.json();
    return data.data || (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

export const fetchWhatsappSettings = async () => {
  try {
    const response = await fetch(`${API_URL}/settings/whatsapp`);
    if (!response.ok) throw new Error('Failed to fetch WhatsApp settings');
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};

export const likeProperty = async (id: string, userId?: string) => {
  try {
    const response = await fetch(`${API_URL}/properties/${id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!response.ok) throw new Error('Failed to like property');
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const shareProperty = async (id: string, platform: string, userId?: string) => {
  try {
    const response = await fetch(`${API_URL}/properties/${id}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, userId })
    });
    if (!response.ok) throw new Error('Failed to log share');
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const validateProperties = async (ids: string[]) => {
  try {
    const response = await fetch(`${API_URL}/properties/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    if (!response.ok) throw new Error('Failed to validate properties');
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Admin Engagement Stats
export const fetchEngagementStats = async () => {
  try {
    const response = await fetch(`${API_URL}/properties/engagement`);
    if (!response.ok) throw new Error('Failed to fetch engagement stats');
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
