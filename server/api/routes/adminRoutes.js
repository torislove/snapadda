import express from 'express';
import { adminLogin, adminGoogleAuth, updateAdminProfile, changeAdminPassword } from '../controllers/adminController.js';

const router = express.Router();

router.post('/login', adminLogin);
router.post('/auth/google', adminGoogleAuth);
router.put('/profile', updateAdminProfile);
router.put('/change-password', changeAdminPassword);

export default router;
