import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { User, Shield, Heart, Award, Save, Lock, LayoutGrid, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import api from '../services/api';

export const StudentProfile: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Profile states
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Sync active tab from URL param (default 'settings')
  const activeTab = searchParams.get('tab') || 'settings';

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const [wishRes, certRes] = await Promise.all([
          api.get('/student/wishlist'),
          api.get('/student/certificates'),
        ]);
        setWishlist(wishRes.data || []);
        setCertificates(certRes.data || []);
      } catch (err) {
        console.error('Error fetching profile records:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(null);
    setUpdateError(null);

    // Mock update operation
    setTimeout(() => {
      setUpdateSuccess('Profile details updated successfully (Simulated)');
    }, 400);
  };

  const handleRemoveWishlist = async (courseId: string) => {
    try {
      await api.post(`/student/wishlist/${courseId}`);
      setWishlist(wishlist.filter((w) => w.courseId !== courseId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-left space-y-8">
      {/* Top Header Card */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Account Workspace</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage profile parameters, view course wishlists, and inspect credential certificates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Tab Selectors */}
        <div className="lg:col-span-3 space-y-2">
          <button
            onClick={() => setSearchParams({ tab: 'settings' })}
            className={`flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'settings'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <User className="h-4.5 w-4.5" />
            <span>Profile Settings</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'wishlist' })}
            className={`flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'wishlist'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Heart className="h-4.5 w-4.5" />
            <span>My Wishlist</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'certificates' })}
            className={`flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'certificates'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Award className="h-4.5 w-4.5" />
            <span>My Certificates</span>
          </button>
        </div>

        {/* Right Side Main Area */}
        <div className="lg:col-span-9">
          {activeTab === 'settings' && (
            <Card className="border border-slate-200 dark:border-slate-800 bg-card">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update name settings and security passwords</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {updateSuccess && (
                  <div className="flex items-center space-x-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-3.5 rounded-lg font-medium">
                    <CheckCircle className="h-5 w-5" />
                    <span>{updateSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Full Name</label>
                      <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Email Address</label>
                      <Input type="email" value={email} disabled />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-blue-500" />
                      <span>Security Settings</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Current Password</label>
                        <Input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">New Password</label>
                        <Input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" variant="gradient" className="flex items-center space-x-1.5 pt-2">
                    <Save className="h-4.5 w-4.5" />
                    <span>Save Changes</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">Course Wishlist</h2>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((n) => <Skeleton key={n} className="h-48 w-full rounded-xl" />)}
                </div>
              ) : wishlist.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Your wishlist is empty. Discover courses in the catalog.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {wishlist.map((item) => (
                    <Card key={item.id} className="overflow-hidden flex flex-col justify-between">
                      <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                        <img src={item.course?.imageUrl} alt={item.course?.title} className="h-full w-full object-cover" />
                        <button
                          onClick={() => handleRemoveWishlist(item.courseId)}
                          className="absolute top-3 right-3 rounded-full bg-slate-900/80 p-2 text-rose-500 backdrop-blur-sm"
                        >
                          <Heart className="h-4.5 w-4.5 fill-current" />
                        </button>
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <div className="text-left space-y-1.5">
                          <span className="text-[10px] font-bold uppercase text-blue-500">{item.course?.category?.name}</span>
                          <h3 className="font-bold text-foreground text-sm line-clamp-1 leading-snug">{item.course?.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.course?.subtitle}</p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80">
                          <span className="text-sm font-black text-foreground">${item.course?.price}</span>
                          <Link to={`/courses/${item.courseId}`}>
                            <Button size="sm" variant="gradient">Learn More</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">Claimed Credentials</h2>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((n) => <Skeleton key={n} className="h-24 w-full rounded-xl" />)}
                </div>
              ) : certificates.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <Award className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">You haven't earned any certificates yet. Complete a course to 100% to claim credentials!</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <Card key={cert.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between border-l-4 border-l-emerald-500">
                      <div>
                        <h3 className="font-bold text-foreground text-base leading-snug">{cert.course?.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Issued on: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 sm:mt-0 self-start sm:self-auto border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 font-bold"
                        onClick={() => window.open(cert.certificateUrl, '_blank')}
                      >
                        Verify Credential
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
