import axios from 'axios';

// Environment configuration
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const DEBUG = import.meta.env.VITE_DEBUG === 'true';
const LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL || 'info';

// Environment detection
const isDevelopment = ENVIRONMENT === 'development';
const isProduction = ENVIRONMENT === 'production';

// Logging utility
const log = (level: string, message: string, data?: any) => {
  if (DEBUG || level === 'error') {
    console.log(`[TCC-${level.toUpperCase()}] ${message}`, data || '');
  }
};

log('info', 'API Configuration:', {
  environment: ENVIRONMENT,
  apiUrl: API_BASE_URL,
  debug: DEBUG,
  logLevel: LOG_LEVEL
});

// Create axios instance with environment-specific configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: isProduction ? 10000 : 30000, // Shorter timeout in production
  headers: {
    'Content-Type': 'application/json',
    'X-Environment': ENVIRONMENT,
    'X-Client-Version': '1.0.0'
  },
});

// Add retry logic for production (using axios-retry would be needed for this)
// For now, we'll handle retries in the interceptors
if (isProduction) {
  // Production-specific configuration
  api.defaults.timeout = 10000;
}

// Request interceptor to add auth token and logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (isDevelopment) {
      log('debug', `API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    log('error', 'Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and logging
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (isDevelopment) {
      log('debug', `API Response: ${response.status} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    // Log error details
    log('error', `API Error: ${status} ${url}`, {
      status,
      message: error.message,
      response: error.response?.data
    });
    
    // Handle specific error cases
    if (status === 401) {
      log('warn', 'Authentication failed, redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (status === 403) {
      log('warn', 'Access forbidden');
      // Could redirect to unauthorized page or show error message
    } else if (status >= 500) {
      log('error', 'Server error occurred');
      // Could show user-friendly error message
    } else if (!error.response) {
      log('error', 'Network error - no response from server');
      // Could show network error message
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) => {
    log('info', 'Auth login attempt', { email: credentials.email });
    return api.post('/api/auth/login', credentials);
  },
  
  logout: () =>
    api.post('/api/auth/logout'),
  
  verify: () =>
    api.get('/api/auth/verify'),

  register: (userData: { email: string; password: string; name: string; userType: 'ADMIN' | 'USER' }) =>
    api.post('/api/auth/register', userData),

  healthcareRegister: (userData: { email: string; password: string; name: string; facilityName: string; facilityType: string }) =>
    api.post('/api/auth/healthcare/register', userData),

  emsRegister: (userData: { email: string; password: string; name: string; agencyName: string; serviceType: string }) =>
    api.post('/api/auth/ems/register', userData),

  healthcareLogin: (credentials: { email: string; password: string }) =>
    api.post('/api/auth/healthcare/login', credentials),

  emsLogin: (credentials: { email: string; password: string }) =>
    api.post('/api/auth/ems/login', credentials),

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
  
  updateAgency: (id: string, data: any) =>
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
  
  // Financial Analytics
  getCostAnalysis: (startDate?: string, endDate?: string) =>
    api.get('/api/tcc/analytics/cost-analysis', { 
      params: { startDate, endDate } 
    }),
  
  getProfitability: (period?: string) =>
    api.get('/api/tcc/analytics/profitability', { 
      params: { period } 
    }),
  
  getTripCostBreakdowns: (tripId?: string, limit?: number) =>
    api.get('/api/tcc/analytics/cost-breakdowns', { 
      params: { tripId, limit } 
    }),
  
  createTripCostBreakdown: (tripId: string, breakdownData: any) =>
    api.post('/api/tcc/analytics/cost-breakdown', { tripId, breakdownData }),
};

// Trips API
export const tripsAPI = {
  create: (data: any) =>
    api.post('/api/trips', data),
  
  createEnhanced: (data: any) =>
    api.post('/api/trips/enhanced', data),
  
  getAll: (params?: any) =>
    api.get('/api/trips', { params }),
  
  getById: (id: string) =>
    api.get(`/api/trips/${id}`),
  
  updateStatus: (id: string, data: any) =>
    api.put(`/api/trips/${id}/status`, data),
  
  getAvailableAgencies: () =>
    api.get('/api/trips/agencies/available'),
  
  getAgenciesForHospital: (hospitalId: string, radius?: number) =>
    api.get(`/api/trips/agencies/${hospitalId}`, { params: { radius } }),
  
  getOptions: {
    diagnosis: () => api.get('/api/trips/options/diagnosis'),
    mobility: () => api.get('/api/trips/options/mobility'),
    transportLevel: () => api.get('/api/trips/options/transport-level'),
    urgency: () => api.get('/api/trips/options/urgency'),
    insurance: () => api.get('/api/trips/options/insurance'),
  },
};

// Dropdown Options API
export const dropdownOptionsAPI = {
  getCategories: () =>
    api.get('/api/dropdown-options'),
  
  getByCategory: (category: string) =>
    api.get(`/api/dropdown-options/${category}`),
  
  create: (data: { category: string; value: string }) =>
    api.post('/api/dropdown-options', data),
  
  update: (id: string, data: { value: string; isActive?: boolean }) =>
    api.put(`/api/dropdown-options/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/api/dropdown-options/${id}`),
};

// EMS Analytics API (Agency-specific)
export const emsAnalyticsAPI = {
  getOverview: () =>
    api.get('/api/ems/analytics/overview'),
  
  getTrips: () =>
    api.get('/api/ems/analytics/trips'),
  
  getUnits: () =>
    api.get('/api/ems/analytics/units'),
  
  getPerformance: () =>
    api.get('/api/ems/analytics/performance'),
};

// Environment utilities
export const envUtils = {
  isDevelopment: () => isDevelopment,
  isProduction: () => isProduction,
  getEnvironment: () => ENVIRONMENT,
  getApiUrl: () => API_BASE_URL,
  isDebugEnabled: () => DEBUG,
  getLogLevel: () => LOG_LEVEL
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    log('info', 'Health check successful', response.data);
    return { status: 'healthy', data: response.data };
  } catch (error) {
    log('error', 'Health check failed', error);
    return { status: 'unhealthy', error };
  }
};

export default api;
