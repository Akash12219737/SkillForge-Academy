import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import studentRoutes from './routes/studentRoutes';
import instructorRoutes from './routes/instructorRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // For local dev, allows React client access
  credentials: true,
}));
app.use(express.json());

// Rate Limiter to prevent brute force / flooding (SQL injection/DoS mitigation)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
});
app.use('/api/', apiLimiter);

// Route Bindings
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/admin', adminRoutes);

// Health Check API
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', uptime: process.uptime(), timestamp: new Date() });
});

// 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'API Endpoint Not Found' });
});

// Global Exception Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Exception:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

export default app;
