import express from 'express';
import { getPromotions, createPromotion, updatePromotion, deletePromotion, reorderPromotions } from '../controllers/promotionController.js';

const router = express.Router();

router.get('/', getPromotions);
router.post('/', createPromotion);
router.put('/reorder', reorderPromotions);   // must be before /:id
router.put('/:id', updatePromotion);
router.delete('/:id', deletePromotion);

export default router;
