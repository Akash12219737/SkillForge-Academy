import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { CatalogPage } from './pages/CatalogPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { VideoLearningPage } from './pages/VideoLearningPage';
import { StudentProfile } from './pages/StudentProfile';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { RouteGuard } from './components/shared/RouteGuard';
import { AuthModal } from './components/shared/AuthModal';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

export const App: React.FC = () => {
  const { loadFromStorage } = useAuthStore();
  
  // Auth modal management state
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const triggerAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
          <Navbar onOpenAuth={triggerAuth} />
          
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage onOpenAuth={triggerAuth} />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/courses/:id" element={<CourseDetailsPage onOpenAuth={triggerAuth} />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <RouteGuard allowedRoles={['STUDENT', 'ADMIN', 'INSTRUCTOR']}>
                    <StudentDashboard />
                  </RouteGuard>
                }
              />
              <Route
                path="/courses/:id/learn"
                element={
                  <RouteGuard allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
                    <VideoLearningPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/profile"
                element={
                  <RouteGuard allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
                    <StudentProfile />
                  </RouteGuard>
                }
              />
              <Route
                path="/instructor"
                element={
                  <RouteGuard allowedRoles={['INSTRUCTOR']}>
                    <InstructorDashboard />
                  </RouteGuard>
                }
              />
              <Route
                path="/admin"
                element={
                  <RouteGuard allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </RouteGuard>
                }
              />

              {/* Fallback Catch-All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />

          {/* Global Auth Modal popup */}
          <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
        </div>
      </Router>
    </ErrorBoundary>
  );
};
export default App;
