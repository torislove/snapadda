const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem('snapadda_admin_token');
  const headers: any = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
};

/* ─────────────── Properties ─────────────── */
export const fetchProperties = async () => {
  const res = await fetch(`${API_URL}/properties`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch properties');
  return res.json();
};

export const createProperty = async (data: any) => {
  const res = await fetch(`${API_URL}/properties`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create property');
  return res.json();
};

export const updateProperty = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/properties/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update property');
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

/* ─────────────── Media ─────────────── */
export const uploadMedia = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));
  const res = await fetch(`${API_URL}/media/upload`, { method: 'POST', headers: getAuthHeaders(true), body: formData });
  if (!res.ok) throw new Error('Failed to upload media');
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

export const fetchWhatsappSettings = () => fetchSetting('whatsapp');
export const saveWhatsappSettings = (number: string, message: string) =>
  saveSetting('whatsapp', { number, message });
