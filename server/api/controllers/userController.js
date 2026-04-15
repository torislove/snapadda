import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Usually stored in env, falling back to a dummy one if empty to prevent crashes in dev
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '1234567890-mockclientid.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
  try {
    const { phone, whatsapp } = req.body;
    const payload = req.body.payload;

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const { email, name, picture, sub: googleId } = payload;

    // Find or Create User
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        googleId, email, name, avatar: picture,
        role: 'client',
        // If phone was passed at login time, mark onboarding complete immediately
        phone: phone || '',
        whatsapp: whatsapp || '',
        onboardingCompleted: !!(phone),
      });
    } else {
      // Update contact if provided
      if (phone) {
        user.phone = phone;
        user.whatsapp = whatsapp || phone;
        user.onboardingCompleted = true;
      }
    }

    await user.save();
    res.status(200).json({ status: 'success', user });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

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
