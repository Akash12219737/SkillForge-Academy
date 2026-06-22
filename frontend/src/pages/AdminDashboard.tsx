import React, { useEffect, useState } from 'react';
import { Shield, Users, Award, BookOpen, DollarSign, PlusCircle, CheckCircle, Trash2, Search, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Dialog } from '../components/ui/Dialog';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import api from '../services/api';

export const AdminDashboard: React.FC = () => {
  // Lists
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab controls
  const [activeTab, setActiveTab] = useState('users');
  
  // Category creation state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Search filter
  const [userSearch, setUserSearch] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, userRes, courseRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get(`/admin/users?search=${userSearch}`),
        api.get('/admin/courses'),
      ]);
      setSummary(analyticsRes.data.summary || null);
      setPayments(analyticsRes.data.payments || []);
      setUsers(userRes.data || []);
      setCourses(courseRes.data || []);
    } catch (err) {
      console.error('Error fetching admin data logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [userSearch]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error('Failed to change user role permissions:', err);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this course curriculum?')) return;
    try {
      await api.delete(`/admin/courses/${courseId}`);
      setCourses(courses.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error('Failed to delete course:', err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!newCategory.name || !newCategory.slug) {
      setFormError('Category name and slug are required parameters.');
      return;
    }

    try {
      await api.post('/admin/categories', newCategory);
      setFormSuccess('New Category path registered!');
      setNewCategory({ name: '', slug: '', description: '' });
      setTimeout(() => setCategoryModalOpen(false), 800);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error occurred during category creation');
    }
  };

  if (loading && !summary) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-24 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-left space-y-8">
      {/* Top Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Audit platform logs, update user role access levels, and approve curriculums</p>
        </div>
        <Button variant="gradient" className="flex items-center space-x-1 shadow-md shrink-0" onClick={() => setCategoryModalOpen(true)}>
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Add Course Category</span>
        </Button>
      </div>

      {/* Analytics Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 flex items-center space-x-4">
          <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500"><Users className="h-6 w-6" /></div>
          <div>
            <div className="text-2xl font-black">{summary?.totalUsers || 0}</div>
            <div className="text-xs text-muted-foreground">Total Users</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4">
          <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-500"><DollarSign className="h-6 w-6" /></div>
          <div>
            <div className="text-2xl font-black">${summary?.totalRevenue || 0}</div>
            <div className="text-xs text-muted-foreground">System Sales Income</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4">
          <div className="rounded-lg bg-purple-500/10 p-3 text-purple-500"><BookOpen className="h-6 w-6" /></div>
          <div>
            <div className="text-2xl font-black">{summary?.totalCourses || 0}</div>
            <div className="text-xs text-muted-foreground">Platform Courses</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4">
          <div className="rounded-lg bg-orange-500/10 p-3 text-orange-500"><Award className="h-6 w-6" /></div>
          <div>
            <div className="text-2xl font-black">{summary?.totalEnrollments || 0}</div>
            <div className="text-xs text-muted-foreground">Active Enrollments</div>
          </div>
        </Card>
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted border-slate-200 dark:border-slate-800">
          <TabsTrigger value="users">User Ledger</TabsTrigger>
          <TabsTrigger value="courses">Course Oversight</TabsTrigger>
          <TabsTrigger value="payments">Payments Log</TabsTrigger>
        </TabsList>

        {/* Tab 1: User Ledger */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center space-x-2 w-full md:w-80">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search user record..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-card">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs text-foreground uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-bold">User Name</th>
                  <th className="px-6 py-3.5 font-bold">Email</th>
                  <th className="px-6 py-3.5 font-bold">Role Access</th>
                  <th className="px-6 py-3.5 font-bold">Streak</th>
                  <th className="px-6 py-3.5 font-bold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="px-6 py-4 font-bold text-foreground">{u.name}</td>
                    <td className="px-6 py-4 font-mono text-xs">{u.email}</td>
                    <td className="px-6 py-4">
                      <Select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="h-8 py-0 px-2 w-32 text-xs"
                        options={[
                          { value: 'STUDENT', label: 'STUDENT' },
                          { value: 'INSTRUCTOR', label: 'INSTRUCTOR' },
                          { value: 'ADMIN', label: 'ADMIN' },
                        ]}
                      />
                    </td>
                    <td className="px-6 py-4">{u.streakCount} Days</td>
                    <td className="px-6 py-4 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab 2: Course Oversight */}
        <TabsContent value="courses" className="space-y-4">
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-card">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs text-foreground uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Title</th>
                  <th className="px-6 py-3.5 font-bold">Instructor</th>
                  <th className="px-6 py-3.5 font-bold">Category</th>
                  <th className="px-6 py-3.5 font-bold">Price</th>
                  <th className="px-6 py-3.5 font-bold">Enrollments</th>
                  <th className="px-6 py-3.5 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="px-6 py-4 font-bold text-foreground">{c.title}</td>
                    <td className="px-6 py-4">{c.instructor?.name}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-blue-500 uppercase">{c.category?.name}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">${c.price}</td>
                    <td className="px-6 py-4">{c._count?.enrollments || 0}</td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" className="text-destructive hover:bg-destructive/10 p-2 h-auto" onClick={() => handleDeleteCourse(c.id)}>
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab 3: Payment transaction ledger */}
        <TabsContent value="payments" className="space-y-4">
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-card">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs text-foreground uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Transaction ID</th>
                  <th className="px-6 py-3.5 font-bold">Student Name</th>
                  <th className="px-6 py-3.5 font-bold">Course Title</th>
                  <th className="px-6 py-3.5 font-bold">Amount</th>
                  <th className="px-6 py-3.5 font-bold">Status</th>
                  <th className="px-6 py-3.5 font-bold">Billing Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="px-6 py-4 font-mono text-xs text-foreground">{p.transactionId}</td>
                    <td className="px-6 py-4">{p.user?.name}</td>
                    <td className="px-6 py-4 truncate max-w-xs">{p.course?.title}</td>
                    <td className="px-6 py-4 font-bold text-foreground">${p.amount}</td>
                    <td className="px-6 py-4">
                      <Badge variant={p.status === 'COMPLETED' ? 'success' : 'destructive'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs">{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL: Create Course Category */}
      <Dialog isOpen={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} title="Create New Course Category">
        <form onSubmit={handleCreateCategory} className="space-y-4 text-left">
          {formError && <div className="text-xs text-destructive font-bold">{formError}</div>}
          {formSuccess && <div className="text-xs text-emerald-500 font-bold">{formSuccess}</div>}

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Category Name</label>
            <Input type="text" placeholder="DevOps & Systems" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Slug URL</label>
            <Input type="text" placeholder="devops-systems" value={newCategory.slug} onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Description</label>
            <textarea className="w-full h-20 p-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-background" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} />
          </div>
          <Button type="submit" variant="gradient" className="w-full">Create Category</Button>
        </form>
      </Dialog>
    </div>
  );
};
