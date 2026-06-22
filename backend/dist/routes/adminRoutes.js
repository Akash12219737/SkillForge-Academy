"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Apply auth and restrict to Admins
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)([client_1.Role.ADMIN]));
router.get('/users', adminController_1.getUsers);
router.patch('/users/:userId/role', adminController_1.updateUserRole);
router.get('/courses', adminController_1.getAdminCourses);
router.delete('/courses/:courseId', adminController_1.deleteCourse);
router.get('/analytics', adminController_1.getPaymentsAndAnalytics);
router.post('/categories', adminController_1.createCategory);
exports.default = router;
