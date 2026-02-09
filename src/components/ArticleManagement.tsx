import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Eye, Calendar, Clock, Search,
  Filter, MoreVertical, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Article, Category, Profile } from '@/types';
import { cn } from '@/lib/utils';

// ✅ CORRECTED: Removed 'deleted' status (hard delete only)
type ArticleStatus = 'draft' | 'published' | 'scheduled';
type SortOption = 'newest' | 'oldest' | 'title' | 'views';

interface ArticleFilters {
  status?: ArticleStatus;
  category?: Category;
  author?: string;
  search?: string;
  sort?: SortOption;
}

// ✅ Helper: Get Edge Function URL from env
const getEdgeFunctionUrl = (path: string = ''): string => {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }
  return `${baseUrl.replace(/\/+$/, '')}/functions/v1/article-management${path ? `/${path}` : ''}`;
};

export default function ArticleManagement() {
  const { user, profile } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ArticleFilters>({
    status: undefined,
    sort: 'newest'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, [filters, profile?.id]); // ✅ Re-fetch when profile changes

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Use Supabase client directly (no Edge Function needed for reads)
      let query = supabase
        .from('articles')
        .select(`
          *,
          author:profiles!articles_author_id_fkey(
            id, 
            full_name, 
            avatar_url, 
            role,
            username
          )
        `)
        .eq('author_id', profile?.id); // ✅ Default to user's own articles

      // Admins/editors see all articles
      if (profile?.role === 'admin' || profile?.role === 'editor') {
        query = supabase
          .from('articles')
          .select(`
            *,
            author:profiles!articles_author_id_fkey(
              id, 
              full_name, 
              avatar_url, 
              role,
              username
            )
          `);
      }

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.author) {
        query = query.eq('author_id', filters.author);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
      }

      // Apply sorting
      switch (filters.sort) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
        case 'views':
          query = query.order('views', { ascending: false });
          break;
        default: // newest
          query = query.order('created_at', { ascending: false });
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setArticles(data?.map(a => ({
        ...a,
        // ✅ Handle missing author gracefully
        author: a.author || { id: a.author_id, full_name: 'Unknown Author', role: 'contributor' } as Profile
      })) || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECTED: Use Edge Function with proper URL and auth
  const handleDelete = async (articleId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${getEdgeFunctionUrl()}?id=${encodeURIComponent(articleId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // ✅ Optimistic update
      setArticles(prev => prev.filter(a => a.id !== articleId));
      setShowDeleteConfirm(false);
      setArticleToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete article');
      alert(`Deletion failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // ✅ CORRECTED: Removed 'deleted' status from badge
  const getStatusBadge = (status: ArticleStatus) => {
    const styles = {
      published: 'bg-green-100 text-green-700',
      draft: 'bg-yellow-100 text-yellow-700',
      scheduled: 'bg-blue-100 text-blue-700'
    };

    const icons = {
      published: <CheckCircle className="w-3 h-3" />,
      draft: <Edit className="w-3 h-3" />,
      scheduled: <Clock className="w-3 h-3" />
    };

    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', styles[status])}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // ✅ CORRECTED: Permission checks aligned with RBAC
  const canEditArticle = (article: Article) => {
    if (!profile || !user) return false;
    if (profile.role === 'admin' || profile.role === 'editor') return true;
    if (profile.role === 'author' && article.author_id === user.id) return true;
    return false;
  };

  const canDeleteArticle = () => {
    return profile?.role === 'admin';
  };

  const canPublishArticle = () => {
    return ['admin', 'editor', 'author'].includes(profile?.role || '');
  };

  // ✅ Helper: Format date with time
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Article Management</h1>
          <p className="text-gray-600 mt-1">Create, edit, and manage your content</p>
        </div>
        <button
          onClick={() => window.location.href = '/editor'}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm min-w-[140px]"
        >
          <Plus className="w-5 h-5" />
          <span>New Article</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="ml-auto text-red-600 hover:text-red-800 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles by title or excerpt..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Search articles"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="sr-only">Status</label>
            <select
              id="status-filter"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as ArticleStatus || undefined })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort-filter" className="sr-only">Sort</label>
            <select
              id="sort-filter"
              value={filters.sort || 'newest'}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value as SortOption })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No articles found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {filters.search || filters.status || filters.category 
                ? "Try adjusting your filters to see more results" 
                : "Create your first article to get started"}
            </p>
            <button
              onClick={() => window.location.href = '/editor'}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Article
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Author</th>
                  <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Category</th>
                  <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Views</th>
                  <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Created</th>
                  <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr 
                    key={article.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {article.featured_image && (
                          <img
                            src={article.featured_image}
                            alt=""
                            className="w-14 h-14 rounded object-cover flex-shrink-0 border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://appimize.app/assets/apps/user_1097/images/2c7d825bf937_232_1097.png';
                            }}
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{article.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{article.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {article.author?.avatar_url ? (
                          <img
                            src={article.author.avatar_url}
                            alt={article.author.full_name || 'Author'}
                            className="w-7 h-7 rounded-full border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://appimize.app/assets/apps/user_1097/images/2c7d825bf937_232_1097.png';
                            }}
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs border border-blue-200">
                            {article.author?.full_name?.charAt(0) || article.author?.username?.charAt(0) || '?'}
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {article.author?.full_name || article.author?.username || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className={cn(
                        'px-2.5 py-0.5 rounded-full text-xs font-medium',
                        article.category === 'AI and Analytics' ? 'bg-coral-100 text-coral-700' :
                        article.category === 'Systems Innovations' ? 'bg-blue-100 text-blue-700' :
                        article.category === 'Integrated Risk Management' ? 'bg-amber-100 text-amber-700' :
                        article.category === 'Resilience' ? 'bg-green-100 text-green-700' :
                        'bg-teal-100 text-teal-700'
                      )}>
                        {article.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(article.status as ArticleStatus)}
                      {article.scheduled_publish_at && article.status === 'scheduled' && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-blue-600">
                          <Calendar className="w-3 h-3" />
                          {formatDate(article.scheduled_publish_at)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                        <Eye className="w-4 h-4 text-gray-400" />
                        {(article.views || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="text-sm text-gray-600">
                        {formatDate(article.created_at)}
                      </div>
                      {article.updated_at !== article.created_at && (
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Updated: {new Date(article.updated_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        {canEditArticle(article) && (
                          <button
                            onClick={() => window.location.href = `/editor?id=${article.id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit article"
                            aria-label={`Edit ${article.title}`}
                          >
                            <Edit className="w-4.5 h-4.5" />
                          </button>
                        )}
                        <button
                          onClick={() => window.open(`/articles/${article.slug}`, '_blank', 'noopener,noreferrer')}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View live article"
                          aria-label={`View ${article.title}`}
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        {canDeleteArticle() && (
                          <button
                            onClick={() => {
                              setArticleToDelete(article.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete article"
                            aria-label={`Delete ${article.title}`}
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Article?</h3>
            <p className="text-gray-600 text-center mb-6">
              This action cannot be undone. The article will be permanently removed from the system.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setArticleToDelete(null);
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => articleToDelete && handleDelete(articleToDelete)}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}