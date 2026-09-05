BEGIN;

-- ========================================
-- 1. ADD MISSING COLUMNS TO EXISTING TABLES
-- ========================================

-- Add status column to subscribers (with migration from existing data)
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;

-- Backfill status for existing records (all assumed active)
UPDATE public.subscribers 
SET status = 'active' 
WHERE status IS NULL;

-- Add newsletter fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS newsletter_subscribed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS newsletter_frequency TEXT DEFAULT 'weekly' CHECK (newsletter_frequency IN ('daily', 'weekly', 'monthly')),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing article fields (critical for frontend)
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS featured_image TEXT DEFAULT 'https://asilvainnovations.com/assets/apps/user_1097/app_13212/draft/icon/app_logo.png?1769949231',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Systems Innovations' NOT NULL,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT,
ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- ========================================
-- 2. CREATE MISSING TABLES (Idempotent)
-- ========================================

-- Comments table (doesn't exist yet)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    author_name TEXT,
    author_email TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Article versions table (ensure it exists)
CREATE TABLE IF NOT EXISTS public.article_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id),
    title TEXT,
    content JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 3. FIX RLS POLICIES (Remove references to non-existent columns)
-- ========================================

-- Drop existing broken policies first
DROP POLICY IF EXISTS "Public can join newsletter" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Admins/Editors can manage subscribers" ON public.subscribers;

-- Create SAFE policies that work with current schema
CREATE POLICY "Public can join newsletter" 
  ON public.subscribers FOR INSERT 
  WITH CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND (status IS NULL OR status = 'active')  -- ✅ Handles missing status gracefully
  );

CREATE POLICY "Admins/Editors can manage subscribers" 
  ON public.subscribers FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Fix profiles policies (critical for user experience)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" 
  ON public.profiles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Fix articles policies
DROP POLICY IF EXISTS "Anyone can read published articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can view own articles" ON public.articles;
DROP POLICY IF EXISTS "Admins/Editors can view all articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can insert articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can update own articles" ON public.articles;
DROP POLICY IF EXISTS "Admins/Editors can update any article" ON public.articles;
DROP POLICY IF EXISTS "Authors can delete own articles" ON public.articles;
DROP POLICY IF EXISTS "Admins/Editors can delete any article" ON public.articles;

CREATE POLICY "Anyone can read published articles" 
  ON public.articles FOR SELECT 
  USING (status = 'published');

CREATE POLICY "Authors can view own articles" 
  ON public.articles FOR SELECT 
  USING (author_id = auth.uid());

CREATE POLICY "Admins/Editors can view all articles" 
  ON public.articles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Authors can insert articles" 
  ON public.articles FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own articles" 
  ON public.articles FOR UPDATE 
  USING (author_id = auth.uid());

CREATE POLICY "Admins/Editors can update any article" 
  ON public.articles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Authors can delete own articles" 
  ON public.articles FOR DELETE 
  USING (author_id = auth.uid());

CREATE POLICY "Admins/Editors can delete any article" 
  ON public.articles FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Article versions policies
DROP POLICY IF EXISTS "Admins/Editors can view all versions" ON public.article_versions;
DROP POLICY IF EXISTS "Authors can view own article versions" ON public.article_versions;
DROP POLICY IF EXISTS "Authors can insert article versions" ON public.article_versions;

CREATE POLICY "Admins/Editors can view all versions" 
  ON public.article_versions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Authors can view own article versions" 
  ON public.article_versions FOR SELECT 
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.articles a 
      WHERE a.id = article_versions.article_id AND a.author_id = auth.uid()
    )
  );

CREATE POLICY "Authors can insert article versions" 
  ON public.article_versions FOR INSERT 
  WITH CHECK (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.articles a 
      WHERE a.id = article_id AND a.author_id = auth.uid()
    )
  );

-- Comments policies
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.comments;
DROP POLICY IF EXISTS "Authors can view own comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Admins/Editors can manage comments" ON public.comments;

CREATE POLICY "Anyone can view approved comments" 
  ON public.comments FOR SELECT 
  USING (status = 'approved');

CREATE POLICY "Authors can view own comments" 
  ON public.comments FOR SELECT 
  USING (author_id = auth.uid());

CREATE POLICY "Anyone can insert comments" 
  ON public.comments FOR INSERT 
  WITH CHECK (
    (author_id = auth.uid() OR (author_name IS NOT NULL AND author_email IS NOT NULL))
    AND status = 'pending'
  );

CREATE POLICY "Admins/Editors can manage comments" 
  ON public.comments FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- ========================================
-- 4. ENABLE RLS ON ALL TABLES (Idempotent)
-- ========================================
DO $$ 
BEGIN
  EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE public.article_versions ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'RLS already enabled on some tables';
END $$;

-- ========================================
-- 5. CREATE PERFORMANCE INDEXES (Idempotent)
-- ========================================
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_author ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(publish_at DESC);

CREATE INDEX IF NOT EXISTS idx_article_versions_article ON public.article_versions(article_id);
CREATE INDEX IF NOT EXISTS idx_article_versions_author ON public.article_versions(author_id);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers(status) WHERE status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_comments_article ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON public.comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id);

COMMIT;
