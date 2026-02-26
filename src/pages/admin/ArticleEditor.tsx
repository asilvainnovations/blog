import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { BlockEditor } from '@/components/admin/editor/BlockEditor';
import { SEOManager } from '@/components/admin/seo/SEOManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { mockCategories, mockArticles, mockAuthor } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  Save,
  Eye,
  Send,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Settings,
  Search,
  Image as ImageIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import type { ContentBlock, ArticleWithRelations, Category } from '@/types';

export function ArticleEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [featuredImage, setFeaturedImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [scheduledAt, setScheduledAt] = useState<Date>();
  const [featured, setFeatured] = useState(false);
  const [readTime, setReadTime] = useState(5);

  // SEO state
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoOgImage, setSeoOgImage] = useState('');
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [categories, setCategories] = useState<Category[]>([]);

  // Generate slug from title
  useEffect(() => {
    if (!isEditing && title && !slug) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 100)
      );
    }
  }, [title, slug, isEditing]);

  // Load article data if editing
  useEffect(() => {
    const loadArticle = async () => {
      if (!id) {
        // Load categories
        if (!isSupabaseConfigured) {
          setCategories(mockCategories);
        } else {
          const { data } = await supabase.from('categories').select('*');
          if (data) setCategories(data as Category[]);
        }
        return;
      }

      setIsLoading(true);

      if (!isSupabaseConfigured) {
        // Use mock data
        const article = mockArticles.find((a) => a.id === id);
        if (article) {
          setTitle(article.title);
          setSlug(article.slug);
          setExcerpt(article.excerpt || '');
          setContent(article.content || []);
          setFeaturedImage(article.featured_image || '');
          setCategoryId(article.category_id || '');
          setStatus(article.status as any);
          setFeatured(article.featured);
          setReadTime(article.read_time);
          setSeoTitle(article.meta_title || '');
          setSeoDescription(article.meta_description || '');
        }
        setCategories(mockCategories);
        setIsLoading(false);
        return;
      }

      // Load from Supabase
      const { data: article, error } = await supabase
        .from('articles')
        .select(`*, category:categories(*)`)
        .eq('id', id)
        .single();

      if (error) {
        toast.error('Failed to load article');
        navigate('/admin/articles');
        return;
      }

      if (article) {
        setTitle(article.title);
        setSlug(article.slug);
        setExcerpt(article.excerpt || '');
        setContent(article.content || []);
        setFeaturedImage(article.featured_image || '');
        setCategoryId(article.category_id || '');
        setStatus(article.status as any);
        setFeatured(article.featured);
        setReadTime(article.read_time);
        setSeoTitle(article.meta_title || '');
        setSeoDescription(article.meta_description || '');
        if (article.scheduled_at) {
          setScheduledAt(new Date(article.scheduled_at));
        }
      }

      // Load categories
      const { data: cats } = await supabase.from('categories').select('*');
      if (cats) setCategories(cats as Category[]);

      setIsLoading(false);
    };

    loadArticle();
  }, [id, navigate, toast]);

  // Auto-save draft
  useEffect(() => {
    if (status === 'draft' && title) {
      const timer = setTimeout(() => {
        handleSave(true);
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(timer);
    }
  }, [title, excerpt, content, slug]);

  const handleSave = async (isAutoSave = false) => {
    if (!title) {
      if (!isAutoSave) {
        toast.error('Title is required');
      }
      return;
    }

    setIsSaving(true);

    const articleData = {
      title,
      slug: slug || title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
      excerpt: excerpt || null,
      content: content.length > 0 ? content : [],
      featured_image: featuredImage || null,
      category_id: categoryId || null,
      status,
      scheduled_at: scheduledAt?.toISOString() || null,
      read_time: readTime,
      featured,
      meta_title: seoTitle || null,
      meta_description: seoDescription || null,
      canonical_url: seoCanonicalUrl || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (!isSupabaseConfigured) {
        // Mock save
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLastSaved(new Date());
        if (!isAutoSave) {
          toast.success(isEditing ? 'Article updated' : 'Article created');
          if (!isEditing) {
            navigate('/admin/articles');
          }
        }
        setIsSaving(false);
        return;
      }

      if (isEditing) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('articles').insert({
          ...articleData,
          author_id: mockAuthor.id,
          created_at: new Date().toISOString(),
          published_at: status === 'published' ? new Date().toISOString() : null,
          view_count: 0,
        });

        if (error) throw error;
      }

      setLastSaved(new Date());

      if (!isAutoSave) {
        toast.success(isEditing ? 'Article updated' : 'Article created');
        if (!isEditing) {
          navigate('/admin/articles');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save article');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setStatus('published');
    await handleSave();
  };

  const handleSchedule = async () => {
    if (!scheduledAt) {
      toast.error('Please select a schedule date');
      return;
    }
    setStatus('scheduled');
    await handleSave();
  };

  const calculateReadTime = () => {
    const wordCount = content.reduce((acc, block) => {
      if (typeof block.content === 'string') {
        return acc + block.content.split(/\s+/).length;
      }
      return acc;
    }, 0);
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  useEffect(() => {
    setReadTime(calculateReadTime());
  }, [content]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/admin/articles">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Edit Article' : 'New Article'}
              </h1>
              {lastSaved && (
                <p className="text-sm text-slate-500">
                  Last saved: {format(lastSaved, 'MMM d, h:mm a')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant={
                status === 'published'
                  ? 'default'
                  : status === 'scheduled'
                  ? 'secondary'
                  : 'outline'
              }
            >
              {status === 'published' && <CheckCircle className="h-3 w-3 mr-1" />}
              {status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
              {status === 'draft' && <FileText className="h-3 w-3 mr-1" />}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>

            <Button
              variant="outline"
              onClick={() => handleSave()}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4">
                <div className="space-y-3">
                  <p className="font-medium">Schedule Publication</p>
                  <Calendar
                    mode="single"
                    selected={scheduledAt}
                    onSelect={setScheduledAt}
                    disabled={(date) => date < new Date()}
                  />
                  <Button
                    onClick={handleSchedule}
                    className="w-full"
                    disabled={!scheduledAt}
                  >
                    Schedule
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button onClick={handlePublish} disabled={isSaving}>
              <Send className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="content" className="gap-2">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Search className="h-4 w-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Article Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
                className="text-xl font-semibold"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="article-url-slug"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary of the article..."
                rows={3}
              />
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <Label htmlFor="featured-image">Featured Image</Label>
              <div className="flex gap-3">
                <Input
                  id="featured-image"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="Image URL..."
                  className="flex-1"
                />
                <Button variant="outline">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </div>
              {featuredImage && (
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="mt-2 max-h-48 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>

            {/* Block Editor */}
            <div className="space-y-2">
              <Label>Content</Label>
              <div className="bg-white rounded-lg border p-4">
                <BlockEditor blocks={content} onChange={setContent} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo">
            <div className="bg-white rounded-lg border p-6">
              <SEOManager
                title={seoTitle}
                description={seoDescription}
                keywords={seoKeywords}
                ogImage={seoOgImage}
                canonicalUrl={seoCanonicalUrl}
                onChange={(seo) => {
                  setSeoTitle(seo.title);
                  setSeoDescription(seo.description);
                  setSeoKeywords(seo.keywords);
                  setSeoOgImage(seo.ogImage);
                  setSeoCanonicalUrl(seo.canonicalUrl);
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="bg-white rounded-lg border p-6 space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Read Time */}
              <div className="space-y-2">
                <Label htmlFor="read-time">Read Time (minutes)</Label>
                <Input
                  id="read-time"
                  type="number"
                  value={readTime}
                  onChange={(e) => setReadTime(parseInt(e.target.value) || 1)}
                  min={1}
                />
                <p className="text-xs text-slate-500">
                  Auto-calculated from content: {calculateReadTime()} min
                </p>
              </div>

              {/* Featured Article */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured">Featured Article</Label>
                  <p className="text-sm text-slate-500">
                    Show this article in the featured carousel
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>

              <Separator />

              {/* Status */}
              <div className="space-y-2">
                <Label>Publication Status</Label>
                <div className="flex gap-3">
                  <Button
                    variant={status === 'draft' ? 'default' : 'outline'}
                    onClick={() => setStatus('draft')}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Draft
                  </Button>
                  <Button
                    variant={status === 'scheduled' ? 'default' : 'outline'}
                    onClick={() => setStatus('scheduled')}
                    className="flex-1"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Scheduled
                  </Button>
                  <Button
                    variant={status === 'published' ? 'default' : 'outline'}
                    onClick={() => setStatus('published')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Published
                  </Button>
                </div>
              </div>

              {status === 'scheduled' && (
                <div className="space-y-2">
                  <Label>Schedule Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {scheduledAt
                          ? format(scheduledAt, 'PPP')
                          : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={scheduledAt}
                        onSelect={setScheduledAt}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
