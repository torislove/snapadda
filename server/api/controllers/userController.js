import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import axios from 'axios';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// Usually stored in env, falling back to a dummy one if empty to prevent crashes in dev
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '1234567890-mockclientid.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
  try {
    const { token, phone, whatsapp } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Missing token' });
    }

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;
    const cleanPhone = phone ? phone.replace('+', '').trim() : '';

    // Find User by email OR phone to enable cross-provider merging
    let user = await User.findOne({ 
      $or: [
        { email },
        ...(cleanPhone ? [{ phone: cleanPhone }] : [])
      ]
    });

    if (!user) {
      user = new User({
        googleId, email, name, avatar: picture,
        role: 'client',
        phone: cleanPhone,
        whatsapp: whatsapp ? whatsapp.replace('+', '').trim() : cleanPhone,
        onboardingCompleted: true,
      });
    } else {
      // Intelligently Merge Data
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar) user.avatar = picture;
      if (!user.email) user.email = email;
      
      // Update phone only if not already set
      if (cleanPhone && !user.phone) {
        user.phone = cleanPhone;
        user.whatsapp = whatsapp ? whatsapp.replace('+', '').trim() : cleanPhone;
      }
      
      user.onboardingCompleted = true;
    }

    user.lastActive = new Date();
    await user.save();
    res.status(200).json({ status: 'success', user });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- Truecaller & Identity Integration ---

export const updatePreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const incomingData = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Direct contact fields
    if (incomingData.phone) user.phone = incomingData.phone;
    if (incomingData.whatsapp) user.whatsapp = incomingData.whatsapp;

    // Standard preference fields
    const standardKeys = ['propertyType', 'budget', 'locations', 'purpose', 'additionalNotes'];
    Object.keys(incomingData).forEach(key => {
      if (standardKeys.includes(key)) {
        if (!user.preferences) user.preferences = {};
        user.preferences[key] = incomingData[key];
      } else if (!['phone', 'whatsapp'].includes(key)) {
        if (!user.preferences) user.preferences = {};
        if (!user.preferences.extraAnswers) user.preferences.extraAnswers = new Map();
        user.preferences.extraAnswers.set(key, String(incomingData[key]));
      }
    });

    user.onboardingCompleted = true;
    user.markModified('preferences');
    await user.save();
    res.status(200).json({ status: 'success', user });
  } catch (error) {
    console.error('Update Preferences Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Return all clients (excluding admins optionally)
    const users = await User.find({ role: 'client' }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const { id, propertyId } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.favorites.indexOf(propertyId);
    if (index === -1) {
      user.favorites.push(propertyId);
    } else {
      user.favorites.splice(index, 1);
    }

    await user.save();
    res.status(200).json({ status: 'success', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate('favorites');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ status: 'success', data: user.favorites });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;
    
    await User.findByIdAndUpdate(id, {
      lastLocation: { lat, lng, timestamp: new Date() }
    });
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- Truecaller Implementation ---

// Temporary store for verification results
// In production, use Redis or MongoDB with TTL
const truecallerResults = new Map();

/**
 * Webhook called by Truecaller after user gives consent
 */
export const truecallerCallback = async (req, res) => {
  try {
    const { requestId, accessToken, endpoint } = req.body;
    
    if (!accessToken || !endpoint) {
      return res.status(400).json({ status: 'error', message: 'Missing parameters' });
    }

    // Fetch profile from Truecaller
    // Fetch the actual user profile using the dynamic URL Truecaller provided
    const profileResponse = await axios.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Cache-Control': 'no-cache'
      }
    });

    const userData = profileResponse.data;
    console.log("Verified Truecaller User:", userData);

    // 2. SUCCESS: Store result for polling
    truecallerResults.set(requestId, { 
      status: 'success', 
      profile: userData,
      timestamp: Date.now()
    });

    res.json({ success: true, user: userData });
  } catch (error) {
    console.error('Truecaller Callback Error:', error.response?.data || error.message);
    res.status(500).json({ status: 'error' });
  }
};

/**
 * Polling endpoint for frontend to check verification status
 */
export const getTruecallerStatus = async (req, res) => {
  const { requestId } = req.params;
  const result = truecallerResults.get(requestId);
  
  if (!result) {
    return res.status(200).json({ status: 'pending' });
  }

  // Once fetched, we can return it.
  res.status(200).json(result);
};

const mapTruecallerError = (errorData) => {
  const code = errorData.internalCode || errorData.code;
  const message = errorData.message || "";
  
  if (message.includes("limit reached")) return "Verification limit reached for this number. Please try again after 24 hours.";
  if (message.includes("permissions are missing")) return "System permission error. Please use Google Login or try later.";
  if (message.includes("invalid phoneNumber")) return "The phone number format is invalid. Please check and retry.";
  if (code === 429) return "Too many requests. Please wait a moment before trying again.";
  
  return message || "Identity verification rejected by Truecaller engine.";
};

