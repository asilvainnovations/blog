import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { AnalyticsSummary, AnalyticsEvent } from '@/types';

export function useAnalytics() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get total views
      const { data: viewsData } = await supabase
        .from('analytics_events')
        .select('id')
        .eq('event_type', 'view');

      // Get total articles
      const { data: articlesData } = await supabase
        .from('articles')
        .select('id')
        .eq('status', 'published');

      // Get total subscribers
      const { data: subscribersData } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .is('unsubscribed_at', null);

      // Get views by category
      const { data: categoryViews } = await supabase
        .from('articles')
        .select(`
          view_count,
          category:categories(name)
        `)
        .eq('status', 'published');

      // Get top articles
      const { data: topArticles } = await supabase
        .from('articles')
        .select('id, title, view_count, published_at')
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(10);

      // Process views by category
      const categoryMap = new Map<string, number>();
      categoryViews?.forEach((article: { view_count: number; category: { name: string }[] | { name: string } | null }) => {
        const category = Array.isArray(article.category) ? article.category[0] : article.category;
        const categoryName = category?.name || 'Uncategorized';
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + (article.view_count || 0));
      });

      const viewsByCategory = Array.from(categoryMap.entries()).map(([category, views]) => ({
        category,
        views,
      }));

      // Get traffic sources
      const { data: events } = await supabase
        .from('analytics_events')
        .select('referrer')
        .eq('event_type', 'view');

      const sourceMap = new Map<string, number>();
      events?.forEach((event: { referrer: string | null }) => {
        let source = 'Direct';
        if (event.referrer) {
          if (event.referrer.includes('google')) source = 'Google';
          else if (event.referrer.includes('twitter') || event.referrer.includes('x.com')) source = 'Twitter';
          else if (event.referrer.includes('linkedin')) source = 'LinkedIn';
          else if (event.referrer.includes('facebook')) source = 'Facebook';
          else source = 'Other';
        }
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
      });

      const trafficSources = Array.from(sourceMap.entries()).map(([source, count]) => ({
        source,
        count,
      }));

      setSummary({
        totalViews: viewsData?.length || 0,
        totalArticles: articlesData?.length || 0,
        totalSubscribers: subscribersData?.length || 0,
        averageReadTime: 5.2, // Mock data - would calculate from actual events
        viewsByCategory,
        topArticles: (topArticles || []).map(a => ({
          id: a.id,
          title: a.title,
          views: a.view_count,
          published_at: a.published_at,
        })),
        trafficSources,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const trackEvent = async (event: Partial<AnalyticsEvent>) => {
    try {
      await supabase.from('analytics_events').insert({
        ...event,
        user_agent: navigator.userAgent,
        referrer: document.referrer,
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  return {
    summary,
    isLoading,
    error,
    trackEvent,
    refetch: fetchAnalytics,
  };
}

export function useArticleAnalytics(articleId: string) {
  const [views, setViews] = useState(0);
  const [shares, setShares] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticleAnalytics = async () => {
      try {
        // Get view count
        const { data: viewData } = await supabase
          .from('articles')
          .select('view_count')
          .eq('id', articleId)
          .single();

        if (viewData) {
          setViews(viewData.view_count);
        }

        // Get share count
        const { data: shareData } = await supabase
          .from('analytics_events')
          .select('id')
          .eq('article_id', articleId)
          .eq('event_type', 'share');

        setShares(shareData?.length || 0);
      } catch (error) {
        console.error('Error fetching article analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticleAnalytics();
  }, [articleId]);

  return { views, shares, isLoading };
}
