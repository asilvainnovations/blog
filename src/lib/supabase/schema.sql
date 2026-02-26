-- ASilva Innovations Blog Database Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Authors/Profiles table
CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'author' CHECK (role IN ('admin', 'editor', 'author', 'contributor')),
    social_links JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories/Content Pillars
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#0EA5E9',
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content JSONB NOT NULL DEFAULT '[]',
    featured_image TEXT,
    author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    read_time INTEGER DEFAULT 5,
    view_count INTEGER DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT,
    canonical_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Article Tags junction
CREATE TABLE IF NOT EXISTS article_tags (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- Article Versions (for draft management)
CREATE TABLE IF NOT EXISTS article_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    created_by UUID REFERENCES authors(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    change_summary TEXT
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    confirmed BOOLEAN DEFAULT FALSE,
    confirmation_token VARCHAR(255)
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

-- Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'share', 'bookmark', 'comment', 'scroll', 'time_on_page')),
    metadata JSONB DEFAULT '{}',
    session_id VARCHAR(255),
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles (extended user data)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    newsletter_subscribed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search Preferences
CREATE TABLE IF NOT EXISTS search_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    filters JSONB DEFAULT '{}',
    sort_by VARCHAR(50) DEFAULT 'newest',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_analytics_article ON analytics_events(article_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_article_versions_article ON article_versions(article_id);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING gin(to_tsvector('english', title || ' ' || COALESCE(excerpt, '')));

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_preferences ENABLE ROW LEVEL SECURITY;

-- Authors policies
CREATE POLICY "Authors are viewable by everyone" ON authors FOR SELECT USING (true);
CREATE POLICY "Authors can be created by authenticated users" ON authors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can update own profile" ON authors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all authors" ON authors FOR ALL USING (
    EXISTS (SELECT 1 FROM authors WHERE user_id = auth.uid() AND role = 'admin')
);

-- Articles policies
CREATE POLICY "Published articles are viewable by everyone" ON articles FOR SELECT USING (status = 'published' AND published_at <= NOW());
CREATE POLICY "Authors can view own drafts" ON articles FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM authors WHERE id = author_id)
);
CREATE POLICY "Admins and editors can view all articles" ON articles FOR SELECT USING (
    EXISTS (SELECT 1 FROM authors WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
);
CREATE POLICY "Authors can create articles" ON articles FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM authors WHERE id = author_id)
);
CREATE POLICY "Authors can update own articles" ON articles FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM authors WHERE id = author_id)
);
CREATE POLICY "Admins and editors can update any article" ON articles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM authors WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
);
CREATE POLICY "Admins can delete articles" ON articles FOR DELETE USING (
    EXISTS (SELECT 1 FROM authors WHERE user_id = auth.uid() AND role = 'admin')
);

-- Article versions policies
CREATE POLICY "Article versions viewable by article author or admin" ON article_versions FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM authors WHERE id = created_by) OR
    EXISTS (SELECT 1 FROM authors WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authors can create versions" ON article_versions FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM authors WHERE id = created_by)
);

-- Comments policies
CREATE POLICY "Approved comments are viewable by everyone" ON comments FOR SELECT USING (status = 'approved');
CREATE POLICY "Authenticated users can view own pending comments" ON comments FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM authors WHERE id = author_id)
);
CREATE POLICY "Anyone can create comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins and editors can moderate comments" ON comments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM authors WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "User profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can create own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Newsletter subscribers policies
CREATE POLICY "Admins can view subscribers" ON newsletter_subscribers FOR SELECT USING (
    EXISTS (SELECT 1 FROM authors WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unsubscribe self" ON newsletter_subscribers FOR UPDATE USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Analytics events policies
CREATE POLICY "Admins and editors can view analytics" ON analytics_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM authors WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
);
CREATE POLICY "Anyone can create analytics events" ON analytics_events FOR INSERT WITH CHECK (true);

-- Search preferences policies
CREATE POLICY "Users can view own search preferences" ON search_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own search preferences" ON search_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own search preferences" ON search_preferences FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_search_preferences_updated_at BEFORE UPDATE ON search_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment article view count
CREATE OR REPLACE FUNCTION increment_article_view(article_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE articles SET view_count = view_count + 1 WHERE id = article_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get related articles
CREATE OR REPLACE FUNCTION get_related_articles(article_uuid UUID, limit_count INTEGER DEFAULT 3)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    slug VARCHAR,
    excerpt TEXT,
    featured_image TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    category_name VARCHAR,
    category_slug VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.slug,
        a.excerpt,
        a.featured_image,
        a.published_at,
        c.name as category_name,
        c.slug as category_slug
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'published' 
        AND a.id != article_uuid
        AND a.category_id = (SELECT category_id FROM articles WHERE id = article_uuid)
    ORDER BY a.published_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert content pillars/categories
INSERT INTO categories (name, slug, description, color, icon) VALUES
    ('Systems Innovations', 'systems-innovations', 'Exploring cutting-edge approaches to system design and optimization', '#0EA5E9', 'Zap'),
    ('Integrated Risk Management', 'integrated-risk-management', 'Comprehensive strategies for identifying and mitigating risks', '#F59E0B', 'Shield'),
    ('Resilience', 'resilience', 'Building adaptive capacity in organizations and systems', '#10B981', 'Heart'),
    ('AI and Analytics', 'ai-and-analytics', 'Leveraging artificial intelligence and data analytics for insights', '#8B5CF6', 'Brain'),
    ('Real-Time Leadership', 'real-time-leadership', 'Modern leadership strategies for dynamic environments', '#EC4899', 'Users')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample tags
INSERT INTO tags (name, slug) VALUES
    ('Innovation', 'innovation'),
    ('Strategy', 'strategy'),
    ('Technology', 'technology'),
    ('Leadership', 'leadership'),
    ('Data', 'data'),
    ('Transformation', 'transformation'),
    ('Digital', 'digital'),
    ('Future', 'future')
ON CONFLICT (slug) DO NOTHING;
