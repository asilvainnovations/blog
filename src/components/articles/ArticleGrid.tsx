import { useState, useEffect, useRef, useCallback } from 'react';
import { ArticleCard } from './ArticleCard';
import { ArticleCardSkeleton } from './ArticleCardSkeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Search, Filter, CalendarIcon, X, SlidersHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ArticleWithRelations, Category, SearchFilters, SortOption } from '@/types';

interface ArticleGridProps {
  articles: ArticleWithRelations[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  categories?: Category[];
  showFilters?: boolean;
  onFilterChange?: (filters: SearchFilters) => void;
  onSortChange?: (sort: SortOption) => void;
  featuredArticle?: ArticleWithRelations;
  onAuthClick?: () => void;
  className?: string;
}

export function ArticleGrid({
  articles,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  categories = [],
  showFilters = true,
  onFilterChange,
  onSortChange,
  featuredArticle,
  onAuthClick,
  className,
}: ArticleGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Infinite scroll observer
  const lastArticleRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && onLoadMore) {
        onLoadMore();
      }
    });

    if (node) observerRef.current.observe(node);
  }, [isLoading, hasMore, onLoadMore]);

  // Apply filters
  useEffect(() => {
    const filters: SearchFilters = {
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
    };
    onFilterChange?.(filters);
  }, [selectedCategories, dateFrom, dateTo, onFilterChange]);

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    onSortChange?.(value);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setDateFrom(undefined);
    setDateTo(undefined);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategories.length > 0 || dateFrom || dateTo;

  // Filter articles by search query
  const filteredArticles = searchQuery
    ? articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  return (
    <div className={className}>
      {/* Filters & Search */}
      {showFilters && (
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Categories
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedCategories.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <p className="font-medium text-sm">Filter by Category</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                          selectedCategories.includes(category.id)
                            ? 'text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        )}
                        style={
                          selectedCategories.includes(category.id)
                            ? { backgroundColor: category.color }
                            : undefined
                        }
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date Range
                  {(dateFrom || dateTo) && (
                    <Badge variant="secondary" className="ml-1">1</Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">From</p>
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      className="rounded-md border"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">To</p>
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      className="rounded-md border"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => handleSortChange(v as SortOption)}>
              <SelectTrigger className="w-[160px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="most_viewed">Most Viewed</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500">Active filters:</span>
              {selectedCategories.map((catId) => {
                const cat = categories.find((c) => c.id === catId);
                return cat ? (
                  <Badge
                    key={catId}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-slate-200"
                    onClick={() => toggleCategory(catId)}
                  >
                    {cat.name}
                    <X className="h-3 w-3" />
                  </Badge>
                ) : null;
              })}
              {dateFrom && (
                <Badge variant="secondary" className="gap-1">
                  From: {format(dateFrom, 'MMM d, yyyy')}
                </Badge>
              )}
              {dateTo && (
                <Badge variant="secondary" className="gap-1">
                  To: {format(dateTo, 'MMM d, yyyy')}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Featured Article */}
      {featuredArticle && !searchQuery && selectedCategories.length === 0 && (
        <div className="mb-10">
          <ArticleCard
            article={featuredArticle}
            variant="featured"
            onAuthClick={onAuthClick}
          />
        </div>
      )}

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && articles.length === 0
          ? // Skeleton loading
            Array.from({ length: 6 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))
          : // Actual articles
            filteredArticles.map((article, index) => (
              <div
                key={article.id}
                ref={index === filteredArticles.length - 1 ? lastArticleRef : undefined}
              >
                <ArticleCard
                  article={article}
                  onAuthClick={onAuthClick}
                />
              </div>
            ))}
      </div>

      {/* Empty State */}
      {!isLoading && filteredArticles.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No articles found
          </h3>
          <p className="text-slate-500">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          {hasActiveFilters && (
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="mt-10 text-center">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
            size="lg"
          >
            {isLoading ? 'Loading...' : 'Load More Articles'}
          </Button>
        </div>
      )}

      {/* Loading indicator for infinite scroll */}
      {isLoading && articles.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <ArticleCardSkeleton key={`more-${i}`} />
          ))}
        </div>
      )}
    </div>
  );
}
