import { Router } from 'express';
import {
  enrollCourse,
  getEnrolledCourses,
  getEnrolledCourseContent,
  updateLessonProgress,
  toggleWishlist,
  getWishlist,
  addReview,
  claimCertificate,
  getCertificates,
  saveNote,
  getNote,
} from '../controllers/studentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authenticate middleware to all student routes
router.use(authenticate);

router.post('/enroll/:courseId', enrollCourse);
router.get('/courses', getEnrolledCourses);
router.get('/courses/:courseId/content', getEnrolledCourseContent);
router.post('/lessons/:lessonId/progress', updateLessonProgress);

router.get('/wishlist', getWishlist);
router.post('/wishlist/:courseId', toggleWishlist);

router.post('/reviews/:courseId', addReview);

router.get('/certificates', getCertificates);
router.post('/certificates/claim/:courseId', claimCertificate);

router.get('/notes/:lessonId', getNote);
router.post('/notes/:lessonId', saveNote);

export default router;
