"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const instructorRoutes_1 = __importDefault(require("./routes/instructorRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*', // For local dev, allows React client access
    credentials: true,
}));
app.use(express_1.default.json());
// Rate Limiter to prevent brute force / flooding (SQL injection/DoS mitigation)
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
});
app.use('/api/', apiLimiter);
// Route Bindings
app.use('/api/auth', authRoutes_1.default);
app.use('/api/courses', courseRoutes_1.default);
app.use('/api/student', studentRoutes_1.default);
app.use('/api/instructor', instructorRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
// Health Check API
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', uptime: process.uptime(), timestamp: new Date() });
});
// 404 Route handler
app.use((req, res) => {
    res.status(404).json({ message: 'API Endpoint Not Found' });
});
// Global Exception Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Exception:', err);
    res.status(err.status || 500).json({
        message: err.message || 'An unexpected server error occurred',
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    });
});
exports.default = app;
