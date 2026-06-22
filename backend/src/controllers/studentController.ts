import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';
import * as fs from 'fs';
import * as path from 'path';

// Mock file path for persistent lesson notes
const NOTES_FILE_PATH = path.join(__dirname, '..', 'utils', 'notes_store.json');

const ensureNotesStoreExists = () => {
  const dir = path.dirname(NOTES_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(NOTES_FILE_PATH)) {
    fs.writeFileSync(NOTES_FILE_PATH, JSON.stringify({}));
  }
};

const getNotes = () => {
  ensureNotesStoreExists();
  try {
    const data = fs.readFileSync(NOTES_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
};

const saveNoteToDisk = (userId: string, lessonId: string, content: string) => {
  ensureNotesStoreExists();
  const notes = getNotes();
  const key = `${userId}:${lessonId}`;
  notes[key] = { content, updatedAt: new Date().toISOString() };
  fs.writeFileSync(NOTES_FILE_PATH, JSON.stringify(notes, null, 2));
};

const retrieveNoteFromDisk = (userId: string, lessonId: string): string => {
  ensureNotesStoreExists();
  const notes = getNotes();
  const key = `${userId}:${lessonId}`;
  return notes[key]?.content || '';
};

// 1. Enroll / Purchase Course
export const enrollCourse = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { sections: { include: { lessons: true } } },
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId } },
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    // Create payment ledger record
    const transactionId = 'TXN-' + Math.floor(Math.random() * 1000000000);
    await prisma.payment.create({
      data: {
        amount: course.price,
        transactionId,
        status: 'COMPLETED',
        userId: req.user.id,
        courseId,
      },
    });

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: req.user.id,
        courseId,
        progress: 0,
      },
    });

    return res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment,
    });
  } catch (error: any) {
    console.error('Enroll course error:', error);
    return res.status(500).json({ message: 'Internal server error during enrollment' });
  }
};

// 2. Get Enrolled Courses
export const getEnrolledCourses = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.id },
      include: {
        course: {
          include: {
            category: { select: { name: true } },
            instructor: { select: { name: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return res.json(enrollments);
  } catch (error: any) {
    console.error('Fetch enrolled courses error:', error);
    return res.status(500).json({ message: 'Error retrieving enrolled courses' });
  }
};

// 3. Get Enrolled Course Video/Playlists (Full Content)
export const getEnrolledCourseContent = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { courseId } = req.params;

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId } },
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Access denied: not enrolled in this course' });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: true,
        instructor: { select: { name: true, avatarUrl: true } },
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get completed lessons list for this enrollment
    const completedProgresses = await prisma.lessonProgress.findMany({
      where: {
        enrollmentId: enrollment.id,
        completed: true,
      },
      select: { lessonId: true },
    });

    const completedLessonIds = completedProgresses.map((p) => p.lessonId);

    return res.json({
      course,
      completedLessonIds,
      progress: enrollment.progress,
    });
  } catch (error) {
    console.error('Fetch course content error:', error);
    return res.status(500).json({ message: 'Error retrieving course learning workspace' });
  }
};

// 4. Update Lesson Progress
export const updateLessonProgress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { lessonId } = req.params;
    const { completed } = req.body; // boolean

    // Find lesson and course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { include: { course: true } } },
    });

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const courseId = lesson.section.courseId;

    // Get enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId } },
      include: { lessonProgresses: true },
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Upsert lesson progress
    await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      update: {
        completed: completed === true,
        completedAt: completed === true ? new Date() : null,
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        completed: completed === true,
        completedAt: completed === true ? new Date() : null,
      },
    });

    // Recompute total progress
    const allCourseLessons = await prisma.lesson.findMany({
      where: { section: { courseId } },
      select: { id: true },
    });

    const completedCount = await prisma.lessonProgress.count({
      where: {
        enrollmentId: enrollment.id,
        completed: true,
      },
    });

    const totalLessons = allCourseLessons.length;
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { progress: progressPercent },
    });

    return res.json({
      message: 'Lesson progress updated',
      progressPercent,
      completed,
      completedCount,
      totalLessons,
    });
  } catch (error) {
    console.error('Update lesson progress error:', error);
    return res.status(500).json({ message: 'Error updating learning progress' });
  }
};

