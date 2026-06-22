import { Request, Response } from 'express';
import prisma from '../config/db';

// 1. Get Categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return res.json(categories);
  } catch (error) {
    console.error('Fetch categories error:', error);
    return res.status(500).json({ message: 'Error retrieving course categories' });
  }
};

// 2. Search & Filter Courses Catalog
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { category, level, rating, search, page = '1', limit = '8' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build Prisma query filters
    const filterConditions: any = { published: true };

    if (category) {
      filterConditions.category = { slug: category as string };
    }

    if (level) {
      filterConditions.level = level as any;
    }

    if (rating) {
      const minRating = parseFloat(rating as string);
      filterConditions.rating = { gte: minRating };
    }

    if (search) {
      filterConditions.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { subtitle: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Retrieve courses and total count for pagination
    const [courses, totalCount] = await prisma.$transaction([
      prisma.course.findMany({
        where: filterConditions,
        include: {
          category: { select: { name: true, slug: true } },
          instructor: { select: { name: true, avatarUrl: true } },
        },
        orderBy: { rating: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.course.count({ where: filterConditions }),
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
  } catch (error) {
    console.error('Fetch courses error:', error);
    return res.status(500).json({ message: 'Error retrieving courses list' });
  }
};

// 3. Get Course Details
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
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
  } catch (error) {
    console.error('Fetch course details error:', error);
    return res.status(500).json({ message: 'Error retrieving course details' });
  }
};
