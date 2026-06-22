import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Play, Star, Users, Award, BookOpen, Clock, Activity, Cloud, Terminal, Shield, Cpu, Code2, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import api from '../services/api';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load courses for featured list
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses?limit=3');
        setFeaturedCourses(res.data.courses || []);
      } catch (err) {
        console.error('Failed to load landing courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const stats = [
    { label: 'Active Students', value: '45,000+', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Accredited Curriculums', value: '180+', icon: BookOpen, color: 'text-indigo-500 bg-indigo-500/10' },
    { label: 'Certificates Awarded', value: '25,000+', icon: Award, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Lab Hours Streamed', value: '1.2M+', icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
  ];

  const categories = [
    { name: 'AWS Cloud', icon: Cloud, count: '14 Courses', slug: 'aws', bg: 'from-orange-500/20 to-amber-500/20 text-orange-500' },
    { name: 'Kubernetes', icon: Cpu, count: '10 Courses', slug: 'kubernetes', bg: 'from-blue-500/20 to-sky-500/20 text-blue-500' },
    { name: 'DevOps & IaC', icon: Activity, count: '19 Courses', slug: 'devops', bg: 'from-purple-500/20 to-indigo-500/20 text-purple-500' },
    { name: 'Programming', icon: Code2, count: '32 Courses', slug: 'python', bg: 'from-emerald-500/20 to-teal-500/20 text-emerald-500' },
    { name: 'AI & ML', icon: Terminal, count: '15 Courses', slug: 'ai-ml', bg: 'from-pink-500/20 to-rose-500/20 text-pink-500' },
    { name: 'Cyber Security', icon: Shield, count: '11 Courses', slug: 'cyber-security', bg: 'from-cyan-500/20 to-teal-500/20 text-cyan-500' },
  ];

  const testimonials = [
    {
      name: 'Marcus Vance',
      role: 'DevOps Architect at Stripe',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      text: 'The Kubernetes Masterclass on CloudForge was mindblowing. The dynamic syllabus and notes editor made learning incredibly structured. Highly recommend!',
      rating: 5,
    },
    {
      name: 'Jessica Thorne',
      role: 'Senior Cloud Engineer at Nordstrom',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
      text: 'Having printable PDF credentials backed by verification links is huge. I posted my Terraform Certificate on LinkedIn and had recruiters messaging me the next day.',
      rating: 5,
    },
    {
      name: 'Amir Khasanov',
      role: 'Staff Engineer at Uber',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
      text: 'I loved the learning streak indicator. It keeps you highly motivated to write code every single day. A premium, beautifully constructed learning portal.',
      rating: 5,
    },
  ];

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/10 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[150px] dark:bg-indigo-600/10 pointer-events-none" />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 rounded-full border border-blue-500/30 bg-blue-500/5 px-3.5 py-1 text-sm font-semibold text-blue-500 dark:text-blue-400">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
              <span>Next Gen Learning Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
              Forge Your Path in <br />
              <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Cloud & DevOps
              </span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Master enterprise AWS setups, Kubernetes clusters, infrastructure automation, Generative AI models, and software design from top creators.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button variant="gradient" size="lg" className="flex items-center space-x-2 shadow-lg" onClick={() => navigate('/catalog')}>
                <span>Browse Curriculums</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="flex items-center space-x-2" onClick={() => onOpenAuth('register')}>
                <Play className="h-4 w-4 text-blue-500 fill-current" />
                <span>Join for Free</span>
              </Button>
            </div>
          </div>

          {/* Hero graphic mockup */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl opacity-10 blur-xl dark:opacity-20 animate-pulse-fast" />
            <div className="relative glass-card rounded-2xl p-6 shadow-2xl max-w-md border border-white/20 dark:border-white/10 overflow-hidden">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-slate-800/50 mb-4">
                <div className="flex space-x-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="text-xs font-mono text-muted-foreground">cloudforge_terminal.sh</div>
              </div>
              <pre className="font-mono text-xs text-left leading-relaxed text-blue-600 dark:text-blue-400 overflow-x-auto">
                {`$ npm install -g @cloudforge/cli
$ cloudforge login
Successfully authenticated.
$ cloudforge setup cluster
Creating deployment pods...
[OK] Kubernetes Cluster deployed.
[OK] Terraform setup completed.
$ cloudforge run lesson --id k8s-pods`}
              </pre>
              <div className="mt-6 flex items-center justify-between bg-blue-500/10 rounded-lg p-3 text-xs border border-blue-500/20 text-blue-500">
                <span className="font-semibold">Curriculum completion rate: +92%</span>
                <span className="font-semibold underline cursor-pointer" onClick={() => navigate('/catalog')}>Explore Now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-sm py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center text-center space-y-2 p-4">
                <div className={`rounded-xl p-3 ${stat.color} mb-1`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Categories Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-4 max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Explore Trending Disciplines
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Target your upskilling goals in standard cloud architectures. Access interactive lessons designed by industry leaders.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <Card
              key={idx}
              className="cursor-pointer border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-blue-950/20 group"
              onClick={() => navigate(`/catalog?category=${cat.slug}`)}
            >
              <CardContent className="flex items-center space-x-4 p-6">
                <div className={`rounded-xl p-3 bg-gradient-to-br ${cat.bg} group-hover:scale-110 transition-transform duration-200`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors duration-200">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">{cat.count}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-200 dark:border-slate-800 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-4 max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Featured Curriculums
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Invest in your engineer skillset with our highest-rated interactive courses.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-96 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="flex flex-col h-full overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-blue-500/50 group"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
                      alt={course.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 rounded-lg bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white">
                      {course.level}
                    </div>
                  </div>

                  <CardContent className="flex-1 p-6 flex flex-col justify-between text-left space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                        {course.category?.name || 'DevOps'}
                      </span>
                      <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {course.subtitle}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={course.instructor?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg'}
                          alt={course.instructor?.name}
                          className="h-7 w-7 rounded-full bg-slate-100"
                        />
                        <span className="text-xs text-muted-foreground font-semibold truncate max-w-[120px]">
                          {course.instructor?.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-xs font-bold text-foreground">{course.rating}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xl font-black text-slate-900 dark:text-white">${course.price}</span>
                      <Link to={`/courses/${course.id}`}>
                        <Button size="sm" variant="gradient">Learn More</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Student Testimonials Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-4 max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Endorsed by Top Engineers
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            See how professional cloud administrators are upskilling their portfolios using CloudForge Academy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <Card key={idx} className="glass-card flex flex-col p-6 items-start text-left space-y-4 relative">
              <div className="flex items-center space-x-3">
                <img
                  src={test.image}
                  alt={test.name}
                  className="h-12 w-12 rounded-full object-cover bg-slate-100"
                />
                <div>
                  <h4 className="font-bold text-foreground text-sm">{test.name}</h4>
                  <p className="text-xs text-muted-foreground font-medium">{test.role}</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                "{test.text}"
              </p>

              <div className="flex space-x-1 text-yellow-500">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-24">
        <div className="relative rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-12 md:py-16 text-center text-white shadow-xl overflow-hidden">
          {/* Graphic blur background */}
          <div className="absolute -top-12 -left-12 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Upgrade Your Portfolio?
            </h2>
            <p className="text-base text-blue-100 max-w-md mx-auto leading-relaxed">
              Create an account now and unlock free sandbox tutorials, interactive syllabuses, and certification tracks.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="lg"
                className="bg-white text-blue-700 border-0 hover:bg-slate-100 font-bold shadow-lg"
                onClick={() => onOpenAuth('register')}
              >
                Sign Up Now
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
