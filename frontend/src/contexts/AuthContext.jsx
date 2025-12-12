import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

// Export AuthContext as a named export
export const AuthContext = createContext();

// Export useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Use refs to track navigation state
  const hasNavigated = useRef(false);
  const previousUser = useRef(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          previousUser.current = parsedUser;

          // Set authorization header for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle navigation after authentication
  useEffect(() => {
    if (user && !loading) {
      // Only navigate on initial login or when user first becomes authenticated
      const currentPath = location.pathname;
      let targetPath = '/jobs'; // default for job seekers

      if (user.role === 'employer') {
        targetPath = '/dashboard';
      } else if (user.role === 'job_seeker') {
        targetPath = '/dashboard/jobseeker';
      } else if (user.role === 'admin') {
        targetPath = '/admin';
      }

      // Only redirect if user is on auth pages
      const authPages = ['/login', '/register'];
      const isOnAuthPage = authPages.some(page => currentPath.includes(page));

      const shouldNavigate =
        !hasNavigated.current &&
        isOnAuthPage &&
        currentPath !== targetPath;

      if (shouldNavigate) {
        hasNavigated.current = true;
        navigate(targetPath, { replace: true });
      }
    } else if (!user && !loading) {
      hasNavigated.current = false;
    }
  }, [user, loading, navigate, location.pathname]);

  const login = async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });

      if (response.data.success) {
        const { token, user: userData } = response.data;

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Set authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Update state
        setUser(userData);
        previousUser.current = userData;

        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);

      if (response.data.success) {
        const { token, user: newUser } = response.data;

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));

        // Set authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Update state
        setUser(newUser);
        previousUser.current = newUser;

        return { success: true };
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Clear authorization header
      delete api.defaults.headers.common['Authorization'];

      // Update state
      setUser(null);
      previousUser.current = null;
      hasNavigated.current = false;

      toast.success('Logged out successfully');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    previousUser.current = updatedUser;
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await api.get('/auth/me');
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        previousUser.current = userData;
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      previousUser.current = null;
    }
    return false;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    isAuthenticated: !!user,
    isJobSeeker: user?.role === 'job_seeker',
    isEmployer: user?.role === 'employer',
    isAdmin: user?.role === 'admin',
    // Subscription helpers
    isPro: user?.subscription?.plan === 'pro' && (!user?.subscription?.expiresAt || user?.subscription?.expiresAt > new Date()),
    subscription: user?.subscription || null,
    monthlyUsage: user?.subscription?.monthlyUsage || null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;