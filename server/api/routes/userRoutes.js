import express from 'express';
import { 
  googleAuth, 
  updatePreferences, 
  getAllUsers, 
  toggleFavorite, 
  getFavorites, 
  updateLocation,
  truecallerCallback,
  getTruecallerStatus,
  truecallerAuth,
  truecallerManualVerify,
  truecallerSendOtp,
  truecallerVerifyOtp
} from '../controllers/userController.js';

const router = express.Router();

// Auth routes
router.post('/auth', googleAuth);
router.post('/truecaller/callback', truecallerCallback);
router.get('/truecaller/status/:requestId', getTruecallerStatus);
router.post('/truecaller/auth', truecallerAuth);
router.post('/truecaller/manual-verify', truecallerManualVerify);
router.post('/truecaller/send-otp', truecallerSendOtp);
router.post('/truecaller/verify-otp', truecallerVerifyOtp);

// Standard OTP Aliases for unified frontend access
router.post('/otp/send', truecallerSendOtp);
router.post('/otp/verify', truecallerVerifyOtp);

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
