import express from 'express';
import { getProperties, createProperty, getPropertyById, updateProperty, deleteProperty, getSimilarProperties } from '../controllers/propertyController.js';

const router = express.Router();

router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.get('/:id/similar', getSimilarProperties);
router.post('/', createProperty);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

export default router;
