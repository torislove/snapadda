import express from 'express';
import { getAllPromotions, createPromotion, updatePromotion, deletePromotion, reorderPromotions } from '../controllers/promotionController.js';

const router = express.Router();

router.get('/', getAllPromotions);
router.post('/', createPromotion);
router.put('/reorder', reorderPromotions);   // must be before /:id
router.put('/:id', updatePromotion);
router.delete('/:id', deletePromotion);

export default router;
