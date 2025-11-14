import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token by fetching user data
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role = null) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password, role });
      
      const { token, user, isDemo, message } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      
      // Show appropriate success message
      if (isDemo) {
        toast.success(message || `Demo login successful! Welcome ${user.name}`);
      } else {
        toast.success(message || `Welcome back, ${user.name}!`);
      }
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'employer') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
      
      return { success: true, isDemo };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      
      // Show specific error messages
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(validationErrors);
      } else {
        toast.error(message);
      }
      
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      // For demo purposes, if it's a demo account, use login instead
      const demoAccounts = ['seeker@demo.com', 'employer@demo.com'];
      if (demoAccounts.includes(userData.email)) {
        return await login(userData.email, userData.password, userData.role);
      }

      const response = await api.post('/auth/register', userData);
      
      const { token, user, message } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      toast.success(message || `Welcome to TJ Job Portal, ${user.name}!`);
      
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      
      // If it's a validation error, show specific messages
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(validationErrors);
      } else {
        toast.error(message);
      }
      
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data.user);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      toast.error('Failed to update profile');
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    isAuthenticated: !!user,
    isJobSeeker: user?.role === 'job_seeker',
    isEmployer: user?.role === 'employer',
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};