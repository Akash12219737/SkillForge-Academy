import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShieldAlert, Award, PlayCircle, BookOpen, Clock, Heart, Users, CheckCircle, ChevronDown, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Accordion, AccordionItem } from '../components/ui/Accordion';
import { Skeleton } from '../components/ui/Skeleton';
import api from '../services/api';

interface CourseDetailsPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const CourseDetailsPage: React.FC<CourseDetailsPageProps> = ({ onOpenAuth }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Page states
  const [course, setCourse] = useState<any | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [relatedCourses, setRelatedCourses] = useState<any[]>([]);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);

        // Check enrollment if logged in
        if (isAuthenticated) {
          try {
            const enrollRes = await api.get('/student/courses');
            const enrolled = enrollRes.data.some((e: any) => e.courseId === id);
            setIsEnrolled(enrolled);

            const wishRes = await api.get('/student/wishlist');
            const wishlisted = wishRes.data.some((w: any) => w.courseId === id);
            setInWishlist(wishlisted);
          } catch (e) {
            console.error('Error verifying enrollment/wishlist:', e);
          }
        }

        // Load related courses within the same category
        const catSlug = res.data.category?.slug;
        if (catSlug) {
          const relatedRes = await api.get(`/courses?category=${catSlug}&limit=3`);
          setRelatedCourses(relatedRes.data.courses?.filter((c: any) => c.id !== id) || []);
        }
      } catch (err) {
        console.error('Error fetching course details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id, isAuthenticated]);

  const handleEnrollment = async () => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }

    setEnrollLoading(true);
    try {
      await api.post(`/student/enroll/${id}`);
      setIsEnrolled(true);
      navigate(`/courses/${id}/learn`);
    } catch (err) {
      console.error('Error enrolling course:', err);
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }

    setWishlistLoading(true);
    try {
      const res = await api.post(`/student/wishlist/${id}`);
      setInWishlist(res.data.inWishlist);
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
          <div className="col-span-1">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Course not found</h2>
        <Link to="/catalog" className="text-primary hover:underline mt-4 inline-block">Return to Catalog</Link>
      </div>
    );
  }

  // Calculate syllabus summaries
  const totalSections = course.sections?.length || 0;
  const totalLessons = course.sections?.reduce((sum: number, s: any) => sum + (s.lessons?.length || 0), 0) || 0;
  const totalDurationSeconds = course.sections?.reduce((sum: number, s: any) => {
    return sum + (s.lessons?.reduce((lessonSum: number, l: any) => lessonSum + l.duration, 0) || 0);
  }, 0) || 0;
  const totalDurationHrs = (totalDurationSeconds / 3600).toFixed(1);

  return (
    <div className="relative min-h-screen">
      {/* Detail Hero banner wrapper */}
      <div className="bg-slate-950 text-white border-b border-slate-800 py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 text-left space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="bg-blue-600 text-white font-bold">{course.category?.name}</Badge>
                <Badge variant="outline" className="border-slate-700 text-slate-300 font-semibold">{course.level}</Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {course.title}
              </h1>
              
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                {course.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs md:text-sm text-slate-400">
                <div className="flex items-center space-x-1.5 text-yellow-500">
                  <Star className="h-4.5 w-4.5 fill-current" />
                  <span className="text-white font-bold text-base">{course.rating}</span>
                  <span>({course.reviews?.length || 0} reviews)</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <span>Instructor:</span>
                  <span className="text-white font-semibold">{course.instructor?.name}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <span>Last Updated:</span>
                  <span className="text-white">{new Date(course.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content body grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Detailed curriculum & bio descriptions */}
          <div className="lg:col-span-8 text-left space-y-12">
            
            {/* Overview / Description */}
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Course Overview</h2>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm md:text-base">
                {course.description}
              </div>
            </div>

            {/* Requirements / Prereq list */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="space-y-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-foreground">Requirements & Prerequisites</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  {course.requirements.map((req: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Syllabus Curriculum Section */}
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Course Curriculum</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalSections} Sections • {totalLessons} Lectures • {totalDurationHrs} Total Hours
                  </p>
                </div>
              </div>

              <Accordion className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-card divide-y divide-slate-200 dark:divide-slate-800">
                {course.sections?.map((section: any) => (
                  <AccordionItem
                    key={section.id}
                    title={`${section.title} (${section.lessons?.length || 0} Lectures)`}
                    className="px-6"
                  >
                    <div className="space-y-3 pt-2">
                      {section.lessons?.map((lesson: any) => (
                        <div key={lesson.id} className="flex items-center justify-between text-sm py-2 group">
                          <div className="flex items-center space-x-3 text-foreground font-medium">
                            <PlayCircle className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="group-hover:text-primary transition-colors">{lesson.title}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                            <span>{Math.round(lesson.duration / 60)} min</span>
                            {lesson.isFreePreview && (
                              <Badge variant="success">Preview</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Instructor Bio Profile */}
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Your Instructor</h2>
              <Card className="border border-slate-200 dark:border-slate-800 bg-card p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <img
                    src={course.instructor?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg'}
                    alt={course.instructor?.name}
                    className="h-20 w-20 rounded-full object-cover bg-slate-100 border-2 border-primary/20"
                  />
                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-foreground">{course.instructor?.name}</h3>
                    <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider">Expert DevOps Instructor</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Nana Janashia is a certified Kubernetes specialist and cloud trainer with a passion for explaining complex DevOps configurations in simple terms.
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-primary" />
                        <span>35,000+ Enrolled Students</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>4.8 Instructor Rating</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Reviews Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Student Reviews</h2>
              {course.reviews?.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-muted-foreground text-sm">
                  No student reviews yet. Be the first to share feedback!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {course.reviews?.map((review: any) => (
                    <Card key={review.id} className="border border-slate-200 dark:border-slate-800 bg-card p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={review.user?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg'}
                            alt={review.user?.name}
                            className="h-8 w-8 rounded-full bg-slate-100"
                          />
                          <div className="text-left">
                            <h4 className="text-sm font-bold text-foreground">{review.user?.name}</h4>
                            <p className="text-[10px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex space-x-0.5 text-yellow-500">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                        "{review.comment}"
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Checkout Sidebar Widget */}
          <div className="lg:col-span-4 sticky top-24">
            <Card className="glass-card overflow-hidden shadow-2xl border border-white/20 dark:border-white/10">
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-b border-slate-200 dark:border-slate-800">
                <img
                  src={course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center cursor-pointer hover:bg-slate-950/40 transition-colors">
                  <PlayCircle className="h-16 w-16 text-white drop-shadow-md hover:scale-105 transition-transform" />
                </div>
              </div>

              <CardContent className="p-6 space-y-6 text-left">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Course Pricing</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">${course.price}</span>
                    <span className="text-sm text-muted-foreground line-through">$199.99</span>
                    <Badge variant="success" className="ml-2 font-bold animate-pulse-fast">52% OFF</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {isEnrolled ? (
                    <Link to={`/courses/${course.id}/learn`} className="block w-full">
                      <Button variant="gradient" className="w-full font-bold">
                        Resume Learning workspace
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="gradient"
                      className="w-full font-bold"
                      onClick={handleEnrollment}
                      isLoading={enrollLoading}
                    >
                      Buy & Unlock Course
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={handleWishlistToggle}
                    isLoading={wishlistLoading}
                  >
                    <Heart className={`h-4.5 w-4.5 ${inWishlist ? 'fill-rose-500 text-rose-500' : 'text-foreground'}`} />
                    <span>{inWishlist ? 'Wishlisted' : 'Add to Wishlist'}</span>
                  </Button>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2.5">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>Full Lifetime Access</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Award className="h-4 w-4 text-emerald-500" />
                    <span>Verifiable Certificate of Completion</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <BookOpen className="h-4 w-4 text-purple-500" />
                    <span>Hands-on Interactive Lab access</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};
