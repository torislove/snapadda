import express from 'express';
import { 
  loginFranchise, 
  getFranchiseAdmins, 
  createFranchiseAdmin, 
  updateFranchiseAdmin, 
  deleteFranchiseAdmin 
} from './franchiseController.js';

const router = express.Router();

router.post('/login', loginFranchise);
router.get('/admins', getFranchiseAdmins);
router.post('/admins', createFranchiseAdmin);
router.put('/admins/:id', updateFranchiseAdmin);
router.delete('/admins/:id', deleteFranchiseAdmin);

export default router;
