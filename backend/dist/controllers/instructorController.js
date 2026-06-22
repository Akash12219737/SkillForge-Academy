"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstructorAnalytics = exports.publishCourse = exports.createLesson = exports.createSection = exports.createCourse = exports.getInstructorCourses = void 0;
const db_1 = __importDefault(require("../config/db"));
// 1. Get Instructor Owned Courses
const getInstructorCourses = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const courses = await db_1.default.course.findMany({
            where: { instructorId: req.user.id },
            include: {
                category: { select: { name: true } },
                _count: { select: { enrollments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json(courses);
    }
    catch (error) {
        console.error('Fetch instructor courses error:', error);
        return res.status(500).json({ message: 'Error retrieving instructor courses' });
    }
};
exports.getInstructorCourses = getInstructorCourses;
// 2. Create Course
const createCourse = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { title, subtitle, description, requirements, level, price, imageUrl, categoryId } = req.body;
        if (!title || !description || !categoryId || price === undefined) {
            return res.status(400).json({ message: 'Title, description, category, and price are required' });
        }
        const course = await db_1.default.course.create({
            data: {
                title,
                subtitle: subtitle || '',
                description,
                requirements: requirements || [],
                level: level || 'BEGINNER',
                price: parseFloat(price),
                imageUrl: imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
                categoryId,
                instructorId: req.user.id,
                published: false,
            },
        });
        return res.status(201).json(course);
    }
    catch (error) {
        console.error('Create course error:', error);
        return res.status(500).json({ message: 'Error creating course' });
    }
};
exports.createCourse = createCourse;
// 3. Create Section
const createSection = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { courseId } = req.params;
        const { title, sortOrder } = req.body;
        if (!title)
            return res.status(400).json({ message: 'Section title is required' });
        // Validate course ownership
        const course = await db_1.default.course.findFirst({
            where: { id: courseId, instructorId: req.user.id },
        });
        if (!course) {
            return res.status(403).json({ message: 'Access denied: not the course instructor' });
        }
        const order = sortOrder !== undefined ? parseInt(sortOrder, 10) : 1;
        const section = await db_1.default.section.create({
            data: {
                title,
                sortOrder: order,
                courseId,
            },
        });
        return res.status(201).json(section);
    }
    catch (error) {
        console.error('Create section error:', error);
        return res.status(500).json({ message: 'Error creating course section' });
    }
};
exports.createSection = createSection;
// 4. Create Lesson
const createLesson = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { sectionId } = req.params;
        const { title, videoUrl, duration, content, sortOrder, isFreePreview } = req.body;
        if (!title || !videoUrl || duration === undefined) {
            return res.status(400).json({ message: 'Lesson title, videoUrl, and duration are required' });
        }
        // Verify section and course ownership
        const section = await db_1.default.section.findUnique({
            where: { id: sectionId },
            include: { course: true },
        });
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        if (section.course.instructorId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied: not the course instructor' });
        }
        const order = sortOrder !== undefined ? parseInt(sortOrder, 10) : 1;
        const lesson = await db_1.default.lesson.create({
            data: {
                title,
                videoUrl,
                duration: parseInt(duration, 10),
                content: content || '',
                sortOrder: order,
                isFreePreview: isFreePreview === true,
                sectionId,
            },
        });
        return res.status(201).json(lesson);
    }
    catch (error) {
        console.error('Create lesson error:', error);
        return res.status(500).json({ message: 'Error creating lesson' });
    }
};
exports.createLesson = createLesson;
// 5. Toggle Course Publish Status
const publishCourse = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { courseId } = req.params;
        const { published } = req.body;
        const course = await db_1.default.course.findFirst({
            where: { id: courseId, instructorId: req.user.id },
        });
        if (!course) {
            return res.status(403).json({ message: 'Access denied: not the course instructor' });
        }
        const updated = await db_1.default.course.update({
            where: { id: courseId },
            data: { published: published === true },
        });
        return res.json(updated);
    }
    catch (error) {
        console.error('Publish course error:', error);
        return res.status(500).json({ message: 'Error updating course status' });
    }
};
exports.publishCourse = publishCourse;
// 6. Get Instructor Analytics
const getInstructorAnalytics = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const ownedCourses = await db_1.default.course.findMany({
            where: { instructorId: req.user.id },
            select: { id: true, title: true, price: true },
        });
        const ownedCourseIds = ownedCourses.map((c) => c.id);
        // Enrollments
        const enrollmentsCount = await db_1.default.enrollment.count({
            where: { courseId: { in: ownedCourseIds } },
        });
        // Payments
        const payments = await db_1.default.payment.findMany({
            where: {
                courseId: { in: ownedCourseIds },
                status: 'COMPLETED',
            },
            select: { amount: true, createdAt: true },
        });
        const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
        // Compute monthly breakdown (mock + database aggregation)
        const monthlyEarningsMap = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        // Seed with zero for last 6 months
        const currentMonth = new Date().getMonth();
        for (let i = 5; i >= 0; i--) {
            const idx = (currentMonth - i + 12) % 12;
            monthlyEarningsMap[months[idx]] = 0;
        }
        payments.forEach((p) => {
            const month = months[new Date(p.createdAt).getMonth()];
            if (monthlyEarningsMap[month] !== undefined) {
                monthlyEarningsMap[month] += p.amount;
            }
        });
        const chartData = Object.keys(monthlyEarningsMap).map((key) => ({
            month: key,
            revenue: monthlyEarningsMap[key],
            students: Math.round(monthlyEarningsMap[key] / 50), // Mock registration count ratio
        }));
        return res.json({
            summary: {
                totalEnrolled: enrollmentsCount,
                totalEarnings: parseFloat(totalEarnings.toFixed(2)),
                activeCourses: ownedCourses.length,
            },
            chartData,
        });
    }
    catch (error) {
        console.error('Fetch instructor analytics error:', error);
        return res.status(500).json({ message: 'Error loading performance analytics' });
    }
};
exports.getInstructorAnalytics = getInstructorAnalytics;