/**
 * Triggers Truecaller SMS/Call Verification
 * Uses provided logic with Authorization: Bearer {APP_KEY}
 */
export const truecallerSendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number is required" });

    const cleanPhone = phone.replace(/\D/g, '');
    const TC_API_BASE = 'https://api4.truecaller.com/v1/verification';

    console.log(`[Truecaller] Sending OTP to: ${cleanPhone}`);

    const tcResponse = await axios.post(`${TC_API_BASE}/send`, {
      phoneNumber: cleanPhone,
      countryCode: "IN",
      method: "sms"
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.TRUECALLER_PARTNER_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ 
      success: true, 
      message: "OTP Sent via Truecaller",
      verificationId: tcResponse.data.verificationId 
    });

  } catch (error) {
    const status = error.response?.status || 500;
    const errorData = error.response?.data || { message: error.message };
    const friendlyError = mapTruecallerError(errorData);
    
    console.error(`[Truecaller Send OTP Error - Status ${status}]:`, JSON.stringify(errorData));
    
    res.status(status).json({ 
      success: false, 
      error: friendlyError, 
      details: errorData 
    });
  }
};

/**
 * Verifies the OTP entered by the user
 */
export const truecallerVerifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otpCode, verificationId } = req.body;
    const TC_API_BASE = 'https://api4.truecaller.com/v1/verification';

    console.log(`[Truecaller] Verifying OTP for: ${phoneNumber}`);

    const tcVerifyResponse = await axios.post(`${TC_API_BASE}/verify`, {
      phoneNumber: phoneNumber.replace(/\D/g, ''),
      verificationId: verificationId,
      code: otpCode
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.TRUECALLER_PARTNER_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = tcVerifyResponse.data;

    if (tcVerifyResponse.status === 200 && data.status === "verified") {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      let user = await User.findOne({ phone: cleanPhone });
      
      if (!user) {
        user = new User({
          phone: cleanPhone,
          role: 'client',
          onboardingCompleted: false,
          name: `User ${cleanPhone.slice(-4)}`
        });
        await user.save();
      }

      res.json({
        status: 'success',
        user,
        token: "truecaller_verified_session"
      });
    } else {
      res.status(401).json({ 
        success: false, 
        error: "Invalid OTP code. Please check and retry.",
        details: data
      });
    }
  } catch (error) {
    const status = error.response?.status || 500;
    const errorData = error.response?.data || { message: error.message };
    const friendlyError = mapTruecallerError(errorData);
    
    console.error(`[Truecaller Verify Error - Status ${status}]:`, JSON.stringify(errorData));
    
    res.status(status).json({ 
      success: false, 
      error: friendlyError,
      details: errorData
    });
  }
};

/**
 * Finalizes login using Truecaller profile
 */
export const truecallerManualVerify = async (req, res) => {
  try {
    const { phone } = req.body;
    const cleanPhone = phone.replace(/\D/g, '');
    
    console.log(`[Truecaller] Initiating manual verification for: ${cleanPhone}`);
    
    // In a production environment with a Truecaller Business account, 
    // you would call their Verification API here:
    // POST https://api4.truecaller.com/v1/otp/send
    
    // For this implementation, we simulate the initiation and return a requestId
    const requestId = `manual_${Date.now()}_${cleanPhone}`;
    
    // Store in the results map as 'pending'
    truecallerResults.set(requestId, { status: 'pending', phone: cleanPhone });
    
    res.status(200).json({ status: 'success', requestId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to initiate verification' });
  }
};

export const truecallerAuth = async (req, res) => {
  try {
    const { requestId } = req.body;
    const result = truecallerResults.get(requestId);

    if (!result || result.status !== 'success') {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired verification' });
    }

    const { profile } = result;
    const phone = profile.phoneNumber || '';
    const email = profile.email || '';
    const name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    const avatar = profile.avatarUrl || '';
    
    // Find or Create User
    // Normalize phone (remove +)
    const cleanPhone = phone.replace('+', '').trim();
    
    // Search by Phone OR Email to merge with existing Google accounts
    let user = await User.findOne({ 
      $or: [
        { phone: cleanPhone },
        ...(email ? [{ email }] : [])
      ]
    });

    if (!user) {
      user = new User({
        name,
        email,
        phone: cleanPhone,
        whatsapp: cleanPhone,
        role: 'client',
        onboardingCompleted: true,
        avatar
      });
    } else {
      // Merge Truecaller profile data into existing record
      if (!user.phone) user.phone = cleanPhone;
      if (!user.whatsapp) user.whatsapp = cleanPhone;
      if (!user.name) user.name = name;
      if (!user.email && email) user.email = email;
      if (!user.avatar && avatar) user.avatar = avatar;
      user.onboardingCompleted = true;
    }

    user.lastActive = new Date();
    await user.save();

    // Clean up result after use
    truecallerResults.delete(requestId);

    res.status(200).json({ status: 'success', user });
  } catch (error) {
    console.error('Truecaller Auth Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
