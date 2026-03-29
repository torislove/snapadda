const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchProperties = async () => {
  try {
    const response = await fetch(`${API_URL}/properties`);
    if (!response.ok) throw new Error('Failed to fetch properties');
    const data = await response.json();
    return data;
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
