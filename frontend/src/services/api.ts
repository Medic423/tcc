import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
console.log('TCC_DEBUG: API_BASE_URL is set to:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) => {
    console.log('TCC_DEBUG: API login called with URL:', API_BASE_URL + '/api/auth/login');
    console.log('TCC_DEBUG: API login called with credentials:', credentials);
    return api.post('/api/auth/login', credentials);
  },
  
  logout: () =>
    api.post('/api/auth/logout'),
  
  verify: () =>
    api.get('/api/auth/verify'),

  register: (userData: { email: string; password: string; name: string; userType: 'ADMIN' | 'USER' }) =>
    api.post('/api/auth/register', userData),

  getUsers: () =>
    api.get('/api/auth/users'),
};

// Hospitals API
export const hospitalsAPI = {
  getAll: (params?: any) =>
    api.get('/api/tcc/hospitals', { params }),
  
  getById: (id: string) =>
    api.get(`/api/tcc/hospitals/${id}`),
  
  create: (data: any) =>
    api.post('/api/tcc/hospitals', data),
  
  update: (id: string, data: any) =>
    api.put(`/api/tcc/hospitals/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/api/tcc/hospitals/${id}`),
  
  search: (query: string) =>
    api.get('/api/tcc/hospitals/search', { params: { q: query } }),
};

// Agencies API
export const agenciesAPI = {
  getAll: (params?: any) =>
    api.get('/api/tcc/agencies', { params }),
  
  getById: (id: string) =>
    api.get(`/api/tcc/agencies/${id}`),
  
  create: (data: any) =>
    api.post('/api/tcc/agencies', data),
  
  update: (id: string, data: any) =>
    api.put(`/api/tcc/agencies/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/api/tcc/agencies/${id}`),
  
  search: (query: string) =>
    api.get('/api/tcc/agencies/search', { params: { q: query } }),
};

// Facilities API
export const facilitiesAPI = {
  getAll: (params?: any) =>
    api.get('/api/tcc/facilities', { params }),
  
  getById: (id: string) =>
    api.get(`/api/tcc/facilities/${id}`),
  
  create: (data: any) =>
    api.post('/api/tcc/facilities', data),
  
  update: (id: string, data: any) =>
    api.put(`/api/tcc/facilities/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/api/tcc/facilities/${id}`),
  
  search: (query: string) =>
    api.get('/api/tcc/facilities/search', { params: { q: query } }),
};

// Analytics API
export const analyticsAPI = {
  getOverview: () =>
    api.get('/api/tcc/analytics/overview'),
  
  getTrips: () =>
    api.get('/api/tcc/analytics/trips'),
  
  getAgencies: () =>
    api.get('/api/tcc/analytics/agencies'),
  
  getHospitals: () =>
    api.get('/api/tcc/analytics/hospitals'),
};

// Trips API
export const tripsAPI = {
  create: (data: any) =>
    api.post('/api/trips', data),
  
  getAll: (params?: any) =>
    api.get('/api/trips', { params }),
  
  getById: (id: string) =>
    api.get(`/api/trips/${id}`),
  
  updateStatus: (id: string, data: any) =>
    api.put(`/api/trips/${id}/status`, data),
  
  getAvailableAgencies: () =>
    api.get('/api/trips/agencies/available'),
};

export default api;
