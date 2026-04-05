import express from 'express';
import { askOracle } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/ask
router.post('/ask', askOracle);

export default router;
