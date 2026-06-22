import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Award, BookOpen, PlusCircle, CheckCircle, Video, Folder, Settings, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Dialog } from '../components/ui/Dialog';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import api from '../services/api';

export const InstructorDashboard: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog triggers
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  
  // Form states for creating resources
  const [newCourse, setNewCourse] = useState({
    title: '',
    subtitle: '',
    description: '',
    price: '',
    categoryId: '',
    level: 'BEGINNER',
  });
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [newSection, setNewSection] = useState({
    title: '',
    sortOrder: '1',
  });
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [newLesson, setNewLesson] = useState({
    title: '',
    videoUrl: '',
    duration: '',
    content: '',
    isFreePreview: false,
    sortOrder: '1',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [courseRes, analyticsRes, catRes] = await Promise.all([
          api.get('/instructor/courses'),
          api.get('/instructor/analytics'),
          api.get('/courses/categories'),
        ]);
        setCourses(courseRes.data || []);
        setAnalytics(analyticsRes.data || null);
        setCategories(catRes.data || []);
        
        if (catRes.data.length > 0) {
          setNewCourse((prev) => ({ ...prev, categoryId: catRes.data[0].id }));
        }
      } catch (err) {
        console.error('Error fetching instructor logs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!newCourse.title || !newCourse.description || !newCourse.price) {
      setFormError('Title, description, and price are required.');
      return;
    }

    try {
      const res = await api.post('/instructor/courses', newCourse);
      setCourses([res.data, ...courses]);
      setFormSuccess('Course draft created successfully!');
      setNewCourse({
        title: '',
        subtitle: '',
        description: '',
        price: '',
        categoryId: categories[0]?.id || '',
        level: 'BEGINNER',
      });
      setTimeout(() => setCourseModalOpen(false), 800);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error occurred while saving course draft');
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!newSection.title || !selectedCourseId) {
      setFormError('Section title and target course must be selected.');
      return;
    }

    try {
      await api.post(`/instructor/courses/${selectedCourseId}/sections`, newSection);
      setFormSuccess('Syllabus Section added successfully!');
      setNewSection({ title: '', sortOrder: '1' });
      setTimeout(() => setSectionModalOpen(false), 800);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create section');
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!newLesson.title || !newLesson.videoUrl || !newLesson.duration || !selectedSectionId) {
      setFormError('Lecture Title, YouTube URL, Duration, and target section are required.');
      return;
    }

    try {
      await api.post(`/instructor/sections/${selectedSectionId}/lessons`, {
        ...newLesson,
        duration: parseInt(newLesson.duration, 10),
      });
      setFormSuccess('Lecture Lesson added successfully!');
      setNewLesson({
        title: '',
        videoUrl: '',
        duration: '',
        content: '',
        isFreePreview: false,
        sortOrder: '1',
      });
      setTimeout(() => setLessonModalOpen(false), 800);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create lesson');
    }
  };

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      const res = await api.post(`/instructor/courses/${courseId}/publish`, {
        published: !currentStatus,
      });
      setCourses(courses.map((c) => (c.id === courseId ? { ...c, published: res.data.published } : c)));
    } catch (err) {
      console.error('Failed to change publish status:', err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-left space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Instructor Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure draft curriculums and review sales analytics logs</p>
        </div>
        
        {/* Wizard Controls */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="flex items-center space-x-1" onClick={() => setSectionModalOpen(true)}>
            <Folder className="h-4 w-4" />
            <span>Create Section</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-1" onClick={() => setLessonModalOpen(true)}>
            <Video className="h-4 w-4" />
            <span>Create Lesson</span>
          </Button>
          <Button variant="gradient" className="flex items-center space-x-1 shadow-md" onClick={() => setCourseModalOpen(true)}>
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Create Course</span>
          </Button>
        </div>
      </div>

      {/* Aggregate Analytics Metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center space-x-4">
          <div className="rounded-lg bg-blue-500/10 p-3.5 text-blue-500"><Users className="h-6 w-6" /></div>
          <div>
            <div className="text-2xl font-black">{analytics?.summary?.totalEnrolled || 0}</div>
            <div className="text-xs text-muted-foreground">Total Enrolled Students</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4">
          <div className="rounded-lg bg-emerald-500/10 p-3.5 text-emerald-500"><DollarSign className="h-6 w-6" /></div>
          <div>
            <div className="text-2xl font-black">${analytics?.summary?.totalEarnings || 0}</div>
            <div className="text-xs text-muted-foreground">Lifetime Sales revenue</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4">
          <div className="rounded-lg bg-purple-500/10 p-3.5 text-purple-500"><BookOpen className="h-6 w-6" /></div>
          <div>
            <div className="text-2xl font-black">{analytics?.summary?.activeCourses || 0}</div>
            <div className="text-xs text-muted-foreground">Owned Curriculums</div>
          </div>
        </Card>
      </div>

      {/* Analytics Graph Plot */}
      {analytics?.chartData && (
        <Card className="border border-slate-200 dark:border-slate-800 bg-card p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold flex items-center space-x-1">
              <span>Course Sales Revenue History</span>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </CardTitle>
            <CardDescription>Monthly aggregates for registration transactions</CardDescription>
          </CardHeader>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="month" className="text-xs text-muted-foreground" />
                <YAxis className="text-xs text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Owned Course list Table Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">My Curriculum Roster</h2>
        
        {courses.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">You haven't written any courses yet. Launch one today!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="p-5 flex flex-col md:flex-row justify-between gap-4">
                <div className="text-left space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <Badge variant={course.published ? 'success' : 'warning'}>
                      {course.published ? 'Published' : 'Draft Mode'}
                    </Badge>
                    <span className="text-[10px] font-bold uppercase text-blue-500">{course.category?.name}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm leading-snug">{course.title}</h3>
                  <p className="text-xs text-muted-foreground">Price: ${course.price} • Enrollments: {course._count?.enrollments || 0}</p>
                </div>
                <div className="flex items-center space-x-2 self-start md:self-auto shrink-0">
                  <Button
                    size="sm"
                    variant={course.published ? 'outline' : 'gradient'}
                    onClick={() => handleTogglePublish(course.id, course.published)}
                  >
                    {course.published ? 'Depublish' : 'Publish'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: Create Course Draft */}
      <Dialog isOpen={courseModalOpen} onClose={() => setCourseModalOpen(false)} title="Create New Course Path">
        <form onSubmit={handleCreateCourse} className="space-y-4 text-left">
          {formError && <div className="text-xs text-destructive font-bold">{formError}</div>}
          {formSuccess && <div className="text-xs text-emerald-500 font-bold">{formSuccess}</div>}
          
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Course Title</label>
            <Input type="text" placeholder="AWS Solution Architecture Masterclass" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Subtitle</label>
            <Input type="text" placeholder="Design secure, fault-tolerant systems in AWS" value={newCourse.subtitle} onChange={(e) => setNewCourse({ ...newCourse, subtitle: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Description</label>
            <textarea className="w-full h-24 p-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-background" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Price (USD)</label>
              <Input type="number" placeholder="49.99" value={newCourse.price} onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Category</label>
              <Select
                value={newCourse.categoryId}
                onChange={(e) => setNewCourse({ ...newCourse, categoryId: e.target.value })}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
            </div>
          </div>
          <Button type="submit" variant="gradient" className="w-full">Save Course Path</Button>
        </form>
      </Dialog>

      {/* MODAL 2: Create Syllabus Section */}
      <Dialog isOpen={sectionModalOpen} onClose={() => setSectionModalOpen(false)} title="Create Syllabus Section">
        <form onSubmit={handleCreateSection} className="space-y-4 text-left">
          {formError && <div className="text-xs text-destructive font-bold">{formError}</div>}
          {formSuccess && <div className="text-xs text-emerald-500 font-bold">{formSuccess}</div>}
          
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Target Course Path</label>
            <Select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              options={[
                { value: '', label: 'Select Target Course' },
                ...courses.map((c) => ({ value: c.id, label: c.title })),
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Section Title</label>
            <Input type="text" placeholder="Core Pod Deployments & Services" value={newSection.title} onChange={(e) => setNewSection({ ...newSection, title: e.target.value })} required />
          </div>
          <Button type="submit" variant="gradient" className="w-full">Add Section</Button>
        </form>
      </Dialog>

      {/* MODAL 3: Create Lesson Lecture */}
      <Dialog isOpen={lessonModalOpen} onClose={() => setLessonModalOpen(false)} title="Create Lecture Lesson">
        <form onSubmit={handleCreateLesson} className="space-y-4 text-left">
          {formError && <div className="text-xs text-destructive font-bold">{formError}</div>}
          {formSuccess && <div className="text-xs text-emerald-500 font-bold">{formSuccess}</div>}

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Target Section ID</label>
            <Input type="text" placeholder="Paste Section GUID from dashboard" value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)} required />
            <p className="text-[10px] text-muted-foreground mt-1">Copy and paste Section UUID to bind this lesson</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Lecture Title</label>
            <Input type="text" placeholder="Configuring Kubernetes ClusterIP Services" value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">YouTube Embed URL</label>
            <Input type="text" placeholder="https://www.youtube.com/embed/VnvRFRk_51k" value={newLesson.videoUrl} onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Duration (Seconds)</label>
              <Input type="number" placeholder="600" value={newLesson.duration} onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Free Preview?</label>
              <Select
                value={newLesson.isFreePreview ? 'true' : 'false'}
                onChange={(e) => setNewLesson({ ...newLesson, isFreePreview: e.target.value === 'true' })}
                options={[
                  { value: 'false', label: 'Locked (Paid Enrollments)' },
                  { value: 'true', label: 'Unlocked (Free Preview)' },
                ]}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Lab README Markdown Content</label>
            <textarea className="w-full h-20 p-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-background font-mono" value={newLesson.content} onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })} />
          </div>
          <Button type="submit" variant="gradient" className="w-full">Add Lesson</Button>
        </form>
      </Dialog>
    </div>
  );
};
