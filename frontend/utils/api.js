import axios from 'axios';
import { toast } from 'react-hot-toast';

// We're using Vite's proxy, so we can use relative URLs in development
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Clerk
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from Clerk
      if (window.Clerk && window.Clerk.session) {
        const token = await window.Clerk.session.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.warn('Failed to get Clerk token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Alternative: If the above doesn't work, use this approach
const apiWithAuth = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a function to get the authenticated API instance
export const getAuthenticatedApi = async () => {
  try {
    if (window.Clerk && window.Clerk.session) {
      const token = await window.Clerk.session.getToken();
      if (token) {
        apiWithAuth.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        delete apiWithAuth.defaults.headers.common['Authorization'];
      }
    }
  } catch (error) {
    console.warn('Failed to get Clerk token:', error);
    delete apiWithAuth.defaults.headers.common['Authorization'];
  }
  return apiWithAuth;
};

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only show toast for authentication errors, let components handle other errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      if (window.Clerk) {
        window.Clerk.signOut();
      }
      toast.error('Session expired. Please login again.');
    }

    return Promise.reject(error);
  }
);

export default api;