import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Article, ArticleVersion, ContentBlock } from '@/types';

interface DraftData {
  title: string;
  content: ContentBlock[];
  excerpt?: string;
  featured_image?: string;
  category_id?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
}

export function useDrafts(articleId?: string) {
  const { author } = useAuth();
  const [draft, setDraft] = useState<Partial<Article> | null>(null);
  const [versions, setVersions] = useState<ArticleVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch draft and versions
  const fetchDraft = useCallback(async () => {
    if (!articleId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch article
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (articleError) throw articleError;

      setDraft(article as Article);

      // Fetch versions
      const { data: versionsData, error: versionsError } = await supabase
        .from('article_versions')
        .select('*')
        .eq('article_id', articleId)
        .order('version_number', { ascending: false });

      if (versionsError) throw versionsError;

      setVersions(versionsData as ArticleVersion[] || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch draft';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchDraft();
  }, [fetchDraft]);

  // Auto-save functionality
  const saveDraft = async (data: DraftData, createVersion = false, changeSummary?: string) => {
    if (!articleId || !author) return { error: 'Missing article ID or author' };

    setIsSaving(true);
    setError(null);

    try {
      // Update article
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', articleId);

      if (updateError) throw updateError;

      // Create version if requested
      if (createVersion) {
        const nextVersion = versions.length > 0 
          ? Math.max(...versions.map(v => v.version_number)) + 1 
          : 1;

        const { error: versionError } = await supabase
          .from('article_versions')
          .insert({
            article_id: articleId,
            version_number: nextVersion,
            title: data.title,
            content: data.content,
            excerpt: data.excerpt,
            featured_image: data.featured_image,
            created_by: author.id,
            change_summary: changeSummary || `Version ${nextVersion}`,
          });

        if (versionError) throw versionError;

        // Refresh versions
        await fetchDraft();
      }

      setLastSaved(new Date());
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save draft';
      setError(message);
      return { error: message };
    } finally {
      setIsSaving(false);
    }
  };

  // Start auto-save
  const startAutoSave = useCallback((data: DraftData, intervalMs = 30000) => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    autoSaveIntervalRef.current = setInterval(() => {
      saveDraft(data);
    }, intervalMs);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [articleId, author]);

  // Stop auto-save
  const stopAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
  }, []);

  // Restore version
  const restoreVersion = async (versionId: string) => {
    if (!articleId) return { error: 'No article ID' };

    setIsLoading(true);
    setError(null);

    try {
      const { data: version, error: versionError } = await supabase
        .from('article_versions')
        .select('*')
        .eq('id', versionId)
        .single();

      if (versionError) throw versionError;

      // Update article with version content
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          title: version.title,
          content: version.content,
          excerpt: version.excerpt,
          featured_image: version.featured_image,
          updated_at: new Date().toISOString(),
        })
        .eq('id', articleId);

      if (updateError) throw updateError;

      // Create new version for the restore
      await saveDraft({
        title: version.title,
        content: version.content as ContentBlock[],
        excerpt: version.excerpt,
        featured_image: version.featured_image,
      }, true, `Restored from version ${version.version_number}`);

      await fetchDraft();
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restore version';
      setError(message);
      return { error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // Schedule publish
  const schedulePublish = async (scheduledAt: string) => {
    if (!articleId) return { error: 'No article ID' };

    try {
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          status: 'scheduled',
          scheduled_at: scheduledAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', articleId);

      if (updateError) throw updateError;

      await fetchDraft();
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to schedule publish';
      return { error: message };
    }
  };

  // Publish now
  const publishNow = async () => {
    if (!articleId) return { error: 'No article ID' };

    try {
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', articleId);

      if (updateError) throw updateError;

      await fetchDraft();
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to publish';
      return { error: message };
    }
  };

  return {
    draft,
    versions,
    isLoading,
    isSaving,
    error,
    lastSaved,
    saveDraft,
    startAutoSave,
    stopAutoSave,
    restoreVersion,
    schedulePublish,
    publishNow,
    refetch: fetchDraft,
  };
}

export function useAllDrafts() {
  const { author } = useAuth();
  const [drafts, setDrafts] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = useCallback(async () => {
    if (!author) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('articles')
        .select(`
          *,
          author:authors(*),
          category:categories(*)
        `)
        .in('status', ['draft', 'scheduled']);

      // If not admin/editor, only show own drafts
      if (author.role === 'author' || author.role === 'contributor') {
        query = query.eq('author_id', author.id);
      }

      const { data, error: fetchError } = await query.order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      setDrafts(data as Article[] || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch drafts';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [author]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  return {
    drafts,
    isLoading,
    error,
    refetch: fetchDrafts,
  };
}
