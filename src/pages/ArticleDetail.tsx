import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useArticle } from '@/hooks/useArticles';
import { useComments } from '@/hooks/useComments';
import { useArticleBookmark } from '@/hooks/useBookmarks';
import { useAuth } from '@/contexts/AuthContext';
import { BlockRenderer } from '@/components/editor/BlockRenderer';
import { CommentSection } from '@/components/comments/CommentSection';
import { AuthorCard } from '@/components/articles/AuthorCard';
import { SocialShare } from '@/components/common/SocialShare';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Bookmark,
  Clock,
  Calendar,
  Eye,
  ChevronLeft,
  Share2,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import type { ArticleWithRelations } from '@/types';

interface ArticleDetailProps {
  onAuthClick: () => void;
}

export function ArticleDetail({ onAuthClick }: ArticleDetailProps) {
  const { slug } = useParams<{ slug: string }>();
  const { article, isLoading, error } = useArticle(slug);
  const { isAuthenticated } = useAuth();
  const { isBookmarked, toggleBookmark } = useArticleBookmark(article?.id || '');
  const { comments, addComment } = useComments({ articleId: article?.id });
  const [readingProgress, setReadingProgress] = useState(0);
  const [relatedArticles, setRelatedArticles] = useState<ArticleWithRelations[]>([]);
  const [tableOfContents, setTableOfContents] = useState<{ id: string; text: string; level: number }[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const contentTop = contentRef.current.offsetTop;
      const contentHeight = contentRef.current.offsetHeight;
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;

      const progress = Math.min(
        100,
        Math.max(
          0,
          ((scrollTop - contentTop + windowHeight) / (contentHeight + windowHeight)) * 100
        )
      );

      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate table of contents from content blocks
  useEffect(() => {
    if (article?.content) {
      const headings = article.content
        .filter((block) => block.type === 'heading')
        .map((block, index) => ({
          id: `heading-${index}`,
          text: typeof block.content === 'string' ? block.content : '',
          level: (block.metadata?.level as number) || 2,
        }));
      setTableOfContents(headings as { id: string; text: string; level: number }[]);
    }
  }, [article]);

  // Fetch related articles
  useEffect(() => {
    if (article?.id) {
      const fetchRelated = async () => {
        const { data } = await supabase.rpc('get_related_articles', {
          article_uuid: article.id,
          limit_count: 3,
        });

        if (data) {
          setRelatedArticles(data as ArticleWithRelations[]);
        }
      };

      fetchRelated();
    }
  }, [article?.id]);

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      onAuthClick();
      return;
    }
    await toggleBookmark();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-3/4 mb-8" />
          <Skeleton className="aspect-video w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Article Not Found</h1>
          <p className="text-slate-600 mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/articles">
            <Button>Browse All Articles</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={readingProgress} className="h-1 rounded-none" />
      </div>

      {/* Article Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Articles
          </Link>

          {/* Category */}
          {article.category && (
            <Link to={`/category/${article.category.slug}`}>
              <Badge
                className="mb-4"
                style={{
                  backgroundColor: `${article.category.color}20`,
                  color: article.category.color,
                }}
              >
                {article.category.name}
              </Badge>
            </Link>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            {article.author && (
              <div className="flex items-center gap-2">
                <img
                  src={article.author.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${article.author.name}`}
                  alt={article.author.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium">{article.author.name}</span>
              </div>
            )}
            <span>•</span>
            {article.published_at && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(article.published_at), 'MMM d, yyyy')}</span>
              </div>
            )}
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{article.read_time} min read</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{article.view_count.toLocaleString()} views</span>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {article.featured_image && (
        <div className="w-full">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_300px] gap-12">
          {/* Main Content */}
          <div>
            <article ref={contentRef} className="bg-white rounded-xl shadow-sm p-8 md:p-12">
              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-xl text-slate-600 leading-relaxed mb-8 font-medium">
                  {article.excerpt}
                </p>
              )}

              {/* Content Blocks */}
              <div className="prose prose-lg max-w-none">
                {article.content?.map((block, index) => (
                  <BlockRenderer key={block.id || index} block={block} index={index} />
                ))}
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-200">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link key={tag.id} to={`/tag/${tag.slug}`}>
                        <Badge variant="secondary">#{tag.name}</Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 pt-8 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBookmark}
                    className={isBookmarked ? 'text-blue-600' : ''}
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Button>
                  <SocialShare
                    url={`${window.location.origin}/article/${article.slug}`}
                    title={article.title}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MessageSquare className="h-4 w-4" />
                  <span>{comments.length} comments</span>
                </div>
              </div>
            </article>

            {/* Author Card */}
            {article.author && (
              <div className="mt-8">
                <AuthorCard author={article.author} />
              </div>
            )}

            {/* Comments */}
            <div className="mt-8">
              <CommentSection
                articleId={article.id}
                onAuthClick={onAuthClick}
              />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Table of Contents */}
            {tableOfContents.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h3 className="font-bold text-slate-900 mb-4">Table of Contents</h3>
                <nav className="space-y-2">
                  {tableOfContents.map((heading, index) => (
                    <a
                      key={index}
                      href={`#${heading.id}`}
                      className={`block text-sm hover:text-blue-600 transition-colors ${
                        heading.level === 1 ? 'font-medium' : 'text-slate-600 pl-4'
                      }`}
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      to={`/article/${related.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        <img
                          src={related.featured_image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200'}
                          alt={related.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {related.title}
                          </h4>
                          <span className="text-xs text-slate-500">{(related as { category_name?: string }).category_name || ''}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
