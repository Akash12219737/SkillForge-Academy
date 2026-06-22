import { create } from 'zustand';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  avatarUrl?: string;
  streakCount: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (credentials: { email: string; password?: string; token?: string; name?: string; avatarUrl?: string }) => Promise<void>;
  register: (data: { email: string; password?: string; name?: string; role?: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  loadFromStorage: () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        set({ token, user, isAuthenticated: true });
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      let response;
      if (credentials.token) {
        // Google / Social login simulation
        response = await api.post('/auth/google', credentials);
      } else {
        // Email login
        response = await api.post('/auth/login', {
          email: credentials.email,
          password: credentials.password,
        });
      }

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ token, user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Login failed. Please verify credentials.',
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ token, user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Registration failed. Try again.',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
