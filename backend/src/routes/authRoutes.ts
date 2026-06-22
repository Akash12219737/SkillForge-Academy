import { Router } from 'express';
import { register, login, googleLogin, forgotPassword, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.get('/profile', authenticate, getProfile);

export default router;
