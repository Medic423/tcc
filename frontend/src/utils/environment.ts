// Environment Guards and Utilities
// This file provides environment-specific logic and guards

// Environment detection
export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';
export const isDevelopment = ENVIRONMENT === 'development';
export const isProduction = ENVIRONMENT === 'production';
export const isTest = ENVIRONMENT === 'test';

// Feature flags
export const FEATURE_FLAGS = {
  DEBUG_PANEL: import.meta.env.VITE_ENABLE_DEBUG_PANEL === 'true',
  MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  LOGGING: import.meta.env.VITE_DEBUG === 'true'
};

// Environment guards
export const envGuards = {
  // Only run in development
  developmentOnly: (callback: () => void) => {
    if (isDevelopment) {
      callback();
    }
  },

  // Only run in production
  productionOnly: (callback: () => void) => {
    if (isProduction) {
      callback();
    }
  },

  // Run in development and test
  nonProduction: (callback: () => void) => {
    if (!isProduction) {
      callback();
    }
  },

  // Run based on feature flag
  featureFlag: (flag: keyof typeof FEATURE_FLAGS, callback: () => void) => {
    if (FEATURE_FLAGS[flag]) {
      callback();
    }
  }
};

// Environment-specific configurations
export const envConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5001',
    timeout: isProduction ? 10000 : 30000,
    retries: isProduction ? 3 : 1
  },
  logging: {
    level: import.meta.env.VITE_LOG_LEVEL || 'info',
    enabled: FEATURE_FLAGS.LOGGING
  },
  cors: {
    origin: import.meta.env.VITE_CORS_ORIGIN || 'http://localhost:3000'
  }
};

// Development utilities
export const devUtils = {
  // Log only in development
  log: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[DEV] ${message}`, data || '');
    }
  },

  // Warn only in development
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`[DEV-WARN] ${message}`, data || '');
    }
  },

  // Error logging (always enabled)
  error: (message: string, error?: any) => {
    console.error(`[TCC-ERROR] ${message}`, error || '');
  },

  // Performance timing
  time: (label: string) => {
    if (isDevelopment) {
      console.time(`[DEV-TIMER] ${label}`);
    }
  },

  timeEnd: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(`[DEV-TIMER] ${label}`);
    }
  }
};

// Production utilities
export const prodUtils = {
  // Error reporting (for production)
  reportError: (error: Error, context?: any) => {
    if (isProduction) {
      // Here you would integrate with error reporting service
      // like Sentry, LogRocket, etc.
      console.error('Production error:', error, context);
    }
  },

  // Performance monitoring
  trackPerformance: (metric: string, value: number) => {
    if (isProduction) {
      // Here you would integrate with analytics service
      // like Google Analytics, Mixpanel, etc.
      console.log(`Performance metric: ${metric} = ${value}`);
    }
  }
};

// Environment-specific API endpoints
export const getApiEndpoint = (endpoint: string) => {
  const baseUrl = envConfig.api.baseUrl;
  return `${baseUrl}${endpoint}`;
};

// Environment validation
export const validateEnvironment = () => {
  const requiredVars = ['VITE_API_URL', 'VITE_ENVIRONMENT'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    devUtils.warn(`Missing environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
};

// Export environment info for debugging
export const getEnvironmentInfo = () => ({
  environment: ENVIRONMENT,
  isDevelopment,
  isProduction,
  isTest,
  featureFlags: FEATURE_FLAGS,
  config: envConfig,
  apiUrl: envConfig.api.baseUrl
});
