// Application Constants
export const APP_CONSTANTS = {
  // Application Info
  APP_NAME: 'Enquiry Process Management',
  APP_VERSION: '1.0.0',
  
  // API Endpoints
  API_ENDPOINTS: {
    ENQUIRY_SERVICE: '/api',
    PROCESS_SERVICE: '',
    TASKS: '/tasks',
    ENQUIRIES: '/enquiries'
  },
  
  // Default Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    DEFAULT_PAGE: 0,
    MAX_PAGE_SIZE: 100
  },
  
  // UI Constants
  UI: {
    DEBOUNCE_TIME: 300,
    ANIMATION_DURATION: 200,
    SNACKBAR_DURATION: 3000,
    LOADING_TIMEOUT: 10000
  },
  
  // Status Colors
  STATUS_COLORS: {
    OPEN: { background: '#e3f2fd', color: '#1976d2' },
    IN_PROGRESS: { background: '#fff3e0', color: '#f57c00' },
    PENDING_REVIEW: { background: '#f3e5f5', color: '#7b1fa2' },
    RESOLVED: { background: '#e8f5e8', color: '#388e3c' },
    CLOSED: { background: '#f5f5f5', color: '#666' },
    CANCELLED: { background: '#ffebee', color: '#d32f2f' }
  },
  
  // Priority Colors
  PRIORITY_COLORS: {
    LOW: { background: '#e8f5e8', color: '#388e3c' },
    MEDIUM: { background: '#fff3e0', color: '#f57c00' },
    HIGH: { background: '#ffebee', color: '#d32f2f' },
    CRITICAL: { background: '#fce4ec', color: '#c2185b' }
  },
  
  // Role Colors
  ROLE_COLORS: {
    admin: { background: '#9c27b0', color: 'white' },
    manager: { background: '#3f51b5', color: 'white' },
    user: { background: '#607d8b', color: 'white' },
    analyst: { background: '#009688', color: 'white' },
    'tech-support': { background: '#ff5722', color: 'white' },
    'business-support': { background: '#795548', color: 'white' }
  },
  
  // Validation Rules
  VALIDATION: {
    TITLE_MIN_LENGTH: 3,
    DESCRIPTION_MIN_LENGTH: 10,
    PASSWORD_MIN_LENGTH: 8,
    EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    REDIRECT_URL: 'redirectUrl',
    USER_PREFERENCES: 'userPreferences',
    THEME: 'theme'
  }
} as const;

// Type definitions for better type safety
export type AppConstants = typeof APP_CONSTANTS;
export type StatusColor = keyof typeof APP_CONSTANTS.STATUS_COLORS;
export type PriorityColor = keyof typeof APP_CONSTANTS.PRIORITY_COLORS;
export type RoleColor = keyof typeof APP_CONSTANTS.ROLE_COLORS;