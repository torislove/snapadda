import express from 'express';
import { adminLogin, updateAdminProfile, changeAdminPassword } from '../controllers/adminController.js';

const router = express.Router();

router.post('/login', adminLogin);
router.put('/profile', updateAdminProfile);
router.put('/change-password', changeAdminPassword);

export default router;
