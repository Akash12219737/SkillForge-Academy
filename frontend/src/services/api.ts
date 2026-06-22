import axios from 'axios';
import { initMockStorage, mockCategories, MockCourse } from './mockData';

// Initialize localStorage databases if they don't exist
initMockStorage();

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let useMockMode = false;

// Setup JWT authorization interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If mock mode is active, bypass backend request and handle locally
  if (useMockMode) {
    const mockResponse = handleMockRequest(config);
    return Promise.reject({ isMockHandled: true, mockResponse });
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Setup Response interceptor to catch offline failures and fallback to mock
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If the error was already handled by the mock interceptor, resolve the mock response
    if (error.isMockHandled) {
      return Promise.resolve(error.mockResponse);
    }

    // Switch to mock mode if network error / server unreachable
    if (!error.response || error.code === 'ERR_NETWORK' || error.response.status >= 500) {
      console.warn('Backend server or database is unreachable. Activating CloudForge Offline Sandbox...');
      useMockMode = true;
      try {
        const mockResponse = handleMockRequest(error.config);
        return Promise.resolve(mockResponse);
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }

    return Promise.reject(error);
  }
);

// Mock Request Router (simulating Express Controllers locally)
function handleMockRequest(config: any): { data: any; status: number } {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  
  // Parse POST/PATCH body data
  let data: any = {};
  if (config.data) {
    try {
      data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch (e) {
      data = config.data;
    }
  }

  // Get current active user from localStorage
  const currentToken = localStorage.getItem('token');
  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  // Load datasets
  const getCoursesList = (): MockCourse[] => JSON.parse(localStorage.getItem('cf_courses') || '[]');
  const saveCoursesList = (list: MockCourse[]) => localStorage.setItem('cf_courses', JSON.stringify(list));
  const getUsersList = () => JSON.parse(localStorage.getItem('cf_users') || '[]');
  const saveUsersList = (list: any[]) => localStorage.setItem('cf_users', JSON.stringify(list));
  const getEnrollments = () => JSON.parse(localStorage.getItem('cf_enrollments') || '[]');
  const saveEnrollments = (list: any[]) => localStorage.setItem('cf_enrollments', JSON.stringify(list));
  const getProgressList = () => JSON.parse(localStorage.getItem('cf_lesson_progress') || '[]');
  const saveProgressList = (list: any[]) => localStorage.setItem('cf_lesson_progress', JSON.stringify(list));
  const getWishlist = () => JSON.parse(localStorage.getItem('cf_wishlist') || '[]');
  const saveWishlist = (list: any[]) => localStorage.setItem('cf_wishlist', JSON.stringify(list));
  const getPayments = () => JSON.parse(localStorage.getItem('cf_payments') || '[]');
  const savePayments = (list: any[]) => localStorage.setItem('cf_payments', JSON.stringify(list));
  const getCertificates = () => JSON.parse(localStorage.getItem('cf_certificates') || '[]');
  const saveCertificates = (list: any[]) => localStorage.setItem('cf_certificates', JSON.stringify(list));
  
  // 1. Auth Handlers
  if (url === '/auth/login' && method === 'post') {
    const users = getUsersList();
    const match = users.find((u: any) => u.email === data.email);
    if (!match) {
      return { data: { message: 'Invalid email or password' }, status: 401 };
    }
    // Update active user state
    match.streakCount = (match.streakCount || 0) + 1;
    saveUsersList(users.map((u: any) => u.id === match.id ? match : u));
    
    return {
      data: {
        token: `mock-jwt-token-${match.id}`,
        user: match,
      },
      status: 200,
    };
  }

  if (url === '/auth/register' && method === 'post') {
    const users = getUsersList();
    const exists = users.some((u: any) => u.email === data.email);
    if (exists) {
      return { data: { message: 'Email already registered' }, status: 400 };
    }
    const newUser = {
      id: `usr-${Math.random().toString(36).substring(4)}`,
      email: data.email,
      name: data.name || 'Student Practitioner',
      role: data.role || 'STUDENT',
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(data.name || 'default')}`,
      streakCount: 1,
    };
    users.push(newUser);
    saveUsersList(users);

    return {
      data: {
        token: `mock-jwt-token-${newUser.id}`,
        user: newUser,
      },
      status: 201,
    };
  }

  if (url === '/auth/google' && method === 'post') {
    const users = getUsersList();
    let match = users.find((u: any) => u.email === data.email);
    if (!match) {
      match = {
        id: `usr-google-${Math.random().toString(36).substring(4)}`,
        email: data.email,
        name: data.name,
        role: 'STUDENT',
        avatarUrl: data.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg',
        streakCount: 1,
      };
      users.push(match);
      saveUsersList(users);
    }
    return {
      data: {
        token: `mock-jwt-token-${match.id}`,
        user: match,
      },
      status: 200,
    };
  }

  if (url === '/auth/profile' && method === 'get') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    return { data: { user: currentUser }, status: 200 };
  }

  // 2. Course Catalog Handlers
  if (url.startsWith('/courses/categories') && method === 'get') {
    return { data: mockCategories, status: 200 };
  }

  if (url.startsWith('/courses/') && method === 'get' && !url.includes('/content')) {
    const id = url.split('/courses/')[1];
    const courses = getCoursesList();
    const course = courses.find((c) => c.id === id);
    if (!course) return { data: { message: 'Course not found' }, status: 404 };
    return { data: course, status: 200 };
  }

  if (url === '/courses' && method === 'get') {
    const courses = getCoursesList();
    
    // Simple filter mocks
    let filtered = courses.filter((c) => c.published);
    const search = config.params?.search;
    const category = config.params?.category;
    const level = config.params?.level;
    const rating = config.params?.rating;
    
    if (search) {
      filtered = filtered.filter((c) => 
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category) {
      filtered = filtered.filter((c) => c.categorySlug === category);
    }
    if (level) {
      filtered = filtered.filter((c) => c.level === level);
    }
    if (rating) {
      filtered = filtered.filter((c) => c.rating >= parseFloat(rating));
    }

    const page = parseInt(config.params?.page || '1', 10);
    const limit = parseInt(config.params?.limit || '8', 10);
    const totalPages = Math.ceil(filtered.length / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return {
      data: {
        courses: paginated.map((c) => ({
          id: c.id,
          title: c.title,
          subtitle: c.subtitle,
          level: c.level,
          price: c.price,
          imageUrl: c.imageUrl,
          rating: c.rating,
          category: { name: c.categoryName, slug: c.categorySlug },
          instructor: { name: c.instructorName, avatarUrl: c.instructorAvatar }
        })),
        pagination: { page, limit, totalPages, totalItems: filtered.length }
      },
      status: 200,
    };
  }

  // 3. Student Handlers
  if (url.startsWith('/student/enroll/') && method === 'post') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    const courseId = url.split('/student/enroll/')[1];
    
    const enrollments = getEnrollments();
    const exists = enrollments.some((e: any) => e.userId === currentUser.id && e.courseId === courseId);
    if (exists) {
      return { data: { message: 'Already enrolled' }, status: 400 };
    }

    const newEnroll = {
      id: `enr-${Math.random().toString(36).substring(4)}`,
      userId: currentUser.id,
      courseId,
      progress: 0,
      enrolledAt: new Date().toISOString(),
    };
    enrollments.push(newEnroll);
    saveEnrollments(enrollments);

    // Save mock payment ledger entry
    const payments = getPayments();
    payments.push({
      id: `pay-${Math.random().toString(36).substring(4)}`,
      amount: 49.99,
      transactionId: `TXN-MOCK-${Math.floor(Math.random() * 1000000000)}`,
      status: 'COMPLETED',
      userId: currentUser.id,
      courseId,
      createdAt: new Date().toISOString(),
    });
    savePayments(payments);

    return { data: { message: 'Successfully enrolled', enrollment: newEnroll }, status: 201 };
  }

  if (url === '/student/courses' && method === 'get') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    const enrolls = getEnrollments().filter((e: any) => e.userId === currentUser.id);
    const courses = getCoursesList();

    const enrolledCourses = enrolls.map((e: any) => {
      const course = courses.find((c) => c.id === e.courseId);
      return {
        ...e,
        course: {
          id: course?.id,
          title: course?.title,
          subtitle: course?.subtitle,
          level: course?.level,
          imageUrl: course?.imageUrl,
          category: { name: course?.categoryName },
          instructor: { name: course?.instructorName, avatarUrl: course?.instructorAvatar }
        }
      };
    });

    return { data: enrolledCourses, status: 200 };
  }

  if (url.startsWith('/student/courses/') && url.endsWith('/content') && method === 'get') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    const courseId = url.split('/student/courses/')[1].split('/content')[0];
    
    const enrolls = getEnrollments();
    const enrollment = enrolls.find((e: any) => e.userId === currentUser.id && e.courseId === courseId);
    if (!enrollment) return { data: { message: 'Access denied: not enrolled' }, status: 403 };

    const courses = getCoursesList();
    const course = courses.find((c) => c.id === courseId);
    
    const progressList = getProgressList().filter((p: any) => p.enrollmentId === enrollment.id && p.completed);
    const completedLessonIds = progressList.map((p: any) => p.lessonId);

    return {
      data: {
        course: {
          ...course,
          instructor: { name: course?.instructorName, avatarUrl: course?.instructorAvatar }
        },
        completedLessonIds,
        progress: enrollment.progress,
      },
      status: 200,
    };
  }

  if (url.startsWith('/student/lessons/') && url.endsWith('/progress') && method === 'post') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    const lessonId = url.split('/student/lessons/')[1].split('/progress')[0];
    const { completed } = data;

    const courses = getCoursesList();
    
    // Find lesson
    let matchedLesson: any = null;
    let courseId = '';
    
    for (const c of courses) {
      for (const s of c.sections) {
        const found = s.lessons.find((l) => l.id === lessonId);
        if (found) {
          matchedLesson = found;
          courseId = c.id;
          break;
        }
      }
      if (matchedLesson) break;
    }

    if (!matchedLesson) return { data: { message: 'Lesson not found' }, status: 404 };

    const enrolls = getEnrollments();
    const enrollment = enrolls.find((e: any) => e.userId === currentUser.id && e.courseId === courseId);
    if (!enrollment) return { data: { message: 'Not enrolled' }, status: 403 };

    const progressList = getProgressList();
    const idx = progressList.findIndex((p: any) => p.enrollmentId === enrollment.id && p.lessonId === lessonId);
    if (idx !== -1) {
      progressList[idx].completed = completed;
      progressList[idx].completedAt = completed ? new Date().toISOString() : null;
    } else {
      progressList.push({
        id: `lp-${Math.random().toString(36).substring(4)}`,
        enrollmentId: enrollment.id,
        lessonId,
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      });
    }
    saveProgressList(progressList);

    // Recalculate progress percent
    const course = courses.find((c) => c.id === courseId);
    const totalLessons = course?.sections.reduce((sum, s) => sum + s.lessons.length, 0) || 0;
    
    const completedCount = progressList.filter((p: any) => p.enrollmentId === enrollment.id && p.completed).length;
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    enrollment.progress = progressPercent;
    saveEnrollments(enrolls.map((e: any) => e.id === enrollment.id ? enrollment : e));

    return {
      data: {
        progressPercent,
        completed,
        completedCount,
        totalLessons,
      },
      status: 200,
    };
  }

  if (url === '/student/wishlist' && method === 'get') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    const wishes = getWishlist().filter((w: any) => w.userId === currentUser.id);
    const courses = getCoursesList();

    const wishlistCourses = wishes.map((w: any) => {
      const course = courses.find((c) => c.id === w.courseId);
      return {
        ...w,
        course: {
          id: course?.id,
          title: course?.title,
          subtitle: course?.subtitle,
          price: course?.price,
          imageUrl: course?.imageUrl,
          category: { name: course?.categoryName },
          instructor: { name: course?.instructorName, avatarUrl: course?.instructorAvatar }
        }
      };
    });

    return { data: wishlistCourses, status: 200 };
  }

  if (url.startsWith('/student/wishlist/') && method === 'post') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    const courseId = url.split('/student/wishlist/')[1];
    
    const wishes = getWishlist();
    const idx = wishes.findIndex((w: any) => w.userId === currentUser.id && w.courseId === courseId);
    if (idx !== -1) {
      wishes.splice(idx, 1);
      saveWishlist(wishes);
      return { data: { inWishlist: false, message: 'Removed from wishlist' }, status: 200 };
    } else {
      wishes.push({
        id: `w-${Math.random().toString(36).substring(4)}`,
        userId: currentUser.id,
        courseId,
      });
      saveWishlist(wishes);
      return { data: { inWishlist: true, message: 'Added to wishlist' }, status: 200 };
    }
  }

  if (url.startsWith('/student/notes/') && method === 'post') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    const lessonId = url.split('/student/notes/')[1];
    const notesStore = JSON.parse(localStorage.getItem('cf_notes') || '{}');
    const key = `${currentUser.id}:${lessonId}`;
    notesStore[key] = data.content;
    localStorage.setItem('cf_notes', JSON.stringify(notesStore));
    return { data: { content: data.content }, status: 200 };
  }

  if (url.startsWith('/student/notes/') && method === 'get') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    const lessonId = url.split('/student/notes/')[1];
    const notesStore = JSON.parse(localStorage.getItem('cf_notes') || '{}');
    const key = `${currentUser.id}:${lessonId}`;
    return { data: { content: notesStore[key] || '' }, status: 200 };
  }

  if (url.startsWith('/student/reviews/') && method === 'post') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    const courseId = url.split('/student/reviews/')[1];
    
    const courses = getCoursesList();
    const course = courses.find((c) => c.id === courseId);
    if (!course) return { data: { message: 'Course not found' }, status: 404 };

    const newReview = {
      id: `rev-${Math.random().toString(36).substring(4)}`,
      rating: parseInt(data.rating, 10),
      comment: data.comment,
      createdAt: new Date().toISOString(),
      user: {
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg',
      }
    };

    course.reviews = course.reviews || [];
    course.reviews.push(newReview);
    
    // Recalculate average rating
    const avg = course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length;
    course.rating = parseFloat(avg.toFixed(1));

    saveCoursesList(courses);

    return { data: { message: 'Review posted', review: newReview }, status: 201 };
  }

  if (url === '/student/certificates' && method === 'get') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    const certs = getCertificates().filter((c: any) => c.userId === currentUser.id);
    const courses = getCoursesList();

    const certsWithCourses = certs.map((c: any) => {
      const course = courses.find((co) => co.id === c.courseId);
      return {
        ...c,
        course: {
          title: course?.title,
          level: course?.level,
          instructor: { name: course?.instructorName }
        }
      };
    });
    return { data: certsWithCourses, status: 200 };
  }

  if (url.startsWith('/student/certificates/claim/') && method === 'post') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    const courseId = url.split('/student/certificates/claim/')[1];

    const certs = getCertificates();
    const exists = certs.find((c: any) => c.userId === currentUser.id && c.courseId === courseId);
    if (exists) return { data: exists, status: 200 };

    const newCert = {
      id: `cert-${Math.random().toString(36).substring(4)}`,
      userId: currentUser.id,
      courseId,
      certificateUrl: `https://cloudforge-certificates.s3.amazonaws.com/cert-${currentUser.id}-${courseId}.pdf`,
      issuedAt: new Date().toISOString(),
    };
    certs.push(newCert);
    saveCertificates(certs);
    return { data: newCert, status: 201 };
  }

  // 4. Instructor Handlers
  if (url === '/instructor/courses' && method === 'get') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    const courses = getCoursesList().filter((c) => c.instructorId === currentUser.id);
    
    // Format list count
    const enrollments = getEnrollments();
    const formatted = courses.map((c) => {
      const eCount = enrollments.filter((e: any) => e.courseId === c.id).length;
      return {
        ...c,
        _count: { enrollments: eCount },
        category: { name: c.categoryName }
      };
    });
    return { data: formatted, status: 200 };
  }

  if (url === '/instructor/courses' && method === 'post') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    const courses = getCoursesList();
    const cat = mockCategories.find((c) => c.id === data.categoryId);

    const newC: MockCourse = {
      id: `course-${Math.random().toString(36).substring(4)}`,
      title: data.title,
      subtitle: data.subtitle || '',
      description: data.description,
      requirements: [],
      level: data.level || 'BEGINNER',
      price: parseFloat(data.price),
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      promoVideoUrl: 'https://www.youtube.com/embed/VnvRFRk_51k',
      rating: 5.0,
      published: false,
      categoryId: data.categoryId,
      categoryName: cat?.name || 'DevOps',
      categorySlug: cat?.slug || 'devops',
      instructorId: currentUser.id,
      instructorName: currentUser.name,
      instructorAvatar: currentUser.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg',
      sections: [],
      reviews: []
    };

    courses.push(newC);
    saveCoursesList(courses);
    return { data: newC, status: 201 };
  }

  if (url.startsWith('/instructor/courses/') && url.endsWith('/sections') && method === 'post') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    const courseId = url.split('/instructor/courses/')[1].split('/sections')[0];
    
    const courses = getCoursesList();
    const course = courses.find((c) => c.id === courseId && c.instructorId === currentUser.id);
    if (!course) return { data: { message: 'Not authorized' }, status: 403 };

    const newSec = {
      id: `sec-${Math.random().toString(36).substring(4)}`,
      title: data.title,
      sortOrder: parseInt(data.sortOrder || '1', 10),
      lessons: [],
    };

    course.sections = course.sections || [];
    course.sections.push(newSec);
    saveCoursesList(courses);
    return { data: newSec, status: 201 };
  }

  if (url.startsWith('/instructor/sections/') && url.endsWith('/lessons') && method === 'post') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    const sectionId = url.split('/instructor/sections/')[1].split('/lessons')[0];
    
    const courses = getCoursesList();
    
    // Find section
    let matchedCourse: MockCourse | null = null;
    let matchedSection: any = null;

    for (const c of courses) {
      const sec = c.sections?.find((s) => s.id === sectionId);
      if (sec) {
        matchedCourse = c;
        matchedSection = sec;
        break;
      }
    }

    if (!matchedCourse || !matchedSection) return { data: { message: 'Section not found' }, status: 404 };
    if (matchedCourse.instructorId !== currentUser.id) return { data: { message: 'Not authorized' }, status: 403 };

    const newLes = {
      id: `les-${Math.random().toString(36).substring(4)}`,
      title: data.title,
      videoUrl: data.videoUrl,
      duration: parseInt(data.duration || '600', 10),
      content: data.content || '',
      sortOrder: parseInt(data.sortOrder || '1', 10),
      isFreePreview: data.isFreePreview === true,
    };

    matchedSection.lessons = matchedSection.lessons || [];
    matchedSection.lessons.push(newLes);
    saveCoursesList(courses);
    return { data: newLes, status: 201 };
  }

  if (url.startsWith('/instructor/courses/') && url.endsWith('/publish') && method === 'post') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    const courseId = url.split('/instructor/courses/')[1].split('/publish')[0];
    
    const courses = getCoursesList();
    const course = courses.find((c) => c.id === courseId && c.instructorId === currentUser.id);
    if (!course) return { data: { message: 'Not authorized' }, status: 403 };

    course.published = data.published;
    saveCoursesList(courses);
    return { data: course, status: 200 };
  }

  if (url === '/instructor/analytics' && method === 'get') {
    if (!currentUser) return { data: { message: 'Unauthorized' }, status: 401 };
    
    const courses = getCoursesList().filter((c) => c.instructorId === currentUser.id);
    const courseIds = courses.map((c) => c.id);
    
    const enrollments = getEnrollments().filter((e: any) => courseIds.includes(e.courseId));
    const payments = getPayments().filter((p: any) => courseIds.includes(p.courseId) && p.status === 'COMPLETED');

    const totalEarnings = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

    const chartData = [
      { month: 'Jan', revenue: totalEarnings * 0.1, students: Math.round(enrollments.length * 0.1) },
      { month: 'Feb', revenue: totalEarnings * 0.15, students: Math.round(enrollments.length * 0.15) },
      { month: 'Mar', revenue: totalEarnings * 0.2, students: Math.round(enrollments.length * 0.2) },
      { month: 'Apr', revenue: totalEarnings * 0.3, students: Math.round(enrollments.length * 0.3) },
      { month: 'May', revenue: totalEarnings * 0.5, students: Math.round(enrollments.length * 0.5) },
      { month: 'Jun', revenue: totalEarnings, students: enrollments.length },
    ];

    return {
      data: {
        summary: {
          totalEnrolled: enrollments.length,
          totalEarnings: parseFloat(totalEarnings.toFixed(2)),
          activeCourses: courses.length,
        },
        chartData,
      },
      status: 200,
    };
  }

  // 5. Admin Handlers
  if (url.startsWith('/admin/users') && method === 'get') {
    if (!currentUser || currentUser.role !== 'ADMIN') return { data: { message: 'Unauthorized' }, status: 403 };
    const users = getUsersList();
    const search = config.params?.search;
    let filtered = users;
    
    if (search) {
      filtered = users.filter((u: any) => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    return { data: filtered, status: 200 };
  }

  if (url.startsWith('/admin/users/') && url.endsWith('/role') && method === 'patch') {
    if (!currentUser || currentUser.role !== 'ADMIN') return { data: { message: 'Unauthorized' }, status: 403 };
    const userId = url.split('/admin/users/')[1].split('/role')[0];
    const { role } = data;

    const users = getUsersList();
    const userToUpdate = users.find((u: any) => u.id === userId);
    if (!userToUpdate) return { data: { message: 'User not found' }, status: 404 };

    userToUpdate.role = role;
    saveUsersList(users);

    return { data: userToUpdate, status: 200 };
  }

  if (url === '/admin/courses' && method === 'get') {
    if (!currentUser || currentUser.role !== 'ADMIN') return { data: { message: 'Unauthorized' }, status: 403 };
    const courses = getCoursesList();
    const enrollments = getEnrollments();

    const formatted = courses.map((c) => {
      const eCount = enrollments.filter((e: any) => e.courseId === c.id).length;
      return {
        ...c,
        instructor: { name: c.instructorName, email: 'instructor@cloudforge.com' },
        category: { name: c.categoryName },
        _count: { enrollments: eCount }
      };
    });

    return { data: formatted, status: 200 };
  }

  if (url.startsWith('/admin/courses/') && method === 'delete') {
    if (!currentUser || currentUser.role !== 'ADMIN') return { data: { message: 'Unauthorized' }, status: 403 };
    const courseId = url.split('/admin/courses/')[1];
    
    const courses = getCoursesList();
    saveCoursesList(courses.filter((c) => c.id !== courseId));
    
    return { data: { message: 'Course deleted' }, status: 200 };
  }

  if (url === '/admin/analytics' && method === 'get') {
    if (!currentUser || currentUser.role !== 'ADMIN') return { data: { message: 'Unauthorized' }, status: 403 };
    
    const users = getUsersList();
    const courses = getCoursesList();
    const enrollments = getEnrollments();
    const payments = getPayments();

    const totalRevenue = payments
      .filter((p: any) => p.status === 'COMPLETED')
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    // Format billing logs with user/course lookup
    const paymentsWithLookups = payments.map((p: any) => {
      const u = users.find((user: any) => user.id === p.userId);
      const c = courses.find((co) => co.id === p.courseId);
      return {
        ...p,
        user: { name: u?.name || 'Sarah Connor', email: u?.email || 'student@cloudforge.com' },
        course: { title: c?.title || 'Kubernetes Masterclass' }
      };
    });

    return {
      data: {
        summary: {
          totalUsers: users.length,
          totalCourses: courses.length,
          totalEnrollments: enrollments.length,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        },
        payments: paymentsWithLookups,
      },
      status: 200,
    };
  }

  if (url === '/admin/categories' && method === 'post') {
    if (!currentUser || currentUser.role !== 'ADMIN') return { data: { message: 'Unauthorized' }, status: 403 };
    const newCat = {
      id: `cat-${data.slug}`,
      name: data.name,
      slug: data.slug,
      description: data.description || '',
    };
    mockCategories.push(newCat);
    return { data: newCat, status: 201 };
  }

  // Fallback 404 mock resource response
  return { data: { message: 'Mock API Resource Not Found' }, status: 404 };
}

export default api;
