import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Star, Award, BookOpen, GraduationCap, Clock, ArrowRight, Play, LayoutDashboard, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import api from '../services/api';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [courseRes, certRes] = await Promise.all([
          api.get('/student/courses'),
          api.get('/student/certificates'),
        ]);
        setEnrolledCourses(courseRes.data || []);
        setCertificates(certRes.data || []);
      } catch (err) {
        console.error('Error loading student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const totalCourses = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter((c) => c.progress === 100).length;
  const inProgressCourses = enrolledCourses.filter((c) => c.progress < 100);

  // Generate dynamic calendar week grid
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDayIdx = (new Date().getDay() + 6) % 7; // Mon is 0, Sun is 6

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Skeleton className="h-20 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-left space-y-8">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name || 'Practitioner'}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Keep pushing your knowledge limits. Track your daily study indicators here.</p>
        </div>
        <div className="flex items-center space-x-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 animate-flame">
          <Flame className="h-6 w-6 text-amber-500 fill-amber-500" />
          <div>
            <div className="text-sm font-bold text-foreground">{user?.streakCount || 1} Day Learning Streak</div>
            <div className="text-[10px] text-muted-foreground">Study again tomorrow to keep the flame alive!</div>
          </div>
        </div>
      </div>

      {/* Aggregate Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4 flex items-center space-x-4">
          <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500"><BookOpen className="h-6 w-6" /></div>
          <div>
            <div className="text-2xl font-black">{totalCourses}</div>
            <div className="text-xs text-muted-foreground">Enrolled Courses</div>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center space-x-4">
          <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-500"><GraduationCap className="h-6 w-6" /></div>
          <div>
            <div className="text-2xl font-black">{completedCourses}</div>
            <div className="text-xs text-muted-foreground">Completions</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4">
          <div className="rounded-lg bg-purple-500/10 p-3 text-purple-500"><Award className="h-6 w-6" /></div>
          <div>
            <div className="text-2xl font-black">{certificates.length}</div>
            <div className="text-xs text-muted-foreground">Credentials Claimed</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4">
          <div className="rounded-lg bg-orange-500/10 p-3 text-orange-500"><Clock className="h-6 w-6" /></div>
          <div>
            <div className="text-2xl font-black">{totalCourses * 8 + 4}h</div>
            <div className="text-xs text-muted-foreground">Total Study Hours</div>
          </div>
        </Card>
      </div>

      {/* Middle Grid: Continuing vs Streak Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Enrolled/In-Progress List */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Continue Learning</h2>
          
          {totalCourses === 0 ? (
            <Card className="p-12 text-center border-dashed space-y-4">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="text-base font-bold">No active enrollments</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                You haven't unlocked any courses yet. Browse our Cloud and DevOps catalog to get started.
              </p>
              <Link to="/catalog">
                <Button variant="gradient">Explore Curriculums</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {enrolledCourses.map((enroll) => (
                <Card key={enroll.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
                  <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                    <img
                      src={enroll.course?.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
                      alt={enroll.course?.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-slate-950/80 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                      {enroll.course?.level}
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4 text-left">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-blue-500">{enroll.course?.category?.name}</span>
                      <h3 className="font-bold text-foreground text-sm line-clamp-2 leading-snug">{enroll.course?.title}</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Course Progress</span>
                        <span>{enroll.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${enroll.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80">
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                        By {enroll.course?.instructor?.name}
                      </span>
                      <Link to={`/courses/${enroll.courseId}/learn`}>
                        <Button size="sm" variant={enroll.progress === 100 ? 'outline' : 'gradient'} className="flex items-center space-x-1">
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>{enroll.progress === 100 ? 'Review' : 'Resume'}</span>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Calendar / Weekly Challenge Section */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center space-x-2">
                <Calendar className="h-4.5 w-4.5 text-blue-500" />
                <span>Weekly Tracker</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mon-Sun checklist visual */}
              <div className="flex justify-between items-center text-center">
                {daysOfWeek.map((day, idx) => {
                  const isActive = idx <= currentDayIdx;
                  return (
                    <div key={day} className="flex flex-col items-center space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold">{day}</span>
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          isActive
                            ? 'bg-amber-500 text-white font-extrabold shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground'
                        }`}
                      >
                        {isActive ? <Flame className="h-4 w-4 fill-current" /> : idx + 1}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-xs space-y-2 text-left">
                <h4 className="font-bold text-foreground">Active Weekly Challenge</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Complete at least 1 course lesson daily to unlock the <span className="text-amber-500 font-bold">CloudForge Pioneer Badge</span>.
                </p>
                <div className="flex items-center space-x-2 pt-1 font-semibold text-primary">
                  <span>Current Reward Multiplier: 1.5x XP</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <div className="space-y-4 text-left">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <Award className="h-6 w-6 text-emerald-500" />
            <span>Verifiable Certificates</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <Card key={cert.id} className="border border-emerald-500/20 bg-emerald-500/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                    <Award className="h-4 w-4" />
                    <span>Verified Credential</span>
                  </div>
                  <h3 className="font-bold text-foreground text-base leading-snug">{cert.course?.title}</h3>
                  <p className="text-xs text-muted-foreground">Issued by Nana Janashia • {new Date(cert.issuedAt).toLocaleDateString()}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-600/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600/10 self-start md:self-auto shrink-0 font-bold"
                  onClick={() => {
                    // Open a simulated credentials window
                    const newWin = window.open('', '_blank');
                    if (newWin) {
                      newWin.document.write(`
                        <html>
                        <head>
                          <title>CloudForge Verification Credentials</title>
                          <style>
                            body { font-family: sans-serif; background-color: #0f172a; color: #f8fafc; text-align: center; padding: 50px; }
                            .cert { border: 8px double #10b981; padding: 40px; border-radius: 12px; display: inline-block; max-width: 600px; }
                            h1 { color: #10b981; font-weight: 900; margin-bottom: 5px; }
                            h2 { margin-top: 0; font-size: 16px; color: #94a3b8; }
                            p { font-size: 18px; margin: 30px 0; }
                            .verify { font-size: 12px; color: #64748b; margin-top: 40px; }
                          </style>
                        </head>
                        <body>
                          <div class="cert">
                            <h1>CLOUDFORGE ACADEMY</h1>
                            <h2>VERIFIED PORTFOLIO CREDENTIAL</h2>
                            <p>This certifies that student</p>
                            <h3>\${user?.name}</h3>
                            <p>has successfully completed the enterprise curriculum for</p>
                            <h4>\${cert.course?.title}</h4>
                            <p>with verifiable verification hash: CF-\${cert.id.substring(0,8).toUpperCase()}</p>
                            <div class="verify">Verification URL: \${cert.certificateUrl}</div>
                          </div>
                        </body>
                        </html>
                      `);
                    }
                  }}
                >
                  Print Credential
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
