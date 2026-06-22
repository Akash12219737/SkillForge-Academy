import { Router } from 'express';
import {
  getUsers,
  updateUserRole,
  getAdminCourses,
  deleteCourse,
  getPaymentsAndAnalytics,
  createCategory,
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Apply auth and restrict to Admins
router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get('/users', getUsers);
router.patch('/users/:userId/role', updateUserRole);
router.get('/courses', getAdminCourses);
router.delete('/courses/:courseId', deleteCourse);
router.get('/analytics', getPaymentsAndAnalytics);
router.post('/categories', createCategory);

export default router;
