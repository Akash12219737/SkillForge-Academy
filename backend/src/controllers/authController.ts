import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-cloudforge-academy-jwt-tokens-2026';

// Helper to generate JWT
const generateToken = (userId: string, email: string, role: string) => {
  return jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
};

// 1. Register User
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const selectedRole = role === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'STUDENT'; // Admin can only be designated in database

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: selectedRole,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    const token = generateToken(user.id, user.email, user.role);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        streakCount: user.streakCount,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
};

// 2. Login User
export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Dynamic learning streak check
    let streakCount = user.streakCount;
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    if (user.lastActiveAt) {
      const msDiff = now.getTime() - new Date(user.lastActiveAt).getTime();
      if (msDiff < oneDayInMs) {
        // Active within 24 hours, count remains or updates if it is a new day
        const lastDay = new Date(user.lastActiveAt).getDate();
        const currentDay = now.getDate();
        if (lastDay !== currentDay) {
          streakCount += 1;
        }
      } else if (msDiff < 2 * oneDayInMs) {
        // Missed one day, reset or maintain? Usually standard streak is broken if > 36h
        streakCount += 1;
      } else {
        // Streak broken
        streakCount = 1;
      }
    } else {
      streakCount = 1;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        streakCount,
        lastActiveAt: now,
      },
    });

    const token = generateToken(updatedUser.id, updatedUser.email, updatedUser.role);

    return res.json({
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        streakCount: updatedUser.streakCount,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
};

// 3. Google OAuth Simulation
export const googleLogin = async (req: AuthRequest, res: Response) => {
  try {
    const { token: googleToken, email, name, avatarUrl } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Google authentication details missing' });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const mockPasswordHash = await bcrypt.hash(Math.random().toString(36).substring(7), 10);
      user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash: mockPasswordHash,
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
          role: 'STUDENT',
        },
      });
    }

    const token = generateToken(user.id, user.email, user.role);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        streakCount: user.streakCount,
      },
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    return res.status(500).json({ message: 'Google login failed' });
  }
};

// 4. Forgot / Reset Password
export const forgotPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address' });
    }

    // In a real app we send a real link. Here we mock it:
    return res.json({
      message: 'Password reset link sent to registered email address (Mocked)',
      debugLink: `/reset-password?email=${encodeURIComponent(email)}`,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 5. Get Profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        streakCount: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
