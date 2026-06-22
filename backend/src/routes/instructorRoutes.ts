import { Router } from 'express';
import {
  getInstructorCourses,
  createCourse,
  createSection,
  createLesson,
  publishCourse,
  getInstructorAnalytics,
} from '../controllers/instructorController';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Apply authentication and restrict to Instructors
router.use(authenticate);
router.use(authorize([Role.INSTRUCTOR]));

router.get('/courses', getInstructorCourses);
router.post('/courses', createCourse);
router.post('/courses/:courseId/sections', createSection);
router.post('/sections/:sectionId/lessons', createLesson);
router.post('/courses/:courseId/publish', publishCourse);
router.get('/analytics', getInstructorAnalytics);

export default router;
