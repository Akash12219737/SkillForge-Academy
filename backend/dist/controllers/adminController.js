"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = exports.getPaymentsAndAnalytics = exports.deleteCourse = exports.getAdminCourses = exports.updateUserRole = exports.getUsers = void 0;
const db_1 = __importDefault(require("../config/db"));
const client_1 = require("@prisma/client");
// 1. Get All Users
const getUsers = async (req, res) => {
    try {
        const { search } = req.query;
        const queryConditions = {};
        if (search) {
            queryConditions.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const users = await db_1.default.user.findMany({
            where: queryConditions,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                streakCount: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json(users);
    }
    catch (error) {
        console.error('Fetch users error:', error);
        return res.status(500).json({ message: 'Error retrieving user ledger' });
    }
};
exports.getUsers = getUsers;
// 2. Modify User Role
const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        if (!role || !Object.values(client_1.Role).includes(role)) {
            return res.status(400).json({ message: 'Invalid role assignment' });
        }
        const updated = await db_1.default.user.update({
            where: { id: userId },
            data: { role: role },
            select: { id: true, name: true, email: true, role: true },
        });
        return res.json(updated);
    }
    catch (error) {
        console.error('Update role error:', error);
        return res.status(500).json({ message: 'Error modifying user role' });
    }
};
exports.updateUserRole = updateUserRole;
// 3. Get Course Admin Panel List
const getAdminCourses = async (req, res) => {
    try {
        const courses = await db_1.default.course.findMany({
            include: {
                category: { select: { name: true } },
                instructor: { select: { name: true, email: true } },
                _count: { select: { enrollments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json(courses);
    }
    catch (error) {
        console.error('Fetch admin courses error:', error);
        return res.status(500).json({ message: 'Error retrieving course lists' });
    }
};
exports.getAdminCourses = getAdminCourses;
// 4. Delete Course (Admin override)
const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        await db_1.default.course.delete({
            where: { id: courseId },
        });
        return res.json({ message: 'Course deleted successfully by admin override' });
    }
    catch (error) {
        console.error('Delete course error:', error);
        return res.status(500).json({ message: 'Error deleting course' });
    }
};
exports.deleteCourse = deleteCourse;
// 5. Get Payment Ledger & Global Analytics
const getPaymentsAndAnalytics = async (req, res) => {
    try {
        const payments = await db_1.default.payment.findMany({
            include: {
                user: { select: { name: true, email: true } },
                course: { select: { title: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const userCount = await db_1.default.user.count();
        const courseCount = await db_1.default.course.count();
        const enrollmentCount = await db_1.default.enrollment.count();
        const totalRevenue = payments
            .filter((p) => p.status === 'COMPLETED')
            .reduce((sum, p) => sum + p.amount, 0);
        return res.json({
            summary: {
                totalUsers: userCount,
                totalCourses: courseCount,
                totalEnrollments: enrollmentCount,
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            },
            payments,
        });
    }
    catch (error) {
        console.error('Fetch admin analytics error:', error);
        return res.status(500).json({ message: 'Error retrieving admin report files' });
    }
};
exports.getPaymentsAndAnalytics = getPaymentsAndAnalytics;
// 6. Category CRUD
const createCategory = async (req, res) => {
    try {
        const { name, slug, description } = req.body;
        if (!name || !slug)
            return res.status(400).json({ message: 'Category Name and Slug are required' });
        const category = await db_1.default.category.create({
            data: { name, slug, description },
        });
        return res.status(201).json(category);
    }
    catch (error) {
        console.error('Create category error:', error);
        return res.status(500).json({ message: 'Error creating category' });
    }
};
exports.createCategory = createCategory;
