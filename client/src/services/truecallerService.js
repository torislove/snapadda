/**
 * Truecaller Service
 * Handles Truecaller 1-tap verification for mobile web
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Generates a random nonce for security
 */
export const generateNonce = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Triggers the Truecaller deep link
 */
export const triggerTruecaller = (nonce, partnerKey, partnerName) => {
  const deepLink = `truesdk://?requestNonce=${nonce}&appKey=${partnerKey}&partnerName=${partnerName}&lang=en&skipOption=true`;
  window.location.href = deepLink;
};

/**
 * Polls the backend for Truecaller verification status
 */
export const pollTruecallerStatus = async (requestId, onUpdate, maxAttempts = 30) => {
  let attempts = 0;
  
  const checkStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/truecaller/status/${requestId}`);
      if (!response.ok) throw new Error('Status check failed');
      
      const data = await response.json();
      
      if (data.status === 'success' || data.status === 'failed') {
        onUpdate(data);
        return true; // Stop polling
      }
      
      attempts++;
      if (attempts >= maxAttempts) {
        onUpdate({ status: 'timeout' });
        return true; // Stop polling
      }
      
      return false; // Continue polling
    } catch (error) {
      console.error('Polling error:', error);
      return false;
    }
  };

  const interval = setInterval(async () => {
    const shouldStop = await checkStatus();
    if (shouldStop) clearInterval(interval);
  }, 2000);

  return () => clearInterval(interval);
};

/**
 * Finalizes authentication with Truecaller profile
 */
export const authenticateWithTruecaller = async (requestId) => {
  const response = await fetch(`${API_BASE}/users/truecaller/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId })
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Authentication failed');
  }
  
  return await response.json();
};

export const sendTruecallerOtp = async (phone) => {
  const response = await fetch(`${API_BASE}/users/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  return await response.json();
};

export const verifyTruecallerOtp = async (phoneNumber, otpCode, verificationId) => {
  const response = await fetch(`${API_BASE}/users/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, otpCode, verificationId })
  });
  return await response.json();
};
