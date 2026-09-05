/**
 * RBAC Utilities for Supabase Edge Functions (Deno)
 * 
 * Shared utilities for authentication and authorization.
 * Import this into your Edge Functions, don't deploy as standalone function.
 * 
 * @example
 * // In your Edge Function (functions/article-management/index.ts):
 * import { authenticateUser, checkRole, Permissions } from '../_shared/rbac.ts';
 * 
 * Deno.serve(async (req) => {
 *   const { user, profile } = await authenticateUser(req);
 *   checkRole(profile.role, ['admin', 'editor']);
 *   // ... rest of handler
 * });
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ========================================
// ENVIRONMENT VALIDATION
// ========================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'
  );
}

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface AuthContext {
  user: any;
  profile: Profile;
  supabase: SupabaseClient;
}

export interface Profile {
  id: string;
  username?: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'editor' | 'author' | 'contributor';
  bio?: string;
  newsletter_subscribed?: boolean;
  newsletter_frequency?: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// AUTHENTICATION HELPERS
// ========================================

/**
 * Authenticate user from Authorization header
 * 
 * @throws Error if authentication fails
 */
export async function authenticateUser(req: Request): Promise<AuthContext> {
  // Extract token from Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError('Missing or invalid authorization header', 401);
  }

  const token = authHeader.split(' ')[1];

  // Create Supabase client (reused throughout request)
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  // Verify JWT and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    throw createError('Invalid or expired token', 401);
  }

  // Fetch user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw createError('User profile not found', 404);
  }

  return { user, profile, supabase };
}

/**
 * Authenticate user but don't throw if missing (for optional auth)
 */
export async function authenticateUserOptional(
  req: Request
): Promise<AuthContext | null> {
  try {
    return await authenticateUser(req);
  } catch {
    return null;
  }
}

// ========================================
// AUTHORIZATION HELPERS
// ========================================

/**
 * Check if user has required role(s)
 * 
 * @throws Error if role check fails
 */
export function checkRole(
  userRole: string,
  allowedRoles: string[],
  customMessage?: string
): void {
  if (!allowedRoles.includes(userRole)) {
    throw createError(
      customMessage || 
        `Forbidden: requires one of [${allowedRoles.join(', ')}], got "${userRole}"`,
      403,
      { requiredRoles: allowedRoles, userRole }
    );
  }
}

/**
 * Check if user has higher or equal role in hierarchy
 */
export function checkRoleHierarchy(
  userRole: string,
  requiredRole: string
): void {
  const hierarchy = {
    admin: 4,
    editor: 3,
    author: 2,
    contributor: 1
  };

  const userLevel = hierarchy[userRole as keyof typeof hierarchy] || 0;
  const requiredLevel = hierarchy[requiredRole as keyof typeof hierarchy] || 0;

  if (userLevel < requiredLevel) {
    throw createError(
      `Insufficient privileges: requires "${requiredRole}" or higher, got "${userRole}"`,
      403
    );
  }
}

// ========================================
// PERMISSION CHECKERS
// ========================================

export class Permissions {
  /**
   * Check if user can edit an article
   */
  static async canEditArticle(
    articleId: string,
    context: AuthContext
  ): Promise<boolean> {
    const { profile, supabase } = context;
    
    // Admins and editors can edit any article
    if (['admin', 'editor'].includes(profile.role)) {
      return true;
    }

    // Authors can only edit their own articles
    if (profile.role === 'author') {
      const { data: article } = await supabase
        .from('articles')
        .select('author_id')
        .eq('id', articleId)
        .single();
      
      return article?.author_id === profile.id;
    }

    return false;
  }

  /**
   * Check if user can delete an article
   */
  static async canDeleteArticle(
    articleId: string,
    context: AuthContext
  ): Promise<boolean> {
    const { profile } = context;
    
    // Only admins can delete articles
    return profile.role === 'admin';
  }

  /**
   * Check if user can publish an article
   */
  static canPublishArticle(context: AuthContext): boolean {
    const { profile } = context;
    return ['admin', 'editor', 'author'].includes(profile.role);
  }

  /**
   * Check if user can moderate comments
   */
  static canModerateComments(context: AuthContext): boolean {
    const { profile } = context;
    return ['admin', 'editor'].includes(profile.role);
  }

  /**
   * Check if user can manage other users
   */
  static canManageUsers(context: AuthContext): boolean {
    const { profile } = context;
    return profile.role === 'admin';
  }

  /**
   * Check if user can change roles
   */
  static async canChangeRole(
    targetRole: string,
    context: AuthContext
  ): Promise<boolean> {
    const { profile } = context;
    
    // Only admins can change roles
    if (profile.role !== 'admin') return false;
    
    return true;
  }

  /**
   * Check if user can access analytics
   */
  static canAccessAnalytics(context: AuthContext): boolean {
    const { profile } = context;
    return ['admin', 'editor', 'author'].includes(profile.role);
  }

  /**
   * Check if user can manage newsletters
   */
  static canManageNewsletters(context: AuthContext): boolean {
    const { profile } = context;
    return ['admin', 'editor'].includes(profile.role);
  }
}

// ========================================
// RESPONSE HELPERS
// ========================================

export interface AppError extends Error {
  status: number;
  details?: any;
}

export function createError(
  message: string,
  status: number,
  details?: any
): AppError {
  const error = new Error(message) as AppError;
  error.status = status;
  error.details = details;
  return error;
}

export function createResponse(
  data: any,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  };

  return new Response(JSON.stringify(data), {
    status,
    headers: { ...defaultHeaders, ...headers },
  });
}

export function createSuccess(data: any, status = 200): Response {
  return createResponse({ success: true, ...data }, status);
}

export function createErrorResp(
  message: string,
  status = 400,
  details?: any
): Response {
  return createResponse(
    { 
      success: false, 
      error: message,
      ...(details && { details })
    },
    status
  );
}

// ========================================
// ROLE HIERARCHY (for reference)
// ========================================

export const ROLE_HIERARCHY = {
  admin: 4,
  editor: 3,
  author: 2,
  contributor: 1,
} as const;

export type Role = keyof typeof ROLE_HIERARCHY;

export function hasHigherRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// ========================================
// CORS HANDLER (for OPTIONS preflight)
// ========================================

export function handleCORS(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return createResponse(null, 204);
  }
  return null;
}
