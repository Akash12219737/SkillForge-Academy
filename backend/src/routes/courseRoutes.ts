import { Router } from 'express';
import { getCategories, getCourses, getCourseById } from '../controllers/courseController';

const router = Router();

router.get('/categories', getCategories);
router.get('/', getCourses);
router.get('/:id', getCourseById);

export default router;
