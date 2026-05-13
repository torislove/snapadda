const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl !== 'undefined') return envUrl;
  // Production fallback: If we are on a .web.app or .firebaseapp.com domain, default to /api
  if (typeof window !== 'undefined' && (window.location.hostname.includes('web.app') || window.location.hostname.includes('firebaseapp.com') || window.location.hostname.includes('snapadda.com'))) {
    return '/api';
  }
  return '/api';
};

const API_URL = getApiUrl();
console.log(`[Elite-API] Initialized with Base: ${API_URL}`);

const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem('snapadda_admin_token');
  const headers: any = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
};

/* ─────────────── Properties ─────────────── */
export const fetchProperties = async (params?: any) => {
  const queryParams = new URLSearchParams(params || {});
  queryParams.set('_t', Date.now().toString()); // Cache busting
  const query = '?' + queryParams.toString();
  const res = await fetch(`${API_URL}/properties${query}`, { 
    headers: {
      ...getAuthHeaders(),
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    } 
  });
  if (!res.ok) throw new Error('Failed to fetch properties');
  return res.json();
};

export const createProperty = async (data: any) => {
  const res = await fetch(`${API_URL}/properties`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || errData.details || 'Failed to create property');
  }
  return res.json();
};

export const updateProperty = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/properties/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || errData.details || 'Failed to update property');
  }
  return res.json();
};

