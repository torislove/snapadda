import express from 'express';
import { 
  askQuestion, 
  getAllQuestions, 
  getPropertyFAQs, 
  getUserQuestions,
  updateQuestion, 
  deleteQuestion 
} from '../controllers/questionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/ask', askQuestion);
router.get('/faqs/:propertyId', getPropertyFAQs);
router.get('/user/:userId', protect, getUserQuestions);

// Admin routes
router.get('/', protect, admin, getAllQuestions);
router.put('/:id', protect, admin, updateQuestion);
router.delete('/:id', protect, admin, deleteQuestion);

export default router;
