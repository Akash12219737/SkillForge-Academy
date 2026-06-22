"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const instructorController_1 = require("../controllers/instructorController");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Apply authentication and restrict to Instructors
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)([client_1.Role.INSTRUCTOR]));
router.get('/courses', instructorController_1.getInstructorCourses);
router.post('/courses', instructorController_1.createCourse);
router.post('/courses/:courseId/sections', instructorController_1.createSection);
router.post('/sections/:sectionId/lessons', instructorController_1.createLesson);
router.post('/courses/:courseId/publish', instructorController_1.publishCourse);
router.get('/analytics', instructorController_1.getInstructorAnalytics);
exports.default = router;
