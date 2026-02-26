import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Bookmark, Share2, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useArticleBookmark } from '@/hooks/useBookmarks';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import type { ArticleWithRelations, ArticleCardVariant } from '@/types';

interface ArticleCardProps {
  article: ArticleWithRelations;
  variant?: ArticleCardVariant;
  showExcerpt?: boolean;
  className?: string;
  onAuthClick?: () => void;
}

export function ArticleCard({
  article,
  variant = 'default',
  showExcerpt = true,
  className,
  onAuthClick,
}: ArticleCardProps) {
  const { isAuthenticated } = useAuth();
  const { isBookmarked, toggleBookmark } = useArticleBookmark(article.id);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      onAuthClick?.();
      return;
    }

    await toggleBookmark();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || '',
          url: `${window.location.origin}/article/${article.slug}`,
        });
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/article/${article.slug}`);
    }
  };

  // Featured variant
  if (variant === 'featured') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className={cn(
          'group relative block overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-slate-200 animate-pulse" />
            )}
            <img
              src={article.featured_image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'}
              alt={article.title}
              className={cn(
                'w-full h-full object-cover transition-transform duration-700',
                isHovered && 'scale-105'
              )}
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r" />
            
            {/* Category Badge */}
            {article.category && (
              <div
                className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
              {article.author && (
                <div className="flex items-center gap-2">
                  <img
                    src={article.author.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${article.author.name}`}
                    alt={article.author.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{article.author.name}</span>
                </div>
              )}
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{article.read_time} min</span>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
              {article.title}
            </h2>

            {showExcerpt && article.excerpt && (
              <p className="text-slate-600 mb-6 line-clamp-3">{article.excerpt}</p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Read Article
                <ArrowUpRight className="w-4 h-4" />
              </span>

              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBookmark}
                        className={cn(
                          'h-9 w-9',
                          isBookmarked && 'text-blue-600'
                        )}
                      >
                        <Bookmark className={cn('h-5 w-5', isBookmarked && 'fill-current')} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isBookmarked ? 'Remove bookmark' : 'Bookmark article'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleShare}
                        className="h-9 w-9"
                      >
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share article</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className={cn(
          'group flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors',
          className
        )}
      >
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
          <img
            src={article.featured_image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200'}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          {article.category && (
            <span
              className="text-xs font-medium"
              style={{ color: article.category.color }}
            >
              {article.category.name}
            </span>
          )}
          <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <Clock className="w-3 h-3" />
            <span>{article.read_time} min</span>
          </div>
        </div>
      </Link>
    );
  }

  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className={cn(
          'group flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all',
          className
        )}
      >
        <div className="relative w-full sm:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
          <img
            src={article.featured_image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400'}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {article.category && (
            <div
              className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium text-white"
              style={{ backgroundColor: article.category.color }}
            >
              {article.category.name}
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
            {article.title}
          </h3>
          {showExcerpt && article.excerpt && (
            <p className="text-sm text-slate-600 line-clamp-2 mb-3">{article.excerpt}</p>
          )}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {article.author && <span>{article.author.name}</span>}
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{article.read_time} min</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleBookmark}
              >
                <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current text-blue-600')} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      to={`/article/${article.slug}`}
      className={cn(
        'group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse" />
        )}
        <img
          src={article.featured_image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600'}
          alt={article.title}
          className={cn(
            'w-full h-full object-cover transition-transform duration-700',
            isHovered && 'scale-105'
          )}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Category Badge */}
        {article.category && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: article.category.color }}
          >
            {article.category.name}
          </div>
        )}

        {/* Hover Actions */}
        <div className={cn(
          'absolute bottom-3 right-3 flex items-center gap-2 transition-all duration-300',
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        )}>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={handleBookmark}
          >
            <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current text-blue-600')} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
        
        {showExcerpt && article.excerpt && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-4">{article.excerpt}</p>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            {article.author && (
              <>
                <img
                  src={article.author.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${article.author.name}`}
                  alt={article.author.name}
                  className="w-5 h-5 rounded-full"
                />
                <span className="truncate max-w-[100px]">{article.author.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{article.read_time} min</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