export const deleteProperty = async (id: string) => {
  const res = await fetch(`${API_URL}/properties/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to delete property');
  return res.json();
};

export const togglePropertyVerification = async (id: string, currentStatus: boolean) =>
  updateProperty(id, { isVerified: !currentStatus });

/* ─────────────── Cities / Districts ─────────────── */
export const fetchCities = async () => {
  const res = await fetch(`${API_URL}/cities`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch cities');
  return res.json();
};

export const createCity = async (data: any) => {
  const res = await fetch(`${API_URL}/districts/cities`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create city');
  return res.json();
};

export const updateCity = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/districts/cities/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update city');
  return res.json();
};

export const deleteCity = async (id: string) => {
  const res = await fetch(`${API_URL}/districts/cities/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to delete city');
  return res.json();
};

import imageCompression from 'browser-image-compression';

export const uploadMedia = async (files: File[]) => {
  const formData = new FormData();
  
  // Compress images before uploading
  const processedFiles = await Promise.all(files.map(async (file) => {
    if (file.type.startsWith('image/')) {
      const options = {
        maxSizeMB: 0.5,         // Max size 500KB
        maxWidthOrHeight: 1280, // Max resolution 720p-ish (High enough for real estate)
        useWebWorker: true,
        initialQuality: 0.7
      };
      try {
        console.log(`Compressing ${file.name}...`);
        return await imageCompression(file, options);
      } catch (err) {
        console.error('Compression failed for:', file.name, err);
        return file; // Fallback to original if compression fails
      }
    }
    return file; // Videos and others stay as is
  }));

  processedFiles.forEach(file => {
    formData.append('files', file);
  });
  
  const res = await fetch(`${API_URL}/media/upload`, { 
    method: 'POST', 
    headers: getAuthHeaders(true),
    body: formData 
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upload media');
  }
  return res.json();
};

/* ─────────────── Promotions ─────────────── */
export const fetchPromotions = async () => {
  const res = await fetch(`${API_URL}/promotions`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch promotions');
  return res.json();
};

// Admin-only: fetch ALL promotions including inactive
export const fetchAllPromotions = async () => {
  const res = await fetch(`${API_URL}/promotions?all=true`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch all promotions');
  return res.json();
};

export const createPromotion = async (data: any) => {
  const res = await fetch(`${API_URL}/promotions`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create promotion');
  return res.json();
};

export const updatePromotion = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/promotions/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update promotion');
  return res.json();
};

export const reorderPromotions = async (orderedIds: string[]) => {
  const res = await fetch(`${API_URL}/promotions/reorder`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ orderedIds }) });
  if (!res.ok) throw new Error('Failed to reorder promotions');
  return res.json();
};

export const deletePromotion = async (id: string) => {
  const res = await fetch(`${API_URL}/promotions/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to delete promotion');
  return res.json();
};

/* ─────────────── Testimonials ─────────────── */
export const fetchTestimonials = async () => {
  const res = await fetch(`${API_URL}/testimonials`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch testimonials');
  return res.json();
};

export const createTestimonial = async (data: any) => {
  const res = await fetch(`${API_URL}/testimonials`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create testimonial');
  return res.json();
};

export const updateTestimonial = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/testimonials/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update testimonial');
  return res.json();
};

export const deleteTestimonial = async (id: string) => {
  const res = await fetch(`${API_URL}/testimonials/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to delete testimonial');
  return res.json();
};

/* ─────────────── Questions / FAQs ─────────────── */
export const fetchQuestions = async (status?: string) => {
  const url = status ? `${API_URL}/questions?status=${status}` : `${API_URL}/questions`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch questions');
  return res.json();
};

export const answerQuestion = async (id: string, answer: string, status: string = 'Answered') => {
  const res = await fetch(`${API_URL}/questions/${id}`, { 
    method: 'PUT', 
    headers: getAuthHeaders(),
    body: JSON.stringify({ answer, status })
  });
  if (!res.ok) throw new Error('Failed to update question');
  return res.json();
};

export const deleteQuestion = async (id: string) => {
  const res = await fetch(`${API_URL}/questions/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to delete question');
  return res.json();
};

/* ─────────────── Admin Profile ─────────────── */
export const updateAdminProfile = async (name: string, avatar: string) => {
  const res = await fetch(`${API_URL}/admin/profile`, {
    method: 'PUT', headers: getAuthHeaders(),
    body: JSON.stringify({ name, avatar }),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
};

export const changeAdminPassword = async (currentPassword: string, newPassword: string) => {
  const res = await fetch(`${API_URL}/admin/change-password`, {
    method: 'PUT', headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to change password');
  }
  return res.json();
};

/* ─────────────── Settings ─────────────── */
export const fetchSetting = async (key: string) => {
  const res = await fetch(`${API_URL}/settings/${key}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch setting: ${key}`);
  return res.json();
};

export const saveSetting = async (key: string, value: any) => {
  const res = await fetch(`${API_URL}/settings/${key}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error(`Failed to save setting: ${key}`);
  return res.json();
};

export const fetchWhatsappSettings = () => fetchSetting('whatsapp_settings');
export const saveWhatsappSettings = (number: string, message: string) =>
  saveSetting('whatsapp_settings', { number, message });

/* ─────────────── CRM Contacts ─────────────── */
export const fetchRealtors = async () => {
  const res = await fetch(`${API_URL}/contacts?type=Realtor&limit=200`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch realtors');
  const data = await res.json();
  return data.data || [];
};

export const fetchContactStats = async () => {
  const res = await fetch(`${API_URL}/contacts/stats`, { headers: getAuthHeaders() });
  if (!res.ok) return { realtors: 0, clients: 0, whatsappSent: 0, newThisWeek: 0 };
  return (await res.json()).data || {};
};

export const updateContact = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/contacts/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update contact');
  return res.json();
};

export const addContactNote = async (id: string, text: string, addedBy = 'Admin') => {
  const res = await fetch(`${API_URL}/contacts/${id}/notes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text, addedBy })
  });
  if (!res.ok) throw new Error('Failed to add note');
  return res.json();
};

export const fetchContactProperties = async (contactId: string) => {
  const res = await fetch(`${API_URL}/properties?realtorContactId=${contactId}&limit=100`, { headers: getAuthHeaders() });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
};

/* ─────────────── Automation / Notifications ─────────────── */
export const sendPushNotification = async (data: { title: string; body: string; imageUrl?: string; link?: string }) => {
  const res = await fetch(`${API_URL}/automation/send-push`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to send push notification');
  return res.json();
};

