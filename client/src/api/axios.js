import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        store.dispatch(logout());
        window.location.href = '/login';
      }
      
      // Handle validation errors
      if (error.response.status === 422) {
        return Promise.reject({
          message: 'Validation error',
          errors: error.response.data.errors,
        });
      }

      // Handle other errors
      return Promise.reject({
        message: error.response.data.message || 'An error occurred',
        status: error.response.status,
      });
    }

    return Promise.reject({
      message: 'Network error occurred',
    });
  }
);

export default api;
