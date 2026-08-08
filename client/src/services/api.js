import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor for handling token expiration
api.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.status === 401) {
    // If token invalid/expired on admin route, clear local storage
    if (localStorage.getItem('admin_token')) {
      localStorage.removeItem('admin_token');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
  }
  return Promise.reject(error);
});

export default api;
