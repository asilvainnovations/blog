/**
 * Blog Platform Type Definitions
 * Comprehensive type definitions for ASilva Innovations Blog Platform
 */

// ============================================================================
// Post Types
// ============================================================================

export type PostStatus = 'draft' | 'published' | 'scheduled';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  status: PostStatus;
  category: string;
  tags: string[];
  featuredImage: string;
  views: number;
  readTime: number;
}

export interface NewPost extends Omit<BlogPost, 'id' | 'views' | 'readTime'> {}

export interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  featuredImage: string;
  status: PostStatus;
  publishDate: string;
}

// ============================================================================
// View Types
// ============================================================================

export type ViewType = 'dashboard' | 'posts' | 'new-post' | 'analytics' | 'settings';

// ============================================================================
// Component Props Types
// ============================================================================

export interface BlogEditorProps {
  post: BlogPost | null;
  onSave: (post: BlogPost | NewPost) => void;
  onCancel: () => void;
}

export interface DashboardProps {
  posts: BlogPost[];
  onNewPost: () => void;
  onEditPost: (post: BlogPost) => void;
  onViewChange: (view: ViewType) => void;
}

export interface PostsListProps {
  posts: BlogPost[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewPost: () => void;
  onEditPost: (post: BlogPost) => void;
  onDeletePost: (postId: number) => void;
}

export interface AnalyticsProps {
  posts: BlogPost[];
}

export interface SettingsProps {
  onSave: (settings: SiteSettings) => void;
}

export interface ExitIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (email: string) => void;
}

// ============================================================================
// Settings Types
// ============================================================================

export interface SiteSettings {
  siteTitle: string;
  tagline: string;
  siteUrl: string;
  metaDescription: string;
  generateSitemap: boolean;
  enableSchemaMarkup: boolean;
  emailProvider: EmailProvider;
  apiKey: string;
  enableCaching: boolean;
  imageOptimization: boolean;
  lazyLoadImages: boolean;
}

export type EmailProvider = 'Mailchimp' | 'ConvertKit' | 'Beehiiv' | 'Substack';

// ============================================================================
// Analytics Types
// ============================================================================

export interface PostAnalytics {
  postId: number;
  views: number;
  uniqueVisitors: number;
  averageReadTime: number;
  bounceRate: number;
  shares: number;
}

export interface TrafficData {
  date: string;
  visitors: number;
  pageViews: number;
}

export interface CategoryStats {
  category: string;
  postCount: number;
  totalViews: number;
  averageReadTime: number;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface UIState {
  darkMode: boolean;
  activeView: ViewType;
  sidebarOpen: boolean;
  showExitIntent: boolean;
}

export interface FilterState {
  searchQuery: string;
  statusFilter: PostStatus | 'all';
  categoryFilter: string;
  sortBy: 'date' | 'views' | 'title';
  sortOrder: 'asc' | 'desc';
}

// ============================================================================
// Form Types
// ============================================================================

export interface FormField {
  value: string;
  error?: string;
  touched: boolean;
}

export interface EditorState {
  title: FormField;
  slug: FormField;
  excerpt: FormField;
  content: FormField;
  category: string;
  tags: string[];
  featuredImage: string;
  status: PostStatus;
  publishDate: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  gradient: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  view: ViewType;
  badge?: number;
}

export interface ToolbarButton {
  id: string;
  icon: React.ReactNode;
  title: string;
  action: () => void;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// Event Handler Types
// ============================================================================

export type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
export type ButtonClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;
export type FormSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => void;
export type KeyPressHandler = (e: React.KeyboardEvent<HTMLInputElement>) => void;

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

// ============================================================================
// SEO Types
// ============================================================================

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  canonicalUrl: string;
  author: string;
  publishDate: string;
  modifiedDate?: string;
}

export interface SchemaMarkup {
  '@context': string;
  '@type': string;
  headline: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': string;
    name: string;
  };
}

// ============================================================================
// Newsletter Types
// ============================================================================

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  source: string;
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  sentAt: string;
  recipients: number;
  opens: number;
  clicks: number;
}

// ============================================================================
// User Types (for future multi-user support)
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author';
  avatar?: string;
  createdAt: string;
}

export interface UserSession {
  user: User;
  token: string;
  expiresAt: string;
}

// ============================================================================
// Media Types
// ============================================================================

export interface MediaFile {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

// ============================================================================
// Comment Types (for future comments feature)
// ============================================================================

export interface Comment {
  id: string;
  postId: number;
  author: string;
  email: string;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  createdAt: string;
  parentId?: string;
  replies?: Comment[];
}

// ============================================================================
// Export Helper Types
// ============================================================================

export interface ExportOptions {
  format: 'json' | 'csv' | 'markdown';
  includeMetadata: boolean;
  includeImages: boolean;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// ============================================================================
// Type Guards
// ============================================================================

export function isPublishedPost(post: BlogPost): boolean {
  return post.status === 'published';
}

export function isDraftPost(post: BlogPost): boolean {
  return post.status === 'draft';
}

export function isScheduledPost(post: BlogPost): boolean {
  return post.status === 'scheduled';
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Utility Type Helpers
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type MaybePromise<T> = T | Promise<T>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
