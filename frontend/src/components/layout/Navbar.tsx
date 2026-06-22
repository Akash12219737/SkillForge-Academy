import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, BookOpen, GraduationCap, LogOut, LayoutDashboard, User as UserIcon, Settings, Heart, Award } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (document.documentElement.classList.contains('dark')) return 'dark';
    return 'light';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileDropdownOpen(false);
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="rounded-lg bg-blue-600 p-2 text-white shadow-md shadow-blue-500/30">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
                CloudForge<span className="text-blue-500 font-semibold text-sm ml-0.5 tracking-normal">ACADEMY</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/catalog"
              className="flex items-center space-x-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <BookOpen className="h-4 w-4" />
              <span>Explore Courses</span>
            </Link>

            {isAuthenticated && (
              <>
                {user?.role === 'STUDENT' && (
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>My Dashboard</span>
                  </Link>
                )}
                {user?.role === 'INSTRUCTOR' && (
                  <Link
                    to="/instructor"
                    className="flex items-center space-x-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Instructor Panel</span>
                  </Link>
                )}
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Controls & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
            </button>

            {/* Profile Dropdown or Login Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 border border-slate-200 dark:border-slate-800"
                >
                  <img
                    src={user?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=guest'}
                    alt="Profile Avatar"
                    className="h-8 w-8 rounded-full bg-slate-100"
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 dark:border-slate-800 bg-background py-1.5 shadow-xl ring-1 ring-black ring-opacity-5 animate-slide-up">
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                      <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/profile?tab=wishlist"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
                    >
                      <Heart className="h-4 w-4" />
                      <span>My Wishlist</span>
                    </Link>

                    <Link
                      to="/profile?tab=certificates"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
                    >
                      <Award className="h-4 w-4" />
                      <span>Certificates</span>
                    </Link>

                    <hr className="my-1 border-slate-200 dark:border-slate-800" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" onClick={() => onOpenAuth('login')}>
                  Log In
                </Button>
                <Button variant="gradient" size="sm" onClick={() => onOpenAuth('register')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Hamburger Menu Toggle (Mobile) */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-background/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-accent text-foreground"
          >
            Explore Courses
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'STUDENT' && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-accent text-foreground"
                >
                  My Dashboard
                </Link>
              )}
              {user?.role === 'INSTRUCTOR' && (
                <Link
                  to="/instructor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-accent text-foreground"
                >
                  Instructor Panel
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-accent text-foreground"
                >
                  Admin Panel
                </Link>
              )}

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-accent text-foreground"
              >
                Profile Settings
              </Link>

              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-destructive hover:bg-destructive/10"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col space-y-2">
              <Button variant="outline" onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}>
                Log In
              </Button>
              <Button variant="gradient" onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
