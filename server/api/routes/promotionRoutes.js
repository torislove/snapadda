import express from 'express';
import { 
  getAllPromotions, createPromotion, updatePromotion, deletePromotion, 
  reorderPromotions, trackPromotionView, trackPromotionClick 
} from '../controllers/promotionController.js';

const router = express.Router();

router.get('/', getAllPromotions);
router.post('/', createPromotion);
router.post('/:id/view', trackPromotionView);
router.post('/:id/click', trackPromotionClick);
router.put('/reorder', reorderPromotions);
router.put('/:id', updatePromotion);
router.delete('/:id', deletePromotion);

export default router;
