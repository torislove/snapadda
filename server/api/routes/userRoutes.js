import express from 'express';
import { googleAuth, guestAuth, updatePreferences, getAllUsers, toggleFavorite, getFavorites } from '../controllers/userController.js';

const router = express.Router();

// Auth routes
router.post('/auth', googleAuth);
router.post('/guest', guestAuth);

// Preference update (Onboarding)
router.post('/:id/preferences', updatePreferences);

// Admin route
router.get('/', getAllUsers);

// Favorites routes
router.post('/:id/favorites/:propertyId', toggleFavorite);
router.get('/:id/favorites', getFavorites);

export default router;
