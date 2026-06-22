"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseById = exports.getCourses = exports.getCategories = void 0;
const db_1 = __importDefault(require("../config/db"));
// 1. Get Categories
const getCategories = async (req, res) => {
    try {
        const categories = await db_1.default.category.findMany({
            orderBy: { name: 'asc' },
        });
        return res.json(categories);
    }
    catch (error) {
        console.error('Fetch categories error:', error);
        return res.status(500).json({ message: 'Error retrieving course categories' });
    }
};
exports.getCategories = getCategories;
// 2. Search & Filter Courses Catalog
const getCourses = async (req, res) => {
    try {
        const { category, level, rating, search, page = '1', limit = '8' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        // Build Prisma query filters
        const filterConditions = { published: true };
        if (category) {
            filterConditions.category = { slug: category };
        }
        if (level) {
            filterConditions.level = level;
        }
        if (rating) {
            const minRating = parseFloat(rating);
            filterConditions.rating = { gte: minRating };
        }
        if (search) {
            filterConditions.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { subtitle: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        // Retrieve courses and total count for pagination
        const [courses, totalCount] = await db_1.default.$transaction([
            db_1.default.course.findMany({
                where: filterConditions,
                include: {
                    category: { select: { name: true, slug: true } },
                    instructor: { select: { name: true, avatarUrl: true } },
                },
                orderBy: { rating: 'desc' },
                skip,
                take: limitNum,
            }),
            db_1.default.course.count({ where: filterConditions }),
        ]);
        return res.json({
            courses,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalItems: totalCount,
            },
        });
    }
    catch (error) {
        console.error('Fetch courses error:', error);
        return res.status(500).json({ message: 'Error retrieving courses list' });
    }
};
exports.getCourses = getCourses;
// 3. Get Course Details
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await db_1.default.course.findUnique({
            where: { id },
            include: {
                category: true,
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        streakCount: true,
                    },
                },
                sections: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { sortOrder: 'asc' },
                            select: {
                                id: true,
                                title: true,
                                duration: true,
                                isFreePreview: true,
                                sortOrder: true,
                            },
                        },
                    },
                },
                reviews: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { name: true, avatarUrl: true } },
                    },
                },
            },
        });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        return res.json(course);
    }
    catch (error) {
        console.error('Fetch course details error:', error);
        return res.status(500).json({ message: 'Error retrieving course details' });
    }
};
exports.getCourseById = getCourseById;
