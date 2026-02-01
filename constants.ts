/**
 * Application Constants
 * Centralized configuration and constant values
 */

// ============================================================================
// Blog Configuration
// ============================================================================

export const BLOG_CONFIG = {
  SITE_TITLE: 'ASilva Innovations Blog',
  SITE_TAGLINE: 'Insights on Systems Innovation & Strategic Thinking',
  SITE_URL: 'https://asilva-innovations.com',
  SITE_DESCRIPTION: 'Explore cutting-edge insights on systems innovation, risk management, strategic thinking, and AI analytics.',
  AUTHOR: 'ASilva Innovations',
  LOGO_URL: 'https://asilvainnovations.com/assets/apps/user_1097/app_13212/draft/icon/app_logo.png?1769853277',
} as const;

// ============================================================================
// Categories
// ============================================================================

export const CATEGORIES = [
  'Systems Innovation',
  'Risk Management', 
  'Strategic Thinking',
  'AI & Analytics',
  'Well-Being'
] as const;

export type Category = typeof CATEGORIES[number];

// ============================================================================
// Post Status
// ============================================================================

export const POST_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled'
} as const;

// ============================================================================
// View Types
// ============================================================================

export const VIEW_TYPES = {
  DASHBOARD: 'dashboard',
  POSTS: 'posts',
  NEW_POST: 'new-post',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings'
} as const;

// ============================================================================
// Reading Time
// ============================================================================

export const READING_CONFIG = {
  WORDS_PER_MINUTE: 200,
  DEFAULT_READ_TIME: 5
} as const;

// ============================================================================
// SEO Configuration
// ============================================================================

export const SEO_CONFIG = {
  MAX_TITLE_LENGTH: 60,
  MAX_DESCRIPTION_LENGTH: 160,
  MAX_KEYWORDS: 10,
  DEFAULT_KEYWORDS: ['innovation', 'systems thinking', 'strategy', 'risk management', 'AI']
} as const;

// ============================================================================
// Validation Rules
// ============================================================================

export const VALIDATION_RULES = {
  TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 200
  },
  EXCERPT: {
    MIN_LENGTH: 50,
    MAX_LENGTH: 160
  },
  CONTENT: {
    MIN_LENGTH: 100,
    MAX_LENGTH: 50000
  },
  SLUG: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  },
  TAG: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 30,
    MAX_TAGS: 10
  }
} as const;

// ============================================================================
// UI Configuration
// ============================================================================

export const UI_CONFIG = {
  SIDEBAR_WIDTH: 260,
  SIDEBAR_COLLAPSED_WIDTH: 80,
  NAVBAR_HEIGHT: 70,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  AUTO_SAVE_DELAY: 2000
} as const;

// ============================================================================
// Pagination
// ============================================================================

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [6, 12, 24, 48],
  MAX_PAGE_BUTTONS: 5
} as const;

// ============================================================================
// Local Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  POSTS: 'asilva-blog-posts',
  DARK_MODE: 'asilva-blog-dark-mode',
  SIDEBAR_OPEN: 'asilva-sidebar-open',
  USER_PREFERENCES: 'asilva-user-preferences',
  DRAFTS: 'asilva-blog-drafts'
} as const;

// ============================================================================
// Email Providers
// ============================================================================

export const EMAIL_PROVIDERS = [
  'Mailchimp',
  'ConvertKit',
  'Beehiiv',
  'Substack'
] as const;

export type EmailProvider = typeof EMAIL_PROVIDERS[number];

// ============================================================================
// Social Media
// ============================================================================

export const SOCIAL_MEDIA = {
  LINKEDIN: 'https://linkedin.asilva-innovations.com',
  FACEBOOK: 'https://facebook.asilvainnovations.com',
  INSTAGRAM: 'https://instagram.asilvainnovations.com',
  TWITTER: 'https://twitter.asilvainnovations.com'
} as const;

// ============================================================================
// API Endpoints (for future use)
// ============================================================================

export const API_ENDPOINTS = {
  POSTS: '/api/posts',
  POST: '/api/posts/:id',
  CATEGORIES: '/api/categories',
  TAGS: '/api/tags',
  ANALYTICS: '/api/analytics',
  SETTINGS: '/api/settings',
  UPLOAD: '/api/upload',
  NEWSLETTER: '/api/newsletter'
} as const;

// ============================================================================
// File Upload Configuration
// ============================================================================

export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
  MAX_FILES: 10
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_SLUG: 'Slug can only contain lowercase letters, numbers, and hyphens',
  TITLE_TOO_SHORT: `Title must be at least ${VALIDATION_RULES.TITLE.MIN_LENGTH} characters`,
  TITLE_TOO_LONG: `Title must be less than ${VALIDATION_RULES.TITLE.MAX_LENGTH} characters`,
  EXCERPT_TOO_SHORT: `Excerpt must be at least ${VALIDATION_RULES.EXCERPT.MIN_LENGTH} characters`,
  EXCERPT_TOO_LONG: `Excerpt must be less than ${VALIDATION_RULES.EXCERPT.MAX_LENGTH} characters`,
  CONTENT_TOO_SHORT: `Content must be at least ${VALIDATION_RULES.CONTENT.MIN_LENGTH} characters`,
  FILE_TOO_LARGE: `File size must be less than ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
  INVALID_FILE_TYPE: 'Invalid file type',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
} as const;

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  POST_CREATED: 'Post created successfully',
  POST_UPDATED: 'Post updated successfully',
  POST_DELETED: 'Post deleted successfully',
  POST_PUBLISHED: 'Post published successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  NEWSLETTER_SUBSCRIBED: 'Successfully subscribed to newsletter'
} as const;

// ============================================================================
// Date Formats
// ============================================================================

export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM DD, YYYY',
  WITH_TIME: 'MM/DD/YYYY HH:mm',
  ISO: 'YYYY-MM-DD'
} as const;

// ============================================================================
// Theme Colors
// ============================================================================

export const THEME_COLORS = {
  PRIMARY: '#2563eb',
  PRIMARY_DARK: '#1e40af',
  SECONDARY: '#64748b',
  SUCCESS: '#10b981',
  DANGER: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6'
} as const;

// ============================================================================
// Gradients
// ============================================================================

export const GRADIENTS = {
  GRADIENT_1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  GRADIENT_2: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  GRADIENT_3: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  GRADIENT_4: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
} as const;

// ============================================================================
// Export all constants
// ============================================================================

export default {
  BLOG_CONFIG,
  CATEGORIES,
  POST_STATUSES,
  VIEW_TYPES,
  READING_CONFIG,
  SEO_CONFIG,
  VALIDATION_RULES,
  UI_CONFIG,
  PAGINATION_CONFIG,
  STORAGE_KEYS,
  EMAIL_PROVIDERS,
  SOCIAL_MEDIA,
  API_ENDPOINTS,
  UPLOAD_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DATE_FORMATS,
  THEME_COLORS,
  GRADIENTS
};
