import express from 'express';
import { logActivity, getLeadIntent } from '../controllers/activityController.js';

const router = express.Router();

/**
 * @route POST /api/activity/log
 * @desc Log user action (Guest or Logged-in)
 */
router.post('/log', logActivity);

/**
 * @route GET /api/activity/lead/:phone
 * @desc Get session intent for a lead (Admin only)
 */
router.get('/lead/:phone', getLeadIntent);

export default router;
