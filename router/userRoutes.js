import express from 'express';
import {
  forgotPassword,
  getCompleteData,
  getUser,
  getUserForPortfolio,
  login,
  logout,
  register,
  resetPassword,
  updatePassword,
  updateProfile,
} from '../controller/userController.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', isAuthenticated, logout);
router.get('/me', isAuthenticated, getUser);
router.patch('/update/me', isAuthenticated, updateProfile);
router.patch('/update/password', isAuthenticated, updatePassword);
// router.get('/kamran', getUserForPortfolio);
router.post('/password/forgot', forgotPassword);
router.post('/password/reset/:token', resetPassword);
router.get('/complete', getCompleteData);

export default router;
