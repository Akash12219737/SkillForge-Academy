import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

// 1. Get All Users
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query;

    const queryConditions: any = {};
    if (search) {
      queryConditions.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
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
  } catch (error) {
    console.error('Fetch users error:', error);
    return res.status(500).json({ message: 'Error retrieving user ledger' });
  }
};

// 2. Modify User Role
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !Object.values(Role).includes(role)) {
      return res.status(400).json({ message: 'Invalid role assignment' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({ message: 'Error modifying user role' });
  }
};

// 3. Get Course Admin Panel List
export const getAdminCourses = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        category: { select: { name: true } },
        instructor: { select: { name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(courses);
  } catch (error) {
    console.error('Fetch admin courses error:', error);
    return res.status(500).json({ message: 'Error retrieving course lists' });
  }
};

// 4. Delete Course (Admin override)
export const deleteCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;

    await prisma.course.delete({
      where: { id: courseId },
    });

    return res.json({ message: 'Course deleted successfully by admin override' });
  } catch (error) {
    console.error('Delete course error:', error);
    return res.status(500).json({ message: 'Error deleting course' });
  }
};

// 5. Get Payment Ledger & Global Analytics
export const getPaymentsAndAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();
    const enrollmentCount = await prisma.enrollment.count();
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
  } catch (error) {
    console.error('Fetch admin analytics error:', error);
    return res.status(500).json({ message: 'Error retrieving admin report files' });
  }
};

// 6. Category CRUD
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, description } = req.body;
    if (!name || !slug) return res.status(400).json({ message: 'Category Name and Slug are required' });

    const category = await prisma.category.create({
      data: { name, slug, description },
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ message: 'Error creating category' });
  }
};
