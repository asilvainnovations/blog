/**
 * Article Management Edge Function
 * 
 * Deploy to: /functions/article-management/index.ts
 * 
 * Endpoints:
 * POST   /article-management          - Create article
 * PUT    /article-management          - Update article
 * DELETE /article-management?id=xxx   - Delete article
 * POST   /article-management/publish  - Publish article
 * POST   /article-management/schedule - Schedule article
 * POST   /article-management/autosave - Auto-save draft
 * POST   /article-management/versions - Create version snapshot
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Environment variables (set in Supabase Dashboard)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// CORS configuration (restrict in production)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
};

// Response helper
function response(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

// Error helper
function error(message: string, status = 400) {
  return response({ error: message }, status);
}

// Extract user from JWT
async function getUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];
  
  // Verify JWT with Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid or expired token');
  }

  // Get user profile and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, username, full_name')
    .eq('id', user.id)
    .single();

  if (!profile) {
    throw new Error('User profile not found');
  }

  return { ...user, profile };
}

// Check if user can edit article
async function canEditArticle(articleId: string, userId: string, userRole: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: article } = await supabase
    .from('articles')
    .select('author_id')
    .eq('id', articleId)
    .single();

  if (!article) return false;

  // Admins and editors can edit any article
  if (['admin', 'editor'].includes(userRole)) return true;

  // Authors can only edit their own articles
  return article.author_id === userId;
}

// Check if user can publish
function canPublish(userRole: string) {
  return ['admin', 'editor', 'author'].includes(userRole);
}

// Generate unique slug
async function generateUniqueSlug(title: string) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  // Check if slug exists, add suffix if needed
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const { data } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!data) break;
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Calculate reading time
function calculateReadingTime(content: any[]): number {
  // Count words in all paragraph blocks
  const words = content
    .filter(block => block.type === 'paragraph')
    .reduce((total, block) => total + block.content.split(/\s+/).length, 0);
  
  return Math.ceil(words / 250); // Average reading speed: 250 wpm
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  try {
    // Authenticate user
    const { profile, id: userId } = await getUser(req);

    // Route handling
    if (path.endsWith('/publish')) {
      return await handlePublish(req, userId, profile.role);
    } else if (path.endsWith('/schedule')) {
      return await handleSchedule(req, userId, profile.role);
    } else if (path.endsWith('/autosave')) {
      return await handleAutoSave(req, userId, profile.role);
    } else if (path.endsWith('/versions')) {
      return await handleCreateVersion(req, userId, profile.role);
    } else {
      switch (method) {
        case 'POST':
          return await handleCreate(req, userId, profile.role);
        case 'PUT':
          return await handleUpdate(req, userId, profile.role);
        case 'DELETE':
          return await handleDelete(req, userId, profile.role);
        default:
          return error('Method not allowed', 405);
      }
    }
  } catch (err) {
    console.error('Error:', err);
    return error(err instanceof Error ? err.message : 'Internal server error', 500);
  }
});

// ========================================
// HANDLERS
// ========================================

async function handleCreate(req: Request, userId: string, userRole: string) {
  const body = await req.json();
  
  // Validate required fields
  if (!body.title || !body.content || !body.category) {
    return error('Missing required fields: title, content, category');
  }

  // Validate category
  const validCategories = [
    'Systems Innovations',
    'Integrated Risk Management',
    'Resilience',
    'AI and Analytics',
    'Real-Time Leadership'
  ];
  
  if (!validCategories.includes(body.category)) {
    return error('Invalid category');
  }

  // Contributors can only create drafts
  let status = body.status || 'draft';
  if (userRole === 'contributor' && status === 'published') {
    status = 'draft';
  }

  // Generate unique slug
  const slug = await generateUniqueSlug(body.title);

  // Calculate reading time
  const readingTime = calculateReadingTime(body.content);

  // Prepare article data
  const articleData: any = {
    title: body.title,
    slug,
    content_json: body.content, // ← CORRECT: JSONB field
    excerpt: body.excerpt || body.content[0]?.content?.substring(0, 200) || '',
    category: body.category,
    tags: body.tags || [],
    featured_image: body.featured_image || 'https://appimize.app/assets/apps/user_1097/images/2c7d825bf937_232_1097.png',
    status,
    author_id: userId,
    reading_time: readingTime,
    views: 0,
  };

  // Add published_at if publishing immediately
  if (status === 'published') {
    articleData.published_at = new Date().toISOString();
  }

  // Insert article
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: article, error } = await supabase
    .from('articles')
    .insert(articleData)
    .select()
    .single();

  if (error) {
    console.error('Create error:', error);
    return error('Failed to create article');
  }

  return response({ success: true, article }, 201);
}

async function handleUpdate(req: Request, userId: string, userRole: string) {
  const body = await req.json();
  
  if (!body.id) {
    return error('Missing article ID');
  }

  // Check permissions
  const canEdit = await canEditArticle(body.id, userId, userRole);
  if (!canEdit) {
    return error('You do not have permission to edit this article', 403);
  }

  // Prepare update data
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (body.title !== undefined) updateData.title = body.title;
  if (body.content !== undefined) {
    updateData.content_json = body.content; // ← CORRECT: JSONB field
    updateData.reading_time = calculateReadingTime(body.content);
  }
  if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
  if (body.category !== undefined) updateData.category = body.category;
  if (body.tags !== undefined) updateData.tags = body.tags;
  if (body.featured_image !== undefined) updateData.featured_image = body.featured_image;

  // Handle status changes
  if (body.status !== undefined) {
    if (body.status === 'published' && !canPublish(userRole)) {
      return error('You do not have permission to publish articles', 403);
    }
    
    updateData.status = body.status;
    if (body.status === 'published' && !updateData.published_at) {
      updateData.published_at = new Date().toISOString();
    }
  }

  // Update article
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: article, error } = await supabase
    .from('articles')
    .update(updateData)
    .eq('id', body.id)
    .select()
    .single();

  if (error) {
    console.error('Update error:', error);
    return error('Failed to update article');
  }

  return response({ success: true, article });
}

async function handleDelete(req: Request, userId: string, userRole: string) {
  const url = new URL(req.url);
  const articleId = url.searchParams.get('id');

  if (!articleId) {
    return error('Missing article ID');
  }

  // Only admins can delete
  if (userRole !== 'admin') {
    return error('Only administrators can delete articles', 403);
  }

  // Hard delete (or soft delete by setting status to null)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', articleId);

  if (error) {
    console.error('Delete error:', error);
    return error('Failed to delete article');
  }

  return response({ success: true, message: 'Article deleted successfully' });
}

async function handlePublish(req: Request, userId: string, userRole: string) {
  if (!canPublish(userRole)) {
    return error('You do not have permission to publish articles', 403);
  }

  const body = await req.json();
  if (!body.id) {
    return error('Missing article ID');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: article, error } = await supabase
    .from('articles')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      scheduled_publish_at: null,
    })
    .eq('id', body.id)
    .select()
    .single();

  if (error) {
    console.error('Publish error:', error);
    return error('Failed to publish article');
  }

  return response({ success: true, article });
}

async function handleSchedule(req: Request, userId: string, userRole: string) {
  if (!canPublish(userRole)) {
    return error('You do not have permission to schedule articles', 403);
  }

  const body = await req.json();
  
  if (!body.id || !body.scheduledAt) {
    return error('Missing article ID or scheduled time');
  }

  const scheduledTime = new Date(body.scheduledAt);
  if (scheduledTime <= new Date()) {
    return error('Scheduled time must be in the future');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: article, error } = await supabase
    .from('articles')
    .update({
      status: 'scheduled',
      scheduled_publish_at: body.scheduledAt,
    })
    .eq('id', body.id)
    .select()
    .single();

  if (error) {
    console.error('Schedule error:', error);
    return error('Failed to schedule article');
  }

  return response({ success: true, article });
}

async function handleAutoSave(req: Request, userId: string, userRole: string) {
  const body = await req.json();
  
  if (!body.id || !body.content) {
    return error('Missing article ID or content');
  }

  // Check permissions
  const canEdit = await canEditArticle(body.id, userId, userRole);
  if (!canEdit) {
    return error('You do not have permission to edit this article', 403);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: article, error } = await supabase
    .from('articles')
    .update({
      draft_content: body.content, // ← Auto-save to separate field
      auto_save_timestamp: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', body.id)
    .select()
    .single();

  if (error) {
    console.error('Auto-save error:', error);
    return error('Failed to auto-save draft');
  }

  return response({ success: true, article });
}

async function handleCreateVersion(req: Request, userId: string, userRole: string) {
  const body = await req.json();
  
  if (!body.articleId || !body.content) {
    return error('Missing article ID or content');
  }

  // Check permissions
  const canEdit = await canEditArticle(body.articleId, userId, userRole);
  if (!canEdit) {
    return error('You do not have permission to create versions for this article', 403);
  }

  // Get current article data
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, featured_image, tags')
    .eq('id', body.articleId)
    .single();

  if (!article) {
    return error('Article not found');
  }

  // Create version snapshot
  const { data: version, error } = await supabase
    .from('article_versions')
    .insert({
      article_id: body.articleId,
      author_id: userId,
      title: article.title,
      content: body.content,
      excerpt: article.excerpt,
      featured_image: article.featured_image,
      tags: article.tags,
    })
    .select()
    .single();

  if (error) {
    console.error('Version create error:', error);
    return error('Failed to create version');
  }

  return response({ success: true, version });
}
