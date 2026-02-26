import { useState } from 'react';
import { ArticleGrid } from '@/components/articles/ArticleGrid';
import { useArticles } from '@/hooks/useArticles';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Category, SearchFilters, SortOption } from '@/types';

interface ArticlesProps {
  onAuthClick: () => void;
}

export function Articles({ onAuthClick }: ArticlesProps) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [categories, setCategories] = useState<Category[]>([]);

  const { articles, isLoading, hasMore, totalCount } = useArticles({
    status: 'published',
    page,
    pageSize: 12,
    filters,
    sortBy,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      if (data) {
        setCategories(data as Category[]);
      }
    };
    fetchCategories();
  }, []);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">All Articles</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Explore our comprehensive collection of insights on systems innovation, risk management, resilience, AI, and leadership.
          </p>
          <p className="text-sm text-slate-500 mt-4">
            {totalCount > 0 && `Showing ${articles.length} of ${totalCount} articles`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ArticleGrid
          articles={articles}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          categories={categories}
          showFilters={true}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onAuthClick={onAuthClick}
        />
      </div>
    </div>
  );
}
