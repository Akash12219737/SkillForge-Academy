import prisma from '../config/db';

async function test() {
  try {
    console.log('--- Database Diagnostic Query ---');
    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();
    const categoryCount = await prisma.category.count();
    
    console.log(`User Count: ${userCount}`);
    console.log(`Course Count: ${courseCount}`);
    console.log(`Category Count: ${categoryCount}`);

    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        name: true,
      }
    });
    console.log('Registered Users:', users);
  } catch (err) {
    console.error('Database connection error during diagnostics:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
