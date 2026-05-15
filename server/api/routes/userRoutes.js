import express from 'express';
import { googleAuth, updatePreferences, getAllUsers, toggleFavorite, getFavorites, updateLocation } from '../controllers/userController.js';

const router = express.Router();

// Auth routes
router.post('/auth', googleAuth);

// Preference update (Onboarding)
router.post('/:id/preferences', updatePreferences);

// Location tracking
router.put('/:id/location', updateLocation);

// Admin route
router.get('/', getAllUsers);

// Favorites routes
router.post('/:id/favorites/:propertyId', toggleFavorite);
router.get('/:id/favorites', getFavorites);

export default router;
