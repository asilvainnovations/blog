import { useBookmarks } from '@/hooks/useBookmarks';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { ArticleCardSkeleton } from '@/components/articles/ArticleCardSkeleton';
import { Button } from '@/components/ui/button';
import { BookmarkX, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BookmarksProps {
  onAuthClick: () => void;
}

export function Bookmarks({ onAuthClick }: BookmarksProps) {
  const { bookmarkedArticles, isLoading, removeBookmark } = useBookmarks();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Your Bookmarks</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Your Bookmarks</h1>
          <p className="text-lg text-slate-600">
            Articles you've saved for later reading.
          </p>
          <p className="text-sm text-slate-500 mt-4">
            {bookmarkedArticles.length} {bookmarkedArticles.length === 1 ? 'article' : 'articles'} saved
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {bookmarkedArticles.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <BookmarkX className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No bookmarks yet
            </h3>
            <p className="text-slate-500 mb-6">
              Start exploring articles and save your favorites for later.
            </p>
            <Link to="/articles">
              <Button className="gap-2">
                Browse Articles
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onAuthClick={onAuthClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
