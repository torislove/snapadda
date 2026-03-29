import express from 'express';
import { getSetting, updateSetting } from '../controllers/settingController.js';

const router = express.Router();

// GET /api/settings/:key
router.get('/:key', getSetting);

// POST /api/settings/:key
router.post('/:key', updateSetting);

export default router;
