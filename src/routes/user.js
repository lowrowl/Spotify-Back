import express from 'express';
import {
  getProfile,
  updateProfile,
  deleteAccount
} from '../controllers/userController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, updateProfile);
router.delete('/profile', authenticateUser, deleteAccount);

export default router;
