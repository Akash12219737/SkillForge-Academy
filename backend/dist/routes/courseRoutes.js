"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const courseController_1 = require("../controllers/courseController");
const router = (0, express_1.Router)();
router.get('/categories', courseController_1.getCategories);
router.get('/', courseController_1.getCourses);
router.get('/:id', courseController_1.getCourseById);
exports.default = router;
