"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
async function test() {
    try {
        console.log('--- Database Diagnostic Query ---');
        const userCount = await db_1.default.user.count();
        const courseCount = await db_1.default.course.count();
        const categoryCount = await db_1.default.category.count();
        console.log(`User Count: ${userCount}`);
        console.log(`Course Count: ${courseCount}`);
        console.log(`Category Count: ${categoryCount}`);
        const users = await db_1.default.user.findMany({
            select: {
                email: true,
                role: true,
                name: true,
            }
        });
        console.log('Registered Users:', users);
    }
    catch (err) {
        console.error('Database connection error during diagnostics:', err);
    }
    finally {
        await db_1.default.$disconnect();
    }
}
test();
