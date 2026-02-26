import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '@/components/common/Hero';
import { ArticleGrid } from '@/components/articles/ArticleGrid';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { Button } from '@/components/ui/button';
import { useFeaturedArticles, useArticles } from '@/hooks/useArticles';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { mockCategories, mockArticles } from '@/data/mockData';
import { ArrowRight, Sparkles, TrendingUp, Clock } from 'lucide-react';
import type { Category, ArticleWithRelations } from '@/types';

interface HomeProps {
  onAuthClick: () => void;
}

export function Home({ onAuthClick }: HomeProps) {
  const { articles: featuredArticles, isLoading: isFeaturedLoading } = useFeaturedArticles(5);
  const { articles: recentArticles, isLoading: isRecentLoading } = useArticles({ status: 'published', pageSize: 6 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<ArticleWithRelations[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      
      // Use mock data if Supabase is not configured
      if (!isSupabaseConfigured) {
        setCategories(mockCategories);
        // Sort by view count for trending
        const trending = [...mockArticles].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 4);
        setTrendingArticles(trending);
        setIsLoadingCategories(false);
        return;
      }

      const { data } = await supabase.from('categories').select('*');
      if (data) {
        setCategories(data as Category[]);
      }
      setIsLoadingCategories(false);
    };

    // Fetch trending articles (most viewed)
    const fetchTrending = async () => {
      if (!isSupabaseConfigured) return;
      
      const { data } = await supabase
        .from('articles')
        .select(`
          *,
          author:authors(*),
          category:categories(*),
          tags:article_tags(tag:tags(*))
        `)
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(4);

      if (data) {
        const transformed = data.map(article => ({
          ...article,
          tags: article.tags?.map((t: { tag: unknown }) => t.tag) || [],
        })) as ArticleWithRelations[];
        setTrendingArticles(transformed);
      }
    };

    fetchCategories();
    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero featuredArticles={featuredArticles} isLoading={isFeaturedLoading} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Trending Section */}
        {(trendingArticles.length > 0 || isLoadingCategories) && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Trending Now</h2>
              </div>
              <Link to="/articles?sort=most_viewed">
                <Button variant="ghost" className="gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  variant="compact"
                  onAuthClick={onAuthClick}
                />
              ))}
            </div>
          </section>
        )}

        {/* Categories Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-blue-100">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Explore Topics</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group relative p-6 rounded-xl border border-slate-200 hover:border-transparent transition-all duration-300 overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                  style={{ backgroundColor: category.color }}
                />
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <span style={{ color: category.color }}>
                      <Sparkles className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest Articles */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Latest Articles</h2>
            </div>
            <Link to="/articles">
              <Button variant="ghost" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <ArticleGrid
            articles={recentArticles}
            isLoading={isRecentLoading}
            categories={categories}
            showFilters={false}
            onAuthClick={onAuthClick}
          />
        </section>

        {/* Newsletter CTA */}
        <section className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-500" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Organization?
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Join thousands of leaders who receive our weekly insights on systems innovation, risk management, and building resilient organizations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/newsletter">
                <Button size="lg" variant="secondary" className="gap-2">
                  Subscribe to Newsletter
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
