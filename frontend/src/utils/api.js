import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? 'https://tj-job-hub.onrender.com/api' // Production backend URL
    : '/api', // Use Vite's proxy in development
  timeout: 30000, // Increased timeout to 30 seconds for production
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for CORS with credentials
});

// Request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - FIXED VERSION
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      // Don't auto-signout, just show message
      toast.error('Please sign in to continue');
      // Redirect to login page
      window.location.href = '/login';
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    }
    
    return Promise.reject(error);
  }
);

export { api };
export default api;