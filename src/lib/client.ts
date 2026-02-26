import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
const isConfigured = supabaseUrl && supabaseAnonKey;

// Create a mock client for demo mode when Supabase is not configured
const createMockClient = () => {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signUp: async () => ({ data: { user: null }, error: { message: 'Demo mode - authentication disabled' } }),
      signInWithPassword: async () => ({ data: { session: null }, error: { message: 'Demo mode - authentication disabled' } }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ eq: () => ({ eq: () => ({ order: () => ({ limit: () => ({ single: async () => ({ data: null, error: null }), data: null, error: null }), data: null, error: null }), data: null, error: null }), data: null, error: null }), data: null, error: null }),
        order: () => ({ limit: () => ({ data: [], error: null }), data: [], error: null }),
        single: async () => ({ data: null, error: null }),
        data: [],
        error: null,
      }),
      insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }), data: null, error: null }), data: null, error: null }),
      update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }), data: null, error: null }), data: null, error: null }), data: null, error: null }),
      delete: () => ({ eq: () => ({ error: null }), error: null }),
      data: [],
      error: null,
    }),
    rpc: async () => ({ data: null, error: null }),
  } as unknown as ReturnType<typeof createClient<Database>>;
};

export const supabase = isConfigured 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : createMockClient();

export const isSupabaseConfigured = isConfigured;

// Helper function to get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Helper function to get current session
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

// Helper function to check if user is admin
export async function isUserAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const { data: author } = await supabase
    .from('authors')
    .select('role')
    .eq('user_id', user.id)
    .single();
    
  return author?.role === 'admin';
}

// Helper function to check if user is editor or admin
export async function isUserEditorOrAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const { data: author } = await supabase
    .from('authors')
    .select('role')
    .eq('user_id', user.id)
    .single();
    
  return author?.role === 'admin' || author?.role === 'editor';
}

// Type-safe table helpers
export const tables = {
  articles: () => supabase.from('articles'),
  authors: () => supabase.from('authors'),
  categories: () => supabase.from('categories'),
  tags: () => supabase.from('tags'),
  articleTags: () => supabase.from('article_tags'),
  comments: () => supabase.from('comments'),
  bookmarks: () => supabase.from('bookmarks'),
  newsletterSubscribers: () => supabase.from('newsletter_subscribers'),
  userProfiles: () => supabase.from('user_profiles'),
  articleVersions: () => supabase.from('article_versions'),
  analyticsEvents: () => supabase.from('analytics_events'),
};
