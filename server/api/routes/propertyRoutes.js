import express from 'express';
import { 
  getProperties, createProperty, getPropertyById, 
  updateProperty, deleteProperty, getSimilarProperties,
  likeProperty, shareProperty, validateProperties, getEngagementStats
} from '../controllers/propertyController.js';

const router = express.Router();

router.get('/', getProperties);
router.post('/validate', validateProperties);
router.get('/engagement', getEngagementStats);
router.get('/:id', getPropertyById);
router.get('/:id/similar', getSimilarProperties);
router.post('/', createProperty);
router.post('/:id/like', likeProperty);
router.post('/:id/share', shareProperty);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

export default router;
