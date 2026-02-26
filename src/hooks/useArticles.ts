import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { mockArticles, mockCategories } from '@/data/mockData';
import type { Article, ArticleWithRelations, SearchFilters, SortOption } from '@/types';

interface UseArticlesOptions {
  category?: string;
  tag?: string;
  author?: string;
  featured?: boolean;
  status?: 'published' | 'draft' | 'scheduled' | 'all';
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  filters?: SearchFilters;
  sortBy?: SortOption;
}

export function useArticles(options: UseArticlesOptions = {}) {
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use mock data if Supabase is not configured
      if (!isSupabaseConfigured) {
        let filtered = [...mockArticles];
        
        if (options.featured) {
          filtered = filtered.filter(a => a.featured);
        }
        if (options.category) {
          filtered = filtered.filter(a => a.category?.slug === options.category);
        }
        if (options.searchQuery) {
          const query = options.searchQuery.toLowerCase();
          filtered = filtered.filter(a => 
            a.title.toLowerCase().includes(query) || 
            a.excerpt?.toLowerCase().includes(query)
          );
        }
        
        // Apply sorting
        switch (options.sortBy) {
          case 'oldest':
            filtered.sort((a, b) => new Date(a.published_at || '').getTime() - new Date(b.published_at || '').getTime());
            break;
          case 'most_viewed':
            filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
            break;
          case 'newest':
          default:
            filtered.sort((a, b) => new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime());
        }
        
        setArticles(filtered);
        setTotalCount(filtered.length);
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      let query = supabase
        .from('articles')
        .select(`
          *,
          author:authors(*),
          category:categories(*),
          tags:article_tags(tag:tags(*))
        `, { count: 'exact' });

      // Apply filters
      if (options.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      } else if (!options.status || options.status === 'published') {
        query = query.eq('status', 'published');
      }

      if (options.category) {
        query = query.eq('category.slug', options.category);
      }

      if (options.featured) {
        query = query.eq('featured', true);
      }

      if (options.author) {
        query = query.eq('author_id', options.author);
      }

      // Apply search
      if (options.searchQuery) {
        query = query.or(`title.ilike.%${options.searchQuery}%,excerpt.ilike.%${options.searchQuery}%`);
      }

      // Apply advanced filters
      if (options.filters) {
        if (options.filters.categories?.length) {
          query = query.in('category_id', options.filters.categories);
        }
        if (options.filters.dateFrom) {
          query = query.gte('published_at', options.filters.dateFrom);
        }
        if (options.filters.dateTo) {
          query = query.lte('published_at', options.filters.dateTo);
        }
      }

      // Apply sorting
      switch (options.sortBy) {
        case 'oldest':
          query = query.order('published_at', { ascending: true });
          break;
        case 'most_viewed':
          query = query.order('view_count', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('published_at', { ascending: false });
      }

      // Apply pagination
      const page = options.page || 1;
      const pageSize = options.pageSize || 12;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query.range(from, to);

      const { data, count, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform tags data
      const transformedArticles = (data || []).map(article => ({
        ...article,
        tags: article.tags?.map((t: { tag: unknown }) => t.tag) || [],
      })) as ArticleWithRelations[];

      setArticles(transformedArticles);
      setTotalCount(count || 0);
      setHasMore((count || 0) > to + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch articles';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    articles,
    isLoading,
    error,
    totalCount,
    hasMore,
    refetch: fetchArticles,
  };
}

export function useArticle(slug: string | undefined) {
  const [article, setArticle] = useState<ArticleWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    const fetchArticle = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Use mock data if Supabase is not configured
        if (!isSupabaseConfigured) {
          const found = mockArticles.find(a => a.slug === slug);
          setArticle(found || null);
          setIsLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('articles')
          .select(`
            *,
            author:authors(*),
            category:categories(*),
            tags:article_tags(tag:tags(*))
          `)
          .eq('slug', slug)
          .single();

        if (fetchError) throw fetchError;

        // Transform tags data
        const transformedArticle = {
          ...data,
          tags: data.tags?.map((t: { tag: unknown }) => t.tag) || [],
        } as ArticleWithRelations;

        setArticle(transformedArticle);

        // Increment view count
        if (data?.id) {
          await supabase.rpc('increment_article_view', { article_uuid: data.id });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch article';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  return { article, isLoading, error };
}

export function useFeaturedArticles(limit = 5) {
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Use mock data if Supabase is not configured
        if (!isSupabaseConfigured) {
          const featured = mockArticles.filter(a => a.featured).slice(0, limit);
          setArticles(featured);
          setIsLoading(false);
          return;
        }

        const { data } = await supabase
          .from('articles')
          .select(`
            *,
            author:authors(*),
            category:categories(*),
            tags:article_tags(tag:tags(*))
          `)
          .eq('status', 'published')
          .eq('featured', true)
          .order('published_at', { ascending: false })
          .limit(limit);

        const transformedArticles = (data || []).map(article => ({
          ...article,
          tags: article.tags?.map((t: { tag: unknown }) => t.tag) || [],
        })) as ArticleWithRelations[];

        setArticles(transformedArticles);
      } catch (error) {
        console.error('Error fetching featured articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, [limit]);

  return { articles, isLoading };
}

export function useCreateArticle() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createArticle = async (articleData: Partial<Article>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await supabase
        .from('articles')
        .insert(articleData)
        .select()
        .single();

      if (createError) throw createError;

      return { data: data as Article, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create article';
      setError(message);
      return { data: null, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  return { createArticle, isLoading, error };
}

export function useUpdateArticle() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateArticle = async (id: string, articleData: Partial<Article>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('articles')
        .update(articleData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      return { data: data as Article, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update article';
      setError(message);
      return { data: null, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  return { updateArticle, isLoading, error };
}

export function useDeleteArticle() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteArticle = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete article';
      setError(message);
      return { error: message };
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteArticle, isLoading, error };
}
