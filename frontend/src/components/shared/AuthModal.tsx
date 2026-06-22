import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { GraduationCap, Chrome, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, error, clearError, isLoading } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'INSTRUCTOR'>('STUDENT');
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setName('');
      setRole('STUDENT');
      setFormError(null);
      setInfoMessage(null);
      clearError();
    }
  }, [isOpen, initialMode, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setInfoMessage(null);

    if (!email) {
      setFormError('Email address is required');
      return;
    }

    try {
      if (mode === 'forgot') {
        const response = await login({ email, token: 'mock-forgot-password-trigger' }); // Handled specially or simulated
        setInfoMessage('If registered, a password reset link has been dispatched to your email.');
        return;
      }

      if (mode === 'login') {
        if (!password) {
          setFormError('Password is required');
          return;
        }
        await login({ email, password });
        onClose();
      } else {
        if (!password || !name) {
          setFormError('Name and Password are required to sign up');
          return;
        }
        await register({ email, password, name, role });
        onClose();
      }
    } catch (err: any) {
      // Error is stored in useAuthStore, handled by the UI
    }
  };

  const handleGoogleLogin = async () => {
    setFormError(null);
    try {
      // Simulate Google OAuth response
      await login({
        token: 'google-oauth-mock-token-9382109',
        email: email || 'student_google@cloudforge.com',
        name: name || 'Google Practitioner',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
      });
      onClose();
    } catch (err) {
      setFormError('Google Sign-In failed.');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'login'
          ? 'Log In to CloudForge'
          : mode === 'register'
            ? 'Create CloudForge Account'
            : 'Reset Password'
      }
    >
      <div className="flex flex-col items-center justify-center text-center space-y-4 mb-6">
        <div className="rounded-xl bg-blue-600 p-3 text-white shadow-lg shadow-blue-500/30">
          <GraduationCap className="h-8 w-8" />
        </div>
        <p className="text-sm text-muted-foreground">
          {mode === 'login'
            ? 'Unlock enterprise-grade Cloud & DevOps tutorials'
            : mode === 'register'
              ? 'Join a community of 50,000+ learning specialists'
              : 'Provide your email to generate a restoration link'}
        </p>
      </div>

      {(error || formError) && (
        <div className="mb-4 flex items-start space-x-2 rounded-lg bg-destructive/10 p-3.5 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="font-medium leading-tight">{formError || error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="mb-4 rounded-lg bg-emerald-500/10 p-3.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
          {infoMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Sarah Connor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                I want to join as:
              </label>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                options={[
                  { value: 'STUDENT', label: 'Student (Browse & Study)' },
                  { value: 'INSTRUCTOR', label: 'Instructor (Write & Teach)' },
                ]}
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {mode !== 'forgot' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        )}

        <Button type="submit" variant="gradient" className="w-full" isLoading={isLoading}>
          {mode === 'login' ? 'Log In' : mode === 'register' ? 'Create Account' : 'Send Link'}
        </Button>
      </form>

      {/* Social Login Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or connect with</span>
        </div>
      </div>

      {/* Social Google Trigger */}
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center space-x-2"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <Chrome className="h-4 w-4 text-blue-500" />
        <span>Continue with Google</span>
      </Button>

      {/* Toggle mode trigger */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        {mode === 'login' ? (
          <>
            Don't have an account?{' '}
            <button type="button" onClick={() => setMode('register')} className="text-primary hover:underline font-semibold">
              Create one now
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button type="button" onClick={() => setMode('login')} className="text-primary hover:underline font-semibold">
              Log in instead
            </button>
          </>
        )}
      </div>
    </Dialog>
  );
};
