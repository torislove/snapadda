import express from 'express';
import { googleAuth, updatePreferences, getAllUsers, toggleFavorite, getFavorites } from '../controllers/userController.js';

const router = express.Router();

// Auth route
router.post('/auth', googleAuth);

// Preference update (Onboarding)
router.post('/:id/preferences', updatePreferences);

// Admin route
router.get('/', getAllUsers);

// Favorites routes
router.post('/:id/favorites/:propertyId', toggleFavorite);
router.get('/:id/favorites', getFavorites);

export default router;