// 5. Toggle Wishlist
export const toggleWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { courseId } = req.params;

    const existing = await prisma.wishlist.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId } },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return res.json({ inWishlist: false, message: 'Removed from wishlist' });
    } else {
      await prisma.wishlist.create({
        data: { userId: req.user.id, courseId },
      });
      return res.json({ inWishlist: true, message: 'Added to wishlist' });
    }
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    return res.status(500).json({ message: 'Error updating wishlist' });
  }
};

// 6. Get Wishlist
export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        course: {
          include: {
            category: { select: { name: true } },
            instructor: { select: { name: true, avatarUrl: true } },
          },
        },
      },
    });

    return res.json(wishlist);
  } catch (error) {
    console.error('Fetch wishlist error:', error);
    return res.status(500).json({ message: 'Error retrieving wishlist items' });
  }
};

// 7. Post Course Review
export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5 || !comment) {
      return res.status(400).json({ message: 'Rating (1-5) and comment are required' });
    }

    // Verify enrollment before allowing reviews
    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId } },
    });

    if (!enrolled) {
      return res.status(403).json({ message: 'You must be enrolled to review this course' });
    }

    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating, 10),
        comment,
        userId: req.user.id,
        courseId,
      },
    });

    // Update dynamic average rating for course
    const allReviews = await prisma.review.findMany({
      where: { courseId },
      select: { rating: true },
    });

    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.course.update({
      where: { id: courseId },
      data: { rating: parseFloat(averageRating.toFixed(1)) },
    });

    return res.status(201).json({
      message: 'Review posted successfully',
      review,
      newAverageRating: averageRating,
    });
  } catch (error) {
    console.error('Post review error:', error);
    return res.status(500).json({ message: 'Error posting review' });
  }
};

// 8. Certificates claim
export const claimCertificate = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { courseId } = req.params;

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId } },
    });

    if (!enrollment || enrollment.progress < 100) {
      return res.status(400).json({ message: 'Course must be 100% completed to claim a certificate' });
    }

    // Check if certificate already exists
    const existing = await prisma.certificate.findFirst({
      where: { userId: req.user.id, courseId },
    });

    if (existing) {
      return res.json(existing);
    }

    const certificateUrl = `https://cloudforge-certificates.s3.amazonaws.com/cert-${req.user.id}-${courseId}.pdf`;

    const certificate = await prisma.certificate.create({
      data: {
        userId: req.user.id,
        courseId,
        certificateUrl,
      },
    });

    return res.status(201).json(certificate);
  } catch (error) {
    console.error('Claim certificate error:', error);
    return res.status(500).json({ message: 'Error generating certificate' });
  }
};

// 9. Get Student Certificates
export const getCertificates = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const certificates = await prisma.certificate.findMany({
      where: { userId: req.user.id },
      include: {
        course: {
          select: { title: true, level: true, instructor: { select: { name: true } } },
        },
      },
    });

    return res.json(certificates);
  } catch (error) {
    console.error('Get certificates error:', error);
    return res.status(500).json({ message: 'Error loading certificates' });
  }
};

// 10. Notes handling
export const saveNote = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { lessonId } = req.params;
    const { content } = req.body;

    saveNoteToDisk(req.user.id, lessonId, content);

    return res.json({ message: 'Notes saved successfully', content });
  } catch (error) {
    console.error('Save notes error:', error);
    return res.status(500).json({ message: 'Error saving student notes' });
  }
};

export const getNote = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { lessonId } = req.params;

    const content = retrieveNoteFromDisk(req.user.id, lessonId);

    return res.json({ content });
  } catch (error) {
    console.error('Get notes error:', error);
    return res.status(500).json({ message: 'Error retrieving student notes' });
  }
};
