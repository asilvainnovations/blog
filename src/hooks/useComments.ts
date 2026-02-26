import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Comment } from '@/types';

interface UseCommentsOptions {
  articleId?: string;
  status?: 'approved' | 'pending' | 'all';
}

export function useComments(options: UseCommentsOptions = {}) {
  const { user, author, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!options.articleId) {
      setComments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('comments')
        .select(`
          *,
          author_profile:authors(*)
        `)
        .eq('article_id', options.articleId)
        .is('parent_id', null);

      // Filter by status
      if (options.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      } else {
        // Default: show approved comments + user's own pending comments
        query = query.or('status.eq.approved');
      }

      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from('comments')
            .select(`
              *,
              author_profile:authors(*)
            `)
            .eq('parent_id', comment.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: true });

          return {
            ...comment,
            replies: replies || [],
          };
        })
      );

      setComments(commentsWithReplies as Comment[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch comments';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [options.articleId, options.status]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string, parentId?: string) => {
    if (!options.articleId) {
      return { error: 'No article specified' };
    }

    try {
      const commentData: Partial<Comment> = {
        article_id: options.articleId,
        content,
        parent_id: parentId || null,
        author_name: author?.name || user?.user_metadata?.name || 'Anonymous',
        author_email: user?.email || '',
        author_id: author?.id || null,
        status: isAuthenticated ? 'approved' : 'pending',
      };

      const { error: addError } = await supabase
        .from('comments')
        .insert(commentData);

      if (addError) throw addError;

      await fetchComments();
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add comment';
      return { error: message };
    }
  };

  const updateCommentStatus = async (commentId: string, status: string) => {
    try {
      const { error: updateError } = await supabase
        .from('comments')
        .update({ status })
        .eq('id', commentId);

      if (updateError) throw updateError;

      await fetchComments();
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update comment';
      return { error: message };
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) throw deleteError;

      await fetchComments();
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete comment';
      return { error: message };
    }
  };

  return {
    comments,
    isLoading,
    error,
    addComment,
    updateCommentStatus,
    deleteComment,
    refetch: fetchComments,
  };
}

export function useAllComments(status: 'pending' | 'approved' | 'all' = 'all') {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('comments')
        .select(`
          *,
          article:articles(title, slug),
          author_profile:authors(*)
        `);

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setComments(data as Comment[] || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch comments';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchAllComments();
  }, [fetchAllComments]);

  return {
    comments,
    isLoading,
    error,
    refetch: fetchAllComments,
  };
}
