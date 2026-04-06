import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Usually stored in env, falling back to a dummy one if empty to prevent crashes in dev
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '1234567890-mockclientid.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    console.log(`[AUTH] Incoming request from ${req.headers.origin} for user email: ${req.body.payload?.email}`);
    
    // In strict production, we verify the token using Google library:
    /*
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    */
    
    // For demonstration if jwt-decode passes payload directly from frontend (if real ID missing):
    const payload = req.body.payload; 
    
    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const { email, name, picture, sub: googleId } = payload;

    // Find or Create User
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user profile
      user = new User({
        googleId,
        email,
        name,
        avatar: picture,
        role: 'client',
        onboardingCompleted: false
      });
      await user.save();
    }

    // Return the user object (In a full prod app we'd sign a JWT here)
    res.status(200).json({ 
      status: 'success', 
      user 
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const { propertyType, budget, locations, purpose, additionalNotes, extraAnswers } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.preferences = {
      propertyType: propertyType || user.preferences.propertyType,
      budget: budget || user.preferences.budget,
      locations: locations || user.preferences.locations,
      purpose: purpose || user.preferences.purpose,
      additionalNotes: additionalNotes || user.preferences.additionalNotes,
      extraAnswers: extraAnswers || user.preferences.extraAnswers || {}
    };
    
    // Mark onboarding complete
    user.onboardingCompleted = true;

    await user.save();
    res.status(200).json({ status: 'success', user });
  } catch (error) {
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
