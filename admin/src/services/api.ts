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

export const createProperty = async (propertyData: any) => {
  try {
    const response = await fetch(`${API_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData)
    });
    if (!response.ok) throw new Error('Failed to create property');
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const fetchCities = async () => {
  try {
    const response = await fetch(`${API_URL}/cities`);
    if (!response.ok) throw new Error('Failed to fetch cities');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const deleteProperty = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/properties/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete property');
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const updateProperty = async (id: string, data: any) => {
  try {
    const response = await fetch(`${API_URL}/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update property');
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
