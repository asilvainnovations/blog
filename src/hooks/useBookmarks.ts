import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Bookmark, ArticleWithRelations } from '@/types';

export function useBookmarks() {
  const { user, isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<ArticleWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setBookmarks([]);
      setBookmarkedArticles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('bookmarks')
        .select(`
          *,
          article:articles(
            *,
            author:authors(*),
            category:categories(*),
            tags:article_tags(tag:tags(*))
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformedBookmarks = (data || []).map(bookmark => ({
        ...bookmark,
        article: bookmark.article ? {
          ...bookmark.article,
          tags: bookmark.article.tags?.map((t: { tag: unknown }) => t.tag) || [],
        } : null,
      })) as Bookmark[];

      setBookmarks(transformedBookmarks);
      setBookmarkedArticles(transformedBookmarks.map(b => b.article).filter(Boolean) as ArticleWithRelations[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch bookmarks';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const addBookmark = async (articleId: string) => {
    if (!isAuthenticated || !user) {
      return { error: 'Please sign in to bookmark articles' };
    }

    try {
      const { error: addError } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          article_id: articleId,
        });

      if (addError) throw addError;

      await fetchBookmarks();
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add bookmark';
      return { error: message };
    }
  };

  const removeBookmark = async (articleId: string) => {
    if (!isAuthenticated || !user) {
      return { error: 'Please sign in to manage bookmarks' };
    }

    try {
      const { error: removeError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', articleId);

      if (removeError) throw removeError;

      await fetchBookmarks();
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove bookmark';
      return { error: message };
    }
  };

  const isBookmarked = (articleId: string) => {
    return bookmarks.some(b => b.article_id === articleId);
  };

  const toggleBookmark = async (articleId: string) => {
    if (isBookmarked(articleId)) {
      return removeBookmark(articleId);
    } else {
      return addBookmark(articleId);
    }
  };

  return {
    bookmarks,
    bookmarkedArticles,
    isLoading,
    error,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    refetch: fetchBookmarks,
  };
}

export function useArticleBookmark(articleId: string) {
  const { bookmarks, toggleBookmark, isBookmarked, isLoading } = useBookmarks();
  const [localIsBookmarked, setLocalIsBookmarked] = useState(false);

  useEffect(() => {
    setLocalIsBookmarked(isBookmarked(articleId));
  }, [articleId, isBookmarked, bookmarks]);

  const handleToggle = async () => {
    const result = await toggleBookmark(articleId);
    if (!result.error) {
      setLocalIsBookmarked(!localIsBookmarked);
    }
    return result;
  };

  return {
    isBookmarked: localIsBookmarked,
    toggleBookmark: handleToggle,
    isLoading,
  };
}
